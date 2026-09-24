"use client";

import React, { useState, useEffect, useMemo } from 'react';
import HospitalAPI from '@/app/services/HospitalAPI';
import BedAllocationModal from './components/BedAllocationModal';
import AdmissionDetailsModal from './components/AdmissionDetailsModal';
import { SpinnerIcon } from './components/InfoSection';

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

const getEventBadgeStyle = (eventType) => {
  switch (eventType) {
    case 'BEDSIDE_FEEDBACK':
      return { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', icon: '🩺' };
    case 'MEDICATION_ORDERED':
      return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: '💊' };
    case 'CLINICAL_ROUND':
      return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: '📋' };
    default:
      return { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', icon: '⏱️' };
  }
};

const getFormattedImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5002';
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanBaseUrl}${cleanPath}`;
};

const ManageAdmissionsPage = () => {
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState('pending'); // 'pending', 'active', 'cancelled', 'tracked'
  
  // Pagination State for standard admissions
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Tracked Cases State & Search
  const [trackedCases, setTrackedCases] = useState([]);
  const [trackedPage, setTrackedPage] = useState(1);
  const [trackedTotalPages, setTrackedTotalPages] = useState(1);
  const [trackedTotalRecords, setTrackedTotalRecords] = useState(0);
  const [trackedSearch, setTrackedSearch] = useState('');
  const [loadingTracked, setLoadingTracked] = useState(false);

  // Tracked Cases Details State
  const [selectedTrackedId, setSelectedTrackedId] = useState(null);
  const [trackedDetails, setTrackedDetails] = useState(null);
  const [loadingTrackedDetails, setLoadingTrackedDetails] = useState(false);

  // Selected Admission & Modal Control State
  const [selectedAdmission, setSelectedAdmission] = useState(null);
  const [activeAction, setActiveAction] = useState(null); // 'doctor' | 'reassign-doctor' | 'ambulance' | 'reject' | null

  // Ambulance Multi-step Flow State
  const [driverList, setDriverList] = useState([]);
  const [ambulanceFlow, setAmbulanceFlow] = useState({
    step: 1, 
    selectedDriver: null,
    selectedLocation: null,
    customLocationText: ''
  });
  
  // Bed Transfer State
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferWardList, setTransferWardList] = useState([]);
  const [transferBedList, setTransferBedList] = useState([]);
  const [selectedTransferWard, setSelectedTransferWard] = useState(null);
  const [selectedTransferBed, setSelectedTransferBed] = useState(null);
  const [loadingTransferBeds, setLoadingTransferBeds] = useState(false);

  // Physician & Rejection States
  const [doctorList, setDoctorList] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [reassignReason, setReassignReason] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  // Initial load
  useEffect(() => {
    fetchAdmissions();
    fetchTrackedCasesCountOnly();
  }, []);

  // Fetch when tab changes or tracked page/search changes
  useEffect(() => {
    if (activeSubTab === 'tracked') {
      fetchTrackedCases(trackedPage, trackedSearch);
    } else {
      setCurrentPage(1);
    }
  }, [activeSubTab, trackedPage]);

  const fetchAdmissions = async () => {
    setLoading(true);
    try {
      const response = await HospitalAPI.getAdmissions();
      if (response?.success) {
        setAdmissions(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching admissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrackedCasesCountOnly = async () => {
    try {
      const response = await HospitalAPI.getTrackedCases(1);
      if (response?.success) {
        setTrackedTotalRecords(response.totalRecords || 0);
      }
    } catch (error) {
      console.error("Error fetching tracked count:", error);
    }
  };

  const fetchTrackedCases = async (page = 1, search = '') => {
    setLoadingTracked(true);
    try {
      const response = await HospitalAPI.getTrackedCases(page, search);
      if (response?.success) {
        setTrackedCases(response.data || []);
        setTrackedTotalPages(response.totalPages || 1);
        setTrackedTotalRecords(response.totalRecords || 0);
      }
    } catch (error) {
      console.error("Error fetching tracked cases:", error);
    } finally {
      setLoadingTracked(false);
    }
  };

  const handleTrackedSearchSubmit = (e) => {
    e.preventDefault();
    setTrackedPage(1);
    fetchTrackedCases(1, trackedSearch);
  };

  const fetchSingleTrackedDetails = async (id) => {
    setSelectedTrackedId(id);
    setLoadingTrackedDetails(true);
    setTrackedDetails(null);
    try {
      const response = await HospitalAPI.getTrackedCaseDetails(id);
      if (response?.success) {
        setTrackedDetails(response.data);
      } else {
        alert(response?.message || 'Could not fetch case details.');
      }
    } catch (error) {
      console.error("Error loading track details:", error);
      alert('Error loading case details.');
    } finally {
      setLoadingTrackedDetails(false);
    }
  };

  // Doctor Memoized Helpers supporting assignedDoctor & doctorId
  const currentDocId = useMemo(() => {
    if (!selectedAdmission) return null;
    const doc = selectedAdmission.assignedDoctor || selectedAdmission.doctorId;
    if (!doc) return null;
    return doc._id || doc;
  }, [selectedAdmission]);

  const currentDocName = useMemo(() => {
    if (!selectedAdmission) return 'Unassigned';
    const doc = selectedAdmission.assignedDoctor || selectedAdmission.doctorId;
    if (!doc) return 'Unassigned';
    if (doc.name) return doc.name;
    const found = doctorList.find(d => d._id === (doc._id || doc));
    return found ? found.name : 'Assigned Doctor';
  }, [selectedAdmission, doctorList]);

  const availableReplacementDoctors = useMemo(() => {
    if (!currentDocId) return doctorList;
    return doctorList.filter(doc => doc._id !== currentDocId);
  }, [doctorList, currentDocId]);

  // Tab Filtering logic (Admissions)
  const pendingAdmissions = useMemo(() => {
    return admissions.filter(adm => (adm.status || '').toLowerCase() === 'hospital-pending');
  }, [admissions]);

  const activeAdmissions = useMemo(() => {
    return admissions.filter(adm => {
      const statusLower = (adm.status || '').toLowerCase();
      return statusLower === 'confirmed' || statusLower === 'in-progress';
    });
  }, [admissions]);

  const cancelledAdmissions = useMemo(() => {
    return admissions.filter(adm => {
      const statusLower = (adm.status || '').toLowerCase();
      return statusLower.startsWith('cancelled') || statusLower.startsWith('rejected');
    });
  }, [admissions]);

  const filteredItems = useMemo(() => {
    if (activeSubTab === 'pending') return pendingAdmissions;
    if (activeSubTab === 'active') return activeAdmissions;
    if (activeSubTab === 'cancelled') return cancelledAdmissions;
    return [];
  }, [activeSubTab, pendingAdmissions, activeAdmissions, cancelledAdmissions]);

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  
  const currentItems = useMemo(() => {
    return filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredItems, indexOfFirstItem, indexOfLastItem]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));
  }, [filteredItems, itemsPerPage]);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // --- ACTIONS HANDLERS ---
  const startBedTransferFlow = async () => {
    setIsProcessing(true);
    try {
      const response = await HospitalAPI.getWardsList();
      if (response?.success) {
        setTransferWardList(response.data || []);
        setSelectedTransferWard(null);
        setTransferBedList([]);
        setSelectedTransferBed(null);
        setIsTransferModalOpen(true);
      } else {
        alert(response?.message || 'Could not fetch wards list.');
      }
    } catch (error) {
      alert('Error fetching wards.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectTransferWard = async (ward) => {
    setSelectedTransferWard(ward);
    setLoadingTransferBeds(true);
    setSelectedTransferBed(null);
    try {
      const response = await HospitalAPI.getWardBeds(ward._id);
      if (response?.success) {
        setTransferBedList(response.data || []);
      } else {
        alert(response?.message || 'Could not fetch beds.');
      }
    } catch (error) {
      alert('Error fetching beds.');
    } finally {
      setLoadingTransferBeds(false);
    }
  };

  const handleCompleteBedTransfer = async () => {
    if (!selectedTransferBed) return alert('Please select a new bed!');
    if (!confirm(`Are you sure you want to transfer this patient to Bed: ${selectedTransferBed.bedNumber} in ${selectedTransferWard.name}?`)) return;

    setIsProcessing(true);
    try {
      const payload = {
        appointmentId: selectedAdmission._id,
        newBedId: selectedTransferBed._id
      };
      
      const response = await HospitalAPI.transferBed(payload);
      if (response?.success) {
        alert(response.message || 'Patient successfully transferred.');
        setIsTransferModalOpen(false);
        setSelectedAdmission(null);
        fetchAdmissions();
      } else {
        alert('Error: ' + (response.message || 'Failed to complete bed transfer.'));
      }
    } catch (error) {
      alert('An unexpected error occurred during the bed transfer.');
    } finally {
      setIsProcessing(false);
    }
  };

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

  const startReassignDoctorFlow = async () => {
    setIsProcessing(true);
    try {
      const response = await HospitalAPI.getHospitalDoctors();
      if (response?.success) {
        setDoctorList(response.data || []);
        setSelectedDoctorId('');
        setReassignReason('');
        setActiveAction('reassign-doctor');
      } else {
        alert(response?.message || 'Could not fetch doctors list.');
      }
    } catch (error) { alert('Error fetching doctors.'); } 
    finally { setIsProcessing(false); }
  };

  const handleReassignDoctor = async (e) => {
    e.preventDefault();
    if (!selectedDoctorId) return alert('Please select a new doctor!');
    setIsProcessing(true);
    try {
      const payload = { 
        appointmentId: selectedAdmission._id, 
        newDoctorId: selectedDoctorId,
        reason: reassignReason || 'Reassigned from Hospital Admin Panel'
      };
      const response = await HospitalAPI.reassignDoctor(payload);
      if (response?.success) {
        alert('Doctor assigned successfully!');
        setActiveAction(null);
        setSelectedAdmission(null); 
        fetchAdmissions(); 
      } else { alert('Error: ' + response.message); }
    } catch (error) { alert('Something went wrong while reassigning doctor!'); } 
    finally { setIsProcessing(false); }
  };

  const startAssignDriverFlow = async () => {
    setIsProcessing(true);
    try {
      const response = await HospitalAPI.getAvailableDrivers();
      if (response?.success) {
        setDriverList(response.data || []);
        setAmbulanceFlow({
          step: 1,
          selectedDriver: null,
          selectedLocation: null,
          customLocationText: ''
        });
        setActiveAction('ambulance');
      } else { 
        alert(response?.message || 'Could not fetch available drivers.'); 
      }
    } catch (error) { 
      alert('Error fetching drivers.'); 
    } finally { 
      setIsProcessing(false); 
    }
  };

  const handleSelectAmbulance = (driver) => {
    setAmbulanceFlow(prev => ({
      ...prev,
      step: 2,
      selectedDriver: driver,
      selectedLocation: null,
      customLocationText: ''
    }));
  };

  const handleSelectDropLocation = (loc) => {
    setAmbulanceFlow(prev => ({
      ...prev,
      selectedLocation: loc,
      customLocationText: ''
    }));
  };

  const handleDispatchAmbulance = async (e) => {
    e.preventDefault();
    const { selectedDriver, selectedLocation, customLocationText } = ambulanceFlow;
    
    if (!selectedDriver) return alert('Please select an ambulance first!');
    if (!selectedLocation) return alert('Please select a drop location!');
    if (selectedLocation.id === 'custom' && !customLocationText.trim()) {
      return alert('Please enter the custom destination address!');
    }

    setIsProcessing(true);
    try {
      const basePrice = selectedDriver.ambulanceId?.price || selectedDriver.price || selectedDriver.charge || 1500;
      const surgePrice = selectedLocation.surcharge;
      const destinationName = selectedLocation.id === 'custom' ? "Custom Destination Address" : selectedLocation.name;
      const customAddressText = selectedLocation.id === 'custom' ? customLocationText.trim() : "";

      const payload = { 
        appointmentId: selectedAdmission._id, 
        ambulanceId: selectedDriver.ambulanceId?._id || selectedDriver.ambulanceId || selectedDriver._id,
        destinationName: destinationName,
        customAddressText: customAddressText,
        surgePrice: surgePrice,
        baseAmbulanceRate: basePrice
      };

      const response = await HospitalAPI.dispatchAmbulance(payload);
      if (response?.success) {
        alert("Ambulance successfully dispatched. Cost appended to patient's hospital invoice.");
        setActiveAction(null);
        setSelectedAdmission(null); 
        fetchAdmissions(); 
      } else { 
        alert('Error: ' + (response.message || "Failed to dispatch ambulance")); 
      }
    } catch (error) { 
      alert('Failed to dispatch ambulance.'); 
    } finally { 
      setIsProcessing(false); 
    }
  };

  const startRejectFlow = () => {
    setRejectionReason('');
    setActiveAction('reject');
  };

  const handleRejectAdmission = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) return alert('Please provide a reason for rejection.');
    
    setIsProcessing(true);
    try {
      const response = await HospitalAPI.rejectAdmission(selectedAdmission._id, rejectionReason.trim());
      if (response?.success) {
        alert('Admission has been rejected.');
        setActiveAction(null);
        setSelectedAdmission(null);
        fetchAdmissions();
      } else {
        alert('Error: ' + (response?.message || 'Failed to complete rejection.'));
      }
    } catch (error) {
      alert('Could not process rejection at this time.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDirectReject = (e, adm) => {
    e.stopPropagation();
    setSelectedAdmission(adm);
    setRejectionReason('');
    setActiveAction('reject');
  };

  return (
    <div className="p-4 md:p-6 max-w-[90rem] mx-auto font-sans min-h-screen relative bg-gray-50/50">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-800 tracking-tight">Hospital Admissions</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Manage ward allocation, physician scheduling, and entry authorizations.</p>
        </div>
        <div className="mt-4 md:mt-0 bg-[#08B36A]/10 px-5 py-2.5 rounded-xl border border-[#08B36A]/20 flex items-center gap-3">
           <span className="text-2xl">🏥</span>
           <div>
              <p className="text-[10px] font-black text-[#08B36A] uppercase tracking-widest leading-none">Total Admissions</p>
              <p className="text-lg font-black text-[#08B36A] leading-none mt-1">{admissions.length}</p>
           </div>
        </div>
      </div>

      {/* SUB-TABS NAVIGATION */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-100 pb-2">
        {[
          { id: 'pending', label: 'Pending Request', count: pendingAdmissions.length, color: 'bg-amber-100 text-amber-800' },
          { id: 'active', label: 'Confirmed / Active', count: activeAdmissions.length, color: 'bg-emerald-100 text-emerald-800' },
          { id: 'cancelled', label: 'Cancelled / Rejected', count: cancelledAdmissions.length, color: 'bg-rose-100 text-rose-800' },
          { id: 'tracked', label: 'Tracked Cases', count: trackedTotalRecords, color: 'bg-[#08B36A]/10 text-[#08B36A]' },
        ].map(sub => (
          <button
            key={sub.id}
            onClick={() => setActiveSubTab(sub.id)}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
              activeSubTab === sub.id 
                ? 'bg-[#08B36A] text-white shadow-md' 
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span>{sub.label}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              activeSubTab === sub.id ? 'bg-white/20 text-white' : sub.color
            }`}>
              {sub.count}
            </span>
          </button>
        ))}
      </div>

      {/* CONDITIONAL RENDERING OF CONTENT */}
      {activeSubTab === 'tracked' ? (
        // --- TRACKED CASES LAYOUT ---
        <div className="space-y-4">
          
          {/* SEARCH & FILTERS FOR TRACKED CASES */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
            <form onSubmit={handleTrackedSearchSubmit} className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search by Booking ID or Patient Name..."
                value={trackedSearch}
                onChange={(e) => setTrackedSearch(e.target.value)}
                className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#08B36A] w-full sm:w-80"
              />
              <button
                type="submit"
                className="bg-[#08B36A] hover:bg-[#079E5E] text-white text-xs font-black px-4 py-2 rounded-xl transition-all shrink-0"
              >
                Search
              </button>
              {trackedSearch && (
                <button
                  type="button"
                  onClick={() => { setTrackedSearch(''); fetchTrackedCases(1, ''); }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-black px-3 py-2 rounded-xl transition-all"
                >
                  Clear
                </button>
              )}
            </form>

            <div className="text-xs font-bold text-gray-500">
              Total Tracked Cases: <span className="text-[#08B36A] font-black">{trackedTotalRecords}</span>
            </div>
          </div>

          {loadingTracked ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <SpinnerIcon className="w-10 h-10 text-[#08B36A] animate-spin" />
              <p className="text-sm text-gray-500 font-bold">Retrieving Tracked Cases...</p>
            </div>
          ) : trackedCases.length === 0 ? (
            <div className="text-center bg-white p-16 rounded-3xl shadow-sm border-2 border-dashed border-gray-200">
              <div className="w-20 h-20 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center text-4xl mb-4 mx-auto">📋</div>
              <p className="text-gray-700 text-lg font-black">No Tracked Cases Found</p>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse whitespace-nowrap">
                    <thead>
                      <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-500 text-[10px] uppercase tracking-[0.15em] font-black">
                        <th className="px-5 py-4">Booking ID / Triage</th>
                        <th className="px-5 py-4">Patient Profile</th>
                        <th className="px-5 py-4">Assigned Ward & Bed</th>
                        <th className="px-5 py-4">Attending Doctor</th>
                        <th className="px-5 py-4">Billing & Amount</th>
                        <th className="px-5 py-4">Status</th>
                        <th className="px-5 py-4 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {trackedCases.map((item) => {
                        const patient = item.patientDetails || item.patientProfile || item.patients?.[0] || {};
                        const fallbackName = patient.patientName || patient.name || item.patientName || 'Unknown Patient';
                        const fallbackAge = patient.age !== undefined ? patient.age : (patient.patientAge || 'N/A');
                        const fallbackGender = patient.gender || '';
                        const bloodGroup = patient.bloodGroup;
                        const reason = patient.reasonForVisit;

                        const bed = item.bedDetails || {};
                        const doctor = item.assignedDoctor || item.doctorId || null;
                        const billing = item.billing || {};
                        const totalAmt = billing.totalAmount !== undefined ? billing.totalAmount : (item.totalAmount || 0);
                        const paymentStat = billing.paymentStatus || item.paymentStatus || 'Pending';
                        const paymentMeth = billing.paymentMethod || item.paymentMethod;

                        return (
                          <tr 
                            key={item._id || item.appointmentId} 
                            className="hover:bg-slate-50 transition-colors duration-200 cursor-pointer"
                            onClick={() => fetchSingleTrackedDetails(item._id || item.appointmentId)}
                          >
                            {/* Booking ID & Triage */}
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[11px] font-extrabold text-gray-800 bg-gray-50 px-2.5 py-1 rounded border border-gray-200">
                                  #{item.bookingId || item.caseDetails?.bookingId || 'N/A'}
                                </span>
                                {item.triageLevel && (
                                  <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border ${
                                    item.triageLevel === 'Emergency' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-slate-100 text-slate-600 border-slate-200'
                                  }`}>
                                    {item.triageLevel}
                                  </span>
                                )}
                              </div>
                              {item.stayDuration && (
                                <p className="text-[9px] font-bold text-gray-400 mt-1">
                                  Stay: {item.stayDuration} Day{item.stayDuration > 1 ? 's' : ''}
                                </p>
                              )}
                            </td>

                            {/* Patient Profile */}
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                {patient.profilePic ? (
                                  <img 
                                    src={getFormattedImageUrl(patient.profilePic)} 
                                    alt={fallbackName} 
                                    className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0"
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-lg bg-[#08B36A]/10 text-[#08B36A] flex items-center justify-center font-black text-xs border border-[#08B36A]/20 shrink-0">
                                    {fallbackName.charAt(0) || '?'}
                                  </div>
                                )}
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <p className="text-xs font-extrabold text-gray-900 leading-none">{fallbackName}</p>
                                    {bloodGroup && (
                                      <span className="text-[8px] font-black text-rose-600 bg-rose-50 px-1 py-0.2 rounded border border-rose-100">
                                        {bloodGroup}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[10px] font-bold text-gray-400 mt-1">
                                    {fallbackGender} {fallbackAge !== 'N/A' ? `• ${fallbackAge}y` : ''} {patient.relation ? `(${patient.relation})` : ''}
                                  </p>
                                  {reason && (
                                    <p className="text-[9px] font-semibold text-slate-500 truncate max-w-[150px] mt-0.5" title={reason}>
                                      "{reason}"
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Assigned Ward & Bed */}
                            <td className="px-5 py-4">
                              <div className="flex flex-col items-start gap-1">
                                <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase">
                                  {bed.wardName || 'Unassigned Ward'}
                                </span>
                                <span className="text-xs font-black text-emerald-700">
                                  Bed: {bed.bedNumber || 'Unassigned'}
                                </span>
                              </div>
                            </td>

                            {/* Attending Doctor */}
                            <td className="px-5 py-4">
                              {doctor?.name ? (
                                <div className="flex items-center gap-2">
                                  {doctor.profileImage && (
                                    <img 
                                      src={getFormattedImageUrl(doctor.profileImage)} 
                                      alt={doctor.name} 
                                      className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
                                    />
                                  )}
                                  <div>
                                    <p className="text-xs font-bold text-gray-800">
                                      {doctor.name.startsWith('Dr.') ? doctor.name : `Dr. ${doctor.name}`}
                                    </p>
                                    <p className="text-[9px] font-bold text-emerald-600 uppercase">
                                      {doctor.speciality || 'Attending Physician'}
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-[11px] text-gray-400 italic">Unassigned</span>
                              )}
                            </td>

                            {/* Billing & Amount */}
                            <td className="px-5 py-4">
                              <p className="text-xs font-extrabold text-gray-800">₹{totalAmt}</p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className={`text-[9px] font-black uppercase ${paymentStat === 'Paid' ? 'text-[#08B36A]' : 'text-amber-600'}`}>
                                  {paymentStat}
                                </span>
                                {paymentMeth && (
                                  <span className="text-[8px] font-bold text-gray-400 uppercase">
                                    • {paymentMeth}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Status */}
                            <td className="px-5 py-4">
                              <span className={`text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-full border ${getStatusColor(item.status || item.caseDetails?.status)}`}>
                                {item.status || item.caseDetails?.status || 'In-Progress'}
                              </span>
                            </td>

                            {/* Action */}
                            <td className="px-5 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                              <button 
                                onClick={() => fetchSingleTrackedDetails(item._id || item.appointmentId)}
                                className="bg-[#08B36A] hover:bg-[#079E5E] text-white text-[10px] font-black px-4 py-2 rounded-lg transition-all shadow-sm"
                              >
                                View Super Details
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SERVER PAGINATION FOR TRACKED CASES */}
              <div className="mt-6 flex flex-col sm:flex-row justify-between items-center bg-white px-5 py-4 rounded-xl border border-gray-100 shadow-sm gap-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Showing page <span className="text-[#08B36A]">{trackedPage}</span> of <span className="text-[#08B36A]">{trackedTotalPages}</span> pages
                </p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setTrackedPage(prev => Math.max(1, prev - 1))} 
                    disabled={trackedPage === 1}
                    className="px-4 py-2 text-[10px] font-black uppercase tracking-widest border border-gray-200 rounded-lg hover:bg-[#08B36A] hover:text-white disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-gray-400 transition-all text-gray-600"
                  >
                    Prev
                  </button>
                  {[...Array(trackedTotalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setTrackedPage(i + 1)}
                      className={`w-9 h-9 text-[10px] font-black rounded-lg border transition-all ${trackedPage === i + 1 ? 'bg-[#08B36A] text-white border-[#08B36A]' : 'bg-white text-gray-600 border-gray-100 hover:border-[#08B36A]'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button 
                    onClick={() => setTrackedPage(prev => Math.min(trackedTotalPages, prev + 1))} 
                    disabled={trackedPage === trackedTotalPages}
                    className="px-4 py-2 text-[10px] font-black uppercase tracking-widest border border-gray-200 rounded-lg hover:bg-[#08B36A] hover:text-white disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-gray-400 transition-all text-gray-600"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        // --- STANDARD ADMISSIONS LAYOUT ---
        loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <SpinnerIcon className="w-10 h-10 text-[#08B36A] animate-spin" />
            <p className="text-sm text-gray-500 font-bold">Syncing Records...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center bg-white p-16 rounded-3xl shadow-sm border-2 border-dashed border-gray-200">
            <div className="w-20 h-20 bg-[#08B36A]/10 text-[#08B36A] rounded-full flex items-center justify-center text-4xl mb-4 mx-auto shadow-inner">🛏️</div>
            <p className="text-gray-700 text-lg font-black">No Admissions Found</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto scrollbar-hide">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-500 text-[10px] uppercase tracking-[0.15em] font-black">
                      <th className="px-5 py-4">ID</th>
                      <th className="px-5 py-4">Patient Profile</th>
                      <th className="px-5 py-4">Physician Assignee</th>
                      <th className="px-5 py-4">Amount Paid</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {currentItems.map((adm) => {
                      const patient = adm.patientDetails || adm.patients?.[0] || {};
                      const patientName = patient.patientName || patient.name || 'Unknown';
                      const patientAge = patient.age !== undefined ? patient.age : patient.patientAge;
                      const patientGender = patient.gender || '';
                      
                      const doctor = adm.assignedDoctor || adm.doctorId || null;

                      const totalAmt = adm.billing?.totalAmount !== undefined ? adm.billing.totalAmount : adm.totalAmount || 0;
                      const paymentStat = adm.billing?.paymentStatus || adm.paymentStatus || 'Pending';

                      const isEmergency = adm.triageLevel === 'Emergency';
                      const isPending = (adm.status || '').toLowerCase() === 'hospital-pending';
                      const cancelReason = adm.cancellationDetails?.reason || adm.cancellationReason || adm.rejectReason || adm.rescheduleReason;

                      return (
                        <tr 
                          key={adm._id} 
                          className="hover:bg-slate-50 transition-colors duration-200 group cursor-pointer"
                          onClick={() => { setSelectedAdmission(adm); setActiveAction(null); }}
                        >
                          <td className="px-5 py-3.5">
                            <span className="text-[11px] font-extrabold text-gray-600 bg-gray-50 px-2.5 py-1 rounded border border-gray-200">
                              #{adm.bookingId}
                            </span>
                          </td>

                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-[#08B36A]/10 text-[#08B36A] flex items-center justify-center font-black text-xs border border-[#08B36A]/20 shrink-0">
                                {patientName.charAt(0) || '?'}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <p className="text-xs font-extrabold text-gray-900 leading-none">{patientName}</p>
                                  {isEmergency && <span className="text-red-500 text-[9px] font-black bg-red-50 px-1.5 py-0.5 rounded border border-red-100 uppercase tracking-wider">Emergency</span>}
                                </div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mt-1">
                                  {patientGender} {patientAge !== undefined ? `• ${patientAge}y` : ''}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-3.5">
                            {doctor?.name ? (
                              <p className="text-xs font-bold text-gray-700">Dr. {doctor.name}</p>
                            ) : (
                              <span className="text-[11px] text-gray-400 italic">Unassigned</span>
                            )}
                          </td>

                          <td className="px-5 py-3.5">
                            <p className="text-xs font-extrabold text-gray-800">₹{totalAmt}</p>
                            <p className={`text-[9px] font-black uppercase mt-0.5 ${paymentStat === 'Paid' ? 'text-[#08B36A]' : 'text-amber-600'}`}>
                              {paymentStat}
                            </p>
                          </td>

                          <td className="px-5 py-3.5">
                            <div className="flex flex-col items-start gap-1">
                              <span className={`text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-full border ${getStatusColor(adm.status)}`}>
                                {adm.status}
                              </span>
                              {activeSubTab === 'cancelled' && cancelReason && (
                                <p className="text-[10px] text-rose-600 font-bold italic max-w-xs truncate" title={cancelReason}>
                                  "{cancelReason}"
                                </p>
                              )}
                            </div>
                          </td>

                          <td className="px-5 py-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-center items-center gap-2">
                              <button 
                                onClick={() => { setSelectedAdmission(adm); setActiveAction(null); }}
                                className="bg-white border border-gray-200 hover:bg-slate-100 text-gray-700 text-[10px] font-black px-3.5 py-1.5 rounded-lg transition-all"
                              >
                                Manage
                              </button>
                              {isPending && (
                                <button 
                                  onClick={(e) => handleDirectReject(e, adm)}
                                  className="bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 border border-rose-100 text-[10px] font-black px-3.5 py-1.5 rounded-lg transition-all"
                                >
                                  Reject
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* STANDARD ADMISSIONS CLIENT PAGINATION */}
            <div className="mt-6 flex flex-col sm:flex-row justify-between items-center bg-white px-5 py-4 rounded-xl border border-gray-100 shadow-sm gap-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Showing <span className="text-[#08B36A]">{filteredItems.length === 0 ? 0 : indexOfFirstItem + 1}</span> to <span className="text-[#08B36A]">{Math.min(indexOfLastItem, filteredItems.length)}</span> of <span className="text-[#08B36A]">{filteredItems.length}</span> records
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
        )
      )}

      {/* ADMISSION DETAILS & ACTION MODAL */}
      <AdmissionDetailsModal
        admission={selectedAdmission}
        onClose={() => { setSelectedAdmission(null); setActiveAction(null); }}
        activeAction={activeAction}
        setActiveAction={setActiveAction}
        doctorList={doctorList}
        selectedDoctorId={selectedDoctorId}
        setSelectedDoctorId={setSelectedDoctorId}
        currentDocName={currentDocName}
        reassignReason={reassignReason}
        setReassignReason={setReassignReason}
        availableReplacementDoctors={availableReplacementDoctors}
        handleAssignDoctor={handleAssignDoctor}
        handleReassignDoctor={handleReassignDoctor}
        startAssignDoctorFlow={startAssignDoctorFlow}
        startReassignDoctorFlow={startReassignDoctorFlow}
        ambulanceFlow={ambulanceFlow}
        setAmbulanceFlow={setAmbulanceFlow}
        driverList={driverList}
        handleSelectAmbulance={handleSelectAmbulance}
        handleSelectDropLocation={handleSelectDropLocation}
        handleDispatchAmbulance={handleDispatchAmbulance}
        startAssignDriverFlow={startAssignDriverFlow}
        startBedTransferFlow={startBedTransferFlow}
        startRejectFlow={startRejectFlow}
        rejectionReason={rejectionReason}
        setRejectionReason={setRejectionReason}
        handleRejectAdmission={handleRejectAdmission}
        isProcessing={isProcessing}
      />

      {/* BED TRANSFER MODAL */}
      <BedAllocationModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        textWards={transferWardList}
        wards={transferWardList}
        selectedWard={selectedTransferWard}
        beds={transferBedList}
        loadingBeds={loadingTransferBeds}
        onSelectWard={handleSelectTransferWard}
        onSelectBed={setSelectedTransferBed}
        selectedBed={selectedTransferBed}
        onConfirmTransfer={handleCompleteBedTransfer}
        isProcessing={isProcessing}
      />

      {/* UNIFIED "SUPER DETAILS" CASE FILE MODAL */}
      {selectedTrackedId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-6xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-gray-100">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 via-gray-900 to-slate-900 text-white px-6 py-5 flex justify-between items-center shrink-0 border-b border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#08B36A]/20 border border-[#08B36A]/40 flex items-center justify-center text-xl">
                  📁
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] font-black text-[#08B36A] uppercase tracking-widest leading-none">
                      Hospital Case Record
                    </p>
                    {trackedDetails?.caseDetails?.status && (
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${getStatusColor(trackedDetails.caseDetails.status)}`}>
                        {trackedDetails.caseDetails.status}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base md:text-lg font-black tracking-tight mt-1 text-slate-100">
                    Case #{trackedDetails?.caseDetails?.bookingId || 'N/A'}
                  </h3>
                </div>
              </div>
              <button 
                onClick={() => setSelectedTrackedId(null)}
                className="bg-white/10 hover:bg-white/20 text-white rounded-full p-2.5 text-xs transition-all font-bold focus:outline-none"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 md:p-6 overflow-y-auto space-y-6 bg-slate-50/60">
              {loadingTrackedDetails ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <SpinnerIcon className="w-10 h-10 text-[#08B36A] animate-spin" />
                  <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Loading Live Case Timeline...</p>
                </div>
              ) : trackedDetails ? (
                (() => {
                  const caseDetails = trackedDetails.caseDetails || {};
                  const patient = caseDetails.patientProfile || caseDetails.patientDetails || {};
                  const bed = caseDetails.bedDetails || {};
                  const timeline = trackedDetails.treatmentTimeline || [];

                  return (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      
                      {/* Left Column: Patient Profile & Bed Allocation Info (4 cols) */}
                      <div className="lg:col-span-4 space-y-5">
                        
                        {/* Patient Profile Card */}
                        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Patient Demographics</h4>
                            <span className="text-xs font-black bg-rose-50 text-rose-600 px-2 py-0.5 rounded border border-rose-100">
                              {patient.bloodGroup ? `Blood: ${patient.bloodGroup}` : 'Blood: N/A'}
                            </span>
                          </div>

                          <div className="space-y-3.5">
                            <div className="flex items-center gap-3">
                              {patient.profilePic && (
                                <img 
                                  src={getFormattedImageUrl(patient.profilePic)} 
                                  alt="Avatar" 
                                  className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                                />
                              )}
                              <div>
                                <p className="text-base font-black text-slate-800">
                                  {patient.patientName || patient.name || 'Unknown Patient'}
                                </p>
                                <p className="text-xs font-bold text-slate-500 mt-0.5">
                                  {patient.age ? `${patient.age} yrs` : ''} {patient.gender ? `• ${patient.gender}` : ''} {patient.relation ? `(${patient.relation})` : ''}
                                </p>
                              </div>
                            </div>

                            {/* Reason for visit */}
                            <div className="bg-amber-50/80 border border-amber-200/80 p-3 rounded-xl">
                              <p className="text-[10px] font-black uppercase tracking-wider text-amber-700">Reason For Admission</p>
                              <p className="text-xs font-extrabold text-amber-900 mt-1">
                                {patient.reasonForVisit || 'Not specified'}
                              </p>
                            </div>

                            {/* Contact & Account details */}
                            <div className="grid grid-cols-2 gap-2 text-left pt-1">
                              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                <p className="text-[9px] font-bold text-slate-400 uppercase">Contact Phone</p>
                                <p className="text-xs font-extrabold text-slate-700 mt-0.5">{patient.phone || 'N/A'}</p>
                              </div>
                              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                <p className="text-[9px] font-bold text-slate-400 uppercase">Account Holder</p>
                                <p className="text-xs font-extrabold text-slate-700 mt-0.5 truncate" title={patient.accountHolderName}>
                                  {patient.accountHolderName || 'N/A'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Bed Allocation Card */}
                        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
                          <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-3 mb-4">
                            Bed & Ward Allocation
                          </h4>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                              <div>
                                <p className="text-[10px] font-bold text-emerald-600 uppercase">Assigned Bed</p>
                                <p className="text-sm font-black text-emerald-900">{bed.bedNumber || 'Unassigned'}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] font-bold text-emerald-600 uppercase">Daily Rate</p>
                                <p className="text-sm font-black text-emerald-900">₹{bed.pricePerDay ? `${bed.pricePerDay}/day` : '0'}</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-left">
                              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                <p className="text-[9px] font-bold text-slate-400 uppercase">Ward Name</p>
                                <p className="text-xs font-extrabold text-slate-700 mt-0.5">{bed.wardId?.name || bed.wardName || 'General Ward'}</p>
                              </div>
                              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                <p className="text-[9px] font-bold text-slate-400 uppercase">Ward Type</p>
                                <p className="text-xs font-extrabold text-slate-700 mt-0.5">{bed.wardId?.type || bed.wardType || 'Standard'}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Appointment Internal Reference */}
                        <div className="bg-slate-100/70 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-500 font-medium">
                          <p className="font-bold text-slate-600">Appointment ID:</p>
                          <p className="font-mono text-[10px] text-slate-400 truncate select-all">{caseDetails.appointmentId || caseDetails._id}</p>
                        </div>

                      </div>

                      {/* Right Column: Full Treatment Timeline & Clinical Logs (8 cols) */}
                      <div className="lg:col-span-8 space-y-4">
                        <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200/80 shadow-sm">
                          <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
                            <div>
                              <h4 className="text-sm font-black uppercase tracking-wider text-slate-800">
                                Treatment & Clinical Timeline
                              </h4>
                              <p className="text-[11px] font-medium text-slate-400 mt-0.5">Chronological record of specialist notes, rounds, and medications</p>
                            </div>
                            <span className="bg-[#08B36A]/10 text-[#08B36A] font-black text-xs px-3 py-1 rounded-full border border-[#08B36A]/20">
                              {timeline.length} Milestone{timeline.length === 1 ? '' : 's'}
                            </span>
                          </div>

                          {timeline.length === 0 ? (
                            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                              <p className="text-slate-400 text-xs font-bold">No timeline logs recorded for this patient yet.</p>
                            </div>
                          ) : (
                            <div className="relative border-l-2 border-slate-200 ml-4 md:ml-6 space-y-8 py-2">
                              {timeline.map((event, index) => {
                                const badge = getEventBadgeStyle(event.eventType);
                                const eventTime = event.timestamp ? new Date(event.timestamp).toLocaleString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                }) : 'Time not logged';

                                return (
                                  <div key={index} className="relative pl-6 md:pl-8 group">
                                    {/* Timeline Marker Dot */}
                                    <div className="absolute -left-[17px] top-1 w-8 h-8 rounded-full bg-white border-2 border-slate-300 group-hover:border-[#08B36A] shadow-sm flex items-center justify-center text-sm transition-all">
                                      {badge.icon}
                                    </div>

                                    {/* Event Card */}
                                    <div className="bg-slate-50/80 group-hover:bg-slate-50 transition-colors p-4 md:p-5 rounded-2xl border border-slate-200/90 space-y-3.5 shadow-sm">
                                      
                                      {/* Header: Category & Timestamp */}
                                      <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                          <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md border ${badge.bg} ${badge.text} ${badge.border}`}>
                                            {event.category || event.eventType}
                                          </span>
                                          {event.patientCondition && (
                                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${getStatusColor(event.patientCondition)}`}>
                                              Condition: {event.patientCondition}
                                            </span>
                                          )}
                                        </div>
                                        <span className="text-[11px] font-bold text-slate-400">
                                          🕒 {eventTime}
                                        </span>
                                      </div>

                                      {/* Doctor Card */}
                                      {event.doctor && (
                                        <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-slate-200/60">
                                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 font-black text-xs">
                                            👨‍⚕️
                                          </div>
                                          <div>
                                            <p className="text-xs font-black text-slate-800 leading-tight">{event.doctor.name}</p>
                                            <p className="text-[10px] font-bold text-slate-400">
                                              {event.doctor.speciality} {event.doctor.role ? `• ${event.doctor.role}` : ''}
                                            </p>
                                          </div>
                                        </div>
                                      )}

                                      {/* Clinical Observation */}
                                      {event.observation && (
                                        <div className="bg-white p-3.5 rounded-xl border border-slate-200/70">
                                          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Clinical Observation</p>
                                          <p className="text-xs font-semibold text-slate-700 italic leading-relaxed">
                                            "{event.observation}"
                                          </p>
                                        </div>
                                      )}

                                      {/* Medication Order Box */}
                                      {event.medication && (
                                        <div className="bg-blue-50/60 border border-blue-200/80 p-3.5 rounded-xl space-y-2">
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                              <span className="text-base">💊</span>
                                              <p className="text-xs font-black text-blue-900">{event.medication.name}</p>
                                            </div>
                                            {event.medication.status && (
                                              <span className="text-[9px] font-black uppercase bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                                {event.medication.status}
                                              </span>
                                            )}
                                          </div>
                                          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                                            <p className="text-blue-800 font-medium">
                                              <span className="font-bold text-blue-950">Dosage:</span> {event.medication.dosage || 'N/A'}
                                            </p>
                                            <p className="text-blue-800 font-medium">
                                              <span className="font-bold text-blue-950">Frequency:</span> {event.medication.frequency || 'N/A'}
                                            </p>
                                          </div>
                                        </div>
                                      )}

                                      {/* Vitals Snapshot */}
                                      {event.vitals && (
                                        <div className="pt-1">
                                          <p className="text-[9px] font-black uppercase tracking-wider text-slate-400 mb-2">Recorded Vitals at check</p>
                                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                            <div className="bg-white p-2 rounded-lg border border-slate-200 text-center">
                                              <p className="text-[8px] font-bold text-slate-400 uppercase">BP</p>
                                              <p className="text-xs font-black text-slate-800 mt-0.5">{event.vitals.bp || '—'}</p>
                                            </div>
                                            <div className="bg-white p-2 rounded-lg border border-slate-200 text-center">
                                              <p className="text-[8px] font-bold text-slate-400 uppercase">Pulse</p>
                                              <p className="text-xs font-black text-slate-800 mt-0.5">{event.vitals.pulse ? `${event.vitals.pulse} bpm` : '—'}</p>
                                            </div>
                                            <div className="bg-white p-2 rounded-lg border border-slate-200 text-center">
                                              <p className="text-[8px] font-bold text-slate-400 uppercase">Temp</p>
                                              <p className="text-xs font-black text-slate-800 mt-0.5">{event.vitals.temp ? `${event.vitals.temp}°F` : '—'}</p>
                                            </div>
                                            <div className="bg-white p-2 rounded-lg border border-slate-200 text-center">
                                              <p className="text-[8px] font-bold text-slate-400 uppercase">SpO2</p>
                                              <p className="text-xs font-black text-emerald-600 mt-0.5">{event.vitals.spo2 ? `${event.vitals.spo2}%` : '—'}</p>
                                            </div>
                                          </div>
                                        </div>
                                      )}

                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  );
                })()
              ) : (
                <div className="text-center py-12">
                  <p className="text-sm font-bold text-gray-500">Case details could not be retrieved at this moment.</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-white border-t border-gray-200 px-6 py-4 flex justify-end shrink-0">
              <button 
                onClick={() => setSelectedTrackedId(null)}
                className="bg-slate-900 hover:bg-black text-white text-xs font-black px-6 py-2.5 rounded-xl transition-all shadow-md"
              >
                Close Case File
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default ManageAdmissionsPage;