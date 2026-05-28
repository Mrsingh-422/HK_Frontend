'use client'
import React, { useState, useEffect, useMemo } from 'react'
import { FaPlus, FaFlask, FaSearch, FaSpinner } from 'react-icons/fa'
import MyTests from './components/MyTests';
import AllTests from './components/AllTests';
import AddTestModal from './components/AddTestModal';
import TestViewModal from './components/TestViewModal'; // IMPORTED NEW MODAL
import LabVendorAPI from '@/app/services/LabVendorAPI';

export default function TestsPage() {
  const [view, setView] = useState('mine'); 
  const [myTests, setMyTests] = useState([]);
  const [masterTests, setMasterTests] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); 
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false); // NEW STATE
  const [selectedTest, setSelectedTest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setFetching(true);
    try {
      const [myRes, masterRes] = await Promise.all([
        LabVendorAPI.getMyTests(),
        LabVendorAPI.getMasterList()
      ]);
      setMyTests(myRes.data || []);
      setMasterTests(masterRes.data || []);
    } catch (err) {
      console.error("API Error:", err);
    } finally {
      setFetching(false);
    }
  };

  const filteredMyTests = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return myTests;
    return myTests.filter(t => 
      t.testName?.toLowerCase().includes(term) || 
      t.mainCategory?.toLowerCase().includes(term)
    );
  }, [myTests, searchTerm]);

  const filteredMasterTests = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return masterTests;
    return masterTests.filter(t => 
      t.testName?.toLowerCase().includes(term)
    );
  }, [masterTests, searchTerm]);

  const handleSaveTest = async (payload) => {
    setLoading(true);
    try {
      const cleanData = {
        ...payload,
        amount: Number(payload.amount),
        discountPercent: Number(payload.discountPercent || 0),
        reportTime: Number(payload.reportTime),
      };

      if (selectedTest?._id && !selectedTest.standardMRP) {
        cleanData._id = selectedTest._id;
      }

      const isValidMongoId = (id) => /^[0-9a-fA-F]{24}$/.test(id);
      let rawId = cleanData.masterTestId?._id || cleanData.masterTestId;
      
      if (isValidMongoId(rawId)) {
        cleanData.masterTestId = rawId;
      } else {
        delete cleanData.masterTestId; 
      }

      const response = await LabVendorAPI.saveLabTest(cleanData);
      
      if (response.success || response._id) {
        await fetchInitialData(); 
        setIsModalOpen(false);
        setSelectedTest(null);
        setView('mine');
      } else {
        alert(response.message || "Failed to save test");
      }
    } catch (error) {
      console.error("Save Error:", error);
      alert(error.response?.data?.message || "Failed to save. Check all fields.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Remove this test?")) {
      try {
        const res = await LabVendorAPI.deleteService('tests', id); 
        if (res.success || res.message) {
          setMyTests(prev => prev.filter(t => t._id !== id));
        }
      } catch (err) {
        alert("Could not delete. Linking issues.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-10">
      <div className="bg-white border-b border-emerald-100 py-4 px-8 shadow-sm  top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-600 text-white rounded-xl"><FaFlask size={20} /></div>
            <h1 className="text-xl font-black text-slate-800 uppercase tracking-tight">Test Management</h1>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button onClick={() => setView('mine')} className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${view === 'mine' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}>My Inventory</button>
            <button onClick={() => setView('all')} className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${view === 'all' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}>Master Templates</button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div className="relative w-full md:w-80">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search tests..." 
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:border-emerald-500 shadow-sm transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            {view === 'mine' && (
                <button onClick={() => { setSelectedTest(null); setIsModalOpen(true); }} className="w-full md:w-auto px-8 py-3.5 bg-emerald-600 text-white font-black rounded-2xl shadow-lg flex items-center justify-center gap-2 text-xs uppercase hover:bg-emerald-700 transition-all active:scale-95">
                    <FaPlus /> Create / Pickup Test
                </button>
            )}
        </div>

        <div className="bg-white rounded-[32px] border border-emerald-50 shadow-sm overflow-hidden min-h-[400px]">
          {fetching ? (
            <div className="flex flex-col items-center justify-center py-20">
                <FaSpinner className="animate-spin text-emerald-600 mb-4" size={32} />
                <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Loading Records...</p>
            </div>
          ) : view === 'mine' ? (
            <MyTests 
                tests={filteredMyTests} 
                onViewDetails={(t) => { setSelectedTest(t); setIsViewModalOpen(true); }} // Updated to View Modal
                onEdit={(t) => { setSelectedTest(t); setIsModalOpen(true); }} 
                onDelete={handleDelete} 
            />
          ) : (
            <AllTests 
                tests={filteredMasterTests} 
                onViewDetails={(t) => { setSelectedTest(t); setIsViewModalOpen(true); }} // Updated to View Modal
            />
          )}
        </div>
      </div>

      {/* Input / Suggest Modal */}
      <AddTestModal
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setSelectedTest(null); }} 
        onSave={handleSaveTest} 
        loading={loading}
        initialData={selectedTest}
        masterTests={masterTests} 
      />

      {/* NEW: Full Information View Modal */}
      <TestViewModal 
        isOpen={isViewModalOpen}
        onClose={() => { setIsViewModalOpen(false); setSelectedTest(null); }}
        data={selectedTest}
      />
    </div>
  )
}