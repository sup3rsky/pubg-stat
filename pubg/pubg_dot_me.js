var logger = require('./logger')('pubg_dot_me')
var superagent = require('superagent')
var cheerio = require('cheerio')
var record = {}
var baseUrl = 'https://pubg.me'

function get (playerName) {
  superagent
    .get(baseUrl + '/player/' + playerName)
    .end(function (err, res) {
      if (err) {
        logger.error('player `' + playerName + '`: ' + err)
        return
      }
      var $ = cheerio.load(res.text)
      parse($, playerName)
    })
}

function parse ($, playerName) {
  record.baseUrl = baseUrl
  record.playerName = playerName
  $('.last-updated').each(function (i, elem) {
    record.lastUpdated = $(this).text()
  })
  $('.profile-header-stats.d-flex.flex-column .stat .value').each(function (i, item) {
    if (i === 0) {
      record.wins = $(this).text()
    } else if (i === 1) {
      record.matches = $(this).text()
    } else if (i === 2) {
      record.kills = $(this).text()
    } else if (i === 3) {
      record.timeSpentPlaying = $(this).text()
    }
  })
  record.stats = []
  $('.dropdown-menu-profile-stats .dropdown-item.d-flex').each(function (i, item) {
    record.stats.push($(this).attr('href'))
  })
  logger.info('[parse] record = ' + JSON.stringify(record, null, 2))
}

get('Gidroplan')
logger.info('[main] record = ' + JSON.stringify(record, null, 2))
