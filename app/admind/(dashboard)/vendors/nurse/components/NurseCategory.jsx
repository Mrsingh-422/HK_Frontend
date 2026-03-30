'use client'

import React, { useState } from 'react'
import { FaEdit, FaTrash, FaPlus, FaSearch, FaStethoscope, FaMicroscope, FaCamera, FaCheck, FaTimes } from "react-icons/fa"
import NewNurseCategory from './NewNurseCategory';

// --- MAIN PAGE COMPONENT ---
function NurseCategory() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [categories, setCategories] = useState([
        {
            id: 1,
            name: 'Senior ICU Specialist',
            department: 'Nursing',
            image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=100',
        },
        {
            id: 2,
            name: 'Clinical Pathologist',
            department: 'Pathology',
            image: 'https://images.unsplash.com/photo-1579152276503-34e85744f47e?auto=format&fit=crop&q=80&w=100',
        },
        {
            id: 3,
            name: 'Pediatric Care Unit',
            department: 'Nursing',
            image: 'https://images.unsplash.com/photo-1584820923423-945c4d69b17a?auto=format&fit=crop&q=80&w=100',
        },
        {
            id: 4,
            name: 'Hematology Technician',
            department: 'Pathology',
            image: 'https://images.unsplash.com/photo-1579152194942-12240d6ca6bd?auto=format&fit=crop&q=80&w=100',
        },
    ]);

    const handleDelete = (id) => {
        if (window.confirm("Remove this category from registry?")) {
            setCategories(categories.filter(cat => cat.id !== id));
        }
    };

    const handleAddCategory = (newCategory) => {
        setCategories([newCategory, ...categories]);
    };

    return (
        <div className="min-h-screen bg-[#FDFDFD] p-4 md:p-10 font-sans text-slate-900">

            {/* MODAL COMPONENT */}
            <NewNurseCategory
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAddCategory={handleAddCategory}
            />

            <div className="max-w-6xl mx-auto">

                {/* --- HEADER SECTION --- */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-gray-900">Category Registry</h1>
                        <p className="text-slate-400 font-medium text-sm mt-1">Total {categories.length} specialized categories active.</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center justify-center gap-3 bg-[#08B36A] text-white px-6 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-[0.15em] hover:bg-[#079d5c] transition-all shadow-lg shadow-green-100 active:scale-95 shrink-0"
                    >
                        <FaPlus size={12} /> Add New Category
                    </button>
                </div>

                {/* --- SEARCH & FILTERS --- */}
                <div className="mb-6 relative max-w-sm">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input
                        type="text"
                        placeholder="Search categories..."
                        className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-[#08B36A] focus:ring-4 focus:ring-[#08B36A]/5 transition-all text-sm font-semibold text-slate-600"
                    />
                </div>

                {/* --- TABLE CONTAINER --- */}
                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/30 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">Image</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">Category Name</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">Department</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {categories.map((category) => (
                                    <tr key={category.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-slate-100 group-hover:border-[#08B36A]/30 transition-all">
                                                <img
                                                    src={category.image}
                                                    alt={category.name}
                                                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                                                />
                                            </div>
                                        </td>

                                        <td className="px-8 py-5">
                                            <span className="text-sm font-black text-slate-700 block tracking-tight group-hover:text-[#08B36A] transition-colors">
                                                {category.name}
                                            </span>
                                            <span className="text-[10px] text-slate-300 font-bold uppercase tracking-tighter">ID: CAT-{category.id.toString().slice(-4)}</span>
                                        </td>

                                        <td className="px-8 py-5">
                                            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${category.department === 'Nursing'
                                                    ? 'bg-emerald-50 text-[#08B36A]'
                                                    : 'bg-indigo-50 text-indigo-500'
                                                }`}>
                                                {category.department === 'Nursing' ? <FaStethoscope /> : <FaMicroscope />}
                                                {category.department}
                                            </div>
                                        </td>

                                        <td className="px-8 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button className="p-3 text-slate-300 hover:text-slate-900 hover:bg-white hover:shadow-sm rounded-xl transition-all">
                                                    <FaEdit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(category.id)}
                                                    className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
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

                    {categories.length === 0 && (
                        <div className="py-20 text-center">
                            <p className="text-slate-300 font-bold text-sm tracking-widest uppercase">No categories found in registry</p>
                        </div>
                    )}
                </div>

                {/* FOOTER */}
                <div className="mt-8 flex justify-center">
                    <p className="text-[10px] font-black text-slate-200 uppercase tracking-[0.5em]">
                        Secure Healthcare Data Management
                    </p>
                </div>
            </div>
        </div>
    )
}

export default NurseCategory