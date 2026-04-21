import React from 'react';
import { FaTicketAlt, FaCheckCircle, FaSpinner } from 'react-icons/fa';

const PharmacyCouponSection = ({ 
    availableCoupons, couponCode, setCouponCode, 
    appliedCouponName, setAppliedCouponName, 
    setServerDiscount, handleApplyCoupon, isValidating 
}) => {
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2"><FaTicketAlt className="text-emerald-500" /> Apply Coupon</h3>
            <div className="flex gap-2 mb-4">
                <input
                    type="text"
                    placeholder={appliedCouponName || "CODE123"}
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    disabled={!!appliedCouponName}
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm font-bold outline-none focus:border-emerald-500 disabled:opacity-50"
                />
                {appliedCouponName ? (
                    <button onClick={() => { setAppliedCouponName(null); setServerDiscount(0); }} className="bg-rose-50 text-rose-600 px-4 rounded-lg text-xs font-bold border border-rose-100">REMOVE</button>
                ) : (
                    <button onClick={() => handleApplyCoupon()} disabled={isValidating || !couponCode} className="bg-gray-900 text-white px-6 rounded-lg text-xs font-bold uppercase">
                        {isValidating ? <FaSpinner className="animate-spin" /> : "APPLY"}
                    </button>
                )}
            </div>

            <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                {availableCoupons.map((coupon) => (
                    <div
                        key={coupon._id}
                        onClick={() => !appliedCouponName && coupon.isApplicable && handleApplyCoupon(coupon.couponName)}
                        className={`p-3 rounded-lg border text-xs transition-all ${appliedCouponName === coupon.couponName ? "border-emerald-500 bg-emerald-50" : coupon.isApplicable ? "border-gray-100 bg-gray-50 cursor-pointer" : "opacity-40 grayscale cursor-not-allowed"}`}
                    >
                        <div className="flex justify-between font-bold text-gray-800">
                            <span>{coupon.couponName}</span>
                            {appliedCouponName === coupon.couponName && <FaCheckCircle className="text-emerald-600" />}
                        </div>
                        <p className="text-gray-500 text-[10px]">Get {coupon.discountPercentage}% OFF</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PharmacyCouponSection;