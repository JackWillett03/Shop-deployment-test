import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./OwnerSales.css";

const OwnerSales = () => {
    const [sales, setSales] = useState([]); // Store sales data
    const [stocks, setStocks] = useState([]); // Store stock data
    const [shops, setShops] = useState([]); // Store Shop data
    const [searchTerm, setSearchTerm] = useState(""); // Store search bar input
    const [error, setError] = useState("");
    const navigate = useNavigate();

    // Get data when the page loads
    useEffect(() => {
        fetchData();
    }, []);

    // Get sales data
    const fetchData = async () => {
        try {
        const token = localStorage.getItem("token"); // Get the JWT from storage
        if (!token) { // Go to ShopList page if the token doesn't exist
            navigate("/");
            return;
        }

        // Get all sales, stocks, and shops
        const [salesResponse, stockResponse, shopResponse] = await Promise.all([
            fetch("${process.env.REACT_APP_API}/sales", { headers: { Authorization: `Bearer ${token}` } }),
            fetch("${process.env.REACT_APP_API}/stocks", { headers: { Authorization: `Bearer ${token}` } }),
            fetch("${process.env.REACT_APP_API}/shops", { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (!salesResponse.ok || !stockResponse.ok || !shopResponse.ok) {
            throw new Error("Failed to fetch data.");
        }

        const [salesData, stockData, shopData] = await Promise.all([ // COnvert to Json
            salesResponse.json(),
            stockResponse.json(),
            shopResponse.json(),
        ]);

        // Update sales with the data
        setSales(salesData);
        setStocks(stockData);
        setShops(shopData);
        } catch (err) {
        setError(err.message);
        }
    };

    // Get item by StockId
    const getStockDetails = (stockId) => {
        return stocks.find((stock) => stock._id === stockId) || { Item: "Unknown Item" };
    };

    // Get Shop name and location by ShopId
    const getShopDetails = (shopId) => {
        return shops.find((shop) => shop._id === shopId) || { Name: "Unknown Shop", Location: "Unknown Location" };
    };

    // Handle search input 
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value.toLowerCase());
    };

    // Filter sales by shop Location or item name
    const filteredSales = sales.filter((sale) => {
        const stockDetails = getStockDetails(sale.StockId);
        const shopDetails = getShopDetails(sale.ShopId);

        return (
        stockDetails.Item.toLowerCase().includes(searchTerm) ||
        shopDetails.Location.toLowerCase().includes(searchTerm)
        );
    });

    // Update the predicted sales for item
    const updatePredictedSales = async (stockId) => {
        try {
        const token = localStorage.getItem("token"); // Get JWT from storage
        const response = await fetch(`${process.env.REACT_APP_API}/sales/updateSalesPrediction/${stockId}`, { // PUT Request
            method: "PUT",
            headers: {
            Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error("Failed to update predicted sales.");
        }

        alert("Predicted sales updated successfully."); // Alert the user
        fetchData(); // Refresh data
        } catch (error) {
        alert(error.message);
        }
    };

    if (error) return <div className="error">{error}</div>;

    return (
        <div className="salescontainer">
        {/* Back button */}
        <button className="backbuttons" onClick={() => navigate("/staffsl")}>Back</button>
        <h1>Owner Sales</h1>

        {/* Search Bar */}
        <input
            type="text"
            className="searchbars"
            placeholder="Search by Item or Shop Name..."
            value={searchTerm}
            onChange={handleSearchChange}
        />

        <div className="saleslist">
            {/* Show message if no sales are found */}
            {filteredSales.length === 0 ? (
            <p>No sales data found.</p>
            ) : (
            filteredSales.map((sale) => {
                const stockDetails = getStockDetails(sale.StockId);
                const shopDetails = getShopDetails(sale.ShopId);

                return (
                <div key={sale._id} className="salecard">
                    {/* Show item name */}
                    <h2>{stockDetails.Item}</h2>
                    {/* Show name and location */}
                    <p><strong>Shop:</strong> {shopDetails.Name} ({shopDetails.Location})</p>
                    {/* Show predicted sales */}
                    <p><strong>Predicted Next Month Sales:</strong> {sale.PredictedNextMonthSales}</p>
                    <p><strong>Last 3 Months Sales:</strong></p>
                    <ul>
                    <li>1 Month Ago: {sale.OneMonthAgo}</li>
                    <li>2 Months Ago: {sale.TwoMonthsAgo}</li>
                    <li>3 Months Ago: {sale.ThreeMonthsAgo}</li>
                    </ul>

                    {/* Update Predicted Sales Button */}
                    <button
                    className="updatesalesbutton"
                    onClick={() => updatePredictedSales(stockDetails._id)}
                    >
                    Update Predicted Sales
                    </button>
                </div>
                );
            })
            )}
        </div>
        </div>
    );
    };

export default OwnerSales; // Export OwnerSales for use elsewhere
