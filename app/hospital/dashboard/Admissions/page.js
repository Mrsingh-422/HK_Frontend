"use client";

import React, { useState, useEffect, useMemo } from 'react';
import HospitalAPI from '@/app/services/HospitalAPI';
import BedAllocationModal from './components/BedAllocationModal';
import AdmissionDetailsModal from './components/AdmissionDetailsModal';
import { SpinnerIcon } from './components/InfoSection';

const getStatusColor = (status) => {
  const statusLower = (status || '').toLowerCase();
  if (statusLower === 'confirmed' || statusLower === 'in-progress' || statusLower === 'active') {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  }
  if (statusLower === 'hospital-pending') {
    return 'bg-amber-50 text-amber-700 border-amber-200';
  }
  if (statusLower.startsWith('cancelled') || statusLower.startsWith('rejected')) {
    return 'bg-rose-50 text-rose-700 border-rose-200';
  }
  return 'bg-slate-50 text-slate-700 border-slate-200';
};

const ManageAdmissionsPage = () => {
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState('pending'); // 'pending', 'active', 'cancelled', 'tracked'
  
  // Pagination State for standard admissions
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Tracked Cases State
  const [trackedCases, setTrackedCases] = useState([]);
  const [trackedPage, setTrackedPage] = useState(1);
  const [trackedTotalPages, setTrackedTotalPages] = useState(1);
  const [trackedTotalRecords, setTrackedTotalRecords] = useState(0);
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

  // Fetch when tab changes or tracked page changes
  useEffect(() => {
    if (activeSubTab === 'tracked') {
      fetchTrackedCases(trackedPage);
    } else {
      setCurrentPage(1);
    }
  }, [activeSubTab, trackedPage]);

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

  // Populate total count badge for Tracked Cases initially
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

  const fetchTrackedCases = async (page) => {
    setLoadingTracked(true);
    try {
      const response = await HospitalAPI.getTrackedCases(page);
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

  // Doctor Memoized Helpers
  const currentDocId = useMemo(() => {
    if (!selectedAdmission?.doctorId) return null;
    return selectedAdmission.doctorId._id || selectedAdmission.doctorId;
  }, [selectedAdmission]);

  const currentDocName = useMemo(() => {
    if (!selectedAdmission?.doctorId) return 'Unassigned';
    if (selectedAdmission.doctorId.name) return selectedAdmission.doctorId.name;
    const found = doctorList.find(d => d._id === selectedAdmission.doctorId);
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

  // Pagination Logic (Standard admissions client-side pagination)
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
        loadingTracked ? (
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
                      <th className="px-5 py-4">Booking ID</th>
                      <th className="px-5 py-4">Patient Profile</th>
                      <th className="px-5 py-4">Current Status</th>
                      <th className="px-5 py-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {trackedCases.map((item) => {
                      // Safe extraction of patient name and age to handle varied structure from the API payload
                      const fallbackName = item.patientProfile?.name || 
                                           item.patientName || 
                                           item.patients?.[0]?.patientName || 
                                           item.name || 
                                           'Unknown';
                      const fallbackAge = item.patientProfile?.age || 
                                          item.patientAge || 
                                          item.patients?.[0]?.patientAge || 
                                          item.age || 
                                          'N/A';

                      return (
                        <tr 
                          key={item.appointmentId || item._id} 
                          className="hover:bg-slate-50 transition-colors duration-200 cursor-pointer"
                          onClick={() => fetchSingleTrackedDetails(item.appointmentId || item._id)}
                        >
                          <td className="px-5 py-4">
                            <span className="text-[11px] font-extrabold text-gray-600 bg-gray-50 px-2.5 py-1 rounded border border-gray-200">
                              #{item.bookingId || 'N/A'}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div>
                              <p className="text-xs font-extrabold text-gray-900">{fallbackName}</p>
                              <p className="text-[10px] font-bold text-gray-400 mt-0.5">
                                Age: {fallbackAge}
                              </p>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-full border ${getStatusColor(item.status)}`}>
                              {item.status || 'In-Progress'}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                            <button 
                              onClick={() => fetchSingleTrackedDetails(item.appointmentId || item._id)}
                              className="bg-[#08B36A] hover:bg-[#079E5E] text-white text-[10px] font-black px-4 py-2 rounded-lg transition-all"
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
        )
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
                      const patient = adm.patients?.[0] || {};
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
                                {patient.patientName?.charAt(0) || '?'}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <p className="text-xs font-extrabold text-gray-900 leading-none">{patient.patientName || 'Unknown'}</p>
                                  {isEmergency && <span className="text-red-500 text-[9px] font-black bg-red-50 px-1.5 py-0.5 rounded border border-red-100 uppercase tracking-wider">Emergency</span>}
                                </div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mt-1">
                                  {patient.gender} &bull; {patient.patientAge}y
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-3.5">
                            {adm.doctorId?.name ? (
                              <p className="text-xs font-bold text-gray-700">Dr. {adm.doctorId.name}</p>
                            ) : (
                              <span className="text-[11px] text-gray-400 italic">Unassigned</span>
                            )}
                          </td>

                          <td className="px-5 py-3.5">
                            <p className="text-xs font-extrabold text-gray-800">₹{adm.totalAmount}</p>
                            <p className={`text-[9px] font-black uppercase mt-0.5 ${adm.paymentStatus === 'Paid' ? 'text-[#08B36A]' : 'text-amber-600'}`}>
                              {adm.paymentStatus}
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
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-gray-950 text-white px-6 py-4 flex justify-between items-center shrink-0">
              <div>
                <p className="text-[10px] font-black text-[#08B36A] uppercase tracking-wider leading-none">Unified "Super Details" Case File</p>
                <h3 className="text-lg font-extrabold mt-1">
                  Booking ID: {trackedDetails?.caseDetails?.bookingId || 'N/A'}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedTrackedId(null)}
                className="bg-white/10 hover:bg-white/20 text-white rounded-full p-2 text-xs transition-all font-bold"
              >
                ✕ Close
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {loadingTrackedDetails ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <SpinnerIcon className="w-10 h-10 text-[#08B36A] animate-spin" />
                  <p className="text-sm font-bold text-gray-500">Retrieving Unified Logs...</p>
                </div>
              ) : trackedDetails ? (
                (() => {
                  // Fallbacks for Details views
                  const profileName = trackedDetails.caseDetails?.patientProfile?.name || 
                                      trackedDetails.caseDetails?.patientName || 
                                      trackedDetails.caseDetails?.patients?.[0]?.patientName || 
                                      'Unknown';
                  const profileAge = trackedDetails.caseDetails?.patientProfile?.age || 
                                     trackedDetails.caseDetails?.patientAge || 
                                     trackedDetails.caseDetails?.patients?.[0]?.patientAge || 
                                     'N/A';

                  return (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      
                      {/* Left Column: Patient Profile, Status, Vitals */}
                      <div className="space-y-6 lg:col-span-1">
                        {/* Basic Info */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                          <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">Case Status</h4>
                          <p className="text-sm font-extrabold text-slate-800">
                            {profileName}
                          </p>
                          <p className="text-xs font-bold text-slate-500 mt-0.5">
                            Age: {profileAge} years
                          </p>
                          <div className="mt-3">
                            <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md border ${getStatusColor(trackedDetails.caseDetails?.status)}`}>
                              {trackedDetails.caseDetails?.status || 'In-Progress'}
                            </span>
                          </div>
                        </div>

                        {/* Vitals Panel */}
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                          <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">Recorded Patient Vitals</h4>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-rose-50/50 p-2.5 rounded-lg border border-rose-100 text-center">
                              <p className="text-[10px] font-bold text-rose-500 uppercase">Blood Pressure</p>
                              <p className="text-sm font-extrabold text-rose-700 mt-1">
                                {trackedDetails.prescriptionDetails?.vitals?.bp || 'N/A'}
                              </p>
                            </div>
                            <div className="bg-amber-50/50 p-2.5 rounded-lg border border-amber-100 text-center">
                              <p className="text-[10px] font-bold text-amber-600 uppercase">Pulse Rate</p>
                              <p className="text-sm font-extrabold text-amber-700 mt-1">
                                {trackedDetails.prescriptionDetails?.vitals?.pulse || 'N/A'}
                              </p>
                            </div>
                            <div className="bg-sky-50/50 p-2.5 rounded-lg border border-sky-100 text-center">
                              <p className="text-[10px] font-bold text-sky-500 uppercase">Body Temp</p>
                              <p className="text-sm font-extrabold text-sky-700 mt-1">
                                {trackedDetails.prescriptionDetails?.vitals?.temp || 'N/A'}
                              </p>
                            </div>
                            <div className="bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100 text-center">
                              <p className="text-[10px] font-bold text-emerald-600 uppercase">SpO2 Level</p>
                              <p className="text-sm font-extrabold text-emerald-700 mt-1">
                                {trackedDetails.prescriptionDetails?.vitals?.spo2 || 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Prescription Document */}
                        {trackedDetails.prescriptionDetails?.pdfUrl && (
                          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Prescription Form</h4>
                            <a 
                              href={trackedDetails.prescriptionDetails.pdfUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 bg-[#08B36A] hover:bg-[#079E5E] text-white text-xs font-black py-2 px-4 rounded-lg transition-all shadow-sm w-full justify-center"
                            >
                              📄 Open PDF File
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Middle Column: Treatment Timeline */}
                      <div className="space-y-4 lg:col-span-1">
                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm h-full">
                          <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4">Treatment Timeline</h4>
                          
                          {trackedDetails.treatmentTimeline?.length === 0 ? (
                            <p className="text-xs text-gray-400 italic">No timeline milestones logged yet.</p>
                          ) : (
                            <div className="relative border-l border-gray-200 ml-2 space-y-6">
                              {trackedDetails.treatmentTimeline?.map((item, index) => (
                                <div key={index} className="mb-4 ml-6 relative">
                                  <span className="absolute -left-[31px] top-1 bg-[#08B36A] text-white w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black ring-4 ring-white">
                                    {index + 1}
                                  </span>
                                  <p className="text-xs font-extrabold text-gray-800 leading-tight">{item.name}</p>
                                  <p className="text-[10px] font-bold text-[#08B36A] mt-0.5">{item.role}</p>
                                  <div className="mt-1 text-[10px] text-gray-400 font-medium space-y-0.5">
                                    <p>Joined: {new Date(item.joinedAt).toLocaleString()}</p>
                                    <p className="font-extrabold text-gray-600">Active Duration: {item.duration}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Column: Care Logs & Recommendations */}
                      <div className="space-y-4 lg:col-span-1">
                        {/* Bedside Care Logs */}
                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                          <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">Bedside Care Logs</h4>
                          {trackedDetails.bedsideCareLogs?.length === 0 ? (
                            <p className="text-xs text-gray-400 italic">No specialist observations found.</p>
                          ) : (
                            <div className="space-y-4">
                              {trackedDetails.bedsideCareLogs?.map((log, idx) => (
                                <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <p className="text-xs font-extrabold text-slate-800">{log.specialist?.name}</p>
                                      <p className="text-[10px] font-bold text-slate-500">{log.specialist?.speciality}</p>
                                    </div>
                                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[8px] font-black uppercase px-2 py-0.5 rounded">
                                      {log.specialist?.status || 'Completed'}
                                    </span>
                                  </div>

                                  {/* Observations */}
                                  {log.clinicalObservations?.map((obs, oIdx) => (
                                    <div key={oIdx} className="text-[11px] bg-white p-2 rounded border border-slate-100">
                                      <p className="text-slate-500 font-bold">Observation:</p>
                                      <p className="text-slate-800 font-medium italic">"{obs.observation}"</p>
                                      <div className="flex justify-between items-center text-[9px] text-gray-400 mt-1 font-semibold">
                                        <span>Cond: {obs.patientCondition}</span>
                                        <span>{new Date(obs.submittedAt).toLocaleDateString()}</span>
                                      </div>
                                    </div>
                                  ))}

                                  {/* Discharge recommendations */}
                                  {log.dischargeHomeRecommendations?.length > 0 && (
                                    <div className="space-y-1">
                                      <p className="text-[9px] font-black text-rose-600 uppercase tracking-wide">Discharge Med Recommendations</p>
                                      {log.dischargeHomeRecommendations.map((rec, rIdx) => (
                                        <div key={rIdx} className="bg-rose-50/50 p-2 rounded text-[10px] text-rose-900 border border-rose-100/60 font-medium">
                                          <p className="font-extrabold">{rec.name} ({rec.dosage})</p>
                                          <p className="text-[9px] text-rose-700">Freq: {rec.frequency}</p>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Primary Doctor Round Logs */}
                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                          <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">Primary Round Logs</h4>
                          {trackedDetails.primaryDoctorRoundLogs?.length === 0 ? (
                            <p className="text-xs text-gray-400 italic">No primary round entries registered.</p>
                          ) : (
                            <div className="space-y-3">
                              {trackedDetails.primaryDoctorRoundLogs?.map((round, rIdx) => (
                                <div key={rIdx} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                  <p className="text-xs text-slate-800 font-medium italic">"{round.note || 'No notes'}"</p>
                                  <p className="text-[9px] text-slate-400 mt-1 text-right font-bold">
                                    {new Date(round.loggedAt).toLocaleString()}
                                  </p>
                                </div>
                              ))}
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

            {/* Footer */}
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end shrink-0">
              <button 
                onClick={() => setSelectedTrackedId(null)}
                className="bg-gray-800 hover:bg-gray-900 text-white text-xs font-black px-5 py-2.5 rounded-xl transition-all"
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