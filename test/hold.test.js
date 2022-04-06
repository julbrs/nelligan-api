const api = require("..");
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

const card_hold_one_ready = {
  code: 3,
  pin: 3,
};

var assert = require("assert");

describe("hold", () => {
  before(() => {
    nock(URL)
      .post("/patroninfo/?", new URLSearchParams(card_hold).toString())
      .replyWithFile(200, __dirname + "/data/hold_login_withhold.html");

    nock(URL)
      .post("/patroninfo/?", new URLSearchParams(card_nohold).toString())
      .replyWithFile(200, __dirname + "/data/hold_login_withnohold.html");

    nock(URL)
      .get("/patroninfo~S58/2418642/holds")
      .replyWithFile(200, __dirname + "/data/hold_hold.html");

    nock(URL)
      .post(
        "/patroninfo/?",
        new URLSearchParams(card_hold_one_ready).toString()
      )
      .replyWithFile(200, __dirname + "/data/hold_login_withhold2.html");

    nock(URL)
      .get("/patroninfo~S58/2418643/holds")
      .replyWithFile(200, __dirname + "/data/hold_login_withoneready.html");
  });

  it("should return holds if holds available", async () => {
    const data = await api.hold(card_hold);
    assert.deepStrictEqual(data.hold[0], {
      record: "b2378896",
      pickup: "LA PETITE-PATRIE",
      cancel: "21-11-19",
      status: "hold",
      title:
        "Il l'a fait! / Ole Könnecke ; [traduit de l'allemand par Florence Seyvos].",
    });
  });

  it("should return no holds if no holds available", async () => {
    const data = await api.hold(card_nohold);
    assert.strictEqual(data.hold.length, 0);
  });

  it("should return one ready  if one ready available", async () => {
    const data = await api.hold(card_hold_one_ready);
    assert.strictEqual(data.hold.length, 5);
    const book = data.hold.find((b) => b.record === "b2792043");
    assert.deepEqual(book, {
      title:
        "Premier trio. 3, En zone adverse / Nadia Lakhdari avec Marie Potvin.",
      cancel: "24-03-19",
      pickup: "LA PETITE-PATRIE",
      record: "b2792043",
      status: "available",
    });

    const book2 = data.hold.find((b) => b.record === "b2756435");
    assert.deepEqual(book2, {
      title: "Premier trio. 2, Passe par la bande / Nadia Lakhdari.",
      cancel: "24-03-19",
      pickup: "LA PETITE-PATRIE",
      record: "b2756435",
      status: "soon",
    });

    const book3 = data.hold.find((b) => b.record === "b2612259");
    assert.deepEqual(book3, {
      title:
        "Miss Charity / Marie-Aude Murail ; illustrations de Philippe Dumas.",
      cancel: "24-03-15",
      pickup: "LA PETITE-PATRIE",
      record: "b2612259",
      status: "hold",
    });
  });
});
