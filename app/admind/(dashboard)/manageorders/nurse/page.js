'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import AdminAPI from '../../../../services/AdminAPI';
import {
  FaSearch,
  FaEye,
  FaTimes,
  FaUserNurse,
  FaClock,
  FaCalendarAlt,
  FaArrowLeft,
  FaCheckCircle,
  FaUserCircle,
  FaMedkit,
  FaHome,
  FaChevronLeft,
  FaChevronRight,
  FaMapMarkerAlt,
  FaReceipt,
  FaBoxOpen,
  FaUsers,
  FaHospital,
  FaPhoneAlt,
  FaCar,
  FaMoneyBillWave,
  FaCreditCard,
  FaFilter
} from 'react-icons/fa';

const STATUS_FILTERS = ["All", "Pending", "Confirmed", "Assigned", "On-The-Way", "Arrived", "Service-Started", "Completed", "Cancelled"];

export default function NurseOrdersPage() {
  // --- STATE MANAGEMENT ---
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Debounce Search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPagination(prev => ({ ...prev, currentPage: 1 }));
    }, 350);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // --- API FETCHING ---
  const fetchBookings = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const response = await AdminAPI.getNursingBookings({
        page,
        limit: 10,
        status: statusFilter,
        search: debouncedSearch || undefined
      });
      if (response && response.success) {
        setOrders(response.data || []);
        setPagination({
          currentPage: response.currentPage || 1,
          totalPages: response.totalPages || 1,
          totalItems: response.totalItems || response.count || (response.data?.length ?? 0)
        });
      }
    } catch (error) {
      console.error("Error fetching nursing bookings:", error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, debouncedSearch]);

  useEffect(() => {
    fetchBookings(pagination.currentPage);
  }, [fetchBookings, pagination.currentPage]);

  const openDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Assigned': return 'bg-blue-50 text-blue-600 ring-1 ring-blue-100';
      case 'Confirmed': return 'bg-green-50 text-green-600 ring-1 ring-green-100';
      case 'Completed': return 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100';
      case 'Pending': return 'bg-orange-50 text-orange-600 ring-1 ring-orange-100';
      case 'Cancelled': return 'bg-red-50 text-red-600 ring-1 ring-red-100';
      case 'On-The-Way':
      case 'Arrived':
      case 'Service-Started': return 'bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100';
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
              <FaUserNurse className="text-[#08B36A] text-2xl" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none uppercase">NURSE ORDERS AUDIT</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">Clinical Home Care, Hospital Bedside & Dispatch Logs</p>
            </div>
          </div>
          <button 
            onClick={() => window.history.back()} 
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-6 py-2.5 rounded-xl font-bold text-xs shadow-sm hover:bg-slate-50 transition-all uppercase tracking-widest active:scale-95 cursor-pointer"
          >
            <FaArrowLeft /> GO BACK
          </button>
        </div>

        {/* --- MAIN CONTENT CARD --- */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">

          {/* Filter Bar */}
          <div className="p-6 border-b border-slate-50 bg-white flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="relative max-w-md w-full group">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#08B36A] transition-colors" />
              <input
                type="text"
                placeholder="Search Booking ID, Patient, Hospital..."
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#08B36A]/20 transition-all font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Status Dropdown */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-between">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 px-3 py-2 rounded-xl">
                <FaFilter size={11} className="text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPagination(prev => ({ ...prev, currentPage: 1 }));
                  }}
                  className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer"
                >
                  {STATUS_FILTERS.map(st => (
                    <option key={st} value={st}>{st === "All" ? "All Statuses" : st}</option>
                  ))}
                </select>
              </div>

              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0">
                Total: {pagination.totalItems} Bookings
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                  <th className="p-6 w-16">Sr.No</th>
                  <th className="p-6">Patient & Location</th>
                  <th className="p-6">Fulfilling Bureau</th>
                  <th className="p-6">Field Nurse / Staff</th>
                  <th className="p-6">Service / ID</th>
                  <th className="p-6">Payment</th>
                  <th className="p-6 text-center">Status</th>
                  <th className="p-6 text-center">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="p-20 text-center text-slate-300 font-bold uppercase animate-pulse">
                      Syncing Nurse Dispatch Records...
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="p-20 text-center text-slate-400 font-medium text-xs">
                      No matching nurse booking records found.
                    </td>
                  </tr>
                ) : orders.map((order, index) => {
                  const isHospital = order.assessmentLocation === "At Hospital" || Boolean(order.hospitalDetails);
                  const hosp = order.hospitalDetails || {};
                  const staff = order.assignedStaff || order.assignedStaffId || {};

                  return (
                    <tr
                      key={order._id || order.bookingId || index}
                      onClick={() => openDetails(order)}
                      className="group hover:bg-slate-50/80 cursor-pointer transition-all"
                    >
                      <td className="p-6 text-xs font-bold text-slate-400">
                        {(pagination.currentPage - 1) * 10 + index + 1}
                      </td>

                      {/* Patient & Location */}
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                          <FaUserCircle size={22} className="text-slate-300 group-hover:text-[#08B36A] transition-colors shrink-0" />
                          <div>
                            <p className="text-sm font-black text-slate-800 tracking-tight uppercase">
                              {order.patients?.[0]?.name || order.address?.name || "Patient File"}
                            </p>
                            {isHospital ? (
                              <p className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-100 flex items-center gap-1 mt-0.5 w-fit">
                                <FaHospital size={9} /> {hosp.hospitalName || "Hospital Bedside"} {hosp.bedNumber ? `(${hosp.bedNumber})` : ''}
                              </p>
                            ) : (
                              <p className="text-[10px] font-medium text-slate-400 flex items-center gap-1 mt-0.5">
                                <FaMapMarkerAlt size={9} className="text-[#08B36A]" /> {order.address?.city || "Home Care"}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Nursing Bureau */}
                      <td className="p-6">
                        <div className="flex items-center gap-2">
                          <FaHome className="text-slate-300" size={12} />
                          <span className="text-xs font-bold text-slate-700 leading-tight">
                            {order.nurseId?.name || "Care Bureau"}
                          </span>
                        </div>
                      </td>

                      {/* Assigned Field Nurse */}
                      <td className="p-6">
                        {staff.name ? (
                          <div className="space-y-0.5">
                            <p className="text-xs font-black text-slate-800 flex items-center gap-1">
                              <FaUserNurse className="text-[#08B36A]" size={11} /> {staff.name}
                            </p>
                            <p className="text-[10px] font-mono text-slate-400">{staff.phone || staff.vehicleNumber || "Staff Active"}</p>
                          </div>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400 italic">Unassigned</span>
                        )}
                      </td>

                      {/* Service / ID */}
                      <td className="p-6">
                        <p className="text-xs font-black text-blue-600 tracking-tighter uppercase line-clamp-1">
                          {order.serviceDetails?.title || "Clinical Procedure"}
                        </p>
                        <p className="text-[9px] font-mono text-slate-400 font-bold mt-0.5 uppercase tracking-wider">
                          #{order.bookingId}
                        </p>
                      </td>

                      {/* Payment */}
                      <td className="p-6">
                        <div className="space-y-0.5">
                          <p className="text-xs font-black text-slate-800">
                            ₹{order.totalAmount ?? order.totalPrice ?? order.priceBreakdown?.totalPrice ?? 0}
                          </p>
                          <span className="text-[9px] font-bold uppercase text-slate-500">
                            {order.paymentMethod || "Online"} ({order.paymentStatus || "Paid"})
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-6 text-center">
                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>

                      {/* View Action */}
                      <td className="p-6 text-center">
                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center mx-auto text-slate-400 group-hover:text-[#08B36A] transition-colors shadow-sm">
                          <FaEye size={12} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
                disabled={pagination.currentPage <= 1}
                onClick={() => setPagination(prev => ({ ...prev, currentPage: Math.max(prev.currentPage - 1, 1) }))}
                className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 disabled:opacity-30 hover:text-[#08B36A] transition-all active:scale-90 cursor-pointer"
              >
                <FaChevronLeft size={12} />
              </button>
              <button
                disabled={pagination.currentPage >= pagination.totalPages}
                onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 disabled:opacity-30 hover:text-[#08B36A] transition-all active:scale-90 cursor-pointer"
              >
                <FaChevronRight size={12} />
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
            <div className="p-8 bg-slate-900 text-white flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight leading-none">Nursing Dispatch Audit</h2>
                <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest mt-2">Booking ID: #{selectedOrder.bookingId}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 bg-white/10 hover:bg-white/30 rounded-full transition-all outline-none cursor-pointer">
                <FaTimes />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1">
              
              {/* Primary Key Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <InfoItem icon={<FaCalendarAlt />} label="Start Date" val={selectedOrder.schedule?.startDate ? new Date(selectedOrder.schedule.startDate).toLocaleDateString() : "N/A"} />
                <InfoItem icon={<FaClock />} label="Shift Time" val={selectedOrder.schedule?.startTime || "10:00 AM"} />
                <InfoItem icon={<FaHome />} label="Agency" val={selectedOrder.nurseId?.name || "Bureau"} />
                <InfoItem icon={<FaMapMarkerAlt />} label="Care Type" val={selectedOrder.assessmentLocation || "At Home"} />
                <InfoItem icon={<FaClock />} label="Duration" val={selectedOrder.schedule?.duration || "Single Visit"} />
                <InfoItem icon={<FaCheckCircle />} label="Status" val={selectedOrder.status} />
              </div>

              {/* Hospital Bedside Care Section (If Applicable) */}
              {(selectedOrder.assessmentLocation === "At Hospital" || selectedOrder.hospitalDetails) && (
                <div className="p-5 bg-purple-50 rounded-2xl border border-purple-200 space-y-2">
                  <div className="flex items-center gap-2 text-purple-900 font-black text-xs uppercase tracking-wide">
                    <FaHospital size={14} /> Hospital Bedside Placement
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-xs pt-1">
                    <div>
                      <span className="text-[10px] text-purple-600 uppercase font-bold block">Hospital</span>
                      <strong className="text-purple-950">{selectedOrder.hospitalDetails?.hospitalName || "Partner Hospital"}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-purple-600 uppercase font-bold block">Ward / Floor</span>
                      <strong className="text-purple-950">{selectedOrder.hospitalDetails?.wardName || "Ward Desk"}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-purple-600 uppercase font-bold block">Bed Number</span>
                      <strong className="text-purple-950">{selectedOrder.hospitalDetails?.bedNumber || "Assigned"}</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Assigned Staff Nurse & Vehicle */}
              {(selectedOrder.assignedStaff || selectedOrder.assignedStaffId) && (
                <div className="p-5 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-[#08B36A] text-white flex items-center justify-center font-black text-lg shadow-sm">
                      <FaUserNurse />
                    </div>
                    <div>
                      <span className="text-[9px] font-black uppercase text-[#08B36A] tracking-wider block">Assigned Nurse Personnel</span>
                      <p className="text-sm font-black text-slate-800">{(selectedOrder.assignedStaff || selectedOrder.assignedStaffId).name}</p>
                      <p className="text-[10px] font-bold text-slate-500">
                        Status: {(selectedOrder.assignedStaff || selectedOrder.assignedStaffId).status || 'Busy'} 
                        {(selectedOrder.assignedStaff || selectedOrder.assignedStaffId).vehicleNumber && ` • ${(selectedOrder.assignedStaff || selectedOrder.assignedStaffId).vehicleNumber}`}
                      </p>
                    </div>
                  </div>
                  {(selectedOrder.assignedStaff || selectedOrder.assignedStaffId).phone && (
                    <a
                      href={`tel:${(selectedOrder.assignedStaff || selectedOrder.assignedStaffId).phone}`}
                      className="px-3.5 py-2 bg-white text-[#08B36A] rounded-xl border border-emerald-200 text-xs font-black shadow-xs flex items-center gap-1.5"
                    >
                      <FaPhoneAlt size={10} /> Call
                    </a>
                  )}
                </div>
              )}

              {/* Multi-Day Completed Sessions Tracker */}
              {selectedOrder.completedSessionsCount > 0 && (
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-700">
                  <span>Completed Sessions to Date:</span>
                  <span className="bg-[#08B36A] text-white px-3 py-1 rounded-full text-xs font-black">
                    {selectedOrder.completedSessionsCount} Days Completed
                  </span>
                </div>
              )}

              {/* Service Header Info */}
              <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 flex items-center gap-4">
                <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center text-blue-500 shadow-sm border border-blue-50 shrink-0">
                  <FaMedkit size={18} />
                </div>
                <div>
                  <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest leading-none mb-1">Prescribed Clinical Procedure</p>
                  <p className="text-base font-black text-slate-800 leading-tight">{selectedOrder.serviceDetails?.title || "Care Bundle"}</p>
                  <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase">{selectedOrder.serviceDetails?.type || "Nursing Care"}</p>
                </div>
              </div>

              {/* Patients List */}
              <div className="border-t border-slate-100 pt-6">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <FaUsers /> Registered Patient Details
                </p>
                <div className="space-y-2">
                  {selectedOrder.patients?.map((p, i) => (
                    <div key={i} className="flex items-center gap-3.5 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center text-[#08B36A] shadow-xs font-black text-xs border border-slate-200/60">
                        {p.name ? p.name.charAt(0) : "P"}
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-800 uppercase">{p.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase">{p.gender} • {p.age} Years • {p.relation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Medical Consumables */}
              {selectedOrder.selectedConsumables?.length > 0 && (
                <div className="border-t border-slate-100 pt-6">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <FaBoxOpen /> Medical Supplies Used
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {selectedOrder.selectedConsumables.map((item, i) => (
                      <div key={i} className="flex justify-between items-center p-3 bg-white border border-slate-200/80 rounded-xl">
                        <span className="text-xs font-bold text-slate-700">{item.itemName}</span>
                        <span className="text-[11px] font-black text-[#08B36A]">₹{item.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Billing Breakdown */}
              <div className="bg-[#08B36A] rounded-[2rem] p-6 text-white space-y-4">
                <div className="flex items-center gap-2">
                  <FaReceipt className="opacity-70" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Financial Audit</p>
                </div>
                <div className="space-y-2 text-xs font-bold">
                  <div className="flex justify-between border-b border-white/10 pb-1.5">
                    <span className="opacity-80">Payment Mode</span>
                    <span>{selectedOrder.paymentMethod || "Online"} ({selectedOrder.paymentStatus || "Paid"})</span>
                  </div>
                  <div className="flex justify-between border-b border-white/10 pb-1.5">
                    <span className="opacity-80">Base Fee</span>
                    <span>₹{selectedOrder.priceBreakdown?.baseServicePrice ?? 0}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/10 pb-1.5">
                    <span className="opacity-80">Consumables Total</span>
                    <span>₹{selectedOrder.priceBreakdown?.consumableTotal ?? 0}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-xs font-black uppercase tracking-widest">Total Invoiced Amount</span>
                    <span className="text-2xl font-black">
                      ₹{selectedOrder.totalAmount ?? selectedOrder.totalPrice ?? selectedOrder.priceBreakdown?.totalPrice ?? 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-slate-50 border-t border-slate-100 shrink-0">
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-slate-800 transition-all cursor-pointer"
              >
                Close Audit Record
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
    <div className="flex gap-3">
      <div className="text-[#08B36A] mt-0.5 opacity-80 shrink-0 text-xs">{icon}</div>
      <div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
        <p className="text-xs font-black text-slate-700 leading-tight truncate max-w-[150px]">{val || "N/A"}</p>
      </div>
    </div>
  );
}