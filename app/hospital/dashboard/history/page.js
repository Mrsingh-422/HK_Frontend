'use client'

import HospitalAPI from '@/app/services/HospitalAPI';
import React, { useState, useEffect, useCallback } from 'react';
import { 
  FaTimes, FaSpinner, FaRegCalendarAlt, FaUserMd, 
  FaNotesMedical, FaDollarSign, FaProcedures, FaPrint, FaTint, FaHistory,
  FaAmbulance, FaUser, FaChevronLeft, FaChevronRight, FaFilePdf,
  FaShieldAlt, FaStethoscope, FaBed, FaDownload, FaCheckCircle,
  FaClock, FaPhone, FaEnvelope, FaFileInvoiceDollar, FaSyringe, FaExternalLinkAlt
} from 'react-icons/fa';

// Fallback set directly to your active IP backend
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function HospitalHistory() {
  const [activeTab, setActiveTab] = useState('emergency'); // 'emergency' or 'admission'
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination Configuration
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const itemsPerPage = 10;

  // Modal Detail State & Active Tab inside Modal
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState('clinical'); // 'clinical' | 'team' | 'billing' | 'patient'

  // Helper to format image and PDF URLs
  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `${API_BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
  };

  // Fetch History List
  const fetchHistory = useCallback(async (tab, page) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        caseType: tab, // 'emergency' or 'admission'
        page: page,
        limit: itemsPerPage
      };
      
      const res = await HospitalAPI.getHospitalHistory(params);
      console.log("History API response loaded:", res);
      
      if (res && res.success) {
        setHistoryList(res.data || []);
        setTotalRecords(res.totalRecords || 0);
        setTotalPages(res.totalPages || 1);
        setCurrentPage(res.currentPage || 1);
      } else {
        setError(res?.message || 'Failed to load historical admission logs.');
      }
    } catch (err) {
      console.error("Error inside fetchHistory:", err);
      setError('An error occurred while fetching history logs.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Re-fetch when the active tab or page changes
  useEffect(() => {
    fetchHistory(activeTab, currentPage);
  }, [activeTab, currentPage, fetchHistory]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setCurrentPage(1);
  };

  const openDetailsModal = (record) => {
    setSelectedRecord(record);
    setModalTab('clinical');
    setIsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setSelectedRecord(null);
    setIsModalOpen(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Print Dossier Handler
  const handlePrint = (record) => {
    const clinical = record.clinicalSummary || {};
    const clinicalFiles = record.clinicalFiles || {};
    const dischargePdfUrl = clinicalFiles.dischargeSummaryPdf || clinical.dischargeSummaryPdf;

    // Direct redirection to backend-generated PDF if available on the system
    if (dischargePdfUrl) {
      const fullPdfUrl = getImageUrl(dischargePdfUrl);
      window.open(fullPdfUrl, '_blank');
      return;
    }

    // Dynamic Client-Side Document Assembler (Fallback if no PDF exists yet)
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const modalUser = record.userId && typeof record.userId === 'object' ? record.userId : {};
    const modalDoctor = record.doctorId && typeof record.doctorId === 'object' ? record.doctorId : null;
    const breakdown = record.pricingBreakdown || {};
    const insurance = record.insuranceDetails || {};
    const payment = record.paymentDetails || {};

    const dietPlanPdfUrl = clinicalFiles.dietPlanPdf;
    const dischargeCardUrl = clinicalFiles.dischargeCardUrl;
    const reportsList = clinicalFiles.clinicalReports || clinical.uploadedReports || [];

    const specialServicesHtml = record.specialServices && record.specialServices.length > 0 
      ? record.specialServices.map(s => `
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 12px;">
            <span>${s.serviceName}</span>
            <strong>₹${s.price}</strong>
          </div>
        `).join('')
      : '<p style="font-style: italic; color: #94a3b8; margin: 0; font-size: 12px;">No extra services registered.</p>';

    const treatmentHistoryHtml = record.treatmentHistory && record.treatmentHistory.length > 0
      ? record.treatmentHistory.map(th => `
          <div style="border-left: 2px solid #08B36A; padding-left: 10px; margin-bottom: 10px;">
            <strong style="font-size: 12px; color: #0f172a;">${th.action || 'Log Entry'}</strong>
            <span style="font-size: 10px; color: #64748b; margin-left: 8px;">${formatDateTime(th.timestamp)}</span>
            <p style="margin: 3px 0 0 0; font-size: 11px; color: #475569;">${th.notes || 'No notes attached.'}</p>
          </div>
        `).join('')
      : '<p style="font-style: italic; color: #94a3b8; margin: 0; font-size: 12px;">No treatment logs available.</p>';

    const reportsHtml = reportsList && reportsList.length > 0
      ? reportsList.map((r, i) => `
          <div style="font-size: 11px; margin-bottom: 4px; color: #475569;">
            📄 Report #${i + 1}: <span style="font-family: monospace; font-size: 10px; word-break: break-all;">${r}</span>
          </div>
        `).join('')
      : '<p style="font-style: italic; color: #94a3b8; margin: 0; font-size: 11px;">No diagnostic reports uploaded.</p>';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Comprehensive Case File - ${record.bookingId || 'N/A'}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1e293b; padding: 30px; line-height: 1.4; }
          .header { border-bottom: 3px solid #08B36A; padding-bottom: 15px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: flex-end; }
          .title { margin: 0; font-size: 22px; font-weight: 900; color: #0f172a; }
          .sub { color: #64748b; font-size: 11px; margin-top: 4px; font-weight: bold; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
          .card { background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 10px; }
          .card-title { font-size: 11px; font-weight: bold; color: #08B36A; text-transform: uppercase; margin-top: 0; margin-bottom: 10px; letter-spacing: 0.05em; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; }
          .info-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .info-table td, .info-table th { padding: 10px; border: 1px solid #e2e8f0; font-size: 12px; }
          .info-table th { background: #f8fafc; text-align: left; font-size: 10px; text-transform: uppercase; color: #64748b; }
          .section-title { font-size: 11px; font-weight: bold; color: #08B36A; text-transform: uppercase; margin-bottom: 10px; letter-spacing: 0.05em; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; }
          .amount { font-size: 16px; color: #08B36A; font-weight: 900; }
          .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; text-transform: uppercase; }
          .badge-green { background: #dcfce7; color: #166534; }
          .badge-red { background: #ffe4e6; color: #9f1239; }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 class="title">HOSPITAL CASE DOSSIER</h1>
            <div class="sub">
              Booking ID: ${record.bookingId || 'N/A'} | Transaction ID: ${record.transactionId || 'N/A'} | Type: ${record.bookingType || 'Admission'}
            </div>
          </div>
          <div style="text-align: right; font-size: 11px; color: #64748b; font-weight: bold;">
            Triage: ${record.triageLevel || 'Standard'}<br/>
            Printed On: ${new Date().toLocaleDateString('en-GB')}
          </div>
        </div>

        <div class="grid">
          <div class="card">
            <h3 class="card-title">Patient Profile</h3>
            <strong style="font-size: 15px; color: #0f172a;">${record.patients?.[0]?.patientName || modalUser.name || 'N/A'}</strong>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #475569;">
              Age: ${record.patients?.[0]?.patientAge || 'N/A'} Yrs | Gender: ${record.patients?.[0]?.gender || 'N/A'} | Relation: ${record.patients?.[0]?.relation || 'Self'}
            </p>
            <p style="margin: 8px 0 0 0; font-size: 11px; color: #64748b; border-top: 1px dashed #cbd5e1; padding-top: 6px;">
              <strong>Booked By:</strong> ${modalUser.name || 'N/A'} (${modalUser.phone || 'N/A'}) - ${modalUser.email || ''}
            </p>
            ${record.ambulanceId ? `<p style="margin: 4px 0 0 0; font-size: 11px; color: #dc2626; font-weight: bold;">🚑 Emergency Ambulance Drop-off Registered</p>` : ''}
          </div>
          <div class="card">
            <h3 class="card-title">Attending Physician</h3>
            ${modalDoctor ? `
              <strong style="font-size: 15px; color: #0f172a;">${modalDoctor.name}</strong>
              <p style="margin: 4px 0 0 0; font-size: 12px; color: #475569;">${modalDoctor.speciality || 'General Medicine'}</p>
              <p style="margin: 8px 0 0 0; font-size: 11px; color: #64748b; border-top: 1px dashed #cbd5e1; padding-top: 6px;">
                Credentials: ${modalDoctor.qualification || 'N/A'}
              </p>
            ` : '<p style="color: #64748b; font-style: italic; font-size: 12px; margin: 0;">No clinical doctor assigned.</p>'}
          </div>
        </div>

        <table class="info-table">
          <thead>
            <tr>
              <th>Ward & Bed Unit</th>
              <th>Bed Type & Rate</th>
              <th>Stay Timeline</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>${record.wardName || record.bedId?.wardId?.name || 'N/A'}</strong></td>
              <td>Bed ${record.bedNumber || record.bedId?.bedNumber || 'N/A'} (${record.bedBookingType || 'Standard'}) @ ₹${record.bedId?.pricePerDay || 0}/day</td>
              <td>${formatDate(record.startDate || record.appointmentDate)} to ${formatDate(record.endDate)}</td>
              <td><strong>${record.stayDuration || 0} Days</strong></td>
            </tr>
          </tbody>
        </table>

        <div class="grid">
          <div class="card">
            <h3 class="card-title">Clinical & Surgical Diagnostics</h3>
            <div style="font-size: 12px; margin-bottom: 8px;"><strong>Chief Complaint:</strong> ${clinical.chiefComplaint || 'N/A'}</div>
            <div style="font-size: 12px; margin-bottom: 8px;"><strong>Diagnosis:</strong> ${clinical.diagnosis || 'N/A'}</div>
            <div style="font-size: 12px; margin-bottom: 8px;"><strong>Investigations:</strong> ${clinical.investigation || 'N/A'}</div>
            <div style="font-size: 12px; margin-bottom: 8px;"><strong>Blood Group:</strong> ${clinical.bloodGroup || 'N/A'} | <strong>Triage Priority:</strong> ${clinical.triagePriority || record.triageLevel || 'Normal'}</div>
            ${clinical.dateOfSurgery ? `<div style="font-size: 12px; margin-bottom: 8px; color: #0284c7; font-weight: bold;">Date of Surgery: ${formatDate(clinical.dateOfSurgery)}</div>` : ''}
          </div>
          <div class="card">
            <h3 class="card-title">Patient Condition & Notes</h3>
            <div style="font-size: 12px; margin-bottom: 8px;"><strong>Condition at Admission:</strong> ${clinical.conditionDuringAdmission || 'N/A'}</div>
            <div style="font-size: 12px; margin-bottom: 8px;"><strong>Condition at Discharge:</strong> ${clinical.conditionDuringDischarge || 'N/A'}</div>
            <div style="font-size: 12px; margin-bottom: 8px;"><strong>Treatment Result:</strong> ${clinical.treatmentResult || 'N/A'}</div>
            <div style="font-size: 12px; margin-bottom: 8px;"><strong>Discharge Date/Time:</strong> ${formatDateTime(clinical.dischargedAt || record.endDate)}</div>
          </div>
        </div>

        <div class="grid">
          <div class="card">
            <h3 class="card-title">Clinical Notes & Discharge Summary</h3>
            <div style="font-size: 12px; margin-bottom: 10px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">
              <strong>Admission Note:</strong>
              <p style="margin: 4px 0 0 0; color: #475569; font-style: italic;">${clinical.admissionNote || 'No special admission notes recorded.'}</p>
            </div>
            <div style="font-size: 12px;">
              <strong>Discharge Summary Note:</strong>
              <p style="margin: 4px 0 0 0; color: #475569; font-weight: bold;">${clinical.dischargeNote || 'No discharge notes provided.'}</p>
            </div>
          </div>
          <div class="card">
            <h3 class="card-title">Official Clinical Documents</h3>
            <div style="font-size: 12px; margin-bottom: 10px;">
              <strong>Generated Summary Files:</strong>
              <div style="margin-top: 4px; color: #475569;">
                <div>• Discharge Summary PDF: ${dischargePdfUrl ? `<span style="font-family: monospace; font-size: 11px;">${dischargePdfUrl}</span>` : 'Not Attached'}</div>
                <div>• Diet Plan PDF: ${dietPlanPdfUrl ? `<span style="font-family: monospace; font-size: 11px;">${dietPlanPdfUrl}</span>` : 'Not Attached'}</div>
                <div>• Discharge Card: ${dischargeCardUrl ? `<span style="font-family: monospace; font-size: 11px;">${dischargeCardUrl}</span>` : 'Not Attached'}</div>
              </div>
            </div>
            <div style="font-size: 12px;">
              <strong>Diagnostic Lab Reports:</strong>
              <div style="margin-top: 4px;">${reportsHtml}</div>
            </div>
          </div>
        </div>

        <div class="grid">
          <div class="card">
            <h3 class="card-title">Treatment Audit History</h3>
            ${treatmentHistoryHtml}
          </div>
          <div class="card">
            <h3 class="card-title">Billing & Payment Summary</h3>
            <div style="font-size: 12px; space-y: 4px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px;"><span>Base Bed Fee:</span> <span>₹${breakdown.baseFee || 0}</span></div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px;"><span>Doctor Visit Charges:</span> <span>₹${breakdown.visitCharges || 0}</span></div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px;"><span>Extra Charges:</span> <span>₹${breakdown.extraCharges || 0}</span></div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px; color: #dc2626;"><span>Discount Applied:</span> <span>-₹${breakdown.discountAmount || 0}</span></div>
              <div style="border-top: 1px solid #e2e8f0; padding-top: 6px; margin-top: 6px; display: flex; justify-content: space-between; font-weight: bold; font-size: 14px;">
                <span>Total Amount:</span>
                <span class="amount">₹${record.totalAmount || 0}</span>
              </div>
              <div style="margin-top: 8px; font-size: 11px; color: #64748b;">
                <strong>Payment Status:</strong> <span class="badge ${record.paymentStatus === 'Paid' ? 'badge-green' : 'badge-red'}">${record.paymentStatus || 'Pending'}</span><br/>
                <strong>Payment Method:</strong> ${payment.method || 'N/A'}<br/>
                ${payment.razorpayPaymentId ? `<strong>Payment ID:</strong> ${payment.razorpayPaymentId}` : ''}
              </div>
            </div>
            
            ${insurance.hasInsurance ? `
              <div style="margin-top: 12px; padding-top: 8px; border-top: 1px dashed #cbd5e1; font-size: 11px;">
                <strong style="color: #0284c7;">🛡️ Insurance Information:</strong><br/>
                Company: ${insurance.companyName || 'N/A'} | Policy #: ${insurance.insuranceNumber || 'N/A'} (${insurance.insuranceType || 'Health'})
              </div>
            ` : ''}
          </div>
        </div>

        <div style="margin-top: 20px;" class="card">
          <h3 class="card-title">Special Services Rendered</h3>
          ${specialServicesHtml}
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
    <div className="p-4 md:p-8 bg-[#F8FAFC] min-h-screen text-slate-800 font-sans antialiased selection:bg-[#08B36A]/20">
      
      {/* Header Panel */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <span className="p-3 bg-[#08B36A]/10 rounded-2xl text-[#08B36A] flex items-center justify-center">
              <FaHistory size={22} />
            </span>
            Hospital History & Medical Registers
          </h1>
          <p className="text-slate-400 font-semibold text-xs mt-1 uppercase tracking-wider">
            Comprehensive admission archives, emergency triage logs, diagnostic summaries, care team records & billing ledgers.
          </p>
        </div>
        <div className="bg-[#08B36A]/10 text-[#08B36A] px-4 py-2.5 rounded-xl border border-[#08B36A]/20 font-black text-xs md:text-sm flex items-center gap-2 shadow-sm self-start md:self-auto">
          <span>Active Registry Count:</span>
          <span className="bg-[#08B36A] text-white px-2 py-0.5 rounded-lg text-xs font-black">{totalRecords}</span>
        </div>
      </div>

      {/* Dynamic Tab Switcher */}
      <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm mb-6 max-w-md">
        <button
          onClick={() => handleTabChange('emergency')}
          className={`flex-1 py-3 px-4 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
            activeTab === 'emergency' 
              ? 'bg-[#08B36A] text-white shadow-md shadow-[#08B36A]/20 scale-102' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          🚑 Emergency Cases
        </button>
        <button
          onClick={() => handleTabChange('admission')}
          className={`flex-1 py-3 px-4 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
            activeTab === 'admission' 
              ? 'bg-[#08B36A] text-white shadow-md shadow-[#08B36A]/20 scale-102' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          🏨 Direct Admissions
        </button>
      </div>

      {/* Main Content View */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 bg-white rounded-3xl border border-slate-150 shadow-sm">
          <FaSpinner className="animate-spin text-[#08B36A] text-3xl mb-3" />
          <p className="text-slate-500 font-bold text-xs uppercase tracking-wider">Loading history records...</p>
        </div>
      ) : error ? (
        <div className="p-8 bg-rose-50 border border-rose-200 rounded-3xl text-center">
          <p className="text-rose-700 font-bold text-sm mb-3">{error}</p>
          <button
            onClick={() => fetchHistory(activeTab, currentPage)}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black uppercase transition shadow-sm"
          >
            Retry Fetching Logs
          </button>
        </div>
      ) : historyList.length === 0 ? (
        <div className="bg-white p-16 rounded-3xl text-center border border-slate-150 shadow-sm">
          <p className="text-slate-400 font-bold text-sm">No historical log entries registered in this classification.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  <th className="p-4 pl-6">Booking Dossier</th>
                  <th className="p-4">Patient Info</th>
                  <th className="p-4">Attending Physician</th>
                  <th className="p-4">Placement & Bed</th>
                  <th className="p-4">Timeline & Duration</th>
                  <th className="p-4 text-right">Invoice Total</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right pr-6">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {historyList.map((item) => {
                  const mainPatient = item.patients?.[0] || {};
                  const doctor = item.doctorId && typeof item.doctorId === 'object' ? item.doctorId : null;
                  const bed = item.bedId && typeof item.bedId === 'object' ? item.bedId : null;
                  const wardName = item.wardName || bed?.wardId?.name || 'N/A';
                  const bedNumber = item.bedNumber || bed?.bedNumber || 'N/A';
                  const isAmbulanceDropOff = !!item.ambulanceId;
                  const docImage = doctor?.profileImage ? getImageUrl(doctor.profileImage) : null;

                  return (
                    <tr key={item._id} className="hover:bg-slate-50/80 transition-colors duration-150">
                      
                      {/* Booking ID & Type */}
                      <td className="p-4 pl-6">
                        <span className="font-black text-slate-900 block text-xs">#{item.bookingId || 'N/A'}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block mt-0.5">
                          TXN: {item.transactionId || 'N/A'}
                        </span>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span className={`inline-block text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider border ${
                            isAmbulanceDropOff 
                              ? 'bg-rose-50 text-rose-600 border-rose-200' 
                              : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                          }`}>
                            {isAmbulanceDropOff ? 'Ambulance' : 'Walk-In'}
                          </span>
                          {item.triageLevel && (
                            <span className="inline-block text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                              {item.triageLevel}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Patient Details */}
                      <td className="p-4">
                        <p className="font-extrabold text-slate-900 text-xs">
                          {mainPatient.patientName || item.userId?.name || 'N/A'}
                        </p>
                        <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                          {mainPatient.patientAge ? `${mainPatient.patientAge} Yrs` : 'N/A'} • {mainPatient.gender || 'N/A'}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5 truncate max-w-[150px]">
                          Booked by: {item.userId?.name || 'N/A'}
                        </p>
                      </td>

                      {/* Doctor details */}
                      <td className="p-4">
                        {doctor ? (
                          <div className="flex items-center gap-2.5">
                            {docImage ? (
                              <img src={docImage} alt={doctor.name} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-bold">
                                <FaUserMd />
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-slate-900 text-xs">{doctor.name}</p>
                              <p className="text-[10px] text-slate-400 font-medium">
                                {doctor.speciality || 'General Medicine'}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs italic font-medium">Unassigned</span>
                        )}
                      </td>

                      {/* Ward & Bed details */}
                      <td className="p-4">
                        <div className="flex flex-col gap-0.5">
                          <p className="font-bold text-slate-800 text-xs flex items-center gap-1">
                            <FaProcedures className="text-[#08B36A]" size={11} /> {wardName}
                          </p>
                          <p className="text-[10px] text-[#08B36A] font-extrabold uppercase">
                            Bed: {bedNumber} ({item.bedBookingType || 'Standard'})
                          </p>
                        </div>
                      </td>

                      {/* Timeline */}
                      <td className="p-4">
                        <p className="text-[11px] text-slate-600 font-medium">
                          <span className="text-slate-400 text-[9px] font-bold uppercase">In:</span> {formatDate(item.startDate || item.appointmentDate)}
                        </p>
                        <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                          <span className="text-slate-400 text-[9px] font-bold uppercase">Out:</span> {formatDate(item.endDate)}
                        </p>
                        <span className="inline-block mt-1 text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          Stay: {item.stayDuration || 0} Days
                        </span>
                      </td>

                      {/* Amount Details */}
                      <td className="p-4 text-right font-black text-slate-900 text-xs">
                        ₹{item.totalAmount?.toLocaleString('en-IN') || '0'}
                        <div className="mt-0.5">
                          <span className={`inline-block text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${
                            item.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {item.paymentStatus || 'Pending'}
                          </span>
                        </div>
                      </td>

                      {/* Treatment Status */}
                      <td className="p-4 text-center">
                        <span className="inline-block px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-[#08B36A]/10 text-[#08B36A] border border-[#08B36A]/20">
                          {item.status || 'Completed'}
                        </span>
                      </td>

                      {/* Action trigger */}
                      <td className="p-4 text-right pr-6">
                        <button
                          onClick={() => openDetailsModal(item)}
                          className="px-3.5 py-2 bg-[#08B36A] hover:bg-[#079d5c] text-white font-bold rounded-xl text-[10px] uppercase transition shadow-sm hover:shadow-md"
                        >
                          View Dossier
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="bg-slate-50/80 p-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-bold">
              Showing Page {currentPage} of {totalPages} ({totalRecords} Total Cases)
            </span>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                className="p-2 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 disabled:opacity-40 text-xs font-bold rounded-xl transition"
              >
                <FaChevronLeft size={10} />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                className="p-2 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 disabled:opacity-40 text-xs font-bold rounded-xl transition"
              >
                <FaChevronRight size={10} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details & Clinical Summary Modal - Redesigned with Brand Green Palette (#08B36A) */}
      {isModalOpen && selectedRecord && (() => {
        const modalUser = selectedRecord.userId && typeof selectedRecord.userId === 'object' ? selectedRecord.userId : {};
        const modalDoctor = selectedRecord.doctorId && typeof selectedRecord.doctorId === 'object' ? selectedRecord.doctorId : null;
        const clinical = selectedRecord.clinicalSummary || {};
        const clinicalFiles = selectedRecord.clinicalFiles || {};
        const breakdown = selectedRecord.pricingBreakdown || {};
        const insurance = selectedRecord.insuranceDetails || {};
        const payment = selectedRecord.paymentDetails || {};

        const userAvatar = modalUser.profilePic ? getImageUrl(modalUser.profilePic) : null;
        const docAvatar = modalDoctor?.profileImage ? getImageUrl(modalDoctor.profileImage) : null;

        // Extract PDF discharge links safely
        const dischargePdfUrl = clinicalFiles.dischargeSummaryPdf || clinical.dischargeSummaryPdf;
        const dietPlanPdfUrl = clinicalFiles.dietPlanPdf;
        const dischargeCardUrl = clinicalFiles.dischargeCardUrl;

        return (
          <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 overflow-y-auto">
            <div className="bg-white rounded-[2rem] max-w-5xl w-full shadow-2xl overflow-hidden border border-slate-200 flex flex-col my-auto max-h-[92vh] animate-in zoom-in-95 duration-200">
              
              {/* Modal Top Header - Redesigned with Brand Green Palette (#08B36A) */}
              <div className="p-5 md:p-6 border-b border-slate-150 flex justify-between items-center bg-white sticky top-0 z-20">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-[#08B36A]/10 rounded-2xl text-[#08B36A] flex items-center justify-center">
                    <FaNotesMedical size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg md:text-xl font-black tracking-tight text-slate-900">Case Dossier #{selectedRecord.bookingId || 'N/A'}</h2>
                      <span className="px-2.5 py-0.5 bg-[#08B36A]/10 text-[#08B36A] rounded-full text-[10px] font-black uppercase tracking-wider border border-[#08B36A]/20">
                        {selectedRecord.bookingType || 'Admission'}
                      </span>
                    </div>
                    <p className="text-slate-400 font-bold text-xs mt-0.5 flex items-center gap-2">
                      <span>TXN: {selectedRecord.transactionId || 'N/A'}</span>
                      <span>•</span>
                      <span className="text-amber-600 font-extrabold uppercase">Triage: {selectedRecord.triageLevel || 'Standard'}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePrint(selectedRecord)}
                    className="hidden sm:flex items-center gap-1.5 bg-[#08B36A] hover:bg-[#079d5c] text-white px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-sm hover:shadow-md"
                  >
                    <FaPrint /> Print Case Dossier
                  </button>
                  <button
                    onClick={closeDetailsModal}
                    className="w-9 h-9 flex items-center justify-center bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition"
                  >
                    <FaTimes size={16} />
                  </button>
                </div>
              </div>

              {/* Modal Navigation Tabs - Redesigned Tab Highlight Colors */}
              <div className="flex border-b border-slate-150 bg-slate-50/50 px-6 pt-3 gap-2 overflow-x-auto">
                <button
                  onClick={() => setModalTab('clinical')}
                  className={`pb-3 px-4 font-black text-xs tracking-wider uppercase border-b-2 transition flex items-center gap-2 ${
                    modalTab === 'clinical'
                      ? 'border-[#08B36A] text-[#08B36A] font-black'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <FaNotesMedical /> Clinical Summary & Reports
                </button>
                <button
                  onClick={() => setModalTab('team')}
                  className={`pb-3 px-4 font-black text-xs tracking-wider uppercase border-b-2 transition flex items-center gap-2 ${
                    modalTab === 'team'
                      ? 'border-[#08B36A] text-[#08B36A] font-black'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <FaUserMd /> Care Team & Logs
                </button>
                <button
                  onClick={() => setModalTab('billing')}
                  className={`pb-3 px-4 font-black text-xs tracking-wider uppercase border-b-2 transition flex items-center gap-2 ${
                    modalTab === 'billing'
                      ? 'border-[#08B36A] text-[#08B36A] font-black'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <FaFileInvoiceDollar /> Billing & Insurance
                </button>
                <button
                  onClick={() => setModalTab('patient')}
                  className={`pb-3 px-4 font-black text-xs tracking-wider uppercase border-b-2 transition flex items-center gap-2 ${
                    modalTab === 'patient'
                      ? 'border-[#08B36A] text-[#08B36A] font-black'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <FaUser /> Patient & Booking User
                </button>
              </div>

              {/* Modal Scrollable Body */}
              <div className="p-6 overflow-y-auto space-y-6 flex-grow min-h-0 bg-white">
                
                {/* Stay & Ward Banner (Always visible at top of modal) */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-400 block">Ward & Bed</span>
                    <strong className="text-slate-900 font-black text-sm block mt-0.5">
                      {selectedRecord.wardName || selectedRecord.bedId?.wardId?.name || 'N/A'} - {selectedRecord.bedNumber || selectedRecord.bedId?.bedNumber || 'N/A'}
                    </strong>
                    <span className="text-[10px] text-[#08B36A] font-bold">Type: {selectedRecord.bedBookingType || 'Standard'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-400 block">Admitted On</span>
                    <strong className="text-slate-800 font-bold block mt-0.5">
                      {formatDate(selectedRecord.startDate || selectedRecord.appointmentDate)}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-400 block">Discharged On</span>
                    <strong className="text-slate-800 font-bold block mt-0.5">
                      {formatDate(selectedRecord.endDate)}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-400 block">Stay Duration</span>
                    <strong className="text-slate-900 font-black text-sm block mt-0.5">
                      {selectedRecord.stayDuration || 0} Days
                    </strong>
                    {selectedRecord.bedId?.pricePerDay && (
                      <span className="text-[10px] text-slate-500 font-medium">₹{selectedRecord.bedId.pricePerDay}/day</span>
                    )}
                  </div>
                </div>

                {/* TAB 1: CLINICAL SUMMARY & REPORTS */}
                {modalTab === 'clinical' && (
                  <div className="space-y-6 animate-in fade-in duration-150">
                    
                    {/* Embedded PDF Discharge Summary Document directly inside the viewport */}
                    {dischargePdfUrl && (
                      <div className="border border-slate-200 rounded-[1.5rem] overflow-hidden shadow-sm">
                        <div className="bg-slate-50 px-5 py-3.5 text-xs font-black text-slate-800 border-b border-slate-100 flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <FaFilePdf size={14} className="text-red-500" /> 
                            Official Discharge Summary Document (Backend Generated)
                          </span>
                          <a 
                            href={getImageUrl(dischargePdfUrl)} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-[#08B36A] hover:underline font-extrabold text-xs flex items-center gap-1.5"
                          >
                            Open PDF Directly <FaExternalLinkAlt size={10} />
                          </a>
                        </div>
                        <div className="w-full h-[500px] bg-slate-100">
                          <iframe
                            src={`${getImageUrl(dischargePdfUrl)}#toolbar=1&navpanes=0`}
                            className="w-full h-full border-none"
                            title="Signed Backend Discharge Summary Document"
                          />
                        </div>
                      </div>
                    )}

                    {/* Diagnostic Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                        <span className="text-[10px] font-black text-[#08B36A] uppercase tracking-wider block">Chief Complaint</span>
                        <p className="text-slate-800 font-bold text-xs mt-1">
                          {clinical.chiefComplaint || 'No chief complaint registered.'}
                        </p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                        <span className="text-[10px] font-black text-[#08B36A] uppercase tracking-wider block">Clinical Diagnosis</span>
                        <p className="text-slate-900 font-extrabold text-xs mt-1">
                          {clinical.diagnosis || 'Pending clinical diagnosis.'}
                        </p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                        <span className="text-[10px] font-black text-[#08B36A] uppercase tracking-wider block">Investigations Done</span>
                        <p className="text-slate-800 font-bold text-xs mt-1">
                          {clinical.investigation || 'No diagnostic investigations noted.'}
                        </p>
                      </div>
                    </div>

                    {/* Surgical & Medical Details */}
                    <div className="border border-slate-200 rounded-2xl p-5 bg-white">
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
                        <FaStethoscope className="text-[#08B36A]" /> Diagnostics & Surgical Indicators
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Blood Group</span>
                          <span className="font-extrabold text-slate-800">{clinical.bloodGroup || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Triage Priority</span>
                          <span className="font-extrabold text-amber-600">{clinical.triagePriority || selectedRecord.triageLevel || 'Normal'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Date of Surgery</span>
                          <span className="font-extrabold text-slate-800">
                            {clinical.dateOfSurgery ? formatDate(clinical.dateOfSurgery) : 'No Surgery Recorded'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Discharged Timestamp</span>
                          <span className="font-extrabold text-slate-800">
                            {clinical.dischargedAt ? formatDateTime(clinical.dischargedAt) : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Patient Condition Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-2xl">
                        <h5 className="text-[11px] font-black text-amber-800 uppercase tracking-wider mb-1">
                          Condition During Admission
                        </h5>
                        <p className="text-xs text-slate-700 font-semibold">
                          {clinical.conditionDuringAdmission || 'No special condition noted at admission time.'}
                        </p>
                        {clinical.admissionNote && (
                          <p className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-amber-200/60">
                            <strong>Note:</strong> {clinical.admissionNote}
                          </p>
                        )}
                      </div>

                      <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-2xl">
                        <h5 className="text-[11px] font-black text-emerald-800 uppercase tracking-wider mb-1">
                          Condition During Discharge & Outcome
                        </h5>
                        <p className="text-xs text-slate-700 font-semibold">
                          {clinical.conditionDuringDischarge || 'Stable at discharge.'}
                        </p>
                        <p className="text-[11px] text-emerald-700 font-bold mt-1">
                          Result: {clinical.treatmentResult || 'Treatment Completed'}
                        </p>
                        {clinical.dischargeNote && (
                          <p className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-emerald-200/60">
                            <strong>Discharge Note:</strong> {clinical.dischargeNote}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Downloadable Documents Section */}
                    <div className="p-5 bg-slate-900 text-white rounded-2xl border border-slate-800">
                      <h4 className="text-xs font-black uppercase tracking-wider text-[#08B36A] mb-3 flex items-center gap-2">
                        <FaFilePdf /> Clinical Files & Generated Certificates
                      </h4>
                      <div className="flex flex-wrap gap-3">
                        {dischargePdfUrl ? (
                          <a
                            href={getImageUrl(dischargePdfUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#08B36A] hover:bg-[#079d5c] text-white text-xs font-bold rounded-xl transition shadow"
                          >
                            <FaDownload /> Download Discharge Summary PDF
                          </a>
                        ) : (
                          <span className="text-xs text-slate-400 italic">No Discharge Summary PDF attached.</span>
                        )}

                        {dietPlanPdfUrl && (
                          <a
                            href={getImageUrl(dietPlanPdfUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition border border-slate-700"
                          >
                            <FaDownload /> Download Diet Plan PDF
                          </a>
                        )}

                        {dischargeCardUrl && (
                          <a
                            href={getImageUrl(dischargeCardUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition border border-slate-700"
                          >
                            <FaDownload /> Discharge Card
                          </a>
                        )}
                      </div>
                    </div>

                  </div>
                )}

                {/* TAB 2: CARE TEAM & TREATMENT LOGS */}
                {modalTab === 'team' && (
                  <div className="space-y-6 animate-in fade-in duration-150">
                    
                    {/* Primary Doctor */}
                    <div className="p-5 bg-[#08B36A]/5 rounded-2xl border border-[#08B36A]/10 flex items-center gap-4">
                      {docAvatar ? (
                        <img src={docAvatar} alt="Doctor" className="w-16 h-16 rounded-2xl object-cover border-2 border-[#08B36A]" />
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-[#08B36A]/10 text-[#08B36A] flex items-center justify-center text-2xl font-bold">
                          <FaUserMd />
                        </div>
                      )}
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#08B36A]">Primary Duty Doctor</span>
                        <h3 className="text-base font-black text-slate-900">{modalDoctor?.name || 'Unassigned Doctor'}</h3>
                        <p className="text-xs text-slate-600 font-semibold">{modalDoctor?.speciality || 'General Practitioner'}</p>
                        <p className="text-[11px] text-slate-400 font-medium mt-0.5">Qualifications: {modalDoctor?.qualification || 'N/A'}</p>
                      </div>
                    </div>

                    {/* Treatment Team Timeline */}
                    {selectedRecord.treatmentTeamTimeline && selectedRecord.treatmentTeamTimeline.length > 0 && (
                      <div className="border border-slate-200 rounded-2xl p-5">
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
                          Assigned Medical Care Team Timeline
                        </h4>
                        <div className="space-y-3">
                          {selectedRecord.treatmentTeamTimeline.map((member, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl text-xs">
                              <div className="flex items-center gap-3">
                                {member.profileImage ? (
                                  <img src={getImageUrl(member.profileImage)} alt={member.name} className="w-9 h-9 rounded-full object-cover" />
                                ) : (
                                  <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                                    <FaUserMd />
                                  </div>
                                )}
                                <div>
                                  <strong className="text-slate-900 block">{member.name}</strong>
                                  <span className="text-[10px] text-slate-500">{member.role || 'Physician'} • {member.speciality} ({member.qualification})</span>
                                </div>
                              </div>
                              <div className="text-right text-[10px] text-slate-400 font-medium">
                                <div>Joined: {formatDate(member.joinedAt)}</div>
                                {member.dischargedAt && <div>Ended: {formatDate(member.dischargedAt)}</div>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Treatment Audit History */}
                    <div className="border border-slate-200 rounded-2xl p-5">
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
                        <FaClock className="text-[#08B36A]" /> Clinical Activity & Discharge Audit History
                      </h4>
                      {selectedRecord.treatmentHistory && selectedRecord.treatmentHistory.length > 0 ? (
                        <div className="space-y-4">
                          {selectedRecord.treatmentHistory.map((th) => (
                            <div key={th._id} className="relative pl-6 border-l-2 border-[#08B36A]">
                              <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-[#08B36A]"></div>
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-extrabold text-slate-900">{th.action || 'Medical Action Logged'}</span>
                                <span className="text-[10px] text-slate-400 font-bold">{formatDateTime(th.timestamp)}</span>
                              </div>
                              <p className="text-xs text-slate-600 font-medium mt-1">{th.notes || 'No description provided.'}</p>
                              {th.fromDoctorId && typeof th.fromDoctorId === 'object' && (
                                <p className="text-[10px] text-slate-400 font-bold mt-1">
                                  Logged by: Dr. {th.fromDoctorId.name} ({th.fromDoctorId.speciality})
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">No activity logs found for this case.</p>
                      )}
                    </div>

                  </div>
                )}

                {/* TAB 3: BILLING & INSURANCE */}
                {modalTab === 'billing' && (
                  <div className="space-y-6 animate-in fade-in duration-150">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Financial Breakdown Ledger */}
                      <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs">
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">
                          Pricing Breakdown
                        </h4>
                        <div className="flex justify-between text-slate-600 font-medium">
                          <span>Base Room / Bed Fee:</span>
                          <span className="font-bold text-slate-800">₹{breakdown.baseFee || 0}</span>
                        </div>
                        <div className="flex justify-between text-slate-600 font-medium">
                          <span>Doctor Consultation & Visits:</span>
                          <span className="font-bold text-slate-800">₹{breakdown.visitCharges || 0}</span>
                        </div>
                        <div className="flex justify-between text-slate-600 font-medium">
                          <span>Extra Health Services:</span>
                          <span className="font-bold text-slate-800">₹{breakdown.extraCharges || 0}</span>
                        </div>
                        {breakdown.cancellationFeeApplied > 0 && (
                          <div className="flex justify-between text-slate-600 font-medium">
                            <span>Cancellation Penalty:</span>
                            <span className="font-bold text-slate-800">₹{breakdown.cancellationFeeApplied}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-rose-600 font-semibold">
                          <span>Discount Applied:</span>
                          <span>-₹{breakdown.discountAmount || 0}</span>
                        </div>
                        <div className="border-t border-slate-200 pt-3 flex justify-between font-black text-slate-900 text-sm">
                          <span>Final Total Invoice Sum:</span>
                          <span className="text-[#08B36A] text-base">₹{selectedRecord.totalAmount || 0}</span>
                        </div>
                      </div>

                      {/* Payment Status & Details */}
                      <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs">
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">
                          Transaction & Payment Metadata
                        </h4>
                        <div className="flex justify-between text-slate-600">
                          <span className="font-medium">Payment Status:</span>
                          <span className={`font-black px-2 py-0.5 rounded text-[10px] uppercase ${
                            selectedRecord.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {selectedRecord.paymentStatus || 'Pending'}
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span className="font-medium">Payment Method:</span>
                          <span className="font-bold text-slate-800">{payment.method || 'Direct Hospital Payment'}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span className="font-medium">Currency:</span>
                          <span className="font-bold text-slate-800">{payment.currency || 'INR'}</span>
                        </div>
                        {payment.paidAt && (
                          <div className="flex justify-between text-slate-600">
                            <span className="font-medium">Paid At:</span>
                            <span className="font-bold text-slate-800">{formatDateTime(payment.paidAt)}</span>
                          </div>
                        )}
                        {payment.razorpayPaymentId && (
                          <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500">
                            <strong>Razorpay Payment ID:</strong> <span className="font-mono text-slate-800">{payment.razorpayPaymentId}</span>
                          </div>
                        )}
                      </div>

                    </div>

                    {/* Insurance Card */}
                    <div className="p-5 bg-sky-50/60 border border-sky-200 rounded-2xl flex items-start gap-4">
                      <div className="p-3 bg-sky-500 text-white rounded-xl text-lg">
                        <FaShieldAlt />
                      </div>
                      <div className="text-xs space-y-1">
                        <h4 className="font-black text-sky-900 uppercase tracking-wider text-xs">Insurance Claim Details</h4>
                        {insurance.hasInsurance ? (
                          <>
                            <p className="text-slate-800 font-bold">
                              Provider: {insurance.companyName || 'Registered Medical Insurance'}
                            </p>
                            <p className="text-slate-600">
                              Policy/Insurance Number: <span className="font-mono font-bold text-slate-900">{insurance.insuranceNumber || 'N/A'}</span> ({insurance.insuranceType || 'Health Policy'})
                            </p>
                          </>
                        ) : (
                          <p className="text-sky-700 italic font-medium">No health insurance coverage registered for this booking.</p>
                        )}
                      </div>
                    </div>

                    {/* Special Services Breakdown */}
                    <div className="border border-slate-200 rounded-2xl p-5">
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-3 border-b border-slate-100 pb-2">
                        Registered Special Services
                      </h4>
                      {selectedRecord.specialServices && selectedRecord.specialServices.length > 0 ? (
                        <div className="space-y-2">
                          {selectedRecord.specialServices.map((srv) => (
                            <div key={srv._id} className="flex justify-between items-center text-xs p-2.5 bg-slate-50 rounded-xl">
                              <span className="font-bold text-slate-800 flex items-center gap-2">
                                <FaSyringe className="text-[#08B36A]" /> {srv.serviceName}
                              </span>
                              <span className="font-black text-slate-900">₹{srv.price}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">No extra special services billed for this admission.</p>
                      )}
                    </div>

                  </div>
                )}

                {/* TAB 4: PATIENT & USER DETAILS */}
                {modalTab === 'patient' && (
                  <div className="space-y-6 animate-in fade-in duration-150">
                    
                    {/* Primary Patient */}
                    <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50">
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">
                        Registered Patients List
                      </h4>
                      <div className="space-y-3">
                        {selectedRecord.patients && selectedRecord.patients.length > 0 ? (
                          selectedRecord.patients.map((p) => (
                            <div key={p._id} className="p-4 bg-white rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                              <div>
                                <strong className="text-sm font-extrabold text-slate-900 block">{p.patientName}</strong>
                                <span className="text-slate-500 font-medium">
                                  Age: {p.patientAge} Yrs • Gender: {p.gender} • Relation: {p.relation || 'Self'}
                                </span>
                                {p.reasonForVisit && (
                                  <p className="text-slate-600 font-semibold mt-1">Reason: {p.reasonForVisit}</p>
                                )}
                              </div>
                              {p.isMainUser && (
                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                                  Account Holder
                                </span>
                              )}
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-slate-400 italic">No specific patient information attached.</p>
                        )}
                      </div>
                    </div>

                    {/* Booked By User */}
                    <div className="p-5 border border-slate-200 rounded-2xl flex items-center gap-4">
                      {userAvatar ? (
                        <img src={userAvatar} alt={modalUser.name} className="w-14 h-14 rounded-full object-cover border" />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xl">
                          <FaUser />
                        </div>
                      )}
                      <div className="text-xs space-y-0.5">
                        <span className="text-[10px] font-black uppercase text-slate-400">Booking Account Holder</span>
                        <h4 className="font-extrabold text-slate-900 text-sm">{modalUser.name || 'Anonymous User'}</h4>
                        <p className="text-slate-600 flex items-center gap-2">
                          <FaPhone className="text-slate-400" size={10} /> {modalUser.phone || 'N/A'}
                        </p>
                        <p className="text-slate-600 flex items-center gap-2">
                          <FaEnvelope className="text-slate-400" size={10} /> {modalUser.email || 'N/A'}
                        </p>
                      </div>
                    </div>

                    {/* Emergency Ambulance Details */}
                    {selectedRecord.ambulanceId && (
                      <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-xs">
                        <div className="p-2.5 bg-rose-600 text-white rounded-xl">
                          <FaAmbulance size={18} />
                        </div>
                        <div>
                          <strong className="text-rose-900 font-extrabold block">Emergency Ambulance Transport Triggered</strong>
                          <p className="text-rose-700">Ambulance Record ID: {selectedRecord.ambulanceId}</p>
                        </div>
                      </div>
                    )}

                  </div>
                )}

              </div>

              {/* Modal Footer */}
              <div className="p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={() => handlePrint(selectedRecord)}
                  className="flex-1 bg-[#08B36A] hover:bg-[#079d5c] text-white py-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition"
                >
                  <FaPrint /> Print Official Case Dossier
                </button>
                <button
                  onClick={closeDetailsModal}
                  className="flex-1 bg-white border border-slate-300 text-slate-700 py-3 rounded-xl font-extrabold text-xs hover:bg-slate-100 transition"
                >
                  Close Case Dossier
                </button>
              </div>

            </div>
          </div>
        );
      })()}
    </div>
  );
}