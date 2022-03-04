const api = require("../");
const nock = require("nock");
const URL = require("../src/const").NELLIGAN_URL;

const card_good = {
  code: 1,
  pin: 1,
};

const card_notgood = {
  code: 2,
  pin: 2,
};

var assert = require("assert");
describe("books", () => {
  before(function () {
    nock(URL)
      .post("/patroninfo/?", card_notgood)
      .replyWithFile(200, __dirname + "/data/login_fail.html");

    nock(URL)
      .post("/patroninfo/?", card_good)
      .replyWithFile(200, __dirname + "/data/login_ok.html");
  });

  it("should return error during login if bad card", () => {
    return api.books(card_notgood).then(
      (data) => Promise.reject(new Error("Expected method to reject.")),
      (err) => assert.strictEqual(err, "Error during login")
    );
  });

  it("should return book list if good card", () => {
    return api.books(card_good).then(
      (data) =>
        assert.deepStrictEqual(data, {
          books: [
            {
              barcode: "32777074095642",
              duedate: "19-11-23",
              fine: undefined,
              record: "b2674328",
              renew: "3",
              rid: "renew0",
              rvalue: "i9230715",
              title: "BOOKTITLE",
            },
          ],
          fine: "",
        }),
      (err) => Promise.reject(new Error("Expected method to reject."))
    );
  });
});
