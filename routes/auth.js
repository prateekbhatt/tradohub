
/*
 * GET login page
 */

exports.login = function (req, res) {
  res.render('login');
};

exports.logout = function (req, res) {
  req.logout();
  res.redirect('/');
};

exports.register = function (req, res) {
  
}

exports.ensureAuthenticated = function (req, res, next) {
  if (req.isAuthenticated()){
    return next();
  } else {
    res.redirect('/login');
  }
};