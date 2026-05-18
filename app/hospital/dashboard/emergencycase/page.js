"use client";

import React, { useState, useEffect } from 'react';
import HospitalAPI from '@/app/services/HospitalAPI';

const ManageEmergencyCases = () => {
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState(null);

  useEffect(() => {
    fetchEmergencies();
  }, []);

  const fetchEmergencies = async () => {
    setLoading(true);
    try {
      const response = await HospitalAPI.getEmergencyCases();
      if (response?.success) {
        setEmergencies(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching emergency cases:", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper Functions
  const displayDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getFullUrl = (path) => {
    if (!path) return 'https://via.placeholder.com/150?text=No+User';
    if (path.startsWith('http')) return path;
    const cleanPath = path.replace(/^(public\/|\/)/, ''); 
    return `${process.env.NEXT_PUBLIC_BACKEND_URL}/${cleanPath}`;
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
    <div className="p-6 max-w-[90rem] mx-auto font-sans min-h-screen relative bg-red-50/30">
      
      {/* ---------------- HEADER ---------------- */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border-l-8 border-red-500">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight flex items-center gap-3">
            🚨 Emergency Cases
          </h2>
          <p className="text-sm text-gray-500 mt-1 font-medium">Live tracking of all critical admissions and emergency patients.</p>
        </div>
        <div className="mt-4 md:mt-0 bg-red-50 px-6 py-3 rounded-xl border border-red-100 flex items-center gap-3 shadow-sm">
           <span className="text-3xl animate-pulse">❤️‍🩹</span>
           <div>
              <p className="text-xs font-black text-red-800 uppercase tracking-widest">Active Emergencies</p>
              <p className="text-xl font-black text-red-900">{emergencies.length}</p>
           </div>
        </div>
      </div>

      {/* ---------------- EMERGENCY TABLE LISTING ---------------- */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <SpinnerIcon className="w-10 h-10 text-red-500 animate-spin" />
          <p className="text-lg text-gray-500 font-bold">Fetching Emergencies...</p>
        </div>
      ) : emergencies.length === 0 ? (
        <div className="text-center bg-white p-20 rounded-3xl shadow-sm border-2 border-dashed border-gray-300">
          <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center text-5xl mb-6 mx-auto shadow-inner">✅</div>
          <p className="text-gray-700 text-2xl font-black">No Active Emergencies</p>
          <p className="text-gray-500 mt-2 font-medium">All clear. There are currently no emergency cases.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border-2 border-red-100 overflow-hidden">
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-red-50/80 border-b border-red-100 text-red-900 text-[10px] uppercase tracking-widest font-black">
                  <th className="p-5">Booking ID</th>
                  <th className="p-5">Patient Details</th>
                  <th className="p-5">Assigned Bed</th>
                  <th className="p-5">Date & Time</th>
                  <th className="p-5">Total Bill</th>
                  <th className="p-5">Status</th>
                  <th className="p-5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {emergencies.map((adm) => {
                  const patient = adm.patients?.[0] || {};
                  const bedInfo = adm.bedId || {};

                  return (
                    <tr 
                      key={adm._id} 
                      className="hover:bg-red-50/40 transition-colors duration-200 group cursor-pointer"
                      onClick={() => setSelectedCase(adm)} // Clicking ANY td will open the modal
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
                          <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-black text-lg border border-red-200 shadow-sm">
                            {patient.patientName?.charAt(0) || '?'}
                          </div>
                          <div>
                            <p className="text-sm font-black text-gray-900">{patient.patientName || 'Unknown'}</p>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mt-0.5">
                              {patient.gender || 'N/A'} • {patient.patientAge ? `${patient.patientAge} Yrs` : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Assigned Bed & Ward */}
                      <td className="p-5">
                        {bedInfo.bedNumber ? (
                          <div className="flex items-center gap-2">
                            <span className="bg-gray-900 text-white text-xs font-black px-2.5 py-1 rounded shadow-sm">
                              {bedInfo.bedNumber}
                            </span>
                            <span className="text-xs font-bold text-gray-600">
                              {bedInfo.wardId?.name || 'Pending'}
                            </span>
                          </div>
                        ) : (
                          <span className="bg-gray-100 text-gray-400 text-[10px] font-black uppercase px-2 py-1 rounded">Not Assigned</span>
                        )}
                      </td>

                      {/* Date & Time */}
                      <td className="p-5">
                        <p className="text-sm font-black text-gray-800">{displayDate(adm.createdAt)}</p>
                      </td>

                      {/* Total Bill & Payment */}
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

                      {/* Action Button */}
                      <td className="p-5 text-center">
                        <button 
                          className="bg-white border border-gray-200 text-gray-700 group-hover:bg-red-50 group-hover:text-red-600 group-hover:border-red-200 text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm"
                        >
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
         FULL DETAILS MODAL (WITH md:pl-64 FOR SIDEBAR)
      --------------------------------------------------------- */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:pl-64 bg-gray-900/60 backdrop-blur-md transition-opacity animate-fadeIn">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2rem] shadow-2xl relative scrollbar-hide">
            
            {/* Modal Header */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-100 px-8 py-5 flex justify-between items-center z-10">
               <div>
                  <h2 className="text-2xl font-black text-red-600 tracking-tight flex items-center gap-2">
                     🚨 Emergency Case Details
                  </h2>
                  <p className="text-gray-500 font-bold text-xs uppercase tracking-wide mt-1">Booking ID: <span className="text-red-500">{selectedCase.bookingId}</span></p>
               </div>
               <button onClick={() => setSelectedCase(null)} className="text-gray-400 hover:text-red-500 bg-gray-50 border border-gray-200 hover:border-red-200 w-10 h-10 flex items-center justify-center rounded-full transition-all">
                 <CloseIcon className="w-5 h-5"/>
               </button>
            </div>

            {/* Modal Content */}
            <div className="p-8 space-y-8">
               
               {/* Primary Status Banner */}
               <div className="flex gap-4">
                 <div className="flex-1 bg-gray-900 text-white p-4 rounded-2xl border flex flex-col justify-center items-center shadow-lg">
                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Assigned Bed & Ward</span>
                    <span className="text-2xl font-black text-red-400">{selectedCase.bedId?.bedNumber || 'N/A'}</span>
                    <span className="text-xs font-bold mt-1">{selectedCase.bedId?.wardId?.name || 'Pending'}</span>
                 </div>
                 <div className={`flex-1 p-4 rounded-2xl border flex flex-col justify-center items-center ${getStatusColor(selectedCase.status)}`}>
                    <span className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-70">Current Status</span>
                    <span className="text-xl font-black">{selectedCase.status}</span>
                 </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Patient Details */}
                  <InfoSection title="🧑‍🤝‍🧑 Patient Information">
                    <InfoItem label="Patient Name" value={selectedCase.patients[0]?.patientName} />
                    <InfoItem label="Age & Gender" value={`${selectedCase.patients[0]?.patientAge} Yrs, ${selectedCase.patients[0]?.gender}`} />
                    <InfoItem label="Relation to User" value={selectedCase.patients[0]?.relation} />
                    <InfoItem label="Consultation Type" value={selectedCase.consultationType} />
                  </InfoSection>

                  {/* Booking / Admin Details */}
                  <InfoSection title="📆 Appointment Details">
                    <InfoItem label="Date Received" value={displayDate(selectedCase.createdAt)} />
                    <InfoItem label="Assigned Doctor" value={selectedCase.doctorId?.name || 'Pending/Not Assigned'} />
                    <InfoItem label="Payment Status" value={selectedCase.paymentStatus} />
                    <InfoItem label="Triage Level" value={selectedCase.triageLevel} />
                  </InfoSection>
               </div>

               {/* Booked By (User Details) WITH PROFILE PIC */}
               <InfoSection title="📱 Booked By (App User Info)">
                  <div className="flex items-center gap-6 bg-white p-4 rounded-xl border border-gray-100 shadow-sm col-span-1 sm:col-span-2">
                     <img 
                        src={getFullUrl(selectedCase.userId?.profilePic)} 
                        alt="User Avatar" 
                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-200" 
                     />
                     <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">User Name</p>
                          <p className="text-sm font-black text-gray-900">{selectedCase.userId?.name || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Contact Phone</p>
                          <p className="text-sm font-black text-gray-900">{selectedCase.userId?.phone || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Address Mode</p>
                          <p className="text-sm font-black text-gray-900">{selectedCase.address?.addressType || 'N/A'}</p>
                        </div>
                     </div>
                  </div>
               </InfoSection>

               {/* Pricing Breakdown (Detailed) */}
               <InfoSection title="💳 Billing Breakdown">
                  <div className="col-span-1 sm:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                     <div className="p-4 space-y-3 font-semibold text-gray-700">
                        <div className="flex justify-between"><span className="text-gray-500">Base Fee</span> <span>₹{selectedCase.pricingBreakdown?.baseFee || 0}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Visit Charges</span> <span>₹{selectedCase.pricingBreakdown?.visitCharges || 0}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Extra Charges</span> <span>₹{selectedCase.pricingBreakdown?.extraCharges || 0}</span></div>
                        <div className="flex justify-between text-red-500"><span className="text-red-400">Discount Applied</span> <span>- ₹{selectedCase.pricingBreakdown?.discountAmount || 0}</span></div>
                     </div>
                     <div className="bg-gray-50 p-4 border-t border-gray-200 flex justify-between items-center">
                        <span className="text-sm font-black text-gray-800 uppercase tracking-wider">Total Amount</span>
                        <span className="text-2xl font-black text-green-600">₹{selectedCase.totalAmount}</span>
                     </div>
                  </div>
               </InfoSection>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ManageEmergencyCases;

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
  <div className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-sm"><p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">{label}</p><p className="text-sm font-black text-gray-900 truncate">{value || 'N/A'}</p></div>
);

const CloseIcon = ({className}) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>);
const SpinnerIcon = ({className}) => (<svg className={className || "w-5 h-5 animate-spin"} fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>);