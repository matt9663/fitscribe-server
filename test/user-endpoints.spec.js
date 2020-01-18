const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')
const bcrypt = require('bcryptjs')

describe('User endpoints', function() {
  let db

  const { testUsers } = helpers.makeWorkoutsFixture()
  const testUser = testUsers[0]


  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('cleanup' ,() => helpers.cleanTables(db))

  afterEach('cleanup', () => helpers.cleanTables(db))

  describe('POST /api/users', () => {
    context('User validation', () => {
      beforeEach('insert users', () => 
        helpers.seedUsers(
          db,
          testUsers
        )
      )
      const requiredFields = ['user_name', 'password', 'email_address']
      requiredFields.forEach(field => {
        const registerAttemptBody = {
          user_name: 'test-user-name',
          password: 'Testpassword1!',
          email_address: 'testemail@test.com'
        }
        it(`responds with 400 required error when ${field} is missing`, () => {
          delete registerAttemptBody[field]
          return supertest(app)
            .post('/api/users')
            .send(registerAttemptBody)
            .expect(400, { error: `Missing ${field} in request body`})
        })
      })
      it('responds 400 "password must be longer than 8 characters" when less than', () => {
        const userShortPass = {
          user_name: 'test-user1',
          password: '1234567',
          email_address: 'testemail@email.com'
        }
        return supertest(app)
          .post('/api/users')
          .send(userShortPass)
          .expect(400, { error: 'Password must be at least 8 characters' })
      })
      it('responds 400 "password must be less than 72 characters" when greater than', () => {
        const userLongPass = {
          user_name: 'test-user1',
          password: '*'.repeat(73),
          email_address: 'testemail@email.com'
        }
        return supertest(app)
          .post('/api/users')
          .send(userLongPass)
          .expect(400, { error: 'Password cannot exceed 72 characters' })
      })
      it('responds with 400 "password cannot begin or end with space" if started with one', () => {
        const userPassFrontSpace = {
          user_name: 'test-user-1',
          password: ' Bad-password1',
          email_address: 'testemail@email.com'
        }
        return supertest(app)
          .post('/api/users')
          .send(userPassFrontSpace)
          .expect(400, { error: 'Password cannot begin or end with a space' })
      })
      it('responds with 400 "password cannot begin or end with space" if ends with one', () => {
        const userPassEndSpace = {
          user_name: 'test-user-1',
          password: 'Bad-password1 ',
          email_address: 'testemail@email.com'
        }
        return supertest(app)
          .post('/api/users')
          .send(userPassEndSpace)
          .expect(400, { error: 'Password cannot begin or end with a space' })
      })
      it('responds with 400 if password is not complex enough', () => {
        const userSimplePass = {
          user_name: 'test-user-1',
          password: 'ezpassword',
          email_address: 'testemail@email.com'
        }
        return supertest(app)
          .post('/api/users')
          .send(userSimplePass)
          .expect(400, { error: 'Password must contain at least 1 upper case, lower case, number, and special character'})
      })
      it('responds with 400, "user name already taken" if duplicate', () => {
        const duplicateUserName = {
          user_name: testUser.user_name,
          password: 'Password1!',
          email_address: 'test-email@email.com'
        }
        return supertest(app)
          .post('/api/users')
          .send(duplicateUserName)
          .expect(400, { error: 'User name already taken' })
      })
    })
    context('successful login', () => {
      it('responds with 201, serialized user, storing bcrypted password', () => {
        const newUser = {
          user_name: 'test-user-1',
          password: 'Password1!',
          email_address: 'test-email@email.com'
        }
        return supertest(app)
          .post('/api/users')
          .send(newUser)
          .expect(201)
          .expect(res => {
            expect(res.body).to.have.property('id')
            expect(res.body.user_name).to.eql(newUser.user_name)
            expect(res.body.email_address).to.eql(newUser.email_address)
            expect(res.body).to.not.have.property('password')
          })
          .expect(res => 
            db
              .from('fitscribe_users')
              .select('*')
              .where('id', res.body.id)
              .first()
              .then(row => {
                expect(row.user_name).to.eql(newUser.user_name)
                expect(row.email_address).to.eql(newUser.email_address)
                return bcrypt.compare(newUser.password, row.password)
              })
              .then(compareMatch => {
                expect(compareMatch).to.be.true
              })
          )
      })
    })
  })
})