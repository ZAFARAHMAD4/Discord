import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Login from "./components/Login";
import IncomingCall from "./components/IncomingCall";
import Home from "./pages/Home";
import Signup from "./components/Signup";
import { useEffect } from "react";
import ForgetPassword from "./pages/ForgetPassword";

function App() {
   
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const data = localStorage.getItem("currentUser");

    if (data) {
      // Agar user login hai → sirf login/signup/forgot-password pe jaane se roko
      if (
        location.pathname === "/" ||
        location.pathname === "/Signup" ||
        location.pathname === "/forgot-password"
      ) {
        navigate("/home");
      }
    } else {
      // Agar user login nahi hai → sirf protected pages (like /home) pe jaane se roko
      if (location.pathname === "/home") {
        navigate("/");
      }
    }
  }, [navigate, location]);

 // ye component sirf check ke liye hai

  return (
    <>
      <Routes>
        {/* Pehle Login page open hoga */}
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/Signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgetPassword />} />
      </Routes>
    </>
  );
}

export default App;
