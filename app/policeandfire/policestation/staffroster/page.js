'use client'
import React, { useState } from 'react'
import { 
  FaSearch, 
  FaUserShield, 
  FaMapMarkerAlt, 
  FaClock, 
  FaFilter,
  FaFileExport, 
  FaTimes,
  FaIdBadge,
  FaCheckCircle,
  FaCalendarTimes,
  FaPlaneDeparture,
  FaHospitalUser,
  FaBed,
  FaSun,
  FaMoon,
  FaExclamationCircle
} from 'react-icons/fa'

export default function StaffRosterPage() {
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Demo Roster Data with Leave and Duty Statuses
  const [roster] = useState([
    { 
      id: "BADGE-101", 
      name: "Inspector Vikram Singh", 
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop",
      shift: "Morning",
      shiftTime: "06:00 AM - 02:00 PM",
      status: "On Duty",
      assignment: "Sector 74 Patrol",
      notes: "Operating Vehicle P-01",
      leaveType: null
    },
    { 
      id: "BADGE-105", 
      name: "SI Rajesh Kumar", 
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop",
      shift: "None",
      shiftTime: "N/A",
      status: "On Leave",
      assignment: "Medical Leave",
      notes: "Recovery from surgery. Returns on 15th Aug.",
      leaveType: "Medical"
    },
    { 
      id: "BADGE-112", 
      name: "Officer Priya Verma", 
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop",
      shift: "Evening",
      shiftTime: "02:00 PM - 10:00 PM",
      status: "Off Duty",
      assignment: "Home Standby",
      notes: "Shift starts in 4 hours",
      leaveType: null
    },
    { 
      id: "BADGE-120", 
      name: "Officer Amit Verma", 
      image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=150&auto=format&fit=crop",
      shift: "Morning",
      shiftTime: "06:00 AM - 02:00 PM",
      status: "On Duty",
      assignment: "Hospital Security",
      notes: "Radius Hospital Main Gate",
      leaveType: null
    },
    { 
      id: "BADGE-125", 
      name: "Officer Suman Deep", 
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150&auto=format&fit=crop",
      shift: "None",
      shiftTime: "N/A",
      status: "On Leave",
      assignment: "Annual Vacation",
      notes: "Personal travel. Emergency contact provided.",
      leaveType: "Casual"
    }
  ]);

  const getStatusStyle = (status) => {
    switch(status) {
      case 'On Duty': return 'bg-green-50 text-green-600 border-green-100';
      case 'On Leave': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Off Duty': return 'bg-slate-50 text-slate-400 border-slate-100';
      default: return 'bg-red-50 text-red-600 border-red-100';
    }
  };

  const getStatusIcon = (status, type) => {
    if (status === 'On Duty') return <FaCheckCircle />;
    if (status === 'On Leave') {
        return type === 'Medical' ? <FaHospitalUser /> : <FaPlaneDeparture />;
    }
    return <FaBed />;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Staff Roster</h1>
          <p className="text-slate-500 font-medium mt-1">Manage duty shifts and personnel absences</p>
        </div>
        <div className="flex gap-3">
            <button className="bg-white border border-slate-200 text-slate-600 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 shadow-sm hover:bg-slate-50 transition-all">
                <FaCalendarTimes /> Leave Requests
            </button>
            <button className="bg-[#08B36A] text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-green-100 hover:bg-[#07a25f] transition-all">
                <FaFileExport /> Export Registry
            </button>
        </div>
      </div>

      {/* --- STATS SECTION --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <CompactStatCard title="Active Duty" count="12" label="On Field" color="emerald" icon={<FaUserShield/>} />
        <CompactStatCard title="On Leave" count="03" label="Absence" color="amber" icon={<FaPlaneDeparture/>} />
        <CompactStatCard title="Off Duty" count="08" label="Resting" color="slate" icon={<FaBed/>} />
        <CompactStatCard title="Available" count="05" label="Emergency" color="blue" icon={<FaExclamationCircle/>} />
      </div>

      {/* --- ROSTER TABLE --- */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        
        {/* Table Toolbar */}
        <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-4 bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-900 rounded-xl text-white shadow-inner"><FaIdBadge /></div>
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Deployment Log</h2>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-3.5" />
              <input 
                type="text" 
                placeholder="Search name, badge or status..." 
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#08B36A]/20 transition-all"
              />
            </div>
            <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-colors">
              <FaFilter size={14} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.15em] border-y border-slate-50">
                <th className="px-8 py-4">Officer Profile</th>
                <th className="px-6 py-4">Shift Details</th>
                <th className="px-6 py-4">Current Assignment / Leave Reason</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-8 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {roster.map((item) => (
                <tr 
                  key={item.id} 
                  className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                  onClick={() => { setSelectedStaff(item); setIsModalOpen(true); }}
                >
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <img src={item.image} alt="" className="w-10 h-10 rounded-xl object-cover border border-slate-100" />
                            <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                                item.status === 'On Duty' ? 'bg-green-500' : item.status === 'On Leave' ? 'bg-amber-500' : 'bg-slate-300'
                            }`}></div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-700">{item.name}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">{item.id}</span>
                        </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-5">
                    {item.status !== 'On Leave' ? (
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
                            {item.shift === 'Morning' ? <FaSun className="text-orange-400"/> : <FaMoon className="text-indigo-400"/>}
                            {item.shift}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 mt-0.5">{item.shiftTime}</span>
                        </div>
                    ) : (
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">N/A</span>
                    )}
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                        {item.status === 'On Leave' ? (
                            <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 rounded-lg">
                                <span className="text-[10px] font-black text-amber-600 uppercase italic">⚠️ {item.assignment}</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                <FaMapMarkerAlt className="text-red-400" size={12} /> {item.assignment}
                            </div>
                        )}
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <span className={`px-4 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest flex items-center gap-2 w-fit ${getStatusStyle(item.status)}`}>
                      {getStatusIcon(item.status, item.leaveType)}
                      {item.status}
                    </span>
                  </td>

                  <td className="px-8 py-5 text-right">
                    <button className="bg-white border border-slate-200 text-slate-400 px-3 py-1.5 rounded-lg text-[10px] font-black hover:border-slate-900 hover:text-slate-900 transition-all uppercase">
                        View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- STAFF DETAIL MODAL --- */}
      {isModalOpen && selectedStaff && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
            <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-8 border-b border-slate-50 flex justify-between items-start">
                    <div className="flex items-center gap-5">
                        <img src={selectedStaff.image} alt="" className="w-20 h-20 rounded-[1.5rem] object-cover border-4 border-white shadow-xl" />
                        <div>
                            <h3 className="text-2xl font-black text-slate-800 tracking-tight">{selectedStaff.name}</h3>
                            <div className={`mt-2 px-3 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest flex items-center gap-2 w-fit ${getStatusStyle(selectedStaff.status)}`}>
                                {getStatusIcon(selectedStaff.status, selectedStaff.leaveType)}
                                {selectedStaff.status}
                            </div>
                        </div>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                        <FaTimes size={20} />
                    </button>
                </div>
                
                <div className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <InfoItem label="Badge ID" value={selectedStaff.id} />
                        <InfoItem label="Shift Category" value={selectedStaff.shift} />
                    </div>
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Duty / Leave Remarks</p>
                        <p className="text-sm font-bold text-slate-700 leading-relaxed italic">
                            "{selectedStaff.notes}"
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <InfoItem label="Current Assignment" value={selectedStaff.assignment} icon={<FaMapMarkerAlt/>} />
                        <InfoItem label="Active Shift Time" value={selectedStaff.shiftTime} icon={<FaClock/>} />
                    </div>
                </div>

                <div className="p-8 bg-slate-50 flex justify-end gap-3">
                    <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-slate-500 font-black text-[11px] uppercase tracking-widest">Close Record</button>
                    <button className="bg-slate-900 text-white px-8 py-3 rounded-2xl text-[11px] font-black shadow-xl uppercase tracking-widest">Edit Assignment</button>
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
        amber: "text-amber-600 bg-amber-50 border-amber-100",
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
                        <h2 className={`text-3xl font-black tracking-tight ${colors[color].split(' ')[0]}`}>{count}</h2>
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
            <div className="bg-white border border-slate-100 px-4 py-3 rounded-xl">
                <p className={`text-[11px] font-bold ${color}`}>{value}</p>
            </div>
        </div>
    )
}