'use client'

import React, { useState, useEffect } from 'react'
import { FaEye, FaUserMd, FaPhoneAlt, FaSpinner, FaStethoscope } from "react-icons/fa"
import HospitalDetailsModal from './othercomponents/HospitalDetailsModal';
import AdminAPI from '@/app/services/AdminAPI';

const ManageHospital = () => {
    const [doctors, setDoctors] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchDoctors = async () => {
        setIsLoading(true);
        try {
            const res = await AdminAPI.getAllHospitals();
            // In your provided response JSON, the array is in res.data
            setDoctors(res.data || []);
        } catch (error) {
            console.error("Error fetching doctors:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDoctors();
    }, []);

    const handleView = (doc) => {
        setSelectedDoctor(doc);
        setIsModalOpen(true);
    };

    const handleVerifyStatus = async (id) => {
        try {
            const response = await AdminAPI.approveHospital(id);

            if (response.success) {
                // Update local state immediately
                setDoctors(prev => prev.map(d => d._id === id ? { ...d, profileStatus: 'Approved' } : d));

                // If the currently viewed doctor was approved, update the modal's data too
                if (selectedDoctor && selectedDoctor._id === id) {
                    setSelectedDoctor(prev => ({ ...prev, profileStatus: 'Approved' }));
                }

                setIsModalOpen(false);
                alert("Hospital Approved successfully!");
            }
        } catch (error) {
            console.error("Approval failed:", error);
            alert(error.response?.data?.message || "Failed to approve.");
        }
    };

    if (isLoading) {
        return (
            <div className="w-full h-64 flex flex-col items-center justify-center gap-4 bg-white rounded-3xl border border-slate-100">
                <FaSpinner className="animate-spin text-[#08B36A]" size={30} />
                <p className="text-slate-400 text-sm font-bold tracking-widest uppercase">Loading Profiles...</p>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="overflow-x-auto bg-white rounded-2xl border border-slate-100 shadow-sm">
                <table className="w-full border-collapse text-left bg-white">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/50">
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">S No.</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Hospital Identity</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Contact Details</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Speciality</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Status</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {doctors.length > 0 ? (
                            doctors.map((doc, index) => (
                                <tr key={doc._id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-5 text-xs font-bold text-slate-400">{(index + 1).toString().padStart(2, '0')}</td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-[#08B36A] overflow-hidden border border-slate-200">
                                                {doc.profileImage ? (
                                                    <img src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${doc.profileImage}`} className="w-full h-full object-cover" />
                                                ) : (<FaUserMd size={20} />)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800">{doc.name}</p>
                                                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">{doc.role}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <p className="text-xs font-semibold text-slate-600 flex items-center gap-2"><FaPhoneAlt size={10} className="text-[#08B36A]" /> {doc.phone}</p>
                                        <p className="text-[11px] text-slate-400 mt-0.5">{doc.email}</p>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <span className="text-[10px] font-bold px-3 py-1 bg-blue-50 text-blue-600 rounded-full">{doc.speciality || 'General'}</span>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${doc.profileStatus === 'Approved' ? 'bg-[#08B36A]/10 text-[#08B36A]' : 'bg-amber-100 text-amber-600'}`}>
                                            {doc.profileStatus}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <button onClick={() => handleView(doc)} className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-[#08B36A] rounded-xl transition-all shadow-sm">
                                            <FaEye size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="6" className="px-6 py-10 text-center text-slate-400 text-sm font-medium">No records found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <HospitalDetailsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                hospital={selectedDoctor}
                onVerify={handleVerifyStatus}
            />
        </div>
    )
}

export default ManageHospital