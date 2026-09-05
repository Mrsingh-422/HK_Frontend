"use client";
import React, { useState, useEffect, useMemo, useRef } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useGlobalContext } from "@/app/context/GlobalContext";
import { useUserContext } from "@/app/context/UserContext";
import { getCountries, getCountryCallingCode, parsePhoneNumberFromString } from "libphonenumber-js";

// Firebase imports
import { auth } from "@/lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

function RegisterAsHospital() {
  const { checkHospitalExists, registerAsHospital, loading } = useAuth();
  const { closeModal, openModal } = useGlobalContext();
  const { getAllCountries, getStatesByCountry, getCitiesByState } = useUserContext();
  const router = useRouter();

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
    type: "Private", // "Govt" | "Private" | "Charity"
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

  // OTP & Verification States
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

  // ================= 2. FIREBASE RECAPTCHA SETUP =================
  const getOrCreateRecaptcha = () => {
    if (typeof window === "undefined") return null;
    if (!recaptchaVerifierRef.current) {
      recaptchaVerifierRef.current = new RecaptchaVerifier(auth, "hospital-recaptcha-container", {
        size: "invisible",
        callback: () => {},
        "expired-callback": () => setError("reCAPTCHA expired. Please try sending OTP again."),
      });
    }
    return recaptchaVerifierRef.current;
  };

  // ================= 3. PRE-CHECK & SEND SMS OTP =================
  const handleSendOtp = async () => {
    setError("");
    setSuccess("");

    if (!formData.type) {
      setError("Please select the Hospital Type first.");
      return;
    }

    if (!formData.phone || formData.phone.trim().length === 0) {
      setError("Please enter the 10-digit official hospital phone number.");
      return;
    }

    const cleanPhone = formData.phone.replace(/\s+/g, "");
    const fullNumber = `${formData.countryDialCode}${cleanPhone}`;
    const parsed = parsePhoneNumberFromString(fullNumber);

    if (!parsed || !parsed.isValid()) {
      setError("Please enter a valid mobile number for the selected country.");
      return;
    }

    setOtpLoading(true);
    try {
      // Step 1: Pre-check if phone or email already registered as Hospital
      if (checkHospitalExists) {
        const checkRes = await checkHospitalExists({
          phone: cleanPhone,
          email: formData.email ? formData.email.trim().toLowerCase() : undefined,
        });

        if (checkRes?.exists) {
          setError(checkRes.message || "This mobile number is already registered for a Hospital. Please Login.");
          setOtpLoading(false);
          return;
        }
      }

      // Step 2: Trigger Firebase Real SMS OTP
      const appVerifier = getOrCreateRecaptcha();
      const confirmation = await signInWithPhoneNumber(auth, fullNumber, appVerifier);
      setConfirmationResult(confirmation);
      setOtpSent(true);
      setSuccess(`6-digit SMS OTP sent to ${fullNumber}`);
    } catch (err) {
      console.error("Firebase Hospital OTP Error:", err);
      if (recaptchaVerifierRef.current) {
        try { recaptchaVerifierRef.current.clear(); } catch (e) {}
        recaptchaVerifierRef.current = null;
      }
      setError(typeof err === "string" ? err : err?.message || "Failed to send SMS OTP. Please check your phone number.");
    } finally {
      setOtpLoading(false);
    }
  };

  // ================= 4. CONFIRM OTP & GET ID TOKEN =================
  const handleVerifyOtp = async () => {
    setError("");
    setSuccess("");

    if (!otpCode || otpCode.trim().length < 6) {
      setError("Please enter the complete 6-digit OTP.");
      return;
    }

    setOtpLoading(true);
    try {
      const userCredential = await confirmationResult.confirm(otpCode.trim());
      const idToken = await userCredential.user.getIdToken();

      setFirebaseIdToken(idToken);
      setIsPhoneVerified(true);
      setOtpSent(false);
      setSuccess("Hospital official phone number verified successfully!");
    } catch (err) {
      console.error("Hospital OTP Verification Error:", err);
      setError("Invalid or expired OTP. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  // ================= 5. FORM FIELD HANDLERS =================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (name === "country") fetchStates(value);
    if (name === "state") fetchCities(value);

    // Reset phone verification if phone or country code changes
    if (name === "phone" || name === "countryDialCode") {
      setIsPhoneVerified(false);
      setFirebaseIdToken("");
      setOtpSent(false);
    }
  };

  const validateForm = () => {
    const { type, name, phone, country, state, city, password, confirmPassword, termsAccepted } = formData;
    if (!type || !name || !phone || !country || !state || !city || !password || !confirmPassword) {
      return "All required fields must be filled.";
    }
    if (!isPhoneVerified || !firebaseIdToken) {
      return "Please verify the hospital mobile number with SMS OTP before submitting.";
    }
    if (password.length < 6) return "Password must be at least 6 characters.";
    if (password !== confirmPassword) return "Passwords do not match.";
    if (!termsAccepted) return "You must accept the Terms & Conditions.";
    return null;
  };

  // ================= 6. SUBMIT REGISTRATION =================
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

      const finalData = {
        name: formData.name,
        type: formData.type,
        email: formData.email ? formData.email.trim().toLowerCase() : undefined,
        countryCode: formData.countryDialCode,
        phone: formData.phone.replace(/\s+/g, ""),
        password: formData.password,
        country: selectedCountry?.name || "",
        state: selectedState?.name || "",
        city: selectedCity?.name || "",
        idToken: firebaseIdToken, // Firebase Verified ID Token
      };

      await registerAsHospital(finalData);
      setSuccess("Hospital Registered & Phone Verified Successfully! Redirecting to KYC upload...");

      setTimeout(() => {
        closeModal();
        router.push("/hospital/documents");
      }, 1500);
    } catch (err) {
      setError(typeof err === "string" ? err : err?.message || "Hospital registration failed.");
    }
  };

  return (
    <div className="w-full bg-white">
      {/* Invisible Recaptcha Element */}
      <div id="hospital-recaptcha-container"></div>

      <div className="flex flex-col md:flex-row items-center justify-center bg-white p-0 md:p-6 rounded-lg w-full max-w-[1100px] mx-auto">
        {/* LEFT IMAGE */}
        <div className="hidden md:flex flex-col items-center justify-center flex-shrink-0 p-4">
          <img
            src="https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=600&auto=format&fit=crop&q=80"
            alt="Hospital Facility"
            className="w-[280px] lg:w-[360px] h-[360px] object-cover rounded-2xl shadow-md border border-gray-100"
          />
        </div>

        {/* RIGHT FORM */}
        <div className="flex-1 w-full md:ml-8 lg:ml-10 text-center md:text-left">
          <h2 className="text-xl sm:text-2xl md:text-[30px] font-bold mb-4 leading-tight text-gray-900">
            Get Started
          </h2>

          {/* Alert Banners */}
          {success && (
            <div className="bg-[#e6ffed] text-[#1a7f37] border border-[#1a7f37] p-2.5 rounded-md mb-3 text-sm font-medium animate-in fade-in duration-300">
              {success}
            </div>
          )}
          {error && (
            <div className="bg-[#ffe6e6] text-[#d93025] border border-[#d93025] p-2.5 rounded-md mb-3 text-sm font-medium animate-in fade-in duration-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Hospital Type Selection */}
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full p-3 border border-[#42b883] rounded outline-none text-sm focus:ring-1 focus:ring-[#42b883] bg-white cursor-pointer"
            >
              <option value="Private">Private Hospital</option>
              <option value="Govt">Government Hospital</option>
              <option value="Charity">Charity / Trust Hospital</option>
            </select>

            <input
              type="text"
              name="name"
              placeholder="Hospital Name (e.g. Fortis Super Speciality Hospital)"
              className="w-full p-3 border border-[#42b883] rounded outline-none text-sm focus:ring-1 focus:ring-[#42b883]"
              value={formData.name}
              onChange={handleChange}
              autoComplete="organization"
            />

            <input
              type="email"
              name="email"
              placeholder="Hospital Official Email (Optional)"
              className="w-full p-3 border border-[#42b883] rounded outline-none text-sm focus:ring-1 focus:ring-[#42b883]"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
            />

            {/* PHONE ROW WITH FIREBASE SMS OTP */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <select
                  name="countryDialCode"
                  value={formData.countryDialCode}
                  onChange={handleChange}
                  disabled={isPhoneVerified}
                  className="w-[115px] p-3 border border-[#42b883] rounded outline-none text-sm focus:ring-1 focus:ring-[#42b883] bg-white cursor-pointer disabled:bg-gray-100"
                >
                  {countryCallingCodes.map((item, index) => (
                    <option key={`${item.country}-${index}`} value={item.callingCode}>
                      {item.country} ({item.callingCode})
                    </option>
                  ))}
                </select>

                <input
                  type="tel"
                  name="phone"
                  placeholder="10-digit Hospital Contact Phone"
                  className="flex-1 p-3 border border-[#42b883] rounded outline-none text-sm focus:ring-1 focus:ring-[#42b883] disabled:bg-gray-100"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={isPhoneVerified}
                  autoComplete="tel-national"
                />

                {isPhoneVerified ? (
                  <span className="flex items-center justify-center gap-1 bg-[#e6ffed] text-[#1a7f37] border border-[#1a7f37] px-4 py-2 rounded text-xs font-bold whitespace-nowrap">
                    ✓ Verified
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={otpLoading || !formData.phone}
                    className="bg-[#2f8f5b] hover:bg-[#256f47] text-white px-4 py-2 rounded text-xs font-semibold transition-colors whitespace-nowrap disabled:bg-gray-400 cursor-pointer"
                  >
                    {otpLoading ? "Sending..." : "Send OTP"}
                  </button>
                )}
              </div>

              {/* INLINE OTP INPUT BOX */}
              {otpSent && !isPhoneVerified && (
                <div className="flex gap-2 p-2.5 bg-gray-50 border border-dashed border-[#42b883] rounded-md animate-in fade-in">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit OTP"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded outline-none text-center tracking-widest text-sm bg-white font-bold"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={otpLoading || otpCode.length < 6}
                    className="bg-[#08b36a] text-white px-4 py-2 rounded text-xs font-medium hover:bg-[#068f54] disabled:bg-gray-300 cursor-pointer"
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
                className="w-full p-3 border border-[#42b883] rounded outline-none text-sm bg-white cursor-pointer"
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
                className="w-full p-3 border border-[#42b883] rounded outline-none text-sm bg-white disabled:bg-gray-100 cursor-pointer"
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
                className="w-full p-3 border border-[#42b883] rounded outline-none text-sm bg-white disabled:bg-gray-100 cursor-pointer"
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
              name="password"
              placeholder="Create Password (min. 6 characters)"
              className="w-full p-3 border border-[#42b883] rounded outline-none text-sm focus:ring-1 focus:ring-[#42b883]"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
            />

            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              className="w-full p-3 border border-[#42b883] rounded outline-none text-sm focus:ring-1 focus:ring-[#42b883]"
              value={formData.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
            />

            <div className="flex items-center gap-1.5 mt-2">
              <input
                type="checkbox"
                name="termsAccepted"
                id="hosp-terms"
                className="w-4 h-4 accent-[#2f8f5b] cursor-pointer"
                checked={formData.termsAccepted}
                onChange={handleChange}
              />
              <label htmlFor="hosp-terms" className="text-sm text-gray-700 cursor-pointer">
                Allow All Terms & Conditions on this site
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto mt-4 bg-[#2f8f5b] hover:bg-[#256f47] text-white py-3 px-10 rounded text-base transition-colors disabled:bg-gray-300 cursor-pointer font-medium"
            >
              {loading ? "Registering..." : "Register Hospital →"}
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

export default RegisterAsHospital;