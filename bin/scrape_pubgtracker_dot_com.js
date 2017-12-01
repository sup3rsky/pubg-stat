var logger = require('../pubg/logger')('scrape pubgtracker.com')
var mongodb = require('../pubg/mongodb')
var scrape = require('../pubg/pubgtracker_dot_com').scrape

logger.info('start scrape')
mongodb.getPlayerList(function (docs) {
  scrape(docs)
})
