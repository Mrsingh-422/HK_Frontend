'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import UserAPI from '../../../../services/UserAPI'; 
import {
    FiX, FiTruck, FiPackage, FiLayers,
    FiRefreshCw, FiClock, FiSearch, FiChevronLeft, FiChevronRight,
    FiUser, FiMapPin, FiCreditCard, FiStar, FiRotateCcw, FiUploadCloud,
    FiAlertCircle, FiInfo, FiTrash2, FiLock, FiCheck, FiFileText,
    FiSlash, FiCheckCircle, FiPhone, FiZap, FiCalendar, FiShoppingBag
} from 'react-icons/fi';
import { HiStar } from 'react-icons/hi';
import { MdOutlineLocalPharmacy, MdOutlineRateReview, MdOutlineAssignmentReturn, MdOutlineCancel, MdOutlineDeliveryDining } from 'react-icons/md';

// --- HELPER: DYNAMIC RAZORPAY SCRIPT LOADER ---
const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        if (typeof window !== 'undefined' && window.Razorpay) {
            resolve(true);
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

// --- SUB-COMPONENT: DELIVERY MODE BADGE ---
const DeliveryModeBadge = ({ deliveryMode, slotSchedule }) => {
    if (!deliveryMode) return null;

    if (deliveryMode.type === 'EXPRESS' || deliveryMode.isRapid) {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-50 text-rose-600 border border-rose-200/80 font-bold rounded-md text-[10px] whitespace-nowrap">
                <FiZap size={10} className="text-rose-500 fill-rose-500 shrink-0" />
                Express (+₹{deliveryMode.rapidCharge || 0})
            </span>
        );
    }

    if (deliveryMode.type === 'SLOT' || deliveryMode.isSlotDelivery) {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200/80 font-bold rounded-md text-[10px] whitespace-nowrap">
                <FiCalendar size={10} className="shrink-0" />
                Slot: {slotSchedule?.timeSlot || 'Scheduled'} {deliveryMode.isPremiumSlot && `(+₹${deliveryMode.slotCharge || 0})`}
            </span>
        );
    }

    if (deliveryMode.type === 'PICKUP') {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 font-bold rounded-md text-[10px] whitespace-nowrap">
                <FiShoppingBag size={10} className="shrink-0" />
                Self Pickup
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200/80 font-bold rounded-md text-[10px] whitespace-nowrap">
            <FiTruck size={10} className="shrink-0" />
            Standard
        </span>
    );
};

// --- SUB-COMPONENT: PAYMENT BADGE ---
const PaymentBadge = ({ paymentInfo, paymentStatus, paymentMethod }) => {
    const isCod = paymentInfo?.isCod || paymentMethod === 'COD' || paymentInfo?.method === 'COD';
    const status = paymentInfo?.status || paymentStatus;

    if (isCod) {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200/80 font-bold rounded-md text-[10px] whitespace-nowrap">
                💵 COD {status === 'Paid' ? '(Paid)' : '(Pending)'}
            </span>
        );
    }

    if (status === 'Paid') {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-bold rounded-md text-[10px] whitespace-nowrap">
                <FiCheckCircle size={10} className="shrink-0" /> Paid Online
            </span>
        );
    }

    if (status === 'Refund-Initiated' || status === 'Refunded') {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 font-bold rounded-md text-[10px] whitespace-nowrap">
                ↩️ {status}
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-50 text-rose-600 border border-rose-200/80 font-bold rounded-md text-[10px] whitespace-nowrap">
            <FiAlertCircle size={10} className="shrink-0" /> Payment Incomplete
        </span>
    );
};

// --- SUB-COMPONENT: STATUS TRACKER / TIMELINE ---
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
                        <div className={`w-3 h-3 md:w-3.5 md:h-3.5 rounded-full border-2 transition-all ${
                            index <= currentStep ? "bg-indigo-600 border-indigo-200" : "bg-white border-slate-200"
                        }`}></div>
                        <span className={`text-[7.5px] md:text-[9px] font-black uppercase tracking-tighter whitespace-nowrap ${
                            index <= currentStep ? "text-slate-900" : "text-slate-400"
                        }`}>{step}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- SUB-COMPONENT: RETURN STATUS BADGE ---
