"use client";

import React from 'react';
import { FaTicketAlt, FaCheckCircle, FaSpinner, FaPercentage, FaTimes, FaTag } from 'react-icons/fa';

const PharmacyCouponSection = ({ 
    availableCoupons = [], 
    couponCode = "", 
    setCouponCode, 
    appliedCouponName, 
    setAppliedCouponName, 
    setServerDiscount, 
    handleApplyCoupon, 
    isValidating,
    couponError,
    onRemoveCoupon
}) => {
    const handleRemove = () => {
        if (typeof onRemoveCoupon === 'function') {
            onRemoveCoupon();
        } else {
            setAppliedCouponName(null);
            if (typeof setServerDiscount === 'function') setServerDiscount(0);
        }
    };

    const handleSelectCoupon = (name) => {
        if (appliedCouponName === name) return;
        if (typeof setCouponCode === 'function') {
            setCouponCode(name);
        }
        if (typeof handleApplyCoupon === 'function') {
            handleApplyCoupon(name);
        }
    };

    return (
        <div className="bg-white border border-slate-200/90 rounded-[2rem] p-6 shadow-xs space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#08B36A] flex items-center justify-center border border-emerald-100 shadow-xs">
                        <FaTicketAlt size={14} />
                    </div>
                    <div>
                        <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider">
                            Apply Promo Coupon
                        </h3>
                        <p className="text-[10px] text-slate-500 font-semibold">Save extra on your medicine order</p>
                    </div>
                </div>

                {appliedCouponName && (
                    <span className="text-[9px] font-black uppercase text-[#08B36A] bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        Active
                    </span>
                )}
            </div>

            {/* Input & Apply Button Bar */}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <input
                        type="text"
                        placeholder={appliedCouponName ? `APPLIED: ${appliedCouponName}` : "ENTER PROMO CODE"}
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        disabled={!!appliedCouponName}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-black uppercase outline-none focus:border-[#08B36A] focus:bg-white transition-all disabled:opacity-75 text-slate-900 placeholder:text-slate-400"
                    />
                </div>

                {appliedCouponName ? (
                    <button 
                        type="button"
                        onClick={handleRemove} 
                        className="bg-rose-50 hover:bg-rose-100 text-rose-600 px-4 rounded-xl text-[11px] font-black uppercase tracking-wider border border-rose-200 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                        <FaTimes size={10} /> Remove
                    </button>
                ) : (
                    <button 
                        type="button"
                        onClick={() => handleApplyCoupon(couponCode)} 
                        disabled={isValidating || !couponCode.trim()} 
                        className="bg-[#08B36A] hover:bg-[#079c5c] text-white px-5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-600/20 active:scale-95 cursor-pointer shrink-0"
                    >
                        {isValidating ? <FaSpinner className="animate-spin" size={12} /> : "Apply"}
                    </button>
                )}
            </div>

            {/* Error Message */}
            {couponError && (
                <p className="text-[10px] font-bold text-rose-500 pl-1">
                    {couponError}
                </p>
            )}

            {/* Available Coupons List */}
            {availableCoupons.length > 0 && (
                <div className="space-y-2.5 pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block pl-1">
                        Available Offers
                    </span>

                    <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1 scrollbar-none">
                        {availableCoupons.map((coupon) => {
                            const isApplied = appliedCouponName === coupon.couponName;

                            return (
                                <div
                                    key={coupon._id}
                                    onClick={() => handleSelectCoupon(coupon.couponName)}
                                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer select-none flex items-center justify-between gap-3 ${
                                        isApplied 
                                            ? "border-[#08B36A] bg-emerald-50/60 ring-2 ring-[#08B36A]/20 shadow-xs" 
                                            : "border-slate-200 bg-white hover:border-[#08B36A] hover:bg-emerald-50/20 shadow-xs"
                                    }`}
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs shrink-0 ${
                                            isApplied ? "bg-[#08B36A] text-white" : "bg-emerald-50 text-[#08B36A]"
                                        }`}>
                                            <FaPercentage size={11} />
                                        </div>
                                        <div className="truncate">
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-black text-xs text-slate-900 tracking-tight">
                                                    {coupon.couponName}
                                                </span>
                                            </div>
                                            {coupon.description ? (
                                                <p className="text-slate-500 text-[10px] font-medium truncate mt-0.5 max-w-[200px]">
                                                    {coupon.description}
                                                </p>
                                            ) : coupon.minOrderAmount ? (
                                                <p className="text-slate-400 text-[10px] font-medium truncate mt-0.5">
                                                    Min order ₹{coupon.minOrderAmount}
                                                </p>
                                            ) : null}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className="text-[11px] font-black text-[#08B36A]">
                                            {coupon.discountPercentage ? `${coupon.discountPercentage}% OFF` : "OFFER"}
                                        </span>
                                        {isApplied ? (
                                            <FaCheckCircle className="text-[#08B36A]" size={16} />
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleSelectCoupon(coupon.couponName);
                                                }}
                                                className="bg-slate-100 hover:bg-[#08B36A] text-slate-700 hover:text-white px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer"
                                            >
                                                Apply
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PharmacyCouponSection;