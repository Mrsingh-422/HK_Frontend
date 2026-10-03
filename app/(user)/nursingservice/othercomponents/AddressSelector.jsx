"use client";
import React, { useState, useEffect } from "react";
import { FaMapMarkerAlt, FaCheckCircle, FaUser, FaPhoneAlt } from "react-icons/fa";
import UserAPI from "@/app/services/UserAPI";

export default function AddressSelector({ selectedAddress, onSelect }) {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                const res = await UserAPI.getUserAddresses();
                if (res?.success) {
                    setAddresses(res.data || []);
                    const defaultAddr = res.data.find(a => a.isDefault) || res.data[0];
                    if (defaultAddr && !selectedAddress) {
                        onSelect(defaultAddr);
                    }
                }
            } catch (error) {
                console.error("Error fetching addresses:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAddresses();
    }, []);

    if (loading) {
        return <div className="animate-pulse h-40 bg-slate-100 rounded-2xl" />;
    }

    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between px-1">
                <div>
                    <h3 className="text-base font-black text-slate-900">Visit Address</h3>
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                        Where should the nursing team arrive?
                    </p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {addresses.map((addr) => {
                    const isSelected = selectedAddress?._id === addr._id;
                    return (
                        <div
                            key={addr._id}
                            onClick={() => onSelect(addr)}
                            className={`cursor-pointer p-5 rounded-2xl border-2 transition-all relative flex flex-col justify-between ${
                                isSelected
                                    ? "border-[#08B36A] bg-emerald-50/40 ring-1 ring-[#08B36A]/20 shadow-xs"
                                    : "border-slate-200 bg-white hover:border-slate-300"
                            }`}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                                        isSelected ? "bg-[#08B36A] text-white" : "bg-slate-100 text-slate-500"
                                    }`}>
                                        <FaMapMarkerAlt size={12} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                                        {addr.addressType || "Home"}
                                    </span>
                                </div>
                                {isSelected && (
                                    <FaCheckCircle className="text-[#08B36A]" size={16} />
                                )}
                            </div>

                            <div className="space-y-1 mb-3 flex-1">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <FaUser className="text-slate-400 text-[10px]" />
                                    <p className="text-xs font-black text-slate-900">{addr.name}</p>
                                </div>
                                <p className="text-xs font-semibold text-slate-600 leading-relaxed">
                                    {addr.houseNo}, {addr.sector}
                                    {addr.landmark && `, near ${addr.landmark}`}
                                </p>
                                <p className="text-[11px] font-medium text-slate-400">
                                    {addr.city}, {addr.state} - {addr.pincode}
                                </p>
                            </div>

                            <div className="pt-2.5 border-t border-slate-100 flex items-center gap-2">
                                <FaPhoneAlt className="text-slate-400 text-[9px]" />
                                <p className="text-[11px] font-black text-slate-600">
                                    {addr.phone}
                                </p>
                            </div>
                        </div>
                    );
                })}

                {addresses.length === 0 && (
                    <div className="col-span-full py-8 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400">
                        <FaMapMarkerAlt size={22} className="mb-2 opacity-30 text-[#08B36A]" />
                        <p className="text-xs font-bold">No saved addresses found. Please add an address.</p>
                    </div>
                )}
            </div>
        </section>
    );
}