module.exports = function (User) {
  'use strict';

  var logout = function (req, res) {
    req.logout();
    res.json(200, { success: { message: 'User logged out successfully' }});
  };

  // TODO : add checks, validations, errors such as check if user already exists
  // and if the passwords match etc.
  var register = function register (req, res, next) {
    var user = {
        email: req.body.email
      , password: req.body.password
      , confirmPassword: req.body.confirmPassword
      , roles: []
    };
    req.assert('email', 'Enter a valid email address.').isEmail().notEmpty();
    req.assert('password', 'Enter a valid password.').len(1,10);
    var errors =req.validationErrors();
    if (errors) {
      var message = [];
      for (var i in errors) {
        message.push(errors[i].msg)
      }
      res.json(401, { error: { message: message.join()}});
    }
    User.addUser(user, function (err, isRegistered) {
      if (err) {
        // console.log('INSIDE register err')
        console.log(err);
        // return res.json(500, { error: { message: 'Internal Server Error'}});
      }
      if (isRegistered) {
        console.log('INSIDE register isRegistered')
        res.json(200, { success: { message: 'User successfully registered' }});
      } else {
        console.log('INSIDE register after isRegistered')
        res.json(400, { error: { message: "User with same email exists." }});
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
    , register: register
  };
};