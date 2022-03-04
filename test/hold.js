const api = require("../");
const nock = require("nock");
const URL = require("../src/const").NELLIGAN_URL;

const card_hold = {
  code: 1,
  pin: 1,
};

const card_nohold = {
  code: 2,
  pin: 2,
};

var assert = require("assert");

describe("hold", () => {
  before(function () {
    nock(URL)
      .post("/patroninfo/?", card_hold)
      .replyWithFile(200, __dirname + "/data/hold_login_withhold.html");

    nock(URL)
      .post("/patroninfo/?", card_nohold)
      .replyWithFile(200, __dirname + "/data/hold_login_withnohold.html");

    nock(URL)
      .get("/patroninfo~S58/2418642/holds")
      .replyWithFile(200, __dirname + "/data/hold_hold.html");
  });

  it("should return holds if holds available", () => {
    return api.hold(card_hold).then(
      (data) =>
        assert.deepStrictEqual(data.hold[0], {
          record: "b2378896",
          pickup: "LA PETITE-PATRIE",
          cancel: "21-11-19",
          title:
            "Il l'a fait! / Ole Könnecke ; [traduit de l'allemand par Florence Seyvos].",
        }),
      (err) => Promise.reject(err)
    );
  });

  it("should return no holds if no holds available", () => {
    return api.hold(card_nohold).then(
      (data) => assert.strictEqual(data.hold.length, 0),
      (err) => Promise.reject(err)
    );
  });
});
