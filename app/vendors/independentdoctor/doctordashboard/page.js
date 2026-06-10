'use client'
import React, { useState, useEffect } from 'react'
import { 
  FaCalendarAlt, FaHome, FaClock, FaVideo, FaHospital, FaSpinner, 
  FaStar, FaWallet, FaUserCircle, FaHospitalUser, FaRegCheckCircle, 
  FaRegTimesCircle, FaHourglassHalf, FaArrowRight, FaUser, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaStethoscope
} from 'react-icons/fa'
import { IoCloseOutline } from "react-icons/io5";
import DoctorAPI from '@/app/services/DoctorAPI';
import { toast, Toaster } from 'react-hot-toast';

export default function DoctorDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [hoveredPointIdx, setHoveredPointIdx] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await DoctorAPI.getDashboardSummary();
      if (res.success) {
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
      case 'Home Visit': return <FaHome className="text-orange-500" />;
      case 'Video Consult': case 'Online': return <FaVideo className="text-blue-500" />;
      case 'Clinic Visit': return <FaHospital className="text-emerald-500" />;
      default: return <FaHospital className="text-emerald-500" />;
    }
  };

  const getStatusBadgeStyle = (status) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('confirm')) return 'bg-green-50 text-green-600 border-green-100';
    if (s.includes('progress')) return 'bg-blue-50 text-blue-600 border-blue-100';
    if (s.includes('cancel')) return 'bg-red-50 text-red-600 border-red-100';
    if (s.includes('completed')) return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    return 'bg-orange-50 text-orange-600 border-orange-100';
  };

  const formatDate = (dateStr) => {
    if(!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <FaSpinner className="animate-spin text-[#08B36A] mb-4" size={40} />
        <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">Loading dashboard...</p>
      </div>
    );
  }

  const { counters, doctorProfile, consultationBreakdown, recentActivity } = data || {};
  const totalConsults = consultationBreakdown?.reduce((acc, c) => acc + c.count, 0) || 1;

  // Chart Logic - Parse chronological transaction history directly from recentActivity
  const chartActivities = recentActivity 
    ? [...recentActivity]
        .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))
        .slice(-6) 
    : [];

  const maxAmount = Math.max(...chartActivities.map(a => a.totalAmount || 0), 100);

  // Generate SVG Coordinate System Coordinates
  const svgWidth = 500;
  const svgHeight = 150;
  const paddingX = 35;
  const paddingY = 20;

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

  // Limit recent orders list view strictly to the top 5
  const displayedRecentActivity = recentActivity ? recentActivity.slice(0, 5) : [];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      <Toaster position="top-right" />
      
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <div>
                <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Dashboard Summary</h1>
                <p className="text-sm text-gray-500 font-medium">Overview of your practice metrics and activity</p>
            </div>
            
            <div className="flex gap-2.5">
                <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                    doctorProfile?.dutyStatus === 'On Duty' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-gray-50 text-gray-500 border-gray-100'
                }`}>
                    {doctorProfile?.dutyStatus || 'Off Duty'}
                </span>
                <span className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border bg-blue-50 text-blue-600 border-blue-100">
                    Profile: {doctorProfile?.profileStatus || 'Pending'}
                </span>
            </div>
        </div>

        {/* TODAY PULSE HIGHLIGHTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-r from-[#08B36A] to-emerald-600 p-6 rounded-[2.5rem] text-white shadow-lg shadow-green-100 flex justify-between items-center">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-100 mb-1">Today's Bookings</p>
                    <h3 className="text-3xl font-black">{counters?.todayBookings || 0}</h3>
                </div>
                <FaHospitalUser size={40} className="text-emerald-100/40" />
            </div>
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-6 rounded-[2.5rem] text-white shadow-lg shadow-slate-200 flex justify-between items-center">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Today's Revenue</p>
                    <h3 className="text-3xl font-black">₹{counters?.todayRevenue || 0}</h3>
                </div>
                <FaWallet size={36} className="text-slate-500/40" />
            </div>
        </div>

        {/* CUMULATIVE COUNTER GRID */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[
                { label: 'Total Bookings', value: counters?.totalBookings || 0, icon: <FaCalendarAlt />, color: 'text-blue-500' },
                { label: 'Completed', value: counters?.completed || 0, icon: <FaRegCheckCircle />, color: 'text-emerald-500' },
                { label: 'Pending', value: counters?.pending || 0, icon: <FaHourglassHalf />, color: 'text-orange-500' },
                { label: 'Cancelled', value: counters?.cancelled || 0, icon: <FaRegTimesCircle />, color: 'text-red-500' },
                { label: 'Total Revenue', value: `₹${counters?.totalRevenue || 0}`, icon: <FaWallet />, color: 'text-purple-500' }
            ].map((stat, idx) => (
                <div key={idx} className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">{stat.label}</span>
                        <span className={stat.color}>{stat.icon}</span>
                    </div>
                    <h3 className="text-xl font-black text-gray-800">{stat.value}</h3>
                </div>
            ))}
        </div>

        {/* MAIN BODY GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT SIDEBAR: PROFILE & DISTRIBUTION */}
            <div className="lg:col-span-4 space-y-8">
                {/* DOCTOR RATING COMPONENT */}
                <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm text-center space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Reputation Score</p>
                    <div className="flex justify-center items-center gap-1.5 text-orange-400">
                        <FaStar size={22} />
                        <span className="text-3xl font-black text-gray-800">{doctorProfile?.rating || 0}</span>
                    </div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wide">
                        Based on {doctorProfile?.reviews || 0} Patient Reviews
                    </p>
                </div>

                {/* DISTRIBUTION PROGRESS METER */}
                <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Consultation Mix</p>
                        <h4 className="text-xs text-gray-500 font-medium">Breakdown by appointment channels</h4>
                    </div>

                    <div className="space-y-4">
                        {consultationBreakdown?.map((item) => {
                            const percentage = Math.round((item.count / totalConsults) * 100) || 0;
                            return (
                                <div key={item._id} className="space-y-2">
                                    <div className="flex justify-between items-center text-xs">
                                        <div className="flex items-center gap-2 font-black text-gray-700 uppercase tracking-tight">
                                            {getConsultationIcon(item._id)}
                                            <span>{item._id}</span>
                                        </div>
                                        <span className="font-black text-gray-800">{item.count} ({percentage}%)</span>
                                    </div>
                                    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-500 ${
                                                item._id === 'Home Visit' ? 'bg-orange-500' :
                                                item._id === 'Video Consult' ? 'bg-blue-500' : 'bg-emerald-500'
                                            }`}
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* RIGHT MAIN PANEL: ANALYTICS & RECENT ACTIVITY */}
            <div className="lg:col-span-8 space-y-8">
                
                {/* INTERACTIVE VECTOR GRAPH CARD */}
                <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Revenue Stream</p>
                            <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight">Earning Analytics</h3>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-green-50 text-[#08B36A] rounded-md border border-green-100">
                            Activity Base Trend
                        </span>
                    </div>

                    {chartActivities.length === 0 ? (
                        <div className="h-40 flex items-center justify-center text-gray-400 font-bold uppercase text-xs tracking-widest">
                            Insufficient transaction points to render graph
                        </div>
                    ) : (
                        <div className="relative">
                            <svg className="w-full h-auto" viewBox={`0 0 ${svgWidth} ${svgHeight}`} fill="none">
                                <defs>
                                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#08B36A" stopOpacity="0.4" />
                                        <stop offset="100%" stopColor="#08B36A" stopOpacity="0.0" />
                                    </linearGradient>
                                </defs>

                                {/* Grid Guide Lines */}
                                <line x1={paddingX} y1={paddingY} x2={svgWidth - paddingX} y2={paddingY} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                                <line x1={paddingX} y1={svgHeight / 2} x2={svgWidth - paddingX} y2={svgHeight / 2} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                                <line x1={paddingX} y1={svgHeight - paddingY} x2={svgWidth - paddingX} y2={svgHeight - paddingY} stroke="#e2e8f0" strokeWidth="1.5" />

                                {/* Filled Gradient Area */}
                                <path d={areaPath} fill="url(#chartGradient)" />

                                {/* Area Border Stroke Line */}
                                <path d={linePath} stroke="#08B36A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

                                {/* Interactive Data Nodes */}
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
                                        {/* Date labels under nodes */}
                                        <text 
                                            x={pt.x} 
                                            y={svgHeight - 4} 
                                            textAnchor="middle" 
                                            className="fill-gray-400 font-black uppercase text-[8px] tracking-tight"
                                        >
                                            {new Date(pt.appointmentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                        </text>
                                    </g>
                                ))}
                            </svg>

                            {/* Dynamic Live Floating Tooltip */}
                            {hoveredPointIdx !== null && points[hoveredPointIdx] && (
                                <div 
                                    className="absolute bg-slate-900 text-white text-[10px] p-3 rounded-xl shadow-xl space-y-1 z-30 pointer-events-none transition-all duration-100 ease-out border border-slate-800"
                                    style={{
                                        left: `${(points[hoveredPointIdx].x / svgWidth) * 100}%`,
                                        top: `${(points[hoveredPointIdx].y / svgHeight) * 100 - 45}%`,
                                        transform: 'translateX(-50%)'
                                    }}
                                >
                                    <p className="font-black text-green-400 uppercase tracking-widest text-[8px]">
                                        {points[hoveredPointIdx].patients[0]?.patientName || points[hoveredPointIdx].userId?.name}
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

                {/* RECENT ACTIVITY VIEW */}
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
                    <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Incoming Stream</p>
                            <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight">Recent Activity</h3>
                        </div>
                    </div>

                    <div className="divide-y divide-gray-50 overflow-y-auto max-h-[480px]">
                        {displayedRecentActivity.length === 0 ? (
                            <div className="p-10 text-center text-gray-400 font-bold uppercase text-xs tracking-widest">
                                No recent transactions recorded
                            </div>
                        ) : (
                            displayedRecentActivity.map((activity) => (
                                <div 
                                    key={activity._id}
                                    onClick={() => { setSelectedAppointment(activity); setIsViewModalOpen(true); }}
                                    className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/40 transition-colors cursor-pointer group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 font-black text-lg uppercase group-hover:bg-green-50 group-hover:text-[#08B36A] transition-all">
                                            {activity.patients[0]?.patientName?.charAt(0) || activity.userId?.name?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-black text-gray-900 text-sm uppercase tracking-tight">
                                                {activity.patients[0]?.patientName || activity.userId?.name}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[9px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md font-black uppercase">
                                                    {activity.patients[0]?.gender}
                                                </span>
                                                <span className="text-[10px] text-gray-400 font-bold">
                                                    Age: {activity.patients[0]?.patientAge}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Consultation Info */}
                                    <div className="flex flex-col space-y-1">
                                        <div className="flex items-center gap-2">
                                            {getConsultationIcon(activity.consultationType)}
                                            <span className="text-xs font-black text-gray-700 uppercase tracking-tight">{activity.consultationType}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold">
                                            <span>{formatDate(activity.appointmentDate)}</span>
                                            <span>•</span>
                                            <span>{activity.appointmentTime}</span>
                                        </div>
                                    </div>

                                    {/* Action Status and Pricing */}
                                    <div className="flex items-center justify-between sm:justify-end gap-6">
                                        <div className="text-right">
                                            <p className="text-sm font-black text-gray-800">₹{activity.totalAmount}</p>
                                            <span className={`inline-block px-2.5 py-1 mt-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${getStatusBadgeStyle(activity.status)}`}>
                                                {activity.status}
                                            </span>
                                        </div>
                                        <FaArrowRight className="text-gray-300 group-hover:text-[#08B36A] transition-colors hidden sm:block" size={14} />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* VIEW DETAILS MODAL */}
      {isViewModalOpen && selectedAppointment && (
        <div className="fixed inset-0 bg-slate-900/70 flex items-center justify-center z-[110] p-4 backdrop-blur-sm">
            <div className="bg-white rounded-[3.5rem] w-full max-w-2xl max-h-[90vh] overflow-hidden relative shadow-2xl animate-in fade-in zoom-in-95 duration-300 flex flex-col">
                {/* Header */}
                <div className="p-8 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-[#08B36A] rounded-[1.5rem] flex items-center justify-center text-white text-xl font-black">
                            {selectedAppointment.patients[0]?.patientName?.charAt(0) || selectedAppointment.userId?.name?.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">
                                {selectedAppointment.patients[0]?.patientName || selectedAppointment.userId?.name}
                            </h2>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Appointment Summary Details</p>
                        </div>
                    </div>
                    <button onClick={() => setIsViewModalOpen(false)} className="w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-sm text-gray-400 hover:text-red-500 transition-all">
                        <IoCloseOutline size={28}/>
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto space-y-8">
                    {/* Status Bar */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 rounded-[1.5rem] bg-gray-50 border border-gray-100">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
                            <p className={`text-xs font-black uppercase ${getStatusBadgeStyle(selectedAppointment.status)}`}>{selectedAppointment.status}</p>
                        </div>
                        <div className="p-4 rounded-[1.5rem] bg-gray-50 border border-gray-100">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Type</p>
                            <p className="text-xs font-black text-gray-800 uppercase">{selectedAppointment.consultationType}</p>
                        </div>
                        <div className="p-4 rounded-[1.5rem] bg-gray-50 border border-gray-100">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Amount</p>
                            <p className="text-xs font-black text-emerald-600 uppercase">₹{selectedAppointment.totalAmount}</p>
                        </div>
                    </div>

                    {/* Patient & Reason */}
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h4 className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest"><FaUser size={10}/> Patient Information</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between py-2 border-b border-gray-50">
                                    <span className="text-xs font-bold text-gray-500">Gender</span>
                                    <span className="text-xs font-black text-gray-800">{selectedAppointment.patients[0]?.gender || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-50">
                                    <span className="text-xs font-bold text-gray-500">Age</span>
                                    <span className="text-xs font-black text-gray-800">{selectedAppointment.patients[0]?.patientAge ? `${selectedAppointment.patients[0].patientAge} Years` : 'N/A'}</span>
                                </div>
                                <div className="flex justify-between py-2">
                                    <span className="text-xs font-bold text-gray-500">Relation</span>
                                    <span className="text-xs font-black text-gray-800 uppercase">{selectedAppointment.patients[0]?.relation || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h4 className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest"><FaStethoscope size={10}/> Reason for Visit</h4>
                            <div className="p-4 bg-blue-50 rounded-2xl min-h-[80px]">
                                <p className="text-xs font-bold text-blue-700 italic">
                                    "{selectedAppointment.patients[0]?.reasonForVisit || "General Consultation Checkup"}"
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Schedule & Contact */}
                    <div className="grid md:grid-cols-2 gap-8">
                         <div className="space-y-4">
                            <h4 className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest"><FaClock size={10}/> Schedule Info</h4>
                            <div className="p-4 bg-green-50 rounded-2xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <FaCalendarAlt className="text-[#08B36A]"/>
                                    <span className="text-sm font-black text-gray-800">{formatDate(selectedAppointment.appointmentDate)}</span>
                                </div>
                                <div className="w-px h-8 bg-green-200"></div>
                                <div className="flex items-center gap-3">
                                    <FaClock className="text-[#08B36A]"/>
                                    <span className="text-sm font-black text-gray-800">{selectedAppointment.appointmentTime}</span>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h4 className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest"><FaPhoneAlt size={10}/> Primary Contact</h4>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-xs font-bold text-gray-700">
                                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center"><FaPhoneAlt size={12}/></div>
                                    <span>{selectedAppointment.userId?.name || 'Authorized Patient'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-8 border-t border-gray-50 flex gap-3">
                    <button 
                        onClick={() => setIsViewModalOpen(false)}
                        className="flex-1 py-4 rounded-2xl border border-gray-100 font-black text-[10px] uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-all text-center"
                    >
                        Close Details
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}