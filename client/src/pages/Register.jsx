import React, { useState } from "react";
import axiosInstance from "../axiosInstance";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    phone: "",
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailPattern.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    const phonePattern = /^[0-9]{10}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!phonePattern.test(formData.phone)) {
      newErrors.phone = "Phone number must be 10 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await axiosInstance.post("/register/user", formData);
      setMessage(response.data.message);
      setTimeout(() => {
        navigate("/login");
      }, 1000);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred");
      setMessage("");
    }
  };

  return (
    <div className="container py-5 bg-light">
      <div className="row justify-content-center align-items-center shadow bg-white rounded">
        {/* Illustration */}
        <div className="col-lg-6 d-none d-lg-block p-0">
          <img
            src="/images/register.svg" // Replace with your own image URL if needed
            alt="Register Illustration"
            className="img-fluid h-100 w-100 rounded-start"
            style={{ objectFit: "cover" }}
          />
        </div>

        {/* Form */}
        <div className="col-lg-6 col-md-10 col-sm-12 p-5">
          <h2 className="text-center mb-4 text-primary">Register</h2>
          {message && (
            <div className="alert alert-success text-center">{message}</div>
          )}
          {error && (
            <div className="alert alert-danger text-center">{error}</div>
          )}
          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <label htmlFor="username" className="form-label fw-bold">
                Username
              </label>
              <input
                type="text"
                className="form-control"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
              />
              {errors.username && (
                <small className="text-danger">{errors.username}</small>
              )}
            </div>
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
              />
              {errors.email && (
                <small className="text-danger">{errors.email}</small>
              )}
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
              />
              {errors.password && (
                <small className="text-danger">{errors.password}</small>
              )}
            </div>
            <div className="mb-3">
              <label htmlFor="phone" className="form-label fw-bold">
                Phone
              </label>
              <input
                type="text"
                className="form-control"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
              {errors.phone && (
                <small className="text-danger">{errors.phone}</small>
              )}
            </div>
            <button
              type="submit"
              className="btn btn-primary w-100 py-2 fw-bold"
            >
              Register
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
