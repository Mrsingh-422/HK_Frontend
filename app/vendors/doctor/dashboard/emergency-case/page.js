'use client'
import React, { useState } from 'react';
import { 
    FaAmbulance, FaSearch, FaFilter, FaEye, 
    FaCheckCircle, FaExclamationTriangle, FaClock, 
    FaHeartbeat, FaPhoneAlt, FaTimes
} from 'react-icons/fa';
import { MdOutlineMoreVert } from 'react-icons/md';

// ==========================================
// 🌟 DUMMY DATA FOR EMERGENCY CASES 🌟
// ==========================================
const emergencyData =[
    {
        id: 'EMG-1042',
        patientName: 'Rahul Sharma',
        age: 45,
        gender: 'Male',
        type: 'Cardiac Arrest',
        location: 'Sector 15, Vashi',
        time: '10 mins ago',
        status: 'Critical',
        phone: '+91 9876543210'
    },
    {
        id: 'EMG-1043',
        patientName: 'Priya Singh',
        age: 28,
        gender: 'Female',
        type: 'Severe Trauma (Accident)',
        location: 'Highway 4, Andheri',
        time: '25 mins ago',
        status: 'Dispatched',
        phone: '+91 9876543211'
    },
    {
        id: 'EMG-1044',
        patientName: 'Amit Patel',
        age: 60,
        gender: 'Male',
        type: 'Stroke Symptoms',
        location: 'MG Road, Bandra',
        time: '1 hr ago',
        status: 'Admitted',
        phone: '+91 9876543212'
    },
    {
        id: 'EMG-1045',
        patientName: 'Sneha Verma',
        age: 12,
        gender: 'Female',
        type: 'Severe Asthma Attack',
        location: 'Kalyan West',
        time: '2 hrs ago',
        status: 'Resolved',
        phone: '+91 9876543213'
    },
];

