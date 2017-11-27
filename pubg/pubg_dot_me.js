var logger = require('./logger')('pubg_dot_me')
var superagent = require('superagent')
var Throttle = require('superagent-throttle')
var cheerio = require('cheerio')
var record = {}
var baseUrl = 'https://pubg.me'

var throttle = new Throttle({
  active: true,
  rate: 1,
  ratePer: 1000,
  concurrent: 1
})

function get (playerName) {
  var url = baseUrl + '/player/' + playerName
  superagent.get(url).use(throttle.plugin()).end(function (err, res) {
    if (err) {
      logger.error('player `' + playerName + '` get `' + url + '`: ' + err)
      return
    }
    logger.debug('player `' + playerName + '` get `' + url + '`')
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
  var keys = {
    0: 'wins',
    1: 'matches',
    2: 'kills',
    3: 'timeSpentPlaying'
  }
  $('.profile-header-stats.d-flex.flex-column .stat .value').each(function (i, item) {
    if (i in keys) {
      record[keys[i]] = $(this).text()
    }
  })
  record.stats = []
  $('.dropdown-menu-profile-stats .dropdown-item.d-flex').each(function (i, item) {
    var link = $(this).attr('href')
    var key = link.replace('/player/' + record.playerName + '/', '')
    var temp = key.split('?')
    var mode = temp[0]
    var temp1 = temp[1].split('&')
    var season = temp1[0].replace('season=', '')
    var region = temp1[1].replace('region=', '')
    record.stats.push({
      filter: '/' + season + '/' + region + '/' + mode,
      data: {
        baseUrl: record.baseUrl,
        playerName: record.playerName,
        lastUpdated: record.lastUpdated,
        season: season,
        region: region,
        mode: mode,
        link: link
      }
    })
  })
  parseStats($)
}

function parseStats ($) {
  record.stats.filter(item => item.filter.startsWith('/2017-pre5')).forEach(function (item, index, array) {
    var keys = {
      0: 'rating',
      2: 'rank',
      3: 'winRate',
      4: 'wins',
      6: 'killDeathRatio',
      7: 'kills',
      9: 'matches',
      18: 'top10Rate',
      19: 'top10s'
    }
    var data = item.data
    var url = record.baseUrl + data.link
    superagent.get(url).use(throttle.plugin()).end(function (err, res) {
      if (err) {
        logger.error('player `' + record.playerName + '` get `' + url + '`: ' + err)
        return
      }
      logger.debug('player `' + record.playerName + '` get `' + url + '`')
      var $ = cheerio.load(res.text)
      $('.profile-stats-page .stat .value').each(function (i, item) {
        if (i in keys) {
          data[keys[i]] = $(this).text()
        }
      })
      if (index === array.length - 1) {
        logger.info('[parse] record = ' + JSON.stringify(record, null, 2))
      }
    })
  })
}

get('laipingyibao')
