"use client";
import React, { useState, useEffect } from 'react';
import { FaTimes, FaMapMarkerAlt, FaCheckCircle, FaSpinner, FaPlus, FaHome, FaBriefcase, FaPhoneAlt } from 'react-icons/fa';
import UserAPI from '@/app/services/UserAPI';

const AddressSelectionModal = ({ isOpen, onClose, onConfirm, selectedId }) => {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [tempSelectedAddress, setTempSelectedAddress] = useState(null);

    useEffect(() => {
        if (isOpen) {
            fetchAddresses();
        }
    }, [isOpen]);

    const fetchAddresses = async () => {
        setLoading(true);
        try {
            const res = await UserAPI.getUserAddresses();
            if (res.success) {
                setAddresses(res.data);
                // Highlight the previously selected one if it exists in the list
                const current = res.data.find(a => a._id === selectedId);
                if (current) setTempSelectedAddress(current);
            }
        } catch (error) {
            console.error("Error fetching addresses:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmSelection = () => {
        if (!tempSelectedAddress) return;

        // Construct the exact object format required by your checkout backend
        const formattedAddress = {
            name: tempSelectedAddress.name,
            phone: tempSelectedAddress.phone,
            houseNo: tempSelectedAddress.houseNo,
            sector: tempSelectedAddress.sector,
            landmark: tempSelectedAddress.landmark || "",
            city: tempSelectedAddress.city,
            state: tempSelectedAddress.state,
            pincode: tempSelectedAddress.pincode,
            addressType: tempSelectedAddress.addressType
        };

        // Send this clean object to the parent LabCart
        onConfirm(formattedAddress);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md transition-all duration-300">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] animate-in fade-in zoom-in duration-300 ease-out">

                {/* Header */}
                <div className="px-8 pt-8 pb-6 flex justify-between items-start border-b border-slate-50">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Select Address</h2>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Collection Location</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2.5 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-all duration-200"
                    >
                        <FaTimes size={18} />
                    </button>
                </div>

                {/* Body - Address List */}
                <div className="px-6 py-4 max-h-[450px] overflow-y-auto custom-scrollbar bg-slate-50/30">
                    {loading ? (
                        <div className="py-24 flex flex-col items-center justify-center gap-4">
                            <FaSpinner className="animate-spin text-emerald-500 text-4xl" />
                            <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Loading Saved Addresses</p>
                        </div>
                    ) : addresses.length === 0 ? (
                        <div className="py-20 text-center">
                            <FaMapMarkerAlt className="mx-auto text-slate-200 text-5xl mb-4" />
                            <p className="text-slate-500 font-bold">No addresses found.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {addresses.map((addr) => (
                                <div
                                    key={addr._id}
                                    onClick={() => setTempSelectedAddress(addr)}
                                    className={`group relative p-5 rounded-[2rem] border-2 transition-all duration-300 cursor-pointer flex items-start gap-4 ${tempSelectedAddress?._id === addr._id
                                            ? "border-emerald-500 bg-white shadow-[0_10px_25px_-5px_rgba(16,185,129,0.1)] translate-y-[-2px]"
                                            : "border-white bg-white/50 hover:border-emerald-200"
                                        }`}
                                >
                                    {/* Icon based on Type */}
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 flex-shrink-0 ${tempSelectedAddress?._id === addr._id
                                            ? "bg-emerald-500 text-white rotate-6"
                                            : "bg-slate-100 text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500"
                                        }`}>
                                        {addr.addressType === 'Home' ? <FaHome size={20} /> : <FaBriefcase size={20} />}
                                    </div>

                                    {/* Address Details */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className={`text-sm font-black transition-colors ${tempSelectedAddress?._id === addr._id ? "text-emerald-900" : "text-slate-800"}`}>
                                                {addr.name} 
                                            </p>
                                            <span className={`text-[9px] px-2 py-0.5 rounded-md font-black uppercase ${tempSelectedAddress?._id === addr._id ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                                                {addr.addressType}
                                            </span>
                                            {addr.isDefault && (
                                                <span className="text-[8px] bg-slate-900 text-white px-1.5 py-0.5 rounded-md font-black uppercase">Default</span>
                                            )}
                                        </div>
                                        
                                        <div className="mt-2 space-y-0.5">
                                            <p className="text-[11px] font-bold text-slate-600 leading-relaxed">
                                                H.No {addr.houseNo}, Sector {addr.sector}, {addr.landmark && `${addr.landmark},`}
                                            </p>
                                            <p className="text-[11px] font-bold text-slate-600">
                                                {addr.city}, {addr.state} - {addr.pincode}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-1.5 mt-3 text-slate-400">
                                            <FaPhoneAlt size={10} />
                                            <p className="text-[10px] font-black tracking-wider">{addr.phone}</p>
                                        </div>
                                    </div>

                                    {/* Selection Indicator */}
                                    <div className={`transition-all duration-300 ${tempSelectedAddress?._id === addr._id ? "scale-100 opacity-100" : "scale-0 opacity-0"}`}>
                                        <FaCheckCircle className="text-emerald-500 text-2xl" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer - Actions */}
                <div className="p-8 bg-white border-t border-slate-50 space-y-4">
                    <button
                        onClick={handleConfirmSelection}
                        disabled={!tempSelectedAddress}
                        className={`w-full py-5 rounded-3xl font-black text-xs uppercase tracking-widest transition-all duration-300 shadow-xl flex items-center justify-center gap-2 ${tempSelectedAddress
                                ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-100"
                                : "bg-slate-100 text-slate-300 cursor-not-allowed shadow-none"
                            }`}
                    >
                        Use Selected Address
                    </button>

                    <button
                        className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 font-black text-[10px] uppercase tracking-widest hover:border-emerald-400 hover:text-emerald-600 transition-all"
                    >
                        <FaPlus size={10} /> Add New Address
                    </button>
                </div>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 20px; }
            `}</style>
        </div>
    );
};

export default AddressSelectionModal;