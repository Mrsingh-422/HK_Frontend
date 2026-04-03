'use client';

import React, { useState, useMemo, useRef } from 'react';
import {
    FaSearch, FaPlus, FaRegTrashAlt,
    FaCloudUploadAlt, FaTimes,
    FaCheckCircle, FaLink, FaRegEdit,
    FaEye, FaEyeSlash, FaLayerGroup, FaCheckDouble
} from 'react-icons/fa';

export default function ManageLabBanners() {
    // --- STATE MANAGEMENT ---
    const [banners, setBanners] = useState([
        { id: 1, title: "Summer Health Sale", image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=500&auto=format&fit=crop", link: "/packages/summer", status: "Active", date: "2024-03-01" },
        { id: 2, title: "Free Home Collection", image: "https://images.unsplash.com/photo-1579152276503-34e815615d0d?q=80&w=500&auto=format&fit=crop", link: "/lab/home-visit", status: "Active", date: "2024-03-05" },
        { id: 3, title: "Expert Consultation", image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=500&auto=format&fit=crop", link: "/doctors/all", status: "Inactive", date: "2024-02-28" },
    ]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("add");
    const [selectedId, setSelectedId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    // Form State
    const [formData, setFormData] = useState({ title: "", link: "", status: "Active", image: "" });

    const fileInputRef = useRef(null);

    // --- COMPUTED STATS ---
    const stats = useMemo(() => {
        return {
            total: banners.length,
            active: banners.filter(b => b.status === 'Active').length,
            inactive: banners.filter(b => b.status === 'Inactive').length,
        }
    }, [banners]);

    // --- HANDLERS ---
    const handleOpenAdd = () => {
        setModalMode("add");
        setFormData({ title: "", link: "", status: "Active", image: "" });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (banner) => {
        setModalMode("edit");
        setSelectedId(banner.id);
        setFormData({
            title: banner.title,
            link: banner.link,
            status: banner.status,
            image: banner.image
        });
        setIsModalOpen(true);
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, image: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.image) return alert("Please upload a banner image");

        if (modalMode === "add") {
            const newEntry = { ...formData, id: Date.now(), date: new Date().toISOString().split('T')[0] };
            setBanners([newEntry, ...banners]);
        } else {
            setBanners(banners.map(b => b.id === selectedId ? { ...b, ...formData } : b));
        }
        setIsModalOpen(false);
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this campaign? This action cannot be undone.")) {
            setBanners(banners.filter(b => b.id !== id));
        }
    };

    const filteredBanners = useMemo(() => {
        return banners.filter(b => b.title.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [searchTerm, banners]);

    return (
        <div className="min-h-screen p-4 md:p-0 font-sans text-slate-900">
            <div className="max-w-7xl mx-auto">
                {/* --- TABLE CONTAINER --- */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

                    {/* Table Filters */}
                    <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row justify-between gap-4">
                        <div className="relative w-full md:w-96">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-3.5" />
                            <input
                                type="text"
                                placeholder="Search by campaign name..."
                                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <button
                            onClick={handleOpenAdd}
                            className="bg-[#08B36A] hover:bg-[#079D5A] text-white px-6 py-3 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all shadow-md shadow-indigo-200"
                        >
                            <FaPlus size={14} /> Create New Banner
                        </button>
                    </div>

                    {/* Table Content */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                                    <th className="px-6 py-4">Preview</th>
                                    <th className="px-6 py-4">Banner Details</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Created Date</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredBanners.length > 0 ? filteredBanners.map((banner) => (
                                    <tr key={banner.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="w-28 h-14 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                                                <img src={banner.image} alt="" className="w-full h-full object-cover" />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-slate-700">{banner.title}</span>
                                                <div className="flex items-center gap-1.5 text-xs text-indigo-600 mt-1">
                                                    <FaLink size={10} />
                                                    <span className="font-medium truncate max-w-[150px]">{banner.link}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${banner.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                                                }`}>
                                                {banner.status === 'Active' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                                                {banner.status.toUpperCase()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                                            {banner.date}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleOpenEdit(banner)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" title="Edit">
                                                    <FaRegEdit size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(banner.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete">
                                                    <FaRegTrashAlt size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center justify-center text-slate-400">
                                                <div className="bg-slate-50 p-4 rounded-full mb-4">
                                                    <FaSearch size={32} />
                                                </div>
                                                <p className="text-sm font-medium">No banners found matching your search</p>
                                                <button onClick={() => setSearchTerm('')} className="text-indigo-600 text-xs mt-2 hover:underline">Clear search filters</button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* --- MODAL --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] transition-opacity" onClick={() => setIsModalOpen(false)}></div>

                    <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">{modalMode === "add" ? "New Banner Campaign" : "Edit Banner"}</h3>
                                <p className="text-xs text-slate-500 italic">Recommended size: 1200 x 480 px</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
                                <FaTimes size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="space-y-5">
                                {/* Image Upload */}
                                <div>
                                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                                    <div
                                        onClick={() => fileInputRef.current.click()}
                                        className="w-full h-44 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center group hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer overflow-hidden"
                                    >
                                        {formData.image ? (
                                            <div className="relative w-full h-full">
                                                <img src={formData.image} className="w-full h-full object-cover shadow-inner" alt="Preview" />
                                                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                    <span className="text-white text-xs font-bold px-4 py-2 border border-white rounded-lg">Change Image</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                                    <FaCloudUploadAlt size={24} className="text-indigo-600" />
                                                </div>
                                                <p className="text-xs font-bold text-slate-600 uppercase tracking-tighter">Click to upload graphic</p>
                                                <p className="text-[10px] text-slate-400 mt-1">PNG, JPG or WebP up to 2MB</p>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Title */}
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Campaign Title</label>
                                    <input
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                        placeholder="e.g. Winter Sale 2024"
                                        required
                                    />
                                </div>

                                {/* Path & Status */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5 ml-1">App Navigation Link</label>
                                        <div className="relative">
                                            <FaLink className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
                                            <input
                                                value={formData.link}
                                                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                                className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                                placeholder="/promo/deals"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Visibility</label>
                                        <select
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                        >
                                            <option value="Active">Active / Visible</option>
                                            <option value="Inactive">Draft / Hidden</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all">
                                    Cancel
                                </button>
                                <button type="submit" className="flex-[2] px-4 py-3 bg-[#08B36A] text-white rounded-xl font-bold text-sm hover:bg-[#079D5A] shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 transition-all">
                                    <FaCheckCircle /> {modalMode === "add" ? "Publish Banner" : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

// Helper Component for Stats
function StatCard({ title, value, icon, color, bg }) {
    return (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center gap-4">
            <div className={`${bg} ${color} w-12 h-12 rounded-xl flex items-center justify-center text-xl`}>
                {icon}
            </div>
            <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">{title}</p>
                <p className="text-2xl font-bold text-slate-800 leading-none">{value}</p>
            </div>
        </div>
    );
}