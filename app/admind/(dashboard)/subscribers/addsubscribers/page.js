'use client';

import React, { useState } from 'react';
import { 
  FaUserPlus, FaStore, FaArrowLeft, FaEnvelope, 
  FaLock, FaPhoneAlt, FaUser, FaCheckCircle, FaBriefcase
} from 'react-icons/fa';

export default function AddVendorUser() {
  const [activeTab, setActiveTab] = useState('vendor'); // 'vendor' or 'user'
  const [gender, setGender] = useState('Male');
  const [category, setCategory] = useState('Nursing');

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* --- TOP NAVIGATION BAR --- */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-[#08B36A] p-3 rounded-2xl shadow-lg shadow-green-100 text-white">
                <FaUserPlus size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none uppercase">Account Creation</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">District Management Console</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setActiveTab('vendor')}
              className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'vendor' ? 'bg-[#08B36A] text-white shadow-lg shadow-green-100' : 'bg-white text-slate-400 border border-slate-200 hover:bg-slate-50'}`}
            >
              Add Vendor
            </button>
            <button 
              onClick={() => setActiveTab('user')}
              className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'user' ? 'bg-[#F2994A] text-white shadow-lg shadow-orange-100' : 'bg-white text-slate-400 border border-slate-200 hover:bg-slate-50'}`}
            >
              Add User
            </button>
            <button 
              onClick={() => window.history.back()}
              className="bg-white border border-slate-200 text-slate-400 hover:text-slate-600 px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-sm"
            >
              Go Back
            </button>
          </div>
        </div>

        {/* --- MAIN FORM CARD --- */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden relative">
          
          {/* Header Indicator */}
          <div className={`h-2 w-full ${activeTab === 'vendor' ? 'bg-[#08B36A]' : 'bg-[#F2994A]'}`}></div>
          
          <div className="p-10 md:p-16">
            <div className="mb-12">
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">
                    Register New {activeTab === 'vendor' ? 'Service Vendor' : 'Platform User'}
                </h2>
                <p className="text-slate-400 font-medium mt-2">Fill in the official credentials to authorize a new account in the system.</p>
            </div>

            <form className="space-y-10">
              
              {/* Row 1: Name & Mode Specific (Gender for Vendor) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Identity Name</label>
                    <div className="relative">
                        <FaUser className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                        <input type="text" placeholder="e.g. Karan Sharma" className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#08B36A]/20 transition-all font-bold text-slate-700" />
                    </div>
                </div>

                {activeTab === 'vendor' && (
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Gender Preference</label>
                        <div className="flex gap-2 p-1 bg-slate-50 rounded-2xl border border-slate-100">
                            {['Male', 'Female', 'Other'].map((item) => (
                                <button
                                    key={item}
                                    type="button"
                                    onClick={() => setGender(item)}
                                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${gender === item ? 'bg-white text-[#08B36A] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    {item}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
              </div>

              {/* Row 2: Service Category (Only for Vendor) */}
              {activeTab === 'vendor' && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Service Category</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {['Nursing', 'Lab', 'Pharmacy', 'Doctor'].map((item) => (
                              <button
                                  key={item}
                                  type="button"
                                  onClick={() => setCategory(item)}
                                  className={`py-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${category === item ? 'border-[#08B36A] bg-green-50 text-[#08B36A] shadow-inner' : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'}`}
                              >
                                  <FaBriefcase />
                                  <span className="text-[9px] font-black uppercase tracking-tighter">{item}</span>
                              </button>
                          ))}
                      </div>
                  </div>
              )}

              {/* Row 3: Phone & Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Primary Phone</label>
                    <div className="relative">
                        <FaPhoneAlt className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                        <input type="tel" placeholder="+91 XXXX-XXXXXX" className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#08B36A]/20 transition-all font-bold text-slate-700" />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Official Email</label>
                    <div className="relative">
                        <FaEnvelope className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                        <input type="email" placeholder="admin@healthcare.com" className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#08B36A]/20 transition-all font-bold text-slate-700" />
                    </div>
                </div>
              </div>

              {/* Row 4: Password */}
              <div className="space-y-2 max-w-md">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Secure Password</label>
                  <div className="relative">
                      <FaLock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                      <input type="password" placeholder="••••••••" className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#08B36A]/20 transition-all font-bold text-slate-700" />
                  </div>
              </div>

              {/* --- ACTION BUTTONS --- */}
              <div className="pt-8 border-t border-slate-50 flex justify-center">
                <button 
                  type="submit" 
                  className={`w-full md:w-80 py-5 rounded-3xl font-black uppercase text-xs tracking-[0.2em] shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 ${activeTab === 'vendor' ? 'bg-[#08B36A] text-white shadow-green-100' : 'bg-[#F2994A] text-white shadow-orange-100'}`}
                >
                  <FaCheckCircle size={18} /> Submit {activeTab} Details
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}