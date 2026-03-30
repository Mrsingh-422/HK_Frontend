'use client'

import React from 'react'
import {
    FaWallet, FaSearch, FaFilter,
    FaEye, FaFileInvoiceDollar, FaMicroscope,
    FaPrescriptionBottle, FaUserNurse, FaUserMd,
    FaHospital, FaAmbulance, FaCalendarDay
} from "react-icons/fa"

export default function AdminEarningPage() {
    const mainStats = [
        { label: "Total Earning", value: "₹1,98,908.30", icon: <FaWallet />, trend: "+12.5%" },
        { label: "Monthly Earning", value: "₹6,322.00", icon: <FaCalendarDay />, trend: "+3.2%" },
        { label: "Weekly Earning", value: "₹2,040.00", icon: <FaCalendarDay />, trend: "-1.5%" },
        { label: "Daily Earning", value: "₹0.00", icon: <FaCalendarDay />, trend: "0%" },
    ];

    const categoryStats = [
        { label: "Pharmacy", value: "₹1,830.34", icon: <FaPrescriptionBottle />, color: "text-emerald-500" },
        { label: "Laboratory", value: "₹76,705.96", icon: <FaMicroscope />, color: "text-blue-500" },
        { label: "Nurse", value: "₹26,469.00", icon: <FaUserNurse />, color: "text-teal-500" },
        { label: "Doctor", value: "₹9,471.00", icon: <FaUserMd />, color: "text-orange-500" },
        { label: "Hospital", value: "₹1,10,880.00", icon: <FaHospital />, color: "text-cyan-500" },
        { label: "Ambulance", value: "₹0.00", icon: <FaAmbulance />, color: "text-rose-500" },
    ];

    const tableData = [
        { sr: 1, vendor: "HkLab", type: "Lab", orderId: "145020260306103749", admin: "39.20", vendorEarn: "352.80", total: "392.00", date: "2026-03-06" },
        { sr: 2, vendor: "PharmacyHk", type: "Pharmacy", orderId: "889120260306055919", admin: "12.06", vendorEarn: "108.54", total: "120.60", date: "2026-03-06" },
        { sr: 3, vendor: "PharmacyHk", type: "Pharmacy", orderId: "451720260305123441", admin: "12.06", vendorEarn: "108.54", total: "120.60", date: "2026-03-05" },
        { sr: 4, vendor: "Nitish", type: "Pharmacy", orderId: "321420250822070202", admin: "24.72", vendorEarn: "222.48", total: "247.20", date: "2025-08-22" },
    ];

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 font-sans text-slate-900">

            {/* --- TOP HEADER --- */}
            <div className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">
                        Earnings <span className="text-[#08B36A]">Analytics</span>
                    </h1>
                    <p className="text-slate-500 text-sm font-medium uppercase tracking-widest mt-1">Financial Intelligence Dashboard</p>
                </div>
            </div>

            {/* --- PRIMARY SUMMARY CARDS --- */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {mainStats.map((s, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-[#08B36A]/10 flex items-center justify-center text-[#08B36A]">
                                {s.icon}
                            </div>
                            <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${s.trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                                {s.trend}
                            </span>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{s.label}</p>
                        <p className="text-2xl font-black text-slate-800">{s.value}</p>
                    </div>
                ))}
            </div>

            {/* --- CATEGORY BREAKDOWN --- */}
            <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
                {categoryStats.map((s, i) => (
                    <div key={i} className="bg-white border border-slate-100 p-4 rounded-3xl flex flex-col items-center text-center hover:border-[#08B36A]/30 transition-all group">
                        <div className={`text-xl mb-3 p-3 rounded-2xl bg-slate-50 group-hover:bg-[#08B36A] group-hover:text-white transition-all ${s.color}`}>
                            {s.icon}
                        </div>
                        <p className="text-[9px] font-black uppercase tracking-tighter text-slate-400 mb-1">{s.label}</p>
                        <p className="text-xs font-bold text-slate-700">{s.value}</p>
                    </div>
                ))}
            </div>

            {/* --- MAIN TRANSACTION TABLE --- */}
            <div className="max-w-7xl mx-auto bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">

                {/* Table Header / Filters */}
                <div className="p-8 border-b border-slate-100 flex flex-wrap items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white">
                            <FaFileInvoiceDollar />
                        </div>
                        <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Earning <span className="text-[#08B36A]">Logs</span></h2>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                            <input
                                type="text"
                                placeholder="Search Transaction..."
                                className="pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium w-64 focus:outline-none focus:ring-2 focus:ring-[#08B36A]/20 transition-all"
                            />
                        </div>
                        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3">
                            <FaFilter className="text-slate-400 text-xs" />
                            <select className="bg-transparent text-xs font-bold text-slate-600 outline-none uppercase tracking-widest">
                                <option>Sort By Type</option>
                                <option>Pharmacy</option>
                                <option>Laboratory</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Actual Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">S.No</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Vendor & Type</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Transaction ID</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Admin Share</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Vendor Share</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Gross Total</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Timestamp</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {tableData.map((row, idx) => (
                                <tr key={idx} className="group hover:bg-[#08B36A]/[0.02] transition-colors">
                                    <td className="px-8 py-5 text-xs font-bold text-slate-400">
                                        {row.sr.toString().padStart(2, '0')}
                                    </td>
                                    <td className="px-8 py-5">
                                        <p className="text-sm font-bold text-slate-800">{row.vendor}</p>
                                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${row.type === 'Lab' ? 'bg-purple-100 text-purple-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                            {row.type}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-xs font-mono text-slate-400">#{row.orderId}</td>
                                    <td className="px-8 py-5 text-right">
                                        <span className="text-sm font-black text-[#08B36A]">₹{row.admin}</span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <span className="text-sm font-bold text-slate-600">₹{row.vendorEarn}</span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <span className="text-sm font-bold text-slate-900 bg-slate-50 px-3 py-1 rounded-lg">₹{row.total}</span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <p className="text-xs font-medium text-slate-500 whitespace-nowrap">{row.date}</p>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        <button className="p-2 text-slate-400 hover:text-[#08B36A] hover:bg-[#08B36A]/10 rounded-xl transition-all">
                                            <FaEye size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Placeholder */}
                <div className="p-6 bg-slate-50/50 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <span>Showing 4 of 120 Transactions</span>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-all">Previous</button>
                        <button className="px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all shadow-md">Next Page</button>
                    </div>
                </div>
            </div>
        </div>
    )
}