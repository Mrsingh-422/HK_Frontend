"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  FaArrowLeft,
  FaRegHospital,
  FaUser,
  FaMapMarkerAlt,
  FaProcedures,
  FaUserMd,
  FaMoneyBillWave,
  FaConciergeBell
} from 'react-icons/fa';
import AdminAPI from '@/app/services/AdminAPI';

function HospitalOrdersPage() {
  const params = useParams();
  const router = useRouter();
  const hospitalId = params.id; // Extracts dynamic [id] from your route path

  // Core Data States
  const [bookings, setBookings] = useState([]);
  const [hospitalDetails, setHospitalDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);

  useEffect(() => {
    if (!hospitalId) return;

    const fetchHospitalBookings = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await AdminAPI.getParticularHospitalOrders(hospitalId, currentPage, limit);

        // Adapts to standard normalized api models
        const dataPayload = response?.data || response;

        if (dataPayload && Array.isArray(dataPayload)) {
          setBookings(dataPayload);
          setTotalPages(response?.totalPages || 1);

          // Pull common structural hospital data from row index 0 if available
          if (dataPayload.length > 0 && dataPayload[0].hospitalId) {
            setHospitalDetails(dataPayload[0].hospitalId);
          }
        } else {
          setError("Failed to retrieve booking logs for this hospital account.");
        }
      } catch (err) {
        console.error("Error fetching hospital bookings:", err);
        setError("An error occurred while loading admission transactions.");
      } finally {
        setLoading(false);
      }
    };

    fetchHospitalBookings();
  }, [hospitalId, currentPage, limit]);

  // Workflow Status Color Badge Helper
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'hospital-pending':
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'in-progress':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'cancelled-by-hospital':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  // Triage Alert Level Priority System
  const getTriageStyle = (level) => {
    switch (level?.toLowerCase()) {
      case 'emergency':
        return 'bg-rose-600 text-white animate-pulse font-extrabold';
      case 'urgent':
        return 'bg-orange-500 text-white font-bold';
      default:
        return 'bg-slate-100 text-slate-700 font-medium';
    }
  };

  return (
    <div className="bg-[#FAFBFD] min-h-screen text-slate-600 antialiased p-4 md:p-8">

      {/* Dynamic Nav Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors mb-3 bg-white px-3 py-1.5 rounded-lg border border-slate-200/60 shadow-sm"
          >
            <FaArrowLeft className="text-[10px]" /> Back to Hospital Registry
          </button>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {hospitalDetails ? `${hospitalDetails.name} — Activity Ledger` : 'Hospital Bookings'}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {hospitalDetails ? `Location info: ${hospitalDetails.address}` : 'Overview of specific medical admission pipeline'}
          </p>
        </div>
      </div>

      {/* Main Core View Container */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 mb-4 border-blue-500"></div>
          <p className="text-slate-400 text-xs font-semibold tracking-wide">Syncing admission records...</p>
        </div>
      ) : error ? (
        <div className="text-center py-24 text-rose-500 font-semibold bg-rose-50/20 border border-rose-100 rounded-2xl p-6 text-sm">
          {error}
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-slate-100 text-slate-400 text-sm font-medium shadow-sm">
          No admission histories verified on this line item.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Booking Cards Stack Stack Grid */}
          <div className="grid grid-cols-1 gap-6">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-white rounded-2xl shadow-[0_4px_25px_rgba(15,23,42,0.02)] border border-slate-200/70 overflow-hidden hover:shadow-[0_4px_30px_rgba(15,23,42,0.04)] transition-all"
              >
                {/* Header Sub-Bar of Card */}
                <div className="bg-slate-50/70 border-b border-slate-100 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="p-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold">
                      <FaRegHospital />
                    </span>
                    <div>
                      <div className="text-xs font-mono font-bold text-slate-900">{booking.bookingId}</div>
                      <div className="text-[11px] text-slate-400 font-medium">
                        Registered: {new Date(booking.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                      </div>
                    </div>
                  </div>

                  {/* Operational Tags Matrix */}
                  <div className="flex flex-wrap items-center gap-2">
                    {booking.triageLevel && (
                      <span className={`px-2.5 py-0.5 text-[10px] uppercase tracking-wider rounded-full ${getTriageStyle(booking.triageLevel)}`}>
                        {booking.triageLevel}
                      </span>
                    )}
                    <span className={`px-2.5 py-0.5 text-[11px] font-extrabold tracking-wide rounded-full border uppercase ${getStatusColor(booking.status)}`}>
                      {booking.status?.replace('-', ' ')}
                    </span>
                    <span className="px-2.5 py-0.5 text-[11px] font-bold bg-slate-100 text-slate-600 rounded-full">
                      {booking.bookingType}
                    </span>
                  </div>
                </div>

                {/* Grid Core Body Split */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-100">

                  {/* Column 1: Client Account & Patient Profile */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <FaUser className="text-[10px]" /> Account Details
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{booking.userId?.name || 'Unknown User'}</div>
                        <div className="text-xs text-slate-500 font-medium">{booking.userId?.email}</div>
                        <div className="text-xs text-slate-400 font-mono mt-0.5">{booking.userId?.phone}</div>
                      </div>
                    </div>

                    {booking.patients && booking.patients.length > 0 && (
                      <div className="pt-3 border-t border-slate-100 space-y-1.5">
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Patient Case</div>
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs">
                          <div className="font-bold text-slate-900">{booking.patients[0].patientName}</div>
                          <div className="text-slate-500 text-[11px] mt-0.5">
                            {booking.patients[0].gender} • Age: {booking.patients[0].patientAge} ({booking.patients[0].relation})
                          </div>
                          {booking.patients[0].reasonForVisit && (
                            <p className="mt-1.5 pt-1.5 border-t border-slate-200/60 italic text-slate-600 text-[11px]">
                              " {booking.patients[0].reasonForVisit} "
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Column 2: Assigned Ward Configuration & Medical Services */}
                  <div className="pt-6 md:pt-0 md:px-6 space-y-4">
                    {/* Bed Allocation Module */}
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <FaProcedures className="text-[10px]" /> Bed Allocation
                      </div>
                      {booking.bedNumber || booking.wardName ? (
                        <div className="bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 text-xs">
                          <div className="font-bold text-slate-900 flex justify-between">
                            <span>Bed: {booking.bedNumber || 'Not Assigned'}</span>
                            <span className="text-[10px] px-1.5 bg-blue-50 text-blue-700 rounded border border-blue-100 font-mono">
                              {booking.bedBookingType}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">Ward: {booking.wardName || 'General Wards'}</div>
                        </div>
                      ) : (
                        <div className="text-xs text-slate-400 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100 border-dashed">
                          No diagnostic bed mapped yet.
                        </div>
                      )}
                    </div>

                    {/* Attending Practitioner Module */}
                    {booking.doctorId && (
                      <div className="space-y-2">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <FaUserMd className="text-[10px]" /> Assigned Doctor
                        </div>
                        <div className="flex items-center gap-2.5 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 text-xs">
                          <div>
                            <div className="font-bold text-slate-900">{booking.doctorId.name}</div>
                            <div className="text-[11px] text-blue-600 font-medium">{booking.doctorId.speciality}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Premium / Special Care Services Add-ons */}
                    {booking.specialServices && booking.specialServices.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <FaConciergeBell className="text-[10px]" /> Special Service Add-ons
                        </div>
                        <div className="space-y-1">
                          {booking.specialServices.map((srv) => (
                            <div key={srv._id} className="flex justify-between items-center text-[11px] bg-slate-50 border border-slate-100 rounded-lg p-1.5 px-2.5">
                              <span className="font-medium text-slate-700">{srv.serviceName}</span>
                              <span className="font-bold text-slate-900">₹{srv.price}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Column 3: Geolocation Coordinates & Invoice Net Breakdown */}
                  <div className="pt-6 md:pt-0 md:pl-6 space-y-4">
                    {/* Address Block */}
                    <div className="space-y-1.5">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <FaMapMarkerAlt className="text-[10px]" /> Primary Source Context
                      </div>
                      <div className="text-xs bg-slate-50/50 p-2.5 border border-slate-100 rounded-xl">
                        <div className="font-bold text-slate-800">
                          {booking.address?.addressType || 'Home Address Frame'}
                        </div>
                        <p className="text-slate-400 text-[11px] font-mono mt-1">
                          Timeline Start: {new Date(booking.startDate).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                        </p>
                      </div>
                    </div>

                    {/* Financial Accounting Section */}
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <FaMoneyBillWave className="text-[10px]" /> Invoice & Bill Matrix
                      </div>
                      <div className="bg-slate-900 text-slate-100 p-3 rounded-xl shadow-inner space-y-1 text-xs">
                        <div className="flex justify-between opacity-80 text-[11px]">
                          <span>Base Fee Structure:</span>
                          <span>₹{booking.pricingBreakdown?.baseFee || 0}</span>
                        </div>
                        {booking.pricingBreakdown?.visitCharges > 0 && (
                          <div className="flex justify-between opacity-80 text-[11px]">
                            <span>Visit Surcharges:</span>
                            <span>+₹{booking.pricingBreakdown.visitCharges}</span>
                          </div>
                        )}
                        {booking.pricingBreakdown?.extraCharges > 0 && (
                          <div className="flex justify-between opacity-80 text-[11px]">
                            <span>Ancillary Charges:</span>
                            <span>+₹{booking.pricingBreakdown.extraCharges}</span>
                          </div>
                        )}
                        {booking.pricingBreakdown?.discountAmount > 0 && (
                          <div className="flex justify-between text-emerald-400 text-[11px]">
                            <span>Deductions / Discounts:</span>
                            <span>-₹{booking.pricingBreakdown.discountAmount}</span>
                          </div>
                        )}
                        <div className="border-t border-slate-700/60 my-1 pt-1 flex justify-between font-bold text-sm text-white">
                          <span>Total Invoiced Net:</span>
                          <span>₹{booking.totalAmount || booking.pricingBreakdown?.subtotal || 0}</span>
                        </div>
                        <div className="flex justify-between text-[10px] pt-1 text-slate-400 font-semibold tracking-wide uppercase">
                          <span>Status:</span>
                          <span className={booking.paymentStatus === 'Paid' ? 'text-emerald-400' : 'text-amber-400'}>
                            [{booking.paymentStatus || 'Unpaid'}]
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>

          {/* Pagination Toolbar Footer */}
          <div className="flex items-center justify-between p-4 px-6 border border-slate-200/60 rounded-xl bg-white shadow-sm">
            <span className="text-xs font-semibold text-slate-500">
              Showing log page <strong className="text-slate-900 font-bold">{currentPage}</strong> of <strong className="text-slate-900 font-bold">{totalPages}</strong>
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${currentPage === 1
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200/60'
                    : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200 shadow-sm'
                  }`}
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 text-xs font-bold rounded-xl text-white transition-all shadow-sm ${currentPage === totalPages
                    ? 'bg-slate-300 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600'
                  }`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HospitalOrdersPage;