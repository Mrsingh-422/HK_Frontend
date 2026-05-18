'use client'
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import HospitalAPI from '@/app/services/HospitalAPI';

// Import Font Awesome icons
import {
  FaHeartbeat,
  FaProcedures,
  FaSignOutAlt,
  FaCheckCircle,
  FaClipboardList,
  FaChartBar
} from "react-icons/fa";

export default function HospitalDashboard() {
  const { hospital } = useAuth();
  
  const [statsData, setStatsData] = useState({
    emergencyCount: 0,
    admissionCount: 0,
    dischargePending: 0
  });
  const [loading, setLoading] = useState(true);
  
  // Animation state for the Graph
  const [animateChart, setAnimateChart] = useState(false);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await HospitalAPI.getDashboardStats();
      if (response?.success) {
        setStatsData(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard stats", error);
    } finally {
      setLoading(false);
      // Trigger chart animation after a short delay for smooth effect
      setTimeout(() => setAnimateChart(true), 100);
    }
  };

  // Prepare cards data dynamically
  const quickStats = [
    {
      label: 'Active Emergencies',
      value: statsData.emergencyCount,
      icon: FaHeartbeat,
      textColor: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-100',
      pulse: true
    },
    {
      label: ' Admissions',
      value: statsData.admissionCount,
      icon: FaProcedures,
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100'
    },
    {
      label: 'Discharge Ready',
      value: statsData.dischargePending,
      icon: FaSignOutAlt,
      textColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-100'
    },
    {
      label: 'Verified Status',
      value: hospital?.profileStatus || 'Approved',
      icon: FaCheckCircle,
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-100'
    },
  ];

  // Chart Configuration
  const chartData = [
    { label: 'Emergencies', value: statsData.emergencyCount, color: 'bg-gradient-to-t from-red-600 to-red-400', shadow: 'shadow-red-200' },
    { label: 'Admissions', value: statsData.admissionCount, color: 'bg-gradient-to-t from-blue-600 to-blue-400', shadow: 'shadow-blue-200' },
    { label: 'Discharges', value: statsData.dischargePending, color: 'bg-gradient-to-t from-yellow-500 to-yellow-300', shadow: 'shadow-yellow-200' },
  ];
  
  // Find max value to scale the chart dynamically (Minimum scale of 10)
  const maxChartValue = Math.max(...chartData.map(d => d.value), 10);

  return (
    <div className="p-6 max-w-[90rem] mx-auto font-sans min-h-screen relative bg-gray-50/50">
      
      {/* ---------------- STATS CARDS GRID ---------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 mt-4">
        {quickStats.map((stat, idx) => (
          <div key={idx} className={`bg-white p-6 rounded-3xl border shadow-sm hover:shadow-lg transition-shadow duration-300 flex items-center gap-5 relative overflow-hidden group ${stat.borderColor}`}>
            {/* Background Glow */}
            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-20 blur-2xl ${stat.bgColor.replace('50', '400')}`}></div>
            
            <div className={`w-14 h-14 rounded-2xl ${stat.bgColor} ${stat.textColor} flex items-center justify-center text-2xl z-10 shadow-sm group-hover:scale-110 transition-transform`}>
              {loading ? (
                <div className="w-6 h-6 border-4 border-current border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <stat.icon className={stat.pulse ? "animate-pulse" : ""} />
              )}
            </div>
            <div className="z-10">
              <p className="text-[11px] text-gray-500 font-black uppercase tracking-widest">{stat.label}</p>
              {loading ? (
                <div className="h-8 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <h2 className="text-3xl font-black text-gray-800 mt-1">
                  {stat.value}
                </h2>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ---------------- MAIN CONTENT: CHART & EMPTY STATE ---------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Animated Graph Section */}
        <div className="col-span-1 lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm p-8 flex flex-col">
          <div className="flex justify-between items-center mb-6">
             <div>
               <h3 className="text-xl font-black text-gray-800 flex items-center gap-2"><FaChartBar className="text-blue-500"/> Live Activity Chart</h3>
               <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">Current Admissions & Emergencies</p>
             </div>
          </div>

          {/* 🌟 REDESIGNED PREMIUM CHART 🌟 */}
          <div className="relative h-72 flex mt-4 ml-6 mr-2">
            
            {/* Y-Axis Labels & Background Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between z-0 pb-8">
               {[100, 75, 50, 25, 0].map((step, i) => (
                  <div key={i} className="relative w-full border-t border-dashed border-gray-200 flex items-center h-0">
                     <span className="absolute -left-8 md:-left-10 text-[10px] text-gray-400 font-bold w-6 text-right">
                       {Math.round((maxChartValue * step) / 100)}
                     </span>
                  </div>
               ))}
            </div>

            {/* Baseline (0 line solid) */}
            <div className="absolute bottom-8 left-0 right-0 border-b-2 border-gray-200 z-0"></div>

            {/* Chart Bars Area */}
            <div className="relative z-10 flex-grow flex items-end justify-around pb-8 pt-4">
              {chartData.map((data, index) => {
                 // Set minimum 2% height so even "0" shows a tiny sliver, but 0 is exactly on the line
                 const heightPercent = data.value > 0 ? Math.max((data.value / maxChartValue) * 100, 4) : 0;
                 
                 return (
                  <div key={index} className="relative flex flex-col items-center group w-16 md:w-24 h-full justify-end cursor-pointer">
                    
                    {/* Tooltip on Hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-10 bg-gray-900 text-white text-xs font-black px-4 py-2 rounded-xl shadow-xl whitespace-nowrap z-30 pointer-events-none">
                      {data.value} {data.label}
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                    </div>

                    {/* Invisible full-height hover track for better UX */}
                    <div className="absolute inset-x-0 bottom-0 h-full bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-xl z-0"></div>

                    {/* The Actual Animated Bar */}
                    <div 
                      className={`w-full ${data.color} rounded-t-xl shadow-md ${data.shadow} transition-all duration-1000 ease-out z-10 relative`}
                      style={{ height: animateChart && !loading ? `${heightPercent}%` : '0%' }}
                    >
                       {/* Top Glass Highlight */}
                       <div className="absolute top-0 inset-x-0 h-2 bg-white/30 rounded-t-xl"></div>
                    </div>

                    {/* X-Axis Label */}
                    <div className="absolute -bottom-7 w-full text-center">
                      <span className="text-[9px] md:text-[11px] font-black text-gray-500 uppercase tracking-widest">
                        {data.label}
                      </span>
                    </div>

                  </div>
                 );
              })}
            </div>

          </div>
        </div>

        {/* Side Placeholder / Logs */}
        <div className="col-span-1 bg-white rounded-3xl border border-gray-100 shadow-sm p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
          {/* Decorative Blob */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-50 rounded-full opacity-50"></div>

          <div className="bg-gray-50 p-6 rounded-full mb-5 shadow-inner border border-gray-100 relative z-10">
            <FaClipboardList className="text-gray-400 text-5xl" />
          </div>
          <h3 className="text-xl font-black text-gray-800 z-10">Recent Logs</h3>
          <p className="text-sm font-bold text-gray-400 max-w-[200px] mt-2 leading-relaxed z-10">
            Your recent patient appointments and status updates will appear here automatically.
          </p>
          <button className="mt-6 bg-white border-2 border-gray-200 hover:border-gray-800 text-gray-800 font-bold px-6 py-2.5 rounded-xl text-sm transition-all shadow-sm z-10">
            View All Logs
          </button>
        </div>

      </div>
    </div>
  )
}