"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useGlobalContext } from "@/app/context/GlobalContext";
import { useUserContext } from "@/app/context/UserContext";

function UserRegister() {
  const { registerAsUser, loading } = useAuth();
  const { closeModal, openModal } = useGlobalContext();
  const { getAllCountries, getStatesByCountry, getCitiesByState } = useUserContext();

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

  // ================= FETCH LOGIC =================
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

  // ================= HANDLERS =================
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
    const { name, email, phone, country, state, city, password, confirmPassword, termsAccepted } = formData;
    if (!name || !email || !phone || !country || !state || !city || !password || !confirmPassword) return "All fields are required";
    if (password.length < 6) return "Password must be at least 6 characters";
    if (password !== confirmPassword) return "Passwords do not match";
    if (!termsAccepted) return "You must accept terms & conditions";
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
        ...formData,
        country: selectedCountry?.name || "",
        state: selectedState?.name || "",
        city: selectedCity?.name || "",
      };

      await registerAsUser(finalData);
      setSuccess("Registration successful!");
      setTimeout(() => closeModal(), 1500);
    } catch (err) {
      setError(err?.message || "Something went wrong");
    }
  };

  return (
    <div className="w-full bg-white">
      {/* TOP REGISTER BOX */}
      <div className="flex flex-col md:flex-row items-center justify-center bg-white p-0 md:p-10 rounded-lg w-full max-w-[1100px] mx-auto">

        {/* LEFT IMAGE - Hidden on mobile, matches Login reference */}
        <div className="hidden md:block flex-shrink-0">
          <img
            src="https://healthvideos12-new1.s3.us-west-2.amazonaws.com/1692602393service.png"
            alt="Register Illustration"
            className="w-[280px] lg:w-[450px] max-w-full rounded-xl"
          />
        </div>

        {/* RIGHT FORM */}
        <div className="flex-1 w-full md:ml-8 lg:ml-12 text-center md:text-left">
          <h2 className="text-xl sm:text-2xl md:text-[32px] font-bold mb-5 leading-tight">
            Get Started
          </h2>

          {/* Success Message - Exact same style as Login */}
          {success && (
            <div className="bg-[#e6ffed] text-[#1a7f37] border border-[#1a7f37] p-2.5 rounded-md mb-4 text-sm font-medium animate-in fade-in duration-300">
              {success}
            </div>
          )}

          {/* Error Message - Exact same style as Login */}
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

            <input
              type="text"
              placeholder="Mobile Number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full p-3 border border-[#42b883] rounded outline-none text-sm focus:ring-1 focus:ring-[#42b883]"
            />

            {/* LOCATION ROW */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full p-3 border border-[#42b883] rounded outline-none text-sm focus:ring-1 focus:ring-[#42b883] bg-white"
              >
                <option value="">Country</option>
                {countries.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>

              <select
                name="state"
                value={formData.state}
                onChange={handleChange}
                disabled={!formData.country}
                className="w-full p-3 border border-[#42b883] rounded outline-none text-sm focus:ring-1 focus:ring-[#42b883] disabled:bg-gray-100 bg-white"
              >
                <option value="">State</option>
                {states.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>

              <select
                name="city"
                value={formData.city}
                onChange={handleChange}
                disabled={!formData.state}
                className="w-full p-3 border border-[#42b883] rounded outline-none text-sm focus:ring-1 focus:ring-[#42b883] disabled:bg-gray-100 bg-white"
              >
                <option value="">City</option>
                {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
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

            {/* TERMS */}
            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                name="termsAccepted"
                checked={formData.termsAccepted}
                onChange={handleChange}
                className="w-4 h-4 accent-[#2f8f5b] cursor-pointer"
              />
              <span className="text-sm text-gray-600">
                Allow All Terms & Conditions on this site
              </span>
            </div>

            {/* BUTTON - Matches Login reference */}
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto mt-4 bg-[#2f8f5b] hover:bg-[#256f47] text-white py-3 px-8 rounded text-base transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
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

      {/* FOOTER DESCRIPTION - Matches Login reference */}
      <div className="max-w-[1100px] mx-auto mt-10 px-4 md:px-0 pb-10">
        <h3 className="text-lg sm:text-xl md:text-[28px] font-bold mb-5">
          User Registration
        </h3>
        <p className="text-sm md:text-base leading-relaxed text-[#333]">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolore maiores,
          in aliquam cum nulla laudantium voluptatum maxime numquam ipsum molestias
          porro totam. Eius ducimus harum, sint perspiciatis vel delectus quam.
        </p>
      </div>
    </div>
  );
}

export default UserRegister;