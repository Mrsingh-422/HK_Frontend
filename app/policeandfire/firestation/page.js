'use client'
import React, { cloneElement, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  FaFire, 
  FaTruck, 
  FaHistory, 
  FaClock, 
  FaExternalLinkAlt, 
  FaArrowRight, 
  FaFireExtinguisher,
  FaChartBar,
  FaSpinner,
  FaPowerOff,
  FaRupeeSign // Added Rupee icon for earnings
} from 'react-icons/fa'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';

// API import - Path apne project ke hisaab se adjust kar lena
import FireStationAPI from '@/app/services/FireStationAPI'

export default function FireStationDashboard() {
  const router = useRouter();

  // --- STATES MATCHING NEW API RESPONSE ---
  const [stats, setStats] = useState({ 
      newFireAlerts: 0, 
      ongoingOperations: 0, 
      resolvedIncidents: 0, 
      totalEarnings: "0" 
  });
  const [isLoading, setIsLoading] = useState(true);
  
  // Auth and User data
  const [stationData, setStationData] = useState(null); 
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // --- AUTH CHECK & API CALL ---
  useEffect(() => {
    // 1. Auth Check
    const token = localStorage.getItem('firestationToken');
    const data = localStorage.getItem('firestationData');

    if (!token) {
        router.push('/');
        return; 
    }

    if (data) {
        setStationData(JSON.parse(data));
    }
    setIsAuthChecking(false);

    // 2. Fetch Stats
    const fetchDashboardStats = async () => {
      try {
        setIsLoading(true);
        const response = await FireStationAPI.GetDashboardStats();
        
        if (response.success) {
          // Mapping exact keys from your API
          setStats(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardStats();
  }, [router]);

  // --- LOGOUT FUNCTION ---
  const handleLogout = () => {
    localStorage.removeItem('firestationToken');
    localStorage.removeItem('firestationData');
    router.push('/policeandfire/login');
  };

  // Demo Live Incidents (Replace with API later)
  const liveIncidents =[
    { id: 'FR-911-01', type: 'Residential Fire', loc: 'Sector 22 Market', time: '2 mins ago', severity: 'Critical' },
    { id: 'FR-911-04', type: 'Commercial Alarm', loc: 'Tdi City South', time: '15 mins ago', severity: 'High' },
    { id: 'FR-908-12', type: 'Rescue - Road Acc.', loc: 'Phase 7 Bridge', time: '1 hour ago', severity: 'Medium' },
  ];

  // --- CHART DATA PREPARATION (Mapped to API Keys) ---
  const chartData =[
    { name: 'New Alerts', value: stats.newFireAlerts, color: '#ef4444' }, // Red
    { name: 'Ongoing', value: stats.ongoingOperations, color: '#f59e0b' },      // Orange
    { name: 'Resolved', value: stats.resolvedIncidents, color: '#08B36A' }     // Green (Theme)
  ];

  // Helper function to format numbers to 2 digits (e.g., 5 -> "05")
  const formatNumber = (num) => String(num || 0).padStart(2, '0');

  // Loader state while verifying token
  if (isAuthChecking) {
      return (
          <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
              <FaSpinner className="animate-spin text-4xl text-[#08B36A]" />
              <p className="text-slate-500 font-bold tracking-widest text-sm uppercase">Verifying Access...</p>
          </div>
      );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10">
      {/* --- HEADER --- */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none uppercase">Fire Operations</h1>
          <p className="text-slate-500 font-medium mt-2 flex items-center gap-2">
            <FaFireExtinguisher className="text-[#08B36A]" /> 
            {stationData?.stationName || "Fire & Rescue HQ"} 
            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded ml-2 font-bold uppercase">
                {stationData?.stationCode || "HQ"}
            </span>
          </p>
        </div>
        
        {/* Logout Button */}
        <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl font-bold text-sm hover:bg-red-500 hover:text-white transition-all duration-300"
        >
            <FaPowerOff /> Logout
        </button>
      </div>

      {/* --- TOP STAT CARDS (4 Columns Now for Earnings) --- */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            <SkeletonCard /> <SkeletonCard /> <SkeletonCard /> <SkeletonCard />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          <CompactStatCard title="Fresh Cases" count={formatNumber(stats.newFireAlerts)} label="Active Alarms" color="red" icon={<FaFire/>} />
          <CompactStatCard title="Ongoing Cases" count={formatNumber(stats.ongoingOperations)} label="Engines Out" color="orange" icon={<FaTruck/>} />
          <CompactStatCard title="Closed Cases" count={formatNumber(stats.resolvedIncidents)} label="Resolved" color="emerald" icon={<FaHistory/>} />
          {/* EARNINGS CARD ADDED */}
          <CompactStatCard title="Revenue" count={`₹${stats.totalEarnings}`} label="Total Earnings" color="indigo" icon={<FaRupeeSign/>} />
        </div>
      )}

      {/* --- MIDDLE ROW: GRAPH --- */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 relative overflow-hidden group">
        <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 text-blue-500 rounded-xl"><FaChartBar /></div>
                Operations Overview
            </h3>
        </div>
        
        {isLoading ? (
             <div className="h-[250px] flex items-center justify-center text-[#08B36A]"><FaSpinner className="animate-spin text-3xl"/></div>
        ) : (
            <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={40}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }} 
                            dy={10}
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }} 
                        />
                        <Tooltip 
                            cursor={{ fill: '#f8fafc' }}
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', fontWeight: 'bold' }}
                        />
                        <Bar dataKey="value" radius={[8, 8, 8, 8]}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        )}
      </div>

      {/* --- LOWER GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Live Emergency Feed */}
        {/* <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-sm border border-green-50 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-green-50 flex justify-between items-center bg-green-50/20">
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-3">
              <span className="w-2.5 h-2.5 bg-green-600 rounded-full animate-ping"></span> Live Emergency Feed
            </h3>
            <Link href="/policeandfire/firestation/newincidents" className="text-[#08B36A] text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:underline transition-all">
              Registry <FaArrowRight />
            </Link>
          </div>
          
          <div className="p-2">
            {liveIncidents.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-5 hover:bg-green-50/50 rounded-2xl transition-all group">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-white border border-green-100 rounded-2xl flex items-center justify-center text-[#08B36A] shadow-sm transition-all group-hover:bg-[#08B36A] group-hover:text-white">
                    <FaFire size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-800">{item.type}</p>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        item.severity === 'Critical' ? 'bg-red-50 text-red-600' :
                        item.severity === 'High' ? 'bg-orange-50 text-orange-600' : 'bg-yellow-50 text-yellow-600'
                    }`}>
                        {item.severity}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1 justify-end"><FaClock size={8}/> {item.time}</span>
                  <FaExternalLinkAlt size={10} className="text-slate-200 mt-2 ml-auto" />
                </div>
              </div>
            ))}
          </div>
        </div> */}

        {/* Dispatch Quick Control */}
        {/* <div className="bg-[#08B36A] rounded-[2.5rem] p-8 text-white shadow-xl shadow-green-100 relative overflow-hidden flex flex-col justify-between">
          <FaFireExtinguisher className="absolute -right-10 -bottom-10 text-white/10" size={240} />
          <div>
            <h3 className="text-xl font-black leading-tight mb-2 relative z-10">Unit Status</h3>
            <p className="text-white/80 font-semibold text-sm relative z-10 mb-1">
                Cmdr: {stationData?.captainName || "N/A"}
            </p>
            <p className="text-white/70 text-xs font-bold uppercase mb-8 relative z-10">Marshals Online: 08</p>
          </div>
          <button className="relative z-10 w-full bg-white text-[#08B36A] py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg active:scale-95 transition-all hover:bg-slate-50 mt-10">
             Broadcast SOS
          </button>
        </div> */}
      </div>
    </div>
  )
}

// --- HELPER COMPONENTS ---

function CompactStatCard({ title, count, label, color, icon }) {
    const themes = {
        emerald: "text-[#08B36A] bg-green-50 border-green-100",
        red: "text-red-500 bg-red-50 border-red-100",
        orange: "text-orange-500 bg-orange-50 border-orange-100",
        indigo: "text-indigo-500 bg-indigo-50 border-indigo-100", // Theme added for earnings
        slate: "text-slate-600 bg-slate-50 border-slate-100"
    };

    const numberColor = {
        emerald: 'text-[#08B36A]',
        red: 'text-red-600',
        orange: 'text-orange-500',
        indigo: 'text-indigo-600',
        slate: 'text-slate-600'
    }[color];

    return (
        <div className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-6 group hover:shadow-lg transition-all hover:-translate-y-1">
            <div className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center ${themes[color]} border shadow-inner`}>
                {cloneElement(icon, { size: 20 })}
            </div>
            {/* Added truncate logic to prevent long numbers from breaking layout */}
            <div className="flex-1 overflow-hidden">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{title}</p>
                <div className="flex items-baseline gap-2">
                    {/* Changed text-5xl to text-4xl to accommodate long earning strings like "₹42,000" smoothly */}
                    <h2 className={`text-4xl font-black tracking-tighter truncate ${numberColor}`}>{count}</h2>
                </div>
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter mt-1 block">{label}</span>
            </div>
        </div>
    )
}

function SkeletonCard() {
    return (
        <div className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-6 animate-pulse">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl"></div>
            <div className="flex-1 space-y-3">
                <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                <div className="h-8 bg-slate-100 rounded w-3/4"></div>
            </div>
        </div>
    )
}