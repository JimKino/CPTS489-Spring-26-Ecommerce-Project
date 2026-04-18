var express = require('express');
var router = express.Router();
var { DatabaseSync } = require('node:sqlite');

// GET productPage
router.get('/', function(req, res) {
  res.render('productPage');
});

module.exports = router;
