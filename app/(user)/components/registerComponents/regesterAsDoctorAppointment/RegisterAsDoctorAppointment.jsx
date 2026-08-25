"use client";
import React, { useEffect, useState, useMemo, useRef } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useGlobalContext } from "@/app/context/GlobalContext";
import { useUserContext } from "@/app/context/UserContext";
import { useRouter } from "next/navigation";
import { getCountries, getCountryCallingCode, parsePhoneNumberFromString } from "libphonenumber-js";

// Firebase imports
import { auth } from "@/lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

function RegisterAsDoctorAppointment() {
  const { checkDoctorExists, registerAsDoctor, loading } = useAuth();
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
      recaptchaVerifierRef.current = new RecaptchaVerifier(auth, "doctor-recaptcha-container", {
        size: "invisible",
        callback: () => {},
        "expired-callback": () => setError("reCAPTCHA expired. Please try again."),
      });
    }
    return recaptchaVerifierRef.current;
  };

  // ================= 3. DOCTOR PRE-CHECK & SEND OTP =================
  const handleSendOtp = async () => {
    setError("");
    setSuccess("");

    if (!formData.phone || formData.phone.trim().length === 0) {
      setError("Please enter your 10-digit mobile number.");
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
      // Step 1: Doctor Pre-check API
      if (checkDoctorExists) {
        const checkRes = await checkDoctorExists({
          phone: cleanPhone,
          email: formData.email || undefined,
        });

        if (checkRes?.exists) {
          setError(checkRes.message || "This mobile number is already registered as a Doctor. Please Login.");
          setOtpLoading(false);
          return;
        }
      }

      // Step 2: Send Firebase SMS OTP
      const appVerifier = getOrCreateRecaptcha();
      const confirmation = await signInWithPhoneNumber(auth, fullNumber, appVerifier);
      setConfirmationResult(confirmation);
      setOtpSent(true);
      setSuccess(`6-digit OTP sent to ${fullNumber}`);
    } catch (err) {
      console.error("Firebase Doctor OTP Error:", err);
      if (recaptchaVerifierRef.current) {
        try { recaptchaVerifierRef.current.clear(); } catch (e) {}
        recaptchaVerifierRef.current = null;
      }
      setError(typeof err === "string" ? err : err?.message || "Failed to send SMS OTP. Check phone number.");
    } finally {
      setOtpLoading(false);
    }
  };

  // ================= 4. VERIFY OTP =================
  const handleVerifyOtp = async () => {
    setError("");
    setSuccess("");

    if (!otpCode || otpCode.trim().length < 6) {
      setError("Please enter the 6-digit OTP received on SMS.");
      return;
    }

    setOtpLoading(true);
    try {
      const userCredential = await confirmationResult.confirm(otpCode.trim());
      const idToken = await userCredential.user.getIdToken();

      setFirebaseIdToken(idToken);
      setIsPhoneVerified(true);
      setOtpSent(false);
      setSuccess("Phone number verified successfully!");
    } catch (err) {
      console.error("Doctor OTP Verification Error:", err);
      setError("Invalid or expired OTP. Please enter the correct code.");
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

    if (name === "phone" || name === "countryDialCode") {
      setIsPhoneVerified(false);
      setFirebaseIdToken("");
      setOtpSent(false);
    }
  };

  const validateForm = () => {
    const { name, phone, country, state, city, password, confirmPassword, termsAccepted } = formData;
    if (!name || !phone || !country || !state || !city || !password || !confirmPassword) {
      return "All fields are required.";
    }
    if (!isPhoneVerified || !firebaseIdToken) {
      return "Please verify your mobile number with SMS OTP before registering.";
    }
    if (password.length < 6) return "Password must be at least 6 characters.";
    if (password !== confirmPassword) return "Passwords do not match.";
    if (!termsAccepted) return "You must accept the Terms & Conditions.";
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
        email: formData.email || undefined,
        phone: formData.phone.replace(/\s+/g, ""),
        countryCode: formData.countryDialCode,
        country: selectedCountry?.name || "",
        state: selectedState?.name || "",
        city: selectedCity?.name || "",
        password: formData.password,
        idToken: firebaseIdToken, // Firebase Real SMS Verified ID Token
      };

      await registerAsDoctor(payload);
      setSuccess("Doctor registered & phone verified! Redirecting to credentials upload...");

      setTimeout(() => {
        closeModal();
        router.push("/vendors/independentdoctor/documents");
      }, 1500);
    } catch (err) {
      setError(typeof err === "string" ? err : err?.message || "Registration failed.");
    }
  };

  return (
    <div className="w-full bg-white">
      <div id="doctor-recaptcha-container"></div>

      <div className="flex flex-col md:flex-row items-center justify-center bg-white p-0 md:p-6 rounded-lg w-full max-w-[1100px] mx-auto">
        {/* LEFT IMAGE / ILLUSTRATION */}
        <div className="hidden md:flex flex-col items-center justify-center flex-shrink-0 p-4">
          <img
            src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=600&auto=format&fit=crop&q=80"
            alt="Doctor Onboarding"
            className="w-[280px] lg:w-[360px] h-[360px] object-cover rounded-2xl shadow-md border border-gray-100"
          />
        </div>

        {/* RIGHT FORM */}
        <div className="flex-1 w-full md:ml-8 lg:ml-10 text-center md:text-left">
          <h2 className="text-xl sm:text-2xl md:text-[30px] font-bold mb-4 leading-tight text-gray-900">
            Get Started
          </h2>

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
            <input
              type="text"
              name="name"
              placeholder="Doctor Full Name (e.g. Dr. Rohit Verma)"
              className="w-full p-3 border border-[#42b883] rounded outline-none text-sm focus:ring-1 focus:ring-[#42b883]"
              onChange={handleChange}
              value={formData.name}
              autoComplete="name"
            />

            <input
              type="email"
              name="email"
              placeholder="Doctor Email Address"
              className="w-full p-3 border border-[#42b883] rounded outline-none text-sm focus:ring-1 focus:ring-[#42b883]"
              onChange={handleChange}
              value={formData.email}
              autoComplete="email"
            />

            {/* PHONE ROW */}
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
                  placeholder="Mobile Number"
                  className="flex-1 p-3 border border-[#42b883] rounded outline-none text-sm focus:ring-1 focus:ring-[#42b883] disabled:bg-gray-100"
                  onChange={handleChange}
                  value={formData.phone}
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
                    disabled={otpLoading}
                    className="bg-[#2f8f5b] hover:bg-[#256f47] text-white px-4 py-2 rounded text-xs font-semibold transition-colors whitespace-nowrap disabled:bg-gray-400 cursor-pointer"
                  >
                    {otpLoading ? "Sending..." : "Send OTP"}
                  </button>
                )}
              </div>

              {/* INLINE OTP INPUT */}
              {otpSent && !isPhoneVerified && (
                <div className="flex gap-2 p-2.5 bg-gray-50 border border-dashed border-[#42b883] rounded-md animate-in fade-in">
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
              placeholder="Password (min. 6 characters)"
              className="w-full p-3 border border-[#42b883] rounded outline-none text-sm focus:ring-1 focus:ring-[#42b883]"
              onChange={handleChange}
              value={formData.password}
              autoComplete="new-password"
            />

            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              className="w-full p-3 border border-[#42b883] rounded outline-none text-sm focus:ring-1 focus:ring-[#42b883]"
              onChange={handleChange}
              value={formData.confirmPassword}
              autoComplete="new-password"
            />

            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                name="termsAccepted"
                id="doc-terms"
                className="w-4 h-4 accent-[#2f8f5b] cursor-pointer"
                checked={formData.termsAccepted}
                onChange={handleChange}
              />
              <label htmlFor="doc-terms" className="text-sm text-gray-700 cursor-pointer">
                Allow All Terms & Conditions
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto mt-4 bg-[#2f8f5b] hover:bg-[#256f47] text-white py-3 px-10 rounded text-base transition-colors disabled:bg-gray-300 cursor-pointer font-medium"
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

export default RegisterAsDoctorAppointment;