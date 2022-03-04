const books = require("./src/api/books");
const history = require("./src/api/history");
const bookinfo = require("./src/api/bookinfo");
const hold = require("./src/api/hold");
const renew = require("./src/api/renew");
const search = require("./src/api/search");
const reserve = require("./src/api/reserve");
const libraries = require("./src/api/libraries");

module.exports = {
  bookinfo,
  books,
  history,
  renew,
  hold,
  search,
  reserve,
  libraries,
};
