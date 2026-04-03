'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
    HiOutlineSearch, HiOutlinePlus, HiOutlineTrash, HiOutlinePencilAlt, 
    HiOutlineLink, HiOutlinePhotograph, HiOutlineFilter,
    HiOutlineChartBar, HiOutlineCheckCircle, HiOutlineClock
} from 'react-icons/hi';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

// API Service
import AdminAPI from '@/app/services/AdminAPI'; 

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
const CATEGORIES = ['Home', 'Medicine', 'Nurse', 'Lab', 'Hospital', 'Ambulance', 'General'];

export default function AdminBannerManager() {
    // --- STATES ---
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("add");
    const [selectedId, setSelectedId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");

    const [formData, setFormData] = useState({ 
        title: "", link: "", status: "Active", category: "Home", 
        imageFiles: [], previews: [] 
    });

    const fileInputRef = useRef(null);

    // --- HELPERS ---
    const getImageUrl = (path) => {
        if (!path) return "";
        if (path.startsWith('http')) return path;
        const cleanURL = BACKEND_URL.endsWith('/') ? BACKEND_URL.slice(0, -1) : BACKEND_URL;
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        return `${cleanURL}${cleanPath}`;
    };

    // --- DATA FETCH ---
    useEffect(() => { fetchBanners(); }, []);

    const fetchBanners = async () => {
        try {
            setLoading(true);
            const res = await AdminAPI.adminGetAllBanners();
            setBanners(res.data || []);
        } catch (error) { console.error("Admin Fetch Error:", error); } 
        finally { setLoading(false); }
    };

    // --- HANDLERS ---
    const handleOpenEdit = (banner) => {
        setModalMode("edit");
        setSelectedId(banner._id);
        const existingPreviews = (banner.image || []).map(path => getImageUrl(path));
        setFormData({
            title: banner.title,
            link: banner.link,
            status: banner.status,
            category: banner.category || "Home",
            imageFiles: [], 
            previews: existingPreviews
        });
        setIsModalOpen(true);
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            const newPreviews = files.map(file => URL.createObjectURL(file));
            setFormData({ ...formData, imageFiles: files, previews: newPreviews });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (modalMode === "add" && formData.imageFiles.length === 0) return alert("Upload required");

        const data = new FormData();
        data.append("title", formData.title);
        data.append("link", formData.link);
        data.append("status", formData.status);
        data.append("category", formData.category);
        
        // Singlar key 'image' for multiple files
        formData.imageFiles.forEach(file => data.append("image", file));

        try {
            setActionLoading(true);
            modalMode === "add" ? await AdminAPI.adminCreateBanner(data) : await AdminAPI.adminUpdateBanner(selectedId, data);
            setIsModalOpen(false);
            fetchBanners();
        } catch (error) { alert("Save failed."); } 
        finally { setActionLoading(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this banner?")) return;
        try { await AdminAPI.adminDeleteBanner(id); fetchBanners(); } catch (error) { alert("Delete failed"); }
    };

    const filteredBanners = useMemo(() => {
        return banners.filter(b => {
            const matchesSearch = b.title.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCat = selectedCategory === "All" || b.category === selectedCategory;
            return matchesSearch && matchesCat;
        });
    }, [searchTerm, banners, selectedCategory]);

    return (
        <div className="min-h-screen bg-[#F4F7F6] p-4 lg:p-10 font-sans text-slate-900">
            <div className="max-w-[1500px] mx-auto space-y-8">
                
                {/* --- DASHBOARD HEADER --- */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                           <span className="w-2 h-10 bg-[#08B36A] rounded-full"></span>
                           Banner Management
                        </h1>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mt-1 ml-5">Admin Control Center</p>
                    </div>

                    <div className="flex flex-wrap gap-4 w-full lg:w-auto">
                        <div className="flex bg-white px-6 py-3 rounded-2xl border border-slate-200 gap-6 items-center shadow-sm">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-slate-300 uppercase">Total</span>
                                <span className="text-lg font-black text-slate-700 leading-none">{banners.length}</span>
                            </div>
                            <div className="w-[1px] h-8 bg-slate-100"></div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-slate-300 uppercase">Active</span>
                                <span className="text-lg font-black text-[#08B36A] leading-none">{banners.filter(b => b.status === "Active").length}</span>
                            </div>
                        </div>
                        <button 
                            onClick={() => { setModalMode("add"); setIsModalOpen(true); setFormData({ title: "", link: "", status: "Active", category: "Home", imageFiles: [], previews: [] }); }}
                            className="bg-[#08B36A] hover:bg-black text-white px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center gap-3 shadow-lg shadow-green-100 transition-all active:scale-95 ml-auto md:ml-0"
                        >
                            <HiOutlinePlus size={20} /> Create New
                        </button>
                    </div>
                </div>

                {/* --- FILTERS & SEARCH --- */}
                <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex flex-col xl:flex-row gap-6 items-center">
                    <div className="relative w-full xl:max-w-md group">
                        <HiOutlineSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#08B36A] transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Search campaign titles..."
                            className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#08B36A] transition-all"
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full">
                        <div className="p-2 text-slate-200 shrink-0"><HiOutlineFilter size={20}/></div>
                        {["All", ...CATEGORIES].map(cat => (
                            <button 
                                key={cat} 
                                onClick={() => setSelectedCategory(cat)} 
                                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${selectedCategory === cat ? 'bg-slate-800 text-white shadow-lg' : 'bg-white border border-slate-100 text-slate-400 hover:bg-slate-50'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* --- CONTENT AREA --- */}
                {loading ? (
                    <div className="py-40 flex flex-col items-center justify-center gap-6">
                        <AiOutlineLoading3Quarters className="animate-spin text-[#08B36A]" size={40} />
                        <span className="font-black text-[10px] text-slate-300 uppercase tracking-widest">Loading API Metadata</span>
                    </div>
                ) : filteredBanners.length === 0 ? (
                    <div className="py-40 text-center bg-white rounded-[3rem] border border-slate-100 shadow-inner">
                        <HiOutlinePhotograph size={64} className="mx-auto text-slate-100 mb-4" />
                        <p className="text-slate-400 font-black uppercase text-xs tracking-widest">No matching banners discovered</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {filteredBanners.map((banner) => (
                            <div key={banner._id} className="group bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-300">
                                {/* IMAGE BOX */}
                                <div className="relative h-56 bg-slate-100 overflow-hidden">
                                    <img 
                                        src={getImageUrl(banner.image?.[0])} 
                                        alt={banner.title} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                                    />
                                    
                                    <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
                                        <div className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2 ${banner.status === 'Active' ? 'bg-[#08B36A] text-white' : 'bg-slate-400 text-white'}`}>
                                            {banner.status === 'Active' && <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />}
                                            {banner.status}
                                        </div>
                                        {banner.image?.length > 1 && (
                                            <span className="bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase">
                                                +{banner.image.length - 1} Images
                                            </span>
                                        )}
                                    </div>

                                    <div className="absolute bottom-4 left-4">
                                        <span className="bg-white/95 backdrop-blur-md text-slate-900 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md">
                                            {banner.category}
                                        </span>
                                    </div>
                                </div>

                                {/* ACTIONS & INFO */}
                                <div className="p-7">
                                    <h3 className="font-black text-slate-800 text-xl leading-none uppercase truncate mb-4">{banner.title}</h3>
                                    <div className="flex items-center gap-2 text-slate-400 font-bold text-[11px] truncate mb-8 italic">
                                        <HiOutlineLink size={16} />
                                        <span>{banner.link}</span>
                                    </div>
                                    
                                    <div className="flex justify-between items-center pt-6 border-t border-slate-50">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] text-slate-300 font-black uppercase tracking-tighter">Updated</span>
                                            <span className="text-[11px] text-slate-500 font-black">{new Date(banner.updatedAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleOpenEdit(banner)} className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-slate-100 hover:border-blue-100 shadow-sm"><HiOutlinePencilAlt size={20} /></button>
                                            <button onClick={() => handleDelete(banner._id)} className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-slate-100 hover:border-red-100 shadow-sm"><HiOutlineTrash size={20} /></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* --- MODAL --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-all" onClick={() => !actionLoading && setIsModalOpen(false)}></div>
                    <div className="relative bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-10 pb-0 flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">{modalMode === 'add' ? 'Launch Campaign' : 'Modify Asset'}</h2>
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Multi-upload / Key: 'image'</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition-colors shadow-inner"><HiOutlinePlus className="rotate-45" size={20}/></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-10 space-y-6">
                            {/* IMAGE UPLOAD AREA */}
                            <div onClick={() => fileInputRef.current.click()} className="relative h-52 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center overflow-hidden cursor-pointer group hover:border-[#08B36A] transition-all">
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleImageUpload} />
                                
                                {formData.previews.length > 0 ? (
                                    <div className="flex gap-4 p-4 overflow-x-auto w-full h-full items-center no-scrollbar">
                                        {formData.previews.map((src, idx) => (
                                            <img key={idx} src={src} className="h-full aspect-[4/3] object-cover rounded-2xl shadow-xl border-4 border-white shrink-0" alt="Preview" />
                                        ))}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="text-white font-black text-[10px] uppercase tracking-widest bg-black/40 px-6 py-2 rounded-full backdrop-blur-md">Upload New Set</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center flex flex-col items-center p-6">
                                        <HiOutlinePhotograph size={40} className="text-[#08B36A] mb-3 group-hover:scale-110 transition-transform"/>
                                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Select Graphic Elements</p>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Multi-upload Enabled</p>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="md:col-span-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Campaign Name</label>
                                    <input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-[#08B36A] font-bold text-sm" placeholder="Marketing Title" required />
                                </div>
                                <div>
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Placement Category</label>
                                    <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-[#08B36A] font-bold text-sm appearance-none">
                                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">System Status</label>
                                    <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-[#08B36A] font-bold text-sm appearance-none">
                                        <option value="Active">Live / Active</option>
                                        <option value="Inactive">Hidden / Draft</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">App Link Path</label>
                                    <input value={formData.link} onChange={(e) => setFormData({...formData, link: e.target.value})} className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-[#08B36A] font-bold text-sm" placeholder="/drappointment" required />
                                </div>
                            </div>

                            <button type="submit" disabled={actionLoading} className="w-full py-5 bg-[#08B36A] text-white rounded-2xl font-black text-xs uppercase tracking-[0.4em] shadow-xl shadow-green-100 hover:brightness-105 transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                                {actionLoading ? <AiOutlineLoading3Quarters className="animate-spin"/> : <HiOutlineCheckCircle size={20}/>}
                                {modalMode === 'add' ? 'Confirm & Publish' : 'Finalize Update'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}