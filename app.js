'use strict';
// Module dependencies
var express = require('express')  
  , http = require('http')
  , path = require('path')
  , less = require('less')
  , passport = require('passport')
  , util = require('util')
  , expressValidator = require('express-validator')
  , flash = require('connect-flash')
  ;

// Create app
var app = express();

// Import the data layer
var mongoose = require('mongoose')
  , tree = require('mongoose-tree')
  , dbPath = 'mongodb://localhost/amdavad'
  , db = require('./db')(mongoose, dbPath)
  ;

// Import the models
var models = {
    User: require('./models/User')(mongoose, passport)
  , Product: require('./models/Product')(mongoose, tree)
  , Txn: require('./models/Txn')(mongoose)
  , UserToken: require('./models/UserToken')(mongoose)
};

// Seed Application DB

var seed = require('./helpers/seed')(models.Product, models.User, models.Txn);

// Helpers

var mailer = require('./helpers/mailer')
  , sendMail = mailer.sendOne
  , termsData = require('./helpers/termsData')
  , countryList = require('./helpers/countryList')
  ;

// check mailer

// mailer.sendOne({email: 'prattbhatt@gmail.com', subject: 'testing tradohub email', text: 'tradohub email working'},
//   function(err, response) {
//     console.log(err, ' : ', response)
//   })

// Import route middleware

var isLoggedIn = require('./routes/middlewares').isLoggedIn
  , ensureAuthenticated = require('./routes/middlewares').ensureAuthenticated
  , ensureAdmin = require('./routes/middlewares').ensureAdmin
  ;

// Import the routes
var routes = {
    index: require('./routes')
  , user: require('./routes/user')(models.User)
  , product: require('./routes/product')(models.Product)
  , txn: require('./routes/txn')(models.Txn, models.Product, termsData, countryList)
  , auth: require('./routes/auth')(models.User, models.UserToken, sendMail)
  , account: require('./routes/account')(models.User)
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
    // we may use properties of the error object
    // here and next(err) appropriately, or if
    // we possibly recovered from the error, simply next().
    
    console.log('\n\n ErroR was fouND. inside app.use ERR \n\n\n')
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
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

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


// Locals (available inside all templates)
app.locals({
  title: 'tradohub'
});

// Routes are defined here
app.get('/', routes.index.index);

app.get('/quote', ensureAuthenticated, routes.txn.quote);

app.get('/me', isLoggedIn);

// Product API routes

app.get('/products', routes.product.list);
app.get('/products/:product_url', routes.product.get);

// Admin Routes
// TODO: Admin Checks
app.get('/admin/products', ensureAdmin, routes.product.adminList);
app.get('/admin/products/:product_url', ensureAdmin, routes.product.adminGet);
app.post('/admin/products', ensureAdmin, routes.product.create);
app.put('/admin/products/:id', ensureAdmin, routes.product.update);
app.delete('/admin/products/:id', ensureAdmin, routes.product.remove);

app.get('/orders', ensureAuthenticated, routes.txn.listByUser);
app.get('/orders/:txnId', ensureAuthenticated, routes.txn.getByUser);
app.post('/orders', routes.txn.create);

app.get('/admin/orders', ensureAdmin, routes.txn.list);
app.get('/admin/orders/:txnId', ensureAdmin, routes.txn.get);
app.post('/admin/orders/:tid', ensureAdmin, routes.txn.updateQuote);

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
    res.format({
      html: function(){ res.redirect('/quote'); },
      json: function(){ res.json(200, { email: req.user.email, _id: req.user._id, isLoggedIn: true, roles: req.user.roles }); }
    });
  });

// Account routes

app.get('/account/password', ensureAuthenticated, routes.account.password);
app.post('/account/password', ensureAuthenticated, routes.account.updatePassword);

// Start server
http.createServer(app).listen(app.get('port'), function(){
  console.log("Amdavad server listening on port " + app.get('port'));
});