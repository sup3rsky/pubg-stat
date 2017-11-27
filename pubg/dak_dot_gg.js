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
    '/2017-pre5/as/squad',
    '/2017-pre5/sea/solo',
    '/2017-pre5/sea/duo',
    '/2017-pre5/sea/squad'
  ]
  predefined.forEach(function (item) {
    var link = '/profile/' + record.playerName + item
    var temp = item.split('/')
    var season = temp[1]
    var region = temp[2]
    var mode = temp[3]
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
  record.matches = []
  predefined = [
    '/2017-pre5/as',
    '/2017-pre5/sea'
  ]
  predefined.forEach(function (item) {
    var link = '/profile/' + record.playerName + item + '/matches'
    var temp = item.split('/')
    var season = temp[1]
    var region = temp[2]
    record.matches.push({
      filter: '/' + season + '/' + region,
      data: {
        baseUrl: record.baseUrl,
        playerName: record.playerName,
        lastUpdated: record.lastUpdated,
        season: season,
        region: region,
        link: link
      }
    })
  })
  parseStats(record.stats)
}

function parseStats (stats) {
  if (stats.length === 0) {
    parseMatches(record.matches)
    return
  }
  var item = stats[0]
  var keys = {
    4: 'winRate',
    2: 'wins',
    19: 'killDeathRatio',
    14: 'kills',
    1: 'matches',
    7: 'top10s',
    8: 'top10Rate'
  }
  var keysRanks = {
    0: 'rating',
    1: 'rank'
  }
  var data = item.data
  var url = data.baseUrl + data.link
  superagent.get(url).use(throttle.plugin()).end(function (err, res) {
    if (err) {
      logger.error('player `' + record.playerName + '` get `' + url + '`: ' + err)
      parseStats(stats.slice(1))
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
    parseStats(stats.slice(1))
  })
}

function parseMatches (matches) {
  if (matches.length === 0) {
    updateDocument()
    return
  }
  var item = matches[0]
  var data = item.data
  var url = data.baseUrl + data.link
  superagent.get(url).use(throttle.plugin()).end(function (err, res) {
    if (err) {
      logger.error('player `' + record.playerName + '` get `' + url + '`: ' + err)
      parseMatches(matches.slice(1))
      return
    }
    logger.debug('player `' + record.playerName + '` get `' + url + '`')
    var $ = cheerio.load(res.text)
    data.matchHistory = []
    $('.matchList .matchHistory .item').each(function (i, item) {
      data.matchHistory.push({
        mode: $(this).find('.summary .modeName').eq(0).text().trim(),
        age: $(this).find('.summary .age').eq(0).text().trim(),
        result: $(this).find('.summary .result').eq(0).text().trim(),
        rating: $(this).find('.rating dd').eq(0).text().trim().split(/\s+/)[0],
        kills: $(this).find('.kills dd').eq(0).text().trim(),
        assists: $(this).find('.assists dd').eq(0).text().trim(),
        damage: $(this).find('.damage dd').eq(0).text().trim(),
        move: $(this).find('.move dd').eq(0).text().trim(),
        survived: $(this).find('.survived dd').eq(0).text().trim()
      })
    })
    parseMatches(matches.slice(1))
  })
}

function updateDocument () {
  logger.debug('record = ' + JSON.stringify(record, null, 2))
}

get('laipingyibao')
