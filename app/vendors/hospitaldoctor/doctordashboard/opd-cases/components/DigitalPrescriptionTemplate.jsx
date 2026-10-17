'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FaSpinner, FaPrint } from 'react-icons/fa';
import HospitalDoctorAPI from '@/app/services/HospitalDoctorAPI';

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

// Safe resolver that returns NULL on empty/null input
const resolvePayload = (obj) => {
  if (!obj) return null;
  if (obj.data && typeof obj.data === 'object' && !obj.data.medicines && !obj.data.patientName && !obj.data.patientInfo) {
    return resolvePayload(obj.data);
  }
  if (obj.success && obj.data && typeof obj.data === 'object') {
    return resolvePayload(obj.data);
  }
  return obj;
};

const getFormattedLogoUrl = (logoPath) => {
  if (!logoPath) return null;
  if (logoPath.startsWith('http://') || logoPath.startsWith('https://')) return logoPath;
  let cleanPath = logoPath.replace(/\\/g, '/');
  if (cleanPath.startsWith('public/')) cleanPath = cleanPath.replace('public/', '');
  const cleanBaseUrl = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
  const cleanPathFormatted = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
  return `${cleanBaseUrl}${cleanPathFormatted}`;
};

export default function DigitalPrescriptionTemplate({
  isOpen,
  onClose,
  data,
  appointmentId,
  isViewOnly = false,
  onEdit,
  onCompleteCase
}) {
  const printAreaRef = useRef();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [viewPrescriptionData, setViewPrescriptionData] = useState(null);
  const [doctorProfile, setDoctorProfile] = useState(null);

  // Fetch prescription details only when viewing completed record
  useEffect(() => {
    const fetchPrescription = async () => {
      const targetId = appointmentId || data?.appointmentId || data?.bookingId;
      if (isViewOnly && targetId) {
        try {
          setLoading(true);
          const res = await HospitalDoctorAPI.getDoctorPrescription(targetId);
          if (res?.success && res.data) {
            setViewPrescriptionData(res.data);
          }
        } catch (err) {
          console.error("View Rx error:", err);
        } finally {
          setLoading(false);
        }
      }
    };

    const fetchProfile = async () => {
      try {
        if (typeof HospitalDoctorAPI.getProfile === 'function') {
          const res = await HospitalDoctorAPI.getProfile();
          if (res?.success && res.data) setDoctorProfile(res.data);
        }
      } catch (err) {
        console.warn("Profile fetch warning:", err);
      }
    };

    if (isOpen) {
      if (isViewOnly) fetchPrescription();
      fetchProfile();
    } else {
      setViewPrescriptionData(null);
    }
  }, [isOpen, isViewOnly, appointmentId, data]);

  if (!isOpen) return null;

  // Prioritize newly compiled data when not in viewOnly mode
  const resolvedStagedData = resolvePayload(data);
  const resolvedViewData = resolvePayload(viewPrescriptionData);

  const active = isViewOnly
    ? (resolvedViewData || resolvedStagedData || {})
    : (resolvedStagedData || resolvedViewData || {});

  const doc = active.doctor || active.doctorInfo || {};
  const hosp = active.hospital || {};
  const patient = active.patient || active.patientInfo || {};
  const clinical = active.clinicalInfo || active || {};
  
  // Medicines resolution
  const medicines = active.medicines || clinical.medicines || active.prescriptions?.[0]?.medicines || [];

  const targetApptId = active.appointment?.id || active.appointmentId || appointmentId;
  const bookingId = active.appointment?.bookingId || active.bookingId || "HKH-OPD-789012";

  // Full Hospital Details from Doctor Profile API response
  const hospObj = doctorProfile?.hospitalId || hosp || {};

  // Resolved Real Hospital Name (Prioritizes profile's hospitalId.name over generic fallbacks)
  const hospitalName =
    doctorProfile?.hospitalId?.name ||
    hospObj.name ||
    active.hospitalName ||
    doctorProfile?.hospitalName ||
    doctorProfile?.hospital?.name ||
    "Hospital Care";

  const hospitalFullAddress = [
    hospObj.address || hosp.address,
    hospObj.city || hosp.city,
    hospObj.state || hosp.state
  ].filter(Boolean).join(", ");

  // Doctor Details
  const doctorName =
    doctorProfile?.name || active.doctorName || doc.name || "Doctor";

  const speciality =
    doctorProfile?.speciality || active.doctorSpeciality || doc.speciality || "Consulting Specialist";

  const qualification =
    doctorProfile?.qualification || active.doctorQualification || doc.qualification || "";

  const registrationNumber =
    doctorProfile?.licenseNumber || active.doctorLicense || doc.registrationNumber || "";

  const councilName = doctorProfile?.councilName ? doctorProfile.councilName.trim() : "";

  const cabinRoom =
    doctorProfile?.department?.roomNumber ? `Room ${doctorProfile.department.roomNumber}` :
    active.opdRoomNumber || doc.cabinRoom || doctorProfile?.opdRoomNumber || "";

  // Patient Details
  const patientName =
    active.patientName || patient.name || active.patientDisplayName || "Patient";

  const patientAge =
    active.patientAge || patient.age || "N/A";

  const patientGender =
    active.patientGender || patient.gender || "N/A";

  // Clinical Complaints & Diagnosis
  const chiefComplaints =
    active.chiefComplaints || clinical.chiefComplaints || active.reasonForVisit || "Routine Follow-up";

  const diagnosisList =
    active.diagnosis || clinical.diagnosis || [];

  const diagnosisText = Array.isArray(diagnosisList)
    ? diagnosisList.join(', ')
    : String(diagnosisList || 'Clinical Evaluation');

  // Directives
  const adviceGiven =
    active.advice || active.adviceGiven || clinical.adviceGiven || "";

  const nextAppointment =
    active.nextAppointment || clinical.nextAppointment || "";

  // Vitals
  const vitals =
    active.vitals || clinical.vitals || {};
  
  const signatureSrc = getFormattedLogoUrl(
    doc.signatureImage || doctorProfile?.signatureImage || active.signatureImage
  );

  const prescriptionGeneratedDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const qrText = `NMC PRESCRIPTION VERIFICATION
-----------------------------
Hospital    : ${hospitalName}
Address     : ${hospitalFullAddress}
Booking ID  : ${bookingId}
Doctor      : Dr. ${doctorName} (${speciality})
Qualification: ${qualification}
Reg No      : ${registrationNumber || "MCI-VALID"}
Patient     : ${patientName} (${patientAge} Yrs, ${patientGender})
Diagnosis   : ${diagnosisText}
Medicines   : ${medicines.length} Formulations
Date        : ${prescriptionGeneratedDate}
Verified via Health Kangaroo`;

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrText)}`;
  const qrUrl = qrCodeUrl;

  const handlePrint = () => {
    const printContent = printAreaRef.current;
    if (!printContent) return;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const docFrame = iframe.contentWindow.document;
    docFrame.open();
    docFrame.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>NMC Prescription - ${hospitalName}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>@page { size: A4 portrait; margin: 12mm; } body { margin: 0; }</style>
      </head>
      <body>${printContent.outerHTML}</body>
      </html>
    `);
    docFrame.close();

    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      setTimeout(() => document.body.removeChild(iframe), 1000);
    }, 600);
  };

  // Submit NMC Prescription Formulation (Multipart FormData to POST /prescription/add)
  const handleFinalizeAndSubmit = async () => {
    try {
      setSubmitting(true);

      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas-pro'),
        import('jspdf')
      ]);

      const element = printAreaRef.current;
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const pdf = new jsPDF('p', 'mm', 'a4');
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, (canvas.height * 210) / canvas.width);
      const pdfBlob = pdf.output('blob');

      // Construct Exact Multipart FormData Keys
      const formData = new FormData();
      formData.append('appointmentId', String(targetApptId));
      formData.append('medicines', JSON.stringify(medicines));
      
      if (diagnosisList && diagnosisList.length > 0) {
        formData.append('diagnosis', JSON.stringify(Array.isArray(diagnosisList) ? diagnosisList : [diagnosisList]));
      }
      if (chiefComplaints) {
        formData.append('chiefComplaints', String(chiefComplaints));
      }
      if (adviceGiven) {
        formData.append('advice', String(adviceGiven));
      }
      if (vitals && (vitals.bp || vitals.pulse || vitals.temp || vitals.spo2)) {
        formData.append('vitals', JSON.stringify(vitals));
      }

      // Compiled Prescription Sheet PDF
      formData.append('prescriptionPdf', pdfBlob, `rx-${bookingId}.pdf`);

      const res = await HospitalDoctorAPI.addPrescription(formData);

      if (res && (res.success || res.appointmentStatus === 'Completed')) {
        alert(res.message || 'NMC Prescription generated successfully!');
        if (onCompleteCase) await onCompleteCase(targetApptId, active);
        onClose();
      } else {
        alert(res?.message || 'Failed to submit prescription.');
      }
    } catch (err) {
      console.error('Submit Rx error:', err);
      alert('Error submitting prescription: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto font-sans">
      <div className="absolute inset-0" onClick={onClose}></div>

      <div className="relative bg-white w-full max-w-[210mm] rounded-3xl shadow-2xl overflow-hidden my-8 flex flex-col p-6 z-10 animate-in fade-in duration-200">
        {/* Controls Bar */}
        <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-100 gap-3 flex-wrap">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
          >
            Close
          </button>
          <span className="font-extrabold text-sm text-slate-800">
            {isViewOnly ? 'Official Prescription Record' : 'Step 2: Review Letterhead & Sign-off'}
          </span>

          <div className="flex items-center gap-2">
            {!isViewOnly && onEdit && (
              <button
                onClick={onEdit}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                &larr; Edit Formulations
              </button>
            )}

            <button
              onClick={handlePrint}
              className="px-5 py-2.5 bg-slate-800 hover:bg-black text-white rounded-xl text-xs font-black shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <FaPrint size={12} /> Print
            </button>

            {!isViewOnly && (
              <button
                onClick={handleFinalizeAndSubmit}
                disabled={submitting}
                className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                {submitting ? <FaSpinner className="animate-spin" size={10} /> : 'Complete Visit & Upload PDF'}
              </button>
            )}
          </div>
        </div>

        {/* Printable Layout */}
        <div className="overflow-y-auto max-h-[75vh] pr-1">
          {loading ? (
            <div className="py-20 text-center text-slate-400 flex flex-col items-center justify-center">
              <FaSpinner className="animate-spin text-emerald-500 mb-2 w-6 h-6" />
              <span>Loading official prescription record...</span>
            </div>
          ) : (
            <div
              ref={printAreaRef}
              className="print-target relative bg-white w-full p-8 text-black leading-normal select-none overflow-hidden border border-slate-100 shadow-xs rounded-2xl space-y-6"
            >
              <div className="absolute top-0 left-0 w-28 h-20 bg-emerald-600 rounded-br-[80px] pointer-events-none z-0"></div>

              {/* Header: Left Side (Bigger Logo) & Right Side (Hospital Name & Doctor Info) */}
              <div className="flex justify-between items-start mb-6 pt-2 relative z-10 border-b border-slate-200/80 pb-5 gap-6">
                
                {/* LEFT SIDE: Big Logo without Hospital Photo */}
                <div className="flex flex-col items-start gap-2 shrink-0 pl-1">
                  <div className="bg-white p-2 rounded-2xl shrink-0 flex items-center justify-center shadow-xs border border-slate-200">
                    <img
                      src="/logo.png"
                      alt="Health Kangaroo Logo"
                      className="h-16 sm:h-20 w-auto object-contain"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  </div>
                  <span className="text-[9px] font-black uppercase text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 tracking-wider">
                    NMC Formatted Rx
                  </span>
                </div>

                {/* RIGHT SIDE: Real Hospital Name & Doctor Info */}
                <div className="text-right flex-1 min-w-0 space-y-2">
                  
                  {/* Real Hospital Name & Address */}
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                      {hospitalName}
                    </h2>
                    {hospitalFullAddress && (
                      <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wide mt-0.5">
                        {hospitalFullAddress}
                      </p>
                    )}
                  </div>

                  {/* Doctor Details */}
                  <div className="pt-2 border-t border-slate-100 space-y-0.5">
                    <h3 className="text-base font-black text-emerald-800 uppercase tracking-tight">
                      Dr. {doctorName}
                    </h3>
                    <p className="text-[11px] text-slate-700 font-extrabold uppercase">
                      {speciality} {qualification && `• ${qualification}`}
                    </p>
                    <div className="flex items-center justify-end gap-2 text-[9px] text-slate-400 font-bold uppercase pt-0.5 flex-wrap">
                      {registrationNumber && <span>Reg No: {registrationNumber}</span>}
                      {councilName && <span>({councilName})</span>}
                      {cabinRoom && <span>• {cabinRoom}</span>}
                      <span>• Date: {prescriptionGeneratedDate}</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Patient Details Grid */}
              <div className="border border-slate-200 bg-slate-50/70 rounded-2xl p-4 text-xs space-y-2">
                <div className="grid grid-cols-3 gap-2 border-b border-slate-200/60 pb-2">
                  <div>
                    <span className="text-slate-400 text-[10px] font-extrabold uppercase block">Patient Name</span>
                    <span className="font-black text-slate-900">{patientName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] font-extrabold uppercase block">Age / Gender</span>
                    <span className="font-bold text-slate-800">{patientAge} Yrs &bull; {patientGender}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] font-extrabold uppercase block">Booking ID</span>
                    <span className="font-mono font-bold text-slate-800">#{bookingId}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-400 text-[10px] font-extrabold uppercase block">Chief Complaints</span>
                    <p className="font-bold text-slate-800">{chiefComplaints}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] font-extrabold uppercase block">Provisional Diagnosis</span>
                    <p className="font-black text-slate-900">{diagnosisText}</p>
                  </div>
                </div>

                {/* Vitals */}
                {(vitals.bp || vitals.pulse || vitals.temp || vitals.spo2) && (
                  <div className="grid grid-cols-4 gap-2 border-t border-slate-200/50 pt-2 text-center">
                    {vitals.bp && <div><span className="text-[8px] text-slate-400 font-bold uppercase block">BP</span><span className="font-black text-slate-800">{vitals.bp}</span></div>}
                    {vitals.pulse && <div><span className="text-[8px] text-slate-400 font-bold uppercase block">Pulse</span><span className="font-black text-slate-800">{vitals.pulse} bpm</span></div>}
                    {vitals.temp && <div><span className="text-[8px] text-slate-400 font-bold uppercase block">Temp</span><span className="font-black text-slate-800">{vitals.temp} °F</span></div>}
                    {vitals.spo2 && <div><span className="text-[8px] text-slate-400 font-bold uppercase block">SpO2</span><span className="font-black text-emerald-600">{vitals.spo2}%</span></div>}
                  </div>
                )}
              </div>

              {/* NMC Formatted Medicines Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden mt-4">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-emerald-600 text-white font-black">
                      <th className="py-2.5 px-3 w-10 text-center">#</th>
                      <th className="py-2.5 px-3">Medicine Formulation</th>
                      <th className="py-2.5 px-3 w-28 text-center">Dosage Interval</th>
                      <th className="py-2.5 px-3 w-36 text-center">Timing (Sig)</th>
                      <th className="py-2.5 px-3 w-24 text-center">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {medicines.map((m, idx) => (
                      <tr key={idx} className="h-12 hover:bg-slate-50">
                        <td className="text-center font-bold text-emerald-600">{idx + 1}</td>
                        <td className="px-3">
                          <p className="font-black text-slate-900 uppercase">{m.name} {m.strength}</p>
                          {m.instructions && <p className="text-[10px] text-slate-400 italic">{m.instructions}</p>}
                        </td>
                        <td className="text-center font-bold text-slate-800">{m.doseInterval || m.dosage || m.dose || "1-0-1"}</td>
                        <td className="text-center text-[10px] font-bold text-amber-700">{m.administrationTiming || m.instructions || m.timing || "p.c."}</td>
                        <td className="text-center font-semibold text-slate-700">{m.duration || "5 days"}</td>
                      </tr>
                    ))}
                    {medicines.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-xs text-slate-400 font-bold uppercase">
                          No medicines prescribed. Routine checkup &amp; advice.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Directives & Follow-up */}
              {(adviceGiven || nextAppointment) && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1.5">
                  {adviceGiven && (
                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-400 block">Doctor Advice</span>
                      <p className="font-bold text-slate-800">{adviceGiven}</p>
                    </div>
                  )}
                  {nextAppointment && (
                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-400 block">Next Follow-up</span>
                      <p className="font-black text-emerald-700">{nextAppointment}</p>
                    </div>
                  )}
                </div>
              )}

              {/* QR & Signature */}
              <div className="flex justify-between items-end pt-4 border-t border-slate-200 mt-6">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-white border border-slate-200 rounded-xl p-1 flex items-center justify-center shrink-0">
                    <img src={qrUrl} alt="QR" className="w-full h-full object-contain" />
                  </div>
                  <div className="text-[9px] text-slate-400">
                    <p className="font-black text-slate-800 text-[10px]">Verification QR Code</p>
                    <p>Verified digital OPD medical record by {hospitalName}.</p>
                  </div>
                </div>

                <div className="text-right min-w-[140px]">
                  {signatureSrc ? (
                    <img src={signatureSrc} alt="Doctor Signature" className="h-10 w-auto mb-1 ml-auto mix-blend-multiply" />
                  ) : (
                    <span className="text-xs font-serif italic text-slate-400 border-b border-dashed border-slate-300 pb-1 px-4 block mb-2">
                      Digitally Authorized
                    </span>
                  )}
                  <p className="text-xs font-black text-slate-900">Dr. {doctorName}</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase">{speciality}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}