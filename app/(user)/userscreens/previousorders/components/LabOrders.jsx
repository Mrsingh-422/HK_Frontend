"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import UserAPI from '../../../../services/UserAPI';
import {
    FiX, FiActivity, FiLayers, FiHome,
    FiDownload, FiSearch, FiRefreshCw, FiChevronLeft, FiChevronRight,
    FiUser, FiMapPin, FiClock, FiCreditCard, FiStar, FiCheckCircle,
    FiAlertCircle, FiPhone, FiZap, FiCalendar, FiCheck
} from 'react-icons/fi';
import { HiStar } from 'react-icons/hi';
import { MdOutlineScience, MdOutlineRateReview, MdPayment } from 'react-icons/md';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5002";

// Helper to resolve files and assets from backend
const getReportFileUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }
    const cleanedPath = path.replace(/^\/+/, '');
    return `${BACKEND_URL}/${cleanedPath}`;
};

// Dynamically load Razorpay SDK
const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        if (typeof window !== 'undefined' && window.Razorpay) {
            resolve(true);
            return;
        }
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

// --- SUB-COMPONENT: DELIVERY & COLLECTION MODE BADGE ---
const LabModeBadge = ({ deliveryMode, collectionType }) => {
    const isExpress = deliveryMode?.isExpressReporting || deliveryMode?.type === 'EXPRESS_HOME';

    if (isExpress) {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200/80 font-bold rounded-md text-[10px] whitespace-nowrap">
                <FiZap size={10} className="text-amber-500 fill-amber-500 shrink-0" />
                Fast Express (+₹{deliveryMode?.fastReportCharge || 0})
            </span>
        );
    }

    if (collectionType === "Home Collection" || deliveryMode?.type === 'HOME') {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-bold rounded-md text-[10px] whitespace-nowrap">
                <FiHome size={10} className="shrink-0" />
                Home Sample
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200/80 font-bold rounded-md text-[10px] whitespace-nowrap">
            <FiMapPin size={10} className="shrink-0" />
            Lab Visit
        </span>
    );
};

// --- SUB-COMPONENT: PAYMENT STATUS BADGE ---
const LabPaymentBadge = ({ paymentStatus, paymentMethod, isCod }) => {
    const isCash = isCod || paymentMethod === 'COD';

    if (isCash) {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200/80 font-bold rounded-md text-[10px] whitespace-nowrap">
                💵 COD {paymentStatus === 'Paid' ? '(Paid)' : '(Pending)'}
            </span>
        );
    }

    if (paymentStatus === 'Paid') {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-bold rounded-md text-[10px] whitespace-nowrap">
                <FiCheckCircle size={10} className="shrink-0 text-emerald-600" /> Paid Online
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-50 text-rose-600 border border-rose-200/80 font-bold rounded-md text-[10px] whitespace-nowrap">
            <FiAlertCircle size={10} className="shrink-0 text-rose-500" /> Payment Incomplete
        </span>
    );
};

