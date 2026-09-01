"use client";
import React, { useState, useMemo, useRef, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useGlobalContext } from "@/app/context/GlobalContext";
import { getCountries, getCountryCallingCode, parsePhoneNumberFromString } from "libphonenumber-js";

// Firebase imports
import { auth } from "@/lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

// Categorized 13 Roles Registry (Exact Backend Strings)
const ROLE_GROUPS = [
  {
    groupName: "Healthcare & Patients",
    roles: [
      { id: "User", label: "Patient / User" },
      { id: "Doctor", label: "Doctor" },
      { id: "Hospital", label: "Hospital Admin" },
    ],
  },
  {
    groupName: "Service Providers",
    roles: [
      { id: "Pharmacy", label: "Pharmacy Partner" },
      { id: "Lab", label: "Pathology Lab" },
      { id: "Nurse", label: "Home Care Nurse" },
    ],
  },
  {
    groupName: "Police Department",
    roles: [
      { id: "PoliceHQ", label: "Police HQ" },
      { id: "PoliceStation", label: "Police Station" },
      { id: "PoliceStaff", label: "Police Staff" },
    ],
  },
  {
    groupName: "Fire Department",
    roles: [
      { id: "FireHQ", label: "Fire HQ" },
      { id: "FireStation", label: "Fire Station" },
      { id: "FireStaff", label: "Fire Staff" },
    ],
  },
  {
    groupName: "Administration",
    roles: [
      { id: "Admin", label: "Super Admin" },
    ],
  },
];

