'use client';

import React, { useState, useEffect } from 'react';
import AdminAPI from '@/app/services/AdminAPI';
import {
  FaSearch, FaTimes, FaFlask, FaVials,
  FaTags, FaCheckCircle, FaTrashAlt, FaEdit,
  FaClinicMedical, FaCode, FaVenusMars, FaChevronLeft, FaChevronRight,
  FaFileAlt, FaQuestionCircle, FaExclamationTriangle
} from 'react-icons/fa';

export default function LabTestPackages() {
  // Loading & Notification States
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  // Data Listing States
  const [tests, setTests] = useState([]);

  // Search & Pagination States
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modal Control States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);

  // Form State for Editing (API 1)
  const [editFormData, setEditFormData] = useState({
    standardMRP: '',
    pretestPreparation: '',
    category: ''
  });

  // Debounce search input to limit API calls on active typing
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch tests based on search query status
  useEffect(() => {
    if (debouncedSearch) {
      fetchFilteredResults(debouncedSearch);
    } else {
      fetchPaginatedResults(currentPage);
    }
  }, [currentPage, debouncedSearch]);

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 4000);
  };

  // API Call: Paginated List (When search query is empty)
  const fetchPaginatedResults = async (page) => {
    setLoading(true);
    try {
      const response = await AdminAPI.getPaginatedMasterTests(page);
      if (response.success) {
        setTests(response.data || []);
        setCurrentPage(response.page || 1);
        setTotalPages(response.totalPages || 1);
        setTotalItems(response.total || 0);
      }
    } catch (err) {
      console.error("Failed to load paginated master tests:", err);
    } finally {
      setLoading(false);
    }
  };

  // API Call: Filter/Search-Based List (When typing in the search bar)
  const fetchFilteredResults = async (searchQuery) => {
    setLoading(true);
    try {
      const response = await AdminAPI.getFilteredMasterTests({ search: searchQuery });
      if (response.success) {
        setTests(response.data || []);
        setCurrentPage(1);
        setTotalPages(1);
        setTotalItems(response.data?.length || 0);
      }
    } catch (err) {
      console.error("Failed to load filtered master tests:", err);
    } finally {
      setLoading(false);
    }
  };

  // Manually Delete Master Test (API 3)
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete the master test "${name}"?`)) return;
    setLoading(true);
    try {
      const response = await AdminAPI.deleteMasterTest(id);
      if (response.success) {
        showNotification(response.message || "Test deleted successfully.", "success");
        // Reload active table view
        if (debouncedSearch) {
          fetchFilteredResults(debouncedSearch);
        } else {
          fetchPaginatedResults(currentPage);
        }
      }
    } catch (err) {
      showNotification(err.response?.data?.message || "Deletion failed. Try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Setup Edit Form Data (API 1 Preparation)
  const handleOpenEdit = (e, test) => {
    e.stopPropagation(); // Avoid triggering details modal row click
    setSelectedTest(test);
    setEditFormData({
      standardMRP: test.standardMRP || '',
      pretestPreparation: test.pretestPreparation || '',
      category: test.category || ''
    });
    setIsEditModalOpen(true);
  };

  // Manually Edit Master Test (API 1 Submission)
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTest?._id) return;

    setLoading(true);
    try {
      const payload = {
        standardMRP: Number(editFormData.standardMRP),
        pretestPreparation: editFormData.pretestPreparation,
        category: editFormData.category
      };
      const response = await AdminAPI.editMasterTest(selectedTest._id, payload);
      if (response.success) {
        showNotification("Master test updated successfully.", "success");
        setIsEditModalOpen(false);
        // Refresh active list view
        if (debouncedSearch) {
          fetchFilteredResults(debouncedSearch);
        } else {
          fetchPaginatedResults(currentPage);
        }
      }
    } catch (err) {
      showNotification(err.response?.data?.message || "Failed to update test details.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (test) => {
    setSelectedTest(test);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans text-slate-900">

      {/* Status Notification Alert Toast */}
      {notification.show && (
        <div className={`fixed top-5 right-5 z-[150] flex items-center p-4 rounded-xl shadow-lg border transition-all duration-300 max-w-sm ${notification.type === 'error'
            ? 'bg-red-50 border-red-200 text-red-800'
            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}>
          <div className="mr-3 font-semibold text-xs uppercase">
            {notification.type === 'error' ? 'Error' : 'Success'}
          </div>
          <div className="text-sm font-medium">{notification.message}</div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">

        {/* --- TABLE CARD --- */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">

          {/* Header & Search Bar */}
          <div className="p-6 border-b border-slate-50 bg-white flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="relative w-full max-w-md group">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#08B36A] transition-colors" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search master tests by name..."
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#08B36A]/20 transition-all font-medium text-slate-800"
              />
            </div>

            {loading && (
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-[#08B36A]" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Syncing database...
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                  <th className="p-6 w-16">Sr.No</th>
                  <th className="p-6 w-16 text-center">Preview</th>
                  <th className="p-6">Test Details</th>
                  <th className="p-6">Category Domain</th>
                  <th className="p-6">Test Code</th>
                  <th className="p-6">Base Cost</th>
                  <th className="p-6 text-center">Status</th>
                  <th className="p-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {tests.length > 0 ? (
                  tests.map((test, index) => (
                    <tr key={test._id} className="group hover:bg-slate-50/80 cursor-pointer transition-all" onClick={() => handleOpenModal(test)}>
                      <td className="p-6 text-sm font-bold text-slate-400">
                        {debouncedSearch ? index + 1 : (currentPage - 1) * 10 + (index + 1)}
                      </td>
                      <td className="p-6">
                        <div className="w-12 h-12 rounded-xl bg-[#e6f7eb] text-[#08B36A] flex items-center justify-center border border-slate-100 shadow-sm shrink-0">
                          <FaFlask className="text-lg" />
                        </div>
                      </td>
                      <td className="p-6">
                        <div>
                          <p className="text-sm font-black text-slate-800 tracking-tight">{test.testName}</p>
                          <p className="text-[11px] text-slate-400 font-bold uppercase mt-0.5">{test.sampleType || "Blood"}</p>
                        </div>
                      </td>
                      <td className="p-6 text-sm font-bold text-slate-600">
                        <div className="flex items-center gap-2">
                          <FaClinicMedical className="text-slate-300 group-hover:text-[#08B36A] transition-colors" size={14} />
                          {test.mainCategory || "Pathology"}
                        </div>
                      </td>
                      <td className="p-6 text-sm font-mono font-bold text-slate-500">
                        {test.testCode || "LPL-GEN"}
                      </td>
                      <td className="p-6 text-sm font-black text-[#08B36A]">₹{test.standardMRP || 0}</td>
                      <td className="p-6 text-center">
                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${test.isActive ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-slate-100 text-slate-400'}`}>
                          {test.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-6 text-right space-x-3" onClick={(e) => e.stopPropagation()}>
                        <button onClick={(e) => handleOpenEdit(e, test)} className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-[#08B36A] hover:border-green-200 transition-all shadow-sm">
                          <FaEdit size={14} />
                        </button>
                        <button onClick={() => handleDelete(test._id, test.testName)} className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-red-500 hover:border-red-200 transition-all shadow-sm">
                          <FaTrashAlt size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="p-20 text-center text-slate-300 font-bold uppercase tracking-widest text-xs">
                      No matching records found in catalog
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination summary */}
          {!debouncedSearch && totalPages > 1 && (
            <div className="p-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white">
              <p className="text-[13px] text-gray-500 font-medium">
                Showing entries on page {currentPage} of {totalPages} ({totalItems} total tests)
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(1)}
                  className="px-3 py-1.5 text-[11px] font-bold text-slate-400 hover:text-slate-700 disabled:opacity-30 transition-colors"
                >
                  FIRST
                </button>
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="p-2 border rounded-lg text-slate-400 hover:bg-slate-50 disabled:opacity-30"
                >
                  <FaChevronLeft size={10} />
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#08B36A] text-white text-[12px] font-bold shadow-md">{currentPage}</button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className="p-2 border rounded-lg text-slate-400 hover:bg-slate-50 disabled:opacity-30"
                >
                  <FaChevronRight size={10} />
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(totalPages)}
                  className="px-3 py-1.5 text-[11px] font-bold text-slate-400 hover:text-slate-700 disabled:opacity-30 transition-colors"
                >
                  LAST
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* --- MASTER TEST DETAILS MODAL --- */}
      {isModalOpen && selectedTest && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">

            {/* Header section with color profile backdrop */}
            <div className="bg-[#e6f7eb] p-10 border-b border-slate-100 relative shrink-0">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 p-2 bg-white rounded-full text-slate-400 hover:text-slate-600 transition-all shadow-xs outline-none">
                <FaTimes size={18} />
              </button>
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-white text-[#08B36A] flex items-center justify-center shadow-md">
                  <FaFlask className="text-2xl" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-800 leading-tight">{selectedTest.testName}</h3>
                  <p className="text-emerald-700 font-bold text-[10px] uppercase tracking-widest mt-1">Catalog ID: {selectedTest._id}</p>
                </div>
              </div>
            </div>

            {/* Scrollable Modal Content */}
            <div className="p-8 space-y-6 overflow-y-auto">
              <div className="grid grid-cols-2 gap-6 border-b pb-5">
                <ModalInfo icon={<FaTags />} label="Standard Price" val={`₹${selectedTest.standardMRP || 0}`} color="text-[#08B36A]" />
                <ModalInfo icon={<FaCode />} label="Internal Code" val={selectedTest.testCode || "LPL-GEN"} />
                <ModalInfo icon={<FaVials />} label="Sample Type" val={selectedTest.sampleType || "Blood"} />
                <ModalInfo icon={<FaVenusMars />} label="Target Gender" val={selectedTest.gender || "Both"} />
              </div>

              {/* Pretest Instructions */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pretest Requirements</h4>
                <p className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-100 rounded-2xl p-4 leading-relaxed italic">
                  {selectedTest.pretestPreparation || "No special preparation required."}
                </p>
              </div>

              {/* Stored Parameters */}
              {selectedTest.parameters && selectedTest.parameters.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Included Clinical Parameters ({selectedTest.parameters.length})</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTest.parameters.map((param, index) => (
                      <span key={index} className="inline-block px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold">
                        {param}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Detailed descriptions from schema */}
              {selectedTest.detailedDescription && selectedTest.detailedDescription.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Test Overview</h4>
                  {selectedTest.detailedDescription.map((desc, idx) => (
                    <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
                      <p className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                        <FaFileAlt className="text-indigo-500" size={11} /> {desc.sectionTitle}
                      </p>
                      <p className="text-xs text-slate-500 leading-relaxed font-medium">{desc.sectionContent}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* FAQs from schema */}
              {selectedTest.faqs && selectedTest.faqs.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Frequently Asked Questions</h4>
                  <div className="space-y-3">
                    {selectedTest.faqs.map((faq, idx) => (
                      <div key={idx} className="space-y-1">
                        <p className="text-xs font-bold text-slate-800 flex items-start gap-1.5 leading-snug">
                          <FaQuestionCircle className="text-emerald-500 mt-0.5 shrink-0" size={12} /> {faq.question}
                        </p>
                        <p className="text-xs text-slate-500 pl-4 font-semibold leading-relaxed">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 justify-center py-2 bg-emerald-50 rounded-2xl border border-emerald-100 mt-2">
                <FaCheckCircle className="text-[#08B36A]" size={14} />
                <span className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">
                  Listing Status: Verified & {selectedTest.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <div className="px-8 pb-8 shrink-0">
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-slate-800 transition-all active:scale-[0.98]"
              >
                Close Summary
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- EDIT / MODIFY MODAL (API 1) --- */}
      {isEditModalOpen && selectedTest && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={() => setIsEditModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">

            {/* Modal Header */}
            <div className="bg-[#e6f7eb] p-6 border-b border-slate-100 relative shrink-0">
              <button onClick={() => setIsEditModalOpen(false)} className="absolute top-5 right-6 p-2 bg-white rounded-full text-slate-400 hover:text-slate-600 transition-all shadow-xs outline-none">
                <FaTimes size={16} />
              </button>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white text-[#08B36A] flex items-center justify-center shadow-md">
                  <FaEdit className="text-xl" />
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-800 leading-tight">Edit Master Test Specs</h3>
                  <p className="text-emerald-700 font-bold text-[10px] uppercase tracking-widest mt-0.5">{selectedTest.testName}</p>
                </div>
              </div>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleEditSubmit} className="p-8 space-y-5 overflow-y-auto max-h-[70vh]">

              {/* Standard MRP */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">Standard MRP (Base Price, ₹) *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaTags className="text-gray-400 text-xs" />
                  </div>
                  <input
                    type="number"
                    required
                    value={editFormData.standardMRP}
                    onChange={(e) => setEditFormData({ ...editFormData, standardMRP: e.target.value })}
                    placeholder="e.g. 499"
                    className="w-full pl-10 pr-4 py-3.5 bg-slate-50 rounded-2xl border border-slate-200 focus:border-[#08B36A] focus:ring-1 focus:ring-[#08B36A]/20 outline-none transition-all text-sm font-semibold text-slate-800"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">Assigned Diagnostic Category *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaClinicMedical className="text-gray-400 text-xs" />
                  </div>
                  <input
                    type="text"
                    required
                    value={editFormData.category}
                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                    placeholder="e.g. Fever & Immunity"
                    className="w-full pl-10 pr-4 py-3.5 bg-slate-50 rounded-2xl border border-slate-200 focus:border-[#08B36A] focus:ring-1 focus:ring-[#08B36A]/20 outline-none transition-all text-sm font-semibold text-slate-800"
                  />
                </div>
              </div>

              {/* Pre-test Preparation */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">Required Pretest Preparation</label>
                <textarea
                  rows="3"
                  value={editFormData.pretestPreparation}
                  onChange={(e) => setEditFormData({ ...editFormData, pretestPreparation: e.target.value })}
                  placeholder="e.g. 12 hours fasting required"
                  className="w-full px-4 py-3 bg-slate-50 rounded-2xl border border-slate-200 focus:border-[#08B36A] focus:ring-1 focus:ring-[#08B36A]/20 outline-none transition-all text-sm font-semibold text-slate-800 resize-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-3.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-2xl text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3.5 bg-[#08B36A] hover:bg-[#069356] disabled:opacity-45 text-white rounded-2xl text-xs font-bold shadow-md shadow-green-100 transition-all"
                >
                  {loading ? "Saving Changes..." : "Update Master details"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// --- HELPER COMPONENT ---
function ModalInfo({ icon, label, val, color = "text-slate-700" }) {
  return (
    <div className="flex gap-4">
      <div className="text-[#08B36A] mt-1 opacity-60 shrink-0">{icon}</div>
      <div>
        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">{label}</p>
        <p className={`text-base font-black ${color} leading-none`}>{val}</p>
      </div>
    </div>
  )
}