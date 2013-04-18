module.exports = function (Txn, Product, termsData, countryList) {
  'use strict';

  // Renders the request for quote page

  function quote (req, res) {
    Product.list(function (err, products) {
      res.format({
        html: function(){
          res.locals.products = products;
          res.locals.paymentTerms = termsData.paymentTerms;
          res.locals.shippingTerms = termsData.shippingTerms;
          res.locals.originCountries = termsData.originCountries;
          res.locals.countryList = countryList;
          res.locals.reqDue = termsData.reqDue;
          res.render('partials/quote', { error: req.flash('error'), success: req.flash('success') });
        },
        json: function(){ res.json('Make a request for quote by opening this page on your browser.')}
      });
    })
  };

  function get (req, res) {
    var txnId = req.params.txnId;
    Txn.get(txnId, function (err, txn) {
      if (err) { console.log(err); }
      if (txn) {
        res.format({
          html: function(){
            res.locals.txn = txn;
            res.render('partials/admin/txn');
          },
          json: function(){ res.json(200, txn); }
        });
      } else {
        res.format({
          html: function(){ res.render('404'); },
          json: function(){ res.json(404, { error: { message: 'Txn Not Found'}}); }
        });
      }
    });
  };
  
  function list (req, res) {
    Txn.list(function (err, txns) {
      if (err) { console.log(err); }
      if (txns) {
        res.format({
          html: function(){
            res.locals.txns = txns;
            res.render('partials/admin/txns')
          },
          json: function(){ res.json(200, txns); }
        })
      } else {
        res.format({
          html: function(){
            res.locals.txns = null;
            res.render('partials/admin/txns')
          },
          json: function(){
            res.json(400, { error: { message: 'No Txn has been made.'}});            
          }
        });
      }
    });
  };
  
  function getByUser (req, res) {
    var userId = req.user._id
      , txnId = req.params.txnId;
    Txn.getByUser(userId, txnId, function (err, txn) {
      if (err) { console.log(err); }
      if (txn) {
        res.format({
          html: function(){
            res.locals.txn = txn;
            res.render('partials/txn');
          },
          json: function(){ res.json(200, txn); }
        });
      } else {
        res.format({
          html: function(){ res.render('404'); },
          json: function(){ res.json(404, { error: { message: 'Txn Not Found'}}); }
        });        
      }
    });
  };
  
  function listByUser (req, res) {
    var userId = req.user._id;
    Txn.listByUser(userId, function (err, txns) {
      if (err) { console.log(err); }
      if (txns) {
        res.format({
          html: function(){
            res.locals.txns = txns;
            res.render('partials/txns');
          },
          json: function(){ res.json(200, txns); }
        });        
      } else {
        res.format({
          html: function(){
            res.locals.txns = null;
            res.render('partials/txns');
          },
          json: function(){ res.json(400, { error: { message: 'No txn has been made.'}}); }//Check status code
        });        
      }
    });
  };
  
  function create (req, res) {
    // console.log('inside create txn route')
    // console.log('\n\n')
    // console.log(req.body)
    // console.log('\n\n')
    // console.log(req.user)
    var txn = req.body
      , uid = req.user ? req.user._id : null;
    Txn.create(txn, uid, function (err, txn) {
      if (err) { console.log(err); }
      if (txn) {
        var msg = 'Request For Quote saved.'
        res.format({
          html: function(){
            req.flash('success', msg);
            res.redirect('/orders');
          },
          json: function(){ res.json(200, { success: { message: msg }}); }
        });        
      } else {
        var msg = 'Request For Quote not saved. Check all input fields.'
        res.format({
          html: function(){
            req.flash('error', msg);
            res.redirect('/quote');
          },
          json: function(){ res.json(400, { error: { message: msg }}); }
        });
      }
    });
  };
  
  function updateQuote (req, res, next) {
    var tid = req.params.tid
      , proId = req.body.pid
      ;
    Txn.Txn.findOne({ tid: tid, 'products.pid': proId }, function (err, txn) {
      findProduct(txn.products, proId, function (product) {
        if (product) {
          product.quote = req.body.quote;
          txn.status = 'quoted';
          txn.save(function(err, isSaved) {
            if (err) return next(err);
            if (isSaved) {
              req.flash('success', 'Quote updated');
            } else {
              req.flash('error', 'Quote not updated. Try again.');              
            }
          });          
        } else {
          req.flash('error', 'Quote not updated. Try again.');
        }
        res.redirect('/admin/orders/'+tid);
      });
    });
  };

  function findProduct (products, pid, done) {
    for (var i in products) {
      if (products[i].pid == pid) {
        return done(products[i]);
      }
    }
    return done(null);
  };

  function update (req, res) {
    var id = req.params.id
      , txn = req.body.txn
      ;
    Txn.update(id, txn, function (err, isSaved) {
      if (err) { console.log(err); }
      if (isSaved) {
        res.json(200, { success: { message: 'Txn Updated'}});
      } else {
        res.json(400, { error: { message: 'Txn Not Updated. Check all input fields.'}});        
      }
    });
  };
  
  function remove (req, res) {
    var id = req.params.id;
    Txn.remove(id, function(err, isDeleted) {
      if (err) { console.log(err); }
      if (isDeleted) {
        res.json(200);
      } else {
        res.json(500, 'Txn Not Deleted');        
      }
    });
  };

  return {
      quote: quote
    , get: get
    , list: list
    , getByUser: getByUser
    , listByUser: listByUser
    , create: create
    , updateQuote: updateQuote
    , update: update
    , remove: remove
  };
};