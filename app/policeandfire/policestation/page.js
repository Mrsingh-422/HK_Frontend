'use client'
import React from 'react'
import { FaFileMedical, FaExclamationCircle, FaHistory, FaClock, FaShieldAlt, FaMapMarkerAlt, FaExternalLinkAlt } from 'react-icons/fa'

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

      {/* 3. Live Activity Feed */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
            <h2 className="text-lg font-black text-slate-800 flex items-center gap-3">
                <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping"></span>
                Emergency Case Broadcasts
            </h2>
            <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-[#08B36A] transition-colors">
                Refresh Feed
            </button>
        </div>
        <div className="p-4 space-y-2">
            <ActivityRow victim="Nitish Sharma" type="Road Accident" loc="Sector 74" time="2 mins ago" status="Critical" />
            <ActivityRow victim="Arjun Singh" type="Assault" loc="Tdi City" time="15 mins ago" status="Stable" />
            <ActivityRow victim="Priya Verma" type="Suspected Poisoning" loc="Phase 7" time="1 hour ago" status="Investigating" />
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

function ActivityRow({ victim, type, loc, time, status }) {
    return (
        <div className="flex items-center justify-between p-4 hover:bg-slate-50/80 rounded-2xl transition-all group border border-transparent hover:border-slate-100">
            <div className="flex items-center gap-4">
                <div className="w-11 h-11 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-blue-500 transition-all">
                    <FaShieldAlt size={18} />
                </div>
                <div>
                    <p className="text-sm font-black text-slate-800 tracking-tight leading-none mb-1">{victim}</p>
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black text-red-500 uppercase px-1.5 py-0.5 bg-red-50 rounded">{type}</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1 tracking-wider"><FaMapMarkerAlt size={8} /> {loc}</span>
                    </div>
                </div>
            </div>
            <div className="text-right">
                <p className="text-[9px] font-black text-slate-400 uppercase flex items-center gap-1 justify-end"><FaClock size={8}/> {time}</p>
                <div className="mt-1 flex items-center justify-end gap-2">
                    <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest leading-none">{status}</span>
                    <FaExternalLinkAlt size={8} className="text-slate-200 group-hover:text-[#08B36A] transition-colors" />
                </div>
            </div>
        </div>
    )
}