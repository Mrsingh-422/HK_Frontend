"use client";

import React from 'react';
import { 
  FaTimes, FaBan, FaTimesCircle, FaUser, FaBed, FaMoneyBillWave, 
  FaShieldAlt, FaUserMd, FaCalendarAlt, FaProcedures, FaAmbulance, 
  FaConciergeBell, FaLungs, FaPhoneAlt
} from 'react-icons/fa';
import { InfoSection, InfoItem, SpinnerIcon } from './InfoSection';

// Pre-configured drop locations with surcharges
export const DROP_LOCATIONS = [
  { id: 'loc1', name: "Patient's Registered Residence", surcharge: 0 },
  { id: 'loc2', name: "Domestic Airport Terminal", surcharge: 800 },
  { id: 'loc3', name: "Central Railway Junction", surcharge: 400 },
  { id: 'loc4', name: "Suburban Medical Clinic Hub", surcharge: 500 },
  { id: 'loc5', name: "Inter-State Specialty Trauma Center", surcharge: 1500 },
  { id: 'custom', name: "Custom Destination Address", surcharge: 1000 },
];

const displayDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-IN', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

const getStatusColor = (status) => {
  const statusLower = (status || '').toLowerCase();
  if (statusLower === 'confirmed' || statusLower === 'in-progress' || statusLower === 'active' || statusLower === 'stable') {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  }
  if (statusLower === 'hospital-pending' || statusLower === 'recovering') {
    return 'bg-amber-50 text-amber-700 border-amber-200';
  }
  if (statusLower.startsWith('cancelled') || statusLower.startsWith('rejected') || statusLower === 'critical') {
    return 'bg-rose-50 text-rose-700 border-rose-200';
  }
  return 'bg-slate-50 text-slate-700 border-slate-200';
};

const formatDoctorName = (name) => {
  if (!name) return 'Doctor';
  return name.trim().startsWith('Dr.') ? name : `Dr. ${name}`;
};

