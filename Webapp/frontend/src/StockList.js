import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./StockList.css"; 

const StockList = () => {
  const { shopId } = useParams(); // Get shopId from the URL
  const [stocks, setStocks] = useState([]); // Store stocks
  const [searchTerm, setSearchTerm] = useState(""); // Store search
  const [error, setError] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Manage dropdown menu
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track if user is logged in or not
  const navigate = useNavigate();

  // Get stock data when the page loads
  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const response = await fetch(`http://localhost:82/stocks/shop/${shopId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch stock data.");
        }
        const data = await response.json();
        setStocks(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchStocks();
  }, [shopId]);

  // Check if the user is logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");

    if (token && username) {
      const decodedToken = parseJwt(token);
      const currentTime = Math.floor(Date.now() / 1000);

      if (decodedToken && decodedToken.exp > currentTime) {
        setIsLoggedIn(true);
      } else { // remove data in local storage to logout
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        alert("Session expired. You have been logged out.");
        setIsLoggedIn(false);
      }
    }
  }, []);

  const parseJwt = (token) => { // parse jwt
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      return JSON.parse(atob(base64));
    } catch (e) {
      return null;
    }
  };

  // Handle changes in searches
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Toggle the dropdown menu
  const toggleMenu = (e) => {
    e.preventDefault();
    setIsMenuOpen(!isMenuOpen);
  };

  // Handle login and logout
  const handleLoginLogout = (e) => {
    e.preventDefault();
    if (isLoggedIn) { // remove data from local storage
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      setIsLoggedIn(false);
      alert("You have been logged out.");
    } else {
      localStorage.setItem("page", window.location.pathname); // save page
      navigate("/login");
    }
  };

  // Filter stocks based on search
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
      {/* Dropdown Menu */}
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
                onClick={handleLoginLogout}
                style={{ color: isLoggedIn ? "red" : "blue" }}
              >
                {isLoggedIn ? "Logout" : "Login"}
              </button>
            </li>
            {isLoggedIn && (
              <li>
                <button onClick={() => navigate("/profile")}>Profile</button>
              </li>
            )}
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
          filteredStocks.map((stock) => (
            <div key={stock._id} className="shopcard">
              <h2>{stock.Item}</h2>
              <p>Price: £{stock.Price}</p>
              <p>Stock: {stock.CurrentStock}</p>
              <p>Tags: {stock.Tags.join(", ")}</p>
            </div>
          ))
        )}
      </div>

      {/* Back Button */}
      <button
        className="loginbutton"
        onClick={() => navigate("/")}
        style={{ backgroundColor: "#007bff", color: "white" }}
      >
        Back
      </button>
    </div>
  );
};

export default StockList;
