'use client'

import React from 'react'
import {
    FaUser, FaPhone, FaEnvelope,
    FaIdCard, FaCar, FaShieldAlt,
    FaCircle, FaHospitalAlt
} from "react-icons/fa"
import { HiOutlineX } from 'react-icons/hi'

// Ensure this matches your .env (e.g., http://localhost:5000)
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "";

const DriverDetailsModal = ({ isOpen, onClose, driver }) => {
    if (!isOpen || !driver) return null;

    // --- ROBUST IMAGE CONSTRUCTOR ---
    const getFullImageUrl = (path) => {
        // Fallback for missing images
        if (!path || path === "N/A" || path === "") {
            return `https://ui-avatars.com/api/?name=${encodeURIComponent(driver.driverName || 'Driver')}&background=08B36A&color=fff`;
        }

        // If it's already a full URL, return it
        if (path.startsWith('http')) return path;

        // Remove 'public/' prefix if it exists in the string
        const cleanPath = path.replace(/^public\//, '/');
        
        // Construct final URL without double slashes
        const baseUrl = BACKEND_URL.endsWith('/') ? BACKEND_URL.slice(0, -1) : BACKEND_URL;
        const finalPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;

        return `${baseUrl}${finalPath}`;
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop with Blur */}
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" onClick={onClose} />

            {/* Modal Container */}
            <div className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in duration-300">
                
                {/* --- LEFT SIDEBAR: PROFILE --- */}
                <div className="w-full md:w-80 bg-slate-50 border-r border-slate-100 p-10 flex flex-col items-center text-center shrink-0">
                    <div className="relative mb-6">
                        <div className="w-36 h-36 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl bg-white">
                            <img
                                src={getFullImageUrl(driver.imageUrl)}
                                alt={driver.driverName}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.src = "https://ui-avatars.com/api/?name=Driver&background=08B36A&color=fff";
                                }}
                            />
                        </div>
                        <div className={`absolute -bottom-2 -right-2 px-4 py-1.5 rounded-full border-4 border-white text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1.5 ${driver.onlineStatus ? 'bg-[#08B36A] text-white' : 'bg-slate-300 text-slate-600'}`}>
                            <FaCircle className={driver.onlineStatus ? "animate-pulse" : ""} size={8} />
                            {driver.onlineStatus ? "Live" : "Offline"}
                        </div>
                    </div>

                    <h2 className="text-2xl font-black text-slate-800 leading-tight uppercase tracking-tighter italic">
                        {driver.driverName}
                    </h2>
                    <p className="text-[#08B36A] text-[11px] font-black uppercase tracking-[0.2em] mt-2">
                        ID: {driver.username}
                    </p>

                    <div className="w-full mt-10 space-y-4">
                        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Driver Classification</p>
                            <span className="text-xs font-black text-slate-700 bg-slate-100 px-4 py-1.5 rounded-xl border border-slate-200">
                                {driver.driverType || "Personnel"}
                            </span>
                        </div>
                    </div>

                    <button 
                        onClick={onClose}
                        className="mt-auto w-full py-4.5 bg-slate-900 hover:bg-black text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all shadow-xl active:scale-95"
                    >
                        Exit Dossier
                    </button>
                </div>

                {/* --- RIGHT SIDE: DETAILED DATA --- */}
                <div className="flex-1 overflow-y-auto p-10 md:p-14 no-scrollbar bg-white">
                    <div className="flex justify-between items-start mb-12">
                        <div>
                            <h3 className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase underline underline-offset-8 decoration-[#08B36A]/20">
                                Personnel <span className="text-[#08B36A]">Files</span>
                            </h3>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-3">Verified Service Provider Metadata</p>
                        </div>
                        <button 
                            onClick={onClose}
                            className="p-3 bg-slate-50 text-slate-400 hover:text-red-500 rounded-2xl transition-all"
                        >
                            <HiOutlineX size={24} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-12">
                        
                        {/* Section 1: Contact & Credentials */}
                        <section>
                            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-4">
                                <div className="h-px w-10 bg-slate-200"></div> Core Information
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <DetailBox icon={<FaHospitalAlt />} label="Associated Vendor" value={driver.vendorName} />
                                <DetailBox icon={<FaPhone />} label="Primary Phone" value={driver.phone} />
                                <DetailBox icon={<FaEnvelope />} label="Registered Email" value={driver.email === "N/A" ? "No Email Provided" : driver.email} />
                                <DetailBox icon={<FaCar />} label="Vehicle Registration" value={driver.vehicleNumber} />
                            </div>
                        </section>

                        {/* Section 2: Legal Documentation */}
                        <section>
                            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-4">
                                <div className="h-px w-10 bg-slate-200"></div> License Verification
                            </h4>
                            <div className="grid grid-cols-1 gap-6">
                                <div className="group space-y-4">
                                    <div className="flex items-center justify-between px-2">
                                        <p className="text-[11px] font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                                            <FaIdCard className="text-[#08B36A]" /> License / Permit Image
                                        </p>
                                        <span className="text-[10px] font-bold text-slate-400 italic">Reference: {driver.id}</span>
                                    </div>
                                    <div className="relative aspect-video rounded-[3rem] overflow-hidden border-2 border-slate-100 bg-slate-50 group-hover:border-[#08B36A] transition-all shadow-inner">
                                        <img 
                                            src={getFullImageUrl(driver.licenseNumber)} 
                                            alt="License" 
                                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                                            onError={(e) => {
                                                e.target.src = "https://via.placeholder.com/600x400?text=License+Image+Not+Found";
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                            <div className="px-8 py-3 bg-white/20 backdrop-blur-md rounded-full border border-white/30">
                                                <span className="text-white font-black text-[10px] uppercase tracking-widest">Legal Document</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-green-50/50 p-6 rounded-[2rem] border border-green-100 flex items-center gap-5">
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#08B36A] shadow-sm">
                                        <FaShieldAlt size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-black text-slate-800 uppercase tracking-tight leading-none mb-1">Cloud ID Verification</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">Background check cleared via Admin Protocol</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                    </div>
                </div>
            </div>
        </div>
    )
}

// Utility Component
const DetailBox = ({ icon, label, value }) => (
    <div className="flex items-center gap-4 bg-slate-50/50 p-5 rounded-[1.5rem] border border-slate-100 shadow-inner">
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#08B36A] shadow-sm border border-slate-50">
            {React.cloneElement(icon, { size: 18 })}
        </div>
        <div className="min-w-0">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
            <p className="text-sm font-black text-slate-800 truncate uppercase tracking-tighter">{value}</p>
        </div>
    </div>
)

export default DriverDetailsModal;