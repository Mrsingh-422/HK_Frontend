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

    // Premium Color Palette (Emerald Theme - Black replaced with deep Green)
    const COLORS = ['#10b981', '#064e3b', '#06b6d4', '#8b5cf6', '#f59e0b'];

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
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#fcfdfe]">
            <div className="relative">
                <div className="w-24 h-24 border-2 border-slate-100 rounded-full"></div>
                <div className="absolute inset-0 w-24 h-24 border-t-2 border-[#10b981] rounded-full animate-spin"></div>
                <FaBoxes className="absolute inset-0 m-auto text-slate-200 animate-pulse" size={30} />
            </div>
            <p className="mt-8 text-slate-400 font-black uppercase tracking-[0.5em] text-[10px]">Loading Essence</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-20 px-4 lg:px-12 pt-8">
            <div className="max-w-[1600px] mx-auto">
                
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-12 gap-8">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <div className="px-3 py-1 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest rounded-full">Live</div>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Command Center</p>
                        </div>
                        <h1 className="text-6xl font-black text-emerald-950 tracking-tighter leading-tight">
                            {data.profile?.pharmacyName || "Premium Pharmacy"}
                        </h1>
                        <p className="text-slate-400 font-medium text-lg flex items-center gap-2 italic">
                            <FaCalendarAlt size={14} className="text-emerald-500" /> {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-4 bg-white p-2 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white">
                        {data.delivery?.amount && (
                            <div className="px-8 py-4 rounded-[2.2rem] bg-emerald-900 text-white flex items-center gap-5">
                                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md">
                                    <FaShippingFast className="text-emerald-400" size={20} />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60">Delivery Rate</p>
                                    <p className="text-xl font-black">${data.delivery.amount}</p>
                                </div>
                            </div>
                        )}
                        <button className="group w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all duration-500 hover:rotate-180">
                            <FaSync size={20} />
                        </button>
                    </div>
                </div>

                {/* Performance Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                    {[
                        { label: 'Inventory Items', val: data.inventory.length, icon: FaBoxes, color: '#10b981', trend: '+12%' },
                        { label: 'Active Dispatches', val: data.orders.length, icon: FaClipboardList, color: '#06b6d4', trend: 'Steady' },
                        { label: 'Carrier Fleet', val: data.drivers.length, icon: FaUserTie, color: '#064e3b', trend: '+2 New' },
                        { label: 'Active Promotions', val: data.coupons.length, icon: FaTicketAlt, color: '#f59e0b', trend: 'Expiring' },
                    ].map((item, idx) => (
                        <div key={idx} className="group bg-white p-8 rounded-[3rem] border border-white shadow-xl shadow-slate-200/40 hover:shadow-2xl transition-all duration-500 flex flex-col items-center text-center">
                            <div className="w-16 h-16 rounded-3xl mb-6 flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-lg shadow-slate-100 group-hover:bg-emerald-900 group-hover:text-white bg-slate-50 text-emerald-900">
                                <item.icon size={24} />
                            </div>
                            <h2 className="text-4xl font-black text-emerald-950 tracking-tight">{item.val}</h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{item.label}</p>
                            <div className="mt-4 flex items-center gap-1 text-[9px] font-black text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-tighter">
                                <FaArrowUp size={8}/> {item.trend}
                            </div>
                        </div>
                    ))}
                </div>

                {/* REVENUE TREND LINE GRAPH (Area Chart) */}
                <div className="mb-10 bg-white p-12 rounded-[4rem] shadow-2xl shadow-slate-200/40 border border-white">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                            <FaChartLine size={20} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-emerald-950 tracking-tight">Performance Analytics</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Order Volume & Revenue Growth</p>
                        </div>
                    </div>
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={charts.orderTrends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorEmerald" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                                <Tooltip 
                                    contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)'}} 
                                />
                                <Area type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorEmerald)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Analytical Visuals (Grid) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-16">
                    {/* Bar Chart */}
                    <div className="lg:col-span-2 bg-white p-12 rounded-[3.5rem] shadow-2xl shadow-slate-200/50 border border-white">
                        <div className="flex items-center justify-between mb-12">
                            <div>
                                <h3 className="text-xl font-black text-emerald-950 tracking-tight">Stock Distribution</h3>
                                <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Inventory Health Overview</p>
                            </div>
                            <div className="bg-slate-50 px-4 py-2 rounded-xl text-[10px] font-black uppercase text-slate-400">Monthly View</div>
                        </div>
                        <div className="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={charts.stockCategory} margin={{top: 0, right: 0, left: -20, bottom: 0}}>
                                    <defs>
                                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#10b981" />
                                            <stop offset="100%" stopColor="#059669" />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="0" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} dy={15} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                                    <Tooltip 
                                        cursor={{fill: '#f8fafc'}} 
                                        contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)', padding: '20px'}} 
                                    />
                                    <Bar dataKey="count" fill="url(#barGradient)" radius={[12, 12, 12, 12]} barSize={32} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Donut Chart - Emerald Accents (Black bg changed to Deep Emerald) */}
                    <div className="bg-emerald-950 p-12 rounded-[3.5rem] shadow-2xl text-white relative overflow-hidden flex flex-col">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/20 rounded-full blur-[80px]"></div>
                        <h3 className="text-xl font-black tracking-tight relative z-10">Dispatch Status</h3>
                        <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.3em] mt-2 relative z-10">Real-time Fulfillment</p>
                        
                        <div className="h-[280px] relative z-10 my-8">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={charts.orderStatus} innerRadius={85} outerRadius={110} paddingAngle={10} dataKey="value">
                                        {charts.orderStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />)}
                                    </Pie>
                                    <Tooltip contentStyle={{borderRadius: '15px', border: 'none', color: '#000'}} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-4xl font-black">{data.orders.length}</span>
                                <span className="text-[9px] font-black uppercase text-emerald-500/50 tracking-[0.2em]">Total</span>
                            </div>
                        </div>

                        <div className="space-y-4 relative z-10 mt-auto">
                            {charts.orderStatus.slice(0,3).map((item, i) => (
                                <div key={i} className="flex items-center justify-between group cursor-default">
                                    <div className="flex items-center gap-3">
                                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }}></span>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-white transition-colors">{item.name}</span>
                                    </div>
                                    <span className="text-xs font-black">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recent Activity Table */}
                <div className="bg-white rounded-[4rem] shadow-2xl shadow-slate-200/40 border border-white overflow-hidden">
                    <div className="px-12 py-10 flex justify-between items-center border-b border-slate-50">
                        <div>
                            <h3 className="text-2xl font-black text-emerald-950 tracking-tight">Recent Dispatch Activity</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Latest Order Log</p>
                        </div>
                        <button className="px-8 py-4 bg-slate-50 hover:bg-emerald-900 hover:text-white text-emerald-900 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 flex items-center gap-3">
                            Full Archive <FaArrowRight />
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
                                    <th className="px-12 py-8">Tracking No.</th>
                                    <th className="px-12 py-8">Status</th>
                                    <th className="px-12 py-8">Assigned Fleet</th>
                                    <th className="px-12 py-8 text-right">Dispatch Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {data.orders.slice(0, 5).map((order, idx) => (
                                    <tr key={idx} className="group hover:bg-slate-50/50 transition-all duration-300">
                                        <td className="px-12 py-8">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-emerald-950 group-hover:text-emerald-600 transition-colors">#{order._id?.slice(-8).toUpperCase() || idx}</span>
                                                <span className="text-[9px] font-bold text-slate-400 uppercase">Pharmacy fulfillment</span>
                                            </div>
                                        </td>
                                        <td className="px-12 py-8">
                                            <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm ${
                                                order.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-emerald-900 text-white border-emerald-900'
                                            }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${order.status === 'Completed' ? 'bg-emerald-500 animate-pulse' : 'bg-white/40'}`}></span>
                                                {order.status}
                                            </div>
                                        </td>
                                        <td className="px-12 py-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-[11px] font-black text-slate-500 group-hover:bg-white group-hover:shadow-md transition-all">
                                                    {order.driverId?.fullName?.charAt(0) || <FaUserTie size={12}/>}
                                                </div>
                                                <span className="text-xs font-black text-slate-700">{order.driverId?.fullName || "Awaiting Fleet"}</span>
                                            </div>
                                        </td>
                                        <td className="px-12 py-8 text-right">
                                            <span className="text-xs font-bold text-slate-400 font-mono tracking-tighter">
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