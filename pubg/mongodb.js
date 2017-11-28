var logger = require('./logger')('mongodb')
var MongoClient = require('mongodb').MongoClient

var url = 'mongodb://172.27.142.6:27017/pubg'

module.exports = {
  updateDocument: function (record) {
    var playerName = record.PlayerName
    MongoClient.connect(url, function (err, db) {
      if (err) {
        logger.error('player `' + playerName + '` save to `' + url + '`: ' + err)
        return
      }
      db.collection('playerData').replaceOne(
        {PlayerName: playerName},
        record,
        {upsert: true},
        function (error, result) {
          if (error) {
            logger.error('player `' + playerName + '` save to `' + url + '`: ' + error)
          }
          logger.info('player `' + playerName + '` updated: ' + result.result.nModified)
        })
      db.close()
    })
  },

  getPlayerList: function (callback) {
    MongoClient.connect(url, function (err, db) {
      if (err) {
        logger.error('getPlayerList from `' + url + '`: ' + err)
        return
      }
      db.collection('playerList').find().toArray(function (err, docs) {
        if (err) {
          logger.error('getPlayerList from `' + url + '`: ' + err)
          return
        }
        callback(docs)
      })
      db.close()
    })
  }
}
