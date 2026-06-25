'use client';

import React, { useState, useEffect } from 'react';
import AdminAPI from '@/app/services/AdminAPI';
import {
    FaPlus, FaTimes, FaArrowLeft, FaEdit, FaSearch,
    FaExclamationTriangle, FaInfoCircle, FaFlask, FaUpload,
    FaDatabase, FaListAlt, FaCogs, FaCheckCircle
} from 'react-icons/fa';

export default function Page() {
    // ==========================================
    // 🌟 LOADING & NOTIFICATION STATES
    // ==========================================
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

    // ==========================================
    // 🌟 DATA LISTING STATES
    // ==========================================
    const [templates, setTemplates] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // ==========================================
    // 🌟 CSV UPLOAD STATE
    // ==========================================
    const [csvFile, setCsvFile] = useState(null);

    // ==========================================
    // 🌟 MODAL CONTROL STATES
    // ==========================================
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(null);

    // ==========================================
    // 🌟 FORM STATES (API 8 & 9)
    // ==========================================
    const emptyFormState = {
        testName: '',
        parameters: [
            { name: '', unit: '', minRef: '', maxRef: '', method: '', machine: '', interpretation: '' }
        ]
    };
    const [formData, setFormData] = useState(emptyFormState);

    // Debounce search input to avoid database spamming
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 400);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    // Fetch Templates list on query or page change (API 1)
    useEffect(() => {
        fetchTemplates(currentPage, debouncedSearch);
    }, [currentPage, debouncedSearch]);

    const showNotification = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => {
            setNotification({ show: false, message: '', type: 'success' });
        }, 4000);
    };

    const fetchTemplates = async (page = 1, search = '') => {
        setLoading(true);
        try {
            const response = await AdminAPI.getReportTemplates({ page, limit: 10, search });
            if (response.success) {
                setTemplates(response.data || []);
                setCurrentPage(response.currentPage || 1);
                setTotalPages(response.totalPages || 1);
                setTotalItems(response.total || 0);
            }
        } catch (err) {
            showNotification(err.response?.data?.message || "Failed to fetch master list.", "error");
        } finally {
            setLoading(false);
        }
    };

    // Fetch Single Template Details (API 2)
    const handleOpenDetails = async (id) => {
        setLoading(true);
        try {
            const response = await AdminAPI.getReportTemplateDetails(id);
            if (response.success) {
                setSelectedTemplate(response.data);
                setIsDetailsModalOpen(true);
            }
        } catch (err) {
            showNotification(err.response?.data?.message || "Failed to fetch details.", "error");
        } finally {
            setLoading(false);
        }
    };

    // Handle CSV file selection
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setCsvFile(e.target.files[0]);
        }
    };

    // Bulk Upload (API 7)
    const handleBulkUpload = async (e) => {
        e.preventDefault();
        if (!csvFile) {
            showNotification("Please select a valid CSV file.", "error");
            return;
        }
        setLoading(true);
        try {
            const response = await AdminAPI.bulkUploadReportTemplates(csvFile);
            showNotification(response.message || "Bulk upload processed.", "success");
            setCsvFile(null);
            fetchTemplates(1, debouncedSearch);
        } catch (err) {
            showNotification(err.response?.data?.message || "Bulk upload failed.", "error");
        } finally {
            setLoading(false);
        }
    };

    // Dynamic Parameter Form Row Management
    const handleAddParameter = () => {
        setFormData(prev => ({
            ...prev,
            parameters: [
                ...prev.parameters,
                { name: '', unit: '', minRef: '', maxRef: '', method: '', machine: '', interpretation: '' }
            ]
        }));
    };

    const handleRemoveParameter = (index) => {
        if (formData.parameters.length === 1) {
            showNotification("Each template must have at least one parameter.", "error");
            return;
        }
        setFormData(prev => ({
            ...prev,
            parameters: prev.parameters.filter((_, i) => i !== index)
        }));
    };

    const handleParamChange = (index, field, value) => {
        setFormData(prev => {
            const updatedParams = [...prev.parameters];
            updatedParams[index][field] = value;
            return { ...prev, parameters: updatedParams };
        });
    };

    // Manually Create (API 8)
    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        if (!formData.testName.trim()) {
            showNotification("Test Name is required.", "error");
            return;
        }
        setLoading(true);
        try {
            const response = await AdminAPI.createReportTemplate(formData);
            if (response.success) {
                showNotification("Template created manually.", "success");
                setIsCreateModalOpen(false);
                setFormData(emptyFormState);
                fetchTemplates(1, debouncedSearch);
            }
        } catch (err) {
            showNotification(err.response?.data?.message || "Template creation failed.", "error");
        } finally {
            setLoading(false);
        }
    };

    // Setup Edit Form Data (API 2 -> API 9 Preparation)
    const handleOpenEdit = async (id) => {
        setLoading(true);
        try {
            const response = await AdminAPI.getReportTemplateDetails(id);
            if (response.success) {
                setSelectedTemplate(response.data);
                setFormData({
                    testName: response.data.testName,
                    parameters: response.data.parameters || []
                });
                setIsEditModalOpen(true);
            }
        } catch (err) {
            showNotification(err.response?.data?.message || "Failed to load edit payload.", "error");
        } finally {
            setLoading(false);
        }
    };

    // Manually Edit (API 9)
    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (!formData.testName.trim() || !selectedTemplate?._id) {
            showNotification("Required parameters missing.", "error");
            return;
        }
        setLoading(true);
        try {
            const response = await AdminAPI.editReportTemplate(selectedTemplate._id, formData);
            if (response.success) {
                showNotification("Template edited successfully.", "success");
                setIsEditModalOpen(false);
                setFormData(emptyFormState);
                fetchTemplates(currentPage, debouncedSearch);
            }
        } catch (err) {
            showNotification(err.response?.data?.message || "Modification failed.", "error");
        } finally {
            setLoading(false);
        }
    };

    const openDeleteModal = (template) => {
        setSelectedTemplate(template);
        setIsDeleteModalOpen(true);
    };

    // Manually Delete (API 10)
    const handleDeleteConfirm = async () => {
        if (!selectedTemplate?._id) return;
        setLoading(true);
        try {
            const response = await AdminAPI.deleteLabTestTemplate(selectedTemplate._id);
            if (response.success) {
                showNotification(response.message || "Template deleted.", "success");
                setIsDeleteModalOpen(false);
                setSelectedTemplate(null);
                fetchTemplates(1, debouncedSearch);
            }
        } catch (err) {
            showNotification(err.response?.data?.message || "Deletion failed.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full min-h-screen bg-[#F4F7F6] p-1 md:p-2 font-sans">

            {/* Dynamic Status Notification Alert Banner */}
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

            {/* Header Section */}
            <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 p-5 md:p-6 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="bg-[#e6f7eb] p-3 md:p-4 rounded-xl border border-[#08B36A]/20">
                        <FaFlask className="text-[#08B36A] text-xl md:text-2xl" />
                    </div>
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-gray-800 tracking-wide">Lab Tests Manager</h1>
                        <p className="text-[13px] text-gray-500 font-medium mt-0.5">Configure diagnostic standards and master report template schemas</p>
                    </div>
                </div>

                <div className="flex w-full md:w-auto items-center gap-3">
                    <button
                        onClick={() => { setFormData(emptyFormState); setIsCreateModalOpen(true); }}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-[#08B36A] hover:bg-[#069356] text-white text-[13px] font-bold rounded-xl shadow-[0_4px_12px_rgba(8,179,106,0.25)] transition-all hover:-translate-y-0.5"
                    >
                        <FaPlus size={12} /> Add Lab Template
                    </button>
                </div>
            </div>

            {/* Top Summary Metrics Panel */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
                <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 p-5">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Active Templates</p>
                    <p className="mt-1 text-3xl font-black text-gray-800">{totalItems}</p>
                </div>
                <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 p-5">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Current Page View</p>
                    <p className="mt-1 text-3xl font-black text-gray-800">{currentPage} / {totalPages}</p>
                </div>
                <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 p-5">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Database Status</p>
                    <div className="mt-2 text-sm font-semibold flex items-center">
                        {loading ? (
                            <span className="text-blue-600 flex items-center gap-2">
                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Syncing...
                            </span>
                        ) : (
                            <span className="text-[#08B36A] flex items-center">
                                <span className="h-2.5 w-2.5 rounded-full bg-[#08B36A] mr-2"></span>
                                Connected / Active
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Dashboard Content Grid */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left/Middle Content: Table Catalog */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100 overflow-hidden">

                    {/* Search Controls Header */}
                    <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50">
                        <div className="flex items-center gap-2 text-[13px] text-gray-600 font-medium">
                            Show
                            <select className="border border-gray-200 rounded-md px-2 py-1.5 outline-none focus:border-[#08B36A] bg-white cursor-pointer">
                                <option>10</option>
                                <option>25</option>
                                <option>50</option>
                            </select>
                            entries
                        </div>
                        <div className="relative w-full sm:w-auto">
                            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-[13px]" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search master templates..."
                                className="w-full sm:w-72 pl-9 pr-4 py-2.5 text-[13px] border border-gray-200 rounded-xl outline-none focus:border-[#08B36A] focus:ring-1 focus:ring-[#08B36A] transition-all bg-white shadow-sm"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white border-b border-gray-100 text-[13px] text-gray-500 font-bold tracking-wide">
                                    <th className="p-5">S No.</th>
                                    <th className="p-5">Report Test Title</th>
                                    <th className="p-5 text-center">Parameters Count</th>
                                    <th className="p-5 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-[14px] text-gray-700">
                                {templates.length > 0 ? (
                                    templates.map((template, index) => (
                                        <tr key={template._id} className="border-b border-gray-50 hover:bg-[#f8fcf9] transition-colors group">

                                            {/* Clickable Row Content Opens details (API 2) */}
                                            <td onClick={() => handleOpenDetails(template._id)} className="p-5 font-medium text-gray-500 cursor-pointer w-16">
                                                {(currentPage - 1) * 10 + (index + 1)}
                                            </td>
                                            <td onClick={() => handleOpenDetails(template._id)} className="p-5 font-bold text-gray-800 cursor-pointer group-hover:text-[#08B36A] transition-colors">
                                                {template.testName}
                                            </td>
                                            <td onClick={() => handleOpenDetails(template._id)} className="p-5 text-center cursor-pointer">
                                                <span className="inline-block px-3 py-1 bg-[#e6f7eb] text-[#08B36A] border border-[#08B36A]/20 text-[12px] font-bold rounded-full">
                                                    {template.parameters?.length || 0} variables
                                                </span>
                                            </td>

                                            {/* Action buttons (Manual Edit / Delete) */}
                                            <td className="p-5 text-center w-36">
                                                <div className="flex justify-center items-center gap-3">
                                                    <button onClick={() => handleOpenEdit(template._id)} className="text-[#f59e0b] hover:text-white bg-[#fffbeb] hover:bg-[#f59e0b] p-2 rounded-lg transition-all shadow-sm">
                                                        <FaEdit size={14} />
                                                    </button>
                                                    <button onClick={() => openDeleteModal(template)} className="text-red-500 hover:text-white hover:bg-red-500 bg-red-50 p-2 rounded-lg transition-all shadow-sm">
                                                        <FaTimes size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="p-8 text-center text-gray-400 font-medium text-[14px]">
                                            No report templates found in database.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="p-5 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white">
                            <p className="text-[13px] text-gray-500 font-medium">
                                Showing Page {currentPage} of {totalPages} ({totalItems} entries)
                            </p>
                            <div className="flex items-center gap-1">
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(1)}
                                    className="px-3 py-1.5 text-[12px] font-bold text-gray-400 hover:text-gray-700 disabled:opacity-30 transition-colors"
                                >
                                    FIRST
                                </button>
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    className="px-3 py-1.5 text-[12px] font-bold text-gray-400 hover:text-gray-700 disabled:opacity-30 transition-colors"
                                >
                                    PREVIOUS
                                </button>
                                <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#08B36A] text-white text-[12px] font-bold shadow-md">{currentPage}</button>
                                <button
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    className="px-3 py-1.5 text-[12px] font-bold text-gray-400 hover:text-gray-700 disabled:opacity-30 transition-colors"
                                >
                                    NEXT
                                </button>
                                <button
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(totalPages)}
                                    className="px-3 py-1.5 text-[12px] font-bold text-gray-400 hover:text-gray-700 disabled:opacity-30 transition-colors"
                                >
                                    LAST
                                </button>
                            </div>
                        </div>
                    )}

                </div>

                {/* Right Content: Bulk CSV Import card */}
                <div className="bg-white border border-gray-100 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] p-6 flex flex-col justify-between">
                    <div>
                        <h3 className="text-[16px] font-bold text-gray-800 flex items-center gap-2 mb-2">
                            <FaUpload className="text-[#08B36A]" size={14} /> Bulk Templates Upload
                        </h3>
                        <p className="text-xs text-gray-500 mb-6 leading-relaxed font-medium">
                            Import configured report data instantly from a flat CSV layout file. Columns automatically map matching test variables together.
                        </p>

                        <form onSubmit={handleBulkUpload} className="space-y-5">
                            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:border-[#08B36A] transition-colors bg-[#fafafa]">
                                <div className="flex flex-col items-center">
                                    <FaDatabase className="h-8 w-8 text-gray-400 mb-3" />
                                    <label className="block text-xs font-bold text-[#08B36A] hover:text-[#069356] cursor-pointer">
                                        <span>Choose CSV file</span>
                                        <input
                                            type="file"
                                            accept=".csv"
                                            onChange={handleFileChange}
                                            className="sr-only"
                                        />
                                    </label>
                                    <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-wide">Dynamic Aggregates Process</p>
                                </div>
                            </div>

                            {csvFile && (
                                <div className="flex items-center justify-between p-3 bg-[#e6f7eb] border border-[#08B36A]/20 rounded-xl text-xs text-[#08B36A] font-semibold">
                                    <span className="truncate max-w-xs">{csvFile.name}</span>
                                    <button type="button" onClick={() => setCsvFile(null)} className="text-red-500 font-bold hover:underline">Remove</button>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={!csvFile || loading}
                                className="w-full py-3.5 bg-[#08B36A] hover:bg-[#069356] text-white text-[13px] font-bold rounded-xl shadow-[0_4px_15px_rgba(8,179,106,0.2)] transition-all disabled:opacity-40 uppercase tracking-wide"
                            >
                                Upload File Payload
                            </button>
                        </form>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Required Columns Format</h4>
                        <div className="bg-[#fafafa] p-3 rounded-xl border border-gray-150 text-[11px] font-mono text-gray-600 overflow-x-auto whitespace-nowrap">
                            <span className="text-[#08B36A] font-semibold">testName,parameterName,unit,minRef,maxRef...</span>
                        </div>
                    </div>
                </div>

            </div>

            {/* ========================================= */}
            {/* 🌟 CREATE MANUALLY MODAL (API 8)           */}
            {/* ========================================= */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsCreateModalOpen(false)}></div>
                    <div className="relative bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-in fade-in zoom-in duration-300">

                        {/* Modal Header */}
                        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-20">
                            <h2 className="text-[18px] font-bold text-[#08B36A] flex items-center gap-2">
                                <FaPlus size={14} /> Add Test Template
                            </h2>
                            <button
                                onClick={() => setIsCreateModalOpen(false)}
                                className="w-8 h-8 flex items-center justify-center border border-gray-200 text-gray-400 hover:bg-red-50 hover:text-red-500 hover:border-red-100 rounded-md transition-all"
                            >
                                <FaTimes size={14} />
                            </button>
                        </div>

                        {/* Modal Form Body */}
                        <div className="p-6 md:p-8 overflow-y-auto bg-[#fafafa]">
                            <form onSubmit={handleCreateSubmit} className="space-y-6">

                                {/* Main Config card */}
                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                                    <div>
                                        <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Test Document Title <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <FaListAlt className="text-gray-400 text-[13px]" />
                                            </div>
                                            <input
                                                type="text"
                                                required
                                                placeholder="e.g. Complete Blood Count (CBC)"
                                                value={formData.testName}
                                                onChange={(e) => setFormData(prev => ({ ...prev, testName: e.target.value }))}
                                                className="w-full pl-10 pr-4 py-3 bg-[#fafafa] rounded-xl border border-gray-200 focus:border-[#08B36A] focus:ring-1 focus:ring-[#08B36A] outline-none transition-all text-[14px] font-semibold text-gray-800"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Sub-Parameters Container Card */}
                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                                    <div className="flex items-center justify-between border-b border-gray-50 pb-3">
                                        <h3 className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">Test Variables</h3>
                                        <button
                                            type="button"
                                            onClick={handleAddParameter}
                                            className="text-[12px] text-[#08B36A] font-bold hover:underline"
                                        >
                                            + Add Parameter Row
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {formData.parameters.map((param, index) => (
                                            <div key={index} className="p-4 bg-[#fafafa] rounded-xl border border-gray-150 relative space-y-3">
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveParameter(index)}
                                                    className="absolute top-3 right-3 text-xs font-semibold text-rose-500 hover:underline"
                                                >
                                                    Delete Row
                                                </button>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                                                    <div>
                                                        <label className="block text-[11px] font-bold text-gray-500 mb-1">Variable Name *</label>
                                                        <input
                                                            type="text"
                                                            required
                                                            value={param.name}
                                                            onChange={(e) => handleParamChange(index, 'name', e.target.value)}
                                                            className="w-full px-3 py-2 border rounded-lg text-xs bg-white text-gray-800 outline-none focus:border-[#08B36A] font-semibold"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[11px] font-bold text-gray-500 mb-1">Unit</label>
                                                        <input
                                                            type="text"
                                                            value={param.unit}
                                                            onChange={(e) => handleParamChange(index, 'unit', e.target.value)}
                                                            className="w-full px-3 py-2 border rounded-lg text-xs bg-white text-gray-800 outline-none focus:border-[#08B36A] font-semibold"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[11px] font-bold text-gray-500 mb-1">Min Reference</label>
                                                        <input
                                                            type="text"
                                                            value={param.minRef}
                                                            onChange={(e) => handleParamChange(index, 'minRef', e.target.value)}
                                                            className="w-full px-3 py-2 border rounded-lg text-xs bg-white text-gray-800 outline-none focus:border-[#08B36A] font-semibold"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[11px] font-bold text-gray-500 mb-1">Max Reference</label>
                                                        <input
                                                            type="text"
                                                            value={param.maxRef}
                                                            onChange={(e) => handleParamChange(index, 'maxRef', e.target.value)}
                                                            className="w-full px-3 py-2 border rounded-lg text-xs bg-white text-gray-800 outline-none focus:border-[#08B36A] font-semibold"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[11px] font-bold text-gray-500 mb-1">Method Used</label>
                                                        <input
                                                            type="text"
                                                            value={param.method}
                                                            onChange={(e) => handleParamChange(index, 'method', e.target.value)}
                                                            className="w-full px-3 py-2 border rounded-lg text-xs bg-white text-gray-800 outline-none focus:border-[#08B36A] font-semibold"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[11px] font-bold text-gray-500 mb-1">Instrument/Machine</label>
                                                        <input
                                                            type="text"
                                                            value={param.machine}
                                                            onChange={(e) => handleParamChange(index, 'machine', e.target.value)}
                                                            className="w-full px-3 py-2 border rounded-lg text-xs bg-white text-gray-800 outline-none focus:border-[#08B36A] font-semibold"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="col-span-1 md:col-span-3">
                                                    <label className="block text-[11px] font-bold text-gray-500 mb-1">Clinical Interpretation</label>
                                                    <textarea
                                                        rows="2"
                                                        value={param.interpretation}
                                                        onChange={(e) => handleParamChange(index, 'interpretation', e.target.value)}
                                                        placeholder="Provide details on clinical relevance..."
                                                        className="w-full px-3 py-2 border rounded-lg text-xs bg-white text-gray-800 outline-none focus:border-[#08B36A] font-semibold resize-none"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-100 mt-6">
                                    <button type="submit" className="w-full py-3.5 bg-[#08B36A] hover:bg-[#069356] text-white text-[14px] font-bold rounded-xl shadow-[0_4px_15px_rgba(8,179,106,0.3)] transition-all hover:-translate-y-0.5 uppercase tracking-wide">
                                        Submit Details
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================= */}
            {/* 🌟 EDIT / MODIFY TEMPLATE MODAL (API 9)     */}
            {/* ========================================= */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)}></div>
                    <div className="relative bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-in fade-in zoom-in duration-300">

                        {/* Modal Header */}
                        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-20">
                            <h2 className="text-[18px] font-bold text-[#08B36A] flex items-center gap-2">
                                <FaEdit size={14} /> Edit Test Template
                            </h2>
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="w-8 h-8 flex items-center justify-center border border-gray-200 text-gray-400 hover:bg-red-50 hover:text-red-500 hover:border-red-100 rounded-md transition-all"
                            >
                                <FaTimes size={14} />
                            </button>
                        </div>

                        {/* Modal Form Body */}
                        <div className="p-6 md:p-8 overflow-y-auto bg-[#fafafa]">
                            <form onSubmit={handleEditSubmit} className="space-y-6">

                                {/* Main Config Card */}
                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                                    <div>
                                        <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Test Document Title <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <FaListAlt className="text-gray-400 text-[13px]" />
                                            </div>
                                            <input
                                                type="text"
                                                required
                                                value={formData.testName}
                                                onChange={(e) => setFormData(prev => ({ ...prev, testName: e.target.value }))}
                                                className="w-full pl-10 pr-4 py-3 bg-[#fafafa] rounded-xl border border-gray-200 focus:border-[#08B36A] focus:ring-1 focus:ring-[#08B36A] outline-none transition-all text-[14px] font-semibold text-gray-800"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Sub-Parameters Container Card */}
                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                                    <div className="flex items-center justify-between border-b border-gray-50 pb-3">
                                        <h3 className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">Test Variables</h3>
                                        <button
                                            type="button"
                                            onClick={handleAddParameter}
                                            className="text-[12px] text-[#08B36A] font-bold hover:underline"
                                        >
                                            + Add Parameter Row
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {formData.parameters.map((param, index) => (
                                            <div key={index} className="p-4 bg-[#fafafa] rounded-xl border border-gray-150 relative space-y-3">
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveParameter(index)}
                                                    className="absolute top-3 right-3 text-xs font-semibold text-rose-500 hover:underline"
                                                >
                                                    Delete Row
                                                </button>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                                                    <div>
                                                        <label className="block text-[11px] font-bold text-gray-500 mb-1">Variable Name *</label>
                                                        <input
                                                            type="text"
                                                            required
                                                            value={param.name}
                                                            onChange={(e) => handleParamChange(index, 'name', e.target.value)}
                                                            className="w-full px-3 py-2 border rounded-lg text-xs bg-white text-gray-800 outline-none focus:border-[#08B36A] font-semibold"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[11px] font-bold text-gray-500 mb-1">Unit</label>
                                                        <input
                                                            type="text"
                                                            value={param.unit}
                                                            onChange={(e) => handleParamChange(index, 'unit', e.target.value)}
                                                            className="w-full px-3 py-2 border rounded-lg text-xs bg-white text-gray-800 outline-none focus:border-[#08B36A] font-semibold"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[11px] font-bold text-gray-500 mb-1">Min Reference</label>
                                                        <input
                                                            type="text"
                                                            value={param.minRef}
                                                            onChange={(e) => handleParamChange(index, 'minRef', e.target.value)}
                                                            className="w-full px-3 py-2 border rounded-lg text-xs bg-white text-gray-800 outline-none focus:border-[#08B36A] font-semibold"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[11px] font-bold text-gray-500 mb-1">Max Reference</label>
                                                        <input
                                                            type="text"
                                                            value={param.maxRef}
                                                            onChange={(e) => handleParamChange(index, 'maxRef', e.target.value)}
                                                            className="w-full px-3 py-2 border rounded-lg text-xs bg-white text-gray-800 outline-none focus:border-[#08B36A] font-semibold"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[11px] font-bold text-gray-500 mb-1">Method Used</label>
                                                        <input
                                                            type="text"
                                                            value={param.method}
                                                            onChange={(e) => handleParamChange(index, 'method', e.target.value)}
                                                            className="w-full px-3 py-2 border rounded-lg text-xs bg-white text-gray-800 outline-none focus:border-[#08B36A] font-semibold"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[11px] font-bold text-gray-500 mb-1">Instrument/Machine</label>
                                                        <input
                                                            type="text"
                                                            value={param.machine}
                                                            onChange={(e) => handleParamChange(index, 'machine', e.target.value)}
                                                            className="w-full px-3 py-2 border rounded-lg text-xs bg-white text-gray-800 outline-none focus:border-[#08B36A] font-semibold"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="col-span-1 md:col-span-3">
                                                    <label className="block text-[11px] font-bold text-gray-500 mb-1">Clinical Interpretation</label>
                                                    <textarea
                                                        rows="2"
                                                        value={param.interpretation}
                                                        onChange={(e) => handleParamChange(index, 'interpretation', e.target.value)}
                                                        className="w-full px-3 py-2 border rounded-lg text-xs bg-white text-gray-800 outline-none focus:border-[#08B36A] font-semibold resize-none"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-100 mt-6">
                                    <button type="submit" className="w-full py-3.5 bg-[#08B36A] hover:bg-[#069356] text-white text-[14px] font-bold rounded-xl shadow-[0_4px_15px_rgba(8,179,106,0.3)] transition-all hover:-translate-y-0.5 uppercase tracking-wide">
                                        Update Details
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================= */}
            {/* 🌟 TEMPLATE DETAILS VIEW MODAL (API 2)    */}
            {/* ========================================= */}
            {isDetailsModalOpen && selectedTemplate && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsDetailsModalOpen(false)}></div>
                    <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in duration-200">

                        {/* Modal Header */}
                        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 sticky top-0 z-10">
                            <h2 className="text-[18px] font-bold text-[#08B36A] flex items-center gap-2">
                                <FaInfoCircle size={16} /> Template Details
                            </h2>
                            <button
                                onClick={() => setIsDetailsModalOpen(false)}
                                className="w-8 h-8 flex items-center justify-center border border-gray-200 text-gray-400 hover:bg-red-50 hover:text-red-500 hover:border-red-100 rounded-md transition-all"
                            >
                                <FaTimes size={14} />
                            </button>
                        </div>

                        {/* Modal Body Info Structure */}
                        <div className="p-6 md:p-8 overflow-y-auto bg-white">
                            <div className="flex items-center gap-5 mb-6">
                                <div className="w-16 h-16 rounded-2xl bg-[#e6f7eb] border border-[#08B36A]/20 flex items-center justify-center shadow-sm shrink-0">
                                    <FaFlask className="text-[#08B36A] text-2xl" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-gray-800">{selectedTemplate.testName}</h3>
                                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mt-1">Master Schema Profile</p>
                                </div>
                            </div>

                            {/* Stored Parameters */}
                            <div className="space-y-4">
                                <h4 className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">Reference Variables</h4>

                                {selectedTemplate.parameters?.map((param, i) => (
                                    <div key={param._id || i} className="bg-[#fafafa] p-5 rounded-2xl border border-gray-100 space-y-3">

                                        <div className="flex items-center justify-between border-b pb-2 border-gray-200">
                                            <p className="text-[14px] font-bold text-gray-800">{param.name}</p>
                                            {param.unit && (
                                                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#e6f7eb] text-[#08B36A] border border-[#08B36A]/10">
                                                    {param.unit}
                                                </span>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 text-xs">
                                            <div>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Reference Limits</p>
                                                <p className="text-[13px] font-bold text-gray-800 mt-0.5">
                                                    {param.minRef || '0'} - {param.maxRef || 'N/A'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Test Method</p>
                                                <p className="text-[13px] font-bold text-gray-800 mt-0.5">{param.method || 'Standard'}</p>
                                            </div>
                                            <div className="col-span-2">
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Instrument/Machine</p>
                                                <p className="text-[13px] font-bold text-gray-800 mt-0.5">{param.machine || 'Standard Device'}</p>
                                            </div>
                                        </div>

                                        {param.interpretation && (
                                            <div className="pt-2 border-t border-gray-200">
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Interpretation Details</p>
                                                <p className="text-xs text-gray-600 italic leading-relaxed">{param.interpretation}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 pt-5 border-t border-gray-100 grid grid-cols-2 gap-4 text-[11px] text-gray-400 font-bold">
                                <div>ID: {selectedTemplate._id}</div>
                                <div className="text-right">UPDATED: {new Date(selectedTemplate.updatedAt).toLocaleDateString()}</div>
                            </div>
                        </div>

                    </div>
                </div>
            )}

            {/* ========================================= */}
            {/* 🌟 DELETE CONFIRMATION POPUP (API 10)      */}
            {/* ========================================= */}
            {isDeleteModalOpen && selectedTemplate && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsDeleteModalOpen(false)}></div>
                    <div className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 md:p-8 text-center animate-in zoom-in duration-200">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
                            <FaExclamationTriangle className="text-red-500 text-2xl" />
                        </div>
                        <h3 className="text-[20px] font-bold text-gray-800 mb-2">Are you sure?</h3>
                        <p className="text-[14px] text-gray-500 font-medium mb-8">
                            Do you really want to delete <span className="text-gray-800 font-bold">"{selectedTemplate.testName}"</span>?
                        </p>
                        <div className="flex items-center justify-center gap-3">
                            <button onClick={() => { setIsDeleteModalOpen(false); setSelectedTemplate(null); }} className="flex-1 px-4 py-3 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-[14px] font-bold transition-all">
                                Cancel
                            </button>
                            <button onClick={handleDeleteConfirm} className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl text-[14px] font-bold shadow-md shadow-red-200 transition-all hover:-translate-y-0.5">
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}