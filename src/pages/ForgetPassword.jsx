import React, { useState } from "react";
import axios from "axios";

function ForgetPassword() {
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    newPassword: "",
    confirmPassword: ""
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
    <div className="hero min-h-screen bg-gray-900 flex items-center justify-center p-5">
      <div className="card bg-gray-800 w-full max-w-sm p-6 rounded-2xl shadow-lg">
        <h2 className="text-white text-2xl mb-4 text-center">Reset Password</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            name="email"
            placeholder="Enter Email"
            className="input input-bordered w-full"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="name"
            placeholder="Enter Name"
            className="input input-bordered w-full"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="newPassword"
            placeholder="New Password"
            className="input input-bordered w-full"
            value={formData.newPassword}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            className="input input-bordered w-full"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {message && <p className="text-green-500 text-sm">{message}</p>}
          <button type="submit" className="btn btn-primary w-full">Update Password</button>
        </form>
      </div>
    </div>
  );
}

export default ForgetPassword;