// --- SUB-COMPONENT: STEPPER & LIVE TIMELINE ---
const StatusStepper = ({ status, trackingTimeline }) => {
    if (trackingTimeline && trackingTimeline.length > 0) {
        return (
            <div className="w-full py-3 md:py-4 space-y-3">
                <div className="relative border-l-2 border-indigo-500/30 ml-3 md:ml-4 pl-4 md:pl-6 space-y-4">
                    {trackingTimeline.map((step, index) => (
                        <div key={index} className="relative group">
                            <div className={`absolute -left-[23px] md:-left-[31px] top-1 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                step.isCompleted
                                    ? "bg-emerald-500 border-emerald-300 text-white"
                                    : step.isCurrent
                                    ? "bg-indigo-600 border-indigo-300 animate-pulse"
                                    : "bg-slate-800 border-slate-600"
                            }`}>
                                {step.isCompleted && <FiCheck size={10} />}
                            </div>
                            <div>
                                <div className="flex items-center justify-between">
                                    <h5 className={`text-xs font-black uppercase tracking-wider ${
                                        step.isCurrent ? "text-indigo-400 font-black" : step.isCompleted ? "text-white" : "text-slate-400"
                                    }`}>
                                        {step.title}
                                    </h5>
                                    {step.time && (
                                        <span className="text-[9px] font-mono text-slate-400">
                                            {new Date(step.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    )}
                                </div>
                                <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">{step.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const statusMap = {
        "Prescription Uploaded": 0,
        "Under Review": 0,
        "Tests Added": 0,
        "Pending": 0,
        "Confirmed": 0,
        "Phlebotomist Assigned": 1,
        "Sample Collected": 2,
        "Sample Deposited": 2,
        "Testing": 3,
        "Report Generated": 4,
        "Completed": 4
    };

    const currentStep = statusMap[status] ?? 0;
    const steps = ["Booked", "Assigned", "Collected", "Testing", "Completed"];
    const isCancelled = status === "Cancelled";

    return (
        <div className="w-full py-4 md:py-8 px-1 md:px-2">
            <div className="relative flex items-center justify-between">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-100 -z-10"></div>
                <div 
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 transition-all duration-700 z-10"
                    style={{ 
                        width: isCancelled ? "100%" : `${(currentStep / (steps.length - 1)) * 100}%`,
                        backgroundColor: isCancelled ? "#f43f5e" : "#4f46e5"
                    }}
                ></div>
                {steps.map((step, index) => {
                    const isCompletedStep = !isCancelled && index <= currentStep;
                    return (
                        <div key={step} className="flex flex-col items-center gap-1.5 md:gap-2 relative z-20">
                            <div className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full border-2 transition-all duration-500 ${
                                isCancelled 
                                    ? "bg-rose-500 border-rose-100 ring-2 md:ring-4 ring-rose-50" 
                                    : isCompletedStep 
                                        ? "bg-indigo-600 border-indigo-100 ring-2 md:ring-4 ring-indigo-50" 
                                        : "bg-white border-slate-200"
                            }`} />
                            <span className={`text-[7.5px] md:text-[8px] font-black uppercase tracking-tighter whitespace-nowrap ${
                                isCancelled 
                                    ? "text-rose-500" 
                                    : isCompletedStep 
                                        ? "text-slate-900" 
                                        : "text-slate-400"
                            }`}>
                                {isCancelled && index === steps.length - 1 ? "Cancelled" : step}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

function LabOrders() {
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState([]);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalCount: 0 });
    const [modal, setModal] = useState({ isOpen: false, data: null, trackingData: null });
    const [reviewModal, setReviewModal] = useState({ isOpen: false, data: null });
    const [retryingId, setRetryingId] = useState(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

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
            if (res && res.success) {
                setOrders(res.data || []);
                setPagination({
                    currentPage: res.currentPage || 1,
                    totalPages: res.totalPages || 1,
                    totalCount: res.totalBookings ?? res.count ?? (res.data ? res.data.length : 0)
                });
            }
        } catch (error) {
            console.error("Failed to fetch bookings:", error);
            toast.error("Failed to load lab bookings.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadBookings();
    }, [loadBookings]);

    // Open Details & Live Tracking Modal
    const handleOpenDetails = async (order) => {
        setModal({ isOpen: true, data: order, trackingData: null });
        try {
            const targetId = order.bookingId || order._id;
            const res = await UserAPI.getLabDetails?.(targetId);
            if (res && res.success && res.data) {
                setModal({ isOpen: true, data: { ...order, ...res.data }, trackingData: res.data });
            }
        } catch (e) {
            console.warn("Lab tracking details fetch skipped:", e);
        }
    };

    // --- RETRY LAB PAYMENT HANDLER (POST /user/labs/retry-payment) ---
    const handleRetryPayment = async (order) => {
        const targetBookingId = order.bookingId || order._id;
        setRetryingId(targetBookingId);

        try {
            const res = await UserAPI.retryPaymentLab({ bookingId: targetBookingId });

            if (res && res.success) {
                const isLoaded = await loadRazorpayScript();
                if (!isLoaded) {
                    toast.error("Razorpay SDK failed to load. Please check your internet connection.");
                    setRetryingId(null);
                    return;
                }

                let keyId = res.key_id || res.key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
                if (typeof keyId === 'string' && keyId.startsWith("zp_")) {
                    keyId = "r" + keyId;
                }

                const options = {
                    key: keyId,
                    amount: res.amount,
                    currency: "INR",
                    name: "Health Kangaroo Diagnostics",
                    description: `Payment for Lab Booking #${res.bookingId || targetBookingId}`,
                    order_id: res.razorpayOrderId,
                    handler: async function (razorpayResponse) {
                        try {
                            const verifyPayload = {
                                bookingId: res.bookingId || targetBookingId,
                                appointmentId: res.bookingMongoId || order._id,
                                razorpay_payment_id: razorpayResponse.razorpay_payment_id,
                                razorpay_order_id: razorpayResponse.razorpay_order_id || res.razorpayOrderId,
                                razorpay_signature: razorpayResponse.razorpay_signature,
                                razorpayPaymentId: razorpayResponse.razorpay_payment_id,
                                razorpayOrderId: razorpayResponse.razorpay_order_id || res.razorpayOrderId,
                                razorpaySignature: razorpayResponse.razorpay_signature,
                                paymentMethod: "Online"
                            };

                            const verifyRes = await UserAPI.verifyPaymentLab(verifyPayload);

                            if (verifyRes && verifyRes.success) {
                                toast.success(verifyRes.message || "Payment verified! Your booking is confirmed.");
                                loadBookings();
                            } else {
                                toast.error(verifyRes?.message || "Payment verification failed.");
                            }
                        } catch (err) {
                            console.error("Payment verification error:", err);
                            toast.error(err.response?.data?.message || "Error verifying payment with server.");
                        }
                    },
                    modal: {
                        ondismiss: function () {
                            toast("Payment window closed.");
                        }
                    },
                    theme: {
                        color: "#08B36A"
                    }
                };

                const rzp = new window.Razorpay(options);
                rzp.on('payment.failed', function (response) {
                    toast.error(response.error?.description || "Payment failed. Please try again.");
                });
                rzp.open();
            } else {
                toast.error(res?.message || "Failed to initialize payment retry.");
            }
        } catch (error) {
            console.error("Retry lab payment error:", error);
            toast.error(error.response?.data?.message || "Failed to initiate payment retry.");
        } finally {
            setRetryingId(null);
        }
    };

    // Review Submit / Update
    const handleReviewSubmit = async (bookingId, ratingData, isUpdate = false) => {
        try {
            let res;
            if (isUpdate) {
                res = await UserAPI.updateReview(bookingId, {
                    rating: ratingData.rating,
                    comment: ratingData.comment
                });
            } else {
                res = await UserAPI.addRatingAndReviewLab({
                    bookingId: bookingId,
                    rating: ratingData.rating,
                    comment: ratingData.comment
                });
            }
            
            if (res && res.success) {
                toast.success(res.message || "Thank you for sharing your diagnostics experience!");
                setReviewModal({ isOpen: false, data: null });
                loadBookings();
            } else {
                toast.error(res?.message || "Failed to submit review.");
            }
        } catch (error) {
            console.error("Failed to post rating details", error);
            toast.error("An error occurred while submitting the review.");
        }
    };

    // Helpers
    const getLabName = (order) => {
        return order.lab?.name || order.labId?.name || "Diagnostic Lab";
    };

    const getItemsCount = (order) => {
        if (order.items?.length) return order.items.length;
        return (order.items?.tests?.length || 0) + (order.items?.packages?.length || 0);
    };

    const getItemsSummary = (order) => {
        if (order.items && Array.isArray(order.items) && order.items.length > 0) {
            return order.items.map(i => i.name).join(", ");
        }
        if (order.items) {
            const tests = order.items.tests?.map(t => t.name) || [];
            const packages = order.items.packages?.map(p => p.name) || [];
            const all = [...tests, ...packages];
            if (all.length > 0) return all.join(", ");
        }
        return "Prescribed Lab Tests";
    };

    const isPendingPayment = (order) => {
        const isNotCod = !order.isCod && order.paymentMethod !== 'COD';
        return (order.paymentStatus === 'Pending' || order.status === 'Pending') && isNotCod;
    };

    const getStatusStyles = (status) => {
        if (['Report Generated', 'Completed'].includes(status)) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
        if (status === 'Cancelled') return 'text-rose-700 bg-rose-50 border-rose-200';
        if (['Prescription Uploaded', 'Under Review', 'Tests Added', 'Pending'].includes(status)) return 'text-amber-700 bg-amber-50 border-amber-200';
        return 'text-indigo-700 bg-indigo-50 border-indigo-200';
    };

    // --- MODAL: ADD / EDIT REVIEW ---
    const LabReviewModal = ({ isOpen, onClose, data }) => {
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
                    console.error("Failed to check review status:", error);
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
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity duration-300" onClick={onClose} />

                <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-[0_30px_80px_-15px_rgba(0,0,0,0.5)] overflow-hidden p-6 md:p-8 animate-in zoom-in-95 fade-in duration-300">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2">
                            <span className="bg-amber-100 text-amber-600 p-2 rounded-xl">
                                <MdOutlineRateReview size={20} />
                            </span>
                            <div>
                                <h4 className="font-black text-slate-900 text-sm md:text-base uppercase tracking-widest">
                                    {modalLoading ? "Checking Status..." : isEditMode ? "Edit Review" : "Rate Booking"}
                                </h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Reviewing {getLabName(data)}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-slate-50 border border-slate-200 rounded-full text-slate-400 hover:text-rose-500 hover:border-rose-100 transition-all">
                            <FiX size={16} />
                        </button>
                    </div>

                    {modalLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-3">
                            <FiRefreshCw className="animate-spin text-amber-500" size={24} />
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Syncing review status...</span>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
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

                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest px-1 block">Comment Feedback</label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    rows={4}
                                    required
                                    placeholder="Describe phlebotomist safety, collection punctuality, or speed of lab report..."
                                    className="w-full bg-slate-50 border-none rounded-2xl p-4 text-xs font-semibold outline-none ring-1 ring-slate-100 focus:ring-indigo-500 transition-all placeholder:text-slate-400 resize-none"
                                />
                            </div>

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

    // --- MODAL: ORDER DETAILS & LIVE TIMELINE ---
    const LabDetailsModal = ({ data, trackingData, onClose }) => {
        const [review, setReview] = useState(null);
        const [reviewLoading, setReviewLoading] = useState(false);

        const currentData = trackingData || data;
        const targetOtp = currentData.pickupOtp || currentData.tracking?.otp;
        const pendingPayment = isPendingPayment(currentData);

        useEffect(() => {
            const loadReview = async () => {
                if (data?.status === "Completed" && data?._id) {
                    setReviewLoading(true);
                    try {
                        const res = await UserAPI.getReviewsByOrder(data._id);
                        if (res && res.success && res.hasReviewed) {
                            setReview(res.data);
                        }
                    } catch (err) {
                        console.error("Failed to fetch review in details modal:", err);
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
                <div
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity duration-300"
                    onClick={onClose}
                />

                <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] md:rounded-[3.5rem] shadow-[0_30px_80px_-15px_rgba(0,0,0,0.5)] overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 fade-in duration-300">
                    {/* Header */}
                    <div className="p-6 md:p-8 border-b flex justify-between items-center bg-slate-50/30 shrink-0">
                        <div className="flex items-center gap-3">
                            <span className="bg-indigo-600 text-white p-2.5 rounded-2xl shrink-0 shadow-lg shadow-indigo-100">
                                <FiActivity size={20} />
                            </span>
                            <div>
                                <h3 className="font-black text-slate-900 text-sm md:text-base uppercase tracking-widest font-mono">#{data.bookingId}</h3>
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
                    <div className="p-6 md:p-10 overflow-y-auto custom-scrollbar space-y-6 flex-1">
                        {/* Status Tracker & Timeline Card */}
                        <div className="bg-slate-900 rounded-[2rem] p-6 md:p-8 text-white relative overflow-hidden">
                            <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Order Progress</p>
                                    <h2 className="text-2xl md:text-3xl font-black mt-0.5">{currentData.status}</h2>
                                </div>
                                <div className="flex flex-wrap gap-1.5 items-center">
                                    <LabModeBadge deliveryMode={currentData.deliveryMode} collectionType={currentData.collectionType} />
                                    <LabPaymentBadge paymentStatus={currentData.paymentStatus} paymentMethod={currentData.paymentMethod} isCod={currentData.isCod} />
                                </div>
                            </div>

                            {/* OTP Box */}
                            {targetOtp && (
                                <div className="my-4 p-4 bg-indigo-500/20 rounded-2xl border border-indigo-400/30 flex items-center justify-between">
                                    <div>
                                        <p className="text-[9px] font-black uppercase text-indigo-300 tracking-wider">Sample Collection Security OTP</p>
                                        <p className="text-xs font-semibold text-slate-300">Share with phlebotomist upon arrival</p>
                                    </div>
                                    <span className="text-2xl font-black text-white tracking-[0.25em] font-mono bg-black/50 px-3.5 py-1.5 rounded-xl border border-indigo-400/30">
                                        {targetOtp}
                                    </span>
                                </div>
                            )}

                            {/* Timeline Stepper */}
                            <StatusStepper status={currentData.status} trackingTimeline={currentData.trackingTimeline} />

                            <div className="mt-4 flex flex-wrap gap-2 text-slate-300">
                                <div className="px-3 py-1.5 bg-white/10 rounded-lg text-[10px] font-bold flex items-center gap-1.5">
                                    <FiClock size={12} /> {currentData.formattedDate || (currentData.schedule?.date ? `${currentData.schedule.date}, ${currentData.schedule.timeSlot}` : new Date(currentData.createdAt || currentData.appointmentDate).toLocaleString())}
                                </div>
                                <div className="px-3 py-1.5 bg-white/10 rounded-lg text-[10px] font-bold flex items-center gap-1.5">
                                    <FiHome size={12} /> {currentData.collectionType || 'Home Collection'}
                                </div>
                            </div>
                        </div>

                        {/* Phlebotomist Details Card */}
                        {currentData.phlebotomist && (
                            <div className="p-5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-[2rem] border border-indigo-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-lg font-black shadow-md shadow-indigo-100 shrink-0">
                                        <FiUser size={22} />
                                    </div>
                                    <div>
                                        <span className="text-[9px] font-black uppercase tracking-wider text-indigo-600">Assigned Medical Phlebotomist</span>
                                        <h4 className="font-black text-slate-900 text-sm">{currentData.phlebotomist.name}</h4>
                                        <p className="text-[10px] font-bold text-slate-500">Verified Sample Collector</p>
                                    </div>
                                </div>
                                {currentData.phlebotomist.phone && (
                                    <a
                                        href={`tel:${currentData.phlebotomist.phone}`}
                                        className="p-3 bg-white text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-xl border border-indigo-200 transition-colors shadow-sm flex items-center gap-1 text-xs font-black"
                                    >
                                        <FiPhone size={14} /> Call
                                    </a>
                                )}
                            </div>
                        )}

                        {/* Included Tests & Packages */}
                        <div className="space-y-4">
                            <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Included Tests & Packages</h5>
                            <div className="grid grid-cols-1 gap-2.5">
                                {currentData.items && Array.isArray(currentData.items) ? (
                                    currentData.items.map((test, i) => (
                                        <div key={i} className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                            <div>
                                                <span className="font-bold text-slate-800 text-sm">{test.name}</span>
                                                {test.patientMultiplier > 1 && (
                                                    <span className="text-[10px] text-slate-400 block font-semibold">× {test.patientMultiplier} Patients</span>
                                                )}
                                            </div>
                                            <span className="font-black text-slate-900">₹{test.totalPrice || test.price}</span>
                                        </div>
                                    ))
                                ) : (
                                    <>
                                        {currentData.items?.tests?.map((test, i) => (
                                            <div key={i} className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                                <span className="font-bold text-slate-700 text-sm">{test.name}</span>
                                                <span className="font-black text-slate-900">₹{test.price}</span>
                                            </div>
                                        ))}
                                        {currentData.items?.packages?.map((pkg, i) => (
                                            <div key={i} className="flex justify-between items-center bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
                                                <span className="font-black text-indigo-700 text-sm">{pkg.name} <span className="text-[8px] uppercase ml-1 opacity-60">(Package)</span></span>
                                                <span className="font-black text-indigo-900">₹{pkg.price}</span>
                                            </div>
                                        ))}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Lab & Address Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                                <p className="text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest">Diagnostic Lab</p>
                                <div className="flex gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black shrink-0">
                                        <MdOutlineScience size={20} />
                                    </div>
                                    <div className="text-[12px] font-bold text-slate-600 leading-relaxed">
                                        <p className="text-slate-900 font-black mb-0.5">{getLabName(currentData)}</p>
                                        <p>{currentData.lab?.address || currentData.labId?.address || 'Sector 17'}</p>
                                        <p>{currentData.lab?.city || currentData.labId?.city || 'Chandigarh'}</p>
                                        {currentData.lab?.phone && (
                                            <p className="text-indigo-600 font-bold text-[11px] mt-1">📞 {currentData.lab.phone}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                                <p className="text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest">Collection Point</p>
                                <div className="flex gap-3">
                                    <FiMapPin className="text-indigo-500 shrink-0 mt-1" size={16} />
                                    <div className="text-[12px] font-bold text-slate-600 leading-relaxed">
                                        <p className="text-slate-900 font-black mb-1">{currentData.address?.name || "Patient"}</p>
                                        <p>{currentData.address?.houseNo}, {currentData.address?.sector}</p>
                                        <p>{currentData.address?.city}, {currentData.address?.pincode}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Dynamic Review Card */}
                        {data.status === "Completed" && (
                            <div className="space-y-4">
                                <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Submitted Feedback</h5>
                                {reviewLoading ? (
                                    <div className="flex items-center gap-2 bg-slate-50 p-6 rounded-[2rem] border border-slate-100 text-xs font-semibold text-slate-400">
                                        <FiRefreshCw className="animate-spin text-slate-400" size={14} />
                                        <span>Syncing your review...</span>
                                    </div>
                                ) : review ? (
                                    <div className="bg-amber-50/50 border border-amber-100/70 p-6 rounded-[2rem] space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[9px] font-black uppercase text-amber-600 tracking-wider flex items-center gap-1.5">
                                                <MdOutlineRateReview size={14} /> Verified Submission
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
                                    </div>
                                ) : (
                                    <div className="bg-slate-50 border border-slate-100 p-6 rounded-[2rem] text-center">
                                        <p className="text-xs font-bold text-slate-400">No review submitted yet.</p>
                                        <button 
                                            onClick={() => {
                                                onClose();
                                                setReviewModal({ isOpen: true, data: data });
                                            }}
                                            className="mt-2 text-[10px] font-black uppercase text-indigo-600 hover:text-indigo-700"
                                        >
                                            Add Feedback Now
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Bill Summary */}
                        <div className="bg-slate-900 text-white rounded-[2.5rem] p-8">
                            <div className="flex items-center gap-2 mb-6">
                                <FiCreditCard className="text-indigo-400" />
                                <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Financial Summary</h5>
                            </div>
                            <div className="space-y-3 text-xs font-bold border-b border-white/10 pb-6 mb-6">
                                <div className="flex justify-between text-slate-400">
                                    <span>Base Tests Total</span>
                                    <span>₹{currentData.billSummary?.baseTestsTotal || currentData.billSummary?.itemTotal || 0}</span>
                                </div>
                                {currentData.billSummary?.homeSampleCollectionCharge > 0 && (
                                    <div className="flex justify-between text-slate-400">
                                        <span>Home Sample Collection</span>
                                        <span>₹{currentData.billSummary?.homeSampleCollectionCharge}</span>
                                    </div>
                                )}
                                {currentData.billSummary?.fastReportCharge > 0 && (
                                    <div className="flex justify-between text-amber-400">
                                        <span>Fast Express Report</span>
                                        <span>+ ₹{currentData.billSummary?.fastReportCharge}</span>
                                    </div>
                                )}
                                {currentData.billSummary?.couponDiscount > 0 && (
                                    <div className="flex justify-between text-rose-400">
                                        <span>Coupon Applied</span>
                                        <span>- ₹{currentData.billSummary?.couponDiscount}</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">Total Amount</p>
                                    <p className="text-3xl font-black">₹{currentData.billSummary?.totalAmount}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Payment Status</p>
                                    <p className="text-xs font-black text-emerald-400 uppercase mt-1 flex items-center gap-1.5 justify-end">
                                        <FiCheckCircle /> {currentData.paymentStatus || "Paid"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="p-6 md:p-8 bg-slate-50/50 border-t flex flex-wrap gap-3 shrink-0">
                        {pendingPayment && (
                            <button 
                                disabled={retryingId === (data.bookingId || data._id)}
                                onClick={() => {
                                    onClose();
                                    handleRetryPayment(data);
                                }}
                                className="flex-1 py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-amber-100 flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50"
                            >
                                <FiAlertCircle size={16} /> ⚠️ Payment Incomplete - Pay Now
                            </button>
                        )}

                        {data.status === "Completed" && (
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
                        
                        {data.reportFile && (
                            <a 
                                href={getReportFileUrl(data.reportFile)}
                                download={`report-${data.bookingId}.pdf`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 active:scale-[0.98] transition-all text-center"
                            >
                                <FiDownload size={16} /> Download Digital Report
                            </a>
                        )}

                        <button 
                            onClick={onClose}
                            className="flex-1 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
                        >
                            Close
                        </button>
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
                    <h3 className="font-black text-slate-900 text-lg md:text-xl tracking-tight">Diagnostic Lab Records</h3>
                    <p className="text-slate-400 text-[9px] md:text-[10px] font-bold uppercase tracking-widest mt-1">Total {pagination.totalCount} Bookings</p>
                </div>
                <div className="relative w-full sm:w-72">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Search Booking ID..." className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-11 pr-4 text-xs md:text-sm font-semibold outline-none ring-1 ring-slate-100 focus:ring-indigo-500 transition-all" />
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
                        {/* Desktop Clean Uniform Table */}
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="w-full text-left border-collapse table-auto">
                                <thead>
                                    <tr className="bg-slate-50/70 border-b border-slate-100">
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Booking ID</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Tests & Lab</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Schedule Date</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Bill & Payment</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Status</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {orders.map((order) => {
                                        const pendingPayment = isPendingPayment(order);

                                        return (
                                            <tr key={order._id || order.bookingId} className="hover:bg-slate-50/80 transition-colors">
                                                {/* Column 1: Booking ID */}
                                                <td className="px-6 py-5 align-middle">
                                                    <div className="flex flex-col gap-1 items-start">
                                                        <span className="text-xs font-black text-slate-900 tracking-wider font-mono">
                                                            #{order.bookingId}
                                                        </span>
                                                        <LabModeBadge deliveryMode={order.deliveryMode} collectionType={order.collectionType} />
                                                    </div>
                                                </td>

                                                {/* Column 2: Tests & Lab */}
                                                <td className="px-6 py-5 align-middle">
                                                    <div className="flex items-center gap-3.5">
                                                        <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xs shrink-0 border border-indigo-100/80">
                                                            <MdOutlineScience size={16} />
                                                        </div>
                                                        <div className="max-w-[210px]">
                                                            <p className="text-xs font-black text-slate-800 truncate leading-snug">{getItemsSummary(order)}</p>
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-0.5">{getLabName(order)} • {getItemsCount(order)} Item(s)</p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Column 3: Date & Slot */}
                                                <td className="px-6 py-5 align-middle">
                                                    <div className="flex flex-col text-xs font-bold text-slate-700">
                                                        <span>{order.formattedDate || (order.schedule?.formattedDate || new Date(order.createdAt || order.appointmentDate).toLocaleDateString())}</span>
                                                        <span className="text-[10px] font-medium text-slate-400 mt-0.5">
                                                            {order.schedule?.timeSlot || order.appointmentTime || "09:00 AM - 11:00 AM"}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Column 4: Bill & Payment */}
                                                <td className="px-6 py-5 align-middle">
                                                    <div className="flex flex-col gap-1 items-start">
                                                        <span className="text-sm font-black text-slate-900">₹{order.billSummary?.totalAmount}</span>
                                                        <LabPaymentBadge paymentStatus={order.paymentStatus} paymentMethod={order.paymentMethod} isCod={order.isCod} />
                                                    </div>
                                                </td>

                                                {/* Column 5: Status */}
                                                <td className="px-6 py-5 align-middle text-center">
                                                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border whitespace-nowrap ${getStatusStyles(order.status)}`}>
                                                        {order.status}
                                                    </span>
                                                </td>

                                                {/* Column 6: Actions */}
                                                <td className="px-6 py-5 align-middle text-right">
                                                    <div className="inline-flex items-center justify-end gap-2 whitespace-nowrap">
                                                        {/* RETRY PAYMENT ACTION */}
                                                        {pendingPayment && (
                                                            <button 
                                                                disabled={retryingId === (order.bookingId || order._id)}
                                                                onClick={() => handleRetryPayment(order)}
                                                                className="h-8 px-3 rounded-xl text-[10px] font-black uppercase bg-amber-500 hover:bg-amber-600 text-white transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                                                                title="Retry pending payment"
                                                            >
                                                                {retryingId === (order.bookingId || order._id) ? (
                                                                    <FiRefreshCw className="animate-spin" size={11} />
                                                                ) : (
                                                                    <FiAlertCircle size={11} />
                                                                )}
                                                                Pay Now
                                                            </button>
                                                        )}

                                                        {order.status === "Completed" && (
                                                            <button 
                                                                onClick={() => setReviewModal({ isOpen: true, data: order })} 
                                                                className="h-8 px-3 rounded-xl text-[10px] font-black uppercase bg-amber-500 hover:bg-amber-600 text-white transition-all flex items-center gap-1 shadow-sm"
                                                            >
                                                                <FiStar size={11} /> Rate
                                                            </button>
                                                        )}
                                                        <button 
                                                            onClick={() => handleOpenDetails(order)} 
                                                            className="h-8 px-3.5 rounded-xl text-[10px] font-black uppercase border border-slate-200 bg-white text-slate-700 hover:bg-slate-900 hover:text-white transition-all"
                                                        >
                                                            Track / Details
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="block lg:hidden divide-y divide-slate-100 px-4">
                            {orders.map((order) => {
                                const pendingPayment = isPendingPayment(order);

                                return (
                                    <div key={order._id || order.bookingId} className="py-5 flex flex-col gap-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <span className="text-[10px] font-black text-slate-400 tracking-wider">#{order.bookingId}</span>
                                                <h4 className="text-sm font-black text-slate-800 line-clamp-1 mt-0.5">{getItemsSummary(order)}</h4>
                                                <p className="text-[10px] font-bold text-slate-400">{getLabName(order)} • {getItemsCount(order)} Item(s)</p>
                                            </div>
                                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase ${getStatusStyles(order.status)}`}>{order.status}</span>
                                        </div>

                                        <div className="flex flex-wrap gap-1.5 items-center">
                                            <LabPaymentBadge paymentStatus={order.paymentStatus} paymentMethod={order.paymentMethod} isCod={order.isCod} />
                                            <LabModeBadge deliveryMode={order.deliveryMode} collectionType={order.collectionType} />
                                        </div>

                                        <div className="flex justify-between items-center text-xs font-bold text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                                            <span>{order.formattedDate || new Date(order.createdAt || order.appointmentDate).toLocaleDateString()}</span>
                                            <span className="text-sm font-black text-slate-900">Total: ₹{order.billSummary?.totalAmount}</span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 pt-1">
                                            {pendingPayment && (
                                                <button 
                                                    disabled={retryingId === (order.bookingId || order._id)}
                                                    onClick={() => handleRetryPayment(order)} 
                                                    className="w-full bg-amber-500 hover:bg-amber-600 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-center text-white flex items-center justify-center gap-1.5 shadow-md shadow-amber-100 disabled:opacity-50 col-span-2 sm:col-span-1"
                                                >
                                                    {retryingId === (order.bookingId || order._id) ? (
                                                        <FiRefreshCw className="animate-spin" size={12} />
                                                    ) : (
                                                        <FiAlertCircle size={12} />
                                                    )}
                                                    ⚠️ Pay Now
                                                </button>
                                            )}

                                            {order.status === "Completed" && (
                                                <button 
                                                    onClick={() => setReviewModal({ isOpen: true, data: order })} 
                                                    className="w-full bg-amber-500 hover:bg-amber-600 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-center text-white flex items-center justify-center gap-1 shadow-sm"
                                                >
                                                    <FiStar size={11} /> Rate
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => handleOpenDetails(order)} 
                                                className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-center border border-slate-200 bg-white ${
                                                    order.status !== "Completed" && !pendingPayment ? "col-span-2" : ""
                                                }`}
                                            >
                                                Track / Details
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
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

            {/* Modals */}
            {modal.isOpen && modal.data && (
                <LabDetailsModal
                    data={modal.data}
                    trackingData={modal.trackingData}
                    onClose={() => setModal({ isOpen: false, data: null, trackingData: null })}
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