"use client";

import React, { useState, useEffect } from 'react';
import HospitalAPI from '@/app/services/HospitalAPI';

const ManageAdmissions = () => {
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals State
  const [selectedAdmission, setSelectedAdmission] = useState(null);
  const [driverModal, setDriverModal] = useState({ isOpen: false, driversList: [], selectedDriverId: '' });
  const [dischargeModal, setDischargeModal] = useState({ isOpen: false, billingItems: [{ name: 'Medicines', price: '' }] });
  const [doctorModal, setDoctorModal] = useState({ isOpen: false, doctorsList: [], selectedDoctorId: '' });

  // Bed Assignment Modal State (Multi-Step)
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

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = admissions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(admissions.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // ---------------------------------------------------------
  // 🛏️ ACTION: ASSIGN BED (STEP 1: FETCH WARDS)
  // ---------------------------------------------------------
  const openBedAssignModal = async () => {
    setBedAssignModal({ isOpen: true, step: 1, wards: [], beds: [], selectedWard: null, isLoadingData: true });
    try {
      const response = await HospitalAPI.getWardsList(); 
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
      const response = await HospitalAPI.getWardBeds(ward._id); 
      if (response?.success) {
        setBedAssignModal(prev => ({ ...prev, beds: response.data, isLoadingData: false }));
      } else {
        alert(response?.message || 'Could not fetch beds.');
        setBedAssignModal(prev => ({ ...prev, step: 1, isLoadingData: false })); 
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
      const payload = { appointmentId: selectedAdmission._id, bedId: bed._id };
      const response = await HospitalAPI.admitPatientToBed(payload);
      if (response?.success) {
        alert(`Success! Patient admitted to Bed ${bed.bedNumber}.`);
        setBedAssignModal({ isOpen: false, step: 1, wards: [], beds: [], selectedWard: null, isLoadingData: false });
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
      case 'Confirmed': return 'bg-[#08B36A]/10 text-[#08B36A] border-[#08B36A]/30';
      case 'Hospital-Pending': return 'bg-[#08B36A]/5 text-[#08B36A] border-[#08B36A]/20';
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

      {/* ---------------- ADMISSIONS TABLE LISTING (ENLARGED) ---------------- */}
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
                  <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-[0.15em] font-black">
                    <th className="px-6 py-5">ID</th>
                    <th className="px-6 py-5">Patient Profile</th>
                    <th className="px-6 py-5">Allocation</th>
                    <th className="px-6 py-5">Doctor</th>
                    <th className="px-6 py-5">Bill</th>
                    <th className="px-6 py-5">Status</th>
                    <th className="px-6 py-5 text-center">Action</th>
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
                        onClick={() => setSelectedAdmission(adm)}
                      >
                        {/* Booking ID */}
                        <td className="px-6 py-5">
                          <span className="text-xs font-black text-gray-600 bg-gray-50 px-3 py-1.5 rounded border border-gray-200">
                            #{adm.bookingId}
                          </span>
                        </td>

                        {/* Patient Info */}
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-[#08B36A]/10 text-[#08B36A] flex items-center justify-center font-black text-sm border border-[#08B36A]/20">
                              {patient.patientName?.charAt(0) || '?'}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-base font-black text-gray-900 leading-none">{patient.patientName || 'Unknown'}</p>
                                {isEmergency && <span className="text-[#08B36A] text-xs" title="Emergency"></span>}
                              </div>
                              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mt-1.5">
                                {patient.gender} • {patient.patientAge}y
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Bed */}
                        <td className="px-6 py-5">
                          {adm.bedId && adm.bedId.bedNumber ? (
                            <div className="flex flex-col leading-tight">
                              <span className="text-sm font-black text-gray-800">Bed {adm.bedId.bedNumber}</span>
                              <span className="text-[11px] font-bold text-gray-500 uppercase mt-0.5">{adm.bedId.wardId?.name}</span>
                            </div>
                          ) : (
                            <span className="text-[10px] font-black text-[#08B36A] bg-[#08B36A]/10 px-3 py-1 rounded border border-[#08B36A]/20 animate-pulse uppercase">
                              Bed Needed
                            </span>
                          )}
                        </td>

                        {/* Doctor */}
                        <td className="px-6 py-5">
                          {adm.doctorId?.name ? (
                            <p className="text-sm font-bold text-gray-700">Dr. {adm.doctorId.name}</p>
                          ) : (
                            <span className="text-xs text-gray-300 italic">Unassigned</span>
                          )}
                        </td>

                        {/* Amount */}
                        <td className="px-6 py-5">
                          <p className="text-base font-black text-gray-800">₹{adm.totalAmount}</p>
                          <p className={`text-[10px] font-black uppercase mt-1 ${adm.paymentStatus === 'Paid' ? 'text-[#08B36A]' : 'text-[#08B36A]/60'}`}>
                            {adm.paymentStatus}
                          </p>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-5">
                          <span className={`text-[10px] font-black uppercase tracking-wider px-4 py-1.5 rounded-full border ${getStatusColor(adm.status)}`}>
                            {adm.status}
                          </span>
                        </td>

                        {/* Action */}
                        <td className="px-6 py-5 text-center">
                          <button className="bg-white border border-gray-200 text-gray-500 group-hover:bg-[#08B36A] group-hover:text-white group-hover:border-[#08B36A] text-xs font-black px-4 py-2 rounded-lg transition-all">
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
         MODAL 1: ADMISSION DETAILS
      --------------------------------------------------------- */}
      {selectedAdmission && !driverModal.isOpen && !dischargeModal.isOpen && !doctorModal.isOpen && !bedAssignModal.isOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 md:pl-64 bg-gray-900/60 backdrop-blur-md animate-fadeIn">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2rem] shadow-2xl relative scrollbar-hide flex flex-col">
            
            <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-100 px-8 py-5 flex justify-between items-center z-10">
               <div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                     Admission Overview
                     {selectedAdmission.triageLevel === 'Emergency' && <span className="bg-[#08B36A]/10 text-[#08B36A] text-xs px-2 py-1 rounded-full uppercase tracking-widest ml-2 border border-[#08B36A]/20">Emergency</span>}
                  </h2>
                  <p className="text-gray-500 font-bold text-xs uppercase tracking-wide mt-1">Booking ID: <span className="text-[#08B36A]">{selectedAdmission.bookingId}</span></p>
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
                 
                 <div className="flex-1 p-4 rounded-2xl border flex flex-col justify-center items-center bg-[#08B36A] text-white border-[#08B36A] shadow-md">
                    <span className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-70">Bed Allocation</span>
                    {selectedAdmission.bedId?.bedNumber ? (
                       <div className="flex flex-col items-center">
                         <span className="text-2xl font-black text-white">{selectedAdmission.bedId.bedNumber}</span>
                         <span className="text-xs font-bold mt-1 text-white/80">{selectedAdmission.bedId.wardId?.name}</span>
                       </div>
                    ) : (
                       <span className="text-lg font-black text-white/80 animate-pulse">Pending Bed</span>
                    )}
                 </div>

                 <div className={`flex-1 p-4 rounded-2xl border flex flex-col justify-center items-center ${selectedAdmission.paymentStatus === 'Paid' ? 'bg-[#08B36A]/10 text-[#08B36A] border-[#08B36A]/20' : 'bg-[#08B36A]/5 text-[#08B36A]/60 border-[#08B36A]/10'}`}>
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

            <div className="sticky bottom-0 bg-white border-t border-gray-100 p-6 flex flex-wrap justify-end gap-3 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
               {selectedAdmission.status !== 'Discharged' && (
               <>
  {(!selectedAdmission.doctorId || selectedAdmission.status === 'Hospital-Pending') && (
    <button onClick={openAssignDoctorModal} disabled={isProcessing} className="px-6 py-3.5 bg-[#08B36A]/10 hover:bg-[#08B36A]/20 text-[#08B36A] border border-[#08B36A]/20 font-bold rounded-xl flex items-center gap-2 transition-colors">
      {isProcessing ? (
        <SpinnerIcon className="w-5 h-5 animate-spin" />
      ) : (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )} 
      Assign Doctor
    </button>
  )}

  <button onClick={openAssignDriverModal} disabled={isProcessing} className="px-6 py-3.5 bg-[#08B36A]/10 hover:bg-[#08B36A]/20 text-[#08B36A] border border-[#08B36A]/20 font-bold rounded-xl flex items-center gap-2 transition-colors">
    {isProcessing ? (
      <SpinnerIcon className="w-5 h-5 animate-spin" />
    ) : (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zM13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
      </svg>
    )} 
    Assign Ambulance
  </button>

  {selectedAdmission.bedId?.bedNumber && selectedAdmission.status !== 'Hospital-Pending' && (
    <button onClick={openDischargeModal} className="px-8 py-3.5 bg-[#08B36A] hover:bg-[#08B36A]/90 text-white shadow-lg shadow-[#08B36A]/20 font-black rounded-xl flex items-center gap-2 transition-all">
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      Initiate Discharge
    </button>
  )}
</>
               )}
            </div>

          </div>
        </div>
      )}


{/* --- MODAL 2: ASSIGN DOCTOR --- */}
{doctorModal.isOpen && (
  <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:pl-64 bg-slate-900/40 backdrop-blur-md animate-fadeIn">
    <div className="bg-white w-full max-w-xl max-h-[85vh] overflow-hidden rounded-[2.5rem] shadow-2xl flex flex-col">
      <div className="bg-[#08B36A] px-8 py-6 text-white flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black uppercase tracking-tight">Select Physician</h2>
          <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest mt-1">Personnel Assignment</p>
        </div>
        <button onClick={() => setDoctorModal({ isOpen: false, doctorsList: [], selectedDoctorId: '' })} className="hover:bg-white/10 w-8 h-8 flex items-center justify-center rounded-full transition-all"><CloseIcon className="w-5 h-5"/></button>
      </div>

      <div className="p-8 overflow-y-auto flex-grow bg-slate-50">
        <div className="grid grid-cols-1 gap-3">
          {doctorModal.doctorsList.length === 0 ? (
            <p className="text-center py-10 text-slate-400 text-xs font-black uppercase">No active doctors</p>
          ) : (
            doctorModal.doctorsList.map(doc => (
              <div 
                key={doc._id}
                onClick={() => setDoctorModal({...doctorModal, selectedDoctorId: doc._id})}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between group
                  ${doctorModal.selectedDoctorId === doc._id ? 'bg-[#08B36A] border-[#08B36A] shadow-lg shadow-[#08B36A]/20' : 'bg-white border-white hover:border-slate-200'}`}
              >
                <div>
                  <h4 className={`font-black text-sm uppercase ${doctorModal.selectedDoctorId === doc._id ? 'text-white' : 'text-slate-800'}`}>Dr. {doc.name}</h4>
                  <p className={`text-[10px] font-bold uppercase tracking-tight ${doctorModal.selectedDoctorId === doc._id ? 'text-white/80' : 'text-slate-400'}`}>{doc.speciality || 'General Medicine'}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${doctorModal.selectedDoctorId === doc._id ? 'bg-white border-white' : 'border-slate-100'}`}>
                   {doctorModal.selectedDoctorId === doc._id && <div className="w-2 h-2 bg-[#08B36A] rounded-full"></div>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="p-8 bg-white border-t border-slate-100">
        <button 
          onClick={handleAssignDoctor}
          disabled={isProcessing || !doctorModal.selectedDoctorId} 
          className="w-full bg-[#08B36A] hover:bg-[#08B36A]/90 disabled:bg-slate-200 text-white font-black py-4 rounded-2xl transition-all uppercase text-xs tracking-[0.2em] flex justify-center items-center gap-2"
        >
          {isProcessing ? <SpinnerIcon className="w-4 h-4 animate-spin" /> : 'Confirm Assignment'}
        </button>
      </div>
    </div>
  </div>
)}

{/* --- MODAL 3: ASSIGN DRIVER --- */}
{driverModal.isOpen && (
  <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:pl-64 bg-slate-900/40 backdrop-blur-md animate-fadeIn">
    <div className="bg-white w-full max-w-xl max-h-[85vh] overflow-hidden rounded-[2.5rem] shadow-2xl flex flex-col">
      <div className="bg-[#08B36A] px-8 py-6 text-white flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black uppercase tracking-tight">Assign Dispatcher</h2>
          <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest mt-1">Vehicle Logistics</p>
        </div>
        <button onClick={() => setDriverModal({ isOpen: false, driversList: [], selectedDriverId: '' })} className="hover:bg-white/10 w-8 h-8 flex items-center justify-center rounded-full transition-all"><CloseIcon className="w-5 h-5"/></button>
      </div>

      <div className="p-8 overflow-y-auto flex-grow bg-slate-50">
        <div className="grid grid-cols-1 gap-3">
          {driverModal.driversList.length === 0 ? (
            <p className="text-center py-10 text-slate-400 text-xs font-black uppercase">No drivers available</p>
          ) : (
            driverModal.driversList.map(driver => (
              <div 
                key={driver._id}
                onClick={() => setDriverModal({...driverModal, selectedDriverId: driver._id})}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between
                  ${driverModal.selectedDriverId === driver._id ? 'bg-[#08B36A] border-[#08B36A] shadow-lg shadow-[#08B36A]/20' : 'bg-white border-white hover:border-slate-200'}`}
              >
                <div>
                  <h4 className={`font-black text-sm uppercase ${driverModal.selectedDriverId === driver._id ? 'text-white' : 'text-slate-800'}`}>{driver.name}</h4>
                  <p className={`text-[10px] font-bold uppercase tracking-tight ${driverModal.selectedDriverId === driver._id ? 'text-white/80' : 'text-slate-400'}`}>Experience: {driver.experienceYears} Years</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${driverModal.selectedDriverId === driver._id ? 'bg-white border-white' : 'border-slate-100'}`}>
                   {driverModal.selectedDriverId === driver._id && <div className="w-2 h-2 bg-[#08B36A] rounded-full"></div>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="p-8 bg-white border-t border-slate-100">
        <button 
          onClick={handleAssignDriver}
          disabled={isProcessing || !driverModal.selectedDriverId} 
          className="w-full bg-[#08B36A] hover:bg-[#08B36A]/90 disabled:bg-slate-200 text-white font-black py-4 rounded-2xl transition-all uppercase text-xs tracking-[0.2em] flex justify-center items-center gap-2"
        >
          {isProcessing ? <SpinnerIcon className="w-4 h-4 animate-spin" /> : 'Confirm Dispatch'}
        </button>
      </div>
    </div>
  </div>
)}

      {/* ---------------------------------------------------------
         MODAL 4: DISCHARGE & BILLING
      --------------------------------------------------------- */}
      {dischargeModal.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:pl-64 bg-gray-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-2xl max-h-[95vh] overflow-y-auto rounded-[2rem] shadow-2xl relative scrollbar-hide">
            
            <div className="sticky top-0 bg-[#08B36A] border-b border-[#08B36A]/10 px-8 py-6 flex justify-between items-center z-10">
               <div>
                 <h2 className="text-xl font-black text-white flex items-center gap-2">🧾 Discharge & Final Billing</h2>
                 <p className="text-white/70 text-xs font-bold uppercase tracking-widest mt-1">Patient: {selectedAdmission?.patients[0]?.patientName}</p>
               </div>
               <button type="button" onClick={() => setDischargeModal({ isOpen: false, billingItems: [] })} className="text-white/70 hover:text-white bg-white/10 border border-white/20 w-10 h-10 flex items-center justify-center rounded-full transition-all"><CloseIcon className="w-5 h-5"/></button>
            </div>

            <div className="p-8">
              <form onSubmit={handleDischargeSubmit} className="space-y-6">
                
                <div className="bg-[#08B36A]/5 border border-[#08B36A]/20 p-5 rounded-2xl flex justify-between items-center mb-6">
                   <div>
                     <p className="text-xs text-[#08B36A] font-black uppercase tracking-widest">Base Amount</p>
                     <p className="text-[10px] text-[#08B36A]/60 font-medium">Paid during booking</p>
                   </div>
                   <span className="text-2xl font-black text-[#08B36A]">₹{selectedAdmission?.totalAmount || 0}</span>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-black text-gray-800 uppercase border-b pb-2">Add Extra Charges</h3>
                  {dischargeModal.billingItems.map((item, index) => (
                    <div key={index} className="flex gap-3 items-center group">
                       <input 
                         type="text" required placeholder="Item Name" 
                         value={item.name} onChange={(e) => updateBillingRow(index, 'name', e.target.value)} 
                         className="flex-1 border-2 border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[#08B36A] font-semibold"
                       />
                       <div className="relative w-1/3">
                         <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                         <input 
                           type="number" required placeholder="Amount" 
                           value={item.price} onChange={(e) => updateBillingRow(index, 'price', e.target.value)} 
                           className="w-full border-2 border-gray-200 rounded-xl p-3 pl-8 text-sm focus:outline-none focus:border-[#08B36A] font-black text-gray-800"
                         />
                       </div>
                       <button type="button" onClick={() => removeBillingRow(index)} className="text-gray-300 hover:text-red-500 p-2 transition-colors">
                         <TrashIcon className="w-5 h-5" />
                       </button>
                    </div>
                  ))}
                  <button type="button" onClick={addBillingRow} className="text-sm font-bold text-[#08B36A] hover:text-[#08B36A]/80 flex items-center gap-1 mt-2">
                     <span className="text-lg">+</span> Add Item
                  </button>
                </div>

                <div className="bg-gray-50 border border-gray-200 p-5 rounded-2xl flex justify-between items-center mt-6">
                   <span className="text-sm text-gray-600 font-black uppercase tracking-widest">Grand Total</span>
                   <span className="text-3xl font-black text-gray-900">
                     ₹{(selectedAdmission?.totalAmount || 0) + dischargeModal.billingItems.reduce((sum, item) => sum + (Number(item.price) || 0), 0)}
                   </span>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <button type="submit" disabled={isProcessing} className="w-full bg-[#08B36A] hover:bg-[#08B36A]/90 text-white font-black py-4 rounded-xl shadow-xl transition-all flex justify-center items-center gap-2 text-lg">
                    {isProcessing && <SpinnerIcon className="w-6 h-6 text-white animate-spin" />} Finalize Discharge
                  </button>
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