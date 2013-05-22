'use strict';
// http://stackoverflow.com/questions/8986556/custom-user-friendly-validatorerror-message
// If it isn't a mongoose-validation error, just throw it.

module.exports = function (err, req, res, next){

  console.log('\n\ninside handleErrors')
  
  if (err.name == 'ValidationError') {
    var messages = {
      'required': "%s is required",
      'min': "%s below minimum",
      'max': "%s above maximum",
      'enum': "%s not an allowed value"
    };

    //A validationerror can contain more than one error.
    var errors = [];

    //Loop over the errors object of the Validation Error
    Object.keys(err.errors).forEach(function (field) {
      var eObj = err.errors[field];
      console.log('field', eObj)

      //If we don't have a message for `type`, just push the error through
      if (!messages.hasOwnProperty(eObj.type)) errors.push(eObj.type);

      //Otherwise, use util.format to format the message, and passing the path
      else errors.push(require('util').format(messages[eObj.type], eObj.path));
    });
   
    req.flash('error', errors.join(' | '));
    return res.redirect(req.path);

  } else if (err.name == 'MongoError' && (err.code == 11000 || err.code == 11001)) {
    if (req.path == '/register') {
      req.flash('error', 'Email address already exists. Use a different email.');
    } else {
      req.flash('error', err);
    }
    return res.redirect(req.path);
  }

  res.status(err.status || 500);
  res.render('500', { error: err });
}