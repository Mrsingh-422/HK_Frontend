'use client'
import React, { useState } from 'react';
import { 
    FaSearch, FaFilter, FaPhoneAlt, FaMapMarkerAlt, 
    FaAmbulance, FaTimes, FaCheck, FaExclamationCircle, 
    FaRegClock, FaRoute, FaEye, FaHeartbeat
} from 'react-icons/fa';
import { MdOutlineEmergencyShare } from 'react-icons/md';

// ==========================================
// 🌟 DUMMY DATA FOR EMERGENCY REQUESTS 🌟
// ==========================================
const emergencyRequestsData =[
    {
        id: 'REQ-EMG-001',
        callerName: 'Rajesh Kumar',
        patientName: 'Unknown (Accident Victim)',
        phone: '+91 98765 43210',
        location: 'Highway 44, Near Toll Plaza',
        distance: '4.2 km',
        eta: '8 mins',
        emergencyType: 'Road Accident',
        severity: 'Critical',
        timeRequested: '2 mins ago',
        status: 'Pending'
    },
    {
        id: 'REQ-EMG-002',
        callerName: 'Sunita Sharma',
        patientName: 'Anil Sharma (Husband)',
        phone: '+91 91234 56789',
        location: 'Sector 15, Vashi, Mumbai',
        distance: '1.5 km',
        eta: '4 mins',
        emergencyType: 'Cardiac Arrest',
        severity: 'Critical',
        timeRequested: '5 mins ago',
        status: 'Dispatching'
    },
    {
        id: 'REQ-EMG-003',
        callerName: 'Amit Desai',
        patientName: 'Neha Desai',
        phone: '+91 99887 76655',
        location: 'MG Road, Pune',
        distance: '8.0 km',
        eta: '15 mins',
        emergencyType: 'Severe Asthma',
        severity: 'High',
        timeRequested: '12 mins ago',
        status: 'Accepted'
    },
    {
        id: 'REQ-EMG-004',
        callerName: 'Priya Singh',
        patientName: 'Kavita Singh',
        phone: '+91 98711 22334',
        location: 'Andheri East, Near Metro',
        distance: '3.2 km',
        eta: '10 mins',
        emergencyType: 'Pregnancy/Labor',
        severity: 'Medium',
        timeRequested: '20 mins ago',
        status: 'Declined'
    },
];

