"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import UserAPI from '@/app/services/UserAPI';

import {
    FiX, FiStar, FiArrowLeft, FiClock,
    FiUser, FiSearch, FiMapPin, FiLoader,
    FiCheck, FiDollarSign, FiTrash2, FiCheckCircle,
    FiPhone, FiZap, FiAlertTriangle, FiAlertCircle,
    FiCalendar, FiImage, FiFileText, FiExternalLink,
    FiKey
} from 'react-icons/fi';
import { MdVerified, MdOutlineMedicalServices, MdLocalHospital, MdReceipt } from 'react-icons/md';

// Dynamic image path builder
const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://images.unsplash.com/photo-1594824813576-a192f15b5f25?auto=format&fit=crop&w=400&q=80';
    if (imagePath.startsWith('http')) return imagePath;
    const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5002';
    const cleanPath = imagePath.replace(/^public\//, "");
    return `${BASE_URL}/${cleanPath}`;
};

// Dynamically load Razorpay SDK
const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        if (typeof window !== "undefined" && window.Razorpay) {
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

const COMMON_CANCEL_REASONS = [
    "Patient discharged early from hospital",
    "Emergency resolved / Patient recovered",
    "Booked by mistake / Change of plans",
    "Nurse delayed / Timing conflict",
    "Patient discharged from home care early",
    "Other personal reasons"
];

// --- SUB-COMPONENT: DELIVERY MODE BADGE ---
const NurseModeBadge = ({ order }) => {
    const isExpress = order.isFasterService || order.priceBreakdown?.fasterServiceCharge > 0;

    if (isExpress) {
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 font-bold rounded-md text-[10px] whitespace-nowrap">
                <FiZap size={10} className="text-amber-500 fill-amber-500 shrink-0" />
                Express 1-Hr
            </span>
        );
    }

    if (order.assessmentLocation === "At Hospital" || order.hospitalDetails) {
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 font-bold rounded-md text-[10px] whitespace-nowrap">
                <MdLocalHospital size={11} className="shrink-0 text-purple-600" />
                Hospital Bedside
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold rounded-md text-[10px] whitespace-nowrap">
            <FiUser size={10} className="shrink-0" />
            {order.serviceDetails?.duration || "Home Visit"}
        </span>
    );
};

// --- SUB-COMPONENT: PAYMENT STATUS BADGE ---
const NursePaymentBadge = ({ order }) => {
    const isCod = order.isCod === true || order.paymentMethod === 'COD';
    const isPaid = order.isPaid === true || order.paymentStatus === 'Paid';
    const isRefundInitiated = order.paymentStatus === 'Refund-Initiated';

    if (isRefundInitiated) {
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold rounded-md text-[10px] whitespace-nowrap">
                <FiDollarSign size={11} className="shrink-0 text-indigo-600" /> Refund Initiated
            </span>
        );
    }

    if (isCod) {
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 font-bold rounded-md text-[10px] whitespace-nowrap">
                💵 {order.paymentDisplayLabel || "Cash on Delivery (Pay on Visit)"}
            </span>
        );
    }

    if (isPaid) {
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold rounded-md text-[10px] whitespace-nowrap">
                <FiCheckCircle size={11} className="shrink-0 text-emerald-600" /> {order.paymentDisplayLabel || "Paid Online"}
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-rose-50 text-rose-600 border border-rose-200 font-bold rounded-md text-[10px] whitespace-nowrap">
            <FiAlertTriangle size={11} className="shrink-0 text-rose-500" /> {order.paymentDisplayLabel || "Payment Pending"}
        </span>
    );
};

