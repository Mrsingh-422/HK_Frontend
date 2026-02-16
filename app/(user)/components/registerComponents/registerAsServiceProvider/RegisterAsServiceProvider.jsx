"use client";
import React, { useState } from "react";
import "./RegisterAsServiceProvider.css";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useGlobalContext } from "@/app/context/GlobalContext";

function RegisterAsServiceProvider() {
  const { registerAsServiceProvider, loading } = useAuth();
  const { closeModal, openModal } = useGlobalContext();
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: "",
    gender: "Male",
    category: "Nursing",
    phone: "",
    location: "",
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
      !formData.name ||
      !formData.phone ||
      !formData.location ||
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
      await registerAsServiceProvider(formData);

      setSuccess("Service Provider Registered Successfully!");

      setFormData({
        name: "",
        gender: "Male",
        category: "Nursing",
        phone: "",
        location: "",
        password: "",
        termsAccepted: false,
      });

      router.push("/")

    } catch (err) {
      setError(err?.message || err);
    }
  };

  return (
    <div className="service-wrapper">
      <div className="service-container">
        <div className="service-left">
          <img
            src="https://healthvideos12-new1.s3.us-west-2.amazonaws.com/1692602393service.png"
            alt="Service Illustration"
          />
        </div>

        <div className="service-right">
          <h1>Get Started</h1>

          {error && <div className="error-msg">{error}</div>}
          {success && <div className="success-msg">{success}</div>}

          <form className="service-form" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Enter your name"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />

            <select name="gender" value={formData.gender} onChange={handleChange}>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>

            <label className="category-label">Select Category</label>
            <select name="category" value={formData.category} onChange={handleChange}>
              <option>Nursing</option>
              <option>Pharmacy</option>
              <option>Phlebotomist / Lab</option>
            </select>

            <input
              type="text"
              placeholder="Enter your phone number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />

            <p className="small-text">
              We'll never share your Phone with anyone else.
            </p>

            <input
              type="text"
              placeholder="Enter your location"
              name="location"
              value={formData.location}
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
                  closeModal
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
          <h2>Nursing</h2>
          <p>
            Provide professional home care services including elderly care,
            post-surgery assistance and patient monitoring.
          </p>
        </div>

        <div className="service-info">
          <h2>Pharmacy</h2>
          <p>
            Register your pharmacy to deliver medicines quickly and safely.
          </p>
        </div>

        <div className="service-info">
          <h2>Lab / Phlebotomist</h2>
          <p>
            Offer home sample collection and diagnostic services.
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterAsServiceProvider;