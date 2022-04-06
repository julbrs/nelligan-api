const api = require("..");
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
  it("should return error during login if bad card", () => {
    // mock
    nock(URL)
      .post("/patroninfo/?", new URLSearchParams(card_notgood).toString())
      .replyWithFile(200, __dirname + "/data/login_fail.html");

    return api.books(card_notgood).then(
      (_data) => {
        return Promise.reject(new Error("Expected method to reject."));
      },
      (err) => assert.equal(err.message, "Error during login")
    );
  });

  it("should return book list if good card", async () => {
    // mock
    nock(URL)
      .post("/patroninfo/?", new URLSearchParams(card_good).toString())
      .replyWithFile(200, __dirname + "/data/login_ok.html");

    const books = await api.books(card_good);
    assert.deepStrictEqual(books, {
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
    });
  });
});
