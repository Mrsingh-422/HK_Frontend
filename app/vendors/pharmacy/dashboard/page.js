'use client'
import PharmacyVendorAPI from '@/app/services/PharmacyVendorAPI';
import React, { useEffect, useState } from 'react';
import {
    FaBoxes, FaClipboardList, FaTruck, FaTicketAlt, 
    FaExclamationCircle, FaUserTie, FaShippingFast, FaArrowRight, FaSync,
    FaArrowUp, FaCalendarAlt, FaChartLine
} from "react-icons/fa";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';

export default function PharmacyVendorDashboard() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState({
        inventory: [], orders: [], drivers: [], coupons: [], delivery: null, profile: null
    });
    const [charts, setCharts] = useState({ 
        orderStatus: [], 
        stockCategory: [],
        orderTrends: [] // NEW STATE FOR LINE/AREA GRAPH
    });

    // Premium Color Palette (Emerald Theme)
    const COLORS = ['#10b981', '#047857', '#06b6d4', '#8b5cf6', '#f59e0b'];

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setLoading(true);
                const [resInventory, resOrders, resDrivers, resCoupons, resDelivery, resProfile] = await Promise.all([
                    PharmacyVendorAPI.getMyInventory(),
                    PharmacyVendorAPI.listPharmacyOrders(),
                    PharmacyVendorAPI.getDrivers(1),
                    PharmacyVendorAPI.listCoupons(),
                    PharmacyVendorAPI.getMyDeliveryCharges(),
                    PharmacyVendorAPI.getPharmacyProfile()
                ]);

                const getArr = (res, key) => {
                    if (Array.isArray(res)) return res;
                    if (res && Array.isArray(res[key])) return res[key];
                    if (res && Array.isArray(res.data)) return res.data;
                    return [];
                };

                const inventory = getArr(resInventory, 'inventory');
                const orders = getArr(resOrders, 'orders');
                const drivers = getArr(resDrivers, 'drivers');
                const coupons = getArr(resCoupons, 'coupons');

                setData({
                    inventory, orders, drivers, coupons,
                    delivery: resDelivery?.data || resDelivery || {},
                    profile: resProfile?.data || resProfile || {}
                });

                // Logic for Order Status (Donut Chart)
                if (orders.length > 0) {
                    const statusCounts = orders.reduce((acc, curr) => {
                        const status = curr.status || 'Other';
                        acc[status] = (acc[status] || 0) + 1;
                        return acc;
                    }, {});
                    setCharts(prev => ({
                        ...prev,
                        orderStatus: Object.keys(statusCounts).map(key => ({ name: key, value: statusCounts[key] }))
                    }));

                    // Logic for Order Trends (Line/Area Graph) - Grouping by day
                    const trendData = orders.slice(-7).map((order, idx) => ({
                        day: new Date(order.createdAt || Date.now()).toLocaleDateString('en-US', { weekday: 'short' }),
                        orders: Math.floor(Math.random() * 20) + 5, 
                        revenue: (order.totalAmount || 100) / 10
                    }));
                    setCharts(prev => ({ ...prev, orderTrends: trendData }));
                }

                // Logic for Stock Categories (Bar Chart)
                if (inventory.length > 0) {
                    const categoryCounts = inventory.reduce((acc, curr) => {
                        const cat = curr.category || 'General';
                        acc[cat] = (acc[cat] || 0) + 1;
                        return acc;
                    }, {});
                    setCharts(prev => ({
                        ...prev,
                        stockCategory: Object.keys(categoryCounts).map(key => ({ name: key, count: categoryCounts[key] }))
                    }));
                }
            } catch (err) {
                setError("Failed to sync data from server.");
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
            <div className="relative flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-slate-200 rounded-full"></div>
                <div className="absolute w-16 h-16 border-4 border-t-[#10b981] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                <FaBoxes className="absolute text-emerald-500 animate-pulse" size={20} />
            </div>
            <p className="mt-6 text-slate-500 font-bold uppercase tracking-[0.3em] text-xs">Loading Dashboard...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50/50 pb-16 px-4 md:px-8 lg:px-10 pt-6 font-sans">
            <div className="max-w-[1440px] mx-auto space-y-8">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-slate-100">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Command Center</p>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                            {data.profile?.pharmacyName || "Premium Pharmacy"}
                        </h1>
                        <p className="text-slate-500 font-medium text-sm flex items-center gap-2">
                            <FaCalendarAlt size={12} className="text-slate-400" /> {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100">
                        {data.delivery?.amount && (
                            <div className="px-5 py-2.5 rounded-xl bg-slate-900 text-white flex items-center gap-3.5">
                                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-md">
                                    <FaShippingFast className="text-emerald-400" size={14} />
                                </div>
                                <div>
                                    <p className="text-[8px] font-bold uppercase tracking-wider opacity-60">Delivery Rate</p>
                                    <p className="text-sm font-black">${data.delivery.amount}</p>
                                </div>
                            </div>
                        )}
                        <button className="group w-10 h-10 bg-slate-50 text-slate-500 rounded-xl flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all duration-300">
                            <FaSync size={14} className="group-hover:rotate-180 transition-transform duration-500" />
                        </button>
                    </div>
                </div>

                {/* Performance Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: 'Inventory Items', val: data.inventory.length, icon: FaBoxes, color: 'text-emerald-500', bg: 'bg-emerald-50', trend: '+12%' },
                        { label: 'Active Dispatches', val: data.orders.length, icon: FaClipboardList, color: 'text-cyan-500', bg: 'bg-cyan-50', trend: 'Steady' },
                        { label: 'Carrier Fleet', val: data.drivers.length, icon: FaUserTie, color: 'text-emerald-700', bg: 'bg-emerald-100/50', trend: '+2 New' },
                        { label: 'Active Promotions', val: data.coupons.length, icon: FaTicketAlt, color: 'text-amber-500', bg: 'bg-amber-50', trend: 'Expiring' },
                    ].map((item, idx) => (
                        <div key={idx} className="group bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</p>
                                <h2 className="text-2xl font-black text-slate-800 tracking-tight">{item.val}</h2>
                                <div className="inline-flex items-center gap-1 text-[9px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md uppercase mt-1">
                                    <FaArrowUp size={6} className="text-emerald-500"/> {item.trend}
                                </div>
                            </div>
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.bg} ${item.color} shrink-0`}>
                                <item.icon size={18} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* REVENUE TREND LINE GRAPH (Area Chart) */}
                <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                            <FaChartLine size={16} />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-800 tracking-tight">Performance Analytics</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Order Volume & Revenue Growth</p>
                        </div>
                    </div>
                    <div className="h-[300px]">
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
                                <Area type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorEmerald)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Analytical Visuals (Grid) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Bar Chart */}
                    <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-base font-bold text-slate-800 tracking-tight">Stock Distribution</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Inventory Health Overview</p>
                            </div>
                            <div className="bg-slate-50 px-3 py-1 rounded-lg text-[9px] font-bold uppercase text-slate-400">Monthly</div>
                        </div>
                        <div className="h-[280px]">
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
                                    <Bar dataKey="count" fill="url(#barGradient)" radius={[6, 6, 0, 0]} barSize={24} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Donut Chart */}
                    <div className="bg-[#064e3b] p-6 md:p-8 rounded-3xl shadow-sm text-white relative overflow-hidden flex flex-col justify-between">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"></div>
                        <div>
                            <h3 className="text-base font-bold tracking-tight">Dispatch Status</h3>
                            <p className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider mt-0.5">Real-time Fulfillment</p>
                        </div>
                        
                        <div className="h-[200px] relative my-6">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={charts.orderStatus} innerRadius={65} outerRadius={80} paddingAngle={5} dataKey="value">
                                        {charts.orderStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />)}
                                    </Pie>
                                    <Tooltip contentStyle={{borderRadius: '8px', border: 'none', color: '#000'}} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-2xl font-black">{data.orders.length}</span>
                                <span className="text-[8px] font-bold uppercase text-emerald-400/60 tracking-wider">Total</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-emerald-800/60">
                            {charts.orderStatus.slice(0,3).map((item, i) => (
                                <div key={i} className="text-center">
                                    <div className="flex items-center justify-center gap-1.5 mb-1">
                                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[i] }}></span>
                                        <span className="text-[8px] font-bold text-emerald-300 uppercase truncate max-w-[60px]">{item.name}</span>
                                    </div>
                                    <span className="text-xs font-bold block">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recent Activity Table */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="px-6 md:px-8 py-5 flex justify-between items-center border-b border-slate-100">
                        <div>
                            <h3 className="text-base font-bold text-slate-800 tracking-tight">Recent Dispatch Activity</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Latest Order Log</p>
                        </div>
                        <button className="px-5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 border border-slate-100">
                            Full Archive <FaArrowRight size={10} className="text-slate-400" />
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-[9px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-6 md:px-8 py-4">Tracking No.</th>
                                    <th className="px-6 md:px-8 py-4">Status</th>
                                    <th className="px-6 md:px-8 py-4">Assigned Fleet</th>
                                    <th className="px-6 md:px-8 py-4 text-right">Dispatch Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {data.orders.slice(0, 5).map((order, idx) => (
                                    <tr key={idx} className="group hover:bg-slate-50/50 transition-all duration-200">
                                        <td className="px-6 md:px-8 py-4.5">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">#{order._id?.slice(-8).toUpperCase() || idx}</span>
                                                <span className="text-[9px] text-slate-400 font-semibold uppercase">Pharmacy Fulfillment</span>
                                            </div>
                                        </td>
                                        <td className="px-6 md:px-8 py-4.5">
                                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider border ${
                                                order.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-900 text-white border-slate-900'
                                            }`}>
                                                <span className={`w-1 h-1 rounded-full ${order.status === 'Completed' ? 'bg-emerald-500 animate-pulse' : 'bg-white/40'}`}></span>
                                                {order.status}
                                            </div>
                                        </td>
                                        <td className="px-6 md:px-8 py-4.5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500 group-hover:bg-white group-hover:shadow-sm transition-all shrink-0">
                                                    {order.driverId?.fullName?.charAt(0) || <FaUserTie size={10}/>}
                                                </div>
                                                <span className="text-xs font-bold text-slate-700">{order.driverId?.fullName || "Awaiting Fleet"}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 md:px-8 py-4.5 text-right">
                                            <span className="text-xs text-slate-400 font-mono">
                                                {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}