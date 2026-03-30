'use client'

import React, { useState } from 'react'
import { FaEye, FaFilter } from "react-icons/fa"
import DischargeDetailsModal from './othercomponents/DischargeDetailsModal';

function HospitalDischargeHistory() {
    // --- STATE ---
    const [filterType, setFilterType] = useState('All');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);

    const historyData = [
        {
            id: 1,
            caseType: "Emergency",
            caseNo: "EMG-99012",
            doctorName: "Dr. Jaswal",
            patientName: "Ahmed Shah",
            hospitalName: "Radius Hospital",
            appointmentDate: "2026-03-20",
            dischargeDate: "2026-03-25",
            price: 5000,
            hospitalInvoice: "https://via.placeholder.com/150?text=Invoice+1",
            services: ["ICU Care", "Blood Test"],
            status: "Discharged"
        },
        {
            id: 2,
            caseType: "Referral",
            caseNo: "REF-88021",
            doctorName: "Dr. Aamir",
            patientName: "Zubair Lone",
            hospitalName: "CityCare Hospital",
            appointmentDate: "2026-03-18",
            dischargeDate: "2026-03-22",
            price: 3000,
            hospitalInvoice: "https://via.placeholder.com/150?text=Invoice+2",
            services: ["X-Ray", "Consultation"],
            status: "Completed"
        },
        {
            id: 3,
            caseType: "Emergency",
            caseNo: "EMG-77123",
            doctorName: "Dr. Imran",
            patientName: "Bilal Ahmad",
            hospitalName: "HealthPlus Clinic",
            appointmentDate: "2026-03-15",
            dischargeDate: "2026-03-19",
            price: 4500,
            hospitalInvoice: "https://via.placeholder.com/150?text=Invoice+3",
            services: ["Surgery", "Medicines"],
            status: "Discharged"
        },
        {
            id: 4,
            caseType: "Referral",
            caseNo: "REF-66554",
            doctorName: "Dr. Shahid",
            patientName: "Not Defined",
            hospitalName: "CarePoint Center",
            appointmentDate: "2026-03-10",
            dischargeDate: null,
            price: 0,
            hospitalInvoice: "https://via.placeholder.com/150?text=Invoice+4",
            services: [],
            status: "Pending"
        },
        {
            id: 5,
            caseType: "Emergency",
            caseNo: "EMG-55443",
            doctorName: "Dr. Khan",
            patientName: "Aqib Mir",
            hospitalName: "PharmaCare Hospital",
            appointmentDate: "2026-03-12",
            dischargeDate: "2026-03-16",
            price: 6000,
            hospitalInvoice: "https://via.placeholder.com/150?text=Invoice+5",
            services: ["ICU", "MRI Scan"],
            status: "Discharged"
        }
    ];

    // --- LOGIC FUNCTIONS ---
    const handleViewDetails = (record) => {
        setSelectedRecord(record);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedRecord(null);
    };

    const filteredData = filterType === 'All'
        ? historyData
        : historyData.filter(item => item.caseType === filterType);

    return (
        <div className="w-full bg-white">

            {/* Filter Header */}
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Audit <span className="text-[#08B36A]">History</span></h2>
                </div>

                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-4 py-2 rounded-2xl">
                    <FaFilter className="text-slate-400" size={12} />
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="bg-transparent text-xs font-black text-slate-600 outline-none uppercase tracking-widest cursor-pointer"
                    >
                        <option value="All">All Cases</option>
                        <option value="Referral">Referral Case</option>
                        <option value="Emergency">Emergency Case</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Sr.No</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Case Type</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Case No</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Patient Name</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Appt Date</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Dsch Date</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredData.map((item, index) => (
                            <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                                <td className="px-8 py-5 text-xs font-bold text-slate-400 italic">{(index + 1).toString().padStart(2, '0')}</td>
                                <td className="px-8 py-5">
                                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${item.caseType === 'Emergency Case' ? 'bg-rose-50 text-rose-500 border border-rose-100' : 'bg-blue-50 text-blue-500 border border-blue-100'}`}>
                                        {item.caseType}
                                    </span>
                                </td>
                                <td className="px-8 py-5 text-sm font-mono font-bold text-slate-700">{item.caseNo}</td>
                                <td className="px-8 py-5 text-sm font-bold text-slate-800 uppercase tracking-tight">{item.patientName}</td>
                                <td className="px-8 py-5 text-xs font-medium text-slate-500">{item.appointmentDate}</td>
                                <td className="px-8 py-5 text-xs font-medium text-slate-500">{item.dischargeDate}</td>
                                <td className="px-8 py-5 text-right">
                                    <button
                                        onClick={() => handleViewDetails(item)}
                                        className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-[#08B36A] hover:bg-[#08B36A]/10 rounded-xl transition-all shadow-sm"
                                    >
                                        <FaEye size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* --- CALLING MODAL COMPONENT --- */}
            <DischargeDetailsModal
                isOpen={isModalOpen}
                onClose={closeModal}
                data={selectedRecord}
            />

        </div>
    )
}

export default HospitalDischargeHistory