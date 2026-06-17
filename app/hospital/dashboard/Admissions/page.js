"use client";

import React, { useState, useEffect } from 'react';
import HospitalAPI from '@/app/services/HospitalAPI';
import { 
  FaUser, FaPhoneAlt, FaMapMarkerAlt, FaFileMedical, FaClock,
  FaCalendarAlt, FaMotorcycle, FaCheckCircle, FaExclamationCircle,
  FaCreditCard, FaStethoscope, FaHistory, FaAmbulance, FaGlobe, FaArrowLeft
} from 'react-icons/fa';

// --- SUB-COMPONENT: EMERGENCY TABLE ---
const EmergencyTable = ({ items, onView }) => (
  <div className="bg-white rounded-2xl shadow-xl border border-emerald-100 overflow-hidden">
    <table className="w-full text-left">
      <thead className="bg-emerald-50/50 text-[10px] uppercase font-black text-emerald-800">
        <tr>
          <th className="p-5">Booking / Ambulance</th>
          <th className="p-5">Patient Details</th>
          <th className="p-5">Ward / Bed</th>
          <th className="p-5 text-center">Action</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-emerald-50">
        {items.map((item) => (
          <tr key={item._id} className="hover:bg-emerald-50/20 transition-all group">
            <td className="p-5">
              <p className="text-xs font-black text-emerald-700">#{item.bookingId}</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase">{item.ambulanceId?.vehicleNumber || 'Private Arrival'}</p>
            </td>
            <td className="p-5">
              <p className="text-sm font-black text-gray-800">{item.patients[0]?.patientName}</p>
              <p className="text-[10px] text-gray-500">{item.patients[0]?.gender} • {item.patients[0]?.patientAge}y</p>
            </td>
            <td className="p-5">
              <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-md text-[10px] font-black uppercase">
                {item.wardName || 'Unassigned'} - {item.bedNumber || 'Unassigned'}
              </span>
            </td>
            <td className="p-5 text-center">
              <button onClick={() => onView(item)} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase">View</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// --- SUB-COMPONENT: REFERRAL TABLE ---
const ReferralTable = ({ items }) => (
  <div className="bg-white rounded-2xl shadow-xl border border-emerald-100 overflow-hidden">
    <table className="w-full text-left">
      <thead className="bg-blue-50/50 text-[10px] uppercase font-black text-blue-800">
        <tr>
          <th className="p-5">Transfer ID</th>
          <th className="p-5">From / To</th>
          <th className="p-5">Status</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-blue-50">
        {items.map((ref) => (
          <tr key={ref._id}>
            <td className="p-5">
              <p className="text-xs font-black text-blue-700">{ref.bookingId}</p>
              <p className="text-[9px] text-gray-400">{ref.caseReference}</p>
            </td>
            <td className="p-5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-gray-600">{ref.pickupHospitalId?.name}</span>
                <span className="text-blue-400">➔</span>
                <span className="text-[10px] font-black text-emerald-600">{ref.hospitalId?.name}</span>
              </div>
            </td>
            <td className="p-5">
              <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[9px] font-black uppercase">{ref.status}</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// --- MAIN ADMISSIONS MANAGEMENT COMPONENT ---
const ManageAdmissions = () => {
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals / Control Panel State
  const [selectedAdmission, setSelectedAdmission] = useState(null);
  const [activeAction, setActiveAction] = useState(null); // 'doctor' | 'bed' | 'ambulance' | 'discharge' | null

  // Embedded Form States
  const [driverList, setDriverList] = useState([]);
  const [selectedDriverId, setSelectedDriverId] = useState('');
  
  const [doctorList, setDoctorList] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');

  const [billingItems, setBillingItems] = useState([{ name: 'Medicines', price: '' }]);

  const [bedAssignState, setBedAssignState] = useState({ 
    step: 1, // 1: Select Ward, 2: Select Bed
    wards: [], 
    beds: [], 
    selectedWard: null,
    isLoadingData: false 
  });

  useEffect(() => {
    fetchAdmissions();
  }, []);

  const fetchAdmissions = async () => {
    setLoading(true);
    try {
      const response = await HospitalAPI.getAdmissions();
      if (response?.success) {
        setAdmissions(response.data);
      }
    } catch (error) {
      console.error("Error fetching admissions:", error);
    } finally {
      setLoading(false);
    }
  };

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = admissions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(admissions.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // ---------------------------------------------------------
  // 🛏️ ACTION: ASSIGN BED INLINE FLOW
  // ---------------------------------------------------------
  const startBedAssignFlow = async () => {
    setActiveAction('bed');
    setBedAssignState({ step: 1, wards: [], beds: [], selectedWard: null, isLoadingData: true });
    try {
      const response = await HospitalAPI.getWardsList(); 
      if (response?.success) {
        setBedAssignState(prev => ({ ...prev, wards: response.data, isLoadingData: false }));
      } else {
        alert(response?.message || 'Could not fetch wards.');
        setActiveAction(null);
      }
    } catch (error) {
      alert('Error fetching wards.');
      setActiveAction(null);
    }
  };

  const handleSelectWard = async (ward) => {
    setBedAssignState(prev => ({ ...prev, step: 2, selectedWard: ward, isLoadingData: true }));
    try {
      const response = await HospitalAPI.getWardBeds(ward._id); 
      if (response?.success) {
        setBedAssignState(prev => ({ ...prev, beds: response.data, isLoadingData: false }));
      } else {
        alert(response?.message || 'Could not fetch beds.');
        setBedAssignState(prev => ({ ...prev, step: 1, isLoadingData: false })); 
      }
    } catch (error) {
      alert('Error fetching beds.');
      setBedAssignState(prev => ({ ...prev, step: 1, isLoadingData: false }));
    }
  };

  const handleSelectBed = async (bed) => {
    if (bed.status !== 'Available') return alert('Please select an Available bed.');
    if (!confirm(`Are you sure you want to admit patient to Bed: ${bed.bedNumber} in ${bedAssignState.selectedWard.name}?`)) return;

    setIsProcessing(true);
    try {
      const payload = { appointmentId: selectedAdmission._id, bedId: bed._id };
      const response = await HospitalAPI.admitPatientToBed(payload);
      if (response?.success) {
        alert(`Success! Patient admitted to Bed ${bed.bedNumber}.`);
        setActiveAction(null);
        setSelectedAdmission(null); 
        fetchAdmissions(); 
      } else {
        alert('Error: ' + response.message);
      }
    } catch (error) {
      alert('Something went wrong while assigning bed!');
    } finally {
      setIsProcessing(false);
    }
  };

  // ---------------------------------------------------------
  // 👨‍⚕️ ACTION: ASSIGN DOCTOR INLINE FLOW
  // ---------------------------------------------------------
  const startAssignDoctorFlow = async () => {
    setIsProcessing(true);
    try {
      const response = await HospitalAPI.getHospitalDoctors();
      if (response?.success) {
        setDoctorList(response.data || []);
        setSelectedDoctorId('');
        setActiveAction('doctor');
      } else {
        alert(response?.message || 'Could not fetch doctors list.');
      }
    } catch (error) { alert('Error fetching doctors.'); } 
    finally { setIsProcessing(false); }
  };

  const handleAssignDoctor = async (e) => {
    e.preventDefault();
    if (!selectedDoctorId) return alert('Please select a doctor!');
    setIsProcessing(true);
    try {
      const payload = { appointmentId: selectedAdmission._id, doctorId: selectedDoctorId };
      const response = await HospitalAPI.assignDoctorToAdmission(payload);
      if (response?.success) {
        alert('Doctor assigned successfully! Admission Approved.');
        setActiveAction(null);
        setSelectedAdmission(null); 
        fetchAdmissions(); 
      } else { alert('Error: ' + response.message); }
    } catch (error) { alert('Something went wrong while assigning doctor!'); } 
    finally { setIsProcessing(false); }
  };

  // ---------------------------------------------------------
  // 🚑 ACTION: ASSIGN DRIVER INLINE FLOW
  // ---------------------------------------------------------
  const startAssignDriverFlow = async () => {
    setIsProcessing(true);
    try {
      const response = await HospitalAPI.getAvailableDrivers();
      if (response?.success) {
        setDriverList(response.data || []);
        setSelectedDriverId('');
        setActiveAction('ambulance');
      } else { alert(response?.message || 'Could not fetch available drivers.'); }
    } catch (error) { alert('Error fetching drivers.'); } 
    finally { setIsProcessing(false); }
  };

  const handleAssignDriver = async (e) => {
    e.preventDefault();
    if (!selectedDriverId) return alert('Please select a driver!');
    setIsProcessing(true);
    try {
      const payload = { caseId: selectedAdmission._id, driverId: selectedDriverId };
      const response = await HospitalAPI.assignDriver(payload);
      if (response?.success) {
        alert('Ambulance driver assigned successfully!');
        setActiveAction(null);
        setSelectedAdmission(null); 
        fetchAdmissions(); 
      } else { alert('Error: ' + response.message); }
    } catch (error) { alert('Something went wrong!'); } 
    finally { setIsProcessing(false); }
  };

  // ---------------------------------------------------------
  // 🧾 ACTION: FINALIZE DISCHARGE INLINE FLOW
  // ---------------------------------------------------------
  const startDischargeFlow = () => {
    setBillingItems([{ name: 'Medicines', price: '' }]);
    setActiveAction('discharge');
  };

  const handleDischargeSubmit = async (e) => {
    e.preventDefault();
    const validItems = billingItems
      .filter(item => item.name.trim() !== '' && item.price !== '')
      .map(item => ({ name: item.name, price: Number(item.price) }));

    if (!confirm('Are you sure you want to finalize this discharge? Bed will be released.')) return;

    setIsProcessing(true);
    try {
      const payload = { appointmentId: selectedAdmission._id, billingItems: validItems };
      const response = await HospitalAPI.finalizeDischarge(payload);
      if (response?.success) {
        alert(`Discharge Successful! Bill Amount: ₹${response.billAmount || 'N/A'}`);
        setActiveAction(null);
        setSelectedAdmission(null); 
        fetchAdmissions(); 
      } else { alert('Error: ' + response.message); }
    } catch (error) { alert('Failed to process discharge.'); } 
    finally { setIsProcessing(false); }
  };

  const addBillingRow = () => setBillingItems(prev => [...prev, { name: '', price: '' }]);
  const updateBillingRow = (index, field, value) => {
    const newItems = [...billingItems];
    newItems[index][field] = value;
    setBillingItems(newItems);
  };
  const removeBillingRow = (index) => {
    const newItems = billingItems.filter((_, i) => i !== index);
    setBillingItems(newItems);
  };

  // ---------------------------------------------------------
  // UI HELPERS
  // ---------------------------------------------------------
  const displayDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed': return 'bg-[#08B36A]/10 text-[#08B36A] border-[#08B36A]/30';
      case 'Hospital-Pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Discharged': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-[#08B36A]/10 text-[#08B36A] border-[#08B36A]/20';
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-[90rem] mx-auto font-sans min-h-screen relative bg-gray-50/50">
      
      {/* ---------------- HEADER ---------------- */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-800 tracking-tight">Hospital Admissions</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Manage ward allocation, staff assignment, and patient billing.</p>
        </div>
        <div className="mt-4 md:mt-0 bg-[#08B36A]/10 px-5 py-2.5 rounded-xl border border-[#08B36A]/20 flex items-center gap-3">
           <span className="text-2xl">🏥</span>
           <div>
              <p className="text-[10px] font-black text-[#08B36A] uppercase tracking-widest leading-none">In-Patient</p>
              <p className="text-lg font-black text-[#08B36A] leading-none mt-1">{admissions.length}</p>
           </div>
        </div>
      </div>

      {/* ---------------- ADMISSIONS TABLE LISTING ---------------- */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4"><SpinnerIcon className="w-10 h-10 text-[#08B36A] animate-spin" /><p className="text-sm text-gray-500 font-bold">Syncing Records...</p></div>
      ) : admissions.length === 0 ? (
        <div className="text-center bg-white p-16 rounded-3xl shadow-sm border-2 border-dashed border-gray-200">
          <div className="w-20 h-20 bg-[#08B36A]/10 text-[#08B36A] rounded-full flex items-center justify-center text-4xl mb-4 mx-auto shadow-inner">🛏️</div>
          <p className="text-gray-700 text-xl font-black">No Admissions Found</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto scrollbar-hide">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-500 text-[10px] uppercase tracking-[0.15em] font-black">
                    <th className="px-4 py-4">ID</th>
                    <th className="px-4 py-4">Patient Profile</th>
                    <th className="px-4 py-4">Doctor</th>
                    <th className="px-4 py-4">Bill</th>
                    <th className="px-4 py-4">Status</th>
                    <th className="px-4 py-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentItems.map((adm) => {
                    const patient = adm.patients?.[0] || {};
                    const isEmergency = adm.triageLevel === 'Emergency';

                    return (
                      <tr 
                        key={adm._id} 
                        className="hover:bg-[#08B36A]/5 transition-colors duration-200 group cursor-pointer"
                        onClick={() => { setSelectedAdmission(adm); setActiveAction(null); }}
                      >
                        {/* Booking ID */}
                        <td className="px-4 py-3.5">
                          <span className="text-[11px] font-extrabold text-gray-600 bg-gray-50 px-2.5 py-1 rounded border border-gray-200">
                            #{adm.bookingId}
                          </span>
                        </td>

                        {/* Patient Info */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#08B36A]/10 text-[#08B36A] flex items-center justify-center font-black text-xs border border-[#08B36A]/20 shrink-0">
                              {patient.patientName?.charAt(0) || '?'}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <p className="text-xs font-extrabold text-gray-900 leading-none">{patient.patientName || 'Unknown'}</p>
                                {isEmergency && <span className="text-red-500 text-[9px] font-black bg-red-50 px-1.5 py-0.5 rounded border border-red-100 uppercase tracking-wider" title="Emergency">Emergency</span>}
                              </div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mt-1">
                                {patient.gender} &bull; {patient.patientAge}y
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Doctor */}
                        <td className="px-4 py-3.5">
                          {adm.doctorId?.name ? (
                            <p className="text-xs font-bold text-gray-700">Dr. {adm.doctorId.name}</p>
                          ) : (
                            <span className="text-[11px] text-gray-400 italic">Unassigned</span>
                          )}
                        </td>

                        {/* Amount */}
                        <td className="px-4 py-3.5">
                          <p className="text-xs font-extrabold text-gray-800">₹{adm.totalAmount}</p>
                          <p className={`text-[9px] font-black uppercase mt-0.5 ${adm.paymentStatus === 'Paid' ? 'text-[#08B36A]' : 'text-[#08B36A]/60'}`}>
                            {adm.paymentStatus}
                          </p>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5">
                          <span className={`text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-full border ${getStatusColor(adm.status)}`}>
                            {adm.status}
                          </span>
                        </td>

                        {/* Action */}
                        <td className="px-4 py-3.5 text-center">
                          <button className="bg-white border border-gray-200 text-gray-500 group-hover:bg-[#08B36A] group-hover:text-white group-hover:border-[#08B36A] text-[10px] font-black px-3.5 py-1.5 rounded-lg transition-all">
                            Manage
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ---------------- PAGINATION ---------------- */}
          <div className="mt-6 flex flex-col sm:flex-row justify-between items-center bg-white px-5 py-4 rounded-xl border border-gray-100 shadow-sm gap-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Showing <span className="text-[#08B36A]">{indexOfFirstItem + 1}</span> to <span className="text-[#08B36A]">{Math.min(indexOfLastItem, admissions.length)}</span> of <span className="text-[#08B36A]">{admissions.length}</span> records
            </p>
            <div className="flex gap-2">
              <button 
                onClick={(e) => { e.stopPropagation(); paginate(currentPage - 1); }} 
                disabled={currentPage === 1}
                className="px-4 py-2 text-[10px] font-black uppercase tracking-widest border border-gray-200 rounded-lg hover:bg-[#08B36A] hover:text-white disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-gray-400 transition-all text-gray-600"
              >
                Prev
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); paginate(i + 1); }}
                  className={`w-9 h-9 text-[10px] font-black rounded-lg border transition-all ${currentPage === i + 1 ? 'bg-[#08B36A] text-white border-[#08B36A]' : 'bg-white text-gray-600 border-gray-100 hover:border-[#08B36A]'}`}
                >
                  {i + 1}
                </button>
              ))}
              <button 
                onClick={(e) => { e.stopPropagation(); paginate(currentPage + 1); }} 
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-[10px] font-black uppercase tracking-widest border border-gray-200 rounded-lg hover:bg-[#08B36A] hover:text-white disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-gray-400 transition-all text-gray-600"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {/* ---------------------------------------------------------
         UNIFIED MASTER ADMISSION DETAILS WINDOW (SPLIT-SCREEN FLOW)
      --------------------------------------------------------- */}
      {selectedAdmission && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 md:pl-64 bg-gray-900/60 backdrop-blur-md animate-fadeIn">
          <div className="bg-white w-full max-w-6xl max-h-[92vh] rounded-[2.5rem] shadow-2xl relative flex flex-col overflow-hidden">
            
            {/* Unified Modal Header */}
            <div className="sticky top-0 bg-slate-900 px-8 py-5 flex justify-between items-center text-white z-10 shrink-0">
               <div>
                  <h2 className="text-xl font-black tracking-tight flex items-center gap-2 uppercase">
                     Manage Admission Overview
                     {selectedAdmission.triageLevel === 'Emergency' && <span className="bg-red-50 text-white text-[10px] font-black px-2 py-1 rounded border border-red-500/20 uppercase tracking-widest ml-2">Emergency</span>}
                  </h2>
                  <p className="text-slate-400 font-bold text-xs uppercase tracking-wide mt-1">Booking ID: <span className="text-[#08B36A]">#{selectedAdmission.bookingId}</span></p>
               </div>
               <button onClick={() => { setSelectedAdmission(null); setActiveAction(null); }} className="text-white hover:text-red-500 bg-white/10 border border-white/20 w-10 h-10 flex items-center justify-center rounded-full transition-all">
                 <CloseIcon className="w-5 h-5"/>
               </button>
            </div>

            {/* Split Screen Container */}
            <div className="p-8 overflow-y-auto flex-grow grid grid-cols-1 lg:grid-cols-12 gap-8 bg-slate-50/50">
               
               {/* COLUMN 1: PATIENT DOSSIER (lg:col-span-5) */}
               <div className="lg:col-span-5 space-y-6">
                  
                  {/* Status Badging Segment */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Clinical Status & Identification</p>
                     
                     <div className="flex gap-3">
                        <div className={`flex-1 p-3 rounded-2xl border flex flex-col items-center justify-center text-center ${getStatusColor(selectedAdmission.status)}`}>
                           <span className="text-[8px] font-bold uppercase tracking-wider opacity-75">Status</span>
                           <span className="text-sm font-black mt-1">{selectedAdmission.status}</span>
                        </div>
                        <div className="flex-1 p-3 rounded-2xl bg-emerald-600 text-white border border-emerald-600 flex flex-col items-center justify-center text-center">
                           <span className="text-[8px] font-bold uppercase tracking-wider opacity-75">Allocation</span>
                           {selectedAdmission.bedId?.bedNumber ? (
                              <span className="text-sm font-black mt-1">Bed {selectedAdmission.bedId.bedNumber}</span>
                           ) : (
                              <span className="text-xs font-black mt-1 animate-pulse">Unassigned</span>
                           )}
                        </div>
                     </div>
                  </div>

                  <InfoSection title="🧑‍⚕️ Patient Directory">
                     <InfoItem label="Patient Name" value={selectedAdmission.patients[0]?.patientName} />
                     <InfoItem label="Demographics" value={`${selectedAdmission.patients[0]?.patientAge} Yrs • ${selectedAdmission.patients[0]?.gender}`} />
                     <InfoItem label="In-patient Type" value={selectedAdmission.consultationType} />
                  </InfoSection>

                  <InfoSection title="📅 Schedule & Staff">
                     <InfoItem label="Appointment Date" value={displayDate(selectedAdmission.appointmentDate)} />
                     <InfoItem label="Doctor Assignee" value={selectedAdmission.doctorId?.name ? `Dr. ${selectedAdmission.doctorId.name}` : 'Unassigned'} />
                     <InfoItem label="Primary Speciality" value={selectedAdmission.doctorId?.speciality || 'N/A'} />
                  </InfoSection>
               </div>

               {/* COLUMN 2: DYNAMIC ACTION DESK (lg:col-span-7) */}
               <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col min-h-[300px]">
                  
                  {activeAction === null ? (
                     <div className="space-y-6 flex-grow flex flex-col justify-between">
                        <div>
                           <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-2">Admission Action Desk</h3>
                           <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Configure clinical staff, inpatient beds, transport, and final billing options.</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-auto py-4">
                           {/* Doctor assignment action */}
                           {(!selectedAdmission.doctorId || selectedAdmission.status === 'Hospital-Pending') && (
                              <button onClick={startAssignDoctorFlow} className="p-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-2xl border border-emerald-200 flex items-center gap-4 transition-all hover:scale-[1.02] text-left">
                                 <span className="text-2xl">👨‍⚕️</span>
                                 <div>
                                    <h4 className="font-black text-sm uppercase">Assign Physician</h4>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Clinical Authorization</p>
                                 </div>
                              </button>
                           )}

                           {/* Transport Driver Assignment */}
                           {selectedAdmission.status !== 'Discharged' && (
                              <button onClick={startAssignDriverFlow} className="p-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-2xl border border-emerald-200 flex items-center gap-4 transition-all hover:scale-[1.02] text-left">
                                 <span className="text-2xl">🚑</span>
                                 <div>
                                    <h4 className="font-black text-sm uppercase">Assign Transport</h4>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Fleet Dispatcher</p>
                                 </div>
                              </button>
                           )}

                           {/* Discharge Action */}
                           {selectedAdmission.status !== 'Discharged' && (
                              <button onClick={startDischargeFlow} className="p-4 bg-emerald-900 text-white rounded-2xl flex items-center gap-4 transition-all hover:scale-[1.02] text-left shadow-lg shadow-emerald-950/10">
                                 <span className="text-2xl">🧾</span>
                                 <div>
                                    <h4 className="font-black text-sm uppercase">Discharge Invoice</h4>
                                    <p className="text-[10px] text-emerald-300 font-bold uppercase mt-0.5">Finalize Billing</p>
                                 </div>
                              </button>
                           )}
                        </div>

                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Inpatient Control Terminal v2.1</p>
                     </div>
                  ) : activeAction === 'doctor' ? (
                     /* INLINE ACTION: DOCTOR ASSIGNMENT */
                     <div className="space-y-6 flex-grow flex flex-col justify-between">
                        <div>
                           <div className="flex items-center justify-between border-b pb-4">
                              <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">Physician Directory</h3>
                              <button onClick={() => setActiveAction(null)} className="text-xs font-bold text-slate-400 hover:text-slate-600">&larr; Back to Actions</button>
                           </div>
                           <div className="grid grid-cols-1 gap-2.5 mt-4">
                              {doctorList.length === 0 ? (
                                 <p className="text-center py-6 text-slate-400 text-xs font-bold uppercase">No active doctors located</p>
                              ) : (
                                 doctorList.map(doc => (
                                    <div 
                                       key={doc._id}
                                       onClick={() => setSelectedDoctorId(doc._id)}
                                       className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between
                                          ${selectedDoctorId === doc._id ? 'bg-[#08B36A] border-[#08B36A] text-white shadow-md' : 'bg-slate-50 border-slate-100 hover:border-slate-300'}`}
                                    >
                                       <div>
                                          <h4 className="font-black text-xs uppercase">Dr. {doc.name}</h4>
                                          <p className={`text-[9px] font-bold uppercase tracking-wider mt-0.5 ${selectedDoctorId === doc._id ? 'text-white/80' : 'text-slate-400'}`}>{doc.speciality || 'General Medicine'}</p>
                                       </div>
                                       <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedDoctorId === doc._id ? 'bg-white border-white' : 'border-slate-300'}`}>
                                          {selectedDoctorId === doc._id && <div className="w-1.5 h-1.5 bg-[#08B36A] rounded-full"></div>}
                                       </div>
                                    </div>
                                 ))
                              )}
                           </div>
                        </div>

                        <div className="pt-4 border-t">
                           <button 
                              onClick={handleAssignDoctor}
                              disabled={isProcessing || !selectedDoctorId} 
                              className="w-full bg-[#08B36A] hover:bg-[#08B36A]/90 disabled:bg-slate-200 text-white font-black py-4 rounded-xl transition-all uppercase text-[10px] tracking-[0.2em] flex justify-center items-center gap-2"
                           >
                              {isProcessing ? <SpinnerIcon className="w-4 h-4 animate-spin" /> : 'Authorize Assignment'}
                           </button>
                        </div>
                     </div>
                  ) : activeAction === 'bed' ? (
                     /* INLINE ACTION: BED ASSIGNMENT */
                     <div className="space-y-6 flex-grow flex flex-col justify-between">
                        <div>
                           <div className="flex items-center justify-between border-b pb-4">
                              <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">
                                 {bedAssignState.step === 1 ? "Ward Allocation" : `Beds: ${bedAssignState.selectedWard?.name}`}
                              </h3>
                              <button onClick={() => setActiveAction(null)} className="text-xs font-bold text-slate-400 hover:text-slate-600">&larr; Back to Actions</button>
                           </div>

                           <div className="mt-4">
                              {bedAssignState.isLoadingData ? (
                                 <div className="py-12 text-center flex flex-col items-center gap-2">
                                    <SpinnerIcon className="w-6 h-6 text-[#08B36A] animate-spin" />
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mapping system data...</p>
                                 </div>
                              ) : bedAssignState.step === 1 ? (
                                 <div className="grid grid-cols-1 gap-2.5">
                                    {bedAssignState.wards.length === 0 ? (
                                       <p className="text-center py-6 text-slate-400 text-xs font-bold uppercase">No Active Hospital Wards configured</p>
                                    ) : (
                                       bedAssignState.wards.map(ward => (
                                          <div 
                                             key={ward._id}
                                             onClick={() => handleSelectWard(ward)}
                                             className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-[#08B36A] cursor-pointer transition-all flex justify-between items-center group shadow-sm"
                                          >
                                             <div>
                                                <h4 className="font-black text-xs uppercase text-slate-800">{ward.name}</h4>
                                                <p className="text-[9px] font-bold uppercase text-slate-400">Class: {ward.type}</p>
                                             </div>
                                             <span className="text-[#08B36A] font-black text-[10px] uppercase group-hover:translate-x-1 transition-transform">Select &rarr;</span>
                                          </div>
                                       ))
                                    )}
                                 </div>
                              ) : (
                                 <div className="space-y-4">
                                    <button 
                                       onClick={() => setBedAssignState(prev => ({ ...prev, step: 1, selectedWard: null, beds: [] }))}
                                       className="text-[10px] font-black uppercase text-slate-400 hover:text-[#08B36A]"
                                    >
                                       &larr; Return to Wards
                                    </button>
                                    <div className="grid grid-cols-3 gap-2.5">
                                       {bedAssignState.beds.length === 0 ? (
                                          <p className="text-center col-span-3 py-6 text-slate-400 text-xs font-bold uppercase">No active beds mapped</p>
                                       ) : (
                                          bedAssignState.beds.map(bed => {
                                             const isAvailable = bed.status === 'Available';
                                             return (
                                                <div 
                                                   key={bed._id}
                                                   onClick={() => isAvailable && handleSelectBed(bed)}
                                                   className={`p-3 rounded-lg border text-center transition-all flex flex-col items-center justify-center ${isAvailable ? 'bg-slate-50 border-slate-100 hover:border-[#08B36A] cursor-pointer' : 'bg-slate-100 border-slate-100 opacity-50 cursor-not-allowed'}`}
                                                >
                                                   <span className="text-xs font-black text-slate-800">{bed.bedNumber}</span>
                                                   <span className={`text-[8px] font-black uppercase mt-1 px-1.5 py-0.5 rounded ${isAvailable ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                                      {bed.status}
                                                   </span>
                                                </div>
                                             );
                                          })
                                       )}
                                    </div>
                                 </div>
                              )}
                           </div>
                        </div>

                        <div className="pt-4 border-t text-center">
                           <p className="text-[10px] font-bold text-slate-400 uppercase">Interactive bed-grid updates in real time</p>
                        </div>
                     </div>
                  ) : activeAction === 'ambulance' ? (
                     /* INLINE ACTION: AMBULANCE DRIVER ASSIGNMENT */
                     <div className="space-y-6 flex-grow flex flex-col justify-between">
                        <div>
                           <div className="flex items-center justify-between border-b pb-4">
                              <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">Logistics dispatcher</h3>
                              <button onClick={() => setActiveAction(null)} className="text-xs font-bold text-slate-400 hover:text-slate-600">&larr; Back to Actions</button>
                           </div>
                           <div className="grid grid-cols-1 gap-2.5 mt-4">
                              {driverList.length === 0 ? (
                                 <p className="text-center py-6 text-slate-400 text-xs font-bold uppercase">No dispatchers available</p>
                              ) : (
                                 driverList.map(driver => (
                                    <div 
                                       key={driver._id}
                                       onClick={() => setSelectedDriverId(driver._id)}
                                       className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between
                                          ${selectedDriverId === driver._id ? 'bg-[#08B36A] border-[#08B36A] text-white shadow-md' : 'bg-slate-50 border-slate-100 hover:border-slate-300'}`}
                                    >
                                       <div>
                                          <h4 className="font-black text-xs uppercase">{driver.name}</h4>
                                          <p className={`text-[9px] font-bold uppercase tracking-wider mt-0.5 ${selectedDriverId === driver._id ? 'text-white/80' : 'text-slate-400'}`}>Years on Fleet: {driver.experienceYears}</p>
                                       </div>
                                       <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedDriverId === driver._id ? 'bg-white border-white' : 'border-slate-300'}`}>
                                          {selectedDriverId === driver._id && <div className="w-1.5 h-1.5 bg-[#08B36A] rounded-full"></div>}
                                       </div>
                                    </div>
                                 ))
                              )}
                           </div>
                        </div>

                        <div className="pt-4 border-t">
                           <button 
                              onClick={handleAssignDriver}
                              disabled={isProcessing || !selectedDriverId} 
                              className="w-full bg-[#08B36A] hover:bg-[#08B36A]/90 disabled:bg-slate-200 text-white font-black py-4 rounded-xl transition-all uppercase text-[10px] tracking-[0.2em] flex justify-center items-center gap-2"
                           >
                              {isProcessing ? <SpinnerIcon className="w-4 h-4 animate-spin" /> : 'Confirm Dispatch'}
                           </button>
                        </div>
                     </div>
                  ) : (
                     /* INLINE ACTION: BILLING & FINALIZE DISCHARGE */
                     <div className="space-y-6 flex-grow flex flex-col justify-between">
                        <form onSubmit={handleDischargeSubmit} className="space-y-6 flex-grow flex flex-col justify-between">
                           <div>
                              <div className="flex items-center justify-between border-b pb-4">
                                 <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">Discharge Calculator</h3>
                                 <button type="button" onClick={() => setActiveAction(null)} className="text-xs font-bold text-slate-400 hover:text-slate-600">&larr; Back to Actions</button>
                              </div>

                              <div className="bg-[#08B36A]/5 border border-[#08B36A]/20 p-4 rounded-2xl flex justify-between items-center my-4 text-xs">
                                 <div>
                                    <p className="text-[#08B36A] font-black uppercase tracking-wider">Admission Deposit</p>
                                    <p className="text-[9px] text-[#08B36A]/60 font-semibold uppercase mt-0.5">Paid during entry</p>
                                 </div>
                                 <span className="text-base font-black text-[#08B36A]">₹{selectedAdmission?.totalAmount || 0}</span>
                              </div>

                              <div className="space-y-3">
                                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Discharge Extra Surcharges</h4>
                                 <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                                    {billingItems.map((item, index) => (
                                       <div key={index} className="flex gap-2 items-center">
                                          <input 
                                             type="text" required placeholder="Charge Line Name" 
                                             value={item.name} onChange={(e) => updateBillingRow(index, 'name', e.target.value)} 
                                             className="flex-1 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#08B36A] font-semibold bg-slate-50"
                                          />
                                          <div className="relative w-1/3">
                                             <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</span>
                                             <input 
                                                type="number" required placeholder="0.00" 
                                                value={item.price} onChange={(e) => updateBillingRow(index, 'price', e.target.value)} 
                                                className="w-full border border-slate-200 rounded-lg p-2.5 pl-6 text-xs focus:outline-none focus:border-[#08B36A] font-black text-slate-800 bg-slate-50"
                                             />
                                          </div>
                                          <button type="button" onClick={() => removeBillingRow(index)} className="text-slate-300 hover:text-red-500 p-2 transition-colors shrink-0">
                                             <TrashIcon className="w-4 h-4" />
                                          </button>
                                       </div>
                                    ))}
                                 </div>
                                 <button type="button" onClick={addBillingRow} className="text-[10px] font-black text-[#08B36A] uppercase tracking-wider flex items-center gap-1 mt-1">
                                    + Add Charge Line
                                 </button>
                              </div>

                              <div className="bg-slate-900 text-white p-4 rounded-2xl flex justify-between items-center mt-4">
                                 <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Combined Total Invoice</span>
                                 <span className="text-xl font-black text-white">
                                    ₹{(selectedAdmission?.totalAmount || 0) + billingItems.reduce((sum, item) => sum + (Number(item.price) || 0), 0)}
                                 </span>
                              </div>
                           </div>

                           <div className="pt-4 border-t">
                              <button type="submit" disabled={isProcessing} className="w-full bg-[#08B36A] hover:bg-[#08B36A]/90 text-white font-black py-4 rounded-xl shadow-lg transition-all flex justify-center items-center gap-2 text-xs uppercase tracking-widest">
                                 {isProcessing && <SpinnerIcon className="w-4 h-4 text-white animate-spin" />} Issue Final Invoice & Discharge
                              </button>
                           </div>
                        </form>
                     </div>
                  )}

               </div>

            </div>

         </div>
        </div>
      )}

    </div>
  );
};

export default ManageAdmissions;

const InfoSection = ({ title, children }) => (
  <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm w-full block space-y-4">
    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-2 flex items-center gap-2">{title}</h4>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4">{children}</div>
  </div>
);

const InfoItem = ({ label, value }) => (
  <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100">
     <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1 leading-none">{label}</p>
     <p className="text-xs font-black text-slate-800 truncate">{value || 'N/A'}</p>
  </div>
);

const TrashIcon = ({className}) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>);
const CloseIcon = ({className}) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>);
const SpinnerIcon = ({className}) => (<svg className={className || "w-5 h-5 animate-spin"} fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>);