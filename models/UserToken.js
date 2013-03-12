module.exports = function (mongoose) {
  'use strict';

  // Taken from: http://www.scotchmedia.com/tutorials/express/authentication/3/01

  var crypto = require('crypto')
    , Schema = mongoose.Schema;

  var UserToken;
  //... code

  // define the userTokenSchema
  var userTokenSchema = new Schema({
   // We will be looking up the UserToken by userId and token so we need
   // to add and index to these properties to speed up queries.
   userId: {type: Schema.ObjectId, index: true},
   token: {type: String, index: true}
  });

  userTokenSchema.statics.new = function (userId, fn) {
   var user = new UserToken();
   // create a random string
   crypto.randomBytes(48, function (ex, buf) {
     // make the string url safe
     var token = buf.toString('base64').replace(/\//g, '_').replace(/\+/g, '-');
     // embed the userId in the token, and shorten it
     user.token = userId + '|' + token.toString().slice(1, 24);
     user.userId = userId;
     user.save(fn);
   });
  };

  UserToken = mongoose.model('UserToken', userTokenSchema);

  return UserToken;
}