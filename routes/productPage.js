var express = require('express');
var router = express.Router();
var { DatabaseSync } = require('node:sqlite');

// GET productPage
router.get('/', function(req, res) {
  res.render('productPage');
});

router.post('/itemPopulate', function(req, res, next) {
  const db = new DatabaseSync('./storedb.sqlite');
  var rows = db.prepare(`SELECT * FROM listings WHERE listNo=?`).get(req.body.id);
  db.close();
  res.send(rows);
});

module.exports = router;
