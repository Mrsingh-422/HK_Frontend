'use client'
import React, { useState } from 'react';
import { 
    FaSearch, FaFilter, FaFileDownload, FaHistory, 
    FaRegCalendarCheck, FaStethoscope, FaNotesMedical, 
    FaUserCheck, FaEye, FaTimes, FaFilePdf, FaRegClock
} from 'react-icons/fa';
import { MdOutlineMoreVert, MdHistoryEdu } from 'react-icons/md';
import { RiStethoscopeLine, RiHospitalLine } from 'react-icons/ri';

// ==========================================
// 🌟 DUMMY DATA FOR HISTORY CASES 🌟
// ==========================================
const historyData =[
    {
        id: 'HIS-2026-8091',
        patientName: 'Vikas Sharma',
        age: 45,
        gender: 'Male',
        caseType: 'Admission',
        diagnosis: 'Acute Appendicitis',
        treatment: 'Appendectomy Surgery',
        doctor: 'Dr. R.K. Sharma',
        admissionDate: '02 Mar 2026',
        dischargeDate: '06 Mar 2026',
        duration: '4 Days',
        status: 'Completed',
        followUp: '15 Mar 2026'
    },
    {
        id: 'HIS-2026-8092',
        patientName: 'Meera Rajput',
        age: 32,
        gender: 'Female',
        caseType: 'Emergency',
        diagnosis: 'Severe Dehydration & Vertigo',
        treatment: 'IV Fluids & Medication',
        doctor: 'Dr. Anil Kumar',
        admissionDate: '10 Mar 2026',
        dischargeDate: '11 Mar 2026',
        duration: '1 Day',
        status: 'Follow-up Required',
        followUp: '18 Mar 2026'
    },
    {
        id: 'HIS-2026-8093',
        patientName: 'Sanjay Dutt',
        age: 58,
        gender: 'Male',
        caseType: 'OPD',
        diagnosis: 'Chronic Hypertension',
        treatment: 'Medication Adjusted',
        doctor: 'Dr. Sunita Rao',
        admissionDate: '12 Mar 2026',
        dischargeDate: '12 Mar 2026',
        duration: '2 Hours',
        status: 'Completed',
        followUp: 'Next Month'
    },
    {
        id: 'HIS-2026-8094',
        patientName: 'Aisha Khan',
        age: 24,
        gender: 'Female',
        caseType: 'Admission',
        diagnosis: 'Dengue Fever',
        treatment: 'Platelet Monitoring & Care',
        doctor: 'Dr. V. Patil',
        admissionDate: '25 Feb 2026',
        dischargeDate: '05 Mar 2026',
        duration: '8 Days',
        status: 'Referred',
        followUp: 'None'
    },
];

