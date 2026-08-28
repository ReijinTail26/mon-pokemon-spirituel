const express = require('express')
const questionnaire =
  require('../data/questionnaire.public')

const router = express.Router()

router.get('/', (req, res) => {
  res.json(questionnaire)
})

module.exports = router