const api = require('../')

var assert = require('assert')
describe('books', () => {
  describe('books wrong id', () => {
    it('should return error during login', async() => {
      try {
        let books = await api.books(
          {
            code: 1,
            pin: 1
          }
        )
      }
      catch(e) {

      }

      //assert.equal([1, 2, 3].indexOf(4), -1);
    })
  })
})
