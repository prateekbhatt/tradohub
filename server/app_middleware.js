'use strict';

var express = require('express')
  , path = require('path')
  , less = require('less')
  , passport = require('passport')
  , expressValidator = require('express-validator')
  , flash = require('connect-flash')
  , config = require('config')
  , RedisStore = require('connect-redis')(express)
  , rootDir = __dirname + '/..'
  , loadCategories = require(rootDir + '/helpers/loadCategories')
  , errorHelper = require(rootDir + '/helpers/errorHelper')
  , viewsDir = rootDir + '/views'
  , publicDir = rootDir + '/public'
  , favicon = publicDir + '/img/favicon.ico'
  ;

module.exports = function (app) {

  // configure redis session store for storing session data
  var redisSessionStore = new RedisStore({
      host: config.redis.host
    , port: config.redis.port
    , no_ready_check: true
    , ttl: 60*60  // hour
  });

  // Config settings
  app.configure(function(){

    app.set('port', config.port);
    
    app.set('views', viewsDir);
    app.set('view engine', 'jade');
    
    app.use(express.favicon(favicon, { maxAge: 2592000000 }));
    
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
      res.locals.title = 'Tradohub | Buy polymers, plastics and metals of best quality at low prices in India';
      next();
    });
    
    // middleware to pass products and category to all views 
    app.use(loadCategories);

    app.use(app.router);

    app.use(errorHelper);

    app.use(require('less-middleware')({ src: publicDir }));

    app.use(express.staticCache());

    app.use(express.compress({
      filter: function (req, res) {
        return /json|text|javascript|css/.test(res.getHeader('Content-Type'));
      },
      level: 9
    }));

    app.use(express.static(publicDir));
    
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
}