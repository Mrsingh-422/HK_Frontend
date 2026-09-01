"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import UserAPI from '../../../../services/UserAPI'; 
import {
    FiX, FiTruck, FiPackage, FiLayers,
    FiRefreshCw, FiClock, FiSearch, FiChevronLeft, FiChevronRight,
    FiUser, FiMapPin, FiCreditCard, FiStar, FiRotateCcw, FiUploadCloud,
    FiAlertCircle, FiInfo, FiTrash2, FiLock, FiCheck, FiFileText
} from 'react-icons/fi';
import { HiStar } from 'react-icons/hi';
import { MdOutlineLocalPharmacy, MdOutlineRateReview, MdOutlineAssignmentReturn } from 'react-icons/md';

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

// --- SUB-COMPONENT: RETURN STATUS BADGE (ALL ENUMS) ---
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
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${styles[returnDetails.status] || 'bg-slate-100 text-slate-600'}`}>
            <FiRotateCcw size={10} /> {returnDetails.requestType || 'Return'}: {returnDetails.status}
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

    // Fallback: 7 Days Delivery Window Calculation
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
    const [modal, setModal] = useState({ isOpen: false, data: null });
    const [reviewModal, setReviewModal] = useState({ isOpen: false, data: null });
    const [returnModal, setReturnModal] = useState({ isOpen: false, data: null, eligibility: null });
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useEffect(() => {
        if (modal.isOpen || reviewModal.isOpen || returnModal.isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [modal.isOpen, reviewModal.isOpen, returnModal.isOpen]);

    // --- DATA FETCHING ---
    const loadOrders = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const res = await UserAPI.getPharmacyOrders(page, 10);
            if (res && res.success) {
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

    // Open Return Modal with live eligibility check & Admin T&C
    const handleOpenReturnModal = async (order) => {
        try {
            const trackingRes = await UserAPI.getPharmacyOrderTracking(order._id);
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
        if (status === 'Delivered') return 'text-emerald-600 bg-emerald-50';
        if (status === 'Shipped') return 'text-indigo-600 bg-indigo-50';
        if (status === 'Cancelled') return 'text-rose-500 bg-rose-50';
        return 'text-amber-600 bg-amber-50'; 
    };

    const getItemNames = (items) => {
        if (!items || items.length === 0) return "General Medicines";
        return items.map(i => i.name).join(", ");
    };

    // --- MODAL: RETURN & REPLACEMENT (SECTION 3.4 WITH ADMIN T&C) ---
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
            "Damaged or Leaked Item",
            "Expired Product Delivered",
            "Wrong Product Delivered",
            "Seal Broken / Opened Packaging",
            "Defective / Non-Functional Device"
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

                const res = await UserAPI.submitPharmacyReturnRequest(order._id, formData);

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
                        {/* Drug Compliance Notice */}
                        <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100/80">
                            <FiAlertCircle className="text-amber-600 shrink-0 mt-0.5" size={18} />
                            <p className="text-[11px] font-semibold text-amber-800 leading-relaxed">
                                <strong className="font-bold">Drug Safety Regulations:</strong> Ingestible prescription medicines cannot be returned or replaced once delivered. Applicable strictly to medical devices, health monitors, and sealed OTC products.
                            </p>
                        </div>

                        {/* Request Type Selector */}
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

                        {/* User Comments */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Patient's Comments (Optional)</label>
                            <textarea
                                value={userComments}
                                onChange={(e) => setUserComments(e.target.value)}
                                rows={3}
                                placeholder="E.g., The digital screen of the BP monitor is cracked or not turning on."
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400 resize-none"
                            />
                        </div>

                        {/* Proof Photos */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Proof Images (Optional, Max 5)</label>
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

                        {/* 📜 DYNAMIC ADMIN TERMS & CONDITIONS (SECTION 3.3) */}
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

    // --- MODAL: ORDER DETAILS (WITH RETURN OTP & CANCEL FLOW) ---
    const OrderDetailsModal = ({ data, onClose }) => {
        const [review, setReview] = useState(null);
        const [reviewLoading, setReviewLoading] = useState(false);
        const [eligibility, setEligibility] = useState(null);
        const [cancellingReturn, setCancellingReturn] = useState(false);

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
                        const trackRes = await UserAPI.getPharmacyOrderTracking(data._id);
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

        // Cancel return request handler (SECTION 3.5)
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
                        {/* Status Stepper Card */}
                        <div className="bg-slate-900 rounded-[2rem] p-6 md:p-8 text-white relative overflow-hidden">
                            <FiTruck size={120} className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none" />
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Current Progress</p>
                                    <ReturnStatusBadge returnDetails={data.returnDetails} />
                                </div>
                                <h2 className="text-3xl font-black mb-6">{data.status}</h2>
                                <StatusStepper status={data.status} />
                                <div className="mt-6 flex flex-wrap gap-3">
                                    <div className="px-3 py-1.5 bg-white/10 rounded-lg text-[10px] font-bold flex items-center gap-2"><FiClock/> {data.appointmentTime || 'Standard Delivery'}</div>
                                    <div className="px-3 py-1.5 bg-white/10 rounded-lg text-[10px] font-bold flex items-center gap-2"><FiPackage/> {data.collectionType || 'Doorstep Delivery'}</div>
                                </div>
                            </div>
                        </div>

                        {/* REVERSE LOGISTICS & OTP TRACKING CARD (SECTION 3.3) */}
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

                                {/* Cancel Return Request Action */}
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

                        {/* Standard Return Details when not in pickup mode */}
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

                        {/* Eligibility / Window Status Banner */}
                        {!hasActiveReturn && data.status === "Delivered" && (
                            <div className={`p-5 rounded-[2rem] border flex items-start gap-3 ${
                                isEligibleForReturn
                                    ? "bg-emerald-50/60 border-emerald-100 text-emerald-800"
                                    : "bg-slate-50 border-slate-200 text-slate-500"
                            }`}>
                                {isEligibleForReturn ? (
                                    <FiInfo className="shrink-0 mt-0.5 text-emerald-600" size={16} />
                                ) : (
                                    <FiLock className="shrink-0 mt-0.5 text-slate-400" size={16} />
                                )}
                                <div className="text-xs">
                                    {isEligibleForReturn ? (
                                        <p className="font-bold">
                                            Return window active: <span className="font-black text-emerald-900">{eligibilityInfo.daysRemaining} days left</span> to request a return or replacement.
                                        </p>
                                    ) : (
                                        <p className="font-semibold">
                                            {eligibilityInfo.reason || "Return window closed: Return/Replacement was only allowed within policy days."}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Items Section */}
                        <div className="space-y-4">
                            <h4 className="font-black text-[10px] uppercase tracking-widest text-slate-400 flex items-center gap-2 px-1">
                                <FiLayers className="text-indigo-500" /> Order Manifest
                            </h4>
                            <div className="space-y-2">
                                {data.items?.map((item, i) => (
                                    <div key={i} className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100 hover:border-indigo-100 transition-colors">
                                        <div>
                                            <p className="font-black text-slate-800 text-sm">{item.name}</p>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">{item.duration || 'Pack'} • Qty: {item.quantity}</p>
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

                        {/* Verified Feedback Block */}
                        {data.status === "Delivered" && (
                            <div className="space-y-4">
                                <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Order Review Details</h5>
                                {reviewLoading ? (
                                    <div className="flex items-center gap-2 bg-slate-50 p-6 rounded-[2rem] border border-slate-100 text-xs font-semibold text-slate-400">
                                        <FiRefreshCw className="animate-spin text-slate-400" size={14} />
                                        <span>Syncing feedback history...</span>
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

                        {/* Payment Invoice */}
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

                    {/* Actions Footer */}
                    <div className="p-6 md:p-8 bg-slate-50/50 border-t flex flex-wrap gap-3 shrink-0">
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
                        <button className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 active:scale-[0.98] transition-all">
                            Invoice
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
                        {/* Desktop Table */}
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
                                    {orders.map((order) => {
                                        const hasReturn = order.returnDetails && order.returnDetails.status && order.returnDetails.status !== 'None';
                                        const eligibility = checkOrderReturnWindow(order);

                                        return (
                                            <tr key={order._id} className="hover:bg-slate-50/80 transition-colors group">
                                                <td className="px-8 py-6">
                                                    <span className="text-xs font-black text-slate-900 tracking-wider">#{order.orderId}</span>
                                                </td>
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
                                                    <div className="flex flex-col gap-1 items-start">
                                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusStyle(order.status)}`}>
                                                            {order.status}
                                                        </span>
                                                        <ReturnStatusBadge returnDetails={order.returnDetails} />
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <div className="flex gap-2 justify-end items-center">
                                                        {order.status === "Delivered" && !hasReturn && (
                                                            eligibility.isEligible ? (
                                                                <button 
                                                                    onClick={() => handleOpenReturnModal(order)} 
                                                                    className="px-3.5 py-2.5 rounded-xl text-[10px] font-black uppercase bg-slate-900 hover:bg-slate-800 text-white transition-all flex items-center gap-1.5 shadow-sm"
                                                                    title="Request Return or Replacement"
                                                                >
                                                                    <FiRotateCcw size={12} /> Return
                                                                </button>
                                                            ) : (
                                                                /* BLURRED / DISABLED BUTTON WHEN WINDOW CLOSED */
                                                                <button
                                                                    disabled
                                                                    title={eligibility.reason}
                                                                    className="px-3 py-2.5 rounded-xl text-[9px] font-black uppercase bg-slate-100 text-slate-400 border border-slate-200/60 opacity-40 cursor-not-allowed filter blur-[0.2px] flex items-center gap-1 select-none"
                                                                >
                                                                    <FiLock size={10} /> Expired
                                                                </button>
                                                            )
                                                        )}
                                                        {order.status === "Delivered" && (
                                                            <button 
                                                                onClick={() => setReviewModal({ isOpen: true, data: order })} 
                                                                className="px-3.5 py-2.5 rounded-xl text-[10px] font-black uppercase bg-amber-500 hover:bg-amber-600 text-white transition-all flex items-center gap-1 shadow-md shadow-amber-100"
                                                            >
                                                                <FiStar /> Rate
                                                            </button>
                                                        )}
                                                        <button 
                                                            onClick={() => setModal({ isOpen: true, data: order })} 
                                                            className="bg-white border border-slate-200 text-slate-600 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase hover:bg-slate-900 hover:text-white transition-all"
                                                        >
                                                            Details
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

                                return (
                                    <div key={order._id} className="py-5 flex flex-col gap-4">
                                        <div className="flex justify-between items-start">
                                            <div className="flex gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-black text-xs shrink-0">{order.pharmacyId?.name?.charAt(0)}</div>
                                                <div>
                                                    <span className="text-[10px] font-black text-slate-400 tracking-wider">#{order.orderId}</span>
                                                    <h4 className="text-sm font-black text-slate-800 line-clamp-1 mt-0.5">{getItemNames(order.items)}</h4>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase ${getStatusStyle(order.status)}`}>{order.status}</span>
                                                <ReturnStatusBadge returnDetails={order.returnDetails} />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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
                                                        className="w-full bg-slate-100 text-slate-400 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest text-center flex items-center justify-center gap-1 opacity-40 cursor-not-allowed border border-slate-200/50 filter blur-[0.2px]"
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
                                                onClick={() => setModal({ isOpen: true, data: order })} 
                                                className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-center border border-slate-200 bg-white ${
                                                    order.status !== "Delivered" ? "col-span-2 sm:col-span-3" : ""
                                                }`}
                                            >
                                                Details
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
                    onClose={() => setModal({ isOpen: false, data: null })} 
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