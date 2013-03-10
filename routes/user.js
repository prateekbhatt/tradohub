'use strict';
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

  var logout = function (req, res) {
    req.logout();
    res.json(200, 'User logged out successfully');
  };

  // TODO : add checks, validations, errors such as check if user already exists
  // and if the passwords match etc.
  var registerPost = function (req, res, next) {
    var user = {
        email: req.body.email
      , password: req.body.password
      , confirmPassword: req.body.confirmPassword
    };
    User.addUser(user, function (err, isRegistered) {
      if (err) {
        console.log(err);
        res.json(500);
      }
      if (isRegistered) {
        res.json(400, new Error('User Not Registered. Check all input fields.'))
      }
       else {
        console.log ('User successfully registered');
        res.redirect (200);
      } 
    });    
  };

  /*
  * POST /password_rest
  */

  var passwordReset = function passwordReset (req, res) {
    req.onValidationError(function (msg) {
      //Redirect to `/password_rest` if email is bogus
      return res.redirect('/password_rest');
    });
    req.check('email', 'Please enter a valid email').len(1).isEmail();
    // get the user
    User.getUserByEmail(req.body.email, function (err, usr) {
      if (err) {
        // TODO return error
      }
      if (!usr) {
        // TODO return message if user is not found
      }
      // Create a token UserToken
      UserToken.new(usr._id, function (err, token) {
        // build the rest url:
        // http://localhost:3000/password_rest/12345TOKEN
        var resetUrl = req.protocol + '://' + req.host + '/password_rest/' + token.token;
        // Create the template vars 
        var locals = {
          resetUrl: resetUrl,
          // TODO confirm that the user has email prior to sending this.
          email: usr.email
        };
        mailer.sendOne(locals, function (err, respMs) {
          // TODO add success message.
          // redirect to password_rest success page.
          return req.redirect('/');
        });
      });
    });
  };

/*
* POST /password_rest/<token>
*
*/

var passwordResetCheck = function passwordResetCheck (req, res) {
  // Check for a UserToken using the supplied token.
  UserToken({token: req.params.token}, function (err, token) {
    if (err) {
      // TODO return error
    }
    if (!token) {
      // TODO return message if token is not found
    }
    // get the user
    User.findOne({_id: token.userId}, function (err, user) {
      if (err) {
        // TODO return error
      }
      if (!user) {
        // TODO return message if token is not found
      }
      // log the user in
      req.logIn(user, function (err) {
        if (err) {
          // TODO return error
        }
        // redirect the user to a password reset form
        return res.redirect('/account/password');
      });
    });
  });
};

  return {
      logout: logout
    , registerPost: registerPost
  }
}