const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe.only('Weeks endpoint', function() {
  let db
  const { testUsers, testWorkouts } =helpers.makeWorkoutsFixture()

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
  describe('GET /api/weeks', () => {
    beforeEach('seed users table', () => 
      helpers.seedUsers(
        db,
        testUsers
      )
    )
    it('responds with 200 and a default week once user is created', () => {
      const testUser = testUsers[0]
      return supertest(app)
        .get('/api/weeks')
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .expect(200)
        .expect(res => {
          expect(res.body.user_id).to.eql(testUser.id)
        })
    })
  })
})