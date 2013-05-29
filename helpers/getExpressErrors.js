'use strict';

// wrapper over express-validator , returns a single string error by concatanating
// all errors

module.exports = function getExpressErrors (req) {
  var errors = req.validationErrors();
  console.log(errors)
  if (errors && errors.length) {
    var e = [];
    for (var i in errors) {
      e.push(errors[i].msg);
    }
    return e.join(' | ');
  } else {
    return false;
  }
}