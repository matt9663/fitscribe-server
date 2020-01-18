const xss = require('xss')

const ExercisesService = {
  getAllExercises(db) {
    return db
      .from('fitscribe_exercises')
      .select('*')
  },
  getById(db, id) {
    return ExercisesService.getAllExercises(db)
      .where('id', id)
      .first()
  },
  serializeExercise(exercise) {
     return ({
      liftName: xss(exercise.liftname),
      muscle_group:xss(exercise.muscle_group)
    })
  },
  insertExercise(db, newExercise) {
    return db
      .insert(newExercise)
      .into('fitscribe_exercises')
      .returning('*')
      .then(([exercise]) => exercise)
      .then(exercise => 
        ExercisesService.getById(db, exercise.id)  
      )
  }
}

module.exports = ExercisesService;