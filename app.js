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

// Seed Application DB

var seed = require('./helpers/seed');

// check mailer

// mailer.sendOne({email: 'prattbhatt@gmail.com', subject: 'testing tradohub email', text: 'tradohub email working'},
//   function(err, response) {
//     console.log(err, ' : ', response)
//   })

// Import route middleware

var ensureLogin = require('./routes/middlewares').ensureLogin
  , ensureAdmin = require('./routes/middlewares').ensureAdmin
  ;

// Import the routes
var routes = {
    index: require('./routes')
  , user: require('./routes/user')
  , product: require('./routes/product')
  , txn: require('./routes/txn')
  , auth: require('./routes/auth')
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
    res.locals.user = req.user ? { 'email': req.user.email } : null;
    next();
  });
  app.use(app.router);
  app.use(function(err, req, res, next){
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
  title: 'tradohub'
});

// Routes are defined here
app.get('/', routes.index.index);
app.get('/quote', ensureLogin, routes.txn.quote);

// Product API routes

app.get('/products', routes.product.list);
app.get('/products/:url', routes.product.get);

// Admin Routes
// TODO: Admin Checks
app.get('/admin/products', ensureAdmin, routes.product.adminList);
app.get('/admin/products/:url', ensureAdmin, routes.product.adminGet);
app.post('/admin/products', ensureAdmin, routes.product.create);
app.put('/admin/products/:id', ensureAdmin, routes.product.update);
app.delete('/admin/products/:id', ensureAdmin, routes.product.remove);

app.get('/orders', ensureLogin, routes.txn.list);
app.get('/orders/:tid', ensureLogin, routes.txn.get);
app.post('/orders', routes.txn.create);

app.get('/admin/orders', ensureAdmin, routes.txn.adminList);
app.get('/admin/orders/:tid', ensureAdmin, routes.txn.adminGet);
app.post('/admin/orders/:tid', ensureAdmin, routes.txn.updateQuote);
app.delete('/admin/orders/:tid', ensureAdmin, routes.txn.remove);
// Auth Routes

app.get('/login', routes.auth.login);
app.get('/register', routes.auth.register);
app.get('/forgot-password', routes.auth.passwordForgot);
app.get('/forgot-password/:token', routes.auth.passwordForgotCheck);
app.post('/forgot-password', routes.auth.passwordForgotPost);
app.get('/logout', routes.auth.logout);

app.post('/register', routes.user.create);
app.post('/login',
  passport.authenticate('local', { failureRedirect: '/login', failureFlash: 'Invalid email or password' }),
  function(req, res) {
    res.redirect('/quote');
  });

// Account routes

app.get('/account', ensureLogin, routes.user.accountPage);
app.get('/account/password', ensureLogin, routes.user.passwordPage);
app.post('/account/password', ensureLogin, routes.user.updatePassword);

// Start server
http.createServer(app).listen(app.get('port'), function(){
  console.log("Server listening on port " + app.get('port'));
});