const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

function makeUsersArray() {
  return [
    {
      id: 1,
      user_name: 'test-user-1',
      password: 'password',
      email_address: 'test-email-1'
    },
    {
      id: 2,
      user_name: 'test-user-2',
      password: 'password',
      email_address: 'test-email-2'
    },
    {
      id: 3,
      user_name: 'test-user-3',
      password: 'password',
      email_address: 'test-email-3'
    }
  ]
}

function makeWorkoutsArray(users) {
  return [
    {
      id: 1,
      title: 'test-workout-1',
      author_id: users[0].id,
      exercises: [
        { liftName: 'Barbell bench press', weight: '155', reps: 8, sets: 4, order: 1 },
        { liftName: 'Cable chest flys', weight: '20', reps: 15, sets: 4, order: 2 }
      ]
    },
    {
      id: 2,
      title: 'test-workout-2',
      author_id: users[1].id,
      exercises: [
        { liftName: 'Barbell back squat', weight: '225', reps: 5, sets: 5, order: 1 },
        { liftName: 'Deadlift', weight: '235', reps: 5, sets: 4, order: 2, }
      ]
    },
    {
      id: 3,
      title: 'test-workout-3',
      author_id: users[2].id,
      exercises: [
        { liftName: 'Pull-ups', weight: 'Bodyweight', reps: 12, sets: 3, order: 1 },
        { liftName: 'Lat pulldowns', weight: '130', reps: 10, sets: 4, order: 2, }
      ]
    },
    {
      id: 4,
      title: 'test-workout-4',
      author_id: users[0].id,
      exercises: [
        { liftName: 'Some other stuff', weight: 'Bodyweight', reps: 12, sets: 3, order: 1 },
        { liftName: 'Curls for the girls', weight: '130', reps: 10, sets: 4, order: 2, }
      ]
    }
  ]
}

function makeExpectedWorkouts(user, workouts) {
  const matchedWorkouts = workouts.filter(workout => workout.author_id === user.id)
  return matchedWorkouts.map(workout => ({
    id: workout.id,
    title: workout.title,
    author_id: user.id,
    exercises: [...workout.exercises]
  }))   
}

function makeWorkoutsFixture() {
  const testUsers = makeUsersArray()
  const testWorkouts = makeWorkoutsArray(testUsers)
  return { testUsers, testWorkouts }
}

function seedUsers(db, users) {
  const preppedUsers = users.map(user => ({
    ...user,
    password: bcrypt.hashSync(user.password, 1)
  }))
  return db.into('fitscribe_users').insert(preppedUsers)
    .then(() => 
      db.raw(
        `SELECT setval('fitscribe_users_id_seq', ?)`,
        [users[users.length - 1].id]
      )
    )
}

function seedWorkoutsTable(db, users, workouts) {
  let preppedWorkouts = workouts.map(workout => ({
    id: workout.id,
    title: workout.title,
    author_id: workout.author_id,
    exercises: JSON.stringify(workout.exercises)

  }))
  return db.transaction(async trx => {
    await seedUsers(trx, users)
    await trx.into('fitscribe_workouts').insert(preppedWorkouts)
    await trx.raw(
      `SELECT setval('fitscribe_workouts_id_seq', ?)`,
      [workouts[workouts.length - 1].id]
    )
  })
}

function seedMaliciousWorkout(db, user, workout) {
  return seedUsers(db, [user])
    .then(() => 
      db
        .into('fitscribe_workouts')
        .insert([workout])
    )
}

function makeAuthHeader (user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ user_id: user.id}, secret, {
    subject: user.user_name,
    algorithm: 'HS256'
  })
  return `Bearer ${token}`
}

function cleanTables(db) {
  return db.transaction(trx => 
    trx.raw(
      `TRUNCATE
        fitscribe_workouts,
        fitscribe_users
        RESTART IDENTITY CASCADE
      `
    )
      .then(() => 
        Promise.all([
          trx.raw(`ALTER SEQUENCE fitscribe_workouts_id_seq minvalue 0 START WITH 1`),
          trx.raw(`ALTER SEQUENCE fitscribe_users_id_seq minvalue 0 START WITH 1`),
          trx.raw(`SELECT setval('fitscribe_workouts_id_seq', 0)`),
          trx.raw(`SELECT setval('fitscribe_users_id_seq', 0)`)
        ])
      )
  )
}

module.exports = {
  makeUsersArray,
  makeWorkoutsArray,
  makeWorkoutsFixture,
  makeExpectedWorkouts,
  cleanTables,
  seedMaliciousWorkout,
  seedUsers,
  seedWorkoutsTable,
  makeAuthHeader
}