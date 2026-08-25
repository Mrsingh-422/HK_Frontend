'use client';
import React, { useState, useEffect, useRef } from 'react';
import { IoCloseOutline } from 'react-icons/io5';
import { FaSpinner } from 'react-icons/fa';
import DoctorAPI from '@/app/services/DoctorAPI'; 

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
const DEFAULT_CLINIC_LOGO = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2308B36A'%3E%3Cpath d='M19 10.5h-5.5V5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v5.5H5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5h5.5V19c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-5.5H19c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5z'/%3E%3C/svg%3E";

const resolvePayload = (obj) => {
    if (!obj) return {};
    if (obj.data && typeof obj.data === 'object' && !obj.data.patientInfo && !obj.data.medicines) {
        return resolvePayload(obj.data);
    }
    if (obj.success && obj.data && typeof obj.data === 'object') {
        return resolvePayload(obj.data);
    }
    return obj;
};

const getFormattedLogoUrl = (logoPath) => {
    if (!logoPath) return null;
    if (logoPath.startsWith("http://") || logoPath.startsWith("https://")) return logoPath;

    let cleanPath = logoPath.replace(/\\/g, '/');

    if (cleanPath.startsWith("public/")) {
        cleanPath = cleanPath.replace("public/", "");
    }
    const cleanBaseUrl = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
    const cleanPathFormatted = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
    return `${cleanBaseUrl}${cleanPathFormatted}`;
};

const findSignaturePath = (payload) => {
    if (!payload) return null;

    if (payload.signatureImage) return payload.signatureImage;
    if (payload.doctorSignature) return payload.doctorSignature;
    if (payload.signature) return payload.signature;

    if (payload.doctor && typeof payload.doctor === 'object') {
        if (payload.doctor.signatureImage) return payload.doctor.signatureImage;
        if (payload.doctor.signature) return payload.doctor.signature;
        if (payload.doctor.doctorSignature) return payload.doctor.doctorSignature;
    }

    if (payload.doctorInfo && typeof payload.doctorInfo === 'object') {
        if (payload.doctorInfo.signatureImage) return payload.doctorInfo.signatureImage;
        if (payload.doctorInfo.signature) return payload.doctorInfo.signature;
    }

    if (payload.appointment && typeof payload.appointment === 'object') {
        const nestedSig = findSignaturePath(payload.appointment);
        if (nestedSig) return nestedSig;
    }

    return null;
};

