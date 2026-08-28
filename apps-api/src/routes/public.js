const express = require('express')
const path = require('path')
const db = require('../../db')
const { requireAuth } = require('../middleware/requireAuth')
const { likeLimiter } = require('../middleware/rateLimits')
const { sendObject, sheetObjectKey } = require('../services/objectStorage')

const router = express.Router()
const FINAL_SHEETS_ROOT = path.join(__dirname, '../../uploads/final-sheets')

function sheetLocation(assessmentId, filename) {
  const safeName = path.basename(filename)
  return {
    key: sheetObjectKey(assessmentId, safeName),
    localPath: path.join(FINAL_SHEETS_ROOT, String(assessmentId), safeName),
  }
}

function safeSort(value) {
  return value === 'oldest' ? 'ASC' : 'DESC'
}

router.get('/community', async (req, res) => {
  try {
    const q = String(req.query.q ?? '').trim().slice(0, 80)
    const animal = String(req.query.animal ?? '').trim().slice(0, 80)
    const type = String(req.query.type ?? '').trim().slice(0, 80)
    const sort = safeSort(req.query.sort)

    const values = []
    const where = [
      "a.visibility = 'PUBLIC'",
      'a.deleted_at IS NULL',
      'a.final_sheet_filename IS NOT NULL',
      'a.community_published_at IS NOT NULL',
      'u.deleted_at IS NULL',
      'u.username IS NOT NULL',
      "gj.status = 'READY'",
    ]

    if (q) {
      values.push(`%${q}%`)
      where.push(`u.username ILIKE $${values.length}`)
    }
    if (animal) {
      values.push(animal)
      where.push(`ac.animal_name = $${values.length}`)
    }
    if (type) {
      values.push(type)
      where.push(`(ac.type_1_name = $${values.length} OR ac.type_2_name = $${values.length})`)
    }

    const result = await db.query(`
      SELECT a.id, a.community_published_at, a.final_sheet_uploaded_at,
             a.evolution_sheet_filename,
             u.username,
             ac.animal_name, ac.type_1_name, ac.type_2_name,
             (SELECT COUNT(*)::int FROM community_likes cl WHERE cl.assessment_id = a.id) AS like_count
      FROM assessments a
      JOIN users u ON u.id = a.user_id
      JOIN assessment_results ar ON ar.assessment_id = a.id
      JOIN assessment_classifications ac ON ac.assessment_result_id = ar.id
      JOIN generation_jobs gj ON gj.assessment_id = a.id
      WHERE ${where.join(' AND ')}
      ORDER BY a.community_published_at ${sort}
      LIMIT 200
    `, values)

    const filtersResult = await db.query(`
      SELECT
        ARRAY_REMOVE(ARRAY_AGG(DISTINCT ac.animal_name ORDER BY ac.animal_name), NULL) AS animals,
        ARRAY_REMOVE(ARRAY_AGG(DISTINCT ac.type_1_name ORDER BY ac.type_1_name), NULL) AS type_1,
        ARRAY_REMOVE(ARRAY_AGG(DISTINCT ac.type_2_name ORDER BY ac.type_2_name), NULL) AS type_2
      FROM assessments a
      JOIN users u ON u.id = a.user_id
      JOIN assessment_results ar ON ar.assessment_id = a.id
      JOIN assessment_classifications ac ON ac.assessment_result_id = ar.id
      JOIN generation_jobs gj ON gj.assessment_id = a.id
      WHERE a.visibility = 'PUBLIC'
        AND a.deleted_at IS NULL
        AND a.final_sheet_filename IS NOT NULL
        AND a.community_published_at IS NOT NULL
        AND u.deleted_at IS NULL
        AND u.username IS NOT NULL
        AND gj.status = 'READY'
    `)

    const f = filtersResult.rows[0] ?? {}
    const types = [...new Set([...(f.type_1 ?? []), ...(f.type_2 ?? [])])].sort((a, b) => a.localeCompare(b, 'fr'))

    res.json({
      items: result.rows.map(row => ({
        id: row.id,
        username: row.username,
        animal_name: row.animal_name,
        type_1_name: row.type_1_name,
        type_2_name: row.type_2_name,
        published_at: row.community_published_at,
        like_count: row.like_count ?? 0,
        final_sheet_url: `/api/v1/public/community/${row.id}/final-sheet`,
        evolution_sheet_url: row.evolution_sheet_filename
          ? `/api/v1/public/community/${row.id}/evolution-sheet`
          : null,
      })),
      filters: { animals: f.animals ?? [], types },
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: { code: 'COMMUNITY_READ_FAILED', message: 'Impossible de charger la communauté.' } })
  }
})

