'use client'

import React, { useState, useEffect } from 'react'
import { FaPlus, FaEdit, FaTrashAlt, FaEye, FaGraduationCap, FaSpinner } from "react-icons/fa"
import AddQualificationModal from './AddQualificationModal'
import EditQualificationModal from './EditQualificationModal'
import ViewQualificationModal from './ViewQualificationModal'
import AdminAPI from '@/app/services/AdminAPI'
// Import your api service

export default function ManageQualifications() {
    const [qualifications, setQualifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedQualification, setSelectedQualification] = useState(null);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);

    // --- FETCH DATA ---
    const loadData = async () => {
        try {
            setLoading(true);
            const response = await AdminAPI.viewDoctorQualifications();
            setQualifications(response.data || []);
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // --- CREATE ---
    const handleAdd = async (formData) => {
        try {
            await AdminAPI.addDoctorQualification({ name: formData.name });
            setIsAddOpen(false);
            loadData();
        } catch (error) {
            alert("Error adding qualification");
        }
    };

    // --- UPDATE ---
    const handleUpdate = async (formData) => {
        try {
            await AdminAPI.updateDoctorQualification(formData._id, { name: formData.name });
            setIsEditOpen(false);
            loadData();
        } catch (error) {
            alert("Error updating qualification");
        }
    };

    // --- DELETE ---
    const handleDelete = async (id) => {
        if (!confirm("Delete this qualification?")) return;
        try {
            await AdminAPI.deleteDoctorQualification(id);
            setQualifications(prev => prev.filter(q => q._id !== id));
        } catch (error) {
            alert("Error deleting qualification");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center p-1">
                <button
                    onClick={() => setIsAddOpen(true)}
                    className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#08B36A] text-white px-6 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-[#069658] transition-all shadow-lg shadow-green-100"
                >
                    <FaPlus size={12} /> Add New Qualification
                </button>
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm shadow-slate-200/50 overflow-hidden min-h-[300px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 text-slate-300">
                        <FaSpinner className="animate-spin mb-4" size={32} />
                        <p className="text-[10px] font-black uppercase tracking-widest">Loading Qualifications...</p>
                    </div> 
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 w-20">S No.</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Degree Name</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">System ID</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {qualifications.map((item, index) => (
                                    <tr key={item._id} className="hover:bg-slate-50/50 group transition-colors">
                                        <td className="px-6 py-5 text-sm font-bold text-slate-400">{index + 1}</td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                                    <FaGraduationCap size={16} />
                                                </div>
                                                <p className="font-black text-slate-900 text-sm tracking-tight">{item.name}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 font-mono text-[10px] text-slate-400">
                                            {item._id}
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => { setSelectedQualification(item); setIsViewOpen(true); }} className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 bg-slate-50 hover:bg-blue-500 hover:text-white transition-all shadow-sm"><FaEye size={14} /></button>
                                                <button onClick={() => { setSelectedQualification(item); setIsEditOpen(true); }} className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 bg-slate-50 hover:bg-sky-600 hover:text-white transition-all shadow-sm"><FaEdit size={14} /></button>
                                                <button onClick={() => handleDelete(item._id)} className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 bg-slate-50 hover:bg-red-500 hover:text-white transition-all shadow-sm"><FaTrashAlt size={14} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {isAddOpen && <AddQualificationModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onAdd={handleAdd} />}
            {isEditOpen && <EditQualificationModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} qualification={selectedQualification} onUpdate={handleUpdate} />}
            {isViewOpen && <ViewQualificationModal isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} qualification={selectedQualification} />}
        </div>
    )
}