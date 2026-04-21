var express = require('express');
var router = express.Router();
var { DatabaseSync } = require('node:sqlite');

// GET cart
router.get('/', function(req, res) {
  const db = new DatabaseSync('./storedb.sqlite');
  const userEmail = res.locals.currentUser ? res.locals.currentUser.email : null;

  //get products in cart and their prices
  const cartData = db.prepare(`
    SELECT * FROM cart JOIN listings ON cart.cartList = listings.listNo WHERE cart.cartAct = ?`).all(userEmail);
  
  // calculate subtotal
  const subtotal = cartData.reduce((total, item) => {return total + (item.listPrice * item.cartQuanity);}, 0);

  db.close();

  res.render('cart', { ...res.locals, cart: cartData, subtotal: subtotal.toFixed(2) });
});

router.get('/checkout', function(req, res, next) {
  const db = new DatabaseSync('./storedb.sqlite');
  const userEmail = res.locals.currentUser ? res.locals.currentUser.email : null;

  //get products in cart and their prices
  const cartData = db.prepare(`
  SELECT * FROM cart JOIN listings ON cart.cartList = listings.listNo WHERE cart.cartAct = ?`).all(userEmail);

  const cards = db.prepare(`SELECT * FROM card WHERE cardOwner = ?`).all(userEmail);
  // calculate subtotal
  const subtotal = cartData.reduce((total, item) => {return total + (item.listPrice * item.cartQuanity);}, 0);

  db.close();

  res.render('checkout', { ...res.locals, cart: cartData, cards: cards , subtotal: subtotal.toFixed(2) });
});

router.post('/doCheckout', function(req, res) {
  const db = new DatabaseSync('./storedb.sqlite');
  const userEmail = res.locals.currentUser ? res.locals.currentUser.email : null;
  var date = new Date();
  //JS 0 indexes months for some reason
  var month = date.getMonth()+1;

  const cartData = db.prepare(`SELECT * FROM cart WHERE cartAct = ?`).all(userEmail);
  if(cartData.length > 0)
  {
    for(let i = 0; i < cartData.length; i++)
    {
      const listing = db.prepare(`SELECT * FROM listings WHERE listNo = ?`).get(cartData[i].cartList);
      var newQuant = listing.listQuantity - cartData[i].cartQuanity;
      db.prepare('UPDATE listings SET listQuantity = ? WHERE listNo = ?').run(newQuant, cartData[i].cartList);
      db.prepare('INSERT INTO orders (orderDate, orderQuanity, orderList, orderAct) VALUES (?, ?, ?, ?)')
      .run(month + "-" + date.getDate() + "-" + date.getFullYear(), cartData[i].cartQuanity, cartData[i].cartList, userEmail);
    }

    db.prepare('DELETE FROM cart WHERE cartAct = ?').run(userEmail);
  }
  res.redirect('/');
});

//add to cart
router.post('/add', (req, res) => {
  const db = new DatabaseSync('./storedb.sqlite');
  const { productId } = req.body;

  //check if logged in
  const userEmail = res.locals.currentUser ? res.locals.currentUser.email : null

  if (!userEmail) {
      return res.redirect('/users/login');
  }

  const stockInfo = db.prepare(`
    SELECT l.listQuantity AS availableStock, IFNULL(c.cartQuanity, 0) AS currentInCart
    FROM listings l LEFT JOIN cart c ON l.listNo = c.cartList AND c.cartAct = ? WHERE l.listNo = ?
    `).get(userEmail, productId);

    // check if no more in stock
    if (stockInfo && stockInfo.currentInCart + 1 > stockInfo.availableStock) {
      db.close();
    }

    // add to cart
    if (stockInfo && stockInfo.currentInCart > 0) {
      //item already in cart, add one more  
      db.prepare('UPDATE cart SET cartQuanity = cartQuanity + 1 WHERE cartList = ? AND cartAct = ?').run(productId, userEmail); 
    } else {
      //add one to cart
      db.prepare('INSERT INTO cart (cartQuanity, cartList, cartAct) VALUES (?, ?, ?)').run(1, productId, userEmail);
    }

  db.close();
  res.redirect('/cart');
});

//update
router.post('/update', (req, res) => {
    const db = new DatabaseSync('./storedb.sqlite');
    const { productId, quantity } = req.body;
    //check if logged in
    const userEmail = res.locals.currentUser ? res.locals.currentUser.email : null

    if (!userEmail) {
        return res.redirect('/users/login');
    }

    // check stock of product
    const stock = db.prepare('SELECT listQuantity FROM listings WHERE listNo = ?').get(productId);
    
    if (stock && parseInt(quantity) <= stock.listQuantity) {
      db.prepare('UPDATE cart SET cartQuanity = ? WHERE cartList = ? AND cartAct = ?').run(quantity, productId, userEmail);
    }

    db.close();
    res.redirect('/cart');
});

//remove item from cart
router.post('/remove', (req, res) => {
  const db = new DatabaseSync('./storedb.sqlite');
  const { productId } = req.body;
  //check if logged in
  const userEmail = res.locals.currentUser ? res.locals.currentUser.email : null

  if (!userEmail) {
      return res.redirect('/users/login');
  }

  // remove item
  const statement = db.prepare('DELETE FROM cart WHERE cartList = ? AND cartAct = ?');
  statement.run(productId, userEmail);

  db.close();
  
  res.redirect('/cart'); 
});

//remove all items from cart


module.exports = router;
