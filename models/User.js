
module.exports = function (mongoose, passport) {
  // Dependencies
  var LocalStrategy = require('passport-local').Strategy
    , bcrypt = require('bcrypt')
    , SALT_WORK_FACTOR = 10;

  // User Schema
  var userSchema = mongoose.Schema({
      email: { type: String, required: true, unique: true }
    , password: { type: String, required: true }
    , accessToken: { type: String } // Used for Remember Me
  });

  // Bcrypt middleware
  userSchema.pre('save', function(next) {
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
  userSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
      if(err) return cb(err);
      cb(null, isMatch);
    });
  };

  // Remember Me implementation helper method
  userSchema.methods.generateRandomToken = function () {
    var user = this,
        chars = "_!abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890",
        token = new Date().getTime() + '_';
    for ( var x = 0; x < 16; x++ ) {
      var i = Math.floor( Math.random() * 62 );
      token += chars.charAt( i );
    }
    return token;
  };

  var User = mongoose.model('User', userSchema);

  // Seed a user
  User.findOne ({ email: 'prat' }, function (err, user) {
    if (!err) {
      var user1 = new User({ email: 'prat', password: 'p' });
      user1.save(function(err, user) {
        if(err) {
          console.log(err);
        } else {
          console.log('user: ' + user.email + ' is saved!');
        }
      });
    }
  });

  // Passport session setup.
  //   To support persistent login sessions, Passport needs to be able to
  //   serialize users into and deserialize users out of the session. Typically,
  //   this will be as simple as storing the user ID when serializing, and finding
  //   the user by ID when deserializing.
  //
  //   Both serializer and deserializer edited for Remember Me functionality
  passport.serializeUser(function(user, done) {
    console.log('SERIALIZING USER NOW!');
    var createAccessToken = function () {
      var token = user.generateRandomToken();
      User.findOne( { accessToken: token }, function (err, existingUser) {
        if (err) { return done( err ); }
        if (existingUser) {
          createAccessToken(); // Run the function again - the token has to be unique!
        } else {
          user.set('accessToken', token);
          user.save( function (err) {
            if (err) return done(err);
            return done(null, user.get('accessToken'));
          })
        }
      });
    };

    if ( user._id ) {
      createAccessToken();
    }
  });

  passport.deserializeUser(function(token, done) {
    User.findOne( {accessToken: token } , function (err, user) {
      done(err, user);
    });
  });

  // Use the LocalStrategy within Passport.
  //   Strategies in passport require a `verify` function, which accept
  //   credentials (in this case, a email and password), and invoke a callback
  //   with a user object.  In the real world, this would query a database;
  //   however, in this example we are using a baked-in set of users.
  passport.use(new LocalStrategy(function(email, password, done) {
    User.findOne({ email: email }, function(err, user) {
      console.log('USER FOUND YO');
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

  var register = function (registerObj, fn) {
    var email = registerObj.email
      , password = registerObj.password
      , confirmPassword = registerObj.confirmPassword;
    if (email && password && confirmPassword) {
      console.log('PASSWORD AND CONFIRM_PASSWORD MATCH\n');
      var user = new User({ email: email, password: password });
      user.save(function (err, user) {
        if (err) {
          return fn (err);
        } else {
          console.log('user: ' + user.email + ' is saved!');
          return fn (null, true);
        }
      });
    } else {
      return fn (new Error ('ERROR DURING USER REGISTRATION: ALL FORM FIELDS \
        ARE NOT PRESENT'));
    }
  }

  return {
    register: register
  }

};
