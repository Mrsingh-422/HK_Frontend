import React, { useState, useEffect } from "react";
import { FaMapMarkerAlt, FaCheckCircle, FaPlus, FaUser, FaPhoneAlt } from "react-icons/fa";
import UserAPI from "@/app/services/UserAPI";

export default function AddressSelector({ selectedAddressId, onSelect }) {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                const res = await UserAPI.getUserAddresses();
                if (res?.success) {
                    setAddresses(res.data);
                    const defaultAddr = res.data.find(a => a.isDefault) || res.data[0];
                    if (defaultAddr && !selectedAddressId) onSelect(defaultAddr._id);
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
                {/* <button className="bg-teal-50 text-teal-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-1 border border-teal-100 hover:bg-teal-100 transition-all">
                    <FaPlus /> Add New
                </button> */}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                    <div
                        key={addr._id}
                        onClick={() => onSelect(addr._id)}
                        className={`cursor-pointer p-6 rounded-[2.5rem] border-2 transition-all relative flex flex-col ${
                            selectedAddressId === addr._id
                                ? "border-teal-500 bg-teal-50/30 shadow-xl shadow-teal-500/5"
                                : "border-slate-100 bg-white hover:border-slate-200"
                        }`}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedAddressId === addr._id ? "bg-teal-500 text-white" : "bg-slate-100 text-slate-400"}`}>
                                    <FaMapMarkerAlt size={14} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{addr.addressType}</span>
                            </div>
                            {selectedAddressId === addr._id && <FaCheckCircle className="text-teal-500 text-lg" />}
                        </div>

                        <div className="space-y-1 mb-4 flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <FaUser className="text-slate-300 text-[10px]" />
                                <p className="text-sm font-black text-slate-900">{addr.name}</p>
                            </div>
                            <p className="text-xs font-bold text-slate-600 leading-relaxed">
                                House No. {addr.houseNo}, Sector {addr.sector}, {addr.landmark}
                            </p>
                            <p className="text-xs font-medium text-slate-400">
                                {addr.city}, {addr.state} - {addr.pincode}
                            </p>
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                            <FaPhoneAlt className="text-slate-300 text-[10px]" />
                            <p className="text-[10px] font-black text-slate-500 tracking-tighter">{addr.phone}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}