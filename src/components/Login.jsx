import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router";
const Login = () => {
  const [formData, setFormData] = useState({ number: "", password: "" });
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

  const number = formData.number.trim();
  const trimmedPassword = formData.password.trim();

  try {
    const response = await axios.post("http://localhost:4000/api/login ", {
      enrollmentNumber: number,
      password: trimmedPassword,
    });

    console.log(number, "enroll");
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
          <fieldset className="fieldset">
            <label className="label">
              <span className="label-text text-white">Enrollment Number</span>
            </label>
            <input
              type="text"
              name="number"
              className="gradient-input w-full"
              placeholder="Enter Your Enrollment Number"
              value={formData.number}
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

            <div className="text-right mt-2">
              <a className="link link-hover text-sm gradient-link">Forgot password?</a>
            </div>


            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            <button
              className={`animated-gradient-btn mt-4`}
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-infinity loading-md"></span>
              ) : (
                "Login"
              )}
            </button>


            <div className="divider">OR</div>
            <Link
              to="/Signup" // 👈 Change this to your target route
              className="animated-gradient-btn w-full flex items-center justify-center gap-2"
            >
              <img
                src="https://img.icons8.com/color/16/000000/google-logo.png"
                alt="Google"
              />
              Create a New Account
            </Link>

          </fieldset>
        </form>
      </div>

    </div>
  );
};

export default Login;
