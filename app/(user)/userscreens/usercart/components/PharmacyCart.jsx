"use client";

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    FaPlus, FaMinus, FaShieldAlt,
    FaPills, FaTag, FaSpinner, FaCheckCircle, FaTicketAlt, FaMapMarkerAlt, FaTruck, FaFilePrescription
} from 'react-icons/fa';
import { useCart } from '@/app/context/CartContext';
import toast from 'react-hot-toast';
import UserAPI from '@/app/services/UserAPI';

const PharmacyCart = () => {
    const router = useRouter();

    // Get Pharmacy specific data and functions from your CartContext
    const {
        pharmacyCart,
        updatePharmacyCartQuantity,
        loading,
        removePharmacyItem
    } = useCart();

    // Local UI State
    const [availableCoupons, setAvailableCoupons] = useState([]);
    const [couponCode, setCouponCode] = useState("");
    const [appliedCouponName, setAppliedCouponName] = useState(null);
    const [serverDiscount, setServerDiscount] = useState(0);
    const [isValidating, setIsValidating] = useState(false);

    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [isAddressLoading, setIsAddressLoading] = useState(false);

    // Mappings based on your JSON structure
    const pharmacyItems = useMemo(() => pharmacyCart?.items || [], [pharmacyCart]);
    const pharmacyId = useMemo(() => pharmacyCart?.pharmacyId?._id, [pharmacyCart]);
    const pharmacyName = useMemo(() => pharmacyCart?.pharmacyId?.name, [pharmacyCart]);

    // Financial Calculations
    const subtotal = useMemo(() => {
        return pharmacyItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    }, [pharmacyItems]);

    const needsPrescription = useMemo(() => {
        return pharmacyItems.some(item => item.medicineId?.prescription_required === "YES");
    }, [pharmacyItems]);

    // Fetch Coupons and Addresses
    const fetchSuggested = useCallback(async () => {
        if (pharmacyItems.length === 0) return;
        try {
            const response = await UserAPI.getCouponsForCart();
            if (response.success) setAvailableCoupons(response.data);
        } catch (error) {
            console.error("Fetch Coupons Error:", error);
        }
    }, [pharmacyItems.length]);

    const fetchAddresses = useCallback(async () => {
        setIsAddressLoading(true);
        try {
            const res = await UserAPI.getUserAddresses();
            if (res.success) {
                setAddresses(res.data);
                const defaultAddr = res.data.find(a => a.isDefault);
                if (defaultAddr) setSelectedAddress(defaultAddr);
            }
        } catch (error) {
            console.error("Error fetching addresses:", error);
        } finally {
            setIsAddressLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSuggested();
        fetchAddresses();
    }, [fetchSuggested, fetchAddresses]);

    // Coupon Logic
    const handleApplyCoupon = async (name) => {
        const codeToApply = name || couponCode;
        if (!codeToApply) return toast.error("Please enter a coupon code");
        if (!pharmacyId) return toast.error("Pharmacy information missing");

        setIsValidating(true);
        try {
            const res = await UserAPI.validateCouponCart(codeToApply.toUpperCase(), pharmacyId, subtotal);
            if (res.success) {
                setAppliedCouponName(codeToApply.toUpperCase());
                setServerDiscount(res.discount);
                setCouponCode("");
                toast.success(`Coupon Applied! Saved ₹${res.discount}`);
            }
        } catch (error) {
            setAppliedCouponName(null);
            setServerDiscount(0);
            toast.error(error.response?.data?.message || "Invalid or Expired Coupon");
        } finally {
            setIsValidating(false);
        }
    };

    // Recalculate coupon if price/quantity changes
    useEffect(() => {
        if (appliedCouponName) handleApplyCoupon(appliedCouponName);
    }, [subtotal]);

    const totals = useMemo(() => {
        const discountedAmount = Math.max(0, subtotal - serverDiscount);
        // Delivery Charge Logic (Free above 500 as per common pharmacy standards)
        const shippingFee = (subtotal >= 500 || subtotal === 0) ? 0 : 40;
        return {
            subtotal,
            discount: serverDiscount,
            shippingFee,
            total: discountedAmount + shippingFee
        };
    }, [subtotal, serverDiscount]);

    const handleProceed = () => {
        if (!selectedAddress) return toast.error("Please select a delivery address");
        router.push('/checkout/pharmacy');
    };

    if (loading && pharmacyItems.length === 0) {
        return <div className="p-20 text-center font-bold text-slate-400 animate-pulse uppercase tracking-widest">Syncing Pharmacy Cart...</div>;
    }

    if (pharmacyItems.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
                <FaPills className="text-slate-100 text-7xl mb-6" />
                <h2 className="text-2xl font-black text-slate-800">Pharmacy Cart is Empty</h2>
                <button onClick={() => router.push('/pharmacy')} className="mt-8 bg-emerald-600 text-white px-10 py-3 rounded-2xl font-black uppercase text-sm tracking-widest">Shop Medicines</button>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex flex-col lg:flex-row gap-8 items-start">

                    {/* LEFT: ADDRESS & MEDICINES */}
                    <div className="flex-1 w-full space-y-4">

                        {/* 1. ADDRESS SECTION */}
                        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Delivery Address</h3>
                                <button onClick={() => router.push('/profile/addresses')} className="text-[10px] font-bold text-emerald-600 uppercase hover:underline">+ Add New</button>
                            </div>

                            {isAddressLoading ? (
                                <div className="flex justify-center py-4"><FaSpinner className="animate-spin text-emerald-500" /></div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {addresses.map((addr) => (
                                        <div
                                            key={addr._id}
                                            onClick={() => setSelectedAddress(addr)}
                                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedAddress?._id === addr._id ? 'border-emerald-600 bg-emerald-50' : 'border-gray-100 bg-white hover:border-gray-200'}`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <FaMapMarkerAlt className={selectedAddress?._id === addr._id ? 'text-emerald-600 mt-1' : 'text-gray-400 mt-1'} />
                                                <div className="flex-1">
                                                    <div className="flex justify-between">
                                                        <span className="text-[10px] font-black text-gray-900 uppercase">{addr.addressType}</span>
                                                        {addr.isDefault && <span className="text-[8px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold">DEFAULT</span>}
                                                    </div>
                                                    <p className="text-[11px] font-bold text-gray-700 mt-1">{addr.name}</p>
                                                    <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed line-clamp-2">
                                                        {addr.houseNo}, {addr.sector}, {addr.city}, {addr.state} - {addr.pincode}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* 2. STORE INFO & PRESCRIPTION ALERT */}
                        <div className="space-y-3">
                            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex justify-between items-center">
                                <p className="text-emerald-700 text-sm font-bold uppercase tracking-tight">Ordering From: <span className="font-black">{pharmacyName}</span></p>
                                <div className="flex items-center gap-2 text-emerald-600 font-bold text-[10px] uppercase">
                                    <FaTruck /> Fast Home Delivery
                                </div>
                            </div>

                            {needsPrescription && (
                                <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 flex items-center gap-3">
                                    <FaFilePrescription className="text-rose-500 shrink-0" size={18} />
                                    <p className="text-[10px] text-rose-600 font-bold uppercase leading-tight">
                                        Note: Some items require a doctor's prescription. You can upload it in the next step.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* 3. MEDICINE CARDS */}
                        {pharmacyItems.map((item) => (
                            <div key={item._id} className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-5 shadow-sm">
                                <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100 flex-shrink-0 overflow-hidden">
                                    {item.medicineId?.image_url?.[0] ? (
                                        <img src={item.medicineId.image_url[0]} alt={item.name} className="w-full h-full object-contain p-1" />
                                    ) : (
                                        <FaPills size={24} className="text-emerald-600 opacity-20" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-lg leading-tight">{item.name}</h3>
                                            <div className="flex flex-wrap gap-2 mt-1">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-100 px-2 py-0.5 rounded inline-block">
                                                    {item.medicineId?.manufacturers}
                                                </span>
                                                {item.medicineId?.prescription_required === "YES" && (
                                                    <span className="text-[9px] font-black text-rose-500 uppercase bg-rose-50 border border-rose-100 px-2 py-0.5 rounded">Rx Req.</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-900 text-lg">₹{(item.price * item.quantity).toLocaleString()}</p>
                                            <button
                                                onClick={() => removePharmacyItem(item.medicineId._id)}
                                                // onClick={() => alert(item._id)} 
                                                className="text-xs text-rose-500 font-semibold hover:underline"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>

                                    {/* QUANTITY PICKER - Uses medicineId._id as per context update function */}
                                    <div className="mt-4 flex items-center border border-gray-200 rounded-lg w-fit overflow-hidden">
                                        <button
                                            onClick={() => updatePharmacyCartQuantity(item.medicineId._id, 'dec')}
                                            className="px-3 py-1 bg-gray-50 hover:bg-gray-100"
                                        >
                                            <FaMinus size={10} />
                                        </button>
                                        <span className="px-4 text-sm font-bold text-gray-800">{item.quantity}</span>
                                        <button
                                            onClick={() => updatePharmacyCartQuantity(item.medicineId._id, 'inc')}
                                            className="px-3 py-1 bg-gray-50 hover:bg-gray-100"
                                        >
                                            <FaPlus size={10} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* RIGHT: BILLING & OFFERS */}
                    <div className="w-full lg:w-[400px] space-y-6">

                        {/* COUPON SECTION */}
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
                                    <button
                                        onClick={() => handleApplyCoupon()}
                                        disabled={isValidating || !couponCode}
                                        className="bg-gray-900 text-white px-6 rounded-lg text-xs font-bold uppercase transition-all active:scale-95"
                                    >
                                        {isValidating ? <FaSpinner className="animate-spin" /> : "APPLY"}
                                    </button>
                                )}
                            </div>

                            <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                                {availableCoupons.map((coupon) => (
                                    <div
                                        key={coupon._id}
                                        onClick={() => !appliedCouponName && coupon.isApplicable && handleApplyCoupon(coupon.couponName)}
                                        className={`p-3 rounded-lg border text-xs transition-all ${appliedCouponName === coupon.couponName ? "border-emerald-500 bg-emerald-50" : coupon.isApplicable ? "border-gray-100 bg-gray-50 cursor-pointer hover:border-gray-200" : "opacity-40 grayscale cursor-not-allowed"}`}
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

                        {/* ORDER SUMMARY */}
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
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4.5 rounded-xl font-bold text-sm transition-all shadow-xl shadow-emerald-100 flex items-center justify-center gap-2 uppercase active:scale-[0.98]"
                            >
                                {!selectedAddress ? "Select Address" : "Confirm & Pay"} <FaShieldAlt />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
            `}</style>
        </div>
    );
};

export default PharmacyCart;