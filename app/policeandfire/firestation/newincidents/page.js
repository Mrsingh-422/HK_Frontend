'use client'
import React, { useState, cloneElement } from 'react'
import { 
  FaSearch, 
  FaEye, 
  FaFire, 
  FaMapMarkerAlt, 
  FaClock, 
  FaTruck, 
  FaFilter, 
  FaFileExport, 
  FaTimes,
  FaPhoneAlt,
  FaExclamationTriangle,
  FaCheckCircle,
  FaBroadcastTower,
  FaBuilding,
  FaUserAlt
} from 'react-icons/fa'

export default function NewIncidentsPage() {
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDispatchOpen, setIsDispatchOpen] = useState(false);

  // Demo Data for Dispatch Units
  const fireUnits = [
    { id: "ENG-04", name: "Engine 4 (Ladder)", status: "Available", location: "Station Yard" },
    { id: "TNK-02", name: "Tanker 2 (Water)", status: "Available", location: "Sector 74" },
    { id: "RSQ-01", name: "Rescue Van 1", status: "Maintenance", location: "Workshop" },
  ];

  // Demo New Incident Data
  const [incidents] = useState([
    { 
      id: "FR-2026-001", 
      type: "Structural Fire", 
      loc: "Sector 22 Market", 
      time: "2 mins ago", 
      severity: "Critical",
      caller: "Rohan Gupta",
      phone: "98765-43210",
      details: "Kitchen fire in a commercial restaurant. Spreading to the exhaust duct.",
      hydrantAccess: "Available - 50m",
      buildingType: "Commercial - G+2"
    },
    { 
      id: "FR-2026-004", 
      type: "Gas Leak", 
      loc: "Tdi City Block C", 
      time: "15 mins ago", 
      severity: "High",
      caller: "Security Desk",
      phone: "0172-225544",
      details: "Strong smell of LPG in the basement parking area. Evacuation started.",
      hydrantAccess: "Internal System",
      buildingType: "Residential Apartment"
    },
    { 
      id: "FR-2026-009", 
      type: "Elevator Rescue", 
      loc: "Global Tech Park", 
      time: "45 mins ago", 
      severity: "Medium",
      caller: "Admin Dept",
      phone: "88722-11000",
      details: "4 people stuck between 4th and 5th floors. Power failure reported.",
      hydrantAccess: "N/A",
      buildingType: "Office Complex"
    }
  ]);

  const handleOpenDetail = (item) => {
    setSelectedIncident(item);
    setIsDetailOpen(true);
  };

  const handleOpenDispatch = (e, item) => {
    e.stopPropagation();
    setSelectedIncident(item);
    setIsDispatchOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">New Incident Registry</h1>
          <p className="text-slate-500 font-medium text-sm">Real-time emergency dispatch and response monitoring</p>
        </div>
        <div className="flex gap-3">
            <button className="bg-white border border-slate-200 text-slate-600 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 shadow-sm">
                <FaFileExport /> Export Logs
            </button>
        </div>
      </div>

      {/* --- TOP COMPACT STATS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CompactStatCard title="Active Alarms" count="03" label="New Dispatches" color="emerald" icon={<FaFire/>} />
        <CompactStatCard title="Critical" count="01" label="Immediate Action" color="red" icon={<FaExclamationTriangle/>} />
        <CompactStatCard title="Units Ready" count="05" label="Available Engines" color="blue" icon={<FaTruck/>} />
      </div>

      {/* --- TABLE SECTION --- */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        
        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4 bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-green-50 rounded-xl text-[#08B36A] shadow-inner"><FaBroadcastTower /></div>
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Incoming Alarms</h2>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-3.5" />
              <input 
                type="text" 
                placeholder="Search Incident ID or Location..." 
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
                <th className="px-8 py-4">Incident ID</th>
                <th className="px-6 py-4">Call Details</th>
                <th className="px-6 py-4">Severity</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {incidents.map((item) => (
                <tr 
                  key={item.id} 
                  onClick={() => handleOpenDetail(item)}
                  className="hover:bg-slate-50/50 transition-all group cursor-pointer"
                >
                  <td className="px-8 py-5">
                    <span className="text-sm font-black text-red-600 animate-pulse">{item.id}</span>
                  </td>
                  
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-700">{item.type}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase mt-0.5 flex items-center gap-1"><FaClock size={8}/> {item.time}</span>
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        item.severity === 'Critical' ? 'bg-red-50 text-red-500' : 
                        item.severity === 'High' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                        {item.severity}
                    </span>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-slate-500">
                      <FaMapMarkerAlt size={10} className="text-[#08B36A]" />
                      <span className="text-xs font-bold">{item.loc}</span>
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={(e) => handleOpenDispatch(e, item)}
                          className="bg-[#08B36A] text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 shadow-lg shadow-green-100 hover:bg-[#07a25f] transition-all"
                        >
                            <FaTruck size={12}/> Dispatch
                        </button>
                        <button className="bg-white border-2 border-slate-100 text-slate-500 hover:text-[#08B36A] px-3 py-2 rounded-xl text-[10px] transition-all">
                            <FaEye />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- INCIDENT DETAIL MODAL --- */}
      {isDetailOpen && selectedIncident && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsDetailOpen(false)}></div>
            <div className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-8 border-b border-slate-50 flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-red-50 text-red-500 rounded-2xl shadow-inner">
                            <FaFire size={24} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-none">Emergency: {selectedIncident.id}</h3>
                            <p className="text-red-500 font-bold text-[10px] uppercase tracking-[0.15em] mt-2 flex items-center gap-2">
                                <FaExclamationTriangle /> Immediate Response Required
                            </p>
                        </div>
                    </div>
                    <button onClick={() => setIsDetailOpen(false)} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><FaTimes size={20} /></button>
                </div>
                
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 overflow-y-auto max-h-[60vh]">
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><FaPhoneAlt /> Caller Info</h4>
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                            <p className="text-lg font-black text-slate-800">{selectedIncident.caller}</p>
                            <p className="text-xs font-bold text-[#08B36A] mt-1">{selectedIncident.phone}</p>
                        </div>
                        <InfoItem label="Incident Type" value={selectedIncident.type} />
                        <InfoItem label="Reported Time" value={selectedIncident.time} />
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><FaBuilding /> Property Info</h4>
                        <InfoItem label="Building Type" value={selectedIncident.buildingType} />
                        <InfoItem label="Hydrant Access" value={selectedIncident.hydrantAccess} color="text-blue-600" />
                        
                        <div className="pt-2">
                            <p className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-2">Situation Brief</p>
                            <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                                <p className="text-xs font-bold text-slate-600 leading-relaxed italic">"{selectedIncident.details}"</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-8 bg-slate-50 flex justify-end gap-3">
                    <button onClick={() => setIsDetailOpen(false)} className="px-6 py-3 text-slate-500 font-black text-[11px] uppercase tracking-widest">Hold Alarm</button>
                    <button onClick={() => { setIsDetailOpen(false); setIsDispatchOpen(true); }} className="bg-[#08B36A] text-white px-8 py-3 rounded-2xl text-[11px] font-black shadow-xl shadow-green-100 uppercase tracking-widest active:scale-95 transition-all">Assign Force</button>
                </div>
            </div>
        </div>
      )}

      {/* --- DISPATCH MODAL --- */}
      {isDispatchOpen && selectedIncident && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsDispatchOpen(false)}></div>
            <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                    <h3 className="text-lg font-black text-slate-800 uppercase">Unit Dispatch Hub</h3>
                    <button onClick={() => setIsDispatchOpen(false)} className="text-slate-300 hover:text-red-500 transition-colors"><FaTimes size={18} /></button>
                </div>
                <div className="p-6 space-y-4">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Select Available Engines</p>
                    <div className="space-y-2">
                        {fireUnits.map(unit => (
                            <div key={unit.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:border-[#08B36A] cursor-pointer group transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-[#08B36A] transition-colors shadow-sm"><FaTruck /></div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">{unit.name}</p>
                                        <p className="text-[10px] font-bold text-slate-400">{unit.id} • {unit.location}</p>
                                    </div>
                                </div>
                                <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-md ${unit.status === 'Available' ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-500'}`}>{unit.status}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="p-6 bg-slate-50 flex gap-3">
                    <button onClick={() => setIsDispatchOpen(false)} className="flex-1 bg-white border border-slate-200 py-3 rounded-xl font-black text-[10px] text-slate-500 uppercase">Cancel</button>
                    <button onClick={() => setIsDispatchOpen(false)} className="flex-1 bg-[#08B36A] py-3 rounded-xl font-black text-[10px] text-white shadow-lg shadow-green-100 uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95"><FaCheckCircle /> Confirm Dispatch</button>
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
        emerald: { text: "text-[#08B36A]", bg: "bg-green-50", border: "border-green-100" },
        red: { text: "text-red-600", bg: "bg-red-50", border: "border-red-100" },
        blue: { text: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" }
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
    )
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