"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  ShieldAlert, Clock, RefreshCw, Sparkles, Activity, Shield
} from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5002";

export default function WebsiteGuard({ children }) {
  const [maintenance, setMaintenance] = useState({ isEnabled: false, data: null });
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  const checkMaintenance = async () => {
    try {
      setChecking(true);
      const res = await axios.get(`${BACKEND_URL}/api/maintenance/status`);
      const isEnabled = Boolean(res.data?.isEnabled || res.data?.data?.isEnabled);
      
      if (isEnabled) {
        setMaintenance({
          isEnabled: true,
          data: res.data?.data || res.data
        });
      } else {
        setMaintenance({ isEnabled: false, data: null });
      }
    } catch (err) {
      console.error("Maintenance check error:", err);
    } finally {
      setLoading(false);
      setChecking(false);
    }
  };

  useEffect(() => {
    checkMaintenance();
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 z-[9999999] bg-[#070d18] flex flex-col items-center justify-center gap-3 text-white text-xs font-mono">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
        <span className="text-slate-400">Verifying system operational status...</span>
      </div>
    );
  }

  // 🚨 100% FULL-SCREEN MAINTENANCE INTERCEPTION SCREEN
  if (maintenance.isEnabled) {
    const info = maintenance.data;
    const bannerUrl = info?.heroImage 
      ? (info.heroImage.startsWith('http') ? info.heroImage : `${BACKEND_URL}${info.heroImage}`)
      : "https://healthvideos12-new1.s3.us-west-2.amazonaws.com/1742900654_Health_Kangaroo-1_1.png";

    return (
      <div className="fixed inset-0 z-[999999999] w-screen h-screen bg-[#070d18] text-white flex flex-col justify-between p-6 sm:p-10 md:p-14 overflow-y-auto font-sans selection:bg-emerald-500 selection:text-white">
        
        {/* Ambient Background Glow Effects */}
        <div className="fixed -top-40 -left-40 w-96 h-96 bg-emerald-500/15 rounded-full blur-[120px] pointer-events-none animate-pulse" />
        <div className="fixed -bottom-40 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse duration-1000" />

        {/* --- Top Brand Navbar --- */}
        <header className="relative z-10 w-full max-w-6xl mx-auto flex items-center justify-between pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="Health Kangaroo Logo" 
              className="h-10 w-auto object-contain brightness-0 invert" 
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="flex flex-col">
              <span className="text-base font-black tracking-tight text-white uppercase italic">
                Health <span className="text-[#08B36A]">Kangaroo</span>
              </span>
              <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase">
                Healthcare Solutions
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full text-xs font-mono text-emerald-400 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-bold">Maintenance Mode Active</span>
          </div>
        </header>

        {/* --- Central Main Content --- */}
        <main className="relative z-10 w-full max-w-6xl mx-auto my-auto py-8 flex flex-col-reverse lg:flex-row items-center justify-between gap-12">
          
          {/* Left Text & Actions */}
          <div className="flex-1 max-w-2xl text-left space-y-6">
            
            {/* Tag Pill */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/20 text-[#fbbf24] px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
              <Sparkles size={13} className="text-[#fbbf24] animate-spin" />
              Scheduled Platform Upgrade
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
              {info?.title || "System Under Scheduled Maintenance"}
            </h1>

            {/* Message Description */}
            <p className="text-slate-300 text-sm sm:text-base md:text-lg leading-relaxed font-normal">
              {info?.message || "We are currently improving our healthcare services, laboratory queues, and ambulance fleet routing to serve you better. We will be back online shortly."}
            </p>

            {/* Estimated Uptime Banner */}
            {info?.estimatedEndTime && (
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-5 py-3 rounded-2xl w-fit shadow-xl">
                <Clock className="text-amber-400 shrink-0" size={18} />
                <div className="text-xs">
                  <span className="text-slate-400 block font-medium">Estimated Re-opening Time:</span>
                  <span className="font-bold text-white font-mono">{new Date(info.estimatedEndTime).toLocaleString()}</span>
                </div>
              </div>
            )}

            {/* Interactive Retry Button */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={checkMaintenance}
                disabled={checking}
                className="px-8 py-3.5 bg-[#08B36A] hover:bg-[#06965a] text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/20 transition-all transform active:scale-95 text-xs uppercase tracking-wider flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw size={15} className={checking ? "animate-spin" : ""} />
                {checking ? "Checking System Status..." : "Check Status Again"}
              </button>

              <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <Shield size={14} className="text-slate-400" />
                <span>Patient data & records remain fully protected</span>
              </div>
            </div>

            {/* Decorative Yellow Bar */}
            <div className="w-20 h-1.5 bg-[#08B36A] rounded-full mt-4" />
          </div>

          {/* Right Hero Image Card with Float Animation */}
          <div className="w-full lg:w-auto flex justify-center shrink-0">
            <div className="relative group">
              {/* Outer Glow Ring */}
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-amber-500 rounded-[3.5rem] blur-xl opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 animate-tilt" />
              
              <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-[420px] md:h-[420px] rounded-[3rem] bg-gradient-to-b from-[#131e30] to-[#0d1624] border border-white/10 p-8 flex items-center justify-center shadow-2xl overflow-hidden">
                <img
                  src={bannerUrl}
                  alt="Maintenance Illustration"
                  className="w-full h-full object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)] transition-transform duration-700 hover:scale-105"
                />
              </div>
            </div>
          </div>

        </main>

        {/* --- Bottom Footer Notice --- */}
        <footer className="relative z-10 w-full max-w-6xl mx-auto pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <p>© {new Date().getFullYear()} Health Kangaroo. All rights reserved.</p>
          <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
            <span>HELPLINE: +91 9879879879</span>
            <span>•</span>
            <span>EMERGENCY AMBULANCE 24/7 ACTIVE</span>
          </div>
        </footer>

      </div>
    );
  }

  // 🟢 Normal Website Render
  return <>{children}</>;
}