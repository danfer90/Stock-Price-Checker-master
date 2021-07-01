/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

let chaiHttp = require('chai-http');
let chai = require('chai');
let assert = chai.assert;
let server = require('../server');
let Stock = require('../models/stock');

chai.use(chaiHttp);

suite('Functional Tests', function() {
    
    this.beforeAll((done) => {
      Stock.deleteMany({}, (err) => {
        if (err) {
          console.error('Error deleting all documents from collection');
          throw err;
        } 
        done();
      });
    });

    suite('GET /api/stock-prices => stockData object', function() {
      
      test('1 stock', function(done) {
       chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog'})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.property(res.body, 'stockData', 'response body must have stockData property');
          assert.property(res.body.stockData, 'stock', 'stockData must have stock property');
          assert.equal(res.body.stockData.stock, 'GOOG', 'for ?stock=goog input query, returned stockData.stock must be "GOOG"');
          assert.property(res.body.stockData, 'price', 'stockData must have price property');
          assert.isString(res.body.stockData.price, 'stockData.price must be in string format');
          assert.property(res.body.stockData, 'likes', 'stockData must have likes property');
          assert.isNumber(res.body.stockData.likes, 'stockData.likes must be a number');
          done();
        });
      });
      
      test('1 stock with like', function(done) {
        chai.request(server)
          .get('/api/stock-prices')
          .query({stock: 'goog',
                  like: true})
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.property(res.body, 'stockData', 'response body must have stockData property');
            assert.property(res.body.stockData, 'stock', 'stockData must have stock property');
            assert.equal(res.body.stockData.stock, 'GOOG', 'for ?stock=goog input query, returned stockData.stock must be "GOOG"');
            assert.property(res.body.stockData, 'price', 'stockData must have price property');
            assert.isString(res.body.stockData.price, 'stockData.price must be in string format');
            assert.property(res.body.stockData, 'likes', 'stockData must have likes property');
            assert.isNumber(res.body.stockData.likes, 'stockData.likes must be a number');
            assert.equal(res.body.stockData.likes, 1);
            done();
          });
      });
      
      test('1 stock with like again (ensure likes arent double counted)', function(done) {
        chai.request(server)
          .get('/api/stock-prices')
          .query({stock: 'goog',
                  like: true})
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.property(res.body, 'stockData', 'response body must have stockData property');
            assert.property(res.body.stockData, 'stock', 'stockData must have stock property');
            assert.equal(res.body.stockData.stock, 'GOOG', 'for ?stock=goog input query, returned stockData.stock must be "GOOG"');
            assert.property(res.body.stockData, 'price', 'stockData must have price property');
            assert.isString(res.body.stockData.price, 'stockData.price must be in string format');
            assert.property(res.body.stockData, 'likes', 'stockData must have likes property');
            assert.isNumber(res.body.stockData.likes, 'stockData.likes must be a number');
            assert.equal(res.body.stockData.likes, 1, 'stockData.likes can only be updated once per IP');
            done();
          });
      });
      
      test('2 stocks', function(done) {
        chai.request(server)
          .get('/api/stock-prices')
          .query({ stock: ['goog', 'msft'] })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.property(res.body, 'stockData', 'response body must have stockData property');
            assert.isArray(res.body.stockData, 'stockData must be an array');
            for (let item of res.body.stockData) {
              assert.property(item, 'stock');
              assert.isString(item.stock);
              assert.property(item, 'price');
              assert.isString(item.price);
              assert.property(item, 'rel_likes');
              assert.isNumber(item.rel_likes);

              switch (item.stock.toUpperCase()) {
                case 'GOOG':
                  assert.equal(item.rel_likes, 1);
                  break;
                case 'MSFT':
                  assert.equal(item.rel_likes, -1);
                  break;
              }
            }
            done();
          });
      });
      
      test('2 stocks with like', function(done) {
        chai.request(server)
          .get('/api/stock-prices')
          .query({ stock: ['goog', 'msft'],
                   like: true
                 })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.property(res.body, 'stockData', 'response body must have stockData property');
            assert.isArray(res.body.stockData, 'stockData must be an array');
            for (let item of res.body.stockData) {
              assert.property(item, 'stock');
              assert.isString(item.stock);
              assert.property(item, 'price');
              assert.isString(item.price);
              assert.property(item, 'rel_likes');
              assert.isNumber(item.rel_likes);

              switch (item.stock.toUpperCase()) {
                case 'GOOG':
                  assert.equal(item.rel_likes, 0);
                  break;
                case 'MSFT':
                  assert.equal(item.rel_likes, 0);
                  break;
              }
            }
            done();
          });
      });
      
      test('stock missing', function(done) {
       chai.request(server)
        .get('/api/stock-prices')
        .query({})
        .end(function(err, res){
            assert.equal(res.status, 400)
            assert.equal(res.body.error, 'Stock missing');
          done();
        });
      });

      test('1 stock missing', function(done) {
       chai.request(server)
        .get('/api/stock-prices')
        .query({stock: ['goog', '']})
        .end(function(err, res){
            assert.equal(res.status, 400)
            assert.equal(res.body.error, 'One or more stocks missing');
          done();
        });
      });

      test('2 stocks missing', function(done) {
       chai.request(server)
        .get('/api/stock-prices')
        .query({stock: ['', '']})
        .end(function(err, res){
            assert.equal(res.status, 400)
            assert.equal(res.body.error, 'One or more stocks missing');
          done();
        });
      });

      test('stock not found', function(done) {
       chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'aghdk'})
        .end(function(err, res){
            assert.equal(res.status, 404)
            assert.equal(res.body.error, 'Stock not found');
          done();
        });
      });

    });

});
