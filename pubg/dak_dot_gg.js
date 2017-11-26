var logger = require('./logger')('dak_dot_gg')
var superagent = require('superagent')
var Throttle = require('superagent-throttle')
var cheerio = require('cheerio')
var record = {}
var baseUrl = 'https://dak.gg'

var throttle = new Throttle({
  active: true,
  rate: 1,
  ratePer: 1000,
  concurrent: 1
})

function get (playerName) {
  var url = baseUrl + '/profile/' + playerName
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
  $('.userInfo .userData p span').each(function (i, elem) {
    record.lastUpdated = $(this).text()
  })
  record.stats = []
  var predefined = [
    '/2017-pre5/as/solo',
    '/2017-pre5/as/duo',
    '/2017-pre5/as/squad'
  ]
  predefined.forEach(function (item) {
    var link = '/profile/' + record.playerName + item
    var temp = item.split('/')
    var mode = temp[3]
    var season = temp[1]
    var region = temp[2]
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
      4: 'winRate',
      2: 'wins',
      19: 'killDeathRatio',
      14: 'kills',
      1: 'matches',
      8: 'top10Rate'
    }
    var keysRanks = {
      0: 'rating',
      1: 'rank'
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
      $('.ranks tbody tr td:first-of-type').each(function (i, item) {
        if (i in keysRanks) {
          data[keysRanks[i]] = $(this).text()
        }
      })
      $('.stats dl dd').each(function (i, item) {
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
