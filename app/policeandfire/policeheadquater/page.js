'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { 
  FaShieldAlt, 
  FaUserShield, 
  FaHistory, 
  FaExclamationCircle, 
  FaMapMarkerAlt,
  FaClock,
  FaArrowRight,
  FaFileMedical
} from 'react-icons/fa'

export default function PoliceDashboard() {
  // Demo Data for Live Activity
  const recentActivity = [
    { id: 'MLC-901', victim: 'Nitish Sharma', type: 'Road Accident', location: 'Sector 74', time: '2 mins ago', status: 'Fresh' },
    { id: 'MLC-882', victim: 'Arjun Singh', type: 'Assault', location: 'Tdi City', time: '15 mins ago', status: 'Pending' },
    { id: 'MLC-775', victim: 'Priya Verma', type: 'Poisoning', location: 'Phase 7', time: '1 hour ago', status: 'Investigating' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700 font-sans p-2">
      
      {/* --- HEADER --- */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Command Center</h1>
          <p className="text-slate-500 font-medium">Police Headquarters • Mohali Division</p>
        </div>
        <div className="hidden md:block text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Status</p>
            <p className="text-[#08B36A] font-bold text-sm flex items-center gap-2 justify-end">
                <span className="w-2 h-2 bg-[#08B36A] rounded-full animate-pulse"></span> Encrypted & Online
            </p>
        </div>
      </div>

      {/* --- FIRST SECTION: STATISTICAL DATA CARDS (3 Columns - No Navigation) --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <StatDataCard 
          title="Fresh Case" 
          count="00" 
          label="New Reports Today"
          icon={<FaFileMedical />}
          themeColor="blue"
        />

        <StatDataCard 
          title="Pending Case" 
          count="01" 
          label="Active Investigations"
          icon={<FaExclamationCircle />}
          themeColor="orange"
        />

        <StatDataCard 
          title="History Case" 
          count="42" 
          label="Resolved MLC Cases"
          icon={<FaHistory />}
          themeColor="emerald"
        />
      </div>

      {/* --- LOWER SECTION: LIVE FEED & OFFICER STATUS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Live MLC Feed */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center">
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-3">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
              Live MLC Broadcasts
            </h3>
            <Link href="/policeandfire/policeheadquater/freshcase" className="text-[#08B36A] text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:underline transition-all">
              View All <FaArrowRight />
            </Link>
          </div>
          
          <div className="p-2">
            {recentActivity.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-blue-500 transition-all">
                    <FaShieldAlt size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-700">{item.victim}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] font-bold text-red-500 uppercase">{item.type}</span>
                      <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                        <FaMapMarkerAlt size={8}/> {item.location}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1 justify-end">
                    <FaClock size={8}/> {item.time}
                  </span>
                  <div className="mt-1 px-2 py-0.5 bg-blue-50 text-blue-600 text-[9px] font-black rounded uppercase">
                    {item.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Contacts / Duty Officers */}
        <div className="bg-[#08B36A] rounded-[2.5rem] p-8 text-white shadow-xl shadow-green-100 flex flex-col justify-between relative overflow-hidden">
          <FaUserShield className="absolute -right-10 -bottom-10 text-white/10" size={240} />
          
          <div className="relative z-10">
            <h3 className="text-xl font-black leading-tight mb-2">Duty Roster <br/> Officers</h3>
            <p className="text-white/70 text-xs font-bold uppercase tracking-widest">Active Shift: Morning</p>
          </div>

          <div className="space-y-4 relative z-10 my-8">
            <OfficerMini name="Insp. Vikram Singh" badge="#901" />
            <OfficerMini name="SI Rajesh Kumar" badge="#224" />
            <OfficerMini name="Officer Amit Verma" badge="#112" />
          </div>

          <button className="relative z-10 w-full bg-white text-[#08B36A] py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg hover:bg-slate-50 transition-all active:scale-95">
             Deploy Emergency Task
          </button>
        </div>

      </div>
    </div>
  )
}

// --- UPDATED STAT DATA CARD COMPONENT (NUMBER FOCUS - NO NAV) ---
function StatDataCard({ title, count, label, icon, themeColor }) {
  const themes = {
    blue: "text-blue-600 bg-blue-50",
    orange: "text-orange-600 bg-orange-50",
    emerald: "text-emerald-600 bg-emerald-50"
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 relative overflow-hidden flex flex-col items-center justify-center text-center">
      {/* Ghost Background Icon for Design */}
      <div className={`absolute -right-6 -bottom-6 opacity-[0.03] rotate-12 scale-[2.5] ${themes[themeColor].split(' ')[0]}`}>
        {React.cloneElement(icon, { size: 100 })}
      </div>

      <div className="relative z-10">
        <div className="flex flex-col items-center">
          {/* Section Indicator */}
          <div className="flex items-center gap-2 mb-4 px-3 py-1 bg-slate-50 rounded-full border border-slate-100">
             <span className={`${themes[themeColor].split(' ')[0]}`}>
                {React.cloneElement(icon, { size: 12 })}
             </span>
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</span>
          </div>

          {/* Massive Bold Number */}
          <h2 className={`text-7xl font-black tracking-tighter ${themes[themeColor].split(' ')[0]} drop-shadow-sm`}>
            {count}
          </h2>

          {/* Sub-label */}
          <p className="mt-2 text-xs font-bold text-slate-500 uppercase tracking-widest opacity-60">
            {label}
          </p>
        </div>
      </div>
    </div>
  )
}

function OfficerMini({ name, badge }) {
    return (
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-[10px]">
                {badge}
            </div>
            <span className="text-sm font-bold">{name}</span>
        </div>
    )
}