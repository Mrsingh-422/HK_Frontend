"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  FaArrowLeft, 
  FaAmbulance, 
  FaUser, 
  FaMapMarkerAlt, 
  FaRegHospital, 
  FaUserNurse, 
  FaMoneyBillWave, 
  FaClock 
} from 'react-icons/fa';
import AdminAPI from '@/app/services/AdminAPI';

function AmbulanceOrdersPage() {
  const params = useParams();
  const router = useRouter();
  const ambulanceId = params.id; // Extracts dynamic [id] parameter from path

  // Core Data States
  const [orders, setOrders] = useState([]);
  const [ambulanceDetails, setAmbulanceDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);

  useEffect(() => {
    if (!ambulanceId) return;

    const fetchAmbulanceOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await AdminAPI.getParticularAmbulanceOrders(ambulanceId, currentPage, limit);
        
        // Handles standardized nested or flat payload distribution layouts
        const dataPayload = response?.data || response;

        if (dataPayload && Array.isArray(dataPayload)) {
          setOrders(dataPayload);
          setTotalPages(response?.totalPages || 1);
          
          // Pull common structural operator info from index 0 if available
          if (dataPayload.length > 0 && dataPayload[0].ambulanceId) {
            setAmbulanceDetails(dataPayload[0].ambulanceId);
          }
        } else {
          setError("Failed to retrieve operational dispatch history for this unit.");
        }
      } catch (err) {
        console.error("Error fetching ambulance logs:", err);
        setError("An unexpected error occurred while compiling booking transactions.");
      } finally {
        setLoading(false);
      }
    };

    fetchAmbulanceOrders();
  }, [ambulanceId, currentPage, limit]);

  // Status Color Customizer
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'searching':
        return 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse';
      case 'confirmed':
      case 'driver assigned':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  // Triage Custom Styles
  const getTriageStyle = (level) => {
    return level?.toLowerCase() === 'emergency'
      ? 'bg-rose-600 text-white font-extrabold animate-pulse'
      : 'bg-slate-100 text-slate-700 font-semibold';
  };

  return (
    <div className="bg-[#FAFBFD] min-h-screen text-slate-600 antialiased p-4 md:p-8">
      
      {/* Header Block Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors mb-3 bg-white px-3 py-1.5 rounded-lg border border-slate-200/60 shadow-sm"
          >
            <FaArrowLeft className="text-[10px]" /> Back to Ambulance Fleet
          </button>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {ambulanceDetails ? `${ambulanceDetails.name} — Fleet Logs` : 'Ambulance Logs'}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {ambulanceDetails?.vehicleNumber ? `Registration: ${ambulanceDetails.vehicleNumber} [${ambulanceDetails.vehicleType}]` : 'Overview of dispatch pipeline allocations'}
          </p>
        </div>
      </div>

      {/* Main Container Checkpoints */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 mb-4 border-blue-500"></div>
          <p className="text-slate-400 text-xs font-semibold tracking-wide">Syncing emergency timelines...</p>
        </div>
      ) : error ? (
        <div className="text-center py-24 text-rose-500 font-semibold bg-rose-50/20 border border-rose-100 rounded-2xl p-6 text-sm">
          {error}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-slate-100 text-slate-400 text-sm font-medium shadow-sm">
          No dispatch trips captured on this emergency transit unit.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Dispatch Logs Map */}
          <div className="grid grid-cols-1 gap-6">
            {orders.map((order) => (
              <div 
                key={order._id} 
                className="bg-white rounded-2xl shadow-[0_4px_25px_rgba(15,23,42,0.02)] border border-slate-200/70 overflow-hidden hover:shadow-[0_4px_30px_rgba(15,23,42,0.04)] transition-all"
              >
                {/* Header Card Sub-bar */}
                <div className="bg-slate-50/70 border-b border-slate-100 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="p-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold">
                      <FaAmbulance />
                    </span>
                    <div>
                      <div className="text-xs font-mono font-bold text-slate-900">{order.bookingId}</div>
                      <div className="text-[11px] text-slate-400 font-medium">
                        Dispatched: {new Date(order.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                      </div>
                    </div>
                  </div>
                  
                  {/* Status/Priority Indicators */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2.5 py-0.5 text-[10px] uppercase tracking-wider rounded-full ${getTriageStyle(order.triageLevel)}`}>
                      {order.triageLevel}
                    </span>
                    <span className={`px-2.5 py-0.5 text-[11px] font-extrabold tracking-wide rounded-full border uppercase ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                    <span className="px-2.5 py-0.5 text-[11px] font-bold bg-slate-100 text-slate-600 rounded-full text-xs">
                      {order.serviceType}
                    </span>
                  </div>
                </div>

                {/* Main Body Grid Layout splitting payload indicators */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                  
                  {/* Column 1: Client and Patient Breakdown */}
                  <div className="space-y-4">
                    <div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                        <FaUser className="text-[10px]" /> Requester Account
                      </div>
                      <div className="font-bold text-slate-900 text-sm">{order.userId?.name || 'Unknown User'}</div>
                      <div className="text-xs text-slate-500 font-medium">{order.userId?.email}</div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">{order.userId?.phone}</div>
                    </div>

                    {order.patientDetails && (
                      <div className="pt-3 border-t border-slate-100">
                        <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wide mb-1.5">Manifest Patient Details</div>
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs">
                          <div className="font-bold text-slate-800">{order.patientDetails.name} ({order.patientDetails.relation})</div>
                          <div className="text-[11px] text-rose-600 font-medium mt-0.5">Reported Condition: {order.patientDetails.condition}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Column 2: Route Mapping Context & Onboard Crew Staffing */}
                  <div className="pt-6 md:pt-0 md:px-6 space-y-4">
                    {/* Destination Hospital */}
                    <div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                        <FaRegHospital className="text-[10px]" /> Destination Trauma Facility
                      </div>
                      <div className="font-bold text-slate-900 text-sm">{order.hospitalId?.name || 'In-Transit / Unspecified'}</div>
                      {order.hospitalId?.address && <div className="text-xs text-slate-500 mt-0.5 leading-tight">{order.hospitalId.address}</div>}
                    </div>

                    {/* Onboard Support Medical Crew */}
                    <div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                        <FaUserNurse className="text-[10px]" /> Enroute Life Support Crew
                      </div>
                      <div className="flex gap-2">
                        <span className={`px-2 py-1 rounded-lg text-xs font-semibold border ${order.supportStaffSelected?.doctor ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-400 border-slate-200/60 line-through'}`}>
                          MD Doctor
                        </span>
                        <span className={`px-2 py-1 rounded-lg text-xs font-semibold border ${order.supportStaffSelected?.nurse ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-400 border-slate-200/60 line-through'}`}>
                          Paramedic Nurse
                        </span>
                      </div>
                    </div>

                    {/* Case Timeline Footprint Logs */}
                    {order.trackingTimeline && order.trackingTimeline.length > 0 && (
                      <div>
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1.5">
                          <FaClock className="text-[10px]" /> Status Ledger Update
                        </div>
                        <div className="text-xs p-2 bg-slate-50 border border-slate-100 rounded-xl italic text-slate-600">
                          "{order.trackingTimeline[order.trackingTimeline.length - 1].note}"
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Column 3: Pickup Geolocation Coordinates & Pricing Summary */}
                  <div className="pt-6 md:pt-0 md:pl-6 space-y-4">
                    {/* Pickup Address Box */}
                    <div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                        <FaMapMarkerAlt className="text-[10px]" /> Pickup Location Node
                      </div>
                      <div className="text-xs bg-slate-50/50 p-2.5 border border-slate-100 rounded-xl">
                        <p className="text-slate-600 text-[11px] leading-relaxed line-clamp-2">{order.pickupLocation?.address}</p>
                        <div className="text-[10px] text-slate-400 font-mono mt-1 flex gap-2">
                          <span>Lat: {order.pickupLocation?.lat}</span>
                          <span>Lng: {order.pickupLocation?.lng}</span>
                        </div>
                      </div>
                    </div>

                    {/* Financial Processing Frame */}
                    <div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                        <FaMoneyBillWave className="text-[10px]" /> Invoice Invoicing Summary
                      </div>
                      <div className="bg-slate-900 text-slate-100 p-3 rounded-xl shadow-inner space-y-1 text-xs">
                        <div className="flex justify-between opacity-80 text-[11px]">
                          <span>Base Transit Fee:</span>
                          <span>₹{order.pricing?.ambulanceCharge || 0}</span>
                        </div>
                        {order.pricing?.supportingStaffCharge > 0 && (
                          <div className="flex justify-between opacity-80 text-[11px]">
                            <span>Medical Crew Fee:</span>
                            <span>+₹{order.pricing.supportingStaffCharge}</span>
                          </div>
                        )}
                        {order.pricing?.discount > 0 && (
                          <div className="flex justify-between text-emerald-400 text-[11px]">
                            <span>Coupon Savings ({order.couponDetails?.couponCode || 'Promo'}):</span>
                            <span>-₹{order.pricing.discount}</span>
                          </div>
                        )}
                        <div className="border-t border-slate-700/60 my-1 pt-1 flex justify-between font-bold text-sm text-white">
                          <span>Total Collected Net:</span>
                          <span>₹{order.pricing?.total || 0}</span>
                        </div>
                        <div className="flex justify-between text-[10px] pt-1 text-slate-400 font-semibold tracking-wide">
                          <span>Gateway: {order.paymentMethod}</span>
                          <span className={order.paymentStatus === 'Paid' ? 'text-emerald-400' : 'text-amber-400'}>
                            [{order.paymentStatus}]
                          </span>
                        </div>
                      </div>
                    </div>

                  </div>

                </div>
              </div>
            ))}
          </div>

          {/* Pagination Footer */}
          <div className="flex items-center justify-between p-4 px-6 border border-slate-200/60 rounded-xl bg-white shadow-sm">
            <span className="text-xs font-semibold text-slate-500">
              Showing log page <strong className="text-slate-900 font-bold">{currentPage}</strong> of <strong className="text-slate-900 font-bold">{totalPages}</strong>
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
                  currentPage === 1 
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200/60' 
                    : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200 shadow-sm'
                }`}
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 text-xs font-bold rounded-xl text-white transition-all shadow-sm ${
                  currentPage === totalPages 
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

export default AmbulanceOrdersPage;