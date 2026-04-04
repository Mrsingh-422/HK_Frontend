"use client";
import React, { useState } from 'react';
import { FaSearch, FaPills, FaTimes, FaRupeeSign, FaInfoCircle, FaEye, FaShieldAlt } from 'react-icons/fa';

const globalMedicines = [
    { id: 'MED-7721', name: 'Paracetamol 500mg', brand: 'Crocin', category: 'Fever & Pain', price: '35.00', description: 'Widely used over-the-counter analgesic and antipyretic for mild to moderate pain relief and fever reduction.', status: 'In Stock' },
    { id: 'MED-8892', name: 'Amoxicillin 250mg', brand: 'Mox', category: 'Antibiotics', price: '110.00', description: 'Broad-spectrum penicillin antibiotic used to treat bacterial infections like pneumonia and ear infections.', status: 'In Stock' },
];

export default function AllMedicines() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMed, setSelectedMed] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const filtered = globalMedicines.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.brand.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
            {/* SEARCH */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                <div className="relative w-full max-w-md">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text" placeholder="Search global database..."
                        value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    />
                </div>
                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-lg border border-emerald-100">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">Global Live DB</span>
                </div>
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-[11px] uppercase tracking-wider text-gray-500 font-bold">
                            <th className="p-5 pl-8">Medicine & Brand</th>
                            <th className="p-5">Category</th>
                            <th className="p-5">Global MSRP</th>
                            <th className="p-5 text-center pr-8">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filtered.map(med => (
                            <tr key={med.id} className="hover:bg-emerald-50/40 transition-all group cursor-pointer" onClick={() => { setSelectedMed(med); setIsModalOpen(true); }}>
                                <td className="p-5 pl-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white border border-gray-100 text-emerald-500 rounded-xl flex items-center justify-center shadow-sm">
                                            <FaPills size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800 text-sm">{med.name}</p>
                                            <p className="text-[11px] text-gray-400 font-medium">{med.brand} • {med.id}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-5">
                                    <span className="px-2.5 py-1 bg-white text-gray-600 rounded-md text-[11px] font-bold border border-gray-200 uppercase">
                                        {med.category}
                                    </span>
                                </td>
                                <td className="p-5">
                                    <span className="text-sm font-bold text-gray-800 flex items-center gap-1"><FaRupeeSign size={11} className="text-gray-400" /> {med.price}</span>
                                </td>
                                <td className="p-5 pr-8 text-center">
                                    <button className="px-4 py-2 bg-gray-900 text-white rounded-lg text-xs font-bold hover:bg-emerald-600 transition-all flex items-center gap-2 mx-auto shadow-md shadow-gray-200">
                                        <FaEye size={12} /> View Profile
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* DETAILS MODAL */}
            {isModalOpen && selectedMed && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                                <FaInfoCircle className="text-emerald-500" /> Medicine Profile
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg transition-all">
                                <FaTimes size={18} />
                            </button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="flex items-center gap-5 pb-6 border-b border-gray-50">
                                <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center border border-emerald-100">
                                    <FaPills size={28} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800 leading-tight">{selectedMed.name}</h3>
                                    <p className="text-sm text-gray-500 font-medium">{selectedMed.brand} | {selectedMed.category}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">MSRP Price</p>
                                    <p className="text-lg font-bold text-gray-800 flex items-center gap-1"><FaRupeeSign size={14} /> {selectedMed.price}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">ID Code</p>
                                    <p className="text-sm font-bold text-gray-800 uppercase">{selectedMed.id}</p>
                                </div>
                            </div>
                            <div className="p-5 bg-gray-50 rounded-xl border border-gray-100 italic text-sm text-gray-600 leading-relaxed">
                                "{selectedMed.description}"
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 text-[10px] font-bold uppercase tracking-widest justify-center">
                                <FaShieldAlt size={16} /> Verified Pharmaceutical Data
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 text-right">
                            <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-100">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}