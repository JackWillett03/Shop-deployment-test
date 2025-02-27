// This was mostly taken from another project I have done, it has little changes

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css"

const Register = () => {
  const [formData, setFormData] = useState({ username: "", email: "", password: "" }); // Store data
  const [error, setError] = useState(""); // Store error messages
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default behaviour
    try {
      const response = await fetch("${process.env.REACT_APP_API}/users/register", { // Send post request to the backend
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData), // Send data as json
      });

      if (!response.ok) { // Mainly to pick up error code if username or email are not unique
        const result = await response.json(); 
        throw new Error(result.error || "Registration failed"); // Throw error message
      }
      navigate("/login"); // If successful go to login page
    } catch (err) {
      setError("An error occurred while registering.");
    }
  };

  return (
    <div className="registercontainer">
      <form className="registerform" onSubmit={handleSubmit}>
        <h2>Register</h2>
        {/* Header for the form */}
        {error && <p className="error">{error}</p>}
        {/* Input for username */}
        <input
          type="text"
          name="Username"
          placeholder="Username"
          value={formData.Username}
          onChange={handleChange}
          required
        />
        {/* Input for email */}
        <input
          type="Email"
          name="Email"
          placeholder="Email"
          value={formData.Email}
          onChange={handleChange}
          required
        />
        {/* Inupt for password */}
        <input
          type="Password"
          name="Password"
          placeholder="Password"
          value={formData.Password}
          onChange={handleChange}
          required
        />
        {/* Submit button at bottom of the form */}
        <button type="submit">Register</button>
        <p>
            {/* Button to login page if you already have account */}
          Already have an account? <button onClick={() => navigate("/login")} className="link">Login</button>
        </p>
      </form>
    </div>
  );
};

export default Register; // Export for use elsewhere
