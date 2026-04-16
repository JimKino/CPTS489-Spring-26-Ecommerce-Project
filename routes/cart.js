var express = require('express');
var router = express.Router();
var sqlite = require('sqlite3').verbose();

const db = new sqlite.Database('./storedb.sqlite');

// GET cart
router.get('/', function(req, res) {
  res.render('cart');
});

module.exports = router;
