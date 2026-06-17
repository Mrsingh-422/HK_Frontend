"use client";

import React, { useState, useEffect, useMemo } from 'react';
import HospitalAPI from '@/app/services/HospitalAPI';

const ReferralBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Tab State
  const [activeTab, setActiveTab] = useState('referred'); // 'pickup' or 'delivered'

  useEffect(() => {
    fetchReferrals();
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
          onClick={() => setActiveTab('pickup')}
          className={`py-4 px-6 text-xs font-black uppercase tracking-widest border-b-4 transition-all flex items-center gap-2 ${activeTab === 'pickup'
              ? 'border-[#08B36A] text-[#08B36A]'
              : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
        >
          referred
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${activeTab === 'pickup' ? 'bg-[#08B36A]/10 text-[#08B36A]' : 'bg-gray-100 text-gray-400'
            }`}>
            {categorizedBookings.pickup.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('delivered')}
          className={`py-4 px-6 text-xs font-black uppercase tracking-widest border-b-4 transition-all flex items-center gap-2 ${activeTab === 'delivered'
              ? 'border-[#08B36A] text-[#08B36A]'
              : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
        >
          referral received
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${activeTab === 'delivered' ? 'bg-[#08B36A]/10 text-[#08B36A]' : 'bg-gray-100 text-gray-400'
            }`}>
            {categorizedBookings.delivered.length}
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
              <button onClick={() => setSelectedBooking(null)} className="text-gray-400 hover:text-red-500 bg-gray-50 w-10 h-10 flex items-center justify-center rounded-full transition-all border border-gray-200">
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 space-y-8">
              {/* SECTION 1: LOGISTICS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#08B36A]/5 p-6 rounded-2xl border border-[#08B36A]/10">
                  <h4 className="text-[10px] font-black text-[#08B36A] uppercase tracking-widest mb-4">Transfer Route</h4>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Pickup From</p>
                      <p className="text-sm font-black text-gray-800">{selectedBooking.pickupHospitalId?.name}</p>
                    </div>
                    <div className="text-2xl">➡</div>
                    <div className="flex-1">
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Drop To</p>
                      <p className="text-sm font-black text-gray-800">{selectedBooking.hospitalId?.name}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-900 p-6 rounded-2xl text-white shadow-xl">
                  <h4 className="text-[10px] font-black text-[#08B36A] uppercase tracking-widest mb-4">Patient Status</h4>
                  <div className="grid grid-cols-2 gap-4">
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
                    <div className="group relative rounded-2xl overflow-hidden border-2 border-gray-100 h-64 bg-gray-50">
                      <img src={getFullUrl(selectedBooking.patientDetails.referralCard)} className="w-full h-full object-contain" alt="Referral Card" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                        <button onClick={() => window.open(getFullUrl(selectedBooking.patientDetails.referralCard), '_blank')} className="bg-white text-black px-6 py-2 rounded-full font-black text-xs">View Full Image</button>
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
const CloseIcon = ({ className }) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M6 18L18 6M6 6l12 12" /></svg>);
const SpinnerIcon = ({ className }) => (<svg className={className} fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>);

export default ReferralBookings;