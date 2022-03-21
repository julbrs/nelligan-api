const axios = require("axios");
const axiosCookieJarSupport = require("axios-cookiejar-support");
const toughCookie = require("tough-cookie");
const cheerio = require("cheerio");
const myConst = require("../const");
const { tableRowToHold } = require("../utils");

const jar = new toughCookie.CookieJar();
const client = axiosCookieJarSupport.wrapper(axios.create({ jar }));

module.exports = async (card) => {
  if (!(card && card.code && card.pin)) {
    throw new Error("Card info not complete");
  }

  let books = [];

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

  // search the hold link
  const profileData = cheerio.load(profilePage.data);
  const holdUrl = profileData("span.pat-transac")
    .parent()
    .find("a")
    .attr("href");

  // if no hold url then there is no hold
  if (!holdUrl) {
    return {
      hold: books,
    };
  }

  // go to holds page
  const holdPage = await client.get(`${myConst.NELLIGAN_URL}${holdUrl}`);

  // do stuff
  const holdData = cheerio.load(holdPage.data);

  holdData("tr.patFuncEntry").each((index, element) => {
    books[index] = tableRowToHold(holdData, index, element);
  });
  return {
    hold: books,
  };
};
