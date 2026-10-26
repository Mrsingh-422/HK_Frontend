"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import UserAPI from '@/app/services/UserAPI';
import {
    FiCheckCircle, FiXCircle,
    FiCalendar, FiCreditCard,
    FiFileText, FiCornerDownRight, FiHash, FiClock,
    FiX, FiActivity, FiLayers, FiHome, FiSearch, FiRefreshCw,
    FiChevronLeft, FiChevronRight, FiUser, FiMapPin,
    FiDownload, FiPhone, FiTruck, FiKey, FiFile
} from 'react-icons/fi';
import { MdOutlineLocalPharmacy } from 'react-icons/md';
import { FaMoneyBillWave, FaVial } from 'react-icons/fa';

const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://192.168.1.26:5002";

// Helper to construct accurate prescription and profile image URLs
const getPrescriptionImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }
    const cleanedPath = path.replace(/^public\//, '');
    return `${IMAGE_BASE_URL}/${cleanedPath}`;
};

// Utility to dynamically load the Razorpay SDK script
const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        if (window.Razorpay) {
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

const LAB_TRACKING_STAGES = [
    { key: 'Confirmed', label: 'Order Confirmed' },
    { key: 'Phlebotomist Assigned', label: 'Phlebotomist Assigned' },
    { key: 'Arrived', label: 'Arrived at Location' },
    { key: 'Sample Collected', label: 'Sample Collected' },
    { key: 'Sample Deposited', label: 'Sample at Lab' },
    { key: 'Testing', label: 'Testing in Progress' },
    { key: 'Report Generated', label: 'Report Generated' },
    { key: 'Completed', label: 'Completed' }
];

export default function LabPrescriptionRequestsPage() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ current: 1, total: 1 });
    
    // Modal states
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [trackingData, setTrackingData] = useState(null);
    const [isLoadingTracking, setIsLoadingTracking] = useState(false);

    const [mounted, setMounted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [zoomedImage, setZoomedImage] = useState(null);

    // 1. Handle Mounting for Portals in Next.js
    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    // 2. Prevent body scroll when modal is open
    useEffect(() => {
        if (selectedRequest || trackingData || zoomedImage) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [selectedRequest, trackingData, zoomedImage]);

    useEffect(() => {
        fetchRequestsHistory(1);
    }, []);

    const fetchRequestsHistory = async (page) => {
        setLoading(true);
        try {
            const response = await UserAPI.getLabPrescriptionRequests(page, 10);
            if (response.success) {
                setRequests(response.data || []);
                setPagination({
                    current: response.currentPage || 1,
                    total: response.totalPages || 1
                });
            }
        } catch (error) {
            console.error("Error fetching lab prescription requests:", error);
        } finally {
            setLoading(false);
        }
    };

    // Phase 1: Open Pre-Payment / Review Modal
    const handleOpenDetails = async (request) => {
        setSelectedRequest(request);
        setIsLoadingDetails(true);
        try {
            if (UserAPI.getLabPrescriptionRequestDetails) {
                const res = await UserAPI.getLabPrescriptionRequestDetails(request.requestId || request._id);
                if (res?.success && res.data) {
                    setSelectedRequest(res.data);
                }
            }
        } catch (err) {
            console.warn("Details fetch fallback to list object:", err);
        } finally {
            setIsLoadingDetails(false);
        }
    };

    // Phase 2: Open Post-Payment Live Phlebotomist Tracking Modal
    const handleOpenLiveTracking = async (request) => {
        const bookingTarget = request.bookingId || request.confirmedBookingId || request._id;
        setIsLoadingTracking(true);
        setTrackingData({ bookingId: bookingTarget, initialData: request });
        try {
            if (UserAPI.trackLabBooking) {
                const res = await UserAPI.trackLabBooking(bookingTarget);
                if (res?.success && res.data) {
                    setTrackingData(res.data);
                }
            }
        } catch (err) {
            console.error("Error fetching live tracking:", err);
        } finally {
            setIsLoadingTracking(false);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Pending Review': return 'bg-amber-50 text-amber-600 border-amber-200';
            case 'Reviewing': return 'bg-blue-50 text-blue-600 border-blue-200';
            case 'Bill Generated': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'Confirmed': return 'bg-green-50 text-green-700 border-green-200';
            case 'Completed': return 'bg-teal-50 text-teal-700 border-teal-200';
            case 'Rejected': return 'bg-rose-50 text-rose-600 border-rose-200';
            default: return 'bg-slate-50 text-slate-500 border-slate-200';
        }
    };

    // --- PAYMENT ACTION HANDLER (API 5 & 6) ---
    const handleCheckout = async (request, method) => {
        setIsSubmitting(true);
        try {
            const res = await UserAPI.initializeLabPrescriptionPayment({
                requestId: request.requestId || request._id,
                paymentMethod: method
            });

            if (method === "COD") {
                if (res && res.success) {
                    alert(res.message || "Prescription order confirmed with COD successfully!");
                    setSelectedRequest(null);
                    fetchRequestsHistory(pagination.current);
                } else {
                    alert(res?.message || "Failed to confirm COD booking.");
                }
                setIsSubmitting(false);
            } else {
                if (res && res.success && res.razorpayOrderId) {
                    const isScriptLoaded = await loadRazorpayScript();
                    if (!isScriptLoaded) {
                        alert("Failed to load Razorpay SDK. Please check your network connection.");
                        setIsSubmitting(false);
                        return;
                    }

                    const { key_id, amount, razorpayOrderId, appointmentId } = res;

                    const options = {
                        key: key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                        amount: amount,
                        currency: "INR",
                        name: "Health Kangaroo Diagnostic Labs",
                        description: `Prescription Inquiry #${request.requestId}`,
                        order_id: razorpayOrderId,
                        prefill: {
                            name: request.address?.name || "User",
                            contact: request.address?.phone || "9999999999"
                        },
                        theme: { color: "#08B36A" },
                        modal: {
                            ondismiss: function () {
                                setIsSubmitting(false);
                            }
                        },
                        handler: async function (response) {
                            try {
                                setIsSubmitting(true);

                                const verificationPayload = {
                                    appointmentId: appointmentId || request._id,
                                    razorpayOrderId: response.razorpay_order_id || razorpayOrderId,
                                    razorpayPaymentId: response.razorpay_payment_id,
                                    razorpaySignature: response.razorpay_signature
                                };

                                const verificationRes = await UserAPI.verifyLabPrescriptionPayment(verificationPayload);

                                if (verificationRes?.success) {
                                    alert(verificationRes.message || "Payment verified and lab booking confirmed!");
                                    setSelectedRequest(null);
                                    fetchRequestsHistory(pagination.current);

                                    const targetBookingId = verificationRes.bookingId || verificationRes.data?.bookingId || request._id;
                                    handleOpenLiveTracking({ ...request, confirmedBookingId: targetBookingId, bookingId: targetBookingId });
                                } else {
                                    alert(verificationRes?.message || "Payment verification failed.");
                                }
                            } catch (verificationError) {
                                console.error("Payment Verification Error:", verificationError);
                                alert("Something went wrong during payment verification.");
                            } finally {
                                setIsSubmitting(false);
                            }
                        }
                    };

                    const rzpInstance = new window.Razorpay(options);
                    rzpInstance.on('payment.failed', function (response) {
                        alert(`Payment failed: ${response.error.description}`);
                        setIsSubmitting(false);
                    });
                    rzpInstance.open();

                } else {
                    alert(res?.message || "Failed to initiate payment. Please try again.");
                    setIsSubmitting(false);
                }
            }
        } catch (error) {
            console.error("Checkout Initialization Error:", error);
            alert("An error occurred during booking initialization.");
            setIsSubmitting(false);
        }
    };

    // ==============================================================
    // 🔍 MODAL PORTAL: PHASE 1 (PRE-PAYMENT PRESCRIPTION DETAILS)
    // ==============================================================
    const PrescriptionDetailsModal = ({ request, onClose, onCheckout, isSubmitting, isLoading }) => {
        if (!mounted || !request) return null;

        const isPaid = request.status === 'Confirmed' || Boolean(request.isPaid);
        const verifiedTests = request.verifiedBill?.tests || request.verifiedTests || [];

        return createPortal(
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 font-sans">
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity duration-300" onClick={onClose} />

                <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">

                    {/* Header */}
                    <div className="p-6 md:p-8 pb-4 flex justify-between items-start shrink-0 border-b border-slate-100">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Inquiry Details</p>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 font-mono">#{request.requestId}</h3>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                            <FiXCircle size={26} className="text-slate-300 hover:text-slate-600" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="px-6 md:px-8 py-4 overflow-y-auto custom-scrollbar flex-1 space-y-6 text-xs">
                        
                        {isLoading && (
                            <div className="py-2 text-center text-xs font-bold text-emerald-600 animate-pulse flex items-center justify-center gap-2">
                                <div className="w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                                Synchronizing quotation details...
                            </div>
                        )}

                        {/* Status Check / Reason for Rejection */}
                        {request.status === 'Rejected' && (
                            <div className="p-5 bg-rose-50 border border-rose-200 rounded-[2rem] flex items-start gap-3 text-rose-800">
                                <FiXCircle className="text-rose-500 mt-0.5 shrink-0" size={18} />
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wide">Inquiry Rejected</p>
                                    <p className="text-xs mt-1 font-medium">{request.rejectReason || "Prescription is illegible or reagents out of stock."}</p>
                                </div>
                            </div>
                        )}

                        {/* General details card */}
                        <div className="p-5 bg-slate-50 border border-slate-100 rounded-[2rem] space-y-2">
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-slate-400 uppercase tracking-wider">Laboratory</span>
                                <span className="font-bold text-slate-800 uppercase">{request.labId?.name || "Diagnostic Laboratory"}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-slate-400 uppercase tracking-wider">Collection Mode</span>
                                <span className="font-semibold text-slate-700">{request.collectionType || "Home Collection"}</span>
                            </div>
                            {request.appointmentTime && (
                                <div className="flex justify-between items-center text-xs">
                                    <span className="font-bold text-slate-400 uppercase tracking-wider">Requested Slot</span>
                                    <span className="font-semibold text-emerald-700">{request.appointmentTime}</span>
                                </div>
                            )}
                        </div>

                        {/* Uploaded Prescription Image Section */}
                        {request.prescriptionImage && (
                            <div className="space-y-2">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Prescription Attachment</p>
                                <div className="relative aspect-video w-full rounded-[2rem] overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center p-2 group">
                                    <img 
                                        src={getPrescriptionImageUrl(request.prescriptionImage)} 
                                        className="max-h-full max-w-full object-contain cursor-zoom-in transition-opacity rounded-xl" 
                                        alt="Prescription document"
                                        onClick={() => setZoomedImage(getPrescriptionImageUrl(request.prescriptionImage))}
                                    />
                                    <div 
                                        onClick={() => setZoomedImage(getPrescriptionImageUrl(request.prescriptionImage))}
                                        className="absolute inset-0 bg-slate-950/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                    >
                                        <span className="text-white text-[10px] font-black uppercase tracking-widest bg-slate-900/80 px-4 py-2 rounded-full">View Fullscreen</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Assigned Patients */}
                        {request.patients && request.patients.length > 0 && (
                            <div className="space-y-2.5">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Assigned Patients</p>
                                <div className="space-y-2">
                                    {request.patients.map((patient, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                                            <div className="flex items-center gap-2.5">
                                                <FiUser className="text-emerald-500" size={14} />
                                                <p className="text-xs font-bold text-slate-800">{patient.name}</p>
                                            </div>
                                            <span className="text-[10px] text-slate-500 uppercase font-semibold">{patient.relation}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Verified Tests / Quotation Section */}
                        {verifiedTests.length > 0 ? (
                            <div className="space-y-2.5">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Lab-Verified Diagnostic Tests</p>
                                <div className="space-y-2">
                                    {verifiedTests.map((test, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                                            <div className="flex items-center gap-2.5">
                                                <FaVial className="text-emerald-500 shrink-0" size={13} />
                                                <p className="text-xs font-bold text-slate-800 uppercase">{test.name || test.testName}</p>
                                            </div>
                                            <span className="font-bold text-xs text-slate-900">₹{test.pricePerUnit || test.price || 0}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            /* Fallback to Inquired Tests */
                            request.requestedTests && request.requestedTests.length > 0 && (
                                <div className="space-y-2.5">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Inquired Tests</p>
                                    <div className="flex flex-wrap gap-2 px-1">
                                        {request.requestedTests.map((test, idx) => (
                                            <span key={idx} className="inline-block px-3 py-1 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold">
                                                {test.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )
                        )}

                        {/* Delivery Location Details */}
                        {request.address && (
                            <div className="space-y-2">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Sample Pickup Location</p>
                                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-1.5">
                                    <div className="flex justify-between">
                                        <span className="font-bold text-slate-400">Recipient</span>
                                        <span className="font-semibold text-slate-800">{request.address.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-bold text-slate-400">Phone</span>
                                        <span className="font-semibold text-slate-600">{request.address.phone}</span>
                                    </div>
                                    <div className="flex justify-between pt-1 border-t border-slate-200">
                                        <span className="font-bold text-slate-400">Address</span>
                                        <span className="font-semibold text-slate-600 text-right truncate max-w-[220px]">
                                            {request.address.houseNo}, {request.address.city} - {request.address.pincode}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Verified Bill Invoice Breakdown */}
                        {(request.status === 'Bill Generated' || isPaid) && (
                            <div className="p-5 bg-slate-900 rounded-[2rem] text-white space-y-3">
                                <div className="flex justify-between items-center pb-2 border-b border-white/10 text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                                    <span>Verified Quotation Bill</span>
                                    <span>#{request.requestId}</span>
                                </div>

                                <div className="space-y-2 text-xs text-slate-300">
                                    <div className="flex justify-between">
                                        <span>Tests Subtotal</span>
                                        <span className="font-semibold text-white">₹{request.verifiedBill?.itemTotal || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Home Sample Collection Fee</span>
                                        <span className="font-semibold text-white">₹{request.verifiedBill?.homeVisitCharge || request.verifiedBill?.deliveryCharge || 0}</span>
                                    </div>
                                    <div className="h-px bg-white/10 my-1" />
                                    <div className="flex justify-between text-sm font-bold text-white pt-1">
                                        <span>Grand Total</span>
                                        <span className="text-emerald-400 text-lg">₹{request.verifiedBill?.totalAmount || request.totalAmount}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Reviewing State Banner */}
                        {(request.status === 'Pending Review' || request.status === 'Reviewing') && (
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-center gap-3">
                                <FiClock size={20} className="text-blue-600 animate-spin shrink-0" />
                                <p className="text-xs font-semibold text-blue-900 leading-relaxed">
                                    The laboratory is currently reviewing your prescription, checking reagent stock, and preparing your quotation bill.
                                </p>
                            </div>
                        )}

                    </div>

                    {/* Footer Actions */}
                    <div className="p-5 md:p-6 bg-slate-50 border-t border-slate-100 flex gap-3 shrink-0">
                        {request.status === 'Bill Generated' && !isPaid ? (
                            <button
                                onClick={() => onCheckout(request, "Online")}
                                disabled={isSubmitting}
                                className="flex-1 py-4 bg-[#08B36A] hover:bg-[#079c5c] text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <FiCreditCard size={15} />
                                )}
                                <span>Pay ₹{request.verifiedBill?.totalAmount || request.totalAmount}</span>
                            </button>
                        ) : isPaid ? (
                            <button
                                onClick={() => {
                                    onClose();
                                    handleOpenLiveTracking(request);
                                }}
                                className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                            >
                                <FiTruck size={15} />
                                <span>Track Sample &amp; Reports</span>
                            </button>
                        ) : null}

                        <button onClick={onClose} className="flex-1 py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl text-xs font-bold uppercase tracking-wider hover:bg-slate-100 cursor-pointer">
                            Close
                        </button>
                    </div>

                </div>
            </div>,
            document.body
        );
    };

    // ==============================================================
    // 🧪 MODAL PORTAL: PHASE 2 (POST-PAYMENT SAMPLE & REPORT TRACKING)
    // ==============================================================
    const SampleTrackingModal = ({ tracking, onClose, isLoading }) => {
        if (!mounted || !tracking) return null;

        const currentStage = tracking.status || tracking.trackingStatus || 'Confirmed';
        const phlebotomist = tracking.phlebotomist || tracking.driver || tracking.agent || {};
        const pickupOtp = tracking.pickupOtp || tracking.otp || tracking.securityPin;
        const reportPdf = tracking.reportPdf || tracking.reportUrl;

        const getStageIndex = (stage) => {
            const idx = LAB_TRACKING_STAGES.findIndex(s => s.key.toLowerCase() === (stage || '').toLowerCase());
            return idx === -1 ? 0 : idx;
        };

        const activeIndex = getStageIndex(currentStage);

        return createPortal(
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 font-sans">
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity duration-300" onClick={onClose} />

                <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                    
                    {/* Header */}
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 md:p-8 pb-6 flex justify-between items-start shrink-0">
                        <div>
                            <div className="flex items-center gap-2 mb-1 text-emerald-400">
                                <FaVial size={13} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Live Sample &amp; Report Tracking</span>
                            </div>
                            <h3 className="text-xl font-bold font-mono">
                                #{tracking.bookingId || tracking.initialData?.bookingId || "LAB-CONFIRMED"}
                            </h3>
                            <p className="text-xs text-slate-400 mt-1">Status: <strong className="text-emerald-400">{currentStage}</strong></p>
                        </div>
                        <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white/80 hover:text-white transition">
                            <FiX size={20} />
                        </button>
                    </div>

                    <div className="p-6 md:p-8 overflow-y-auto space-y-6 flex-1 custom-scrollbar text-xs">
                        
                        {isLoading && (
                            <div className="py-2 text-center text-xs font-bold text-emerald-600 animate-pulse flex items-center justify-center gap-2">
                                <div className="w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                                Synchronizing live collection status...
                            </div>
                        )}

                        {/* Doorstep Sample Collection Security OTP */}
                        {pickupOtp && (
                            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-dashed border-emerald-300 rounded-2xl p-4 text-center">
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-800 block mb-1">
                                    Sample Collection Security OTP
                                </span>
                                <div className="text-3xl font-black tracking-[0.25em] text-[#08B36A] font-mono">
                                    {pickupOtp}
                                </div>
                                <p className="text-[10px] text-slate-500 font-medium mt-1">
                                    Share this security PIN with your assigned phlebotomist upon sample collection.
                                </p>
                            </div>
                        )}

                        {/* Final Report Download Banner */}
                        {reportPdf && (
                            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                                        <FiFile size={16} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-emerald-950">Diagnostic Report Ready</p>
                                        <p className="text-[10px] text-emerald-700">Verified by certified pathologist</p>
                                    </div>
                                </div>
                                <a 
                                    href={`${IMAGE_BASE_URL}${reportPdf}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="px-3.5 py-1.5 bg-[#08B36A] hover:bg-[#079c5c] text-white rounded-xl font-bold text-[11px] uppercase tracking-wide flex items-center gap-1.5 shadow-sm"
                                >
                                    <FiDownload size={12} /> View PDF
                                </a>
                            </div>
                        )}

                        {/* Lifecycle Stepper */}
                        <div className="space-y-3">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sample Lifecycle Progress</p>
                            <div className="space-y-3 pl-2 border-l-2 border-slate-100">
                                {LAB_TRACKING_STAGES.map((stage, idx) => {
                                    const isDone = idx <= activeIndex;
                                    const isCurrent = idx === activeIndex;

                                    return (
                                        <div key={stage.key} className="relative flex items-center gap-3 pl-4">
                                            <div className={`absolute -left-[9px] w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                                isDone ? 'bg-[#08B36A] border-[#08B36A] text-white' : 'bg-white border-slate-200'
                                            }`}>
                                                {isDone && <FiCheckCircle size={10} />}
                                            </div>
                                            <div>
                                                <p className={`text-xs font-bold ${isCurrent ? 'text-emerald-700' : isDone ? 'text-slate-800' : 'text-slate-400'}`}>
                                                    {stage.label}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Assigned Phlebotomist Details */}
                        {phlebotomist?.name && (
                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                                    Assigned Phlebotomist
                                </span>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-[#08B36A] flex items-center justify-center font-bold">
                                            <FiUser size={18} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 text-xs">{phlebotomist.name}</p>
                                            <p className="text-[10px] text-slate-500">Certified Healthcare Technician</p>
                                        </div>
                                    </div>
                                    {phlebotomist.phone && (
                                        <a href={`tel:${phlebotomist.phone}`} className="p-2.5 bg-white border border-slate-200 rounded-xl text-emerald-600 hover:bg-emerald-50">
                                            <FiPhone size={14} />
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}

                    </div>

                    <div className="p-5 bg-slate-50 border-t border-slate-100 flex justify-end">
                        <button onClick={onClose} className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl text-xs uppercase cursor-pointer">
                            Close
                        </button>
                    </div>

                </div>
            </div>,
            document.body
        );
    };

    if (loading && requests.length === 0) {
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
                    <h2 className="text-xl font-semibold text-slate-800">Lab Prescription Requests</h2>
                    <p className="text-sm text-slate-400">View diagnostic quotes, test breakdowns &amp; sample tracking</p>
                </div>
            </div>

            <div className="space-y-4">
                {requests.map((request) => {
                    const isPaidOrTracking = request.status === 'Confirmed' || request.status === 'Completed' || Boolean(request.isPaid);

                    return (
                        <div key={request._id} className="bg-white border border-slate-100 rounded-3xl p-6 transition-all hover:border-emerald-200 hover:shadow-xl hover:shadow-slate-200/40 group">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                <div className="flex-1 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${getStatusStyle(request.status)}`}>
                                            {request.status}
                                        </div>
                                        <span className="text-[11px] font-mono font-medium text-slate-400 flex items-center gap-1">
                                            <FiHash size={12} /> {request.requestId}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-emerald-600 transition-colors">
                                            <FaVial size={20} />
                                        </div>
                                        <div>
                                            <h4 className="text-base font-semibold text-slate-800">{request.labId?.name || "Diagnostic Laboratory"}</h4>
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-500">
                                                <span>Requested {new Date(request.createdAt).toLocaleDateString()}</span>
                                                {request.collectionType && (
                                                    <>
                                                        <span className="hidden sm:inline text-slate-300">•</span>
                                                        <span>Mode: {request.collectionType}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between lg:justify-end gap-6 border-t lg:border-t-0 pt-4 lg:pt-0">
                                    <div className="lg:text-right lg:px-6">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Quoted Total</p>
                                        <p className="text-lg font-bold text-slate-900">
                                            {request.status === 'Bill Generated' || isPaidOrTracking 
                                                ? `₹${request.verifiedBill?.totalAmount || request.totalAmount}` 
                                                : 'Pending Review'}
                                        </p>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleOpenDetails(request)}
                                            className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all shadow-md cursor-pointer"
                                        >
                                            View Details
                                        </button>

                                        {isPaidOrTracking && (
                                            <button
                                                onClick={() => handleOpenLiveTracking(request)}
                                                className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                                            >
                                                <FiTruck size={14} />
                                                <span>Track</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Modal: Phase 1 Pre-Payment Quotation Details */}
            {selectedRequest && (
                <PrescriptionDetailsModal
                    request={selectedRequest}
                    onClose={() => setSelectedRequest(null)}
                    onCheckout={handleCheckout}
                    isSubmitting={isSubmitting}
                    isLoading={isLoadingDetails}
                />
            )}

            {/* Modal: Phase 2 Post-Payment Live Phlebotomist Tracking */}
            {trackingData && (
                <SampleTrackingModal
                    tracking={trackingData}
                    onClose={() => setTrackingData(null)}
                    isLoading={isLoadingTracking}
                />
            )}

            {/* Fullscreen Lightbox for Prescription Image */}
            {zoomedImage && (
                <div 
                    className="fixed inset-0 z-[200000] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm animate-in fade-in duration-200 cursor-pointer"
                    onClick={() => setZoomedImage(null)}
                >
                    <div className="relative max-w-4xl max-h-[85vh] w-full h-full flex items-center justify-center">
                        <button 
                            onClick={() => setZoomedImage(null)}
                            className="absolute top-4 right-4 z-[200001] p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                        >
                            <FiXCircle size={24} />
                        </button>
                        <img 
                            src={zoomedImage} 
                            className="max-w-full max-h-full object-contain rounded-2xl animate-in zoom-in-95 duration-200 cursor-default" 
                            alt="Zoomed Prescription"
                            onClick={(e) => e.stopPropagation()} 
                        />
                    </div>
                </div>
            )}

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
            `}</style>
        </div>
    );
}