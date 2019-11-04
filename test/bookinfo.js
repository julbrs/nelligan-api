const api = require('../')

const nock = require('nock')

const URL = require('../lib/const').NELLIGAN_URL

const record = 'b2674328'
const badrecord = 'bad'

var assert = require('assert')
describe('bookinfo', () => {
  beforeEach(function() {
    nock(URL)
      .get('/record=', badrecord)
      .replyWithFile(200,  __dirname + '/data/bookinfo_fail.html')

    nock(URL)
      .get('/record='+ record)
      .replyWithFile(200,  __dirname + '/data/bookinfo.html')
  })

  it('should fail if bad record', () => {
    return api.bookinfo(badrecord)
      .then(
        (data) => Promise.reject(new Error('Expected method to reject.')),
        err => assert.equal(err, "Bad record")
      );
  })

  it('should return book info if good record', () => {
    return api.bookinfo(record)
      .then(
        (data) => assert.deepEqual(data,
          {
            img: 'http://nelligandecouverte.ville.montreal.qc.ca/numerisation/couvertures/face/9782368526460c.jpg',
            isbn: '9782368526460',
            pub: 'Paris : Kurokawa, [2018]',
            record: 'b2674328',
            thumb: 'http://nelligandecouverte.ville.montreal.qc.ca/numerisation/couvertures/vignettes/9782368526460.jpg',
            title: 'La magie du rangement illustrée / Marie Kondo ; dessins, Yuko Uramoto ; traduction et adaptation, Fabien Vautrin & Maiko_O.'
          })
        ,
        err => Promise.reject(new Error('Expected method to reject.'))
      );
  })
})
