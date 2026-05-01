'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { 
    FaCheck, FaTimes, FaCog, FaVideo, FaPhoneAlt, FaHospitalUser, 
    FaCheckCircle, FaTimesCircle, FaClock, FaCalendarAlt, FaExclamationTriangle, FaUser,
    FaChartArea, FaChartPie, FaStethoscope, FaMapMarkerAlt
} from "react-icons/fa";
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';

export default function DoctorDashboardPage() {
    // ==========================================
    // 🌟 1. STATE MANAGEMENT
    // ==========================================
    const[activeTab, setActiveTab] = useState('Pending'); 

    // Modals State
    const[selectedAppt, setSelectedAppt] = useState(null); // For Details Modal
    const[actionAppt, setActionAppt] = useState(null); // For Accept/Reject Modals
    const[isAcceptOpen, setIsAcceptOpen] = useState(false);
    const [isRejectOpen, setIsRejectOpen] = useState(false);
    
    // Reject Form State
    const [rejectReason, setRejectReason] = useState('Doctor Unavailable'); 
    const [rejectComment, setRejectComment] = useState('');

    // ==========================================
    // 🌟 2. MOCK DATA (Appointments & Charts)
    // ==========================================
    const[appointments, setAppointments] = useState([
        { id: '#APT-1001', name: 'Rahul Sharma', age: 28, phone: '+91 9876543210', reason: 'Viral Fever & Cough', date: '16 Mar 2026', time: '10:30 AM', type: 'Video', status: 'Pending', typeIcon: FaVideo },
        { id: '#APT-1002', name: 'Priya Singh', age: 34, phone: '+91 8765432109', reason: 'Routine Checkup', date: '16 Mar 2026', time: '11:15 AM', type: 'Audio', status: 'Pending', typeIcon: FaPhoneAlt },
        { id: '#APT-1003', name: 'Amit Kumar', age: 45, phone: '+91 7654321098', reason: 'High Blood Pressure', date: '15 Mar 2026', time: '01:00 PM', type: 'Clinic', status: 'Accepted', typeIcon: FaHospitalUser },
        { id: '#APT-1004', name: 'Sneha Patel', age: 22, phone: '+91 6543210987', reason: 'Skin Allergy', date: '14 Mar 2026', time: '09:00 AM', type: 'Video', status: 'Rejected', typeIcon: FaVideo },
        { id: '#APT-1005', name: 'Vikas Verma', age: 50, phone: '+91 5432109876', reason: 'Joint Pain', date: '17 Mar 2026', time: '04:00 PM', type: 'Clinic', status: 'Postponed', typeIcon: FaHospitalUser },
        { id: '#APT-1006', name: 'Neha Gupta', age: 29, phone: '+91 4321098765', reason: 'Migraine Issue', date: '18 Mar 2026', time: '12:30 PM', type: 'Video', status: 'Pending', typeIcon: FaVideo },
    ]);

    // Chart Data
    const weeklyData =[
        { name: 'Mon', consultations: 12 }, { name: 'Tue', consultations: 19 },
        { name: 'Wed', consultations: 15 }, { name: 'Thu', consultations: 22 },
        { name: 'Fri', consultations: 18 }, { name: 'Sat', consultations: 25 }, { name: 'Sun', consultations: 10 },
    ];
    const pieData =[
        { name: 'Video Call', value: 45, color: '#3b82f6' }, 
        { name: 'Clinic Visit', value: 35, color: '#08B36A' }, 
        { name: 'Audio Call', value: 20, color: '#f59e0b' }, 
    ];

    // Derived Stats
    const stats = {
        pending: appointments.filter(a => a.status === 'Pending').length,
        accepted: appointments.filter(a => a.status === 'Accepted').length,
        rejected: appointments.filter(a => a.status === 'Rejected').length,
        postponed: appointments.filter(a => a.status === 'Postponed').length,
    };
    const filteredAppointments = appointments.filter(appt => appt.status === activeTab);

    // ==========================================
    // 🌟 3. HANDLERS
    // ==========================================
    const handleRowClick = (appt) => setSelectedAppt(appt);
    
    const handleOpenAccept = (appt, e) => { if(e) e.stopPropagation(); setActionAppt(appt); setIsAcceptOpen(true); };
    const handleOpenReject = (appt, e) => { if(e) e.stopPropagation(); setActionAppt(appt); setRejectReason('Doctor Unavailable'); setRejectComment(''); setIsRejectOpen(true); };
    
    const handlePostpone = (appt, e) => {
        if(e) e.stopPropagation();
        if(window.confirm(`Are you sure you want to POSTPONE appointment for ${appt.name}?`)) {
            setAppointments(appointments.map(a => a.id === appt.id ? { ...a, status: 'Postponed' } : a));
            if(selectedAppt?.id === appt.id) setSelectedAppt(null); // Close detail modal if open
        }
    };

    const confirmAccept = () => {
        setAppointments(appointments.map(a => a.id === actionAppt.id ? { ...a, status: 'Accepted' } : a));
        setIsAcceptOpen(false); setActionAppt(null);
        if(selectedAppt) setSelectedAppt(null); // Close detail modal if open
    };

    const confirmReject = () => {
        setAppointments(appointments.map(a => a.id === actionAppt.id ? { ...a, status: 'Rejected' } : a));
        setIsRejectOpen(false); setActionAppt(null);
        if(selectedAppt) setSelectedAppt(null); // Close detail modal if open
    };

    return (
        <div className="pb-10 relative">
            
            {/* --- PAGE HEADER --- */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Welcome, Dr. John Doe! 👋</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage your patient appointments and check your daily insights.</p>
                </div>
            </div>

            {/* ========================================== */}
            {/* 🌟 STATS CARDS GRID 🌟 */}
            {/* ========================================== */}
            {/* 👇 CHANGED: lg:grid-cols-5 and md:grid-cols-3 changed to lg:grid-cols-4 and grid-cols-2 */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                <div className="bg-white rounded-2xl p-6 flex flex-col items-center justify-center shadow-sm border border-gray-100 hover:-translate-y-1 transition-transform">
                    <div className="w-14 h-14 rounded-full border-2 border-[#08B36A] flex items-center justify-center text-xl font-bold text-[#08B36A] mb-3 bg-green-50/50">{stats.pending}</div>
                    <p className="text-[11px] font-bold text-gray-600 uppercase text-center tracking-wider">Pending<br/>Consultation</p>
                </div>
                <div className="bg-white rounded-2xl p-6 flex flex-col items-center justify-center shadow-sm border border-gray-100 hover:-translate-y-1 transition-transform">
                    <div className="w-14 h-14 rounded-full border-2 border-[#08B36A] flex items-center justify-center text-xl font-bold text-[#08B36A] mb-3 bg-green-50/50">{stats.accepted}</div>
                    <p className="text-[11px] font-bold text-gray-600 uppercase text-center tracking-wider">Accepted<br/>Consultation</p>
                </div>
                <div className="bg-white rounded-2xl p-6 flex flex-col items-center justify-center shadow-sm border border-gray-100 hover:-translate-y-1 transition-transform">
                    <div className="w-14 h-14 rounded-full border-2 border-yellow-500 flex items-center justify-center text-xl font-bold text-yellow-500 mb-3 bg-yellow-50/50">{stats.postponed}</div>
                    <p className="text-[11px] font-bold text-gray-600 uppercase text-center tracking-wider">Postponed<br/>Consultation</p>
                </div>
                <div className="bg-white rounded-2xl p-6 flex flex-col items-center justify-center shadow-sm border border-gray-100 hover:-translate-y-1 transition-transform">
                    <div className="w-14 h-14 rounded-full border-2 border-red-500 flex items-center justify-center text-xl font-bold text-red-500 mb-3 bg-red-50/50">{stats.rejected}</div>
                    <p className="text-[11px] font-bold text-gray-600 uppercase text-center tracking-wider">Rejected<br/>Consultation</p>
                </div>
                {/* 👇 REMOVED: Go To Settings Card */}
            </div>

            {/* ========================================== */}
            {/* 📈 ANIMATED CHARTS SECTION 📈 */}
            {/* ========================================== */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <FaChartArea className="text-[#08B36A]" /> Consultation Overview
                            </h2>
                            <p className="text-xs text-gray-500 mt-1">Total appointments in the last 7 days</p>
                        </div>
                    </div>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorConsult" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#08B36A" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#08B36A" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                                <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} cursor={{ stroke: '#08B36A', strokeWidth: 1, strokeDasharray: '3 3' }} />
                                <Area type="monotone" dataKey="consultations" stroke="#08B36A" strokeWidth={3} fillOpacity={1} fill="url(#colorConsult)" activeDot={{ r: 6, fill: '#08B36A', stroke: '#fff', strokeWidth: 2 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <FaChartPie className="text-blue-500" /> Appointment Types
                        </h2>
                        <p className="text-xs text-gray-500 mt-1">Distribution by consultation mode</p>
                    </div>
                    <div className="h-64 w-full flex-1 mt-4 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '13px', fontWeight: 'bold' }} itemStyle={{ color: '#374151' }} />
                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" stroke="none">
                                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                </Pie>
                                <Legend verticalAlign="bottom" height={36} iconType="circle" formatter={(value) => <span className="text-xs font-semibold text-gray-600">{value}</span>} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                            <span className="text-2xl font-black text-gray-800">100%</span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase">Total</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ========================================== */}
            {/* 🌟 TAB NAVIGATION & TABLE SECTION 🌟 */}
            {/* ========================================== */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-wrap gap-2 items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-800 px-2 hidden md:block">Appointments List</h2>
                    <div className="bg-white p-1.5 rounded-xl shadow-sm border border-gray-200 flex flex-wrap gap-1 w-full md:w-auto">
                        {['Pending', 'Accepted', 'Postponed', 'Rejected'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all duration-200 ${
                                    activeTab === tab 
                                    ? tab === 'Accepted' ? 'bg-[#08B36A] text-white shadow-md shadow-green-200' 
                                        : tab === 'Rejected' ? 'bg-red-500 text-white shadow-md shadow-red-200' 
                                        : tab === 'Postponed' ? 'bg-yellow-500 text-white shadow-md shadow-yellow-200'
                                        : 'bg-blue-600 text-white shadow-md shadow-blue-200'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Patient Info</th>
                                <th className="px-6 py-4 font-semibold">Date & Time</th>
                                <th className="px-6 py-4 font-semibold">Type</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredAppointments.length > 0 ? (
                                filteredAppointments.map((appt) => (
                                    <tr 
                                        key={appt.id} 
                                        onClick={() => handleRowClick(appt)} // 👈 Row click handler
                                        className="hover:bg-gray-50/80 transition-colors duration-200 cursor-pointer group" // 👈 Added cursor-pointer
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-blue-50 p-2.5 rounded-full text-blue-600 group-hover:scale-110 transition-transform"><FaUser size={16} /></div>
                                                <div>
                                                    <span className="font-bold text-sm text-gray-800 block">{appt.name}</span>
                                                    <span className="text-xs text-gray-500 font-medium">{appt.id} • {appt.age} Yrs</span>
                                                </div>
                                            </div>
                                        </td>
                                        
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-sm text-gray-700 flex items-center gap-1.5"><FaCalendarAlt className="text-gray-400" /> {appt.date}</span>
                                                <span className="text-xs text-[#08B36A] font-bold mt-1 pl-5">{appt.time}</span>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-xs font-bold text-gray-600 bg-gray-100 w-fit px-3 py-1.5 rounded-lg">
                                                <appt.typeIcon className={appt.type === 'Video' ? 'text-blue-500' : appt.type === 'Audio' ? 'text-purple-500' : 'text-orange-500'}/>
                                                {appt.type}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide ${
                                                appt.status === 'Accepted' ? 'bg-green-100 text-green-700' : appt.status === 'Rejected' ? 'bg-red-100 text-red-700' : appt.status === 'Postponed' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
                                            }`}>
                                                {appt.status === 'Accepted' && <FaCheckCircle />}
                                                {appt.status === 'Rejected' && <FaTimesCircle />}
                                                {appt.status === 'Postponed' && <FaClock />}
                                                {appt.status === 'Pending' && <FaClock />}
                                                {appt.status}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                {appt.status === 'Pending' ? (
                                                    <>
                                                        {/* e.stopPropagation() so row click doesn't trigger when buttons are clicked */}
                                                        <button onClick={(e) => handleOpenAccept(appt, e)} className="px-3 py-1.5 bg-[#08B36A] hover:bg-green-600 text-white text-xs font-bold rounded-lg shadow-sm transition-colors">Accept</button>
                                                        <button onClick={(e) => handlePostpone(appt, e)} className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-bold rounded-lg shadow-sm transition-colors">Postpone</button>
                                                        <button onClick={(e) => handleOpenReject(appt, e)} className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-lg transition-colors">Reject</button>
                                                    </>
                                                ) : (
                                                    <span className="text-gray-400 text-xs font-medium italic">No action required</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="bg-gray-50 p-4 rounded-full mb-3"><FaCalendarAlt className="text-gray-300 text-3xl" /></div>
                                            <h3 className="text-base font-bold text-gray-800 mb-1">No {activeTab} Appointments</h3>
                                            <p className="text-gray-500 text-sm">You currently have no appointments in '{activeTab}' status.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ========================================= */}
            {/* 📝 APPOINTMENT DETAILS MODAL (NEW) */}
            {/* ========================================= */}
            {selectedAppt && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setSelectedAppt(null)}></div>

                    <div className="relative bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-50 p-3 rounded-full text-blue-600">
                                    <FaUser size={20} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-gray-900 leading-tight">Appointment Details</h2>
                                    <span className="text-sm font-semibold text-[#08B36A]">{selectedAppt.id}</span>
                                </div>
                            </div>
                            <button onClick={() => setSelectedAppt(null)} className="p-2.5 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors">
                                <FaTimes size={18} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto bg-gray-50/30">
                            
                            {/* Top Info Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                {/* Patient Box */}
                                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center text-xl flex-shrink-0">
                                        <FaUser />
                                    </div>
                                    <div>
                                        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-1">Patient Info</p>
                                        <p className="font-bold text-gray-800 text-lg leading-tight">{selectedAppt.name}</p>
                                        <p className="text-sm text-gray-500 font-medium mt-0.5">{selectedAppt.age} Years Old</p>
                                    </div>
                                </div>

                                {/* Appointment Box */}
                                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-green-100 text-[#08B36A] flex items-center justify-center text-xl flex-shrink-0">
                                        <FaCalendarAlt />
                                    </div>
                                    <div>
                                        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-1">Schedule</p>
                                        <p className="font-bold text-gray-800 text-base leading-tight">{selectedAppt.date}</p>
                                        <p className="text-sm text-[#08B36A] font-bold mt-0.5">{selectedAppt.time}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Detailed Info List */}
                            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-2">
                                <table className="w-full text-left text-sm">
                                    <tbody>
                                        <tr className="border-b border-gray-50">
                                            <th className="py-4 px-4 text-gray-500 font-semibold w-1/3">Contact Number</th>
                                            <td className="py-4 px-4 font-bold text-gray-800 flex items-center gap-2"><FaPhoneAlt className="text-gray-400 text-xs"/> {selectedAppt.phone}</td>
                                        </tr>
                                        <tr className="border-b border-gray-50">
                                            <th className="py-4 px-4 text-gray-500 font-semibold w-1/3">Consultation Type</th>
                                            <td className="py-4 px-4">
                                                <span className="flex items-center gap-2 font-bold text-gray-700 bg-gray-100 w-fit px-3 py-1 rounded-lg">
                                                    <selectedAppt.typeIcon className={selectedAppt.type === 'Video' ? 'text-blue-500' : selectedAppt.type === 'Audio' ? 'text-purple-500' : 'text-orange-500'}/>
                                                    {selectedAppt.type}
                                                </span>
                                            </td>
                                        </tr>
                                        <tr className="border-b border-gray-50">
                                            <th className="py-4 px-4 text-gray-500 font-semibold w-1/3">Current Status</th>
                                            <td className="py-4 px-4 font-bold text-gray-800">{selectedAppt.status}</td>
                                        </tr>
                                        <tr>
                                            <th className="py-4 px-4 text-gray-500 font-semibold w-1/3 align-top">Reason / Symptoms</th>
                                            <td className="py-4 px-4 font-bold text-gray-800">
                                                <div className="bg-orange-50 text-orange-700 p-3 rounded-xl border border-orange-100 flex gap-2 items-start">
                                                    <FaStethoscope className="mt-1 flex-shrink-0" />
                                                    <span>{selectedAppt.reason}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                        </div>

                        {/* Modal Footer */}
                        <div className="p-5 border-t border-gray-100 bg-white flex justify-end gap-3 rounded-b-[2rem]">
                            <button onClick={() => setSelectedAppt(null)} className="px-6 py-2.5 bg-gray-50 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-colors">
                                Close
                            </button>

                            {/* Show Action buttons inside details modal if status is Pending */}
                            {selectedAppt.status === 'Pending' && (
                                <>
                                    <button 
                                        onClick={() => handleOpenReject(selectedAppt)} 
                                        className="px-6 py-2.5 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors"
                                    >
                                        Reject
                                    </button>
                                    <button 
                                        onClick={() => handleOpenAccept(selectedAppt)} 
                                        className="px-8 py-2.5 bg-[#08B36A] text-white font-bold rounded-xl shadow-md hover:bg-green-600 transition-colors"
                                    >
                                        Accept Appointment
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================= */}
            {/* ✅ ACCEPT MODAL */}
            {/* ========================================= */}
            {isAcceptOpen && actionAppt && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsAcceptOpen(false)}></div>
                    <div className="relative bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in duration-200">
                        <div className="mx-auto w-16 h-16 bg-green-50 text-[#08B36A] rounded-full flex items-center justify-center mb-5 border-[6px] border-green-50/50">
                            <FaCheck size={28} />
                        </div>
                        <h3 className="text-2xl font-bold text-[#1e3a8a] mb-2">Accept Appointment?</h3>
                        <p className="text-gray-500 text-sm mb-6 px-2">You are accepting the appointment for <b className="text-gray-800">{actionAppt.name}</b> on <b className="text-gray-800">{actionAppt.date} at {actionAppt.time}</b>.</p>
                        <button onClick={confirmAccept} className="w-full py-3.5 bg-[#08B36A] hover:bg-green-600 text-white font-bold rounded-xl shadow-md transition-all hover:-translate-y-0.5">Confirm Accept</button>
                        <button onClick={() => setIsAcceptOpen(false)} className="w-full mt-3 py-2 text-gray-500 font-bold text-sm hover:text-gray-700">Cancel</button>
                    </div>
                </div>
            )}

            {/* ========================================= */}
            {/* ❌ REJECT MODAL */}
            {/* ========================================= */}
            {isRejectOpen && actionAppt && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsRejectOpen(false)}></div>
                    <div className="relative bg-white rounded-[2rem] p-6 sm:p-8 max-w-md w-full shadow-2xl animate-in zoom-in duration-200">
                        <div className="text-center mb-6">
                            <div className="mx-auto w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4 border-[6px] border-red-50/50">
                                <FaExclamationTriangle size={24} />
                            </div>
                            <h3 className="text-2xl font-bold text-[#1e3a8a]">Reject Appointment</h3>
                            <p className="text-gray-500 text-sm mt-2">Select a reason for rejecting <b className="text-gray-700">{actionAppt.name}</b>'s request</p>
                        </div>
                        <div className="space-y-3.5 mb-6 px-2">
                            {['Doctor Unavailable', 'Emergency Case Assigned', 'Out of Station', 'Clinic Closed'].map(reason => (
                                <label key={reason} className="flex items-center gap-3 cursor-pointer group">
                                    <input type="radio" name="rejectReason" value={reason} checked={rejectReason === reason} onChange={(e) => setRejectReason(e.target.value)} className="w-5 h-5 text-red-500 bg-gray-100 border-gray-300 focus:ring-red-500 focus:ring-2 accent-red-500 cursor-pointer" />
                                    <span className={`text-[15px] transition-colors ${rejectReason === reason ? 'text-red-500 font-bold' : 'text-gray-600 group-hover:text-gray-900'}`}>{reason}</span>
                                </label>
                            ))}
                        </div>
                        <div className="mb-8 px-2">
                            <textarea rows="3" placeholder="Additional comments (optional)..." value={rejectComment} onChange={(e) => setRejectComment(e.target.value)} className="w-full p-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 resize-none bg-gray-50 focus:bg-white transition-colors"></textarea>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => setIsRejectOpen(false)} className="flex-1 py-3.5 bg-white border-2 border-[#08B36A] text-[#08B36A] hover:bg-green-50 font-bold rounded-xl transition-colors text-base">Cancel</button>
                            <button onClick={confirmReject} className="flex-1 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-md shadow-red-200 hover:-translate-y-0.5 text-base">Reject Now</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}