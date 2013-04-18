module.exports = function (User, UserToken, sendMail) {
  'use strict';

  function login (req, res) {
    res.format({
      html: function(){
        res.render('partials/login', { error: req.flash('error'), success: req.flash('success') }); },
      json: function(){ res.json('Open page on browser to login.'); }
    });
  };

  function logout (req, res) {
    req.logout();
    res.format({
      html: function(){ 
        req.flash('success', 'You have been logged out.')
        res.redirect('/'); },
      json: function(){ res.json(200, { success: 'You have been logged out.' }); }
    });
  };

  function register (req, res) {
    res.format({
      html: function(){ res.render('partials/register', { error: req.flash('error') }); },
      json: function(){ res.json('Open page on browser to register.'); }
    });
  };

  function passwordForgot (req, res) {
    res.format({
      html: function(){ res.render('partials/forgot', { error: req.flash('error') }); },
      json: function(){ res.json('Open page on browser to reset password.')}
    });
  };
  
  /*
  * POST /password/forgot
  */

  function passwordForgotPost (req, res) {
    req.onValidationError(function (msg) {
      //Redirect to `/password/forgot` if email is bogus
      req.flash('error', msg);
      res.redirect('/password/forgot');
    });
    req.check('email', 'Please enter a valid email').len(1).isEmail();

    if (!req.validationErrors()) {
      // get the user
      User.getByEmail(req.body.email, function (err, usr) {
        if (err) {
          console.log(err);
        }
        if (!usr) {
          var msg = 'Email not found.'
          res.format({
            html: function() {
              req.flash('error', msg);
              res.redirect('/password/forgot');
            },
            json: function() { res.json(400, msg) }
          });
        } else {
          // Create a token UserToken
          UserToken.new(usr._id, function (err, token) {
            // build the reset url:
            // http://localhost:3000/password/forgot/12345TOKEN
            var resetUrl = req.protocol + '://' + req.host + '/password/forgot/' + token.token;
            // Create the template vars 
            var locals = {
                email: usr.email
              , subject: 'Forgot Password'
              , text: resetUrl
            };
            sendMail(locals, function (err, respMs) {
              // TODO add success message.
              // redirect to password_rest success page.
              req.flash('success', 'Check your Email to reset password')
              return res.redirect('/');
            });
          });        
        }
      });      
    }
  };

/*
* POST /password/forgot/<token>
* checks token, logs in user and redirects him to password reset page
*
*/

function passwordForgotCheck (req, res) {
  // Check for a UserToken using the supplied token.
  UserToken.findOne({token: req.params.token}, function (err, token) {
    if (err) { console.log(err); }
    if (!token) {
      req.flash('error', 'Invalid Token. Try Again.');
      res.redirect('/password/forgot');
    } else {
      // get the user
      console.log('token : ', token.userId)
      User.User.findOne({ _id: token.userId }, function (err, user) {
        if (err) { console.log(err); }
        if (!user) {
          req.flash('error', 'User Not Found. Try Again.');
          res.redirect('/password/forgot');
        } else {
          console.log('inside passwordForgotCheck UserToken', user)
          // log the user in
          req.logIn(user, function (err) {
            if (err) { console.log(err); }
            // redirect the user to a password reset form
            // remove all tokens of the user
            UserToken.remove({ userId: token.userId }).exec();
            return res.redirect('/account/password');
          });          
        }
      });      
    }
  });
};

  return {
      login: login
    , passwordForgot: passwordForgot
    , passwordForgotPost: passwordForgotPost
    , passwordForgotCheck: passwordForgotCheck
    , logout: logout
    , register: register
  };
};