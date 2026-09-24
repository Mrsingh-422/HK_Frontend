'use client'

import React, { useEffect, useState } from 'react'
import { 
  FaTimes, FaUserMd, FaProcedures, FaClock, FaHeartbeat, 
  FaFilePrescription, FaPrint, FaTint, FaRegCalendarAlt, 
  FaCreditCard, FaShieldAlt, FaDownload, FaFilePdf, FaAmbulance, 
  FaUser, FaFileAlt, FaPhone, FaEnvelope, FaDollarSign, FaHistory, FaMapMarkerAlt,
  FaExchangeAlt, FaHospital, FaNotesMedical, FaCoins
} from 'react-icons/fa'
import HospitalAPI from '@/app/services/HospitalAPI';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const PatientDetailModal = ({ appointmentId, patientData, onClose }) => {
  const [data, setData] = useState(patientData || null);
  const [loading, setLoading] = useState(!patientData);
  const [activeTab, setActiveTab] = useState('clinical'); // 'clinical' | 'billing' | 'careteam' | 'account'

  useEffect(() => {
    if (appointmentId && !patientData) {
      loadClinicalCaseFile();
    }
  }, [appointmentId, patientData]);

  const loadClinicalCaseFile = async () => {
    setLoading(true);
    try {
      const response = await HospitalAPI.getAdmissionDetails(appointmentId);
      if (response?.success) {
        setData(response.data);
      }
    } catch (error) {
      console.error("Clinical fetching error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getFullUrl = (path) => {
    if (!path) return '#';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const base = API_BASE_URL ? API_BASE_URL.replace(/\/$/, '') : '';
    const cleanPath = path.replace(/^\//, '').replace(/^public\//, '');
    return base ? `${base}/${cleanPath}` : `/${cleanPath}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!appointmentId) return null;

  // Resolve API wrapping
  const rawPatient = data?.patient ? data.patient : (data?.patients ? data : (data || {}));
  const prescription = data?.prescription || null;

  // Primary Patient attributes supporting patientDetails and patients[0]
  const mainPatient = rawPatient.patientDetails || rawPatient.patients?.[0] || {};
  const patientName = mainPatient.patientName || mainPatient.name || rawPatient.userId?.name || "Unknown Patient";
  const patientAge = mainPatient.age !== undefined ? mainPatient.age : (mainPatient.patientAge || "N/A");
  const patientGender = mainPatient.gender || rawPatient.userId?.gender || "N/A";
  const relation = mainPatient.relation || "Self";
  const reasonForVisit = mainPatient.reasonForVisit || "N/A";
  const profilePic = mainPatient.profilePic || rawPatient.userId?.profilePic;

  // Nested structures from payload
  const userId = rawPatient.userId || {};
  const doctor = rawPatient.assignedDoctor || rawPatient.doctorId || {};
  const bed = rawPatient.bedDetails || rawPatient.bedId || {};
  const ward = bed.wardId || {};
  const clinical = rawPatient.clinicalSummary || {};
  const pricing = rawPatient.pricingBreakdown || {};
  const payment = rawPatient.paymentDetails || {};
  const insurance = rawPatient.insuranceDetails || {};
  const cancellation = rawPatient.cancellationDetails || {};
  const clinicalFiles = rawPatient.clinicalFiles || {};
  const billingBreakdown = rawPatient.billingBreakdown || {};
  const treatmentTeamTimeline = rawPatient.treatmentTeamTimeline || [];

  const bloodGroup = mainPatient.bloodGroup || clinical.bloodGroup || "N/A";

  // File downloads
  const dischargePdfUrl = clinicalFiles.dischargeSummaryPdf || clinical.dischargeSummaryPdf;
  const dietPlanPdfUrl = clinicalFiles.dietPlanPdf;
  const dischargeCardUrl = clinicalFiles.dischargeCardUrl;
  const reportsList = clinicalFiles.clinicalReports || clinical.uploadedReports || [];

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const specialServicesHtml = rawPatient.specialServices && rawPatient.specialServices.length > 0
      ? rawPatient.specialServices.map(s => `
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 12px;">
            <span>${s.serviceName}</span>
            <strong>₹${s.price}</strong>
          </div>
        `).join('')
      : '<p style="font-style: italic; color: #94a3b8; font-size: 12px; margin: 0;">No special service charges registered.</p>';

    const treatmentLogsHtml = rawPatient.treatmentHistory && rawPatient.treatmentHistory.length > 0
      ? rawPatient.treatmentHistory.map(log => `
          <div style="border-left: 2px solid #08B36A; padding-left: 10px; margin-bottom: 12px;">
            <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: bold; color: #0f172a;">
              <span>${log.action || 'Timeline Entry'}</span>
              <span style="font-size: 10px; color: #64748b;">${formatDateTime(log.timestamp)}</span>
            </div>
            <p style="margin: 3px 0; font-size: 11px; color: #475569;">${log.notes || ''}</p>
            ${log.fromDoctorId ? `<span style="font-size: 9px; color: #94a3b8;">Logged by: Dr. ${log.fromDoctorId.name}</span>` : ''}
          </div>
        `).join('')
      : '<p style="font-style: italic; color: #94a3b8; font-size: 12px; margin: 0;">No treatment timeline history logged.</p>';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Discharge Case File - ${rawPatient.bookingId || 'N/A'}</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; color: #1e293b; padding: 30px; line-height: 1.4; }
          .header { border-bottom: 3px solid #08B36A; padding-bottom: 15px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: flex-end; }
          .title { margin: 0; font-size: 20px; font-weight: 900; }
          .sub { color: #64748b; font-size: 11px; margin-top: 4px; font-weight: bold; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
          .card { background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; }
          .card-title { font-size: 10px; font-weight: bold; color: #08B36A; text-transform: uppercase; margin-top: 0; margin-bottom: 10px; letter-spacing: 0.05em; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; }
          .info-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .info-table td, .info-table th { padding: 8px 10px; border: 1px solid #e2e8f0; font-size: 11px; }
          .info-table th { background: #f8fafc; text-align: left; font-size: 9px; text-transform: uppercase; color: #64748b; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 class="title">HOSPITAL DISCHARGE DOSSIER</h1>
            <div class="sub">Booking ID: ${rawPatient.bookingId || 'N/A'} | Status: ${rawPatient.status || 'N/A'}</div>
          </div>
          <div style="text-align: right; font-size: 11px; color: #64748b;">
            Admission: ${formatDate(rawPatient.startDate)}<br/>
            Printed On: ${new Date().toLocaleDateString('en-GB')}
          </div>
        </div>

        <div class="grid">
          <div class="card">
            <h3 class="card-title">Patient Profile</h3>
            <strong style="font-size: 14px; color: #0f172a;">${patientName}</strong>
            <p style="margin: 4px 0 0 0; font-size: 11px; color: #475569;">Age: ${patientAge} Yrs | Gender: ${patientGender} | Relation: ${relation}</p>
            <p style="margin: 6px 0 0 0; font-size: 11px; color: #64748b;"><strong>Chief Complaint / Reason:</strong> ${clinical.chiefComplaint || reasonForVisit}</p>
          </div>
          <div class="card">
            <h3 class="card-title">Lead Medical Professional</h3>
            <strong style="font-size: 14px; color: #0f172a;">${doctor.name ? (doctor.name.startsWith('Dr.') ? doctor.name : `Dr. ${doctor.name}`) : 'N/A'}</strong>
            <p style="margin: 4px 0 0 0; font-size: 11px; color: #475569;">${doctor.speciality || 'General Medicine'} | ${doctor.qualification || ''}</p>
          </div>
        </div>

        <table class="info-table">
          <thead>
            <tr>
              <th>Ward Allocation</th>
              <th>Bed Assigned</th>
              <th>Stay Period</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>${bed.wardName || rawPatient.wardName || ward.name || 'N/A'}</strong></td>
              <td>Bed ${bed.bedNumber || rawPatient.bedNumber || 'N/A'}</td>
              <td>${formatDate(rawPatient.startDate)} to ${formatDate(rawPatient.endDate || rawPatient.dischargedAt)}</td>
              <td><strong>${billingBreakdown.baseStayDays || rawPatient.stayDuration || 0} Days</strong></td>
            </tr>
          </tbody>
        </table>

        <div class="grid">
          <div class="card">
            <h3 class="card-title">Diagnostics & Surgical Records</h3>
            <p style="margin: 4px 0; font-size: 11px;"><strong>Diagnosis:</strong> ${clinical.diagnosis || 'Pending'}</p>
            <p style="margin: 4px 0; font-size: 11px;"><strong>Investigations:</strong> ${clinical.investigation || 'Pending'}</p>
            <p style="margin: 4px 0; font-size: 11px;"><strong>Blood Group:</strong> ${bloodGroup} | <strong>Priority:</strong> ${clinical.triagePriority || rawPatient.triageLevel || 'N/A'}</p>
          </div>
          <div class="card">
            <h3 class="card-title">Admission & Discharge Conditions</h3>
            <p style="margin: 4px 0; font-size: 11px;"><strong>At Admission:</strong> ${clinical.conditionDuringAdmission || 'N/A'}</p>
            <p style="margin: 4px 0; font-size: 11px;"><strong>At Discharge:</strong> ${clinical.conditionDuringDischarge || 'N/A'}</p>
            <p style="margin: 4px 0; font-size: 11px;"><strong>Discharged Timestamp:</strong> ${formatDateTime(rawPatient.dischargedAt || clinical.dischargedAt)}</p>
          </div>
        </div>

        <div class="grid">
          <div class="card">
            <h3 class="card-title">Billing Ledger (INR)</h3>
            <div style="font-size: 11px; color: #475569;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 3px;"><span>Base Stay Charge:</span> <span>₹${billingBreakdown.baseStayCharge || pricing.baseFee || 0}</span></div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 3px;"><span>Paid On Booking:</span> <span>₹${billingBreakdown.paidOnBooking || 0}</span></div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 3px; color: #ef4444;"><span>Remaining Balance:</span> <span>₹${billingBreakdown.remainingBalance || 0}</span></div>
              <div style="display: flex; justify-content: space-between; margin-top: 5px; padding-top: 5px; border-top: 1px solid #e2e8f0; font-weight: bold; color: #08B36A; font-size: 13px;">
                <span>Current Total:</span> <span>₹${billingBreakdown.currentBillAmount || rawPatient.totalAmount || 0}</span>
              </div>
            </div>
          </div>
          <div class="card">
            <h3 class="card-title">Special Services Applied</h3>
            ${specialServicesHtml}
          </div>
        </div>

        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() { window.close(); };
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 md:p-4 overflow-y-auto font-sans">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose}></div>
      
      <div className="relative bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        
        {/* Header Section */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Clinical Case File</h2>
              {rawPatient.bookingId && (
                <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-lg text-[9px] font-black uppercase tracking-widest">
                  #{rawPatient.bookingId}
                </span>
              )}
              {rawPatient.triageLevel && (
                <span className="text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider bg-rose-50 text-rose-600 border border-rose-200">
                  Triage: {rawPatient.triageLevel}
                </span>
              )}
            </div>
            <p className="text-slate-400 font-bold text-xs mt-0.5">Discharge Candidate Record • Clinical Audit</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handlePrint}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition"
            >
              <FaPrint size={12} /> Print File
            </button>
            <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-rose-500 rounded-xl transition-all">
              <FaTimes size={16} />
            </button>
          </div>
        </div>

        {/* Modal Secondary Navigation Tab Bar */}
        <div className="flex bg-slate-50 border-b border-slate-100 px-6 pt-3 gap-2 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('clinical')}
            className={`pb-3 px-3 text-xs font-black uppercase tracking-wider border-b-2 transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'clinical' ? 'border-[#08B36A] text-[#08B36A]' : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <FaHeartbeat /> Case & Diagnostics
          </button>
          <button
            onClick={() => setActiveTab('billing')}
            className={`pb-3 px-3 text-xs font-black uppercase tracking-wider border-b-2 transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'billing' ? 'border-[#08B36A] text-[#08B36A]' : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <FaCreditCard /> Financial Ledger
          </button>
          <button
            onClick={() => setActiveTab('careteam')}
            className={`pb-3 px-3 text-xs font-black uppercase tracking-wider border-b-2 transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'careteam' ? 'border-[#08B36A] text-[#08B36A]' : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <FaUserMd /> Care Team & History
          </button>
          <button
            onClick={() => setActiveTab('account')}
            className={`pb-3 px-3 text-xs font-black uppercase tracking-wider border-b-2 transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'account' ? 'border-[#08B36A] text-[#08B36A]' : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <FaUser /> Booking Account
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 md:p-8 overflow-y-auto flex-grow min-h-0 bg-white">
          {loading ? (
            <div className="py-20 flex flex-col justify-center items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#08B36A] mb-3"></div>
              <span className="text-xs text-slate-400 font-extrabold uppercase">Fetching complete database records...</span>
            </div>
          ) : data ? (
            <div className="space-y-6">
              
              {/* Profile Card Banner */}
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center bg-slate-50 p-5 rounded-2xl border border-slate-100">
                {profilePic ? (
                  <img 
                    src={getFullUrl(profilePic)} 
                    alt={patientName} 
                    className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shrink-0" 
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-2xl font-black text-[#08B36A] border border-slate-200 shrink-0">
                    {patientName.charAt(0) || '?'}
                  </div>
                )}
                <div className="flex-grow">
                  <h3 className="text-lg font-black text-slate-900 leading-tight">{patientName}</h3>
                  <div className="flex flex-wrap gap-3 text-xs font-semibold text-slate-400 mt-1">
                    <span>{patientAge} Years &bull; {patientGender} ({relation})</span>
                    {bloodGroup !== 'N/A' && (
                      <>
                        <span>&bull;</span>
                        <span className="text-rose-500 flex items-center gap-1 font-bold">
                          <FaTint size={10} /> Blood: {bloodGroup}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Ward Location</span>
                  <div className="flex items-center gap-1.5 text-slate-800 font-black bg-white px-3 py-1.5 rounded-lg shadow-sm border border-slate-150 text-xs">
                    <FaProcedures className="text-[#08B36A]" /> {bed.wardName || rawPatient.wardName || ward.name || "N/A"} (Bed: {bed.bedNumber || rawPatient.bedNumber || "N/A"})
                  </div>
                </div>
              </div>

              {/* TAB 1: CLINICAL DIAGNOSTICS & FILES */}
              {activeTab === 'clinical' && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  
                  {/* Case Complaint & Diagnosis summaries */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50/50 border border-slate-150 rounded-2xl space-y-3 text-xs">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1">Reason & Admission Context</h4>
                      <div>
                        <p className="font-bold text-slate-400 uppercase text-[9px]">Reason for Visit:</p>
                        <p className="font-semibold text-slate-700 mt-0.5">{reasonForVisit || clinical.chiefComplaint || "N/A"}</p>
                      </div>
                      <div>
                        <p className="font-bold text-slate-400 uppercase text-[9px]">Admission Details / Note:</p>
                        <p className="font-semibold text-slate-700 mt-0.5">{clinical.admissionNote || "N/A"}</p>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50/50 border border-slate-150 rounded-2xl space-y-3 text-xs">
                      <h4 className="text-[10px] font-black text-[#08B36A] uppercase tracking-wider border-b border-[#08B36A]/10 pb-1">Diagnosis & Outcome Summary</h4>
                      <div>
                        <p className="font-bold text-slate-400 uppercase text-[9px]">Clinical Diagnosis:</p>
                        <p className="font-bold text-[#08B36A] mt-0.5">{clinical.diagnosis || "Diagnosis pending clinical validation."}</p>
                      </div>
                      <div>
                        <p className="font-bold text-slate-400 uppercase text-[9px]">Investigation Notes:</p>
                        <p className="font-semibold text-slate-700 mt-0.5">{clinical.investigation || "Pending investigations"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Operational Timeline and Discharge details */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-150 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Admission Start</span>
                      <strong className="text-slate-800 font-extrabold block mt-0.5">{formatDate(rawPatient.startDate)}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Discharged Date</span>
                      <strong className="text-slate-800 font-extrabold block mt-0.5">{formatDate(rawPatient.dischargedAt || rawPatient.endDate)}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Triage Priority</span>
                      <strong className="text-rose-600 font-extrabold block mt-0.5">{clinical.triagePriority || rawPatient.triageLevel || "N/A"}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Outcome Result</span>
                      <strong className="text-indigo-600 font-extrabold block mt-0.5">{clinical.treatmentResult || "Discharged"}</strong>
                    </div>
                  </div>

                  {/* Conditions Admission vs Discharge */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-amber-50/40 border border-amber-200/60 rounded-2xl text-xs">
                      <span className="text-[9px] font-black text-amber-800 uppercase tracking-widest block mb-1">State at Admission</span>
                      <p className="font-bold text-slate-700">{clinical.conditionDuringAdmission || "N/A"}</p>
                    </div>
                    <div className="p-4 bg-emerald-50/40 border border-emerald-200/60 rounded-2xl text-xs">
                      <span className="text-[9px] font-black text-emerald-800 uppercase tracking-widest block mb-1">State at Discharge</span>
                      <p className="font-bold text-slate-700">{clinical.conditionDuringDischarge || "N/A"}</p>
                      {clinical.dischargeNote && (
                        <p className="mt-2 text-[11px] text-slate-600 border-t border-emerald-100 pt-1 leading-relaxed">
                          <strong>Discharge Note:</strong> {clinical.dischargeNote}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Clinical Files Downloads */}
                  <div className="p-5 bg-slate-900 text-white rounded-2xl border border-slate-800">
                    <h4 className="text-xs font-black uppercase tracking-wider text-[#08B36A] mb-3 flex items-center gap-2">
                      <FaFilePdf /> Clinical Reports & Generated Case Forms
                    </h4>
                    <div className="flex flex-wrap gap-2.5">
                      {dischargePdfUrl ? (
                        <a
                          href={getFullUrl(dischargePdfUrl)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-[#08B36A] hover:bg-[#079d5c] text-white text-xs font-bold rounded-xl transition"
                        >
                          <FaDownload /> Download Discharge Summary PDF
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No summary PDF generated yet.</span>
                      )}

                      {dietPlanPdfUrl && (
                        <a
                          href={getFullUrl(dietPlanPdfUrl)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition border border-slate-700"
                        >
                          <FaDownload /> Diet Plan PDF
                        </a>
                      )}

                      {dischargeCardUrl && (
                        <a
                          href={getFullUrl(dischargeCardUrl)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition border border-slate-700"
                        >
                          <FaDownload /> Discharge Prescription Card
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Uploaded Diagnostic lab reports */}
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 ml-1">Uploaded Clinical Reports ({reportsList.length})</h4>
                    {reportsList.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {reportsList.map((report, idx) => {
                          const isPdf = report.toLowerCase().endsWith('.pdf');
                          return (
                            <a 
                              key={idx}
                              href={getFullUrl(report)} 
                              target="_blank" 
                              rel="noreferrer"
                              className="flex items-center space-x-2.5 p-3 border border-[#08B36A]/20 hover:bg-[#08B36A]/5 rounded-xl text-[#08B36A] font-bold transition"
                            >
                              <FaFilePrescription size={14} className="flex-shrink-0" />
                              <span className="truncate">View Laboratory File #{idx + 1} ({isPdf ? 'PDF' : 'Image'})</span>
                            </a>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400 italic pl-1">No lab reports attached to this case dossier.</p>
                    )}
                  </div>

                </div>
              )}

              {/* TAB 2: FINANCIAL BREAKDOWN */}
              {activeTab === 'billing' && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  
                  {/* Unified Stay Breakdown Card from billingBreakdown */}
                  {billingBreakdown && Object.keys(billingBreakdown).length > 0 && (
                    <div className="p-5 bg-emerald-50/40 border border-emerald-100 rounded-2xl text-xs space-y-3">
                      <h4 className="text-xs font-black text-[#08B36A] uppercase tracking-wider border-b border-emerald-200 pb-2 flex items-center gap-1.5">
                        <FaHospital /> Active Bed Stay Summary
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <span className="text-slate-400 font-bold block uppercase text-[9px]">Stay Unit Charge:</span>
                          <strong className="text-slate-800 text-sm font-black">₹{billingBreakdown.bedPricePerDay || bed.pricePerDay || 0} / Day</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 font-bold block uppercase text-[9px]">Base Stay Duration:</span>
                          <strong className="text-slate-800 text-sm font-black">{billingBreakdown.baseStayDays || 0} Days</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 font-bold block uppercase text-[9px]">Accumulated Base Fee:</span>
                          <strong className="text-slate-800 text-sm font-black">₹{billingBreakdown.baseStayCharge || 0}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 font-bold block uppercase text-[9px]">Paid On Booking:</span>
                          <strong className="text-emerald-700 text-sm font-black">
                            ₹{billingBreakdown.paidOnBooking || 0}
                          </strong>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2 border-t border-emerald-100">
                        <div>
                          <span className="text-slate-400 font-bold block uppercase text-[9px]">Overstay Allocation:</span>
                          <strong className="text-rose-600 font-black">
                            {billingBreakdown.overstayDays || 0} Days (₹{billingBreakdown.overstayCharge || 0})
                          </strong>
                        </div>
                        <div>
                          <span className="text-slate-400 font-bold block uppercase text-[9px]">Remaining Balance:</span>
                          <strong className="text-rose-600 text-sm font-black">
                            ₹{billingBreakdown.remainingBalance || 0}
                          </strong>
                        </div>
                        <div>
                          <span className="text-slate-400 font-bold block uppercase text-[9px]">Current Bill Total:</span>
                          <strong className="text-[#08B36A] text-base font-black">
                            ₹{billingBreakdown.currentBillAmount || billingBreakdown.estimatedTotal || 0}
                          </strong>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Itemized pricing breakdown */}
                    <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs">
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">Itemized Ledger (INR)</h4>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-semibold">Base Bed Allocation Charge:</span>
                        <span className="font-extrabold text-slate-800">₹{billingBreakdown.baseStayCharge || pricing.baseFee || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-semibold">Doctor Visit / Consultation:</span>
                        <span className="font-extrabold text-slate-800">₹{pricing.visitCharges || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-semibold">Extra Facilities Fee:</span>
                        <span className="font-extrabold text-slate-800">₹{pricing.extraCharges || 0}</span>
                      </div>
                      <div className="flex justify-between text-rose-600 font-bold">
                        <span>Discounts / Deductions:</span>
                        <span>-₹{pricing.discountAmount || 0}</span>
                      </div>
                      <div className="border-t border-slate-200 pt-3 flex justify-between font-black text-slate-900 text-sm">
                        <span>Total Invoice Value:</span>
                        <span className="text-[#08B36A] text-base">₹{billingBreakdown.currentBillAmount || rawPatient.totalAmount || 0}</span>
                      </div>
                    </div>

                    {/* Payment Transactions & Gateways */}
                    <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs font-medium">
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">Gateway Transactions</h4>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-semibold">Payment Status:</span>
                        <span className={`font-black uppercase ${rawPatient.paymentStatus === 'Paid' || billingBreakdown.remainingBalance === 0 ? 'text-green-600' : 'text-amber-500'}`}>
                          {rawPatient.paymentStatus || 'Discharge-Pending'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-semibold">Transaction ID:</span>
                        <span className="font-bold text-slate-800 font-mono">{rawPatient.transactionId || rawPatient.bookingId || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-semibold">Deposit Paid On Booking:</span>
                        <span className="font-bold text-emerald-700 font-mono">₹{billingBreakdown.paidOnBooking || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-semibold">Pending Departure Balance:</span>
                        <span className="font-black text-rose-600 font-mono">₹{billingBreakdown.remainingBalance || 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Special Services */}
                  {rawPatient.specialServices && rawPatient.specialServices.length > 0 && (
                    <div className="border border-slate-200 rounded-2xl p-4">
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-3 border-b border-slate-100 pb-2">Extra Services Billed</h4>
                      <div className="space-y-2">
                        {rawPatient.specialServices.map((srv) => (
                          <div key={srv._id} className="flex justify-between text-xs p-2.5 bg-slate-50 rounded-xl">
                            <span className="font-bold text-slate-700">{srv.serviceName}</span>
                            <span className="font-black text-slate-900">₹{srv.price}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* TAB 3: MEDICAL CARE TEAM & TIMELINE LOGS */}
              {activeTab === 'careteam' && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  
                  {/* Doctor Profile */}
                  <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                    <div className="w-14 h-14 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xl shrink-0">
                      <FaUserMd />
                    </div>
                    <div className="text-xs">
                      <span className="text-[9px] font-black uppercase text-[#08B36A]">Primary Duty Physician</span>
                      <h4 className="font-black text-slate-900 text-sm">
                        {doctor.name ? (doctor.name.startsWith('Dr.') ? doctor.name : `Dr. ${doctor.name}`) : 'Lead Consultant'}
                      </h4>
                      <p className="text-slate-600 font-bold">{doctor.speciality || 'General Medicine'}</p>
                      {doctor.qualification && (
                        <p className="text-slate-400 mt-0.5">Qualifications: {doctor.qualification}</p>
                      )}
                    </div>
                  </div>

                  {/* Treatment Team Timeline */}
                  {treatmentTeamTimeline && treatmentTeamTimeline.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2.5 ml-1">Treatment Team Timeline</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {treatmentTeamTimeline.map((team, index) => (
                          <div key={index} className="flex gap-3 p-3.5 border border-slate-150 rounded-2xl text-xs bg-slate-50/55">
                            {team.profileImage ? (
                              <img src={getFullUrl(team.profileImage)} alt={team.name} className="w-11 h-11 rounded-xl object-cover border shrink-0" />
                            ) : (
                              <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0"><FaUserMd /></div>
                            )}
                            <div>
                              <p className="font-extrabold text-slate-800">Dr. {team.name}</p>
                              <p className="text-[10px] text-[#08B36A] font-black uppercase tracking-wide">{team.role || 'Physician'}</p>
                              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{team.speciality} &bull; {team.qualification}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bedside Care team status */}
                  {rawPatient.bedsideCareTeam && rawPatient.bedsideCareTeam.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 ml-1">Bedside Specialist Shifts</h4>
                      <div className="space-y-2">
                        {rawPatient.bedsideCareTeam.map((doc, idx) => {
                          const docObj = typeof doc.doctorId === 'object' ? doc.doctorId : { name: "Specialist Consultant", speciality: "Attending" };
                          return (
                            <div key={idx} className="flex justify-between items-center p-3 bg-white border border-slate-200 rounded-xl text-xs">
                              <div className="flex items-center space-x-2.5">
                                <FaUserMd className="text-[#08B36A]" />
                                <div>
                                  <p className="font-bold text-slate-800">{docObj.name}</p>
                                  <p className="text-[10px] text-slate-400 font-medium">{docObj.speciality || "Specialist"}</p>
                                </div>
                              </div>
                              <span className="text-[9px] font-bold bg-[#08B36A]/10 text-[#08B36A] px-2.5 py-1 rounded-md">
                                {doc.status || "Completed"}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* TAB 4: BOOKING USER PROFILE */}
              {activeTab === 'account' && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  
                  {/* Account profile */}
                  <div className="p-5 border border-slate-200 rounded-2xl flex items-center gap-4 text-xs">
                    {profilePic ? (
                      <img src={getFullUrl(profilePic)} alt="profile" className="w-14 h-14 rounded-full object-cover border shrink-0" />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xl shrink-0">
                        <FaUser />
                      </div>
                    )}
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-[#08B36A] uppercase block">Dossier Registered Account</span>
                      <h4 className="font-extrabold text-slate-900 text-sm">{patientName}</h4>
                      {userId.phone && <p className="text-slate-600 flex items-center gap-1.5"><FaPhone /> {userId.phone}</p>}
                      {userId.email && <p className="text-slate-600 flex items-center gap-1.5"><FaEnvelope /> {userId.email}</p>}
                    </div>
                  </div>

                  {/* Booking Metadata Metrics */}
                  <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-medium">
                    <div>
                      <span className="text-slate-400 font-bold block uppercase text-[9px]">Booking Type</span>
                      <strong className="text-slate-800 text-xs block mt-0.5">{rawPatient.bookingType || "Admission"}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block uppercase text-[9px]">Booking ID</span>
                      <strong className="text-[#08B36A] text-xs block mt-0.5 uppercase tracking-wide">#{rawPatient.bookingId}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block uppercase text-[9px]">Stay Duration</span>
                      <strong className="text-slate-800 text-xs block mt-0.5">{billingBreakdown.baseStayDays || rawPatient.stayDuration || 0} Days</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block uppercase text-[9px]">Status</span>
                      <strong className="text-amber-600 text-xs block mt-0.5 uppercase">{rawPatient.status || "Discharge-Pending"}</strong>
                    </div>
                  </div>

                </div>
              )}

            </div>
          ) : (
            <div className="py-12 text-center text-slate-400">Failed to load dossier file details.</div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 flex gap-3 shrink-0">
          <button onClick={handlePrint} className="flex-1 bg-slate-900 text-white py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-black transition-all">
            <FaPrint /> PRINT OFFICIAL DISCHARGE FORM
          </button>
          <button 
            onClick={onClose}
            className="flex-1 bg-white border border-slate-200 text-slate-500 py-3 rounded-xl font-bold text-xs hover:border-slate-350 hover:text-slate-850 transition-all"
          >
            CLOSE DOSSIER
          </button>
        </div>
      </div>
    </div>
  )
}

export default PatientDetailModal;