"use client";
import React, { useState, useEffect } from "react";
import DiamondAPI from "@/app/services/DiamondAPI";
import { toast, Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { FaUserShield, FaSearch, FaTimes, FaUserSecret, FaMapMarkerAlt, FaIdBadge, FaShieldAlt, FaEnvelope, FaPhoneAlt } from "react-icons/fa";
 
export default function PoliceStaffPage() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedOfficer, setSelectedOfficer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
 
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://192.168.1.18:5002';
 
  const getImgUrl = (path) => {
    if (!path) return null;
    const cleanPath = path.replace('public/', '');
    return path.startsWith('http') ? path : `${BACKEND_URL}/${cleanPath}`;
  };
 
  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await DiamondAPI.getPoliceStaff();
      if (res.success) setStaff(res.data);
    } catch (err) { toast.error("Database connection error"); }
    finally { setLoading(false); }
  };
 
  useEffect(() => { fetchStaff(); }, []);
 
  const handleRowClick = (officer) => {
    setSelectedOfficer(officer);
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
              <FaUserShield size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Force Personnel</h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Officer Directory & Duty Status</p>
            </div>
          </div>
          <div className="relative flex-1 lg:w-96">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
            <input placeholder="Search badge or officer..." className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-[1.5rem] shadow-sm outline-none focus:ring-4 ring-emerald-500/5 font-bold text-xs" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
 
        <div className="bg-white rounded-[3rem] shadow-[0_20px_60px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                  <th className="px-10 py-6">Officer Dossier</th>
                  <th className="px-10 py-6">Assigned Precinct</th>
                  <th className="px-10 py-6">Rank</th>
                  <th className="px-10 py-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                   <tr><td colSpan="4" className="p-20 text-center font-black text-slate-300 animate-pulse tracking-[0.3em] uppercase">Opening Confidential Files...</td></tr>
                ) : filteredStaff.map((officer) => (
                  <tr key={officer._id} onClick={() => handleRowClick(officer)} className="hover:bg-emerald-50/20 transition-all group cursor-pointer">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-4">
                        {officer.profileImage ? (
                          <img src={getImgUrl(officer.profileImage)} className="w-10 h-10 rounded-xl object-cover border border-slate-100" alt="Officer" />
                        ) : (
                          <div className="w-10 h-10 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center font-black text-xs group-hover:bg-[#08B36A] group-hover:text-white transition-all">{officer.fullName?.charAt(0)}</div>
                        )}
                        <div>
                          <p className="font-black text-slate-800 text-sm uppercase tracking-tight">{officer.fullName}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">BADGE: {officer.badgeId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                       <p className="text-xs font-black text-slate-600 uppercase tracking-tight flex items-center gap-2"><FaMapMarkerAlt className="text-slate-200"/> {officer.stationId?.stationName || 'Field Unit'}</p>
                    </td>
                    <td className="px-10 py-6">
                       <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[9px] font-black border border-slate-200 uppercase tracking-widest">{officer.rank}</span>
                    </td>
                    <td className="px-10 py-6 font-black text-xs uppercase tracking-tighter text-slate-700">{officer.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
 
      {/* 🌟 OFFICER DETAIL MODAL 🌟 */}
      <AnimatePresence>
        {isModalOpen && selectedOfficer && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"></motion.div>
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden">
                <div className="p-10 bg-slate-900 text-white relative">
                    <div className="flex justify-between items-start z-10 relative">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 bg-[#08B36A] rounded-[2rem] flex items-center justify-center text-white text-3xl shadow-xl shadow-[#08B36A]/20">
                                <FaUserSecret />
                            </div>
                            <div>
                                <h3 className="text-3xl font-black uppercase tracking-tighter">{selectedOfficer.fullName}</h3>
                                <p className="text-emerald-400 font-bold uppercase tracking-[0.3em] text-[10px] mt-1">Rank: {selectedOfficer.rank}</p>
                            </div>
                        </div>
                        <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 flex items-center justify-center bg-white/10 rounded-2xl hover:rotate-90 transition-all"><FaTimes/></button>
                    </div>
                </div>
 
                <div className="p-10 space-y-8">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="p-5 bg-slate-50 rounded-[2rem] border border-slate-100">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2"><FaShieldAlt/> Force Division</p>
                            <p className="text-sm font-black text-slate-700 uppercase">{selectedOfficer.role}</p>
                        </div>
                        <div className="p-5 bg-slate-50 rounded-[2rem] border border-slate-100">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2"><FaIdBadge/> Badge Number</p>
                            <p className="text-sm font-black text-slate-700 uppercase">{selectedOfficer.badgeId}</p>
                        </div>
                    </div>
 
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-[#08B36A] uppercase tracking-[0.2em] border-b border-slate-50 pb-2">Confidential Contact Info</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-center gap-3"><FaEnvelope className="text-slate-200"/><span className="text-[11px] font-bold text-slate-600">{selectedOfficer.officialEmail}</span></div>
                            <div className="flex items-center gap-3"><FaPhoneAlt className="text-slate-200"/><span className="text-[11px] font-bold text-slate-600">{selectedOfficer.mobileNumber}</span></div>
                        </div>
                    </div>
 
                    <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><FaMapMarkerAlt/> Assigned To</p>
                         <p className="text-sm font-black text-slate-700 uppercase">{selectedOfficer.stationId?.stationName || 'Field Deployment'}</p>
                    </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
 