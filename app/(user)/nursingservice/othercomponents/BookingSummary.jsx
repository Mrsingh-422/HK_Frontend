"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
    FaTicketAlt, FaTimesCircle, FaPercentage, 
    FaCheck, FaSpinner, FaChevronRight,
    FaGem, FaExclamationTriangle, FaMoneyBillWave,
    FaCreditCard, FaBolt, FaTags
} from "react-icons/fa";
import UserAPI from "@/app/services/UserAPI";
import CostoumPopup from "@/lib/CostoumPopup";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5002";

export default function BookingSummary({ 
    bookingData, 
    slotInfo, 
    selectedAddress, 
    selectedConsumables = [], 
    onProceed,
    isSubmitting = false,
    subscriptionInfo,
    paymentMethod = "Online",
    onCouponApply
}) {
    const [couponCode, setCouponCode] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [availableCoupons, setAvailableCoupons] = useState([]);
    const [couponError, setCouponError] = useState("");
    const [isValidating, setIsValidating] = useState(false);
    const [loadingCoupons, setLoadingCoupons] = useState(false);

    // Express rush is strictly determined by whether the selected slot is in an express window
    const isExpress = Boolean(slotInfo?.isExpressWindow);
    const patientCount = bookingData?.patients?.length || 1;

    // 1. Fetch Nurse Coupons via getNurseCoupon API
    useEffect(() => {
        const fetchCoupons = async () => {
            if (!bookingData?.nurseId) return;
            try {
                setLoadingCoupons(true);
                const couponRes = await UserAPI.getNurseCoupon?.(bookingData.nurseId);
                
                if (couponRes?.success && Array.isArray(couponRes.data)) {
                    setAvailableCoupons(couponRes.data);
                } else if (Array.isArray(couponRes)) {
                    setAvailableCoupons(couponRes);
                } else if (couponRes?.coupons && Array.isArray(couponRes.coupons)) {
                    setAvailableCoupons(couponRes.coupons);
                } else {
                    setAvailableCoupons([]);
                }
            } catch (err) {
                console.error("❌ [BookingSummary] Error fetching nurse coupons:", err);
            } finally {
                setLoadingCoupons(false);
            }
        };
        fetchCoupons();
    }, [bookingData?.nurseId]);

    // Comprehensive Line-Item Financial Summary
    const summary = useMemo(() => {
        const consumableTotal = selectedConsumables.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
        
        if (subscriptionInfo) {
            const isVisitFree = Boolean(subscriptionInfo.visitBenefit?.isApplied);
            const isTravelFree = Boolean(subscriptionInfo.travelBenefit?.isApplied);
            
            const baseServicePrice = subscriptionInfo.baseServicePrice ?? 0;
            const originalBasePrice = subscriptionInfo.originalBasePrice ?? (baseServicePrice || 500);
            const slotSurcharge = Number(subscriptionInfo.slotSurcharge ?? slotInfo?.extraFee ?? 0);
            
            // Raw and active travel fee
            const rawTravelFee = Number(subscriptionInfo.travelFee ?? 45);
            const activeTravelFee = isTravelFree ? 0 : rawTravelFee;

            // Raw and active express charge from server
            const rawExpressCharge = Number(slotInfo?.expressExtraFee || subscriptionInfo.fasterServiceCharge || 0);
            const activeExpressCharge = isTravelFree ? 0 : rawExpressCharge;

            const couponDiscount = Number(appliedCoupon?.discountAmount ?? subscriptionInfo.couponDiscount ?? 0);
            const taxAmount = Number(subscriptionInfo.taxAmount ?? 0);
            
            // Grand Total Calculation
            const subtotal = (isVisitFree ? 0 : baseServicePrice) + consumableTotal + slotSurcharge + activeExpressCharge + activeTravelFee + taxAmount;
            const totalPrice = Math.max(0, subtotal - couponDiscount);

            return {
                baseServicePrice,
                originalBasePrice,
                isVisitFree,
                slotSurcharge,
                consumableTotal,
                rawTravelFee,
                activeTravelFee,
                rawExpressCharge,
                activeExpressCharge,
                isTravelFree,
                couponDiscount,
                taxAmount,
                totalPrice: Math.round(totalPrice),
                visitBenefit: subscriptionInfo.visitBenefit || {},
                travelBenefit: subscriptionInfo.travelBenefit || {}
            };
        }

        // Fallback calculation
        const fallbackBase = (slotInfo?.totalPrice || slotInfo?.basePrice || bookingData?.basePrice || 0) * patientCount;
        const slotExpressFee = Number(slotInfo?.expressExtraFee || 0);
        const fallbackExpress = isExpress ? slotExpressFee : 0;
        const fallbackTravel = 45;
        const discountAmount = appliedCoupon?.discountAmount ?? (appliedCoupon ? Math.min(appliedCoupon.maxDiscount || 9999, (fallbackBase * (appliedCoupon.discountPercentage || 0)) / 100) : 0);
        const total = Math.max(0, fallbackBase + consumableTotal + (slotInfo?.extraFee || 0) + fallbackExpress + fallbackTravel - discountAmount);

        return {
            baseServicePrice: fallbackBase,
            originalBasePrice: fallbackBase,
            isVisitFree: false,
            slotSurcharge: slotInfo?.extraFee || 0,
            consumableTotal,
            rawTravelFee: fallbackTravel,
            activeTravelFee: fallbackTravel,
            rawExpressCharge: fallbackExpress,
            activeExpressCharge: fallbackExpress,
            isTravelFree: false,
            couponDiscount: discountAmount,
            taxAmount: 0,
            totalPrice: Math.round(total),
            visitBenefit: {},
            travelBenefit: {}
        };
    }, [subscriptionInfo, selectedConsumables, slotInfo, bookingData, patientCount, isExpress, appliedCoupon]);

    // Handle Apply Coupon with limit-exceeded alert popup
    const handleApplyCoupon = async (codeToApply) => {
        const targetCode = (codeToApply || couponCode).trim().toUpperCase();
        if (!targetCode) return;

        try {
            setIsValidating(true);
            setCouponError("");

            const validateApi = UserAPI.validateNurseCoupon || UserAPI.validateDoctorCoupon;
            const res = await validateApi({
                couponCode: targetCode,
                nurseId: String(bookingData.nurseId),
                totalAmount: Number(summary.totalPrice + (summary.couponDiscount || 0))
            });

            if (res?.success && res.data) {
                const couponData = res.data;
                setAppliedCoupon(couponData);
                setCouponCode(couponData.couponName || targetCode);

                if (typeof onCouponApply === "function") {
                    onCouponApply(couponData.couponName || targetCode);
                }
                if (typeof CostoumPopup === "function") {
                    CostoumPopup("Coupon applied successfully!", "success", 3000);
                }
            } else {
                const errorMsg = res?.message || "Coupon limit reached or invalid.";
                if (typeof CostoumPopup === "function") {
                    CostoumPopup(errorMsg, "warning", 4000);
                } else {
                    alert(errorMsg);
                }
                setAppliedCoupon(null);
            }
        } catch (err) {
            console.error("❌ [BookingSummary] Coupon Validation Error:", err);
            const serverMessage = err?.response?.data?.message || err?.message || "Coupon usage limit reached. You can only use this coupon 1 time(s).";
            
            // 💡 Show friendly alert popup instead of breaking UI
            if (typeof CostoumPopup === "function") {
                CostoumPopup(serverMessage, "warning", 4000);
            } else {
                alert(serverMessage);
            }
            setAppliedCoupon(null);
        } finally {
            setIsValidating(false);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode("");
        setCouponError("");
        if (typeof onCouponApply === "function") {
            onCouponApply("");
        }
    };

    const isSelectionValid = () => {
        if (!selectedAddress) return false;
        if (slotInfo?.mode === "One day One Time") return Boolean(slotInfo.startDate && slotInfo.startTime);
        if (slotInfo?.mode === "Acc. To Per/Hours") return Boolean(slotInfo.startDate && slotInfo.startTime && slotInfo.endTime);
        if (slotInfo?.mode === "For Multiple Days") return Boolean(slotInfo.startDate && slotInfo.endDate);
        return Boolean(slotInfo?.startDate && slotInfo?.startTime);
    };

    const getImageUrl = (path) => {
        if (!path) return "https://images.unsplash.com/photo-1594824813576-a192f15b5f25?auto=format&fit=crop&w=400&q=80";
        if (path.startsWith("http")) return path;
        return `${BASE_URL}/${path.replace(/^public\//, "")}`.replace(/([^:]\/)\/+/g, "$1");
    };

    return (
        <div className="bg-slate-900 rounded-[2.5rem] p-6 md:p-7 text-white shadow-2xl border border-slate-800 space-y-5 font-sans">
            
            {/* 1. Header: Assigned Healthcare Provider */}
            <div className="flex items-center gap-3.5 pb-4 border-b border-slate-800">
                <img 
                    src={getImageUrl(bookingData?.nurseImage)} 
                    className="w-13 h-13 rounded-2xl object-cover border border-white/10 ring-2 ring-[#08B36A]/20 shrink-0" 
                    alt="Nurse Provider" 
                />
                <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-black uppercase text-[#08B36A] tracking-wider block">
                        Assigned Healthcare Provider
                    </span>
                    <h3 className="font-bold text-sm text-white truncate">
                        {bookingData?.nurseName || "Verified Nursing Bureau"}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                        {bookingData?.serviceDetails?.title || "Clinical Nursing Care"}
                    </p>
                </div>
            </div>

            {/* 2. Free Visit Membership Benefit Callout */}
            {summary.isVisitFree && (
                <div className="bg-gradient-to-r from-emerald-900/40 to-slate-900 border border-emerald-500/40 p-3.5 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-[#08B36A] text-white flex items-center justify-center shrink-0">
                            <FaGem size={14} />
                        </div>
                        <div>
                            <p className="text-xs font-black text-emerald-400 uppercase tracking-tight">
                                ✨ Free Consultation ({summary.visitBenefit?.planName || "VIP Plan"})
                            </p>
                            <p className="text-[10px] text-slate-300 font-medium">
                                Base consultation fee waived automatically.
                            </p>
                        </div>
                    </div>
                    <span className="bg-[#08B36A] text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                        {summary.visitBenefit?.remainingCount} Left
                    </span>
                </div>
            )}

            {/* 3. Express Service Status Card */}
            <div 
                className={`relative overflow-hidden p-4 rounded-2xl border-2 transition-all duration-300 pointer-events-none select-none bg-white text-slate-900 shadow-md ${
                    isExpress
                        ? "border-[#08B36A] ring-2 ring-[#08B36A]/25" 
                        : "border-slate-200 opacity-80"
                }`}
            >
                <div className="flex items-center justify-between gap-3 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                            isExpress 
                                ? "bg-[#08B36A] text-white shadow-md shadow-[#08B36A]/30" 
                                : "bg-amber-50 text-amber-600 border border-amber-200"
                        }`}>
                            <FaBolt className={isExpress ? "text-white animate-pulse" : "text-amber-500"} size={16} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <p className="text-xs font-black text-slate-900 tracking-tight">Express Arrival</p>
                                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                                    isExpress ? "bg-[#08B36A] text-white" : "bg-slate-100 text-slate-700"
                                }`}>
                                    1-3h Rush
                                </span>
                            </div>
                            <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                                {isExpress ? "Emergency 1-4h rush window active" : "Standard scheduled dispatch window"}
                            </p>
                        </div>
                    </div>

                    <div className="text-right">
                        <span className={`text-xs font-black block ${
                            summary.isTravelFree ? "text-[#08B36A]" : isExpress ? "text-[#08B36A]" : "text-slate-600"
                        }`}>
                            {summary.isTravelFree ? "FREE" : summary.rawExpressCharge > 0 ? `+₹${summary.rawExpressCharge}` : "Standard"}
                        </span>
                        <div className={`w-5 h-5 ml-auto mt-1 rounded-full border-2 flex items-center justify-center transition-all ${
                            isExpress ? "bg-[#08B36A] border-[#08B36A]" : "border-slate-300 bg-slate-50"
                        }`}>
                            {isExpress && <FaCheck className="text-white text-[9px]" />}
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. Free Delivery / Travel Quota Exhaustion Warning */}
            {summary.travelBenefit?.hasActiveSubscription && summary.travelBenefit?.isBenefitExhausted && (
                <div className="bg-amber-950/40 border border-amber-500/40 p-3 rounded-xl flex items-start gap-2 text-amber-300">
                    <FaExclamationTriangle className="mt-0.5 shrink-0 text-amber-400" size={12} />
                    <p className="text-[10px] font-bold leading-relaxed">
                        {summary.travelBenefit?.exhaustedMessage || "Your quota for free travel delivery has been exhausted."}
                    </p>
                </div>
            )}

            {/* ========================================================= */}
            {/* 5. COUPONS SECTION (HIGH CONTRAST VOUCHER THEME)         */}
            {/* ========================================================= */}
            <div className="bg-white text-slate-900 p-4.5 rounded-2xl shadow-xl border-2 border-amber-300/80 space-y-3.5 relative overflow-hidden">
                
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-xs">
                            <FaTags size={12} />
                        </div>
                        <span className="text-[11px] font-black uppercase text-slate-900 tracking-wider">
                            Apply Promo Code
                        </span>
                    </div>
                    {couponError && (
                        <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md truncate max-w-[160px]">
                            {couponError}
                        </span>
                    )}
                </div>

                {!appliedCoupon ? (
                    <div className="space-y-3">
                        {/* High-Contrast Crisp Input & Button */}
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                placeholder="ENTER CODE" 
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                className="flex-1 bg-slate-50 border-2 border-slate-200 focus:border-[#08B36A] focus:bg-white rounded-xl py-2.5 px-3.5 text-xs font-black text-slate-900 placeholder-slate-400 tracking-wider focus:outline-none transition-all shadow-inner"
                            />
                            <button 
                                type="button"
                                onClick={() => handleApplyCoupon()} 
                                disabled={isValidating || !couponCode.trim()} 
                                className="bg-[#08B36A] hover:bg-[#079c5c] text-white px-5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-md shadow-[#08B36A]/20 active:scale-95"
                            >
                                {isValidating ? <FaSpinner className="animate-spin" /> : "Apply"}
                            </button>
                        </div>

                        {/* Available Coupons List */}
                        {loadingCoupons ? (
                            <div className="flex items-center gap-2 py-1 text-slate-500 text-[11px]">
                                <FaSpinner className="animate-spin text-amber-500" />
                                <span>Loading available coupons...</span>
                            </div>
                        ) : availableCoupons.length > 0 ? (
                            <div className="space-y-1.5 pt-1">
                                <div className="flex items-center justify-between">
                                    <span className="text-[9.5px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                        <FaTicketAlt className="text-amber-500" size={9} /> Available Coupons ({availableCoupons.length})
                                    </span>
                                    <span className="text-[8.5px] text-slate-400 font-bold">Tap to apply</span>
                                </div>
                                <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
                                    {availableCoupons.map((cp, idx) => {
                                        const codeName = cp.couponName || cp.code || cp.couponCode;
                                        const discountText = cp.discountPercentage ? `${cp.discountPercentage}% OFF` : cp.discountAmount ? `₹${cp.discountAmount} OFF` : "PROMO";
                                        
                                        return (
                                            <button 
                                                key={cp._id || idx} 
                                                type="button"
                                                onClick={() => handleApplyCoupon(codeName)} 
                                                className="flex-shrink-0 bg-amber-50/70 hover:bg-amber-100 border border-amber-300 hover:border-amber-500 p-2.5 rounded-xl flex items-center gap-2.5 cursor-pointer transition-all duration-200 group active:scale-95 shadow-xs"
                                            >
                                                <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center transition-colors shadow-xs">
                                                    <FaPercentage size={10} />
                                                </div>
                                                <div className="text-left">
                                                    <span className="text-[11px] font-black text-slate-900 block tracking-wide leading-tight">
                                                        {codeName}
                                                    </span>
                                                    <span className="text-[9px] font-black text-amber-800 bg-amber-200/60 px-1.5 py-0.5 rounded inline-block mt-0.5 leading-tight">
                                                        {discountText}
                                                    </span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : null}
                    </div>
                ) : (
                    /* Applied Coupon State Card */
                    <div className="flex items-center justify-between bg-emerald-50 border-2 border-[#08B36A] p-3 sm:p-3.5 rounded-xl shadow-xs">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-[#08B36A] text-white flex items-center justify-center shadow-xs">
                                <FaTicketAlt size={13} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="text-xs font-black text-slate-900 tracking-wide">{appliedCoupon.couponName || couponCode}</p>
                                    <span className="bg-[#08B36A] text-white text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                                        APPLIED
                                    </span>
                                </div>
                                <p className="text-[10px] text-emerald-800 font-bold mt-0.5">
                                    {appliedCoupon.discountAmount ? `Saved ₹${appliedCoupon.discountAmount} successfully!` : "Coupon applied successfully!"}
                                </p>
                            </div>
                        </div>
                        <button 
                            type="button"
                            onClick={handleRemoveCoupon}
                            className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition-all cursor-pointer"
                            title="Remove Coupon"
                        >
                            <FaTimesCircle size={18} />
                        </button>
                    </div>
                )}
            </div>

            {/* 6. Comprehensive Breakdown of All Fees & Charges */}
            <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-800 space-y-2.5">
                
                {/* Base Service / Consultation Fee */}
                <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-medium">
                        {slotInfo?.mode === "For Multiple Days" ? "Multi-Day Service Fee" : 
                         slotInfo?.mode === "Acc. To Per/Hours" ? "Hourly Service Fee" : "Base Consultation Fee"}
                        {patientCount > 1 && ` (x${patientCount} Patients)`}
                    </span>
                    <div className="text-right font-bold">
                        {summary.isVisitFree ? (
                            <div className="flex items-center gap-1.5">
                                <span className="line-through text-slate-500 text-[11px]">₹{summary.originalBasePrice}</span>
                                <span className="text-[#08B36A] uppercase text-[10px] font-black">FREE</span>
                            </div>
                        ) : (
                            <span className="text-slate-200">₹{summary.baseServicePrice}</span>
                        )}
                    </div>
                </div>

                {/* Base Travel & Distance Fee */}
                {summary.rawTravelFee > 0 && (
                    <div className="flex justify-between items-center text-xs text-slate-400">
                        <span>Base Travel & Distance Fee</span>
                        <div className="text-right font-bold">
                            {summary.isTravelFree ? (
                                <div className="flex items-center gap-1.5">
                                    <span className="line-through text-slate-500 text-[11px]">₹{summary.rawTravelFee}</span>
                                    <span className="text-[#08B36A] uppercase text-[10px] font-black">FREE</span>
                                </div>
                            ) : (
                                <span className="text-slate-200">+ ₹{summary.activeTravelFee}</span>
                            )}
                        </div>
                    </div>
                )}
                
                {/* Slot Premium Surcharge */}
                {summary.slotSurcharge > 0 && (
                    <div className="flex justify-between text-xs text-slate-400">
                        <span>Time Slot Premium Surcharge</span>
                        <span className="font-bold text-slate-200">+ ₹{summary.slotSurcharge}</span>
                    </div>
                )}

                {/* Express Rush Surcharge */}
                {isExpress && summary.rawExpressCharge > 0 && (
                    <div className="flex justify-between items-center text-xs text-amber-400">
                        <span className="font-medium">1-4h Express Rush Surcharge</span>
                        <div className="text-right font-bold">
                            {summary.isTravelFree ? (
                                <span className="text-[#08B36A] uppercase text-[10px] font-black">FREE</span>
                            ) : (
                                <span>+ ₹{summary.rawExpressCharge}</span>
                            )}
                        </div>
                    </div>
                )}

                {/* Medical Supplies & Consumables */}
                {summary.consumableTotal > 0 && (
                    <div className="flex justify-between text-xs text-[#08B36A]">
                        <span className="font-medium">Medical Supplies & Consumables</span>
                        <span className="font-bold">+ ₹{summary.consumableTotal}</span>
                    </div>
                )}

                {/* Taxes / GST */}
                {summary.taxAmount > 0 && (
                    <div className="flex justify-between text-xs text-slate-400">
                        <span>GST & Taxes</span>
                        <span className="font-bold text-slate-200">+ ₹{summary.taxAmount}</span>
                    </div>
                )}

                {/* Coupon Discount */}
                {summary.couponDiscount > 0 && (
                    <div className="flex justify-between text-xs text-rose-400">
                        <span className="font-medium">Promo Coupon Discount</span>
                        <span className="font-bold">- ₹{Math.round(summary.couponDiscount)}</span>
                    </div>
                )}
                
                {/* Grand Total Row */}
                <div className="pt-3 border-t border-slate-700/60 flex justify-between items-end">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Payable</p>
                        <span className="text-2xl font-black text-[#08B36A]">₹{summary.totalPrice}</span>
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Payment Mode</span>
                        <span className="text-xs font-black text-white flex items-center gap-1 justify-end">
                            {paymentMethod === "COD" ? <><FaMoneyBillWave className="text-amber-400" /> Pay on Arrival</> : <><FaCreditCard className="text-emerald-400" /> Online Payment</>}
                        </span>
                    </div>
                </div>
            </div>

            {/* 7. Confirm & Book CTA */}
            <button
                type="button"
                onClick={() => {
                    onProceed({
                        isExpress,
                        expressCharge: summary.activeExpressCharge,
                        travelFee: summary.activeTravelFee,
                        appliedCoupon,
                        discountAmount: summary.couponDiscount,
                        finalTotal: summary.totalPrice,
                        subTotal: summary.totalPrice + summary.couponDiscount
                    });
                }}
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