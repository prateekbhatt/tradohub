
// Module dependencies
var express = require('express')  
  , http = require('http')
  , path = require('path')
  , less = require('less')
  , passport = require('passport')
  , util = require('util');

// Create app
var app = express();

// Import the data layer
var mongoose = require('mongoose')
  , dbPath = 'mongodb://localhost/amdavad'
  , db = require('./db')(mongoose, dbPath)

// Import the models
var models = {
    User: require('./models/User')(mongoose, passport)
  , Product: require('./models/Product')(mongoose)
}

// Import the routes
var routes = {
    index: require('./routes')
  , user: require('./routes/user')(mongoose, models.User)
  , dashboard: require('./routes/dashboard')(models.Product)
}

// Config settings
app.configure(function(){
  app.set('port', process.env.PORT || 8000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.limit('1mb'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('secretofthedarkhorse'));
  app.use(express.session());
  // Remember me middleware
  // app.use(user.rememberme);
  // Initialize Passport!  Also use passport.session() middleware, to support
  // persistent login sessions (recommended).
  app.use(passport.initialize());
  app.use(passport.session());
  // add user to res.locals to make it available in layout.jade
  app.use(function(req, res, next){
    res.locals.user = req.user;
    next();
  });
  app.use(app.router);
  app.use(require('less-middleware')({ src: __dirname + '/public' }));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.use(function(req, res, next){
  res.status(404);
  
  // respond with html page
  if (req.accepts('html')) {
    res.render('404', { url: req.url });
    return;
  }

  // respond with json
  if (req.accepts('json')) {
    res.send({ error: 'Not found' });
    return;
  }

  // default to plain-text. send()
  res.type('txt').send('Not found');
});

// error-handling middleware, take the same form
// as regular middleware, however they require an
// arity of 4, aka the signature (err, req, res, next).
// when connect has an error, it will invoke ONLY error-handling
// middleware.

// If we were to next() here any remaining non-error-handling
// middleware would then be executed, or if we next(err) to
// continue passing the error, only error-handling middleware
// would remain being executed, however here
// we simply respond with an error page.

app.use(function(err, req, res, next){
  // we may use properties of the error object
  // here and next(err) appropriately, or if
  // we possibly recovered from the error, simply next().
  res.status(err.status || 500);
  res.render('500', { error: err });
});

// Locals (available inside all templates)

app.locals({
  title: 'Amdavad'
});

// console.log('PRINTING app.locals.user : '+app.locals.user);

// Routes are defined here

// app.all('*', function (req, res, next) {
//   app.locals.user = req.user;
//   console.log('INSIDE app.all set user printing title: '+app.locals['title']);
//   for (var i in app.locals) { console.log(i+' : '+app.locals.i); }
//   next();
// });
app.get('/', routes.index.index);
app.get('/register', routes.user.register);
app.get('/login', routes.user.login);
app.get('/dashboard', routes.user.ensureAuthenticated, routes.dashboard.index);
app.get('/products/:product_url?', routes.dashboard.products);
app.get('/rfq', routes.dashboard.rfq);
app.get('/logout', routes.user.logout);

app.post('/register', routes.user.registerPost);
app.post('/login',
  passport.authenticate('local', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/dashboard');
  });

// Start server
http.createServer(app).listen(app.get('port'), function(){
  console.log("Amdavad server listening on port " + app.get('port'));
});