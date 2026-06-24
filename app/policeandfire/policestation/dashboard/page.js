'use client'
import React, { useState, useEffect } from 'react'
import { 
  FaExclamationCircle, 
  FaSearchLocation, 
  FaCheckDouble, 
  FaBuilding,
  FaChartPie,
  FaSignal
} from 'react-icons/fa'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Sector 
} from 'recharts';
import PoliceAPI from '@/app/services/PoliceAPI'

export default function StationDashboardPage() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await PoliceAPI.getStationDashboard();
      if (response.success) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.error("Error fetching station dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  // Avatar Fallback Logic
  const getInitials = (name) => {
    if (!name) return "PS";
    const parts = name.split(" ");
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Chart Colors (Slightly different from HQ: Red, Blue, Emerald)
  const COLORS = ['#ef4444', '#3b82f6', '#10b981']; 

  const chartData = dashboardData ? [
    { name: 'Fresh', value: dashboardData.stats.fresh, color: COLORS[0] },
    { name: 'Pending', value: dashboardData.stats.pending, color: COLORS[1] },
    { name: 'Closed', value: dashboardData.stats.closed, color: COLORS[2] },
  ] : [];

  const totalCases = dashboardData ? 
    (dashboardData.stats.fresh + dashboardData.stats.pending + dashboardData.stats.closed) : 0;

  // Custom Tooltip for Recharts
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs font-black uppercase tracking-widest">
          {payload[0].payload.name} Cases: <span className="text-lg text-emerald-400">{payload[0].value}</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 font-sans">
      
      {loading ? (
        // --- LOADING SKELETON ---
        <div className="flex flex-col items-center justify-center h-[70vh]">
          <div className="w-16 h-16 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-400 font-bold tracking-widest uppercase text-sm animate-pulse">Initializing Station Data...</p>
        </div>
      ) : dashboardData && (
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* --- HEADER SECTION --- */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="flex items-center gap-4">
              
              {/* Profile Avatar / Fallback */}
              {dashboardData.profilePic ? (
                <img src={dashboardData.profilePic} alt="Profile" className="w-16 h-16 rounded-2xl object-cover shadow-md border border-slate-200" />
              ) : (
                <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-xl font-black shadow-md shadow-blue-500/30">
                  {getInitials(dashboardData.welcomeName)}
                </div>
              )}

              <div>
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">Station Command</h1>
                <p className="text-sm font-bold text-slate-400 mt-1 flex items-center gap-2">
                  Welcome, <span className="text-blue-600 uppercase tracking-widest">{dashboardData.welcomeName}</span>
                </p>
              </div>
            </div>

            {/* Live Indicator */}
            <div className="bg-white px-5 py-2.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
              <FaSignal className="text-blue-500 animate-pulse" />
              <span className="text-xs font-black text-slate-600 uppercase tracking-widest">Station Online</span>
            </div>
          </div>

          {/* --- TOP 3 STATS CARDS --- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* 1. Fresh Cases */}
            <div className="group bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-red-500/10 hover:-translate-y-1.5 transition-all duration-500 animate-in zoom-in-95 fade-in delay-100">
              <div className="flex justify-between items-start mb-6">
                <div className="p-4 bg-red-50 text-red-500 rounded-2xl group-hover:scale-110 group-hover:bg-red-500 group-hover:text-white transition-all duration-300">
                  <FaExclamationCircle size={24} />
                </div>
                <span className="bg-red-100 text-red-600 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-red-200">New</span>
              </div>
              <div>
                <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Fresh Complaints</p>
                <div className="flex items-end gap-3">
                    <h3 className="text-5xl font-black text-slate-800">{dashboardData.stats.fresh}</h3>
                    <span className="text-xs font-bold text-slate-400 mb-2">Cases</span>
                </div>
              </div>
            </div>

            {/* 2. Pending Cases */}
            <div className="group bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1.5 transition-all duration-500 animate-in zoom-in-95 fade-in delay-200">
              <div className="flex justify-between items-start mb-6">
                <div className="p-4 bg-blue-50 text-blue-500 rounded-2xl group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                  <FaSearchLocation size={24} />
                </div>
                <span className="bg-blue-100 text-blue-600 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-blue-200">Active</span>
              </div>
              <div>
                <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Pending Investigations</p>
                <div className="flex items-end gap-3">
                    <h3 className="text-5xl font-black text-slate-800">{dashboardData.stats.pending}</h3>
                    <span className="text-xs font-bold text-slate-400 mb-2">Cases</span>
                </div>
              </div>
            </div>

            {/* 3. Closed Cases */}
            <div className="group bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-1.5 transition-all duration-500 animate-in zoom-in-95 fade-in delay-300">
              <div className="flex justify-between items-start mb-6">
                <div className="p-4 bg-emerald-50 text-emerald-500 rounded-2xl group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                  <FaCheckDouble size={24} />
                </div>
                <span className="bg-emerald-100 text-emerald-600 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-emerald-200">Resolved</span>
              </div>
              <div>
                <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Closed & Archived</p>
                <div className="flex items-end gap-3">
                    <h3 className="text-5xl font-black text-slate-800">{dashboardData.stats.closed}</h3>
                    <span className="text-xs font-bold text-slate-400 mb-2">Cases</span>
                </div>
              </div>
            </div>

          </div>

          {/* --- GRAPHS SECTION --- */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-500">
            
            {/* Left Chart (Workload Distribution) */}
            <div className="lg:col-span-8 bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm hover:shadow-lg transition-shadow duration-500">
              <div className="flex justify-between items-start mb-8">
                <div>
                    <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                        <FaBuilding className="text-blue-500" /> Station Workload
                    </h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Status wise distribution</p>
                </div>
              </div>
              
              <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  {/* Changed from BarChart to a more dynamic look */}
                  <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 12, fontWeight: 800, textTransform: 'uppercase' }} 
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                    <Bar 
                      dataKey="value" 
                      radius={[0, 8, 8, 0]} 
                      barSize={40}
                      animationDuration={1500}
                      label={{ position: 'right', fill: '#0f172a', fontWeight: 900, fontSize: 16 }}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Right Chart (Completion Rate) */}
            <div className="lg:col-span-4 bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm hover:shadow-lg transition-shadow duration-500 flex flex-col items-center justify-center">
              <h2 className="text-lg font-black text-slate-800 tracking-tight mb-1 flex items-center gap-2">
                <FaChartPie className="text-emerald-500" /> Resolution Rate
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Closed vs Total Cases</p>
              
              <div className="w-full flex-1 relative flex items-center justify-center min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                      animationDuration={2000}
                      stroke="none"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Center Stat */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
                  <span className="text-4xl font-black text-slate-800">{totalCases}</span>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total</span>
                </div>
              </div>

              {/* Legend */}
              <div className="w-full mt-6 space-y-3">
                  {chartData.map((entry, index) => (
                      <div key={index} className="flex items-center justify-between bg-slate-50 px-4 py-2 rounded-xl">
                          <div className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }}></div>
                              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">{entry.name}</span>
                          </div>
                          <span className="text-sm font-black" style={{ color: entry.color }}>{entry.value}</span>
                      </div>
                  ))}
              </div>

            </div>

          </div>

        </div>
      )}
    </div>
  )
}