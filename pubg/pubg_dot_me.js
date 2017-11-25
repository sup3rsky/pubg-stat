var logger = require('./logger')('pubg_dot_me')
var superagent = require('superagent')
var cheerio = require('cheerio')
var record = {}

function get (playerName) {
  superagent
    .get('https://pubg.me/player/' + playerName)
    .end(function (err, res) {
      if (err) {
        logger.error('player `' + playerName + '`: ' + err)
        return
      }
      var $ = cheerio.load(res.text)
      parse($)
    })
}

function parse ($) {
  $('.last-updated').each(function (i, elem) {
    record.lastUpdated = $(this).text()
  })
  logger.info('[parse] record = ' + JSON.stringify(record, null, 2))
}

get('Staver')
logger.info('[main] record = ' + JSON.stringify(record, null, 2))
