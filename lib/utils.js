
exports.tableRowToBook = (data, index, element) => {
  var book = {}
  book.title = data(element).find('span.patFuncTitleMain').text();
  book.barcode = data(element).find('td.patFuncBarcode').text().trim();
  book.duedate = data(element).find('td.patFuncStatus').text();
  book.rid = data(element).find('td.patFuncMark input').attr('id');
  book.rvalue = data(element).find('td.patFuncMark input').attr('value');
  const regex = /\/record=(.*)~.*/gm;
  const str = data(element).find('a').attr('href');
  let m;

  while ((m = regex.exec(str)) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === regex.lastIndex) {
      regex.lastIndex++;
    }
    book.record = m[1];
  }

  const regexduedate =/ DUE (\d{2}-\d{2}-\d{2})(?: FINE\(up to now\) (.*)\$)?(?:  Renewed (\d) times?)?/gm;
  while ((m = regexduedate.exec(book.duedate)) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === regexduedate.lastIndex) {
      regexduedate.lastIndex++;
    }
    book.duedate = m[1];
    book.fine = m[2];
    if(m[3] === undefined) {
      book.renew = 0;
    }
    else {
      book.renew = m[3];
    }
  }
  return book
}