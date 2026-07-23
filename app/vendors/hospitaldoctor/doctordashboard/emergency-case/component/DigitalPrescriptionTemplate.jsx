'use client';
import React, { useState, useEffect } from 'react';
import HospitalDoctorAPI from '@/app/services/HospitalDoctorAPI';
import { FaSpinner } from 'react-icons/fa';

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5002";

const getFormattedLogoUrl = (logoPath) => {
    if (!logoPath) return null;
    if (logoPath.startsWith("http://") || logoPath.startsWith("https://")) return logoPath;
    const cleanBaseUrl = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
    const cleanPath = logoPath.startsWith('/') ? logoPath : `/${logoPath}`;
    return `${cleanBaseUrl}${cleanPath}`;
};

const isValidObjectId = (id) => {
    if (!id || typeof id !== 'string') return false;
    return /^[0-9a-fA-F]{24}$/.test(id);
};

const resolvePayload = (raw) => {
    if (!raw) return null;
    if (raw.data && raw.data.data) {
        return raw.data.data;
    }
    if (raw.data) {
        return raw.data;
    }
    return raw;
};

const normalizeMedicine = (med) => {
    if (!med) return null;
    return {
        name: med.medicineName || med.name || "",
        dose: med.dose || med.dosage || "",
        time: med.time || med.frequency || "",
        duration: med.duration || ""
    };
};

