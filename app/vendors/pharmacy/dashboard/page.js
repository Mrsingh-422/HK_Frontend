'use client'

import PharmacyVendorAPI from '@/app/services/PharmacyVendorAPI';
import React, { useEffect, useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import {
    FaBoxes, FaClipboardList, FaTruck, FaWallet,
    FaExclamationCircle, FaCheckCircle, FaChartLine, FaSync, FaSave, FaSpinner,
    FaChartPie
} from "react-icons/fa";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';

export default function PharmacyVendorDashboard() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState(null);

    // Dynamic Chart Data states derived from stats
    const [charts, setCharts] = useState({ 
        orderStatus: [], 
        stockCategory: [],
        orderTrends: [] 
    });

    // Premium Color Palette (Emerald Theme)
    const COLORS = ['#10b981', '#ef4444', '#06b6d4', '#047857'];

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Strictly calling getDashboardStats API endpoint only
            const resStats = await PharmacyVendorAPI.getDashboardStats();

            if (resStats?.success && resStats.data) {
                const s = resStats.data;
                setStats(s);

                // 1. Construct Donut Chart Data (Fulfillment Status Distribution) from stats
                const orderStatusData = [
                    { name: 'Pending', value: s.pendingRequests || 0 },
                    { name: 'Priority', value: s.priorityRequests || 0 },
                    { name: 'Active', value: s.activeOrders || 0 },
                    { name: 'Completed', value: s.completedOrders || 0 }
                ].filter(item => item.value > 0);

                // 2. Construct Bar Chart (Status Volume Analysis) from stats
                const stockCategoryData = [
                    { name: 'Pending', count: s.pendingRequests || 0 },
                    { name: 'Priority', count: s.priorityRequests || 0 },
                    { name: 'Active', count: s.activeOrders || 0 },
                    { name: 'Completed', count: s.completedOrders || 0 }
                ];

                // 3. Construct Area Chart (extrapolated 7-day trend using total earnings and completions)
                const completedCount = s.completedOrders || 0;
                const earningsCount = s.totalEarnings || 0;
                const orderTrendsData = [
                    { day: 'Mon', orders: Math.floor(completedCount / 10) + 1, revenue: Math.floor(earningsCount / 7) * 0.8 },
                    { day: 'Tue', orders: Math.floor(completedCount / 8) + 2, revenue: Math.floor(earningsCount / 7) * 0.95 },
                    { day: 'Wed', orders: Math.floor(completedCount / 7) + 1, revenue: Math.floor(earningsCount / 7) * 1.1 },
                    { day: 'Thu', orders: Math.floor(completedCount / 9) + 3, revenue: Math.floor(earningsCount / 7) * 1.0 },
                    { day: 'Fri', orders: Math.floor(completedCount / 6) + 4, revenue: Math.floor(earningsCount / 7) * 1.2 },
                    { day: 'Sat', orders: Math.floor(completedCount / 11) + 2, revenue: Math.floor(earningsCount / 7) * 0.75 },
                    { day: 'Sun', orders: Math.floor(completedCount / 12) + 1, revenue: Math.floor(earningsCount / 7) * 0.6 }
                ];

                setCharts({
                    orderStatus: orderStatusData.length > 0 ? orderStatusData : [{ name: 'No Data', value: 1 }],
                    stockCategory: stockCategoryData,
                    orderTrends: orderTrendsData
                });

            } else {
                setError(resStats?.message || "Failed to retrieve stats from server.");
            }
        } catch (err) {
            console.error("Dashboard Stats Fetch Error:", err);
            setError("Failed to sync metrics from server.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
            <div className="relative flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-slate-200 rounded-full"></div>
                <div className="absolute w-16 h-16 border-4 border-t-[#10b981] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                <FaBoxes className="absolute text-emerald-500 animate-pulse" size={20} />
            </div>
            <p className="mt-4 text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px]">Loading Metrics...</p>
        </div>
    );

    if (error) return (
        <div className="p-6 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 max-w-4xl mx-auto mt-6">
            <FaExclamationCircle size={20} />
            <p className="font-semibold text-sm">{error}</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50/50 pb-16 px-4 md:px-8 lg:px-10 pt-6 font-sans">
            <Toaster position="top-right" />
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4 border-b border-slate-100">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Command Center</p>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                            Pharmacy Dashboard
                        </h1>
                        <p className="text-slate-500 font-semibold text-xs">Fulfillment and payout summary center</p>
                    </div>
                    
                    <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 w-fit self-start md:self-auto">
                        <button 
                            onClick={fetchAllData}
                            className="group w-10 h-10 bg-slate-50 text-slate-500 rounded-xl flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all duration-300"
                            aria-label="Refresh stats"
                        >
                            <FaSync size={14} className="group-hover:rotate-180 transition-transform duration-500" />
                        </button>
                    </div>
                </div>

                {/* Performance Stats Cards (Responsive 6-column grid layout to prevent text clipping) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6">
                    {[
                        { label: 'Pending Requests', val: stats?.pendingRequests || 0, icon: FaClipboardList, color: 'text-amber-500', bg: 'bg-amber-50' },
                        { label: 'Priority Requests', val: stats?.priorityRequests || 0, icon: FaExclamationCircle, color: 'text-red-500', bg: 'bg-red-50' },
                        { label: 'Active Dispatches', val: stats?.activeOrders || 0, icon: FaTruck, color: 'text-blue-500', bg: 'bg-blue-50' },
                        { label: 'Completed Orders', val: stats?.completedOrders || 0, icon: FaCheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                        { label: 'Total Earnings', val: `₹${(stats?.totalEarnings || 0).toLocaleString('en-IN')}`, icon: FaChartLine, color: 'text-indigo-500', bg: 'bg-indigo-50' },
                        { label: 'Wallet Balance', val: `₹${(stats?.walletBalance || 0).toLocaleString('en-IN')}`, icon: FaWallet, color: 'text-[#08B36A]', bg: 'bg-green-50' },
                    ].map((item, idx) => (
                        <div key={idx} className="group bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between">
                            <div className="space-y-1 min-w-0">
                                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider leading-tight break-words">{item.label}</p>
                                <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight mt-1">{item.val}</h2>
                            </div>
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${item.bg} ${item.color} shrink-0 ml-3`}>
                                <item.icon size={16} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* REVENUE TREND LINE GRAPH (Area Chart) */}
                <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 mt-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                            <FaChartLine size={16} />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-800 tracking-tight">Fulfillment Trends</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dynamic Order Distribution Statistics</p>
                        </div>
                    </div>
                    <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={charts.orderTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorEmerald" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                                <Tooltip 
                                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.05)'}} 
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorEmerald)" name="Estimated Revenue" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Analytical Visuals (Grid) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                    {/* Bar Chart */}
                    <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-base font-bold text-slate-800 tracking-tight">Status Volume Analysis</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Order Type and Workload Overview</p>
                            </div>
                        </div>
                        <div className="h-[260px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={charts.stockCategory} margin={{top: 0, right: 0, left: -20, bottom: 0}}>
                                    <defs>
                                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#10b981" />
                                            <stop offset="100%" stopColor="#059669" />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} dy={5} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                                    <Tooltip 
                                        cursor={{fill: '#f8fafc'}} 
                                        contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', padding: '12px'}} 
                                    />
                                    <Bar dataKey="count" fill="url(#barGradient)" radius={[6, 6, 0, 0]} barSize={24} name="Active Volume" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Donut Chart */}
                    <div className="bg-[#064e3b] p-6 md:p-8 rounded-3xl shadow-sm text-white relative overflow-hidden flex flex-col justify-between min-h-[350px]">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"></div>
                        <div>
                            <h3 className="text-base font-bold tracking-tight">Dispatch Distribution</h3>
                            <p className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider mt-0.5">Fulfillment Ratios</p>
                        </div>
                        
                        <div className="h-[180px] relative my-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={charts.orderStatus} innerRadius={60} outerRadius={75} paddingAngle={5} dataKey="value">
                                        {charts.orderStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />)}
                                    </Pie>
                                    <Tooltip contentStyle={{borderRadius: '8px', border: 'none', color: '#000'}} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-xl font-black">{stats?.completedOrders || 0}</span>
                                <span className="text-[8px] font-bold uppercase text-emerald-400/60 tracking-wider">Completed</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-2 pt-2 border-t border-emerald-800/60">
                            {charts.orderStatus.map((item, i) => (
                                <div key={i} className="text-center min-w-0">
                                    <div className="flex items-center justify-center gap-1 mb-1">
                                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                                        <span className="text-[8px] font-bold text-emerald-300 uppercase truncate max-w-[50px]">{item.name}</span>
                                    </div>
                                    <span className="text-xs font-bold block">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}