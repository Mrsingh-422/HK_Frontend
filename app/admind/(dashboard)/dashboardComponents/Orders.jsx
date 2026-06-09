"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from "recharts";
import {
  FaShoppingBasket, FaChartLine, FaSyncAlt, FaDownload,
  FaCheckCircle, FaClock, FaSatelliteDish, FaUserMd,
  FaHospital, FaFlask, FaCapsules, FaAmbulance, FaUserNurse
} from "react-icons/fa";
import { toast } from "react-hot-toast";
import AdminAPI from "@/app/services/AdminAPI";

// Theme Colors
const BRAND_GREEN = "#08B36A";
const CHART_COLORS = ["#08B36A", "#10b981", "#34d399", "#059669", "#6ee7b7", "#a7f3d0"];

const STATUS_COLORS = {
  pending: "#F59E0B",   // Amber
  completed: "#08B36A", // Green
  cancelled: "#EF4444", // Red
  approved: "#10B981",  // Emerald
  rejected: "#F43F5E",  // Rose
  incomplete: "#94A3B8" // Slate
};

export default function UnifiedAdminDashboard() {
  const [initialLoading, setInitialLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);

  // Data States
  const [orderRaw, setOrderRaw] = useState(null);
  const [providerRaw, setProviderRaw] = useState(null);

  // --- DATA FETCHING (Unified Polling) ---
  const fetchAllStats = useCallback(async (isBackground = false) => {
    if (!isBackground) setInitialLoading(true);
    setIsSyncing(true);

    try {
      // Execute both API calls in parallel
      const [orderRes, providerRes] = await Promise.all([
        AdminAPI.adminStatDashboard(),
        AdminAPI.adminProviderStats()
      ]);

      if (orderRes.success) setOrderRaw(orderRes.data);
      if (providerRes.success) setProviderRaw(providerRes.data);

      setLastSync(new Date().toLocaleTimeString());
    } catch (error) {
      console.error("Dashboard Sync Error:", error);
      if (!isBackground) toast.error("Failed to fetch live statistics");
    } finally {
      setInitialLoading(false);
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    fetchAllStats();
    const interval = setInterval(() => fetchAllStats(true), 5000); // 5s Real-time
    return () => clearInterval(interval);
  }, [fetchAllStats]);

  // --- DATA TRANSFORMATIONS ---
  const orderAnalytics = useMemo(() => {
    if (!orderRaw) return { chart: [], total: 0 };
    let total = 0;
    const chart = Object.keys(orderRaw).map(key => {
      const val = orderRaw[key];
      const sum = val.pending + val.completed + val.cancelled;
      total += sum;
      return { name: key.toUpperCase(), value: sum, ...val };
    });
    return { chart, total };
  }, [orderRaw]);

  const providerAnalytics = useMemo(() => {
    if (!providerRaw) return { chart: [], total: 0 };
    let total = 0;
    const chart = Object.keys(providerRaw).map(key => {
      const val = providerRaw[key];
      total += val.total;
      return { name: key.toUpperCase(), ...val };
    });
    return { chart, total };
  }, [providerRaw]);

  // --- EXPORT FUNCTION ---
  const handleExportCSV = () => {
    if (!orderRaw || !providerRaw) return toast.error("Data not ready");

    let csv = "CATEGORY,TYPE,PENDING/INCOMPLETE,COMPLETED/APPROVED,CANCELLED/REJECTED,TOTAL\n";

    // Add Orders
    Object.keys(orderRaw).forEach(k => {
      const d = orderRaw[k];
      csv += `${k.toUpperCase()},ORDER,${d.pending},${d.completed},${d.cancelled},${d.pending + d.completed + d.cancelled}\n`;
    });

    // Add Providers
    Object.keys(providerRaw).forEach(k => {
      const d = providerRaw[k];
      csv += `${k.toUpperCase()},PROVIDER,${d.incomplete},${d.approved},${d.rejected},${d.total}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Live_Stats_${new Date().getTime()}.csv`;
    a.click();
    toast.success("CSV Exported");
  };

  if (initialLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <FaSatelliteDish className="text-[#08B36A] animate-bounce" size={40} />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Syncing Live Ecosystem...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 lg:p-10 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto">

        {/* --- HEADER --- */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Ecosystem Stream Active</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Live Stats</h1>
            <p className="text-slate-500 font-medium text-sm">Last Sync: {lastSync} (5s Interval)</p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className={`text-[10px] font-black px-4 py-3 rounded-xl border flex items-center gap-2 ${isSyncing ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-white text-slate-400'}`}>
              <FaSyncAlt className={isSyncing ? "animate-spin" : ""} /> {isSyncing ? "SYNCING..." : "LIVE"}
            </div>
            <button onClick={handleExportCSV} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-900 px-6 py-3 rounded-xl text-xs font-black text-white hover:bg-black transition-all shadow-lg">
              <FaDownload /> EXPORT CSV
            </button>
          </div>
        </header>

        {/* --- KPI SECTION --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <KPICard title="Total Orders" value={orderAnalytics.total} icon={<FaShoppingBasket />} color="bg-emerald-50 text-emerald-600" />
          <KPICard title="Total Vendors" value={providerAnalytics.total} icon={<FaUserMd />} color="bg-blue-50 text-blue-600" />
          <KPICard title="Pending Orders" value={statsFromOrder(orderRaw, 'pending')} icon={<FaClock />} color="bg-amber-50 text-amber-600" />
          <KPICard title="Incomplete Profiles" value={statsFromProvider(providerRaw, 'incomplete')} icon={<FaChartLine />} color="bg-slate-900 text-white" />
        </div>

        {/* --- CHART GRID --- */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-10">

          {/* Order Status Distribution */}
          <ChartWrapper title="Order fulfillment Status" syncTime={lastSync}>
            <div className="w-full h-[320px]">
              <ResponsiveContainer>
                <BarChart data={orderAnalytics.chart}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                  <YAxis hide />
                  <Tooltip cursor={{ fill: '#f8fafc' }} />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: 20, fontSize: 10, fontWeight: 'bold' }} />
                  <Bar dataKey="pending" name="Pending" fill={STATUS_COLORS.pending} radius={[4, 4, 0, 0]} isAnimationActive={false} />
                  <Bar dataKey="completed" name="Completed" fill={STATUS_COLORS.completed} radius={[4, 4, 0, 0]} isAnimationActive={false} />
                  <Bar dataKey="cancelled" name="Cancelled" fill={STATUS_COLORS.cancelled} radius={[4, 4, 0, 0]} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartWrapper>

          {/* Provider Approval Distribution */}
          <ChartWrapper title="Provider Onboarding Status" syncTime={lastSync}>
            <div className="w-full h-[320px]">
              <ResponsiveContainer>
                <BarChart data={providerAnalytics.chart}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                  <YAxis hide />
                  <Tooltip cursor={{ fill: '#f8fafc' }} />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: 20, fontSize: 10, fontWeight: 'bold' }} />
                  <Bar dataKey="approved" name="Approved" fill={STATUS_COLORS.approved} radius={[4, 4, 0, 0]} isAnimationActive={false} />
                  <Bar dataKey="incomplete" name="Incomplete" fill={STATUS_COLORS.incomplete} radius={[4, 4, 0, 0]} isAnimationActive={false} />
                  <Bar dataKey="rejected" name="Rejected" fill={STATUS_COLORS.rejected} radius={[4, 4, 0, 0]} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartWrapper>

          {/* Donut: Market Share */}
          <ChartWrapper title="Order Demand Share" syncTime={lastSync}>
            <div className="w-full h-[300px] relative">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={orderAnalytics.chart} innerRadius={80} outerRadius={110} paddingAngle={8} dataKey="value" stroke="none" isAnimationActive={false}>
                    {orderAnalytics.chart.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] font-black text-slate-300 uppercase">Total Orders</span>
                <span className="text-3xl font-black text-slate-800">{orderAnalytics.total}</span>
              </div>
            </div>
          </ChartWrapper>

          {/* Provider Capacity Chart */}
          <ChartWrapper title="Provider Resource Share" syncTime={lastSync}>
            <div className="w-full h-[300px] relative">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={providerAnalytics.chart} innerRadius={80} outerRadius={110} paddingAngle={8} dataKey="total" stroke="none" isAnimationActive={false}>
                    {providerAnalytics.chart.map((_, i) => <Cell key={i} fill={CHART_COLORS[(i + 2) % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] font-black text-slate-300 uppercase">Total Vendors</span>
                <span className="text-3xl font-black text-slate-800">{providerAnalytics.total}</span>
              </div>
            </div>
          </ChartWrapper>
        </div>
      </div>
    </div>
  );
}

// --- HELPERS ---
function statsFromOrder(data, key) {
  if (!data) return 0;
  return Object.values(data).reduce((acc, curr) => acc + curr[key], 0);
}

function statsFromProvider(data, key) {
  if (!data) return 0;
  return Object.values(data).reduce((acc, curr) => acc + curr[key], 0);
}

function KPICard({ title, value, icon, color }) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between transition-all duration-500">
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-4xl font-black text-slate-800 tracking-tighter tabular-nums">{value}</h3>
      </div>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl shadow-inner ${color}`}>{icon}</div>
    </div>
  );
}

function ChartWrapper({ title, children, syncTime }) {
  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 flex flex-col items-center">
      <div className="w-full flex justify-between items-start mb-6">
        <div>
          <h2 className="text-lg font-black text-slate-800 tracking-tight">{title}</h2>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Live Sync: {syncTime}</span>
        </div>
      </div>
      {children}
    </div>
  );
}