'use client'

import React, { useState, useEffect } from 'react'
import { FaPlus, FaEdit, FaTrashAlt, FaEye, FaStethoscope, FaSpinner } from "react-icons/fa"
import AddSpecialtyModal from './AddSpecialtyModal'
import EditSpecialtyModal from './EditSpecialtyModal'
import ViewSpecialtyModal from './ViewSpecialtyModal'
import AdminAPI from '@/app/services/AdminAPI'
// Import your API object here
// import { api } from '@/services/api'; 

export default function ManageSpecialists() {
    const [specialties, setSpecialties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSpecialty, setSelectedSpecialty] = useState(null);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);

    // --- 1. FETCH DATA (READ) ---
    const loadSpecialties = async () => {
        try {
            setLoading(true);
            const response = await AdminAPI.viewDoctorSpecialties();
            // Assuming the response structure is { data: [...] }
            setSpecialties(response.data || []);
        } catch (error) {
            console.error("Error fetching specialties:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSpecialties();
    }, []);

    // --- 2. ADD DATA (CREATE) ---
    const handleAdd = async (formData) => {
        try {
            // Mapping formData to match your backend (name)
            await AdminAPI.addDoctorSpecialty({ name: formData.name });
            setIsAddOpen(false);
            loadSpecialties(); // Refresh list
        } catch (error) {
            console.error("Error adding specialty:", error);
            alert("Failed to add specialty");
        }
    };

    // --- 3. UPDATE DATA (UPDATE) ---
    const handleUpdate = async (formData) => {
        try {
            await AdminAPI.updateDoctorSpecialty(formData._id, { name: formData.name });
            setIsEditOpen(false);
            loadSpecialties(); // Refresh list
        } catch (error) {
            console.error("Error updating specialty:", error);
            alert("Update failed");
        }
    };

    // --- 4. DELETE DATA (DELETE) ---
    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this specialty?")) return;
        
        try {
            await AdminAPI.deleteDoctorSpecialty(id);
            // Optimistic UI update
            setSpecialties(prev => prev.filter(item => item._id !== id));
        } catch (error) {
            console.error("Error deleting specialty:", error);
            alert("Delete failed");
        }
    };

    return (
        <div className="space-y-6">
            {/* Header Action */}
            <div className="flex flex-col md:flex-row justify-between items-center p-1">
                <button
                    onClick={() => setIsAddOpen(true)}
                    className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#08B36A] text-white px-6 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-[#069658] transition-all shadow-lg shadow-green-100"
                >
                    <FaPlus size={12} /> Add New Specialist
                </button>
            </div>

            {/* Main Table Container */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm shadow-slate-200/50 overflow-hidden min-h-[300px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 text-slate-300">
                        <FaSpinner className="animate-spin mb-4" size={32} />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em]">Synchronizing Database...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 w-20">S No.</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Specialization Name</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Reference ID</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {specialties.length > 0 ? (
                                    specialties.map((item, index) => (
                                        <tr key={item._id} className="hover:bg-slate-50/50 group transition-colors">
                                            <td className="px-6 py-5 text-sm font-bold text-slate-400">{index + 1}</td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-green-50 text-[#08B36A] flex items-center justify-center group-hover:bg-[#08B36A] group-hover:text-white transition-all">
                                                        <FaStethoscope size={14} />
                                                    </div>
                                                    <p className="font-black text-slate-900 text-sm tracking-tight">{item.name}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <code className="text-[9px] font-mono bg-slate-100 px-2 py-1 rounded text-slate-400">
                                                    {item._id}
                                                </code>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => { setSelectedSpecialty(item); setIsViewOpen(true); }} className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 bg-slate-50 hover:bg-blue-500 hover:text-white transition-all"><FaEye size={14} /></button>
                                                    <button onClick={() => { setSelectedSpecialty(item); setIsEditOpen(true); }} className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 bg-slate-50 hover:bg-[#08B36A] hover:text-white transition-all"><FaEdit size={14} /></button>
                                                    <button onClick={() => handleDelete(item._id)} className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 bg-slate-50 hover:bg-red-500 hover:text-white transition-all"><FaTrashAlt size={14} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-24 text-center">
                                            <p className="text-slate-400 font-bold text-sm">No specializations found.</p>
                                            <p className="text-[10px] text-slate-300 uppercase tracking-widest mt-1">Click "Add New" to get started</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modals - Passed backend data as props */}
            {isAddOpen && (
                <AddSpecialtyModal 
                    isOpen={isAddOpen} 
                    onClose={() => setIsAddOpen(false)} 
                    onAdd={handleAdd} 
                />
            )}
            
            {isEditOpen && (
                <EditSpecialtyModal 
                    isOpen={isEditOpen} 
                    onClose={() => setIsEditOpen(false)} 
                    specialty={selectedSpecialty} 
                    onUpdate={handleUpdate} 
                />
            )}
            
            {isViewOpen && (
                <ViewSpecialtyModal 
                    isOpen={isViewOpen} 
                    onClose={() => setIsViewOpen(false)} 
                    specialty={selectedSpecialty} 
                />
            )}
        </div>
    )
}