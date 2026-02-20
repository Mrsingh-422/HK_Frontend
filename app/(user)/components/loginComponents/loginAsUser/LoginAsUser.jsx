"use client";
import React, { useState } from "react";
import "./LoginAsUser.css";
import { useAuth } from "@/app/context/AuthContext";
import { useGlobalContext } from "@/app/context/GlobalContext";

function LoginAsUser() {
  const [identifier, setIdentifier] = useState(""); // phone OR email
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { openModal, closeModal } = useGlobalContext();
  const { loginAsUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!identifier || !password) {
      setError("Please enter phone/email and password.");
      return;
    }

    try {
      setLoading(true);

      // Check if input is email
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);

      const userLoginData = {
        password,
        remember,
        ...(isEmail
          ? { email: identifier }
          : { phone: identifier }),
      };

      const res = await loginAsUser(userLoginData);

      setSuccess("Login successful! Redirecting...");

      setTimeout(() => {
        closeModal(); // ✅ fixed
      }, 1500);

    } catch (err) {
      setError(
        err?.response?.data?.message || "Invalid phone/email or password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-user-wrapper">
      <div className="login-user-container">

        <div className="login-left">
          <img
            src="https://healthvideos12-new1.s3.us-west-2.amazonaws.com/1692602351user-login.png"
            alt="Login Illustration"
          />
        </div>

        <div className="login-right">
          <h2>Get Started</h2>

          {/* ✅ Success Message */}
          {success && <div className="success-msg">{success}</div>}

          {/* ✅ Error Message */}
          {error && <div className="error-msg">{error}</div>}

          <input
            type="text"
            placeholder="Enter your phone number or email"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />

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

          <button
            className="login-btn"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login →"}
          </button>

          <p className="register-text">
            Don't have an account{" "}
            <span
              onClick={() => {
                closeModal(); // ✅ fixed
                openModal("register");
              }}
            >
              Register?
            </span>
          </p>
        </div>
      </div>

      <div className="user-description">
        <h3>User</h3>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolore maiores, in aliquam cum nulla laudantium voluptatum maxime numquam ipsum molestias porro totam. Eius ducimus harum, sint perspiciatis vel delectus quam.
        </p>
      </div>
    </div>
  );
}

export default LoginAsUser;