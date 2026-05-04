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
  FaHistory,
  FaFire,
  FaFilePdf,
  FaArchive,
  FaChartBar,
  FaCalendarAlt
} from 'react-icons/fa'

export default function IncidentHistoryPage() {
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Demo History Data
  const [historyData] = useState([
    { 
      id: "FR-HIST-2025-102", 
      type: "Structural Fire", 
      loc: "Sector 22 Market", 
      date: "12 Mar 2026",
      marshall: "Capt. Sharma",
      outcome: "Suppressed",
      waterUsed: "25,000 Liters",
      casualties: "Zero",
      propertySaved: "Est. ₹45 Lakhs",
      summary: "Electrical short circuit in a warehouse. Three engines deployed. Fire contained within 45 minutes. No structural collapse reported."
    },
    { 
      id: "FR-HIST-2025-098", 
      type: "Car Extraction", 
      loc: "Highway Exit 4", 
      date: "10 Mar 2026",
      marshall: "Lt. Verma",
      outcome: "Rescue Success",
      waterUsed: "N/A",
      casualties: "2 Rescued",
      propertySaved: "N/A",
      summary: "Two-vehicle collision. Hydraulic cutters used to free driver. Patients stabilized and handed over to ambulance crew."
    },
    { 
      id: "FR-HIST-2025-085", 
      type: "False Alarm", 
      loc: "Tdi City North", 
      date: "05 Mar 2026",
      marshall: "Sgt. Khan",
      outcome: "Cleared",
      waterUsed: "0 Liters",
      casualties: "Zero",
      propertySaved: "N/A",
      summary: "Automated smoke detector triggered by heavy dust during renovation. System reset and building cleared after inspection."
    }
  ]);

  const handleOpenDetails = (item) => {
    setSelectedIncident(item);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Incident History</h1>
          <p className="text-slate-500 font-medium text-sm">Registry of resolved emergencies and operational logs</p>
        </div>
        <div className="flex gap-3">
            <button className="bg-white border border-slate-200 text-slate-600 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 shadow-sm hover:bg-slate-50 transition-all">
                <FaFilePdf /> Batch PDF
            </button>
            <button className="bg-[#08B36A] text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-green-100">
                <FaFileExport /> Export Archive
            </button>
        </div>
      </div>

      {/* --- TOP COMPACT STATS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CompactStatCard title="Total Resolved" count="128" label="Historical Logs" color="emerald" icon={<FaCheckCircle/>} />
        <CompactStatCard title="Water Saved" count="1.2M" label="Liters Total" color="blue" icon={<FaArchive/>} />
        <CompactStatCard title="Success Rate" count="98%" label="Safe Missions" color="orange" icon={<FaChartBar/>} />
      </div>

      {/* --- TABLE SECTION --- */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        
        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4 bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-50 rounded-xl text-slate-400 shadow-inner"><FaHistory /></div>
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Closed Logs</h2>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-3.5" />
              <input 
                type="text" 
                placeholder="Search by Case ID or Date..." 
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#08B36A]/20 transition-all"
              />
            </div>
            <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-colors"><FaFilter size={14}/></button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.15em] border-y border-slate-50">
                <th className="px-8 py-4">Incident Log ID</th>
                <th className="px-6 py-4">Type / Location</th>
                <th className="px-6 py-4">Marshall in Charge</th>
                <th className="px-6 py-4">Closure Date</th>
                <th className="px-6 py-4 text-center">Outcome</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {historyData.map((item) => (
                <tr 
                  key={item.id} 
                  onClick={() => handleOpenDetails(item)}
                  className="hover:bg-slate-50/50 transition-all group cursor-pointer"
                >
                  <td className="px-8 py-5">
                    <span className="text-sm font-black text-slate-400 group-hover:text-[#08B36A] transition-colors">{item.id}</span>
                  </td>
                  
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-700">{item.type}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase mt-0.5 flex items-center gap-1"><FaMapMarkerAlt size={8}/> {item.loc}</span>
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-slate-100 rounded-md text-slate-400"><FaUserTie size={12}/></div>
                        <span className="text-sm font-bold text-slate-600">{item.marshall}</span>
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-slate-400">
                      <FaCalendarAlt size={10} className="text-[#08B36A]" />
                      <span className="text-xs font-bold">{item.date}</span>
                    </div>
                  </td>

                  <td className="px-6 py-5 text-center">
                    <div className="flex items-center justify-center gap-3">
                        <span className="px-3 py-1 bg-emerald-50 text-[#08B36A] text-[9px] font-black rounded-lg uppercase tracking-widest border border-green-100">
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

      {/* --- INCIDENT HISTORY MODAL --- */}
      {isModalOpen && selectedIncident && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
            <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                
                <div className="p-8 border-b border-slate-50 flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-emerald-50 text-[#08B36A] rounded-2xl shadow-inner">
                            <FaArchive size={24} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-none">Archived Report: {selectedIncident.id}</h3>
                            <p className="text-[#08B36A] font-bold text-[10px] uppercase tracking-[0.15em] mt-2 flex items-center gap-2">
                                <FaCheckCircle /> Mission Finalized on {selectedIncident.date}
                            </p>
                        </div>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><FaTimes size={20} /></button>
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 overflow-y-auto max-h-[60vh]">
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><FaFire /> Incident Data</h4>
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                            <p className="text-lg font-black text-slate-800">{selectedIncident.type}</p>
                            <p className="text-xs font-bold text-slate-500 mt-1">{selectedIncident.loc}</p>
                        </div>
                        <InfoItem label="Lead Marshall" value={selectedIncident.marshall} />
                        <InfoItem label="Water Consumed" value={selectedIncident.waterUsed} color="text-blue-600" />
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><FaChartBar /> Impact Analysis</h4>
                        <InfoItem label="Human Impact" value={selectedIncident.casualties} />
                        <InfoItem label="Property Value Saved" value={selectedIncident.propertySaved} color="text-emerald-600" />
                        
                        <div className="pt-2">
                            <p className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-2">Commanders Final Note</p>
                            <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                                <p className="text-xs font-bold text-slate-600 leading-relaxed italic">"{selectedIncident.summary}"</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-8 bg-slate-50 flex justify-between gap-3">
                    <button className="bg-white border-2 border-slate-200 text-slate-600 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-slate-100 transition-all">
                        <FaFilePdf /> Download Official Report
                    </button>
                    <div className="flex gap-3">
                        <button onClick={() => setIsModalOpen(false)} className="bg-slate-800 text-white px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest active:scale-95 transition-all">
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

// --- REUSABLE STAT CARD ---
function CompactStatCard({ title, count, label, color, icon }) {
    const themeMap = {
        emerald: { text: "text-[#08B36A]", bg: "bg-green-50" },
        orange: { text: "text-orange-600", bg: "bg-orange-50" },
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