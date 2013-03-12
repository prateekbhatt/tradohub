'use strict';
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
  , tree = require('mongoose-tree')
  , dbPath = 'mongodb://localhost/amdavad'
  , db = require('./db')(mongoose, dbPath);

// Import the models
var models = {
    User: require('./models/User')(mongoose, passport)
  , Product: require('./models/Product')(mongoose, tree)
  , Txn: require('./models/Txn')(mongoose)
  , Address: require('./models/Address')(mongoose)
  , UserToken: require('./models/UserToken')(mongoose)
};

// Seed Application DB

var seed = require('./models/seed')(models.Product, models.User, models.Address, models.Txn);

// Import route middleware

var isLoggedIn = require('./routes/middlewares').isLoggedIn
  , ensureAuthenticated = require('./routes/middlewares').ensureAuthenticated
  , ensureAdmin = require('./routes/middlewares').ensureAdmin
  , ensureApiAuth = require('./routes/middlewares').ensureApiAuth;

// Import the routes
var routes = {
    index: require('./routes')
  , user: require('./routes/user')(models.User)
  , productApi: require('./routes/productApi')(models.Product)
  , txnApi: require('./routes/txnApi')(models.Txn, models.Address)
  , addressApi: require('./routes/addressApi')(models.Address)
};

// Config settings
app.configure(function(){
  app.set('port', process.env.PORT || 8000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  // app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.limit('1mb'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('secretofthedarkhorse'));
  app.use(express.session());
  app.use(passport.initialize());
  app.use(passport.session());
  // add user to res.locals to make it available in layout.jade
  app.use(function (req, res, next) {
    res.locals.user = req.user;
    next();
  });
  app.use(app.router);
  app.use(require('less-middleware')({ src: __dirname + '/public' }));
  app.use(express.staticCache());
  app.use(express.compress({
    filter: function (req, res) {
      return /json|text|javascript|css/.test(res.getHeader('Content-Type'));
    },
    level: 9
  }));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.use(function(req, res, next){
  res.status(404);  
  // respond with html page
  if (req.accepts('html')) {
    res.render('index');
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

// Routes are defined here
app.get('/', routes.index.index);
app.get('/partials/:name', routes.index.partials);

// TODO : use regex
app.get('/register', routes.index.index);
app.get('/login', routes.index.index);
app.get('/products/:product_url?', routes.index.index);
app.get('/admin/products/:id?', routes.index.index);
app.get('/quote/:quoteId?', routes.index.index);
app.get('/orders/:id?', routes.index.index);

app.get('/logout', routes.user.logout);
app.get('/me', isLoggedIn);


// Product API routes

app.get('/api/products', routes.productApi.products);
app.get('/api/products/:product_url', routes.productApi.product)
// TODO: Admin Checks
app.post('/api/products', ensureAdmin, routes.productApi.addProduct);
app.put('/api/products/:id', ensureAdmin, routes.productApi.editProduct);
app.delete('/api/products/:id', ensureAdmin, routes.productApi.deleteProduct);

//Transaction API Routes

app.get('/api/txns', ensureAuthenticated, routes.txnApi.userTxns);
app.get('/api/txns/:txnId', ensureAuthenticated, routes.txnApi.userTxn);
app.post('/api/txns', ensureAuthenticated, routes.txnApi.addTxn);

// User API Routes

app.post('/register', routes.user.register);
app.post('/login',
  passport.authenticate('local', {}),
  function(req, res) {
    // console.log('PRINTING req.user: '+util.inspect(req.user));
    res.json(200, { email: req.user.email, _id: req.user._id, isLoggedIn: true, roles: req.user.roles });
  });

app.get('/api/users/:userId');

// Address API

app.get('/api/users/:userId/addresses', ensureApiAuth, routes.addressApi.userAddresses);
app.get('/api/users/:userId/addresses/:addressId', ensureApiAuth, routes.addressApi.userAddress);
app.post('/api/users/:userId/addresses', ensureApiAuth, routes.addressApi.addAddress);
app.put('/api/users/:userId/addresses/:addressId', ensureApiAuth, routes.addressApi.editAddress);
app.delete('/api/users/:userId/addresses/:addressId', ensureApiAuth, routes.addressApi.deleteAddress);

app.get('/api/users/:userId/txns', ensureApiAuth, routes.txnApi.userTxns);
app.get('/api/users/:userId/txns/:txnId', ensureApiAuth, routes.txnApi.userTxn);
app.post('/api/users/:userId/txns');
app.put('/api/users/:userId/txns/:txnId');
app.delete('/api/users/:userId/txns/:txnId');

// Start server
http.createServer(app).listen(app.get('port'), function(){
  console.log("Amdavad server listening on port " + app.get('port'));
});