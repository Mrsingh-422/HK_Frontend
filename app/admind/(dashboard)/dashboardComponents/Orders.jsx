"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from "recharts";
import { 
  FaShoppingBasket, FaChartLine, FaSyncAlt, FaFilter, 
  FaDownload, FaCheckCircle, FaClock, FaSatelliteDish
} from "react-icons/fa";
import { toast } from "react-hot-toast";
import AdminAPI from "@/app/services/AdminAPI"; 

// Theme Colors
const BRAND_GREEN = "#08B36A";
const CHART_COLORS = ["#08B36A", "#10b981", "#34d399", "#059669", "#6ee7b7"];
const STATUS_COLORS = {
  pending: "#F59E0B",   
  completed: "#08B36A", 
  cancelled: "#EF4444"  
};

export default function OrdersDashboard() {
  const [initialLoading, setInitialLoading] = useState(true); // Only for first load
  const [isSyncing, setIsSyncing] = useState(false); // For background updates
  const [rawData, setRawData] = useState(null);
  const [serviceData, setServiceData] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0 });
  const [lastSync, setLastSync] = useState(null);

  // --- DATA PROCESSING LOGIC ---
  const processData = useCallback((data) => {
    let total = 0;
    let totalPending = 0;
    let totalCompleted = 0;
    let totalCancelled = 0;

    const formattedServices = Object.keys(data).map((key) => {
      const service = data[key];
      const serviceTotal = service.pending + service.completed + service.cancelled;
      
      total += serviceTotal;
      totalPending += service.pending;
      totalCompleted += service.completed;
      totalCancelled += service.cancelled;

      return {
        name: key.charAt(0).toUpperCase() + key.slice(1),
        value: serviceTotal,
        pending: service.pending,
        completed: service.completed,
        cancelled: service.cancelled
      };
    });

    setServiceData(formattedServices);
    setStats({ total, pending: totalPending, completed: totalCompleted });
    setLastSync(new Date().toLocaleTimeString());
  }, []);

  // --- FETCH FUNCTION (REAL-TIME COMPATIBLE) ---
  const fetchData = useCallback(async (isBackground = false) => {
    if (!isBackground) setInitialLoading(true);
    setIsSyncing(true);

    try {
      const res = await AdminAPI.adminStatDashboard();
      if (res.success) {
        setRawData(res.data);
        processData(res.data);
      }
    } catch (error) {
      console.error("Real-time Sync Error:", error);
      // We don't show a toast for background errors to avoid annoying the user
      if (!isBackground) toast.error("Failed to connect to live stream");
    } finally {
      setInitialLoading(false);
      setIsSyncing(false);
    }
  }, [processData]);

  // --- REAL-TIME POLLING EFFECT ---
  useEffect(() => {
    // Initial fetch
    fetchData();

    // Set interval to fetch every 5 seconds
    const intervalId = setInterval(() => {
      fetchData(true); // pass true to indicate background sync
    }, 5000);

    // Cleanup: Stop the timer when the component is unmounted
    return () => clearInterval(intervalId);
  }, [fetchData]);

  // --- EXPORT CSV ---
  const handleExportCSV = () => {
    if (!rawData) return toast.error("Wait for data sync...");
    const headers = ["Category", "Pending", "Completed", "Cancelled", "Total"];
    const rows = Object.keys(rawData).map(key => [
      key.toUpperCase(), rawData[key].pending, rawData[key].completed, rawData[key].cancelled,
      (rawData[key].pending + rawData[key].completed + rawData[key].cancelled)
    ]);
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `orders_live_report_${new Date().getTime()}.csv`;
    link.click();
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
            <div className="relative">
                <FaSatelliteDish className="text-[#08B36A] animate-bounce" size={40} />
                <div className="absolute inset-0 scale-150 bg-[#08B36A]/20 rounded-full animate-ping"></div>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Establishing Live Feed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 lg:p-10 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto">
        
        {/* --- LIVE HEADER --- */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Live Stream Active</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              Order Real-Time Analytics
            </h1>
            <p className="text-slate-500 font-medium text-sm">Automated sync every 5s • Last Update: {lastSync}</p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className={`text-[10px] font-black px-4 py-3 rounded-xl border flex items-center gap-2 transition-all ${isSyncing ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-white text-slate-400 border-slate-100'}`}>
                <FaSyncAlt className={isSyncing ? "animate-spin" : ""} /> {isSyncing ? "SYNCING..." : "CONNECTED"}
            </div>
            <button 
              onClick={handleExportCSV}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-900 px-5 py-3 rounded-xl text-xs font-black text-white hover:bg-black transition-all shadow-lg shadow-slate-200"
            >
              <FaDownload /> Export CSV
            </button>
          </div>
        </header>

        {/* --- KPI CARDS --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <KPICard title="Total Live Volume" value={stats.total} label="Current orders in system" icon={<FaShoppingBasket />} color="bg-emerald-50 text-emerald-600" />
          <KPICard title="Active Pending" value={stats.pending} label="Action required" icon={<FaClock />} color="bg-amber-50 text-amber-600" />
          <KPICard title="Success Fulfilled" value={stats.completed} label="Completed today" icon={<FaCheckCircle />} color="bg-slate-900 text-white" />
        </div>

        {/* --- REAL-TIME CHARTS --- */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <ChartWrapper title="Category Share (Live)" syncTime={lastSync}>
            <div className="w-full h-[320px] relative">
              <ResponsiveContainer>
                <PieChart>
                  <Pie 
                    data={serviceData} 
                    innerRadius={80} 
                    outerRadius={110} 
                    paddingAngle={8} 
                    dataKey="value" 
                    stroke="none"
                    isAnimationActive={false} // Disable animation for smoother frequent updates
                  >
                    {serviceData.map((entry, index) => <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] font-black text-slate-300 uppercase">Total</span>
                  <span className="text-3xl font-black text-slate-800">{stats.total}</span>
              </div>
            </div>
          </ChartWrapper>

          <ChartWrapper title="Live Status Breakdown" syncTime={lastSync}>
            <div className="w-full h-[320px]">
              <ResponsiveContainer>
                <BarChart data={serviceData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                  <YAxis hide />
                  <Tooltip cursor={{ fill: '#f8fafc' }} />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 'bold' }} />
                  <Bar dataKey="pending" name="Pending" fill={STATUS_COLORS.pending} radius={[4, 4, 0, 0]} isAnimationActive={false} />
                  <Bar dataKey="completed" name="Completed" fill={STATUS_COLORS.completed} radius={[4, 4, 0, 0]} isAnimationActive={false} />
                  <Bar dataKey="cancelled" name="Cancelled" fill={STATUS_COLORS.cancelled} radius={[4, 4, 0, 0]} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartWrapper>
        </div>
      </div>
    </div>
  );
}

// --- REUSABLE COMPONENTS ---
function KPICard({ title, value, label, icon, color }) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between group transition-all duration-500">
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{title}</p>
        <h3 className="text-4xl font-black text-slate-800 tracking-tighter tabular-nums">{value}</h3>
        <p className="text-xs text-slate-400 font-bold mt-1 uppercase">{label}</p>
      </div>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl shadow-inner ${color}`}>
        {icon}
      </div>
    </div>
  );
}

function ChartWrapper({ title, children, syncTime }) {
  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 flex flex-col items-center">
      <div className="w-full flex justify-between items-start mb-6">
        <div>
          <h2 className="text-lg font-black text-slate-800 tracking-tight">{title}</h2>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Last Sync: {syncTime}</span>
        </div>
        <div className="p-2 bg-slate-50 rounded-lg">
          <FaFilter size={12} className="text-slate-400" />
        </div>
      </div>
      {children}
    </div>
  );
}