export default function DigitalPrescriptionTemplate({ isOpen, onClose, data, onEdit, onResend, onCompleteCase }) {
    const printAreaRef = useRef();
    const [doctorProfile, setDoctorProfile] = useState(null); 
    const [submitting, setSubmitting] = useState(false);
    const [sigError, setSigError] = useState(false); 

    useEffect(() => {
        if (isOpen) {
            setSigError(false);
        }
    }, [data, isOpen]);

    useEffect(() => {
        const fetchDoctorProfile = async () => {
            try {
                const response = await DoctorAPI.getProfile();
                if (response && response.success && response.data) {
                    setDoctorProfile(response.data);
                }
            } catch (err) {
                console.error("Failed to fetch doctor profile dynamically inside template:", err);
            }
        };

        if (isOpen) {
            fetchDoctorProfile();
        } else {
            setDoctorProfile(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const activePayload = resolvePayload(data);

    const patientInfo = activePayload.patientInfo || {
        name: activePayload.patientName || "N/A",
        age: activePayload.patientAge || "N/A",
        gender: activePayload.patientGender || "N/A",
        phone: activePayload.phone || "N/A",
        address: activePayload.address || activePayload.patientAddress || "N/A"
    };

    if (!patientInfo.address) {
        patientInfo.address = activePayload.address || activePayload.patientAddress || "N/A";
    }

    const clinicalDetails = activePayload.clinicalDetails || {
        diagnosis: activePayload.diagnosis || [],
        medicines: activePayload.medicines || [],
        symptoms: activePayload.additionalNotes || ""
    };

    const deliveryInfo = activePayload.deliveryInfo || {
        sentTime: activePayload.createdAt ? new Date(activePayload.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "",
        status: activePayload.status || "Delivered"
    };

    const medicines = clinicalDetails.medicines || [];
    const diagnosis = clinicalDetails.diagnosis || [];
    const symptomsAdvice = clinicalDetails.symptoms || "";

    const targetId = activePayload._id || activePayload.id || data?.id || data?.appointmentId;
    const appointmentId = activePayload.appointmentId || activePayload.appointmentID || targetId || "N/A";
    const appointmentDate = activePayload.date || (activePayload.createdAt ? new Date(activePayload.createdAt).toLocaleDateString() : "N/A");
    
    const chiefComplaints = 
        activePayload.chiefComplaints || 
        clinicalDetails.chiefComplaints ||
        activePayload.complaints || 
        activePayload.appointment?.chiefComplaints ||
        symptomsAdvice || 
        "N/A";

    const diagnosisText = Array.isArray(diagnosis) ? diagnosis.join(', ') : (activePayload.diagnosis || "N/A");

    const advisedInvestigations = activePayload.advisedInvestigations || "";
    const adviceGiven = activePayload.adviceGiven || "";
    const specialInstructions = activePayload.specialInstructions || "";
    const nextAppointment = activePayload.nextAppointment || "";

    // Bulletproof fallback parser for Patient Vitals
    const vitals = {
        bp: activePayload.vitals?.bp || activePayload.bp || data?.vitals?.bp || data?.bp || "",
        pulse: activePayload.vitals?.pulse || activePayload.pulse || data?.vitals?.pulse || data?.pulse || "",
        temp: activePayload.vitals?.temp || activePayload.temp || data?.vitals?.temp || data?.temp || "",
        spo2: activePayload.vitals?.spo2 || activePayload.spo2 || data?.spo2 || data?.spo2 || ""
    };

    const docInfo = activePayload.doctorInfo || {};
    const doctorName = doctorProfile?.name || docInfo.name || activePayload.doctorName || activePayload.mainDoctorName || activePayload.doctor?.name || activePayload.name || "Doctor";
    const qualification = doctorProfile?.qualification || docInfo.qualification || activePayload.doctorQualification || activePayload.mainDoctorQualification || activePayload.doctor?.qualification || activePayload.qualification || "";
    const speciality = doctorProfile?.speciality || docInfo.speciality || activePayload.doctorSpeciality || activePayload.speciality || "Consulting Practitioner";
    const license = doctorProfile?.licenseNumber || docInfo.licenseNumber || activePayload.doctorLicense || activePayload.licenseNumber || "";
    const experience = doctorProfile?.experienceYears || docInfo.experienceYears || activePayload.experienceYears || "";
    const docProfileImage = doctorProfile?.profileImage || docInfo.profileImage || activePayload.doctorProfileImage || activePayload.profileImage || "";

    const dynamicLogo = getFormattedLogoUrl(docProfileImage || activePayload.hospitalLogo || activePayload.logoPath);
    const activeLogoSrc = dynamicLogo || DEFAULT_CLINIC_LOGO;

    const rawSignaturePath = doctorProfile?.signatureImage || findSignaturePath(activePayload);
    const signatureSrc = getFormattedLogoUrl(rawSignaturePath);

    const prescriptionGeneratedDate = new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });

    const medicinesListText = medicines.length > 0
        ? medicines.map((med, idx) => `${idx + 1}. ${med.name} - ${med.dosage || med.dose || "—"} (${med.frequency || med.time || "—"}) for ${med.duration || "—"}`).join('\n')
        : "No medicines prescribed";

    const fullDetailsQRText = `DIGITAL VERIFICATION SUMMARY
-----------------------------
Appointment ID : ${appointmentId}
Date           : ${appointmentDate}
Prescription On: ${prescriptionGeneratedDate}

PATIENT PROFILE
Name    : ${patientInfo.name}
Gender  : ${patientInfo.gender}
Age     : ${patientInfo.age && patientInfo.age !== "N/A" ? `${patientInfo.age} Yrs` : "N/A"}
Address : ${patientInfo.address}

CLINICAL EVALUATION
Chief Complaints : ${chiefComplaints}
Diagnosis        : ${diagnosisText}

DOCTOR SIGN-OFF
Practitioner : ${doctorName}
Speciality   : ${speciality} ${license ? `(Reg: ${license})` : ''}

MEDICINES LIST
${medicinesListText}
-----------------------------
Verified via Health Kangaroo`;

    const qrCodeUrl = activePayload.qrCode || activePayload.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(fullDetailsQRText)}`;

    const handlePrint = () => {
        const printContent = printAreaRef.current;
        if (!printContent) return;

        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = '0';
        document.body.appendChild(iframe);

        const doc = iframe.contentWindow.document;
        doc.open();
        doc.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8" />
                <title>Prescription Summary</title>
                <script src="https://cdn.tailwindcss.com"><\/script>
                <style>
                    @page {
                        size: A4 portrait;
                        margin: 15mm;
                    }
                    html, body {
                        margin: 0;
                        padding: 0;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    tr {
                        page-break-inside: avoid;
                    }
                </style>
            </head>
            <body>
                ${printContent.outerHTML}
            </body>
            </html>
        `);
        doc.close();

        const triggerPrint = () => {
            setTimeout(() => {
                iframe.contentWindow.focus();
                iframe.contentWindow.print();
                setTimeout(() => {
                    document.body.removeChild(iframe);
                }, 1000);
            }, 600);
        };

        if (iframe.contentWindow.document.readyState === 'complete') {
            triggerPrint();
        } else {
            iframe.onload = triggerPrint;
        }
    };

    const handleFinalize = async () => {
        try {
            setSubmitting(true);

            const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
                import('html2canvas-pro'),
                import('jspdf'),
            ]);

            const element = printAreaRef.current;
            if (!element) {
                alert("Prescription layout is missing from DOM.");
                return;
            }

            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
                onclone: (clonedDoc) => {
                    const target = clonedDoc.querySelector('.print-target');
                    if (target) {
                        target.style.padding = '15mm';
                        target.style.boxShadow = 'none';
                        target.style.border = 'none';
                        target.style.borderRadius = '0';
                    }
                },
            });

            const imgData = canvas.toDataURL('image/jpeg', 0.98);
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgProps = pdf.getImageProperties(imgData);
            const imgWidth = pdfWidth;
            const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
            heightLeft -= pdfHeight;

            while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
                heightLeft -= pdfHeight;
            }

            const pdfBlob = pdf.output('blob');

            const formData = new FormData();

            // Broad-spectrum fallback resolver for Patient/User ID
            // "Bypass with "null" string if not available, backend will auto-resolve it from appointmentId"
            const resolvedUserId = 
                activePayload?.patientId || 
                activePayload?.userId?._id || 
                activePayload?.userId || 
                activePayload?.user?._id || 
                activePayload?.user?.id || 
                activePayload?.userAccount?._id || 
                activePayload?.userAccount?.id || 
                activePayload?.patientDetails?.patientId || 
                data?.patientId || 
                data?.userId || 
                data?.userAccount?._id ||
                "null"; // 🚀 Auto-bypass fallback as specified in API specifications.

            formData.append('userId', resolvedUserId);

            const resolvedAppointmentId = appointmentId === "N/A" || !appointmentId ? "null" : appointmentId;
            formData.append('appointmentId', resolvedAppointmentId);

            if (chiefComplaints && chiefComplaints !== "N/A") {
                formData.append('chiefComplaints', chiefComplaints);
            }

            const diagnosisArray = Array.isArray(diagnosis)
                ? diagnosis
                : (diagnosisText !== "N/A" ? diagnosisText.split(',').map(d => d.trim()).filter(Boolean) : []);
            formData.append('diagnosis', JSON.stringify(diagnosisArray));

            // Structured dynamic medicine array
            const serializedMedicines = medicines.map(med => ({
                name: med.name || med.medicineName || "",
                dose: med.dosage || med.dose || "",
                dosage: med.dosage || med.dose || "",
                time: med.frequency || med.time || "",
                frequency: med.frequency || med.time || "",
                duration: med.duration || "",
                instruction: med.instructions || med.instruction || "",
                instructions: med.instructions || med.instruction || ""
            }));
            formData.append('medicines', JSON.stringify(serializedMedicines));

            if (advisedInvestigations) {
                formData.append('advisedInvestigations', advisedInvestigations);
            }
            if (adviceGiven) {
                formData.append('adviceGiven', adviceGiven);
            }
            if (specialInstructions) {
                formData.append('specialInstructions', specialInstructions);
            }
            if (nextAppointment) {
                formData.append('nextAppointment', nextAppointment);
            }
            if (symptomsAdvice) {
                formData.append('additionalNotes', symptomsAdvice);
            }

            // Sync dynamic vitals inside the form data payload (Both Option A & Option C Supported)
            // Option A: Direct Flat Keys
            if (vitals.bp) formData.append('bp', vitals.bp);
            if (vitals.pulse) formData.append('pulse', vitals.pulse);
            if (vitals.temp) formData.append('temp', vitals.temp);
            if (vitals.spo2) formData.append('spo2', vitals.spo2);

            // Option C: Stringified JSON Object key
            const vitalsObj = {
                bp: vitals.bp || "",
                pulse: vitals.pulse || "",
                temp: vitals.temp || "",
                spo2: vitals.spo2 || ""
            };
            formData.append('vitals', JSON.stringify(vitalsObj));

            // Sync dynamic PDF binary files strictly under the required primary key
            formData.append('prescriptionPdf', pdfBlob, `prescription-${appointmentId}.pdf`);

            // Detailed Payload Logger for PDF submission tracing
            console.log("==================================================");
            console.log("📡 SUBMITTING PRESCRIPTION FORM DATA & VITALS LOGS");
            console.log("==================================================");
            console.log("Patient User ID   :", resolvedUserId);
            console.log("Appointment ID    :", resolvedAppointmentId);
            console.log("Chief Complaints  :", chiefComplaints);
            console.log("Diagnosis Codes   :", diagnosisArray);
            console.log("Prescribed Meds   :", serializedMedicines);
            console.log("Advised Invest.   :", advisedInvestigations);
            console.log("Advice Given      :", adviceGiven);
            console.log("Special Instruct. :", specialInstructions);
            console.log("Next Appointment  :", nextAppointment);
            console.log("Additional Notes  :", symptomsAdvice);
            console.log("Captured Vitals   :", vitalsObj);
            console.log("Prescription PDF  : Blob Size =", pdfBlob.size, "bytes | Type =", pdfBlob.type);
            console.log("==================================================");

            const response = await DoctorAPI.createPrescription(formData);
            if (response && response.success) {
                alert("Prescription generated and saved successfully!");
                if (onCompleteCase) {
                    await onCompleteCase(targetId, activePayload);
                }
                onClose();
            } else {
                alert(response.message || "An error occurred while compiling your prescription settings.");
            }
        } catch (err) {
            console.error("Prescription finalization error:", err);
            alert("Could not complete structural prescription sync.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto font-sans print-root">
            <div className="absolute inset-0 no-print" onClick={onClose}></div>

            <div className="relative bg-white w-full max-w-[210mm] rounded-3xl shadow-2xl overflow-hidden my-8 flex flex-col p-6 z-10 animate-in fade-in duration-200 print-modal-wrapper">

                <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-100 no-print gap-3 flex-wrap">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                    >
                        Close Preview
                    </button>

                    <span className="font-extrabold text-sm text-slate-800 hidden md:inline">Prescription Summary Pad</span>

                    <div className="flex items-center gap-2">
                        {onEdit && targetId && (
                            <button
                                onClick={() => {
                                    onClose();
                                    onEdit(data);
                                }}
                                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                            >
                                Edit
                            </button>
                        )}

                        {onResend && targetId && (
                            <button
                                onClick={() => onResend(targetId)}
                                className="px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                            >
                                Resend
                            </button>
                        )}

                        <button
                            onClick={handlePrint}
                            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-black transition-colors"
                        >
                            Print Summary
                        </button>

                        {onCompleteCase && (
                            <button
                                onClick={handleFinalize}
                                disabled={submitting}
                                className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-100 text-white rounded-xl text-xs font-black shadow-md transition-colors flex items-center gap-1.5"
                            >
                                {submitting ? <FaSpinner className="animate-spin" size={10} /> : "Complete Case"}
                            </button>
                        )}
                    </div>
                </div>

                <div className="overflow-y-auto max-h-[75vh] pr-1 no-scrollbar print-scroll-wrapper">
                    <div
                        ref={printAreaRef}
                        className="print-target relative bg-white w-full p-8 text-black leading-normal select-none overflow-hidden border border-slate-100 shadow-sm rounded-2xl"
                    >
                        <div className="absolute top-0 left-0 w-32 h-20 bg-[#08B36A] rounded-br-[100px] pointer-events-none z-0"></div>

                        <div className="relative z-10 space-y-6">

                            <div className="flex justify-between items-start mb-6 pt-4">
                                <div className="pl-4 flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="bg-white px-2.5 py-1 rounded-xl shrink-0 flex items-center justify-center shadow-sm border border-slate-100">
                                            <img
                                                src="/logo.png"
                                                alt="Health Kangaroo Logo"
                                                className="h-10 w-auto object-contain"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                }}
                                            />
                                        </div>
                                        <div className="leading-tight">
                                            <span className="text-xs font-black text-slate-800 tracking-wider block">Health Kangaroo</span>
                                            <span className="text-[7px] text-slate-400 uppercase tracking-widest font-bold block">Smart Platform</span>
                                        </div>
                                    </div>

                                    <div className="h-8 w-[1px] bg-slate-200"></div>

                                    <div className="w-14 h-14 bg-green-50/50 rounded-2xl border border-green-100/50 p-1 flex items-center justify-center shrink-0 shadow-inner overflow-hidden">
                                        <img
                                            src={activeLogoSrc}
                                            alt="Clinic Logo"
                                            className="w-full h-full object-cover rounded-xl bg-slate-50"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = DEFAULT_CLINIC_LOGO;
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <h1 className="text-xl font-black text-[#08B36A] uppercase tracking-tight">{doctorName}</h1>
                                        <p className="text-[10px] text-slate-700 font-extrabold tracking-wide uppercase leading-tight mt-0.5">
                                            {speciality} {qualification && `(${qualification})`}
                                        </p>
                                        {license && (
                                            <p className="text-[8px] text-slate-400 font-bold mt-1 tracking-wider uppercase">
                                                Reg No: {license} {experience && `• ${experience} Yrs Exp`}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-black text-slate-800 uppercase tracking-tight">Digital Verification</p>
                                    <p className="text-[9px] text-slate-400 font-bold">Authorized Telehealth Signature</p>
                                </div>
                            </div>

                            <div className="border-t border-b border-slate-300 py-5 font-sans text-xs text-slate-800">
                                <h3 className="text-center font-bold text-sm tracking-widest uppercase mb-4 text-slate-900">
                                    PATIENT DETAILS
                                </h3>

                                <div className="grid grid-cols-12 gap-y-3.5 gap-x-4 border border-slate-100 bg-slate-50/50 rounded-2xl p-4">
                                    <div className="col-span-12 sm:col-span-4">
                                        <span className="font-extrabold text-slate-900">Appointment ID :</span>{' '}
                                        <span className="text-slate-700 font-medium">{appointmentId}</span>
                                    </div>
                                    <div className="col-span-6 sm:col-span-4">
                                        <span className="font-extrabold text-slate-900">Appointment Date :</span>{' '}
                                        <span className="text-slate-700 font-medium">{appointmentDate}</span>
                                    </div>
                                    <div className="col-span-6 sm:col-span-4">
                                        <span className="font-extrabold text-slate-900">Prescription Date :</span>{' '}
                                        <span className="text-slate-700 font-semibold text-[#08B36A]">{prescriptionGeneratedDate}</span>
                                    </div>

                                    <div className="col-span-12 sm:col-span-4">
                                        <span className="font-extrabold text-slate-900">Name :</span>{' '}
                                        <span className="text-slate-700 font-semibold">{patientInfo.name}</span>
                                    </div>
                                    <div className="col-span-6 sm:col-span-4">
                                        <span className="font-extrabold text-slate-900">Gender :</span>{' '}
                                        <span className="text-slate-700 font-medium">{patientInfo.gender}</span>
                                    </div>
                                    <div className="col-span-6 sm:col-span-3">
                                        <span className="font-extrabold text-slate-900">Age :</span>{' '}
                                        <span className="text-slate-700 font-medium">
                                            {patientInfo.age && patientInfo.age !== "N/A" ? `${patientInfo.age} Yrs` : "N/A"}
                                        </span>
                                    </div>

                                    <div className="col-span-12">
                                        <span className="font-extrabold text-slate-900">Address :</span>{' '}
                                        <span className="text-slate-700 font-medium">{patientInfo.address}</span>
                                    </div>

                                    <div className="col-span-12">
                                        <span className="font-extrabold text-slate-900">Chief Complaints :</span>{' '}
                                        <span className="text-slate-700 font-medium">{chiefComplaints}</span>
                                    </div>

                                    <div className="col-span-12">
                                        <span className="font-extrabold text-slate-900">Diagnosis :</span>{' '}
                                        <span className="text-slate-700 font-medium">{diagnosisText}</span>
                                    </div>

                                    {/* Patient Vitals Parameters Panel - High-compatibility inline style fallback */}
                                    {vitals && (vitals.bp || vitals.pulse || vitals.temp || vitals.spo2) && (
                                        <div className="col-span-12 border-t border-slate-200/50 pt-3 mt-2" style={{ display: 'block', width: '100%' }}>
                                            <span className="font-extrabold text-slate-900 uppercase text-[9px] tracking-wider block mb-2 text-[#08B36A]">
                                                Captured Vitals Metrics:
                                            </span>
                                            <div className="flex flex-row justify-between items-center bg-white border border-slate-100 p-3 rounded-xl shadow-xs" style={{ display: 'flex', width: '100%', gap: '10px' }}>
                                                {vitals.bp && (
                                                    <div className="flex-1 text-center" style={{ flex: '1', minWidth: '0' }}>
                                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block" style={{ fontSize: '8px', color: '#94a3b8' }}>Blood Pressure</span>
                                                        <span className="text-xs font-black text-slate-800" style={{ fontSize: '12px', fontWeight: 'bold' }}>{vitals.bp}</span>
                                                    </div>
                                                )}
                                                {vitals.pulse && (
                                                    <div className="flex-1 text-center" style={{ flex: '1', minWidth: '0', borderLeft: '1px solid #f1f5f9' }}>
                                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block" style={{ fontSize: '8px', color: '#94a3b8' }}>Pulse Rate</span>
                                                        <span className="text-xs font-black text-slate-800" style={{ fontSize: '12px', fontWeight: 'bold' }}>{vitals.pulse}</span>
                                                    </div>
                                                )}
                                                {vitals.temp && (
                                                    <div className="flex-1 text-center" style={{ flex: '1', minWidth: '0', borderLeft: '1px solid #f1f5f9' }}>
                                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block" style={{ fontSize: '8px', color: '#94a3b8' }}>Temperature</span>
                                                        <span className="text-xs font-black text-slate-800" style={{ fontSize: '12px', fontWeight: 'bold' }}>{vitals.temp}</span>
                                                    </div>
                                                )}
                                                {vitals.spo2 && (
                                                    <div className="flex-1 text-center" style={{ flex: '1', minWidth: '0', borderLeft: '1px solid #f1f5f9' }}>
                                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block" style={{ fontSize: '8px', color: '#94a3b8' }}>Oxygen Saturation</span>
                                                        <span className="text-xs font-black text-slate-800" style={{ fontSize: '12px', fontWeight: 'bold' }}>{vitals.spo2}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="border border-slate-200 rounded-2xl overflow-hidden mt-4">
                                <table className="w-full text-left text-xs border-collapse font-sans">
                                    <thead>
                                        <tr className="bg-[#08B36A] text-white font-black">
                                            <th className="py-2.5 px-3 w-12 text-center">S.No</th>
                                            <th className="py-2.5 px-3">Medicine Formulation</th>
                                            <th className="py-2.5 px-3 w-20 text-center">Dosage</th>
                                            <th className="py-2.5 px-3 w-32 text-center">Frequency</th>
                                            <th className="py-2.5 px-3 w-24 text-center">Duration</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {medicines.map((med, index) => (
                                            <tr key={index} className="h-11 hover:bg-slate-50/40">
                                                <td className="text-center font-bold text-[#08B36A]">{index + 1}</td>
                                                <td className="px-3">
                                                    <p className="font-extrabold text-slate-800">{med.name}</p>
                                                    {med.instructions && <p className="text-[10px] text-slate-400 italic font-medium">{med.instructions}</p>}
                                                </td>
                                                <td className="text-center font-semibold text-slate-700">{med.dosage || med.dose || "—"}</td>
                                                <td className="text-center font-medium text-slate-600">{med.frequency || med.time || "—"}</td>
                                                <td className="text-center font-semibold text-slate-700">{med.duration || "—"}</td>
                                            </tr>
                                        ))}
                                        {medicines.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="py-10 text-center text-xs text-slate-400 italic font-bold uppercase tracking-wider">
                                                    No medicines written
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {symptomsAdvice && (
                                <div className="border border-slate-200 rounded-2xl p-4 bg-white space-y-1">
                                    <h4 className="text-[10px] font-black text-[#08B36A] uppercase tracking-widest">Advice & Special Instructions</h4>
                                    <p className="text-xs font-semibold text-slate-700 leading-relaxed">{symptomsAdvice}</p>
                                </div>
                            )}

                            {(advisedInvestigations || adviceGiven || specialInstructions || nextAppointment) && (
                                <div className="border border-slate-200 rounded-2xl p-4 bg-white space-y-3">
                                    <h4 className="text-[10px] font-black text-[#08B36A] uppercase tracking-widest">
                                        Clinical Recommendations & Directives
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {advisedInvestigations && (
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Advised Investigations</p>
                                                <p className="text-xs font-semibold text-slate-700 leading-relaxed">{advisedInvestigations}</p>
                                            </div>
                                        )}
                                        {adviceGiven && (
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Advice Given</p>
                                                <p className="text-xs font-semibold text-slate-700 leading-relaxed">{adviceGiven}</p>
                                            </div>
                                        )}
                                        {specialInstructions && (
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Special Instructions</p>
                                                <p className="text-xs font-semibold text-slate-700 leading-relaxed">{specialInstructions}</p>
                                            </div>
                                        )}
                                        {nextAppointment && (
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Next Appointment</p>
                                                <p className="text-xs font-semibold text-slate-700 leading-relaxed">{nextAppointment}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-between items-end pt-4 border-t border-slate-200 mt-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-20 h-20 bg-white border border-slate-200 rounded-xl p-1.5 flex items-center justify-center shrink-0 shadow-sm">
                                        <img
                                            src={qrCodeUrl}
                                            alt="Digital Validation QR"
                                            className="w-full h-full object-contain"
                                            onError={(e) => {
                                                e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2364748b'%3E%3Cpath d='M3 3h8v8H3zm2 2v4h4V5zm8-2h8v8h-8zm2 2v4h4V5zM3 13h8v8H3zm2 2v4h4v-4zm13-2h3v2h-3zm-2 2h2v2h-2zm2 2h3v2h-3zm-4 2h2v2h-2zm2 0h2v2h-2zm-2-4h2v2h-2zm6 2h1v1h-1zm-1-1h1v1h-1z'/%3E%3C/svg%3E";
                                            }}
                                        />
                                    </div>
                                    <div className="leading-tight">
                                        <p className="text-[10px] font-black text-slate-800 uppercase tracking-wider">Full Record QR</p>
                                        <p className="text-[8px] text-slate-400 font-bold max-w-[130px] leading-relaxed">
                                            Scan using a smartphone to read the complete dynamic patient evaluation details off-line.
                                        </p>
                                    </div>
                                </div>

                                <div className="text-right flex flex-col items-end min-w-[160px]">
                                    {signatureSrc && !sigError ? (
                                        <div className="h-14 w-32 relative mb-1 flex items-end justify-end">
                                            <img
                                                src={signatureSrc}
                                                alt="Prescriber Signature"
                                                className="max-h-full max-w-full object-contain mix-blend-multiply"
                                                onError={() => {
                                                    setSigError(true); 
                                                }}
                                            />
                                        </div>
                                    ) : (
                                        <div className="h-14 flex items-end justify-end mb-1">
                                            <span className="text-xs font-serif italic text-slate-500 tracking-wide border-b border-dashed border-slate-300 pb-1 px-4">
                                                Digitally Verified
                                            </span>
                                        </div>
                                    )}
                                    <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{doctorName}</p>
                                    <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">{speciality}</p>
                                    {license && <p className="text-[7px] text-slate-400 font-semibold tracking-wider">Reg No: {license}</p>}
                                </div>
                            </div>

                            <div className="bg-slate-50 border border-slate-100 rounded-xl py-2.5 px-4 text-center">
                                <p className="text-slate-400 font-extrabold text-[9px] tracking-wide uppercase">
                                    This digital Treatment Summary is not valid for Medico-Legal purposes.
                                </p>
                            </div>

                        </div>
                    </div>
                </div>

            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 0 !important;
                    }

                    html, body, div, section, main, [role="dialog"] {
                        overflow: visible !important;
                        max-height: none !important;
                        height: auto !important;
                        position: static !important;
                        background: transparent !important;
                        box-shadow: none !important;
                    }

                    body * {
                        visibility: hidden !important;
                    }

                    .print-target, .print-target * {
                        visibility: visible !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }

                    .print-root {
                        display: block !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        background: none !important;
                    }

                    .print-modal-wrapper {
                        display: block !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        box-shadow: none !important;
                        border-radius: 0 !important;
                        overflow: visible !important;
                    }

                    .print-scroll-wrapper {
                        padding: 0 !important;
                        max-height: none !important;
                        overflow: visible !important;
                    }

                    .print-target {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        max-width: 100% !important;
                        margin: 0 !important;
                        padding: 15mm !important;
                        border: none !important;
                        box-shadow: none !important;
                        background: #fff !important;
                    }

                    .no-print {
                        display: none !important;
                        height: 0 !important;
                        width: 0 !important;
                    }

                    tr {
                        page-break-inside: avoid !important;
                    }
                }
            ` }} />
        </div>
    );
}