'use client';

import React, { useState, useMemo } from 'react';
import { 
  FaSearch, FaPlus, FaRegTrashAlt, FaUserNurse, 
  FaArrowLeft, FaCloudUploadAlt, FaTimes, 
  FaCheckCircle, FaLink, FaEye, FaRegEdit
} from 'react-icons/fa';

export default function AppNurseBanners() {
  // --- STATE MANAGEMENT ---
  const [banners, setBanners] = useState([
    { id: 1, title: "24/7 ICU Nursing at Home", image: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?q=80&w=500&auto=format&fit=crop", link: "/services/icu-home", status: "Active", date: "2024-03-10" },
    { id: 2, title: "Post-Surgical Care Experts", image: "https://images.unsplash.com/photo-1586773860418-d3b97978c65c?q=80&w=500&auto=format&fit=crop", link: "/services/surgical", status: "Active", date: "2024-03-12" },
    { id: 3, title: "Professional Wound Dressing", image: "https://images.unsplash.com/photo-1581578731522-745a05ad9ad5?q=80&w=500&auto=format&fit=crop", link: "/services/dressing", status: "Inactive", date: "2024-03-05" },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" or "edit"
  const [selectedId, setSelectedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Form State
  const [formData, setFormData] = useState({ title: "", link: "", status: "Active", image: "" });

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (modalMode === "add") {
      const newEntry = {
        ...formData,
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        image: formData.image || "https://via.placeholder.com/500x200?text=Nurse+Banner"
      };
      setBanners([newEntry, ...banners]);
    } else {
      setBanners(banners.map(b => b.id === selectedId ? { ...b, ...formData } : b));
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this promotional nurse banner?")) {
      setBanners(banners.filter(b => b.id !== id));
    }
  };

  const filteredBanners = useMemo(() => {
    return banners.filter(b => b.title.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm, banners]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 text-[#08B36A]">
                <FaUserNurse size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none uppercase">Nurse App Banners</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">Manage Nursing Service Promotions</p>
            </div>
          </div>
          <div className="flex gap-3">
              <button onClick={handleOpenAdd} className="bg-[#08B36A] text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-green-100 flex items-center gap-2 active:scale-95 transition-all">
                <FaPlus /> Add Banner
              </button>
              <button onClick={() => window.history.back()} className="bg-white border border-slate-200 text-slate-600 px-6 py-3 rounded-xl font-bold text-xs shadow-sm hover:bg-slate-50 uppercase transition-all">
                <FaArrowLeft className="inline mr-2"/> Back
              </button>
          </div>
        </div>

        {/* --- TABLE CARD --- */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
          
          <div className="p-6 border-b border-slate-50 bg-white flex justify-between">
            <div className="relative max-w-md w-full">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
              <input 
                type="text" 
                placeholder="Search nurse banners..." 
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#08B36A]/20 transition-all font-medium" 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
            </div>
          </div>

          <div className="overflow-x-auto px-4 py-2">
            <table className="w-full text-left border-separate border-spacing-y-3">
              <thead>
                <tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
                  <th className="px-6 py-2">Preview</th>
                  <th className="px-6 py-2">Service Promotion</th>
                  <th className="px-6 py-2 text-center">Status</th>
                  <th className="px-6 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBanners.map((banner) => (
                  <tr key={banner.id} className="group transition-all bg-slate-50/50 rounded-2xl">
                    <td className="px-6 py-4 rounded-l-2xl">
                        <div className="w-24 h-12 rounded-lg overflow-hidden border border-slate-200 shadow-inner bg-white">
                            <img src={banner.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        <p className="text-sm font-black text-slate-700">{banner.title}</p>
                        <p className="text-[10px] font-bold text-emerald-600 mt-1">{banner.link}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                        banner.status === 'Active' ? 'bg-green-50 text-green-600' : 'bg-slate-200 text-slate-500'
                      }`}>
                        {banner.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 rounded-r-2xl text-right space-x-2">
                        <button onClick={() => handleOpenEdit(banner)} className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-[#08B36A] transition-all shadow-sm"><FaRegEdit /></button>
                        <button onClick={() => handleDelete(banner.id)} className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-red-500 transition-all shadow-sm"><FaRegTrashAlt /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- ADD/EDIT MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="relative bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-[#F8FAFC]">
                <h3 className="text-xl font-black uppercase text-slate-800">
                  {modalMode === "add" ? "Create Nurse Banner" : "Edit Nurse Banner"}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-300 hover:text-red-500 transition-colors"><FaTimes size={20}/></button>
            </div>

            <form onSubmit={handleSubmit} className="p-10 space-y-6">
                <div className="w-full h-40 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-300 group hover:border-[#08B36A] transition-all overflow-hidden relative shadow-inner">
                    {formData.image ? (
                        <img src={formData.image} className="w-full h-full object-cover" alt="Preview" />
                    ) : (
                        <>
                            <FaCloudUploadAlt size={40} className="group-hover:text-[#08B36A]" />
                            <p className="text-[10px] font-black uppercase tracking-widest mt-2 text-center px-4 text-slate-400">Nurse Graphics Placeholder (500x200 recommended)</p>
                        </>
                    )}
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Service Title</label>
                    <input value={formData.title} onChange={(e)=>setFormData({...formData, title: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#08B36A]/20 transition-all" placeholder="e.g. ICU Nurse Specialists" required />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target App Path</label>
                        <div className="relative">
                            <FaLink className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={12}/>
                            <input value={formData.link} onChange={(e)=>setFormData({...formData, link: e.target.value})} className="w-full pl-10 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none" placeholder="/booking/nurse" required />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Live Status</label>
                        <select value={formData.status} onChange={(e)=>setFormData({...formData, status: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none">
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Source Image URL</label>
                    <input value={formData.image} onChange={(e)=>setFormData({...formData, image: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm text-slate-500 outline-none" placeholder="Paste Unsplash or Server URL here..." />
                  </div>
                </div>

                <button type="submit" className="w-full py-5 bg-[#08B36A] text-white rounded-3xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-green-100 flex items-center justify-center gap-2 active:scale-95 transition-all">
                  <FaCheckCircle /> {modalMode === "add" ? "Publish to Nurse App" : "Update Campaign"}
                </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}