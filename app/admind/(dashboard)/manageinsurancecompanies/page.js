'use client'

import React, { useState } from 'react';
import { FaPlus, FaTrash, FaEdit, FaTimes, FaBuilding, FaCheckCircle } from 'react-icons/fa';

const InsuranceManagement = () => {
    // Initial State with dummy data
    const [companies, setCompanies] = useState([
        { id: 1, name: 'BAJAJ', status: 'Cash' },
        { id: 2, name: 'HDFC ERGO', status: 'Cashless' },
        { id: 3, name: 'STAR HEALTH', status: 'Cash' }
    ]);

    // Modal & Form States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({ name: '', status: 'Cash' });

    // Open Modal for Add or Edit
    const openModal = (company = null) => {
        if (company) {
            setEditId(company.id);
            setFormData({ ...company });
        } else {
            setEditId(null);
            setFormData({ name: '', status: 'Cash' });
        }
        setIsModalOpen(true);
    };

    // Handle Delete
    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete this insurance company?")) {
            setCompanies(companies.filter(c => c.id !== id));
        }
    };

    // Handle Form Submit
    const handleSubmit = (e) => {
        e.preventDefault();
        if (editId) {
            setCompanies(companies.map(c => c.id === editId ? { ...formData, id: editId } : c));
        } else {
            setCompanies([...companies, { ...formData, id: Date.now() }]);
        }
        setIsModalOpen(false);
    };

    return (
        <div className="min-h-screen bg-[#f9fafb] p-6 md:p-10 text-gray-800">
            {/* --- HEADER --- */}
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                <div>
                    <h1 className="text-2xl font-black flex items-center gap-3">
                        <FaBuilding className="text-[#08b36a]" /> Insurance Companies
                    </h1>
                    <p className="text-gray-500 text-sm font-medium">Manage your partner insurance providers and their status</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="bg-[#08b36a] hover:bg-[#079d5d] text-white px-7 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-green-100 active:scale-95"
                >
                    <FaPlus size={14} /> Add Company
                </button>
            </div>

            {/* --- TABLE AREA --- */}
            <div className="max-w-6xl mx-auto bg-white rounded-[1.5rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-8 py-5 text-[13px] font-bold text-gray-400 uppercase tracking-wider border-b">S No.</th>
                                <th className="px-8 py-5 text-[13px] font-bold text-gray-400 uppercase tracking-wider border-b">Company Name</th>
                                <th className="px-8 py-5 text-[13px] font-bold text-gray-400 uppercase tracking-wider border-b">Status</th>
                                <th className="px-8 py-5 text-[13px] font-bold text-gray-400 uppercase tracking-wider border-b text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {companies.map((company, index) => (
                                <tr key={company.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-8 py-5 text-sm font-bold text-gray-400">{index + 1}</td>
                                    <td className="px-8 py-5 text-sm font-black text-gray-800 uppercase tracking-tight">
                                        {company.name}
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-tighter ${company.status === 'Cash'
                                            ? 'bg-blue-50 text-blue-600'
                                            : 'bg-green-50 text-[#08b36a]'
                                            }`}>
                                            <FaCheckCircle size={10} /> {company.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex justify-end gap-3">
                                            <button
                                                onClick={() => openModal(company)}
                                                className="p-2.5 text-orange-400 hover:bg-orange-50 rounded-xl transition-all"
                                                title="Edit Company"
                                            >
                                                <FaEdit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(company.id)}
                                                className="p-2.5 text-red-400 hover:bg-red-50 rounded-xl transition-all"
                                                title="Delete Company"
                                            >
                                                <FaTrash size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {companies.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="px-8 py-20 text-center text-gray-400 font-medium">
                                        No companies found. Click "Add Company" to get started.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- MODAL FORM --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="bg-[#08b36a] p-8 text-white flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-black uppercase tracking-tight">
                                    {editId ? 'Update Company' : 'New Company'}
                                </h2>
                                <p className="text-xs font-bold opacity-70 uppercase mt-1 tracking-widest">Insurance Provider Info</p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="bg-white/20 p-2.5 rounded-full hover:rotate-90 transition-all"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div>
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Company Name</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full mt-2 px-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-[#08b36a] focus:bg-white rounded-2xl outline-none transition-all font-bold uppercase"
                                    placeholder="e.g. BAJAJ ALLIANZ"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
                                />
                            </div>

                            <div>
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Claim Status</label>
                                <select
                                    className="w-full mt-2 px-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-[#08b36a] focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-700"
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                                >
                                    <option value="Cash">Cash</option>
                                    <option value="Cashless">Cashless</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-[#08b36a] text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] shadow-lg hover:bg-[#079d5d] transition-all active:scale-95 shadow-green-100 mt-4"
                            >
                                {editId ? 'Save Changes' : 'Add Company'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InsuranceManagement;