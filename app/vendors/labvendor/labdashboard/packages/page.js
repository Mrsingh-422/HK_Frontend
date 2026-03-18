'use client'
import React, { useState } from 'react'
import { 
  FaPlus, FaTimes, FaTrash, FaUpload, FaBoxOpen, FaRupeeSign, FaListUl
} from 'react-icons/fa'

export default function MyPackagesPage() {
  
  const [activeTab, setActiveTab] = useState('Approved');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ==========================================
  // DUMMY DATA FOR PACKAGES
  // ==========================================
  const [packages, setPackages] = useState([
    { 
      id: 1, 
      name: 'Full Body Checkup', 
      price: 2999, 
      status: 'Approved', 
      image: 'https://placehold.co/100x100/e2e8f0/64748b?text=Body+Test' 
    },
    { 
      id: 2, 
      name: 'Fever Profile', 
      price: 5695, 
      status: 'Pending', 
      image: 'https://placehold.co/100x100/fef08a/ca8a04?text=Fever' 
    },
    { 
      id: 3, 
      name: 'Diabetes Care', 
      price: 19050, 
      status: 'Rejected', 
      image: 'https://placehold.co/100x100/fecaca/dc2626?text=IMPORTANT' // Like in your image
    },
  ]);

  // Filter packages based on active tab
  const filteredPackages = packages.filter(pkg => pkg.status === activeTab);

  // Form Submit Handler (Dummy)
  const handleSubmit = (e) => {
    e.preventDefault();
    alert("New Package Added Successfully!");
    setIsModalOpen(false);
  };

  return (
    <div className="w-full relative">
      
      {/* ========================================= */}
      {/* HEADER & TABS SECTION                     */}
      {/* ========================================= */}
      <div className="flex flex-col items-center mb-10 gap-6">
        <h1 className="text-3xl font-bold text-[#1e3a8a] flex items-center gap-3">
          <FaBoxOpen className="text-[#08B36A]"/> My Package
        </h1>
        
        {/* Tabs & Add Button Wrapper */}
        <div className="flex flex-col md:flex-row items-center gap-6 w-full justify-center relative">
          
          {/* Tabs */}
          <div className="flex flex-wrap justify-center gap-3">
            {['Approved', 'Pending', 'Rejected'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 border ${
                  activeTab === tab 
                    ? 'bg-[#08B36A] text-white border-[#08B36A] shadow-md shadow-green-200' 
                    : 'bg-white text-gray-600 border-gray-300 hover:border-[#08B36A] hover:text-[#08B36A]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Add New Button (Desktop me right side, Mobile me center) */}
          <button 
            onClick={() => setIsModalOpen(true)}
            className="md:absolute md:right-0 flex items-center gap-2 px-6 py-2.5 bg-[#08B36A] hover:bg-green-600 text-white text-sm font-bold rounded-full shadow-md shadow-green-200 transition-transform hover:-translate-y-0.5"
          >
            Add New <FaPlus />
          </button>
        </div>
      </div>

      {/* ========================================= */}
      {/* PACKAGE CARDS GRID                        */}
      {/* ========================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredPackages.map((pkg) => (
          <div key={pkg.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col group relative overflow-hidden">
            
            {/* Top Status Border Indicator */}
            <div className={`absolute top-0 left-0 w-full h-1 ${
                pkg.status === 'Approved' ? 'bg-green-500' : 
                pkg.status === 'Rejected' ? 'bg-red-500' : 'bg-yellow-500'
            }`}></div>

            {/* Package Name */}
            <h3 className="text-center font-bold text-gray-800 text-lg mb-4">{pkg.name}</h3>
            
            {/* Image & Test List Link */}
            <div className="flex flex-col items-start gap-3 mb-4">
              <div className="w-24 h-24 rounded-lg overflow-hidden border border-gray-100 shadow-sm">
                <img src={pkg.image} alt={pkg.name} className="w-full h-full object-cover" />
              </div>
              <button className="text-[#08B36A] hover:text-green-700 text-sm font-bold flex items-center gap-1.5 transition-colors">
                <FaListUl /> Test List
              </button>
            </div>

            <hr className="border-gray-100 mb-4" />

            {/* Price & Status Row */}
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm font-bold text-gray-700 flex items-center gap-1">
                Price: <span className="text-lg text-gray-900 flex items-center"><FaRupeeSign className="text-sm"/> {pkg.price}</span>
              </div>
              <span className={`text-sm font-bold ${
                pkg.status === 'Approved' ? 'text-green-600' : 
                pkg.status === 'Rejected' ? 'text-red-600' : 'text-yellow-600'
              }`}>
                {pkg.status}
              </span>
            </div>

            {/* Delete Button (Visible for Pending/Rejected as per your image) */}
            {(pkg.status === 'Pending' || pkg.status === 'Rejected') && (
              <button className="mt-auto w-max mx-auto px-5 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded transition-colors shadow-sm">
                Delete
              </button>
            )}
          </div>
        ))}

        {/* Empty State */}
        {filteredPackages.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <FaBoxOpen className="text-4xl text-gray-300 mx-auto mb-3" />
            <p className="font-medium">No {activeTab.toLowerCase()} packages found.</p>
          </div>
        )}
      </div>

      {/* ========================================= */}
      {/* 🌟 ADD NEW PACKAGE MODAL (2-COLUMN GRID)🌟*/}
      {/* ========================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>

          {/* Modal Container */}
          <div className="relative bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 sticky top-0 z-10">
              <h2 className="text-xl font-bold text-[#1e3a8a]">Add More Services</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                <FaTimes size={18} />
              </button>
            </div>

            {/* Modal Body (Form) */}
            <div className="p-6 overflow-y-auto">
              <form id="addPackageForm" onSubmit={handleSubmit} className="space-y-6">
                
                {/* 🌟 2-COLUMN GRID STARTS HERE 🌟 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  
                  {/* Row 1 */}
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-1.5">Package Name <span className="text-red-500">*</span></label>
                    <select className="w-full px-4 py-2.5 bg-white rounded-xl border border-gray-300 focus:border-[#08B36A] focus:ring-1 focus:ring-[#08B36A] outline-none transition-all text-sm text-gray-700" required>
                      <option value="">Select package</option>
                      <option value="diabetes">Diabetes Care</option>
                      <option value="fever">Fever Profile</option>
                      <option value="fullbody">Full Body Checkup</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-1.5">Price (₹) <span className="text-red-500">*</span></label>
                    <input type="number" placeholder="Enter price" className="w-full px-4 py-2.5 bg-white rounded-xl border border-gray-300 focus:border-[#08B36A] focus:ring-1 focus:ring-[#08B36A] outline-none transition-all text-sm" required />
                  </div>

                  {/* Row 2 */}
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-1.5">Package Description</label>
                    <textarea rows="2" placeholder="Brief description..." className="w-full px-4 py-2.5 bg-white rounded-xl border border-gray-300 focus:border-[#08B36A] focus:ring-1 focus:ring-[#08B36A] outline-none transition-all text-sm resize-none"></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-1.5">Over View</label>
                    <textarea rows="2" placeholder="Package overview..." className="w-full px-4 py-2.5 bg-white rounded-xl border border-gray-300 focus:border-[#08B36A] focus:ring-1 focus:ring-[#08B36A] outline-none transition-all text-sm resize-none"></textarea>
                  </div>

                  {/* Row 3 */}
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-1.5">Precaution</label>
                    <input type="text" placeholder="Any precautions? (e.g. Fasting required)" className="w-full px-4 py-2.5 bg-white rounded-xl border border-gray-300 focus:border-[#08B36A] focus:ring-1 focus:ring-[#08B36A] outline-none transition-all text-sm" />
                  </div>
                  
                  {/* Checkboxes in same grid row */}
                  <div className="flex flex-col justify-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
                    <label className="block text-sm font-bold text-gray-800">Collection Type <span className="text-red-500">*</span></label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
                        <input type="checkbox" className="w-4 h-4 text-[#08B36A] rounded focus:ring-[#08B36A]" defaultChecked /> Walk In
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
                        <input type="checkbox" className="w-4 h-4 text-[#08B36A] rounded focus:ring-[#08B36A]" /> Home Collection
                      </label>
                    </div>
                  </div>

                </div>
                {/* 🌟 2-COLUMN GRID ENDS HERE 🌟 */}

                {/* Full Width Row for Image Upload */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-1.5">Add Photo</label>
                  <div className="w-full border-2 border-dashed border-[#08B36A]/50 bg-green-50/50 hover:bg-green-50 rounded-xl p-8 flex flex-col items-center justify-center text-[#08B36A] transition-colors cursor-pointer">
                    <FaUpload className="text-3xl mb-3 opacity-80" />
                    <span className="text-sm font-bold">Click to upload or drag & drop</span>
                    <span className="text-xs text-gray-500 mt-1">SVG, PNG, JPG (MAX. 800x400px)</span>
                  </div>
                </div>

              </form>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-colors">
                Cancel
              </button>
              <button type="submit" form="addPackageForm" className="px-8 py-2.5 bg-[#08B36A] hover:bg-green-600 text-white font-bold rounded-xl shadow-md shadow-green-200 transition-all hover:-translate-y-0.5">
                Submit
              </button>
            </div>
            
          </div>
        </div>
      )}

    </div>
  )
}