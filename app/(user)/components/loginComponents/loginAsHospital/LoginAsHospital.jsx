"use client";
import React, { useState } from "react";
import { useGlobalContext } from "@/app/context/GlobalContext";
import { useRouter } from "next/navigation";
import axios from "axios";

function LoginAsHospital() {
  const [identifier, setIdentifier] = useState(""); // Phone OR Email
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { openModal, closeModal } = useGlobalContext();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!identifier || !password) {
      setError("Please enter your phone number or email and password.");
      return;
    }

    try {
      setLoading(true);

      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier.trim());
      const cleanPhone = identifier.replace(/\s+/g, "");

      const userLoginData = {
        password,
        remember,
        ...(isEmail ? { email: identifier.trim() } : { phone: cleanPhone, mobile: cleanPhone }),
      };

      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/+$/, "") || "";
      const response = await axios.post(`${baseUrl}/api/auth/hospital/login`, userLoginData);
      const res = response.data;

      // Extract and save tokens
      const token = res?.token || res?.data?.token;
      const profileStatus = res?.profileStatus || res?.data?.profileStatus || "Incomplete";

      if (token) {
        localStorage.setItem("hospitalToken", token);
        localStorage.setItem("hospitalStatus", profileStatus);
        localStorage.setItem("hospitalUser", JSON.stringify(res?.data || res?.hospital || res));
      }

      setSuccess("Login successful! Redirecting...");

      setTimeout(() => {
        closeModal();
        if (profileStatus === "Approved") {
          router.push("/hospital/dashboard");
        } else {
          router.push("/hospital/documents");
        }
      }, 1200);

    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Invalid phone/email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white">
      {/* TOP LOGIN BOX */}
      <div className="flex flex-col md:flex-row items-center justify-center bg-white p-0 md:p-6 rounded-lg w-full max-w-[1100px] mx-auto">

        {/* LEFT IMAGE */}
        <div className="hidden md:flex flex-col items-center justify-center flex-shrink-0 p-4">
          <img
            src="https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=600&auto=format&fit=crop&q=80"
            alt="Hospital Login"
            className="w-[280px] lg:w-[360px] h-[360px] object-cover rounded-2xl shadow-md border border-gray-100"
          />
        </div>

        {/* RIGHT FORM */}
        <div className="flex-1 w-full md:ml-8 lg:ml-10 text-center md:text-left">
          <h2 className="text-xl sm:text-2xl md:text-[30px] font-bold mb-4 leading-tight text-gray-900">
            Hospital Login
          </h2>

          {/* Alert Messages */}
          {success && (
            <div className="bg-[#e6ffed] text-[#1a7f37] border border-[#1a7f37] p-2.5 rounded-md mb-3 text-sm font-medium animate-in fade-in duration-300 text-left">
              {success}
            </div>
          )}

          {error && (
            <div className="bg-[#ffe6e6] text-[#d93025] border border-[#d93025] p-2.5 rounded-md mb-3 text-sm font-medium animate-in fade-in duration-300 text-left">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              placeholder="Enter hospital email or phone number"
              className="w-full p-3 border border-[#42b883] rounded outline-none text-sm focus:ring-1 focus:ring-[#42b883]"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              autoComplete="username"
            />
            <p className="text-[12px] text-gray-500 text-left">
              We'll never share your login credentials with anyone else.
            </p>

            <input
              type="password"
              placeholder="Password"
              className="w-full p-3 border border-[#42b883] rounded outline-none text-sm focus:ring-1 focus:ring-[#42b883]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-2 text-sm gap-2">
              <label className="inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-[#2f8f5b] cursor-pointer"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                Remember Password
              </label>

              <span
                className="cursor-pointer hover:underline text-[#2f8f5b] font-semibold text-sm"
                onClick={() => openModal("forgotPassword")}
              >
                Forget Password?
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto mt-4 bg-[#2f8f5b] hover:bg-[#256f47] text-white py-3 px-8 rounded text-base font-medium transition-colors disabled:bg-gray-400 cursor-pointer"
            >
              {loading ? "Logging in..." : "Login →"}
            </button>
          </form>

          <p className="mt-5 text-[15px] text-gray-700">
            Don't have an account?{" "}
            <span
              className="font-bold cursor-pointer hover:underline text-[#2f8f5b]"
              onClick={() => {
                closeModal();
                openModal("register");
              }}
            >
              Register
            </span>
          </p>
        </div>
      </div>

      {/* DESCRIPTION SECTION */}
      <div className="max-w-[1100px] mx-auto mt-8 px-4 md:px-0 pb-6 border-t border-gray-100 pt-6">
        <h3 className="text-lg sm:text-xl font-bold mb-3 text-gray-800">
          Hospital Administration Portal
        </h3>
        <div className="flex gap-3 text-sm md:text-base leading-relaxed text-[#555]">
          <span className="text-[#2f8f5b] font-bold text-lg leading-none mt-0.5">✔</span>
          <p>
            Manage hospital departments, doctor rosters, ICU and general bed reservations, patient admissions, and emergency services.
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginAsHospital;