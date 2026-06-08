"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  FaChevronLeft, FaFlask, FaUser, FaPhone, FaMapMarkerAlt,
  FaCalendarAlt, FaClock, FaCoins, FaBox, FaTimesCircle
} from 'react-icons/fa';
import AdminAPI from '@/app/services/AdminAPI';

function Page() {
  const params = useParams();
  const router = useRouter();
  const labId = params?.id; // Dynamic route segment id

  // Component states
  const [orders, setOrders] = useState([]);
  const [labDetails, setLabDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination states matching your API layout
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 10;

  useEffect(() => {
    if (!labId) return;

    const fetchLabOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        // Calling your custom function with state parameters
        const response = await AdminAPI.getParticularLabOrders(labId, currentPage, limit);

        if (response && response.success) {
          const fetchedData = response.data || [];
          setOrders(fetchedData);
          setTotalPages(response.totalPages || 1);
          setTotalCount(response.count || 0);

          // Extract basic lab meta-details from the first record if available
          if (fetchedData.length > 0 && fetchedData[0].labId) {
            setLabDetails(fetchedData[0].labId);
          }
        } else {
          setError("Could not load matching laboratory records.");
        }
      } catch (err) {
        console.error("Error pulling lab orders:", err);
        setError("An error occurred while tracking server orders data.");
      } finally {
        setLoading(false);
      }
    };

    fetchLabOrders();
  }, [labId, currentPage]);

  // Status Style Switcher Engine
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Phlebotomist Assigned':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  // Safe formatting helper for appointment strings
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-[#FAFBFD] min-h-screen text-slate-600 antialiased py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Back and Navigation Actions Bar */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors mb-6 bg-white px-3 py-2 rounded-xl border border-slate-200/60 shadow-sm"
        >
          <FaChevronLeft className="text-[10px]" />
          Back to Channels
        </button>

        {/* Dynamic Context Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
          <div>
            <span className="text-xs font-bold tracking-widest text-emerald-600 uppercase flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              Manifest File Archive
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
              {labDetails ? `${labDetails.name}'s Orders` : 'Laboratory Order History'}
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              {labDetails?.city ? `Operating Hub Location: ${labDetails.city}` : 'Overview of diagnostics bookings status logs'}
            </p>
          </div>
          <div className="bg-slate-900 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm tracking-wide">
            Total Manifest Count: {totalCount}
          </div>
        </div>

        {/* Workspace Load Triggers */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 bg-white rounded-2xl border border-slate-200/60 shadow-sm">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 mb-4 border-emerald-500"></div>
            <p className="text-slate-400 text-xs font-bold tracking-wide">Fetching secure laboratory transactions...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20 text-rose-500 font-semibold text-sm bg-rose-50/50 rounded-2xl border border-rose-200/60">
            {error}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-2xl border border-slate-200/60 shadow-sm flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-3 border border-slate-100">
              <FaBox className="text-sm" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No Booking History Documented</h3>
            <p className="text-xs text-slate-400 max-w-sm mt-1">This specific network branch hasn't registered active lab assignments or processing logs yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Orders Feed Loop Grid */}
            <div className="grid grid-cols-1 gap-6">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="bg-white rounded-2xl border border-slate-200/60 shadow-[0_2px_12px_rgba(15,23,42,0.015)] overflow-hidden hover:border-slate-300 transition-all duration-200"
                >

                  {/* Top Order Meta Summary Banner Line */}
                  <div className="bg-slate-50/70 px-6 py-4 border-b border-slate-100 flex flex-wrap justify-between items-center gap-3">
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-black font-mono text-slate-900 tracking-wider bg-white px-2.5 py-1 rounded-lg border border-slate-200/60 shadow-xs">
                        {order.bookingId}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                        <FaCalendarAlt className="text-[11px]" />
                        {formatDate(order.appointmentDate)}
                        <span className="text-slate-200">|</span>
                        <FaClock className="text-[11px]" />
                        {order.appointmentTime}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-400 bg-white px-2.5 py-1 rounded-lg border border-slate-200/40">
                        {order.collectionType || 'Direct Visit'}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border tracking-wide uppercase ${getStatusBadgeClass(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>

                  {/* Booking Details Breakdown Container Row */}
                  <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">

                    {/* Column 1: Assigned Target Items Stack */}
                    <div className="space-y-4 pb-4 lg:pb-0">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                        <FaFlask className="text-emerald-500" />
                        Tests & Packages Included
                      </h3>
                      <div className="space-y-2">
                        {order.items?.tests?.map((test) => (
                          <div key={test._id} className="flex justify-between items-center bg-slate-50 border border-slate-100 p-3 rounded-xl">
                            <span className="text-xs font-bold text-slate-800">{test.name}</span>
                            <span className="text-xs font-extrabold text-slate-900 font-mono">₹{test.price}</span>
                          </div>
                        ))}
                        {order.items?.packages?.map((pkg) => (
                          <div key={pkg._id} className="flex justify-between items-center bg-indigo-50/50 border border-indigo-100 p-3 rounded-xl">
                            <span className="text-xs font-bold text-indigo-900">{pkg.name} (Package)</span>
                            <span className="text-xs font-extrabold text-indigo-950 font-mono">₹{pkg.price}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Column 2: Client/Patients Details Mapping */}
                    <div className="space-y-4 pt-4 lg:pt-0 lg:px-6">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                        <FaUser className="text-blue-500" />
                        Customer Profile Details
                      </h3>

                      {/* Submitting account profile info */}
                      <div className="text-xs bg-slate-50/40 p-3 rounded-xl border border-slate-100">
                        <p className="font-extrabold text-slate-900">{order.userId?.name}</p>
                        <p className="text-slate-400 font-semibold mt-0.5 flex items-center gap-1">
                          <FaPhone className="text-[9px]" /> {order.userId?.phone}
                        </p>
                      </div>

                      {/* Diagnostic Target Patient List Stack */}
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Patient Manifest</p>
                        <div className="flex flex-wrap gap-1.5">
                          {order.patients?.map((patient) => (
                            <span key={patient._id} className="inline-flex text-[11px] font-bold px-2 py-1 bg-white border border-slate-200 rounded-lg shadow-2xs text-slate-700">
                              {patient.name} ({patient.gender}/{patient.relation})
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Column 3: Transaction Accounting Details Ledger */}
                    <div className="space-y-4 pt-4 lg:pt-0 lg:pl-6 flex flex-col justify-between">
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                          <FaCoins className="text-amber-500" />
                          Bill Settlement Balance
                        </h3>

                        <div className="space-y-1.5 mt-3 text-xs font-semibold">
                          <div className="flex justify-between text-slate-400">
                            <span>Itemized Total:</span>
                            <span className="font-mono">₹{order.billSummary?.itemTotal}</span>
                          </div>
                          {order.billSummary?.couponDiscount > 0 && (
                            <div className="flex justify-between text-emerald-600">
                              <span>Promo Voucher Savings:</span>
                              <span className="font-mono">-₹{order.billSummary?.couponDiscount}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-slate-900 font-black text-sm pt-2 border-t border-dashed border-slate-200">
                            <span>Net Payable Due:</span>
                            <span className="font-mono text-emerald-600">₹{order.billSummary?.totalAmount}</span>
                          </div>
                        </div>
                      </div>

                      {/* Transaction Gateway Tracking Line Details */}
                      <div className="pt-4 flex items-center justify-between gap-2 border-t border-slate-100 text-[11px] font-bold">
                        <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-md text-slate-600">
                          Gateway: <span className="text-slate-900 uppercase font-extrabold">{order.paymentMethod}</span>
                        </div>
                        <span className={`px-2 py-1 rounded-md ${order.paymentStatus === 'Completed'
                            ? 'bg-emerald-100/70 text-emerald-800'
                            : 'bg-amber-100/70 text-amber-800'
                          }`}>
                          Payment: {order.paymentStatus}
                        </span>
                      </div>

                    </div>
                  </div>

                  {/* Error Manifest Handling Trigger Dropdowns */}
                  {order.cancelReason && (
                    <div className="px-6 py-2.5 bg-rose-50/50 border-t border-rose-100 flex items-center gap-2 text-xs font-semibold text-rose-700">
                      <FaTimesCircle className="text-rose-500 flex-shrink-0" />
                      <span>System Interruption Notice: <strong className="font-bold">{order.cancelReason}</strong></span>
                    </div>
                  )}

                </div>
              ))}
            </div>

            {/* Pagination Controls Footer Component bar */}
            <div className="flex items-center justify-between p-4 px-6 bg-white border border-slate-200/60 rounded-2xl shadow-sm">
              <span className="text-xs font-semibold text-slate-500">
                Page <strong className="text-slate-900 font-bold">{currentPage}</strong> of <strong className="text-slate-900 font-bold">{totalPages}</strong>
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${currentPage === 1
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200/60'
                      : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200 shadow-sm active:scale-95'
                    }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 text-xs font-bold rounded-xl text-white transition-all shadow-sm active:scale-95 ${currentPage === totalPages
                      ? 'bg-slate-300 cursor-not-allowed'
                      : 'bg-emerald-500 hover:bg-emerald-600'
                    }`}
                >
                  Next
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

export default Page;