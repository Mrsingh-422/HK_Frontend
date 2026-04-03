'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
    HiOutlineSearch, HiOutlinePlus, HiOutlineTrash, HiOutlinePencilAlt,
    HiOutlineFilter, HiOutlineCalendar, HiOutlinePhotograph,
    HiOutlineUserCircle, HiOutlineCloudUpload, HiOutlineX
} from 'react-icons/hi';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

// API Service
import AdminAPI from '@/app/services/AdminAPI';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "";
const SUBCATEGORIES = ['Health', 'Medical'];
// const SUBCATEGORIES = ['Health', 'Medical', 'Mental Health', 'Nutrition', 'Yoga'];

export default function AdminArticleManager() {
    // --- STATES ---
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("add");
    const [selectedId, setSelectedId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedSubCat, setSelectedSubCat] = useState("All");

    // Form State
    const [formData, setFormData] = useState({
        title: "", author: "", content: "", category: "Wellness", subCategory: "Health", status: "Published"
    });
    const [imageFiles, setImageFiles] = useState([]); // Array of File objects
    const [previews, setPreviews] = useState([]);     // Array of URL strings

    const fileInputRef = useRef(null);

    // --- HELPERS ---
    const getImageUrl = (path) => {
        if (!path) return "";
        if (path.startsWith('http')) return path;
        const cleanURL = BACKEND_URL.endsWith('/') ? BACKEND_URL.slice(0, -1) : BACKEND_URL;
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        return `${cleanURL}${cleanPath}`;
    };

    // --- DATA FETCHING ---
    useEffect(() => { fetchArticles(); }, []);

    const fetchArticles = async () => {
        try {
            setLoading(true);
            const res = await AdminAPI.adminGetArticles();
            setArticles(res.data || []);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    // --- FILE MANAGER HANDLERS ---
    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            const newPreviews = files.map(file => URL.createObjectURL(file));

            // Merge with existing selection if desired, or replace:
            setImageFiles(prev => [...prev, ...files]);
            setPreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const removeImage = (index) => {
        const updatedFiles = imageFiles.filter((_, i) => i !== index);
        const updatedPreviews = previews.filter((_, i) => i !== index);
        setImageFiles(updatedFiles);
        setPreviews(updatedPreviews);
    };

    // --- FORM HANDLERS ---
    const handleOpenEdit = (art) => {
        setModalMode("edit");
        setSelectedId(art._id);
        const existingPreviews = (art.images || []).map(path => getImageUrl(path));

        setFormData({
            title: art.title,
            author: art.author,
            content: art.content,
            category: art.category || "Wellness",
            subCategory: art.subCategory || "Health",
            status: art.status || "Published"
        });
        setImageFiles([]); // Reset new files
        setPreviews(existingPreviews); // Set current images as previews
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append("title", formData.title);
        data.append("author", formData.author);
        data.append("content", formData.content);
        data.append("category", formData.category);
        data.append("subCategory", formData.subCategory);
        data.append("status", formData.status);

        // Append multiple files
        imageFiles.forEach(file => data.append("images", file));

        try {
            setActionLoading(true);
            modalMode === "add" ? await AdminAPI.adminCreateArticle(data) : await AdminAPI.adminUpdateArticle(selectedId, data);
            setIsModalOpen(false);
            fetchArticles();
        } catch (error) { alert("Action failed"); }
        finally { setActionLoading(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this article permanently?")) return;
        try { await AdminAPI.adminDeleteArticle(id); fetchArticles(); } catch (error) { alert("Delete failed"); }
    };

    const filteredArticles = useMemo(() => {
        return articles.filter(art => {
            const matchesSearch = art.title.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesSubCat = selectedSubCat === "All" || art.subCategory === selectedSubCat;
            return matchesSearch && matchesSubCat;
        });
    }, [searchTerm, articles, selectedSubCat]);

    return (
        <div className="min-h-screen bg-[#FBFBFC] p-4 lg:p-10 font-sans text-slate-900">
            <div className="max-w-[1500px] mx-auto space-y-8">

                {/* --- HEADER --- */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic">Article Manager</h1>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Editorial & Blog Control</p>
                    </div>
                    <button
                        onClick={() => {
                            setModalMode("add");
                            setIsModalOpen(true);
                            setFormData({ title: "", author: "", content: "", category: "Wellness", subCategory: "Health", status: "Published" });
                            setImageFiles([]);
                            setPreviews([]);
                        }}
                        className="bg-[#08B36A] hover:bg-black text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center gap-3 shadow-xl transition-all active:scale-95"
                    >
                        <HiOutlinePlus size={20} /> Create Post
                    </button>
                </div>

                {/* --- FILTERS --- */}
                <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col xl:flex-row gap-6 items-center">
                    <div className="relative w-full xl:max-w-md group">
                        <HiOutlineSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                        <input
                            type="text"
                            placeholder="Search articles..."
                            className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#08B36A] transition-all"
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full py-1">
                        <div className="p-2 text-slate-200 shrink-0"><HiOutlineFilter size={20} /></div>
                        {["All", ...SUBCATEGORIES].map(sub => (
                            <button key={sub} onClick={() => setSelectedSubCat(sub)} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${selectedSubCat === sub ? 'bg-[#08B36A] text-white' : 'bg-white border border-slate-100 text-slate-400'}`}>
                                {sub}
                            </button>
                        ))}
                    </div>
                </div>

                {/* --- TABLE --- */}
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    <th className="px-8 py-6">Headline & Author</th>
                                    <th className="px-8 py-6">Category</th>
                                    <th className="px-8 py-6">Status</th>
                                    <th className="px-8 py-6 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr><td colSpan="4" className="py-24 text-center"><AiOutlineLoading3Quarters className="animate-spin mx-auto text-[#08B36A]" size={32} /></td></tr>
                                ) : filteredArticles.map((art) => (
                                    <tr key={art._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-5">
                                                <img src={getImageUrl(art.images?.[0])} className="w-14 h-14 rounded-xl object-cover border" alt="" />
                                                <div className="min-w-0">
                                                    <p className="font-black text-slate-800 text-sm uppercase truncate max-w-[250px]">{art.title}</p>
                                                    <p className="text-[10px] text-[#08B36A] font-bold uppercase">By {art.author}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase">{art.subCategory}</td>
                                        <td className="px-8 py-5">
                                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${art.status === 'Published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                {art.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex justify-center gap-2">
                                                <button onClick={() => handleOpenEdit(art)} className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><HiOutlinePencilAlt size={20} /></button>
                                                <button onClick={() => handleDelete(art._id)} className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><HiOutlineTrash size={20} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* --- MODAL --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => !actionLoading && setIsModalOpen(false)}></div>
                    <div className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl h-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

                        <div className="p-10 pb-6 flex justify-between items-center bg-white border-b border-slate-50 shrink-0">
                            <div>
                                <h2 className="text-2xl font-black text-slate-800 uppercase italic">{modalMode === 'add' ? 'New Post' : 'Edit Post'}</h2>
                                <p className="text-[#08B36A] text-[9px] font-black uppercase tracking-widest mt-1">Multi-Image Manager</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100"><HiOutlineX size={20} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-10 pt-6 flex-grow overflow-y-auto no-scrollbar space-y-8">
                            {/* PROFESSIONAL FILE MANAGER DROPZONE */}
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-3 block">Gallery Manager</label>
                                <div
                                    onClick={() => fileInputRef.current.click()}
                                    className="w-full min-h-[160px] bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-wrap items-center justify-center p-6 gap-4 cursor-pointer hover:border-[#08B36A] transition-all group"
                                >
                                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleImageUpload} />

                                    {previews.length > 0 ? (
                                        previews.map((src, idx) => (
                                            <div key={idx} className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-white shadow-md group/img">
                                                <img src={src} className="w-full h-full object-cover" alt="" />
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                                                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-md opacity-0 group-hover/img:opacity-100 transition-opacity"
                                                >
                                                    <HiOutlineX size={12} />
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center">
                                            <HiOutlineCloudUpload size={40} className="mx-auto text-slate-200 group-hover:text-[#08B36A] mb-2" />
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Browse Files</p>
                                        </div>
                                    )}
                                    <div className="w-full text-center mt-2">
                                        <span className="text-[9px] font-black text-[#08B36A] uppercase tracking-tighter cursor-pointer underline">Click to add more images</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">Post Title</label>
                                    <input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-[#08B36A] font-bold text-sm" placeholder="e.g. Benefits of Yoga" required />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">Author</label>
                                    <input value={formData.author} onChange={(e) => setFormData({ ...formData, author: e.target.value })} className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-[#08B36A] font-bold text-sm" placeholder="Author Name" required />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">SubCategory</label>
                                    <select value={formData.subCategory} onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })} className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-[#08B36A] font-bold text-sm appearance-none">
                                        {SUBCATEGORIES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">Article Content</label>
                                    <textarea rows={6} value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-[#08B36A] font-bold text-sm" placeholder="Write content here..." required />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">Status</label>
                                    <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-[#08B36A] font-bold text-sm appearance-none">
                                        <option value="Published">Published</option>
                                        <option value="Draft">Draft</option>
                                    </select>
                                </div>
                            </div>

                            <button type="submit" disabled={actionLoading} className="w-full py-5 bg-[#08B36A] text-white rounded-3xl font-black text-xs uppercase tracking-[0.4em] shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                                {actionLoading ? <AiOutlineLoading3Quarters className="animate-spin" /> : 'Finalize & Save'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}