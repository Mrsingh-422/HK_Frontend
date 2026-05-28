'use client'
import React, { useState } from 'react';
import { 
    FaSearch, FaFilter, FaEye, FaTimes, 
    FaUserMd, FaProcedures, FaCalendarPlus, 
    FaNotesMedical, FaFileMedicalAlt, FaHeartbeat, FaBone, FaBrain, FaBaby
} from 'react-icons/fa';
import { MdOutlineMoreVert, MdOutlineHotelClass } from 'react-icons/md';
import { RiShieldCrossLine } from 'react-icons/ri';

// ==========================================
// 🌟 DUMMY DATA FOR ADMISSION CASES 🌟
// ==========================================
const admissionData =[
    {
        id: 'ADM-2026-001',
        patientName: 'Karan Malhotra',
        age: 52,
        gender: 'Male',
        department: 'Cardiology',
        doctor: 'Dr. R.K. Sharma',
        ward: 'ICU-A',
        bed: 'Bed 04',
        admissionDate: '15 Mar 2026, 10:30 AM',
        reason: 'Severe Angina Pectoris',
        insurance: 'HDFC Ergo Health',
        status: 'Admitted'
    },
    {
        id: 'ADM-2026-002',
        patientName: 'Anjali Desai',
        age: 34,
        gender: 'Female',
        department: 'Maternity',
        doctor: 'Dr. Sunita Rao',
        ward: 'General Female',
        bed: 'Bed 12',
        admissionDate: '16 Mar 2026, 02:15 PM',
        reason: 'Labor Contractions',
        insurance: 'Star Health',
        status: 'Pending Clearance'
    },
    {
        id: 'ADM-2026-003',
        patientName: 'Ramesh Gupta',
        age: 65,
        gender: 'Male',
        department: 'Orthopedics',
        doctor: 'Dr. V. Patil',
        ward: 'Private Suite',
        bed: 'Room 302',
        admissionDate: '10 Mar 2026, 09:00 AM',
        reason: 'Total Knee Replacement',
        insurance: 'SBI General',
        status: 'Discharging Today'
    },
    {
        id: 'ADM-2026-004',
        patientName: 'Pooja Iyer',
        age: 29,
        gender: 'Female',
        department: 'Neurology',
        doctor: 'Dr. A. Menon',
        ward: 'Semi-Private',
        bed: 'Room 205-B',
        admissionDate: '17 Mar 2026, 08:45 AM',
        reason: 'Severe Migraine / Observation',
        insurance: 'None (Self-Pay)',
        status: 'Admitted'
    },
];

