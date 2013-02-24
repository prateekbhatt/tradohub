
// Module dependencies

var express = require('express')
  , routes = require('./routes')
  , user_controller = require('./controllers/user_controller')
  , user = require('./routes/user')
  , dashboard = require('./routes/dashboard')
  , http = require('http')
  , path = require('path')
  , mongoose = require('mongoose')
  , passport = require('passport')
  , less = require('less');

// db settings using mongoose

mongoose.connect('localhost', 'amdavad');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback() {
  console.log('Connected to DB');
});

// Create app

var app = express();

// Config settings

app.configure(function(){
  app.set('port', process.env.PORT || 8000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('secretofthedarkhorse'));
  app.use(express.session());
  // Remember me middleware
  app.use(user.rememberme);
  // Initialize Passport!  Also use passport.session() middleware, to support
  // persistent login sessions (recommended).
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(require('less-middleware')({ src: __dirname + '/public' }));
  app.use(express.static(path.join(__dirname, 'public')));

});

app.configure('development', function(){
  app.use(express.errorHandler());
});

// Locals (available inside all templates)

app.locals({
  title: 'Amdavad'
});



// Routes
app.get('/', routes.index);
app.get('/register', user.register);
app.get('/login', user.login);
app.get('/dashboard', user.ensureAuthenticated, dashboard.index);
app.post('/register', user.registerPost);
app.post('/login',
  passport.authenticate('local', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/dashboard');
  });
app.get('/logout', user.logout);

// Start server

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});