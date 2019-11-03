const cheerio = require('cheerio');
var request = require('request');
const {tableRowToBook} = require('./utils')
const myConst = require('./const')


exports.books = (card) => {
  return new Promise((resolve,reject) => {
    if(!(card && card.code && card.pin)) {
      reject("Card info not complete")
    }
    var books = []
    var cookieJar = request.jar()
    request.post({
      url:myConst.NELLIGAN_URL + '/patroninfo/?',
      jar: cookieJar,
      form: card,
      followAllRedirects:true,
    }, function(err, res ,body){
      // let's soup that heu cheerio that
      if(body.includes("Sorry, ")) {
        // error during login !
        reject("Error during login")
      }

      var data = cheerio.load(body);
      var fine = data('span.pat-transac a')

      if(fine.text() === '') {
        fine = ''
      }
      else {
        fine = fine.text()
      }
      data('tr.patFuncEntry').each(function(index, element){
        books[index] = tableRowToBook(data, index, element)
      })
      resolve({
        books: books,
        fine: fine
      })
    })
  })
}

exports.bookinfo = (record) => {
  return new Promise((resolve,reject) => {
    var bookinfo = {}
    bookinfo.record = record
    request.get({
      url:myConst.NELLIGAN_URL + '/record='+record
    }, function(err, res, body){
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
      resolve(bookinfo)
    })
  })
}

exports.renew = (card, book) => {
  return new Promise((resolve,reject) => {
    if(!(card && card.code && card.pin)) {
      reject("Card info not complete")
    }
    var cookieJar = request.jar();
    request.post({
      url:myConst.NELLIGAN_URL + '/patroninfo/?',
      jar: cookieJar,
      form: card,
      followAllRedirects:true,
    }, function(err, res, body){
      if(err) {
        reject(err)
      }
      // do the renew query
      request.post({
        url:httpResponse.request.uri.href,
        jar: cookieJar,
        form: {'id': book.rid, 'value': book.rvalue},
        followAllRedirects:true,
      }, function(err2, res2, body2){
        if(err2) {
          reject(err2)
        }
        var data = cheerio.load(body2);
        data('tr.patFuncEntry').each(function(index, element){
          if(data(element).find('td.patFuncBarcode').text().trim() == book.barcode) {
            var duedate = data(element).find('td.patFuncStatus').text();
            //console.log(duedate)
            if(duedate.includes("ON HOLD")) {
              reject({msg:'ON_HOLD'})
            }
            else if (duedate.includes("TOO SOON TO RENEW")) {
              reject({msg:'TOO_SOON'})
            }
            else {
              duedate = data(element).find('td.patFuncStatus em').text();
              if(duedate !== null) {
                duedate = duedate.replace("  RENEWEDNow due ", "").substring(0, 8)
                resolve({date: duedate})
                //TODO
                const regexduedate =/ DUE (\d{2}-\d{2}-\d{2})(?: FINE\(up to now\) (.*)\$)?(?:  Renewed (\d) times?)?/gm;
                while ((m = regexduedate.exec(duedate)) !== null) {
                  // This is necessary to avoid infinite loops with zero-width matches
                  if (m.index === regexduedate.lastIndex) {
                    regexduedate.lastIndex++;
                  }
                  //books[index]['duedate'] = m[1];
                  //books[index]['fine'] = m[2];
                  //books[index]['renew'] = m[3];
                }
              }
              else {
                reject({msg:'ERROR'})
              }
            }
          }
        })
      })
    })
  })
}
