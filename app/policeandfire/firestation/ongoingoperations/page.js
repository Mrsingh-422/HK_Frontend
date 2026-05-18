'use client'
import React, { useState, useEffect } from 'react'
import { 
  FaSearch, FaMapMarkerAlt, FaTimes, FaChevronLeft, 
  FaCloudUploadAlt, FaMap, FaCheckCircle, FaSpinner,
  FaFileAlt, FaFire, FaHouseDamage, FaHardHat, FaBriefcaseMedical,
  FaTrash
} from 'react-icons/fa'

import FireStationAPI from '@/app/services/FireStationAPI'

export default function OngoingCasesPage() {
  const [activeTab, setActiveTab] = useState('All')
  const[searchQuery, setSearchQuery] = useState('')
  
  // API States
  const[ongoingCasesData, setOngoingCasesData] = useState([])
  const [fireTypesList, setFireTypesList] = useState(['Residential', 'Industrial', 'Forest', 'Vehicle', 'Other'])
  const [isLoading, setIsLoading] = useState(true)
  const[isSubmitting, setIsSubmitting] = useState(false)

  // Modal states
  const[selectedCase, setSelectedCase] = useState(null)
  const[modalView, setModalView] = useState('details') // 'details' | 'update'

  // Form States
  const[selectedStatus, setSelectedStatus] = useState('Under Control')
  const [remarks, setRemarks] = useState('')
  const[selectedImages, setSelectedImages] = useState([])
  
  // Final Report Specific States
  const[finalReportData, setFinalReportData] = useState({
    incidentType: 'Residential',
    damageLevel: 'Minor Structural Damage',
    injuries: 0,
    casualties: 0,
    trucksAssigned: 2,
    firefightersCount: 8,
    equipmentUsed: 'Hoses, Ladders, BA Sets'
  })

  // --- HELPER: RELATIVE TIME ---
  const getRelativeTime = (dateString) => {
    if (!dateString) return "N/A";
    const diff = new Date() - new Date(dateString);
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Just Dispatched";
    if (minutes < 60) return `${minutes} mins ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hrs ago`;
    return `${Math.floor(hours / 24)} days ago`;
  };

  // --- INITIAL DATA FETCH ---
  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Fire Types (FIXED LOGIC)
      const typesRes = await FireStationAPI.GetFireTypes().catch(() => null);
      if (typesRes && typesRes.success) {
         if (Array.isArray(typesRes.data)) {
             setFireTypesList(typesRes.data);
         } else if (typesRes.data.fireTypes && Array.isArray(typesRes.data.fireTypes)) {
             setFireTypesList(typesRes.data.fireTypes);
         } else if (typesRes.data.types && Array.isArray(typesRes.data.types)) {
             setFireTypesList(typesRes.data.types);
         }
      }

      // 2. Fetch Ongoing Cases
      const res = await FireStationAPI.GetOngoingCases();
      if (res.success) {
        const mappedData = res.data.map(item => {
          let statusColor = "text-blue-600 bg-blue-50 border-blue-200";
          let dotColor = "bg-blue-500";
          
          if (item.status === 'Under Control') {
            statusColor = "text-orange-600 bg-orange-50 border-orange-200";
            dotColor = "bg-orange-500";
          } else if (item.status === 'Critical') {
            statusColor = "text-red-600 bg-red-50 border-red-200";
            dotColor = "bg-red-500";
          }

          return {
            _id: item._id,
            id: item.caseNo || "N/A",
            status: item.status || "Pending",
            timeAgo: getRelativeTime(item.dispatchedAt || item.reportedAt),
            reportedAt: new Date(item.reportedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
            location: item.address,
            type: item.fireType || "Other",
            trucksAssigned: item.assignedVehicles?.length || 2,
            teamLead: item.assignedStaff?.[0] || "Awaiting Update",
            currentStatusDesc: item.remarks || item.description || "Active Operation",
            statusColor,
            dotColor,
          }
        });
        setOngoingCasesData(mappedData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  },[]);

  // --- FILE UPLOAD & PREVIEW HANDLERS ---
  const handleImageChange = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setSelectedImages(prev => {
        const combinedFiles =[...prev, ...newFiles];
        return combinedFiles.slice(0, 5); 
      });
    }
    e.target.value = null; 
  };

  const removeImage = (indexToRemove) => {
    setSelectedImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  // --- SUBMIT HANDLER ---
  const handleUpdateSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (selectedStatus === 'Closed') {
        const formData = new FormData();
        
        formData.append('status', 'Closed');
        formData.append('incidentType', finalReportData.incidentType);
        formData.append('damageLevel', finalReportData.damageLevel);
        formData.append('injuries', finalReportData.injuries);
        formData.append('casualties', finalReportData.casualties);
        formData.append('trucksAssigned', finalReportData.trucksAssigned);
        formData.append('firefightersCount', finalReportData.firefightersCount);
        formData.append('equipmentUsed', finalReportData.equipmentUsed);
        formData.append('remarks', remarks);
        
        selectedImages.forEach((file) => {
          formData.append('incidentImages', file); 
        });

        const res = await FireStationAPI.SubmitFinalReport(selectedCase._id, formData);
        if (res.success) {
          setOngoingCasesData(prev => prev.filter(c => c._id !== selectedCase._id));
          closeModal();
        }
      } else {
        const res = await FireStationAPI.UpdateCaseSeverity(selectedCase._id, {
          status: selectedStatus,
          remarks: remarks
        });

        if (res.success) {
          setOngoingCasesData(prev => prev.map(c => 
            c._id === selectedCase._id 
              ? { ...c, status: selectedStatus, currentStatusDesc: remarks || c.currentStatusDesc } 
              : c
          ));
          closeModal();
        }
      }
    } catch (error) {
      console.error("Submission Error:", error);
      alert("Failed to process request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- UI HELPERS ---
  const filteredCases = ongoingCasesData.filter(c => {
    const matchesTab = activeTab === 'All' || c.status === activeTab
    const matchesSearch = c.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.location.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTab && matchesSearch
  })

  const openModal = (incident) => {
    setSelectedCase(incident)
    setModalView('details')
    setSelectedStatus(incident.status === 'Pending' ? 'Under Control' : incident.status)
    setRemarks('')
    setSelectedImages([])
    setFinalReportData(prev => ({...prev, incidentType: incident.type, trucksAssigned: incident.trucksAssigned || 2}))
  }

  const closeModal = () => {
    setSelectedCase(null)
    setModalView('details')
    setSelectedImages([]) // Cleanup images on close
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* --- HEADER --- */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800">Ongoing Operations</h1>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full sm:w-72">
             <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input type="text" placeholder="Search ID, location..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#08B36A]/20 focus:border-[#08B36A]"/>
          </div>
          <div className="flex bg-gray-100 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
            {['All', 'Pending', 'Under Control', 'Critical'].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`whitespace-nowrap flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === tab ? 'bg-[#08B36A] text-white shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}>
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* --- TABLE --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
        <div className="overflow-x-auto">
          {isLoading ? (
             <div className="flex flex-col items-center justify-center py-32 text-gray-400">
                 <FaSpinner className="animate-spin text-4xl text-[#08B36A] mb-4"/>
                 <p className="text-xs font-bold uppercase tracking-widest">Loading Live Operations...</p>
             </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase font-semibold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Incident ID</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Elapsed Time</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredCases.map((incident) => (
                  <tr key={incident._id} onClick={() => openModal(incident)} className="cursor-pointer transition-colors hover:bg-gray-50 group">
                    <td className="px-6 py-4 font-semibold text-gray-800">{incident.id}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${incident.statusColor}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${incident.dotColor} ${incident.status === 'Critical' && 'animate-pulse'}`}></span>
                        {incident.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium">{incident.timeAgo}</td>
                    <td className="px-6 py-4 text-gray-700 truncate max-w-[200px]">{incident.location}</td>
                    <td className="px-6 py-4 text-center">
                      <button className="text-[#08B36A] font-semibold text-sm hover:underline">Manage Ops</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {filteredCases.length === 0 && !isLoading && (
            <div className="text-center py-20 text-gray-500 font-medium">
               <FaCheckCircle className="mx-auto text-4xl text-green-100 mb-3"/>
               No ongoing operations found right now.
            </div>
          )}
        </div>
      </div>

      {/* ========================================= */}
      {/* --- MODAL POPUP --- */}
      {/* ========================================= */}
      {selectedCase && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-black/60" onClick={closeModal}>
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-3xl flex flex-col max-h-[95vh] overflow-hidden animate-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
            
            {/* Header */}
            <div className="flex items-center px-6 py-5 border-b border-gray-100 relative shadow-sm bg-gray-50">
               {modalView === 'update' && (
                  <button onClick={() => setModalView('details')} className="p-2 text-gray-600 hover:bg-gray-200 rounded-full transition-colors absolute left-4">
                    <FaChevronLeft size={16} />
                  </button>
               )}
               <h2 className="text-xl font-black text-gray-800 flex-1 text-center pr-8 tracking-tight">
                 {modalView === 'update' ? 'Manage Operation & Reporting' : 'Operation Dashboard'}
               </h2>
               <button onClick={closeModal} className="absolute right-6 p-2 text-gray-400 hover:text-red-500 bg-white hover:bg-red-50 rounded-full shadow-sm transition-colors">
                  <FaTimes size={16} />
               </button>
            </div>

            {/* --- VIEW 1: DETAILS --- */}
            {modalView === 'details' && (
              <div className="p-8 overflow-y-auto custom-scrollbar flex flex-col gap-6">
                 <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <div>
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Incident ID</p>
                      <p className="text-2xl font-black text-gray-800">{selectedCase.id}</p>
                    </div>
                    <span className={`px-4 py-1.5 rounded-full border ${selectedCase.statusColor} font-bold text-sm shadow-sm`}>{selectedCase.status}</span>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-50"><p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Reported At</p><p className="font-semibold text-gray-800">{selectedCase.reportedAt}</p></div>
                    <div className="bg-green-50/50 p-4 rounded-2xl border border-green-50"><p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Location</p><p className="font-semibold text-gray-800">{selectedCase.location}</p></div>
                 </div>

                 <button onClick={() => setModalView('update')} className="w-full py-4 rounded-2xl bg-[#08B36A] text-white font-black text-sm hover:bg-[#069356] shadow-lg shadow-green-100 transition-all active:scale-95 uppercase tracking-widest mt-auto">
                    Update Status & Generate Report
                 </button>
              </div>
            )}

            {/* --- VIEW 2: FINAL REPORT FORM --- */}
            {modalView === 'update' && (
              <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar bg-white flex flex-col gap-8">
                
                {/* 1. STATUS SELECTION */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><span className="w-2 h-2 bg-[#08B36A] rounded-full"></span> 1. Operation Status</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {['Under Control', 'Critical', 'Closed'].map(status => (
                      <button key={status} onClick={() => setSelectedStatus(status)} className={`py-3 px-4 border-2 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${selectedStatus === status ? status === 'Critical' ? 'border-red-500 bg-red-50 text-red-600' : 'border-[#08B36A] bg-green-50 text-[#08B36A] shadow-sm' : 'border-gray-100 text-gray-500 hover:border-gray-200'}`}>
                        {status === 'Closed' && selectedStatus === status && <FaCheckCircle/>}
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. CONDITIONAL: FINAL REPORT */}
                {selectedStatus === 'Closed' && (
                  <div className="bg-slate-50 border border-slate-100 p-6 rounded-[2rem] space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                     <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><FaFileAlt size={20}/></div>
                        <div>
                          <h4 className="font-black text-slate-800 text-lg">Final Incident Report</h4>
                          <p className="text-xs font-bold text-slate-400 mt-0.5">Fill out all exact parameters before closing the case.</p>
                        </div>
                     </div>
                     
                     {/* Category */}
                     <div className="space-y-4">
                        <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><FaFire className="text-orange-500"/> Categorization</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-bold text-slate-600 mb-2 block">Incident Type</label>
                            <select value={finalReportData.incidentType} onChange={(e) => setFinalReportData({...finalReportData, incidentType: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-sm font-bold text-slate-700 outline-none focus:border-[#08B36A] focus:ring-2 focus:ring-[#08B36A]/20 transition-all cursor-pointer">
                              {/* FIXED MAPPING LOGIC */}
                              {Array.isArray(fireTypesList) && fireTypesList.length > 0 ? (
                                fireTypesList.map(type => (
                                  <option key={type} value={type}>{type}</option>
                                ))
                              ) : (['Residential', 'Industrial', 'Forest', 'Vehicle', 'Other'].map(type => (
                                  <option key={type} value={type}>{type}</option>
                                ))
                              )}
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-600 mb-2 block">Damage Level</label>
                            <select value={finalReportData.damageLevel} onChange={(e) => setFinalReportData({...finalReportData, damageLevel: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-sm font-bold text-slate-700 outline-none focus:border-[#08B36A] focus:ring-2 focus:ring-[#08B36A]/20 transition-all cursor-pointer">
                              <option value="Minor">Minor</option>
                              <option value="Minor Structural Damage">Minor Structural Damage</option>
                              <option value="Major">Major</option>
                              <option value="Total Loss">Total Loss</option>
                            </select>
                          </div>
                        </div>
                     </div>

                     {/* Impact */}
                     <div className="space-y-4 pt-2 border-t border-slate-200/60">
                        <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><FaBriefcaseMedical className="text-red-500"/> Health & Impact</h5>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-bold text-slate-600 mb-2 block">Injuries</label>
                            <input type="number" value={finalReportData.injuries} onChange={(e) => setFinalReportData({...finalReportData, injuries: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-sm font-bold text-slate-700 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all" />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-600 mb-2 block">Casualties</label>
                            <input type="number" value={finalReportData.casualties} onChange={(e) => setFinalReportData({...finalReportData, casualties: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-sm font-bold text-slate-700 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all" />
                          </div>
                        </div>
                     </div>

                     {/* Resources */}
                     <div className="space-y-4 pt-2 border-t border-slate-200/60">
                        <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><FaHardHat className="text-yellow-600"/> Resources Deployed</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-bold text-slate-600 mb-2 block">Trucks Assigned</label>
                            <input type="number" value={finalReportData.trucksAssigned} onChange={(e) => setFinalReportData({...finalReportData, trucksAssigned: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-sm font-bold text-slate-700 outline-none focus:border-[#08B36A] focus:ring-2 focus:ring-[#08B36A]/20 transition-all" />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-600 mb-2 block">Firefighters Count</label>
                            <input type="number" value={finalReportData.firefightersCount} onChange={(e) => setFinalReportData({...finalReportData, firefightersCount: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-sm font-bold text-slate-700 outline-none focus:border-[#08B36A] focus:ring-2 focus:ring-[#08B36A]/20 transition-all" />
                          </div>
                          <div className="md:col-span-2">
                            <label className="text-xs font-bold text-slate-600 mb-2 block">Equipment Used</label>
                            <input type="text" placeholder="e.g. Hoses, Ladders, BA Sets" value={finalReportData.equipmentUsed} onChange={(e) => setFinalReportData({...finalReportData, equipmentUsed: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-sm font-bold text-slate-700 outline-none focus:border-[#08B36A] focus:ring-2 focus:ring-[#08B36A]/20 transition-all" />
                          </div>
                        </div>
                     </div>
                  </div>
                )}

                {/* 3. CAPTAINS REMARKS */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><span className="w-2 h-2 bg-[#08B36A] rounded-full"></span> {selectedStatus === 'Closed' ? 'Final Case Summary' : 'Current Situation / Remarks'}</h3>
                  <textarea rows="3" value={remarks} onChange={(e) => setRemarks(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-medium text-slate-700 outline-none focus:border-[#08B36A] focus:bg-white focus:ring-2 focus:ring-[#08B36A]/20 transition-all resize-none" placeholder="Enter captain's log or closure notes..."></textarea>
                </div>

                {/* 4. INCIDENT IMAGES WITH PREVIEWS */}
                {selectedStatus === 'Closed' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><span className="w-2 h-2 bg-[#08B36A] rounded-full"></span> Upload Evidence</h3>
                      <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded-md uppercase">* Required for closure</span>
                    </div>
                    
                    {/* The Drag & Drop Style Label */}
                    <label className="border-2 border-dashed border-[#08B36A]/40 bg-[#08B36A]/5 rounded-[2rem] p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[#08B36A]/10 hover:border-[#08B36A] transition-all group">
                      <div className="p-4 bg-white rounded-full shadow-sm text-[#08B36A] group-hover:scale-110 transition-transform"><FaCloudUploadAlt size={24} /></div>
                      <p className="text-sm font-black text-slate-700 mt-4">Tap to upload Incident Images</p>
                      <p className="text-xs font-bold text-slate-400 mt-1">{selectedImages.length} of 5 max files selected</p>
                      <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange}/>
                    </label>

                    {/* NEW: IMAGE PREVIEW THUMBNAILS GRID */}
                    {selectedImages.length > 0 && (
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mt-4 animate-in fade-in">
                        {selectedImages.map((file, i) => {
                          const objectUrl = URL.createObjectURL(file);
                          
                          return (
                            <div key={i} className="relative group rounded-2xl overflow-hidden border border-slate-200 aspect-square shadow-sm bg-slate-100">
                               <img src={objectUrl} alt={`Uploaded preview ${i+1}`} className="w-full h-full object-cover" />
                               
                               {/* Hover Overlay with Delete Button */}
                               <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                                 <button 
                                   type="button" 
                                   onClick={() => removeImage(i)}
                                   className="p-2.5 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-transform hover:scale-110 active:scale-95"
                                   title="Remove Image"
                                 >
                                   <FaTrash size={12} />
                                 </button>
                               </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* ACTION FOOTER */}
                <div className="pt-6 border-t border-slate-100 flex gap-4">
                   <button onClick={() => setModalView('details')} className="px-6 py-4 rounded-2xl text-slate-500 font-black text-sm hover:bg-slate-50 transition-colors">Cancel</button>
                   <button 
                      onClick={handleUpdateSubmit}
                      disabled={isSubmitting || (selectedStatus === 'Closed' && selectedImages.length === 0)}
                      className={`flex-1 py-4 rounded-2xl text-white font-black text-[13px] uppercase tracking-widest transition-all shadow-lg flex justify-center items-center gap-2 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed ${
                         selectedStatus === 'Critical' ? 'bg-red-500 shadow-red-200 hover:bg-red-600' : 'bg-[#08B36A] shadow-green-200 hover:bg-[#069356]'
                      }`}
                    >
                     {isSubmitting ? <><FaSpinner className="animate-spin" size={16}/> Saving...</> : <><FaCheckCircle size={16}/> {selectedStatus === 'Closed' ? 'Confirm & Generate Final Report' : 'Save Updates'}</>}
                   </button>
                </div>

              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}