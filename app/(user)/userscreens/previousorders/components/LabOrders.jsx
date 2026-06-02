"use client";
import React, { useState, useEffect, useCallback } from 'react';
import UserAPI from '../../../../services/UserAPI'; 
import {
    FiX, FiStar, FiActivity, FiLayers, FiHome,
    FiDownload, FiSearch, FiRefreshCw, FiChevronLeft, FiChevronRight,
    FiUser, FiMapPin, FiClock, FiCreditCard
} from 'react-icons/fi';
import { MdOutlineScience, MdVerified } from 'react-icons/md';

// --- SUB-COMPONENT: STEPPER ---
const StatusStepper = ({ status }) => {
    // Mapping API status strings to visual steps
    const statusMap = { 
        "Confirmed": 0, 
        "Phlebotomist Assigned": 1, 
        "Sample Collected": 2, 
        "Report Ready": 3 
    };
    const currentStep = statusMap[status] ?? 1;
    const steps = ["Booked", "Assigned", "Collected", "Completed"];

    return (
        <div className="w-full py-8 px-2">
            <div className="relative flex items-center justify-between">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-100 -z-10"></div>
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-indigo-600 transition-all duration-700 z-10"
                    style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}></div>
                {steps.map((step, index) => (
                    <div key={step} className="flex flex-col items-center gap-2">
                        <div className={`w-3 h-3 rounded-full border-2 transition-all duration-500 ${index <= currentStep ? "bg-indigo-600 border-indigo-100 ring-4 ring-indigo-50" : "bg-white border-slate-200"}`} />
                        <span className={`text-[8px] font-black uppercase tracking-tighter ${index <= currentStep ? "text-slate-900" : "text-slate-400"}`}>{step}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

function LabOrders() {
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState([]);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalCount: 0 });
    const [modal, setModal] = useState({ isOpen: false, data: null });

    // Fetch Data
    const loadBookings = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const res = await UserAPI.getLabBookings(page, 10);
            if (res.success) {
                setOrders(res.data);
                setPagination({
                    currentPage: res.currentPage,
                    totalPages: res.totalPages,
                    totalCount: res.count
                });
            }
        } catch (error) {
            console.error("Failed to fetch bookings:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadBookings();
    }, [loadBookings]);

    // Helpers
    const getItemsCount = (items) => (items?.tests?.length || 0) + (items?.packages?.length || 0);

    const getItemsSummary = (items) => {
        const tests = items.tests?.map(t => t.name) || [];
        const packages = items.packages?.map(p => p.name) || [];
        const all = [...tests, ...packages];
        return all.length > 0 ? all.join(", ") : "Diagnostic Booking";
    };

    const getStatusStyles = (status) => {
        if (status === 'Report Ready') return 'text-emerald-600 bg-emerald-50';
        if (['Cancelled', 'Rejected'].includes(status)) return 'text-rose-500 bg-rose-50';
        return 'text-indigo-600 bg-indigo-50';
    };

    return (
        <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm">
            {/* Header */}
            <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                    <h3 className="font-black text-slate-900 text-xl tracking-tight">Lab Records</h3>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Found {pagination.totalCount} Bookings</p>
                </div>
                <div className="relative w-full md:w-80">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Search Order ID..." className="w-full bg-slate-50 border-none rounded-2xl py-3.5 pl-12 text-sm font-semibold outline-none ring-1 ring-slate-100 focus:ring-indigo-500 transition-all" />
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto min-h-[400px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-4">
                        <FiRefreshCw className="animate-spin text-indigo-600" size={30} />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Loading your health data...</p>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Order Info</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Tests/Packages</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Appointment</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Net Amount</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {orders.map((order) => (
                                <tr key={order._id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <p className="text-xs font-black text-slate-900 leading-none mb-1">#{order.bookingId}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">{order.labId?.name}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="max-w-[220px]">
                                            <p className="text-sm font-black text-slate-800 truncate leading-none mb-1">{getItemsSummary(order.items)}</p>
                                            <p className="text-[9px] font-bold text-indigo-500 uppercase flex items-center gap-1">
                                                <FiLayers /> {getItemsCount(order.items)} Items
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-xs font-bold text-slate-700">{new Date(order.appointmentDate).toLocaleDateString('en-GB')}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">{order.appointmentTime}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-sm font-black text-slate-900">₹{order.billSummary?.totalAmount}</span>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{order.paymentMethod}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${getStatusStyles(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button
                                            onClick={() => setModal({ isOpen: true, data: order })}
                                            className="px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border border-slate-200 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                                        >
                                            View Full Summary
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            <div className="p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/20">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    Page {pagination.currentPage} of {pagination.totalPages}
                </p>
                <div className="flex gap-2">
                    <button
                        disabled={pagination.currentPage === 1}
                        onClick={() => loadBookings(pagination.currentPage - 1)}
                        className="p-2 rounded-lg border border-slate-200 bg-white disabled:opacity-30 hover:bg-slate-100"
                    >
                        <FiChevronLeft />
                    </button>
                    <button
                        disabled={pagination.currentPage >= pagination.totalPages}
                        onClick={() => loadBookings(pagination.currentPage + 1)}
                        className="p-2 rounded-lg border border-slate-200 bg-white disabled:opacity-30 hover:bg-slate-100"
                    >
                        <FiChevronRight />
                    </button>
                </div>
            </div>

            {/* --- DETAILED DIALOG MODAL --- */}
            {modal.isOpen && modal.data && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
                        
                        {/* Modal Header */}
                        <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
                            <div className="flex items-center gap-3">
                                <span className="bg-indigo-600 text-white p-2 rounded-xl"><FiActivity size={18}/></span>
                                <div>
                                    <h3 className="font-black text-xs uppercase tracking-widest text-slate-900">Order: {modal.data.bookingId}</h3>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Placed on {new Date(modal.data.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <button onClick={() => setModal({ ...modal, isOpen: false })} className="w-10 h-10 flex items-center justify-center bg-white border rounded-full text-slate-400 hover:text-rose-500 hover:border-rose-100 transition-all"><FiX size={20} /></button>
                        </div>

                        <div className="p-8 overflow-y-auto no-scrollbar">
                            {/* Tracking & Lab Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-black text-xl">
                                            {modal.data.labId?.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-slate-900 text-lg leading-tight">{modal.data.labId?.name}</h4>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1"><FiMapPin/> {modal.data.labId?.city}</p>
                                        </div>
                                    </div>
                                    <StatusStepper status={modal.data.status} />
                                </div>

                                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                    <p className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest">Appointment Details</p>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-xs font-bold text-slate-700">
                                            <FiClock className="text-indigo-500"/> {new Date(modal.data.appointmentDate).toLocaleDateString('en-GB', {weekday: 'long', day: 'numeric', month: 'short'})}
                                        </div>
                                        <div className="flex items-center gap-3 text-xs font-bold text-slate-700">
                                            <FiActivity className="text-indigo-500"/> {modal.data.appointmentTime}
                                        </div>
                                        <div className="flex items-center gap-3 text-xs font-bold text-slate-700">
                                            {modal.data.collectionType === "Home Collection" ? <FiHome className="text-emerald-500"/> : <FiMapPin className="text-blue-500"/>} 
                                            {modal.data.collectionType}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Tests & Packages List */}
                            <div className="mb-8">
                                <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Included Items</h5>
                                <div className="grid grid-cols-1 gap-2">
                                    {modal.data.items.tests.map((test, i) => (
                                        <div key={i} className="flex justify-between items-center bg-slate-50 px-5 py-4 rounded-2xl border border-slate-100">
                                            <span className="text-xs font-bold text-slate-700">{test.name}</span>
                                            <span className="text-xs font-black text-slate-900">₹{test.price}</span>
                                        </div>
                                    ))}
                                    {modal.data.items.packages.map((pkg, i) => (
                                        <div key={i} className="flex justify-between items-center bg-indigo-50/50 px-5 py-4 rounded-2xl border border-indigo-100">
                                            <span className="text-xs font-black text-indigo-700">{pkg.name} <span className="text-[9px] opacity-50 uppercase font-black">(Package)</span></span>
                                            <span className="text-xs font-black text-indigo-900">₹{pkg.price}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Patient Info */}
                            <div className="mb-8">
                                <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Assigned Patients</h5>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {modal.data.patients.map((p, i) => (
                                        <div key={i} className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-slate-100">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"><FiUser size={14}/></div>
                                            <div>
                                                <p className="text-xs font-black text-slate-900 leading-none mb-1">{p.name}</p>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase">{p.gender} • {p.relation}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Billing Summary */}
                            <div className="bg-slate-900 text-white rounded-[32px] p-8">
                                <div className="flex items-center gap-2 mb-6">
                                    <FiCreditCard className="text-indigo-400"/>
                                    <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Final Bill Summary</h5>
                                </div>
                                <div className="space-y-3 text-xs font-bold border-b border-slate-800 pb-6 mb-6">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Items Subtotal</span>
                                        <span>₹{modal.data.billSummary.itemTotal}</span>
                                    </div>
                                    <div className="flex justify-between text-rose-400">
                                        <span>Coupon Discount</span>
                                        <span>- ₹{modal.data.billSummary.couponDiscount}</span>
                                    </div>
                                    {modal.data.billSummary.rapidDeliveryCharge > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Rapid Delivery</span>
                                            <span>₹{modal.data.billSummary.rapidDeliveryCharge}</span>
                                        </div>
                                    )}
                                    {modal.data.billSummary.homeVisitCharge > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Home Visit Fee</span>
                                            <span>₹{modal.data.billSummary.homeVisitCharge}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">Net Amount Paid</p>
                                        <p className="text-3xl font-black">₹{modal.data.billSummary.totalAmount}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Payment Status</p>
                                        <p className="text-xs font-black text-emerald-400 uppercase">{modal.data.paymentStatus}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-6 border-t bg-slate-50/50 flex flex-col sm:flex-row gap-3">
                             <button className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100 flex items-center justify-center gap-2">
                                <FiDownload size={16}/> Download Receipt
                             </button>
                             {modal.data.status === 'Report Ready' && (
                                <button className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-100 flex items-center justify-center gap-2">
                                   <MdOutlineScience size={16}/> View Lab Report
                                </button>
                             )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default LabOrders;