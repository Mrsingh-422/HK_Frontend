'use client'
import React, { useState, useEffect } from 'react'
import { 
  FaSearch, 
  FaClock, 
  FaMapMarkerAlt, 
  FaExclamationTriangle,
  FaShieldAlt,
  FaFileAlt,
  FaTimes,
  FaUserInjured,
  FaClipboardList,
  FaCheckCircle,
  FaRegCircle,
  FaGavel,
  FaCarSide,
  FaUsers,
  FaPaperclip
} from 'react-icons/fa'
import PoliceAPI from '@/app/services/PoliceAPI' // Apna correct path dein

export default function PendingCasesPage() {
  const [pendingCases, setPendingCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  
  // Modal States
  const [selectedCase, setSelectedCase] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchPendingCases();
  }, []);

  const fetchPendingCases = async () => {
    setLoading(true);
    try {
      const response = await PoliceAPI.getPendingCases();
      if (response.success) {
        setPendingCases(response.data);
        setPagination(response.pagination);
      }
    } catch (error) {
      console.error("Error fetching pending cases:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const getSeverityBadge = (severity) => {
    switch(severity?.toLowerCase()) {
      case 'critical': return 'bg-red-50 text-red-600 border-red-200';
      case 'high': return 'bg-orange-50 text-orange-600 border-orange-200';
      case 'medium': return 'bg-yellow-50 text-yellow-600 border-yellow-200';
      case 'low': return 'bg-blue-50 text-blue-600 border-blue-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const getStatusBadge = (status) => {
    switch(status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'under investigation': return 'bg-blue-100 text-blue-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  // Row Click Handler
  const handleRowClick = (caseItem) => {
    setSelectedCase(caseItem);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3">
            <div className="p-3 bg-orange-50 text-orange-500 rounded-xl">
              <FaClock size={20} />
            </div>
            Pending Investigations
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1">
            Active cases currently under investigation across all stations.
          </p>
        </div>
        
        {pagination && (
          <div className="bg-white border border-slate-100 shadow-sm px-6 py-3 rounded-2xl flex items-center gap-4">
             <div className="text-orange-500 bg-orange-50 p-2 rounded-full">
                <FaFileAlt size={16} />
             </div>
             <div>
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Pending</p>
               <p className="text-xl font-black text-slate-800">{pagination.totalRecords} Cases</p>
             </div>
          </div>
        )}
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-white">
          <div className="relative w-full max-w-md">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-3.5" />
            <input 
              type="text" 
              placeholder="Search by Case ID, Victim Name or Location..." 
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
             <div className="p-16 flex flex-col items-center justify-center">
                <div className="w-10 h-10 border-4 border-slate-200 border-t-orange-500 rounded-full animate-spin mb-4"></div>
                <p className="text-slate-400 font-bold tracking-wide">Fetching pending cases...</p>
             </div>
          ) : pendingCases.length === 0 ? (
             <div className="p-16 text-center text-slate-400 font-bold">No Pending Cases Found</div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-[0.15em]">
                  <th className="px-6 py-4">Case Details</th>
                  <th className="px-6 py-4">Victim & Incident</th>
                  <th className="px-6 py-4">Handling Station</th>
                  <th className="px-6 py-4">Severity & Status</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {pendingCases.map((item) => (
                  <tr 
                    key={item._id} 
                    onClick={() => handleRowClick(item)}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                  >
                    
                    {/* Case ID & Date */}
                    <td className="px-6 py-5 align-top">
                      <span className="text-sm font-black text-slate-700">{item.caseNo}</span>
                      <div className="text-[11px] font-bold text-slate-400 mt-1 flex items-center gap-1">
                        <FaClock className="text-orange-400"/> {formatDate(item.reportedAt)}
                      </div>
                      {/* Explicit Status Badge */}
                      <div className={`mt-2 inline-block px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider ${getStatusBadge(item.status)}`}>
                        {item.status}
                      </div>
                    </td>
                    
                    {/* Victim Info */}
                    <td className="px-6 py-5 align-top">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800">{item.victimName || "Unknown"}</span>
                        <span className="text-xs font-bold text-slate-500 mt-0.5">{item.incidentType}</span>
                        <div className="flex items-center gap-1 mt-1.5 text-slate-400 text-[11px] font-medium max-w-[200px] truncate">
                          <FaMapMarkerAlt className="text-slate-300 flex-shrink-0" />
                          <span className="truncate">{item.address}</span>
                        </div>
                      </div>
                    </td>

                    {/* Station Info */}
                    <td className="px-6 py-5 align-top">
                      <div className="flex items-start gap-2">
                          <FaShieldAlt className="text-slate-300 mt-0.5"/>
                          <div>
                            <p className="text-sm font-bold text-slate-700">{item.stationId?.stationName || "Unassigned"}</p>
                            <p className="text-[11px] font-bold text-slate-400 mt-0.5">{item.stationId?.shoName || "HQ"}</p>
                          </div>
                      </div>
                    </td>

                    {/* Severity Badge & Sub-status */}
                    <td className="px-6 py-5 align-top">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${getSeverityBadge(item.severity)}`}>
                        <FaExclamationTriangle size={10} />
                        {item.severity}
                      </div>
                      <p className="text-[10px] font-bold text-slate-500 mt-2 ml-1 line-clamp-1 max-w-[150px]" title={item.severityStatus}>
                        {item.severityStatus}
                      </p>
                    </td>

                    {/* Action Button */}
                    <td className="px-6 py-5 align-middle text-center">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleRowClick(item); }}
                        className="bg-white border border-slate-200 shadow-sm group-hover:border-orange-500 group-hover:text-orange-500 text-slate-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ========================================= */}
      {/* LARGE DETAILED MODAL */}
      {/* ========================================= */}
      {isModalOpen && selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
            
            <div className="relative bg-white w-full max-w-5xl max-h-[90vh] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                
                {/* Modal Header */}
                <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-2xl font-black text-slate-800 tracking-tight">Case: {selectedCase.caseNo}</h3>
                          <span className={`px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest ${getStatusBadge(selectedCase.status)}`}>
                            {selectedCase.status}
                          </span>
                          <span className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${getSeverityBadge(selectedCase.severity)}`}>
                            {selectedCase.severity} ({selectedCase.severityLevel})
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                          Reported on {formatDate(selectedCase.reportedAt)}
                        </p>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="p-2 bg-white border border-slate-200 rounded-full text-slate-400 hover:text-red-500 hover:border-red-200 transition-all shadow-sm">
                        <FaTimes size={16} />
                    </button>
                </div>

                {/* Modal Scrollable Body */}
                <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-white">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        
                        {/* LEFT COLUMN */}
                        <div className="space-y-6">
                            
                            {/* Victim Info */}
                            <div>
                              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                  <FaUserInjured /> Victim Details
                              </h4>
                              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                  <p className="text-lg font-black text-slate-800">{selectedCase.victimName || 'N/A'}</p>
                                  <p className="text-sm font-bold text-slate-500 mt-1 flex items-center gap-2">
                                    Phone: {selectedCase.victimPhone || 'N/A'}
                                  </p>
                              </div>
                            </div>

                            {/* Incident Details */}
                            <div>
                              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                  <FaClipboardList /> Incident Information
                              </h4>
                              <div className="grid grid-cols-2 gap-4 mb-4">
                                <InfoItem label="Incident Type" value={selectedCase.incidentType} />
                                <InfoItem label="Current Stage" value={selectedCase.severityStatus} color="text-orange-600" />
                              </div>
                              <InfoItem label="Location / Address" value={selectedCase.address} />
                              <div className="mt-4">
                                <p className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-1">Description</p>
                                <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-sm font-medium text-slate-700 whitespace-pre-wrap leading-relaxed">
                                  {selectedCase.description || 'No description provided.'}
                                </div>
                              </div>
                            </div>

                            {/* Assigned Station & Staff */}
                            <div>
                              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                  <FaShieldAlt /> Handling Station & Team
                              </h4>
                              <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
                                  <p className="text-base font-black text-blue-900">{selectedCase.stationId?.stationName || 'Unassigned Station'}</p>
                                  <p className="text-xs font-bold text-blue-600 mt-1">SHO: {selectedCase.stationId?.shoName || 'N/A'} | Code: {selectedCase.stationId?.stationCode || 'N/A'}</p>
                                  
                                  <div className="mt-4 pt-4 border-t border-blue-100/50">
                                    <p className="text-[10px] font-bold text-blue-400 uppercase mb-2">Assigned Staff Count</p>
                                    <div className="flex gap-4">
                                      <span className="text-sm font-bold text-slate-700 bg-white px-3 py-1 rounded-lg border border-blue-100 shadow-sm">
                                        Lead: {selectedCase.assignedStaff?.length || 0}
                                      </span>
                                      <span className="text-sm font-bold text-slate-700 bg-white px-3 py-1 rounded-lg border border-blue-100 shadow-sm">
                                        Support: {selectedCase.supportingStaff?.length || 0}
                                      </span>
                                    </div>
                                  </div>
                              </div>
                            </div>

                        </div>

                        {/* RIGHT COLUMN */}
                        <div className="space-y-6">
                            
                            {/* Investigation Progress */}
                            <div>
                              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                  <FaCheckCircle /> Investigation Progress
                              </h4>
                              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 grid grid-cols-2 gap-4">
                                <ProgressCheck label="Case Accepted" isChecked={selectedCase.progress?.isAccepted} />
                                <ProgressCheck label="Site Visited" isChecked={selectedCase.progress?.isSiteVisited} />
                                <ProgressCheck label="Evidence Collected" isChecked={selectedCase.progress?.isEvidenceCollected} />
                                <ProgressCheck label="Report Submitted" isChecked={selectedCase.progress?.isReportSubmitted} />
                              </div>
                            </div>

                            {/* Legal Progress */}
                            <div>
                              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                  <FaGavel /> Legal Progress
                              </h4>
                              <div className="grid grid-cols-2 gap-4">
                                <InfoItem label="Arrest Status" value={selectedCase.legalProgress?.arrestStatus || 'N/A'} />
                                <InfoItem label="Bail Status" value={selectedCase.legalProgress?.bailStatus || 'N/A'} />
                                <InfoItem label="Charge Sheet" value={selectedCase.legalProgress?.isChargeSheetFiled ? 'Filed' : 'Not Filed'} />
                                <InfoItem label="Court Date" value={formatDate(selectedCase.legalProgress?.courtDate)} />
                              </div>
                            </div>

                            {/* Resources & Impact */}
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                      <FaCarSide /> Resources Used
                                  </h4>
                                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                                    <div className="flex justify-between text-sm"><span className="text-slate-500 font-bold">PCR Vans:</span> <span className="font-black text-slate-700">{selectedCase.resourcesUsed?.pcrVansAssigned || 0}</span></div>
                                    <div className="flex justify-between text-sm"><span className="text-slate-500 font-bold">Personnel:</span> <span className="font-black text-slate-700">{selectedCase.resourcesUsed?.personnelCount || 0}</span></div>
                                    <div className="flex justify-between text-sm"><span className="text-slate-500 font-bold">Forensic:</span> <span className="font-black text-slate-700">{selectedCase.resourcesUsed?.forensicTeamCalled ? 'Yes' : 'No'}</span></div>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                      <FaUsers /> Damage & Impact
                                  </h4>
                                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                                    <div className="flex justify-between text-sm"><span className="text-slate-500 font-bold">Injuries:</span> <span className="font-black text-orange-600">{selectedCase.damageImpact?.injuries || 0}</span></div>
                                    <div className="flex justify-between text-sm"><span className="text-slate-500 font-bold">Casualties:</span> <span className="font-black text-red-600">{selectedCase.damageImpact?.casualties || 0}</span></div>
                                    <div className="flex justify-between text-sm"><span className="text-slate-500 font-bold">Property Loss:</span> <span className="font-black text-slate-700">₹{selectedCase.damageImpact?.propertyDamageValue || 0}</span></div>
                                  </div>
                                </div>
                            </div>

                            {/* Evidence Attachments */}
                            {selectedCase.evidence && selectedCase.evidence.length > 0 && (
                              <div>
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <FaPaperclip /> Attached Evidence ({selectedCase.evidence.length})
                                </h4>
                                <div className="space-y-2">
                                  {selectedCase.evidence.map((file, idx) => (
                                    <div key={idx} className="flex items-center justify-between bg-white border border-slate-200 p-3 rounded-xl shadow-sm">
                                      <div className="flex items-center gap-3 truncate">
                                        <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                                          <FaFileAlt size={14}/>
                                        </div>
                                        <div className="truncate">
                                          <p className="text-sm font-bold text-slate-700 truncate">{file.fileName}</p>
                                          <p className="text-[10px] text-slate-400 uppercase font-black">{file.fileType} • {file.fileSize || 'Unknown Size'}</p>
                                        </div>
                                      </div>
                                      <a href={file.fileUrl} target="_blank" rel="noreferrer" className="text-xs font-black text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg whitespace-nowrap">
                                        View
                                      </a>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                        </div>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="px-8 py-5 border-t border-slate-100 bg-slate-50 flex justify-end">
                    <button 
                        onClick={() => setIsModalOpen(false)}
                        className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-colors shadow-md"
                    >
                        Close Details
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  )
}

// Custom Helper Components for Modal
function InfoItem({ label, value, color = "text-slate-800" }) {
    return (
        <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-1">{label}</p>
            <div className="bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl">
                <p className={`text-sm font-bold ${color}`}>{value || 'N/A'}</p>
            </div>
        </div>
    )
}

function ProgressCheck({ label, isChecked }) {
  return (
    <div className="flex items-center gap-2">
      {isChecked ? (
        <FaCheckCircle className="text-emerald-500" size={16} />
      ) : (
        <FaRegCircle className="text-slate-300" size={16} />
      )}
      <span className={`text-sm font-bold ${isChecked ? 'text-slate-800' : 'text-slate-400'}`}>
        {label}
      </span>
    </div>
  )
}