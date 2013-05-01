'use strict';

exports.index = function (req, res) {
  res.format({
    html: function(){
      res.render ('index',
        { success: req.flash('success'), error: req.flash('error') });
    },
    json: function(){
      res.json(200, { message: 'Welcome to Tradohub!'});
    }
  });
};