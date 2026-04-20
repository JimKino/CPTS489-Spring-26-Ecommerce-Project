var express = require('express');
var router = express.Router();
var { DatabaseSync } = require('node:sqlite');

// GET search
router.get('/', function(req, res) {
   console.log("test")
   const searchTerm = req.query.q || '';
   const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice) : null;
   const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice) : null;
   const inStock = req.query.inStock === 'true';
   const db = new DatabaseSync('./storedb.sqlite');

   //find product from search, matching name or description
  let query = 'SELECT * FROM listings WHERE (listName LIKE ? OR listDesc LIKE ?)';
  let params = [`%${searchTerm}%`, `%${searchTerm}%`];
  
  //filters
  if (minPrice !== null) {
    query += ' AND listPrice >= ?';
    params.push(minPrice);
  }
  if (maxPrice !== null) {
    query += ' AND listPrice <= ?';
    params.push(maxPrice);
  }
  if (inStock) {
    query += ' AND listQuantity > 0';
  }

  //combine search with filters
   const listings = db.prepare(query).all(...params);

   res.render('search', { ...res.locals, listings, searchTerm, minPrice, maxPrice, inStock });
});

module.exports = router;
