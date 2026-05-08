'use client'
import React, { useState, useEffect } from 'react'

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
  FaUserInjured,
  FaExclamationTriangle,
  FaBuilding
} from 'react-icons/fa'
import DeployStationModal from '../components/DeployStationModal';
import PoliceAPI from '@/app/services/PoliceAPI';

export default function FreshCasePoliceTable() {
  const [cases, setCases] = useState([]);
  const [filteredCases, setFilteredCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [selectedCase, setSelectedCase] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);

  // --- FETCH DATA ---
  const fetchCases = async () => {
    try {
      setLoading(true);
      const response = await PoliceAPI.getAllCases();
      if (response.success) {
        // We filter for 'Fresh' and 'Pending' as this is the Fresh Case Table
        const freshData = response.data.filter(c => c.status === 'Fresh' || c.status === 'Pending');
        setCases(freshData);
        setFilteredCases(freshData);
      }
    } catch (error) {
      console.error("Error fetching cases:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  // --- FILTER LOGIC ---
  useEffect(() => {
    const filtered = cases.filter(c => 
        c.caseNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.victimName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.incidentType.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredCases(filtered);
  }, [searchQuery, cases]);

  const handleOpenDetails = (caseItem) => {
    setSelectedCase(caseItem);
    setIsModalOpen(true);
  };

  const handleOpenDeploy = (e, caseItem) => {
    e.stopPropagation();
    setSelectedCase(caseItem);
    setIsDeployModalOpen(true);
  };

  // Helper to format Date
  const formatDateTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " | " + d.toLocaleDateString();
  };

  if (loading) return <div className="p-10 text-center font-black text-slate-400 animate-pulse">SYNCHRONIZING SECURE DATABASE...</div>

  return (
    <div className="space-y-6">
      
      {/* --- STATS SUMMARY (Dynamic) --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatMini label="Today's Fresh Cases" value={cases.length.toString().padStart(2, '0')} color="text-blue-600" />
        <StatMini label="Critical Severity" value={cases.filter(c => c.severity === 'Critical').length.toString().padStart(2, '0')} color="text-red-600" />
        <StatMini label="Pending Deployment" value={cases.filter(c => c.status === 'Pending').length.toString().padStart(2, '0')} color="text-orange-600" />
      </div>

      {/* --- TABLE CONTAINER --- */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        
        <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-4 bg-white">
          <div>
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-3">
              <span className="p-2 bg-green-50 rounded-lg text-[#08B36A]"><FaShieldAlt /></span>
              Active Incident Registry
            </h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">HQ Command Monitoring</p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-3.5" />
              <input 
                type="text" 
                placeholder="Search Case No or Victim..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.15em] border-y border-slate-50">
                <th className="px-6 py-4">Case Number</th>
                <th className="px-6 py-4">Victim Information</th>
                <th className="px-6 py-4">Incident Type</th>
                <th className="px-6 py-4">Time & Location</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredCases.map((item) => (
                <tr 
                  key={item._id} 
                  onClick={() => handleOpenDetails(item)}
                  className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                >
                  <td className="px-6 py-5">
                    <span className="text-sm font-black text-blue-600 hover:underline">{item.caseNo}</span>
                  </td>
                  
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-700">{item.victimName}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{item.victimPhone}</span>
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1">
                        <span className={`w-fit px-3 py-1 ${item.severity === 'Critical' ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-500'} text-[10px] font-black rounded-lg uppercase tracking-wider`}>
                        {item.incidentType}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase ml-1">{item.severityLevel}</span>
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1 text-slate-500">
                      <div className="flex items-center gap-2 text-xs font-bold">
                        <FaClock size={10} className="text-[#08B36A]" /> {formatDateTime(item.reportedAt)}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-medium truncate max-w-[200px]">
                        <FaMapMarkerAlt size={10} className="text-slate-300" /> {item.address}
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={(e) => handleOpenDeploy(e, item)}
                        className="bg-[#08B36A] text-white px-4 py-2 rounded-xl text-[11px] font-black flex items-center gap-2 shadow-lg shadow-green-100 hover:bg-[#07a25f] transition-all"
                      >
                        <FaUserShield size={12} /> DEPLOY
                      </button>
                      <button 
                        className="bg-white border border-slate-200 text-slate-500 px-3 py-2 rounded-xl text-[11px] font-black hover:border-slate-800 hover:text-slate-800 transition-all"
                      >
                        <FaEye />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-50 bg-slate-50/30 flex justify-between items-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Database Record Count: {filteredCases.length}</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 text-[10px] font-black text-slate-500 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 transition-colors">Prev</button>
            <button className="px-3 py-1 text-[10px] font-black text-slate-500 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 transition-colors">Next</button>
          </div>
        </div>
      </div>

      {/* --- CASE DETAILS MODAL --- */}
      {isModalOpen && selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
            <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-8 border-b border-slate-50 flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <div className={`p-4 ${selectedCase.severity === 'Critical' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'} rounded-2xl shadow-inner`}>
                            <FaShieldAlt size={24} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Case: {selectedCase.caseNo}</h3>
                            <p className={`${selectedCase.severity === 'Critical' ? 'text-red-500' : 'text-blue-500'} font-bold text-[10px] uppercase tracking-[0.15em] mt-1 flex items-center gap-2`}>
                                <FaExclamationTriangle /> Severity Level: {selectedCase.severity}
                            </p>
                        </div>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                        <FaTimes size={20} />
                    </button>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <FaUserInjured /> Victim Details
                        </h4>
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                            <p className="text-lg font-black text-slate-800">{selectedCase.victimName}</p>
                            <p className="text-xs font-bold text-slate-500 mt-1">Contact: {selectedCase.victimPhone}</p>
                        </div>
                        <InfoItem label="Incident Type" value={selectedCase.incidentType} color="text-red-500" />
                        <InfoItem label="Reported At" value={formatDateTime(selectedCase.reportedAt)} />
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <FaBuilding /> Dispatch Status
                        </h4>
                        <InfoItem label="Assigned Station" value={selectedCase.stationId?.stationName || "Pending Assignment"} />
                        <InfoItem label="SHO Name" value={selectedCase.stationId?.shoName || "N/A"} />
                        <InfoItem label="Incident Address" value={selectedCase.address} />
                        <InfoItem label="Current Status" value={selectedCase.severityStatus} />
                    </div>
                </div>
                <div className="p-8 bg-slate-50 flex justify-end gap-3">
                    <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-slate-500 font-black text-[11px] uppercase tracking-widest hover:text-slate-800">Close</button>
                    <button onClick={() => { setIsModalOpen(false); setIsDeployModalOpen(true); }} className="bg-[#08B36A] text-white px-8 py-3 rounded-2xl text-[11px] font-black shadow-xl shadow-green-100 uppercase tracking-widest">Update Dispatch</button>
                </div>
            </div>
        </div>
      )}

      {/* --- DEPLOY MODAL --- */}
      <DeployStationModal 
        isOpen={isDeployModalOpen}
        onClose={() => setIsDeployModalOpen(false)}
        selectedCase={selectedCase}
        refreshData={fetchCases}
      />

    </div>
  )
}

// --- HELPER COMPONENTS ---

function StatMini({ label, value, color }) {
  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-xl font-black ${color}`}>{value}</p>
    </div>
  )
}

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