"use client";

import React, { useState, useEffect } from "react";
import AdminAPI from "@/app/services/AdminAPI";
import {
    FaMapMarkedAlt,
    FaPlus,
    FaListUl,
    FaSave,
    FaCheckCircle,
    FaTimesCircle,
    FaRoute,
    FaEdit,
    FaGlobeAmericas,
    FaInfoCircle,
    FaSearch,
    FaFlask,
    FaPills,
    FaUserNurse,
    FaAmbulance,
    FaHospital
} from "react-icons/fa";
import toast from "react-hot-toast";

// Helper to get icons for specific vendor types
const getVendorIcon = (type) => {
    switch (type) {
        case 'Lab': return <FaFlask />;
        case 'Pharmacy': return <FaPills />;
        case 'Nurse': return <FaUserNurse />;
        case 'Ambulance': return <FaAmbulance />;
        case 'Hospital': return <FaHospital />;
        default: return <FaRoute />;
    }
};

const KMLimitManagement = () => {
    const [activeTab, setActiveTab] = useState("view");
    const [limits, setLimits] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Initial state matches your schema defaults
    const [formData, setFormData] = useState({
        vendorType: "Lab",
        kmLimit: 50,
        isActive: true
    });

    const fetchLimits = async () => {
        try {
            setLoading(true);
            const res = await AdminAPI.adminGetVendorKMLimits();
            if (res.success) {
                setLimits(res.data);
            }
        } catch (error) {
            toast.error("Failed to load geo-fence configurations");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLimits();
    }, []);

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const res = await AdminAPI.adminSetVendorKMLimit(formData);
            if (res.success) {
                toast.success(res.message || "Configuration synchronized!");
                fetchLimits();
                setActiveTab("view");
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || "Internal Server Error");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (item) => {
        setFormData({
            vendorType: item.vendorType,
            kmLimit: item.kmLimit,
            isActive: item.isActive
        });
        setActiveTab("manage");
    };

    const filteredLimits = limits.filter(l => 
        l.vendorType.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-10 text-slate-900">
            <div className="max-w-6xl mx-auto">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-3">
                            <div className="p-2 bg-indigo-600 rounded-lg text-white">
                                <FaGlobeAmericas size={20} />
                            </div>
                            Logistic Radius Controls
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">Manage operational KM boundaries for different vendor classifications.</p>
                    </div>
                    <button 
                        onClick={() => {
                            setActiveTab("manage");
                            setFormData({ vendorType: "Lab", kmLimit: 50, isActive: true });
                        }}
                        className="bg-slate-900 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 shadow-sm"
                    >
                        <FaPlus size={10} /> Add Category
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatCard icon={<FaRoute className="text-indigo-600" />} label="Configured Types" value={limits.length} />
                    <StatCard icon={<FaCheckCircle className="text-emerald-600" />} label="Active Enforcements" value={limits.filter(l => l.isActive).length} />
                    <StatCard icon={<FaInfoCircle className="text-amber-600" />} label="Default Limit" value="50 KM" />
                </div>

                {/* Main Content Card */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="flex border-b border-slate-200 bg-slate-50/50">
                        <button
                            onClick={() => setActiveTab("view")}
                            className={`px-8 py-4 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${
                                activeTab === "view" 
                                ? "border-indigo-600 text-indigo-600 bg-white" 
                                : "border-transparent text-slate-400 hover:text-slate-600"
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <FaListUl /> View Registry
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab("manage")}
                            className={`px-8 py-4 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${
                                activeTab === "manage" 
                                ? "border-indigo-600 text-indigo-600 bg-white" 
                                : "border-transparent text-slate-400 hover:text-slate-600"
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <FaEdit /> {limits.find(l => l.vendorType === formData.vendorType) ? "Update Rule" : "Configure Rule"}
                            </div>
                        </button>
                    </div>

                    <div className="p-8">
                        {activeTab === "view" ? (
                            <div className="space-y-6">
                                {/* Search */}
                                <div className="relative max-w-sm">
                                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
                                    <input 
                                        type="text" 
                                        placeholder="Search by vendor type..." 
                                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>

                                {/* Table */}
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-slate-100 text-slate-400 text-[10px] uppercase tracking-[0.2em] font-black">
                                                <th className="pb-4">Vendor Type</th>
                                                <th className="pb-4">Radius Limit</th>
                                                <th className="pb-4">Last Updated</th>
                                                <th className="pb-4">Status</th>
                                                <th className="pb-4 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {loading && limits.length === 0 ? (
                                                [1, 2, 3].map(i => <tr key={i} className="animate-pulse"><td colSpan={5} className="py-10 bg-slate-50/50 rounded-lg"></td></tr>)
                                            ) : filteredLimits.map((limit) => (
                                                <tr key={limit._id} className="group hover:bg-slate-50/30 transition-colors">
                                                    <td className="py-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm">
                                                                {getVendorIcon(limit.vendorType)}
                                                            </div>
                                                            <span className="font-bold text-slate-700">{limit.vendorType}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-5">
                                                        <span className="font-mono font-black text-slate-900 bg-slate-100 px-3 py-1 rounded text-sm">
                                                            {limit.kmLimit} <span className="text-[10px] text-slate-400 ml-1">KM</span>
                                                        </span>
                                                    </td>
                                                    <td className="py-5 text-xs text-slate-400 font-medium">
                                                        {new Date(limit.updatedAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="py-5">
                                                        {limit.isActive ? (
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-tight">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-slate-100 text-slate-400 border border-slate-200 uppercase tracking-tight">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-slate-300" /> Paused
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="py-5 text-right">
                                                        <button 
                                                            onClick={() => handleEdit(limit)}
                                                            className="text-slate-300 hover:text-indigo-600 p-2.5 hover:bg-indigo-50 rounded-lg transition-all"
                                                        >
                                                            <FaEdit size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <div className="max-w-xl mx-auto py-10">
                                <form onSubmit={handleFormSubmit} className="space-y-8">
                                    <div className="grid grid-cols-1 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Select Vendor Type</label>
                                            <select
                                                value={formData.vendorType}
                                                onChange={(e) => setFormData({ ...formData, vendorType: e.target.value })}
                                                className="w-full bg-white border border-slate-200 rounded-xl px-5 py-4 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all font-bold text-slate-700 appearance-none shadow-sm"
                                            >
                                                {['Lab', 'Pharmacy', 'Nurse', 'Ambulance', 'Hospital'].map(type => (
                                                    <option key={type} value={type}>{type} Services</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Maximum Service Radius (KM)</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    required
                                                    value={formData.kmLimit}
                                                    onChange={(e) => setFormData({ ...formData, kmLimit: e.target.value })}
                                                    className="w-full bg-white border border-slate-200 rounded-xl px-5 py-4 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all font-bold text-slate-700 shadow-sm"
                                                />
                                                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-black text-slate-300 uppercase">km</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status Toggle Card */}
                                    <div className="p-6 bg-indigo-50/30 rounded-2xl border border-indigo-100/50 flex items-center justify-between">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-1">
                                                <FaCheckCircle className={formData.isActive ? "text-indigo-600" : "text-slate-300"} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-800 uppercase tracking-tight">Activate Rule</p>
                                                <p className="text-[11px] text-slate-500 font-medium">Allow system to use this radius for checkout calculations.</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                                            className={`w-12 h-6 rounded-full transition-all relative ${formData.isActive ? 'bg-indigo-600' : 'bg-slate-300'}`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${formData.isActive ? 'left-7' : 'left-1'}`} />
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-4 pt-4">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="flex-1 bg-slate-900 hover:bg-indigo-600 text-white py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-lg shadow-slate-200 disabled:opacity-50"
                                        >
                                            {loading ? "Processing..." : <><FaSave /> Sync Configuration</>}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab("view")}
                                            className="px-8 py-4 bg-white border border-slate-200 text-slate-500 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-10 text-center">
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.5em]">
                        Internal Geo-Fencing Framework • v2.0.4
                    </p>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon, label, value }) => (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-5">
        <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-xl shadow-inner">
            {icon}
        </div>
        <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-0.5">{label}</p>
            <p className="text-2xl font-black text-slate-900 tracking-tight">{value}</p>
        </div>
    </div>
);

export default KMLimitManagement;