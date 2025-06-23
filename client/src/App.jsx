import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Navbar from "./components/Navbar";
import "bootstrap/dist/css/bootstrap.min.css";
import AdminPanel from "./pages/Admin";
import Profile from "./pages/Profile";
import PdfQA from "./pages/PdfQA";

const App = () => {
  return (
    <Router>
      <div className="bg-custom vh-100">
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<PdfQA />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
