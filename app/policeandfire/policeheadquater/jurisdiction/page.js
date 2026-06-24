'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  FaSearch, 
  FaMapMarkedAlt, 
  FaShieldAlt, 
  FaBuilding, 
  FaUserTie,
  FaArrowRight,
  FaCog
} from 'react-icons/fa'
import PoliceAPI from '@/app/services/PoliceAPI'

export default function JurisdictionStationListPage() {
  const router = useRouter();
  const [stations, setStations] = useState([]);
  const [filteredStations, setFilteredStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    setLoading(true);
    try {
      const response = await PoliceAPI.getAllPoliceStations();
      if (response.success && response.data) {
        setStations(response.data);
        setFilteredStations(response.data);
      }
    } catch (error) {
      console.error("Error fetching stations:", error);
    } finally {
      setLoading(false);
    }
  };

  // Search Logic
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredStations(stations);
    } else {
      const lowerQuery = searchQuery.toLowerCase();
      const filtered = stations.filter(stn => 
        stn.stationName.toLowerCase().includes(lowerQuery) ||
        stn.stationCode.toLowerCase().includes(lowerQuery) ||
        stn.shoName.toLowerCase().includes(lowerQuery)
      );
      setFilteredStations(filtered);
    }
  }, [searchQuery, stations]);

  // Navigate to Detail Page
  const handleConfigureClick = (stationId) => {
    // Make sure your folder structure matches this route
    router.push(`/policeandfire/policeheadquater/${stationId}/jurisdiction`);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans pb-24 animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* --- HEADER SECTION --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4">
              <div className="p-4 bg-emerald-50 text-[#08B36A] rounded-2xl">
                  <FaMapMarkedAlt size={24} />
              </div>
              <div>
                  <h1 className="text-2xl font-black text-slate-800 tracking-tight">Jurisdiction Settings</h1>
                  <p className="text-sm font-bold text-slate-400 mt-1">Select a police station to configure its operational boundaries.</p>
              </div>
          </div>
          
          {/* Total Stats */}
          <div className="bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100 text-center w-full md:w-auto">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Stations</p>
              <p className="text-2xl font-black text-[#08B36A]">{stations.length}</p>
          </div>
        </div>

        {/* --- TABLE CONTAINER --- */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
          
          {/* Toolbar & Search */}
          <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-white">
            <div className="relative w-full max-w-md">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-3.5" />
              <input 
                type="text" 
                placeholder="Search by Station Name, Code or SHO..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-[#08B36A]/20 transition-all"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-16 flex flex-col items-center justify-center">
                  <div className="w-10 h-10 border-4 border-slate-200 border-t-[#08B36A] rounded-full animate-spin mb-4"></div>
                  <p className="text-slate-400 font-bold tracking-wide">Loading Stations...</p>
              </div>
            ) : filteredStations.length === 0 ? (
              <div className="p-20 flex flex-col items-center justify-center opacity-40">
                  <FaBuilding size={48} className="mb-4 text-slate-400" />
                  <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-500">No Stations Found</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-[0.15em]">
                    <th className="px-6 py-4">Station Details</th>
                    <th className="px-6 py-4">Station House Officer</th>
                    <th className="px-6 py-4">Current Zone</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredStations.map((station) => (
                    <tr 
                      key={station._id} 
                      onClick={() => handleConfigureClick(station._id)}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    >
                      {/* Station Name & Code */}
                      <td className="px-6 py-5 align-middle">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-slate-100 text-slate-400 rounded-xl group-hover:bg-[#08B36A] group-hover:text-white transition-colors">
                            <FaShieldAlt size={16} />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-slate-800">{station.stationName}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                              {station.stationCode}
                            </span>
                          </div>
                        </div>
                      </td>
                      
                      {/* SHO Info */}
                      <td className="px-6 py-5 align-middle">
                        <div className="flex items-center gap-2">
                          <FaUserTie className="text-slate-300" size={14} />
                          <span className="text-sm font-bold text-slate-600">{station.shoName}</span>
                        </div>
                      </td>

                      {/* Zone Info */}
                      <td className="px-6 py-5 align-middle">
                        <div className="flex items-center gap-2">
                          <FaMapMarkedAlt className="text-slate-300" size={14} />
                          <span className={`text-xs font-bold ${station.jurisdiction?.zoneName ? 'text-slate-600' : 'text-orange-500'}`}>
                            {station.jurisdiction?.zoneName || "Not Configured"}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-5 align-middle">
                        <span className="bg-emerald-50 text-[#08B36A] text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-emerald-100">
                          Active
                        </span>
                      </td>

                      {/* Action Button */}
                      <td className="px-6 py-5 align-middle text-center">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation(); // Prevents double firing of route
                            handleConfigureClick(station._id);
                          }}
                          className="bg-white border border-slate-200 text-slate-500 group-hover:bg-[#08B36A] group-hover:border-[#08B36A] group-hover:text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 mx-auto transition-all"
                        >
                          <FaCog size={12} /> Configure
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Footer Info */}
          <div className="p-4 border-t border-slate-50 bg-slate-50/30 flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Showing {filteredStations.length} Stations
            </span>
          </div>

        </div>
      </div>
    </div>
  )
}