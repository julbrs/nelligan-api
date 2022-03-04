const api = require("../");
const nock = require("nock");
const URL = require("../src/const").NELLIGAN_URL;

const search = "hubert reeves";

var assert = require("assert");
describe("search", () => {
  beforeEach(() => {
    nock(URL)
      .get(
        "/search/a?searchtype=Y&searcharg=hubert+reeves&searchscope=58&SORT=D"
      )
      .replyWithFile(200, __dirname + "/data/search.html");
  });

  it("should list of searches", async () => {
    const data = await api.search(search);
    assert.equal(data.length, 50);
    assert.equal(
      data[0].title,
      "Hubert Reeves nous explique - tome 2 - La forêt"
    );
  });
});
