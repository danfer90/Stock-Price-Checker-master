const getDb = require('../util/db').getDb;
const Stock = require('../models/stock');
const fetch = require('node-fetch');

// url for api call to get stock price: https://api.iextrading.com/1.0/stock/goog/price
//const stockAPIUrl = 'https://api.iextrading.com/1.0/stock/';

const stockAPIUrl = 'https://ws-api.iextrading.com/1.0/tops/last?symbols=';

//Call API
async function getPrice (stock, next) {
  const url = stockAPIUrl + stock //+ '/price';
  try {
      let response = await fetch(url);
      if (response.status === 404)
        throw ({status: 404, message: 'Stock not found'});

      let data = await response.json();
      if (data.length === 0)
          throw ({status: 404, message: 'Stock not found'});

      return data[0].price;
    
  } catch(err) {
      next(err);
  }
}

async function handleStock(stockTicker, ip, next){
  
  const regex = new RegExp('^' + stockTicker + '$', "i");      
  
  try {
    let price = await getPrice(stockTicker, next);
    let data;
    
    let doc = await Stock.findOne({'stock': { $regex : regex } });
    if (!doc) { //if stock does not exist in DB, add it
        let stock = new Stock({stock: stockTicker.trim()});
        if (ip !== '') //if like sent
          stock.likes.push(ip);
        data = await stock.save();
    }
    else {
        if (ip !== '' && !doc.likes.includes(ip))  //if like sent, add ip if not already present
          doc.likes.push(ip);
        data = await doc.save();
    } 
    
    return ({'stock': stockTicker.toUpperCase(), 'price': price.toString(), 'likes': data.likes.length}); 
    
  } catch(err) {
      next(err);
  }
}

module.exports = {
    
    getStockPrice: async (req, res, next) => {
      let stock = req.query.stock;
      let ip = req.query.like ? req.ip : '';
      try {
        //if more than one stock
        if (Array.isArray(stock)) {
          //find price for each stock
          let json1 = await handleStock(stock[0], ip, next);
          let json2 = await handleStock(stock[1], ip, next);
          res.status(200).json({'stockData': [{'stock': json1.stock, 'price': json1.price, 'rel_likes': (json1.likes - json2.likes)}, 
                                              {'stock': json2.stock, 'price': json2.price, 'rel_likes': (json2.likes - json1.likes)}]});
        }
        else {     //if single stock
          let json = await handleStock(stock, ip, next);
          res.status(200).json({'stockData': json});
        }
      } catch(err) {
          next(err);
      }
    }
  
}

