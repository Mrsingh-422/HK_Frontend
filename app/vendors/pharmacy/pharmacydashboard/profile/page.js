"use client";
import React, { useState } from "react";
import {
  FaStore, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt,
  FaIdCard, FaClock, FaTruck, FaCheckCircle, FaEdit,
  FaTimes, FaSave, FaCamera, FaGlobe
} from "react-icons/fa";

export default function PharmacyProfilePage() {
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
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
    openingTime: "08:00",
    closingTime: "22:00",
    deliveryAvailable: true,
    open24x7: false,
    image: null
  });

  const [tempData, setTempData] = useState({ ...formData });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTempData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setFormData({ ...tempData });
    setIsEditing(false);
    alert("Profile updated successfully!");
  };

  const handleCancel = () => {
    setTempData({ ...formData });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 animate-in fade-in duration-500">
      <div className="max-w-5xl mx-auto">

        {/* --- HEADER CARD --- */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="bg-emerald-600 h-32 md:h-40 relative">
            {/* Decorative Background Pattern */}
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          </div>
          <div className="px-8 pb-8 flex flex-col md:flex-row items-end -mt-12 md:-mt-16 gap-6 relative z-10">
            <div className="relative group">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl border-4 border-white bg-white overflow-hidden shadow-xl flex items-center justify-center text-emerald-500">
                <img
                  src="https://images.unsplash.com/photo-1586015555751-63bb77f4322a?q=80&w=1000&auto=format&fit=crop"
                  alt="Pharmacy Storefront"
                  className="w-full h-full object-cover"
                />
              </div>
              {isEditing && (
                <label className="absolute bottom-2 right-2 p-3 bg-emerald-500 text-white rounded-2xl shadow-lg cursor-pointer hover:bg-emerald-600 transition-all">
                  <FaCamera size={18} />
                  <input type="file" className="hidden" />
                </label>
              )}
            </div>

            <div className="flex-1 mb-2">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">{formData.pharmacyName}</h1>
                  <p className="text-gray-500 flex items-center gap-2 mt-1">
                    <FaMapMarkerAlt className="text-emerald-500" /> {formData.city}, {formData.country}
                  </p>
                </div>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-2xl font-bold text-sm hover:bg-emerald-600 transition-all shadow-md shadow-emerald-100"
                  >
                    <FaEdit /> Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {isEditing ? (
          /* --- EDIT MODE --- */
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><FaEdit size={16} /></div>
                Update Pharmacy Information
              </h2>
              <button onClick={handleCancel} className="text-gray-400 hover:text-red-500 transition-colors"><FaTimes size={20} /></button>
            </div>

            <form onSubmit={handleSave} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <InputField label="Pharmacy Name" name="pharmacyName" value={tempData.pharmacyName} onChange={handleChange} icon={<FaStore />} />
                <InputField label="Pharmacist In-Charge" name="ownerName" value={tempData.ownerName} onChange={handleChange} icon={<FaUser />} />
                <InputField label="Email Address" name="email" type="email" value={tempData.email} onChange={handleChange} icon={<FaEnvelope />} />
                <InputField label="Phone Number" name="phone" value={tempData.phone} onChange={handleChange} icon={<FaPhone />} />
                <InputField label="Drug License No." name="licenseNumber" value={tempData.licenseNumber} onChange={handleChange} icon={<FaIdCard />} />
                <InputField label="GST Registration" name="gstNumber" value={tempData.gstNumber} onChange={handleChange} icon={<FaGlobe />} />
                <InputField label="Street Address" name="address" value={tempData.address} onChange={handleChange} icon={<FaMapMarkerAlt />} />
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="City" name="city" value={tempData.city} onChange={handleChange} />
                  <InputField label="ZIP" name="zipCode" value={tempData.zipCode} onChange={handleChange} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Opens At</label>
                    <input type="time" name="openingTime" value={tempData.openingTime} onChange={handleChange} className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Closes At</label>
                    <input type="time" name="closingTime" value={tempData.closingTime} onChange={handleChange} className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 ml-1">Service Settings</label>
                  <div className="space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input type="checkbox" name="deliveryAvailable" checked={tempData.deliveryAvailable} onChange={handleChange} className="w-5 h-5 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500" />
                      <span className="text-sm font-bold text-gray-700 group-hover:text-emerald-600 transition-colors">Enable Home Delivery</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input type="checkbox" name="open24x7" checked={tempData.open24x7} onChange={handleChange} className="w-5 h-5 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500" />
                      <span className="text-sm font-bold text-gray-700 group-hover:text-emerald-600 transition-colors">Open 24 Hours / 7 Days</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-100">
                <button type="button" onClick={handleCancel} className="px-8 py-3.5 text-gray-500 font-bold text-sm hover:text-gray-700 transition-all">Cancel</button>
                <button type="submit" className="flex items-center gap-2 px-10 py-3.5 bg-emerald-500 text-white rounded-2xl font-bold text-sm hover:bg-emerald-600 shadow-lg shadow-emerald-100 transition-all">
                  <FaSave /> Save Changes
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* --- VIEW MODE --- */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">

            {/* Main Info */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <FaStore className="text-emerald-500" /> Store Overview
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <ViewField label="Pharmacist In-Charge" value={formData.ownerName} icon={<FaUser />} />
                  <ViewField label="Contact Number" value={formData.phone} icon={<FaPhone />} />
                  <ViewField label="Email Address" value={formData.email} icon={<FaEnvelope />} />
                  <ViewField label="Drug License No." value={formData.licenseNumber} icon={<FaIdCard />} />
                  <ViewField label="Address" value={`${formData.address}, ${formData.city}, ${formData.zipCode}`} icon={<FaMapMarkerAlt />} />
                  <ViewField label="Business GST" value={formData.gstNumber} icon={<FaGlobe />} />
                </div>
              </div>
            </div>

            {/* Sidebar Info */}
            <div className="space-y-6">
              {/* Status Card */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Operating Status</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <div className="flex items-center gap-3">
                      <FaClock className="text-emerald-600" />
                      <span className="text-sm font-bold text-emerald-800">Timing</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-700">{formData.open24x7 ? "Open 24/7" : `${formData.openingTime} - ${formData.closingTime}`}</span>
                  </div>

                  {formData.deliveryAvailable && (
                    <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                      <FaTruck className="text-blue-600" />
                      <span className="text-sm font-bold text-blue-800">Home Delivery Available</span>
                    </div>
                  )}

                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <FaCheckCircle className="text-emerald-500" />
                    <span className="text-sm font-bold text-gray-700">Verified Pharmacy</span>
                  </div>
                </div>
              </div>

              {/* Password / Quick Actions */}
              <button className="w-full p-4 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all">
                Change Security Password
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

const InputField = ({ label, name, type = "text", value, onChange, icon }) => (
  <div>
    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">{label}</label>
    <div className="relative group">
      {icon && <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors">{icon}</div>}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full ${icon ? 'pl-12' : 'px-5'} pr-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all`}
      />
    </div>
  </div>
);

const ViewField = ({ label, value, icon }) => (
  <div className="flex items-start gap-4">
    <div className="mt-1 p-2 bg-gray-50 text-emerald-600 rounded-lg">{icon}</div>
    <div>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">{label}</p>
      <p className="text-sm font-bold text-gray-800 leading-relaxed">{value}</p>
    </div>
  </div>
);