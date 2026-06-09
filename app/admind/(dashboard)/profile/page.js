"use client";
 
import React, { useState, useEffect } from "react";
import { FaUser, FaEnvelope, FaPhoneAlt, FaShieldAlt, FaSave, FaArrowLeft } from "react-icons/fa";
import { useRouter } from "next/navigation";
import DiamondAPI from "@/app/services/DiamondAPI";
import { toast, Toaster } from "react-hot-toast";
 
export default function AdminProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
    const themeColor = "#08B36A";
 
    useEffect(() => {
        const loadProfile = async () => {
            try {
                const res = await DiamondAPI.getAdminProfile();
                if (res.success && res.data.length > 0) {
                    const data = res.data[0];
                    setFormData({ name: data.name, email: data.email, phone: data.phone });
                }
            } catch (err) { toast.error("Failed to load profile"); }
            finally { setLoading(false); }
        };
        loadProfile();
    }, []);
 
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await DiamondAPI.updateAdminProfile(formData);
            if (res.success) {
                toast.success("Profile Updated Successfully!");
                // Refresh data if needed or redirect
            }
        } catch (err) {
            toast.error(err.message || "Update Failed");
        } finally { setSubmitting(false); }
    };
 
    if (loading) return <div className="p-10 text-center font-bold text-gray-400">Loading Profile...</div>;
 
    return (
        <div className="p-4 md:p-10 bg-[#F8FAFC] min-h-screen">
            <Toaster position="top-right" />
           
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.back()} className="p-3 bg-white rounded-xl shadow-sm border border-gray-100 text-gray-500 hover:bg-gray-50">
                            <FaArrowLeft size={18} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Profile Settings</h1>
                            <p className="text-sm text-slate-500 font-medium">Manage your personal account details</p>
                        </div>
                    </div>
                </div>
 
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Side: Info Card */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm text-center">
                            <div className="w-24 h-24 rounded-3xl mx-auto flex items-center justify-center text-white text-3xl shadow-xl mb-4" style={{ backgroundColor: themeColor }}>
                                {formData.name?.charAt(0).toUpperCase()}
                            </div>
                            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">{formData.name}</h3>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] mt-1" style={{ color: themeColor }}>System User</p>
                           
                            <div className="mt-8 pt-8 border-t border-gray-50 space-y-4 text-left">
                                <div className="flex items-center gap-3 text-slate-500">
                                    <FaShieldAlt className="text-slate-300" />
                                    <span className="text-xs font-bold uppercase tracking-wider">Account Secure</span>
                                </div>
                            </div>
                        </div>
                    </div>
 
                    {/* Right Side: Form Card */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-gray-100 shadow-sm">
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                                        <div className="relative group">
                                            <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#08B36A] transition-colors" size={14} />
                                            <input
                                                className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 ring-[#08B36A]/10 focus:bg-white focus:border-[#08B36A] transition-all font-bold text-slate-700"
                                                value={formData.name}
                                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            />
                                        </div>
                                    </div>
 
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                                        <div className="relative group">
                                            <FaPhoneAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#08B36A] transition-colors" size={14} />
                                            <input
                                                className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 ring-[#08B36A]/10 focus:bg-white focus:border-[#08B36A] transition-all font-bold text-slate-700"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                </div>
 
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                                    <div className="relative group">
                                        <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#08B36A] transition-colors" size={14} />
                                        <input
                                            type="email"
                                            className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 ring-[#08B36A]/10 focus:bg-white focus:border-[#08B36A] transition-all font-bold text-slate-700"
                                            value={formData.email}
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        />
                                    </div>
                                </div>
 
                                <div className="pt-6">
                                    <button
                                        disabled={submitting}
                                        className="w-full md:w-auto px-12 py-4 bg-[#08B36A] text-white font-black rounded-2xl shadow-xl shadow-[#08B36A]/20 hover:bg-[#069356] hover:-translate-y-1 transition-all active:scale-95 uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3"
                                    >
                                        {submitting ? "Updating..." : <><FaSave /> Save Profile Changes</>}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
 