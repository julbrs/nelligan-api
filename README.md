# Nelligan-api

JS lib that can interact with the [Nelligan Montral](http://nelligan.ville.montreal.qc.ca/)
book library system: list book on your card, check when you need to renew, renew books...
The Montreal system is based over the III Encore product so it might work with other systems
using same software.

## Getting Started

Import the lib in your project

```
npm install nelligan-api
```

Then start using it..

```
var api = require('nelligan-api')

# define your user library card
card = {
  code: '1277777',
  pin: '1234'
}

# list actual books on the card
api.books(card)
  .then(data => {
    console.log(data)
  })
  .catch((err) => {
    console.log(err)
  })
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
api.books(card)
  .then(data => {
    console.log(data)
  })
  .catch((err) => {
    console.log(err)
  })
```

### Get Book Information

Get additionnal book information (summary, isbn, img link)

``record`` is coming from ``book.record``.

```
api.bookinfo(record)
  .then(data => {
    console.log(data)
  })
  .catch((err) => {
    console.log(err)
  })
```

### Renew a book

Renew a specific book on a specific Card

``book``is coming from the first ``books`` query.
```
api.renew(card, book)
  .then(data => {
    console.log(data)
  })
  .catch((err) => {
    console.log(err)
  })
```

## Running the tests

No test yet. TODO

## Built With

* [Nelligan](http://nelligan.ville.montreal.qc.ca/) - The web site scrapped
* [Request](https://github.com/request/request) - To request queries
* [Cherioo](https://github.com/cheeriojs/cheerio) - To read the HTML


## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

