"use client";

import React, { useState, useMemo } from 'react';
import HospitalAPI from '@/app/services/HospitalAPI';
import { 
  FaUser, FaFileMedical, FaClock, FaAmbulance, FaCreditCard, FaDollarSign 
} from 'react-icons/fa';

const CaseDetailModal = ({ caseData, onClose, onStartAllocation }) => {
  const patient = caseData.patients?.[0] || {};
  const ambulance = caseData.ambulanceId || {};
  const billing = caseData.pricingBreakdown || {};
  const clinical = caseData.clinicalSummary || {};
  const user = caseData.userId || {};
  const emergencyPhotos = caseData.emergencyPhotos || {};

  // Local state for doctor reassignment flow
  const [showReassign, setShowReassign] = useState(false);
  const [doctorList, setDoctorList] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [reassignReason, setReassignReason] = useState('');
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Safe image path formatter helper
  const getFormattedImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5002';
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${cleanBaseUrl}${cleanPath}`;
  };

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

  const handleOpenReassign = async () => {
    setShowReassign(true);
    setLoadingDocs(true);
    try {
      const response = await HospitalAPI.getHospitalDoctors();
      if (response?.success) {
        setDoctorList(response.data || []);
      } else {
        alert(response?.message || 'Could not fetch doctors list.');
      }
    } catch (err) {
      console.error(err);
      alert('Error fetching doctors.');
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleReassignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDoctorId) return alert('Please select a doctor!');
    setIsSubmitting(true);
    try {
      const payload = {
        appointmentId: caseData._id,
        newDoctorId: selectedDoctorId,
        reason: reassignReason || 'Reassigned from Emergency Panel'
      };
      const response = await HospitalAPI.reassignDoctor(payload);
      if (response?.success) {
        alert('Doctor reassigned successfully!');
        setShowReassign(false);
        onClose(); // Close the modal to trigger fresh data update on parent
      } else {
        alert('Error: ' + response.message);
      }
    } catch (err) {
      alert('Something went wrong during reassignment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Safe Extraction of Active Doctor ID
  const currentDocId = useMemo(() => {
    if (!caseData?.doctorId) return null;
    return caseData.doctorId._id || caseData.doctorId;
  }, [caseData]);

  // Safe Extraction of Active Doctor Name
  const currentDocName = useMemo(() => {
    if (!caseData?.doctorId) return 'Unassigned';
    if (caseData.doctorId.name) return caseData.doctorId.name;
    // Local look up in state in case doctorId is returned as raw ID string
    const found = doctorList.find(d => d._id === caseData.doctorId);
    return found ? found.name : 'Assigned Doctor';
  }, [caseData, doctorList]);

  // Roster exclusions mapping - the active doctor correctly returns to the pool after handover
  const availableReplacementDoctors = useMemo(() => {
    if (!currentDocId) return doctorList;
    return doctorList.filter((doc) => doc._id !== currentDocId);
  }, [doctorList, currentDocId]);

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
              {caseData.caseReference && (
                <>
                  <span className="mx-2 text-slate-300">|</span>
                  Tracking Ref: <span className="text-emerald-600">{caseData.caseReference}</span>
                </>
              )}
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
              <span className="text-sm font-black text-slate-800 uppercase tracking-wider">{caseData.bedBookingType || 'N/A'}</span>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50/30 border border-emerald-100/50">
              <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Stay Duration</p>
              <span className="text-sm font-black text-slate-800">{caseData.stayDuration || 0} Days</span>
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
                    <span className="text-slate-800 font-extrabold">{patient.patientName || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Age & Gender</span>
                    <span className="text-slate-800 font-extrabold">{patient.patientAge || 'N/A'} Years / {patient.gender || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Relation Status</span>
                    <span className="text-slate-800 font-extrabold uppercase">{patient.relation || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Reason for Visit</span>
                    <span className="text-slate-800 font-extrabold block truncate max-w-[150px]" title={patient.reasonForVisit}>"{patient.reasonForVisit || 'N/A'}"</span>
                  </div>
                </div>
              </div>

              {/* Account Profile Details */}
              {caseData.userId && (
                <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100 space-y-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><FaUser className="text-slate-400" /> Account Registration Details</p>
                  
                  <div className="flex items-start gap-4">
                    {user.profilePic && (
                      <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-200 border border-slate-200 shrink-0">
                        <img 
                          src={getFormattedImageUrl(user.profilePic)} 
                          alt="Account profile" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs font-semibold text-slate-700 flex-grow">
                      <div>Registered Name: <span className="text-slate-900 font-black">{user.name}</span></div>
                      <div>Account Phone: <span className="text-slate-900 font-black">{user.phone}</span></div>
                      <div>Account Gender: <span className="text-slate-900 font-black uppercase">{user.gender || 'N/A'}</span></div>
                      <div>Account Age: <span className="text-slate-900 font-black">{user.age || 'N/A'} Years</span></div>
                      <div className="text-[8px] text-slate-400 uppercase tracking-wider mt-1 col-span-2">Database ID: {user._id}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Emergency Photos & Incident Log */}
              {caseData.emergencyPhotos && (
                <div className="p-5 rounded-3xl bg-rose-50/20 border border-rose-100/50 space-y-4">
                  <p className="text-[10px] font-black text-rose-600 uppercase tracking-wider flex items-center gap-1.5"><FaFileMedical className="text-rose-500" /> Emergency Incident Records</p>
                  
                  {emergencyPhotos.emergencyDescription && (
                    <div className="p-4 rounded-2xl bg-white border border-rose-100 text-xs font-semibold text-slate-700 leading-relaxed">
                      <span className="block text-[8px] font-black text-rose-500 uppercase tracking-widest mb-1.5">Emergency Description Summary</span>
                      "{emergencyPhotos.emergencyDescription}"
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {emergencyPhotos.userIncidentPhoto && (
                      <div className="space-y-1">
                        <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">User Spot Photo</span>
                        <a 
                          href={getFormattedImageUrl(emergencyPhotos.userIncidentPhoto)} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="block rounded-xl border border-slate-200 overflow-hidden bg-white hover:border-rose-300 transition-all group"
                        >
                          <img 
                            src={getFormattedImageUrl(emergencyPhotos.userIncidentPhoto)} 
                            alt="Incident spot" 
                            className="w-full h-24 object-cover group-hover:scale-105 transition-all duration-200"
                          />
                        </a>
                      </div>
                    )}

                    {emergencyPhotos.driverOnSpotPhoto && (
                      <div className="space-y-1">
                        <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">Driver Spot Photo</span>
                        <a 
                          href={getFormattedImageUrl(emergencyPhotos.driverOnSpotPhoto)} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="block rounded-xl border border-slate-200 overflow-hidden bg-white hover:border-rose-300 transition-all group"
                        >
                          <img 
                            src={getFormattedImageUrl(emergencyPhotos.driverOnSpotPhoto)} 
                            alt="Driver spot" 
                            className="w-full h-24 object-cover group-hover:scale-105 transition-all duration-200"
                          />
                        </a>
                      </div>
                    )}

                    {emergencyPhotos.referralCard && (
                      <div className="space-y-1">
                        <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">Referral Card</span>
                        <a 
                          href={getFormattedImageUrl(emergencyPhotos.referralCard)} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="block rounded-xl border border-slate-200 overflow-hidden bg-white hover:border-rose-300 transition-all group"
                        >
                          <img 
                            src={getFormattedImageUrl(emergencyPhotos.referralCard)} 
                            alt="Referral card" 
                            className="w-full h-24 object-cover group-hover:scale-105 transition-all duration-200"
                          />
                        </a>
                      </div>
                    )}
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

              {/* Doctor Reassignment block when clinician is already assigned */}
              {caseData.doctorId && caseData.status !== 'Discharged' && (
                <div className="p-5 rounded-3xl bg-white border border-slate-150 shadow-sm space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Clinical Care Assignment</p>
                  <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
                     <div>
                       <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Assigned Clinician</span>
                       <p className="text-xs font-black text-slate-850">Dr. {currentDocName}</p>
                       <p className="text-[9px] font-bold text-[#08B36A] uppercase tracking-wider mt-0.5">{caseData.doctorId.speciality || 'General Medicine'}</p>
                     </div>
                     {!showReassign && (
                       <button 
                         type="button"
                         onClick={handleOpenReassign}
                         className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-[9px] uppercase tracking-wider rounded-xl transition-all shadow-md shadow-amber-500/10 hover:scale-[1.02] active:scale-95"
                       >
                         🔄 Reassign
                       </button>
                     )}
                  </div>

                  {showReassign && (
                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-4 animate-fadeIn">
                      
                      {/* Explicit Present Doctor Banner */}
                      <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl flex items-center justify-between text-xs font-bold text-amber-800">
                         <span>Present Doctor:</span>
                         <span className="font-black">Dr. {currentDocName}</span>
                      </div>

                      <div className="space-y-1">
                        <p className="text-[9px] font-black text-amber-650 uppercase tracking-widest">Care Handover Protocol</p>
                        <input 
                          type="text" 
                          placeholder="Reason for change (e.g. Shift ended)..." 
                          value={reassignReason}
                          onChange={(e) => setReassignReason(e.target.value)}
                          className="w-full border border-slate-250 rounded-xl p-3 text-xs focus:outline-none focus:border-amber-500 font-semibold bg-slate-50/50"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Select Replacement Physician</label>
                        {loadingDocs ? (
                          <div className="py-8 flex flex-col items-center justify-center gap-2 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Loading active roster...</p>
                          </div>
                        ) : availableReplacementDoctors.length === 0 ? (
                          <p className="text-center py-6 text-slate-400 text-[10px] font-bold uppercase tracking-wider bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            No other clinical staff available
                          </p>
                        ) : (
                          <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
                            {availableReplacementDoctors.map((doc) => (
                              <div 
                                key={doc._id}
                                onClick={() => setSelectedDoctorId(doc._id)}
                                className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between ${
                                  selectedDoctorId === doc._id 
                                    ? 'bg-amber-50 border-amber-500 text-amber-900 shadow-sm' 
                                    : 'bg-white border-slate-100 hover:border-slate-350'
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 ${
                                    selectedDoctorId === doc._id ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-500'
                                  }`}>
                                    {doc.name?.charAt(0) || '?'}
                                  </div>
                                  <div>
                                    <p className="text-xs font-black text-slate-850">Dr. {doc.name}</p>
                                    <p className={`text-[8px] font-bold uppercase ${selectedDoctorId === doc._id ? 'text-amber-700' : 'text-slate-400'}`}>
                                      {doc.speciality || 'General Medicine'}
                                    </p>
                                  </div>
                                </div>
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                  selectedDoctorId === doc._id ? 'border-amber-500 bg-amber-500' : 'border-slate-300'
                                }`}>
                                  {selectedDoctorId === doc._id && (
                                    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2.5 pt-2">
                        <button 
                          type="button"
                          onClick={() => setShowReassign(false)}
                          className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold rounded-xl text-[10px] uppercase tracking-wider transition-all"
                        >
                          Cancel
                        </button>
                        <button 
                          type="button"
                          onClick={handleReassignSubmit}
                          disabled={isSubmitting || !selectedDoctorId}
                          className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:hover:bg-amber-500 text-white font-extrabold rounded-xl text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md shadow-amber-500/10"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Updating...
                            </>
                          ) : (
                            'Confirm Handover'
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Logistics & Ambulance Allocation */}
              {caseData.ambulanceId && (
                <div className="p-5 rounded-3xl bg-blue-50/50 border border-blue-100 space-y-4">
                  <p className="text-[10px] font-black text-blue-500 uppercase tracking-wider flex items-center gap-1.5"><FaAmbulance /> Allocated Dispatcher Fleet</p>
                  <div className="space-y-3 text-xs text-slate-600 font-semibold">
                    <div>Ambulance Crew: <span className="text-slate-800 font-extrabold">{ambulance.name || 'N/A'}</span></div>
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