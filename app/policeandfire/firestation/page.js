'use client'
import React, { cloneElement } from 'react'
import Link from 'next/link'
import { 
  FaFire, 
  FaTruck, 
  FaHistory, 
  FaClock, 
  FaMapMarkerAlt, 
  FaExternalLinkAlt, 
  FaArrowRight, 
  FaFireExtinguisher 
} from 'react-icons/fa'

export default function FireStationDashboard() {
  const liveIncidents = [
    { id: 'FR-911-01', type: 'Residential Fire', loc: 'Sector 22 Market', time: '2 mins ago', severity: 'Critical' },
    { id: 'FR-911-04', type: 'Commercial Alarm', loc: 'Tdi City South', time: '15 mins ago', severity: 'High' },
    { id: 'FR-908-12', type: 'Rescue - Road Acc.', loc: 'Phase 7 Bridge', time: '1 hour ago', severity: 'Medium' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* --- HEADER --- */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none uppercase">Fire Operations</h1>
          <p className="text-slate-500 font-medium mt-2 flex items-center gap-2">
            <FaFireExtinguisher className="text-[#08B36A]" /> Sector 74 Fire & Rescue HQ
          </p>
        </div>
      </div>

      {/* --- TOP STAT CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CompactStatCard title="Live Dispatch" count="04" label="Active Alarms" color="emerald" icon={<FaFire/>} />
        <CompactStatCard title="Rescue Active" count="02" label="Engines Out" color="emerald" icon={<FaTruck/>} />
        <CompactStatCard title="Incident Logs" count="128" label="Resolved" color="slate" icon={<FaHistory/>} />
      </div>

      {/* --- LOWER GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Live Emergency Feed */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-sm border border-green-50 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-green-50 flex justify-between items-center bg-green-50/20">
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-3">
              <span className="w-2.5 h-2.5 bg-green-600 rounded-full animate-ping"></span> Live Emergency Feed
            </h3>
            <Link href="/policeandfire/firestation/freshcase" className="text-[#08B36A] text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:underline transition-all">
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
                    <span className="text-[10px] font-bold text-[#08B36A] uppercase bg-green-50 px-2 rounded">{item.severity}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1 justify-end"><FaClock size={8}/> {item.time}</span>
                  <FaExternalLinkAlt size={10} className="text-slate-200 mt-2 ml-auto" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dispatch Quick Control (The main Action Card) */}
        <div className="bg-[#08B36A] rounded-[2.5rem] p-8 text-white shadow-xl shadow-green-100 relative overflow-hidden">
          <FaFireExtinguisher className="absolute -right-10 -bottom-10 text-white/10" size={240} />
          <h3 className="text-xl font-black leading-tight mb-2 relative z-10">Unit Status</h3>
          <p className="text-white/70 text-xs font-bold uppercase mb-8 relative z-10">Marshals Online: 08</p>
          <button className="relative z-10 w-full bg-white text-[#08B36A] py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg active:scale-95 transition-all hover:bg-slate-50">
             Broadcast SOS
          </button>
        </div>
      </div>
    </div>
  )
}

function CompactStatCard({ title, count, label, color, icon }) {
    const themes = {
        emerald: "text-[#08B36A] bg-green-50 border-green-100",
        slate: "text-slate-600 bg-slate-50 border-slate-100"
    };

    // Extract text color class for the number
    const numberColor = color === 'emerald' ? 'text-[#08B36A]' : 'text-slate-600';

    return (
        <div className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-6 group hover:shadow-lg transition-all">
            <div className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center ${themes[color]} border shadow-inner`}>
                {cloneElement(icon, { size: 20 })}
            </div>
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{title}</p>
                <div className="flex items-baseline gap-2">
                    <h2 className={`text-5xl font-black tracking-tighter ${numberColor}`}>{count}</h2>
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">{label}</span>
                </div>
            </div>
        </div>
    )
}