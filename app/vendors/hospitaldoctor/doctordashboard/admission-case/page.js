'use client';
import HospitalDoctorAPI from '@/app/services/HospitalDoctorAPI';
import React, { useState, useEffect } from 'react';
import { 
    FaUser, FaHeartbeat, FaSpinner, FaExclamationTriangle, FaHospital, FaUserMd
} from 'react-icons/fa';

import CaseDetailsModal from '../emergency-case/component/CaseDetailsModal';
import AssignDoctorModal from '../emergency-case/component/AssignDoctorModal';
import DischargeModal from '../emergency-case/component/DischargeModal';
import PrescriptionModal from '../emergency-case/component/PrescriptionModal';
import BedsideFeedbackModal from '../emergency-case/component/BedsideFeedbackModal';
import DigitalPrescriptionTemplate from '../emergency-case/component/DigitalPrescriptionTemplate';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://192.168.1.7:5002';

const getDoctorIdFromToken = () => {
    if (typeof window === 'undefined') return null;
    try {
        const token = localStorage.getItem('hospitalDoctorToken');
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

export default function DoctorAdmissionCasesPage() {
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState(null);
    const [associationError, setAssociationError] = useState(null); 

    const [mainTab, setMainTab] = useState('admissions'); 
    const [activeStatus, setActiveStatus] = useState('In-Progress'); 

    const [selectedCaseId, setSelectedCaseId] = useState(null);
    const [caseDetails, setCaseDetails] = useState(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    // Collaborative/Specialist Medications Pool
    const [collaborativeMeds, setCollaborativeMeds] = useState([]);

    // Attending Doctor Round-State Handlers
    const [activeMainRoundCaseId, setActiveMainRoundCaseId] = useState(null);

    // Stay Medications Action Loading State
    const [medicationActionLoading, setMedicationActionLoading] = useState(false);

    const [isAssignDoctorOpen, setIsAssignDoctorOpen] = useState(false);
    const [assignStep, setAssignStep] = useState(1); 
    const [assignmentType, setAssignmentType] = useState('Bed Side'); 
    const [colleagues, setColleagues] = useState([]);
    const [selectedColleague, setSelectedColleague] = useState(null);
    
    const [assignReason, setAssignReason] = useState('');
    const [assignCondition, setAssignCondition] = useState('');
    const [assignPriority, setAssignPriority] = useState('Routine');

    const [clinicalReports, setClinicalReports] = useState([]);
    const [stagedMedicines, setStagedMedicines] = useState([]);
    const [prescriptionSource, setPrescriptionSource] = useState('discharge'); 

    const [isDischargeOpen, setIsDischargeOpen] = useState(false);
    const [dischargeForm, setDischargeForm] = useState({
        chiefComplaints: '',
        diagnosis: '',
        advisedInvestigations: '',
        adviceGiven: '',
        specialInstructions: '',
        nextAppointment: '',
        clinicalNotes: '',
        dateOfSurgery: '',
        conditionDuringAdmission: '',
        conditionDuringDischarge: ''
    });

    const [isPrescriptionOpen, setIsPrescriptionOpen] = useState(false);
    const [medicinesList, setMedicinesList] = useState([]);

    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
    const [feedbackForm, setFeedbackForm] = useState({
        observation: '',
        patientCondition: 'Recovering',
        priorityRating: 'Routine',
        recommendedMedicines: [] // Pre-initialized state array
    });

    const [isPrescriptionPreviewOpen, setIsPrescriptionPreviewOpen] = useState(false);
    const [prescriptionPreviewData, setPrescriptionPreviewData] = useState(null);

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http://') || path.startsWith('https://')) return path;
        return `${API_BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
    };

    const getErrorMessage = (err) => {
        if (!err) return "An unexpected error occurred";
        if (typeof err === 'string') return err;
        if (err instanceof Error) return err.message;
        if (typeof err === 'object') {
            return err.message || err.error || JSON.stringify(err);
        }
        return err.toString();
    };

    const fetchAdmissionCases = async () => {
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
            } else if (activeStatus === 'Unassigned') {
                tabParam = 'unassigned';
            } else if (activeStatus === 'Transferred Out') {
                tabParam = 'transferred-out';
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
        fetchAdmissionCases();
    }, [activeStatus]);

    useEffect(() => {
        fetchColleaguesAndMedicines();
    }, []);

    const handleCloseDetails = () => {
        setIsDetailsOpen(false);
        setSelectedCaseId(null);
        setCaseDetails(null);
        setCollaborativeMeds([]);
        setClinicalReports([]); 
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
            setCollaborativeMeds([]); 
            setIsDetailsOpen(true);
            const response = await HospitalDoctorAPI.getCaseDetails(caseId);
            if (response.success) {
                setCaseDetails(response.data);
            }

            // Fetch specialist collaborative medications pool if attending doctor is logged in
            const currentDoctorId = getDoctorIdFromToken();
            const isMainDoctor = response.data?.doctorId?._id === currentDoctorId || response.data?.doctorId === currentDoctorId;
            if (isMainDoctor) {
                try {
                    const poolRes = await HospitalDoctorAPI.getBedsideMedications(caseId);
                    if (poolRes.success) {
                        setCollaborativeMeds(poolRes.data || []);
                    }
                } catch (err) {
                    console.warn("Collaborative medications fetch failed:", err);
                }
            }
        } catch (err) {
            alert(getErrorMessage(err));
        }
    };

    const handleSelfAssign = async (caseId) => {
        try {
            setActionLoading(true);
            const response = await HospitalDoctorAPI.selfAssignCase({ appointmentId: caseId });
            if (response.success) {
                alert(response.message || "You have successfully self-assigned this case.");
                setIsDetailsOpen(false);
                setMainTab('admissions');
                setActiveStatus('In-Progress');
                fetchAdmissionCases();
            }
        } catch (err) {
            alert(getErrorMessage(err));
        } finally {
            setActionLoading(false);
        }
    };

    const handleAcceptTransfer = async (caseId) => {
        try {
            setActionLoading(true);
            const response = await HospitalDoctorAPI.acceptTransfer({ appointmentId: caseId });
            if (response.success) {
                alert(response.message || "Patient admission transfer accepted successfully.");
                fetchAdmissionCases();
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
                alert(response.message || "Admission transfer request rejected.");
            } else {
                alert("Transfer request rejected.");
            }
            fetchAdmissionCases();
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
                fetchAdmissionCases();
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
                fetchAdmissionCases();
            }
        } catch (err) {
            alert(getErrorMessage(err));
        } finally {
            setActionLoading(false);
        }
    };

    // Attending Main Doctor Ward Rounds tracking
    const handleStartMainDoctorRound = (caseId) => {
        setActiveMainRoundCaseId(caseId);
        alert("Attending physician ward round started. You can now log observations.");
    };

    // Trigger Medication Selector modal for active stay medications
    const handleAddStayMedicationTrigger = () => {
        setPrescriptionSource('stay');
        setIsPrescriptionOpen(true);
    };

    // Stop/Discontinue In-Patient Active Medication
    const handleStopActiveMedication = async (appointmentId, medicationRecordId) => {
        try {
            setMedicationActionLoading(true);
            const payload = {
                appointmentId,
                medicationRecordId
            };
            const response = await HospitalDoctorAPI.stopActiveMedication(payload);
            if (response.success) {
                alert(response.message || "In-patient medication discontinued successfully.");
                // Refresh case details to render updated stay medications chart
                if (appointmentId === selectedCaseId) {
                    const detailRes = await HospitalDoctorAPI.getCaseDetails(appointmentId);
                    if (detailRes.success) {
                        setCaseDetails(detailRes.data);
                    }
                }
                fetchAdmissionCases();
                return true;
            }
            return false;
        } catch (err) {
            alert(getErrorMessage(err));
            return false;
        } finally {
            setMedicationActionLoading(false);
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
                    fetchAdmissionCases();
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
                    fetchAdmissionCases();
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
            const currentDoctorId = getDoctorIdFromToken();
            const isMainDoctor = caseDetails?.doctorId?._id === currentDoctorId || caseDetails?.doctorId === currentDoctorId;

            if (isMainDoctor) {
                // Ensure priority rating maps perfectly to specification enums
                let priorityEnum = feedbackForm.priorityRating;
                if (priorityEnum === 'Most Urgent' || priorityEnum === 'Emergency') {
                    priorityEnum = 'Critical';
                }

                const body = {
                    appointmentId: selectedCaseId,
                    observation: feedbackForm.observation,
                    patientCondition: feedbackForm.patientCondition,
                    priorityRating: priorityEnum
                };

                const response = await HospitalDoctorAPI.addClinicalLog(body);
                if (response.success) {
                    alert(response.message || "Clinical observation log recorded successfully.");
                    
                    // Sync logged feedback to current active notes preview layout as well
                    setDischargeForm(prev => ({
                        ...prev,
                        clinicalNotes: prev.clinicalNotes 
                            ? `${prev.clinicalNotes}\n[Round Update - ${feedbackForm.patientCondition}]: ${feedbackForm.observation}`
                            : `[Round Update - ${feedbackForm.patientCondition}]: ${feedbackForm.observation}`
                    }));

                    setIsFeedbackOpen(false);
                    
                    if (selectedCaseId) {
                        const detailRes = await HospitalDoctorAPI.getCaseDetails(selectedCaseId);
                        if (detailRes.success) {
                            setCaseDetails(detailRes.data);
                        }
                    }
                    fetchAdmissionCases();
                }
            } else {
                // Standard Bedside feedback array insertion
                const body = {
                    appointmentId: selectedCaseId,
                    observation: feedbackForm.observation,
                    patientCondition: feedbackForm.patientCondition,
                    priorityRating: feedbackForm.priorityRating,
                    recommendedMedicines: feedbackForm.recommendedMedicines || [] // Binds medications array
                };
                const response = await HospitalDoctorAPI.submitBedsideFeedback(body);
                if (response.success) {
                    alert("Consultation observation and recommended medicines submitted successfully!");
                    setIsFeedbackOpen(false);
                    if (selectedCaseId) {
                        const detailRes = await HospitalDoctorAPI.getCaseDetails(selectedCaseId);
                        if (detailRes.success) {
                            setCaseDetails(detailRes.data);
                        }
                    }
                    fetchAdmissionCases();
                }
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

            const formData = new FormData();
            formData.append('appointmentId', selectedCaseId);
            formData.append('diagnosis', dischargeForm.diagnosis || "Undisclosed Diagnosis");
            formData.append('investigation', dischargeForm.advisedInvestigations || "Standard followups");
            formData.append('treatmentResult', dischargeForm.clinicalNotes || "Standard summary submitted");
            formData.append('dischargeNote', dischargeForm.specialInstructions || "N/A");

            clinicalReports.forEach((file) => {
                formData.append('clinicalReports', file);
            });

            const response = await HospitalDoctorAPI.submitDischargeSummary(formData);
            if (response.success) {
                alert("Patient discharged successfully!");
                setIsDischargeOpen(false);
                setIsDetailsOpen(false);
                setClinicalReports([]);
                setStagedMedicines([]);
                setMainTab('admissions');
                setActiveStatus('Discharged');
                fetchAdmissionCases();
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
            setIsPrescriptionPreviewOpen(false);
            setIsDischargeOpen(false);
            setIsDetailsOpen(false);
            setMainTab('admissions');
            setActiveStatus('Discharged');
            setClinicalReports([]);
            setStagedMedicines([]);
            fetchAdmissionCases();
        } catch (err) {
            alert(getErrorMessage(err));
        } finally {
            setActionLoading(false);
        }
    };

    const handleFinalizeBedsideShift = async (caseId) => {
        try {
            setActionLoading(true);
            const response = await HospitalDoctorAPI.completeBedsideShift({ appointmentId: caseId });
            if (response.success) {
                alert("Specialist bedside shift completed successfully.");
                setIsDetailsOpen(false);
                fetchAdmissionCases();
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

            // 1. Dynamic Flow: Stay Medications processing
            if (prescriptionSource === 'stay') {
                for (const med of finalMedicines) {
                    await HospitalDoctorAPI.addActiveMedication({
                        appointmentId: selectedCaseId,
                        medicineName: med.name,
                        dosage: med.dosage || "1-0-0",
                        frequency: med.frequency || "Once Daily",
                        instructions: med.instructions || "Standard ward round drip"
                    });
                }
                alert("Active stay medications added to the patient chart.");
                
                if (selectedCaseId) {
                    const detailRes = await HospitalDoctorAPI.getCaseDetails(selectedCaseId);
                    if (detailRes.success) {
                        setCaseDetails(detailRes.data);
                    }
                }
                fetchAdmissionCases();
                setIsPrescriptionOpen(false);
                return;
            }

            // 2. Dynamic Flow: Staging medicines into Specialist Bedside Feedback
            if (prescriptionSource === 'bedside-feedback') {
                setFeedbackForm(prev => ({
                    ...prev,
                    recommendedMedicines: [
                        ...(prev.recommendedMedicines || []),
                        ...finalMedicines.map(m => ({
                            name: m.name,
                            dosage: m.dosage || "1 tablet",
                            frequency: m.frequency || "Once daily",
                            duration: m.duration || "10 days",
                            instructions: m.instructions || "As directed",
                            type: "Active-Stay" // Automatically classify as Active-Stay in consultation notes
                        }))
                    ]
                }));
                setIsPrescriptionOpen(false);
                return;
            }

            // 3. Dynamic Flow: Bedside Shift final checkout prescription
            if (prescriptionSource === 'bedside') {
                const body = {
                    appointmentId: selectedCaseId,
                    observation: feedbackForm.observation || "Final shift checkout medications recommended.",
                    patientCondition: feedbackForm.patientCondition || "Recovering",
                    priorityRating: feedbackForm.priorityRating || "Routine",
                    recommendedMedicines: finalMedicines.map(m => ({
                        name: m.name,
                        dosage: m.dosage || "1 tablet",
                        frequency: m.frequency || "Once daily",
                        duration: m.duration || "10 days",
                        instructions: m.instructions || "As directed",
                        type: "Discharge-Home" // Automatically registers on dischargeHomeRecommendations pool
                    }))
                };

                // POSTs recommendations to register them under specialist recommendations array
                await HospitalDoctorAPI.submitBedsideFeedback(body);

                // Completes the bedside shift session
                const completeRes = await HospitalDoctorAPI.completeBedsideShift({ appointmentId: selectedCaseId });
                if (completeRes.success) {
                    alert("Checkout medications registered and bedside specialist shift completed successfully!");
                    setIsPrescriptionOpen(false);
                    setIsDetailsOpen(false);
                    fetchAdmissionCases();
                }
                return;
            }

            // 4. Dynamic Flow: Discharge prescription submission
            setStagedMedicines(finalMedicines);

            const diagnosisText = dischargeForm.diagnosis || "";
            const diagnosisArray = [diagnosisText];

            const formData = new FormData();
            formData.append('appointmentId', selectedCaseId);
            formData.append('diagnosis', JSON.stringify(diagnosisArray));
            formData.append('medicines', JSON.stringify(finalMedicines));
            formData.append('advice', dischargeForm.adviceGiven || "");
            formData.append('advisedInvestigations', dischargeForm.advisedInvestigations || "");
            formData.append('adviceGiven', dischargeForm.adviceGiven || "");
            formData.append('specialInstructions', dischargeForm.specialInstructions || "");
            formData.append('nextAppointment', dischargeForm.nextAppointment || "");
            if (dietPlanFile) {
                formData.append('dietPlanPdf', dietPlanFile);
            }

            await HospitalDoctorAPI.addPrescription(formData);

            const activePatientObj = caseDetails?.patients?.[0] || {};
            
            const previewPayload = {
                _id: selectedCaseId || caseDetails?._id, 
                appointmentId: caseDetails?.bookingId || "N/A",
                date: caseDetails?.createdAt ? new Date(caseDetails.createdAt).toLocaleDateString('en-GB') : "XX/XX/XXXX",
                time: caseDetails?.createdAt ? new Date(caseDetails.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : "XX:XX",
                patientName: activePatientObj.patientName || caseDetails?.userId?.name || "N/A",
                gender: activePatientObj.gender || caseDetails?.userId?.gender || "N/A",
                age: activePatientObj.patientAge || caseDetails?.userId?.age || "N/A",
                address: caseDetails?.address?.addressType || "N/A",
                chiefComplaints: dischargeForm.chiefComplaints || caseDetails?.chiefComplaints || "N/A",
                diagnosis: diagnosisText,
                medicines: finalMedicines.map(m => ({
                    name: m.name,
                    dose: m.dosage,
                    time: m.frequency,
                    duration: m.duration
                })),
                investigations: dischargeForm.advisedInvestigations || "",
                advice: dischargeForm.adviceGiven || "",
                specialInstructions: dischargeForm.specialInstructions || "",
                nextAppointment: dischargeForm.nextAppointment || "",
                
                dateOfAdmission: caseDetails?.startDate ? new Date(caseDetails.startDate).toLocaleDateString('en-GB') : "N/A",
                department: caseDetails?.doctorId?.speciality || "Department of Medicine, Unit - 1",
                dateOfDischarge: new Date().toLocaleDateString('en-GB'),
                dateOfSurgery: dischargeForm.dateOfSurgery || "",
                insuranceStatus: caseDetails?.hasInsurance ? "Verified (Cashless)" : "N/A",
                paymentStatus: caseDetails?.paymentStatus || "Paid",
                paymentType: caseDetails?.paymentMethod || "UPI",
                conditionDuringAdmission: dischargeForm.conditionDuringAdmission || "",
                conditionDuringDischarge: dischargeForm.conditionDuringDischarge || "",

                hospitalName: caseDetails?.hospitalId?.name || caseDetails?.hospitalName || (typeof caseDetails?.hospitalId === 'object' ? caseDetails.hospitalId?.name : null) || "Fortis Hospital Mohali",
                hospitalAddress: caseDetails?.hospitalId?.address || caseDetails?.hospitalAddress || (typeof caseDetails?.hospitalId === 'object' ? caseDetails.hospitalId?.address : null) || "Sector 62, Sahibzada Ajit Nagar, Punjab 160062",
                hospitalLogo: caseDetails?.hospitalId?.logo 
                    ? getImageUrl(caseDetails.hospitalId.logo) 
                    : (caseDetails?.hospitalId?.image 
                        ? getImageUrl(caseDetails.hospitalId.image) 
                        : (caseDetails?.hospitalId?.profilePic 
                            ? getImageUrl(caseDetails.hospitalId.profilePic) 
                            : (caseDetails?.hospitalLogo 
                                ? getImageUrl(caseDetails.hospitalLogo) 
                                : null))),
                mainDoctorName: caseDetails?.doctorId?.name || "Dr. Deepak Joshi",
                mainDoctorQualification: caseDetails?.doctorId?.qualification || "Professor & Head: Department of Medicine",
                bedsideCareTeam: caseDetails?.bedsideCareTeam || [],
                clinicalLogs: caseDetails?.clinicalLogs || []
            };

            setPrescriptionPreviewData(previewPayload);
            setIsPrescriptionPreviewOpen(true);

            setIsPrescriptionOpen(false);
            setIsDischargeOpen(false);

            fetchAdmissionCases();

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

    const filteredCases = cases.filter(cs => {
        if (cs.ambulanceId !== null && cs.ambulanceId !== undefined && cs.ambulanceId !== '') {
            return false;
        }

        const myDoctorId = getDoctorIdFromToken();
        const myBedsideRecord = cs.bedsideCareTeam?.find(team => {
            const docId = typeof team.doctorId === 'object' && team.doctorId !== null ? team.doctorId._id : team.doctorId;
            return myDoctorId ? docId === myDoctorId : true;
        });

        if (activeStatus === 'Unassigned') {
            return !cs.doctorId && !cs.pendingDoctorId;
        }

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

        if (activeStatus === 'Transferred Out') {
            return true; // Transferred-out records are pre-filtered at the API level
        }

        return true;
    });

    const onDutyColleagues = colleagues.filter(doc => doc.dutyStatus === 'On Duty');
    const offDutyColleagues = colleagues.filter(doc => doc.dutyStatus !== 'On Duty');

    const currentDoctorId = getDoctorIdFromToken();
    const isMainDoctor = caseDetails?.doctorId?._id === currentDoctorId || caseDetails?.doctorId === currentDoctorId;

    return (
        <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto animate-in fade-in duration-300 font-sans">
                
                <div className="mb-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Clinical Operations Portal</h1>
                        <p className="text-slate-500 mt-1 text-sm">Review assigned ward admissions and bedside specialist handovers</p>
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

                {/* Primary Module Navigation */}
                <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-6 max-w-md border border-slate-200">
                    <button
                        onClick={() => {
                            setMainTab('admissions');
                            setActiveStatus('In-Progress');
                        }}
                        className={`flex-1 py-3 px-4 font-extrabold text-xs sm:text-sm tracking-wide rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${
                            mainTab === 'admissions'
                            ? 'bg-white text-slate-900 shadow-md border-b-0'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <FaHospital size={14} className={mainTab === 'admissions' ? 'text-emerald-500' : ''} />
                        Admissions Desk
                    </button>
                    <button
                        onClick={() => {
                            setMainTab('bedside');
                            setActiveStatus('Active Bedside');
                        }}
                        className={`flex-1 py-3 px-4 font-extrabold text-xs sm:text-sm tracking-wide rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${
                            mainTab === 'bedside'
                            ? 'bg-white text-slate-900 shadow-md border-b-0'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <FaUserMd size={14} className={mainTab === 'bedside' ? 'text-indigo-500' : ''} />
                        Bedside Consults
                    </button>
                </div>

                {/* Sub-tabs corresponding to current Primary Module */}
                <div className="mb-6 flex flex-wrap gap-2 border-b border-slate-200 pb-px">
                    {mainTab === 'admissions' ? (
                        <>
                            {[
                                { status: 'Unassigned', label: 'Unassigned Admissions' },
                                { status: 'Pending Handovers', label: 'Incoming Handovers' },
                                { status: 'In-Progress', label: 'Active Admitted' },
                                { status: 'Transferred Out', label: 'Transferred Out' },
                                { status: 'Discharged', label: 'Discharged / Archived' }
                            ].map((sub) => (
                                <button
                                    key={sub.status}
                                    onClick={() => setActiveStatus(sub.status)}
                                    className={`px-5 py-3 font-bold text-xs sm:text-sm tracking-wide transition-all border-b-2 -mb-px ${
                                        activeStatus === sub.status 
                                        ? 'border-emerald-500 text-emerald-600 bg-emerald-50/10' 
                                        : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                                    }`}
                                >
                                    {sub.label}
                                </button>
                            ))}
                        </>
                    ) : (
                        <>
                            {[
                                { status: 'Pending Bedside', label: 'Pending Consult Requests' },
                                { status: 'Active Bedside', label: 'Active Consultations' },
                                { status: 'Completed', label: 'Completed Consults' }
                            ].map((sub) => (
                                <button
                                    key={sub.status}
                                    onClick={() => setActiveStatus(sub.status)}
                                    className={`px-5 py-3 font-bold text-xs sm:text-sm tracking-wide transition-all border-b-2 -mb-px ${
                                        activeStatus === sub.status 
                                        ? 'border-indigo-500 text-indigo-600 bg-indigo-50/10' 
                                        : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                                    }`}
                                >
                                    {sub.label}
                                </button>
                            ))}
                        </>
                    )}
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
                            <h3 className="text-base font-bold text-slate-700">No {activeStatus} Cases Found</h3>
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
                                                    {cs.bedNumber ? `Bed: ${cs.bedNumber} (${cs.wardName || "General"})` : (cs.bedBookingType || "General-Bed")}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center" onClick={(e) => e.stopPropagation()}>
                                                    {activeStatus === 'Unassigned' ? (
                                                        <button 
                                                            onClick={() => handleSelfAssign(cs._id)}
                                                            disabled={actionLoading}
                                                            className="px-3 py-1.5 bg-[#08B36A] hover:bg-[#079d5c] text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                                                        >
                                                            Self Assign
                                                        </button>
                                                    ) : activeStatus === 'Pending Handovers' ? (
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button 
                                                                onClick={() => handleAcceptTransfer(cs._id)}
                                                                disabled={actionLoading}
                                                                className="px-3 py-1.5 bg-[#08B36A] hover:bg-[#079d5c] text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                                                            >
                                                                Accept
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
                    onSelfAssign={handleSelfAssign}
                    onAddDoctorClick={() => {
                        resetAssignmentStates();
                        setIsAssignDoctorOpen(true);
                    }}
                    onDischargeClick={() => {
                        setDischargeForm({
                            chiefComplaints: '',
                            diagnosis: '',
                            advisedInvestigations: '',
                            adviceGiven: '',
                            specialInstructions: '',
                            nextAppointment: '',
                            clinicalNotes: '',
                            dateOfSurgery: '',
                            conditionDuringAdmission: '',
                            conditionDuringDischarge: ''
                        });
                        setClinicalReports([]); 
                        setStagedMedicines([]);
                        setPrescriptionSource('discharge');
                        setIsDischargeOpen(true);
                    }}
                    onAcceptTransfer={activeStatus === 'Pending Bedside' ? (caseId) => handleRespondBedside(caseId, 'Accepted') : handleAcceptTransfer}
                    onRejectTransfer={activeStatus === 'Pending Bedside' ? (caseId, reason) => handleRespondBedside(caseId, 'Rejected', reason) : handleRejectTransfer}
                    activeStatus={activeStatus}
                    onFeedbackClick={() => {
                        // Resets feedback state structure on opening
                        setFeedbackForm({
                            observation: '',
                            patientCondition: 'Recovering',
                            priorityRating: 'Routine',
                            recommendedMedicines: []
                        });
                        setIsFeedbackOpen(true);
                    }}
                    onStartBedsideShift={handleStartBedsideShift}
                    onCompleteBedsideShift={(caseId) => {
                        setPrescriptionSource('bedside'); // Opens the standard Checkout prescription
                        setIsPrescriptionOpen(true);
                    }}
                    // Ward round interactions for Primary Attending Doctor
                    isMainDoctorRoundActive={activeMainRoundCaseId === caseDetails?._id}
                    onStartMainDoctorRound={handleStartMainDoctorRound}
                    // Stay Medications handlers mapped to open medication modal selector
                    onAddStayMedicationTrigger={handleAddStayMedicationTrigger}
                    onStopActiveMedication={handleStopActiveMedication}
                    medicationActionLoading={medicationActionLoading}
                    collaborativeMeds={collaborativeMeds} // Binds specialist recommendations list inside CaseDetailsModal
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
                    onClose={() => {
                        setIsDischargeOpen(false);
                        setClinicalReports([]);
                    }}
                    dischargeForm={dischargeForm}
                    setDischargeForm={setDischargeForm}
                    onAddMedicineDetail={() => setIsPrescriptionOpen(true)}
                    clinicalReports={clinicalReports}
                    setClinicalReports={setClinicalReports}
                    addedMedicinesCount={stagedMedicines.length}
                    onDirectSubmit={handleDischargeSubmitDirect}
                />

                <PrescriptionModal 
                    isOpen={isPrescriptionOpen}
                    onClose={handleClosePrescription}
                    medicinesList={medicinesList}
                    actionLoading={actionLoading}
                    onSubmit={handleProcessPrescriptionSubmit}
                    collaborativeMeds={collaborativeMeds} // Binds specialist recommendations list
                    prescriptionSource={prescriptionSource} // Dynamically filters stay vs home pool
                />

                <BedsideFeedbackModal 
                    isOpen={isFeedbackOpen}
                    onClose={() => setIsFeedbackOpen(false)}
                    feedbackForm={feedbackForm}
                    setFeedbackForm={setFeedbackForm}
                    actionLoading={actionLoading}
                    onSubmit={handleFeedbackSubmit}
                    onAddMedicineTrigger={() => {
                        setPrescriptionSource('bedside-feedback');
                        setIsPrescriptionOpen(true);
                    }}
                    isMainDoctor={isMainDoctor}
                />

                <DigitalPrescriptionTemplate 
                    isOpen={isPrescriptionPreviewOpen}
                    onClose={() => setIsPrescriptionPreviewOpen(false)}
                    data={prescriptionPreviewData}
                    isDischargeFlow={prescriptionSource === 'discharge'}
                    onCompleteDischarge={handleFinalizeDischarge}
                    isBedsideFlow={prescriptionSource === 'bedside'}
                    onCompleteBedside={handleFinalizeBedsideShift}
                    dischargeForm={dischargeForm}
                    medicines={stagedMedicines}
                    clinicalReports={clinicalReports}
                />

            </div>
        </div>
    );

    // Helper to format payload data for preview
    function previewPayloadDataForTemplate() {
        const activePatientObj = caseDetails?.patients?.[0] || {};
        return {
            _id: selectedCaseId || caseDetails?._id, 
            appointmentId: caseDetails?.bookingId || "N/A",
            date: caseDetails?.createdAt ? new Date(caseDetails.createdAt).toLocaleDateString('en-GB') : "XX/XX/XXXX",
            time: caseDetails?.createdAt ? new Date(caseDetails.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : "XX:XX",
            patientName: activePatientObj.patientName || caseDetails?.userId?.name || "N/A",
            gender: activePatientObj.gender || caseDetails?.userId?.gender || "N/A",
            age: activePatientObj.patientAge || caseDetails?.userId?.age || "N/A",
            address: caseDetails?.address?.addressType || "N/A",
            chiefComplaints: dischargeForm.chiefComplaints || caseDetails?.chiefComplaints || "N/A",
            diagnosis: dischargeForm.diagnosis || "",
            medicines: stagedMedicines.map(m => ({
                name: m.name,
                dose: m.dosage,
                time: m.frequency,
                duration: m.duration
            })),
            investigations: dischargeForm.advisedInvestigations || "",
            advice: dischargeForm.adviceGiven || "",
            specialInstructions: dischargeForm.specialInstructions || "",
            nextAppointment: dischargeForm.nextAppointment || "",
            
            dateOfAdmission: caseDetails?.startDate ? new Date(caseDetails.startDate).toLocaleDateString('en-GB') : "N/A",
            department: caseDetails?.doctorId?.speciality || "Department of Medicine, Unit - 1",
            dateOfDischarge: new Date().toLocaleDateString('en-GB'),
            dateOfSurgery: dischargeForm.dateOfSurgery || "",
            insuranceStatus: caseDetails?.hasInsurance ? "Verified (Cashless)" : "N/A",
            paymentStatus: caseDetails?.paymentStatus || "Paid",
            paymentType: caseDetails?.paymentMethod || "UPI",
            conditionDuringAdmission: dischargeForm.conditionDuringAdmission || "",
            conditionDuringDischarge: dischargeForm.conditionDuringDischarge || "",

            // Dynamic properties enhanced with comprehensive fallbacks aligning with image
            hospitalName: caseDetails?.hospitalId?.name || caseDetails?.hospitalName || (typeof caseDetails?.hospitalId === 'object' ? caseDetails.hospitalId?.name : null) || "omninos hospital",
            hospitalAddress: caseDetails?.hospitalId?.address || caseDetails?.hospitalAddress || (typeof caseDetails?.hospitalId === 'object' ? caseDetails.hospitalId?.address : null) || "Tdi City Mohali Punjab",
            hospitalLogo: caseDetails?.hospitalId?.logo 
                ? getImageUrl(caseDetails.hospitalId.logo) 
                : (caseDetails?.hospitalId?.image 
                    ? getImageUrl(caseDetails.hospitalId.image) 
                    : (caseDetails?.hospitalId?.profilePic 
                        ? getImageUrl(caseDetails.hospitalId.profilePic) 
                        : (caseDetails?.hospitalLogo 
                            ? getImageUrl(caseDetails.hospitalLogo) 
                            : null))),
            mainDoctorName: caseDetails?.doctorId?.name || "Lakshay Ravat",
            mainDoctorQualification: caseDetails?.doctorId?.qualification || "MBBS, MD",
            mainDoctorTitle: caseDetails?.doctorId?.title || "Professor & Head: Department of Cardiologist",
            bedsideCareTeam: caseDetails?.bedsideCareTeam || [],
            clinicalLogs: caseDetails?.clinicalLogs || []
        };
    }
}