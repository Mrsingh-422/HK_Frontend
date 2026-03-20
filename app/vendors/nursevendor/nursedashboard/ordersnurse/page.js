'use client'
import React, { useState } from 'react'
import { 
    FaCheckCircle, 
    FaTimesCircle, 
    FaPhoneAlt, 
    FaMapMarkerAlt, 
    FaInfoCircle,
    FaTrashAlt,
    FaUserAlt,
    FaCalendarAlt,
    FaIdCard,
    FaExclamationTriangle
} from 'react-icons/fa'

export default function OrderHistoryTable() {
    const [activeTab, setActiveTab] = useState('Approved');
    
    // --- MODAL STATE ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    // --- MOCK DATA ---
    const approvedOrders = [
        { id: '661220250128023454', name: 'Yash User', address: 'Chandigarh, Sahibzada Ajit Singh Nagar, Punjab', phone: '9999999999', date: '28 Jan 2025', status: 'Approved', type: 'General Nursing' },
        { id: '112820250217111059', name: 'Yash User', address: 'Chandigarh, Sahibzada Ajit Singh Nagar, Punjab', phone: '9999999999', date: '17 Feb 2025', status: 'Approved', type: 'Critical Care' },
        { id: '300120250217110833', name: 'Aarush', address: '8B, Ropar Division, Punjab, 160071', phone: '9999999999', date: '17 Feb 2025', status: 'Approved', type: 'Dressing Service' },
        { id: '965220260305123730', name: 'Aarush', address: 'Airport Road, Punjab, 140301', phone: '9999999999', date: '05 Mar 2026', status: 'Approved', type: 'Injection Service' },
    ];

    const rejectedOrders = [
        { id: '241120250303050506', name: 'Yash User', address: 'Chandigarh, Punjab', reason: 'Nurse Unavailable', date: '03 Mar 2025', status: 'Rejected', type: 'General Nursing' },
        { id: '482620241004125540', name: 'brother', address: 'Flat no 3, Ropar, Punjab', reason: 'Invalid Address', date: '04 Oct 2024', status: 'Rejected', type: 'Package Nursing' },
        { id: '761420241205111822', name: 'hshshbz', address: 'Sahibzada Ajit Singh Nagar, Punjab', reason: 'Price Issue', date: '05 Dec 2024', status: 'Rejected', type: 'Daily Nursing' },
    ];

    const currentData = activeTab === 'Approved' ? approvedOrders : rejectedOrders;

    // --- MODAL HANDLERS ---
    const handleRowClick = (order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedOrder(null);
    };

    return (
        <div className="bg-[#F9FAFB] min-h-screen relative font-sans">
            
            {/* --- TOP SECTION (HEADER & BUTTONS BELOW IT) --- */}
            <div className="flex flex-col items-start mb-8 gap-5 ml-2">
                
                {/* 1. HEADER AREA */}
                <div className="text-left">
                    <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Order History</h1>
                    <p className="text-gray-400 text-sm mt-1 font-medium">Review your previously {activeTab.toLowerCase()} nursing requests.</p>
                </div>

                {/* 2. PILL BUTTONS (Design from your image) */}
                <div className="flex items-center bg-white border border-gray-100 p-1.5 rounded-2xl shadow-sm">
                    <button
                        onClick={() => setActiveTab('Approved')}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                            activeTab === 'Approved' 
                                ? 'bg-[#08B36A] text-white shadow-md shadow-green-100' 
                                : 'text-gray-500 hover:text-[#08B36A]'
                        }`}
                    >
                        <FaCheckCircle size={15} /> Approved ({approvedOrders.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('Rejected')}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                            activeTab === 'Rejected' 
                                ? 'bg-red-500 text-white shadow-md shadow-red-100' 
                                : 'text-gray-500 hover:text-red-500'
                        }`}
                    >
                        <FaTimesCircle size={15} /> Rejected ({rejectedOrders.length})
                    </button>
                </div>
            </div>

            {/* --- TABLE CARD --- */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/80">
                                <th className="px-6 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Order Details</th>
                                <th className="px-6 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Address</th>
                                {activeTab === 'Approved' ? (
                                    <th className="px-6 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Contact Info</th>
                                ) : (
                                    <th className="px-6 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Reason</th>
                                )}
                                <th className="px-6 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
                                <th className="px-6 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {currentData.map((order) => (
                                <tr 
                                    key={order.id} 
                                    onClick={() => handleRowClick(order)} 
                                    className="hover:bg-gray-50 transition-colors cursor-pointer group"
                                >
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-800 group-hover:text-[#08B36A] transition-colors">{order.name}</div>
                                        <div className="text-[11px] text-[#08B36A] font-mono mt-1 font-semibold">{order.id}</div>
                                        <div className="text-[12px] text-gray-400 mt-1">{order.date}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-start gap-2 max-w-[250px]">
                                            <FaMapMarkerAlt className="text-gray-300 mt-1 shrink-0" size={14} />
                                            <span className="text-sm text-gray-600 leading-snug line-clamp-2">{order.address}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {activeTab === 'Approved' ? (
                                            <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                                                <div className="p-2 bg-green-50 text-[#08B36A] rounded-lg"><FaPhoneAlt size={12} /></div>
                                                {order.phone}
                                            </div>
                                        ) : (
                                            <div className="text-sm text-red-400 italic font-medium">{order.reason}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center">
                                            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${
                                                activeTab === 'Approved' ? 'bg-green-50 text-[#08B36A] border-green-100' : 'bg-red-50 text-red-500 border-red-100'
                                            }`}>
                                                {activeTab === 'Approved' ? <FaCheckCircle size={10}/> : <FaTimesCircle size={10}/>}
                                                {activeTab}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleRowClick(order); }}
                                                className="p-2 text-blue-500 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all shadow-sm"
                                            >
                                                <FaInfoCircle size={16} />
                                            </button>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); alert('Deleted'); }}
                                                className="p-2 text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-all shadow-sm"
                                            >
                                                <FaTrashAlt size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- MODAL (UNCHANGED) --- */}
            {isModalOpen && selectedOrder && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden relative animate-in zoom-in duration-300">
                        <div className={`${activeTab === 'Approved' ? 'bg-[#08B36A]' : 'bg-red-500'} p-6 text-white flex justify-between items-center`}>
                            <div>
                                <h2 className="text-xl font-bold">Order Details</h2>
                                <p className="text-white/80 text-xs mt-1 font-mono tracking-wider">ID: {selectedOrder.id}</p>
                            </div>
                            <button onClick={closeModal} className="text-white hover:rotate-90 transition-transform duration-200">
                                <FaTimesCircle size={28} />
                            </button>
                        </div>
                        <div className="p-8 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 border-b border-gray-100 pb-2 text-gray-800">
                                        <FaUserAlt className={activeTab === 'Approved' ? 'text-[#08B36A]' : 'text-red-500'} />
                                        <h3 className="font-bold">Patient Details</h3>
                                    </div>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between"><span className="text-gray-500">Name:</span> <span className="font-semibold text-gray-800">{selectedOrder.name}</span></div>
                                        {activeTab === 'Approved' && (
                                            <div className="flex justify-between"><span className="text-gray-500">Contact:</span> <span className="font-bold text-blue-600">{selectedOrder.phone}</span></div>
                                        )}
                                        <div className="flex justify-between"><span className="text-gray-500">Request Date:</span> <span className="font-semibold text-gray-800">{selectedOrder.date}</span></div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 border-b border-gray-100 pb-2 text-gray-800">
                                        <FaCalendarAlt className={activeTab === 'Approved' ? 'text-[#08B36A]' : 'text-red-500'} />
                                        <h3 className="font-bold">Order Summary</h3>
                                    </div>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between"><span className="text-gray-500">Service Type:</span> <span className="font-semibold">{selectedOrder.type}</span></div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Final Status:</span> 
                                            <span className={`font-bold ${activeTab === 'Approved' ? 'text-[#08B36A]' : 'text-red-500'}`}>{selectedOrder.status}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="md:col-span-2 bg-gray-50 p-4 rounded-2xl">
                                    <div className="flex items-center gap-2 text-gray-800 font-bold text-sm mb-2">
                                        <FaMapMarkerAlt className="text-red-400" /> Service Address
                                    </div>
                                    <p className="text-sm text-gray-600 leading-relaxed">{selectedOrder.address}</p>
                                </div>
                                {activeTab === 'Rejected' && (
                                    <div className="md:col-span-2 bg-red-50 p-4 rounded-2xl border border-red-100">
                                        <div className="flex items-center gap-2 text-red-700 font-bold text-sm mb-1">
                                            <FaExclamationTriangle /> Rejection Reason
                                        </div>
                                        <p className="text-sm text-red-600 italic font-medium">"{selectedOrder.reason}"</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-50 bg-gray-50/50 flex justify-end gap-3">
                            {selectedOrder.phone && (
                                <a href={`tel:${selectedOrder.phone}`} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm shadow-lg hover:bg-blue-700 transition-all active:scale-95">
                                    <FaPhoneAlt size={14} /> CALL PATIENT
                                </a>
                            )}
                            <button onClick={closeModal} className={`px-10 py-2.5 rounded-xl text-white font-bold text-sm shadow-lg transition-all active:scale-95 ${activeTab === 'Approved' ? 'bg-[#08B36A] shadow-green-100' : 'bg-red-500 shadow-red-100'}`}>
                                CLOSE DETAILS
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}