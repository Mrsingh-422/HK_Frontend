"use client";

import React from "react";
import {
    FaTimes, FaStar, FaPhoneAlt, FaCheckCircle,
    FaAmbulance, FaUser, FaTools, FaMapMarkerAlt,
    FaIdCard, FaClock, FaUsers
} from "react-icons/fa";

export default function ShowAmbulancsModel({ isOpen, onClose, ambulance }) {
    if (!isOpen || !ambulance) return null;

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
                        src={ambulance.image}
                        alt={ambulance.name}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-8">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-[#08B36A] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                                {ambulance.type} Unit
                            </span>
                            {ambulance.available24x7 && (
                                <span className="bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest animate-pulse">
                                    24/7 Emergency
                                </span>
                            )}
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-white leading-tight">
                            {ambulance.name}
                        </h2>
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-6 md:p-8 space-y-8">

                    {/* Key Stats Row */}
                    <div className="grid grid-cols-3 gap-4 pb-8 border-b border-slate-100">
                        <div className="text-center">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Rating</p>
                            <div className="flex items-center justify-center gap-1 text-slate-900 font-black">
                                <FaStar className="text-yellow-400" /> {ambulance.rating}.0
                            </div>
                        </div>
                        <div className="text-center border-x border-slate-100">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Distance</p>
                            <p className="text-slate-900 font-black">{ambulance.distance} KM</p>
                        </div>
                        <div className="text-center">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Capacity</p>
                            <p className="text-slate-900 font-black text-[11px] md:text-sm">{ambulance.capacity}</p>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <h4 className="flex items-center gap-2 text-[11px] font-black text-[#08B36A] uppercase tracking-widest mb-3">
                            <FaAmbulance /> Service Overview
                        </h4>
                        <p className="text-slate-600 text-sm md:text-base leading-relaxed font-medium">
                            {ambulance.description}
                        </p>
                    </div>

                    {/* Medical Equipment Grid */}
                    <div>
                        <h4 className="flex items-center gap-2 text-[11px] font-black text-[#08B36A] uppercase tracking-widest mb-4">
                            <FaTools /> Medical Equipment On-Board
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                            {ambulance.equipment.map((item, index) => (
                                <div key={index} className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <FaCheckCircle className="text-[#08B36A] text-xs flex-shrink-0" />
                                    <span className="text-xs font-bold text-slate-700">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Driver & Vendor Info */}
                    <div className="bg-slate-900 rounded-[2rem] p-6 text-white">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-[#08B36A] rounded-2xl flex items-center justify-center text-2xl">
                                    <FaUser />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Assigned Driver</p>
                                    <h5 className="text-lg font-black">{ambulance.driver}</h5>
                                    <p className="text-xs font-bold text-slate-400 flex items-center gap-1">
                                        <FaClock className="text-[10px]" /> {ambulance.experience} Experience
                                    </p>
                                </div>
                            </div>
                            <div className="text-left md:text-right">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Service Provider</p>
                                <p className="font-black text-[#08B36A]">{ambulance.vendor}</p>
                            </div>
                        </div>
                    </div>

                    {/* Booking/Contact Footer */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                        <div className="flex-1 w-full">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Estimated Fare</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-black text-slate-900">₹{ambulance.price}</span>
                                <span className="text-xs font-bold text-slate-400">/ trip</span>
                            </div>
                        </div>

                        <div className="flex gap-2 w-full sm:w-auto">
                            <a
                                href={`tel:${ambulance.contact}`}
                                className="flex-1 sm:flex-none bg-slate-100 hover:bg-slate-200 text-slate-900 px-6 py-4 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                            >
                                <FaPhoneAlt className="text-xs" />
                                <span className="text-xs font-black uppercase tracking-widest">Call</span>
                            </a>
                            <button className="flex-[2] sm:flex-none bg-[#08B36A] hover:bg-slate-900 text-white px-10 py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-emerald-100 cursor-pointer">
                                <span className="text-xs font-black uppercase tracking-widest">Confirm Booking</span>
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}