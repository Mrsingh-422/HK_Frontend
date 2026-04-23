"use client";

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FaPills, FaSpinner, FaTruck, FaFilePrescription, FaPrescriptionBottleAlt, FaMinus, FaPlus, FaClock, FaCalendarAlt, FaChevronRight } from 'react-icons/fa';
import { useCart } from '@/app/context/CartContext';
import toast from 'react-hot-toast';
import UserAPI from '@/app/services/UserAPI';

// Import Modular Components
import PharmacyAddressSection from './PharmacyAddressSection';
import PharmacyCouponSection from './PharmacyCouponSection';
import PharmacyBillingSummary from './PharmacyBillingSummary';
import PharmacyDeliverySection from './PharmacyDeliverySection';
import PharmacySlotModal from './PharmacySlotModal';

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

    // Delivery & Slot States
    const [deliveryOption, setDeliveryOption] = useState('fast');
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [slotFee, setSlotFee] = useState(0); // Added slot fee state
    const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);

    const pharmacyItems = useMemo(() => pharmacyCart?.items || [], [pharmacyCart]);
    const pharmacyId = useMemo(() => pharmacyCart?.pharmacyId?._id || pharmacyCart?.pharmacyId, [pharmacyCart]);
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

    // Handle changing delivery speed (resets slot fee if not slot)
    const handleSetDeliveryOption = (option) => {
        setDeliveryOption(option);
        if (option !== 'slot') {
            setSlotFee(0);
            setSelectedSlot(null);
        }
    };

    const totals = useMemo(() => {
        const discountedAmount = Math.max(0, subtotal - serverDiscount);
        const shippingFee = (subtotal >= 500 || subtotal === 0) ? 0 : 40;
        // Include Slot Charge (slotFee) in total
        return {
            subtotal,
            discount: serverDiscount,
            shippingFee,
            slotFee, // Pass to billing summary
            total: discountedAmount + shippingFee + slotFee
        };
    }, [subtotal, serverDiscount, slotFee]);

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
        <div className="bg-[#F8FAFC] min-h-screen pb-20">
            <div className="bg-white border-b border-gray-100 px-4 py-4 mb-6">
                <div className="max-w-7xl mx-auto flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <span className="hover:text-emerald-600 cursor-pointer" onClick={() => router.push('/')}>Home</span>
                    <FaChevronRight size={8} />
                    <span className="text-slate-900">Pharmacy Checkout</span>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4">
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    <div className="flex-1 w-full space-y-6">
                        <div className="space-y-4">
                            <h2 className="text-xs font-black text-slate-400 uppercase tracking-[2px] flex items-center gap-2 px-1">
                                <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">1</span>
                                Review Items ({pharmacyItems.length})
                            </h2>
                            <div className="space-y-3">
                                {pharmacyItems.map((item) => (
                                    <div key={item._id} className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="w-20 h-20 bg-slate-50 rounded-xl flex items-center justify-center border border-gray-50 flex-shrink-0 overflow-hidden">
                                            {item.medicineId?.image_url?.[0] ? <img src={item.medicineId.image_url[0]} className="w-full h-full object-contain p-2 mix-blend-multiply" /> : <FaPills size={24} className="text-emerald-600 opacity-20" />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-bold text-slate-900 text-md leading-tight">{item.name}</h3>
                                                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-tighter mt-1">{item.medicineId?.manufacturers}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-black text-slate-900 text-lg">₹{(item.price * item.quantity).toLocaleString()}</p>
                                                    <button onClick={() => removePharmacyItem(item.medicineId._id)} className="text-[10px] text-rose-500 font-black uppercase tracking-wider hover:underline">Remove</button>
                                                </div>
                                            </div>
                                            <div className="mt-3 flex items-center bg-slate-50 border border-slate-100 rounded-lg w-fit overflow-hidden">
                                                <button onClick={() => updatePharmacyCartQuantity(item.medicineId._id, 'dec')} className="px-3 py-1.5 hover:bg-white text-slate-400 transition-colors"><FaMinus size={10} /></button>
                                                <span className="px-4 text-xs font-black text-slate-900 border-x border-slate-100">{item.quantity}</span>
                                                <button onClick={() => updatePharmacyCartQuantity(item.medicineId._id, 'inc')} className="px-3 py-1.5 hover:bg-white text-slate-400 transition-colors"><FaPlus size={10} /></button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="bg-emerald-900 text-white rounded-2xl p-4 flex justify-between items-center shadow-lg shadow-emerald-100">
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-[1px] opacity-70">Fulfillment Partner</p>
                                    <p className="text-sm font-black uppercase">{pharmacyName}</p>
                                </div>
                                <div className="flex flex-col items-end">
                                    <div className="flex items-center gap-2 text-emerald-400 font-black text-[10px] uppercase"><FaTruck size={12} /> Authorized Store</div>
                                </div>
                            </div>
                            {needsPrescription && (
                                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-center gap-3">
                                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center shrink-0"><FaFilePrescription className="text-amber-600" size={14} /></div>
                                    <p className="text-[10px] text-amber-700 font-black uppercase leading-tight">Rx Required: A valid doctor's prescription is mandatory for some items.</p>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-xs font-black text-slate-400 uppercase tracking-[2px] flex items-center gap-2 px-1">
                                <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">2</span>
                                Delivery Preference
                            </h2>
                            <PharmacyDeliverySection
                                deliveryOption={deliveryOption}
                                setDeliveryOption={handleSetDeliveryOption}
                                selectedSlot={selectedSlot}
                                openSlotModal={() => setIsSlotModalOpen(true)}
                            />
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-xs font-black text-slate-400 uppercase tracking-[2px] flex items-center gap-2 px-1">
                                <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">3</span>
                                Delivery Address
                            </h2>
                            <PharmacyAddressSection addresses={addresses} selectedAddress={selectedAddress} setSelectedAddress={setSelectedAddress} isLoading={isAddressLoading} />
                        </div>
                    </div>

                    <div className="w-full lg:w-[400px] space-y-6 sticky top-6">
                        <PharmacyCouponSection availableCoupons={availableCoupons} couponCode={couponCode} setCouponCode={setCouponCode} appliedCouponName={appliedCouponName} setAppliedCouponName={setAppliedCouponName} setServerDiscount={setServerDiscount} handleApplyCoupon={handleApplyCoupon} isValidating={isValidating} />

                        {/* Summary updated to show totals (including slotFee) */}
                        <PharmacyBillingSummary totals={totals} selectedAddress={selectedAddress} subtotal={subtotal} />

                        <div className="px-2">
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest text-center leading-relaxed">Safe and Secure Payments • 100% Genuine Medicines • Easy Returns</p>
                        </div>
                    </div>
                </div>
            </div>

            <PharmacySlotModal
                isOpen={isSlotModalOpen}
                onClose={() => setIsSlotModalOpen(false)}
                pharmacyId={pharmacyId}
                onSelectSlot={(data) => {
                    setSelectedSlot(data.displayText); // e.g., "25 Apr, 09:30 (Morning)"
                    setSlotFee(data.fee);              // e.g., 159
                    setDeliveryOption('slot');
                    setIsSlotModalOpen(false);
                }}
            />
        </div>
    );
};

export default PharmacyCart;