"use client";
import React, { useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useGlobalContext } from "@/app/context/GlobalContext";

function RegisterAsHospital() {
  const { registerAsHospital, loading } = useAuth();
  const { closeModal, openModal } = useGlobalContext();
  const router = useRouter();

  const [formData, setFormData] = useState({
    registerAs: "",
    hospitalName: "",
    email: "",
    phone: "",
    licenseNumber: "",
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
      !formData.registerAs ||
      !formData.hospitalName ||
      !formData.email ||
      !formData.phone ||
      !formData.licenseNumber ||
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
      await registerAsHospital(formData);

      setSuccess(
        "Hospital Registered Successfully! Please wait for admin approval."
      );

      router.push("/");
    } catch (err) {
      setError(err?.message || err);
    }
  };

  return (
    <div className=" min-h-screen bg-white md:px-20 box-border">

      {/* Top Container */}
      <div className="flex flex-col lg:flex-row justify-center items-center gap-10 lg:gap-24 max-w-6xl mx-auto">

        {/* Left Image */}
        <div className="flex-1 flex justify-center">
          <img
            src="https://healthvideos12-new1.s3.us-west-2.amazonaws.com/1692602447SMS-Hospital.jpeg"
            alt="Hospital"
            className="w-full max-w-[420px] h-[280px] md:h-[350px] lg:h-[450px] object-cover rounded-sm shadow-[0_20px_50px_rgba(0,0,0,0.08)] transition-transform duration-400 hover:-translate-y-2"
          />
        </div>

        {/* Right Form */}
        <div className="flex-1 max-w-[480px] w-full">
          <h1 className="text-2xl md:text-3xl lg:text-[42px] font-bold mb-8 text-center lg:text-left">
            Get Started
          </h1>

          {error && (
            <div className="bg-[#fdecea] text-[#d32f2f] border border-[#f5c6cb] p-3 rounded-lg text-sm mb-5">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-[#e6f9f0] text-[#08B36A] border border-[#b7ebd3] p-3 rounded-lg text-sm mb-5">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            <select
              name="registerAs"
              value={formData.registerAs}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-[#08B36A] text-sm focus:outline-none focus:ring-2 focus:ring-[#08B36A]/20"
            >
              <option value="">Register As</option>
              <option>Government Hospital</option>
              <option>Private Hospital</option>
              <option>Charity Hospital</option>
            </select>

            <input
              type="text"
              placeholder="Hospital name"
              name="hospitalName"
              value={formData.hospitalName}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-[#08B36A] text-sm focus:outline-none focus:ring-2 focus:ring-[#08B36A]/20"
            />

            <input
              type="email"
              placeholder="Hospital email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-[#08B36A] text-sm focus:outline-none focus:ring-2 focus:ring-[#08B36A]/20"
            />

            <input
              type="text"
              placeholder="Hospital phone number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-[#08B36A] text-sm focus:outline-none focus:ring-2 focus:ring-[#08B36A]/20"
            />

            <p className="text-xs text-gray-500 -mt-2">
              We'll never share your Phone with anyone else.
            </p>

            <input
              type="text"
              placeholder="Enter your license number"
              name="licenseNumber"
              value={formData.licenseNumber}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-[#08B36A] text-sm focus:outline-none focus:ring-2 focus:ring-[#08B36A]/20"
            />

            <input
              type="password"
              placeholder="Enter your password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-[#08B36A] text-sm focus:outline-none focus:ring-2 focus:ring-[#08B36A]/20"
            />

            {/* Terms */}
            <div className="flex items-start gap-3 text-sm mt-2">
              <input
                type="checkbox"
                name="termsAccepted"
                checked={formData.termsAccepted}
                onChange={handleChange}
                className="mt-1 w-4 h-4 accent-[#08B36A]"
              />
              <span>Allow All Terms & Conditions on this site</span>
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full lg:w-auto bg-[#08B36A] text-white px-7 py-3  text-sm font-semibold tracking-wide transition-all duration-300 shadow-[0_10px_25px_rgba(8,179,106,0.25)] hover:bg-[#05965a] hover:-translate-y-1 hover:shadow-[0_15px_35px_rgba(8,179,106,0.35)] active:translate-y-0"
            >
              {loading ? "Registering..." : "Register →"}
            </button>

            <p className="text-sm mt-4">
              Already have an account?{" "}
              <span
                onClick={() => openModal("login")}
                className="font-semibold underline cursor-pointer"
              >
                Login
              </span>
            </p>

          </form>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="mt-16 md:mt-24 max-w-5xl mx-auto">
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold mb-4">
            Hospital
          </h2>
          <p className="text-base md:text-lg leading-8 text-gray-700 max-w-3xl">
            Join our platform and manage appointments, doctors, and patients efficiently.
          </p>
        </div>
      </div>

    </div>
  );
}

export default RegisterAsHospital;