'use client'

import React, { useState } from 'react'
import { FaPlus, FaEdit, FaTrashAlt, FaEye } from "react-icons/fa"
// Assuming you will create these modal components or reuse existing ones
import AddQualificationModal from './AddQualificationModal'
import EditQualificationModal from './EditQualificationModal'
import ViewQualificationModal from './ViewQualificationModal'

const initialQualifications = [
    { id: 1, title: "MBBS", description: "Bachelor of Medicine and Bachelor of Surgery", code: "MED-01", status: "Active" },
    { id: 2, title: "MD - Cardiology", description: "Doctor of Medicine in Cardiology", code: "MED-02", status: "Active" },
    { id: 3, title: "FRCS", description: "Fellow of the Royal College of Surgeons", code: "SURG-05", status: "Inactive" },
];

export default function ManageQualifications() {
    const [qualifications, setQualifications] = useState(initialQualifications);
    const [selectedQualification, setSelectedQualification] = useState(null);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);

    const handleAdd = (data) => {
        setQualifications([{ ...data, id: Date.now() }, ...qualifications]);
    };

    const handleUpdate = (data) => {
        setQualifications(qualifications.map(q => q.id === data.id ? data : q));
    };

    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete this qualification?")) {
            setQualifications(qualifications.filter(q => q.id !== id));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center p-1 rounded-3xl">
                <button
                    onClick={() => setIsAddOpen(true)}
                    className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#08B36A] text-white px-6 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-[#069658] transition-all shadow-lg shadow-green-100"
                >
                    <FaPlus size={12} /> Add New Qualification
                </button>
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm shadow-slate-200/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">S No.</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Qualification Title</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Code</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {qualifications.map((item, index) => (
                                <tr key={item.id} className="hover:bg-slate-50/50 group transition-colors">
                                    <td className="px-6 py-5 text-sm font-bold text-slate-400">{index + 1}</td>
                                    <td className="px-6 py-5">
                                        <p className="font-black text-slate-900 text-sm tracking-tight">{item.title}</p>
                                        <p className="text-[10px] text-slate-400 truncate max-w-[250px]">{item.description}</p>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="inline-flex items-center justify-center px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-600">
                                            {item.code}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${item.status === 'Active' ? 'bg-green-100 text-[#08B36A]' : 'bg-slate-100 text-slate-400'}`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => { setSelectedQualification(item); setIsViewOpen(true); }} 
                                                className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 bg-slate-50 hover:bg-blue-500 hover:text-white transition-all"
                                            >
                                                <FaEye size={14} />
                                            </button>
                                            <button 
                                                onClick={() => { setSelectedQualification(item); setIsEditOpen(true); }} 
                                                className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 bg-slate-50 hover:bg-[#08B36A] hover:text-white transition-all"
                                            >
                                                <FaEdit size={14} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(item.id)} 
                                                className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 bg-slate-50 hover:bg-red-500 hover:text-white transition-all"
                                            >
                                                <FaTrashAlt size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modals */}
            {isAddOpen && (
                <AddQualificationModal
                    isOpen={isAddOpen}
                    onClose={() => setIsAddOpen(false)}
                    onAdd={handleAdd} 
                />
            )}

            {isEditOpen && (
                <EditQualificationModal
                    isOpen={isEditOpen}
                    onClose={() => setIsEditOpen(false)}
                    qualification={selectedQualification}
                    onUpdate={handleUpdate} 
                />
            )}

            {isViewOpen && (
                <ViewQualificationModal
                    isOpen={isViewOpen}
                    onClose={() => setIsViewOpen(false)}
                    qualification={selectedQualification} 
                />
            )}
        </div>
    )
}