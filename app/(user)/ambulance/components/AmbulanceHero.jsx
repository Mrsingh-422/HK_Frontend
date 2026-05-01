"use client";
import React from "react";
import { motion } from "framer-motion";
import { FaAmbulance, FaMapMarkerAlt, FaPhoneAlt } from "react-icons/fa";

const AMBULANCE_CATEGORIES = [
    { label: "ALS", img: "https://cdn-icons-png.flaticon.com/512/1032/1032989.png", fullForm: "Advanced Life Support" },
    { label: "BLS", img: "https://cdn-icons-png.flaticon.com/512/883/883356.png", fullForm: "Basic Life Support" },
    { label: "PTV", img: "https://cdn-icons-png.flaticon.com/512/2864/2864275.png", fullForm: "Patient Transport" },
    { label: "Mortuary", img: "https://cdn-icons-png.flaticon.com/512/4320/4320355.png", fullForm: "Mortuary Van" },
];

const AmbulanceHero = ({ pageData, searchTerm, setSearchTerm }) => {
    return (
        <section className="relative pt-16 pb-24 px-6 overflow-hidden">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-7 space-y-8"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 border border-red-100">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-red-600">
                            {pageData.headerTag}
                        </span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.05] tracking-tight whitespace-pre-line">
                        {pageData.mainTitle}
                    </h1>

                    <p className="text-lg md:text-xl text-slate-500 max-w-xl leading-relaxed">
                        {pageData.description}
                    </p>

                    <div className="max-w-2xl bg-white rounded-[2.5rem] p-2 shadow-[0_20px_50px_rgba(220,38,38,0.1)] border border-slate-100 flex flex-col md:flex-row items-center gap-2">
                        <div className="relative flex-1 w-full group">
                            <FaMapMarkerAlt className="absolute left-6 top-1/2 -translate-y-1/2 text-red-500" />
                            <input
                                type="text"
                                placeholder={pageData.searchPlaceholder}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-14 pr-6 py-5 bg-transparent outline-none font-bold text-slate-700"
                            />
                        </div>
                        <button className="w-full md:w-auto bg-red-600 text-white px-10 py-5 rounded-[2rem] font-black hover:bg-slate-900 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2">
                            <FaAmbulance /> Find Now
                        </button>
                    </div>

                    <div className="grid grid-cols-4 gap-4 max-w-sm">
                        {AMBULANCE_CATEGORIES.map((cat, index) => (
                            <div key={index} className="flex flex-col items-center gap-2 group cursor-pointer" title={cat.fullForm}>
                                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center group-hover:border-red-500 group-hover:shadow-md transition-all">
                                    <img src={cat.img} alt={cat.label} className="w-8 h-8 object-contain" />
                                </div>
                                <span className="text-[10px] font-black text-slate-800">{cat.label}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="lg:col-span-5 relative"
                >
                    <div className="bg-white p-4 rounded-[3.5rem] shadow-2xl border border-slate-50">
                        <img
                            src="https://www.forcemotors.com/wp-content/uploads/2025/02/Traveller-Ambulance-D-mob-1.png"
                            className="w-full h-[500px] object-cover rounded-[2.5rem]"
                            alt="Emergency"
                        />
                        <div className="absolute -bottom-6 -left-6 bg-slate-900 text-white p-6 rounded-3xl shadow-2xl flex items-center gap-4">
                            <FaPhoneAlt className="text-red-500 text-2xl animate-bounce" />
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Emergency Helpline</p>
                                <p className="text-xl font-black">102 / 108</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default AmbulanceHero;