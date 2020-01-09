process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test-jwt-secret'
process.env.JWT_EXPIRY = '3m'

require('dotev').config()

process.env.TEST_DB_URL = process.env.TEST_DB_URL || "postgresql://dunder_mifflin@localhost/fitscribe-test"

const { expect } = require('chai')
const supertest = require('supertest')

global.expect = expect
global.supertest = supertest
