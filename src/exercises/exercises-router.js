const express = require('express')
const ExercisesService = require('./exercises-service')
const { requireAuth } = require('../middleware/jwt-auth')
const path = require('path')

const exercisesRouter = express.Router()
const jsonBodyParser = express.json()

exercisesRouter
  .route('/')
  .get((req, res, next) => {
    ExercisesService.getAllExercises(
      req.app.get('db')
    )
      .then(exercises => {
        res.json(exercises.map(ExercisesService.serializeExercise))
      })
      .catch(next)
  })

exercisesRouter
  .route('/')
  .post(requireAuth, jsonBodyParser, (req, res, next) => {
    const { liftname, muscle_group } = req.body
    const newExercise = { liftname, muscle_group }
    for (const [key, value] of Object.entries(newExercise)) {
      if (value == null) {
        return res.status(400).json({
          error: `Missing ${key} in request body`
        })
      }
    }
    ExercisesService.insertExercise(
      req.app.get('db'),
      newExercise
    )
      .then(exercise => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${exercise.id}`))
          .json(ExercisesService.serializeExercise(exercise))
      })
      .catch(next)
  })

module.exports = exercisesRouter

  