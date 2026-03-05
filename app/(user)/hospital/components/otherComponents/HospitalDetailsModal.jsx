"use client";

import React from "react";
import { 
    FaTimes, FaStar, FaPhoneAlt, FaCheckCircle, 
    FaHospital, FaUserMd, FaBed, FaMapMarkerAlt,
    FaGlobe, FaClock, FaStethoscope, FaArrowRight 
} from "react-icons/fa";

export default function HospitalDetailsModal({ isOpen, onClose, hospital }) {
    if (!isOpen || !hospital) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
                onClick={onClose}
            />

            {/* Modal Container */}
            <div className="relative bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] shadow-2xl animate-in fade-in zoom-in duration-300 no-scrollbar">
                
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-5 right-5 z-10 bg-white/80 backdrop-blur-md p-3 rounded-full text-slate-900 hover:bg-red-500 hover:text-white transition-all shadow-lg cursor-pointer"
                >
                    <FaTimes size={18} />
                </button>

                {/* Hero Section: Image */}
                <div className="relative h-64 md:h-80 w-full bg-slate-100">
                    <img 
                        src={hospital.image} 
                        alt={hospital.name} 
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-8">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-[#08B36A] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                                Multi-Specialty
                            </span>
                            {hospital.emergency && (
                                <span className="bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest animate-pulse">
                                    Emergency 24/7
                                </span>
                            )}
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-white leading-tight">
                            {hospital.name}
                        </h2>
                        <p className="text-white/80 text-xs font-bold flex items-center gap-1 mt-1">
                            <FaMapMarkerAlt className="text-[#08B36A]" /> {hospital.address}
                        </p>
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-6 md:p-8 space-y-8">
                    
                    {/* Key Stats Row */}
                    <div className="grid grid-cols-3 gap-4 pb-8 border-b border-slate-100">
                        <div className="text-center">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Rating</p>
                            <div className="flex items-center justify-center gap-1 text-slate-900 font-black">
                                <FaStar className="text-yellow-400" /> {hospital.rating}.0
                            </div>
                        </div>
                        <div className="text-center border-x border-slate-100">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Beds</p>
                            <div className="flex items-center justify-center gap-1 text-slate-900 font-black">
                                <FaBed className="text-[#08B36A]" /> {hospital.beds}
                            </div>
                        </div>
                        <div className="text-center">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Doctors</p>
                            <div className="flex items-center justify-center gap-1 text-slate-900 font-black">
                                <FaUserMd className="text-[#08B36A]" /> {hospital.doctors}+
                            </div>
                        </div>
                    </div>

                    {/* About */}
                    <div>
                        <h4 className="flex items-center gap-2 text-[11px] font-black text-[#08B36A] uppercase tracking-widest mb-3">
                            <FaHospital /> About Hospital
                        </h4>
                        <p className="text-slate-600 text-sm md:text-base leading-relaxed font-medium">
                            {hospital.about}
                        </p>
                    </div>

                    {/* Specialties (Pills) */}
                    <div>
                        <h4 className="flex items-center gap-2 text-[11px] font-black text-[#08B36A] uppercase tracking-widest mb-4">
                            <FaStethoscope /> Key Specialties
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {hospital.specialties.map((spec, index) => (
                                <span key={index} className="bg-emerald-50 text-[#08B36A] px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                                    {spec}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Services Checklist */}
                    <div>
                        <h4 className="flex items-center gap-2 text-[11px] font-black text-[#08B36A] uppercase tracking-widest mb-4">
                            <FaCheckCircle /> Available Services
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                            {hospital.services.map((service, index) => (
                                <div key={index} className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <FaCheckCircle className="text-[#08B36A] text-[10px] flex-shrink-0" />
                                    <span className="text-xs font-bold text-slate-700">{service}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Contact Info Card */}
                    <div className="bg-slate-900 rounded-[2rem] p-6 text-white">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">Hospital Contact</p>
                                <div className="space-y-3">
                                    <a href={`tel:${hospital.phone}`} className="flex items-center gap-3 group">
                                        <div className="w-8 h-8 bg-[#08B36A] rounded-lg flex items-center justify-center text-xs group-hover:scale-110 transition-transform">
                                            <FaPhoneAlt />
                                        </div>
                                        <span className="text-sm font-black">{hospital.phone}</span>
                                    </a>
                                    <a href={`https://${hospital.website}`} target="_blank" className="flex items-center gap-3 group">
                                        <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center text-xs group-hover:scale-110 transition-transform">
                                            <FaGlobe />
                                        </div>
                                        <span className="text-sm font-black">{hospital.website}</span>
                                    </a>
                                </div>
                            </div>
                            <div className="md:border-l md:border-slate-800 md:pl-6">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">OPD Timing</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center text-xs">
                                        <FaClock />
                                    </div>
                                    <span className="text-sm font-black">{hospital.timing}</span>
                                </div>
                                <p className="text-[9px] font-bold text-slate-500 mt-2 uppercase tracking-tight">*Timing may vary for specific departments</p>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex gap-3 pt-4">
                        <button className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-900 font-black px-6 py-4 rounded-2xl text-[11px] uppercase tracking-widest transition-all">
                            Get Directions
                        </button>
                        <button className="flex-[2] bg-[#08B36A] hover:bg-slate-900 text-white font-black px-6 py-4 rounded-2xl text-[11px] uppercase tracking-widest transition-all shadow-xl shadow-emerald-100 flex items-center justify-center gap-2">
                            Book Appointment <FaArrowRight className="text-[10px]" />
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}