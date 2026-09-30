'use client';
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import { 
    FaUndoAlt, FaCheck, FaTimes, FaImage, FaUser, 
    FaPhone, FaSpinner, FaEye, FaBoxOpen, FaTruck, 
    FaWarehouse, FaExchangeAlt, FaBan
} from 'react-icons/fa';
import PharmacyVendorAPI from '@/app/services/PharmacyVendorAPI';

export default function Returns({ orders = [], searchTerm = '', refresh }) {
    const [filterStatus, setFilterStatus] = useState('Requested'); // 'Requested' | 'Approved' | 'Completed' | 'Rejected' | 'All'
    
    // Modals
    const [reviewModal, setReviewModal] = useState({ isOpen: false, order: null, action: null });
    const [storeReceiptModal, setStoreReceiptModal] = useState({ isOpen: false, order: null });
    const [storeDecision, setStoreDecision] = useState('Approve_And_Restock');
    const [storeRemarks, setStoreRemarks] = useState('');
    const [previewImage, setPreviewImage] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Filter by search & return status tab
    const filteredOrders = orders.filter(o => {
        const returnStatus = o.returnDetails?.status || (o.isReturnRequested ? 'Requested' : 'None');
        
        if (filterStatus !== 'All') {
            if (filterStatus === 'Completed' && !['Completed', 'ReceivedAtStore'].includes(returnStatus)) return false;
            if (filterStatus === 'Approved' && !['Approved', 'CollectedByDriver'].includes(returnStatus)) return false;
            if (filterStatus === 'Requested' && returnStatus !== 'Requested') return false;
            if (filterStatus === 'Rejected' && returnStatus !== 'Rejected') return false;
        }

        const query = searchTerm.toLowerCase();
        const id = o.orderId ? String(o.orderId).toLowerCase() : '';
        const name = o.userId?.name ? String(o.userId.name).toLowerCase() : '';
        const itemMatch = o.items?.some(i => i.name?.toLowerCase().includes(query));
        return id.includes(query) || name.includes(query) || itemMatch;
    });

    // --- STEP B: INITIAL APPROVAL / REJECTION FOR DRIVER PICKUP ---
    const handleInitialActionSubmit = async (e) => {
        e.preventDefault();
        const { order, action } = reviewModal;

        if (action === 'Rejected' && !rejectionReason.trim()) {
            return toast.error("Please provide a rejection reason.");
        }

        setSubmitting(true);
        try {
            const payload = {
                action,
                ...(action === 'Rejected' && { rejectionReason: rejectionReason.trim() })
            };

            const res = await PharmacyVendorAPI.reviewReturnAction(order._id, payload);
            if (res.data?.success || res.status === 200) {
                toast.success(res.data?.message || `Return request ${action.toLowerCase()} successfully.`);
                setReviewModal({ isOpen: false, order: null, action: null });
                setRejectionReason('');
                if (refresh) refresh();
            } else {
                toast.error(res.data?.message || "Failed to process request.");
            }
        } catch (error) {
            console.error("Action error:", error);
            toast.error(error.response?.data?.message || "Error processing return action.");
        } finally {
            setSubmitting(false);
        }
    };

    // --- STEP C: FINAL STORE RECEIPT & INVENTORY RESTOCK VERIFICATION ---
    const handleStoreReceiptSubmit = async (e) => {
        e.preventDefault();
        const { order } = storeReceiptModal;
        if (!order) return;

        setSubmitting(true);
        try {
            const res = await PharmacyVendorAPI.confirmStoreReceipt(
                order.orderId || order._id,
                storeDecision,
                storeRemarks.trim()
            );

            if (res.data?.success || res.status === 200) {
                toast.success(res.data?.message || "Store receipt verified and stock updated!");
                setStoreReceiptModal({ isOpen: false, order: null });
                setStoreRemarks('');
                setStoreDecision('Approve_And_Restock');
                if (refresh) refresh();
            } else {
                toast.error(res.data?.message || "Failed to confirm store receipt.");
            }
        } catch (error) {
            console.error("Store receipt error:", error);
            toast.error(error.response?.data?.message || "Failed to verify store receipt.");
        } finally {
            setSubmitting(false);
        }
    };

    const getBadgeStyle = (status) => {
        switch (status) {
            case 'Requested': return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'Approved': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
            case 'CollectedByDriver': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'Completed':
            case 'ReceivedAtStore': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'Rejected': return 'bg-rose-100 text-rose-800 border-rose-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* SUB-FILTER TABS */}
            <div className="flex flex-wrap gap-2 p-1.5 bg-slate-50 rounded-2xl border border-slate-100 w-fit">
                {[
                    { key: 'Requested', label: '1. Pending Review' },
                    { key: 'Approved', label: '2. Driver Pickup In-Progress' },
                    { key: 'Completed', label: '3. Store Restocked & Closed' },
                    { key: 'Rejected', label: 'Rejected' },
                    { key: 'All', label: 'All Returns' }
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setFilterStatus(tab.key)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                            filterStatus === tab.key
                                ? 'bg-white text-slate-900 shadow-sm'
                                : 'text-slate-400 hover:text-slate-600'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ORDERS LIST */}
            {filteredOrders.length === 0 ? (
                <div className="text-center py-20 text-slate-400 space-y-2">
                    <FaUndoAlt className="mx-auto text-3xl opacity-30" />
                    <p className="text-xs font-bold uppercase tracking-wider">No {filterStatus} Return Requests</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredOrders.map(order => {
                        const ret = order.returnDetails || {};
                        const isInitialPending = ret.status === 'Requested';
                        const isPendingStoreReceipt = ['Approved', 'CollectedByDriver'].includes(ret.status);

                        return (
                            <div 
                                key={order._id} 
                                className="bg-slate-50/50 border border-slate-100 hover:border-emerald-200 rounded-3xl p-6 transition-all space-y-4 shadow-sm"
                            >
                                {/* Header */}
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
                                            <FaUndoAlt size={16} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-black text-slate-900 text-sm tracking-wider">#{order.orderId}</h4>
                                                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase border ${getBadgeStyle(ret.status)}`}>
                                                    {ret.requestType || 'Return'}: {ret.status || 'Requested'}
                                                </span>
                                            </div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                                Requested on: {new Date(ret.requestedAt || order.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="text-left sm:text-right">
                                        <span className="text-[9px] font-black uppercase text-slate-400 block">Claim Amount</span>
                                        <span className="text-base font-black text-slate-900">
                                            ₹{ret.refundAmount || order.billSummary?.totalAmount}
                                        </span>
                                    </div>
                                </div>

                                {/* Reason & Comments */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-2xl border border-slate-100 text-xs">
                                    <div>
                                        <span className="text-[9px] font-black uppercase text-slate-400 block mb-1">Reason</span>
                                        <p className="font-bold text-slate-800">{ret.reason || "Not specified"}</p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <span className="text-[9px] font-black uppercase text-slate-400 block mb-1">Customer Note</span>
                                        <p className="font-medium text-slate-600 italic">
                                            "{ret.userComments || "No description provided."}"
                                        </p>
                                    </div>
                                </div>

                                {/* Proof Photos */}
                                {Array.isArray(ret.proofImages) && ret.proofImages.length > 0 && (
                                    <div className="space-y-2">
                                        <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                                            <FaImage /> Attached Proof Evidence ({ret.proofImages.length})
                                        </span>
                                        <div className="flex flex-wrap gap-2">
                                            {ret.proofImages.map((img, i) => (
                                                <button
                                                    key={i}
                                                    type="button"
                                                    onClick={() => setPreviewImage(img)}
                                                    className="w-14 h-14 rounded-xl border border-slate-200 overflow-hidden relative group hover:opacity-80 transition-all"
                                                >
                                                    <img src={img} alt="proof" className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 text-white transition-opacity">
                                                        <FaEye size={12} />
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Footer & Action Controls */}
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2 border-t border-slate-100">
                                    <div className="flex items-center gap-4 text-xs font-bold text-slate-600">
                                        <span className="flex items-center gap-1.5"><FaUser className="text-slate-400" /> {order.userId?.name || "Customer"}</span>
                                        <span className="flex items-center gap-1.5"><FaPhone className="text-slate-400" /> {order.userId?.phone || "N/A"}</span>
                                    </div>

                                    {/* STEP B CONTROLS: Approve for driver pickup */}
                                    {isInitialPending && (
                                        <div className="flex items-center gap-2 w-full sm:w-auto">
                                            <button
                                                onClick={() => setReviewModal({ isOpen: true, order, action: 'Rejected' })}
                                                className="flex-1 sm:flex-none px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                                            >
                                                Reject Claim
                                            </button>
                                            <button
                                                onClick={() => setReviewModal({ isOpen: true, order, action: 'Approved' })}
                                                className="flex-1 sm:flex-none px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-1.5"
                                            >
                                                <FaTruck size={11} /> Approve for Driver Pickup
                                            </button>
                                        </div>
                                    )}

                                    {/* STEP C CONTROLS: Confirm Store Receipt & Restock */}
                                    {isPendingStoreReceipt && (
                                        <button
                                            onClick={() => setStoreReceiptModal({ isOpen: true, order })}
                                            className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-md shadow-emerald-100 flex items-center justify-center gap-2"
                                        >
                                            <FaWarehouse size={12} /> Confirm Store Receipt & Restock
                                        </button>
                                    )}

                                    {ret.status === 'Rejected' && ret.rejectionReason && (
                                        <p className="text-xs font-bold text-rose-600">
                                            Rejection Note: {ret.rejectionReason}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* STEP B MODAL: APPROVE DRIVER PICKUP OR REJECT */}
            {reviewModal.isOpen && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-[32px] p-6 space-y-6 shadow-2xl animate-in zoom-in-95">
                        <div className="flex justify-between items-center">
                            <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider">
                                {reviewModal.action === 'Approved' ? "Approve Return for Pickup" : "Reject Return Request"}
                            </h3>
                            <button onClick={() => setReviewModal({ isOpen: false, order: null, action: null })} className="text-slate-400 hover:text-slate-600">
                                <FaTimes size={16} />
                            </button>
                        </div>

                        {reviewModal.action === 'Approved' ? (
                            <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 text-xs font-semibold text-indigo-900 space-y-2">
                                <p className="font-bold flex items-center gap-1.5 text-indigo-950">
                                    <FaTruck /> Driver Assignment Handshake
                                </p>
                                <p>
                                    Approving authorizes driver pickup from the patient's doorstep. 
                                    <strong> Stock will NOT be restored</strong> until the package is physically verified at your pharmacy counter.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                                    Rejection Reason *
                                </label>
                                <textarea
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    rows={3}
                                    required
                                    placeholder="Explain why this request is rejected..."
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-rose-500 resize-none"
                                />
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setReviewModal({ isOpen: false, order: null, action: null })}
                                className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl text-xs font-black uppercase"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={submitting}
                                onClick={handleInitialActionSubmit}
                                className={`flex-1 py-3 text-white rounded-xl text-xs font-black uppercase flex items-center justify-center gap-2 ${
                                    reviewModal.action === 'Approved' ? 'bg-slate-900 hover:bg-slate-800' : 'bg-rose-600 hover:bg-rose-700'
                                }`}
                            >
                                {submitting ? <FaSpinner className="animate-spin" /> : "Confirm Action"}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* STEP C MODAL: CONFIRM STORE RECEIPT & DECISION */}
            {storeReceiptModal.isOpen && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-lg rounded-[32px] p-6 md:p-8 space-y-6 shadow-2xl animate-in zoom-in-95">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider">
                                    Counter Receipt Verification
                                </h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">
                                    Order #{storeReceiptModal.order?.orderId}
                                </p>
                            </div>
                            <button onClick={() => setStoreReceiptModal({ isOpen: false, order: null })} className="text-slate-400 hover:text-slate-600">
                                <FaTimes size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleStoreReceiptSubmit} className="space-y-4">
                            {/* Decision Selectors */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">
                                    Store Inspection Decision *
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                    {[
                                        { key: 'Approve_And_Restock', label: 'Restock & Refund', icon: FaWarehouse },
                                        { key: 'Approve_And_Replace', label: 'Replace Order', icon: FaExchangeAlt },
                                        { key: 'Reject_Damaged', label: 'Reject Damaged', icon: FaBan }
                                    ].map(item => {
                                        const Icon = item.icon;
                                        const isSelected = storeDecision === item.key;
                                        return (
                                            <button
                                                key={item.key}
                                                type="button"
                                                onClick={() => setStoreDecision(item.key)}
                                                className={`p-3 rounded-2xl border text-left flex flex-col justify-between gap-2 transition-all ${
                                                    isSelected
                                                        ? 'bg-emerald-50 border-emerald-600 ring-1 ring-emerald-600 text-emerald-900'
                                                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                                                }`}
                                            >
                                                <Icon size={14} className={isSelected ? 'text-emerald-600' : 'text-slate-400'} />
                                                <span className="text-[10px] font-black uppercase tracking-wider leading-tight">{item.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Remarks */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">
                                    Pharmacist Counter Notes
                                </label>
                                <textarea
                                    value={storeRemarks}
                                    onChange={(e) => setStoreRemarks(e.target.value)}
                                    rows={3}
                                    placeholder="E.g., Package verified at store counter, medicine restocked into inventory."
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setStoreReceiptModal({ isOpen: false, order: null })}
                                    className="flex-1 py-3.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-black uppercase"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase shadow-lg shadow-emerald-100 flex items-center justify-center gap-2"
                                >
                                    {submitting ? <FaSpinner className="animate-spin" /> : "Complete Verification"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}

            {/* LIGHTBOX PREVIEW */}
            {previewImage && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-[999999] bg-black/80 flex items-center justify-center p-4" onClick={() => setPreviewImage(null)}>
                    <div className="relative max-w-xl max-h-[80vh]">
                        <img src={previewImage} alt="Full view" className="w-full h-full object-contain rounded-2xl" />
                        <button onClick={() => setPreviewImage(null)} className="absolute top-3 right-3 text-white bg-black/50 p-2 rounded-full">
                            <FaTimes size={16} />
                        </button>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}