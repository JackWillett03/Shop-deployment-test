const express = require('express');
const router = express.Router();
const ShopListcontroller = require('../controllers/ShopListcontroller');
const Allowstaff = require('../middleware/Staffauthorisation');

router.get('/', ShopListcontroller.getShops); // Get all shops
router.get('/name/:name', ShopListcontroller.getShopByName); // Get shop by name
router.get('/location/:location', ShopListcontroller.getShopByLocation); // Get shop by location
router.post('/', Allowstaff({ allowOwner: true}), ShopListcontroller.addShop); // Add new shop
router.put('/:id', Allowstaff({ allowOwner: true}), ShopListcontroller.updateShop); // Update by id (use lowercase name and location to update)
router.delete('/:id', Allowstaff({ allowOwner: true}), ShopListcontroller.deleteShop); // Delete shop and related data

module.exports = router;
