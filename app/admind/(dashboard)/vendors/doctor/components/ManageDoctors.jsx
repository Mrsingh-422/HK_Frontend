'use client'

import React, { useState } from 'react'
import { FaPlus, FaEdit, FaTrashAlt, FaEye, FaCheckCircle, FaClock } from "react-icons/fa"
import DoctorDetailsModal from './DoctorDetailsModal'
import AddDoctorModal from './AddDoctorModal'
import EditDoctorModal from './EditDoctorModal' // New Import

const initialDoctors = [
    {
        id: 1,
        name: "Dr. Sarah Jenkins",
        email: "s.jenkins@hospital.com",
        phone: "+1 234-567-8901",
        image: "https://i.pravatar.cc/150?u=1",
        status: "Active",
        verifyStatus: "Verified",
        joinStatus: "Approved",
        specialty: "Cardiologist",
        experience: "12 Years",
        address: "123 Medical Plaza, NY"
    },
    {
        id: 2,
        name: "Dr. Marcus Chen",
        email: "m.chen@hospital.com",
        phone: "+1 234-567-8902",
        image: "https://i.pravatar.cc/150?u=2",
        status: "Inactive",
        verifyStatus: "Pending",
        joinStatus: "Under Review",
        specialty: "Neurologist",
        experience: "8 Years",
        address: "456 Health St, CA"
    },
    {
        id: 3,
        name: "Dr. Marcus Chen",
        email: "m.chen@hospital.com",
        phone: "+1 234-567-8902",
        image: "https://i.pravatar.cc/150?u=2",
        status: "Inactive",
        verifyStatus: "Pending",
        joinStatus: "Under Review",
        specialty: "Neurologist",
        experience: "8 Years",
        address: "456 Health St, CA"
    },
    {
        id: 4,
        name: "Dr. Marcus Chen",
        email: "m.chen@hospital.com",
        phone: "+1 234-567-8902",
        image: "https://i.pravatar.cc/150?u=2",
        status: "Inactive",
        verifyStatus: "Pending",
        joinStatus: "Under Review",
        specialty: "Neurologist",
        experience: "8 Years",
        address: "456 Health St, CA"
    },
    {
        id: 5,
        name: "Dr. Marcus Chen",
        email: "m.chen@hospital.com",
        phone: "+1 234-567-8902",
        image: "https://i.pravatar.cc/150?u=2",
        status: "Inactive",
        verifyStatus: "Pending",
        joinStatus: "Under Review",
        specialty: "Neurologist",
        experience: "8 Years",
        address: "456 Health St, CA"
    }
];

export default function ManageDoctors() {
    const [doctors, setDoctors] = useState(initialDoctors);
    const [selectedDoctor, setSelectedDoctor] = useState(null);

    // Modal Visibility States
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // --- ACTIONS ---

    const handleViewDoctor = (doctor) => {
        setSelectedDoctor(doctor);
        setIsViewModalOpen(true);
    };

    const handleEditClick = (doctor) => {
        setSelectedDoctor(doctor);
        setIsEditModalOpen(true);
    };

    const handleVerifyDoctor = (doctorId) => {
        const updated = doctors.map(doc =>
            doc.id === doctorId ? { ...doc, verifyStatus: 'Verified', joinStatus: 'Approved', status: 'Active' } : doc
        );
        setDoctors(updated);
        setSelectedDoctor(updated.find(d => d.id === doctorId));
    };

    const handleAddNewDoctor = (newDoctorData) => {
        const newDoctor = {
            ...newDoctorData,
            id: Date.now(),
            status: "Inactive",
            verifyStatus: "Pending",
            joinStatus: "Under Review"
        };
        setDoctors([newDoctor, ...doctors]);
    };

    const handleUpdateDoctor = (updatedDoctor) => {
        const updatedList = doctors.map(doc =>
            doc.id === updatedDoctor.id ? updatedDoctor : doc
        );
        setDoctors(updatedList);
        alert("Profile updated successfully!");
    };

    const handleDeleteDoctor = (id) => {
        if (window.confirm("Are you sure you want to delete this doctor?")) {
            setDoctors(doctors.filter(doc => doc.id !== id));
        }
    };

    return (
        <div className="space-y-6 relative">

            {/* --- TOP ACTION BAR --- */}
            <div className="flex flex-col md:flex-row justify-between items-center p-1 rounded-3xl ">
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#08B36A] text-white px-6 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-[#069658] transition-all shadow-lg shadow-green-100"
                >
                    <FaPlus size={12} /> Add New Doctor
                </button>
            </div>

            {/* --- TABLE --- */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm shadow-slate-200/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400">S No.</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400">Name</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400">Email</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400">Image</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400">Status</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400">Verification</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {doctors.map((item, index) => (
                                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-5 text-sm font-bold text-slate-400">{index + 1}</td>
                                    <td className="px-6 py-5 font-black text-slate-900 text-sm tracking-tight">{item.name}</td>
                                    <td className="px-6 py-5 text-slate-500 text-xs font-medium">{item.email}</td>
                                    <td className="px-6 py-5">
                                        <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-slate-100 group-hover:border-[#08B36A] transition-all">
                                            <img src={item.image} alt="doctor" className="w-full h-full object-cover" />
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${item.status === 'Active' ? 'bg-green-100 text-[#08B36A]' : 'bg-rose-100 text-rose-500'}`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2">
                                            {item.verifyStatus === 'Verified' ? <FaCheckCircle className="text-[#08B36A]" size={14} /> : <FaClock className="text-amber-500" size={14} />}
                                            <span className="text-[10px] font-black uppercase text-slate-600 tracking-tighter">{item.verifyStatus}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleViewDoctor(item)}
                                                className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 bg-slate-50 hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                                            >
                                                <FaEye size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleEditClick(item)}
                                                className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 bg-slate-50 hover:bg-[#0ea5e9] hover:text-white transition-all shadow-sm"
                                            >
                                                <FaEdit size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteDoctor(item.id)}
                                                className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 bg-slate-50 hover:bg-red-500 hover:text-white transition-all shadow-sm"
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

            {/* --- MODALS --- */}

            <DoctorDetailsModal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                doctor={selectedDoctor}
                onVerify={handleVerifyDoctor}
            />

            <AddDoctorModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={handleAddNewDoctor}
            />

            <EditDoctorModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                doctor={selectedDoctor}
                onUpdate={handleUpdateDoctor}
            />

        </div>
    )
}