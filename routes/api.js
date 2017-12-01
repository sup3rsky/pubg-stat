var express = require('express');
var router = express.Router();

var api = require('../pubg/api');
api(router);

module.exports = router;
