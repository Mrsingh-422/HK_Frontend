'use client'
import React, { useState, useEffect } from 'react'
import { FaTimes, FaSpinner, FaSearch, FaBox, FaCalendarAlt, FaRupeeSign, FaIndustry, FaFlask, FaCapsules, FaPlus } from 'react-icons/fa'
import PharmacyVendorAPI from '@/app/services/PharmacyVendorAPI';

export default function AddInventoryModal({ isOpen, onClose, onSave, loading, initialData, masterList = [] }) {
  const [activeTab, setActiveTab] = useState('master'); 
  const [searchTerm, setSearchTerm] = useState('');
  const [masterResults, setMasterResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedMaster, setSelectedMaster] = useState(null);

  const [formData, setFormData] = useState({
    vendor_price: '', stock_quantity: '', expiry_date: '',
    newName: '', newManufacturer: '', newSalt: '', newPackaging: '', newMRP: ''
  });

  useEffect(() => {
    if (isOpen) {
        if (initialData) {
            setSelectedMaster(initialData.medicineId);
            setFormData(prev => ({ ...prev, vendor_price: initialData.vendor_price, stock_quantity: initialData.stock_quantity, expiry_date: initialData.expiry_date?.split('T')[0] || '' }));
            setActiveTab('config');
        } else {
            setActiveTab('master');
            setMasterResults(masterList.slice(0, 5));
        }
    }
  }, [initialData, isOpen, masterList]);

  const handleMasterSearch = async () => {
    if (!searchTerm.trim()) return;
    setSearching(true);
    try {
      const res = await PharmacyVendorAPI.searchMasterMedicines(searchTerm);
      setMasterResults(res.data || []);
    } catch (err) { console.error(err); } finally { setSearching(false); }
  };

  const handleSuggestSubmit = async (e) => {
    e.preventDefault();
    try {
        const payload = {
            requestType: "Medicine",
            data: { name: formData.newName, manufacturers: formData.newManufacturer, salt_composition: formData.newSalt, packaging: formData.newPackaging, mrp: formData.newMRP }
        };
        await PharmacyVendorAPI.submitNewMasterRequest(payload);
        alert("Suggestion sent to admin!");
        onClose();
    } catch (err) { alert("Failed to suggest"); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
      <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200">
        <div className="bg-slate-50 border-b">
            <div className="p-8 pb-4 flex justify-between items-center">
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Medicine Configurator</h2>
                <button onClick={onClose} className="p-2 text-slate-300 hover:text-rose-500 transition-colors border-2 border-transparent rounded-2xl"><FaTimes size={20}/></button>
            </div>
            {!initialData && activeTab !== 'config' && (
                <div className="flex px-8 border-t">
                    <button onClick={() => setActiveTab('master')} className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest border-b-4 transition-all ${activeTab === 'master' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-400'}`}>Pickup Master</button>
                    <button onClick={() => setActiveTab('suggest')} className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest border-b-4 transition-all ${activeTab === 'suggest' ? 'border-amber-600 text-amber-600' : 'border-transparent text-slate-400'}`}>Suggest New</button>
                </div>
            )}
        </div>

        <div className="p-8 overflow-y-auto flex-grow custom-scrollbar">
          {activeTab === 'master' && (
            <div className="space-y-6">
              <div className="relative group">
                <input className="w-full p-5 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-700 outline-none focus:border-emerald-500 transition-all shadow-sm" placeholder="Search global database..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleMasterSearch()} />
                <button onClick={handleMasterSearch} className="absolute right-3 top-3 bottom-3 px-5 bg-emerald-600 text-white rounded-xl shadow-lg">{searching ? <FaSpinner className="animate-spin" /> : <FaSearch />}</button>
              </div>
              <div className="space-y-3">
                {masterResults.map((m) => (
                  <div key={m._id} className="flex justify-between items-center p-5 border border-slate-100 rounded-3xl hover:bg-emerald-50 hover:border-emerald-200 cursor-pointer group transition-all" onClick={() => { setSelectedMaster(m); setFormData(p => ({...p, vendor_price: m.mrp})); setActiveTab('config'); }}>
                     <div className="flex gap-4 items-center">
                        <div className="h-10 w-10 bg-white rounded-xl border flex items-center justify-center text-emerald-600 shadow-sm"><FaCapsules /></div>
                        <div>
                            <p className="font-black text-slate-800 text-sm">{m.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{m.manufacturers}</p>
                        </div>
                     </div>
                     <button className="px-4 py-2 bg-white border text-emerald-600 text-[10px] font-black uppercase rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">Select</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'suggest' && (
            <form onSubmit={handleSuggestSubmit} className="grid grid-cols-2 gap-5">
                <div className="col-span-2 space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Medicine Name</label>
                    <input required className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-2 border-transparent focus:border-amber-500 outline-none shadow-inner" value={formData.newName} onChange={e => setFormData({...formData, newName: e.target.value})} />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Manufacturer</label>
                    <input required className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-2 border-transparent focus:border-amber-500 outline-none shadow-inner" value={formData.newManufacturer} onChange={e => setFormData({...formData, newManufacturer: e.target.value})} />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global MRP (₹)</label>
                    <input required type="number" className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-2 border-transparent focus:border-amber-500 outline-none shadow-inner" value={formData.newMRP} onChange={e => setFormData({...formData, newMRP: e.target.value})} />
                </div>
                <button type="submit" className="col-span-2 mt-4 py-5 bg-amber-600 text-white font-black rounded-2xl uppercase text-[10px] tracking-widest hover:bg-amber-700 transition-all shadow-xl">Submit for Approval</button>
            </form>
          )}

          {activeTab === 'config' && (
            <form onSubmit={(e) => { e.preventDefault(); onSave({ medicineId: selectedMaster._id, vendor_price: Number(formData.vendor_price), stock_quantity: Number(formData.stock_quantity), expiry_date: formData.expiry_date }); }} className="grid grid-cols-2 gap-6">
                <div className="col-span-2 p-6 bg-emerald-600 rounded-3xl text-white flex justify-between items-center shadow-xl shadow-emerald-100">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Item Selected</p>
                        <p className="text-xl font-black">{selectedMaster?.name}</p>
                    </div>
                    {!initialData && <button type="button" onClick={() => setActiveTab('master')} className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">Change</button>}
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Selling Price</label>
                    <div className="relative"><div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</div>
                    <input required step="0.01" type="number" className="w-full pl-10 p-5 bg-slate-50 rounded-2xl font-bold border-2 border-transparent focus:border-emerald-500 outline-none transition-all shadow-inner" value={formData.vendor_price} onChange={e => setFormData({...formData, vendor_price: e.target.value})} /></div>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Stock units</label>
                    <input required type="number" className="w-full p-5 bg-slate-50 rounded-2xl font-bold border-2 border-transparent focus:border-emerald-500 outline-none transition-all shadow-inner" value={formData.stock_quantity} onChange={e => setFormData({...formData, stock_quantity: e.target.value})} />
                </div>
                <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Batch Expiry</label>
                    <input required type="date" className="w-full p-5 bg-slate-50 rounded-2xl font-bold border-2 border-transparent focus:border-emerald-500 outline-none transition-all shadow-inner" value={formData.expiry_date} onChange={e => setFormData({...formData, expiry_date: e.target.value})} />
                </div>
                <button type="submit" disabled={loading} className="col-span-2 py-5 bg-slate-900 text-white font-black rounded-2xl uppercase text-[10px] tracking-widest hover:bg-emerald-600 transition-all shadow-2xl">
                    {loading ? <FaSpinner className="animate-spin mx-auto" /> : 'Confirm Stock Details'}
                </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}