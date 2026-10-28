'use client';

import React, { useState, useEffect } from 'react';
import { 
    FaMapMarkerAlt, FaCalendarAlt, FaPhoneAlt, FaImage, FaEye, FaUserAlt, 
    FaTimesCircle, FaExclamationTriangle, FaIdCard, FaSpinner,
    FaStethoscope, FaBoxOpen, FaInfoCircle, FaTrashAlt, FaChevronLeft, FaChevronRight,
    FaSyncAlt, FaFileMedical, FaSearch, FaUserNurse, FaTimes, FaAward,
    FaUserCircle, FaClock, FaTag
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import NurseAPI from '@/app/services/NurseAPI';

// =========================================================
// GLOBAL HELPERS: ROBUST IMAGE RESOLVING & SELF-HEALING
// =========================================================

const getPrescriptionImageUrl = (imagePath, baseUrl) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }
    
    let cleanPath = imagePath.replace(/\\/g, '/');
    if (cleanPath.startsWith('/')) {
        cleanPath = cleanPath.substring(1);
    }
    
    let base = baseUrl || '';
    if (base.endsWith('/')) {
        base = base.slice(0, -1);
    }
    
    return `${base}/${cleanPath}`;
};

const handleImageError = (e) => {
    const currentSrc = e.target.src;
    if (currentSrc.includes('/public/')) {
        e.target.src = currentSrc.replace('/public/', '/');
    }
};

const formatOrderDateTime = (dateStr, timeStr) => {
    if (!dateStr) return 'N/A';
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return 'N/A';
        const formattedDate = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        
        let formattedTime = timeStr || '';
        if (!formattedTime && (date.getHours() !== 0 || date.getMinutes() !== 0)) {
            formattedTime = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        }
        
        return formattedTime ? `${formattedDate} at ${formattedTime}` : formattedDate;
    } catch (e) {
        return 'N/A';
    }
};

