const ShopList = require('../models/ShopList');
const StockList = require('../models/StockList');
const Sales = require('../models/Sales');
const Staff = require('../models/Staff');

exports.addShop = async (req, res) => { // Add shop
    try {
        const { Name, Location } = req.body; // Destructure data from request body

        const newShop = new ShopList({ // Data that needs to be input
            Name,
            Location,
        });

        await newShop.save(); // Save it to the database
        res.status(200).json(newShop);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getShops = async (req, res) => { // Get all shops
    try {
        const shops = await ShopList.find(); // Find all the shops
        res.status(200).json(shops);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getShopByName = async (req, res) => { // Get shop by name
    try {
        const { name } = req.params;

        const shops = await ShopList.find({ Name: { $regex: new RegExp(name, 'i') } }); // Find all shops with that name not case sensitive

        if (shops.length === 0) {
            return res.status(404).json({ message: 'Shop not found' });
        }

        res.status(200).json(shops);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getShopByLocation = async (req, res) => { // Get shop by location
    try {
        const { location } = req.params;
        const shops = await ShopList.find({ Location: { $regex: new RegExp(location, 'i') } }); // Find all shops with that location not case sensitive

        if (!shops || shops.length === 0) {
            return res.status(404).json({ message: 'No shops found at this location' });
        }
        res.status(200).json(shops);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateShop = async (req, res) => { // Update by Id
    try {
        const { Name, Location } = req.body;
        const updatedShop = await ShopList.findByIdAndUpdate(
            req.params.id, // The shop's Id
            { Name: Name, Location: Location }, // Updated data
            { new: true } // Return the updated info
        );
        if (!updatedShop) {
            return res.status(404).json({ message: 'Shop not found' });
        }
        res.status(200).json(updatedShop);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteShop = async (req, res) => { // Delete shop by Id
    try {
        const deletedShop = await ShopList.findByIdAndDelete(req.params.id);
        if (!deletedShop) {
            return res.status(404).json({ message: 'Shop not found' });
        }

        // Delete linked data
        const shopId = req.params.id;
        const stocks = await StockList.find({ ShopId: shopId });
        const stockIds = stocks.map(stock => stock._id);
        await StockList.deleteMany({ ShopId: shopId });
        await Staff.deleteMany({ ShopId: shopId });
        await Sales.deleteMany({ StockId: { $in: stockIds } });

        res.status(200).json({ message: 'Shop and linked data deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
