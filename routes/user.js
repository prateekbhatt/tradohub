
/*
 * GET users listing.
 */

exports.list = function(req, res){
  res.send("respond with a resource");
};

exports.account = function(req, res){
	res.render('account', { 'user': req.user });
};