export default function AdmissionCasesPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDept, setFilterDept] = useState('All');
    
    // 🌟 Modal State 🌟
    const [selectedAdmission, setSelectedAdmission] = useState(null);
    const[isModalOpen, setIsModalOpen] = useState(false);

    const openModal = (data) => {
        setSelectedAdmission(data);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setTimeout(() => setSelectedAdmission(null), 200); // Wait for animation
    };

    // 🌟 Utility: Get Initials for Avatar 🌟
    const getInitials = (name) => {
        return name.split(' ').map(n => n[0]).join('').substring(0, 2);
    };

    // 🌟 Utility: Status Styling 🌟
    const getStatusStyle = (status) => {
        switch (status) {
            case 'Admitted':
                return 'bg-blue-50 text-blue-600 border-blue-200';
            case 'Pending Clearance':
                return 'bg-amber-50 text-amber-600 border-amber-200';
            case 'Discharging Today':
                return 'bg-emerald-50 text-emerald-600 border-emerald-200';
            default:
                return 'bg-gray-50 text-gray-600 border-gray-200';
        }
    };

    // 🌟 Utility: Department Icon & Color 🌟
    const getDeptDetails = (dept) => {
        switch (dept) {
            case 'Cardiology': return { icon: <FaHeartbeat />, color: 'text-rose-500 bg-rose-50' };
            case 'Orthopedics': return { icon: <FaBone />, color: 'text-orange-500 bg-orange-50' };
            case 'Neurology': return { icon: <FaBrain />, color: 'text-purple-500 bg-purple-50' };
            case 'Maternity': return { icon: <FaBaby />, color: 'text-pink-500 bg-pink-50' };
            default: return { icon: <FaNotesMedical />, color: 'text-blue-500 bg-blue-50' };
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500 pb-10 relative">
            
            {/* --- HEADER SECTION --- */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                            <FaProcedures size={22} />
                        </div>
                        Admission / Inpatient Cases
                    </h1>
                    <p className="text-sm text-gray-500 mt-1 ml-12">Track, manage and process hospital admissions seamlessly.</p>
                </div>
                
                <button className="bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-0.5 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-indigo-200 flex items-center gap-2">
                    <FaCalendarPlus size={16} /> New Admission
                </button>
            </div>

            {/* --- SMART STATISTICS CARDS --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Admissions */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Admitted</p>
                            <h3 className="text-3xl font-extrabold text-gray-800 mt-1">142</h3>
                            <p className="text-xs text-emerald-500 font-medium mt-1 flex items-center gap-1">
                                ↑ 12% from last week
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-xl shadow-inner">
                            <FaFileMedicalAlt />
                        </div>
                    </div>
                </div>

                {/* Bed Occupancy (WITH PROGRESS BAR) */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Bed Occupancy</p>
                            <h3 className="text-3xl font-extrabold text-gray-800 mt-1">85<span className="text-lg text-gray-400 font-medium">%</span></h3>
                        </div>
                        <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center text-xl shadow-inner">
                            <MdOutlineHotelClass />
                        </div>
                    </div>
                    {/* Progress Bar UI */}
                    <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
                        <div className="bg-rose-500 h-2 rounded-full w-[85%] relative">
                            <span className="absolute right-0 -top-2 w-4 h-4 bg-white border-2 border-rose-500 rounded-full animate-pulse"></span>
                        </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2 text-right">170 / 200 Beds Occupied</p>
                </div>

                {/* Pending Clearances */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Pending Approvals</p>
                            <h3 className="text-3xl font-extrabold text-gray-800 mt-1">18</h3>
                        </div>
                        <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center text-xl shadow-inner">
                            <FaUserMd />
                        </div>
                    </div>
                </div>

                {/* Discharging Today */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Discharging Today</p>
                            <h3 className="text-3xl font-extrabold text-gray-800 mt-1">24</h3>
                        </div>
                        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-xl shadow-inner">
                            <RiShieldCrossLine />
                        </div>
                    </div>
                </div>
            </div>

            {/* --- MAIN DATA TABLE SECTION --- */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                
                {/* Toolbar */}
                <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/40">
                    <div className="relative w-full sm:w-80 group">
                        <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Search by Patient, ID or Doctor..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 transition-all shadow-sm"
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm hover:border-indigo-300 transition-colors cursor-pointer">
                            <FaFilter className="text-gray-400" />
                            <select 
                                value={filterDept}
                                onChange={(e) => setFilterDept(e.target.value)}
                                className="bg-transparent text-sm text-gray-700 font-medium focus:outline-none cursor-pointer w-full"
                            >
                                <option value="All">All Departments</option>
                                <option value="Cardiology">Cardiology</option>
                                <option value="Orthopedics">Orthopedics</option>
                                <option value="Maternity">Maternity</option>
                                <option value="Neurology">Neurology</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                            <tr className="bg-gray-50/80 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-bold">
                                <th className="p-4 pl-6">Patient Details</th>
                                <th className="p-4">Department & Doctor</th>
                                <th className="p-4">Ward / Bed</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-center pr-6">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {admissionData.map((data, index) => {
                                const deptUI = getDeptDetails(data.department);
                                return (
                                <tr 
                                    key={index} 
                                    onClick={() => openModal(data)} 
                                    className="hover:bg-indigo-50/30 transition-all duration-200 group cursor-pointer"
                                >
                                    {/* Patient Column with Avatar */}
                                    <td className="p-4 pl-6">
                                        <div className="flex items-center gap-4">
                                            {/* Beautiful Initials Avatar */}
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold shadow-sm group-hover:scale-110 transition-transform">
                                                {getInitials(data.patientName)}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-800 text-sm group-hover:text-indigo-600 transition-colors">{data.patientName}</span>
                                                <span className="text-xs text-gray-500 font-medium mt-0.5">
                                                    {data.id} • {data.age} Yrs, {data.gender}
                                                </span>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Department & Doctor Column */}
                                    <td className="p-4">
                                        <div className="flex flex-col gap-1.5">
                                            <span className={`inline-flex items-center w-fit gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${deptUI.color}`}>
                                                {deptUI.icon} {data.department}
                                            </span>
                                            <span className="text-xs text-gray-600 font-medium flex items-center gap-1">
                                                <FaUserMd className="text-gray-400" /> {data.doctor}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Ward & Bed Column */}
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                                                <FaProcedures className="text-gray-400" size={12}/> {data.ward}
                                            </span>
                                            <span className="text-xs text-gray-500 mt-1 bg-gray-100 w-fit px-2 py-0.5 rounded border border-gray-200 font-medium">
                                                {data.bed}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Status Column */}
                                    <td className="p-4">
                                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${getStatusStyle(data.status)}`}>
                                            {data.status}
                                        </span>
                                        <p className="text-[10px] text-gray-400 font-medium mt-1.5 ml-1">
                                            Since: {data.admissionDate.split(',')[0]}
                                        </p>
                                    </td>

                                    {/* Actions Column */}
                                    <td className="p-4 pr-6" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center justify-center gap-2">
                                            <button 
                                                title="View Chart"
                                                onClick={() => openModal(data)}
                                                className="p-2 text-indigo-500 hover:text-white hover:bg-indigo-600 rounded-lg transition-all border border-indigo-100 hover:shadow-md"
                                            >
                                                <FaEye size={16} />
                                            </button>
                                            <button 
                                                title="Options"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    alert("Dropdown options will appear here.");
                                                }}
                                                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                            >
                                                <MdOutlineMoreVert size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination */}
                <div className="p-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500 bg-white">
                    <span className="font-medium">Showing 1 to 4 of 142 entries</span>
                    <div className="flex gap-1.5">
                        <button className="px-3 py-1.5 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 font-medium transition-colors text-gray-600">Previous</button>
                        <button className="px-3 py-1.5 border border-indigo-600 rounded-lg bg-indigo-600 text-white font-medium shadow-sm">1</button>
                        <button className="px-3 py-1.5 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 font-medium transition-colors text-gray-600">2</button>
                        <button className="px-3 py-1.5 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 font-medium transition-colors text-gray-600">Next</button>
                    </div>
                </div>
            </div>

            {/* ========================================== */}
            {/* 🌟 PREMIUM PATIENT CHART MODAL 🌟          */}
            {/* ========================================== */}
            {isModalOpen && selectedAdmission && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 transition-all duration-300">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300 ring-1 ring-white/20">
                        
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-white">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
                                    {getInitials(selectedAdmission.patientName)}
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-800 tracking-tight">
                                        Patient Chart
                                    </h2>
                                    <p className="text-xs text-indigo-600 font-semibold">{selectedAdmission.id}</p>
                                </div>
                            </div>
                            <button 
                                onClick={closeModal} 
                                className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl transition-all"
                            >
                                <FaTimes size={18} />
                            </button>
                        </div>

                        {/* Modal Body (Grid Layout for structured data) */}
                        <div className="p-6">
                            <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                                
                                {/* Section 1: Patient Info */}
                                <div className="col-span-2 sm:col-span-1 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                    <p className="text-[11px] uppercase tracking-wider text-gray-400 font-bold mb-3">Patient Information</p>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-xs text-gray-500">Full Name</p>
                                            <p className="font-semibold text-gray-800">{selectedAdmission.patientName}</p>
                                        </div>
                                        <div className="flex justify-between">
                                            <div>
                                                <p className="text-xs text-gray-500">Age</p>
                                                <p className="font-semibold text-gray-800">{selectedAdmission.age} Yrs</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Gender</p>
                                                <p className="font-semibold text-gray-800">{selectedAdmission.gender}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Insurance Provider</p>
                                            <p className="font-semibold text-emerald-600 flex items-center gap-1">
                                                <RiShieldCrossLine /> {selectedAdmission.insurance}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 2: Hospital Info */}
                                <div className="col-span-2 sm:col-span-1 bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                                    <p className="text-[11px] uppercase tracking-wider text-blue-400 font-bold mb-3">Admission Details</p>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-xs text-gray-500">Attending Doctor</p>
                                            <p className="font-bold text-gray-800">{selectedAdmission.doctor}</p>
                                        </div>
                                        <div className="flex justify-between">
                                            <div>
                                                <p className="text-xs text-gray-500">Department</p>
                                                <p className="font-semibold text-gray-800">{selectedAdmission.department}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Ward / Bed</p>
                                                <p className="font-semibold text-indigo-600">{selectedAdmission.ward} • {selectedAdmission.bed}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Admission Date & Time</p>
                                            <p className="font-semibold text-gray-800">{selectedAdmission.admissionDate}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 3: Reason & Status (Full Width) */}
                                <div className="col-span-2 border-t border-gray-100 pt-4 mt-2">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Diagnosis / Reason for Admission</p>
                                            <p className="font-bold text-gray-800 flex items-center gap-2">
                                                <FaNotesMedical className="text-rose-500" /> {selectedAdmission.reason}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-gray-500 mb-1">Current Status</p>
                                            <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold border ${getStatusStyle(selectedAdmission.status)}`}>
                                                {selectedAdmission.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t border-gray-100 flex flex-col-reverse sm:flex-row justify-between gap-3 bg-gray-50">
                            <button 
                                onClick={closeModal} 
                                className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-100 transition-colors shadow-sm w-full sm:w-auto text-center"
                            >
                                Close Window
                            </button>
                            <div className="flex gap-3 w-full sm:w-auto">
                                <button className="px-5 py-2.5 bg-white border border-indigo-200 text-indigo-600 rounded-xl font-semibold text-sm hover:bg-indigo-50 transition-colors shadow-sm w-full sm:w-auto text-center">
                                    Edit Details
                                </button>
                                <button className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200 hover:-translate-y-0.5 w-full sm:w-auto text-center flex justify-center items-center gap-2">
                                    Manage Admission
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
        </div>
    );
}