import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

const Profile = () => {
  const [userData, setUserData] = useState({}); // Stores user's profile data
  const [newEmail, setNewEmail] = useState(""); // Email input to be used when updating
  const [currentPassword, setCurrentPassword] = useState(""); // Users current password, used to validate when updating or deleting
  const [newPassword, setNewPassword] = useState(""); // Password input to be used when updating
  const [confirmPassword, setConfirmPassword] = useState(""); // Password confirmation for update
  const [errorMessage, setErrorMessage] = useState(""); // Error message
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false); // Toggle the Update Email input boxes
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false); // Toggle the Update PAssword input boxes
  const [confirmDelete, setConfirmDelete] = useState(false); // Toggle delete account conformation form
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { // Gets data when the page is loaded
    const fetchUserData = async () => {
      try {
        const username = localStorage.getItem("username"); // Get the username from storage
        if (!username) {
          navigate("/login"); // Go to login if no username stored
          return;
        }

        const response = await fetch(`http://localhost:82/users/username/${username}`); // Get request to backend
        if (!response.ok) {
          throw new Error("Failed to fetch user data.");
        }
        const data = await response.json();
        setUserData(data); // Update user data state
      } catch (err) {
        setErrorMessage(err.message);
      }
    };

    fetchUserData();
  }, [navigate]); // Makes it rerun on navigate

  useEffect(() => { // Check if user is logged in
    const token = localStorage.getItem("token"); // Get the JWT from storage
    const username = localStorage.getItem("username"); // Get the username from storage

    if (token && username) {
      const decodedToken = parseJwt(token); // Decode the JWT
      const currentTime = Math.floor(Date.now() / 1000); // Get the current time in seconds

      // Check if token is still valid
      if (decodedToken && decodedToken.exp > currentTime) {
        setIsLoggedIn(true); // User is logged in
      } else { // If JWT has expired log the user out
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        alert("Session expired. You have been logged out.");
        navigate("/"); // Go to the main page
        setIsLoggedIn(false); // User is logged out
      }
    } else {
      setIsLoggedIn(false); // If no token, user is not logged in
      navigate("/login"); // Go to login page
    }
  }, [navigate]); // Runs once on component load

  const parseJwt = (token) => { // Decodes JWT
    try {
      const base64Url = token.split(".")[1]; // Extract payload
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/"); // Fix base64 format
      return JSON.parse(atob(base64)); // Decode and parse payload
    } catch (e) {
      return null;
    }
  };

  const handleBack = () => { // Go back to the page you were last on
    const back = localStorage.getItem("page");
    navigate(back);
    localStorage.removeItem("page"); // Remove the stored page
  };

  const handleUpdateEmail = async () => { // Updating Email address
    if (!newEmail || !currentPassword) { // Make sure there is an email and password
      setErrorMessage("Both email and password are required.");
      return;
    }

    const username = localStorage.getItem("username"); // Get the username from storage
    const response = await fetch(`http://localhost:82/users/username/${username}`, { // PUT request
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ Email: newEmail, Password: currentPassword }), // Send email and password
    });

    const result = await response.json();
    if (response.ok) {
      setUserData((prevData) => ({ ...prevData, Email: newEmail })); // Update user data state
      setNewEmail(""); // Clear input
      setCurrentPassword(""); // Clear input
      setIsUpdatingEmail(false); // Hide the email update form
      setErrorMessage(""); // Clear error message
    } else {
      setErrorMessage(result.message);
    }
  };

  const handleUpdatePassword = async () => { // Update password
    if (!currentPassword || !newPassword || !confirmPassword) { // All 3 must be provided
      setErrorMessage("Please fill out all 3 input fields.");
      return;
    }

    if (newPassword !== confirmPassword) { // Make sure the new password and the current password match
      setErrorMessage("Passwords do not match.");
      return;
    }

    const username = localStorage.getItem("username"); // Get the username
    const response = await fetch(`http://localhost:82/users/username/${username}`, { // PUT request
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ Password: newPassword, CurrentPassword: currentPassword }), // Send the new and current password
    });

    const result = await response.json();
    if (response.ok) {
      setCurrentPassword(""); // Clear input
      setNewPassword(""); // Clear input
      setConfirmPassword(""); // Clear input
      setIsUpdatingPassword(false); // Hide the form
      setErrorMessage(""); // Clear errors
    } else {
      setErrorMessage(result.message);
    }
  };

  const handleDeleteAccount = async () => { // Delete Account
    const username = localStorage.getItem("username"); // Get username
    const password = currentPassword; // Use the current password to make sure its the actual user

    const response = await fetch(`http://localhost:82/users/username/${username}`, { // DELETE request
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ Password: password }), // Send password to confirm it
    });

    const result = await response.json();
    if (response.ok) {
      localStorage.removeItem("username"); // Remove username from storage
      localStorage.removeItem("token"); // Remove JWT from storage
      navigate("/"); // Go to main page
    } else {
      setErrorMessage(result.message);
    }
  };

  const handleLogout = () => { // Logout
    localStorage.removeItem("username"); // Remove username and token from storage
    localStorage.removeItem("token");
    navigate("/login"); // Go to login page
  };

  return (
    <div className="profilecontainer">
      {/* Back button */}
      <button className="backbutton" onClick={handleBack}>
        Back
      </button>

      {/* Page title */}
      <div className="pagename">Profile</div>

      <div className="formcontainer">
        {/* Error messages if they exist */}
        {errorMessage && <div className="errormessage">{errorMessage}</div>}
        {/* Username and Email */}
        <p>Username: {userData.Username}</p>
        <p>Email: {userData.Email}</p>

        {/* Update Email */}
        <button onClick={() => setIsUpdatingEmail(!isUpdatingEmail)} className="buttons">
          {isUpdatingEmail ? "Cancel" : "Update Email"}
        </button>
        {/* Email update form */}
        {isUpdatingEmail && (
          <div className="updateform">
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="New Email"
            />
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Current Password"
            />
            <button onClick={handleUpdateEmail}>Update Email</button>
          </div>
        )}

        {/* Update Password */}
        <button onClick={() => setIsUpdatingPassword(!isUpdatingPassword)} className="buttons">
          {isUpdatingPassword ? "Cancel" : "Update Password"}
        </button>
        {/* Password update form */}
        {isUpdatingPassword && (
          <div className="updateform">
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Current Password"
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New Password"
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm New Password"
            />
            <button onClick={handleUpdatePassword}>Update Password</button>
          </div>
        )}

        {/* Logout Button */}
        <button onClick={handleLogout} className="logoutbutton">
          Logout
        </button>

        {/* Delete Account */}
        <div className="deleteaccountcontainer">
          <button
            className="deletebutton"
            onClick={() => setConfirmDelete(true)}
          >
            Delete Account
          </button>
          {confirmDelete && (
            <div className="deleteaccountform">
              <p>Are you sure?</p>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your password"
              />
              <button onClick={handleDeleteAccount}>Yes, Delete Account</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
