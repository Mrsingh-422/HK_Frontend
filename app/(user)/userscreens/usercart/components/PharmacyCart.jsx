"use client";

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FaPills, FaSpinner, FaTruck, FaFilePrescription, FaPrescriptionBottleAlt, FaMinus, FaPlus } from 'react-icons/fa';
import { useCart } from '@/app/context/CartContext';
import toast from 'react-hot-toast';
import UserAPI from '@/app/services/UserAPI';

// Import New Modular Components
import PharmacyAddressSection from './PharmacyAddressSection';
import PharmacyCouponSection from './PharmacyCouponSection';
import PharmacyBillingSummary from './PharmacyBillingSummary';

const PharmacyCart = () => {
    const router = useRouter();
    const { pharmacyCart, updatePharmacyCartQuantity, loading, removePharmacyItem } = useCart();

    const [availableCoupons, setAvailableCoupons] = useState([]);
    const [couponCode, setCouponCode] = useState("");
    const [appliedCouponName, setAppliedCouponName] = useState(null);
    const [serverDiscount, setServerDiscount] = useState(0);
    const [isValidating, setIsValidating] = useState(false);

    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [isAddressLoading, setIsAddressLoading] = useState(false);

    const pharmacyItems = useMemo(() => pharmacyCart?.items || [], [pharmacyCart]);
    const pharmacyId = useMemo(() => pharmacyCart?.pharmacyId?._id, [pharmacyCart]);
    const pharmacyName = useMemo(() => pharmacyCart?.pharmacyId?.name, [pharmacyCart]);

    const subtotal = useMemo(() => {
        return pharmacyItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    }, [pharmacyItems]);

    const needsPrescription = useMemo(() => {
        return pharmacyItems.some(item => item.medicineId?.prescription_required === "YES");
    }, [pharmacyItems]);

    const fetchSuggested = useCallback(async () => {
        if (pharmacyItems.length === 0) return;
        try {
            const response = await UserAPI.getCouponsForCart();
            if (response.success) setAvailableCoupons(response.data);
        } catch (error) { console.error(error); }
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
        } catch (error) { console.error(error); }
        finally { setIsAddressLoading(false); }
    }, []);

    useEffect(() => {
        fetchSuggested();
        fetchAddresses();
    }, [fetchSuggested, fetchAddresses]);

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
            toast.error(error.response?.data?.message || "Invalid Coupon");
        } finally { setIsValidating(false); }
    };

    useEffect(() => {
        if (appliedCouponName) handleApplyCoupon(appliedCouponName);
    }, [subtotal]);

    const totals = useMemo(() => {
        const discountedAmount = Math.max(0, subtotal - serverDiscount);
        const shippingFee = (subtotal >= 500 || subtotal === 0) ? 0 : 40;
        return { subtotal, discount: serverDiscount, shippingFee, total: discountedAmount + shippingFee };
    }, [subtotal, serverDiscount]);

    if (loading && pharmacyItems.length === 0) return <div className="p-20 text-center font-bold text-slate-400 animate-pulse">Syncing Pharmacy Cart...</div>;

    if (pharmacyItems.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <FaPills className="text-slate-100 text-7xl mb-6" />
                <h2 className="text-2xl font-black text-slate-800">Pharmacy Cart is Empty</h2>
                <button onClick={() => router.push('/pharmacy')} className="mt-8 bg-emerald-600 text-white px-10 py-3 rounded-2xl font-black uppercase text-sm">Shop Medicines</button>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    <div className="flex-1 w-full space-y-4">
                        
                        {/* 1. MODULAR ADDRESS SECTION */}
                        <PharmacyAddressSection 
                            addresses={addresses} 
                            selectedAddress={selectedAddress} 
                            setSelectedAddress={setSelectedAddress} 
                            isLoading={isAddressLoading} 
                        />

                        <div className="space-y-3">
                            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex justify-between items-center">
                                <p className="text-emerald-700 text-sm font-bold uppercase">Ordering From: <span className="font-black">{pharmacyName}</span></p>
                                <div className="flex items-center gap-2 text-emerald-600 font-bold text-[10px] uppercase"><FaTruck /> Fast Home Delivery</div>
                            </div>
                            {needsPrescription && (
                                <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 flex items-center gap-3">
                                    <FaFilePrescription className="text-rose-500 shrink-0" size={18} />
                                    <p className="text-[10px] text-rose-600 font-bold uppercase">Note: Some items require a doctor's prescription.</p>
                                </div>
                            )}
                        </div>

                        {pharmacyItems.map((item) => (
                            <div key={item._id} className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-5 shadow-sm">
                                <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100 flex-shrink-0 overflow-hidden">
                                    {item.medicineId?.image_url?.[0] ? <img src={item.medicineId.image_url[0]} className="w-full h-full object-contain p-1" /> : <FaPills size={24} className="text-emerald-600 opacity-20" />}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-lg leading-tight">{item.name}</h3>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-100 px-2 py-0.5 rounded inline-block mt-1">{item.medicineId?.manufacturers}</span>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-900 text-lg">₹{(item.price * item.quantity).toLocaleString()}</p>
                                            <button onClick={() => removePharmacyItem(item.medicineId._id)} className="text-xs text-rose-500 font-semibold hover:underline">Remove</button>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-center border border-gray-200 rounded-lg w-fit overflow-hidden">
                                        <button onClick={() => updatePharmacyCartQuantity(item.medicineId._id, 'dec')} className="px-3 py-1 bg-gray-50"><FaMinus size={10} /></button>
                                        <span className="px-4 text-sm font-bold">{item.quantity}</span>
                                        <button onClick={() => updatePharmacyCartQuantity(item.medicineId._id, 'inc')} className="px-3 py-1 bg-gray-50"><FaPlus size={10} /></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="w-full lg:w-[400px] space-y-6">
                        {/* 2. MODULAR COUPON SECTION */}
                        <PharmacyCouponSection 
                            availableCoupons={availableCoupons}
                            couponCode={couponCode}
                            setCouponCode={setCouponCode}
                            appliedCouponName={appliedCouponName}
                            setAppliedCouponName={setAppliedCouponName}
                            setServerDiscount={setServerDiscount}
                            handleApplyCoupon={handleApplyCoupon}
                            isValidating={isValidating}
                        />

                        {/* 3. MODULAR BILLING SUMMARY */}
                        <PharmacyBillingSummary 
                            totals={totals} 
                            selectedAddress={selectedAddress} 
                            subtotal={subtotal} 
                        />
                    </div>
                </div>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
            `}</style>
        </div>
    );
};

export default PharmacyCart;