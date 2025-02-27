const Sales = require('../models/Sales');
const StockList = require('../models/StockList');
const mongoose = require('mongoose');

exports.addSales = async (req, res) => { // Add sales data
    try {
        const { StockId, Sold } = req.body;

        const stock = await StockList.findById(StockId); // get the ShopId and Item from StockList
        if (!stock) {
            return res.status(404).json({ message: 'Stock not found' });
        }

        const { ShopId, Item } = stock;

        let sales = await Sales.findOne({ StockId });

        if (!sales) {
            sales = new Sales({
                StockId,
                ShopId,
                Item,
                OneMonthAgo: Sold,
            });
        } else {
            sales.FourteenMonthsAgo = undefined; // clear 14 months ago
            sales.FourteenMonthsAgo = sales.ThirteenMonthsAgo;
            sales.ThirteenMonthsAgo = sales.TwelveMonthsAgo;
            sales.TwelveMonthsAgo = sales.ElevenMonthsAgo;
            sales.ElevenMonthsAgo = sales.TenMonthsAgo;
            sales.TenMonthsAgo = sales.NineMonthsAgo;
            sales.NineMonthsAgo = sales.EightMonthsAgo;
            sales.EightMonthsAgo = sales.SevenMonthsAgo;
            sales.SevenMonthsAgo = sales.SixMonthsAgo;
            sales.SixMonthsAgo = sales.FiveMonthsAgo;
            sales.FiveMonthsAgo = sales.FourMonthsAgo;
            sales.FourMonthsAgo = sales.ThreeMonthsAgo;
            sales.ThreeMonthsAgo = sales.TwoMonthsAgo;
            sales.TwoMonthsAgo = sales.OneMonthAgo; // Move OneMonthAgo to TwoMonthsAgo

            sales.OneMonthAgo = Sold; // Add new data to OneMonthAgo
        }

        // Save the updated sales data
        await sales.save();

        res.status(200).json(sales);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.getSales = async (req, res) => { //Get all sales
    try {
        const sales = await Sales.find();
        res.status(200).json(sales);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getSalesByStockId = async (req, res) => { // Get sales by StockId
    try {
        const { stockId } = req.params;
        const stockObjectId = new mongoose.Types.ObjectId(stockId); // Convert stockId to ObjectId
        const sales = await Sales.find({ StockId: stockObjectId });

        if (!sales || sales.length === 0) {
            [];
        }
        
        res.status(200).json(sales);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getSalesByShopId = async (req, res) => { // Get all sales for the ShopId
    try {
        const { shopId } = req.params;
        const sales = await Sales.find({ ShopId: shopId });

        if (!sales || sales.length === 0) {
            return res.status(404).json({ message: 'No sales found for this shop' });
        }

        res.status(200).json(sales);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.updateSales = async (req, res) => { // Update sales by Id
    try {
        const { month, sold } = req.body;

        let sales = await Sales.findOne({ _id: req.params.id }); // Find the existing sales data

        if (!sales) {
            return res.status(404).json({ message: 'Sales not found' });
        }

        const validMonths = [  // Make sure the month is one of the allowed months
            "OneMonthAgo", "TwoMonthsAgo", "ThreeMonthsAgo", "FourMonthsAgo", "FiveMonthsAgo", 
            "SixMonthsAgo", "SevenMonthsAgo", "EightMonthsAgo", "NineMonthsAgo", "TenMonthsAgo", 
            "ElevenMonthsAgo", "TwelveMonthsAgo", "ThirteenMonthsAgo", "FourteenMonthsAgo"
        ];

        if (!validMonths.includes(month)) {
            return res.status(400).json({ message: 'Invalid month specified' });
        }

        sales[month] = sold; // Update the month

        await sales.save(); // Save the updated data

        res.status(200).json(sales);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.deleteSales = async (req, res) => { // Delete sales by Id
    try {
        const deletedSales = await Sales.findByIdAndDelete(req.params.id);
        if (!deletedSales) {
            return res.status(404).json({ message: 'Sales not found' });
        }
        res.status(200).json({ message: 'Sales deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updatePlacement = async (req, res) => {
    try {
        const { shopId } = req.params;

        // Fetch all sales for the shop
        const sales = await Sales.find({ ShopId: shopId });

        if (!sales || sales.length === 0) { // Checks to see if its empty
            return res.status(404).json({ message: 'No sales data found for this shop' });
        }

        // Calculate total sales for each item (last 3 months)
        const salesWithTotals = sales.map((sale) => {
            const totalSales = [
                sale.OneMonthAgo, sale.TwoMonthsAgo, sale.ThreeMonthsAgo
            ].reduce((sum, value) => sum + value, 0); // The last 3 months

            return { ...sale._doc, totalSales };
        });

        // Sort by total sales lowest to highest
        salesWithTotals.sort((a, b) => a.totalSales - b.totalSales);

        // Split into 1/3rds
        const totalItems = salesWithTotals.length;
        const oneThird = Math.floor(totalItems / 3);

        // Assign placements based on sorted sales
        for (let i = 0; i < salesWithTotals.length; i++) {
            let placement;
        
            const oneThird = Math.ceil(totalItems / 3); // Number of items in each third
            const twoThirds = 2 * oneThird; // Boundary for the middle
        
            if (i < oneThird) {
                placement = 'Front';
            } else if (i < twoThirds) {
                placement = 'Middle';
            } else {
                placement = 'Back';
            }
        
            // Update the placement for the item
            await Sales.findByIdAndUpdate(salesWithTotals[i]._id, {
                Placement: placement
            }, { new: true });
        }

        res.status(200).json({ message: 'Placement updated successfully', salesWithTotals });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.updateSalesPrediction = async (req, res) => {
    try {
        const { stockId } = req.params;

        // Get the sales data
        const sales = await Sales.findOne({ StockId: stockId });

        if (!sales) {
            return res.status(404).json({ message: 'Sales data not found for this StockId' });
        }

        // Get the sales data for the last 14 months (ignores 0's)
        const salesData = [
            sales.FourteenMonthsAgo, sales.ThirteenMonthsAgo, sales.TwelveMonthsAgo, sales.ElevenMonthsAgo,
            sales.TenMonthsAgo, sales.NineMonthsAgo, sales.EightMonthsAgo, sales.SevenMonthsAgo,
            sales.SixMonthsAgo, sales.FiveMonthsAgo, sales.FourMonthsAgo, sales.ThreeMonthsAgo,
            sales.TwoMonthsAgo, sales.OneMonthAgo
        ].filter(value => value > 0); // Ignore the 0's

        if (salesData.length < 3) {
            return res.status(400).json({ message: 'Not enough data to predict sales you must have at least 3 months of data without 0s' });
        }

        // Prepare the series (e.g. 1 to 5 months) based on the filtered data (won't be 14 months if 9 are 0s)
        const timeSeries = Array.from({ length: salesData.length }, (_, i) => i + 1); // [1, 2, ..., N]

        // Calculate the Slope and Intercept for the Linear Regression
        const n = salesData.length;

        const sumX = timeSeries.reduce((sum, x) => sum + x, 0);
        const sumY = salesData.reduce((sum, y) => sum + y, 0);
        const sumXY = timeSeries.reduce((sum, x, i) => sum + x * salesData[i], 0);
        const sumX2 = timeSeries.reduce((sum, x) => sum + x * x, 0);

        const m = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const b = (sumY - m * sumX) / n;

        // Predict sales for next month
        const predictedSales = m * (n + 1) + b;

        // Update the sales prediction
        await Sales.findByIdAndUpdate(sales._id, {
            PredictedNextMonthSales: predictedSales
        }, { new: true });

        res.status(200).json({
            message: 'Sales prediction updated successfully',
            predictedSales: predictedSales
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};