import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./StaffStockList.css";

const StaffStockList = () => {
  const { shopId } = useParams(); // Get the ShopId from the url
  const [stocks, setStocks] = useState([]); // Store stock data
  const [searchTerm, setSearchTerm] = useState(""); // Stores search bar input
  const [error, setError] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Track if menu is toggled open or not
  const [isAddingStock, setIsAddingStock] = useState(false); //Toggle add stock form
  const [editingStock, setEditingStock] = useState(null); // Track the stock being edited
  const [newStock, setNewStock] = useState({ // Stores the new stock data
    Item: "",
    CurrentStock: "",
    Price: "",
    Tags: "",
  });
  const [isOwner, setIsOwner] = useState(false); // Store if is owner
  const [isManager, setIsManager] = useState(false); // Store if is manager
  const navigate = useNavigate();

  // Decode JWT
  useEffect(() => {
    const token = localStorage.getItem("token"); // Get the token
    if (token) {
      const decodedToken = parseJwt(token);
      const currentTime = Math.floor(Date.now() / 1000); 
      if (decodedToken && decodedToken.exp > currentTime) {
        setIsOwner(decodedToken.isOwner || false); // Set if they are owner
        setIsManager(decodedToken.isManager || false); // Set if they are manager
      } else {
        // If JWT has expired log them out
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        navigate("/"); // Go to ShopList
      }
    } else {
      navigate("/"); // Go to ShopList
    }
  }, []);

  const parseJwt = (token) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      return JSON.parse(atob(base64));
    } catch (e) {
      return null;
    }
  };

  // Get stock data when the page loads
  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const response = await fetch(`http://localhost:82/stocks/shop/${shopId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch stock data.");
        }
        const data = await response.json(); 
        setStocks(data); // Set the data to setStocks
      } catch (err) {
        setError(err.message);
      }
    };

    fetchStocks();
  }, [shopId]);

  // Handle search bar changes
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Toggle the dropdown meny
  const toggleMenu = (e) => {
    e.preventDefault();
    setIsMenuOpen(!isMenuOpen);
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove JWT from storage
    localStorage.removeItem("username"); // Remove username from storage
    navigate("/"); // Go to ShopList page
  };

  // Adding staff
  const handleStaff = () => {
    navigate(`/staffmanagement/${shopId}`); // Go to Staff page
  };

  // Got to the sales page based on specific StockId
  const handleCardClick = (stockId) => {
    localStorage.setItem("page", window.location.pathname); // Set this page to local storage to be used for sales
    navigate(`/sales/${stockId}`); // Go to sales page
  };

  // Add stock
  const handleAddStock = async () => {
    try {
      const response = await fetch("http://localhost:82/stocks", { // POST request
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Include token to check role
        },
        body: JSON.stringify({ ...newStock, ShopId: shopId }), // Add ShopId to the stock data
      });

      if (!response.ok) {
        throw new Error("Failed to add stock.");
      }

      const data = await response.json();
      setStocks([...stocks, data]); // Add the new stock
      setNewStock({ Item: "", CurrentStock: "", Price: "", Tags: "" }); // Reset the stock form
      setIsAddingStock(false); // Close the form
    } catch (error) {
      alert(error.message);
    }
  };

  // Update stock
  const handleUpdateStock = async (stockId) => {
    try {
      const response = await fetch(`http://localhost:82/stocks/${stockId}`, { // PUT request
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Include token to check roles
        },
        body: JSON.stringify(editingStock), // Send updated stock data
      });

      if (!response.ok) {
        throw new Error("Failed to update stock.");
      }

      const data = await response.json();
      setStocks(stocks.map((stock) => (stock._id === stockId ? data : stock))); // Update the stock list
      setEditingStock(null); // Reset the form
    } catch (error) {
      alert(error.message);
    }
  };

  // Delete stock
  const handleDeleteStock = async (stockId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this stock?"); // Check incase accidental click
    if (!confirmDelete) return; 

    try {
      const response = await fetch(`http://localhost:82/stocks/${stockId}`, { // DELETE Request
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Include token to check roles
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete stock.");
      }

      setStocks(stocks.filter((stock) => stock._id !== stockId)); // Remove the deleted stock
    } catch (error) {
      alert(error.message);
    }
  };

  // Add 1 to the stock
  const handleIncreaseStock = async (e, stockId) => {
    e.stopPropagation();
    const stockToUpdate = stocks.find((stock) => stock._id === stockId);
    if (!stockToUpdate) return;
  
    const updatedStock = { ...stockToUpdate, CurrentStock: stockToUpdate.CurrentStock + 1 };
  
    try {
      const response = await fetch(`http://localhost:82/stocks/${stockId}`, { // PUT Request
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Include token to check roles
        },
        body: JSON.stringify(updatedStock),
      });
  
      if (!response.ok) {
        throw new Error("Failed to update stock.");
      }
  
      const data = await response.json();
      setStocks(stocks.map((stock) => (stock._id === stockId ? data : stock)));
    } catch (error) {
      alert(error.message);
    }
  };
  
  // Delete 1 from the stock
  const handleDecreaseStock = async (e, stockId) => {
    e.stopPropagation();
    const stockToUpdate = stocks.find((stock) => stock._id === stockId);
    if (!stockToUpdate || stockToUpdate.CurrentStock <= 0) return; // Prevent stock becoming negative
  
    const updatedStock = { ...stockToUpdate, CurrentStock: stockToUpdate.CurrentStock - 1 };
  
    try {
      const response = await fetch(`http://localhost:82/stocks/${stockId}`, { // PUT Request
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Include token to check roles
        },
        body: JSON.stringify(updatedStock),
      });
  
      if (!response.ok) {
        throw new Error("Failed to update stock.");
      }
  
      const data = await response.json();
      setStocks(stocks.map((stock) => (stock._id === stockId ? data : stock)));
    } catch (error) {
      alert(error.message);
    }
  };
  

  // Filter stocks based on search bar inputs
  const filteredStocks = stocks.filter(
    (stock) =>
      stock.Item.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.Tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="shoplistcontainer">
      {/* Menu button */}
      <button className="menubutton" onClick={toggleMenu}>
        &#9776;
      </button>

      <div className="header">
        <h1>Staff Stock</h1>
      </div>

      {/* Dropdown Menu */}
      {isMenuOpen && (
        <div className="menu" onClick={(e) => e.stopPropagation()}>
          <ul>
            <li>
              <button onClick={handleLogout} style={{ color: "red" }}>
                Staff Logout
              </button>
            </li>
            {(isOwner || isManager) && (
            <li>
              <button onClick={handleStaff} style={{ color: "#007bff" }}>
                Add Staff
              </button>
            </li>
          )}
          </ul>
        </div>
      )}

      {/* Add Stock Button */}
      {(isOwner || isManager) && !isAddingStock && (
        <button
          className="addstockbutton"
          onClick={() => setIsAddingStock(true)} // Toggle the visibility
        >
          Add Stock
        </button>
      )}

      {/* Add Stock Form */}
      {isAddingStock && (
        <div className="addstockform">
          <input
            type="text"
            placeholder="Item Name"
            value={newStock.Item}
            onChange={(e) => setNewStock({ ...newStock, Item: e.target.value })}
          />
          <input
            type="number"
            placeholder="Current Stock"
            value={newStock.CurrentStock}
            onChange={(e) =>
              setNewStock({ ...newStock, CurrentStock: e.target.value })
            }
          />
          <input
            type="number"
            placeholder="Price"
            value={newStock.Price}
            onChange={(e) => setNewStock({ ...newStock, Price: e.target.value })}
          />
          <input
            type="text"
            placeholder="Tags (comma separated)"
            value={newStock.Tags}
            onChange={(e) => setNewStock({ ...newStock, Tags: e.target.value })}
          />
          <button className="addstocksubmit" onClick={handleAddStock}>
            Add Stock
          </button>
          <button onClick={() => setIsAddingStock(false)} style={{ marginTop: "8px" }}>
            Cancel
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="searchbar">
        <input
          type="text"
          placeholder="Search by item or tag"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      {/* Stock Grid */}
      <div className="stocksgrid">
        {filteredStocks.length === 0 ? (
          <p>No stock found.</p>
        ) : (
          filteredStocks.map((stock) => (
            <div
              key={stock._id}
              className="stockcard"
              onClick={(e) => {
                if (!e.target.closest(".stockactions") && !e.target.closest(".updatestock")) {
                  handleCardClick(stock._id); // Go to sales page
                }
              }}
            >
              <h2>{stock.Item}</h2>
              <p>Price: £{stock.Price}</p>

              {/* Stock count and buttons */}
              <div className="stockinfo">
                <p>Stock: </p>
                <span>{stock.CurrentStock}</span>

                <div className="stockbuttons">
                  <button className="increase" onClick={(e) => handleIncreaseStock(e, stock._id)}>
                    +
                  </button>
                  <button className="decrease" onClick={(e) => handleDecreaseStock(e, stock._id)}>
                    -
                  </button>
                </div>
              </div>

              <p>Tags: {stock.Tags.join(", ")}</p>

              {/* Update and Delete buttons */}
              {(isOwner || isManager) && (
                <div className="stockactions">
                  <button onClick={() => setEditingStock(stock)}>Update</button>
                  <button onClick={() => handleDeleteStock(stock._id)}>Delete</button>
                </div>
              )}

              {/* Update form */}
              {editingStock?._id === stock._id && (
                <div className="updatestockform" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    value={editingStock.Item}
                    disabled
                    onClick={(e) => e.stopPropagation()}
                  />
                  <input
                    type="number"
                    value={editingStock.CurrentStock}
                    onChange={(e) =>
                      setEditingStock({ ...editingStock, CurrentStock: e.target.value })
                    }
                    onClick={(e) => e.stopPropagation()}
                  />
                  <input
                    type="number"
                    value={editingStock.Price}
                    onChange={(e) => setEditingStock({ ...editingStock, Price: e.target.value })}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <input
                    type="text"
                    value={editingStock.Tags}
                    onChange={(e) => setEditingStock({ ...editingStock, Tags: e.target.value })}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button onClick={() => handleUpdateStock(stock._id)}>Save</button>
                  <button onClick={() => setEditingStock(null)}>Cancel</button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Back Button */}
      <button
        className="loginbutton"
        onClick={() => navigate("/staffsl")}
        style={{ backgroundColor: "#007bff", color: "white" }}
      >
        Back
      </button>
    </div>
  );
};

export default StaffStockList;
