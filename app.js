var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var { DatabaseSync } = require('node:sqlite');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var cartRouter = require('./routes/cart');
var searchRouter = require('./routes/search');
var productPageRouter = require('./routes/productPage');

var app = express();

const db = new DatabaseSync('./storedb.sqlite');

db.exec(`CREATE TABLE IF NOT EXISTS accounts (
  actEmail TEXT PRIMARY KEY,
  actPassword TEXT NOT NULL,
  actFname TEXT NOT NULL,
  actLname TEXT NOT NULL,
  actType TEXT NOT NULL )`);

db.exec(`CREATE TABLE IF NOT EXISTS card (
  cardNo TEXT NOT NULL,
  cardName TEXT NOT NULL,
  cardExp TEXT NOT NULL,
  cardType TEXT NOT NULL,
  cardOwner TEXT NOT NULL,
  FOREIGN KEY(cardOwner) REFERENCES accounts(actEmail) ON UPDATE CASCADE )`);

db.exec(`CREATE TABLE IF NOT EXISTS listings (
  listNo INTEGER PRIMARY KEY,
  listName TEXT NOT NULL,
  listDesc TEXT NOT NULL,
  listImage TEXT NOT NULL,
  listPrice REAL NOT NULL,
  listQuantity INTEGER NOT NULL,
  listSeller TEXT NOT NULL,
  FOREIGN KEY(listSeller) REFERENCES accounts(actEmail) ON UPDATE CASCADE )`);

db.exec(`CREATE TABLE IF NOT EXISTS orders (
  orderDate TEXT NOT NULL,
  orderQuanity INTEGER NOT NULL,
  orderList INTEGER NOT NULL,
  orderAct TEXT,
  FOREIGN KEY(orderList) REFERENCES listings(listNo) ON UPDATE CASCADE,
  FOREIGN KEY(orderAct) REFERENCES accounts(actEmail) ON UPDATE CASCADE )`);

db.exec(`CREATE TABLE IF NOT EXISTS cart (
  cartQuanity INTEGER NOT NULL,
  cartList INTEGER NOT NULL,
  cartAct TEXT NOT NULL,
  FOREIGN KEY(cartList) REFERENCES listings(listNo) ON UPDATE CASCADE,
  FOREIGN KEY(cartAct) REFERENCES accounts(actEmail) ON UPDATE CASCADE )`);

db.exec(`CREATE TABLE IF NOT EXISTS reviews (
  revRating INTEGER NOT NULL,
  revTitle TEXT,
  revDesc TEXT,
  revList INTEGER NOT NULL,
  revAct TEXT NOT NULL,
  FOREIGN KEY(revList) REFERENCES listings(listNo) ON UPDATE CASCADE,
  FOREIGN KEY(revAct) REFERENCES accounts(actEmail) ON UPDATE CASCADE )`);

//TESTING DEFAULT VALUES, comment out if duplicate data entires error
db.prepare(`INSERT INTO accounts (actEmail, actPassword, actFname, actLname, actType)
  VALUES (?, ?, ?, ?, ?)`).run("test@gmail.com", "password", "first", "last", "seller");
db.prepare(`INSERT INTO listings (listName, listDesc, listImage, listPrice, listQuantity, listSeller)
  VALUES (?, ?, ?, ?, ?, ?)`).run("Carrots", "Bundle of Carrots", "/images/Carrot.png", 0.99, 25, "test@gmail.com");

db.close();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// use cookies to keep track of user: currentUser
app.use((req, res, next) => {
  res.locals.currentUser = req.cookies.user || null;
  next();
});

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/cart', cartRouter);
app.use('/search', searchRouter);
app.use('/productPage', productPageRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
