const express = require('express')
const crypto = require('crypto')
const path = require('path')
const multer = require('multer')
const db = require('../../db')
const { requireAuth } = require('../middleware/requireAuth')
const {
  deleteObject,
  generatedObjectKey,
  putObject,
  sendObject,
  sheetObjectKey,
} = require('../services/objectStorage')

const router = express.Router()
const GENERATED_ROOT = path.join(__dirname, '../../generated-dossiers')
const FINAL_SHEETS_ROOT = path.join(__dirname, '../../uploads/final-sheets')
const MAX_FINAL_SHEET_BYTES = 15 * 1024 * 1024

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FINAL_SHEET_BYTES, files: 1 },
})

router.use(requireAuth)

function createShareToken() {
  return crypto.randomBytes(32).toString('base64url')
}

function normalizeUsername(value) {
  return String(value ?? '').trim()
}

function isValidUsername(value) {
  return /^[\p{L}\p{N}_-]{3,24}$/u.test(value)
}

function detectImage(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 12) return null
  if (buffer.subarray(0, 8).equals(Buffer.from([0x89,0x50,0x4E,0x47,0x0D,0x0A,0x1A,0x0A]))) {
    return { ext: 'png', mime: 'image/png' }
  }
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return { ext: 'jpg', mime: 'image/jpeg' }
  }
  if (buffer.subarray(0, 4).toString('ascii') === 'RIFF' && buffer.subarray(8, 12).toString('ascii') === 'WEBP') {
    return { ext: 'webp', mime: 'image/webp' }
  }
  return null
}

function sheetLocation(assessmentId, filename) {
  const safeName = path.basename(filename)
  return {
    key: sheetObjectKey(assessmentId, safeName),
    localPath: path.join(FINAL_SHEETS_ROOT, String(assessmentId), safeName),
  }
}

async function deleteAssessmentFiles(assessment) {
  const tasks = [
    ['dossier-creatif.pdf', generatedObjectKey(assessment.id, 'dossier-creatif.pdf')],
    ['prompt-fiche-complete.txt', generatedObjectKey(assessment.id, 'prompt-fiche-complete.txt')],
    ['seed-evolutif.pdf', generatedObjectKey(assessment.id, 'seed-evolutif.pdf')],
  ].map(([filename, key]) => deleteObject({
    key,
    localPath: path.join(GENERATED_ROOT, String(assessment.id), filename),
  }).catch(() => {}))
  for (const filename of [assessment.final_sheet_filename, assessment.evolution_sheet_filename]) {
    if (filename) tasks.push(deleteObject(sheetLocation(assessment.id, filename)).catch(() => {}))
  }
  await Promise.all(tasks)
}

async function getOwnedAssessment(assessmentId, userId) {
  const result = await db.query(`
    SELECT a.id, a.visibility, a.final_sheet_filename, a.final_sheet_mime_type,
           a.final_sheet_uploaded_at, a.evolution_slot_unlocked,
           a.evolution_sheet_filename, a.evolution_sheet_mime_type,
           a.evolution_sheet_uploaded_at, a.user_id,
           gj.status AS generation_status
    FROM assessments a
    LEFT JOIN generation_jobs gj ON gj.assessment_id = a.id
    WHERE a.id = $1 AND a.user_id = $2 AND a.deleted_at IS NULL
    LIMIT 1
  `, [assessmentId, userId])
  return result.rows[0] ?? null
}

router.get('/profile', async (req, res) => {
  const result = await db.query(`
    SELECT username
    FROM users
    WHERE id = $1 AND deleted_at IS NULL
    LIMIT 1
  `, [req.user.id])
  res.json({ username: result.rows[0]?.username ?? null })
})