// --- SUB-COMPONENT: TRACKER & LIVE TIMELINE ---
const StatusStepper = ({ status, trackingTimeline }) => {
    if (status === 'Cancelled' || trackingTimeline?.isCancelled) {
        return (
            <div className="w-full py-4 bg-rose-50 border border-rose-100 rounded-2xl p-4 flex items-center justify-between text-rose-700 animate-fadeIn">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                        <FiX size={16} />
                    </div>
                    <div>
                        <p className="text-xs font-black uppercase tracking-wider">Booking Cancelled</p>
                        <p className="text-[10px] font-semibold text-rose-500">This clinical care booking was cancelled.</p>
                    </div>
                </div>
            </div>
        );
    }

    const steps = [
        { label: "Pending", isDone: Boolean(trackingTimeline?.isPending || true) },
        { label: "Confirmed", isDone: Boolean(trackingTimeline?.isConfirmed || status !== "Pending") },
        { label: "Assigned", isDone: Boolean(trackingTimeline?.isAssigned || ["Assigned", "On-The-Way", "Arrived", "Service-Started", "Completed"].includes(status)) },
        { label: "On-The-Way", isDone: Boolean(trackingTimeline?.isOnWay || ["On-The-Way", "Arrived", "Service-Started", "Completed"].includes(status)) },
        { label: "Arrived", isDone: Boolean(trackingTimeline?.isArrived || ["Arrived", "Service-Started", "Completed"].includes(status)) },
        { label: "In-Service", isDone: Boolean(trackingTimeline?.isStarted || ["Service-Started", "Completed"].includes(status)) },
        { label: "Completed", isDone: Boolean(trackingTimeline?.isCompleted || status === "Completed") }
    ];

    const statusMap = {
        "Pending": 0,
        "Confirmed": 1,
        "Assigned": 2,
        "On-The-Way": 3,
        "Arrived": 4,
        "Service-Started": 5,
        "Completed": 6
    };
    const currentStep = statusMap[status] ?? 0;

    return (
        <div className="w-full py-4 md:py-8 px-1 md:px-2">
            <div className="relative flex items-center justify-between">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-800 -z-0"></div>
                <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-[#08B36A] transition-all duration-700 z-10"
                    style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                ></div>
                {steps.map((step, index) => {
                    const isDone = index <= currentStep || step.isDone;
                    return (
                        <div key={step.label} className="flex flex-col items-center gap-1.5 md:gap-2 relative z-20">
                            <div className={`w-3 h-3 md:w-3.5 md:h-3.5 rounded-full border-2 transition-all duration-500 ${
                                isDone ? "bg-[#08B36A] border-emerald-300 ring-2 md:ring-4 ring-emerald-900/50" : "bg-slate-800 border-slate-600"
                            }`}></div>
                            <span className={`text-[7.5px] md:text-[8.5px] font-black uppercase tracking-tighter whitespace-nowrap ${
                                isDone ? "text-emerald-400" : "text-slate-500"
                            }`}>{step.label}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// --- SUB-COMPONENT: STAR RATING ---
const StarRating = ({
    title,
    onBack,
    onSubmit,
    rating,
    setRating,
    comment,
    setComment,
    existingReview,
    submitting
}) => {
    const [hover, setHover] = useState(0);

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

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-center py-4 md:py-6">
            <button
                disabled={submitting}
                onClick={onBack}
                className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase mb-6 md:mb-8 hover:text-[#08B36A] transition-colors mx-auto disabled:opacity-50 cursor-pointer"
            >
                <FiArrowLeft /> Back to Details
            </button>
            <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-2 tracking-tight">
                {existingReview ? "Edit Your Review" : "Rate Nurse Service"}
            </h3>
            <p className="text-slate-500 text-xs md:text-sm mb-6 md:mb-8 font-medium">
                How was your clinical session with {title}?
            </p>
            <div className="flex flex-col items-center justify-center gap-2 p-5 bg-slate-50 rounded-2xl border border-slate-100 max-w-md mx-auto mb-6">
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Tap to Rate Stars</span>
                <div className="flex justify-center gap-2.5 md:gap-4">
                    {[1, 2, 3, 4, 5].map((s) => (
                        <button
                            type="button"
                            disabled={submitting}
                            key={s}
                            onMouseEnter={() => setHover(s)}
                            onMouseLeave={() => setHover(0)}
                            onClick={() => setRating(s)}
                            className="transform transition-transform active:scale-90 disabled:opacity-50 hover:scale-110 cursor-pointer"
                        >
                            <FiStar className={`${(hover || rating) >= s ? "fill-amber-400 text-amber-400 drop-shadow-md" : "text-slate-200"} transition-all size-8 sm:size-10 md:size-11`} />
                        </button>
                    ))}
                </div>
                <span className="text-xs font-bold text-slate-600 mt-1 transition-all duration-300">
                    {getRatingLabel(hover || rating)}
                </span>
            </div>

            <div className="mb-6 max-w-md mx-auto text-left">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block pl-1">
                    Review Comment (Optional)
                </label>
                <textarea
                    disabled={submitting}
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Describe staff nurse punctuality, hygiene, clinical skill..."
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 text-xs md:text-sm font-semibold outline-none ring-1 ring-slate-100 focus:ring-[#08B36A] transition-all resize-none"
                />
            </div>

            <button
                disabled={rating === 0 || submitting}
                onClick={() => onSubmit(rating, comment)}
                className={`w-full py-4 md:py-5 rounded-xl md:rounded-[24px] font-black text-[10px] md:text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    rating > 0 && !submitting
                        ? "bg-[#08B36A] hover:bg-[#079c5c] text-white shadow-xl shadow-[#08B36A]/20"
                        : "bg-slate-100 text-slate-400 cursor-not-allowed"
                }`}
            >
                {submitting ? (
                    <>
                        <FiLoader className="animate-spin" size={14} />
                        <span>Saving Review...</span>
                    </>
                ) : (
                    <span>{existingReview ? "Update Review" : "Submit Review"}</span>
                )}
            </button>
        </div>
    );
};

function NursingOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalCount: 0 });
    const [searchTerm, setSearchTerm] = useState("");
    const [modal, setModal] = useState({ isOpen: false, type: 'details', data: null, trackingData: null });
    const [retryingId, setRetryingId] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [mounted, setMounted] = useState(false);

    // Review & Ratings States
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [existingReview, setExistingReview] = useState(null);
    const [submittingReview, setSubmittingReview] = useState(false);

    // Cancellation UI States
    const [cancelModal, setCancelModal] = useState({ isOpen: false, booking: null });
    const [cancelReason, setCancelReason] = useState(COMMON_CANCEL_REASONS[0]);
    const [customCancelReason, setCustomCancelReason] = useState("");
    const [cancelling, setCancelling] = useState(false);
    const [cancellationResult, setCancellationResult] = useState(null);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useEffect(() => {
        if (modal.isOpen || cancelModal.isOpen || cancellationResult || previewImage) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [modal.isOpen, cancelModal.isOpen, cancellationResult, previewImage]);

    // 1. Fetch Orders Data
    const fetchOrders = useCallback(async (page = 1) => {
        try {
            setLoading(true);
            const response = await UserAPI.getNursingBookings(page, 20);
            if (response && response.success) {
                setOrders(response.data || []);
                setPagination({
                    currentPage: response.currentPage || 1,
                    totalPages: response.totalPages || 1,
                    totalCount: response.totalRecords ?? response.count ?? (response.data ? response.data.length : 0)
                });
            }
        } catch (error) {
            console.error("Error loading nursing bookings:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    // 2. Open Live Details & Tracking Modal (Calls GET /user/nurse/track/:id)
    const handleOpenDetails = async (order) => {
        setModal({ isOpen: true, type: 'details', data: order, trackingData: null });
        try {
            const targetId = order._id || order.bookingId;
            const res = await UserAPI.getNurseTracking(targetId);
            if (res && res.success && res.data) {
                setModal({ isOpen: true, type: 'details', data: { ...order, ...res.data }, trackingData: res.data });
            }
        } catch (e) {
            console.warn("Nurse tracking fetch fallback:", e);
        }
    };

    // 3. Retry Payment Handler
    const handleRetryPayment = async (order) => {
        const appointmentId = order._id || order.appointmentId;
        const targetBookingId = order.bookingId || order._id;
        setRetryingId(appointmentId);

        try {
            const res = await UserAPI.retryPaymentNurse({
                appointmentId: appointmentId,
                bookingId: targetBookingId
            });

            if (res && res.success) {
                const isLoaded = await loadRazorpayScript();
                if (!isLoaded) {
                    alert("Razorpay SDK failed to load. Please check internet connection.");
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
                    currency: res.currency || "INR",
                    name: "Health Kangaroo Nursing Care",
                    description: `Payment for Nurse Booking #${res.bookingId || targetBookingId}`,
                    order_id: res.razorpayOrderId,
                    handler: async function (razorpayResponse) {
                        try {
                            const verifyPayload = {
                                appointmentId: res.appointmentId || appointmentId,
                                razorpayOrderId: razorpayResponse.razorpay_order_id || res.razorpayOrderId,
                                razorpayPaymentId: razorpayResponse.razorpay_payment_id,
                                razorpaySignature: razorpayResponse.razorpay_signature
                            };

                            const verifyRes = await UserAPI.verifyPaymentNurse(verifyPayload);

                            if (verifyRes && verifyRes.success) {
                                alert(verifyRes.message || "Payment verified successfully. Booking is now Confirmed!");
                                fetchOrders();
                            } else {
                                alert(verifyRes?.message || "Payment verification failed.");
                            }
                        } catch (err) {
                            console.error("Payment verification error:", err);
                            alert("Error verifying payment with server.");
                        }
                    },
                    theme: {
                        color: "#FF8A00"
                    }
                };

                const rzp = new window.Razorpay(options);
                rzp.on('payment.failed', function (response) {
                    alert(response.error?.description || "Payment failed. Please try again.");
                });
                rzp.open();
            } else {
                alert(res?.message || "Failed to initialize payment retry.");
            }
        } catch (error) {
            console.error("Retry nurse payment error:", error);
            alert("Failed to initiate payment retry.");
        } finally {
            setRetryingId(null);
        }
    };

    // Review Submit
    const handleReviewSubmit = async (selectedRating, selectedComment) => {
        if (!modal.data) return;
        try {
            setSubmittingReview(true);
            let response;
            if (existingReview) {
                response = await UserAPI.updateReview(modal.data._id, {
                    rating: selectedRating,
                    comment: selectedComment
                });
            } else {
                response = await UserAPI.addRatingAndReviewNurse({
                    bookingId: modal.data._id,
                    nurseId: modal.data.nurseId?._id || modal.data.nurseBureau?.id,
                    rating: selectedRating,
                    comment: selectedComment
                });
            }

            if (response.success) {
                alert(response.message || "Review submitted successfully!");
                setModal({ isOpen: false, type: 'details', data: null, trackingData: null });
                fetchOrders();
            } else {
                alert(response.message || "Failed to process review.");
            }
        } catch (error) {
            console.error("Error submitting review:", error);
            alert("Something went wrong during review processing.");
        } finally {
            setSubmittingReview(false);
        }
    };

    const openCancelDialog = (booking) => {
        setCancelModal({ isOpen: true, booking });
        setCancelReason(COMMON_CANCEL_REASONS[0]);
        setCustomCancelReason("");
    };

    // 4. Cancellation Handler (Aligned with PATCH /user/nurse/cancel/:id)
    const handleConfirmCancellation = async () => {
        if (!cancelModal.booking?._id) return;
        const finalReason = customCancelReason.trim() || cancelReason;

        try {
            setCancelling(true);
            const response = await UserAPI.cancelNurseBooking(cancelModal.booking._id, finalReason);
            
            if (response?.success) {
                const resData = response.data || {};
                const bookingObj = resData.booking || {};

                setCancellationResult({
                    message: response.message || "Booking cancelled successfully.",
                    bookingId: bookingObj.bookingId || cancelModal.booking.bookingId,
                    status: bookingObj.status || "Cancelled",
                    paymentStatus: bookingObj.paymentStatus || "Refund-Initiated",
                    cancellationFee: resData.cancellationFee ?? 0,
                    refundAmount: resData.refundAmount ?? (cancelModal.booking.totalAmount || cancelModal.booking.totalPrice || 0),
                    completedSessionsCount: resData.completedSessionsCount ?? 0
                });

                // Update orders state
                setOrders(prev => prev.map(o => o._id === cancelModal.booking._id ? { 
                    ...o, 
                    status: 'Cancelled',
                    paymentStatus: bookingObj.paymentStatus || 'Refund-Initiated'
                } : o));

                if (modal.data?._id === cancelModal.booking._id) {
                    setModal(prev => ({ 
                        ...prev, 
                        data: { 
                            ...prev.data, 
                            status: 'Cancelled',
                            paymentStatus: bookingObj.paymentStatus || 'Refund-Initiated'
                        } 
                    }));
                }

                setCancelModal({ isOpen: false, booking: null });
            } else {
                alert(response?.message || "Cancellation failed. Please check status.");
            }
        } catch (error) {
            console.error("Cancellation Error:", error);
            alert(error.response?.data?.message || "Failed to process cancellation.");
        } finally {
            setCancelling(false);
        }
    };

    const getNurseBureauName = (order) => {
        return order.nurseId?.name || order.nurseBureau?.name || "Care Nursing Bureau";
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Confirmed': return 'text-blue-700 bg-blue-50 border border-blue-200';
            case 'Assigned': return 'text-indigo-700 bg-indigo-50 border border-indigo-200';
            case 'On-The-Way': return 'text-violet-700 bg-violet-50 border border-violet-200';
            case 'Arrived': return 'text-teal-700 bg-teal-50 border border-teal-200';
            case 'Service-Started': return 'text-sky-700 bg-sky-50 border border-sky-200';
            case 'Completed': return 'text-emerald-700 bg-emerald-50 border border-emerald-200';
            case 'Cancelled': return 'text-rose-700 bg-rose-50 border border-rose-200';
            case 'Pending': 
            default: return 'text-amber-700 bg-amber-50 border border-amber-200';
        }
    };

    const filteredOrders = orders.filter(order =>
        order.bookingId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getNurseBureauName(order).toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.primaryPatientName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // --- DETAILS MODAL PORTAL ---
    const NursingDetailsModal = ({ data, trackingData, type, onClose }) => {
        if (!mounted) return null;

        const currentData = trackingData || data;
        const isCancellable = Boolean(currentData.canCancel ?? ["Pending", "Confirmed", "Assigned", "On-The-Way", "Arrived"].includes(currentData.status));
        const assignedStaff = currentData.assignedStaffId || currentData.assignedStaff;
        const pendingPayment = Boolean(currentData.canPayOnline);
        const isHospital = currentData.assessmentLocation === "At Hospital" || Boolean(currentData.hospitalDetails);
        const activeTravelFee = currentData.deliveryCharge ?? currentData.travelFee ?? currentData.priceBreakdown?.deliveryCharge ?? currentData.priceBreakdown?.travelFee ?? 0;
        
        const progressPhotos = currentData.progressPhotos || [];
        const hasProgressPhotos = Boolean(currentData.hasProgressPhotos || progressPhotos.length > 0);
        const handmadeInvoice = currentData.handmadeInvoice;
        const hasHandmadeInvoice = Boolean(currentData.hasHandmadeInvoice || handmadeInvoice);
        const dailySessions = currentData.dailySessions || [];
        const serviceNotes = currentData.serviceNotes;

        const status = currentData.status;
        const startOTP = currentData.serviceOTP;
        const endOTP = currentData.completionOTP;

        return createPortal(
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 md:p-6">
                <div
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity duration-300"
                    onClick={onClose}
                />

                <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] md:rounded-[3.5rem] shadow-[0_30px_80px_-15px_rgba(0,0,0,0.5)] overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 fade-in duration-300">

                    {/* Header */}
                    <div className="p-6 md:p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-[#08B36A] shrink-0 shadow-sm border border-emerald-100">
                                <MdOutlineMedicalServices size={20} />
                            </div>
                            <div>
                                <h3 className="font-black text-slate-900 text-sm md:text-base tracking-tight uppercase font-mono">#{currentData.bookingId}</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    Patient: {currentData.primaryPatientName || currentData.patients?.[0]?.name || "Care File"}
                                </p>
                            </div>
                        </div>
                        <button
                            disabled={submittingReview}
                            onClick={onClose}
                            className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-100 rounded-full transition-all text-slate-400 shrink-0 shadow-sm disabled:opacity-50 cursor-pointer"
                        >
                            <FiX size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
                        {type === 'details' ? (
                            <div className="space-y-6">
                                
                                {/* Status Card & Live Timeline */}
                                <div className="bg-slate-900 rounded-[2rem] p-6 md:p-8 text-white relative overflow-hidden">
                                    <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Order Progress</p>
                                            <h2 className="text-2xl md:text-3xl font-black mt-0.5">{currentData.status}</h2>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5 items-center">
                                            <NurseModeBadge order={currentData} />
                                            <NursePaymentBadge order={currentData} />
                                        </div>
                                    </div>

                                    {/* DYNAMIC OTP DISPLAY */}
                                    {status === "Arrived" && startOTP && (
                                        <div className="my-4 p-4 bg-gradient-to-r from-emerald-500/30 to-teal-500/30 rounded-2xl border-2 border-dashed border-[#08B36A] flex items-center justify-between">
                                            <div>
                                                <p className="text-[10px] font-black uppercase text-emerald-300 tracking-wider">Start Service OTP</p>
                                                <p className="text-xs text-white font-bold">Share OTP with nurse to start session</p>
                                            </div>
                                            <span className="text-3xl font-black text-[#08B36A] bg-white px-4 py-1 rounded-xl shadow-md font-mono tracking-widest">
                                                {startOTP}
                                            </span>
                                        </div>
                                    )}

                                    {status === "Service-Started" && (
                                        <div className="my-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                            <div className="p-3 bg-white/10 rounded-2xl border border-white/20 flex items-center justify-between">
                                                <div>
                                                    <p className="text-[9px] font-black uppercase text-slate-300">Start OTP Verified</p>
                                                    <p className="text-xs font-bold text-[#08B36A]">Session in Progress</p>
                                                </div>
                                                <span className="text-lg font-black font-mono text-slate-300">
                                                    {startOTP || "Done"}
                                                </span>
                                            </div>
                                            {endOTP && (
                                                <div className="p-3 bg-emerald-500/20 rounded-2xl border border-emerald-400/30 flex items-center justify-between">
                                                    <div>
                                                        <p className="text-[9px] font-black uppercase text-emerald-300">Completion OTP</p>
                                                        <p className="text-[11px] text-slate-300 font-semibold">Share once finished</p>
                                                    </div>
                                                    <span className="text-xl font-black text-emerald-400 font-mono bg-black/50 px-3 py-1 rounded-xl border border-emerald-400/30">
                                                        {endOTP}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {["Assigned", "On-The-Way"].includes(status) && (
                                        <div className="my-3 p-3 bg-white/10 rounded-2xl border border-white/10 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="w-2.5 h-2.5 rounded-full bg-[#08B36A] animate-ping" />
                                                <p className="text-xs font-bold text-slate-200">Nurse is on the way to your location</p>
                                            </div>
                                            {startOTP && (
                                                <span className="text-xs font-bold font-mono text-slate-400">
                                                    OTP: <strong className="text-white">{startOTP}</strong>
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {["Pending", "Confirmed"].includes(status) && (
                                        <div className="my-3 p-3 bg-white/10 rounded-2xl border border-white/10 flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                                            <p className="text-xs font-bold text-slate-300">Waiting for clinical nurse assignment</p>
                                        </div>
                                    )}

                                    {/* Stepper Timeline */}
                                    <StatusStepper status={currentData.status} trackingTimeline={currentData.trackingTimeline} />

                                    <div className="mt-4 flex flex-wrap gap-2 text-slate-300">
                                        <div className="px-3 py-1.5 bg-white/10 rounded-lg text-[10px] font-bold flex items-center gap-1.5">
                                            <FiClock size={12} /> {currentData.formattedScheduleDate || (currentData.schedule?.startDate ? new Date(currentData.schedule.startDate).toLocaleDateString() : 'Scheduled')} ({currentData.formattedScheduleTime || currentData.schedule?.startTime || '10:00 AM'})
                                        </div>
                                        <div className="px-3 py-1.5 bg-white/10 rounded-lg text-[10px] font-bold flex items-center gap-1.5">
                                            {isHospital ? <MdLocalHospital size={12} /> : <FiMapPin size={12} />} {currentData.destinationLabel || currentData.assessmentLocation || 'At Home'}
                                        </div>
                                    </div>
                                </div>

                                {/* HANDMADE INVOICE CARD */}
                                {hasHandmadeInvoice && handmadeInvoice && (
                                    <div className="p-5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-[2rem] border border-amber-200 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-xl shadow-md shadow-amber-500/20 shrink-0">
                                                <MdReceipt size={24} />
                                            </div>
                                            <div>
                                                <span className="text-[9px] font-black uppercase tracking-wider text-amber-700">Official Nurse Slip</span>
                                                <h4 className="font-black text-slate-900 text-sm">Handwritten Medical Invoice Slip</h4>
                                                <p className="text-[10px] font-bold text-slate-500">Issued directly by nurse on-site for consumables & services</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setPreviewImage(getImageUrl(handmadeInvoice))}
                                            className="px-4 py-2.5 bg-white hover:bg-amber-500 hover:text-white text-amber-800 rounded-xl border border-amber-300 font-black text-xs uppercase tracking-wider transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                                        >
                                            <FiExternalLink size={12} /> View Slip
                                        </button>
                                    </div>
                                )}

                                {/* CLINICAL PROGRESS PHOTOS GRID */}
                                {hasProgressPhotos && progressPhotos.length > 0 && (
                                    <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                                                <FiImage className="text-[#08B36A]" /> Care Session Photos ({progressPhotos.length})
                                            </h4>
                                            <span className="text-[10px] text-slate-400 font-bold">Tap photo to enlarge</span>
                                        </div>
                                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                            {progressPhotos.map((photoUrl, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() => setPreviewImage(getImageUrl(photoUrl))}
                                                    className="w-full h-24 rounded-2xl overflow-hidden border-2 border-white shadow-sm hover:scale-105 transition-transform bg-white relative group cursor-pointer"
                                                >
                                                    <img src={getImageUrl(photoUrl)} alt={`Session photo ${idx + 1}`} className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                                        <FiExternalLink size={16} />
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* GENERAL SERVICE NOTES */}
                                {serviceNotes && (
                                    <div className="p-5 bg-emerald-50/50 rounded-[2rem] border border-emerald-100 space-y-1">
                                        <h4 className="text-[10px] font-black uppercase tracking-wider text-[#08B36A] flex items-center gap-1.5">
                                            <FiFileText /> Nurse Remarks & Notes
                                        </h4>
                                        <p className="text-xs font-medium text-slate-700 leading-relaxed italic">
                                            "{serviceNotes}"
                                        </p>
                                    </div>
                                )}

                                {/* ASSIGNED STAFF NURSE PROFILE CARD */}
                                {assignedStaff && (
                                    <div className="p-5 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-[2rem] border border-emerald-100 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl bg-[#08B36A] text-white flex items-center justify-center text-lg font-black shadow-md shadow-emerald-600/20 shrink-0 overflow-hidden">
                                                {assignedStaff.profilePic ? (
                                                    <img src={getImageUrl(assignedStaff.profilePic)} alt={assignedStaff.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <FiUser size={22} />
                                                )}
                                            </div>
                                            <div>
                                                <span className="text-[9px] font-black uppercase tracking-wider text-[#08B36A] flex items-center gap-1">
                                                    <MdVerified /> Assigned Healthcare Staff
                                                </span>
                                                <h4 className="font-black text-slate-900 text-sm">{assignedStaff.name}</h4>
                                                <p className="text-[10px] font-bold text-slate-500 uppercase">
                                                    {assignedStaff.phone ? `Phone: ${assignedStaff.phone}` : 'Verified Clinical Staff'} • Status: {assignedStaff.status || 'Active'}
                                                </p>
                                            </div>
                                        </div>
                                        {assignedStaff.phone && (
                                            <a
                                                href={`tel:${assignedStaff.phone}`}
                                                className="p-3 bg-white text-[#08B36A] hover:bg-[#08B36A] hover:text-white rounded-xl border border-emerald-200 transition-colors shadow-sm flex items-center gap-1 text-xs font-black"
                                            >
                                                <FiPhone size={14} /> Call
                                            </a>
                                        )}
                                    </div>
                                )}

                                {/* DAILY SESSIONS & CARE LOGS SECTION */}
                                {dailySessions.length > 0 && (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                                <FiCalendar className="text-[#08B36A]" /> Daily Sessions & Clinical Notes ({dailySessions.length})
                                            </h4>
                                        </div>
                                        <div className="space-y-3">
                                            {dailySessions.map((session, sIdx) => (
                                                <div key={sIdx} className="p-5 bg-slate-50 rounded-[2rem] border border-slate-200/80 space-y-3">
                                                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
                                                        <div className="flex items-center gap-2">
                                                            <span className="px-2.5 py-1 bg-[#08B36A]/10 text-[#08B36A] font-black text-[10px] rounded-lg">
                                                                Session #{session.sessionNumber}
                                                            </span>
                                                            <span className="text-xs font-black text-slate-800">
                                                                {session.sessionDate ? new Date(session.sessionDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : `Visit #${session.sessionNumber}`}
                                                            </span>
                                                        </div>
                                                        {session.staffName && (
                                                            <span className="text-[10px] font-bold text-slate-500 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                                                                Nurse: <strong className="text-slate-800">{session.staffName}</strong>
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Timings */}
                                                    <div className="flex flex-wrap gap-4 text-[11px] font-bold text-slate-600">
                                                        {session.startedAt && (
                                                            <div className="flex items-center gap-1 text-emerald-700">
                                                                <FiClock size={12} /> Started: {new Date(session.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </div>
                                                        )}
                                                        {session.completedAt && (
                                                            <div className="flex items-center gap-1 text-slate-500">
                                                                <FiClock size={12} /> Ended: {new Date(session.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </div>
                                                        )}
                                                        {session.extraConsumablesCharges > 0 && (
                                                            <div className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                                                Consumables: ₹{session.extraConsumablesCharges}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Service Notes */}
                                                    {session.serviceNotes && (
                                                        <div className="p-3.5 bg-white rounded-xl border border-slate-200/60 text-xs font-medium text-slate-700 leading-relaxed flex items-start gap-2">
                                                            <FiFileText className="text-[#08B36A] shrink-0 mt-0.5" size={14} />
                                                            <div>
                                                                <strong className="text-slate-900 block text-[10px] uppercase tracking-wider mb-0.5">Clinical Remarks:</strong>
                                                                {session.serviceNotes}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Session Photos */}
                                                    {session.progressPhotos && session.progressPhotos.length > 0 && (
                                                        <div className="space-y-1.5 pt-1">
                                                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                                                                <FiImage size={12} /> Session Photos ({session.progressPhotos.length})
                                                            </p>
                                                            <div className="flex flex-wrap gap-2">
                                                                {session.progressPhotos.map((photo, pIdx) => (
                                                                    <button 
                                                                        key={pIdx} 
                                                                        type="button"
                                                                        onClick={() => setPreviewImage(getImageUrl(photo))}
                                                                        className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 bg-white block shadow-xs hover:scale-105 transition-transform cursor-pointer"
                                                                    >
                                                                        <img src={getImageUrl(photo)} alt="Session Progress" className="w-full h-full object-cover" />
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Bureau Profile & Schedule */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                                        <p className="text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest">Fulfilling Bureau</p>
                                        <div className="flex gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#08B36A] flex items-center justify-center font-black shrink-0">
                                                <MdOutlineMedicalServices size={20} />
                                            </div>
                                            <div className="text-[12px] font-bold text-slate-600 leading-relaxed">
                                                <p className="text-slate-900 font-black mb-0.5">{getNurseBureauName(currentData)}</p>
                                                <p>{currentData.nurseId?.speciality || currentData.serviceDetails?.title || 'General Nursing Care'}</p>
                                                <p>{currentData.nurseId?.city || 'Verified Health Provider'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                                        <p className="text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest">Schedule Timing</p>
                                        <div className="space-y-1 text-xs font-bold text-slate-700">
                                            <p className="text-slate-900 font-black">Date: {currentData.formattedScheduleDate || (currentData.schedule?.startDate ? new Date(currentData.schedule.startDate).toLocaleDateString() : 'Today')}</p>
                                            <p className="text-slate-500 font-semibold">Start Time: {currentData.formattedScheduleTime || currentData.schedule?.startTime || '10:00 AM'}</p>
                                            <p className="text-[#08B36A] uppercase text-[10px] font-black">{currentData.serviceDetails?.duration || currentData.schedule?.duration || 'One day One Time'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Financial Summary */}
                                <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white space-y-6">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 bg-white/10 rounded-xl text-[#08B36A]">
                                            <FiDollarSign size={18} />
                                        </div>
                                        <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Payment Invoice & Summary</h5>
                                    </div>
                                    <div className="space-y-3 text-xs font-bold border-b border-white/10 pb-6 mb-6">
                                        <div className="flex justify-between text-slate-400">
                                            <span>Base Service Fee</span>
                                            <span>₹{currentData.priceBreakdown?.baseServicePrice ?? currentData.serviceDetails?.basePrice ?? 0}</span>
                                        </div>
                                        {activeTravelFee > 0 && (
                                            <div className="flex justify-between text-slate-400">
                                                <span>Travel & Distance Fee</span>
                                                <span>+ ₹{activeTravelFee}</span>
                                            </div>
                                        )}
                                        {currentData.priceBreakdown?.consumableTotal > 0 && (
                                            <div className="flex justify-between text-slate-400">
                                                <span>Medical Consumables</span>
                                                <span>+ ₹{currentData.priceBreakdown.consumableTotal}</span>
                                            </div>
                                        )}
                                        {currentData.priceBreakdown?.fasterServiceCharge > 0 && (
                                            <div className="flex justify-between text-amber-400">
                                                <span>Express Rush Surcharge</span>
                                                <span>+ ₹{currentData.priceBreakdown.fasterServiceCharge}</span>
                                            </div>
                                        )}
                                        {currentData.priceBreakdown?.taxAmount > 0 && (
                                            <div className="flex justify-between text-slate-400">
                                                <span>Taxes & GST</span>
                                                <span>+ ₹{currentData.priceBreakdown.taxAmount}</span>
                                            </div>
                                        )}
                                        {currentData.priceBreakdown?.couponDiscount > 0 && (
                                            <div className="flex justify-between text-rose-400">
                                                <span>Coupon Discount</span>
                                                <span>- ₹{currentData.priceBreakdown.couponDiscount}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-[#08B36A] tracking-widest">Total Amount</p>
                                            <p className="text-3xl font-black">₹{currentData.totalAmount ?? currentData.totalPrice ?? currentData.priceBreakdown?.totalPrice ?? 0}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Payment Details</p>
                                            <p className="text-xs font-black text-[#08B36A] uppercase mt-1">
                                                {currentData.paymentDisplayLabel || `${currentData.paymentMethod || "Online"} (${currentData.paymentStatus || "Paid"})`}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Bar */}
                                <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-3 items-center">
                                    {pendingPayment && (
                                        <button 
                                            disabled={retryingId === (currentData._id || currentData.bookingId)}
                                            onClick={() => {
                                                onClose();
                                                handleRetryPayment(currentData);
                                            }}
                                            className="flex-1 py-3.5 px-6 bg-[#FF8A00] hover:bg-[#E67C00] text-white rounded-full font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer border border-orange-400/30"
                                        >
                                            {retryingId === (currentData._id || currentData.bookingId) ? (
                                                <FiLoader className="animate-spin" size={16} />
                                            ) : (
                                                <FiAlertCircle size={16} className="shrink-0" />
                                            )}
                                            <span>PAY NOW</span>
                                        </button>
                                    )}

                                    {currentData.status === "Completed" && (
                                        <button
                                            onClick={() => setModal(prev => ({ ...prev, type: 'rating' }))}
                                            className="flex-1 py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-amber-100 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                                        >
                                            <FiStar size={14} /> {currentData.isReviewed ? "Edit Review" : "Rate Service"}
                                        </button>
                                    )}

                                    {isCancellable && (
                                        <button
                                            onClick={() => {
                                                onClose();
                                                openCancelDialog(currentData);
                                            }}
                                            className="flex-1 py-4 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 rounded-2xl font-black text-[10px] uppercase tracking-widest active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                                        >
                                            <FiTrash2 size={14} />
                                            <span>Cancel</span>
                                        </button>
                                    )}

                                    <button 
                                        onClick={onClose}
                                        className="flex-1 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <StarRating
                                title={getNurseBureauName(currentData)}
                                onBack={() => setModal(prev => ({ ...prev, type: 'details' }))}
                                onSubmit={handleReviewSubmit}
                                rating={rating}
                                setRating={setRating}
                                comment={comment}
                                setComment={setComment}
                                existingReview={existingReview}
                                submitting={submittingReview}
                            />
                        )}
                    </div>
                </div>
            </div>,
            document.body
        );
    };

    return (
        <div className="bg-white border border-slate-200 rounded-[24px] md:rounded-[32px] overflow-hidden shadow-sm animate-fadeIn w-full">
            {/* Header */}
            <div className="p-5 md:p-8 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h3 className="font-black text-slate-900 text-lg md:text-xl tracking-tight">Nursing Registry</h3>
                    <p className="text-slate-400 text-[9px] md:text-[10px] font-bold uppercase tracking-widest mt-1">Total {pagination.totalCount} Bookings</p>
                </div>
                <div className="relative w-full sm:w-72">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search Booking ID, Patient, or Bureau..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-11 pr-4 text-xs md:text-sm font-semibold outline-none ring-1 ring-slate-100 focus:ring-[#08B36A] transition-all"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <FiLoader className="text-[#08B36A] animate-spin" size={28} />
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Loading Records...</p>
                </div>
            ) : filteredOrders.length === 0 ? (
                <div className="text-center py-16 text-slate-400 text-xs font-medium">No nurse booking history recorded.</div>
            ) : (
                <>
                    {/* Desktop Table with Fixed Horizontal Scroll & Guaranteed Minimum Width */}
                    <div className="hidden lg:block w-full overflow-x-auto custom-scrollbar">
                        <table className="w-full min-w-[1060px] text-left border-collapse table-auto">
                            <thead>
                                <tr className="bg-slate-50/70 border-b border-slate-100">
                                    <th className="px-4 xl:px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 w-[150px]">Booking ID</th>
                                    <th className="px-4 xl:px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 min-w-[220px]">Bureau & Service</th>
                                    <th className="px-4 xl:px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 min-w-[180px]">Schedule</th>
                                    <th className="px-4 xl:px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 min-w-[140px]">Payment</th>
                                    <th className="px-4 xl:px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center w-[120px]">Status</th>
                                    <th className="px-4 xl:px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right min-w-[250px]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredOrders.map((order) => {
                                    const isCancellable = Boolean(order.canCancel ?? ["Pending", "Confirmed", "Assigned", "On-The-Way", "Arrived"].includes(order.status));
                                    const pendingPayment = Boolean(order.canPayOnline);
                                    const isHospital = order.assessmentLocation === "At Hospital" || Boolean(order.hospitalDetails);

                                    return (
                                        <tr key={order._id || order.bookingId} className="hover:bg-slate-50/80 transition-colors">
                                            {/* Column 1: Booking ID & Mode */}
                                            <td className="px-4 xl:px-6 py-5 align-middle">
                                                <div className="flex flex-col gap-1 items-start">
                                                    <span className="text-xs font-black text-slate-900 tracking-wider font-mono">
                                                        #{order.bookingId}
                                                    </span>
                                                    <NurseModeBadge order={order} />
                                                </div>
                                            </td>

                                            {/* Column 2: Bureau & Staff */}
                                            <td className="px-4 xl:px-6 py-5 align-middle">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                                                        <img src={getImageUrl(order.nurseId?.profileImage || order.nurseBureau?.image)} className="w-full h-full object-cover" alt="" />
                                                    </div>
                                                    <div className="max-w-[200px]">
                                                        <p className="text-xs font-black text-slate-800 truncate leading-snug">{getNurseBureauName(order)}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-0.5 truncate">
                                                            {order.assignedStaffId ? `Staff: ${order.assignedStaffId.name}` : (order.serviceDetails?.title || 'Clinical Care')}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Column 3: Date, Time & Destination */}
                                            <td className="px-4 xl:px-6 py-5 align-middle">
                                                <div className="flex flex-col text-xs font-bold text-slate-700">
                                                    <span>{order.formattedScheduleDate || (order.schedule?.startDate ? new Date(order.schedule.startDate).toLocaleDateString() : 'Today')}</span>
                                                    <span className="text-[10px] font-medium text-slate-400 mt-0.5">
                                                        {order.formattedScheduleTime || order.schedule?.startTime || '10:00 AM'}
                                                    </span>
                                                    <span className="text-[9.5px] font-semibold text-slate-500 truncate max-w-[170px] flex items-center gap-1 mt-0.5">
                                                        {isHospital ? <MdLocalHospital className="text-purple-600 shrink-0" size={10} /> : <FiMapPin className="text-emerald-600 shrink-0" size={10} />}
                                                        {order.destinationLabel || order.assessmentLocation}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Column 4: Bill & Payment */}
                                            <td className="px-4 xl:px-6 py-5 align-middle">
                                                <div className="flex flex-col gap-1 items-start">
                                                    <span className="text-sm font-black text-slate-900">₹{order.totalAmount ?? order.totalPrice ?? 0}</span>
                                                    <NursePaymentBadge order={order} />
                                                </div>
                                            </td>

                                            {/* Column 5: Status */}
                                            <td className="px-4 xl:px-6 py-5 align-middle text-center">
                                                <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border whitespace-nowrap ${getStatusStyle(order.status)}`}>
                                                    {order.status}
                                                </span>
                                            </td>

                                            {/* Column 6: Actions */}
                                            <td className="px-4 xl:px-6 py-5 align-middle text-right">
                                                <div className="inline-flex items-center justify-end gap-2 whitespace-nowrap">
                                                    {pendingPayment && (
                                                        <button 
                                                            disabled={retryingId === (order._id || order.bookingId)}
                                                            onClick={() => handleRetryPayment(order)}
                                                            className="h-8 px-3.5 rounded-full text-[10px] font-black uppercase tracking-wide bg-[#FF8A00] hover:bg-[#E67C00] text-white transition-all flex items-center gap-1.5 shadow-md shadow-orange-500/20 disabled:opacity-50 cursor-pointer active:scale-95 border border-orange-400/30"
                                                            title="Pay Now"
                                                        >
                                                            {retryingId === (order._id || order.bookingId) ? (
                                                                <FiLoader className="animate-spin" size={12} />
                                                            ) : (
                                                                <FiAlertCircle size={13} className="shrink-0" />
                                                            )}
                                                            <span>PAY NOW</span>
                                                        </button>
                                                    )}

                                                    {order.status === "Completed" && (
                                                        <button 
                                                            onClick={() => {
                                                                setModal({ isOpen: true, type: 'rating', data: order, trackingData: null });
                                                            }}
                                                            className="h-8 px-3 rounded-xl text-[10px] font-black uppercase bg-amber-500 hover:bg-amber-600 text-white transition-all flex items-center gap-1 shadow-sm cursor-pointer"
                                                        >
                                                            <FiStar size={11} /> {order.isReviewed ? "Edit" : "Rate"}
                                                        </button>
                                                    )}

                                                    {isCancellable && (
                                                        <button 
                                                            onClick={() => openCancelDialog(order)}
                                                            className="h-8 px-3 rounded-xl text-[10px] font-black uppercase bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-all flex items-center gap-1 shadow-sm cursor-pointer"
                                                            title="Cancel Booking"
                                                        >
                                                            <FiTrash2 size={11} /> Cancel
                                                        </button>
                                                    )}

                                                    <button 
                                                        onClick={() => handleOpenDetails(order)} 
                                                        className="h-8 px-3 rounded-xl text-[10px] font-black uppercase border border-slate-200 bg-white text-slate-700 hover:bg-slate-900 hover:text-white transition-all cursor-pointer whitespace-nowrap"
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
                        {filteredOrders.map((order) => {
                            const isCancellable = Boolean(order.canCancel ?? ["Pending", "Confirmed", "Assigned", "On-The-Way", "Arrived"].includes(order.status));
                            const pendingPayment = Boolean(order.canPayOnline);
                            const isHospital = order.assessmentLocation === "At Hospital" || Boolean(order.hospitalDetails);

                            return (
                                <div key={order._id || order.bookingId} className="py-5 flex flex-col gap-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="text-[10px] font-black text-slate-400 tracking-wider">#{order.bookingId}</span>
                                            <h4 className="text-sm font-black text-slate-800 line-clamp-1 mt-0.5">
                                                {order.primaryPatientName ? `${order.primaryPatientName} • ` : ""}{getNurseBureauName(order)}
                                            </h4>
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase ${getStatusStyle(order.status)}`}>{order.status}</span>
                                    </div>

                                    <div className="flex flex-wrap gap-1.5 items-center">
                                        <NursePaymentBadge order={order} />
                                        <NurseModeBadge order={order} />
                                    </div>

                                    <div className="flex justify-between items-center text-xs font-bold text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                                        <div className="flex flex-col">
                                            <span>{order.formattedScheduleDate || (order.schedule?.startDate ? new Date(order.schedule.startDate).toLocaleDateString() : 'Today')} ({order.formattedScheduleTime || order.schedule?.startTime || '10:00 AM'})</span>
                                            <span className="text-[10px] font-medium text-slate-500 truncate max-w-[200px] flex items-center gap-1 mt-0.5">
                                                {isHospital ? <MdLocalHospital className="text-purple-600 shrink-0" size={10} /> : <FiMapPin className="text-emerald-600 shrink-0" size={10} />}
                                                {order.destinationLabel || order.assessmentLocation}
                                            </span>
                                        </div>
                                        <span className="text-sm font-black text-slate-900 shrink-0">₹{order.totalAmount ?? order.totalPrice ?? 0}</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 pt-1">
                                        {pendingPayment && (
                                            <button 
                                                disabled={retryingId === (order._id || order.bookingId)}
                                                onClick={() => handleRetryPayment(order)}
                                                className="w-full bg-[#FF8A00] hover:bg-[#E67C00] py-3 rounded-full text-[11px] font-black uppercase tracking-wide text-center text-white flex items-center justify-center gap-2 shadow-md shadow-orange-500/25 disabled:opacity-50 col-span-2 cursor-pointer active:scale-95 border border-orange-400/30"
                                            >
                                                {retryingId === (order._id || order.bookingId) ? (
                                                    <FiLoader className="animate-spin" size={14} />
                                                ) : (
                                                    <FiAlertCircle size={15} className="shrink-0" />
                                                )}
                                                <span>PAY NOW</span>
                                            </button>
                                        )}

                                        {isCancellable && (
                                            <button 
                                                onClick={() => openCancelDialog(order)} 
                                                className="w-full bg-rose-50 hover:bg-rose-100 border border-rose-200 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-center text-rose-600 flex items-center justify-center gap-1 shadow-sm cursor-pointer"
                                            >
                                                <FiTrash2 size={12} /> Cancel
                                            </button>
                                        )}

                                        <button 
                                            onClick={() => handleOpenDetails(order)} 
                                            className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-center border border-slate-200 bg-white cursor-pointer ${
                                                !isCancellable && !pendingPayment ? "col-span-2" : ""
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

            {/* Pagination */}
            <div className="p-4 md:p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/20">
                <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Page {pagination.currentPage} of {pagination.totalPages}</p>
                <div className="flex gap-2">
                    <button disabled={pagination.currentPage === 1} onClick={() => fetchOrders(pagination.currentPage - 1)} className="p-2 rounded-lg border border-slate-200 bg-white disabled:opacity-30 cursor-pointer"><FiArrowLeft size={16} /></button>
                    <button disabled={pagination.currentPage >= pagination.totalPages} onClick={() => fetchOrders(pagination.currentPage + 1)} className="p-2 rounded-lg border border-slate-200 bg-white disabled:opacity-30 cursor-pointer"><FiArrowLeft className="rotate-180" size={16} /></button>
                </div>
            </div>

            {/* --- Portal Details Modal --- */}
            {modal.isOpen && modal.data && (
                <NursingDetailsModal
                    data={modal.data}
                    trackingData={modal.trackingData}
                    type={modal.type}
                    onClose={() => setModal({ isOpen: false, type: 'details', data: null, trackingData: null })}
                />
            )}

            {/* --- Image Lightbox Preview Modal --- */}
            {previewImage && mounted && createPortal(
                <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="relative max-w-3xl max-h-[90vh] w-full flex flex-col items-center justify-center">
                        <button
                            type="button"
                            onClick={() => setPreviewImage(null)}
                            className="absolute -top-12 right-0 w-10 h-10 rounded-full bg-white/20 hover:bg-white text-white hover:text-slate-900 flex items-center justify-center transition-all cursor-pointer"
                        >
                            <FiX size={20} />
                        </button>
                        <img 
                            src={previewImage} 
                            alt="Full Screen Preview" 
                            className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl border border-white/20" 
                        />
                    </div>
                </div>,
                document.body
            )}

            {/* --- CANCELLATION REASON MODAL --- */}
            {cancelModal.isOpen && cancelModal.booking && mounted && createPortal(
                <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5">
                        <div className="flex justify-between items-start">
                            <div>
                                <span className="text-[10px] font-black text-rose-500 uppercase tracking-wider block">Cancel Request</span>
                                <h3 className="text-xl font-black text-slate-900 mt-0.5">Cancel Nurse Booking?</h3>
                            </div>
                            <button onClick={() => setCancelModal({ isOpen: false, booking: null })} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                                <FiX size={20} />
                            </button>
                        </div>

                        <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl text-xs space-y-1">
                            <p className="font-bold text-amber-900 flex items-center gap-1.5">
                                <FiAlertTriangle /> Partial Multi-Day Refund Policy
                            </p>
                            <p className="text-[11px] text-amber-800">
                                Unserved days will be refunded automatically to your original payment method. Completed sessions are deducted as per policy.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Select Reason</label>
                            {COMMON_CANCEL_REASONS.map((r, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => { setCancelReason(r); setCustomCancelReason(""); }}
                                    className={`w-full text-left p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                                        cancelReason === r && !customCancelReason
                                            ? "border-[#08B36A] bg-emerald-50/50 text-[#08B36A]"
                                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                                    }`}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Other Reason (Optional)</label>
                            <textarea
                                rows={2}
                                value={customCancelReason}
                                onChange={(e) => setCustomCancelReason(e.target.value)}
                                placeholder="Type your specific reason here..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold focus:outline-none focus:border-[#08B36A]"
                            />
                        </div>

                        <div className="flex gap-2 pt-2">
                            <button
                                type="button"
                                disabled={cancelling}
                                onClick={() => setCancelModal({ isOpen: false, booking: null })}
                                className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer"
                            >
                                Back
                            </button>
                            <button
                                type="button"
                                disabled={cancelling}
                                onClick={handleConfirmCancellation}
                                className="flex-1 py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20 cursor-pointer"
                            >
                                {cancelling ? (
                                    <>
                                        <FiLoader className="animate-spin" size={14} />
                                        <span>Cancelling...</span>
                                    </>
                                ) : (
                                    <span>Confirm Cancel</span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* --- CANCELLATION REFUND SUMMARY MODAL (Enhanced with Partial Multi-Day Metrics) --- */}
            {cancellationResult && mounted && createPortal(
                <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-6 sm:p-8 shadow-2xl border border-slate-100 text-center space-y-5">
                        <div className="w-16 h-16 mx-auto bg-emerald-50 rounded-2xl flex items-center justify-center text-[#08B36A] border border-emerald-100">
                            <FiCheckCircle size={32} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900">Booking Cancelled</h3>
                            <p className="text-xs text-slate-500 font-semibold mt-1">Ref: #{cancellationResult.bookingId}</p>
                            {cancellationResult.message && (
                                <p className="text-[11px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl mt-2 leading-relaxed">
                                    {cancellationResult.message}
                                </p>
                            )}
                        </div>

                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-xs space-y-2 text-left">
                            {cancellationResult.completedSessionsCount > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-slate-400 font-medium">Completed Sessions:</span>
                                    <span className="font-bold text-slate-800">{cancellationResult.completedSessionsCount} Days</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-slate-400 font-medium">Cancellation Fee:</span>
                                <span className="font-bold text-slate-800">₹{cancellationResult.cancellationFee || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400 font-medium">Refund Amount:</span>
                                <span className="font-black text-[#08B36A] text-sm">₹{cancellationResult.refundAmount || 0}</span>
                            </div>
                            <div className="flex justify-between border-t border-slate-200/60 pt-2">
                                <span className="text-slate-400 font-medium">Payment Status:</span>
                                <span className="font-black text-indigo-600 uppercase">{cancellationResult.paymentStatus || "Refund-Initiated"}</span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => { setCancellationResult(null); fetchOrders(); }}
                            className="w-full py-4 bg-[#08B36A] hover:bg-[#079c5c] text-white font-black rounded-2xl text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
                        >
                            Done
                        </button>
                    </div>
                </div>,
                document.body
            )}

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #f8fafc; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
            `}</style>
        </div>
    );
}

export default NursingOrders;