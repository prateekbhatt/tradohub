module.exports = function (User) {
  'use strict';
  var errorHelper = require('../helpers/errorHelper');

  function create (req, res, next) {
    var user = {
        name: {
            first: req.body.name.first
          , last: req.body.name.last
        }
      , email: req.body.email
      , password: req.body.password
      , confirmPassword: req.body.confirmPassword
      , roles: []
    };

    User.create(user, function (err, isRegistered) {
      if (err) {
        if (err.name === 'ValidationError') {
          // console.log(err);
          return errorHelper(err, function(errors){
            console.log(errors)
            req.flash('error', errors.join(' | '))
            return res.redirect('/register')            
          })
        }
        return next(err);
      }
      if (isRegistered) {
        res.format({
          html: function(){
            req.flash('success', 'You have registered successfully.')
            res.redirect('/login');
          },
          json: function(){ res.json(200, { success: 'You have registered successfully.' }); }
        });
      } else {
        res.format({
          html: function(){
            req.flash('error', 'User with same email already exists.') ;
            res.redirect('/register');
          },
          json: function(){ res.json(400, { error: "User with same email already exists." }); }
        });
      }
    });
  };  

  return {
      create: create
  };
};