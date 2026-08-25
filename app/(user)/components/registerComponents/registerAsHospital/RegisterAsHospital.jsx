"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useGlobalContext } from "@/app/context/GlobalContext";
import { useUserContext } from "@/app/context/UserContext";
import { getCountries, getCountryCallingCode, parsePhoneNumberFromString } from "libphonenumber-js";

function RegisterAsHospital() {
  const { registerAsHospital, loading } = useAuth();
  const { closeModal, openModal } = useGlobalContext();
  const { getAllCountries, getStatesByCountry, getCitiesByState } = useUserContext();
  const router = useRouter();

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
    type: "", // "Govt" | "Private" | "Charity"
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

  // ================= 2. FORM FIELD HANDLERS =================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (name === "country") fetchStates(value);
    if (name === "state") fetchCities(value);
  };

  const validateForm = () => {
    const { type, name, email, phone, countryDialCode, country, state, city, password, confirmPassword, termsAccepted } = formData;
    if (!type || !name || !email || !phone || !country || !state || !city || !password || !confirmPassword) {
      return "All fields are required.";
    }

    const cleanPhone = phone.replace(/\s+/g, "");
    const fullNumber = `${countryDialCode}${cleanPhone}`;
    const parsed = parsePhoneNumberFromString(fullNumber);
    if (!parsed || !parsed.isValid()) {
      return "Please enter a valid hospital phone number (digits only).";
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

      const finalData = {
        type: formData.type,
        name: formData.name,
        email: formData.email,
        countryCode: formData.countryDialCode,
        phone: formData.phone.replace(/\s+/g, ""),
        password: formData.password,
        country: selectedCountry?.name || "",
        state: selectedState?.name || "",
        city: selectedCity?.name || "",
      };

      await registerAsHospital(finalData);
      setSuccess("Hospital Registered Successfully! Redirecting...");

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
      <div className="flex flex-col md:flex-row items-center justify-center bg-white p-0 md:p-6 rounded-lg w-full max-w-[1100px] mx-auto">
        {/* LEFT IMAGE / ILLUSTRATION */}
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
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full p-3 border border-[#42b883] rounded outline-none text-sm focus:ring-1 focus:ring-[#42b883] bg-white cursor-pointer"
            >
              <option value="">Register As (Hospital Type)</option>
              <option value="Govt">Government Hospital</option>
              <option value="Private">Private Hospital</option>
              <option value="Charity">Charity / Trust Hospital</option>
            </select>

            <input
              type="text"
              name="name"
              placeholder="Hospital Name"
              className="w-full p-3 border border-[#42b883] rounded outline-none text-sm focus:ring-1 focus:ring-[#42b883]"
              value={formData.name}
              onChange={handleChange}
              autoComplete="organization"
            />

            <input
              type="email"
              name="email"
              placeholder="Hospital Official Email"
              className="w-full p-3 border border-[#42b883] rounded outline-none text-sm focus:ring-1 focus:ring-[#42b883]"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
            />

            {/* PHONE ROW */}
            <div className="flex gap-2">
              <select
                name="countryDialCode"
                value={formData.countryDialCode}
                onChange={handleChange}
                className="w-[115px] p-3 border border-[#42b883] rounded outline-none text-sm focus:ring-1 focus:ring-[#42b883] bg-white cursor-pointer"
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
                placeholder="Hospital Phone Number"
                className="flex-1 p-3 border border-[#42b883] rounded outline-none text-sm focus:ring-1 focus:ring-[#42b883]"
                value={formData.phone}
                onChange={handleChange}
                autoComplete="tel-national"
              />
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
              placeholder="Create Password"
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

export default RegisterAsHospital;