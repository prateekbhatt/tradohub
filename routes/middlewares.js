'use strict';
// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.

function gotoLogin (req, res) {
  // keep the current path in session, and redirect to the current path after use logs in
  req.session.redirectTo = req.path;

  // if requesting for quote, show this message
  if (req.path == '/quote') {
    req.flash('error', 'You must login or create-account to request for quote.')
  } else {
    req.flash('error', 'Please login or create-account to continue.');    
  }
  res.redirect('/login');
};

exports.loggedIn = function loggedIn (req, res, next) {
  if (req.isAuthenticated()) return next();
  gotoLogin(req, res);
};

exports.hasRole = function hasRole (role) {

  return function(req, res, next) {
    // if user is logged in
    if (req.isAuthenticated()) {
      // if user has permissions
      if (req.user.hasRole(role)) return next();
      // else show forbidden error
      return res.render('403');
    } else {
      // redirect user to login page
      gotoLogin(req, res);
    }
  }

};

exports.activated = function activated (req, res, next) {
  var status = req.user.status;
  
  if (status == 'activated') return next();
  
  if (status == 'verified') {
    req.flash('error', 'We will activate your account after verifying your business. Please make sure you have provided the correct phone numbers.');
  } else if (status == 'notVerified') {
    req.flash('error', 'Please verify your email.');
  } else if (status == 'blocked') {
    req.flash('error', 'Your account has been blocked.');
  }
  res.redirect('/account');
};