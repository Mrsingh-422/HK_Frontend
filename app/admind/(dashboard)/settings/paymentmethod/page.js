"use client";

import React, { useState } from 'react';

// --- Zero-Dependency Premium Icons ---
const Icons = {
  ChevronLeft: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>,
  Search: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
  Edit: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z"/></svg>,
  Trash: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>,
  Plus: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
  CreditCard: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>,
  X: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>,
  Lock: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  Check: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
};

function PaymentMethodPage() {
  // 1. STATE
  const [methods, setMethods] = useState([
    { id: 1, name: 'RazorPay', keyId: 'rzp_live_efMxluKOejXfJ' },
    { id: 2, name: 'Stripe', keyId: 'sk_test_4eC39HqLyjWDarjt' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null); 
  const [tempName, setTempName] = useState('');
  const [tempKey, setTempKey] = useState('');

  // 2. SEARCH LOGIC
  const filteredMethods = methods.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 3. ACTION HANDLERS
  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setTempName(item.name);
      setTempKey(item.keyId);
    } else {
      setEditingItem(null);
      setTempName('');
      setTempKey('');
    }
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this payment method?")) {
      setMethods(methods.filter(m => m.id !== id));
    }
  };

  const handleSave = () => {
    if (!tempName || !tempKey) return alert("Please fill all fields");

    if (editingItem) {
      setMethods(methods.map(m => 
        m.id === editingItem.id ? { ...m, name: tempName, keyId: tempKey } : m
      ));
    } else {
      const newItem = {
        id: Date.now(),
        name: tempName,
        keyId: tempKey
      };
      setMethods([...methods, newItem]);
    }
    setIsModalOpen(false);
  };

  const maskKey = (key) => `••••••••${key.slice(-4)}`;

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl shadow-xl shadow-slate-200 flex items-center justify-center text-[#5cb85c]">
              <Icons.CreditCard />
            </div>
            <div>
               <h1 className="text-2xl font-black tracking-tight text-slate-800 uppercase leading-none">Payment Method</h1>
               <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Gateway Access Keys</p>
            </div>
          </div>
          <div className="flex gap-3">
             <button onClick={() => openModal()} className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 hover:border-[#5cb85c] hover:text-[#5cb85c] text-slate-500 font-black rounded-xl transition-all shadow-sm uppercase text-xs tracking-widest active:scale-95">
                <Icons.Plus /> Add Gateway
             </button>
             <button onClick={() => window.history.back()} className="flex items-center gap-2 px-6 py-3 bg-[#5cb85c] hover:bg-[#4cae4c] text-white font-black rounded-xl transition-all shadow-lg shadow-green-100 uppercase text-xs tracking-widest active:scale-95">
                <Icons.ChevronLeft /> Go Back
             </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="bg-white rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden">
          
          <div className="p-8 flex flex-col md:flex-row justify-between items-center gap-6 border-b border-slate-50">
            <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Active Providers ({methods.length})</div>
            <div className="relative w-full md:w-80">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"><Icons.Search /></span>
              <input type="text" placeholder="Search gateways..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-green-500/5 focus:border-[#5cb85c] transition-all text-sm font-medium"/>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">S No.</th>
                  <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Gateway Name</th>
                  <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">API Key ID</th>
                  <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredMethods.map((item, index) => (
                  <tr key={item.id} className="group hover:bg-slate-50/80 transition-all duration-300">
                    <td className="px-8 py-6 text-sm font-bold text-slate-300">{index + 1}</td>
                    <td className="px-8 py-6"><span className="text-sm font-black text-slate-700 uppercase">{item.name}</span></td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 font-mono text-xs bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg w-fit text-slate-400">
                        <Icons.Lock /> {maskKey(item.keyId)}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex justify-center gap-2">
                          <button onClick={() => openModal(item)} className="p-2.5 text-[#5cb85c] bg-green-50 rounded-lg hover:bg-[#5cb85c] hover:text-white transition-all shadow-sm active:scale-90" title="Edit Gateway">
                             <Icons.Edit />
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="p-2.5 text-rose-500 bg-rose-50 rounded-lg hover:bg-rose-500 hover:text-white transition-all shadow-sm active:scale-90" title="Delete Gateway">
                             <Icons.Trash />
                          </button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- CRUD MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
               <div>
                  <h3 className="text-xl font-black text-slate-800">{editingItem ? 'Edit Gateway' : 'New Gateway'}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Payment Configuration</p>
               </div>
               <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
                  <Icons.X />
               </button>
            </div>

            <div className="p-8 space-y-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Gateway Name</label>
                  <input type="text" value={tempName} onChange={(e) => setTempName(e.target.value)} placeholder="e.g., PayPal, RazorPay" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-[#5cb85c] font-bold text-slate-700 transition-all"/>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Live Key ID</label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"><Icons.Lock /></span>
                    <input type="text" value={tempKey} onChange={(e) => setTempKey(e.target.value)} placeholder="Enter API Key ID" className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-[#5cb85c] font-mono text-xs font-medium text-slate-600 transition-all"/>
                  </div>
               </div>
            </div>

            <div className="p-8 pt-0 flex gap-4">
               <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-slate-700 transition-all">Cancel Action</button>
               <button onClick={handleSave} className="flex-1 py-4 bg-[#5cb85c] text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl shadow-green-100 hover:bg-[#4cae4c] transition-all active:scale-95 flex items-center justify-center gap-2">
                  {editingItem ? 'Update Gateway' : 'Add Gateway'} <Icons.Check />
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PaymentMethodPage;