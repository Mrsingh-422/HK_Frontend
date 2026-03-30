'use client'

import React, { useState } from 'react'
import { FaEye, FaCheckCircle, FaClock, FaHospital, FaPhoneAlt, FaBed } from "react-icons/fa"
import HospitalDetailsModal from './othercomponents/HospitalDetailsModal';

const ManageHospital = () => {
    const [hospitals, setHospitals] = useState([
        {
            id: 1,
            hospitalName: "CityCare Hospital",
            email: "citycare@gmail.com",
            phone: "9293125302",
            about: "Multi-speciality hospital with emergency services",
            address: "Rajbagh, Srinagar",
            licenseNumber: "LIC-HOSP-1001",
            licenseImage: "https://images.unsplash.com/photo-1586773860418-d3b97976c647?w=400",
            certificateImage: "https://images.unsplash.com/photo-1512678080530-7760d81faba6?w=400",
            otherDocuments: ["https://via.placeholder.com/150", "https://via.placeholder.com/150"],
            icuBeds: 10,
            generalWardBeds: 50,
            pharmacyService: true,
            hospitalService: true,
            walletAmount: 5000,
            registerAs: "Hospital",
            joinDate: "2026-01-11 15:07:04",
            accountVerifyStatus: "Pending", // Can be "Verified" or "Pending"
        },
        {
            id: 2,
            hospitalName: "CityCare Hospital",
            email: "citycare@gmail.com",
            phone: "9293125302",
            about: "Multi-speciality hospital with emergency services",
            address: "Rajbagh, Srinagar",
            licenseNumber: "LIC-HOSP-1001",
            licenseImage: "https://images.unsplash.com/photo-1586773860418-d3b97976c647?w=400",
            certificateImage: "https://images.unsplash.com/photo-1512678080530-7760d81faba6?w=400",
            otherDocuments: ["https://via.placeholder.com/150", "https://via.placeholder.com/150"],
            icuBeds: 10,
            generalWardBeds: 50,
            pharmacyService: true,
            hospitalService: true,
            walletAmount: 5000,
            registerAs: "Hospital",
            joinDate: "2026-01-11 15:07:04",
            accountVerifyStatus: "Verified", // Can be "Verified" or "Pending"
        }
    ]);

    const [selectedHospital, setSelectedHospital] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleView = (hosp) => {
        setSelectedHospital(hosp);
        setIsModalOpen(true);
    };

    const handleVerifyStatus = (id) => {
        setHospitals(prev => prev.map(h => h.id === id ? { ...h, accountVerifyStatus: 'Verified' } : h));
        setIsModalOpen(false);
    };

    return (
        <div className="w-full">
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left bg-white">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/50">
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">S No.</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Hospital Identity</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Contact Details</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Capacity</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Status</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {hospitals.map((h, index) => (
                            <tr key={h.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-6 py-5 text-xs font-bold text-slate-400">{(index + 1).toString().padStart(2, '0')}</td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-[#08B36A]">
                                            <FaHospital size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-800">{h.hospitalName}</p>
                                            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">{h.registerAs}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <p className="text-xs font-semibold text-slate-600 flex items-center gap-2"><FaPhoneAlt size={10} className="text-[#08B36A]" /> {h.phone}</p>
                                    <p className="text-[11px] text-slate-400 mt-0.5">{h.email}</p>
                                </td>
                                <td className="px-6 py-5 text-center">
                                    <div className="flex flex-col items-center">
                                        <div className="flex gap-2">
                                            <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-600 rounded">ICU: {h.icuBeds}</span>
                                            <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded">Gen: {h.generalWardBeds}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5 text-center">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${h.accountVerifyStatus === 'Verified'
                                        ? 'bg-[#08B36A]/10 text-[#08B36A]'
                                        : 'bg-amber-100 text-amber-600'
                                        }`}>
                                        {h.accountVerifyStatus}
                                    </span>
                                </td>
                                <td className="px-6 py-5 text-right">
                                    <button
                                        onClick={() => handleView(h)}
                                        className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-[#08B36A] hover:border-[#08B36A]/30 rounded-xl transition-all shadow-sm"
                                    >
                                        <FaEye size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <HospitalDetailsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                hospital={selectedHospital}
                onVerify={handleVerifyStatus}
            />
        </div>
    )
}

export default ManageHospital