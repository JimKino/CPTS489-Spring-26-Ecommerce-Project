var express = require('express');
var router = express.Router();
var { DatabaseSync } = require('node:sqlite');

// GET productPage
router.get('/:listNo', function(req, res) {
  const productId = req.params.listNo;
  const db = new DatabaseSync('./storedb.sqlite');
  const product = db.prepare('SELECT * FROM listings WHERE listNo = ?').get(productId);
  db.close();

  res.render('productPage', { product: product });
});

router.post('/itemPopulate', function(req, res, next) {
  const db = new DatabaseSync('./storedb.sqlite');
  var rows = db.prepare(`SELECT * FROM listings WHERE listNo=?`).get(req.body.id);
  db.close();
  res.send(rows);
});

router.post('/review', function(req, res, next) {
  const rating = req.body.rating;
  const title = req.body.title;
  const desc = req.body.desc;
  const id = req.body.id;
  const email = req.body.email;

  const db = new DatabaseSync('./storedb.sqlite');
  db.prepare(`INSERT INTO reviews (revRating, revTitle, revDesc, revList, revAct)
    VALUES (?, ?, ?, ?, ?)`).run(rating, title, desc, id, email);
  console.log("Added review");

  db.close();

  res.redirect(`/productPage/${id}`)
});

router.post('/getReviews', function(req, res, next) {
  const db = new DatabaseSync('./storedb.sqlite');
  var rows = db.prepare(`SELECT * FROM reviews WHERE revList=?`).all(req.body.id);
  db.close();
  res.send(rows);
});

module.exports = router;
