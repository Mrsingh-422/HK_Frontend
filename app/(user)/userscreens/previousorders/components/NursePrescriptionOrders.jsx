"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom'; // Required for screen centering
import toast from 'react-hot-toast';
import UserAPI from '@/app/services/UserAPI'; // Adjust this path to match your project structure
import {
    FiX, FiActivity, FiLayers, FiHome,
    FiSearch, FiRefreshCw, FiChevronLeft, FiChevronRight,
    FiUser, FiMapPin, FiClock, FiCreditCard, FiStar, FiCheckCircle
} from 'react-icons/fi';
import { HiStar } from 'react-icons/hi';
import { MdOutlineRateReview, MdPayment } from 'react-icons/md';
import { FaMoneyBillWave, FaFlask, FaFileMedical, FaTimes, FaCheck, FaArrowLeft, FaHistory, FaUserNurse } from 'react-icons/fa';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// Helper to resolve files and assets from the backend server
const getReportFileUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }
    const cleanedPath = path.replace(/^\/+/, '');
    return `${BACKEND_URL}/${cleanedPath}`;
};

function NursePrescriptionOrders() {
    const themeColor = "#08B36A"; // Indigo accent color to match LabOrders style

    // ==========================================
    // 🌟 LOADING & DATA STATES
    // ==========================================
    const [loading, setLoading] = useState(true);
    const [proposalsLoading, setProposalsLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [orders, setOrders] = useState([]);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalCount: 0 });
    const [searchTerm, setSearchTerm] = useState('');

    // ==========================================
    // 🌟 MODAL STATES
    // ==========================================
    const [detailsModal, setDetailsModal] = useState({ isOpen: false, data: null });
    const [proposalsModal, setProposalsModal] = useState({ isOpen: false, data: null, proposals: [] });
    const [mounted, setMounted] = useState(false);

    // 1. Handle Mounting for Portals (Next.js SSR safety)
    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    // 2. Prevent body scroll when modals are open
    useEffect(() => {
        if (detailsModal.isOpen || proposalsModal.isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [detailsModal.isOpen, proposalsModal.isOpen]);

    // Fetch Broadcast History List
    const loadRequestsHistory = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const response = await UserAPI.getNurseProposals();
            if (response.success) {
                // response.data contains requests history array as per your schema
                setOrders(response.data || []);
                setPagination({
                    currentPage: response.currentPage || 1,
                    totalPages: response.totalPages || 1,
                    totalCount: response.totalItems || response.data?.length || 0
                });
            }
        } catch (err) {
            console.error("Failed to fetch proposals history:", err);
            toast.error("Could not retrieve broadcast history.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadRequestsHistory();
    }, [loadRequestsHistory]);

    // --- API 1.3: VIEW INCOMING PROPOSALS ---
    const handleViewProposals = async (request) => {
        setProposalsModal({ isOpen: true, data: request, proposals: [] });
        setProposalsLoading(true);
        try {
            const response = await UserAPI.viewNurseProposalDetail(request.requestId);
            if (response.success) {
                setProposalsModal(prev => ({
                    ...prev,
                    proposals: response.proposals || []
                }));
            }
        } catch (err) {
            console.error("Failed to load proposals detail:", err);
            toast.error("Could not fetch incoming proposals.");
        } finally {
            setProposalsLoading(false);
        }
    };

    // --- DYNAMIC RAZORPAY SCRIPT LOADER ---
    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            if (window.Razorpay) {
                resolve(true);
                return;
            }
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    // --- API 1.4: ACCEPT PROPOSAL (COD vs ONLINE Checkouts) ---
    const handleAcceptProposal = async (proposal, method) => {
        const activeRequest = proposalsModal.data;
        if (!activeRequest?.requestId || !proposal?._id) return;

        setActionLoading(true);
        const payload = {
            requestId: activeRequest.requestId,
            proposalId: proposal._id,
            paymentMethod: method // "COD" | "Online"
        };

        try {
            const response = await UserAPI.acceptNurseProposal(payload);

            if (method === "COD") {
                if (response.success) {
                    toast.success("Proposal accepted! Booking generated under COD.");
                    setProposalsModal({ isOpen: false, data: null, proposals: [] });
                    loadRequestsHistory(); // Refresh table
                }
            } else {
                // Online payment handling with Razorpay
                if (response.success && response.razorpayOrderId) {
                    const loaded = await loadRazorpayScript();
                    if (!loaded) {
                        toast.error("Razorpay SDK failed to load. Are you online?");
                        return;
                    }

                    const options = {
                        key: response.key_id,
                        amount: response.amount,
                        currency: "INR",
                        name: "Nurse Care Booking",
                        description: `Booking Ref: ${response.bookingId}`,
                        order_id: response.razorpayOrderId,
                        handler: async function (paymentResponse) {
                            // --- API 1.5: VERIFY PRESCRIPTION PAYMENT ---
                            const verificationPayload = {
                                appointmentId: response.appointmentId,
                                requestId: response.requestId,
                                proposalId: response.proposalId,
                                razorpayOrderId: response.razorpayOrderId,
                                razorpayPaymentId: paymentResponse.razorpay_payment_id,
                                razorpaySignature: paymentResponse.razorpay_signature
                            };

                            setLoading(true);
                            try {
                                const verifyRes = await UserAPI.verifyPaymentPriscription(verificationPayload);
                                if (verifyRes.success) {
                                    toast.success("Payment verified! Booking confirmed successfully.");
                                    setProposalsModal({ isOpen: false, data: null, proposals: [] });
                                    loadRequestsHistory();
                                }
                            } catch (verifyErr) {
                                toast.error("Payment verification failed. Contact clinical support.");
                            } finally {
                                setLoading(false);
                            }
                        },
                        prefill: {
                            name: "User",
                            email: "user@gmail.com"
                        },
                        theme: {
                            color: themeColor
                        }
                    };

                    const rzp = new window.Razorpay(options);
                    rzp.open();
                }
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Action processed with failure.");
        } finally {
            setActionLoading(false);
        }
    };

    const getServicesSummary = (services) => {
        if (!services || services.length === 0) return "Care Broadcast";
        return services.map(s => s.title).join(", ");
    };

    const getStatusStyles = (status) => {
        if (['Completed', 'Confirmed'].includes(status)) return 'text-emerald-600 bg-emerald-50';
        if (status === 'Cancelled') return 'text-rose-500 bg-rose-50';
        return 'text-indigo-600 bg-indigo-50';
    };

    // Filter requests list locally based on search
    const filteredRequests = orders.filter(req => {
        const idMatch = req.requestId?.toLowerCase().includes(searchTerm.toLowerCase());
        const statusMatch = req.status?.toLowerCase().includes(searchTerm.toLowerCase());
        return idMatch || statusMatch;
    });

    // --- MODAL PORTAL COMPONENT: REQUEST DETAILS VIEW ---
    const NurseRequestDetailsModal = ({ data, onClose }) => {
        if (!mounted) return null;

        return createPortal(
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 md:p-6">
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity duration-300" onClick={onClose} />

                <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] md:rounded-[3.5rem] shadow-[0_30px_80px_-15px_rgba(0,0,0,0.5)] overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 fade-in duration-300">

                    {/* Header */}
                    <div className="p-6 md:p-8 border-b flex justify-between items-center bg-slate-50/30 shrink-0">
                        <div className="flex items-center gap-3">
                            <span className="bg-indigo-600 text-white p-2.5 rounded-2xl shrink-0 shadow-lg shadow-indigo-100">
                                <FiActivity size={20} />
                            </span>
                            <div>
                                <h3 className="font-black text-slate-900 text-sm md:text-base uppercase tracking-widest">Broadcast #{data.requestId.slice(-8).toUpperCase()}</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Details Summary</p>
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
                    <div className="p-6 md:p-10 overflow-y-auto custom-scrollbar space-y-8 flex-1">

                        {/* Prescription Image & Status */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                            <div className="space-y-4">
                                {data.prescriptionImage && (
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Prescription Image</p>
                                        <div className="border border-slate-100 rounded-[2rem] overflow-hidden max-h-48 bg-slate-50 flex items-center justify-center p-2">
                                            <img
                                                src={getReportFileUrl(data.prescriptionImage)}
                                                alt="Prescription"
                                                className="max-h-44 object-contain rounded-xl"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.style.display = 'none';
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                                <p className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest">Address & Expiry</p>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-xs font-bold text-slate-700">
                                        <FiMapPin className="text-indigo-500" size={16} />
                                        <span>
                                            House {data.location?.address?.houseNo}, {data.location?.address?.city}, {data.location?.address?.state} - {data.location?.address?.pincode}
                                        </span>
                                    </div>
                                    {data.location?.address?.landmark && (
                                        <p className="pl-7 text-[11px] text-slate-400 font-bold uppercase">Landmark: {data.location.address.landmark}</p>
                                    )}
                                    <div className="flex items-center gap-3 text-xs font-bold text-slate-700">
                                        <FiClock className="text-indigo-500" size={16} />
                                        <span>Created: {new Date(data.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs font-bold text-red-500">
                                        <FiClock className="text-red-500" size={16} />
                                        <span>Expires: {new Date(data.expiresAt).toLocaleTimeString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs font-bold text-slate-700 border-t pt-2 mt-2">
                                        <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Status:</span>
                                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${getStatusStyles(data.status)}`}>
                                            {data.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Services List */}
                        <div className="space-y-4">
                            <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Requested Care Modules</h5>
                            <div className="grid grid-cols-1 gap-2.5">
                                {data.services?.map((svc, i) => (
                                    <div key={svc._id || i} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-slate-700 text-sm">{svc.title}</span>
                                        </div>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">{svc.description}</p>
                                        {svc.notes && (
                                            <p className="text-xs text-indigo-600 font-semibold italic border-t pt-1.5 mt-1.5">Note: "{svc.notes}"</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* Footer Actions */}
                    <div className="p-6 md:p-8 bg-slate-50/50 border-t flex gap-3 shrink-0">
                        <button
                            onClick={() => {
                                onClose();
                                handleViewProposals(data);
                            }}
                            className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                        >
                            <FaUserNurse size={14} /> Check Proposals
                        </button>
                    </div>

                </div>
            </div>,
            document.body
        );
    };

    // --- MODAL PORTAL COMPONENT: PROPOSALS DETAIL VIEW ---
    const NurseProposalsModal = ({ isOpen, onClose, data, proposalsList }) => {
        if (!mounted || !isOpen || !data) return null;

        return createPortal(
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 md:p-6">
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity duration-300" onClick={onClose} />

                <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] md:rounded-[3.5rem] shadow-[0_30px_80px_-15px_rgba(0,0,0,0.5)] overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 fade-in duration-300">

                    {/* Header */}
                    <div className="p-6 md:p-8 border-b flex justify-between items-center bg-slate-50/30 shrink-0">
                        <div className="flex items-center gap-3">
                            <span className="bg-indigo-600 text-white p-2.5 rounded-2xl shrink-0 shadow-lg shadow-indigo-100">
                                <FaUserNurse size={20} />
                            </span>
                            <div>
                                <h3 className="font-black text-slate-900 text-sm md:text-base uppercase tracking-widest">Offers For #{data.requestId.slice(-8).toUpperCase()}</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Nurse Proposals Queue</p>
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
                    <div className="p-6 md:p-10 overflow-y-auto custom-scrollbar space-y-6 flex-1 bg-slate-50/40">

                        {/* Summary of services */}
                        {data.services && data.services.length > 0 && (
                            <div className="space-y-3 bg-white p-5 rounded-2xl border border-slate-100 shadow-xs shrink-0">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <FaFileMedical /> Requested Care Modules ({data.services.length})
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {data.services.map((svc, i) => (
                                        <div key={svc._id || i} className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs space-y-1">
                                            <p className="font-bold text-slate-800">{svc.title}</p>
                                            <p className="text-[10px] text-slate-400 font-semibold">{svc.description}</p>
                                            {svc.notes && <p className="text-[9px] text-indigo-600 italic font-bold">Note: "{svc.notes}"</p>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {proposalsLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 text-slate-400 font-bold text-xs uppercase tracking-wider gap-3">
                                <FiRefreshCw className="animate-spin text-indigo-600" size={24} />
                                <span>Syncing live nurse offers...</span>
                            </div>
                        ) : proposalsList && proposalsList.length > 0 ? (
                            <div className="space-y-6">
                                {proposalsList.map((proposal) => (
                                    <div key={proposal._id} className="bg-white border border-gray-150 rounded-[2rem] shadow-xs p-6 space-y-5 animate-in slide-in-from-top-4 duration-200">

                                        {/* Nurse Header */}
                                        <div className="flex items-center justify-between border-b pb-4 border-gray-100">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-xl border overflow-hidden shrink-0">
                                                    {proposal.nurseId?.profileImage || proposal.nurse?.profileImage ? (
                                                        <img
                                                            src={getReportFileUrl(proposal.nurseId?.profileImage || proposal.nurse?.profileImage)}
                                                            className="w-full h-full object-cover"
                                                            alt="Nurse avatar"
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.style.display = 'none';
                                                            }}
                                                        />
                                                    ) : (
                                                        (proposal.nurseId?.name || proposal.nurse?.name || 'N').charAt(0)
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-black text-slate-800">{proposal.nurseId?.name || proposal.nurse?.name || "Registered Nurse"}</h4>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{proposal.nurseId?.experienceYears || proposal.nurse?.experienceYears || 3} Years Experience</p>
                                                </div>
                                            </div>

                                            {/* Rating stars */}
                                            <div className="flex items-center gap-1 bg-amber-50 border border-amber-100 text-amber-600 px-2 py-1 rounded-lg text-xs font-black">
                                                <HiStar size={12} className="text-amber-400 fill-amber-400" /> {proposal.nurseId?.rating || proposal.nurse?.rating || "4.5"}
                                            </div>
                                        </div>

                                        {/* Pricing Breakdown lists */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-600">

                                            {/* Services pricing */}
                                            <div className="space-y-2">
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Services Billing</p>
                                                <div className="space-y-1 bg-[#fafafa] p-3 rounded-xl border border-gray-100">
                                                    {proposal.servicesPricing?.map((svc, i) => (
                                                        <div key={svc._id || i} className="flex justify-between items-center text-2xs py-1">
                                                            <span className="text-slate-700 truncate max-w-[140px]">{svc.title}</span>
                                                            <span className="font-bold text-slate-800">₹{svc.price}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Consumables pricing */}
                                            <div className="space-y-2">
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Used Consumables</p>
                                                <div className="space-y-1 bg-[#fafafa] p-3 rounded-xl border border-gray-100">
                                                    {proposal.consumablesUsed && proposal.consumablesUsed.length > 0 ? (
                                                        proposal.consumablesUsed.map((con, i) => (
                                                            <div key={i} className="flex justify-between items-center text-2xs py-1">
                                                                <span className="text-slate-700 truncate max-w-[140px]">{con.name}</span>
                                                                <span className="font-bold text-slate-800">₹{con.price}</span>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="text-2xs text-gray-400 py-2.5 font-semibold italic text-center">No materials required</div>
                                                    )}
                                                </div>
                                            </div>

                                        </div>

                                        {/* Financial Summary card */}
                                        <div className="bg-slate-900 text-white rounded-2xl p-5 flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-2">
                                                <FiCreditCard className="text-indigo-400" />
                                                <div>
                                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Est. Invoice Price</p>
                                                    <p className="text-2xs text-slate-500 font-medium">Includes tax & packaging</p>
                                                </div>
                                            </div>
                                            <span className="text-base font-black text-indigo-400">₹{proposal.priceBreakdown?.totalPrice || 1400}</span>
                                        </div>

                                        {/* Action buttons (COD vs Online) */}
                                        <div className="flex gap-2">
                                            <button
                                                disabled={actionLoading}
                                                onClick={() => handleAcceptProposal(proposal, "Online")}
                                                className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded-xl uppercase tracking-widest shadow-lg shadow-indigo-100 transition"
                                            >
                                                <span className="flex items-center justify-center gap-1.5">
                                                    <FiCreditCard /> Pay Online
                                                </span>
                                            </button>
                                        </div>

                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-12 text-center text-gray-400 font-medium text-[14px]">
                                No proposals submitted for this request yet.
                            </div>
                        )}

                    </div>

                </div>
            </div>,
            document.body
        );
    };

    return (
        <div className="bg-white border border-slate-200 rounded-[24px] md:rounded-[32px] overflow-hidden shadow-sm animate-fadeIn">
            {/* Header with Search */}
            <div className="p-5 md:p-8 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h3 className="font-black text-slate-900 text-lg md:text-xl tracking-tight">Nurse Broadcasts</h3>
                    <p className="text-slate-400 text-[9px] md:text-[10px] font-bold uppercase tracking-widest mt-1">Found {pagination.totalCount} Broadcasts</p>
                </div>
                <div className="relative w-full sm:w-72">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by request ID or status..."
                        className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-11 pr-4 text-xs md:text-sm font-semibold outline-none ring-1 ring-slate-100 focus:ring-indigo-500 transition-all"
                    />
                </div>
            </div>

            {/* List and Tables wrapper */}
            <div>
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <FiRefreshCw className="animate-spin text-indigo-600" size={26} />
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading records...</p>
                    </div>
                ) : filteredRequests.length === 0 ? (
                    <div className="text-center py-16 text-slate-400 text-xs font-medium">No nurse broadcasts available.</div>
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50">
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Broadcast ID</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Care Modules</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Address</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Broadcast Date</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Expiry Limit</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center font-bold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="text-[14px] text-gray-700">
                                    {filteredRequests.map((req, index) => (
                                        <tr
                                            key={req.requestId}
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
                                                {req.location?.address?.houseNo && `House ${req.location.address.houseNo}, `}
                                                {req.location?.address?.city && `${req.location.address.city}, `}
                                                {req.location?.address?.state && `${req.location.address.state}`}
                                            </td>
                                            <td className="p-5 text-center text-xs font-semibold text-slate-500">
                                                {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className="p-5 text-center text-xs font-bold text-red-500">
                                                {req.expiresAt ? new Date(req.expiresAt).toLocaleTimeString() : 'N/A'}
                                            </td>
                                            <td className="p-5 text-center">
                                                <span className={`inline-block px-3 py-1 rounded-lg text-[9px] font-black uppercase ${req.status === 'Completed' || req.status === 'Confirmed'
                                                        ? 'bg-green-50 text-green-600 border border-green-100'
                                                        : 'bg-amber-50 text-amber-600 border border-amber-100'
                                                    }`}>
                                                    {req.status || "Broadcasted"}
                                                </span>
                                            </td>

                                            <td className="p-5 text-center" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex justify-center gap-2">
                                                    <button
                                                        onClick={() => handleViewProposals(req)}
                                                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[12px] font-bold rounded-xl shadow-md shadow-indigo-100 transition-all"
                                                    >
                                                        <FaUserNurse size={12} /> Proposals
                                                    </button>
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
                                <div key={req.requestId} className="py-5 flex flex-col gap-3.5">
                                    <div className="flex justify-between items-start" onClick={() => handleOpenDetails(req)}>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 tracking-wider">#{req.requestId.slice(-8).toUpperCase()}</p>
                                            <h4 className="text-sm font-black text-slate-800 line-clamp-1">{getServicesSummary(req.services)}</h4>
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase ${getStatusStyles(req.status)}`}>{req.status}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => handleViewProposals(req)}
                                            className="w-full bg-indigo-600 hover:bg-indigo-700 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-center text-white flex items-center justify-center gap-1 shadow-md shadow-indigo-100"
                                        >
                                            <FaUserNurse /> View Proposals
                                        </button>
                                        <button
                                            onClick={() => handleOpenDetails(req)}
                                            className="py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-center border border-slate-200 bg-white"
                                        >
                                            View Details
                                        </button>
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
                    <button disabled={pagination.currentPage === 1} className="p-2 rounded-lg border border-slate-200 bg-white disabled:opacity-30"><FiChevronLeft size={16} /></button>
                    <button disabled={pagination.currentPage >= pagination.totalPages} className="p-2 rounded-lg border border-slate-200 bg-white disabled:opacity-30"><FiChevronRight size={16} /></button>
                </div>
            </div>

            {/* --- Portal Modals --- */}
            {detailsModal.isOpen && detailsModal.data && (
                <NurseRequestDetailsModal
                    data={detailsModal.data}
                    onClose={() => setDetailsModal({ isOpen: false, data: null })}
                />
            )}

            {proposalsModal.isOpen && proposalsModal.data && (
                <NurseProposalsModal
                    isOpen={proposalsModal.isOpen}
                    data={proposalsModal.data}
                    proposalsList={proposalsModal.proposals}
                    onClose={() => setProposalsModal({ isOpen: false, data: null, proposals: [] })}
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

export default NursePrescriptionOrders;