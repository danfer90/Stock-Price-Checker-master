const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schema for the db
let StockSchema = new Schema({
  stock: { type: String, required: true },
  likes: { type: [String]}     // list of ip's who liked this stock
});

//* Model for the schema
let Stock = mongoose.model('Stock', StockSchema);

// make this available to the users in our Node applications
module.exports = Stock;