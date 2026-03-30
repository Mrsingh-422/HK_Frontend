'use client'

import React from 'react'
import {
    FaTimes, FaUser, FaPhone, FaEnvelope,
    FaMapMarkerAlt, FaWallet, FaBox,
    FaIdCard, FaMotorcycle, FaFileAlt,
    FaCheckCircle, FaExclamationCircle, FaShieldAlt,
    FaCircle
} from "react-icons/fa"

const DriverDetailsModal = ({ isOpen, onClose, driver }) => {
    if (!isOpen || !driver) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" onClick={onClose} />

            {/* Modal Container */}
            <div className="relative bg-white w-full max-w-5xl h-[85vh] md:h-[750px] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in fade-in slide-in-from-bottom-4 duration-300">

                {/* --- SIDEBAR: IDENTITY & STATUS --- */}
                <div className="w-full md:w-80 bg-slate-900 p-8 flex flex-col shrink-0 overflow-y-auto">
                    <div className="flex flex-col items-center text-center mb-8">
                        <div className="relative mb-4">
                            <img
                                src={driver.imageUrl}
                                alt={driver.driverName}
                                className="w-28 h-28 rounded-3xl object-cover border-4 border-white/10 shadow-2xl"
                            />
                            {/* Online Status Indicator */}
                            <div className={`absolute -bottom-2 -right-2 px-3 py-1 rounded-full border-4 border-slate-900 text-[10px] font-black uppercase tracking-tighter shadow-lg flex items-center gap-1 ${driver.onlineStatus ? 'bg-[#08B36A] text-white' : 'bg-slate-500 text-white'}`}>
                                <FaCircle className={driver.onlineStatus ? "animate-pulse" : ""} size={8} />
                                {driver.onlineStatus ? "Online" : "Offline"}
                            </div>
                        </div>
                        <h2 className="text-xl font-bold text-white leading-tight">{driver.driverName}</h2>
                        <p className="text-[#08B36A] text-xs font-bold uppercase tracking-widest mt-1">{driver.username}</p>
                    </div>

                    {/* Quick Stats */}
                    <div className="space-y-3 mb-8">
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-black mb-1">Assignment Status</p>
                            <div className={`text-xs font-bold flex items-center gap-2 ${driver.driverAssignStatus ? 'text-amber-400' : 'text-[#08B36A]'}`}>
                                {driver.driverAssignStatus ? <><FaExclamationCircle /> On Delivery</> : <><FaCheckCircle /> Available</>}
                            </div>
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-black mb-1">Wallet Balance</p>
                            <p className="text-xl font-mono text-white">₹{driver.amount.toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="mt-auto pt-4">
                        <button
                            onClick={onClose}
                            className="w-full py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-bold transition-all text-sm border border-white/10"
                        >
                            Close Details
                        </button>
                    </div>
                </div>

                {/* --- MAIN CONTENT: DATA & DOCUMENTS --- */}
                <div className="flex-1 bg-slate-50 overflow-y-auto p-6 md:p-10 custom-scrollbar">

                    {/* Header Row */}
                    <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
                        <div>
                            <h3 className="text-2xl font-black text-slate-800 tracking-tight">DRIVER <span className="text-[#08B36A]">DOSSIER</span></h3>
                            <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">Employee Profile & Documentation</p>
                        </div>
                        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm text-[10px] font-black text-slate-500 uppercase">
                            <FaShieldAlt className="text-[#08B36A]" /> Verified Partner: {driver.vendorName}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* 1. CONTACT & LOCATION */}
                        <section className="lg:col-span-2 space-y-4">
                            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                <div className="h-px w-4 bg-slate-300"></div> Basic Information
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InfoTile icon={<FaEnvelope />} label="Email Address" value={driver.email} />
                                <InfoTile icon={<FaPhone />} label="Phone Number" value={driver.phone} />
                                <div className="md:col-span-2">
                                    <InfoTile icon={<FaMapMarkerAlt />} label="Residential Address" value={driver.address} />
                                </div>
                            </div>
                        </section>

                        {/* 2. VEHICLE SPECS */}
                        <section className="space-y-4">
                            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                <div className="h-px w-4 bg-slate-300"></div> Logistics Specs
                            </h4>
                            <div className="bg-[#08B36A] p-5 rounded-[2rem] text-white shadow-lg shadow-[#08B36A]/20">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                                        <FaMotorcycle size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase opacity-70">Vehicle Type</p>
                                        <p className="text-lg font-black">{driver.vehicle}</p>
                                    </div>
                                </div>
                                <div className="space-y-2 border-t border-white/20 pt-4">
                                    <div className="flex justify-between text-[11px]">
                                        <span className="opacity-70 font-bold uppercase">Plate No.</span>
                                        <span className="font-mono font-bold">{driver.vehicleNumber}</span>
                                    </div>
                                    <div className="flex justify-between text-[11px]">
                                        <span className="opacity-70 font-bold uppercase">License ID</span>
                                        <span className="font-mono font-bold">{driver.licenseNumber}</span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 3. DOCUMENT VAULT */}
                        <section className="lg:col-span-3 space-y-4 pt-4">
                            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                <div className="h-px w-4 bg-slate-300"></div> Document Verification
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <DocCard title="Driving License" subtitle="Official Govt. ID" image={driver.licenseImage} icon={<FaIdCard />} />
                                <DocCard title="Registration Certificate (RC)" subtitle="Vehicle Ownership" image={driver.rcImage} icon={<FaFileAlt />} />
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    )
}

/** 
 * Sub-components 
 */
const InfoTile = ({ icon, label, value }) => (
    <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-[#08B36A]">
            {React.cloneElement(icon, { size: 16 })}
        </div>
        <div className="min-w-0">
            <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{label}</p>
            <p className="text-sm font-bold text-slate-700 truncate">{value}</p>
        </div>
    </div>
)

const DocCard = ({ title, subtitle, image, icon }) => (
    <div className="group bg-white p-4 rounded-[2rem] border border-slate-200 hover:border-[#08B36A]/40 transition-all cursor-pointer">
        <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-[#08B36A] group-hover:text-white transition-all">
                {icon}
            </div>
            <div>
                <p className="text-xs font-black text-slate-800 uppercase leading-none">{title}</p>
                <p className="text-[10px] text-slate-400 font-bold">{subtitle}</p>
            </div>
        </div>
        <div className="relative h-40 w-full rounded-2xl overflow-hidden bg-slate-100">
            <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <p className="text-white text-[10px] font-black uppercase tracking-widest bg-black/60 px-4 py-2 rounded-full">Preview Document</p>
            </div>
        </div>
    </div>
)

export default DriverDetailsModal