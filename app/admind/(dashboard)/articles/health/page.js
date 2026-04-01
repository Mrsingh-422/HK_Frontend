'use client';

import React, { useState, useMemo, useRef } from 'react';
import { 
  FaSearch, FaPlus, FaRegTrashAlt, FaNewspaper, 
  FaArrowLeft, FaCloudUploadAlt, FaTimes, 
  FaCheckCircle, FaEye, FaRegEdit, FaUserEdit,
  FaCalendarAlt, FaTag
} from 'react-icons/fa';

export default function HealthArticlesPage() {
  // --- STATE MANAGEMENT ---
  const [articles, setArticles] = useState([
    { 
      id: 1, 
      title: "10 Minutes Yoga for Daily Energy", 
      author: "Dr. Anjali Rao", 
      category: "Wellness", 
      date: "2024-03-10", 
      status: "Published",
      image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=500&auto=format&fit=crop",
      content: "Yoga is a group of physical, mental, and spiritual practices or disciplines which originated in ancient India..." 
    },
    { 
      id: 2, 
      title: "Balanced Diet: Myths vs Facts", 
      author: "Nutritionist Sam", 
      category: "Diet", 
      date: "2024-03-12", 
      status: "Published",
      image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=500&auto=format&fit=crop",
      content: "Eating a healthy, balanced diet is an important part of maintaining good health, and can help you feel your best..." 
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); 
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const fileInputRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({ title: "", author: "", category: "Wellness", status: "Published", image: "", content: "" });

  // --- HANDLERS ---

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

  const handleOpenAdd = () => {
    setModalMode("add");
    setFormData({ title: "", author: "", category: "Wellness", status: "Published", image: "", content: "" });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (article) => {
    setModalMode("edit");
    setSelectedArticle(article);
    setFormData({ ...article });
    setIsModalOpen(true);
  };

  const handleView = (article) => {
    setSelectedArticle(article);
    setIsViewOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (modalMode === "add") {
      const newEntry = {
        ...formData,
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
      };
      setArticles([newEntry, ...articles]);
    } else {
      setArticles(articles.map(a => a.id === selectedArticle.id ? { ...formData } : a));
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm("Permanently delete this health article?")) {
      setArticles(articles.filter(a => a.id !== id));
    }
  };

  const filteredArticles = useMemo(() => {
    return articles.filter(a => 
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      a.author.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, articles]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 text-[#08B36A]">
                <FaNewspaper size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none uppercase">Health Articles</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">Manage Wellness Content</p>
            </div>
          </div>
          <div className="flex gap-3">
              <button onClick={handleOpenAdd} className="bg-[#08B36A] text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-green-100 flex items-center gap-2 active:scale-95 transition-all">
                <FaPlus /> Write Article
              </button>
              <button onClick={() => window.history.back()} className="bg-white border border-slate-200 text-slate-600 px-6 py-3 rounded-xl font-bold text-xs shadow-sm hover:bg-slate-50 transition-all">
                <FaArrowLeft className="inline mr-2"/> Back
              </button>
          </div>
        </div>

        {/* --- TABLE CARD --- */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          
          <div className="p-6 border-b border-slate-50 bg-white flex justify-between">
            <div className="relative max-w-md w-full">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
              <input 
                type="text" 
                placeholder="Search articles..." 
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#08B36A]/20 transition-all font-medium" 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
            </div>
          </div>

          <div className="overflow-x-auto px-4 py-2">
            <table className="w-full text-left border-separate border-spacing-y-3">
              <thead>
                <tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
                  <th className="px-6 py-2 text-center">Thumb</th>
                  <th className="px-6 py-2">Article Title</th>
                  <th className="px-6 py-2">Author</th>
                  <th className="px-6 py-2 text-center">Status</th>
                  <th className="px-6 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredArticles.map((article) => (
                  <tr key={article.id} className="group transition-all bg-slate-50/50 rounded-2xl">
                    <td className="px-6 py-4 rounded-l-2xl text-center">
                        <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 mx-auto bg-white">
                            <img src={article.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        <p className="text-sm font-black text-slate-700 tracking-tight">{article.title}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase mt-1 flex items-center gap-1"><FaTag size={8}/> {article.category}</p>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-500">{article.author}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                        article.status === 'Published' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-orange-50 text-orange-600 border border-orange-100'
                      }`}>
                        {article.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 rounded-r-2xl text-right space-x-2">
                        <button onClick={() => handleView(article)} className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-blue-500 transition-all shadow-sm"><FaEye /></button>
                        <button onClick={() => handleOpenEdit(article)} className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-[#08B36A] transition-all shadow-sm"><FaRegEdit /></button>
                        <button onClick={() => handleDelete(article.id)} className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-red-500 transition-all shadow-sm"><FaRegTrashAlt /></button>
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
          
          <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-[#F8FAFC]">
                <h3 className="text-xl font-black uppercase text-slate-800">
                  {modalMode === "add" ? "Write New Article" : "Edit Article"}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-300 hover:text-red-500 transition-colors"><FaTimes size={20}/></button>
            </div>

            <form onSubmit={handleSubmit} className="p-10 space-y-6 overflow-y-auto max-h-[75vh]">
                
                {/* Functional Image Upload Box */}
                <div 
                  onClick={() => fileInputRef.current.click()}
                  className="w-full h-48 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-300 group hover:border-[#08B36A] transition-all overflow-hidden relative cursor-pointer"
                >
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                    />
                    {formData.image ? (
                        <img src={formData.image} className="w-full h-full object-cover" alt="Preview" />
                    ) : (
                        <>
                            <FaCloudUploadAlt size={40} className="group-hover:text-[#08B36A] transition-colors" />
                            <p className="text-[10px] font-black uppercase tracking-widest mt-2">Click to Upload Header Photo</p>
                        </>
                    )}
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Title</label>
                    <input value={formData.title} onChange={(e)=>setFormData({...formData, title: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#08B36A]/20" required />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Author</label>
                        <div className="relative">
                            <FaUserEdit className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={14}/>
                            <input value={formData.author} onChange={(e)=>setFormData({...formData, author: e.target.value})} className="w-full pl-10 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none" required />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                        <select value={formData.category} onChange={(e)=>setFormData({...formData, category: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none">
                            <option>Wellness</option>
                            <option>Diet</option>
                            <option>Lifestyle</option>
                        </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Article Content</label>
                  <textarea rows={6} value={formData.content} onChange={(e)=>setFormData({...formData, content: e.target.value})} className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium text-slate-600 outline-none leading-relaxed" required />
                </div>

                <button type="submit" className="w-full py-5 bg-[#08B36A] text-white rounded-3xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-green-100 flex items-center justify-center gap-2 active:scale-95 transition-all">
                  <FaCheckCircle /> {modalMode === "add" ? "Publish Article" : "Save Changes"}
                </button>
            </form>
          </div>
        </div>
      )}

      {/* --- VIEW PREVIEW MODAL --- */}
      {isViewOpen && selectedArticle && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in" onClick={() => setIsViewOpen(false)}></div>
            <div className="relative bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
                <div className="h-56 relative">
                    <img src={selectedArticle.image} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => setIsViewOpen(false)} className="absolute top-6 right-6 p-2 bg-white/20 backdrop-blur-md rounded-full text-white"><FaTimes/></button>
                </div>
                <div className="p-10 space-y-6">
                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-[#08B36A]/10 text-[#08B36A] rounded-full text-[10px] font-black uppercase tracking-widest">{selectedArticle.category}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><FaCalendarAlt size={8}/> {selectedArticle.date}</span>
                    </div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">{selectedArticle.title}</h2>
                    <p className="text-sm font-medium text-slate-500 leading-relaxed max-h-48 overflow-y-auto pr-4 custom-scrollbar">
                        {selectedArticle.content}
                    </p>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}