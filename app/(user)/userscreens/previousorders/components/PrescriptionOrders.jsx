"use client";
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom'; // Required for screen centering
import UserAPI from '../../../../services/UserAPI';
import {
    FiCheckCircle, FiXCircle,
    FiCalendar, FiCreditCard,
    FiFileText, FiCornerDownRight, FiHash, FiClock
} from 'react-icons/fi';
import { MdOutlineLocalPharmacy } from 'react-icons/md';

export default function PrescriptionOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ current: 1, total: 1 });
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [mounted, setMounted] = useState(false);

    // 1. Handle Mounting for Portals in Next.js
    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    // 2. Prevent body scroll when modal is open
    useEffect(() => {
        if (selectedOrder) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [selectedOrder]);

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

    // --- MODAL COMPONENT ---
    const ModalPortal = ({ order, onClose }) => {
        if (!mounted) return null;

        return createPortal(
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6">
                {/* Backdrop - Covers entire browser window */}
                <div 
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity duration-300"
                    onClick={onClose}
                />

                {/* Modal Card - Perfectly Centered */}
                <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-[0_30px_70px_-10px_rgba(0,0,0,0.4)] overflow-hidden animate-in zoom-in-95 fade-in duration-300 flex flex-col max-h-[85vh]">
                    
                    {/* Header */}
                    <div className="p-6 md:p-8 pb-4 flex justify-between items-start shrink-0">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Request Details</p>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900">#{order.requestId}</h3>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors group">
                            <FiXCircle size={26} className="text-slate-300 group-hover:text-slate-600" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="px-6 md:px-8 py-2 overflow-y-auto custom-scrollbar flex-1">
                        <div className="space-y-3">
                            {order.requestedMedicines.map((med, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
                                    <div className="flex gap-3">
                                        <FiCornerDownRight className="mt-1 text-emerald-500" size={16} />
                                        <div>
                                            <p className="text-sm font-bold text-slate-800 uppercase">{med.name}</p>
                                            <p className="text-[10px] font-medium text-slate-500">Qty: {med.dosage} • {med.durationDays} Days</p>
                                        </div>
                                    </div>
                                    {order.status === 'Bill Generated' && <p className="text-sm font-bold text-slate-900">₹{med.mrp}</p>}
                                </div>
                            ))}
                        </div>

                        {/* Payment/Status Section */}
                        <div className="mt-6 mb-4">
                            {order.status === 'Bill Generated' ? (
                                <div className="p-6 bg-slate-900 rounded-[2rem] text-white">
                                    <div className="flex justify-between items-center mb-4 opacity-60 text-[10px] font-bold uppercase tracking-widest">
                                        <span>Total Amount</span>
                                        <span>Verified Invoice</span>
                                    </div>
                                    <div className="text-3xl font-light">₹{order.verifiedBill.totalAmount}</div>
                                    <div className="mt-4 pt-4 border-t border-white/10 flex justify-between text-[11px] opacity-70">
                                        <span className="flex items-center gap-1.5"><FiCheckCircle size={14}/> Includes GST</span>
                                        <span>{new Date().toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-5 bg-blue-50 border border-blue-100 rounded-[2rem] flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-500 shadow-sm shrink-0">
                                        <FiClock size={22} className="animate-pulse" />
                                    </div>
                                    <p className="text-xs font-bold text-blue-900 uppercase leading-relaxed">The pharmacy is currently reviewing stock and generating your bill.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 md:p-8 bg-slate-50 border-t border-slate-100 flex gap-3 shrink-0">
                        {order.status === 'Bill Generated' && (
                            <button className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl text-[11px] font-bold uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20">
                                <FiCreditCard size={14} /> Checkout
                            </button>
                        )}
                        <button onClick={onClose} className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl text-[11px] font-bold uppercase tracking-widest hover:bg-slate-50">
                            Close
                        </button>
                    </div>
                </div>
            </div>,
            document.body // This sends the modal to the very top of the HTML
        );
    };

    if (loading && orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-10 h-10 border-2 border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Loading History</p>
            </div>
        );
    }

    return (
        <div className="animate-fadeIn">
            <div className="flex items-center justify-between mb-8 px-2">
                <div>
                    <h2 className="text-xl font-semibold text-slate-800">Prescription History</h2>
                    <p className="text-sm text-slate-400">View and track your medicine requests</p>
                </div>
            </div>

            <div className="space-y-4">
                {orders.map((order) => (
                    <div key={order._id} className="bg-white border border-slate-100 rounded-3xl p-6 transition-all hover:border-emerald-200 hover:shadow-xl hover:shadow-slate-200/40 group">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                            <div className="flex-1 space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${getStatusStyle(order.status)}`}>
                                        {order.status}
                                    </div>
                                    <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                                        <FiHash size={12} /> {order.requestId}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-emerald-600 transition-colors">
                                        <MdOutlineLocalPharmacy size={22} />
                                    </div>
                                    <div>
                                        <h4 className="text-base font-semibold text-slate-800">{order.pharmacyId?.name || "Local Pharmacy"}</h4>
                                        <p className="text-xs text-slate-500">Ordered {new Date(order.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between lg:justify-end gap-6 border-t lg:border-t-0 pt-4 lg:pt-0">
                                <div className="lg:text-right lg:px-6">
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

            {/* --- Render Modal using Portal --- */}
            {selectedOrder && (
                <ModalPortal 
                    order={selectedOrder} 
                    onClose={() => setSelectedOrder(null)} 
                />
            )}

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
            `}</style>
        </div>
    );
}