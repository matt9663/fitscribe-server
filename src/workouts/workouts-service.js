const xss = require('xss')

const WorkoutsService = {
  getAllWorkouts(db) {
    return db
      .from('fitscribe_workouts AS workouts')
      .select('*')
  },
  serializeWorkout(workout) {
    const { exercises } = workout 
    let serializedExercises = exercises.map(exercise => {
      return ({
        liftName: xss(exercise.liftName),
        weight: xss(exercise.weight),
        reps: exercise.reps,
        sets: exercise.sets,
        order: exercise.order
      })
    })
    return {
      id: workout.id,
      author_id: workout.author_id,
      title: xss(workout.title),
      exercises: [...serializedExercises]
    }
  },
  getById(db, id) {
    return WorkoutsService.getAllWorkouts(db)
      .where('id', id)
      .first()
  },
  insertWorkout(db, newWorkout) {
    return db
      .insert(newWorkout)
      .into('fitscribe_workouts')
      .returning('*')
      .then(([workout]) => workout)
      .then(workout => 
        WorkoutsService.getById(db, workout.id)
      )
  }
}

module.exports = WorkoutsService;