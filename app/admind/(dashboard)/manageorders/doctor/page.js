'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import AdminAPI from '../../../../services/AdminAPI'; // Adjust path as needed
import {
  FaSearch,
  FaEye,
  FaTimes,
  FaStethoscope,
  FaUserMd,
  FaClock,
  FaEnvelope,
  FaIdBadge,
  FaCalendarAlt,
  FaTrashAlt,
  FaArrowLeft,
  FaHospital,
  FaVideo,
  FaHome,
  FaChevronLeft,
  FaChevronRight,
  FaCreditCard
} from 'react-icons/fa';

export default function DoctorOrders() {
  // --- STATE MANAGEMENT ---
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalCount: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- API FETCHING ---
  const fetchAppointments = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const response = await AdminAPI.getDoctorAppointments(page, 10);
      if (response.success) {
        setAppointments(response.data);
        setPagination({
          currentPage: response.currentPage,
          totalPages: response.totalPages,
          totalCount: response.count
        });
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // --- LOGIC ---

  // Local filter for search
  const filteredAppointments = useMemo(() => {
    return appointments.filter(order =>
      order.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.patients?.[0]?.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.doctorId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, appointments]);

  const openDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed': return 'bg-green-50 text-green-600 ring-green-100';
      case 'Completed': return 'bg-blue-50 text-blue-600 ring-blue-100';
      case 'Cancelled-By-User': return 'bg-red-50 text-red-600 ring-red-100';
      default: return 'bg-orange-50 text-orange-600 ring-orange-100';
    }
  };

  const getConsultationIcon = (type) => {
    if (type === 'Video Consult') return <FaVideo className="text-purple-500" />;
    if (type === 'Home Visit') return <FaHome className="text-blue-500" />;
    return <FaHospital className="text-emerald-500" />;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">

        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
              <FaStethoscope className="text-[#08B36A] text-2xl" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none uppercase">DOCTOR APPOINTMENTS</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">Admin Panel Registry</p>
            </div>
          </div>
          <button onClick={() => window.history.back()} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-6 py-2.5 rounded-xl font-bold text-xs shadow-sm hover:bg-slate-50 transition-all uppercase tracking-widest">
            <FaArrowLeft /> GO BACK
          </button>
        </div>

        {/* --- TABLE CARD --- */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">

          <div className="p-6 border-b border-slate-50 bg-white flex flex-col md:flex-row justify-between gap-4">
            <div className="relative max-w-md w-full group">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#08B36A] transition-colors" />
              <input
                type="text"
                placeholder="Search ID, Patient or Doctor..."
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#08B36A]/20 transition-all font-semibold"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase">
              Showing {filteredAppointments.length} of {pagination.totalCount} Results
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                  <th className="p-6">SR</th>
                  <th className="p-6">Patient Details</th>
                  <th className="p-6">Doctor Info</th>
                  <th className="p-6">Appointment ID</th>
                  <th className="p-6">Type</th>
                  <th className="p-6">Price</th>
                  <th className="p-6">Status</th>
                  <th className="p-6 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr><td colSpan="8" className="p-20 text-center font-bold text-slate-300 animate-pulse uppercase tracking-widest">Syncing Records...</td></tr>
                ) : filteredAppointments.map((order, index) => (
                  <tr
                    key={order._id}
                    onClick={() => openDetails(order)}
                    className="group hover:bg-slate-50/80 cursor-pointer transition-all"
                  >
                    <td className="p-6 text-sm font-bold text-slate-300">
                      {(pagination.currentPage - 1) * 10 + index + 1}
                    </td>
                    <td className="p-6">
                      <p className="text-sm font-black text-slate-800 tracking-tight uppercase">{order.patients?.[0]?.patientName || "Unknown"}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{order.userId?.email || order.userId?.phone}</p>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <img src={process.env.NEXT_PUBLIC_API_URL + '/' + order.doctorId?.profileImage} className="w-8 h-8 rounded-lg object-cover bg-slate-100" alt="doc" />
                        <div>
                          <p className="text-sm font-bold text-slate-700 leading-none">{order.doctorId?.name}</p>
                          <p className="text-[9px] font-bold text-[#08B36A] uppercase mt-1">{order.doctorId?.speciality}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6 text-sm font-bold text-blue-600 tracking-tighter">{order.bookingId}</td>
                    <td className="p-6">
                      <div className="flex items-center gap-2">
                        {getConsultationIcon(order.consultationType)}
                        <span className="text-[10px] font-bold text-slate-500 uppercase">{order.consultationType}</span>
                      </div>
                    </td>
                    <td className="p-6 text-sm font-black text-slate-800">₹{order.totalAmount}</td>
                    <td className="p-6">
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ring-1 ${getStatusColor(order.status)}`}>
                        {order.status.replace(/-/g, ' ')}
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
                onClick={(e) => { e.stopPropagation(); fetchAppointments(pagination.currentPage - 1); }}
                className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 disabled:opacity-30 hover:text-[#08B36A] transition-all"
              >
                <FaChevronLeft size={12} />
              </button>
              <button
                disabled={pagination.currentPage === pagination.totalPages}
                onClick={(e) => { e.stopPropagation(); fetchAppointments(pagination.currentPage + 1); }}
                className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 disabled:opacity-30 hover:text-[#08B36A] transition-all"
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

          <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight">Appointment Details</h2>
                <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest mt-1">Booking Reference: {selectedOrder.bookingId}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all">
                <FaTimes />
              </button>
            </div>

            <div className="p-8 space-y-8 overflow-y-auto no-scrollbar">
              {/* Top Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <InfoItem icon={<FaIdBadge />} label="Booking ID" val={selectedOrder.bookingId} />
                <InfoItem icon={<FaCalendarAlt />} label="Schedule" val={new Date(selectedOrder.appointmentDate).toLocaleDateString()} />
                <InfoItem icon={<FaClock />} label="Time Slot" val={selectedOrder.appointmentTime} />
                <InfoItem icon={<FaVideo />} label="Mode" val={selectedOrder.consultationType} />
                <InfoItem icon={<FaCreditCard />} label="Payment" val={selectedOrder.paymentStatus} />
                <InfoItem icon={<FaStethoscope />} label="Speciality" val={selectedOrder.doctorId?.speciality} />
              </div>

              {/* Pricing Breakdown */}
              <div className="border-t border-slate-100 pt-8">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-4">Financial Breakdown</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <PriceBox label="Base Fee" amt={selectedOrder.pricingBreakdown?.baseFee} />
                  <PriceBox label="Visit Chg" amt={selectedOrder.pricingBreakdown?.visitCharges} />
                  <PriceBox label="Discount" amt={selectedOrder.pricingBreakdown?.discountAmount} isNeg />
                  <PriceBox label="Total Paid" amt={selectedOrder.totalAmount} isTotal />
                </div>
              </div>

              {/* Patient Information */}
              <div className="border-t border-slate-100 pt-8">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-4">Patient Information</p>
                <div className="flex flex-col md:flex-row items-center gap-4 p-5 bg-slate-50 rounded-3xl">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-[#08B36A] shadow-sm font-black text-xl">
                    {selectedOrder.patients?.[0]?.patientName?.charAt(0)}
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <p className="text-lg font-black text-slate-800 leading-none uppercase">{selectedOrder.patients?.[0]?.patientName}</p>
                    <p className="text-xs font-bold text-slate-400 mt-2">
                      {selectedOrder.patients?.[0]?.gender} • {selectedOrder.patients?.[0]?.patientAge} Years • {selectedOrder.patients?.[0]?.relation}
                    </p>
                  </div>
                  <div className="bg-white px-4 py-2 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest shadow-sm">
                    {selectedOrder.patients?.[0]?.reasonForVisit}
                  </div>
                </div>
              </div>

              {/* Clinical Notes */}
              {selectedOrder.clinicalSummary?.chiefComplaint && (
                <div className="border-t border-slate-100 pt-8">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-4">Clinical Notes</p>
                  <div className="p-5 bg-orange-50 border border-orange-100 rounded-2xl">
                    <p className="text-xs font-bold text-orange-800 leading-relaxed italic">
                      "{selectedOrder.clinicalSummary.chiefComplaint}"
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="px-8 pb-8">
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-full py-4 bg-[#08B36A] text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-green-100 hover:bg-slate-900 transition-all active:scale-[0.98]"
              >
                Return to Ledger
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- HELPER COMPONENTS ---

function InfoItem({ icon, label, val }) {
  return (
    <div className="flex gap-3">
      <div className="text-[#08B36A] mt-0.5 opacity-60 text-xs">{icon}</div>
      <div>
        <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-0.5">{label}</p>
        <p className="text-xs font-black text-slate-700 tracking-tight">{val}</p>
      </div>
    </div>
  )
}

function PriceBox({ label, amt, isNeg, isTotal }) {
  return (
    <div className={`p-3 rounded-2xl border ${isTotal ? 'bg-slate-900 border-slate-900 text-white' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
      <p className={`text-[8px] font-black uppercase mb-1 ${isTotal ? 'text-slate-400' : 'text-slate-300'}`}>{label}</p>
      <p className="text-xs font-black tracking-tight">{isNeg ? '-' : ''}₹{amt || 0}</p>
    </div>
  )
}