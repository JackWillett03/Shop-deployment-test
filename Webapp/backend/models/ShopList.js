const mongoose = require('mongoose');

const ShopListSchema = new mongoose.Schema({
  Name: { type: String, required: true, trim: true, },
  Location: { type: String, required: true, trim: true, },
});

const Shops = mongoose.model('ShopList', ShopListSchema, 'ShopList');
module.exports = Shops; // Export so can be accessed by other node modules
