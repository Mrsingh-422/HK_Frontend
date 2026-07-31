'use client'
import React, { useState, useEffect } from 'react'
import { FaSearch, FaTimes, FaDownload, FaShareAlt, FaSpinner, FaFireExtinguisher, FaMapMarkerAlt, FaShieldAlt, FaCalendarAlt, FaCheckCircle, FaTools, FaExclamationTriangle, FaImage } from 'react-icons/fa'
import FireStationAPI from '@/app/services/FireStationAPI'
import { toast, Toaster } from 'react-hot-toast'
 
export default function IncidentHistoryPage() {
  const [activeTab, setActiveTab] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [historyCasesData, setHistoryCasesData] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCase, setSelectedCase] = useState(null)
  const [reportData, setReportData] = useState(null)
  const [reportLoading, setReportLoading] = useState(false)
  const [zoomedImage, setZoomedImage] = useState(null)
  const [stationInfo, setStationInfo] = useState(null);
 
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [historyRes, profileRes] = await Promise.all([
            FireStationAPI.GetCaseHistory(),
            FireStationAPI.getProfile()
        ]);
        if (historyRes.success) setHistoryCasesData(historyRes.data);
        if (profileRes.success) setStationInfo(profileRes.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false) }
    }
    fetchData()
  },[])
 
  const handleViewReport = async (incidentId, caseNo) => {
    setSelectedCase(caseNo);
    setReportLoading(true);
    setReportData(null);
    try {
      const response = await FireStationAPI.GetIncidentReport(incidentId)
      if (response.success) setReportData(response.data)
    } catch (err) { toast.error("Error loading report"); }
    finally { setReportLoading(false) }
  }
 
  const handleDownload = () => {
    if (!reportData) return;
    toast.success("Preparing Single-Page PDF...");
    setTimeout(() => { window.print(); }, 700);
  };
 
  const handleShare = async () => {
    if (!reportData) return;
    const shareText = `Fire Incident Report: ${reportData.generalDetails.incidentId}`;
    if (navigator.share) {
      try { await navigator.share({ title: 'Incident Report', text: shareText, url: window.location.href }); } catch (err) {}
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success("Link copied!");
    }
  };
 
  const filteredCases = historyCasesData.filter(c => {
    const matchesTab = activeTab === 'All' || (new Date(c.resolvedAt).getMonth() === new Date().getMonth() ? "This Month" : "Last Month") === activeTab;
    return matchesTab && (c.caseNo.toLowerCase().includes(searchQuery.toLowerCase()) || c.address.toLowerCase().includes(searchQuery.toLowerCase()))
  });
 
  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit' })
  }
 
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8">
      <Toaster position="top-right" containerClassName="no-print" />
     
      {/* --- Main UI Table (Hidden during Print) --- */}
      <div className="space-y-6 no-print">
        <div className="flex flex-col xl:flex-row justify-between gap-4 bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Incident Archives</h1>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search..." className="pl-11 pr-4 py-3 bg-gray-50 border rounded-2xl outline-none focus:ring-2 ring-green-100 w-full font-bold text-sm" onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <div className="flex bg-gray-100 p-1 rounded-2xl">
              {['All', 'This Month', 'Last Month'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`px-5 py-2 text-xs font-black uppercase rounded-xl transition-all ${activeTab === tab ? 'bg-[#08B36A] text-white shadow-md' : 'text-slate-400'}`}>{tab}</button>
              ))}
            </div>
          </div>
        </div>
 
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-gray-100 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                <tr><th className="px-8 py-5">Case Number</th><th className="px-8 py-5">Location</th><th className="px-8 py-5">Type</th><th className="px-8 py-5 text-right">Manifest</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan="4" className="p-20 text-center font-bold text-slate-300 uppercase tracking-widest text-xs">Loading...</td></tr>
                ) : filteredCases.map((item) => (
                  <tr key={item._id} onClick={() => handleViewReport(item._id, item.caseNo)} className="hover:bg-green-50/30 cursor-pointer transition-all">
                    <td className="px-8 py-6 font-black text-slate-800">{item.caseNo}</td>
                    <td className="px-8 py-6 text-sm font-bold text-slate-500 uppercase truncate max-w-xs">{item.address}</td>
                    <td className="px-8 py-6"><span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase">{item.fireType}</span></td>
                    <td className="px-8 py-6 text-right"><button className="text-[#08B36A] font-black text-xs uppercase tracking-widest">View Report</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
      </div>
 
      {/* --- ON-SCREEN MODAL --- */}
      {selectedCase && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-slate-900/60 no-print" onClick={() => setSelectedCase(null)}>
          <div className="bg-white rounded-[1.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-300" onClick={e => e.stopPropagation()}>
            <div className="bg-[#08B36A] px-6 py-4 text-white flex justify-between items-center">
              <h2 className="text-lg font-bold uppercase tracking-tight">Incident Report</h2>
              <div className="flex gap-4">
                <button onClick={handleDownload} className="hover:scale-110"><FaDownload size={18}/></button>
                <button onClick={() => setSelectedCase(null)} className="hover:scale-110"><FaTimes size={20}/></button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[75vh] space-y-8">
               {reportLoading ? (
                 <div className="py-24 text-center"><FaSpinner className="animate-spin text-4xl text-[#08B36A] mx-auto"/></div>
               ) : reportData && (
                    <div className="space-y-6">
                        <section className="space-y-4">
                            <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-widest border-b pb-2">General Details</h4>
                            <div className="space-y-3">
                                {[
                                    { l: 'Incident ID', v: reportData.generalDetails.incidentId },
                                    { l: 'Incident Type', v: reportData.generalDetails.type },
                                    { l: 'Location', v: reportData.generalDetails.location },
                                    { l: 'Reported Time', v: formatDateTime(reportData.generalDetails.reportedTime) },
                                    { l: 'Response Time', v: reportData.generalDetails.responseTime }
                                ].map((item, i) => (
                                    <div key={i} className="flex justify-between text-sm"><span className="text-slate-400">{item.l}</span><span className="text-slate-800 font-bold text-right">{item.v}</span></div>
                                ))}
                            </div>
                        </section>
                        <section className="space-y-4">
                            <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-widest border-b pb-2">Resources Used</h4>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between"><span className="text-slate-400">Trucks Assigned</span><span className="text-slate-800 font-bold">{reportData.resourcesUsed.trucksAssigned}</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">Personnel</span><span className="text-slate-800 font-bold">{reportData.resourcesUsed.personnel}</span></div>
                            </div>
                        </section>
                        <section className="space-y-4">
                            <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-widest border-b pb-2">Scene Evidence</h4>
                            <div className="flex gap-3 overflow-x-auto pb-2">
                                {reportData.scenePhotos?.map((p, i) => (
                                    <img key={i} src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${p.replace('public/', '')}`} onClick={() => setZoomedImage(`${process.env.NEXT_PUBLIC_BACKEND_URL}/${p.replace('public/', '')}`)} className="w-32 h-24 rounded-xl object-cover border cursor-zoom-in" />
                                ))}
                            </div>
                        </section>
                        <button onClick={handleShare} className="w-full py-4 bg-[#08B36A] text-white font-black rounded-2xl shadow-lg flex items-center justify-center gap-3 uppercase text-xs tracking-widest"><FaShareAlt /> Share Report</button>
                    </div>
               )}
            </div>
          </div>
        </div>
      )}
 
      {/* 🌟 PREMIUM SINGLE-PAGE PDF ENGINE 🌟 */}
      {reportData && (
        <div id="final-pdf-engine" className="hidden print:block bg-white p-0">
            {/* Header */}
            <div className="flex justify-between items-center border-b-[8px] border-[#08B36A] pb-6 mb-6">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-[#08B36A] rounded-[2rem] flex items-center justify-center text-white shadow-2xl">
                        <FaFireExtinguisher size={40} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">SMART FIRE <span className="text-[#08B36A]">SYSTEM</span></h1>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-2">Official Incident Clearance Manifest</p>
                    </div>
                </div>
                <div className="text-right border-l-2 border-slate-100 pl-6">
                    <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight leading-none">{stationInfo?.stationName}</h2>
                    <p className="text-xs font-black text-[#08B36A] uppercase tracking-widest mt-1">REG: {stationInfo?.stationCode}</p>
                    <p className="text-[9px] text-slate-400 font-bold lowercase">{stationInfo?.email}</p>
                </div>
            </div>
 
            {/* Banner */}
            <div className="bg-slate-900 text-white px-8 py-5 rounded-[1.5rem] flex justify-between items-center mb-8 shadow-lg">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">Resolution Certificate</span>
                <span className="text-xl font-black tracking-widest uppercase">{reportData.generalDetails.incidentId}</span>
            </div>
 
            {/* Data Grid */}
            <div className="grid grid-cols-2 gap-8 mb-8">
                <div className="space-y-6 text-left">
                    <div>
                        <h3 className="text-[10px] font-black text-[#08B36A] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <FaShieldAlt size={10}/> Primary Incident Data
                        </h3>
                        <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-4">
                            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                                <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Category</span>
                                <span className="text-xs font-black text-slate-900 uppercase">{reportData.generalDetails.type}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                                <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Closed Date</span>
                                <span className="text-xs font-black text-slate-900 uppercase">{new Date().toLocaleDateString('en-GB')}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Response</span>
                                <span className="text-xs font-black text-[#08B36A] uppercase">{reportData.generalDetails.responseTime}</span>
                            </div>
                        </div>
                    </div>
                   
                    <div className="p-6 bg-[#08B36A]/5 rounded-[2rem] border-2 border-dashed border-[#08B36A]/20">
                        <h3 className="text-[10px] font-black text-[#08B36A] uppercase tracking-[0.2em] mb-2 flex items-center gap-2"><FaMapMarkerAlt size={10}/> Incident Location</h3>
                        <p className="text-sm font-black text-slate-700 leading-relaxed uppercase">{reportData.generalDetails.location}</p>
                    </div>
                </div>
 
                <div className="space-y-6">
                    <div className="bg-slate-900 rounded-[2rem] p-6 text-white relative overflow-hidden shadow-lg">
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6 relative z-10">Resources Deployed</h3>
                        <div className="grid grid-cols-2 gap-6 relative z-10 text-center">
                            <div>
                                <p className="text-3xl font-black text-[#08B36A] leading-none mb-1">{reportData.resourcesUsed.trucksAssigned}</p>
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Engines</p>
                            </div>
                            <div>
                                <p className="text-3xl font-black text-white leading-none mb-1">{reportData.resourcesUsed.personnel.split(' ')[0]}</p>
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Crew</p>
                            </div>
                        </div>
                    </div>
 
                    <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Damage Assessment</h3>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-red-500 shadow-sm border border-red-50"><FaShieldAlt size={18}/></div>
                            <div>
                                <p className="text-lg font-black text-slate-800 uppercase leading-none mb-1">{reportData.damageImpact.damageLevel}</p>
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Final Severity Score</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
 
            {/* Evidence Section */}
            <div className="mt-4 px-2">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                    <FaImage className="text-[#08B36A]" size={12} /> Scene Photos Evidence
                </h3>
                <div className="grid grid-cols-4 gap-4">
                    {reportData.scenePhotos?.slice(0, 4).map((p, i) => (
                        <div key={i} className="h-28 rounded-[1.5rem] overflow-hidden border-[4px] border-slate-50 shadow-sm bg-slate-100">
                            <img src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${p.replace('public/', '')}`} className="w-full h-full object-cover" />
                        </div>
                    ))}
                </div>
            </div>
 
            {/* Footer Integrated here (No more 2nd page) */}
            <div className="mt-12 pt-6 border-t-2 border-slate-50 flex justify-between items-end px-4">
                <div className="text-center">
                    <div className="w-48 border-b-2 border-slate-900 mb-2 opacity-10"></div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-800 leading-none">Station Captain Signature</p>
                    <p className="text-[8px] text-slate-400 font-bold uppercase mt-1 tracking-widest">Authorized System Verifier</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Date of Issue</p>
                    <p className="text-sm font-black text-slate-800 uppercase tracking-tighter">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                </div>
            </div>
        </div>
      )}
 
      {/* Zoom Modal (No Print) */}
      {zoomedImage && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/95 p-6 no-print" onClick={() => setZoomedImage(null)}>
          <button className="absolute top-8 right-8 text-white text-3xl"><FaTimes /></button>
          <img src={zoomedImage} className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl border-4 border-white/10" />
        </div>
      )}
 
      <style jsx global>{`
        @media print {
          @page { size: A4; margin: 5mm; }
         
          header, nav, aside, footer, .topbar, .sidebar, .no-print, .Toaster {
            display: none !important;
          }
 
          #final-pdf-engine {
            display: block !important;
            visibility: visible !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 210mm !important;
            min-height: 297mm !important;
            padding: 10mm 15mm !important;
            background: white !important;
          }
 
          body { background: white !important; padding: 0 !important; margin: 0 !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>
    </div>
  )
}
 