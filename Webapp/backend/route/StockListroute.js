const express = require('express');
const router = express.Router();
const stockListController = require('../controllers/StockListcontroller');
const Allowstaff = require('../middleware/Staffauthorisation');

router.get('/', Allowstaff({ allowOwner: true}), stockListController.getStocks); // Get all stock
router.get('/item/:item', stockListController.getStockByItem); // Get stock by item name
router.get('/shop/:shopId', stockListController.getStockByShopId); // Get stock by ShopId
router.get('/tags/:tag', stockListController.getStockByTag); // Get stock by tag
router.post('/', Allowstaff({ allowOwner: true, allowManager: true}), stockListController.addStock); // Add new stock data
router.put('/:id', Allowstaff({ allowOwner: true, allowManager: true, allowStaff: true}), stockListController.updateStock); // Update by Id
router.delete('/:id', Allowstaff({ allowOwner: true, allowManager: true}), stockListController.deleteStock); // Delete stock and related sales data

module.exports = router;
