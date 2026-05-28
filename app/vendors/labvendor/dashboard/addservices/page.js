'use client'
import React, { useState } from 'react'
import { 
  FaPlus, 
  FaRupeeSign,
  FaVial,
  FaTimes,
  FaUpload
} from 'react-icons/fa'

export default function AddServices() {
  
  // Modal State
  const[isModalOpen, setIsModalOpen] = useState(false);

  // Dummy Data for Services
  const[labServices, setLabServices] = useState([
    { 
      id: 1, 
      category: 'Disorders of Coagulation', 
      name: 'FACTOR VIII INHIBITOR', 
      image: 'https://placehold.co/100x100/f3f4f6/a8a29e?text=Test', 
      sickness: 'Fever',
      testTypes: ['walkInCheck', 'homeCollectionCheck'],
      price: 225,
      status: 'Approved'
    },
    { 
      id: 2, 
      category: 'Allergy , Parasitic Infections', 
      name: 'ABSOLUTE EOSINOPHIL COUNT; AEC', 
      image: 'https://placehold.co/100x100/f3f4f6/a8a29e?text=Test',
      sickness: 'Febeere',
      testTypes: ['walkInCheck', 'homeCollectionCheck'],
      price: 152,
      status: 'Approved'
    },
  ]);

  // Handle Form Submit (Dummy Function)
  const handleSubmit = (e) => {
    e.preventDefault();
    // Yahan API call aayegi data save karne ke liye
    console.log("Form Submitted!");
    setIsModalOpen(false); // Modal close karne ke liye
  };

  return (
    <div className="w-full">
      
      {/* ========================================= */}
      {/* HEADER SECTION WITH ADD BUTTON            */}
      {/* ========================================= */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Add Services</h1>
          <p className="text-gray-500 text-sm mt-1">Manage and add new lab tests or services to your catalog.</p>
        </div>

        {/* Add New Service Button (Modal Trigger) */}
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#08B36A] hover:bg-green-600 text-white font-semibold rounded-xl shadow-md shadow-green-200 transition-all hover:-translate-y-0.5"
        >
          <FaPlus />
          Add New
        </button>
      </div>

      {/* ========================================= */}
      {/* SERVICES CARDS GRID                       */}
      {/* ========================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {labServices.map((service) => (
          <div 
            key={service.id} 
            className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden flex flex-col"
          >
            {/* Top Area: Category Name */}
            <div className="pt-4 pb-2 text-center border-b border-gray-50">
              <span className="text-red-500 text-sm font-medium tracking-wide">
                {service.category}
              </span>
            </div>

            {/* Middle Area: Test Image & Name */}
            <div className="p-5 flex items-center gap-4">
              <div className="w-16 h-16 rounded-full border border-gray-200 overflow-hidden bg-gray-50 flex-shrink-0 flex items-center justify-center">
                <img src={service.image} alt="test" className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="text-[#08B36A] text-xs font-semibold uppercase tracking-wider">Name:</span>
                <h2 className="text-sm font-bold text-gray-800 leading-snug mt-0.5">
                  {service.name}
                </h2>
              </div>
            </div>

            <div className="px-5">
              <hr className="border-gray-100" />
            </div>

            {/* Sickness Details */}
            <div className="p-5 flex-1">
              <span className="text-[#08B36A] text-xs font-semibold uppercase tracking-wider">Type of sickness:</span>
              <p className="text-gray-600 text-sm mt-1 font-medium">{service.sickness}</p>
            </div>

            {/* Bottom Area: Info Box (Type, Price, Status) */}
            <div className="p-4 m-4 mt-0 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
              <div className="flex flex-col gap-1">
                <span className="text-[#08B36A] text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                   <FaVial className="text-sm"/> Test Type:
                </span>
                <span className="text-gray-700 text-sm font-medium">
                  {service.testTypes.join(' , ')}
                </span>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm">
                   <span className="text-[#08B36A] text-xs font-bold uppercase tracking-wider">Price:</span>
                   <span className="font-bold text-gray-800 bg-white px-2 py-0.5 rounded border border-gray-200 shadow-sm flex items-center">
                     <FaRupeeSign className="text-xs mr-0.5 text-gray-500"/> {service.price}
                   </span>
                </div>
                <span className="text-[#08B36A] font-bold text-sm">
                  {service.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ========================================= */}
      {/* ADD NEW SERVICE MODAL                     */}
      {/* ========================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800">Add New Service</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
              >
                <FaTimes size={18} />
              </button>
            </div>

            {/* Modal Body (Scrollable Form) */}
            <div className="p-6 overflow-y-auto">
              <form id="addServiceForm" onSubmit={handleSubmit} className="space-y-5">
                
                {/* 1. Category */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Category <span className="text-red-500">*</span></label>
                  <select className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-[#08B36A] text-gray-700 transition-all bg-white" required>
                    <option value="">Select a category</option>
                    <option value="coagulation">Disorders of Coagulation</option>
                    <option value="allergy">Allergy , Parasitic Infections</option>
                    <option value="infections">Infections</option>
                    <option value="porphyria">Porphyria</option>
                  </select>
                </div>

                {/* 2. Service/Test Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Test Name <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    placeholder="e.g. FACTOR VIII INHIBITOR" 
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-[#08B36A] text-gray-700 transition-all"
                    required 
                  />
                </div>

                {/* 3. Image Upload (Visual) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Service Icon/Image</label>
                  <div className="w-full border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-[#08B36A] transition-colors cursor-pointer">
                    <FaUpload className="text-2xl mb-2 text-gray-400" />
                    <span className="text-sm font-medium">Click to upload image</span>
                    <span className="text-xs text-gray-400 mt-1">SVG, PNG, JPG or GIF (MAX. 800x400px)</span>
                  </div>
                </div>

                {/* 4. Row for Sickness & Price */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Type of Sickness</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Fever" 
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-[#08B36A] text-gray-700 transition-all" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Price (₹) <span className="text-red-500">*</span></label>
                    <input 
                      type="number" 
                      placeholder="0.00" 
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-[#08B36A] text-gray-700 transition-all"
                      required 
                    />
                  </div>
                </div>

                {/* 5. Test Type (Checkboxes) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Available Test Types <span className="text-red-500">*</span></label>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 cursor-pointer bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 hover:border-[#08B36A]">
                      <input type="checkbox" className="w-4 h-4 text-[#08B36A] rounded focus:ring-[#08B36A]" value="walkInCheck" />
                      <span className="text-sm font-medium text-gray-700">Walk-In Check</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 hover:border-[#08B36A]">
                      <input type="checkbox" className="w-4 h-4 text-[#08B36A] rounded focus:ring-[#08B36A]" value="homeCollectionCheck" />
                      <span className="text-sm font-medium text-gray-700">Home Collection Check</span>
                    </label>
                  </div>
                </div>

              </form>
            </div>

            {/* Modal Footer (Action Buttons) */}
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-100 font-semibold transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                form="addServiceForm" // Link this button to the form above
                className="px-5 py-2.5 bg-[#08B36A] text-white rounded-xl hover:bg-green-600 font-semibold shadow-md shadow-green-200 transition-all hover:-translate-y-0.5"
              >
                Save Service
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}