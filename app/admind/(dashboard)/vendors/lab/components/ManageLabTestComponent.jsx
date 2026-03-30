'use client';
import AdminAPI from '@/app/services/AdminAPI';
import React, { useEffect, useState } from 'react';
import { FaPlus, FaEdit, FaTrashAlt, FaFlask, FaSearch, FaCheckCircle, FaTimesCircle, FaVials, FaEye, FaMicroscope } from 'react-icons/fa';
import TestDetailModal from './otherComponents/TestDetailModal';
import EditTestModal from './otherComponents/EditTestModal';
import { toast, Toaster } from 'react-hot-toast';

function ManageLabTestComponent() {
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTest, setSelectedTest] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const brandColor = "#08B36A";

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await AdminAPI.getTestsByType('test');
      if (response.success) {
        setDataList(response.data);
      }
    } catch (err) {
      toast.error("Failed to sync lab inventory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const handleView = (test) => {
    setSelectedTest(test);
    setIsDetailOpen(true);
  };

  const handleEdit = (test) => {
    setSelectedTest(test);
    setIsDetailOpen(false); // Close detail if editing from there
    setIsEditOpen(true);
  };

  const handleSaveUpdate = async (updatedData) => {
    try {
      // await AdminAPI.updateTest(updatedData._id, updatedData);
      setDataList(prev => prev.map(t => t._id === updatedData._id ? updatedData : t));
      setIsEditOpen(false);
      toast.success("Test configuration updated");
    } catch (err) {
      toast.error("Failed to save changes");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure? This will remove the test from the database.")) {
      try {
        // await AdminAPI.deleteTest(id);
        setDataList(prev => prev.filter(t => t._id !== id));
        toast.success("Test deleted successfully");
      } catch (err) {
        toast.error("Delete operation failed");
      }
    }
  };

  const filteredData = dataList.filter(item =>
    (item.testName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.testCode || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-0 min-h-screen bg-slate-50/50 font-sans">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-4">
            <div className="p-3 rounded-2xl text-white shadow-lg shadow-emerald-200" style={{ backgroundColor: brandColor }}>
              <FaFlask size={24} />
            </div>
            Diagnostic Directory
          </h1>
          <p className="text-slate-500 font-medium mt-1">Manage individual lab tests and clinical parameters</p>
        </div>
        <button style={{ backgroundColor: brandColor }} className="px-8 py-4 rounded-2xl text-white font-bold shadow-xl shadow-emerald-100 hover:scale-[1.02] transition-all flex items-center gap-2">
          <FaPlus /> Register New Test
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-8 group">
        <FaSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
        <input
          type="text"
          placeholder="Search by Test Name, Code (e.g. CBC), or Category..."
          className="w-full pl-16 pr-6 py-5 rounded-[2rem] border-none shadow-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all bg-white text-slate-700 font-medium"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50/80 border-b border-slate-100">
            <tr>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Clinical Test</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Specimen</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Market Price</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              <th className="px-8 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredData.map((item) => (
              <tr key={item._id} className="hover:bg-emerald-50/30 transition-all group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:text-emerald-500 transition-colors"><FaVials size={18} /></div>
                    <div>
                      <p className="font-bold text-slate-700">{item.testName}</p>
                      <p className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded inline-block mt-1 uppercase">{item.testCode}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <p className="text-sm font-bold text-slate-600">{item.sampleType}</p>
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">{item.mainCategory}</p>
                </td>
                <td className="px-8 py-6">
                  <p className="text-sm font-black text-slate-800">₹{item.standardMRP}</p>
                </td>
                <td className="px-8 py-6">
                  {item.isActive ?
                    <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest"><FaCheckCircle /> Active</span> :
                    <span className="inline-flex items-center gap-1 text-[10px] font-black text-slate-400 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-widest"><FaTimesCircle /> Hidden</span>
                  }
                </td>
                <td className="px-8 py-6 text-right space-x-2">
                  <button onClick={() => handleView(item)} className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:bg-emerald-500 hover:text-white transition-all shadow-sm"><FaEye size={14} /></button>
                  <button onClick={() => handleEdit(item)} className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-800 hover:text-white transition-all shadow-sm"><FaEdit size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <TestDetailModal
        isOpen={isDetailOpen}
        test={selectedTest}
        onClose={() => setIsDetailOpen(false)}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <EditTestModal
        isOpen={isEditOpen}
        test={selectedTest}
        onClose={() => setIsEditOpen(false)}
        onSave={handleSaveUpdate}
      /> 
    </div>
  );
}

export default ManageLabTestComponent;