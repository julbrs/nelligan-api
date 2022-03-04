const cheerio = require("cheerio");
var request = require("request");
const myConst = require("../const");
const { tableRowToHistory } = require("../utils");

module.exports = (card) => {
  return new Promise((resolve, reject) => {
    if (!(card && card.code && card.pin)) {
      reject("Card info not complete");
    }
    var books = [];
    var cookieJar = request.jar();
    request.post(
      {
        url: myConst.NELLIGAN_URL + "/patroninfo/?",
        jar: cookieJar,
        form: card,
        followAllRedirects: true,
      },
      function (err, res, body) {
        if (err) {
          return reject(err);
        }
        // let's soup that heu cheerio that
        if (body.includes("Sorry, ")) {
          // error during login !
          return reject(new Error("Error during login"));
        }

        // search the history link
        var data = cheerio.load(body);
        var history_url = data('img[alt="My Reading History"]')
          .parent()
          .attr("href");
        //console.log(history_url)

        // do the history query
        request.get(
          {
            url: myConst.NELLIGAN_URL + history_url,
            jar: cookieJar,
            followAllRedirects: true,
          },
          function (err2, res2, body2) {
            if (err2) {
              return reject(err2);
            }

            // do stuff
            var data = cheerio.load(body2);

            data("tr.patFuncEntry").each(function (index, element) {
              books[index] = tableRowToHistory(data, index, element);
            });
            resolve({
              history: books,
            });
          }
        ); // end of 2nd query
      }
    );
  });
};
