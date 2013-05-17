'use strict';

// Module dependencies
var express = require('express')  
  , http = require('http')
  , path = require('path')
  , less = require('less')
  , passport = require('passport')
  , expressValidator = require('express-validator')
  , flash = require('connect-flash')
  ;

// Create app
var app = express();

// Import the data layer
var dbPath = 'mongodb://localhost/amdavad'
  , db = require('./db')(dbPath)
  ;

process.env.NODE_ENV = 'production';
console.log('\n\nenvironment', process.env.NODE_ENV);

// Seed Application DB

// var seed = require('./helpers/seed');

// Import route middleware

var loggedIn = require('./routes/middlewares').loggedIn
  , isAdmin = require('./routes/middlewares').isAdmin
  , activated = require('./routes/middlewares').activated
  ;

// Import required models

var models = {
    Product: require('./models/Product')
  , Category: require('./models/Category')
};

// Import the routes
var routes = {
    index: require('./routes')
  , user: require('./routes/user')
  , product: require('./routes/product')
  , txn: require('./routes/txn')
  , auth: require('./routes/auth')
};

// import admin routes
var admin = {
    product: require('./routes/admin/product')
  , category: require('./routes/admin/category')
  , user: require('./routes/admin/user')
  , txn: require('./routes/admin/txn')
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
  app.use(expressValidator);
  app.use(express.methodOverride());
  app.use(express.cookieParser('secretofthedarkhorse'));
  app.use(express.session());
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(flash());
  // add user to res.locals to make it available in layout.jade
  app.use(function (req, res, next) {
    app.locals.pretty = true;
    res.locals.user = req.user ? { 'email': req.user.email, 'name': req.user.name } : null;
    next();
  });  
  // middleware to pass products and category to all views 
  app.use(function categories (req, res, next) {
    models.Category.find({}).populate('products').exec(function (err, c) {
      res.locals.category = c;
      next();
    });
  });

  app.use(app.router);
  app.use(function (err, req, res, next){
    res.status(err.status || 500);
    res.render('500', { error: err });
  });

  app.use(require('less-middleware')({ src: __dirname + '/public' }));
  app.use(express.staticCache());
  app.use(express.compress({
    filter: function (req, res) {
      return /json|text|javascript|css/.test(res.getHeader('Content-Type'));
    },
    level: 9
  }));
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(function(req, res, next){
    res.status(404);
    // respond with html page
    if (req.accepts('html')) {
      res.render('404');
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
});

app.configure('development', function(){
  app.use(express.errorHandler());
});


// Locals (available inside all templates)

app.locals({
  title: 'TRADOHUB'
});

// Routes are defined here
app.get('/', routes.index.index);
app.get('/about', routes.index.about);
app.get('/about/:page', routes.index.pages);

// Product API routes
app.get('/products', routes.product.list);
app.get('/products/:url', routes.product.get);
app.get('/offers', routes.product.offers);


app.get('/quote', loggedIn, activated, routes.txn.quotePage);
app.get('/orders', loggedIn, activated, routes.txn.list);
app.get('/orders/:tid', loggedIn, activated, routes.txn.get);
app.post('/orders', loggedIn, activated, routes.txn.create);
app.post('/orders/:tid/bid', loggedIn, activated, routes.txn.updateBid);
app.get('/orders/:tid/pay', loggedIn, activated, routes.txn.bankPage);
app.post('/orders/:tid/pay', loggedIn, activated, routes.txn.updatePayInfo);
app.post('/orders/:tid/cancel', loggedIn, activated, routes.txn.cancel);
app.get('/orders/:tid/po', loggedIn, activated, routes.txn.poPage);

// Auth Routes

app.get('/login', routes.auth.loginPage);
app.get('/register', routes.auth.registerPage);
app.get('/forgot-password', routes.auth.passwordForgotPage);
app.get('/forgot-password/:token', routes.auth.passwordForgotCheck);
app.post('/forgot-password', routes.auth.passwordForgot);
app.get('/users/:id/verify/:token', routes.auth.verifyEmail);
app.get('/logout', routes.auth.logout);

app.post('/register', routes.user.create);
app.post('/login',
  passport.authenticate('local', { failureRedirect: '/login', failureFlash: 'Invalid email or password' }),
  function(req, res) {
    var redirectTo = req.session.redirectTo ? req.session.redirectTo : '/quote'; // redirecTo set in loggedIn middleware
    delete req.session.redirectTo; 
    res.redirect(redirectTo);
  });

// Account routes

app.get('/account', loggedIn, routes.user.accountPage);
app.post('/account', loggedIn, routes.user.updateAccount);
app.get('/account/password', loggedIn, routes.user.passwordPage);
app.post('/account/password', loggedIn, routes.user.updatePassword);

// Admin Routes
// TODO: Admin Checks

app.get('/admin/category', admin.category.list);
app.get('/admin/category/:url', admin.category.get);
app.post('/admin/category', admin.category.create);
app.put('/admin/category/:id', admin.category.update);

app.get('/admin/products', admin.product.list);
app.get('/admin/products/:url', admin.product.get);
app.post('/admin/products', admin.product.create);
app.put('/admin/products/:id', admin.product.update);
app.put('/admin/products/:id/image', admin.product.updateImage);
app.delete('/admin/products/:id', admin.product.remove);

app.get('/admin/orders', admin.txn.list);
app.get('/admin/orders/:tid', admin.txn.get);
app.post('/admin/orders/:tid/products/:pid/quote', admin.txn.updateQuote);
app.post('/admin/orders/:tid/shippingTerms', admin.txn.updateShippingTerms);
app.post('/admin/orders/:tid/paymentTerms', admin.txn.updatePaymentTerms);
app.post('/admin/orders/:tid/send', admin.txn.sendQuote);
app.delete('/admin/orders/:tid', admin.txn.remove);

app.get('/admin/users', admin.user.list);
app.get('/admin/users/:id', admin.user.get);
app.put('/admin/users/:id/:status', admin.user.updateStatus);

// Start server
http.createServer(app).listen(app.get('port'), function(){
  console.log("Server listening on port", app.get('port'));
});