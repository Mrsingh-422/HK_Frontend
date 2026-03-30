'use client'

import React from 'react'
import { FaTimes, FaHistory, FaEye, FaUserInjured, FaHashtag, FaCheckCircle } from "react-icons/fa"

const DriverHistoryModal = ({ isOpen, onClose, driver, onViewOrder }) => {
    if (!isOpen || !driver) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />

            <div className="relative bg-white w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300 max-h-[90vh]">
                
                {/* HEADER */}
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#08B36A]/10 flex items-center justify-center text-[#08B36A]">
                            <FaHistory size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">
                                Task <span className="text-[#08B36A]">History</span>
                            </h2>
                            <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest mt-0.5">
                                Logs for: <span className="text-slate-600 font-black">{driver.driverName}</span>
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-400 rounded-2xl transition-all">
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* TABLE CONTENT */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="border border-slate-100 rounded-[2rem] overflow-hidden bg-white shadow-sm">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">S No.</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Order ID</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Vendor</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Patient Name</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {driver.history?.map((order, index) => (
                                    <tr key={index} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-5 text-xs font-bold text-slate-400">
                                            {(index + 1).toString().padStart(2, '0')}
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <FaHashtag className="text-[#08B36A]/40" size={12} />
                                                <span className="text-sm font-mono font-bold text-slate-700">{order.orderId || order.parcelId}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-sm font-semibold text-slate-600">
                                            {driver.vendorName}
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                                                    <FaUserInjured size={12} />
                                                </div>
                                                <span className="text-sm font-bold text-slate-700">{order.patientName || "Sarah Ahmed"}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#08B36A]/10 text-[#08B36A] text-[10px] font-black uppercase tracking-wider">
                                                <FaCheckCircle size={10} /> {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <button 
                                                onClick={() => onViewOrder(order)}
                                                className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-[#08B36A] hover:border-[#08B36A]/30 hover:shadow-md rounded-xl transition-all"
                                            >
                                                <FaEye size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                    <button onClick={onClose} className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest">Close Logs</button>
                </div>
            </div>
        </div>
    )
}

export default DriverHistoryModal