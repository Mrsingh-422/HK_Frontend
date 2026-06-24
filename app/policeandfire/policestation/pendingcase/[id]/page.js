'use client'
import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  FaArrowLeft, FaShieldAlt, FaClock, FaMapMarkerAlt, FaUserTie, 
  FaUserInjured, FaUsers, FaExclamationTriangle, FaCheckCircle, 
  FaPaperclip, FaFileAlt, FaBuilding, FaExchangeAlt, FaTimes,FaUserShield
} from 'react-icons/fa'
import PoliceAPI from '@/app/services/PoliceAPI'

export default function CaseDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  useEffect(() => {
    if (id) fetchCaseDetails();
  }, [id]);

  const fetchCaseDetails = async () => {
    try {
      setLoading(true);
      const res = await PoliceAPI.getStationCaseSummary(id);
      if (res.success) setCaseData(res.data);
    } catch (error) {
      console.error("Error fetching case details:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-[#08B36A] rounded-full animate-spin"></div>
        <p className="mt-4 font-bold text-slate-400 uppercase tracking-widest text-xs">Loading Case Records...</p>
    </div>
  );

  if (!caseData) return <div className="text-center p-20 text-red-500 font-bold">Case Not Found</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500 font-sans pb-24">
      
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-700 shadow-sm transition-all">
          <FaArrowLeft />
        </button>
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <FaShieldAlt className="text-orange-500" /> Case Details: {caseData.caseNo}
          </h1>
          <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">
             Status: <span className="text-orange-500">{caseData.severityStatus}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: OVERVIEW */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Overview Card */}
          <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-6 border-b border-slate-50 pb-4">
              <FaMapMarkerAlt className="text-[#08B36A]" /> Incident Overview
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <DetailItem label="Location" value={caseData.address} />
              <DetailItem label="Reported Time" value={formatDate(caseData.reportedAt)} />
              <DetailItem label="Category" value={caseData.incidentType} />
              <DetailItem label="Priority Level" value={caseData.severityLevel} color="text-red-500" />
            </div>
            
            <div className="mt-6 pt-6 border-t border-slate-50">
              <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Incident Description</p>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm font-bold text-slate-600 leading-relaxed">
                {caseData.description || "No description provided by HQ."}
              </div>
            </div>
          </div>

          {/* Investigation Team */}
          <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-6 border-b border-slate-50 pb-4">
              <FaUserShield className="text-blue-500" /> Investigation Team
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                <span className="text-xs font-black uppercase tracking-widest text-blue-400">Lead Officer</span>
                <span className="text-sm font-black text-blue-900 flex items-center gap-2"><FaUserTie/> {caseData.assignedStaff?.[0]?.fullName || "Unassigned"}</span>
              </div>
              
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 mb-3 ml-2">Supporting Officers</p>
                {caseData.supportingStaff?.length > 0 ? (
                  <div className="space-y-2">
                    {caseData.supportingStaff.map(staff => (
                      <div key={staff._id} className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-slate-300"><FaUserTie/></div>
                        <span className="text-sm font-bold text-slate-700">{staff.fullName}</span>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-xs font-bold text-slate-400 ml-2">No supporting officers assigned.</p>}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ATTACHMENTS & TEAM */}
        <div className="space-y-6">
          
          {/* Victim Short Card */}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
             <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-4">
              <FaUserInjured className="text-orange-500" /> Victim Details
            </h3>
            <p className="text-lg font-black text-slate-800">{caseData.victimName}</p>
            <p className="text-xs font-bold text-slate-500 mt-1">Ph: {caseData.victimPhone}</p>
          </div>

         {/* Evidence Attachments */}
         <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-4 border-b border-slate-50 pb-4">
              <FaPaperclip className="text-slate-500" /> Attached Evidence ({caseData.evidence?.length || 0})
            </h3>
            <div className="space-y-3">
              {caseData.evidence?.length > 0 ? caseData.evidence.map((file, idx) => {
                
                // 🚨 FIX: URL Formatting Logic
                // Agar URL already "http" se start ho raha hai, toh same rakho.
                // Warna Backend ka Base URL uske aage chipka do.
                const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
                const fileLink = file.fileUrl.startsWith('http') 
                                 ? file.fileUrl 
                                 : `${backendUrl}${file.fileUrl}`;

                return (
                  <a key={idx} href={fileLink} target="_blank" rel="noreferrer" className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 hover:bg-slate-100 transition-colors group">
                    <div className="p-2 bg-white rounded-lg text-slate-400 group-hover:text-blue-500"><FaFileAlt /></div>
                    <div className="flex-1 truncate">
                      <p className="text-xs font-bold text-slate-700 truncate">{file.fileName}</p>
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-0.5">{file.fileType}</p>
                    </div>
                  </a>
                );
              }) : <p className="text-xs font-bold text-slate-400 text-center py-4">No evidence uploaded yet.</p>}
            </div>
          </div>

          {/* Supporting Stations */}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-4 border-b border-slate-50 pb-4">
              <FaBuilding className="text-emerald-500" /> Supporting Stations ({caseData.supportingStations?.length || 0})
            </h3>
            <div className="space-y-2">
              {caseData.supportingStations?.length > 0 ? caseData.supportingStations.map(stn => (
                <div key={stn._id} className="text-xs font-bold text-slate-600 bg-emerald-50 p-2.5 rounded-lg border border-emerald-100 flex items-center gap-2">
                  <FaCheckCircle className="text-emerald-500"/> {stn.stationName}
                </div>
              )) : <p className="text-xs font-bold text-slate-400 text-center py-2">No backup stations assigned.</p>}
            </div>
          </div>

        </div>
      </div>

      {/* --- FIXED BOTTOM ACTION BAR --- */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 px-6 md:px-10 flex flex-wrap gap-3 justify-end z-40 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
        
        {/* Transfer Button */}
        <button 
          onClick={() => setIsTransferModalOpen(true)}
          className="bg-white border-2 border-slate-200 text-slate-600 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-slate-800 hover:text-slate-800 transition-all flex items-center gap-2"
        >
          <FaExchangeAlt /> Transfer Case
        </button>

        {/* Add Support Station Button */}
        <button 
          onClick={() => setIsSupportModalOpen(true)}
          className="bg-white border-2 border-emerald-200 text-emerald-600 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-50 transition-all flex items-center gap-2"
        >
          <FaBuilding /> Add Supporting Station
        </button>
      </div>

      {/* --- MODALS --- */}
      {isSupportModalOpen && (
        <SupportStationModal 
          caseId={caseData._id} 
          caseLocation={caseData.location}
          onClose={() => setIsSupportModalOpen(false)} 
          onSuccess={() => { setIsSupportModalOpen(false); fetchCaseDetails(); }}
        />
      )}

      {isTransferModalOpen && (
        <TransferCaseModal 
          caseId={caseData._id} 
          onClose={() => setIsTransferModalOpen(false)} 
          onSuccess={() => { setIsTransferModalOpen(false); router.push('/policeandfire/policestation/pendingcase'); }}
        />
      )}

    </div>
  )
}

function DetailItem({ label, value, color="text-slate-800" }) {
  return (
    <div>
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">{label}</p>
      <div className={`text-sm font-bold bg-slate-50 px-4 py-3 rounded-xl border border-slate-100 ${color} truncate`}>
        {value || "N/A"}
      </div>
    </div>
  );
}

// =========================================================================
// ADD SUPPORTING STATION MODAL
// =========================================================================
function SupportStationModal({ caseId, caseLocation, onClose, onSuccess }) {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // State
  const [selectedStations, setSelectedStations] = useState([]);
  const [reason, setReason] = useState("Insufficient manpower");
  const reasonsList = ["High Risk Situation", "Insufficient manpower", "Large Area Coverage", "Crowd Control", "Emergency Escalation"];

  useEffect(() => {
    const fetchNearby = async () => {
      try {
        const res = await PoliceAPI.getNearbyStationsForCase(caseId);
        if (res.success) setStations(res.data);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchNearby();
  }, [caseId]);

  const handleCheckbox = (id) => {
    setSelectedStations(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const handleSubmit = async () => {
    if (selectedStations.length === 0) return alert("Select at least one station.");
    setSubmitting(true);
    try {
      const res = await PoliceAPI.requestSupportingStation(caseId, { supportingStationIds: selectedStations, reason });
      if (res.success) onSuccess();
    } catch (err) { alert("Failed to send support request"); } finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-md rounded-[2rem] p-6 shadow-2xl animate-in zoom-in-95">
        <div className="flex justify-between items-center mb-6">
            <h3 className="font-black text-lg text-slate-800 flex items-center gap-2"><FaBuilding className="text-[#08B36A]"/> Add Backup Station</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-red-500"><FaTimes /></button>
        </div>

        <div className="mb-4 max-h-[250px] overflow-y-auto custom-scrollbar pr-2 space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Nearby Stations</label>
          {loading ? <p className="text-xs font-bold text-slate-400 text-center py-4">Searching nearby stations...</p> : 
            stations.map(stn => (
              <label key={stn._id} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${selectedStations.includes(stn._id) ? 'border-[#08B36A] bg-emerald-50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
                <div>
                  <p className={`text-sm font-black ${selectedStations.includes(stn._id) ? 'text-emerald-800' : 'text-slate-700'}`}>{stn.stationName}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{stn.distance}</p>
                </div>
                <input type="checkbox" checked={selectedStations.includes(stn._id)} onChange={() => handleCheckbox(stn._id)} className="w-4 h-4 accent-[#08B36A]" />
              </label>
            ))
          }
        </div>

        <div className="mb-6">
          <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Reason For Support (Mandatory)</label>
          <select value={reason} onChange={(e) => setReason(e.target.value)} className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 outline-none">
            {reasonsList.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 font-black text-xs text-slate-500 uppercase">Cancel</button>
          <button onClick={handleSubmit} disabled={submitting || selectedStations.length === 0} className="bg-[#08B36A] text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase shadow-md disabled:opacity-50">
            {submitting ? 'Sending...' : 'Send Request'}
          </button>
        </div>
      </div>
    </div>
  )
}

// =========================================================================
// TRANSFER/RE-ASSIGN CASE MODAL
// =========================================================================
function TransferCaseModal({ caseId, onClose, onSuccess }) {
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      const res = await PoliceAPI.getAllPoliceStations();
      if (res.success) setStations(res.data);
    };
    fetchAll();
  }, []);

  const handleSubmit = async () => {
    if (!selectedStation) return alert("Select a target station");
    setSubmitting(true);
    try {
      const res = await PoliceAPI.transferCaseStation(caseId, { targetStationId: selectedStation, transferReason: reason });
      if (res.success) {
        alert("Case Transferred Successfully!");
        onSuccess();
      }
    } catch (err) { alert("Failed to transfer"); } finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl animate-in zoom-in-95">
        <div className="flex justify-between items-center mb-6">
            <h3 className="font-black text-lg text-slate-800 flex items-center gap-2"><FaExchangeAlt className="text-blue-500"/> Transfer Case</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-red-500"><FaTimes /></button>
        </div>
        
        <div className="mb-4">
          <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Target Station / Cell</label>
          <select value={selectedStation} onChange={(e) => setSelectedStation(e.target.value)} className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 outline-none">
            <option value="">-- Select Station --</option>
            {stations.map(s => <option key={s._id} value={s._id}>{s.stationName}</option>)}
          </select>
        </div>

        <div className="mb-6">
          <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Reason for Transfer</label>
          <input type="text" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Jurisdiction Change, Cyber Crime..." className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 outline-none" />
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 font-black text-xs text-slate-500 uppercase">Cancel</button>
          <button onClick={handleSubmit} disabled={submitting || !selectedStation} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase shadow-md disabled:opacity-50">
            {submitting ? 'Transferring...' : 'Transfer Case'}
          </button>
        </div>
      </div>
    </div>
  )
}