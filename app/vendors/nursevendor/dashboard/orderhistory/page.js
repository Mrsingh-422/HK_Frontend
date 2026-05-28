'use client'
import React, { useState, useEffect } from 'react'
import { 
    FaUser, FaPhone, FaMapMarkerAlt, FaCalendarAlt, 
    FaClock, FaEye, FaTimesCircle, FaHashtag, FaHistory, FaSyncAlt, FaStethoscope, FaWallet
} from 'react-icons/fa'
import NurseAPI from '@/app/services/NurseAPI';

export default function OrderHistoryPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderData, setOrderData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrderHistory();
    }, []);

    const fetchOrderHistory = async () => {
        try {
            setLoading(true);
            const res = await NurseAPI.getOrderHistory();
            if (res.success) {
                setOrderData(res.data);
            }
        } catch (error) {
            console.error("Failed to fetch history:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
            <FaSyncAlt className="animate-spin text-[#08B36A] text-4xl mb-4"/>
            <p className="text-gray-500 font-bold uppercase tracking-tighter">Loading History...</p>
        </div>
    );

    return (
        <div className=" bg-[#F9FAFB] min-h-screen font-sans">
            
            {/* --- HEADER --- */}
            <div className="mb-6">
                <h1 className="text-2xl font-black text-[#1e5a91] flex items-center gap-2">
                    <FaHistory className="text-[#08B36A]" /> Order History
                </h1>
                <p className="text-sm text-gray-500 font-bold mt-1">
                    Total Records: <span className="text-[#08B36A]">{orderData.length}</span>
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
                                <th className="px-6 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                                <th className="px-6 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {orderData.map((order) => (
                                <tr 
                                    key={order._id} 
                                    onClick={() => handleViewDetails(order)}
                                    className="hover:bg-gray-50/50 transition-colors group cursor-pointer"
                                >
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col gap-1">
                                            <div className="font-black text-gray-800 text-sm flex items-center gap-1.5">
                                                <FaHashtag size={10} className="text-[#08B36A]"/> {order.bookingId}
                                            </div>
                                            <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400">
                                                <span className="flex items-center gap-1 text-red-400">
                                                    <FaCalendarAlt size={10}/> {new Date(order.createdAt).toLocaleDateString()}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <FaClock size={10}/> {order.schedule?.startTime || 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center shrink-0">
                                                <FaUser size={14} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-700 text-sm">
                                                    {order.patients?.[0]?.name || order.userId?.name}
                                                </div>
                                                <div className="text-[10px] font-bold text-gray-400">{order.serviceDetails?.title}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${order.status === 'Completed' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-right" onClick={(e) => e.stopPropagation()}>
                                        <button 
                                            onClick={() => handleViewDetails(order)}
                                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#08B36A] hover:bg-[#069a5a] text-white text-[11px] font-black uppercase tracking-tighter shadow-md shadow-green-100 transition-all active:scale-95"
                                        >
                                            <FaEye size={12} /> View
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
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-[#1e5a91]/20 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in duration-300 border border-white">
                        
                        <div className={`p-6 text-white flex justify-between items-center ${selectedOrder.status === 'Completed' ? 'bg-[#08B36A]' : 'bg-red-500'}`}>
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-white/20 rounded-2xl">
                                    <FaHistory size={20} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black leading-none uppercase tracking-tight">{selectedOrder.status} ORDER</h2>
                                    <p className="text-[10px] text-white/80 mt-1 font-bold">Booking ID: {selectedOrder.bookingId}</p>
                                </div>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-white hover:rotate-90 transition-transform duration-200">
                                <FaTimesCircle size={28} />
                            </button>
                        </div>

                        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                            {/* Service Header */}
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-blue-50 border border-blue-100">
                                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-500 shrink-0">
                                    <FaStethoscope size={20} />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Requested Service</label>
                                    <div className="text-sm font-black text-[#1e5a91]">{selectedOrder.serviceDetails?.title}</div>
                                </div>
                            </div>

                            {/* Patient & Contact Info */}
                            <div className="grid grid-cols-1 gap-4">
                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#08B36A]">
                                        <FaUser size={16} />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Patient Name</label>
                                        <div className="text-sm font-black text-gray-700">{selectedOrder.patients?.[0]?.name}</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-500">
                                        <FaPhone size={16} />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Mobile Number</label>
                                        <div className="text-sm font-black text-gray-700">{selectedOrder.address?.phone || selectedOrder.userId?.phone}</div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-red-400 shrink-0">
                                        <FaMapMarkerAlt size={16} />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Location</label>
                                        <div className="text-[12px] font-bold text-gray-600 leading-relaxed mt-0.5">
                                            {selectedOrder.address?.houseNo}, {selectedOrder.address?.city}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Price Summary */}
                            <div className="p-5 rounded-[2rem] bg-gray-900 text-white flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-white/10 rounded-xl"><FaWallet className="text-[#08B36A]"/></div>
                                    <span className="text-xs font-black uppercase tracking-widest">Total Earnings</span>
                                </div>
                                <div className="text-2xl font-black tracking-tighter text-[#08B36A]">
                                    ₹{selectedOrder.priceBreakdown?.totalPrice || selectedOrder.totalPrice}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-50 bg-gray-50 flex justify-end">
                            <button onClick={() => setIsModalOpen(false)} className="px-10 py-3 rounded-2xl bg-gray-200 text-gray-600 font-black text-xs hover:bg-gray-300 transition-all uppercase tracking-widest">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}