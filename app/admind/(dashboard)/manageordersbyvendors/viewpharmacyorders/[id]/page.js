"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FaArrowLeft, FaBox, FaUser, FaMapMarkerAlt, FaFileMedical, FaMoneyBillWave } from 'react-icons/fa';
import AdminAPI from '@/app/services/AdminAPI';

function PharmacyOrdersPage() {
  const params = useParams();
  const router = useRouter();
  const pharmacyId = params.id; // Extracts dynamic [id] from folder path

  // State Management
  const [orders, setOrders] = useState([]);
  const [pharmacyDetails, setPharmacyDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);

  useEffect(() => {
    if (!pharmacyId) return;

    const fetchPharmacyOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await AdminAPI.getParticularPharmacyOrders(pharmacyId, currentPage, limit);
        
        if (response && response.success) {
          setOrders(response.data || []);
          setTotalPages(response.totalPages || 1);
          
          // Pull common pharmacy info from the first record if available
          if (response.data && response.data.length > 0) {
            setPharmacyDetails(response.data[0].pharmacyId);
          }
        } else {
          setError("Failed to retrieve order logs for this vendor account.");
        }
      } catch (err) {
        console.error("Error fetching pharmacy orders:", err);
        setError("An error occurred while loading order transactions.");
      } finally {
        setLoading(false);
      }
    };

    fetchPharmacyOrders();
  }, [pharmacyId, currentPage, limit]);

  // Status Badge Styling Helper
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'placed':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'shipped':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'under review':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'delivered':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
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
            <FaArrowLeft className="text-[10px]" /> Back to Pharmacy Vendor list
          </button>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {pharmacyDetails ? `${pharmacyDetails.name} — Activity Ledger` : 'Pharmacy Orders'}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {pharmacyDetails ? `Location hub: ${pharmacyDetails.city}` : 'Overview of specific vendor fulfillment pipeline'}
          </p>
        </div>
      </div>

      {/* Main Container Core */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 mb-4 border-blue-500"></div>
          <p className="text-slate-400 text-xs font-semibold tracking-wide">Syncing order histories...</p>
        </div>
      ) : error ? (
        <div className="text-center py-24 text-rose-500 font-semibold bg-rose-50/20 border border-rose-100 rounded-2xl p-6 text-sm">
          {error}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-slate-100 text-slate-400 text-sm font-medium shadow-sm">
          No booked transactions captured on this line item.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Order Cards Stack Grid */}
          <div className="grid grid-cols-1 gap-6">
            {orders.map((order) => (
              <div 
                key={order._id} 
                className="bg-white rounded-2xl shadow-[0_4px_25px_rgba(15,23,42,0.02)] border border-slate-200/70 overflow-hidden hover:shadow-[0_4px_30px_rgba(15,23,42,0.04)] transition-all"
              >
                {/* Header Sub-Bar of Card */}
                <div className="bg-slate-50/70 border-b border-slate-100 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="p-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold">
                      <FaBox />
                    </span>
                    <div>
                      <div className="text-xs font-mono font-bold text-slate-900">{order.orderId}</div>
                      <div className="text-[11px] text-slate-400 font-medium">
                        Placed: {new Date(order.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                      </div>
                    </div>
                  </div>
                  
                  {/* Status Pills Container */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2.5 py-0.5 text-[11px] font-extrabold tracking-wide rounded-full border uppercase ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                    {order.isRapid && (
                      <span className="px-2.5 py-0.5 text-[11px] font-extrabold bg-rose-50 text-rose-600 border border-rose-200 rounded-full uppercase tracking-wide animate-pulse">
                        Rapid ⚡
                      </span>
                    )}
                    <span className="px-2.5 py-0.5 text-[11px] font-bold bg-slate-100 text-slate-600 rounded-full">
                      {order.collectionType}
                    </span>
                  </div>
                </div>

                {/* Grid Core Body Split */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                  
                  {/* Column 1: Client/Patient Profiler */}
                  <div className="space-y-3">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <FaUser className="text-[10px]" /> Account Details
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{order.userId?.name || 'Unknown User'}</div>
                      <div className="text-xs text-slate-500 font-medium">{order.userId?.email}</div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">{order.userId?.phone}</div>
                    </div>
                    {order.patients && order.patients.length > 0 && (
                      <div className="pt-2 border-t border-slate-50">
                        <span className="text-[11px] text-slate-400 font-medium">Patient Lineage: </span>
                        <span className="text-xs font-semibold text-slate-700">
                          {order.patients[0].name} ({order.patients[0].relation})
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Column 2: Items & Prescription Checkpoints */}
                  <div className="pt-6 md:pt-0 md:px-6 space-y-4">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <FaFileMedical className="text-[10px]" /> Prescription Items
                    </div>
                    
                    {/* Items mapping loop */}
                    <div className="space-y-2">
                      {order.items?.map((item) => (
                        <div key={item._id} className="bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 flex justify-between items-center text-xs">
                          <div>
                            <div className="font-bold text-slate-900">{item.name}</div>
                            <div className="text-[11px] text-slate-400">Course duration: {item.duration || 'N/A'}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-slate-800">₹{item.price}</div>
                            <div className="text-[10px] text-slate-400">Qty: {item.quantity}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Prescription Image Attachments View */}
                    {order.prescriptionImages && order.prescriptionImages.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="text-[11px] font-bold text-slate-400">Rx Documents Enclosed:</div>
                        <div className="flex gap-2 overflow-x-auto pb-1">
                          {order.prescriptionImages.map((img, i) => (
                            <a 
                              key={i} 
                              href={`http://192.168.1.26:5002/${img.replace(/^\/?public\//, '')}`}
                              target="_blank" 
                              rel="noreferrer"
                              className="text-[10px] bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white border border-blue-200 font-bold px-2 py-1 rounded transition-all"
                            >
                              View Script #{i + 1}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Column 3: Logistics & Bill Invoice Summary */}
                  <div className="pt-6 md:pt-0 md:pl-6 space-y-4">
                    {/* Delivery Address Block */}
                    <div className="space-y-1.5">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <FaMapMarkerAlt className="text-[10px]" /> Delivery Hub Address
                      </div>
                      <div className="text-xs bg-slate-50/50 p-2.5 border border-slate-100 rounded-xl">
                        <div className="font-bold text-slate-800">{order.address?.name} ({order.address?.addressType || 'Home'})</div>
                        <div className="text-slate-500 text-[11px] mt-0.5 leading-relaxed">
                          {order.address?.houseNo}, {order.address?.sector ? `Sec ${order.address.sector}, ` : ''} 
                          {order.address?.city} - {order.address?.pincode}
                        </div>
                        <div className="text-slate-400 font-mono text-[10px] mt-1">Ph: {order.address?.phone}</div>
                      </div>
                    </div>

                    {/* Financial Invoicing Matrix */}
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <FaMoneyBillWave className="text-[10px]" /> Payment & Invoice Summary
                      </div>
                      <div className="bg-slate-900 text-slate-100 p-3 rounded-xl shadow-inner space-y-1 text-xs">
                        <div className="flex justify-between opacity-80 text-[11px]">
                          <span>Items Subtotal:</span>
                          <span>₹{order.billSummary?.itemTotal}</span>
                        </div>
                        {order.billSummary?.deliveryCharge > 0 && (
                          <div className="flex justify-between opacity-80 text-[11px]">
                            <span>Delivery Fee:</span>
                            <span>+₹{order.billSummary.deliveryCharge}</span>
                          </div>
                        )}
                        {order.billSummary?.slotCharge > 0 && (
                          <div className="flex justify-between opacity-80 text-[11px]">
                            <span>Convenience Slot:</span>
                            <span>+₹{order.billSummary.slotCharge}</span>
                          </div>
                        )}
                        {order.billSummary?.couponDiscount > 0 && (
                          <div className="flex justify-between text-emerald-400 text-[11px]">
                            <span>Coupon Savings:</span>
                            <span>-₹{order.billSummary.couponDiscount}</span>
                          </div>
                        )}
                        <div className="border-t border-slate-700/60 my-1 pt-1 flex justify-between font-bold text-sm text-white">
                          <span>Total Collected:</span>
                          <span>₹{order.billSummary?.totalAmount}</span>
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

          {/* Pagination Toolbar Footer */}
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

export default PharmacyOrdersPage;