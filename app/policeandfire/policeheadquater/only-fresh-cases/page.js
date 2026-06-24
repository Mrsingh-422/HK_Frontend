'use client'
import React, { useState, useEffect } from 'react'
import { 
  FaSearch, 
  FaShieldAlt, 
  FaMapMarkerAlt, 
  FaClock, 
  FaUserShield,
  FaFolderPlus,
  FaTimes,
  FaBuilding,
  FaExclamationTriangle,
  FaCheckCircle,
  FaEye,
  FaUserInjured,
  FaExchangeAlt // Naya icon Re-assign ke liye
} from 'react-icons/fa'
import PoliceAPI from '@/app/services/PoliceAPI';

export default function FreshCasesPage() {
  const [freshCases, setFreshCases] = useState([]);
  const [filteredCases, setFilteredCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal States
  const [selectedCase, setSelectedCase] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);

  // --- 1. FETCH ONLY FRESH CASES ---
  const fetchFreshCases = async () => {
    try {
      setLoading(true);
      const response = await PoliceAPI.getAllCases();
      if (response.success && response.data) {
        // Filter only cases with 'Fresh' status
        const onlyFresh = response.data.filter(c => c.status === 'Fresh');
        setFreshCases(onlyFresh);
        setFilteredCases(onlyFresh);
      }
    } catch (error) {
      console.error("Error fetching fresh cases:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFreshCases();
  }, []);

  // --- 2. SEARCH FILTER LOGIC ---
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredCases(freshCases);
    } else {
      const lowerQuery = searchQuery.toLowerCase();
      const filtered = freshCases.filter(c => 
        c.caseNo.toLowerCase().includes(lowerQuery) ||
        (c.victimName && c.victimName.toLowerCase().includes(lowerQuery)) ||
        c.incidentType.toLowerCase().includes(lowerQuery) ||
        c.address.toLowerCase().includes(lowerQuery)
      );
      setFilteredCases(filtered);
    }
  }, [searchQuery, freshCases]);

  // --- 3. MODAL HANDLERS ---
  const handleOpenDetails = (caseItem) => {
    setSelectedCase(caseItem);
    setIsDetailsModalOpen(true);
  };

  const handleOpenDeploy = (e, caseItem) => {
    e.stopPropagation(); // Prevents row click (Details Modal) from firing
    setSelectedCase(caseItem);
    setIsDeployModalOpen(true);
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "Just Now";
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " | " + d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans">
      
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
            <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
                <FaFolderPlus size={24} />
            </div>
            <div>
                <h1 className="text-2xl font-black text-slate-800 tracking-tight">Fresh Intake Registry</h1>
                <p className="text-sm font-bold text-slate-400 mt-1">New unassigned incidents requiring immediate deployment.</p>
            </div>
        </div>
        <div className="bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100 text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Awaiting Deployment</p>
            <p className="text-2xl font-black text-blue-600">{freshCases.length}</p>
        </div>
      </div>

      {/* --- TABLE CONTAINER --- */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-white">
          <div className="relative w-full max-w-md">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-3.5" />
            <input 
              type="text" 
              placeholder="Search by ID, Victim or Location..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
             <div className="p-16 flex flex-col items-center justify-center">
                <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                <p className="text-slate-400 font-bold tracking-wide">Fetching fresh incidents...</p>
             </div>
          ) : filteredCases.length === 0 ? (
             <div className="p-20 flex flex-col items-center justify-center opacity-40">
                <FaShieldAlt size={48} className="mb-4 text-slate-400" />
                <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-500">No Fresh Cases Found</p>
                <p className="text-xs text-slate-400 mt-2 font-bold">All cases have been deployed or no new cases exist.</p>
             </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-[0.15em]">
                  <th className="px-6 py-4">Case Details</th>
                  <th className="px-6 py-4">Victim & Incident</th>
                  <th className="px-6 py-4">Location & Time</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredCases.map((item) => (
                  <tr 
                    key={item._id} 
                    onClick={() => handleOpenDetails(item)}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                  >
                    
                    {/* Case ID */}
                    <td className="px-6 py-5 align-top">
                      <span className="text-sm font-black text-slate-700">{item.caseNo}</span>
                      <div className="mt-2 inline-block px-2.5 py-1 bg-blue-50 text-blue-600 rounded text-[10px] font-black uppercase tracking-wider">
                        {item.status}
                      </div>
                    </td>
                    
                    {/* Victim Info */}
                    <td className="px-6 py-5 align-top">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800">{item.victimName || "Unknown"}</span>
                        <span className="text-xs font-bold text-slate-500 mt-0.5">{item.victimPhone || "No Contact"}</span>
                        <span className={`w-fit mt-2 px-2 py-0.5 ${item.severity === 'Critical' ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-500'} text-[9px] font-black rounded uppercase tracking-wider`}>
                          {item.incidentType} • {item.severity}
                        </span>
                      </div>
                    </td>

                    {/* Location Info */}
                    <td className="px-6 py-5 align-top">
                      <div className="flex flex-col gap-1.5 text-slate-500">
                        <div className="flex items-center gap-2 text-[11px] font-bold">
                          <FaClock size={11} className="text-blue-400" /> {formatDateTime(item.reportedAt)}
                        </div>
                        <div className="flex items-start gap-2 text-[11px] font-medium max-w-[250px]">
                          <FaMapMarkerAlt size={11} className="text-slate-300 mt-0.5 flex-shrink-0" /> 
                          <span className="leading-snug">{item.address}</span>
                        </div>
                      </div>
                    </td>

                    {/* Action Buttons */}
                    <td className="px-6 py-5 align-middle text-center">
                      <div className="flex items-center justify-center gap-3">
                        <button 
                          onClick={(e) => handleOpenDeploy(e, item)}
                          className="bg-[#08B36A] text-white px-5 py-2.5 rounded-xl text-[10px] font-black flex items-center gap-2 shadow-lg shadow-green-100 hover:bg-[#07a25f] hover:-translate-y-0.5 transition-all uppercase tracking-widest"
                        >
                          <FaUserShield size={12} /> Deploy
                        </button>
                        <button 
                          className="bg-white border-2 border-slate-200 text-slate-500 px-3 py-2 rounded-xl text-[11px] font-black hover:border-blue-500 hover:text-blue-500 transition-all"
                        >
                          <FaEye />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* CASE DETAILS MODAL (VIEW ONLY) */}
      {/* ========================================================= */}
      {isDetailsModalOpen && selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsDetailsModalOpen(false)}></div>
            <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-8 border-b border-slate-50 flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl shadow-inner">
                            <FaShieldAlt size={24} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Fresh Case: {selectedCase.caseNo}</h3>
                            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.15em] mt-1 flex items-center gap-2">
                                <FaClock /> Reported: {formatDateTime(selectedCase.reportedAt)}
                            </p>
                        </div>
                    </div>
                    <button onClick={() => setIsDetailsModalOpen(false)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                        <FaTimes size={20} />
                    </button>
                </div>
                
                <div className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <InfoItem label="Victim Name" value={selectedCase.victimName} />
                        <InfoItem label="Contact Number" value={selectedCase.victimPhone} />
                        <InfoItem label="Incident Type" value={selectedCase.incidentType} color="text-red-500" />
                        <InfoItem label="Severity Level" value={selectedCase.severity} />
                    </div>
                    <InfoItem label="Incident Location" value={selectedCase.address} />
                    
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-1">Description</p>
                        <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-sm font-medium text-slate-700 whitespace-pre-wrap">
                          {selectedCase.description || 'No detailed description provided.'}
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-slate-50 flex justify-end gap-3 border-t border-slate-100">
                    <button onClick={() => setIsDetailsModalOpen(false)} className="px-6 py-3 text-slate-500 font-black text-[11px] uppercase tracking-widest hover:text-slate-800 transition-colors">Close</button>
                    <button 
                      onClick={() => { setIsDetailsModalOpen(false); setIsDeployModalOpen(true); }} 
                      className="bg-[#08B36A] text-white px-8 py-3 rounded-2xl text-[11px] font-black shadow-lg shadow-green-100 hover:bg-[#07a25f] uppercase tracking-widest transition-all"
                    >
                      Deploy Station Now
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SMART DEPLOY & RE-ASSIGN MODAL (INTEGRATED) */}
      {/* ========================================================= */}
      {isDeployModalOpen && selectedCase && (
        <DeployModal 
          caseData={selectedCase} 
          mode="assign" // 👈 CHANGE THIS TO "reassign" WHEN USING IN PENDING CASES PAGE
          onClose={() => setIsDeployModalOpen(false)} 
          onSuccess={fetchFreshCases} // Refresh table after deployment
        />
      )}

    </div>
  )
}

