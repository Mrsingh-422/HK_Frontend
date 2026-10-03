"use client";
import React, { useState, useEffect } from "react";
import { 
    FaBolt, FaTicketAlt, FaTimesCircle, FaPercentage, 
    FaCheck, FaShieldAlt, FaSpinner, FaChevronRight 
} from "react-icons/fa";
import UserAPI from "@/app/services/UserAPI";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function BookingSummary({ 
    bookingData, 
    slotInfo, 
    selectedAddress, 
    selectedConsumables = [], 
    onProceed,
    isSubmitting = false 
}) {
    const [couponCode, setCouponCode] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [availableCoupons, setAvailableCoupons] = useState([]);
    const [couponError, setCouponError] = useState("");
    const [isValidating, setIsValidating] = useState(false);
    const [deliveryConfig, setDeliveryConfig] = useState(null);
    const [isExpress, setIsExpress] = useState(false);

    // Get number of patients (default to 1 if not found)
    const patientCount = bookingData?.patients?.length || 1;

    // Multiply total service price by number of patients
    const serviceBaseTotal = (slotInfo?.totalPrice || 0) * patientCount;
    const consumableTotal = selectedConsumables.reduce((sum, item) => sum + (item.price || 0), 0);
    const expressCharge = isExpress ? (deliveryConfig?.fastDeliveryExtra || 0) : 0;
    
    const subTotal = serviceBaseTotal + consumableTotal + expressCharge;

    useEffect(() => {
        const fetchData = async () => {
            if (!bookingData?.nurseId) return;
            try {
                // 1. Fetch Coupons
                const couponRes = await UserAPI.getNurseCoupon(bookingData.nurseId);
                if (couponRes?.success) setAvailableCoupons(couponRes.data || []);
                
                // 2. Fetch Delivery Config using serviceId from session
                const storedData = typeof window !== "undefined" ? sessionStorage.getItem('pendingNurseBooking') : null;
                const parsedDetails = storedData ? JSON.parse(storedData) : {};
                const serviceId = parsedDetails.serviceId;

                if (serviceId) {
                    const configRes = await UserAPI.nurseDeliveryConfig(serviceId);
                    if (configRes?.success) setDeliveryConfig(configRes.data);
                }
            } catch (err) {
                console.error("Summary Init Error:", err);
            }
        };
        fetchData();
    }, [bookingData?.nurseId]);

    let discountAmount = 0;
    if (appliedCoupon) {
        discountAmount = (subTotal * appliedCoupon.discountPercentage) / 100;
        if (appliedCoupon.maxDiscount && discountAmount > appliedCoupon.maxDiscount) {
            discountAmount = appliedCoupon.maxDiscount;
        }
    }

    const finalTotal = Math.max(0, subTotal - discountAmount);

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
            if (res?.success) {
                const couponData = Array.isArray(res.data) ? res.data[0] : res.data;
                if (subTotal < couponData.minOrderAmount) {
                    setCouponError(`Min. order is ₹${couponData.minOrderAmount}`);
                    return;
                }
                setAppliedCoupon(couponData);
                setCouponCode(couponData.couponName);
            } else {
                setCouponError(res?.message || "Invalid Coupon");
            }
        } catch (err) {
            setCouponError("Validation Failed");
        } finally {
            setIsValidating(false);
        }
    };

    const isSelectionValid = () => {
        if (!selectedAddress) return false;
        if (slotInfo.mode === "One day One Time") return slotInfo.startDate && slotInfo.startTime;
        if (slotInfo.mode === "Acc. To Per/Hours") return slotInfo.startDate && slotInfo.startTime && slotInfo.endTime;
        if (slotInfo.mode === "For Multiple Days") return slotInfo.startDate && slotInfo.endDate && slotInfo.startDate !== slotInfo.endDate;
        return false;
    };

    const getImageUrl = (path) => {
        if (!path) return "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070&auto=format&fit=crop";
        if (path.startsWith("http")) return path;
        return `${BASE_URL}/${path.replace(/^public\//, "")}`.replace(/([^:]\/)\/+/g, "$1");
    };

    return (
        <div className="bg-slate-900 rounded-[2.5rem] p-6 md:p-7 text-white shadow-2xl border border-slate-800 space-y-5">
            {/* Header: Care Professional Info */}
            <div className="flex items-center gap-3.5 pb-4 border-b border-slate-800">
                <img 
                    src={getImageUrl(bookingData?.nurseImage)} 
                    className="w-13 h-13 rounded-2xl object-cover border border-white/10 ring-2 ring-[#08B36A]/20" 
                    alt="Nurse" 
                />
                <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-black uppercase text-[#08B36A] tracking-wider block">
                        Assigned Professional
                    </span>
                    <h3 className="font-bold text-sm text-white truncate">
                        {bookingData?.nurseName || "Verified Nursing Officer"}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-medium">
                        {bookingData?.serviceDetails?.title || "Home Clinical Visit"}
                    </p>
                </div>
            </div>

            {/* REDESIGNED EXPRESS SERVICE TOGGLE BUTTON */}
            <div 
                onClick={() => setIsExpress(!isExpress)}
                className={`relative overflow-hidden p-4 rounded-2xl border transition-all duration-300 cursor-pointer select-none ${
                    isExpress 
                        ? "border-[#08B36A] bg-gradient-to-r from-[#08B36A]/15 via-emerald-900/20 to-slate-900 ring-2 ring-[#08B36A]/30" 
                        : "border-slate-800 bg-slate-800/50 hover:border-slate-700 hover:bg-slate-800/80"
                }`}
            >
                <div className="flex items-center justify-between gap-3 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                            isExpress ? "bg-[#08B36A] text-white shadow-lg shadow-[#08B36A]/40" : "bg-slate-800 text-amber-400"
                        }`}>
                            <FaBolt className={isExpress ? "text-white animate-pulse" : "text-amber-400"} size={16} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <p className="text-xs font-black text-white tracking-tight">Express Arrival</p>
                                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                                    isExpress ? "bg-[#08B36A] text-white" : "bg-slate-700 text-slate-300"
                                }`}>
                                    60 Mins
                                </span>
                            </div>
                            <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                                Priority nursing dispatch to your doorstep
                            </p>
                        </div>
                    </div>

                    <div className="text-right">
                        <span className={`text-xs font-black block ${isExpress ? "text-[#08B36A]" : "text-slate-300"}`}>
                            {deliveryConfig ? `+₹${deliveryConfig.fastDeliveryExtra}` : "+₹0"}
                        </span>
                        <div className={`w-5 h-5 ml-auto mt-1 rounded-full border flex items-center justify-center transition-all ${
                            isExpress ? "bg-[#08B36A] border-[#08B36A]" : "border-slate-600 bg-slate-800"
                        }`}>
                            {isExpress && <FaCheck className="text-white text-[9px]" />}
                        </div>
                    </div>
                </div>
            </div>

            {/* Coupons Section */}
            <div className="space-y-3 bg-slate-800/40 p-4 rounded-2xl border border-slate-800">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                        Apply Promo Code
                    </span>
                    {couponError && (
                        <span className="text-[10px] font-bold text-rose-400 truncate max-w-[140px]">
                            {couponError}
                        </span>
                    )}
                </div>

                {!appliedCoupon ? (
                    <div className="space-y-3">
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                placeholder="ENTER CODE" 
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                className="flex-1 bg-slate-800/90 border border-slate-700 rounded-xl py-2.5 px-3.5 text-xs font-black text-white placeholder-slate-500 focus:outline-none focus:border-[#08B36A]"
                            />
                            <button 
                                type="button"
                                onClick={() => handleApplyCoupon()} 
                                disabled={isValidating || !couponCode} 
                                className="bg-[#08B36A] hover:bg-[#079c5c] text-white px-4 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                            >
                                {isValidating ? <FaSpinner className="animate-spin" /> : "Apply"}
                            </button>
                        </div>

                        {availableCoupons.length > 0 && (
                            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                                {availableCoupons.map((cp) => (
                                    <button 
                                        key={cp._id} 
                                        type="button"
                                        onClick={() => handleApplyCoupon(cp.couponName)} 
                                        className="flex-shrink-0 bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-[#08B36A]/50 p-2.5 rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
                                    >
                                        <FaPercentage className="text-[#08B36A] text-[10px]" />
                                        <span className="text-[10px] font-black text-slate-200">{cp.couponName}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex items-center justify-between bg-[#08B36A]/10 border border-[#08B36A]/30 p-3 rounded-xl">
                        <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-[#08B36A] text-white flex items-center justify-center">
                                <FaTicketAlt size={11} />
                            </div>
                            <div>
                                <p className="text-xs font-black text-[#08B36A]">{appliedCoupon.couponName}</p>
                                <p className="text-[9px] text-slate-400 font-medium">Coupon applied successfully</p>
                            </div>
                        </div>
                        <button 
                            type="button"
                            onClick={() => setAppliedCoupon(null)}
                            className="text-slate-400 hover:text-rose-400 transition-colors p-1"
                        >
                            <FaTimesCircle size={16} />
                        </button>
                    </div>
                )}
            </div>

            {/* Price Breakdown Bill */}
            <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-800 space-y-2.5">
                <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-medium">
                        {slotInfo?.mode === "For Multiple Days" ? "Multi-Day Fee" : 
                         slotInfo?.mode === "Acc. To Per/Hours" ? "Hourly Fee" : "Service Fee"}
                        {patientCount > 1 && ` (x${patientCount} Patients)`}
                    </span>
                    <span className="font-bold text-slate-200">₹{serviceBaseTotal}</span>
                </div>
                
                {consumableTotal > 0 && (
                    <div className="flex justify-between text-xs text-[#08B36A]">
                        <span className="font-medium">Medical Consumables</span>
                        <span className="font-bold">+ ₹{consumableTotal}</span>
                    </div>
                )}
                
                {isExpress && (
                    <div className="flex justify-between text-xs text-[#08B36A]">
                        <span className="font-medium">Express Dispatch</span>
                        <span className="font-bold">+ ₹{expressCharge}</span>
                    </div>
                )}
                
                {appliedCoupon && (
                    <div className="flex justify-between text-xs text-[#08B36A]">
                        <span className="font-medium">Promo Discount ({appliedCoupon.discountPercentage}%)</span>
                        <span className="font-bold">- ₹{Math.round(discountAmount)}</span>
                    </div>
                )}
                
                <div className="pt-3 border-t border-slate-700/60 flex justify-between items-end">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Payable</p>
                        <span className="text-2xl font-black text-[#08B36A]">₹{Math.round(finalTotal)}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-semibold mb-1">Taxes inclusive</span>
                </div>
            </div>

            {/* Confirm & Book CTA */}
            <button
                type="button"
                onClick={() => onProceed({
                    isExpress,
                    expressCharge,
                    appliedCoupon,
                    discountAmount,
                    finalTotal,
                    subTotal
                })}
                disabled={!isSelectionValid() || isSubmitting}
                className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    !isSelectionValid() || isSubmitting
                        ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700" 
                        : "bg-[#08B36A] hover:bg-[#079c5c] text-white shadow-[#08B36A]/20 active:scale-[0.98]"
                }`}
            >
                {isSubmitting ? (
                    <>
                        <FaSpinner className="animate-spin text-sm" />
                        <span>Processing Booking...</span>
                    </>
                ) : (
                    <>
                        <span>Confirm & Schedule</span>
                        <FaChevronRight size={11} />
                    </>
                )}
            </button>
        </div>
    );
}