var express = require('express');
var router = express.Router();

// GET productPage
router.get('/', function(req, res) {
  res.render('productPage');
});

module.exports = router;