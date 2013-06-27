'use strict';

var routesDir = '../routes/'
  , passport = require('passport')
  ;

// Import route middleware

var middleware = require(routesDir+'middleware')
  , loggedIn = middleware.loggedIn
  , hasRole = middleware.hasRole
  , activated = middleware.activated
  ;

// Import the routes
var routes = {
    index: require(routesDir)
  , user: require(routesDir + 'user')
  , product: require(routesDir + 'product')
  , txn: require(routesDir + 'txn')
};

// import admin routes
var admin = {
    product: require(routesDir + 'admin/product')
  , category: require(routesDir + 'admin/category')
  , user: require(routesDir + 'admin/user')
  , txn: require(routesDir + 'admin/txn')
  , email: require(routesDir + 'admin/email')
};

module.exports = function (app) {
  // Routes are defined here
  
  app.get('/', routes.index.index);
  app.get('/about', routes.index.about);
  app.get('/about/:page', routes.index.pages);
  app.get('/partners', routes.index.partnersPage);
  app.post('/contact', routes.index.contact);

  // Product API routes
  app.get('/products', routes.product.list);
  app.get('/products/:url', routes.product.get);


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
  app.post('/login', routes.user.postLogin);

  // Account routes

  app.get('/account', loggedIn, routes.user.accountPage);
  app.post('/account', loggedIn, routes.user.updateAccount);
  app.get('/account/password', loggedIn, routes.user.passwordPage);
  app.post('/account/password', loggedIn, routes.user.updatePassword);

  // Admin Routes
  // TODO: Admin Checks

  app.get('/admin/category', hasRole('admin'), admin.category.list);
  app.get('/admin/category/:url', hasRole('admin'), admin.category.get);
  app.post('/admin/category', hasRole('admin'), admin.category.create);
  app.put('/admin/category/:id', hasRole('admin'), admin.category.update);

  app.get('/admin/products', hasRole('admin'), admin.product.list);
  app.get('/admin/products/:url', hasRole('admin'), admin.product.get);
  app.post('/admin/products', hasRole('admin'), admin.product.create);
  app.put('/admin/products/:id', hasRole('admin'), admin.product.update);
  app.put('/admin/products/:id/image', hasRole('admin'), admin.product.updateImage);
  app.delete('/admin/products/:id', hasRole('admin'), admin.product.remove);

  app.get('/admin/orders', hasRole('admin'), admin.txn.list);
  app.get('/admin/orders/:tid', hasRole('admin'), admin.txn.get);
  app.post('/admin/orders/:tid/products/:pid/quote', hasRole('admin'), admin.txn.updateQuote);
  // app.post('/admin/orders/:tid/shippingTerms', admin.txn.updateShippingTerms);
  // app.post('/admin/orders/:tid/paymentTerms', admin.txn.updatePaymentTerms);
  app.post('/admin/orders/:tid/send', hasRole('admin'), admin.txn.sendQuote);
  app.put('/admin/orders/:tid/:status', hasRole('admin'), admin.txn.updateStatus);
  app.delete('/admin/orders/:tid', hasRole('admin'), admin.txn.remove);

  app.get('/admin/users', hasRole('admin'), admin.user.list);
  app.get('/admin/users/:id', hasRole('admin'), admin.user.get);
  app.put('/admin/users/:id/:status', hasRole('admin'), admin.user.updateStatus);

  app.get('/admin/invite', hasRole('invite'), admin.user.invitePage);
  app.post('/admin/invite', hasRole('invite'), admin.user.sendInvite);

  app.get('/admin/testEmail', hasRole('admin'), admin.email.testEmailPage);
  app.post('/admin/testEmail', hasRole('admin'), admin.email.sendTestEmail);
}