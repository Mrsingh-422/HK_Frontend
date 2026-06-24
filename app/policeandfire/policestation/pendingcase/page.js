'use client'
import React, { useState, useEffect, cloneElement, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { 
  FaSearch, FaEye, FaClock, FaMapMarkerAlt, FaUserTie, FaExclamationCircle, 
  FaFilter, FaFileExport, FaTimes, FaFolderOpen, FaShieldAlt, FaHourglassHalf, 
  FaEdit, FaUserInjured, FaUserShield, FaUsers, FaUpload, FaPaperclip, FaExternalLinkAlt
} from 'react-icons/fa'
import PoliceAPI from '@/app/services/PoliceAPI'

export default function PendingCasePage() {
  const router = useRouter();
  
  const [pendingCases, setPendingCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState(null);

  // Main Details Modal State
  const [selectedCase, setSelectedCase] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Action Modals States
  const [isUpdateStatusOpen, setIsUpdateStatusOpen] = useState(false);
  const [isAddEvidenceOpen, setIsAddEvidenceOpen] = useState(false);
  const [isCloseCaseOpen, setIsCloseCaseOpen] = useState(false);

  // Fetch pending cases directly from the provided API format
  useEffect(() => {
    fetchPendingCases();
  }, []);

  const fetchPendingCases = async () => {
    try {
      setLoading(true);
      const response = await PoliceAPI.getPendingCases(); // PENDING CASES API HIT
      if (response.success && response.data) {
        setPendingCases(response.data);
        if (response.pagination) setPagination(response.pagination);
      }
    } catch (error) {
      console.error("Error fetching pending cases:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetails = (caseItem) => {
    setSelectedCase(caseItem);
    setIsModalOpen(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const calculateAgeing = (dateString) => {
    if (!dateString) return "Unknown";
    const diffDays = Math.floor(Math.abs(new Date() - new Date(dateString)) / (1000 * 60 * 60 * 24));
    return diffDays === 0 ? "Today" : diffDays === 1 ? "1 Day" : `${diffDays} Days`;
  };

  // Search logic
  const filteredCases = pendingCases.filter(c => 
    c.caseNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.victimName && c.victimName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 font-sans pb-20">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Active Investigations</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">Monitoring cases under inquiry and verification</p>
        </div>
      </div>

      {/* --- TABLE SECTION --- */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4 bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-50 rounded-xl text-orange-500 shadow-inner"><FaFolderOpen /></div>
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Inquiry Registry</h2>
          </div>
          
          <div className="relative flex-1 md:w-72 max-w-md w-full">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-3.5" />
            <input 
              type="text" 
              placeholder="Search by ID or Victim..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
             <div className="p-16 flex flex-col items-center justify-center">
                <div className="w-10 h-10 border-4 border-slate-200 border-t-orange-500 rounded-full animate-spin mb-4"></div>
                <p className="text-slate-400 font-bold tracking-wide">Syncing Station Data...</p>
             </div>
          ) : filteredCases.length === 0 ? (
             <div className="p-16 text-center text-slate-400 font-bold">No Active Cases Found</div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.15em] border-y border-slate-50">
                  <th className="px-6 py-4">Case Details</th>
                  <th className="px-6 py-4">Victim Name</th>
                  <th className="px-6 py-4">Officer In-Charge</th>
                  <th className="px-6 py-4">Status & Location</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredCases.map((item) => (
                    <tr key={item._id} onClick={() => handleOpenDetails(item)} className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
                      
                      <td className="px-6 py-5">
                        <span className="text-sm font-black text-blue-600 group-hover:underline">{item.caseNo}</span>
                        <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest flex items-center gap-1">
                          <FaClock className="text-orange-400" /> {formatDate(item.reportedAt)}
                        </div>
                      </td>
                      
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-700">{item.victimName || "Unknown"}</span>
                            <span className={`w-fit mt-1 px-2 py-0.5 ${item.severity === 'Critical' ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-500'} text-[9px] font-black rounded uppercase tracking-wider`}>
                              {item.incidentType}
                            </span>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400"><FaUserTie size={12} /></div>
                            <span className="text-sm font-bold text-slate-600">
                                {item.assignedStaff?.length > 0 ? item.assignedStaff[0].fullName : "Unassigned"}
                            </span>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded mb-1 inline-block">
                          {item.severityStatus || item.status}
                        </span>
                        <div className="flex items-center gap-2 text-[11px] font-medium max-w-[200px] truncate text-slate-500 mt-1">
                          <FaMapMarkerAlt size={12} className="text-slate-300 flex-shrink-0" /> <span className="truncate">{item.address}</span>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center">
                            <button className="bg-white border-2 border-slate-100 text-[#08B36A] px-5 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 transition-all hover:border-[#08B36A]">
                                <FaEye /> Quick View
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

      {/* ========================================================================= */}
      {/* 1. QUICK VIEW CASE DETAILS MODAL */}
      {/* ========================================================================= */}
      {isModalOpen && selectedCase && (
        <div className="fixed inset-0 z-[50] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
            <div className="relative bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                
                <div className="p-8 border-b border-slate-50 flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-orange-50 text-orange-500 rounded-2xl shadow-inner"><FaHourglassHalf size={24} /></div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Case: {selectedCase.caseNo}</h3>
                            <p className="text-orange-500 font-bold text-[10px] uppercase tracking-[0.15em] mt-1">Pending Since {calculateAgeing(selectedCase.reportedAt)}</p>
                        </div>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><FaTimes size={20} /></button>
                </div>
                
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[50vh] overflow-y-auto custom-scrollbar">
                    {/* LEFT COLUMN */}
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><FaUserInjured /> Victim Details</h4>
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex items-center gap-4">
                            <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center text-slate-400 text-xl font-black shadow-sm">
                              {selectedCase.victimName ? selectedCase.victimName.charAt(0).toUpperCase() : '?'}
                            </div>
                            <div>
                                <p className="text-lg font-black text-slate-800">{selectedCase.victimName}</p>
                                <p className="text-xs font-bold text-slate-500 mt-1">{selectedCase.incidentType} • Ph: {selectedCase.victimPhone}</p>
                            </div>
                        </div>
                        <InfoItem label="Lead Officer" value={selectedCase.assignedStaff?.length > 0 ? selectedCase.assignedStaff[0].fullName : "Unassigned"} />
                        <InfoItem label="Incident Location" value={selectedCase.address} />
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><FaShieldAlt /> Progress & Status</h4>
                        <InfoItem label="Current Status" value={selectedCase.severityStatus || selectedCase.status} color="text-orange-600" />
                        
                        <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase ml-1 mb-1">Investigation Note</p>
                            <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-xs font-bold text-slate-600 leading-relaxed italic line-clamp-3">
                                "{selectedCase.remarks || selectedCase.description || 'No notes available.'}"
                            </div>
                        </div>

                        {/* Mapped Exactly to JSON Array */}
                        <div className="flex justify-between items-center gap-4 text-xs font-bold text-slate-600 bg-white border border-slate-100 p-3 rounded-xl shadow-sm mt-2">
                            <span>Evidences: <span className="text-blue-600">{selectedCase.evidence?.length || 0} Files</span></span>
                            <span>Officers: <span className="text-emerald-600">{selectedCase.resourcesUsed?.personnelCount || 1}</span></span>
                        </div>
                    </div>
                </div>

                {/* 🚨 ACTION BUTTONS 🚨 */}
                <div className="p-6 bg-slate-50 flex flex-wrap items-center gap-3 border-t border-slate-100 justify-end">
                    
                    <button 
                      onClick={() => router.push(`/policeandfire/policestation/pendingcase/${selectedCase._id}`)} 
                      className="bg-slate-800 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition-all flex items-center gap-2 shadow-md shadow-slate-200"
                    >
                        <FaExternalLinkAlt size={12} /> View Full Details
                    </button>

                    <button onClick={() => setIsUpdateStatusOpen(true)} className="bg-white border-2 border-orange-200 text-orange-600 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-50 transition-all">
                        Update Status
                    </button>
                    
                    <button onClick={() => setIsAddEvidenceOpen(true)} className="bg-white border-2 border-blue-200 text-blue-600 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 transition-all">
                        Add Evidence
                    </button>
                    
                    <button onClick={() => setIsCloseCaseOpen(true)} className="bg-red-500 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 shadow-md shadow-red-200 transition-all">
                        Close Case
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}
      {isUpdateStatusOpen && (
        <UpdateStatusModal 
          caseId={selectedCase._id} 
          currentStatus={selectedCase.severityStatus}
          onClose={() => setIsUpdateStatusOpen(false)} 
          onSuccess={() => { setIsUpdateStatusOpen(false); setIsModalOpen(false); fetchPendingCases(); }}
        />
      )}

      {isAddEvidenceOpen && (
        <AddEvidenceModal 
          caseId={selectedCase._id} 
          onClose={() => setIsAddEvidenceOpen(false)} 
          onSuccess={() => { setIsAddEvidenceOpen(false); setIsModalOpen(false); fetchPendingCases(); }}
        />
      )}

      {isCloseCaseOpen && (
        <CloseCaseModal 
          caseId={selectedCase._id} 
          onClose={() => setIsCloseCaseOpen(false)} 
          onSuccess={() => { setIsCloseCaseOpen(false); setIsModalOpen(false); fetchPendingCases(); }}
        />
      )}

    </div>
  )
}

// --- MODAL COMPONENTS ---

function UpdateStatusModal({ caseId, currentStatus, onClose, onSuccess }) {
  const statuses = [
    "Under Investigation", "Evidence Collection", "Witness Statement", "Suspect Apprehended", "Under Control"
  ];

  const [milestone, setMilestone] = useState(currentStatus || "Under Investigation");
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await PoliceAPI.updateStationCaseStatus(caseId, { milestoneStatus: milestone, remarks });
      if (res.success) onSuccess();
    } catch (err) { alert("Failed to update status"); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl animate-in zoom-in-95">
        <div className="flex justify-between items-center mb-6">
            <h3 className="font-black text-lg text-slate-800">Update Case Status</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-red-500"><FaTimes /></button>
        </div>
        <div className="space-y-3 mb-6">
          {statuses.map(s => (
            <label key={s} onClick={() => setMilestone(s)} className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${milestone === s ? 'border-[#08B36A]' : 'border-slate-300'}`}>
                {milestone === s && <div className="w-2 h-2 bg-[#08B36A] rounded-full"></div>}
              </div>
              <span className={`text-sm font-bold ${milestone === s ? 'text-slate-800' : 'text-slate-500'}`}>{s}</span>
            </label>
          ))}
        </div>
        <div className="mb-6">
          <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Add Notes / Remarks</label>
          <textarea rows="3" value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Enter details..." className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:border-[#08B36A]"></textarea>
        </div>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 font-black text-xs text-slate-500 uppercase hover:text-slate-700">Cancel</button>
          <button onClick={handleSubmit} disabled={submitting} className="bg-[#08B36A] text-white px-6 py-2 rounded-xl font-black text-xs uppercase shadow-md disabled:opacity-50 hover:bg-[#07a25f]">
            {submitting ? 'Saving...' : 'Save Update'}
          </button>
        </div>
      </div>
    </div>
  )
}

function AddEvidenceModal({ caseId, onClose, onSuccess }) {
  const [evidenceType, setEvidenceType] = useState("Photo");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const handleSubmit = async () => {
    if (!file) return alert("Please select a file to upload.");
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('evidenceFiles', file); 
      let mappedType = "Document";
      if (evidenceType === "Photo") mappedType = "Image";
      else if (evidenceType === "Video") mappedType = "Video";
      const finalDescription = (evidenceType !== "Photo" && evidenceType !== "Video") ? `[${evidenceType}] ${description}` : description;
      formData.append('evidenceType', mappedType); 
      formData.append('description', finalDescription);
      const res = await PoliceAPI.addStationEvidence(caseId, formData);
      if (res.success) onSuccess();
    } catch (err) { alert("Failed to upload evidence."); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl animate-in zoom-in-95">
        <div className="flex justify-between items-center mb-6">
            <h3 className="font-black text-lg text-slate-800">Add Evidence</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-red-500"><FaTimes /></button>
        </div>
        <div onClick={() => fileInputRef.current.click()} className="border-2 border-dashed border-[#08B36A] bg-emerald-50 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer mb-6 hover:bg-emerald-100 transition-colors text-center">
          <FaUpload className="text-[#08B36A] mb-2" size={24} />
          <p className="text-sm font-black text-emerald-800 line-clamp-1 px-2">{file ? file.name : 'Tap to Upload File'}</p>
          <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => setFile(e.target.files[0])} />
        </div>
        <div className="mb-4">
          <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Evidence Type</label>
          <select value={evidenceType} onChange={(e) => setEvidenceType(e.target.value)} className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 outline-none">
            <option value="Photo">Photo</option>
            <option value="Video">Video</option>
            <option value="FIR Copy">FIR Copy</option>
            <option value="Witness Statement">Witness Statement</option>
            <option value="Forensic Report">Forensic Report</option>
          </select>
        </div>
        <div className="mb-6">
          <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Description</label>
          <textarea rows="2" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 text-sm font-medium outline-none"></textarea>
        </div>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 font-black text-xs text-slate-500 uppercase">Cancel</button>
          <button onClick={handleSubmit} disabled={submitting || !file} className="bg-[#08B36A] text-white px-6 py-2 rounded-xl font-black text-xs uppercase shadow-md disabled:opacity-50">
            {submitting ? 'Uploading...' : 'Submit Evidence'}
          </button>
        </div>
      </div>
    </div>
  )
}

function CloseCaseModal({ caseId, onClose, onSuccess }) {
  const [finalStatus, setFinalStatus] = useState("Suspect Arrested");
  const [finalRemarks, setFinalRemarks] = useState("");
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const statuses = ["Suspect Arrested", "False Report", "Resolved", "Archived"];

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('finalStatus', finalStatus);
      formData.append('finalRemarks', finalRemarks);
      if (file) formData.append('evidenceFiles', file); 
      const res = await PoliceAPI.closeStationCase(caseId, formData);
      if (res.success) onSuccess();
    } catch (err) { alert("Failed to close case"); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl animate-in zoom-in-95 border-t-8 border-red-500">
        <div className="flex justify-between items-center mb-4">
            <h3 className="font-black text-lg text-slate-800">Close Case</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-red-500"><FaTimes /></button>
        </div>
        <div className="bg-red-50 text-red-600 text-[11px] font-bold p-3 rounded-xl mb-5 border border-red-100">
          This action cannot be undone. Please ensure all details are correct before closing.
        </div>
        <div className="mb-4">
          <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Final Status</label>
          <select value={finalStatus} onChange={(e) => setFinalStatus(e.target.value)} className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 outline-none focus:border-red-500">
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="mb-4">
          <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Final Remarks</label>
          <textarea rows="3" value={finalRemarks} onChange={(e) => setFinalRemarks(e.target.value)} placeholder="Summarize the resolution..." className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:border-red-500"></textarea>
        </div>
        <div className="mb-6">
          <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Final Report (Optional)</label>
          <div onClick={() => fileInputRef.current.click()} className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-3 text-center cursor-pointer hover:bg-slate-100">
            <p className="text-xs font-bold text-slate-600 flex items-center justify-center gap-2 truncate px-2"><FaPaperclip className="shrink-0" /> <span className="truncate">{file ? file.name : "Tap to upload report"}</span></p>
            <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => setFile(e.target.files[0])} accept=".pdf,.doc,.docx" />
          </div>
        </div>
        <div className="flex justify-between gap-3">
          <button onClick={onClose} className="w-full bg-slate-100 text-slate-600 py-3 rounded-xl font-black text-xs uppercase hover:bg-slate-200">Cancel</button>
          <button onClick={handleSubmit} disabled={submitting} className="w-full bg-red-500 text-white py-3 rounded-xl font-black text-xs uppercase shadow-md hover:bg-red-600 disabled:opacity-50">
            {submitting ? 'Closing...' : 'Close Case'}
          </button>
        </div>
      </div>
    </div>
  )
}

function InfoItem({ label, value, color = "text-slate-700" }) {
    return (
        <div>
            <p className="text-[9px] font-black text-slate-400 uppercase ml-1 mb-1">{label}</p>
            <div className="bg-white border border-slate-100 px-4 py-2.5 rounded-xl shadow-sm">
                <p className={`text-sm font-bold truncate ${color}`}>{value}</p>
            </div>
        </div>
    )
}