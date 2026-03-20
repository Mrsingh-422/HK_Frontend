"use client";
import React, { useState } from "react";

export default function NurseProfileEdit() {
  // Nurse-specific state
  const [formData, setFormData] = useState({
    fullName: "Nurse Maria",
    nursingAgency: "Health Kangaroo Medics",
    email: "nurse.maria@example.com",
    gender: "Female",
    phone: "9876543210",
    address: "Sector 17",
    city: "Chandigarh",
    state: "Punjab",
    country: "India",
    experience: "5",
    qualification: "B.Sc Nursing",
    councilNumber: "RN-8829405",
    homeVisitFees: "500",
    dutyShiftFees: "1500",
    language: "English, Hindi, Punjabi",
    availability: { onDuty: true, emergency: false },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 ">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* --- Header Section --- */}
        <div className="bg-emerald-600 px-8 py-6 text-white flex items-center gap-6">
          <div className="relative">
            {/* Profile Image Placeholder */}
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
              Edit Nurse Profile
            </h2>
          </div>

          <form>
            {/* File Upload Row */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Update Profile Picture</label>
              <input
                type="file"
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 border border-gray-200 rounded-lg"
              />
            </div>

            {/* 2-Column Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <InputField label="Full Name" name="fullName" value={formData.fullName} onChange={handleChange} />
              <InputField label="Nursing Agency / Clinic" name="nursingAgency" value={formData.nursingAgency} onChange={handleChange} />
             
              <InputField label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} />
              <InputField label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} />
             
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <InputField label="Languages Spoken" name="language" value={formData.language} onChange={handleChange} />

              <InputField label="Street Address" name="address" value={formData.address} onChange={handleChange} />
              <InputField label="City" name="city" value={formData.city} onChange={handleChange} />
              <InputField label="State" name="state" value={formData.state} onChange={handleChange} />
              <InputField label="Country" name="country" value={formData.country} onChange={handleChange} />

              {/* Nurse Qualifications */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nursing Qualification</label>
                <select name="qualification" value={formData.qualification} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all">
                  <option value="B.Sc Nursing">B.Sc Nursing</option>
                  <option value="GNM">GNM (General Nursing)</option>
                  <option value="ANM">ANM</option>
                  <option value="M.Sc Nursing">M.Sc Nursing</option>
                </select>
              </div>
              <InputField label="Years of Experience" name="experience" type="number" value={formData.experience} onChange={handleChange} />
             
              <InputField label="Nursing Council Reg. No." name="councilNumber" value={formData.councilNumber} onChange={handleChange} />
             
              {/* Nurse-specific Fees */}
              <InputField label="Home Visit Charge (₹)" name="homeVisitFees" type="number" value={formData.homeVisitFees} onChange={handleChange} />
              <InputField label="Full Day/Shift Charge (₹)" name="dutyShiftFees" type="number" value={formData.dutyShiftFees} onChange={handleChange} />

              {/* Checkboxes for Availability */}
              <div className="flex flex-col justify-center">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Service Availability</label>
                <div className="flex items-center space-x-6">
                  <label className="flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-5 h-5 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500" />
                    <span className="ml-2 text-gray-700 font-medium">Available for Duty</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input type="checkbox" className="w-5 h-5 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500" />
                    <span className="ml-2 text-gray-700 font-medium">Emergency Calls</span>
                  </label>
                </div>
              </div>
            </div>

            {/* --- Buttons Section --- */}
            <div className="mt-10 pt-6 border-t border-gray-100 flex flex-col sm:flex-row justify-end items-center gap-4">
              <button type="button" className="w-full sm:w-auto px-6 py-2.5 text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-lg font-medium transition-colors">
                Edit Bio / About
              </button>
              <button type="button" className="w-full sm:w-auto px-6 py-2.5 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg font-medium transition-colors">
                Security & Password
              </button>
              <button type="submit" className="w-full sm:w-auto px-8 py-2.5 text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg font-medium shadow-md shadow-emerald-200 transition-all">
                Save Nurse Profile
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

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