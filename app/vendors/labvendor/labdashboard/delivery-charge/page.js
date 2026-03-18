'use client'
import React, { useState } from 'react'
import { FaPlus, FaTimes, FaTruck } from 'react-icons/fa'

export default function ManageDeliveryCharges() {
  
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ==========================================
  // EXACT DATA FROM THE IMAGE
  // ==========================================
  const [deliveryCharges, setDeliveryCharges] = useState([
    { 
      id: 1, 
      fixedPrice: 10, 
      distance: 2, 
      perKmPrice: 10, 
      status: 'Active' 
    },
    { 
      id: 2, 
      fixedPrice: 20, 
      distance: 10, 
      perKmPrice: 10, 
      status: 'InActive' 
    },
    { 
      id: 3, 
      fixedPrice: 20, 
      distance: 20, 
      perKmPrice: 5, 
      status: 'InActive' 
    },
  ]);

  // Form Submit Handler (Dummy)
  const handleSubmit = (e) => {
    e.preventDefault();
    alert("New Delivery Charge Added Successfully!");
    setIsModalOpen(false);
  };

  return (
    <div className="w-full relative p-4 md:p-8 bg-gray-50/50 min-h-screen">
      
      {/* ========================================= */}
      {/* HEADER SECTION                            */}
      {/* ========================================= */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4 max-w-6xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-[#1e3a8a] flex items-center gap-3">
          <FaTruck className="text-[#08B36A] hidden sm:block"/> Manage Delivery Charges
        </h1>
        
        {/* Add Button */}
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#08B36A] hover:bg-green-600 text-white text-sm font-bold rounded-full shadow-md shadow-green-200 transition-transform hover:-translate-y-0.5"
        >
          Add <FaPlus size={12} />
        </button>
      </div>

      {/* ========================================= */}
      {/* DELIVERY CHARGES CARDS GRID               */}
      {/* ========================================= */}
      <div className="flex flex-wrap justify-center sm:justify-start gap-6 max-w-6xl mx-auto">
        {deliveryCharges.map((charge) => (
          <div 
            key={charge.id} 
            className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col w-full sm:w-[320px] relative overflow-hidden"
          >
            {/* Top Status Border Indicator */}
            <div className={`absolute top-0 left-0 w-full h-1 ${
                charge.status === 'Active' ? 'bg-green-500' : 'bg-gray-400'
            }`}></div>

            {/* Content list exactly matching your image */}
            <div className="flex flex-col gap-2 mb-6 mt-2 text-[15px] font-medium text-gray-800">
              <p>Fixed Price :- {charge.fixedPrice}</p>
              <p>Distance :- {charge.distance}</p>
              <p>Per /km price :- {charge.perKmPrice}</p>
              <p>
                Status :-{' '}
                <span className={charge.status === 'Active' ? 'text-green-600 font-bold' : 'text-gray-500 font-bold'}>
                  {charge.status}
                </span>
              </p>
            </div>

            {/* Action Buttons Container */}
            <div className="flex justify-center items-center gap-3 mt-auto">
              <button className="px-5 py-1.5 bg-[#ef4444] hover:bg-red-600 text-white text-sm font-bold rounded transition-colors shadow-sm">
                Delete
              </button>
              <button className="px-5 py-1.5 bg-[#08B36A] hover:bg-green-600 text-white text-sm font-bold rounded transition-colors shadow-sm">
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ========================================= */}
      {/* 🌟 ADD NEW CHARGE MODAL (2-COLUMN GRID) 🌟*/}
      {/* ========================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>

          {/* Modal Container */}
          <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 sticky top-0 z-10">
              <h2 className="text-xl font-bold text-[#1e3a8a]">Add Delivery Charge</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                <FaTimes size={18} />
              </button>
            </div>

            {/* Modal Body (Form) */}
            <div className="p-6 overflow-y-auto">
              <form id="addChargeForm" onSubmit={handleSubmit} className="space-y-6">
                
                {/* 🌟 2-COLUMN GRID STARTS HERE 🌟 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  
                  {/* Row 1 */}
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-1.5">Fixed Price (₹) <span className="text-red-500">*</span></label>
                    <input type="number" placeholder="e.g. 20" className="w-full px-4 py-2.5 bg-white rounded-xl border border-gray-300 focus:border-[#08B36A] focus:ring-1 focus:ring-[#08B36A] outline-none transition-all text-sm" required />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-1.5">Distance (km) <span className="text-red-500">*</span></label>
                    <input type="number" placeholder="e.g. 10" className="w-full px-4 py-2.5 bg-white rounded-xl border border-gray-300 focus:border-[#08B36A] focus:ring-1 focus:ring-[#08B36A] outline-none transition-all text-sm" required />
                  </div>

                  {/* Row 2 */}
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-1.5">Per /km Price (₹) <span className="text-red-500">*</span></label>
                    <input type="number" placeholder="e.g. 5" className="w-full px-4 py-2.5 bg-white rounded-xl border border-gray-300 focus:border-[#08B36A] focus:ring-1 focus:ring-[#08B36A] outline-none transition-all text-sm" required />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-1.5">Status <span className="text-red-500">*</span></label>
                    <select className="w-full px-4 py-2.5 bg-white rounded-xl border border-gray-300 focus:border-[#08B36A] focus:ring-1 focus:ring-[#08B36A] outline-none transition-all text-sm text-gray-700" required>
                      <option value="Active">Active</option>
                      <option value="InActive">InActive</option>
                    </select>
                  </div>

                </div>
                {/* 🌟 2-COLUMN GRID ENDS HERE 🌟 */}
              </form>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-colors">
                Cancel
              </button>
              <button type="submit" form="addChargeForm" className="px-8 py-2.5 bg-[#08B36A] hover:bg-green-600 text-white font-bold rounded-xl shadow-md shadow-green-200 transition-all hover:-translate-y-0.5">
                Save
              </button>
            </div>
            
          </div>
        </div>
      )}

    </div>
  )
}