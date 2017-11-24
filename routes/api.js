var express = require('express');
var router = express.Router();

var api = require('../api');
api(router);

module.exports = router;
