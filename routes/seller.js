var express = require('express');
var router = express.Router();
var { DatabaseSync } = require('node:sqlite');

//product list
router.get('/products', function(req, res) {
  const user = req.cookies.user;
  
  if (!user || !user.email || user.type !== 'seller') {
    return res.status(403).send('Forbidden - Seller access only');
  }
  
  const db = new DatabaseSync('./storedb.sqlite');
  const listings = db.prepare(
    'SELECT * FROM listings WHERE listSeller = ?'
  ).all(user.email);
  
  db.close();
  res.render('UC-011', {...res.locals, products: listings});
});

router.post('/products/:id/delete', function(req, res) {
  const user = req.cookies.user;
  
  if (!user || !user.email || user.type !== 'seller') {
    return res.status(403).send('Forbidden - Seller access only');
  }
  
  const productId = parseInt(req.params.id, 10);
  const db = new DatabaseSync('./storedb.sqlite');
  
  const product = db.prepare(
    'SELECT * FROM listings WHERE listNo = ? AND listSeller = ?'
  ).get(productId, user.email);
  
  if (!product) {
    db.close();
    return res.status(404).render('error', {
      message: 'Seller product not found',
      error: { status: 404, stack: '' }
    });
  }
  
  db.prepare('DELETE FROM listings WHERE listNo = ?').run(productId);
  
  db.close();
  res.redirect('/seller/products');
});

// Seller orders
router.get('/orders', function(req, res) {
  const user = req.cookies.user;
  
  if (!user || !user.email || user.type !== 'seller') {
    return res.status(403).send('Forbidden - Seller access only');
  }
  
  const db = new DatabaseSync('./storedb.sqlite');

  // Get seller orders
  const sellerOrders = db.prepare(`
    SELECT 
      o.rowid as orderId,
      l.listName as productName,
      a.actFname || ' ' || a.actLname as customerName,
      o.orderQuantity as quantity,
      o.orderDate as date
    FROM orders o
    JOIN listings l ON o.orderList = l.listNo
    JOIN accounts a ON o.orderAct = a.actEmail
    WHERE l.listSeller = ?
    ORDER BY o.orderDate DESC
  `).all(user.email);
  
  db.close();
  res.render('UC-012', { sellerOrders });
});

// Show edit listing form
router.get('/products/:id/edit', function(req, res) {
  const user = req.cookies.user;
  
  if (!user || !user.email || user.type !== 'seller') {
    return res.status(403).send('Forbidden - Seller access only');
  }
  
  const productId = parseInt(req.params.id, 10);
  const db = new DatabaseSync('./storedb.sqlite');
  
  const product = db.prepare(
    'SELECT * FROM listings WHERE listNo = ? AND listSeller = ?'
  ).get(productId, user.email);
  
  db.close();
  
  if (!product) {
    return res.status(404).render('error', {
      message: 'Product not found or you do not have permission to edit it',
      error: { status: 404, stack: '' }
    });
  }
  
  res.render('edit_item', { product, error: null });
});

// Update listing
router.post('/products/:id/edit', function(req, res) {
  const user = req.cookies.user;
  
  if (!user || !user.email || user.type !== 'seller') {
    return res.status(403).send('Forbidden - Seller access only');
  }
  
  const productId = parseInt(req.params.id, 10);
  const { name, price, desc, quantity, image } = req.body;
  
  if (!name || !price || !desc || !quantity) {
    const db = new DatabaseSync('./storedb.sqlite');
    const product = db.prepare('SELECT * FROM listings WHERE listNo = ?').get(productId);
    db.close();
    
    return res.render('edit_item', {
      product,
      error: 'All product fields are required.'
    });
  }
  
  const db = new DatabaseSync('./storedb.sqlite');
  
  const product = db.prepare(
    'SELECT * FROM listings WHERE listNo = ? AND listSeller = ?'
  ).get(productId, user.email);
  
  if (!product) {
    db.close();
    return res.status(404).render('error', {
      message: 'Product not found or you do not have permission to edit it',
      error: { status: 404, stack: '' }
    });
  }
  
  const duplicate = db.prepare(
    'SELECT * FROM listings WHERE listSeller = ? AND LOWER(listName) = LOWER(?) AND listNo != ?'
  ).get(user.email, name, productId);
  
  if (duplicate) {
    db.close();
    return res.render('edit_item', {
      product: { ...product, listName: name, listPrice: price, listDesc: desc, listQuantity: quantity },
      error: 'You already have a product with this name.'
    });
  }
  
  const listImage = image ? "/images/" + image : product.listImage;
  
  db.prepare(`
    UPDATE listings 
    SET listName = ?, listPrice = ?, listDesc = ?, listQuantity = ?, listImage = ?
    WHERE listNo = ?
  `).run(name, parseFloat(price), desc, parseInt(quantity, 10), listImage, productId);
  
  db.close();
  res.redirect('/seller/products');
});

module.exports = router;
