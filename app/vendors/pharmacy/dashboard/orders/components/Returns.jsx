'use client';
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import { 
    FaUndoAlt, FaCheck, FaTimes, FaImage, FaUser, 
    FaPhone, FaSpinner, FaEye, FaTruck, 
    FaWarehouse, FaExchangeAlt, FaBan, FaMotorcycle, FaSyncAlt
} from 'react-icons/fa';
import PharmacyVendorAPI from '@/app/services/PharmacyVendorAPI';

export default function Returns({ orders = [], searchTerm = '', refresh }) {
    const [filterStatus, setFilterStatus] = useState('Requested'); // 'Requested' | 'Approved' | 'Completed' | 'Rejected' | 'All'
    
    // Modals & States
    const [rejectModal, setRejectModal] = useState({ isOpen: false, order: null });
    const [rejectionReason, setRejectionReason] = useState('');
    
    // Driver Modal State
    const [driverModal, setDriverModal] = useState({ isOpen: false, order: null });
    const [availableDrivers, setAvailableDrivers] = useState([]);
    const [fetchingDrivers, setFetchingDrivers] = useState(false);
    const [selectedDriverId, setSelectedDriverId] = useState(null);
    
    // Store Receipt Modal State
    const [storeReceiptModal, setStoreReceiptModal] = useState({ isOpen: false, order: null });
    const [storeDecision, setStoreDecision] = useState('Approve_And_Restock');
    const [storeNote, setStoreNote] = useState('');
    
    const [previewImage, setPreviewImage] = useState(null);
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

    // =========================================================================
    // STEP 1: FETCH AVAILABLE DRIVERS & OPEN MODAL
    // =========================================================================
    const handleOpenDriverModal = async (order) => {
        setDriverModal({ isOpen: true, order });
        setFetchingDrivers(true);
        setSelectedDriverId(null);

        console.log("🔍 [FETCHING AVAILABLE DRIVERS for Return]:", order.orderId || order._id);

        try {
            const res = await PharmacyVendorAPI.listAvailableDrivers();
            console.log("🚚 Available Drivers Response:", res);
            const driversList = res?.data || res || [];
            const validDrivers = Array.isArray(driversList) ? driversList : [];
            setAvailableDrivers(validDrivers);

            if (validDrivers.length > 0) {
                setSelectedDriverId(validDrivers[0]._id);
            }
        } catch (error) {
            console.error("❌ Error fetching available drivers:", error);
            toast.error(error.response?.data?.message || "Failed to load drivers.");
            setAvailableDrivers([]);
        } finally {
            setFetchingDrivers(false);
        }
    };

    // =========================================================================
    // STEP 2: POST /provider/pharmacy/orders/return/assign-driver
    // =========================================================================
    const handleAssignDriverSubmit = async () => {
        const order = driverModal.order;
        if (!order || !selectedDriverId) {
            return toast.error("Please select an available delivery driver.");
        }

        setSubmitting(true);
        const orderIdentifier = order.orderId || order._id;
        const payload = {
            orderId: orderIdentifier,
            driverId: selectedDriverId
        };

        console.group("🚀 [POST ASSIGN RETURN DRIVER TRIGGERED]");
        console.log("Endpoint: /provider/pharmacy/orders/return/assign-driver");
        console.log("Payload:", payload);
        console.groupEnd();

        try {
            const res = await PharmacyVendorAPI.assignReturnDriver(orderIdentifier, selectedDriverId);
            
            console.group("✅ [DRIVER ASSIGNED SUCCESSFULLY]");
            console.log("Response:", res);
            console.log("Return OTP:", res?.data?.returnOTP);
            console.groupEnd();

            if (res?.success || res?.status === 200) {
                const otp = res.data?.returnOTP ? ` (Return OTP: ${res.data.returnOTP})` : '';
                toast.success((res.message || "Driver assigned for return pickup successfully!") + otp);
                setDriverModal({ isOpen: false, order: null });
                setSelectedDriverId(null);
                if (refresh) refresh();
            } else {
                toast.error(res?.message || "Failed to assign driver.");
            }
        } catch (error) {
            console.group("❌ [ASSIGN DRIVER FAILED]");
            console.error("Status:", error.response?.status);
            console.error("Backend Error Message:", error.response?.data?.message);
            console.error("Full Error:", error);
            console.groupEnd();

            toast.error(error.response?.data?.message || "Failed to assign driver for pickup.");
        } finally {
            setSubmitting(false);
        }
    };

    // =========================================================================
    // STEP 3: REJECT RETURN REQUEST
    // =========================================================================
    const handleRejectSubmit = async (e) => {
        e.preventDefault();
        const { order } = rejectModal;
        if (!order || !rejectionReason.trim()) {
            return toast.error("Please enter a valid rejection reason.");
        }

        setSubmitting(true);
        const orderIdentifier = order.orderId || order._id;

        try {
            const res = await PharmacyVendorAPI.rejectReturnRequest(orderIdentifier, rejectionReason.trim());
            if (res?.success) {
                toast.success(res.message || "Return request rejected.");
                setRejectModal({ isOpen: false, order: null });
                setRejectionReason('');
                if (refresh) refresh();
            } else {
                toast.error(res?.message || "Failed to reject return request.");
            }
        } catch (error) {
            console.error("Reject Error:", error);
            toast.error(error.response?.data?.message || "Failed to reject return request.");
        } finally {
            setSubmitting(false);
        }
    };

    // =========================================================================
    // STEP 4: CONFIRM STORE RECEIPT & RESTOCK
    // =========================================================================
    const handleStoreReceiptSubmit = async (e) => {
        e.preventDefault();
        const { order } = storeReceiptModal;
        if (!order) return;

        if (storeDecision === 'Reject_Damaged' && !storeNote.trim()) {
            return toast.error("Please specify the damage reason.");
        }

        setSubmitting(true);
        const orderIdentifier = order.orderId || order._id;

        try {
            const res = await PharmacyVendorAPI.confirmStoreReceipt(orderIdentifier, storeDecision, storeNote.trim());
            if (res?.success) {
                toast.success(res.message || "Store receipt verified and stock updated!");
                setStoreReceiptModal({ isOpen: false, order: null });
                setStoreNote('');
                setStoreDecision('Approve_And_Restock');
                if (refresh) refresh();
            } else {
                toast.error(res?.message || "Failed to verify store receipt.");
            }
        } catch (error) {
            console.error("Store receipt error:", error);
            toast.error(error.response?.data?.message || "Failed to verify counter receipt.");
        } finally {
            setSubmitting(false);
        }
    };

    const getBadgeStyle = (status) => {
        switch (status) {
            case 'Requested': return 'bg-amber-50 text-amber-800 border-amber-200';
            case 'Approved': return 'bg-sky-50 text-sky-800 border-sky-200';
            case 'CollectedByDriver': return 'bg-purple-50 text-purple-800 border-purple-200';
            case 'Completed':
            case 'ReceivedAtStore': return 'bg-[#08B36A]/10 text-[#08B36A] border-[#08B36A]/20';
            case 'Rejected': return 'bg-rose-50 text-rose-800 border-rose-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* SUB-FILTER TABS */}
            <div className="flex flex-wrap gap-2 p-1.5 bg-slate-50 rounded-2xl border border-slate-100 w-fit">
                {[
                    { key: 'Requested', label: '1. Pending Review' },
                    { key: 'Approved', label: '2. Pickup In-Progress' },
                    { key: 'Completed', label: '3. Store Verified & Closed' },
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
                        const isPendingDriver = (ret.status === 'Requested' || ret.status === 'Approved') && (!ret.assignedDriver && ret.pickupStatus !== 'Assigned');
                        const isPendingStoreReceipt = ['Approved', 'CollectedByDriver'].includes(ret.status) && (ret.pickupStatus === 'Assigned' || ret.pickupStatus === 'CollectedByDriver');

                        return (
                            <div 
                                key={order._id} 
                                className="bg-slate-50/50 border border-slate-100 hover:border-[#08B36A]/40 rounded-3xl p-6 transition-all space-y-4 shadow-sm"
                            >
                                {/* Header */}
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
                                            <FaUndoAlt size={16} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h4 className="font-black text-slate-900 text-sm tracking-wider">#{order.orderId}</h4>
                                                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase border ${getBadgeStyle(ret.status)}`}>
                                                    {ret.requestType || 'Return'}: {ret.status || 'Requested'}
                                                </span>
                                                {ret.pickupStatus && (
                                                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase border bg-slate-100 text-slate-700 border-slate-200">
                                                        Pickup: {ret.pickupStatus}
                                                    </span>
                                                )}
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

                                {/* Footer Controls */}
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2 border-t border-slate-100">
                                    <div className="flex items-center gap-4 text-xs font-bold text-slate-600 flex-wrap">
                                        <span className="flex items-center gap-1.5"><FaUser className="text-slate-400" /> {order.userId?.name || "Customer"}</span>
                                        <span className="flex items-center gap-1.5"><FaPhone className="text-slate-400" /> {order.userId?.phone || "N/A"}</span>
                                        {ret.assignedDriver && (
                                            <span className="flex items-center gap-1.5 text-[#08B36A] font-extrabold bg-[#08B36A]/10 px-2.5 py-1 rounded-xl">
                                                <FaMotorcycle /> Driver: {ret.assignedDriver.name} ({ret.assignedDriver.vehicleNumber || 'Assigned'})
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                                        {/* Reject Button (Only for Pending review) */}
                                        {ret.status === 'Requested' && (
                                            <button
                                                onClick={() => setRejectModal({ isOpen: true, order })}
                                                className="flex-1 sm:flex-none px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                                            >
                                                Reject Claim
                                            </button>
                                        )}

                                        {/* DIRECT ASSIGN DRIVER BUTTON */}
                                        {isPendingDriver && (
                                            <button
                                                onClick={() => handleOpenDriverModal(order)}
                                                className="flex-1 sm:flex-none px-5 py-2.5 bg-[#08B36A] hover:bg-[#069959] text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-md shadow-[#08B36A]/20 flex items-center justify-center gap-1.5"
                                            >
                                                <FaMotorcycle size={12} /> Assign Delivery Boy
                                            </button>
                                        )}

                                        {/* Store Receipt Verification */}
                                        {isPendingStoreReceipt && (
                                            <button
                                                onClick={() => setStoreReceiptModal({ isOpen: true, order })}
                                                className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2"
                                            >
                                                <FaWarehouse size={12} /> Confirm Counter Receipt
                                            </button>
                                        )}
                                    </div>

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

            {/* MODAL: CHOOSE & ASSIGN DRIVER DIRECTLY */}
            {driverModal.isOpen && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-lg rounded-[32px] p-6 sm:p-7 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                            <div>
                                <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
                                    <FaMotorcycle className="text-[#08B36A]" size={16} /> Assign Driver for Return Pickup
                                </h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">
                                    Order #{driverModal.order?.orderId}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => handleOpenDriverModal(driverModal.order)} 
                                    disabled={fetchingDrivers}
                                    title="Refresh Available Drivers"
                                    className="p-2 text-slate-400 hover:text-[#08B36A] hover:bg-[#08B36A]/10 rounded-xl transition-all"
                                >
                                    <FaSyncAlt size={13} className={fetchingDrivers ? 'animate-spin text-[#08B36A]' : ''} />
                                </button>
                                <button 
                                    onClick={() => setDriverModal({ isOpen: false, order: null })} 
                                    className="text-slate-400 hover:text-slate-600 p-2"
                                >
                                    <FaTimes size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Drivers List */}
                        <div className="space-y-3">
                            <p className="text-xs text-slate-500 font-semibold">
                                Select an active online driver to dispatch for return pickup:
                            </p>

                            {fetchingDrivers ? (
                                <div className="py-12 text-center space-y-2">
                                    <FaSpinner className="animate-spin text-[#08B36A] mx-auto text-2xl" />
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Loading Available Drivers...</p>
                                </div>
                            ) : availableDrivers.length === 0 ? (
                                <div className="py-10 px-4 text-center bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                                    <FaMotorcycle className="mx-auto text-slate-300 text-3xl mb-1" />
                                    <h4 className="text-xs font-black text-slate-700 uppercase">No Available Drivers</h4>
                                    <p className="text-[11px] text-slate-400 font-medium">
                                        No delivery drivers are currently online or free. Please wait or ask your drivers to mark themselves Available.
                                    </p>
                                    <button 
                                        onClick={() => handleOpenDriverModal(driverModal.order)}
                                        className="mt-2 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl uppercase transition-all"
                                    >
                                        Check Again
                                    </button>
                                </div>
                            ) : (
                                <div className="max-h-[300px] overflow-y-auto space-y-2.5 pr-1">
                                    {availableDrivers.map((driver) => {
                                        const isSelected = selectedDriverId === driver._id;
                                        return (
                                            <div
                                                key={driver._id}
                                                onClick={() => setSelectedDriverId(driver._id)}
                                                className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                                                    isSelected
                                                        ? 'bg-[#08B36A]/10 border-[#08B36A] ring-1 ring-[#08B36A]'
                                                        : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100/70'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${
                                                        isSelected ? 'bg-[#08B36A] text-white' : 'bg-slate-200 text-slate-600'
                                                    }`}>
                                                        {driver.name?.charAt(0) || 'D'}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h5 className="font-black text-xs text-slate-800">{driver.name}</h5>
                                                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-[#08B36A] text-[9px] font-black uppercase">
                                                                {driver.status || 'Available'}
                                                            </span>
                                                        </div>
                                                        <p className="text-[11px] text-slate-500 font-medium">{driver.phone}</p>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                                                            {driver.vehicleType || 'Bike'} • <span className="font-mono text-slate-600">{driver.vehicleNumber || '—'}</span>
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                                                    isSelected ? 'bg-[#08B36A] border-[#08B36A] text-white' : 'border-slate-300'
                                                }`}>
                                                    {isSelected && <FaCheck size={9} />}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Footer Controls */}
                        <div className="pt-2 border-t border-gray-100 flex gap-3">
                            <button
                                type="button"
                                onClick={() => setDriverModal({ isOpen: false, order: null })}
                                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold uppercase"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={submitting || availableDrivers.length === 0 || !selectedDriverId}
                                onClick={handleAssignDriverSubmit}
                                className="flex-1 py-3 bg-[#08B36A] hover:bg-[#069959] text-white rounded-xl text-xs font-bold uppercase shadow-lg shadow-[#08B36A]/20 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {submitting ? <FaSpinner className="animate-spin" size={12} /> : "Confirm & Assign Driver"}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* MODAL: DIRECT REJECTION */}
            {rejectModal.isOpen && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md rounded-[32px] p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center">
                            <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider">
                                Reject Return Request
                            </h3>
                            <button onClick={() => setRejectModal({ isOpen: false, order: null })} className="text-slate-400 hover:text-slate-600">
                                <FaTimes size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleRejectSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                                    Rejection Reason *
                                </label>
                                <textarea
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    rows={3}
                                    required
                                    placeholder="Explain why this request is rejected..."
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs font-semibold outline-none focus:ring-2 focus:ring-rose-500 resize-none"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setRejectModal({ isOpen: false, order: null })}
                                    className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl text-xs font-black uppercase"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black uppercase shadow-lg shadow-rose-200 flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {submitting ? <FaSpinner className="animate-spin" size={12} /> : "Reject Return"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}

            {/* MODAL: COUNTER RECEIPT & RESTOCK VERIFICATION */}
            {storeReceiptModal.isOpen && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-lg rounded-[32px] p-6 md:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider">
                                    Counter Receipt Verification
                                </h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">
                                    Order #{storeReceiptModal.order?.orderId}
                                </p>
                            </div>
                            <button onClick={() => setStoreReceiptModal({ isOpen: false, order: null })} className="text-slate-400 hover:text-slate-600">
                                <FaTimes size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleStoreReceiptSubmit} className="space-y-4">
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
                                                        ? 'bg-[#08B36A]/10 border-[#08B36A] ring-1 ring-[#08B36A] text-[#08B36A]'
                                                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                                                }`}
                                            >
                                                <Icon size={14} className={isSelected ? 'text-[#08B36A]' : 'text-slate-400'} />
                                                <span className="text-[10px] font-black uppercase tracking-wider leading-tight">{item.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">
                                    {storeDecision === 'Reject_Damaged' ? 'Damage Reason *' : 'Pharmacist Counter Remarks'}
                                </label>
                                <textarea
                                    value={storeNote}
                                    onChange={(e) => setStoreNote(e.target.value)}
                                    rows={3}
                                    required={storeDecision === 'Reject_Damaged'}
                                    placeholder={
                                        storeDecision === 'Reject_Damaged'
                                            ? 'Explain the damage condition upon physical inspection...'
                                            : 'E.g., Medicine verified in sealed condition, restocked into inventory.'
                                    }
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs font-semibold outline-none focus:ring-2 focus:ring-[#08B36A] resize-none"
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
                                    className="flex-1 py-3.5 bg-[#08B36A] hover:bg-[#069959] text-white rounded-xl text-xs font-black uppercase shadow-lg shadow-[#08B36A]/20 flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {submitting ? <FaSpinner className="animate-spin" size={12} /> : "Complete Inspection"}
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