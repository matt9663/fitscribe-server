const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')
const jwt = require('jsonwebtoken')

describe('Auth endpoints', () => {
  let db
  const { testUsers } = helpers.makeWorkoutsFixture()
  const testUser = testUsers[0]

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL
    })
    app.set('db', db)
  })

  after('disconnet from db', () => db.destroy())

  before('cleanup', () => helpers.cleanTables(db))

  afterEach('cleanup', () => helpers.cleanTables(db))

  describe('POST /api/auth/login', () => {
    beforeEach('insert users', () => 
      helpers.seedUsers(
        db,
        testUsers
      )
    )
    const requiredFields = ['user_name', 'password']

    requiredFields.forEach(field => {
      const loginAttempt = {
        user_name: testUser.user_name,
        password: testUser.password
      }
      
      it(`responds with 400 required error when ${field} is missing`, () => {
        delete loginAttempt[field]
        return supertest(app)
          .post('/api/auth/login')
          .send(loginAttempt)
          .expect(400, { error: `Missing ${field} in request body`})
      })
    })
    it('responds with 400 invalid user_name or password when bad user_name', () => {
      const userInvalidUser = { user_name: 'no-existy', password: testUser.password }
      return supertest(app)
        .post('/api/auth/login')
        .send(userInvalidUser)
        .expect(400, { error: 'Incorrect username or password' })
    })
    it('responds with 400 invalice user name or password when bad password', () => {
      const userBadPass = { user_name: testUser.user_name, password: 'this-totes-wrong' }
      return supertest(app)
        .post('/api/auth/login')
        .send(userBadPass)
        .expect(400, { error: 'Incorrect username or password'})
    })
    it('responds 200 and JWT auth token using secret when valid creds', () => {
      const validUser = {
        user_name: testUser.user_name,
        password: testUser.password
      }
      const expectedToken = jwt.sign(
        {user_id: testUser.id},
        process.env.JWT_SECRET,
        {
          subject: testUser.user_name,
          expiresIn: process.env.JWT_EXPIRY,
          algorithm: 'HS256'
        }
      )
      return supertest(app)
        .post('/api/auth/login')
        .send(validUser)
        .expect(200, {
          authToken: expectedToken
        })
    })
  })
})