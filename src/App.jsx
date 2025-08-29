import { Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import IncomingCall from "./components/IncomingCall";
import Home from "./pages/Home";
import Signup from "./components/Signup";

function App() {
  return (
    <>
      <Routes>
        {/* Pehle Login page open hoga */}
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/Signup" element={<Signup />} />
      </Routes>
    </>
  );
}

export default App;
