import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./StaffShopList.css";

const StaffShopList = () => {
  const [shops, setShops] = useState([]); // Stores the list of shops
  const [searchTerm, setSearchTerm] = useState(""); // Stores the searches input
  const [error, setError] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Controls the menu's visability
  const [isOwner, setIsOwner] = useState(false); // Checks if the user is the owner
  const [isManager, setIsManager] = useState(false); // Checks if the user is a manager
  const [userShopId, setUserShopId] = useState(null); // Store the users ShopId
  const [editingShop, setEditingShop] = useState(null); // Tracks the shop being edited 
  const [newShop, setNewShop] = useState({ Name: "", Location: "" }); // Stores the new shop data
  const navigate = useNavigate(); 

  useEffect(() => { // Get all shops
    const fetchShops = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API}/shops`); // GET request
        if (!response.ok) {
          throw new Error("Failed to fetch shops.");
        }
        const data = await response.json();
        setShops(data); // Update the state with the shops from the GET request
      } catch (err) {
        setError(err.message);
      }
    };

    fetchShops();
  }, []);

  useEffect(() => { // Decode the JWT, set if they are a owner/manager/staff and their ShopId if they have one
    const token = localStorage.getItem("token");
    if (token) {
      const decodedToken = parseJwt(token);
      const currentTime = Math.floor(Date.now() / 1000); 
      if (decodedToken && decodedToken.exp > currentTime) {
        setIsOwner(decodedToken.isOwner || false);
        setIsManager(decodedToken.isManager || false);
        setUserShopId(decodedToken.ShopId || null); // Set the ShopId for the user
      } else { // If the token is expired or no longer valid log the user out for saftey 
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        navigate("/"); // Go to main page (ShopList)
      }
    } else {
      navigate("/"); // Go to main page (ShopList)
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

  const handleSearchChange = (e) => { // Handles user entering text into search bar
    setSearchTerm(e.target.value);
  };

  const handleLogout = () => { // Logs the user out
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/");
  };

  const toggleMenu = (e) => { // Toggles whether the menu is visiable or not
    e.preventDefault();
    setIsMenuOpen(!isMenuOpen);
  };

  const handleAddShop = async () => { // Add shops (Owners only)
    try {
      const response = await fetch(`${process.env.REACT_APP_API}/shops`, { // POST request
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Include JWT to check staff role
        },
        body: JSON.stringify(newShop),
      });

      if (!response.ok) {
        throw new Error("Failed to add shop.");
      }

      const data = await response.json();
      setShops([...shops, data]); // Update the list with the new shop
      setNewShop({ Name: "", Location: "" }); // Reset the form
    } catch (error) {
      alert(error.message);
    }
  };

  const handleUpdateShop = async (shopId) => { // Update shops (Owner only)
    try {
      const response = await fetch(`${process.env.REACT_APP_API}/shops/${shopId}`, { // PUT Request
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Include token to check staff member role
        },
        body: JSON.stringify(editingShop),
      });

      if (!response.ok) {
        throw new Error("Failed to update shop.");
      }

      const data = await response.json();
      setShops(shops.map((shop) => (shop._id === shopId ? data : shop))); // Update ShopList with the new information 
      setEditingShop(null); // Reset form
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDeleteShop = async (shopId, name, location) => { // Delete shop (Owner only)
    const confirmDelete = window.confirm(`Are you sure you want to delete "${name}" at "${location}"?`); // Drop down for user to confirm they want do infact want to delete that shop
    if (!confirmDelete) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_API}/shops/${shopId}`, { // DELETE request
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Include token to check staff role
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete shop.");
      }

      setShops(shops.filter((shop) => shop._id !== shopId)); // Remove the deleted shop
    } catch (error) {
      alert(error.message);
    }
  };

  const handleCardClick = (shopId) => {
    navigate(`/staffstocklist/${shopId}`); // Go to the StockList page for the sepcific shopId
  };

  const filteredShops = shops.filter((shop) => {
    // Managers and staff can only see their own shop
    if (isManager || !isOwner) {
      if (userShopId && shop._id.toString() !== userShopId.toString()) {
        return false; // Only show the shop that matches the user's ShopId
      }
    }

    // Search filter
    return (
      shop.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shop.Location.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });
  

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
            <h1>Staff Shops</h1>
        </div>

        {/* Add shop form (Owners only) */}
        {isOwner && (
            <div className="addshop">
            <input
                type="text"
                placeholder="Shop Name"
                value={newShop.Name}
                onChange={(e) => setNewShop({ ...newShop, Name: e.target.value })}
            />
            <input
                type="text"
                placeholder="Location"
                value={newShop.Location}
                onChange={(e) => setNewShop({ ...newShop, Location: e.target.value })}
            />
            <button onClick={handleAddShop}>Add Shop</button>
            </div>
        )}

        {/* Menu dropdown */}
        {isMenuOpen && (
            <div className="menu">
            <ul>
                <li>
                <button onClick={handleLogout} style={{ color: "red" }}>
                    Staff Logout
                </button>
                </li>
                {isOwner && (
                <>
                  <li>
                    <button onClick={() => navigate("/ownerstocklist")}>All Stocks</button>
                  </li>
                  <li>
                    <button onClick={() => navigate("/ownersales")}>All Sales</button>
                  </li>
                </>
              )}
            </ul>
            </div>
        )}

        {/* Search bar */}
        <div className="searchbar">
            <input
            type="text"
            placeholder="Search by name or location"
            value={searchTerm}
            onChange={handleSearchChange}
            />
        </div>

        {/* Show shops */}
        <div className="shopsgrid">
            {filteredShops.length === 0 ? (
            <p>No shops found.</p>
            ) : (
            filteredShops.map((shop) => (
              <div key={shop._id} className="shopcard" onClick={(e) => {
                if (!e.target.closest(".shopactions") && !e.target.closest(".updateshop")) {
                  handleCardClick(shop._id);
                }
              }}>
              
                <h2>{shop.Name}</h2>
                <p>{shop.Location}</p>

                {/* Update and delete button (Owner only) */}
                {isOwner && (
                  <div className="shopactions">
                    <button onClick={(e) => { e.stopPropagation(); setEditingShop(shop); }}>Update</button>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteShop(shop._id, shop.Name, shop.Location); }}>Delete</button>
                  </div>
                )}

                {/* Show update form if you are updating it */}
                {editingShop?._id === shop._id && (
                  <div className="updateshop" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="text"
                      value={editingShop.Name}
                      onChange={(e) => setEditingShop({ ...editingShop, Name: e.target.value })}
                      onClick={(e) => e.stopPropagation()} // Prevent navigation
                    />
                    <input
                      type="text"
                      value={editingShop.Location}
                      onChange={(e) => setEditingShop({ ...editingShop, Location: e.target.value })}
                      onClick={(e) => e.stopPropagation()} // Prevent navigation
                    />
                    <button onClick={(e) => { e.stopPropagation(); handleUpdateShop(shop._id); }}>Save</button>
                    <button onClick={(e) => { e.stopPropagation(); setEditingShop(null); }}>Cancel</button>
                  </div>
                )}
              </div>
            ))
            )}
        </div>
    </div>
  );
};

export default StaffShopList;

