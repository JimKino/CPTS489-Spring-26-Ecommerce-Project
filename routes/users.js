var express = require('express');
var router = express.Router();
var { DatabaseSync } = require('node:sqlite');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/* GET users listing. */
router.get('/login', function(req, res, next) {
  res.render('index');
});

/* GET users listing. */
router.get('/register', function(req, res, next) {
  res.render('register');
});

router.get('/profile', function(req, res, next) {
  res.render('update_profile', { title: 'Express' });
});

//Registration
router.post('/add_user', function(req, res, next) {
  var fname = req.body.fname;
  var lname = req.body.lname;
  var email = req.body.email;
  var password = req.body.password;

  //open and close the database in each post call, dont leave connections open
  const db = new DatabaseSync('./storedb.sqlite');

  //The ? symbol is a variable filled out later by the run command
  //all values must be passed in through the run command
  db.prepare(`INSERT INTO accounts (actEmail, actPassword, actFname, actLname, actType)
    VALUES (?, ?, ?, ?, ?)`).run(email, password, fname, lname, "customer");
  console.log("Added user " + email);

  db.close();
  res.redirect('/users/login')
})

router.post('/get_user', function(req, res, next) {
  const db = new DatabaseSync('./storedb.sqlite');
  const user = db.prepare('SELECT * FROM accounts WHERE actEmail = ?').get(req.body.email);
  db.close();
  res.send(user);
})

router.post('/get_cards', function(req, res, next) {
  const db = new DatabaseSync('./storedb.sqlite');
  const rows = db.prepare('SELECT * FROM card WHERE cardOwner = ?').all(req.body.email);
  db.close();
  res.send(rows);
})

router.post('/update_pass', function(req, res, next) {
  const db = new DatabaseSync('./storedb.sqlite');
  const rows = db.prepare('UPDATE accounts SET actPassword = ? WHERE actEmail = ?').run(req.body.newPass, req.body.email);
  db.close();
  res.redirect('/users/profile');
})

router.post('/add_card', function(req, res, next){
  const db = new DatabaseSync('./storedb.sqlite');
  db.prepare(`INSERT INTO card (cardNo, cardName, cardExp, cardType, cardOwner)
    VALUES (?, ?, ?, ?, ?)`).run(req.body.cardNo, req.body.cardName, req.body.cardExp, req.body.cardType, req.body.email);
  db.close();
  res.redirect('/users/profile');
})

router.post('/delete_card/:cardName/:email', function(req, res, next) {
  const db = new DatabaseSync('./storedb.sqlite');
  db.prepare(`DELETE FROM card WHERE cardName = ? AND cardOwner = ?`).run(req.params.cardName, req.params.email);
  db.close();
  res.redirect('/users/profile');
});

//Log in
router.post('/login_user', function(req, res, next) {
  var email = req.body.email;
  var password = req.body.password;

  //open and close the database in each post call, dont leave connections open
  const db = new DatabaseSync('./storedb.sqlite');

  //get registration information
  const user = db.prepare('SELECT * FROM accounts WHERE actEmail = ? AND actPassword = ?').get(email, password);
  db.close();
  
  // Check
  if (user) { //success, login
    res.cookie('user', {
      email: user.actEmail,
      firstName: user.actFname,
      lastName: user.actLname,
      type: user.actType
    });

    if (user && user.email) {
      const db = new DatabaseSync('./storedb.sqlite');
      res.locals.userCart = db.prepare('SELECT cartList, cartQuanity FROM cart WHERE cartAct = ?').all(user.email);
      db.close();
    } else {
      res.locals.userCart = [];
    }

    res.redirect('/');
  } else { //failed
    res.render('index');
  }
})

//Log out
router.post('/logout_user', function(req, res, next) {
  res.clearCookie('user');
  res.redirect('/')
})

module.exports = router;
