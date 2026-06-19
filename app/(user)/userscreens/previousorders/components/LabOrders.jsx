"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom'; // Required for screen centering
import UserAPI from '../../../../services/UserAPI';
import {
    FiX, FiActivity, FiLayers, FiHome,
    FiDownload, FiSearch, FiRefreshCw, FiChevronLeft, FiChevronRight,
    FiUser, FiMapPin, FiClock, FiCreditCard, FiStar, FiCheckCircle
} from 'react-icons/fi';
import { HiStar } from 'react-icons/hi';
import { MdOutlineScience, MdOutlineRateReview, MdPayment } from 'react-icons/md';

// --- SUB-COMPONENT: STEPPER ---
const StatusStepper = ({ status }) => {
    const statusMap = {
        "Confirmed": 0,
        "Phlebotomist Assigned": 1,
        "Sample Collected": 2,
        "Report Ready": 3,
        "Completed": 3
    };
    const currentStep = statusMap[status] ?? 1;
    const steps = ["Booked", "Assigned", "Collected", "Completed"];

    return (
        <div className="w-full py-4 md:py-8 px-1 md:px-2">
            <div className="relative flex items-center justify-between">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-100 -z-10"></div>
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-indigo-600 transition-all duration-700 z-10"
                    style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}></div>
                {steps.map((step, index) => (
                    <div key={step} className="flex flex-col items-center gap-1.5 md:gap-2 relative z-20">
                        <div className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full border-2 transition-all duration-500 ${index <= currentStep ? "bg-indigo-600 border-indigo-100 ring-2 md:ring-4 ring-indigo-50" : "bg-white border-slate-200"}`} />
                        <span className={`text-[7.5px] md:text-[8px] font-black uppercase tracking-tighter whitespace-nowrap ${index <= currentStep ? "text-slate-900" : "text-slate-400"}`}>{step}</span>
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
    const [reviewModal, setReviewModal] = useState({ isOpen: false, data: null });
    const [mounted, setMounted] = useState(false);

    // 1. Handle Mounting for Portals (Next.js SSR safety)
    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    // 2. Prevent body scroll when modals are open
    useEffect(() => {
        if (modal.isOpen || reviewModal.isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [modal.isOpen, reviewModal.isOpen]);

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

    // Submit Review API connection
    const handleReviewSubmit = async (bookingId, ratingData) => {
        try {
            // Setup precise request body for submit review
            const reviewPayload = {
                bookingId: bookingId, // MongoDB ObjectId (_id)
                rating: ratingData.rating,
                comment: ratingData.comment
            };

            const res = await UserAPI.addRatingAndReviewLab(reviewPayload);
            
            if (res && res.success) {
                alert(res.message || "Thank you for sharing your diagnostics experience!");
                setReviewModal({ isOpen: false, data: null });
                // Re-fetch list to capture updated details
                loadBookings();
            } else {
                alert(res?.message || "Failed to submit review.");
            }
        } catch (error) {
            console.error("Failed to post rating details", error);
            alert("An error occurred while submitting the review.");
        }
    };

    // Helpers
    const getItemsCount = (items) => (items?.tests?.length || 0) + (items?.packages?.length || 0);

    const getItemsSummary = (items) => {
        if (!items) return "Diagnostic Booking";
        const tests = items.tests?.map(t => t.name) || [];
        const packages = items.packages?.map(p => p.name) || [];
        const all = [...tests, ...packages];
        return all.length > 0 ? all.join(", ") : "Diagnostic Booking";
    };

    const getStatusStyles = (status) => {
        if (status === 'Report Ready' || status === 'Completed') return 'text-emerald-600 bg-emerald-50';
        if (['Cancelled', 'Rejected'].includes(status)) return 'text-rose-500 bg-rose-50';
        return 'text-indigo-600 bg-indigo-50';
    };

    // --- MODAL PORTAL COMPONENT: ADD REVIEW & RATINGS ---
    const LabReviewModal = ({ isOpen, onClose, data }) => {
        const [rating, setRating] = useState(5);
        const [comment, setComment] = useState("");
        const [hoverRating, setHoverRating] = useState(0);
        const [submitting, setSubmitting] = useState(false);

        if (!mounted || !isOpen || !data) return null;

        const handleSubmit = async (e) => {
            e.preventDefault();
            setSubmitting(true);
            await handleReviewSubmit(data._id, { rating, comment });
            setSubmitting(false);
        };

        const getRatingLabel = (val) => {
            switch (val) {
                case 1: return "Extremely Disappointed";
                case 2: return "Needs Improvement";
                case 3: return "Average Experience";
                case 4: return "Very Good Quality";
                case 5: return "Excellent Service!";
                default: return "Select Rating";
            }
        };

        return createPortal(
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 md:p-6">
                {/* Backdrop */}
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity duration-300" onClick={onClose} />

                {/* Modal Card */}
                <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-[0_30px_80px_-15px_rgba(0,0,0,0.5)] overflow-hidden p-6 md:p-8 animate-in zoom-in-95 fade-in duration-300">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2">
                            <span className="bg-amber-100 text-amber-600 p-2 rounded-xl">
                                <MdOutlineRateReview size={20} />
                            </span>
                            <div>
                                <h4 className="font-black text-slate-900 text-sm md:text-base uppercase tracking-widest">Rate Booking</h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Reviewing {data.labId?.name}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-slate-50 border border-slate-200 rounded-full text-slate-400 hover:text-rose-500 hover:border-rose-100 transition-all">
                            <FiX size={16} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* STAR INTERACTIVE GRID */}
                        <div className="flex flex-col items-center justify-center gap-2 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                            <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Tap to Rate Stars</span>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        type="button"
                                        key={star}
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        className="transition-transform active:scale-90 hover:scale-110"
                                    >
                                        <HiStar
                                            size={32}
                                            className={`${
                                                star <= (hoverRating || rating)
                                                    ? "text-amber-400 fill-amber-400"
                                                    : "text-slate-200"
                                            } transition-colors duration-150`}
                                        />
                                    </button>
                                ))}
                            </div>
                            <span className="text-xs font-bold text-slate-600 mt-1 transition-all duration-300">
                                {getRatingLabel(hoverRating || rating)}
                            </span>
                        </div>

                        {/* TEXT COMMENT */}
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest px-1 block">Comment Feedback</label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows={4}
                                required
                                placeholder="Describe the service details, phlebotomist behavior, collection safety, or speed of lab report..."
                                className="w-full bg-slate-50 border-none rounded-2xl p-4 text-xs font-semibold outline-none ring-1 ring-slate-100 focus:ring-indigo-500 transition-all placeholder:text-slate-400 resize-none"
                            />
                        </div>

                        {/* SUBMIT */}
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                            {submitting ? <FiRefreshCw className="animate-spin" /> : "Submit Feedback"}
                        </button>
                    </form>
                </div>
            </div>,
            document.body
        );
    };

    // --- MODAL PORTAL COMPONENT: ORDER DETAILS ---
    const LabDetailsModal = ({ data, onClose }) => {
        if (!mounted) return null;

        return createPortal(
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 md:p-6">
                {/* Backdrop */}
                <div
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity duration-300"
                    onClick={onClose}
                />

                {/* Modal Card */}
                <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] md:rounded-[3.5rem] shadow-[0_30px_80px_-15px_rgba(0,0,0,0.5)] overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 fade-in duration-300">

                    {/* Header */}
                    <div className="p-6 md:p-8 border-b flex justify-between items-center bg-slate-50/30 shrink-0">
                        <div className="flex items-center gap-3">
                            <span className="bg-indigo-600 text-white p-2.5 rounded-2xl shrink-0 shadow-lg shadow-indigo-100">
                                <FiActivity size={20} />
                            </span>
                            <div>
                                <h3 className="font-black text-slate-900 text-sm md:text-base uppercase tracking-widest">Booking #{data.bookingId}</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Diagnostic Summary</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-full text-slate-400 hover:text-rose-500 hover:border-rose-100 transition-all shrink-0 shadow-sm"
                        >
                            <FiX size={20} />
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="p-6 md:p-10 overflow-y-auto custom-scrollbar space-y-8 flex-1">

                        {/* Status & Lab Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-black text-xl border border-indigo-100">
                                        {data.labId?.name?.charAt(0) || 'L'}
                                    </div>
                                    <div>
                                        <h4 className="font-black text-slate-900 text-lg leading-tight">{data.labId?.name}</h4>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1 mt-1">
                                            <FiMapPin size={12} /> {data.labId?.city}
                                        </p>
                                    </div>
                                </div>
                                <StatusStepper status={data.status} />
                            </div>

                            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                                <p className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest">Slot & Security Details</p>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                                        <div className="flex items-center gap-3">
                                            <FiClock className="text-indigo-500" size={16} />
                                            <span>{new Date(data.appointmentDate).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })}</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                                        <div className="flex items-center gap-3">
                                            <FiActivity className="text-indigo-500" size={16} />
                                            <span>{data.appointmentTime}</span>
                                        </div>
                                        {data.tracking?.otp && (
                                            <span className="bg-amber-100 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-md text-[10px] tracking-wider uppercase font-black">
                                                OTP: {data.tracking.otp}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3 text-xs font-bold text-slate-700">
                                        {data.collectionType === "Home Collection" ? <FiHome className="text-emerald-500" size={16} /> : <FiMapPin className="text-blue-500" size={16} />}
                                        <span>Collection: {data.collectionType}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tests List */}
                        <div className="space-y-4">
                            <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Included Tests & Packages</h5>
                            <div className="grid grid-cols-1 gap-2.5">
                                {data.items?.tests?.map((test, i) => (
                                    <div key={i} className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                        <span className="font-bold text-slate-700 text-sm">{test.name}</span>
                                        <span className="font-black text-slate-900">₹{test.price}</span>
                                    </div>
                                ))}
                                {data.items?.packages?.map((pkg, i) => (
                                    <div key={i} className="flex justify-between items-center bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
                                        <span className="font-black text-indigo-700 text-sm">{pkg.name} <span className="text-[8px] uppercase ml-1 opacity-60">(Package)</span></span>
                                        <span className="font-black text-indigo-900">₹{pkg.price}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Patient Grid */}
                        <div className="space-y-4">
                            <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Patients Assigned</h5>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {data.patients?.map((p, i) => (
                                    <div key={i} className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-slate-100">
                                        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100"><FiUser size={16} /></div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-black text-slate-900 leading-none mb-1 truncate">{p.name}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">{p.gender} • {p.relation}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Bill & Payment Details Summary */}
                        <div className="space-y-4">
                            <div className="bg-slate-900 text-white rounded-[2.5rem] p-8">
                                <div className="flex items-center gap-2 mb-6">
                                    <FiCreditCard className="text-indigo-400" />
                                    <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Financial Summary</h5>
                                </div>
                                <div className="space-y-3 text-xs font-bold border-b border-white/10 pb-6 mb-6">
                                    <div className="flex justify-between text-slate-400">
                                        <span>Subtotal</span>
                                        <span>₹{data.billSummary?.itemTotal}</span>
                                    </div>
                                    {data.billSummary?.couponDiscount > 0 && (
                                        <div className="flex justify-between text-rose-400">
                                            <span>Coupon Applied</span>
                                            <span>- ₹{data.billSummary?.couponDiscount}</span>
                                        </div>
                                    )}
                                    {data.billSummary?.homeVisitCharge > 0 && (
                                        <div className="flex justify-between text-slate-400">
                                            <span>Home Visit Fee</span>
                                            <span>₹{data.billSummary?.homeVisitCharge}</span>
                                        </div>
                                    )}
                                    {data.billSummary?.rapidDeliveryCharge > 0 && (
                                        <div className="flex justify-between text-slate-400">
                                            <span>Rapid Delivery Charge</span>
                                            <span>₹{data.billSummary?.rapidDeliveryCharge}</span>
                                        </div>
                                    )}
                                    {data.billSummary?.distanceCharge > 0 && (
                                        <div className="flex justify-between text-slate-400">
                                            <span>Distance Fee</span>
                                            <span>₹{data.billSummary?.distanceCharge}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">Net Paid</p>
                                        <p className="text-3xl font-black">₹{data.billSummary?.totalAmount}</p>
                                    </div>
                                    <div className="text-left sm:text-right">
                                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Payment Status</p>
                                        <p className="text-xs font-black text-emerald-400 uppercase mt-1 flex items-center gap-1.5 justify-start sm:justify-end">
                                            <FiCheckCircle /> {data.paymentStatus}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Transaction Details Receipt */}
                            {data.paymentDetails && (
                                <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 text-xs text-slate-600 space-y-2.5">
                                    <span className="text-[9px] font-black uppercase text-indigo-600 tracking-wider flex items-center gap-1.5 mb-2">
                                        <MdPayment size={14} /> Settlement Details
                                    </span>
                                    <div className="grid grid-cols-2 gap-y-1 bg-white p-4 rounded-xl border border-slate-100/50">
                                        <span>Payment ID:</span>
                                        <span className="font-mono text-slate-800 break-all">{data.paymentDetails.razorpayPaymentId || "N/A"}</span>
                                        
                                        <span>Order Reference ID:</span>
                                        <span className="font-mono text-slate-800 break-all">{data.paymentDetails.razorpayOrderId || "N/A"}</span>
                                        
                                        <span>Bank / Method:</span>
                                        <span className="capitalize text-slate-800">{data.paymentDetails.bank || data.paymentDetails.method || data.paymentMethod || "N/A"}</span>

                                        <span>Transaction Date:</span>
                                        <span className="text-slate-800">{data.paymentDetails.paidAt ? new Date(data.paymentDetails.paidAt).toLocaleString() : "N/A"}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="p-6 md:p-8 bg-slate-50/50 border-t flex flex-wrap sm:flex-nowrap gap-3 shrink-0">
                        {data.status === "Completed" && (
                            <button 
                                onClick={() => {
                                    onClose();
                                    setReviewModal({ isOpen: true, data: data });
                                }}
                                className="flex-1 py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-amber-100 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                            >
                                <FiStar size={16} /> Add Review & Rating
                            </button>
                        )}
                        <button className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 active:scale-[0.98] transition-all">
                            <FiDownload size={16} /> Download Receipt
                        </button>
                        {data.status === 'Report Ready' && (
                            <button className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-100 flex items-center justify-center gap-2 active:scale-[0.98] transition-all">
                                <MdOutlineScience size={18} /> View Lab Report
                            </button>
                        )}
                    </div>
                </div>
            </div>,
            document.body
        );
    };

    return (
        <div className="bg-white border border-slate-200 rounded-[24px] md:rounded-[32px] overflow-hidden shadow-sm animate-fadeIn">
            {/* Header */}
            <div className="p-5 md:p-8 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h3 className="font-black text-slate-900 text-lg md:text-xl tracking-tight">Lab Records</h3>
                    <p className="text-slate-400 text-[9px] md:text-[10px] font-bold uppercase tracking-widest mt-1">Found {pagination.totalCount} Bookings</p>
                </div>
                <div className="relative w-full sm:w-72">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Search Order ID..." className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-11 pr-4 text-xs md:text-sm font-semibold outline-none ring-1 ring-slate-100 focus:ring-indigo-500 transition-all" />
                </div>
            </div>

            <div>
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <FiRefreshCw className="animate-spin text-indigo-600" size={26} />
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading records...</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-16 text-slate-400 text-xs font-medium">No lab records available.</div>
                ) : (
                    <>
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50">
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Order Info</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Tests</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Amount</th>
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
                                                <p className="text-sm font-black text-slate-800 truncate mb-1">
                                                    {getItemsSummary(order.items).slice(0, 30)}
                                                </p>
                                                <p className="text-[9px] font-bold text-indigo-500 uppercase flex items-center gap-1"><FiLayers /> {getItemsCount(order.items)} Items</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-xs font-bold text-slate-700">{new Date(order.appointmentDate).toLocaleDateString()}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase">{order.appointmentTime}</p>
                                            </td>
                                            <td className="px-8 py-6"><span className="text-sm font-black text-slate-900">₹{order.billSummary?.totalAmount}</span></td>
                                            <td className="px-8 py-6">
                                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${getStatusStyles(order.status)}`}>{order.status}</span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex gap-2 justify-end items-center">
                                                    {order.status === "Completed" && (
                                                        <button 
                                                            onClick={() => setReviewModal({ isOpen: true, data: order })} 
                                                            className="px-4 py-2 rounded-xl text-[9px] font-black uppercase bg-amber-500 hover:bg-amber-600 text-white transition-all flex items-center gap-1 shadow-md shadow-amber-100"
                                                        >
                                                            <FiStar /> Rate Service
                                                        </button>
                                                    )}
                                                    <button onClick={() => setModal({ isOpen: true, data: order })} className="px-4 py-2 rounded-xl text-[9px] font-black uppercase border border-slate-200 hover:bg-slate-900 hover:text-white transition-all">View Summary</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="block lg:hidden divide-y divide-slate-100 px-4">
                            {orders.map((order) => (
                                <div key={order._id} className="py-5 flex flex-col gap-3.5">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 tracking-wider">#{order.bookingId}</p>
                                            <h4 className="text-sm font-black text-slate-800 line-clamp-1">{getItemsSummary(order.items)}</h4>
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase ${getStatusStyles(order.status)}`}>{order.status}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {order.status === "Completed" && (
                                            <button 
                                                onClick={() => setReviewModal({ isOpen: true, data: order })} 
                                                className="w-full bg-amber-500 hover:bg-amber-600 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-center text-white flex items-center justify-center gap-1 shadow-md shadow-amber-100"
                                            >
                                                <FiStar /> Rate Service
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => setModal({ isOpen: true, data: order })} 
                                            className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-center border border-slate-200 bg-white ${order.status !== "Completed" ? "col-span-2" : ""}`}
                                        >
                                            View Summary
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Pagination */}
            <div className="p-4 md:p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/20">
                <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Page {pagination.currentPage} of {pagination.totalPages}</p>
                <div className="flex gap-2">
                    <button disabled={pagination.currentPage === 1} onClick={() => loadBookings(pagination.currentPage - 1)} className="p-2 rounded-lg border border-slate-200 bg-white disabled:opacity-30"><FiChevronLeft size={16} /></button>
                    <button disabled={pagination.currentPage >= pagination.totalPages} onClick={() => loadBookings(pagination.currentPage + 1)} className="p-2 rounded-lg border border-slate-200 bg-white disabled:opacity-30"><FiChevronRight size={16} /></button>
                </div>
            </div>

            {/* --- Portal Modals --- */}
            {modal.isOpen && modal.data && (
                <LabDetailsModal
                    data={modal.data}
                    onClose={() => setModal({ isOpen: false, data: null })}
                />
            )}

            {reviewModal.isOpen && reviewModal.data && (
                <LabReviewModal
                    isOpen={reviewModal.isOpen}
                    data={reviewModal.data}
                    onClose={() => setReviewModal({ isOpen: false, data: null })}
                />
            )}

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
            `}</style>
        </div>
    );
}

export default LabOrders;