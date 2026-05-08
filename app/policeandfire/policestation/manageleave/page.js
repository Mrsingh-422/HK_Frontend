'use client'
import PoliceAPI from '@/app/services/PoliceAPI';
import React, { useState, useEffect } from 'react'
import { 
  FaCalendarCheck, 
  FaClock, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaUserTie, 
  FaSearch, 
  FaFilter,
  FaFileAlt,
  FaArrowLeft,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaUserShield
} from 'react-icons/fa'


export default function StationLeaveManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [selectedCase, setSelectedCase] = useState(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionText, setRejectionText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  // Real data state
  const [leaves, setLeaves] = useState([]);

  // --- FETCH DATA ---
  const fetchLeaves = async () => {
    try {
      setIsLoading(true);
      const res = await PoliceAPI.getStaffLeaves();
      if (res.success) {
        setLeaves(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch leaves:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  // --- HANDLERS ---
  const handleApprove = async (id) => {
    if(window.confirm("Approve this leave request?")) {
        try {
            const res = await PoliceAPI.updateLeaveStatus(id, { status: 'Approved' });
            if (res.success) {
                fetchLeaves(); // Refresh list
            }
        } catch (error) {
            alert("Failed to update status");
        }
    }
  };

  const handleOpenReject = (leave) => {
    setSelectedCase(leave); // Using selectedLeave state
    setSelectedLeave(leave);
    setIsRejectModalOpen(true);
  };

  const submitRejection = async () => {
    try {
        const res = await PoliceAPI.updateLeaveStatus(selectedLeave._id, { 
            status: 'Rejected', 
            rejectionReason: rejectionText 
        });
        if (res.success) {
            setIsRejectModalOpen(false);
            setRejectionText("");
            fetchLeaves(); // Refresh list
        }
    } catch (error) {
        alert("Failed to reject leave");
    }
  };

  const formatDate = (dateStr) => {
    return dateStr ? dateStr.split('T')[0] : "N/A";
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Staff Leave Registry</h1>
          <p className="text-slate-500 font-medium mt-1">Review and manage officer absence requests</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm hidden md:block">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Station Status</p>
            <p className="text-[#08B36A] font-bold text-xs uppercase">Total Requests: {leaves.length}</p>
        </div>
      </div>

      {/* --- STATS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CompactStatCard title="Pending Review" count={leaves.filter(l => l.status === 'Pending').length} label="New Requests" color="orange" icon={<FaClock/>} />
        <CompactStatCard title="Approved" count={leaves.filter(l => l.status === 'Approved').length} label="On Leave" color="emerald" icon={<FaCalendarCheck/>} />
        <CompactStatCard title="Rejected" count={leaves.filter(l => l.status === 'Rejected').length} label="History" color="blue" icon={<FaFileAlt/>} />
      </div>

      {/* --- TABLE SECTION --- */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-900 rounded-xl text-white shadow-inner"><FaUserShield /></div>
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Leave Applications</h2>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-3.5" />
              <input 
                type="text" 
                placeholder="Search by officer name..." 
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#08B36A]/20 transition-all"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.15em] border-y border-slate-50">
                <th className="px-8 py-4">Officer</th>
                <th className="px-6 py-4">Leave Info</th>
                <th className="px-6 py-4">Schedule</th>
                <th className="px-6 py-4">Reason</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Decisions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr><td colSpan="6" className="p-20 text-center text-xs font-black text-slate-300 uppercase animate-pulse">Syncing Leave Registry...</td></tr>
              ) : leaves.filter(l => l.staffId?.fullName.toLowerCase().includes(searchTerm.toLowerCase())).map((item) => (
                <tr key={item._id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-100 uppercase font-black text-xs">
                            {item.staffId?.fullName?.charAt(0) || "P"}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-700">{item.staffId?.fullName}</span>
                            <span className="text-[10px] font-bold text-[#08B36A] uppercase">{item.staffId?.rank} • {item.staffId?.badgeId}</span>
                        </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-500 uppercase">{item.leaveType}</span>
                        <span className="text-[10px] font-bold text-slate-400 italic">{item.duration}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col text-[11px] font-bold text-slate-500">
                        <span>{formatDate(item.startDate)}</span>
                        <span className="text-[9px] opacity-50 uppercase tracking-tighter">To {formatDate(item.endDate)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-xs text-slate-500 font-medium line-clamp-1 max-w-[150px]" title={item.reason}>{item.reason}</p>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                        item.status === 'Approved' ? 'bg-green-50 text-green-600' : 
                        item.status === 'Rejected' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-center gap-2">
                        {item.status === 'Pending' ? (
                            <>
                                <button 
                                    onClick={() => handleApprove(item._id)}
                                    className="p-2.5 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all"
                                    title="Approve"
                                >
                                    <FaCheckCircle size={14} />
                                </button>
                                <button 
                                    onClick={() => handleOpenReject(item)}
                                    className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all"
                                    title="Reject"
                                >
                                    <FaTimesCircle size={14} />
                                </button>
                            </>
                        ) : (
                            <span className="text-[10px] font-black text-slate-300 uppercase italic">Decision Logged</span>
                        )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!isLoading && leaves.length === 0 && (
             <div className="p-20 text-center text-slate-400 font-bold">No leave requests found.</div>
          )}
        </div>
      </div>

      {/* --- REJECTION MODAL --- */}
      {isRejectModalOpen && selectedLeave && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsRejectModalOpen(false)}></div>
            <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-red-50 text-red-600 rounded-2xl">
                            <FaTimesCircle size={20} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-800 tracking-tight">Reject Leave</h3>
                            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.15em] mt-1">Leave Decision Log</p>
                        </div>
                    </div>
                </div>

                <div className="p-8 space-y-4">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Applicant</p>
                        <p className="text-sm font-bold text-slate-700">{selectedLeave.staffId?.fullName}</p>
                    </div>
                    <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase ml-1 mb-1 block">Reason for Rejection</label>
                        <textarea 
                            value={rejectionText}
                            onChange={(e) => setRejectionText(e.target.value)}
                            placeholder="State the official reason for denial..."
                            rows="4"
                            className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-red-500/20"
                        ></textarea>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl text-red-600">
                        <FaExclamationTriangle size={12}/>
                        <p className="text-[10px] font-bold uppercase tracking-wider">This action cannot be undone.</p>
                    </div>
                </div>

                <div className="p-8 bg-slate-50 flex justify-end gap-3">
                    <button onClick={() => setIsRejectModalOpen(false)} className="px-6 py-3 text-slate-500 font-black text-[11px] uppercase tracking-widest">Cancel</button>
                    <button 
                        onClick={submitRejection}
                        disabled={!rejectionText}
                        className="bg-red-600 text-white px-8 py-3 rounded-2xl text-[11px] font-black shadow-xl shadow-red-100 uppercase tracking-widest disabled:opacity-50"
                    >
                        Confirm Rejection
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
        orange: "text-orange-600 bg-orange-50 border-orange-100"
    }
    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm group hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-5">
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