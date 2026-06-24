'use client'
import React, { useState, useEffect } from 'react'
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
  FaFilePdf,
  FaSatellite,
  FaCar,
  FaArrowRight,
  FaCompass
} from 'react-icons/fa'
import PoliceAPI from '@/app/services/PoliceAPI' // Apna path check karein

export default function JurisdictionAreaPage() {
  const [activeLayer, setActiveLayer] = useState('coverage');
  const [jurisdictionData, setJurisdictionData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch data on load
  useEffect(() => {
    const fetchJurisdiction = async () => {
      try {
        setLoading(true);
        const response = await PoliceAPI.getOwnJurisdiction();
        if (response.success && response.data) {
          setJurisdictionData(response.data);
        }
      } catch (error) {
        console.error("Error fetching jurisdiction:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchJurisdiction();
  }, []);

  // View PDF Document Logic
  const handleViewDocument = () => {
    if (jurisdictionData?.areaDocumentUrl) {
      // Assuming your backend URL is set in env
      const fileUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL || ''}${jurisdictionData.areaDocumentUrl}`;
      window.open(fileUrl, '_blank');
    } else {
      alert("No area document uploaded yet.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-slate-200 border-t-[#08B36A] rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 font-black tracking-[0.2em] uppercase text-sm animate-pulse">Initializing Map Coordinates...</p>
      </div>
    );
  }

  // Fallback in case data is empty
  if (!jurisdictionData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <FaMapMarkedAlt className="text-slate-300 text-6xl mb-4" />
        <p className="text-slate-500 font-bold uppercase tracking-widest">Jurisdiction not configured by HQ yet.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-6 animate-in fade-in duration-700 font-sans">
      
      {/* --- TOP HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="bg-slate-900 text-white text-[10px] font-black px-3 py-1 rounded uppercase tracking-widest flex items-center gap-2">
              <FaShieldAlt className="text-[#08B36A]" /> Active Jurisdiction
            </span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase mt-2">
            {jurisdictionData.zoneName || "Unassigned Zone"}
          </h1>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1">Real-time boundary monitoring & control</p>
        </div>
        <div className="flex gap-3">
            <button 
                onClick={handleViewDocument}
                disabled={!jurisdictionData.areaDocumentUrl}
                className="bg-white border border-slate-200 disabled:opacity-50 text-slate-600 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-sm hover:bg-slate-50 transition-all"
            >
                <FaFilePdf className="text-red-500" size={14}/> View Map Document
            </button>
            <button className="bg-[#08B36A] text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-green-100 hover:bg-[#07a25f] transition-all">
                <FaCrosshairs size={14}/> Track Live Units
            </button>
        </div>
      </div>

      {/* --- STATS BAR --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Coverage Area" value={`${jurisdictionData.sqKmArea} km²`} icon={<FaDrawPolygon/>} color="emerald" />
        <MapStat label="Patrol Beats" value={jurisdictionData.patrolBeats} sub="Active Sectors" />
        <MapStat label="Population" value={jurisdictionData.population} sub="Civilians Covered" />
        <MapStat label="Checkpoints" value="12" sub="Static Points" />
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

            {/* THE HIGHLIGHTED POLYGON (SVG) */}
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
                <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] font-black uppercase px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                    Sector Center
                </div>
            </div>

            {/* COORDINATES DISPLAY */}
            <div className="absolute bottom-8 left-8 flex items-center gap-4 bg-slate-800/80 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Zone Center</span>
                    <span className="text-xs font-bold text-white tracking-widest">30.7046° N, 76.7179° E</span>
                </div>
            </div>

            {/* LEGEND */}
            <div className="absolute bottom-8 right-8 bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-3 h-3 border border-[#08B36A] border-dashed rounded bg-[#08B36A]/20"></div>
                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">Zone Boundary ({jurisdictionData.sqKmArea} km²)</span>
                </div>
            </div>
        </div>

        {/* --- SIDEBAR: BOUNDARY ANALYSIS (RIGHT) --- */}
        <div className="lg:col-span-4 space-y-4 h-full overflow-y-auto pr-1 custom-scrollbar">
            
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <FaCompass className="text-orange-500" /> Boundary Limits
                </h2>
                
                <div className="space-y-4">
                    {/* Render Boundaries dynamically from API */}
                    <BoundaryItem direction="N" label="North Boundary" value={jurisdictionData.boundaryLimits?.north} />
                    <BoundaryItem direction="E" label="East Boundary" value={jurisdictionData.boundaryLimits?.east} />
                    <BoundaryItem direction="S" label="South Boundary" value={jurisdictionData.boundaryLimits?.south} />
                    <BoundaryItem direction="W" label="West Boundary" value={jurisdictionData.boundaryLimits?.west} />
                </div>
            </div>

            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
                {/* Decoration */}
                <FaShieldAlt className="absolute -right-6 -bottom-6 text-slate-800 text-[120px] opacity-50" />
                
                <div className="relative z-10">
                    <FaShieldAlt className="text-[#08B36A] text-3xl mb-4" />
                    <h3 className="text-lg font-black tracking-tight mb-2">Security Coverage</h3>
                    <p className="text-slate-400 text-xs font-medium leading-relaxed mb-6">
                        This station covers {jurisdictionData.sqKmArea} sq. km encompassing approx. {jurisdictionData.population} residents with {jurisdictionData.patrolBeats} active patrol beats.
                    </p>
                    <button className="w-full bg-white text-slate-900 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#08B36A] hover:text-white transition-all">
                        View Unit Locations <FaArrowRight />
                    </button>
                </div>
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
                <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">{value}</h2>
            </div>
        </div>
    )
}

function MapStat({ label, value, sub }) {
    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
            <div className="flex items-baseline gap-2">
                <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">{value}</h2>
            </div>
            <span className="text-[9px] font-bold text-slate-400 uppercase">{sub}</span>
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

function BoundaryItem({ direction, label, value }) {
    return (
        <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:border-orange-200 transition-all group flex items-start gap-4">
            <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center font-black text-xs flex-shrink-0 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                {direction}
            </div>
            <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
                <p className="text-sm font-bold text-slate-800 mt-1 leading-snug">{value || "Not Configured"}</p>
            </div>
        </div>
    )
}