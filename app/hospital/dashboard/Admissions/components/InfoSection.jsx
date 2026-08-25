"use client";

import React from 'react';

// Section Card Container
export const InfoSection = ({ title, children }) => (
  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm w-full block space-y-3">
    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2.5 flex items-center gap-2">
      {title}
    </h4>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>
  </div>
);

// Individual Field Display Box
export const InfoItem = ({ label, value }) => (
  <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5 leading-none">{label}</p>
    <p className="text-xs font-black text-slate-800 truncate">{value || 'N/A'}</p>
  </div>
);

// Animated Loading Spinner
export const SpinnerIcon = ({ className }) => (
  <svg className={className || "w-5 h-5 animate-spin"} fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);