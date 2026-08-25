'use client';

import React from 'react';
import { 
    FaHeartbeat, FaTimes, FaSpinner, FaStethoscope, FaUser, FaBed, FaPhoneAlt, 
    FaHospital, FaUserPlus, FaFileSignature, FaDollarSign, FaCalendarAlt, 
    FaTags, FaHome, FaInfoCircle, FaClipboardList, FaClock, FaUserMd, FaPlus, FaTrash
} from 'react-icons/fa';

// Safe helper to decode token payload metadata
const getDoctorIdFromToken = () => {
    if (typeof window === 'undefined') return null;
    try {
        const token = localStorage.getItem('hospitalDoctorToken') ||
                      localStorage.getItem('doctorToken') ||
                      localStorage.getItem('token');
        if (!token) return null;
        const base64Url = token.split('.')[1];
        if (!base64Url) return null;
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const decoded = JSON.parse(jsonPayload);
        return decoded._id || decoded.id || null;
    } catch (e) {
        return null;
    }
};

export default function CaseDetailsModal({
    isOpen,
    onClose,
    caseDetails,
    onAddDoctorClick,
    onDischargeClick,
    onAcceptTransfer,
    onRejectTransfer,
    activeStatus,
    onFeedbackClick,
    onStartBedsideShift,
    onCompleteBedsideShift,
    // Attending Doctor Round Controls
    isMainDoctorRoundActive,
    onStartMainDoctorRound,
    // Stay Medications Event Handlers
    onAddStayMedicationTrigger,
    onStopActiveMedication,
    medicationActionLoading,
    collaborativeMeds = [] // Staged/Logged specialist recommendations
}) {
    if (!isOpen) return null;

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        } catch (e) {
            return dateString;
        }
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return "N/A";
        try {
            const date = new Date(dateString);
            const formattedDate = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
            const formattedTime = date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
            });
            return `${formattedDate} • ${formattedTime}`;
        } catch (e) {
            return dateString;
        }
    };

    const patientObj = caseDetails?.patients?.[0];
    const patientName = patientObj?.patientName || caseDetails?.userId?.name || "N/A";
    const patientAge = patientObj?.patientAge || caseDetails?.userId?.age || "N/A";
    const patientGender = patientObj?.gender || caseDetails?.userId?.gender || "N/A";
    const patientRelation = patientObj?.relation || "Primary User";

    const isCompleted = caseDetails?.status === 'Completed';
    const isPendingHandover = !!caseDetails?.pendingDoctorId;

    const currentDoctorId = getDoctorIdFromToken();
    const isMainDoctor = caseDetails?.doctorId?._id === currentDoctorId || caseDetails?.doctorId === currentDoctorId;

    const myBedsideRecord = caseDetails?.bedsideCareTeam?.find(team => {
        const docId = typeof team.doctorId === 'object' && team.doctorId !== null ? team.doctorId._id : team.doctorId;
        return docId === currentDoctorId;
    });

    const bedsideStatus = myBedsideRecord?.status || (caseDetails?.bedsideCareTeam?.find(t => t.status === 'In-Progress' || t.status === 'Accepted')?.status);
    const hasAcceptedShift = bedsideStatus === 'Accepted';
    const hasInProgressShift = bedsideStatus === 'In-Progress';

    const isCompletedOrDischarged = 
        activeStatus === 'Completed' || 
        activeStatus === 'Discharged' || 
        caseDetails?.status === 'Completed' || 
        caseDetails?.status === 'Discharged' || 
        caseDetails?.status === 'Discharge-Pending';

    const stayMedications = caseDetails?.activeMedications || caseDetails?.stayMedications || [];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-slate-900/40 transition-opacity">
            <div className="absolute inset-0" onClick={onClose}></div>
            <div className="relative bg-white w-full max-w-4xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 border border-slate-100">
                
                {/* Modal Header */}
                <div className="p-6 sm:p-8 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <div className="bg-red-50 p-4 rounded-2xl text-red-500">
                            <FaHeartbeat size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-extrabold text-slate-900 leading-tight">Case Documentation Portal</h2>
                            <span className="text-xs font-bold text-slate-400 block mt-1">System Allotment ID: {caseDetails?.bookingId || "Loading..."}</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-655 rounded-full transition-colors">
                        <FaTimes size={18} />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-8 overflow-y-auto bg-slate-50/50 flex-1 space-y-6">
                    {!caseDetails ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <FaSpinner className="animate-spin text-emerald-500 text-3xl" />
                            <p className="text-slate-400 text-xs mt-3 font-bold">Populating medical profile...</p>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            
                            {/* Diagnostic Triage Top Highlight */}
                            <div className="bg-gradient-to-r from-red-500/5 to-orange-500/5 border border-red-500/10 rounded-2xl p-6 flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0 text-lg">
                                    <FaStethoscope />
                                </div>
                                <div className="flex-1">
                                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Active Triage Level Status</span>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <h4 className="text-base font-bold text-red-800">{caseDetails.triageLevel || "Critical Emergency Alert"}</h4>
                                        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-black rounded uppercase tracking-wide">
                                            {caseDetails.bookingType || "Admission"}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-500 mt-1">This patient has been designated for continuous clinical ward supervision and priority management.</p>
                                </div>
                            </div>

                            {/* Grid Info Columns */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Patient Information Block */}
                                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex gap-4 hover:shadow-md transition-shadow">
                                    <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center text-2xl flex-shrink-0">
                                        <FaUser />
                                    </div>
                                    <div className="flex-1">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Patient Identity</span>
                                        <p className="font-extrabold text-slate-800 text-lg leading-snug mt-0.5">{patientName}</p>
                                        <p className="text-sm text-slate-500 font-medium mt-1">
                                            {patientAge} Years Old • {patientGender}
                                        </p>
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            <span className="inline-block px-3 py-1 bg-red-50 border border-red-100 rounded-full text-xs font-black text-red-600">
                                                Blood Group: {caseDetails.userId?.bloodGroup || "O+"}
                                            </span>
                                            <span className="inline-block px-3 py-1 bg-blue-50 border border-blue-100 rounded-full text-xs font-bold text-blue-600">
                                                Relation: {patientRelation}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Allotment Ward Info Block */}
                                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex gap-4 hover:shadow-md transition-shadow">
                                    <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center text-2xl flex-shrink-0">
                                        <FaBed />
                                    </div>
                                    <div className="flex-1">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Allotment Details</span>
                                        <p className="font-extrabold text-slate-800 text-lg leading-snug mt-0.5">
                                            Bed Number: {
                                                typeof caseDetails.bedId === 'object' && caseDetails.bedId !== null
                                                ? (caseDetails.bedId.bedNumber || "Not Allotted")
                                                : (caseDetails.bedNumber || "Not Allotted")
                                            }
                                        </p>
                                        <p className="text-sm text-slate-500 font-medium mt-1">Ward Unit: {caseDetails.wardName || "General Emergency ICU"}</p>
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            <span className="inline-block px-3 py-1 bg-purple-50 border border-purple-100 rounded-full text-xs font-black text-purple-600">
                                                Status: {caseDetails.status}
                                            </span>
                                            <span className="inline-block px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-xs font-medium text-slate-600">
                                                Type: {caseDetails.bedBookingType || "General-Bed"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Attending Doctor Round-by-Round Logs rendering */}
                            {caseDetails.clinicalLogs && caseDetails.clinicalLogs.length > 0 && (
                                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                                    <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                        <FaClipboardList className="text-[#08B36A]" /> Attending Clinical Rounds Logs ({caseDetails.clinicalLogs.length})
                                    </h4>
                                    <div className="grid grid-cols-1 gap-4">
                                        {caseDetails.clinicalLogs.map((log, idx) => (
                                            <div key={log._id || idx} className="p-4 bg-emerald-50/10 border border-emerald-100/30 rounded-xl space-y-2 animate-in fade-in duration-200">
                                                <div className="flex justify-between items-center text-[10px] text-slate-400 font-extrabold uppercase">
                                                    <span>Attending Round Logs</span>
                                                    {log.loggedAt && <span>{formatDateTime(log.loggedAt)}</span>}
                                                </div>
                                                <p className="text-xs text-slate-800 font-serif italic">"{log.observation}"</p>
                                                
                                                {/* Display rounded vitals logs */}
                                                {log.vitals && (
                                                    <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100/50 text-[10px] text-slate-500 font-semibold">
                                                        <span>BP: {log.vitals.bp || 'N/A'}</span>
                                                        <span>Pulse: {log.vitals.pulse ? `${log.vitals.pulse} bpm` : 'N/A'}</span>
                                                        <span>Temp: {log.vitals.temp ? `${log.vitals.temp} °F` : 'N/A'}</span>
                                                        <span>SpO2: {log.vitals.spo2 ? `${log.vitals.spo2} %` : 'N/A'}</span>
                                                    </div>
                                                )}

                                                <div className="flex gap-4 text-[10px] text-slate-500 font-bold border-t border-dashed border-slate-100 pt-2 mt-1">
                                                    <span>Condition: <strong className="text-slate-600">{log.patientCondition}</strong></span>
                                                    <span>Priority Rating: <strong className="text-slate-600">{log.priorityRating}</strong></span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Dynamic In-Patient Stay Medications Chart */}
                            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                        <FaHospital className="text-[#08B36A]" /> In-Patient Stay Medications Chart ({stayMedications.length})
                                    </h4>
                                    {isMainDoctor && !isCompletedOrDischarged && (
                                        <button
                                            type="button"
                                            onClick={onAddStayMedicationTrigger}
                                            className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-black rounded-lg transition-all flex items-center gap-1"
                                        >
                                            <FaPlus size={10} /> Add Stay Medication
                                        </button>
                                    )}
                                </div>

                                {/* Stay Medications List */}
                                <div className="space-y-3">
                                    {stayMedications.length === 0 ? (
                                        <p className="text-xs text-slate-400 italic font-semibold">No active stay medications configured for this admission.</p>
                                    ) : (
                                        <div className="divide-y divide-slate-100 bg-slate-50/50 p-4 border border-slate-100 rounded-xl">
                                            {stayMedications.map((med, index) => {
                                                const isActive = med.status === 'Active';
                                                return (
                                                    <div key={med._id || index} className="py-3 flex justify-between items-center text-xs animate-in fade-in duration-200">
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-extrabold text-slate-800 text-sm">{med.medicineName || med.name}</span>
                                                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                                                                    isActive 
                                                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 animate-pulse' 
                                                                    : 'bg-slate-100 text-slate-500 border border-slate-200'
                                                                }`}>
                                                                    {med.status}
                                                                </span>
                                                            </div>
                                                            <p className="text-slate-500 mt-1">Dosage: <strong className="text-slate-700">{med.dosage}</strong> • Frequency: <strong className="text-slate-700">{med.frequency}</strong></p>
                                                            {med.instructions && <p className="text-slate-400 mt-0.5">Instructions: {med.instructions}</p>}
                                                            <p className="text-[9px] text-slate-400 mt-1">
                                                                Started: {formatDateTime(med.startDate || med.createdAt)}
                                                                {med.stoppedDate && ` | Discontinued: ${formatDateTime(med.stoppedDate)}`}
                                                            </p>
                                                        </div>
                                                        {isActive && isMainDoctor && !isCompletedOrDischarged && (
                                                            <button
                                                                onClick={() => onStopActiveMedication(caseDetails._id, med._id)}
                                                                disabled={medicationActionLoading}
                                                                className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all flex items-center gap-1 text-[10px] font-bold"
                                                                title="Discontinue Medication"
                                                            >
                                                                <FaTrash /> Discontinue
                                                            </button>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Bedside Specialist Care Team rendering */}
                            {caseDetails.bedsideCareTeam && caseDetails.bedsideCareTeam.length > 0 && (
                                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                                    <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                        <FaUserMd className="text-indigo-600" /> Bedside Specialist Care Team
                                    </h4>
                                    <div className="grid grid-cols-1 gap-4">
                                        {caseDetails.bedsideCareTeam.map((team, idx) => {
                                            const doc = typeof team.doctorId === 'object' && team.doctorId !== null ? team.doctorId : { name: "Specialist ID: " + team.doctorId };
                                            const docId = typeof team.doctorId === 'object' && team.doctorId !== null ? team.doctorId._id : team.doctorId;
                                            const feedback = team.specialistFeedback;

                                            const matchingPoolDoc = collaborativeMeds?.find(item => {
                                                const recordDocId = item.doctor?.id || item.doctor?._id;
                                                return recordDocId === docId;
                                            });
                                            const activeStayMedsPool = matchingPoolDoc?.activeStayRecommendations || [];

                                            return (
                                                <div key={idx} className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3">
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-655 flex items-center justify-center font-bold text-sm">
                                                                {doc.name?.[0]?.toUpperCase() || <FaUserMd />}
                                                            </div>
                                                            <div>
                                                                <span className="font-bold text-sm text-slate-800 block">{doc.name || "Specialist"}</span>
                                                                <span className="text-xs text-slate-500">{doc.speciality || "Consultant Specialist"}</span>
                                                            </div>
                                                        </div>
                                                        <span className={`px-2.5 py-1 text-xs font-black rounded-full border ${
                                                            team.status === 'Accepted'
                                                            ? 'bg-blue-50 text-blue-700 border-blue-100'
                                                            : team.status === 'In-Progress'
                                                            ? 'bg-amber-50 text-amber-700 border-amber-100 animate-pulse'
                                                            : team.status === 'Completed'
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                            : team.status === 'Rejected'
                                                            ? 'bg-rose-50 text-rose-700 border-rose-100'
                                                            : 'bg-slate-50 text-slate-700 border-slate-100'
                                                        }`}>
                                                            {team.status}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-100 space-y-1">
                                                        <p><strong>Reason for Request:</strong> {team.requestReason || "Consultation opinion required."}</p>
                                                        {team.patientConditionAtRequest && <p><strong>Condition at Request:</strong> {team.patientConditionAtRequest}</p>}
                                                    </div>

                                                    {/* Observations rendered from dynamic arrays with logged vitals */}
                                                    {feedback && Array.isArray(feedback) && feedback.length > 0 && (
                                                        <div className="text-xs text-slate-700 border-t border-dashed border-slate-200 pt-3 space-y-3">
                                                            <span className="font-extrabold text-slate-800 block flex items-center gap-1.5">
                                                                <FaClipboardList className="text-indigo-600" /> Specialist Clinical Logs ({feedback.length} Checkups)
                                                            </span>
                                                            <div className="space-y-2">
                                                                {feedback.map((item, fIdx) => {
                                                                    // Extract vitals safely using fallback mapping matching both arrays and parents
                                                                    const checkupVitals = item.vitals || team.vitals || null;
                                                                    return (
                                                                        <div key={item._id || fIdx} className="bg-indigo-50/20 p-3 rounded-xl border border-indigo-100/50 space-y-2 animate-in fade-in duration-200">
                                                                            <p className="italic text-slate-800 font-serif font-semibold">"{item.observation}"</p>
                                                                            
                                                                            {checkupVitals && (
                                                                                <div className="grid grid-cols-4 gap-2 pt-1 border-t border-indigo-100/30 text-[9px] text-slate-500 font-bold uppercase tracking-wide">
                                                                                    <span>BP: {checkupVitals.bp || 'N/A'}</span>
                                                                                    <span>Pulse: {checkupVitals.pulse ? `${checkupVitals.pulse} bpm` : 'N/A'}</span>
                                                                                    <span>Temp: {checkupVitals.temp ? `${checkupVitals.temp} °F` : 'N/A'}</span>
                                                                                    <span>SpO2: {checkupVitals.spo2 ? `${checkupVitals.spo2} %` : 'N/A'}</span>
                                                                                </div>
                                                                            )}

                                                                            <div className="flex flex-wrap justify-between items-center text-[10px] text-slate-400 border-t border-indigo-50/50 pt-1.5 mt-1 font-sans">
                                                                                <span>Condition: <strong className="text-slate-655">{item.patientCondition}</strong></span>
                                                                                <span>Priority: <strong className="text-slate-655">{item.priorityRating}</strong></span>
                                                                                {item.submittedAt && (
                                                                                    <span>Checked: <strong className="text-slate-655">{formatDateTime(item.submittedAt)}</strong></span>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Recommended Active Stay medications */}
                                                    {activeStayMedsPool.length > 0 && (
                                                        <div className="mt-2 p-2.5 bg-white rounded-xl border border-slate-150 space-y-1">
                                                            <span className="text-[9px] font-black text-indigo-700 uppercase tracking-wider block">Recommended Stay Medications</span>
                                                            <div className="divide-y divide-slate-100">
                                                                {activeStayMedsPool.map((med, mIdx) => {
                                                                    const dateToFormat = med.addedAt || med.createdAt;
                                                                    return (
                                                                        <div key={mIdx} className="py-2 flex justify-between items-center text-[10px] text-slate-700 font-sans">
                                                                            <div>
                                                                                <span className="font-extrabold text-slate-850 block">{med.name}</span>
                                                                                {dateToFormat && (
                                                                                    <span className="text-[8px] text-slate-400 block font-medium mt-0.5">
                                                                                        Logged: {formatDateTime(dateToFormat)}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                            <span className="text-slate-500 font-medium whitespace-nowrap ml-2">{med.dosage} • {med.frequency} ({med.duration})</span>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Legacy fallback single object (Vitals support added) */}
                                                    {feedback && !Array.isArray(feedback) && feedback.observation && (
                                                        <div className="text-xs text-slate-700 border-t border-dashed border-slate-200 pt-3 space-y-2">
                                                            <span className="font-extrabold text-slate-850 block">Specialist Clinical Feedback:</span>
                                                            <p className="italic bg-indigo-50/30 p-3 rounded-lg border border-indigo-100 font-serif font-semibold">"{feedback.observation}"</p>
                                                            
                                                            {(feedback.vitals || team.vitals) && (
                                                                <div className="grid grid-cols-4 gap-2 py-1.5 border-t border-b border-indigo-100/30 text-[9px] text-slate-500 font-bold uppercase tracking-wide">
                                                                    <span>BP: {(feedback.vitals || team.vitals).bp || 'N/A'}</span>
                                                                    <span>Pulse: {(feedback.vitals || team.vitals).pulse ? `${(feedback.vitals || team.vitals).pulse} bpm` : 'N/A'}</span>
                                                                    <span>Temp: {(feedback.vitals || team.vitals).temp ? `${(feedback.vitals || team.vitals).temp} °F` : 'N/A'}</span>
                                                                    <span>SpO2: {(feedback.vitals || team.vitals).spo2 ? `${(feedback.vitals || team.vitals).spo2} %` : 'N/A'}</span>
                                                                </div>
                                                            )}
                                                            
                                                            <div className="flex justify-between text-[10px] text-slate-400 font-sans">
                                                                <span>Condition: <strong className="text-slate-600">{feedback.patientCondition}</strong></span>
                                                                <span>Priority Rating: <strong className="text-slate-600">{feedback.priorityRating}</strong></span>
                                                                {feedback.submittedAt && (
                                                                    <span>Checked: <strong className="text-slate-600">{formatDateTime(feedback.submittedAt)}</strong></span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Medications Ledger */}
                            {((caseDetails.prescriptions && caseDetails.prescriptions.length > 0) || (caseDetails.prescriptionDetails?.medicines && caseDetails.prescriptionDetails.medicines.length > 0)) && (
                                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                                    <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                        <FaClipboardList className="text-orange-500" /> Prescribed Medications Ledger
                                    </h4>
                                    <div className="space-y-3">
                                        {caseDetails.prescriptions && caseDetails.prescriptions.map((pres, idx) => (
                                            <div key={idx} className="p-4 bg-orange-50/10 border border-orange-100/50 rounded-2xl space-y-2">
                                                <div className="flex justify-between text-[10px] text-slate-400 font-extrabold uppercase">
                                                    <span>Consultant: {pres.doctorId?.name || "Attending Specialist"}</span>
                                                    <span>Logged: {formatDateTime(pres.createdAt || pres.date)}</span>
                                                </div>
                                                <div className="divide-y divide-slate-100">
                                                    {pres.medicines?.map((med, medIdx) => (
                                                        <div key={medIdx} className="py-2 flex justify-between items-center text-sm">
                                                            <div>
                                                                <span className="font-extrabold text-slate-800 block">{med.name}</span>
                                                                <span className="text-xs text-slate-500 block mt-0.5">Instructions: {med.instructions || "Standard directive"}</span>
                                                            </div>
                                                            <div className="text-right text-xs">
                                                                <span className="inline-block px-2.5 py-0.5 bg-orange-50 text-orange-700 border border-orange-100 font-black rounded-full mr-2">
                                                                    {med.frequency}
                                                                </span>
                                                                <span className="text-slate-500 font-bold">{med.duration}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}

                                        {caseDetails.prescriptionDetails?.medicines && (
                                            <div className="p-4 bg-orange-50/10 border border-orange-100/50 rounded-2xl space-y-2">
                                                <div className="flex justify-between text-[10px] text-slate-400 font-extrabold uppercase">
                                                    <span>Prescription Record</span>
                                                </div>
                                                <div className="divide-y divide-slate-100">
                                                    {caseDetails.prescriptionDetails.medicines.map((med, medIdx) => (
                                                        <div key={medIdx} className="py-2 flex justify-between items-center text-sm">
                                                            <div>
                                                                <span className="font-extrabold text-slate-800 block">{med.name}</span>
                                                                <span className="text-xs text-slate-500 block mt-0.5">Instructions: {med.instructions || "Standard directive"}</span>
                                                            </div>
                                                            <div className="text-right text-xs">
                                                                <span className="inline-block px-2.5 py-0.5 bg-orange-50 text-orange-700 border border-orange-100 font-black rounded-full mr-2">
                                                                    {med.frequency}
                                                                </span>
                                                                <span className="text-slate-500 font-bold">{med.duration}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Stay Duration Details */}
                            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
                                        <FaCalendarAlt size={16} />
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Stay Starts</span>
                                        <span className="text-sm font-bold text-slate-800">{formatDate(caseDetails.startDate)}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
                                        <FaCalendarAlt size={16} />
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Stay Ends</span>
                                        <span className="text-sm font-bold text-slate-800">{formatDate(caseDetails.endDate)}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                                        <FaClock size={16} />
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Reschedules</span>
                                        <span className="text-sm font-bold text-slate-800">{caseDetails.rescheduleCount ?? 0} Times</span>
                                    </div>
                                </div>
                            </div>

                            {/* Clinical History Timeline */}
                            {caseDetails.treatmentHistory && caseDetails.treatmentHistory.length > 0 && (
                                <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6">
                                    <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <FaClock className="text-blue-500" /> Clinical Audit Trail & Handover Timeline
                                    </h4>
                                    <div className="space-y-6 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                                        {caseDetails.treatmentHistory.map((history, idx) => {
                                            const fromDoc = history.fromDoctorId?.name || history.fromDoctorId || "N/A";
                                            const toDoc = history.toDoctorId?.name || history.toDoctorId || "N/A";
                                            return (
                                                <div key={idx} className="relative pl-10 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                                                    <div className="absolute left-2.5 top-1.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-4 border-white ring-1 ring-emerald-500"></div>
                                                    <div>
                                                        <span className="text-xs font-extrabold text-slate-800 block">
                                                            {history.action || "Transfer Step"}
                                                        </span>
                                                        <span className="text-xs text-slate-500 mt-1 block">
                                                            <strong>From:</strong> {fromDoc} &rarr; <strong>To:</strong> {toDoc}
                                                        </span>
                                                        {history.notes && (
                                                            <p className="text-xs text-slate-400 italic mt-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                                                "{history.notes}"
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col items-start sm:items-end text-left sm:text-right">
                                                        <span className="text-[10px] text-slate-400 font-bold uppercase block">
                                                            {formatDateTime(history.timestamp || history.startTime)}
                                                        </span>
                                                        {history.durationDisplay && (
                                                            <span className="inline-block mt-1 px-2.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-black rounded-full border border-blue-100">
                                                                {history.durationDisplay}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                        </div>
                    )}
                </div>

                {/* Footer Actions Panel */}
                {!isCompleted && (
                    <div className="p-6 sm:px-8 border-t border-slate-100 bg-white flex flex-col sm:flex-row justify-end gap-3 sticky bottom-0 z-10 font-sans">
                        {isCompletedOrDischarged ? (
                            <div className="flex justify-end w-full">
                                <button 
                                    onClick={onClose}
                                    className="px-8 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-colors text-sm"
                                >
                                    Close View
                                </button>
                            </div>
                        ) : isPendingHandover ? (
                            <>
                                <button 
                                    onClick={() => {
                                        if (onRejectTransfer) onRejectTransfer(caseDetails._id);
                                        onClose();
                                    }}
                                    className="px-8 py-3.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-2xl transition-colors text-sm flex items-center justify-center gap-2"
                                >
                                    Reject Handover
                                </button>
                                <button 
                                    onClick={() => {
                                        if (onAcceptTransfer) onAcceptTransfer(caseDetails._id);
                                        onClose();
                                    }}
                                    className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-md transition-colors text-sm flex items-center justify-center gap-2"
                                >
                                    Accept Handover
                                </button>
                            </>
                        ) : isMainDoctor ? (
                            /* Primary Attending Attestation Controls */
                            <div className="flex flex-wrap gap-3 w-full sm:w-auto justify-end">
                                {!isMainDoctorRoundActive ? (
                                    <button 
                                        onClick={() => {
                                            if (onStartMainDoctorRound) onStartMainDoctorRound(caseDetails._id);
                                        }}
                                        className="px-6 py-3.5 bg-[#08B36A] hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-md transition-colors text-sm flex items-center justify-center gap-2"
                                    >
                                        <FaClock /> Start Round Shift
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => {
                                            if (onFeedbackClick) onFeedbackClick();
                                        }}
                                        className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-md transition-colors text-sm flex items-center justify-center gap-2"
                                    >
                                        <FaClipboardList /> Submit Observation
                                    </button>
                                )}
                                <button 
                                    onClick={onAddDoctorClick} 
                                    className="px-6 py-3.5 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold rounded-2xl transition-colors text-sm flex items-center justify-center gap-2"
                                >
                                    <FaUserPlus /> Initiate Handover
                                </button>
                                <button 
                                    onClick={onDischargeClick}
                                    className="px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl shadow-md transition-colors text-sm flex items-center justify-center gap-2"
                                >
                                    <FaFileSignature /> Discharge Patient
                                </button>
                            </div>
                        ) : activeStatus === 'Pending Bedside' ? (
                            <div className="flex gap-3 w-full sm:w-auto">
                                <button 
                                    onClick={() => {
                                        const reason = prompt("Enter Decline Reason:") || "Engaged in another clinical schedule.";
                                        if (onRejectTransfer) onRejectTransfer(caseDetails._id, reason);
                                        onClose();
                                    }}
                                    className="w-full sm:w-auto px-8 py-3.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-2xl transition-colors text-sm flex items-center justify-center gap-2"
                                >
                                    Decline Request
                                </button>
                                <button 
                                    onClick={() => {
                                        if (onAcceptTransfer) onAcceptTransfer(caseDetails._id);
                                        onClose();
                                    }}
                                    className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-md transition-colors text-sm flex items-center justify-center gap-2"
                                >
                                    Accept Request
                                </button>
                            </div>
                        ) : activeStatus === 'Active Bedside' ? (
                            /* Bedside Specialist Action Footers */
                            <div className="flex gap-3 w-full sm:w-auto">
                                {hasAcceptedShift ? (
                                    <button 
                                        onClick={() => {
                                            if (onStartBedsideShift) onStartBedsideShift(caseDetails._id);
                                        }}
                                        className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-md transition-all text-sm flex items-center justify-center gap-2"
                                    >
                                        Start Bedside Shift
                                    </button>
                                ) : hasInProgressShift ? (
                                    <>
                                        <button 
                                            onClick={() => {
                                                if (onFeedbackClick) onFeedbackClick();
                                            }}
                                            className="w-full sm:w-auto px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm flex items-center justify-center gap-2"
                                        >
                                            <FaClipboardList /> Submit Observation
                                        </button>
                                        {/* Wires 'Complete Shift' to request opening PrescriptionModal to write checkout meds */}
                                        <button 
                                            onClick={() => {
                                                if (onCompleteBedsideShift) onCompleteBedsideShift(caseDetails._id);
                                            }}
                                            className="w-full sm:w-auto px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl shadow-md transition-all text-sm flex items-center justify-center gap-2"
                                        >
                                            Complete Shift
                                        </button>
                                    </>
                                ) : (
                                    <div className="text-slate-400 font-semibold text-xs italic">
                                        Shift completed or waiting for assignment updates.
                                    </div>
                                )}
                            </div>
                        ) : (
                            <button 
                                onClick={onClose}
                                className="px-8 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-colors text-sm"
                            >
                                Close
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}