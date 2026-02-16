"use client";
import React, { useState } from "react";
import "./UserRegister.css";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useGlobalContext } from "@/app/context/GlobalContext";

function UserRegister() {
  const { registerAsUser, loading } = useAuth();
  const { closeModal, openModal } = useGlobalContext();

  const router = useRouter();

  const [formData, setFormData] = useState({
    phone: "",
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
    if (!formData.phone || !formData.password) {
      return "All fields are required";
    }

    if (formData.password.length < 6) {
      return "Password must be at least 6 characters";
    }

    if (!formData.termsAccepted) {
      return "You must accept terms & conditions";
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
      await registerAsUser(formData);
      setSuccess("Registration successful!");
      setFormData({
        phone: "",
        password: "",
        termsAccepted: false,
      });

      // router.push("/");
      closeModal
      // openModal('login')
    } catch (err) {
      setError(err?.message || err);
    }
  };

  return (
    <div className="register-wrapper">
      <div className="register-container">
        {/* LEFT SIDE */}
        <div className="register-left">
          <img
            src="https://healthvideos12-new1.s3.us-west-2.amazonaws.com/1692602351user-login.png"
            alt="Register Illustration"
          />
        </div>

        {/* RIGHT SIDE */}
        <div className="register-right">
          <h1>Get Started</h1>

          {error && <p className="error-msg">{error}</p>}
          {success && <p className="success-msg">{success}</p>}

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Enter your mobile number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />

            <p className="small-text">
              We'll never share your phone with anyone else.
            </p>

            <input
              type="password"
              placeholder="Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />

            <div className="terms">
              <input
                type="checkbox"
                name="termsAccepted"
                checked={formData.termsAccepted}
                onChange={handleChange}
              />
              <span>Allow All Terms & Conditions on this site</span>
            </div>

            <button type="submit" className="register-btn" disabled={loading}>
              {loading ? "Registering..." : "Register →"}
            </button>
          </form>

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
        </div>
      </div>

      {/* INFO SECTION */}
      <div className="user-info">
        <h2>User Benefits</h2>

        <div className="user-point">
          ✓ Secure & fast registration
        </div>

        <div className="user-point">
          ✓ Access your dashboard instantly
        </div>
      </div>
    </div>
  );
}

export default UserRegister;