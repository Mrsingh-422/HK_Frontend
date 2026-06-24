"use client";
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom'; // Required for screen centering
import UserAPI from '../../../../services/UserAPI';
import {
    FiCheckCircle, FiXCircle,
    FiCalendar, FiCreditCard,
    FiFileText, FiCornerDownRight, FiHash, FiClock
} from 'react-icons/fi';
import { MdOutlineLocalPharmacy } from 'react-icons/md';

const IMAGE_BASE_URL = "http://192.168.1.26:5002";

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

export default function PrescriptionOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ current: 1, total: 1 });
    const [selectedOrder, setSelectedOrder] = useState(null);
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
        if (selectedOrder || zoomedPrescription) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [selectedOrder, zoomedPrescription]);

    useEffect(() => {
        fetchOrders(1);
    }, []);

    const fetchOrders = async (page) => {
        setLoading(true);
        try {
            const response = await UserAPI.getAllPrescriptionRequests(page, 10);
            if (response.success) {
                setOrders(response.data);
                setPagination({
                    current: response.currentPage,
                    total: response.totalPages
                });
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Pending Review': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'Reviewing': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'Bill Generated': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'Rejected': return 'bg-rose-50 text-rose-600 border-rose-100';
            default: return 'bg-slate-50 text-slate-500 border-slate-100';
        }
    };

    // --- PAYMENT ACTION HANDLER ---
    const handleCheckout = async (order) => {
        setIsSubmitting(true);
        try {
            // Load Razorpay script dynamically
            const isScriptLoaded = await loadRazorpayScript();
            if (!isScriptLoaded) {
                alert("Failed to load Razorpay SDK. Please check your network connection.");
                setIsSubmitting(false);
                return;
            }

            // Step 1: Initiate payment to get Razorpay order parameters
            const res = await UserAPI.payPrescriptionRequest({
                requestId: order._id, // MongoDB prescription request ID
                paymentMethod: "Online"
            });

            if (res && res.success) {
                const { key_id, amount, razorpayOrderId, appointmentId } = res;

                // Setup options for Razorpay Checkout Modal
                const options = {
                    key: key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                    amount: amount,
                    currency: "INR",
                    name: "HK Healthcare App",
                    description: `Prescription Request #${order.requestId}`,
                    order_id: razorpayOrderId,
                    prefill: {
                        name: "User",
                        email: "user@example.com",
                        contact: "9999999999"
                    },
                    theme: {
                        color: "#059669" // Matches application emerald theme
                    },
                    modal: {
                        ondismiss: function () {
                            setIsSubmitting(false);
                        }
                    },
                    handler: async function (response) {
                        try {
                            setIsSubmitting(true);

                            // Step 2: Prepare payload for payment signature verification
                            const verificationPayload = {
                                appointmentId: appointmentId || order._id,
                                razorpayOrderId: response.razorpay_order_id || razorpayOrderId,
                                razorpayPaymentId: response.razorpay_payment_id,
                                razorpaySignature: response.razorpay_signature
                            };

                            const verificationRes = await UserAPI.verifyPaymentPrescriptionPharmacy(verificationPayload);

                            if (verificationRes?.success) {
                                alert(verificationRes.message || "Prescription payment verified and order placed successfully!");
                                setSelectedOrder(null); // Close Details Modal
                                fetchOrders(pagination.current); // Refresh request list history
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
        } catch (error) {
            console.error("Checkout Initialization Error:", error);
            alert("An error occurred during booking initialization.");
            setIsSubmitting(false);
        }
    };

    // --- MODAL COMPONENT ---
    const ModalPortal = ({ order, onClose, onCheckout, isSubmitting }) => {
        if (!mounted) return null;

        return createPortal(
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6">
                {/* Backdrop - Covers entire browser window */}
                <div
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity duration-300"
                    onClick={onClose}
                />

                {/* Modal Card - Perfectly Centered */}
                <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-[0_30px_70px_-10px_rgba(0,0,0,0.4)] overflow-hidden animate-in zoom-in-95 fade-in duration-300 flex flex-col max-h-[85vh]">

                    {/* Header */}
                    <div className="p-6 md:p-8 pb-4 flex justify-between items-start shrink-0">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Request Details</p>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900">#{order.requestId}</h3>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors group">
                            <FiXCircle size={26} className="text-slate-300 group-hover:text-slate-600" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="px-6 md:px-8 py-2 overflow-y-auto custom-scrollbar flex-1 space-y-6">
                        {/* Status Check / Reason for Rejection */}
                        {order.status === 'Rejected' && (
                            <div className="p-5 bg-rose-50 border border-rose-100 rounded-[2rem] flex items-start gap-3">
                                <FiXCircle className="text-rose-500 mt-0.5 shrink-0" size={18} />
                                <div>
                                    <p className="text-xs font-bold text-rose-800 uppercase tracking-wide">Request Rejected</p>
                                    <p className="text-xs text-rose-700 mt-1 font-medium">{order.rejectReason || "No rejection reason specified."}</p>
                                </div>
                            </div>
                        )}

                        {/* Prescription General details card */}
                        <div className="p-5 bg-slate-50 border border-slate-100 rounded-[2rem] space-y-2">
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-slate-400 uppercase tracking-wider">Prescribed By:</span>
                                <span className="font-semibold text-slate-800 uppercase">{order.doctorName || "Unspecified"}</span>
                            </div>
                            {order.prescriptionDate && (
                                <div className="flex justify-between items-center text-xs">
                                    <span className="font-bold text-slate-400 uppercase tracking-wider">Prescription Date:</span>
                                    <span className="font-semibold text-slate-600">{new Date(order.prescriptionDate).toLocaleDateString()}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-slate-400 uppercase tracking-wider">Duration:</span>
                                <span className="font-semibold text-slate-600">{order.durationType || "Full Course"}</span>
                            </div>
                        </div>

                        {/* Uploaded Prescription Image Section */}
                        {order.prescriptionImage && (
                            <div className="space-y-2.5">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Prescription Attachment</p>
                                <div className="relative aspect-video w-full rounded-[2rem] overflow-hidden border border-slate-100 bg-slate-50 flex items-center justify-center p-2 group">
                                    <img 
                                        src={getPrescriptionImageUrl(order.prescriptionImage)} 
                                        className="max-h-full max-w-full object-contain cursor-zoom-in transition-opacity hover:opacity-95 rounded-xl" 
                                        alt="Prescription document"
                                        onClick={() => setZoomedPrescription(getPrescriptionImageUrl(order.prescriptionImage))}
                                    />
                                    <div 
                                        onClick={() => setZoomedPrescription(getPrescriptionImageUrl(order.prescriptionImage))}
                                        className="absolute inset-0 bg-slate-950/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                    >
                                        <span className="text-white text-[10px] font-black uppercase tracking-widest bg-slate-900/60 px-4 py-2 rounded-full">View Fullscreen</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Requested Medicines Section */}
                        <div className="space-y-2.5">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Requested Medicines</p>
                            <div className="space-y-3">
                                {order.requestedMedicines.map((med, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
                                        <div className="flex gap-3">
                                            <FiCornerDownRight className="mt-1 text-emerald-500" size={16} />
                                            <div>
                                                <p className="text-sm font-bold text-slate-800 uppercase">{med.name}</p>
                                                <p className="text-[10px] font-medium text-slate-500">Qty: {med.dosage} • {med.durationDays} Days</p>
                                            </div>
                                        </div>
                                        {order.status === 'Bill Generated' && <p className="text-sm font-bold text-slate-900">₹{med.mrp}</p>}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Delivery Address Section */}
                        {order.address && (
                            <div className="space-y-2.5">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Delivery Destination</p>
                                <div className="p-5 bg-slate-50 border border-slate-100 rounded-[2rem] space-y-2">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-bold text-slate-400">Recipient Name</span>
                                        <span className="font-semibold text-slate-800">{order.address.name} ({order.address.addressType})</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-bold text-slate-400">Contact Number</span>
                                        <span className="font-semibold text-slate-600">{order.address.phone}</span>
                                    </div>
                                    <div className="flex justify-between items-start text-xs pt-1.5 border-t border-slate-200/60">
                                        <span className="font-bold text-slate-400 shrink-0">Address Details</span>
                                        <span className="font-semibold text-slate-600 text-right truncate max-w-[200px]" title={`${order.address.houseNo}, ${order.address.city} - ${order.address.pincode}`}>
                                            H.No {order.address.houseNo}, {order.address.city} - {order.address.pincode}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Payment/Status Section */}
                        <div className="pt-2">
                            {order.status === 'Bill Generated' ? (
                                <div className="p-6 bg-slate-900 rounded-[2rem] text-white">
                                    <div className="flex justify-between items-center mb-4 opacity-60 text-[10px] font-bold uppercase tracking-widest">
                                        <span>Verified Invoice Breakdown</span>
                                        <span>Invoice Details</span>
                                    </div>
                                    <div className="space-y-2.5 mb-5 text-xs text-slate-300">
                                        <div className="flex justify-between">
                                            <span>Medicines Subtotal</span>
                                            <span className="font-semibold text-white">₹{order.verifiedBill?.itemTotal || 0}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Delivery Fee</span>
                                            <span className="font-semibold text-white">₹{order.verifiedBill?.deliveryCharge || 0}</span>
                                        </div>
                                        <div className="h-px bg-white/10 my-1" />
                                        <div className="flex justify-between text-sm font-bold text-white">
                                            <span>Grand Total</span>
                                            <span className="text-emerald-400 text-lg">₹{order.verifiedBill?.totalAmount}</span>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-white/10 flex justify-between text-[11px] opacity-70">
                                        <span className="flex items-center gap-1.5"><FiCheckCircle size={14} /> Taxes & GST Included</span>
                                        <span>{new Date().toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ) : order.status !== 'Rejected' ? (
                                <div className="p-5 bg-blue-50 border border-blue-100 rounded-[2rem] flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-500 shadow-sm shrink-0">
                                        <FiClock size={22} className="animate-pulse" />
                                    </div>
                                    <p className="text-xs font-bold text-blue-900 uppercase leading-relaxed">The pharmacy is currently reviewing stock and generating your bill.</p>
                                </div>
                            ) : null}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 md:p-8 bg-slate-50 border-t border-slate-100 flex gap-3 shrink-0">
                        {order.status === 'Bill Generated' && (
                            <button
                                onClick={() => onCheckout(order)}
                                disabled={isSubmitting}
                                className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl text-[11px] font-bold uppercase tracking-widest hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
                            >
                                {isSubmitting ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <FiCreditCard size={14} />
                                )}
                                {isSubmitting ? "Processing..." : "Checkout"}
                            </button>
                        )}
                        <button onClick={onClose} className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl text-[11px] font-bold uppercase tracking-widest hover:bg-slate-50">
                            Close
                        </button>
                    </div>
                </div>
            </div>,
            document.body // This sends the modal to the very top of the HTML
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
                    <h2 className="text-xl font-semibold text-slate-800">Prescription History</h2>
                    <p className="text-sm text-slate-400">View and track your medicine requests</p>
                </div>
            </div>

            <div className="space-y-4">
                {orders.map((order) => (
                    <div key={order._id} className="bg-white border border-slate-100 rounded-3xl p-6 transition-all hover:border-emerald-200 hover:shadow-xl hover:shadow-slate-200/40 group">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                            <div className="flex-1 space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${getStatusStyle(order.status)}`}>
                                        {order.status}
                                    </div>
                                    <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                                        <FiHash size={12} /> {order.requestId}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-emerald-600 transition-colors">
                                        <MdOutlineLocalPharmacy size={22} />
                                    </div>
                                    <div>
                                        <h4 className="text-base font-semibold text-slate-800">{order.pharmacyId?.name || "Local Pharmacy"}</h4>
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-500">
                                            <span>Ordered {new Date(order.createdAt).toLocaleDateString()}</span>
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
                                    <p className="text-lg font-semibold text-slate-900">
                                        {order.status === 'Bill Generated' ? `₹${order.verifiedBill?.totalAmount}` : '---'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedOrder(order)}
                                    className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-[11px] font-bold uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-slate-900/10"
                                >
                                    View Details
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* --- Render Details Modal using Portal --- */}
            {selectedOrder && (
                <ModalPortal
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                    onCheckout={handleCheckout}
                    isSubmitting={isSubmitting}
                />
            )}

            {/* --- FULLSCREEN LIGHTBOX FOR PRESCRIPTION IMAGES --- */}
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