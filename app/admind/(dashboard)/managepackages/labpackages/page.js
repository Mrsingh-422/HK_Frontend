'use client';

import React, { useState, useEffect } from 'react';
import AdminAPI from '@/app/services/AdminAPI';
import {
    FaSearch, FaTimes, FaFlask, FaVials,
    FaTags, FaCheckCircle, FaTrashAlt, FaEdit,
    FaClinicMedical, FaCode, FaVenusMars, FaChevronLeft, FaChevronRight,
    FaFileAlt, FaQuestionCircle, FaClock, FaHeartbeat, FaInfoCircle, FaCalendarCheck
} from 'react-icons/fa';

export default function LabPackagesPage() {
    // Loading & Notification States
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

    // Data Listing States
    const [packages, setPackages] = useState([]);

    // Search & Pagination States
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // Modal Control States
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedPkg, setSelectedPkg] = useState(null);

    // Form State for Editing (API 4)
    const [editFormData, setEditFormData] = useState({
        standardMRP: '',
        reportTime: '',
        category: '',
        shortDescription: ''
    });

    // Debounce search input to limit API calls on active typing
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 400);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    // Fetch packages based on search query status
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

    // API Call 1: Paginated List (When search query is empty)
    const fetchPaginatedResults = async (page) => {
        setLoading(true);
        try {
            const response = await AdminAPI.getPaginatedMasterPackages(page);
            if (response.success) {
                setPackages(response.data || []);
                setCurrentPage(response.page || 1);
                setTotalPages(response.totalPages || 1);
                setTotalItems(response.total || 0);
            }
        } catch (err) {
            console.error("Failed to load paginated master packages:", err);
        } finally {
            setLoading(false);
        }
    };

    // API Call 2: Filter/Search-Based List (When typing in search bar)
    const fetchFilteredResults = async (searchQuery) => {
        setLoading(true);
        try {
            const response = await AdminAPI.getFilteredMasterPackages({ search: searchQuery });
            if (response.success) {
                setPackages(response.data || []);
                // Reset pagination parameters during search queries
                setCurrentPage(1);
                setTotalPages(1);
                setTotalItems(response.data?.length || 0);
            }
        } catch (err) {
            console.error("Failed to load filtered master packages:", err);
        } finally {
            setLoading(false);
        }
    };

    // API Call 3: Delete Master Package
    const handleDelete = async (id, name) => {
        if (!window.confirm(`Are you sure you want to permanently delete the master package "${name}"?`)) return;
        setLoading(true);
        try {
            const response = await AdminAPI.deleteMasterPackage(id);
            if (response.success) {
                showNotification(response.message || "Package deleted successfully.", "success");
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

    // Setup Edit Form Data (API 4 Preparation)
    const handleOpenEdit = (e, pkg) => {
        e.stopPropagation(); // Avoid triggering row details click
        setSelectedPkg(pkg);
        setEditFormData({
            standardMRP: pkg.standardMRP || '',
            reportTime: pkg.reportTime || '',
            category: pkg.category || '',
            shortDescription: pkg.shortDescription || ''
        });
        setIsEditModalOpen(true);
    };

    // API Call 4: Edit Master Package Submission
    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (!selectedPkg?._id) return;

        setActionLoading(true);
        try {
            const payload = {
                standardMRP: Number(editFormData.standardMRP),
                reportTime: editFormData.reportTime,
                category: editFormData.category,
                shortDescription: editFormData.shortDescription
            };
            const response = await AdminAPI.editMasterPackage(selectedPkg._id, payload);
            if (response.success) {
                showNotification("Master package updated successfully.", "success");
                setIsEditModalOpen(false);
                // Refresh active list view
                if (debouncedSearch) {
                    fetchFilteredResults(debouncedSearch);
                } else {
                    fetchPaginatedResults(currentPage);
                }
            }
        } catch (err) {
            showNotification(err.response?.data?.message || "Failed to update package details.", "error");
        } finally {
            setActionLoading(false);
        }
    };

    const handleOpenDetails = (pkg) => {
        setSelectedPkg(pkg);
        setIsDetailsModalOpen(true);
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
                {/* Top Summary Metrics Panel */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
                    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Active Packages</p>
                        <p className="mt-1 text-3xl font-black text-gray-800">{totalItems}</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Current Page View</p>
                        <p className="mt-1 text-3xl font-black text-gray-800">{currentPage} / {totalPages}</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Database Status</p>
                        <div className="mt-2 text-sm font-semibold flex items-center">
                            {loading ? (
                                <span className="text-blue-600 flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4 text-[#08B36A]" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Syncing database...
                                </span>
                            ) : (
                                <span className="text-[#08B36A] flex items-center">
                                    <span className="h-2.5 w-2.5 rounded-full bg-[#08B36A] mr-2"></span>
                                    Active / Connected
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- TABLE CARD --- */}
                <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">

                    {/* Table Header & Search Bar */}
                    <div className="p-6 border-b border-slate-50 bg-white flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="relative w-full max-w-md group">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#08B36A] transition-colors" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search master packages by name..."
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#08B36A]/20 transition-all font-medium text-slate-800"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                                    <th className="p-6 w-16">Sr.No</th>
                                    <th className="p-6 w-16 text-center">Preview</th>
                                    <th className="p-6">Package Name</th>
                                    <th className="p-6">Category Domain</th>
                                    <th className="p-6 text-center">Included Tests</th>
                                    <th className="p-6">Base Cost</th>
                                    <th className="p-6 text-center">Status</th>
                                    <th className="p-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {packages.length > 0 ? (
                                    packages.map((pkg, index) => (
                                        <tr key={pkg._id} className="group hover:bg-slate-50/80 cursor-pointer transition-all" onClick={() => handleOpenDetails(pkg)}>
                                            <td className="p-6 text-sm font-bold text-slate-400">
                                                {debouncedSearch ? index + 1 : (currentPage - 1) * 10 + (index + 1)}
                                            </td>
                                            <td className="p-6">
                                                <div className="w-12 h-12 rounded-xl bg-[#e6f7eb] text-[#08B36A] flex items-center justify-center border border-slate-100 shadow-sm shrink-0">
                                                    <FaHeartbeat className="text-lg" />
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <div>
                                                    <p className="text-sm font-black text-slate-800 tracking-tight">{pkg.packageName}</p>
                                                    <p className="text-[11px] text-slate-400 font-bold uppercase mt-0.5 truncate max-w-xs">{pkg.shortDescription || "No short details provided"}</p>
                                                </div>
                                            </td>
                                            <td className="p-6 text-sm font-bold text-slate-600">
                                                <div className="flex items-center gap-2">
                                                    <FaClinicMedical className="text-slate-300 group-hover:text-[#08B36A] transition-colors" size={14} />
                                                    {pkg.category || "Full Body"}
                                                </div>
                                            </td>
                                            <td className="p-6 text-center text-sm font-bold text-slate-600">
                                                <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                                                    {pkg.tests?.length || 0} Tests
                                                </span>
                                            </td>
                                            <td className="p-6 text-sm font-black text-[#08B36A]">₹{pkg.standardMRP || 0}</td>
                                            <td className="p-6 text-center">
                                                <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${pkg.isActive ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-slate-100 text-slate-400'}`}>
                                                    {pkg.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="p-6 text-right space-x-3" onClick={(e) => e.stopPropagation()}>
                                                <button onClick={(e) => handleOpenEdit(e, pkg)} className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-[#08B36A] hover:border-green-200 transition-all shadow-sm">
                                                    <FaEdit size={14} />
                                                </button>
                                                <button onClick={() => handleDelete(pkg._id, pkg.packageName)} className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-red-500 hover:border-red-200 transition-all shadow-sm">
                                                    <FaTrashAlt size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="p-20 text-center text-slate-300 font-bold uppercase tracking-widest text-xs">
                                            No matching records found in master packages catalog
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
                                Showing entries on page {currentPage} of {totalPages} ({totalItems} total packages)
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

            {/* --- MASTER PACKAGE DETAILS MODAL --- */}
            {isDetailsModalOpen && selectedPkg && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={() => setIsDetailsModalOpen(false)}></div>
                    <div className="relative bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">

                        {/* Header section with color profile backdrop */}
                        <div className="bg-[#e6f7eb] p-10 border-b border-slate-100 relative shrink-0">
                            <button onClick={() => setIsDetailsModalOpen(false)} className="absolute top-6 right-6 p-2 bg-white rounded-full text-slate-400 hover:text-slate-600 transition-all shadow-xs outline-none">
                                <FaTimes size={18} />
                            </button>
                            <div className="flex items-center gap-5">
                                <div className="w-16 h-16 rounded-2xl bg-white text-[#08B36A] flex items-center justify-center shadow-md">
                                    <FaHeartbeat className="text-2xl" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-gray-800 leading-tight">{selectedPkg.packageName}</h3>
                                    <p className="text-emerald-700 font-bold text-[10px] uppercase tracking-widest mt-1">Catalog ID: {selectedPkg._id}</p>
                                </div>
                            </div>
                        </div>

                        {/* Scrollable Modal Content */}
                        <div className="p-8 space-y-6 overflow-y-auto">

                            {/* Metrics Grid */}
                            <div className="grid grid-cols-2 gap-6 border-b pb-5">
                                <ModalInfo icon={<FaTags />} label="Package MRP" val={`₹${selectedPkg.standardMRP || 0}`} color="text-[#08B36A]" />
                                <ModalInfo icon={<FaClock />} label="Report Time" val={selectedPkg.reportTime || "24 Hours"} />
                                <ModalInfo icon={<FaVenusMars />} label="Target Gender" val={selectedPkg.gender || "Both"} />
                                <ModalInfo icon={<FaCalendarCheck />} label="Fasting Required" val={selectedPkg.isFastingRequired ? `Yes (${selectedPkg.fastingDuration || '12 Hours'})` : "No"} />
                            </div>

                            {/* Description block */}
                            <div className="space-y-2">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description Details</h4>
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                                    <p className="text-xs font-bold text-slate-700 leading-relaxed italic">
                                        "{selectedPkg.shortDescription || "No basic short description available."}"
                                    </p>
                                    {selectedPkg.longDescription && (
                                        <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                                            {selectedPkg.longDescription}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Nested Tests List */}
                            {selectedPkg.tests && selectedPkg.tests.length > 0 && (
                                <div className="space-y-3">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Populated Internal Tests ({selectedPkg.tests.length})</h4>
                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                        {selectedPkg.tests.map((test, index) => (
                                            <div key={test._id || index} className="flex justify-between items-center p-3 bg-[#fafafa] border border-slate-100 rounded-xl">
                                                <div>
                                                    <p className="text-xs font-bold text-slate-800">{test.testName}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{test.sampleType || "Blood"} | {test.mainCategory || "Pathology"}</p>
                                                </div>
                                                <span className="text-xs font-black text-[#08B36A]">₹{test.standardMRP || 0}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* FAQs from schema */}
                            {selectedPkg.faqs && selectedPkg.faqs.length > 0 && (
                                <div className="space-y-3 pt-2">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Frequently Asked Questions</h4>
                                    <div className="space-y-3">
                                        {selectedPkg.faqs.map((faq, idx) => (
                                            <div key={idx} className="space-y-1">
                                                <p className="text-xs font-bold text-slate-800 flex items-start gap-2">
                                                    <FaQuestionCircle size={12} className="text-[#08B36A] mt-0.5 shrink-0" />
                                                    {faq.question}
                                                </p>
                                                <p className="text-xs text-slate-500 leading-relaxed font-semibold pl-5">{faq.answer}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Status Bar */}
                            <div className="flex items-center gap-2 justify-center py-2 bg-emerald-50 rounded-2xl border border-emerald-100">
                                <FaCheckCircle className="text-[#08B36A]" size={14} />
                                <span className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">
                                    Verified & {selectedPkg.isActive ? 'Active' : 'Inactive'} Package Status
                                </span>
                            </div>
                        </div>

                        <div className="px-8 pb-8 shrink-0">
                            <button
                                onClick={() => setIsDetailsModalOpen(false)}
                                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-slate-800 transition-all active:scale-[0.98]"
                            >
                                Close Summary
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- EDIT / MODIFY MODAL (API 4) --- */}
            {isEditModalOpen && selectedPkg && (
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
                                    <h3 className="text-base font-black text-gray-800 leading-tight">Edit Master Package Specs</h3>
                                    <p className="text-emerald-700 font-bold text-[10px] uppercase tracking-widest mt-0.5">{selectedPkg.packageName}</p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Form Body */}
                        <form onSubmit={handleEditSubmit} className="p-8 space-y-5 overflow-y-auto max-h-[70vh]">

                            {/* Standard MRP */}
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">Standard Package Price (₹) *</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <FaTags className="text-gray-400 text-xs" />
                                    </div>
                                    <input
                                        type="number"
                                        required
                                        value={editFormData.standardMRP}
                                        onChange={(e) => setEditFormData({ ...editFormData, standardMRP: e.target.value })}
                                        placeholder="e.g. 2200"
                                        className="w-full pl-10 pr-4 py-3.5 bg-slate-50 rounded-2xl border border-slate-200 focus:border-[#08B36A] focus:ring-1 focus:ring-[#08B36A]/20 outline-none transition-all text-sm font-semibold text-slate-800"
                                    />
                                </div>
                            </div>

                            {/* Report Time */}
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">Report Generation Time *</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <FaClock className="text-gray-400 text-xs" />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        value={editFormData.reportTime}
                                        onChange={(e) => setEditFormData({ ...editFormData, reportTime: e.target.value })}
                                        placeholder="e.g. 12 Hours"
                                        className="w-full pl-10 pr-4 py-3.5 bg-slate-50 rounded-2xl border border-slate-200 focus:border-[#08B36A] focus:ring-1 focus:ring-[#08B36A]/20 outline-none transition-all text-sm font-semibold text-slate-800"
                                    />
                                </div>
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">Category Group *</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <FaClinicMedical className="text-gray-400 text-xs" />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        value={editFormData.category}
                                        onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                                        placeholder="e.g. Full Body"
                                        className="w-full pl-10 pr-4 py-3.5 bg-slate-50 rounded-2xl border border-slate-200 focus:border-[#08B36A] focus:ring-1 focus:ring-[#08B36A]/20 outline-none transition-all text-sm font-semibold text-slate-800"
                                    />
                                </div>
                            </div>

                            {/* Short Description */}
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">Short Description</label>
                                <textarea
                                    rows="3"
                                    value={editFormData.shortDescription}
                                    onChange={(e) => setEditFormData({ ...editFormData, shortDescription: e.target.value })}
                                    placeholder="e.g. Comprehensive full body checkup"
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
                                    disabled={actionLoading}
                                    className="flex-1 py-3.5 bg-[#08B36A] hover:bg-[#069356] disabled:opacity-45 text-white rounded-2xl text-xs font-bold shadow-md shadow-green-100 transition-all"
                                >
                                    {actionLoading ? "Saving Changes..." : "Update Master details"}
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