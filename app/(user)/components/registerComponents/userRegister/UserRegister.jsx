"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useGlobalContext } from "@/app/context/GlobalContext";
import { useUserContext } from "@/app/context/UserContext";

function UserRegister() {
  const { registerAsUser, loading } = useAuth();
  const { closeModal, openModal } = useGlobalContext();
  const { getAllCountries, getStatesByCountry, getCitiesByState } =
    useUserContext();

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const [formData, setFormData] = useState({
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

  // ================= FETCH =================
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

  const fetchStates = async (countryId) => {
    try {
      const data = await getStatesByCountry(countryId);
      setStates(data || []);
      setCities([]);
    } catch {
      console.error("Failed to load states");
    }
  };

  const fetchCities = async (stateId) => {
    try {
      const data = await getCitiesByState(stateId);
      setCities(data || []);
    } catch {
      console.error("Failed to load cities");
    }
  };

  // ================= CHANGE =================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (name === "country") fetchStates(value);
    if (name === "state") fetchCities(value);
  };

  // ================= VALIDATION =================
  const validateForm = () => {
    const {
      name,
      email,
      phone,
      country,
      state,
      city,
      password,
      confirmPassword,
      termsAccepted,
    } = formData;

    if (
      !name ||
      !email ||
      !phone ||
      !country ||
      !state ||
      !city ||
      !password ||
      !confirmPassword
    ) {
      return "All fields are required";
    }

    if (password.length < 6)
      return "Password must be at least 6 characters";

    if (password !== confirmPassword)
      return "Passwords do not match";

    if (!termsAccepted)
      return "You must accept terms & conditions";

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

      await registerAsUser(finalData);

      setSuccess("Registration successful!");
      closeModal();
    } catch (err) {
      setError(err?.message || "Something went wrong");
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

            {/* INPUTS */}
            <input
              type="text"
              placeholder="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#08B36A]"
            />

            <input
              type="email"
              placeholder="Email Address"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#08B36A]"
            />

            <input
              type="text"
              placeholder="Mobile Number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#08B36A]"
            />

            {/* LOCATION ROW */}
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

            {/* PASSWORDS */}
            <input
              type="password"
              placeholder="Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#08B36A]"
            />

            <input
              type="password"
              placeholder="Confirm Password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#08B36A]"
            />

            {/* TERMS */}
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

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto px-8 py-3 bg-[#08B36A] text-white font-semibold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 hover:bg-green-700 disabled:opacity-70"
            >
              {loading ? "Registering..." : "Register →"}
            </button>
          </form>

          <p className="text-sm text-gray-600 mt-6">
            Already have an account?{" "}
            <span
              onClick={() => {
                closeModal();
                openModal("login");
              }}
              className="text-[#08B36A] font-medium cursor-pointer hover:underline"
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