"use client";
import React, { useState } from "react";
import "./LoginAsUser.css";

function LoginAsUser({ onClose, openModal }) {

  // ✅ State for form inputs
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  // ✅ Dummy Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();

    const userLoginData = {
      mobile,
      password,
      remember,
      role: "user"
    };

    console.log("User Login Data:", userLoginData);

    // Fake API call simulation
    alert("User Login API called (dummy)!");
  };

  return (
    <div className="login-user-wrapper">

      {/* TOP LOGIN BOX */}
      <div className="login-user-container">

        {/* LEFT IMAGE */}
        <div className="login-left">
          <img
            src="https://healthvideos12-new1.s3.us-west-2.amazonaws.com/1692602351user-login.png"
            alt="Login Illustration"
          />
        </div>

        {/* RIGHT FORM */}
        <div className="login-right">
          <h2>Get Started</h2>

          <input
            type="text"
            placeholder="Enter your mobile number"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
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

            <span className="forgot">Forget Password?</span>
          </div>

          {/* ✅ Dummy Login Button */}
          <button className="login-btn" onClick={handleSubmit}>
            Login →
          </button>

          <p className="register-text">
            Don't have an account <span
              onClick={() => {
                onClose();
                openModal("register");
              }}
            >Register?</span>
          </p>
        </div>
      </div>

      {/* USER DESCRIPTION SECTION */}
      <div className="user-description">
        <h3>User</h3>

        <div className="desc-item">
          <span className="check-icon">✔</span>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestias
            eius, quas ipsa quam maiores nobis eveniet quasi repellat aliquid
            dolorem omnis nostrum quia hic facere nam ab quo consequatur quisquam!
          </p>
        </div>

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

export default LoginAsUser;
