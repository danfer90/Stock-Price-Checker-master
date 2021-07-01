const express = require('express');
const router = express.Router();

const stockController = require('../controller/stockController');
const validate = require('../util/validation');

router.route('/stock-prices')
    .get(validate.stock(), stockController.getStockPrice)

module.exports = router;