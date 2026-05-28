'use client'
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import {
    FaClipboardList,
    FaTruckLoading,
    FaExclamationCircle,
    FaChartLine,
    FaChartPie,
    FaCheckCircle,
    FaWallet,
    FaFlask
} from "react-icons/fa";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import LabVendorAPI from '@/app/services/LabVendorAPI';

export default function LabVendorDashboard() {
    const { user } = useAuth(); // Changed from pharmacyVendor to generic user/lab context
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Dynamic Data States
    const [stats, setStats] = useState([]);
    const [orderStatusData, setOrderStatusData] = useState([]);
    const [inventoryData, setInventoryData] = useState([]);
    const [labName, setLabName] = useState("Lab Partner");

    const COLORS = ['#F59E0B', '#08B36A', '#3B82F6', '#EF4444'];

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const [dashRes, testsRes, profileRes] = await Promise.all([
                    LabVendorAPI.getDashboardStats(),
                    LabVendorAPI.getMyTests(),
                    LabVendorAPI.getLabProfile()
                ]);

                setLabName(profileRes?.labName || profileRes?.data?.labName || "Lab Partner");

                const d = dashRes.data;

                // 1. Process Stats Cards
                setStats([
                    {
                        label: 'New Requests',
                        value: d.requests || 0,
                        icon: FaClipboardList,
                        color: 'text-amber-600',
                        bg: 'bg-amber-100'
                    },
                    {
                        label: 'Accepted Orders',
                        value: d.accepted || 0,
                        icon: FaTruckLoading,
                        color: 'text-green-600',
                        bg: 'bg-green-100'
                    },
                    {
                        label: 'Completed',
                        value: d.completed || 0,
                        icon: FaCheckCircle,
                        color: 'text-blue-600',
                        bg: 'bg-blue-100'
                    },
                    {
                        label: "Today's Earnings",
                        value: `₹${d.todayEarnings || 0}`,
                        icon: FaWallet,
                        color: 'text-[#08B36A]',
                        bg: 'bg-green-50'
                    },
                ]);

                // 2. Process Pie Chart (Distribution of Orders)
                const formattedPieData = [
                    { name: 'PENDING', value: d.requests || 0 },
                    { name: 'ACCEPTED', value: d.accepted || 0 },
                    { name: 'COMPLETED', value: d.completed || 0 },
                ].filter(item => item.value > 0);
                
                // If all are zero, show a placeholder to prevent empty chart
                setOrderStatusData(formattedPieData.length > 0 ? formattedPieData : [{name: 'NO DATA', value: 1}]);

                // 3. Process Bar Chart (Tests in Inventory)
                const tests = testsRes.data || [];
                const catMap = tests.reduce((acc, item) => {
                    const cat = item.category || 'General';
                    acc[cat] = (acc[cat] || 0) + 1;
                    return acc;
                }, {});

                const formattedBarData = Object.keys(catMap).map(key => ({
                    name: key,
                    count: catMap[key]
                })).slice(0, 6);
                
                setInventoryData(formattedBarData.length > 0 ? formattedBarData : [{name: 'No Tests', count: 0}]);

            } catch (err) {
                console.error("Lab Dashboard Load Error:", err);
                setError("Failed to fetch real-time dashboard data.");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#08B36A]"></div>
            <p className="text-gray-500 animate-pulse">Syncing your lab records...</p>
        </div>
    );

    if (error) return (
        <div className="p-6 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700">
            <FaExclamationCircle size={20} />
            <p className="font-medium">{error}</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto pb-10 px-4">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Lab Dashboard</h1>
                <p className="text-gray-500 mt-1 font-medium">Welcome back, <span className="text-[#08B36A]">{labName}</span>. Here is your summary.</p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4 transition-all hover:shadow-md hover:border-[#08B36A]/20 group">
                        <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center transition-transform group-hover:scale-110`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-black">{stat.label}</p>
                            <h2 className="text-2xl font-black text-gray-800">{stat.value}</h2>
                        </div>
                    </div>
                ))}
            </div>

            {/* Graphs Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                
                {/* Bar Chart: Test Distribution */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><FaFlask /></div>
                        <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight">Services by Category</h3>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={inventoryData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10, fontWeight: 'bold'}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                                <Tooltip cursor={{fill: '#f9fafb'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                                <Bar dataKey="count" fill="#08B36A" radius={[6, 6, 0, 0]} barSize={35} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Pie Chart: Order Distribution */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-green-50 text-[#08B36A] rounded-lg"><FaChartPie /></div>
                        <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight">Booking Distribution</h3>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={orderStatusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={95}
                                    paddingAngle={8}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {orderStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{borderRadius: '12px'}} />
                                <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{paddingTop: '20px', fontWeight: 'bold', fontSize: '12px'}} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>

            <hr className="my-8 border-gray-100" />
        </div>
    )
}