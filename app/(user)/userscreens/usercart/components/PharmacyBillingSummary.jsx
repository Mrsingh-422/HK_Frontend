"use client";

import React from 'react';
import { FaShieldAlt, FaExclamationCircle, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';

const PharmacyBillingSummary = ({ totals, selectedAddress, subtotal, needsPrescription, prescriptionFiles, onConfirm, isSubmitting }) => {
    
    const handleProceed = () => {
        if (isSubmitting) return;

        // Validation Check
        if (!selectedAddress) return toast.error("Please select a delivery address");
        
        if (needsPrescription && prescriptionFiles.length === 0) {
            return toast.error("Please upload prescription images to continue");
        }

        // Trigger the confirm function passed from parent
        onConfirm();
    };

    const isPrescriptionMissing = needsPrescription && prescriptionFiles.length === 0;

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-5">Bill Details</h2>
            <div className="space-y-3 pb-5 border-b border-gray-100 text-sm">
                <div className="flex justify-between text-gray-500 font-medium">
                    <span>Cart Total</span>
                    <span className="text-gray-900 font-bold">₹{totals.subtotal.toLocaleString()}</span>
                </div>

                {totals.discount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                        <span>Coupon Discount</span>
                        <span>-₹{totals.discount.toLocaleString()}</span>
                    </div>
                )}

                <div className="flex justify-between text-gray-500 font-medium">
                    <span>Delivery Fee</span>
                    <span className={`font-bold ${totals.shippingFee === 0 ? 'text-emerald-600' : 'text-gray-900'}`}>
                        {totals.shippingFee === 0 ? 'FREE' : `+₹${totals.shippingFee}`}
                    </span>
                </div>

                {totals.fastFee > 0 && (
                    <div className="flex justify-between text-gray-500 font-medium">
                        <span>Fast Delivery Charge</span>
                        <span className="text-gray-900 font-bold">+₹{totals.fastFee}</span>
                    </div>
                )}

                {totals.slotFee > 0 && (
                    <div className="flex justify-between text-gray-500 font-medium">
                        <span>Slot Charge</span>
                        <span className="text-gray-900 font-bold">+₹{totals.slotFee}</span>
                    </div>
                )}

                {totals.tax > 0 && (
                    <div className="flex justify-between text-gray-500 font-medium">
                        <span>Taxes & Charges</span>
                        <span className="text-gray-900 font-bold">+₹{totals.tax}</span>
                    </div>
                )}

                {totals.shippingFee > 0 && (
                    <div className="bg-amber-50 border border-amber-100 p-3 rounded-lg">
                        <p className="text-[10px] text-amber-700 font-bold text-center">
                            Tip: Add ₹{totals.freeThreshold - subtotal} more for FREE Delivery
                        </p>
                    </div>
                )}
            </div>

            <div className="py-6 flex justify-between items-center">
                <span className="font-bold text-gray-900 text-xs uppercase tracking-widest">TOTAL PAYABLE</span>
                <span className="text-2xl font-black text-gray-900">₹{Math.round(totals.total).toLocaleString()}</span>
            </div>

            {isPrescriptionMissing && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-2">
                    <FaExclamationCircle className="text-rose-500 shrink-0" size={14} />
                    <p className="text-[10px] text-rose-600 font-bold uppercase">Prescription image is required</p>
                </div>
            )}

            <button
                onClick={handleProceed}
                disabled={isSubmitting || isPrescriptionMissing}
                className={`w-full py-4.5 rounded-xl font-bold text-sm shadow-xl flex items-center justify-center gap-2 uppercase transition-all 
                ${(isPrescriptionMissing || isSubmitting)
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
                    : "bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95"}`}
            >
                {isSubmitting ? (
                    <><FaSpinner className="animate-spin" /> Placing Order...</>
                ) : (
                    <> {!selectedAddress ? "Select Address" : "Confirm & Pay"} <FaShieldAlt /></>
                )}
            </button>
        </div>
    );
};

export default PharmacyBillingSummary;