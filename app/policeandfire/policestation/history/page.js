'use client'
import React, { useState, cloneElement } from 'react'
import { 
  FaSearch, 
  FaEye, 
  FaClock, 
  FaMapMarkerAlt, 
  FaUserTie, 
  FaCheckCircle, 
  FaFilter, 
  FaFileExport, 
  FaTimes,
  FaShieldAlt,
  FaHistory,
  FaUserInjured,
  FaPrint,
  FaArchive,
  FaCalendarAlt
} from 'react-icons/fa'

export default function CaseHistoryPage() {
  const [selectedCase, setSelectedCase] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Demo History Data with Photos added
  const [historyCases] = useState([
    { 
      id: "PS-2025-0812", 
      image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop",
      victim: "Aman Preet Singh", 
      type: "Road Accident", 
      closedBy: "SI Rajesh Kumar", 
      location: "Sector 74", 
      closedDate: "24 Feb 2026",
      outcome: "Resolved - FIR Filed",
      summary: "Investigation concluded. Accused vehicle identified via CCTV. FIR #442 registered. Case moved to District Court.",
      hospital: "Radius Hospital"
    },
    { 
      id: "PS-2025-0744", 
      image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=150&auto=format&fit=crop",
      victim: "Sunita Rani", 
      type: "Theft", 
      closedBy: "Insp. Vikram Singh", 
      location: "Phase 11", 
      closedDate: "20 Feb 2026",
      outcome: "Recovered",
      summary: "Stolen jewelry recovered from a local pawn shop. Suspect in custody. Property handed back to the victim.",
      hospital: "N/A"
    },
    { 
      id: "PS-2025-0691", 
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop",
      victim: "Rohan Mehra", 
      type: "Physical Assault", 
      closedBy: "HC Rahul", 
      location: "Tdi City", 
      closedDate: "15 Feb 2026",
      outcome: "Transferred",
      summary: "Case involves cyber-bullying leading to assault. Transferred to Cyber Crime Cell for further technical investigation.",
      hospital: "City Care Center"
    }
  ]);

  const handleOpenDetails = (caseItem) => {
    setSelectedCase(caseItem);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Case History</h1>
          <p className="text-slate-500 font-medium text-sm">Access archived investigations and resolved reports</p>
        </div>
        <div className="flex gap-3">
            <button className="bg-white border border-slate-200 text-slate-600 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 shadow-sm hover:bg-slate-50 transition-all">
                <FaPrint /> Batch Print
            </button>
            <button className="bg-[#08B36A] text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-green-100 transition-all">
                <FaFileExport /> Export Archive
            </button>
        </div>
      </div>

      {/* --- TOP COMPACT STATS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CompactStatCard title="Total Resolved" count="482" label="Closed Cases" color="emerald" icon={<FaCheckCircle/>} />
        <CompactStatCard title="Solved Today" count="04" label="Latest Closures" color="blue" icon={<FaShieldAlt/>} />
        <CompactStatCard title="Archived" count="1.2k" label="Full History" color="slate" icon={<FaArchive/>} />
      </div>

      {/* --- TABLE SECTION --- */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        
        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4 bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-50 rounded-xl text-slate-400 shadow-inner"><FaHistory /></div>
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Closed Case Registry</h2>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-3.5" />
              <input 
                type="text" 
                placeholder="Search history by name or ID..." 
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#08B36A]/20 transition-all"
              />
            </div>
            <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-colors">
              <FaFilter size={14} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.15em] border-y border-slate-50">
                <th className="px-8 py-4">Photo</th>
                <th className="px-6 py-4">Case ID</th>
                <th className="px-6 py-4">Victim / Incident</th>
                <th className="px-6 py-4">Handled By</th>
                <th className="px-6 py-4">Closed On</th>
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
                  <td className="px-8 py-5">
                    <img 
                      src={item.image} 
                      alt="Victim" 
                      className="w-10 h-10 rounded-lg object-cover border border-slate-100 shadow-sm"
                    />
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm font-black text-slate-400 group-hover:text-blue-600 transition-colors">{item.id}</span>
                  </td>
                  
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-700">{item.victim}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{item.type} • {item.location}</span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                        <FaUserTie size={12} className="text-slate-300" />
                        <span className="text-sm font-bold text-slate-600">{item.closedBy}</span>
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-slate-400">
                      <FaCalendarAlt size={10} className="text-[#08B36A]" />
                      <span className="text-xs font-bold text-slate-500">{item.closedDate}</span>
                    </div>
                  </td>

                  <td className="px-6 py-5 text-center">
                    <div className="flex items-center justify-center gap-4">
                        <span className="px-3 py-1 bg-emerald-50 text-[#08B36A] text-[9px] font-black rounded-lg uppercase tracking-widest border border-emerald-100">
                            {item.outcome}
                        </span>
                        <button className="p-2 text-slate-300 hover:text-[#08B36A] transition-colors"><FaEye /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- HISTORY CASE MODAL --- */}
      {isModalOpen && selectedCase && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
            <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                
                {/* Modal Header */}
                <div className="p-8 border-b border-slate-50 flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-emerald-50 text-[#08B36A] rounded-2xl">
                            <FaCheckCircle size={24} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-none">Resolved Case: {selectedCase.id}</h3>
                            <p className="text-[#08B36A] font-bold text-[10px] uppercase tracking-[0.15em] mt-1 flex items-center gap-2">
                                <FaClock /> Investigation Closed on {selectedCase.closedDate}
                            </p>
                        </div>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 overflow-y-auto max-h-[60vh]">
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><FaUserInjured /> Victim Details</h4>
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex items-center gap-4">
                            <img 
                              src={selectedCase.image} 
                              alt="Victim" 
                              className="w-16 h-16 rounded-xl object-cover border-2 border-white shadow-md"
                            />
                            <div>
                                <p className="text-lg font-black text-slate-800">{selectedCase.victim}</p>
                                <p className="text-xs font-bold text-slate-500 mt-1">{selectedCase.type} Case • {selectedCase.location}</p>
                            </div>
                        </div>
                        <InfoItem label="Closing Officer" value={selectedCase.closedBy} color="text-[#08B36A]" />
                        <InfoItem label="Resolution Type" value={selectedCase.outcome} />
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><FaShieldAlt /> Registry Info</h4>
                        <InfoItem label="Reporting Hospital" value={selectedCase.hospital} />
                        <InfoItem label="Archive Status" value="Finalized & Digital Signed" color="text-blue-600" />
                        
                        <div className="pt-2">
                            <p className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-2">Final Investigation Note</p>
                            <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                                <p className="text-xs font-bold text-slate-600 leading-relaxed italic">"{selectedCase.summary}"</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="p-8 bg-slate-50 flex justify-between gap-3">
                    <button className="bg-white border-2 border-slate-200 text-slate-600 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-slate-100 transition-all">
                         <FaPrint /> Print Official Report
                    </button>
                    <div className="flex gap-3">
                        <button onClick={() => setIsModalOpen(false)} className="bg-slate-800 text-white px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest active:scale-95 transition-all">
                            Done
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

    </div>
  )
}

// --- HELPER COMPONENTS ---

function CompactStatCard({ title, count, label, color, icon }) {
    const themeMap = {
        emerald: { text: "text-emerald-600", bg: "bg-emerald-50" },
        blue: { text: "text-blue-600", bg: "bg-blue-50" },
        slate: { text: "text-slate-600", bg: "bg-slate-50" }
    };
    const theme = themeMap[color];

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300">
            <div className="relative z-10 flex items-center gap-5">
                <div className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center ${theme.bg} ${theme.text} border shadow-inner`}>
                    {cloneElement(icon, { size: 18 })}
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{title}</p>
                    <div className="flex items-baseline gap-2">
                        <h2 className={`text-4xl font-black tracking-tight ${theme.text}`}>{count}</h2>
                        <span className="text-[10px] font-bold text-slate-300 uppercase">{label}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function InfoItem({ label, value, color = "text-slate-700" }) {
    return (
        <div>
            <p className="text-[9px] font-black text-slate-400 uppercase ml-1 mb-1">{label}</p>
            <div className="bg-white border border-slate-100 px-4 py-2.5 rounded-xl">
                <p className={`text-sm font-bold ${color}`}>{value}</p>
            </div>
        </div>
    )
}