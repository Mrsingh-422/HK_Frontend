import React from 'react';
import { FaShieldAlt } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const PharmacyBillingSummary = ({ totals, selectedAddress, subtotal }) => {
    const router = useRouter();

    const handleProceed = () => {
        if (!selectedAddress) return toast.error("Please select a delivery address");
        router.push('/checkout/pharmacy');
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-5">Bill Details</h2>
            <div className="space-y-3 pb-5 border-b border-gray-100 text-sm">
                <div className="flex justify-between text-gray-500 font-medium"><span>Cart Total</span><span className="text-gray-900 font-bold">₹{totals.subtotal.toLocaleString()}</span></div>

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

                {totals.shippingFee > 0 && (
                    <div className="bg-amber-50 border border-amber-100 p-3 rounded-lg">
                        <p className="text-[10px] text-amber-700 font-bold text-center">
                            Tip: Add ₹{500 - subtotal} more for FREE Delivery
                        </p>
                    </div>
                )}
            </div>

            <div className="py-6 flex justify-between items-center">
                <span className="font-bold text-gray-900 text-xs uppercase tracking-widest">TOTAL PAYABLE</span>
                <span className="text-2xl font-black text-gray-900">₹{Math.round(totals.total).toLocaleString()}</span>
            </div>

            <button
                onClick={handleProceed}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4.5 rounded-xl font-bold text-sm shadow-xl flex items-center justify-center gap-2 uppercase"
            >
                {!selectedAddress ? "Select Address" : "Confirm & Pay"} <FaShieldAlt />
            </button>
        </div>
    );
};

export default PharmacyBillingSummary;