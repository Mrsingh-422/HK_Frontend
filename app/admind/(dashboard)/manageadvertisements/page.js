'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
    HiOutlineSearch, HiOutlinePlus, HiOutlineTrash, HiOutlinePencilAlt, 
    HiOutlineLink, HiOutlinePhotograph, HiOutlineFilter,
    HiOutlineCloudUpload, HiOutlineCheckCircle, HiOutlineCollection,
    HiOutlineAdjustments, HiOutlineStatusOnline, HiOutlineGlobe
} from 'react-icons/hi';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

// API Service
import AdminAPI from '@/app/services/AdminAPI'; 

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function ProfessionalAdManager() {
    // --- STATES ---
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("add");
    const [selectedId, setSelectedId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterPage, setFilterPage] = useState("All");

    const [formData, setFormData] = useState({ 
        title: "", description: "", page: "", status: "Active"
    });
    const [imageFiles, setImageFiles] = useState([]); 
    const [previews, setPreviews] = useState([]);     

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
    useEffect(() => { fetchAds(); }, []);

    const fetchAds = async () => {
        try {
            setLoading(true);
            const res = await AdminAPI.adminGetAllAds();
            setAds(res.data || []);
        } catch (error) { console.error("Ad Fetch Error:", error); } 
        finally { setLoading(false); }
    };

    // --- HANDLERS ---
    const handleOpenEdit = (ad) => {
        setModalMode("edit");
        setSelectedId(ad._id);
        const existingPreviews = (ad.images || []).map(path => getImageUrl(path));
        
        setFormData({
            title: ad.title,
            description: ad.description,
            page: ad.page,
            status: ad.status || "Active"
        });
        setImageFiles([]); 
        setPreviews(existingPreviews); 
        setIsModalOpen(true);
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            const newPreviews = files.map(file => URL.createObjectURL(file));
            setImageFiles(prev => [...prev, ...files]);
            setPreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const removePreview = (index) => {
        setImageFiles(imageFiles.filter((_, i) => i !== index));
        setPreviews(previews.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append("title", formData.title);
        data.append("description", formData.description);
        data.append("page", formData.page);
        data.append("status", formData.status);
        
        // Backend singular/plural handled by images key
        imageFiles.forEach(file => data.append("images", file));

        try {
            setActionLoading(true);
            modalMode === "add" ? await AdminAPI.adminCreateAd(data) : await AdminAPI.adminUpdateAd(selectedId, data);
            setIsModalOpen(false);
            fetchAds();
        } catch (error) { alert("Save failed."); } 
        finally { setActionLoading(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this advertisement campaign?")) return;
        try { await AdminAPI.adminDeleteAd(id); fetchAds(); } catch (error) { alert("Delete failed"); }
    };

    // --- COMPUTED ---
    const filteredAds = useMemo(() => {
        return ads.filter(ad => {
            const matchesSearch = ad.title.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesPage = filterPage === "All" || ad.page === filterPage;
            return matchesSearch && matchesPage;
        });
    }, [searchTerm, ads, filterPage]);

    const uniquePages = ["All", ...new Set(ads.map(ad => ad.page))];

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-4 lg:p-10 font-sans text-slate-900">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* --- HEADER --- */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                           <HiOutlineCollection className="text-[#08B36A] stroke-[2.5]" />
                           Advertisement Library
                        </h1>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.3em] mt-1 ml-10">Cross-Channel Assets</p>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="hidden lg:flex bg-white px-5 py-2.5 rounded-2xl border border-slate-200 gap-6 items-center shadow-sm">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-slate-300 uppercase">Live</span>
                                <span className="text-lg font-black text-[#08B36A]">{ads.filter(a => a.status === 'Active').length}</span>
                            </div>
                            <div className="w-[1px] h-8 bg-slate-100"></div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-slate-300 uppercase">Total</span>
                                <span className="text-lg font-black text-slate-700">{ads.length}</span>
                            </div>
                        </div>
                        <button 
                            onClick={() => { setModalMode("add"); setIsModalOpen(true); setFormData({ title: "", description: "", page: "", status: "Active" }); setImageFiles([]); setPreviews([]); }}
                            className="bg-slate-900 hover:bg-[#08B36A] text-white px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl transition-all active:scale-95 ml-auto md:ml-0"
                        >
                            <HiOutlinePlus size={20} /> New Ad Campaign
                        </button>
                    </div>
                </div>

                {/* --- FILTERS & SEARCH --- */}
                <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex flex-col xl:flex-row gap-6 items-center">
                    <div className="relative w-full xl:max-w-md">
                        <HiOutlineSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                        <input
                            type="text"
                            placeholder="Find by ad title..."
                            className="w-full pl-16 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#08B36A] transition-all"
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full">
                        <HiOutlineFilter className="text-slate-200 mr-2 shrink-0" size={20}/>
                        {uniquePages.map(page => (
                            <button key={page} onClick={() => setFilterPage(page)} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filterPage === page ? 'bg-[#08B36A] text-white shadow-lg' : 'bg-white border border-slate-100 text-slate-400 hover:bg-slate-50'}`}>
                                {page}
                            </button>
                        ))}
                    </div>
                </div>

                {/* --- DATA VIEW --- */}
                {loading ? (
                    <div className="py-40 flex flex-col items-center justify-center gap-6">
                        <AiOutlineLoading3Quarters className="animate-spin text-[#08B36A]" size={40} />
                        <p className="font-black text-[10px] text-slate-300 uppercase tracking-widest">Initialising Creative Data</p>
                    </div>
                ) : filteredAds.length === 0 ? (
                    <div className="py-40 text-center bg-white rounded-[3rem] border border-slate-100">
                        <HiOutlinePhotograph size={64} className="mx-auto text-slate-100 mb-4" />
                        <p className="text-slate-400 font-black uppercase text-xs tracking-widest">No Ads Discovered</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {filteredAds.map((ad) => (
                            <div key={ad._id} className="bg-white rounded-[2rem] border border-slate-100 p-4 hover:shadow-xl hover:shadow-slate-200 transition-all duration-300 flex flex-col md:flex-row items-center gap-8">
                                {/* Preview Thumbnail */}
                                <div className="w-full md:w-48 h-32 rounded-2xl overflow-hidden bg-slate-100 shrink-0 relative">
                                    <img src={getImageUrl(ad.images?.[0])} className="w-full h-full object-cover" alt="" />
                                    {ad.images?.length > 1 && (
                                        <div className="absolute top-2 right-2 bg-black/60 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase">+{ad.images.length - 1} More</div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-grow space-y-1">
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-black text-slate-800 text-xl uppercase tracking-tighter leading-none">{ad.title}</h3>
                                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${ad.status === 'Active' ? 'bg-green-100 text-[#08B36A]' : 'bg-slate-100 text-slate-400'}`}>
                                            {ad.status}
                                        </span>
                                    </div>
                                    <p className="text-slate-400 text-xs font-medium italic line-clamp-1">"{ad.description}"</p>
                                    <div className="flex items-center gap-4 mt-3">
                                        <div className="flex items-center gap-1.5 text-slate-500 font-bold text-[10px] uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                            <HiOutlineGlobe size={14} className="text-[#08B36A]"/> {ad.page}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-slate-300 font-bold text-[10px] uppercase tracking-widest">
                                            <HiOutlineStatusOnline size={14}/> Updated: {new Date(ad.updatedAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 shrink-0 pr-4">
                                    <button onClick={() => handleOpenEdit(ad)} className="p-4 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all border border-slate-50 shadow-sm"><HiOutlinePencilAlt size={22}/></button>
                                    <button onClick={() => handleDelete(ad._id)} className="p-4 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all border border-slate-50 shadow-sm"><HiOutlineTrash size={22}/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* --- MODAL --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => !actionLoading && setIsModalOpen(false)}></div>
                    <div className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-10 pb-6 flex justify-between items-center border-b border-slate-50">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">{modalMode === 'add' ? 'Launch Campaign' : 'Edit Asset'}</h2>
                                <p className="text-[#08B36A] text-[9px] font-black uppercase tracking-[0.3em] mt-1">singular key 'images' active</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition-colors"><HiOutlinePlus className="rotate-45" size={20}/></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-10 space-y-8">
                            {/* Visual Asset Dropzone */}
                            <div onClick={() => fileInputRef.current.click()} className="relative h-48 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-wrap items-center justify-center gap-4 p-4 cursor-pointer group hover:border-[#08B36A] transition-all">
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleImageUpload} />
                                {previews.length > 0 ? (
                                    <div className="flex gap-4 p-2 overflow-x-auto w-full h-full items-center no-scrollbar">
                                        {previews.map((src, idx) => (
                                            <div key={idx} className="relative h-full aspect-video shrink-0 group/img">
                                                <img src={src} className="h-full w-full object-cover rounded-2xl shadow-xl border-4 border-white" alt="Preview" />
                                                <button type="button" onClick={(e) => { e.stopPropagation(); removePreview(idx); }} className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover/img:opacity-100 transition-opacity shadow-lg"><HiOutlinePlus className="rotate-45" size={12}/></button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center flex flex-col items-center">
                                        <HiOutlineCloudUpload size={40} className="text-[#08B36A] mb-3 group-hover:scale-110 transition-transform"/>
                                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Select Visual Content</p>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">Campaign Headline</label>
                                    <input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-[#08B36A] font-bold text-sm" placeholder="Title..." required />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">Ad Description</label>
                                    <textarea rows={2} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-[#08B36A] font-bold text-sm" placeholder="Description..." required />
                                </div>
                                <div>
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">Placement Location</label>
                                    <input value={formData.page} onChange={(e) => setFormData({...formData, page: e.target.value})} className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-[#08B36A] font-bold text-sm" placeholder="e.g. Lab Dashboard" required />
                                </div>
                                <div>
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">System Visibility</label>
                                    <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-[#08B36A] font-bold text-sm appearance-none">
                                        <option value="Active">Published</option>
                                        <option value="Inactive">Hidden</option>
                                    </select>
                                </div>
                            </div>

                            <button type="submit" disabled={actionLoading} className="w-full py-6 bg-[#08B36A] text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.4em] shadow-xl shadow-green-100 hover:bg-black transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                                {actionLoading ? <AiOutlineLoading3Quarters className="animate-spin"/> : <HiOutlineCheckCircle size={22}/>}
                                {modalMode === 'add' ? 'Commit Assets' : 'Finalise Changes'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}