const StockList = require('../models/StockList');
const Sales = require('../models/Sales'); 
const mongoose = require('mongoose');

exports.addStock = async (req, res) => { // Add stock data
    try {
        const { Item, ShopId, CurrentStock, Price, Tags } = req.body;

        const newStock = new StockList({ // Data that needs to be input
            Item, 
            ShopId, 
            CurrentStock, 
            Price, 
            Tags
        });

        await newStock.save(); // Save it to the database
        res.status(200).json(newStock);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getStocks = async (req, res) => { // Get all stock data
    try {
        const stocks = await StockList.find();
        res.status(200).json(stocks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getStockByItem = async (req, res) => { // Get stock by item name
    try {
        const { item } = req.params;
        const stocks = await StockList.find({ Item: { $regex: new RegExp(item, 'i') } });  // not case sensitive

        if (!stocks) {
            return res.status(404).json({ message: 'Stock not found' });
        }
        res.status(200).json(stocks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getStockByShopId = async (req, res) => { // Get stock by ShopId
    try {
        const { shopId } = req.params;
        const shopObjectId = new mongoose.Types.ObjectId(shopId);
        const stocks = await StockList.find({ ShopId: shopObjectId });

        if (!stocks || stocks.length === 0) {
            return [];
        }
        res.status(200).json(stocks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getStockByTag = async (req, res) => { // Get stock by tags
    try {
        const { tag } = req.params;
        const stocks = await StockList.find({ Tags: { $in: [tag] } }); // not case sensitive

        if (!stocks || stocks.length === 0) {
            return res.status(404).json({ message: 'No stocks found with this tag' });
        }

        res.status(200).json(stocks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateStock = async (req, res) => { // Update stock by Id
    try {
        const { Item, ShopId, CurrentStock, Price, Tags } = req.body;
        const updatedStock = await StockList.findByIdAndUpdate(
            req.params.id, // The stock Id
            { Item, ShopId, CurrentStock, Price, Tags }, // Updated data
            { new: true } // Return the updated info
        );

        if (!updatedStock) {
            return res.status(404).json({ message: 'Stock not found' });
        }
        res.status(200).json(updatedStock);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteStock = async (req, res) => { // Delete stock by Id and related sales data
    try {
        const StockId = req.params.id;

        const stock = await StockList.findByIdAndDelete(StockId); 
        if (!stock) {
            return res.status(404).json({ message: 'Stock not found' });
        }

        await Sales.deleteMany({ StockId }); // Delete related sales data

        res.status(200).json({ message: 'Stock and related sales deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
