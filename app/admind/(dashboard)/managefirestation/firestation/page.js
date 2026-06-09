"use client";
import React, { useState, useEffect } from "react";
import DiamondAPI from "@/app/services/DiamondAPI";
import { toast, Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaFire, FaBuilding, FaSearch, FaTimes, FaMapMarkerAlt,
    FaPhoneAlt, FaEnvelope, FaUserTie, FaShieldAlt, FaClock
} from "react-icons/fa";
 
export default function ManageFirestation() {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedStation, setSelectedStation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
 
  // Backend URL from environment variable
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://192.168.1.18:5002';
 
  // 🌟 IMAGE URL HELPER (Logic from HQ code)
  const getImgUrl = (path) => {
    if (!path) return "https://via.placeholder.com/150?text=No+Image";
    const cleanPath = path.replace('public/', '');
    return path.startsWith('http') ? path : `${BACKEND_URL}/${cleanPath}`;
  };
 
  const fetchStations = async () => {
    try {
      setLoading(true);
      const res = await DiamondAPI.getFireStations();
      if (res.success) setStations(res.data);
    } catch (err) { toast.error("Failed to load stations"); }
    finally { setLoading(false); }
  };
 
  useEffect(() => { fetchStations(); }, []);
 
  const handleRowClick = (station) => {
    setSelectedStation(station);
    setIsModalOpen(true);
  };
 
  const filteredStations = stations.filter(s =>
    s.stationName?.toLowerCase().includes(search.toLowerCase()) ||
    s.stationCode?.toLowerCase().includes(search.toLowerCase())
  );
 
  return (
    <div className="p-6 md:p-10 bg-[#f8fafc] min-h-screen">
      <Toaster position="top-right" />
     
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-center mb-10 gap-6">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-white rounded-2xl shadow-xl flex items-center justify-center text-[#08B36A] border border-emerald-50">
              <FaFire size={28} className="animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Firestation Registry</h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Global Deployment Hub</p>
            </div>
          </div>
 
          <div className="relative w-full lg:w-96">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
            <input
              placeholder="Search station..."
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm outline-none focus:ring-4 ring-emerald-500/5 transition-all font-bold text-xs"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
 
        <div className="bg-white rounded-[3rem] shadow-[0_20px_60px_rgba(0,0,0,0.02)] border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-6 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Station Information</th>
                  <th className="px-8 py-6 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Commanding HQ</th>
                  <th className="px-8 py-6 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Captain</th>
                  <th className="px-8 py-6 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr><td colSpan="4" className="p-20 text-center font-black text-slate-300 animate-pulse uppercase tracking-widest text-xs">Synchronizing Nodes...</td></tr>
                ) : filteredStations.map((item) => (
                  <tr
                    key={item._id}
                    onClick={() => handleRowClick(item)}
                    className="hover:bg-emerald-50/30 transition-all cursor-pointer group"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        {/* 🌟 IMAGE FIX HERE */}
                        <img
                          src={getImgUrl(item.profileImage)}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-100 shadow-sm"
                          alt="Station"
                        />
                        <div>
                          <p className="font-black text-slate-800 text-sm uppercase">{item.stationName}</p>
                          <p className="text-[10px] font-bold text-[#08B36A] tracking-widest uppercase">CODE: {item.stationCode}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 font-black text-slate-500 text-xs uppercase tracking-tighter">
                       {item.hqId?.stationName || 'Regional Center'}
                    </td>
                    <td className="px-8 py-6 font-bold text-slate-600 text-xs uppercase">
                       {item.captainName}
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${item.isActive ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                        {item.isActive ? 'Active' : 'Offline'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
 
      {/* 🌟 STATION DETAIL MODAL 🌟 */}
      <AnimatePresence>
        {isModalOpen && selectedStation && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/70 backdrop-blur-md"></motion.div>
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden">
                <div className="px-10 py-10 bg-slate-900 text-white flex justify-between items-start relative overflow-hidden">
                    <div className="z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-[#08B36A] rounded-2xl shadow-lg"><FaShieldAlt size={22}/></div>
                            <span className="px-4 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest">Station Manifest</span>
                        </div>
                        <h3 className="text-4xl font-black uppercase tracking-tighter">{selectedStation.stationName}</h3>
                        <p className="text-emerald-400 text-xs font-bold mt-2 uppercase tracking-[0.3em]">System ID: {selectedStation._id.slice(-8)}</p>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="z-10 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-2xl transition-all"><FaTimes/></button>
                    <div className="absolute -right-20 -top-20 w-80 h-80 bg-[#08B36A] rounded-full blur-[120px] opacity-20"></div>
                </div>
 
                <div className="p-10 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-1 space-y-6">
                        {/* 🌟 MODAL IMAGE FIX HERE */}
                        <img
                          src={getImgUrl(selectedStation.profileImage)}
                          className="w-full h-48 rounded-[2rem] object-cover border-4 border-slate-50 shadow-lg"
                          alt="Detail"
                        />
                        <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 text-center">Commanding Officer</p>
                            <div className="flex items-center justify-center gap-3">
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#08B36A] shadow-sm"><FaUserTie/></div>
                                <p className="text-sm font-black text-slate-800 uppercase">{selectedStation.captainName}</p>
                            </div>
                        </div>
                    </div>
 
                    <div className="md:col-span-2 space-y-8">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><FaEnvelope className="text-emerald-500"/> Email</p>
                                <p className="text-sm font-bold text-slate-700">{selectedStation.email}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><FaPhoneAlt className="text-emerald-500"/> Contact</p>
                                <p className="text-sm font-bold text-slate-700">{selectedStation.phone}</p>
                            </div>
                        </div>
 
                        <div className="p-8 bg-[#08B36A]/5 rounded-[2.5rem] border border-emerald-100">
                             <p className="text-[10px] font-black text-[#08B36A] uppercase tracking-[0.2em] mb-3 flex items-center gap-2"><FaMapMarkerAlt/> Deployment Address</p>
                             <p className="text-sm font-bold text-slate-700 leading-relaxed uppercase">{selectedStation.address || 'Address pending verification in system records...'}</p>
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
 