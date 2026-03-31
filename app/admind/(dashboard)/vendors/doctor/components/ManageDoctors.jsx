'use client'

import React, { useState, useEffect } from 'react'
import { FaPlus, FaEdit, FaTrashAlt, FaEye, FaCheckCircle, FaClock, FaSpinner } from "react-icons/fa"
import DoctorDetailsModal from './DoctorDetailsModal'
import AdminAPI from '@/app/services/AdminAPI';

export default function ManageDoctors() {
    const [doctors, setDoctors] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    // alert(process.env.NEXT_PUBLIC_BACKEND_URL);

    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const fetchDoctors = async () => {
        setIsLoading(true);
        try {
            const res = await AdminAPI.getDoctorsList();
            // Using res.data based on your previously shared JSON structure
            setDoctors(res.data || []);
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDoctors();
    }, []);

    const handleViewDoctor = (doctor) => {
        setSelectedDoctor(doctor);
        setIsViewModalOpen(true);
    };

    const handleApprove = async (id) => {
        try {
            const res = await AdminAPI.approveDoctor(id);
            if (res.success) {
                setDoctors(prev => prev.map(d => d._id === id ? { ...d, profileStatus: 'Approved' } : d));
                setIsViewModalOpen(false);
                alert("Doctor approved successfully");
            }
        } catch (error) {
            alert("Approval failed");
        }
    };

    const handleReject = async (id, reason) => {
        try {
            const res = await AdminAPI.rejectDoctor(id, reason);
            if (res.success) {
                setDoctors(prev => prev.map(d => d._id === id ? { ...d, profileStatus: 'Rejected', rejectionReason: reason } : d));
                setIsViewModalOpen(false);
                alert("Doctor rejected");
            }
        } catch (error) {
            alert("Rejection failed");
        }
    };

    if (isLoading) return (
        <div className="w-full h-64 flex flex-col items-center justify-center">
            <FaSpinner className="animate-spin text-[#08B36A]" size={30} />
            <p className="text-slate-400 text-xs font-bold mt-4 uppercase">Loading Doctors...</p>
        </div>
    );

    return (
        <div className="space-y-6 relative">
            {/* <div className="flex justify-between items-center">
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-[#08B36A] text-white px-6 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-[#069658] transition-all shadow-lg"
                >
                    <FaPlus size={12} className="inline mr-2" /> Add New Doctor
                </button>
            </div> */}

            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400">S No.</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400">Doctor Info</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400">Contact</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400 text-center">Status</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {doctors.map((item, index) => (
                                <tr key={item._id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-5 text-sm font-bold text-slate-400">{index + 1}</td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100">
                                                <img src={item.profileImage ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/${item.profileImage}` : "https://via.placeholder.com/40"} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-900 text-sm">{item.name}</p>
                                                <p className="text-[10px] text-[#08B36A] font-bold uppercase">{item.speciality}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <p className="text-xs font-bold text-slate-700">{item.phone}</p>
                                        <p className="text-[10px] text-slate-400">{item.email}</p>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${item.profileStatus === 'Approved' ? 'bg-green-100 text-[#08B36A]' : 'bg-amber-100 text-amber-600'}`}>
                                            {item.profileStatus}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => handleViewDoctor(item)} className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 bg-slate-50 hover:bg-blue-500 hover:text-white transition-all"><FaEye size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <DoctorDetailsModal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                doctor={selectedDoctor}
                onApprove={handleApprove}
                onReject={handleReject}
            />
        </div>
    )
}