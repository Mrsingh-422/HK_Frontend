"use client";
import React, { useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useGlobalContext } from "@/app/context/GlobalContext";

function RegisterAsServiceProvider() {
  const { registerAsServiceProvider, loading } = useAuth();
  const { closeModal, openModal } = useGlobalContext();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    category: "",
    phone: "",
    location: "",
    password: "",
    termsAccepted: false,
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateForm = () => {
    if (!formData.name || !formData.phone || !formData.location || !formData.password || !formData.category || !formData.gender) {
      return "All fields are required.";
    }
    if (formData.password.length < 6) return "Password must be at least 6 characters.";
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
      await registerAsServiceProvider(formData);
      setSuccess("Service Provider Registered Successfully!");
      setTimeout(() => {
        closeModal();
        router.push("/");
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
            alt="Service Illustration"
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
            {/* NAME */}
            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              className="w-full p-3 border border-[#42b883] rounded outline-none text-sm mb-3 focus:ring-1 focus:ring-[#42b883]"
              value={formData.name}
              onChange={handleChange}
            />

            {/* GENDER */}
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full p-3 border border-[#42b883] rounded outline-none text-sm mb-3 focus:ring-1 focus:ring-[#42b883] bg-white"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>

            {/* CATEGORY */}
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full p-3 border border-[#42b883] rounded outline-none text-sm mb-3 focus:ring-1 focus:ring-[#42b883] bg-white"
            >
              <option value="">Select Category</option>
              <option value="Nursing">Nursing</option>
              <option value="Pharmacy">Pharmacy</option>
              <option value="Lab">Phlebotomist / Lab</option>
            </select>

            {/* PHONE */}
            <input
              type="text"
              name="phone"
              placeholder="Enter your phone number"
              className="w-full p-3 border border-[#42b883] rounded outline-none text-sm mb-1 focus:ring-1 focus:ring-[#42b883]"
              value={formData.phone}
              onChange={handleChange}
            />
            <p className="text-[13px] text-gray-500 mb-3 text-left">
              We'll never share your phone with anyone else.
            </p>

            {/* LOCATION */}
            <input
              type="text"
              name="location"
              placeholder="Enter your location"
              className="w-full p-3 border border-[#42b883] rounded outline-none text-sm mb-3 focus:ring-1 focus:ring-[#42b883]"
              value={formData.location}
              onChange={handleChange}
            />

            {/* PASSWORD */}
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              className="w-full p-3 border border-[#42b883] rounded outline-none text-sm mb-3 focus:ring-1 focus:ring-[#42b883]"
              value={formData.password}
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
          Service Provider
        </h3>
        
        <div className="space-y-4">
          <div className="flex gap-3 text-sm md:text-base leading-relaxed text-[#333]">
            <span className="text-[#2f8f5b] font-bold mt-1">✔</span>
            <p><strong>Nursing:</strong> Provide professional home care services including elderly care and post-surgery assistance.</p>
          </div>
          <div className="flex gap-3 text-sm md:text-base leading-relaxed text-[#333]">
            <span className="text-[#2f8f5b] font-bold mt-1">✔</span>
            <p><strong>Pharmacy:</strong> Register your pharmacy to deliver medicines quickly and safely to patients.</p>
          </div>
          <div className="flex gap-3 text-sm md:text-base leading-relaxed text-[#333]">
            <span className="text-[#2f8f5b] font-bold mt-1">✔</span>
            <p><strong>Lab / Phlebotomist:</strong> Offer home sample collection and diagnostic services at patient doorsteps.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterAsServiceProvider;