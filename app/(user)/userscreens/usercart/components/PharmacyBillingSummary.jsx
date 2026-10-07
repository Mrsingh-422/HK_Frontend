"use client";

import React from 'react';
import { 
    FaShieldAlt, 
    FaExclamationCircle, 
    FaSpinner, 
    FaTag, 
    FaBolt, 
    FaGem, 
    FaExclamationTriangle,
    FaLock,
    FaTruck,
    FaCheckCircle
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const PharmacyBillingSummary = ({ 
    billSummary = {}, 
    selectedAddress, 
    needsPrescription, 
    prescriptionFiles = [], 
    onConfirm, 
    isSubmitting,
    paymentMethod = "Online",
    deliveryOption = "standard"
}) => {
    
    const handleProceed = () => {
        if (isSubmitting) return;

        // Validation Checks
        if (!selectedAddress) {
            return toast.error("Please select a delivery address");
        }
        
        if (needsPrescription && prescriptionFiles.length === 0) {
            return toast.error("Prescription is required for one or more medicines. Please upload prescription images.");
        }

        // Trigger confirm order handler
        onConfirm();
    };

    const isPrescriptionMissing = needsPrescription && prescriptionFiles.length === 0;
    const subBenefit = billSummary.subscriptionBenefit || {};

    const itemTotal = billSummary.itemTotal || 0;
    const comboSavings = billSummary.comboSavings || 0;
    const couponDiscount = billSummary.couponDiscount || 0;
    const deliveryCharge = billSummary.deliveryCharge || 0;
    const originalDeliveryCharge = billSummary.originalDeliveryCharge || deliveryCharge;
    const rapidDeliveryCharge = billSummary.rapidDeliveryCharge || 0;
    const taxes = (billSummary.cgstTotal || 0) + (billSummary.sgstTotal || 0);
    const totalAmount = billSummary.totalAmount || 0;

    return (
        <div className="bg-white border border-slate-200/90 rounded-[2rem] p-6 shadow-xs space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    Order Bill Details
                </h3>
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                    All Taxes Included
                </span>
            </div>

            {/* Charges Breakdown */}
            <div className="space-y-3 text-xs">
                {/* 1. Item Total */}
                <div className="flex justify-between text-slate-600">
                    <span className="font-medium">Items Total</span>
                    <span className="font-bold text-slate-900">₹{itemTotal.toFixed(2)}</span>
                </div>

                {/* 2. Combo / BOGO Savings */}
                {comboSavings > 0 && (
                    <div className="flex justify-between text-[#08B36A] font-bold">
                        <span>Combo / BOGO Savings</span>
                        <span>-₹{comboSavings.toFixed(2)}</span>
                    </div>
                )}

                {/* 3. Promo Discount */}
                {couponDiscount > 0 && (
                    <div className="flex justify-between text-[#08B36A] font-bold">
                        <span className="flex items-center gap-1.5">
                            <FaTag size={10} /> Promo Coupon Discount
                        </span>
                        <span>-₹{couponDiscount.toFixed(2)}</span>
                    </div>
                )}

                {/* 4. Delivery Charges (with Plan Waiver Strikethrough) */}
                <div className="flex justify-between items-center text-slate-600">
                    <div>
                        <span className="font-medium">Delivery Fee</span>
                        {subBenefit.isApplied && (
                            <span className="block text-[10px] font-bold text-[#059669]">
                                ✨ Free via {subBenefit.planName}
                            </span>
                        )}
                    </div>

                    <div className="text-right font-bold text-slate-900">
                        {subBenefit.isApplied ? (
                            <div className="flex items-center gap-1.5 justify-end">
                                <span className="line-through text-slate-400 text-[11px]">
                                    ₹{originalDeliveryCharge.toFixed(2)}
                                </span>
                                <span className="text-[#08B36A] uppercase font-black text-[10px]">
                                    FREE
                                </span>
                            </div>
                        ) : deliveryCharge === 0 ? (
                            <span className="text-[#08B36A] uppercase font-black text-[10px]">Free</span>
                        ) : (
                            <span>₹{deliveryCharge.toFixed(2)}</span>
                        )}
                    </div>
                </div>

                {/* 5. Express 60-min Fee */}
                {deliveryOption === 'fast' && (
                    <div className="flex justify-between text-amber-600 font-bold">
                        <span className="flex items-center gap-1.5">
                            <FaBolt size={10} /> Express 60-Min Fee
                        </span>
                        <span>+₹{rapidDeliveryCharge.toFixed(2)}</span>
                    </div>
                )}

                {/* 6. Taxes (CGST + SGST) */}
                {taxes > 0 && (
                    <div className="flex justify-between text-slate-500 font-medium text-[11px]">
                        <span>Taxes (CGST + SGST)</span>
                        <span>₹{taxes.toFixed(2)}</span>
                    </div>
                )}

                {/* Warning Callout when Subscription Benefit Quota is Exhausted */}
                {subBenefit.hasActiveSubscription && subBenefit.isBenefitExhausted && (
                    <div className="bg-[#FFFBEB] border border-[#F59E0B] p-3 rounded-2xl flex items-start gap-2.5 text-[#B45309] my-1">
                        <FaExclamationTriangle className="mt-0.5 shrink-0" size={13} />
                        <p className="text-[10px] font-bold leading-relaxed">
                            {subBenefit.exhaustedMessage || 
                                `Your ${subBenefit.planName} quota for free delivery has been exhausted. Standard charges have been applied.`}
                        </p>
                    </div>
                )}

                <div className="h-px bg-slate-100 my-2" />

                {/* 7. Total Amount */}
                <div className="flex justify-between items-end pt-1">
                    <div>
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">
                            Total Payable
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">Inclusive of all taxes & delivery</span>
                    </div>
                    <span className="text-2xl font-black text-[#08B36A]">
                        ₹{totalAmount.toFixed(2)}
                    </span>
                </div>
            </div>

            {/* Prescription Warning if Missing */}
            {isPrescriptionMissing && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-rose-700">
                    <FaExclamationCircle className="shrink-0 text-rose-500" size={14} />
                    <p className="text-[11px] font-bold">
                        Prescription upload is required for items in your cart.
                    </p>
                </div>
            )}

            {/* Submit / Proceed Button */}
            <button
                type="button"
                onClick={handleProceed}
                disabled={isSubmitting || isPrescriptionMissing}
                className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
                    isSubmitting || isPrescriptionMissing
                        ? "bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-200"
                        : "bg-[#08B36A] hover:bg-[#079c5c] text-white shadow-emerald-600/20 active:scale-98"
                }`}
            >
                {isSubmitting ? (
                    <>
                        <FaSpinner className="animate-spin" size={14} />
                        <span>Processing Order...</span>
                    </>
                ) : !selectedAddress ? (
                    <span>Select Delivery Address</span>
                ) : totalAmount === 0 ? (
                    <>
                        <span>Confirm Free Order</span>
                        <FaCheckCircle size={12} />
                    </>
                ) : paymentMethod === "COD" ? (
                    <>
                        <span>Place Order (Pay on Delivery)</span>
                        <FaTruck size={13} />
                    </>
                ) : (
                    <>
                        <span>Proceed to Pay ₹{totalAmount.toFixed(2)}</span>
                        <FaLock size={11} />
                    </>
                )}
            </button>

            <p className="text-[10px] text-slate-400 text-center font-bold uppercase tracking-wider flex items-center justify-center gap-1.5">
                <FaShieldAlt className="text-[#08B36A]" size={11} />
                100% Genuine Medicines & Verified Pharmacy
            </p>
        </div>
    );
};

export default PharmacyBillingSummary;