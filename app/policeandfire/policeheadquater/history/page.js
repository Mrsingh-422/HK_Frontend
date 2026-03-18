'use client'
import React, { useState } from 'react'
import { 
  FaSearch, 
  FaEye, 
  FaShieldAlt, 
  FaCheckCircle, 
  FaHistory, 
  FaUserShield,
  FaFilter,
  FaFileExport,
  FaTimes,
  FaHospital,
  FaUserInjured,
  FaCalendarCheck,
  FaUserTie,
  FaClipboardCheck,
  FaPrint
} from 'react-icons/fa'

export default function HistoryCasePoliceTable() {
  const [selectedCase, setSelectedCase] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Mock Data for History (Closed Cases)
  const [historyCases] = useState([
    { 
      id: "MLC-20250001", 
      patient: "Aman Preet Singh", 
      incidentType: "Road Accident", 
      closedBy: "Inspector Vikram Singh",
      closureDate: "2025-02-28",
      location: "Sector 74, Mohali", 
      hospital: "Radius Hospital",
      resolution: "Solved - FIR Filed",
      age: "31",
      gender: "Male",
      reportedBy: "Dr. Aman Deep",
      finalNote: "Statements of both parties recorded. Insurance claim processed and FIR #442 registered at Phase 8 Police Station.",
      image: "https://via.placeholder.com/150"
    },
    { 
      id: "MLC-20250005", 
      patient: "Sunita Rani", 
      incidentType: "Household Injury", 
      closedBy: "SI Rajesh Kumar",
      closureDate: "2025-03-01",
      location: "Phase 11, Mohali", 
      hospital: "City Care",
      resolution: "Closed - Accidental",
      age: "48",
      gender: "Female",
      reportedBy: "Dr. Sunita",
      finalNote: "Investigation concluded it was a genuine accidental fall. No foul play suspected. Victim family satisfied with inquiry.",
      image: "https://via.placeholder.com/150"
    },
    { 
      id: "MLC-20240982", 
      patient: "Rohan Mehra", 
      incidentType: "Assault", 
      closedBy: "Officer Amit Verma",
      closureDate: "2025-03-04",
      location: "Tdi City, Mohali", 
      hospital: "Fortis IT",
      resolution: "Solved - Arrest Made",
      age: "22",
      gender: "Male",
      reportedBy: "Dr. Mike",
      finalNote: "CCTV footage identified the attacker. Accused in custody. Case transferred to District Court.",
      image: "https://via.placeholder.com/150"
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
        <StatMini label="Total Resolved Cases" value="482" color="text-emerald-600" />
        <StatMini label="Solved this Month" value="24" color="text-blue-600" />
        <StatMini label="Avg. Resolution Time" value="4.2 Days" color="text-slate-600" />
      </div>

      {/* --- TABLE CONTAINER --- */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        
        {/* Table Header / Toolbar */}
        <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-4 bg-white">
          <div>
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-3">
              <span className="p-2 bg-emerald-50 text-[#08B36A] rounded-lg"><FaHistory /></span>
              Closed MLC Archives
            </h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">History of resolved investigations</p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-3.5" />
              <input 
                type="text" 
                placeholder="Search History Records..." 
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#08B36A]/20 transition-all"
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
                <th className="px-6 py-4">Incident Type</th>
                <th className="px-6 py-4">Closed By</th>
                <th className="px-6 py-4">Closure Date</th>
                <th className="px-6 py-4 text-center">Outcome</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {historyCases.map((item) => (
                <tr 
                  key={item.id} 
                  onClick={() => handleOpenDetails(item)}
                  className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                >
                  <td className="px-6 py-5">
                    <span className="text-sm font-black text-slate-400">{item.id}</span>
                  </td>
                  
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-700">{item.patient}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{item.hospital}</span>
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <span className="text-xs font-bold text-slate-600">{item.incidentType}</span>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                        <FaUserTie size={12} className="text-slate-300"/>
                        <span className="text-sm font-bold text-slate-500">{item.closedBy}</span>
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-slate-400">
                      <FaCalendarCheck size={10} className="text-[#08B36A]" />
                      <span className="text-xs font-bold">{item.closureDate}</span>
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex items-center justify-center">
                      <span className="bg-emerald-50 text-[#08B36A] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-2">
                        <FaCheckCircle /> {item.resolution.split(' - ')[0]}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-50 bg-slate-50/30 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
          <span>Archived Records: {historyCases.length}</span>
          <div className="flex gap-2">
            <button className="px-4 py-1 border border-slate-200 rounded-lg bg-white">Previous Page</button>
            <button className="px-4 py-1 border border-slate-200 rounded-lg bg-white">Next Page</button>
          </div>
        </div>
      </div>

      {/* --- CASE HISTORY MODAL --- */}
      {isModalOpen && selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
            <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                
                {/* Modal Header */}
                <div className="p-8 border-b border-slate-50 flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-emerald-50 text-[#08B36A] rounded-2xl">
                            <FaClipboardCheck size={24} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-none">Archived Case: {selectedCase.id}</h3>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-[#08B36A] font-black text-[10px] uppercase tracking-widest px-2 py-0.5 bg-emerald-50 rounded">Investigation Resolved</span>
                                <span className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">• Closed on {selectedCase.closureDate}</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    
                    {/* Victim & Hospital Section */}
                    <div className="space-y-4">
                        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <FaUserInjured /> Victim Details
                        </h4>
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                            <p className="text-lg font-black text-slate-800">{selectedCase.patient}</p>
                            <p className="text-xs font-bold text-slate-500 mt-1">{selectedCase.incidentType} • Age: {selectedCase.age}</p>
                        </div>
                        <InfoItem label="Resolved By" value={selectedCase.closedBy} color="text-[#08B36A]" />
                        <InfoItem label="Incident Hospital" value={selectedCase.hospital} />
                    </div>

                    {/* Official Outcome Section */}
                    <div className="space-y-4">
                        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <FaShieldAlt /> Official Outcome
                        </h4>
                        <InfoItem label="Final Status" value={selectedCase.resolution} color="text-emerald-600" />
                        <InfoItem label="Occurrence Area" value={selectedCase.location} />
                        <InfoItem label="Reporting Doctor" value={selectedCase.reportedBy} />
                    </div>

                    {/* Final Case Summary (Full Width) */}
                    <div className="md:col-span-2 space-y-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase ml-1">Investigation Final Summary</p>
                        <div className="bg-emerald-50/30 border border-emerald-100 p-6 rounded-2xl">
                            <p className="text-sm font-bold text-slate-600 leading-relaxed italic">
                                "{selectedCase.finalNote}"
                            </p>
                        </div>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="p-8 bg-slate-50 flex justify-between gap-3">
                    <button className="bg-white border-2 border-slate-200 text-slate-600 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-slate-100">
                        <FaPrint /> Print Official Report
                    </button>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => setIsModalOpen(false)}
                            className="bg-slate-800 text-white px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest"
                        >
                            Close Record
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