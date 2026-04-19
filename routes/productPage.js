var express = require('express');
var router = express.Router();
var { DatabaseSync } = require('node:sqlite');

// GET productPage
router.get('/:listNo', function(req, res) {
  console.log("ss")
  const productId = req.params.listNo;
  const db = new DatabaseSync('./storedb.sqlite');
  const product = db.prepare('SELECT * FROM listings WHERE listNo = ?').get(productId);
  db.close();

  res.render('productPage', { product: product });
});

module.exports = router;