export default function EmergencyRequestsPage() {
    const[searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    
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
            case 'Pending': return 'bg-red-50 text-red-600 border-red-200 animate-pulse';
            case 'Dispatching': return 'bg-amber-50 text-amber-600 border-amber-200';
            case 'Accepted': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
            case 'Declined': return 'bg-gray-100 text-gray-500 border-gray-200';
            default: return 'bg-gray-50 text-gray-600 border-gray-200';
        }
    };

    const getSeverityStyle = (severity) => {
        switch (severity) {
            case 'Critical': return 'text-red-600 bg-red-50 border-red-100';
            case 'High': return 'text-orange-600 bg-orange-50 border-orange-100';
            case 'Medium': return 'text-amber-600 bg-amber-50 border-amber-100';
            default: return 'text-blue-600 bg-blue-50 border-blue-100';
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500 pb-10 relative">
            
            {/* --- HEADER SECTION --- */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                {/* Background urgent gradient line */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-orange-400 to-red-500"></div>
                
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                        <div className="p-2 bg-red-50 text-red-600 rounded-lg relative">
                            <MdOutlineEmergencyShare size={24} />
                            {/* Ping Animation for active emergencies */}
                            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping"></span>
                        </div>
                        Inbound Emergency Requests
                    </h1>
                    <p className="text-sm text-gray-500 mt-1 ml-14">Review, accept, or dispatch ambulances for incoming critical alerts.</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <span className="flex items-center gap-2 text-sm font-semibold text-red-600 bg-red-50 px-4 py-2 rounded-xl border border-red-100">
                        <FaExclamationCircle className="animate-pulse" /> 2 New Alerts
                    </span>
                </div>
            </div>

            {/* --- SMART STATISTICS CARDS --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Requests Today</p>
                            <h3 className="text-3xl font-extrabold text-gray-800 mt-1">28</h3>
                        </div>
                        <div className="w-12 h-12 bg-gray-50 text-gray-600 rounded-2xl flex items-center justify-center text-xl">
                            <MdOutlineEmergencyShare />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-red-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 w-20 h-20 bg-red-50 rounded-full opacity-50"></div>
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-sm font-bold text-red-500">Pending Actions</p>
                            <h3 className="text-3xl font-extrabold text-red-600 mt-1">02</h3>
                        </div>
                        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center text-xl shadow-inner">
                            <FaRegClock />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Ambulances Dispatched</p>
                            <h3 className="text-3xl font-extrabold text-gray-800 mt-1">14</h3>
                        </div>
                        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center text-xl">
                            <FaAmbulance />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Avg Response Time</p>
                            <h3 className="text-3xl font-extrabold text-gray-800 mt-1">1.2 <span className="text-lg text-gray-400 font-medium">mins</span></h3>
                        </div>
                        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-xl">
                            <FaHeartbeat />
                        </div>
                    </div>
                </div>
            </div>

            {/* --- MAIN DATA TABLE SECTION --- */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/40">
                    <div className="relative w-full sm:w-80 group">
                        <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Search location, ID or caller..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-red-50 focus:border-red-400 transition-all shadow-sm"
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm hover:border-red-300 transition-colors cursor-pointer">
                            <FaFilter className="text-gray-400" />
                            <select 
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="bg-transparent text-sm text-gray-700 font-medium focus:outline-none cursor-pointer w-full"
                            >
                                <option value="All">All Requests</option>
                                <option value="Pending">Pending</option>
                                <option value="Dispatching">Dispatching</option>
                                <option value="Accepted">Accepted</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1050px]">
                        <thead>
                            <tr className="bg-gray-50/80 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-bold">
                                <th className="p-4 pl-6">Caller & Patient</th>
                                <th className="p-4">Emergency Type</th>
                                <th className="p-4">Location & ETA</th>
                                <th className="p-4">Status & Time</th>
                                <th className="p-4 text-center pr-6">Quick Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {emergencyRequestsData.map((data, index) => (
                                <tr 
                                    key={index} 
                                    onClick={() => openModal(data)} 
                                    className="hover:bg-red-50/20 transition-all duration-200 group cursor-pointer"
                                >
                                    {/* Caller Info Column */}
                                    <td className="p-4 pl-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-100 to-orange-100 border border-red-200 flex items-center justify-center text-red-700 font-bold shadow-sm">
                                                {getInitials(data.callerName)}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-800 text-sm">{data.callerName}</span>
                                                <span className="text-[11px] text-gray-500 font-medium mt-0.5 max-w-[150px] truncate">
                                                    For: {data.patientName}
                                                </span>
                                                <span className="text-[10px] font-semibold text-blue-600 flex items-center gap-1 mt-1">
                                                    <FaPhoneAlt size={9}/> {data.phone}
                                                </span>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Type Column */}
                                    <td className="p-4">
                                        <div className="flex flex-col gap-1.5 items-start">
                                            <span className="text-sm font-bold text-gray-800">{data.emergencyType}</span>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getSeverityStyle(data.severity)}`}>
                                                {data.severity} Severity
                                            </span>
                                        </div>
                                    </td>

                                    {/* Location & ETA Column */}
                                    <td className="p-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-sm font-semibold text-gray-700 flex items-start gap-1.5 max-w-[200px]">
                                                <FaMapMarkerAlt className="text-red-400 mt-0.5 shrink-0" size={12} /> 
                                                <span className="truncate">{data.location}</span>
                                            </span>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200 font-medium flex items-center gap-1">
                                                    <FaRoute size={10} /> {data.distance}
                                                </span>
                                                <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-200 font-medium flex items-center gap-1">
                                                    <FaAmbulance size={10} /> {data.eta}
                                                </span>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Status Column */}
                                    <td className="p-4">
                                        <div className="flex flex-col gap-1 items-start">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyle(data.status)}`}>
                                                {data.status}
                                            </span>
                                            <span className="text-[11px] text-gray-500 font-medium flex items-center gap-1 ml-1 mt-1">
                                                <FaRegClock size={10} /> {data.timeRequested}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Action Column (Accept/Decline) */}
                                    <td className="p-4 pr-6" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center justify-center gap-2">
                                            {data.status === 'Pending' ? (
                                                <>
                                                    <button 
                                                        title="Accept & Dispatch"
                                                        onClick={() => alert('Request Accepted! Ambulance dispatching...')}
                                                        className="w-8 h-8 flex items-center justify-center bg-emerald-100 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-lg transition-all border border-emerald-200"
                                                    >
                                                        <FaCheck size={14} />
                                                    </button>
                                                    <button 
                                                        title="Decline Request"
                                                        onClick={() => alert('Request Declined!')}
                                                        className="w-8 h-8 flex items-center justify-center bg-red-100 text-red-600 hover:bg-red-500 hover:text-white rounded-lg transition-all border border-red-200"
                                                    >
                                                        <FaTimes size={14} />
                                                    </button>
                                                </>
                                            ) : (
                                                <button 
                                                    title="View Detail"
                                                    onClick={() => openModal(data)}
                                                    className="w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-500 hover:bg-gray-200 rounded-lg transition-all border border-gray-200"
                                                >
                                                    <FaEye size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                <div className="p-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500 bg-white">
                    <span className="font-medium">Showing 1 to 4 of 28 requests</span>
                    <div className="flex gap-1.5">
                        <button className="px-3 py-1.5 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 font-medium transition-colors text-gray-600">Prev</button>
                        <button className="px-3 py-1.5 border border-red-500 rounded-lg bg-red-500 text-white font-medium shadow-sm">1</button>
                        <button className="px-3 py-1.5 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 font-medium transition-colors text-gray-600">Next</button>
                    </div>
                </div>
            </div>

            {/* ========================================== */}
            {/* 🌟 EMERGENCY REQUEST MODAL (COMPACT) 🌟    */}
            {/* ========================================== */}
            {isModalOpen && selectedRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/70 backdrop-blur-sm p-4 transition-all duration-300">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-300 ring-4 ring-red-500/10">
                        
                        {/* Modal Header */}
                        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-red-50 to-white relative">
                            <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                                    <MdOutlineEmergencyShare size={20} />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-gray-800 tracking-tight leading-none">
                                        Emergency Alert Details
                                    </h2>
                                    <p className="text-[11px] text-red-500 font-bold mt-1 uppercase tracking-wider">{selectedRequest.id}</p>
                                </div>
                            </div>
                            <button 
                                onClick={closeModal} 
                                className="text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 p-1.5 rounded-lg transition-all"
                            >
                                <FaTimes size={14} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-5">
                            
                            {/* Top Box: Caller & Patient */}
                            <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 mb-4 flex justify-between items-center">
                                <div>
                                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-0.5">Caller / Contact</p>
                                    <p className="font-bold text-gray-800 text-sm">{selectedRequest.callerName}</p>
                                    <p className="text-xs text-blue-600 font-semibold mt-0.5 flex items-center gap-1">
                                        <FaPhoneAlt size={10} /> {selectedRequest.phone}
                                    </p>
                                </div>
                                <div className="text-right border-l border-gray-200 pl-4">
                                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-0.5">Patient Details</p>
                                    <p className="font-bold text-gray-800 text-sm">{selectedRequest.patientName}</p>
                                    <p className="text-xs text-red-500 font-bold mt-0.5 flex items-center gap-1 justify-end">
                                        <FaExclamationCircle size={10} /> {selectedRequest.severity}
                                    </p>
                                </div>
                            </div>

                            {/* Middle Box: Emergency Context & Map Placeholder */}
                            <div className="border border-red-100 bg-red-50/30 rounded-xl overflow-hidden mb-4">
                                {/* Map Simulation Box */}
                                <div className="h-24 w-full bg-gray-200 relative flex items-center justify-center overflow-hidden">
                                    {/* Mock Map Image/Pattern */}
                                    <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'radial-gradient(#444 1px, transparent 1px)', backgroundSize: '10px 10px'}}></div>
                                    
                                    <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-md z-10 flex items-center gap-2 border border-gray-200">
                                        <FaMapMarkerAlt className="text-red-500 animate-bounce" size={14} />
                                        <span className="text-xs font-bold text-gray-800">{selectedRequest.location}</span>
                                    </div>
                                </div>
                                
                                {/* Location Stats */}
                                <div className="p-3 grid grid-cols-3 gap-2 bg-white border-t border-red-100">
                                    <div className="text-center">
                                        <p className="text-[10px] text-gray-400 font-bold">EMERGENCY</p>
                                        <p className="text-xs font-bold text-gray-800 mt-0.5">{selectedRequest.emergencyType}</p>
                                    </div>
                                    <div className="text-center border-l border-gray-100">
                                        <p className="text-[10px] text-gray-400 font-bold">DISTANCE</p>
                                        <p className="text-xs font-bold text-gray-800 mt-0.5">{selectedRequest.distance}</p>
                                    </div>
                                    <div className="text-center border-l border-gray-100">
                                        <p className="text-[10px] text-gray-400 font-bold">EST. ARRIVAL</p>
                                        <p className="text-xs font-bold text-amber-600 mt-0.5">{selectedRequest.eta}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between items-center mt-2 px-1">
                                <span className="text-xs text-gray-500 font-medium">Requested {selectedRequest.timeRequested}</span>
                                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${getStatusStyle(selectedRequest.status)}`}>
                                    Status: {selectedRequest.status}
                                </span>
                            </div>

                        </div>

                        {/* Modal Footer - ACTION BUTTONS */}
                        <div className="px-5 py-4 border-t border-gray-100 flex flex-col sm:flex-row justify-end gap-2 bg-gray-50">
                            {selectedRequest.status === 'Pending' ? (
                                <>
                                    <button 
                                        onClick={() => { alert('Request Declined'); closeModal(); }}
                                        className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg font-bold text-xs hover:bg-red-50 transition-colors flex-1 sm:flex-none text-center"
                                    >
                                        Decline Request
                                    </button>
                                    <button 
                                        className="px-6 py-2 bg-red-600 text-white rounded-lg font-bold text-sm hover:bg-red-700 transition-all shadow-md shadow-red-200 flex-1 sm:flex-none flex justify-center items-center gap-2"
                                    >
                                        <FaAmbulance size={14} /> Accept & Dispatch
                                    </button>
                                </>
                            ) : (
                                <button 
                                    onClick={closeModal} 
                                    className="px-6 py-2 bg-gray-800 text-white rounded-lg font-bold text-xs hover:bg-gray-900 transition-colors w-full sm:w-auto text-center"
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