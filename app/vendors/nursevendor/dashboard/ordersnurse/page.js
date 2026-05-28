'use client'
import React, { useState, useEffect } from 'react'
import NurseAPI from '@/app/services/NurseAPI'; // Adjust this path to your API file
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
    FaExclamationTriangle,
    FaChevronRight,
    FaBoxOpen,
    FaSpinner
} from 'react-icons/fa'

export default function OrderHistoryTable() {
    const [activeTab, setActiveTab] = useState('Approved');
    const [isLoading, setIsLoading] = useState(true);
    
    // --- MODAL STATE ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    // --- API DATA STATES ---
    const [approvedOrders, setApprovedOrders] = useState([]);
    const [rejectedOrders, setRejectedOrders] = useState([]);

    const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';

    // --- FETCH DATA FROM API ---
    const loadOrderHistory = async () => {
        setIsLoading(true);
        try {
            // Fetch Confirmed (Approved) Orders
            const approvedRes = await NurseAPI.getBookings('Confirmed');
            if (approvedRes?.success) {
                setApprovedOrders(approvedRes.data || []);
            }

            // Fetch Rejected Orders
            const rejectedRes = await NurseAPI.getBookings('Rejected');
            if (rejectedRes?.success) {
                setRejectedOrders(rejectedRes.data || []);
            }
        } catch (error) {
            console.error("Error loading order history:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadOrderHistory();
    }, []);

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

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    return (
        <div className="bg-[#F8FAFC] min-h-screen p-4 md:p-8 font-sans">
            
            {/* --- TOP SECTION --- */}
            <div className="max-w-7xl mx-auto flex flex-col items-start mb-10 gap-6">
                
                <div className="text-left">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Order History</h1>
                    <p className="text-gray-500 text-sm mt-1 font-medium italic">
                        System log of all {activeTab.toLowerCase()} nursing requests and patient interactions.
                    </p>
                </div>

                {/* PILL NAVIGATION */}
                <div className="bg-white p-1.5 rounded-[22px] shadow-xl shadow-gray-200/50 border border-gray-100 flex gap-2">
                    <button
                        onClick={() => setActiveTab('Approved')}
                        className={`px-8 py-3 rounded-2xl text-sm font-black transition-all duration-300 flex items-center gap-2.5 ${
                            activeTab === 'Approved' 
                                ? 'bg-[#08B36A] text-white shadow-lg shadow-green-200 scale-105' 
                                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        <FaCheckCircle size={16} /> Approved ({approvedOrders.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('Rejected')}
                        className={`px-8 py-3 rounded-2xl text-sm font-black transition-all duration-300 flex items-center gap-2.5 ${
                            activeTab === 'Rejected' 
                                ? 'bg-red-500 text-white shadow-lg shadow-red-200 scale-105' 
                                : 'text-gray-400 hover:text-red-500 hover:bg-red-50/30'
                        }`}
                    >
                        <FaTimesCircle size={16} /> Rejected ({rejectedOrders.length})
                    </button>
                </div>
            </div>

            {/* --- TABLE CONTAINER --- */}
            <div className="max-w-7xl mx-auto bg-white rounded-[40px] border border-gray-200 shadow-2xl shadow-gray-200/40 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[2px]">Patient & Order ID</th>
                                <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[2px]">Location</th>
                                {activeTab === 'Approved' ? (
                                    <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[2px]">Contact Detail</th>
                                ) : (
                                    <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[2px]">Rejection Reason</th>
                                )}
                                <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[2px] text-center">Status</th>
                                <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[2px] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="5" className="py-24 text-center">
                                        <FaSpinner className="animate-spin text-[#08B36A] mx-auto mb-4" size={30} />
                                        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Loading History...</p>
                                    </td>
                                </tr>
                            ) : currentData.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-24 text-center">
                                        <div clazssName="opacity-30 flex flex-col items-center">
                                            <FaBoxOpen size={48} className="mb-4 text-gray-300" />
                                            <p className="text-gray-500 font-bold italic text-lg">No orders found in this category</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                currentData.map((order) => (
                                    <tr 
                                        key={order._id} 
                                        onClick={() => handleRowClick(order)} 
                                        className="hover:bg-gray-50/80 transition-all cursor-pointer group"
                                    >
                                        <td className="px-8 py-6">
                                            <div className="font-black text-gray-900 text-base group-hover:text-[#08B36A] transition-colors">
                                                {order.patients?.[0]?.name || order.address?.name || 'N/A'}
                                            </div>
                                            <div className="flex items-center gap-2 mt-1.5">
                                                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${activeTab === 'Approved' ? 'bg-green-50 text-[#08B36A]' : 'bg-red-50 text-red-400'}`}>
                                                    ID: {order.bookingId || order._id?.slice(-8)}
                                                </span>
                                                <span className="text-[11px] text-gray-400 font-bold uppercase">{formatDate(order.schedule?.startDate)}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-start gap-2.5 max-w-[280px]">
                                                <div className="mt-1 p-1.5 bg-gray-100 rounded-lg text-gray-400"><FaMapMarkerAlt size={12} /></div>
                                                <span className="text-sm text-gray-600 font-medium leading-relaxed line-clamp-2">
                                                    {order.address?.houseNo}, {order.address?.city}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            {activeTab === 'Approved' ? (
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 flex items-center justify-center bg-blue-50 text-blue-600 rounded-full"><FaPhoneAlt size={10} /></div>
                                                    <span className="text-sm font-black text-gray-700">{order.address?.phone || 'N/A'}</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-sm text-red-500 font-black italic bg-red-50/50 px-4 py-2 rounded-xl border border-red-100 w-fit">
                                                    <FaExclamationTriangle size={12} /> {order.rejectionReason || 'Staff Unavailable'}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex justify-center">
                                                <span className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest border transition-all ${
                                                    activeTab === 'Approved' 
                                                        ? 'bg-green-50 text-[#08B36A] border-green-200' 
                                                        : 'bg-red-50 text-red-500 border-red-200'
                                                }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${activeTab === 'Approved' ? 'bg-[#08B36A]' : 'bg-red-500'}`}></span>
                                                    {activeTab.toUpperCase()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center justify-end gap-3" onClick={(e) => e.stopPropagation()}>
                                                <button 
                                                    onClick={() => handleRowClick(order)}
                                                    className="w-10 h-10 flex items-center justify-center text-blue-600 bg-white border border-gray-100 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-90"
                                                >
                                                    <FaInfoCircle size={18} />
                                                </button>
                                                <button 
                                                    className="w-10 h-10 flex items-center justify-center text-red-400 bg-white border border-gray-100 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-90"
                                                >
                                                    <FaTrashAlt size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- MODAL (ENHANCED DESIGN) --- */}
            {isModalOpen && selectedOrder && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center p-6 bg-black/40 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-2xl rounded-[48px] shadow-2xl overflow-hidden relative border border-white/20 animate-in zoom-in-95 duration-300">
                        
                        <div className={`${activeTab === 'Approved' ? 'bg-[#08B36A]' : 'bg-red-500'} p-10 text-white relative`}>
                            <button onClick={closeModal} className="absolute top-8 right-8 w-12 h-12 flex items-center justify-center bg-white/20 hover:bg-white/40 rounded-full transition-all backdrop-blur-md">
                                <FaTimesCircle size={24} />
                            </button>
                            <div className="flex items-center gap-5">
                                <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center border border-white/30 backdrop-blur-sm">
                                    <FaIdCard size={32} />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black tracking-tight">Order Details</h2>
                                    <p className="text-white/80 text-[11px] font-black uppercase tracking-[3px] mt-1 opacity-75">Ref: {selectedOrder.bookingId}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-10 space-y-10 max-h-[60vh] overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                {/* Left Section */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 text-gray-900 font-black uppercase text-[11px] tracking-widest pb-3 border-b border-gray-100">
                                        <FaUserAlt className={activeTab === 'Approved' ? 'text-[#08B36A]' : 'text-red-500'} /> Patient Profile
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-gray-400 uppercase mb-1">Full Name</span>
                                            <span className="text-lg font-black text-gray-800">{selectedOrder.patients?.[0]?.name || selectedOrder.address?.name}</span>
                                        </div>
                                        {activeTab === 'Approved' && (
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-gray-400 uppercase mb-1">Contact Number</span>
                                                <span className="text-lg font-black text-blue-600">{selectedOrder.address?.phone}</span>
                                            </div>
                                        )}
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-gray-400 uppercase mb-1">Request Logged On</span>
                                            <span className="text-base font-bold text-gray-700">{formatDate(selectedOrder.schedule?.startDate)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Section */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 text-gray-900 font-black uppercase text-[11px] tracking-widest pb-3 border-b border-gray-100">
                                        <FaCalendarAlt className={activeTab === 'Approved' ? 'text-[#08B36A]' : 'text-red-500'} /> Service Info
                                    </div>
                                    <div className="space-y-4">
                                        <div className="bg-gray-50 p-5 rounded-3xl border border-gray-100">
                                            <span className="text-[10px] font-black text-gray-400 uppercase mb-1 block">Service Requested</span>
                                            <span className="text-base font-black text-gray-800">{selectedOrder.serviceDetails?.title}</span>
                                        </div>
                                        <div className="bg-gray-50 p-5 rounded-3xl border border-gray-100">
                                            <span className="text-[10px] font-black text-gray-400 uppercase mb-1 block">Final Status</span>
                                            <span className={`text-base font-black uppercase tracking-widest ${activeTab === 'Approved' ? 'text-[#08B36A]' : 'text-red-500'}`}>
                                                {selectedOrder.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Destination Section */}
                                <div className="md:col-span-2 bg-[#F8FAFC] p-6 rounded-[32px] border border-gray-100">
                                    <div className="flex items-center gap-2 text-gray-900 font-black text-[11px] uppercase mb-3 tracking-widest">
                                        <FaMapMarkerAlt className="text-red-500" /> Destination Address
                                    </div>
                                    <p className="text-sm text-gray-600 font-bold leading-relaxed">
                                        {selectedOrder.address?.houseNo}, {selectedOrder.address?.city}, {selectedOrder.address?.addressType}
                                    </p>
                                </div>

                                {/* Prescription Section */}
                                {selectedOrder.prescriptionImage && (
                                    <div className="md:col-span-2 space-y-3">
                                        <div className="flex items-center gap-2 text-gray-900 font-black text-[11px] uppercase mb-3 tracking-widest">
                                            <FaImage className="text-blue-500" /> Medical Attachment
                                        </div>
                                        <div className="w-full h-48 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 overflow-hidden">
                                            <img src={`${IMAGE_BASE_URL}/${selectedOrder.prescriptionImage}`} className="w-full h-full object-contain" alt="Medical Prescription" />
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'Rejected' && (
                                    <div className="md:col-span-2 bg-red-50 p-6 rounded-[32px] border border-red-100">
                                        <div className="flex items-center gap-2 text-red-700 font-black text-[11px] uppercase mb-2 tracking-widest">
                                            <FaExclamationTriangle /> Decline Reason
                                        </div>
                                        <p className="text-sm text-red-600 font-black italic">"{selectedOrder.rejectionReason || 'Staff Unavailable'}"</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-8 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-end gap-4">
                            {selectedOrder.address?.phone && (
                                <a href={`tel:${selectedOrder.address.phone}`} className="flex items-center justify-center gap-2 px-10 py-4 rounded-[22px] bg-blue-600 text-white font-black text-xs shadow-xl shadow-blue-100 hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all uppercase tracking-widest">
                                    <FaPhoneAlt size={12} /> Contact Patient
                                </a>
                            )}
                            <button 
                                onClick={closeModal} 
                                className={`px-10 py-4 rounded-[22px] text-white font-black text-xs shadow-xl transition-all hover:scale-105 active:scale-95 uppercase tracking-widest ${
                                    activeTab === 'Approved' ? 'bg-[#08B36A] shadow-green-100 hover:bg-[#069a5a]' : 'bg-red-500 shadow-red-100 hover:bg-red-600'
                                }`}
                            >
                                Dismiss Details
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}