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
        conditionDuringDischarge: '',
        bp: '',
        pulse: '',
        temp: '',
        spo2: ''
    });

    const [isPrescriptionOpen, setIsPrescriptionOpen] = useState(false);
    const [medicinesList, setMedicinesList] = useState([]);

    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
    const [feedbackForm, setFeedbackForm] = useState({
        observation: '',
        patientCondition: 'Recovering',
        priorityRating: 'Routine',
        bp: '',
        pulse: '',
        temp: '',
        spo2: '',
        recommendedMedicines: []
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

    const handleStartMainDoctorRound = (caseId) => {
        setActiveMainRoundCaseId(caseId);
        alert("Attending physician ward round started. You can now log observations.");
    };

    const handleAddStayMedicationTrigger = () => {
        setPrescriptionSource('stay');
        setIsPrescriptionOpen(true);
    };

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

    const handleFeedbackSubmit = async (formData) => {
        const activeForm = formData || feedbackForm;

        if (!activeForm.observation) {
            alert("Observation is required.");
            return;
        }
        try {
            setActionLoading(true);
            const currentDoctorId = getDoctorIdFromToken();
            const isMainDoctor = caseDetails?.doctorId?._id === currentDoctorId || caseDetails?.doctorId === currentDoctorId;

            const bp = String(activeForm.vitals?.bp || activeForm.bp || "").trim();
            const pulse = String(activeForm.vitals?.pulse || activeForm.pulse || "").trim();
            const temp = String(activeForm.vitals?.temp || activeForm.temp || "").trim();
            const spo2 = String(activeForm.vitals?.spo2 || activeForm.spo2 || "").trim();
            const vitalsPayload = { bp, pulse, temp, spo2 };

            if (isMainDoctor) {
                let priorityEnum = activeForm.priorityRating || "Routine";
                if (priorityEnum === 'Most Urgent' || priorityEnum === 'Emergency') {
                    priorityEnum = 'Critical';
                }

                const body = {
                    appointmentId: selectedCaseId,
                    observation: activeForm.observation,
                    patientCondition: activeForm.patientCondition,
                    priorityRating: priorityEnum,
                    vitals: vitalsPayload,
                    bp,
                    pulse,
                    temp,
                    spo2
                };

                const response = await HospitalDoctorAPI.addClinicalLog(body);
                if (response.success) {
                    alert(response.message || "Clinical observation log recorded successfully.");
                    
                    setDischargeForm(prev => ({
                        ...prev,
                        clinicalNotes: prev.clinicalNotes 
                            ? `${prev.clinicalNotes}\n[Round Update - ${activeForm.patientCondition}]: ${activeForm.observation}`
                            : `[Round Update - ${activeForm.patientCondition}]: ${activeForm.observation}`
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
                const body = {
                    appointmentId: selectedCaseId,
                    observation: activeForm.observation,
                    patientCondition: activeForm.patientCondition,
                    priorityRating: activeForm.priorityRating,
                    vitals: vitalsPayload,
                    bp,
                    pulse,
                    temp,
                    spo2,
                    recommendedMedicines: activeForm.recommendedMedicines || []
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
            formData.append('diagnosis', dischargeForm.diagnosis || "");
            formData.append('investigation', dischargeForm.advisedInvestigations || "");
            formData.append('treatmentResult', dischargeForm.clinicalNotes || "");
            formData.append('dischargeNote', dischargeForm.specialInstructions || "");

            if (dischargeForm.bp) formData.append('bp', dischargeForm.bp);
            if (dischargeForm.pulse) formData.append('pulse', dischargeForm.pulse);
            if (dischargeForm.temp) formData.append('temp', dischargeForm.temp);
            if (dischargeForm.spo2) formData.append('spo2', dischargeForm.spo2);

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

            if (prescriptionSource === 'stay') {
                for (const med of finalMedicines) {
                    await HospitalDoctorAPI.addActiveMedication({
                        appointmentId: selectedCaseId,
                        medicineName: med.name || med.medicineName,
                        dosage: med.dosage || med.dose || "1-0-0",
                        frequency: med.frequency || med.time || "Once Daily",
                        instructions: med.instructions || ""
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

            if (prescriptionSource === 'bedside-feedback') {
                setFeedbackForm(prev => ({
                    ...prev,
                    recommendedMedicines: [
                        ...(prev.recommendedMedicines || []),
                        ...finalMedicines.map(m => ({
                            name: m.name || m.medicineName,
                            dosage: m.dosage || m.dose || "",
                            frequency: m.frequency || m.time || "",
                            duration: m.duration || "",
                            instructions: m.instructions || "",
                            type: "Active-Stay"
                        }))
                    ]
                }));
                setIsPrescriptionOpen(false);
                return;
            }

            if (prescriptionSource === 'bedside') {
                const body = {
                    appointmentId: selectedCaseId,
                    observation: feedbackForm.observation || "",
                    patientCondition: feedbackForm.patientCondition || "Recovering",
                    priorityRating: feedbackForm.priorityRating || "Routine",
                    recommendedMedicines: finalMedicines.map(m => ({
                        name: m.name || m.medicineName,
                        dosage: m.dosage || m.dose || "",
                        frequency: m.frequency || m.time || "",
                        duration: m.duration || "",
                        instructions: m.instructions || "",
                        type: "Discharge-Home"
                    }))
                };

                await HospitalDoctorAPI.submitBedsideFeedback(body);
                const completeRes = await HospitalDoctorAPI.completeBedsideShift({ appointmentId: selectedCaseId });
                if (completeRes.success) {
                    alert("Checkout medications registered and bedside specialist shift completed successfully!");
                    setIsPrescriptionOpen(false);
                    setIsDetailsOpen(false);
                    fetchAdmissionCases();
                }
                return;
            }

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

            const activePatientObj = caseDetails?.patientDetails || caseDetails?.patients?.[0] || {};
            const activeDoctorObj = caseDetails?.doctorId || caseDetails?.assignedDoctor || {};
            const activeHospitalObj = caseDetails?.hospitalId || caseDetails?.hospitalDetails || {};
            
            const previewPayload = {
                header: {
                    hospitalName: activeHospitalObj.name || activeHospitalObj.hospitalName || caseDetails?.hospitalName || "",
                    hospitalAddress: activeHospitalObj.address || activeHospitalObj.hospitalAddress || caseDetails?.hospitalAddress || "",
                    hospitalLogo: activeHospitalObj.logo || activeHospitalObj.image || activeHospitalObj.profilePic || caseDetails?.hospitalLogo || null,
                    leadDoctor: {
                        name: activeDoctorObj.name || "",
                        title: activeDoctorObj.title || activeDoctorObj.speciality || "",
                        qualification: activeDoctorObj.qualification || ""
                    },
                    collaborativeDoctors: (caseDetails?.bedsideCareTeam || []).map(team => ({
                        name: team.name || team.doctorId?.name || "",
                        department: team.department || team.doctorId?.speciality || ""
                    }))
                },
                patientDetails: {
                    appointmentId: caseDetails?.bookingId || caseDetails?.appointmentId || "N/A",
                    name: activePatientObj.patientName || activePatientObj.name || caseDetails?.userId?.name || caseDetails?.bookedBy?.name || "N/A",
                    address: caseDetails?.address?.addressType || caseDetails?.address?.fullAddress || caseDetails?.address || "N/A",
                    gender: activePatientObj.gender || caseDetails?.userId?.gender || "N/A",
                    age: activePatientObj.age !== undefined ? activePatientObj.age : (activePatientObj.patientAge !== undefined ? activePatientObj.patientAge : caseDetails?.userId?.age || "N/A"),
                    bloodGroup: activePatientObj.bloodGroup || "N/A",
                    dateOfAdmission: caseDetails?.startDate ? new Date(caseDetails.startDate).toLocaleDateString('en-GB') : "N/A",
                    department: activeDoctorObj.speciality || caseDetails?.bedDetails?.wardType || "Department of Medicine",
                    dateOfDischarge: new Date().toLocaleDateString('en-GB'),
                    dateOfSurgery: dischargeForm.dateOfSurgery || "N/A",
                    insuranceStatus: caseDetails?.insurance?.hasInsurance ? "Verified (Cashless)" : (caseDetails?.hasInsurance ? "Verified (Cashless)" : "N/A"),
                    paymentStatus: caseDetails?.billing?.paymentStatus || caseDetails?.paymentStatus || "Paid",
                    paymentType: caseDetails?.billing?.paymentMethod || caseDetails?.paymentMethod || "UPI",
                    conditionDuringAdmission: dischargeForm.conditionDuringAdmission || "N/A",
                    conditionDuringDischarge: dischargeForm.conditionDuringDischarge || "N/A",
                    chiefComplaints: dischargeForm.chiefComplaints || caseDetails?.chiefComplaints || "N/A",
                    diagnosis: diagnosisText || "N/A"
                },
                clinicalNotes: dischargeForm.clinicalNotes || "N/A",
                medications: finalMedicines.map((m, idx) => ({
                    sNo: String(idx + 1).padStart(2, '0'),
                    medicineName: m.name || m.medicineName,
                    dose: m.dosage || m.dose,
                    time: m.frequency || m.time,
                    duration: m.duration
                })),
                followUp: {
                    adviseInvestigation: dischargeForm.advisedInvestigations || "",
                    adviceGiven: dischargeForm.adviceGiven || "",
                    anySpecialInstructionGiven: dischargeForm.specialInstructions || "",
                    nextAppointment: dischargeForm.nextAppointment || ""
                },
                vitals: {
                    bp: dischargeForm.bp || "",
                    pulse: dischargeForm.pulse || "",
                    temp: dischargeForm.temp || "",
                    spo2: dischargeForm.spo2 || ""
                }
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
            return true;
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
                                        const patient = cs.patientDetails || cs.patients?.[0] || {};
                                        const patientName = patient.patientName || patient.name || cs.userId?.name || cs.bookedBy?.name || "Unknown Patient";
                                        const patientAge = patient.age !== undefined ? patient.age : (patient.patientAge !== undefined ? patient.patientAge : cs.userId?.age);
                                        const patientGender = patient.gender || cs.userId?.gender || "";

                                        const bedNumber = cs.bedDetails?.bedNumber || cs.bedNumber;
                                        const wardName = cs.bedDetails?.wardName || cs.wardName;

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
                                                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs">
                                                            {patientName.charAt(0) || <FaUser size={13} />}
                                                        </div>
                                                        <div>
                                                            <span className="font-bold text-sm text-slate-800 block">{patientName}</span>
                                                            <span className="text-xs text-slate-500">
                                                                {patientAge !== undefined && patientAge !== null ? `${patientAge} Yrs` : ''} 
                                                                {patientAge !== undefined && patientGender ? ' • ' : ''}
                                                                {patientGender}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex px-2.5 py-1 text-xs font-bold rounded-full bg-red-50 text-red-700 border border-red-100">
                                                        {cs.triageLevel || "Emergency"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                                                    {bedNumber ? `Bed: ${bedNumber} (${wardName || "General"})` : (cs.bedBookingType || "General-Bed")}
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
                            conditionDuringDischarge: '',
                            bp: '',
                            pulse: '',
                            temp: '',
                            spo2: ''
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
                        setFeedbackForm({
                            observation: '',
                            patientCondition: 'Recovering',
                            priorityRating: 'Routine',
                            bp: '',
                            pulse: '',
                            temp: '',
                            spo2: '',
                            recommendedMedicines: []
                        });
                        setIsFeedbackOpen(true);
                    }}
                    onStartBedsideShift={handleStartBedsideShift}
                    onCompleteBedsideShift={(caseId) => {
                        setPrescriptionSource('bedside'); 
                        setIsPrescriptionOpen(true);
                    }}
                    isMainDoctorRoundActive={activeMainRoundCaseId === caseDetails?._id}
                    onStartMainDoctorRound={handleStartMainDoctorRound}
                    onAddStayMedicationTrigger={handleAddStayMedicationTrigger}
                    onStopActiveMedication={handleStopActiveMedication}
                    medicationActionLoading={medicationActionLoading}
                    collaborativeMeds={collaborativeMeds}
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
                    collaborativeMeds={collaborativeMeds}
                    prescriptionSource={prescriptionSource}
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
}