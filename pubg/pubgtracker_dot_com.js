var logger = require('./logger')('pubgtracker.com')
var cloudscraper = require('cloudscraper')
var cheerio = require('cheerio')
var mongodb = require('./mongodb')
var record = {}
var baseUrl = 'https://pubgtracker.com'

function get (playerName, doneCallback) {
  var url = baseUrl + '/profile/pc/' + playerName
  cloudscraper.get(url, function (error, response, body) {
    if (error) {
      logger.error('player `' + playerName + '` get `' + url + '`: ' + error)
      return
    }
    logger.debug('player `' + playerName + '` get `' + url + '`')
    var $ = cheerio.load(body)
    parse($, playerName, doneCallback)
  })
}

function parse ($, playerName, doneCallback) {
  $('script').each(function (i, elem) {
    var data = $(this).html() // https://github.com/cheeriojs/cheerio/issues/1050
    data = data.trim()
    if (data.startsWith('var playerData =')) {
      data = data.replace('var playerData =', '')
      if (data.endsWith(';')) {
        data = data.substring(0, data.length - 1)
      }
      record = JSON.parse(data)
      updateDocument(doneCallback)
    }
  })
}

function updateDocument (doneCallback) {
  // logger.debug('record = ' + JSON.stringify(record, null, 2))
  mongodb.updateDocument(record)
  doneCallback(record)
  record = {}
}

function scrape (docs) {
  if (docs.length === 0) {
    logger.info('done scrape')
    return
  }
  var item = docs[0]
  var playerName = item.PlayerName
  get(playerName, function () {
    scrape(docs.slice(1))
  })
}

module.exports = {
  get: get,
  scrape: scrape
}
