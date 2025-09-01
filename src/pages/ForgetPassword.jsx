import React, { useState } from "react";
import axios from "axios";
import { FaEnvelope, FaUser, FaLock } from "react-icons/fa";
import "../css/ForgetPassword.css"; // custom css import

function ForgetPassword() {
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_DEV_URL}/api/forgot-password`,
        formData
      );
      setMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="forget-container">
      <div className="forget-card">
        <h2 className="forget-title">Reset Password</h2>

        <form
          onSubmit={handleSubmit}
          className="forget-form"
          autoComplete="off" // 🔴 autofill disable
        >
          {/* Email */}
          <div className="input-group">
            <FaEnvelope className="input-icon" />
            <input
              type="email"
              name="email"
              placeholder="Enter Email"
              className="input-field"
              value={formData.email}
              onChange={handleChange}
              autoComplete="off" // 🔴 autofill disable
              required
            />
          </div>

          {/* Name */}
          <div className="input-group">
            <FaUser className="input-icon" />
            <input
              type="text"
              name="name"
              placeholder="Enter Name"
              className="input-field"
              value={formData.name}
              onChange={handleChange}
              autoComplete="off" // 🔴 autofill disable
              required
            />
          </div>

          {/* New Password */}
          <div className="input-group">
            <FaLock className="input-icon" />
            <input
              type="password"
              name="newPassword"
              placeholder="New Password"
              className="input-field"
              value={formData.newPassword}
              onChange={handleChange}
              autoComplete="new-password" // 🔴 recommended for password fields
              required
            />
          </div>

          {/* Confirm Password */}
          <div className="input-group">
            <FaLock className="input-icon" />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              className="input-field"
              value={formData.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password" // 🔴 recommended for password fields
              required
            />
          </div>

          {/* Error & Success */}
          {error && <p className="error-msg">{error}</p>}
          {message && <p className="success-msg">{message}</p>}

          <button type="submit" className="submit-btn">
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}

export default ForgetPassword;
