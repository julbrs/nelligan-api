const cheerio = require("cheerio");
const axios = require("axios");
const myConst = require("../const");

module.exports = async (record) => {
  let bookInfo = {};
  bookInfo.record = record;
  const response = await axios.get(`${myConst.NELLIGAN_URL}/record=${record}`);
  if (response.data.includes("No Such Record")) {
    // error during login !
    throw new Error("Bad record");
  }

  bookInfo.available = response.data.includes("Reserve this title");

  // let's soup that heu cheerio that
  var data = cheerio.load(response.data);

  data("td.bibInfoLabel").each(function (index, element) {
    switch (data(element).text().trim()) {
      case "Title":
        bookInfo.title = data(element).next().text().trim();
        break;
      case "Publication Info.":
        bookInfo.pub = data(element).next().text().trim();
        break;
      case "Summary":
        bookInfo.summary = data(element).next().text().trim();
        break;
      case "ISBN":
        bookInfo.isbn = data(element).next().text().replace(/\D+/g, "");
        break;
    }
  });
  var couv = data("td.bibLinks").find("a").attr("href");
  if (typeof couv != "undefined") {
    bookInfo.thumb = `${myConst.NELLIGAN__DECOUVERTE_URL}/numerisation/couvertures/vignettes/${bookInfo.isbn}.jpg`;
    bookInfo.img = couv;
  }
  let tags = new Set();
  data("td.bibInfoData a").each((i, e) => {
    tags.add(e.children[0].data);
  });
  bookInfo.tags = Array.from(tags);
  return bookInfo;
};
