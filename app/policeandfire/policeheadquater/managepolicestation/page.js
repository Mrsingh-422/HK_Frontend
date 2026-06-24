'use client'
import PoliceAPI from '@/app/services/PoliceAPI';
import React, { useState, useEffect } from 'react'

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
  FaExclamationTriangle,
  FaEnvelope,
  FaLock
} from 'react-icons/fa'

export default function PoliceStationTable() {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);
  const [mode, setMode] = useState('add'); // 'add' or 'edit'

  // Form State
  const [formData, setFormData] = useState({
    stationName: '',
    stationCode: '',
    shoName: '',
    jurisdictionArea: '',
    email: '',
    phone: '',
    address: '',
    password: '' 
  });

  // --- 1. FETCH ALL STATIONS ---
  const fetchStations = async () => {
    try {
      setLoading(true);
      const response = await PoliceAPI.getAllPoliceStations();
      if (response.success) {
        setStations(response.data);
      }
    } catch (error) {
      console.error("Error fetching stations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStations();
  }, []);

  // --- 2. ADD STATION ---
  const handleConfirmRegistration = async () => {
    setIsSubmitting(true);
    try {
      const response = await PoliceAPI.addPoliceStation(formData);
      if (response.success) {
        await fetchStations();
        setIsModalOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error("Error adding station:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- 3. UPDATE STATION ---
  const handleUpdateStation = async () => {
    setIsSubmitting(true);
    try {
      // Calling router.put('/stations/:id')
      const response = await PoliceAPI.updatePoliceStation(selectedStation._id, formData);
      if (response.success) {
        await fetchStations();
        setIsModalOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error("Error updating station:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- 4. DELETE STATION ---
  const handleConfirmDelete = async () => {
    setIsSubmitting(true);
    try {
      // Calling router.delete('/stations/:id')
      const response = await PoliceAPI.deletePoliceStation(selectedStation._id);
      if (response.success) {
        await fetchStations();
        setIsDeleteModalOpen(false);
      }
    } catch (error) {
      console.error("Error deleting station:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
        stationName: '', stationCode: '', shoName: '', 
        jurisdictionArea: '', email: '', phone: '', 
        address: '', password: ''
    });
  };

  // --- FILTERED DATA ---
  const filteredStations = stations.filter(station => 
    station.stationName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    station.stationCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    station.shoName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenAdd = () => {
    setMode('add');
    resetForm();
    setSelectedStation({}); 
    setIsModalOpen(true);
  };

  const handleOpenEdit = (station) => {
    setMode('edit');
    setFormData({
        stationName: station.stationName,
        stationCode: station.stationCode,
        shoName: station.shoName,
        jurisdictionArea: station.jurisdictionArea || '',
        email: station.email,
        phone: station.phone,
        address: station.address || '',
        password: '' // Password usually not updated here
    });
    setSelectedStation(station);
    setIsModalOpen(true);
  };

  const handleOpenDelete = (station) => {
    setSelectedStation(station);
    setIsDeleteModalOpen(true);
  };

  if (loading) return <div className="p-10 text-center font-black text-slate-400 animate-pulse tracking-widest uppercase">Initializing Directory...</div>

  return (
    <div className="space-y-6 p-6">
      
      {/* --- STATS SUMMARY --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatMini label="Total Registered Stations" value={stations.length} color="text-blue-600" />
        <StatMini label="Active Jurisdictions" value={stations.filter(s => s.isActive).length} color="text-emerald-600" />
        <StatMini label="HQ Connected" value="Online" color="text-orange-600" />
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
                placeholder="Search Station or Code..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
                <th className="px-6 py-4">Station Code</th>
                <th className="px-6 py-4">Station Name</th>
                <th className="px-6 py-4">Jurisdiction</th>
                <th className="px-6 py-4">SHO In-Charge</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredStations.map((item) => (
                <tr key={item._id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <span className="text-sm font-black text-blue-600">{item.stationCode}</span>
                  </td>
                  
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-700">{item.stationName}</span>
                      <span className={`text-[10px] font-bold uppercase tracking-tighter ${item.isActive ? 'text-[#08B36A]' : 'text-red-400'}`}>
                        {item.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 max-w-[180px] truncate">
                      <FaMapMarkerAlt size={10} className="text-slate-300" /> {item.jurisdictionArea || 'N/A'}
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                        <FaUserShield size={12} className="text-slate-400" /> {item.shoName}
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-500 flex items-center gap-1"><FaPhoneAlt size={8}/> {item.phone}</span>
                      <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1"><FaEnvelope size={8}/> {item.email}</span>
                    </div>
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
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Showing {filteredStations.length} Jurisdictions</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 text-[10px] font-black text-slate-500 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 transition-colors">Prev</button>
            <button className="px-3 py-1 text-[10px] font-black text-slate-500 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 transition-colors">Next</button>
          </div>
        </div>
      </div>

      {/* --- ADD / EDIT MODAL --- */}
      {isModalOpen && (
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
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Management Credentials</p>
                        </div>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                        <FaTimes size={20} />
                    </button>
                </div>
                
                <div className="p-8 space-y-5 max-h-[60vh] overflow-y-auto">
                    <div className="grid grid-cols-2 gap-5">
                        <div className="col-span-2">
                            <InputLabel label="Police Station Name" />
                            <input 
                                type="text" 
                                value={formData.stationName}
                                onChange={(e) => setFormData({...formData, stationName: e.target.value})}
                                placeholder="e.g., Central Police HQ" 
                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#08B36A]/20 transition-all" 
                            />
                        </div>
                        <div>
                            <InputLabel label="Station Code" />
                            <input 
                                type="text" 
                                value={formData.stationCode}
                                onChange={(e) => setFormData({...formData, stationCode: e.target.value})}
                                placeholder="PS-MHL-101" 
                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#08B36A]/20 transition-all" 
                            />
                        </div>
                        <div>
                            <InputLabel label="SHO In-Charge" />
                            <input 
                                type="text" 
                                value={formData.shoName}
                                onChange={(e) => setFormData({...formData, shoName: e.target.value})}
                                placeholder="Officer Name" 
                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#08B36A]/20 transition-all" 
                            />
                        </div>
                        <div className="col-span-2">
                            <InputLabel label="Jurisdiction Area" />
                            <input 
                                type="text" 
                                value={formData.jurisdictionArea}
                                onChange={(e) => setFormData({...formData, jurisdictionArea: e.target.value})}
                                placeholder="Sector 74, TDI City..." 
                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#08B36A]/20 transition-all" 
                            />
                        </div>
                        <div>
                            <InputLabel label="Official Email" />
                            <input 
                                type="email" 
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                placeholder="station@punjabpolice.gov.in" 
                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#08B36A]/20 transition-all" 
                            />
                        </div>
                        <div>
                            <InputLabel label="Contact Number" />
                            <input 
                                type="text" 
                                value={formData.phone}
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                placeholder="Helpline Number" 
                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#08B36A]/20 transition-all" 
                            />
                        </div>

                        {mode === 'add' && (
                        <div className="col-span-2">
                            <InputLabel label="System Password" />
                            <div className="relative">
                                <FaLock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                                <input 
                                    type="password" 
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    placeholder="••••••••" 
                                    className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#08B36A]/20 transition-all" 
                                />
                            </div>
                        </div>
                        )}

                        <div className="col-span-2">
                            <InputLabel label="Station Address" />
                            <textarea 
                                value={formData.address}
                                onChange={(e) => setFormData({...formData, address: e.target.value})}
                                placeholder="Full physical address" 
                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#08B36A]/20 transition-all h-20 resize-none" 
                            />
                        </div>
                    </div>
                </div>

                <div className="p-8 bg-slate-50 flex gap-4">
                    <button 
                        onClick={() => setIsModalOpen(false)} 
                        disabled={isSubmitting}
                        className="flex-1 py-4 text-slate-500 font-black text-[11px] uppercase tracking-widest hover:text-slate-800 bg-white border border-slate-200 rounded-2xl transition-all"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={mode === 'add' ? handleConfirmRegistration : handleUpdateStation} 
                        disabled={isSubmitting}
                        className="flex-1 bg-[#08B36A] text-white py-4 rounded-2xl text-[11px] font-black shadow-xl shadow-green-100 uppercase tracking-widest hover:bg-[#07a25f] transition-all disabled:opacity-50"
                    >
                        {isSubmitting ? 'Processing...' : mode === 'add' ? 'Confirm Registration' : 'Update Details'}
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* --- DELETE CONFIRMATION MODAL --- */}
      {isDeleteModalOpen && selectedStation && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsDeleteModalOpen(false)}></div>
            <div className="relative bg-white w-full max-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-8 text-center">
                    <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <FaExclamationTriangle size={30} />
                    </div>
                    <h3 className="text-xl font-black text-slate-800 mb-2">Delete Station?</h3>
                    <p className="text-sm font-bold text-slate-400">
                        Are you sure you want to remove <span className="text-slate-800">"{selectedStation.stationName}"</span>? 
                        This action cannot be undone.
                    </p>
                </div>
                <div className="p-8 bg-slate-50 flex gap-3">
                    <button onClick={() => setIsDeleteModalOpen(false)} disabled={isSubmitting} className="flex-1 py-4 bg-white border border-slate-200 text-slate-500 font-black text-[11px] uppercase tracking-widest rounded-2xl hover:bg-slate-100 transition-all">No, Cancel</button>
                    <button onClick={handleConfirmDelete} disabled={isSubmitting} className="flex-1 bg-red-500 text-white py-4 rounded-2xl text-[11px] font-black shadow-xl shadow-red-100 uppercase tracking-widest hover:bg-red-600 transition-all disabled:opacity-50">
                        {isSubmitting ? 'Deleting...' : 'Yes, Delete'}
                    </button>
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