router.patch('/profile/username', async (req, res) => {
  try {
    const username = normalizeUsername(req.body?.username)
    if (!isValidUsername(username)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_USERNAME',
          message: 'Le pseudo doit contenir 3 à 24 caractères : lettres, chiffres, tiret ou underscore.',
        },
      })
    }

    const result = await db.query(`
      UPDATE users
      SET username = $1, username_updated_at = NOW(), updated_at = NOW()
      WHERE id = $2 AND deleted_at IS NULL
      RETURNING username
    `, [username, req.user.id])

    if (!result.rows[0]) return res.sendStatus(404)
    req.user.username = result.rows[0].username
    res.json({ username: result.rows[0].username })
  } catch (error) {
    if (error?.code === '23505') {
      return res.status(409).json({ error: { code: 'USERNAME_TAKEN', message: 'Ce pseudo est déjà utilisé.' } })
    }
    console.error(error)
    res.status(500).json({ error: { code: 'USERNAME_UPDATE_FAILED', message: 'Impossible de modifier le pseudo.' } })
  }
})

router.get('/assessments', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT a.id, a.status, a.visibility, a.public_share_token, a.created_at, a.updated_at,
             a.final_sheet_filename, a.final_sheet_mime_type, a.final_sheet_uploaded_at,
             a.evolution_slot_unlocked, a.evolution_slot_unlocked_at,
             a.evolution_seed_pdf_created_at,
             a.evolution_sheet_filename, a.evolution_sheet_mime_type, a.evolution_sheet_uploaded_at,
             a.community_published_at,
             ac.animal_name, ac.type_1_name, ac.type_2_name,
             gj.status AS generation_status
      FROM assessments a
      LEFT JOIN assessment_results ar ON ar.assessment_id = a.id
      LEFT JOIN assessment_classifications ac ON ac.assessment_result_id = ar.id
      LEFT JOIN generation_jobs gj ON gj.assessment_id = a.id
      WHERE a.user_id = $1 AND a.deleted_at IS NULL
      ORDER BY a.created_at DESC
      LIMIT 200
    `, [req.user.id])

    res.json({ assessments: result.rows.map(row => ({
      ...row,
      has_final_sheet: Boolean(row.final_sheet_filename),
      final_sheet_url: row.final_sheet_filename
        ? `/api/v1/account/assessments/${row.id}/final-sheet`
        : null,
      has_evolution_sheet: Boolean(row.evolution_sheet_filename),
      evolution_sheet_url: row.evolution_sheet_filename
        ? `/api/v1/account/assessments/${row.id}/evolution-sheet`
        : null,
      share_url: row.visibility === 'UNLISTED' && row.public_share_token
        ? `/share/${row.public_share_token}`
        : null,
      deliverables: row.generation_status === 'READY' ? {
        dossier_pdf: `/generated-dossiers/${row.id}/dossier-creatif.pdf`,
        prompt_txt: `/generated-dossiers/${row.id}/prompt-fiche-complete.txt`,
        evolution_seed_pdf: row.evolution_slot_unlocked && row.evolution_seed_pdf_created_at
          ? `/generated-dossiers/${row.id}/seed-evolutif.pdf`
          : null,
      } : null,
    })) })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: { code: 'ACCOUNT_READ_FAILED', message: 'Impossible de charger vos créations.' } })
  }
})

router.post('/assessments/:assessmentId/final-sheet', upload.single('final_sheet'), async (req, res) => {
  try {
    const assessment = await getOwnedAssessment(req.params.assessmentId, req.user.id)
    if (!assessment) {
      return res.status(404).json({ error: { code: 'ASSESSMENT_NOT_FOUND', message: 'Création introuvable.' } })
    }
    if (assessment.generation_status !== 'READY') {
      return res.status(409).json({ error: { code: 'PACKAGE_NOT_READY', message: 'Le package créatif doit être terminé avant l’import de la fiche finale.' } })
    }
    if (!req.file?.buffer) {
      return res.status(400).json({ error: { code: 'FINAL_SHEET_REQUIRED', message: 'Sélectionnez une fiche Pokédex à importer.' } })
    }

    const detected = detectImage(req.file.buffer)
    if (!detected) {
      return res.status(415).json({ error: { code: 'INVALID_FINAL_SHEET_FORMAT', message: 'Formats acceptés : PNG, JPG/JPEG ou WEBP.' } })
    }

    const filename = `final-sheet-${crypto.randomUUID()}.${detected.ext}`
    const location = sheetLocation(assessment.id, filename)
    await putObject({
      ...location,
      body: req.file.buffer,
      contentType: detected.mime,
      contentDisposition: `inline; filename="${filename}"`,
    })

    const client = await db.connect()
    let oldFilename = null
    try {
      await client.query('BEGIN')
      const updated = await client.query(`
        UPDATE assessments
        SET final_sheet_filename = $1,
            final_sheet_mime_type = $2,
            final_sheet_size_bytes = $3,
            final_sheet_uploaded_at = NOW(),
            visibility = 'PRIVATE',
            public_share_token = NULL,
            community_published_at = NULL,
            updated_at = NOW()
        WHERE id = $4 AND user_id = $5 AND deleted_at IS NULL
        RETURNING final_sheet_filename
      `, [filename, detected.mime, req.file.size, assessment.id, req.user.id])
      if (!updated.rows[0]) throw new Error('ASSESSMENT_UPDATE_FAILED')
      oldFilename = assessment.final_sheet_filename
      await client.query('COMMIT')
    } catch (error) {
      await client.query('ROLLBACK').catch(() => {})
      await deleteObject(location).catch(() => {})
      throw error
    } finally {
      client.release()
    }

    if (oldFilename && oldFilename !== filename) {
      await deleteObject(sheetLocation(assessment.id, oldFilename)).catch(() => {})
    }

    res.json({
      status: 'uploaded',
      has_final_sheet: true,
      visibility: 'PRIVATE',
      final_sheet_url: `/api/v1/account/assessments/${assessment.id}/final-sheet`,
    })
  } catch (error) {
    if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: { code: 'FINAL_SHEET_TOO_LARGE', message: 'La fiche ne doit pas dépasser 15 Mo.' } })
    }
    console.error(error)
    res.status(500).json({ error: { code: 'FINAL_SHEET_UPLOAD_FAILED', message: 'Impossible d’importer la fiche.' } })
  }
})

router.get('/assessments/:assessmentId/final-sheet', async (req, res) => {
  const assessment = await getOwnedAssessment(req.params.assessmentId, req.user.id)
  if (!assessment?.final_sheet_filename) return res.sendStatus(404)

  const sent = await sendObject(res, {
    ...sheetLocation(assessment.id, assessment.final_sheet_filename),
    contentType: assessment.final_sheet_mime_type,
  })
  if (!sent) return res.sendStatus(404)
})

router.post('/assessments/:assessmentId/evolution-sheet', upload.single('evolution_sheet'), async (req, res) => {
  try {
    const assessment = await getOwnedAssessment(req.params.assessmentId, req.user.id)
    if (!assessment) {
      return res.status(404).json({ error: { code: 'ASSESSMENT_NOT_FOUND', message: 'Création introuvable.' } })
    }
    if (!assessment.evolution_slot_unlocked) {
      return res.status(403).json({ error: { code: 'EVOLUTION_LOCKED', message: 'L’Évolution n’est pas débloquée pour cette création.' } })
    }
    if (assessment.generation_status !== 'READY') {
      return res.status(409).json({ error: { code: 'PACKAGE_NOT_READY', message: 'Le résultat doit être terminé avant l’import de l’Évolution.' } })
    }
    if (!assessment.final_sheet_filename) {
      return res.status(409).json({ error: { code: 'BASE_SHEET_REQUIRED', message: 'Importez d’abord la fiche Pokédex de base.' } })
    }
    if (!req.file?.buffer) {
      return res.status(400).json({ error: { code: 'EVOLUTION_SHEET_REQUIRED', message: 'Sélectionnez une fiche Évolution à importer.' } })
    }

    const detected = detectImage(req.file.buffer)
    if (!detected) {
      return res.status(415).json({ error: { code: 'INVALID_EVOLUTION_FORMAT', message: 'Formats acceptés : PNG, JPG/JPEG ou WEBP.' } })
    }

    const filename = `evolution-sheet-${crypto.randomUUID()}.${detected.ext}`
    const location = sheetLocation(assessment.id, filename)
    await putObject({
      ...location,
      body: req.file.buffer,
      contentType: detected.mime,
      contentDisposition: `inline; filename="${filename}"`,
    })

    try {
      await db.query(`
        UPDATE assessments
        SET evolution_sheet_filename = $1,
            evolution_sheet_mime_type = $2,
            evolution_sheet_size_bytes = $3,
            evolution_sheet_uploaded_at = NOW(),
            visibility = 'PRIVATE',
            public_share_token = NULL,
            community_published_at = NULL,
            updated_at = NOW()
        WHERE id = $4 AND user_id = $5 AND deleted_at IS NULL
      `, [filename, detected.mime, req.file.size, assessment.id, req.user.id])
    } catch (error) {
      await deleteObject(location).catch(() => {})
      throw error
    }

    if (assessment.evolution_sheet_filename && assessment.evolution_sheet_filename !== filename) {
      await deleteObject(sheetLocation(assessment.id, assessment.evolution_sheet_filename)).catch(() => {})
    }

    res.json({
      status: 'uploaded',
      has_evolution_sheet: true,
      visibility: 'PRIVATE',
      evolution_sheet_url: `/api/v1/account/assessments/${assessment.id}/evolution-sheet`,
    })
  } catch (error) {
    if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: { code: 'EVOLUTION_SHEET_TOO_LARGE', message: 'La fiche Évolution ne doit pas dépasser 15 Mo.' } })
    }
    console.error(error)
    res.status(500).json({ error: { code: 'EVOLUTION_UPLOAD_FAILED', message: 'Impossible d’importer la fiche Évolution.' } })
  }
})

router.get('/assessments/:assessmentId/evolution-sheet', async (req, res) => {
  const assessment = await getOwnedAssessment(req.params.assessmentId, req.user.id)
  if (!assessment?.evolution_sheet_filename) return res.sendStatus(404)

  const sent = await sendObject(res, {
    ...sheetLocation(assessment.id, assessment.evolution_sheet_filename),
    contentType: assessment.evolution_sheet_mime_type,
  })
  if (!sent) return res.sendStatus(404)
})

router.delete('/assessments/:assessmentId/evolution-sheet', async (req, res) => {
  try {
    const assessment = await getOwnedAssessment(req.params.assessmentId, req.user.id)
    if (!assessment) return res.sendStatus(404)

    await db.query(`
      UPDATE assessments
      SET evolution_sheet_filename = NULL,
          evolution_sheet_mime_type = NULL,
          evolution_sheet_size_bytes = NULL,
          evolution_sheet_uploaded_at = NULL,
          visibility = 'PRIVATE',
          public_share_token = NULL,
          community_published_at = NULL,
          updated_at = NOW()
      WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
    `, [assessment.id, req.user.id])

    if (assessment.evolution_sheet_filename) {
      await deleteObject(sheetLocation(assessment.id, assessment.evolution_sheet_filename)).catch(() => {})
    }

    res.json({ status: 'deleted', visibility: 'PRIVATE' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: { code: 'EVOLUTION_DELETE_FAILED', message: 'Impossible de supprimer la fiche Évolution.' } })
  }
})

router.delete('/assessments/:assessmentId/final-sheet', async (req, res) => {
  try {
    const assessment = await getOwnedAssessment(req.params.assessmentId, req.user.id)
    if (!assessment) return res.sendStatus(404)

    await db.query(`
      UPDATE assessments
      SET final_sheet_filename = NULL,
          final_sheet_mime_type = NULL,
          final_sheet_size_bytes = NULL,
          final_sheet_uploaded_at = NULL,
          evolution_sheet_filename = NULL,
          evolution_sheet_mime_type = NULL,
          evolution_sheet_size_bytes = NULL,
          evolution_sheet_uploaded_at = NULL,
          visibility = 'PRIVATE',
          public_share_token = NULL,
          community_published_at = NULL,
          updated_at = NOW()
      WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
    `, [assessment.id, req.user.id])

    if (assessment.final_sheet_filename) {
      await deleteObject(sheetLocation(assessment.id, assessment.final_sheet_filename)).catch(() => {})
    }
    if (assessment.evolution_sheet_filename) {
      await deleteObject(sheetLocation(assessment.id, assessment.evolution_sheet_filename)).catch(() => {})
    }

    res.json({ status: 'deleted', visibility: 'PRIVATE' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: { code: 'FINAL_SHEET_DELETE_FAILED', message: 'Impossible de supprimer la fiche.' } })
  }
})

router.post('/assessments/:assessmentId/publish', async (req, res) => {
  try {
    const result = await db.query(`
      UPDATE assessments a
      SET visibility = 'PUBLIC',
          public_share_token = NULL,
          community_published_at = COALESCE(a.community_published_at, NOW()),
          updated_at = NOW()
      FROM users u
      WHERE a.id = $1
        AND a.user_id = $2
        AND u.id = a.user_id
        AND u.deleted_at IS NULL
        AND u.username IS NOT NULL
        AND a.deleted_at IS NULL
        AND a.final_sheet_filename IS NOT NULL
        AND EXISTS (
          SELECT 1 FROM generation_jobs gj
          WHERE gj.assessment_id = a.id AND gj.status = 'READY'
        )
      RETURNING a.id, a.visibility, a.community_published_at
    `, [req.params.assessmentId, req.user.id])

    if (!result.rows[0]) {
      const userCheck = await db.query('SELECT username FROM users WHERE id = $1 AND deleted_at IS NULL', [req.user.id])
      if (!userCheck.rows[0]?.username) {
        return res.status(409).json({ error: { code: 'USERNAME_REQUIRED', message: 'Choisissez d’abord votre pseudo public.' } })
      }
      const assessment = await getOwnedAssessment(req.params.assessmentId, req.user.id)
      if (!assessment) return res.status(404).json({ error: { code: 'ASSESSMENT_NOT_FOUND', message: 'Création introuvable.' } })
      if (!assessment.final_sheet_filename) {
        return res.status(409).json({ error: { code: 'FINAL_SHEET_REQUIRED', message: 'Importez votre fiche Pokédex finale avant de publier.' } })
      }
      return res.status(409).json({ error: { code: 'NOT_PUBLISHABLE', message: 'Cette création n’est pas encore publiable.' } })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: { code: 'PUBLISH_FAILED', message: 'Impossible de publier dans la communauté.' } })
  }
})

router.post('/assessments/:assessmentId/unpublish', async (req, res) => {
  try {
    const result = await db.query(`
      UPDATE assessments
      SET visibility = 'PRIVATE', public_share_token = NULL, community_published_at = NULL, updated_at = NOW()
      WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
      RETURNING id, visibility
    `, [req.params.assessmentId, req.user.id])
    if (!result.rows[0]) return res.sendStatus(404)
    res.json(result.rows[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: { code: 'UNPUBLISH_FAILED', message: 'Impossible de retirer la création de la communauté.' } })
  }
})

router.patch('/assessments/:assessmentId/visibility', async (req, res) => {
  try {
    const visibility = String(req.body?.visibility ?? '').toUpperCase()
    if (!['PRIVATE', 'UNLISTED'].includes(visibility)) {
      return res.status(400).json({
        error: {
          code: 'PUBLIC_REQUIRES_FINAL_SHEET',
          message: 'La publication publique passe obligatoirement par « Publier dans la communauté » après import de la fiche finale.',
        },
      })
    }

    const token = visibility === 'UNLISTED' ? createShareToken() : null
    const result = await db.query(`
      UPDATE assessments
      SET visibility = $1,
          public_share_token = CASE WHEN $1 = 'UNLISTED' THEN $2 ELSE NULL END,
          community_published_at = NULL,
          updated_at = NOW()
      WHERE id = $3 AND user_id = $4 AND deleted_at IS NULL
      RETURNING id, visibility, public_share_token
    `, [visibility, token, req.params.assessmentId, req.user.id])

    if (!result.rows[0]) {
      return res.status(404).json({ error: { code: 'ASSESSMENT_NOT_FOUND', message: 'Création introuvable.' } })
    }

    const row = result.rows[0]
    res.json({
      ...row,
      share_url: row.visibility === 'UNLISTED' && row.public_share_token
        ? `/share/${row.public_share_token}`
        : null,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: { code: 'VISIBILITY_UPDATE_FAILED', message: 'Impossible de modifier la visibilité.' } })
  }
})

router.post('/assessments/:assessmentId/refresh-share-link', async (req, res) => {
  try {
    const token = createShareToken()
    const result = await db.query(`
      UPDATE assessments
      SET public_share_token = $1, updated_at = NOW()
      WHERE id = $2 AND user_id = $3 AND deleted_at IS NULL AND visibility = 'UNLISTED'
      RETURNING id, public_share_token
    `, [token, req.params.assessmentId, req.user.id])

    if (!result.rows[0]) {
      return res.status(404).json({ error: { code: 'UNLISTED_ASSESSMENT_NOT_FOUND', message: 'Création non listée introuvable.' } })
    }

    res.json({ id: result.rows[0].id, share_url: `/share/${result.rows[0].public_share_token}` })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: { code: 'SHARE_REFRESH_FAILED', message: 'Impossible de renouveler le lien.' } })
  }
})

router.delete('/assessments/:assessmentId', async (req, res) => {
  const client = await db.connect()
  try {
    await client.query('BEGIN')
    const result = await client.query(`
      UPDATE assessments
      SET deleted_at = NOW(), visibility = 'PRIVATE', public_share_token = NULL,
          community_published_at = NULL, updated_at = NOW()
      WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
      RETURNING id, final_sheet_filename, evolution_sheet_filename
    `, [req.params.assessmentId, req.user.id])

    if (!result.rows[0]) {
      await client.query('ROLLBACK')
      return res.status(404).json({ error: { code: 'ASSESSMENT_NOT_FOUND', message: 'Création introuvable.' } })
    }
    await client.query('COMMIT')

    await deleteAssessmentFiles(result.rows[0])

    res.json({ status: 'deleted', id: req.params.assessmentId })
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {})
    console.error(error)
    res.status(500).json({ error: { code: 'ASSESSMENT_DELETE_FAILED', message: 'Impossible de supprimer la création.' } })
  } finally {
    client.release()
  }
})

router.delete('/me', async (req, res) => {
  const client = await db.connect()
  try {
    await client.query('BEGIN')

    const owned = await client.query(`
      SELECT id, final_sheet_filename, evolution_sheet_filename
      FROM assessments
      WHERE user_id = $1 AND deleted_at IS NULL
    `, [req.user.id])

    await client.query(`
      UPDATE assessments
      SET deleted_at = NOW(), visibility = 'PRIVATE', public_share_token = NULL,
          community_published_at = NULL, updated_at = NOW()
      WHERE user_id = $1 AND deleted_at IS NULL
    `, [req.user.id])

    await client.query(`
      UPDATE users
      SET google_sub = 'deleted:' || id::text,
          email = 'deleted+' || id::text || '@invalid.local',
          email_verified = FALSE,
          display_name = 'Compte supprimé',
          avatar_url = NULL,
          username = NULL,
          deleted_at = NOW(),
          updated_at = NOW()
      WHERE id = $1 AND deleted_at IS NULL
    `, [req.user.id])

    await client.query('DELETE FROM user_sessions WHERE sess::text LIKE $1', [`%${req.user.id}%`])
    await client.query('COMMIT')

    await Promise.all(owned.rows.map(deleteAssessmentFiles))

    req.logout(() => { req.session?.destroy(() => {}) })
    res.clearCookie('pokemon.sid')
    res.json({ status: 'account_deleted' })
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {})
    console.error(error)
    res.status(500).json({ error: { code: 'ACCOUNT_DELETE_FAILED', message: 'Impossible de supprimer le compte.' } })
  } finally {
    client.release()
  }
})

module.exports = router
