const cheerio = require("cheerio");
const axios = require("axios");
const axiosCookieJarSupport = require("axios-cookiejar-support");
const toughCookie = require("tough-cookie");

const myConst = require("../const");
const { tableRowToHistory } = require("../utils");

module.exports = async (card) => {
  const jar = new toughCookie.CookieJar();
  const client = axiosCookieJarSupport.wrapper(axios.create({ jar }));

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

  // search the history link
  const profileData = cheerio.load(profilePage.data);
  const history_url = profileData('img[alt="My Reading History"]')
    .parent()
    .attr("href");

  // go to history page
  const historyPage = await client.get(`${myConst.NELLIGAN_URL}${history_url}`);

  // do stuff
  const historyData = cheerio.load(historyPage.data);

  const books = historyData("tr.patFuncEntry")
    .map((index, element) => tableRowToHistory(historyData, index, element))
    .get();

  return {
    history: books,
  };
};
