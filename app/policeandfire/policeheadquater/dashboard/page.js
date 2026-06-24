'use client'
import React, { useState, useEffect } from 'react'
import { 
  FaFileAlt, 
  FaClock, 
  FaCheckCircle, 
  FaUserShield,
  FaChartLine
} from 'react-icons/fa'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import PoliceAPI from '@/app/services/PoliceAPI' // Apna API path check kar lein

export default function HQDashboardPage() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await PoliceAPI.getHeadDashboard();
      if (response.success) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  // Chart Colors
  const COLORS = ['#ef4444', '#f59e0b', '#10b981']; // Red for Fresh, Orange for Pending, Green for History

  // Prepare data for Recharts
  const chartData = dashboardData ? [
    { name: 'Fresh Cases', value: dashboardData.freshCases, color: COLORS[0] },
    { name: 'Pending Cases', value: dashboardData.pendingCases, color: COLORS[1] },
    { name: 'Closed/History', value: dashboardData.historyCases, color: COLORS[2] },
  ] : [];

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 font-sans">
      
      {loading ? (
        // --- LOADING SKELETON ---
        <div className="flex flex-col items-center justify-center h-[70vh]">
          <div className="w-16 h-16 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-400 font-bold tracking-widest uppercase text-sm animate-pulse">Loading Headquarters Data...</p>
        </div>
      ) : dashboardData && (
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* --- HEADER SECTION (Animated Fade In) --- */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-slate-800 text-white rounded-2xl shadow-lg shadow-slate-200">
                  <FaUserShield size={24} />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-slate-800 tracking-tight">HQ Overview</h1>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">
                    Welcome back, <span className="text-[#08B36A]">{dashboardData.officerName}</span>
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white px-5 py-2.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></div>
              <span className="text-xs font-black text-slate-600 uppercase tracking-widest">Live System Active</span>
            </div>
          </div>

          {/* --- TOP 3 STATS CARDS (Staggered Animations) --- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* 1. Fresh Cases Card */}
            <div className="group bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-red-500/10 hover:-translate-y-2 transition-all duration-500 animate-in zoom-in-95 fade-in duration-500 delay-100">
              <div className="flex justify-between items-start mb-6">
                <div className="p-4 bg-red-50 text-red-500 rounded-2xl group-hover:scale-110 group-hover:bg-red-500 group-hover:text-white transition-all duration-500">
                  <FaFileAlt size={24} />
                </div>
                <span className="bg-red-100 text-red-600 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">Urgent</span>
              </div>
              <div>
                <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Fresh Cases</p>
                <h3 className="text-5xl font-black text-slate-800">{dashboardData.freshCases}</h3>
              </div>
            </div>

            {/* 2. Pending Cases Card */}
            <div className="group bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-orange-500/10 hover:-translate-y-2 transition-all duration-500 animate-in zoom-in-95 fade-in duration-500 delay-200">
              <div className="flex justify-between items-start mb-6">
                <div className="p-4 bg-orange-50 text-orange-500 rounded-2xl group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-white transition-all duration-500">
                  <FaClock size={24} />
                </div>
                <span className="bg-orange-100 text-orange-600 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">Active</span>
              </div>
              <div>
                <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Pending Cases</p>
                <h3 className="text-5xl font-black text-slate-800">{dashboardData.pendingCases}</h3>
              </div>
            </div>

            {/* 3. History Cases Card */}
            <div className="group bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-2 transition-all duration-500 animate-in zoom-in-95 fade-in duration-500 delay-300">
              <div className="flex justify-between items-start mb-6">
                <div className="p-4 bg-emerald-50 text-emerald-500 rounded-2xl group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500">
                  <FaCheckCircle size={24} />
                </div>
                <span className="bg-emerald-100 text-emerald-600 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">Resolved</span>
              </div>
              <div>
                <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">History / Closed</p>
                <h3 className="text-5xl font-black text-slate-800">{dashboardData.historyCases}</h3>
              </div>
            </div>

          </div>

          {/* --- GRAPHS & CHARTS SECTION --- */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-500">
            
            {/* Main Bar Chart */}
            <div className="lg:col-span-2 bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm hover:shadow-lg transition-shadow duration-500">
              <div className="flex items-center gap-3 mb-8">
                <FaChartLine className="text-slate-400" size={20} />
                <h2 className="text-lg font-black text-slate-800 tracking-wide">Case Distribution Overview</h2>
              </div>
              
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                    />
                    <Bar 
                      dataKey="value" 
                      radius={[8, 8, 8, 8]} 
                      barSize={45}
                      animationDuration={1500}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Doughnut Pie Chart */}
            <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm hover:shadow-lg transition-shadow duration-500 flex flex-col">
              <h2 className="text-lg font-black text-slate-800 tracking-wide mb-2">Total Case Ratio</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Overall Performance</p>
              
              <div className="flex-1 min-h-[250px] w-full relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={110}
                      paddingAngle={5}
                      dataKey="value"
                      animationDuration={1500}
                      stroke="none"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Center Text in Doughnut */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-black text-slate-800">
                    {dashboardData.freshCases + dashboardData.pendingCases + dashboardData.historyCases}
                  </span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Cases</span>
                </div>
              </div>

              {/* Custom Legend */}
              <div className="flex justify-center gap-4 mt-4">
                {chartData.map((entry, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
                    <span className="text-xs font-bold text-slate-600">{entry.name}</span>
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