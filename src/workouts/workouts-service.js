const xss = require('xss')

const WorkoutsService = {
  getAllWorkouts(db, id) {
    return db
      .from('fitscribe_workouts AS workouts')
      .select('*')
      .where('author_id', id)
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
  getById(db, user, workout_id) {
    return WorkoutsService.getAllWorkouts(db, user.id)
      .where('id', workout_id)
      .first()
  },
  insertWorkout(db, user, newWorkout) {
    return db
      .insert(newWorkout)
      .into('fitscribe_workouts')
      .returning('*')
      .then(([workout]) => workout)
      .then(workout => 
        WorkoutsService.getById(db, user, workout.id)
      )
  }
}

module.exports = WorkoutsService;