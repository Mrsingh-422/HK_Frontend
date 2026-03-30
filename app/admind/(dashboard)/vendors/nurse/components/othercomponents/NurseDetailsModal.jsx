'use client'

import React from 'react'
import { FaTimes, FaEnvelope, FaBriefcase, FaGraduationCap, FaMapMarkerAlt, FaCalendarAlt, FaStethoscope } from "react-icons/fa"

function NurseDetailsModal({ isOpen, onClose, nurse }) {
    if (!isOpen || !nurse) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100">
                
                {/* --- HEADER / COVER AREA --- */}
                <div className="relative h-32 bg-gradient-to-r from-[#08B36A] to-[#059669]">
                    <button 
                        onClick={onClose}
                        className="absolute top-6 right-6 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all"
                    >
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* --- PROFILE INFO --- */}
                <div className="px-8 pb-10">
                    <div className="relative flex justify-between items-end -mt-12 mb-6">
                        <div className="p-1 bg-white rounded-[2rem] shadow-lg">
                            <img 
                                src={nurse.image} 
                                alt={nurse.name} 
                                className="w-32 h-32 rounded-[1.8rem] object-cover"
                            />
                        </div>
                        <div className="mb-2">
                             <span className="px-4 py-1.5 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-100">
                                Pending Approval
                             </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* LEFT COLUMN: Basic Info */}
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-2xl font-black text-slate-800 tracking-tight">{nurse.name}</h2>
                                <p className="text-[#08B36A] font-bold text-sm flex items-center gap-2">
                                    <FaStethoscope size={14}/> {nurse.category}
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-slate-500">
                                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                                        <FaEnvelope size={14}/>
                                    </div>
                                    <span className="text-sm font-medium">{nurse.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-500">
                                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                                        <FaBriefcase size={14}/>
                                    </div>
                                    <span className="text-sm font-medium">{nurse.experience} Professional Experience</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-500">
                                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                                        <FaCalendarAlt size={14}/>
                                    </div>
                                    <span className="text-sm font-medium">Applied on {nurse.appliedDate}</span>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Additional Credentials */}
                        <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100 space-y-4">
                             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verification Details</h4>
                             
                             <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-slate-500 font-bold">Certification</span>
                                    <span className="text-xs text-slate-800 font-black">Verified RN</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-slate-500 font-bold">Medical License</span>
                                    <span className="text-xs text-slate-800 font-black">ML-99203-X</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-slate-500 font-bold">Background Check</span>
                                    <span className="text-xs text-emerald-600 font-black">Cleared</span>
                                </div>
                             </div>

                             <div className="pt-4 border-t border-slate-100">
                                <p className="text-[11px] text-slate-400 leading-relaxed italic">
                                    "Candidate has completed specialized training in critical care management and advanced life support systems."
                                </p>
                             </div>
                        </div>
                    </div>

                    {/* --- ACTIONS --- */}
                    <div className="mt-10 flex gap-4">
                         <button 
                            onClick={onClose}
                            className="flex-1 px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all"
                         >
                            Close Details
                         </button>
                         <button 
                            className="flex-1 px-6 py-4 bg-[#08B36A] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#079d5c] shadow-lg shadow-green-100 transition-all active:scale-95"
                         >
                            Approve Candidate
                         </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default NurseDetailsModal;