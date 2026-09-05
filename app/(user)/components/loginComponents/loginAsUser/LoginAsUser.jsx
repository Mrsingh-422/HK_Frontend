"use client";
import React, { useState, useMemo } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useGlobalContext } from "@/app/context/GlobalContext";
import { getCountries, getCountryCallingCode } from "libphonenumber-js";
import { FiAlertOctagon, FiUnlock, FiX, FiAlertTriangle } from "react-icons/fi";

function LoginAsUser() {
  const [identifier, setIdentifier] = useState(""); // Phone OR Email
  const [countryDialCode, setCountryDialCode] = useState("+91");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Banned / Deactivated User States
  const [bannedData, setBannedData] = useState(null); // { isBanned: true, phone: "...", message: "..." }
  const [showUnbanModal, setShowUnbanModal] = useState(false);
  const [unbanPhone, setUnbanPhone] = useState(""); // 📱 Auto-filled 10-digit mobile number
  const [unbanReason, setUnbanReason] = useState("");
  const [ackUnderstood, setAckUnderstood] = useState(false); // ⚠️ Life-safety acknowledgement checkbox
  const [unbanLoading, setUnbanLoading] = useState(false);
  const [unbanSuccess, setUnbanSuccess] = useState("");
  const [unbanError, setUnbanError] = useState("");

  const { openModal, closeModal } = useGlobalContext();
  const { loginAsUser, requestUnban } = useAuth();

  // Helper to extract clean 10 digits from any string
  const extractTenDigits = (val) => {
    if (!val) return "";
    const cleaned = String(val).replace(/\D/g, "");
    return cleaned.length > 10 ? cleaned.slice(-10) : cleaned;
  };

  // Generate Country Dialing Codes dynamically
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
    setBannedData(null);

    if (!identifier || !password) {
      setError("Please enter your phone number or email and password.");
      return;
    }

    try {
      setLoading(true);

      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier.trim());

      const userLoginData = {
        password,
        remember,
      };

      if (isEmail) {
        userLoginData.email = identifier.trim();
      } else {
        userLoginData.phone = identifier.replace(/\s+/g, "");
        userLoginData.countryCode = countryDialCode;
      }

      await loginAsUser(userLoginData);

      setSuccess("Login successful! Welcome back.");

      setTimeout(() => {
        closeModal();
      }, 1200);
    } catch (err) {
      const errorMsg = typeof err === "string" ? err : err?.message || "Invalid login credentials.";
      const errorMsgLower = errorMsg.toLowerCase();

      // Detect if the account is deactivated, banned, or suspended
      const isDeactivatedOrBanned =
        (typeof err === "object" && err?.isBanned) ||
        errorMsgLower.includes("deactivated") ||
        errorMsgLower.includes("suspended") ||
        errorMsgLower.includes("banned") ||
        errorMsgLower.includes("administrator");

      if (isDeactivatedOrBanned) {
        // Auto-extract 10-digit phone from error payload or input
        const detectedPhone = (typeof err === "object" && err?.phone) 
          ? extractTenDigits(err.phone) 
          : (!identifier.includes("@") ? extractTenDigits(identifier) : "");

        setBannedData({
          isBanned: true,
          canRequestUnban: true,
          phone: detectedPhone,
          message: errorMsg,
        });
        setUnbanPhone(detectedPhone); // 🚀 Auto-fill phone immediately!
        setError(errorMsg);
      } else {
        setBannedData(null);
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  // Submit Unban Request
  const handleUnbanSubmit = async (e) => {
    e.preventDefault();
    setUnbanError("");
    setUnbanSuccess("");

    const cleanPhone = extractTenDigits(unbanPhone);

    if (!cleanPhone || cleanPhone.length < 10) {
      setUnbanError("Please enter your registered 10-digit mobile number.");
      return;
    }

    if (!unbanReason.trim()) {
      setUnbanError("Please provide an explanation/reason for the appeal.");
      return;
    }

    if (!ackUnderstood) {
      setUnbanError("You must acknowledge and accept the safety declaration before submitting.");
      return;
    }

    setUnbanLoading(true);
    try {
      const res = await requestUnban({
        phone: cleanPhone,
        reason: unbanReason.trim(),
      });

      setUnbanSuccess(res.message || "Appeal submitted to Admin successfully. You will be notified once reviewed.");
      setTimeout(() => {
        setShowUnbanModal(false);
        setUnbanReason("");
        setAckUnderstood(false);
      }, 2500);
    } catch (err) {
      setUnbanError(typeof err === "string" ? err : err?.message || "Failed to submit unban request.");
    } finally {
      setUnbanLoading(false);
    }
  };

  return (
    <div className="w-full bg-white">
      {/* TOP LOGIN BOX */}
      <div className="flex flex-col md:flex-row items-center justify-center bg-white p-0 md:p-6 rounded-lg w-full max-w-[1100px] mx-auto">

        {/* LEFT IMAGE */}
        <div className="hidden md:flex flex-col items-center justify-center flex-shrink-0 p-4">
          <img
            src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&auto=format&fit=crop&q=80"
            alt="Patient Login"
            className="w-[280px] lg:w-[360px] h-[360px] object-cover rounded-2xl shadow-md border border-gray-100"
          />
        </div>

        {/* RIGHT FORM */}
        <div className="flex-1 w-full md:ml-8 lg:ml-10 text-center md:text-left">
          <h2 className="text-xl sm:text-2xl md:text-[30px] font-bold mb-4 leading-tight text-gray-900">
            User Login
          </h2>

          {/* Success Banner */}
          {success && (
            <div className="bg-[#e6ffed] text-[#1a7f37] border border-[#1a7f37] p-2.5 rounded-md mb-3 text-sm font-medium animate-in fade-in duration-300 text-left">
              {success}
            </div>
          )}

          {/* 🚨 Banned / Deactivated User Alert Banner */}
          {bannedData?.isBanned && (
            <div className="bg-red-50 border-2 border-red-300 p-4 rounded-2xl mb-4 text-left space-y-3 animate-in fade-in">
              <div className="flex items-start gap-2.5 text-red-700">
                <FiAlertOctagon size={22} className="shrink-0 mt-0.5 text-red-600" />
                <div>
                  <h4 className="font-extrabold text-sm uppercase tracking-tight text-red-700">Account Deactivated</h4>
                  <p className="text-xs text-red-600 font-medium leading-relaxed mt-1">
                    {bannedData.message}
                  </p>
                </div>
              </div>

              {bannedData.canRequestUnban && (
                <button
                  type="button"
                  onClick={() => {
                    const phoneToUse = bannedData?.phone || (!identifier.includes("@") ? extractTenDigits(identifier) : "");
                    setUnbanPhone(phoneToUse); // 🚀 Ensure state is auto-filled on click
                    setShowUnbanModal(true);
                    setAckUnderstood(false);
                    setUnbanError("");
                    setUnbanSuccess("");
                  }}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.01] active:scale-95 cursor-pointer"
                >
                  <FiUnlock size={14} /> 🔓 Submit Appeal to Admin
                </button>
              )}
            </div>
          )}

          {/* Regular Error Message */}
          {error && !bannedData?.isBanned && (
            <div className="bg-[#ffe6e6] text-[#d93025] border border-[#d93025] p-2.5 rounded-md mb-3 text-sm font-medium animate-in fade-in duration-300 text-left">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* INPUT GROUP: COUNTRY CODE DROPDOWN + IDENTIFIER INPUT */}
            <div>
              <div className="flex gap-2">
                <select
                  value={countryDialCode}
                  onChange={(e) => setCountryDialCode(e.target.value)}
                  className="w-[115px] p-3 border border-[#42b883] rounded outline-none text-sm focus:ring-1 focus:ring-[#42b883] bg-white cursor-pointer"
                >
                  {countryCallingCodes.map((item, index) => (
                    <option key={`${item.country}-${index}`} value={item.callingCode}>
                      {item.country} ({item.callingCode})
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Mobile number or email"
                  className="flex-1 p-3 border border-[#42b883] rounded outline-none text-sm focus:ring-1 focus:ring-[#42b883]"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  autoComplete="username"
                />
              </div>
              <p className="text-[12px] text-gray-500 mt-1 text-left">
                If logging in with phone, select your country dialing code.
              </p>
            </div>

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

      {/* SUBMIT UNBAN / DEACTIVATION APPEAL MODAL */}
      {showUnbanModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/75 p-3 sm:p-4 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] shadow-2xl border border-gray-100 flex flex-col text-left overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 p-4 sm:p-6 pb-3 bg-white shrink-0">
              <h3 className="text-base sm:text-lg font-black text-gray-900 flex items-center gap-2">
                <FiUnlock className="text-red-600" /> Appeal Account Deactivation
              </h3>
              <button
                onClick={() => setShowUnbanModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
              {unbanSuccess && (
                <div className="bg-[#e6ffed] text-[#1a7f37] border border-[#1a7f37] p-3 rounded-xl text-xs font-semibold animate-in fade-in">
                  {unbanSuccess}
                </div>
              )}

              {unbanError && (
                <div className="bg-[#ffe6e6] text-[#d93025] border border-[#d93025] p-3 rounded-xl text-xs font-semibold animate-in fade-in">
                  {unbanError}
                </div>
              )}

              <form id="unbanForm" onSubmit={handleUnbanSubmit} className="space-y-4">
                {/* 📱 10-Digit Mobile Number Input (AUTO-FILLED) */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Registered 10-Digit Mobile Number *
                  </label>
                  <div className="flex gap-2">
                    <span className="p-3 bg-gray-100 border border-gray-300 rounded-xl text-xs font-bold text-gray-700 flex items-center">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      placeholder="10-digit mobile number"
                      value={unbanPhone}
                      onChange={(e) => setUnbanPhone(e.target.value)}
                      className="flex-1 bg-white border border-gray-300 rounded-xl p-3 text-xs font-bold text-gray-800 outline-none focus:border-[#42b883]"
                      autoComplete="tel-national"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Explanation / Reason for Appeal *
                  </label>
                  <textarea
                    rows="3"
                    required
                    placeholder="e.g. My child accidentally triggered the emergency SOS button. I sincerely apologize, please restore my account."
                    value={unbanReason}
                    onChange={(e) => setUnbanReason(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-3 text-xs outline-none focus:border-[#42b883] resize-none"
                  />
                </div>

                {/* ⚠️ CRITICAL LIFE-SAFETY ACKNOWLEDGEMENT CHECKBOX ⚠️ */}
                <div className="p-3.5 bg-red-50/90 border-2 border-red-200 rounded-2xl space-y-2">
                  <div className="flex items-center gap-1.5 text-red-700 font-black text-xs uppercase tracking-tight">
                    <FiAlertTriangle className="text-red-600 shrink-0 text-sm" /> Safety Declaration & Pledge
                  </div>
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      id="unbanAckCheckbox"
                      checked={ackUnderstood}
                      onChange={(e) => setAckUnderstood(e.target.checked)}
                      className="w-4 h-4 mt-0.5 accent-red-600 cursor-pointer shrink-0"
                    />
                    <span className="text-xs text-red-900 font-semibold leading-relaxed">
                      I understand that falsely calling or cancelling emergency ambulances wastes critical medical resources and <strong>can lead someone in emergency to death</strong>. I pledge never to do this again.
                    </span>
                  </label>
                </div>
              </form>
            </div>

            {/* Sticky Footer Actions */}
            <div className="p-4 sm:p-6 pt-3 border-t border-gray-100 bg-gray-50/80 shrink-0 flex gap-3">
              <button
                type="button"
                onClick={() => setShowUnbanModal(false)}
                className="flex-1 py-3 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl text-xs font-bold uppercase transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="unbanForm"
                disabled={unbanLoading || !ackUnderstood || !unbanReason.trim() || !unbanPhone.trim()}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold uppercase transition-all shadow-md shadow-red-200 cursor-pointer"
              >
                {unbanLoading ? "Submitting..." : "Submit Appeal"}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* USER DESCRIPTION SECTION */}
      <div className="max-w-[1100px] mx-auto mt-8 px-4 md:px-0 pb-6 border-t border-gray-100 pt-6">
        <h3 className="text-lg sm:text-xl font-bold mb-3 text-gray-800">
          Patient & Family Health Account
        </h3>
        <p className="text-sm md:text-base leading-relaxed text-[#555]">
          Access your digital health locker, book appointments with certified specialists, order verified prescription medicines, schedule lab tests, and track ambulance requests in real-time.
        </p>
      </div>
    </div>
  );
}

export default LoginAsUser;