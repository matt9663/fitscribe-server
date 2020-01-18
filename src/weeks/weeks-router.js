const express = require('express')
const { requireAuth } = require('../middleware/jwt-auth')
const WeeksService = require('./weeks-service')

const weeksRouter = express.Router()
const jsonBodyParser = express.json()

weeksRouter
  .route('/')
  .all(requireAuth)
  .get((req, res, next) => {
    let user_id = req.user.id
    WeeksService.getUserWeek(
      req.app.get('db'),
      user_id
    )
      .then(week => {
        res.json(WeeksService.formatResponse(week))
      })
      .catch(next)
  })

  weeksRouter
    .route('/:week_id')
    .all(requireAuth)
    .patch(jsonBodyParser, (req, res, next) => {
      id = req.params.week_id
      WeeksService.updateWeek(
        req.app.get('db'),
        id,
        req.body
      )
        .then(week => {
          res.json(week)
        })
        .catch(next)
    })

    module.exports = weeksRouter