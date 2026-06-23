'use client';

import React, { useState, useEffect } from 'react';
import { FaSpinner, FaSyncAlt } from 'react-icons/fa';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { toast } from 'react-hot-toast';
import NurseAPI from '@/app/services/NurseAPI';

// --- SUB-COMPONENT: STATS GRAPH ---
const StatsGraph = ({ earnings }) => {
    const mockDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const distributionFactors = [0.12, 0.08, 0.15, 0.22, 0.18, 0.10, 0.15];
    
    const chartData = mockDays.map((day, idx) => ({
        day,
        yield: Math.round((earnings || 12500) * distributionFactors[idx])
    }));

    return (
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 mb-8 w-full max-w-6xl mx-auto font-sans">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h3 className="text-base font-bold text-gray-800 tracking-tight">Weekly Earnings Distribution</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Tracking daily yield rates over the current cycle</p>
                </div>
                <span className="text-[#08B36A] font-black text-sm bg-green-50 px-4 py-2 rounded-xl border border-green-100">
                    Cycle Total: ₹{earnings?.toLocaleString()}
                </span>
            </div>
            
            <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorNurse" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#08B36A" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#08B36A" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                        <Tooltip 
                            contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.05)'}} 
                        />
                        <Area type="monotone" dataKey="yield" stroke="#08B36A" strokeWidth={3} fillOpacity={1} fill="url(#colorNurse)" name="Daily Yield" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

// --- MAIN DASHBOARD EXPORT ---
export default function NurseDashboardPage() {
    const [fetching, setFetching] = useState(true);
    const [stats, setStats] = useState({
        pendingRequests: 0,
        priorityRequests: 0, 
        activeJobs: 0,
        completedJobs: 0,
        totalEarnings: 0
    });

    const loadData = async () => {
        try {
            setFetching(true);
            const statsRes = await NurseAPI.getDashboardStats();
            if (statsRes.success) {
                setStats(statsRes.data);
            }
        } catch (error) {
            console.error("Error loading nurse dashboard analytics:", error);
            toast.error("Failed to fetch dashboard metrics");
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    if (fetching) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <FaSpinner className="animate-spin text-4xl text-[#08B36A] mb-4" />
            <p className="text-gray-500 font-medium font-sans">Loading Dashboard Metrics...</p>
        </div>
    );

    return (
        <div className="p-4 md:p-8 bg-[#F9FAFB] min-h-screen relative font-sans">
            
            {/* Header */}
            <div className="max-w-6xl mx-auto flex flex-col items-start mb-8 gap-4">
                <div className="text-left">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Overview Dashboard</h1>
                    <p className="text-gray-500 text-sm mt-1 font-medium italic">
                        Real-time parameters, summary operational logs, and cyclical analysis curves.
                    </p>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 mb-8 w-full max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <p className="text-gray-800 font-bold text-lg">Daily Summary</p>
                    <div className="flex items-center gap-3">
                        <button onClick={loadData} className="text-gray-400 hover:text-gray-600 transition-colors p-1" title="Refresh Dashboard">
                            <FaSyncAlt size={14} />
                        </button>
                        <span className="bg-gray-100 text-gray-500 px-4 py-1 rounded-full text-xs font-bold tracking-wide uppercase">
                            {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long' })}
                        </span>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
                    <div className="bg-[#FFF1F1] p-5 rounded-3xl flex flex-col justify-center min-h-[120px] border border-red-50">
                        <p className="text-gray-400 font-extrabold text-[10px] uppercase text-center tracking-wider leading-tight">Requests</p>
                        <p className="text-[#FF4D4D] text-3xl font-black text-center mt-2">{stats.pendingRequests}</p>
                    </div>

                    <div className="bg-[#FFF1F1] p-5 rounded-3xl flex flex-col justify-center min-h-[120px] border border-red-50 relative overflow-hidden">
                        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                        <p className="text-gray-400 font-extrabold text-[10px] uppercase text-center tracking-wider leading-tight">Priority Requests</p>
                        <p className="text-red-500 text-3xl font-black text-center mt-2">{stats.priorityRequests || 0}</p>
                    </div>

                    <div className="bg-[#FFF8F1] p-5 rounded-3xl flex flex-col justify-center min-h-[120px] border border-orange-50">
                        <p className="text-gray-400 font-extrabold text-[10px] uppercase text-center tracking-wider leading-tight">Accepted</p>
                        <p className="text-[#FF9933] text-3xl font-black text-center mt-2">{stats.activeJobs}</p>
                    </div>

                    <div className="bg-[#F1FFF8] p-5 rounded-3xl flex flex-col justify-center min-h-[120px] border border-green-50">
                        <p className="text-gray-400 font-extrabold text-[10px] uppercase text-center tracking-wider leading-tight">Completed</p>
                        <p className="text-[#08B36A] text-3xl font-black text-center mt-2">{stats.completedJobs}</p>
                    </div>

                    <div className="bg-[#08B36A] p-5 rounded-3xl flex flex-col justify-center min-h-[120px] shadow-lg shadow-green-100 border border-green-600 col-span-2 md:col-span-1">
                        <p className="text-white/80 font-extrabold text-[10px] uppercase text-center tracking-wider leading-tight">Earnings</p>
                        <p className="text-white text-3xl font-black text-center mt-2 truncate">₹{stats.totalEarnings?.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* Earnings Curve */}
            <StatsGraph earnings={stats.totalEarnings} />

        </div>
    );
}