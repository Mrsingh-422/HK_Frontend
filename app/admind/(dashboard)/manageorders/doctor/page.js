'use client';

import React, { useState, useMemo } from 'react';
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
  FaHospital
} from 'react-icons/fa';

export default function DoctorOrders() {
  // --- STATE MANAGEMENT ---
  const [orders, setOrders] = useState([
    { srNo: 1, id: "DOC-102501", patient: "NAMAN SHARMA", email: "naman@gmail.com", clinic: "City Life Hospital", time: "06:50 - 07:10 AM", status: "Accepted", date: "2024-03-20" },
    { srNo: 2, id: "DOC-102502", patient: "Yash User", email: "HK@Dev123", clinic: "Radius Clinic", time: "10:00 - 11:00 AM", status: "Pending", date: "2024-03-21" },
    { srNo: 3, id: "DOC-102503", patient: "Nitish Kumar", email: "nitish@hk.com", clinic: "Hk Doctor Hub", time: "02:30 - 03:00 PM", status: "Accepted", date: "2024-03-20" },
    { srNo: 4, id: "DOC-102504", patient: "Deepankar", email: "deep@gmail.com", clinic: "Lifeline Hospital", time: "07:07 - 07:15 AM", status: "Accepted", date: "2024-03-22" },
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
      order.clinic.toLowerCase().includes(searchTerm.toLowerCase())
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
    if (window.confirm("Are you sure you want to cancel this appointment?")) {
      setOrders(orders.filter(order => order.id !== id));
      alert("Appointment Cancelled Successfully.");
    }
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
              <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none uppercase">DOCTOR ORDERS</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">Appointment Registry</p>
            </div>
          </div>
          <button onClick={() => window.history.back()} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-6 py-2.5 rounded-xl font-bold text-xs shadow-sm hover:bg-slate-50 transition-all uppercase tracking-widest">
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
                placeholder="Search name, ID or clinic..." 
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#08B36A]/20 transition-all"
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
                  <th className="p-6">Patient Details</th>
                  <th className="p-6">Vendor (Clinic)</th>
                  <th className="p-6">Appointment ID</th>
                  <th className="p-6">Status</th>
                  <th className="p-6 text-center">Details</th>
                  <th className="p-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredOrders.map((order) => (
                  <tr 
                    key={order.id} 
                    onClick={() => openDetails(order)}
                    className="group hover:bg-slate-50/80 cursor-pointer transition-all"
                  >
                    <td className="p-6 text-sm font-bold text-slate-400">{order.srNo}</td>
                    <td className="p-6">
                        <p className="text-sm font-black text-slate-800 tracking-tight">{order.patient}</p>
                        <p className="text-[10px] font-bold text-[#08B36A] uppercase">{order.email}</p>
                    </td>
                    <td className="p-6">
                        <div className="flex items-center gap-2">
                           <FaHospital className="text-slate-300 group-hover:text-[#08B36A] transition-colors" size={12}/>
                           <span className="text-sm font-bold text-slate-600">{order.clinic}</span>
                        </div>
                    </td>
                    <td className="p-6 text-sm font-bold text-blue-600 tracking-tighter">{order.id}</td>
                    <td className="p-6">
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${order.status === 'Accepted' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-6 text-center">
                       <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center mx-auto text-slate-400 group-hover:text-blue-500 transition-colors">
                          <FaEye />
                       </div>
                    </td>
                    <td className="p-6 text-right">
                      <button 
                        onClick={(e) => handleCancelOrder(e, order.id)}
                        className="bg-red-50 text-red-500 hover:bg-red-500 hover:text-white px-5 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-90 flex items-center gap-2 ml-auto"
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
          
          <div className="relative bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 bg-[#08B36A] text-white flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight">Appointment Brief</h2>
                <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest mt-1">Ref: {selectedOrder.id}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition-all">
                <FaTimes />
              </button>
            </div>

            <div className="p-10 space-y-8">
                <div className="grid grid-cols-2 gap-8">
                    <InfoItem icon={<FaIdBadge/>} label="Appointment ID" val={selectedOrder.id} />
                    <InfoItem icon={<FaCalendarAlt/>} label="Booking Date" val={selectedOrder.date} />
                    <InfoItem icon={<FaHospital/>} label="Assigned Vendor" val={selectedOrder.clinic} />
                    <InfoItem icon={<FaClock/>} label="Time Slot" val={selectedOrder.time} />
                </div>

                <div className="border-t border-slate-100 pt-8">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-4">Patient Information</p>
                    <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#08B36A] shadow-sm font-black text-lg">
                            {selectedOrder.patient.charAt(0)}
                        </div>
                        <div>
                            <p className="text-base font-black text-slate-800 leading-none">{selectedOrder.patient}</p>
                            <p className="text-xs font-bold text-slate-400 mt-2 flex items-center gap-2"><FaEnvelope size={10} className="text-[#08B36A]"/> {selectedOrder.email}</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 justify-center py-2">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Current Status:</span>
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ring-1 ${selectedOrder.status === 'Accepted' ? 'bg-green-50 text-green-600 ring-green-100' : 'bg-orange-50 text-orange-600 ring-orange-100'}`}>{selectedOrder.status}</span>
                </div>
            </div>

            <div className="px-10 pb-10">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-slate-800 transition-all active:scale-[0.98]"
              >
                Close Report
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
            <div className="text-[#08B36A] mt-1 opacity-60">{icon}</div>
            <div>
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">{label}</p>
                <p className="text-sm font-black text-slate-700">{val}</p>
            </div>
        </div>
    )
}