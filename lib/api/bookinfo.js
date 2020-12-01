const cheerio = require('cheerio')
var request = require('request')
const myConst = require('../const')

module.exports = (record) => {
  return new Promise((resolve,reject) => {
    var bookinfo = {}
    bookinfo.record = record
    request.get({
      url:myConst.NELLIGAN_URL + '/record='+record
    }, function(err, res, body){
      if(err) {
        return reject(err)
      }
      if(body.includes("No Such Record")) {
        // error during login !
        return reject(new Error("Bad record"))
      }
      // let's soup that heu cheerio that
      var data = cheerio.load(body);
      data('td.bibInfoLabel').each(function(index, element){
        switch(data(element).text().trim()) {
          case 'Title':
            bookinfo.title = data(element).next().text().trim();
            break;
          case 'Publication Info.':
            bookinfo.pub = data(element).next().text().trim();
            break;
          case 'Summary':
            bookinfo.summary = data(element).next().text().trim();
            break;
          case 'ISBN':
            bookinfo.isbn = data(element).next().text().replace(/\D+/g, '');
            break;
        }
      });
      var couv = data('td.bibLinks').find('a').attr('href');
      if(typeof couv != 'undefined') {
        bookinfo.thumb = myConst.NELLIGAN__DECOUVERTE_URL + `/numerisation/couvertures/vignettes/${bookinfo.isbn}.jpg`;
        bookinfo.img = couv
      }
      let tags = new Set()
      data('td.bibInfoData a').each((i,e) => {
        console.log(e.attribs['href'])
        console.log(e.children[0].data)
        tags.add(e.children[0].data)
      })
      bookinfo.tags = Array.from(tags)
      resolve(bookinfo)
    })
  })
}
