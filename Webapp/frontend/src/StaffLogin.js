import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css"; // Same look as Login so use that

const StaffLogin = () => {
  const [formData, setFormData] = useState({ Username: "", Password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.REACT_APP_API}/staff/login`, { // POST request
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) { // Successfully logged in
        if (result.token) {
          localStorage.setItem("staffUsername", formData.Username); // Store staff username
          localStorage.setItem("token", result.token); // Store JWT token
          alert(`Logged in as Staff: ${formData.Username}`);
          navigate("/staffsl"); // Go to staff shop page
        } else {
          setError("Login failed, no token received.");
        }
      } else {
        setError(result.message || "Invalid username or password.");
      }
    } catch (err) {
      setError("An error occurred while logging in.");
    }
  };

  const handleBack = () => { // Go to shop page
    navigate("/");
  };

  return (
    <div className="login-container">
      <div className="header">
        {/* Back button to go to the shop page */}
        <button onClick={handleBack} className="backbutton">
          Home
        </button>
      </div>
      {/* Login form */}
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Staff Login</h2>
        {error && <p className="error">{error}</p>}
        <input
          type="text"
          name="Username"
          placeholder="Username"
          value={formData.Username}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="Password"
          placeholder="Password"
          value={formData.Password}
          onChange={handleChange}
          required
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default StaffLogin;
