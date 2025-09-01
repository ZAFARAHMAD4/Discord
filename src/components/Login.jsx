import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router";
import { LuLogIn } from "react-icons/lu";
import { MdEmail } from "react-icons/md";
import { FaLock } from "react-icons/fa";
const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const navigate = useNavigate();
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const email = formData.email.trim();
    const trimmedPassword = formData.password.trim();

    try {
      const response = await axios.post(`${import.meta.env.VITE_DEV_URL}/api/login`, {
        email: email,
        password: trimmedPassword,
      });

      console.log(email, "enroll");
      console.log(response.data, "response");

      if (response.data && response.data.user) {
        localStorage.setItem("currentUser", JSON.stringify(response.data.user));
        // window.location.href = "/home";
        navigate('/home')

      } else {
        setError("Invalid credentials. Please try again.");
      }
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  const handleGoogleLogin = () => {
    alert("Google Sign-In not implemented yet.");
  };

  return (
    <div className="hero bgg min-h-screen p-5">


      {/* Right Card Form */}
      <div className="card bglogin w-full max-w-sm shrink-0 shadow-2xl">
        <form className="card-body" onSubmit={handleLogin}>
          <div className="input-wrapper">
            <MdEmail className="input-icon" />
            <input
              type="email"
              name="email"
              className="gradient-input w-full"
              placeholder="Enter Email"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="off"
            />
          </div>

          <div className="input-wrapper">
            <FaLock className="input-icon" />
            <input
              type="password"
              name="password"
              className="gradient-input w-full"
              placeholder="Enter Password"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
          </div>

          <div className="text-right mt-2">
            <Link
              to="/forgot-password"
              className="link link-hover text-sm gradient-link"
            >
              Forgot password?
            </Link>
          </div>

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

          <button
            className="animated-gradient-btn mt-4 flex items-center justify-center gap-2"
            type="submit"
            disabled={loading}
          >
            <LuLogIn className="me-2" />
            {loading ? (
              <span className="loading loading-infinity loading-md"></span>
            ) : (
              "Login"
            )}
          </button>

          <div className="divider text-white">--- OR ---</div>
          <Link
            to="/Signup"
            className="animated-gradient-btn w-full flex items-center justify-center gap-2"
          >
            <img
              src="https://img.icons8.com/color/16/000000/google-logo.png"
              alt="Google"
            />
            Create a New Account
          </Link>
        </form>
      </div>

    </div>
  );
};

export default Login;
