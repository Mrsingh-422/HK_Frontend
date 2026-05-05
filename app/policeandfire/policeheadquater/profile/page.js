'use client'
import React, { useState } from 'react'
import { 
  FaUserShield, 
  FaIdBadge, 
  FaPhoneAlt, 
  FaEnvelope, 
  FaMapMarkerAlt, 
  FaEdit, 
  FaCamera, 
  FaTimes, 
  FaShieldAlt, 
  FaBriefcase, 
  FaCalendarAlt,
  FaCheckCircle
} from 'react-icons/fa'

export default function PoliceProfilePage() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Mock Profile Data
  const [profile, setProfile] = useState({
    name: "Inspector Karan Singh",
    rank: "Station House Officer (SHO)",
    badge: "9042-MHL",
    station: "Phase 11 Police Headquarter",
    area: "Sector 74, Mohali",
    email: "karan.singh@punjabpolice.gov.in",
    phone: "+91 98765-43210",
    joiningDate: "12 Oct 2015",
    dutyStatus: "On Duty",
    casesHandled: "1,240",
    experience: "9 Years"
  });

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 animate-in fade-in duration-500">
      
      {/* --- PROFILE HEADER CARD --- */}
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden relative">
          {/* Header Accent */}
          <div className="h-48 bg-gradient-to-r from-[#08B36A] to-emerald-700 relative">
             <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
          </div>

          <div className="px-8 pb-8">
            <div className="relative flex flex-col md:flex-row items-end -mt-20 gap-6">
              {/* Profile Image Area */}
              <div className="relative group">
                <div className="w-40 h-40 bg-white p-2 rounded-[2.5rem] shadow-xl">
                  <div className="w-full h-full bg-slate-100 rounded-[2rem] flex items-center justify-center text-slate-300 relative overflow-hidden">
                    <FaUserShield size={80} className="text-slate-200" />
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <FaCamera className="text-white" size={24} />
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-4 right-2 w-6 h-6 bg-[#08B36A] border-4 border-white rounded-full"></div>
              </div>

              {/* Profile Main Info */}
              <div className="flex-1 pb-2">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">{profile.name}</h1>
                    <p className="text-[#08B36A] font-bold text-sm uppercase tracking-[0.15em] flex items-center gap-2 mt-1">
                      <FaShieldAlt /> {profile.rank}
                    </p>
                  </div>
                  <button 
                    onClick={() => setIsEditModalOpen(true)}
                    className="flex items-center justify-center gap-2 bg-slate-800 text-white px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-700 transition-all shadow-xl shadow-slate-200 active:scale-95"
                  >
                    <FaEdit /> Edit Profile
                  </button>
                </div>
              </div>
            </div>

            {/* QUICK STATS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
              <ProfileStat label="Badge ID" value={profile.badge} icon={<FaIdBadge />} />
              <ProfileStat label="Experience" value={profile.experience} icon={<FaBriefcase />} />
              <ProfileStat label="Cases Handled" value={profile.casesHandled} icon={<FaCheckCircle />} />
              <ProfileStat label="Join Date" value={profile.joiningDate} icon={<FaCalendarAlt />} />
            </div>

            {/* DETAILED INFO GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
              {/* Personal & Contact */}
              <div className="space-y-6">
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 border-b border-slate-50 pb-2">
                  Contact Information
                </h3>
                <div className="space-y-4">
                  <InfoRow icon={<FaEnvelope />} label="Govt Email" value={profile.email} />
                  <InfoRow icon={<FaPhoneAlt />} label="Official Phone" value={profile.phone} />
                  <InfoRow icon={<FaMapMarkerAlt />} label="Primary Area" value={profile.area} />
                </div>
              </div>

              {/* Duty Details */}
              <div className="space-y-6">
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 border-b border-slate-50 pb-2">
                   Departmental Details
                </h3>
                <div className="space-y-4">
                  <InfoRow icon={<FaShieldAlt />} label="Current HQ" value={profile.station} />
                  <div className="p-4 bg-green-50 rounded-2xl border border-green-100 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">Duty Status</p>
                      <p className="text-sm font-black text-green-700 mt-1">Authorized & On Duty</p>
                    </div>
                    <div className="w-3 h-3 bg-[#08B36A] rounded-full animate-pulse shadow-[0_0_10px_#08B36A]"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- EDIT PROFILE MODAL --- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#08B36A] text-white rounded-xl shadow-lg shadow-green-100">
                        <FaUserShield size={20} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-800 tracking-tight">Modify Profile</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Law Enforcement Credentials</p>
                    </div>
                </div>
                <button onClick={() => setIsEditModalOpen(false)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                    <FaTimes size={20} />
                </button>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="col-span-2">
                 <InputLabel label="Full Name & Rank" />
                 <input type="text" defaultValue={profile.name} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-[#08B36A]/20 outline-none" />
               </div>
               <div>
                 <InputLabel label="Badge Number" />
                 <input type="text" defaultValue={profile.badge} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-[#08B36A]/20 outline-none" />
               </div>
               <div>
                 <InputLabel label="Official Contact" />
                 <input type="text" defaultValue={profile.phone} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-[#08B36A]/20 outline-none" />
               </div>
               <div className="col-span-2">
                 <InputLabel label="Email Address" />
                 <input type="email" defaultValue={profile.email} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-[#08B36A]/20 outline-none" />
               </div>
            </div>

            <div className="p-8 bg-slate-50 flex gap-4">
              <button onClick={() => setIsEditModalOpen(false)} className="flex-1 py-4 bg-white border border-slate-200 text-slate-500 font-black text-[11px] uppercase tracking-widest rounded-2xl hover:bg-slate-100 transition-all">Cancel</button>
              <button onClick={() => setIsEditModalOpen(false)} className="flex-1 bg-[#08B36A] text-white py-4 rounded-2xl text-[11px] font-black shadow-xl shadow-green-100 uppercase tracking-widest hover:bg-[#07a25f] transition-all">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// --- SUB-COMPONENTS ---

function ProfileStat({ label, value, icon }) {
  return (
    <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 flex items-center gap-4 group hover:bg-[#08B36A] transition-all duration-300">
      <div className="p-3 bg-white rounded-2xl text-slate-400 group-hover:text-[#08B36A] transition-colors shadow-sm">
        {icon}
      </div>
      <div>
        <p className="text-[9px] font-black text-slate-400 group-hover:text-white/70 uppercase tracking-widest">{label}</p>
        <p className="text-sm font-black text-slate-700 group-hover:text-white transition-colors">{value}</p>
      </div>
    </div>
  )
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-4 p-1">
      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-tight">{label}</p>
        <p className="text-sm font-bold text-slate-700">{value}</p>
      </div>
    </div>
  )
}

function InputLabel({ label }) {
  return (
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1 mb-2 block">
      {label}
    </label>
  )
}