const ReturnStatusBadge = ({ returnDetails }) => {
    if (!returnDetails || !returnDetails.status || returnDetails.status === 'None') return null;

    const styles = {
        Requested: 'bg-amber-100 text-amber-700 border-amber-200',
        Approved: 'bg-indigo-100 text-indigo-700 border-indigo-200',
        CollectedByDriver: 'bg-purple-100 text-purple-700 border-purple-200',
        ReceivedAtStore: 'bg-blue-100 text-blue-700 border-blue-200',
        Rejected: 'bg-rose-100 text-rose-700 border-rose-200',
        Completed: 'bg-emerald-100 text-emerald-700 border-emerald-200'
    };

    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border whitespace-nowrap ${styles[returnDetails.status] || 'bg-slate-100 text-slate-600'}`}>
            <FiRotateCcw size={10} className="shrink-0" /> {returnDetails.requestType || 'Return'}: {returnDetails.status}
        </span>
    );
};

// --- HELPER: CLIENT-SIDE WINDOW ELIGIBILITY CHECK ---
const checkOrderReturnWindow = (order) => {
    if (order.status !== "Delivered") {
        return { isEligible: false, daysRemaining: 0, reason: "Order not delivered yet." };
    }

    if (order.returnDetails && order.returnDetails.status && order.returnDetails.status !== 'None') {
        return { isEligible: false, daysRemaining: 0, reason: `Return already ${order.returnDetails.status.toLowerCase()}.` };
    }

    if (order.returnEligibility) {
        return {
            isEligible: Boolean(order.returnEligibility.canReturn || order.returnEligibility.canReplace),
            daysRemaining: order.returnEligibility.daysRemaining ?? 0,
            reason: order.returnEligibility.reasonIfNotEligible || "Return window closed.",
            termsAndConditions: order.returnEligibility.termsAndConditions || ""
        };
    }

    const deliveryTimestamp = new Date(order.deliveredAt || order.updatedAt || order.createdAt).getTime();
    const daysSinceDelivery = Math.floor((Date.now() - deliveryTimestamp) / (1000 * 60 * 60 * 24));
    const windowLimit = 7;
    const daysRemaining = windowLimit - daysSinceDelivery;

    if (daysRemaining <= 0) {
        return {
            isEligible: false,
            daysRemaining: 0,
            reason: `Return window closed: Return/Replacement was only allowed within ${windowLimit} days.`
        };
    }

    return {
        isEligible: true,
        daysRemaining: daysRemaining,
        reason: ""
    };
};

function PharmacyOrders() {
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState([]);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalCount: 0 });
    const [modal, setModal] = useState({ isOpen: false, data: null, trackingData: null });
    const [reviewModal, setReviewModal] = useState({ isOpen: false, data: null });
    const [returnModal, setReturnModal] = useState({ isOpen: false, data: null, eligibility: null });
    const [cancelModal, setCancelModal] = useState({ isOpen: false, order: null });
    const [cancelSuccessData, setCancelSuccessData] = useState(null);
    const [retryingPaymentId, setRetryingPaymentId] = useState(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useEffect(() => {
        if (modal.isOpen || reviewModal.isOpen || returnModal.isOpen || cancelModal.isOpen || cancelSuccessData) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [modal.isOpen, reviewModal.isOpen, returnModal.isOpen, cancelModal.isOpen, cancelSuccessData]);

    // --- DATA FETCHING ---
    const loadOrders = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const res = await UserAPI.getPharmacyOrders(page, 10);
            if (res && res.success) {
                setOrders(res.data || []);
                setPagination({
                    currentPage: res.currentPage || 1,
                    totalPages: res.totalPages || 1,
                    totalCount: res.totalOrders ?? res.count ?? (res.data ? res.data.length : 0)
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

    // --- OPEN DETAILS & TRACKING MODAL ---
    const handleOpenOrderDetails = async (order) => {
        setModal({ isOpen: true, data: order, trackingData: null });
        try {
            const res = await UserAPI.getPharmacyOrderTracking(order.orderId || order._id);
            if (res && res.success && res.data) {
                setModal({ isOpen: true, data: { ...order, ...res.data }, trackingData: res.data });
            }
        } catch (err) {
            console.warn("Tracking data fetch skipped/failed:", err);
        }
    };

    // --- RETRY PAYMENT HANDLER ---
    const handleRetryPayment = async (order) => {
        const targetOrderId = order.orderId || order._id;
        setRetryingPaymentId(targetOrderId);
        try {
            const res = await UserAPI.retryPharmacyPayment({ orderId: order.orderId });
            if (res && res.success) {
                const isLoaded = await loadRazorpayScript();
                if (!isLoaded) {
                    toast.error("Razorpay SDK failed to load. Please check your internet connection.");
                    setRetryingPaymentId(null);
                    return;
                }

                const options = {
                    key: res.key_id,
                    amount: res.amount,
                    currency: "INR",
                    name: "Pharmacy Order Payment",
                    description: `Payment for Order #${order.orderId}`,
                    order_id: res.razorpayOrderId,
                    handler: async function (response) {
                        try {
                            const verifyRes = await UserAPI.verifyPaymentPharmacy({
                                orderId: order.orderId,
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature
                            });

                            if (verifyRes && verifyRes.success) {
                                toast.success(verifyRes.message || "Payment verified! Order confirmed successfully.");
                                loadOrders();
                            } else {
                                toast.error(verifyRes?.message || "Payment verification failed.");
                            }
                        } catch (err) {
                            console.error("Payment verification error:", err);
                            toast.error(err.response?.data?.message || "Failed to verify payment.");
                        }
                    },
                    modal: {
                        ondismiss: function () {
                            toast("Payment cancelled or closed.");
                        }
                    },
                    theme: {
                        color: "#4f46e5"
                    }
                };

                const rzp = new window.Razorpay(options);
                rzp.on('payment.failed', function (response) {
                    toast.error(response.error?.description || "Payment failed. Please try again.");
                });
                rzp.open();
            } else {
                toast.error(res?.message || "Failed to initialize payment gateway.");
            }
        } catch (error) {
            console.error("Retry payment error:", error);
            toast.error(error.response?.data?.message || "Failed to initiate payment retry.");
        } finally {
            setRetryingPaymentId(null);
        }
    };

    // Open Return Modal with live eligibility check
    const handleOpenReturnModal = async (order) => {
        try {
            const trackingRes = await UserAPI.getPharmacyOrderTracking(order.orderId || order._id);
            const eligibility = trackingRes?.data?.returnEligibility || trackingRes?.returnEligibility;
            
            if (eligibility && !eligibility.canReturn && !eligibility.canReplace) {
                toast.error(eligibility.reasonIfNotEligible || "Return window closed: Return/Replacement was only allowed within policy days.");
                return;
            }
            setReturnModal({ isOpen: true, data: order, eligibility });
        } catch (err) {
            console.error("Error verifying return eligibility:", err);
            const localCheck = checkOrderReturnWindow(order);
            if (!localCheck.isEligible) {
                toast.error(localCheck.reason);
                return;
            }
            setReturnModal({ isOpen: true, data: order, eligibility: localCheck });
        }
    };

    // Review Submit / Update
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
        if (status === 'Delivered') return 'text-emerald-700 bg-emerald-50 border-emerald-200';
        if (status === 'Shipped') return 'text-indigo-700 bg-indigo-50 border-indigo-200';
        if (status === 'Cancelled') return 'text-rose-700 bg-rose-50 border-rose-200';
        if (status === 'Pending') return 'text-rose-600 bg-rose-50 border-rose-200';
        return 'text-amber-700 bg-amber-50 border-amber-200'; 
    };

    const getItemNames = (items) => {
        if (!items || items.length === 0) return "General Medicines";
        return items.map(i => i.name).join(", ");
    };

    const getPharmacyName = (order) => {
        return order.pharmacy?.name || order.pharmacyId?.name || "Pharmacy Partner";
    };

    const getPharmacyInitial = (order) => {
        const name = getPharmacyName(order);
        return name.charAt(0).toUpperCase();
    };

    const isOrderPendingPayment = (order) => {
        const payStatus = order.paymentInfo?.status || order.paymentStatus;
        const payMethod = order.paymentInfo?.method || order.paymentMethod;
        return (order.status === 'Pending' || order.canRetryPayment) && payStatus === 'Pending' && payMethod !== 'COD';
    };

    // --- MODAL: CANCEL ORDER ---
    const CancelOrderModal = ({ isOpen, onClose, order }) => {
        const [reason, setReason] = useState("");
        const [customReason, setCustomReason] = useState("");
        const [submitting, setSubmitting] = useState(false);

        const reasonsList = [
            "Ordered by mistake",
            "Found medicines at a lower price elsewhere",
            "Delivery time is too long",
            "Doctor changed prescription",
            "Incorrect delivery address selected",
            "Other"
        ];

        if (!mounted || !isOpen || !order) return null;

        const handleCancelSubmit = async (e) => {
            e.preventDefault();
            const finalReason = reason === "Other" ? (customReason.trim() || "Cancelled by patient") : reason;
            if (!finalReason) {
                toast.error("Please select or enter a cancellation reason.");
                return;
            }

            setSubmitting(true);
            try {
                const res = await UserAPI.cancelPharmacyOrder({
                    orderId: order.orderId,
                    reason: finalReason
                });

                if (res && res.success) {
                    onClose();
                    setCancelSuccessData({
                        orderId: order.orderId,
                        message: res.message,
                        refundAmount: res.data?.refundAmount ?? 0,
                        cancellationFee: res.data?.cancellationFee ?? 0,
                        paymentStatus: res.data?.order?.paymentStatus || "Refund-Initiated"
                    });
                    loadOrders();
                } else {
                    toast.error(res?.message || "Failed to cancel order.");
                }
            } catch (err) {
                console.error("Cancellation failed:", err);
                toast.error(err.response?.data?.message || err.message || "Failed to cancel order.");
            } finally {
                setSubmitting(false);
            }
        };

        return createPortal(
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 md:p-6">
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity duration-300" onClick={onClose} />

                <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-[0_30px_80px_-15px_rgba(0,0,0,0.5)] overflow-hidden p-6 md:p-8 animate-in zoom-in-95 fade-in duration-300">
                    <div className="flex justify-between items-center mb-5">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100">
                                <MdOutlineCancel size={22} />
                            </div>
                            <div>
                                <h4 className="font-black text-slate-900 text-sm uppercase tracking-wider">Cancel Order</h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">#{order.orderId}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-slate-50 border border-slate-200 rounded-full text-slate-400 hover:text-rose-500 hover:border-rose-100 transition-all">
                            <FiX size={16} />
                        </button>
                    </div>

                    <div className="p-4 bg-rose-50/60 border border-rose-100 rounded-2xl mb-5">
                        <p className="text-[11px] font-semibold text-rose-800 leading-relaxed">
                            Are you sure you want to cancel this medicine order? If already paid online, auto-refund will be initiated immediately and coupon limits will be restored.
                        </p>
                    </div>

                    <form onSubmit={handleCancelSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Reason for cancellation *</label>
                            <select
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                required
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-rose-500 transition-all"
                            >
                                <option value="">-- Choose Reason --</option>
                                {reasonsList.map((r, i) => (
                                    <option key={i} value={r}>{r}</option>
                                ))}
                            </select>
                        </div>

                        {reason === "Other" && (
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Specify Reason *</label>
                                <textarea
                                    value={customReason}
                                    onChange={(e) => setCustomReason(e.target.value)}
                                    required
                                    rows={3}
                                    placeholder="Please describe why you are cancelling..."
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs font-semibold outline-none focus:ring-2 focus:ring-rose-500 transition-all resize-none"
                                />
                            </div>
                        )}

                        <div className="pt-2 flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-black text-[10px] uppercase tracking-wider transition-all"
                            >
                                Keep Order
                            </button>
                            <button
                                type="submit"
                                disabled={submitting || !reason}
                                className="flex-1 py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-wider shadow-lg shadow-rose-200 flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50"
                            >
                                {submitting ? <FiRefreshCw className="animate-spin" /> : "Confirm Cancel"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>,
            document.body
        );
    };

    // --- POPUP: REFUND CONFIRMATION ---
    const CancelSuccessModal = ({ data, onClose }) => {
        if (!mounted || !data) return null;

        return createPortal(
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 md:p-6 animate-in fade-in duration-200">
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />

                <div className="relative bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl p-6 md:p-8 text-center animate-in zoom-in-95 duration-200 space-y-4">
                    <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-50">
                        <FiCheckCircle size={28} />
                    </div>

                    <div>
                        <h4 className="font-black text-slate-900 text-base">Order Cancelled</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">#{data.orderId}</p>
                    </div>

                    {data.refundAmount > 0 ? (
                        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl text-left space-y-1.5">
                            <div className="flex justify-between items-center">
                                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-800 block">Refund Amount</span>
                                <span className="px-2 py-0.5 bg-emerald-200/60 text-emerald-900 rounded-full text-[8.5px] font-black uppercase">
                                    {data.paymentStatus || "Refund-Initiated"}
                                </span>
                            </div>
                            <p className="text-2xl font-black text-emerald-700">₹{data.refundAmount}</p>
                            {data.cancellationFee > 0 && (
                                <p className="text-[10px] text-slate-500 font-medium">Cancellation Fee: ₹{data.cancellationFee}</p>
                            )}
                            <p className="text-[10px] text-emerald-800 font-semibold leading-relaxed pt-1 border-t border-emerald-200/50">
                                🟢 Order Cancelled: ₹{data.refundAmount} refund has been initiated to your original payment method.
                            </p>
                        </div>
                    ) : (
                        <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-left">
                            <p className="text-xs font-semibold text-slate-600 leading-relaxed">
                                {data.message || "Order cancelled successfully. No payment deduction was made."}
                            </p>
                        </div>
                    )}

                    <button
                        onClick={onClose}
                        className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
                    >
                        Okay, Got it
                    </button>
                </div>
            </div>,
            document.body
        );
    };

    // --- MODAL: RETURN & REPLACEMENT ---
    const PharmacyReturnModal = ({ isOpen, onClose, order, eligibility }) => {
        const canReturn = eligibility ? eligibility.canReturn : true;
        const canReplace = eligibility ? eligibility.canReplace : true;

        const [requestType, setRequestType] = useState(canReturn ? 'Return' : canReplace ? 'Replacement' : 'Return');
        const [reason, setReason] = useState('');
        const [userComments, setUserComments] = useState('');
        const [proofImages, setProofImages] = useState([]);
        const [previewUrls, setPreviewUrls] = useState([]);
        const [submitting, setSubmitting] = useState(false);

        const reasonsList = [
            "Damaged or Leaked Medicine",
            "Expired Product Delivered",
            "Wrong Product Delivered",
            "Seal Broken / Opened Packaging",
            "Defective / Non-Functional Device",
            "Incorrect Quantity Received"
        ];

        useEffect(() => {
            return () => {
                previewUrls.forEach(url => URL.revokeObjectURL(url));
            };
        }, [previewUrls]);

        if (!mounted || !isOpen || !order) return null;

        const handleImageChange = (e) => {
            const files = Array.from(e.target.files);
            if (proofImages.length + files.length > 5) {
                toast.error("You can upload a maximum of 5 proof images.");
                return;
            }

            const validImages = files.filter(f => f.type.startsWith('image/'));
            if (validImages.length !== files.length) {
                toast.error("Only JPG and PNG images are allowed.");
            }

            const newPreviews = validImages.map(file => URL.createObjectURL(file));
            setProofImages(prev => [...prev, ...validImages]);
            setPreviewUrls(prev => [...prev, ...newPreviews]);
        };

        const removeImage = (index) => {
            URL.revokeObjectURL(previewUrls[index]);
            setProofImages(prev => prev.filter((_, i) => i !== index));
            setPreviewUrls(prev => prev.filter((_, i) => i !== index));
        };

        const handleSubmit = async (e) => {
            e.preventDefault();
            if (!reason) {
                toast.error("Please select a reason for your request.");
                return;
            }

            setSubmitting(true);
            try {
                const formData = new FormData();
                formData.append('requestType', requestType);
                formData.append('reason', reason);
                if (userComments) formData.append('userComments', userComments);
                
                proofImages.forEach((img) => {
                    formData.append('proofImages', img);
                });

                const targetOrderId = order._id || order.orderId;
                const res = await UserAPI.submitPharmacyReturnRequest(targetOrderId, formData);

                if (res && res.success) {
                    toast.success(res.message || `${requestType} request submitted successfully!`);
                    onClose();
                    loadOrders();
                } else {
                    toast.error(res?.message || "Failed to submit request.");
                }
            } catch (err) {
                console.error("Return submission failed:", err);
                const errorMsg = err.response?.data?.message || err.message || "Failed to submit request.";
                toast.error(errorMsg, { duration: 5000 });
            } finally {
                setSubmitting(false);
            }
        };

        return createPortal(
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 md:p-6">
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity duration-300" onClick={onClose} />

                <div className="relative bg-white w-full max-w-xl rounded-[2.5rem] shadow-[0_30px_80px_-15px_rgba(0,0,0,0.5)] overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 fade-in duration-300">
                    <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-rose-500 text-white rounded-2xl shadow-lg shadow-rose-100">
                                <MdOutlineAssignmentReturn size={22} />
                            </div>
                            <div>
                                <h4 className="font-black text-slate-900 text-sm md:text-base uppercase tracking-wider">
                                    Return / Replacement Request
                                </h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    Order #{order.orderId} {eligibility?.daysRemaining !== undefined && `• ${eligibility.daysRemaining} days left`}
                                </p>
                            </div>
                        </div>
                        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-full text-slate-400 hover:text-rose-500 hover:border-rose-100 transition-all">
                            <FiX size={16} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar space-y-6">
                        <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100/80">
                            <FiAlertCircle className="text-amber-600 shrink-0 mt-0.5" size={18} />
                            <p className="text-[11px] font-semibold text-amber-800 leading-relaxed">
                                <strong className="font-bold">Drug Safety Regulations:</strong> Ingestible prescription medicines cannot be returned or replaced once delivered. Applicable strictly to medical devices, health monitors, and sealed OTC products.
                            </p>
                        </div>

                        {/* Choose Request Type */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Choose Request Type *</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    disabled={!canReturn}
                                    onClick={() => setRequestType('Return')}
                                    className={`py-3.5 px-4 rounded-2xl font-black text-xs uppercase tracking-wider border transition-all flex items-center justify-center gap-2 ${
                                        requestType === 'Return'
                                            ? "bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-200"
                                            : !canReturn 
                                                ? "bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed opacity-50"
                                                : "bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100"
                                    }`}
                                >
                                    <FiRotateCcw size={14} /> Return (Refund)
                                </button>
                                <button
                                    type="button"
                                    disabled={!canReplace}
                                    onClick={() => setRequestType('Replacement')}
                                    className={`py-3.5 px-4 rounded-2xl font-black text-xs uppercase tracking-wider border transition-all flex items-center justify-center gap-2 ${
                                        requestType === 'Replacement'
                                            ? "bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-200"
                                            : !canReplace
                                                ? "bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed opacity-50"
                                                : "bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100"
                                    }`}
                                >
                                    <FiPackage size={14} /> Replacement
                                </button>
                            </div>
                        </div>

                        {/* Reason */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Reason for Request *</label>
                            <select
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                required
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            >
                                <option value="">-- Select Reason --</option>
                                {reasonsList.map((r, i) => (
                                    <option key={i} value={r}>{r}</option>
                                ))}
                            </select>
                        </div>

                        {/* Comments */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Patient's Comments (Optional)</label>
                            <textarea
                                value={userComments}
                                onChange={(e) => setUserComments(e.target.value)}
                                rows={3}
                                placeholder="E.g., Bottle seal was broken, or medicine was damaged."
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400 resize-none"
                            />
                        </div>

                        {/* Proof Photos */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Proof Images (Max 5)</label>
                                <span className="text-[10px] font-bold text-slate-400">{proofImages.length}/5 Selected</span>
                            </div>

                            {previewUrls.length > 0 && (
                                <div className="grid grid-cols-5 gap-2 mb-3">
                                    {previewUrls.map((url, idx) => (
                                        <div key={idx} className="relative group rounded-xl overflow-hidden aspect-square border border-slate-200">
                                            <img src={url} alt={`proof-${idx}`} className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(idx)}
                                                className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <FiTrash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {proofImages.length < 5 && (
                                <label className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl cursor-pointer bg-slate-50/50 hover:bg-indigo-50/20 transition-all">
                                    <FiUploadCloud className="text-slate-400 mb-1" size={24} />
                                    <span className="text-[11px] font-bold text-slate-600">Click to upload photo evidence</span>
                                    <span className="text-[9px] font-semibold text-slate-400 mt-0.5">JPG or PNG formats</span>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                </label>
                            )}
                        </div>

                        {eligibility?.termsAndConditions && (
                            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1.5">
                                <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                                    <FiFileText size={12} className="text-indigo-600" /> Platform Return Terms & Conditions
                                </span>
                                <p className="text-[10px] font-semibold text-slate-600 whitespace-pre-line leading-relaxed">
                                    {eligibility.termsAndConditions}
                                </p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-slate-200 flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                            {submitting ? (
                                <FiRefreshCw className="animate-spin" />
                            ) : (
                                `Submit ${requestType} Request`
                            )}
                        </button>
                    </form>
                </div>
            </div>,
            document.body
        );
    };

    // --- MODAL: RATINGS & REVIEW ---
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
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity duration-300" onClick={onClose} />

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
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Reviewing {getPharmacyName(data)}</p>
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
                                    placeholder="Describe packaging quality, shipping delivery, or pharmacy assistance speed..."
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

    // --- MODAL: ORDER DETAILS & LIVE TRACKING ---
    const OrderDetailsModal = ({ data, trackingData, onClose }) => {
        const [review, setReview] = useState(null);
        const [reviewLoading, setReviewLoading] = useState(false);
        const [eligibility, setEligibility] = useState(null);
        const [cancellingReturn, setCancellingReturn] = useState(false);

        const currentData = trackingData || data;

        useEffect(() => {
            const fetchDetails = async () => {
                if (!data?._id) return;
                
                if (data.status === "Delivered") {
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

                if (data.status === "Delivered" && (!data.returnDetails || data.returnDetails.status === 'None')) {
                    try {
                        const trackRes = await UserAPI.getPharmacyOrderTracking(data.orderId || data._id);
                        const elig = trackRes?.data?.returnEligibility || trackRes?.returnEligibility;
                        setEligibility(elig || checkOrderReturnWindow(data));
                    } catch (err) {
                        setEligibility(checkOrderReturnWindow(data));
                    }
                }
            };

            fetchDetails();
        }, [data]);

        if (!mounted) return null;

        const hasActiveReturn = data.returnDetails && data.returnDetails.status && data.returnDetails.status !== 'None';
        const eligibilityInfo = eligibility || checkOrderReturnWindow(data);
        const isEligibleForReturn = eligibilityInfo.isEligible || eligibilityInfo.canReturn || eligibilityInfo.canReplace;
        const isCancellable = ['Placed', 'Under Review', 'Pending'].includes(data.status);
        const deliveryAddress = currentData.deliveryAddress || currentData.address;
        const deliveryPartner = currentData.deliveryPartner;

        const handleCancelReturn = async () => {
            setCancellingReturn(true);
            try {
                const res = await UserAPI.cancelPharmacyReturnRequest(data._id);
                if (res && res.success) {
                    toast.success(res.message || "Return request cancelled successfully.");
                    onClose();
                    loadOrders();
                } else {
                    toast.error(res?.message || "Failed to cancel return request.");
                }
            } catch (err) {
                toast.error(err.response?.data?.message || "Error cancelling return request.");
            } finally {
                setCancellingReturn(false);
            }
        };

        return createPortal(
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 md:p-6">
                <div 
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity duration-300"
                    onClick={onClose}
                />

                <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] md:rounded-[3.5rem] shadow-[0_30px_80px_-15px_rgba(0,0,0,0.5)] overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 fade-in duration-300">
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

                    <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar space-y-6">
                        {/* Status Tracker & Timeline Card */}
                        <div className="bg-slate-900 rounded-[2rem] p-6 md:p-8 text-white relative overflow-hidden">
                            <FiTruck size={120} className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none" />
                            <div className="relative z-10">
                                <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Order Tracking</p>
                                        <h2 className="text-2xl md:text-3xl font-black mt-0.5">{currentData.status}</h2>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5 items-center">
                                        <DeliveryModeBadge deliveryMode={currentData.deliveryMode} slotSchedule={currentData.slotSchedule} />
                                        <PaymentBadge paymentInfo={currentData.paymentInfo} paymentStatus={currentData.paymentStatus} paymentMethod={currentData.paymentMethod} />
                                        <ReturnStatusBadge returnDetails={currentData.returnDetails} />
                                    </div>
                                </div>

                                {/* Delivery OTP Banner */}
                                {currentData.deliveryOTP && (
                                    <div className="my-4 p-4 bg-indigo-500/20 rounded-2xl border border-indigo-400/30 flex items-center justify-between">
                                        <div>
                                            <p className="text-[9px] font-black uppercase text-indigo-300 tracking-wider">Doorstep Delivery OTP</p>
                                            <p className="text-xs font-semibold text-slate-300">Share with driver upon receiving medicine bag</p>
                                        </div>
                                        <span className="text-2xl font-black text-white tracking-[0.25em] font-mono bg-black/50 px-3.5 py-1.5 rounded-xl border border-indigo-400/30">
                                            {currentData.deliveryOTP}
                                        </span>
                                    </div>
                                )}

                                {/* Timeline or Stepper */}
                                <StatusStepper status={currentData.status} trackingTimeline={currentData.trackingTimeline} />

                                <div className="mt-4 flex flex-wrap gap-2 text-slate-300">
                                    <div className="px-3 py-1.5 bg-white/10 rounded-lg text-[10px] font-bold flex items-center gap-1.5">
                                        <FiClock size={12} /> {currentData.formattedDate || new Date(currentData.createdAt).toLocaleString()}
                                    </div>
                                    <div className="px-3 py-1.5 bg-white/10 rounded-lg text-[10px] font-bold flex items-center gap-1.5">
                                        <FiPackage size={12} /> {currentData.collectionType || 'Home Delivery'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* LIVE DELIVERY PARTNER CARD */}
                        {deliveryPartner && (
                            <div className="p-5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-[2rem] border border-indigo-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-lg font-black shadow-md shadow-indigo-100 shrink-0 overflow-hidden">
                                        {deliveryPartner.profilePic ? (
                                            <img src={deliveryPartner.profilePic} alt={deliveryPartner.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <MdOutlineDeliveryDining size={26} />
                                        )}
                                    </div>
                                    <div>
                                        <span className="text-[9px] font-black uppercase tracking-wider text-indigo-600 flex items-center gap-1">
                                            Assigned Delivery Partner
                                        </span>
                                        <h4 className="font-black text-slate-900 text-sm">{deliveryPartner.name}</h4>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase">
                                            {deliveryPartner.vehicleType} • {deliveryPartner.vehicleNumber}
                                        </p>
                                    </div>
                                </div>
                                {deliveryPartner.phone && (
                                    <a
                                        href={`tel:${deliveryPartner.phone}`}
                                        className="p-3 bg-white text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-xl border border-indigo-200 transition-colors shadow-sm flex items-center gap-1 text-xs font-black"
                                    >
                                        <FiPhone size={14} /> Call
                                    </a>
                                )}
                            </div>
                        )}

                        {/* REVERSE LOGISTICS & OTP TRACKING CARD */}
                        {hasActiveReturn && data.returnDetails?.status === 'Approved' && (
                            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-[2rem] p-6 text-white space-y-4 shadow-xl border border-indigo-500/20">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                                            <FiCheck /> Reverse Pickup Driver Assigned
                                        </span>
                                        <h4 className="text-base font-black mt-1">Return Agent is on the way</h4>
                                    </div>
                                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[10px] font-black uppercase tracking-wider">
                                        {data.returnDetails.pickupStatus || 'Assigned'}
                                    </span>
                                </div>

                                {data.returnDetails.returnOTP && (
                                    <div className="p-4 bg-white/10 rounded-2xl border border-white/10 flex items-center justify-between">
                                        <div>
                                            <p className="text-[9px] font-black uppercase text-slate-300 tracking-wider">Return Handshake OTP</p>
                                            <p className="text-xs font-semibold text-slate-200">Share this code with the driver at doorstep</p>
                                        </div>
                                        <span className="text-3xl font-black text-emerald-400 tracking-[0.25em] font-mono bg-black/40 px-4 py-2 rounded-xl border border-emerald-500/30">
                                            {data.returnDetails.returnOTP}
                                        </span>
                                    </div>
                                )}

                                {['Assigned', 'PendingAssignment', 'OutForPickup'].includes(data.returnDetails.pickupStatus) && (
                                    <button
                                        disabled={cancellingReturn}
                                        onClick={handleCancelReturn}
                                        className="w-full py-3 bg-white/10 hover:bg-rose-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all disabled:opacity-50"
                                    >
                                        {cancellingReturn ? "Cancelling Return..." : "Cancel Return Request"}
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Standard Return Details */}
                        {hasActiveReturn && data.returnDetails?.status !== 'Approved' && (
                            <div className="p-6 bg-amber-50/60 border border-amber-100 rounded-[2rem] space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-700 flex items-center gap-2">
                                        <FiRotateCcw size={14} /> {data.returnDetails.requestType} Details
                                    </span>
                                    <span className="text-[9px] font-black uppercase px-2.5 py-1 bg-amber-200/60 text-amber-800 rounded-full">
                                        Status: {data.returnDetails.status}
                                    </span>
                                </div>
                                <p className="text-xs font-bold text-slate-700"><strong>Reason:</strong> {data.returnDetails.reason}</p>
                                {data.returnDetails.userComments && (
                                    <p className="text-xs font-medium text-slate-600 italic leading-relaxed">"{data.returnDetails.userComments}"</p>
                                )}
                                {data.returnDetails.rejectionReason && (
                                    <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl">
                                        <p className="text-xs font-bold text-rose-700">Rejection Reason: {data.returnDetails.rejectionReason}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Items Section */}
                        <div className="space-y-4">
                            <h4 className="font-black text-[10px] uppercase tracking-widest text-slate-400 flex items-center gap-2 px-1">
                                <FiLayers className="text-indigo-500" /> Order Manifest ({currentData.itemsCount || currentData.items?.length || 0} Items)
                            </h4>
                            <div className="space-y-2">
                                {currentData.items?.map((item, i) => (
                                    <div key={i} className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100 hover:border-indigo-100 transition-colors">
                                        <div className="flex items-center gap-3">
                                            {item.image && (
                                                <img src={item.image} alt={item.name} className="w-12 h-12 object-contain bg-white rounded-xl p-1 border border-slate-200" />
                                            )}
                                            <div>
                                                <p className="font-black text-slate-800 text-sm">{item.name}</p>
                                                <p className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">
                                                    {item.packaging || item.duration || 'Pack'} • Qty: {item.quantity}
                                                    {item.freeQuantity > 0 && <span className="text-emerald-600 font-bold ml-1">(+ {item.freeQuantity} Free)</span>}
                                                </p>
                                                {item.isComboApplied && (
                                                    <span className="inline-block mt-0.5 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[8px] font-black uppercase rounded">
                                                        Combo Offer Applied
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-slate-900">₹{item.price}</p>
                                            {item.mrp && item.mrp > item.price && (
                                                <p className="text-[10px] text-slate-400 line-through">₹{item.mrp}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Pharmacy & Address Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                                <p className="text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest">Fulfilling Pharmacy</p>
                                <div className="flex gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black shrink-0">
                                        <MdOutlineLocalPharmacy size={20} />
                                    </div>
                                    <div className="text-[12px] font-bold text-slate-600 leading-relaxed">
                                        <p className="text-slate-900 font-black mb-0.5">{getPharmacyName(currentData)}</p>
                                        <p>{currentData.pharmacy?.address || currentData.pharmacyId?.address || 'Verified Store Branch'}</p>
                                        <p>{currentData.pharmacy?.city || currentData.pharmacyId?.city}</p>
                                        {currentData.pharmacy?.phone && (
                                            <p className="text-indigo-600 font-bold text-[11px] mt-1">📞 {currentData.pharmacy.phone}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                                <p className="text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest">Shipping Address</p>
                                <div className="flex gap-3">
                                    <FiMapPin className="text-indigo-500 shrink-0 mt-1" size={16} />
                                    <div className="text-[12px] font-bold text-slate-600 leading-relaxed">
                                        <p className="text-slate-900 font-black mb-1">{deliveryAddress?.name}</p>
                                        <p>{deliveryAddress?.houseNo}, {deliveryAddress?.sector}</p>
                                        <p>{deliveryAddress?.city}, {deliveryAddress?.pincode}</p>
                                        {deliveryAddress?.phone && (
                                            <p className="text-slate-500 text-[10px] font-semibold mt-1">Phone: {deliveryAddress.phone}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Invoice & Bill Breakdown */}
                        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white">
                            <div className="flex items-center gap-2 mb-6">
                                <FiCreditCard className="text-indigo-400" />
                                <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Payment Invoice & Summary</h5>
                            </div>
                            <div className="space-y-3 text-xs font-bold border-b border-white/10 pb-6 mb-6">
                                <div className="flex justify-between text-slate-400">
                                    <span>Item Total</span>
                                    <span>₹{currentData.billSummary?.itemTotal || 0}</span>
                                </div>
                                {currentData.billSummary?.deliveryCharge > 0 && (
                                    <div className="flex justify-between text-slate-400">
                                        <span>Standard Delivery</span>
                                        <span>₹{currentData.billSummary?.deliveryCharge}</span>
                                    </div>
                                )}
                                {currentData.billSummary?.rapidDeliveryCharge > 0 && (
                                    <div className="flex justify-between text-red-400">
                                        <span>1-Hour Express Delivery</span>
                                        <span>+ ₹{currentData.billSummary?.rapidDeliveryCharge}</span>
                                    </div>
                                )}
                                {currentData.billSummary?.slotCharge > 0 && (
                                    <div className="flex justify-between text-purple-400">
                                        <span>Premium Time Slot</span>
                                        <span>+ ₹{currentData.billSummary?.slotCharge}</span>
                                    </div>
                                )}
                                {currentData.billSummary?.couponDiscount > 0 && (
                                    <div className="flex justify-between text-rose-400">
                                        <span>Coupon Discount Applied</span>
                                        <span>- ₹{currentData.billSummary?.couponDiscount}</span>
                                    </div>
                                )}
                                {currentData.billSummary?.comboSavings > 0 && (
                                    <div className="flex justify-between text-emerald-400">
                                        <span>Combo Savings</span>
                                        <span>- ₹{currentData.billSummary?.comboSavings}</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">Grand Total</p>
                                    <p className="text-3xl font-black">₹{currentData.billSummary?.totalAmount}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Payment Status</p>
                                    <p className={`text-xs font-black uppercase mt-1 ${
                                        (currentData.paymentInfo?.status === 'Paid' || currentData.paymentStatus === 'Paid')
                                            ? 'text-emerald-400' 
                                            : (currentData.paymentInfo?.isCod || currentData.paymentMethod === 'COD') 
                                            ? 'text-amber-400' 
                                            : 'text-rose-400'
                                    }`}>
                                        {currentData.paymentInfo?.status || currentData.paymentStatus || 'Pending'} ({currentData.paymentInfo?.method || currentData.paymentMethod || 'Online'})
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions Footer */}
                    <div className="p-6 md:p-8 bg-slate-50/50 border-t flex flex-wrap gap-3 shrink-0">
                        {isOrderPendingPayment(data) && (
                            <button 
                                disabled={retryingPaymentId === (data.orderId || data._id)}
                                onClick={() => {
                                    onClose();
                                    handleRetryPayment(data);
                                }}
                                className="flex-1 py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-amber-100 flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50"
                            >
                                <FiAlertCircle size={16} /> ⚠️ Payment Incomplete - Pay Now
                            </button>
                        )}
                        {isCancellable && (
                            <button 
                                onClick={() => {
                                    onClose();
                                    setCancelModal({ isOpen: true, order: data });
                                }}
                                className="flex-1 py-4 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                            >
                                <FiSlash size={15} /> Cancel Order
                            </button>
                        )}
                        {data.status === "Delivered" && !hasActiveReturn && isEligibleForReturn && (
                            <button 
                                onClick={() => {
                                    onClose();
                                    handleOpenReturnModal(data);
                                }}
                                className="flex-1 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-slate-100 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                            >
                                <FiRotateCcw size={16} /> Return ({eligibilityInfo.daysRemaining} days left)
                            </button>
                        )}
                        {data.status === "Delivered" && (
                            <button 
                                onClick={() => {
                                    onClose();
                                    setReviewModal({ isOpen: true, data: data });
                                }}
                                className="flex-1 py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-amber-100 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                            >
                                <FiStar size={16} /> {review ? "Edit Review" : "Rate Order"}
                            </button>
                        )}
                        <button 
                            onClick={onClose}
                            className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
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
                        {/* Desktop Clean Uniform Table */}
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="w-full text-left border-collapse table-auto">
                                <thead>
                                    <tr className="bg-slate-50/70 border-b border-slate-100">
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Order ID</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Items & Pharmacy</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Schedule Date</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Bill & Payment</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Status</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {orders.map((order) => {
                                        const hasReturn = order.returnDetails && order.returnDetails.status && order.returnDetails.status !== 'None';
                                        const eligibility = checkOrderReturnWindow(order);
                                        const isCancellable = ['Placed', 'Under Review', 'Pending'].includes(order.status);
                                        const pendingPayment = isOrderPendingPayment(order);

                                        return (
                                            <tr key={order._id || order.orderId} className="hover:bg-slate-50/80 transition-colors">
                                                {/* Column 1: Order ID + Delivery Type */}
                                                <td className="px-6 py-5 align-middle">
                                                    <div className="flex flex-col gap-1 items-start">
                                                        <span className="text-xs font-black text-slate-900 tracking-wider font-mono">
                                                            #{order.orderId}
                                                        </span>
                                                        <DeliveryModeBadge deliveryMode={order.deliveryMode} slotSchedule={order.slotSchedule} />
                                                    </div>
                                                </td>

                                                {/* Column 2: Items & Pharmacy */}
                                                <td className="px-6 py-5 align-middle">
                                                    <div className="flex items-center gap-3.5">
                                                        <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xs shrink-0 border border-indigo-100/80">
                                                            {getPharmacyInitial(order)}
                                                        </div>
                                                        <div className="max-w-[210px]">
                                                            <p className="text-xs font-black text-slate-800 truncate leading-snug">{getItemNames(order.items)}</p>
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-0.5">{getPharmacyName(order)} • {order.itemsCount || order.items?.length || 1} Item(s)</p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Column 3: Date & Slot */}
                                                <td className="px-6 py-5 align-middle">
                                                    <div className="flex flex-col text-xs font-bold text-slate-700">
                                                        <span>{order.formattedDate || new Date(order.createdAt).toLocaleDateString()}</span>
                                                        <span className="text-[10px] font-medium text-slate-400 mt-0.5">
                                                            {order.slotSchedule?.timeSlot ? order.slotSchedule.timeSlot : (order.deliveryMode?.label || "Standard Time")}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Column 4: Price & Payment Badge */}
                                                <td className="px-6 py-5 align-middle">
                                                    <div className="flex flex-col gap-1 items-start">
                                                        <span className="text-sm font-black text-slate-900">₹{order.billSummary?.totalAmount}</span>
                                                        <PaymentBadge paymentInfo={order.paymentInfo} paymentStatus={order.paymentStatus} paymentMethod={order.paymentMethod} />
                                                    </div>
                                                </td>

                                                {/* Column 5: Status */}
                                                <td className="px-6 py-5 align-middle text-center">
                                                    <div className="inline-flex flex-col gap-1 items-center">
                                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border whitespace-nowrap ${getStatusStyle(order.status)}`}>
                                                            {order.status}
                                                        </span>
                                                        <ReturnStatusBadge returnDetails={order.returnDetails} />
                                                    </div>
                                                </td>

                                                {/* Column 6: Actions */}
                                                <td className="px-6 py-5 align-middle text-right">
                                                    <div className="inline-flex items-center justify-end gap-2 whitespace-nowrap">
                                                        {/* RETRY PAYMENT ACTION */}
                                                        {pendingPayment && (
                                                            <button 
                                                                disabled={retryingPaymentId === (order.orderId || order._id)}
                                                                onClick={() => handleRetryPayment(order)}
                                                                className="h-8 px-3 rounded-xl text-[10px] font-black uppercase bg-amber-500 hover:bg-amber-600 text-white transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                                                                title="Retry pending payment"
                                                            >
                                                                {retryingPaymentId === (order.orderId || order._id) ? (
                                                                    <FiRefreshCw className="animate-spin" size={11} />
                                                                ) : (
                                                                    <FiAlertCircle size={11} />
                                                                )}
                                                                Pay Now
                                                            </button>
                                                        )}

                                                        {/* CANCEL ORDER ACTION */}
                                                        {isCancellable && (
                                                            <button 
                                                                onClick={() => setCancelModal({ isOpen: true, order })}
                                                                className="h-8 px-3 rounded-xl text-[10px] font-black uppercase bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-all flex items-center gap-1 shadow-sm"
                                                                title="Cancel Order"
                                                            >
                                                                <FiSlash size={11} /> Cancel
                                                            </button>
                                                        )}

                                                        {order.status === "Delivered" && !hasReturn && (
                                                            eligibility.isEligible ? (
                                                                <button 
                                                                    onClick={() => handleOpenReturnModal(order)} 
                                                                    className="h-8 px-3 rounded-xl text-[10px] font-black uppercase bg-slate-900 hover:bg-slate-800 text-white transition-all flex items-center gap-1.5 shadow-sm"
                                                                    title="Request Return or Replacement"
                                                                >
                                                                    <FiRotateCcw size={11} /> Return
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    disabled
                                                                    title={eligibility.reason}
                                                                    className="h-8 px-2.5 rounded-xl text-[9px] font-black uppercase bg-slate-100 text-slate-400 border border-slate-200/60 opacity-40 cursor-not-allowed flex items-center gap-1 select-none"
                                                                >
                                                                    <FiLock size={10} /> Expired
                                                                </button>
                                                            )
                                                        )}

                                                        {order.status === "Delivered" && (
                                                            <button 
                                                                onClick={() => setReviewModal({ isOpen: true, data: order })} 
                                                                className="h-8 px-3 rounded-xl text-[10px] font-black uppercase bg-amber-500 hover:bg-amber-600 text-white transition-all flex items-center gap-1 shadow-sm"
                                                            >
                                                                <FiStar size={11} /> Rate
                                                            </button>
                                                        )}

                                                        <button 
                                                            onClick={() => handleOpenOrderDetails(order)} 
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
                        <div className="block lg:hidden divide-y divide-slate-100 px-4 md:px-6">
                            {orders.map((order) => {
                                const hasReturn = order.returnDetails && order.returnDetails.status && order.returnDetails.status !== 'None';
                                const eligibility = checkOrderReturnWindow(order);
                                const isCancellable = ['Placed', 'Under Review', 'Pending'].includes(order.status);
                                const pendingPayment = isOrderPendingPayment(order);

                                return (
                                    <div key={order._id || order.orderId} className="py-5 flex flex-col gap-3">
                                        <div className="flex justify-between items-start">
                                            <div className="flex gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-black text-xs shrink-0">
                                                    {getPharmacyInitial(order)}
                                                </div>
                                                <div>
                                                    <span className="text-[10px] font-black text-slate-400 tracking-wider">#{order.orderId}</span>
                                                    <h4 className="text-sm font-black text-slate-800 line-clamp-1 mt-0.5">{getItemNames(order.items)}</h4>
                                                    <p className="text-[10px] font-bold text-slate-400">{getPharmacyName(order)} • {order.itemsCount || order.items?.length || 1} Item(s)</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase ${getStatusStyle(order.status)}`}>{order.status}</span>
                                                <ReturnStatusBadge returnDetails={order.returnDetails} />
                                            </div>
                                        </div>

                                        {/* Mobile Badges Row */}
                                        <div className="flex flex-wrap gap-1.5 items-center">
                                            <PaymentBadge paymentInfo={order.paymentInfo} paymentStatus={order.paymentStatus} paymentMethod={order.paymentMethod} />
                                            <DeliveryModeBadge deliveryMode={order.deliveryMode} slotSchedule={order.slotSchedule} />
                                        </div>

                                        {/* Total & Date */}
                                        <div className="flex justify-between items-center text-xs font-bold text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                                            <span>{order.formattedDate || new Date(order.createdAt).toLocaleDateString()}</span>
                                            <span className="text-sm font-black text-slate-900">Total: ₹{order.billSummary?.totalAmount}</span>
                                        </div>

                                        {/* Mobile Action Buttons */}
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                                            {pendingPayment && (
                                                <button 
                                                    disabled={retryingPaymentId === (order.orderId || order._id)}
                                                    onClick={() => handleRetryPayment(order)} 
                                                    className="w-full bg-amber-500 hover:bg-amber-600 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-center text-white flex items-center justify-center gap-1.5 shadow-md shadow-amber-100 disabled:opacity-50 col-span-2 sm:col-span-1"
                                                >
                                                    {retryingPaymentId === (order.orderId || order._id) ? (
                                                        <FiRefreshCw className="animate-spin" size={12} />
                                                    ) : (
                                                        <FiAlertCircle size={12} />
                                                    )}
                                                    ⚠️ Pay Now
                                                </button>
                                            )}

                                            {isCancellable && (
                                                <button 
                                                    onClick={() => setCancelModal({ isOpen: true, order })} 
                                                    className="w-full bg-rose-50 hover:bg-rose-100 border border-rose-200 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-center text-rose-600 flex items-center justify-center gap-1 shadow-sm"
                                                >
                                                    <FiSlash size={12} /> Cancel
                                                </button>
                                            )}

                                            {order.status === "Delivered" && !hasReturn && (
                                                eligibility.isEligible ? (
                                                    <button 
                                                        onClick={() => handleOpenReturnModal(order)} 
                                                        className="w-full bg-slate-900 hover:bg-slate-800 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-center text-white flex items-center justify-center gap-1.5 shadow-sm"
                                                    >
                                                        <FiRotateCcw size={12} /> Return
                                                    </button>
                                                ) : (
                                                    <button 
                                                        disabled
                                                        className="w-full bg-slate-100 text-slate-400 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest text-center flex items-center justify-center gap-1 opacity-40 cursor-not-allowed border border-slate-200/50"
                                                    >
                                                        <FiLock size={10} /> Expired
                                                    </button>
                                                )
                                            )}
                                            {order.status === "Delivered" && (
                                                <button 
                                                    onClick={() => setReviewModal({ isOpen: true, data: order })} 
                                                    className="w-full bg-amber-500 hover:bg-amber-600 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-center text-white flex items-center justify-center gap-1 shadow-md shadow-amber-100"
                                                >
                                                    <FiStar /> Rate
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => handleOpenOrderDetails(order)} 
                                                className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-center border border-slate-200 bg-white ${
                                                    order.status !== "Delivered" && !pendingPayment && !isCancellable ? "col-span-2 sm:col-span-3" : ""
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
            <div className="p-4 md:p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
                <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Page {pagination.currentPage} of {pagination.totalPages}</p>
                <div className="flex gap-2">
                    <button disabled={pagination.currentPage === 1} onClick={() => loadOrders(pagination.currentPage - 1)} className="p-2 rounded-lg border border-slate-200 bg-white disabled:opacity-30"><FiChevronLeft size={16} /></button>
                    <button disabled={pagination.currentPage >= pagination.totalPages} onClick={() => loadOrders(pagination.currentPage + 1)} className="p-2 rounded-lg border border-slate-200 bg-white disabled:opacity-30"><FiChevronRight size={16} /></button>
                </div>
            </div>

            {/* Modals */}
            {modal.isOpen && modal.data && (
                <OrderDetailsModal 
                    data={modal.data} 
                    trackingData={modal.trackingData}
                    onClose={() => setModal({ isOpen: false, data: null, trackingData: null })} 
                />
            )}

            {cancelModal.isOpen && cancelModal.order && (
                <CancelOrderModal
                    isOpen={cancelModal.isOpen}
                    order={cancelModal.order}
                    onClose={() => setCancelModal({ isOpen: false, order: null })}
                />
            )}

            {cancelSuccessData && (
                <CancelSuccessModal
                    data={cancelSuccessData}
                    onClose={() => setCancelSuccessData(null)}
                />
            )}

            {reviewModal.isOpen && reviewModal.data && (
                <PharmacyReviewModal 
                    isOpen={reviewModal.isOpen} 
                    data={reviewModal.data} 
                    onClose={() => setReviewModal({ isOpen: false, data: null })} 
                />
            )}

            {returnModal.isOpen && returnModal.data && (
                <PharmacyReturnModal
                    isOpen={returnModal.isOpen}
                    order={returnModal.data}
                    eligibility={returnModal.eligibility}
                    onClose={() => setReturnModal({ isOpen: false, data: null, eligibility: null })}
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