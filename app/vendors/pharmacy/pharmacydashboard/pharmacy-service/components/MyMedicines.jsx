"use client";
import React, { useState } from 'react';
import {
    FaPlus, FaCapsules, FaTimes, FaRupeeSign, FaTrash,
    FaEdit, FaSearch, FaExclamationTriangle, FaCheckCircle, FaLayerGroup
} from 'react-icons/fa';

export default function MyMedicines() {
    const [medicines, setMedicines] = useState([
        { id: 'LP-9901', name: 'Paracetamol 500mg', category: 'Fever & Pain', price: '40.00', stock: 120, expiry: '2025-12-01' },
        { id: 'LP-9902', name: 'Vitamin C', category: 'Supplements', price: '65.00', stock: 15, expiry: '2025-08-15' }
    ]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editId, setEditId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({ name: '', category: 'Fever & Pain', price: '', stock: '', expiry: '' });

    const handleOpenAddModal = () => {
        setIsEditMode(false);
        setFormData({ name: '', category: 'Fever & Pain', price: '', stock: '', expiry: '' });
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (e, med) => {
        e.stopPropagation();
        setIsEditMode(true);
        setEditId(med.id);
        setFormData({ ...med });
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEditMode) {
            setMedicines(prev => prev.map(m => m.id === editId ? { ...formData, id: editId } : m));
        } else {
            const newEntry = { ...formData, id: `LP-${Math.floor(1000 + Math.random() * 9000)}` };
            setMedicines([newEntry, ...medicines]);
        }
        setIsModalOpen(false);
    };

    const filtered = medicines.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">

            {/* --- TOOLBAR --- */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                <div className="relative w-full sm:w-80">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text" placeholder="Search my stock..."
                        value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    />
                </div>
                <button
                    onClick={handleOpenAddModal}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-500 text-white rounded-xl font-bold text-sm hover:bg-emerald-600 transition-all shadow-md shadow-emerald-100"
                >
                    <FaPlus size={12} /> Add New Medicine
                </button>
            </div>

            {/* --- TABLE --- */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-[11px] uppercase tracking-wider text-gray-500 font-bold">
                                <th className="p-5 pl-8">Medicine Name</th>
                                <th className="p-5">Category</th>
                                <th className="p-5">Stock & Price</th>
                                <th className="p-5 text-center pr-8">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtered.map(med => (
                                <tr key={med.id} className="hover:bg-emerald-50/40 transition-all group">
                                    <td className="p-5 pl-8">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center border border-emerald-100">
                                                <FaCapsules size={16} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800 text-sm">{med.name}</p>
                                                <p className="text-[11px] text-gray-400 font-medium uppercase">ID: {med.id} • EXP: {med.expiry}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded text-[11px] font-bold border border-gray-200 uppercase">
                                            {med.category}
                                        </span>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-gray-800">₹{med.price}</span>
                                            <span className={`text-[11px] font-bold ${med.stock < 20 ? 'text-amber-600' : 'text-emerald-600'}`}>
                                                QTY: {med.stock}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-5 pr-8 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button onClick={(e) => handleOpenEditModal(e, med)} className="p-2 bg-gray-50 text-blue-600 hover:bg-blue-500 hover:text-white rounded-lg transition-all border border-gray-200">
                                                <FaEdit size={14} />
                                            </button>
                                            <button onClick={() => setMedicines(medicines.filter(m => m.id !== med.id))} className="p-2 bg-gray-50 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all border border-gray-200">
                                                <FaTrash size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- MODAL --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                                {isEditMode ? <><FaEdit className="text-blue-500" /> Edit Stock</> : <><FaPlus className="text-emerald-500" /> New Medicine</>}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg transition-all">
                                <FaTimes size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Medicine Name</label>
                                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Category</label>
                                    <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none">
                                        <option>Fever & Pain</option><option>Antibiotics</option><option>Supplements</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Price (₹)</label>
                                    <input type="number" step="0.01" required value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Stock Qty</label>
                                    <input type="number" required value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Expiry Date</label>
                                    <input type="date" required value={formData.expiry} onChange={(e) => setFormData({ ...formData, expiry: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                                </div>
                            </div>
                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-50">Cancel</button>
                                <button type="submit" className={`px-5 py-2.5 text-white rounded-xl font-bold text-sm shadow-md transition-all ${isEditMode ? 'bg-blue-500 hover:bg-blue-600 shadow-blue-100' : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-100'}`}>
                                    {isEditMode ? "Save Changes" : "Add Medicine"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
