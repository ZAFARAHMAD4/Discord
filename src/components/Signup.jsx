import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FaUser, FaEnvelope, FaLock } from "react-icons/fa"; // 👈 Icons import

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

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_DEV_URL}/api/users/signup`,
        {
          name: formData.name,
          email: formData.email.trim(),
          password: formData.password.trim(),
        }
      );

      if (response.status === 201) {
        setSuccess("✅ Account created successfully! Please login.");
        setFormData({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
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
          <fieldset className="fieldset space-y-3">
            {/* Name */}
            <div className="relative">
              <FaUser className="absolute left-3 top-4 text-gray-400 iconsss" />
              <input
                type="text"
                name="name"
                className="gradient-input w-full pl-10"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            {/* Email */}
            <div className="relative">
              <FaEnvelope className="absolute left-4 top-3 text-gray-400 iconsss" />
              <input
                type="email"
                name="email"
                className="gradient-input w-full pl-10"
                placeholder="example@gmail.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            {/* Password */}
            <div className="relative">
              <FaLock className="absolute left-3 top-4 text-gray-400 iconsss" />
              <input
                type="password"
                name="password"
                className="gradient-input w-full pl-10"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <FaLock className="absolute left-3 top-4 text-gray-400 iconsss" />
              <input
                type="password"
                name="confirmPassword"
                className="gradient-input w-full pl-10"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            {/* Error / Success */}
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            {success && <p className="text-green-500 text-sm mt-2">{success}</p>}

            {/* Submit button */}
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

            {/* Already have account */}
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
