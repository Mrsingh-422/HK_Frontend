'use client';

import React, { useState, useMemo } from 'react';
import { 
  FaSearch, 
  FaEye, 
  FaTimes, 
  FaAmbulance, 
  FaClock, 
  FaEnvelope, 
  FaIdBadge, 
  FaCalendarAlt,
  FaTrashAlt,
  FaArrowLeft,
  FaHandHoldingHeart,
  FaCheckCircle,
  FaMapMarkerAlt,
  FaUserCircle,
  FaHeart
} from 'react-icons/fa';

export default function FreeAmbulanceOrdersPage() {
  // --- STATE MANAGEMENT ---
  const [orders, setOrders] = useState([
    { srNo: 1, id: "FAMB-201", patient: "Yash User", email: "HK@Dev123", provider: "Red Cross Society", time: "09:30 AM", status: "Accepted", date: "2024-03-20", location: "Sector 117, Mohali" },
    { srNo: 2, id: "FAMB-205", patient: "Nitish Kumar", email: "nitish@hk.com", provider: "Sewa Foundation", time: "11:00 AM", status: "Pending", date: "2024-03-21", location: "Phase 3B2, Mohali" },
    { srNo: 3, id: "FAMB-212", patient: "NAMAN SHARMA", email: "naman@gmail.com", provider: "Govt Health Dept", time: "01:30 PM", status: "Accepted", date: "2024-03-20", location: "Civil Lines" },
    { srNo: 4, id: "FAMB-218", patient: "Deepankar", email: "deep@gmail.com", provider: "Humanity First", time: "04:00 PM", status: "Cancelled", date: "2024-03-22", location: "Tdi City" },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- LOGIC ---

  // Search filter
  const filteredOrders = useMemo(() => {
    return orders.filter(order => 
      order.patient.toLowerCase().includes(searchTerm.toLowerCase()) || 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.provider.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, orders]);

  // Open Details Modal
  const openDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  // Cancel Order Logic
  const handleCancelOrder = (e, id) => {
    e.stopPropagation(); 
    if (window.confirm("Are you sure you want to cancel this free ambulance service request?")) {
      setOrders(orders.filter(order => order.id !== id));
      alert("Free Ambulance Order Cancelled Successfully.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
              <FaHandHoldingHeart className="text-[#08B36A] text-2xl" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none uppercase">FREE AMBULANCE</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">Community Welfare Transit Registry</p>
            </div>
          </div>
          <button onClick={() => window.history.back()} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-6 py-2.5 rounded-xl font-bold text-xs shadow-sm hover:bg-slate-50 transition-all uppercase tracking-widest active:scale-95">
            <FaArrowLeft /> GO BACK
          </button>
        </div>

        {/* --- MAIN CONTENT CARD --- */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
          
          <div className="p-6 border-b border-slate-50 bg-white">
            <div className="relative max-w-md group">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#08B36A] transition-colors" />
              <input 
                type="text" 
                placeholder="Search patient, ID or NGO..." 
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#08B36A]/20 transition-all font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto px-4">
            <table className="w-full text-left border-separate border-spacing-y-3">
              <thead>
                <tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
                  <th className="px-6 py-2">Sr.No</th>
                  <th className="px-6 py-2">Patient / Contact</th>
                  <th className="px-6 py-2">Vendor (Organization)</th>
                  <th className="px-6 py-2">Mission ID</th>
                  <th className="px-6 py-2">Status</th>
                  <th className="px-6 py-2 text-center">Summary</th>
                  <th className="px-6 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-0">
                {filteredOrders.map((order) => (
                  <tr 
                    key={order.id} 
                    onClick={() => openDetails(order)}
                    className="group hover:translate-x-1 transition-all cursor-pointer"
                  >
                    <td className="px-6 py-5 bg-slate-50/60 group-hover:bg-emerald-50/40 rounded-l-2xl text-xs font-bold text-slate-400">
                      {order.srNo}
                    </td>
                    <td className="px-6 py-5 bg-slate-50/60 group-hover:bg-emerald-50/40">
                       <div className="flex items-center gap-3">
                          <FaUserCircle size={20} className="text-slate-200 group-hover:text-[#08B36A] transition-colors shrink-0"/>
                          <div>
                            <p className="text-sm font-black text-slate-800 tracking-tight leading-none">{order.patient}</p>
                            <p className="text-[10px] font-bold text-[#08B36A] uppercase mt-1">{order.email}</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-5 bg-slate-50/60 group-hover:bg-emerald-50/40">
                        <div className="flex items-center gap-2">
                           <FaHeart className="text-rose-300" size={10}/>
                           <span className="text-sm font-bold text-slate-600">{order.provider}</span>
                        </div>
                    </td>
                    <td className="px-6 py-5 bg-slate-50/60 group-hover:bg-emerald-50/40">
                        <p className="text-xs font-black text-blue-600 tracking-tighter uppercase">{order.id}</p>
                        <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase">{order.date}</p>
                    </td>
                    <td className="px-6 py-5 bg-slate-50/60 group-hover:bg-emerald-50/40">
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                        order.status === 'Accepted' ? 'bg-green-100 text-green-700' : 
                        order.status === 'Pending' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 bg-slate-50/60 group-hover:bg-emerald-50/40 text-center">
                       <div className="w-8 h-8 bg-white border border-slate-100 rounded-lg flex items-center justify-center mx-auto text-slate-400 group-hover:text-[#08B36A] transition-colors shadow-sm">
                          <FaEye />
                       </div>
                    </td>
                    <td className="px-6 py-5 bg-slate-50/60 group-hover:bg-emerald-50/40 rounded-r-2xl text-right">
                      <button 
                        onClick={(e) => handleCancelOrder(e, order.id)}
                        className="bg-red-50 text-red-500 hover:bg-red-600 hover:text-white px-5 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-90 flex items-center gap-2 ml-auto shadow-sm"
                      >
                        <FaTrashAlt size={10} /> Cancel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- DETAILS MODAL --- */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="relative bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20">
            {/* Modal Header */}
            <div className="p-8 bg-[#08B36A] text-white flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight leading-none">Welfare Mission Summary</h2>
                <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest mt-2">Transit ID: {selectedOrder.id}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition-all outline-none">
                <FaTimes />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-10 space-y-8">
                <div className="grid grid-cols-2 gap-8">
                    <InfoItem icon={<FaIdBadge/>} label="Ticket ID" val={selectedOrder.id} />
                    <InfoItem icon={<FaCalendarAlt/>} label="Mission Date" val={selectedOrder.date} />
                    <InfoItem icon={<FaHandHoldingHeart/>} label="Providing NGO" val={selectedOrder.provider} />
                    <InfoItem icon={<FaClock/>} label="Requested Time" val={selectedOrder.time} />
                    <div className="col-span-2">
                       <InfoItem icon={<FaMapMarkerAlt/>} label="Pickup Location" val={selectedOrder.location} />
                    </div>
                </div>

                <div className="bg-emerald-50/50 p-6 rounded-[1.5rem] border border-emerald-100/50 flex items-center gap-5">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#08B36A] shadow-sm border border-emerald-50">
                      <FaAmbulance size={20}/>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none mb-1.5">Service Type</p>
                        <p className="text-lg font-black text-slate-800 leading-none tracking-tight">Free Emergency Support</p>
                    </div>
                </div>

                <div className="border-t border-slate-100 pt-8">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-4">Patient Information</p>
                    <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100/50">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#08B36A] shadow-sm font-black text-lg">
                            {selectedOrder.patient.charAt(0)}
                        </div>
                        <div>
                            <p className="text-base font-black text-slate-800 leading-none">{selectedOrder.patient}</p>
                            <p className="text-xs font-bold text-slate-400 mt-2 flex items-center gap-2"><FaEnvelope size={10} className="text-[#08B36A]"/> {selectedOrder.email}</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 justify-center py-2 bg-blue-50 rounded-2xl p-4 border border-blue-100">
                    <FaCheckCircle className="text-blue-600" size={14} />
                    <span className="text-[10px] font-black text-blue-800 uppercase tracking-widest">Welfare Verification: Logged & {selectedOrder.status}</span>
                </div>
            </div>

            {/* Modal Footer */}
            <div className="px-10 pb-10">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-slate-800 transition-all active:scale-[0.98]"
              >
                Close Mission Log
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
            <div className="text-[#08B36A] mt-1 opacity-60 shrink-0">{icon}</div>
            <div>
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">{label}</p>
                <p className="text-sm font-black text-slate-700 leading-tight">{val || "N/A"}</p>
            </div>
        </div>
    )
}