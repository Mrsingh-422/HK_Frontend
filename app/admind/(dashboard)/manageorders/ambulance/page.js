'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import AdminAPI from '../../../../services/AdminAPI'; // Adjust path as needed
import { 
  FaSearch, 
  FaEye, 
  FaTimes, 
  FaTruck, 
  FaClock, 
  FaEnvelope, 
  FaIdBadge, 
  FaCalendarAlt,
  FaTrashAlt, 
  FaArrowLeft,
  FaHospital,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaUserInjured,
  FaChevronLeft,
  FaChevronRight,
  FaMoneyBillWave,
  FaStethoscope
} from 'react-icons/fa';

export default function AmbulanceOrders() {
  // --- STATE MANAGEMENT ---
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalCount: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- API FETCHING ---
  const fetchBookings = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const response = await AdminAPI.getAmbulanceBookings(page, 10);
      if (response.success) {
        setOrders(response.data);
        setPagination({
          currentPage: response.currentPage,
          totalPages: response.totalPages,
          totalCount: response.count
        });
      }
    } catch (error) {
      console.error("Error fetching ambulance bookings:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // --- LOGIC ---

  // Local Search Filter
  const filteredOrders = useMemo(() => {
    return orders.filter(order => 
      order.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) || 
      order.patientDetails?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.ambulanceId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, orders]);

  const openDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed': return 'bg-green-50 text-green-600 ring-green-100';
      case 'Cancelled': return 'bg-red-50 text-red-600 ring-red-100';
      default: return 'bg-orange-50 text-orange-600 ring-orange-100';
    }
  };

  const getTriageColor = (level) => {
    if (level === 'Emergency') return 'text-red-500';
    if (level === 'Very Urgent') return 'text-orange-500';
    return 'text-blue-500';
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
              <FaTruck className="text-[#08B36A] text-2xl" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none uppercase">AMBULANCE ORDERS</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">Emergency Dispatch Monitoring</p>
            </div>
          </div>
          <button onClick={() => window.history.back()} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-6 py-2.5 rounded-xl font-bold text-xs shadow-sm hover:bg-slate-50 transition-all uppercase tracking-widest">
            <FaArrowLeft /> GO BACK
          </button>
        </div>

        {/* --- MAIN CONTENT CARD --- */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
          
          <div className="p-6 border-b border-slate-50 bg-white flex flex-col md:flex-row justify-between gap-4">
            <div className="relative max-w-md w-full group">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#08B36A] transition-colors" />
              <input 
                type="text" 
                placeholder="Search ID, patient or provider..." 
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#08B36A]/20 transition-all font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                  <th className="p-6">Sr.No</th>
                  <th className="p-6">Patient / Contact</th>
                  <th className="p-6">Ambulance Provider</th>
                  <th className="p-6">Booking ID</th>
                  <th className="p-6">Service Type</th>
                  <th className="p-6">Status</th>
                  <th className="p-6 text-center">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                    <tr><td colSpan="7" className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest animate-pulse">Fetching Dispatch Data...</td></tr>
                ) : filteredOrders.map((order, index) => (
                  <tr 
                    key={order._id} 
                    onClick={() => openDetails(order)}
                    className="group hover:bg-slate-50/80 cursor-pointer transition-all"
                  >
                    <td className="p-6 text-sm font-bold text-slate-300">
                        {(pagination.currentPage - 1) * 10 + index + 1}
                    </td>
                    <td className="p-6">
                        <p className="text-sm font-black text-slate-800 tracking-tight">{order.patientDetails?.name}</p>
                        <p className="text-[10px] font-bold text-[#08B36A] uppercase">{order.userId?.email || order.userId?.phone}</p>
                    </td>
                    <td className="p-6">
                        <div className="flex items-center gap-2">
                           <FaHospital className="text-slate-300 group-hover:text-[#08B36A] transition-colors" size={12}/>
                           <span className="text-sm font-bold text-slate-600">{order.ambulanceId?.name}</span>
                        </div>
                    </td>
                    <td className="p-6 text-sm font-bold text-blue-600 tracking-tighter">{order.bookingId}</td>
                    <td className="p-6">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tight">{order.serviceType}</p>
                        <p className={`text-[9px] font-bold uppercase ${getTriageColor(order.triageLevel)}`}>{order.triageLevel}</p>
                    </td>
                    <td className="p-6">
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ring-1 ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-6 text-center">
                       <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center mx-auto text-slate-400 group-hover:text-blue-500 transition-colors">
                          <FaEye />
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* --- PAGINATION --- */}
          <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Page {pagination.currentPage} of {pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <button 
                disabled={pagination.currentPage === 1}
                onClick={() => fetchBookings(pagination.currentPage - 1)}
                className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 disabled:opacity-30 hover:text-[#08B36A] transition-all"
              >
                <FaChevronLeft size={12}/>
              </button>
              <button 
                disabled={pagination.currentPage === pagination.totalPages}
                onClick={() => fetchBookings(pagination.currentPage + 1)}
                className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 disabled:opacity-30 hover:text-[#08B36A] transition-all"
              >
                <FaChevronRight size={12}/>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- DETAILS MODAL --- */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-8 bg-[#08B36A] text-white flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight">Ambulance Mission Details</h2>
                <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest mt-1">Order Ref: {selectedOrder.bookingId}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition-all outline-none">
                <FaTimes />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-10 space-y-8 overflow-y-auto no-scrollbar">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                    <InfoItem icon={<FaIdBadge/>} label="Case Reference" val={selectedOrder.caseReference} />
                    <InfoItem icon={<FaCalendarAlt/>} label="Created At" val={new Date(selectedOrder.createdAt).toLocaleDateString()} />
                    <InfoItem icon={<FaTruck/>} label="Vehicle Type" val={selectedOrder.ambulanceId?.vehicleType} />
                    <InfoItem icon={<FaCheckCircle/>} label="Vehicle No" val={selectedOrder.ambulanceId?.vehicleNumber} />
                    <InfoItem icon={<FaStethoscope/>} label="Service" val={selectedOrder.serviceType} />
                    <InfoItem icon={<FaMapMarkerAlt/>} label="OTP" val={selectedOrder.otp} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-5 bg-slate-50 rounded-[2rem] border border-slate-100">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-4">Patient Information</p>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#08B36A] shadow-sm font-black text-lg">
                                <FaUserInjured />
                            </div>
                            <div>
                                <p className="text-base font-black text-slate-800 leading-none">{selectedOrder.patientDetails?.name}</p>
                                <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase">{selectedOrder.patientDetails?.relation}</p>
                                <p className={`text-[10px] font-bold mt-1 ${selectedOrder.patientDetails?.condition === 'Stable' ? 'text-green-500' : 'text-red-500'}`}>Condition: {selectedOrder.patientDetails?.condition}</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-5 bg-slate-900 rounded-[2rem] text-white">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Pricing Summary</p>
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-bold">
                                <span className="text-slate-400">Base Charge</span>
                                <span>₹{selectedOrder.pricing?.ambulanceCharge}</span>
                            </div>
                            <div className="flex justify-between text-xs font-bold">
                                <span className="text-slate-400">Staff Charge</span>
                                <span>₹{selectedOrder.pricing?.supportingStaffCharge}</span>
                            </div>
                            <div className="flex justify-between text-xs font-bold text-red-400">
                                <span>Discount</span>
                                <span>-₹{selectedOrder.pricing?.discount}</span>
                            </div>
                            <div className="flex justify-between text-base font-black border-t border-white/10 pt-2 mt-2">
                                <span>Total Paid</span>
                                <span className="text-[#08B36A]">₹{selectedOrder.pricing?.total}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Hospitals Involved</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex gap-3">
                            <FaHospital className="text-blue-500 mt-1" />
                            <div>
                                <p className="text-[8px] font-black text-slate-400 uppercase">Drop-off Hospital</p>
                                <p className="text-xs font-black text-slate-700">{selectedOrder.hospitalId?.name}</p>
                                <p className="text-[10px] font-bold text-slate-400">{selectedOrder.hospitalId?.address}</p>
                            </div>
                        </div>
                        {selectedOrder.pickupHospitalId && (
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex gap-3">
                                <FaHospital className="text-orange-500 mt-1" />
                                <div>
                                    <p className="text-[8px] font-black text-slate-400 uppercase">Pickup Hospital</p>
                                    <p className="text-xs font-black text-slate-700">Referral Facility</p>
                                    <p className="text-[10px] font-bold text-slate-400">ID: {selectedOrder.pickupHospitalId}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3 justify-center py-4 bg-[#08B36A]/5 rounded-2xl border border-[#08B36A]/10">
                    <FaCheckCircle className="text-[#08B36A]" size={14} />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Status:</span>
                    <span className="px-4 py-1 bg-[#08B36A] text-white rounded-lg text-[9px] font-black uppercase tracking-widest ml-2 shadow-sm">{selectedOrder.status}</span>
                </div>
            </div>

            {/* Modal Footer */}
            <div className="px-10 pb-10">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-slate-800 transition-all active:scale-[0.98]"
              >
                Close Mission Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Helper Component for Modal Data ---
function InfoItem({ icon, label, val }) {
    return (
        <div className="flex gap-4">
            <div className="text-[#08B36A] mt-1 opacity-60 shrink-0 text-sm">{icon}</div>
            <div>
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">{label}</p>
                <p className="text-sm font-black text-slate-700 truncate max-w-[150px]">{val || "N/A"}</p>
            </div>
        </div>
    )
}