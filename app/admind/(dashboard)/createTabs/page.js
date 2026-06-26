"use client";
 
import React, { useState } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
 
const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
 
export default function AddNewTab() {
    const [formData, setFormData] = useState({
        tabId: "",
        name: "",
        parentId: 0,
        subParentId: 0,
        isActive: true,
    });
 
    const [submitting, setSubmitting] = useState(false);
 
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
       
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };
 
    const handleSubmit = async (e) => {
        e.preventDefault();
 
        // Validation for Tab ID and Name
        if (!formData.tabId || !formData.name) {
            toast.error("Tab ID and Name are required!");
            return;
        }
 
        setSubmitting(true);
 
        try {
            // Frontend se data properly Number format mein bhej rahe hain
            const payload = {
                tabId: Number(formData.tabId),
                name: formData.name,
                parentId: Number(formData.parentId) || 0,
                subParentId: Number(formData.subParentId) || 0,
                isActive: formData.isActive
            };
 
            // LocalStorage se admin ka token nikal rahe hain
            const adminToken = localStorage.getItem("token");
            const config = {
                headers: {
                    Authorization: `Bearer ${adminToken}`
                }
            };
 
            // Yahan par API hit ho rahi hai
            // Note: API path '/api/admin/roles/add-new-tab' assume kiya hai. Agar route alag ho toh change kar lena.
            const res = await axios.post(`${API_URL}/admin/roles/add-new-tab`, payload, config);
           
            if (res.data.success) {
                toast.success(`Tab "${res.data.data.name}" added successfully!`);
               
                // Form ko wapas khali kar do success ke baad
                setFormData({
                    tabId: "",
                    name: "",
                    parentId: 0,
                    subParentId: 0,
                    isActive: true,
                });
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || "Failed to add new tab");
        } finally {
            setSubmitting(false);
        }
    };
 
    return (
        <div className="min-h-screen bg-gray-50 flex justify-center items-start py-10">
            <Toaster position="top-right" />
            <div className="bg-white w-full max-w-3xl rounded-[2.5rem] shadow-xl shadow-black/5 p-10 border border-gray-100">
 
                <div className="mb-8">
                    <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tight">
                        Create New System Tab
                    </h2>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                        Add a new module to the system permissions
                    </p>
                </div>
 
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
 
                    {/* Tab ID (Number) */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tab ID (Unique)</label>
                        <input
                            type="number"
                            name="tabId"
                            value={formData.tabId}
                            required
                            placeholder="e.g. 54"
                            onChange={handleChange}
                            className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 ring-emerald-500/20 font-bold text-sm"
                        />
                    </div>
 
                    {/* Tab Name */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tab Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            required
                            placeholder="e.g. Vendor Km Limit"
                            onChange={handleChange}
                            className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 ring-emerald-500/20 font-bold text-sm"
                        />
                    </div>
 
                    {/* Parent ID */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Parent ID (Default: 0)</label>
                        <input
                            type="number"
                            name="parentId"
                            value={formData.parentId}
                            placeholder="0"
                            onChange={handleChange}
                            className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 ring-emerald-500/20 font-bold text-sm"
                        />
                    </div>
 
                    {/* Sub Parent ID */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Sub-Parent ID (Default: 0)</label>
                        <input
                            type="number"
                            name="subParentId"
                            value={formData.subParentId}
                            placeholder="0"
                            onChange={handleChange}
                            className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 ring-emerald-500/20 font-bold text-sm"
                        />
                    </div>
 
                    {/* Is Active Checkbox */}
                    <div className="md:col-span-2 space-y-1 bg-gray-50/50 p-4 rounded-2xl border border-gray-100 flex items-center justify-between">
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 block">
                                Status
                            </label>
                            <span className="text-sm font-bold text-gray-700 ml-1">Make this tab active immediately</span>
                        </div>
                        <label className="flex items-center cursor-pointer">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    name="isActive"
                                    checked={formData.isActive}
                                    onChange={handleChange}
                                    className="sr-only"
                                />
                                <div className={`block w-14 h-8 rounded-full transition-colors ${formData.isActive ? 'bg-[#08B36A]' : 'bg-gray-300'}`}></div>
                                <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${formData.isActive ? 'transform translate-x-6' : ''}`}></div>
                            </div>
                        </label>
                    </div>
 
                    {/* Submit Button */}
                    <div className="md:col-span-2 pt-4">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-[#08B36A] hover:bg-[#069356] text-white py-5 rounded-2xl shadow-xl shadow-emerald-100 transition-all font-black uppercase text-xs tracking-[0.2em] active:scale-95 disabled:opacity-50"
                        >
                            {submitting ? "Processing..." : "Deploy New Tab"}
                        </button>
                    </div>
 
                </form>
            </div>
        </div>
    );
}
 