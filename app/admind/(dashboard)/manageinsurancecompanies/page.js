'use client'

import AdminAPI from '@/app/services/AdminAPI';
import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaBuilding, FaCheckCircle, FaExclamationCircle, FaSearch, FaTags } from 'react-icons/fa';

const InsuranceManagement = () => {
    // Data States
    const [companies, setCompanies] = useState([]);
    const [insuranceTypes, setInsuranceTypes] = useState([]);
    const [loading, setLoading] = useState(true);

    // Pagination & Search
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");

    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false); // For Companies
    const [isTypeModalOpen, setIsTypeModalOpen] = useState(false); // For Types

    // Form States
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({ insuranceName: '', type: '' });
    const [newTypeName, setNewTypeName] = useState("");

    useEffect(() => {
        fetchInsurances();
        fetchTypes();
    }, [page, search]);

    const fetchInsurances = async () => {
        try {
            setLoading(true);
            const res = await AdminAPI.getInsuranceList(page, 10, search);
            setCompanies(res.data || []);
            setTotalPages(res.totalPages || 1);
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

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
        } catch (error) { console.error(error); }
    };

    // --- HANDLERS ---

    const handleStatusToggle = async (id, currentStatus) => {
        try {
            await AdminAPI.updateInsuranceStatus(id, { isActive: !currentStatus });
            fetchInsurances();
        } catch (error) { alert("Failed to update status"); }
    };

    const handleDelete = async (id, name) => {
        if (window.confirm(`Delete "${name}"?`)) {
            try {
                await AdminAPI.deleteInsurance(id);
                fetchInsurances();
            } catch (error) { alert("Delete failed"); }
        }
    };

    // Add Insurance Company
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editId) {
                await AdminAPI.updateInsurance(editId, formData);
                alert("Updated!");
            } else {
                await AdminAPI.addInsurance(formData);
                alert("Added!");
            }
            setIsModalOpen(false);
            fetchInsurances();
        } catch (error) { alert("Operation failed"); }
    };

    // Add New Type (RGHS, CGHS, etc)
    const handleAddType = async (e) => {
        e.preventDefault();
        if (!newTypeName.trim()) return;
        try {
            await AdminAPI.addInsuranceType({ name: newTypeName.toUpperCase() });
            alert("Type Added Successfully!");
            setNewTypeName("");
            setIsTypeModalOpen(false);
            fetchTypes(); // Refresh dropdown list
        } catch (error) {
            alert(error.response?.data?.message || "Failed to add type");
        }
    };

    const openModal = (company = null) => {
        if (company) {
            setEditId(company._id);
            setFormData({ insuranceName: company.insuranceName, type: company.type });
        } else {
            setEditId(null);
            setFormData({ insuranceName: '', type: insuranceTypes[0] || '' });
        }
        setIsModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-[#f9fafb] p-6 md:p-10 text-gray-800">
            {/* --- HEADER --- */}
            <div className="max-w-6xl mx-auto flex flex-col lg:flex-row justify-between items-center mb-10 gap-6">
                <div>
                    <h1 className="text-2xl font-black flex items-center gap-3">
                        <FaBuilding className="text-[#08b36a]" /> Insurance Management
                    </h1>
                    <p className="text-gray-500 text-sm font-medium">Manage companies and insurance categories</p>
                </div>

                <div className="flex flex-wrap justify-center gap-3 w-full lg:w-auto">
                    <div className="relative min-w-[250px]">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search companies..."
                            className="pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl outline-none w-full shadow-sm"
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {/* ADD TYPE BUTTON */}
                    <button
                        onClick={() => setIsTypeModalOpen(true)}
                        className="bg-white border-2 border-[#08b36a] text-[#08b36a] hover:bg-green-50 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all active:scale-95 shadow-sm"
                    >
                        <FaTags size={14} /> Add Type
                    </button>

                    {/* ADD COMPANY BUTTON */}
                    <button
                        onClick={() => openModal()}
                        className="bg-[#08b36a] hover:bg-[#079d5d] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-green-100 active:scale-95"
                    >
                        <FaPlus size={14} /> Add Company
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
                                <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b">Company Name</th>
                                <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b">Type</th>
                                <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b">Status</th>
                                <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan="5" className="text-center py-20 font-bold text-gray-300">Loading Records...</td></tr>
                            ) : companies.map((company, index) => (
                                <tr key={company._id} className="hover:bg-gray-50/10 transition-colors">
                                    <td className="px-8 py-5 text-sm font-bold text-gray-400">{(page - 1) * 10 + (index + 1)}</td>
                                    <td className="px-8 py-5 text-sm font-black text-gray-800 uppercase tracking-tight">{company.insuranceName}</td>
                                    <td className="px-8 py-5">
                                        <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">{company.type}</span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <button
                                            onClick={() => handleStatusToggle(company._id, company.isActive)}
                                            className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${company.isActive ? 'bg-green-50 text-[#08b36a]' : 'bg-red-50 text-red-500'}`}
                                        >
                                            {company.isActive ? 'Active' : 'Inactive'}
                                        </button>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => openModal(company)} className="p-2.5 text-gray-400 hover:text-[#08b36a] hover:bg-green-50 rounded-xl transition-all"><FaEdit size={16} /></button>
                                            <button onClick={() => handleDelete(company._id, company.insuranceName)} className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><FaTrash size={15} /></button>
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
                        <button key={i} onClick={() => setPage(i + 1)} className={`w-10 h-10 rounded-xl font-bold transition-all ${page === i + 1 ? 'bg-[#08b36a] text-white shadow-lg' : 'bg-white text-gray-400 hover:bg-gray-100'}`}>
                            {i + 1}
                        </button>
                    ))}
                </div>
            )}

            {/* --- MODAL: ADD INSURANCE COMPANY --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden">
                        <div className="bg-[#08b36a] p-10 text-white flex justify-between items-center relative">
                            <h2 className="text-2xl font-black uppercase tracking-tight">{editId ? 'Edit Provider' : 'Add Provider'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all"><FaTimes /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-10 space-y-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Company Name</label>
                                <input required type="text" className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-[#08b36a] focus:bg-white rounded-2xl outline-none font-bold uppercase" value={formData.insuranceName} onChange={e => setFormData({ ...formData, insuranceName: e.target.value.toUpperCase() })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Category (Type)</label>
                                <select required className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-[#08b36a] focus:bg-white rounded-2xl outline-none font-bold text-gray-700" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                    <option value="" disabled>Choose Category</option>
                                    {Array.isArray(insuranceTypes) && insuranceTypes.map((t, idx) => (
                                        <option key={idx} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>
                            <button type="submit" className="w-full bg-[#08b36a] text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-[#079d5d] transition-all">
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
                        <div className="bg-[#08b36a] p-10 text-white flex justify-between items-center relative">
                            <div>
                                <h2 className="text-2xl font-black uppercase tracking-tight">New Category</h2>
                                <p className="text-[10px] font-bold opacity-80 uppercase mt-1 tracking-widest">Type Management</p>
                            </div>
                            <button onClick={() => setIsTypeModalOpen(false)} className="bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all"><FaTimes /></button>
                        </div>
                        <form onSubmit={handleAddType} className="p-10 space-y-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Type Name</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. RGHS, CGHS, PRIVATE"
                                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl outline-none transition-all font-bold uppercase placeholder:text-gray-300"
                                    value={newTypeName}
                                    onChange={e => setNewTypeName(e.target.value)}
                                />
                            </div>
                            <button type="submit" className="w-full bg-[#08b36a] text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95">
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