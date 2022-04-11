const axios = require("axios");
const axiosCookieJarSupport = require("axios-cookiejar-support");
const toughCookie = require("tough-cookie");
const cheerio = require("cheerio");
const myConst = require("../const");

module.exports = async (card, record, library_code) => {
  const jar = new toughCookie.CookieJar();
  const client = axiosCookieJarSupport.wrapper(axios.create({ jar }));

  if (!(card && card.code && card.pin)) {
    throw new Error("Card info not complete");
  }

  // let's login first
  await client.post(
    `${myConst.NELLIGAN_URL}/patroninfo/?`,
    new URLSearchParams(card),
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );

  // then display record
  const recordPage = await client.get(
    `${myConst.NELLIGAN_URL}/record=${record}`
  );

  const data = cheerio.load(recordPage.data);
  const reserve_link = data("img[alt='Reserve this title']")
    .parent()
    .attr("href");

  if (reserve_link === undefined) {
    // the book is not available
    return false;
  }

  // then reserve it
  const reservePage = await client.post(
    `${myConst.NELLIGAN_URL}${reserve_link}`,
    new URLSearchParams({
      locx00: library_code,
      needby_Year: "Year",
      needby_Month: "Month",
      needby_Day: "Day",
    }),
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );

  if (reservePage.data.includes(" was successful.")) {
    return true;
  } else {
    throw new Error("Error during reservation");
  }
};
