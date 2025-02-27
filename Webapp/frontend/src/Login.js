// This page is largely taken from a previous project I did, there are some minor differences

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css"

const Login = () => {
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
      const response = await fetch("${process.env.REACT_APP_API}/users/login", { // POST request to users route
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) { // Successfully logged in
        if (result.token) {
          localStorage.setItem("username", formData.Username); // Store username
          localStorage.setItem("token", result.token); // Store JWT token
          alert(`Logged in as ${formData.Username}`); 
          navigate("/"); // Navigate back to previous page
        } else {
          setError("Login failed, no token, try again.");
        }
      } else {
        setError(result.message || "Login failed, please check your username and password.");
      }
    } catch (err) {
      setError("An error occurred while logging in.");
    }
  };

  const handleBack = () => { // Takes you back to the shoplist page
    const back = localStorage.getItem("page")
    navigate(back);
  };

  return (
    <div className="login-container">
      <div className="header">
        {/* Back button to go to Shop */}
        <button onClick={handleBack} className="backbutton">
          Back
        </button>
      </div>
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Login</h2>
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
        <p>
          Don't have an account?{" "}
          <button onClick={() => navigate("/register")} className="link">
            Register
          </button>
        </p>
      </form>
    </div>
  );
};

export default Login;
