'use client'

import React from 'react'
import {
    FaTimes, FaUserInjured, FaHospital, FaCalendarAlt,
    FaFileMedical, FaUserMd, FaMoneyCheckAlt, FaFileInvoice,
    FaStethoscope, FaCheckCircle, FaExternalLinkAlt
} from "react-icons/fa"

const DischargeDetailsModal = ({ isOpen, onClose, data }) => {
    if (!isOpen || !data) return null;

    const isEmergency = data.caseType === 'Emergency';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" onClick={onClose} />

            {/* Modal Container */}
            <div className="relative bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300 max-h-[95vh]">

                {/* --- HEADER --- */}
                <div className={`p-8 border-b border-slate-100 flex justify-between items-center ${isEmergency ? 'bg-rose-50/30' : 'bg-slate-50/50'}`}>
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${isEmergency ? 'bg-rose-500 shadow-rose-200' : 'bg-[#08B36A] shadow-emerald-200'}`}>
                            <FaFileMedical size={20} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Case <span className="text-[#08B36A]">Summary</span></h2>
                                <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${isEmergency ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'}`}>
                                    {data.caseType}
                                </span>
                            </div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Reference No: {data.caseNo}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-slate-600 rounded-2xl transition-all shadow-sm">
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* --- CONTENT --- */}
                <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">

                    {/* Primary Info: Patient & Doctor */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-slate-100 pb-8">
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400 shadow-inner">
                                <FaUserInjured size={28} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient Name</p>
                                <h3 className="text-xl font-black text-slate-800">{data.patientName}</h3>
                                <p className="text-xs font-bold text-[#08B36A] uppercase flex items-center gap-1 mt-1">
                                    <FaCheckCircle size={10} /> {data.status}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-5 bg-slate-50 p-4 rounded-3xl border border-slate-100">
                            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-[#08B36A] shadow-sm">
                                <FaUserMd size={22} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Attending Doctor</p>
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">{data.doctorName}</h3>
                            </div>
                        </div>
                    </div>

                    {/* Technical Grid: Hospital, Dates, Price */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <InfoItem icon={<FaHospital />} label="Healthcare Facility" value={data.hospitalName} />
                        <InfoItem icon={<FaCalendarAlt />} label="Stay Duration" value={`${data.appointmentDate} to ${data.dischargeDate}`} />
                        <InfoItem
                            icon={<FaMoneyCheckAlt />}
                            label="Total Billing"
                            value={`₹${data.price.toLocaleString()}`}
                            isHighlight
                        />
                    </div>

                    {/* Services Section */}
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <FaStethoscope size={12} className="text-[#08B36A]" /> Services Rendered
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {data.services.map((service, idx) => (
                                <span key={idx} className="px-4 py-2 bg-slate-100 border border-slate-200 text-slate-600 rounded-xl text-[11px] font-bold shadow-sm">
                                    {service}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Invoice Section */}
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <FaFileInvoice size={12} className="text-[#08B36A]" /> Digital Documentation
                        </h4>
                        <a
                            href={data.hospitalInvoice}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-5 bg-white border border-dashed border-slate-300 rounded-[2rem] hover:border-[#08B36A] hover:bg-[#08B36A]/5 transition-all group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-slate-100 rounded-2xl text-slate-400 group-hover:text-[#08B36A] transition-colors">
                                    <FaFileInvoice size={24} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-700">Hospital Discharge Invoice</p>
                                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Official Audit Document</p>
                                </div>
                            </div>
                            <FaExternalLinkAlt className="text-slate-300 group-hover:text-[#08B36A]" size={14} />
                        </a>
                    </div>
                </div>

                {/* --- FOOTER --- */}
                <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl active:scale-95"
                    >
                        Dismiss Record
                    </button>
                </div>
            </div>
        </div>
    )
}

/** 
 * Reusable Mini-Card for stats 
 */
const InfoItem = ({ icon, label, value, isHighlight }) => (
    <div className={`p-5 rounded-3xl border transition-all ${isHighlight ? 'bg-[#08B36A]/5 border-[#08B36A]/20 shadow-inner' : 'bg-white border-slate-100'}`}>
        <div className={`mb-3 flex items-center gap-2 ${isHighlight ? 'text-[#08B36A]' : 'text-slate-300'}`}>
            {React.cloneElement(icon, { size: 16 })}
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</span>
        </div>
        <p className={`text-sm font-black ${isHighlight ? 'text-[#08B36A] text-lg' : 'text-slate-700'}`}>{value}</p>
    </div>
)

export default DischargeDetailsModal