'use client'
import React, { useState, useEffect } from 'react'
import HospitalDoctorAPI from '@/app/services/HospitalDoctorAPI';
import DigitalPrescriptionTemplate from '../emergency-case/component/DigitalPrescriptionTemplate';
import { 
    FaSearch, FaCalendarAlt, FaUser, FaCheckCircle, 
    FaTimesCircle, FaExclamationTriangle, FaVideo, FaPhoneAlt, 
    FaHospitalUser, FaEye, FaTimes, FaFilePrescription, FaStethoscope, FaDownload, 
    FaSpinner, FaMapMarkerAlt, FaUserMd, FaCoins, FaInfoCircle, FaClock, FaBriefcase, FaEnvelope
} from "react-icons/fa";

export default function ConsultationHistoryPage() {
    // ==========================================
    // 🌟 STATE MANAGEMENT
    // ==========================================
    const [activeTab, setActiveTab] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedHistory, setSelectedHistory] = useState(null); // For Details Modal

    const [historyList, setHistoryList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Prescription Preview State
    const [prescriptionId, setPrescriptionId] = useState(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    // Fetch dynamic history payload from database [2]
    const fetchHistoryLogs = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await HospitalDoctorAPI.getHistoryList(page, 10, searchQuery);
            if (response.success) {
                setHistoryList(response.data || []);
                setTotalPages(response.totalPages || 1);
            }
        } catch (err) {
            setError(err.toString() || "Failed to retrieve history logs.");
        } finally {
            setLoading(false);
        }
    };

    // Debounced Search triggers [2]
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchHistoryLogs();
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, page]);

    const formatDateTime = (dateString) => {
        if (!dateString) return "N/A";
        try {
            const dateObj = new Date(dateString);
            const datePart = dateObj.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
            const timePart = dateObj.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
            return { date: datePart, time: timePart };
        } catch (e) {
            return { date: dateString, time: "N/A" };
        }
    };

    // Derived statistics count [2]
    const stats = {
        total: historyList.length,
        completed: historyList.filter(h => h.status?.toLowerCase() === 'completed' || h.status?.toLowerCase() === 'confirmed').length,
        cancelled: historyList.filter(h => h.status?.toLowerCase() === 'cancelled' || h.status?.toLowerCase() === 'rejected').length,
        pending: historyList.filter(h => h.status?.toLowerCase() === 'pending' || h.status?.toLowerCase() === 'discharge-pending').length,
    };

    // Client-side local filtering based on state tabs [2]
    const filteredHistory = historyList.filter(item => {
        if (activeTab === 'All') return true;
        if (activeTab === 'Completed') return item.status?.toLowerCase() === 'completed' || item.status?.toLowerCase() === 'confirmed';
        if (activeTab === 'Cancelled') return item.status?.toLowerCase() === 'cancelled' || item.status?.toLowerCase() === 'rejected';
        if (activeTab === 'Pending') return item.status?.toLowerCase() === 'pending' || item.status?.toLowerCase() === 'discharge-pending';
        return true;
    });

    return (
        <div className="pb-10 relative max-w-7xl mx-auto">
            
            {/* --- PAGE HEADER --- */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 font-sans">Consultation History</h1>
                    <p className="text-sm text-gray-500 mt-1">View past appointments, medical notes, and prescriptions.</p>
                </div>
            </div>

            {/* ========================================== */}
            {/* 🌟 STATS CARDS 🌟 */}
            {/* ========================================== */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8 font-sans">
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
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Pending</p>
                        <p className="text-2xl font-black text-gray-800">{stats.pending}</p>
                    </div>
                </div>
            </div>

            {/* ========================================== */}
            {/* 🌟 FILTERS & SEARCH 🌟 */}
            {/* ========================================== */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8 font-sans">
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
                        {['All', 'Completed', 'Cancelled', 'Pending'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all duration-200 ${
                                    activeTab === tab 
                                    ? tab === 'Completed' ? 'bg-[#08B36A] text-white shadow-md' 
                                        : tab === 'Cancelled' ? 'bg-red-500 text-white shadow-md' 
                                        : tab === 'Pending' ? 'bg-yellow-500 text-white shadow-md'
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
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white">
                            <FaSpinner className="animate-spin text-[#08B36A] text-3xl mb-3" />
                            <p className="text-slate-400 text-xs font-black uppercase tracking-wider">Syncing complete logs...</p>
                        </div>
                    ) : error ? (
                        <div className="p-12 text-center flex flex-col items-center justify-center bg-white">
                            <FaExclamationTriangle className="text-red-500 text-4xl mb-3" />
                            <p className="text-slate-700 font-bold">{error}</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead className="bg-white border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Booking ID</th>
                                    <th className="px-6 py-4 font-semibold">Patient Info</th>
                                    <th className="px-6 py-4 font-semibold">Date & Time</th>
                                    <th className="px-6 py-4 font-semibold">Consultation</th>
                                    <th className="px-6 py-4 font-semibold">Status</th>
                                    <th className="px-6 py-4 font-semibold text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredHistory.length > 0 ? (
                                    filteredHistory.map((item) => {
                                        const schedule = formatDateTime(item.startDate || item.createdAt);
                                        const patient = item.patients?.[0] || {};
                                        const patientName = patient.patientName || item.userId?.name || "N/A";
                                        const patientAge = patient.patientAge || item.userId?.age || 30;
                                        return (
                                            <tr 
                                                key={item._id} 
                                                onClick={() => setSelectedHistory(item)} // 👈 Row is Clickable
                                                className="hover:bg-gray-50/80 transition-colors duration-200 cursor-pointer group"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap font-bold text-sm text-[#08B36A]">
                                                    {item.bookingId}
                                                </td>

                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        <div className="bg-gray-100 p-2.5 rounded-full text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors"><FaUser size={16} /></div>
                                                        <div>
                                                            <span className="font-bold text-sm text-gray-800 block">{patientName}</span>
                                                            <span className="text-xs text-gray-500 font-medium">{patientAge} Yrs • {patient.gender || item.userId?.gender || "Male"}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-sm text-gray-700">{schedule.date}</span>
                                                        <span className="text-xs text-gray-500 font-bold mt-0.5">{schedule.time}</span>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex flex-col items-start gap-1">
                                                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md">
                                                            <FaHospitalUser className="text-orange-500"/>
                                                            {item.bedBookingType || item.bookingType || "Admission"}
                                                        </div>
                                                        <span className="text-[11px] text-gray-500 font-medium truncate max-w-[150px]" title={patient.reasonForVisit || item.clinicalSummary?.chiefComplaint}>
                                                            {patient.reasonForVisit || item.clinicalSummary?.chiefComplaint || "No complaint note"}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide ${
                                                        item.status?.toLowerCase() === 'completed' || item.status?.toLowerCase() === 'confirmed' ? 'bg-green-100 text-green-700' 
                                                        : item.status?.toLowerCase() === 'cancelled' || item.status?.toLowerCase() === 'rejected' ? 'bg-red-100 text-red-700' 
                                                        : 'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                        {(item.status?.toLowerCase() === 'completed' || item.status?.toLowerCase() === 'confirmed') && <FaCheckCircle />}
                                                        {(item.status?.toLowerCase() === 'cancelled' || item.status?.toLowerCase() === 'rejected') && <FaTimesCircle />}
                                                        {(item.status?.toLowerCase() === 'pending' || item.status?.toLowerCase() === 'discharge-pending') && <FaExclamationTriangle />}
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
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center">
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
                    )}
                </div>
            </div>

            {/* ========================================= */}
            {/* 📝 HISTORY DETAILS MODAL (Pop-up) [2] */}
            {/* ========================================= */}
            {selectedHistory && (() => {
                const patient = selectedHistory.patients?.[0] || {};
                const clinical = selectedHistory.clinicalSummary || {};
                const billing = selectedHistory.pricingBreakdown || {};
                const user = selectedHistory.userId || {};
                return (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 font-sans">
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setSelectedHistory(null)}></div>

                        <div className="relative bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200 border border-slate-100">
                            
                            {/* Modal Header */}
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                                <div className="flex items-center gap-3.5">
                                    <div className={`p-3.5 rounded-2xl ${
                                        selectedHistory.status?.toLowerCase() === 'completed' || selectedHistory.status?.toLowerCase() === 'confirmed' ? 'bg-green-50 text-[#08B36A]' : 
                                        selectedHistory.status?.toLowerCase() === 'cancelled' || selectedHistory.status?.toLowerCase() === 'rejected' ? 'bg-red-50 text-red-500' : 'bg-yellow-50 text-yellow-500'
                                    }`}>
                                        {(selectedHistory.status?.toLowerCase() === 'completed' || selectedHistory.status?.toLowerCase() === 'confirmed') ? <FaCheckCircle size={22} /> : 
                                         (selectedHistory.status?.toLowerCase() === 'cancelled' || selectedHistory.status?.toLowerCase() === 'rejected') ? <FaTimesCircle size={22} /> : <FaExclamationTriangle size={22} />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-2xl font-black text-slate-900 leading-tight">Case Summary Dashboard</h2>
                                            <span className="px-2.5 py-0.5 bg-red-50 text-red-700 text-[10px] font-black rounded uppercase tracking-wide border border-red-100/50">
                                                {selectedHistory.triageLevel || "Standard"}
                                            </span>
                                        </div>
                                        <span className="text-xs font-extrabold text-slate-400 block mt-1">System Booking ID: {selectedHistory.bookingId}</span>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedHistory(null)} className="p-3 bg-slate-50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors">
                                    <FaTimes size={16} />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 md:p-8 overflow-y-auto bg-slate-50/50 space-y-6 flex-1">
                                
                                {/* Dual Column Details Block */}
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                    
                                    {/* Left Column: Patient Profile & Clinical Summaries */}
                                    <div className="lg:col-span-7 space-y-6">
                                        
                                        {/* Primary Patient Details Card */}
                                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                                            <div className="flex items-start gap-4">
                                                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center text-2xl flex-shrink-0"><FaUser /></div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Patient Profile</p>
                                                    <h3 className="font-black text-slate-800 text-xl leading-snug truncate mt-0.5">{patient.patientName || "N/A"}</h3>
                                                    <p className="text-sm text-slate-500 font-medium mt-1">
                                                        {patient.patientAge || "30"} Years Old • {patient.gender || "Male"} • Relationship: <span className="font-extrabold text-slate-700">{patient.relation || "Self"}</span>
                                                    </p>
                                                </div>
                                            </div>

                                            {patient.reasonForVisit && (
                                                <div className="border-t border-slate-50 pt-3">
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Reason for Visit</span>
                                                    <p className="text-xs text-slate-600 bg-slate-50/70 p-3 rounded-xl border border-slate-100 italic leading-relaxed">
                                                        "{patient.reasonForVisit}"
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Diagnostic Findings Ledger */}
                                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                                            <div className="bg-blue-50/50 px-6 py-4 border-b border-slate-100 flex items-center gap-2.5">
                                                <FaFilePrescription className="text-blue-500 text-base" />
                                                <h3 className="font-extrabold text-slate-800 text-sm">Diagnostic & Clinical Ledger</h3>
                                            </div>
                                            <div className="p-6 space-y-4 text-xs font-semibold text-slate-600">
                                                
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">Triage Priority</span>
                                                        <span className="text-sm font-extrabold text-slate-800">{clinical.triagePriority || selectedHistory.triageLevel || "Emergency"}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">Patient Blood Group</span>
                                                        <span className="text-sm font-extrabold text-red-600">{clinical.bloodGroup || "O+"}</span>
                                                    </div>
                                                </div>

                                                {clinical.diagnosis && (
                                                    <div>
                                                        <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Clinical Diagnosis</span>
                                                        <p className="text-slate-800 font-bold bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                            {clinical.diagnosis}
                                                        </p>
                                                    </div>
                                                )}

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {clinical.investigation && (
                                                        <div>
                                                            <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Advised Investigations</span>
                                                            <p className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-slate-700">{clinical.investigation}</p>
                                                        </div>
                                                    )}
                                                    {clinical.treatmentResult && (
                                                        <div>
                                                            <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Treatment Outcome</span>
                                                            <p className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-slate-700">{clinical.treatmentResult}</p>
                                                        </div>
                                                    )}
                                                </div>

                                                {clinical.dischargeNote && (
                                                    <div>
                                                        <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Discharge Instructions</span>
                                                        <p className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-slate-700 leading-relaxed italic">
                                                            "{clinical.dischargeNote}"
                                                        </p>
                                                    </div>
                                                )}

                                            </div>
                                        </div>

                                        {/* Specialist Bedside Consultation Team [2] */}
                                        {selectedHistory.bedsideCareTeam && selectedHistory.bedsideCareTeam.length > 0 && (
                                            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
                                                <h3 className="text-sm font-black text-slate-800 flex items-center gap-2.5 border-b border-slate-100 pb-3">
                                                    <FaUserMd className="text-indigo-500 text-base" />
                                                    Attending Specialist Advisory Logs
                                                </h3>
                                                <div className="space-y-4">
                                                    {selectedHistory.bedsideCareTeam.map((team, idx) => (
                                                        <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3 text-xs font-semibold">
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <span className="font-black text-slate-800 block text-sm">Consultant Doctor ID</span>
                                                                    <span className="text-slate-400 font-extrabold block uppercase text-[10px] mt-1">Ref ID: {team.doctorId}</span>
                                                                </div>
                                                                <span className={`px-2.5 py-1 text-[10px] font-black rounded-full border ${
                                                                    team.status === 'Completed' || team.status === 'Accepted'
                                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                                    : 'bg-amber-50 text-amber-700 border-amber-100'
                                                                }`}>
                                                                    {team.status || "Completed"}
                                                                </span>
                                                            </div>

                                                            <div className="bg-white p-3 rounded-xl border border-slate-100 text-slate-600 leading-relaxed">
                                                                <p><strong>Reason for consultation:</strong> {team.requestReason || "Consultation opinion required."}</p>
                                                                {team.patientConditionAtRequest && <p className="mt-1"><strong>Condition during Request:</strong> {team.patientConditionAtRequest}</p>}
                                                            </div>

                                                            {team.specialistFeedback && team.specialistFeedback.length > 0 && (
                                                                <div className="border-t border-dashed border-slate-200 pt-3 space-y-2">
                                                                    <span className="font-extrabold text-slate-800 block text-[10px] uppercase tracking-wider text-slate-400">Feedback Observation logs</span>
                                                                    {team.specialistFeedback.map((fb, fbIdx) => (
                                                                        <div key={fbIdx} className="bg-indigo-50/20 p-3.5 rounded-xl border border-indigo-100/50 space-y-1.5 animate-in fade-in duration-200">
                                                                            <p className="italic text-slate-800 font-serif leading-relaxed">"{fb.observation}"</p>
                                                                            <div className="flex justify-between text-[10px] text-slate-400 border-t border-indigo-50/50 pt-1.5 mt-1 font-bold">
                                                                                <span>Condition: <strong className="text-slate-600">{fb.patientCondition}</strong></span>
                                                                                <span>Priority: <strong className="text-slate-600">{fb.priorityRating}</strong></span>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                    </div>

                                    {/* Right Column: Account profile, stays, and financial ledger */}
                                    <div className="lg:col-span-5 space-y-6">
                                        
                                        {/* Financial & Billing Ledger Card [2] */}
                                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                                            <h4 className="text-sm font-black text-slate-800 flex items-center gap-2 border-b border-slate-50 pb-3">
                                                <FaCoins className="text-emerald-500" />
                                                Billing & Account Ledger
                                            </h4>

                                            <div className="grid grid-cols-2 gap-y-4 text-xs font-semibold text-slate-600">
                                                <div>
                                                    <span className="text-[10px] text-slate-400 block uppercase">Base Consultation Fee</span>
                                                    <span className="text-base font-extrabold text-slate-800">₹{billing.baseFee || 0}</span>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] text-slate-400 block uppercase">Extra Charges</span>
                                                    <span className="text-base font-extrabold text-slate-800">₹{billing.extraCharges || 0}</span>
                                                </div>
                                                <div className="col-span-2 border-t border-slate-50 pt-3 flex justify-between items-center">
                                                    <div>
                                                        <span className="text-[10px] text-slate-400 block uppercase">Subtotal Amount</span>
                                                        <span className="text-xl font-black text-slate-900">₹{selectedHistory.totalAmount || billing.subtotal || 0}</span>
                                                    </div>
                                                    <span className={`px-3 py-1.5 text-xs font-black rounded-full border tracking-wide uppercase ${
                                                        selectedHistory.paymentStatus === 'Paid'
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                        : 'bg-amber-50 text-amber-700 border-amber-100'
                                                    }`}>
                                                        {selectedHistory.paymentStatus || "Pending"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Stay Metadata Card */}
                                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                                            <h4 className="text-sm font-black text-slate-800 flex items-center gap-2 border-b border-slate-50 pb-3">
                                                <FaInfoCircle className="text-blue-500" />
                                                Stay & Coordination Meta
                                            </h4>

                                            <div className="space-y-3.5 text-xs font-semibold text-slate-600">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2.5 bg-slate-50 text-slate-400 rounded-xl"><FaClock /></div>
                                                    <div>
                                                        <span className="text-[10px] text-slate-400 block uppercase">Stay Duration</span>
                                                        <span className="text-slate-800 font-bold">{selectedHistory.stayDuration || 0} Days</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2.5 bg-slate-50 text-slate-400 rounded-xl"><FaCalendarAlt /></div>
                                                    <div>
                                                        <span className="text-[10px] text-slate-400 block uppercase">Stay Commencement</span>
                                                        <span className="text-slate-800 font-bold">{formatDateTime(selectedHistory.startDate).date}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2.5 bg-slate-50 text-slate-400 rounded-xl"><FaBriefcase /></div>
                                                    <div>
                                                        <span className="text-[10px] text-slate-400 block uppercase">Booking Protocol</span>
                                                        <span className="text-slate-800 font-bold">{selectedHistory.bedBookingType || selectedHistory.bookingType || "Admission"}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Primary Account User Identity */}
                                        {user && (
                                            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                                                <h4 className="text-sm font-black text-slate-800 flex items-center gap-2 border-b border-slate-50 pb-3">
                                                    <FaUser className="text-slate-400" />
                                                    Primary Account Owner
                                                </h4>

                                                <div className="space-y-3 text-xs font-semibold text-slate-600">
                                                    <div>
                                                        <span className="text-[10px] text-slate-400 block uppercase">Account Holder</span>
                                                        <span className="text-slate-800 font-bold">{user.name || "N/A"}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] text-slate-400 block uppercase">Account Email</span>
                                                        <span className="text-slate-800 font-bold flex items-center gap-1.5 mt-0.5">
                                                            <FaEnvelope className="text-slate-400 text-[10px]" />
                                                            {user.email || "N/A"}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] text-slate-400 block uppercase">Registered Contact</span>
                                                        <span className="text-slate-800 font-bold flex items-center gap-1.5 mt-0.5">
                                                            <FaPhoneAlt className="text-slate-400 text-[10px]" />
                                                            {user.phone || "N/A"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                    </div>

                                </div>

                            </div>

                            {/* Modal Footer */}
                            <div className="p-5 border-t border-gray-100 bg-white flex justify-between items-center rounded-b-[2rem] sticky bottom-0 z-10">
                                <button onClick={() => setSelectedHistory(null)} className="px-6 py-2.5 bg-gray-50 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-colors">
                                    Close
                                </button>

                                {/* Dynamically integrated Digital Prescription & Summary review [2] */}
                                {(selectedHistory.status?.toLowerCase() === 'completed' || selectedHistory.status?.toLowerCase() === 'confirmed') && (
                                    <button 
                                        onClick={() => {
                                            setPrescriptionId(selectedHistory._id);
                                            setIsPreviewOpen(true);
                                        }}
                                        className="px-6 py-2.5 bg-[#08B36A] hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-green-100 transition-colors flex items-center gap-2"
                                    >
                                        <FaDownload /> View Discharge PDF
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* Integrated Print Preview Overlay [2] */}
            {isPreviewOpen && prescriptionId && (
                <DigitalPrescriptionTemplate 
                    isOpen={isPreviewOpen}
                    onClose={() => {
                        setIsPreviewOpen(false);
                        setPrescriptionId(null);
                    }}
                    data={prescriptionId}
                    isDischargeFlow={false}
                />
            )}

        </div>
    );
}