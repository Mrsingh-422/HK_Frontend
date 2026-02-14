"use client";
import React, { useState } from "react";
import "./UserRegister.css";

function UserRegister({ onClose, openModal }) {

  const [formData, setFormData] = useState({
    phone: "",
    password: "",
    termsAccepted: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    alert("Form submitted! Check console for data.");
    console.log("Form Data:", formData);
  };

  return (
    <div className="register-wrapper">
      <div className="register-container">

        <div className="register-left">
          <img
            src="https://healthvideos12-new1.s3.us-west-2.amazonaws.com/1692602351user-login.png"
            alt="Register Illustration"
          />
        </div>

        <div className="register-right">
          <h1>Get Started</h1>

          <input
            type="text"
            placeholder="Enter your mobile number"
            name="phone"
            onChange={handleChange}
          />
          <p className="small-text">
            We'll never share your phone with anyone else.
          </p>

          <input
            type="password"
            placeholder="Password"
            name="password"
            onChange={handleChange}
          />

          <div className="terms">
            <input
              type="checkbox"
              name="termsAccepted"
              onChange={handleChange}
            />
            <span>Allow All Terms & Conditions on this site</span>
          </div>

          <button className="register-btn" onClick={handleSubmit}>
            Register →
          </button>

          <p className="login-text">
            You have all Register{" "}
            <span
              onClick={() => {
                onClose();
                openModal("login");
              }}
            >
              Login?
            </span>
          </p>
        </div>
      </div>

      <div className="user-info">
        <h2>User</h2>

        <div className="user-point">
          ✓ Lorem ipsum dolor sit amet consectetur adipisicing elit.
        </div>

        <div className="user-point">
          ✓ Lorem ipsum dolor sit amet consectetur adipisicing elit.
        </div>
      </div>

    </div>
  );
}

export default UserRegister;