const cheerio = require("cheerio");
var request = require("request");
const myConst = require("../const");
const { tableRowToHold } = require("../utils");

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

        // search the hold link
        var data = cheerio.load(body);
        var hold_url = data("span.pat-transac").parent().find("a").attr("href");

        // if no hold url then there is no hold
        if (!hold_url) {
          resolve({
            hold: [],
          });
        }

        // do the hold query
        request.get(
          {
            url: myConst.NELLIGAN_URL + hold_url,
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
              books[index] = tableRowToHold(data, index, element);
            });
            resolve({
              hold: books,
            });
          }
        ); // end of 2nd query
      }
    );
  });
};
