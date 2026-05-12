"use client";
import React, { useState, useEffect } from "react";
import { FaCalendarCheck, FaClock, FaInfoCircle, FaStethoscope, FaUser, FaMapMarkerAlt, FaBoxOpen, FaTicketAlt, FaTimesCircle, FaPercentage, FaBolt } from "react-icons/fa";
import UserAPI from "@/app/services/UserAPI";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function BookingSummary({ bookingData, slotInfo, selectedAddress, selectedConsumables = [], onProceed }) {
    const [couponCode, setCouponCode] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [availableCoupons, setAvailableCoupons] = useState([]);
    const [couponError, setCouponError] = useState("");
    const [isValidating, setIsValidating] = useState(false);
    const [deliveryConfig, setDeliveryConfig] = useState(null);
    const [isExpress, setIsExpress] = useState(false);

    // LOGIC UPDATE: Use slotInfo.totalPrice which already handles (Base * Days/Hours)
    const serviceBaseTotal = slotInfo.totalPrice || 0;
    const consumableTotal = selectedConsumables.reduce((sum, item) => sum + (item.price || 0), 0);
    const expressCharge = isExpress ? (deliveryConfig?.fastDeliveryExtra || 0) : 0;
    
    const subTotal = serviceBaseTotal + consumableTotal + expressCharge;

    useEffect(() => {
        const fetchData = async () => {
            if (!bookingData.nurseId) return;
            try {
                // 1. Fetch Coupons
                const couponRes = await UserAPI.getNurseCoupon(bookingData.nurseId);
                if (couponRes.success) setAvailableCoupons(couponRes.data || []);
                
                // 2. Fetch Delivery Config using serviceId from session
                const storedData = typeof window !== "undefined" ? sessionStorage.getItem('pendingNurseBooking') : null;
                const parsedDetails = storedData ? JSON.parse(storedData) : {};
                const serviceId = parsedDetails.serviceId;

                if (serviceId) {
                    const configRes = await UserAPI.nurseDeliveryConfig(serviceId);
                    if (configRes.success) setDeliveryConfig(configRes.data);
                }
            } catch (err) {
                console.error("Summary Init Error:", err);
            }
        };
        fetchData();
    }, [bookingData.nurseId]);

    let discountAmount = 0;
    if (appliedCoupon) {
        discountAmount = (subTotal * appliedCoupon.discountPercentage) / 100;
        if (appliedCoupon.maxDiscount && discountAmount > appliedCoupon.maxDiscount) {
            discountAmount = appliedCoupon.maxDiscount;
        }
    }

    const finalTotal = subTotal - discountAmount;

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
                    setCouponError(`Min. order is ₹${couponData.minOrderAmount}`);
                    return;
                }
                setAppliedCoupon(couponData);
                setCouponCode(couponData.couponName);
            } else {
                setCouponError(res.message || "Invalid Coupon");
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
        <div className="bg-slate-900 rounded-[3rem] p-8 text-white sticky top-28 shadow-2xl">
            <div className="flex items-center gap-4 mb-8">
                <img src={getImageUrl(bookingData.nurseImage)} className="w-14 h-14 rounded-2xl object-cover border-2 border-white/10" alt="Nurse" />
                <div>
                    <p className="text-[9px] font-black uppercase text-teal-400">Professional</p>
                    <h3 className="font-bold text-white truncate max-w-[150px]">{bookingData.nurseName}</h3>
                </div>
            </div>

            <div className="space-y-6">
                {/* Express Service Option */}
                <div 
                    onClick={() => setIsExpress(!isExpress)}
                    className={`p-4 rounded-[2rem] border-2 cursor-pointer transition-all flex items-center justify-between ${
                        isExpress ? "border-teal-500 bg-teal-500/10" : "border-white/5 bg-white/5"
                    }`}
                >
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${isExpress ? "bg-teal-500" : "bg-slate-800"}`}>
                            <FaBolt className={isExpress ? "text-white" : "text-slate-500"} />
                        </div>
                        <div>
                            <p className="text-[11px] font-black">Express Service</p>
                            <p className="text-[9px] text-slate-500 font-bold uppercase">Arrival in 60 mins</p>
                        </div>
                    </div>
                    <p className={`text-sm font-black ${isExpress ? "text-teal-400" : "text-slate-400"}`}>
                        {deliveryConfig ? `+₹${deliveryConfig.fastDeliveryExtra}` : "..."}
                    </p>
                </div>

                {/* Coupon Section */}
                <div className="space-y-4 bg-white/5 p-5 rounded-[2.5rem] border border-white/5">
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Coupons</p>
                    {!appliedCoupon ? (
                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <input 
                                    type="text" placeholder="CODE" value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                    className="flex-1 bg-slate-800 border-none rounded-2xl py-3 px-4 text-xs font-bold"
                                />
                                <button onClick={() => handleApplyCoupon()} disabled={isValidating || !couponCode} className="bg-teal-500 px-5 rounded-2xl text-[10px] font-black uppercase">
                                    {isValidating ? "..." : "Apply"}
                                </button>
                            </div>
                            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                                {availableCoupons.map((cp) => (
                                    <button key={cp._id} onClick={() => handleApplyCoupon(cp.couponName)} className="flex-shrink-0 bg-slate-800 p-3 rounded-2xl flex items-center gap-2">
                                        <FaPercentage className="text-teal-500 text-[10px]" />
                                        <span className="text-[10px] font-black text-white">{cp.couponName}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between bg-teal-500/10 p-4 rounded-2xl">
                            <div className="flex items-center gap-3">
                                <FaTicketAlt className="text-teal-500" />
                                <p className="text-[11px] font-black text-teal-400">{appliedCoupon.couponName}</p>
                            </div>
                            <button onClick={() => setAppliedCoupon(null)}><FaTimesCircle className="text-rose-500 size-5" /></button>
                        </div>
                    )}
                </div>

                {/* Price Breakdown */}
                <div className="bg-white/5 p-6 rounded-[2.5rem] border border-white/5 space-y-3">
                    <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">
                            {slotInfo.mode === "For Multiple Days" ? "Service Fee (Multi-Day)" : 
                             slotInfo.mode === "Acc. To Per/Hours" ? "Service Fee (Hourly)" : "Base Service Fee"}
                        </span>
                        <span className="font-black">₹{serviceBaseTotal}</span>
                    </div>
                    
                    {/* Surcharge is now bundled in totalPrice from SlotPicker, 
                        but if you want to show specifically the extra fees separately: */}
                    {consumableTotal > 0 && (
                        <div className="flex justify-between text-[11px] text-teal-400">
                            <span>Consumables</span>
                            <span>+ ₹{consumableTotal}</span>
                        </div>
                    )}
                    
                    {isExpress && (
                        <div className="flex justify-between text-[11px] text-teal-400">
                            <span>Express Fee</span>
                            <span>+ ₹{expressCharge}</span>
                        </div>
                    )}
                    
                    {appliedCoupon && (
                        <div className="flex justify-between text-[11px] text-teal-400">
                            <span>Discount ({appliedCoupon.discountPercentage}%)</span>
                            <span>- ₹{Math.round(discountAmount)}</span>
                        </div>
                    )}
                    
                    <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                        <div>
                            <p className="text-[9px] font-black text-slate-500 uppercase leading-none mb-1">Total Amount</p>
                            <span className="text-3xl font-black text-teal-400">₹{Math.round(finalTotal)}</span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => onProceed({
                        isExpress,
                        expressCharge,
                        appliedCoupon,
                        discountAmount,
                        finalTotal,
                        subTotal
                    })}
                    disabled={!isSelectionValid()}
                    className={`w-full py-5 rounded-[2.5rem] font-black shadow-xl flex flex-col items-center justify-center transition-all ${
                        !isSelectionValid() ? "bg-slate-800 text-slate-600" : "bg-teal-500 text-white hover:bg-teal-400"
                    }`}
                >
                    <span className="text-base">Confirm & Book</span>
                </button>
            </div>
        </div>
    );
}