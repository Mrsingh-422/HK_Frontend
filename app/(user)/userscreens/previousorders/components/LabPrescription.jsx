"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom'; // Required for screen centering
import UserAPI from '@/app/services/UserAPI'; // Adjust this import path to match your project structure
import {
    FiCheckCircle, FiXCircle,
    FiCalendar, FiCreditCard,
    FiFileText, FiCornerDownRight, FiHash, FiClock,
    FiX, FiActivity, FiLayers, FiHome, FiSearch, FiRefreshCw,
    FiChevronLeft, FiChevronRight, FiUser, FiMapPin
} from 'react-icons/fi';
import { MdOutlineLocalPharmacy } from 'react-icons/md';
import { FaMoneyBillWave } from 'react-icons/fa';

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

export default function LabPrescriptionRequestsPage() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ current: 1, total: 1 });
    const [selectedRequest, setSelectedRequest] = useState(null);
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
        if (selectedRequest || zoomedImage) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [selectedRequest, zoomedImage]);

    useEffect(() => {
        fetchRequestsHistory(1);
    }, []);

    const fetchRequestsHistory = async (page) => {
        setLoading(true);
        try {
            const response = await UserAPI.getLabPrescriptionRequests(page, 10);
            if (response.success) {
                setRequests(response.data);
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

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Pending Review': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'Reviewing': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'Bill Generated': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'Confirmed': return 'bg-green-50 text-green-700 border-green-100';
            case 'Rejected': return 'bg-rose-50 text-rose-600 border-rose-100';
            default: return 'bg-slate-50 text-slate-500 border-slate-100';
        }
    };

    // --- PAYMENT ACTION HANDLER (API 5 & 6) ---
    const handleCheckout = async (request, method) => {
        setIsSubmitting(true);
        try {
            // Step 1: Initiate payment to get Razorpay order parameters or confirm COD directly
            const res = await UserAPI.initializeLabPrescriptionPayment({
                requestId: request.requestId, // Expected REQ-LAB-B8C2DA stringified ID
                paymentMethod: method // "COD" | "Online"
            });

            if (method === "COD") {
                if (res && res.success) {
                    alert(res.message || "Prescription order confirmed with COD successfully!");
                    setSelectedRequest(null); // Close Details Modal
                    fetchRequestsHistory(pagination.current); // Refresh request list history
                } else {
                    alert(res?.message || "Failed to confirm COD booking.");
                }
                setIsSubmitting(false);
            } else {
                // Online Payment Integration with Razorpay SDK
                if (res && res.success && res.razorpayOrderId) {
                    const isScriptLoaded = await loadRazorpayScript();
                    if (!isScriptLoaded) {
                        alert("Failed to load Razorpay SDK. Please check your network connection.");
                        setIsSubmitting(false);
                        return;
                    }

                    const { key_id, amount, razorpayOrderId, appointmentId } = res;

                    // Setup options for Razorpay Checkout Modal
                    const options = {
                        key: key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                        amount: amount,
                        currency: "INR",
                        name: "HK Healthcare App",
                        description: `Prescription Inquiry #${request.requestId}`,
                        order_id: razorpayOrderId,
                        prefill: {
                            name: request.address?.name || "User",
                            contact: request.address?.phone || "9999999999"
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
                                    appointmentId: appointmentId || request._id,
                                    razorpayOrderId: response.razorpay_order_id || razorpayOrderId,
                                    razorpayPaymentId: response.razorpay_payment_id,
                                    razorpaySignature: response.razorpay_signature
                                };

                                const verificationRes = await UserAPI.verifyLabPrescriptionPayment(verificationPayload);

                                if (verificationRes?.success) {
                                    alert(verificationRes.message || "Prescription payment verified and order placed successfully!");
                                    setSelectedRequest(null); // Close Details Modal
                                    fetchRequestsHistory(pagination.current); // Refresh request list history
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

    // --- MODAL PORTAL COMPONENT ---
    const ModalPortal = ({ request, onClose, onCheckout, isSubmitting }) => {
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
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Inquiry Details</p>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900">#{request.requestId}</h3>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors group">
                            <FiXCircle size={26} className="text-slate-300 group-hover:text-slate-600" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="px-6 md:px-8 py-2 overflow-y-auto custom-scrollbar flex-1 space-y-6">
                        {/* Status Check / Reason for Rejection */}
                        {request.status === 'Rejected' && (
                            <div className="p-5 bg-rose-50 border border-rose-100 rounded-[2rem] flex items-start gap-3">
                                <FiXCircle className="text-rose-500 mt-0.5 shrink-0" size={18} />
                                <div>
                                    <p className="text-xs font-bold text-rose-800 uppercase tracking-wide">Inquiry Rejected</p>
                                    <p className="text-xs text-rose-700 mt-1 font-medium">{request.rejectReason || "No rejection reason specified."}</p>
                                </div>
                            </div>
                        )}

                        {/* General details card */}
                        <div className="p-5 bg-slate-50 border border-slate-100 rounded-[2rem] space-y-2">
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-slate-400 uppercase tracking-wider">Laboratory:</span>
                                <span className="font-semibold text-slate-800 uppercase">{request.labId?.name || "Unspecified"}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-slate-400 uppercase tracking-wider">Collection Type:</span>
                                <span className="font-semibold text-slate-600">{request.collectionType || "Home Collection"}</span>
                            </div>
                        </div>

                        {/* Uploaded Prescription Image Section */}
                        {request.prescriptionImage && (
                            <div className="space-y-2.5">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Prescription Attachment</p>
                                <div className="relative aspect-video w-full rounded-[2rem] overflow-hidden border border-slate-100 bg-slate-50 flex items-center justify-center p-2 group">
                                    <img 
                                        src={getPrescriptionImageUrl(request.prescriptionImage)} 
                                        className="max-h-full max-w-full object-contain cursor-zoom-in transition-opacity hover:opacity-95 rounded-xl" 
                                        alt="Prescription document"
                                        onClick={() => setZoomedImage(getPrescriptionImageUrl(request.prescriptionImage))}
                                    />
                                    <div 
                                        onClick={() => setZoomedImage(getPrescriptionImageUrl(request.prescriptionImage))}
                                        className="absolute inset-0 bg-slate-950/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                    >
                                        <span className="text-white text-[10px] font-black uppercase tracking-widest bg-slate-900/60 px-4 py-2 rounded-full">View Fullscreen</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Assigned Patients Section */}
                        {request.patients && request.patients.length > 0 && (
                            <div className="space-y-2.5">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Assigned Patients</p>
                                <div className="space-y-3">
                                    {request.patients.map((patient, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
                                            <div className="flex gap-3">
                                                <FiUser className="mt-1 text-emerald-500" size={16} />
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800 uppercase">{patient.name}</p>
                                                    <p className="text-[10px] font-medium text-slate-500">{patient.relation} • {patient.gender}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Original Inquired Tests Section */}
                        {request.requestedTests && request.requestedTests.length > 0 && (
                            <div className="space-y-2.5">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Original Inquired Tests</p>
                                <div className="flex flex-wrap gap-2 px-1">
                                    {request.requestedTests.map((test, idx) => (
                                        <span key={idx} className="inline-block px-3 py-1 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold">
                                            {test.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Delivery Address Section */}
                        {request.address && (
                            <div className="space-y-2.5">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Location Details</p>
                                <div className="p-5 bg-slate-50 border border-slate-100 rounded-[2rem] space-y-2">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-bold text-slate-400">Recipient Name</span>
                                        <span className="font-semibold text-slate-800">{request.address.name} ({request.address.addressType})</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-bold text-slate-400">Contact Number</span>
                                        <span className="font-semibold text-slate-600">{request.address.phone}</span>
                                    </div>
                                    <div className="flex justify-between items-start text-xs pt-1.5 border-t border-slate-200/60">
                                        <span className="font-bold text-slate-400 shrink-0">Address Details</span>
                                        <span className="font-semibold text-slate-600 text-right truncate max-w-[200px]" title={`${request.address.houseNo}, ${request.address.city}`}>
                                            {request.address.houseNo}, {request.address.city}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Payment/Status Section */}
                        <div className="pt-2">
                            {request.status === 'Bill Generated' || request.status === 'Confirmed' ? (
                                <div className="p-6 bg-slate-900 rounded-[2rem] text-white">
                                    <div className="flex justify-between items-center mb-4 opacity-60 text-[10px] font-bold uppercase tracking-widest">
                                        <span>Verified Bill Summary</span>
                                        <span>Lab Invoice</span>
                                    </div>
                                    
                                    {/* Map verified test names if present */}
                                    {request.verifiedBill?.tests && request.verifiedBill.tests.length > 0 && (
                                        <div className="space-y-2 mb-3 text-xs text-slate-300 max-h-24 overflow-y-auto pr-1">
                                            {request.verifiedBill.tests.map((test) => (
                                                <div key={test._id} className="flex justify-between">
                                                    <span>✓ {test.name}</span>
                                                    <span>₹{test.pricePerUnit}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="space-y-2.5 mb-5 text-xs text-slate-300 border-t border-white/10 pt-3">
                                        <div className="flex justify-between">
                                            <span>Medicines Subtotal</span>
                                            <span className="font-semibold text-white">₹{request.verifiedBill?.itemTotal || 0}</span>
                                        </div>
                                        {request.verifiedBill?.homeVisitCharge > 0 && (
                                            <div className="flex justify-between">
                                                <span>Home Visit Fee</span>
                                                <span className="font-semibold text-white">₹{request.verifiedBill?.homeVisitCharge || 0}</span>
                                            </div>
                                        )}
                                        <div className="h-px bg-white/10 my-1" />
                                        <div className="flex justify-between text-sm font-bold text-white">
                                            <span>Grand Total</span>
                                            <span className="text-emerald-400 text-lg">₹{request.verifiedBill?.totalAmount}</span>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-white/10 flex justify-between text-[11px] opacity-70">
                                        <span className="flex items-center gap-1.5"><FiCheckCircle size={14} /> Taxes & GST Included</span>
                                        <span>{new Date(request.updatedAt || request.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ) : request.status !== 'Rejected' ? (
                                <div className="p-5 bg-blue-50 border border-blue-100 rounded-[2rem] flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-500 shadow-sm shrink-0">
                                        <FiClock size={22} className="animate-pulse" />
                                    </div>
                                    <p className="text-xs font-bold text-blue-900 uppercase leading-relaxed">The laboratory is currently reviewing your prescription and preparing the bill estimate.</p>
                                </div>
                            ) : null}
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-6 md:p-8 bg-slate-50 border-t border-slate-100 flex gap-3 shrink-0">
                        {orderCheckoutEnabled(request) && (
                            <>
                                {/* <button
                                    onClick={() => onCheckout(request, "COD")}
                                    disabled={isSubmitting}
                                    className="flex-1 py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl text-[11px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                                >
                                    <FaMoneyBillWave size={14} /> COD Checkout
                                </button> */}
                                <button
                                    onClick={() => onCheckout(request, "Online")}
                                    disabled={isSubmitting}
                                    className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl text-[11px] font-bold uppercase tracking-widest hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
                                >
                                    {isSubmitting ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <FiCreditCard size={14} />
                                    )}
                                    {isSubmitting ? "Processing..." : "Pay Online"}
                                </button>
                            </>
                        )}
                        <button onClick={onClose} className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl text-[11px] font-bold uppercase tracking-widest hover:bg-slate-50">
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
                    <h2 className="text-xl font-semibold text-slate-800">Inquiry History</h2>
                    <p className="text-sm text-slate-400">View and track your lab prescription requests</p>
                </div>
            </div>

            <div className="space-y-4">
                {requests.map((request) => (
                    <div key={request._id} className="bg-white border border-slate-100 rounded-3xl p-6 transition-all hover:border-emerald-200 hover:shadow-xl hover:shadow-slate-200/40 group">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                            <div className="flex-1 space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${getStatusStyle(request.status)}`}>
                                        {request.status}
                                    </div>
                                    <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                                        <FiHash size={12} /> {request.requestId}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-emerald-600 transition-colors">
                                        <MdOutlineLocalPharmacy size={22} />
                                    </div>
                                    <div>
                                        <h4 className="text-base font-semibold text-slate-800">{request.labId?.name || "Local Laboratory"}</h4>
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-500">
                                            <span>Ordered {new Date(request.createdAt).toLocaleDateString()}</span>
                                            {request.collectionType && (
                                                <>
                                                    <span className="hidden sm:inline text-slate-300">•</span>
                                                    <span>Type: {request.collectionType}</span>
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
                                        {request.status === 'Bill Generated' || request.status === 'Confirmed' ? `₹${request.verifiedBill?.totalAmount}` : '---'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedRequest(request)}
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
            {selectedRequest && (
                <ModalPortal
                    request={selectedRequest}
                    onClose={() => setSelectedRequest(null)}
                    onCheckout={handleCheckout}
                    isSubmitting={isSubmitting}
                />
            )}

            {/* --- FULLSCREEN LIGHTBOX FOR PRESCRIPTION IMAGES --- */}
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

// Helpers
const orderCheckoutEnabled = (req) => req.status === "Bill Generated";