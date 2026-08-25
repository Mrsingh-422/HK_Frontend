"use client";
import React, { useState, useEffect, useMemo, useRef } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useGlobalContext } from "@/app/context/GlobalContext";
import { useUserContext } from "@/app/context/UserContext";
import { getCountries, getCountryCallingCode, parsePhoneNumberFromString } from "libphonenumber-js";

// Firebase imports
import { auth } from "@/lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

function UserRegister() {
  const { checkUserExists, registerAsUser, loading } = useAuth();
  const { closeModal, openModal } = useGlobalContext();
  const { getAllCountries, getStatesByCountry, getCitiesByState } = useUserContext();

  const recaptchaVerifierRef = useRef(null);

  // Country Dialing Codes
  const countryCallingCodes = useMemo(() => {
    return getCountries()
      .map((country) => ({
        country,
        callingCode: `+${getCountryCallingCode(country)}`,
      }))
      .sort((a, b) => a.callingCode.localeCompare(b.callingCode, undefined, { numeric: true }));
  }, []);

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    countryDialCode: "+91",
    phone: "",
    country: "",
    state: "",
    city: "",
    password: "",
    confirmPassword: "",
    termsAccepted: false,
  });

  // OTP States
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [firebaseIdToken, setFirebaseIdToken] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);

  const [otpLoading, setOtpLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ================= 1. FETCH LOCATION DATA =================
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const data = await getAllCountries();
        setCountries(data || []);
      } catch (err) {
        console.error("Failed to load countries", err);
      }
    };
    fetchCountries();
  }, [getAllCountries]);

  const fetchStates = async (countryId) => {
    try {
      const data = await getStatesByCountry(countryId);
      setStates(data || []);
      setCities([]);
    } catch (err) {
      console.error("Failed to load states", err);
    }
  };

  const fetchCities = async (stateId) => {
    try {
      const data = await getCitiesByState(stateId);
      setCities(data || []);
    } catch (err) {
      console.error("Failed to load cities", err);
    }
  };

  // ================= 2. FIREBASE RECAPTCHA =================
  const getOrCreateRecaptcha = () => {
    if (typeof window === "undefined") return null;
    if (!recaptchaVerifierRef.current) {
      recaptchaVerifierRef.current = new RecaptchaVerifier(auth, "user-recaptcha-container", {
        size: "invisible",
        callback: () => {},
        "expired-callback": () => setError("reCAPTCHA expired. Please try again."),
      });
    }
    return recaptchaVerifierRef.current;
  };

  // ================= 3. PRE-CHECK & SEND OTP =================
  const handleSendOtp = async () => {
    setError("");
    setSuccess("");

    if (!formData.phone) {
      setError("Please enter a valid phone number first.");
      return;
    }

    const cleanPhone = formData.phone.replace(/\s+/g, "");
    const fullNumber = `${formData.countryDialCode}${cleanPhone}`;
    const parsed = parsePhoneNumberFromString(fullNumber);

    if (!parsed || !parsed.isValid()) {
      setError("Please enter a valid mobile number for selected country code.");
      return;
    }

    setOtpLoading(true);
    try {
      // Step 1: Pre-check if already registered
      const checkRes = await checkUserExists({
        phone: cleanPhone,
        email: formData.email || undefined,
      });

      if (checkRes?.exists) {
        setError(checkRes.message || "Mobile number is already registered. Please login.");
        setOtpLoading(false);
        return;
      }

      // Step 2: Send Firebase SMS OTP
      const appVerifier = getOrCreateRecaptcha();
      const confirmation = await signInWithPhoneNumber(auth, fullNumber, appVerifier);
      setConfirmationResult(confirmation);
      setOtpSent(true);
      setSuccess(`OTP sent to ${fullNumber}`);
    } catch (err) {
      console.error("Firebase User OTP Error:", err);
      if (recaptchaVerifierRef.current) {
        try { recaptchaVerifierRef.current.clear(); } catch (e) {}
        recaptchaVerifierRef.current = null;
      }
      setError(typeof err === "string" ? err : err?.message || "Failed to send SMS OTP.");
    } finally {
      setOtpLoading(false);
    }
  };

  // ================= 4. VERIFY OTP =================
  const handleVerifyOtp = async () => {
    setError("");
    setSuccess("");

    if (!otpCode || otpCode.length < 6) {
      setError("Please enter the complete 6-digit OTP.");
      return;
    }

    setOtpLoading(true);
    try {
      const userCredential = await confirmationResult.confirm(otpCode);
      const idToken = await userCredential.user.getIdToken();

      setFirebaseIdToken(idToken);
      setIsPhoneVerified(true);
      setOtpSent(false);
      setSuccess("Phone number verified successfully!");
    } catch (err) {
      console.error("OTP Verification Error:", err);
      setError("Invalid or expired OTP. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  // ================= 5. FORM HANDLERS =================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (name === "country") fetchStates(value);
    if (name === "state") fetchCities(value);

    if (name === "phone" || name === "countryDialCode") {
      setIsPhoneVerified(false);
      setFirebaseIdToken("");
      setOtpSent(false);
    }
  };

  const validateForm = () => {
    const { name, email, phone, country, state, city, password, confirmPassword, termsAccepted } = formData;
    if (!name || !email || !phone || !country || !state || !city || !password || !confirmPassword) {
      return "All fields are required.";
    }
    if (!isPhoneVerified || !firebaseIdToken) {
      return "Please verify your mobile number with SMS OTP before submitting.";
    }
    if (password.length < 6) return "Password must be at least 6 characters.";
    if (password !== confirmPassword) return "Passwords do not match.";
    if (!termsAccepted) return "You must accept terms & conditions.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const selectedCountry = countries.find((c) => c.id == formData.country);
      const selectedState = states.find((s) => s.id == formData.state);
      const selectedCity = cities.find((c) => c.id == formData.city);

      const payload = {
        name: formData.name,
        email: formData.email,
        countryCode: formData.countryDialCode,
        phone: formData.phone.replace(/\s+/g, ""),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        country: selectedCountry?.name || "",
        state: selectedState?.name || "",
        city: selectedCity?.name || "",
        idToken: firebaseIdToken,
      };

      await registerAsUser(payload);
      setSuccess("User Registered & Phone Verified Successfully!");
      setTimeout(() => closeModal(), 1500);
    } catch (err) {
      setError(typeof err === "string" ? err : err?.message || "Registration failed.");
    }
  };

  return (
    <div className="w-full bg-white">
      <div id="user-recaptcha-container"></div>

      <div className="flex flex-col md:flex-row items-center justify-center bg-white p-0 md:p-10 rounded-lg w-full max-w-[1100px] mx-auto">
        {/* LEFT IMAGE */}
        <div className="hidden md:block flex-shrink-0">
          <img
            src="https://healthvideos12-new1.s3.us-west-2.amazonaws.com/1692602393service.png"
            alt="Register"
            className="w-[280px] lg:w-[450px] max-w-full rounded-xl"
          />
        </div>

        {/* RIGHT FORM */}
        <div className="flex-1 w-full md:ml-8 lg:ml-12 text-center md:text-left">
          <h2 className="text-xl sm:text-2xl md:text-[32px] font-bold mb-5 leading-tight">
            Get Started
          </h2>

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

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              placeholder="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-3 border border-[#42b883] rounded outline-none text-sm focus:ring-1 focus:ring-[#42b883]"
            />

            <input
              type="email"
              placeholder="Email Address"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 border border-[#42b883] rounded outline-none text-sm focus:ring-1 focus:ring-[#42b883]"
            />

            {/* PHONE ROW */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <select
                  name="countryDialCode"
                  value={formData.countryDialCode}
                  onChange={handleChange}
                  disabled={isPhoneVerified}
                  className="w-[110px] p-3 border border-[#42b883] rounded outline-none text-sm focus:ring-1 focus:ring-[#42b883] bg-white cursor-pointer disabled:bg-gray-100"
                >
                  {countryCallingCodes.map((item, index) => (
                    <option key={`${item.country}-${index}`} value={item.callingCode}>
                      {item.country} ({item.callingCode})
                    </option>
                  ))}
                </select>

                <input
                  type="tel"
                  placeholder="Mobile Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={isPhoneVerified}
                  className="flex-1 p-3 border border-[#42b883] rounded outline-none text-sm focus:ring-1 focus:ring-[#42b883] disabled:bg-gray-100"
                />

                {isPhoneVerified ? (
                  <span className="flex items-center gap-1 bg-[#e6ffed] text-[#1a7f37] border border-[#1a7f37] px-3 py-2 rounded text-xs font-semibold whitespace-nowrap">
                    ✓ Verified
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={otpLoading || !formData.phone}
                    className="bg-[#2f8f5b] hover:bg-[#256f47] text-white px-3 py-2 rounded text-xs transition-colors whitespace-nowrap disabled:bg-gray-300"
                  >
                    {otpLoading ? "Sending..." : "Send OTP"}
                  </button>
                )}
              </div>

              {/* INLINE OTP INPUT */}
              {otpSent && !isPhoneVerified && (
                <div className="flex gap-2 p-2.5 bg-gray-50 border border-dashed border-[#42b883] rounded">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit OTP"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded outline-none text-center tracking-widest text-sm bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={otpLoading || otpCode.length < 6}
                    className="bg-[#08b36a] text-white px-4 py-2 rounded text-xs font-medium hover:bg-[#068f54] disabled:bg-gray-300"
                  >
                    {otpLoading ? "Verifying..." : "Confirm OTP"}
                  </button>
                </div>
              )}
            </div>

            {/* LOCATION ROW */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full p-3 border border-[#42b883] rounded outline-none text-sm focus:ring-1 focus:ring-[#42b883] bg-white"
              >
                <option value="">Country</option>
                {countries.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <select
                name="state"
                value={formData.state}
                onChange={handleChange}
                disabled={!formData.country}
                className="w-full p-3 border border-[#42b883] rounded outline-none text-sm focus:ring-1 focus:ring-[#42b883] disabled:bg-gray-100 bg-white"
              >
                <option value="">State</option>
                {states.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>

              <select
                name="city"
                value={formData.city}
                onChange={handleChange}
                disabled={!formData.state}
                className="w-full p-3 border border-[#42b883] rounded outline-none text-sm focus:ring-1 focus:ring-[#42b883] disabled:bg-gray-100 bg-white"
              >
                <option value="">City</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <input
              type="password"
              placeholder="Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 border border-[#42b883] rounded outline-none text-sm focus:ring-1 focus:ring-[#42b883]"
            />

            <input
              type="password"
              placeholder="Confirm Password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full p-3 border border-[#42b883] rounded outline-none text-sm focus:ring-1 focus:ring-[#42b883]"
            />

            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                name="termsAccepted"
                checked={formData.termsAccepted}
                onChange={handleChange}
                className="w-4 h-4 accent-[#2f8f5b] cursor-pointer"
              />
              <span className="text-sm text-gray-700">Allow All Terms & Conditions on this site</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto mt-4 bg-[#2f8f5b] hover:bg-[#256f47] text-white py-3 px-8 rounded text-base transition-colors disabled:bg-gray-300"
            >
              {loading ? "Registering..." : "Register →"}
            </button>
          </form>

          <p className="mt-5 text-[15px] text-gray-700">
            Already have an account?{" "}
            <span
              onClick={() => {
                closeModal();
                openModal("login");
              }}
              className="font-bold cursor-pointer hover:underline text-[#2f8f5b]"
            >
              Login
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default UserRegister;