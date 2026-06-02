'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import AdminAPI from '../../../../services/AdminAPI'; // Adjust path as needed  
import { 
  FaSearch, 
  FaEye, 
  FaTimes, 
  FaHospital, 
  FaClock, 
  FaEnvelope, 
  FaIdBadge, 
  FaCalendarAlt,
  FaArrowLeft,
  FaCheckCircle,
  FaUserCircle,
  FaStethoscope,
  FaMedkit,
  FaBed,
  FaUserMd,
  FaChevronLeft,
  FaChevronRight,
  FaReceipt,
  FaHistory
} from 'react-icons/fa';

export default function HospitalOrdersPage() {
  // --- STATE MANAGEMENT ---
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalCount: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- API FETCHING ---
  const fetchAppointments = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const response = await AdminAPI.getHospitalAppointments(page, 10);
      if (response.success) {
        setOrders(response.data);
        // Note: Your API response has pagination nested inside a "pagination" key
        setPagination({
          currentPage: response.pagination.currentPage,
          totalPages: response.pagination.totalPages,
          totalCount: response.pagination.totalCount
        });
      }
    } catch (error) {
      console.error("Error fetching hospital appointments:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // --- LOGIC ---

  // Local filter (for the current page results)
  const filteredOrders = useMemo(() => {
    return orders.filter(order => 
      order.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) || 
      order.patients?.[0]?.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.hospitalId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, orders]);

  const openDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Confirmed': return 'bg-green-50 text-green-600 ring-green-100';
      case 'In-Progress': return 'bg-blue-50 text-blue-600 ring-blue-100';
      case 'Completed': return 'bg-emerald-50 text-emerald-600 ring-emerald-100';
      case 'Hospital-Pending': return 'bg-amber-50 text-amber-600 ring-amber-100';
      case 'Cancelled-By-User': return 'bg-red-50 text-red-600 ring-red-100';
      default: return 'bg-slate-50 text-slate-600 ring-slate-100';
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
              <FaHospital className="text-[#08B36A] text-2xl" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none uppercase">HOSPITAL ORDERS</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">IPD & OPD Admission Registry</p>
            </div>
          </div>
          <button onClick={() => window.history.back()} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-6 py-2.5 rounded-xl font-bold text-xs shadow-sm hover:bg-slate-50 transition-all uppercase tracking-widest active:scale-95">
            <FaArrowLeft /> GO BACK
          </button>
        </div>

        {/* --- MAIN CONTENT CARD --- */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          
          <div className="p-6 border-b border-slate-50 bg-white flex flex-col md:flex-row justify-between gap-4">
            <div className="relative max-w-md w-full group">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#08B36A] transition-colors" />
              <input 
                type="text" 
                placeholder="Search Patient, Hospital or ID..." 
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#08B36A]/20 transition-all font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase">
                Total: {pagination.totalCount} Records
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                  <th className="p-6">Sr.No</th>
                  <th className="p-6">Patient / User</th>
                  <th className="p-6">Facility / Ward</th>
                  <th className="p-6">Booking ID</th>
                  <th className="p-6">Status</th>
                  <th className="p-6 text-center">Summary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                    <tr><td colSpan="6" className="p-20 text-center text-slate-300 font-bold uppercase animate-pulse">Syncing Database...</td></tr>
                ) : filteredOrders.map((order, index) => (
                  <tr 
                    key={order._id} 
                    onClick={() => openDetails(order)}
                    className="group hover:bg-slate-50/80 cursor-pointer transition-all"
                  >
                    <td className="p-6 text-sm font-bold text-slate-300">
                        {(pagination.currentPage - 1) * 20 + index + 1}
                    </td>
                    <td className="p-6">
                       <div className="flex items-center gap-3">
                          <FaUserCircle size={20} className="text-slate-200 group-hover:text-[#08B36A] transition-colors shrink-0"/>
                          <div>
                            <p className="text-sm font-black text-slate-800 tracking-tight uppercase">
                                {order.patients?.[0]?.patientName || "User"}
                            </p>
                            <p className="text-[10px] font-bold text-[#08B36A] uppercase">{order.userId?.email}</p>
                          </div>
                       </div>
                    </td>
                    <td className="p-6">
                        <p className="text-sm font-bold text-slate-600 leading-none">{order.hospitalId?.name}</p>
                        <p className="text-[9px] font-black text-slate-400 uppercase mt-2 flex items-center gap-1">
                            <FaBed className="text-blue-400"/> {order.wardName} - {order.bedNumber}
                        </p>
                    </td>
                    <td className="p-6">
                        <p className="text-xs font-black text-blue-600 tracking-tighter">{order.bookingId}</p>
                        <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase">{order.bookingType}</p>
                    </td>
                    <td className="p-6">
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ring-1 ${getStatusStyle(order.status)}`}>
                        {order.status.replace(/-/g, ' ')}
                      </span>
                    </td>
                    <td className="p-6 text-center">
                       <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center mx-auto text-slate-400 group-hover:text-[#08B36A] transition-colors shadow-sm">
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
                onClick={() => fetchAppointments(pagination.currentPage - 1)}
                className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 disabled:opacity-30 hover:text-[#08B36A] transition-all"
              >
                <FaChevronLeft size={12}/>
              </button>
              <button 
                disabled={pagination.currentPage >= pagination.totalPages}
                onClick={() => fetchAppointments(pagination.currentPage + 1)}
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
          
          <div className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight leading-none">Admission Manifest</h2>
                <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest mt-2">Order ID: {selectedOrder.bookingId}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all outline-none">
                <FaTimes />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-10 space-y-8 overflow-y-auto no-scrollbar">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                    <InfoItem icon={<FaIdBadge/>} label="Request ID" val={selectedOrder.bookingId} />
                    <InfoItem icon={<FaCalendarAlt/>} label="Appointment" val={new Date(selectedOrder.appointmentDate).toLocaleDateString()} />
                    <InfoItem icon={<FaHospital/>} label="Facility" val={selectedOrder.hospitalId?.name} />
                    <InfoItem icon={<FaMedkit/>} label="Ward Name" val={selectedOrder.wardName} />
                    <InfoItem icon={<FaBed/>} label="Bed Number" val={selectedOrder.bedNumber} />
                    <InfoItem icon={<FaClock/>} label="Duration" val={`${selectedOrder.stayDuration} Days`} />
                </div>

                {/* Doctor Details */}
                {selectedOrder.doctorId && (
                    <div className="bg-emerald-50/50 p-6 rounded-[1.5rem] border border-emerald-100/50 flex items-center gap-5">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#08B36A] shadow-sm border border-emerald-50">
                            <FaUserMd size={20}/>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Attending Consultant</p>
                            <p className="text-lg font-black text-slate-800 leading-none uppercase">Dr. {selectedOrder.doctorId.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">{selectedOrder.doctorId.speciality}</p>
                        </div>
                    </div>
                )}

                {/* Patient Info */}
                <div className="border-t border-slate-100 pt-8">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-4">Patient Information</p>
                    {selectedOrder.patients?.map((p, i) => (
                        <div key={i} className="flex flex-col md:flex-row items-center gap-4 p-5 bg-slate-50 rounded-3xl border border-slate-100/50">
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#08B36A] shadow-sm font-black text-lg">
                                {p.patientName.charAt(0)}
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <p className="text-base font-black text-slate-800 leading-none uppercase">{p.patientName}</p>
                                <p className="text-xs font-bold text-slate-400 mt-2">
                                    {p.gender} • {p.patientAge} Years • {p.relation}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pricing Breakdown */}
                <div className="bg-[#08B36A] rounded-[2rem] p-8 text-white">
                    <div className="flex items-center gap-2 mb-6">
                        <FaReceipt className="opacity-50"/>
                        <p className="text-[10px] font-black uppercase tracking-widest">Final Bill Summary</p>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between text-xs font-bold">
                            <span className="opacity-70">Base Fee</span>
                            <span>₹{selectedOrder.pricingBreakdown?.baseFee}</span>
                        </div>
                        <div className="flex justify-between text-xs font-bold">
                            <span className="opacity-70">Subtotal</span>
                            <span>₹{selectedOrder.pricingBreakdown?.subtotal}</span>
                        </div>
                        <div className="flex justify-between text-xs font-bold text-red-100">
                            <span className="opacity-70">Discount</span>
                            <span>-₹{selectedOrder.pricingBreakdown?.discountAmount}</span>
                        </div>
                        <div className="flex justify-between items-center border-t border-white/20 pt-4 mt-2">
                            <span className="text-sm font-black uppercase tracking-widest">Net Paid</span>
                            <span className="text-3xl font-black">₹{selectedOrder.totalAmount}</span>
                        </div>
                    </div>
                </div>

                {/* Internal Transfer History */}
                {selectedOrder.treatmentHistory?.length > 0 && (
                    <div className="border-t border-slate-100 pt-8 pb-4">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <FaHistory/> Clinical Transfer History
                        </p>
                        <div className="space-y-6">
                            {selectedOrder.treatmentHistory.map((h, i) => (
                                <div key={i} className="relative pl-6 border-l-2 border-slate-100">
                                    <div className="absolute -left-[9px] top-0 w-4 h-4 bg-white border-2 border-[#08B36A] rounded-full"></div>
                                    <p className="text-[10px] font-black text-[#08B36A] uppercase mb-1">{h.action}</p>
                                    <p className="text-xs font-bold text-slate-700 leading-tight">{h.notes}</p>
                                    <p className="text-[9px] text-slate-400 mt-2">{new Date(h.timestamp).toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="px-10 pb-10">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-slate-800 transition-all active:scale-[0.98]"
              >
                Accept and Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- HELPER COMPONENT ---

function InfoItem({ icon, label, val }) {
    return (
        <div className="flex gap-4">
            <div className="text-[#08B36A] mt-1 opacity-60 shrink-0 text-xs">{icon}</div>
            <div>
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">{label}</p>
                <p className="text-sm font-black text-slate-700 leading-tight truncate max-w-[150px]">{val || "N/A"}</p>
            </div>
        </div>
    )
}