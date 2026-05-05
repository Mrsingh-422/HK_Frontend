'use client'
import React from 'react'
import { FaFileMedical, FaExclamationCircle, FaHistory, FaClock, FaShieldAlt, FaMapMarkerAlt, FaExternalLinkAlt } from 'react-icons/fa'
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell 
} from 'recharts';

// Mock data for graphs
const weeklyData = [
  { day: 'Mon', fresh: 4, pending: 2, history: 10 },
  { day: 'Tue', fresh: 7, pending: 4, history: 12 },
  { day: 'Wed', fresh: 5, pending: 3, history: 15 },
  { day: 'Thu', fresh: 12, pending: 6, history: 20 },
  { day: 'Fri', fresh: 8, pending: 4, history: 18 },
  { day: 'Sat', fresh: 15, pending: 8, history: 25 },
  { day: 'Sun', fresh: 10, pending: 5, history: 22 },
];

const distributionData = [
  { name: 'Fresh', value: 12, color: '#2563eb' },
  { name: 'Pending', value: 6, color: '#ea580c' },
  { name: 'History', value: 42, color: '#08B36A' },
];

export default function PoliceStationDashboard() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* 1. Header Area - More compact spacing */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Station Dashboard</h1>
          <p className="text-slate-500 font-medium text-sm">Monitoring Real-time Activity • Sector 74 Precinct</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm hidden md:block">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Active Precinct</p>
            <p className="text-[#08B36A] font-bold text-xs uppercase">Central Police Station</p>
        </div>
      </div>

      {/* 2. Numerical Stat Section (Redesigned for Compactness) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CompactStatCard title="Fresh Case" count="12" label="New Reports" color="blue" icon={<FaFileMedical/>} />
        <CompactStatCard title="Pending Case" count="06" label="Investigations" color="orange" icon={<FaExclamationCircle/>} />
        <CompactStatCard title="History Case" count="42" label="Resolved" color="emerald" icon={<FaHistory/>} />
      </div>

      {/* 3. Graphs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Trend Graph */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Case Trends</h2>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded">LAST 7 DAYS</span>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="colorFresh" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#08B36A" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#08B36A" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600, fill: '#94a3b8'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600, fill: '#94a3b8'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="fresh" stroke="#08B36A" strokeWidth={3} fillOpacity={1} fill="url(#colorFresh)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribution Graph */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Case Distribution</h2>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded">ALL TIME</span>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionData} margin={{ top: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 700, fill: '#64748b'}} dy={10} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={40}>
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
  )
}

// --- Redesigned Compact Helper Component ---

function CompactStatCard({ title, count, label, color, icon }) {
    const colors = {
        blue: "text-blue-600 bg-blue-50 border-blue-100",
        orange: "text-orange-600 bg-orange-50 border-orange-100",
        emerald: "text-emerald-600 bg-emerald-50 border-emerald-100"
    }
    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300">
            {/* Smaller Decorative Background Icon */}
            <div className="absolute -right-2 -bottom-2 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity rotate-12 scale-[1.5]">
                {React.cloneElement(icon, {size: 70})}
            </div>
            
            <div className="relative z-10 flex items-center gap-5">
                {/* Icon Box - Smaller */}
                <div className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center ${colors[color]} border shadow-inner`}>
                    {React.cloneElement(icon, {size: 18})}
                </div>
                
                <div className="flex flex-col">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{title}</p>
                    <div className="flex items-baseline gap-2">
                        {/* Reduced from 8xl to 4xl */}
                        <h2 className={`text-4xl font-black tracking-tight ${colors[color].split(' ')[0]}`}>{count}</h2>
                        <span className="text-[10px] font-bold text-slate-300 uppercase">{label}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}