
module.exports = function (User) {
  // var util = require('util');
  // console.log('User INSIDE user route: ' + util.inspect(User, false, null));
  // Remember Me middleware
  // var rememberme = function (req, res, next) {
  //   if ( req.method == 'POST' && req.url == '/login' ) {
  //     if ( req.body.rememberme ) {
  //       req.session.cookie.maxAge = 2592000000; // 30*24*60*60*1000 Rememeber 'me' for 30 days
  //     } else {
  //       req.session.cookie.expires = false;
  //     }
  //   }
  //   next();
  // };

  // var login = function (req, res) {
  //   res.render('login');
  // };

  var logout = function (req, res) {
    req.logout();
    res.json(200, 'User logged out successfully');
  };

  // var register = function (req, res) {
  //   res.render('register');
  // };


  // TODO : add checks, validations, errors such as check if user already exists
  // and if the passwords match etc.
  var registerPost = function (req, res, next) {
    console.log('INSIDE REGISTER POST');
    // for (var i in req.body) { console.log(i+' : '+req.body[i]); }
    var registerObj = {
        email: req.body.email
      , password: req.body.password
      , confirmPassword: req.body.confirmPassword
    };
    User.register(registerObj, function (err, registerSuccess) {
      if (err) {
        console.log ('ERROR WHILE REGISTERING USER' + err);
        res.redirect ('/register');
      } else {
        console.log ('User successfully registered');
        res.redirect ('/login');
      } 
    });
    
  };

  // Simple route middleware to ensure user is authenticated.
  //   Use this route middleware on any resource that needs to be protected.  If
  //   the request is authenticated (typically via a persistent login session),
  //   the request will proceed.  Otherwise, the user will be redirected to the
  //   login page.
  var ensureAuthenticated = function (req, res, next) {
    if (req.isAuthenticated()) {
      console.log('INSIDE isAuthenticated in user.js');
      return next();
    } else {
      res.redirect('/login');
    }
  };

  var isLoggedIn = function (req, res) {
    if (req.isAuthenticated()) {
      res.json(200, { user: { email: req.user.email, _id: req.user._id, isLoggedIn: true }});
    } else {
      res.json(401, { user: { email: null, _id: null, isLoggedIn: false }});
    }
  };

  return {
      // login: login
    // , register: register
      logout: logout
    , registerPost: registerPost
    , ensureAuthenticated: ensureAuthenticated
    , isLoggedIn: isLoggedIn
  }


}