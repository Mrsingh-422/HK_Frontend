"use client";
import React, { useState, useEffect } from "react";
import { FaCalendarCheck, FaClock, FaInfoCircle, FaStethoscope, FaUser, FaMapMarkerAlt, FaBoxOpen, FaTicketAlt, FaTimesCircle, FaPercentage } from "react-icons/fa";
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

    const basePrice = bookingData.basePrice || 0;
    const slotSurcharge = slotInfo.extraFee || 0;
    const consumableTotal = selectedConsumables.reduce((sum, item) => sum + (item.price || 0), 0);
    
    // Initial total before discount
    const subTotal = basePrice + slotSurcharge + consumableTotal;

    // 1. Fetch available coupons for this nurse
    useEffect(() => {
        const fetchCoupons = async () => {
            if (!bookingData.nurseId) return;
            try {
                setLoadingCoupons(true);
                const res = await UserAPI.getNurseCoupon(bookingData.nurseId);
                if (res.success) {
                    setAvailableCoupons(res.data || []);
                }
            } catch (err) {
                console.error("Failed to fetch coupons", err);
            } finally {
                setLoadingCoupons(false);
            }
        };
        fetchCoupons();
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
        if (slotInfo.startDate) {
            return new Date(slotInfo.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        }
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
                <img 
                    src={getImageUrl(bookingData.nurseImage)} 
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-white/10" 
                    alt="Nurse" 
                />
                <div>
                    <p className="text-[9px] font-black uppercase text-teal-400 tracking-wider">Assigned Professional</p>
                    <h3 className="font-bold text-white truncate max-w-[150px]">{bookingData.nurseName}</h3>
                </div>
            </div>

            <div className="space-y-6 relative z-10">
                <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Service Selected</p>
                    <div className="flex items-center gap-2">
                        <FaStethoscope className="text-teal-500 text-xs" />
                        <p className="text-sm font-black text-slate-200">{bookingData.serviceDetails?.title}</p>
                    </div>
                </div>

                <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Service Type</p>
                    <p className="text-sm font-bold text-teal-400">{getModeDisplay()}</p>
                </div>

                {bookingData.patients && bookingData.patients[0] && (
                    <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Patient Details</p>
                        <div className="flex items-center gap-2">
                            <FaUser className="text-teal-500 text-xs" />
                            <p className="font-bold text-slate-200">
                                {bookingData.patients[0].name} 
                                <span className="text-slate-500 text-xs ml-2">({bookingData.patients[0].age} yrs)</span>
                            </p>
                        </div>
                    </div>
                )}

                {selectedAddress && (
                    <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Address</p>
                        <div className="flex items-start gap-2">
                            <FaMapMarkerAlt className="text-teal-500 text-xs mt-0.5" />
                            <p className="text-xs font-medium text-slate-300">
                                {selectedAddress.houseNo}, {selectedAddress.sector}<br />
                                {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
                            </p>
                        </div>
                    </div>
                )}

                {selectedConsumables.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Medical Consumables</p>
                        {selectedConsumables.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2 bg-white/5 p-2 rounded-xl">
                                <FaBoxOpen className="text-teal-500 text-xs" />
                                <span className="text-xs font-medium flex-1">{item.itemName}</span>
                                <span className="text-xs font-black text-teal-400">₹{item.price}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Coupon Section */}
                <div className="space-y-4 bg-white/5 p-5 rounded-[2.5rem] border border-white/5">
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Promotional Coupon</p>
                    
                    {!appliedCoupon ? (
                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <FaTicketAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xs" />
                                    <input 
                                        type="text"
                                        placeholder="Enter Code"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                        className="w-full bg-slate-800 border-none rounded-2xl py-3 pl-10 pr-4 text-xs font-bold focus:ring-1 focus:ring-teal-500 transition-all uppercase placeholder:text-slate-600"
                                    />
                                </div>
                                <button 
                                    onClick={() => handleApplyCoupon()}
                                    disabled={isValidating || !couponCode}
                                    className="bg-teal-500 text-white px-5 rounded-2xl text-[10px] font-black uppercase disabled:opacity-50"
                                >
                                    {isValidating ? "..." : "Apply"}
                                </button>
                            </div>

                            {/* Available Coupons List */}
                            {availableCoupons.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-[8px] font-black text-teal-500 uppercase tracking-tighter ml-1">Available for you</p>
                                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                        {availableCoupons.map((cp) => (
                                            <button
                                                key={cp._id}
                                                onClick={() => handleApplyCoupon(cp.couponName)}
                                                className="flex-shrink-0 bg-slate-800 border border-white/5 p-3 rounded-2xl flex items-center gap-3 hover:border-teal-500/50 transition-all group"
                                            >
                                                <div className="w-8 h-8 rounded-xl bg-teal-500/10 flex items-center justify-center group-hover:bg-teal-500 transition-all">
                                                    <FaPercentage className="text-teal-500 text-[10px] group-hover:text-white" />
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-[10px] font-black text-white">{cp.couponName}</p>
                                                    <p className="text-[8px] font-bold text-slate-500 uppercase">Save {cp.discountPercentage}%</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center justify-between bg-teal-500/10 border border-teal-500/20 p-4 rounded-2xl">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
                                    <FaTicketAlt className="text-white text-sm" />
                                </div>
                                <div>
                                    <p className="text-[11px] font-black text-teal-400">{appliedCoupon.couponName}</p>
                                    <p className="text-[8px] text-teal-500/80 font-black uppercase tracking-widest">Coupon Applied Successfully</p>
                                </div>
                            </div>
                            <button onClick={removeCoupon} className="hover:scale-110 transition-transform">
                                <FaTimesCircle className="text-rose-500 size-6" />
                            </button>
                        </div>
                    )}
                    {couponError && <p className="text-[9px] text-rose-500 font-bold ml-1">{couponError}</p>}
                </div>

                <div className="h-px bg-white/10" />

                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center">
                            <FaCalendarCheck className="text-teal-400 size-3" />
                        </div>
                        <div>
                            <p className="text-[8px] font-black text-slate-500 uppercase">Date</p>
                            <span className="text-sm font-bold">{renderDate()}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center">
                            <FaClock className="text-teal-400 size-3" />
                        </div>
                        <div>
                            <p className="text-[8px] font-black text-slate-500 uppercase">Time</p>
                            <span className="text-sm font-bold">{renderTime()}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 space-y-3">
                    <div className="flex justify-between text-xs">
                        <span className="text-slate-400 font-medium">Base Service Fee</span>
                        <span className="font-black">₹{basePrice}</span>
                    </div>
                    
                    {slotSurcharge > 0 && (
                        <div className="flex justify-between text-xs text-amber-400">
                            <span className="font-medium uppercase tracking-tighter">Premium / Extra Charges</span>
                            <span className="font-black">+ ₹{slotSurcharge}</span>
                        </div>
                    )}

                    {consumableTotal > 0 && (
                        <div className="flex justify-between text-xs text-teal-400">
                            <span className="font-medium uppercase tracking-tighter">Medical Consumables</span>
                            <span className="font-black">+ ₹{consumableTotal}</span>
                        </div>
                    )}

                    {appliedCoupon && (
                        <div className="flex justify-between text-xs text-teal-400 animate-pulse">
                            <span className="font-medium uppercase tracking-tighter">Coupon Discount ({appliedCoupon.discountPercentage}%)</span>
                            <span className="font-black">- ₹{Math.round(discountAmount)}</span>
                        </div>
                    )}

                    <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                        <div>
                            <p className="text-[9px] font-black text-slate-500 uppercase leading-none mb-1">Total Payable</p>
                            <span className="text-3xl font-black text-teal-400">₹{Math.round(totalAmount)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[8px] text-slate-500 uppercase font-bold bg-white/5 px-2 py-1 rounded-md">
                            <FaInfoCircle className="text-teal-500" /> Tax Incl.
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => onProceed(appliedCoupon ? { ...appliedCoupon, discountAmount } : null)}
                    disabled={!isSelectionValid()}
                    className={`w-full py-5 rounded-[2rem] font-black transition-all shadow-xl active:scale-95 flex flex-col items-center justify-center ${
                        !isSelectionValid()
                        ? "bg-slate-800 text-slate-600 cursor-not-allowed" 
                        : "bg-teal-500 text-white hover:bg-teal-400 shadow-teal-500/20"
                    }`}
                >
                    <span className="text-base">Confirm & Book</span>
                    {!selectedAddress && <span className="text-[8px] uppercase opacity-60 mt-1">Please Select Address</span>}
                    {selectedAddress && !isSelectionValid() && slotInfo.startDate && (
                        <span className="text-[8px] uppercase opacity-60 mt-1">
                            {slotInfo.mode === "For Multiple Days" && (!slotInfo.endDate || slotInfo.startDate === slotInfo.endDate) 
                                ? "Please Select End Date" 
                                : "Please Complete Time Selection"}
                        </span>
                    )}
                    {selectedAddress && !slotInfo.startDate && (
                        <span className="text-[8px] uppercase opacity-60 mt-1">Please Select Date & Time</span>
                    )}
                </button>

                <p className="text-[9px] text-center text-slate-500 px-4">
                    By clicking confirm, you agree to our terms of home-care service and cancellation policy.
                </p>
            </div>
        </div>
    );
}