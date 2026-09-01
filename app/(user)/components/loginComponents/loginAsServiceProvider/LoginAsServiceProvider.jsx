"use client";
import React, { useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useGlobalContext } from "@/app/context/GlobalContext";

function LoginAsServiceProvider() {
  const { loginAsServiceProvider, loading } = useAuth();
  const { openModal, closeModal } = useGlobalContext();
  const router = useRouter();

  // Form States
  const [category, setCategory] = useState("");
  const [identifier, setIdentifier] = useState(""); // Email or Phone
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!category) {
      setError("Please select a Category (Nurse, Pharmacy, or Lab).");
      return;
    }
    if (!identifier || !password) {
      setError("Please enter your email/mobile number and password.");
      return;
    }

    try {
      const isEmail = identifier.includes("@");
      const cleanPhone = identifier.replace(/\s+/g, "");

      const loginData = {
        category,
        password,
        remember,
        ...(isEmail ? { email: identifier.trim() } : { phone: cleanPhone }),
      };

      const resData = await loginAsServiceProvider(loginData);

      setSuccess("Login Successful! Redirecting...");

      setTimeout(() => {
        closeModal();

        const profileStatus = resData?.profileStatus || resData?.data?.profileStatus;
        const isApproved = profileStatus === "Approved";

        const normalizedCategory = category.toLowerCase();
        let pathSegment = "";
        if (normalizedCategory === "nurse" || normalizedCategory === "nursing") pathSegment = "nursevendor";
        else if (normalizedCategory === "pharmacy") pathSegment = "pharmacy";
        else if (normalizedCategory === "lab") pathSegment = "labvendor";

        if (pathSegment) {
          if (isApproved) {
            router.push(`/vendors/${pathSegment}/dashboard`);
          } else {
            router.push(`/vendors/${pathSegment}/documents`);
          }
        } else {
          router.push("/");
        }
      }, 1200);

    } catch (err) {
      setError(typeof err === "string" ? err : err?.message || "Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="w-full bg-white">
      {/* TOP LOGIN BOX */}
      <div className="flex flex-col md:flex-row items-center justify-center bg-white p-0 md:p-6 rounded-lg w-full max-w-[1100px] mx-auto">

        {/* LEFT IMAGE */}
        <div className="hidden md:flex flex-col items-center justify-center flex-shrink-0 p-4">
          <img
            src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80"
            alt="Service Provider Login"
            className="w-[280px] lg:w-[360px] h-[360px] object-cover rounded-2xl shadow-md border border-gray-100"
          />
        </div>

        {/* RIGHT FORM */}
        <div className="flex-1 w-full md:ml-8 lg:ml-10 text-center md:text-left">
          <h2 className="text-xl sm:text-2xl md:text-[30px] font-bold mb-4 leading-tight text-gray-900">
            Service Provider Login
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
            {/* CATEGORY DROPDOWN */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-3 border border-[#42b883] rounded outline-none text-sm focus:ring-1 focus:ring-[#42b883] bg-white cursor-pointer"
            >
              <option value="">Select Category</option>
              <option value="Nurse">Nursing</option>
              <option value="Pharmacy">Pharmacy</option>
              <option value="Lab">Lab / Phlebotomist</option>
            </select>

            <input
              type="text"
              placeholder="Enter your email or mobile number"
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

      {/* FOOTER DESCRIPTION SECTION */}
      <div className="max-w-[1100px] mx-auto mt-8 px-4 md:px-0 pb-6 border-t border-gray-100 pt-6">
        <h3 className="text-lg sm:text-xl font-bold mb-3 text-gray-800">
          Service Provider Network
        </h3>
        <div className="flex gap-3 text-sm md:text-base leading-relaxed text-[#555]">
          <span className="text-[#2f8f5b] font-bold text-lg leading-none mt-0.5">✔</span>
          <p>
            Access your specialized orders & bookings dashboard for Nursing services, Pharmacy prescription orders, and Laboratory pathology diagnostics.
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginAsServiceProvider;