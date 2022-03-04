const cheerio = require("cheerio");
var request = require("request");
const myConst = require("../const");
const { tableRowToBook } = require("../utils");

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
        // let's soup that heu cheerio that
        if (body.includes("Sorry, ")) {
          // error during login !
          reject("Error during login");
        }

        var data = cheerio.load(body);
        var fine = data("span.pat-transac a");

        if (fine.text() === "") {
          fine = "";
        } else {
          fine = fine.text();
        }
        data("tr.patFuncEntry").each(function (index, element) {
          books[index] = tableRowToBook(data, index, element);
        });
        resolve({
          books: books,
          fine: fine,
        });
      }
    );
  });
};
