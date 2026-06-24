'use client'
import React, { useState, useEffect } from 'react'
import { 
  FaSearch, 
  FaFilter,
  FaFileExport, 
  FaTimes,
  FaIdBadge,
  FaCheckCircle,
  FaCalendarTimes,
  FaPlaneDeparture,
  FaSun,
  FaTimesCircle,
  FaHistory,
  FaClock
} from 'react-icons/fa'
import PoliceAPI from '@/app/services/PoliceAPI' // 👈 Apna path check kar lijiye

export default function RosterHistoryPage() {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch History from API
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await PoliceAPI.getRosterHistory(); // Aapki Nayi API
      if (response.success) {
        setHistoryData(response.data);
      }
    } catch (error) {
      console.error("Error fetching roster history:", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper: Close Modal
  const closeModal = () => {
      setIsModalOpen(false);
      setSelectedRequest(null);
  };

  // Helper: Get Initials for Avatar
  const getInitials = (name) => {
    if (!name) return "UN";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  // Helper: Format Date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Helper: Status Styling
  const getStatusStyle = (status) => {
    if (status === 'Approved') return 'bg-green-50 text-green-600 border-green-100';
    if (status === 'Rejected') return 'bg-red-50 text-red-600 border-red-100';
    return 'bg-slate-50 text-slate-400 border-slate-100';
  };

  const getStatusIcon = (status) => {
    if (status === 'Approved') return <FaCheckCircle />;
    if (status === 'Rejected') return <FaTimesCircle />;
    return <FaClock />;
  };

  // Stats Calculation
  const totalRequests = historyData.length;
  const approvedCount = historyData.filter(r => r.status === 'Approved').length;
  const rejectedCount = historyData.filter(r => r.status === 'Rejected').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Roster History</h1>
          <p className="text-slate-500 font-medium mt-1">Log of all processed leave and shift requests</p>
        </div>
        <div className="flex gap-3">
            <button className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg hover:bg-slate-800 transition-all">
                <FaFileExport /> Export History
            </button>
        </div>
      </div>

      {/* --- STATS SECTION --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CompactStatCard title="Total Processed" count={totalRequests} label="All Time" color="blue" icon={<FaHistory/>} />
        <CompactStatCard title="Approved Requests" count={approvedCount} label="Accepted" color="emerald" icon={<FaCheckCircle/>} />
        <CompactStatCard title="Rejected Requests" count={rejectedCount} label="Denied" color="red" icon={<FaTimesCircle/>} />
      </div>

      {/* --- HISTORY TABLE --- */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        
        {/* Table Toolbar */}
        <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-4 bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-900 rounded-xl text-white shadow-inner"><FaIdBadge /></div>
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Processed Requests Log</h2>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-3.5" />
              <input 
                type="text" 
                placeholder="Search history..." 
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#08B36A]/20 transition-all"
              />
            </div>
            <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-colors">
              <FaFilter size={14} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
             <div className="p-10 flex flex-col items-center justify-center text-slate-400 font-bold">
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#08B36A] mb-3"></div>
                 Loading History...
             </div>
          ) : historyData.length === 0 ? (
             <div className="p-10 text-center font-bold text-slate-400">No processed history found.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.15em] border-y border-slate-50">
                  <th className="px-8 py-4">Officer Profile</th>
                  <th className="px-6 py-4">Request Type & Dates</th>
                  <th className="px-6 py-4">Reason / Shift Info</th>
                  <th className="px-6 py-4">Final Status</th>
                  <th className="px-8 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {historyData.map((item) => (
                  <tr 
                    key={item._id} 
                    className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                    onClick={() => { setSelectedRequest(item); setIsModalOpen(true); }}
                  >
                    {/* 1. PROFILE WITH INITIALS */}
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                          <div className="relative">
                              {item.staffId?.profileImage ? (
                                  <img 
                                    src={item.staffId.profileImage} 
                                    alt="avatar" 
                                    className="w-10 h-10 rounded-xl object-cover border border-slate-100" 
                                  />
                              ) : (
                                  <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-600 flex items-center justify-center font-black text-sm border border-slate-300">
                                      {getInitials(item.staffId?.fullName)}
                                  </div>
                              )}
                              <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                                  item.status === 'Approved' ? 'bg-green-500' : 'bg-red-500'
                              }`}></div>
                          </div>
                          <div className="flex flex-col">
                              <span className="text-sm font-bold text-slate-700">{item.staffId?.fullName}</span>
                              <span className="text-[10px] font-bold text-slate-400 uppercase">{item.staffId?.badgeId} • {item.staffId?.rank}</span>
                          </div>
                      </div>
                    </td>
                    
                    {/* 2. TIMELINE */}
                    <td className="px-6 py-5">
                      {item.requestType === 'Shift Change' ? (
                          <div className="flex flex-col">
                              <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
                                <FaSun className="text-orange-400"/> Shift Change
                              </span>
                              <span className="text-[10px] font-bold text-slate-400 mt-0.5">
                                {formatDate(item.startDate)}
                              </span>
                          </div>
                      ) : (
                          <div className="flex flex-col">
                              <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
                                <FaPlaneDeparture className="text-indigo-400"/> Leave ({item.duration})
                              </span>
                              <span className="text-[10px] font-bold text-slate-400 mt-0.5">
                                {formatDate(item.startDate)} to {formatDate(item.endDate)}
                              </span>
                          </div>
                      )}
                    </td>

                    {/* 3. REASON / SHIFT UPDATE */}
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                          <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">{item.leaveType}</span>
                          <span className="text-xs font-medium text-slate-500 truncate max-w-[200px] mt-1">{item.reason}</span>
                      </div>
                    </td>

                    {/* 4. STATUS */}
                    <td className="px-6 py-5">
                      <span className={`px-4 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest flex items-center gap-2 w-fit ${getStatusStyle(item.status)}`}>
                        {getStatusIcon(item.status)}
                        {item.status}
                      </span>
                    </td>

                    {/* 5. ACTIONS */}
                    <td className="px-8 py-5 text-right">
                      <button className="bg-white border border-slate-200 text-slate-400 px-3 py-1.5 rounded-lg text-[10px] font-black hover:border-slate-900 hover:text-slate-900 transition-all uppercase shadow-sm">
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

      {/* --- HISTORY DETAIL MODAL (Read Only) --- */}
      {isModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={closeModal}></div>
            <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                
                {/* Modal Header */}
                <div className="p-8 border-b border-slate-50 flex justify-between items-start shrink-0">
                    <div className="flex items-center gap-5">
                        {selectedRequest.staffId?.profileImage ? (
                            <img 
                                src={selectedRequest.staffId.profileImage} 
                                alt="" 
                                className="w-20 h-20 rounded-[1.5rem] object-cover border-4 border-white shadow-xl" 
                            />
                        ) : (
                            <div className="w-20 h-20 rounded-[1.5rem] bg-slate-200 text-slate-600 flex items-center justify-center font-black text-3xl border-4 border-white shadow-xl">
                                {getInitials(selectedRequest.staffId?.fullName)}
                            </div>
                        )}
                        <div>
                            <h3 className="text-2xl font-black text-slate-800 tracking-tight">{selectedRequest.staffId?.fullName}</h3>
                            <div className={`mt-2 px-3 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest flex items-center gap-2 w-fit ${getStatusStyle(selectedRequest.status)}`}>
                                {getStatusIcon(selectedRequest.status)}
                                {selectedRequest.status}
                            </div>
                        </div>
                    </div>
                    <button onClick={closeModal} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                        <FaTimes size={20} />
                    </button>
                </div>
                
                {/* Modal Body */}
                <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                    <div className="grid grid-cols-2 gap-4">
                        <InfoItem label="Badge ID" value={selectedRequest.staffId?.badgeId} />
                        <InfoItem label="Request Type" value={selectedRequest.requestType} />
                    </div>

                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Original Request Reason</p>
                        <p className="text-sm font-bold text-slate-700 leading-relaxed italic">
                            "{selectedRequest.reason}"
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <InfoItem 
                            label="Dates / Timeline" 
                            value={`${formatDate(selectedRequest.startDate)} - ${formatDate(selectedRequest.endDate)} (${selectedRequest.duration})`} 
                            icon={<FaCalendarTimes/>} 
                        />
                        {selectedRequest.requestType === 'Shift Change' && (
                            <InfoItem 
                                label="Requested Shift" 
                                value={`${selectedRequest.shiftDetails?.fromShift || 'Any'} ➔ ${selectedRequest.shiftDetails?.toShift || 'Any'}`} 
                                icon={<FaClock/>} 
                            />
                        )}
                    </div>

                    {/* DYNAMIC SHOW: REJECTION REASON (If Rejected) */}
                    {selectedRequest.status === 'Rejected' && (
                        <div className="bg-red-50 p-5 rounded-2xl border border-red-100 mt-4">
                            <p className="text-[9px] font-black text-red-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                                <FaTimesCircle /> Official Rejection Reason
                            </p>
                            <p className="text-sm font-bold text-red-700 leading-relaxed italic">
                                "{selectedRequest.rejectionReason || 'No official reason provided.'}"
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer (Read Only) */}
                <div className="p-6 bg-slate-50 border-t border-slate-100 shrink-0 flex justify-end">
                    <button onClick={closeModal} className="bg-slate-900 text-white px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg hover:bg-slate-800 transition-colors">
                        Close Record
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
        emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
        red: "text-red-600 bg-red-50 border-red-100",
        slate: "text-slate-600 bg-slate-50 border-slate-100"
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
                        <h2 className={`text-3xl font-black tracking-tight ${colors[color].split(' ')[0]}`}>{count < 10 ? `0${count}` : count}</h2>
                        <span className="text-[10px] font-bold text-slate-300 uppercase">{label}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

function InfoItem({ label, value, icon, color = "text-slate-700" }) {
    return (
        <div>
            <p className="text-[9px] font-black text-slate-400 uppercase ml-1 mb-1 flex items-center gap-1">
                {icon && React.cloneElement(icon, {size: 10})} {label}
            </p>
            <div className="bg-white border border-slate-100 px-4 py-3 rounded-xl shadow-sm">
                <p className={`text-[11px] font-bold ${color}`}>{value}</p>
            </div>
        </div>
    )
}