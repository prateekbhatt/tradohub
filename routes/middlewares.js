'use strict';
// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
exports.ensureAuthenticated = function ensureAuthenticated (req, res, next) {
  if (req.isAuthenticated()) {
    // console.log('INSIDE isAuthenticated in user.js');
    return next();
  } else {
    res.json(401, { message: 'Please login to proceed.'});
  }
};

exports.isLoggedIn = function isLoggedIn (req, res) {
  if (req.isAuthenticated()) {
    res.json(200, { user: { email: req.user.email, _id: req.user._id, isLoggedIn: true, roles: req.user.roles }});
  } else {
    res.json(401, { user: { email: null, _id: null, isLoggedIn: false, roles: [] }});
  }
};

exports.ensureAdmin =  function ensureAdmin (req, res, next) {
  // make sure the user is logged in. 
  if (req.isAuthenticated()) {
    // make sure the user has role 'admin'
    req.user.hasRole('admin') ? next() : res.json(403, { error: { message: 'Forbidden' }});
  } else {
    res.json(401, { error: { message: 'Please login to proceed.'}});    
  }
};