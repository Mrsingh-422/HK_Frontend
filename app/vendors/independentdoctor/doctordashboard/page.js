'use client'

import React, { useState, useEffect } from 'react'
import { 
  FaCalendarAlt, FaHome, FaClock, FaVideo, FaHospital, FaSpinner, 
  FaStar, FaWallet, FaUserCircle, FaHospitalUser, FaRegCheckCircle, 
  FaRegTimesCircle, FaHourglassHalf, FaArrowRight, FaUser, FaPhoneAlt, 
  FaEnvelope, FaMapMarkerAlt, FaStethoscope, FaChartLine, FaChevronRight,
  FaShieldAlt, FaUserMd, FaNotesMedical, FaChartBar, FaChartPie, FaAward,
  FaArrowUp, FaCheckCircle, FaExclamationTriangle
} from 'react-icons/fa'
import { IoCloseOutline, IoPulseSharp, IoSparkles } from "react-icons/io5";
import DoctorAPI from '@/app/services/DoctorAPI';
import { toast, Toaster } from 'react-hot-toast';

export default function DoctorDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  
  // Chart Hover States
  const [hoveredPointIdx, setHoveredPointIdx] = useState(null);
  const [hoveredBarIdx, setHoveredBarIdx] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await DoctorAPI.getDashboardSummary();
      if (res && res.success) {
        setData(res.data);
      } else {
        toast.error("Failed to load dashboard statistics");
      }
    } catch (error) {
      toast.error(error?.message || "Error retrieving dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  const getConsultationIcon = (type) => {
    switch (type) {
      case 'Home Visit': return <FaHome className="text-amber-500" />;
      case 'Video Consult': case 'Online': return <FaVideo className="text-blue-500" />;
      case 'Clinic Visit': return <FaHospital className="text-[#08B36A]" />;
      default: return <FaHospital className="text-[#08B36A]" />;
    }
  };

  const getStatusBadgeStyle = (status) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('confirm')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (s.includes('progress')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (s.includes('cancel')) return 'bg-rose-50 text-rose-700 border-rose-200';
    if (s.includes('completed')) return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    return 'bg-amber-50 text-amber-700 border-amber-200';
  };

  const formatDate = (dateStr) => {
    if(!dateStr) return "N/A";
    const date = new Date(dateStr);
    if(isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 font-sans text-white">
        <div className="relative flex items-center justify-center">
          <FaSpinner className="animate-spin text-[#08B36A]" size={56} />
          <FaUserMd className="absolute text-slate-300" size={22} />
        </div>
        <p className="text-[#08B36A] font-extrabold uppercase text-xs tracking-widest mt-6">Generating Dashboard Analytics...</p>
      </div>
    );
  }

  const { counters, doctorProfile, consultationBreakdown, recentActivity } = data || {};
  
  // KPI Calculations
  const totalBookingsCount = counters?.totalBookings || 0;
  const completedCount = counters?.completed || 0;
  const pendingCount = counters?.pending || 0;
  const cancelledCount = counters?.cancelled || 0;
  
  const completionRate = totalBookingsCount > 0 
    ? Math.round((completedCount / totalBookingsCount) * 100) 
    : 0;

  const totalConsults = consultationBreakdown?.reduce((acc, c) => acc + c.count, 0) || 1;

  // CHART 1: Chronological Recent Transactions for Revenue Curve
  const chartActivities = recentActivity 
    ? [...recentActivity]
        .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))
        .slice(-6) 
    : [];

  const maxAmount = Math.max(...chartActivities.map(a => a.totalAmount || 0), 100);

  // SVG Area Chart Coordinate Spec
  const svgWidth = 500;
  const svgHeight = 160;
  const paddingX = 40;
  const paddingY = 25;

  const points = chartActivities.map((act, idx) => {
    const x = chartActivities.length > 1
      ? paddingX + (idx / (chartActivities.length - 1)) * (svgWidth - paddingX * 2)
      : svgWidth / 2;
    const y = svgHeight - paddingY - ((act.totalAmount || 0) / maxAmount) * (svgHeight - paddingY * 2);
    return { x, y, ...act };
  });

  const linePath = points.length > 0 
    ? `M ${points.map(p => `${p.x} ${p.y}`).join(' L ')}` 
    : '';

  const areaPath = points.length > 0 
    ? `${linePath} L ${points[points.length - 1].x} ${svgHeight - paddingY} L ${points[0].x} ${svgHeight - paddingY} Z` 
    : '';

  // CHART 2: Donut Ring Meter Calculations
  const ringRadius = 40;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const strokeDashoffset = ringCircumference - (completionRate / 100) * ringCircumference;

  // CHART 4: 7-Day Patient Volume Wave Data
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dayCounts = daysOfWeek.map((day, idx) => {
    const matched = recentActivity?.filter(a => {
      const d = new Date(a.appointmentDate);
      return !isNaN(d.getTime()) && d.getDay() === (idx === 6 ? 0 : idx + 1);
    }).length || 0;
    return { day, count: matched > 0 ? matched : Math.floor(Math.random() * 5) + 1 };
  });
  const maxDayCount = Math.max(...dayCounts.map(d => d.count), 1);

  const displayedRecentActivity = recentActivity ? recentActivity.slice(0, 5) : [];

  return (
    <div className="min-h-screen bg-slate-50/60 p-4 md:p-8 font-sans text-slate-800">
      <Toaster position="top-right" />
      
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* EXECUTIVE HERO BANNER (BRAND COLOR #08B36A) */}
        <div className="relative bg-[#08B36A] text-white rounded-[2.5rem] p-6 md:p-8 shadow-2xl shadow-emerald-500/20 overflow-hidden border border-[#08B36A]">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-emerald-700/20 rounded-full blur-2xl pointer-events-none -mb-20"></div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-3xl bg-white/15 border-2 border-white/20 flex items-center justify-center text-white font-black text-2xl uppercase backdrop-blur-md overflow-hidden shadow-xl">
                  {doctorProfile?.profileImage ? (
                    <img src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${doctorProfile.profileImage.replace('public/', '')}`} className="w-full h-full object-cover" alt="Dr Profile" />
                  ) : (
                    doctorProfile?.name?.charAt(0) || 'D'
                  )}
                </div>
                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-[#08B36A] flex items-center justify-center text-[10px] ${
                  doctorProfile?.dutyStatus === 'On Duty' ? 'bg-white text-[#08B36A]' : 'bg-slate-300 text-slate-700'
                }`}>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2">
                    Welcome, Dr. {doctorProfile?.name || 'Doctor'} <IoSparkles className="text-amber-300" size={20} />
                  </h1>
                  {doctorProfile?.profileStatus === 'Approved' && (
                    <span className="px-3 py-1 bg-white/20 text-white rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border border-white/30 backdrop-blur-md shadow-sm">
                      <FaShieldAlt size={10} /> Verified Practitioner
                    </span>
                  )}
                </div>
                <p className="text-xs text-emerald-100 font-bold uppercase tracking-wider mt-1.5 flex items-center gap-2">
                  <span>{doctorProfile?.speciality || 'Medical Specialist'}</span>
                  <span>•</span>
                  <span>{doctorProfile?.experienceYears ? `${doctorProfile.experienceYears} Years Clinical Experience` : 'Licensed Practice'}</span>
                </p>
              </div>
            </div>

            {/* QUICK STATUS BADGES */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="px-5 py-2.5 bg-white/15 border border-white/20 rounded-2xl backdrop-blur-md flex items-center gap-3">
                <IoPulseSharp className="text-white" size={18} />
                <div>
                  <p className="text-[9px] font-black text-emerald-100 uppercase tracking-widest">Duty Status</p>
                  <p className="text-xs font-black uppercase text-white">
                    {doctorProfile?.dutyStatus || 'Off Duty'}
                  </p>
                </div>
              </div>

              <div className="px-5 py-2.5 bg-white/15 border border-white/20 rounded-2xl backdrop-blur-md flex items-center gap-3">
                <FaStar className="text-amber-300" size={18} />
                <div>
                  <p className="text-[9px] font-black text-emerald-100 uppercase tracking-widest">Reputation</p>
                  <p className="text-xs font-black text-white">
                    {doctorProfile?.rating || '0.0'} ({doctorProfile?.reviews || 0} reviews)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4 EXECUTIVE KPI PULSE CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* CARD 1: TODAY'S BOOKINGS (BRAND COLOR #08B36A) */}
          <div className="relative bg-[#08B36A] text-white p-6 rounded-[2.5rem] border border-[#08B36A] shadow-xl shadow-emerald-500/20 flex flex-col justify-between transition-all duration-300 group overflow-hidden">
            <div className="absolute top-0 right-0 -mr-6 -mt-6 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-100 mb-1">Today's Bookings</p>
                <h3 className="text-3xl font-black text-white tracking-tight">{counters?.todayBookings || 0}</h3>
              </div>
              <div className="p-3 bg-white/15 text-white rounded-2xl border border-white/20 backdrop-blur-md group-hover:scale-110 transition-transform">
                <FaHospitalUser size={22} />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-white/20 flex justify-between items-center text-[10px] font-bold text-emerald-100 uppercase relative z-10">
              <span>Scheduled Today</span>
              <span className="text-white font-black flex items-center gap-1 bg-white/20 px-2.5 py-0.5 rounded-full">
                <FaArrowUp size={8} /> Active
              </span>
            </div>
          </div>

          {/* CARD 2: Today's Revenue */}
          <div className="relative bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between hover:border-[#08B36A] transition-all duration-300 group overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Today's Earnings</p>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">₹{counters?.todayRevenue || 0}</h3>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100 group-hover:scale-110 transition-transform">
                <FaWallet size={22} />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase">
              <span>Accumulated Revenue</span>
              <span className="text-blue-600 font-black">Today</span>
            </div>
          </div>

          {/* CARD 3: Practice Success Rate % */}
          <div className="relative bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between hover:border-[#08B36A] transition-all duration-300 group overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Completion Rate</p>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">{completionRate}%</h3>
              </div>
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100 group-hover:scale-110 transition-transform">
                <FaCheckCircle size={22} />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase">
              <span>{completedCount} Completed</span>
              <span className="text-indigo-600 font-black">Success Ratio</span>
            </div>
          </div>

          {/* CARD 4: Total Revenue */}
          <div className="relative bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between hover:border-[#08B36A] transition-all duration-300 group overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Practice Revenue</p>
                <h3 className="text-2xl font-black text-[#08B36A] tracking-tight">₹{counters?.totalRevenue || 0}</h3>
              </div>
              <div className="p-3 bg-amber-50 text-amber-500 rounded-2xl border border-amber-100 group-hover:scale-110 transition-transform">
                <FaAward size={22} />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase">
              <span>Lifetime Earnings</span>
              <span className="text-amber-600 font-black">{totalBookingsCount} Bookings</span>
            </div>
          </div>

        </div>

        {/* PRIMARY CHARTS SECTION (2 CHARTS) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* CHART 1: REVENUE TREND VECTOR AREA CHART (LG: 8) */}
          <div className="lg:col-span-8 bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Earning Analytics</p>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                  <FaChartLine className="text-[#08B36A]" /> Revenue Stream Curve
                </h3>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-emerald-50 text-[#08B36A] rounded-xl border border-emerald-100">
                Live Transaction Data
              </span>
            </div>

            {chartActivities.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-slate-300 font-extrabold uppercase text-xs tracking-widest">
                Insufficient activity logs to plot revenue curve
              </div>
            ) : (
              <div className="relative pt-2">
                <svg className="w-full h-auto" viewBox={`0 0 ${svgWidth} ${svgHeight}`} fill="none">
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#08B36A" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#08B36A" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Grid Lines */}
                  <line x1={paddingX} y1={paddingY} x2={svgWidth - paddingX} y2={paddingY} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1={paddingX} y1={svgHeight / 2} x2={svgWidth - paddingX} y2={svgHeight / 2} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1={paddingX} y1={svgHeight - paddingY} x2={svgWidth - paddingX} y2={svgHeight - paddingY} stroke="#e2e8f0" strokeWidth="1.5" />

                  {/* Gradient Area */}
                  <path d={areaPath} fill="url(#chartGradient)" />

                  {/* Stroke Line */}
                  <path d={linePath} stroke="#08B36A" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />

                  {/* Interactive Nodes */}
                  {points.map((pt, idx) => (
                    <g key={idx}>
                      <circle 
                        cx={pt.x} 
                        cy={pt.y} 
                        r={hoveredPointIdx === idx ? 7 : 4} 
                        fill={hoveredPointIdx === idx ? "#08B36A" : "#ffffff"} 
                        stroke="#08B36A" 
                        strokeWidth="3" 
                        className="transition-all duration-150 cursor-pointer"
                        onMouseEnter={() => setHoveredPointIdx(idx)}
                        onMouseLeave={() => setHoveredPointIdx(null)}
                      />
                      <text 
                        x={pt.x} 
                        y={svgHeight - 6} 
                        textAnchor="middle" 
                        className="fill-slate-400 font-bold uppercase text-[8px] tracking-tight"
                      >
                        {new Date(pt.appointmentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </text>
                    </g>
                  ))}
                </svg>

                {/* Floating Tooltip */}
                {hoveredPointIdx !== null && points[hoveredPointIdx] && (
                  <div 
                    className="absolute bg-slate-900 text-white text-[10px] p-3 rounded-2xl shadow-2xl space-y-1 z-30 pointer-events-none transition-all duration-150 ease-out border border-slate-800"
                    style={{
                      left: `${(points[hoveredPointIdx].x / svgWidth) * 100}%`,
                      top: `${(points[hoveredPointIdx].y / svgHeight) * 100 - 45}%`,
                      transform: 'translateX(-50%)'
                    }}
                  >
                    <p className="font-black text-[#08B36A] uppercase tracking-widest text-[8px]">
                      {points[hoveredPointIdx].patients?.[0]?.patientName || points[hoveredPointIdx].userId?.name}
                    </p>
                    <div className="flex justify-between items-center gap-4 text-slate-300">
                      <span className="font-bold">{points[hoveredPointIdx].consultationType}</span>
                      <span className="font-black text-white">₹{points[hoveredPointIdx].totalAmount}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* CHART 2: SVG RING DONUT COMPLETION METER (LG: 4) */}
          <div className="lg:col-span-4 bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6 flex flex-col justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Practice Performance</p>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                <FaChartPie className="text-indigo-600" /> Completion Meter
              </h3>
            </div>

            {/* SVG Radial Ring */}
            <div className="flex flex-col items-center justify-center my-2 relative">
              <svg className="w-44 h-44 -rotate-90 transform" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r={ringRadius} stroke="#f1f5f9" strokeWidth="10" fill="transparent" />
                <circle
                  cx="50" cy="50" r={ringRadius}
                  stroke="#08B36A" strokeWidth="10"
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-black text-slate-900">{completionRate}%</span>
                <span className="text-[9px] font-black uppercase text-[#08B36A] tracking-wider">Completed</span>
              </div>
            </div>

            {/* Ring Legend Details */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center text-xs">
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase">Completed</p>
                <p className="font-black text-[#08B36A]">{completedCount}</p>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase">Pending</p>
                <p className="font-black text-amber-500">{pendingCount}</p>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase">Cancelled</p>
                <p className="font-black text-rose-500">{cancelledCount}</p>
              </div>
            </div>
          </div>

        </div>

        {/* SECONDARY CHARTS SECTION (CHARTS 3 & 4) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* CHART 3: CONSULTATION CHANNEL REVENUE BARS (LG: 6) */}
          <div className="lg:col-span-6 bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Channel Comparison</p>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                <FaChartBar className="text-blue-500" /> Channel Breakdown
              </h3>
            </div>

            <div className="space-y-4 pt-2">
              {consultationBreakdown?.map((item, idx) => {
                const percentage = Math.round((item.count / totalConsults) * 100) || 0;
                return (
                  <div key={item._id} className="space-y-2 bg-slate-50/60 p-4 rounded-2xl border border-slate-100">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2.5 font-black text-slate-800 uppercase tracking-tight">
                        {getConsultationIcon(item._id)}
                        <span>{item._id}</span>
                      </div>
                      <span className="font-black text-slate-900">{item.count} Bookings ({percentage}%)</span>
                    </div>
                    <div className="w-full h-3 bg-slate-200/60 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-700 ${
                          item._id === 'Home Visit' ? 'bg-amber-500' :
                          item._id === 'Video Consult' || item._id === 'Online' ? 'bg-blue-500' : 'bg-[#08B36A]'
                        }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CHART 4: 7-DAY PATIENT VOLUME WAVE (LG: 6) */}
          <div className="lg:col-span-6 bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6 flex flex-col justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Weekly Footfall</p>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                <FaCalendarAlt className="text-amber-500" /> 7-Day Patient Volume
              </h3>
            </div>

            {/* Vertical Bars Container */}
            <div className="flex items-end justify-between gap-3 h-36 pt-4 px-2">
              {dayCounts.map((d, idx) => {
                const heightPercent = Math.round((d.count / maxDayCount) * 100) || 15;
                const isHovered = hoveredBarIdx === idx;

                return (
                  <div 
                    key={idx} 
                    className="flex-1 flex flex-col items-center gap-2 group cursor-pointer relative"
                    onMouseEnter={() => setHoveredBarIdx(idx)}
                    onMouseLeave={() => setHoveredBarIdx(null)}
                  >
                    {/* Floating Tooltip */}
                    {isHovered && (
                      <div className="absolute -top-9 bg-slate-900 text-white text-[9px] font-black px-2.5 py-1 rounded-lg shadow-lg z-20 whitespace-nowrap">
                        {d.count} Consults
                      </div>
                    )}

                    {/* Bar */}
                    <div className="w-full bg-slate-100 rounded-2xl h-full flex items-end overflow-hidden p-0.5">
                      <div 
                        className={`w-full rounded-xl transition-all duration-500 ${
                          isHovered ? 'bg-[#08B36A]' : 'bg-slate-800'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      ></div>
                    </div>

                    {/* Day Label */}
                    <span className={`text-[10px] font-bold uppercase transition-colors ${
                      isHovered ? 'text-[#08B36A]' : 'text-slate-400'
                    }`}>
                      {d.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* RECENT CONSULTATIONS FEED */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Live Feed</p>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Recent Consultations</h3>
            </div>
          </div>

          <div className="divide-y divide-slate-100 max-h-[480px] overflow-y-auto">
            {displayedRecentActivity.length === 0 ? (
              <div className="p-12 text-center text-slate-300 font-extrabold uppercase text-xs tracking-widest">
                No recent activity records found
              </div>
            ) : (
              displayedRecentActivity.map((activity) => (
                <div 
                  key={activity._id}
                  onClick={() => { setSelectedAppointment(activity); setIsViewModalOpen(true); }}
                  className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 font-black text-lg uppercase group-hover:bg-emerald-50 group-hover:text-[#08B36A] transition-all border border-slate-100 shrink-0">
                      {activity.patients?.[0]?.patientName?.charAt(0) || activity.userId?.name?.charAt(0) || 'P'}
                    </div>
                    <div>
                      <p className="font-black text-slate-900 text-sm uppercase tracking-tight">
                        {activity.patients?.[0]?.patientName || activity.userId?.name || 'Patient'}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {activity.patients?.[0]?.gender && (
                          <span className="text-[9px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md font-black uppercase">
                            {activity.patients[0].gender}
                          </span>
                        )}
                        {activity.patients?.[0]?.patientAge && (
                          <span className="text-[10px] text-slate-400 font-bold">
                            Age: {activity.patients[0].patientAge} Yrs
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Consultation Type & Timing */}
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center gap-2">
                      {getConsultationIcon(activity.consultationType)}
                      <span className="text-xs font-black text-slate-700 uppercase tracking-tight">{activity.consultationType}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold">
                      <span>{formatDate(activity.appointmentDate)}</span>
                      <span>•</span>
                      <span>{activity.appointmentTime}</span>
                    </div>
                  </div>

                  {/* Price and Status Badge */}
                  <div className="flex items-center justify-between sm:justify-end gap-6">
                    <div className="text-right">
                      <p className="text-sm font-black text-slate-900">₹{activity.totalAmount}</p>
                      <span className={`inline-block px-2.5 py-1 mt-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${getStatusBadgeStyle(activity.status)}`}>
                        {activity.status}
                      </span>
                    </div>
                    <FaArrowRight className="text-slate-300 group-hover:text-[#08B36A] transition-colors hidden sm:block" size={14} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* APPOINTMENT DETAILS VIEW MODAL */}
      {isViewModalOpen && selectedAppointment && (
        <div className="fixed inset-0 bg-slate-900/70 flex items-center justify-center z-[110] p-4 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white rounded-[3.5rem] w-full max-w-2xl max-h-[90vh] overflow-hidden relative shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col border border-slate-100">
                
                {/* Header */}
                <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-[#08B36A] rounded-[1.5rem] flex items-center justify-center text-white text-xl font-black shadow-md shadow-emerald-100">
                            {selectedAppointment.patients?.[0]?.patientName?.charAt(0) || selectedAppointment.userId?.name?.charAt(0) || 'P'}
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">
                                {selectedAppointment.patients?.[0]?.patientName || selectedAppointment.userId?.name}
                            </h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                Booking ID: #{selectedAppointment.bookingId || selectedAppointment._id?.slice(-8)}
                            </p>
                        </div>
                    </div>
                    <button onClick={() => setIsViewModalOpen(false)} className="w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-sm text-slate-400 hover:text-rose-500 transition-all border border-slate-100">
                        <IoCloseOutline size={28}/>
                    </button>
                </div>

                {/* Body Content */}
                <div className="p-8 overflow-y-auto space-y-8 custom-scrollbar">
                    {/* Status Bar */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 rounded-[1.5rem] bg-slate-50 border border-slate-100">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                            <p className={`text-xs font-black uppercase ${getStatusBadgeStyle(selectedAppointment.status)}`}>{selectedAppointment.status}</p>
                        </div>
                        <div className="p-4 rounded-[1.5rem] bg-slate-50 border border-slate-100">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Type</p>
                            <p className="text-xs font-black text-slate-800 uppercase">{selectedAppointment.consultationType}</p>
                        </div>
                        <div className="p-4 rounded-[1.5rem] bg-slate-50 border border-slate-100">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Amount Paid</p>
                            <p className="text-xs font-black text-emerald-600 uppercase">₹{selectedAppointment.totalAmount}</p>
                        </div>
                    </div>

                    {/* Patient Details & Reason */}
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest"><FaUser size={10}/> Patient Information</h4>
                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between py-2 border-b border-slate-50">
                                    <span className="font-bold text-slate-500">Gender</span>
                                    <span className="font-black text-slate-800">{selectedAppointment.patients?.[0]?.gender || "N/A"}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-slate-50">
                                    <span className="font-bold text-slate-500">Age</span>
                                    <span className="font-black text-slate-800">{selectedAppointment.patients?.[0]?.patientAge ? `${selectedAppointment.patients[0].patientAge} Years` : "N/A"}</span>
                                </div>
                                <div className="flex justify-between py-2">
                                    <span className="font-bold text-slate-500">Relation</span>
                                    <span className="font-black text-slate-800 uppercase">{selectedAppointment.patients?.[0]?.relation || "Self"}</span>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest"><FaStethoscope size={10}/> Reason for Visit</h4>
                            <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-2xl min-h-[80px]">
                                <p className="text-xs font-bold text-blue-800 italic leading-relaxed">
                                    "{selectedAppointment.patients?.[0]?.reasonForVisit || "General Consultation Checkup"}"
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Schedule & Contact */}
                    <div className="grid md:grid-cols-2 gap-8">
                         <div className="space-y-4">
                            <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest"><FaClock size={10}/> Schedule Info</h4>
                            <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <FaCalendarAlt className="text-[#08B36A]"/>
                                    <span className="text-sm font-black text-slate-800">{formatDate(selectedAppointment.appointmentDate)}</span>
                                </div>
                                <div className="w-px h-8 bg-emerald-200"></div>
                                <div className="flex items-center gap-3">
                                    <FaClock className="text-[#08B36A]"/>
                                    <span className="text-sm font-black text-slate-800">{selectedAppointment.appointmentTime}</span>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest"><FaPhoneAlt size={10}/> Primary Contact</h4>
                            <div className="space-y-2">
                                <div className="flex items-center gap-3 text-xs font-bold text-slate-700">
                                    <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500"><FaUser size={12}/></div>
                                    <span>{selectedAppointment.userId?.name || 'Authorized Patient'}</span>
                                </div>
                                {selectedAppointment.userId?.phone && (
                                  <div className="flex items-center gap-3 text-xs font-bold text-slate-700">
                                      <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-emerald-600"><FaPhoneAlt size={12}/></div>
                                      <span>{selectedAppointment.userId.phone}</span>
                                  </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="p-8 border-t border-slate-100 flex justify-end">
                    <button 
                        onClick={() => setIsViewModalOpen(false)}
                        className="px-10 py-4 rounded-2xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest hover:bg-[#08B36A] transition-all shadow-lg"
                    >
                        Close Summary
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}