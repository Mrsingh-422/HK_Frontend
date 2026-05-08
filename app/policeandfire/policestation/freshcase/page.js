'use client'
import PoliceAPI from '@/app/services/PoliceAPI';
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
  FaHospital,
  FaUserInjured,
  FaExclamationTriangle,
  FaIdBadge,
  FaCheckCircle,
  FaFileMedical,
  FaPhoneAlt,
  FaHandPointer
} from 'react-icons/fa'


export default function FreshCasePage() {
  const [selectedCase, setSelectedCase] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  
  // Selection state for dispatch
  const [selectedStaffIds, setSelectedStaffIds] = useState([]);
  const [isDispatching, setIsDispatching] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);

  // API Data States
  const [cases, setCases] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- FETCH DATA FROM API ---
  const fetchData = async () => {
    try {
      setLoading(true);
      const [casesRes, staffRes] = await Promise.all([
        PoliceAPI.getPoliceStationCases(),
        PoliceAPI.getAllStaff()
      ]);

      if (casesRes.success) {
        setCases(casesRes.data);
      }
      if (staffRes.success) {
        setOfficers(staffRes.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenDetails = (caseItem) => {
    setSelectedCase(caseItem);
    setIsModalOpen(true);
  };

  // --- LOGIC: ACCEPT THEN DEPLOY ---
  const handleOpenDeploy = async (e, caseItem) => {
    e.stopPropagation(); 
    setSelectedCase(caseItem);
    
    // Check if case needs to be accepted first (Pending status or isAccepted is false)
    if (caseItem.status === 'Pending' || !caseItem.progress.isAccepted) {
        try {
            setIsAccepting(true);
            const res = await PoliceAPI.acceptCase(caseItem._id);
            if (res.success) {
                // Refresh list to update status locally
                await fetchData();
                setSelectedStaffIds([]); 
                setIsDeployModalOpen(true);
            }
        } catch (error) {
            console.error("Acceptance Error:", error);
            alert("Failed to accept the case. Please try again.");
        } finally {
            setIsAccepting(false);
        }
    } else {
        // Case already accepted, open deployment directly
        setSelectedStaffIds([]); 
        setIsDeployModalOpen(true);
    }
  };

  // --- DISPATCH LOGIC ---
  const toggleStaffSelection = (id) => {
    setSelectedStaffIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleConfirmDispatch = async () => {
    if (selectedStaffIds.length === 0) {
        alert("Please select at least one officer for dispatch.");
        return;
    }

    try {
        setIsDispatching(true);
        const payload = {
            caseId: selectedCase._id,
            staffIds: selectedStaffIds
        };

        const res = await PoliceAPI.disptchStaffToCase(selectedCase._id, payload);
        
        if (res.success) {
            alert("Officers dispatched successfully. Case status updated.");
            setIsDeployModalOpen(false);
            fetchData(); 
        }
    } catch (error) {
        console.error("Dispatch Error:", error);
        alert("Failed to dispatch staff.");
    } finally {
        setIsDispatching(false);
    }
  };

  // Helper to format ISO date to readable time
  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Incoming MLC Reports</h1>
          <p className="text-slate-500 font-medium mt-1">Real-time Medico-Legal Cases from District Hospitals</p>
        </div>
        <div className="flex gap-3">
            <button className="bg-white border border-slate-200 text-slate-600 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 shadow-sm hover:bg-slate-50 transition-all">
                <FaFileExport /> Export Registry
            </button>
        </div>
      </div>

      {/* --- TOP COMPACT STATS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CompactStatCard title="Fresh Intake" count={cases.length.toString().padStart(2, '0')} label="New Today" color="blue" icon={<FaFileMedical/>} />
        <CompactStatCard title="Critical Alert" count={cases.filter(c => c.severity === 'Critical').length.toString().padStart(2, '0')} label="Immediate Action" color="red" icon={<FaExclamationTriangle/>} />
        <CompactStatCard title="Force Ready" count={officers.filter(o => o.status === 'On Duty').length.toString().padStart(2, '0')} label="Officers Online" color="emerald" icon={<FaUserShield/>} />
      </div>

      {/* --- TABLE SECTION --- */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        
        {/* Table Toolbar */}
        <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-4 bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-green-50 rounded-xl text-[#08B36A] shadow-inner"><FaShieldAlt /></div>
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Fresh Case Registry</h2>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-3.5" />
              <input 
                type="text" 
                placeholder="Search Case No or Victim..." 
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#08B36A]/20 transition-all"
              />
            </div>
          </div>
        </div>

        {/* The Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.15em] border-y border-slate-50">
                <th className="px-8 py-4">Identity</th>
                <th className="px-6 py-4">Case Number</th>
                <th className="px-6 py-4">Victim Info</th>
                <th className="px-6 py-4">Incident Type</th>
                <th className="px-6 py-4">Status / Time</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan="6" className="p-20 text-center text-xs font-bold text-slate-400 uppercase animate-pulse">Syncing Central Registry...</td></tr>
              ) : cases.map((item) => (
                <tr 
                  key={item._id} 
                  onClick={() => handleOpenDetails(item)}
                  className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                >
                  <td className="px-8 py-5">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 font-black border border-slate-100 shadow-sm">
                        {item.victimName.charAt(0)}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm font-black text-blue-600 hover:underline">{item.caseNo}</span>
                  </td>
                  
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-700">{item.victimName}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{item.victimPhone}</span>
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 ${item.severity === 'Critical' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'} text-[9px] font-black rounded-lg uppercase tracking-widest`}>
                      {item.incidentType}
                    </span>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1 text-slate-500">
                      <div className="flex items-center gap-2 text-xs font-bold">
                        <div className={`w-1.5 h-1.5 rounded-full ${item.status === 'Pending' ? 'bg-orange-400' : 'bg-[#08B36A]'}`}></div>
                        {item.status}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-medium">
                        <FaClock size={10} className="text-slate-300" /> {formatTime(item.reportedAt)}
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={(e) => handleOpenDeploy(e, item)}
                        disabled={isAccepting && selectedCase?._id === item._id}
                        className="bg-[#08B36A] text-white px-5 py-2 rounded-xl text-[10px] font-black flex items-center gap-2 shadow-lg shadow-green-100 hover:bg-[#07a25f] transition-all disabled:opacity-50"
                      >
                        {isAccepting && selectedCase?._id === item._id ? "ACCEPTING..." : (
                            <>{item.progress.isAccepted ? <FaUserShield size={12} /> : <FaCheckCircle size={12} />} {item.progress.isAccepted ? "DEPLOY" : "ACCEPT & DEPLOY"}</>
                        )}
                      </button>
                      <button className="bg-white border border-slate-200 text-slate-500 px-3 py-2 rounded-xl text-[10px] font-black hover:border-slate-800 hover:text-slate-800 transition-all">
                        <FaEye />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && cases.length === 0 && <div className="p-20 text-center text-slate-400 font-bold">No incoming reports found.</div>}
        </div>
      </div>

      {/* --- CASE DETAILS MODAL --- */}
      {isModalOpen && selectedCase && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
            <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-8 border-b border-slate-50 flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-red-50 text-red-500 rounded-2xl">
                            <FaShieldAlt size={24} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Case Registry: {selectedCase.caseNo}</h3>
                            <p className="text-red-500 font-bold text-[10px] uppercase tracking-[0.15em] mt-1 flex items-center gap-2">
                                <FaExclamationTriangle /> {selectedCase.severity} Severity Alert
                            </p>
                        </div>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                        <FaTimes size={20} />
                    </button>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><FaUserInjured /> Victim Information</h4>
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                            <p className="text-lg font-black text-slate-800">{selectedCase.victimName}</p>
                            <p className="text-xs font-bold text-slate-500 mt-1 flex items-center gap-2"><FaPhoneAlt size={10}/> {selectedCase.victimPhone}</p>
                        </div>
                        <InfoItem label="Incident Category" value={selectedCase.incidentType} color="text-red-500" />
                        <InfoItem label="Description" value={selectedCase.description || "No description provided."} />
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><FaMapMarkerAlt /> Location Details</h4>
                        <InfoItem label="Occurrence Address" value={selectedCase.address} />
                        <InfoItem label="Reported At" value={new Date(selectedCase.reportedAt).toLocaleString()} />
                        <InfoItem label="Severity Status" value={selectedCase.severityStatus} />
                        <InfoItem label="System Status" value={selectedCase.status} />
                    </div>
                </div>
                <div className="p-8 bg-slate-50 flex justify-end gap-3">
                    <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-slate-500 font-black text-[11px] uppercase tracking-widest">Close View</button>
                    <button 
                        onClick={(e) => { setIsModalOpen(false); handleOpenDeploy(e, selectedCase); }} 
                        className="bg-[#08B36A] text-white px-8 py-3 rounded-2xl text-[11px] font-black shadow-xl shadow-green-100 uppercase tracking-widest"
                    >
                        {selectedCase.progress.isAccepted ? "Deploy Force" : "Accept & Deploy"}
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* --- DEPLOY OFFICER MODAL --- */}
      {isDeployModalOpen && selectedCase && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsDeployModalOpen(false)}></div>
            <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-lg font-black text-slate-800">Dispatch Unit</h3>
                    <button onClick={() => setIsDeployModalOpen(false)} className="text-slate-300 hover:text-red-500"><FaTimes size={18} /></button>
                </div>
                <div className="p-6 space-y-4">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Select Available Units</p>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {officers.length > 0 ? officers.map(officer => (
                            <div 
                                key={officer._id} 
                                onClick={() => toggleStaffSelection(officer._id)}
                                className={`flex items-center justify-between p-4 bg-slate-50 border ${selectedStaffIds.includes(officer._id) ? 'border-[#08B36A] bg-emerald-50/30' : 'border-slate-100'} rounded-2xl cursor-pointer group transition-all`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${selectedStaffIds.includes(officer._id) ? 'bg-[#08B36A] text-white' : 'bg-white text-slate-400 group-hover:text-[#08B36A]'}`}><FaIdBadge /></div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">{officer.fullName}</p>
                                        <p className="text-[10px] font-bold text-slate-400">{officer.badgeId} • {officer.rank}</p>
                                    </div>
                                </div>
                                {selectedStaffIds.includes(officer._id) ? (
                                    <FaCheckCircle className="text-[#08B36A]" />
                                ) : (
                                    <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-md ${officer.status === 'On Duty' ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-500'}`}>{officer.status}</span>
                                )}
                            </div>
                        )) : (
                            <div className="text-center py-10 text-slate-400 font-bold text-xs uppercase">No officers registered</div>
                        )}
                    </div>
                </div>
                <div className="p-6 bg-slate-50 flex gap-3">
                    <button onClick={() => setIsDeployModalOpen(false)} className="flex-1 bg-white border border-slate-200 py-3 rounded-xl font-black text-[10px] text-slate-500 uppercase tracking-widest">Cancel</button>
                    <button 
                        onClick={handleConfirmDispatch} 
                        disabled={isDispatching}
                        className="flex-1 bg-[#08B36A] py-3 rounded-xl font-black text-[10px] text-white shadow-lg shadow-green-100 uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isDispatching ? "Dispatching..." : <><FaCheckCircle /> Confirm Dispatch</>}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  )
}

// --- HELPER COMPONENTS ---

function CompactStatCard({ title, count, label, color, icon }) {
    const colors = {
        blue: "text-blue-600 bg-blue-50 border-blue-100",
        red: "text-red-600 bg-red-50 border-red-100",
        emerald: "text-emerald-600 bg-emerald-50 border-emerald-100"
    }
    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300">
            <div className="relative z-10 flex items-center gap-5">
                <div className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center ${colors[color]} border shadow-inner`}>
                    {React.cloneElement(icon, {size: 18})}
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{title}</p>
                    <div className="flex items-baseline gap-2">
                        <h2 className={`text-4xl font-black tracking-tight ${colors[color].split(' ')[0]}`}>{count}</h2>
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
                <p className={`text-sm font-bold ${color} line-clamp-2`}>{value}</p>
            </div>
        </div>
    )
}