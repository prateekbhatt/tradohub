'use strict';

// Module dependencies
var express = require('express')  
  , http = require('http')
  , path = require('path')
  , less = require('less')
  , passport = require('passport')
  , expressValidator = require('express-validator')
  , flash = require('connect-flash')
  , config = require('config')
  , db = require('./db')
  , loadCategories = require('./helpers/loadCategories')
  , errorHelper = require('./helpers/errorHelper')
  , RedisStore = require('connect-redis')(express)
  ;


// configure redis session store for storing session data
var redisSessionStore = new RedisStore({
    host: config.redis.host
  , port: config.redis.port
  , no_ready_check: true
  , ttl: 60*60  // hour
});

// Create app
var app = express();

console.log('\n\nNode Environment: ', process.env.NODE_ENV);

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
  app.use(express.favicon(__dirname + '/public/img/favicon.ico', { maxAge: 2592000000 }));
  app.use(express.logger('dev'));
  app.use(express.limit('1mb'));
  app.use(express.bodyParser());
  app.use(expressValidator);
  app.use(express.methodOverride());
  app.use(express.cookieParser(config.cookieSecret));

  app.use(express.session({
      secret: config.sessionSecret
    , cookie: { maxAge: 1000*60*60 }
    , store: redisSessionStore
  }));
  
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(flash());
  // add user to res.locals to make it available in layout.jade
  app.use(function (req, res, next) {
    res.locals.staticFiles = config.staticFiles;
    res.locals.user = req.user ? { 'email': req.user.email, 'name': req.user.name } : null;
    res.locals.title = 'Buy polymers, plastics and metals of best quality at low prices in India : Tradohub.com';
    next();
  });
  // middleware to pass products and category to all views 
  app.use(loadCategories);

  app.use(app.router);

  app.use(errorHelper);

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
    console.log('\n\ninside err function 404')
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
    pretty: config.prettyHtml
});

// Routes are defined here
app.get('/', routes.index.index);
app.get('/about', routes.index.about);
app.get('/about/:page', routes.index.pages);
app.get('/partners', routes.index.partnersPage);
app.post('/contact', routes.index.contact);

// Product API routes
app.get('/products', routes.product.list);
app.get('/products/:url', routes.product.get);
// app.get('/offers', routes.product.offers);


app.get('/quote', loggedIn, activated, routes.txn.quotePage);
app.get('/orders', loggedIn, activated, routes.txn.list);
app.get('/orders/:tid', loggedIn, activated, routes.txn.get);
app.post('/orders', loggedIn, activated, routes.txn.create);
app.post('/orders/:tid/bank', loggedIn, activated, routes.txn.updateBank);
app.post('/orders/:tid/cancel', loggedIn, activated, routes.txn.cancel);
app.post('/orders/:tid/confirm', loggedIn, activated, routes.txn.confirm);
app.get('/orders/:tid/invoice', loggedIn, activated, routes.txn.invoicePage);

// Auth Routes

app.get('/login', routes.user.loginPage);
app.get('/register', routes.user.registerPage);
app.get('/forgot-password', routes.user.passwordForgotPage);
app.get('/forgot-password/:token', routes.user.passwordForgotCheck);
app.post('/forgot-password', routes.user.passwordForgot);
app.get('/verify-email/:token', routes.user.verifyEmail);
app.get('/logout', routes.user.logout);

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

app.get('/admin/category', isAdmin, admin.category.list);
app.get('/admin/category/:url', isAdmin, admin.category.get);
app.post('/admin/category', isAdmin, admin.category.create);
app.put('/admin/category/:id', isAdmin, admin.category.update);

app.get('/admin/products', isAdmin, admin.product.list);
app.get('/admin/products/:url', isAdmin, admin.product.get);
app.post('/admin/products', isAdmin, admin.product.create);
app.put('/admin/products/:id', isAdmin, admin.product.update);
app.put('/admin/products/:id/image', isAdmin, admin.product.updateImage);
app.delete('/admin/products/:id', isAdmin, admin.product.remove);

app.get('/admin/orders', isAdmin, admin.txn.list);
app.get('/admin/orders/:tid', isAdmin, admin.txn.get);
app.post('/admin/orders/:tid/products/:pid/quote', isAdmin, admin.txn.updateQuote);
// app.post('/admin/orders/:tid/shippingTerms', admin.txn.updateShippingTerms);
// app.post('/admin/orders/:tid/paymentTerms', admin.txn.updatePaymentTerms);
app.post('/admin/orders/:tid/send', isAdmin, admin.txn.sendQuote);
app.put('/admin/orders/:tid/:status', isAdmin, admin.txn.updateStatus);
app.delete('/admin/orders/:tid', isAdmin, admin.txn.remove);

app.get('/admin/users', isAdmin, admin.user.list);
app.get('/admin/users/:id', isAdmin, admin.user.get);
app.put('/admin/users/:id/:status', isAdmin, admin.user.updateStatus);

// Start server
http.createServer(app).listen(app.get('port'), function(){
  console.log("Server listening on port", app.get('port'));
});