const AdmissionDetailsModal = ({
  admission,
  onClose,
  activeAction,
  setActiveAction,
  // Physician props
  doctorList = [],
  selectedDoctorId,
  setSelectedDoctorId,
  currentDocName,
  reassignReason,
  setReassignReason,
  availableReplacementDoctors = [],
  handleAssignDoctor,
  handleReassignDoctor,
  startAssignDoctorFlow,
  startReassignDoctorFlow,
  // Ambulance props
  ambulanceFlow = { step: 1 },
  setAmbulanceFlow,
  driverList = [],
  handleSelectAmbulance,
  handleSelectDropLocation,
  handleDispatchAmbulance,
  startAssignDriverFlow,
  // Bed Transfer & Rejection props
  startBedTransferFlow,
  startRejectFlow,
  rejectionReason,
  setRejectionReason,
  handleRejectAdmission,
  isProcessing
}) => {
  if (!admission) return null;

  // Normalized Field Accessors
  const patient = admission.patient || admission.patientDetails || admission.patients?.[0] || {};
  const bed = admission.bed || admission.bedDetails || admission.bedId || {};
  const doctor = admission.doctor || admission.assignedDoctor || admission.doctorId || null;
  const ambulance = admission.ambulance || null;
  const specialServices = Array.isArray(admission.specialServices) ? admission.specialServices : [];

  const billing = admission.billing || admission.pricingBreakdown || {};
  const insurance = admission.insurance || admission.insuranceDetails || {};
  const bookedBy = admission.bookedBy || admission.userId || {};
  const clinical = admission.clinicalSummary || {};

  const statusLower = (admission.status || '').toLowerCase();
  const isPending = statusLower === 'hospital-pending';
  const isCancelled = statusLower.startsWith('cancelled') || statusLower.startsWith('rejected');
  const cancelReason = admission.cancellationDetails?.reason || admission.cancellationReason || admission.rejectReason || admission.rescheduleReason;

  const bedNumber = bed.bedNumber || (typeof bed === 'string' ? bed : null);
  const paymentStatus = admission.paymentStatus || billing.paymentStatus || 'Pending';
  const paymentMethod = admission.paymentMethod || billing.paymentMethod || 'Online';
  const totalAmount = admission.totalAmount !== undefined ? admission.totalAmount : (billing.totalAmount || 0);

  const stayDays = admission.stayDurationDays || admission.stayDuration || 1;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 md:p-6 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-6xl max-h-[92vh] rounded-[2rem] shadow-2xl relative flex flex-col overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
        
        {/* Modal Top Header Bar */}
        <div className="sticky top-0 bg-slate-950 px-6 py-4 flex justify-between items-center text-white z-10 shrink-0 border-b border-slate-800">
          <div>
            <h2 className="text-base md:text-lg font-black tracking-tight flex items-center gap-2 uppercase">
              Admission Record Dossier
              {admission.triageLevel === 'Emergency' && (
                <span className="bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded border border-red-600 uppercase tracking-widest ml-2">
                  Emergency
                </span>
              )}
            </h2>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-wide mt-0.5">
              Booking ID: <span className="text-[#08B36A]">#{admission.bookingId}</span>
              <span className="ml-3 text-slate-500">Type: <span className="text-slate-300">{admission.bookingType || 'Inpatient Admission'}</span></span>
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-white hover:bg-slate-800 w-9 h-9 flex items-center justify-center rounded-xl transition-all cursor-pointer"
          >
            <FaTimes size={16} />
          </button>
        </div>

        {/* Modal Main Body */}
        <div className="p-6 overflow-y-auto flex-grow grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-50/50">
           
           {/* LEFT COLUMN: UNIFIED DOSSIER VIEW */}
           <div className="lg:col-span-7 space-y-5 overflow-y-auto max-h-[72vh] pr-2 scrollbar-thin">
              
              {/* Header Status Bar */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap sm:flex-nowrap gap-3">
                <div className={`flex-1 p-3 rounded-xl border flex flex-col items-center justify-center text-center ${getStatusColor(admission.status)}`}>
                   <span className="text-[8px] font-bold uppercase tracking-wider opacity-75">Admission Status</span>
                   <span className="text-xs font-black mt-0.5 uppercase">{admission.status}</span>
                </div>
                <div className="flex-1 p-3 rounded-xl bg-[#08B36A]/10 text-[#08B36A] border border-[#08B36A]/20 flex flex-col items-center justify-center text-center">
                   <span className="text-[8px] font-bold uppercase tracking-wider opacity-75">Assigned Bed</span>
                   {bedNumber ? (
                      <span className="text-xs font-black mt-0.5">Bed {bedNumber}</span>
                   ) : (
                      <span className="text-xs font-black mt-0.5 text-slate-400 italic">Unassigned</span>
                   )}
                </div>
                <div className="flex-1 p-3 rounded-xl bg-indigo-50/60 text-indigo-700 border border-indigo-100 flex flex-col items-center justify-center text-center">
                   <span className="text-[8px] font-bold uppercase tracking-wider opacity-75">Ward Unit</span>
                   <span className="text-xs font-black mt-0.5">{bed.wardName || admission.bedBookingType || 'Standard Ward'}</span>
                </div>
              </div>

              {/* 1. Patient Details */}
              <InfoSection title="👤 Patient Details">
                <InfoItem label="Patient Name" value={patient.name || patient.patientName || "N/A"} />
                <InfoItem label="Age" value={patient.age ? `${patient.age} Years` : (patient.patientAge ? `${patient.patientAge} Years` : "N/A")} />
                <InfoItem label="Gender" value={patient.gender || "N/A"} />
                <InfoItem label="Relation with User" value={patient.relation || "Self"} />
                <InfoItem label="Blood Group" value={patient.bloodGroup || clinical.bloodGroup || "N/A"} />
                <InfoItem label="Contact Phone" value={patient.phone || bookedBy.phone || "N/A"} />
                <InfoItem label="Admission Reason" value={admission.bookingReason || patient.reasonForVisit || "Hospital Inpatient Stay"} />

                {clinical.diagnosis && (
                  <div className="col-span-full bg-slate-50/70 p-3.5 border border-slate-100 rounded-xl space-y-1 mt-1">
                    <span className="text-[9px] text-slate-400 font-extrabold uppercase">Dynamic Clinical Diagnosis</span>
                    <p className="text-xs font-black text-[#08B36A]">{clinical.diagnosis}</p>
                  </div>
                )}
              </InfoSection>

              {/* 2. Ambulance Transport Details (If present) */}
              {ambulance && (
                <div className="bg-blue-50/60 border border-blue-200 rounded-2xl p-4 space-y-2.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-blue-900 tracking-wider flex items-center gap-1.5">
                      <FaAmbulance className="text-blue-600" /> Ambulance Transit Record
                    </span>
                    <span className="text-[9px] font-black uppercase bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full">
                      {ambulance.vehicleType || "Ambulance Arrival"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs bg-white/80 p-3 rounded-xl border border-blue-100">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Vehicle Model</p>
                      <p className="font-black text-slate-900">{ambulance.name || "Emergency ALS Unit"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">License Plate</p>
                      <p className="font-mono font-bold text-blue-800">{ambulance.vehicleNumber || "N/A"}</p>
                    </div>
                    {ambulance.phone && (
                      <div className="col-span-full flex items-center gap-1.5 pt-1 text-[11px] font-bold text-slate-700">
                        <FaPhoneAlt className="text-blue-600 text-xs" />
                        <span>Driver Helpline: {ambulance.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 3. Bed & Ward Details */}
              <InfoSection title="🛏️ Bed & Ward Accommodation">
                 <InfoItem label="Allotted Bed" value={bedNumber ? `Bed ${bedNumber}` : "Unassigned"} />
                 <InfoItem label="Ventilator Attached" value={bed.isVentilatorAvailable ? "Yes (Attached)" : "Standard Bed"} />
                 <InfoItem label="Ward Name" value={bed.wardName || admission.wardName || "N/A"} />
                 <InfoItem label="Ward Category" value={bed.wardType || "Standard"} />
                 <InfoItem label="Rate Per Day" value={bed.pricePerDay ? `₹${bed.pricePerDay}` : "N/A"} />
                 <InfoItem label="Reserved Stay" value={`${stayDays} Day${stayDays > 1 ? 's' : ''}`} />
                 <InfoItem label="Check-In Date" value={displayDate(admission.startDate)} />
                 <InfoItem label="Check-Out Date" value={displayDate(admission.endDate)} />
              </InfoSection>

              {/* 4. Special Services & Facilities */}
              {specialServices.length > 0 && (
                <div className="bg-purple-50/50 border border-purple-200 rounded-2xl p-4 space-y-2.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-purple-900 tracking-wider flex items-center gap-1.5">
                      <FaConciergeBell className="text-purple-600" /> Special Add-on Amenities ({specialServices.length})
                    </span>
                    <span className="text-xs font-black text-purple-900">
                      Total: ₹{admission.totalSpecialServicesCharges || specialServices.reduce((a, b) => a + (Number(b.price) || 0), 0)}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {specialServices.map((srv, idx) => (
                      <div key={srv.serviceId || idx} className="bg-white p-3 rounded-xl border border-purple-100 flex items-center justify-between gap-3 text-xs">
                        <div>
                          <p className="font-black text-slate-800">{srv.serviceName}</p>
                          {srv.description && (
                            <p className="text-[10px] text-slate-400 font-medium line-clamp-1">{srv.description}</p>
                          )}
                        </div>
                        <span className="font-extrabold text-[#08B36A] shrink-0">₹{srv.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. Assigned Attending Doctor */}
              <InfoSection title="🧑‍⚕️ Assigned Attending Doctor">
                 <InfoItem label="Physician" value={admission.doctorDisplayName || (doctor?.name ? formatDoctorName(doctor.name) : "Unassigned")} />
                 <InfoItem label="Speciality" value={doctor?.speciality || "General Medicine"} />
                 <InfoItem label="Department / Room" value={doctor?.department || "Inpatient Ward"} />
                 <InfoItem label="Qualifications" value={doctor?.qualification || "MBBS, MD"} />
              </InfoSection>

              {/* 6. Financial Ledger & Billing */}
              <InfoSection title="💰 Financial Ledger & Invoicing">
                 <InfoItem label="Payment Method" value={paymentMethod} />
                 <InfoItem label="Payment Status" value={paymentStatus} />
                 <InfoItem label="Transaction ID" value={billing.transactionId || admission._id} />
                 <InfoItem label="Created Timestamp" value={displayDate(admission.createdAt)} />

                 {/* Insurance Block if present */}
                 {insurance.hasInsurance && (
                   <div className="col-span-full bg-blue-50/50 p-3.5 border border-blue-100 rounded-xl space-y-1">
                      <span className="text-[9px] text-blue-700 font-black uppercase tracking-wider block">🛡️ TPA / Mediclaim Insurance Details</span>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                         <p><span className="text-slate-400 text-[10px]">Company:</span> <strong className="text-slate-800">{insurance.companyName || "N/A"}</strong></p>
                         <p><span className="text-slate-400 text-[10px]">Policy Number:</span> <strong className="text-slate-800">{insurance.insuranceNumber || "N/A"}</strong></p>
                      </div>
                   </div>
                 )}
                 
                 <div className="col-span-full bg-[#08B36A]/5 p-3.5 rounded-xl border border-[#08B36A]/20 flex justify-between items-center text-xs mt-1">
                    <div>
                       <span className="font-black text-slate-700 uppercase block">Total Net Invoiced</span>
                       <span className={`text-[9px] font-black uppercase ${paymentStatus === 'Paid' ? 'text-[#08B36A]' : 'text-amber-600'}`}>
                          Payment Status: {paymentStatus}
                       </span>
                    </div>
                    <span className="text-xl font-black text-[#08B36A]">₹{totalAmount}</span>
                 </div>
              </InfoSection>

           </div>

           {/* RIGHT COLUMN: ADMINISTRATIVE ACTION DESK */}
           <div className="lg:col-span-5 bg-white p-5 md:p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between min-h-[400px]">
              
              {isCancelled ? (
                 <div className="flex-grow flex flex-col justify-center items-center text-center py-12">
                   <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center text-2xl mb-4">
                     <FaBan />
                   </div>
                   <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">Admission Terminated</h3>
                   <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">No further staff actions permitted.</p>
                   
                   <div className="mt-6 w-full bg-rose-50/60 border border-rose-100 p-4 rounded-2xl text-left">
                      <span className="block text-[9px] font-black text-rose-500 uppercase tracking-widest mb-1">Termination / Rejection Reason</span>
                      <p className="text-xs text-rose-800 font-bold leading-relaxed italic">
                        "{cancelReason || 'No specific cancellation context was supplied by administrative staff.'}"
                      </p>
                   </div>
                 </div>
              ) : activeAction === null ? (
                 <div className="space-y-5 flex-grow flex flex-col justify-between">
                    <div>
                       <h3 className="text-base font-black text-slate-800 uppercase tracking-tight mb-0.5">Administrative Action Desk</h3>
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Execute doctor assignment, patient transfer, or ambulance dispatch.</p>
                    </div>

                    <div className="grid grid-cols-1 gap-3 my-auto py-2">
                       {/* Physician Assignment */}
                       {(!doctor || isPending) ? (
                          <button onClick={startAssignDoctorFlow} className="p-4 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-100 flex items-center gap-4 transition-all hover:scale-[1.01] text-left shadow-xs cursor-pointer">
                             <span className="text-xl bg-white p-2 rounded-lg shadow-xs">👨‍⚕️</span>
                             <div>
                                <h4 className="font-black text-xs uppercase">Assign Primary Physician</h4>
                                <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Doctor Scheduling &amp; Authorization</p>
                             </div>
                          </button>
                       ) : (
                          <button onClick={startReassignDoctorFlow} className="p-4 bg-amber-50/40 hover:bg-amber-50 text-amber-800 rounded-xl border border-amber-100 flex items-center gap-4 transition-all hover:scale-[1.01] text-left shadow-xs cursor-pointer">
                             <span className="text-xl bg-white p-2 rounded-lg shadow-xs">🔄</span>
                             <div>
                                <h4 className="font-black text-xs uppercase">Reassign Primary Physician</h4>
                                <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Transfer Physician Case Responsibility</p>
                             </div>
                          </button>
                       )}

                       {/* Transport Dispatch */}
                       <button onClick={startAssignDriverFlow} className="p-4 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-100 flex items-center gap-4 transition-all hover:scale-[1.01] text-left shadow-xs cursor-pointer">
                          <span className="text-xl bg-white p-2 rounded-lg shadow-xs">🚑</span>
                          <div>
                             <h4 className="font-black text-xs uppercase">Dispatch Ambulance Unit</h4>
                             <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Fleet &amp; Transport Logistics</p>
                          </div>
                       </button>

                       {/* Bed Transfer */}
                       {(bed.bedId || bed._id || admission.bedId) && (
                          <button onClick={startBedTransferFlow} className="p-4 bg-emerald-50/60 hover:bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 flex items-center gap-4 transition-all hover:scale-[1.01] text-left shadow-xs cursor-pointer">
                             <span className="text-xl bg-white p-2 rounded-lg shadow-xs">🔄🛏️</span>
                             <div>
                                <h4 className="font-black text-xs uppercase">Transfer Patient Bed</h4>
                                <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Shift Ward Location or Bed Unit</p>
                             </div>
                          </button>
                       )}

                       {/* Reject Admission */}
                       {isPending && (
                          <button onClick={startRejectFlow} className="p-4 bg-rose-50/50 hover:bg-rose-50 text-rose-800 rounded-xl border border-rose-100 flex items-center gap-4 transition-all hover:scale-[1.01] text-left shadow-xs cursor-pointer">
                             <span className="text-xl bg-white p-2 rounded-lg shadow-xs">🚫</span>
                             <div>
                                <h4 className="font-black text-xs uppercase">Reject Admission Request</h4>
                                <p className="text-[9px] text-rose-400 font-bold uppercase mt-0.5">Decline Authorization Request</p>
                             </div>
                          </button>
                       )}
                    </div>

                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Managed Hospital Panel Admission Desk</p>
                 </div>
              ) : activeAction === 'doctor' ? (
                 /* FORM ACTION: ASSIGN DOCTOR */
                 <div className="space-y-5 flex-grow flex-col justify-between flex">
                    <div>
                       <div className="flex items-center justify-between border-b pb-3">
                          <div>
                             <h3 className="text-xs font-black text-slate-800 uppercase tracking-tight">Physician Directory</h3>
                             <p className="text-[10px] text-slate-400 font-bold mt-0.5">Select an approved hospital doctor for this admission</p>
                          </div>
                          <button onClick={() => setActiveAction(null)} className="text-[10px] font-bold text-slate-400 hover:text-slate-600 cursor-pointer">&larr; Back</button>
                       </div>
                       <div className="grid grid-cols-1 gap-2 mt-3 max-h-[260px] overflow-y-auto pr-1">
                          {doctorList.length === 0 ? (
                             <p className="text-center py-6 text-slate-400 text-xs font-bold uppercase">No active doctors located</p>
                          ) : (
                             doctorList.map(doc => {
                                const isSelected = selectedDoctorId === doc._id;
                                return (
                                   <div 
                                      key={doc._id}
                                      onClick={() => setSelectedDoctorId(doc._id)}
                                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between
                                         ${isSelected ? 'bg-[#08B36A] border-[#08B36A] text-white shadow-md' : 'bg-slate-50 border-slate-100 hover:border-slate-300'}`}
                                   >
                                      <div>
                                         <h4 className="font-black text-xs uppercase">{formatDoctorName(doc.name)}</h4>
                                         <p className={`text-[9px] font-bold uppercase tracking-wider mt-0.5 ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>
                                            {doc.speciality || 'General Medicine'} {doc.department ? `• ${doc.department}` : ''}
                                         </p>
                                         {doc.qualification && (
                                            <p className={`text-[8px] font-semibold mt-0.5 ${isSelected ? 'text-white/70' : 'text-slate-400'}`}>
                                               {doc.qualification}
                                            </p>
                                         )}
                                      </div>
                                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'bg-white border-white' : 'border-slate-300'}`}>
                                         {isSelected && <div className="w-1.5 h-1.5 bg-[#08B36A] rounded-full"></div>}
                                      </div>
                                   </div>
                                );
                             })
                          )}
                       </div>
                    </div>

                    <div className="pt-3 border-t">
                       <button 
                          onClick={handleAssignDoctor}
                          disabled={isProcessing || !selectedDoctorId} 
                          className="w-full bg-[#08B36A] hover:bg-[#079e5e] disabled:bg-slate-100 disabled:text-slate-400 text-white font-black py-3 rounded-xl transition-all uppercase text-[10px] tracking-[0.2em] flex justify-center items-center gap-2 shadow-xs cursor-pointer"
                       >
                          {isProcessing ? <SpinnerIcon className="w-4 h-4 animate-spin" /> : 'Authorize Physician Assignment'}
                       </button>
                    </div>
                 </div>
              ) : activeAction === 'reassign-doctor' ? (
                 /* FORM ACTION: REASSIGN DOCTOR */
                 <div className="space-y-5 flex-grow flex flex-col justify-between">
                    <div>
                       <div className="flex items-center justify-between border-b pb-3">
                          <h3 className="text-xs font-black text-slate-800 uppercase tracking-tight">Reassign Physician</h3>
                          <button onClick={() => setActiveAction(null)} className="text-[10px] font-bold text-slate-400 hover:text-slate-600 cursor-pointer">&larr; Back</button>
                       </div>

                       <div className="mt-3 space-y-3">
                          <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl flex items-center justify-between text-xs font-bold text-amber-800">
                             <span>Present Doctor:</span>
                             <span className="font-black">{currentDocName}</span>
                          </div>

                          <div>
                             <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Reason for Reassignment</label>
                             <input 
                                type="text" 
                                placeholder="e.g. Scheduled shift rotation completed" 
                                value={reassignReason}
                                onChange={(e) => setReassignReason(e.target.value)}
                                className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#08B36A] font-semibold bg-slate-50"
                             />
                          </div>
                       </div>

                       <div className="grid grid-cols-1 gap-2 mt-3 max-h-[180px] overflow-y-auto pr-1">
                          {availableReplacementDoctors.length === 0 ? (
                             <p className="text-center py-6 text-slate-400 text-xs font-bold uppercase">No alternative doctors available</p>
                          ) : (
                             availableReplacementDoctors.map(doc => {
                                const isSelected = selectedDoctorId === doc._id;
                                return (
                                   <div 
                                      key={doc._id}
                                      onClick={() => setSelectedDoctorId(doc._id)}
                                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between
                                         ${isSelected ? 'bg-[#08B36A] border-[#08B36A] text-white shadow-md' : 'bg-slate-50 border-slate-100 hover:border-slate-300'}`}
                                   >
                                      <div>
                                         <h4 className="font-black text-xs uppercase">{formatDoctorName(doc.name)}</h4>
                                         <p className={`text-[9px] font-bold uppercase tracking-wider mt-0.5 ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>
                                            {doc.speciality || 'General Medicine'}
                                         </p>
                                      </div>
                                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'bg-white border-white' : 'border-slate-300'}`}>
                                         {isSelected && <div className="w-1.5 h-1.5 bg-[#08B36A] rounded-full"></div>}
                                      </div>
                                   </div>
                                );
                             })
                          )}
                       </div>
                    </div>

                    <div className="pt-3 border-t">
                       <button 
                          onClick={handleReassignDoctor}
                          disabled={isProcessing || !selectedDoctorId} 
                          className="w-full bg-[#08B36A] hover:bg-[#079e5e] disabled:bg-slate-100 disabled:text-slate-400 text-white font-black py-3 rounded-xl transition-all uppercase text-[10px] tracking-[0.2em] flex justify-center items-center gap-2 cursor-pointer"
                       >
                          {isProcessing ? <SpinnerIcon className="w-4 h-4 animate-spin" /> : 'Confirm Care Transfer'}
                       </button>
                    </div>
                 </div>
              ) : activeAction === 'ambulance' ? (
                 /* FORM ACTION: AMBULANCE DISPATCH */
                 <div className="space-y-5 flex-grow flex flex-col justify-between">
                    <div>
                       <div className="flex items-center justify-between border-b pb-3">
                          <h3 className="text-xs font-black text-slate-800 uppercase tracking-tight">
                             {ambulanceFlow.step === 1 ? "Step 1: Fleet Selection" : "Step 2: Drop & Pricing"}
                          </h3>
                          <button onClick={() => setActiveAction(null)} className="text-[10px] font-bold text-slate-400 hover:text-slate-600 cursor-pointer">&larr; Back</button>
                       </div>

                       {ambulanceFlow.step === 1 ? (
                          <div className="grid grid-cols-1 gap-2 mt-3 max-h-[240px] overflow-y-auto pr-1">
                             {driverList.length === 0 ? (
                                <p className="text-center py-6 text-slate-400 text-xs font-bold uppercase">No dispatchers available</p>
                             ) : (
                                driverList.map(driver => {
                                   const ambulanceName = driver.ambulanceId?.name || driver.vehicleName || driver.ambulanceName || "Emergency ICU Ambulance";
                                   const driverName = driver.name || "On-Duty Driver";
                                   const isSelected = ambulanceFlow.selectedDriver?._id === driver._id;

                                   return (
                                      <div 
                                         key={driver._id}
                                         onClick={() => handleSelectAmbulance(driver)}
                                         className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between
                                            ${isSelected ? 'bg-[#08B36A] border-[#08B36A] text-white shadow-md' : 'bg-slate-50 border-slate-100 hover:border-slate-300'}`}
                                      >
                                         <div>
                                            <h4 className="font-black text-xs uppercase">{driverName}</h4>
                                            <p className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>
                                               Vehicle: {ambulanceName}
                                            </p>
                                         </div>
                                         <div className="text-right">
                                            <span className="block text-[8px] font-bold uppercase tracking-wider opacity-75">Base Rate</span>
                                            <span className="text-xs font-black">₹{driver.ambulanceId?.price || driver.price || driver.charge || 1500}</span>
                                         </div>
                                      </div>
                                   );
                                })
                             )}
                          </div>
                       ) : (
                          <div className="mt-3 space-y-3 animate-in fade-in duration-150">
                             <button 
                                onClick={() => setAmbulanceFlow(prev => ({ ...prev, step: 1 }))}
                                className="text-[10px] font-black uppercase text-slate-400 hover:text-[#08B36A] flex items-center gap-1 cursor-pointer"
                             >
                                &larr; Back to Fleet
                             </button>

                             <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60 text-xs flex justify-between items-center">
                                <span className="font-extrabold text-slate-800">{ambulanceFlow.selectedDriver?.name || "On-Duty Driver"}</span>
                                <span className="text-[10px] font-bold text-slate-500">{ambulanceFlow.selectedDriver?.ambulanceId?.name || "Emergency Vehicle"}</span>
                             </div>

                             <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Select Drop Destination</label>
                                <div className="grid grid-cols-1 gap-1.5 max-h-[140px] overflow-y-auto pr-1">
                                   {DROP_LOCATIONS.map(loc => {
                                      const isLocSelected = ambulanceFlow.selectedLocation?.id === loc.id;
                                      return (
                                         <div
                                            key={loc.id}
                                            onClick={() => handleSelectDropLocation(loc)}
                                            className={`p-2.5 rounded-xl border cursor-pointer text-xs flex justify-between items-center transition-all ${
                                               isLocSelected 
                                                  ? 'bg-[#08B36A]/10 border-[#08B36A] text-[#08B36A]' 
                                                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                                            }`}
                                         >
                                            <span className="font-bold">{loc.name}</span>
                                            {loc.surcharge > 0 ? (
                                               <span className="font-extrabold text-[9px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">+₹{loc.surcharge}</span>
                                            ) : (
                                               <span className="text-[9px] text-emerald-600 font-bold uppercase">Free Zone</span>
                                            )}
                                         </div>
                                      );
                                   })}
                                </div>
                             </div>

                             {ambulanceFlow.selectedLocation?.id === 'custom' && (
                                <div>
                                   <label className="block text-[10px] font-black text-[#08B36A] uppercase tracking-wider mb-1">Enter Custom Address</label>
                                   <input 
                                      type="text" 
                                      required 
                                      placeholder="e.g. Sector 4, Block C, Green Park, New Delhi" 
                                      value={ambulanceFlow.customLocationText || ''}
                                      onChange={(e) => setAmbulanceFlow(prev => ({ ...prev, customLocationText: e.target.value }))}
                                      className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#08B36A] font-semibold bg-slate-50"
                                   />
                                </div>
                             )}

                             {ambulanceFlow.selectedLocation && (
                                <div className="p-3 bg-slate-900 text-white rounded-xl space-y-1.5 text-xs">
                                   <div className="flex justify-between text-slate-400 text-[10px]">
                                      <span>Base Rate: ₹{ambulanceFlow.selectedDriver?.ambulanceId?.price || ambulanceFlow.selectedDriver?.price || ambulanceFlow.selectedDriver?.charge || 1500}</span>
                                      <span>Surge: ₹{ambulanceFlow.selectedLocation.surcharge}</span>
                                   </div>
                                   <div className="flex justify-between font-black border-t border-slate-800 pt-1 text-[#08B36A]">
                                      <span className="uppercase text-[10px]">Total Price:</span>
                                      <span>₹{(ambulanceFlow.selectedDriver?.ambulanceId?.price || ambulanceFlow.selectedDriver?.price || ambulanceFlow.selectedDriver?.charge || 1500) + ambulanceFlow.selectedLocation.surcharge}</span>
                                   </div>
                                </div>
                             )}
                          </div>
                       )}
                    </div>

                    {ambulanceFlow.step === 2 && (
                       <div className="pt-3 border-t">
                          <button 
                             onClick={handleDispatchAmbulance}
                             disabled={isProcessing || !ambulanceFlow.selectedLocation || (ambulanceFlow.selectedLocation.id === 'custom' && !ambulanceFlow.customLocationText?.trim())} 
                             className="w-full bg-[#08B36A] hover:bg-[#079e5e] disabled:bg-slate-100 disabled:text-slate-400 text-white font-black py-3 rounded-xl transition-all uppercase text-[10px] tracking-[0.2em] flex justify-center items-center gap-2 cursor-pointer shadow-xs"
                          >
                             {isProcessing ? <SpinnerIcon className="w-4 h-4 animate-spin" /> : 'Dispatch Ambulance'}
                          </button>
                       </div>
                    )}
                 </div>
              ) : (
                 /* FORM ACTION: REJECT REQUEST */
                 <div className="space-y-5 flex-grow flex flex-col justify-between">
                    <form onSubmit={handleRejectAdmission} className="space-y-5 flex-grow flex flex-col justify-between">
                       <div>
                          <div className="flex items-center justify-between border-b pb-3">
                             <h3 className="text-xs font-black text-rose-600 uppercase tracking-tight flex items-center gap-1.5">
                                <FaTimesCircle /> Reject Request
                             </h3>
                             <button type="button" onClick={() => setActiveAction(null)} className="text-[10px] font-bold text-slate-400 hover:text-slate-600 cursor-pointer">&larr; Cancel</button>
                          </div>

                          <div className="mt-3 bg-rose-50 border border-rose-100 p-3 rounded-xl">
                             <p className="text-xs text-rose-800 font-bold leading-relaxed">
                                Declining this request releases reserved resources. Please supply an administrative note.
                             </p>
                          </div>

                          <div className="mt-3">
                             <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Rejection Reason</label>
                             <textarea
                                required
                                rows={4}
                                placeholder="e.g. Ward bed capacity exceeded or critical ICU referral needed."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-rose-500 font-semibold bg-slate-50 text-slate-800 resize-none"
                             />
                          </div>
                       </div>

                       <div className="pt-3 border-t">
                          <button 
                             type="submit" 
                             disabled={isProcessing || !rejectionReason.trim()} 
                             className="w-full bg-rose-600 hover:bg-rose-700 disabled:bg-slate-100 disabled:text-slate-400 text-white font-black py-3 rounded-xl transition-all uppercase text-[10px] tracking-[0.2em] flex justify-center items-center gap-2 shadow-xs cursor-pointer"
                          >
                             {isProcessing ? <SpinnerIcon className="w-4 h-4 animate-spin" /> : 'Confirm Rejection'}
                          </button>
                       </div>
                    </form>
                 </div>
              )}

           </div>

        </div>

      </div>
    </div>
  );
};

export default AdmissionDetailsModal;