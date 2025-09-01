import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      setLoading(false);
      return;
    }
   console.log(formData.name,'formdata')
    try {
      const response = await axios.post(`${import.meta.env.VITE_DEV_URL}/api/users/signup`, {
        name: formData.name,
        email: formData.email.trim(),
        password: formData.password.trim(),
      });

      if (response.status === 201) {
        setSuccess("✅ Account created successfully! Please login.");
        setFormData({
          name: "",
          email: "",
          password: "",
        });
      }
    } catch (err) {
      console.error("Signup error:", err.response?.data || err.message);
      setError(err.response?.data?.error || "Signup failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hero bgg min-h-screen p-5">
      <div className="card bglogin w-full max-w-sm shrink-0 shadow-2xl">
        <form className="card-body" onSubmit={handleSignup}>
          <fieldset className="fieldset">
            <label className="label">
              <span className="label-text text-white">Full Name</span>
            </label>
            <input
              type="text"
              name="name"
              className="gradient-input w-full"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <label className="label mt-3">
              <span className="label-text text-white">Gmail ID</span>
            </label>
            <input
              type="email"
              name="email"
              className="gradient-input w-full"
              placeholder="example@gmail.com"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <label className="label mt-3">
              <span className="label-text text-white">Password</span>
            </label>
            <input
              type="password"
              name="password"
              className="gradient-input w-full"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <label className="label mt-3">
              <span className="label-text text-white">Confirm Password</span>
            </label>
            <input
              type="password"
              name="confirmPassword"
              className="gradient-input w-full"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />

            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            {success && <p className="text-green-500 text-sm mt-2">{success}</p>}

            <button
              className="animated-gradient-btn mt-4"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-infinity loading-md"></span>
              ) : (
                "Create Account"
              )}
            </button>

            <div className="text-center mt-3">
              <Link to="/" className="link link-hover text-sm gradient-link">
                Already have an account? Login
              </Link>
            </div>
          </fieldset>
        </form>
      </div>
    </div>
  );
}

export default Signup;
