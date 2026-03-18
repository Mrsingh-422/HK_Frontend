'use client'
import React, { useState } from 'react';
import { 
    FaSearch, FaFilter, FaRegCalendarAlt, FaUserMd, 
    FaProcedures, FaVial, FaTimes, FaCheck, 
    FaEye, FaPhoneAlt, FaEnvelope, FaRegClock
} from 'react-icons/fa';
import { RiHospitalLine } from 'react-icons/ri';
import { BsCalendar2Check } from 'react-icons/bs';

// ==========================================
// 🌟 DUMMY DATA FOR HOSPITAL REQUESTS 🌟
// ==========================================
const hospitalRequestsData =[
    {
        id: 'HREQ-9012',
        patientName: 'Rohan Gupta',
        age: 34,
        gender: 'Male',
        phone: '+91 98765 12345',
        email: 'rohan.g@email.com',
        requestType: 'Doctor Consultation',
        department: 'Cardiology',
        preferredDate: '18 Mar 2026',
        preferredTime: '10:30 AM',
        reason: 'Routine checkup after mild chest pain',
        status: 'Pending'
    },
    {
        id: 'HREQ-9013',
        patientName: 'Aarti Desai',
        age: 28,
        gender: 'Female',
        phone: '+91 91234 56780',
        email: 'aarti.d@email.com',
        requestType: 'Bed Booking',
        department: 'Maternity',
        preferredDate: '20 Mar 2026',
        preferredTime: 'Morning (Anytime)',
        reason: 'Scheduled C-Section procedure',
        status: 'Approved'
    },
    {
        id: 'HREQ-9014',
        patientName: 'Kishore Kumar',
        age: 62,
        gender: 'Male',
        phone: '+91 99887 11223',
        email: 'kishore.k@email.com',
        requestType: 'Lab & Diagnostics',
        department: 'Radiology',
        preferredDate: '18 Mar 2026',
        preferredTime: '02:00 PM',
        reason: 'Full body MRI scan',
        status: 'Pending'
    },
    {
        id: 'HREQ-9015',
        patientName: 'Simran Kaur',
        age: 45,
        gender: 'Female',
        phone: '+91 98711 55667',
        email: 'simran.k@email.com',
        requestType: 'Doctor Consultation',
        department: 'Orthopedics',
        preferredDate: '19 Mar 2026',
        preferredTime: '04:15 PM',
        reason: 'Knee joint pain consultation',
        status: 'Declined'
    },
];

