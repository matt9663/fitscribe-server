const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe('Exercises endpoint', function() {
  let db
  const exercises = helpers.makeExercisesArray()
  const { testUsers } = helpers.makeWorkoutsFixture()
  const expectedExercises = exercises.map(exercise => ({
    id: exercise.id,
    liftName: exercise.liftname,
    muscle_group: exercise.muscle_group
  }))

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

  describe('GET /api/exercises', () => {
    context('given no exercises', () => {
      it('responds with 200 and an empty list', () => {
        return supertest(app)
          .get('/api/exercises')
          .expect(200, [])
      })
    })
    context('given that there are exercises', () => {
      beforeEach('insert exercises', () => 
        helpers.seedExercisesTable(
          db,
          exercises
        )
      )
      it('responds with 200 and a list of exercises', () => {
        return supertest(app)
          .get('/api/exercises')
          .expect(200, expectedExercises)
      })
    })
  })
  describe('POST /api/exercises', () => {
    beforeEach('insert users', () => 
      helpers.seedUsers(
        db,
        testUsers
      )
    )
    it('creates an exercise,  responding with 201 and the new exercise', () => {
      const testUser = testUsers[0]
      const newExercise = {
        liftname: 'Front Squats',
        muscle_group: 'Quads'
      }
      return supertest(app)
        .post('/api/exercises')
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .send(newExercise)
        .expect(201)
        .expect(res => {
          expect(res.body).to.have.property('id')
          expect(res.body.liftName).to.eql(newExercise.liftname)
          expect(res.body.muscle_group).to.eql(newExercise.muscle_group)
        })
        .expect(res => 
          db 
            .from('fitscribe_exercises')
            .select('*')
            .where({ id: res.body.id })
            .first()
            .then(row => {
              expect(row.liftname).to.eql(newExercise.liftname)
              expect(row.muscle_group).to.eql(newExercise.muscle_group)
            })
        )
    })
  })
})