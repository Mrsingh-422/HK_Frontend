'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
    FaFire, FaCheckCircle, FaClock, FaBuilding, 
    FaArrowUp, FaArrowDown, FaBell, FaMapMarkerAlt, FaSpinner 
} from 'react-icons/fa';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    BarChart, Bar, Legend, Cell 
} from 'recharts';

import FireHeadAPI from '@/app/services/FireHeadAPI'; // Adjust path if needed

export default function DashboardOverview() {
    // --- STATES FOR API DATA ---
    const [kpiData, setKpiData] = useState({ freshCases: 0, pendingCases: 0, historyCases: 0 });
    const [monthlyChartData, setMonthlyChartData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // --- FETCH DATA ON MOUNT ---
    useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true);
            try {
                // Fetching both APIs parallel for faster loading
                const [dashboardRes, chartRes] = await Promise.all([
                    FireHeadAPI.getDashboardOverview(),
                    FireHeadAPI.getAnalyticsChart()
                ]);

                if (dashboardRes.success) {
                    setKpiData(dashboardRes.data);
                }
                if (chartRes.success) {
                    setMonthlyChartData(chartRes.data);
                }
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Calculate Total cases for the 4th Card based on API Data
    const totalCases = (kpiData.freshCases || 0) + (kpiData.pendingCases || 0) + (kpiData.historyCases || 0);

    // 🌟 Dummy Data for items not covered by API yet (Zones & Recent Cases)
    const zoneData = [
        { name: 'Jhotwara', cases: 45 },
        { name: 'Mansarovar', cases: 30 },
        { name: 'Vaishali', cases: 25 },
        { name: 'Malviya Ngr', cases: 35 },
    ];
    const COLORS = ['#ef4444', '#f97316', '#3b82f6', '#10b981'];

    const recentCases = [
        { id: '202603211530', location: 'C-Scheme, Near Central Mall', status: 'Critical', time: '10 mins ago' },
        { id: '202603211410', location: 'Mansarovar, Sector 5', status: 'Pending', time: '1 hour ago' },
        { id: '202603211100', location: 'Tonk Road, Bajaj Nagar', status: 'Resolved', time: '4 hours ago' },
    ];

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh] text-slate-400">
                <FaSpinner className="animate-spin text-4xl text-[#08B36A] mb-4"/>
                <p className="text-xs font-bold uppercase tracking-widest">Loading Dashboard...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto animate-in fade-in duration-500 pb-10">
            
            {/* 🌟 Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Overview Dashboard</h1>
                    <p className="text-sm text-gray-500 mt-1">Welcome back! Here is what's happening today across all fire stations.</p>
                </div>
                <div className="text-right">
                    <p className="text-sm font-bold text-gray-800">
                        {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    <p className="text-xs text-gray-500">Jaipur Division HQ</p>
                </div>
            </div>

            {/* 🌟 KPI Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Card 1: Fresh Cases */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-gray-500 font-semibold mb-1">Fresh Cases</p>
                            <h3 className="text-3xl font-bold text-gray-800">{kpiData.freshCases}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500 text-xl border border-red-100">
                            <FaFire className="animate-pulse" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm">
                        <span className="text-red-500 font-bold">New Alerts</span>
                        <span className="text-gray-400 ml-2 text-xs">Immediate action needed</span>
                    </div>
                </div>

                {/* Card 2: Pending Cases */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-gray-500 font-semibold mb-1">Pending Cases</p>
                            <h3 className="text-3xl font-bold text-gray-800">{kpiData.pendingCases}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 text-xl border border-orange-100">
                            <FaClock />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm">
                        <span className="text-orange-500 font-bold">In Progress</span>
                        <span className="text-gray-400 ml-2 text-xs">Under Investigation</span>
                    </div>
                </div>

                {/* Card 3: Case History */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-gray-500 font-semibold mb-1">Case History</p>
                            <h3 className="text-3xl font-bold text-gray-800">{kpiData.historyCases}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-[#08B36A] text-xl border border-green-100">
                            <FaCheckCircle />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm">
                        <span className="text-green-500 font-bold">Resolved</span>
                        <span className="text-gray-400 ml-2 text-xs">Archived & Closed</span>
                    </div>
                </div>

                {/* Card 4: Total Cases (Calculated) */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-gray-500 font-semibold mb-1">Total Lifetime Cases</p>
                            <h3 className="text-3xl font-bold text-gray-800">{totalCases}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 text-xl border border-blue-100">
                            <FaBuilding />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm">
                        <span className="text-blue-500 font-bold">100%</span>
                        <span className="text-gray-400 ml-2 text-xs">System Tracked</span>
                    </div>
                </div>
            </div>

            {/* 🌟 Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                
                {/* Main Line Chart (Monthly Trends - API Data) */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm lg:col-span-2">
                    <div className="mb-6">
                        <h2 className="text-lg font-bold text-gray-800">Monthly Incident Trends</h2>
                        <p className="text-xs text-gray-500">Total cases reported across the year.</p>
                    </div>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={monthlyChartData} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                {/* Mapped to "month" key from API */}
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                                {/* Mapped to "cases" key from API */}
                                <Line type="monotone" dataKey="cases" name="Total Cases" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Bar Chart (Zone wise - Dummy Data) */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="mb-6">
                        <h2 className="text-lg font-bold text-gray-800">Cases by Zone</h2>
                        <p className="text-xs text-gray-500">High-risk areas analysis.</p>
                    </div>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={zoneData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} width={80} />
                                <Tooltip cursor={{fill: '#f9fafb'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="cases" radius={[0, 6, 6, 0]} barSize={20}>
                                    {zoneData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* 🌟 Recent Activity Table (Dummy Data) */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">Recent Critical Alerts</h2>
                        <p className="text-xs text-gray-500">Cases that need immediate attention.</p>
                    </div>
                    <Link href="/fhq/fresh-cases" className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
                        View All Cases →
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <tbody className="divide-y divide-gray-100">
                            {recentCases.map((item, idx) => (
                                <tr key={idx} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${item.status === 'Critical' ? 'bg-red-50 text-red-500' : item.status === 'Pending' ? 'bg-orange-50 text-orange-500' : 'bg-green-50 text-green-500'}`}>
                                                {item.status === 'Critical' ? <FaBell className="animate-bounce"/> : item.status === 'Pending' ? <FaClock /> : <FaCheckCircle />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800 text-sm">Case #{item.id}</p>
                                                <p className="text-[11px] text-gray-500 font-semibold">{item.time}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <FaMapMarkerAlt className="text-gray-400" />
                                            <span className="text-sm font-medium text-gray-600">{item.location}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className={`inline-flex px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${item.status === 'Critical' ? 'bg-red-100 text-red-700' : item.status === 'Pending' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                                            {item.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}