'use client'

import React, { useState } from 'react'
import {FaInfoCircle, FaStethoscope } from "react-icons/fa"

const AddNurseType = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Saving Nurse Type:", formData)
    // Add your API logic here
    alert(`Success: ${formData.title} has been added.`)
  }

  return (
    <div className="min-h-screen bg-gray-50/30 p-4 md:p-8">
      <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="bg-white p-8 md:p-14 rounded-[3rem] border border-gray-100 shadow-2xl shadow-gray-200/40">

          <form onSubmit={handleSubmit} className="space-y-10">
            
            {/* TITLE FIELD */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  Designation Title
                </label>
                <span className="text-[10px] font-bold text-[#08B36A] bg-[#08B36A]/5 px-2 py-0.5 rounded">Required</span>
              </div>
              <div className="relative">
                <FaStethoscope className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" />
                <input 
                  type="text" 
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g. Registered Nurse (RN)"
                  className="w-full pl-14 pr-6 py-5 bg-gray-50 border-2 border-transparent rounded-[1.5rem] outline-none focus:border-[#08B36A]/20 focus:bg-white transition-all text-sm font-bold text-gray-700 placeholder:text-gray-300 shadow-sm"
                />
              </div>
            </div>

            {/* DESCRIPTION FIELD */}
            <div className="space-y-3">
              <label className="block px-1 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                Scope of Work & Responsibilities
              </label>
              <textarea 
                rows="6"
                required
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Describe the clinical requirements, shift expectations, and necessary qualifications for this role..."
                className="w-full p-6 bg-gray-50 border-2 border-transparent rounded-[1.5rem] outline-none focus:border-[#08B36A]/20 focus:bg-white transition-all text-sm font-bold text-gray-700 placeholder:text-gray-300 shadow-sm resize-none"
              />
            </div>

            {/* INFORMATION BANNER */}
            <div className="flex gap-4 p-5 bg-emerald-50/50 rounded-2xl border border-[#08B36A]/10">
               <FaInfoCircle className="text-[#08B36A] mt-0.5 shrink-0" size={16}/>
               <p className="text-[11px] text-emerald-900 font-semibold leading-relaxed">
                 Adding this type will allow hospital administrators to post shifts specifically for this category. Please ensure the title is concise and follows standard clinical terminology.
               </p>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
                type="submit"
                className="flex-[2] bg-[#08B36A] text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-[#079d5c] hover:shadow-lg hover:shadow-[#08B36A]/20 transition-all active:scale-[0.98]"
              >
                Save Designation
              </button>
              <button 
                type="button"
                onClick={() => setFormData({ title: '', description: '' })}
                className="flex-1 bg-gray-100 text-gray-500 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-gray-200 transition-all"
              >
                Discard
              </button>
            </div>

          </form>
        </div>

        {/* FOOTER */}
        <p className="text-center mt-10 text-[10px] font-black text-gray-300 uppercase tracking-[0.4em]">
          Personnel Management System v1.0
        </p>
      </div>
    </div>
  )
}

export default AddNurseType