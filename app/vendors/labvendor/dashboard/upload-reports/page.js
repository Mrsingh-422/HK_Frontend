'use client'
import React, { useState, useEffect } from 'react'
import { FaFileMedical, FaSpinner, FaEye, FaUpload, FaUser, FaPhoneAlt, FaMapMarkerAlt, FaFlask } from 'react-icons/fa'
import LabVendorAPI from '@/app/services/LabVendorAPI'
import PatientInfoModal from './components/PatientInfoModal'
import LimsWorkspacePanel from './components/LimsWorkspacePanel'
import ReportViewModal from './components/ReportViewModal'

export default function UploadReportPage() {
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [statusFilter, setStatusFilter] = useState('Approved')

  // Modals & Panels Active state
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isInfoOpen, setIsInfoOpen] = useState(false)
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false)
  const [isReportViewerOpen, setIsReportViewerOpen] = useState(false)

  useEffect(() => {
    fetchOrdersList();
  }, [statusFilter]);

  const fetchOrdersList = async () => {
    setLoadingOrders(true);
    try {
      const response = await LabVendorAPI.getOrders(statusFilter);
      if (response && response.success && response.data) {
        setOrders(response.data);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error("Error retrieving orders from API:", err);
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleActionClick = (order) => {
    setSelectedOrder(order);
    if (statusFilter === 'Completed') {
      setIsReportViewerOpen(true);
    } else {
      setIsInfoOpen(true);
    }
  };

  const getPatientName = (order) => {
    return order.patients?.[0]?.patientName || order.patients?.[0]?.name || order.userId?.name || 'Unknown Patient';
  };

  const getPatientPhone = (order) => {
    return order.userId?.phone || 'No Phone';
  };

  const getBookedItemsSummary = (order) => {
    const tests = order.items?.tests?.map(t => t.name) || [];
    const packageTests = order.items?.packages?.flatMap(p => 
      p.packageId?.tests?.map(nt => nt.testName) || []
    ) || [];
    const uniqueItems = Array.from(new Set([...tests, ...packageTests]));
    return uniqueItems.join(', ') || order.items?.packages?.map(p => p.name).join(', ') || 'No services booked';
  };

  const formatAddress = (order) => {
    if (order.collectionType === 'Visit Lab') {
      return 'Visit Lab (In-house)';
    }
    if (!order.address) {
      return 'Home Collection';
    }
    const { houseNo, sector, city, pincode } = order.address;
    return [houseNo, sector, city, pincode].filter(Boolean).join(', ');
  };

  return (
    <div className="w-full relative px-2 py-4">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1e3a8a] flex items-center gap-2.5">
            <FaFileMedical className="text-[#08B36A]"/> Upload Reports
          </h1>
          <p className="text-gray-500 text-xs mt-1">Configure diagnostic outputs or construct smart lab results dynamically.</p>
        </div>

        {/* Tab Filter */}
        <div className="flex bg-gray-100 p-1.5 rounded-xl border border-gray-200">
          {['Approved', 'Testing', 'Completed'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === status 
                  ? 'bg-white text-[#1e3a8a] shadow-sm' 
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loadingOrders ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <FaSpinner className="text-[#08B36A] animate-spin" size={32} />
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Querying diagnostic queue...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50/70 border-b border-gray-100 text-gray-500 text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Booking ID</th>
                  <th className="px-6 py-4">Patient Info</th>
                  <th className="px-6 py-4">Booked Services (Recursive)</th>
                  <th className="px-6 py-4">Address / Mode</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-400 text-xs font-bold uppercase tracking-widest">
                      No matching bookings in queue.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr 
                      key={order._id} 
                      onClick={() => handleActionClick(order)}
                      className="hover:bg-green-50/30 transition-colors duration-150 cursor-pointer group"
                    >
                      {/* Booking ID */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-bold text-gray-800 font-mono tracking-tight text-xs">{order.bookingId}</span>
                      </td>

                      {/* Patient Info */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-800 flex items-center gap-2 text-xs">
                            <FaUser className="text-gray-400 text-xs"/> {getPatientName(order)}
                          </span>
                          <span className="text-xs font-bold text-[#08B36A] mt-1 flex items-center gap-2">
                            <FaPhoneAlt className="text-gray-400 text-xs"/> {getPatientPhone(order)}
                          </span>
                        </div>
                      </td>

                      {/* Booked Items */}
                      <td className="px-6 py-4 max-w-xs">
                        <div className="flex items-start gap-1.5 text-xs text-gray-700 font-semibold">
                          <FaFlask className="text-slate-400 mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-2" title={getBookedItemsSummary(order)}>
                            {getBookedItemsSummary(order)}
                          </span>
                        </div>
                      </td>

                      {/* Address */}
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-2 text-xs text-gray-600 max-w-xs">
                          <FaMapMarkerAlt className="text-gray-400 mt-1 flex-shrink-0" />
                          <span className="line-clamp-2" title={formatAddress(order)}>{formatAddress(order)}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          
                          {/* Always render View action trigger */}
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleActionClick(order); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold rounded-lg transition-colors border border-blue-100"
                          >
                            <FaEye size={13} /> View
                          </button>

                          {/* Render Upload action trigger ONLY on the Testing status tab */}
                          {statusFilter === 'Testing' && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); setIsWorkspaceOpen(true); }}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#08B36A] hover:bg-green-600 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                            >
                              <FaUpload size={12} /> Upload
                            </button>
                          )}

                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 🌟 1. PATIENT DEMOGRAPHICS OVERVIEW MODAL 🌟 */}
      {isInfoOpen && selectedOrder && (
        <PatientInfoModal 
          order={selectedOrder}
          onClose={() => { setIsInfoOpen(false); setSelectedOrder(null); }}
          onEnterLims={(order) => { setIsInfoOpen(false); setSelectedOrder(order); setIsWorkspaceOpen(true); }}
        />
      )}

      {/* 🌟 2. REPORT VIEW COMPLETED MODAL 🌟 */}
      {isReportViewerOpen && selectedOrder && (
        <ReportViewModal 
          order={selectedOrder}
          onClose={() => { setIsReportViewerOpen(false); setSelectedOrder(null); }}
        />
      )}

      {/* 🌟 3. ACTIVE LIMS REPORT BUILDER WORKSPACE 🌟 */}
      {isWorkspaceOpen && selectedOrder && (
        <LimsWorkspacePanel 
          order={selectedOrder}
          onClose={() => { setIsWorkspaceOpen(false); setSelectedOrder(null); }}
          onSuccess={() => { setIsWorkspaceOpen(false); setSelectedOrder(null); fetchOrdersList(); }}
        />
      )}

    </div>
  )
}