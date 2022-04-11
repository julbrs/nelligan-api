# Nelligan-api

[![CI](https://github.com/julbrs/nelligan-api/actions/workflows/main.yml/badge.svg)](https://github.com/julbrs/nelligan-api/actions/workflows/main.yml)

JS lib that can interact with the [Nelligan Montral](http://nelligan.ville.montreal.qc.ca/)
book library system: list book on your card, check when you need to renew, renew books...
The Montreal system is based over the III Encore product so it might work with other systems
using same software.

## Getting Started

Import the lib in your project

```
yarn add nelligan-api
```

Then start using it..

```
const api = require('nelligan-api')

# define your user library card
card = {
  code: '1277777',
  pin: '1234'
}

# list actual books on the card
const books = await api.books(card)
```

Sample output:

```
{
  books:
   [ { title: 'Deception point : roman / Dan Brown ; traduit de l\'anglais (États-Unis) par Daniel Roche.',
       barcode: '32777041843371',
       duedate: '18-12-23',
       rid: 'renew0',
       rvalue: 'i3010099',
       record: 'b1421604',
       fine: undefined,
       renew: 0 }],
  fine: '0.60$ in unpaid fines and bills'
}
```
## API Methods

### List books on a card

Get list of book for a specific card
```
const books = await api.books(card)
```

### Get Book Information

Get additional information (summary, isbn, img link)

`record` is coming from `book.record`.

```
const book = await api.bookinfo(record)
```

### Renew a book

Renew a specific book on a specific Card

`book` is coming from the first `books` query.
```
const data = await api.renew(card, book)
```

### Get holds (reservations)

```
const books = await api.holds(card)
```

### Search books

```
const books = await api.search("a keywork expression")
```

### Reserve a book

```
const data = await api.reserve(card, record, library_code)
```

A `library_code` list is provided by `api.libraries`
## Running the tests

```
yarn test
```

## Built With

* [Nelligan](http://nelligan.ville.montreal.qc.ca/) - The web site scrapped
* [Axios](https://github.com/axios/axios) - To request queries
* [Cherioo](https://github.com/cheeriojs/cheerio) - To read the HTML


## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

