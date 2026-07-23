'use client'
import React from 'react'
import { FaCheckCircle, FaFlask } from 'react-icons/fa'
import { useAuth } from '@/app/context/AuthContext'

export default function ReportSummaryParametersPage({ 
  order = {}, 
  patientName = "Patient", 
  testResultsData = [] 
}) {
  const { labVendor } = useAuth() || {};

  // Resolve dynamic Lab Name from auth or order data
  const resolvedLabName = labVendor?.labName || order?.labId?.name || order?.labName || "HK Clinic";

  // Flat array of all parameters parsed dynamically from API test results
  const tests = testResultsData || order.testResults || [];

  // Range evaluation logic
  const evaluateRange = (value, min, max) => {
    if (!value || isNaN(value)) return 'normal';
    const val = parseFloat(value);
    const minVal = parseFloat(min);
    const maxVal = parseFloat(max);
    if (!isNaN(minVal) && val < minVal) return 'low';
    if (!isNaN(maxVal) && val > maxVal) return 'high';
    return 'normal';
  };

  // Compile all parameters dynamically from API
  const compiledParameters = [];
  tests.forEach(test => {
    test.parameters?.forEach(p => {
      const status = evaluateRange(p.value, p.minRef, p.maxRef);
      compiledParameters.push({
        name: p.name || 'Unnamed Parameter',
        value: `${p.value ?? 'N/A'} ${p.unit || ''}`,
        status: status
      });
    });
  });

  // Calculate dynamic health score purely from the raw database numbers
  const totalCount = compiledParameters.length;
  const normalCount = compiledParameters.filter(p => p.status === 'normal').length;
  const healthScore = totalCount > 0 ? Math.round((normalCount / totalCount) * 100) : 100;

  // Format dynamic dates
  const bookingId = order?.bookingId || "N/A";
  const displayDate = order?.appointmentDate 
    ? formatDate(order.appointmentDate) 
    : "N/A";

  function formatDate(dateStr) {
    try {
      const date = new Date(dateStr);
      if (isNaN(date)) return "";
      const day = String(date.getDate()).padStart(2, '0');
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return `${day}/${months[date.getMonth()]}/${date.getFullYear()}`;
    } catch {
      return "";
    }
  }

  // To fit precisely within A4 height limit, we render up to 8 top parameters on this summary page
  const visibleParameters = compiledParameters.slice(0, 8);

  return (
    /* Strict A4 Page Dimensions (794px x 1123px) */
    <div className="w-[794px] h-[1123px] min-h-[1123px] max-h-[1123px] mx-auto bg-white border border-gray-200 rounded-[2rem] shadow-xl overflow-hidden font-sans relative flex flex-col justify-between shrink-0 p-10 select-none">
      
      {/* Top Banner Wrapper */}
      <div className="flex flex-col">
        {/* ========================================= */}
        {/* 🟢 TOP BANNER                             */}
        {/* ========================================= */}
        <div className="bg-[#00a859] px-10 py-5 flex justify-between items-center text-white shrink-0 rounded-2xl shadow-xs">
          {/* Left Side: Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="bg-white px-3 py-1.5 rounded-xl shrink-0 flex items-center justify-center">
              <img 
                src="/logo.png" 
                alt="Health Kangaroo Logo" 
                className="h-10 w-auto object-contain" 
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
      </div>

      {/* ========================================= */}
      {/* 📄 WELCOME & CIRCULAR HEALTH SCORE CARD    */}
      {/* ========================================= */}
      <div className="grid grid-cols-12 gap-6 items-center my-6 shrink-0 px-4">
        
        {/* Hello Text Area */}
        <div className="col-span-8 space-y-3">
          <h2 className="text-3xl font-black text-slate-800 tracking-tight leading-none">Hello {patientName},</h2>
          <p className="text-sm text-slate-600 leading-relaxed font-bold">
            We have processed your diagnostic samples for <span className="text-[#00a859] font-black">{resolvedLabName}</span>. Below is your dynamic body ecosystem health score card:
          </p>
        </div>

        {/* Circular Gauge Area */}
        <div className="col-span-4 flex justify-end">
          <div className="w-40 h-40 bg-[#00a859] rounded-full flex flex-col items-center justify-center text-white shadow-lg shadow-emerald-100">
            <span className="text-4xl font-black leading-none">{healthScore}</span>
            <span className="text-[10px] font-black uppercase tracking-wider opacity-90 mt-2">Score / 100</span>
          </div>
        </div>

      </div>

      {/* ========================================= */}
      {/* 📊 KEY PARAMETERS STATUS TABLE SECTION     */}
      {/* ========================================= */}
      <div className="flex-grow flex flex-col justify-center px-4 py-4 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
          <h3 className="text-xl font-black text-slate-800 tracking-tight">Key Parameters Status</h3>
          <span className="text-[10px] text-slate-400 font-bold">Booking ID: {bookingId} {displayDate && `• Date: ${displayDate}`}</span>
        </div>
        
        <div className="space-y-3.5">
          {visibleParameters.length > 0 ? (
            visibleParameters.map((param, index) => {
              const isNormal = param.status === 'normal';
              return (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-4 rounded-xl bg-slate-50/70 border border-slate-100 shadow-xs hover:bg-slate-50 transition-colors animate-fade-in"
                >
                  {/* Parameter Name */}
                  <span className="text-sm font-black text-slate-700 w-1/2">{param.name}</span>
                  
                  {/* Measured Value */}
                  <span className="text-sm font-black text-slate-800 w-1/4 text-center">{param.value}</span>
                  
                  {/* Health Status Indicator */}
                  <div className="flex items-center justify-end gap-2 w-1/4 shrink-0">
                    <span className={`w-2.5 h-2.5 rounded-full ${isNormal ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`}></span>
                    <span className={`text-xs font-black uppercase tracking-tight ${isNormal ? 'text-emerald-600' : 'text-red-500'}`}>
                      {isNormal ? 'Everything looks good' : 'Concern'}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-20 text-slate-400 italic flex flex-col items-center gap-2">
              <FaFlask className="text-3xl text-slate-300 animate-pulse" />
              <span>No processed test parameters found.</span>
            </div>
          )}
        </div>
      </div>

      {/* ========================================= */}
      {/* 🟢 SOLID PRIORITY BANNER FOOTER            */}
      {/* ========================================= */}
      <div className="bg-[#007a3e] px-8 py-4 rounded-2xl flex justify-between items-center text-white text-[10px] font-black uppercase tracking-wider shrink-0 mt-4 border border-emerald-800">
        <div className="flex items-center gap-2">
          <FaCheckCircle className="text-emerald-300" size={14} />
          <span>Your Health is our priority. Stay consistent with regular checkups.</span>
        </div>
        
        {/* Heart Beat pulse footer decoration */}
        <div className="flex items-center gap-1 opacity-80 shrink-0">
          <svg width="60" height="14" viewBox="0 0 60 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-emerald-300">
            <path d="M1 7H15L19 1L24 13L29 5L32 7H59" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

    </div>
  )
}