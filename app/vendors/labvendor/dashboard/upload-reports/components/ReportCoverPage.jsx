'use client'
import React from 'react'
import { 
  FaUser, FaCalendarAlt, FaShieldAlt, FaHome, FaLock, 
  FaCheckCircle, FaFlask, FaUserMd, FaBrain, FaCheck, FaVial
} from 'react-icons/fa'
import { useAuth } from '@/app/context/AuthContext'

export default function ReportCoverPage({ 
  order = {}, 
  patientName = "Mrs Kriti Tiwari", 
  patientAge = "31 Yrs", 
  patientGender = "Female",
  labName = "HK Clinic"
}) {
  const { labVendor } = useAuth() || {};

  const getLabField = (fieldPath) => {
    const sources = [
      order?.labId,
      order?.lab,
      order,
      labVendor,
      labVendor?.data
    ];
    
    for (const source of sources) {
      if (!source) continue;
      
      if (fieldPath === 'name') {
        const val = source.name || source.labName || source.labId?.name;
        if (val) return val;
      }
      if (fieldPath === 'nablNumber') {
        const val = source.documents?.nablNumber || source.nablNumber || source.documentsState?.nablNumber;
        if (val) return val;
      }
    }
    return null;
  };

  const resolvedLabName = getLabField('name') || (labName !== "HK Clinic" ? labName : "Health Kangaroo Labs");
  const resolvedNablNumber = getLabField('nablNumber') || "MC-6666";

  const formattedCollectionDate = order?.appointmentDate 
    ? formatDate(order.appointmentDate) 
    : "31/Mar/2026";

  const bookingId = order?.bookingId || "17568565289";
  const displayAge = patientAge 
    ? (String(patientAge).toLowerCase().includes('yrs') ? patientAge : `${patientAge} Yrs`) 
    : "31 Yrs";

  // Dynamic extraction of test / package names
  const getDisplayTestName = () => {
    const directTests = order.items?.tests?.map(t => t.name) || [];
    const packageTests = order.items?.packages?.map(p => p.name || p.packageName) || [];
    const allNames = [...directTests, ...packageTests];
    if (allNames.length > 0) return allNames.join(', ');
    if (order.testName) return order.testName;
    if (order.packageName) return order.packageName;
    return "Comprehensive Diagnostic Panel";
  };

  const resolvedTestName = getDisplayTestName();

  const qrDataText = `Health Kangaroo Smart Report
============================
Booking ID: ${bookingId}
Test Name: ${resolvedTestName}
Lab Name: ${resolvedLabName}
Patient Name: ${patientName}
Age / Gender: ${patientGender}, ${displayAge}
Collection Date: ${formattedCollectionDate}
Verified Status: Authentic ✅`;

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrDataText)}`;

  function formatDate(dateStr) {
    try {
      if (!dateStr) return "31/Mar/2026"
      const date = new Date(dateStr)
      if (isNaN(date.getTime())) return "31/Mar/2026"
      const day = String(date.getDate()).padStart(2, '0')
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      const month = months[date.getMonth()]
      const year = date.getFullYear()
      return `${day}/${month}/${year}`
    } catch {
      return "31/Mar/2026"
    }
  }

  return (
    /* Strict A4 Page Dimensions (794px x 1123px) */
    <div className="w-[794px] h-[1123px] min-h-[1123px] max-h-[1123px] mx-auto bg-gradient-to-b from-[#f3f9f6] to-white border border-gray-200 rounded-[2rem] shadow-xl overflow-hidden font-sans relative flex flex-col justify-between shrink-0 select-none">
      
      {/* Top Section */}
      <div className="flex flex-col">
        
        {/* Top Banner */}
        <div className="bg-[#00a859] px-10 py-5 flex justify-between items-center text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-white px-3 py-1.5 rounded-xl shrink-0 flex items-center justify-center shadow-xs">
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

          <div className="border border-white/60 bg-white/10 px-4 py-1.5 rounded-lg text-xs font-black tracking-wide uppercase shrink-0">
            Smart Report 3.0
          </div>
        </div>

        {/* Hero Section */}
        <div className="px-10 pt-8 pb-3 grid grid-cols-12 gap-4 items-center relative overflow-hidden shrink-0">
          
          <div className="col-span-6 space-y-4 z-10">
            <div>
              <p className="text-2xl font-bold text-[#0e1e38] tracking-tight">India's Trusted</p>
              <h1 className="text-4xl font-black text-[#00a859] leading-none mt-1">Health Test</h1>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight mt-1.5">{resolvedLabName}</h2>
            </div>

            <div className="flex items-center gap-2 w-full max-w-[220px]">
              <div className="h-[2px] bg-emerald-200 flex-grow"></div>
              <svg width="34" height="16" viewBox="0 0 34 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#00a859] shrink-0">
                <path d="M1 8H10L13 1L17 15L21 6L23 8H33" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div className="h-[2px] bg-emerald-200 flex-grow"></div>
            </div>

            <div className="inline-flex items-center gap-3 bg-white border border-slate-150 px-4 py-2 rounded-xl shadow-xs">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4l3 3" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-black text-slate-800 leading-none">NABL</p>
                <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Accredited</p>
                <p className="text-[10px] text-[#00a859] font-black mt-0.5 uppercase">{resolvedNablNumber}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-1">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
                <div className="w-6 h-6 rounded-full border border-[#00a859] flex items-center justify-center text-[#00a859] text-[10px] shrink-0"><FaCheck size={8}/></div>
                Trusted Labs
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
                <div className="w-6 h-6 rounded-full border border-[#00a859] flex items-center justify-center text-[#00a859] text-[10px] shrink-0"><FaHome size={10}/></div>
                Home Collection
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
                <div className="w-6 h-6 rounded-full border border-[#00a859] flex items-center justify-center text-[#00a859] text-[10px] shrink-0"><FaLock size={10}/></div>
                100% Secure
              </div>
            </div>
          </div>

          <div className="col-span-6 flex justify-end relative">
            <div className="relative w-64 h-64 bg-emerald-100/60 rounded-full flex items-center justify-center overflow-hidden border-4 border-white shadow-lg shrink-0">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#00a859_1.5px,transparent_1.5px)] [background-size:12px_12px]"></div>
              
              <img 
                src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=400&auto=format&fit=crop" 
                alt="Medical Experts" 
                className="w-full h-full object-cover mt-4 scale-110 object-top"
                onError={(e) => {
                  e.currentTarget.src = "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400";
                }}
              />
            </div>
          </div>

        </div>

      </div>

      {/* Patient Card Block */}
      <div className="px-10 pb-8 flex-grow flex flex-col justify-center">
        <div className="bg-white rounded-[2rem] border border-slate-100 p-7 shadow-[0_20px_50px_rgba(0,0,0,0.04)] space-y-4">
          
          <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100/60">
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-[#00a859] flex items-center justify-center shrink-0">
              <FaCalendarAlt size={14} />
            </div>
            <div className="text-xs font-bold text-slate-600 space-y-0.5">
              <p>Booking ID : <span className="text-slate-800 font-black">{bookingId}</span></p>
              <p className="text-[11px] text-slate-400">Sample Collection Date : <span className="text-slate-700 font-extrabold">{formattedCollectionDate}</span></p>
            </div>
          </div>

          <div className="flex items-center gap-4 py-1.5 border-b border-dashed border-slate-100">
            <div className="w-14 h-14 bg-[#00a859] text-white rounded-full flex items-center justify-center shadow-md shadow-emerald-100 shrink-0">
              <FaUser size={22} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight relative pb-1">
                {patientName}
                <span className="absolute bottom-0 left-0 w-24 h-[3px] bg-[#00a859] rounded-full"></span>
              </h2>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">{patientGender}, {displayAge}</p>
            </div>
          </div>

          {/* Test Name Block */}
          <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-3.5 flex items-start gap-3">
            <div className="p-2 bg-[#00a859] text-white rounded-xl shrink-0 mt-0.5">
              <FaVial size={13} />
            </div>
            <div>
              <span className="text-[9px] font-black uppercase text-emerald-800 tracking-widest block leading-none">Diagnostic Test / Package</span>
              <p className="text-sm font-black text-slate-800 mt-1 line-clamp-2 leading-snug">{resolvedTestName}</p>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2 rounded-full text-xs font-bold shadow-xs w-fit">
            <FaBrain /> AI Based Personalized Report for You
          </div>

          <div className="bg-[#f0faf5] rounded-2xl p-4 border border-emerald-100/60 relative overflow-hidden flex flex-col sm:flex-row items-center gap-5">
            <div className="w-20 h-20 bg-white p-2 rounded-xl border border-emerald-100 shadow-sm shrink-0 flex items-center justify-center">
              <img src={qrCodeUrl} alt="verification qr code" className="w-full h-full object-contain" />
            </div>

            <div className="space-y-1 relative z-10 text-center sm:text-left flex-grow">
              <p className="text-xs font-black text-slate-800 tracking-tight leading-snug">
                INDIA'S FIRST & ONLY CREDIBILITY CHECK FOR YOUR LAB REPORT
              </p>
              <p className="text-[10px] text-slate-400 font-bold">
                Check the authenticity of your lab report with machine data.
              </p>
              <p className="text-[10px] text-[#00a859] font-black uppercase tracking-wider pt-0.5">
                Scan the QR using any QR code scanner
              </p>
            </div>

            <div className="absolute right-4 bottom-2 opacity-5 pointer-events-none text-[#00a859]">
              <FaCheckCircle size={90} />
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Strip */}
      <div className="bg-[#007a3e] px-8 py-4 grid grid-cols-4 gap-4 text-white text-[10px] font-black uppercase tracking-wider border-t border-emerald-800 shrink-0">
        <div className="flex items-center gap-2 justify-center border-r border-white/10 last:border-0">
          <FaFlask className="text-emerald-300" size={14} /> Advanced Technology
        </div>
        
        <div className="flex items-center gap-2 justify-center border-r border-white/10 last:border-0">
          <FaCheckCircle className="text-emerald-300" size={14} /> Accurate Results
        </div>
        
        <div className="flex items-center gap-2 justify-center border-r border-white/10 last:border-0">
          <FaUserMd className="text-emerald-300" size={14} /> Expert Support
        </div>
        
        <div className="flex items-center gap-2 justify-center last:border-0">
          <FaLock className="text-emerald-300" size={14} /> Your Data is Safe
        </div>
      </div>

    </div>
  )
}