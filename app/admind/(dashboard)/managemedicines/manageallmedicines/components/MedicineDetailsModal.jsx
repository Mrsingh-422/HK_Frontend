"use client";
import React from 'react';
import { 
    FaTimes, FaCapsules, FaIndustry, FaFlask, FaMoneyBillWave, 
    FaPrescription, FaInfoCircle, FaExclamationTriangle, FaThermometerHalf 
} from 'react-icons/fa';

const MedicineDetailsModal = ({ isOpen, onClose, medicine, themeColor }) => {
    if (!isOpen || !medicine) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white rounded-[2rem] w-full max-w-4xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 my-8">
                
                {/* Header */}
                <div className="p-8 text-white flex justify-between items-start" style={{ backgroundColor: themeColor }}>
                    <div className="flex gap-6">
                        {medicine.image_url && medicine.image_url.length > 0 && (
                            <div className="w-24 h-24 bg-white rounded-2xl overflow-hidden flex-shrink-0 shadow-inner p-1">
                                <img src={medicine.image_url[0]} alt={medicine.name} className="w-full h-full object-contain" />
                            </div>
                        )}
                        <div>
                            <h2 className="text-2xl font-black uppercase tracking-tight leading-tight">{medicine.name}</h2>
                            <p className="text-xs font-bold opacity-80 uppercase tracking-widest mt-1 flex items-center gap-2">
                                <FaIndustry /> {medicine.manufacturers}
                            </p>
                            <div className="mt-3 flex gap-2">
                                {medicine.prescription_required === "YES" && (
                                    <span className="bg-red-500/20 text-white text-[10px] px-2 py-1 rounded-md font-black flex items-center gap-1 border border-white/20 uppercase tracking-tighter">
                                        <FaPrescription /> Rx Required
                                    </span>
                                )}
                                <span className="bg-white/20 text-white text-[10px] px-2 py-1 rounded-md font-black uppercase border border-white/20 tracking-tighter">
                                    {medicine.packaging}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="bg-white/20 hover:bg-white/30 p-3 rounded-full transition-all">
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Content Grid */}
                <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* LEFT COLUMN: PRIMARY INFO */}
                    <div className="lg:col-span-2 space-y-6">
                        <section>
                            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <FaFlask className="text-[#08B36A]" /> Salt Composition
                            </h3>
                            <p className="text-gray-700 font-bold bg-gray-50 p-4 rounded-2xl border border-gray-100 italic">
                                {medicine.salt_composition}
                            </p>
                        </section>

                        <section>
                            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <FaInfoCircle className="text-[#08B36A]" /> Introduction
                            </h3>
                            <p className="text-sm text-gray-600 leading-relaxed max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                {medicine.introduction}
                            </p>
                        </section>

                        <section className="bg-red-50 p-5 rounded-2xl border border-red-100">
                            <h3 className="text-sm font-black text-red-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <FaExclamationTriangle /> Side Effects
                            </h3>
                            <p className="text-xs text-red-700 font-medium leading-relaxed">
                                {medicine.side_effect}
                            </p>
                        </section>
                    </div>

                    {/* RIGHT COLUMN: STORAGE & PRICING */}
                    <div className="space-y-6">
                        <div className="bg-green-50 p-6 rounded-3xl border border-green-100">
                            <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-2">Pricing Details</p>
                            <div className="flex flex-col gap-1">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500 font-medium">MRP</span>
                                    <span className="text-gray-400 line-through">₹{medicine.mrp}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-700 font-black">Best Price</span>
                                    <span className="text-2xl font-black text-green-600">₹{medicine.best_price}</span>
                                </div>
                                <p className="text-[10px] font-bold text-green-700 bg-green-200/50 self-start px-2 py-0.5 rounded mt-1">
                                    SAVE {parseFloat(medicine.discont_percent * 100).toFixed(0)}%
                                </p>
                            </div>
                        </div>

                        <div className="p-5 border-2 border-dashed border-gray-100 rounded-3xl">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <FaThermometerHalf className="text-blue-500" /> Storage Info
                            </h3>
                            <p className="text-xs text-gray-600 font-bold leading-tight uppercase">
                                {medicine.storage}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer Section */}
                <div className="px-8 py-6 bg-gray-50 flex justify-between items-center">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">
                        Last Updated: {new Date(medicine.updatedAt).toLocaleDateString()}
                    </p>
                    <button 
                        onClick={onClose}
                        className="px-8 py-3 bg-white border border-gray-200 rounded-xl text-sm font-black text-gray-500 uppercase tracking-widest hover:bg-gray-100 transition-all active:scale-95"
                    >
                        Close Details
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MedicineDetailsModal;