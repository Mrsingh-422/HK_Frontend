"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FaChevronLeft, 
  FaRegCalendarAlt, 
  FaUser, 
  FaBoxes,
  FaBriefcaseMedical,
  FaMapMarkerAlt,
  FaFileInvoiceDollar,
  FaHospital,
  FaUserNurse,
  FaCar,
  FaPhoneAlt
} from 'react-icons/fa';
import AdminAPI from '@/app/services/AdminAPI';

function ViewNurseOrders({ params }) {
  const router = useRouter();
  
  // Safely unwrap dynamic route token using React.use()
  const { id: nurseId } = React.use(params);

  // Core Data States
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Navigation Index States
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);

  // Vendor context display backup extraction
  const [nurseProfile, setNurseProfile] = useState(null);

  useEffect(() => {
    if (!nurseId) return;

    const fetchNurseOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await AdminAPI.getParticularNurseOrders(nurseId, currentPage, limit);
        
        // Structure check (Handles both raw arrays or standard nested data payloads)
        const dataPayload = Array.isArray(response) ? response : response?.data;
        const totalPagesCount = response?.totalPages || 1;

        if (dataPayload) {
          setBookings(dataPayload);
          setTotalPages(totalPagesCount);
          
          // Capture static nurse identity details from reference data if loaded
          if (dataPayload.length > 0 && dataPayload[0].nurseId) {
            setNurseProfile(dataPayload[0].nurseId);
          }
        } else {
          setError("Failed to retrieve service assignment logs for this nurse provider.");
        }
      } catch (err) {
        console.error("Error retrieving individual nurse orders:", err);
        setError("An error occurred while matching transaction logs for this service vendor.");
      } finally {
        setLoading(false);
      }
    };

    fetchNurseOrders();
  }, [nurseId, currentPage, limit]);

  // Utility to parse standard ISO dates cleanly
  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Helper status color layout assignments
  const getStatusBadgeStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'assigned':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="bg-[#FAFBFD] min-h-screen text-slate-600 antialiased p-4 md:p-8 font-sans">
      
      {/* Return Control & Identity Context header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <button 
            onClick={() => router.back()}
            className="group flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors mb-3 bg-white px-3 py-1.5 rounded-lg border border-slate-200/60 shadow-sm cursor-pointer"
          >
            <FaChevronLeft className="text-[10px] transform group-hover:-translate-x-0.5 transition-transform" />
            Back to Nurse Directory
          </button>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {nurseProfile ? `${nurseProfile.name} — Activity Ledger` : 'Nurse Job Bookings'}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Audit log of assigned clinical home-care services, hospital bedside sessions, and dispatched staff.
          </p>
        </div>
        
        {bookings.length > 0 && (
          <div className="text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-4 py-2 rounded-xl text-xs font-bold shadow-sm tracking-wide inline-flex items-center gap-2 self-start sm:self-center">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Total Records Tracked: {bookings.length}
          </div>
        )}
      </div>

      {/* Main Core View Engine */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 mb-4 border-emerald-500"></div>
          <p className="text-slate-400 text-xs font-semibold tracking-wide">Syncing assigned medical registries...</p>
        </div>
      ) : error ? (
        <div className="text-center py-24 text-rose-500 font-semibold bg-rose-50/20 border border-rose-100 rounded-2xl p-6 text-sm">
          {error}
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-slate-100 text-slate-400 text-sm font-medium shadow-sm">
          No current or historical bookings verified for this nursing account.
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Table Container Matrix */}
          <div className="bg-white rounded-2xl shadow-[0_4px_25px_rgba(15,23,42,0.02)] border border-slate-200/70 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1100px]">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 text-xs font-bold tracking-wider uppercase">
                    <th className="p-4 pl-6 w-32">Booking ID</th>
                    <th className="p-4 w-48">
                      <span className="flex items-center gap-1.5"><FaBriefcaseMedical className="text-[10px]" /> Service Details</span>
                    </th>
                    <th className="p-4 w-44">
                      <span className="flex items-center gap-1.5"><FaRegCalendarAlt className="text-[10px]" /> Schedule</span>
                    </th>
                    <th className="p-4 w-44">
                      <span className="flex items-center gap-1.5"><FaUserNurse className="text-[10px]" /> Field Staff</span>
                    </th>
                    <th className="p-4">
                      <span className="flex items-center gap-1.5"><FaUser className="text-[10px]" /> Patient Profile</span>
                    </th>
                    <th className="p-4">
                      <span className="flex items-center gap-1.5"><FaMapMarkerAlt className="text-[10px]" /> Location / Hospital</span>
                    </th>
                    <th className="p-4 text-center w-36">
                      <span className="flex items-center justify-center gap-1.5"><FaFileInvoiceDollar className="text-[10px]" /> Payment Net</span>
                    </th>
                    <th className="p-4 text-center w-28 pr-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                  {bookings.map((booking) => {
                    const isHospital = booking.assessmentLocation === "At Hospital" || Boolean(booking.hospitalDetails);
                    const hosp = booking.hospitalDetails || {};
                    const staff = booking.assignedStaff || booking.assignedStaffId || {};

                    return (
                      <tr key={booking._id} className="hover:bg-slate-50/40 transition-colors group">
                        
                        {/* Booking ID */}
                        <td className="p-4 pl-6 font-mono text-xs font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                          #{booking.bookingId || 'N/A'}
                        </td>

                        {/* Service Details */}
                        <td className="p-4">
                          <div className="space-y-0.5">
                            <p className="font-bold text-slate-800 line-clamp-1">
                              {booking.serviceDetails?.title || 'Home Nursing Care'}
                            </p>
                            <div className="flex flex-wrap gap-1 items-center">
                              <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-600 rounded">
                                {booking.serviceDetails?.type || booking.schedule?.duration || 'Care'}
                              </span>
                              {booking.completedSessionsCount > 0 && (
                                <span className="px-2 py-0.5 text-[9px] font-black bg-emerald-50 text-emerald-700 rounded border border-emerald-100">
                                  {booking.completedSessionsCount} Days Done
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Schedule Timeline */}
                        <td className="p-4 text-xs font-medium text-slate-500">
                          <div className="space-y-1">
                            <div className="text-slate-700 font-semibold">
                              {formatDate(booking.schedule?.startDate)}
                            </div>
                            {booking.schedule?.startTime && (
                              <p className="text-[11px] bg-slate-100/80 text-slate-600 px-1.5 py-0.5 rounded w-max font-mono border border-slate-200/40">
                                {booking.schedule.startTime}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Assigned Staff Nurse & Vehicle */}
                        <td className="p-4">
                          {staff.name ? (
                            <div className="space-y-0.5 text-xs">
                              <p className="font-bold text-slate-800 flex items-center gap-1">
                                <FaUserNurse className="text-[#08B36A] text-[10px]" /> {staff.name}
                              </p>
                              {staff.phone && (
                                <p className="text-[10px] text-slate-500 font-mono">{staff.phone}</p>
                              )}
                              {staff.vehicleNumber && (
                                <p className="text-[9px] text-slate-400 font-mono flex items-center gap-1">
                                  <FaCar size={8} /> {staff.vehicleNumber}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 italic">Unassigned</span>
                          )}
                        </td>

                        {/* Patients Profiles Stack */}
                        <td className="p-4">
                          <div className="space-y-1">
                            {booking.patients && booking.patients.map((patient, pIdx) => (
                              <div key={patient._id || pIdx} className="flex items-center gap-1 text-xs">
                                <span className="font-bold text-slate-800">{patient.name}</span>
                                <span className="text-slate-400 text-[11px]">
                                  ({patient.age} yrs • {patient.gender})
                                </span>
                              </div>
                            ))}
                            
                            {booking.selectedConsumables?.length > 0 && (
                              <div className="flex items-center gap-1 mt-1 text-[10px] font-medium text-slate-500 bg-slate-50 border border-slate-100 rounded-md px-1.5 py-0.5 w-max">
                                <FaBoxes className="text-slate-400 text-[10px]" />
                                <span>+{booking.selectedConsumables.length} Consumables</span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Location / Hospital Bedside Details */}
                        <td className="p-4 text-xs font-medium text-slate-500">
                          {isHospital ? (
                            <div className="space-y-0.5 max-w-[200px] bg-purple-50 p-2 rounded-xl border border-purple-100 text-purple-950">
                              <p className="font-black flex items-center gap-1 text-[11px]">
                                <FaHospital className="text-purple-600 shrink-0" size={10} /> {hosp.hospitalName || "Hospital Care"}
                              </p>
                              <p className="text-[10px] text-purple-800">
                                {hosp.wardName || "Ward"} • {hosp.bedNumber || "Bed"}
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-0.5 max-w-[200px]">
                              <p className="font-bold text-slate-800 truncate">{booking.address?.name}</p>
                              <p className="text-slate-400 truncate text-[11px]">
                                {booking.address?.houseNo}, {booking.address?.city}
                              </p>
                              <p className="font-mono text-[10px] text-slate-400">{booking.address?.phone}</p>
                            </div>
                          )}
                        </td>

                        {/* Financial Net */}
                        <td className="p-4 text-center">
                          <div className="space-y-0.5">
                            <span className="font-mono font-bold text-slate-900 text-xs block">
                              ₹{(booking.totalAmount || booking.priceBreakdown?.totalPrice || 0).toLocaleString('en-IN')}
                            </span>
                            <span className="text-[9px] font-bold uppercase text-slate-400 block">
                              {booking.paymentMethod || "Online"} ({booking.paymentStatus || "Paid"})
                            </span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="p-4 text-center pr-6">
                          <span className={`px-2.5 py-0.5 inline-flex text-[10px] font-extrabold tracking-wide rounded-full border uppercase ${getStatusBadgeStyle(booking.status)}`}>
                            {booking.status || 'Pending'}
                          </span>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between p-4 px-6 border-t border-slate-100 bg-white">
              <span className="text-xs font-semibold text-slate-500">
                Page <strong className="text-slate-900 font-bold">{currentPage}</strong> of <strong className="text-slate-900 font-bold">{totalPages}</strong>
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
                    currentPage === 1 
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200/60' 
                      : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200 shadow-sm active:scale-95 cursor-pointer'
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 text-xs font-bold rounded-xl text-white transition-all shadow-sm active:scale-95 cursor-pointer ${
                    currentPage === totalPages 
                      ? 'bg-slate-300 cursor-not-allowed' 
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default ViewNurseOrders;