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
  FaBuilding,
  FaFolderOpen,
  FaExchangeAlt, // Added for Reassign icon
  FaCheckCircle
} from 'react-icons/fa'
import PoliceAPI from '@/app/services/PoliceAPI';

export default function FreshCasePoliceTable() {
  const [cases, setCases] = useState([]);
  const [filteredCases, setFilteredCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Tab State
  const [activeTab, setActiveTab] = useState("Fresh");
  const tabs = ['Fresh', 'Pending', 'Under Investigation', 'Critical', 'Closed', 'Archived'];
  
  const [selectedCase, setSelectedCase] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);

  // --- FETCH DATA ---
  const fetchCases = async () => {
    try {
      setLoading(true);
      const response = await PoliceAPI.getAllCases();
      if (response.success) {
        setCases(response.data);
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

  // --- FILTER LOGIC (Tab + Search) ---
  useEffect(() => {
    const filtered = cases.filter(c => {
        const matchesTab = c.status === activeTab;
        const matchesSearch = 
            c.caseNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (c.victimName && c.victimName.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (c.incidentType && c.incidentType.toLowerCase().includes(searchQuery.toLowerCase()));
        
        return matchesTab && matchesSearch;
    });
    setFilteredCases(filtered);
  }, [searchQuery, cases, activeTab]);

  const handleOpenDetails = (caseItem) => {
    setSelectedCase(caseItem);
    setIsModalOpen(true);
  };

  const handleOpenDeploy = (e, caseItem) => {
    e.stopPropagation();
    setSelectedCase(caseItem);
    setIsDeployModalOpen(true);
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " | " + d.toLocaleDateString();
  };

  if (loading) return <div className="p-10 text-center font-black text-slate-400 animate-pulse">SYNCHRONIZING SECURE DATABASE...</div>

  return (
    <div className="space-y-6">
      
      {/* --- STATS SUMMARY --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatMini label="Global Fresh Intake" value={cases.filter(c => c.status === 'Fresh').length.toString().padStart(2, '0')} color="text-blue-600" />
        <StatMini label="Critical Severity" value={cases.filter(c => c.severity === 'Critical').length.toString().padStart(2, '0')} color="text-red-600" />
        <StatMini label="Under Investigation" value={cases.filter(c => c.status === 'Under Investigation').length.toString().padStart(2, '0')} color="text-emerald-600" />
      </div>

      {/* --- NAVIGATION TABS --- */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-[1.5rem] border border-slate-100 shadow-sm overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              activeTab === tab 
                ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' 
                : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
            }`}
          >
            {tab}
            <span className={`ml-2 px-2 py-0.5 rounded-md text-[8px] ${activeTab === tab ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'}`}>
                {cases.filter(c => c.status === tab).length}
            </span>
          </button>
        ))}
      </div>

      {/* --- TABLE CONTAINER --- */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        
        <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-4 bg-white">
          <div>
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-3">
              <span className="p-2 bg-green-50 rounded-lg text-[#08B36A]"><FaShieldAlt /></span>
              {activeTab} Incident Registry
            </h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">HQ Command Monitoring</p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-3.5" />
              <input 
                type="text" 
                placeholder={`Search in ${activeTab}...`} 
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
              {filteredCases.length > 0 ? filteredCases.map((item) => (
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
                      <span className="text-sm font-bold text-slate-700">{item.victimName || 'Unknown'}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{item.victimPhone || 'N/A'}</span>
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
                      {/* 💡 DYNAMIC BUTTON LOGIC: Deploy for Fresh, Re-assign for others */}
                      {item.status !== 'Closed' && item.status !== 'Archived' && (
                        <button 
                          onClick={(e) => handleOpenDeploy(e, item)}
                          className={`text-white px-4 py-2 rounded-xl text-[11px] font-black flex items-center gap-2 shadow-lg transition-all ${
                            item.status === 'Fresh' 
                              ? 'bg-[#08B36A] shadow-green-100 hover:bg-[#07a25f]' 
                              : 'bg-blue-600 shadow-blue-100 hover:bg-blue-700'
                          }`}
                        >
                          {item.status === 'Fresh' ? <><FaUserShield size={12} /> Deploy</> : <><FaExchangeAlt size={12} /> Re-assign</>}
                        </button>
                      )}

                      <button className="bg-white border border-slate-200 text-slate-500 px-3 py-2 rounded-xl text-[11px] font-black hover:border-slate-800 hover:text-slate-800 transition-all">
                        <FaEye />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                    <td colSpan="5" className="p-20 text-center">
                        <div className="flex flex-col items-center opacity-20">
                            <FaFolderOpen size={40} className="mb-4" />
                            <p className="text-xs font-black uppercase tracking-[0.2em]">No {activeTab} Cases Found</p>
                        </div>
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-50 bg-slate-50/30 flex justify-between items-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Tab Records: {filteredCases.length}</span>
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
                            <p className="text-lg font-black text-slate-800">{selectedCase.victimName || 'Unknown'}</p>
                            <p className="text-xs font-bold text-slate-500 mt-1">Contact: {selectedCase.victimPhone || 'N/A'}</p>
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
                    
                    {selectedCase.status !== 'Closed' && selectedCase.status !== 'Archived' && (
                        <button 
                            onClick={() => { setIsModalOpen(false); setIsDeployModalOpen(true); }} 
                            className={`text-white px-8 py-3 rounded-2xl text-[11px] font-black shadow-xl uppercase tracking-widest transition-all ${
                                selectedCase.status === 'Fresh' ? 'bg-[#08B36A] hover:bg-[#07a25f] shadow-green-100' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-100'
                            }`}
                        >
                            {selectedCase.status === 'Fresh' ? 'Deploy Station Now' : 'Re-assign Station'}
                        </button>
                    )}
                </div>
            </div>
        </div>
      )}

      {/* --- INTEGRATED SMART DEPLOY MODAL --- */}
      {isDeployModalOpen && selectedCase && (
        <SmartDeployModal 
          caseData={selectedCase} 
          mode={selectedCase.status === 'Fresh' ? 'assign' : 'reassign'} 
          onClose={() => setIsDeployModalOpen(false)} 
          onSuccess={fetchCases} // Refresh the entire cases list
        />
      )}

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

// =========================================================================
// SMART DEPLOY MODAL COMPONENT (Handles Assign & Reassign based on Mode)
// =========================================================================
function SmartDeployModal({ caseData, onClose, onSuccess, mode }) {
    const [stations, setStations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    
    const [selectedStation, setSelectedStation] = useState("");
    const [severityLevel, setSeverityLevel] = useState(caseData.severityLevel || "Level 1");

    const isReassign = mode === "reassign";

    useEffect(() => {
        const fetchStations = async () => {
            setLoading(true);
            try {
                const response = await PoliceAPI.getAllPoliceStations();
                if (response.success) {
                    setStations(response.data);
                }
            } catch (error) {
                console.error("Error fetching stations:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStations();
    }, []);

    const handleDeploy = async () => {
        if (!selectedStation) return alert("Please select a Police Station!");
        
        setSubmitting(true);
        try {
            let response;
            // DYNAMIC API SELECTION based on mode
            if (isReassign) {
                response = await PoliceAPI.reassignCase(caseData._id, {
                    stationId: selectedStation,
                    severityLevel: severityLevel
                });
            } else {
                response = await PoliceAPI.assignCaseToPoliceStataion(caseData._id, {
                    stationId: selectedStation,
                    severityLevel: severityLevel
                });
            }

            if (response.success) {
                onSuccess(); // Refresh list
                onClose();   // Close modal
            } else {
                alert(response.message || "Failed to process request");
            }
        } catch (error) {
            console.error("Action Error:", error);
            alert("Something went wrong!");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={!submitting ? onClose : undefined}></div>
            <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                            {isReassign ? <FaExchangeAlt className="text-blue-600" /> : <FaBuilding className="text-[#08B36A]" />} 
                            {isReassign ? 'Re-assign Case' : 'Deploy to Station'}
                        </h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                            Case No: {caseData.caseNo}
                        </p>
                    </div>
                    <button onClick={onClose} disabled={submitting} className="p-2 text-slate-400 hover:text-red-500 transition-colors bg-white rounded-full border border-slate-200 shadow-sm">
                        <FaTimes size={16} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    
                    <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl flex gap-3">
                        <FaExclamationTriangle className="text-orange-500 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-orange-500 mb-1">Incident Location</p>
                            <p className="text-sm font-bold text-orange-900 leading-snug">
                                {caseData.address}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-5">
                        {/* Station Selection */}
                        <div>
                            <label className="text-xs font-black uppercase tracking-widest text-slate-500 block mb-2">Select Target Police Station</label>
                            {loading ? (
                                <div className="p-3.5 bg-slate-50 text-slate-400 text-sm font-bold rounded-xl animate-pulse border border-slate-100">
                                    Loading available stations...
                                </div>
                            ) : (
                                <select 
                                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/30 transition-all cursor-pointer"
                                    value={selectedStation}
                                    onChange={(e) => setSelectedStation(e.target.value)}
                                >
                                    <option value="" disabled>-- Choose a Station --</option>
                                    {stations.map(stn => (
                                        <option key={stn._id} value={stn._id}>
                                            {stn.stationName} (Code: {stn.stationCode})
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        {/* Severity Level */}
                        <div>
                            <label className="text-xs font-black uppercase tracking-widest text-slate-500 block mb-2">Assign Severity Level</label>
                            <select 
                                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/30 transition-all cursor-pointer"
                                value={severityLevel}
                                onChange={(e) => setSeverityLevel(e.target.value)}
                            >
                                <option value="Level 1">Level 1 (Standard Action)</option>
                                <option value="Level 2">Level 2 (Elevated Response)</option>
                                <option value="Level 3">Level 3 (Critical / Emergency)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                    <button onClick={onClose} disabled={submitting} className="px-6 py-3 text-slate-500 font-black text-[11px] uppercase tracking-widest hover:text-slate-800 transition-colors">
                        Cancel
                    </button>
                    <button 
                        onClick={handleDeploy} 
                        disabled={submitting || !selectedStation}
                        className={`${isReassign ? 'bg-blue-600 hover:bg-blue-700' : 'bg-[#08B36A] hover:bg-[#07a25f]'} disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-2xl text-[11px] font-black shadow-lg uppercase tracking-widest flex items-center gap-2 transition-all transform active:scale-95`}
                    >
                        {submitting 
                            ? 'Processing...' 
                            : <><FaCheckCircle size={14} /> {isReassign ? 'Confirm Re-assign' : 'Confirm Deployment'}</>
                        }
                    </button>
                </div>
            </div>
        </div>
    )
}