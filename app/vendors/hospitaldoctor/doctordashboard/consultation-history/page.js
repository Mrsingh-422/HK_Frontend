'use client'
import React, { useState, useEffect } from 'react'
import HospitalDoctorAPI from '@/app/services/HospitalDoctorAPI';
import DigitalPrescriptionTemplate from '../emergency-case/component/DigitalPrescriptionTemplate';
import { 
    FaSearch, FaCalendarAlt, FaUser, FaCheckCircle, 
    FaTimesCircle, FaExclamationTriangle, FaHospitalUser, FaEye, FaTimes, 
    FaFilePrescription, FaDownload, FaSpinner, FaUserMd, FaCoins, 
    FaInfoCircle, FaClock, FaBriefcase, FaEnvelope, FaPhoneAlt, FaFilePdf,
    FaProcedures, FaTint, FaChevronLeft, FaChevronRight, FaExternalLinkAlt
} from "react-icons/fa";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://192.168.1.7:5002';

export default function ConsultationHistoryPage() {
    // ==========================================
    // 🌟 STATE MANAGEMENT
    // ==========================================
    const [activeTab, setActiveTab] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedHistory, setSelectedHistory] = useState(null);

    const [historyList, setHistoryList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);

    // Prescription Preview State
    const [prescriptionId, setPrescriptionId] = useState(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http://') || path.startsWith('https://')) return path;
        return `${API_BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
    };

    // Fetch dynamic history payload from database
    const fetchHistoryLogs = async (currentPage = 1, search = '') => {
        try {
            setLoading(true);
            setError(null);
            const response = await HospitalDoctorAPI.getHistoryList(currentPage, 10, search);
            if (response && response.success) {
                setHistoryList(response.data || []);
                setTotalPages(response.totalPages || 1);
                setTotalRecords(response.totalRecords || 0);
                setPage(response.currentPage || currentPage);
            } else {
                setError(response?.message || "Failed to retrieve history logs.");
            }
        } catch (err) {
            setError(err.toString() || "Failed to retrieve history logs.");
        } finally {
            setLoading(false);
        }
    };

    // Debounced Search triggers
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchHistoryLogs(page, searchQuery);
        }, 400);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, page]);

    const formatDateTime = (dateString) => {
        if (!dateString) return { date: "N/A", time: "N/A" };
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

    // Derived statistics count
    const stats = {
        total: totalRecords || historyList.length,
        completed: historyList.filter(h => h.status?.toLowerCase() === 'completed' || h.status?.toLowerCase() === 'confirmed').length,
        cancelled: historyList.filter(h => h.status?.toLowerCase() === 'cancelled' || h.status?.toLowerCase() === 'rejected').length,
        pending: historyList.filter(h => h.status?.toLowerCase() === 'pending' || h.status?.toLowerCase() === 'discharge-pending' || h.status?.toLowerCase() === 'in-progress').length,
    };

    // Client-side local filtering based on state tabs
    const filteredHistory = historyList.filter(item => {
        if (activeTab === 'All') return true;
        if (activeTab === 'Completed') return item.status?.toLowerCase() === 'completed' || item.status?.toLowerCase() === 'confirmed';
        if (activeTab === 'Cancelled') return item.status?.toLowerCase() === 'cancelled' || item.status?.toLowerCase() === 'rejected';
        if (activeTab === 'Pending') return item.status?.toLowerCase() === 'pending' || item.status?.toLowerCase() === 'discharge-pending' || item.status?.toLowerCase() === 'in-progress';
        return true;
    });

    return (
        <div className="pb-10 relative max-w-7xl mx-auto font-sans">
            
            {/* --- PAGE HEADER --- */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Consultation & Case History</h1>
                    <p className="text-xs md:text-sm text-gray-500 mt-1 font-medium">Review completed patient discharges, specialist clinical logs, and diagnostic files.</p>
                </div>
            </div>

            {/* ========================================== */}
            {/* 🌟 STATS CARDS 🌟 */}
            {/* ========================================== */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
                <div className="bg-white rounded-2xl p-5 flex items-center gap-4 shadow-sm border border-gray-100">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl shrink-0"><FaCalendarAlt /></div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Total Records</p>
                        <p className="text-2xl font-black text-gray-800">{stats.total}</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-5 flex items-center gap-4 shadow-sm border border-gray-100">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#08B36A] flex items-center justify-center text-xl shrink-0"><FaCheckCircle /></div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Completed</p>
                        <p className="text-2xl font-black text-gray-800">{stats.completed}</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-5 flex items-center gap-4 shadow-sm border border-gray-100">
                    <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center text-xl shrink-0"><FaTimesCircle /></div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Cancelled</p>
                        <p className="text-2xl font-black text-gray-800">{stats.cancelled}</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-5 flex items-center gap-4 shadow-sm border border-gray-100">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl shrink-0"><FaExclamationTriangle /></div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">In-Progress</p>
                        <p className="text-2xl font-black text-gray-800">{stats.pending}</p>
                    </div>
                </div>
            </div>

            {/* ========================================== */}
            {/* 🌟 FILTERS & SEARCH 🌟 */}
            {/* ========================================== */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
                <div className="p-4 md:p-5 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/50 border-b border-gray-100">
                    
                    {/* Search Bar */}
                    <div className="relative w-full md:w-96">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Search by Patient Name or Booking ID..." 
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setPage(1);
                            }}
                            className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#08B36A]/20 focus:border-[#08B36A] transition-all"
                        />
                    </div>

                    {/* Tabs */}
                    <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-200 flex flex-wrap gap-1 w-full md:w-auto">
                        {['All', 'Completed', 'Cancelled', 'Pending'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                                    activeTab === tab 
                                    ? tab === 'Completed' ? 'bg-[#08B36A] text-white shadow-md' 
                                        : tab === 'Cancelled' ? 'bg-red-500 text-white shadow-md' 
                                        : tab === 'Pending' ? 'bg-amber-500 text-white shadow-md'
                                        : 'bg-slate-900 text-white shadow-md'
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
                            <p className="text-slate-400 text-xs font-black uppercase tracking-wider">Syncing historical records...</p>
                        </div>
                    ) : error ? (
                        <div className="p-12 text-center flex flex-col items-center justify-center bg-white">
                            <FaExclamationTriangle className="text-red-500 text-4xl mb-3" />
                            <p className="text-slate-700 font-bold">{error}</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse min-w-[900px] whitespace-nowrap">
                            <thead className="bg-white border-b border-gray-100 text-gray-400 text-[10px] uppercase font-black tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Booking ID</th>
                                    <th className="px-6 py-4">Patient Profile</th>
                                    <th className="px-6 py-4">Placement & Doctor</th>
                                    <th className="px-6 py-4">Stay Timeline</th>
                                    <th className="px-6 py-4">Billing & Status</th>
                                    <th className="px-6 py-4 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-xs">
                                {filteredHistory.length > 0 ? (
                                    filteredHistory.map((item) => {
                                        const schedule = formatDateTime(item.startDate || item.createdAt);
                                        const patient = item.patientDetails || item.patients?.[0] || item.userId || {};
                                        const patientName = patient.patientName || patient.name || "Unknown Patient";
                                        const patientAge = patient.age !== undefined ? patient.age : (patient.patientAge || 'N/A');
                                        const patientGender = patient.gender || "N/A";
                                        const bloodGroup = patient.bloodGroup;
                                        const reason = patient.reasonForVisit || item.clinicalSummary?.chiefComplaint;

                                        const bed = item.bedDetails || (typeof item.bedId === 'object' ? item.bedId : {}) || {};
                                        const wardName = bed.wardName || item.wardName || "General Ward";
                                        const bedNumber = bed.bedNumber || item.bedNumber || "N/A";

                                        const doctor = item.assignedDoctor || (typeof item.doctorId === 'object' ? item.doctorId : null);
                                        const docName = doctor?.name ? (doctor.name.startsWith('Dr.') ? doctor.name : `Dr. ${doctor.name}`) : "Assigned Clinician";

                                        const billing = item.billing || item.pricingBreakdown || {};
                                        const totalAmt = billing.totalAmount !== undefined ? billing.totalAmount : (item.totalAmount || 0);
                                        const paymentStatus = billing.paymentStatus || item.paymentStatus || "Paid";
                                        const paymentMethod = billing.paymentMethod || "Online";

                                        return (
                                            <tr 
                                                key={item._id} 
                                                onClick={() => setSelectedHistory(item)}
                                                className="hover:bg-slate-50/70 transition-colors duration-200 cursor-pointer group"
                                            >
                                                {/* Booking ID & Stay Duration */}
                                                <td className="px-6 py-4">
                                                    <span className="font-extrabold text-xs text-[#08B36A] block">
                                                        #{item.bookingId || "N/A"}
                                                    </span>
                                                    {item.stayDuration && (
                                                        <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
                                                            Stay: {item.stayDuration} Days
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Patient Info */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        {patient.profilePic ? (
                                                            <img 
                                                                src={getImageUrl(patient.profilePic)} 
                                                                alt={patientName} 
                                                                className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0" 
                                                            />
                                                        ) : (
                                                            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0">
                                                                {patientName.charAt(0) || <FaUser size={13} />}
                                                            </div>
                                                        )}
                                                        <div>
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="font-extrabold text-xs text-gray-900 leading-none">{patientName}</span>
                                                                {bloodGroup && (
                                                                    <span className="text-[8px] font-black text-rose-600 bg-rose-50 px-1 py-0.2 rounded border border-rose-100">
                                                                        {bloodGroup}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <span className="text-[10px] text-gray-400 font-semibold block mt-0.5">
                                                                {patientAge} Yrs • {patientGender} {patient.relation ? `(${patient.relation})` : ''}
                                                            </span>
                                                            {reason && (
                                                                <span className="text-[10px] text-gray-500 font-medium block truncate max-w-[160px] mt-0.5" title={reason}>
                                                                    "{reason}"
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                
                                                {/* Placement & Doctor */}
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="font-bold text-xs text-slate-800 flex items-center gap-1">
                                                            <FaProcedures className="text-[#08B36A]" size={11} /> {wardName} • Bed {bedNumber}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400 font-medium">
                                                            {docName} {doctor?.speciality ? `(${doctor.speciality})` : ''}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Stay Timeline */}
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col text-[11px] text-gray-600 font-semibold">
                                                        <span>In: {schedule.date}</span>
                                                        {item.endDate && (
                                                            <span className="text-[10px] text-gray-400 mt-0.5">
                                                                Out: {formatDateTime(item.endDate).date}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Billing & Status */}
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col items-start gap-1">
                                                        <span className="font-black text-xs text-gray-800">
                                                            ₹{Number(totalAmt).toLocaleString('en-IN')}
                                                        </span>
                                                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                                            item.status?.toLowerCase() === 'completed' || item.status?.toLowerCase() === 'confirmed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                                            : item.status?.toLowerCase() === 'cancelled' || item.status?.toLowerCase() === 'rejected' ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                                                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                                                        }`}>
                                                            {item.status || "Completed"}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Action */}
                                                <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                                                    <button 
                                                        onClick={() => setSelectedHistory(item)}
                                                        className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all shadow-sm"
                                                    >
                                                        View Dossier
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

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="p-4 bg-white border-t border-gray-100 flex justify-between items-center text-xs">
                        <span className="text-gray-500 font-bold">
                            Showing Page <strong className="text-slate-800">{page}</strong> of <strong className="text-slate-800">{totalPages}</strong> ({totalRecords} Total)
                        </span>
                        <div className="flex gap-2">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(p => Math.max(p - 1, 1))}
                                className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40 hover:bg-gray-50 font-bold flex items-center gap-1"
                            >
                                <FaChevronLeft size={10} /> Prev
                            </button>
                            <button
                                disabled={page === totalPages}
                                onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                                className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40 hover:bg-gray-50 font-bold flex items-center gap-1"
                            >
                                Next <FaChevronRight size={10} />
                            </button>
                        </div>
                    </div>
                )}

            </div>

            {/* ========================================= */}
            {/* 📝 HISTORY DETAILS MODAL (Pop-up) */}
            {/* ========================================= */}
            {selectedHistory && (() => {
                const patient = selectedHistory.patientDetails || selectedHistory.patients?.[0] || selectedHistory.userId || {};
                const patientName = patient.patientName || patient.name || "N/A";
                const patientAge = patient.age !== undefined ? patient.age : (patient.patientAge || "N/A");
                const patientGender = patient.gender || "N/A";
                const patientRelation = patient.relation || "Self";
                const bloodGroup = patient.bloodGroup || selectedHistory.clinicalSummary?.bloodGroup || "N/A";
                const profilePic = patient.profilePic || selectedHistory.userId?.profilePic;
                const reason = patient.reasonForVisit || selectedHistory.clinicalSummary?.chiefComplaint;

                const bed = selectedHistory.bedDetails || (typeof selectedHistory.bedId === 'object' ? selectedHistory.bedId : {}) || {};
                const doctor = selectedHistory.assignedDoctor || (typeof selectedHistory.doctorId === 'object' ? selectedHistory.doctorId : null);

                const clinical = selectedHistory.clinicalSummary || {};
                const clinicalFiles = selectedHistory.clinicalFiles || {};
                const billing = selectedHistory.billing || selectedHistory.pricingBreakdown || {};
                const user = selectedHistory.userId || {};

                const dischargePdfUrl = clinicalFiles.dischargeSummaryPdf || clinical.dischargeSummaryPdf;
                const dietPlanPdfUrl = clinicalFiles.dietPlanPdf;
                const dischargeCardUrl = clinicalFiles.dischargeCardUrl;
                const reportsList = clinicalFiles.clinicalReports || clinical.uploadedReports || [];

                return (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 font-sans">
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setSelectedHistory(null)}></div>

                        <div className="relative bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200 border border-slate-100">
                            
                            {/* Modal Header */}
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                                <div className="flex items-center gap-3.5">
                                    <div className="p-3.5 rounded-2xl bg-emerald-50 text-[#08B36A]">
                                        <FaCheckCircle size={22} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-2xl font-black text-slate-900 leading-tight">Case Dossier</h2>
                                            <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-full uppercase tracking-wider border border-emerald-200">
                                                {selectedHistory.status || "Completed"}
                                            </span>
                                        </div>
                                        <span className="text-xs font-bold text-slate-400 block mt-0.5">Booking ID: #{selectedHistory.bookingId}</span>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedHistory(null)} className="p-3 bg-slate-50 hover:bg-rose-50 text-gray-400 hover:text-rose-500 rounded-full transition-colors">
                                    <FaTimes size={16} />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 md:p-8 overflow-y-auto bg-slate-50/50 space-y-6 flex-1">
                                
                                {/* Dual Column Details Block */}
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                    
                                    {/* Left Column: Patient Profile & Clinical Summaries (7 cols) */}
                                    <div className="lg:col-span-7 space-y-6">
                                        
                                        {/* Primary Patient Details Card */}
                                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                                            <div className="flex items-start gap-4">
                                                {profilePic ? (
                                                    <img 
                                                        src={getImageUrl(profilePic)} 
                                                        alt={patientName} 
                                                        className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shrink-0" 
                                                    />
                                                ) : (
                                                    <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center text-2xl shrink-0">
                                                        <FaUser />
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Patient Demographics</p>
                                                    <h3 className="font-black text-slate-800 text-lg leading-snug truncate mt-0.5">{patientName}</h3>
                                                    <p className="text-xs text-slate-500 font-semibold mt-1">
                                                        {patientAge} Yrs • {patientGender} • Relation: <strong className="text-slate-700">{patientRelation}</strong>
                                                    </p>
                                                    {bloodGroup !== 'N/A' && (
                                                        <span className="inline-block mt-1.5 px-2 py-0.5 bg-rose-50 text-rose-600 text-[10px] font-black rounded border border-rose-100">
                                                            Blood Group: {bloodGroup}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {reason && (
                                                <div className="border-t border-slate-50 pt-3">
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Reason for Visit</span>
                                                    <p className="text-xs text-slate-600 bg-slate-50/70 p-3 rounded-xl border border-slate-100 italic leading-relaxed">
                                                        "{reason}"
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Diagnostic Findings Ledger */}
                                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
                                            <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2 border-b pb-2">
                                                <FaFilePrescription className="text-emerald-600 text-base" />
                                                Clinical Diagnosis & Findings
                                            </h3>
                                            
                                            <div className="space-y-3 text-xs">
                                                {clinical.diagnosis && (
                                                    <div>
                                                        <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Clinical Diagnosis</span>
                                                        <p className="text-slate-800 font-bold bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                            {clinical.diagnosis}
                                                        </p>
                                                    </div>
                                                )}

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {clinical.investigation && (
                                                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                            <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">Investigations</span>
                                                            <p className="text-slate-700 font-semibold">{clinical.investigation}</p>
                                                        </div>
                                                    )}
                                                    {clinical.treatmentResult && (
                                                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                            <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">Treatment Outcome</span>
                                                            <p className="text-emerald-700 font-bold">{clinical.treatmentResult}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Clinical Files Downloads */}
                                        <div className="p-5 bg-slate-900 text-white rounded-3xl shadow-sm space-y-3">
                                            <h4 className="text-xs font-black uppercase tracking-wider text-[#08B36A] flex items-center gap-2">
                                                <FaFilePdf /> Clinical Documents & Reports
                                            </h4>
                                            <div className="flex flex-wrap gap-2.5">
                                                {dischargePdfUrl && (
                                                    <a
                                                        href={getImageUrl(dischargePdfUrl)}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#08B36A] hover:bg-[#079d5c] text-white text-xs font-bold rounded-xl transition"
                                                    >
                                                        <FaDownload /> Discharge Summary PDF
                                                    </a>
                                                )}
                                                {dietPlanPdfUrl && (
                                                    <a
                                                        href={getImageUrl(dietPlanPdfUrl)}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition border border-slate-700"
                                                    >
                                                        <FaDownload /> Diet Plan PDF
                                                    </a>
                                                )}
                                                {dischargeCardUrl && (
                                                    <a
                                                        href={getImageUrl(dischargeCardUrl)}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition border border-slate-700"
                                                    >
                                                        <FaDownload /> Prescription Card
                                                    </a>
                                                )}
                                                {reportsList.map((r, rIdx) => (
                                                    <a
                                                        key={rIdx}
                                                        href={getImageUrl(r)}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition border border-slate-700"
                                                    >
                                                        <FaDownload /> Report #{rIdx + 1}
                                                    </a>
                                                ))}
                                            </div>
                                        </div>

                                    </div>

                                    {/* Right Column: Doctor, Bed, Stay & Billing (5 cols) */}
                                    <div className="lg:col-span-5 space-y-6">
                                        
                                        {/* Assigned Doctor & Placement */}
                                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4 text-xs">
                                            <h4 className="text-sm font-black text-slate-800 flex items-center gap-2 border-b pb-2">
                                                <FaUserMd className="text-emerald-600" /> Care Allocation
                                            </h4>

                                            {doctor && (
                                                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-150 space-y-1">
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Attending Clinician</span>
                                                    <p className="text-sm font-black text-slate-900">
                                                        {doctor.name ? (doctor.name.startsWith('Dr.') ? doctor.name : `Dr. ${doctor.name}`) : "N/A"}
                                                    </p>
                                                    <p className="text-slate-600 font-semibold">{doctor.speciality} {doctor.qualification && `• ${doctor.qualification}`}</p>
                                                </div>
                                            )}

                                            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-150 space-y-1">
                                                <span className="text-[10px] text-slate-400 font-bold uppercase block">Bed & Ward Allotted</span>
                                                <p className="text-sm font-black text-slate-900">
                                                    {bed.wardName || "General Ward"} • Bed {bed.bedNumber || "N/A"}
                                                </p>
                                                <p className="text-slate-500 font-medium">Stay Duration: <strong className="text-slate-800">{selectedHistory.stayDuration || 1} Days</strong></p>
                                            </div>
                                        </div>

                                        {/* Billing & Settlement */}
                                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3 text-xs">
                                            <h4 className="text-sm font-black text-slate-800 flex items-center gap-2 border-b pb-2">
                                                <FaCoins className="text-emerald-500" /> Billing & Settlement
                                            </h4>

                                            <div className="flex justify-between items-center pt-1">
                                                <span className="text-slate-500 font-semibold">Total Amount Settled:</span>
                                                <span className="text-lg font-black text-slate-900">
                                                    ₹{Number(billing.totalAmount || selectedHistory.totalAmount || 0).toLocaleString('en-IN')}
                                                </span>
                                            </div>

                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-500 font-semibold">Payment Method:</span>
                                                <span className="font-bold text-slate-800">{billing.paymentMethod || "Online"}</span>
                                            </div>

                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-500 font-semibold">Status:</span>
                                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                    {billing.paymentStatus || "Paid"}
                                                </span>
                                            </div>
                                        </div>

                                        {/* User Account Details */}
                                        {user.name && (
                                            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-2 text-xs">
                                                <span className="text-[10px] text-slate-400 font-bold uppercase block border-b pb-1">Booking Account</span>
                                                <p className="font-extrabold text-slate-800">{user.name}</p>
                                                {user.phone && <p className="text-slate-500">Phone: {user.phone}</p>}
                                                {user.email && <p className="text-slate-500">Email: {user.email}</p>}
                                            </div>
                                        )}

                                    </div>

                                </div>

                            </div>

                            {/* Modal Footer */}
                            <div className="p-5 border-t border-gray-100 bg-white flex justify-between items-center rounded-b-[2.5rem] sticky bottom-0 z-10">
                                <button 
                                    onClick={() => setSelectedHistory(null)} 
                                    className="px-6 py-2.5 bg-gray-50 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-colors text-xs"
                                >
                                    Close
                                </button>

                                {dischargePdfUrl && (
                                    <a 
                                        href={getImageUrl(dischargePdfUrl)}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="px-6 py-2.5 bg-[#08B36A] hover:bg-[#079d5c] text-white font-bold rounded-xl shadow-md transition-colors flex items-center gap-2 text-xs"
                                    >
                                        <FaDownload /> View Discharge PDF
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* Integrated Print Preview Overlay */}
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