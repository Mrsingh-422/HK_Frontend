'use client'
import React, { useState, cloneElement } from 'react'
import { 
  FaSearch, 
  FaEye, 
  FaClock, 
  FaMapMarkerAlt, 
  FaTruck, 
  FaFilter, 
  FaFileExport, 
  FaTimes,
  FaExclamationCircle,
  FaFireExtinguisher,
  FaUsers,
  FaWater,
  FaHistory,
  FaChartLine
} from 'react-icons/fa'

export default function OngoingOperationsPage() {
  const [selectedOp, setSelectedOp] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Demo Ongoing Operations Data
  const [operations] = useState([
    { 
      id: "OP-2026-9901", 
      type: "Structural Fire", 
      loc: "Sector 22 Market", 
      onSiteSince: "45 mins", 
      stage: "70% Contained",
      severity: "High",
      crew: "12 Marshals",
      engines: "Engine 4, Tanker 2",
      waterUsed: "12,000 Liters",
      summary: "Primary fire suppressed. Teams are now entering the second floor for cooling operations and checking for hidden embers.",
      commander: "Capt. Sharma"
    },
    { 
      id: "OP-2026-9905", 
      type: "Victim Extraction", 
      loc: "Tdi City North", 
      onSiteSince: "12 mins", 
      stage: "Hydraulic Cutting",
      severity: "Critical",
      crew: "6 Marshals",
      engines: "Rescue Van 1",
      waterUsed: "N/A",
      summary: "Road accident rescue. One passenger trapped in rear seat. Hydraulic cutters deployed. Ambulance on standby.",
      commander: "Lt. Verma"
    },
    { 
      id: "OP-2026-9882", 
      type: "Forest Boundary", 
      loc: "Phase 7 Green Belt", 
      onSiteSince: "3 Hours", 
      stage: "Monitoring",
      severity: "Medium",
      crew: "4 Marshals",
      engines: "Tanker 5",
      waterUsed: "45,000 Liters",
      summary: "Controlled burn area. Wind direction is stable. Team maintaining a 50m perimeter to prevent spread to residential zones.",
      commander: "Sgt. Khan"
    }
  ]);

  const handleOpenDetails = (item) => {
    setSelectedOp(item);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Ongoing Operations</h1>
          <p className="text-slate-500 font-medium text-sm">Monitoring live rescue missions and resource allocation</p>
        </div>
        <div className="flex gap-3">
            <button className="bg-white border border-slate-200 text-slate-600 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 shadow-sm hover:bg-slate-50 transition-all">
                <FaChartLine /> Tactical View
            </button>
            <button className="bg-[#08B36A] text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-green-100">
                <FaFileExport /> Export Active Ops
            </button>
        </div>
      </div>

      {/* --- TOP COMPACT STATS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CompactStatCard title="Active Missions" count="03" label="On-Field Now" color="orange" icon={<FaFireExtinguisher/>} />
        <CompactStatCard title="Engines Deployed" count="04" label="Heavy Units" color="blue" icon={<FaTruck/>} />
        <CompactStatCard title="Marshals On-Site" count="22" label="Force Active" color="emerald" icon={<FaUsers/>} />
      </div>

      {/* --- TABLE SECTION --- */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        
        {/* Table Toolbar */}
        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4 bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-green-50 rounded-xl text-[#08B36A] shadow-inner"><FaTruck /></div>
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Active Deployment List</h2>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-3.5" />
              <input 
                type="text" 
                placeholder="Search Operation ID..." 
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#08B36A]/20 transition-all"
              />
            </div>
            <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-colors"><FaFilter size={14}/></button>
          </div>
        </div>

        {/* The Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.15em] border-y border-slate-50">
                <th className="px-8 py-4">Op ID</th>
                <th className="px-6 py-4">Incident Type</th>
                <th className="px-6 py-4">Assigned Units</th>
                <th className="px-6 py-4">Deployment Time</th>
                <th className="px-6 py-4 text-center">Stage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {operations.map((item) => (
                <tr 
                  key={item.id} 
                  onClick={() => handleOpenDetails(item)}
                  className="hover:bg-slate-50/50 transition-all group cursor-pointer"
                >
                  <td className="px-8 py-5">
                    <span className="text-sm font-black text-[#08B36A]">{item.id}</span>
                  </td>
                  
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-700">{item.type}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase mt-0.5 flex items-center gap-1"><FaMapMarkerAlt size={8}/> {item.loc}</span>
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-slate-100 rounded-md text-slate-400 group-hover:text-blue-500 transition-colors"><FaTruck size={12}/></div>
                        <span className="text-sm font-bold text-slate-600">{item.engines}</span>
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-slate-400">
                      <FaClock size={10} className="text-orange-400" />
                      <span className="text-xs font-bold">{item.onSiteSince}</span>
                    </div>
                  </td>

                  <td className="px-6 py-5 text-center">
                    <div className="flex items-center justify-center gap-3">
                        <span className="px-3 py-1 bg-orange-50 text-orange-600 text-[9px] font-black rounded-lg uppercase tracking-widest border border-orange-100">
                            {item.stage}
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

      {/* --- OPERATION DETAIL MODAL --- */}
      {isModalOpen && selectedOp && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
            <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                
                <div className="p-8 border-b border-slate-50 flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-orange-50 text-orange-500 rounded-2xl shadow-inner">
                            <FaClock size={24} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-none">Operation Brief: {selectedOp.id}</h3>
                            <p className="text-[#08B36A] font-bold text-[10px] uppercase tracking-[0.15em] mt-2 flex items-center gap-2">
                                <FaUsers /> Commanding Officer: {selectedOp.commander}
                            </p>
                        </div>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><FaTimes size={20} /></button>
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 overflow-y-auto max-h-[60vh]">
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><FaExclamationCircle /> Field Metrics</h4>
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                            <p className="text-lg font-black text-slate-800">{selectedOp.type}</p>
                            <p className="text-xs font-bold text-slate-500 mt-1">{selectedOp.loc}</p>
                        </div>
                        <InfoItem label="Marshals Deployed" value={selectedOp.crew} />
                        <InfoItem label="Time on Scene" value={selectedOp.onSiteSince} color="text-orange-600" />
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><FaWater /> Resource Tracking</h4>
                        <InfoItem label="Assigned Engines" value={selectedOp.engines} />
                        <InfoItem label="Water/Liters Used" value={selectedOp.waterUsed} color="text-blue-600" />
                        
                        <div className="pt-2">
                            <p className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-2">Live Status Report</p>
                            <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                                <p className="text-xs font-bold text-slate-600 leading-relaxed italic">"{selectedOp.summary}"</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-8 bg-slate-50 flex justify-between gap-3">
                    <button className="bg-white border-2 border-slate-200 text-slate-600 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                        <FaHistory /> Incident History
                    </button>
                    <div className="flex gap-3">
                        <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-slate-500 font-black text-[11px] uppercase tracking-widest">Close View</button>
                        <button className="bg-slate-800 text-white px-8 py-3 rounded-2xl text-[11px] font-black shadow-xl uppercase tracking-widest active:scale-95 transition-all">Update Strategy</button>
                    </div>
                </div>
            </div>
        </div>
      )}

    </div>
  )
}

// --- REUSABLE COMPONENTS ---

function CompactStatCard({ title, count, label, color, icon }) {
    const themeMap = {
        orange: { text: "text-orange-600", bg: "bg-orange-50" },
        emerald: { text: "text-[#08B36A]", bg: "bg-green-50" },
        blue: { text: "text-blue-600", bg: "bg-blue-50" }
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