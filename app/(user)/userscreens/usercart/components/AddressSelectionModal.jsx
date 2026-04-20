"use client";
import React, { useState, useEffect } from 'react';
import { FaTimes, FaMapMarkerAlt, FaCheckCircle, FaSpinner, FaPlus, FaHome, FaBriefcase } from 'react-icons/fa';
import UserAPI from '@/app/services/UserAPI';

const AddressSelectionModal = ({ isOpen, onClose, onConfirm, selectedId }) => {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) fetchAddresses();
    }, [isOpen]);

    const fetchAddresses = async () => {
        setLoading(true);
        try {
            const res = await UserAPI.getUserAddresses();
            if (res.success) setAddresses(res.data);
        } catch (error) {
            console.error("Error fetching addresses:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md transition-all duration-300">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] animate-in fade-in zoom-in duration-300 ease-out">
                {/* Header */}
                <div className="px-8 pt-8 pb-6 flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Select Address</h2>
                        <p className="text-sm text-slate-500 font-medium mt-1">Choose collection location</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2.5 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-all duration-200"
                    >
                        <FaTimes size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="py-24 flex flex-col items-center justify-center gap-4">
                            <FaSpinner className="animate-spin text-emerald-500 text-4xl" />
                            <p className="text-slate-400 font-medium text-sm">Loading addresses...</p>
                        </div>
                    ) : (
                        <div className="space-y-3 px-2 pb-4">
                            {addresses.map((addr) => (
                                <div
                                    key={addr._id}
                                    onClick={() => onConfirm(addr)}
                                    className={`group relative p-4 rounded-3xl border-2 transition-all duration-200 cursor-pointer flex items-start gap-4 ${selectedId === addr._id
                                        ? "border-emerald-500 bg-emerald-50/50 shadow-md translate-y-[-2px]"
                                        : "border-slate-100 hover:border-emerald-200 hover:bg-slate-50/50"
                                        }`}
                                >
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors duration-200 flex-shrink-0 ${selectedId === addr._id
                                        ? "bg-emerald-500 text-white"
                                        : "bg-slate-100 text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-600"
                                        }`}>
                                        {addr.addressType === 'Home' ? <FaHome size={20} /> : <FaBriefcase size={20} />}
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className={`font-bold transition-colors ${selectedId === addr._id ? "text-emerald-900" : "text-slate-800"}`}>
                                                {addr.addressType} {addr.name && `(${addr.name})`}
                                            </p>
                                            {addr.isDefault && (
                                                <span className="text-[8px] bg-slate-900 text-white px-1.5 py-0.5 rounded font-black uppercase">Default</span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                            {addr.houseNo}, {addr.sector}, {addr.landmark && `${addr.landmark}, `} {addr.city}, {addr.state} - {addr.pincode}
                                        </p>
                                        <p className="text-[10px] text-slate-400 font-bold mt-1">Phone: {addr.phone}</p>
                                    </div>

                                    <div className={`transition-all duration-300 transform ${selectedId === addr._id ? "scale-110 opacity-100" : "scale-50 opacity-0"}`}>
                                        <FaCheckCircle className="text-emerald-500 text-2xl" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-8 bg-white border-t border-slate-50">
                    <button
                        className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-slate-200 rounded-[1.5rem] text-slate-400 font-bold text-sm hover:border-emerald-400 hover:text-emerald-600 transition-all"
                    >
                        <FaPlus size={12} /> Add New Address
                    </button>
                </div>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 20px; }
            `}</style>
        </div>
    );
};

export default AddressSelectionModal;