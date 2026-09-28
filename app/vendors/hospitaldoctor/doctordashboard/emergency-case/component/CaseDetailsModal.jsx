'use client';

import React from 'react';
import { 
    FaHeartbeat, FaTimes, FaSpinner, FaStethoscope, FaUser, FaBed, FaPhoneAlt, 
    FaHospital, FaUserPlus, FaFileSignature, FaDollarSign, FaCalendarAlt, 
    FaTags, FaHome, FaInfoCircle, FaClipboardList, FaClock, FaUserMd, FaPlus, FaTrash,
    FaShieldAlt, FaFilePdf, FaDownload, FaPills, FaHandHoldingHeart, FaCheck, FaThermometerHalf, FaTint
} from 'react-icons/fa';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://192.168.1.7:5002';

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
        return decoded._id || decoded.id || decoded.doctorId || decoded.userId || null;
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
    onAddBedsideMedicineTrigger,
    isMainDoctorRoundActive,
    onStartMainDoctorRound,
    onAddStayMedicationTrigger,
    onStopActiveMedication,
    medicationActionLoading,
    collaborativeMeds = [] // Populated collaborative specialist medications pool
}) {
    if (!isOpen) return null;

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http://') || path.startsWith('https://')) return path;
        return `${API_BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
    };

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

    const patientObj = caseDetails?.patientDetails || caseDetails?.patients?.[0] || {};
    const patientName = patientObj?.patientName || patientObj?.name || caseDetails?.bookedBy?.name || caseDetails?.userId?.name || "N/A";
    const patientAge = patientObj?.age !== undefined ? patientObj?.age : (patientObj?.patientAge !== undefined ? patientObj?.patientAge : caseDetails?.userId?.age || "N/A");
    const patientGender = patientObj?.gender || caseDetails?.userId?.gender || "N/A";
    const patientRelation = patientObj?.relation || "Self";
    const bloodGroup = patientObj?.bloodGroup || caseDetails?.bloodGroup || caseDetails?.clinicalSummary?.bloodGroup || "O+";
    const profilePic = patientObj?.profilePic || caseDetails?.userId?.profilePic;

    const hospital = caseDetails?.hospitalDetails || caseDetails?.hospitalId || {};
    const bed = caseDetails?.bedDetails || (typeof caseDetails?.bedId === 'object' ? caseDetails.bedId : {}) || {};
    const wardName = bed?.ward?.name || bed?.wardName || caseDetails?.wardName || "General Emergency Ward";
    const wardType = bed?.ward?.type || bed?.wardType || caseDetails?.bedBookingType || "ICU";
    const bedNumber = bed?.bedNumber || caseDetails?.bedNumber || "Not Allotted";
    const bedPrice = bed?.pricePerDay || 0;

    const doctorObj = caseDetails?.primaryDoctor || caseDetails?.assignedDoctor || (typeof caseDetails?.doctorId === 'object' ? caseDetails.doctorId : null);
    const doctorName = doctorObj?.name ? (doctorObj.name.startsWith('Dr.') ? doctorObj.name : `Dr. ${doctorObj.name}`) : "Attending Specialist";
    const doctorSpec = doctorObj?.speciality || "General Medicine";
    const doctorQual = doctorObj?.qualification || "";
    const doctorAvatar = doctorObj?.profileImage ? getImageUrl(doctorObj.profileImage) : null;

    const clinical = caseDetails?.clinicalSummary || {};
    const billing = caseDetails?.billing || caseDetails?.pricingBreakdown || {};
    const insurance = caseDetails?.insurance || caseDetails?.insuranceDetails || {};

    const isCompleted = caseDetails?.status === 'Completed';
    const isPendingHandover = !!caseDetails?.pendingDoctorId;

    const currentDoctorId = getDoctorIdFromToken();
    const docRawId = doctorObj?._id || doctorObj?.id || caseDetails?.doctorId || caseDetails?.assignedDoctor?._id || caseDetails?.assignedDoctor;

    // Attending Main Doctor identification
    const isMainDoctor = (currentDoctorId && docRawId && String(docRawId) === String(currentDoctorId)) || 
                         (!caseDetails?.bedsideCareTeam?.some(t => {
                             const teamDocId = typeof t.doctorId === 'object' && t.doctorId !== null ? t.doctorId._id : t.doctorId;
                             return currentDoctorId && String(teamDocId) === String(currentDoctorId);
                         }) && (activeStatus === 'In-Progress' || activeStatus === 'active'));

    // Bedside team record matching
    const myBedsideRecord = caseDetails?.bedsideCareTeam?.find(team => {
        const docId = typeof team.doctorId === 'object' && team.doctorId !== null 
            ? (team.doctorId._id || team.doctorId.id) 
            : team.doctorId;
        if (!currentDoctorId || !docId) return false;
        return String(docId) === String(currentDoctorId);
    });

    const isBedsideMode = activeStatus === 'Pending Bedside' || activeStatus === 'Active Bedside' || !!myBedsideRecord;

    const bedsideStatus = myBedsideRecord?.status || (activeStatus === 'Pending Bedside' ? 'Pending' : (activeStatus === 'Active Bedside' ? 'Accepted' : ''));
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 backdrop-blur-md bg-slate-900/50 transition-opacity font-sans">
            <div className="absolute inset-0" onClick={onClose}></div>
            <div className="relative bg-white w-full max-w-5xl rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200 border border-slate-100">
                
                {/* Modal Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <div className="bg-red-50 p-3.5 rounded-2xl text-red-500">
                            <FaHeartbeat size={22} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-black text-slate-900 leading-tight">Case Dossier #{caseDetails?.bookingId || "N/A"}</h2>
                                <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-full uppercase tracking-wider border border-emerald-200">
                                    {caseDetails?.status || "Active"}
                                </span>
                            </div>
                            <span className="text-xs font-bold text-slate-400 block mt-0.5">
                                Type: {caseDetails?.bookingType || caseDetails?.caseCategory || "Admission"} • Triage: {caseDetails?.triageLevel || "Routine"}
                            </span>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-full transition-colors cursor-pointer">
                        <FaTimes size={16} />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 md:p-8 overflow-y-auto bg-slate-50/50 flex-1 space-y-6">
                    {!caseDetails ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <FaSpinner className="animate-spin text-emerald-500 text-3xl" />
                            <p className="text-slate-400 text-xs mt-3 font-bold">Populating medical profile...</p>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            
                            {/* Hospital Information Badge */}
                            {hospital.name && (
                                <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                                    <div className="flex items-center gap-3">
                                        {hospital.logo ? (
                                            <img src={getImageUrl(hospital.logo)} alt="Hospital Logo" className="w-10 h-10 rounded-xl object-contain border" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg">
                                                <FaHospital />
                                            </div>
                                        )}
                                        <div>
                                            <h4 className="font-extrabold text-sm text-slate-800">{hospital.name}</h4>
                                            <p className="text-[11px] text-slate-400 font-medium">{hospital.fullAddress || hospital.address || hospital.city}</p>
                                        </div>
                                    </div>
                                    {hospital.phone && (
                                        <div className="text-right text-xs text-slate-500 hidden sm:block">
                                            <p className="font-bold text-slate-700">Phone: {hospital.phone}</p>
                                            <p className="text-[10px] text-slate-400">{hospital.email}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Patient & Ward Info Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                
                                {/* Patient Identity */}
                                <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-sm flex gap-4">
                                    {profilePic ? (
                                        <img src={getImageUrl(profilePic)} alt="Patient" className="w-16 h-16 rounded-2xl object-cover border shrink-0" />
                                    ) : (
                                        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center text-2xl shrink-0">
                                            <FaUser />
                                        </div>
                                    )}
                                    <div className="flex-1 space-y-1">
                                        <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Patient Identity</span>
                                        <p className="font-black text-slate-900 text-lg leading-snug">{patientName}</p>
                                        <p className="text-xs text-slate-500 font-bold">
                                            {patientAge} Yrs • {patientGender} ({patientRelation})
                                        </p>
                                        <div className="flex flex-wrap gap-2 pt-1">
                                            <span className="inline-block px-2.5 py-0.5 bg-rose-50 border border-rose-100 rounded-full text-[10px] font-black text-rose-600">
                                                Blood: {bloodGroup}
                                            </span>
                                            {patientObj?.reasonForVisit && (
                                                <span className="inline-block px-2.5 py-0.5 bg-amber-50 border border-amber-100 rounded-full text-[10px] font-bold text-amber-700 truncate max-w-[200px]" title={patientObj.reasonForVisit}>
                                                    Reason: {patientObj.reasonForVisit}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Ward & Bed Placement */}
                                <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-sm flex gap-4">
                                    <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-2xl shrink-0">
                                        <FaBed />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Ward & Bed Placement</span>
                                        <p className="font-black text-slate-900 text-lg leading-snug">
                                            Bed: {bedNumber}
                                        </p>
                                        <p className="text-xs text-slate-500 font-bold">
                                            Ward: {wardName} ({wardType})
                                        </p>
                                        <div className="flex flex-wrap gap-2 pt-1">
                                            <span className="inline-block px-2.5 py-0.5 bg-emerald-50 border border-emerald-100 rounded-full text-[10px] font-black text-emerald-700">
                                                Rate: ₹{bedPrice}/Day
                                            </span>
                                            {bed?.isVentilatorAvailable && (
                                                <span className="inline-block px-2.5 py-0.5 bg-indigo-50 border border-indigo-100 rounded-full text-[10px] font-black text-indigo-700">
                                                    Ventilator Active
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                            </div>

                            {/* Attending Primary Clinician Card */}
                            {doctorObj && (
                                <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm flex items-center gap-4">
                                    {doctorAvatar ? (
                                        <img src={doctorAvatar} alt={doctorName} className="w-14 h-14 rounded-2xl object-cover border shrink-0" />
                                    ) : (
                                        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl shrink-0">
                                            <FaUserMd />
                                        </div>
                                    )}
                                    <div className="space-y-0.5">
                                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600">Lead Attending Physician</span>
                                        <h4 className="font-black text-slate-900 text-base">{doctorName}</h4>
                                        <p className="text-xs text-slate-600 font-bold">{doctorSpec} {doctorQual && `• ${doctorQual}`}</p>
                                    </div>
                                </div>
                            )}

                            {/* 🌟 BEDSIDE SPECIALIST CARE TEAM WITH PROMINENT LOGGED VITALS 🌟 */}
                            {caseDetails.bedsideCareTeam && caseDetails.bedsideCareTeam.length > 0 && (
                                <div className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-sm space-y-4">
                                    <div className="flex items-center justify-between border-b border-indigo-50 pb-3">
                                        <h4 className="text-xs font-black text-indigo-900 uppercase tracking-wider flex items-center gap-2">
                                            <FaUserMd className="text-indigo-600" /> Bedside Specialist Care Team & Clinical Observations ({caseDetails.bedsideCareTeam.length})
                                        </h4>
                                        <span className="text-[9px] font-black uppercase px-2.5 py-1 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                                            Specialist Feedback & Vitals
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4">
                                        {caseDetails.bedsideCareTeam.map((team, idx) => {
                                            const doc = typeof team.doctorId === 'object' && team.doctorId !== null ? team.doctorId : { name: "Specialist ID: " + team.doctorId };
                                            const feedback = team.specialistFeedback;
                                            const feedbackList = Array.isArray(feedback) ? feedback : (feedback ? [feedback] : []);

                                            return (
                                                <div key={idx} className="p-5 bg-slate-50/80 border border-slate-200/70 rounded-2xl space-y-3">
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0">
                                                                👨‍⚕️
                                                            </div>
                                                            <div>
                                                                <span className="font-bold text-sm text-slate-900 block">{doc.name || "Specialist"}</span>
                                                                <span className="text-xs text-indigo-600 font-bold">{doc.speciality || "Consultant Specialist"}</span>
                                                            </div>
                                                        </div>
                                                        <span className={`px-2.5 py-1 text-xs font-black rounded-full border ${
                                                            team.status === 'Accepted'
                                                            ? 'bg-blue-50 text-blue-700 border-blue-100'
                                                            : team.status === 'In-Progress'
                                                            ? 'bg-amber-50 text-amber-700 border-amber-100 animate-pulse'
                                                            : team.status === 'Completed'
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                            : 'bg-slate-100 text-slate-700 border-slate-200'
                                                        }`}>
                                                            {team.status}
                                                        </span>
                                                    </div>

                                                    <div className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-100">
                                                        <p><strong>Consultation Reason:</strong> {team.requestReason || "Specialist clinical opinion requested."}</p>
                                                        {team.patientConditionAtRequest && <p className="mt-0.5 text-slate-500"><strong>Patient Condition:</strong> {team.patientConditionAtRequest}</p>}
                                                    </div>

                                                    {/* Render Observations & Vitals logged by this Bedside Doctor */}
                                                    {feedbackList.length > 0 ? (
                                                        <div className="space-y-3 pt-2">
                                                            {feedbackList.map((fb, fbIdx) => {
                                                                const bpVal = fb.vitals?.bp || fb.bp || team.vitals?.bp || team.bp;
                                                                const pulseVal = fb.vitals?.pulse || fb.pulse || team.vitals?.pulse || team.pulse;
                                                                const tempVal = fb.vitals?.temp || fb.temp || team.vitals?.temp || team.temp;
                                                                const spo2Val = fb.vitals?.spo2 || fb.spo2 || team.vitals?.spo2 || team.spo2;
                                                                const hasVitals = bpVal || pulseVal || tempVal || spo2Val;

                                                                return (
                                                                    <div key={fb._id || fbIdx} className="bg-white p-4 rounded-xl border border-indigo-100/60 shadow-sm space-y-2">
                                                                        <div className="flex justify-between items-center text-[10px] text-slate-400 font-extrabold uppercase">
                                                                            <span>Bedside Observation Entry #{fbIdx + 1}</span>
                                                                            {fb.submittedAt && <span>{formatDateTime(fb.submittedAt)}</span>}
                                                                        </div>
                                                                        <p className="italic text-slate-800 font-serif font-semibold text-xs leading-relaxed">
                                                                            "{fb.observation}"
                                                                        </p>

                                                                        {/* 🌟 PROMINENT BEDSIDE RECORDED VITALS CARD 🌟 */}
                                                                        {hasVitals && (
                                                                            <div className="pt-2 border-t border-slate-100">
                                                                                <span className="text-[9px] font-black uppercase text-indigo-600 block mb-1.5 flex items-center gap-1">
                                                                                    <FaHeartbeat /> Vitals Recorded by Bedside Specialist
                                                                                </span>
                                                                                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                                                                                    <div className="bg-rose-50/70 border border-rose-100 p-2 rounded-lg">
                                                                                        <span className="text-[8px] font-bold text-rose-500 uppercase block">BP</span>
                                                                                        <strong className="text-rose-900 text-xs font-black">{bpVal || "—"}</strong>
                                                                                    </div>
                                                                                    <div className="bg-amber-50/70 border border-amber-100 p-2 rounded-lg">
                                                                                        <span className="text-[8px] font-bold text-amber-600 uppercase block">Pulse</span>
                                                                                        <strong className="text-amber-900 text-xs font-black">{pulseVal ? `${pulseVal} bpm` : "—"}</strong>
                                                                                    </div>
                                                                                    <div className="bg-sky-50/70 border border-sky-100 p-2 rounded-lg">
                                                                                        <span className="text-[8px] font-bold text-sky-600 uppercase block">Temp</span>
                                                                                        <strong className="text-sky-900 text-xs font-black">{tempVal ? `${tempVal} °F` : "—"}</strong>
                                                                                    </div>
                                                                                    <div className="bg-emerald-50/70 border border-emerald-100 p-2 rounded-lg">
                                                                                        <span className="text-[8px] font-bold text-emerald-600 uppercase block">SpO2</span>
                                                                                        <strong className="text-emerald-900 text-xs font-black">{spo2Val ? `${spo2Val} %` : "—"}</strong>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        )}

                                                                        <div className="flex justify-between items-center text-[10px] text-slate-500 border-t border-slate-100 pt-2 font-bold">
                                                                            <span>Condition: <strong className="text-slate-700">{fb.patientCondition || "Stable"}</strong></span>
                                                                            <span>Priority: <strong className="text-slate-700">{fb.priorityRating || "Routine"}</strong></span>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    ) : (
                                                        <p className="text-xs text-slate-400 italic">No observation logs submitted yet by this specialist.</p>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* 🌟 COLLABORATIVE SPECIALIST STAY MEDICATIONS POOL 🌟 */}
                            {collaborativeMeds && collaborativeMeds.length > 0 && (
                                <div className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-sm space-y-4">
                                    <div className="flex items-center justify-between border-b border-indigo-50 pb-3">
                                        <h4 className="text-xs font-black text-indigo-900 uppercase tracking-wider flex items-center gap-2">
                                            <FaHandHoldingHeart className="text-indigo-600" /> Specialist Stay Medication Recommendations ({collaborativeMeds.length})
                                        </h4>
                                        <span className="text-[9px] font-black uppercase px-2.5 py-1 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                                            Peer Consultation Review
                                        </span>
                                    </div>

                                    <div className="space-y-4">
                                        {collaborativeMeds.map((collab, cIdx) => {
                                            const doc = collab.doctor || {};
                                            const stayMeds = collab.activeStayRecommendations || [];

                                            return (
                                                <div key={cIdx} className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 space-y-3">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                                                            👨‍⚕️
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-black text-slate-900">{doc.name ? (doc.name.startsWith('Dr.') ? doc.name : `Dr. ${doc.name}`) : "Specialist Consultant"}</p>
                                                            <p className="text-[10px] font-bold text-indigo-600 uppercase">{doc.speciality || "Consultant"}</p>
                                                        </div>
                                                    </div>

                                                    {stayMeds.length > 0 ? (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                                                            {stayMeds.map((med, mIdx) => (
                                                                <div key={mIdx} className="p-3 bg-white rounded-xl border border-emerald-100 shadow-sm space-y-1">
                                                                    <div className="flex justify-between items-start">
                                                                        <span className="font-extrabold text-xs text-slate-850">{med.name}</span>
                                                                        <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                                            Stay
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-[11px] text-slate-600 font-medium">
                                                                        {med.dosage} • {med.frequency} {med.duration && `(${med.duration})`}
                                                                    </p>
                                                                    {med.instructions && (
                                                                        <p className="text-[10px] text-slate-400 italic">Directive: "{med.instructions}"</p>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-xs text-slate-400 italic">No stay medications currently recommended by this specialist.</p>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Clinical Summary Section */}
                            {(clinical.chiefComplaint || clinical.diagnosis || clinical.admissionNote || clinical.investigation) && (
                                <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-sm space-y-4">
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-2 border-b pb-2">
                                        <FaStethoscope className="text-emerald-600" /> Primary Clinical Diagnostic File
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-150">
                                            <span className="text-[10px] font-black uppercase text-slate-400 block">Chief Complaint</span>
                                            <p className="font-bold text-slate-800 mt-0.5">{clinical.chiefComplaint || "N/A"}</p>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-150">
                                            <span className="text-[10px] font-black uppercase text-slate-400 block">Clinical Diagnosis</span>
                                            <p className="font-bold text-emerald-700 mt-0.5">{clinical.diagnosis || "Under Evaluation"}</p>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-150">
                                            <span className="text-[10px] font-black uppercase text-slate-400 block">Investigations</span>
                                            <p className="font-bold text-slate-800 mt-0.5">{clinical.investigation || "Pending"}</p>
                                        </div>
                                    </div>

                                    {/* Uploaded Diagnostic Reports */}
                                    {clinical.uploadedReports && clinical.uploadedReports.length > 0 && (
                                        <div className="pt-2 border-t border-slate-100">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-2">Uploaded Diagnostic Reports</span>
                                            <div className="flex flex-wrap gap-2">
                                                {clinical.uploadedReports.map((report, rIdx) => (
                                                    <a
                                                        key={rIdx}
                                                        href={getImageUrl(report)}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-lg border border-emerald-200 flex items-center gap-1.5 transition"
                                                    >
                                                        <FaFilePdf /> Report File #{rIdx + 1}
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Attending Doctor Clinical Logs */}
                            {caseDetails.clinicalLogs && caseDetails.clinicalLogs.length > 0 && (
                                <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-sm space-y-4">
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-2 border-b pb-2">
                                        <FaClipboardList className="text-[#08B36A]" /> Attending Clinical Round Logs ({caseDetails.clinicalLogs.length})
                                    </h4>
                                    <div className="grid grid-cols-1 gap-3">
                                        {caseDetails.clinicalLogs.map((log, idx) => (
                                            <div key={log._id || idx} className="p-4 bg-slate-50/70 border border-slate-200/60 rounded-xl space-y-2">
                                                <div className="flex justify-between items-center text-[10px] text-slate-400 font-extrabold uppercase">
                                                    <span>Round Logged by {log.doctorId?.name || "Attending Doctor"}</span>
                                                    {log.loggedAt && <span>{formatDateTime(log.loggedAt)}</span>}
                                                </div>
                                                <p className="text-xs text-slate-800 font-semibold italic">"{log.observation}"</p>
                                                
                                                {log.vitals && (
                                                    <div className="grid grid-cols-4 gap-2 pt-1 border-t border-slate-200/40 text-[10px] text-slate-500 font-bold uppercase">
                                                        <span>BP: {log.vitals.bp || 'N/A'}</span>
                                                        <span>Pulse: {log.vitals.pulse ? `${log.vitals.pulse} bpm` : 'N/A'}</span>
                                                        <span>Temp: {log.vitals.temp ? `${log.vitals.temp} °F` : 'N/A'}</span>
                                                        <span>SpO2: {log.vitals.spo2 ? `${log.vitals.spo2} %` : 'N/A'}</span>
                                                    </div>
                                                )}
                                                <div className="flex gap-3 text-[10px] text-slate-500 font-bold border-t border-slate-100 pt-1 mt-1">
                                                    <span>Condition: <strong className="text-slate-700">{log.patientCondition}</strong></span>
                                                    <span>Priority: <strong className="text-slate-700">{log.priorityRating}</strong></span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* In-Patient Stay Medications Chart */}
                            <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-sm space-y-4">
                                <div className="flex justify-between items-center border-b pb-2">
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                        <FaHospital className="text-[#08B36A]" /> In-Patient Stay Medications Chart ({stayMedications.length})
                                    </h4>
                                    {!isCompletedOrDischarged && (
                                        <button
                                            type="button"
                                            onClick={isMainDoctor ? onAddStayMedicationTrigger : onAddBedsideMedicineTrigger}
                                            className="px-3.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-black rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                                        >
                                            <FaPlus size={10} /> Add Stay Medication
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    {stayMedications.length === 0 ? (
                                        <p className="text-xs text-slate-400 italic font-semibold">No active stay medications configured for this admission.</p>
                                    ) : (
                                        <div className="divide-y divide-slate-100 bg-slate-50/50 p-4 border border-slate-150 rounded-xl">
                                            {stayMedications.map((med, index) => {
                                                const isActive = med.status === 'Active';
                                                return (
                                                    <div key={med._id || index} className="py-2.5 flex justify-between items-center text-xs">
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-extrabold text-slate-800 text-sm">{med.medicineName || med.name}</span>
                                                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                                                                    isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                                                                }`}>
                                                                    {med.status || "Active"}
                                                                </span>
                                                            </div>
                                                            <p className="text-slate-500 mt-0.5">Dosage: <strong className="text-slate-700">{med.dosage}</strong> • Frequency: <strong className="text-slate-700">{med.frequency}</strong></p>
                                                            {med.instructions && <p className="text-[10px] text-slate-400 italic mt-0.5">Directive: "{med.instructions}"</p>}
                                                        </div>
                                                        {isActive && isMainDoctor && !isCompletedOrDischarged && (
                                                            <button
                                                                onClick={() => onStopActiveMedication(caseDetails._id, med._id)}
                                                                disabled={medicationActionLoading}
                                                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition text-xs font-bold flex items-center gap-1 cursor-pointer"
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

                            {/* Billing and Insurance Summary */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm space-y-2 text-xs">
                                    <span className="text-[10px] font-black uppercase text-slate-400 block border-b pb-1">Billing Summary</span>
                                    <div className="flex justify-between font-semibold text-slate-600">
                                        <span>Total Amount:</span>
                                        <strong className="text-slate-900 text-sm font-black">₹{billing.totalAmount || 0}</strong>
                                    </div>
                                    <div className="flex justify-between text-slate-600">
                                        <span>Payment Status:</span>
                                        <span className={`font-black uppercase px-2 py-0.5 rounded text-[9px] ${
                                            billing.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                                        }`}>
                                            {billing.paymentStatus || "Paid"}
                                        </span>
                                    </div>
                                    {billing.transactionId && (
                                        <div className="flex justify-between text-slate-600 pt-1 font-mono text-[10px]">
                                            <span>TXN ID:</span>
                                            <span className="font-bold text-slate-800">{billing.transactionId}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm space-y-2 text-xs">
                                    <span className="text-[10px] font-black uppercase text-slate-400 block border-b pb-1">Insurance File</span>
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">Insurance Active:</span>
                                        <strong className={insurance.hasInsurance ? "text-emerald-600 font-black" : "text-slate-400"}>
                                            {insurance.hasInsurance ? "Yes (Cashless)" : "No Private Insurance"}
                                        </strong>
                                    </div>
                                    {insurance.hasInsurance && (
                                        <>
                                            <div className="flex justify-between text-slate-600">
                                                <span>Provider:</span>
                                                <strong className="text-slate-800">{insurance.companyName}</strong>
                                            </div>
                                            <div className="flex justify-between text-slate-600">
                                                <span>Policy Number:</span>
                                                <strong className="text-slate-800 font-mono">{insurance.insuranceNumber}</strong>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                        </div>
                    )}
                </div>

                {/* Footer Actions Panel */}
                {!isCompleted && (
                    <div className="p-6 border-t border-slate-100 bg-white flex flex-col sm:flex-row justify-end gap-3 sticky bottom-0 z-10">
                        {isCompletedOrDischarged ? (
                            <button 
                                onClick={onClose}
                                className="px-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition cursor-pointer"
                            >
                                Close View
                            </button>
                        ) : activeStatus === 'Pending Bedside' ? (
                            <div className="flex gap-2.5 w-full sm:w-auto">
                                <button 
                                    onClick={() => {
                                        const reason = prompt("Enter Decline Reason:") || "Engaged in another clinical schedule.";
                                        if (onRejectTransfer) onRejectTransfer(caseDetails._id, reason);
                                        onClose();
                                    }}
                                    className="w-full sm:w-auto px-6 py-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-2xl text-xs transition cursor-pointer"
                                >
                                    Decline Request
                                </button>
                                <button 
                                    onClick={() => {
                                        if (onAcceptTransfer) onAcceptTransfer(caseDetails._id);
                                        onClose();
                                    }}
                                    className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs shadow-sm transition cursor-pointer"
                                >
                                    Accept Request
                                </button>
                            </div>
                        ) : (activeStatus === 'Active Bedside' || (!isMainDoctor && isBedsideMode)) ? (
                            /* 🌟 Bedside Specialist Actions: Submit Observation + Add Stay Meds + Direct Complete Shift 🌟 */
                            <div className="flex flex-wrap gap-2.5 w-full sm:w-auto justify-end">
                                {hasAcceptedShift && (
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            if (onStartBedsideShift) onStartBedsideShift(caseDetails._id);
                                        }}
                                        className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs shadow-md transition cursor-pointer"
                                    >
                                        Start Bedside Shift
                                    </button>
                                )}

                                {/* Submit Observation & Vitals */}
                                <button 
                                    type="button"
                                    onClick={() => {
                                        if (onFeedbackClick) onFeedbackClick();
                                    }}
                                    className="px-5 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-2xl shadow-md transition cursor-pointer flex items-center gap-1.5"
                                >
                                    <FaClipboardList /> Submit Observation
                                </button>

                                {/* Option to Recommend In-Patient Stay Medicines via PrescriptionModal */}
                                <button 
                                    type="button"
                                    onClick={() => {
                                        if (onAddBedsideMedicineTrigger) {
                                            onAddBedsideMedicineTrigger();
                                        } else if (onAddStayMedicationTrigger) {
                                            onAddStayMedicationTrigger();
                                        }
                                    }}
                                    className="px-5 py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-2xl shadow-md transition cursor-pointer flex items-center gap-1.5"
                                >
                                    <FaPlus /> Add Stay Medication
                                </button>

                                {/* Complete Bedside Shift */}
                                <button 
                                    type="button"
                                    onClick={() => {
                                        if (onCompleteBedsideShift) onCompleteBedsideShift(caseDetails._id);
                                    }}
                                    className="px-5 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
                                >
                                    <FaCheck /> Complete Shift
                                </button>
                            </div>
                        ) : isPendingHandover ? (
                            <>
                                <button 
                                    onClick={() => {
                                        if (onRejectTransfer) onRejectTransfer(caseDetails._id);
                                        onClose();
                                    }}
                                    className="px-6 py-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                                >
                                    Reject Handover
                                </button>
                                <button 
                                    onClick={() => {
                                        if (onAcceptTransfer) onAcceptTransfer(caseDetails._id);
                                        onClose();
                                    }}
                                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
                                >
                                    Accept Handover
                                </button>
                            </>
                        ) : isMainDoctor ? (
                            /* Attending / Lead Doctor Action Controls */
                            <div className="flex flex-wrap gap-2.5 w-full sm:w-auto justify-end">
                                {!isMainDoctorRoundActive ? (
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            if (onStartMainDoctorRound) {
                                                onStartMainDoctorRound(caseDetails._id);
                                            }
                                        }}
                                        className="px-5 py-3 bg-[#08B36A] hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs flex items-center gap-2 shadow-sm transition cursor-pointer"
                                    >
                                        <FaClock /> Start Round Shift
                                    </button>
                                ) : (
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            if (onFeedbackClick) onFeedbackClick();
                                        }}
                                        className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-xs flex items-center gap-2 shadow-sm transition cursor-pointer"
                                    >
                                        <FaClipboardList /> Submit Observation
                                    </button>
                                )}
                                <button 
                                    type="button"
                                    onClick={onAddDoctorClick} 
                                    className="px-5 py-3 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold rounded-2xl text-xs flex items-center gap-2 transition cursor-pointer"
                                >
                                    <FaUserPlus /> Initiate Handover
                                </button>
                                <button 
                                    type="button"
                                    onClick={onDischargeClick}
                                    className="px-5 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-2xl text-xs flex items-center gap-2 shadow-sm transition cursor-pointer"
                                >
                                    <FaFileSignature /> Discharge Patient
                                </button>
                            </div>
                        ) : (
                            <button 
                                onClick={onClose}
                                className="px-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition cursor-pointer"
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