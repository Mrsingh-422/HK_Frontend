'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'

import { 
  FaShieldAlt, 
  FaHistory, 
  FaExclamationCircle, 
  FaClock,
  FaFileMedical
} from 'react-icons/fa'
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell 
} from 'recharts';
import PoliceAPI from '@/app/services/PoliceAPI';

// --- MOCK DATA FOR TREND GRAPH ---
const trendData = [
  { name: 'Mon', cases: 10 },
  { name: 'Tue', cases: 25 },
  { name: 'Wed', cases: 15 },
  { name: 'Thu', cases: 45 },
  { name: 'Fri', cases: 30 },
  { name: 'Sat', cases: 55 },
  { name: 'Sun', cases: 40 },
];

export default function PoliceDashboard() {
  const [apiData, setApiData] = useState({
    freshCases: 0,
    pendingCases: 0,
    historyCases: 0,
    officerName: "Loading..."
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Calling your specific function
        const response = await PoliceAPI.getHeadDashboard();
        if (response.success) {
          setApiData(response.data);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Format data for the Distribution Bar Chart using API values
  const distributionData = [
    { name: 'Fresh', value: apiData.freshCases, color: '#2563eb' },
    { name: 'Pending', value: apiData.pendingCases, color: '#ea580c' },
    { name: 'History', value: apiData.historyCases, color: '#08B36A' },
  ];

  // Helper to pad numbers (e.g., 5 becomes "05")
  const formatCount = (num) => num.toString().padStart(2, '0');

  return (
    <div className="space-y-8 animate-in fade-in duration-700 font-sans p-2">
      
      {/* --- HEADER --- */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Command Center</h1>
          <p className="text-slate-500 font-medium">{apiData.officerName} • HQ Division</p>
        </div>
        <div className="hidden md:block text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Status</p>
            <p className="text-[#08B36A] font-bold text-sm flex items-center gap-2 justify-end">
                <span className="w-2 h-2 bg-[#08B36A] rounded-full animate-pulse"></span> Encrypted & Online
            </p>
        </div>
      </div>

      {/* --- FIRST SECTION: STATISTICAL DATA CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatDataCard 
          title="Fresh Case" 
          count={formatCount(apiData.freshCases)} 
          label="New Reports Today"
          icon={<FaFileMedical />}
          themeColor="blue"
        />

        <StatDataCard 
          title="Pending Case" 
          count={formatCount(apiData.pendingCases)} 
          label="Active Investigations"
          icon={<FaExclamationCircle />}
          themeColor="orange"
        />

        <StatDataCard 
          title="History Case" 
          count={formatCount(apiData.historyCases)} 
          label="Resolved MLC Cases"
          icon={<FaHistory />}
          themeColor="emerald"
        />
      </div>

      {/* --- LOWER SECTION: ANALYTICS --- */}
      <div className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Trend Graph Card */}
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Weekly Case Load</h3>
              <FaClock className="text-slate-300" />
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorCase" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#08B36A" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#08B36A" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} />
                  <Tooltip contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey="cases" stroke="#08B36A" strokeWidth={3} fillOpacity={1} fill="url(#colorCase)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Distribution Graph Card */}
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Case Distribution</h3>
              <FaShieldAlt className="text-slate-300" />
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distributionData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '15px', border: 'none' }} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={45}>
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

// --- STAT DATA CARD COMPONENT ---
function StatDataCard({ title, count, label, icon, themeColor }) {
  const themes = {
    blue: "text-blue-600 bg-blue-50",
    orange: "text-orange-600 bg-orange-50",
    emerald: "text-emerald-600 bg-emerald-50"
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 relative overflow-hidden flex flex-col items-center justify-center text-center">
      <div className={`absolute -right-6 -bottom-6 opacity-[0.03] rotate-12 scale-[2.5] ${themes[themeColor].split(' ')[0]}`}>
        {React.cloneElement(icon, { size: 100 })}
      </div>

      <div className="relative z-10">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 mb-4 px-3 py-1 bg-slate-50 rounded-full border border-slate-100">
             <span className={`${themes[themeColor].split(' ')[0]}`}>
                {React.cloneElement(icon, { size: 12 })}
             </span>
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</span>
          </div>

          <h2 className={`text-7xl font-black tracking-tighter ${themes[themeColor].split(' ')[0]} drop-shadow-sm`}>
            {count}
          </h2>

          <p className="mt-2 text-xs font-bold text-slate-500 uppercase tracking-widest opacity-60">
            {label}
          </p>
        </div>
      </div>
    </div>
  )
}