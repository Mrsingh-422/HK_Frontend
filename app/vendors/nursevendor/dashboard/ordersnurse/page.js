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
    
    // Normalize path separators (replaces backslashes with forward slashes)
    let cleanPath = imagePath.replace(/\\/g, '/');
    
    // Strip leading slash if present
    if (cleanPath.startsWith('/')) {
        cleanPath = cleanPath.substring(1);
    }
    
    // Ensure base URL configuration is stripped of trailing slash
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
    const [taxAmount, setTaxAmount] = useState(50); 
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeclining, setIsDeclining] = useState(false);

    useEffect(() => {
        if (isOpen && order) {
            setServicePrices({});
            setAddedConsumables([]);
            setTaxAmount(50);
        }
    }, [isOpen, order]);

    if (!isOpen || !order) return null;

    const isIncomingPrescription = activeTab === 'Prescription Nursing' && prescriptionSubTab === 'Incoming';
    const isHistory = activeTab === 'Approved' || activeTab === 'Rejected';
    const isRejected = activeTab === 'Rejected';

    // Priority Check
    const isPriorityOrder = order.isPriority === true || 
                            (order.priceBreakdown?.fasterServiceCharge > 0) || 
                            activeTab === 'Priority Requests';

    // Normalize address rendering across dynamic schemas
    const addressDetails = order.location?.address || order.address;
    const formattedAddress = addressDetails 
        ? `${addressDetails.houseNo || ''}${addressDetails.landmark ? `, Near ${addressDetails.landmark}` : ''}, ${addressDetails.city || ''}, ${addressDetails.state || ''} - ${addressDetails.pincode || ''}`
        : 'Address information unavailable';

    // Live search of consumables via API
    const handleConsumableSearch = async (e) => {
        const val = e.target.value;
        setConsumableSearch(val);
        if (val.trim().length > 1) {
            try {
                const res = await NurseAPI.searchConsumables(val);
                if (res.success) {
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

    // Live calculations ensuring numeric values
    const baseServicePriceTotal = Object.values(servicePrices).reduce((acc, curr) => acc + (Number(curr) || 0), 0);
    const consumablesTotal = addedConsumables.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);
    const estimatedTotal = baseServicePriceTotal + consumablesTotal + (Number(taxAmount) || 0);

    const handleProposalSubmit = async () => {
        const targetServices = order.services || order.detectedServices || [];
        
        // Validate pricing is assigned for all targeted services
        const missingPricing = targetServices.some(s => !servicePrices[s.title] || Number(servicePrices[s.title]) <= 0);
        if (missingPricing) {
            toast.error("Please specify a valid price for all parsed services");
            return;
        }

        try {
            setIsSubmitting(true);

            const payload = {
                requestId: order._id || order.requestId,
                servicesPricing: targetServices.map(s => ({
                    title: s.title,
                    price: Number(servicePrices[s.title])
                })),
                consumablesUsed: addedConsumables.map(c => ({
                    name: c.name,
                    price: Number(c.price)
                })),
                taxAmount: Number(taxAmount) || 0
            };

            const res = await NurseAPI.submitPrescriptionProposal(payload);
            if (res.success) {
                toast.success("Proposal submitted successfully!");
                onRefresh();
                onClose();
            } else {
                toast.error(res.message || "Failed to submit proposal");
            }
        } catch (error) {
            console.error("Proposal submission error:", error);
            toast.error("Internal service error during proposal submission");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeclineRequest = async () => {
        try {
            setIsDeclining(true);
            const payload = { requestId: order._id || order.requestId };
            const res = await NurseAPI.declinePrescriptionRequest(payload);
            if (res.success) {
                toast.success("Request declined successfully");
                onRefresh();
                onClose();
            } else {
                toast.error(res.message || "Failed to decline request");
            }
        } catch (error) {
            console.error("Decline error:", error);
            toast.error("Internal service error during action processing");
        } finally {
            setIsDeclining(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 overflow-y-auto">
            <div className="bg-white w-full max-w-3xl my-8 rounded-[40px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                
                {/* Modal Header */}
                <div className={`${isRejected ? 'bg-red-500' : isIncomingPrescription ? 'bg-indigo-600' : 'bg-[#08B36A]'} p-6 text-white flex justify-between items-center`}>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center border border-white/30 backdrop-blur-sm shrink-0">
                            <FaIdCard size={24} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h2 className="text-xl font-bold">
                                    {isIncomingPrescription ? 'Create Pricing Proposal' : (order.serviceDetails?.title || 'Prescription Details')}
                                </h2>
                                {isPriorityOrder && (
                                    <span className="px-2.5 py-0.5 bg-amber-400 text-amber-950 font-black text-[10px] rounded-full uppercase tracking-wider flex items-center gap-1 animate-pulse shadow-sm">
                                        <FaTag size={8} /> PRIORITY BOOKING
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-white/90 mt-1 uppercase tracking-widest">
                                ID: {order.bookingId || order._id?.slice(-8)}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-white hover:text-red-200 transition-colors">
                        <FaTimesCircle size={28} />
                    </button>
                </div>

                {/* Modal Content */}
                <div className="p-8 max-h-[65vh] overflow-y-auto custom-scrollbar space-y-6">

                    {/* PRIORITY TAG BANNER INSIDE ORDER DETAILS */}
                    {isPriorityOrder && (
                        <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl flex items-center justify-between shadow-xs">
                            <div className="flex items-center gap-2 text-amber-800 font-extrabold text-xs uppercase tracking-wider">
                                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                                <FaTag className="text-amber-600" size={12} />
                                Priority Booking Request
                            </div>
                            <span className="px-3 py-1 bg-amber-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-xs">
                                EXPRESS PRIORITY
                            </span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        
                        {/* Profile Details */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 border-b pb-2">
                                <FaUserAlt className={isIncomingPrescription ? 'text-indigo-600' : isRejected ? 'text-red-500' : 'text-[#08B36A]'} />
                                <h3 className="font-bold text-gray-800 uppercase text-xs tracking-wider">Patient Profile</h3>
                            </div>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Name:</span> 
                                    <span className="font-bold text-gray-800">
                                        {order.userId?.name || order.patients?.[0]?.name || order.address?.name || 'N/A'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Gender / Age:</span> 
                                    <span className="font-bold text-gray-800">
                                        {order.userId?.gender || 'N/A'}{order.userId?.age ? ` / ${order.userId.age} yrs` : ''}
                                    </span>
                                </div>
                                
                                {/* ORDER DATE & TIME DISPLAY */}
                                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                                    <span className="text-gray-400 flex items-center gap-1">
                                        <FaClock className="text-gray-400" size={10} /> Order Date & Time:
                                    </span> 
                                    <span className="font-bold text-gray-900 text-xs">
                                        {formatOrderDateTime(
                                            order.createdAt || order.bookingDate || order.schedule?.startDate, 
                                            order.appointmentTime || order.timeSlot || order.schedule?.startTime
                                        )}
                                    </span>
                                </div>

                                {/* SCHEDULED SERVICE DATE & TIME */}
                                {(order.schedule?.startDate || order.appointmentDate) && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400 flex items-center gap-1">
                                            <FaCalendarAlt className="text-gray-400" size={10} /> Scheduled Slot:
                                        </span> 
                                        <span className="font-bold text-gray-800 text-xs">
                                            {formatOrderDateTime(
                                                order.schedule?.startDate || order.appointmentDate, 
                                                order.schedule?.startTime || order.appointmentTime || order.timeSlot
                                            )}
                                        </span>
                                    </div>
                                )}

                                {isPriorityOrder && (
                                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                                        <span className="text-gray-400">Priority Status:</span> 
                                        <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 font-extrabold text-[10px] uppercase rounded-full tracking-wider">
                                            Priority Request
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Prescription Extraction Details */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 border-b pb-2">
                                <FaFileMedical className={isIncomingPrescription ? 'text-indigo-600' : 'text-[#08B36A]'} />
                                <h3 className="font-bold text-gray-800 uppercase text-xs tracking-wider">Extracted Text</h3>
                            </div>
                            <div className="space-y-3 text-sm">
                                <p className="text-xs bg-gray-50 border p-3 rounded-xl text-gray-600 leading-relaxed italic">
                                    {order.extractedText ? `"${order.extractedText}"` : "No instruction text extracted from prescription attachment."}
                                </p>
                            </div>
                        </div>

                        {/* Interactive Pricing Proposal Section */}
                        {isIncomingPrescription && (
                            <div className="md:col-span-2 space-y-6 bg-indigo-50/40 p-6 rounded-[32px] border border-indigo-100">
                                <div className="flex items-center gap-2 border-b border-indigo-100 pb-2">
                                    <FaFileMedical className="text-indigo-600" />
                                    <h3 className="font-black text-indigo-900 uppercase text-xs tracking-wider">Configure Pricing & Services</h3>
                                </div>

                                {/* Services dynamic pricing mapping */}
                                <div className="space-y-4">
                                    <label className="block text-xs font-bold text-indigo-900 uppercase">Set Base Pricing per Service</label>
                                    {(order.services || order.detectedServices || []).map((srv, idx) => (
                                        <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-indigo-100">
                                            <div>
                                                <h4 className="font-bold text-sm text-gray-800">{srv.title}</h4>
                                                <p className="text-xs text-gray-400 mt-0.5">{srv.description}</p>
                                                {srv.notes && <p className="text-[10px] text-indigo-500 italic mt-1">Note: {srv.notes}</p>}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-gray-500">₹</span>
                                                <input 
                                                    type="number"
                                                    placeholder="Rate"
                                                    className="w-24 px-3 py-2 border rounded-xl text-sm font-bold focus:outline-indigo-500 text-right"
                                                    value={servicePrices[srv.title] ?? ''}
                                                    onChange={(e) => handleServicePriceChange(srv.title, e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Consumables selector system */}
                                <div className="space-y-4 mt-6">
                                    <label className="block text-xs font-bold text-indigo-900 uppercase">Select Consumables Utilized</label>
                                    
                                    <div className="relative">
                                        <div className="flex items-center bg-white border border-indigo-100 rounded-xl px-3 py-1">
                                            <FaSearch className="text-gray-400 mr-2" />
                                            <input 
                                                type="text" 
                                                placeholder="Search consumables (e.g. Cotton, Gloves)"
                                                className="w-full py-2 focus:outline-none text-sm bg-transparent"
                                                value={consumableSearch}
                                                onChange={handleConsumableSearch}
                                            />
                                        </div>

                                        {searchResults.length > 0 && (
                                            <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto z-10 divide-y">
                                                {searchResults.map((item, idx) => (
                                                    <button 
                                                        key={idx}
                                                        type="button"
                                                        onClick={() => addConsumable(item)}
                                                        className="w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-indigo-50 text-gray-700 transition-colors flex justify-between"
                                                    >
                                                        <span>{item.name}</span>
                                                        <span className="text-indigo-600">₹{item.price}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Selected Consumables List */}
                                    {addedConsumables.length > 0 && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                                            {addedConsumables.map((c, idx) => (
                                                <div key={idx} className="flex justify-between items-center p-3 bg-white border border-indigo-50 rounded-xl text-xs font-bold shadow-sm">
                                                    <div>
                                                        <span className="text-gray-700">{c.name}</span>
                                                        <span className="text-indigo-600 ml-2">₹{c.price}</span>
                                                    </div>
                                                    <button onClick={() => removeConsumable(idx)} className="text-red-500 hover:text-red-700 transition-colors p-1">
                                                        <FaTrashAlt size={10} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Taxes Configure */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                                    <div>
                                        <label className="block text-xs font-bold text-indigo-900 uppercase mb-2">Taxes / Fees</label>
                                        <div className="flex items-center bg-white border border-indigo-100 rounded-xl px-3 py-2">
                                            <span className="text-sm font-bold text-gray-500 mr-2">₹</span>
                                            <input 
                                                type="number"
                                                value={taxAmount}
                                                className="w-full focus:outline-none text-sm font-bold"
                                                onChange={(e) => setTaxAmount(e.target.value === '' ? '' : Number(e.target.value))}
                                            />
                                        </div>
                                    </div>
                                    
                                    {/* Pricing breakdown overview */}
                                    <div className="bg-white/60 rounded-2xl border p-4 text-xs space-y-2 font-bold text-gray-600">
                                        <div className="flex justify-between">
                                            <span>Base Services:</span>
                                            <span>₹{baseServicePriceTotal}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Consumables:</span>
                                            <span>₹{consumablesTotal}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Taxes:</span>
                                            <span>₹{Number(taxAmount) || 0}</span>
                                        </div>
                                        <div className="flex justify-between text-indigo-900 font-extrabold text-sm border-t pt-2">
                                            <span>Total Price:</span>
                                            <span>₹{estimatedTotal}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Location Details */}
                        <div className="md:col-span-2 space-y-3">
                            <div className="flex items-center gap-2 border-b pb-2">
                                <FaMapMarkerAlt className={isIncomingPrescription ? 'text-indigo-600' : isRejected ? 'text-red-500' : 'text-[#08B36A]'} />
                                <h3 className="font-bold text-gray-800 uppercase text-xs tracking-wider">Service Location</h3>
                            </div>
                            <p className="bg-gray-50 p-4 rounded-2xl text-sm text-gray-600 leading-relaxed border border-gray-100 font-medium">
                                {formattedAddress}
                            </p>
                        </div>

                        {/* Prescribed Services */}
                        {!isIncomingPrescription && (order.servicesPricing?.length > 0 || order.services?.length > 0) && (
                            <div className="md:col-span-2 space-y-3">
                                <div className="flex items-center gap-2 border-b pb-2">
                                    <FaFileMedical className="text-[#08B36A]" />
                                    <h3 className="font-bold text-gray-800 uppercase text-xs tracking-wider">Mapped Services & Pricing</h3>
                                </div>
                                <div className="space-y-2">
                                    {(order.servicesPricing || order.services).map((srv, i) => (
                                        <div key={i} className="flex justify-between p-3 bg-gray-50 border rounded-xl text-xs font-bold text-gray-700">
                                            <span>{srv.title}</span>
                                            {srv.price && <span className="text-[#08B36A]">₹{srv.price}</span>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Consumables */}
                        {!isIncomingPrescription && order.consumablesUsed?.length > 0 && (
                            <div className="md:col-span-2 space-y-3">
                                <div className="flex items-center gap-2 border-b pb-2">
                                    <FaBoxOpen className="text-[#08B36A]" />
                                    <h3 className="font-bold text-gray-800 uppercase text-xs tracking-wider">Consumables Details</h3>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {order.consumablesUsed.map((c, i) => (
                                        <div key={i} className="flex justify-between p-3 bg-gray-50 rounded-xl text-xs border border-gray-100 font-bold">
                                            <span>{c.name}</span>
                                            <span className="text-[#08B36A]">₹{c.price}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Price Breakdown Preview */}
                        {!isIncomingPrescription && (
                            <div className="md:col-span-2 space-y-3">
                                <div className="flex justify-between text-sm bg-gray-50 p-4 rounded-2xl border font-bold items-center">
                                    <span className="text-gray-400">Total Charged Price:</span>
                                    <span className="text-[#08B36A] text-lg font-black">
                                        ₹{order.priceBreakdown?.totalPrice || order.totalPrice || 'N/A'}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Prescription Media */}
                        {order.prescriptionImage && (
                            <div className="md:col-span-2 space-y-3">
                                <div className="flex items-center gap-2 border-b pb-2">
                                    <FaImage className={isIncomingPrescription ? 'text-indigo-600' : 'text-[#08B36A]'} />
                                    <h3 className="font-bold text-gray-800 uppercase text-xs tracking-wider">Prescription Attachment</h3>
                                </div>
                                <div className="rounded-2xl border-2 border-dashed border-gray-200 p-2 overflow-hidden bg-gray-50">
                                    <img 
                                        src={getPrescriptionImageUrl(order.prescriptionImage, imageBaseUrl)} 
                                        alt="Prescription" 
                                        onError={handleImageError}
                                        className="w-full h-auto rounded-xl object-contain max-h-80 mx-auto" 
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="p-6 bg-gray-50 flex flex-col sm:flex-row justify-end gap-3 border-t">
                    {isIncomingPrescription ? (
                        <>
                            <button 
                                onClick={handleDeclineRequest}
                                disabled={isDeclining || isSubmitting}
                                className="px-6 py-3.5 rounded-2xl bg-red-100 text-red-600 hover:bg-red-200 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                            >
                                {isDeclining ? <FaSpinner className="animate-spin" /> : 'Decline Request'}
                            </button>
                            <button 
                                onClick={handleProposalSubmit}
                                disabled={isDeclining || isSubmitting}
                                className="px-8 py-3.5 rounded-2xl bg-indigo-600 text-white hover:bg-indigo-700 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md"
                            >
                                {isSubmitting ? <FaSpinner className="animate-spin" /> : 'Submit Proposal'}
                            </button>
                        </>
                    ) : (
                        <>
                            {activeTab === 'Approved' && (
                                <button 
                                    onClick={() => { onClose(); onAssignClick(order); }}
                                    className="px-6 py-3 rounded-2xl bg-[#08B36A] text-white font-bold hover:bg-green-700 transition-colors uppercase text-xs tracking-wider flex items-center gap-2"
                                >
                                    <FaUserNurse /> Assign Staff
                                </button>
                            )}
                            {activeTab === 'Prescription Nursing' && prescriptionSubTab === 'Confirmed' && (
                                <button 
                                    onClick={() => { onClose(); onAssignClick(order); }}
                                    className="px-6 py-3 rounded-2xl bg-[#08B36A] text-white font-bold hover:bg-green-700 transition-colors uppercase text-xs tracking-wider flex items-center gap-2"
                                >
                                    <FaUserNurse /> Assign Staff
                                </button>
                            )}
                            <button onClick={onClose} className="px-8 py-3 rounded-2xl bg-gray-200 text-gray-700 font-bold hover:bg-gray-300 transition-colors uppercase text-xs tracking-wider">
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
                    {(order.isPriority || order.priceBreakdown?.fasterServiceCharge > 0) && (
                        <span className="text-[9px] font-black bg-amber-100 text-amber-800 px-2 py-0.5 rounded uppercase tracking-wider">
                            Priority
                        </span>
                    )}
                </div>
            </td>

            <td className="px-8 py-6">
                <div className="flex items-start gap-2.5 max-w-[280px]">
                    <div className="mt-1 p-1.5 bg-gray-100 rounded-lg text-gray-400 shrink-0">
                        <FaMapMarkerAlt size={12} />
                    </div>
                    <span className="text-sm text-gray-600 font-medium leading-relaxed line-clamp-2">
                        {order.address?.houseNo}, {order.address?.city}
                    </span>
                </div>
            </td>

            <td className="px-8 py-6">
                {activeTab === 'Approved' ? (
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 flex items-center justify-center bg-blue-50 text-blue-600 rounded-full shrink-0">
                            <FaPhoneAlt size={10} />
                        </div>
                        <span className="text-sm font-black text-gray-700">{order.address?.phone || 'N/A'}</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 text-sm text-red-500 font-black italic bg-red-50/50 px-4 py-2 rounded-xl border border-red-100 w-fit">
                        <FaExclamationTriangle size={12} /> {order.rejectionReason || 'Staff Unavailable'}
                    </div>
                )}
            </td>

            <td className="px-8 py-6 text-center">
                <div className="flex justify-center">
                    <span className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest border transition-all ${
                        activeTab === 'Approved' 
                            ? 'bg-green-50 text-[#08B36A] border-green-200' 
                            : 'bg-red-50 text-red-500 border-red-200'
                    }`}>
                        <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${activeTab === 'Approved' ? 'bg-[#08B36A]' : 'bg-red-500'}`}></span>
                        {activeTab.toUpperCase()}
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

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Bookings State Store
    const [allBookings, setAllBookings] = useState([]);
    const [priorityBookings, setPriorityBookings] = useState([]);
    const [approvedOrders, setApprovedOrders] = useState([]);
    const [rejectedOrders, setRejectedOrders] = useState([]);
    const [availableNurses, setAvailableNurses] = useState([]);
    
    // Prescription Flow specific states
    const [prescriptionRequests, setPrescriptionRequests] = useState([]);
    const [prescriptionBookings, setPrescriptionBookings] = useState([]);

    // Modals State
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
    const loadData = async () => {
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
                NurseAPI.getPrescriptionRequests(),
                NurseAPI.getPrescriptionBookings('Confirmed'),
                NurseAPI.getAvailableStaff()
            ]);

            if (bookingsRes.success) setAllBookings(bookingsRes.data || []);
            if (priorityRes.success) setPriorityBookings(priorityRes.data || []);
            if (approvedRes.success) setApprovedOrders(approvedRes.data || []);
            if (rejectedRes.success) setRejectedOrders(rejectedRes.data || []);
            if (prescriptionReqsRes.success) setPrescriptionRequests(prescriptionReqsRes.data || []);
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
        loadData();
    }, []);

    // Reset pagination index whenever tab configurations update
    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, approvedSubTab, prescriptionSubTab]);

    // --- FILTER PARSER ---
    const getCurrentData = () => {
        if (activeTab === 'Rejected') return rejectedOrders;
        if (activeTab === 'Priority Requests') return priorityBookings;

        if (activeTab === 'Prescription Nursing') {
            return prescriptionSubTab === 'Incoming' ? prescriptionRequests : prescriptionBookings;
        }

        if (activeTab === 'Approved') {
            return approvedOrders.filter(item => {
                const isExpress = item.priceBreakdown?.fasterServiceCharge > 0 || item.isPriority === true;
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

    // Approved Sub-Tabs Calculations
    const approvedGeneralCount = approvedOrders.filter(item => {
        const isExpress = item.priceBreakdown?.fasterServiceCharge > 0 || item.isPriority === true;
        return !isExpress;
    }).length;

    const approvedPriorityCount = approvedOrders.filter(item => {
        const isExpress = item.priceBreakdown?.fasterServiceCharge > 0 || item.isPriority === true;
        return isExpress;
    }).length;

    // --- PAGINATION COMPILATION ---
    const totalItems = fullFilteredData.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginatedData = fullFilteredData.slice(
        (currentPage - 1) * itemsPerPage, 
        currentPage * itemsPerPage
    );

    const openDetails = (order) => { setSelectedOrder(order); setIsDetailsModalOpen(true); };
    
    const closeAllModals = () => {
        setIsDetailsModalOpen(false);
        setSelectedOrder(null);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    // --- HANDLE ASSIGN ACTION ---
    const handleAssignNurse = async (nurseId) => {
        if (!selectedAppointment || !nurseId) return;

        try {
            const payload = {
                bookingId: selectedAppointment._id,
                staffId: nurseId
            };
            
            const response = await NurseAPI.assignStaffToBooking(payload);
            
            if (response) {
                toast.success("Staff Assigned Successfully!");
                setIsAssignModalOpen(false);
                loadData(); 
            }
        } catch (error) {
            console.error("Assignment failed:", error);
            toast.error(error.response?.data?.message || "Failed to assign staff");
        }
    };

    const startIndex = (currentPage - 1) * itemsPerPage;

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
                        badgeCount = prescriptionRequests.length + prescriptionBookings.length;
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
                            {prescriptionRequests.length}
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
                                    const isExpress = item.priceBreakdown?.fasterServiceCharge > 0 || item.isPriority === true;

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
                                                    {isIncomingPrescriptionItem ? 'Detected Prescribed Service' : (item.serviceDetails?.title || 'Prescription Service Booking')} • {item.userId?.gender || 'N/A'}{item.userId?.age ? `, ${item.userId.age} yrs` : ''}
                                                </div>
                                            </td>
                                            <td className="px-8 py-4 font-bold text-gray-800 text-center">
                                                {isIncomingPrescriptionItem ? (
                                                    <span className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-xl border border-indigo-100 uppercase tracking-wider font-extrabold">
                                                        Create Proposal
                                                    </span>
                                                ) : (
                                                    `₹${item.priceBreakdown?.totalPrice || item.totalPrice || 'Estimating'}`
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
                            <button onClick={loadData} className="w-full flex items-center justify-center gap-2 border-2 border-[#08B36A] text-[#08B36A] font-bold py-3 rounded-2xl hover:bg-green-50">
                                <FaSyncAlt className={`text-sm ${fetching ? 'animate-spin' : ''}`} /> Refresh Console
                            </button>
                        </div>
                    </div>
                )}

                {/* --- PAGINATION SYSTEM --- */}
                {totalItems > itemsPerPage && (
                    <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <span className="text-xs text-gray-500 font-medium">
                            Showing <span className="font-bold text-gray-700">{Math.min(startIndex + 1, totalItems)}</span> to{' '}
                            <span className="font-bold text-gray-700">{Math.min(startIndex + itemsPerPage, totalItems)}</span> of{' '}
                            <span className="font-bold text-gray-700">{totalItems}</span> entries
                        </span>
                        
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 disabled:opacity-40 transition-colors"
                            >
                                <FaChevronLeft size={10} />
                            </button>
                            
                            {Array.from({ length: totalPages }).map((_, index) => {
                                const pageNumber = index + 1;
                                return (
                                    <button
                                        key={pageNumber}
                                        onClick={() => setCurrentPage(pageNumber)}
                                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                                            currentPage === pageNumber
                                                ? 'bg-[#08B36A] text-white shadow-sm shadow-green-100'
                                                : 'border border-gray-200 bg-white hover:bg-gray-50 text-gray-600'
                                        }`}
                                    >
                                        {pageNumber}
                                    </button>
                                );
                            })}

                            <button
                                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 disabled:opacity-40 transition-colors"
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
                onRefresh={loadData}
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
                                <button onClick={() => setIsAssignModalOpen(false)} className="w-10 h-10 flex items-center justify-center bg-white rounded-full text-gray-400 hover:text-red-500 shadow-sm border border-gray-100 transition-all">
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
                                        <button onClick={() => handleAssignNurse(nurse._id)} className="bg-gray-900 text-white hover:bg-[#08B36A] px-5 py-2 rounded-2xl text-[10px] font-black transition-all shadow-md active:scale-90">SELECT</button>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="p-6 bg-gray-50 border-t border-gray-100 text-center">
                            <button onClick={() => setIsAssignModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xs font-black uppercase tracking-widest transition-colors">Cancel Assignment</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom CSS for hiding scrollbar but keeping functionality */}
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