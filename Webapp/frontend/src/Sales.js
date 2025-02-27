import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'; // Import BarChart from recharts
import "./Sales.css";

const Sales = () => {
    const [sales, setSales] = useState([]); // Stores sales data
    const [sold, setSold] = useState(""); // Stores input add value
    const [error, setError] = useState(""); 
    const [isOwner, setIsOwner] = useState(false); // Checks if user is a owner
    const [isManager, setIsManager] = useState(false); // Checks if user is a manager 
    const [editingSale, setEditingSale] = useState(null); // Track which sale is being edited
    const [updatedSaleData, setUpdatedSaleData] = useState({}); // Stores updated sales data
    const navigate = useNavigate();
    const { stockId } = useParams(); // Get the stockId from the URL

    // Decode JWT, set roles
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            const decodedToken = parseJwt(token);
            const currentTime = Math.floor(Date.now() / 1000);
            if (decodedToken && decodedToken.exp > currentTime) {
                setIsOwner(decodedToken.isOwner || false);
                setIsManager(decodedToken.isManager || false);
            } else { // If token is invalid or expired log the user out
                localStorage.removeItem("token");
                localStorage.removeItem("username");
                navigate("/"); // Go to ShopList
            }
        } else {
            navigate("/"); // Go to ShopList
        }
    }, []);

    const parseJwt = (token) => { // Decode JWT
        try {
            const base64Url = token.split(".")[1];
            const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
            return JSON.parse(atob(base64));
        } catch (e) {
            return null;
        }
    };

    // Get the data when the stockId changes
    useEffect(() => {
        fetchSalesData();
    }, [stockId]);

    // Get sales data
    const fetchSalesData = async () => {
        try {
            const response = await fetch(`http://localhost:82/sales/stock/${stockId}`);
            const data = await response.json();
            console.log("Fetched Sales Data:", data);

            if (!response.ok || !data) {
                throw new Error("Failed to fetch sales data.");
            }

            setSales(Array.isArray(data) ? data : [data]); // Make sure the data is an array
        } catch (err) {
            console.error("Error fetching sales:", err);
            setError(err.message);
        }
    };

    // Add sales data
    const handleAddSale = async () => {
        if (!sold) return alert("Please enter the number of items sold.");
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:82/sales", { // POST Reqest 
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ StockId: stockId, Sold: Number(sold) }),
            });

            if (!response.ok) {
                throw new Error("Failed to add sale.");
            }

            alert("Sale added successfully.");
            setSold(""); // Reset input
            fetchSalesData(); // Refresh the data
        } catch (err) {
            alert(err.message);
        }
    };

    // Update sales form
    const handleEditSale = (sale) => {
        setEditingSale(sale); // Set which one is being edited
        setUpdatedSaleData({
            month: "",  // Make the month empty
            sold: 0,    // Set the sold amount to 0
        }); 
    };

    // Update sale
    const handleUpdateSale = async () => {
        if (!updatedSaleData.month || updatedSaleData.sold === "") {
            alert("Please select a month and enter the sold quantity.");
            return;
        }

        const updatedData = {
            month: updatedSaleData.month,  // The month selected
            sold: updatedSaleData.sold,    // The amount sold
        };

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:82/sales/${editingSale._id}`, { // PUT request
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(updatedData),
            });

            if (!response.ok) {
                throw new Error("Failed to update sale.");
            }

            alert("Sale updated successfully.");
            setEditingSale(null); // Close the form
            fetchSalesData(); // Refresh the data
        } catch (err) {
            alert(err.message);
        }
    };

    // Cancel button on update form
    const handleCancelEdit = () => {
        setEditingSale(null); // Close the form
    };

    // Delete sales
    const handleDeleteSale = async (saleId) => {
        const isConfirmed = window.confirm("Are you sure you want to delete this sale?");
        if (isConfirmed) {
            try {
                const token = localStorage.getItem("token"); // Get the jwt from storage
                const response = await fetch(`http://localhost:82/sales/${saleId}`, { // DELETE Request
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error("Failed to delete sale.");
                }

                alert("Sale deleted successfully.");
                fetchSalesData();
            } catch (err) {
                alert(err.message);
            }
        }
    };

    // Update placement suggestion 
    const handleUpdatePlacement = async (sale) => {
        const { ShopId } = sale;  // Get the ShopId from the sales data

        if (!ShopId) { // If ShopId doesn't exist tell the user
            alert("Shop ID is missing. Unable to update placement.");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:82/sales/updatePlacement/${ShopId}`, { // PUT Request
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to update placement.");
            }

            alert("Placement updated successfully."); // Send an alert telling a user it was successful
            fetchSalesData(); // Refresh sales data
        } catch (err) {
            alert(err.message);
        }
    };

    // Update linear regression prediction
    const handleUpdateSalesPrediction = async (stockId) => {
        try {
            const token = localStorage.getItem("token"); // Get JWT from storage
            const response = await fetch(`http://localhost:82/sales/updateSalesPrediction/${stockId}`, { // PUT Request
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to update sales prediction.");
            }

            alert("Sales prediction updated successfully.");
            fetchSalesData(); // Refresh data
        } catch (err) {
            alert(err.message);
        }
    };

    const back = localStorage.getItem("page"); // Get the last page from localstorage to let the back button go to the last page

    if (error) return <div className="error">{error}</div>;

    // Setting the sales data
    const chartData = sales.map(sale => ({
        name: sale.Item,
        "One Month Ago": sale.OneMonthAgo || 0,
        "Two Months Ago": sale.TwoMonthsAgo || 0,
        "Three Months Ago": sale.ThreeMonthsAgo || 0,
        "Four Months Ago": sale.FourMonthsAgo || 0,
        "Five Months Ago": sale.FiveMonthsAgo || 0,
        "Six Months Ago": sale.SixMonthsAgo || 0,
        "Seven Months Ago": sale.SevenMonthsAgo || 0,
        "Eight Months Ago": sale.EightMonthsAgo || 0,
        "Nine Months Ago": sale.NineMonthsAgo || 0,
        "Ten Months Ago": sale.TenMonthsAgo || 0,
        "Eleven Months Ago": sale.ElevenMonthsAgo || 0,
        "Twelve Months Ago": sale.TwelveMonthsAgo || 0,
        "Thirteen Months Ago": sale.ThirteenMonthsAgo || 0,
        "Fourteen Months Ago": sale.FourteenMonthsAgo || 0,
    }));

    return (
        <div className="salescontainer">
            {/* Back button */}
            <button className="backbuttons" onClick={() => navigate(back)}>Back</button>
            <h1>Sales Data</h1>

            {/* Show add button (only for owners and managers) */}
            {(isOwner || isManager) && (
                <div className="addsale">
                    <input
                        type="number"
                        className="input-box"
                        placeholder="Enter amount sold"
                        value={sold}
                        onChange={(e) => setSold(e.target.value)}
                    />
                    <button className="addbutton" onClick={handleAddSale}>Add Sale</button>
                </div>
            )}

            {/* Render the bar chart */}
            {sales.length > 0 && (
                <div className="chart-container">
                    <h2>Sales Over the Last 14 Months</h2>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            {/* Add bars for each month */}
                            <Bar dataKey="One Month Ago" fill="#7DA1F5" />
                            <Bar dataKey="Two Months Ago" fill="#7DA1F5" />
                            <Bar dataKey="Three Months Ago" fill="#7DA1F5" />
                            <Bar dataKey="Four Months Ago" fill="#7DA1F5" />
                            <Bar dataKey="Five Months Ago" fill="#7DA1F5" />
                            <Bar dataKey="Six Months Ago" fill="#7DA1F5" />
                            <Bar dataKey="Seven Months Ago" fill="#7DA1F5" />
                            <Bar dataKey="Eight Months Ago" fill="#7DA1F5" />
                            <Bar dataKey="Nine Months Ago" fill="#7DA1F5" />
                            <Bar dataKey="Ten Months Ago" fill="#7DA1F5" />
                            <Bar dataKey="Eleven Months Ago" fill="#7DA1F5" />
                            <Bar dataKey="Twelve Months Ago" fill="#7DA1F5" />
                            <Bar dataKey="Thirteen Months Ago" fill="#7DA1F5" />
                            <Bar dataKey="Fourteen Months Ago" fill="#7DA1F5" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            <div className="saleslist">
                {sales.length === 0 ? (
                    <p>No sales data found. You can add one.</p>
                ) : (
                    sales.map((sale) => (
                        <div key={sale._id} className="salecard">
                            <h2>{sale.Item}</h2>
                            <p><strong>Placement:</strong> {sale.Placement}</p>
                            <p><strong>Predicted Next Month Sales:</strong> {sale.PredictedNextMonthSales.toFixed(2)}</p>
                            <p><strong>Last 14 Months Sales:</strong></p>
                            {/* Display sales*/}
                            <ul>
                                {["OneMonthAgo", "TwoMonthsAgo", "ThreeMonthsAgo", "FourMonthsAgo",
                                "FiveMonthsAgo", "SixMonthsAgo", "SevenMonthsAgo", "EightMonthsAgo",
                                "NineMonthsAgo", "TenMonthsAgo", "ElevenMonthsAgo", "TwelveMonthsAgo",
                                "ThirteenMonthsAgo", "FourteenMonthsAgo"].map((key, i) => (
                                    <li key={i}>{key}: {sale[key] || 0}</li>
                                ))}
                            </ul>

                            {/* Show buttons for Managers and Owner */}
                            {(isOwner || isManager) && (
                                <div className="actionbuttons">
                                    {/* Update placement and prediction buttons */}
                                    <button onClick={() => handleUpdatePlacement(sale)} className="updateplacementbutton">
                                        Update Placement
                                    </button>
                                    <button onClick={() => handleUpdateSalesPrediction(stockId)} className="updatesalespredictionbutton">
                                        Update Sales Prediction
                                    </button>
                                    <button onClick={() => handleEditSale(sale)} className="updatebutton">Update</button>
                                    <button onClick={() => handleDeleteSale(sale._id)} className="deletebutton">Delete</button>
                                </div>
                            )}

                            {/* Update Form */}
                            {editingSale && editingSale._id === sale._id && (
                                <div className="editform">
                                    <h3>Edit Sale Data</h3>

                                    {/* Add a dropdown for selecting the month */}
                                    <div>
                                        <label>Select Month:</label>
                                        <select 
                                            value={updatedSaleData.month} 
                                            onChange={(e) => setUpdatedSaleData({ ...updatedSaleData, month: e.target.value })}
                                        >
                                            <option value="">Select Month</option>
                                            {["OneMonthAgo", "TwoMonthsAgo", "ThreeMonthsAgo", "FourMonthsAgo", 
                                              "FiveMonthsAgo", "SixMonthsAgo", "SevenMonthsAgo", "EightMonthsAgo", 
                                              "NineMonthsAgo", "TenMonthsAgo", "ElevenMonthsAgo", "TwelveMonthsAgo",
                                              "ThirteenMonthsAgo", "FourteenMonthsAgo"].map((month, idx) => (
                                                <option key={idx} value={month}>{month}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Input box for update */}
                                    <div>
                                        <label>Amount Sold:</label>
                                        <input
                                            type="number"
                                            value={updatedSaleData.sold}
                                            onChange={(e) => setUpdatedSaleData({ ...updatedSaleData, sold: Number(e.target.value) })}
                                        />
                                    </div>
 
                                    {/* Save and Cancel Buttons */}
                                    <button onClick={handleUpdateSale}>Save</button>
                                    <button onClick={handleCancelEdit}>Cancel</button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Sales;
