'use client'
import React, { useState } from 'react'
import { 
  FaMapMarkerAlt, FaRegStar, FaUpload, FaGlobe, 
  FaPhoneAlt, FaEnvelope, FaMapPin 
} from 'react-icons/fa'

export default function EditProfilePage() {
  
  const[formData, setFormData] = useState({
    name: 'HkLab',
    email: 'hklab321@yopmail.com',
    gender: '',
    about: '',
    phone: '9855284348',
    address: 'Vaishali nagar',
    country: 'India',
    state: 'Rajasthan',
    city: 'Jaipur'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = (e) => {
    e.preventDefault();
    alert("Profile Updated Successfully!");
  };

  return (
    <div className="w-full min-h-screen bg-gray-50/50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* ========================================= */}
        {/* HEADER SECTION (Profile Info)             */}
        {/* ========================================= */}
        <div className="p-6 md:p-8 border-b border-gray-100 flex flex-col md:flex-row gap-6 md:gap-8 items-start">
          {/* Profile Image */}
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-xl overflow-hidden border-4 border-white shadow-lg shrink-0 bg-orange-100">
            <img 
              src="https://placehold.co/400x400/ea580c/ffffff?text=Profile+Image" 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          </div>

          {/* Profile Details */}
          <div className="flex-1 w-full">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-[#1e3a8a]">Vaishali nagar</h1>
              <span className="flex items-center text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-full gap-1">
                <FaMapMarkerAlt className="text-[#08B36A]"/> location
              </span>
            </div>
            <p className="text-sm font-medium text-gray-500 mb-2">About Speciality</p>
            
            {/* Rating */}
            <div className="flex items-center gap-2 mb-4 text-sm font-bold text-gray-600">
              Rating 0 
              <div className="flex text-gray-300">
                <FaRegStar /><FaRegStar /><FaRegStar /><FaRegStar /><FaRegStar />
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-400 w-20">Site:</span>
                <a href="#" className="text-[#08B36A] hover:underline font-medium truncate">https://healthkangaroo.com/</a>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 w-20">Phone No:</span>
                <span className="text-[#08B36A] font-medium">9855284348</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 w-20">Email:</span>
                <span className="text-[#08B36A] font-medium truncate">hklab321@yopmail.com</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 w-20">Address:</span>
                <span className="text-[#08B36A] font-medium">Vaishali nagar</span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================= */}
        {/* EDIT PROFILE FORM SECTION                 */}
        {/* ========================================= */}
        <div className="p-6 md:p-8">
          <h2 className="text-xl font-bold text-[#08B36A] mb-6 border-b-2 border-green-100 inline-block pb-1">Edit Your Profile</h2>

          <form onSubmit={handleSave} className="space-y-6">
            
            {/* 🌟 2-COLUMN GRID FOR INPUTS 🌟 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              
              {/* Row 1 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} 
                  className="w-full px-4 py-2.5 bg-white rounded-lg border border-gray-300 focus:border-[#08B36A] focus:ring-1 focus:ring-[#08B36A] outline-none transition-all text-sm font-medium text-gray-800" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} 
                  className="w-full px-4 py-2.5 bg-white rounded-lg border border-gray-300 focus:border-[#08B36A] focus:ring-1 focus:ring-[#08B36A] outline-none transition-all text-sm font-medium text-gray-800" />
              </div>

              {/* Row 2 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} 
                  className="w-full px-4 py-2.5 bg-white rounded-lg border border-gray-300 focus:border-[#08B36A] focus:ring-1 focus:ring-[#08B36A] outline-none transition-all text-sm font-medium text-gray-800 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%234b5563%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px_12px] bg-[position:right_1rem_center] bg-no-repeat cursor-pointer">
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">About</label>
                <input type="text" name="about" value={formData.about} onChange={handleChange} 
                  className="w-full px-4 py-2.5 bg-white rounded-lg border border-gray-300 focus:border-[#08B36A] focus:ring-1 focus:ring-[#08B36A] outline-none transition-all text-sm font-medium text-gray-800" />
              </div>

              {/* Row 3 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} 
                  className="w-full px-4 py-2.5 bg-gray-50/80 rounded-lg border border-gray-300 focus:border-[#08B36A] focus:ring-1 focus:ring-[#08B36A] outline-none transition-all text-sm font-medium text-gray-800" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Address</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} 
                  className="w-full px-4 py-2.5 bg-white rounded-lg border border-gray-300 focus:border-[#08B36A] focus:ring-1 focus:ring-[#08B36A] outline-none transition-all text-sm font-medium text-gray-800" />
              </div>

              {/* Row 4 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Country</label>
                <select name="country" value={formData.country} onChange={handleChange} 
                  className="w-full px-4 py-2.5 bg-white rounded-lg border border-gray-300 focus:border-[#08B36A] focus:ring-1 focus:ring-[#08B36A] outline-none transition-all text-sm font-medium text-gray-800 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%234b5563%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px_12px] bg-[position:right_1rem_center] bg-no-repeat cursor-pointer">
                  <option value="India">India</option>
                  <option value="USA">USA</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">State</label>
                <select name="state" value={formData.state} onChange={handleChange} 
                  className="w-full px-4 py-2.5 bg-white rounded-lg border border-gray-300 focus:border-[#08B36A] focus:ring-1 focus:ring-[#08B36A] outline-none transition-all text-sm font-medium text-gray-800 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%234b5563%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px_12px] bg-[position:right_1rem_center] bg-no-repeat cursor-pointer">
                  <option value="Rajasthan">Rajasthan</option>
                  <option value="Gujarat">Gujarat</option>
                </select>
              </div>

              {/* Row 5 (City alone) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">City</label>
                <select name="city" value={formData.city} onChange={handleChange} 
                  className="w-full px-4 py-2.5 bg-white rounded-lg border border-gray-300 focus:border-[#08B36A] focus:ring-1 focus:ring-[#08B36A] outline-none transition-all text-sm font-medium text-gray-800 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%234b5563%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px_12px] bg-[position:right_1rem_center] bg-no-repeat cursor-pointer">
                  <option value="Jaipur">Jaipur</option>
                  <option value="Jodhpur">Jodhpur</option>
                </select>
              </div>

            </div>
            {/* END OF 2-COLUMN GRID */}

            {/* File Upload Box (Spans full width outside the grid or col-span-2) */}
            <div className="pt-2">
              <label className="block text-sm font-semibold text-gray-800 mb-2">Upload Your New Profile</label>
              <label className="w-full md:w-1/2 h-36 border-2 border-dashed border-[#08B36A] bg-green-50/30 hover:bg-green-50/60 rounded-xl flex flex-col items-center justify-center text-[#08B36A] font-bold text-sm cursor-pointer transition-colors group">
                <FaUpload className="text-2xl mb-2 opacity-80 group-hover:scale-110 transition-transform" />
                Upload profile
                <input type="file" className="hidden" accept="image/*" />
              </label>
            </div>

            {/* ========================================= */}
            {/* ACTION BUTTONS                            */}
            {/* ========================================= */}
            <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 mt-4 border-t border-gray-100">
              <button 
                type="button" 
                className="px-6 py-2.5 bg-white border-2 border-[#08B36A] text-[#08B36A] font-bold rounded-lg hover:bg-green-50 transition-colors text-sm"
              >
                Change Password
              </button>
              <button 
                type="submit" 
                className="px-8 py-2.5 bg-white border-2 border-[#08B36A] text-[#08B36A] font-bold rounded-lg hover:bg-[#08B36A] hover:text-white transition-all text-sm"
              >
                Save Changes
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  )
}