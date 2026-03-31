"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { 
  FaShoppingBasket, 
  FaChartLine, 
  FaSyncAlt, 
  FaFilter, 
  FaDownload,
  FaCircle
} from "react-icons/fa";

// Data from your previous request
const totalOrdersData = [
  { name: "Doctor", value: 12.43 },
  { name: "Hospital", value: 1.43 },
  { name: "Ambulance", value: 11.29 },
  { name: "Pharmacy", value: 31.71 },
  { name: "Lab", value: 21.71 },
  { name: "Nurse", value: 21.43 },
];

const orderStatusData = [
  { name: "Approved", value: 29.14 },
  { name: "Pending", value: 37.43 },
  { name: "Rejected", value: 16.57 },
  { name: "Re Schedule", value: 2.29 },
  { name: "Assigned", value: 0.71 },
  { name: "Completed", value: 0.29 },
];

// Theme Colors centered around #08B36A
const BRAND_GREEN = "#08B36A";
const CHART_COLORS = [
  "#08B36A", // Brand Primary
  "#10b981", // Emerald
  "#34d399", // Light Emerald
  "#059669", // Deep Emerald
  "#6ee7b7", // Mint
  "#a7f3d0", // Pale Green
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 shadow-2xl rounded-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
          {payload[0].name}
        </p>
        <p className="text-lg font-black text-slate-800">
          {payload[0].value}%
        </p>
      </div>
    );
  }
  return null;
};

export default function OrdersDashboard() {
  return (
    <div className="min-h-screen bg-[#F1F5F9] p-4 md:p-8 lg:p-12 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto">
        
        {/* --- HEADER --- */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <span className="p-2 rounded-xl text-white" style={{ backgroundColor: BRAND_GREEN }}>
                <FaChartLine size={20} />
              </span>
              Orders Analytics
            </h1>
            <p className="text-slate-500 mt-1 font-medium">Monitoring service demand and fulfillment status</p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all">
              <FaFilter /> Filters
            </button>
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all">
              <FaDownload /> Export
            </button>
          </div>
        </header>

        {/* --- KPI CARDS --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <KPICard 
            title="Total Volume" 
            value="700" 
            label="Historical Orders" 
            icon={<FaShoppingBasket />} 
          />
          <KPICard 
            title="Live Queue" 
            value="42" 
            label="Current Active Orders" 
            icon={<FaSyncAlt className="animate-spin-slow" />} 
            isCurrent
          />
        </div>

        {/* --- CHART SECTION --- */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <ChartWrapper 
            title="Volume by Category" 
            data={totalOrdersData} 
            syncTime="17/2/2026 10:55:38"
          />
          <ChartWrapper 
            title="Status Distribution" 
            data={orderStatusData} 
            syncTime="17/2/2026 11:02:14"
          />
        </div>
      </div>
    </div>
  );
}

// --- REUSABLE COMPONENTS ---

function KPICard({ title, value, label, icon, isCurrent }) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-xl hover:border-[#08B36A]/30 transition-all duration-300">
      <div className="space-y-1">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
        <h3 className="text-5xl font-black text-slate-800 tracking-tighter">{value}</h3>
        <p className="text-sm text-slate-500 font-medium">{label}</p>
      </div>
      <div 
        className={`w-20 h-20 rounded-3xl flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform duration-500 ${
          isCurrent ? 'bg-slate-900 text-white' : 'bg-[#08B36A]/10 text-[#08B36A]'
        }`}
      >
        {icon}
      </div>
    </div>
  );
}

function ChartWrapper({ title, data, syncTime }) {
  return (
    <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-8 flex flex-col items-center group hover:shadow-2xl transition-all duration-500">
      <div className="w-full flex justify-between items-start mb-8">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">{title}</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2 h-2 rounded-full bg-[#08B36A] animate-pulse"></span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Sync: {syncTime}</span>
          </div>
        </div>
      </div>

      <div className="w-full h-[320px] relative">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={85} // Clean Donut
              outerRadius={115}
              paddingAngle={6}
              dataKey="value"
              stroke="none"
              animationBegin={0}
              animationDuration={1500}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center Insight */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Share</span>
            <span className="text-3xl font-black text-slate-800">100%</span>
        </div>
      </div>

      {/* Modern Grid Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6 w-full mt-10 border-t border-slate-50 pt-8">
        {data.map((item, index) => (
          <div key={item.name} className="flex items-center gap-3 group/item">
            <div 
              className="w-2.5 h-2.5 rounded-full ring-4 ring-transparent group-hover/item:ring-slate-100 transition-all" 
              style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} 
            />
            <div className="flex flex-col">
                <span className="text-[9px] font-bold text-slate-400 uppercase leading-none mb-1 tracking-tighter">{item.name}</span>
                <span className="text-xs font-black text-slate-700">{item.value}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}