"use client";

import React, { useState } from 'react';

// --- Zero-Dependency Professional Icons ---
const Icons = {
  ChevronLeft: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>,
  Search: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
  Edit: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a2.121 2.1211 1 3 3L12 15l-4 1 1-4Z"/></svg>,
  Image: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>,
  X: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>,
  Upload: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  Pen: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
};

function ProjectDetailsPage() {
  // 1. STATE MANAGEMENT
  const [data, setData] = useState([
    { id: 1, title: 'MAIN APP LOGO', type: 'image', value: 'https://healthvideos12-new1.s3.us-west-2.amazonaws.com/1742900654_Health_Kangaroo-1_1.png' },
    { id: 2, title: 'URL FAV ICON', type: 'image', value: 'https://healthvideos12-new1.s3.us-west-2.amazonaws.com/1742900654_Health_Kangaroo-1_1.png' },
    { id: 3, title: 'PROJECT NAME', type: 'text', value: 'Health Kangaroo' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // States for the inputs in the modal
  const [newTitle, setNewTitle] = useState('');
  const [newValue, setNewValue] = useState('');

  // 2. SEARCH LOGIC
  const filteredData = data.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (item.type === 'text' && item.value.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // 3. EDIT ACTIONS
  const openEditModal = (item) => {
    setEditingItem(item);
    setNewTitle(item.title); // Initialize title input
    setNewValue(item.value); // Initialize value input
    setIsModalOpen(true);
  };

  const handleUpdate = () => {
    setData(data.map(item => 
      item.id === editingItem.id ? { ...item, title: newTitle.toUpperCase(), value: newValue } : item
    ));
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNewValue(reader.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl shadow-xl shadow-slate-200 flex items-center justify-center text-[#5cb85c]">
              <Icons.Image />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-800">Manage Project Details</h1>
          </div>
          <button onClick={() => window.history.back()} className="flex items-center gap-2 px-6 py-3 bg-[#5cb85c] hover:bg-[#4cae4c] text-white font-black rounded-xl transition-all shadow-lg shadow-green-100 uppercase text-xs tracking-widest active:scale-95">
            <Icons.ChevronLeft /> Go Back
          </button>
        </div>

        {/* Table Content */}
        <div className="bg-white rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden">
          <div className="p-8 flex flex-col md:flex-row justify-between items-center gap-6 border-b border-slate-50">
             <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Global Configuration</div>
             <div className="relative w-full md:w-80">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"><Icons.Search /></span>
                <input type="text" placeholder="Search keys..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-green-500/5 focus:border-[#5cb85c] transition-all text-sm font-medium"/>
             </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">S No.</th>
                  <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Title</th>
                  <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Details</th>
                  <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredData.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-8 py-6 text-sm font-bold text-slate-400">{index + 1}</td>
                    <td className="px-8 py-6">
                      <span className="inline-block px-4 py-1.5 bg-emerald-50 text-[#5cb85c] text-[10px] font-black rounded-full border border-emerald-100 group-hover:bg-[#5cb85c] group-hover:text-white transition-all uppercase">
                        {item.title}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      {item.type === 'image' ? (
                        <div className="w-14 h-14 bg-white rounded-xl border border-slate-100 p-1 shadow-sm overflow-hidden flex items-center justify-center">
                           <img src={item.value} alt="Preview" className="max-w-full max-h-full object-contain" />
                        </div>
                      ) : (
                        <span className="text-sm font-black text-slate-700">{item.value}</span>
                      )}
                    </td>
                    <td className="px-8 py-6 text-center">
                      <button onClick={() => openEditModal(item)} className="p-3 text-[#FFB938] bg-yellow-50 rounded-xl hover:bg-[#FFB938] hover:text-white transition-all shadow-sm active:scale-95">
                        <Icons.Edit />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- EDIT MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
               <div>
                  <h3 className="text-xl font-black text-slate-800">Edit Project Record</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Update identification keys</p>
               </div>
               <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                  <Icons.X />
               </button>
            </div>

            <div className="p-8 space-y-6">
               {/* 1. TITLE EDIT FIELD */}
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                    <Icons.Pen /> Record Title
                  </label>
                  <input 
                    type="text" 
                    value={newTitle} 
                    onChange={(e) => setNewTitle(e.target.value)} 
                    placeholder="Enter record title..."
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-[#5cb85c] font-bold text-slate-700 transition-all uppercase"
                  />
               </div>

               {/* 2. VALUE EDIT FIELD (IMAGE OR TEXT) */}
               {editingItem?.type === 'image' ? (
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Asset Preview</label>
                    <div className="w-full h-40 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 p-4 flex items-center justify-center overflow-hidden">
                       <img src={newValue} alt="Preview" className="max-w-full max-h-full object-contain" />
                    </div>
                    <label className="flex items-center justify-center gap-2 w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-black rounded-2xl cursor-pointer transition-all uppercase tracking-widest">
                       <Icons.Upload /> Choose New File
                       <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                    </label>
                 </div>
               ) : (
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Record Value</label>
                    <input 
                      type="text" 
                      value={newValue} 
                      onChange={(e) => setNewValue(e.target.value)} 
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-[#5cb85c] font-bold text-slate-700 transition-all"
                    />
                 </div>
               )}
            </div>

            <div className="p-8 pt-0 flex gap-4">
               <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-slate-600 transition-all">Cancel</button>
               <button onClick={handleUpdate} className="flex-1 py-4 bg-[#5cb85c] text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-lg shadow-green-100 hover:bg-[#4cae4c] transition-all active:scale-95">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectDetailsPage;