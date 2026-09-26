'use client'

import React, { useEffect, useState } from 'react'
import { 
  FaTimes, FaUserMd, FaProcedures, FaHeartbeat, 
  FaPrint, FaTint, FaCreditCard, FaUser, FaPhone, 
  FaHospital, FaPills, FaUndoAlt, FaShieldAlt, FaDownload,
  FaFilePdf, FaEnvelope, FaClock, FaCalendarAlt, FaCheckCircle,
  FaTimesCircle, FaNotesMedical, FaHistory, FaMapMarkerAlt
} from 'react-icons/fa'
import HospitalAPI from '@/app/services/HospitalAPI';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const PatientDetailModal = ({ appointmentId, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('clinical'); // 'clinical' | 'billing' | 'careteam' | 'account'

  useEffect(() => {
    if (appointmentId) {
      loadClinicalCaseFile();
    }
  }, [appointmentId]);

  const loadClinicalCaseFile = async () => {
    setLoading(true);
    try {
      const response = await HospitalAPI.getAdmissionDetailsById(appointmentId);
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
    if (!path) return '';
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

  const rawPatient = data || {};
  const mainPatient = rawPatient.patientDetails || {};
  const patientName = mainPatient.patientName || "Unknown Patient";
  const patientAge = mainPatient.age !== undefined ? mainPatient.age : "N/A";
  const patientGender = mainPatient.gender || "N/A";
  const relation = mainPatient.relation || "Self";
  const bloodGroup = mainPatient.bloodGroup || rawPatient.clinicalSummary?.bloodGroup || "N/A";
  const profilePic = mainPatient.profilePic;

  const doctor = rawPatient.assignedDoctor || rawPatient.primaryDoctor || {};
  const bed = rawPatient.bedDetails || {};
  const wardName = bed.wardName || "N/A";
  const wardType = bed.wardType || "";
  const bedNumber = bed.bedNumber || "N/A";
  const pricePerDay = bed.pricePerDay || 0;

  const clinical = rawPatient.clinicalSummary || {};
  const clinicalDiagnosis = clinical.clinicalDiagnosis || "Pending clinical validation";
  const investigationNotes = clinical.investigationNotes || "Pending investigations";
  const reasonForVisit = clinical.reasonForVisit || mainPatient.reasonForVisit || "Hospital Admission";
  const vitals = clinical.vitals || {};

  const billing = rawPatient.billingBreakdown || {};
  const clinicalFiles = rawPatient.clinicalFiles || {};
  const bedsideCareTeam = rawPatient.bedsideCareTeam || [];
  const treatmentTeamTimeline = rawPatient.treatmentTeamTimeline || [];
  const bookedBy = rawPatient.bookedBy || {};
  const hospital = rawPatient.hospitalDetails || {};
  const insurance = rawPatient.insurance || {};

  const stayUnitCharge = billing.stayUnitCharge || pricePerDay || 0;
  const baseStayDuration = billing.baseStayDuration || `${rawPatient.stayDuration || 1} Days`;
  const accumulatedBaseFee = billing.accumulatedBaseFee || billing.baseBedAllocationCharge || 0;
  const depositPaid = billing.depositPaidOnBooking || billing.paidOnBooking || 0;
  const overstayDays = billing.overstayDays || 0;
  const overstayCharge = billing.overstayCharge || 0;
  const refundDue = Number(billing.refundDueToUser || 0);
  const remainingBalance = billing.remainingBalance !== undefined ? billing.remainingBalance : (billing.pendingDepartureBalance || 0);
  const currentBillTotal = billing.currentBillTotal || billing.totalInvoiceValue || 0;
  const settlementStatus = billing.settlementStatus || "Discharge-Pending";

  const dischargeSummaryPdf = clinical.dischargeSummaryPdf || clinicalFiles.dischargeSummaryPdf;
  const dietPlanPdf = clinicalFiles.dietPlanPdf;
  const dischargeCardUrl = clinicalFiles.dischargeCardUrl;
  const reportsList = clinical.uploadedReports || clinicalFiles.clinicalReports || [];

  const handlePrint = () => {
    window.print();
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
              {clinical.triagePriority && (
                <span className="text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider bg-rose-50 text-rose-600 border border-rose-200">
                  Triage: {clinical.triagePriority}
                </span>
              )}
            </div>
            <p className="text-slate-400 font-bold text-xs mt-0.5">
              {hospital.name ? `${hospital.name} • ` : ''}Discharge Candidate Audit
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handlePrint}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <FaPrint size={12} /> Print Dossier
            </button>
            <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-rose-500 rounded-xl transition-all cursor-pointer">
              <FaTimes size={16} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
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
            <FaUserMd /> Care Team ({bedsideCareTeam.length})
          </button>
          <button
            onClick={() => setActiveTab('account')}
            className={`pb-3 px-3 text-xs font-black uppercase tracking-wider border-b-2 transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'account' ? 'border-[#08B36A] text-[#08B36A]' : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <FaUser /> Booking & Insurance
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 md:p-8 overflow-y-auto flex-grow min-h-0 bg-white">
          {loading ? (
            <div className="py-20 flex flex-col justify-center items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#08B36A] mb-3"></div>
              <span className="text-xs text-slate-400 font-extrabold uppercase">Loading complete admission dossier...</span>
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
                    <span>{patientAge !== 'N/A' ? `${patientAge} Years` : 'Age N/A'} &bull; {patientGender} ({relation})</span>
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
                    <FaProcedures className="text-[#08B36A]" /> {wardName} {wardType && `(${wardType})`} &bull; Bed: {bedNumber}
                  </div>
                </div>
              </div>

              {/* TAB 1: CLINICAL DIAGNOSTICS */}
              {activeTab === 'clinical' && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50/50 border border-slate-150 rounded-2xl space-y-3 text-xs">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1">Reason & Admission Context</h4>
                      <div>
                        <p className="font-bold text-slate-400 uppercase text-[9px]">Reason for Visit:</p>
                        <p className="font-semibold text-slate-700 mt-0.5">{reasonForVisit}</p>
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
                        <p className="font-bold text-[#08B36A] mt-0.5">{clinicalDiagnosis}</p>
                      </div>
                      <div>
                        <p className="font-bold text-slate-400 uppercase text-[9px]">Investigation Notes:</p>
                        <p className="font-semibold text-slate-700 mt-0.5">{investigationNotes}</p>
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
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Exact Stay Hours</span>
                      <strong className="text-slate-800 font-extrabold block mt-0.5">{billing.exactStayHours ? `${billing.exactStayHours} hrs` : `${baseStayDuration}`}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Outcome Result</span>
                      <strong className="text-indigo-600 font-extrabold block mt-0.5">{clinical.outcomeResult || "Discharged"}</strong>
                    </div>
                  </div>

                  {/* Conditions Admission vs Discharge */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-amber-50/40 border border-amber-200/60 rounded-2xl text-xs">
                      <span className="text-[9px] font-black text-amber-800 uppercase tracking-widest block mb-1">State at Admission</span>
                      <p className="font-bold text-slate-700 capitalize">{clinical.conditionDuringAdmission || "N/A"}</p>
                    </div>
                    <div className="p-4 bg-emerald-50/40 border border-emerald-200/60 rounded-2xl text-xs">
                      <span className="text-[9px] font-black text-emerald-800 uppercase tracking-widest block mb-1">State at Discharge</span>
                      <p className="font-bold text-slate-700 capitalize">{clinical.conditionDuringDischarge || "Normal"}</p>
                    </div>
                  </div>

                  {/* Vitals Snapshot */}
                  {(vitals.bp || vitals.pulse || vitals.temp || vitals.spo2) && (
                    <div className="p-4 bg-rose-50/30 border border-rose-100 rounded-2xl">
                      <span className="text-[10px] font-black uppercase text-rose-600 tracking-wider block mb-2">Recorded Vitals Summary</span>
                      <div className="grid grid-cols-4 gap-2 text-center text-xs">
                        <div className="bg-white p-2.5 rounded-xl border border-rose-100/80">
                          <span className="text-[8px] font-bold text-slate-400 uppercase block">BP</span>
                          <strong className="text-slate-800 font-black">{vitals.bp || '—'}</strong>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-rose-100/80">
                          <span className="text-[8px] font-bold text-slate-400 uppercase block">Pulse</span>
                          <strong className="text-slate-800 font-black">{vitals.pulse ? `${vitals.pulse} bpm` : '—'}</strong>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-rose-100/80">
                          <span className="text-[8px] font-bold text-slate-400 uppercase block">Temp</span>
                          <strong className="text-slate-800 font-black">{vitals.temp ? `${vitals.temp} °F` : '—'}</strong>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-rose-100/80">
                          <span className="text-[8px] font-bold text-slate-400 uppercase block">SpO2</span>
                          <strong className="text-emerald-600 font-black">{vitals.spo2 ? `${vitals.spo2} %` : '—'}</strong>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Generated PDF & Dossier Downloads */}
                  <div className="p-5 bg-slate-900 text-white rounded-2xl border border-slate-800">
                    <h4 className="text-xs font-black uppercase tracking-wider text-[#08B36A] mb-3 flex items-center gap-2">
                      <FaFilePdf /> Clinical Documents & Generated PDFs
                    </h4>
                    <div className="flex flex-wrap gap-2.5">
                      {dischargeSummaryPdf ? (
                        <a
                          href={getFullUrl(dischargeSummaryPdf)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-[#08B36A] hover:bg-[#079d5c] text-white text-xs font-bold rounded-xl transition cursor-pointer"
                        >
                          <FaDownload /> Download Discharge Summary PDF
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Discharge summary PDF generating on formal sign-off.</span>
                      )}

                      {dietPlanPdf && (
                        <a
                          href={getFullUrl(dietPlanPdf)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition border border-slate-700 cursor-pointer"
                        >
                          <FaDownload /> Diet Plan PDF
                        </a>
                      )}

                      {dischargeCardUrl && (
                        <a
                          href={getFullUrl(dischargeCardUrl)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition border border-slate-700 cursor-pointer"
                        >
                          <FaDownload /> Discharge Prescription Card
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Reports list */}
                  {reportsList && reportsList.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 ml-1">Attached Lab Reports ({reportsList.length})</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {reportsList.map((report, idx) => (
                          <a 
                            key={idx}
                            href={getFullUrl(report)} 
                            target="_blank" 
                            rel="noreferrer"
                            className="flex items-center space-x-2.5 p-3 border border-[#08B36A]/20 hover:bg-[#08B36A]/5 rounded-xl text-[#08B36A] font-bold transition"
                          >
                            <FaDownload size={12} className="flex-shrink-0" />
                            <span className="truncate">View Laboratory File #{idx + 1}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* TAB 2: FINANCIAL LEDGER */}
              {activeTab === 'billing' && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  <div className="p-5 bg-emerald-50/40 border border-emerald-100 rounded-2xl text-xs space-y-3">
                    <h4 className="text-xs font-black text-[#08B36A] uppercase tracking-wider border-b border-emerald-200 pb-2 flex items-center gap-1.5">
                      <FaHospital /> Active Bed Stay Summary
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <span className="text-slate-400 font-bold block uppercase text-[9px]">Stay Unit Charge:</span>
                        <strong className="text-slate-800 text-sm font-black">₹{stayUnitCharge} / Day</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold block uppercase text-[9px]">Base Stay Duration:</span>
                        <strong className="text-slate-800 text-sm font-black">{baseStayDuration}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold block uppercase text-[9px]">Accumulated Base Fee:</span>
                        <strong className="text-slate-800 text-sm font-black">₹{accumulatedBaseFee}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold block uppercase text-[9px]">Paid On Booking / Deposit:</span>
                        <strong className="text-emerald-700 text-sm font-black">₹{depositPaid}</strong>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-emerald-100">
                      <div>
                        <span className="text-slate-400 font-bold block uppercase text-[9px]">Overstay Allocation:</span>
                        <strong className="text-rose-600 font-black">
                          {overstayDays} Days (₹{overstayCharge})
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold block uppercase text-[9px]">Settlement Status:</span>
                        <strong className="text-emerald-700 text-xs font-black uppercase">
                          {settlementStatus}
                        </strong>
                      </div>
                      <div>
                        {refundDue > 0 ? (
                          <>
                            <span className="text-emerald-600 font-bold block uppercase text-[9px] flex items-center gap-1">
                              <FaUndoAlt size={8} /> Refund Due to Patient:
                            </span>
                            <strong className="text-emerald-600 text-sm font-black">
                              ₹{refundDue}
                            </strong>
                          </>
                        ) : (
                          <>
                            <span className="text-slate-400 font-bold block uppercase text-[9px]">Remaining Balance:</span>
                            <strong className="text-rose-600 text-sm font-black">
                              ₹{remainingBalance}
                            </strong>
                          </>
                        )}
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold block uppercase text-[9px]">Current Bill Total:</span>
                        <strong className="text-[#08B36A] text-base font-black">
                          ₹{currentBillTotal}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs">
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">Itemized Ledger (INR)</h4>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-semibold">Base Bed Allocation Charge:</span>
                        <span className="font-extrabold text-slate-800">₹{accumulatedBaseFee}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-semibold">Doctor Visit Fee:</span>
                        <span className="font-extrabold text-slate-800">₹{billing.doctorVisitFee || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-semibold">Extra Facilities Fee:</span>
                        <span className="font-extrabold text-slate-800">₹{billing.extraFacilitiesFee || 0}</span>
                      </div>
                      {billing.discountDeductions > 0 && (
                        <div className="flex justify-between text-rose-600 font-bold">
                          <span>Discounts / Deductions:</span>
                          <span>-₹{billing.discountDeductions}</span>
                        </div>
                      )}
                      <div className="border-t border-slate-200 pt-3 flex justify-between font-black text-slate-900 text-sm">
                        <span>Total Invoice Value:</span>
                        <span className="text-[#08B36A] text-base">₹{currentBillTotal}</span>
                      </div>
                    </div>

                    <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs font-medium">
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">Reconciliation Status</h4>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-semibold">Settlement Status:</span>
                        <span className={`font-black uppercase ${settlementStatus === 'Settled' || settlementStatus === 'Paid' ? 'text-green-600' : 'text-amber-500'}`}>
                          {settlementStatus}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-semibold">Booking ID Reference:</span>
                        <span className="font-bold text-slate-800 font-mono">#{rawPatient.bookingId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-semibold">Deposit Paid On Booking:</span>
                        <span className="font-bold text-emerald-700 font-mono">₹{depositPaid}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-semibold">Pending Departure Balance:</span>
                        <span className="font-black text-rose-600 font-mono">₹{remainingBalance}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: CARE TEAM & BEDSIDE SPECIALISTS */}
              {activeTab === 'careteam' && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  {/* Primary Duty Doctor Banner */}
                  <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                    {doctor.profileImage ? (
                      <img src={getFullUrl(doctor.profileImage)} alt={doctor.name} className="w-14 h-14 rounded-xl object-cover border shrink-0" />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xl shrink-0">
                        <FaUserMd />
                      </div>
                    )}
                    <div className="text-xs">
                      <span className="text-[9px] font-black uppercase text-[#08B36A]">Primary Duty Doctor</span>
                      <h4 className="font-black text-slate-900 text-sm">
                        {doctor.name ? (doctor.name.startsWith('Dr.') ? doctor.name : `Dr. ${doctor.name}`) : 'Lead Attending Doctor'}
                      </h4>
                      <p className="text-slate-600 font-bold">{doctor.speciality || 'General Physician'} {doctor.qualification && `• ${doctor.qualification}`}</p>
                    </div>
                  </div>

                  {/* Bedside Specialist Consultations */}
                  {bedsideCareTeam && bedsideCareTeam.length > 0 ? (
                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3 ml-1">
                        Bedside Specialist Consultations ({bedsideCareTeam.length})
                      </h4>
                      <div className="space-y-4">
                        {bedsideCareTeam.map((member, idx) => {
                          const doc = member.doctor || {};
                          const docName = doc.name ? (doc.name.startsWith('Dr.') ? doc.name : `Dr. ${doc.name}`) : (member.name || "Specialist Doctor");
                          const docSpec = doc.speciality || member.speciality || "Specialist";
                          const docQual = doc.qualification || member.qualification || "";
                          const docImg = doc.profileImage || member.profileImage;
                          const observations = member.observations || [];
                          const recommendedMeds = member.recommendedMedicines || [];

                          return (
                            <div key={idx} className="bg-slate-50/70 border border-slate-200 rounded-2xl p-4 text-xs space-y-3">
                              <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
                                <div className="flex items-center gap-3">
                                  {docImg ? (
                                    <img src={getFullUrl(docImg)} alt={docName} className="w-11 h-11 rounded-xl object-cover border shrink-0" />
                                  ) : (
                                    <div className="w-11 h-11 rounded-xl bg-white text-[#08B36A] flex items-center justify-center font-bold text-base shadow-sm border border-slate-200 shrink-0">
                                      <FaUserMd />
                                    </div>
                                  )}
                                  <div>
                                    <h5 className="font-extrabold text-slate-900 text-sm leading-tight">{docName}</h5>
                                    <p className="text-[10px] text-slate-500 font-bold">{docSpec} {docQual && `• ${docQual}`}</p>
                                    {member.requestReason && (
                                      <p className="text-[9px] text-slate-400 mt-0.5 italic">Reason: "{member.requestReason}"</p>
                                    )}
                                  </div>
                                </div>
                                <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full border ${
                                  member.status === 'Completed' 
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                    : member.status === 'Rejected'
                                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`}>
                                  {member.status || "Completed"}
                                </span>
                              </div>

                              {observations.length > 0 && (
                                <div className="space-y-2">
                                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Observations & Bedside Vitals ({observations.length})</span>
                                  {observations.map((obs, oIdx) => (
                                    <div key={oIdx} className="bg-white p-3 rounded-xl border border-slate-150 space-y-2">
                                      <div className="flex justify-between items-start">
                                        <p className="text-slate-700 font-semibold italic">"{obs.observation}"</p>
                                        <span className="text-[9px] text-slate-400 font-bold shrink-0">{formatDateTime(obs.submittedAt)}</span>
                                      </div>
                                      
                                      <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-500 font-bold pt-1 border-t border-slate-100">
                                        {obs.patientCondition && <span>Condition: <strong className="text-slate-800">{obs.patientCondition}</strong></span>}
                                        {obs.priorityRating && <span>Priority: <strong className="text-indigo-600">{obs.priorityRating}</strong></span>}
                                      </div>

                                      {obs.vitals && (
                                        <div className="grid grid-cols-4 gap-1.5 pt-1 text-center text-[10px]">
                                          <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                                            <span className="text-[8px] text-slate-400 uppercase block">BP</span>
                                            <strong className="text-slate-800">{obs.vitals.bp || '—'}</strong>
                                          </div>
                                          <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                                            <span className="text-[8px] text-slate-400 uppercase block">Pulse</span>
                                            <strong className="text-slate-800">{obs.vitals.pulse ? `${obs.vitals.pulse} bpm` : '—'}</strong>
                                          </div>
                                          <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                                            <span className="text-[8px] text-slate-400 uppercase block">Temp</span>
                                            <strong className="text-slate-800">{obs.vitals.temp ? `${obs.vitals.temp}°F` : '—'}</strong>
                                          </div>
                                          <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                                            <span className="text-[8px] text-slate-400 uppercase block">SpO2</span>
                                            <strong className="text-emerald-600">{obs.vitals.spo2 ? `${obs.vitals.spo2}%` : '—'}</strong>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}

                              {recommendedMeds.length > 0 && (
                                <div className="space-y-1.5">
                                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block flex items-center gap-1">
                                    <FaPills size={10} className="text-[#08B36A]" /> Recommended Medicines ({recommendedMeds.length})
                                  </span>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {recommendedMeds.map((med, mIdx) => (
                                      <div key={mIdx} className="bg-white p-2.5 rounded-xl border border-slate-150 flex justify-between items-center text-xs">
                                        <div>
                                          <p className="font-extrabold text-slate-800">{med.name}</p>
                                          <p className="text-[10px] text-slate-500 font-semibold">{med.dosage} &bull; {med.frequency} &bull; {med.duration}</p>
                                          {med.instructions && <p className="text-[9px] text-slate-400 italic mt-0.5">{med.instructions}</p>}
                                        </div>
                                        {med.type && (
                                          <span className="text-[8px] font-black uppercase bg-[#08B36A]/10 text-[#08B36A] px-2 py-0.5 rounded">
                                            {med.type}
                                          </span>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <p className="text-xs text-slate-400 font-bold">No bedside specialist consultations requested for this case file.</p>
                    </div>
                  )}

                  {/* Treatment Team Timeline */}
                  {treatmentTeamTimeline && treatmentTeamTimeline.length > 0 && (
                    <div className="border-t border-slate-100 pt-4">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3 ml-1 flex items-center gap-1.5">
                        <FaHistory /> Treatment Team Timeline ({treatmentTeamTimeline.length})
                      </h4>
                      <div className="space-y-2">
                        {treatmentTeamTimeline.map((item, tIdx) => (
                          <div key={tIdx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-150 text-xs">
                            <div className="flex items-center gap-3">
                              {item.profileImage ? (
                                <img src={getFullUrl(item.profileImage)} alt={item.name} className="w-8 h-8 rounded-lg object-cover border shrink-0" />
                              ) : (
                                <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs">
                                  <FaUserMd />
                                </div>
                              )}
                              <div>
                                <p className="font-extrabold text-slate-800">{item.name}</p>
                                <p className="text-[10px] text-slate-500 font-semibold">{item.role} &bull; {item.speciality}</p>
                              </div>
                            </div>
                            <div className="text-right text-[10px] font-bold text-slate-400">
                              <span>Joined: {formatDate(item.joinedAt)}</span>
                              {item.duration && <span className="block text-[#08B36A]">Duration: {item.duration}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: BOOKING & INSURANCE ACCOUNT */}
              {activeTab === 'account' && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  <div className="p-5 border border-slate-200 rounded-2xl flex items-center gap-4 text-xs">
                    <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xl shrink-0">
                      <FaUser />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-[#08B36A] uppercase block">Booked By Registered Account</span>
                      <h4 className="font-extrabold text-slate-900 text-sm">{bookedBy.name || "N/A"}</h4>
                      {bookedBy.phone && <p className="text-slate-600 flex items-center gap-1.5"><FaPhone /> {bookedBy.phone}</p>}
                      {bookedBy.email && <p className="text-slate-600 flex items-center gap-1.5"><FaEnvelope /> {bookedBy.email}</p>}
                    </div>
                  </div>

                  <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl grid grid-cols-2 md:grid-cols-3 gap-4 text-xs font-medium">
                    <div>
                      <span className="text-slate-400 font-bold block uppercase text-[9px]">Booking Dossier ID</span>
                      <strong className="text-[#08B36A] text-xs block mt-0.5 uppercase tracking-wide">#{rawPatient.bookingId}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block uppercase text-[9px]">Admission Duration</span>
                      <strong className="text-slate-800 text-xs block mt-0.5">{baseStayDuration}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block uppercase text-[9px]">Insurance Status</span>
                      <strong className="text-slate-800 text-xs block mt-0.5 flex items-center gap-1">
                        <FaShieldAlt className={insurance.hasInsurance ? "text-emerald-500" : "text-slate-400"} />
                        {insurance.hasInsurance ? `Covered (${insurance.approvalStatus})` : "Not Applied"}
                      </strong>
                    </div>
                  </div>

                  {hospital.name && (
                    <div className="p-5 bg-slate-50/50 border border-slate-200 rounded-2xl space-y-2 text-xs">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <FaHospital /> Admitting Facility Details
                      </h4>
                      <p className="font-extrabold text-slate-800 text-sm">{hospital.name}</p>
                      <p className="text-slate-500 flex items-center gap-1"><FaMapMarkerAlt /> {hospital.fullAddress}</p>
                      <div className="flex gap-4 text-[11px] text-slate-500 font-semibold pt-1">
                        {hospital.phone && <span>Phone: {hospital.phone}</span>}
                        {hospital.email && <span>Email: {hospital.email}</span>}
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          ) : (
            <div className="py-12 text-center text-slate-400">Failed to load dossier file details.</div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 flex gap-3 shrink-0">
          <button onClick={handlePrint} className="flex-1 bg-slate-900 text-white py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-black transition-all cursor-pointer">
            <FaPrint /> PRINT CASE DOSSIER
          </button>
          <button 
            onClick={onClose}
            className="flex-1 bg-white border border-slate-200 text-slate-500 py-3 rounded-xl font-bold text-xs hover:border-slate-350 hover:text-slate-850 transition-all cursor-pointer"
          >
            CLOSE DOSSIER
          </button>
        </div>
      </div>
    </div>
  )
}

export default PatientDetailModal;