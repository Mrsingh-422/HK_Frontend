"use client";
import React, { useState } from "react";

export default function DoctorProfileEdit() {
  // Dummy state based on your screenshots
  const[formData, setFormData] = useState({
    fullName: "HkDoctor",
    clinicName: "Hk",
    email: "hkdoctor@yopmail.com",
    gender: "Male",
    phone: "7696591560",
    address: "Chandigarh",
    city: "Dharamsala",
    state: "Himachal Pradesh",
    country: "India",
    experience: "15",
    qualification: "MBBS",
    councilNumber: "14253654",
    onlineFees: "1200",
    offlineFees: "800",
    language: "Hindi",
    availability: { online: false, offline: false },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* --- Header Section --- */}
        <div className="bg-emerald-600 px-8 py-6 text-white flex items-center gap-6">
          <div className="relative">
            {/* Placeholder for Profile Image */}
            <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-200 overflow-hidden flex items-center justify-center text-gray-400">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
               </svg>
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold">{formData.fullName}</h1>
            <p className="flex items-center text-emerald-100 mt-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {formData.city}, {formData.country}
            </p>
          </div>
        </div>

        {/* --- Form Section --- */}
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800 border-b-2 border-emerald-500 pb-1 inline-block">
              Edit Your Profile
            </h2>
          </div>

          <form>
            {/* File Upload Row (Full Width) */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Profile Image</label>
              <input 
                type="file" 
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 border border-gray-200 rounded-lg"
              />
            </div>

            {/* 2-Column Grid for Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <InputField label="Full Name" name="fullName" value={formData.fullName} onChange={handleChange} />
              <InputField label="Clinic Name" name="clinicName" value={formData.clinicName} onChange={handleChange} />
              
              <InputField label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} />
              <InputField label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} />
              
              {/* Select Dropdowns */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <InputField label="Language" name="language" value={formData.language} onChange={handleChange} />

              {/* Address Details */}
              <InputField label="Address (Street)" name="address" value={formData.address} onChange={handleChange} />
              <InputField label="City" name="city" value={formData.city} onChange={handleChange} />
              <InputField label="State" name="state" value={formData.state} onChange={handleChange} />
              <InputField label="Country" name="country" value={formData.country} onChange={handleChange} />

              {/* Professional Details */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Qualification</label>
                <select name="qualification" value={formData.qualification} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all">
                  <option value="MBBS">MBBS</option>
                  <option value="BDS">BDS</option>
                  <option value="MD">MD</option>
                  <option value="BAMS">BAMS</option>
                </select>
              </div>
              <InputField label="Experience (Years)" name="experience" type="number" value={formData.experience} onChange={handleChange} />
              
              <InputField label="Council Number" name="councilNumber" value={formData.councilNumber} onChange={handleChange} />
              
              {/* Fees Details */}
              <InputField label="Online Consultancy Fees (₹)" name="onlineFees" type="number" value={formData.onlineFees} onChange={handleChange} />
              <InputField label="Offline Consultancy Fees (₹)" name="offlineFees" type="number" value={formData.offlineFees} onChange={handleChange} />

              {/* Checkboxes for Availability */}
              <div className="flex flex-col justify-center">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Your Availability</label>
                <div className="flex items-center space-x-6">
                  <label className="flex items-center cursor-pointer">
                    <input type="checkbox" className="w-5 h-5 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500" />
                    <span className="ml-2 text-gray-700">Online</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input type="checkbox" className="w-5 h-5 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500" />
                    <span className="ml-2 text-gray-700">Offline</span>
                  </label>
                </div>
              </div>
            </div>

            {/* --- Buttons Section --- */}
            <div className="mt-10 pt-6 border-t border-gray-100 flex flex-col sm:flex-row justify-end items-center gap-4">
              <button type="button" className="w-full sm:w-auto px-6 py-2.5 text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-lg font-medium transition-colors">
                Add & Change About
              </button>
              <button type="button" className="w-full sm:w-auto px-6 py-2.5 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg font-medium transition-colors">
                Change Password
              </button>
              <button type="submit" className="w-full sm:w-auto px-8 py-2.5 text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg font-medium shadow-md shadow-emerald-200 transition-all">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Reusable Input Component (Keeps code clean)
const InputField = ({ label, name, type = "text", value, onChange }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
    />
  </div>
);