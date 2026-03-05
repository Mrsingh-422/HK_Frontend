

import React, { useState, useMemo } from "react";
import {
    FaArrowLeft, FaSearch, FaStar, FaChevronDown,
    FaFilter, FaUserNurse, FaClock, FaCheckCircle,
    FaHospital, FaTimes, FaLanguage, FaStethoscope
} from "react-icons/fa";

// --- MODAL COMPONENT ---
function NurseDetailsModal({ isOpen, onClose, nurse }) {
    if (!isOpen || !nurse) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white w-full max-w-xl rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">

                <button onClick={onClose} className="absolute top-6 right-6 z-10 bg-slate-100 p-2 rounded-full text-slate-500 hover:text-red-500 transition-all">
                    <FaTimes />
                </button>

                <div className="overflow-y-auto p-6 md:p-10 no-scrollbar">
                    <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left">
                        <img src={nurse.image} className="w-28 h-28 rounded-3xl object-cover border-4 border-emerald-50 shadow-md" alt={nurse.name} />
                        <div className="flex-1">
                            <span className="bg-emerald-50 text-[#08B36A] text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest">
                                {nurse.speciality}
                            </span>
                            <h2 className="text-2xl font-black text-slate-900 mt-2">{nurse.name}</h2>
                            <p className="text-slate-500 font-bold text-xs">{nurse.qualification} • {nurse.experience} Experience</p>
                            <div className="flex items-center justify-center sm:justify-start gap-1 text-yellow-500 text-xs mt-2">
                                <FaStar /> {nurse.rating} <span className="text-slate-300 ml-1">({nurse.totalReviews} Reviews)</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 space-y-6">
                        <div>
                            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 flex items-center gap-2">
                                <FaStethoscope className="text-[#08B36A]" /> Profile Description
                            </h4>
                            <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                {nurse.description}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-4 rounded-2xl">
                                <p className="text-[9px] font-black text-slate-400 uppercase">Shift Duration</p>
                                <p className="text-xs font-black text-slate-800 flex items-center gap-1 mt-1">
                                    <FaClock className="text-[#08B36A]" /> {nurse.shift}
                                </p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-2xl">
                                <p className="text-[9px] font-black text-slate-400 uppercase">Languages</p>
                                <p className="text-xs font-black text-slate-800 flex items-center gap-1 mt-1">
                                    <FaLanguage className="text-[#08B36A]" /> {nurse.languages.join(", ")}
                                </p>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">Professional Services</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {nurse.services.map((s, i) => (
                                    <div key={i} className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                                        <FaCheckCircle className="text-[#08B36A] shrink-0" /> {s}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-white border-t border-slate-100 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase">Service Rate</p>
                        <p className="text-2xl font-black text-slate-900">₹{nurse.price}<span className="text-xs text-slate-400">/day</span></p>
                    </div>
                    <button className="bg-[#08B36A] hover:bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-100 transition-all active:scale-95">
                        Book Nurse
                    </button>
                </div>
            </div>
        </div>
    );
}

export default NurseDetailsModal