'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
    FaUser, FaCalendarAlt, FaPhoneAlt, FaStethoscope, FaBed, FaHeartbeat, 
    FaTimes, FaSpinner, FaSyncAlt, FaExclamationTriangle, FaHospital,
    FaChartArea, FaChartPie, FaCheckCircle, FaClock, FaClipboardList
} from "react-icons/fa";
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import HospitalDoctorAPI from '@/app/services/HospitalDoctorAPI';

export default function DoctorDashboardPage() {
    // ==========================================
    // 🌟 STATE MANAGEMENT
    // ==========================================
    const [activeTab, setActiveTab] = useState('Hospital-Pending'); 
    
    // Live Dashboard API states
    const [dashboardData, setDashboardData] = useState(null);
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tableLoading, setTableLoading] = useState(false);
    const [error, setError] = useState(null);

    // Selected Case Detail Modal State
    const [selectedCaseId, setSelectedCaseId] = useState(null);
    const [caseDetails, setCaseDetails] = useState(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    // ==========================================
    // 🌟 HELPER FOR SAFE STRINGS
    // ==========================================
    const getErrorMessage = (err) => {
        if (!err) return "An unexpected error occurred";
        if (typeof err === 'string') return err;
        if (err instanceof Error) return err.message;
        if (typeof err === 'object') {
            return err.message || err.error || JSON.stringify(err);
        }
        return err.toString();
    };

    // ==========================================
    // 🌟 DATA FETCHING
    // ==========================================
    const fetchDashboardOverview = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await HospitalDoctorAPI.getDashboard();
            if (data.success) {
                setDashboardData(data);
            }
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const fetchCasesList = async () => {
        try {
            setTableLoading(true);
            // Fetch cases dynamically using the active status tab parameter
            const response = await HospitalDoctorAPI.getCases("Emergency", activeTab);
            if (response.success) {
                setCases(response.data || []);
            }
        } catch (err) {
            console.warn("Table cases fetch failed:", err);
        } finally {
            setTableLoading(false);
        }
    };

    // Run once on mount
    useEffect(() => {
        fetchDashboardOverview();
    }, []);

    // Re-fetch table cases when the active tab status changes
    useEffect(() => {
        fetchCasesList();
    }, [activeTab]);

    // ==========================================
    // 🌟 GRAPH DATA CALCULATIONS (DYNAMIC)
    // ==========================================
    
    // 1. PieChart: Dynamically parsed from dashboardData.grid
    const pieData = dashboardData?.grid ? [
        { name: 'Emergency', value: dashboardData.grid.emergencyCount || 0, color: '#ef4444' }, // Red
        { name: 'Admission', value: dashboardData.grid.admissionCount || 0, color: '#8b5cf6' }, // Purple
        { name: 'Transfer', value: dashboardData.grid.transferCount || 0, color: '#6366f1' },   // Indigo
    ] : [];

    const totalPieCount = pieData.reduce((acc, curr) => acc + curr.value, 0);

    // 2. AreaChart: Dynamically grouped by weekday from cases list
    const getWeeklyData = (casesList) => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dayCounts = { 'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0, 'Sun': 0 };
        
        casesList.forEach(c => {
            const dateSource = c.createdAt || c.startDate;
            if (dateSource) {
                const date = new Date(dateSource);
                const dayName = days[date.getDay()];
                if (dayCounts[dayName] !== undefined) {
                    dayCounts[dayName]++;
                }
            }
        });
        
        return Object.keys(dayCounts).map(name => ({
            name,
            cases: dayCounts[name]
        }));
    };

    const chartWeeklyData = getWeeklyData(cases);

    // ==========================================
    // 🌟 HANDLERS
    // ==========================================
    const handleRowClick = async (caseId) => {
        try {
            setSelectedCaseId(caseId);
            setCaseDetails(null);
            setIsDetailsOpen(true);
            const response = await HospitalDoctorAPI.getCaseDetails(caseId);
            if (response.success) {
                setCaseDetails(response.data);
            }
        } catch (err) {
            alert(getErrorMessage(err));
        }
    };

    return (
        <div className="pb-10 relative">
            
            {/* --- PAGE HEADER --- */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-gray-800">
                            Welcome, {loading ? "Doctor..." : (dashboardData?.welcomeName || "Dr. John Doe")} !
                        </h1>
                        {!loading && dashboardData?.dutyStatus && (
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                                dashboardData.dutyStatus.toLowerCase() === 'on duty' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                                <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
                                {dashboardData.dutyStatus}
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Manage your patient appointments and check your daily insights.</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => {
                            fetchDashboardOverview();
                            fetchCasesList();
                        }} 
                        disabled={loading || tableLoading}
                        className="p-2.5 bg-white hover:bg-gray-50 text-gray-600 rounded-xl border border-gray-200 transition-colors shadow-sm flex items-center gap-2 text-sm font-semibold"
                    >
                        <FaSyncAlt className={(loading || tableLoading) ? "animate-spin" : ""} />
                        Refresh Data
                    </button>
                </div>
            </div>

            {/* ERROR ALERT */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl text-red-700 text-sm flex items-center gap-3">
                    <FaExclamationTriangle className="flex-shrink-0 text-lg" />
                    <div>
                        <span className="font-bold">Error loading live system state:</span> {error.toString()}
                    </div>
                </div>
            )}

            {/* ========================================== */}
            {/* 🌟 STATS CARDS GRID 🌟 */}
            {/* ========================================== */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 md:gap-5 mb-8">
                {/* Total Cases */}
                <div className="bg-white rounded-2xl p-5 flex flex-col items-center justify-center shadow-sm border border-gray-100 hover:-translate-y-1 transition-transform relative overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-1 bg-blue-500"></div>
                    <div className="text-2xl font-black text-blue-600 mb-1">
                        {loading ? <FaSpinner className="animate-spin text-sm" /> : (dashboardData?.stats?.totalCases ?? 0)}
                    </div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase text-center tracking-wider">Total<br/>Cases</p>
                </div>

                {/* Active Cases */}
                <div className="bg-white rounded-2xl p-5 flex flex-col items-center justify-center shadow-sm border border-gray-100 hover:-translate-y-1 transition-transform relative overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-1 bg-emerald-500"></div>
                    <div className="text-2xl font-black text-emerald-600 mb-1">
                        {loading ? <FaSpinner className="animate-spin text-sm" /> : (dashboardData?.stats?.active ?? 0)}
                    </div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase text-center tracking-wider">Active<br/>Cases</p>
                </div>

                {/* Requests Pending */}
                <div className="bg-white rounded-2xl p-5 flex flex-col items-center justify-center shadow-sm border border-gray-100 hover:-translate-y-1 transition-transform relative overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-1 bg-yellow-500"></div>
                    <div className="text-2xl font-black text-yellow-600 mb-1">
                        {loading ? <FaSpinner className="animate-spin text-sm" /> : (dashboardData?.stats?.requests ?? 0)}
                    </div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase text-center tracking-wider">Requests<br/>Pending</p>
                </div>

                {/* Emergency Count */}
                <div className="bg-white rounded-2xl p-5 flex flex-col items-center justify-center shadow-sm border border-gray-100 hover:-translate-y-1 transition-transform relative overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-1 bg-red-500"></div>
                    <div className="text-2xl font-black text-red-600 mb-1">
                        {loading ? <FaSpinner className="animate-spin text-sm" /> : (dashboardData?.grid?.emergencyCount ?? 0)}
                    </div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase text-center tracking-wider">Emergency<br/>Count</p>
                </div>

                {/* Admission Count */}
                <div className="bg-white rounded-2xl p-5 flex flex-col items-center justify-center shadow-sm border border-gray-100 hover:-translate-y-1 transition-transform relative overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-1 bg-purple-500"></div>
                    <div className="text-2xl font-black text-purple-600 mb-1">
                        {loading ? <FaSpinner className="animate-spin text-sm" /> : (dashboardData?.grid?.admissionCount ?? 0)}
                    </div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase text-center tracking-wider">Admission<br/>Count</p>
                </div>

                {/* Transfer Count */}
                <div className="bg-white rounded-2xl p-5 flex flex-col items-center justify-center shadow-sm border border-gray-100 hover:-translate-y-1 transition-transform relative overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-1 bg-indigo-500"></div>
                    <div className="text-2xl font-black text-indigo-600 mb-1">
                        {loading ? <FaSpinner className="animate-spin text-sm" /> : (dashboardData?.grid?.transferCount ?? 0)}
                    </div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase text-center tracking-wider">Transfer<br/>Count</p>
                </div>
            </div>

            {/* ========================================== */}
            {/* 📈 DYNAMIC CHARTS SECTION 📈 */}
            {/* ========================================== */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <FaChartArea className="text-[#08B36A]" /> Case Distribution Overview
                            </h2>
                            <p className="text-xs text-gray-500 mt-1">Weekly chart calculated from current active status queue</p>
                        </div>
                    </div>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartWeeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorConsult" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#08B36A" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#08B36A" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                                <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} cursor={{ stroke: '#08B36A', strokeWidth: 1, strokeDasharray: '3 3' }} />
                                <Area type="monotone" dataKey="cases" stroke="#08B36A" strokeWidth={3} fillOpacity={1} fill="url(#colorConsult)" activeDot={{ r: 6, fill: '#08B36A', stroke: '#fff', strokeWidth: 2 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <FaChartPie className="text-blue-500" /> Active Roster Grid
                        </h2>
                        <p className="text-xs text-gray-500 mt-1">Real-time allocation distribution metrics</p>
                    </div>
                    <div className="h-64 w-full flex-1 mt-4 relative">
                        {totalPieCount === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                <FaClipboardList className="text-3xl mb-1.5" />
                                <span className="text-xs">No active allocation records</span>
                            </div>
                        ) : (
                            <>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '13px', fontWeight: 'bold' }} itemStyle={{ color: '#374151' }} />
                                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" stroke="none">
                                            {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                        </Pie>
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" formatter={(value) => <span className="text-xs font-semibold text-gray-600">{value}</span>} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                                    <span className="text-2xl font-black text-gray-800">{totalPieCount}</span>
                                    <span className="text-[10px] text-gray-400 font-bold uppercase">Total Cases</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>


        </div>
    )
}