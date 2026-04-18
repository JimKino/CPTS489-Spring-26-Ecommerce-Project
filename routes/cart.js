var express = require('express');
var router = express.Router();
var { DatabaseSync } = require('node:sqlite');

// GET cart
router.get('/', function(req, res) {
  res.render('cart');
});

module.exports = router;
