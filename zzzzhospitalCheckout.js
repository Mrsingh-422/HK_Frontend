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

// Unified Base URL resolver using environment variable or your active production fallback
const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://hk-backend-9jm8.onrender.com";

// Helper to construct accurate prescription and profile image URLs
const getResolvedImageUrl = (path) => {
    if (!path) return "";
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

// --- MODAL PORTAL COMPONENT ---
const ModalPortal = ({ request, onClose, onCheckout, isSubmitting, setZoomedImage, mounted }) => {
    const [imgSrc, setImgSrc] = useState("");

    // Initialize prescription image source
    useEffect(() => {
        if (request?.prescriptionImage) {
            setImgSrc(getResolvedImageUrl(request.prescriptionImage));
        }
    }, [request]);

    // Dynamic failover asset handler to resolve image local network addresses
    const handleImgError = () => {
        if (!imgSrc) return;

        // Failover 1: If it used an IP address, try switching to localhost
        if (!imgSrc.includes("localhost:5002") && !imgSrc.startsWith("http://localhost:5002")) {
            const fallbackUrl = imgSrc.replace(/http:\/\/[^\/]+/, "http://localhost:5002");
            setImgSrc(fallbackUrl);
            return;
        }
        
        // Failover 2: Try keeping the "public/" prefix intact (some local setups require /public/uploads/...)
        if (request?.prescriptionImage && !imgSrc.includes("/public/")) {
            const fallbackWithPublic = `${IMAGE_BASE_URL}/${request.prescriptionImage}`;
            setImgSrc(fallbackWithPublic);
            return;
        }

        // Failover 3: If localhost fails, try falling back to the local network IP
        if (imgSrc.includes("localhost:5002")) {
            const fallbackIP = imgSrc.replace("localhost:5002", "192.168.1.26:5002");
            setImgSrc(fallbackIP);
            return;
        }
    };

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
                                    src={imgSrc} 
                                    onError={handleImgError} // Fire the failover asset handler if loading fails
                                    className="max-h-full max-w-full object-contain cursor-zoom-in transition-opacity hover:opacity-95 rounded-xl animate-fadeIn" 
                                    alt="Prescription document"
                                    onClick={() => setZoomedImage(imgSrc)}
                                />
                                <div 
                                    onClick={() => setZoomedImage(imgSrc)}
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
                        {request.status === 'Bill Generated' || request.status === 'Confirmed' || request.status === 'Pending Payment' ? (
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

export default function LabPrescriptionRequestsPage() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ current: 1, total: 1 });
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [mounted, setMounted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [zoomedImage, setZoomedImage] = useState(null);
    
    // --- STATE FIXED: Added missing searchTerm states ---
    const [searchTerm, setSearchTerm] = useState('');

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
            case 'Bill Generated': return 'bg-[#e6f7eb] text-[#08B36A] border-emerald-100';
            case 'Pending Payment': return 'bg-[#e6f7eb] text-[#08B36A] border-emerald-100 animate-pulse';
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

    const handleOpenDetails = (request) => {
        setSelectedRequest(request);
    };

    // Filter requests locally based on search term
    const filteredRequests = requests.filter(req => {
        const idMatch = req.requestId?.toLowerCase().includes(searchTerm.toLowerCase());
        const statusMatch = req.status?.toLowerCase().includes(searchTerm.toLowerCase());
        const labMatch = req.labId?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        return idMatch || statusMatch || labMatch;
    });

    return (
        <div className="bg-white border border-slate-200 rounded-[24px] md:rounded-[32px] overflow-hidden shadow-sm animate-fadeIn">
            {/* Header with Search */}
            <div className="p-5 md:p-8 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h3 className="font-black text-slate-900 text-lg md:text-xl tracking-tight">Inquiry History</h3>
                    <p className="text-slate-400 text-[9px] md:text-[10px] font-bold uppercase tracking-widest mt-1">View and track your lab prescription requests</p>
                </div>
                <div className="relative w-full sm:w-72">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                        type="text" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by request ID, lab, or status..." 
                        className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-11 pr-4 text-xs md:text-sm font-semibold outline-none ring-1 ring-slate-100 focus:ring-indigo-500 transition-all"
                    />
                </div>
            </div>

            {/* List and Tables wrapper */}
            <div>
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <FiRefreshCw className="animate-spin text-emerald-600" size={26} />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Loading History</p>
                    </div>
                ) : filteredRequests.length === 0 ? (
                    <div className="text-center py-16 text-slate-400 text-xs font-medium">No lab prescription requests registered in your history.</div>
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50">
                                        <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-400">S No.</th>
                                        <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Inquiry ID</th>
                                        <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Target Laboratory</th>
                                        <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Patient Target</th>
                                        <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Inquiry Date</th>
                                        <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Inquiry Status</th>
                                        <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center font-bold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="text-[14px] text-gray-700">
                                    {filteredRequests.map((req, index) => (
                                        <tr 
                                            key={req._id} 
                                            className="border-b border-gray-50 hover:bg-[#f8fcf9] transition-colors group cursor-pointer"
                                            onClick={() => handleOpenDetails(req)}
                                        >
                                            <td className="p-5 font-medium text-gray-500 w-16">
                                                {index + 1}
                                            </td>
                                            <td className="p-5 font-mono text-xs font-bold text-slate-800">
                                                {req.requestId}
                                            </td>
                                            <td className="p-5 text-xs font-medium text-gray-600 truncate max-w-xs">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-50 border flex items-center justify-center text-slate-400 shrink-0">
                                                        {req.labId?.profileImage ? (
                                                            <img src={getResolvedImageUrl(req.labId.profileImage)} className="w-full h-full object-cover rounded-lg" alt="" />
                                                        ) : (
                                                            <FiActivity size={14} />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-800">{req.labId?.name || "Partner Lab"}</p>
                                                        <p className="text-[10px] text-slate-400 uppercase font-semibold">{req.labId?.city}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-5 text-center text-xs font-semibold text-slate-600">
                                                {req.patients?.map(p => p.name).join(', ') || "Self"}
                                            </td>
                                            <td className="p-5 text-center text-xs font-semibold text-slate-500">
                                                {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className="p-5 text-center">
                                                <span className={`inline-block px-3 py-1 rounded-lg text-[9px] font-black uppercase ${getStatusStyle(req.status)}`}>
                                                    {req.status || "Pending Review"}
                                                </span>
                                            </td>

                                            {/* Action button trigger checkouts */}
                                            <td className="p-5 text-center" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex justify-center gap-2">
                                                    {orderCheckoutEnabled(req) ? (
                                                        <button 
                                                            disabled={isSubmitting}
                                                            onClick={() => handleOpenDetails(req)}
                                                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#08B36A] hover:bg-[#069356] text-white text-[12px] font-bold rounded-xl shadow-[0_2px_8px_rgba(8,179,106,0.15)] transition-all animate-bounce"
                                                        >
                                                            <FiCreditCard size={11} /> Pay Now (₹{req.verifiedBill?.totalAmount})
                                                        </button>
                                                    ) : (
                                                        <button 
                                                            onClick={() => handleOpenDetails(req)}
                                                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[12px] font-bold rounded-xl transition-all"
                                                        >
                                                            <FiFileText size={11} /> View Details
                                                        </button>
                                                    )}
                                                </div>
                                            </td>

                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards View */}
                        <div className="block lg:hidden divide-y divide-slate-100 px-4">
                            {filteredRequests.map((req) => (
                                <div key={req._id} className="py-5 flex flex-col gap-3.5" onClick={() => handleOpenDetails(req)}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 tracking-wider">#{req.requestId.slice(-8).toUpperCase()}</p>
                                            <h4 className="text-sm font-black text-slate-800 line-clamp-1">{req.labId?.name || "Partner Lab"}</h4>
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase ${getStatusStyle(req.status)}`}>{req.status}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2" onClick={(e) => e.stopPropagation()}>
                                        {orderCheckoutEnabled(req) ? (
                                            <button 
                                                disabled={isSubmitting}
                                                onClick={() => handleOpenDetails(req)}
                                                className="w-full bg-[#08B36A] hover:bg-[#069356] py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-center text-white flex items-center justify-center gap-1 shadow-md shadow-emerald-100 animate-bounce"
                                            >
                                                <FiCreditCard /> Pay Now
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => handleOpenDetails(req)} 
                                                className="py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-center border border-slate-200 bg-white w-full col-span-2"
                                            >
                                                View Details
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Pagination Footer */}
            <div className="p-4 md:p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/20">
                <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Page {pagination.currentPage} of {pagination.totalPages}</p>
                <div className="flex gap-2">
                    <button disabled={pagination.current === 1} className="p-2 rounded-lg border border-slate-200 bg-white disabled:opacity-30"><FiChevronLeft size={16} /></button>
                    <button disabled={pagination.current >= pagination.total} className="p-2 rounded-lg border border-slate-200 bg-white disabled:opacity-30"><FiChevronRight size={16} /></button>
                </div>
            </div>

            {/* --- Render Details Modal using Portal --- */}
            {selectedRequest && (
                <ModalPortal
                    request={selectedRequest}
                    onClose={() => setSelectedRequest(null)}
                    onCheckout={handleCheckout}
                    isSubmitting={isSubmitting}
                    mounted={mounted}
                    setZoomedImage={setZoomedImage} // Dynamic prop passed correctly
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
const orderCheckoutEnabled = (req) => req.status === "Bill Generated" || req.status === "Pending Payment";