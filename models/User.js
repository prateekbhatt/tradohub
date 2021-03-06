'use strict';

// Dependencies
var validate = require('mongoose-validator').validate
  , mongoose = require('mongoose')
  , passport = require('passport')  
  , LocalStrategy = require('passport-local').Strategy
  , bcrypt = require('bcrypt')
  , SALT_WORK_FACTOR = 10
  , Schema = mongoose.Schema
  , troop = require('mongoose-troop')
  , async = require('async')
  ;

var emailValidator = [
    validate({message: "Email Address should be between 5 and 64 characters"},'len', 5, 64)
  , validate({message: "Email Address is not correct"},'isEmail')
];

var statusTypes = ['notVerified', 'verified', 'activated', 'blocked'];

// User Schema
var UserSchema = new Schema({
    email: { type: String, unique: true, lowercase: true, validate: emailValidator }
  , name: {
      first: { type: String, required: true }
    , last: {type: String, required: true }
  }
  , password: { type: String, required: true }
  , status: { type: String, required: true, enum: statusTypes }
  , roles: Array
  , company: {
      name: { type: String, required: true }
    , street: { type: String }
    , city: { type: String }
    , state: { type: String }
    , country: { type: String, required: true, default: 'IND' }
    , zip: { type: String }
    , industry: { type: String }
  }
  , mobile: { type: Number } // mobile number
  , landline: { // landline
      area: { type: Number } // area code
    , no: { type: Number } // number
  }
});

// adds created and updated timestamps to the document
UserSchema.plugin(troop.timestamp, {modifiedPath: 'updated', useVirtual: false});

// Bcrypt middleware
UserSchema.pre('save', function(next) {
  console.log('CREATING USER FOR: ' + this);
  var user = this;

  if(!user.isModified('password')) return next();

  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
    if(err) return next(err);

    bcrypt.hash(user.password, salt, function(err, hash) {
      if(err) return next(err);
      user.password = hash;
      next();
    });
  });
});

// Password verification
UserSchema.methods.comparePassword = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if(err) return cb(err);
    cb(null, isMatch);
  });
};

// Remember Me implementation helper method
UserSchema.methods.generateRandomToken = function () {
  var user = this,
      chars = "_!abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890",
      token = new Date().getTime() + '_';
  for ( var x = 0; x < 16; x++ ) {
    var i = Math.floor( Math.random() * 62 );
    token += chars.charAt( i );
  }
  return token;
};

UserSchema.methods.hasRole = function (role) {
  for (var i = 0; i < this.roles.length; i++) {
    if (this.roles[i] === role) {
      // if the role that we are chekign matches the 'role' we are
      // looking for return true
      return true;
    }
  };
  // if the role does not match return false
  return false;
};

// serialize sessions
passport.serializeUser(function(user, done) {
  done(null, user.id)
})

passport.deserializeUser(function(id, done) {
  User.findOne({ _id: id }, function (err, user) {
    done(err, user)
  })
})

// Use the LocalStrategy within Passport.
//   Strategies in passport require a `verify` function, which accept
//   credentials (in this case, a email and password), and invoke a callback
//   with a user object.  In the real world, this would query a database.
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  }, 
  function(email, password, done) {
  // console.log ("INSIDE Passport LocalStrategy: " + email + ' : ' + password);
  User.findOne({ email: email }, function(err, user) {
    if (err) { return done(err); }
    if (!user) { return done(null, false, { message: 'Unknown user ' + email }); }
    user.comparePassword(password, function(err, isMatch) {
      if (err) return done(err);
      if(isMatch) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Invalid password' });
      }
    });
  });
}));

var User = mongoose.model('User', UserSchema);

module.exports = User;