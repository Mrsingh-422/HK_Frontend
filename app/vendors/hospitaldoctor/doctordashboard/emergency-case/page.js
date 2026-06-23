'use client';
import HospitalDoctorAPI from '@/app/services/HospitalDoctorAPI';
import React, { useState, useEffect } from 'react';
import { 
    FaUser, FaHeartbeat, FaSpinner, FaExclamationTriangle
} from 'react-icons/fa';

import CaseDetailsModal from './component/CaseDetailsModal';
import AssignDoctorModal from './component/AssignDoctorModal';
import DischargeModal from './component/DischargeModal';
import PrescriptionModal from './component/PrescriptionModal';
import BedsideFeedbackModal from './component/BedsideFeedbackModal';
import DigitalPrescriptionTemplate from './component/DigitalPrescriptionTemplate';

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

export default function DoctorEmergencyCasesPage() {
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState(null);
    const [associationError, setAssociationError] = useState(null); 

    const [activeStatus, setActiveStatus] = useState('Pending Handovers'); 

    const [selectedCaseId, setSelectedCaseId] = useState(null);
    const [caseDetails, setCaseDetails] = useState(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    const [isAssignDoctorOpen, setIsAssignDoctorOpen] = useState(false);
    const [assignStep, setAssignStep] = useState(1); 
    const [assignmentType, setAssignmentType] = useState('Bed Side'); 
    const [colleagues, setColleagues] = useState([]);
    const [selectedColleague, setSelectedColleague] = useState(null);
    
    const [assignReason, setAssignReason] = useState('');
    const [assignCondition, setAssignCondition] = useState('');
    const [assignPriority, setAssignPriority] = useState('Routine');

    const [prescriptionSource, setPrescriptionSource] = useState('discharge'); 

    const [isDischargeOpen, setIsDischargeOpen] = useState(false);
    const [dischargeForm, setDischargeForm] = useState({
        diagnosis: '',
        investigation: '',
        advice: '',
        specialInstruction: '',
        treatmentResult: ''
    });

    const [isPrescriptionOpen, setIsPrescriptionOpen] = useState(false);
    const [medicinesList, setMedicinesList] = useState([]);
    const [selectedMedicine, setSelectedMedicine] = useState('');
    const [prescriptionFrequency, setPrescriptionFrequency] = useState({
        morning: false,
        afternoon: false,
        evening: false
    });
    const [prescriptionDays, setPrescriptionDays] = useState('3 days');

    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
    const [feedbackForm, setFeedbackForm] = useState({
        observation: '',
        patientCondition: 'Recovering',
        priorityRating: 'Routine'
    });

    const [isPrescriptionPreviewOpen, setIsPrescriptionPreviewOpen] = useState(false);
    const [prescriptionPreviewData, setPrescriptionPreviewData] = useState(null);

    const getErrorMessage = (err) => {
        if (!err) return "An unexpected error occurred";
        if (typeof err === 'string') return err;
        if (err instanceof Error) return err.message;
        if (typeof err === 'object') {
            return err.message || err.error || JSON.stringify(err);
        }
        return err.toString();
    };

    const fetchEmergencyCases = async () => {
        try {
            setLoading(true);
            setError(null);
            
            let tabParam = 'active';
            if (activeStatus === 'Pending Handovers') {
                tabParam = 'pending';
            } else if (activeStatus === 'In-Progress') {
                tabParam = 'active';
            } else if (activeStatus === 'Discharged') {
                tabParam = 'discharge';
            } else if (activeStatus === 'Completed') {
                tabParam = 'history';
            } else if (activeStatus === 'Pending Bedside') {
                tabParam = 'pending-bedside';
            } else if (activeStatus === 'Active Bedside') {
                tabParam = 'bedside';
            }
            
            const response = await HospitalDoctorAPI.getCases(tabParam);
            if (response.success) {
                setCases(response.data || []);
            }
        } catch (err) {
            const cleanMessage = getErrorMessage(err);
            setError(cleanMessage);
            if (cleanMessage.includes("associated")) {
                setAssociationError(cleanMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchColleaguesAndMedicines = async () => {
        try {
            const colleaguesRes = await HospitalDoctorAPI.getColleagues();
            if (colleaguesRes.success) {
                setColleagues(colleaguesRes.data || []);
            }
        } catch (err) {
            const cleanMessage = getErrorMessage(err);
            console.warn("Colleagues fetch failed:", cleanMessage);
            if (cleanMessage.includes("associated")) {
                setAssociationError(cleanMessage);
            }
        }

        try {
            const medicinesRes = await HospitalDoctorAPI.getMedicines();
            if (medicinesRes.success) {
                setMedicinesList(medicinesRes.data || []);
            }
        } catch (err) {
            const cleanMessage = getErrorMessage(err);
            console.warn("Medicines fetch failed:", cleanMessage);
        }
    };

    useEffect(() => {
        fetchEmergencyCases();
    }, [activeStatus]);

    useEffect(() => {
        fetchColleaguesAndMedicines();
    }, []);

    const handleCloseDetails = () => {
        setIsDetailsOpen(false);
        setSelectedCaseId(null);
        setCaseDetails(null);
        setPrescriptionSource('discharge'); 
    };

    const handleClosePrescription = () => {
        setIsPrescriptionOpen(false);
        setPrescriptionSource('discharge'); 
    };

    const handleCaseClick = async (caseId) => {
        try {
            setSelectedCaseId(caseId);
            setCaseDetails(null);
            setIsDetailsOpen(true);
            const response = await HospitalDoctorAPI.getCaseDetails(caseId);
            if (response.success) {
                setCaseDetails(response.data);
            }
        } catch (err) {
            alert(getErrorMessage(err));
        }
    };

    const handleAcceptTransfer = async (caseId) => {
        try {
            setActionLoading(true);
            const response = await HospitalDoctorAPI.acceptTransfer({ appointmentId: caseId });
            if (response.success) {
                alert(response.message || "Patient transfer accepted successfully.");
                fetchEmergencyCases();
            }
        } catch (err) {
            alert(getErrorMessage(err));
        } finally {
            setActionLoading(false);
        }
    };

    const handleRejectTransfer = async (caseId) => {
        try {
            setActionLoading(true);
            const response = await HospitalDoctorAPI.rejectTransfer({ appointmentId: caseId });
            if (response.success) {
                alert(response.message || "Transfer request rejected successfully.");
            } else {
                alert("Transfer request rejected.");
            }
            fetchEmergencyCases();
        } catch (err) {
            alert(getErrorMessage(err));
        } finally {
            setActionLoading(false);
        }
    };

    const handleRespondBedside = async (caseId, action, rejectionReason = "") => {
        try {
            setActionLoading(true);
            const body = {
                appointmentId: caseId,
                action,
                ...(action === 'Rejected' && { rejectionReason })
            };
            const response = await HospitalDoctorAPI.respondBedsideRequest(body);
            if (response.success) {
                alert(response.message || `Bedside request successfully ${action}!`);
                fetchEmergencyCases();
            }
        } catch (err) {
            alert(getErrorMessage(err));
        } finally {
            setActionLoading(false);
        }
    };

    const handleStartBedsideShift = async (caseId) => {
        try {
            setActionLoading(true);
            const response = await HospitalDoctorAPI.startBedsideShift({ appointmentId: caseId });
            if (response.success) {
                alert(response.message || "Specialist Bedside shift started!");
                if (caseId === selectedCaseId) {
                    const detailRes = await HospitalDoctorAPI.getCaseDetails(caseId);
                    if (detailRes.success) {
                        setCaseDetails(detailRes.data);
                    }
                }
                fetchEmergencyCases();
            }
        } catch (err) {
            alert(getErrorMessage(err));
        } finally {
            setActionLoading(false);
        }
    };

    const handleContinueAssignment = () => {
        setAssignStep(2);
    };

    const handleSelectColleague = (colleague) => {
        if (colleague.dutyStatus !== 'On Duty') return; 
        setSelectedColleague(colleague);
        setAssignStep(3);
    };

    const handleAddDoctorSubmit = async () => {
        if (!selectedColleague) return;
        try {
            setActionLoading(true);
            
            if (assignmentType === 'Bed Side') {
                let mappedPriority = 'Routine';
                if (assignPriority === 'Emergency' || assignPriority === 'Very Urgent') {
                    mappedPriority = 'Most Urgent';
                } else if (assignPriority === 'Urgent') {
                    mappedPriority = 'Urgent';
                }

                const body = {
                    appointmentId: selectedCaseId,
                    specialistDoctorId: selectedColleague._id,
                    reason: assignReason || "Need specialist opinion",
                    patientCondition: assignCondition || "Stable",
                    priority: mappedPriority
                };

                const response = await HospitalDoctorAPI.requestBedsideHelp(body);
                if (response.success) {
                    alert("Bedside help request sent to specialist successfully!");
                    setIsAssignDoctorOpen(false);
                    setIsDetailsOpen(false);
                    resetAssignmentStates();
                    fetchEmergencyCases();
                }
            } else {
                const body = {
                    appointmentId: selectedCaseId,
                    toDoctorId: selectedColleague._id,
                    reason: assignReason || `Assigned for Patient Transfer.`,
                    condition: assignCondition || "Stable",
                    priority: assignPriority
                };

                const response = await HospitalDoctorAPI.transferCase(body);
                if (response.success) {
                    alert("Doctor assigned successfully.");
                    setIsAssignDoctorOpen(false);
                    setIsDetailsOpen(false);
                    resetAssignmentStates();
                    fetchEmergencyCases();
                }
            }
        } catch (err) {
            alert(getErrorMessage(err));
        } finally {
            setActionLoading(false);
        }
    };

    const handleFeedbackSubmit = async () => {
        if (!feedbackForm.observation) {
            alert("Observation is required.");
            return;
        }
        try {
            setActionLoading(true);
            const body = {
                appointmentId: selectedCaseId,
                observation: feedbackForm.observation,
                patientCondition: feedbackForm.patientCondition,
                priorityRating: feedbackForm.priorityRating
            };
            const response = await HospitalDoctorAPI.submitBedsideFeedback(body);
            if (response.success) {
                alert("Clinical observation feedback submitted successfully!");
                setIsFeedbackOpen(false);
                if (selectedCaseId) {
                    const detailRes = await HospitalDoctorAPI.getCaseDetails(selectedCaseId);
                    if (detailRes.success) {
                        setCaseDetails(detailRes.data);
                    }
                }
                fetchEmergencyCases();
            }
        } catch (err) {
            alert(getErrorMessage(err));
        } finally {
            setActionLoading(false);
        }
    };

    const handleDischargeSubmitDirect = async () => {
        try {
            setActionLoading(true);

            const dischargeBody = {
                appointmentId: selectedCaseId,
                diagnosis: dischargeForm.diagnosis || "Undisclosed Diagnosis",
                investigation: dischargeForm.investigation || "Standard followups",
                treatmentResult: dischargeForm.treatmentResult || "Standard summary submitted",
                dischargeNote: dischargeForm.specialInstruction || "N/A"
            };

            const response = await HospitalDoctorAPI.submitDischargeSummary(dischargeBody);
            if (response.success) {
                alert("Patient discharged successfully!");
                setIsDischargeOpen(false);
                setIsDetailsOpen(false);
                setActiveStatus('Discharged');
                fetchEmergencyCases();
            }
        } catch (err) {
            alert(getErrorMessage(err));
        } finally {
            setActionLoading(false);
        }
    };

    const handleFinalizeDischarge = async () => {
        try {
            setActionLoading(true);

            const dischargeBody = {
                appointmentId: selectedCaseId,
                diagnosis: dischargeForm.diagnosis || "Undisclosed Diagnosis",
                investigation: dischargeForm.investigation || "Standard followups",
                treatmentResult: dischargeForm.treatmentResult || "Standard summary submitted",
                dischargeNote: dischargeForm.specialInstruction || "N/A"
            };

            const response = await HospitalDoctorAPI.submitDischargeSummary(dischargeBody);
            if (response.success) {
                alert("Patient discharged successfully!");
                setIsPrescriptionPreviewOpen(false);
                setIsDetailsOpen(false);
                setActiveStatus('Discharged');
                fetchEmergencyCases();
            }
        } catch (err) {
            alert(getErrorMessage(err));
        } finally {
            setActionLoading(false);
        }
    };

    const handleFinalizeBedsideShift = async () => {
        try {
            setActionLoading(true);
            const response = await HospitalDoctorAPI.completeBedsideShift({ appointmentId: selectedCaseId });
            if (response.success) {
                alert("Specialist bedside shift completed successfully.");
                setIsPrescriptionPreviewOpen(false);
                setIsDetailsOpen(false);
                fetchEmergencyCases();
            }
        } catch (err) {
            alert(getErrorMessage(err));
        } finally {
            setActionLoading(false);
        }
    };

    const handleProcessPrescriptionSubmit = async (finalMedicines, dietPlanFile) => {
        try {
            setActionLoading(true);

            const diagnosisText = dischargeForm.diagnosis || (prescriptionSource === 'bedside' ? "Specialist Bedside Treatment" : "Undisclosed Diagnosis");
            const diagnosisArray = [diagnosisText];

            const formData = new FormData();
            formData.append('appointmentId', selectedCaseId);
            formData.append('diagnosis', JSON.stringify(diagnosisArray));
            formData.append('medicines', JSON.stringify(finalMedicines));
            formData.append('advice', dischargeForm.advice || "Take prescription medicines on time");
            if (dietPlanFile) {
                formData.append('dietPlanPdf', dietPlanFile);
            }

            await HospitalDoctorAPI.addPrescription(formData);

            const activePatientObj = caseDetails?.patients?.[0] || {};
            
            const previewPayload = {
                _id: selectedCaseId || caseDetails?._id, 
                appointmentId: caseDetails?.bookingId || "N/A",
                date: new Date().toLocaleDateString('en-GB'),
                time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
                patientName: activePatientObj.patientName || caseDetails?.userId?.name || "N/A",
                gender: activePatientObj.gender || caseDetails?.userId?.gender || "N/A",
                age: activePatientObj.patientAge || caseDetails?.userId?.age || "N/A",
                address: caseDetails?.address?.addressType || "N/A",
                chiefComplaints: caseDetails?.chiefComplaints || "N/A",
                diagnosis: diagnosisText,
                medicines: finalMedicines.map(m => ({
                    name: m.name,
                    dose: m.dosage,
                    time: m.frequency,
                    duration: m.duration
                })),
                investigations: dischargeForm.investigation || "Standard followups",
                advice: dischargeForm.advice || "Take prescription medicines on time",
                specialInstructions: dischargeForm.specialInstruction || "N/A",
                nextAppointment: "After 1 week",
                
                hospitalName: caseDetails?.hospitalId?.name || "Fortis Hospital Mohali",
                hospitalAddress: caseDetails?.hospitalId?.address || "Sector 62, Sahibzada Ajit Singh Nagar, Punjab 160062",
                mainDoctorName: caseDetails?.doctorId?.name || "Dr. Deepak Joshi",
                mainDoctorQualification: caseDetails?.doctorId?.qualification || "Professor & Head: Department of Medicine",
                bedsideCareTeam: caseDetails?.bedsideCareTeam || []
            };

            setPrescriptionPreviewData(previewPayload);
            setIsPrescriptionPreviewOpen(true);

            setIsPrescriptionOpen(false);
            setIsDischargeOpen(false);

            fetchEmergencyCases();

        } catch (err) {
            alert(getErrorMessage(err));
        } finally {
            setActionLoading(false);
        }
    };

    const resetAssignmentStates = () => {
        setAssignStep(1);
        setSelectedColleague(null);
        setAssignReason('');
        setAssignCondition('');
        setAssignPriority('Routine');
    };

    const onDutyColleagues = colleagues.filter(doc => doc.dutyStatus === 'On Duty');
    const offDutyColleagues = colleagues.filter(doc => doc.dutyStatus !== 'On Duty');

    const filteredCases = cases.filter(cs => {
        // STRICT RULE: If ambulanceId has no value, exclude it from Emergency Cases
        if (cs.ambulanceId === null || cs.ambulanceId === undefined || cs.ambulanceId === '') {
            return false;
        }

        const myDoctorId = getDoctorIdFromToken();
        const myBedsideRecord = cs.bedsideCareTeam?.find(team => {
            const docId = typeof team.doctorId === 'object' && team.doctorId !== null ? team.doctorId._id : team.doctorId;
            return myDoctorId ? docId === myDoctorId : true;
        });

        if (activeStatus === 'Pending Handovers') {
            return !!cs.pendingDoctorId || cs.status === 'Hospital-Pending' || cs.status === 'Pending';
        }
        
        if (activeStatus === 'In-Progress') {
            return !cs.pendingDoctorId && 
                   cs.status !== 'Hospital-Pending' && 
                   cs.status !== 'Pending' && 
                   (cs.status === 'In-Progress' || cs.status === 'Confirmed' || cs.status === 'Active');
        }
        
        if (activeStatus === 'Discharged') {
            return cs.status === 'Discharge-Pending' || cs.status === 'Discharged';
        }
        
        if (activeStatus === 'Pending Bedside') {
            return myBedsideRecord ? (myBedsideRecord.status === 'Pending') : cs.bedsideCareTeam?.some(t => t.status === 'Pending');
        }
        
        if (activeStatus === 'Active Bedside') {
            return myBedsideRecord ? (myBedsideRecord.status === 'Accepted' || myBedsideRecord.status === 'In-Progress') : cs.bedsideCareTeam?.some(t => t.status === 'Accepted' || t.status === 'In-Progress');
        }
        
        if (activeStatus === 'Completed') {
            return cs.status === 'Completed' || myBedsideRecord?.status === 'Completed' || cs.bedsideCareTeam?.some(t => t.status === 'Completed');
        }

        return true;
    });

    return (
        <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto animate-in fade-in duration-300">
                
                <div className="mb-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Assigned Emergency Cases</h1>
                        <p className="text-slate-500 mt-1 text-sm">Real-time emergency triage queue and medical handovers</p>
                    </div>
                </div>

                {associationError && (
                    <div className="mb-6 p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-2xl text-amber-800 text-sm flex items-start gap-3 shadow-sm animate-in slide-in-from-top duration-300">
                        <FaExclamationTriangle className="flex-shrink-0 text-lg text-amber-600 mt-0.5" />
                        <div>
                            <span className="font-extrabold text-amber-900 block mb-1">Hospital Association Warning</span>
                            <p className="font-medium text-amber-800">
                                {associationError}. Account setup might be incomplete. Please request your clinical supervisor to assign this doctor profile to an active hospital branch.
                            </p>
                        </div>
                    </div>
                )}

                <div className="mb-6 flex flex-wrap gap-2 border-b border-slate-200 pb-px">
                    {['Pending Handovers', 'In-Progress', 'Discharged', 'Pending Bedside', 'Active Bedside', 'Completed'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setActiveStatus(status)}
                            className={`px-5 py-3 font-bold text-xs sm:text-sm tracking-wide transition-all border-b-2 -mb-px ${
                                activeStatus === status 
                                ? 'border-emerald-500 text-emerald-600 bg-emerald-50/10' 
                                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                            }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <FaSpinner className="text-3xl animate-spin text-emerald-500" />
                            <p className="text-slate-400 mt-2 text-sm font-medium">Fetching cases for '{activeStatus}' status...</p>
                        </div>
                    ) : error ? (
                        <div className="p-12 text-center flex flex-col items-center justify-center animate-in fade-in duration-350">
                            <FaExclamationTriangle className="text-red-500 text-4xl mb-3" />
                            <p className="text-slate-700 font-bold max-w-md">{error}</p>
                            <p className="text-slate-400 text-xs mt-1">Confirm that your doctor token is correct and your clinic profile is linked.</p>
                        </div>
                    ) : filteredCases.length === 0 ? (
                        <div className="text-center py-16 px-4 animate-in fade-in duration-350">
                            <FaHeartbeat className="mx-auto text-slate-300 text-5xl mb-3" />
                            <h3 className="text-base font-bold text-slate-700">No {activeStatus} Emergency Cases Found</h3>
                            <p className="text-slate-400 text-xs mt-1">Try clicking other status tabs above to browse your database records.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50/75 border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">Booking ID</th>
                                        <th className="px-6 py-4 font-semibold">Patient Details</th>
                                        <th className="px-6 py-4 font-semibold">Triage Level</th>
                                        <th className="px-6 py-4 font-semibold">Location Type</th>
                                        <th className="px-6 py-4 font-semibold text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredCases.map((cs) => {
                                        const patient = cs.patients?.[0] || {};
                                        return (
                                            <tr 
                                                key={cs._id}
                                                onClick={() => handleCaseClick(cs._id)}
                                                className="hover:bg-slate-50/50 cursor-pointer transition-colors duration-150"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="font-bold text-sm text-slate-900 block">{cs.bookingId}</span>
                                                    <span className="text-xs text-blue-600 font-medium">{cs.bookingType || "Admission"}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
                                                            <FaUser size={13} />
                                                        </div>
                                                        <div>
                                                            <span className="font-bold text-sm text-slate-800 block">{patient.patientName || cs.userId?.name}</span>
                                                            <span className="text-xs text-slate-500">{patient.patientAge || cs.userId?.age || "30"} Yrs • {patient.gender || cs.userId?.gender || "Male"}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex px-2.5 py-1 text-xs font-bold rounded-full bg-red-50 text-red-700 border border-red-100">
                                                        {cs.triageLevel || "Emergency"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                                                    {cs.bedBookingType || "General-Bed"}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center" onClick={(e) => e.stopPropagation()}>
                                                    {activeStatus === 'Pending Handovers' ? (
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button 
                                                                onClick={() => handleAcceptTransfer(cs._id)}
                                                                disabled={actionLoading}
                                                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                                                            >
                                                                Accept
                                                            </button>
                                                             <button 
                                                                onClick={() => handleRejectTransfer(cs._id)}
                                                                disabled={actionLoading}
                                                                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                                                            >
                                                                Reject
                                                            </button> 
                                                        </div>
                                                    ) : activeStatus === 'Pending Bedside' ? (
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button 
                                                                onClick={() => handleRespondBedside(cs._id, 'Accepted')}
                                                                disabled={actionLoading}
                                                                className="px-3 py-1.5 bg-[#08B36A] hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                                                            >
                                                                Accept Bedside
                                                            </button>
                                                             <button 
                                                                onClick={() => {
                                                                    const reason = prompt("Enter Decline Reason:") || "Engaged in another clinical schedule.";
                                                                    handleRespondBedside(cs._id, 'Rejected', reason);
                                                                }}
                                                                disabled={actionLoading}
                                                                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                                                            >
                                                                Decline
                                                            </button> 
                                                        </div>
                                                    ) : (
                                                        <button 
                                                            onClick={() => handleCaseClick(cs._id)}
                                                            className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all"
                                                        >
                                                            View
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <CaseDetailsModal 
                    isOpen={isDetailsOpen}
                    onClose={handleCloseDetails}
                    caseDetails={caseDetails}
                    onAddDoctorClick={() => {
                        resetAssignmentStates();
                        setIsAssignDoctorOpen(true);
                    }}
                    onDischargeClick={() => {
                        setDischargeForm({
                            diagnosis: '',
                            investigation: '',
                            advice: '',
                            specialInstruction: '',
                            treatmentResult: ''
                        });
                        setPrescriptionSource('discharge');
                        setIsDischargeOpen(true);
                    }}
                    onAcceptTransfer={activeStatus === 'Pending Bedside' ? (caseId) => handleRespondBedside(caseId, 'Accepted') : handleAcceptTransfer}
                    onRejectTransfer={activeStatus === 'Pending Bedside' ? (caseId, reason) => handleRespondBedside(caseId, 'Rejected', reason) : handleRejectTransfer}
                    activeStatus={activeStatus}
                    onFeedbackClick={() => setIsFeedbackOpen(true)}
                    onStartBedsideShift={handleStartBedsideShift}
                    onCompleteBedsideShift={(caseId) => {
                        setPrescriptionSource('bedside'); 
                        setSelectedMedicine('');
                        setPrescriptionFrequency({ morning: false, afternoon: false, evening: false });
                        setPrescriptionDays('3 days');
                        setIsPrescriptionOpen(true);
                    }}
                />

                <AssignDoctorModal 
                    isOpen={isAssignDoctorOpen}
                    onClose={() => setIsAssignDoctorOpen(false)}
                    assignStep={assignStep}
                    setAssignStep={setAssignStep}
                    assignmentType={assignmentType}
                    setAssignmentType={setAssignmentType}
                    onDutyColleagues={onDutyColleagues}
                    offDutyColleagues={offDutyColleagues}
                    selectedColleague={selectedColleague}
                    setSelectedColleague={setSelectedColleague}
                    assignReason={assignReason}
                    setAssignReason={setAssignReason}
                    assignCondition={assignCondition}
                    setAssignCondition={setAssignCondition}
                    assignPriority={assignPriority}
                    setAssignPriority={setAssignPriority}
                    actionLoading={actionLoading}
                    onContinue={handleContinueAssignment}
                    onSelectColleague={handleSelectColleague}
                    onSubmit={handleAddDoctorSubmit}
                />

                <DischargeModal 
                    isOpen={isDischargeOpen}
                    onClose={setIsDischargeOpen}
                    dischargeForm={dischargeForm}
                    setDischargeForm={setDischargeForm}
                    onAddMedicineDetail={() => setIsPrescriptionOpen(true)}
                    onDirectSubmit={handleDischargeSubmitDirect}
                />

                <PrescriptionModal 
                    isOpen={isPrescriptionOpen}
                    onClose={handleClosePrescription}
                    selectedMedicine={selectedMedicine}
                    setSelectedMedicine={setSelectedMedicine}
                    medicinesList={medicinesList}
                    prescriptionFrequency={prescriptionFrequency}
                    setPrescriptionFrequency={setPrescriptionFrequency}
                    prescriptionDays={prescriptionDays}
                    setPrescriptionDays={setPrescriptionDays}
                    actionLoading={actionLoading}
                    onSubmit={handleProcessPrescriptionSubmit}
                />

                <BedsideFeedbackModal 
                    isOpen={isFeedbackOpen}
                    onClose={() => setIsFeedbackOpen(false)}
                    feedbackForm={feedbackForm}
                    setFeedbackForm={setFeedbackForm}
                    actionLoading={actionLoading}
                    onSubmit={handleFeedbackSubmit}
                />

                <DigitalPrescriptionTemplate 
                    isOpen={isPrescriptionPreviewOpen}
                    onClose={() => setIsPrescriptionPreviewOpen(false)}
                    data={prescriptionPreviewData}
                    isDischargeFlow={prescriptionSource === 'discharge'}
                    onCompleteDischarge={handleFinalizeDischarge}
                    isBedsideFlow={prescriptionSource === 'bedside'}
                    onCompleteBedside={handleFinalizeBedsideShift}
                />

            </div>
        </div>
    );
}