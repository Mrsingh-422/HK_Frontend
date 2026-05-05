'use client'
import React, { useState } from 'react'
import { FaBuilding, FaMapMarkerAlt, FaTimes, FaSearch, FaCheckCircle, FaPhoneAlt } from 'react-icons/fa'

export default function DeployStationModal({ isOpen, onClose, selectedCase }) {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock Data for Police Stations
  const policeStations = [
    { id: "PS-01", name: "Phase 11 Police Station", area: "Sector 65, Mohali", distance: "2.4 km", contact: "0172-221011" },
    { id: "PS-02", name: "Sohana Police Station", area: "Sector 70, Mohali", distance: "3.1 km", contact: "0172-221055" },
    { id: "PS-03", name: "Mataur Police Station", area: "Sector 71, Mohali", distance: "4.8 km", contact: "0172-221077" },
    { id: "PS-04", name: "Balongi Police Post", area: "Phase 6, Mohali", distance: "5.2 km", contact: "0172-221099" },
    { id: "PS-05", name: "Phase 1 Police Station", area: "Industrial Area", distance: "6.0 km", contact: "0172-221022" },
  ];

  const filteredStations = policeStations.filter(station => 
    station.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    station.area.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen || !selectedCase) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-lg font-black text-slate-800">Assign Police Station</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              Case ID: <span className="text-blue-600">{selectedCase.id}</span>
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
            <FaTimes size={18} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 px-6 border-b border-slate-50">
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-3" />
            <input 
              type="text" 
              placeholder="Search station by name or area..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#08B36A]/20 transition-all font-medium"
            />
          </div>
        </div>

        {/* Stations List */}
        <div className="p-4 px-6 max-h-[400px] overflow-y-auto space-y-3 custom-scrollbar">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Jurisdiction Stations</p>
          
          {filteredStations.map((station) => (
            <div 
              key={station.id} 
              className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-[#08B36A] hover:bg-green-50/30 cursor-pointer group transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-[#08B36A] group-hover:bg-white transition-all shadow-sm">
                  <FaBuilding size={18} />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-800 group-hover:text-[#08B36A] transition-colors">{station.name}</p>
                  <div className="flex flex-col gap-0.5">
                    <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                      <FaMapMarkerAlt size={8} /> {station.area}
                    </p>
                    <p className="text-[10px] font-bold text-[#08B36A]">
                      {station.distance} away from incident
                    </p>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => {
                  alert(`Case ${selectedCase.id} assigned to ${station.name}`);
                  onClose();
                }}
                className="p-2 text-slate-200 group-hover:text-[#08B36A] transition-colors"
              >
                <FaCheckCircle size={20} />
              </button>
            </div>
          ))}

          {filteredStations.length === 0 && (
            <div className="text-center py-10">
              <p className="text-xs font-bold text-slate-400 italic">No stations found matching your search.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 flex gap-3">
          <button 
            onClick={onClose} 
            className="flex-1 bg-white border border-slate-200 py-3.5 rounded-2xl font-black text-[11px] text-slate-500 uppercase tracking-widest hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            disabled
            className="flex-1 bg-slate-200 cursor-not-allowed py-3.5 rounded-2xl font-black text-[11px] text-slate-400 uppercase tracking-widest shadow-lg shadow-slate-100"
          >
            Confirm Assignment
          </button>
        </div>
      </div>
    </div>
  )
}