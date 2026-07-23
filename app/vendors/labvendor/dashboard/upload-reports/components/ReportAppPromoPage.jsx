'use client'
import React from 'react'
import { 
  FaUser, FaCalendarAlt, FaShieldAlt, FaHome, FaLock, 
  FaCheckCircle, FaFlask, FaUserMd, FaBrain, FaHeartbeat,
  FaFileInvoice, FaEye, FaHandHoldingHeart, FaInfoCircle,
  FaUserNurse, FaAmbulance, FaPills, FaClipboardList, FaShoppingBag,
  FaApple, FaGooglePlay, FaCheckSquare, FaBolt, FaHeadphones
} from 'react-icons/fa'
import { useAuth } from '@/app/context/AuthContext'

export default function ReportAppPromoPage({ order = {} }) {
  const { labVendor } = useAuth() || {};

  // Resolve dynamic NABL Number to show consistently on page elements
  const resolvedNablNumber = 
    order?.labId?.documents?.nablNumber || 
    order?.documents?.nablNumber || 
    labVendor?.documents?.nablNumber || 
    labVendor?.nablNumber || 
    "mc-6666";

  return (
    /* Strict A4 Page Dimensions (794px x 1123px) */
    <div className="w-[794px] h-[1123px] min-h-[1123px] max-h-[1123px] mx-auto bg-white border border-gray-200 rounded-[2rem] shadow-xl overflow-hidden font-sans relative flex flex-col justify-between shrink-0 p-8 select-none">
      
      {/* Top Section Group */}
      <div className="flex flex-col">
        {/* ========================================= */}
        {/* 🟢 TOP BANNER                             */}
        {/* ========================================= */}
        <div className="bg-[#00a859] px-10 py-5 flex justify-between items-center text-white shrink-0 rounded-2xl shadow-xs">
          
          {/* Left Side: Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="bg-white px-3 py-1.5 rounded-xl shrink-0 flex items-center justify-center shadow-sm">
              <img 
                src="/logo.png" 
                alt="Health Kangaroo Logo" 
                className="h-10 w-auto object-contain" 
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <div>
              <span className="text-sm font-black tracking-wider block leading-none">Health Kangaroo</span>
              <span className="text-[8px] opacity-80 uppercase tracking-widest font-bold">One-Stop Healthcare Solution</span>
            </div>
          </div>

          {/* Right Side: Smart Report Badge */}
          <div className="border border-white/60 bg-white/10 px-4 py-1.5 rounded-lg text-xs font-black tracking-wide uppercase shrink-0">
            Smart Report 3.0
          </div>
        </div>

        {/* ========================================= */}
        {/* 📱 APP HERO PROMOTION BLOCK (GRID)       */}
        {/* ========================================= */}
        <div className="grid grid-cols-12 gap-6 items-center mt-6 shrink-0">
          
          {/* Left Block: Info & Value Props */}
          <div className="col-span-7 space-y-4">
            <div>
              <h1 className="text-4xl font-black text-slate-800 leading-tight">Your Health,<br /><span className="text-[#00a859]">Our Priority</span></h1>
              <p className="text-xs text-slate-400 font-bold mt-1">One app for all your healthcare needs. Book, Track & Stay Healthy.</p>
            </div>

            {/* About Box */}
            <div className="border border-slate-100 bg-slate-50/50 rounded-2xl p-4">
              <h3 className="text-xs font-black text-[#00a859] uppercase tracking-wider mb-2">About Health Kangaroo</h3>
              <p className="text-[10px] text-slate-500 leading-relaxed font-bold">
                Health Kangaroo is a one-stop healthcare platform that connects you with trusted medical services, accurate lab reports, genuine medicines and expert care – all in one app.
              </p>
            </div>

            {/* Icons Grid */}
            <div className="grid grid-cols-2 gap-3 text-[10px] font-bold text-slate-600">
              <div className="flex items-center gap-2"><FaUser className="text-[#00a859]" /> <span>Trusted by 100,000+ Users</span></div>
              <div className="flex items-center gap-2"><FaUserMd className="text-[#00a859]" /> <span>Verified Doctors</span></div>
              <div className="flex items-center gap-2"><FaShieldAlt className="text-[#00a859]" /> <span>NABL Accredited Tests</span></div>
              <div className="flex items-center gap-2"><FaBolt className="text-[#00a859]" /> <span>Fast & Reliable</span></div>
              <div className="flex items-center gap-2"><FaLock className="text-[#00a859]" /> <span>Secure & Confidential</span></div>
              <div className="flex items-center gap-2"><FaHeadphones className="text-[#00a859]" /> <span>24/7 Support</span></div>
            </div>
          </div>

          {/* Right Block: High-Fidelity App UI Mockup (Matches image exactly) */}
          <div className="col-span-5 flex justify-end">
            <div className="w-[190px] h-[340px] bg-slate-50 rounded-[2.5rem] border-4 border-slate-100 overflow-hidden flex flex-col relative shadow-xl shrink-0">
              
              {/* Phone Top Half (Green) */}
              <div className="bg-[#00a859] h-1/2 p-4 flex flex-col justify-center text-white relative">
                <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center mb-2">
                  <FaFlask size={20} />
                </div>
                <h4 className="text-sm font-black leading-tight">Assign Staff</h4>
                <p className="text-[7px] opacity-90 mt-1 leading-tight">Select an active phlebotomist</p>
              </div>

              {/* Phone Bottom Half (Grey) */}
              <div className="bg-slate-50 flex-grow p-3 flex flex-col justify-between">
                
                {/* User Info Card */}
                <div className="bg-white p-2 rounded-xl flex items-center gap-2 border border-slate-100 shadow-xs">
                  <div className="w-6 h-6 rounded-full bg-emerald-50 text-[#00a859] flex items-center justify-center shrink-0">
                    <FaUser size={10} />
                  </div>
                  <div className="text-left leading-none">
                    <p className="text-[5px] text-slate-400">TDI, Mohali</p>
                    <p className="text-[8px] font-black text-slate-800 mt-0.5">Hello, Kautsar</p>
                  </div>
                </div>

                {/* Status Indicator Card */}
                <div className="bg-white p-2 rounded-xl flex items-center justify-between border border-slate-100 shadow-xs">
                  <span className="text-[7px] text-slate-600 font-bold">Online 24/7</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ========================================= */}
      {/* 🟢 EVERYTHING YOU NEED GRID CARD          */}
      {/* ========================================= */}
      <div className="border border-slate-150 rounded-[2rem] p-5 shadow-[0_15px_40px_rgba(0,0,0,0.03)] space-y-4">
        <h3 className="text-xs font-black text-[#00a859] uppercase tracking-wider text-center">
          EVERYTHING YOU NEED, ALL IN ONE PLACE
        </h3>
        
        <div className="grid grid-cols-2 gap-3.5">
          
          {/* Item 1: Nurse Booking */}
          <div className="bg-white border border-slate-100 p-3 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#f0faf5] text-[#00a859] flex items-center justify-center shrink-0">
              <FaUserNurse size={16} />
            </div>
            <div className="text-left leading-snug">
              <p className="text-[#00a859] font-black text-xs">Nurse Booking</p>
              <p className="text-[9px] text-slate-400 font-medium mt-0.5">Book verified nurses for elder care, patient care & home assistance.</p>
            </div>
          </div>

          {/* Item 2: Doctor Booking */}
          <div className="bg-white border border-slate-100 p-3 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#f0faf5] text-[#00a859] flex items-center justify-center shrink-0">
              <FaUserMd size={16} />
            </div>
            <div className="text-left leading-snug">
              <p className="text-[#00a859] font-black text-xs">Doctor Booking</p>
              <p className="text-[9px] text-slate-400 font-medium mt-0.5">Consult experienced doctors at home or via video call.</p>
            </div>
          </div>

          {/* Item 3: Ambulance Booking */}
          <div className="bg-white border border-slate-100 p-3 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#f0faf5] text-[#00a859] flex items-center justify-center shrink-0">
              <FaAmbulance size={16} />
            </div>
            <div className="text-left leading-snug">
              <p className="text-[#00a859] font-black text-xs">Ambulance Booking</p>
              <p className="text-[9px] text-slate-400 font-medium mt-0.5">Quick ambulance service in emergencies. 24/7 availability.</p>
            </div>
          </div>

          {/* Item 4: Pharmacy */}
          <div className="bg-white border border-slate-100 p-3 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#f0faf5] text-[#00a859] flex items-center justify-center shrink-0">
              <FaPills size={16} />
            </div>
            <div className="text-left leading-snug">
              <p className="text-[#00a859] font-black text-xs">Pharmacy</p>
              <p className="text-[9px] text-slate-400 font-medium mt-0.5">Order genuine medicines & get fast delivery at your doorstep.</p>
            </div>
          </div>

        </div>
      </div>

      {/* ========================================= */}
      {/* 🟢 BOTTOM: WHY CHOOSE & DOWNLOAD SECTION  */}
      {/* ========================================= */}
      <div className="grid grid-cols-12 gap-6 items-center shrink-0 mb-4">
        
        {/* Why choose Health Kangaroo (Left List) */}
        <div className="col-span-6 space-y-3">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">— Why Choose Health Kangaroo? —</h3>
          <div className="grid grid-cols-1 gap-2 text-[9px] font-bold text-slate-600">
            <div className="flex items-center gap-2"><FaCheckCircle className="text-[#00a859]" /> All-in-One Healthcare Platform</div>
            <div className="flex items-center gap-2"><FaCheckCircle className="text-[#00a859]" /> Trusted & Verified Professionals</div>
            <div className="flex items-center gap-2"><FaCheckCircle className="text-[#00a859]" /> Fast & Convenient Services</div>
            <div className="flex items-center gap-2"><FaCheckCircle className="text-[#00a859]" /> 24/7 Healthcare Support</div>
            <div className="flex items-center gap-2"><FaCheckCircle className="text-[#00a859]" /> Accurate & Reliable Reports</div>
            <div className="flex items-center gap-2"><FaCheckCircle className="text-[#00a859]" /> Home Sample Collection</div>
            <div className="flex items-center gap-2"><FaCheckCircle className="text-[#00a859]" /> Doorstep Medicine Delivery</div>
            <div className="flex items-center gap-2"><FaCheckCircle className="text-[#00a859]" /> Safe & Secure Healthcare</div>
          </div>
        </div>

        {/* Dynamic app stores card (Right block) */}
        <div className="col-span-6 p-5 border border-slate-100 rounded-3xl bg-slate-50/40 relative">
          
          <div className="flex justify-between items-start mb-4">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-[#00a859] uppercase tracking-wider block">Smart Report 3.0</span>
              <p className="text-xs font-black text-slate-800">India's Most Trusted Health Test @Home Service</p>
            </div>
            
            {/* NABL Gear/Seal Representation with resolved NABL number */}
            <div className="flex items-center gap-1.5 border border-slate-150 px-2 py-1 rounded bg-white shrink-0 scale-90">
              <FaCheckSquare className="text-slate-500" size={10} />
              <div className="text-[7px]">
                <p className="font-black text-slate-700 leading-none uppercase">{resolvedNablNumber}</p>
                <p className="text-[6px] text-slate-400 font-bold uppercase mt-0.5">NABL APPROVED</p>
              </div>
            </div>
          </div>

          <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider mb-2">Download Health Kangaroo App:</p>
          
          {/* Download buttons row */}
          <div className="flex gap-2">
            <div className="bg-slate-900 text-white px-3 py-1.5 rounded-xl flex items-center gap-2 cursor-pointer hover:bg-slate-800 transition-colors shrink-0">
              <FaGooglePlay className="text-sm" />
              <div className="text-left leading-tight">
                <p className="text-[7px] font-bold uppercase opacity-80">GET IT ON</p>
                <p className="text-[10px] font-black">Google Play</p>
              </div>
            </div>
            <div className="bg-slate-900 text-white px-3 py-1.5 rounded-xl flex items-center gap-2 cursor-pointer hover:bg-slate-800 transition-colors shrink-0">
              <FaApple className="text-sm" />
              <div className="text-left leading-tight">
                <p className="text-[7px] font-bold uppercase opacity-80">Download on the</p>
                <p className="text-[10px] font-black">App Store</p>
              </div>
            </div>
          </div>
          
        </div>

      </div>

      {/* ========================================= */}
      {/* 🟢 SOLID ADVISORY DISCLAIMER FOOTER       */}
      {/* ========================================= */}
      <div className="bg-[#007a3e] px-8 py-3 rounded-2xl flex justify-between items-center text-white text-[8px] font-black uppercase tracking-wider shrink-0 border border-emerald-800 leading-relaxed text-center sm:text-left">
        <div className="flex items-center gap-2">
          <FaCheckCircle className="text-emerald-300" size={14} />
          <span>This is a promotional health advisory. It is based on your test results and general health information. It is recommended to consult your doctor for a comprehensive evaluation and personalized advice.</span>
        </div>
      </div>

    </div>
  )
}