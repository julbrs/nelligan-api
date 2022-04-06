const axios = require("axios");
const axiosCookieJarSupport = require("axios-cookiejar-support");
const toughCookie = require("tough-cookie");
const cheerio = require("cheerio");
const myConst = require("../const");

const jar = new toughCookie.CookieJar();
const client = axiosCookieJarSupport.wrapper(axios.create({ jar }));

module.exports = async (card, book) => {
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

  // do the renew query
  const renewPage = await client.post(
    profilePage.request.res.responseUrl,
    new URLSearchParams({
      id: book.rid,
      value: book.rvalue,
    }),
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );

  const data = cheerio.load(renewPage.data);

  let row = data("tr.patFuncEntry")
    .toArray()
    .find((e) => {
      return data(e).find("td.patFuncBarcode").text().trim() === book.barcode;
    });
  if (typeof row === "undefined") {
    throw new Error("NO_BARCODE");
  } else {
    var dueDate = data(row).find("td.patFuncStatus").text();
    if (dueDate.includes("ON HOLD")) {
      throw new Error("ON_HOLD");
    } else if (dueDate.includes("TOO SOON TO RENEW")) {
      throw new Error("TOO_SOON");
    } else {
      dueDate = data(row).find("td.patFuncStatus em").text();
      if (dueDate !== null) {
        dueDate = dueDate.replace("  RENEWEDNow due ", "").substring(0, 8);
        return { date: dueDate };
      }
    }
  }
  throw new Error("DUEDATE_NULL");
};
