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
                    setAddresses(res.data);
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

    if (loading) return <div className="animate-pulse h-48 bg-slate-100 rounded-3xl" />;

    return (
        <section className="space-y-6">
            <div className="flex items-center justify-between px-2">
                <div>
                    <h3 className="text-lg font-black text-slate-800">Visit Address</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-tight">Where should the nurse arrive?</p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                    <div
                        key={addr._id}
                        onClick={() => onSelect(addr)}
                        className={`cursor-pointer p-6 rounded-[2.5rem] border-2 transition-all relative flex flex-col ${
                            selectedAddress?._id === addr._id
                                ? "border-teal-500 bg-teal-50/30 shadow-xl shadow-teal-500/5"
                                : "border-slate-100 bg-white hover:border-slate-200"
                        }`}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedAddress?._id === addr._id ? "bg-teal-500 text-white" : "bg-slate-100 text-slate-400"}`}>
                                    <FaMapMarkerAlt size={14} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    {addr.addressType || "Home"}
                                </span>
                            </div>
                            {selectedAddress?._id === addr._id && (
                                <div className="bg-teal-500 text-white p-1 rounded-full">
                                    <FaCheckCircle size={14} />
                                </div>
                            )}
                        </div>

                        <div className="space-y-1 mb-4 flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <FaUser className="text-slate-300 text-[10px]" />
                                <p className="text-sm font-black text-slate-900">{addr.name}</p>
                            </div>
                            <p className="text-xs font-bold text-slate-600 leading-relaxed">
                                {addr.houseNo}, {addr.sector}
                                {addr.landmark && `, near ${addr.landmark}`}
                            </p>
                            <p className="text-[11px] font-medium text-slate-400">
                                {addr.city}, {addr.state} - {addr.pincode}
                            </p>
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                            <FaPhoneAlt className="text-slate-300 text-[10px]" />
                            <p className="text-[10px] font-black text-slate-500 tracking-tighter">
                                {addr.phone}
                            </p>
                        </div>

                        {selectedAddress?._id === addr._id && (
                            <div className="absolute inset-0 rounded-[2.5rem] ring-2 ring-teal-500 ring-inset pointer-events-none" />
                        )}
                    </div>
                ))}

                {addresses.length === 0 && (
                    <div className="col-span-full py-10 border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-400">
                        <FaMapMarkerAlt size={24} className="mb-2 opacity-20" />
                        <p className="text-xs font-bold">No addresses found. Please add one.</p>
                    </div>
                )}
            </div>
        </section>
    );
}