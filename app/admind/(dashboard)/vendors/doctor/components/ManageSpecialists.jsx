'use client'

import React, { useState } from 'react'
import { FaPlus, FaEdit, FaTrashAlt, FaEye } from "react-icons/fa"
import AddSpecialtyModal from './AddSpecialtyModal'
import EditSpecialtyModal from './EditSpecialtyModal'
import ViewSpecialtyModal from './ViewSpecialtyModal'

const initialSpecialties = [
    { id: 1, title: "Cardiology", description: "Heart and blood vessel disorders", image: "❤️", status: "Active" },
    { id: 2, title: "Neurology", description: "Brain and nervous system specialized care", image: "🧠", status: "Active" },
    { id: 3, title: "Pediatrics", description: "Medical care for infants and children", image: "👶", status: "Inactive" },
];

export default function ManageSpecialists() {
    const [specialties, setSpecialties] = useState(initialSpecialties);
    const [selectedSpecialty, setSelectedSpecialty] = useState(null);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);

    const handleAdd = (data) => {
        setSpecialties([{ ...data, id: Date.now() }, ...specialties]);
    };

    const handleUpdate = (data) => {
        setSpecialties(specialties.map(s => s.id === data.id ? data : s));
    };

    const handleDelete = (id) => {
        if (confirm("Delete this specialty?")) setSpecialties(specialties.filter(s => s.id !== id));
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center p-1 rounded-3xl ">
                <button
                    onClick={() => setIsAddOpen(true)}
                    className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#08B36A] text-white px-6 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-[#069658] transition-all shadow-lg shadow-green-100"
                >
                    <FaPlus size={12} /> Add New Specialist
                </button>
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm shadow-slate-200/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">S No.</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Title</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Image</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {specialties.map((item, index) => (
                                <tr key={item.id} className="hover:bg-slate-50/50 group transition-colors">
                                    <td className="px-6 py-5 text-sm font-bold text-slate-400">{index + 1}</td>
                                    <td className="px-6 py-5">
                                        <p className="font-black text-slate-900 text-sm tracking-tight">{item.title}</p>
                                        <p className="text-[10px] text-slate-400 truncate max-w-[200px]">{item.description}</p>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xl overflow-hidden">
                                            {item.image.length > 5 ? <img src={item.image} className="w-full h-full object-cover" /> : item.image}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${item.status === 'Active' ? 'bg-green-100 text-[#08B36A]' : 'bg-slate-100 text-slate-400'}`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => { setSelectedSpecialty(item); setIsViewOpen(true); }} className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 bg-slate-50 hover:bg-blue-500 hover:text-white transition-all"><FaEye size={14} /></button>
                                            <button onClick={() => { setSelectedSpecialty(item); setIsEditOpen(true); }} className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 bg-slate-50 hover:bg-[#08B36A] hover:text-white transition-all"><FaEdit size={14} /></button>
                                            <button onClick={() => handleDelete(item.id)} className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 bg-slate-50 hover:bg-red-500 hover:text-white transition-all"><FaTrashAlt size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <AddSpecialtyModal
                isOpen={isAddOpen}
                onClose={() => setIsAddOpen(false)}
                onAdd={handleAdd} />

            <EditSpecialtyModal
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                specialty={selectedSpecialty}
                onUpdate={handleUpdate} />

            <ViewSpecialtyModal
                isOpen={isViewOpen}
                onClose={() => setIsViewOpen(false)}
                specialty={selectedSpecialty} />
    
        </div>
    )
}