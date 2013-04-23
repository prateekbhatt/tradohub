'use strict';
// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.

function gotoLogin (req, res) {
  res.format({
    html: function(){
      req.flash('error', 'Login to view page.')
      res.redirect('/login'); },
    json: function(){ res.json(401, { error: { message: 'Please login to proceed.'}}); }
  });
};

exports.ensureLogin = function ensureLogin (req, res, next) {
  if (req.isAuthenticated()) return next();
  gotoLogin(req, res);
};

exports.ensureAdmin =  function ensureAdmin (req, res, next) {
  // make sure the user is logged in.
  if (req.isAuthenticated()) {
    // make sure the user has role 'admin'
    if (req.user.hasRole('admin')) return next();
    return res.format({
      html: function(){ res.render('403'); },
      json: function(){ res.json(403, { error: { message: 'You don\'t have admin access.' }}); }
    });
  }
  gotoLogin(req, res);
};