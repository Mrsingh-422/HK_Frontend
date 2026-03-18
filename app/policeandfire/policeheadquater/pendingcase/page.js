'use client'
import React, { useState } from 'react'
import { 
  FaSearch, 
  FaEye, 
  FaShieldAlt, 
  FaMapMarkerAlt, 
  FaClock, 
  FaUserShield,
  FaFilter,
  FaFileExport,
  FaTimes,
  FaHospital,
  FaUserInjured,
  FaExclamationTriangle,
  FaUserTie,
  FaHourglassHalf,
  FaFolderOpen
} from 'react-icons/fa'

export default function PendingCasePoliceTable() {
  const [selectedCase, setSelectedCase] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Mock Data for Pending Cases
  const [pendingCases] = useState([
    { 
      id: "MLC-77202511", 
      patient: "Vikram Malhotra", 
      incidentType: "Physical Assault", 
      assignedOfficer: "Inspector Vikram Singh",
      pendingSince: "3 Days",
      location: "Phase 3B2, Mohali", 
      hospital: "Radius Hospital",
      status: "Awaiting Statements",
      age: "42",
      gender: "Male",
      reportedBy: "Dr. Aman Deep",
      lastUpdate: "2025-03-05 09:00 AM",
      summary: "Victim still unconscious. Statements of eye-witnesses recorded. Forensic team visiting site tomorrow."
    },
    { 
      id: "MLC-77202515", 
      patient: "Sonia Gandhi", 
      incidentType: "Road Accident", 
      assignedOfficer: "SI Rajesh Kumar",
      pendingSince: "1 Day",
      location: "Airport Road", 
      hospital: "Fortis IT",
      status: "CCTV Retrieval",
      age: "29",
      gender: "Female",
      reportedBy: "Dr. Mike",
      lastUpdate: "2025-03-05 04:30 PM",
      summary: "Request sent to Mohali Traffic Police for CCTV footage of the intersection. Vehicle seized."
    },
    { 
      id: "MLC-77202519", 
      patient: "Kabir Das", 
      incidentType: "Workplace Injury", 
      assignedOfficer: "Officer Amit Verma",
      pendingSince: "5 Days",
      location: "Industrial Area", 
      hospital: "City Care",
      status: "Safety Audit",
      age: "51",
      gender: "Male",
      reportedBy: "Dr. Sunita",
      lastUpdate: "2025-03-04 11:20 AM",
      summary: "Factory manager summoned. Verification of safety equipment records in progress."
    }
  ]);

  const handleOpenDetails = (caseItem) => {
    setSelectedCase(caseItem);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans">
      
      {/* --- STATS SUMMARY --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatMini label="Active Investigations" value="28" color="text-orange-600" />
        <StatMini label="Forensic Pending" value="09" color="text-blue-600" />
        <StatMini label="Statements Required" value="12" color="text-purple-600" />
      </div>

      {/* --- TABLE CONTAINER --- */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        
        {/* Table Header / Toolbar */}
        <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-4 bg-white">
          <div>
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-3">
              <span className="p-2 bg-orange-50 text-orange-500 rounded-lg"><FaFolderOpen /></span>
              Pending Investigations
            </h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Cases undergoing verification</p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-3.5" />
              <input 
                type="text" 
                placeholder="Search Pending Cases..." 
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
              />
            </div>
            <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-colors">
              <FaFilter size={14} />
            </button>
            <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-colors">
              <FaFileExport size={14} />
            </button>
          </div>
        </div>

        {/* The Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.15em] border-y border-slate-50">
                <th className="px-6 py-4">Case ID</th>
                <th className="px-6 py-4">Victim Name</th>
                <th className="px-6 py-4">Assigned Officer</th>
                <th className="px-6 py-4">Pending Stage</th>
                <th className="px-6 py-4">Delay</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {pendingCases.map((item) => (
                <tr 
                  key={item.id} 
                  onClick={() => handleOpenDetails(item)}
                  className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                >
                  <td className="px-6 py-5">
                    <span className="text-sm font-black text-blue-600">{item.id}</span>
                  </td>
                  
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-700">{item.patient}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{item.incidentType}</span>
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-slate-100 rounded-md text-slate-400"><FaUserTie size={12}/></div>
                        <span className="text-sm font-bold text-slate-600">{item.assignedOfficer}</span>
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <span className="px-3 py-1 bg-orange-50 text-orange-600 text-[10px] font-black rounded-lg uppercase tracking-wider">
                      {item.status}
                    </span>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-slate-400">
                      <FaHourglassHalf size={10} className="text-orange-400" />
                      <span className="text-xs font-bold">{item.pendingSince}</span>
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex items-center justify-center">
                      <button className="bg-white border-2 border-slate-100 text-[#08B36A] px-5 py-2 rounded-xl text-[11px] font-black hover:border-[#08B36A] transition-all flex items-center gap-2">
                        <FaEye /> VIEW STATUS
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-50 bg-slate-50/30 flex justify-between items-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Investigation Count: {pendingCases.length}</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 text-[10px] font-black text-slate-500 border border-slate-200 rounded-lg bg-white">Prev</button>
            <button className="px-3 py-1 text-[10px] font-black text-slate-500 border border-slate-200 rounded-lg bg-white">Next</button>
          </div>
        </div>
      </div>

      {/* --- CASE DETAILS MODAL --- */}
      {isModalOpen && selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm shadow-inner" onClick={() => setIsModalOpen(false)}></div>
            <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                
                {/* Modal Header */}
                <div className="p-8 border-b border-slate-50 flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-orange-50 text-orange-500 rounded-2xl">
                            <FaHourglassHalf size={24} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Pending Case: {selectedCase.id}</h3>
                            <p className="text-orange-500 font-bold text-[10px] uppercase tracking-[0.15em] mt-1 flex items-center gap-2">
                                <FaExclamationTriangle /> Current Status: {selectedCase.status}
                            </p>
                        </div>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    
                    {/* Patient & Officer Section */}
                    <div className="space-y-4">
                        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <FaUserInjured /> Case Details
                        </h4>
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                            <p className="text-lg font-black text-slate-800">{selectedCase.patient}</p>
                            <p className="text-xs font-bold text-slate-500 mt-1">{selectedCase.incidentType} Case • Age: {selectedCase.age}</p>
                        </div>
                        <InfoItem label="Assigned Officer" value={selectedCase.assignedOfficer} color="text-[#08B36A]" />
                        <InfoItem label="Incident Location" value={selectedCase.location} />
                    </div>

                    {/* Timeline & Status Section */}
                    <div className="space-y-4">
                        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <FaShieldAlt /> Investigation Progress
                        </h4>
                        <InfoItem label="Pending Since" value={selectedCase.pendingSince} />
                        <InfoItem label="Hospital Registry" value={selectedCase.hospital} />
                        <InfoItem label="Last Update" value={selectedCase.lastUpdate} />
                    </div>

                    {/* Investigation Summary (Full Width) */}
                    <div className="md:col-span-2 space-y-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase ml-1">Investigation Summary / Reminders</p>
                        <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl">
                            <p className="text-sm font-bold text-slate-600 leading-relaxed italic">
                                "{selectedCase.summary}"
                            </p>
                        </div>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="p-8 bg-slate-50 flex justify-between gap-3">
                    <div className="flex gap-2">
                        <button className="bg-white border border-slate-200 text-slate-500 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest">
                            Print MLC Form
                        </button>
                    </div>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => setIsModalOpen(false)}
                            className="px-6 py-3 text-slate-500 font-black text-[11px] uppercase tracking-widest"
                        >
                            Cancel
                        </button>
                        <button className="bg-[#08B36A] text-white px-8 py-3 rounded-2xl text-[11px] font-black shadow-xl shadow-green-100 uppercase tracking-widest">
                            Update Investigation
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  )
}

// Small helper component for mini stats
function StatMini({ label, value, color }) {
  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-xl font-black ${color}`}>{value}</p>
    </div>
  )
}

// Modal info field helper
function InfoItem({ label, value, color = "text-slate-700" }) {
    return (
        <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-1">{label}</p>
            <div className="bg-white border border-slate-100 px-4 py-2.5 rounded-xl">
                <p className={`text-sm font-bold ${color}`}>{value}</p>
            </div>
        </div>
    )
}