export default function HospitalRequestsPage() {
    const[searchTerm, setSearchTerm] = useState('');
    const[filterStatus, setFilterStatus] = useState('All');
    
    // 🌟 Modal State 🌟
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = (data) => {
        setSelectedRequest(data);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setTimeout(() => setSelectedRequest(null), 200);
    };

    // Utils
    const getInitials = (name) => {
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Pending': return 'bg-amber-50 text-amber-600 border-amber-200';
            case 'Approved': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
            case 'Declined': return 'bg-red-50 text-red-500 border-red-200';
            default: return 'bg-gray-50 text-gray-600 border-gray-200';
        }
    };

    const getRequestTypeUI = (type) => {
        switch (type) {
            case 'Doctor Consultation': return { icon: <FaUserMd />, color: 'text-blue-600 bg-blue-50 border-blue-100' };
            case 'Bed Booking': return { icon: <FaProcedures />, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' };
            case 'Lab & Diagnostics': return { icon: <FaVial />, color: 'text-fuchsia-600 bg-fuchsia-50 border-fuchsia-100' };
            default: return { icon: <RiHospitalLine />, color: 'text-gray-600 bg-gray-50 border-gray-100' };
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500 pb-10 relative">
            
            {/* --- HEADER SECTION --- */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-blue-500"></div>
                
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <RiHospitalLine size={24} />
                        </div>
                        Hospital Requests
                    </h1>
                    <p className="text-sm text-gray-500 mt-1 ml-14">Manage patient appointments, bed bookings, and lab test requests.</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <button className="bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm flex items-center gap-2">
                        <FaRegCalendarAlt /> View Calendar
                    </button>
                </div>
            </div>

            {/* --- SMART STATISTICS CARDS --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Requests</p>
                            <h3 className="text-3xl font-extrabold text-gray-800 mt-1">42</h3>
                        </div>
                        <div className="w-12 h-12 bg-gray-50 text-gray-600 rounded-2xl flex items-center justify-center text-xl">
                            <RiHospitalLine />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-amber-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 w-20 h-20 bg-amber-50 rounded-full opacity-50"></div>
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-sm font-bold text-amber-600">Pending Approvals</p>
                            <h3 className="text-3xl font-extrabold text-amber-600 mt-1">12</h3>
                        </div>
                        <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center text-xl shadow-inner">
                            <BsCalendar2Check />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Approved Today</p>
                            <h3 className="text-3xl font-extrabold text-gray-800 mt-1">26</h3>
                        </div>
                        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-xl">
                            <FaCheck />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Declined / Cancelled</p>
                            <h3 className="text-3xl font-extrabold text-gray-800 mt-1">04</h3>
                        </div>
                        <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center text-xl">
                            <FaTimes />
                        </div>
                    </div>
                </div>
            </div>

            {/* --- MAIN DATA TABLE SECTION --- */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/40">
                    <div className="relative w-full sm:w-80 group">
                        <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Search patient or request ID..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-400 transition-all shadow-sm"
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm hover:border-blue-300 transition-colors cursor-pointer">
                            <FaFilter className="text-gray-400" />
                            <select 
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="bg-transparent text-sm text-gray-700 font-medium focus:outline-none cursor-pointer w-full"
                            >
                                <option value="All">All Status</option>
                                <option value="Pending">Pending</option>
                                <option value="Approved">Approved</option>
                                <option value="Declined">Declined</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="bg-gray-50/80 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-bold">
                                <th className="p-4 pl-6">Patient Info</th>
                                <th className="p-4">Request Type & Dept</th>
                                <th className="p-4">Requested Schedule</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-center pr-6">Quick Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {hospitalRequestsData.map((data, index) => {
                                const typeUI = getRequestTypeUI(data.requestType);
                                return (
                                <tr 
                                    key={index} 
                                    onClick={() => openModal(data)} 
                                    className="hover:bg-blue-50/30 transition-all duration-200 group cursor-pointer"
                                >
                                    {/* Patient Info Column */}
                                    <td className="p-4 pl-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-100 to-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 font-bold shadow-sm group-hover:scale-110 transition-transform">
                                                {getInitials(data.patientName)}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-800 text-sm group-hover:text-blue-600 transition-colors">{data.patientName}</span>
                                                <span className="text-[11px] text-gray-500 font-medium mt-0.5">
                                                    {data.id} • {data.age} Yrs
                                                </span>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Request Type Column */}
                                    <td className="p-4">
                                        <div className="flex flex-col gap-1.5 items-start">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold border ${typeUI.color}`}>
                                                {typeUI.icon} {data.requestType}
                                            </span>
                                            <span className="text-xs font-semibold text-gray-600">
                                                Dept: {data.department}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Schedule Column */}
                                    <td className="p-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                                                <FaRegCalendarAlt className="text-blue-400" size={13} /> {data.preferredDate}
                                            </span>
                                            <span className="text-xs text-gray-500 font-medium flex items-center gap-1.5 ml-0.5">
                                                <FaRegClock className="text-gray-400" size={12} /> {data.preferredTime}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Status Column */}
                                    <td className="p-4">
                                        <span className={`px-3 py-1.5 rounded-full text-[11px] font-bold border ${getStatusStyle(data.status)}`}>
                                            {data.status}
                                        </span>
                                    </td>

                                    {/* Action Column */}
                                    <td className="p-4 pr-6" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center justify-center gap-2">
                                            {data.status === 'Pending' ? (
                                                <>
                                                    <button 
                                                        title="Approve Request"
                                                        onClick={() => alert('Request Approved Successfully!')}
                                                        className="w-8 h-8 flex items-center justify-center bg-emerald-100 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-lg transition-all border border-emerald-200"
                                                    >
                                                        <FaCheck size={14} />
                                                    </button>
                                                    <button 
                                                        title="Decline Request"
                                                        onClick={() => alert('Request Declined')}
                                                        className="w-8 h-8 flex items-center justify-center bg-red-100 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all border border-red-200"
                                                    >
                                                        <FaTimes size={14} />
                                                    </button>
                                                </>
                                            ) : (
                                                <button 
                                                    title="View Details"
                                                    onClick={() => openModal(data)}
                                                    className="w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-blue-600 rounded-lg transition-all border border-gray-200"
                                                >
                                                    <FaEye size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>
                
                <div className="p-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500 bg-white">
                    <span className="font-medium">Showing 1 to 4 of 42 requests</span>
                    <div className="flex gap-1.5">
                        <button className="px-3 py-1.5 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 font-medium transition-colors text-gray-600">Prev</button>
                        <button className="px-3 py-1.5 border border-blue-600 rounded-lg bg-blue-600 text-white font-medium shadow-sm">1</button>
                        <button className="px-3 py-1.5 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 font-medium transition-colors text-gray-600">Next</button>
                    </div>
                </div>
            </div>

            {/* ========================================== */}
            {/* 🌟 HOSPITAL REQUEST MODAL (COMPACT) 🌟     */}
            {/* ========================================== */}
            {isModalOpen && selectedRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 transition-all duration-300">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300 ring-1 ring-black/5">
                        
                        {/* Modal Header */}
                        <div className="px-5 py-3.5 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-blue-50 to-white relative">
                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-md">
                                    {getInitials(selectedRequest.patientName)}
                                </div>
                                <div>
                                    <h2 className="text-sm font-bold text-gray-800 tracking-tight leading-none">
                                        Request Details
                                    </h2>
                                    <p className="text-[10px] text-blue-600 font-bold mt-1 uppercase tracking-wider">{selectedRequest.id}</p>
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
                            
                            {/* Section 1: Patient Details */}
                            <div className="flex flex-col gap-1 mb-4">
                                <p className="font-bold text-gray-800 text-lg">{selectedRequest.patientName}</p>
                                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 font-medium">
                                    <span>{selectedRequest.age} Years, {selectedRequest.gender}</span>
                                    <span className="flex items-center gap-1 text-blue-600"><FaPhoneAlt size={10} /> {selectedRequest.phone}</span>
                                    <span className="flex items-center gap-1 text-blue-600"><FaEnvelope size={10} /> {selectedRequest.email}</span>
                                </div>
                            </div>

                            {/* Section 2: Request Info & Schedule (Beautiful UI Box) */}
                            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 mb-4">
                                <div className="flex justify-between items-start mb-3 pb-3 border-b border-blue-100/60">
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-0.5">Request Type</p>
                                        <p className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
                                            {getRequestTypeUI(selectedRequest.requestType).icon} {selectedRequest.requestType}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-0.5">Department</p>
                                        <p className="font-bold text-blue-700 text-sm">{selectedRequest.department}</p>
                                    </div>
                                </div>

                                {/* Calendar Look Schedule Box */}
                                <div className="flex gap-3">
                                    <div className="bg-white border border-blue-100 rounded-lg p-2 text-center w-20 shadow-sm shrink-0">
                                        <p className="text-[9px] font-bold text-red-500 uppercase">{selectedRequest.preferredDate.split(' ')[1]}</p>
                                        <p className="text-xl font-extrabold text-gray-800 leading-none my-0.5">{selectedRequest.preferredDate.split(' ')[0]}</p>
                                        <p className="text-[9px] font-semibold text-gray-400">{selectedRequest.preferredDate.split(' ')[2]}</p>
                                    </div>
                                    <div className="flex flex-col justify-center">
                                        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-0.5">Preferred Time</p>
                                        <p className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                                            <FaRegClock className="text-blue-500"/> {selectedRequest.preferredTime}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Reason & Status */}
                            <div className="border border-gray-100 rounded-xl p-3 bg-gray-50/50">
                                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1">Patient Note / Reason</p>
                                <p className="text-xs text-gray-700 font-medium leading-relaxed italic border-l-2 border-gray-300 pl-2 mb-3">
                                    "{selectedRequest.reason}"
                                </p>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Current Status:</span>
                                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${getStatusStyle(selectedRequest.status)}`}>
                                        {selectedRequest.status}
                                    </span>
                                </div>
                            </div>

                        </div>

                        {/* Modal Footer - ACTION BUTTONS */}
                        <div className="px-5 py-3.5 border-t border-gray-100 flex flex-col sm:flex-row justify-end gap-2 bg-gray-50">
                            {selectedRequest.status === 'Pending' ? (
                                <>
                                    <button 
                                        onClick={() => { alert('Request Declined'); closeModal(); }}
                                        className="px-4 py-2 bg-white border border-red-200 text-red-500 rounded-lg font-bold text-xs hover:bg-red-50 transition-colors flex-1 sm:flex-none text-center"
                                    >
                                        Decline
                                    </button>
                                    <button 
                                        className="px-5 py-2 bg-blue-600 text-white rounded-lg font-bold text-xs hover:bg-blue-700 transition-all shadow-md shadow-blue-200 flex-1 sm:flex-none flex justify-center items-center gap-1.5"
                                    >
                                        <BsCalendar2Check size={14} /> Approve Request
                                    </button>
                                </>
                            ) : (
                                <button 
                                    onClick={closeModal} 
                                    className="px-5 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg font-bold text-xs hover:bg-gray-100 transition-colors w-full sm:w-auto text-center"
                                >
                                    Close Window
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
            
        </div>
    );
}