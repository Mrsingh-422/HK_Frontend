"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom'; // Required for screen centering
import toast from 'react-hot-toast';
import UserAPI from '../../../../services/UserAPI'; 
import {
    FiX, FiTruck, FiPackage, FiLayers,
    FiRefreshCw, FiClock, FiSearch, FiChevronLeft, FiChevronRight,
    FiUser, FiMapPin, FiCreditCard, FiStar
} from 'react-icons/fi';
import { HiStar } from 'react-icons/hi';
import { MdOutlineLocalPharmacy, MdOutlineRateReview } from 'react-icons/md';

// --- SUB-COMPONENT: STATUS TRACKER ---
const StatusStepper = ({ status }) => {
    const statusMap = {
        "Placed": 0,
        "Under Review": 1,
        "Shipped": 2,
        "Delivered": 3 
    };
    const currentStep = statusMap[status] ?? 0;
    const steps = ["Placed", "Reviewed", "Shipped", "Delivered"];

    return (
        <div className="w-full py-4 md:py-8">
            <div className="relative flex items-center justify-between">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-100 -z-10"></div>
                <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-indigo-600 transition-all duration-1000 z-10"
                    style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                ></div>
                {steps.map((step, index) => (
                    <div key={step} className="flex flex-col items-center gap-1.5 md:gap-2 relative z-20">
                        <div className={`w-3 h-3 md:w-3.5 md:h-3.5 rounded-full border-2 transition-all ${index <= currentStep ? "bg-indigo-600 border-indigo-200" : "bg-white border-slate-200"
                            }`}></div>
                        <span className={`text-[7.5px] md:text-[9px] font-black uppercase tracking-tighter whitespace-nowrap ${index <= currentStep ? "text-slate-900" : "text-slate-400"
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
    const [reviewModal, setReviewModal] = useState({ isOpen: false, data: null });
    const [mounted, setMounted] = useState(false);

    // 1. Handle Mounting for Portals in Next.js
    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    // 2. Lock body scroll when modal is open
    useEffect(() => {
        if (modal.isOpen || reviewModal.isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [modal.isOpen, reviewModal.isOpen]);

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
            toast.error("Failed to load pharmacy ledger.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadOrders();
    }, [loadOrders]);

    // Submit or Update Review API Action Connection
    const handleReviewSubmit = async (orderId, ratingData, isUpdate = false) => {
        try {
            let res;
            if (isUpdate) {
                res = await UserAPI.updateReview(orderId, {
                    rating: ratingData.rating,
                    comment: ratingData.comment
                });
            } else {
                res = await UserAPI.addRatingAndReviewPharmacy({
                    bookingId: orderId,
                    rating: ratingData.rating,
                    comment: ratingData.comment
                });
            }

            if (res && res.success) {
                toast.success(res.message || "Thank you for your rating and feedback!");
                setReviewModal({ isOpen: false, data: null });
                loadOrders();
            } else {
                toast.error(res?.message || "Failed to submit rating.");
            }
        } catch (error) {
            console.error("Failed to submit rating details:", error);
            toast.error("An error occurred while submitting the rating.");
        }
    };

    const getStatusStyle = (status) => {
        if (status === 'Delivered') return 'text-emerald-600 bg-emerald-50';
        if (status === 'Shipped') return 'text-indigo-600 bg-indigo-50';
        if (status === 'Cancelled') return 'text-rose-500 bg-rose-50';
        return 'text-amber-600 bg-amber-50'; 
    };

    const getItemNames = (items) => {
        if (!items || items.length === 0) return "General Medicines";
        return items.map(i => i.name).join(", ");
    };

    // --- MODAL PORTAL COMPONENT: RATINGS & REVIEW ---
    const PharmacyReviewModal = ({ isOpen, onClose, data }) => {
        const [rating, setRating] = useState(5);
        const [comment, setComment] = useState("");
        const [hoverRating, setHoverRating] = useState(0);
        const [submitting, setSubmitting] = useState(false);
        const [modalLoading, setModalLoading] = useState(true);
        const [isEditMode, setIsEditMode] = useState(false);

        useEffect(() => {
            const fetchReviewStatus = async () => {
                if (!isOpen || !data?._id) return;
                setModalLoading(true);
                try {
                    const res = await UserAPI.getReviewsByOrder(data._id);
                    if (res && res.success && res.hasReviewed) {
                        setIsEditMode(true);
                        setRating(res.data?.rating || 5);
                        setComment(res.data?.comment || "");
                    } else {
                        setIsEditMode(false);
                        setRating(5);
                        setComment("");
                    }
                } catch (error) {
                    console.error("Failed to query order review details:", error);
                    setIsEditMode(false);
                } finally {
                    setModalLoading(false);
                }
            };
            fetchReviewStatus();
        }, [isOpen, data]);

        if (!mounted || !isOpen || !data) return null;

        const handleSubmit = async (e) => {
            e.preventDefault();
            setSubmitting(true);
            await handleReviewSubmit(data._id, { rating, comment }, isEditMode);
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
                                <h4 className="font-black text-slate-900 text-sm md:text-base uppercase tracking-widest">
                                    {modalLoading ? "Syncing..." : isEditMode ? "Edit Review" : "Rate Order"}
                                </h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Reviewing {data.pharmacyId?.name}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-slate-50 border border-slate-200 rounded-full text-slate-400 hover:text-rose-500 hover:border-rose-100 transition-all">
                            <FiX size={16} />
                        </button>
                    </div>

                    {modalLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-3">
                            <FiRefreshCw className="animate-spin text-amber-500" size={24} />
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Syncing status details...</span>
                        </div>
                    ) : (
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
                                    placeholder="Describe the packaging quality, shipping delivery, or pharmacy assistance speed..."
                                    className="w-full bg-slate-50 border-none rounded-2xl p-4 text-xs font-semibold outline-none ring-1 ring-slate-100 focus:ring-indigo-500 transition-all placeholder:text-slate-400 resize-none"
                                />
                            </div>

                            {/* SUBMIT */}
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50"
                            >
                                {submitting ? (
                                    <FiRefreshCw className="animate-spin" />
                                ) : isEditMode ? (
                                    "Update Review"
                                ) : (
                                    "Submit Feedback"
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>,
            document.body
        );
    };

    // --- MODAL PORTAL COMPONENT: DETAILS ---
    const OrderDetailsModal = ({ data, onClose }) => {
        const [review, setReview] = useState(null);
        const [reviewLoading, setReviewLoading] = useState(false);

        useEffect(() => {
            const loadReview = async () => {
                if (data?.status === "Delivered" && data?._id) {
                    setReviewLoading(true);
                    try {
                        const res = await UserAPI.getReviewsByOrder(data._id);
                        if (res && res.success && res.hasReviewed) {
                            setReview(res.data);
                        }
                    } catch (err) {
                        console.error("Error loading order review history:", err);
                    } finally {
                        setReviewLoading(false);
                    }
                }
            };
            loadReview();
        }, [data]);

        if (!mounted) return null;

        return createPortal(
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 md:p-6">
                {/* Backdrop with High Blur */}
                <div 
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity duration-300"
                    onClick={onClose}
                />

                {/* Modal Card - Absolutely Centered */}
                <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] md:rounded-[3.5rem] shadow-[0_30px_80px_-15px_rgba(0,0,0,0.5)] overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 fade-in duration-300">
                    
                    {/* Header */}
                    <div className="p-6 md:p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200">
                                <MdOutlineLocalPharmacy size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Transaction ID</p>
                                <h3 className="font-black text-slate-900 text-sm md:text-base tracking-tight">#{data.orderId}</h3>
                            </div>
                        </div>
                        <button 
                            onClick={onClose}
                            className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-100 rounded-full transition-all text-slate-400 shadow-sm"
                        >
                            <FiX size={20} />
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar space-y-8">
                        {/* Status Highlight */}
                        <div className="bg-slate-900 rounded-[2rem] p-6 md:p-8 text-white relative overflow-hidden">
                            <FiTruck size={120} className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none" />
                            <div className="relative z-10">
                                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1">Current Progress</p>
                                <h2 className="text-3xl font-black mb-6">{data.status}</h2>
                                <StatusStepper status={data.status} />
                                <div className="mt-6 flex flex-wrap gap-3">
                                    <div className="px-3 py-1.5 bg-white/10 rounded-lg text-[10px] font-bold flex items-center gap-2"><FiClock/> {data.appointmentTime}</div>
                                    <div className="px-3 py-1.5 bg-white/10 rounded-lg text-[10px] font-bold flex items-center gap-2"><FiPackage/> {data.collectionType}</div>
                                </div>
                            </div>
                        </div>

                        {/* Items Section */}
                        <div className="space-y-4">
                            <h4 className="font-black text-[10px] uppercase tracking-widest text-slate-400 flex items-center gap-2 px-1">
                                <FiLayers className="text-indigo-500" /> Order Manifest
                            </h4>
                            <div className="space-y-2">
                                {data.items.map((item, i) => (
                                    <div key={i} className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100 hover:border-indigo-100 transition-colors">
                                        <div>
                                            <p className="font-black text-slate-800 text-sm">{item.name}</p>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">{item.duration} • Qty: {item.quantity}</p>
                                        </div>
                                        <p className="font-black text-slate-900">₹{item.price}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                                <p className="text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest">Shipping To</p>
                                <div className="flex gap-3">
                                    <FiMapPin className="text-indigo-500 shrink-0 mt-1" size={16} />
                                    <div className="text-[12px] font-bold text-slate-600 leading-relaxed">
                                        <p className="text-slate-900 font-black mb-1">{data.address?.name}</p>
                                        <p>{data.address?.houseNo}, {data.address?.sector}</p>
                                        <p>{data.address?.city}, {data.address?.pincode}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                                <p className="text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest">Patient Profile</p>
                                {data.patients?.map((p, idx) => (
                                    <div key={idx} className="flex gap-3">
                                        <FiUser className="text-emerald-500 shrink-0 mt-1" size={16} />
                                        <div className="text-[12px] font-bold text-slate-600 leading-relaxed">
                                            <p className="text-slate-900 font-black mb-1">{p.name}</p>
                                            <p>{p.gender} • {p.age} Yrs • {p.relation}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Verified Feedback Review Block */}
                        {data.status === "Delivered" && (
                            <div className="space-y-4">
                                <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Order Review Details</h5>
                                {reviewLoading ? (
                                    <div className="flex items-center gap-2 bg-slate-50 p-6 rounded-[2rem] border border-slate-100 text-xs font-semibold text-slate-400">
                                        <FiRefreshCw className="animate-spin text-slate-400" size={14} />
                                        <span>Syncing order feedback history...</span>
                                    </div>
                                ) : review ? (
                                    <div className="bg-amber-50/50 border border-amber-100/70 p-6 rounded-[2rem] space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[9px] font-black uppercase text-amber-600 tracking-wider flex items-center gap-1.5">
                                                <MdOutlineRateReview size={14} /> Submitted Feedback
                                            </span>
                                            <div className="flex gap-0.5">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <HiStar
                                                        key={star}
                                                        size={16}
                                                        className={star <= review.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-xs font-semibold text-slate-700 italic leading-relaxed">
                                            "{review.comment}"
                                        </p>
                                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">
                                            Date: {new Date(review.updatedAt || review.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="bg-slate-50 border border-slate-100 p-6 rounded-[2rem] text-center">
                                        <p className="text-xs font-bold text-slate-400">You have not submitted any feedback for this order yet.</p>
                                        <button 
                                            onClick={() => {
                                                onClose();
                                                setReviewModal({ isOpen: true, data: data });
                                            }}
                                            className="mt-2 text-[10px] font-black uppercase text-indigo-600 hover:text-indigo-700"
                                        >
                                            Submit Review
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Bill Breakdown */}
                        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white">
                            <div className="flex items-center gap-2 mb-6">
                                <FiCreditCard className="text-indigo-400" />
                                <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Payment Invoice</h5>
                            </div>
                            <div className="space-y-3 text-xs font-bold border-b border-white/10 pb-6 mb-6">
                                <div className="flex justify-between text-slate-400">
                                    <span>Subtotal</span>
                                    <span>₹{data.billSummary?.itemTotal}</span>
                                </div>
                                <div className="flex justify-between text-slate-400">
                                    <span>Shipping & Handling</span>
                                    <span>₹{data.billSummary?.deliveryCharge}</span>
                                </div>
                                {data.billSummary?.couponDiscount > 0 && (
                                    <div className="flex justify-between text-rose-400">
                                        <span>Discount Applied</span>
                                        <span>- ₹{data.billSummary?.couponDiscount}</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">Grand Total</p>
                                    <p className="text-3xl font-black">₹{data.billSummary?.totalAmount}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Paid via</p>
                                    <p className="text-xs font-black text-emerald-400 uppercase mt-1">{data.paymentMethod}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-6 md:p-8 bg-slate-50/50 border-t flex flex-wrap sm:flex-nowrap gap-3 shrink-0">
                        {data.status === "Delivered" && (
                            <button 
                                onClick={() => {
                                    onClose();
                                    setReviewModal({ isOpen: true, data: data });
                                }}
                                className="flex-1 py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-amber-100 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                            >
                                <FiStar size={16} /> {review ? "Edit Review & Rating" : "Add Review & Rating"}
                            </button>
                        )}
                        <button className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 active:scale-[0.98] transition-all">
                            Download Invoice
                        </button>
                    </div>
                </div>
            </div>,
            document.body
        );
    };

    return (
        <div className="bg-white border border-slate-200 rounded-[24px] md:rounded-[32px] overflow-hidden shadow-sm animate-fadeIn">
            {/* Table Header */}
            <div className="p-5 md:p-8 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h3 className="font-black text-slate-900 text-lg md:text-xl tracking-tight">Pharmacy Ledger</h3>
                    <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Total {pagination.totalCount} Orders</p>
                </div>
                <div className="relative w-full sm:w-72">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Search Order ID..." className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-11 pr-4 text-xs md:text-sm font-medium outline-none ring-1 ring-slate-200 focus:ring-indigo-500 transition-all" />
                </div>
            </div>

            <div>
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <FiRefreshCw className="animate-spin text-indigo-600" size={26} />
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Orders...</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-16 text-slate-400 text-xs font-medium">No orders found.</div>
                ) : (
                    <>
                        {/* Desktop View Table */}
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50">
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Order ID</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Items</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Price</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {orders.map((order) => (
                                        <tr key={order._id} className="hover:bg-slate-50/80 transition-colors group">
                                            <td className="px-8 py-6"><span className="text-xs font-black text-slate-900 tracking-wider">#{order.orderId}</span></td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-black shrink-0">{order.pharmacyId?.name?.charAt(0)}</div>
                                                    <div className="max-w-[200px]">
                                                        <p className="text-sm font-black text-slate-800 truncate mb-1 group-hover:text-indigo-600 transition-colors">{getItemNames(order.items)}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{order.pharmacyId?.name}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-xs font-bold text-slate-600">{new Date(order.createdAt).toLocaleDateString()}</td>
                                            <td className="px-8 py-6"><span className="text-sm font-black text-slate-900">₹{order.billSummary?.totalAmount}</span></td>
                                            <td className="px-8 py-6">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusStyle(order.status)}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex gap-2 justify-end items-center">
                                                    {order.status === "Delivered" && (
                                                        <button 
                                                            onClick={() => setReviewModal({ isOpen: true, data: order })} 
                                                            className="px-4 py-2.5 rounded-xl text-[10px] font-black uppercase bg-amber-500 hover:bg-amber-600 text-white transition-all flex items-center gap-1 shadow-md shadow-amber-100"
                                                        >
                                                            <FiStar /> Rate Order
                                                        </button>
                                                    )}
                                                    <button onClick={() => setModal({ isOpen: true, data: order })} className="bg-white border border-slate-200 text-slate-600 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase hover:bg-slate-900 hover:text-white transition-all">View Details</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="block lg:hidden divide-y divide-slate-100 px-4 md:px-6">
                            {orders.map((order) => (
                                <div key={order._id} className="py-5 flex flex-col gap-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-black text-xs shrink-0">{order.pharmacyId?.name?.charAt(0)}</div>
                                            <div>
                                                <span className="text-[10px] font-black text-slate-400 tracking-wider">#{order.orderId}</span>
                                                <h4 className="text-sm font-black text-slate-800 line-clamp-1 mt-0.5">{getItemNames(order.items)}</h4>
                                            </div>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase ${getStatusStyle(order.status)}`}>{order.status}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {order.status === "Delivered" && (
                                            <button 
                                                onClick={() => setReviewModal({ isOpen: true, data: order })} 
                                                className="w-full bg-amber-500 hover:bg-amber-600 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-center text-white flex items-center justify-center gap-1 shadow-md shadow-amber-100"
                                            >
                                                <FiStar /> Rate Order
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => setModal({ isOpen: true, data: order })} 
                                            className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-center border border-slate-200 bg-white ${order.status !== "Delivered" ? "col-span-2" : ""}`}
                                        >
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Pagination */}
            <div className="p-4 md:p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
                <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Page {pagination.currentPage} of {pagination.totalPages}</p>
                <div className="flex gap-2">
                    <button disabled={pagination.currentPage === 1} onClick={() => loadOrders(pagination.currentPage - 1)} className="p-2 rounded-lg border border-slate-200 bg-white disabled:opacity-30"><FiChevronLeft size={16} /></button>
                    <button disabled={pagination.currentPage >= pagination.totalPages} onClick={() => loadOrders(pagination.currentPage + 1)} className="p-2 rounded-lg border border-slate-200 bg-white disabled:opacity-30"><FiChevronRight size={16} /></button>
                </div>
            </div>

            {/* --- Render Order Details Modal --- */}
            {modal.isOpen && modal.data && (
                <OrderDetailsModal 
                    data={modal.data} 
                    onClose={() => setModal({ isOpen: false, data: null })} 
                />
            )}

            {/* --- Render Rating & Review Modal --- */}
            {reviewModal.isOpen && reviewModal.data && (
                <PharmacyReviewModal 
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

export default PharmacyOrders;