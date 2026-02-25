"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useGlobalContext } from "@/app/context/GlobalContext";
import { useUserContext } from "@/app/context/UserContext";

function RegisterAsHospital() {
  const { registerAsHospital, loading } = useAuth();
  const { closeModal, openModal } = useGlobalContext();
  const { getAllCountries, getStatesByCountry, getCitiesByState } = useUserContext();
  const router = useRouter();

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const [formData, setFormData] = useState({
    type: "",
    name: "",
    email: "",
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

  // ================= FETCH COUNTRIES =================
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const data = await getAllCountries();
        setCountries(data || []);
      } catch {
        console.error("Failed to load countries");
      }
    };
    fetchCountries();
  }, []);

  // ================= FETCH STATES =================
  const fetchStates = async (countryId) => {
    try {
      const data = await getStatesByCountry(countryId);
      setStates(data || []);
      setCities([]);
    } catch {
      console.error("Failed to load states");
    }
  };

  // ================= FETCH CITIES =================
  const fetchCities = async (stateId) => {
    try {
      const data = await getCitiesByState(stateId);
      setCities(data || []);
    } catch {
      console.error("Failed to load cities");
    }
  };

  // ================= HANDLE CHANGE =================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (name === "country") {
      fetchStates(value);
      setFormData((prev) => ({ ...prev, state: "", city: "" }));
    }
    if (name === "state") {
      fetchCities(value);
      setFormData((prev) => ({ ...prev, city: "" }));
    }
  };

  // ================= VALIDATION =================
  const validateForm = () => {
    if (
      !formData.type ||
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.country ||
      // !formData.state ||
      // !formData.city ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      return "All fields are required.";
    }

    if (formData.password.length < 6) {
      return "Password must be at least 6 characters.";
    }

    if (formData.password !== formData.confirmPassword) {
      return "Passwords do not match.";
    }

    if (!formData.termsAccepted) {
      return "You must accept terms & conditions.";
    }

    return null;
  };

  // ================= SUBMIT =================
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
      const selectedCountry = countries.find(
        (c) => c.id == formData.country
      );
      const selectedState = states.find(
        (s) => s.id == formData.state
      );
      const selectedCity = cities.find(
        (c) => c.id == formData.city
      );

      const finalData = {
        ...formData,
        country: selectedCountry?.name || "",
        state: selectedState?.name || "",
        city: selectedCity?.name || "",
      };

      // Remove confirmPassword from final data before sending to API
      delete finalData.confirmPassword;

      console.log(finalData)
      await registerAsHospital(finalData);

      setSuccess(
        "Hospital Registered Successfully! Please complete your documentation."
      );

      router.push("/hospital/documents");
    } catch (err) {
      setError(err?.message || err);
    }
  };

  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12">

        {/* LEFT IMAGE */}
        <div className="w-full lg:w-1/2 transition-transform duration-500 hover:scale-105">
          <img
            src="https://healthvideos12-new1.s3.us-west-2.amazonaws.com/1692602393service.png"
            alt="Register"
            className="w-full rounded-xl shadow-2xl"
          />
        </div>

        {/* RIGHT FORM */}
        <div className="w-full lg:w-1/2">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-gray-800">
            Get Started
          </h1>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-600">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-300 text-green-700">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#08B36A]"
            >
              <option value="">Register As</option>
              <option value="Govt">Government Hospital</option>
              <option value="Private">Private Hospital</option>
              <option value="Charity">Charity Hospital</option>
            </select>

            <input
              type="text"
              placeholder="Hospital name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#08B36A]"
            />

            <input
              type="email"
              placeholder="Hospital email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#08B36A]"
            />

            <input
              type="text"
              placeholder="Hospital phone number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#08B36A]"
            />

            <p className="text-sm text-gray-500 -mt-2">
              We'll never share your phone with anyone else.
            </p>

            {/* LOCATION ROW - Same as UserRegister */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#08B36A]"
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
                className="border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#08B36A] disabled:bg-gray-100"
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
                className="border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#08B36A] disabled:bg-gray-100"
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
              placeholder="Enter your password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#08B36A]"
            />

            <input
              type="password"
              placeholder="Confirm your password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#08B36A]"
            />

            {/* Password Match Indicator */}
            {formData.password && formData.confirmPassword && (
              <div className="text-sm">
                {formData.password === formData.confirmPassword ? (
                  <p className="text-green-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Passwords match
                  </p>
                ) : (
                  <p className="text-red-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Passwords do not match
                  </p>
                )}
              </div>
            )}

            {/* Terms */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="termsAccepted"
                checked={formData.termsAccepted}
                onChange={handleChange}
                className="accent-[#08B36A]"
              />
              <span className="text-sm text-gray-600">
                Allow All Terms & Conditions on this site
              </span>
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto px-8 py-3 bg-[#08B36A] text-white font-semibold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 hover:bg-green-700 disabled:opacity-70"
            >
              {loading ? "Registering..." : "Register →"}
            </button>

            <p className="text-sm text-gray-600 mt-6">
              Already have an account?{" "}
              <span
                onClick={() => {
                  closeModal();
                  openModal("login");
                }}
                className="text-[#08B36A] cursor-pointer font-medium hover:underline"
              >
                Login
              </span>
            </p>

          </form>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="mt-16 max-w-5xl mx-auto">
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-gray-800">
            Hospital
          </h2>
          <p className="text-base md:text-lg leading-8 text-gray-600 max-w-3xl">
            Join our platform and manage appointments, doctors, and patients efficiently.
          </p>
        </div>
      </div>

    </div>
  );
}

export default RegisterAsHospital;