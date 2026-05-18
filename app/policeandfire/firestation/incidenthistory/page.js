'use client'
import React, { useState, useEffect } from 'react'
import { FaSearch, FaTimes, FaDownload, FaShareAlt, FaSpinner } from 'react-icons/fa'
import  FireStationAPI  from '@/app/services/FireStationAPI' // Update import path

export default function IncidentHistoryPage() {
  const [activeTab, setActiveTab] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  
  // Table Data States
  const[historyCasesData, setHistoryCasesData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Modal Report States
  const[selectedCase, setSelectedCase] = useState(null) // Holds basic table row info
  const[reportData, setReportData] = useState(null) // Holds detailed API report data
  const [reportLoading, setReportLoading] = useState(false)

  // Fetch History Data from API (For Table)
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true)
        const response = await FireStationAPI.GetCaseHistory()
        
        if (response.success) {
          const now = new Date()
          const mappedData = response.data.map(item => {
            const resolvedDate = new Date(item.resolvedAt)
            
            let period = "Older"
            if (resolvedDate.getMonth() === now.getMonth() && resolvedDate.getFullYear() === now.getFullYear()) {
              period = "This Month"
            } else if (
              resolvedDate.getMonth() === now.getMonth() - 1 ||
              (now.getMonth() === 0 && resolvedDate.getMonth() === 11 && resolvedDate.getFullYear() === now.getFullYear() - 1)
            ) {
              period = "Last Month"
            }

            return {
              _id: item._id, // ID Needed for Report API Call
              id: item.caseNo || "N/A",
              status: "Resolved",
              location: item.address,
              type: item.fireType,
              closeDate: resolvedDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
              period: period
            }
          })
          setHistoryCasesData(mappedData)
        } else {
          setError("Failed to fetch history cases.")
        }
      } catch (err) {
        console.error("Error fetching cases:", err)
        setError("An error occurred while fetching case history.")
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  },[])

  // Action: Open Modal & Fetch Report Data
  const handleViewReport = async (incident) => {
    setSelectedCase(incident) // Open Modal
    setReportLoading(true)
    setReportData(null) // Reset old data
    
    try {
      const response = await FireStationAPI.GetIncidentReport(incident._id)
      if (response.success) {
        setReportData(response.data)
      }
    } catch (err) {
      console.error("Error fetching report details:", err)
    } finally {
      setReportLoading(false)
    }
  }

  // Filter Logic
  const filteredCases = historyCasesData.filter(c => {
    const matchesTab = activeTab === 'All' || c.period === activeTab
    const matchesSearch = c.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.location.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTab && matchesSearch
  })

  // Date Formatter Helper
  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit' })
  }

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-800">Incident History</h1>
            {!loading && (
              <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                {historyCasesData.length} Closed
              </span>
            )}
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full sm:w-72">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search Incident ID, location..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#08B36A]/20 focus:border-[#08B36A]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex bg-gray-100 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
            {['All', 'This Month', 'Last Month'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  activeTab === tab ? 'bg-[#08B36A] text-white shadow-sm' : 'text-gray-500 hover:bg-gray-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table Area */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto min-h-[300px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <FaSpinner className="animate-spin text-[#08B36A] text-3xl mb-4" />
              <p className="text-gray-500 font-medium">Loading History...</p>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64 text-red-500 font-medium">
              {error}
            </div>
          ) : filteredCases.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-gray-500 font-medium">
              No incidents found.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase font-semibold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Incident ID</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Close Date</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredCases.map((incident) => (
                  <tr 
                    key={incident._id}
                    onClick={() => handleViewReport(incident)}
                    className="cursor-pointer transition-colors hover:bg-gray-50 group"
                  >
                    <td className="px-6 py-4 font-semibold text-gray-800">{incident.id}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-green-200 text-green-700 bg-green-50 text-xs font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#08B36A]"></span>
                        {incident.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{incident.closeDate}</td>
                    <td className="px-6 py-4 text-gray-700 truncate max-w-[200px]">{incident.location}</td>
                    <td className="px-6 py-4 font-medium text-gray-700">{incident.type}</td>
                    <td className="px-6 py-4 text-center">
                      <button className="text-[#08B36A] font-semibold text-sm hover:underline">View Report</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* --- INCIDENT REPORT MODAL --- */}
      {selectedCase && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm bg-black/50" onClick={() => setSelectedCase(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div className="bg-[#08B36A] text-white flex items-center justify-between px-6 py-4">
              <h2 className="text-lg font-bold">Incident Report</h2>
              <div className="flex items-center gap-4">
                <button className="p-1 hover:bg-white/20 rounded-md transition-colors"><FaDownload size={18}/></button>
                <button onClick={() => setSelectedCase(null)} className="p-1 hover:bg-white/20 rounded-md transition-colors"><FaTimes size={18}/></button>
              </div>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 overflow-y-auto custom-scrollbar space-y-6 relative min-h-[400px]">
               
               {reportLoading || !reportData ? (
                  // LOADER STATE
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10">
                    <FaSpinner className="animate-spin text-[#08B36A] text-4xl mb-4" />
                    <p className="text-gray-500 font-medium">Loading details...</p>
                  </div>
               ) : (
                  // DATA LOADED STATE
                  <>
                    {/* Status Sub-header */}
                    <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-green-200 text-green-700 bg-green-50 text-xs font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#08B36A]"></span> Resolved
                        </span>
                        <span className="text-sm text-gray-500 font-medium">Closed: {selectedCase.closeDate}</span>
                    </div>

                    {/* General Details */}
                    <div>
                      <h3 className="text-sm font-bold text-gray-800 mb-3">General Details</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between border-b border-gray-50 pb-2"><span className="text-gray-500">Incident ID</span><span className="font-semibold text-gray-800">{reportData.generalDetails.incidentId}</span></div>
                        <div className="flex justify-between border-b border-gray-50 pb-2"><span className="text-gray-500">Incident Type</span><span className="font-medium text-gray-800">{reportData.generalDetails.type}</span></div>
                        <div className="flex justify-between border-b border-gray-50 pb-2"><span className="text-gray-500">Location</span><span className="font-medium text-gray-800 text-right max-w-[60%]">{reportData.generalDetails.location}</span></div>
                        <div className="flex justify-between border-b border-gray-50 pb-2"><span className="text-gray-500">Reported Time</span><span className="font-medium text-gray-800">{formatDateTime(reportData.generalDetails.reportedTime)}</span></div>
                        <div className="flex justify-between pb-1"><span className="text-gray-500">Response Time</span><span className="font-medium text-gray-800">{reportData.generalDetails.responseTime}</span></div>
                      </div>
                    </div>

                    {/* Resources Used */}
                    <div>
                      <h3 className="text-sm font-bold text-gray-800 mb-3">Resources Used</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between border-b border-gray-50 pb-2"><span className="text-gray-500">Trucks Assigned</span><span className="font-bold text-gray-800">{reportData.resourcesUsed.trucksAssigned}</span></div>
                        <div className="flex justify-between border-b border-gray-50 pb-2"><span className="text-gray-500">Personnel</span><span className="font-medium text-gray-800">{reportData.resourcesUsed.personnel}</span></div>
                        <div className="flex justify-between pb-1"><span className="text-gray-500">Equipment</span><span className="font-medium text-gray-800 text-right max-w-[60%]">
                          {reportData.resourcesUsed.equipment?.length > 0 ? reportData.resourcesUsed.equipment.join(', ') : "None"}
                        </span></div>
                      </div>
                    </div>

                    {/* Damage & Impact */}
                    <div>
                      <h3 className="text-sm font-bold text-gray-800 mb-3">Damage & Impact</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between border-b border-gray-50 pb-2"><span className="text-gray-500">Damage Level</span><span className="font-medium text-gray-800">{reportData.damageImpact.damageLevel}</span></div>
                        <div className="flex justify-between border-b border-gray-50 pb-2"><span className="text-gray-500">Injuries</span><span className="font-medium text-gray-800">{reportData.damageImpact.injuries}</span></div>
                        <div className="flex justify-between pb-1"><span className="text-gray-500">Casualties</span><span className="font-medium text-gray-800">{reportData.damageImpact.casualties}</span></div>
                      </div>
                    </div>

                    {/* Scene Photos */}
                    <div>
                      <h3 className="text-sm font-bold text-gray-800 mb-3">Scene Photos</h3>
                      <div className="flex gap-4 overflow-x-auto pb-2">
                         {reportData.scenePhotos?.length > 0 ? (
                           reportData.scenePhotos.map((photo, index) => {
                             // Clean the path to avoid duplicate slashes or missing public handling
                             const imagePath = photo.replace('public/', '');
                             return (
                               <div key={index} className="flex-shrink-0 w-32 h-24 bg-gray-200 rounded-xl overflow-hidden relative border border-gray-100">
                                 <img 
                                    src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${imagePath}`} 
                                    alt={`Scene ${index + 1}`} 
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.target.style.display='none'; e.target.parentElement.innerHTML = '<div class="absolute inset-0 bg-gray-100 flex items-center justify-center text-xs text-gray-500 text-center p-2">Image Not Found</div>' }}
                                 />
                               </div>
                             )
                           })
                         ) : (
                            <div className="w-full py-4 text-center text-gray-500 text-sm italic bg-gray-50 rounded-xl border border-dashed border-gray-300">
                               No photos available
                            </div>
                         )}
                      </div>
                    </div>
                  </>
               )}
            </div>

            {/* Footer Action */}
            <div className="p-4 border-t border-gray-100 bg-white">
               <button className="w-full py-3 rounded-xl bg-[#08B36A] text-white font-bold text-sm hover:bg-[#069356] disabled:bg-gray-400 transition-colors flex justify-center items-center gap-2" disabled={reportLoading}>
                 <FaShareAlt/> Share Report
               </button>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}