"use client";
import React, { useState, useEffect } from 'react';
import UserAPI from '../../../../services/UserAPI'; // Adjust path
import {
    FiCheckCircle, FiXCircle, FiUser,
    FiCalendar, FiCreditCard, FiLoader,
    FiFileText, FiCornerDownRight, FiHash, FiClock
} from 'react-icons/fi';
import { MdOutlineLocalPharmacy } from 'react-icons/md';

export default function PrescriptionOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ current: 1, total: 1 });
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        fetchOrders(1);
    }, []);

    const fetchOrders = async (page) => {
        setLoading(true);
        try {
            const response = await UserAPI.getAllPrescriptionRequests(page, 10);
            if (response.success) {
                setOrders(response.data);
                setPagination({
                    current: response.currentPage,
                    total: response.totalPages
                });
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Pending Review': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'Reviewing': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'Bill Generated': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'Rejected': return 'bg-rose-50 text-rose-600 border-rose-100';
            default: return 'bg-slate-50 text-slate-500 border-slate-100';
        }
    };

    if (loading && orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
                <div className="w-10 h-10 border-2 border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Loading Records</p>
            </div>
        );
    }

    return (
        <div className="animate-fadeIn">
            {/* Header within Tab */}
            <div className="flex items-center justify-between mb-8 px-2">
                <div>
                    <h2 className="text-xl font-semibold text-slate-800">Prescription History</h2>
                    <p className="text-sm text-slate-400">View and track your medicine requests</p>
                </div>
            </div>

            {orders.length === 0 ? (
                <div className="bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-200 p-20 text-center">
                    <FiFileText className="mx-auto text-slate-300 mb-4" size={40} />
                    <h3 className="text-lg font-medium text-slate-800">No requests found</h3>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div
                            key={order._id}
                            className="bg-white border border-slate-100 rounded-3xl p-6 transition-all duration-300 hover:border-emerald-200 hover:shadow-xl hover:shadow-slate-200/40 group"
                        >
                            <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                                <div className="flex-1 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${getStatusStyle(order.status)}`}>
                                            {order.status}
                                        </div>
                                        <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                                            <FiHash size={10} /> {order.requestId}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-emerald-600 transition-colors">
                                            <MdOutlineLocalPharmacy size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-800">{order.pharmacyId?.name}</h4>
                                            <p className="text-xs text-slate-500">Ordered {new Date(order.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="text-right hidden sm:block px-6">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amount</p>
                                        <p className="text-lg font-semibold text-slate-900">
                                            {order.status === 'Bill Generated' ? `₹${order.verifiedBill?.totalAmount}` : '---'}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setSelectedOrder(order)}
                                        className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-[11px] font-bold uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-slate-900/10"
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* --- SCREEN-CENTERED PREMIUM MODAL --- */}
            {selectedOrder && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    {/* Backdrop with Heavy Blur */}
                    <div
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity duration-300"
                        onClick={() => setSelectedOrder(null)}
                    />

                    {/* Modal Card - Absolutely Centered */}
                    <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden transition-all duration-500 animate-in zoom-in-95 fade-in">
                        {/* Header */}
                        <div className="p-8 pb-4 flex justify-between items-start">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Order Breakdown</p>
                                </div>
                                <h3 className="text-2xl font-semibold text-slate-900">#{selectedOrder.requestId}</h3>
                            </div>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="p-2 hover:bg-slate-100 rounded-full transition-colors group"
                            >
                                <FiXCircle size={24} className="text-slate-300 group-hover:text-slate-600" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="px-8 py-4">
                            <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                                {selectedOrder.requestedMedicines.map((med, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
                                        <div className="flex gap-3">
                                            <FiCornerDownRight className="mt-1 text-emerald-500 shrink-0" />
                                            <div>
                                                <p className="text-sm font-semibold text-slate-800 uppercase tracking-tight">{med.name}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">
                                                    Qty: {med.dosage} • {med.durationDays} Days
                                                </p>
                                            </div>
                                        </div>
                                        {selectedOrder.status === 'Bill Generated' && (
                                            <p className="text-sm font-bold text-slate-900">₹{med.mrp}</p>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Payment Summary Box */}
                            {selectedOrder.status === 'Bill Generated' ? (
                                <div className="mt-6 p-6 bg-slate-900 rounded-[2rem] text-white shadow-xl shadow-slate-900/20">
                                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest opacity-60 mb-2">
                                        <span>Total Payable</span>
                                        <span>Summary</span>
                                    </div>
                                    <div className="flex justify-between items-baseline">
                                        <span className="text-3xl font-light tracking-tight">₹{selectedOrder.verifiedBill.totalAmount}</span>
                                        <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
                                            <FiCheckCircle /> Verified
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-white/10 flex justify-between text-[11px] font-medium opacity-70">
                                        <span>Incl. Delivery & Taxes</span>
                                        <span className="flex items-center gap-1"><FiCalendar size={12} /> {new Date().toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-6 p-6 bg-blue-50 border border-blue-100 rounded-[2rem] flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-500 shadow-sm">
                                        <FiClock />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-blue-900 uppercase tracking-tight">Awaiting Invoice</p>
                                        <p className="text-[11px] text-blue-700/70">The pharmacy is currently verifying stock.</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer Actions */}
                        <div className="p-8 pt-4 flex gap-3">
                            {selectedOrder.status === 'Bill Generated' && (
                                <button className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl text-[11px] font-bold uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20">
                                    <FiCreditCard /> Checkout
                                </button>
                            )}
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl text-[11px] font-bold uppercase tracking-widest hover:bg-slate-200 transition-all"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #E2E8F0;
                    border-radius: 10px;
                }
            `}</style>
        </div>
    );
}