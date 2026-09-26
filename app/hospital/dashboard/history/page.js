'use client'

import HospitalAPI from '@/app/services/HospitalAPI';
import React, { useState, useEffect, useCallback } from 'react';
import { 
  FaTimes, FaSpinner, FaRegCalendarAlt, FaUserMd, 
  FaNotesMedical, FaDollarSign, FaProcedures, FaPrint, FaTint, FaHistory,
  FaAmbulance, FaUser, FaChevronLeft, FaChevronRight, FaFilePdf,
  FaShieldAlt, FaStethoscope, FaBed, FaDownload, FaCheckCircle,
  FaClock, FaPhone, FaEnvelope, FaFileInvoiceDollar, FaSyringe, FaExternalLinkAlt,
  FaTimesCircle, FaSearch
} from 'react-icons/fa';

// Fallback set directly to your active backend URL
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function HospitalHistory() {
  const [activeTab, setActiveTab] = useState('emergency'); // 'emergency' or 'admission'
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

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
    const base = API_BASE_URL ? API_BASE_URL.replace(/\/$/, '') : '';
    const cleanPath = path.replace(/^\//, '').replace(/^public\//, '');
    return base ? `${base}/${cleanPath}` : `/${cleanPath}`;
  };

  // Helper to dynamically calculate stay duration from dates
  const calculateStayDays = (startDate, endDate, explicitDuration) => {
    if (explicitDuration !== undefined && explicitDuration !== null) {
      return explicitDuration;
    }
    if (!startDate) return 0;
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1;
  };

  // Fetch History List with search and pagination
  const fetchHistory = useCallback(async (tab, page, search = '') => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        caseType: tab, // 'emergency' or 'admission'
        page: page,
        limit: itemsPerPage
      };
      if (search.trim()) {
        params.search = search.trim();
      }
      
      const res = await HospitalAPI.getHospitalHistory(params);
      
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
  }, [itemsPerPage]);

  // Re-fetch when the active tab or page changes
  useEffect(() => {
    fetchHistory(activeTab, currentPage, searchTerm);
  }, [activeTab, currentPage, fetchHistory]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setCurrentPage(1);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchHistory(activeTab, 1, searchTerm);
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

    // Dynamic Client-Side Document Assembler
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const patient = record.patientDetails || record.patients?.[0] || record.userId || {};
    const patientName = patient.patientName || patient.name || 'N/A';
    const patientAge = patient.age !== undefined ? patient.age : (patient.patientAge || 'N/A');
    const patientGender = patient.gender || 'N/A';
    const patientRelation = patient.relation || 'Self';
    const bloodGroup = patient.bloodGroup || clinical.bloodGroup || 'N/A';
    const reasonForVisit = patient.reasonForVisit || clinical.chiefComplaint || 'N/A';

    const doctor = record.assignedDoctor || (typeof record.doctorId === 'object' ? record.doctorId : null);
    const bed = record.bedDetails || (typeof record.bedId === 'object' ? record.bedId : null) || {};
    const wardName = bed.wardName || bed.wardId?.name || record.wardName || 'N/A';
    const bedNumber = bed.bedNumber || record.bedNumber || 'N/A';

    const billing = record.billing || {};
    const breakdown = record.pricingBreakdown || {};
    const totalAmount = billing.totalAmount !== undefined ? billing.totalAmount : (record.totalAmount || 0);
    const paymentStatus = billing.paymentStatus || record.paymentStatus || 'Paid';
    const paymentMethod = billing.paymentMethod || record.paymentDetails?.method || 'Online';
    const txnId = billing.transactionId || record.transactionId || 'N/A';

    const insurance = record.insuranceDetails || {};
    const dietPlanPdfUrl = clinicalFiles.dietPlanPdf;
    const dischargeCardUrl = clinicalFiles.dischargeCardUrl;
    const reportsList = clinicalFiles.clinicalReports || clinical.uploadedReports || [];

    const calculatedStay = calculateStayDays(record.startDate || record.appointmentDate, record.endDate, record.stayDuration);

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
          .amount { font-size: 16px; color: #08B36A; font-weight: 900; }
          .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; text-transform: uppercase; }
          .badge-green { background: #dcfce7; color: #166534; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 class="title">HOSPITAL CASE DOSSIER</h1>
            <div class="sub">
              Booking ID: ${record.bookingId || 'N/A'} | Transaction ID: ${txnId} | Status: ${record.status || 'Completed'}
            </div>
          </div>
          <div style="text-align: right; font-size: 11px; color: #64748b; font-weight: bold;">
            Admission: ${formatDate(record.startDate)}<br/>
            Printed On: ${new Date().toLocaleDateString('en-GB')}
          </div>
        </div>

        <div class="grid">
          <div class="card">
            <h3 class="card-title">Patient Profile</h3>
            <strong style="font-size: 15px; color: #0f172a;">${patientName}</strong>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #475569;">
              Age: ${patientAge} Yrs | Gender: ${patientGender} | Relation: ${patientRelation} | Blood: ${bloodGroup}
            </p>
            <p style="margin: 8px 0 0 0; font-size: 11px; color: #64748b;">
              <strong>Reason / Complaint:</strong> ${reasonForVisit}
            </p>
          </div>
          <div class="card">
            <h3 class="card-title">Attending Physician</h3>
            ${doctor ? `
              <strong style="font-size: 15px; color: #0f172a;">${doctor.name ? (doctor.name.startsWith('Dr.') ? doctor.name : `Dr. ${doctor.name}`) : 'N/A'}</strong>
              <p style="margin: 4px 0 0 0; font-size: 12px; color: #475569;">${doctor.speciality || 'General Medicine'}</p>
              <p style="margin: 4px 0 0 0; font-size: 11px; color: #64748b;">Qualifications: ${doctor.qualification || 'N/A'}</p>
            ` : '<p style="color: #64748b; font-style: italic; font-size: 12px; margin: 0;">No clinical doctor assigned.</p>'}
          </div>
        </div>

        <table class="info-table">
          <thead>
            <tr>
              <th>Ward & Bed Unit</th>
              <th>Stay Timeline</th>
              <th>Duration</th>
              <th>Final Bill Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>${wardName}</strong> - Bed ${bedNumber}</td>
              <td>${formatDate(record.startDate)} to ${formatDate(record.endDate)}</td>
              <td><strong>${calculatedStay} Days</strong></td>
              <td><strong class="amount">₹${totalAmount}</strong> (${paymentStatus} - ${paymentMethod})</td>
            </tr>
          </tbody>
        </table>

        <div class="grid">
          <div class="card">
            <h3 class="card-title">Clinical Diagnostics & Files</h3>
            <div style="font-size: 12px; margin-bottom: 6px;"><strong>Chief Complaint:</strong> ${clinical.chiefComplaint || reasonForVisit}</div>
            <div style="font-size: 12px; margin-bottom: 6px;"><strong>Diagnosis:</strong> ${clinical.diagnosis || 'N/A'}</div>
            <div style="font-size: 12px; margin-bottom: 6px;"><strong>Discharge Summary PDF:</strong> ${clinicalFiles.dischargeSummaryPdf || 'Generated'}</div>
          </div>
          <div class="card">
            <h3 class="card-title">Billing & Settlement</h3>
            <div style="font-size: 12px;">
              <div><strong>Settled Amount:</strong> ₹${totalAmount}</div>
              <div><strong>Payment Method:</strong> ${paymentMethod}</div>
              <div><strong>Transaction Reference:</strong> ${txnId}</div>
            </div>
          </div>
        </div>

        <div style="margin-top: 15px;" class="card">
          <h3 class="card-title">Treatment History</h3>
          ${treatmentHistoryHtml}
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

      {/* Tab Switcher & Search Bar Bar */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 mb-6">
        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm max-w-md">
          <button
            onClick={() => handleTabChange('emergency')}
            className={`flex-1 py-3 px-4 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
              activeTab === 'emergency' 
                ? 'bg-[#08B36A] text-white shadow-md shadow-[#08B36A]/20' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {"\uD83D\uDE91"} Emergency Cases
          </button>
          <button
            onClick={() => handleTabChange('admission')}
            className={`flex-1 py-3 px-4 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
              activeTab === 'admission' 
                ? 'bg-[#08B36A] text-white shadow-md shadow-[#08B36A]/20' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            🏨 Direct Admissions
          </button>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative w-full md:w-80">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Booking ID or Patient Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#08B36A] outline-none shadow-sm transition"
            />
          </div>
          <button
            type="submit"
            className="bg-[#08B36A] hover:bg-[#079d5c] text-white font-black text-xs px-5 py-3 rounded-2xl shadow-sm transition shrink-0"
          >
            Search
          </button>
          {searchTerm && (
            <button
              type="button"
              onClick={() => { setSearchTerm(''); fetchHistory(activeTab, 1, ''); }}
              className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs px-3.5 py-3 rounded-2xl transition shrink-0"
            >
              Clear
            </button>
          )}
        </form>
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
            onClick={() => fetchHistory(activeTab, currentPage, searchTerm)}
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
            <table className="w-full text-left border-collapse whitespace-nowrap">
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
                  const patient = item.patientDetails || item.patients?.[0] || item.userId || {};
                  const patientName = patient.patientName || patient.name || 'N/A';
                  const patientAge = patient.age !== undefined ? patient.age : (patient.patientAge || 'N/A');
                  const patientGender = patient.gender || 'N/A';
                  const bloodGroup = patient.bloodGroup || item.clinicalSummary?.bloodGroup;
                  const profilePic = patient.profilePic || item.userId?.profilePic;
                  const reason = patient.reasonForVisit || item.clinicalSummary?.chiefComplaint;

                  const doctor = item.assignedDoctor || (typeof item.doctorId === 'object' ? item.doctorId : null);
                  const docImage = doctor?.profileImage ? getImageUrl(doctor.profileImage) : null;
                  const docName = doctor?.name ? (doctor.name.startsWith('Dr.') ? doctor.name : `Dr. ${doctor.name}`) : null;

                  const bed = item.bedDetails || (typeof item.bedId === 'object' ? item.bedId : null) || {};
                  const wardName = bed.wardName || bed.wardId?.name || item.wardName || 'N/A';
                  const bedNumber = bed.bedNumber || item.bedNumber || 'N/A';

                  const billing = item.billing || {};
                  const totalAmt = billing.totalAmount !== undefined ? billing.totalAmount : (item.totalAmount || 0);
                  const payStatus = billing.paymentStatus || item.paymentStatus || 'Paid';
                  const payMethod = billing.paymentMethod || item.paymentDetails?.method || 'Online';
                  const txnId = billing.transactionId || item.transactionId;

                  const isAmbulanceDropOff = !!item.ambulanceId;
                  const computedStayDays = calculateStayDays(item.startDate || item.appointmentDate, item.endDate, item.stayDuration);

                  return (
                    <tr key={item._id} className="hover:bg-slate-50/80 transition-colors duration-150">
                      
                      {/* Booking ID & Type */}
                      <td className="p-4 pl-6">
                        <span className="font-black text-slate-900 block text-xs">#{item.bookingId || 'N/A'}</span>
                        {txnId && (
                          <span className="text-[10px] text-slate-400 font-bold font-mono block mt-0.5 truncate max-w-[140px]" title={txnId}>
                            TXN: {txnId}
                          </span>
                        )}
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
                        <div className="flex items-center gap-3">
                          {profilePic ? (
                            <img 
                              src={getImageUrl(profilePic)} 
                              alt={patientName} 
                              className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0" 
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-xl bg-[#08B36A]/10 text-[#08B36A] flex items-center justify-center font-black text-xs border border-[#08B36A]/20 shrink-0">
                              {patientName.charAt(0) || '?'}
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="font-extrabold text-slate-900 text-xs leading-none">{patientName}</p>
                              {bloodGroup && (
                                <span className="text-[8px] font-black text-rose-600 bg-rose-50 px-1 py-0.2 rounded border border-rose-100">
                                  {bloodGroup}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 font-semibold mt-1">
                              {patientAge !== 'N/A' ? `${patientAge} Yrs` : ''} • {patientGender} {patient.relation ? `(${patient.relation})` : ''}
                            </p>
                            {reason && (
                              <p className="text-[10px] text-slate-400 font-medium truncate max-w-[160px] mt-0.5" title={reason}>
                                "{reason}"
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Doctor details */}
                      <td className="p-4">
                        {doctor ? (
                          <div className="flex items-center gap-2.5">
                            {docImage ? (
                              <img src={docImage} alt={docName} className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-bold shrink-0">
                                <FaUserMd />
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-slate-900 text-xs">{docName}</p>
                              <p className="text-[10px] text-[#08B36A] font-extrabold uppercase">
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
                          <p className="text-[10px] text-slate-500 font-extrabold uppercase">
                            Bed: {bedNumber}
                          </p>
                        </div>
                      </td>

                      {/* Timeline & Stay Duration */}
                      <td className="p-4">
                        <p className="text-[11px] text-slate-600 font-medium">
                          <span className="text-slate-400 text-[9px] font-bold uppercase">In:</span> {formatDate(item.startDate || item.appointmentDate)}
                        </p>
                        <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                          <span className="text-slate-400 text-[9px] font-bold uppercase">Out:</span> {formatDate(item.endDate)}
                        </p>
                        <span className="inline-block mt-1 text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          Stay: {computedStayDays} Day{computedStayDays > 1 ? 's' : ''}
                        </span>
                      </td>

                      {/* Amount Details */}
                      <td className="p-4 text-right font-black text-slate-900 text-xs">
                        ₹{Number(totalAmt).toLocaleString('en-IN')}
                        <div className="mt-0.5 flex items-center justify-end gap-1">
                          <span className={`inline-block text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${
                            payStatus === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {payStatus}
                          </span>
                          <span className="text-[9px] font-semibold text-slate-400">
                            • {payMethod}
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

      {/* Details & Clinical Summary Modal */}
      {isModalOpen && selectedRecord && (() => {
        const patient = selectedRecord.patientDetails || selectedRecord.patients?.[0] || selectedRecord.userId || {};
        const patientName = patient.patientName || patient.name || 'N/A';
        const patientAge = patient.age !== undefined ? patient.age : (patient.patientAge || 'N/A');
        const patientGender = patient.gender || 'N/A';
        const patientRelation = patient.relation || 'Self';
        const patientBlood = patient.bloodGroup || selectedRecord.clinicalSummary?.bloodGroup;
        const patientReason = patient.reasonForVisit || selectedRecord.clinicalSummary?.chiefComplaint;
        const patientAvatar = patient.profilePic ? getImageUrl(patient.profilePic) : (selectedRecord.userId?.profilePic ? getImageUrl(selectedRecord.userId.profilePic) : null);

        const modalUser = selectedRecord.userId && typeof selectedRecord.userId === 'object' ? selectedRecord.userId : {};
        const modalDoctor = selectedRecord.assignedDoctor || (typeof selectedRecord.doctorId === 'object' ? selectedRecord.doctorId : null);
        const docAvatar = modalDoctor?.profileImage ? getImageUrl(modalDoctor.profileImage) : null;
        
        const bed = selectedRecord.bedDetails || (typeof selectedRecord.bedId === 'object' ? selectedRecord.bedId : null) || {};
        const wardName = bed.wardName || bed.wardId?.name || selectedRecord.wardName || 'N/A';
        const bedNumber = bed.bedNumber || selectedRecord.bedNumber || 'N/A';

        const clinical = selectedRecord.clinicalSummary || {};
        const clinicalFiles = selectedRecord.clinicalFiles || {};
        const billing = selectedRecord.billing || {};
        const breakdown = selectedRecord.pricingBreakdown || {};
        const totalAmount = billing.totalAmount !== undefined ? billing.totalAmount : (selectedRecord.totalAmount || 0);
        const paymentStatus = billing.paymentStatus || selectedRecord.paymentStatus || 'Paid';
        const paymentMethod = billing.paymentMethod || selectedRecord.paymentDetails?.method || 'Online';
        const txnId = billing.transactionId || selectedRecord.transactionId || selectedRecord.paymentDetails?.razorpayPaymentId;

        const insurance = selectedRecord.insuranceDetails || {};
        const payment = selectedRecord.paymentDetails || {};

        const dischargePdfUrl = clinicalFiles.dischargeSummaryPdf || clinical.dischargeSummaryPdf;
        const dietPlanPdfUrl = clinicalFiles.dietPlanPdf;
        const dischargeCardUrl = clinicalFiles.dischargeCardUrl;

        const computedModalStay = calculateStayDays(selectedRecord.startDate || selectedRecord.appointmentDate, selectedRecord.endDate, selectedRecord.stayDuration);

        return (
          <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 overflow-y-auto font-sans">
            <div className="bg-white rounded-[2rem] max-w-5xl w-full shadow-2xl overflow-hidden border border-slate-200 flex flex-col my-auto max-h-[92vh] animate-in zoom-in-95 duration-200">
              
              {/* Modal Top Header */}
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
                      <span>Status: {selectedRecord.status || 'Completed'}</span>
                      {txnId && (
                        <>
                          <span>•</span>
                          <span className="font-mono">TXN: {txnId}</span>
                        </>
                      )}
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

              {/* Modal Navigation Tabs */}
              <div className="flex border-b border-slate-150 bg-slate-50/50 px-6 pt-3 gap-2 overflow-x-auto shrink-0">
                <button
                  onClick={() => setModalTab('clinical')}
                  className={`pb-3 px-4 font-black text-xs tracking-wider uppercase border-b-2 transition flex items-center gap-2 shrink-0 ${
                    modalTab === 'clinical'
                      ? 'border-[#08B36A] text-[#08B36A] font-black'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <FaNotesMedical /> Clinical Summary & Reports
                </button>
                <button
                  onClick={() => setModalTab('team')}
                  className={`pb-3 px-4 font-black text-xs tracking-wider uppercase border-b-2 transition flex items-center gap-2 shrink-0 ${
                    modalTab === 'team'
                      ? 'border-[#08B36A] text-[#08B36A] font-black'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <FaUserMd /> Care Team & Logs
                </button>
                <button
                  onClick={() => setModalTab('billing')}
                  className={`pb-3 px-4 font-black text-xs tracking-wider uppercase border-b-2 transition flex items-center gap-2 shrink-0 ${
                    modalTab === 'billing'
                      ? 'border-[#08B36A] text-[#08B36A] font-black'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <FaFileInvoiceDollar /> Billing & Settlement
                </button>
                <button
                  onClick={() => setModalTab('patient')}
                  className={`pb-3 px-4 font-black text-xs tracking-wider uppercase border-b-2 transition flex items-center gap-2 shrink-0 ${
                    modalTab === 'patient'
                      ? 'border-[#08B36A] text-[#08B36A] font-black'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <FaUser /> Patient Profile
                </button>
              </div>

              {/* Modal Scrollable Body */}
              <div className="p-6 overflow-y-auto space-y-6 flex-grow min-h-0 bg-white">
                
                {/* Stay & Ward Banner */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-400 block">Ward & Bed</span>
                    <strong className="text-slate-900 font-black text-sm block mt-0.5">
                      {wardName} - Bed {bedNumber}
                    </strong>
                    <span className="text-[10px] text-[#08B36A] font-bold">Allocated Unit</span>
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
                      {computedModalStay} Days
                    </strong>
                  </div>
                </div>

                {/* TAB 1: CLINICAL SUMMARY & REPORTS */}
                {modalTab === 'clinical' && (
                  <div className="space-y-6 animate-in fade-in duration-150">
                    
                    {/* Embedded PDF Discharge Summary Document */}
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
                        <span className="text-[10px] font-black text-[#08B36A] uppercase tracking-wider block">Reason For Admission</span>
                        <p className="text-slate-800 font-bold text-xs mt-1">
                          {patientReason || clinical.chiefComplaint || 'No chief complaint registered.'}
                        </p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                        <span className="text-[10px] font-black text-[#08B36A] uppercase tracking-wider block">Clinical Diagnosis</span>
                        <p className="text-slate-900 font-extrabold text-xs mt-1">
                          {clinical.diagnosis || 'Post-discharge case records verified.'}
                        </p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                        <span className="text-[10px] font-black text-[#08B36A] uppercase tracking-wider block">Blood Group & Priority</span>
                        <p className="text-slate-800 font-bold text-xs mt-1">
                          Blood: {patientBlood || 'N/A'} • Triage: {clinical.triagePriority || selectedRecord.triageLevel || 'Normal'}
                        </p>
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
                            <FaDownload /> Discharge Prescription Card
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
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#08B36A]">Attending Physician</span>
                        <h3 className="text-base font-black text-slate-900">
                          {modalDoctor?.name ? (modalDoctor.name.startsWith('Dr.') ? modalDoctor.name : `Dr. ${modalDoctor.name}`) : 'Unassigned Doctor'}
                        </h3>
                        <p className="text-xs text-slate-600 font-semibold">{modalDoctor?.speciality || 'General Practitioner'}</p>
                        {modalDoctor?.qualification && (
                          <p className="text-[11px] text-slate-400 font-medium mt-0.5">Qualifications: {modalDoctor.qualification}</p>
                        )}
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
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Treatment Audit History */}
                    {selectedRecord.treatmentHistory && selectedRecord.treatmentHistory.length > 0 && (
                      <div className="border border-slate-200 rounded-2xl p-5">
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
                          <FaClock className="text-[#08B36A]" /> Clinical Activity & Discharge Audit History
                        </h4>
                        <div className="space-y-4">
                          {selectedRecord.treatmentHistory.map((th) => (
                            <div key={th._id} className="relative pl-6 border-l-2 border-[#08B36A]">
                              <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-[#08B36A]"></div>
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-extrabold text-slate-900">{th.action || 'Medical Action Logged'}</span>
                                <span className="text-[10px] text-slate-400 font-bold">{formatDateTime(th.timestamp)}</span>
                              </div>
                              <p className="text-xs text-slate-600 font-medium mt-1">{th.notes || 'No description provided.'}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                )}

                {/* TAB 3: BILLING & SETTLEMENT */}
                {modalTab === 'billing' && (
                  <div className="space-y-6 animate-in fade-in duration-150">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Financial Settlement Ledger */}
                      <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs">
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">
                          Settlement Ledger
                        </h4>
                        <div className="flex justify-between text-slate-600 font-medium">
                          <span>Base Admission Charges:</span>
                          <span className="font-bold text-slate-800">₹{breakdown.baseFee || totalAmount}</span>
                        </div>
                        {breakdown.visitCharges > 0 && (
                          <div className="flex justify-between text-slate-600 font-medium">
                            <span>Doctor Consultation Charges:</span>
                            <span className="font-bold text-slate-800">₹{breakdown.visitCharges}</span>
                          </div>
                        )}
                        <div className="border-t border-slate-200 pt-3 flex justify-between font-black text-slate-900 text-sm">
                          <span>Settled Grand Total:</span>
                          <span className="text-[#08B36A] text-base">₹{Number(totalAmount).toLocaleString('en-IN')}</span>
                        </div>
                      </div>

                      {/* Payment Status & Details */}
                      <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs font-medium">
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">
                          Transaction & Payment Metadata
                        </h4>
                        <div className="flex justify-between text-slate-600">
                          <span className="font-medium">Payment Status:</span>
                          <span className="font-black px-2 py-0.5 rounded text-[10px] uppercase bg-emerald-100 text-emerald-800">
                            {paymentStatus}
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span className="font-medium">Payment Method:</span>
                          <span className="font-bold text-slate-800">{paymentMethod}</span>
                        </div>
                        {txnId && (
                          <div className="flex justify-between text-slate-600">
                            <span className="font-medium">Transaction ID:</span>
                            <span className="font-mono font-bold text-slate-800">{txnId}</span>
                          </div>
                        )}
                      </div>

                    </div>

                  </div>
                )}

                {/* TAB 4: PATIENT PROFILE */}
                {modalTab === 'patient' && (
                  <div className="space-y-6 animate-in fade-in duration-150">
                    
                    {/* Patient Information Card */}
                    <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50">
                      <div className="flex items-start gap-4">
                        {patientAvatar ? (
                          <img src={patientAvatar} alt={patientName} className="w-16 h-16 rounded-2xl object-cover border shrink-0" />
                        ) : (
                          <div className="w-16 h-16 rounded-2xl bg-white text-[#08B36A] border border-slate-200 flex items-center justify-center font-bold text-2xl shrink-0">
                            {patientName.charAt(0) || '?'}
                          </div>
                        )}
                        <div className="flex-grow space-y-1 text-xs">
                          <span className="text-[10px] font-black uppercase text-[#08B36A]">Patient Information</span>
                          <h4 className="font-black text-slate-900 text-base">{patientName}</h4>
                          <p className="text-slate-600 font-semibold">
                            Age: {patientAge} Yrs • Gender: {patientGender} • Relation: {patientRelation}
                          </p>
                          {patientBlood && (
                            <p className="text-rose-600 font-bold">Blood Group: {patientBlood}</p>
                          )}
                          {patientReason && (
                            <p className="text-slate-700 font-medium mt-1">
                              <strong>Reason for Visit:</strong> {patientReason}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Booked By User Details */}
                    {modalUser.name && (
                      <div className="p-5 border border-slate-200 rounded-2xl flex items-center gap-4 text-xs">
                        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-lg shrink-0">
                          <FaUser />
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-black uppercase text-slate-400">Account Registration</span>
                          <h4 className="font-extrabold text-slate-900 text-sm">{modalUser.name}</h4>
                          {modalUser.phone && <p className="text-slate-600 flex items-center gap-2"><FaPhone className="text-slate-400" size={10} /> {modalUser.phone}</p>}
                          {modalUser.email && <p className="text-slate-600 flex items-center gap-2"><FaEnvelope className="text-slate-400" size={10} /> {modalUser.email}</p>}
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