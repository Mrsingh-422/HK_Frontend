'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import AdminAPI from '../../../../services/AdminAPI'; // Adjust path as needed
import { 
  FaSearch, 
  FaEye, 
  FaTimes, 
  FaFlask, 
  FaClock, 
  FaEnvelope, 
  FaIdBadge, 
  FaCalendarAlt,
  FaTrashAlt,
  FaArrowLeft,
  FaMicroscope,
  FaCheckCircle,
  FaVials,
  FaUserCircle,
  FaChevronLeft,
  FaChevronRight,
  FaMapMarkerAlt,
  FaCreditCard
} from 'react-icons/fa';

export default function LabOrdersPage() {
  // --- STATE MANAGEMENT ---
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalCount: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- API FETCHING ---
  const fetchOrders = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const response = await AdminAPI.getLabBookings(page, 10);
      if (response.success) {
        setOrders(response.data);
        setPagination({
          currentPage: response.currentPage,
          totalPages: response.totalPages,
          totalCount: response.count
        });
      }
    } catch (error) {
      console.error("Error fetching lab bookings:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // --- LOGIC ---

  // Helper to extract test names from the nested items object
  const getTestNames = (items) => {
    const tests = items?.tests?.map(t => t.name) || [];
    const packages = items?.packages?.map(p => p.name) || [];
    const allItems = [...tests, ...packages];
    return allItems.length > 0 ? allItems.join(", ") : "General Diagnostic";
  };

  // Search filter (filters the currently fetched page)
  const filteredOrders = useMemo(() => {
    return orders.filter(order => 
      order.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) || 
      order.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.labId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, orders]);

  const openDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed': return 'bg-green-50 text-green-600 ring-1 ring-green-100';
      case 'Phlebotomist Assigned': return 'bg-blue-50 text-blue-600 ring-1 ring-blue-100';
      case 'Pending': return 'bg-orange-50 text-orange-600 ring-1 ring-orange-100';
      case 'Cancelled': 
      case 'Rejected': return 'bg-red-50 text-red-600 ring-1 ring-red-100';
      default: return 'bg-slate-50 text-slate-600 ring-1 ring-slate-100';
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
              <FaFlask className="text-[#08B36A] text-2xl" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none uppercase">LAB ORDERS</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">Diagnostic & Sample Collection Registry</p>
            </div>
          </div>
          <button onClick={() => window.history.back()} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-6 py-2.5 rounded-xl font-bold text-xs shadow-sm hover:bg-slate-50 transition-all uppercase tracking-widest">
            <FaArrowLeft /> GO BACK
          </button>
        </div>

        {/* --- MAIN CONTENT CARD --- */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          
          <div className="p-6 border-b border-slate-50 bg-white flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="relative max-w-md w-full group">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#08B36A] transition-colors" />
              <input 
                type="text" 
                placeholder="Search patient, Order ID or lab..." 
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#08B36A]/20 transition-all font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Total Records: {pagination.totalCount}</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                  <th className="p-6">Sr.No</th>
                  <th className="p-6">Patient Details</th>
                  <th className="p-6">Vendor (Laboratory)</th>
                  <th className="p-6">Order ID</th>
                  <th className="p-6">Status</th>
                  <th className="p-6 text-center">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                    <tr><td colSpan="6" className="p-20 text-center text-slate-300 font-bold uppercase tracking-widest animate-pulse">Syncing Lab Records...</td></tr>
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
                        <div className="flex items-center gap-3">
                           <FaUserCircle size={20} className="text-slate-200 group-hover:text-[#08B36A] transition-colors shrink-0"/>
                           <div>
                              <p className="text-sm font-black text-slate-800 tracking-tight">{order.userId?.name || "Unknown"}</p>
                              <p className="text-[10px] font-bold text-[#08B36A] uppercase">{order.userId?.phone || "No Contact"}</p>
                           </div>
                        </div>
                    </td>
                    <td className="p-6">
                        <div className="flex items-center gap-2">
                           <FaMicroscope className="text-slate-300 group-hover:text-[#08B36A] transition-colors" size={12}/>
                           <span className="text-sm font-bold text-slate-600">{order.labId?.name}</span>
                        </div>
                    </td>
                    <td className="p-6">
                        <p className="text-xs font-black text-blue-600 tracking-tighter">{order.bookingId}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase mt-1 truncate max-w-[150px]">{getTestNames(order.items)}</p>
                    </td>
                    <td className="p-6">
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-6 text-center">
                       <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center mx-auto text-slate-400 group-hover:text-blue-500 transition-colors shadow-sm">
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
                onClick={() => fetchOrders(pagination.currentPage - 1)}
                className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 disabled:opacity-30 hover:text-[#08B36A] transition-all shadow-sm"
              >
                <FaChevronLeft size={12}/>
              </button>
              <button 
                disabled={pagination.currentPage === pagination.totalPages}
                onClick={() => fetchOrders(pagination.currentPage + 1)}
                className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 disabled:opacity-30 hover:text-[#08B36A] transition-all shadow-sm"
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
          
          <div className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight">Order Detailed View</h2>
                <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest mt-1">Ref ID: {selectedOrder.bookingId}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all outline-none">
                <FaTimes />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-10 space-y-8 overflow-y-auto no-scrollbar">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                    <InfoItem icon={<FaIdBadge/>} label="Lab Booking ID" val={selectedOrder.bookingId} />
                    <InfoItem icon={<FaCalendarAlt/>} label="Appointment Date" val={new Date(selectedOrder.appointmentDate).toLocaleDateString()} />
                    <InfoItem icon={<FaClock/>} label="Scheduled Time" val={selectedOrder.appointmentTime} />
                    <InfoItem icon={<FaMicroscope/>} label="Testing Lab" val={selectedOrder.labId?.name} />
                    <InfoItem icon={<FaMapMarkerAlt/>} label="City" val={selectedOrder.labId?.city} />
                    <InfoItem icon={<FaVials/>} label="Collection" val={selectedOrder.collectionType} />
                </div>

                {/* Tests & Packages List */}
                <div className="border-t border-slate-100 pt-8">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-4">Items Summary</p>
                    <div className="space-y-2">
                        {selectedOrder.items?.tests?.map((test, idx) => (
                            <div key={idx} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <p className="text-xs font-black text-slate-800 uppercase">{test.name}</p>
                                <p className="text-xs font-black text-[#08B36A]">₹{test.price}</p>
                            </div>
                        ))}
                        {selectedOrder.items?.packages?.map((pkg, idx) => (
                            <div key={idx} className="flex justify-between items-center p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                                <div>
                                    <p className="text-xs font-black text-indigo-800 uppercase">{pkg.name}</p>
                                    <p className="text-[8px] font-bold text-indigo-400 uppercase">Package Inclusion</p>
                                </div>
                                <p className="text-xs font-black text-indigo-800">₹{pkg.price}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Patient Information */}
                <div className="border-t border-slate-100 pt-8">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-4">Patient Information</p>
                    <div className="space-y-3">
                        {selectedOrder.patients?.map((p, idx) => (
                            <div key={idx} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#08B36A] shadow-sm font-black text-sm">
                                    {p.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm font-black text-slate-800 leading-none">{p.name}</p>
                                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">{p.gender} • {p.relation}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Financial Summary */}
                <div className="bg-[#08B36A] rounded-[2rem] p-8 text-white">
                    <div className="flex items-center gap-2 mb-6">
                        <FaCreditCard className="opacity-50"/>
                        <p className="text-[10px] font-black uppercase tracking-widest">Final Bill Breakdown</p>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between text-xs font-bold">
                            <span className="opacity-70">Item Total</span>
                            <span>₹{selectedOrder.billSummary?.itemTotal}</span>
                        </div>
                        <div className="flex justify-between text-xs font-bold">
                            <span className="opacity-70">Home Visit / Delivery</span>
                            <span>₹{selectedOrder.billSummary?.homeVisitCharge + selectedOrder.billSummary?.rapidDeliveryCharge}</span>
                        </div>
                        <div className="flex justify-between text-xs font-bold text-red-100">
                            <span className="opacity-70">Coupon Discount</span>
                            <span>-₹{selectedOrder.billSummary?.couponDiscount}</span>
                        </div>
                        <div className="flex justify-between items-center border-t border-white/20 pt-4 mt-2">
                            <span className="text-sm font-black uppercase tracking-widest">Amount Paid</span>
                            <span className="text-3xl font-black">₹{selectedOrder.billSummary?.totalAmount}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Footer */}
            <div className="px-10 pb-10">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-slate-800 transition-all active:scale-[0.98]"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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