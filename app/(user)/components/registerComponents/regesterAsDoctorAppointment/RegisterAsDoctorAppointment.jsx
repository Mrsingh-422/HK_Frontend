"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useGlobalContext } from "@/app/context/GlobalContext";
import { useUserContext } from "@/app/context/UserContext";

function RegisterAsDoctorAppointment() {
  const { registerAsDoctorAppointment, loading } = useAuth();
  const { closeModal, openModal } = useGlobalContext();
  const { getDoctorSpecializations, getDoctorQualifications } =
    useUserContext();

  const [qualifications, setQualifications] = useState([]);
  const [specialists, setSpecialists] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const quals = await getDoctorQualifications();
        const specs = await getDoctorSpecializations();
        setQualifications(quals || []);
        setSpecialists(specs || []);
      } catch (error) {
        console.error("Failed to load doctor metadata", error);
      }
    };
    loadData();
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    address: "",
    qualification: "",
    speciality: "",
    licenseNumber: "",
    councilNumber: "",
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
      !formData.email ||
      !formData.phone ||
      !formData.address ||
      !formData.qualification ||
      !formData.speciality ||
      !formData.licenseNumber ||
      !formData.councilNumber ||
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
      setSuccess(
        "Doctor registration successful! Please wait for admin approval."
      );
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
            src="https://healthvideos12-new1.s3.us-west-2.amazonaws.com/1692602351user-login.png"
            alt="Doctor Register"
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

            {/* INPUT STYLE */}
            {[
              { name: "name", type: "text", placeholder: "Enter your name" },
              { name: "phone", type: "text", placeholder: "Enter your phone number" },
              { name: "address", type: "text", placeholder: "Enter your Address" },
              { name: "licenseNumber", type: "text", placeholder: "Enter your License Number" },
              { name: "councilNumber", type: "text", placeholder: "Enter your Council Number" },
            ].map((field) => (
              <input
                key={field.name}
                type={field.type}
                name={field.name}
                placeholder={field.placeholder}
                value={formData[field.name]}
                onChange={handleChange}
                className="w-full border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#08B36A] focus:border-[#08B36A]"
              />
            ))}

            {/* EMAIL + VERIFY */}
            <div className="flex gap-2">
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                className="flex-1 border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#08B36A]"
              />
              <button
                type="button"
                className="px-4 bg-[#08B36A] text-white font-medium hover:bg-green-700 transition"
              >
                Verify
              </button>
            </div>

            <p className="text-sm text-gray-500">
              We'll never share your phone with anyone else.
            </p>

            {/* SELECTS */}
            <select
              name="qualification"
              value={formData.qualification}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#08B36A]"
            >
              <option value="">Select qualification</option>
              {qualifications.map((qual) => (
                <option key={qual._id} value={qual.id}>
                  {qual.name}
                </option>
              ))}
            </select>

            <select
              name="speciality"
              value={formData.speciality}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#08B36A]"
            >
              <option value="">Select Specialist</option>
              {specialists.map((spec) => (
                <option key={spec._id} value={spec.id}>
                  {spec.name}
                </option>
              ))}
            </select>

            {/* PASSWORD */}
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#08B36A]"
            />

            {/* CHECKBOX */}
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
      <div className="max-w-5xl mx-auto mt-16 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Vendor Doctor
        </h2>
        <p className="text-gray-600">
          ✓ Join our platform as a certified medical professional and start
          managing your appointments, patients and availability easily.
        </p>
      </div>
    </div>
  );
}

export default RegisterAsDoctorAppointment;