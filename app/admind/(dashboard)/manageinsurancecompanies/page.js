'use client'

import AdminAPI from '@/app/services/AdminAPI';
import React, { useState, useEffect } from 'react';
import { 
    FaPlus, FaEdit, FaTrash, FaTimes, FaBuilding, 
    FaCheckCircle, FaExclamationCircle, FaSearch, 
    FaTags, FaShieldAlt, FaSpinner 
} from 'react-icons/fa';

const InsuranceManagement = () => {
    // Data States
    const [companies, setCompanies] = useState([]);
    const [insuranceTypes, setInsuranceTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoadingId, setActionLoadingId] = useState(null);

    // Pagination & Search
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");

    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);

    // Form States (Provider, Plan Name, Type)
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({
        provider: '',
        insuranceName: '',
        type: ''
    });
    const [newTypeName, setNewTypeName] = useState("");

    useEffect(() => {
        fetchInsurances();
    }, [page, search]);

    useEffect(() => {
        fetchTypes();
    }, []);

    const fetchInsurances = async () => {
        try {
            setLoading(true);
            const res = await AdminAPI.getInsuranceList(page, 10, search);
            setCompanies(res.data || []);
            setTotalPages(res.totalPages || 1);
        } catch (error) { 
            console.error("Error fetching insurances:", error); 
        } finally { 
            setLoading(false); 
        }
    };

    // GET /admin/user/insurance/insurance-types -> ["cashless", "reimbursement", "rghs", "ayushman bharat"]
    const fetchTypes = async () => {
        try {
            const res = await AdminAPI.getInsuranceTypes();
            const typesArray = res.data || [];
            if (Array.isArray(typesArray)) {
                setInsuranceTypes(typesArray);
                if (typesArray.length > 0 && !formData.type) {
                    setFormData(prev => ({ ...prev, type: typesArray[0] }));
                }
            }
        } catch (error) { 
            console.error("Error fetching insurance types:", error); 
        }
    };

    // PATCH /admin/user/insurance/update-status/:id with body { isActive: false / true }
    const handleStatusToggle = async (id, currentStatus) => {
        setActionLoadingId(id);
        const newStatus = !currentStatus;
        try {
            const res = await AdminAPI.updateInsuranceStatus(id, { isActive: newStatus });
            if (res?.success) {
                // Optimistically update local state
                setCompanies(prev => prev.map(comp => 
                    comp._id === id ? { ...comp, isActive: newStatus } : comp
                ));
            } else {
                fetchInsurances();
            }
        } catch (error) { 
            console.error("Failed to update status", error);
            alert(error.response?.data?.message || "Failed to update status"); 
            fetchInsurances();
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleDelete = async (id, name) => {
        if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
            try {
                await AdminAPI.deleteInsurance(id);
                fetchInsurances();
            } catch (error) { 
                alert(error.response?.data?.message || "Delete failed"); 
            }
        }
    };

    // POST /admin/user/insurance/add-insurance with { provider, insuranceName, type }
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                provider: formData.provider.trim(),
                insuranceName: formData.insuranceName.trim(),
                type: formData.type.toLowerCase().trim()
            };

            if (editId) {
                if (AdminAPI.updateInsurance) {
                    await AdminAPI.updateInsurance(editId, payload);
                    alert("Insurance plan updated successfully!");
                }
            } else {
                await AdminAPI.addInsurance(payload);
                alert("Insurance company added successfully!");
            }
            setIsModalOpen(false);
            fetchInsurances();
        } catch (error) { 
            console.error("Save error:", error);
            alert(error.response?.data?.message || "Operation failed"); 
        }
    };

    const handleAddType = async (e) => {
        e.preventDefault();
        const trimmed = newTypeName.trim();
        if (!trimmed) return;
        try {
            if (AdminAPI.addInsuranceType) {
                await AdminAPI.addInsuranceType({ name: trimmed.toLowerCase() });
                alert("Insurance type category added!");
                setNewTypeName("");
                setIsTypeModalOpen(false);
                fetchTypes();
            }
        } catch (error) {
            alert(error.response?.data?.message || "Failed to add type category");
        }
    };

    const openModal = (company = null) => {
        if (company) {
            setEditId(company._id);
            setFormData({
                provider: company.provider || '',
                insuranceName: company.insuranceName || '',
                type: company.type || (insuranceTypes[0] || '')
            });
        } else {
            setEditId(null);
            setFormData({
                provider: '',
                insuranceName: '',
                type: insuranceTypes[0] || ''
            });
        }
        setIsModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-[#f9fafb] p-6 md:p-10 text-gray-800 font-sans">
            {/* --- HEADER --- */}
            <div className="max-w-6xl mx-auto flex flex-col lg:flex-row justify-between items-center mb-10 gap-6">
                <div>
                    <h1 className="text-2xl font-black flex items-center gap-3">
                        <FaBuilding className="text-[#08b36a]" /> Insurance Management
                    </h1>
                    <p className="text-gray-500 text-sm font-medium">Manage providers, plans, and cashless categories</p>
                </div>

                <div className="flex flex-wrap justify-center gap-3 w-full lg:w-auto">
                    <div className="relative min-w-[250px]">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search provider, plan or type..."
                            className="pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl outline-none w-full shadow-sm font-medium text-sm"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                        />
                    </div>
                    {AdminAPI.addInsuranceType && (
                        <button
                            onClick={() => setIsTypeModalOpen(true)}
                            className="bg-white border-2 border-[#08b36a] text-[#08b36a] hover:bg-green-50 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all active:scale-95 text-sm"
                        >
                            <FaTags size={14} /> Add Type
                        </button>
                    )}
                    <button
                        onClick={() => openModal()}
                        className="bg-[#08b36a] hover:bg-[#079d5d] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-green-100 active:scale-95 text-sm"
                    >
                        <FaPlus size={14} /> Add Insurance
                    </button>
                </div>
            </div>

            {/* --- TABLE --- */}
            <div className="max-w-6xl mx-auto bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b">S No.</th>
                                <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b">Provider</th>
                                <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b">Insurance Plan</th>
                                <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b">Type</th>
                                <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b">Status</th>
                                <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-20 font-bold text-gray-400">
                                        <div className="flex items-center justify-center gap-2">
                                            <FaSpinner className="animate-spin text-[#08b36a]" /> Loading records...
                                        </div>
                                    </td>
                                </tr>
                            ) : companies.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-16 text-gray-400 font-bold">
                                        No insurance plans found.
                                    </td>
                                </tr>
                            ) : companies.map((company, index) => (
                                <tr key={company._id} className="hover:bg-gray-50/20 transition-colors">
                                    <td className="px-8 py-5 text-sm font-bold text-gray-400">{(page - 1) * 10 + (index + 1)}</td>
                                    <td className="px-8 py-5 text-sm font-black text-[#08b36a]">{company.provider}</td>
                                    <td className="px-8 py-5 text-sm font-bold text-gray-800">{company.insuranceName}</td>
                                    <td className="px-8 py-5">
                                        <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                            {company.type}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <button
                                            disabled={actionLoadingId === company._id}
                                            onClick={() => handleStatusToggle(company._id, company.isActive)}
                                            className={`px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-1.5 ${
                                                company.isActive ? 'bg-green-50 text-[#08b36a] hover:bg-green-100' : 'bg-red-50 text-red-500 hover:bg-red-100'
                                            } disabled:opacity-50`}
                                        >
                                            {actionLoadingId === company._id && <FaSpinner className="animate-spin" />}
                                            {company.isActive ? 'Active' : 'Inactive'}
                                        </button>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex justify-end gap-2">
                                            <button 
                                                onClick={() => openModal(company)} 
                                                className="p-2.5 text-gray-400 hover:text-[#08b36a] hover:bg-green-50 rounded-xl transition-all"
                                                title="Edit Insurance"
                                            >
                                                <FaEdit size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(company._id, company.insuranceName)} 
                                                className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                title="Delete Plan"
                                            >
                                                <FaTrash size={15} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- PAGINATION --- */}
            {totalPages > 1 && (
                <div className="max-w-6xl mx-auto flex justify-center gap-2 mt-8">
                    {[...Array(totalPages)].map((_, i) => (
                        <button 
                            key={i} 
                            onClick={() => setPage(i + 1)} 
                            className={`w-10 h-10 rounded-xl font-bold transition-all ${
                                page === i + 1 
                                    ? 'bg-[#08b36a] text-white shadow-lg shadow-green-100' 
                                    : 'bg-white text-gray-400 hover:bg-gray-100 border border-gray-100'
                            }`}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
            )}

            {/* --- MODAL: ADD/EDIT INSURANCE --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="bg-[#08b36a] p-8 text-white flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-black uppercase tracking-tight">{editId ? 'Edit Plan' : 'Add Insurance'}</h2>
                                <p className="text-xs text-green-100 mt-0.5">Configure master policy details</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition-all">
                                <FaTimes />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-5">
                            {/* PROVIDER FIELD */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                    Provider (e.g. Star Health, HDFC, Government)
                                </label>
                                <input 
                                    required 
                                    type="text" 
                                    placeholder="e.g. Star Health" 
                                    className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-[#08b36a] focus:bg-white rounded-2xl outline-none font-bold transition-all text-sm" 
                                    value={formData.provider} 
                                    onChange={e => setFormData({ ...formData, provider: e.target.value })} 
                                />
                            </div>

                            {/* PLAN NAME FIELD */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                    Insurance Name / Scheme
                                </label>
                                <input 
                                    required 
                                    type="text" 
                                    placeholder="e.g. Star Health Comprehensive" 
                                    className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-[#08b36a] focus:bg-white rounded-2xl outline-none font-bold transition-all text-sm" 
                                    value={formData.insuranceName} 
                                    onChange={e => setFormData({ ...formData, insuranceName: e.target.value })} 
                                />
                            </div>

                            {/* TYPE FIELD */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                    Coverage Type
                                </label>
                                <select 
                                    required 
                                    className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-[#08b36a] focus:bg-white rounded-2xl outline-none font-bold text-gray-700 transition-all text-sm capitalize" 
                                    value={formData.type} 
                                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                                >
                                    <option value="" disabled>Choose Category</option>
                                    {Array.isArray(insuranceTypes) && insuranceTypes.map((t, idx) => (
                                        <option key={idx} value={t} className="capitalize">
                                            {t}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button 
                                type="submit" 
                                className="w-full bg-[#08b36a] text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-green-100 hover:bg-[#079d5d] transition-all active:scale-95 text-xs mt-2"
                            >
                                {editId ? 'Save Changes' : 'Confirm & Add'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* --- MODAL: ADD INSURANCE TYPE --- */}
            {isTypeModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="bg-[#08b36a] p-8 text-white flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-black uppercase tracking-tight">New Category</h2>
                                <p className="text-xs text-green-100 mt-0.5">Add a new master policy classification</p>
                            </div>
                            <button onClick={() => setIsTypeModalOpen(false)} className="bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition-all">
                                <FaTimes />
                            </button>
                        </div>
                        <form onSubmit={handleAddType} className="p-8 space-y-6">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Type Name</label>
                                <input 
                                    required 
                                    type="text" 
                                    placeholder="e.g. cashless, reimbursement, rghs" 
                                    className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-[#08b36a] focus:bg-white rounded-2xl outline-none transition-all font-bold text-sm" 
                                    value={newTypeName} 
                                    onChange={e => setNewTypeName(e.target.value)} 
                                />
                            </div>
                            <button 
                                type="submit" 
                                className="w-full bg-[#08b36a] text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-green-100 hover:bg-[#079d5d] transition-all text-xs"
                            >
                                Create Category
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InsuranceManagement;