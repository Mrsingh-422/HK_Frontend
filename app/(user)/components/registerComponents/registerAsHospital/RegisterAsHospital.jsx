"use client";
import React, { useState } from "react";
import "./RegisterAsHospital.css";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";

function RegisterAsHospital({ onClose, openModal }) {
  const { registerAsHospital, loading } = useAuth();
  const router = useRouter()

  const [formData, setFormData] = useState({
    registerAs: "",
    hospitalName: "",
    email: "",
    phone: "",
    licenseNumber: "",
    password: "",
    termsAccepted: false,
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateForm = () => {
    if (
      !formData.registerAs ||
      !formData.hospitalName ||
      !formData.email ||
      !formData.phone ||
      !formData.licenseNumber ||
      !formData.password
    ) {
      return "All fields are required.";
    }

    if (formData.password.length < 6) {
      return "Password must be at least 6 characters.";
    }

    if (!formData.termsAccepted) {
      return "You must accept terms & conditions.";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      await registerAsHospital(formData);

      setSuccess("Hospital Registered Successfully! Please wait for admin approval.");

      setFormData({
        registerAs: "",
        hospitalName: "",
        email: "",
        phone: "",
        licenseNumber: "",
        password: "",
        termsAccepted: false,
      });
      router.push("/");

    } catch (err) {
      setError(err?.message || err);
    }
  };

  return (
    <div className="service-wrapper">
      <div className="service-container">
        <div className="service-left">
          <img
            src="https://healthvideos12-new1.s3.us-west-2.amazonaws.com/1692602447SMS-Hospital.jpeg"
            alt="Hospital"
          />
        </div>

        <div className="service-right">
          <h1>Get Started</h1>

          {error && <div className="error-msg">{error}</div>}
          {success && <div className="success-msg">{success}</div>}

          <form className="service-form" onSubmit={handleSubmit}>
            <select
              name="registerAs"
              value={formData.registerAs}
              onChange={handleChange}
            >
              <option value="">Register As</option>
              <option>Government Hospital</option>
              <option>Private Hospital</option>
              <option>Charity Hospital</option>
            </select>

            <input
              type="text"
              placeholder="Hospital name"
              name="hospitalName"
              value={formData.hospitalName}
              onChange={handleChange}
            />

            <input
              type="email"
              placeholder="Hospital email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />

            <input
              type="text"
              placeholder="Hospital phone number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />

            <p className="small-text">
              We'll never share your Phone with anyone else.
            </p>

            <input
              type="text"
              placeholder="Enter your license number"
              name="licenseNumber"
              value={formData.licenseNumber}
              onChange={handleChange}
            />

            <input
              type="password"
              placeholder="Enter your password"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />

            <div className="terms">
              <input
                type="checkbox"
                id="terms"
                name="termsAccepted"
                checked={formData.termsAccepted}
                onChange={handleChange}
              />
              <label htmlFor="terms">
                Allow All Terms & Conditions on this site
              </label>
            </div>

            <button className="register-btn" type="submit" disabled={loading}>
              {loading ? "Registering..." : "Register →"}
            </button>

            <p className="login-text">
              Already have an account?{" "}
              <span
                onClick={() => {
                  onClose();
                  openModal("login");
                }}
              >
                Login
              </span>
            </p>
          </form>
        </div>
      </div>

      <div className="bottom-section">
        <div className="service-info">
          <h2>Hospital</h2>
          <p>
            Join our platform and manage appointments, doctors, and patients efficiently.
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterAsHospital;