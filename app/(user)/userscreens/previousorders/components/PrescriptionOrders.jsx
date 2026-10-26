"use client";
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import UserAPI from '../../../../services/UserAPI';
import {
    FiCheckCircle, FiXCircle,
    FiCalendar, FiCreditCard,
    FiFileText, FiCornerDownRight, FiHash, FiClock,
    FiTruck, FiPhone, FiUser, FiPackage, FiMapPin, FiNavigation
} from 'react-icons/fi';
import { MdOutlineLocalPharmacy } from 'react-icons/md';

const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://192.168.1.26:5002";

// Helper to construct accurate prescription and profile image URLs
const getPrescriptionImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }
    const cleanedPath = path.replace(/^public\//, '').replace(/^\//, '');
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

const DELIVERY_STAGES = [
    { key: 'Placed', label: 'Order Placed' },
    { key: 'Packed', label: 'Packed' },
    { key: 'Shipped', label: 'Shipped' },
    { key: 'OutForDelivery', label: 'Out for Delivery' },
    { key: 'ReachedLocation', label: 'Rider Arrived' },
    { key: 'Delivered', label: 'Delivered' }
];

export default function PrescriptionOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ current: 1, total: 1 });
    
    // Modals
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [trackingOrderData, setTrackingOrderData] = useState(null);
    const [isLoadingTracking, setIsLoadingTracking] = useState(false);

    const [mounted, setMounted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [zoomedPrescription, setZoomedPrescription] = useState(null);

    // 1. Handle Mounting for Portals in Next.js
    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    // 2. Prevent body scroll when modal is open
    useEffect(() => {
        if (selectedOrder || trackingOrderData || zoomedPrescription) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [selectedOrder, trackingOrderData, zoomedPrescription]);

    useEffect(() => {
        fetchOrders(1);
    }, []);

    const fetchOrders = async (page) => {
        setLoading(true);
        try {
            const response = await UserAPI.getAllPrescriptionRequests(page, 10);
            if (response.success) {
                setOrders(response.data || []);
                setPagination({
                    current: response.currentPage || 1,
                    total: response.totalPages || 1
                });
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    };

    // Phase 1: Open Pre-Payment / Review Modal
    const handleOpenDetails = async (order) => {
        setSelectedOrder(order);
        setIsLoadingDetails(true);
        try {
            if (UserAPI.getPrescriptionRequestDetails) {
                const res = await UserAPI.getPrescriptionRequestDetails(order._id || order.requestId);
                if (res?.success && res.data) {
                    setSelectedOrder(res.data);
                }
            }
        } catch (err) {
            console.warn("Details fetch fallback to list object:", err);
        } finally {
            setIsLoadingDetails(false);
        }
    };

    // Phase 2: Open Post-Payment Live Delivery Tracking Modal
    const handleOpenLiveTracking = async (order) => {
        const orderIdToTrack = order.confirmedOrderId || order.orderId || order._id;
        setIsLoadingTracking(true);
        setTrackingOrderData({ orderId: orderIdToTrack, initialData: order });
        try {
            if (UserAPI.trackPharmacyOrder) {
                const res = await UserAPI.trackPharmacyOrder(orderIdToTrack);
                if (res?.success && res.data) {
                    setTrackingOrderData(res.data);
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
            case 'Paid': return 'bg-teal-50 text-teal-700 border-teal-200';
            case 'Delivered': return 'bg-green-50 text-green-700 border-green-200';
            case 'Rejected': return 'bg-rose-50 text-rose-600 border-rose-200';
            default: return 'bg-slate-50 text-slate-500 border-slate-200';
        }
    };

    // --- PAYMENT ACTION HANDLER ---
    const handleCheckout = async (order) => {
        setIsSubmitting(true);
        try {
            const isScriptLoaded = await loadRazorpayScript();
            if (!isScriptLoaded) {
                alert("Failed to load Razorpay SDK. Please check your network connection.");
                setIsSubmitting(false);
                return;
            }

            // Step 1: Initiate payment to get Razorpay order parameters
            const res = await UserAPI.payPrescriptionRequest({
                requestId: order._id,
                paymentMethod: "Online"
            });

            if (res && res.success) {
                const { key_id, amount, razorpayOrderId, appointmentId } = res;

                const options = {
                    key: key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                    amount: amount,
                    currency: "INR",
                    name: "Health Kangaroo Pharmacy",
                    description: `Prescription Request #${order.requestId}`,
                    order_id: razorpayOrderId,
                    prefill: {
                        name: order.address?.name || "Patient",
                        email: "user@example.com",
                        contact: order.address?.phone || ""
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

                            // Step 2: Signature verification & conversion to confirmed order
                            const verificationPayload = {
                                appointmentId: appointmentId || order._id,
                                razorpayOrderId: response.razorpay_order_id || razorpayOrderId,
                                razorpayPaymentId: response.razorpay_payment_id,
                                razorpaySignature: response.razorpay_signature
                            };

                            const verificationRes = await UserAPI.verifyPaymentPrescriptionPharmacy(verificationPayload);

                            if (verificationRes?.success) {
                                alert(verificationRes.message || "Prescription payment verified and order placed successfully!");
                                setSelectedOrder(null);
                                fetchOrders(pagination.current);

                                // Automatically open tracking modal with converted orderId
                                const targetOrderId = verificationRes.orderId || verificationRes.data?.orderId || order._id;
                                handleOpenLiveTracking({ ...order, confirmedOrderId: targetOrderId, orderId: targetOrderId });
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
                    alert(`Payment failed: ${response.error?.description}`);
                    setIsSubmitting(false);
                });
                rzpInstance.open();

            } else {
                alert(res?.message || "Failed to initiate payment. Please try again.");
                setIsSubmitting(false);
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
    const PrescriptionDetailsModal = ({ order, onClose, onCheckout, isSubmitting, isLoading }) => {
        if (!mounted || !order) return null;

        const verifiedItems = order.verifiedBill?.medicines || order.verifiedMedicines || order.requestedMedicines || [];
        const isPaid = order.status === 'Paid' || Boolean(order.isPaid);

        return createPortal(
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6">
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity duration-300" onClick={onClose} />

                <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
                    
                    {/* Header */}
                    <div className="p-6 md:p-8 pb-4 flex justify-between items-start shrink-0 border-b border-slate-100">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Prescription Review</p>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 font-mono">#{order.requestId}</h3>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                            <FiXCircle size={26} className="text-slate-300 hover:text-slate-600" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="px-6 md:px-8 py-4 overflow-y-auto custom-scrollbar flex-1 space-y-6">
                        
                        {isLoading && (
                            <div className="py-2 text-center text-xs font-bold text-emerald-600 animate-pulse flex items-center justify-center gap-2">
                                <div className="w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                                Synchronizing live bill status...
                            </div>
                        )}

                        {/* Rejection Notice */}
                        {order.status === 'Rejected' && (
                            <div className="p-5 bg-rose-50 border border-rose-200 rounded-[2rem] flex items-start gap-3 text-rose-800">
                                <FiXCircle className="text-rose-500 mt-0.5 shrink-0" size={18} />
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wide">Request Rejected by Pharmacy</p>
                                    <p className="text-xs mt-1 font-medium">{order.rejectReason || "Prescription is illegible or medicines out of stock."}</p>
                                </div>
                            </div>
                        )}

                        {/* Doctor & Prescription Overview */}
                        <div className="p-5 bg-slate-50 border border-slate-100 rounded-[2rem] space-y-2">
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-slate-400 uppercase tracking-wider">Prescribed Doctor</span>
                                <span className="font-bold text-slate-800">{order.doctorName || "Doctor Prescription"}</span>
                            </div>
                            {order.prescriptionDate && (
                                <div className="flex justify-between items-center text-xs">
                                    <span className="font-bold text-slate-400 uppercase tracking-wider">Prescription Date</span>
                                    <span className="font-semibold text-slate-600">{new Date(order.prescriptionDate).toLocaleDateString()}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-slate-400 uppercase tracking-wider">Course Duration</span>
                                <span className="font-semibold text-slate-600">{order.durationType || "Complete Course"}</span>
                            </div>
                        </div>

                        {/* Uploaded Prescription Attachment Image */}
                        {order.prescriptionImage && (
                            <div className="space-y-2">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Prescription Attachment</p>
                                <div className="relative aspect-video w-full rounded-[2rem] overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center p-2 group">
                                    <img 
                                        src={getPrescriptionImageUrl(order.prescriptionImage)} 
                                        className="max-h-full max-w-full object-contain cursor-zoom-in transition-opacity rounded-xl" 
                                        alt="Prescription document"
                                        onClick={() => setZoomedPrescription(getPrescriptionImageUrl(order.prescriptionImage))}
                                    />
                                    <div 
                                        onClick={() => setZoomedPrescription(getPrescriptionImageUrl(order.prescriptionImage))}
                                        className="absolute inset-0 bg-slate-950/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                    >
                                        <span className="text-white text-[10px] font-black uppercase tracking-widest bg-slate-900/80 px-4 py-2 rounded-full">View Fullscreen</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Verified Medicines Section */}
                        <div className="space-y-2.5">
                            <div className="flex justify-between items-center ml-1">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                                    {order.status === 'Bill Generated' || isPaid ? "Pharmacist-Verified Medicines" : "Requested Medicines"}
                                </p>
                                <span className="text-[10px] font-bold text-slate-400">{verifiedItems.length} Items</span>
                            </div>

                            <div className="space-y-2.5">
                                {verifiedItems.map((med, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                                        <div className="flex gap-2.5">
                                            <FiCornerDownRight className="mt-1 text-emerald-500 shrink-0" size={15} />
                                            <div>
                                                <p className="text-xs font-bold text-slate-800 uppercase">{med.name || med.medicineName}</p>
                                                <p className="text-[10px] text-slate-500">
                                                    Qty: {med.dosage || med.quantity || 1} {med.durationDays ? `• ${med.durationDays} Days` : ''}
                                                </p>
                                            </div>
                                        </div>
                                        {(med.mrp || med.price) && (
                                            <p className="text-xs font-black text-slate-900">₹{med.mrp || med.price}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Destination Address */}
                        {order.address && (
                            <div className="space-y-2">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Delivery Destination</p>
                                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-1.5 text-xs">
                                    <div className="flex justify-between">
                                        <span className="font-bold text-slate-400">Recipient</span>
                                        <span className="font-semibold text-slate-800">{order.address.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-bold text-slate-400">Phone</span>
                                        <span className="font-semibold text-slate-600">{order.address.phone}</span>
                                    </div>
                                    <div className="flex justify-between text-[11px] pt-1 border-t border-slate-200">
                                        <span className="font-bold text-slate-400">Address</span>
                                        <span className="font-semibold text-slate-600 text-right truncate max-w-[220px]">
                                            {order.address.houseNo}, {order.address.city} - {order.address.pincode}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Verified Bill Invoice Breakdown */}
                        {(order.status === 'Bill Generated' || isPaid) && (
                            <div className="p-5 bg-slate-900 rounded-[2rem] text-white space-y-3">
                                <div className="flex justify-between items-center pb-2 border-b border-white/10 text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                                    <span>Verified Tax Invoice</span>
                                    <span>#{order.requestId}</span>
                                </div>

                                <div className="space-y-2 text-xs text-slate-300">
                                    <div className="flex justify-between">
                                        <span>Medicines Subtotal</span>
                                        <span className="font-semibold text-white">₹{order.verifiedBill?.itemTotal || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>GST / Taxes</span>
                                        <span className="font-semibold text-white">₹{order.verifiedBill?.gst || order.verifiedBill?.tax || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Delivery Fee</span>
                                        <span className="font-semibold text-white">₹{order.verifiedBill?.deliveryCharge || 0}</span>
                                    </div>
                                    <div className="h-px bg-white/10 my-1" />
                                    <div className="flex justify-between text-sm font-bold text-white pt-1">
                                        <span>Total Amount</span>
                                        <span className="text-emerald-400 text-lg">₹{order.verifiedBill?.totalAmount || order.totalAmount}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Reviewing Notice Banner */}
                        {(order.status === 'Pending Review' || order.status === 'Reviewing') && (
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-center gap-3">
                                <FiClock size={20} className="text-blue-600 animate-spin shrink-0" />
                                <p className="text-xs font-semibold text-blue-900 leading-relaxed">
                                    The pharmacy is currently reviewing stock, verifying medicines, and generating your invoice.
                                </p>
                            </div>
                        )}

                    </div>

                    {/* Footer Actions */}
                    <div className="p-5 md:p-6 bg-slate-50 border-t border-slate-100 flex gap-3 shrink-0">
                        {order.status === 'Bill Generated' && !isPaid ? (
                            <button
                                onClick={() => onCheckout(order)}
                                disabled={isSubmitting}
                                className="flex-1 py-4 bg-[#08B36A] hover:bg-[#079c5c] text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <FiCreditCard size={15} />
                                )}
                                <span>Pay ₹{order.verifiedBill?.totalAmount || order.totalAmount}</span>
                            </button>
                        ) : isPaid ? (
                            <button
                                onClick={() => {
                                    onClose();
                                    handleOpenLiveTracking(order);
                                }}
                                className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                            >
                                <FiTruck size={15} />
                                <span>Live Delivery Tracking</span>
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
    // 🚚 MODAL PORTAL: PHASE 2 (POST-PAYMENT LIVE DELIVERY TRACKING)
    // ==============================================================
    const DeliveryTrackingModal = ({ trackingData, onClose, isLoading }) => {
        if (!mounted || !trackingData) return null;

        const currentStage = trackingData.deliveryStatus || trackingData.status || 'Placed';
        const driver = trackingData.driver || trackingData.rider || {};
        const deliveryOTP = trackingData.deliveryOTP || trackingData.otp;

        const getStageIndex = (stage) => {
            const index = DELIVERY_STAGES.findIndex(s => s.key.toLowerCase() === stage.toLowerCase());
            return index === -1 ? 0 : index;
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
                                <FiTruck size={14} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Live Delivery Tracking</span>
                            </div>
                            <h3 className="text-xl font-bold font-mono">
                                #{trackingData.orderId || trackingData.initialData?.orderId || "PHARMACY-ORDER"}
                            </h3>
                            <p className="text-xs text-slate-400 mt-1">Status: <strong className="text-emerald-400">{currentStage}</strong></p>
                        </div>
                        <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white/80 hover:text-white transition">
                            <FiXCircle size={22} />
                        </button>
                    </div>

                    <div className="p-6 md:p-8 overflow-y-auto space-y-6 flex-1 custom-scrollbar text-xs">
                        
                        {isLoading && (
                            <div className="py-2 text-center text-xs font-bold text-emerald-600 animate-pulse flex items-center justify-center gap-2">
                                <div className="w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                                Updating live rider location...
                            </div>
                        )}

                        {/* 4-Digit Delivery OTP Security Box */}
                        {deliveryOTP && (
                            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-dashed border-emerald-300 rounded-2xl p-4 text-center">
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-800 block mb-1">
                                    Package Delivery Security OTP
                                </span>
                                <div className="text-3xl font-black tracking-[0.25em] text-[#08B36A] font-mono">
                                    {deliveryOTP}
                                </div>
                                <p className="text-[10px] text-slate-500 font-medium mt-1">
                                    Share this PIN with your delivery partner upon package handoff.
                                </p>
                            </div>
                        )}

                        {/* Order Timeline Stepper */}
                        <div className="space-y-3">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Order Progress</p>
                            <div className="space-y-3 pl-2 border-l-2 border-slate-100">
                                {DELIVERY_STAGES.map((stage, idx) => {
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

                        {/* Live Delivery Rider Details */}
                        {driver?.name && (
                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                                    Assigned Delivery Rider
                                </span>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-[#08B36A] flex items-center justify-center">
                                            <FiUser size={18} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 text-xs">{driver.name}</p>
                                            <p className="text-[10px] text-slate-500">{driver.vehicle || "Motorcycle Delivery"}</p>
                                        </div>
                                    </div>
                                    {driver.phone && (
                                        <a href={`tel:${driver.phone}`} className="p-2.5 bg-white border border-slate-200 rounded-xl text-emerald-600 hover:bg-emerald-50">
                                            <FiPhone size={14} />
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Destination Address */}
                        {trackingData.address && (
                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Delivery Address</span>
                                <p className="font-bold text-slate-800 text-xs">{trackingData.address.name} ({trackingData.address.phone})</p>
                                <p className="text-slate-500 text-[11px] leading-relaxed">
                                    {trackingData.address.houseNo}, {trackingData.address.city} - {trackingData.address.pincode}
                                </p>
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

    if (loading && orders.length === 0) {
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
                    <h2 className="text-xl font-semibold text-slate-800">Prescription Orders</h2>
                    <p className="text-sm text-slate-400">Track prescription reviews, bills &amp; live doorstep deliveries</p>
                </div>
            </div>

            <div className="space-y-4">
                {orders.map((order) => {
                    const isPaidOrDelivering = order.status === 'Paid' || order.status === 'Delivered' || Boolean(order.isPaid);

                    return (
                        <div key={order._id} className="bg-white border border-slate-100 rounded-3xl p-6 transition-all hover:border-emerald-200 hover:shadow-xl hover:shadow-slate-200/40 group">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                <div className="flex-1 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${getStatusStyle(order.status)}`}>
                                            {order.status}
                                        </div>
                                        <span className="text-[11px] font-mono font-medium text-slate-400 flex items-center gap-1">
                                            <FiHash size={12} /> {order.requestId}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-emerald-600 transition-colors">
                                            <MdOutlineLocalPharmacy size={22} />
                                        </div>
                                        <div>
                                            <h4 className="text-base font-semibold text-slate-800">{order.pharmacyId?.name || "Local Licensed Pharmacy"}</h4>
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-500">
                                                <span>Requested {new Date(order.createdAt).toLocaleDateString()}</span>
                                                {order.doctorName && (
                                                    <>
                                                        <span className="hidden sm:inline text-slate-300">•</span>
                                                        <span>Doctor: {order.doctorName}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between lg:justify-end gap-6 border-t lg:border-t-0 pt-4 lg:pt-0">
                                    <div className="lg:text-right lg:px-6">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amount</p>
                                        <p className="text-lg font-bold text-slate-900">
                                            {order.status === 'Bill Generated' || isPaidOrDelivering 
                                                ? `₹${order.verifiedBill?.totalAmount || order.totalAmount}` 
                                                : 'Pending Review'}
                                        </p>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleOpenDetails(order)}
                                            className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all shadow-md cursor-pointer"
                                        >
                                            View Details
                                        </button>

                                        {isPaidOrDelivering && (
                                            <button
                                                onClick={() => handleOpenLiveTracking(order)}
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

            {/* Modal: Phase 1 Pre-Payment Details */}
            {selectedOrder && (
                <PrescriptionDetailsModal
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                    onCheckout={handleCheckout}
                    isSubmitting={isSubmitting}
                    isLoading={isLoadingDetails}
                />
            )}

            {/* Modal: Phase 2 Post-Payment Live Delivery Tracking */}
            {trackingOrderData && (
                <DeliveryTrackingModal
                    trackingData={trackingOrderData}
                    onClose={() => setTrackingOrderData(null)}
                    isLoading={isLoadingTracking}
                />
            )}

            {/* Fullscreen Lightbox for Prescription Image */}
            {zoomedPrescription && (
                <div 
                    className="fixed inset-0 z-[200000] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm animate-in fade-in duration-200 cursor-pointer"
                    onClick={() => setZoomedPrescription(null)}
                >
                    <div className="relative max-w-4xl max-h-[85vh] w-full h-full flex items-center justify-center">
                        <button 
                            onClick={() => setZoomedPrescription(null)}
                            className="absolute top-4 right-4 z-[200001] p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                        >
                            <FiXCircle size={24} />
                        </button>
                        <img 
                            src={zoomedPrescription} 
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