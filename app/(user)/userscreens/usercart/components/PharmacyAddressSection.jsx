"use client";

import React from 'react';
import { FaMapMarkerAlt, FaSpinner, FaCheckCircle, FaUser, FaPhoneAlt } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

const PharmacyAddressSection = ({ addresses = [], selectedAddress, setSelectedAddress, isLoading }) => {
    const router = useRouter();

    return (
        <div className="bg-white border border-slate-200/90 rounded-[2rem] p-6 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Delivery Destination</h3>
                <button 
                    type="button"
                    onClick={() => router.push('/profile/addresses')} 
                    className="text-[10px] font-black text-[#08B36A] uppercase hover:underline cursor-pointer"
                >
                    + Add New Address
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-6">
                    <FaSpinner className="animate-spin text-[#08B36A]" size={20} />
                </div>
            ) : addresses.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-2xl">
                    <p className="text-xs text-slate-400 font-bold">No saved addresses found</p>
                    <button 
                        type="button"
                        onClick={() => router.push('/profile/addresses')}
                        className="mt-2 text-[10px] bg-[#08B36A] hover:bg-[#079c5c] text-white px-4 py-2 rounded-xl font-black uppercase tracking-wider cursor-pointer"
                    >
                        Create Address
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {addresses.map((addr) => {
                        const isSelected = selectedAddress?._id === addr._id;
                        return (
                            <div
                                key={addr._id}
                                onClick={() => setSelectedAddress(addr)}
                                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                                    isSelected 
                                        ? 'border-[#08B36A] bg-emerald-50/40 ring-1 ring-[#08B36A]/20 shadow-xs' 
                                        : 'border-slate-200 bg-white hover:border-slate-300'
                                }`}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                                            isSelected ? 'bg-[#08B36A] text-white' : 'bg-slate-100 text-slate-400'
                                        }`}>
                                            <FaMapMarkerAlt size={12} />
                                        </div>
                                        <span className="text-[10px] font-black text-slate-900 uppercase">
                                            {addr.addressType || 'Home'}
                                        </span>
                                    </div>
                                    {isSelected && <FaCheckCircle className="text-[#08B36A]" size={15} />}
                                </div>

                                <p className="text-xs font-bold text-slate-800">{addr.name}</p>
                                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                                    {addr.houseNo}{addr.sector ? `, ${addr.sector}` : ''}, {addr.city} - {addr.pincode}
                                </p>
                                <p className="text-[10px] text-slate-400 mt-1 font-bold">{addr.phone}</p>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default PharmacyAddressSection;