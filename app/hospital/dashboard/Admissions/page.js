"use client";

import React, { useState, useEffect } from 'react';
import HospitalAPI from '@/app/services/HospitalAPI';

const ManageAdmissions = () => {
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Modals State
  const [selectedAdmission, setSelectedAdmission] = useState(null);
  const [driverModal, setDriverModal] = useState({ isOpen: false, driversList: [], selectedDriverId: '' });
  const [dischargeModal, setDischargeModal] = useState({ isOpen: false, billingItems: [{ name: 'Medicines', price: '' }] });
  const [doctorModal, setDoctorModal] = useState({ isOpen: false, doctorsList: [], selectedDoctorId: '' });

  // 🌟 NEW: Bed Assignment Modal State (Multi-Step)
  const [bedAssignModal, setBedAssignModal] = useState({ 
    isOpen: false, 
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

  // ---------------------------------------------------------
  // 🛏️ ACTION: ASSIGN BED (STEP 1: FETCH WARDS)
  // ---------------------------------------------------------
  const openBedAssignModal = async () => {
    setBedAssignModal({ isOpen: true, step: 1, wards: [], beds: [], selectedWard: null, isLoadingData: true });
    try {
      const response = await HospitalAPI.getWardsList(); // Reuse existing ward API
      if (response?.success) {
        setBedAssignModal(prev => ({ ...prev, wards: response.data, isLoadingData: false }));
      } else {
        alert(response?.message || 'Could not fetch wards.');
        setBedAssignModal(prev => ({ ...prev, isLoadingData: false }));
      }
    } catch (error) {
      alert('Error fetching wards.');
      setBedAssignModal(prev => ({ ...prev, isLoadingData: false }));
    }
  };

  // 🛏️ ACTION: FETCH BEDS FOR WARD (STEP 2)
  const handleSelectWard = async (ward) => {
    setBedAssignModal(prev => ({ ...prev, step: 2, selectedWard: ward, isLoadingData: true }));
    try {
      const response = await HospitalAPI.getWardBeds(ward._id); // Reuse existing bed API
      if (response?.success) {
        setBedAssignModal(prev => ({ ...prev, beds: response.data, isLoadingData: false }));
      } else {
        alert(response?.message || 'Could not fetch beds.');
        setBedAssignModal(prev => ({ ...prev, step: 1, isLoadingData: false })); // Go back if error
      }
    } catch (error) {
      alert('Error fetching beds.');
      setBedAssignModal(prev => ({ ...prev, step: 1, isLoadingData: false }));
    }
  };

  // 🛏️ ACTION: ADMIT PATIENT TO SPECIFIC BED
  const handleSelectBed = async (bed) => {
    if (bed.status !== 'Available') return alert('Please select an Available bed.');
    
    if (!confirm(`Are you sure you want to admit patient to Bed: ${bed.bedNumber} in ${bedAssignModal.selectedWard.name}?`)) return;

    setIsProcessing(true);
    try {
      const payload = { 
        appointmentId: selectedAdmission._id, 
        bedId: bed._id 
      };
      const response = await HospitalAPI.admitPatientToBed(payload);
      if (response?.success) {
        alert(`Success! Patient admitted to Bed ${bed.bedNumber}.`);
        setBedAssignModal({ isOpen: false, step: 1, wards: [], beds: [], selectedWard: null, isLoadingData: false });
        setSelectedAdmission(null); // Close main modal
        fetchAdmissions(); // Refresh List
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
  // 👨‍⚕️ ACTION: ASSIGN DOCTOR & APPROVE ADMISSION
  // ---------------------------------------------------------
  const openAssignDoctorModal = async () => {
    setIsProcessing(true);
    try {
      const response = await HospitalAPI.getHospitalDoctors();
      if (response?.success) {
        setDoctorModal({ isOpen: true, doctorsList: response.data || [], selectedDoctorId: '' });
      } else {
        alert(response?.message || 'Could not fetch doctors list.');
      }
    } catch (error) { alert('Error fetching doctors.'); } 
    finally { setIsProcessing(false); }
  };

  const handleAssignDoctor = async (e) => {
    e.preventDefault();
    if (!doctorModal.selectedDoctorId) return alert('Please select a doctor!');
    
    setIsProcessing(true);
    try {
      const payload = { appointmentId: selectedAdmission._id, doctorId: doctorModal.selectedDoctorId };
      const response = await HospitalAPI.assignDoctorToAdmission(payload);
      if (response?.success) {
        alert('Doctor assigned successfully! Admission Approved.');
        setDoctorModal({ isOpen: false, doctorsList: [], selectedDoctorId: '' });
        setSelectedAdmission(null); fetchAdmissions(); 
      } else { alert('Error: ' + response.message); }
    } catch (error) { alert('Something went wrong while assigning doctor!'); } 
    finally { setIsProcessing(false); }
  };

  // ---------------------------------------------------------
  // 🚑 ACTION: ASSIGN AMBULANCE / DRIVER
  // ---------------------------------------------------------
  const openAssignDriverModal = async () => {
    setIsProcessing(true);
    try {
      const response = await HospitalAPI.getAvailableDrivers();
      if (response?.success) {
        setDriverModal({ isOpen: true, driversList: response.data || [], selectedDriverId: '' });
      } else { alert(response?.message || 'Could not fetch available drivers.'); }
    } catch (error) { alert('Error fetching drivers.'); } 
    finally { setIsProcessing(false); }
  };

  const handleAssignDriver = async (e) => {
    e.preventDefault();
    if (!driverModal.selectedDriverId) return alert('Please select a driver!');
    
    setIsProcessing(true);
    try {
      const payload = { caseId: selectedAdmission._id, driverId: driverModal.selectedDriverId };
      const response = await HospitalAPI.assignDriver(payload);
      if (response?.success) {
        alert('Ambulance driver assigned successfully!');
        setDriverModal({ isOpen: false, driversList: [], selectedDriverId: '' });
        setSelectedAdmission(null); fetchAdmissions(); 
      } else { alert('Error: ' + response.message); }
    } catch (error) { alert('Something went wrong!'); } 
    finally { setIsProcessing(false); }
  };

  // ---------------------------------------------------------
  // 🧾 ACTION: FINALIZE DISCHARGE & BILLING
  // ---------------------------------------------------------
  const openDischargeModal = () => {
    setDischargeModal({ isOpen: true, billingItems: [{ name: 'Medicines', price: '' }] });
  };

  const handleDischargeSubmit = async (e) => {
    e.preventDefault();
    const validItems = dischargeModal.billingItems
      .filter(item => item.name.trim() !== '' && item.price !== '')
      .map(item => ({ name: item.name, price: Number(item.price) }));

    if (!confirm('Are you sure you want to finalize this discharge? Bed will be released and wallet will be credited.')) return;

    setIsProcessing(true);
    try {
      const payload = { appointmentId: selectedAdmission._id, billingItems: validItems };
      const response = await HospitalAPI.finalizeDischarge(payload);
      if (response?.success) {
        alert(`Discharge Successful! Bill Amount: ₹${response.billAmount || 'N/A'}`);
        setDischargeModal({ isOpen: false, billingItems: [] });
        setSelectedAdmission(null); fetchAdmissions(); 
      } else { alert('Error: ' + response.message); }
    } catch (error) { alert('Failed to process discharge.'); } 
    finally { setIsProcessing(false); }
  };

  const addBillingRow = () => setDischargeModal(prev => ({ ...prev, billingItems: [...prev.billingItems, { name: '', price: '' }] }));
  const updateBillingRow = (index, field, value) => {
    const newItems = [...dischargeModal.billingItems];
    newItems[index][field] = value;
    setDischargeModal(prev => ({ ...prev, billingItems: newItems }));
  };
  const removeBillingRow = (index) => {
    const newItems = dischargeModal.billingItems.filter((_, i) => i !== index);
    setDischargeModal(prev => ({ ...prev, billingItems: newItems }));
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
      case 'Confirmed': return 'bg-green-50 text-green-700 border-green-200';
      case 'Hospital-Pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'Discharged': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="p-6 max-w-[90rem] mx-auto font-sans min-h-screen relative bg-gray-50/50">
      
      {/* ---------------- HEADER ---------------- */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Hospital Admissions</h2>
          <p className="text-sm text-gray-500 mt-1 font-medium">Manage admissions, assign beds & doctors, and process billing.</p>
        </div>
        <div className="mt-4 md:mt-0 bg-blue-50 px-6 py-3 rounded-xl border border-blue-100 flex items-center gap-3 shadow-sm">
           <span className="text-3xl">🏥</span>
           <div>
              <p className="text-xs font-black text-blue-800 uppercase tracking-widest">Active Admissions</p>
              <p className="text-xl font-black text-blue-900">{admissions.length}</p>
           </div>
        </div>
      </div>

      {/* ---------------- ADMISSIONS TABLE LISTING ---------------- */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4"><SpinnerIcon className="w-10 h-10 text-blue-500 animate-spin" /><p className="text-lg text-gray-500 font-bold">Loading Admissions...</p></div>
      ) : admissions.length === 0 ? (
        <div className="text-center bg-white p-20 rounded-3xl shadow-sm border-2 border-dashed border-gray-300">
          <div className="w-24 h-24 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center text-5xl mb-6 mx-auto shadow-inner">🛏️</div>
          <p className="text-gray-700 text-2xl font-black">No Admissions Found</p>
          <p className="text-gray-500 mt-2">There are currently no active patient admissions.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-500 text-[10px] uppercase tracking-widest font-black">
                  <th className="p-5">Booking ID</th>
                  <th className="p-5">Patient Details</th>
                  <th className="p-5">Bed / Ward</th>
                  <th className="p-5">Assigned Doctor</th>
                  <th className="p-5">Amount</th>
                  <th className="p-5">Status</th>
                  <th className="p-5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {admissions.map((adm) => {
                  const patient = adm.patients?.[0] || {};
                  const isEmergency = adm.triageLevel === 'Emergency';
                  const hasBed = adm.bedId && typeof adm.bedId === 'object' ? true : false; // Handle populated bed data if any

                  return (
                    <tr 
                      key={adm._id} 
                      className="hover:bg-blue-50/40 transition-colors duration-200 group cursor-pointer"
                      onClick={() => setSelectedAdmission(adm)}
                    >
                      {/* Booking ID */}
                      <td className="p-5">
                        <span className="bg-gray-100 text-gray-800 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-gray-200">
                          {adm.bookingId}
                        </span>
                      </td>

                      {/* Patient Info */}
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black text-lg border border-blue-200 shadow-sm">
                            {patient.patientName?.charAt(0) || '?'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-black text-gray-900">{patient.patientName || 'Unknown'}</p>
                              {isEmergency && <span className="text-red-500 animate-pulse text-xs" title="Emergency Case">🚨</span>}
                            </div>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mt-0.5">
                              {patient.gender || 'N/A'} • {patient.patientAge ? `${patient.patientAge} Yrs` : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Assigned Bed */}
                      <td className="p-5">
                        {adm.bedId && adm.bedId.bedNumber ? (
                          <div className="flex items-center gap-2">
                            <span className="bg-gray-900 text-white text-xs font-black px-2.5 py-1 rounded shadow-sm">{adm.bedId.bedNumber}</span>
                            <span className="text-xs font-bold text-gray-600">{adm.bedId.wardId?.name || 'Assigned'}</span>
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-yellow-600 bg-yellow-50 px-2.5 py-1 rounded-md border border-yellow-100 animate-pulse">
                            Bed Required
                          </span>
                        )}
                      </td>

                      {/* Assigned Doctor */}
                      <td className="p-5">
                        {adm.doctorId?.name ? (
                          <div className="flex items-center gap-2">
                            <span className="text-lg">👨‍⚕️</span>
                            <span className="text-sm font-bold text-gray-800">{adm.doctorId.name}</span>
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-gray-400 italic">Not Assigned</span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="p-5">
                        <p className="text-sm font-black text-green-700">₹{adm.totalAmount}</p>
                        <p className={`text-[9px] font-black uppercase tracking-widest mt-1 ${adm.paymentStatus === 'Paid' ? 'text-green-600' : 'text-red-500'}`}>
                          {adm.paymentStatus}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="p-5">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full border shadow-sm ${getStatusColor(adm.status)}`}>
                          {adm.status}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="p-5 text-center">
                        <button className="bg-white border border-gray-200 text-gray-700 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-200 text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm">
                          View Details
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------
         MODAL 1: FULL ADMISSION DETAILS
      --------------------------------------------------------- */}
      {selectedAdmission && !driverModal.isOpen && !dischargeModal.isOpen && !doctorModal.isOpen && !bedAssignModal.isOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 md:pl-64 bg-gray-900/60 backdrop-blur-md transition-opacity animate-fadeIn">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2rem] shadow-2xl relative scrollbar-hide flex flex-col">
            
            <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-100 px-8 py-5 flex justify-between items-center z-10">
               <div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                     Admission Overview
                     {selectedAdmission.triageLevel === 'Emergency' && <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full uppercase tracking-widest ml-2 border border-red-200">Emergency</span>}
                  </h2>
                  <p className="text-gray-500 font-bold text-xs uppercase tracking-wide mt-1">Booking ID: <span className="text-blue-600">{selectedAdmission.bookingId}</span></p>
               </div>
               <button onClick={() => setSelectedAdmission(null)} className="text-gray-400 hover:text-red-500 bg-gray-50 border border-gray-200 hover:border-red-200 w-10 h-10 flex items-center justify-center rounded-full transition-all">
                 <CloseIcon className="w-5 h-5"/>
               </button>
            </div>

            <div className="p-8 flex-grow space-y-8">
               <div className="flex gap-4">
                 <div className={`flex-1 p-4 rounded-2xl border flex flex-col justify-center items-center ${getStatusColor(selectedAdmission.status)}`}>
                    <span className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-70">Current Status</span>
                    <span className="text-xl font-black">{selectedAdmission.status}</span>
                 </div>
                 
                 {/* BED ALLOCATION STATUS */}
                 <div className="flex-1 p-4 rounded-2xl border flex flex-col justify-center items-center bg-gray-900 text-white border-gray-800 shadow-md">
                    <span className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-70">Bed Allocation</span>
                    {selectedAdmission.bedId?.bedNumber ? (
                       <div className="flex flex-col items-center">
                         <span className="text-2xl font-black text-blue-400">{selectedAdmission.bedId.bedNumber}</span>
                         <span className="text-xs font-bold mt-1 text-gray-300">{selectedAdmission.bedId.wardId?.name}</span>
                       </div>
                    ) : (
                       <span className="text-lg font-black text-yellow-500 animate-pulse">Pending Bed</span>
                    )}
                 </div>

                 <div className={`flex-1 p-4 rounded-2xl border flex flex-col justify-center items-center ${selectedAdmission.paymentStatus === 'Paid' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                    <span className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-70">Payment</span>
                    <span className="text-xl font-black flex items-center gap-1">{selectedAdmission.paymentStatus === 'Paid' ? '✅ Paid' : '❌ Pending'} </span>
                 </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <InfoSection title="🧑‍🤝‍🧑 Patient Information">
                    <InfoItem label="Patient Name" value={selectedAdmission.patients[0]?.patientName} />
                    <InfoItem label="Age & Gender" value={`${selectedAdmission.patients[0]?.patientAge} Yrs, ${selectedAdmission.patients[0]?.gender}`} />
                    <InfoItem label="Consultation Type" value={selectedAdmission.consultationType} />
                  </InfoSection>

                  <InfoSection title="📆 Appointment Details">
                    <InfoItem label="Appointment Date" value={displayDate(selectedAdmission.appointmentDate)} />
                    <InfoItem label="Assigned Doctor" value={selectedAdmission.doctorId?.name || 'Pending/Not Assigned'} />
                    <InfoItem label="Doctor Speciality" value={selectedAdmission.doctorId?.speciality || 'N/A'} />
                  </InfoSection>
               </div>
            </div>

            {/* 🔥 STICKY FOOTER ACTION BUTTONS */}
            <div className="sticky bottom-0 bg-white border-t border-gray-100 p-6 flex flex-wrap justify-end gap-3 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
               {selectedAdmission.status !== 'Discharged' && (
                 <>
                   {/* Assign BED Button */}
                   {(!selectedAdmission.bedId || !selectedAdmission.bedId.bedNumber) && (
                     <button onClick={openBedAssignModal} className="px-6 py-3.5 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border border-yellow-200 font-bold rounded-xl flex items-center gap-2 transition-colors">
                       🛏️ Assign Bed
                     </button>
                   )}

                   {/* Assign Doctor Button */}
                   {(!selectedAdmission.doctorId || selectedAdmission.status === 'Hospital-Pending') && (
                     <button onClick={openAssignDoctorModal} disabled={isProcessing} className="px-6 py-3.5 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 font-bold rounded-xl flex items-center gap-2 transition-colors">
                       {isProcessing ? <SpinnerIcon className="w-5 h-5 animate-spin" /> : '👨‍⚕️'} Assign Doctor
                     </button>
                   )}

                   {/* Assign Ambulance */}
                   <button onClick={openAssignDriverModal} disabled={isProcessing} className="px-6 py-3.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold rounded-xl flex items-center gap-2 transition-colors">
                     {isProcessing ? <SpinnerIcon className="w-5 h-5 animate-spin" /> : '🚑'} Assign Ambulance
                   </button>

                   {/* Initiate Discharge */}
                   {selectedAdmission.bedId?.bedNumber && selectedAdmission.status !== 'Hospital-Pending' && (
                     <button onClick={openDischargeModal} className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 font-black rounded-xl flex items-center gap-2 transition-all">
                       🧾 Initiate Discharge
                     </button>
                   )}
                 </>
               )}
            </div>

          </div>
        </div>
      )}

      {/* ---------------------------------------------------------
         🌟 MODAL 1.5: 🛏️ BED ASSIGNMENT (MULTI-STEP)
      --------------------------------------------------------- */}
      {bedAssignModal.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:pl-64 bg-gray-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2rem] shadow-2xl relative scrollbar-hide flex flex-col">
            
            {/* Header */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-100 px-8 py-5 flex justify-between items-center z-10">
               <div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                     🛏️ Assign Bed Allocation
                  </h2>
                  <p className="text-blue-600 font-bold text-xs uppercase tracking-wide mt-1">
                    {bedAssignModal.step === 1 ? 'Step 1: Select a Ward' : `Step 2: Select an Available Bed in ${bedAssignModal.selectedWard?.name}`}
                  </p>
               </div>
               <div className="flex items-center gap-3">
                 {bedAssignModal.step === 2 && (
                    <button onClick={() => setBedAssignModal(prev => ({...prev, step: 1, selectedWard: null, beds: []}))} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm transition-all">
                      ⬅ Back to Wards
                    </button>
                 )}
                 <button onClick={() => setBedAssignModal({ isOpen: false, step: 1, wards: [], beds: [], selectedWard: null, isLoadingData: false })} className="text-gray-400 hover:text-red-500 bg-gray-50 border border-gray-200 hover:border-red-200 w-10 h-10 flex items-center justify-center rounded-full transition-all">
                   <CloseIcon className="w-5 h-5"/>
                 </button>
               </div>
            </div>

            <div className="p-8 flex-grow">
               {bedAssignModal.isLoadingData ? (
                  <div className="flex flex-col justify-center items-center h-48 gap-3">
                     <SpinnerIcon className="w-8 h-8 text-blue-500 animate-spin" />
                     <p className="text-gray-500 font-bold text-sm">Loading Data...</p>
                  </div>
               ) : bedAssignModal.step === 1 ? (
                  /* --- STEP 1: WARDS GRID --- */
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                     {bedAssignModal.wards.length === 0 ? (
                       <p className="col-span-full text-center text-gray-500 font-bold py-10">No wards available.</p>
                     ) : (
                       bedAssignModal.wards.map(ward => (
                         <div 
                           key={ward._id} onClick={() => handleSelectWard(ward)} 
                           className="bg-white border-2 border-gray-200 rounded-2xl p-5 cursor-pointer hover:border-blue-500 hover:shadow-lg hover:shadow-blue-100 transition-all group"
                         >
                           <h3 className="text-xl font-black text-gray-800 group-hover:text-blue-600 transition-colors">{ward.name}</h3>
                           <p className="text-xs text-gray-500 font-bold uppercase mt-1">{ward.type}</p>
                           
                           <div className="mt-6 flex justify-between items-center border-t border-gray-100 pt-4">
                              <span className="text-xs font-bold text-gray-600">Total: {ward.totalBeds}</span>
                              <span className={`text-xs font-black px-3 py-1 rounded border shadow-sm ${ward.availableBeds > 0 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                {ward.availableBeds > 0 ? `${ward.availableBeds} Available` : 'Full'}
                              </span>
                           </div>
                         </div>
                       ))
                     )}
                  </div>
               ) : (
                  /* --- STEP 2: BEDS GRID --- */
                  <div>
                    {/* Status Legends */}
                    <div className="flex items-center justify-end gap-4 mb-6">
                       <span className="text-green-600 font-bold text-[10px] tracking-wide uppercase flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div> Available</span>
                       <span className="text-red-600 font-bold text-[10px] tracking-wide uppercase flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> Occupied</span>
                       <span className="text-yellow-600 font-bold text-[10px] tracking-wide uppercase flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-500"></div> Maintenance</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                       {bedAssignModal.beds.length === 0 ? (
                          <p className="col-span-full text-center text-gray-500 font-bold py-10">No beds found in this ward.</p>
                       ) : (
                          bedAssignModal.beds.map(bed => {
                             const isAvail = bed.status === 'Available';
                             const isOccupied = bed.status === 'Occupied';
                             const isMaint = bed.status === 'Maintenance';
                             
                             let cardStyle = "bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed";
                             let badgeStyle = "bg-gray-200 text-gray-800";
                             
                             if (isAvail) { cardStyle = "bg-green-50 border-green-200 hover:shadow-lg hover:shadow-green-100 hover:-translate-y-1 cursor-pointer"; badgeStyle = "bg-green-200 text-green-800"; }
                             else if (isOccupied) { cardStyle = "bg-red-50 border-red-200 opacity-70 cursor-not-allowed"; badgeStyle = "bg-red-200 text-red-800"; }
                             else if (isMaint) { cardStyle = "bg-yellow-50 border-yellow-300 border-dashed opacity-70 cursor-not-allowed"; badgeStyle = "bg-yellow-200 text-yellow-800"; }

                             return (
                                <div key={bed._id} onClick={() => isAvail && handleSelectBed(bed)} className={`relative p-4 rounded-2xl border-2 flex flex-col items-center justify-center text-center transition-all group ${cardStyle}`}>
                                   <span className="text-3xl mb-2 drop-shadow-sm">{isOccupied ? '🛌' : isMaint ? '🛠️' : '🛏️'}</span>
                                   <span className="text-sm font-black text-gray-900 tracking-wider uppercase">{bed.bedNumber}</span>
                                   <span className={`mt-1 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${badgeStyle}`}>
                                     {bed.status}
                                   </span>
                                   <span className="mt-2 text-[10px] text-gray-500 font-bold">₹{bed.pricePerDay || 0}/day</span>
                                   
                                   {/* Select Overlay */}
                                   {isAvail && (
                                     <div className="absolute inset-0 bg-green-500/10 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                                        <span className="bg-green-600 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-md">Click to Assign</span>
                                     </div>
                                   )}
                                </div>
                             )
                          })
                       )}
                    </div>
                  </div>
               )}
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------
         MODAL 2: ASSIGN DOCTOR (APPROVE ADMISSION)
      --------------------------------------------------------- */}
      {doctorModal.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:pl-64 bg-gray-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-md overflow-hidden rounded-[2rem] shadow-2xl relative">
            <div className="bg-green-50 border-b border-green-100 px-8 py-6 flex justify-between items-center">
               <h2 className="text-xl font-black text-green-900 flex items-center gap-2">👨‍⚕️ Assign Doctor</h2>
               <button onClick={() => setDoctorModal({ isOpen: false, doctorsList: [], selectedDoctorId: '' })} className="text-gray-400 hover:text-red-500 bg-white border border-gray-200 w-8 h-8 flex items-center justify-center rounded-full"><CloseIcon className="w-4 h-4"/></button>
            </div>
            <div className="p-8">
              <form onSubmit={handleAssignDoctor} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs text-gray-700 font-black tracking-wide uppercase">Select Available Doctor</label>
                  {doctorModal.doctorsList.length === 0 ? (
                    <p className="text-sm text-red-500 font-bold bg-red-50 p-4 rounded-xl border border-red-100">No doctors registered in your hospital yet.</p>
                  ) : (
                    <select required value={doctorModal.selectedDoctorId} onChange={(e) => setDoctorModal({...doctorModal, selectedDoctorId: e.target.value})} className="w-full border-2 border-gray-200 rounded-xl p-4 text-sm focus:outline-none focus:border-green-500 font-semibold bg-white cursor-pointer">
                      <option value="">-- Choose Doctor --</option>
                      {doctorModal.doctorsList.map(doc => (
                        <option key={doc._id} value={doc._id}>Dr. {doc.name} ({doc.speciality || 'General'})</option>
                      ))}
                    </select>
                  )}
                </div>
                <button type="submit" disabled={isProcessing || doctorModal.doctorsList.length === 0} className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-black py-4 rounded-xl shadow-lg shadow-green-200 transition-all flex justify-center items-center gap-2">
                  {isProcessing && <SpinnerIcon className="w-5 h-5 text-white animate-spin" />} Assign & Approve Request
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------
         MODAL 3: ASSIGN AMBULANCE DRIVER
      --------------------------------------------------------- */}
      {driverModal.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:pl-64 bg-gray-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-md overflow-hidden rounded-[2rem] shadow-2xl relative">
            <div className="bg-indigo-50 border-b border-indigo-100 px-8 py-6 flex justify-between items-center">
               <h2 className="text-xl font-black text-indigo-900 flex items-center gap-2">🚑 Assign Driver</h2>
               <button onClick={() => setDriverModal({ isOpen: false, driversList: [], selectedDriverId: '' })} className="text-gray-400 hover:text-red-500 bg-white border border-gray-200 w-8 h-8 flex items-center justify-center rounded-full"><CloseIcon className="w-4 h-4"/></button>
            </div>
            <div className="p-8">
              <form onSubmit={handleAssignDriver} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs text-gray-700 font-black tracking-wide uppercase">Select Available Driver</label>
                  {driverModal.driversList.length === 0 ? (
                    <p className="text-sm text-red-500 font-bold bg-red-50 p-4 rounded-xl border border-red-100">No drivers are currently "On Duty".</p>
                  ) : (
                    <select required value={driverModal.selectedDriverId} onChange={(e) => setDriverModal({...driverModal, selectedDriverId: e.target.value})} className="w-full border-2 border-gray-200 rounded-xl p-4 text-sm focus:outline-none focus:border-indigo-500 font-semibold bg-white cursor-pointer">
                      <option value="">-- Choose Driver --</option>
                      {driverModal.driversList.map(driver => (
                        <option key={driver._id} value={driver._id}>{driver.name} (Exp: {driver.experienceYears}y)</option>
                      ))}
                    </select>
                  )}
                </div>
                <button type="submit" disabled={isProcessing || driverModal.driversList.length === 0} className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black py-4 rounded-xl shadow-lg shadow-indigo-200 transition-all flex justify-center items-center gap-2">
                  {isProcessing && <SpinnerIcon className="w-5 h-5 text-white animate-spin" />} Dispatch Ambulance
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------
         MODAL 4: DISCHARGE & BILLING INVOICE
      --------------------------------------------------------- */}
      {dischargeModal.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:pl-64 bg-gray-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-2xl max-h-[95vh] overflow-y-auto rounded-[2rem] shadow-2xl relative scrollbar-hide">
            
            <div className="sticky top-0 bg-gray-900 border-b border-gray-800 px-8 py-6 flex justify-between items-center z-10">
               <div>
                 <h2 className="text-xl font-black text-white flex items-center gap-2">🧾 Discharge & Final Billing</h2>
                 <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Patient: {selectedAdmission?.patients[0]?.patientName}</p>
               </div>
               <button type="button" onClick={() => setDischargeModal({ isOpen: false, billingItems: [] })} className="text-gray-300 hover:text-white bg-gray-800 border border-gray-700 w-10 h-10 flex items-center justify-center rounded-full transition-all"><CloseIcon className="w-5 h-5"/></button>
            </div>

            <div className="p-8">
              <form onSubmit={handleDischargeSubmit} className="space-y-6">
                
                {/* Initial Amount Box */}
                <div className="bg-green-50 border border-green-200 p-5 rounded-2xl flex justify-between items-center mb-6">
                   <div>
                     <p className="text-xs text-green-700 font-black uppercase tracking-widest">Admission Base Amount</p>
                     <p className="text-[10px] text-green-600 font-medium">Already paid during booking</p>
                   </div>
                   <span className="text-2xl font-black text-green-700">₹{selectedAdmission?.totalAmount || 0}</span>
                </div>

                {/* Extra Services Items Array */}
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-gray-800 uppercase border-b pb-2">Add Extra Services / Medicine Charges</h3>
                  {dischargeModal.billingItems.map((item, index) => (
                    <div key={index} className="flex gap-3 items-center group">
                       <input 
                         type="text" required placeholder="Item Name (e.g. Nursing, Lab)" 
                         value={item.name} onChange={(e) => updateBillingRow(index, 'name', e.target.value)} 
                         className="flex-1 border-2 border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500 font-semibold"
                       />
                       <div className="relative w-1/3">
                         <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                         <input 
                           type="number" required placeholder="Amount" 
                           value={item.price} onChange={(e) => updateBillingRow(index, 'price', e.target.value)} 
                           className="w-full border-2 border-gray-200 rounded-xl p-3 pl-8 text-sm focus:outline-none focus:border-blue-500 font-black text-gray-800"
                         />
                       </div>
                       <button type="button" onClick={() => removeBillingRow(index)} className="text-gray-300 hover:text-red-500 p-2 transition-colors" title="Remove Row">
                         <TrashIcon className="w-5 h-5" />
                       </button>
                    </div>
                  ))}
                  <button type="button" onClick={addBillingRow} className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-2">
                     <span className="text-lg">+</span> Add Another Item
                  </button>
                </div>

                {/* Calculate Rough Total Dynamically on Frontend */}
                <div className="bg-gray-50 border border-gray-200 p-5 rounded-2xl flex justify-between items-center mt-6">
                   <span className="text-sm text-gray-600 font-black uppercase tracking-widest">Total Grand Bill</span>
                   <span className="text-3xl font-black text-gray-900">
                     ₹{(selectedAdmission?.totalAmount || 0) + dischargeModal.billingItems.reduce((sum, item) => sum + (Number(item.price) || 0), 0)}
                   </span>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <button type="submit" disabled={isProcessing} className="w-full bg-gray-900 hover:bg-black text-white font-black py-4 rounded-xl shadow-xl transition-all flex justify-center items-center gap-2 text-lg">
                    {isProcessing && <SpinnerIcon className="w-6 h-6 text-white animate-spin" />} Finalize Discharge & Release Bed
                  </button>
                  <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-3">This action will credit the amount to your hospital wallet.</p>
                </div>

              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ManageAdmissions;

// ---------------------------------------------------------
// REUSABLE COMPONENTS & ICONS
// ---------------------------------------------------------

const InfoSection = ({ title, children }) => (
  <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 shadow-sm w-full block">
    <h4 className="text-lg font-black text-gray-800 mb-5 border-b border-gray-200 pb-3 flex items-center gap-2">{title}</h4>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">{children}</div>
  </div>
);

const InfoItem = ({ label, value }) => (
  <div className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-sm">
     <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">{label}</p>
     <p className="text-sm font-black text-gray-900 truncate">{value || 'N/A'}</p>
  </div>
);

const TrashIcon = ({className}) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>);
const CloseIcon = ({className}) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>);
const SpinnerIcon = ({className}) => (<svg className={className || "w-5 h-5 animate-spin"} fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>);