'use client';

import React, { useState, useMemo } from 'react';
import { 
  FaSearch, FaEye, FaTimes, FaQuestionCircle, FaArrowLeft, 
  FaPlus, FaRegEdit, FaRegTrashAlt, FaCheckCircle, 
  FaTicketAlt, FaFilter, FaUserCircle, FaInfoCircle
} from 'react-icons/fa';

export default function HelpRequestPage() {
  // --- STATE MANAGEMENT ---
  const [requests, setRequests] = useState([
    { id: 1, ticketId: "TK-101", user: "Yash User", email: "yash@hk.com", category: "AppointmentBooking Problem.", status: "Pending", priority: "High", date: "2024-03-20" },
    { id: 2, ticketId: "TK-102", user: "Amit Mehra", email: "amit@dev.com", category: "medicine buying issue.", status: "Resolved", priority: "Medium", date: "2024-03-19" },
    { id: 3, ticketId: "TK-103", user: "Nitish Kumar", email: "nitish@hk.com", category: "Service booking problem.", status: "Pending", priority: "Critical", date: "2024-03-20" },
    { id: 4, ticketId: "TK-104", user: "Naman Sharma", email: "naman@gmail.com", category: "Booking Hospital bed issue.", status: "Pending", priority: "High", date: "2024-03-18" },
    { id: 5, ticketId: "TK-105", user: "Deepankar", email: "deep@gmail.com", category: "Profile update problem.", status: "Resolved", priority: "Low", date: "2024-03-17" },
    { id: 6, ticketId: "TK-106", user: "Sahib Singh", email: "sahib@hk.com", category: "Health locker pin generate issue.", status: "Pending", priority: "Medium", date: "2024-03-20" },
    { id: 7, ticketId: "TK-107", user: "Karan Johar", email: "karan@dev.com", category: "Health locker update issue.", status: "Pending", priority: "High", date: "2024-03-20" },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("view"); // add, edit, view
  const [selectedItem, setSelectedItem] = useState(null);

  // Form State
  const [formData, setFormData] = useState({ user: "", email: "", category: "", priority: "Medium", message: "" });

  // --- HANDLERS ---

  const handleOpenModal = (mode, item = null) => {
    setModalMode(mode);
    if (item) {
      setSelectedItem(item);
      setFormData({ ...item, message: item.message || "User is reporting a critical issue regarding " + item.category });
    } else {
      setFormData({ user: "", email: "", category: "", priority: "Medium", message: "" });
    }
    setIsModalOpen(true);
  };

  const handleAction = (e) => {
    e.preventDefault();
    if (modalMode === "add") {
      const newReq = {
        ...formData,
        id: requests.length + 1,
        ticketId: `TK-${Math.floor(Math.random() * 900) + 100}`,
        status: "Pending",
        date: new Date().toISOString().split('T')[0]
      };
      setRequests([newReq, ...requests]);
    } else if (modalMode === "edit") {
      setRequests(requests.map(r => r.id === selectedItem.id ? { ...r, ...formData } : r));
    }
    setIsModalOpen(false);
  };

  const handleDelete = (e, id) => {
    e.stopPropagation(); // Prevents opening modal when clicking delete
    if (window.confirm("Remove this request from the registry?")) {
      setRequests(requests.filter(r => r.id !== id));
    }
  };

  const filteredData = useMemo(() => {
    return requests.filter(r => 
      r.category.toLowerCase().includes(searchTerm.toLowerCase()) || 
      r.user.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, requests]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
                <FaQuestionCircle className="text-[#08B36A] text-2xl" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none uppercase">Help Requests</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">Support Ticket Registry</p>
            </div>
          </div>
          <div className="flex gap-3">
              <button onClick={() => handleOpenModal("add")} className="bg-[#08B36A] text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-green-100 flex items-center gap-2 active:scale-95 transition-all">
                <FaPlus /> New Ticket
              </button>
              <button onClick={() => window.history.back()} className="bg-white border border-slate-200 text-slate-600 px-6 py-3 rounded-xl font-bold text-xs shadow-sm hover:bg-slate-50 uppercase tracking-widest transition-all">
                <FaArrowLeft /> Back
              </button>
          </div>
        </div>

        {/* --- TABLE CARD --- */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          
          <div className="p-6 border-b border-slate-50 flex justify-between bg-white">
            <div className="relative max-w-md group w-full">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#08B36A] transition-colors" />
              <input 
                type="text" 
                placeholder="Search requests..." 
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#08B36A]/20 transition-all font-medium" 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
            </div>
          </div>

          <div className="overflow-x-auto px-4 py-2">
            <table className="w-full text-left border-separate border-spacing-y-3">
              <thead>
                <tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
                  <th className="px-6 py-2">S No.</th>
                  <th className="px-6 py-2">Help Request / Issue</th>
                  <th className="px-6 py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y-0">
                {filteredData.map((item, index) => (
                  <tr 
                    key={item.id} 
                    onClick={() => handleOpenModal("view", item)}
                    className="group hover:translate-x-1 hover:bg-emerald-50/30 transition-all cursor-pointer bg-slate-50/50 rounded-2xl"
                  >
                    <td className="px-6 py-5 rounded-l-2xl text-xs font-bold text-slate-400">
                        {String(index + 1).padStart(2, '0')}
                    </td>
                    <td className="px-6 py-5">
                        <p className="text-sm font-black text-slate-700 group-hover:text-[#08B36A] transition-colors">{item.category}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Ref: {item.ticketId} • By {item.user}</p>
                    </td>
                    <td className="px-6 py-5 rounded-r-2xl text-right space-x-3">
                        <button onClick={(e) => { e.stopPropagation(); handleOpenModal("edit", item); }} className="p-2.5 bg-white border border-slate-200 rounded-xl text-orange-400 hover:text-orange-600 transition-all shadow-sm"><FaRegEdit /></button>
                        <button onClick={(e) => handleDelete(e, item.id)} className="p-2.5 bg-white border border-slate-200 rounded-xl text-rose-400 hover:text-rose-600 transition-all shadow-sm"><FaRegTrashAlt /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-8 border-t border-slate-50 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <span>Showing {filteredData.length} records</span>
              <div className="flex gap-2">
                <button className="px-4 py-2 border border-slate-100 rounded-lg hover:bg-slate-50">Prev</button>
                <button className="px-4 py-2 bg-[#08B36A] text-white rounded-lg">1</button>
                <button className="px-4 py-2 border border-slate-100 rounded-lg hover:bg-slate-50">Next</button>
              </div>
          </div>
        </div>
      </div>

      {/* --- BEAUTIFUL MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-[#F8FAFC]">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#08B36A] shadow-sm border border-slate-100"><FaTicketAlt /></div>
                    <div>
                        <h3 className="text-xl font-black uppercase text-slate-800 leading-none">
                            {modalMode === 'add' ? 'Raise Support Ticket' : modalMode === 'edit' ? 'Modify Ticket' : 'Ticket Summary'}
                        </h3>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2">HK Internal Support System</p>
                    </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-300 hover:text-red-500 transition-colors"><FaTimes size={20}/></button>
            </div>

            <form onSubmit={handleAction} className="p-10 space-y-8 overflow-y-auto max-h-[70vh]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">User Identity</label>
                    <div className="relative">
                        <FaUserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                        <input disabled={modalMode === 'view'} value={formData.user} onChange={(e)=>setFormData({...formData, user: e.target.value})} className="w-full pl-10 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#08B36A]/20" required />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ticket Priority</label>
                    <select disabled={modalMode === 'view'} value={formData.priority} onChange={(e)=>setFormData({...formData, priority: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none">
                        <option value="Low">Low Priority</option>
                        <option value="Medium">Medium Priority</option>
                        <option value="High">High Priority</option>
                        <option value="Critical">Critical Issue</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">The Help Request</label>
                  <input disabled={modalMode === 'view'} value={formData.category} onChange={(e)=>setFormData({...formData, category: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-[#08B36A] uppercase tracking-tight outline-none" required />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Detailed Log / Message</label>
                  <textarea disabled={modalMode === 'view'} rows={4} value={formData.message} onChange={(e)=>setFormData({...formData, message: e.target.value})} className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium text-slate-600 outline-none focus:ring-2 focus:ring-[#08B36A]/20 leading-relaxed" required />
                </div>

                {modalMode !== "view" ? (
                  <button type="submit" className="w-full py-5 bg-[#08B36A] text-white rounded-3xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-green-100 flex items-center justify-center gap-2 active:scale-95 transition-all">
                    <FaCheckCircle /> {modalMode === 'add' ? 'Confirm Dispatch' : 'Commit Changes'}
                  </button>
                ) : (
                  <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 flex items-start gap-4">
                      <FaInfoCircle className="text-blue-500 mt-1 shrink-0" />
                      <div>
                        <h4 className="text-xs font-black text-blue-900 uppercase tracking-widest">Support Resolution Trace</h4>
                        <p className="text-[11px] font-bold text-blue-700/70 mt-1 leading-relaxed">This request was logged on {selectedItem?.date}. Our support agents are currently investigating the matter with the relevant department.</p>
                      </div>
                  </div>
                )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}