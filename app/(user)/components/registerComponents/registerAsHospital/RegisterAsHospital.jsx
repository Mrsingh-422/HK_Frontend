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

    if (name === "country") {
      fetchStates(value);
      setFormData((prev) => ({ ...prev, state: "", city: "" }));
    }
    if (name === "state") {
      fetchCities(value);
      setFormData((prev) => ({ ...prev, city: "" }));
    }
  };

  const validateForm = () => {
    if (!formData.type || !formData.name || !formData.email || !formData.phone || !formData.country || !formData.password || !formData.confirmPassword) {
      return "All fields are required.";
    }
    if (formData.password.length < 6) return "Password must be at least 6 characters.";
    if (formData.password !== formData.confirmPassword) return "Passwords do not match.";
    if (!formData.termsAccepted) return "You must accept terms & conditions.";
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

      delete finalData.confirmPassword;
      await registerAsHospital(finalData);

      setSuccess("Hospital Registered Successfully! Redirecting...");
      setTimeout(() => {
        closeModal();
        router.push("/hospital/documents");
      }, 1500);
    } catch (err) {
      setError(err?.message || "Registration failed.");
    }
  };

  return (
    <div className="w-full bg-white">
      {/* TOP REGISTER BOX */}
      <div className="flex flex-col md:flex-row items-center justify-center bg-white p-0 md:p-10 rounded-lg w-full max-w-[1100px] mx-auto">

        {/* LEFT IMAGE - Hidden on mobile, visible from md up */}
        <div className="hidden md:block flex-shrink-0">
          <img
            src="https://healthvideos12-new1.s3.us-west-2.amazonaws.com/1692602393service.png"
            alt="Hospital Register"
            className="w-[280px] lg:w-[350px] max-w-full rounded-xl"
          />
        </div>

        {/* RIGHT FORM */}
        <div className="flex-1 w-full md:ml-8 lg:ml-15 text-center md:text-left">
          <h2 className="text-xl sm:text-2xl md:text-[32px] font-bold mb-5 leading-tight">
            Get Started
          </h2>

          {/* Success Message */}
          {success && (
            <div className="bg-[#e6ffed] text-[#1a7f37] border border-[#1a7f37] p-2.5 rounded-md mb-4 text-sm font-medium animate-in fade-in duration-300">
              {success}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-[#ffe6e6] text-[#d93025] border border-[#d93025] p-2.5 rounded-md mb-4 text-sm font-medium animate-in fade-in duration-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="w-full">
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full p-3 border border-[#42b883] rounded outline-none text-sm mb-3 focus:ring-1 focus:ring-[#42b883] bg-white"
            >
              <option value="">Register As</option>
              <option value="Govt">Government Hospital</option>
              <option value="Private">Private Hospital</option>
              <option value="Charity">Charity Hospital</option>
            </select>

            <input
              type="text"
              name="name"
              placeholder="Hospital Name"
              className="w-full p-3 border border-[#42b883] rounded outline-none text-sm mb-3 focus:ring-1 focus:ring-[#42b883]"
              value={formData.name}
              onChange={handleChange}
            />

            <input
              type="email"
              name="email"
              placeholder="Hospital Email"
              className="w-full p-3 border border-[#42b883] rounded outline-none text-sm mb-3 focus:ring-1 focus:ring-[#42b883]"
              value={formData.email}
              onChange={handleChange}
            />

            <input
              type="text"
              name="phone"
              placeholder="Hospital Phone Number"
              className="w-full p-3 border border-[#42b883] rounded outline-none text-sm mb-1 focus:ring-1 focus:ring-[#42b883]"
              value={formData.phone}
              onChange={handleChange}
            />
            <p className="text-[13px] text-gray-500 mb-3 text-left">
              We'll never share your phone with anyone else.
            </p>

            {/* LOCATION FIELDS - One per line as requested */}
            <select
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="w-full p-3 border border-[#42b883] rounded outline-none text-sm mb-3 focus:ring-1 focus:ring-[#42b883] bg-white"
            >
              <option value="">Country</option>
              {countries.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            <select
              name="state"
              value={formData.state}
              onChange={handleChange}
              disabled={!formData.country}
              className="w-full p-3 border border-[#42b883] rounded outline-none text-sm mb-3 focus:ring-1 focus:ring-[#42b883] disabled:bg-gray-100 bg-white"
            >
              <option value="">State</option>
              {states.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>

            <select
              name="city"
              value={formData.city}
              onChange={handleChange}
              disabled={!formData.state}
              className="w-full p-3 border border-[#42b883] rounded outline-none text-sm mb-3 focus:ring-1 focus:ring-[#42b883] disabled:bg-gray-100 bg-white"
            >
              <option value="">City</option>
              {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              className="w-full p-3 border border-[#42b883] rounded outline-none text-sm mb-3 focus:ring-1 focus:ring-[#42b883]"
              value={formData.password}
              onChange={handleChange}
            />

            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              className="w-full p-3 border border-[#42b883] rounded outline-none text-sm mb-3 focus:ring-1 focus:ring-[#42b883]"
              value={formData.confirmPassword}
              onChange={handleChange}
            />

            {/* TERMS */}
            <div className="flex items-center gap-1.5 mt-4 text-sm">
              <input
                type="checkbox"
                name="termsAccepted"
                className="w-4 h-4 accent-[#2f8f5b] cursor-pointer"
                checked={formData.termsAccepted}
                onChange={handleChange}
              />
              <label className="text-gray-600 cursor-pointer">
                Allow All Terms & Conditions on this site
              </label>
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto mt-5 bg-[#2f8f5b] hover:bg-[#256f47] text-white py-3 px-8 rounded text-base transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {loading ? "Registering..." : "Register →"}
            </button>
          </form>

          <p className="mt-4 text-[15px] text-gray-700">
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

      {/* FOOTER DESCRIPTION SECTION */}
      <div className="max-w-[1100px] mx-auto mt-10 px-4 md:px-0 pb-10">
        <h3 className="text-lg sm:text-xl md:text-[28px] font-bold mb-5">
          Hospital
        </h3>
        <div className="flex gap-3 text-sm md:text-base leading-relaxed text-[#333]">
          <span className="text-[#2f8f5b] font-bold mt-1">✔</span>
          <p>
            Join our platform and manage appointments, doctors, and patients efficiently.
            Registration is the first step towards digitalizing your healthcare facility.
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterAsHospital;