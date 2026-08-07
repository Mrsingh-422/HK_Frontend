"use client";

import React, { useState, useEffect, useMemo } from 'react';
import HospitalAPI from '@/app/services/HospitalAPI';

const ReferralBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [ambulances, setAmbulances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  
  // Tab State - set to 'delivered' to correspond to the first visual tab (referral received)
  const [activeTab, setActiveTab] = useState('delivered'); 

  // Reassignment Form State
  const [isReassignOpen, setIsReassignOpen] = useState(false);
  const [newAmbulanceId, setNewAmbulanceId] = useState('');
  const [breakdownReason, setBreakdownReason] = useState('Engine Overheating Breakdown');
  const [reassignSubmitLoading, setReassignSubmitLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  // Referral Card Zoom Modal States
  const [isReferralCardZoomOpen, setIsReferralCardZoomOpen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    fetchReferrals();
    fetchAmbulances();
  }, []);

  const fetchReferrals = async () => {
    setLoading(true);
    try {
      const response = await HospitalAPI.getReferralBookings();
      if (response?.success) {
        setBookings(response.data);
      }
    } catch (error) {
      console.error("Error fetching referrals:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAmbulances = async () => {
    try {
      const response = await HospitalAPI.getMyAmbulances();
      if (response?.success) {
        setAmbulances(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching ambulances:", error);
    }
  };

  // Zoom & Pan Reset Helper
  const resetZoomState = () => {
    setZoomScale(1);
    setPanPosition({ x: 0, y: 0 });
    setIsDragging(false);
  };

  // Zoom Handlers
  const handleZoomIn = () => setZoomScale(prev => Math.min(prev + 0.5, 5));

  const handleZoomOut = () => {
    setZoomScale(prev => {
      const nextScale = Math.max(prev - 0.5, 1);
      if (nextScale === 1) setPanPosition({ x: 0, y: 0 });
      return nextScale;
    });
  };

  const handleWheelZoom = (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  const handleMouseDown = (e) => {
    if (zoomScale > 1) {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({
        x: e.clientX - panPosition.x,
        y: e.clientY - panPosition.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && zoomScale > 1) {
      e.preventDefault();
      setPanPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);
  const handleMouseLeave = () => setIsDragging(false);

  // Memoized Categorization Logic
  const categorizedBookings = useMemo(() => {
    const pickupList = [];
    const deliveredList = [];

    bookings.forEach(booking => {
      const status = (booking.status || '').toLowerCase();
      // Classify standard transit/assigned stages under Pickup, and final arrivals under Delivered
      if (status === 'delivered' || status === 'completed') {
        deliveredList.push(booking);
      } else {
        pickupList.push(booking);
      }
    });

    return {
      pickup: pickupList,
      delivered: deliveredList
    };
  }, [bookings]);

  // Status check to see if breakdown reassignment is permitted
  const canReportBreakdown = useMemo(() => {
    if (!selectedBooking?.status) return false;
    
    const status = selectedBooking.status.trim().toLowerCase();
    const allowedStatuses = [
      'confirmed', 
      'arrived', 
      'picked-up', 
      'en-route',
      'pickedup',
      'enroute'
    ];
    
    return allowedStatuses.includes(status);
  }, [selectedBooking]);

  // Filter out the currently assigned ambulance from the replacement options
  const availableReplacementAmbulances = useMemo(() => {
    if (!selectedBooking) return [];
    const currentAmbulanceId = selectedBooking.ambulanceId?._id || selectedBooking.ambulanceId;
    return ambulances.filter(amb => amb._id !== currentAmbulanceId);
  }, [ambulances, selectedBooking]);

  // Set default replacement option when the reassign dialog is opened
  useEffect(() => {
    if (isReassignOpen && availableReplacementAmbulances.length > 0) {
      setNewAmbulanceId(availableReplacementAmbulances[0]._id);
    } else if (isReassignOpen) {
      setNewAmbulanceId('');
    }
  }, [isReassignOpen, availableReplacementAmbulances]);

  // Select the list matching the active tab
  const currentTabBookings = activeTab === 'pickup' ? categorizedBookings.pickup : categorizedBookings.delivered;

  const getFullUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${process.env.NEXT_PUBLIC_BACKEND_URL}${path}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Submit breakdown reassignment payload
  const handleReassignSubmit = async (e) => {
    e.preventDefault();
    if (!newAmbulanceId) {
      setStatusMessage({ type: 'error', text: 'Please select an ambulance from the list.' });
      return;
    }

    setReassignSubmitLoading(true);
    setStatusMessage({ type: '', text: '' });

    // Use MongoDB Document ID (_id) for the target booking identification
    const payloadId = selectedBooking._id;

    try {
      if (typeof HospitalAPI.reassignAmbulanceBreakdown !== 'function') {
        throw new Error("HospitalAPI.reassignAmbulanceBreakdown is not registered as a function. Check if you saved your HospitalAPI.js file.");
      }

      const response = await HospitalAPI.reassignAmbulanceBreakdown(
        payloadId,
        newAmbulanceId,
        breakdownReason
      );

      if (response?.success) {
        setStatusMessage({ type: 'success', text: response.message || 'Ambulance successfully reassigned.' });
        
        // Refresh component data
        await fetchReferrals();
        
        // Clear forms and close modal
        setTimeout(() => {
          setIsReassignOpen(false);
          setSelectedBooking(null); // Close the detail modal to show fresh state
          setNewAmbulanceId('');
          setBreakdownReason('Engine Overheating Breakdown');
          setStatusMessage({ type: '', text: '' });
        }, 2000);
      } else {
        setStatusMessage({ type: 'error', text: response?.message || 'Reassignment failed. Please try again.' });
      }
    } catch (error) {
      console.error("Detailed Reassignment Error Information:", error);
      setStatusMessage({ 
        type: 'error', 
        text: error.message || 'An unexpected connection error occurred.' 
      });
    } finally {
      setReassignSubmitLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-[90rem] mx-auto font-sans min-h-screen bg-gray-50/50">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Referral Bookings</h2>
          <p className="text-sm text-gray-500 mt-1 font-medium">Manage inter-hospital patient transfers and referral logistics.</p>
        </div>
        <div className="flex items-center gap-3 bg-[#08B36A]/10 px-5 py-2.5 rounded-xl border border-[#08B36A]/20">
            <span className="text-2xl">🚑</span>
            <div>
                <p className="text-[10px] font-black text-[#08B36A] uppercase tracking-widest leading-none">Total Referrals</p>
                <p className="text-lg font-black text-[#08B36A] leading-none mt-1">{bookings.length}</p>
            </div>
        </div>
      </div>

      {/* TAB SELECTOR */}
      <div className="flex bg-white px-6 rounded-2xl border border-gray-200 shadow-sm mb-6">
        <button 
          onClick={() => setActiveTab('delivered')} 
          className={`py-4 px-6 text-xs font-black uppercase tracking-widest border-b-4 transition-all flex items-center gap-2 ${
            activeTab === 'delivered' 
              ? 'border-[#08B36A] text-[#08B36A]' 
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          referral received
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
            activeTab === 'delivered' ? 'bg-[#08B36A]/10 text-[#08B36A]' : 'bg-gray-100 text-gray-400'
          }`}>
            {categorizedBookings.delivered.length}
          </span>
        </button>

        <button 
          onClick={() => setActiveTab('pickup')} 
          className={`py-4 px-6 text-xs font-black uppercase tracking-widest border-b-4 transition-all flex items-center gap-2 ${
            activeTab === 'pickup' 
              ? 'border-[#08B36A] text-[#08B36A]' 
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          referred    
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
            activeTab === 'pickup' ? 'bg-[#08B36A]/10 text-[#08B36A]' : 'bg-gray-100 text-gray-400'
          }`}>
            {categorizedBookings.pickup.length}
          </span>
        </button>
      </div>

      {/* DATA TABLE */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Booking ID</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Patient / Condition</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">From Hospital</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Ambulance</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Schedule</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan="7" className="py-20 text-center"><SpinnerIcon className="w-10 h-10 text-[#08B36A] mx-auto animate-spin" /></td></tr>
              ) : currentTabBookings.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-20 text-center font-bold text-gray-400">
                    No referral bookings found in {activeTab === 'pickup' ? 'Pickup' : 'Delivered'} category.
                  </td>
                </tr>
              ) : currentTabBookings.map((item) => (
                <tr key={item._id} className="hover:bg-[#08B36A]/5 transition-colors group cursor-pointer" onClick={() => setSelectedBooking(item)}>
                  <td className="px-6 py-5">
                    <span className="font-black text-gray-800 text-xs">#{item.bookingId}</span>
                    <p className="text-[9px] text-gray-400 font-bold mt-0.5">{item.caseReference}</p>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-800 text-sm">{item.patientDetails?.name}</span>
                        <span className={`text-[10px] font-black uppercase tracking-wide mt-0.5 ${item.triageLevel === 'Urgent' ? 'text-red-500' : 'text-[#08B36A]'}`}>{item.triageLevel} • {item.patientDetails?.condition}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm font-medium text-gray-600">
                    {item.pickupHospitalId?.name || "N/A"}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-800">{item.ambulanceId?.name}</span>
                        <span className="text-[10px] text-[#08B36A] font-bold uppercase mt-0.5">{item.ambulanceId?.vehicleType}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                     <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-700">{formatDate(item.scheduledAt)}</span>
                        <span className="text-[10px] text-gray-400 font-bold mt-0.5">{item.scheduledTime || 'Immediate'}</span>
                     </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="bg-[#08B36A]/10 text-[#08B36A] text-[10px] font-black px-3 py-1 rounded-full border border-[#08B36A]/20 uppercase tracking-wider">
                        {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <button className="bg-white border border-gray-200 text-gray-500 group-hover:bg-[#08B36A] group-hover:text-white px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md animate-fadeIn">
          <div className="bg-white w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] shadow-2xl relative scrollbar-hide">
            
            {/* Modal Header */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-100 px-8 py-6 flex justify-between items-center z-10">
               <div>
                  <h2 className="text-2xl font-black text-gray-900">Referral Details</h2>
                  <p className="text-[#08B36A] font-bold text-xs uppercase tracking-[0.2em] mt-1">Booking ID: {selectedBooking.bookingId}</p>
               </div>
               <button 
                 onClick={() => {
                   setSelectedBooking(null);
                   setIsReferralCardZoomOpen(false);
                   resetZoomState();
                 }} 
                 className="text-gray-400 hover:text-red-500 bg-gray-50 w-10 h-10 flex items-center justify-center rounded-full transition-all border border-gray-200"
               >
                 <CloseIcon className="w-5 h-5"/>
               </button>
            </div>

            <div className="p-8 space-y-8">
               {/* SECTION 1: LOGISTICS */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Route Card */}
                  <div className="bg-[#08B36A]/5 p-6 rounded-2xl border border-[#08B36A]/10 md:col-span-1">
                     <h4 className="text-[10px] font-black text-[#08B36A] uppercase tracking-widest mb-4">Transfer Route</h4>
                     <div className="flex flex-col gap-3">
                        <div>
                           <p className="text-[10px] text-gray-400 font-bold uppercase">Pickup From</p>
                           <p className="text-sm font-black text-gray-800">{selectedBooking.pickupHospitalId?.name}</p>
                        </div>
                        <div className="text-xl text-[#08B36A] font-bold">⬇</div>
                        <div>
                           <p className="text-[10px] text-gray-400 font-bold uppercase">Drop To</p>
                           <p className="text-sm font-black text-gray-800">{selectedBooking.hospitalId?.name}</p>
                        </div>
                     </div>
                  </div>

                  {/* Patient Status */}
                  <div className="bg-gray-900 p-6 rounded-2xl text-white shadow-xl md:col-span-1">
                     <h4 className="text-[10px] font-black text-[#08B36A] uppercase tracking-widest mb-4">Patient Status</h4>
                     <div className="grid grid-cols-1 gap-4">
                        <div>
                           <p className="text-[10px] text-gray-400 font-bold uppercase">Condition</p>
                           <p className="text-sm font-black">{selectedBooking.patientDetails?.condition}</p>
                        </div>
                        <div>
                           <p className="text-[10px] text-gray-400 font-bold uppercase">Triage Level</p>
                           <p className="text-sm font-black text-red-400">{selectedBooking.triageLevel}</p>
                        </div>
                     </div>
                  </div>

                  {/* Active Vehicle & Breakdown Section */}
                  <div className="bg-red-50/40 p-6 rounded-2xl border border-red-100 flex flex-col justify-between md:col-span-1">
                     <div>
                        <h4 className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-3">Assigned Ambulance</h4>
                        <div className="space-y-1">
                           <p className="text-sm font-black text-gray-800">{selectedBooking.ambulanceId?.name || "N/A"}</p>
                           <p className="text-[10px] text-gray-500 font-semibold uppercase">{selectedBooking.ambulanceId?.vehicleType || "N/A"}</p>
                           <p className="text-[9px] text-gray-400 font-mono">ID: {selectedBooking.ambulanceId?._id || selectedBooking.ambulanceId || "N/A"}</p>
                        </div>
                     </div>
                     
                     {/* Conditionally render the breakdown reporting button */}
                     {canReportBreakdown ? (
                        <button
                           onClick={() => setIsReassignOpen(true)}
                           className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white py-2.5 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm animate-fadeIn"
                        >
                           🚨 Report Breakdown
                        </button>
                     ) : (
                        <div className="mt-4 text-[10px] font-bold text-gray-400 text-center py-2 bg-gray-100 rounded-xl uppercase tracking-wider">
                           Reassignment Locked
                        </div>
                     )}
                  </div>
               </div>

               {/* SECTION 2: DATA GRIDS */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <InfoSection title="👤 Patient Information">
                     <InfoItem label="Full Name" value={selectedBooking.patientDetails?.name} />
                     <InfoItem label="Relation" value={selectedBooking.patientDetails?.relation} />
                     <InfoItem label="Booked By" value={selectedBooking.userId?.name} />
                     <InfoItem label="User Phone" value={selectedBooking.userId?.phone} />
                     <div className="col-span-full bg-white p-4 rounded-xl border border-gray-100">
                        <p className="text-[10px] text-gray-400 font-bold uppercase mb-2">Referral Reason</p>
                        <p className="text-xs font-bold text-gray-700 leading-relaxed italic">"{selectedBooking.patientDetails?.referralReason}"</p>
                     </div>
                  </InfoSection>

                  <InfoSection title="💰 Pricing Breakdown">
                     <InfoItem label="Ambulance Base" value={`₹${selectedBooking.pricing?.ambulanceCharge}`} />
                     <InfoItem label="Support Staff" value={`₹${selectedBooking.pricing?.supportingStaffCharge}`} />
                     <InfoItem label="Discount" value={`- ₹${selectedBooking.pricing?.discount}`} />
                     <div className="col-span-full pt-4 mt-2 border-t border-gray-100 flex justify-between items-center">
                        <span className="text-xs font-black text-gray-800 uppercase">Total Amount</span>
                        <span className="text-2xl font-black text-[#08B36A]">₹{selectedBooking.pricing?.total}</span>
                     </div>
                  </InfoSection>
               </div>

               {/* SECTION 3: REFERRAL CARD & TIMELINE */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <InfoSection title="📄 Referral Card">
                    {selectedBooking.patientDetails?.referralCard ? (
                      <div 
                        className="group relative rounded-2xl overflow-hidden border-2 border-gray-100 h-64 bg-gray-50 flex items-center justify-center cursor-pointer transition-all hover:border-[#08B36A]/40"
                        onClick={() => {
                          resetZoomState();
                          setIsReferralCardZoomOpen(true);
                        }}
                      >
                         <img src={getFullUrl(selectedBooking.patientDetails.referralCard)} className="w-full h-full object-contain p-2" alt="Referral Card" />
                         <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-all">
                            <button 
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                resetZoomState();
                                setIsReferralCardZoomOpen(true);
                              }} 
                              className="bg-white text-gray-900 px-5 py-2.5 rounded-full font-black text-xs shadow-lg hover:bg-gray-100 transition-all flex items-center gap-1.5"
                            >
                               🔍 Zoom & View Card
                            </button>
                         </div>
                      </div>
                    ) : (
                      <div className="h-40 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 font-bold text-xs">No Referral Card Uploaded</div>
                    )}
                  </InfoSection>

                  <InfoSection title="🕒 Tracking Timeline">
                     <div className="space-y-6">
                        {selectedBooking.trackingTimeline?.map((log, idx) => (
                           <div key={idx} className="flex gap-4 relative">
                              {idx !== selectedBooking.trackingTimeline.length - 1 && <div className="absolute left-2 top-5 w-0.5 h-10 bg-gray-100"></div>}
                              <div className="w-4 h-4 rounded-full bg-[#08B36A] mt-1 z-10 border-4 border-white shadow-sm"></div>
                              <div>
                                 <p className="text-xs font-black text-gray-800">{log.status}</p>
                                 <p className="text-[10px] text-gray-400 font-bold">{new Date(log.timestamp).toLocaleString()}</p>
                                 <p className="text-[10px] text-[#08B36A] font-bold mt-1 uppercase italic">{log.note}</p>
                              </div>
                           </div>
                        ))}
                     </div>
                  </InfoSection>
               </div>

            </div>
          </div>
        </div>
      )}

      {/* REFERRAL CARD ZOOM MODAL */}
      {isReferralCardZoomOpen && selectedBooking?.patientDetails?.referralCard && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden relative border border-gray-100 flex flex-col max-h-[90vh]">
            
            {/* Zoom Modal Header */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-lg font-black text-gray-800">Referral Card Inspector</h3>
                <p className="text-[10px] text-[#08B36A] font-extrabold uppercase tracking-widest mt-0.5">
                  Booking ID: #{selectedBooking.bookingId} {zoomScale > 1 && `• ${(zoomScale * 100).toFixed(0)}% Zoom`}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  type="button" 
                  onClick={handleZoomOut} 
                  className="p-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 rounded-xl transition-all shadow-xs text-xs font-bold"
                  title="Zoom Out"
                >
                  🔍−
                </button>
                <button 
                  type="button" 
                  onClick={resetZoomState} 
                  className="p-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 rounded-xl transition-all shadow-xs text-xs font-bold"
                  title="Reset Zoom"
                >
                  ↻ Reset
                </button>
                <button 
                  type="button" 
                  onClick={handleZoomIn} 
                  className="p-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 rounded-xl transition-all shadow-xs text-xs font-bold"
                  title="Zoom In"
                >
                  🔍+
                </button>
                <button 
                  type="button" 
                  onClick={() => window.open(getFullUrl(selectedBooking.patientDetails.referralCard), '_blank')} 
                  className="px-3 py-2 bg-gray-100 border border-gray-200 text-gray-700 hover:bg-gray-200 rounded-xl transition-all shadow-xs text-xs font-bold flex items-center gap-1"
                  title="Open in New Tab"
                >
                  ↗ New Tab
                </button>
                <button 
                  type="button" 
                  onClick={() => { setIsReferralCardZoomOpen(false); resetZoomState(); }} 
                  className="w-9 h-9 flex items-center justify-center bg-gray-100 text-gray-500 hover:text-red-500 rounded-full transition-all border border-gray-200 ml-2"
                >
                  <CloseIcon className="w-5 h-5"/>
                </button>
              </div>
            </div>

            {/* Interactive Zoom Canvas */}
            <div 
              className="relative w-full h-[70vh] bg-gray-900/90 overflow-hidden flex items-center justify-center select-none"
              onWheel={handleWheelZoom}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              style={{
                cursor: zoomScale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
              }}
            >
              <img 
                src={getFullUrl(selectedBooking.patientDetails.referralCard)} 
                draggable={false}
                style={{ 
                  transform: `translate(${panPosition.x}px, ${panPosition.y}px) scale(${zoomScale})`, 
                  transition: isDragging ? 'none' : 'transform 0.15s ease-out' 
                }} 
                className="max-w-full max-h-full object-contain pointer-events-none" 
                alt="Referral Card Zoom Preview" 
              />

              {/* Helpful User Indicator */}
              <div className="absolute bottom-4 left-4 bg-gray-900/80 backdrop-blur-md text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider pointer-events-none border border-white/10 flex items-center gap-2">
                <span>Scroll to Zoom</span>
                <span>•</span>
                <span>{zoomScale > 1 ? 'Drag to Pan' : 'Zoom in to Drag'}</span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* REASSIGN AMBULANCE MODAL (BREAKDOWN DIALOG) */}
      {isReassignOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/75 backdrop-blur-md animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
            <div className="bg-red-600 px-6 py-5 text-white flex justify-between items-center">
              <div>
                <h3 className="text-lg font-black tracking-wide">Report Vehicle Breakdown</h3>
                <p className="text-xs text-red-100 font-medium">Reassign booking #{selectedBooking.bookingId}</p>
              </div>
              <button 
                onClick={() => { setIsReassignOpen(false); setStatusMessage({type: '', text: ''}); }} 
                className="text-white hover:text-red-200 transition-colors"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReassignSubmit} className="p-6 space-y-5">
              
              {/* Info alert */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-800 font-medium leading-relaxed">
                ⚠️ Reassigning on breakdown keeps the active patient logs, original pricing structures, and past transactions completely intact.
              </div>

              {/* Selector: Available Ambulances */}
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">
                  Select Replacement Ambulance
                </label>
                {availableReplacementAmbulances.length > 0 ? (
                  <div className="relative">
                    <select
                      required
                      className="w-full text-sm font-bold bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#08B36A] transition-all appearance-none cursor-pointer"
                      value={newAmbulanceId}
                      onChange={(e) => setNewAmbulanceId(e.target.value)}
                    >
                      {availableReplacementAmbulances.map((amb) => (
                        <option key={amb._id} value={amb._id}>
                          {amb.name} ({amb.vehicleType})
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 text-xs bg-red-50 border border-red-100 text-red-600 rounded-xl font-bold">
                    No alternative ambulances are currently registered in your inventory.
                  </div>
                )}
              </div>

              {/* Dropdown: Selected Breakdown Reason */}
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">
                  Breakdown Reason
                </label>
                <div className="relative">
                  <select
                    className="w-full text-sm font-bold bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#08B36A] transition-all appearance-none cursor-pointer"
                    value={breakdownReason}
                    onChange={(e) => setBreakdownReason(e.target.value)}
                  >
                    <option value="Engine Overheating Breakdown">Engine Overheating Breakdown</option>
                    <option value="Flat Tire Breakdown">Flat Tire Breakdown</option>
                    <option value="Mechanical Transmission Failure">Mechanical Transmission Failure</option>
                    <option value="Accident / Road Collision">Accident / Road Collision</option>
                    <option value="Medical Staff Emergency Swap">Medical Staff Emergency Swap</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Status Message Display */}
              {statusMessage.text && (
                <div className={`p-3 rounded-xl text-xs font-bold leading-normal ${
                  statusMessage.type === 'success' ? 'bg-[#08B36A]/10 text-[#08B36A] border border-[#08B36A]/20' : 'bg-red-50 text-red-600 border border-red-100'
                }`}>
                  {statusMessage.text}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setIsReassignOpen(false); setStatusMessage({type: '', text: ''}); }}
                  className="flex-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-500 text-xs font-black uppercase tracking-wider py-3 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reassignSubmitLoading || availableReplacementAmbulances.length === 0}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-xs font-black uppercase tracking-wider py-3 rounded-xl transition-all flex items-center justify-center gap-1"
                >
                  {reassignSubmitLoading ? (
                    <SpinnerIcon className="w-4 h-4 text-white animate-spin" />
                  ) : (
                    'Confirm Reassignment'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

// Reusable UI Components
const InfoSection = ({ title, children }) => (
  <div className="bg-gray-50/80 p-6 rounded-3xl border border-gray-100">
    <h4 className="text-xs font-black text-[#08B36A] uppercase tracking-widest mb-5 flex items-center gap-2 border-b border-gray-200 pb-3">{title}</h4>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
  </div>
);

const InfoItem = ({ label, value }) => (
  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
    <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">{label}</p>
    <p className="text-sm font-black text-gray-800">{value || 'N/A'}</p>
  </div>
);

// Icons
const CloseIcon = ({className}) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M6 18L18 6M6 6l12 12" /></svg>);
const SpinnerIcon = ({className}) => (<svg className={className} fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>);

export default ReferralBookings;