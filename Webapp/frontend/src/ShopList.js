import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ShopList.css";

const ShopList = () => {
  const [shops, setShops] = useState([]); // Stores the list of shops from the database
  const [searchTerm, setSearchTerm] = useState(""); // Tracks the search input
  const [error, setError] = useState(""); // Stores error messages
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Sets menu visability
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Tracks if the user is logged in or not
  const navigate = useNavigate(); // Navigates to other pages

  useEffect(() => { // Get shop data when page is opened
    const fetchShops = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API}/shops`); // Get request to get shop data
        if (!response.ok) {
          throw new Error("Failed to fetch shops.");
        }
        const data = await response.json();
        setShops(data); // Updates the shops with the data from the database
      } 
      catch (err) {
        setError(err.message);
      }
    };

    fetchShops();
  }, []); // Make sure it runs only once

  useEffect(() => { // Check if user is logged in
    const token = localStorage.getItem("token"); // Get the JWT from storage
    const username = localStorage.getItem("username"); // Get the username from storage

    if (token && username) {
      const decodedToken = parseJwt(token); // Decode the JWT
      const currentTime = Math.floor(Date.now() / 1000); // Get the current time in seconds

      // Check if token is still valid
      if (decodedToken && decodedToken.exp > currentTime) {
        setIsLoggedIn(true);
      } 
      else { // If JWT has expired log the user out
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        alert("Session expired. You have been logged out.");
        setIsLoggedIn(false);
      }
    }
  }, []);

  const parseJwt = (token) => { // Decodes JWT
    try {
      const base64Url = token.split(".")[1]; // Extract payload
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/"); // Fix base64 format
      return JSON.parse(atob(base64)); // Decond and parse payload
    } 
    catch (e) {
      return null;
    }
  };

  const handleSearchChange = (e) => { // Manages changes in the search bar
    setSearchTerm(e.target.value); // Update the search term with the input
  };

  const handleCardClick = (shopId) => {
    navigate(`/stocklist/${shopId}`); // Go to the StockList page for the sepcific shopId
  };
  

  const handleLoginLogout = (e) => { // Handle the login/out button
    e.preventDefault(); // Prevent forms default behaviour
    if (isLoggedIn) {
      // If the user is logged in log them out
      localStorage.removeItem("token"); // Remove JWT and username from storage
      localStorage.removeItem("username");
      setIsLoggedIn(false); // Update status
      alert("You have been logged out."); // Tell the user they have logged out
    } 
    else {
      localStorage.setItem("page", window.location.pathname);
      navigate("/login"); // Go to the login page
    }
  };

  const toggleMenu = (e) => { // Toggle menu open or closed
    e.preventDefault();
    setIsMenuOpen(!isMenuOpen);
  };

  const filteredShops = shops.filter( // Filter shops based on the search bar input
    (shop) =>
      shop.Name.toLowerCase().includes(searchTerm.toLowerCase()) || // Match name
      shop.Location.toLowerCase().includes(searchTerm.toLowerCase()) // Match location
  );

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="shoplistcontainer">
      {/* Menu Button */}
      <button className="menubutton" onClick={toggleMenu}>
        &#9776;
      </button>

      {/*Header*/}
      <div className="header">
        <h1>Our Shops</h1>
      </div>

      {/* Dropdown Menu */}
      {isMenuOpen && (
        <div className="menu" onClick={(e) => e.stopPropagation()}>
          <ul>
            <li>
              <button onClick={handleLoginLogout} style={{ color: isLoggedIn ? "red" : "blue" }}>
                {isLoggedIn ? "Logout" : "Login"}
              </button>
            </li>
            {!isLoggedIn && (
              <>
                <li>
                  <button onClick={() => navigate("/staffLogin")}>Staff Login</button>
                </li>
              </>
            )}
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
          placeholder="Search by name or location"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      {/* Shops Grid with clickable cards */}
      <div className="shopsgrid">
        {filteredShops.length === 0 ? (
          <p>No shops found.</p>
        ) : (
          filteredShops.map((shop) => (
            <div
              key={shop._id}
              className="shopcard"
              onClick={() => handleCardClick(shop._id)}
              style={{ cursor: "pointer" }}
            >
              <h2>{shop.Name}</h2>
              <p>{shop.Location}</p>
            </div>
          ))
        )}
      </div>


      {/* Login/Logout Button */}
      <button
        onClick={handleLoginLogout}
        className="loginbutton"
        style={{ backgroundColor: isLoggedIn ? "red" : "blue", color: "white" }} // Blue when not logged in, Red when logged in, white is text colour
      >
        {isLoggedIn ? "Logout" : "Login"}
      </button>
    </div>
  );
};

export default ShopList;
