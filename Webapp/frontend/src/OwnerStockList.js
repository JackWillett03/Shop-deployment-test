import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./StockList.css";

const StockList = () => {
  const [stocks, setStocks] = useState([]); // Store stocks
  const [shops, setShops] = useState([]); // Store shops
  const [searchTerm, setSearchTerm] = useState(""); // Store search
  const [error, setError] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Dropdown menu
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track if user is logged in
  const navigate = useNavigate();

  // Get stock and shop data when the page loads
  useEffect(() => {
    const fetchStocksAndShops = async () => {
      try {
        const token = localStorage.getItem("token"); // Get the JWT
        if (!token) {
          setIsLoggedIn(false); // If there's no JWT log out
          navigate("/"); // Go to the Shop page
          return;
        }

        // Fetch stocks
        const stockResponse = await fetch("http://localhost:82/stocks", { // GET Request for stock
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!stockResponse.ok) {
          throw new Error("Failed to fetch stock data.");
        }

        const stockData = await stockResponse.json();
        setStocks(stockData);

        // Fetch shops
        const shopResponse = await fetch("http://localhost:82/shops", { // GET Request for shops
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!shopResponse.ok) {
          throw new Error("Failed to fetch shop data.");
        }

        const shopData = await shopResponse.json();
        setShops(shopData);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchStocksAndShops();
  }, []);

  // Make sure the user is logged in and JWT valid
  useEffect(() => {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");

    if (token && username) {
      const decodedToken = parseJwt(token);
      const currentTime = Math.floor(Date.now() / 1000);

      if (decodedToken && decodedToken.exp > currentTime) {
        setIsLoggedIn(true);
      } else { // Log the user out
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        alert("Session expired. You have been logged out.");
        setIsLoggedIn(false);
      }
    } else {
      setIsLoggedIn(false); // If not logged in set it as such
    }
  }, []);

  // Parse JWT
  const parseJwt = (token) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      return JSON.parse(atob(base64));
    } catch (e) {
      return null;
    }
  };

  // Handle search bar changes
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Toggle the dropdown menu
  const toggleMenu = (e) => {
    e.preventDefault();
    setIsMenuOpen(!isMenuOpen);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setIsLoggedIn(false);
    alert("You have been logged out.");
    navigate("/"); // Go to Shop page after logging out
  };

  // Find shop details by ShopId
  const getShopDetails = (shopId) => {
    return shops.find((shop) => shop._id === shopId) || { Name: "Unknown", Location: "Unknown" };
  };

  // Filter stocks based on search bar
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
        <h1>Stock List</h1>
      </div>

      {/* Dropdown Menu */}
      {isMenuOpen && (
        <div className="menu" onClick={(e) => e.stopPropagation()}>
          <ul>
            <li>
              <button
                onClick={handleLogout}
                style={{ color: "red" }}
              >
                Staff Logout
              </button>
            </li>
          </ul>
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
      <div className="shopsgrid">
        {filteredStocks.length === 0 ? (
          <p>No stock found.</p>
        ) : (
          filteredStocks.map((stock) => {
            const shopDetails = getShopDetails(stock.ShopId);
            return (
              <div key={stock._id} className="shopcard"> 
                {/* StockList data */}
                <h2>{stock.Item}</h2>
                <p>Price: £{stock.Price}</p>
                <p>Stock: {stock.CurrentStock}</p>
                <p>Tags: {stock.Tags.join(", ")}</p>
                <hr />
                {/* ShopList data so you know which belongs to which shop */}
                <p><strong>Shop ID:</strong> {stock.ShopId}</p>
                <p><strong>Shop Name:</strong> {shopDetails.Name}</p>
                <p><strong>Location:</strong> {shopDetails.Location}</p>
              </div>
            );
          })
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

export default StockList;
