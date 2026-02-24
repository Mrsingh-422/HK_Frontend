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
    if (
      !formData.name ||
      !formData.phone ||
      !formData.location ||
      !formData.password
    ) {
      return "All fields are required.";
    }

    if (formData.password.length < 6) {
      return "Password must be at least 6 characters.";
    }

    if (!formData.termsAccepted) {
      return "You must accept terms & conditions.";
    }

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

      setFormData({
        name: "",
        gender: "",
        category: "",
        phone: "",
        location: "",
        password: "",
        termsAccepted: false,
      });

      router.push("/");
    } catch (err) {
      setError(err?.message || err);
    }
  };

  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-10">

        {/* LEFT IMAGE */}
        <div className="w-full lg:w-1/2 transition-transform duration-500 hover:scale-105">
          <img
            src="https://healthvideos12-new1.s3.us-west-2.amazonaws.com/1692602393service.png"
            alt="Service Illustration"
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

            {/* NAME */}
            <input
              type="text"
              placeholder="Enter your name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#08B36A] focus:border-[#08B36A]"
            />

            {/* GENDER */}
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#08B36A]"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>

            {/* CATEGORY */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#08B36A]"
              >
                <option value="">Select</option>
                <option value="Nursing">Nursing</option>
                <option value="Pharmacy">Pharmacy</option>
                <option value="Lab">Phlebotomist / Lab</option>
              </select>
            </div>

            {/* PHONE */}
            <input
              type="text"
              placeholder="Enter your phone number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#08B36A]"
            />

            <p className="text-sm text-gray-500">
              We'll never share your phone with anyone else.
            </p>

            {/* LOCATION */}
            <input
              type="text"
              placeholder="Enter your location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#08B36A]"
            />

            {/* PASSWORD */}
            <input
              type="password"
              placeholder="Enter your password"
              name="password"
              value={formData.password}
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
              <label className="text-sm text-gray-600">
                Allow All Terms & Conditions on this site
              </label>
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto px-8 py-3 bg-[#08B36A] text-white font-semibold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 hover:bg-green-700 disabled:opacity-70"
            >
              {loading ? "Registering..." : "Register →"}
            </button>

            <p className="text-sm text-gray-600 mt-4">
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

      {/* BOTTOM INFO SECTION */}
      <div className="max-w-6xl mx-auto mt-16 grid md:grid-cols-3 gap-8 text-center">
        <div className="p-6 border border-gray-200 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            Nursing
          </h2>
          <p className="text-gray-600 text-sm">
            Provide professional home care services including elderly care,
            post-surgery assistance and patient monitoring.
          </p>
        </div>

        <div className="p-6 border border-gray-200 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            Pharmacy
          </h2>
          <p className="text-gray-600 text-sm">
            Register your pharmacy to deliver medicines quickly and safely.
          </p>
        </div>

        <div className="p-6 border border-gray-200 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            Lab / Phlebotomist
          </h2>
          <p className="text-gray-600 text-sm">
            Offer home sample collection and diagnostic services.
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterAsServiceProvider;