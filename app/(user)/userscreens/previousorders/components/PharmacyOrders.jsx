"use client";
import React, { useState, useEffect, useCallback } from 'react';
import UserAPI from '../../../../services/UserAPI'; // Adjust path as needed
import {
    FiX, FiStar, FiTruck, FiArrowLeft, FiPackage,
    FiAlertCircle, FiShield, FiRefreshCw, FiClock,
    FiExternalLink, FiSearch, FiChevronLeft, FiChevronRight,
    FiUser, FiMapPin, FiCreditCard, FiLayers
} from 'react-icons/fi';
import { MdOutlineLocalPharmacy, MdVerified, MdOutlineScience } from 'react-icons/md';

// --- SUB-COMPONENT: STATUS TRACKER ---
const StatusStepper = ({ status }) => {
    // Mapping API "status" to index
    const statusMap = {
        "Placed": 0,
        "Under Review": 1,
        "Shipped": 2,
        "Delivered": 3 // Hypothetical final state
    };
    const currentStep = statusMap[status] ?? 0;
    const steps = ["Order Placed", "Under Review", "Shipped", "Delivered"];

    return (
        <div className="w-full py-8">
            <div className="relative flex items-center justify-between">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-100 -z-10"></div>
                <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-indigo-600 transition-all duration-1000 z-10"
                    style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                ></div>
                {steps.map((step, index) => (
                    <div key={step} className="flex flex-col items-center gap-2">
                        <div className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${index <= currentStep ? "bg-indigo-600 border-indigo-200" : "bg-white border-slate-200"
                            }`}></div>
                        <span className={`text-[8px] font-black uppercase tracking-tighter ${index <= currentStep ? "text-slate-900" : "text-slate-400"
                            }`}>{step}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

function PharmacyOrders() {
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState([]);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalCount: 0 });
    const [modal, setModal] = useState({ isOpen: false, data: null });

    // --- DATA FETCHING ---
    const loadOrders = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const res = await UserAPI.getPharmacyOrders(page, 10);
            if (res.success) {
                setOrders(res.data);
                setPagination({
                    currentPage: res.currentPage,
                    totalPages: res.totalPages,
                    totalCount: res.count
                });
            }
        } catch (error) {
            console.error("Failed to load pharmacy orders:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadOrders();
    }, [loadOrders]);

    // --- HELPERS ---
    const getStatusStyle = (status) => {
        if (status === 'Delivered') return 'text-emerald-600 bg-emerald-50';
        if (status === 'Shipped') return 'text-indigo-600 bg-indigo-50';
        if (status === 'Cancelled') return 'text-rose-500 bg-rose-50';
        return 'text-amber-600 bg-amber-50'; // For "Placed" or "Under Review"
    };

    const getItemNames = (items) => {
        if (!items || items.length === 0) return "General Medicines";
        return items.map(i => i.name).join(", ");
    };

    return (
        <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm">
            {/* Table Header */}
            <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h3 className="font-black text-slate-900 text-xl tracking-tight">Pharmacy Ledger</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Found {pagination.totalCount} Prescription Records</p>
                </div>
                <div className="relative w-full md:w-72">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Search Order ID..." className="w-full bg-slate-50 border-none rounded-2xl py-3.5 pl-12 text-sm font-medium outline-none ring-1 ring-slate-200 focus:ring-indigo-500 transition-all" />
                </div>
            </div>

            {/* THE TABLE */}
            <div className="overflow-x-auto min-h-[400px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-4">
                        <FiRefreshCw className="animate-spin text-indigo-600" size={30} />
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing with Pharmacy...</p>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Order ID</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Items / Pharmacy</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Date</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Total Price</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {orders.map((order) => (
                                <tr key={order._id} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="px-8 py-6">
                                        <span className="text-xs font-black text-slate-900 tracking-wider">#{order.orderId}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-black">
                                                {order.pharmacyId?.name.charAt(0)}
                                            </div>
                                            <div className="max-w-[200px]">
                                                <p className="text-sm font-black text-slate-800 truncate leading-none mb-1.5 group-hover:text-indigo-600 transition-colors">
                                                    {getItemNames(order.items)}
                                                </p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{order.pharmacyId?.name}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-xs font-bold text-slate-600">
                                        {new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-slate-900">₹{order.billSummary?.totalAmount}</span>
                                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">{order.paymentMethod}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusStyle(order.status)}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${order.status === 'Shipped' ? 'bg-indigo-500 animate-pulse' : 'bg-amber-500'}`} />
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button
                                            onClick={() => setModal({ isOpen: true, data: order })}
                                            className="bg-white border border-slate-200 text-slate-600 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm"
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination Controls */}
            <div className="p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    Page {pagination.currentPage} of {pagination.totalPages}
                </p>
                <div className="flex gap-2">
                    <button
                        disabled={pagination.currentPage === 1}
                        onClick={() => loadOrders(pagination.currentPage - 1)}
                        className="p-2 rounded-lg border border-slate-200 bg-white disabled:opacity-30 hover:bg-slate-50 transition-colors"
                    >
                        <FiChevronLeft />
                    </button>
                    <button
                        disabled={pagination.currentPage >= pagination.totalPages}
                        onClick={() => loadOrders(pagination.currentPage + 1)}
                        className="p-2 rounded-lg border border-slate-200 bg-white disabled:opacity-30 hover:bg-slate-50 transition-colors"
                    >
                        <FiChevronRight />
                    </button>
                </div>
            </div>

            {/* --- CLINICAL MODAL SYSTEM --- */}
            {modal.isOpen && modal.data && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-2xl rounded-[48px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

                        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                            <h3 className="font-black text-xs uppercase tracking-widest text-slate-900 flex items-center gap-3">
                                <span className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-100"><MdOutlineLocalPharmacy size={18} /></span>
                                Order #{modal.data.orderId}
                            </h3>
                            <button onClick={() => setModal({ isOpen: false, data: null })} className="w-10 h-10 flex items-center justify-center bg-white border border-slate-100 hover:bg-slate-50 rounded-full transition-all text-slate-400"><FiX /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-10 no-scrollbar">
                            {/* Tracking View */}
                            <div className="mb-10">
                                <div className="bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden mb-8">
                                    <div className="absolute top-0 right-0 p-6 opacity-10"><FiTruck size={100} /></div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-2">Order Tracking</p>
                                    <h2 className="text-3xl font-black mb-4">{modal.data.status}</h2>
                                    <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-400">
                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg"><FiClock className="text-indigo-400"/> {modal.data.appointmentTime}</div>
                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg"><FiPackage className="text-indigo-400"/> {modal.data.collectionType}</div>
                                    </div>
                                </div>
                                <StatusStepper status={modal.data.status} />
                            </div>

                            {/* Products List */}
                            <div className="space-y-4 mb-10">
                                <h4 className="font-black text-[10px] uppercase tracking-widest text-slate-400 flex items-center gap-2"><FiLayers className="text-indigo-500" /> Prescribed Items</h4>
                                <div className="grid grid-cols-1 gap-2">
                                    {modal.data.items.map((item, i) => (
                                        <div key={i} className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                            <div>
                                                <p className="text-xs font-black text-slate-800 leading-none mb-1">{item.name}</p>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase">{item.duration} • Qty: {item.quantity}</p>
                                            </div>
                                            <p className="text-xs font-black text-slate-900">₹{item.price}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Info Grid (Address & Patient) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                    <p className="text-[9px] font-black uppercase text-slate-400 mb-3 tracking-widest">Delivery Address</p>
                                    <div className="flex gap-3">
                                        <FiMapPin className="text-indigo-500 shrink-0" />
                                        <div className="text-[11px] font-bold text-slate-600 leading-relaxed">
                                            <p className="text-slate-900 font-black">{modal.data.address?.name}</p>
                                            <p>{modal.data.address?.houseNo}, {modal.data.address?.sector}</p>
                                            <p>{modal.data.address?.city}, {modal.data.address?.pincode}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                    <p className="text-[9px] font-black uppercase text-slate-400 mb-3 tracking-widest">Patient Details</p>
                                    {modal.data.patients && modal.data.patients.length > 0 ? (
                                        modal.data.patients.map((p, idx) => (
                                            <div key={idx} className="flex gap-3">
                                                <FiUser className="text-emerald-500 shrink-0" />
                                                <div className="text-[11px] font-bold text-slate-600 leading-relaxed">
                                                    <p className="text-slate-900 font-black">{p.name}</p>
                                                    <p>{p.gender} • {p.age} Years • {p.relation}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-[11px] font-bold text-slate-400 italic">No specific patient assigned</p>
                                    )}
                                </div>
                            </div>

                            {/* Financial Breakdown */}
                            <div className="bg-slate-900 rounded-[32px] p-8 text-white">
                                <div className="flex items-center gap-2 mb-6">
                                    <FiCreditCard className="text-indigo-400" />
                                    <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Payment Breakdown</h5>
                                </div>
                                <div className="space-y-3 text-xs font-bold border-b border-slate-800 pb-6 mb-6">
                                    <div className="flex justify-between text-slate-500">
                                        <span>Items Subtotal</span>
                                        <span>₹{modal.data.billSummary?.itemTotal}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-500">
                                        <span>Delivery Fee</span>
                                        <span>₹{modal.data.billSummary?.deliveryCharge}</span>
                                    </div>
                                    {modal.data.billSummary?.slotCharge > 0 && (
                                        <div className="flex justify-between text-slate-500">
                                            <span>Slot Charge</span>
                                            <span>₹{modal.data.billSummary?.slotCharge}</span>
                                        </div>
                                    )}
                                    {modal.data.billSummary?.couponDiscount > 0 && (
                                        <div className="flex justify-between text-rose-400">
                                            <span>Coupon Discount</span>
                                            <span>- ₹{modal.data.billSummary?.couponDiscount}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">Total Amount Paid</p>
                                        <p className="text-3xl font-black">₹{modal.data.billSummary?.totalAmount}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Method</p>
                                        <p className="text-xs font-black text-emerald-400 uppercase">{modal.data.paymentMethod}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
            `}</style>
        </div>
    );
}

export default PharmacyOrders;