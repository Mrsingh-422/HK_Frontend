"use client";
import React, { useState } from "react";

export default function PharmacyProfileEdit() {
  // Pharmacy ke hisaab se state update kar di gayi hai
  const[formData, setFormData] = useState({
    pharmacyName: "HealthPlus Pharmacy",
    ownerName: "Rahul Sharma",
    email: "contact@healthplus.com",
    phone: "9876543210",
    address: "Sector 17 Market, SCO 45",
    city: "Chandigarh",
    state: "Punjab",
    zipCode: "160017",
    country: "India",
    licenseNumber: "DL-12345-HR",
    gstNumber: "06AABCU9603R1Z2",
    openingTime: "08:00 AM",
    closingTime: "10:00 PM",
    deliveryAvailable: true,
    open24x7: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: type === "checkbox" ? checked : value 
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* --- Header Section --- */}
        <div className="bg-emerald-600 px-8 py-6 text-white flex items-center gap-6">
          <div className="relative">
            {/* Store / Pharmacy Image Placeholder */}
            <div className="w-24 h-24 rounded-full border-4 border-white bg-emerald-50 overflow-hidden flex items-center justify-center text-emerald-500 shadow-md">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {/* Pharmacy Store Icon */}
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
               </svg>
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold">{formData.pharmacyName}</h1>
            <p className="flex items-center text-emerald-100 mt-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {formData.city}, {formData.country}
            </p>
            <p className="text-xs text-emerald-200 mt-1 font-medium">License: {formData.licenseNumber}</p>
          </div>
        </div>

        {/* --- Form Section --- */}
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800 border-b-2 border-emerald-500 pb-1 inline-block">
              Edit Pharmacy Details
            </h2>
          </div>

          <form>
            {/* File Upload Row (Full Width) */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Pharmacy Storefront Image</label>
              <input 
                type="file" 
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 border border-gray-200 rounded-lg"
              />
            </div>

            {/* 2-Column Grid for Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              
              {/* Basic Details */}
              <InputField label="Pharmacy Name" name="pharmacyName" value={formData.pharmacyName} onChange={handleChange} />
              <InputField label="Owner / Pharmacist Name" name="ownerName" value={formData.ownerName} onChange={handleChange} />
              
              <InputField label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} />
              <InputField label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} />

              {/* License & Business Details */}
              <InputField label="Drug License Number" name="licenseNumber" value={formData.licenseNumber} onChange={handleChange} />
              <InputField label="GST Number" name="gstNumber" value={formData.gstNumber} onChange={handleChange} />

              {/* Address Details */}
              <InputField label="Address (Street/Shop No.)" name="address" value={formData.address} onChange={handleChange} />
              <InputField label="City" name="city" value={formData.city} onChange={handleChange} />
              <InputField label="State" name="state" value={formData.state} onChange={handleChange} />
              <InputField label="ZIP / Postal Code" name="zipCode" value={formData.zipCode} onChange={handleChange} />

              {/* Timings */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Opening Time</label>
                <input 
                  type="time" name="openingTime" value={formData.openingTime} onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Closing Time</label>
                <input 
                  type="time" name="closingTime" value={formData.closingTime} onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                />
              </div>

              {/* Facilities / Services (Checkboxes) */}
              <div className="flex flex-col justify-center mt-2">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Pharmacy Services</label>
                <div className="flex items-center space-x-6">
                  <label className="flex items-center cursor-pointer">
                    <input 
                        type="checkbox" name="deliveryAvailable" 
                        checked={formData.deliveryAvailable} onChange={handleChange} 
                        className="w-5 h-5 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500" 
                    />
                    <span className="ml-2 text-gray-700 font-medium text-sm">Home Delivery</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input 
                        type="checkbox" name="open24x7" 
                        checked={formData.open24x7} onChange={handleChange} 
                        className="w-5 h-5 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500" 
                    />
                    <span className="ml-2 text-gray-700 font-medium text-sm">Open 24x7</span>
                  </label>
                </div>
              </div>
            </div>

            {/* --- Buttons Section --- */}
            <div className="mt-10 pt-6 border-t border-gray-100 flex flex-col sm:flex-row justify-end items-center gap-4">
              <button type="button" className="w-full sm:w-auto px-6 py-2.5 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg font-medium transition-colors">
                Change Password
              </button>
              <button type="submit" className="w-full sm:w-auto px-8 py-2.5 text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg font-medium shadow-md shadow-emerald-200 transition-all">
                Save Profile
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