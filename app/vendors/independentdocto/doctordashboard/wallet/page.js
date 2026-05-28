'use client'
import React, { useState } from 'react'
import { 
    FaWallet, FaMoneyBillWave, FaArrowUp, FaArrowDown, 
    FaHistory, FaDownload, FaChartLine, FaUniversity, FaCheckCircle, FaClock
} from "react-icons/fa";
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer 
} from 'recharts';

export default function WalletAndEarningsPage() {
    // ==========================================
    // 🌟 1. MOCK DATA
    // ==========================================
    
    // Monthly Earnings Chart Data
    const earningsData =[
        { month: 'Oct', earnings: 12000 },
        { month: 'Nov', earnings: 18500 },
        { month: 'Dec', earnings: 15000 },
        { month: 'Jan', earnings: 25000 },
        { month: 'Feb', earnings: 22000 },
        { month: 'Mar', earnings: 32500 }, // Current month rising
    ];

    // Transaction History
    const [transactions, setTransactions] = useState([
        { id: '#TRX-9081', date: '16 Mar 2026, 02:30 PM', description: 'Consultation: Rahul Sharma', type: 'Credit', amount: 500, status: 'Completed' },
        { id: '#TRX-9080', date: '15 Mar 2026, 10:00 AM', description: 'Withdrawal to Bank Account', type: 'Debit', amount: 15000, status: 'Completed' },
        { id: '#TRX-9079', date: '15 Mar 2026, 01:15 PM', description: 'Consultation: Amit Kumar', type: 'Credit', amount: 800, status: 'Completed' },
        { id: '#TRX-9078', date: '14 Mar 2026, 09:30 AM', description: 'Consultation: Priya Singh', type: 'Credit', amount: 600, status: 'Pending' },
        { id: '#TRX-9077', date: '12 Mar 2026, 04:45 PM', description: 'Consultation: Vikas Verma', type: 'Credit', amount: 500, status: 'Completed' },
        { id: '#TRX-9076', date: '01 Mar 2026, 11:00 AM', description: 'Withdrawal to Bank Account', type: 'Debit', amount: 20000, status: 'Completed' },
    ]);

    // Derived Stats
    const stats = {
        availableBalance: 32500,
        totalEarnings: 125000,
        pendingClearance: 600,
        totalWithdrawn: 91900,
    };

    // Handler for Withdraw Request
    const handleWithdraw = () => {
        if (window.confirm(`Are you sure you want to withdraw ₹${stats.availableBalance.toLocaleString('en-IN')} to your linked bank account?`)) {
            alert("Withdrawal request submitted successfully! It will be credited within 2-3 business days.");
        }
    };

    return (
        <div className="pb-10 relative max-w-7xl mx-auto">
            
            {/* --- PAGE HEADER --- */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Wallet & Earnings</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage your funds, track earnings, and withdraw to your bank.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors shadow-sm text-sm">
                    <FaDownload /> Download Statement
                </button>
            </div>

            {/* ========================================== */}
            {/* 🌟 STATS CARDS & WALLET HIGHLIGHT 🌟 */}
            {/* ========================================== */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                
                {/* 1. Main Wallet Balance Card (Highlighted) */}
                <div className="lg:col-span-2 bg-gradient-to-br from-[#08B36A] to-[#069c5c] rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-green-200 relative overflow-hidden flex flex-col justify-between">
                    {/* Background Pattern */}
                    <FaWallet className="absolute -right-6 -bottom-6 text-[140px] opacity-10 rotate-[-15deg]" />
                    
                    <div className="relative z-10 flex justify-between items-start mb-6">
                        <div>
                            <p className="text-green-50 font-bold uppercase tracking-wider text-xs mb-1">Available Balance</p>
                            <h2 className="text-4xl sm:text-5xl font-black tracking-tight">
                                ₹{stats.availableBalance.toLocaleString('en-IN')}
                            </h2>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl">
                            <FaUniversity className="text-2xl text-white" />
                        </div>
                    </div>
                    
                    <div className="relative z-10 flex gap-3">
                        <button 
                            onClick={handleWithdraw}
                            className="bg-white text-[#08B36A] px-6 py-3 rounded-xl font-bold text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all w-fit"
                        >
                            Withdraw Funds
                        </button>
                    </div>
                </div>

                {/* 2. Total Earnings Card */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-center hover:-translate-y-1 transition-transform">
                    <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center text-xl mb-4">
                        <FaChartLine />
                    </div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Total Earnings</p>
                    <p className="text-2xl font-black text-gray-800">₹{stats.totalEarnings.toLocaleString('en-IN')}</p>
                    <p className="text-[11px] font-bold text-green-500 mt-2 flex items-center gap-1">
                        <FaArrowUp /> +15.2% from last month
                    </p>
                </div>

                {/* 3. Total Withdrawn Card */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-center hover:-translate-y-1 transition-transform">
                    <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center text-xl mb-4">
                        <FaMoneyBillWave />
                    </div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Total Withdrawn</p>
                    <p className="text-2xl font-black text-gray-800">₹{stats.totalWithdrawn.toLocaleString('en-IN')}</p>
                    <p className="text-[11px] font-bold text-orange-500 mt-2 flex items-center gap-1">
                        <FaClock /> ₹{stats.pendingClearance} Pending Clearance
                    </p>
                </div>

            </div>

            {/* ========================================== */}
            {/* 📈 EARNINGS GRAPH & RECENT TRANSACTIONS 📈 */}
            {/* ========================================== */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                
                {/* Left: Earnings Chart */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <FaChartLine className="text-[#08B36A]" /> Earnings Overview
                            </h2>
                            <p className="text-xs text-gray-500 mt-1">Your income growth over the last 6 months</p>
                        </div>
                        <select className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-[#08B36A] focus:border-[#08B36A] block p-2 font-semibold outline-none cursor-pointer">
                            <option>Last 6 Months</option>
                            <option>This Year</option>
                        </select>
                    </div>

                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={earningsData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#08B36A" stopOpacity={0.4}/>
                                        <stop offset="95%" stopColor="#08B36A" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280', fontWeight: 'bold' }} dy={10} />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fontSize: 12, fill: '#6b7280', fontWeight: 'bold' }} 
                                    tickFormatter={(value) => `₹${value / 1000}k`}
                                />
                                <RechartsTooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                                    cursor={{ stroke: '#08B36A', strokeWidth: 1, strokeDasharray: '3 3' }}
                                    formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Earnings']}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="earnings" 
                                    stroke="#08B36A" 
                                    strokeWidth={4}
                                    fillOpacity={1} 
                                    fill="url(#colorEarnings)" 
                                    activeDot={{ r: 7, fill: '#08B36A', stroke: '#fff', strokeWidth: 3 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Right: Quick Transaction History (Mini) */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col h-full">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <FaHistory className="text-blue-500" /> Recent Activity
                        </h2>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-gray-200">
                        {transactions.slice(0, 5).map((trx, index) => (
                            <div key={index} className="flex justify-between items-center p-3 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${
                                        trx.type === 'Credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                    }`}>
                                        {trx.type === 'Credit' ? <FaArrowDown /> : <FaArrowUp />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-800 truncate max-w-[140px]" title={trx.description}>{trx.description}</p>
                                        <p className="text-[10px] text-gray-500 font-bold mt-0.5">{trx.date.split(',')[0]}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`text-sm font-black ${trx.type === 'Credit' ? 'text-[#08B36A]' : 'text-gray-800'}`}>
                                        {trx.type === 'Credit' ? '+' : '-'}₹{trx.amount}
                                    </p>
                                    <p className={`text-[10px] font-bold uppercase mt-0.5 ${trx.status === 'Completed' ? 'text-gray-400' : 'text-orange-500'}`}>
                                        {trx.status}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <button className="w-full mt-4 py-3 bg-gray-50 text-gray-600 hover:text-[#08B36A] font-bold rounded-xl text-sm transition-colors border border-gray-100 hover:border-green-100">
                        View All Transactions
                    </button>
                </div>
            </div>

            {/* ========================================== */}
            {/* 📋 DETAILED TRANSACTION TABLE 📋 */}
            {/* ========================================== */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="text-lg font-bold text-gray-800">All Transactions</h2>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead className="bg-white border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Transaction ID & Date</th>
                                <th className="px-6 py-4 font-semibold">Description</th>
                                <th className="px-6 py-4 font-semibold">Type</th>
                                <th className="px-6 py-4 font-semibold">Amount</th>
                                <th className="px-6 py-4 font-semibold text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {transactions.map((trx, index) => (
                                <tr key={index} className="hover:bg-gray-50/80 transition-colors duration-200">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="font-bold text-sm text-gray-800 block">{trx.id}</span>
                                        <span className="text-xs text-gray-500 font-medium">{trx.date}</span>
                                    </td>
                                    
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm font-bold text-gray-700">{trx.description}</span>
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold ${
                                            trx.type === 'Credit' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                        }`}>
                                            {trx.type === 'Credit' ? <FaArrowDown /> : <FaArrowUp />} {trx.type}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`text-base font-black ${trx.type === 'Credit' ? 'text-[#08B36A]' : 'text-gray-800'}`}>
                                            {trx.type === 'Credit' ? '+' : '-'}₹{trx.amount.toLocaleString('en-IN')}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold tracking-wide ${
                                            trx.status === 'Completed' ? 'text-[#08B36A]' : 'text-orange-500'
                                        }`}>
                                            {trx.status === 'Completed' ? <FaCheckCircle /> : <FaClock />}
                                            {trx.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    )
}