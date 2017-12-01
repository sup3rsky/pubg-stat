var logger = require('./logger')('api')
var assert = require('assert')
var pool = require('./dbpool')
var trackerGet = require('./pubgtracker_dot_com').get
var parse = require('date-fns/parse')
var differenceInSeconds = require('date-fns/difference_in_seconds')

function getUserDataFromTracker (userId, callback) {
  logger.debug('calling getUserDataFromTracker')

  trackerGet(userId, function (record) {
    callback(record)
  })
}

function getUserDataFromCache (userId, callback) {
  logger.debug('calling getUserDataFromCache')

  var cursor = pool.mongodb.collection('playerData')
    .find({PlayerName: userId})

  cursor.hasNext(function (err, exist) {
    assert.equal(err, null)
    assert.equal(exist, true)
    cursor.next(function (err, r) {
      assert.equal(err, null)
      callback(r)
    })
  })
}

function sendResponse (code, result, req, res) {
  var resultJSON = {
    code: code,
    data: result
  }
  if (req.query.callback) {
    res.send(req.query.callback + '(' + JSON.stringify(resultJSON) + ')')
  } else {
    res.jsonp(resultJSON)
  }
}

module.exports = function (router) {
  logger.info('setup api')

  router.use(function (req, res, next) {
    logger.debug('got an api request: ' + req.method + ' ' + req.originalUrl)
    next()
  })

  router.param('user_id', function (req, res, next, id) {
    logger.debug('check user_id: ' + id)

    var cursor = pool.mongodb.collection('playerData')
      .find({PlayerName: id})
      .project({PlayerName: 1, LastUpdated: 1})

    cursor.hasNext(function (err, exist) {
      if (err) {
        logger.error(err)
        return
      }
      req.user_id = id
      req.exist = exist
      if (exist) {
        cursor.next(function (err, r) {
          assert.equal(err, null)
          req.LastUpdated = r.LastUpdated
        })
      } else {
        req.LastUpdated = null
      }
      next()
    })
  })

  router.route('/pubg/users/:user_id').get(function (req, res, next) {
    logger.debug('user_id = ' + req.user_id)
    logger.debug('exist = ' + req.exist)
    logger.debug('LastUpdated = ' + req.LastUpdated)
    if (!req.exist || !req.LastUpdated) {
      getUserDataFromTracker(req.user_id, function (result) {
        sendResponse(0, result, req, res)
      })
    } else {
      var lastUpdatedDate = parse(req.LastUpdated)
      var diff = differenceInSeconds(new Date(), lastUpdatedDate)
      logger.debug('diff of current date and lastUpdatedDate: ' + diff)
      if (diff > 3600) {
        getUserDataFromTracker(req.user_id, function (result) {
          sendResponse(0, result, req, res)
        })
      } else {
        getUserDataFromCache(req.user_id, function (result) {
          sendResponse(0, result, req, res)
        })
      }
    }
  })
}
