'use client'
import React, { useState, cloneElement } from 'react'
import { 
  FaSearch, 
  FaEye, 
  FaClock, 
  FaMapMarkerAlt, 
  FaUserTie, 
  FaExclamationCircle, 
  FaFilter, 
  FaFileExport, 
  FaTimes,
  FaFolderOpen,
  FaShieldAlt,
  FaHourglassHalf,
  FaEdit,
  FaUserInjured,
  FaUserShield 
} from 'react-icons/fa'

export default function PendingCasePage() {
  const [selectedCase, setSelectedCase] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Demo Pending Cases Data with Photo URLs
  const [pendingCases] = useState([
    { 
      id: "PS-2026-0138", 
      image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop",
      victim: "Sohan Lal", 
      type: "Property Dispute", 
      priority: "Medium", 
      assignedTo: "HC Rahul", 
      location: "Civil Lines", 
      ageing: "3 Days",
      status: "Awaiting Statements",
      summary: "Neighbor dispute over boundary wall. Primary witnesses are currently out of station. Statements scheduled for tomorrow.",
      lastUpdate: "Today, 09:30 AM",
      hospital: "N/A"
    },
    { 
      id: "PS-2026-0145", 
      image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=150&auto=format&fit=crop",
      victim: "Elena Gilbert", 
      type: "Theft", 
      priority: "High", 
      assignedTo: "SI Rajesh Kumar", 
      location: "Main Market", 
      ageing: "12 Hours",
      status: "CCTV Retrieval",
      summary: "Shops nearby have CCTV. Request for footage sent to Bank manager. Awaiting retrieval technician.",
      lastUpdate: "Today, 11:20 AM",
      hospital: "Radius Hospital"
    },
    { 
      id: "PS-2026-0092", 
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop",
      victim: "Anita Desai", 
      type: "Physical Assault", 
      priority: "Critical", 
      assignedTo: "Insp. Vikram Singh", 
      location: "Market Yard", 
      ageing: "5 Days",
      status: "Forensic Report",
      summary: "Medico-legal report received. Forensic team analyzing blood splatters from site. Report expected by Friday.",
      lastUpdate: "Yesterday, 04:45 PM",
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
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Active Investigations</h1>
          <p className="text-slate-500 font-medium text-sm">Monitoring cases under inquiry and verification</p>
        </div>
        <div className="flex gap-3">
            <button className="bg-white border border-slate-200 text-slate-600 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 shadow-sm hover:bg-slate-50 transition-all">
                <FaFileExport /> Export Active
            </button>
        </div>
      </div>

      {/* --- TOP COMPACT STATS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CompactStatCard title="Total Pending" count="28" label="Active Inquiry" color="orange" icon={<FaHourglassHalf/>} />
        <CompactStatCard title="Critical Task" count="05" label="High Priority" color="red" icon={<FaExclamationCircle/>} />
        <CompactStatCard title="Force Deployed" count="14" label="Field Officers" color="emerald" icon={<FaUserShield/>} />
      </div>

      {/* --- TABLE SECTION --- */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4 bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-50 rounded-xl text-orange-500 shadow-inner"><FaFolderOpen /></div>
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Inquiry Registry</h2>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-3.5" />
              <input 
                type="text" 
                placeholder="Search by ID..." 
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
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
                <th className="px-8 py-4">Victim Photo</th>
                <th className="px-6 py-4">Case ID</th>
                <th className="px-6 py-4">Victim Name</th>
                <th className="px-6 py-4">Officer In-Charge</th>
                <th className="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {pendingCases.map((item) => (
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
                    <span className="text-sm font-black text-blue-600 group-hover:underline">{item.id}</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-700">{item.victim}</span>
                        <span className="text-[11px] font-medium text-slate-400 uppercase">{item.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 group-hover:text-[#08B36A] transition-colors"><FaUserTie size={12} /></div>
                        <span className="text-sm font-bold text-slate-600">{item.assignedTo}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-center">
                        <button className="bg-white border-2 border-slate-100 text-[#08B36A] px-5 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 transition-all hover:border-[#08B36A]">
                            <FaEye /> View
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL --- */}
      {isModalOpen && selectedCase && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
            <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-8 border-b border-slate-50 flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-orange-50 text-orange-500 rounded-2xl shadow-inner">
                            <FaHourglassHalf size={24} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Case: {selectedCase.id}</h3>
                            <p className="text-orange-500 font-bold text-[10px] uppercase tracking-[0.15em] mt-1">Pending Since {selectedCase.ageing}</p>
                        </div>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                        <FaTimes size={20} />
                    </button>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[60vh] overflow-y-auto">
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
                                <p className="text-xs font-bold text-slate-500 mt-1">{selectedCase.type} • {selectedCase.location}</p>
                            </div>
                        </div>
                        <InfoItem label="Officer" value={selectedCase.assignedTo} />
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><FaShieldAlt /> Progress</h4>
                        <InfoItem label="Stage" value={selectedCase.status} color="text-orange-600" />
                        <div className="pt-2">
                            <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                                <p className="text-xs font-bold text-slate-600 leading-relaxed italic">"{selectedCase.summary}"</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="p-8 bg-slate-50 flex justify-end gap-3">
                    <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-slate-500 font-black text-[11px] uppercase tracking-widest">Close</button>
                    <button className="bg-[#08B36A] text-white px-8 py-3 rounded-2xl text-[11px] font-black shadow-xl shadow-green-100 uppercase tracking-widest flex items-center gap-2 active:scale-95 transition-all">
                        <FaEdit /> Update Logs
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  )
}

function CompactStatCard({ title, count, label, color, icon }) {
    const themeMap = {
        orange: { text: "text-orange-600", bg: "bg-orange-50" },
        red: { text: "text-red-600", bg: "bg-red-50" },
        emerald: { text: "text-emerald-600", bg: "bg-emerald-50" }
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