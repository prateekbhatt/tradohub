'use strict';

// Taken from: http://www.scotchmedia.com/tutorials/express/authentication/3/01

var mongoose = require('mongoose')
  , crypto = require('crypto')
  , Schema = mongoose.Schema
  , troop = require('mongoose-troop')
  ;

var UserToken;
//... code

// define the userTokenSchema
var userTokenSchema = new Schema({
 // We will be looking up the UserToken by uid and token so we need
 // to add and index to these properties to speed up queries.
 uid: {type: Schema.ObjectId, index: true},
 token: {type: String, index: true, unique: true}
});

// adds created and updated timestamps to the document
userTokenSchema.plugin(troop.timestamp, {modifiedPath: 'updated', useVirtual: false});

userTokenSchema.statics.new = function (uid, fn) {
 var user = new UserToken();
 // create a random string
 crypto.randomBytes(48, function (ex, buf) {
   // make the string url safe
   var token = buf.toString('base64').replace(/\//g, '_').replace(/\+/g, '-');
   // embed the uid in the token, and shorten it
   user.token = uid + '|' + token.toString().slice(1, 24);
   user.uid = uid;
   user.save(fn);
 });
};

UserToken = mongoose.model('UserToken', userTokenSchema);

module.exports = UserToken;