var logger = require('./logger')('pubgtracker.com')
var cloudscraper = require('cloudscraper')
var cheerio = require('cheerio')
var record = {}
var baseUrl = 'https://pubgtracker.com'

function get (playerName) {
  var url = baseUrl + '/profile/pc/' + playerName
  cloudscraper.get(url, function (error, response, body) {
    if (error) {
      logger.error('player `' + playerName + '` get `' + url + '`: ' + error)
      return
    }
    logger.debug('player `' + playerName + '` get `' + url + '`')
    var $ = cheerio.load(body)
    parse($, playerName)
  })
}

function parse ($, playerName) {
  $('script').each(function (i, elem) {
    var data = $(this).html() // https://github.com/cheeriojs/cheerio/issues/1050
    data = data.trim()
    if (data.startsWith('var playerData =')) {
      data = data.replace('var playerData =', '')
      if (data.endsWith(';')) {
        data = data.substring(0, data.length - 1)
      }
      record = JSON.parse(data)
      updateDocument()
    }
  })
}

function updateDocument () {
  logger.debug('record = ' + JSON.stringify(record, null, 2))
}

get('laipingyibao')
