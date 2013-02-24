// contains all the route functions for merchant dashboard

exports.index = function (req, res) {
  res.render('dashboard', { 'user': req.user });
};