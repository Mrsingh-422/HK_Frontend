'use client'
import LabVendorAPI from '@/app/services/LabVendorAPI';
import React, { useState, useEffect } from 'react'
import { 
  FaHistory, 
  FaUser, 
  FaRupeeSign, 
  FaEye, 
  FaTimes, 
  FaFileInvoice,
  FaCalendarAlt,
  FaFilePdf,
  FaEnvelope,
  FaPhone,
  FaHospital,
  FaVial,
  FaBoxOpen,
  FaInfoCircle,
  FaSpinner
} from 'react-icons/fa'
 // Adjust import path according to your structure

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5002';

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination & Statistics
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  // State for Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch data on component mount & page change
  const fetchOrderHistory = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await LabVendorAPI.getOrderHistory(page);
      if (response && response.success) {
        setOrders(response.data || []);
        setTotalOrders(response.total || 0);
        setCurrentPage(response.currentPage || 1);
        setTotalPages(response.totalPages || 1);
      } else {
        setError('Could not retrieve order history.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderHistory(currentPage);
  }, [currentPage]);

  // Handler to open Modal
  const handleRowClick = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  // Handler to close Modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  // Helper to construct download report file URL
  const handleDownloadReport = (order) => {
    if (!order.reportFile) {
      alert('Report file is not available for download.');
      return;
    }
    const fullUrl = order.reportFile.startsWith('http') 
      ? order.reportFile 
      : `${BASE_URL}${order.reportFile}`;
    window.open(fullUrl, '_blank');
  };

  // Parse appointment/creation date to readable format
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="w-full relative">
      
      {/* ========================================= */}
      {/* HEADER SECTION                            */}
      {/* ========================================= */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1e3a8a] flex items-center gap-2">
            <FaHistory className="text-[#08B36A]"/> Order History
          </h1>
          <p className="text-gray-500 text-sm mt-1">View past orders and download their complete reports.</p>
        </div>
        
        {/* Total Orders Badge */}
        <div className="bg-[#1e3a8a]/5 border border-[#1e3a8a]/10 px-5 py-2.5 rounded-xl flex items-center gap-3">
          <span className="text-sm font-bold text-gray-600">Total Orders:</span>
          <span className="bg-[#1e3a8a] text-white text-lg font-black px-3 py-0.5 rounded-lg shadow-sm">
            {totalOrders}
          </span>
        </div>
      </div>

      {/* ========================================= */}
      {/* TABLE SECTION                             */}
      {/* ========================================= */}
      {loading ? (
        <div className="flex flex-col justify-center items-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <FaSpinner className="animate-spin text-4xl text-[#08B36A] mb-3" />
          <p className="text-gray-500 font-medium">Fetching your order history...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-white border border-red-100 rounded-2xl shadow-sm">
          <p className="text-red-500 font-semibold mb-2">{error}</p>
          <button 
            onClick={() => fetchOrderHistory(currentPage)}
            className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm transition-colors font-bold"
          >
            Retry Loading
          </button>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                
                <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 font-bold">Order ID</th>
                    <th className="px-6 py-4 font-bold">Patient Name(s)</th>
                    <th className="px-6 py-4 font-bold">Price</th>
                    <th className="px-6 py-4 font-bold text-center">Action</th>
                  </tr>
                </thead>
                
                <tbody className="divide-y divide-gray-100">
                  {orders.map((order) => {
                    const patientsLabel = order.patients?.map(p => p.name.trim()).join(', ') || 'N/A';
                    return (
                      <tr 
                        key={order._id} 
                        onClick={() => handleRowClick(order)} 
                        className="hover:bg-green-50/50 transition-colors duration-200 cursor-pointer group"
                      >
                        
                        {/* Order ID & Icon */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-[#1e3a8a]">
                              <FaFileInvoice size={18} />
                            </div>
                            <div>
                              <span className="font-bold text-gray-800 block">{order.bookingId}</span>
                              <span className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                <FaCalendarAlt /> {formatDate(order.appointmentDate)}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Patient Name */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-bold text-gray-700 flex items-center gap-2">
                            <FaUser className="text-gray-400 text-sm"/> {patientsLabel}
                          </span>
                        </td>

                        {/* Price */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-black text-[#08B36A] flex items-center gap-0.5 text-base">
                            <FaRupeeSign className="text-sm"/> {order.billSummary?.totalAmount ?? 0}
                          </span>
                        </td>

                        {/* Action Button */}
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              handleRowClick(order); 
                            }}
                            className="px-4 py-2 bg-[#08B36A] hover:bg-green-600 text-white text-xs font-bold rounded-full transition-colors shadow-sm inline-flex items-center gap-1.5"
                          >
                            <FaEye size={14} /> View Details
                          </button>
                        </td>

                      </tr>
                    )
                  })}
                </tbody>
              </table>

              {/* Empty State if no orders */}
              {orders.length === 0 && (
                <div className="p-12 text-center text-gray-500">
                  <FaHistory className="text-4xl mx-auto mb-3 text-gray-300" />
                  <p>No order history found.</p>
                </div>
              )}
            </div>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4 px-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm bg-white border border-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-all"
              >
                Previous
              </button>
              <span className="text-sm text-gray-500 font-semibold">
                Page {currentPage} of {totalPages}
              </span>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm bg-white border border-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-all"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}


      {/* ========================================= */}
      {/* 🌟 FULL ORDER INFO & REPORT MODAL 🌟      */}
      {/* ========================================= */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          
          {/* Backdrop Blur */}
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
            onClick={handleCloseModal}
          ></div>

          {/* Modal Content */}
          <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200 max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h2 className="text-lg font-bold text-[#1e3a8a] flex items-center gap-2">
                  <FaFileInvoice className="text-[#08B36A]"/> Complete Booking Summary
                </h2>
                <span className="text-xs text-gray-500 block mt-0.5">Booking Type: {selectedOrder.bookingType}</span>
              </div>
              <button 
                onClick={handleCloseModal} 
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
              >
                <FaTimes size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto">
              
              {/* Top Banner (Order ID & Status) */}
              <div className="flex flex-col sm:flex-row justify-between items-center bg-blue-50/70 p-4 rounded-xl border border-blue-100 gap-3">
                <div className="text-center sm:text-left">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Order ID</p>
                  <p className="text-lg font-black text-[#1e3a8a] tracking-wider">{selectedOrder.bookingId}</p>
                </div>
                <div className="flex flex-col items-center sm:items-end">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    selectedOrder.status === 'Completed' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    Status: {selectedOrder.status}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">Payment: {selectedOrder.paymentStatus}</p>
                </div>
              </div>

              {/* Grid: Patient details & Lab Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Section A: Contact/User Info */}
                <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl space-y-2">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1 mb-2">
                    <FaUser className="text-[#1e3a8a]"/> Account Holder Info
                  </h3>
                  <p className="text-sm font-bold text-gray-800">{selectedOrder.userId?.name || 'N/A'}</p>
                  <p className="text-xs text-gray-600 flex items-center gap-1.5">
                    <FaPhone className="text-gray-400" /> {selectedOrder.userId?.phone || 'N/A'}
                  </p>
                  <p className="text-xs text-gray-600 flex items-center gap-1.5 break-all">
                    <FaEnvelope className="text-gray-400" /> {selectedOrder.userId?.email || 'N/A'}
                  </p>
                </div>

                {/* Section B: Visit details */}
                <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl space-y-2">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1 mb-2">
                    <FaHospital className="text-[#1e3a8a]"/> Collection Details
                  </h3>
                  <p className="text-sm font-bold text-gray-800">Type: {selectedOrder.collectionType}</p>
                  <p className="text-xs text-gray-600 flex items-center gap-1.5">
                    <FaCalendarAlt className="text-gray-400" /> Appt: {formatDate(selectedOrder.appointmentDate)} @ {selectedOrder.appointmentTime || 'N/A'}
                  </p>
                  {selectedOrder.tracking?.otp && (
                    <p className="text-xs text-blue-700 bg-blue-50 inline-block px-2 py-0.5 rounded font-bold">
                      Tracking OTP: {selectedOrder.tracking.otp}
                    </p>
                  )}
                </div>

              </div>

              {/* Section: Patient details list */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Patient(s) Tested</h3>
                <div className="space-y-2">
                  {selectedOrder.patients?.map((patient, idx) => (
                    <div key={idx} className="flex flex-wrap justify-between items-center p-3 bg-white border border-gray-100 rounded-xl">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-700">
                          {idx + 1}
                        </div>
                        <div>
                          <span className="text-sm font-bold text-gray-800 block">{patient.name}</span>
                          <span className="text-xs text-gray-500">{patient.gender} • Relation: {patient.relation}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section: Booked Items */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Ordered Tests & Packages</h3>
                <div className="space-y-3">
                  
                  {/* Standalone Tests */}
                  {selectedOrder.items?.tests?.map((test) => (
                    <div key={test.testId} className="p-3 bg-white border border-gray-100 rounded-xl flex justify-between items-center shadow-xs">
                      <div className="flex items-center gap-2">
                        <FaVial className="text-blue-500" />
                        <div>
                          <span className="text-sm font-bold text-gray-800 block">{test.name}</span>
                          <span className="text-xs text-gray-400">Standalone Test</span>
                        </div>
                      </div>
                      <span className="text-sm font-extrabold text-[#08B36A]">₹{test.price}</span>
                    </div>
                  ))}

                  {/* Packages */}
                  {selectedOrder.items?.packages?.map((pkg) => (
                    <div key={pkg._id} className="p-3.5 bg-white border border-gray-100 rounded-xl shadow-xs space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <FaBoxOpen className="text-amber-500" />
                          <div>
                            <span className="text-sm font-bold text-gray-800 block">{pkg.name}</span>
                            <span className="text-xs text-gray-400">Combo Package</span>
                          </div>
                        </div>
                        <span className="text-sm font-extrabold text-[#08B36A]">₹{pkg.price}</span>
                      </div>
                      
                      {/* Nested Test Items inside Package */}
                      {pkg.packageId?.tests?.length > 0 && (
                        <div className="pl-6 pt-1 border-t border-dashed border-gray-100">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Includes tests:</p>
                          <ul className="list-disc pl-3 text-xs text-gray-600 space-y-0.5">
                            {pkg.packageId.tests.map((subtest, subIdx) => (
                              <li key={subIdx}>{subtest.testName}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Billing Breakdown */}
              <div className="border-t border-gray-100 pt-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Billing Details</h3>
                <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl space-y-2">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Item Total:</span>
                    <span className="font-semibold">₹{selectedOrder.billSummary?.itemTotal || 0}</span>
                  </div>
                  {selectedOrder.billSummary?.couponDiscount > 0 && (
                    <div className="flex justify-between text-xs text-red-600">
                      <span>Coupon Discount:</span>
                      <span className="font-semibold">-₹{selectedOrder.billSummary.couponDiscount}</span>
                    </div>
                  )}
                  {selectedOrder.billSummary?.homeVisitCharge > 0 && (
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Home Visit Charge:</span>
                      <span className="font-semibold">₹{selectedOrder.billSummary.homeVisitCharge}</span>
                    </div>
                  )}
                  {selectedOrder.billSummary?.distanceCharge > 0 && (
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Distance Charge:</span>
                      <span className="font-semibold">₹{selectedOrder.billSummary.distanceCharge}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm text-gray-800 border-t border-gray-200/60 pt-2 font-bold">
                    <span>Total Amount Paid:</span>
                    <span className="text-[#08B36A] text-base">₹{selectedOrder.billSummary?.totalAmount || 0}</span>
                  </div>
                </div>
              </div>

              {/* Payment Details Metadata if present */}
              {selectedOrder.paymentDetails?.razorpayPaymentId && (
                <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-lg space-y-1">
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Transaction Details</p>
                  <p className="text-xs text-gray-600">
                    Method: <span className="font-bold text-gray-700 capitalize">{selectedOrder.paymentDetails.method || selectedOrder.paymentMethod}</span>
                  </p>
                  <p className="text-xs text-gray-600">
                    Txn ID: <span className="font-semibold text-gray-700">{selectedOrder.paymentDetails.razorpayPaymentId}</span>
                  </p>
                </div>
              )}

            </div>

            {/* Modal Footer (Action Buttons) */}
            <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
              <button 
                onClick={handleCloseModal} 
                className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-colors text-sm"
              >
                Close
              </button>
              
              {selectedOrder.reportFile ? (
                <button 
                  onClick={() => handleDownloadReport(selectedOrder)} 
                  className="px-6 py-2.5 bg-[#08B36A] hover:bg-green-600 text-white font-bold rounded-xl shadow-md shadow-green-200 transition-transform hover:-translate-y-0.5 flex items-center gap-2 text-sm"
                >
                  <FaFilePdf size={16} /> Download Report
                </button>
              ) : (
                <span className="text-xs text-gray-400 italic flex items-center gap-1">
                  <FaInfoCircle /> Report not uploaded
                </span>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}