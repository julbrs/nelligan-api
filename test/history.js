const api = require('../')

const nock = require('nock')

const URL = require('../lib/const').NELLIGAN_URL

const card_good =
{
  code: 1,
  pin: 1
}

const card_notgood =
{
  code: 2,
  pin: 2
}

var assert = require('assert')

describe('history', () => {
  before(function() {
    nock(URL)
      .post('/patroninfo/?', card_notgood)
      .replyWithFile(200,  __dirname + '/data/login_fail.html')

    nock(URL)
      .post('/patroninfo/?', card_good)
      .replyWithFile(200,  __dirname + '/data/login_ok.html')

    nock(URL)
      .get('/patroninfo~S58/2423460/readinghistory')
      .replyWithFile(200,  __dirname + '/data/history.html')

    nock(URL)
      .get('/patroninfo~S58/2423460/readinghistory&page=2')
      .replyWithFile(200,  __dirname + '/data/history2.html')
  })

  it('should return failure if not good card', () => {
    return api.history(card_notgood)
      .then(
        (data) => Promise.reject(new Error('Expected method to reject.')),
        err => assert.equal(err.message, "Error during login")
      );
  })

  it('should return book history if good card', () => {
    return api.history(card_good)
      .then(
        (data) => assert.deepEqual(data.history[0],
          {
            "record": "b1116804",
            "author": "Peeters, Benoît, 1956-",
            "checkedout": "2019-12-29",
            "title": "Le théorème de Morcom / [illustrations de] Goffin sur un scénario de Peeters avec la collaboration graphique d'Etienne Schreder."
          })
        ,
        err => Promise.reject(err)
      );
  })
})
