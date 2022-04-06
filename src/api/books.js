const axios = require("axios");
const axiosCookieJarSupport = require("axios-cookiejar-support");
const toughCookie = require("tough-cookie");
const cheerio = require("cheerio");
const myConst = require("../const");
const { tableRowToBook } = require("../utils");

const jar = new toughCookie.CookieJar();
const client = axiosCookieJarSupport.wrapper(axios.create({ jar }));

module.exports = async (card) => {
  if (!(card && card.code && card.pin)) {
    throw new Error("Card info not complete");
  }

  // let's login first
  const profilePage = await client.post(
    `${myConst.NELLIGAN_URL}/patroninfo/?`,
    new URLSearchParams(card),
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );

  // check if login is correct
  if (profilePage.data.includes("Sorry, ")) {
    throw new Error("Error during login");
  }

  // inspect page
  const data = cheerio.load(profilePage.data);
  let fine = data("span.pat-transac a");

  if (fine.text() === "") {
    fine = "";
  } else {
    fine = fine.text();
  }

  const books = data("tr.patFuncEntry")
    .map((index, element) => tableRowToBook(data, index, element))
    .get();

  return {
    books: books,
    fine: fine,
  };
};
