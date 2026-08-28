const express = require('express')
const path = require('path')
const db = require('../../db')
const router = express.Router()
const ROOT = path.join(__dirname, '../../generated-dossiers')
const ALLOWED = new Set(['dossier-creatif.pdf', 'prompt-fiche-complete.txt', 'seed-evolutif.pdf'])
const { generatedObjectKey, sendObject } = require('../services/objectStorage')

router.get('/:assessmentId/:filename', async (req, res) => {
  if (!ALLOWED.has(req.params.filename)) return res.sendStatus(404)

  const result = await db.query(`
    SELECT user_id, visibility, public_share_token, evolution_slot_unlocked,
           evolution_seed_pdf_created_at
    FROM assessments
    WHERE id = $1 AND deleted_at IS NULL
    LIMIT 1
  `, [req.params.assessmentId])

  if (!result.rows[0]) return res.sendStatus(404)
  const row = result.rows[0]
  const owner = Boolean(req.user && row.user_id && String(req.user.id) === String(row.user_id))
  const unlistedAccess = row.visibility === 'UNLISTED'
    && row.public_share_token
    && typeof req.query.share === 'string'
    && req.query.share === row.public_share_token

  if (req.params.filename === 'seed-evolutif.pdf'
      && (row.evolution_slot_unlocked !== true || !row.evolution_seed_pdf_created_at)) {
    return res.sendStatus(404)
  }

  // Même lorsqu'une fiche est PUBLIQUE dans la communauté, le PDF créatif et le prompt restent privés.
  if (!owner && !unlistedAccess) return res.sendStatus(404)

  const mimeTypes = {
    'dossier-creatif.pdf': 'application/pdf',
    'prompt-fiche-complete.txt': 'text/plain; charset=utf-8',
    'seed-evolutif.pdf': 'application/pdf',
  }
  const sent = await sendObject(res, {
    key: generatedObjectKey(req.params.assessmentId, req.params.filename),
    localPath: path.join(ROOT, req.params.assessmentId, req.params.filename),
    contentType: mimeTypes[req.params.filename],
    filename: req.params.filename,
    download: req.query.download === '1',
  })
  if (!sent) return res.sendStatus(404)
})

module.exports = router
