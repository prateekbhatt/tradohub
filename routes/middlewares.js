'use strict';
// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
exports.ensureAuthenticated = function ensureAuthenticated (req, res, next) {
  // console.log(req.body)
  if (req.isAuthenticated()) {
    // console.log('INSIDE isAuthenticated in user.js');
    return next();
  } else {
    res.format({
      html: function(){
        req.flash('error', 'Login to view page.')
        res.redirect('/login'); },
      json: function(){ res.json(401, { error: { message: 'Please login to proceed.'}}); }
    });
  }
};

exports.isLoggedIn = function isLoggedIn (req, res) {
  if (req.isAuthenticated()) {
    res.json(200, { user: { email: req.user.email, _id: req.user._id, isLoggedIn: true, roles: req.user.roles }});
  } else {
    res.json(401, { error: { message: 'You are not logged in.' }});
  }
};

exports.ensureAdmin =  function ensureAdmin (req, res, next) {
  // make sure the user is logged in.
  if (req.isAuthenticated()) {
    // make sure the user has role 'admin'
    if (req.user.hasRole('admin')) {
      next();
    } else {
      res.format({
        html: function(){ res.render('403'); },
        json: function(){ res.json(403, { error: { message: 'You don\'t have admin access.' }}); }  
      });      
    }
  } else {
    res.format({
      html: function(){ res.redirect('/login'); },
      json: function(){ res.json(401, { error: { message: 'Please login as admin to proceed.'}}); }
    });
  }
};

exports.ensureApiAuth = function ensureApiAuth (req, res, next) {
  if (req.isAuthenticated()) {
    var userId = req.params.userId || null
      , sessionUserId = req.user ? req.user._id : null;
    if (userId && sessionUserId) {
      console.log('both userId and sessionUserId present : ' + userId +'  '+ typeof(userId) + ' : ' + sessionUserId + '  ' + typeof(sessionUserId))
      if (userId === sessionUserId.toString()) {
        console.log('userId and sessionUserId match!')
        return next();
      }
    } else if (req.user.hasRole('admin')) {
      console.log('user is signed in and is admin!')
      return next();
    }
  }
  res.json(403, { error: { message: 'Unauthorized to perform this action.'}});
};