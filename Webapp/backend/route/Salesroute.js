const express = require('express');
const router = express.Router();
const salesController = require('../controllers/Salescontroller');
const Allowstaff = require('../middleware/Staffauthorisation');

router.get('/', Allowstaff({ allowOwner: true}), salesController.getSales); // Get all sales data
router.get('/stock/:stockId', salesController.getSalesByStockId); // Get by stockId
router.get('/shop/:shopId', Allowstaff({ allowOwner: true, allowManager: true}), salesController.getSalesByShopId); // Get by ShopId
router.post('/', Allowstaff({ allowOwner: true, allowManager: true}), salesController.addSales); // Add new sales data
router.put('/:id', Allowstaff({ allowOwner: true, allowManager: true}), salesController.updateSales); // Updates sales by Id
router.put('/updatePlacement/:shopId', Allowstaff({ allowOwner: true, allowManager: true}), salesController.updatePlacement); // Updates the item placement in shop
router.put('/updateSalesPrediction/:stockId', Allowstaff({ allowOwner: true, allowManager: true}), salesController.updateSalesPrediction); // Updates the prediction for next months sales
router.delete('/:id', Allowstaff({ allowOwner: true, allowManager: true}), salesController.deleteSales); // Delete sales by Id

module.exports = router;
