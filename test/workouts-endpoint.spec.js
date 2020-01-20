const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe('Workouts endpoint', function() {
  let db
  const { testUsers, testWorkouts } = helpers.makeWorkoutsFixture()
  
  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('clean up tables', () => helpers.cleanTables(db))

  afterEach('clean up tables', () => helpers.cleanTables(db))

  describe('GET /api/workouts', () => {
    context('given no workouts', () => {
      beforeEach('seed users table', () => 
        helpers.seedUsers(
          db,
          testUsers
        )
      )
      it('responds with 200 and an empty list', () => {
        const testUser = testUsers[0]
        return supertest(app)
          .get('/api/workouts')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200, [])
      })
    })
    context('given that there are workouts', () => {
      beforeEach('insert workouts and users', () => 
        helpers.seedWorkoutsTable(
          db,
          testUsers,
          testWorkouts
        )
      )
      it('responds with 200 and all workouts', () => {
        const testUser = testUsers[0]
        const expectedWorkouts = helpers.makeExpectedWorkouts(testUser, testWorkouts)        
        return supertest(app)
            .get(`/api/workouts`)
            .set('Authorization', helpers.makeAuthHeader(testUser))
            .expect(200, expectedWorkouts)
      })
    })
  })
  describe('GET /api/workouts/:workout_id', () => {
    context('given no workouts', () => {
      beforeEach('seed users', () => {
        helpers.seedUsers(
          db,
          testUsers
        )
      })
      it('responds with 404 workout not found' , () => {
        const testUser = testUsers[0]
        const workoutId = 1234
        return supertest(app)
          .get(`/api/workouts/${workoutId}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(404, { error: 'Workout does not exist' })
      })
    })    
    context('given there are users and workouts', () => {
      beforeEach('seed workouts and users', () => 
        helpers.seedWorkoutsTable(
          db,
          testUsers,
          testWorkouts
        )
      )
      it('responds with 200 and the requested workout', () => {
        const testUser = testUsers[0]
        const workoutId = 1
        const expectedWorkout = testWorkouts[0]
        return supertest(app)
          .get(`/api/workouts/${workoutId}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200, expectedWorkout)
      })
    })
  })
  describe('POST /api/workouts', () => {
    beforeEach('insert users', () => 
      helpers.seedUsers(
        db,
        testUsers
      )
    )
    it('creates a workout, responding with 201 and the new workout', () => {
      const testUser = testUsers[0]
      const newWorkout = {
        title: 'new-workout',
        exercises: [
          { liftName: 'Front squats', weight: '135', reps: 8, sets: 4 },
          { liftName: 'Dead-lifts', weight: '225', reps: 5, sets: 5 }
        ]
      }
      return supertest(app)
        .post(`/api/workouts`)
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .send(newWorkout)
        .expect(201)
        .expect(res => {
          expect(res.body).to.have.property('id')
          expect(res.body.title).to.eql(newWorkout.title)
          expect(res.body.author_id).to.eql(testUser.id)
          expect(res.body.exercises).to.deep.eql(newWorkout.exercises)
        })
        .expect(res => 
          db
            .from('fitscribe_workouts')
            .select('*')
            .where({ id: res.body.id })
            .first()
            .then(row => {
              expect(row.title).to.eql(newWorkout.title)
              expect(row.author_id).to.eql(testUser.id)
              expect(row.exercises).to.deep.eql(newWorkout.exercises)
            })  
        )
    })
    const requiredFields = ['title', 'exercises']
    requiredFields.forEach(field => {
      const testUser = testUsers[0]
      const newWorkout = {
        title: 'new-workout',
        exercises: [
          { liftName: 'Front squats', weight: '135', reps: 8, sets: 4 },
          { liftName: 'Dead-lifts', weight: '225', reps: 5, sets: 5 }
        ]
      }
      it(`responds with 400 and an error message when ${field} is missing`, () => {
        delete newWorkout[field]
        return supertest(app)
          .post('/api/workouts')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .send(newWorkout)
          .expect(400, {
            error: `Missing ${field} in request body`
          })
        }
      )
    })
  })
})
