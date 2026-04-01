"use client";

import React, { useState } from 'react';
import { 
  FaUserShield, FaShieldAlt, FaEye, FaSearch, 
  FaPhone, FaMapMarkerAlt, FaBriefcase, FaCalendarAlt, FaTimes, FaUserSecret
} from 'react-icons/fa';

const PoliceStaffPage = () => {
  // 1. Demo Data
  const [staffData] = useState([
    {
      id: "BADGE-1024",
      name: "Captain James Wilson",
      rank: "Captain",
      station: "Central District HQ",
      contact: "+91 98765 43210",
      email: "j.wilson@police.gov",
      status: "Active",
      joinedDate: "12 May 2015",
      currentCase: "Case #882 - Cyber Fraud Investigation",
      caseDescription: "Leading a task force to track down a decentralized network involved in regional financial phishing. Currently coordinating with the Cyber Cell.",
      totalCases: 42,
      specialization: "Cyber Crime & Forensics"
    },
    {
      id: "BADGE-2209",
      name: "Sergeant Sarah Chen",
      rank: "Sergeant",
      station: "West Park Station",
      contact: "+91 91234 56789",
      email: "s.chen@police.gov",
      status: "On Field",
      joinedDate: "20 Jan 2018",
      currentCase: "Case #901 - Retail Theft Ring",
      caseDescription: "Investigating a series of coordinated shoplifting incidents across local shopping malls. Stakeouts are currently in progress.",
      totalCases: 15,
      specialization: "Internal Security"
    },
    {
      id: "BADGE-4512",
      name: "Officer Robert Miller",
      rank: "Constable",
      station: "East Valley Station",
      contact: "+91 90000 11122",
      email: "r.miller@police.gov",
      status: "On Leave",
      joinedDate: "05 Sept 2020",
      currentCase: "N/A",
      caseDescription: "Officer Miller is currently on approved medical leave. Previous case involvement included Traffic management for the Annual City Parade.",
      totalCases: 5,
      specialization: "Traffic & Patrol"
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOfficer, setSelectedOfficer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 2. Logic
  const filteredStaff = staffData.filter(officer =>
    officer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    officer.station.toLowerCase().includes(searchTerm.toLowerCase()) ||
    officer.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (officer) => {
    setSelectedOfficer(officer);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-10 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl shadow-xl shadow-slate-200 flex items-center justify-center text-[#5cb85c]">
              <FaUserShield size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#1e293b] tracking-tight">Police Staff Directory</h1>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Personnel & Case Management</p>
            </div>
          </div>

          <div className="relative w-full md:w-80">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
            <input 
              type="text" 
              placeholder="Search Badge, Name or Station..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-[#5cb85c]/5 focus:border-[#5cb85c] transition-all shadow-sm text-sm font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Staff Table */}
        <div className="bg-white rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Badge & Officer</th>
                  <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Rank</th>
                  <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Station Assignment</th>
                  <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Active Case</th>
                  <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredStaff.map((officer) => (
                  <tr key={officer.id} className="hover:bg-green-50/30 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-[#5cb85c] font-black text-xs">
                          {officer.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{officer.name}</p>
                          <p className="text-[10px] font-black text-[#5cb85c] uppercase tracking-tighter">{officer.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-black rounded-full uppercase tracking-wide border border-slate-200">
                        {officer.rank}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                        <FaMapMarkerAlt className="text-slate-300" /> {officer.station}
                      </p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-medium text-slate-500 max-w-[200px] truncate">
                        {officer.currentCase}
                      </p>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <button 
                        onClick={() => handleViewDetails(officer)}
                        className="p-3 bg-[#5cb85c] text-white rounded-xl hover:bg-[#4cae4c] transition-all shadow-lg shadow-green-100 active:scale-90"
                      >
                        <FaEye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- OFFICER DETAILS MODAL --- */}
      {isModalOpen && selectedOfficer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="bg-[#5cb85c] p-8 text-white relative">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-all"
              >
                <FaTimes />
              </button>
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center text-[#5cb85c] text-3xl shadow-2xl border-4 border-white/20">
                  <FaUserSecret />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-3xl font-black tracking-tight">{selectedOfficer.name}</h2>
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/20">
                      {selectedOfficer.status}
                    </span>
                  </div>
                  <p className="text-green-100 font-bold uppercase tracking-[0.2em] text-xs">Badge ID: {selectedOfficer.id}</p>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 bg-[#fdfdfd]">
              
              {/* Profile Info */}
              <div className="space-y-6">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 ml-1">Personnel Details</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-[#5cb85c]"><FaShieldAlt /></div>
                    <div><p className="text-[9px] font-black text-slate-400 uppercase">Current Rank</p><p className="text-sm font-bold">{selectedOfficer.rank}</p></div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-[#5cb85c]"><FaPhone /></div>
                    <div><p className="text-[9px] font-black text-slate-400 uppercase">Contact Number</p><p className="text-sm font-bold">{selectedOfficer.contact}</p></div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-[#5cb85c]"><FaCalendarAlt /></div>
                    <div><p className="text-[9px] font-black text-slate-400 uppercase">Date Joined</p><p className="text-sm font-bold">{selectedOfficer.joinedDate}</p></div>
                  </div>
                </div>
              </div>

              {/* Case Stats */}
              <div className="space-y-6">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 ml-1">Career Overview</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                    <p className="text-[20px] font-black text-[#5cb85c] leading-none">{selectedOfficer.totalCases}</p>
                    <p className="text-[9px] font-black text-slate-400 uppercase mt-1">Total Cases</p>
                  </div>
                  <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                    <p className="text-sm font-black text-slate-700 leading-none truncate">{selectedOfficer.specialization.split(' ')[0]}</p>
                    <p className="text-[9px] font-black text-slate-400 uppercase mt-1">Expertise</p>
                  </div>
                </div>
                <div className="p-4 bg-green-50/50 rounded-2xl border border-green-100">
                   <p className="text-[9px] font-black text-[#5cb85c] uppercase mb-1">Official Email</p>
                   <p className="text-xs font-bold text-slate-600 truncate">{selectedOfficer.email}</p>
                </div>
              </div>

              {/* Full Case Details */}
              <div className="md:col-span-2 bg-slate-50 p-6 rounded-[1.5rem] border border-slate-100">
                <div className="flex items-center gap-3 mb-4">
                   <FaBriefcase className="text-[#5cb85c]" />
                   <h5 className="font-black text-slate-800 uppercase text-xs tracking-widest">Active Case Assignment</h5>
                </div>
                <p className="text-sm font-bold text-[#5cb85c] mb-2">{selectedOfficer.currentCase}</p>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  {selectedOfficer.caseDescription}
                </p>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-8 py-6 bg-white border-t border-slate-50 flex justify-end gap-3">
               <button 
                onClick={() => setIsModalOpen(false)}
                className="px-10 py-3 bg-[#5cb85c] hover:bg-[#4cae4c] text-white font-black rounded-xl text-xs uppercase tracking-widest shadow-xl shadow-green-100 transition-all active:scale-95"
               >
                 Close Dossier
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PoliceStaffPage;