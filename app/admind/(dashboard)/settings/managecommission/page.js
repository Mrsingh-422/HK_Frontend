"use client";

import React, { useState, useMemo } from 'react';
import { 
  Building2, Settings, ChevronUp, ChevronDown, 
  Search, X, Save, ArrowLeft, MoreHorizontal 
} from 'lucide-react';

// --- Initial Data ---
const INITIAL_DATA = [
  { id: 1, commission: 10, vendorType: 'PHARMACY', created: '2021-12-08 11:03:15', updated: '2026-03-27 05:15:04' },
  { id: 2, commission: 10, vendorType: 'LAB', created: '2021-12-27 14:06:04', updated: '2026-03-27 05:15:04' },
  { id: 3, commission: 10, vendorType: 'NURSE', created: '2022-01-03 17:07:31', updated: '2026-03-27 05:15:04' },
  { id: 4, commission: 19, vendorType: 'DOCTOR', created: '2022-01-03 17:07:31', updated: '2026-03-27 05:15:04' },
  { id: 5, commission: 15, vendorType: 'HOSPITAL VENDOR', created: '2022-01-03 17:07:31', updated: '2026-03-27 05:15:04' },
 
];

export default function CommissionSettingsPage() {
  // --- Main State ---
  const [data, setData] = useState(INITIAL_DATA);
  const [searchTerm, setSearchTerm] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState(null);
  
  // --- Modal State ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempCommissions, setTempCommissions] = useState({});

  // Initialize Modal with current data values
  const openSettings = () => {
    const currentVals = {};
    data.forEach(item => {
      currentVals[item.id] = item.commission;
    });
    setTempCommissions(currentVals);
    setIsModalOpen(true);
  };

  const handleSaveCommissions = () => {
    const updatedData = data.map(item => ({
      ...item,
      commission: tempCommissions[item.id] || item.commission,
      updated: new Date().toLocaleString() // Updates the "Updated" timestamp
    }));
    setData(updatedData);
    setIsModalOpen(false);
  };

  // --- Sorting & Filtering Logic ---
  const sortedAndFilteredData = useMemo(() => {
    let result = [...data].filter(item => 
      item.vendorType.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortConfig !== null) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [data, searchTerm, sortConfig]);

  // --- Pagination Logic ---
  const totalPages = Math.max(1, Math.ceil(sortedAndFilteredData.length / entriesPerPage));
  const startIndex = (currentPage - 1) * entriesPerPage;
  const currentRows = sortedAndFilteredData.slice(startIndex, startIndex + entriesPerPage);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getBadgeStyle = (type) => {
    if (type === 'NO RECORDS...') return 'bg-red-50 text-red-600 border-red-100';
    return 'bg-emerald-50 text-emerald-600 border-emerald-100';
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-12 font-sans text-slate-700">
      
      {/* --- MODAL: Show all commissions for all vendors --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                  <Settings className="text-emerald-500" size={20} /> Commission Settings
                </h3>
                <p className="text-xs text-slate-500 mt-1">Update percentages for each vendor type individually.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-100 rounded-full">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
              {data.map((vendor) => (
                <div key={vendor.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-tight">Vendor ID: #{vendor.id}</span>
                    <span className="text-sm font-bold text-slate-700">{vendor.vendorType}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm focus-within:ring-2 focus-within:ring-emerald-500 transition-all">
                    <input 
                      type="number" 
                      value={tempCommissions[vendor.id]} 
                      onChange={(e) => setTempCommissions({...tempCommissions, [vendor.id]: e.target.value})}
                      className="w-12 text-right text-sm font-bold text-slate-800 focus:outline-none"
                    />
                    <span className="text-slate-400 font-bold text-sm">%</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 bg-slate-50 flex gap-3">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 bg-white border border-slate-200 py-3 rounded-xl text-sm font-bold hover:bg-slate-100 transition-all text-slate-600">Cancel</button>
              <button onClick={handleSaveCommissions} className="flex-1 bg-emerald-500 text-white py-3 rounded-xl text-sm font-bold hover:bg-emerald-600 flex items-center justify-center gap-2 shadow-lg shadow-emerald-100 transition-all active:scale-95">
                <Save size={16} /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- DASHBOARD UI --- */}
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden transition-all duration-500">
          
          {/* Header */}
          <div className="bg-slate-50/50 px-8 py-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-5">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 text-emerald-500">
                <Building2 size={24} />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">Manage Commissions</h1>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mt-1">
                  Show 
                  <select 
                    value={entriesPerPage}
                    onChange={(e) => { setEntriesPerPage(Number(e.target.value)); setCurrentPage(1); }}
                    className="bg-white border rounded px-1 py-0.5 focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    {[5, 10, 25, 50].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                  records per page
                </div>
              </div>
            </div>

            <div className="flex gap-3 w-full md:w-auto">
              <button onClick={openSettings} className="flex-1 md:flex-none bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-2">
                <Settings size={16} /> COMMISSION SETTINGS
              </button>
              <button className="flex-1 md:flex-none bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-6 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 uppercase">
                <ArrowLeft size={16} /> Go Back
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="px-8 py-6 bg-white">
            <div className="relative max-w-md mx-auto group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
              <input
                type="text"
                placeholder="Search by vendor type (e.g. Pharmacy, Doctor)..."
                className="w-full bg-slate-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto px-4 pb-4">
            <table className="w-full border-separate border-spacing-y-2 text-left">
              <thead>
                <tr className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">
                  {[
                    { label: 'S No.', key: 'id' },
                    { label: 'Commission', key: 'commission' },
                    { label: 'Vendor Type', key: 'vendorType' },
                    { label: 'Created', key: 'created' },
                    { label: 'Updated', key: 'updated' }
                  ].map((col) => (
                    <th key={col.label} onClick={() => requestSort(col.key)} className="px-6 py-3 cursor-pointer hover:text-emerald-500 transition-colors group/th">
                      <div className="flex items-center gap-2">
                        {col.label}
                        <div className="flex flex-col opacity-20 group-hover/th:opacity-100 transition-opacity">
                          <ChevronUp size={10} className={sortConfig?.key === col.key && sortConfig.direction === 'asc' ? 'text-emerald-500 opacity-100' : ''} />
                          <ChevronDown size={10} className={sortConfig?.key === col.key && sortConfig.direction === 'desc' ? 'text-emerald-500 opacity-100' : ''} />
                        </div>
                      </div>
                    </th>
                  ))}
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentRows.map((row) => (
                  <tr key={row.id} className="group transition-all hover:translate-x-1">
                    <td className="bg-slate-50/50 group-hover:bg-slate-50 border-y border-l border-transparent group-hover:border-slate-100 py-4 px-6 text-sm font-medium rounded-l-2xl text-slate-500">{row.id}</td>
                    <td className="bg-slate-50/50 group-hover:bg-slate-50 border-y border-transparent group-hover:border-slate-100 py-4 px-6 text-sm font-bold text-slate-800">{row.commission}%</td>
                    <td className="bg-slate-50/50 group-hover:bg-slate-50 border-y border-transparent group-hover:border-slate-100 py-4 px-6">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-extrabold border ${getBadgeStyle(row.vendorType)} shadow-sm inline-block tracking-wider`}>
                        {row.vendorType}
                      </span>
                    </td>
                    <td className="bg-slate-50/50 group-hover:bg-slate-50 border-y border-transparent group-hover:border-slate-100 py-4 px-6 text-xs text-slate-400 font-medium">{row.created}</td>
                    <td className="bg-slate-50/50 group-hover:bg-slate-50 border-y border-transparent group-hover:border-slate-100 py-4 px-6 text-xs text-slate-400 font-medium">{row.updated}</td>
                    <td className="bg-slate-50/50 group-hover:bg-slate-50 border-y border-r border-transparent group-hover:border-slate-100 py-4 px-6 text-right rounded-r-2xl">
                      <button className="p-2 text-slate-300 hover:text-emerald-500 transition-colors hover:bg-white rounded-lg shadow-sm border border-transparent hover:border-slate-100">
                        <MoreHorizontal size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="bg-slate-50/50 px-8 py-6 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Showing <span className="text-slate-800">{sortedAndFilteredData.length > 0 ? startIndex + 1 : 0}</span> to <span className="text-slate-800">{Math.min(startIndex + entriesPerPage, sortedAndFilteredData.length)}</span> of {sortedAndFilteredData.length} entries
            </p>

            <div className="flex items-center gap-1 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
              <button 
                onClick={() => setCurrentPage(1)} 
                disabled={currentPage === 1}
                className="px-4 py-2 text-[10px] font-bold uppercase text-slate-400 hover:text-emerald-500 disabled:opacity-20 disabled:pointer-events-none transition-all"
              >
                First
              </button>
              <div className="h-4 w-[1px] bg-slate-100 mx-1" />
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                    currentPage === i + 1 
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200 scale-110 ring-4 ring-emerald-50' 
                    : 'text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <div className="h-4 w-[1px] bg-slate-100 mx-1" />
              <button 
                onClick={() => setCurrentPage(totalPages)} 
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-[10px] font-bold uppercase text-slate-400 hover:text-emerald-500 disabled:opacity-20 disabled:pointer-events-none transition-all"
              >
                Last
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}