var express = require('express');
var router = express.Router();
var { DatabaseSync } = require('node:sqlite');

/* GET home page. */
router.get('/', function(req, res, next) {
  const db = new DatabaseSync('./storedb.sqlite');
  const listings = db.prepare('SELECT * FROM listings').all();
  db.close()

  res.render('home', {...res.locals, listings});
});

router.post('/homePopulate', function(req, res, next) {
  const db = new DatabaseSync('./storedb.sqlite');
  var rows = db.prepare(`SELECT * FROM listings`).all();
  db.close();
  res.send(rows);
});

router.get('/order_history', function(req, res, next) {
  res.render('order_history', { title: 'Express' });
});

router.get('/checkout', function(req, res, next) {
  res.render('checkout', { title: 'Express' });
});

router.get('/productPage', function(req, res, next) {
  res.render('productPage.ejs', { title: 'Express' });
});

router.get('/add_item', function(req, res, next) {
  res.render('add_item', { title: 'Express' });
});

router.get('/profile', function(req, res, next) {
  res.render('update_profile', { title: 'Express' });
});

router.post('/createListing', function(req, res, next) {
  var listNo = 1;
  var listName = req.body.item_name;
  var listDesc = req.body.item_desc;
  var listImage = req.body.item_image;
  var listPrice = req.body.item_price;
  var listQuanity = req.body.item_quantity;
  var listSeller = "seller@wsu.edu";

  const db = new DatabaseSync('./storedb.sqlite');
  var row = db.prepare(`SELECT COUNT(*) FROM listings`).get();
  listNo = listNo + row["COUNT(*)"];

  db.prepare(`INSERT INTO listings (listNo, listName, listDesc, listImage, listPrice, listQuanity, listSeller)
  VALUES (?, ?, ?, ?, ?, ?, ?)`).run(listNo, listName, listDesc, listImage, listPrice, listQuanity, listSeller);
  console.log("Added listing " + listName);

  db.close();
  res.redirect('/');
})

module.exports = router;
