'use client'
import React, { useState } from 'react'
import { 
  FaSearch, 
  FaEye, 
  FaShieldAlt, 
  FaMapMarkerAlt, 
  FaClock, 
  FaUserShield,
  FaFilter,
  FaFileExport, 
  FaTimes,
  FaHospital,
  FaUserInjured,
  FaExclamationTriangle,
  FaIdBadge,
  FaCheckCircle,
  FaFileMedical
} from 'react-icons/fa'

export default function FreshCasePage() {
  const [selectedCase, setSelectedCase] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);

  // Demo Officers Data
  const officers = [
    { id: "POL-101", name: "Inspector Vikram Singh", area: "Sector 74", status: "Available" },
    { id: "POL-105", name: "SI Rajesh Kumar", area: "Phase 7", status: "Available" },
    { id: "POL-112", name: "Officer Amit Verma", area: "Tdi City", status: "On Duty" },
  ];

  // Demo Fresh MLC Data with Photos
  const [freshCases] = useState([
    { 
      id: "MLC-88202501", 
      image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop",
      patient: "Nitish Sharma", 
      incidentType: "Road Accident", 
      time: "10:45 AM", 
      location: "Sector 74, Mohali", 
      hospital: "Radius Hospital",
      status: "New",
      age: "28",
      gender: "Male",
      reportedBy: "Dr. Aman Deep",
      contact: "+91 98765-43210"
    },
    { 
      id: "MLC-88202502", 
      image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=150&auto=format&fit=crop",
      patient: "Arjun Singh", 
      incidentType: "Physical Assault", 
      time: "11:20 AM", 
      location: "Tdi City, Mohali", 
      hospital: "City Care",
      status: "Emergency",
      age: "34",
      gender: "Male",
      reportedBy: "Dr. Sunita",
      contact: "+91 88722-11000"
    },
    { 
      id: "MLC-88202503", 
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop",
      patient: "Priya Verma", 
      incidentType: "Suspected Poisoning", 
      time: "12:05 PM", 
      location: "Phase 7, Mohali", 
      hospital: "Radius Hospital",
      status: "New",
      age: "24",
      gender: "Female",
      reportedBy: "Dr. Aman Deep",
      contact: "+91 98765-43210"
    }
  ]);

  const handleOpenDetails = (caseItem) => {
    setSelectedCase(caseItem);
    setIsModalOpen(true);
  };

  const handleOpenDeploy = (e, caseItem) => {
    e.stopPropagation(); 
    setSelectedCase(caseItem);
    setIsDeployModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Incoming MLC Reports</h1>
          <p className="text-slate-500 font-medium mt-1">Real-time Medico-Legal Cases from District Hospitals</p>
        </div>
        <div className="flex gap-3">
            <button className="bg-white border border-slate-200 text-slate-600 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 shadow-sm hover:bg-slate-50 transition-all">
                <FaFileExport /> Export Registry
            </button>
        </div>
      </div>

      {/* --- TOP COMPACT STATS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CompactStatCard title="Fresh Intake" count="12" label="New Today" color="blue" icon={<FaFileMedical/>} />
        <CompactStatCard title="Critical Alert" count="03" label="Immediate Action" color="red" icon={<FaExclamationTriangle/>} />
        <CompactStatCard title="Force Ready" count="08" label="Officers Online" color="emerald" icon={<FaUserShield/>} />
      </div>

      {/* --- TABLE SECTION --- */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        
        {/* Table Toolbar */}
        <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-4 bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-green-50 rounded-xl text-[#08B36A] shadow-inner"><FaShieldAlt /></div>
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Fresh Case Registry</h2>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-3.5" />
              <input 
                type="text" 
                placeholder="Search MLC No or Patient..." 
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#08B36A]/20 transition-all"
              />
            </div>
            <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-colors">
              <FaFilter size={14} />
            </button>
          </div>
        </div>

        {/* The Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.15em] border-y border-slate-50">
                <th className="px-8 py-4">Victim Photo</th>
                <th className="px-6 py-4">MLC Case No</th>
                <th className="px-6 py-4">Victim Info</th>
                <th className="px-6 py-4">Incident Type</th>
                <th className="px-6 py-4">Origin Hospital</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {freshCases.map((item) => (
                <tr 
                  key={item.id} 
                  onClick={() => handleOpenDetails(item)}
                  className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                >
                  <td className="px-8 py-5">
                    <img 
                      src={item.image} 
                      alt="Victim" 
                      className="w-10 h-10 rounded-lg object-cover border border-slate-100 shadow-sm"
                    />
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm font-black text-blue-600 hover:underline">{item.id}</span>
                  </td>
                  
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-700">{item.patient}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{item.gender}, {item.age}Y</span>
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <span className="px-3 py-1 bg-red-50 text-red-500 text-[9px] font-black rounded-lg uppercase tracking-widest">
                      {item.incidentType}
                    </span>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1 text-slate-500">
                      <div className="flex items-center gap-2 text-xs font-bold">
                        <FaHospital size={10} className="text-[#08B36A]" /> {item.hospital}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-medium">
                        <FaClock size={10} className="text-slate-300" /> {item.time}
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={(e) => handleOpenDeploy(e, item)}
                        className="bg-[#08B36A] text-white px-5 py-2 rounded-xl text-[10px] font-black flex items-center gap-2 shadow-lg shadow-green-100 hover:bg-[#07a25f] transition-all"
                      >
                        <FaUserShield size={12} /> DEPLOY
                      </button>
                      <button className="bg-white border border-slate-200 text-slate-500 px-3 py-2 rounded-xl text-[10px] font-black hover:border-slate-800 hover:text-slate-800 transition-all">
                        <FaEye />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- CASE DETAILS MODAL --- */}
      {isModalOpen && selectedCase && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
            <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-8 border-b border-slate-50 flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-red-50 text-red-500 rounded-2xl">
                            <FaShieldAlt size={24} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Case: {selectedCase.id}</h3>
                            <p className="text-red-500 font-bold text-[10px] uppercase tracking-[0.15em] mt-1 flex items-center gap-2">
                                <FaExclamationTriangle /> Urgent Intake Received
                            </p>
                        </div>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                        <FaTimes size={20} />
                    </button>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><FaUserInjured /> Victim Information</h4>
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex items-center gap-4">
                            <img src={selectedCase.image} alt="" className="w-16 h-16 rounded-xl object-cover border-2 border-white shadow-md" />
                            <div>
                                <p className="text-lg font-black text-slate-800">{selectedCase.patient}</p>
                                <p className="text-xs font-bold text-slate-500 mt-1">{selectedCase.gender}, {selectedCase.age} Years Old</p>
                            </div>
                        </div>
                        <InfoItem label="Incident Category" value={selectedCase.incidentType} color="text-red-500" />
                        <InfoItem label="Reported Arrival" value={selectedCase.time} />
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><FaHospital /> Registry Source</h4>
                        <InfoItem label="Reporting Hospital" value={selectedCase.hospital} />
                        <InfoItem label="Doctor In-Charge" value={selectedCase.reportedBy} />
                        <InfoItem label="Hospital Contact" value={selectedCase.contact} />
                        <InfoItem label="Occurrence Area" value={selectedCase.location} />
                    </div>
                </div>
                <div className="p-8 bg-slate-50 flex justify-end gap-3">
                    <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-slate-500 font-black text-[11px] uppercase tracking-widest">Close View</button>
                    <button onClick={() => { setIsModalOpen(false); setIsDeployModalOpen(true); }} className="bg-[#08B36A] text-white px-8 py-3 rounded-2xl text-[11px] font-black shadow-xl shadow-green-100 uppercase tracking-widest">Deploy Force</button>
                </div>
            </div>
        </div>
      )}

      {/* --- DEPLOY OFFICER MODAL --- */}
      {isDeployModalOpen && selectedCase && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsDeployModalOpen(false)}></div>
            <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-lg font-black text-slate-800">Dispatch Officer</h3>
                    <button onClick={() => setIsDeployModalOpen(false)} className="text-slate-300 hover:text-red-500"><FaTimes size={18} /></button>
                </div>
                <div className="p-6 space-y-4">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Select Available Units</p>
                    <div className="space-y-2">
                        {officers.map(officer => (
                            <div key={officer.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:border-[#08B36A] cursor-pointer group transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-[#08B36A] transition-colors shadow-sm"><FaIdBadge /></div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">{officer.name}</p>
                                        <p className="text-[10px] font-bold text-slate-400">{officer.id} • {officer.area}</p>
                                    </div>
                                </div>
                                <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-md ${officer.status === 'Available' ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-500'}`}>{officer.status}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="p-6 bg-slate-50 flex gap-3">
                    <button onClick={() => setIsDeployModalOpen(false)} className="flex-1 bg-white border border-slate-200 py-3 rounded-xl font-black text-[10px] text-slate-500 uppercase">Cancel</button>
                    <button onClick={() => setIsDeployModalOpen(false)} className="flex-1 bg-[#08B36A] py-3 rounded-xl font-black text-[10px] text-white shadow-lg shadow-green-100 uppercase tracking-widest flex items-center justify-center gap-2"><FaCheckCircle /> Confirm Dispatch</button>
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
        red: "text-red-600 bg-red-50 border-red-100",
        emerald: "text-emerald-600 bg-emerald-50 border-emerald-100"
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
                        <h2 className={`text-4xl font-black tracking-tight ${colors[color].split(' ')[0]}`}>{count}</h2>
                        <span className="text-[10px] font-bold text-slate-300 uppercase">{label}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

function InfoItem({ label, value, color = "text-slate-700" }) {
    return (
        <div>
            <p className="text-[9px] font-black text-slate-400 uppercase ml-1 mb-1">{label}</p>
            <div className="bg-white border border-slate-100 px-4 py-2.5 rounded-xl">
                <p className={`text-sm font-bold ${color}`}>{value}</p>
            </div>
        </div>
    )
}