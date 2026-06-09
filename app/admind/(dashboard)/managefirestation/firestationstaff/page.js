"use client";
import React, { useState, useEffect } from "react";
import DiamondAPI from "@/app/services/DiamondAPI";
import { toast, Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { FaUsers, FaSearch, FaTimes, FaUserAlt, FaMapMarkerAlt, FaIdBadge, FaBriefcase, FaCalendarAlt, FaPhoneAlt, FaEnvelope } from "react-icons/fa";
 
export default function FireStaffPage() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
 
  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await DiamondAPI.getFireStaff();
      if (res.success) setStaff(res.data);
    } catch (err) { toast.error("Failed to load staff"); }
    finally { setLoading(false); }
  };
 
  useEffect(() => { fetchStaff(); }, []);
 
  const handleRowClick = (person) => {
    setSelectedStaff(person);
    setIsModalOpen(true);
  };
 
  const filteredStaff = staff.filter(s =>
    s.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    s.badgeId?.toLowerCase().includes(search.toLowerCase())
  );
 
  return (
    <div className="p-6 md:p-10 bg-[#f8fafc] min-h-screen">
      <Toaster position="top-right" />
     
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-center mb-10 gap-6">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-slate-900 rounded-2xl shadow-xl flex items-center justify-center text-[#08B36A]">
              <FaUsers size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Fire Personnel</h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Shift Management & Duty Roster</p>
            </div>
          </div>
 
          <div className="relative w-full lg:w-96">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
            <input
              placeholder="Search by Name or Badge..."
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-[1.5rem] shadow-sm outline-none focus:ring-4 ring-emerald-500/5 transition-all font-bold text-xs"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
 
        <div className="bg-white rounded-[3rem] shadow-[0_20px_60px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                  <th className="px-10 py-6">Officer Detail</th>
                  <th className="px-10 py-6">Assigned Station</th>
                  <th className="px-10 py-6">Shift</th>
                  <th className="px-10 py-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                   <tr><td colSpan="4" className="p-20 text-center font-black text-slate-300 animate-pulse uppercase tracking-[0.3em]">Accessing Database...</td></tr>
                ) : filteredStaff.map((person) => (
                  <tr
                    key={person._id}
                    onClick={() => handleRowClick(person)}
                    className="hover:bg-emerald-50/20 transition-all group cursor-pointer"
                  >
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-emerald-50 text-[#08B36A] rounded-xl flex items-center justify-center font-black text-xs border border-emerald-100 uppercase group-hover:scale-110 transition-transform">
                          {person.fullName?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-slate-800 text-sm uppercase tracking-tight">{person.fullName}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">BADGE: {person.badgeId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                       <div className="flex items-center gap-2">
                          <FaMapMarkerAlt className="text-slate-300" size={12}/>
                          <span className="text-xs font-black text-slate-600 uppercase tracking-tight">{person.stationId?.stationName || 'Unassigned'}</span>
                       </div>
                    </td>
                    <td className="px-10 py-6">
                       <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[9px] font-black border border-slate-200 uppercase tracking-widest">
                          {person.currentShift || 'Shift A'}
                       </span>
                    </td>
                    <td className="px-10 py-6 font-black text-xs uppercase tracking-tighter text-slate-700">
                        {person.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
 
      {/* 🌟 PERSONNEL DETAIL MODAL 🌟 */}
      <AnimatePresence>
        {isModalOpen && selectedStaff && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"></motion.div>
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden">
                <div className="p-10 bg-slate-900 text-white relative">
                    <div className="flex justify-between items-start z-10 relative">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 bg-[#08B36A] rounded-[2rem] flex items-center justify-center text-white text-3xl shadow-xl shadow-[#08B36A]/20">
                                {selectedStaff.fullName?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h3 className="text-3xl font-black uppercase tracking-tighter">{selectedStaff.fullName}</h3>
                                <p className="text-emerald-400 font-bold uppercase tracking-[0.3em] text-[10px] mt-1">Badge: {selectedStaff.badgeId}</p>
                            </div>
                        </div>
                        <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 flex items-center justify-center bg-white/10 rounded-2xl hover:rotate-90 transition-all"><FaTimes/></button>
                    </div>
                </div>
 
                <div className="p-10 space-y-8">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="p-5 bg-slate-50 rounded-[2rem] border border-slate-100">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2"><FaBriefcase/> Position/Rank</p>
                            <p className="text-sm font-black text-slate-700 uppercase">{selectedStaff.rank || 'Firefighter'}</p>
                        </div>
                        <div className="p-5 bg-slate-50 rounded-[2rem] border border-slate-100">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2"><FaCalendarAlt/> Member Since</p>
                            <p className="text-sm font-black text-slate-700 uppercase">{new Date(selectedStaff.createdAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</p>
                        </div>
                    </div>
 
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-5">
                            <h4 className="text-[10px] font-black text-[#08B36A] uppercase tracking-[0.2em] border-b border-slate-50 pb-2">Duty Parameters</h4>
                            <div className="space-y-3">
                                <div className="flex justify-between"><span className="text-[11px] font-bold text-slate-400 uppercase">Station</span><span className="text-[11px] font-black text-slate-800 uppercase">{selectedStaff.stationId?.stationName || 'N/A'}</span></div>
                                <div className="flex justify-between"><span className="text-[11px] font-bold text-slate-400 uppercase">Current Shift</span><span className="text-[11px] font-black text-slate-800 uppercase">{selectedStaff.currentShift}</span></div>
                                <div className="flex justify-between"><span className="text-[11px] font-bold text-slate-400 uppercase">Role Type</span><span className="text-[11px] font-black text-slate-800 uppercase">{selectedStaff.role}</span></div>
                                <div className="flex justify-between"><span className="text-[11px] font-bold text-slate-400 uppercase">Attendance</span><span className="text-[11px] font-black text-emerald-600 uppercase">{selectedStaff.attendancePercentage}% Rate</span></div>
                            </div>
                        </div>
                        <div className="space-y-5">
                            <h4 className="text-[10px] font-black text-[#08B36A] uppercase tracking-[0.2em] border-b border-slate-50 pb-2">Connectivity</h4>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3"><FaEnvelope className="text-slate-200"/><span className="text-[11px] font-bold text-slate-600">{selectedStaff.officialEmail}</span></div>
                                <div className="flex items-center gap-3"><FaPhoneAlt className="text-slate-200"/><span className="text-[11px] font-bold text-slate-600">{selectedStaff.mobileNumber}</span></div>
                                <div className="flex items-start gap-3 leading-tight"><FaMapMarkerAlt className="text-slate-200 mt-1"/><span className="text-[11px] font-bold text-slate-600 uppercase">{selectedStaff.address || 'Address not listed'}</span></div>
                            </div>
                        </div>
                    </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
 