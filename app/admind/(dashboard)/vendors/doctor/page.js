'use client'

import React, { useState } from 'react'
import { FaUserMd, FaStethoscope, FaGraduationCap, FaChevronRight } from "react-icons/fa"
import ManageDoctors from './components/ManageDoctors'
import ManageSpecialists from './components/ManageSpecialists'
import ManageQualifications from './components/ManageQualifications' // Import the new component

export default function DoctorSpecialistManagement() {
    // State now handles 'doctors', 'specialists', or 'qualifications'
    const [activeTab, setActiveTab] = useState('doctors')

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-6 font-sans text-slate-900">
            <div className="max-w-[1400px] mx-auto">
                {/* --- HEADER & NAVTAB SECTION --- */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-4">
                    {/* --- PREMIUM NAV TABS --- */}
                    <div className="inline-flex bg-white p-1.5 rounded-[1.5rem] shadow-sm shadow-slate-200/50 border border-slate-100 flex-wrap">
                        <button
                            onClick={() => setActiveTab('doctors')}
                            className={`flex items-center gap-3 px-8 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'doctors'
                                    ? 'bg-[#08B36A] text-white shadow-lg shadow-green-100'
                                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            <FaUserMd size={16} /> Manage Doctors
                        </button>

                        <button
                            onClick={() => setActiveTab('specialists')}
                            className={`flex items-center gap-3 px-8 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'specialists'
                                    ? 'bg-[#08B36A] text-white shadow-lg shadow-green-100'
                                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            <FaStethoscope size={16} /> Manage Specialists
                        </button>

                        {/* --- NEW TAB: MANAGE QUALIFICATIONS --- */}
                        <button
                            onClick={() => setActiveTab('qualifications')}
                            className={`flex items-center gap-3 px-8 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'qualifications'
                                    ? 'bg-[#08B36A] text-white shadow-lg shadow-green-100'
                                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            <FaGraduationCap size={16} /> Manage Qualifications
                        </button>
                    </div>
                </div>

                {/* --- DYNAMIC COMPONENT RENDERING --- */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {activeTab === 'doctors' && <ManageDoctors />}
                    {activeTab === 'specialists' && <ManageSpecialists />}
                    {activeTab === 'qualifications' && <ManageQualifications />}
                </div>

                <div className="mt-12 text-center">
                    <p className="text-[10px] font-black text-slate-200 uppercase tracking-[0.6em]">
                        Healthcare Enterprise Systems © 2023
                    </p>
                </div>
            </div>
        </div>
    )
}