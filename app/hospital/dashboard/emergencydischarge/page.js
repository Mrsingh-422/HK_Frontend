'use client'

import React, { useState, useEffect } from 'react'
import {
  FaUserCheck, FaFileAlt, FaSignOutAlt, FaPrint,
  FaNotesMedical, FaDollarSign, FaTimes, FaWallet, FaHourglassHalf,
  FaCheckCircle, FaSearch, FaUserMd, FaTint, FaRegCalendarAlt, FaAmbulance, FaProcedures
} from 'react-icons/fa'
import PatientDetailModal from './components/PatientDetailModal';
import CompleteDischargeModal from './components/CompleteDischargeModal';
import HospitalAPI from '@/app/services/HospitalAPI';

export default function EmergencyDischargePage() {
  const [activeTab, setActiveTab] = useState("emergency"); // "emergency" or "admission"
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activePatientId, setActivePatientId] = useState(null);
  const [activePatient, setActivePatient] = useState(null);
  const [isCompleteOpen, setIsCompleteOpen] = useState(false);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Completed Receipt Modal State
  const [dischargeReceipt, setDischargeReceipt] = useState(null);

  useEffect(() => {
    fetchDischargeCandidates(activeTab);
  }, [activeTab]);

  const fetchDischargeCandidates = async (caseType) => {
    setLoading(true);
    try {
      const response = await HospitalAPI.getAdmissionDetails(null, caseType);
      if (response?.success) {
        setPatients(response.data || []);
      } else {
        setPatients([]);
      }
    } catch (error) {
      console.error(`Failed to load discharge patients for ${caseType}:`, error);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetail = (id) => {
    setActivePatientId(id);
    setIsModalOpen(true);
  };

  const handleOpenDischarge = (patient) => {
    setActivePatient(patient);
    setIsCompleteOpen(true);
  };

  const handleConfirmDischarge = async (data) => {
    try {
      let response;
      if (data.isEmergency) {
        response = await HospitalAPI.finalizeEmergencyDischarge({
          appointmentId: data.appointmentId,
          billingItems: data.billingItems,
          totalAmount: data.totalAmount
        });
      } else {
        response = await HospitalAPI.finalizeDischarge({
          appointmentId: data.appointmentId,
          billingItems: data.billingItems,
          totalAmount: data.totalAmount
        });
      }

      if (response?.success) {
        // Build detailed printed statement aligned with activePatient payload
        setDischargeReceipt({
          patientName: activePatient.patients?.[0]?.patientName || activePatient.userId?.name || "Patient",
          age: activePatient.patients?.[0]?.patientAge || "N/A",
          gender: activePatient.patients?.[0]?.gender || "N/A",
          bookingId: activePatient.bookingId || "CAS-ID",
          startDate: activePatient.startDate || activePatient.appointmentDate,
          endDate: activePatient.endDate || new Date(),
          billingItems: data.billingItems,
          totalAmount: data.totalAmount,
          bookedTransport: data.bookedTransport,
          pricingBreakdown: activePatient.pricingBreakdown || {},
          billingBreakdown: activePatient.billingBreakdown || {},
          advancePaid: data.advancePaid,
          outstandingBalance: data.outstandingBalance,
          bedId: activePatient.bedId || {}
        });

        fetchDischargeCandidates(activeTab); 
      } else {
        alert(response?.message || "Failed to finalize admission closure.");
      }
    } catch (error) {
      console.error("Error processing discharge closure:", error);
      alert("Failed to finalize discharge procedure.");
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const filteredPatients = patients.filter(p => {
    const mainUserName = p.userId?.name || "";
    const secondaryPatientName = p.patients?.[0]?.patientName || "";
    const bookingId = p.bookingId || "";
    
    return mainUserName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           secondaryPatientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           bookingId.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-10">

      {/* --- HEADER --- */}
      <div className="max-w-7xl mx-auto mb-6 flex flex-col md:flex-row md:items-center justify-between gap-6 print:hidden">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
            <span className="p-3 bg-[#08B36A] rounded-2xl shadow-lg shadow-green-100 text-white flex items-center justify-center">
              <FaSignOutAlt />
            </span>
            Discharge Lounge
          </h1>
          <p className="text-slate-500 font-medium mt-1">Manage pending depart cases, process invoice closing statements and sign-offs.</p>
        </div>

        <div className="relative w-full md:w-96">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search patient name or Booking ID..."
            className="w-full pl-12 pr-4 py-4 bg-white border-none shadow-sm rounded-2xl focus:ring-2 focus:ring-[#08B36A] outline-none transition-all font-semibold text-xs"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* --- TABS --- */}
      <div className="max-w-7xl mx-auto mb-8 flex border-b border-slate-200 print:hidden">
        <button
          onClick={() => setActiveTab("emergency")}
          className={`flex items-center gap-2 pb-4 px-6 text-xs font-black uppercase tracking-wider transition-all border-b-2 duration-200 ${
            activeTab === "emergency"
              ? "border-[#08B36A] text-[#08B36A]"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          <FaAmbulance size={14} />
          Emergency Transports
        </button>
        <button
          onClick={() => setActiveTab("admission")}
          className={`flex items-center gap-2 pb-4 px-6 text-xs font-black uppercase tracking-wider transition-all border-b-2 duration-200 ${
            activeTab === "admission"
              ? "border-[#08B36A] text-[#08B36A]"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          <FaProcedures size={14} />
          Hospital Admissions
        </button>
      </div>

      {/* --- CONTENT AREA --- */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-150 shadow-sm max-w-7xl mx-auto print:hidden">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#08B36A] mb-4"></div>
          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">Fetching Pending Discharges...</span>
        </div>
      ) : filteredPatients.length > 0 ? (
        <div className="max-w-7xl mx-auto bg-white rounded-3xl border border-slate-150 shadow-sm overflow-hidden print:hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  <th className="p-4 pl-6">Patient Details</th>
                  <th className="p-4">Clinical Status</th>
                  <th className="p-4">Placement (Location)</th>
                  <th className="p-4">Duty Physician</th>
                  <th className="p-4">Dates & Timeline</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPatients.map((item) => {
                  const mainPatient = item.patients?.[0] || {};
                  const patientName = mainPatient.patientName || item.userId?.name || "Unknown Patient";
                  const patientAge = mainPatient.patientAge;
                  const patientGender = mainPatient.gender || item.userId?.gender;
                  const relation = mainPatient.relation;
                  const bloodGroup = item.clinicalSummary?.bloodGroup || "N/A";

                  const chiefComplaint = item.clinicalSummary?.chiefComplaint || mainPatient.reasonForVisit;
                  const diagnosis = item.clinicalSummary?.diagnosis || "Undisclosed Diagnosis";

                  const isDoctorObject = typeof item.doctorId === 'object' && item.doctorId !== null;
                  const docName = isDoctorObject ? item.doctorId.name : "Lead Attending";
                  const docSpec = isDoctorObject ? item.doctorId.speciality : "Duty Physician";

                  const isAmbulanceObj = typeof item.ambulanceId === 'object' && item.ambulanceId !== null;
                  const ambulanceName = isAmbulanceObj ? item.ambulanceId.name : "Emergency Transit Services";

                  const bed = item.bedId || {};
                  const ward = bed.wardId || {};

                  return (
                    <tr key={item._id} className="hover:bg-slate-50/50 transition-colors">
                      
                      {/* Patient Info */}
                      <td className="p-4 pl-6">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black text-[#08B36A] uppercase tracking-wider mb-0.5">
                            {item.bookingId || "CAS-ID"}
                          </span>
                          <span className="text-sm font-extrabold text-slate-900 leading-tight">
                            {patientName}
                          </span>
                          <div className="flex items-center gap-2 mt-1 text-[11px] font-bold text-slate-400">
                            <span>{patientAge ? `${patientAge} Yrs` : 'N/A'} &bull; {patientGender} ({relation || 'Self'})</span>
                            <span>&bull;</span>
                            <span className="flex items-center gap-1 text-rose-500">
                              <FaTint size={9} /> {bloodGroup}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Clinical Summary */}
                      <td className="p-4 max-w-xs">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                            <span className="p-1 bg-slate-100 text-slate-500 rounded text-[9px] uppercase tracking-wider font-extrabold">Complaint</span>
                            <span className="truncate max-w-[150px]">{chiefComplaint || "N/A"}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                            <span className="p-1 bg-green-50 text-[#08B36A] rounded text-[9px] uppercase tracking-wider font-extrabold">Diagnosis</span>
                            <span className="truncate max-w-[150px]">{diagnosis}</span>
                          </div>
                        </div>
                      </td>

                      {/* Ward & Bed Allocation details */}
                      <td className="p-4">
                        {item.bedId ? (
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                              <FaProcedures className="text-[#08B36A]" size={11} />
                              <span>
                                {item.wardName || ward.name || "N/A"} &bull; Bed {item.bedNumber || bed.bedNumber || "N/A"}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-bold flex items-center gap-0.5 mt-0.5">
                              <FaDollarSign size={8} className="text-slate-300" /> 
                              <span>₹{bed.pricePerDay || 0}/Day Stay Fee</span>
                            </span>
                          </div>
                        ) : item.ambulanceId ? (
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600">
                              <FaAmbulance size={11} />
                              <span>Emergency Drop-off</span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-bold truncate max-w-[180px]">
                              {ambulanceName}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-slate-400 italic">No Location Allotted</span>
                        )}
                      </td>

                      {/* Duty physician */}
                      <td className="p-4">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800">
                            <FaUserMd className="text-slate-400" size={12} />
                            <span>Dr. {docName}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-bold mt-0.5 pl-4 uppercase tracking-wider">
                            {docSpec}
                          </span>
                        </div>
                      </td>

                      {/* Stay timeline details */}
                      <td className="p-4">
                        <div className="flex flex-col text-[11px] text-slate-600 font-bold">
                          <div className="flex items-center gap-1">
                            <FaRegCalendarAlt className="text-slate-400" size={10} />
                            <span>In: {formatDate(item.startDate)}</span>
                          </div>
                          {item.endDate && <span className="text-[10px] text-slate-400 mt-0.5">Out: {formatDate(item.endDate)}</span>}
                        </div>
                      </td>

                      {/* Discharge Status label */}
                      <td className="p-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          item.status === 'Discharge-Pending' 
                            ? 'bg-amber-50 text-amber-600 border border-amber-200/50' 
                            : 'bg-green-50 text-[#08B36A] border border-[#08B36A]/20'
                        }`}>
                          {item.status || "Ready"}
                        </span>
                      </td>

                      {/* Grid actions */}
                      <td className="p-4 text-right pr-6">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenDischarge(item)}
                            className="px-3.5 py-2 bg-[#08B36A] hover:bg-[#079d5c] text-white rounded-xl font-bold text-[10px] flex items-center gap-1.5 transition shadow-sm"
                          >
                            <FaCheckCircle size={10} /> COMPLETE
                          </button>
                          <button
                            onClick={() => handleOpenDetail(item._id)}
                            className="px-3.5 py-2 bg-white border border-slate-200 text-slate-500 hover:border-slate-800 hover:text-slate-800 rounded-xl font-bold text-[10px] flex items-center gap-1.5 transition"
                          >
                            <FaFileAlt size={10} /> DETAILS
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Empty layout display */
        <div className="text-center py-20 max-w-7xl mx-auto bg-white rounded-3xl border border-slate-150 shadow-sm print:hidden">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
            <FaUserCheck size={30} />
          </div>
          <h3 className="text-xl font-bold text-slate-800">No pending discharges found</h3>
          <p className="text-slate-400 text-sm mt-1">All pending {activeTab} case departure checklists are cleared.</p>
        </div>
      )}

      {/* Clinical Dossier Modal */}
      {isModalOpen && (
        <PatientDetailModal
          appointmentId={activePatientId}
          patientData={patients.find(p => p._id === activePatientId)}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      {/* Complete Discharge Billing Modal */}
      {isCompleteOpen && (
        <CompleteDischargeModal
          patient={activePatient}
          initialBillingItems={activePatient?.specialServices || []}
          onClose={() => setIsCompleteOpen(false)}
          onConfirm={handleConfirmDischarge}
        />
      )}

      {/* COMPLETED DISCHARGE ITEMISED RECEIPT */}
      {dischargeReceipt && (
        <div className="fixed inset-0 z-[200] overflow-y-auto bg-slate-900/65 backdrop-blur-md flex items-center justify-center p-4 print:p-0 print:static print:inset-auto print:bg-white print:backdrop-blur-none">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-200 print:shadow-none print:border-none print:rounded-none print:max-h-full print:static">
            
            {/* Action buttons (hidden in print) */}
            <div className="bg-slate-900 px-6 py-4 flex justify-between items-center text-white shrink-0 print:hidden">
              <span className="text-xs font-black uppercase tracking-wider text-[#08B36A]">Discharge Procedure Finalized</span>
              <div className="flex gap-2">
                <button 
                  onClick={handlePrintReceipt}
                  className="bg-[#08B36A] hover:bg-[#068c51] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
                >
                  <FaPrint /> Print / Save PDF
                </button>
                <button 
                  onClick={() => setDischargeReceipt(null)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-xs font-bold transition"
                >
                  Close Statement
                </button>
              </div>
            </div>

            {/* Document Content */}
            <div id="discharge-receipt-print" className="p-8 md:p-12 overflow-y-auto print:overflow-visible print:p-0">
              
              {/* Header Box */}
              <div className="flex justify-between items-start border-b pb-6">
                <div>
                  <h1 className="text-xl font-black uppercase tracking-tight text-slate-900">Hospital Discharge Ledger</h1>
                  <p className="text-slate-400 font-semibold text-[10px] uppercase mt-0.5 tracking-wider">Closed Billing Ledger Statement</p>
                  <p className="text-xs text-slate-600 font-extrabold mt-3">Dossier Account ID: <span className="text-slate-900">#{dischargeReceipt.bookingId}</span></p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-[#08B36A]">🏥 GENERAL HOSPITAL</span>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-1">Panel Administration Desk</p>
                  <p className="text-xs text-slate-500 font-bold mt-2">Date: {new Date().toLocaleDateString()}</p>
                </div>
              </div>

              {/* Patient Profile details */}
              <div className="my-6 p-4 bg-slate-50 rounded-2xl border border-slate-150 text-xs grid grid-cols-2 gap-y-2">
                <div><span className="text-slate-400 font-bold uppercase tracking-wide text-[9px]">Recipient Name</span></div>
                <div className="text-right font-black text-slate-800">{dischargeReceipt.patientName}</div>

                <div><span className="text-slate-400 font-bold uppercase tracking-wide text-[9px]">Sex & Registered Age</span></div>
                <div className="text-right font-black text-slate-800">{dischargeReceipt.gender} / {dischargeReceipt.age} yrs</div>

                <div><span className="text-slate-400 font-bold uppercase tracking-wide text-[9px]">Admission Date</span></div>
                <div className="text-right font-black text-slate-800">{formatDate(dischargeReceipt.startDate)}</div>

                <div><span className="text-slate-400 font-bold uppercase tracking-wide text-[9px]">Departure Date</span></div>
                <div className="text-right font-black text-slate-800">{formatDate(dischargeReceipt.endDate)}</div>
              </div>

              {/* Itemized list of charges */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-1">Itemized Ledger Accounts</h4>
                <div className="divide-y divide-slate-100 text-xs">
                  
                  {/* Standard Base Fee */}
                  <div className="flex justify-between py-2.5">
                    <span className="text-slate-600 font-semibold">Standard Base Admission Fee</span>
                    <span className="font-extrabold text-slate-900">
                      ₹{Number(dischargeReceipt.billingBreakdown?.baseStayCharge || dischargeReceipt.pricingBreakdown?.baseFee || 0).toFixed(2)}
                    </span>
                  </div>

                  {/* Consultations */}
                  {dischargeReceipt.pricingBreakdown?.visitCharges > 0 && (
                    <div className="flex justify-between py-2.5">
                      <span className="text-slate-600 font-semibold">Attending Consultation Services</span>
                      <span className="font-extrabold text-slate-900">₹{dischargeReceipt.pricingBreakdown.visitCharges.toFixed(2)}</span>
                    </div>
                  )}

                  {/* Overstay Charges */}
                  {Number(dischargeReceipt.billingBreakdown?.overstayCharge || dischargeReceipt.pricingBreakdown?.extraCharges || 0) > 0 && (
                    <div className="flex justify-between py-2.5">
                      <span className="text-slate-600 font-semibold">
                        Overstay / Late Release Fees 
                        {dischargeReceipt.billingBreakdown?.overstayDays ? ` (${dischargeReceipt.billingBreakdown.overstayDays} Days)` : ''}
                      </span>
                      <span className="font-extrabold text-rose-600">
                        ₹{Number(dischargeReceipt.billingBreakdown?.overstayCharge || dischargeReceipt.pricingBreakdown?.extraCharges || 0).toFixed(2)}
                      </span>
                    </div>
                  )}

                  {/* Dynamic Manual items */}
                  {dischargeReceipt.billingItems?.map((item, index) => (
                    <div key={index} className="flex justify-between py-2.5">
                      <span className="text-slate-600 font-semibold">{item.serviceName}</span>
                      <span className="font-extrabold text-slate-900">₹{(item.price || 0).toFixed(2)}</span>
                    </div>
                  ))}

                  {/* Discounts Applied */}
                  {dischargeReceipt.pricingBreakdown?.discountAmount > 0 && (
                    <div className="flex justify-between py-2.5 text-green-600 border-b">
                      <span>Applied Panel Discount</span>
                      <span className="font-black">-₹{dischargeReceipt.pricingBreakdown.discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                </div>
              </div>

              {/* PAYMENT & OUTSTANDING RECONCILIATION SUMMARY */}
              <div className="mt-8 bg-slate-50 border border-slate-150 rounded-2xl p-4 text-xs space-y-2.5">
                <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest border-b pb-1">Payment Settle Reconciliation</span>
                
                <div className="flex justify-between">
                  <span className="text-slate-600 font-semibold">Itemized Cumulative Cost:</span>
                  <span className="font-bold text-slate-900">₹{dischargeReceipt.totalAmount.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-emerald-600">
                  <span className="font-semibold flex items-center gap-1"><FaWallet size={10} /> Paid Advance (Booking Deposit):</span>
                  <span className="font-extrabold">- ₹{dischargeReceipt.advancePaid.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center text-sm font-black text-slate-900 border-t border-dashed pt-2.5">
                  <span className="uppercase text-[10px] text-slate-400 font-black tracking-wider flex items-center gap-1">
                    <FaHourglassHalf className="text-amber-500" size={10} /> Settleable Balance Due:
                  </span>
                  <span className="text-xl text-[#08B36A]">₹{dischargeReceipt.outstandingBalance.toFixed(2)}</span>
                </div>
              </div>

              {/* Transport / Referral Add-on Summary Footers */}
              {dischargeReceipt.bookedTransport && (
                <div className="mt-6 p-4 bg-[#08B36A]/5 rounded-2xl border border-[#08B36A]/20 text-xs space-y-1">
                  <p className="font-extrabold text-[#08B36A] uppercase text-[9px] tracking-wider">
                    {dischargeReceipt.bookedTransport.type === 'home' ? 'Coordinated Drop-off Dispatch' : 'Clinical Facility Referral Shift'}
                  </p>
                  
                  {dischargeReceipt.bookedTransport.type === 'home' ? (
                    <>
                      <p className="text-slate-800 font-bold">{dischargeReceipt.bookedTransport.ambulanceName} ({dischargeReceipt.bookedTransport.vehicleNumber})</p>
                      <p className="text-[10px] text-slate-500 font-medium">Destination: {dischargeReceipt.bookedTransport.homeAddress} &bull; Distance: {dischargeReceipt.bookedTransport.distance}</p>
                    </>
                  ) : (
                    <>
                      <p className="text-slate-800 font-bold">Facility: {dischargeReceipt.bookedTransport.hospitalName}</p>
                      <p className="text-[10px] text-slate-500 font-medium">
                        Scheduled: {dischargeReceipt.bookedTransport.scheduledDate} @ {dischargeReceipt.bookedTransport.scheduledTime}
                        {dischargeReceipt.bookedTransport.staffType !== "None" && ` &bull; Accompanying Crew: ${dischargeReceipt.bookedTransport.staffType}`}
                      </p>
                    </>
                  )}
                </div>
              )}

              {/* Legal disclaimer */}
              <div className="mt-12 text-center text-slate-400 font-bold text-[9px] uppercase tracking-widest border-t pt-6">
                <p>This is a system generated print receipt. No physical signature is required.</p>
                <p className="mt-1">General Hospital Panel Board Management Systems &copy; 2026</p>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Compiler-safe global print style injection */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #discharge-receipt-print, #discharge-receipt-print * {
            visibility: visible;
          }
          #discharge-receipt-print {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}} />

    </div>
  )
}