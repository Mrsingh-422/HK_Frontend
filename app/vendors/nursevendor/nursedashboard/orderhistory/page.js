'use client'
import React, { useState } from 'react'
import { 
    FaUser, FaPhone, FaMapMarkerAlt, FaCalendarAlt, 
    FaClock, FaEye, FaTimesCircle, FaHashtag, FaHistory 
} from 'react-icons/fa'

export default function OrderHistoryPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    // --- MOCK DATA ---
    const orderData = [
        {
            id: "736420250128021603",
            date: "2025-01-28",
            time: "02:38:27",
            patientName: "Yash User",
            mobile: "9999999999",
            address: "Chandigarh, Sahibzada Ajit Singh Nagar, Ropar Division, Punjab",
            status: "Completed"
        },
        {
            id: "654220250123115139",
            date: "2025-01-23",
            time: "12:19:51",
            patientName: "Yash User",
            mobile: "9999999999",
            address: "Chandigarh, Sahibzada Ajit Singh Nagar, Ropar Division, Punjab",
            status: "Completed"
        },
        {
            id: "467520241212054727",
            date: "2025-01-23",
            time: "10:54:14",
            patientName: "Deepankar",
            mobile: "6487318154",
            address: "8B, Ropar Division, Sahibzada Ajit Singh Nagar, Punjab, India, 160071",
            status: "Processing"
        }
    ];

    // --- HANDLERS ---
    const handleViewDetails = (order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    return (
        <div className=" bg-[#F9FAFB] min-h-screen font-sans">
            
            {/* --- HEADER --- */}
            <div className="mb-6">
                <h1 className="text-2xl font-black text-[#1e5a91] flex items-center gap-2">
                    <FaHistory className="text-[#08B36A]" /> Order History
                </h1>
                <p className="text-sm text-gray-500 font-bold mt-1">
                    Total Orders: <span className="text-[#08B36A]">{orderData.length}</span>
                </p>
            </div>

            {/* --- TABLE --- */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.03)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/80 border-b border-gray-100">
                                <th className="px-6 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Order Info</th>
                                <th className="px-6 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Patient</th>
                                <th className="px-6 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Contact & Location</th>
                                <th className="px-6 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {orderData.map((order) => (
                                <tr 
                                    key={order.id} 
                                    onClick={() => handleViewDetails(order)} // Added Click handler to row
                                    className="hover:bg-gray-50/50 transition-colors group cursor-pointer" // Added cursor pointer
                                >
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col gap-1">
                                            <div className="font-black text-gray-800 text-sm flex items-center gap-1.5">
                                                <FaHashtag size={10} className="text-[#08B36A]"/> {order.id}
                                            </div>
                                            <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400">
                                                <span className="flex items-center gap-1 text-red-400"><FaCalendarAlt size={10}/> {order.date}</span>
                                                <span className="flex items-center gap-1"><FaClock size={10}/> {order.time}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center shrink-0">
                                                <FaUser size={14} />
                                            </div>
                                            <div className="font-bold text-gray-700 text-sm">{order.patientName}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col gap-1 max-w-xs">
                                            <div className="text-xs font-bold text-gray-600 flex items-center gap-1.5">
                                                <FaPhone size={10} className="text-gray-300"/> {order.mobile}
                                            </div>
                                            <div className="text-[11px] text-gray-400 flex items-start gap-1.5 line-clamp-1">
                                                <FaMapMarkerAlt size={10} className="text-[#08B36A] mt-0.5 shrink-0"/> {order.address}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right" onClick={(e) => e.stopPropagation()}>
                                        <button 
                                            onClick={() => handleViewDetails(order)}
                                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#08B36A] hover:bg-[#069a5a] text-white text-[11px] font-black uppercase tracking-tighter shadow-md shadow-green-100 transition-all active:scale-95"
                                        >
                                            <FaEye size={12} /> View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- VIEW DETAILS MODAL --- */}
            {isModalOpen && selectedOrder && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-[#1e5a91]/20 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in duration-300 border border-white">
                        
                        {/* Modal Header */}
                        <div className="p-6 bg-gradient-to-r from-[#08B36A] to-[#32B97D] text-white flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-white/20 rounded-2xl">
                                    <FaHistory size={20} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black leading-none uppercase tracking-tight">Order Details</h2>
                                    <p className="text-[10px] text-green-50 mt-1 font-bold">ID: {selectedOrder.id}</p>
                                </div>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-white hover:rotate-90 transition-transform duration-200">
                                <FaTimesCircle size={28} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8 space-y-8">
                            {/* Date & Time Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Date</label>
                                    <div className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                        <FaCalendarAlt className="text-red-400" /> {selectedOrder.date}
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Time</label>
                                    <div className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                        <FaClock className="text-blue-400" /> {selectedOrder.time}
                                    </div>
                                </div>
                            </div>

                            {/* Patient Info */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#F9FAFB] border border-gray-100">
                                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#08B36A]">
                                        <FaUser size={20} />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Patient Name</label>
                                        <div className="text-lg font-black text-[#1e5a91]">{selectedOrder.patientName}</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#F9FAFB] border border-gray-100">
                                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-500">
                                        <FaPhone size={18} />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Mobile Number</label>
                                        <div className="text-lg font-black text-gray-700 tracking-wider">{selectedOrder.mobile}</div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#F9FAFB] border border-gray-100">
                                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-red-400 shrink-0">
                                        <FaMapMarkerAlt size={20} />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Full Address</label>
                                        <div className="text-sm font-bold text-gray-600 leading-relaxed mt-1">{selectedOrder.address}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-gray-50 bg-gray-50 flex justify-end">
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="px-10 py-3 rounded-2xl bg-gray-200 text-gray-600 font-black text-xs hover:bg-gray-300 transition-all uppercase tracking-widest"
                            >
                                Close Info
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}