"use client";

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    FaPlus, FaMinus, FaShieldAlt,
    FaPrescriptionBottleAlt, FaTag, FaSpinner, FaArrowLeft, FaCheckCircle, FaTicketAlt
} from 'react-icons/fa';
import { useCart } from '@/app/context/CartContext';
import toast from 'react-hot-toast';
import UserAPI from '@/app/services/UserAPI';
import SlotSelectionModal from './SlotSelectionModal';

const LabCart = () => {
    const router = useRouter();
    const { cart, updateQuantity, removeItem, loading } = useCart();

    const [availableCoupons, setAvailableCoupons] = useState([]);
    const [couponCode, setCouponCode] = useState("");
    const [appliedCouponName, setAppliedCouponName] = useState(null);
    const [serverDiscount, setServerDiscount] = useState(0);
    const [isValidating, setIsValidating] = useState(false);

    // Slot Modal State
    const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);

    const labItems = useMemo(() => cart?.items || [], [cart]);
    const currentLabId = useMemo(() => cart?.labId?._id, [cart]);

    const subtotal = useMemo(() => {
        return labItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    }, [labItems]);

    const fetchSuggested = useCallback(async () => {
        if (labItems.length === 0) return;
        try {
            const response = await UserAPI.getCouponsForCart();
            if (response.success) setAvailableCoupons(response.data);
        } catch (error) {
            console.error("Fetch Coupons Error:", error);
        }
    }, [labItems.length]);

    useEffect(() => {
        fetchSuggested();
    }, [fetchSuggested]);

    const handleApplyCoupon = async (name) => {
        const codeToApply = name || couponCode;
        if (!codeToApply) return toast.error("Please enter a coupon code");
        if (!currentLabId) return toast.error("Lab information missing");

        setIsValidating(true);
        try {
            const res = await UserAPI.validateCouponCart(codeToApply.toUpperCase(), currentLabId, subtotal);
            if (res.success) {
                setAppliedCouponName(codeToApply.toUpperCase());
                setServerDiscount(res.discount);
                setCouponCode("");
                toast.success(`Coupon Applied! Saved ₹${res.discount}`);
            }
        } catch (error) {
            setAppliedCouponName(null);
            setServerDiscount(0);
            const errorMsg = error.response?.data?.message || "Invalid or Expired Coupon";
            toast.error(errorMsg);
        } finally {
            setIsValidating(false);
        }
    };

    useEffect(() => {
        if (appliedCouponName) {
            handleApplyCoupon(appliedCouponName);
        }
    }, [subtotal]);

    // Recalculate totals including slot extra fees
    const totals = useMemo(() => {
        const extraFee = selectedAppointment?.slot?.extraFee || 0;
        const discountedAmount = Math.max(0, subtotal - serverDiscount);
        const shipping = (subtotal > 500 || subtotal === 0) ? 0 : 50;
        const total = discountedAmount + shipping + extraFee;

        return { subtotal, shipping, discount: serverDiscount, extraFee, total };
    }, [subtotal, serverDiscount, selectedAppointment]);

    const handleQtyChange = (itemId, currentQty, action) => {
        if (action === 'dec' && currentQty <= 1) return toast.error("Quantity cannot be less than 1");
        updateQuantity(itemId, action);
    };

    const onSlotConfirm = (date, slot) => {
        setSelectedAppointment({ date, slot });
        setIsSlotModalOpen(false);
        toast.success(`Slot selected: ${slot.time}`);
        // Here you can proceed to checkout directly or let user click button again
    };

    const handleProceed = () => {
        if (!selectedAppointment) {
            setIsSlotModalOpen(true);
        } else {
            // Save selectedAppointment to state/storage and route to checkout
            // localStorage.setItem('bookingSlot', JSON.stringify(selectedAppointment));
            router.push('/checkout');
        }
    };

    if (loading && labItems.length === 0) {
        return <div className="p-20 text-center font-bold text-slate-400 animate-pulse uppercase tracking-widest">Loading Lab Cart...</div>;
    }

    if (labItems.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
                <FaPrescriptionBottleAlt className="text-slate-100 text-7xl mb-6" />
                <h2 className="text-2xl font-black text-slate-800">Lab Cart is Empty</h2>
                <button onClick={() => router.push('/')} className="mt-8 bg-emerald-600 text-white px-10 py-3 rounded-2xl font-black uppercase text-sm tracking-widest">Browse Tests</button>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-20">

            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex flex-col lg:flex-row gap-8 items-start">

                    {/* LEFT: LAB ITEMS */}
                    <div className="flex-1 w-full space-y-4">
                        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 mb-2 flex justify-between items-center">
                            <p className="text-emerald-700 text-sm font-bold">{cart?.labId?.name} • {cart?.categoryType}</p>
                            {selectedAppointment && (
                                <div className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                                    <FaCheckCircle /> Slot: {selectedAppointment.date} @ {selectedAppointment.slot.time}
                                </div>
                            )}
                        </div>

                        {labItems.map((item) => (
                            <div key={item._id} className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-5 shadow-sm">
                                <div className="w-16 h-16 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 flex-shrink-0"><FaPrescriptionBottleAlt size={24} /></div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-lg leading-tight">{item.name}</h3>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-100 px-2 py-0.5 rounded mt-1 inline-block">{item.productType}</span>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-900 text-lg">₹{(item.price * item.quantity).toLocaleString()}</p>
                                            <button onClick={() => removeItem(item.itemId)} className="text-xs text-rose-500 font-semibold hover:underline">Remove</button>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-center border border-gray-200 rounded-lg w-fit overflow-hidden">
                                        <button onClick={() => handleQtyChange(item.itemId, item.quantity, 'dec')} className="px-3 py-1 bg-gray-50 hover:bg-gray-100"><FaMinus size={10} /></button>
                                        <span className="px-4 text-sm font-bold">{item.quantity}</span>
                                        <button onClick={() => handleQtyChange(item.itemId, item.quantity, 'inc')} className="px-3 py-1 bg-gray-50 hover:bg-gray-100"><FaPlus size={10} /></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* RIGHT: BILLING & COUPONS */}
                    <div className="w-full lg:w-[400px] space-y-6">

                        {/* COUPON SECTION */}
                        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2"><FaTicketAlt className="text-emerald-500" /> Apply Coupon</h3>
                            <div className="flex gap-2 mb-4">
                                <input
                                    type="text"
                                    placeholder={appliedCouponName || "Enter code"}
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                    disabled={!!appliedCouponName}
                                    className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm font-bold outline-none focus:border-emerald-500 disabled:opacity-50"
                                />
                                {appliedCouponName ? (
                                    <button onClick={() => { setAppliedCouponName(null); setServerDiscount(0); }} className="bg-rose-50 text-rose-600 px-4 rounded-lg text-xs font-bold border border-rose-100">REMOVE</button>
                                ) : (
                                    <button onClick={() => handleApplyCoupon()} disabled={isValidating || !couponCode} className="bg-gray-900 text-white px-6 rounded-lg text-xs font-bold">
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
                                        <p className="text-gray-500 text-[10px]">Get {coupon.discountPercentage}% OFF (Max ₹{coupon.maxDiscount})</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* BILLING SUMMARY */}
                        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-gray-900 mb-5">Order Summary</h2>
                            <div className="space-y-3 pb-5 border-b border-gray-100 text-sm">
                                <div className="flex justify-between text-gray-500"><span>Cart Total</span><span className="text-gray-900 font-semibold">₹{totals.subtotal.toLocaleString()}</span></div>
                                {totals.discount > 0 && <div className="flex justify-between text-emerald-600 font-semibold"><span>Coupon Discount</span><span>-₹{totals.discount.toLocaleString()}</span></div>}
                                <div className="flex justify-between text-gray-500"><span>Home Collection</span><span className={`font-semibold ${totals.shipping === 0 ? "text-emerald-600" : "text-gray-900"}`}>{totals.shipping === 0 ? "FREE" : `₹${totals.shipping}`}</span></div>
                                {totals.extraFee > 0 && <div className="flex justify-between text-amber-600 font-semibold"><span>Urgent Slot Fee</span><span>+₹{totals.extraFee.toLocaleString()}</span></div>}
                            </div>
                            <div className="py-5 flex justify-between items-center">
                                <span className="font-bold text-gray-900 text-xs">TOTAL PAYABLE</span>
                                <span className="text-2xl font-bold text-gray-900">₹{Math.round(totals.total).toLocaleString()}</span>
                            </div>

                            <button onClick={handleProceed} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-2 uppercase">
                                {selectedAppointment ? "Pay Securely" : "Select Time Slot"} <FaShieldAlt />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Rendering */}
            <SlotSelectionModal
                isOpen={isSlotModalOpen}
                onClose={() => setIsSlotModalOpen(false)}
                labId={currentLabId}
                onConfirm={onSlotConfirm}
            />

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
            `}</style>
        </div>
    );
};

export default LabCart;