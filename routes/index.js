'use strict';

exports.index = function (req, res) {
  res.format({
    html: function(){
      // req.flash('success', 'Welcome!')
      res.render ('partials/index', { success: req.flash('success'), error: req.flash('error') });
    },
    json: function(){
      res.json(200, { message: 'Welcome to Amdavad !'});
    }
  });
};

// exports.partials = function (req, res) {
//   var name = req.params.name;
//   res.render ('partials/' + name);
// };