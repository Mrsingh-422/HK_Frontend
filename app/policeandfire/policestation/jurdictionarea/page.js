'use client'
import React, { useState } from 'react'
import { 
  FaMapMarkedAlt, 
  FaSearch, 
  FaShieldAlt, 
  FaBroadcastTower, 
  FaDrawPolygon, 
  FaLayerGroup, 
  FaCrosshairs, 
  FaVideo, 
  FaMapMarkerAlt,
  FaInfoCircle,
  FaFileExport,
  FaSatellite,
  FaCar,
  FaArrowRight
} from 'react-icons/fa'

export default function JurisdictionAreaPage() {
  const [activeLayer, setActiveLayer] = useState('coverage');

  const stationData = {
    name: "Central Division Headquarters",
    stationId: "PS-ZONE-01",
    totalJurisdiction: "48.2 sq. km",
    population: "142,000 Residents",
    patrolBeats: 12,
    staffCount: 84
  };

  const beats = [
    { id: 'NW-1', name: 'Sector 74 Industrial', area: '12.4 km²', status: 'Active Patrol' },
    { id: 'CE-2', name: 'Downtown Commercial', area: '15.2 km²', status: 'High Density' },
    { id: 'SO-3', name: 'Residential Phase 7', area: '20.6 km²', status: 'Secure' },
  ];

  return (
    <div className="min-h-screen space-y-6 animate-in fade-in duration-700">
      
      {/* --- TOP HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="bg-slate-900 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest">Station ID: {stationData.stationId}</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Jurisdiction Map</h1>
          <p className="text-slate-500 font-medium">Real-time boundary monitoring for {stationData.name}</p>
        </div>
        <div className="flex gap-3">
            <button className="bg-white border border-slate-200 text-slate-600 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 shadow-sm hover:bg-slate-50 transition-all">
                <FaFileExport /> Export KML
            </button>
            <button className="bg-[#08B36A] text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-green-100 hover:bg-[#07a25f] transition-all">
                <FaDrawPolygon /> Edit Boundary
            </button>
        </div>
      </div>

      {/* --- STATS BAR --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Coverage Area" value={stationData.totalJurisdiction} icon={<FaDrawPolygon/>} color="emerald" />
        <MapStat label="Patrol Beats" value={stationData.patrolBeats} sub="Assigned Sectors" />
        <MapStat label="Population" value="142k" sub="Civilians Covered" />
        <MapStat label="Checkpoints" value="28" sub="Static Points" />
      </div>

      {/* --- MAIN TACTICAL VIEW --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[700px]">
        
        {/* --- TACTICAL MAP (LEFT) --- */}
        <div className="lg:col-span-8 relative bg-slate-900 rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white">
            
            {/* GRID BACKGROUND */}
            <div className="absolute inset-0 opacity-10" 
                 style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
            </div>

            {/* RADAR CIRCLES */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/5 rounded-full pointer-events-none"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-white/5 rounded-full pointer-events-none"></div>

            {/* THE 48KM HIGHLIGHTED POLYGON (SVG) */}
            <svg className="absolute inset-0 w-full h-full p-20" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid meet">
                <defs>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>
                <path 
                    d="M 200,150 L 550,100 L 700,350 L 450,500 L 150,450 Z" 
                    fill="rgba(8, 179, 106, 0.1)" 
                    stroke="#08B36A" 
                    strokeWidth="3" 
                    strokeDasharray="10,5"
                    filter="url(#glow)"
                    className="animate-pulse"
                />
            </svg>

            {/* MAP OVERLAYS: CONTROLS */}
            <div className="absolute top-8 left-8 flex flex-col gap-3">
                <MapAction active={activeLayer === 'coverage'} onClick={() => setActiveLayer('coverage')} icon={<FaLayerGroup/>} label="Boundary Layer" />
                <MapAction active={activeLayer === 'sat'} onClick={() => setActiveLayer('sat')} icon={<FaSatellite/>} label="Satellite View" />
                <MapAction active={activeLayer === 'cctv'} onClick={() => setActiveLayer('cctv')} icon={<FaVideo/>} label="Surveillance" />
            </div>

            {/* MAP MARKERS (Manual Points) */}
            <div className="absolute top-[30%] left-[45%] group cursor-pointer">
                <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg animate-bounce"></div>
                <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] font-black uppercase px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">Main HQ</div>
            </div>

            {/* COORDINATES DISPLAY */}
            <div className="absolute bottom-8 left-8 flex items-center gap-4 bg-slate-800/80 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Station Coordinates</span>
                    <span className="text-xs font-bold text-white tracking-widest">30.7046° N, 76.7179° E</span>
                </div>
            </div>

            {/* LEGEND */}
            <div className="absolute bottom-8 right-8 bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-3 h-3 border border-[#08B36A] border-dashed rounded bg-[#08B36A]/20"></div>
                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">Jurisdiction Boundary (48.2 km²)</span>
                </div>
            </div>
        </div>

        {/* --- SIDEBAR: ANALYSIS (RIGHT) --- */}
        <div className="lg:col-span-4 space-y-4 h-full overflow-y-auto pr-1">
            
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <FaInfoCircle className="text-blue-500" /> Sector Analysis
                </h2>
                <div className="space-y-3">
                    {beats.map(beat => (
                        <div key={beat.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:border-slate-900 transition-all cursor-pointer group">
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-[10px] font-black text-slate-400">{beat.id}</span>
                                <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase">{beat.status}</span>
                            </div>
                            <p className="text-sm font-bold text-slate-800 group-hover:text-black">{beat.name}</p>
                            <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-200/50">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Coverage Area</span>
                                <span className="text-xs font-black text-slate-700">{beat.area}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl">
                <FaShieldAlt className="text-[#08B36A] text-3xl mb-4" />
                <h3 className="text-lg font-black tracking-tight mb-2">Security Coverage</h3>
                <p className="text-slate-400 text-xs font-medium leading-relaxed mb-6">
                    Station PS-ZONE-01 covers 48.2 square kilometers with 92% surveillance uptime and 12-minute rapid response guarantee.
                </p>
                <button className="w-full bg-white text-slate-900 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#08B36A] hover:text-white transition-all">
                    View Patrol Logs <FaArrowRight />
                </button>
            </div>
        </div>

      </div>
    </div>
  )
}

// --- HELPER COMPONENTS ---

function StatCard({ label, value, icon, color }) {
    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5">
            <div className="w-12 h-12 bg-emerald-50 text-[#08B36A] rounded-xl flex items-center justify-center border border-emerald-100 shadow-inner">
                {React.cloneElement(icon, { size: 20 })}
            </div>
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">{value}</h2>
            </div>
        </div>
    )
}

function MapStat({ label, value, sub }) {
    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
            <div className="flex items-baseline gap-2">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">{value}</h2>
                <span className="text-[9px] font-bold text-slate-400 uppercase">{sub}</span>
            </div>
        </div>
    )
}

function MapAction({ active, onClick, icon, label }) {
    return (
        <button 
            onClick={onClick}
            className={`flex items-center gap-3 px-5 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all backdrop-blur-md ${
                active ? 'bg-[#08B36A] text-white shadow-lg' : 'bg-slate-800/80 text-slate-400 border border-white/10 hover:text-white hover:bg-slate-800'
            }`}
        >
            {icon} {label}
        </button>
    )
}