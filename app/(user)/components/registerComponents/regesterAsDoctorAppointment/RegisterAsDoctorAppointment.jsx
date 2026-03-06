"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useGlobalContext } from "@/app/context/GlobalContext";
import { useUserContext } from "@/app/context/UserContext";

function RegisterAsDoctorAppointment() {
  const { registerAsDoctorAppointment, loading } = useAuth();
  const { closeModal, openModal } = useGlobalContext();
  const { getDoctorSpecializations, getDoctorQualifications } = useUserContext();

  const [qualifications, setQualifications] = useState([]);
  const [specialists, setSpecialists] = useState([]);

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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.termsAccepted) {
      setError("You must accept terms & conditions.");
      return;
    }

    try {
      await registerAsDoctorAppointment(formData);
      setSuccess("Doctor registration successful! Please wait for admin approval.");
      setTimeout(() => closeModal(), 2000);
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
            src="https://healthvideos12-new1.s3.us-west-2.amazonaws.com/1692602351user-login.png"
            alt="Doctor Register"
            className="w-[280px] lg:w-[350px] max-w-full"
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
            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              className="w-full p-3 border border-[#42b883] rounded outline-none text-sm mb-3 focus:ring-1 focus:ring-[#42b883]"
              value={formData.name}
              onChange={handleChange}
            />

            <div className="flex gap-2 mb-3">
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                className="flex-1 p-3 border border-[#42b883] rounded outline-none text-sm focus:ring-1 focus:ring-[#42b883]"
                value={formData.email}
                onChange={handleChange}
              />
              <button
                type="button"
                className="px-4 bg-[#2f8f5b] text-white text-sm font-medium rounded hover:bg-[#256f47] transition"
              >
                Verify
              </button>
            </div>

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

            <input
              type="text"
              name="address"
              placeholder="Enter your Address"
              className="w-full p-3 border border-[#42b883] rounded outline-none text-sm mb-3 focus:ring-1 focus:ring-[#42b883]"
              value={formData.address}
              onChange={handleChange}
            />

            <select
              name="qualification"
              className="w-full p-3 border border-[#42b883] rounded outline-none text-sm mb-3 focus:ring-1 focus:ring-[#42b883] bg-white"
              value={formData.qualification}
              onChange={handleChange}
            >
              <option value="">Select qualification</option>
              {qualifications.map((qual) => (
                <option key={qual._id} value={qual.id}>{qual.name}</option>
              ))}
            </select>

            <select
              name="speciality"
              className="w-full p-3 border border-[#42b883] rounded outline-none text-sm mb-3 focus:ring-1 focus:ring-[#42b883] bg-white"
              value={formData.speciality}
              onChange={handleChange}
            >
              <option value="">Select Specialist</option>
              {specialists.map((spec) => (
                <option key={spec._id} value={spec.id}>{spec.name}</option>
              ))}
            </select>

            <input
              type="text"
              name="licenseNumber"
              placeholder="Enter your License Number"
              className="w-full p-3 border border-[#42b883] rounded outline-none text-sm mb-3 focus:ring-1 focus:ring-[#42b883]"
              value={formData.licenseNumber}
              onChange={handleChange}
            />

            <input
              type="text"
              name="councilNumber"
              placeholder="Enter your Council Number"
              className="w-full p-3 border border-[#42b883] rounded outline-none text-sm mb-3 focus:ring-1 focus:ring-[#42b883]"
              value={formData.councilNumber}
              onChange={handleChange}
            />

            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              className="w-full p-3 border border-[#42b883] rounded outline-none text-sm mb-3 focus:ring-1 focus:ring-[#42b883]"
              value={formData.password}
              onChange={handleChange}
            />

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

            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto mt-5 bg-[#2f8f5b] hover:bg-[#256f47] text-white py-3 px-7 rounded text-base transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
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

      {/* FOOTER SECTION */}
      <div className="max-w-[1100px] mx-auto mt-10 px-4 md:px-0 pb-10">
        <h3 className="text-lg sm:text-xl md:text-[28px] font-bold mb-5">
          Vendor Doctor
        </h3>
        <div className="flex gap-2 text-sm md:text-base leading-relaxed text-[#333]">
          <span className="text-[#2f8f5b] font-bold">✔</span>
          <p>
            Join our platform as a certified medical professional and start managing 
            your appointments, patients and availability easily.
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterAsDoctorAppointment;