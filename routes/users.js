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
    res.redirect('/');
  } else { //failed
    res.render('/users/login');
  }
})

//Log out
router.post('/logout_user', function(req, res, next) {
  res.clearCookie('user');
  res.redirect('/')
})

module.exports = router;
