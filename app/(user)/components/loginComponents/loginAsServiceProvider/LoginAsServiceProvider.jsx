"use client";
import React, { useState } from "react";
import "./LoginAsServiceProvider.css";
import { useGlobalContext } from "@/app/context/GlobalContext";

function LoginAsServiceProvider() {

  const { openModal, closeModal } = useGlobalContext()

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!phone || !password) {
      setError("All fields are required.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    const serviceProviderData = {
      phone,
      password,
      remember,
    };

    console.log("Service Provider Login Data:", serviceProviderData);

    setSuccess("Login successful!");

    alert("Service Provider Login API called (dummy)!");
  };

  return (
    <div className="login-user-wrapper">

      <div className="login-user-container">

        <div className="login-left">
          <img
            src="https://healthvideos12-new1.s3.us-west-2.amazonaws.com/1692601021service.png"
            alt="Login Illustration"
          />
        </div>

        <div className="login-right">
          <h2>Get Started</h2>

          {/* ✅ ERROR & SUCCESS MESSAGES */}
          {error && <div className="error-msg">{error}</div>}
          {success && <div className="success-msg">{success}</div>}

          <input
            type="text"
            placeholder="Enter your phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <p className="hint-text">
            We'll never share your phone with anyone else.
          </p>

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="login-options">
            <label className="remb">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Remember Password
            </label>

            <span className="forgot">Forget Password?</span>
          </div>

          <button className="login-btn" onClick={handleSubmit}>
            Login →
          </button>

          <p className="register-text">
            Don't have an account{" "}
            <span
              onClick={() => {
                closeModal();
                openModal("register");
              }}
            >
              Register?
            </span>
          </p>
        </div>
      </div>

      {/* USER DESCRIPTION SECTION remains same */}
      <div className="user-description">
        <h3>Pharmacy</h3>
        <div className="desc-item">
          <span className="check-icon">✔</span>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit...
          </p>
        </div>

        <h3>Nursing</h3>
        <div className="desc-item">
          <span className="check-icon">✔</span>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit...
          </p>
        </div>

        <h3>Laboratory</h3>
        <div className="desc-item">
          <span className="check-icon">✔</span>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit...
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginAsServiceProvider;
