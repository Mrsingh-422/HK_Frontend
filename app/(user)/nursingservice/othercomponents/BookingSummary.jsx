"use client";
import React, { useState, useEffect } from "react";
import { FaCalendarCheck, FaClock, FaInfoCircle, FaStethoscope, FaUser, FaMapMarkerAlt, FaBoxOpen, FaTicketAlt, FaTimesCircle, FaPercentage, FaBolt } from "react-icons/fa";
import UserAPI from "@/app/services/UserAPI";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function BookingSummary({ bookingData, slotInfo, selectedAddress, selectedConsumables = [], onProceed }) {
    // Coupon States
    const [couponCode, setCouponCode] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [availableCoupons, setAvailableCoupons] = useState([]);
    const [couponError, setCouponError] = useState("");
    const [isValidating, setIsValidating] = useState(false);
    const [loadingCoupons, setLoadingCoupons] = useState(false);

    // Delivery & Express States
    const [deliveryConfig, setDeliveryConfig] = useState(null);
    const [isExpress, setIsExpress] = useState(false);

    const basePrice = bookingData.basePrice || 0;
    const slotSurcharge = slotInfo.extraFee || 0;
    const consumableTotal = selectedConsumables.reduce((sum, item) => sum + (item.price || 0), 0);
    
    // Use fastDeliveryExtra from API data, default to 0 if config isn't loaded yet
    const expressCharge = isExpress ? (deliveryConfig?.fastDeliveryExtra || 0) : 0;
    
    // Initial total before discount (including express)
    const subTotal = basePrice + slotSurcharge + consumableTotal + expressCharge;

    // Fetch Coupons and Delivery Config
    useEffect(() => {
        const fetchData = async () => {
            if (!bookingData.nurseId) return;
            try {
                setLoadingCoupons(true);

                // Safely get and parse serviceId from sessionStorage
                const storedData = typeof window !== "undefined" ? sessionStorage.getItem('pendingNurseBooking') : null;
                const parsedDetails = storedData ? JSON.parse(storedData) : {};
                const serviceId = parsedDetails.serviceId;

                // 1. Fetch Coupons
                const couponRes = await UserAPI.getNurseCoupon(bookingData.nurseId);
                if (couponRes.success) setAvailableCoupons(couponRes.data || []);
                
                // 2. Fetch Delivery Config using serviceId from session
                if (serviceId) {
                    const configRes = await UserAPI.nurseDeliveryConfig(serviceId);
                    if (configRes.success) {
                        setDeliveryConfig(configRes.data);
                    }
                }
            } catch (err) {
                console.error("Summary Init Error:", err);
            } finally {
                setLoadingCoupons(false);
            }
        };
        fetchData();
    }, [bookingData.nurseId]);

    // Calculate Discount
    let discountAmount = 0;
    if (appliedCoupon) {
        discountAmount = (subTotal * appliedCoupon.discountPercentage) / 100;
        if (appliedCoupon.maxDiscount && discountAmount > appliedCoupon.maxDiscount) {
            discountAmount = appliedCoupon.maxDiscount;
        }
    }

    const totalAmount = subTotal - discountAmount;

    const handleApplyCoupon = async (codeToApply) => {
        const targetCode = codeToApply || couponCode;
        if (!targetCode) return;
        
        try {
            setIsValidating(true);
            setCouponError("");
            const res = await UserAPI.validateNurseCoupon({
                couponCode: targetCode,
                nurseId: bookingData.nurseId,
                totalAmount: subTotal
            });

            if (res.success) {
                const couponData = Array.isArray(res.data) ? res.data[0] : res.data;
                if (subTotal < couponData.minOrderAmount) {
                    setCouponError(`Min. order for this coupon is ₹${couponData.minOrderAmount}`);
                    return;
                }
                setAppliedCoupon(couponData);
                setCouponCode(couponData.couponName);
                setCouponError("");
            } else {
                setCouponError(res.message || "Invalid Coupon Code");
            }
        } catch (err) {
            setCouponError("Failed to validate coupon");
        } finally {
            setIsValidating(false);
        }
    };

    const removeCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode("");
        setCouponError("");
    };

    const getImageUrl = (path) => {
        if (!path) return "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070&auto=format&fit=crop";
        if (path.startsWith("http")) return path;
        const cleanPath = path.replace(/^public\//, "");
        return `${BASE_URL}/${cleanPath}`.replace(/([^:]\/)\/+/g, "$1");
    };

    const renderDate = () => {
        if (slotInfo.startDate && slotInfo.endDate && slotInfo.startDate !== slotInfo.endDate) {
            const start = new Date(slotInfo.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
            const end = new Date(slotInfo.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
            return `${start} - ${end}`;
        }
        if (slotInfo.startDate) return new Date(slotInfo.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        return "Pick a Date";
    };

    const renderTime = () => {
        if (slotInfo.displayTime) return slotInfo.displayTime;
        if (slotInfo.startTime && slotInfo.endTime) {
            if (slotInfo.mode === "For Multiple Days") return "Full Day Service (09:00 - 18:00)";
            return `${slotInfo.startTime} - ${slotInfo.endTime}`;
        }
        if (slotInfo.startTime) return slotInfo.startTime;
        return "Select Time";
    };

    const isSelectionValid = () => {
        if (!selectedAddress) return false;
        if (slotInfo.mode === "One day One Time") return slotInfo.startDate && slotInfo.startTime;
        if (slotInfo.mode === "Acc. To Per/Hours") return slotInfo.startDate && slotInfo.startTime && slotInfo.endTime;
        if (slotInfo.mode === "For Multiple Days") return slotInfo.startDate && slotInfo.endDate && slotInfo.startDate !== slotInfo.endDate;
        return false;
    };

    const getModeDisplay = () => {
        if (slotInfo.mode === "One day One Time") return "Single Visit";
        if (slotInfo.mode === "Acc. To Per/Hours") return "Hourly Service";
        if (slotInfo.mode === "For Multiple Days") return "Multi-Day Service";
        return "Service";
    };

    return (
        <div className="bg-slate-900 rounded-[3rem] p-8 text-white sticky top-28 shadow-2xl overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>

            <div className="flex items-center gap-4 mb-8 relative z-10">
                <img src={getImageUrl(bookingData.nurseImage)} className="w-14 h-14 rounded-2xl object-cover border-2 border-white/10" alt="Nurse" />
                <div>
                    <p className="text-[9px] font-black uppercase text-teal-400 tracking-wider">Assigned Professional</p>
                    <h3 className="font-bold text-white truncate max-w-[150px]">{bookingData.nurseName}</h3>
                </div>
            </div>

            <div className="space-y-6 relative z-10">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Service</p>
                        <div className="flex items-center gap-2">
                            <FaStethoscope className="text-teal-500 text-xs" />
                            <p className="text-[11px] font-black text-slate-200 truncate">{bookingData.serviceDetails?.title}</p>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Type</p>
                        <p className="text-[11px] font-bold text-teal-400">{getModeDisplay()}</p>
                    </div>
                </div>

                {selectedAddress && (
                    <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Address</p>
                        <div className="flex items-start gap-2">
                            <FaMapMarkerAlt className="text-teal-500 text-xs mt-0.5" />
                            <p className="text-[11px] font-medium text-slate-300">
                                {selectedAddress.houseNo}, {selectedAddress.sector}, {selectedAddress.city}
                            </p>
                        </div>
                    </div>
                )}

                {selectedConsumables.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Consumables</p>
                        <div className="flex flex-wrap gap-2">
                            {selectedConsumables.map((item, idx) => (
                                <div key={idx} className="bg-white/5 px-3 py-1.5 rounded-xl border border-white/5 flex items-center gap-2">
                                    <FaBoxOpen className="text-teal-500 text-[10px]" />
                                    <span className="text-[10px] font-bold">{item.itemName}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* EXPRESS DELIVERY OPTION - Using dynamic fastDeliveryExtra from API */}
                <div 
                    onClick={() => setIsExpress(!isExpress)}
                    className={`p-4 rounded-[2rem] border-2 cursor-pointer transition-all flex items-center justify-between ${
                        isExpress ? "border-teal-500 bg-teal-500/10 shadow-lg shadow-teal-500/10" : "border-white/5 bg-white/5 hover:border-white/10"
                    }`}
                >
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${isExpress ? "bg-teal-500" : "bg-slate-800"}`}>
                            <FaBolt className={isExpress ? "text-white" : "text-slate-500"} />
                        </div>
                        <div>
                            <p className="text-[11px] font-black text-white">Express Service</p>
                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tight">Priority arrival in 60 mins</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className={`text-sm font-black ${isExpress ? "text-teal-400" : "text-slate-400"}`}>
                            {deliveryConfig ? `+₹${deliveryConfig.fastDeliveryExtra}` : "Loading..."}
                        </p>
                    </div>
                </div>

                <div className="space-y-4 bg-white/5 p-5 rounded-[2.5rem] border border-white/5">
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Coupons</p>
                    {!appliedCoupon ? (
                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <input 
                                    type="text" placeholder="CODE" value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                    className="flex-1 bg-slate-800 border-none rounded-2xl py-3 px-4 text-xs font-bold focus:ring-1 focus:ring-teal-500 transition-all uppercase"
                                />
                                <button onClick={() => handleApplyCoupon()} disabled={isValidating || !couponCode} className="bg-teal-500 text-white px-5 rounded-2xl text-[10px] font-black uppercase disabled:opacity-50">
                                    {isValidating ? "..." : "Apply"}
                                </button>
                            </div>
                            {availableCoupons.length > 0 && (
                                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                                    {availableCoupons.map((cp) => (
                                        <button key={cp._id} onClick={() => handleApplyCoupon(cp.couponName)} className="flex-shrink-0 bg-slate-800 border border-white/5 p-3 rounded-2xl flex items-center gap-2 hover:border-teal-500/50 transition-all">
                                            <FaPercentage className="text-teal-500 text-[10px]" />
                                            <span className="text-[10px] font-black text-white">{cp.couponName}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center justify-between bg-teal-500/10 border border-teal-500/20 p-4 rounded-2xl">
                            <div className="flex items-center gap-3">
                                <FaTicketAlt className="text-teal-500" />
                                <div><p className="text-[11px] font-black text-teal-400">{appliedCoupon.couponName}</p></div>
                            </div>
                            <button onClick={removeCoupon}><FaTimesCircle className="text-rose-500 size-5" /></button>
                        </div>
                    )}
                    {couponError && <p className="text-[9px] text-rose-500 font-bold ml-1">{couponError}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl">
                        <FaCalendarCheck className="text-teal-400 size-3" />
                        <div className="truncate"><p className="text-[8px] font-black text-slate-500 uppercase">Date</p><span className="text-[11px] font-bold">{renderDate()}</span></div>
                    </div>
                    <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl">
                        <FaClock className="text-teal-400 size-3" />
                        <div className="truncate"><p className="text-[8px] font-black text-slate-500 uppercase">Time</p><span className="text-[11px] font-bold">{renderTime()}</span></div>
                    </div>
                </div>

                <div className="bg-white/5 p-6 rounded-[2.5rem] border border-white/5 space-y-3">
                    <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400 font-medium">Service Fee</span>
                        <span className="font-black">₹{basePrice}</span>
                    </div>
                    {slotSurcharge > 0 && (
                        <div className="flex justify-between text-[11px] text-amber-400">
                            <span className="font-medium uppercase tracking-tighter">Premium Surcharge</span>
                            <span className="font-black">+ ₹{slotSurcharge}</span>
                        </div>
                    )}
                    {consumableTotal > 0 && (
                        <div className="flex justify-between text-[11px] text-teal-400">
                            <span className="font-medium uppercase tracking-tighter">Consumables</span>
                            <span className="font-black">+ ₹{consumableTotal}</span>
                        </div>
                    )}
                    {isExpress && deliveryConfig && (
                        <div className="flex justify-between text-[11px] text-teal-400">
                            <span className="font-medium uppercase tracking-tighter">Express Fee</span>
                            <span className="font-black">+ ₹{deliveryConfig.fastDeliveryExtra}</span>
                        </div>
                    )}
                    {appliedCoupon && (
                        <div className="flex justify-between text-[11px] text-teal-400">
                            <span className="font-medium uppercase tracking-tighter">Discount</span>
                            <span className="font-black">- ₹{Math.round(discountAmount)}</span>
                        </div>
                    )}

                    <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                        <div>
                            <p className="text-[9px] font-black text-slate-500 uppercase leading-none mb-1">Final Amount</p>
                            <span className="text-3xl font-black text-teal-400">₹{Math.round(totalAmount)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[8px] text-slate-500 uppercase font-bold bg-white/5 px-2 py-1 rounded-md">
                            <FaInfoCircle className="text-teal-500" /> Tax Incl.
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => onProceed({ 
                        appliedCoupon: appliedCoupon ? { ...appliedCoupon, discountAmount } : null,
                        isExpress,
                        expressCharge,
                        totalAmount
                    })}
                    disabled={!isSelectionValid()}
                    className={`w-full py-5 rounded-[2.5rem] font-black transition-all shadow-xl flex flex-col items-center justify-center ${
                        !isSelectionValid() ? "bg-slate-800 text-slate-600 cursor-not-allowed" : "bg-teal-500 text-white hover:bg-teal-400"
                    }`}
                >
                    <span className="text-base">Confirm & Book</span>
                    {!isSelectionValid() && <span className="text-[8px] uppercase opacity-60 mt-1">Check Address & Time</span>}
                </button>

                <p className="text-[9px] text-center text-slate-500 px-4">
                    Secure checkout powered by our home-care platform.
                </p>
            </div>
        </div>
    );
}