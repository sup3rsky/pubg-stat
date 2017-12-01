var logger = require('./logger')('dbpool')
var assert = require('assert')
var MongoClient = require('mongodb').MongoClient

var url = 'mongodb://172.27.142.6:27017/pubg'

var pool = {}

MongoClient.connect(url, { poolSize: 10 }, function (err, db) {
  assert.equal(null, err)
  pool.mongodb = db
  logger.info('pool.mongodb initialized with `' + url + '`')
})

module.exports = pool
