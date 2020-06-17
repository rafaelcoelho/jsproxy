var assert = require('assert')
var sinon = require('sinon')
var cache = require('./../cache')

function once(fn) {
  var returnValue, called = false;
  return function () {
      if (!called) {
          called = true;
          returnValue = fn.apply(this, arguments);
      }
      return returnValue;
  };
}

describe('Some testing suite', () => {
  it('test case', (done) => {
    let cb = sinon.fake()
    let proxy = once(cb)

    proxy()

    assert(cb.notCalled)
    done()
  })
})