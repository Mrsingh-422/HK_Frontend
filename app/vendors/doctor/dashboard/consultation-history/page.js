'use client'
import React, { useState } from 'react'
import { 
    FaSearch, FaFilter, FaCalendarAlt, FaUser, FaCheckCircle, 
    FaTimesCircle, FaExclamationTriangle, FaVideo, FaPhoneAlt, 
    FaHospitalUser, FaEye, FaTimes, FaFilePrescription, FaStethoscope, FaDownload
} from "react-icons/fa";

export default function ConsultationHistoryPage() {
    // ==========================================
    // 🌟 1. STATE MANAGEMENT
    // ==========================================
    const [activeTab, setActiveTab] = useState('All');
    const[searchQuery, setSearchQuery] = useState('');
    const [selectedHistory, setSelectedHistory] = useState(null); // For Details Modal

    // 🌟 Dummy History Data 🌟
    const [historyData, setHistoryData] = useState([
        { id: '#HIS-2001', name: 'Rahul Sharma', age: 28, phone: '+91 9876543210', date: '12 Mar 2026', time: '10:30 AM', type: 'Video', status: 'Completed', typeIcon: FaVideo, reason: 'Viral Fever & Cough', notes: 'Patient has mild fever. Prescribed Paracetamol and advised 3 days rest.' },
        { id: '#HIS-2002', name: 'Priya Singh', age: 34, phone: '+91 8765432109', date: '11 Mar 2026', time: '11:15 AM', type: 'Audio', status: 'Completed', typeIcon: FaPhoneAlt, reason: 'Routine Checkup', notes: 'All vitals are normal. Advised to continue current diet plan.' },
        { id: '#HIS-2003', name: 'Amit Kumar', age: 45, phone: '+91 7654321098', date: '10 Mar 2026', time: '01:00 PM', type: 'Clinic', status: 'Cancelled', typeIcon: FaHospitalUser, reason: 'High Blood Pressure', notes: 'Patient cancelled the appointment due to personal emergency.' },
        { id: '#HIS-2004', name: 'Sneha Patel', age: 22, phone: '+91 6543210987', date: '09 Mar 2026', time: '09:00 AM', type: 'Video', status: 'Missed', typeIcon: FaVideo, reason: 'Skin Allergy', notes: 'Patient did not join the video call.' },
        { id: '#HIS-2005', name: 'Vikas Verma', age: 50, phone: '+91 5432109876', date: '08 Mar 2026', time: '04:00 PM', type: 'Clinic', status: 'Completed', typeIcon: FaHospitalUser, reason: 'Joint Pain', notes: 'Prescribed painkillers and physiotherapy for 2 weeks.' },
        { id: '#HIS-2006', name: 'Neha Gupta', age: 29, phone: '+91 4321098765', date: '05 Mar 2026', time: '12:30 PM', type: 'Video', status: 'Completed', typeIcon: FaVideo, reason: 'Migraine Issue', notes: 'Advised strict sleep schedule and prescribed migraine relievers.' },
    ]);

    // ==========================================
    // 🌟 2. DERIVED DATA & FILTERS
    // ==========================================
    const stats = {
        total: historyData.length,
        completed: historyData.filter(h => h.status === 'Completed').length,
        cancelled: historyData.filter(h => h.status === 'Cancelled').length,
        missed: historyData.filter(h => h.status === 'Missed').length,
    };

    const filteredHistory = historyData.filter(item => {
        const matchesTab = activeTab === 'All' || item.status === activeTab;
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.id.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
    });

    return (
        <div className="pb-10 relative max-w-7xl mx-auto">
            
            {/* --- PAGE HEADER --- */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Consultation History</h1>
                    <p className="text-sm text-gray-500 mt-1">View your past appointments, medical notes, and prescriptions.</p>
                </div>
            </div>

            {/* ========================================== */}
            {/* 🌟 STATS CARDS 🌟 */}
            {/* ========================================== */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
                <div className="bg-white rounded-2xl p-6 flex items-center gap-4 shadow-sm border border-gray-100">
                    <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center text-xl flex-shrink-0"><FaCalendarAlt /></div>
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Total Consults</p>
                        <p className="text-2xl font-black text-gray-800">{stats.total}</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-6 flex items-center gap-4 shadow-sm border border-gray-100">
                    <div className="w-12 h-12 rounded-full bg-green-50 text-[#08B36A] flex items-center justify-center text-xl flex-shrink-0"><FaCheckCircle /></div>
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Completed</p>
                        <p className="text-2xl font-black text-gray-800">{stats.completed}</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-6 flex items-center gap-4 shadow-sm border border-gray-100">
                    <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center text-xl flex-shrink-0"><FaTimesCircle /></div>
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Cancelled</p>
                        <p className="text-2xl font-black text-gray-800">{stats.cancelled}</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-6 flex items-center gap-4 shadow-sm border border-gray-100">
                    <div className="w-12 h-12 rounded-full bg-yellow-50 text-yellow-500 flex items-center justify-center text-xl flex-shrink-0"><FaExclamationTriangle /></div>
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Missed</p>
                        <p className="text-2xl font-black text-gray-800">{stats.missed}</p>
                    </div>
                </div>
            </div>

            {/* ========================================== */}
            {/* 🌟 FILTERS & SEARCH 🌟 */}
            {/* ========================================== */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
                <div className="p-4 md:p-5 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/50 border-b border-gray-100">
                    
                    {/* Search Bar */}
                    <div className="relative w-full md:w-96">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Search by Patient Name or ID..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#08B36A]/20 focus:border-[#08B36A] transition-all"
                        />
                    </div>

                    {/* Tabs */}
                    <div className="bg-white p-1.5 rounded-xl shadow-sm border border-gray-200 flex flex-wrap gap-1 w-full md:w-auto">
                        {['All', 'Completed', 'Cancelled', 'Missed'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all duration-200 ${
                                    activeTab === tab 
                                    ? tab === 'Completed' ? 'bg-[#08B36A] text-white shadow-md' 
                                        : tab === 'Cancelled' ? 'bg-red-500 text-white shadow-md' 
                                        : tab === 'Missed' ? 'bg-yellow-500 text-white shadow-md'
                                        : 'bg-blue-600 text-white shadow-md'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ========================================== */}
                {/* 🌟 HISTORY TABLE 🌟 */}
                {/* ========================================== */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead className="bg-white border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Patient Info</th>
                                <th className="px-6 py-4 font-semibold">Date & Time</th>
                                <th className="px-6 py-4 font-semibold">Consultation</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredHistory.length > 0 ? (
                                filteredHistory.map((item) => (
                                    <tr 
                                        key={item.id} 
                                        onClick={() => setSelectedHistory(item)} // 👈 Row is Clickable
                                        className="hover:bg-gray-50/80 transition-colors duration-200 cursor-pointer group"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-gray-100 p-2.5 rounded-full text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors"><FaUser size={16} /></div>
                                                <div>
                                                    <span className="font-bold text-sm text-gray-800 block">{item.name}</span>
                                                    <span className="text-xs text-gray-500 font-medium">{item.id}</span>
                                                </div>
                                            </div>
                                        </td>
                                        
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-sm text-gray-700">{item.date}</span>
                                                <span className="text-xs text-gray-500 font-bold mt-0.5">{item.time}</span>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col items-start gap-1">
                                                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md">
                                                    <item.typeIcon className={item.type === 'Video' ? 'text-blue-500' : item.type === 'Audio' ? 'text-purple-500' : 'text-orange-500'}/>
                                                    {item.type}
                                                </div>
                                                <span className="text-[11px] text-gray-500 font-medium truncate max-w-[150px]" title={item.reason}>{item.reason}</span>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide ${
                                                item.status === 'Completed' ? 'bg-green-100 text-green-700' 
                                                : item.status === 'Cancelled' ? 'bg-red-100 text-red-700' 
                                                : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                                {item.status === 'Completed' && <FaCheckCircle />}
                                                {item.status === 'Cancelled' && <FaTimesCircle />}
                                                {item.status === 'Missed' && <FaExclamationTriangle />}
                                                {item.status}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); setSelectedHistory(item); }}
                                                className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-200 text-gray-600 transition-colors"
                                                title="View Details"
                                            >
                                                <FaEye size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="bg-gray-50 p-4 rounded-full mb-3"><FaSearch className="text-gray-300 text-3xl" /></div>
                                            <h3 className="text-base font-bold text-gray-800 mb-1">No Records Found</h3>
                                            <p className="text-gray-500 text-sm">We couldn't find any history matching your filters.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ========================================= */}
            {/* 📝 HISTORY DETAILS MODAL (Pop-up) */}
            {/* ========================================= */}
            {selectedHistory && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setSelectedHistory(null)}></div>

                    <div className="relative bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
                        
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                            <div className="flex items-center gap-3">
                                <div className={`p-3 rounded-full ${
                                    selectedHistory.status === 'Completed' ? 'bg-green-50 text-[#08B36A]' : 
                                    selectedHistory.status === 'Cancelled' ? 'bg-red-50 text-red-500' : 'bg-yellow-50 text-yellow-500'
                                }`}>
                                    {selectedHistory.status === 'Completed' ? <FaCheckCircle size={20} /> : 
                                     selectedHistory.status === 'Cancelled' ? <FaTimesCircle size={20} /> : <FaExclamationTriangle size={20} />}
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-gray-900 leading-tight">Consultation Summary</h2>
                                    <span className="text-sm font-semibold text-gray-500">{selectedHistory.id}</span>
                                </div>
                            </div>
                            <button onClick={() => setSelectedHistory(null)} className="p-2.5 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors">
                                <FaTimes size={18} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto bg-gray-50/30">
                            
                            {/* Patient & Schedule Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                {/* Patient Box */}
                                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center text-xl flex-shrink-0"><FaUser /></div>
                                    <div>
                                        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-1">Patient Info</p>
                                        <p className="font-bold text-gray-800 text-lg leading-tight">{selectedHistory.name}</p>
                                        <p className="text-sm text-gray-500 font-medium mt-0.5">{selectedHistory.age} Years • <FaPhoneAlt className="inline text-[10px] ml-1 mb-0.5"/> {selectedHistory.phone}</p>
                                    </div>
                                </div>

                                {/* Appointment Box */}
                                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center text-xl flex-shrink-0"><FaCalendarAlt /></div>
                                    <div>
                                        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-1">Schedule & Mode</p>
                                        <p className="font-bold text-gray-800 text-base leading-tight">{selectedHistory.date} at {selectedHistory.time}</p>
                                        <p className="text-sm text-gray-500 font-bold mt-1 flex items-center gap-1.5">
                                            <selectedHistory.typeIcon className={selectedHistory.type === 'Video' ? 'text-blue-500' : selectedHistory.type === 'Audio' ? 'text-purple-500' : 'text-orange-500'}/> {selectedHistory.type} Consultation
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Medical Notes / Prescriptions Box */}
                            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                                <div className="bg-blue-50/50 px-5 py-3 border-b border-gray-100 flex items-center gap-2">
                                    <FaFilePrescription className="text-blue-500" />
                                    <h3 className="font-bold text-gray-800 text-sm">Diagnosis & Medical Notes</h3>
                                </div>
                                <div className="p-5">
                                    <div className="mb-4">
                                        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-1">Reason for Visit</p>
                                        <p className="font-bold text-gray-800 flex items-start gap-2">
                                            <FaStethoscope className="text-gray-400 mt-1 flex-shrink-0" />
                                            {selectedHistory.reason}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-2">Doctor's Remarks</p>
                                        <p className="text-sm text-gray-700 leading-relaxed font-medium">
                                            {selectedHistory.notes}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-5 border-t border-gray-100 bg-white flex justify-between items-center rounded-b-[2rem]">
                            <button onClick={() => setSelectedHistory(null)} className="px-6 py-2.5 bg-gray-50 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-colors">
                                Close
                            </button>

                            {/* Optional Action Button for Completed Consultations */}
                            {selectedHistory.status === 'Completed' && (
                                <button className="px-6 py-2.5 bg-blue-50 text-blue-600 font-bold rounded-xl hover:bg-blue-100 transition-colors flex items-center gap-2">
                                    <FaDownload /> Download Receipt
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}