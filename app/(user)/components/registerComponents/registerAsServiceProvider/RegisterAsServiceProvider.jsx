"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useGlobalContext } from "@/app/context/GlobalContext";
import { useUserContext } from "@/app/context/UserContext";

function RegisterAsServiceProvider() {
  const { registerAsServiceProvider, loading } = useAuth();
  const { closeModal, openModal } = useGlobalContext();
  const { getAllCountries, getStatesByCountry, getCitiesByState } = useUserContext();
  const router = useRouter();

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const [formData, setFormData] = useState({
    category: "",
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
    if (!formData.category || !formData.name || !formData.email || !formData.phone || !formData.country || !formData.password || !formData.confirmPassword) {
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
      await registerAsServiceProvider(finalData);

      setSuccess("Registration successful! Redirecting...");

      setTimeout(() => {
        closeModal();
        const path = formData.category.toLowerCase();
        if (path === "lab") router.push("/vendors/labvendor/documents");
        else if (path === "pharmacy") router.push("/vendors/pharmacy/documents");
        else if (path === "nursing") router.push("/vendors/nursevendor/documents");
        else router.push("/");
      }, 1500);
    } catch (err) {
      setError(err?.message || "Registration failed.");
    }
  };

  return (
    <div className="w-full bg-white">
      <div className="flex flex-col md:flex-row items-center justify-center bg-white p-0 md:p-10 rounded-lg w-full max-w-[1100px] mx-auto">

        {/* LEFT IMAGE */}
        <div className="hidden md:block flex-shrink-0">
          <img
            src="https://healthvideos12-new1.s3.us-west-2.amazonaws.com/1692602393service.png"
            alt="Service Provider"
            className="w-[280px] lg:w-[350px] max-w-full rounded-xl"
          />
        </div>

        {/* RIGHT FORM */}
        <div className="flex-1 w-full md:ml-8 lg:ml-15 text-center md:text-left">
          <h2 className="text-xl sm:text-2xl md:text-[32px] font-bold mb-5 leading-tight">Get Started</h2>

          {success && <div className="bg-[#e6ffed] text-[#1a7f37] border border-[#1a7f37] p-2.5 rounded-md mb-4 text-sm font-medium">{success}</div>}
          {error && <div className="bg-[#ffe6e6] text-[#d93025] border border-[#d93025] p-2.5 rounded-md mb-4 text-sm font-medium">{error}</div>}

          <form onSubmit={handleSubmit} className="w-full">
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full p-3 border border-[#42b883] rounded outline-none text-sm mb-3 focus:ring-1 focus:ring-[#42b883] bg-white"
            >
              <option value="">Register As</option>
              <option value="Nursing">Nursing</option>
              <option value="Pharmacy">Pharmacy</option>
              <option value="Lab">Lab / Phlebotomist</option>
            </select>

            <input
              type="text"
              name="name"
              placeholder="Full Name"
              className="w-full p-3 border border-[#42b883] rounded outline-none text-sm mb-3"
              value={formData.name}
              onChange={handleChange}
            />

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              className="w-full p-3 border border-[#42b883] rounded outline-none text-sm mb-3"
              value={formData.email}
              onChange={handleChange}
            />

            <input
              type="text"
              name="phone"
              placeholder="Phone Number"
              className="w-full p-3 border border-[#42b883] rounded outline-none text-sm mb-1"
              value={formData.phone}
              onChange={handleChange}
            />
            <p className="text-[12px] text-gray-500 mb-3 text-left">We'll never share your phone with others.</p>

            {/* LOCATION ROW - Country, State, City in one line */}
            <div className="flex flex-col md:flex-row gap-3 mb-3">
              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="flex-1 p-3 border border-[#42b883] rounded outline-none text-sm bg-white"
              >
                <option value="">Country</option>
                {countries.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>

              <select
                name="state"
                value={formData.state}
                onChange={handleChange}
                disabled={!formData.country}
                className="flex-1 p-3 border border-[#42b883] rounded outline-none text-sm bg-white disabled:bg-gray-50"
              >
                <option value="">State</option>
                {states.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>

              <select
                name="city"
                value={formData.city}
                onChange={handleChange}
                disabled={!formData.state}
                className="flex-1 p-3 border border-[#42b883] rounded outline-none text-sm bg-white disabled:bg-gray-50"
              >
                <option value="">City</option>
                {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <input
              type="password"
              name="password"
              placeholder="Password"
              className="w-full p-3 border border-[#42b883] rounded outline-none text-sm mb-3"
              value={formData.password}
              onChange={handleChange}
            />

            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              className="w-full p-3 border border-[#42b883] rounded outline-none text-sm mb-3"
              value={formData.confirmPassword}
              onChange={handleChange}
            />

            <div className="flex items-center gap-1.5 mt-2 text-sm">
              <input
                type="checkbox"
                name="termsAccepted"
                className="w-4 h-4 accent-[#2f8f5b] cursor-pointer"
                checked={formData.termsAccepted}
                onChange={handleChange}
              />
              <label className="text-gray-600 cursor-pointer">Allow All Terms & Conditions</label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto mt-5 bg-[#2f8f5b] hover:bg-[#256f47] text-white py-3 px-10 rounded text-base transition-colors"
            >
              {loading ? "Registering..." : "Register →"}
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto mt-10 px-4 md:px-0 pb-10">
        <h3 className="text-lg md:text-[28px] font-bold mb-5">Service Provider</h3>
        <div className="flex gap-3 text-sm md:text-base leading-relaxed text-[#333]">
          <span className="text-[#2f8f5b] font-bold mt-1">✔</span>
          <p>
            Join our network of healthcare professionals. Whether you are a Nurse, a Pharmacist, or a Lab Expert,
            our platform helps you reach patients in need and manage your services digitally.
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterAsServiceProvider;