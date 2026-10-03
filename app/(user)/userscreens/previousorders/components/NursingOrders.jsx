"use client";
import UserAPI from '@/app/services/UserAPI';
import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

import {
    FiX, FiStar, FiArrowLeft, FiClock,
    FiUser, FiAward, FiDownload, FiRefreshCw,
    FiSearch, FiMapPin, FiActivity, FiLoader,
    FiCheck, FiInfo, FiDollarSign, FiShoppingBag,
    FiAlertTriangle, FiTrash2, FiCheckCircle
} from 'react-icons/fi';
import { MdVerified, MdOutlineMedicalServices, MdLocalHospital } from 'react-icons/md';

// Dynamic image path builder
const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://via.placeholder.com/200';
    if (imagePath.startsWith('http')) return imagePath;
    const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://your-api-domain.com';
    const cleanPath = imagePath.replace(/^public\//, "");
    return `${BASE_URL}/${cleanPath}`;
};

const CANCELLABLE_STATUSES = ["Pending", "Confirmed", "Assigned", "On-The-Way", "Arrived"];

const COMMON_CANCEL_REASONS = [
    "Patient discharged early from hospital",
    "Emergency resolved / Patient recovered",
    "Booked by mistake / Change of plans",
    "Nurse delayed / Timing conflict",
    "Other personal reasons"
];