export default function EmergencyCasePage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    
    // 🌟 Modal State 🌟
    const[selectedCase, setSelectedCase] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Modal Handlers
    const openModal = (caseData) => {
        setSelectedCase(caseData);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedCase(null);
    };

    // 🌟 Status Badge Color Logic 🌟
    const getStatusStyle = (status) => {
        switch (status) {
            case 'Critical':
                return 'bg-red-100 text-red-700 border-red-200 animate-pulse';
            case 'Dispatched':
                return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'Admitted':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Resolved':
                return 'bg-green-100 text-green-700 border-green-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500 relative">
            
            {/* --- HEADER SECTION --- */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <FaAmbulance className="text-red-500" />
                        Emergency Cases
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Manage and respond to critical patient emergencies instantly.</p>
                </div>
                
                <button className="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-red-200 flex items-center gap-2">
                    <FaExclamationTriangle /> Alert Hospital Admin
                </button>
            </div>

            {/* --- STATISTICS CARDS --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Cards rendering... */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-50 text-red-500 rounded-xl flex items-center justify-center text-2xl">
                        <FaHeartbeat />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Active Critical</p>
                        <h3 className="text-2xl font-bold text-gray-800">02</h3>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-yellow-50 text-yellow-500 rounded-xl flex items-center justify-center text-2xl">
                        <FaAmbulance />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Ambulance Dispatched</p>
                        <h3 className="text-2xl font-bold text-gray-800">05</h3>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center text-2xl">
                        <FaClock />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Avg. Response Time</p>
                        <h3 className="text-2xl font-bold text-gray-800">4.2 <span className="text-sm font-medium text-gray-400">mins</span></h3>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-50 text-green-500 rounded-xl flex items-center justify-center text-2xl">
                        <FaCheckCircle />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Resolved Today</p>
                        <h3 className="text-2xl font-bold text-gray-800">12</h3>
                    </div>
                </div>
            </div>

            {/* --- MAIN DATA TABLE SECTION --- */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                
                {/* Toolbar (Search & Filters) */}
                <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50">
                    <div className="relative w-full sm:w-72">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Search patient or ID..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#08B36A] focus:border-transparent transition-all"
                        />
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <FaFilter className="text-gray-400" />
                        <select 
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full sm:w-auto bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#08B36A] transition-all cursor-pointer"
                        >
                            <option value="All">All Status</option>
                            <option value="Critical">Critical</option>
                            <option value="Dispatched">Dispatched</option>
                            <option value="Admitted">Admitted</option>
                            <option value="Resolved">Resolved</option>
                        </select>
                    </div>
                </div>

                {/* Table Container */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                                <th className="p-4">Case Details</th>
                                <th className="p-4">Emergency Type</th>
                                <th className="p-4">Location & Time</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {emergencyData.map((data, index) => (
                                <tr 
                                    key={index} 
                                    onClick={() => openModal(data)} 
                                    className="hover:bg-gray-50/80 transition-colors group cursor-pointer"
                                >
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-800 text-sm">{data.patientName}</span>
                                            <span className="text-xs text-gray-500 font-medium">
                                                {data.id} • {data.age} Yrs, {data.gender}
                                            </span>
                                            <span className="text-xs text-blue-500 flex items-center gap-1 mt-1">
                                                <FaPhoneAlt size={10} /> {data.phone}
                                            </span>
                                        </div>
                                    </td>

                                    <td className="p-4">
                                        <span className={`text-sm font-semibold ${data.status === 'Critical' ? 'text-red-600' : 'text-gray-700'}`}>
                                            {data.type}
                                        </span>
                                    </td>

                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm text-gray-700">{data.location}</span>
                                            <span className="text-xs text-gray-400 font-medium flex items-center gap-1 mt-0.5">
                                                <FaClock size={10} /> {data.time}
                                            </span>
                                        </div>
                                    </td>

                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyle(data.status)}`}>
                                            {data.status}
                                        </span>
                                    </td>

                                    <td className="p-4" onClick={(e) => e.stopPropagation()}> {/* Stop propagation to prevent modal firing twice */}
                                        <div className="flex items-center justify-center gap-2">
                                            <button 
                                                title="View Details"
                                                onClick={() => openModal(data)}
                                                className="p-2 text-gray-400 hover:text-white hover:bg-[#08B36A] rounded-lg transition-colors border border-transparent hover:border-[#08B36A]"
                                            >
                                                <FaEye size={16} />
                                            </button>
                                            <button 
                                                title="More Options"
                                                onClick={(e) => {
                                                    e.stopPropagation(); // Stop modal opening on More Options click
                                                    alert("More options clicked!");
                                                }}
                                                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                            >
                                                <MdOutlineMoreVert size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination */}
                <div className="p-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500 bg-gray-50/30">
                    <span>Showing 1 to 4 of 4 entries</span>
                    <div className="flex gap-1">
                        <button className="px-3 py-1 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50">Prev</button>
                        <button className="px-3 py-1 border border-gray-200 rounded-lg bg-[#08B36A] text-white font-medium">1</button>
                        <button className="px-3 py-1 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50">Next</button>
                    </div>
                </div>
            </div>

            {/* ========================================== */}
            {/* 🌟 INFORMATION MODAL COMPONENT 🌟          */}
            {/* ========================================== */}
            {isModalOpen && selectedCase && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-opacity">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                        
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
                            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <FaAmbulance className="text-red-500" /> Case Details
                            </h2>
                            <button 
                                onClick={closeModal} 
                                className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                            >
                                <FaTimes size={18} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-4">
                            <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                                <span className="text-gray-500 text-sm font-medium">Case ID</span>
                                <span className="font-bold text-gray-800">{selectedCase.id}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                                <span className="text-gray-500 text-sm font-medium">Patient Name</span>
                                <span className="font-semibold text-gray-800">{selectedCase.patientName}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                                <span className="text-gray-500 text-sm font-medium">Age / Gender</span>
                                <span className="font-medium text-gray-800">{selectedCase.age} Years, {selectedCase.gender}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                                <span className="text-gray-500 text-sm font-medium">Emergency Type</span>
                                <span className={`font-bold ${selectedCase.status === 'Critical' ? 'text-red-600' : 'text-gray-800'}`}>
                                    {selectedCase.type}
                                </span>
                            </div>
                            <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                                <span className="text-gray-500 text-sm font-medium">Location</span>
                                <span className="font-medium text-gray-800">{selectedCase.location}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                                <span className="text-gray-500 text-sm font-medium">Time Reported</span>
                                <span className="font-medium text-gray-800 flex items-center gap-1">
                                    <FaClock className="text-gray-400" size={12}/> {selectedCase.time}
                                </span>
                            </div>
                            <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                                <span className="text-gray-500 text-sm font-medium">Contact Phone</span>
                                <span className="font-medium text-blue-600 flex items-center gap-1">
                                    <FaPhoneAlt size={12}/> {selectedCase.phone}
                                </span>
                            </div>
                            <div className="flex justify-between items-center pt-1">
                                <span className="text-gray-500 text-sm font-medium">Current Status</span>
                                <span className={`px-4 py-1.5 rounded-full text-xs font-bold border ${getStatusStyle(selectedCase.status)}`}>
                                    {selectedCase.status}
                                </span>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/80">
                            <button 
                                onClick={closeModal} 
                                className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors shadow-sm"
                            >
                                Close
                            </button>
                            <button 
                                className="px-5 py-2.5 bg-[#08B36A] text-white rounded-xl font-semibold text-sm hover:bg-[#079b5c] transition-colors shadow-md shadow-green-200"
                            >
                                Manage Case
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
        </div>
    );
}