const cheerio = require("cheerio");
const axios = require("axios");
const myConst = require("../const");

module.exports = async (search) => {
  const result = await axios.get(`${myConst.NELLIGAN_URL}/search/a`, {
    params: {
      searchtype: "Y",
      searcharg: search,
      searchscope: 58,
      //extended: 0,
      SORT: "D", // D relevance DX date AX title
    },
  });

  // let's soup that heu cheerio that
  const data = cheerio.load(result.data);

  return data("table.browseSearchtoolMessage")
    .map((index, element) => {
      const checkbox = data(element).find("p.main-no-doc input");
      const type = data(element).find("div.brief-type-doc").text().trim();
      const titre = data(element).find("span.brief-lien-titre a");

      return {
        record: checkbox.attr("value"),
        type: type,
        link: titre.attr("href"),
        title: titre.text(),
      };
    })
    .toArray();
};
