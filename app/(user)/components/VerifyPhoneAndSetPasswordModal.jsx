"use client";
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useGlobalContext } from "@/app/context/GlobalContext";

// Firebase imports
import { auth } from "@/lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

// React Icons
import { HiLockClosed, HiShieldCheck } from "react-icons/hi";

function VerifyPhoneAndSetPasswordModal({ onClose, onSuccess, initialPhone = "", isLocked = true }) {
  const { user, verifyPhoneAndSetPassword, loading } = useAuth();
  const { closeModal } = useGlobalContext();

  const [step, setStep] = useState(1); // 1: Send & Confirm SMS OTP, 2: Set Permanent Password

  // Helper to format clean 10-digit number
  const cleanNumber = (num) => (num ? String(num).replace("+91", "").replace(/\s+/g, "").trim() : "");

  // Form States - Pre-filled with booking mobile number
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(cleanNumber(initialPhone || user?.phone || ""));
  const [countryDialCode] = useState("+91");

  // Keep phone state synchronized when initialPhone loads
  useEffect(() => {
    if (initialPhone) {
      setPhone(cleanNumber(initialPhone));
    }
  }, [initialPhone]);

  // OTP States
  const [otp, setOtp] = useState("");
  const [firebaseIdToken, setFirebaseIdToken] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);

  // Password States
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Feedback States
  const [otpLoading, setOtpLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const recaptchaVerifierRef = useRef(null);

  // Dismiss Modal Helper
  const handleDismiss = () => {
    if (onClose) onClose();
    if (closeModal) closeModal();
  };

  // Initialize Firebase Recaptcha
  const getOrCreateRecaptcha = () => {
    if (typeof window === "undefined") return null;
    if (!recaptchaVerifierRef.current) {
      recaptchaVerifierRef.current = new RecaptchaVerifier(auth, "upgrade-recaptcha-container", {
        size: "invisible",
        callback: () => {},
        "expired-callback": () => setError("reCAPTCHA expired. Please click Resend OTP."),
      });
    }
    return recaptchaVerifierRef.current;
  };

  // Step 1A: Trigger Real SMS OTP
  const handleSendOtp = async () => {
    setError("");
    setSuccess("");

    const targetPhone = cleanNumber(phone || initialPhone || user?.phone);
    if (!targetPhone || targetPhone.length < 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    const fullNumber = `${countryDialCode}${targetPhone}`;

    setOtpLoading(true);
    try {
      const appVerifier = getOrCreateRecaptcha();
      const confirmation = await signInWithPhoneNumber(auth, fullNumber, appVerifier);
      setConfirmationResult(confirmation);
      setOtpSent(true);
      setSuccess(`6-digit SMS OTP sent to ${fullNumber}`);
    } catch (err) {
      console.error("Firebase OTP Error:", err);
      if (recaptchaVerifierRef.current) {
        try { recaptchaVerifierRef.current.clear(); } catch (e) {}
        recaptchaVerifierRef.current = null;
      }
      setError(typeof err === "string" ? err : err?.message || "Failed to send SMS OTP.");
    } finally {
      setOtpLoading(false);
    }
  };

  // Step 1B: Confirm OTP & Obtain Firebase idToken
  const handleVerifyOtp = async () => {
    setError("");
    setSuccess("");

    if (!otp || otp.trim().length < 6) {
      setError("Please enter the 6-digit OTP code.");
      return;
    }

    setOtpLoading(true);
    try {
      const userCredential = await confirmationResult.confirm(otp.trim());
      const idToken = await userCredential.user.getIdToken();

      setFirebaseIdToken(idToken);
      setIsPhoneVerified(true);
      setOtpSent(false);
      setSuccess("Phone verified! Now set your permanent login password.");
      setStep(2); // Proceed to Set Password Step
    } catch (err) {
      console.error("OTP Verification Error:", err);
      setError("Invalid or expired OTP. Please enter the correct code.");
    } finally {
      setOtpLoading(false);
    }
  };

  // Step 2: Submit Atomic Unified Verification & Password Creation
  const handleCompleteProfile = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!newPassword || newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and Confirm password do not match.");
      return;
    }

    if (!firebaseIdToken) {
      setError("Firebase verification token missing. Please verify OTP first.");
      setStep(1);
      return;
    }

    try {
      const payload = {
        idToken: firebaseIdToken,
        newPassword,
        confirmPassword,
        name: name.trim() || undefined,
        email: email.trim() ? email.trim().toLowerCase() : undefined,
      };

      await verifyPhoneAndSetPassword(payload);

      setSuccess("Account verified & permanent password created successfully!");

      setTimeout(() => {
        if (onSuccess) onSuccess();
        handleDismiss();
      }, 1500);
    } catch (err) {
      setError(typeof err === "string" ? err : err?.message || "Failed to complete account setup.");
    }
  };

  return (
    <div className="w-full bg-white p-4 md:p-6 font-sans">
      <div id="upgrade-recaptcha-container"></div>

      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-[#08b36a] text-lg md:text-xl font-bold">
            Verify Phone & Set Password
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {step === 1
              ? "Verify your booking mobile number to lift the emergency restriction"
              : "Create a permanent password to log in anytime"}
          </p>
        </div>
        <span
          className="text-gray-400 hover:text-gray-600 text-2xl cursor-pointer p-1"
          onClick={handleDismiss}
        >
          ✖
        </span>
      </div>

      {/* ALERT MESSAGES */}
      {success && (
        <div className="bg-[#e6ffed] text-[#1a7f37] border border-[#1a7f37] p-2.5 rounded-md mb-3 text-xs font-medium animate-in fade-in">
          {success}
        </div>
      )}
      {error && (
        <div className="bg-[#ffe6e6] text-[#d93025] border border-[#d93025] p-2.5 rounded-md mb-3 text-xs font-medium animate-in fade-in">
          {error}
        </div>
      )}

      {/* ================= STEP 1: PHONE OTP VERIFICATION ================= */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-gray-700">
                Registered Emergency Mobile Number
              </label>
              {isLocked && Boolean(phone) && (
                <span className="flex items-center gap-1 text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md font-bold">
                  <HiLockClosed /> Locked to Booking
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <span className="p-3 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-700 font-semibold select-none flex items-center">
                +91
              </span>
              <div className="relative flex-1">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(cleanNumber(e.target.value))}
                  readOnly={isLocked && Boolean(phone)}
                  disabled={otpSent || isPhoneVerified}
                  placeholder="10-digit mobile number"
                  className={`w-full p-3 border rounded-lg text-sm font-bold outline-none ${
                    isLocked && Boolean(phone)
                      ? "bg-gray-100 text-gray-700 border-gray-300 cursor-not-allowed select-none"
                      : "border-[#42b883] focus:ring-1 focus:ring-[#42b883] bg-white text-gray-900"
                  }`}
                />
              </div>

              {!isPhoneVerified && (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={otpLoading || !phone || phone.length < 10}
                  className="bg-[#08b36a] hover:bg-[#068f54] text-white px-5 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all disabled:bg-gray-300 disabled:cursor-not-allowed shadow-sm cursor-pointer"
                >
                  {otpLoading ? "Sending..." : otpSent ? "Resend OTP" : "Send OTP"}
                </button>
              )}
            </div>
            {isLocked && Boolean(phone) && (
              <p className="text-[11px] text-gray-400 mt-1">
                🔒 Mobile number is locked to the number entered during the emergency dispatch.
              </p>
            )}
          </div>

          {/* INLINE OTP CONFIRMATION */}
          {otpSent && !isPhoneVerified && (
            <div className="p-3.5 bg-gray-50 border border-dashed border-[#42b883] rounded-xl space-y-3 animate-in fade-in">
              <label className="block text-xs font-medium text-gray-700 text-center">
                Enter 6-digit SMS code received on +91 {phone}
              </label>
              <input
                type="text"
                maxLength={6}
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-lg text-center tracking-[8px] text-lg font-bold outline-none bg-white"
              />
              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={otpLoading || otp.length < 6}
                className="w-full bg-[#08b36a] hover:bg-[#068f54] text-white py-3 rounded-lg text-xs font-bold transition-colors disabled:bg-gray-300 cursor-pointer shadow-md shadow-emerald-100"
              >
                {otpLoading ? "Verifying OTP..." : "Confirm OTP & Continue →"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ================= STEP 2: PERMANENT PASSWORD & PROFILE ================= */}
      {step === 2 && (
        <form onSubmit={handleCompleteProfile} className="space-y-3 animate-in fade-in">
          <div className="p-2.5 bg-[#e6ffed] border border-[#08b36a]/30 rounded-lg text-center">
            <p className="text-xs font-semibold text-[#1a7f37]">
              ✓ Mobile Number (+91 {phone}) Verified
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Full Name (Optional)
            </label>
            <input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#42b883]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Email Address (Optional)
            </label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#42b883]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Create Permanent Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              placeholder="Minimum 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-2.5 border border-[#42b883] rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#42b883]"
              autoComplete="new-password"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              placeholder="Re-type your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-2.5 border border-[#42b883] rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#42b883]"
              autoComplete="new-password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#08b36a] hover:bg-[#068f54] text-white py-3 rounded-lg text-sm font-semibold transition-colors disabled:bg-gray-400 cursor-pointer mt-2"
          >
            {loading ? "Saving & Upgrading Account..." : "Save Password & Lift Limit →"}
          </button>
        </form>
      )}
    </div>
  );
}

export default VerifyPhoneAndSetPasswordModal;