// --- SUB-COMPONENT: TRACKER ---
const StatusStepper = ({ status }) => {
    const steps = ["Pending", "Confirmed", "Assigned", "On-The-Way", "Arrived", "Service-Started", "Completed"];
    
    if (status === 'Cancelled') {
        return (
            <div className="w-full py-4 bg-rose-50 border border-rose-100 rounded-2xl p-4 flex items-center justify-between text-rose-700 animate-fadeIn">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                        <FiX size={16} />
                    </div>
                    <div>
                        <p className="text-xs font-black uppercase tracking-wider">Booking Cancelled</p>
                        <p className="text-[10px] font-semibold text-rose-500">This service was cancelled. Any eligible refund is processed.</p>
                    </div>
                </div>
            </div>
        );
    }

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
        <div className="w-full py-4 md:py-10 px-1 md:px-4">
            <div className="relative flex items-center justify-between">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-100 -z-10"></div>
                <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-[#08B36A] transition-all duration-1000 z-10"
                    style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                ></div>
                {steps.map((step, index) => {
                    const stepLabel = step === "Service-Started" ? "In-Service" : step;
                    return (
                        <div key={step} className="flex flex-col items-center gap-1.5 md:gap-2.5 relative z-20">
                            <div className={`w-3 h-3 md:w-3.5 md:h-3.5 rounded-full border-2 transition-all duration-500 ${
                                index <= currentStep ? "bg-[#08B36A] border-emerald-100 ring-2 md:ring-4 ring-emerald-50" : "bg-white border-slate-200"
                            }`}></div>
                            <span className={`text-[7.5px] md:text-[9px] font-black uppercase tracking-tighter md:tracking-[0.15em] whitespace-nowrap ${
                                index <= currentStep ? "text-slate-900" : "text-slate-400"
                            }`}>{stepLabel}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// --- SUB-COMPONENT: STAR RATER ---
const StarRating = ({
    title,
    onBack,
    onSubmit,
    rating,
    setRating,
    comment,
    setComment,
    existingReview,
    submitting,
    loadingReview
}) => {
    const [hover, setHover] = useState(0);

    if (loadingReview) {
        return (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
                <FiLoader className="text-[#08B36A] animate-spin" size={28} />
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Checking prior reviews...</p>
            </div>
        );
    }

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
                className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase mb-6 md:mb-8 hover:text-[#08B36A] transition-colors mx-auto disabled:opacity-50"
            >
                <FiArrowLeft /> Back to Profile
            </button>
            <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-2 tracking-tight">
                {existingReview ? "Edit Your Review" : "Rate Provider"}
            </h3>
            <p className="text-slate-500 text-xs md:text-sm mb-6 md:mb-8 font-medium">
                How was your session with {title}?
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
                            className="transform transition-transform active:scale-90 disabled:opacity-50 hover:scale-110"
                        >
                            <FiStar className={`${(hover || rating) >= s ? "fill-amber-400 text-amber-400 drop-shadow-md" : "text-slate-200"} transition-all size-8 sm:size-10 md:size-11`} />
                        </button>
                    ))}
                </div>
                <span className="text-xs font-bold text-slate-600 mt-1 transition-all duration-300">
                    {getRatingLabel(hover || rating)}
                </span>
            </div>

            {/* Comment Area */}
            <div className="mb-6 max-w-md mx-auto text-left">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block pl-1">
                    Review Comment (Optional)
                </label>
                <textarea
                    disabled={submitting}
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Describe your service experience here..."
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 text-xs md:text-sm font-semibold outline-none ring-1 ring-slate-100 focus:ring-[#08B36A] transition-all resize-none"
                />
            </div>

            <button
                disabled={rating === 0 || submitting}
                onClick={() => onSubmit(rating, comment)}
                className={`w-full py-4 md:py-5 rounded-xl md:rounded-[24px] font-black text-[10px] md:text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
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
    const [searchTerm, setSearchTerm] = useState("");
    const [modal, setModal] = useState({ isOpen: false, type: 'details', data: null });
    const [mounted, setMounted] = useState(false);

    // Review & Ratings States
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [existingReview, setExistingReview] = useState(null);
    const [loadingReview, setLoadingReview] = useState(false);
    const [submittingReview, setSubmittingReview] = useState(false);

    // Cancellation UI States
    const [cancelModal, setCancelModal] = useState({ isOpen: false, booking: null });
    const [cancelReason, setCancelReason] = useState(COMMON_CANCEL_REASONS[0]);
    const [customCancelReason, setCustomCancelReason] = useState("");
    const [cancelling, setCancelling] = useState(false);
    const [cancellationResult, setCancellationResult] = useState(null);

    // 1. Handle Mounting for Portals
    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    // 2. Prevent body scroll when modal is open
    useEffect(() => {
        if (modal.isOpen || cancelModal.isOpen || cancellationResult) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [modal.isOpen, cancelModal.isOpen, cancellationResult]);

    // Fetch Orders Data
    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            const response = await UserAPI.getNursingBookings();
            if (response.success) {
                setOrders(response.data || []);
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

    // Fetch Prior Review Details
    useEffect(() => {
        if (modal.isOpen && modal.data?._id) {
            const fetchReview = async () => {
                try {
                    setLoadingReview(true);
                    const res = await UserAPI.getReviewsByOrder(modal.data._id);
                    if (res.success && (res.data || res.hasReviewed)) {
                        const reviewData = res.data || res.review;
                        setExistingReview(reviewData);
                        setRating(reviewData?.rating || 0);
                        setComment(reviewData?.comment || "");
                    } else {
                        setExistingReview(null);
                        setRating(0);
                        setComment("");
                    }
                } catch (err) {
                    console.error("Error fetching review:", err);
                    setExistingReview(null);
                } finally {
                    setLoadingReview(false);
                }
            };
            fetchReview();
        }
    }, [modal.isOpen, modal.data?._id]);

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
                    nurseId: modal.data.nurseId?._id,
                    rating: selectedRating,
                    comment: selectedComment
                });
            }

            if (response.success) {
                alert(response.message || "Review process finished successfully!");
                setModal({ isOpen: false, type: 'details', data: null });
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

    // Open Cancellation Dialog
    const openCancelDialog = (booking) => {
        setCancelModal({ isOpen: true, booking });
        setCancelReason(COMMON_CANCEL_REASONS[0]);
        setCustomCancelReason("");
    };

    // Process Cancellation Request (PATCH /user/nurse/cancel/:id)
    const handleConfirmCancellation = async () => {
        if (!cancelModal.booking?._id) return;
        const finalReason = customCancelReason.trim() || cancelReason;

        try {
            setCancelling(true);
            const response = await UserAPI.cancelNurseBooking(cancelModal.booking._id, finalReason);
            
            if (response?.success) {
                setCancellationResult(response.data || {
                    bookingId: cancelModal.booking.bookingId,
                    status: "Cancelled",
                    cancellationFee: 0,
                    refundAmount: cancelModal.booking.priceBreakdown?.totalPrice || cancelModal.booking.paymentDetails?.amount || 0
                });

                // Update in local state
                setOrders(prev => prev.map(o => o._id === cancelModal.booking._id ? { ...o, status: 'Cancelled' } : o));
                if (modal.data?._id === cancelModal.booking._id) {
                    setModal(prev => ({ ...prev, data: { ...prev.data, status: 'Cancelled' } }));
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

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Confirmed': return 'text-blue-600 bg-blue-50 border border-blue-100';
            case 'Assigned': return 'text-indigo-600 bg-indigo-50 border border-indigo-100';
            case 'On-The-Way': return 'text-violet-600 bg-violet-50 border border-violet-100';
            case 'Arrived': return 'text-teal-600 bg-teal-50 border border-teal-100';
            case 'Service-Started': return 'text-sky-600 bg-sky-50 border border-sky-100';
            case 'Completed': return 'text-[#08B36A] bg-emerald-50 border border-emerald-100';
            case 'Cancelled': return 'text-rose-600 bg-rose-50 border border-rose-100';
            case 'Pending': 
            default: return 'text-amber-600 bg-amber-50 border border-amber-100';
        }
    };

    const filteredOrders = orders.filter(order =>
        order.bookingId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.nurseId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // --- DETAILS MODAL PORTAL ---
    const NursingDetailsModal = ({ data, type, onClose }) => {
        if (!mounted) return null;

        const isCancellable = CANCELLABLE_STATUSES.includes(data.status);
        const isHospital = data.assessmentLocation === "At Hospital" || Boolean(data.hospitalDetails);

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
                                <h3 className="font-black text-slate-900 text-sm md:text-base tracking-tight uppercase">Case File: {data.bookingId}</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nursing Service Record</p>
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
                            <div className="space-y-8">
                                {/* Provider Profile */}
                                <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-center md:items-start">
                                    <div className="relative shrink-0">
                                        <img
                                            src={getImageUrl(data.nurseId?.profileImage)}
                                            className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] md:rounded-[3rem] object-cover ring-8 ring-slate-50 shadow-md"
                                            onError={(e) => e.target.src = 'https://via.placeholder.com/200'}
                                            alt=""
                                        />
                                        <div className="absolute -bottom-2 -right-2 bg-white shadow-xl p-2 rounded-2xl">
                                            <div className="bg-[#08B36A] text-white p-2 rounded-xl text-sm"><FiActivity /></div>
                                        </div>
                                    </div>
                                    <div className="text-center md:text-left flex-1">
                                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-2 leading-tight flex items-center gap-2 justify-center md:justify-start">
                                            {data.nurseId?.name} <MdVerified className="text-[#08B36A]" />
                                        </h2>
                                        <p className="text-[#08B36A] font-black uppercase text-[10px] tracking-[0.2em] mb-6">Verified Healthcare Professional</p>
                                        <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                                            <div className="bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-100">
                                                <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5 tracking-widest">Service Type</p>
                                                <p className="text-xs font-black text-slate-900 uppercase">{data.serviceDetails?.title || "Care Session"}</p>
                                            </div>
                                            <div className="bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-100">
                                                <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5 tracking-widest">Session Duration</p>
                                                <p className="text-xs font-black text-slate-900 uppercase">{data.serviceDetails?.duration || "Standard"}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Live Progress Tracker */}
                                <div className="pt-4">
                                    <h4 className="font-black text-[10px] uppercase tracking-[0.25em] text-slate-400 mb-2 px-1">Live Tracking</h4>
                                    <StatusStepper status={data.status} />
                                </div>

                                {/* Schedule & Location Details */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                                        <p className="text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest flex items-center gap-2"><FiClock className="text-[#08B36A]" /> Schedule Dates</p>
                                        <div className="space-y-1.5 text-xs text-slate-700 font-semibold leading-relaxed">
                                            <p className="font-black text-slate-900">
                                                Start: {data.schedule?.startDate ? new Date(data.schedule.startDate).toLocaleDateString() : 'N/A'}
                                            </p>
                                            <p className="font-black text-slate-900">
                                                End: {data.schedule?.endDate ? new Date(data.schedule.endDate).toLocaleDateString() : 'N/A'}
                                            </p>
                                            <p className="text-[10px] text-[#08B36A] font-bold uppercase tracking-wider">
                                                Window: {data.schedule?.startTime} - {data.schedule?.endTime} ({data.schedule?.duration})
                                            </p>
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                                        <p className="text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest flex items-center gap-2">
                                            {isHospital ? <MdLocalHospital className="text-purple-600" /> : <FiMapPin className="text-[#08B36A]" />} 
                                            Care Environment
                                        </p>
                                        <div className="space-y-1.5 text-xs text-slate-700 font-semibold leading-relaxed">
                                            <p className="font-black text-slate-900 uppercase">{data.assessmentLocation || "At Home"}</p>
                                            {isHospital && data.hospitalDetails ? (
                                                <p className="text-slate-600 font-bold">
                                                    {data.hospitalDetails.hospitalName} • {data.hospitalDetails.wardName} (Bed {data.hospitalDetails.bedNumber})
                                                </p>
                                            ) : (
                                                <p className="text-[10px] text-slate-400 uppercase tracking-widest">Doorstep Clinical Service</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Details Grid: Patients & Addresses */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <h4 className="font-black text-[10px] uppercase tracking-widest text-slate-400 flex items-center gap-2 px-1"><FiUser className="text-[#08B36A]" /> Patient Info</h4>
                                        {data.patients?.map((patient, i) => (
                                            <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                                <p className="font-black text-slate-800 text-sm">{patient.name}</p>
                                                <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">{patient.relation} • {patient.gender} • {patient.age} Yrs</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="space-y-3">
                                        <h4 className="font-black text-[10px] uppercase tracking-widest text-slate-400 flex items-center gap-2 px-1"><FiMapPin className="text-[#08B36A]" /> Service Location</h4>
                                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                            <p className="text-xs font-bold text-slate-600 leading-relaxed">
                                                {data.address?.houseNo}, {data.address?.sector}, {data.address?.city}, {data.address?.state} - {data.address?.pincode}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Consumed Medical Supplies */}
                                {data.selectedConsumables && data.selectedConsumables.length > 0 && (
                                    <div className="space-y-4 pt-4 border-t border-slate-100">
                                        <h4 className="font-black text-[10px] uppercase tracking-widest text-slate-400 flex items-center gap-2 px-1">
                                            <FiShoppingBag className="text-[#08B36A]" /> Consumed Supplies & Accessories
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {data.selectedConsumables.map((item, i) => (
                                                <div key={item._id || i} className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/40 flex justify-between items-center transition-all hover:border-emerald-200">
                                                    <div>
                                                        <p className="font-black text-slate-800 text-xs uppercase">{item.itemName}</p>
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">Quantity Type: {item.unitType}</p>
                                                    </div>
                                                    <p className="font-black text-sm text-slate-950">₹{item.price}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Pricing Breakdown Panel */}
                                <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white space-y-6">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 bg-white/10 rounded-xl text-[#08B36A]">
                                            <FiDollarSign size={18} />
                                        </div>
                                        <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Payment Invoice & Costing</h5>
                                    </div>
                                    <div className="space-y-3 text-xs font-bold border-b border-white/10 pb-6 mb-6">
                                        <div className="flex justify-between text-slate-400">
                                            <span>Base Service Fee</span>
                                            <span>₹{data.priceBreakdown?.baseServicePrice ?? data.serviceDetails?.basePrice ?? 0}</span>
                                        </div>
                                        {data.priceBreakdown?.slotSurcharge > 0 && (
                                            <div className="flex justify-between text-slate-400">
                                                <span>Slot Surcharge</span>
                                                <span>+ ₹{data.priceBreakdown.slotSurcharge}</span>
                                            </div>
                                        )}
                                        {data.priceBreakdown?.consumableTotal > 0 && (
                                            <div className="flex justify-between text-slate-400">
                                                <span>Consumable Total</span>
                                                <span>+ ₹{data.priceBreakdown.consumableTotal}</span>
                                            </div>
                                        )}
                                        {data.priceBreakdown?.fasterServiceCharge > 0 && (
                                            <div className="flex justify-between text-slate-400">
                                                <span>Faster Service Surcharge</span>
                                                <span>+ ₹{data.priceBreakdown.fasterServiceCharge}</span>
                                            </div>
                                        )}
                                        {data.priceBreakdown?.taxAmount > 0 && (
                                            <div className="flex justify-between text-slate-400">
                                                <span>Tax Surcharge</span>
                                                <span>+ ₹{data.priceBreakdown.taxAmount}</span>
                                            </div>
                                        )}
                                        {data.priceBreakdown?.couponDiscount > 0 && (
                                            <div className="flex justify-between text-rose-400">
                                                <span>Coupon Discount</span>
                                                <span>- ₹{data.priceBreakdown.couponDiscount}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-[#08B36A] tracking-widest">Grand Total</p>
                                            <p className="text-3xl font-black">₹{data.priceBreakdown?.totalPrice ?? data.paymentDetails?.amount ?? 0}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Paid via {data.paymentDetails?.method || data.paymentMethod || "Online"}</p>
                                            <p className="text-xs font-black text-[#08B36A] uppercase mt-1">
                                                {data.paymentDetails?.status || data.paymentStatus || "Paid"}
                                            </p>
                                        </div>
                                    </div>
                                    {data.paymentDetails?.razorpayPaymentId && (
                                        <div className="pt-4 border-t border-white/5 text-[9px] font-bold text-slate-500 uppercase tracking-wider flex flex-col sm:flex-row justify-between gap-2">
                                            <span>Txn Ref: {data.paymentDetails.razorpayPaymentId}</span>
                                            <span>Paid: {new Date(data.paymentDetails.paidAt || Date.now()).toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Action Bar */}
                                <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row gap-4">
                                    {data.status === "Completed" && (
                                        <button
                                            onClick={() => setModal(prev => ({ ...prev, type: 'rating' }))}
                                            className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-slate-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                                        >
                                            <FiStar size={14} /> {existingReview ? "Edit Review & Rating" : "Rate Service"}
                                        </button>
                                    )}

                                    {isCancellable && (
                                        <button
                                            onClick={() => openCancelDialog(data)}
                                            className="flex-1 py-4 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 rounded-2xl font-black text-[11px] uppercase tracking-widest active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                                        >
                                            <FiTrash2 size={14} />
                                            <span>Cancel Booking</span>
                                        </button>
                                    )}

                                    <button 
                                        onClick={() => window.print()}
                                        className="flex-1 py-4 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-2xl font-black text-[11px] uppercase tracking-widest active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        <FiDownload size={14} /> Download Receipt
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <StarRating
                                title={data?.nurseId?.name}
                                onBack={() => setModal(prev => ({ ...prev, type: 'details' }))}
                                onSubmit={handleReviewSubmit}
                                rating={rating}
                                setRating={setRating}
                                comment={comment}
                                setComment={setComment}
                                existingReview={existingReview}
                                submitting={submittingReview}
                                loadingReview={loadingReview}
                            />
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
                    <h3 className="font-black text-slate-900 text-lg md:text-xl tracking-tight">Service Registry</h3>
                    <p className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-widest mt-1">Nursing & Professional Care</p>
                </div>
                <div className="relative w-full sm:w-72">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search provider or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-11 pr-4 text-xs md:text-sm font-semibold outline-none ring-1 ring-slate-100 focus:ring-[#08B36A] transition-all"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <FiLoader className="text-[#08B36A] animate-spin" size={28} />
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Syncing Records...</p>
                </div>
            ) : filteredOrders.length === 0 ? (
                <div className="text-center py-16 text-slate-400 text-xs font-medium">No booking history recorded.</div>
            ) : (
                <>
                    {/* Desktop View */}
                    <div className="hidden lg:block overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">ID</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Provider</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Service</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Cost</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredOrders.map((order) => {
                                    const isCancellable = CANCELLABLE_STATUSES.includes(order.status);
                                    return (
                                        <tr key={order._id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-8 py-6 text-xs font-bold text-slate-400 tracking-tighter">#{order.bookingId}</td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden shrink-0 shadow-sm border-2 border-white">
                                                        <img src={getImageUrl(order.nurseId?.profileImage)} className="w-full h-full object-cover" onError={(e) => e.target.src = 'https://via.placeholder.com/100'} alt="" />
                                                    </div>
                                                    <p className="text-sm font-black text-slate-800 leading-none">{order.nurseId?.name}</p>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-xs font-bold text-slate-600">{order.serviceDetails?.title || "Daily Care Session"}</td>
                                            <td className="px-8 py-6 text-xs font-bold text-slate-800">{order.schedule?.startDate ? new Date(order.schedule.startDate).toLocaleDateString() : 'N/A'}</td>
                                            <td className="px-8 py-6 text-sm font-black text-slate-900">₹{order.priceBreakdown?.totalPrice ?? order.paymentDetails?.amount ?? 0}</td>
                                            <td className="px-8 py-6">
                                                <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${getStatusStyle(order.status)}`}>{order.status}</span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button 
                                                        onClick={() => setModal({ isOpen: true, type: 'details', data: order })} 
                                                        className="px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest bg-white border border-slate-200 text-slate-600 hover:bg-slate-900 hover:text-white transition-all cursor-pointer"
                                                    >
                                                        Details
                                                    </button>
                                                    {isCancellable && (
                                                        <button 
                                                            onClick={() => openCancelDialog(order)}
                                                            className="p-2 rounded-xl text-rose-500 bg-rose-50 hover:bg-rose-100 border border-rose-100 transition-all cursor-pointer"
                                                            title="Cancel Booking"
                                                        >
                                                            <FiTrash2 size={12} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile View */}
                    <div className="block lg:hidden divide-y divide-slate-100 px-4">
                        {filteredOrders.map((order) => {
                            const isCancellable = CANCELLABLE_STATUSES.includes(order.status);
                            return (
                                <div key={order._id} className="py-5 flex flex-col gap-3.5">
                                    <div className="flex justify-between items-start">
                                        <div className="flex gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden shrink-0"><img src={getImageUrl(order.nurseId?.profileImage)} className="w-full h-full object-cover" onError={(e) => e.target.src = 'https://via.placeholder.com/100'} alt="" /></div>
                                            <div>
                                                <span className="text-[10px] font-black text-slate-400">#{order.bookingId}</span>
                                                <h4 className="text-sm font-black text-slate-800 mt-0.5">{order.nurseId?.name}</h4>
                                            </div>
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase ${getStatusStyle(order.status)}`}>{order.status}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => setModal({ isOpen: true, type: 'details', data: order })} 
                                            className="flex-1 bg-white border border-slate-200 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-center shadow-sm cursor-pointer"
                                        >
                                            Details
                                        </button>
                                        {isCancellable && (
                                            <button 
                                                onClick={() => openCancelDialog(order)} 
                                                className="px-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest text-center shadow-sm cursor-pointer"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            {/* --- Portal Details Modal --- */}
            {modal.isOpen && modal.data && (
                <NursingDetailsModal
                    data={modal.data}
                    type={modal.type}
                    onClose={() => setModal({ isOpen: false, type: 'details', data: null })}
                />
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
                            <button onClick={() => setCancelModal({ isOpen: false, booking: null })} className="text-slate-400 hover:text-slate-600 p-1">
                                <FiX size={20} />
                            </button>
                        </div>

                        <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl text-xs space-y-1">
                            <p className="font-bold text-amber-900 flex items-center gap-1.5">
                                <FiAlertTriangle /> Automated Refund & Benefit Policy
                            </p>
                            <p className="text-[11px] text-amber-800">
                                Eligible refunds will be automatically credited to your original payment method, and free subscription visits will be restored.
                            </p>
                        </div>

                        {/* Reason Select */}
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

                        {/* Custom Reason */}
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

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2">
                            <button
                                type="button"
                                disabled={cancelling}
                                onClick={() => setCancelModal({ isOpen: false, booking: null })}
                                className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black rounded-xl text-xs uppercase tracking-wider transition-all"
                            >
                                Back
                            </button>
                            <button
                                type="button"
                                disabled={cancelling}
                                onClick={handleConfirmCancellation}
                                className="flex-1 py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20"
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

            {/* --- CANCELLATION REFUND SUMMARY MODAL --- */}
            {cancellationResult && mounted && createPortal(
                <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-6 sm:p-8 shadow-2xl border border-slate-100 text-center space-y-5">
                        <div className="w-16 h-16 mx-auto bg-emerald-50 rounded-2xl flex items-center justify-center text-[#08B36A] border border-emerald-100">
                            <FiCheckCircle size={32} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900">Booking Cancelled</h3>
                            <p className="text-xs text-slate-500 font-semibold mt-1">Ref: {cancellationResult.bookingId}</p>
                        </div>

                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-xs space-y-2 text-left">
                            <div className="flex justify-between">
                                <span className="text-slate-400 font-medium">Cancellation Fee:</span>
                                <span className="font-bold text-slate-800">₹{cancellationResult.cancellationFee || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400 font-medium">Refund Amount:</span>
                                <span className="font-black text-[#08B36A] text-sm">₹{cancellationResult.refundAmount || 0}</span>
                            </div>
                            <div className="flex justify-between border-t border-slate-200/60 pt-2">
                                <span className="text-slate-400 font-medium">Status:</span>
                                <span className="font-black text-rose-600 uppercase">Cancelled</span>
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

export default NursingOrders;