const api = require("../");
const nock = require("nock");
const URL = require("../src/const").NELLIGAN_URL;

const record = "b2674328";

const card_good = {
  code: 1,
  pin: 1,
};

const reservation_info = {
  locx00: "r39",
  needby_Year: "Year",
  needby_Month: "Month",
  needby_Day: "Day",
};

var assert = require("assert");
describe("reserve", () => {
  beforeEach(() => {
    nock(URL)
      .post("/patroninfo/?", "code=1&pin=1")
      .replyWithFile(200, __dirname + "/data/login_ok.html");

    nock(URL)
      .get("/record=" + record)
      .replyWithFile(200, __dirname + "/data/bookinfo.html");

    nock(URL)
      .post(
        "/search~S58?/.b2674328/.b2674328/1%2C1%2C1%2CB/request~b2674328",
        "locx00=r39&needby_Year=Year&needby_Month=Month&needby_Day=Day"
      )
      .replyWithFile(200, __dirname + "/data/reserve.html");
  });

  it("should reserve successfully one book", async () => {
    const data = await api.reserve(card_good, record, reservation_info.locx00);
    assert.equal(data, true);
  });
});
