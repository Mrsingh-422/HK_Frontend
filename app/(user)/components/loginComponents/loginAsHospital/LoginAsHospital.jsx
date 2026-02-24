"use client";
import React, { useState } from "react";
import "./LoginAsHospital.css";
import { useGlobalContext } from "@/app/context/GlobalContext";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";

function LoginAsHospital() {
  const [identifier, setIdentifier] = useState(""); // phone OR email
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(false);
  
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
  
    const { openModal, closeModal } = useGlobalContext();
    const { loginAsHospital } = useAuth();

    const router = useRouter();
  
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
  
        const res = await loginAsHospital(userLoginData);
  
        setSuccess("Login successful! Redirecting...");
  
        setTimeout(() => {
          router.push("/hospital");
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

      {/* Success Message */}
      {success && (
        <div className="success-msg" style={{ marginBottom: '10px', textAlign: 'center' }}>
          {success}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="error-msg" style={{ marginBottom: '10px', textAlign: 'center' }}>
          {error}
        </div>
      )}

      {/* TOP LOGIN BOX */}
      <div className="login-user-container">

        {/* LEFT IMAGE */}
        <div className="login-left">
          <img
            src="https://healthvideos12-new1.s3.us-west-2.amazonaws.com/1692600659SMS-Hospital.jpeg"
            alt="Login Illustration"
          />
        </div>

        {/* RIGHT FORM */}
        <div className="login-right">
          <h2>Get Started</h2>

          <input
            type="text"
            placeholder="Enter your mobile number"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />
          <p className="hint-text">We'll never share your email with anyone else.</p>

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

            <span className="forgot" onClick={() => openModal("forgotPassword")}>Forget Password?</span>
          </div>

          {/* Login Button */}
          <button className="login-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? "Logging in..." : "Login →"}
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

      {/* USER DESCRIPTION SECTION */}
      <div className="user-description">
        <h3>Hospital</h3>

        <div className="desc-item">
          <span className="check-icon">✔</span>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestias
            eius, quas ipsa quam maiores nobis eveniet quasi repellat aliquid
            dolorem omnis nostrum quia hic facere nam ab quo consequatur quisquam!
          </p>
        </div>
      </div>

    </div>
  );
}

export default LoginAsHospital;