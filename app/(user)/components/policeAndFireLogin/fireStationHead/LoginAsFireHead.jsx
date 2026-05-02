"use client";
import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation"; 
import { useGlobalContext } from "@/app/context/GlobalContext";
// Import libphonenumber-js functions
import { getCountries, getCountryCallingCode } from "libphonenumber-js";
import FireStationAPI from "@/app/services/FireStationAPI";

function LoginAsFireHead() {
  const [identifier, setIdentifier] = useState(""); // phone OR email
  const [countryDialCode, setCountryDialCode] = useState("+91"); 
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const router = useRouter(); // Initialize router
  const { openModal, closeModal } = useGlobalContext();

  // Generate the list of Country Dialing Codes
  const countryCallingCodes = useMemo(() => {
    return getCountries()
      .map((country) => ({
        country,
        callingCode: `+${getCountryCallingCode(country)}`,
      }))
      .sort((a, b) => a.callingCode.localeCompare(b.callingCode, undefined, { numeric: true }));
  }, []);

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

      // 1. Detect if input is an email
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);

      // 2. Construct the data object dynamically
      const loginData = {
        [isEmail ? "email" : "phone"]: isEmail ? identifier : identifier.replace(/\s+/g, ""),
        password: password,
        remember: remember,
        ...(isEmail ? {} : { countryCode: countryDialCode }) // Only add countryCode if not email
      };

      // 3. Send to API via LoginFireHQ
      const response = await FireStationAPI.LoginFireHQ(loginData);

      // 4. Save token specifically as fireheadquarterToken
      const token = response?.token || response?.data?.token;
      if (token) {
        localStorage.setItem("fireheadquarterToken", token);
      }

      setSuccess("Login successful! Redirecting...");

      // 5. Redirect and close modal
      setTimeout(() => {
        closeModal();
        // router.push("/policeandfire/fireheadquarter");
      }, 1500);

    } catch (err) {
      setError(err?.response?.data?.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white">
      {/* TOP LOGIN BOX */}
      <div className="flex flex-col md:flex-row items-center justify-center bg-white p-0 md:p-10 rounded-lg w-full max-w-[1100px] mx-auto">

        {/* LEFT IMAGE */}
        <div className="hidden md:block flex-shrink-0">
          <img
            src="https://healthvideos12-new1.s3.us-west-2.amazonaws.com/1692601520fire-station1.jpg"
            alt="Fire HQ Login"
            className="w-[280px] lg:w-[350px] max-w-full rounded-lg"
          />
        </div>

        {/* RIGHT FORM */}
        <div className="flex-1 w-full md:ml-8 lg:ml-15 text-center md:text-left">
          <h2 className="text-xl sm:text-2xl md:text-[32px] font-bold mb-5 leading-tight">
            Fire HQ Login
          </h2>

          {/* Messages */}
          {success && (
            <div className="bg-[#e6ffed] text-[#1a7f37] border border-[#1a7f37] p-2.5 rounded-md mb-4 text-sm font-medium animate-in fade-in duration-300">
              {success}
            </div>
          )}
          {error && (
            <div className="bg-[#ffe6e6] text-[#d93025] border border-[#d93025] p-2.5 rounded-md mb-4 text-sm font-medium animate-in fade-in duration-300">
              {error}
            </div>
          )}

          {/* INPUT GROUP: COUNTRY CODE + IDENTIFIER */}
          <div className="flex gap-2 mb-1">
            <select
              value={countryDialCode}
              onChange={(e) => setCountryDialCode(e.target.value)}
              className="w-[110px] p-3 border border-[#42b883] rounded outline-none text-sm focus:ring-1 focus:ring-[#42b883] bg-white cursor-pointer"
            >
              {countryCallingCodes.map((item, index) => (
                <option key={`${item.country}-${index}`} value={item.callingCode}>
                  {item.country} ({item.callingCode})
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Phone number or email"
              className="flex-1 p-3 border border-[#42b883] rounded outline-none text-sm focus:ring-1 focus:ring-[#42b883]"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
          </div>

          <p className="text-[13px] text-gray-500 mb-3 text-left">
            Select country code if logging in via phone number.
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
        </div>
      </div>

      {/* DESCRIPTION SECTION */}
      <div className="max-w-[1100px] mx-auto mt-10 px-4 md:px-0 pb-10">
        <h3 className="text-lg sm:text-xl md:text-[28px] font-bold mb-5">
          Fire Station HeadQuarter
        </h3>
        <p className="text-sm md:text-base leading-relaxed text-[#333]">
          Official portal for Fire Station HeadQuarter administration. Please use your 
          authorized phone or email credentials to access the command dashboard. 
          Unauthorized access is strictly prohibited.
        </p>
      </div>
    </div>
  );
}

export default LoginAsFireHead;