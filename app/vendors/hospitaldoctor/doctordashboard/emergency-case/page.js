'use client';
import HospitalDoctorAPI from '@/app/services/HospitalDoctorAPI';
import React, { useState, useEffect } from 'react';
import { 
    FaUser, FaHeartbeat, FaSpinner, FaExclamationTriangle, FaCheck, FaTimes, FaAmbulance, FaUserMd
} from 'react-icons/fa';

import CaseDetailsModal from './component/CaseDetailsModal';
import AssignDoctorModal from './component/AssignDoctorModal';
import DischargeModal from './component/DischargeModal';
import PrescriptionModal from './component/PrescriptionModal';
import BedsideFeedbackModal from './component/BedsideFeedbackModal';
import DigitalPrescriptionTemplate from './component/DigitalPrescriptionTemplate';

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

    // Primary Module and Sub-tab States
    const [mainTab, setMainTab] = useState('emergency'); // 'emergency' | 'bedside'
    const [activeStatus, setActiveStatus] = useState('Pending Handovers'); 

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

    const [prescriptionSource, setPrescriptionSource] = useState('discharge'); // 'discharge' | 'stay' | 'bedside-feedback'

    const [isDischargeOpen, setIsDischargeOpen] = useState(false);
    const [clinicalReports, setClinicalReports] = useState([]);
    const [stagedMedicines, setStagedMedicines] = useState([]);
    const [dischargeForm, setDischargeForm] = useState({
        appointmentId: '',
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

    // Standard tab mapping for HospitalDoctorAPI.getCases
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
            } else if (activeStatus === 'Transferred Out') {
                tabParam = 'transferred-out';
            }
            
            const response = await HospitalDoctorAPI.getCases(tabParam);
            if (response && response.success) {
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
    }, [activeStatus, mainTab]);

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

            try {
                const poolRes = await HospitalDoctorAPI.getBedsideMedications(caseId);
                if (poolRes && poolRes.success) {
                    setCollaborativeMeds(poolRes.data || []);
                }
            } catch (err) {
                console.warn("Collaborative medications notice:", err);
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
                if (action === 'Accepted') {
                    setActiveStatus('Active Bedside');
                }
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

    const handleStartMainDoctorRound = (caseId) => {
        setActiveMainRoundCaseId(caseId);
        alert("Attending physician ward round started. You can now log observations.");
    };

    const handleAddStayMedicationTrigger = () => {
        setPrescriptionSource('stay');
        setIsPrescriptionOpen(true);
    };

    // Bedside specialist triggers recommendation for in-patient stay medications only
    const handleAddBedsideMedicineTrigger = () => {
        setPrescriptionSource('bedside-feedback');
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
                fetchEmergencyCases();
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

    const handleFeedbackSubmit = async (formData) => {
        const activeForm = formData || feedbackForm;

        if (!activeForm.observation) {
            alert("Observation is required.");
            return;
        }
        try {
            setActionLoading(true);

            const bp = String(activeForm.vitals?.bp || activeForm.bp || "").trim();
            const pulse = String(activeForm.vitals?.pulse || activeForm.pulse || "").trim();
            const temp = String(activeForm.vitals?.temp || activeForm.temp || "").trim();
            const spo2 = String(activeForm.vitals?.spo2 || activeForm.spo2 || "").trim();

            const vitalsPayload = { bp, pulse, temp, spo2 };

            const myDoctorId = getDoctorIdFromToken();
            const doctorObj = caseDetails?.primaryDoctor || caseDetails?.doctorId;
            const isMainDoctor = (doctorObj?._id === myDoctorId) || (doctorObj === myDoctorId);

            let response;
            if (isMainDoctor && mainTab === 'emergency') {
                response = await HospitalDoctorAPI.addClinicalLog({
                    appointmentId: selectedCaseId,
                    observation: activeForm.observation,
                    patientCondition: activeForm.patientCondition,
                    priorityRating: activeForm.priorityRating,
                    vitals: vitalsPayload,
                    bp,
                    pulse,
                    temp,
                    spo2
                });
            } else {
                response = await HospitalDoctorAPI.submitBedsideFeedback({
                    appointmentId: selectedCaseId,
                    observation: activeForm.observation,
                    patientCondition: activeForm.patientCondition,
                    priorityRating: activeForm.priorityRating,
                    vitals: vitalsPayload,
                    bp,
                    pulse,
                    temp,
                    spo2,
                    recommendedMedicines: (activeForm.recommendedMedicines || []).map(m => ({
                        name: m.name || m.medicineName,
                        dosage: m.dosage || m.dose || "1 Tab",
                        frequency: m.frequency || m.time || "Once Daily",
                        duration: m.duration || "5 Days",
                        instructions: m.instructions || "",
                        type: "Active-Stay"
                    }))
                });
            }

            if (response.success) {
                alert("Clinical observation feedback submitted successfully!");
                setIsFeedbackOpen(false);
                if (selectedCaseId) {
                    const detailRes = await HospitalDoctorAPI.getCaseDetails(selectedCaseId);
                    if (detailRes.success) {
                        setCaseDetails(detailRes.data);
                    }
                    const poolRes = await HospitalDoctorAPI.getBedsideMedications(selectedCaseId);
                    if (poolRes && poolRes.success) {
                        setCollaborativeMeds(poolRes.data || []);
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

            const activeTargetId = selectedCaseId || caseDetails?._id || dischargeForm.appointmentId;

            const formData = new FormData();
            formData.append('appointmentId', String(activeTargetId));
            formData.append('diagnosis', dischargeForm.diagnosis || "Acute Emergency Care");
            formData.append('investigation', dischargeForm.advisedInvestigations || "CBC, LFT, KFT normal. Vitals stable.");
            formData.append('treatmentResult', dischargeForm.clinicalNotes || "Patient recovered and vitals stabilized.");
            formData.append('dischargeNote', dischargeForm.specialInstructions || "Avoid oily food and take rest for 3 days.");

            if (dischargeForm.dateOfSurgery && dischargeForm.dateOfSurgery !== 'N/A' && dischargeForm.dateOfSurgery !== 'undefined') {
                formData.append('dateOfSurgery', String(dischargeForm.dateOfSurgery).trim());
            } else {
                formData.append('dateOfSurgery', '');
            }

            formData.append('conditionDuringAdmission', dischargeForm.conditionDuringAdmission || "Stable");
            formData.append('conditionDuringDischarge', dischargeForm.conditionDuringDischarge || "Recovered & Clinically Stable");

            const vitalsPayload = {
                bp: dischargeForm.bp || "120/80",
                pulse: dischargeForm.pulse || "74",
                temp: dischargeForm.temp || "98.6",
                spo2: dischargeForm.spo2 || "99"
            };
            formData.append('vitals', JSON.stringify(vitalsPayload));

            clinicalReports.forEach((file) => {
                if (file && (file instanceof File || file instanceof Blob)) {
                    formData.append('clinicalReports', file);
                }
            });

            const response = await HospitalDoctorAPI.submitDischargeSummary(formData);
            if (response && (response.success || response._id || response.data)) {
                const resData = response.data || response;
                const refundAmount = resData?.refundDueToUser || 0;
                const pendingBalance = resData?.pendingDepartureBalance || 0;

                if (refundAmount > 0) {
                    alert(`🟢 Discharge Complete: ₹${refundAmount} has been initiated for refund to patient's payment method.`);
                } else if (pendingBalance > 0) {
                    alert(`🔴 Discharge Complete: Please collect ₹${pendingBalance} at hospital cash counter.`);
                } else {
                    alert("🟢 " + (response.message || "Discharge summary, clinical files, and final PDF summary recorded successfully."));
                }

                setIsDischargeOpen(false);
                setIsDetailsOpen(false);
                setClinicalReports([]);
                setStagedMedicines([]);
                setActiveStatus('Discharged');
                fetchEmergencyCases();
            }
        } catch (err) {
            alert(getErrorMessage(err));
        } finally {
            setActionLoading(false);
        }
    };

    const handleFinalizeDischarge = async (resData) => {
        try {
            setActionLoading(true);
            setIsPrescriptionPreviewOpen(false);
            setIsDischargeOpen(false);
            setIsDetailsOpen(false);
            setActiveStatus('Discharged');
            setClinicalReports([]);
            setStagedMedicines([]);
            fetchEmergencyCases();
        } catch (err) {
            alert(getErrorMessage(err));
        } finally {
            setActionLoading(false);
        }
    };

    // Direct shift completion for bedside specialist without discharge flow
    const handleFinalizeBedsideShift = async (caseId) => {
        const targetId = caseId || selectedCaseId;
        if (!targetId) return;

        try {
            setActionLoading(true);
            const response = await HospitalDoctorAPI.completeBedsideShift({ appointmentId: targetId });
            if (response && (response.success || response.message)) {
                alert("Specialist bedside shift completed successfully.");
                setIsDetailsOpen(false);
                fetchEmergencyCases();
            }
        } catch (err) {
            alert(getErrorMessage(err));
        } finally {
            setActionLoading(false);
        }
    };

    // Unified Prescription / Stay Medications Handler
    const handleProcessPrescriptionSubmit = async (finalMedicines, dietPlanFile) => {
        try {
            setActionLoading(true);
            const genuineMongoId = selectedCaseId || caseDetails?._id;

            // 1. In-Patient Stay Medication addition (Calls addActiveMedication directly without PDF)
            if (prescriptionSource === 'stay') {
                for (const med of finalMedicines) {
                    await HospitalDoctorAPI.addActiveMedication({
                        appointmentId: genuineMongoId,
                        medicineName: med.name || med.medicineName,
                        dosage: med.dosage || med.dose || "1 Tab",
                        frequency: med.frequency || med.time || "Once Daily",
                        instructions: med.instructions || ""
                    });
                }
                alert("In-patient stay medication(s) added successfully to chart.");
                
                if (genuineMongoId) {
                    const detailRes = await HospitalDoctorAPI.getCaseDetails(genuineMongoId);
                    if (detailRes.success) {
                        setCaseDetails(detailRes.data);
                    }
                }
                fetchEmergencyCases();
                setIsPrescriptionOpen(false);
                return;
            }

            // 2. Bedside Feedback Recommended Medicines
            if (prescriptionSource === 'bedside-feedback') {
                setFeedbackForm(prev => ({
                    ...prev,
                    recommendedMedicines: [
                        ...(prev.recommendedMedicines || []),
                        ...finalMedicines.map(m => ({
                            name: m.name || m.medicineName,
                            dosage: m.dosage || m.dose || "1 Tab",
                            frequency: m.frequency || m.time || "Once Daily",
                            duration: m.duration || "5 Days",
                            instructions: m.instructions || "",
                            type: "Active-Stay"
                        }))
                    ]
                }));
                setIsPrescriptionOpen(false);
                setIsFeedbackOpen(true);
                return;
            }

            // 3. Discharge Prescription Flow (Main Doctor Only)
            setStagedMedicines(finalMedicines);

            const diagnosisText = dischargeForm.diagnosis || "Acute Emergency Care";
            const diagnosisArray = [diagnosisText];

            const formData = new FormData();
            formData.append('appointmentId', genuineMongoId);
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
            const activeDoctorObj = caseDetails?.primaryDoctor || caseDetails?.doctorId || caseDetails?.assignedDoctor || {};
            const activeHospitalObj = caseDetails?.hospitalDetails || caseDetails?.hospitalId || {};

            const previewPayload = {
                _id: genuineMongoId, 
                appointmentId: genuineMongoId,
                bookingId: caseDetails?.bookingId || "N/A",
                date: new Date().toLocaleDateString('en-GB'),
                time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
                patientName: activePatientObj.patientName || activePatientObj.name || caseDetails?.bookedBy?.name || caseDetails?.userId?.name || "N/A",
                gender: activePatientObj.gender || caseDetails?.bookedBy?.gender || "N/A",
                age: activePatientObj.age !== undefined ? activePatientObj.age : (activePatientObj.patientAge !== undefined ? activePatientObj.patientAge : "N/A"),
                address: caseDetails?.hospitalDetails?.city || "N/A",
                chiefComplaints: dischargeForm.chiefComplaints || caseDetails?.bookingReason || caseDetails?.clinicalSummary?.chiefComplaint || "N/A",
                diagnosis: diagnosisText,
                medicines: finalMedicines.map(m => ({
                    name: m.name || m.medicineName,
                    dose: m.dosage || m.dose,
                    time: m.frequency || m.time,
                    duration: m.duration
                })),
                investigations: dischargeForm.advisedInvestigations || "",
                advice: dischargeForm.adviceGiven || "",
                specialInstructions: dischargeForm.specialInstructions || "",
                nextAppointment: dischargeForm.nextAppointment || "",
                
                dateOfAdmission: caseDetails?.startDate ? new Date(caseDetails.startDate).toLocaleDateString('en-GB') : "N/A",
                department: activeDoctorObj.speciality || "Department of Emergency Medicine",
                dateOfDischarge: new Date().toLocaleDateString('en-GB'),
                dateOfSurgery: dischargeForm.dateOfSurgery || "",
                insuranceStatus: caseDetails?.insurance?.hasInsurance ? "Verified (Cashless)" : "N/A",
                paymentStatus: caseDetails?.billing?.paymentStatus || caseDetails?.paymentStatus || "Paid",
                paymentType: caseDetails?.billing?.paymentMethod || caseDetails?.paymentMethod || "UPI",
                conditionDuringAdmission: dischargeForm.conditionDuringAdmission || "",
                conditionDuringDischarge: dischargeForm.conditionDuringDischarge || "",

                vitals: {
                    bp: dischargeForm.bp || "",
                    pulse: dischargeForm.pulse || "",
                    temp: dischargeForm.temp || "",
                    spo2: dischargeForm.spo2 || ""
                },

                hospitalName: activeHospitalObj.name || "Fortis Hospital Mohali",
                hospitalAddress: activeHospitalObj.fullAddress || activeHospitalObj.address || "Sector 62, Sahibzada Ajit Nagar, Punjab 160062",
                hospitalLogo: activeHospitalObj.logo ? getImageUrl(activeHospitalObj.logo) : null,
                mainDoctorName: activeDoctorObj.name || "Dr. Deepak Joshi",
                mainDoctorQualification: activeDoctorObj.qualification || "Professor & Head: Department of Medicine",
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

    // Strict Emergency category filter when on Emergency Desk
    const displayedCases = cases.filter(cs => {
        if (!cs) return false;

        if (mainTab === 'emergency') {
            const category = cs.caseCategory || cs.bookingType || (cs.ambulanceId ? "Emergency" : "Admission");
            if (category.toLowerCase() !== 'emergency') {
                return false;
            }
        }

        return true;
    });

    const activeMongoId = selectedCaseId || caseDetails?._id;

    return (
        <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 font-sans">
            <div className="max-w-7xl mx-auto animate-in fade-in duration-300">
                
                <div className="mb-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Emergency Operations Portal</h1>
                        <p className="text-slate-500 mt-1 text-sm">Real-time emergency triage queue, trauma care, and bedside consultations</p>
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

                {/* 🌟 Primary Module Navigation (Emergency Desk vs Bedside Consults) 🌟 */}
                <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-6 max-w-md border border-slate-200">
                    <button
                        onClick={() => {
                            setMainTab('emergency');
                            setActiveStatus('In-Progress');
                        }}
                        className={`flex-1 py-3 px-4 font-extrabold text-xs sm:text-sm tracking-wide rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${
                            mainTab === 'emergency'
                            ? 'bg-white text-slate-900 shadow-md border-b-0'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <FaAmbulance size={14} className={mainTab === 'emergency' ? 'text-rose-500' : ''} />
                        Emergency Desk
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

                {/* 🌟 Sub-tabs corresponding to current Primary Module 🌟 */}
                <div className="mb-6 flex flex-wrap gap-2 border-b border-slate-200 pb-px">
                    {mainTab === 'emergency' ? (
                        <>
                            {[
                                { status: 'Pending Handovers', label: 'Incoming Handovers' },
                                { status: 'In-Progress', label: 'Active Emergency' },
                                { status: 'Transferred Out', label: 'Transferred Out' },
                                { status: 'Discharged', label: 'Discharged / Archived' }
                            ].map((sub) => (
                                <button
                                    key={sub.status}
                                    onClick={() => setActiveStatus(sub.status)}
                                    className={`px-5 py-3 font-bold text-xs sm:text-sm tracking-wide transition-all border-b-2 -mb-px ${
                                        activeStatus === sub.status 
                                        ? 'border-rose-500 text-rose-600 bg-rose-50/10' 
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
                    ) : displayedCases.length === 0 ? (
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
                                        <th className="px-6 py-4 font-semibold">Location / Ward Unit</th>
                                        <th className="px-6 py-4 font-semibold text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {displayedCases.map((cs) => {
                                        const patient = cs.patientDetails || cs.patients?.[0] || {};
                                        const patientName = patient.patientName || patient.name || cs.userId?.name || cs.bookedBy?.name || "Unknown Patient";
                                        const patientAge = patient.age !== undefined ? patient.age : (patient.patientAge !== undefined ? patient.patientAge : cs.userId?.age || "N/A");
                                        const patientGender = patient.gender || cs.userId?.gender || "N/A";
                                        const bloodGroup = patient.bloodGroup || cs.bloodGroup;
                                        const reason = patient.reasonForVisit || cs.bookingReason;

                                        const bedNumber = cs.bedDetails?.bedNumber || cs.bedNumber;
                                        const wardName = cs.bedDetails?.wardName || cs.bedDetails?.ward?.name || cs.wardName;
                                        const pricePerDay = cs.bedDetails?.pricePerDay;

                                        return (
                                            <tr 
                                                key={cs._id}
                                                onClick={() => handleCaseClick(cs._id)}
                                                className="hover:bg-slate-50/50 cursor-pointer transition-colors duration-150"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="font-bold text-sm text-slate-900 block">{cs.bookingId}</span>
                                                    <span className="text-xs text-rose-600 font-bold uppercase tracking-wider">{cs.bookingType || "Emergency Transit"}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2.5">
                                                        {patient.profilePic ? (
                                                            <img 
                                                                src={getImageUrl(patient.profilePic)} 
                                                                alt={patientName} 
                                                                className="w-8 h-8 rounded-full object-cover border"
                                                            />
                                                        ) : (
                                                            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs">
                                                                {patientName.charAt(0) || <FaUser size={13} />}
                                                            </div>
                                                        )}
                                                        <div>
                                                            <span className="font-bold text-sm text-slate-800 block">{patientName}</span>
                                                            <span className="text-xs text-slate-500">
                                                                {patientAge} Yrs • {patientGender}
                                                                {bloodGroup && ` • Blood: ${bloodGroup}`}
                                                            </span>
                                                            {reason && (
                                                                <p className="text-[10px] text-slate-400 font-medium mt-0.5 truncate max-w-[180px]" title={reason}>
                                                                    "{reason}"
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex px-2.5 py-1 text-xs font-bold rounded-full bg-red-50 text-red-700 border border-red-100">
                                                        {cs.triageLevel || "Emergency"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                                                    <div>
                                                        <span className="text-slate-800 font-bold block">
                                                            {bedNumber ? `Bed: ${bedNumber}` : (cs.bedBookingType || "Emergency Ward")}
                                                        </span>
                                                        <span className="text-xs text-slate-500">
                                                            {wardName || "Emergency Trauma Unit"} {pricePerDay ? `• ₹${pricePerDay}/Day` : ''}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center" onClick={(e) => e.stopPropagation()}>
                                                    {activeStatus === 'Pending Handovers' ? (
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button 
                                                                onClick={() => handleAcceptTransfer(cs._id)}
                                                                disabled={actionLoading}
                                                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                                                            >
                                                                Accept
                                                            </button>
                                                             <button 
                                                                onClick={() => handleRejectTransfer(cs._id)}
                                                                disabled={actionLoading}
                                                                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                                                            >
                                                                Reject
                                                            </button> 
                                                        </div>
                                                    ) : activeStatus === 'Pending Bedside' ? (
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button 
                                                                onClick={() => handleRespondBedside(cs._id, 'Accepted')}
                                                                disabled={actionLoading}
                                                                className="px-3.5 py-1.5 bg-[#08B36A] hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1 shadow-sm cursor-pointer"
                                                            >
                                                                <FaCheck size={10} /> Accept Bedside
                                                            </button>
                                                             <button 
                                                                onClick={() => {
                                                                    const reason = prompt("Enter Decline Reason:") || "Engaged in another clinical schedule.";
                                                                    handleRespondBedside(cs._id, 'Rejected', reason);
                                                                }}
                                                                disabled={actionLoading}
                                                                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1 shadow-sm cursor-pointer"
                                                            >
                                                                <FaTimes size={10} /> Decline
                                                            </button> 
                                                        </div>
                                                    ) : (
                                                        <button 
                                                            onClick={() => handleCaseClick(cs._id)}
                                                            className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
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
                    onSelfAssign={null}
                    onAddDoctorClick={() => {
                        resetAssignmentStates();
                        setIsAssignDoctorOpen(true);
                    }}
                    onDischargeClick={() => {
                        setDischargeForm({
                            appointmentId: caseDetails?._id,
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
                    onCompleteBedsideShift={handleFinalizeBedsideShift}
                    onAddBedsideMedicineTrigger={handleAddBedsideMedicineTrigger}
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
                    onClose={() => setIsDischargeOpen(false)}
                    dischargeForm={dischargeForm}
                    setDischargeForm={setDischargeForm}
                    onAddMedicineDetail={() => {
                        setIsDischargeOpen(false); 
                        setIsPrescriptionOpen(true); 
                    }}
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
                    prescriptionSource={prescriptionSource}
                    collaborativeMeds={collaborativeMeds}
                />

                <BedsideFeedbackModal 
                    isOpen={isFeedbackOpen}
                    onClose={() => setIsFeedbackOpen(false)}
                    feedbackForm={feedbackForm}
                    setFeedbackForm={setFeedbackForm}
                    actionLoading={actionLoading}
                    onSubmit={handleFeedbackSubmit}
                    isMainDoctor={true}
                    onAddMedicineTrigger={() => {
                        setPrescriptionSource('bedside-feedback');
                        setIsPrescriptionOpen(true);
                    }}
                />

                <DigitalPrescriptionTemplate 
                    isOpen={isPrescriptionPreviewOpen}
                    onClose={() => setIsPrescriptionPreviewOpen(false)}
                    data={prescriptionPreviewData}
                    appointmentId={activeMongoId}
                    isDischargeFlow={prescriptionSource === 'discharge'}
                    onCompleteDischarge={handleFinalizeDischarge}
                    dischargeForm={{
                        ...dischargeForm,
                        appointmentId: activeMongoId
                    }}
                    medicines={stagedMedicines}
                    clinicalReports={clinicalReports}
                />

            </div>
        </div>
    );
}