// =========================================================================
// SMART DEPLOY MODAL COMPONENT (Handles both Assign & Reassign)
// =========================================================================
function DeployModal({ caseData, onClose, onSuccess, mode = "assign" }) {
    const [stations, setStations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    
    // Form States
    const [selectedStation, setSelectedStation] = useState("");
    const [severityLevel, setSeverityLevel] = useState("Level 1");

    const isReassign = mode === "reassign";

    // Fetch All Stations on Mount
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
            // 👈 SMART LOGIC: Decide which API to hit based on mode
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
                    
                    {/* Location Alert Box */}
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
                        {/* Station Selection Dropdown */}
                        <div>
                            <label className="text-xs font-black uppercase tracking-widest text-slate-500 block mb-2">Select Target Police Station</label>
                            {loading ? (
                                <div className="p-3.5 bg-slate-50 text-slate-400 text-sm font-bold rounded-xl animate-pulse border border-slate-100">
                                    Loading available stations...
                                </div>
                            ) : (
                                <select 
                                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#08B36A]/30 transition-all cursor-pointer"
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

                        {/* Severity Level Dropdown */}
                        <div>
                            <label className="text-xs font-black uppercase tracking-widest text-slate-500 block mb-2">Assign Severity Level</label>
                            <select 
                                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#08B36A]/30 transition-all cursor-pointer"
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

// =========================================================================
// HELPER COMPONENT
// =========================================================================
function InfoItem({ label, value, color = "text-slate-700" }) {
    return (
        <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-1">{label}</p>
            <div className="bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl">
                <p className={`text-sm font-bold ${color}`}>{value || 'N/A'}</p>
            </div>
        </div>
    )
}