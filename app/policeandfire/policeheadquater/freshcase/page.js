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
  FaPhoneAlt,
  FaIdBadge
} from 'react-icons/fa'

export default function FreshCasePoliceTable() {
  const [selectedCase, setSelectedCase] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);

  // Mock Data for Officers (Demo Data)
  const officers = [
    { id: "POL-101", name: "Inspector Vikram Singh", area: "Sector 74", status: "Available" },
    { id: "POL-105", name: "SI Rajesh Kumar", area: "Phase 7", status: "Available" },
    { id: "POL-112", name: "Officer Amit Verma", area: "Tdi City", status: "On Duty" },
  ];

  // Mock Data
  const [freshCases] = useState([
    { 
      id: "MLC-88202501", 
      patient: "Nitish Sharma", 
      incidentType: "Road Accident", 
      time: "10:45 AM", 
      location: "Sector 74, Mohali", 
      hospital: "Radius Hospital",
      priority: "High",
      status: "New",
      age: "28",
      gender: "Male",
      reportedBy: "Dr. Aman Deep",
      contact: "+91 98765-43210"
    },
    { 
      id: "MLC-88202502", 
      patient: "Arjun Singh", 
      incidentType: "Assault", 
      time: "11:20 AM", 
      location: "Tdi City, Mohali", 
      hospital: "City Care",
      priority: "Critical",
      status: "Investigating",
      age: "34",
      gender: "Male",
      reportedBy: "Dr. Sunita",
      contact: "+91 88722-11000"
    },
    { 
      id: "MLC-88202503", 
      patient: "Priya Verma", 
      incidentType: "Suspected Poisoning", 
      time: "12:05 PM", 
      location: "Phase 7, Mohali", 
      hospital: "Radius Hospital",
      priority: "Medium",
      status: "New",
      age: "24",
      gender: "Female",
      reportedBy: "Dr. Aman Deep",
      contact: "+91 98765-43210"
    },
    { 
      id: "MLC-88202504", 
      patient: "Sohan Lal", 
      incidentType: "Industrial Injury", 
      time: "01:30 PM", 
      location: "Industrial Area, Phase 8", 
      hospital: "Fortis IT",
      priority: "Medium",
      status: "New",
      age: "45",
      gender: "Male",
      reportedBy: "Dr. Mike",
      contact: "+91 77665-55443"
    }
  ]);

  const handleOpenDetails = (caseItem) => {
    setSelectedCase(caseItem);
    setIsModalOpen(true);
  };

  const handleOpenDeploy = (e, caseItem) => {
    e.stopPropagation(); // Prevents row click from firing
    setSelectedCase(caseItem);
    setIsDeployModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* --- STATS SUMMARY (High Priority Removed) --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatMini label="Today's Fresh Cases" value="14" color="text-blue-600" />
        <StatMini label="Assigned Today" value="08" color="text-emerald-600" />
        <StatMini label="Pending Verification" value="06" color="text-orange-600" />
      </div>

      {/* --- TABLE CONTAINER --- */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        
        <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-4 bg-white">
          <div>
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-3">
              <span className="p-2 bg-green-50 rounded-lg text-[#08B36A]"><FaShieldAlt /></span>
              Fresh MLC Registry
            </h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Law Enforcement Access Only</p>
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
            <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-colors">
              <FaFileExport size={14} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.15em] border-y border-slate-50">
                <th className="px-6 py-4">MLC Case No</th>
                <th className="px-6 py-4">Victim / Patient</th>
                <th className="px-6 py-4">Incident Type</th>
                <th className="px-6 py-4">Time & Location</th>
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
                  <td className="px-6 py-5">
                    <span className="text-sm font-black text-blue-600 hover:underline">{item.id}</span>
                  </td>
                  
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-700">{item.patient}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{item.hospital}</span>
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <span className="px-3 py-1 bg-red-50 text-red-500 text-[10px] font-black rounded-lg uppercase tracking-wider">
                      {item.incidentType}
                    </span>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1 text-slate-500">
                      <div className="flex items-center gap-2 text-xs font-bold">
                        <FaClock size={10} className="text-[#08B36A]" /> {item.time}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-medium">
                        <FaMapMarkerAlt size={10} className="text-slate-300" /> {item.location}
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={(e) => handleOpenDeploy(e, item)}
                        className="bg-[#08B36A] text-white px-4 py-2 rounded-xl text-[11px] font-black flex items-center gap-2 shadow-lg shadow-green-100 hover:bg-[#07a25f] transition-all"
                      >
                        <FaUserShield size={12} /> DEPLOY
                      </button>
                      <button 
                        className="bg-white border border-slate-200 text-slate-500 px-3 py-2 rounded-xl text-[11px] font-black hover:border-slate-800 hover:text-slate-800 transition-all"
                      >
                        <FaEye />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-50 bg-slate-50/30 flex justify-between items-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Showing {freshCases.length} Fresh Reports</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 text-[10px] font-black text-slate-500 border border-slate-200 rounded-lg bg-white">Prev</button>
            <button className="px-3 py-1 text-[10px] font-black text-slate-500 border border-slate-200 rounded-lg bg-white">Next</button>
          </div>
        </div>
      </div>

      {/* --- CASE DETAILS MODAL --- */}
      {isModalOpen && selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
            <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-8 border-b border-slate-50 flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-red-50 text-red-500 rounded-2xl shadow-inner">
                            <FaShieldAlt size={24} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Case Details: {selectedCase.id}</h3>
                            <p className="text-red-500 font-bold text-[10px] uppercase tracking-[0.15em] mt-1 flex items-center gap-2">
                                <FaExclamationTriangle /> Urgent Investigation Required
                            </p>
                        </div>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                        <FaTimes size={20} />
                    </button>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <FaUserInjured /> Patient Information
                        </h4>
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                            <p className="text-lg font-black text-slate-800">{selectedCase.patient}</p>
                            <p className="text-xs font-bold text-slate-500 mt-1">{selectedCase.gender}, {selectedCase.age} Years Old</p>
                        </div>
                        <InfoItem label="Incident Type" value={selectedCase.incidentType} color="text-red-500" />
                        <InfoItem label="Time of Arrival" value={selectedCase.time} />
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <FaHospital /> Origin & Reporting
                        </h4>
                        <InfoItem label="Hospital Name" value={selectedCase.hospital} />
                        <InfoItem label="Reported By" value={selectedCase.reportedBy} />
                        <InfoItem label="Location of Incident" value={selectedCase.location} />
                        <InfoItem label="Hospital Contact" value={selectedCase.contact} />
                    </div>
                </div>
                <div className="p-8 bg-slate-50 flex justify-end gap-3">
                    <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-slate-500 font-black text-[11px] uppercase tracking-widest hover:text-slate-800">Close Registry</button>
                    <button onClick={() => { setIsModalOpen(false); setIsDeployModalOpen(true); }} className="bg-[#08B36A] text-white px-8 py-3 rounded-2xl text-[11px] font-black shadow-xl shadow-green-100 uppercase tracking-widest">Deploy Officer</button>
                </div>
            </div>
        </div>
      )}

      {/* --- DEPLOY OFFICER MODAL --- */}
      {isDeployModalOpen && selectedCase && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsDeployModalOpen(false)}></div>
            <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                    <h3 className="text-lg font-black text-slate-800">Deploy Officer for {selectedCase.id}</h3>
                    <button onClick={() => setIsDeployModalOpen(false)} className="text-slate-300 hover:text-red-500"><FaTimes size={18} /></button>
                </div>
                <div className="p-6 space-y-4">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Select Available Officer</p>
                    <div className="space-y-2">
                        {officers.map(officer => (
                            <div key={officer.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:border-[#08B36A] cursor-pointer group transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-[#08B36A] transition-colors"><FaIdBadge /></div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">{officer.name}</p>
                                        <p className="text-[10px] font-bold text-slate-400">{officer.id} • {officer.area}</p>
                                    </div>
                                </div>
                                <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${officer.status === 'Available' ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-500'}`}>{officer.status}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="p-6 bg-slate-50 flex gap-3">
                    <button onClick={() => setIsDeployModalOpen(false)} className="flex-1 bg-white border border-slate-200 py-3 rounded-xl font-black text-[11px] text-slate-500">CANCEL</button>
                    <button onClick={() => setIsDeployModalOpen(false)} className="flex-1 bg-[#08B36A] py-3 rounded-xl font-black text-[11px] text-white shadow-lg shadow-green-100">CONFIRM DEPLOYMENT</button>
                </div>
            </div>
        </div>
      )}
    </div>
  )
}

// Small helper component for mini stats
function StatMini({ label, value, color }) {
  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-xl font-black ${color}`}>{value}</p>
    </div>
  )
}

// Modal info field helper
function InfoItem({ label, value, color = "text-slate-700" }) {
    return (
        <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-1">{label}</p>
            <div className="bg-white border border-slate-100 px-4 py-2.5 rounded-xl">
                <p className={`text-sm font-bold ${color}`}>{value}</p>
            </div>
        </div>
    )
}