import React, { useState } from "react";
import axiosInstance from "../axiosInstance";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post("/login", formData);
      setMessage(response.data.message);
      setError("");

      if (response.data.user.isVerified === false) {
        setMessage("Please verify your account before logging in.");
      } else {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        if (response.data.user.role === "admin") {
          navigate("/admin");
        } else if (response.data.user.role === "doctor") {
          navigate("/doctor");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred");
      setMessage("");
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center align-items-center bg-white shadow rounded">
        {/* Left side Illustration */}
        <div className="col-md-6 d-none d-md-block text-center p-4">
          <img
            src="/images/login.svg"
            alt="Login Illustration"
            className="img-fluid"
          />
        </div>

        {/* Right side Login Form */}
        <div className="col-md-6 p-4">
          <h2 className="text-center mb-4 text-primary">Login</h2>
          {message && (
            <div className="alert alert-success text-center">{message}</div>
          )}
          {error && (
            <div className="alert alert-danger text-center">{error}</div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <label htmlFor="email" className="form-label fw-bold">
                Email
              </label>
              <input
                type="email"
                className="form-control"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label fw-bold">
                Password
              </label>
              <input
                type="password"
                className="form-control"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary w-100 fw-bold py-2"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
