var express = require('express');
var router = express.Router();
var { DatabaseSync } = require('node:sqlite');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('home');
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

router.get('/update_profile', function(req, res, next) {
  res.render('update_profile', { title: 'Express' });
});

module.exports = router;
