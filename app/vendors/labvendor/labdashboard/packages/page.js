'use client'
import React, { useState, useEffect, useMemo } from 'react'
import { 
  FaPlus, FaFlask, FaTimes, FaVenusMars, FaCalendarAlt, 
  FaVial, FaSpinner, FaSearch, FaChevronRight, FaArchive, FaLayerGroup 
} from 'react-icons/fa'
import AllPackages from './components/AllPackages';
import MyPackages from './components/MyPackages';
import AddPackageModal from './components/AddPackageModal';
import PackageViewModal from './components/PackageViewModal';
import LabVendorAPI from '@/app/services/LabVendorAPI';
import { toast } from 'react-hot-toast';

export default function PackagesPage() {
  const [view, setView] = useState('mine'); 
  const [myPackages, setMyPackages] = useState([]);
  const [masterPackages, setMasterPackages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  
  const [loading, setLoading] = useState(true); 
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch all initial data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [myPkgsRes, masterPkgsRes] = await Promise.all([
        LabVendorAPI.getMyPackages(),
        LabVendorAPI.getMasterPackages()
      ]);
      setMyPackages(myPkgsRes.data || []); 
      setMasterPackages(masterPkgsRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to synchronize package library");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchData(); 
  }, []);

  // Filter packages based on search term
  const filteredMyPackages = useMemo(() => {
    return myPackages.filter(pkg => 
      pkg.packageName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [myPackages, searchTerm]);

  const filteredMasterPackages = useMemo(() => {
    return masterPackages.filter(pkg => 
      pkg.packageName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [masterPackages, searchTerm]);

  // Unified Save Function (Handles both Create and Edit)
  const handleSave = async (payload) => {
    setActionLoading(true);
    try {
      // FIX: Check if we are in Edit mode by looking for an ID in the selected state
      const isEdit = !!(selected && selected._id);
      
      const finalPayload = isEdit 
        ? { ...payload, _id: selected._id } // Force the original ID into the payload
        : payload;

      const response = await LabVendorAPI.saveLabPackage(finalPayload);
      
      if (response && response.success) {
        toast.success(isEdit ? "Package updated successfully" : "New package listed successfully");
        await fetchData(); // Refresh list to show changes
        setIsModalOpen(false);
        setSelected(null);
      } else {
        toast.error(response.message || "Operation failed");
      }
    } catch (error) {
      console.error("Save Error:", error);
      toast.error(error.response?.data?.message || "Failed to save package changes.");
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Functionality
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this package?")) {
      try {
        const response = await LabVendorAPI.deleteService('package', id);
        if (response.success) {
          toast.success("Package removed from inventory");
          setMyPackages(prev => prev.filter(p => p._id !== id));
        }
      } catch (error) {
        toast.error("Could not complete delete operation");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      
      {/* LUXURY HEADER - Updated to Emerald Theme */}
      <div className="bg-white border-b border-emerald-100 py-6 px-8  top-0 z-40 backdrop-blur-md bg-white/80">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-emerald-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-emerald-100">
                <FaFlask size={24} />
            </div>
            <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Package Hub</h1>
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] mt-0.5">Lab Fleet Management</p>
            </div>
          </div>

          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200/50 shadow-inner">
            <button 
                onClick={() => setView('mine')} 
                className={`flex items-center gap-2 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${view === 'mine' ? 'bg-white text-emerald-600 shadow-lg' : 'text-slate-500 hover:text-slate-600'}`}
            >
                <FaLayerGroup size={12} /> My Inventory
            </button>
            <button 
                onClick={() => setView('all')} 
                className={`flex items-center gap-2 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${view === 'all' ? 'bg-white text-emerald-600 shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
            >
                <FaArchive size={12} /> Master Library
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-12">
        
        {/* SEARCH & ACTION BAR */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
            <div className="relative w-full md:w-[450px] group">
                <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by package name or category..." 
                    className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-[2rem] text-sm font-bold outline-none focus:border-emerald-500 shadow-xl shadow-slate-200/50 transition-all" 
                />
            </div>
            
            {view === 'mine' && (
                <button 
                    onClick={() => { setSelected(null); setIsModalOpen(true); }} 
                    className="w-full md:w-auto px-10 py-5 bg-emerald-600 text-white font-black rounded-[2rem] shadow-2xl shadow-emerald-200 flex items-center justify-center gap-3 text-xs uppercase hover:bg-emerald-700 hover:-translate-y-1 active:scale-95 transition-all duration-300"
                >
                    <FaPlus /> Register New Package
                </button>
            )}
        </div>

        {/* TABLE CONTAINER */}
        <div className="bg-white rounded-[3rem] border border-emerald-50 shadow-2xl shadow-slate-200/40 overflow-hidden min-h-[500px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-48">
                <div className="relative w-16 h-16 mb-6">
                    <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-t-emerald-500 rounded-full animate-spin"></div>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] animate-pulse">Syncing Database</p>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                {view === 'mine' ? (
                    <MyPackages 
                        packages={filteredMyPackages} 
                        onViewDetails={(p) => { setSelected(p); setIsViewModalOpen(true); }} 
                        onEdit={(p) => { setSelected(p); setIsModalOpen(true); }} 
                        onDelete={handleDelete} 
                    />
                ) : (
                    <AllPackages 
                        packages={filteredMasterPackages} 
                        onViewDetails={(p) => { setSelected(p); setIsViewModalOpen(true); }} 
                    />
                )}
            </div>
          )}
        </div>
      </div>

      {/* MODALS */}
      <AddPackageModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setSelected(null); }} 
        onSave={handleSave} 
        isSaving={actionLoading} 
        initialData={selected} 
      />

      <PackageViewModal 
        isOpen={isViewModalOpen} 
        onClose={() => setIsViewModalOpen(false)} 
        data={selected} 
      />
      
    </div>
  )
}