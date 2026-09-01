"use client";
import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { 
    FiSettings, FiClock, FiCheck, FiPlus, FiX, 
    FiRefreshCw, FiSave, FiShield, FiFileText,
    FiToggleLeft, FiToggleRight, FiRotateCcw, FiPackage,
    FiCreditCard, FiUser, FiCheckCircle, FiPhone, 
    FiMail, FiCalendar, FiTag, FiCheckSquare, FiCopy
} from 'react-icons/fi';
import { MdOutlineLocalPharmacy, MdOutlineReceiptLong, MdLocalHospital } from 'react-icons/md';
import { FaUserMd } from 'react-icons/fa';
import AdminAPI2 from '@/app/services/AdminAPI2'; 

export default function PharmacyReturnPolicyConfig() {
    const [activeTab, setActiveTab] = useState('policy'); // 'policy' | 'refundQueue'
    const [refundSubTab, setRefundSubTab] = useState('Pending'); // 'Pending' | 'Refunded'
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // Policy Form State
    const [policyId, setPolicyId] = useState(null);
    const [returnWindowDays, setReturnWindowDays] = useState(7);
    const [isReturnEnabled, setIsReturnEnabled] = useState(true);
    const [isReplacementEnabled, setIsReplacementEnabled] = useState(true);
    const [allowedReasons, setAllowedReasons] = useState([
        "Damaged or Leaked Item",
        "Expired Product Delivered",
        "Wrong Item Delivered",
        "Defective / Non-Functional Device",
        "Seal Broken / Tampered Packaging"
    ]);
    const [termsAndConditions, setTermsAndConditions] = useState(
        "1. Return/Replacement requests must be placed within the allowed window.\n2. Products must be returned in their original packaging with all accessories intact.\n3. Ingestible prescription medicines are strictly non-returnable.\n4. Refunds will be processed once the returned package is physically verified at the pharmacy store."
    );
    const [newReasonInput, setNewReasonInput] = useState("");

    // Unified Refund Queue State
    const [refundQueue, setRefundQueue] = useState([]);
    const [refundLoading, setRefundLoading] = useState(false);
    const [processingRefundId, setProcessingRefundId] = useState(null);

    // 1. Fetch Return Policy Settings
    const fetchPolicy = useCallback(async () => {
        setLoading(true);
        try {
            const response = await AdminAPI2.getPharmacyReturnPolicy();
            const res = response?.data || response;

            if (res && res.success && res.data) {
                setPolicyId(res.data._id);
                setReturnWindowDays(res.data.returnWindowDays ?? 7);
                setIsReturnEnabled(res.data.isReturnEnabled ?? true);
                setIsReplacementEnabled(res.data.isReplacementEnabled ?? true);
                if (Array.isArray(res.data.allowedReasons) && res.data.allowedReasons.length > 0) {
                    setAllowedReasons(res.data.allowedReasons);
                }
                if (res.data.termsAndConditions) {
                    setTermsAndConditions(res.data.termsAndConditions);
                }
            }
        } catch (error) {
            console.error("Error loading policy:", error);
            toast.error("Failed to load return policy settings.");
        } finally {
            setLoading(false);
        }
    }, []);

    // 2. Fetch Unified Refund Queue (Pending or Refunded History)
    const fetchRefundQueue = useCallback(async () => {
        setRefundLoading(true);
        try {
            const response = await AdminAPI2.getUnifiedRefundQueue(refundSubTab);
            const res = response?.data || response;
            if (res && res.success) {
                setRefundQueue(Array.isArray(res.data) ? res.data : []);
            }
        } catch (error) {
            console.error("Error fetching refund queue:", error);
        } finally {
            setRefundLoading(false);
        }
    }, [refundSubTab]);

    useEffect(() => {
        fetchPolicy();
    }, [fetchPolicy]);

    useEffect(() => {
        if (activeTab === 'refundQueue') {
            fetchRefundQueue();
        }
    }, [activeTab, fetchRefundQueue]);

    const handleAddReason = (e) => {
        e.preventDefault();
        const trimmed = newReasonInput.trim();
        if (!trimmed) return;
        if (allowedReasons.includes(trimmed)) return toast.error("Reason already exists.");
        setAllowedReasons([...allowedReasons, trimmed]);
        setNewReasonInput("");
    };

    const handleRemoveReason = (indexToRemove) => {
        if (allowedReasons.length <= 1) return toast.error("At least one return reason must remain active.");
        setAllowedReasons(allowedReasons.filter((_, idx) => idx !== indexToRemove));
    };

    const handleSave = async () => {
        if (returnWindowDays < 1 || returnWindowDays > 30) {
            return toast.error("Return window must be between 1 and 30 days.");
        }
        if (!termsAndConditions.trim()) {
            return toast.error("Terms & Conditions text cannot be empty.");
        }

        setSaving(true);
        try {
            const payload = {
                returnWindowDays: Number(returnWindowDays),
                isReturnEnabled,
                isReplacementEnabled,
                allowedReasons,
                termsAndConditions
            };

            const response = await AdminAPI2.updatePharmacyReturnPolicy(payload);
            const res = response?.data || response;

            if (res && res.success) {
                toast.success(res.message || "Pharmacy Return & Replacement Policy and T&C updated successfully!");
                fetchPolicy();
            } else {
                toast.error(res?.message || "Failed to update return policy.");
            }
        } catch (error) {
            console.error("Save policy error:", error);
            toast.error(error.response?.data?.message || "Server error while updating policy.");
        } finally {
            setSaving(false);
        }
    };

    // Execute Razorpay Payout
    const handleExecutePayout = async (bookingMongoId, vendorModel, amount) => {
        setProcessingRefundId(bookingMongoId);
        try {
            const response = await AdminAPI2.processRefundPayout(bookingMongoId, vendorModel || 'Pharmacy');
            const res = response?.data || response;

            if (res && res.success) {
                toast.success(res.message || `Successfully refunded ₹${amount} via Razorpay!`);
                fetchRefundQueue();
            } else {
                toast.error(res?.message || "Refund payout failed.");
            }
        } catch (error) {
            console.error("Payout error:", error);
            toast.error(error.response?.data?.message || "Failed to execute payout.");
        } finally {
            setProcessingRefundId(null);
        }
    };

    const getVendorModelBadge = (model) => {
        switch (model) {
            case 'Hospital':
                return { label: 'Hospital', icon: <MdLocalHospital size={12} />, style: 'bg-purple-50 text-purple-700 border-purple-200' };
            case 'Doctor':
                return { label: 'Doctor Consult', icon: <FaUserMd size={10} />, style: 'bg-blue-50 text-blue-700 border-blue-200' };
            case 'Pharmacy':
                return { label: 'Pharmacy', icon: <MdOutlineLocalPharmacy size={12} />, style: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
            default:
                return { label: model || 'General', icon: <FiTag size={10} />, style: 'bg-slate-50 text-slate-700 border-slate-200' };
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success("Refund ID copied to clipboard!");
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 bg-white rounded-3xl border border-slate-100 p-8">
                <FiRefreshCw className="animate-spin text-indigo-600" size={28} />
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Loading Return Control Center...</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn pb-12">
            {/* Top Banner Header */}
            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-6 md:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100 shrink-0">
                        <MdOutlineLocalPharmacy size={28} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-black text-slate-900 tracking-tight">Pharmacy Return & Refund Center</h2>
                            <span className="bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                                Platform Admin
                            </span>
                        </div>
                        <p className="text-xs font-bold text-slate-400 mt-1">
                            Configure return policy windows, legal Terms & Conditions, and execute Razorpay payouts.
                        </p>
                    </div>
                </div>

                {activeTab === 'policy' && (
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full sm:w-auto px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-slate-200 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {saving ? <FiRefreshCw className="animate-spin" /> : <FiSave />}
                        <span>Save Policy & T&C</span>
                    </button>
                )}
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-2 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200 w-fit">
                <button
                    onClick={() => setActiveTab('policy')}
                    className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
                        activeTab === 'policy' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                    <FiSettings size={14} /> Policy & Terms
                </button>
                <button
                    onClick={() => { setActiveTab('refundQueue'); }}
                    className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
                        activeTab === 'refundQueue' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                    <MdOutlineReceiptLong size={16} /> 
                    <span>Unified Refund Center</span>
                </button>
            </div>

            {/* TAB 1: POLICY & T&C CONFIGURATION */}
            {activeTab === 'policy' && (
                <div className="space-y-8 animate-fadeIn">
                    {/* Compliance Guard Alert */}
                    <div className="bg-amber-50/70 border border-amber-200/70 rounded-[2rem] p-6 flex items-start gap-4">
                        <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-sm shrink-0">
                            <FiShield size={20} />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-xs font-black uppercase tracking-wider text-amber-900">Health & Drug Safety Compliance Guard</h4>
                            <p className="text-xs font-medium text-amber-800 leading-relaxed">
                                Ingestible prescription drugs are automatically blocked from returns. Return policies configured below apply strictly to <strong>medical equipment, monitoring devices, and eligible OTC health products</strong>.
                            </p>
                        </div>
                    </div>

                    {/* Window Days & Master Toggles Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* 1. Return Window Limit */}
                        <div className="bg-white border border-slate-200 rounded-[2rem] p-6 md:p-8 space-y-6 shadow-sm flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-2.5 mb-2">
                                    <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><FiClock size={18} /></span>
                                    <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider">Return Time Window</h3>
                                </div>
                                <p className="text-xs font-medium text-slate-400">
                                    Calendar days after delivery during which a customer can raise a return or replacement ticket.
                                </p>
                            </div>

                            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-black uppercase text-slate-500 tracking-wider">Allowed Window Limit</span>
                                    <span className="text-2xl font-black text-indigo-600 bg-white px-4 py-1.5 rounded-xl border border-slate-200 shadow-sm">
                                        {returnWindowDays} {returnWindowDays === 1 ? "Day" : "Days"}
                                    </span>
                                </div>

                                <input
                                    type="range"
                                    min="1"
                                    max="30"
                                    step="1"
                                    value={returnWindowDays}
                                    onChange={(e) => setReturnWindowDays(Number(e.target.value))}
                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                />
                                <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                                    <span>1 Day (Min)</span>
                                    <span>7 Days</span>
                                    <span>15 Days</span>
                                    <span>30 Days (Max)</span>
                                </div>
                            </div>
                        </div>

                        {/* 2. Feature Toggles */}
                        <div className="bg-white border border-slate-200 rounded-[2rem] p-6 md:p-8 space-y-6 shadow-sm flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-2.5 mb-2">
                                    <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><FiSettings size={18} /></span>
                                    <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider">Feature Availability</h3>
                                </div>
                                <p className="text-xs font-medium text-slate-400">
                                    Globally enable or disable post-delivery return & refund or product replacement actions.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <FiRotateCcw className="text-slate-400" size={18} />
                                        <div>
                                            <h5 className="text-xs font-black text-slate-800 uppercase tracking-wide">Enable Returns (Refund)</h5>
                                            <p className="text-[10px] font-semibold text-slate-400">Allow customers to return items for refund</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setIsReturnEnabled(!isReturnEnabled)}
                                        className={`text-2xl transition-colors ${isReturnEnabled ? 'text-indigo-600' : 'text-slate-300'}`}
                                    >
                                        {isReturnEnabled ? <FiToggleRight size={36} /> : <FiToggleLeft size={36} />}
                                    </button>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <FiPackage className="text-slate-400" size={18} />
                                        <div>
                                            <h5 className="text-xs font-black text-slate-800 uppercase tracking-wide">Enable Replacements</h5>
                                            <p className="text-[10px] font-semibold text-slate-400">Allow customers to exchange defective products</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setIsReplacementEnabled(!isReplacementEnabled)}
                                        className={`text-2xl transition-colors ${isReplacementEnabled ? 'text-indigo-600' : 'text-slate-300'}`}
                                    >
                                        {isReplacementEnabled ? <FiToggleRight size={36} /> : <FiToggleLeft size={36} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. Reason Manager */}
                    <div className="bg-white border border-slate-200 rounded-[2rem] p-6 md:p-8 space-y-6 shadow-sm">
                        <div>
                            <div className="flex items-center gap-2.5 mb-2">
                                <span className="p-2 bg-amber-50 text-amber-600 rounded-xl"><FiCheck size={18} /></span>
                                <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider">Acceptable Return Reasons</h3>
                            </div>
                            <p className="text-xs font-medium text-slate-400">
                                These tags populate the dropdown options presented to users when submitting a claim.
                            </p>
                        </div>

                        <form onSubmit={handleAddReason} className="flex gap-2">
                            <input
                                type="text"
                                value={newReasonInput}
                                onChange={(e) => setNewReasonInput(e.target.value)}
                                placeholder="Add custom reason tag..."
                                className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <button
                                type="submit"
                                className="px-5 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-indigo-100"
                            >
                                <FiPlus size={16} /> Add Reason
                            </button>
                        </form>

                        <div className="flex flex-wrap gap-2.5 pt-2">
                            {allowedReasons.map((reason, idx) => (
                                <div
                                    key={`reason-${idx}`}
                                    className="bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-2xl px-4 py-2.5 flex items-center gap-3 transition-colors group"
                                >
                                    <span className="text-xs font-black text-slate-700">{reason}</span>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveReason(idx)}
                                        className="w-5 h-5 rounded-full bg-slate-200 group-hover:bg-rose-100 text-slate-400 group-hover:text-rose-600 flex items-center justify-center transition-colors"
                                    >
                                        <FiX size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 4. Terms & Conditions Editor */}
                    <div className="bg-white border border-slate-200 rounded-[2rem] p-6 md:p-8 space-y-4 shadow-sm">
                        <div className="flex items-center gap-2.5">
                            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><FiFileText size={18} /></span>
                            <div>
                                <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider">Legal Terms & Conditions</h3>
                                <p className="text-xs font-medium text-slate-400">
                                    This text is rendered to patients inside the Return Submission modal and on the tracking screen.
                                </p>
                            </div>
                        </div>

                        <textarea
                            value={termsAndConditions}
                            onChange={(e) => setTermsAndConditions(e.target.value)}
                            rows={6}
                            required
                            placeholder="Enter the numbered platform return terms and policies..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed custom-scrollbar resize-none"
                        />
                    </div>
                </div>
            )}

            {/* TAB 2: UNIFIED REFUND QUEUE (PENDING VS COMPLETED / REFUNDED HISTORY) */}
            {activeTab === 'refundQueue' && (
                <div className="space-y-6 animate-fadeIn">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
                        <div>
                            <h3 className="font-black text-slate-900 text-base tracking-tight">Unified Refund Management</h3>
                            <p className="text-xs font-semibold text-slate-400">
                                Process pending claims or view completed Razorpay payouts and bank reference numbers.
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Sub-Tabs: Pending vs Refunded History */}
                            <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200">
                                <button
                                    onClick={() => setRefundSubTab('Pending')}
                                    className={`px-4 py-2 rounded-lg text-xs font-black uppercase transition-all ${
                                        refundSubTab === 'Pending' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                                    }`}
                                >
                                    Pending Claims
                                </button>
                                <button
                                    onClick={() => setRefundSubTab('Refunded')}
                                    className={`px-4 py-2 rounded-lg text-xs font-black uppercase transition-all ${
                                        refundSubTab === 'Refunded' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                                    }`}
                                >
                                    Completed / History
                                </button>
                            </div>

                            <button
                                onClick={fetchRefundQueue}
                                className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200 transition-all active:scale-95"
                                title="Refresh List"
                            >
                                <FiRefreshCw size={15} className={refundLoading ? "animate-spin text-indigo-600" : ""} />
                            </button>
                        </div>
                    </div>

                    {refundLoading ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-3 bg-white rounded-[2rem] border">
                            <FiRefreshCw className="animate-spin text-indigo-600" size={26} />
                            <p className="text-xs font-black uppercase text-slate-400">Loading {refundSubTab} Refunds...</p>
                        </div>
                    ) : refundQueue.length === 0 ? (
                        <div className="bg-white border border-slate-200 rounded-[2rem] p-12 text-center space-y-2">
                            <FiCheckCircle size={32} className="text-emerald-500 mx-auto" />
                            <h4 className="font-black text-slate-800 text-sm uppercase">No {refundSubTab} Refunds Found</h4>
                            <p className="text-xs font-semibold text-slate-400">All customer claims in this state are up to date.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {refundQueue.map((item, index) => {
                                const uniqueKey = item.bookingMongoId || item._id || item.bookingId || `refund-item-${index}`;
                                const targetMongoId = item.bookingMongoId || item._id;
                                const refundAmount = item.refundAmountCalculated ?? item.returnDetails?.refundAmount ?? item.totalPaid ?? 0;
                                const totalPaid = item.totalPaid ?? refundAmount;
                                const penaltyApplied = item.penaltyApplied ?? 0;
                                const vendorBadge = getVendorModelBadge(item.vendorModel);
                                const isRefunded = item.paymentStatus === 'Refunded' || refundSubTab === 'Refunded';

                                return (
                                    <div
                                        key={uniqueKey}
                                        className="bg-white border border-slate-200/80 rounded-[2rem] p-6 space-y-4 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all"
                                    >
                                        {/* Row 1: Header Meta Bar */}
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3.5">
                                            <div className="flex flex-wrap items-center gap-2.5">
                                                <span className="text-sm font-black text-slate-900 tracking-wider">
                                                    #{item.bookingId || item.orderId || targetMongoId}
                                                </span>
                                                <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase border flex items-center gap-1 ${vendorBadge.style}`}>
                                                    {vendorBadge.icon} {vendorBadge.label}
                                                </span>
                                                <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase bg-slate-100 text-slate-600 border border-slate-200">
                                                    {item.refundType || 'Cancellation'}
                                                </span>

                                                {/* Green Refunded Badge */}
                                                {isRefunded && (
                                                    <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                                                        <FiCheckCircle size={10} /> Refunded
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex flex-col sm:items-end text-[10px] font-bold text-slate-400 gap-0.5">
                                                {item.createdAt && (
                                                    <span className="flex items-center gap-1">
                                                        <FiCalendar size={11} /> Created: {new Date(item.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </span>
                                                )}
                                                {item.processedAt && (
                                                    <span className="text-emerald-700 font-extrabold flex items-center gap-1">
                                                        <FiCheck size={11} /> Processed: {new Date(item.processedAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Row 2: Customer Profile & Financial Breakdown */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
                                            {/* Customer Data */}
                                            <div className="space-y-1">
                                                <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Customer Details</span>
                                                <p className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                                                    <FiUser className="text-slate-400" /> {item.customer?.name || "Patient"}
                                                </p>
                                                {item.customer?.phone && (
                                                    <p className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
                                                        <FiPhone className="text-slate-400" size={11} /> {item.customer.phone}
                                                    </p>
                                                )}
                                                {item.customer?.email && (
                                                    <p className="text-[10px] font-medium text-slate-400 flex items-center gap-1.5 truncate">
                                                        <FiMail className="text-slate-400" size={11} /> {item.customer.email}
                                                    </p>
                                                )}
                                                {item.pharmacyName && (
                                                    <p className="text-[10px] font-black text-emerald-700 mt-1 uppercase">
                                                        Store: {item.pharmacyName}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Reason Note */}
                                            <div className="space-y-1">
                                                <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Claim Reason</span>
                                                <p className="text-xs font-semibold text-slate-700 italic leading-relaxed">
                                                    "{item.reason || "No customer explanation provided."}"
                                                </p>
                                                {item.paymentMethod && (
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase block mt-1">
                                                        Paid via: {item.paymentMethod}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Financial Calculations */}
                                            <div className="space-y-1 md:text-right">
                                                <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Payout Calculations</span>
                                                <div className="text-[11px] font-bold text-slate-500 space-y-0.5">
                                                    <div>Total Paid: <span className="text-slate-800">₹{totalPaid}</span></div>
                                                    {penaltyApplied > 0 && (
                                                        <div className="text-rose-600">Penalty Fee: -₹{penaltyApplied}</div>
                                                    )}
                                                </div>
                                                <div className="text-base font-black text-indigo-600 pt-1">
                                                    {isRefunded ? "Total Refunded:" : "Net Refund:"} ₹{refundAmount}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Row 3: Action Execution / Razorpay Reference */}
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-1">
                                            {/* Razorpay Refund Reference ID if already completed */}
                                            {item.refundId ? (
                                                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-xl">
                                                    <span className="text-[10px] font-black uppercase text-emerald-800">
                                                        Razorpay Payout ID: <code className="text-xs font-mono font-bold text-emerald-950 ml-1">{item.refundId}</code>
                                                    </span>
                                                    <button 
                                                        onClick={() => copyToClipboard(item.refundId)} 
                                                        className="text-emerald-600 hover:text-emerald-800 p-1"
                                                        title="Copy ID"
                                                    >
                                                        <FiCopy size={13} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-[10px] font-bold text-slate-400">
                                                    Target: Razorpay Direct Bank / UPI Refund
                                                </span>
                                            )}

                                            {/* Action Button (Only show if pending) */}
                                            {!isRefunded ? (
                                                <button
                                                    onClick={() => handleExecutePayout(targetMongoId, item.vendorModel, refundAmount)}
                                                    disabled={processingRefundId === targetMongoId || refundAmount <= 0}
                                                    className={`w-full sm:w-auto px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 ${
                                                        refundAmount <= 0
                                                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                                                            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-100'
                                                    }`}
                                                >
                                                    {processingRefundId === targetMongoId ? (
                                                        <>
                                                            <FiRefreshCw className="animate-spin" />
                                                            <span>Processing Payout...</span>
                                                        </>
                                                    ) : refundAmount <= 0 ? (
                                                        <span>No Refund Due (₹0)</span>
                                                    ) : (
                                                        <>
                                                            <FiCreditCard />
                                                            <span>Execute Razorpay Payout (₹{refundAmount})</span>
                                                        </>
                                                    )}
                                                </button>
                                            ) : (
                                                <div className="flex items-center gap-1.5 text-xs font-black text-emerald-700 uppercase">
                                                    <FiCheckSquare size={16} /> Payout Completed & Bank Verified
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}