export default function DigitalPrescriptionTemplate({
    isOpen,
    onClose,
    data,
    isDischargeFlow,
    onCompleteDischarge,
    isBedsideFlow,
    onCompleteBedside,
    dischargeForm,
    medicines: stagedMedicines
}) {
    const [fetchedData, setFetchedData] = useState(null);
    const [doctorProfile, setDoctorProfile] = useState(null);
    const [loading, setLoading] = useState(false);

    const isLivePreview = Boolean(isDischargeFlow && dischargeForm);

    useEffect(() => {
        const loadPrintData = async () => {
            let targetId = null;
            if (typeof data === 'string' && isValidObjectId(data)) {
                targetId = data;
            } else if (data && typeof data === 'object') {
                targetId = isValidObjectId(data?._id) ? data._id : (isValidObjectId(data?.appointmentId) ? data.appointmentId : null);
            }

            if (!targetId) {
                console.warn("Skipping dynamic print fetch: No valid MongoDB ObjectId found.");
                return;
            }

            try {
                setLoading(true);
                const response = await HospitalDoctorAPI.getDischargePrintData(targetId);

                if (response) {
                    if (response.success && response.data) {
                        setFetchedData(response.data);
                    } else if (response.header || response.patientDetails) {
                        setFetchedData(response);
                    } else if (response.data) {
                        setFetchedData(response.data);
                    } else {
                        setFetchedData(response);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch print data:", err);
            } finally {
                setLoading(false);
            }
        };

        const loadDoctorProfile = async () => {
            try {
                const response = await HospitalDoctorAPI.getProfile();
                if (response && response.success && response.data) {
                    setDoctorProfile(response.data);
                }
            } catch (err) {
                console.error("Failed to load profile:", err);
            }
        };

        if (isOpen) {
            if (!isLivePreview) {
                loadPrintData();
            }
            loadDoctorProfile();
        } else {
            setFetchedData(null);
            setDoctorProfile(null);
        }
    }, [isOpen, data, isLivePreview]);

    if (!isOpen) return null;

    const activePayload = resolvePayload(fetchedData) || resolvePayload(data) || {};

    const header = activePayload?.header || {};
    const patientDetails = activePayload?.patientDetails || {};
    const followUp = activePayload?.followUp || {};
    const medications = activePayload?.medications || [];
    const savedClinicalNotes = activePayload?.clinicalNotes || "";

    const hospitalName = header?.hospitalName || activePayload?.hospitalName || "";
    const hospitalAddress = header?.hospitalAddress || activePayload?.hospitalAddress || "";
    const hospitalLogo = getFormattedLogoUrl(header?.hospitalLogo || activePayload?.hospitalLogo);

    const leadDoctor = header?.leadDoctor || {};
    const mainDoctorName = doctorProfile?.name || leadDoctor?.name || activePayload?.mainDoctorName || "";
    const mainDoctorQualification = doctorProfile?.qualification || leadDoctor?.qualification || activePayload?.mainDoctorQualification || "";
    const mainDoctorTitle = doctorProfile?.title || leadDoctor?.title || activePayload?.mainDoctorTitle || "";

    const mainDoctorSignature =
        doctorProfile?.signatureImage ||
        leadDoctor?.signatureImage ||
        activePayload?.signatureImage ||
        activePayload?.leadDoctor?.signatureImage ||
        "";

    const signatureUrl = getFormattedLogoUrl(mainDoctorSignature);

    const collaborativeDoctors = header?.collaborativeDoctors || activePayload?.bedsideCareTeam || [];

    const appointmentId = patientDetails?.appointmentId || activePayload?.appointmentId || "xxxxxxxxxxxxxxxx";
    const date = patientDetails?.date || activePayload?.date || "XX/XX/XXXX";
    const time = patientDetails?.time || activePayload?.time || "XX:XX";

    const patientName = patientDetails?.name || activePayload?.patientName || "";
    const gender = patientDetails?.gender || activePayload?.gender || "";
    const age = patientDetails?.age || activePayload?.age || "";
    const address = patientDetails?.address || activePayload?.address || "";

    const chiefComplaints = dischargeForm?.chiefComplaints || patientDetails?.chiefComplaints || activePayload?.chiefComplaints || "";

    // The 9 Dynamic Clinical Parameters
    const dateOfAdmission = patientDetails?.dateOfAdmission || activePayload?.dateOfAdmission || "N/A";
    const department = patientDetails?.department || activePayload?.department || "Department of Medicine, Unit - 1";
    const dateOfDischarge = patientDetails?.dateOfDischarge || activePayload?.dateOfDischarge || "N/A";
    const dateOfSurgery = dischargeForm?.dateOfSurgery || patientDetails?.dateOfSurgery || activePayload?.dateOfSurgery || "N/A";
    const insuranceStatus = patientDetails?.insuranceStatus || activePayload?.insuranceStatus || "N/A";
    const paymentStatus = patientDetails?.paymentStatus || activePayload?.paymentStatus || "Paid";
    const paymentType = patientDetails?.paymentType || activePayload?.paymentType || "UPI";
    const conditionDuringAdmission = dischargeForm?.conditionDuringAdmission || patientDetails?.conditionDuringAdmission || activePayload?.conditionDuringAdmission || "N/A";
    const conditionDuringDischarge = dischargeForm?.conditionDuringDischarge || patientDetails?.conditionDuringDischarge || activePayload?.conditionDuringDischarge || "N/A";

    const diagnosis = dischargeForm?.diagnosis || patientDetails?.diagnosis || activePayload?.diagnosis || "";
    const advisedInvestigations = dischargeForm?.advisedInvestigations || followUp?.adviseInvestigation || activePayload?.investigations || "N/A";
    const adviceGiven = dischargeForm?.adviceGiven || followUp?.adviceGiven || activePayload?.advice || "N/A";
    const specialInstructions = dischargeForm?.specialInstructions || followUp?.anySpecialInstructionGiven || activePayload?.specialInstructions || "N/A";
    const nextAppointment = dischargeForm?.nextAppointment || followUp?.nextAppointment || activePayload?.nextAppointment || "";
    const clinicalNotes = dischargeForm?.clinicalNotes || savedClinicalNotes || "";

    const rawMedicines =
        (stagedMedicines && stagedMedicines.length > 0)
            ? stagedMedicines
            : (medications.length > 0 ? medications : (activePayload?.medicines || []));

    const paddedMedicines = Array.from({ length: 10 }, (_, index) => normalizeMedicine(rawMedicines[index]));

    const qrDataText = `Health Kangaroo Smart Discharge Summary
=======================================
Appointment ID : ${appointmentId}
Hospital       : ${hospitalName}
Lead Doctor    : ${mainDoctorName}
Patient Name   : ${patientName}
Age / Gender   : ${age}, ${gender}
Document Date  : ${date} ${time}
Verified       : Authentic Document`;

    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrDataText)}`;

    const handlePrint = () => {
        const printContent = document.querySelector('.print-target');
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
                <title>Discharge Summary</title>
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

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto font-sans print-root">
            <div className="absolute inset-0 no-print" onClick={onClose}></div>

            <div className="relative bg-white w-full max-w-[225mm] rounded-3xl shadow-2xl overflow-hidden my-8 flex flex-col p-6 sm:p-8 z-10 print-modal-wrapper">

                <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-100 no-print gap-3 flex-wrap">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
                    >
                        Close Preview
                    </button>
                    <span className="font-extrabold text-sm text-slate-800">
                        {isLivePreview ? 'Live Preview (Unsaved)' : 'Print / Discharge Preview'}
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrint}
                            disabled={loading}
                            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
                        >
                            Print / Download PDF
                        </button>
                        {isDischargeFlow && onCompleteDischarge && (
                            <button
                                onClick={onCompleteDischarge}
                                disabled={loading}
                                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-md transition-all disabled:opacity-50"
                            >
                                Complete Discharge
                            </button>
                        )}
                        {isBedsideFlow && onCompleteBedside && (
                            <button
                                onClick={onCompleteBedside}
                                disabled={loading}
                                className="px-5 py-2.5 bg-[#08B36A] hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md transition-all disabled:opacity-50"
                            >
                                Complete Bedside Shift
                            </button>
                        )}
                    </div>
                </div>

                <div className="overflow-y-auto max-h-[75vh] pr-1 no-scrollbar print-scroll-wrapper">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-slate-100 shadow-sm">
                            <FaSpinner className="animate-spin text-emerald-500 text-3xl" />
                            <p className="text-slate-400 text-xs mt-3 font-bold uppercase tracking-wider">Syncing print files...</p>
                        </div>
                    ) : (
                        <div
                            className="print-target relative bg-white w-full p-8 text-black leading-normal select-none overflow-hidden border border-slate-100 shadow-sm rounded-2xl"
                            style={{ boxSizing: 'border-box' }}
                        >
                            <div className="absolute top-0 left-0 w-32 h-20 bg-[#08B36A] rounded-br-[100px] pointer-events-none z-0"></div>

                            <div className="relative z-10">
                                <div className="flex justify-center mb-6">
                                    <span className="bg-[#08B36A] text-white px-8 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase">
                                        DIGITAL DISCHARGE SUMMARY
                                    </span>
                                </div>

                                <div className="flex justify-between items-stretch mb-6">
                                    <div className="w-1/2 flex items-center gap-4 pl-4 z-10">
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

                                        {hospitalLogo && <div className="h-8 w-[1px] bg-slate-200"></div>}

                                        {hospitalLogo && (
                                            <div className="flex items-center">
                                                <img
                                                    src={hospitalLogo}
                                                    alt="Hospital Photo"
                                                    className="h-11 w-auto object-contain rounded-lg max-w-[120px]"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none';
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="w-[1px] bg-slate-200 self-stretch my-2"></div>

                                    <div className="w-1/2 text-right pl-6 font-sans">
                                        <h1 className="text-2xl font-black text-[#08B36A] tracking-tight">{hospitalName}</h1>
                                        {hospitalAddress && <p className="text-[10px] text-[#08B36A] font-bold mt-0.5">Address: {hospitalAddress}</p>}

                                        <div className="mt-2 text-slate-800 leading-tight">
                                            <p className="text-sm font-black text-slate-900">{mainDoctorName}</p>
                                            {mainDoctorTitle && <p className="text-xs font-bold text-slate-500">{mainDoctorTitle} {mainDoctorQualification && `(${mainDoctorQualification})`}</p>}

                                            {collaborativeDoctors && collaborativeDoctors.length > 0 && (
                                                <div className="mt-1 text-[9px] text-slate-400 font-bold space-y-0.5 uppercase tracking-wide">
                                                    {collaborativeDoctors.map((team, idx) => {
                                                        const specName = team.doctorId?.name || team.name || "";
                                                        const specDept = team.doctorId?.speciality || team.department || "";
                                                        if (!specName) return null;
                                                        return (
                                                            <p key={idx}>
                                                                {specName.toLowerCase().startsWith('dr') ? specName : `Dr. ${specName}`} : {specDept.startsWith('Department') ? specDept : `Department of ${specDept}`}
                                                            </p>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-4 font-sans">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-xs font-black text-[#08B36A] tracking-wider uppercase whitespace-nowrap">PATIENT DETAILS</span>
                                        <div className="h-[1px] bg-slate-200 w-full"></div>
                                    </div>

                                    <div className="grid grid-cols-12 gap-x-8 gap-y-2 text-[10px] text-slate-700 leading-relaxed">
                                        <div className="col-span-6 space-y-2">
                                            <div className="flex items-end">
                                                <span className="w-24 font-bold flex-shrink-0 text-slate-800">Appointment ID</span>
                                                <span className="mr-1.5 font-bold">:</span>
                                                <span className="flex-1 font-medium text-slate-600 truncate border-b border-dashed border-slate-200">{appointmentId}</span>
                                            </div>
                                            <div className="flex items-end">
                                                <span className="w-24 font-bold flex-shrink-0 text-slate-800">Name</span>
                                                <span className="mr-1.5 font-bold">:</span>
                                                <span className="flex-1 font-semibold text-slate-900 truncate border-b border-dashed border-slate-200">{patientName}</span>
                                            </div>
                                            <div className="flex items-end">
                                                <span className="w-24 font-bold flex-shrink-0 text-slate-800">Address</span>
                                                <span className="mr-1.5 font-bold">:</span>
                                                <span className="flex-1 font-medium text-slate-600 truncate border-b border-dashed border-slate-200">{address}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="w-24 font-bold flex-shrink-0 text-slate-800">Gender</span>
                                                <span className="mr-1.5 font-bold">:</span>
                                                <div className="flex-1 flex gap-3 text-slate-600 font-semibold pl-1">
                                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name="gender_print"
                                                            checked={gender?.toLowerCase() === 'male' || gender?.toLowerCase() === 'm'}
                                                            readOnly
                                                            className="w-3.5 h-3.5 text-[#08B36A] focus:ring-[#08B36A] border-slate-300"
                                                        />
                                                        <span>Male</span>
                                                    </label>
                                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name="gender_print"
                                                            checked={gender?.toLowerCase() === 'female' || gender?.toLowerCase() === 'f'}
                                                            readOnly
                                                            className="w-3.5 h-3.5 text-[#08B36A] focus:ring-[#08B36A] border-slate-300"
                                                        />
                                                        <span>Female</span>
                                                    </label>
                                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name="gender_print"
                                                            checked={gender?.toLowerCase() !== 'male' && gender?.toLowerCase() !== 'm' && gender?.toLowerCase() !== 'female' && gender?.toLowerCase() !== 'f'}
                                                            readOnly
                                                            className="w-3.5 h-3.5 text-[#08B36A] focus:ring-[#08B36A] border-slate-300"
                                                        />
                                                        <span>Other</span>
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="flex items-end">
                                                <span className="w-24 font-bold flex-shrink-0 text-slate-800">Age</span>
                                                <span className="mr-1.5 font-bold">:</span>
                                                <span className="flex-1 font-medium text-slate-600 truncate border-b border-dashed border-slate-200">{age}</span>
                                            </div>
                                            <div className="flex items-end">
                                                <span className="w-24 font-bold flex-shrink-0 text-slate-800">Date</span>
                                                <span className="mr-1.5 font-bold">:</span>
                                                <span className="flex-1 font-medium text-slate-600 truncate border-b border-dashed border-slate-200">{date}</span>
                                            </div>
                                            <div className="flex items-end">
                                                <span className="w-24 font-bold flex-shrink-0 text-slate-800">Time</span>
                                                <span className="mr-1.5 font-bold">:</span>
                                                <span className="flex-1 font-medium text-slate-600 truncate border-b border-dashed border-slate-200">{time}</span>
                                            </div>
                                            <div className="flex items-end">
                                                <span className="w-24 font-bold flex-shrink-0 text-slate-800">Chief Complaints</span>
                                                <span className="mr-1.5 font-bold">:</span>
                                                <span className="flex-1 font-medium text-slate-600 truncate border-b border-dashed border-slate-200">{chiefComplaints}</span>
                                            </div>
                                            <div className="flex items-end">
                                                <span className="w-24 font-bold flex-shrink-0 text-slate-800">Diagnosis</span>
                                                <span className="mr-1.5 font-bold">:</span>
                                                <span className="flex-1 font-semibold text-slate-800 truncate border-b border-dashed border-slate-200">{diagnosis}</span>
                                            </div>
                                        </div>

                                        <div className="col-span-6 space-y-2">
                                            <div className="flex items-end">
                                                <span className="w-36 font-bold flex-shrink-0 text-slate-800">Date of Admission</span>
                                                <span className="mr-1.5 font-bold">:</span>
                                                <span className="flex-1 font-medium text-slate-600 truncate border-b border-dashed border-slate-200">{dateOfAdmission}</span>
                                            </div>
                                            <div className="flex items-end">
                                                <span className="w-36 font-bold flex-shrink-0 text-slate-800">Department</span>
                                                <span className="mr-1.5 font-bold">:</span>
                                                <span className="flex-1 font-extrabold text-[#08B36A] truncate border-b border-dashed border-slate-200">
                                                    {department}
                                                </span>
                                            </div>
                                            <div className="flex items-end">
                                                <span className="w-36 font-bold flex-shrink-0 text-slate-800">Date of Discharge</span>
                                                <span className="mr-1.5 font-bold">:</span>
                                                <span className="flex-1 font-medium text-slate-600 truncate border-b border-dashed border-slate-200">{dateOfDischarge}</span>
                                            </div>
                                            <div className="flex items-end">
                                                <span className="w-36 font-bold flex-shrink-0 text-slate-800">Date of Surgery</span>
                                                <span className="mr-1.5 font-bold">:</span>
                                                <span className="flex-1 font-medium text-slate-600 truncate border-b border-dashed border-slate-200">{dateOfSurgery}</span>
                                            </div>
                                            <div className="flex items-end">
                                                <span className="w-36 font-bold flex-shrink-0 text-slate-800">Insurance Status</span>
                                                <span className="mr-1.5 font-bold">:</span>
                                                <span className="flex-1 font-medium text-slate-600 truncate border-b border-dashed border-slate-200">{insuranceStatus}</span>
                                            </div>
                                            <div className="flex items-end">
                                                <span className="w-36 font-bold flex-shrink-0 text-slate-800">Payment Status</span>
                                                <span className="mr-1.5 font-bold">:</span>
                                                <span className="flex-1 font-extrabold text-[#08B36A] truncate border-b border-dashed border-slate-200">{paymentStatus}</span>
                                            </div>
                                            <div className="flex items-end">
                                                <span className="w-36 font-bold flex-shrink-0 text-slate-800">Payment Type</span>
                                                <span className="mr-1.5 font-bold">:</span>
                                                <span className="flex-1 font-extrabold text-[#08B36A] truncate border-b border-dashed border-slate-200">{paymentType}</span>
                                            </div>
                                            <div className="flex items-end">
                                                <span className="w-36 font-bold flex-shrink-0 text-slate-800">Condition during Admission</span>
                                                <span className="mr-1.5 font-bold">:</span>
                                                <span className="flex-1 font-medium text-slate-600 truncate border-b border-dashed border-slate-200">{conditionDuringAdmission}</span>
                                            </div>
                                            <div className="flex items-end">
                                                <span className="w-36 font-bold flex-shrink-0 text-slate-800">Condition during Discharge</span>
                                                <span className="mr-1.5 font-bold">:</span>
                                                <span className="flex-1 font-medium text-slate-600 truncate border-b border-dashed border-slate-200">{conditionDuringDischarge}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="border border-slate-200 rounded-2xl p-4 bg-white mb-6">
                                    <h3 className="text-xs font-bold text-[#08B36A] mb-1 font-sans">Clinical Notes</h3>
                                    <p className="text-[9px] text-slate-400 mb-3 font-sans">(Please find clinical notes below)</p>

                                    <div className="space-y-3 font-sans text-[10px] text-slate-700 leading-normal min-h-[120px] px-1">
                                        {clinicalNotes ? (
                                            <p className="border-b border-slate-100 pb-1 font-medium">{clinicalNotes}</p>
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="border-b border-slate-100 h-4"></div>
                                                <div className="border-b border-slate-100 h-4"></div>
                                                <div className="border-b border-slate-100 h-4"></div>
                                                <div className="border-b border-slate-100 h-4"></div>
                                                <div className="border-b border-slate-100 h-4"></div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="relative overflow-hidden border border-slate-200 rounded-2xl mb-6">
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
                                        <img
                                            src="/logo.png"
                                            alt="Watermark"
                                            className="w-72 h-auto"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                            }}
                                        />
                                    </div>

                                    <table className="w-full text-left text-[10px] border-collapse relative z-10 font-sans">
                                        <thead>
                                            <tr className="bg-[#08B36A] text-white font-bold">
                                                <th className="py-2.5 px-3 w-12 text-center border-r border-[#08B36A]/50">S.No.</th>
                                                <th className="py-2.5 px-3 border-r border-[#08B36A]/50">Medicine Name</th>
                                                <th className="py-2.5 px-3 w-24 text-center border-r border-[#08B36A]/50">Dose</th>
                                                <th className="py-2.5 px-3 w-40 text-center border-r border-[#08B36A]/50">Time</th>
                                                <th className="py-2.5 px-3 w-24 text-center">Duration</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paddedMedicines.map((med, index) => {
                                                const serialNo = String(index + 1).padStart(2, '0') + '.';
                                                return (
                                                    <tr key={index} className="border-b border-slate-100 h-8 font-sans">
                                                        <td className="text-center font-bold text-[#08B36A] border-r border-slate-100">{serialNo}</td>
                                                        <td className="font-extrabold text-slate-800 px-3 border-r border-slate-100">{med ? med.name : ""}</td>
                                                        <td className="text-center font-semibold text-slate-700 border-r border-slate-100">{med ? med.dose : ""}</td>
                                                        <td className="text-center font-medium text-slate-600 border-r border-slate-100">{med ? med.time : ""}</td>
                                                        <td className="text-center font-semibold text-slate-700">{med ? med.duration : ""}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="border border-slate-200 rounded-2xl p-4 bg-white space-y-2 mb-6 text-[10px] font-sans">
                                    <div className="flex">
                                        <span className="w-48 font-black text-slate-800">Advise Investigation</span>
                                        <span className="mr-1.5 font-bold">:</span>
                                        <span className="flex-1 text-slate-600 font-semibold">{advisedInvestigations}</span>
                                    </div>
                                    <div className="flex">
                                        <span className="w-48 font-black text-slate-800">Advice Given</span>
                                        <span className="mr-1.5 font-bold">:</span>
                                        <span className="flex-1 text-slate-600 font-semibold">{adviceGiven}</span>
                                    </div>
                                    <div className="flex">
                                        <span className="w-48 font-black text-slate-800">Any Special Instruction Given</span>
                                        <span className="mr-1.5 font-bold">:</span>
                                        <span className="flex-1 text-slate-600 font-semibold">{specialInstructions}</span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-end mb-6 text-[10px] font-sans">
                                    {mainDoctorName && (
                                        <div className="text-center flex flex-col items-center min-w-[120px]">
                                            {signatureUrl ? (
                                                <img
                                                    src={signatureUrl}
                                                    alt="Doctor Signature"
                                                    className="h-10 w-auto object-contain mb-1 mix-blend-multiply"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none';
                                                    }}
                                                />
                                            ) : (
                                                <div className="h-10"></div>
                                            )}
                                            <span className="font-black text-slate-900 text-xs">{mainDoctorName}</span>
                                            <div className="w-32 border-b border-slate-300 my-1"></div>
                                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Signature</span>
                                        </div>
                                    )}

                                    <div className="border border-emerald-100 bg-emerald-50/10 rounded-2xl p-4 w-52 text-center shadow-sm">
                                        <span className="text-[#08B36A] font-extrabold text-[11px] block">Next Appointment</span>
                                        <p className="text-slate-600 font-bold mt-1">{nextAppointment || "......./......./............"}</p>
                                    </div>

                                    <div className="flex flex-col items-center gap-1.5">
                                        <div className="w-14 h-14 bg-white border border-slate-200 p-1 flex items-center justify-center rounded-lg shadow-sm">
                                            <img
                                                src={qrCodeUrl}
                                                alt="Verification QR Code"
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                        <span className="bg-[#08B36A] text-white text-[8px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full shadow-sm">
                                            Scan to Verify
                                        </span>
                                    </div>
                                </div>

                                <div className="bg-[#08B36A]/5 border border-[#08B36A]/10 rounded-xl py-2 px-4 text-center">
                                    <p className="text-[#08B36A] font-extrabold text-[9px] tracking-wide font-sans">
                                        Note: This digital Discharge Document is not valid for Medico Legal purpose
                                    </p>
                                </div>
                            </div>

                        </div>
                    )}
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