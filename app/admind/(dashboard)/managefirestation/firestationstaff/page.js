"use client";

import React, { useState } from 'react';
import { 
  FaUsers, FaFireAlt, FaEye, FaSearch, 
  FaPhone, FaMapMarkerAlt, FaTruckMoving, FaCalendarAlt, FaTimes, FaUserAlt, FaBriefcase
} from 'react-icons/fa';

const FireStaffPage = () => {
  // 1. Fire Department Demo Data
  const [staffData] = useState([
    {
      id: "FIRE-102",
      name: "Chief David Miller",
      rank: "Fire Chief",
      station: "Central Fire HQ",
      contact: "+91 98989 12345",
      email: "d.miller@firedept.gov",
      status: "On Duty",
      joinedDate: "10 March 2012",
      activeAssignment: "Op #442 - Industrial Zone Safety Audit",
      assignmentDescription: "Overseeing the annual fire safety compliance audit for the northern industrial sector. Coordinating with the hazardous materials team.",
      totalOperations: 124,
      specialization: "Hazmat & Technical Rescue"
    },
    {
      id: "FIRE-205",
      name: "Lt. Sarah Jenkins",
      rank: "Lieutenant",
      station: "West Wing Station",
      contact: "+91 88776 55443",
      email: "s.jenkins@firedept.gov",
      status: "On Field",
      joinedDate: "15 July 2017",
      activeAssignment: "Op #501 - Forest Perimeter Patrol",
      assignmentDescription: "Leading a squad for high-risk vegetation fire monitoring in the suburban-forest interface. Managing early detection sensors.",
      totalOperations: 68,
      specialization: "Wildland Firefighting"
    },
    {
      id: "FIRE-412",
      name: "Marcus Thorne",
      rank: "Firefighter / EMT",
      station: "East River Station",
      contact: "+91 70011 22334",
      email: "m.thorne@firedept.gov",
      status: "Off Duty",
      joinedDate: "22 Nov 2020",
      activeAssignment: "N/A",
      assignmentDescription: "Currently on scheduled rest period. Last major involvement was the rapid response medical evacuation at the City Metro incident.",
      totalOperations: 32,
      specialization: "Emergency Medical Care"
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 2. Logic
  const filteredStaff = staffData.filter(staff =>
    staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.station.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (staff) => {
    setSelectedStaff(staff);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-10 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl shadow-xl shadow-slate-200 flex items-center justify-center text-[#5cb85c]">
              <FaFireAlt size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#1e293b] tracking-tight">Fire Dept. Staff Directory</h1>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Personnel & Operational Management</p>
            </div>
          </div>

          <div className="relative w-full md:w-80">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
            <input 
              type="text" 
              placeholder="Search Staff ID, Name or Station..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-[#5cb85c]/5 focus:border-[#5cb85c] transition-all shadow-sm text-sm font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Staff ID & Name</th>
                  <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Rank</th>
                  <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Fire Station</th>
                  <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Active Operation</th>
                  <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredStaff.map((staff) => (
                  <tr key={staff.id} className="hover:bg-green-50/30 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-[#5cb85c] font-black text-xs">
                          {staff.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{staff.name}</p>
                          <p className="text-[10px] font-black text-[#5cb85c] uppercase tracking-tighter">{staff.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-black rounded-full uppercase tracking-wide border border-slate-200">
                        {staff.rank}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                        <FaMapMarkerAlt className="text-slate-300" /> {staff.station}
                      </p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-medium text-slate-500 max-w-[200px] truncate">
                        {staff.activeAssignment}
                      </p>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <button 
                        onClick={() => handleViewDetails(staff)}
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

      {/* --- STAFF PERSONNEL MODAL --- */}
      {isModalOpen && selectedStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="bg-[#5cb85c] p-8 text-white relative">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-all"
              >
                <FaTimes />
              </button>
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center text-[#5cb85c] text-3xl shadow-2xl border-4 border-white/20">
                  <FaUserAlt />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-3xl font-black tracking-tight">{selectedStaff.name}</h2>
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/20">
                      {selectedStaff.status}
                    </span>
                  </div>
                  <p className="text-green-100 font-bold uppercase tracking-[0.2em] text-xs">Personnel ID: {selectedStaff.id}</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 bg-[#fdfdfd]">
              
              <div className="space-y-6">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 ml-1">Staff Information</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-[#5cb85c]"><FaTruckMoving /></div>
                    <div><p className="text-[9px] font-black text-slate-400 uppercase">Designation</p><p className="text-sm font-bold">{selectedStaff.rank}</p></div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-[#5cb85c]"><FaPhone /></div>
                    <div><p className="text-[9px] font-black text-slate-400 uppercase">Emergency Contact</p><p className="text-sm font-bold">{selectedStaff.contact}</p></div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-[#5cb85c]"><FaCalendarAlt /></div>
                    <div><p className="text-[9px] font-black text-slate-400 uppercase">Service Start Date</p><p className="text-sm font-bold">{selectedStaff.joinedDate}</p></div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 ml-1">Service Analytics</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                    <p className="text-[20px] font-black text-[#5cb85c] leading-none">{selectedStaff.totalOperations}</p>
                    <p className="text-[9px] font-black text-slate-400 uppercase mt-1">Total Ops</p>
                  </div>
                  <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                    <p className="text-sm font-black text-slate-700 leading-none truncate">{selectedStaff.specialization.split(' ')[0]}</p>
                    <p className="text-[9px] font-black text-slate-400 uppercase mt-1">Expertise</p>
                  </div>
                </div>
                <div className="p-4 bg-green-50/50 rounded-2xl border border-green-100">
                   <p className="text-[9px] font-black text-[#5cb85c] uppercase mb-1">Official Communications</p>
                   <p className="text-xs font-bold text-slate-600 truncate">{selectedStaff.email}</p>
                </div>
              </div>

              {/* Assignment Details */}
              <div className="md:col-span-2 bg-slate-50 p-6 rounded-[1.5rem] border border-slate-100">
                <div className="flex items-center gap-3 mb-4">
                   <FaBriefcase className="text-[#5cb85c]" />
                   <h5 className="font-black text-slate-800 uppercase text-xs tracking-widest">Active Deployment</h5>
                </div>
                <p className="text-sm font-bold text-[#5cb85c] mb-2">{selectedStaff.activeAssignment}</p>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  {selectedStaff.assignmentDescription}
                </p>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-8 py-6 bg-white border-t border-slate-50 flex justify-end">
               <button 
                onClick={() => setIsModalOpen(false)}
                className="px-10 py-3 bg-[#5cb85c] hover:bg-[#4cae4c] text-white font-black rounded-xl text-xs uppercase tracking-widest shadow-xl shadow-green-100 transition-all active:scale-95"
               >
                 Close Personnel File
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FireStaffPage;