export default function HistoryPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('All');
    
    // 🌟 Modal State 🌟
    const [selectedHistory, setSelectedHistory] = useState(null);
    const[isModalOpen, setIsModalOpen] = useState(false);

    const openModal = (data) => {
        setSelectedHistory(data);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setTimeout(() => setSelectedHistory(null), 200);
    };

    const getInitials = (name) => {
        return name.split(' ').map(n => n[0]).join('').substring(0, 2);
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Completed': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
            case 'Follow-up Required': return 'bg-amber-50 text-amber-600 border-amber-200';
            case 'Referred': return 'bg-blue-50 text-blue-600 border-blue-200';
            default: return 'bg-gray-50 text-gray-600 border-gray-200';
        }
    };

    const getCaseTypeStyle = (type) => {
        switch (type) {
            case 'Admission': return { icon: <RiHospitalLine />, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' };
            case 'Emergency': return { icon: <FaNotesMedical />, color: 'text-rose-600 bg-rose-50 border-rose-100' };
            case 'OPD': return { icon: <RiStethoscopeLine />, color: 'text-teal-600 bg-teal-50 border-teal-100' };
            default: return { icon: <MdHistoryEdu />, color: 'text-gray-600 bg-gray-50 border-gray-100' };
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500 pb-10 relative">
            
            {/* --- HEADER SECTION --- */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                            <FaHistory size={22} />
                        </div>
                        Patient History Records
                    </h1>
                    <p className="text-sm text-gray-500 mt-1 ml-12">View and manage past treatments, discharges, and medical logs.</p>
                </div>
                
                <button className="bg-white border border-emerald-600 text-emerald-600 hover:bg-emerald-50 hover:-translate-y-0.5 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm flex items-center gap-2 group">
                    <FaFileDownload className="group-hover:animate-bounce" /> Export Records
                </button>
            </div>

            {/* --- SMART STATISTICS CARDS --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Past Cases</p>
                            <h3 className="text-3xl font-extrabold text-gray-800 mt-1">1,248</h3>
                            <p className="text-xs text-emerald-500 font-medium mt-1">All time records</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-xl">
                            <MdHistoryEdu />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Successfully Discharged</p>
                            <h3 className="text-3xl font-extrabold text-gray-800 mt-1">982</h3>
                            <p className="text-xs text-emerald-500 font-medium mt-1 flex items-center gap-1">↑ 8% this month</p>
                        </div>
                        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-xl">
                            <FaUserCheck />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Avg. Recovery Duration</p>
                            <h3 className="text-3xl font-extrabold text-gray-800 mt-1">4.5 <span className="text-lg text-gray-400 font-medium">Days</span></h3>
                        </div>
                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-xl">
                            <FaRegClock />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Pending Follow-ups</p>
                            <h3 className="text-3xl font-extrabold text-gray-800 mt-1">45</h3>
                        </div>
                        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center text-xl">
                            <FaRegCalendarCheck />
                        </div>
                    </div>
                </div>
            </div>

            {/* --- MAIN DATA TABLE SECTION --- */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/40">
                    <div className="relative w-full sm:w-80 group">
                        <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Search by Patient, ID or Diagnosis..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-emerald-50 focus:border-emerald-400 transition-all shadow-sm"
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm hover:border-emerald-300 transition-colors cursor-pointer">
                            <FaFilter className="text-gray-400" />
                            <select 
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="bg-transparent text-sm text-gray-700 font-medium focus:outline-none cursor-pointer w-full"
                            >
                                <option value="All">All Case Types</option>
                                <option value="Admission">Admission</option>
                                <option value="Emergency">Emergency</option>
                                <option value="OPD">OPD</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="bg-gray-50/80 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-bold">
                                <th className="p-4 pl-6">Patient Info</th>
                                <th className="p-4">Case Type</th>
                                <th className="p-4">Diagnosis & Doctor</th>
                                <th className="p-4">Duration</th>
                                <th className="p-4">Final Status</th>
                                <th className="p-4 text-center pr-6">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {historyData.map((data, index) => {
                                const typeUI = getCaseTypeStyle(data.caseType);
                                return (
                                <tr 
                                    key={index} 
                                    onClick={() => openModal(data)} 
                                    className="hover:bg-emerald-50/30 transition-all duration-200 group cursor-pointer"
                                >
                                    <td className="p-4 pl-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold shadow-sm group-hover:scale-110 transition-transform">
                                                {getInitials(data.patientName)}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-800 text-sm group-hover:text-emerald-600 transition-colors">{data.patientName}</span>
                                                <span className="text-xs text-gray-500 font-medium mt-0.5">
                                                    {data.id} • {data.age} Yrs
                                                </span>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="p-4">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${typeUI.color}`}>
                                            {typeUI.icon} {data.caseType}
                                        </span>
                                    </td>

                                    <td className="p-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-sm font-bold text-gray-700">{data.diagnosis}</span>
                                            <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                                                <FaStethoscope size={10} className="text-gray-400" /> {data.doctor}
                                            </span>
                                        </div>
                                    </td>

                                    <td className="p-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-sm text-gray-700 font-medium flex items-center gap-1.5">
                                                <FaRegClock className="text-gray-400" size={12}/> {data.duration}
                                            </span>
                                            <span className="text-[11px] text-gray-400">
                                                {data.admissionDate} - {data.dischargeDate}
                                            </span>
                                        </div>
                                    </td>

                                    <td className="p-4">
                                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${getStatusStyle(data.status)}`}>
                                            {data.status}
                                        </span>
                                    </td>

                                    <td className="p-4 pr-6" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center justify-center gap-2">
                                            <button 
                                                title="View History Details"
                                                onClick={() => openModal(data)}
                                                className="p-2 text-emerald-600 hover:text-white hover:bg-emerald-600 rounded-lg transition-all border border-emerald-100 hover:shadow-md"
                                            >
                                                <FaEye size={16} />
                                            </button>
                                            <button 
                                                title="Download PDF"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    alert("Downloading PDF Report...");
                                                }}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                            >
                                                <FaFilePdf size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>
                
                <div className="p-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500 bg-white">
                    <span className="font-medium">Showing 1 to 4 of 1,248 entries</span>
                    <div className="flex gap-1.5">
                        <button className="px-3 py-1.5 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 font-medium transition-colors text-gray-600">Previous</button>
                        <button className="px-3 py-1.5 border border-emerald-600 rounded-lg bg-emerald-600 text-white font-medium shadow-sm">1</button>
                        <button className="px-3 py-1.5 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 font-medium transition-colors text-gray-600">2</button>
                        <button className="px-3 py-1.5 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 font-medium transition-colors text-gray-600">Next</button>
                    </div>
                </div>
            </div>

            {/* ========================================== */}
            {/* 🌟 PATIENT HISTORY MODAL (COMPACT & CUTE)🌟*/}
            {/* ========================================== */}
            {isModalOpen && selectedHistory && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 transition-all duration-300">
                    {/* Width kam ki (max-w-xl) aur padding ghatayi hai */}
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-300">
                        
                        {/* Modal Header */}
                        <div className="px-5 py-3 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-emerald-50 to-white">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold shadow-md">
                                    {getInitials(selectedHistory.patientName)}
                                </div>
                                <div>
                                    <h2 className="text-sm font-bold text-gray-800 tracking-tight leading-none">
                                        Case History Record
                                    </h2>
                                    <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">{selectedHistory.id}</p>
                                </div>
                            </div>
                            <button 
                                onClick={closeModal} 
                                className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-all"
                            >
                                <FaTimes size={14} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-5">
                            
                            {/* Top Grid */}
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="col-span-2 sm:col-span-1 border border-gray-100 rounded-xl p-3 bg-gray-50/50">
                                    <p className="text-[9px] uppercase tracking-wider text-gray-400 font-bold mb-1">Patient Bio</p>
                                    <p className="font-bold text-gray-800 text-sm">{selectedHistory.patientName}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{selectedHistory.age} Years, {selectedHistory.gender}</p>
                                </div>
                                <div className="col-span-2 sm:col-span-1 border border-gray-100 rounded-xl p-3 bg-gray-50/50">
                                    <p className="text-[9px] uppercase tracking-wider text-gray-400 font-bold mb-1">Treating Doctor</p>
                                    <p className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
                                        <FaStethoscope className="text-emerald-500" size={12} /> {selectedHistory.doctor}
                                    </p>
                                    <span className={`inline-block mt-1.5 px-2 py-0.5 rounded text-[9px] font-bold border ${getCaseTypeStyle(selectedHistory.caseType).color}`}>
                                        {selectedHistory.caseType} Case
                                    </span>
                                </div>
                            </div>

                            {/* Middle Section: Medical Summary (COMPACT VERTICAL TIMELINE) */}
                            <div className="border border-emerald-100 bg-emerald-50/30 rounded-xl p-4 mb-4">
                                <h3 className="text-xs font-bold text-emerald-800 mb-3 flex items-center gap-1.5">
                                    <FaNotesMedical size={12}/> Medical Summary
                                </h3>
                                
                                <div className="flex flex-col gap-3 relative before:absolute before:top-2 before:bottom-2 before:left-[9px] before:w-0.5 before:bg-gradient-to-b before:from-emerald-300 before:to-blue-300">
                                    
                                    {/* Diagnosis Node */}
                                    <div className="relative flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-full border-2 border-white bg-emerald-500 shadow-sm z-10 shrink-0"></div>
                                        <div className="bg-white p-2.5 rounded-lg shadow-sm border border-gray-100 w-full">
                                            <p className="text-[10px] text-gray-400 font-medium mb-0.5">Final Diagnosis</p>
                                            <p className="text-sm font-bold text-gray-800">{selectedHistory.diagnosis}</p>
                                        </div>
                                    </div>

                                    {/* Treatment Node */}
                                    <div className="relative flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-full border-2 border-white bg-blue-500 shadow-sm z-10 shrink-0"></div>
                                        <div className="bg-white p-2.5 rounded-lg shadow-sm border border-gray-100 w-full">
                                            <p className="text-[10px] text-gray-400 font-medium mb-0.5">Treatment Rendered</p>
                                            <p className="text-sm font-bold text-gray-800">{selectedHistory.treatment}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Timeline Dates Footer */}
                                <div className="mt-4 flex justify-between items-center pt-3 border-t border-emerald-100/50">
                                    <div>
                                        <p className="text-[9px] text-gray-400 font-bold uppercase">Admitted</p>
                                        <p className="text-xs font-semibold text-gray-700">{selectedHistory.admissionDate}</p>
                                    </div>
                                    <div className="text-center px-2 py-0.5 bg-white rounded-full border border-gray-100 shadow-sm">
                                        <p className="text-[10px] font-bold text-emerald-600">{selectedHistory.duration}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] text-gray-400 font-bold uppercase">Discharged</p>
                                        <p className="text-xs font-semibold text-gray-700">{selectedHistory.dischargeDate}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Bottom Grid: Status & Follow-up */}
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <div>
                                    <p className="text-[10px] text-gray-500 mb-0.5">Final Status</p>
                                    <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusStyle(selectedHistory.status)}`}>
                                        {selectedHistory.status}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-gray-500 mb-0.5">Scheduled Follow-up</p>
                                    <p className={`font-bold text-xs ${selectedHistory.followUp !== 'None' ? 'text-amber-600' : 'text-gray-400'}`}>
                                        {selectedHistory.followUp !== 'None' ? <span className="flex items-center gap-1 justify-end"><FaRegCalendarCheck size={10}/> {selectedHistory.followUp}</span> : 'No Follow-up'}
                                    </p>
                                </div>
                            </div>

                        </div>

                        {/* Modal Footer */}
                        <div className="px-5 py-3 border-t border-gray-100 flex justify-end gap-2 bg-gray-50">
                            <button 
                                onClick={closeModal} 
                                className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg font-semibold text-xs hover:bg-gray-100 transition-colors shadow-sm"
                            >
                                Close
                            </button>
                            <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold text-xs hover:bg-emerald-700 transition-all shadow-md shadow-emerald-200 flex items-center gap-1.5">
                                <FaFilePdf size={12} /> Full Report
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
        </div>
    );
}