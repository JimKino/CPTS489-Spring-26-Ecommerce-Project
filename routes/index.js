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
  const db = new DatabaseSync('./storedb.sqlite');
  const userEmail = res.locals.currentUser ? res.locals.currentUser.email : null;

  const orders = db.prepare(`
  SELECT * FROM orders JOIN listings ON orders.orderList = listings.listNo WHERE orders.orderAct = ?`).all(userEmail);

  db.close();

  res.render('order_history', { ...res.locals, orders: orders });
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
  var listName = req.body.name;
  var listDesc = req.body.desc;
  var listImage = req.body.image;
  var listPrice = req.body.price;
  var listQuantity = req.body.quantity;
  var listSeller = req.body.email;

  const db = new DatabaseSync('./storedb.sqlite');
  var row = db.prepare(`SELECT COUNT(*) FROM listings`).get();
  listNo = listNo + row["COUNT(*)"];

  try{
  db.prepare(`INSERT INTO listings (listNo, listName, listDesc, listImage, listPrice, listQuantity, listSeller)
  VALUES (?, ?, ?, ?, ?, ?, ?)`).run(listNo, listName, listDesc, "/images/" + listImage, listPrice, listQuantity, listSeller);
  console.log("Added listing " + listName);
  }
  catch (e) {
    console.log(e);
  }
  
  db.close();
  res.redirect('/');
});

module.exports = router;
