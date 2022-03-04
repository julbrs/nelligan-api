const api = require("../");
const nock = require("nock");
const URL = require("../src/const").NELLIGAN_URL;

const record = "b2674328";

const card = {
  code: 1,
  pin: 1,
};

const book = {
  barcode: "32777074095642",
  duedate: "19-11-23",
  fine: null,
  record: "b2674328",
  renew: "3",
  rid: "renew0",
  rvalue: "i9230715",
  title: "BOOKTITLE",
};

const badrecord = "bad";

var assert = require("assert");
describe("renew", () => {
  describe("renew too many", () => {
    before(() => {
      nock(URL)
        .post("/patroninfo/?", card)
        .replyWithFile(200, __dirname + "/data/login_ok.html");

      nock(URL)
        .post("/patroninfo/?", { id: book.rid, value: book.rvalue })
        .replyWithFile(200, __dirname + "/data/renew_tomany.html");
    });

    it("should fail because too many renew", () => {
      return api.renew(card, book).then(
        (data) =>
          assert.deepEqual(data, {
            date: "  TOO MA",
          }),
        (err) => Promise.reject(new Error("Expected method to reject."))
      );
    });
  });

  describe("renew too early", () => {
    before(() => {
      nock(URL)
        .post("/patroninfo/?", card)
        .replyWithFile(200, __dirname + "/data/login_ok.html");

      nock(URL)
        .post("/patroninfo/?", { id: book.rid, value: book.rvalue })
        .replyWithFile(200, __dirname + "/data/renew_tosoon.html");
    });

    it("should fail because too early", () => {
      return api.renew(card, book).then(
        (data) => Promise.reject(new Error("Expected method to reject.")),
        (err) =>
          assert.deepEqual(err, {
            msg: "TOO_SOON",
          })
      );
    });
  });

  describe("renew reserved", () => {
    before(() => {
      nock(URL)
        .post("/patroninfo/?", card)
        .replyWithFile(200, __dirname + "/data/login_ok.html");

      nock(URL)
        .post("/patroninfo/?", { id: book.rid, value: book.rvalue })
        .replyWithFile(200, __dirname + "/data/renew_onhold.html");
    });

    it("should fail because reserved", () => {
      return api.renew(card, book).then(
        (data) => Promise.reject(new Error("Expected method to reject.")),
        (err) =>
          assert.deepEqual(err, {
            msg: "ON_HOLD",
          })
      );
    });
  });

  describe("renew work", () => {
    before(() => {
      nock(URL)
        .post("/patroninfo/?", card)
        .replyWithFile(200, __dirname + "/data/login_ok.html");

      nock(URL)
        .post("/patroninfo/?", { id: book.rid, value: book.rvalue })
        .replyWithFile(200, __dirname + "/data/renew.html");
    });

    it("should renew the book correclty", () => {
      return api.renew(card, book).then(
        (data) =>
          assert.deepEqual(data, {
            date: "19-11-24",
          }),
        (err) => Promise.reject(new Error("Expected method to reject."))
      );
    });
  });

  describe("renew fail (no barcode)", () => {
    before(() => {
      nock(URL)
        .post("/patroninfo/?", card)
        .replyWithFile(200, __dirname + "/data/login_ok.html");

      nock(URL)
        .post("/patroninfo/?", { id: book.rid, value: book.rvalue })
        .replyWithFile(200, __dirname + "/data/renew_fail.html");
    });

    it("should fail because no barcode", () => {
      return api.renew(card, book).then(
        (data) => Promise.reject(new Error("Expected method to reject.")),
        (err) =>
          assert.deepEqual(err, {
            msg: "NO_BARCODE",
          })
      );
    });
  });
});
