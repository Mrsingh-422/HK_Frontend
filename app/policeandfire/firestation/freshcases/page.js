'use client'
import React, { useState, useEffect } from 'react'
import { 
  FaSearch, FaMapMarkerAlt, FaPhoneAlt, 
  FaCheckCircle, FaTimes, FaEye, FaChevronLeft, 
  FaAngleDown, FaAngleUp, FaSpinner, FaUserShield,
  FaEdit, FaUpload, FaFireExtinguisher
} from 'react-icons/fa'

import FireStationAPI from '@/app/services/FireStationAPI'

export default function CasesManagement() {
  // --- MAIN NAVIGATION TABS ---
  const [mainTab, setMainTab] = useState('Fresh') // 'Fresh' | 'Ongoing'
  const [searchQuery, setSearchQuery] = useState('')
  
  // --- DATA STATES ---
  const [casesData, setCasesData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  
  // --- MODAL & ACTION STATES ---
  const [selectedCase, setSelectedCase] = useState(null) 
  const [modalStep, setModalStep] = useState('details') // 'details' | 'assignResources' | 'updateStatus'
  const [isProcessing, setIsProcessing] = useState(false)

  // --- RESOURCES STATES (For Fresh Cases) ---
  const [availableVans, setAvailableVans] = useState([])
  const [availableStaff, setAvailableStaff] = useState([])
  const [isResourcesLoading, setIsResourcesLoading] = useState(false)
  
  const [selectedVehicles, setSelectedVehicles] = useState([])
  const [selectedStaff, setSelectedStaff] = useState([])
  const [expandedVanId, setExpandedVanId] = useState(null) 

  // --- ONGOING CASE STATES (For Updating Status) ---
  const [reportDetails, setReportDetails] = useState(null)
  const [updateForm, setUpdateForm] = useState({
      statusLabel: 'Under Control',
      situationReport: '',
      backupRequired: '',
      incidentImages: null
  })

  // --- HELPER FUNCTIONS ---
  const getRelativeTime = (dateString) => {
    if(!dateString) return "N/A";
    const diff = new Date() - new Date(dateString);
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Just Now";
    if (minutes < 60) return `${minutes} mins ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hrs ago`;
    return `${Math.floor(hours / 24)} days ago`;
  };

  const mapDataToUI = (apiData) => {
    return apiData.map(item => {
      const dateObj = new Date(item.reportedAt);
      let priorityColor = "text-yellow-700 bg-yellow-50 border-yellow-200";
      
      if (item.severity?.toLowerCase() === 'high' || item.severity?.toLowerCase() === 'critical') {
         priorityColor = "text-red-700 bg-red-50 border-red-200";
      } else if (item.severity?.toLowerCase() === 'low') {
         priorityColor = "text-green-700 bg-green-50 border-green-200";
      }

      return {
        _id: item._id, 
        id: item.caseNo || "N/A", 
        priority: `${item.severity || 'Medium'} Priority`,
        time: getRelativeTime(item.reportedAt),
        date: dateObj.toLocaleDateString('en-GB'),
        exactTime: dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        location: item.address,
        type: item.fireType || "General Incident",
        severity: item.severity || "Medium",
        callerName: item.callerName || "Unknown Caller",
        callerPhone: item.callerPhone || "N/A",
        description: item.description || "No description provided.",
        status: item.status,
        priorityColor,
      };
    });
  };

  // --- FETCH CASES ---
  const fetchCases = async () => {
    setIsLoading(true);
    try {
      let res;
      if (mainTab === 'Fresh') {
          res = await FireStationAPI.GetFreshCases();
      } else {
          res = await FireStationAPI.GetOngoingCases();
      }
      if (res?.success) setCasesData(mapDataToUI(res.data || []));
    } catch (error) {
      console.error(`Error fetching ${mainTab} cases:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchCases(); }, [mainTab]);

  // ==========================================
  // FLOW 1: FRESH CASES (Assign Resources)
  // ==========================================
  const handleProceedToAssign = async () => {
    setModalStep('assignResources');
    setIsResourcesLoading(true);
    try {
      const [fleetRes, staffRes] = await Promise.all([
        FireStationAPI.GetFleetList(),
        FireStationAPI.GetStaffList()
      ]);
      if (fleetRes.success) setAvailableVans(fleetRes.data || []);
      if (staffRes.success) setAvailableStaff(staffRes.data || []);
    } catch (error) { alert("Failed to load Vehicles and Staff."); }
    finally { setIsResourcesLoading(false); }
  };

  const handleDispatchResources = async () => {
    if (selectedVehicles.length === 0 || selectedStaff.length === 0) return alert("Select at least 1 Vehicle and 1 Staff (Driver).");
    setIsProcessing(true);
    try {
      const payload = { 
          caseId: selectedCase._id, 
          staffIds: selectedStaff, 
          vehicleIds: selectedVehicles 
      };
      
      const res = await FireStationAPI.AssignResourcesToCase(payload);
      
      if (res.success) {
        setCasesData(prev => prev.filter(c => c._id !== selectedCase._id));
        closeModal();
        alert("Resources Assigned & Team Dispatched!");
      } else alert(res.message || "Failed to dispatch.");
    } catch (error) { alert("Error dispatching resources."); } 
    finally { setIsProcessing(false); }
  };

  // ==========================================
  // FLOW 2: ONGOING CASES (Update Status)
  // ==========================================
  const handleViewOngoingReport = async (incident) => {
      setSelectedCase(incident);
      setModalStep('updateStatus');
      setReportDetails(null); 
      setUpdateForm({ statusLabel: 'Under Control', situationReport: '', backupRequired: '', incidentImages: null });
      
      try {
          const res = await FireStationAPI.GetIncidentReport(incident._id);
          if(res.success) setReportDetails(res.data);
      } catch (error) {
          console.error("Error fetching report details");
      }
  };

  const handleUpdateStatusSubmit = async (e) => {
      e.preventDefault();
      setIsProcessing(true);
      try {
          const formData = new FormData();
          formData.append('statusLabel', updateForm.statusLabel);
          formData.append('situationReport', updateForm.situationReport);
          formData.append('backupRequired', updateForm.backupRequired);
          
          if(updateForm.incidentImages) {
              for(let i = 0; i < updateForm.incidentImages.length; i++){
                  formData.append('incidentImages', updateForm.incidentImages[i]);
              }
          }

          const res = await FireStationAPI.UpdateCaseStatus(selectedCase._id, formData);
          
          if(res.success) {
              alert("Status Updated Successfully!");
              if(updateForm.statusLabel === 'Closed') {
                  setCasesData(prev => prev.filter(c => c._id !== selectedCase._id));
              }
              closeModal();
          } else {
              alert(res.message || "Failed to update status.");
          }
      } catch (error) {
          alert("Error updating status.");
      } finally {
          setIsProcessing(false);
      }
  };

  // --- COMMON LOGIC ---
  const closeModal = () => {
      setSelectedCase(null);
      setSelectedVehicles([]);
      setSelectedStaff([]);
      setExpandedVanId(null);
  }

  const toggleVanSelection = (vanId) => {
    if (selectedVehicles.includes(vanId)) {
        setSelectedVehicles(selectedVehicles.filter(id => id !== vanId));
        setExpandedVanId(null);
    } else {
        setSelectedVehicles([vanId]); setExpandedVanId(vanId); 
    }
  }

  // ✅ NEW: Added Missing Staff Selection function
  const toggleStaffSelection = (staffId) => {
    if (selectedStaff.includes(staffId)) {
        setSelectedStaff(selectedStaff.filter(id => id !== staffId));
    } else {
        setSelectedStaff([...selectedStaff, staffId]);
    }
  }

  const filteredCases = casesData.filter(c => c.id.toLowerCase().includes(searchQuery.toLowerCase()) || c.location.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* --- TOP TABS & SEARCH --- */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex bg-gray-100 p-1 rounded-xl w-full sm:w-auto">
            {['Fresh', 'Ongoing'].map((tab) => (
              <button key={tab} onClick={() => setMainTab(tab)} className={`flex-1 sm:flex-none px-8 py-2.5 text-sm font-bold rounded-lg transition-all ${mainTab === tab ? 'bg-[#08B36A] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                {tab} Cases
              </button>
            ))}
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
            <input type="text" placeholder="Search ID, Location..." className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#08B36A] transition-colors" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </div>
      </div>

      {/* --- TABLE CONTENT --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
        {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 text-gray-400">
                <FaSpinner className="animate-spin text-4xl text-[#08B36A] mb-4"/>
                <p className="text-xs font-bold uppercase tracking-widest">Loading {mainTab} Cases...</p>
            </div>
        ) : filteredCases.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500 font-medium">
               <FaCheckCircle className="text-4xl text-green-100 mb-3" />
               No {mainTab} cases found.
            </div>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase font-semibold tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Incident ID</th>
                      <th className="px-6 py-4">Priority</th>
                      <th className="px-6 py-4">Reported Time</th>
                      <th className="px-6 py-4">Location</th>
                      <th className="px-6 py-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {filteredCases.map((incident) => (
                      <tr key={incident._id} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-6 py-4 font-bold text-gray-800">{incident.id}</td>
                        <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full border text-xs font-bold ${incident.priorityColor}`}>{incident.priority}</span></td>
                        <td className="px-6 py-4">
                          <p className="text-gray-800 font-medium">{incident.time}</p>
                          <p className="text-gray-500 text-xs">{incident.exactTime}</p>
                        </td>
                        <td className="px-6 py-4 text-gray-700 truncate max-w-[200px]">{incident.location}</td>
                        <td className="px-6 py-4 text-center">
                          {mainTab === 'Fresh' ? (
                              <button onClick={() => { setSelectedCase(incident); setModalStep('details'); }} className="text-[#08B36A] hover:bg-green-50 font-bold px-4 py-2 rounded-lg flex items-center justify-center gap-2 mx-auto border border-transparent hover:border-green-100 transition-colors">
                                <FaEye /> Review Case
                              </button>
                          ) : (
                              <button onClick={() => handleViewOngoingReport(incident)} className="text-indigo-600 hover:bg-indigo-50 font-bold px-4 py-2 rounded-lg flex items-center justify-center gap-2 mx-auto border border-transparent hover:border-indigo-100 transition-colors">
                                <FaEdit /> Update Status
                              </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            </div>
        )}
      </div>

      {/* ========================================================= */}
      {/*                     MASTER MODAL AREA                     */}
      {/* ========================================================= */}
      {selectedCase && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={closeModal}>
          <div className={`bg-white rounded-2xl shadow-2xl w-full flex flex-col max-h-[95vh] animate-in zoom-in-95 overflow-hidden ${modalStep === 'updateStatus' ? 'max-w-4xl' : 'max-w-md'}`} onClick={e => e.stopPropagation()}>
            
            {/* STEP 1: FRESH CASE - DETAILS */}
            {modalStep === 'details' && (
              <>
                <div className="flex justify-between items-center p-5 border-b border-gray-100">
                  <h2 className="text-xl font-bold text-gray-800">Incident Details</h2>
                  <button onClick={closeModal} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full"><FaTimes size={20}/></button>
                </div>
                <div className="p-6 overflow-y-auto space-y-6">
                   <div>
                    <span className={`text-xs px-2.5 py-1 rounded-full border ${selectedCase.priorityColor} font-semibold mb-2 inline-block`}>{selectedCase.priority}</span>
                    <p className="font-bold text-gray-800 text-lg mt-1">{selectedCase.id} - {selectedCase.type}</p>
                  </div>
                  <div className="flex items-start gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                     <FaMapMarkerAlt className="text-red-500 mt-1 shrink-0"/><span className="text-sm text-gray-700">{selectedCase.location}</span>
                  </div>
                  <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                     <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 shrink-0"><FaPhoneAlt size={14}/></div>
                     <div className="flex-1">
                       <p className="text-sm font-bold text-gray-800">{selectedCase.callerName}</p>
                       <p className="text-xs text-gray-500">{selectedCase.callerPhone}</p>
                     </div>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 text-sm text-gray-700 leading-relaxed">{selectedCase.description}</div>
                </div>
                <div className="p-4 border-t border-gray-100 bg-white">
                  <button onClick={handleProceedToAssign} className="w-full bg-[#08B36A] hover:bg-[#069356] text-white font-bold py-3.5 rounded-xl shadow-md transition-all">
                    Accept Case & Assign Resources
                  </button>
                </div>
              </>
            )}

            {/* STEP 2: FRESH CASE - ASSIGN VAN & DRIVER */}
            {modalStep === 'assignResources' && (
              <>
                <div className="flex items-center gap-3 p-4 border-b border-gray-100 bg-white">
                  <button onClick={() => setModalStep('details')} className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"><FaChevronLeft size={16}/></button>
                  <h2 className="text-lg font-bold text-gray-800">Assign Vehicle & Staff</h2>
                </div>
                <div className="p-4 overflow-y-auto bg-gray-50 space-y-4">
                  {isResourcesLoading ? <div className="text-center py-10"><FaSpinner className="animate-spin text-3xl text-[#08B36A] mx-auto"/></div> : 
                   availableVans.length === 0 ? <p className="text-center text-red-500 font-bold py-4">No Vehicles Available</p> : (
                    availableVans.map(van => {
                      const isSelected = selectedVehicles.includes(van._id);
                      const isExpanded = expandedVanId === van._id;
                      return (
                        <div key={van._id} className={`bg-white rounded-xl border-2 overflow-hidden shadow-sm transition-all ${isSelected ? 'border-[#08B36A]' : 'border-transparent'}`}>
                           <div className="p-4 flex gap-3 cursor-pointer" onClick={() => toggleVanSelection(van._id)}>
                              <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected?'border-[#08B36A]':'border-gray-300'}`}>
                                 {isSelected && <div className="w-2.5 h-2.5 bg-[#08B36A] rounded-full"></div>}
                              </div>
                              <div>
                                 <h4 className="font-bold text-gray-800 text-sm">{van.vehicleName}</h4>
                                 <p className="text-xs text-gray-500 mt-0.5">Type: {van.vehicleType} | Capacity: {van.pumpCapacity}</p>
                              </div>
                           </div>
                           
                           {isSelected && (
                             <div className="bg-green-50/50 border-t border-green-100">
                                <div className="flex items-center justify-between px-4 py-2.5 bg-green-50 cursor-pointer" onClick={() => setExpandedVanId(isExpanded ? null : van._id)}>
                                    <div className="flex items-center gap-2 text-[#08B36A] text-sm font-semibold"><FaUserShield /> Select Driver / Crew</div>
                                    {isExpanded ? <FaAngleUp className="text-[#08B36A]" /> : <FaAngleDown className="text-[#08B36A]" />}
                                </div>
                                {isExpanded && (
                                    <div className="p-4 space-y-3 max-h-48 overflow-y-auto custom-scrollbar">
                                      {availableStaff.length === 0 ? <p className="text-xs text-red-500">No staff available.</p> : 
                                        availableStaff.map(member => (
                                          // ✅ FIXED: Checkbox logic added here
                                          <label key={member._id} className="flex items-center gap-3 cursor-pointer group">
                                            <input 
                                              type="checkbox" 
                                              className="hidden" 
                                              checked={selectedStaff.includes(member._id)}
                                              onChange={() => toggleStaffSelection(member._id)}
                                            />
                                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedStaff.includes(member._id) ? 'bg-[#08B36A] border-[#08B36A]' : 'border-gray-400 bg-white group-hover:border-[#08B36A]'}`}>
                                               {selectedStaff.includes(member._id) && <FaCheckCircle size={10} className="text-white" />}
                                            </div>
                                            <span className="text-sm font-medium text-gray-700 flex-1">
                                               <span className="font-bold">{member.fullName}</span> <span className="text-xs text-gray-500 ml-1">({member.rank})</span>
                                            </span>
                                          </label>
                                      ))}
                                    </div>
                                )}
                             </div>
                           )}
                        </div>
                      )
                    })
                  )}
                </div>
                <div className="p-4 border-t border-gray-100 bg-white flex justify-end gap-3">
                    <button onClick={closeModal} className="px-5 py-2.5 font-bold text-gray-600 hover:bg-gray-100 rounded-xl">Cancel</button>
                    <button onClick={handleDispatchResources} disabled={isProcessing || selectedVehicles.length===0 || selectedStaff.length===0} className="px-6 py-2.5 bg-[#08B36A] text-white font-bold rounded-xl shadow-md disabled:opacity-50 flex items-center gap-2">
                       {isProcessing ? <><FaSpinner className="animate-spin"/> Dispatching...</> : 'Dispatch Team'}
                    </button>
                </div>
              </>
            )}

            {/* STEP 3: ONGOING CASE - VIEW & UPDATE STATUS */}
            {modalStep === 'updateStatus' && (
              <>
                <div className="flex justify-between items-center p-5 border-b border-indigo-100 bg-indigo-50/50">
                  <h2 className="text-xl font-bold text-indigo-900 flex items-center gap-2"><FaFireExtinguisher className="text-indigo-600"/> Ongoing Case Report</h2>
                  <button onClick={closeModal} className="text-indigo-400 hover:text-red-500 bg-white p-2 rounded-full shadow-sm"><FaTimes size={18}/></button>
                </div>
                <div className="flex flex-col md:flex-row h-full overflow-hidden">
                    {/* LEFT SIDE: FETCHED API DETAILS */}
                    <div className="md:w-1/2 p-6 bg-gray-50 border-r border-gray-200 overflow-y-auto">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Current Deployment Details</h3>
                        {!reportDetails ? (
                            <div className="flex flex-col items-center justify-center py-20"><FaSpinner className="animate-spin text-3xl text-indigo-500 mb-3"/><p className="text-xs text-gray-500 font-bold uppercase">Fetching Details...</p></div>
                        ) : (
                            <div className="space-y-6">
                                <div>
                                    <p className="text-xl font-black text-gray-800">{reportDetails.generalDetails?.incidentId}</p>
                                    <p className="text-sm font-bold text-indigo-600 mt-1">{reportDetails.generalDetails?.type}</p>
                                    <div className="flex items-start gap-2 mt-2 bg-white p-3 rounded-xl border border-gray-100">
                                        <FaMapMarkerAlt className="text-red-500 mt-0.5 shrink-0"/>
                                        <p className="text-sm text-gray-600">{reportDetails.generalDetails?.location}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
                                        <p className="text-xs text-gray-500 font-bold uppercase mb-1">Response Time</p>
                                        <p className="text-lg font-black text-gray-800">{reportDetails.generalDetails?.responseTime}</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
                                        <p className="text-xs text-gray-500 font-bold uppercase mb-1">Trucks Deployed</p>
                                        <p className="text-lg font-black text-gray-800">{reportDetails.resourcesUsed?.trucksAssigned}</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center col-span-2">
                                        <p className="text-xs text-gray-500 font-bold uppercase mb-1">Personnel on Scene</p>
                                        <p className="text-lg font-black text-indigo-600">{reportDetails.resourcesUsed?.personnel}</p>
                                    </div>
                                </div>
                                <div className="bg-white p-4 rounded-xl border border-gray-100">
                                    <p className="text-xs font-bold text-gray-500 uppercase mb-3">Equipment Used</p>
                                    <div className="flex flex-wrap gap-2">
                                        {reportDetails.resourcesUsed?.equipment?.map((eq, i) => (
                                            <span key={i} className="text-xs font-bold bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg border border-indigo-100">{eq}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    {/* RIGHT SIDE: UPDATE FORM (PUT API) */}
                    <div className="md:w-1/2 p-6 overflow-y-auto bg-white">
                        <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-4 flex items-center gap-2"><FaEdit/> Update Case Status</h3>
                        <form onSubmit={handleUpdateStatusSubmit} className="space-y-5">
                            <div>
                                <label className="text-sm font-bold text-gray-700 block mb-2">Status Label</label>
                                <select className="w-full border-2 border-gray-200 rounded-xl p-3 text-sm font-bold focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition-all" value={updateForm.statusLabel} onChange={e => setUpdateForm({...updateForm, statusLabel: e.target.value})}>
                                    <option value="Under Control">Under Control</option>
                                    <option value="Critical">Critical</option>
                                    <option value="Closed">Closed / Resolved</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-bold text-gray-700 block mb-2">Situation Report</label>
                                <textarea rows="4" required placeholder="Enter current situation, fire spread status, etc..." className="w-full border-2 border-gray-200 rounded-xl p-3 text-sm font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition-all resize-none" value={updateForm.situationReport} onChange={e => setUpdateForm({...updateForm, situationReport: e.target.value})}></textarea>
                            </div>
                            <div>
                                <label className="text-sm font-bold text-gray-700 block mb-2">Backup Required (Optional)</label>
                                <input type="text" placeholder="e.g. Ambulance, Extra Water Tanker" className="w-full border-2 border-gray-200 rounded-xl p-3 text-sm font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition-all" value={updateForm.backupRequired} onChange={e => setUpdateForm({...updateForm, backupRequired: e.target.value})} />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-gray-700 block mb-2">Upload Scene Images</label>
                                <div className="border-2 border-dashed border-indigo-200 bg-indigo-50/30 rounded-xl p-6 text-center cursor-pointer hover:bg-indigo-50 transition-colors">
                                    <input type="file" multiple accept="image/*" className="hidden" id="sceneUpload" onChange={e => setUpdateForm({...updateForm, incidentImages: e.target.files})} />
                                    <label htmlFor="sceneUpload" className="cursor-pointer text-indigo-600 font-bold text-sm flex flex-col items-center gap-3">
                                        <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center"><FaUpload size={20}/></div>
                                        {updateForm.incidentImages ? <span className="text-green-600">{updateForm.incidentImages.length} Image(s) selected</span> : 'Click to select photos'}
                                    </label>
                                </div>
                            </div>
                            <div className="pt-2">
                                <button type="submit" disabled={isProcessing} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-200 mt-4 flex items-center justify-center gap-2 disabled:opacity-50 transition-all active:scale-[0.98]">
                                    {isProcessing ? <><FaSpinner className="animate-spin"/> Processing...</> : 'Submit Final Update'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
              </>
            )}

          </div>
        </div>
      )}

    </div>
  )
}