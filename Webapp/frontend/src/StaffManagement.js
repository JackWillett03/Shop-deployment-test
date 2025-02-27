import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './StaffManagement.css';

const StaffManagement = () => {
  const { shopId } = useParams();
  const navigate = useNavigate();

  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [isManager, setIsManager] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStaff, setNewStaff] = useState({
    Username: '',
    Password: '',
    IsManager: false,  // IsManager is false by default
    ShopId: shopId, // ShopId is the one in the url
  });

  // Fetch staff data
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${process.env.REACT_APP_API}/staff/shop/${shopId}`, { // GET Request
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Unauthorized access. Please log in.");
        }

        const data = await response.json();
        setStaff(data); // Set the staff data
      } catch (error) {
        console.error("Error fetching staff data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStaff();
  }, [shopId]);

  // Decode JWT
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = parseJwt(token);
      const currentTime = Math.floor(Date.now() / 1000);
      if (decodedToken && decodedToken.exp > currentTime) {
        setIsOwner(decodedToken.isOwner || false); // Check if the user is an owner
        setIsManager(decodedToken.isManager || false); // Check if the user is a manager
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        navigate('/'); // Go to ShopList if token is invalid
      }
    } else {
      navigate('/'); // Go to ShopList
    }
  }, []);

  const parseJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(atob(base64));
    } catch (e) {
      return null;
    }
  };

  // Logout button
  const handleLogout = () => {
    localStorage.removeItem('token'); // Remove token
    localStorage.removeItem('username'); // Remove username
    navigate('/'); // Go to ShopList
  };

  // Back button
  const handleBackButton = () => {
    const back = localStorage.getItem("page");
    navigate(back);
  };

  // Toggle menu
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Handle input
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewStaff({
      ...newStaff,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  // Add staff
  const handleAddStaff = async (e) => {
    e.preventDefault();
    const staffData = { ...newStaff, ShopId: shopId }; // Set ShopId based on the one already selected
    try {
      const response = await fetch('${process.env.REACT_APP_API}/staff', { // POST Request
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(staffData),
      });

      const data = await response.json();
      if (response.ok) {
        alert('Staff added successfully!');
        setShowAddForm(false);
        setNewStaff({ // Reset form
          Username: '',
          Password: '',
          IsManager: false, 
          ShopId: shopId,
        });
        setStaff([...staff, data]); // Update staff list
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error adding staff:', error);
    }
  };

  // Reset the form when canceled
  const handleCancel = () => {
    setShowAddForm(false);
    setNewStaff({
      Username: '',
      Password: '',
      IsManager: false, 
      ShopId: shopId,
    });
  };

  // Delete staff
  const handleDeleteStaff = async (staffId) => {
    try {
      const token = localStorage.getItem('token'); // Get JWT
      const response = await fetch(`${process.env.REACT_APP_API}/staff/${staffId}`, { // DELETE request
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`, // Send the authorisation header
        },
      });

      if (response.ok) {
        alert('Staff deleted successfully!');
        setStaff(staff.filter((staffMember) => staffMember._id !== staffId)); // Remove the deleted staff
      } else {
        const data = await response.json();
        alert(data.message); 
      }
    } catch (error) {
      console.error('Error deleting staff:', error);
    }
  };

  return (
    <div className="staffmanagementpage">
      {/* Dropdown menu */}
      <button className="menubutton" onClick={toggleMenu}>☰</button>

      {/* Menu */}
      {menuOpen && (
        <div className="menu">
          <button onClick={handleLogout} style={{ color: 'red' }}>
            Staff Logout
          </button>
        </div>
      )}

      {/* Back button */}
      <button className="loginbutton" onClick={handleBackButton}>Back</button>

      <h1>Staff Management</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="staffcardscontainer">
          <div className="cardsgrid">
            {staff.length > 0 ? (
              staff.map((staffMember) => (
                <div key={staffMember._id} className="card">
                  <div className="cardbody">
                    <h3>{staffMember.Username}</h3>
                    <p><strong>Manager:</strong> {staffMember.IsManager ? 'Yes' : 'No'}</p>
                    <p><strong>Owner:</strong> {staffMember.IsOwner ? 'Yes' : 'No'}</p>
                    <p><strong>Staff ID:</strong> {staffMember._id}</p> {/* Show Staff ID */}
                    {/* Delete Button */}
                    {isOwner || isManager ? (
                      <button
                        className="deletebuttons"
                        onClick={() => handleDeleteStaff(staffMember._id)}
                      >
                        Delete
                      </button>
                    ) : null}
                  </div>
                </div>
              ))
            ) : (
              <p>No staff found for this shop.</p>
            )}
          </div>
        </div>
      )}

      {/* Add staff button */}
      {(isOwner || isManager) && (
        <button className="addbutton" onClick={() => setShowAddForm(true)}>
          Add Staff
        </button>
      )}

      {/* Add staff form */}
      {showAddForm && (
        <form className="addstaffform" onSubmit={handleAddStaff}>
          <label htmlFor="Username">Username:</label>
          <input
            type="text"
            name="Username"
            placeholder="Username"
            value={newStaff.Username}
            onChange={handleInputChange}
            required
          />
          <label htmlFor="Password">Password:</label>
          <input
            type="password"
            name="Password"
            placeholder="Password"
            value={newStaff.Password}
            onChange={handleInputChange}
            required
          />
          {isOwner && (
            <label>
              <input
                type="checkbox"
                name="IsManager"
                checked={newStaff.IsManager}
                onChange={handleInputChange}
              />
              Is Manager
            </label>
          )}
          <button type="submit" className="addbutton">Add</button>
          <button
            className="cancel"
            type="button"
            onClick={handleCancel}
            style={{ backgroundColor: '#007BFF', color: 'white' }}
          >
            Cancel
          </button>
        </form>
      )}
    </div>
  );
};

export default StaffManagement;
