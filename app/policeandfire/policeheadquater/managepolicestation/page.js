'use client'
import React, { useState } from 'react'
import { 
  FaSearch, 
  FaBuilding, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaFilter, 
  FaFileExport, 
  FaTimes, 
  FaMapMarkerAlt, 
  FaPhoneAlt, 
  FaUserShield,
  FaExclamationTriangle
} from 'react-icons/fa'

export default function PoliceStationTable() {
  const [stations, setStations] = useState([
    { id: "PS-101", name: "Phase 11 Police Station", area: "Sector 65, Mohali", inCharge: "SHO Vikram Singh", contact: "0172-221011", status: "Active" },
    { id: "PS-102", name: "Sohana Police Station", area: "Sector 70, Mohali", inCharge: "SHO Rajesh Kumar", contact: "0172-221055", status: "Active" },
    { id: "PS-103", name: "Mataur Police Station", area: "Sector 71, Mohali", inCharge: "SHO Amit Verma", contact: "0172-221077", status: "Active" },
    { id: "PS-104", name: "Phase 1 Police Station", area: "Industrial Area", inCharge: "SHO Sunita Devi", contact: "0172-221022", status: "Active" },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);
  const [mode, setMode] = useState('add'); // 'add' or 'edit'

  const handleOpenAdd = () => {
    setMode('add');
    setSelectedStation({ id: '', name: '', area: '', inCharge: '', contact: '', status: 'Active' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (station) => {
    setMode('edit');
    setSelectedStation(station);
    setIsModalOpen(true);
  };

  const handleOpenDelete = (station) => {
    setSelectedStation(station);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 p-6">
      
      {/* --- STATS SUMMARY --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatMini label="Total Registered Stations" value={stations.length} color="text-blue-600" />
        <StatMini label="Active Jurisdictions" value="12" color="text-emerald-600" />
        <StatMini label="Officers On-Duty" value="84" color="text-orange-600" />
      </div>

      {/* --- TABLE CONTAINER --- */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        
        <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-4 bg-white">
          <div>
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-3">
              <span className="p-2 bg-green-50 rounded-lg text-[#08B36A]"><FaBuilding /></span>
              Police Station Directory
            </h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Management & Administration</p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-3.5" />
              <input 
                type="text" 
                placeholder="Search Station or Area..." 
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#08B36A]/20 transition-all"
              />
            </div>
            <button 
                onClick={handleOpenAdd}
                className="bg-[#08B36A] text-white px-5 py-2.5 rounded-xl text-[11px] font-black flex items-center gap-2 shadow-lg shadow-green-100 hover:bg-[#07a25f] transition-all uppercase tracking-widest"
            >
              <FaPlus size={10} /> Add Station
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.15em] border-y border-slate-50">
                <th className="px-6 py-4">Station ID</th>
                <th className="px-6 py-4">Station Name</th>
                <th className="px-6 py-4">Jurisdiction / Area</th>
                <th className="px-6 py-4">SHO In-Charge</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {stations.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <span className="text-sm font-black text-blue-600">{item.id}</span>
                  </td>
                  
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-700">{item.name}</span>
                      <span className="text-[10px] font-bold text-[#08B36A] uppercase tracking-tighter">Status: {item.status}</span>
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                      <FaMapMarkerAlt size={10} className="text-slate-300" /> {item.area}
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                        <FaUserShield size={12} className="text-slate-400" /> {item.inCharge}
                    </div>
                  </td>

                  <td className="px-6 py-5 text-xs font-bold text-slate-500">
                    {item.contact}
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => handleOpenEdit(item)}
                        className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all"
                        title="Edit Station"
                      >
                        <FaEdit size={14} />
                      </button>
                      <button 
                        onClick={() => handleOpenDelete(item)}
                        className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all"
                        title="Delete Station"
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-50 bg-slate-50/30 flex justify-between items-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Jurisdictions: {stations.length}</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 text-[10px] font-black text-slate-500 border border-slate-200 rounded-lg bg-white">Prev</button>
            <button className="px-3 py-1 text-[10px] font-black text-slate-500 border border-slate-200 rounded-lg bg-white">Next</button>
          </div>
        </div>
      </div>

      {/* --- ADD / EDIT MODAL --- */}
      {isModalOpen && selectedStation && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
            <div className="relative bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-[#08B36A] text-white rounded-xl shadow-lg shadow-green-100">
                            <FaBuilding size={20} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-800 tracking-tight">
                                {mode === 'add' ? 'Register Station' : 'Edit Station Details'}
                            </h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Law Enforcement Administration</p>
                        </div>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                        <FaTimes size={20} />
                    </button>
                </div>
                <div className="p-8 space-y-5">
                    <div className="grid grid-cols-2 gap-5">
                        <div className="col-span-2">
                            <InputLabel label="Police Station Name" />
                            <input 
                                type="text" 
                                defaultValue={selectedStation.name}
                                placeholder="Enter full station name" 
                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#08B36A]/20 transition-all" 
                            />
                        </div>
                        <div>
                            <InputLabel label="Station ID" />
                            <input 
                                type="text" 
                                defaultValue={selectedStation.id}
                                placeholder="PS-XXXX" 
                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#08B36A]/20 transition-all" 
                            />
                        </div>
                        <div>
                            <InputLabel label="Jurisdiction Area" />
                            <input 
                                type="text" 
                                defaultValue={selectedStation.area}
                                placeholder="Sector / Phase" 
                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#08B36A]/20 transition-all" 
                            />
                        </div>
                        <div>
                            <InputLabel label="SHO / In-Charge" />
                            <input 
                                type="text" 
                                defaultValue={selectedStation.inCharge}
                                placeholder="Name of Officer" 
                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#08B36A]/20 transition-all" 
                            />
                        </div>
                        <div>
                            <InputLabel label="Contact Number" />
                            <input 
                                type="text" 
                                defaultValue={selectedStation.contact}
                                placeholder="Official Helpline" 
                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#08B36A]/20 transition-all" 
                            />
                        </div>
                    </div>
                </div>
                <div className="p-8 bg-slate-50 flex gap-4">
                    <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-slate-500 font-black text-[11px] uppercase tracking-widest hover:text-slate-800 bg-white border border-slate-200 rounded-2xl transition-all">Cancel</button>
                    <button onClick={() => setIsModalOpen(false)} className="flex-1 bg-[#08B36A] text-white py-4 rounded-2xl text-[11px] font-black shadow-xl shadow-green-100 uppercase tracking-widest hover:bg-[#07a25f] transition-all">
                        {mode === 'add' ? 'Confirm Registration' : 'Update Details'}
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* --- DELETE CONFIRMATION MODAL --- */}
      {isDeleteModalOpen && selectedStation && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsDeleteModalOpen(false)}></div>
            <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-8 text-center">
                    <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <FaExclamationTriangle size={30} />
                    </div>
                    <h3 className="text-xl font-black text-slate-800 mb-2">Delete Station?</h3>
                    <p className="text-sm font-bold text-slate-400">
                        Are you sure you want to remove <span className="text-slate-800">"{selectedStation.name}"</span>? 
                        This action cannot be undone.
                    </p>
                </div>
                <div className="p-8 bg-slate-50 flex gap-3">
                    <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-4 bg-white border border-slate-200 text-slate-500 font-black text-[11px] uppercase tracking-widest rounded-2xl hover:bg-slate-100 transition-all">No, Cancel</button>
                    <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 bg-red-500 text-white py-4 rounded-2xl text-[11px] font-black shadow-xl shadow-red-100 uppercase tracking-widest hover:bg-red-600 transition-all">Yes, Delete</button>
                </div>
            </div>
        </div>
      )}
    </div>
  )
}

// --- HELPER COMPONENTS ---

function StatMini({ label, value, color }) {
  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-xl font-black ${color}`}>{value}</p>
    </div>
  )
}

function InputLabel({ label }) {
    return (
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1 mb-2 block">
            {label}
        </label>
    )
}