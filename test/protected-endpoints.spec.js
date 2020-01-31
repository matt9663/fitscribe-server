const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe('Protected endpoints', () => {
  let db
  const {
    testUsers,
    testWorkouts
  } = helpers.makeWorkoutsFixture()

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('cleanup', () => helpers.cleanTables(db))

  afterEach('cleanup', () => helpers.cleanTables(db))

  beforeEach('insert users and workouts', () => 
    helpers.seedWorkoutsTable(
      db,
      testUsers,
      testWorkouts
    )
  )
  const protectedEndpoints = [
    {
      name: 'GET /api/workouts',
      path: '/api/workouts'
    },
    {
      name: 'GET /api/workouts/:workout_id',
      path: '/api/workouts/1'
    }
  ]
  protectedEndpoints.forEach(endpoint => {
    describe(endpoint.name, () => {
      it('responds with 401 "missing bearer token" when no bearer token', () => {
        return supertest(app)
          .get(endpoint.path)
          .expect(401, { error: 'missing bearer token' })
      })
      it('responds with 401, "unauthorized request" when invalid JWT secret', () => {
        const validUser = testUsers[0]
        const invalidSecret = 'bad-secret'
        return supertest(app)
          .get(endpoint.path)
          .set('Authorization', helpers.makeAuthHeader(validUser, invalidSecret))
          .expect(401, { error: 'Unauthorized request' })
      })
      it('responds 401 "Unauthorized request" when invalid user', () => {
        const invalidUser = {...testUsers[0], user_name: 'bad_user-name'}
        return supertest(app)
          .get(endpoint.path)
          .set('Authorization', helpers.makeAuthHeader(invalidUser))
          .expect(401, { error: 'Unauthorized request' })
      })
    })
  })
})