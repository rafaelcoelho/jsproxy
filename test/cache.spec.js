var proxyquire = require('proxyquire')
var assert = require('assert')
var sinon = require('sinon')

var sqliteStub = (cb) => {
  cb(null, {statusCode: 200})
}

var fsStub = () => {
    return true
  };

var cache

describe('Setup', () => {
  beforeEach(() => {
    cache = proxyquire('./../cache', {
      sqlite: {
        Database: {
            get: sqliteStub
          }
      },
      fs: {
        existsSync: fsStub
      }
    })
  })

  describe('Some testing suite', () => {
    it('test case', (done) => {
      cache.read('10', (err, res) => {
        console.log(res)
      })
      done()
    })
  })
})
