var mongoose = require('mongoose')
    , user_controller = require('../controllers/user_controller')
    , userSchema = user_controller.userSchema;


// Remember Me middleware
exports.rememberme = function (req, res, next) {
  if ( req.method == 'POST' && req.url == '/login' ) {
    if ( req.body.rememberme ) {
      req.session.cookie.maxAge = 2592000000; // 30*24*60*60*1000 Rememeber 'me' for 30 days
      // console.log('INSIDE rememberme: '+req+'\n\n');
      // for (var i in req.session.cookie) {
      //   console.log(i+' : '+req.session.cookie[i]);
      // }
    } else {
      req.session.cookie.expires = false;
    }
  }
  next();
};

exports.login = function (req, res) {
  res.render('login', { 'user': req.user });
};

exports.logout = function (req, res) {
  req.logout();
  res.redirect('/');
};

exports.register = function (req, res) {
  res.render('register', { 'user': req.user });
};

exports.registerPost = function (req, res, next) {
  console.log('INSIDE REGISTER POST');
  for (var i in req.body) { console.log(i+' : '+req.body['email']); }
  if (req.body['email'] && req.body['password'] && req.body['confirmPassword']) {
    console.log('PASSWORD AND CONFIRM_PASSWORD MATCH\n');
    var user = new user_controller.userModel({ email: req.body['email'], password: req.body['password'] });
    user.save(function (err, user) {
      if (err) {
        console.log(err);
        res.redirect('/register');
      } else {
        console.log('user: ' + user.email + ' is saved!');
        res.redirect('/login');
      }
    });
  } else {
    console.log('ERROR DURING REGISTRATION');
    res.redirect('/register');
  }
};

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
exports.ensureAuthenticated = function (req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect('/login');
  }
};