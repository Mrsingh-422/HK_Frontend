"use client";

import React from 'react';
import { 
  FaUser, FaFileMedical, FaClock, FaAmbulance, FaCreditCard, FaDollarSign 
} from 'react-icons/fa';

const CaseDetailModal = ({ caseData, onClose, onStartAllocation }) => {
  const patient = caseData.patients?.[0] || {};
  const ambulance = caseData.ambulanceId || {};
  const billing = caseData.pricingBreakdown || {};
  const clinical = caseData.clinicalSummary || {};
  const user = caseData.userId || {};

  const displayFormattedDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-[2.5rem] w-full max-w-6xl max-h-[90vh] overflow-y-auto shadow-2xl border border-emerald-100 flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header Section */}
        <div className="p-6 border-b border-emerald-100/50 bg-emerald-50/50 flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur-md z-10 shrink-0">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Emergency Case Profile</h2>
              <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-rose-500 text-white animate-pulse">
                {caseData.triageLevel}
              </span>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              Case Ref: <span className="text-emerald-600">#{caseData.bookingId}</span>
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-rose-500 bg-white border rounded-full transition-all">
            ✕
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-8 space-y-6 flex-grow">
          
          {/* Diagnostic States */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-emerald-50/30 border border-emerald-100/50">
              <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Status State</p>
              <span className="text-sm font-black text-slate-800 uppercase tracking-wider">{caseData.status}</span>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50/30 border border-emerald-100/50">
              <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Allocation Class</p>
              <span className="text-sm font-black text-slate-800 uppercase tracking-wider">{caseData.bedBookingType}</span>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50/30 border border-emerald-100/50">
              <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Stay Duration</p>
              <span className="text-sm font-black text-slate-800">{caseData.stayDuration} Days</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Diagnostics and Patient Details */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Patient Information */}
              <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100 space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><FaUser className="text-slate-400" /> Patient Directory</p>
                <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs font-semibold text-slate-600">
                  <div>
                    <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Patient Name</span>
                    <span className="text-slate-800 font-extrabold">{patient.patientName}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Age & Gender</span>
                    <span className="text-slate-800 font-extrabold">{patient.patientAge} Years / {patient.gender}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Relation Status</span>
                    <span className="text-slate-800 font-extrabold uppercase">{patient.relation}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Reason for Visit</span>
                    <span className="text-slate-800 font-extrabold block truncate max-w-[150px]" title={patient.reasonForVisit}>"{patient.reasonForVisit}"</span>
                  </div>
                </div>
              </div>

              {/* Account Profile Details */}
              {caseData.userId && (
                <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100 space-y-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><FaUser className="text-slate-400" /> Account Registration Details</p>
                  <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-700">
                    <div>Registered Name: <span className="text-slate-900 font-black">{user.name}</span></div>
                    <div>Account Phone: <span className="text-slate-900 font-black">{user.phone}</span></div>
                    <div>Account Gender: <span className="text-slate-900 font-black uppercase">{user.gender || 'N/A'}</span></div>
                    <div className="text-[8px] text-slate-400 uppercase tracking-wider mt-1 col-span-2">Database ID: {user._id}</div>
                  </div>
                </div>
              )}

              {/* Clinical Summary Fields */}
              <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4">
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-wider flex items-center gap-1.5"><FaFileMedical /> System Medical Chart Summary</p>
                <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-xs text-slate-700">
                  <div className="space-y-3">
                    <div>
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Chief Complaint</span>
                      <p className="font-bold text-slate-800">{clinical.chiefComplaint || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Triage Priority</span>
                      <p className="font-bold text-slate-800">{clinical.triagePriority || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Diagnosis Record</span>
                      <p className="font-bold text-slate-800">{clinical.diagnosis || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Blood Group</span>
                      <p className="font-bold text-slate-800 uppercase">{clinical.bloodGroup || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Investigation Logs</span>
                      <p className="font-bold text-slate-800">{clinical.investigation || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Treatment Results</span>
                      <p className="font-bold text-slate-800">{clinical.treatmentResult || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Admission Notes</span>
                      <p className="font-bold text-slate-800">{clinical.admissionNote || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Discharge Summary</span>
                      <p className="font-bold text-slate-800">{clinical.dischargeNote || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Pricing & Quick Allotment Button */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Begin Sequential Allocation Process */}
              {(!caseData.doctorId || !caseData.bedId) && (
                <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100 shadow-sm space-y-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Clinical Admission Operations</p>
                  <button 
                    onClick={onStartAllocation}
                    className="w-full py-4 bg-[#08B36A] hover:bg-[#079d5c] text-white font-extrabold rounded-xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#08B36A]/10 active:scale-95"
                  >
                    ⚡ Authorize & Admit Patient
                  </button>
                </div>
              )}

              {/* Logistics & Ambulance Allocation */}
              {caseData.ambulanceId && (
                <div className="p-5 rounded-3xl bg-blue-50/50 border border-blue-100 space-y-4">
                  <p className="text-[10px] font-black text-blue-500 uppercase tracking-wider flex items-center gap-1.5"><FaAmbulance /> Allocated Dispatcher Fleet</p>
                  <div className="space-y-3 text-xs text-slate-600 font-semibold">
                    <div>Ambulance Crew: <span className="text-slate-800 font-extrabold">{ambulance.name}</span></div>
                    <div>Vehicle Class: <span className="text-slate-800 font-extrabold">{ambulance.vehicleType || 'Standard Ambulance'}</span></div>
                    <div>Vehicle ID: <span className="text-slate-800 font-extrabold">{ambulance.vehicleNumber || 'Pending Fleet registration'}</span></div>
                  </div>
                </div>
              )}

              {/* Stay / Duration Timestamps */}
              <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100 space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><FaClock /> System Timestamp Logs</p>
                <div className="space-y-2 text-xs font-semibold text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Creation Date</span>
                    <span>{displayFormattedDate(caseData.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Allocation Date</span>
                    <span>{displayFormattedDate(caseData.startDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Last System Sync</span>
                    <span>{displayFormattedDate(caseData.updatedAt)}</span>
                  </div>
                </div>
              </div>

              {/* Price summary Breakdown */}
              <div className="p-5 rounded-[2rem] bg-gray-900 text-white space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><FaCreditCard /> Financial Summary</p>
                
                <div className="space-y-2 text-xs font-semibold text-slate-300 border-b border-slate-800 pb-3">
                  <div className="flex justify-between">
                    <span>Base Booking Surcharges</span>
                    <span>₹{billing.baseFee || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Subtotal Charges</span>
                    <span>₹{billing.subtotal || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ambulance/Visit Fees</span>
                    <span>₹{billing.visitCharges || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Clinical Extra Charges</span>
                    <span>₹{billing.extraCharges || 0}</span>
                  </div>
                  <div className="flex justify-between text-rose-400">
                    <span>Special Discount Offset</span>
                    <span>- ₹{billing.discountAmount || 0}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-1">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Grand Total</span>
                  <span className="text-2xl font-black text-[#08B36A]">₹{caseData.totalAmount || 0}</span>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end shrink-0">
          <button onClick={onClose} className="px-10 py-3 rounded-2xl bg-slate-200 hover:bg-slate-300 text-slate-600 font-black text-xs uppercase tracking-widest transition-all">
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

export default CaseDetailModal;