function ForgotPassword({ initialRole = "User" }) {
  const { openModal, closeModal, modalData } = useGlobalContext();
  const { 
    forgotPasswordPhone, 
    verifyFirebaseOtp, 
    resetPasswordPhone, 
    forgotPassword: forgotPasswordEmail, 
    verifyOtp: verifyEmailOtp, 
    resetPassword: resetPasswordEmail,
    loading: authLoading 
  } = useAuth();

  // Selected Exact Backend Role String
  const [selectedRole, setSelectedRole] = useState(
    modalData?.targetRole || modalData?.role || initialRole || "User"
  );

  // Mode: "phone" (Firebase SMS OTP) or "email" (Brevo Email OTP)
  const [mode, setMode] = useState("phone");

  // Step 1: Input | Step 2: OTP Verification | Step 3: Change Password
  const [step, setStep] = useState(1);

  // Phone Form States
  const [phone, setPhone] = useState("");
  const [countryDialCode, setCountryDialCode] = useState("+91");

  // Email Form States
  const [email, setEmail] = useState("");

  // OTP & Token States
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);

  // New Password States
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI Feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const recaptchaVerifierRef = useRef(null);

  // Sync role if opened with modalData (e.g. from Police or Fire portal)
  useEffect(() => {
    if (modalData?.targetRole || modalData?.role) {
      setSelectedRole(modalData.targetRole || modalData.role);
    }
  }, [modalData]);

  // Country Dialing Codes
  const countryCallingCodes = useMemo(() => {
    return getCountries()
      .map((country) => ({
        country,
        callingCode: `+${getCountryCallingCode(country)}`,
      }))
      .sort((a, b) => a.callingCode.localeCompare(b.callingCode, undefined, { numeric: true }));
  }, []);

  // Firebase Recaptcha Initializer
  const getOrCreateRecaptcha = () => {
    if (typeof window === "undefined") return null;
    if (!recaptchaVerifierRef.current) {
      recaptchaVerifierRef.current = new RecaptchaVerifier(auth, "forgot-recaptcha-container", {
        size: "invisible",
        callback: () => {},
        "expired-callback": () => setError("reCAPTCHA expired. Please click Send OTP again."),
      });
    }
    return recaptchaVerifierRef.current;
  };

  // Helper to get formatted display name of the selected role
  const selectedRoleLabel = useMemo(() => {
    for (const group of ROLE_GROUPS) {
      const match = group.roles.find((r) => r.id === selectedRole);
      if (match) return match.label;
    }
    return selectedRole;
  }, [selectedRole]);

  // =========================================================================
  // STEP 1: VALIDATE ROLE-SPECIFIC ACCOUNT & SEND SMS OTP
  // =========================================================================
  const handleSendPhoneOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!selectedRole) {
      setError("Please select the target service role.");
      return;
    }

    if (!phone || phone.trim().length === 0) {
      setError("Please enter your 10-digit mobile number.");
      return;
    }

    const cleanPhone = phone.replace(/\s+/g, "");
    const fullNumber = `${countryDialCode}${cleanPhone}`;
    const parsed = parsePhoneNumberFromString(fullNumber);

    if (!parsed || !parsed.isValid()) {
      setError("Please enter a valid mobile number for the selected country.");
      return;
    }

    setLoading(true);
    try {
      // Step 1A: Discover accounts and ensure THIS exact role is registered
      const res = await forgotPasswordPhone(cleanPhone);
      const foundAccounts = res?.accounts || [];

      // Check strictly for selected exact role (Case-insensitive match for security)
      const matchedAccount = foundAccounts.find(
        (acc) => acc.role?.toLowerCase() === selectedRole?.toLowerCase()
      );

      if (!matchedAccount && foundAccounts.length > 0) {
        setError(`No ${selectedRoleLabel} (${selectedRole}) account registered with this phone number.`);
        setLoading(false);
        return;
      }

      if (foundAccounts.length === 0) {
        setError("No active account found registered with this phone number.");
        setLoading(false);
        return;
      }

      // Step 1B: Trigger Firebase Real SMS OTP
      const appVerifier = getOrCreateRecaptcha();
      const confirmation = await signInWithPhoneNumber(auth, fullNumber, appVerifier);
      setConfirmationResult(confirmation);

      setSuccess(`6-digit SMS OTP sent to ${fullNumber} for ${selectedRoleLabel}.`);
      setStep(2); // Move to OTP verification step
    } catch (err) {
      console.error("Forgot Password OTP Error:", err);
      if (recaptchaVerifierRef.current) {
        try { recaptchaVerifierRef.current.clear(); } catch (e) {}
        recaptchaVerifierRef.current = null;
      }
      setError(typeof err === "string" ? err : err?.message || "Failed to send SMS OTP. Please check your number.");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================================
  // STEP 2: VERIFY OTP FOR TARGET ROLE
  // =========================================================================
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!otp || otp.trim().length < 6) {
      setError("Please enter the complete 6-digit OTP.");
      return;
    }

    setLoading(true);
    try {
      const cleanPhone = phone.replace(/\s+/g, "");

      if (mode === "phone") {
        // Confirm OTP via Firebase Client SDK
        const userCredential = await confirmationResult.confirm(otp.trim());
        const idToken = await userCredential.user.getIdToken();

        // Step 2B: Exchange idToken for Backend SHA-256 Reset Token for THIS exact role
        const verifyRes = await verifyFirebaseOtp({
          phone: cleanPhone,
          idToken,
          selectedRole: selectedRole, // Exact role: "PoliceHQ", "FireStaff", "Doctor", etc.
        });

        if (!verifyRes?.resetToken) {
          throw new Error("Failed to obtain secure reset token.");
        }

        setResetToken(verifyRes.resetToken);
        setSuccess(`OTP verified for ${selectedRoleLabel}! Please create your new password.`);
        setStep(3); // Move to Set New Password step
      } else {
        // Email OTP Verification (Brevo)
        await verifyEmailOtp(email.trim(), otp.trim());
        setSuccess("Email OTP verified! Please set your new password.");
        setStep(3);
      }
    } catch (err) {
      console.error("OTP Verification Error:", err);
      setError(typeof err === "string" ? err : err?.message || "Invalid or expired OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================================
  // STEP 3: SUBMIT NEW PASSWORD FOR TARGET ROLE
  // =========================================================================
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!newPassword || newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const cleanPhone = phone.replace(/\s+/g, "");

      if (mode === "phone") {
        await resetPasswordPhone({
          phone: cleanPhone,
          resetToken,
          selectedRole: selectedRole, // Exact role passed to backend
          newPassword,
          confirmPassword,
        });
      } else {
        await resetPasswordEmail({
          email: email.trim(),
          newPassword,
          confirmPassword,
        });
      }

      setSuccess(`Password for ${selectedRoleLabel} updated successfully! Redirecting to login...`);

      setTimeout(() => {
        closeModal();
        openModal("login");
      }, 1500);
    } catch (err) {
      setError(typeof err === "string" ? err : err?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  // Email Flow Step 1
  const handleSendEmailOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      await forgotPasswordEmail(email.trim());
      setSuccess(`OTP sent to ${email}`);
      setStep(2);
    } catch (err) {
      setError(typeof err === "string" ? err : err?.message || "Failed to send email OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white p-3 md:p-6 font-sans">
      {/* Invisible Recaptcha container */}
      <div id="forgot-recaptcha-container"></div>

      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-[#08b36a] text-xl md:text-2xl font-bold">
            Reset Password ({selectedRoleLabel})
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {step === 1 && `Select your role & enter registered credentials for ${selectedRoleLabel}`}
            {step === 2 && "Enter the 6-digit SMS OTP verification code"}
            {step === 3 && `Set a new password for your ${selectedRoleLabel} account`}
          </p>
        </div>
        <span
          className="text-gray-400 hover:text-gray-600 text-2xl cursor-pointer p-1"
          onClick={closeModal}
        >
          ✖
        </span>
      </div>

      {/* CATEGORIZED ROLE SELECTOR (Only on Step 1) */}
      {step === 1 && (
        <div className="mb-4 space-y-2">
          <label className="block text-xs font-semibold text-gray-700">
            Select Account Role:
          </label>
          <div className="border border-gray-200 rounded-lg p-2 bg-gray-50 max-h-[160px] overflow-y-auto space-y-2.5">
            {ROLE_GROUPS.map((group, gIdx) => (
              <div key={gIdx} className="space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block px-1">
                  {group.groupName}
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {group.roles.map((role) => (
                    <button
                      key={role.id}
                      type="button"
                      className={`py-1.5 px-2.5 text-xs font-medium rounded-md transition-all text-left truncate flex items-center justify-between ${
                        selectedRole === role.id
                          ? "bg-[#08b36a] text-white shadow-sm font-bold"
                          : "bg-white text-gray-700 hover:bg-gray-200 border border-gray-200"
                      }`}
                      onClick={() => {
                        setSelectedRole(role.id);
                        setError("");
                        setSuccess("");
                      }}
                    >
                      <span className="truncate">{role.label}</span>
                      {selectedRole === role.id && <span className="text-[10px] ml-1">✓</span>}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODE TABS (Phone SMS vs Email) - Only on Step 1 */}
      {step === 1 && (
        <div className="flex bg-gray-100 p-1 rounded-lg mb-4">
          <button
            type="button"
            className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              mode === "phone" ? "bg-white text-[#08b36a] shadow-sm" : "text-gray-500 hover:text-gray-800"
            }`}
            onClick={() => { setMode("phone"); setError(""); setSuccess(""); }}
          >
            📱 Mobile Phone SMS OTP
          </button>
          <button
            type="button"
            className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              mode === "email" ? "bg-white text-[#08b36a] shadow-sm" : "text-gray-500 hover:text-gray-800"
            }`}
            onClick={() => { setMode("email"); setError(""); setSuccess(""); }}
          >
            ✉️ Email OTP
          </button>
        </div>
      )}

      {/* ALERT BANNERS */}
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

      {/* ================= STEP 1: ENTER PHONE OR EMAIL ================= */}
      {step === 1 && (
        <form onSubmit={mode === "phone" ? handleSendPhoneOtp : handleSendEmailOtp} className="space-y-3">
          {mode === "phone" ? (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Registered Mobile Number for <strong className="text-[#08b36a]">{selectedRoleLabel} ({selectedRole})</strong>
              </label>
              <div className="flex gap-2">
                <select
                  value={countryDialCode}
                  onChange={(e) => setCountryDialCode(e.target.value)}
                  className="w-[110px] p-3 border border-[#42b883] rounded-lg text-sm bg-white cursor-pointer outline-none"
                >
                  {countryCallingCodes.map((item, index) => (
                    <option key={`${item.country}-${index}`} value={item.callingCode}>
                      {item.country} ({item.callingCode})
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  placeholder="Enter 10-digit mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="flex-1 p-3 border border-[#42b883] rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#42b883]"
                  autoComplete="tel-national"
                  required
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Registered Email Address for <strong className="text-[#08b36a]">{selectedRoleLabel} ({selectedRole})</strong>
              </label>
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-[#42b883] rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#42b883]"
                autoComplete="email"
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading || authLoading}
            className="w-full bg-[#08b36a] hover:bg-[#068f54] text-white py-3 rounded-lg text-sm font-semibold transition-colors disabled:bg-gray-400 cursor-pointer"
          >
            {loading ? `Verifying ${selectedRole} & Sending OTP...` : `Send ${selectedRoleLabel} Reset OTP →`}
          </button>
        </form>
      )}

      {/* ================= STEP 2: VERIFY OTP ================= */}
      {step === 2 && (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div className="p-3 bg-[#e6ffed] border border-[#08b36a]/30 rounded-lg text-center">
            <p className="text-xs font-semibold text-[#1a7f37]">
              Resetting password for: <span className="font-bold uppercase tracking-wider">{selectedRoleLabel} ({selectedRole})</span>
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Enter 6-Digit SMS Verification Code
            </label>
            <input
              type="text"
              maxLength={6}
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full p-3 border border-[#42b883] rounded-lg text-center tracking-[8px] text-lg font-bold outline-none focus:ring-1 focus:ring-[#42b883]"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || otp.length < 6}
            className="w-full bg-[#08b36a] hover:bg-[#068f54] text-white py-3 rounded-lg text-sm font-semibold transition-colors disabled:bg-gray-400 cursor-pointer"
          >
            {loading ? "Verifying OTP..." : "Verify & Continue →"}
          </button>

          <button
            type="button"
            onClick={() => { setStep(1); setOtp(""); setError(""); setSuccess(""); }}
            className="w-full text-xs text-gray-500 hover:text-gray-800 text-center block cursor-pointer"
          >
            ← Change Mobile Number / Role
          </button>
        </form>
      )}

      {/* ================= STEP 3: SET NEW PASSWORD ================= */}
      {step === 3 && (
        <form onSubmit={handleResetPassword} className="space-y-3">
          <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-center">
            <p className="text-xs text-gray-600">
              New Password for: <strong className="text-[#08b36a]">{selectedRoleLabel} ({selectedRole})</strong>
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              placeholder="Minimum 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-3 border border-[#42b883] rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#42b883]"
              autoComplete="new-password"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              placeholder="Re-type new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 border border-[#42b883] rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#42b883]"
              autoComplete="new-password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#08b36a] hover:bg-[#068f54] text-white py-3 rounded-lg text-sm font-semibold transition-colors disabled:bg-gray-400 cursor-pointer"
          >
            {loading ? "Updating Password..." : `Update ${selectedRole} Password & Login →`}
          </button>
        </form>
      )}

      {/* FOOTER */}
      <div className="mt-4 pt-3 border-t border-gray-100 text-center">
        <p className="text-xs text-gray-600">
          Remembered your password?{" "}
          <span
            className="font-bold text-[#08b36a] cursor-pointer hover:underline"
            onClick={() => {
              closeModal();
              openModal("login");
            }}
          >
            Back to Login
          </span>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;