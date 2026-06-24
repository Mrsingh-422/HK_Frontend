'use client'
import React, { useState, useEffect, cloneElement } from 'react'
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
  FaCalendarAlt,
  FaExchangeAlt
} from 'react-icons/fa'
import PoliceAPI from '@/app/services/PoliceAPI' // Apna correct path dein

export default function CaseHistoryPage() {
  const [historyCases, setHistoryCases] = useState([]);
  const [filteredCases, setFilteredCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({ total: 0, closed: 0, archived: 0 });

  const [selectedCase, setSelectedCase] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchHistoryData();
  }, []);

  const fetchHistoryData = async () => {
    setLoading(true);
    try {
      // Yahan Station ki history API call ho rahi hai
      const response = await PoliceAPI.fetchHistoryData(); 
      if (response.success && response.data) {
        setHistoryCases(response.data);
        setFilteredCases(response.data);

        // Calculate Stats
        const closedCount = response.data.filter(c => c.status === 'Closed').length;
        const archivedCount = response.data.filter(c => c.status === 'Archived').length;
        setStats({
            total: response.data.length,
            closed: closedCount,
            archived: archivedCount
        });
      }
    } catch (error) {
      console.error("Error fetching history cases:", error);
    } finally {
      setLoading(false);
    }
  };

  // Search Logic
  useEffect(() => {
    if (searchQuery.trim() === "") {
        setFilteredCases(historyCases);
    } else {
        const query = searchQuery.toLowerCase();
        const filtered = historyCases.filter(c => 
            c.caseNo.toLowerCase().includes(query) ||
            (c.victimName && c.victimName.toLowerCase().includes(query)) ||
            c.incidentType.toLowerCase().includes(query)
        );
        setFilteredCases(filtered);
    }
  }, [searchQuery, historyCases]);

  const handleOpenDetails = (caseItem) => {
    setSelectedCase(caseItem);
    setIsModalOpen(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Dynamic Badge for Outcome
  const getOutcomeBadge = (status, severityStatus) => {
    if (status === 'Closed') {
        return (
            <span className="px-3 py-1 bg-emerald-50 text-[#08B36A] text-[9px] font-black rounded-lg uppercase tracking-widest border border-emerald-100 flex items-center gap-1 w-fit mx-auto">
                <FaCheckCircle size={10} /> {severityStatus || "Resolved"}
            </span>
        );
    }
    if (status === 'Archived') {
        return (
            <span className="px-3 py-1 bg-slate-50 text-slate-500 text-[9px] font-black rounded-lg uppercase tracking-widest border border-slate-200 flex items-center gap-1 w-fit mx-auto">
                <FaArchive size={10} /> Archived
            </span>
        );
    }
    return null;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 font-sans">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Case History</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">Access archived investigations and resolved reports</p>
        </div>
        <div className="flex gap-3">
            <button className="bg-white border border-slate-200 text-slate-600 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 shadow-sm hover:bg-slate-50 transition-all">
                <FaPrint /> Batch Print
            </button>
            <button className="bg-[#08B36A] hover:bg-[#07a25f] text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-green-100 transition-all">
                <FaFileExport /> Export Archive
            </button>
        </div>
      </div>

      {/* --- TOP COMPACT STATS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CompactStatCard title="Total Processed" count={stats.total} label="All Time Records" color="slate" icon={<FaHistory/>} />
        <CompactStatCard title="Total Resolved" count={stats.closed} label="Successfully Closed" color="emerald" icon={<FaCheckCircle/>} />
        <CompactStatCard title="Transferred/Archived" count={stats.archived} label="Stored Evidence" color="blue" icon={<FaArchive/>} />
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-[#08B36A]/20 transition-all"
              />
            </div>
            <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-colors">
              <FaFilter size={14} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
             <div className="p-16 flex flex-col items-center justify-center">
                <div className="w-10 h-10 border-4 border-slate-200 border-t-[#08B36A] rounded-full animate-spin mb-4"></div>
                <p className="text-slate-400 font-bold tracking-wide">Fetching Archive Data...</p>
             </div>
          ) : filteredCases.length === 0 ? (
             <div className="p-16 text-center text-slate-400 font-bold uppercase tracking-widest text-sm">
                No History Records Found
             </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.15em] border-y border-slate-50">
                  <th className="px-8 py-4">Identity</th>
                  <th className="px-6 py-4">Case ID</th>
                  <th className="px-6 py-4">Victim / Incident</th>
                  <th className="px-6 py-4">Handled By</th>
                  <th className="px-6 py-4">Closed On</th>
                  <th className="px-6 py-4 text-center">Outcome</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredCases.map((item) => {
                  // Extract lead officer name safely
                  const leadOfficer = item.assignedStaff?.length > 0 
                                      ? item.assignedStaff[0].fullName 
                                      : "HQ / Direct";
                  
                  return (
                    <tr 
                      key={item._id} 
                      onClick={() => handleOpenDetails(item)}
                      className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                    >
                      <td className="px-8 py-5">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 font-black border border-slate-100 shadow-sm">
                          {item.victimName ? item.victimName.charAt(0).toUpperCase() : '?'}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm font-black text-slate-500 group-hover:text-blue-600 transition-colors">{item.caseNo}</span>
                      </td>
                      
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-700">{item.victimName || "Unknown"}</span>
                            <div className="flex items-center gap-1 mt-0.5 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                <span>{item.incidentType}</span>
                                <span className="text-slate-300">•</span>
                                <span className="truncate max-w-[150px]">{item.address}</span>
                            </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                            <FaUserTie size={12} className="text-slate-300" />
                            <span className="text-sm font-bold text-slate-600">{leadOfficer}</span>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-slate-400">
                          <FaCalendarAlt size={10} className={item.status === 'Closed' ? "text-[#08B36A]" : "text-slate-400"} />
                          <span className="text-xs font-bold text-slate-500">{formatDate(item.updatedAt)}</span>
                        </div>
                      </td>

                      <td className="px-6 py-5 text-center">
                        <div className="flex items-center justify-center gap-4">
                            {getOutcomeBadge(item.status, item.severityStatus)}
                            <button className="p-2 text-slate-300 hover:text-[#08B36A] transition-colors"><FaEye size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
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
                        <div className={`p-4 rounded-2xl ${selectedCase.status === 'Closed' ? 'bg-emerald-50 text-[#08B36A]' : 'bg-slate-100 text-slate-500'}`}>
                            {selectedCase.status === 'Closed' ? <FaCheckCircle size={24} /> : <FaArchive size={24} />}
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-none">
                              {selectedCase.status === 'Closed' ? 'Resolved Case' : 'Archived Case'}: {selectedCase.caseNo}
                            </h3>
                            <p className={`${selectedCase.status === 'Closed' ? 'text-[#08B36A]' : 'text-slate-500'} font-bold text-[10px] uppercase tracking-[0.15em] mt-1 flex items-center gap-2`}>
                                <FaClock /> Investigation finalized on {formatDate(selectedCase.updatedAt)}
                            </p>
                        </div>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 overflow-y-auto max-h-[60vh] custom-scrollbar">
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><FaUserInjured /> Victim Details</h4>
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex items-center gap-4">
                            <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center text-slate-400 text-xl font-black shadow-sm border border-slate-100">
                              {selectedCase.victimName ? selectedCase.victimName.charAt(0).toUpperCase() : '?'}
                            </div>
                            <div>
                                <p className="text-lg font-black text-slate-800">{selectedCase.victimName || "Unknown"}</p>
                                <p className="text-xs font-bold text-slate-500 mt-1">{selectedCase.incidentType} Case</p>
                            </div>
                        </div>
                        <InfoItem 
                          label="Closing Officer" 
                          value={selectedCase.assignedStaff?.length > 0 ? selectedCase.assignedStaff[0].fullName : "HQ Staff"} 
                          color="text-[#08B36A]" 
                        />
                        <InfoItem label="Final Status / Outcome" value={selectedCase.severityStatus} />
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><FaShieldAlt /> Registry Info</h4>
                        <InfoItem label="Occurrence Location" value={selectedCase.address} />
                        <InfoItem label="Record Status" value="Finalized & Digital Signed" color="text-blue-600" />
                        
                        <div className="pt-2">
                            <p className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-2">Final Investigation Note</p>
                            <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                                <p className="text-xs font-bold text-slate-600 leading-relaxed italic">
                                  "{selectedCase.remarks || selectedCase.description || 'No final remarks provided.'}"
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="p-8 bg-slate-50 flex justify-between gap-3 border-t border-slate-100">
                    <button className="bg-white border-2 border-slate-200 text-slate-600 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-slate-100 transition-all">
                         <FaPrint /> Print Official Report
                    </button>
                    <div className="flex gap-3">
                        <button onClick={() => setIsModalOpen(false)} className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest active:scale-95 transition-all">
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

// --- HELPER COMPONENTS ---

function CompactStatCard({ title, count, label, color, icon }) {
    const themeMap = {
        emerald: { text: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
        blue: { text: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
        slate: { text: "text-slate-600", bg: "bg-slate-50", border: "border-slate-100" }
    };
    const theme = themeMap[color];

    return (
        <div className={`bg-white p-6 rounded-2xl border ${theme.border} shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300`}>
            <div className="relative z-10 flex items-center gap-5">
                <div className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center ${theme.bg} ${theme.text} border ${theme.border} shadow-inner`}>
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
            <div className="bg-white border border-slate-100 px-4 py-2.5 rounded-xl shadow-sm">
                <p className={`text-sm font-bold ${color} truncate`}>{value}</p>
            </div>
        </div>
    )
}