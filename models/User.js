'use strict';

// Dependencies
var validate = require('mongoose-validator').validate
  , mongoose = require('mongoose')
  , passport = require('passport')  
  , LocalStrategy = require('passport-local').Strategy
  , bcrypt = require('bcrypt')
  , SALT_WORK_FACTOR = 10
  , Schema = mongoose.Schema
  ;

var emailValidator = [
    validate({message: "Email Address should be between 5 and 64 characters"},'len', 5, 64)
  , validate({message: "Email Address is not correct"},'isEmail')
];

var statusTypes = ['notVerified', 'verified']
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
    , country: { type: String, required: true }
    , zip: { type: String }
    , imex: { type: Schema.Types.ObjectId, ref: 'File' }
  }
});

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

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session. Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.
//
//   Both serializer and deserializer edited for Remember Me functionality
// passport.serializeUser(function(user, done) {
//   console.log('SERIALIZING USER NOW!');
//   var createAccessToken = function () {
//     var token = user.generateRandomToken();
//     User.findOne( { accessToken: token }, function (err, existingUser) {
//       if (err) { return done( err ); }
//       if (existingUser) {
//         createAccessToken(); // Run the function again - the token has to be unique!
//       } else {
//         user.set('accessToken', token);
//         user.save( function (err) {
//           if (err) return done(err);
//           return done(null, user.get('accessToken'));
//         })
//       }
//     });
//   };

//   if ( user._id ) {
//     createAccessToken();
//   }
// });

// passport.deserializeUser(function(token, done) {
//   User.findOne( {accessToken: token } , function (err, user) {
//     done(err, user);
//   });
// });


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
//   with a user object.  In the real world, this would query a database;
//   however, in this example we are using a baked-in set of users.
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

UserSchema.statics.updatePassword = function updatePassword (userId, password, fn) {
  User.findOne({ _id: userId }, function (err, user) {
    if (err) console.log(err);
    if (user) {
      user.password = password;
      user.save(function (err, updated) {
        fn(err, updated);
      });
    }
  });
};

UserSchema.methods.updateImex = function updateImex (fid, fn) {
  this.company.imex = fid;
  this.save(function (err, updated) {
    fn(err, updated);
  })
};

var User = mongoose.model('User', UserSchema);

module.exports = User;