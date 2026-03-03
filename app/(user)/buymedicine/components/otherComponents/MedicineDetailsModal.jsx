"use client";
import React from "react";
import {
    FaTimes, FaBolt, FaShoppingCart, FaShieldAlt, FaInfoCircle,
    FaExclamationTriangle, FaVial, FaPrescriptionBottleAlt,
    FaTemperatureLow, FaCheckCircle, FaLightbulb
} from "react-icons/fa";

const MedicineDetailsModal = ({ isOpen, onClose, medicine, onAddToCart }) => {
    if (!isOpen || !medicine) return null;

    // Helper to render arrays as chips or comma-separated text
    const renderList = (list) => (Array.isArray(list) ? list.join(", ") : list);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content - Increased max-height for scrolling */}
            <div className="relative bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-300">

                {/* Header Section (Sticky) */}
                <div className="flex items-center justify-between p-4 border-b border-slate-50 bg-white z-10">
                    <div className="flex items-center gap-2">
                        <FaShieldAlt className="text-[#08B36A]" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Verified Product Details</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 bg-slate-50 rounded-full text-slate-500 hover:text-red-500 transition-colors"
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="overflow-y-auto custom-scrollbar">

                    {/* Hero Info */}
                    <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 md:items-start bg-gradient-to-b from-slate-50 to-white">
                        <div className="w-full md:w-1/3 aspect-square bg-white rounded-2xl border border-slate-100 flex items-center justify-center shadow-sm">
                            <img
                                src={medicine.image}
                                alt={medicine.name}
                                className="w-full h-full object-contain mix-blend-multiply"
                            />
                        </div>

                        <div className="flex-1">
                            <span className="text-[10px] font-black text-[#08B36A] uppercase tracking-[0.2em]">{medicine.vendor}</span>
                            <h2 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight mb-2">{medicine.name}</h2>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="bg-emerald-50 text-[#08B36A] text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-tighter">
                                    {medicine.drugCategory}
                                </span>
                                <span className="text-slate-300 text-xs">|</span>
                                <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{medicine.primaryUse}</span>
                            </div>

                            <div className="flex items-baseline gap-3">
                                <span className="text-3xl font-black text-slate-900">₹{medicine.discountPrice}</span>
                                <span className="text-sm text-slate-300 line-through font-bold">₹{medicine.actualPrice}</span>
                                <span className="text-xs font-black text-white bg-slate-900 px-2 py-1 rounded-lg">
                                    {Math.round(((medicine.actualPrice - medicine.discountPrice) / medicine.actualPrice) * 100)}% OFF
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Data Sections */}
                    <div className="p-6 space-y-8">

                        {/* 1. Introduction & Description */}
                        <section>
                            <h3 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-900 mb-3">
                                <FaInfoCircle className="text-[#08B36A]" /> Overview
                            </h3>
                            <p className="text-sm font-bold text-slate-800 mb-2">{medicine.introduction}</p>
                            <p className="text-xs text-slate-500 leading-relaxed font-medium">{medicine.description}</p>
                        </section>

                        {/* 2. Composition Grid */}
                        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                <h4 className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">
                                    <FaVial /> Salt Composition
                                </h4>
                                <p className="text-xs font-black text-slate-800">{medicine.saltComposition}</p>
                                <p className="text-[10px] text-slate-400 mt-1 italic">Synonyms: {renderList(medicine.saltSynonyms)}</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                <h4 className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">
                                    <FaTemperatureLow /> Storage
                                </h4>
                                <p className="text-xs font-black text-slate-800">{medicine.storage}</p>
                            </div>
                        </section>

                        {/* 3. Usage & Benefits */}
                        <section className="space-y-4">
                            <div>
                                <h3 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-900 mb-3">
                                    <FaCheckCircle className="text-[#08B36A]" /> Therapeutic Benefits
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {medicine.benefits.map((benefit, i) => (
                                        <span key={i} className="bg-emerald-50 text-[#08B36A] text-[10px] font-bold px-3 py-1.5 rounded-full border border-emerald-100">
                                            {benefit}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-slate-900 rounded-2xl p-5 text-white">
                                <h4 className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-3">
                                    <FaLightbulb /> How to Use
                                </h4>
                                <p className="text-xs font-medium leading-relaxed opacity-90">{medicine.howToUse}</p>
                                <div className="mt-4 pt-4 border-t border-white/10">
                                    <p className="text-[9px] font-black uppercase text-emerald-400 mb-1">Safety Advice</p>
                                    <p className="text-[11px] font-bold">{medicine.safetyAdvice}</p>
                                </div>
                            </div>
                        </section>

                        {/* 4. Precautions */}
                        <section>
                            <h3 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-900 mb-3">
                                <FaExclamationTriangle className="text-amber-500" /> Side Effects
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {medicine.sideEffects.map((effect, i) => (
                                    <span key={i} className="bg-amber-50 text-amber-700 text-[10px] font-bold px-3 py-1 rounded-lg border border-amber-100">
                                        {effect}
                                    </span>
                                ))}
                            </div>
                        </section>

                    </div>
                </div>

                {/* Footer Actions (Sticky) */}
                <div className="p-4 md:p-6 border-t border-slate-100 bg-white flex gap-3">
                    <button
                        onClick={() => onAddToCart(medicine)}
                        className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-900 font-black py-4 rounded-2xl text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        <FaShoppingCart /> Add to Cart
                    </button>
                    <button className="flex-[1.5] bg-[#08B36A] hover:bg-slate-900 text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-emerald-100">
                        <FaBolt /> Buy Now
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MedicineDetailsModal;