router.get('/community/:assessmentId', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT a.id, a.community_published_at, a.final_sheet_uploaded_at,
             a.evolution_sheet_filename, a.evolution_sheet_uploaded_at,
             u.username,
             ac.animal_name, ac.type_1_name, ac.type_2_name,
             (SELECT COUNT(*)::int FROM community_likes cl WHERE cl.assessment_id = a.id) AS like_count,
             CASE
               WHEN $2::uuid IS NULL THEN FALSE
               ELSE EXISTS (
                 SELECT 1 FROM community_likes cl
                 WHERE cl.assessment_id = a.id AND cl.user_id = $2::uuid
               )
             END AS liked_by_me
      FROM assessments a
      JOIN users u ON u.id = a.user_id
      JOIN assessment_results ar ON ar.assessment_id = a.id
      JOIN assessment_classifications ac ON ac.assessment_result_id = ar.id
      JOIN generation_jobs gj ON gj.assessment_id = a.id
      WHERE a.id = $1
        AND a.visibility = 'PUBLIC'
        AND a.deleted_at IS NULL
        AND a.final_sheet_filename IS NOT NULL
        AND a.community_published_at IS NOT NULL
        AND u.deleted_at IS NULL
        AND u.username IS NOT NULL
        AND gj.status = 'READY'
      LIMIT 1
    `, [req.params.assessmentId, req.user?.id ?? null])

    const row = result.rows[0]
    if (!row) return res.status(404).json({ error: { code: 'COMMUNITY_ITEM_NOT_FOUND', message: 'Création publique introuvable.' } })

    res.json({
      item: {
        id: row.id,
        username: row.username,
        animal_name: row.animal_name,
        type_1_name: row.type_1_name,
        type_2_name: row.type_2_name,
        published_at: row.community_published_at,
        final_sheet_uploaded_at: row.final_sheet_uploaded_at,
        evolution_sheet_uploaded_at: row.evolution_sheet_uploaded_at,
        like_count: row.like_count ?? 0,
        liked_by_me: Boolean(row.liked_by_me),
        final_sheet_url: `/api/v1/public/community/${row.id}/final-sheet`,
        evolution_sheet_url: row.evolution_sheet_filename
          ? `/api/v1/public/community/${row.id}/evolution-sheet`
          : null,
      },
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: { code: 'COMMUNITY_ITEM_READ_FAILED', message: 'Impossible de charger cette création.' } })
  }
})

async function communityItemExists(assessmentId) {
  const result = await db.query(`
    SELECT 1
    FROM assessments a
    JOIN users u ON u.id = a.user_id
    JOIN generation_jobs gj ON gj.assessment_id = a.id
    WHERE a.id = $1
      AND a.visibility = 'PUBLIC'
      AND a.deleted_at IS NULL
      AND a.final_sheet_filename IS NOT NULL
      AND a.community_published_at IS NOT NULL
      AND u.deleted_at IS NULL
      AND u.username IS NOT NULL
      AND gj.status = 'READY'
    LIMIT 1
  `, [assessmentId])
  return Boolean(result.rows[0])
}

async function readLikeState(assessmentId, userId) {
  const result = await db.query(`
    SELECT COUNT(*)::int AS like_count,
           BOOL_OR(user_id = $2) AS liked_by_me
    FROM community_likes
    WHERE assessment_id = $1
  `, [assessmentId, userId])
  return {
    like_count: result.rows[0]?.like_count ?? 0,
    liked_by_me: Boolean(result.rows[0]?.liked_by_me),
  }
}

router.post('/community/:assessmentId/like', requireAuth, likeLimiter, async (req, res) => {
  try {
    if (!await communityItemExists(req.params.assessmentId)) {
      return res.status(404).json({ error: { code: 'COMMUNITY_ITEM_NOT_FOUND', message: 'Création publique introuvable.' } })
    }
    await db.query(`
      INSERT INTO community_likes (assessment_id, user_id)
      VALUES ($1, $2)
      ON CONFLICT (assessment_id, user_id) DO NOTHING
    `, [req.params.assessmentId, req.user.id])
    res.json(await readLikeState(req.params.assessmentId, req.user.id))
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: { code: 'COMMUNITY_LIKE_FAILED', message: 'Impossible d’ajouter cette Pokéball.' } })
  }
})

router.delete('/community/:assessmentId/like', requireAuth, likeLimiter, async (req, res) => {
  try {
    if (!await communityItemExists(req.params.assessmentId)) {
      return res.status(404).json({ error: { code: 'COMMUNITY_ITEM_NOT_FOUND', message: 'Création publique introuvable.' } })
    }
    await db.query(`
      DELETE FROM community_likes
      WHERE assessment_id = $1 AND user_id = $2
    `, [req.params.assessmentId, req.user.id])
    res.json(await readLikeState(req.params.assessmentId, req.user.id))
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: { code: 'COMMUNITY_UNLIKE_FAILED', message: 'Impossible de retirer cette Pokéball.' } })
  }
})

// Compatibilité avec l'ancien frontend /gallery.
router.get('/gallery', (req, res, next) => {
  req.url = '/community' + (req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '')
  next()
})

router.get('/community/:assessmentId/final-sheet', async (req, res) => {
  const result = await db.query(`
    SELECT a.id, a.final_sheet_filename, a.final_sheet_mime_type
    FROM assessments a
    JOIN users u ON u.id = a.user_id
    WHERE a.id = $1
      AND a.visibility = 'PUBLIC'
      AND a.deleted_at IS NULL
      AND a.final_sheet_filename IS NOT NULL
      AND a.community_published_at IS NOT NULL
      AND u.deleted_at IS NULL
      AND u.username IS NOT NULL
    LIMIT 1
  `, [req.params.assessmentId])

  const row = result.rows[0]
  if (!row) return res.sendStatus(404)

  const sent = await sendObject(res, {
    ...sheetLocation(row.id, row.final_sheet_filename),
    contentType: row.final_sheet_mime_type,
    cacheControl: 'public, max-age=3600',
  })
  if (!sent) return res.sendStatus(404)
})

router.get('/community/:assessmentId/evolution-sheet', async (req, res) => {
  const result = await db.query(`
    SELECT a.id, a.evolution_sheet_filename, a.evolution_sheet_mime_type
    FROM assessments a
    JOIN users u ON u.id = a.user_id
    WHERE a.id = $1
      AND a.visibility = 'PUBLIC'
      AND a.deleted_at IS NULL
      AND a.final_sheet_filename IS NOT NULL
      AND a.evolution_sheet_filename IS NOT NULL
      AND a.community_published_at IS NOT NULL
      AND u.deleted_at IS NULL
      AND u.username IS NOT NULL
    LIMIT 1
  `, [req.params.assessmentId])

  const row = result.rows[0]
  if (!row) return res.sendStatus(404)

  const sent = await sendObject(res, {
    ...sheetLocation(row.id, row.evolution_sheet_filename),
    contentType: row.evolution_sheet_mime_type,
    cacheControl: 'public, max-age=3600',
  })
  if (!sent) return res.sendStatus(404)
})

router.get('/share/:token', async (req, res) => {
  const result = await db.query(`
    SELECT a.id, a.created_at, ac.animal_name, ac.type_1_name, ac.type_2_name,
           gj.status AS generation_status
    FROM assessments a
    JOIN assessment_results ar ON ar.assessment_id = a.id
    JOIN assessment_classifications ac ON ac.assessment_result_id = ar.id
    LEFT JOIN generation_jobs gj ON gj.assessment_id = a.id
    WHERE a.public_share_token = $1
      AND a.visibility = 'UNLISTED'
      AND a.deleted_at IS NULL
    LIMIT 1
  `, [req.params.token])

  if (!result.rows[0]) {
    return res.status(404).json({ error: { code: 'SHARE_NOT_FOUND', message: 'Lien de partage invalide ou expiré.' } })
  }

  const row = result.rows[0]
  res.json({
    ...row,
    share_token: req.params.token,
    deliverables: row.generation_status === 'READY' ? {
      dossier_pdf: `/generated-dossiers/${row.id}/dossier-creatif.pdf?share=${encodeURIComponent(req.params.token)}`,
      prompt_txt: `/generated-dossiers/${row.id}/prompt-fiche-complete.txt?share=${encodeURIComponent(req.params.token)}`,
    } : null,
  })
})

module.exports = router
