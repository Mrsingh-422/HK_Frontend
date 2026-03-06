"use client";
import React, { useState } from "react";
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
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);

      const userLoginData = {
        password,
        remember,
        ...(isEmail ? { email: identifier } : { phone: identifier }),
      };

      await loginAsUser(userLoginData);
      setSuccess("Login successful! Redirecting...");

      setTimeout(() => {
        closeModal();
      }, 1500);
    } catch (err) {
      setError(err?.response?.data?.message || "Invalid phone/email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white">
      {/* TOP LOGIN BOX */}
      <div className="flex flex-col md:flex-row items-center justify-center bg-white p-0 md:p-10 rounded-lg w-full max-w-[1100px] mx-auto">
        
        {/* LEFT IMAGE - Hidden on mobile, visible from md (768px) up */}
        <div className="hidden md:block flex-shrink-0">
          <img
            src="https://healthvideos12-new1.s3.us-west-2.amazonaws.com/1692602351user-login.png"
            alt="Login Illustration"
            className="w-[280px] lg:w-[350px] max-w-full"
          />
        </div>

        {/* RIGHT FORM */}
        <div className="flex-1 w-full md:ml-8 lg:ml-15 text-center md:text-left">
          <h2 className="text-xl sm:text-2xl md:text-[32px] font-bold mb-5 leading-tight">
            Get Started
          </h2>

          {/* Success Message */}
          {success && (
            <div className="bg-[#e6ffed] text-[#1a7f37] border border-[#1a7f37] p-2.5 rounded-md mb-4 text-sm font-medium animate-in fade-in slide-in-from-top-1 duration-300">
              {success}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-[#ffe6e6] text-[#d93025] border border-[#d93025] p-2.5 rounded-md mb-4 text-sm font-medium animate-in fade-in slide-in-from-top-1 duration-300">
              {error}
            </div>
          )}

          <input
            type="text"
            placeholder="Enter your phone number or email"
            className="w-full p-3 border border-[#42b883] rounded outline-none text-sm mb-1 focus:ring-1 focus:ring-[#42b883]"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />
          <p className="text-[13px] text-gray-500 mb-3 text-left">
            We'll never share your mobile number with anyone else.
          </p>

          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 border border-[#42b883] rounded outline-none text-sm mb-3 focus:ring-1 focus:ring-[#42b883]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 text-sm gap-2">
            <label className="inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap">
              <input
                type="checkbox"
                className="w-4 h-4 accent-[#2f8f5b]"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Remember Password
            </label>

            <span 
              className="cursor-pointer hover:underline text-[#333]"
              onClick={() => openModal("forgotPassword")}
            >
              Forget Password?
            </span>
          </div>

          <button
            className="w-full md:w-auto mt-5 bg-[#2f8f5b] hover:bg-[#256f47] text-white py-3 px-7 rounded text-base transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login →"}
          </button>

          <p className="mt-4 text-[15px] text-gray-700">
            Don't have an account{" "}
            <span
              className="font-bold cursor-pointer hover:underline"
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
      <div className="max-w-[1100px] mx-auto mt-10 px-4 md:px-0 pb-10">
        <h3 className="text-lg sm:text-xl md:text-[28px] font-bold mb-5">
          User
        </h3>
        <p className="text-sm md:text-base leading-relaxed text-[#333]">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolore maiores, 
          in aliquam cum nulla laudantium voluptatum maxime numquam ipsum molestias 
          porro totam. Eius ducimus harum, sint perspiciatis vel delectus quam.
        </p>
      </div>
    </div>
  );
}

export default LoginAsUser;