// --- SUB-COMPONENT: UNIFIED ORDER DETAIL MODAL ---
const UnifiedOrderDetailModal = ({ 
    isOpen, 
    order, 
    activeTab, 
    prescriptionSubTab,
    imageBaseUrl, 
    formatDate, 
    onClose,
    onRefresh,
    onAssignClick
}) => {
    const [servicePrices, setServicePrices] = useState({});
    const [consumableSearch, setConsumableSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [addedConsumables, setAddedConsumables] = useState([]);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeclining, setIsDeclining] = useState(false);

    useEffect(() => {
        if (isOpen && order) {
            setServicePrices({});
            setAddedConsumables([]);
            
        }
    }, [isOpen, order]);

    if (!isOpen || !order) return null;

    const isIncomingPrescription = activeTab === 'Prescription Nursing' && prescriptionSubTab === 'Incoming';
    const isHistory = activeTab === 'Approved' || activeTab === 'Rejected';
    const isRejected = activeTab === 'Rejected';

    // Priority Check
    const isPriorityOrder = order.isPriority === true || 
                            (order.priceBreakdown?.fasterServiceCharge > 0) || 
                            order.isFasterService === true ||
                            activeTab === 'Priority Requests';

    // Dynamic address handling with destinationLabel priority
    const addressDetails = order.location?.address || order.address;
    const formattedAddress = order.destinationLabel || (addressDetails 
        ? `${addressDetails.houseNo || ''}${addressDetails.landmark ? `, Near ${addressDetails.landmark}` : ''}, ${addressDetails.city || ''}, ${addressDetails.state || ''} - ${addressDetails.pincode || ''}`
        : 'Address information unavailable');

    // Live search of consumables via API
    const handleConsumableSearch = async (e) => {
        const val = e.target.value;
        setConsumableSearch(val);
        if (val.trim().length > 1) {
            try {
                const res = await NurseAPI.searchConsumables(val);
                if (res?.success) {
                    setSearchResults(res.data || []);
                }
            } catch (err) {
                console.error("Error searching consumables:", err);
            }
        } else {
            setSearchResults([]);
        }
    };

    const addConsumable = (item) => {
        const exists = addedConsumables.some(c => c.name === item.name);
        if (exists) {
            toast.error("Consumable already added");
            return;
        }
        setAddedConsumables([...addedConsumables, { name: item.name, price: Number(item.price) || 0 }]);
        setConsumableSearch('');
        setSearchResults([]);
    };

    const removeConsumable = (index) => {
        setAddedConsumables(addedConsumables.filter((_, i) => i !== index));
    };

    const handleServicePriceChange = (title, val) => {
        setServicePrices({
            ...servicePrices,
            [title]: val === '' ? '' : Number(val)
        });
    };

    const baseServicePriceTotal = Object.values(servicePrices).reduce((acc, curr) => acc + (Number(curr) || 0), 0);
    const consumablesTotal = addedConsumables.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);
    const estimatedTotal = baseServicePriceTotal + consumablesTotal  || 0;

    const activeTravelFee = order.travelFee ?? order.deliveryCharge ?? order.priceBreakdown?.travelFee ?? order.priceBreakdown?.deliveryCharge ?? 0;

    // --- PROPOSAL SUBMISSION HANDLER ---
    const handleProposalSubmit = async () => {
        const targetServices = order.services || order.detectedServices || [];
        
        const missingPricing = targetServices.some(s => !servicePrices[s.title] || Number(servicePrices[s.title]) <= 0);
        if (missingPricing && targetServices.length > 0) {
            toast.error("Please specify a valid price for all prescribed services");
            return;
        }

        try {
            setIsSubmitting(true);

            const payload = {
                requestId: order.requestId || order._id,
                servicesPricing: targetServices.map(s => ({
                    title: s.title,
                    price: Number(servicePrices[s.title]) || 0
                })),
                consumablesUsed: addedConsumables.map(c => ({
                    name: c.name,
                    price: Number(c.price) || 0
                })),
               
            };

            const res = await NurseAPI.submitPrescriptionProposal(payload);
            if (res && res.success) {
                toast.success(res.message || "Proposal bill submitted successfully to patient.");
                onRefresh();
                onClose();
            } else {
                toast.error(res?.message || "Failed to submit proposal");
            }
        } catch (error) {
            console.error("Proposal submission error:", error);
            toast.error(error?.response?.data?.message || "Internal service error during proposal submission");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeclineRequest = async () => {
        try {
            setIsDeclining(true);
            const payload = { requestId: order.requestId || order._id };
            const res = await NurseAPI.declinePrescriptionRequest(payload);
            if (res && res.success) {
                toast.success(res.message || "Request declined successfully");
                onRefresh();
                onClose();
            } else {
                toast.error(res?.message || "Failed to decline request");
            }
        } catch (error) {
            console.error("Decline error:", error);
            toast.error(error?.response?.data?.message || "Internal service error during action processing");
        } finally {
            setIsDeclining(false);
        }
    };

    return (
       <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto">
    <div className="bg-white w-full max-w-3xl my-8 rounded-[32px] overflow-hidden shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-300">
        
        {/* Modal Header */}
        <div className={`${isRejected ? 'bg-gradient-to-r from-red-600 to-rose-600' : 'bg-gradient-to-r from-[#08B36A] to-[#069959]'} p-6 sm:p-7 text-white flex justify-between items-center shadow-md relative overflow-hidden`}>
            {/* Ambient Background Glow Effect */}
            <div className="absolute -right-10 -top-10 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center gap-4 relative z-10">
                <div className="w-13 h-13 bg-white/20 rounded-2xl flex items-center justify-center border border-white/30 backdrop-blur-sm shadow-inner shrink-0 p-3">
                    <FaIdCard size={24} className="text-white drop-shadow-sm" />
                </div>
                <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                            {isIncomingPrescription ? 'Create Pricing Proposal' : (order.serviceDetails?.title || 'Prescription Details')}
                        </h2>
                        {isPriorityOrder && (
                            <span className="px-2.5 py-0.5 bg-amber-400 text-amber-950 font-black text-[10px] rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
                                <FaTag size={8} /> Priority Booking
                            </span>
                        )}
                    </div>
                    <p className="text-xs font-semibold text-white/80 mt-1 uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-white/80"></span>
                        Booking ID: <span className="text-white font-bold">{order.bookingId || order._id?.slice(-8)}</span>
                    </p>
                </div>
            </div>
            <button 
                onClick={onClose} 
                className="relative z-10 text-white/80 hover:text-white hover:bg-white/15 p-2 rounded-xl transition-all duration-200"
                aria-label="Close Modal"
            >
                <FaTimesCircle size={24} />
            </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 sm:p-8 max-h-[70vh] overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300">

            {/* PRIORITY TAG BANNER */}
            {isPriorityOrder && (
                <div className="bg-amber-50/80 border border-amber-200/80 p-3.5 rounded-2xl flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-2.5 text-amber-900 font-bold text-xs uppercase tracking-wider">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                        </span>
                        <FaTag className="text-amber-600" size={12} />
                        Priority Booking Request
                    </div>
                    <span className="px-3 py-1 bg-amber-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-xs">
                        Express
                    </span>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Profile Details Card */}
                <div className="bg-slate-50/60 p-5 rounded-2xl border border-gray-100 space-y-3.5">
                    <div className="flex items-center gap-2 border-b border-gray-200/80 pb-2.5">
                        <div className={`p-1.5 rounded-lg ${isRejected ? 'bg-red-50 text-red-500' : 'bg-[#08B36A]/10 text-[#08B36A]'}`}>
                            <FaUserAlt size={13} />
                        </div>
                        <h3 className="font-bold text-gray-800 uppercase text-xs tracking-wider">Patient Profile</h3>
                    </div>
                    
                    <div className="space-y-2.5 text-xs">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500 font-medium">Name</span> 
                            <span className="font-bold text-gray-800">
                                {order.userId?.name || order.patients?.[0]?.name || order.address?.name || 'N/A'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500 font-medium">Gender / Age</span> 
                            <span className="font-bold text-gray-800">
                                {order.userId?.gender || 'N/A'}{order.userId?.age ? ` / ${order.userId.age} yrs` : ''}
                            </span>
                        </div>

                        {/* Payment Details */}
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500 font-medium">Payment Status</span>
                            <span className="text-[11px] font-bold text-[#08B36A] bg-[#08B36A]/10 px-2.5 py-0.5 rounded-full border border-[#08B36A]/20">
                                {order.paymentDisplayLabel || (order.isPaid ? 'Paid Online' : order.isCod ? 'Cash on Delivery' : 'Payment Pending')}
                            </span>
                        </div>
                        
                        {/* Order Date & Time */}
                        <div className="flex justify-between items-center pt-2 border-t border-gray-200/60">
                            <span className="text-gray-500 font-medium flex items-center gap-1.5">
                                <FaClock className="text-gray-400" size={11} /> Order Placed
                            </span> 
                            <span className="font-semibold text-gray-800">
                                {formatOrderDateTime(
                                    order.createdAt || order.bookingDate || order.schedule?.startDate, 
                                    order.appointmentTime || order.timeSlot || order.schedule?.startTime
                                )}
                            </span>
                        </div>

                        {/* Scheduled Service Slot */}
                        {(order.schedule?.startDate || order.appointmentDate) && (
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 font-medium flex items-center gap-1.5">
                                    <FaCalendarAlt className="text-[#08B36A]" size={11} /> Scheduled Slot
                                </span> 
                                <span className="font-bold text-[#08B36A]">
                                    {formatOrderDateTime(
                                        order.schedule?.startDate || order.appointmentDate, 
                                        order.schedule?.startTime || order.appointmentTime || order.timeSlot
                                    )}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Prescription Extracted Details Card */}
                <div className="bg-slate-50/60 p-5 rounded-2xl border border-gray-100 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 border-b border-gray-200/80 pb-2.5">
                            <div className="p-1.5 rounded-lg bg-[#08B36A]/10 text-[#08B36A]">
                                <FaFileMedical size={13} />
                            </div>
                            <h3 className="font-bold text-gray-800 uppercase text-xs tracking-wider">Doctor Notes / Extracted Text</h3>
                        </div>
                        <div className="mt-3.5">
                            <p className="text-xs bg-white border border-gray-200/80 p-3.5 rounded-xl text-gray-600 leading-relaxed italic shadow-2xs min-h-[70px]">
                                {order.extractedText ? `"${order.extractedText}"` : "No instruction text extracted from prescription attachment."}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Interactive Pricing Proposal Section */}
                {isIncomingPrescription && (
                    <div className="md:col-span-2 space-y-5 bg-[#08B36A]/5 p-6 rounded-3xl border border-[#08B36A]/20">
                        <div className="flex items-center gap-2 border-b border-[#08B36A]/15 pb-3">
                            <div className="p-1.5 rounded-lg bg-[#08B36A] text-white">
                                <FaFileMedical size={13} />
                            </div>
                            <h3 className="font-black text-[#08B36A] uppercase text-xs tracking-wider">Configure Pricing & Proposal</h3>
                        </div>

                        {/* Service Rates Configuration */}
                        <div className="space-y-3">
                            <label className="block text-xs font-black text-gray-700 uppercase tracking-wider">Base Service Pricing</label>
                            <div className="grid grid-cols-1 gap-2.5">
                                {(order.services || order.detectedServices || []).map((srv, idx) => (
                                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-gray-200/80 shadow-2xs hover:border-[#08B36A]/40 transition-colors">
                                        <div>
                                            <h4 className="font-bold text-xs text-gray-800">{srv.title}</h4>
                                            {srv.description && <p className="text-[11px] text-gray-400 mt-0.5">{srv.description}</p>}
                                            {srv.notes && <p className="text-[10px] text-[#08B36A] font-medium italic mt-1">Note: {srv.notes}</p>}
                                        </div>
                                        <div className="flex items-center gap-1.5 self-end sm:self-center bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200 focus-within:border-[#08B36A] focus-within:ring-2 focus-within:ring-[#08B36A]/20 transition-all">
                                            <span className="text-xs font-black text-gray-500">₹</span>
                                            <input 
                                                type="number"
                                                placeholder="0"
                                                className="w-20 bg-transparent text-xs font-black text-gray-800 text-right focus:outline-none"
                                                value={servicePrices[srv.title] ?? ''}
                                                onChange={(e) => handleServicePriceChange(srv.title, e.target.value)}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Consumables Selector */}
                        <div className="space-y-3 pt-2">
                            <label className="block text-xs font-black text-gray-700 uppercase tracking-wider">Consumables Used</label>
                            
                            <div className="relative">
                                <div className="flex items-center bg-white border border-gray-200 rounded-xl px-3.5 py-2 focus-within:border-[#08B36A] focus-within:ring-2 focus-within:ring-[#08B36A]/20 transition-all">
                                    <FaSearch className="text-gray-400 mr-2.5 text-xs" />
                                    <input 
                                        type="text" 
                                        placeholder="Search consumables (e.g., Gloves, Sterile Gauze, Syringe)..."
                                        className="w-full text-xs font-medium bg-transparent focus:outline-none placeholder-gray-400"
                                        value={consumableSearch}
                                        onChange={handleConsumableSearch}
                                    />
                                </div>

                                {searchResults.length > 0 && (
                                    <div className="absolute left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl max-h-48 overflow-y-auto z-20 divide-y divide-gray-100">
                                        {searchResults.map((item, idx) => (
                                            <button 
                                                key={idx}
                                                type="button"
                                                onClick={() => addConsumable(item)}
                                                className="w-full text-left px-4 py-2.5 text-xs font-semibold hover:bg-[#08B36A]/10 text-gray-700 transition-colors flex justify-between items-center"
                                            >
                                                <span>{item.name}</span>
                                                <span className="text-[#08B36A] font-bold">₹{item.price}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {addedConsumables.length > 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                                    {addedConsumables.map((c, idx) => (
                                        <div key={idx} className="flex justify-between items-center p-2.5 px-3 bg-white border border-[#08B36A]/20 rounded-xl text-xs font-semibold shadow-2xs">
                                            <div className="truncate mr-2">
                                                <span className="text-gray-700">{c.name}</span>
                                                <span className="text-[#08B36A] font-bold ml-2">₹{c.price}</span>
                                            </div>
                                            <button 
                                                onClick={() => removeConsumable(idx)} 
                                                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                                title="Remove consumable"
                                            >
                                                <FaTrashAlt size={11} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Price Summary Breakdown (Tax Completely Removed) */}
                        <div className="bg-white rounded-2xl border border-[#08B36A]/25 p-4 sm:p-5 text-xs space-y-2.5 shadow-xs">
                            <div className="flex justify-between items-center text-gray-600 font-medium">
                                <span>Total Base Services</span>
                                <span className="font-bold text-gray-800">₹{baseServicePriceTotal || 0}</span>
                            </div>
                            <div className="flex justify-between items-center text-gray-600 font-medium">
                                <span>Consumables Total</span>
                                <span className="font-bold text-gray-800">₹{consumablesTotal || 0}</span>
                            </div>
                            <div className="flex justify-between items-center text-gray-900 font-extrabold text-sm border-t border-gray-100 pt-3">
                                <span className="text-[#08B36A]">Total Estimated Proposal:</span>
                                <span className="text-lg font-black text-[#08B36A]">
                                    ₹{estimatedTotal || (Number(baseServicePriceTotal || 0) + Number(consumablesTotal || 0))}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Location Details */}
                <div className="md:col-span-2 space-y-2.5">
                    <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                        <div className="p-1.5 rounded-lg bg-[#08B36A]/10 text-[#08B36A]">
                            <FaMapMarkerAlt size={13} />
                        </div>
                        <h3 className="font-bold text-gray-800 uppercase text-xs tracking-wider">Service Location</h3>
                    </div>
                    <div className="bg-slate-50/70 p-4 rounded-2xl border border-gray-100 text-xs sm:text-sm text-gray-700 leading-relaxed font-medium">
                        {formattedAddress || 'No address provided'}
                    </div>
                </div>

                {/* Standard Mode - Prescribed Services */}
                {!isIncomingPrescription && (order.servicesPricing?.length > 0 || order.services?.length > 0) && (
                    <div className="md:col-span-2 space-y-2.5">
                        <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                            <div className="p-1.5 rounded-lg bg-[#08B36A]/10 text-[#08B36A]">
                                <FaFileMedical size={13} />
                            </div>
                            <h3 className="font-bold text-gray-800 uppercase text-xs tracking-wider">Mapped Services & Pricing</h3>
                        </div>
                        <div className="space-y-2">
                            {(order.servicesPricing || order.services).map((srv, i) => (
                                <div key={i} className="flex justify-between items-center p-3.5 bg-slate-50/70 border border-gray-100 rounded-xl text-xs font-bold text-gray-700">
                                    <span>{srv.title}</span>
                                    {srv.price && <span className="text-[#08B36A] font-extrabold">₹{srv.price}</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Standard Mode - Consumables */}
                {!isIncomingPrescription && order.consumablesUsed?.length > 0 && (
                    <div className="md:col-span-2 space-y-2.5">
                        <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                            <div className="p-1.5 rounded-lg bg-[#08B36A]/10 text-[#08B36A]">
                                <FaBoxOpen size={13} />
                            </div>
                            <h3 className="font-bold text-gray-800 uppercase text-xs tracking-wider">Consumables Used</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {order.consumablesUsed.map((c, i) => (
                                <div key={i} className="flex justify-between items-center p-3 bg-slate-50/70 rounded-xl text-xs border border-gray-100 font-bold">
                                    <span className="text-gray-700">{c.name}</span>
                                    <span className="text-[#08B36A] font-extrabold">₹{c.price}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Standard Mode - Price Breakdown (Tax Removed) */}
                {!isIncomingPrescription && (
                    <div className="md:col-span-2">
                        <div className="bg-slate-50/80 p-4.5 rounded-2xl border border-gray-100 space-y-2 text-xs font-bold text-gray-600">
                            {activeTravelFee > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500 font-medium">Travel / Delivery Fee:</span>
                                    <span className="text-gray-900">+ ₹{activeTravelFee}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm border-t border-gray-200/60 pt-2.5 items-center">
                                <span className="text-gray-700 font-bold">Total Charged Price:</span>
                                <span className="text-[#08B36A] text-xl font-black">
                                    ₹{order.totalAmount || order.priceBreakdown?.totalPrice || order.totalPrice || 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Prescription Media Attachment */}
                {order.prescriptionImage && (
                    <div className="md:col-span-2 space-y-2.5">
                        <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                            <div className="p-1.5 rounded-lg bg-[#08B36A]/10 text-[#08B36A]">
                                <FaImage size={13} />
                            </div>
                            <h3 className="font-bold text-gray-800 uppercase text-xs tracking-wider">Prescription Attachment</h3>
                        </div>
                        <div className="rounded-2xl border-2 border-dashed border-gray-200 p-3 overflow-hidden bg-slate-50/50">
                            <img 
                                src={getPrescriptionImageUrl(order.prescriptionImage, imageBaseUrl)} 
                                alt="Prescription" 
                                onError={handleImageError}
                                className="w-full h-auto rounded-xl object-contain max-h-80 mx-auto shadow-2xs" 
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* Footer Action Buttons */}
        <div className="p-5 sm:p-6 bg-slate-50/80 flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-gray-100">
            {isIncomingPrescription ? (
                <>
                    <button 
                        onClick={handleDeclineRequest}
                        disabled={isDeclining || isSubmitting}
                        className="px-6 py-3 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 border border-rose-200/60 disabled:opacity-50"
                    >
                        {isDeclining ? <FaSpinner className="animate-spin" /> : 'Decline Request'}
                    </button>
                    <button 
                        onClick={handleProposalSubmit}
                        disabled={isDeclining || isSubmitting}
                        className="px-8 py-3 rounded-xl bg-[#08B36A] text-white hover:bg-[#079f5e] font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#08B36A]/20 disabled:opacity-50"
                    >
                        {isSubmitting ? <FaSpinner className="animate-spin" /> : 'Submit Proposal'}
                    </button>
                </>
            ) : (
                <>
                    {activeTab === 'Approved' && (
                        <button 
                            onClick={() => { onClose(); onAssignClick(order); }}
                            className="px-6 py-3 rounded-xl bg-[#08B36A] text-white font-bold hover:bg-[#079f5e] transition-all uppercase text-xs tracking-wider flex items-center justify-center gap-2 shadow-md shadow-[#08B36A]/20"
                        >
                            <FaUserNurse /> Assign Staff
                        </button>
                    )}
                    {activeTab === 'Prescription Nursing' && prescriptionSubTab === 'Confirmed' && (
                        <button 
                            onClick={() => { onClose(); onAssignClick(order); }}
                            className="px-6 py-3 rounded-xl bg-[#08B36A] text-white font-bold hover:bg-[#079f5e] transition-all uppercase text-xs tracking-wider flex items-center justify-center gap-2 shadow-md shadow-[#08B36A]/20"
                        >
                            <FaUserNurse /> Assign Staff
                        </button>
                    )}
                    <button 
                        onClick={onClose} 
                        className="px-7 py-3 rounded-xl bg-gray-200 text-gray-700 font-bold hover:bg-gray-300 transition-colors uppercase text-xs tracking-wider"
                    >
                        Close
                    </button>
                </>
            )}
        </div>
    </div>
</div>
    );
};

// --- SUB-COMPONENT: ORDER HISTORY ROW ---
const OrderHistoryRow = ({ order, activeTab, onRowClick, onAssignClick, formatDate }) => {
    const assignedStaff = order.assignedStaffId || order.assignedStaff;

    return (
        <tr 
            onClick={() => onRowClick(order)} 
            className="hover:bg-gray-50/80 transition-all cursor-pointer group"
        >
            <td className="px-8 py-6">
                <div className="font-black text-gray-900 text-base group-hover:text-[#08B36A] transition-colors">
                    {order.patients?.[0]?.name || order.address?.name || 'N/A'}
                </div>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${activeTab === 'Approved' ? 'bg-green-50 text-[#08B36A]' : 'bg-red-50 text-red-400'}`}>
                        ID: {order.bookingId || order._id?.slice(-8)}
                    </span>
                    <span className="text-[11px] text-gray-400 font-bold uppercase">
                        {formatDate(order.createdAt || order.schedule?.startDate)}
                    </span>
                    {(order.isPriority || order.priceBreakdown?.fasterServiceCharge > 0 || order.isFasterService) && (
                        <span className="text-[9px] font-black bg-amber-100 text-amber-800 px-2 py-0.5 rounded uppercase tracking-wider">
                            Priority
                        </span>
                    )}
                </div>
                {assignedStaff && (
                    <div className="text-[10px] font-bold text-slate-500 mt-1 flex items-center gap-1">
                        <FaUserNurse size={10} className="text-[#08B36A]" /> Staff: {assignedStaff.name} ({assignedStaff.phone || assignedStaff.status || 'Active'})
                    </div>
                )}
            </td>

            <td className="px-8 py-6">
                <div className="flex items-start gap-2.5 max-w-[280px]">
                    <div className="mt-1 p-1.5 bg-gray-100 rounded-lg text-gray-400 shrink-0">
                        <FaMapMarkerAlt size={12} />
                    </div>
                    <span className="text-sm text-gray-600 font-medium leading-relaxed line-clamp-2">
                        {order.destinationLabel || `${order.address?.houseNo || ''}, ${order.address?.city || ''}`}
                    </span>
                </div>
            </td>

            <td className="px-8 py-6">
                {activeTab === 'Approved' ? (
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 flex items-center justify-center bg-blue-50 text-blue-600 rounded-full shrink-0">
                                <FaPhoneAlt size={9} />
                            </div>
                            <span className="text-xs font-black text-gray-700">{order.address?.phone || 'N/A'}</span>
                        </div>
                        {order.paymentDisplayLabel && (
                            <span className="text-[10px] font-bold text-slate-500">
                                {order.paymentDisplayLabel}
                            </span>
                        )}
                    </div>
                ) : (
                    <div className="flex items-center gap-2 text-sm text-red-500 font-black italic bg-red-50/50 px-4 py-2 rounded-xl border border-red-100 w-fit">
                        <FaExclamationTriangle size={12} /> {order.rejectionReason || 'Staff Unavailable'}
                    </div>
                )}
            </td>

            <td className="px-8 py-6 text-center">
                <div className="flex flex-col items-center gap-1">
                    <span className="text-xs font-black text-gray-900">
                        ₹{order.totalAmount || order.totalPrice || order.priceBreakdown?.totalPrice || 0}
                    </span>
                    <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black tracking-widest border transition-all ${
                        activeTab === 'Approved' 
                            ? 'bg-green-50 text-[#08B36A] border-green-200' 
                            : 'bg-red-50 text-red-500 border-red-200'
                    }`}>
                        <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${activeTab === 'Approved' ? 'bg-[#08B36A]' : 'bg-red-500'}`}></span>
                        {order.status ? order.status.toUpperCase() : activeTab.toUpperCase()}
                    </span>
                </div>
            </td>

            <td className="px-8 py-6 text-right" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-end gap-3">
                    <button 
                        onClick={() => onRowClick(order)}
                        className="w-10 h-10 flex items-center justify-center text-blue-600 bg-white border border-gray-100 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-90"
                    >
                        <FaInfoCircle size={18} />
                    </button>
                    {activeTab === 'Approved' && (
                        <button 
                            onClick={() => onAssignClick(order)}
                            className="bg-[#08B36A] hover:bg-[#069a5a] text-white px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                        >
                            <FaUserNurse size={12} /> ASSIGN
                        </button>
                    )}
                    <button 
                        className="w-10 h-10 flex items-center justify-center text-red-400 bg-white border border-gray-100 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-90"
                    >
                        <FaTrashAlt size={14} />
                    </button>
                </div>
            </td>
        </tr>
    );
};

// --- MAIN PARENT EXPORT: NURSE ORDERS PAGE ---
export default function NurseOrdersPage() {
    const [activeTab, setActiveTab] = useState('Daily Nursing'); 
    const [approvedSubTab, setApprovedSubTab] = useState('General'); 
    const [prescriptionSubTab, setPrescriptionSubTab] = useState('Incoming');
    const [fetching, setFetching] = useState(true);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const [allBookings, setAllBookings] = useState([]);
    const [priorityBookings, setPriorityBookings] = useState([]);
    const [approvedOrders, setApprovedOrders] = useState([]);
    const [rejectedOrders, setRejectedOrders] = useState([]);
    const [availableNurses, setAvailableNurses] = useState([]);
    
    // Prescription Incoming Paginated State
    const [prescriptionRequests, setPrescriptionRequests] = useState([]);
    const [prescriptionPagination, setPrescriptionPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        hasNextPage: false,
        hasPrevPage: false
    });
    const [prescriptionPage, setPrescriptionPage] = useState(1);

    const [prescriptionBookings, setPrescriptionBookings] = useState([]);

    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);

    const tabs = [
        'Daily Nursing', 
        'Package Nursing', 
        'Prescription Nursing', 
        'Priority Requests', 
        'Approved', 
        'Rejected'
    ];

    const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';

    // --- FETCH QUEUES ---
    const loadData = async (rxPage = 1) => {
        try {
            setFetching(true);
            const [
                bookingsRes, 
                priorityRes, 
                approvedRes, 
                rejectedRes,
                prescriptionReqsRes,
                prescriptionBookingsRes,
                staffRes
            ] = await Promise.all([
                NurseAPI.getBookings('Pending'),
                NurseAPI.getBookings('Pending', 'true'), 
                NurseAPI.getBookings('Confirmed'),
                NurseAPI.getBookings('Rejected'),
                NurseAPI.getPrescriptionRequests({ page: rxPage, limit: 10 }),
                NurseAPI.getPrescriptionBookings('Confirmed'),
                NurseAPI.getAvailableStaff()
            ]);

            if (bookingsRes.success) setAllBookings(bookingsRes.data || []);
            if (priorityRes.success) setPriorityBookings(priorityRes.data || []);
            if (approvedRes.success) setApprovedOrders(approvedRes.data || []);
            if (rejectedRes.success) setRejectedOrders(rejectedRes.data || []);
            
            // Handle Paginated Prescription Requests Response
            if (prescriptionReqsRes?.success) {
                setPrescriptionRequests(prescriptionReqsRes.data || []);
                if (prescriptionReqsRes.pagination) {
                    setPrescriptionPagination(prescriptionReqsRes.pagination);
                } else {
                    setPrescriptionPagination({
                        currentPage: rxPage,
                        totalPages: Math.ceil((prescriptionReqsRes.data?.length || 0) / 10) || 1,
                        totalItems: prescriptionReqsRes.count || prescriptionReqsRes.data?.length || 0,
                        hasNextPage: false,
                        hasPrevPage: false
                    });
                }
            }

            if (prescriptionBookingsRes.success) setPrescriptionBookings(prescriptionBookingsRes.data || []);
            
            const staffData = staffRes?.staff || staffRes?.data || staffRes;
            if (Array.isArray(staffData)) {
                setAvailableNurses(staffData);
            }
        } catch (error) {
            console.error("Error loading nurse booking logs:", error);
            toast.error("Failed to load request records");
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        loadData(prescriptionPage);
    }, [prescriptionPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, approvedSubTab, prescriptionSubTab]);

    const getCurrentData = () => {
        if (activeTab === 'Rejected') return rejectedOrders;
        if (activeTab === 'Priority Requests') return priorityBookings;

        if (activeTab === 'Prescription Nursing') {
            return prescriptionSubTab === 'Incoming' ? prescriptionRequests : prescriptionBookings;
        }

        if (activeTab === 'Approved') {
            return approvedOrders.filter(item => {
                const isExpress = item.priceBreakdown?.fasterServiceCharge > 0 || item.isPriority === true || item.isFasterService === true;
                if (approvedSubTab === 'Priority') {
                    return isExpress;
                } else {
                    return !isExpress;
                }
            });
        }

        return allBookings.filter(item => {
            const duration = item.serviceDetails?.duration;
            const hasPrescription = !!item.prescriptionImage;

            if (activeTab === 'Package Nursing') {
                return !hasPrescription && duration === 'For Multiple Days';
            }
            if (activeTab === 'Daily Nursing') {
                return !hasPrescription && (duration === 'One day One Time' || duration === 'Acc. To Per/Hours');
            }
            return false;
        });
    };

    const fullFilteredData = getCurrentData();
    const isHistoryTab = activeTab === 'Approved' || activeTab === 'Rejected';

    const approvedGeneralCount = approvedOrders.filter(item => {
        const isExpress = item.priceBreakdown?.fasterServiceCharge > 0 || item.isPriority === true || item.isFasterService === true;
        return !isExpress;
    }).length;

    const approvedPriorityCount = approvedOrders.filter(item => {
        const isExpress = item.priceBreakdown?.fasterServiceCharge > 0 || item.isPriority === true || item.isFasterService === true;
        return isExpress;
    }).length;

    const isIncomingTab = activeTab === 'Prescription Nursing' && prescriptionSubTab === 'Incoming';
    const totalItems = isIncomingTab ? prescriptionPagination.totalItems : fullFilteredData.length;
    const totalPages = isIncomingTab ? prescriptionPagination.totalPages : Math.ceil(totalItems / itemsPerPage);
    
    const paginatedData = isIncomingTab 
        ? prescriptionRequests 
        : fullFilteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const openDetails = (order) => { setSelectedOrder(order); setIsDetailsModalOpen(true); };
    
    const closeAllModals = () => {
        setIsDetailsModalOpen(false);
        setSelectedOrder(null);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const handleAssignNurse = async (nurseId) => {
        if (!selectedAppointment || !nurseId) return;

        try {
            const payload = {
                bookingId: selectedAppointment._id,
                staffId: nurseId
            };
            
            const response = await NurseAPI.assignStaffToBooking(payload);
            
            if (response && response.success) {
                toast.success(response.message || "Staff Assigned Successfully!");
                setIsAssignModalOpen(false);
                loadData(prescriptionPage); 
            } else {
                toast.error(response?.message || "Failed to assign staff");
            }
        } catch (error) {
            console.error("Assignment failed:", error);
            toast.error(error.response?.data?.message || "Failed to assign staff");
        }
    };

    const startIndex = isIncomingTab 
        ? (prescriptionPagination.currentPage - 1) * 10 
        : (currentPage - 1) * itemsPerPage;

    if (fetching) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <FaSpinner className="animate-spin text-4xl text-[#08B36A] mb-4" />
            <p className="text-gray-500 font-medium font-sans">Loading Requests...</p>
        </div>
    );

    return (
        <div className="p-4 md:p-8 bg-[#F9FAFB] min-h-screen relative font-sans">
            
            {/* Title */}
            <div className="mb-6 max-w-6xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-800">Nursing Service Requests</h1>
                <p className="text-xs text-gray-400 mt-1">Manage standard queues, priority express requests, and historical care logs.</p>
            </div>

            {/* Selector Tab Bar */}
            <div className="flex flex-wrap justify-center gap-2 mb-4 bg-white p-2 rounded-2xl w-full max-w-6xl border border-gray-100 shadow-sm mx-auto">
                {tabs.map((tab) => {
                    const isTabActive = activeTab === tab;
                    let badgeCount = 0;
                    if (tab === 'Daily Nursing' || tab === 'Package Nursing') {
                        badgeCount = allBookings.filter(item => {
                            const duration = item.serviceDetails?.duration;
                            const hasPrescription = !!item.prescriptionImage;
                            if (tab === 'Package Nursing') return !hasPrescription && duration === 'For Multiple Days';
                            return !hasPrescription && (duration === 'One day One Time' || duration === 'Acc. To Per/Hours');
                        }).length;
                    } else if (tab === 'Prescription Nursing') {
                        badgeCount = prescriptionPagination.totalItems + prescriptionBookings.length;
                    } else if (tab === 'Priority Requests') {
                        badgeCount = priorityBookings.length;
                    } else if (tab === 'Approved') {
                        badgeCount = approvedOrders.length;
                    } else if (tab === 'Rejected') {
                        badgeCount = rejectedOrders.length;
                    }

                    return (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                                isTabActive 
                                    ? tab === 'Rejected' ? 'bg-red-500 text-white shadow-md' : 'bg-[#08B36A] text-white shadow-md' 
                                    : 'text-gray-500 hover:bg-gray-50'
                            }`}
                        > 
                            <span>{tab}</span> 
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black transition-all ${
                                isTabActive 
                                    ? 'bg-white text-gray-900' 
                                    : 'bg-gray-100 text-gray-600'
                            }`}>
                                {badgeCount}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Sub-Tabs for Approved Orders */}
            {activeTab === 'Approved' && (
                <div className="flex justify-center gap-4 mb-6 bg-gray-50 p-1.5 rounded-xl border border-gray-100 w-fit mx-auto">
                    <button 
                        onClick={() => setApprovedSubTab('General')}
                        className={`px-6 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                            approvedSubTab === 'General' 
                                ? 'bg-[#08B36A] text-white shadow-sm' 
                                : 'text-gray-500 hover:text-gray-800'
                        }`}
                    >
                        <span>General</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                            approvedSubTab === 'General' 
                                ? 'bg-white/25 text-white' 
                                : 'bg-gray-200 text-gray-600'
                        }`}>
                            {approvedGeneralCount}
                        </span>
                    </button>
                    <button 
                        onClick={() => setApprovedSubTab('Priority')}
                        className={`px-6 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                            approvedSubTab === 'Priority' 
                                ? 'bg-amber-500 text-white shadow-sm' 
                                : 'text-gray-500 hover:text-gray-800'
                        }`}
                    >
                        <span>Priority</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                            approvedSubTab === 'Priority' 
                                ? 'bg-white/25 text-white' 
                                : 'bg-gray-200 text-gray-600'
                        }`}>
                            {approvedPriorityCount}
                        </span>
                    </button>
                </div>
            )}

            {/* Sub-Tabs for Prescription Orders */}
            {activeTab === 'Prescription Nursing' && (
                <div className="flex justify-center gap-4 mb-6 bg-gray-50 p-1.5 rounded-xl border border-gray-100 w-fit mx-auto">
                    <button 
                        onClick={() => setPrescriptionSubTab('Incoming')}
                        className={`px-6 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                            prescriptionSubTab === 'Incoming' 
                                ? 'bg-indigo-600 text-white shadow-sm' 
                                : 'text-gray-500 hover:text-gray-800'
                        }`}
                    >
                        <span>Incoming Broadcasts</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                            prescriptionSubTab === 'Incoming' 
                                ? 'bg-white/25 text-white' 
                                : 'bg-gray-200 text-gray-600'
                        }`}>
                            {prescriptionPagination.totalItems}
                        </span>
                    </button>
                    <button 
                        onClick={() => setPrescriptionSubTab('Confirmed')}
                        className={`px-6 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                            prescriptionSubTab === 'Confirmed' 
                                ? 'bg-[#08B36A] text-white shadow-sm' 
                                : 'text-gray-500 hover:text-gray-800'
                        }`}
                    >
                        <span>Confirmed Bookings</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                            prescriptionSubTab === 'Confirmed' 
                                ? 'bg-white/25 text-white' 
                                : 'bg-gray-200 text-gray-600'
                        }`}>
                            {prescriptionBookings.length}
                        </span>
                    </button>
                </div>
            )}

            {/* Unified Table Structure */}
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden mb-10 max-w-6xl mx-auto flex flex-col min-h-[450px]">
                {paginatedData.length > 0 ? (
                    <div className="flex-grow overflow-x-auto w-full">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    {activeTab === 'Prescription Nursing' && (
                                        <th className="px-8 py-5 text-xs font-bold text-gray-500 uppercase">Prescription</th>
                                    )}
                                    <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-wider">Patient Details</th>
                                    <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-wider text-center">Price / Action State</th>
                                    {isHistoryTab ? (
                                        <>
                                            {activeTab === 'Approved' ? (
                                                <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-wider">Contact Detail</th>
                                            ) : (
                                                <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-wider">Rejection Reason</th>
                                            )}
                                            <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-wider text-center">Status</th>
                                            <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-wider text-right">Actions</th>
                                        </>
                                    ) : (
                                        <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-wider text-center font-sans">Details Action</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {paginatedData.map((item, index) => {
                                    if (isHistoryTab) {
                                        return (
                                            <OrderHistoryRow 
                                                key={item._id || index}
                                                order={item}
                                                activeTab={activeTab}
                                                onRowClick={openDetails}
                                                onAssignClick={(order) => { setSelectedAppointment(order); setIsAssignModalOpen(true); }}
                                                formatDate={formatDate}
                                            />
                                        );
                                    }

                                    const isIncomingPrescriptionItem = activeTab === 'Prescription Nursing' && prescriptionSubTab === 'Incoming';
                                    const isConfirmedPrescriptionItem = activeTab === 'Prescription Nursing' && prescriptionSubTab === 'Confirmed';
                                    const isExpress = item.priceBreakdown?.fasterServiceCharge > 0 || item.isPriority === true || item.isFasterService === true;

                                    return (
                                        <tr key={item._id || index} onClick={() => openDetails(item)} className="hover:bg-gray-50 transition-colors cursor-pointer group">
                                            {activeTab === 'Prescription Nursing' && (
                                                <td className="px-8 py-4">
                                                    <div className="w-14 h-14 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                                                        {item.prescriptionImage ? (
                                                            <img 
                                                                src={getPrescriptionImageUrl(item.prescriptionImage, IMAGE_BASE_URL)} 
                                                                alt="Prescription" 
                                                                onError={handleImageError}
                                                                className="w-full h-full object-cover" 
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                                <FaImage />
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            )}
                                            <td className="px-8 py-4">
                                                <div className="font-bold text-gray-800 group-hover:text-[#08B36A] transition-colors">
                                                    {item.userId?.name || item.patients?.[0]?.name || item.address?.name || 'N/A'}
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-green-50 text-[#08B36A]">
                                                        ID: {item.bookingId || item._id?.slice(-8)}
                                                    </span>
                                                    {isExpress && (
                                                        <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded uppercase tracking-wider">
                                                            Priority
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-[12px] text-gray-500 mt-1">
                                                    {item.destinationLabel ? (
                                                        <span className="flex items-center gap-1 font-semibold text-gray-600">
                                                            <FaMapMarkerAlt size={10} className="text-[#08B36A] shrink-0" />
                                                            <span className="truncate max-w-[260px]">{item.destinationLabel}</span>
                                                        </span>
                                                    ) : (
                                                        `${isIncomingPrescriptionItem ? 'Detected Prescribed Service' : (item.serviceDetails?.title || 'Prescription Service Booking')} • ${item.userId?.gender || 'N/A'}${item.userId?.age ? `, ${item.userId.age} yrs` : ''}`
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-4 font-bold text-gray-800 text-center">
                                                {isIncomingPrescriptionItem ? (
                                                    <span className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-xl border border-indigo-100 uppercase tracking-wider font-extrabold">
                                                        Create Proposal
                                                    </span>
                                                ) : (
                                                    `₹${item.totalAmount || item.priceBreakdown?.totalPrice || item.totalPrice || 'Estimating'}`
                                                )}
                                            </td>
                                            <td className="px-8 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex items-center justify-center gap-3">
                                                    {!isIncomingPrescriptionItem && (
                                                        <span className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-xl uppercase tracking-wider">
                                                            {item.status || 'Confirmed'}
                                                        </span>
                                                    )}
                                                    {isConfirmedPrescriptionItem && (
                                                        <button 
                                                            onClick={() => { setSelectedAppointment(item); setIsAssignModalOpen(true); }}
                                                            className="bg-[#08B36A] hover:bg-[#069a5a] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                                                        >
                                                            <FaUserNurse size={12} /> ASSIGN STAFF
                                                        </button>
                                                    )}
                                                    <button 
                                                        onClick={() => openDetails(item)} 
                                                        className={`${isIncomingPrescriptionItem ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-blue-500 hover:bg-blue-600'} text-white px-4 py-2 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all hover:bg-blue-600 shadow-sm`}
                                                    >
                                                        <FaEye /> {isIncomingPrescriptionItem ? 'PROPOSE' : 'VIEW'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex-grow flex flex-col items-center justify-center p-8 text-center max-w-sm animate-in fade-in mx-auto">
                        <div className="w-48 h-48 rounded-full overflow-hidden mb-6 border-4 border-gray-50 shadow-sm">
                            <img src="https://img.freepik.com/free-photo/female-doctor-holding-box-with-medical-supplies_23-2148827766.jpg" alt="No Requests" className="w-full h-full object-cover"/>
                        </div>
                        <h2 className="text-xl font-bold text-[#1e293b] mb-2">No {activeTab} Records</h2>
                        <p className="text-gray-400 text-sm mb-8 px-4">Latest incoming requests mapping to this status parameter appear here.</p>
                        <div className="w-full px-6">
                            <button onClick={() => loadData(prescriptionPage)} className="w-full flex items-center justify-center gap-2 border-2 border-[#08B36A] text-[#08B36A] font-bold py-3 rounded-2xl hover:bg-green-50">
                                <FaSyncAlt className={`text-sm ${fetching ? 'animate-spin' : ''}`} /> Refresh Console
                            </button>
                        </div>
                    </div>
                )}

                {/* --- PAGINATION SYSTEM --- */}
                {totalItems > (isIncomingTab ? 10 : itemsPerPage) && (
                    <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <span className="text-xs text-gray-500 font-medium">
                            Showing <span className="font-bold text-gray-700">{Math.min(startIndex + 1, totalItems)}</span> to{' '}
                            <span className="font-bold text-gray-700">{Math.min(startIndex + (isIncomingTab ? 10 : itemsPerPage), totalItems)}</span> of{' '}
                            <span className="font-bold text-gray-700">{totalItems}</span> entries
                        </span>
                        
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => {
                                    if (isIncomingTab) {
                                        setPrescriptionPage(prev => Math.max(prev - 1, 1));
                                    } else {
                                        setCurrentPage(prev => Math.max(prev - 1, 1));
                                    }
                                }}
                                disabled={isIncomingTab ? !prescriptionPagination.hasPrevPage : currentPage === 1}
                                className="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 disabled:opacity-40 transition-colors cursor-pointer"
                            >
                                <FaChevronLeft size={10} />
                            </button>
                            
                            {Array.from({ length: totalPages }).map((_, index) => {
                                const pageNumber = index + 1;
                                const activePage = isIncomingTab ? prescriptionPagination.currentPage : currentPage;
                                return (
                                    <button
                                        key={pageNumber}
                                        onClick={() => {
                                            if (isIncomingTab) {
                                                setPrescriptionPage(pageNumber);
                                            } else {
                                                setCurrentPage(pageNumber);
                                            }
                                        }}
                                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                            activePage === pageNumber
                                                ? 'bg-[#08B36A] text-white shadow-sm shadow-green-100'
                                                : 'border border-gray-200 bg-white hover:bg-gray-50 text-gray-600'
                                        }`}
                                    >
                                        {pageNumber}
                                    </button>
                                );
                            })}

                            <button
                                onClick={() => {
                                    if (isIncomingTab) {
                                        setPrescriptionPage(prev => Math.min(prev + 1, totalPages));
                                    } else {
                                        setCurrentPage(prev => Math.min(prev + 1, totalPages));
                                    }
                                }}
                                disabled={isIncomingTab ? !prescriptionPagination.hasNextPage : currentPage === totalPages}
                                className="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 disabled:opacity-40 transition-colors cursor-pointer"
                            >
                                <FaChevronRight size={10} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <UnifiedOrderDetailModal 
                isOpen={isDetailsModalOpen}
                order={selectedOrder}
                activeTab={activeTab}
                prescriptionSubTab={prescriptionSubTab}
                imageBaseUrl={IMAGE_BASE_URL}
                formatDate={formatDate}
                onClose={closeAllModals}
                onRefresh={() => loadData(prescriptionPage)}
                onAssignClick={(order) => { setSelectedAppointment(order); setIsAssignModalOpen(true); }}
            />

            {/* --- SELECT NURSE MODAL --- */}
            {isAssignModalOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden relative border border-white/20 animate-in zoom-in-95 duration-300 font-sans">
                        <div className="p-8 border-b border-gray-50 bg-gray-50/50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900">Select Nurse</h2>
                                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-[2px] mt-1">
                                        FOR: {selectedAppointment?.userId?.name || selectedAppointment?.patients?.[0]?.name || selectedAppointment?.address?.name}
                                    </p>
                                </div>
                                <button onClick={() => setIsAssignModalOpen(false)} className="w-10 h-10 flex items-center justify-center bg-white rounded-full text-gray-400 hover:text-red-500 shadow-sm border border-gray-100 transition-all cursor-pointer">
                                    <FaTimes size={18} />
                                </button>
                            </div>
                        </div>
                        <div className="p-6 max-h-[450px] overflow-y-auto space-y-3 custom-scrollbar">
                            {availableNurses.length === 0 ? (
                                <div className="text-center py-10 text-gray-400 italic text-sm">No available nurses found at this time</div>
                            ) : (
                                availableNurses.map((nurse) => (
                                    <div key={nurse._id} className="flex items-center justify-between p-4 rounded-3xl border border-gray-100 hover:border-[#08B36A] hover:bg-green-50/30 transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl overflow-hidden bg-gray-100 ring-2 ring-white shadow-sm">
                                                {nurse.profilePhoto ? <img src={`${IMAGE_BASE_URL}/${nurse.profilePhoto}`} className="w-full h-full object-cover" /> : <FaUserCircle size={48} className="text-gray-200" />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 text-sm leading-tight">{nurse.name}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <FaAward className="text-orange-400" size={10} />
                                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">{nurse.experience || '2+ Years'} EXP</p>
                                                </div>
                                            </div>
                                        </div>
                                        <button onClick={() => handleAssignNurse(nurse._id)} className="bg-gray-900 text-white hover:bg-[#08B36A] px-5 py-2 rounded-2xl text-[10px] font-black transition-all shadow-md active:scale-90 cursor-pointer">SELECT</button>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="p-6 bg-gray-50 border-t border-gray-100 text-center">
                            <button onClick={() => setIsAssignModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xs font-black uppercase tracking-widest transition-colors cursor-pointer">Cancel Assignment</button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #E2E8F0;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #CBD5E1;
                }
            `}</style>

        </div>
    );
}