"use client";

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    FaPlus, FaMinus, FaShieldAlt,
    FaPrescriptionBottleAlt, FaTag, FaSpinner, FaArrowLeft, FaCheckCircle,
    FaTicketAlt, FaUserCircle, FaWalking, FaHome, FaBolt, FaMapMarkerAlt,
    FaTrash, FaGem, FaCreditCard, FaMoneyBillWave, FaLock, FaCalendarAlt,
    FaClock, FaReceipt, FaUsers, FaVial, FaExternalLinkAlt, FaTimes
} from 'react-icons/fa';
import { useCart } from '@/app/context/CartContext';
import toast from 'react-hot-toast';
import UserAPI from '@/app/services/UserAPI';
import SlotSelectionModal from './SlotSelectionModal';
import FamilyMemberModal from './FamilyMemberModal';

// Dynamically load Razorpay SDK
const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        if (window.Razorpay) {
            resolve(true);
            return;
        }
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

const LabCart = () => {
    const router = useRouter();
    const cartContext = useCart();
    const { cart, updateQuantity, removeItem, loading, clearCart, clearFullCart } = cartContext || {};

    // Helper to safely clear cart across context or API
    const handleClearCart = async () => {
        try {
            if (typeof clearCart === 'function') {
                await clearCart();
            } else if (typeof clearFullCart === 'function') {
                await clearFullCart();
            } else if (UserAPI.clearCart) {
                await UserAPI.clearCart();
            }
        } catch (e) {
            console.warn("Cart clear fallback:", e);
        }
    };

    // Coupons & Pricing
    const [availableCoupons, setAvailableCoupons] = useState([]);
    const [couponCode, setCouponCode] = useState("");
    const [appliedCouponName, setAppliedCouponName] = useState(null);
    const [serverDiscount, setServerDiscount] = useState(0);
    const [isValidating, setIsValidating] = useState(false);
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    // Subscription & COD State
    const [subscription, setSubscription] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState("Online"); // 'Online' | 'COD'

    // Collection Method State
    const [collectionMethod, setCollectionMethod] = useState('Home Collection'); // 'Home Collection' or 'Visit Lab'

    // Address State
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [isAddressLoading, setIsAddressLoading] = useState(false);

    // Delivery & Fast Report Config
    const [deliveryConfig, setDeliveryConfig] = useState(null);
    const [isFastDelivery, setIsFastDelivery] = useState(false);

    // Patients & Slot Selection
    const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
    const [isFamilyModalOpen, setIsFamilyModalOpen] = useState(false);
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [selectedAppointment, setSelectedAppointment] = useState(null);

    // Success Modal State
    const [confirmedBookingData, setConfirmedBookingData] = useState(null);

    const labItems = useMemo(() => cart?.items || [], [cart]);
    const currentLabId = useMemo(() => cart?.labId?._id || cart?.labId, [cart]);

    // Home collection allowed only for Pathology (General)
    const isHomeCollectionAllowed = useMemo(() => {
        return cart?.categoryType === 'General' || !cart?.categoryType;
    }, [cart?.categoryType]);

    // Fallback to Visit Lab if Radiology detected
    useEffect(() => {
        if (!isHomeCollectionAllowed && collectionMethod === 'Home Collection') {
            setCollectionMethod('Visit Lab');
        }
    }, [isHomeCollectionAllowed, collectionMethod]);

    // Items Subtotal Calculation
    const baseSubtotal = useMemo(() => {
        return labItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    }, [labItems]);

    const multiplier = useMemo(() => {
        return selectedMembers.length || 1;
    }, [selectedMembers]);

    const subtotal = useMemo(() => {
        return baseSubtotal * multiplier;
    }, [baseSubtotal, multiplier]);

    // 1. Fetch Metadata (Coupons, Addresses, Delivery Config, Subscription)
    const fetchMetadata = useCallback(async () => {
        try {
            setIsAddressLoading(true);
            const [couponRes, addrRes, subRes] = await Promise.all([
                UserAPI.getCouponsForCart(),
                UserAPI.getUserAddresses(),
                UserAPI.getMySubscriptionStatus()
            ]);

            if (couponRes?.success) setAvailableCoupons(couponRes.data || []);
            if (addrRes?.success && addrRes.data?.length > 0) {
                setAddresses(addrRes.data);
                const defaultAddr = addrRes.data.find(a => a.isDefault) || addrRes.data[0];
                setSelectedAddress(defaultAddr);
            }
            if (subRes?.success && subRes.hasActivePlan) {
                setSubscription(subRes.data);
            }
        } catch (error) {
            console.error("Metadata fetch error:", error);
        } finally {
            setIsAddressLoading(false);
        }
    }, []);

    const fetchDeliveryCharges = useCallback(async () => {
        if (!currentLabId) return;
        try {
            const res = await UserAPI.getLabDeliveryCharges({ labId: currentLabId });
            if (res?.success) setDeliveryConfig(res.data);
        } catch (error) {
            console.error("Error fetching delivery charges:", error);
        }
    }, [currentLabId]);

    useEffect(() => {
        if (labItems.length > 0) {
            fetchMetadata();
            fetchDeliveryCharges();
        }
    }, [labItems.length, fetchMetadata, fetchDeliveryCharges]);

    // 2. Coupon Validation
    const handleApplyCoupon = async (name) => {
        const codeToApply = (name || couponCode).trim().toUpperCase();
        if (!codeToApply) return toast.error("Please enter a coupon code");
        if (!currentLabId) return toast.error("Lab information missing");

        setIsValidating(true);
        try {
            const res = await UserAPI.validateCouponCart(codeToApply, currentLabId, subtotal);
            if (res?.success) {
                setAppliedCouponName(codeToApply);
                setServerDiscount(res.discount || res.data?.discount || 0);
                setCouponCode("");
                toast.success(`Coupon Applied! Saved ₹${res.discount || res.data?.discount}`);
            } else {
                setAppliedCouponName(null);
                setServerDiscount(0);
                toast.error(res?.message || "Invalid coupon code");
            }
        } catch (error) {
            setAppliedCouponName(null);
            setServerDiscount(0);
            toast.error(error.response?.data?.message || "Invalid or Expired Coupon");
        } finally {
            setIsValidating(false);
        }
    };

    const removeCoupon = () => {
        setAppliedCouponName(null);
        setServerDiscount(0);
        setCouponCode("");
    };

    // 3. Computed Bill Totals
    const totals = useMemo(() => {
        const extraSlotFee = selectedAppointment?.slot?.extraFee || 0;
        const discountedAmount = Math.max(0, subtotal - serverDiscount);

        let homeVisitCharge = 0;
        let rapidDeliveryCharge = 0;

        if (deliveryConfig) {
            if (isFastDelivery) {
                rapidDeliveryCharge = deliveryConfig.fastDeliveryExtra || 0;
            }
            if (collectionMethod === 'Home Collection') {
                // Subscription VIP Waiver
                if (subscription) {
                    homeVisitCharge = 0;
                } else if (subtotal < (deliveryConfig.freeDeliveryThreshold ?? 500)) {
                    homeVisitCharge = deliveryConfig.fixedPrice ?? 50;
                }
            }
        }

        const totalAmount = discountedAmount + extraSlotFee + homeVisitCharge + rapidDeliveryCharge;

        return {
            baseSubtotal,
            multiplier,
            subtotal,
            discount: serverDiscount,
            extraSlotFee,
            homeVisitCharge,
            rapidDeliveryCharge,
            totalAmount,
            isSubscriptionApplied: Boolean(subscription && collectionMethod === 'Home Collection'),
            isCodAvailable: true // Always unlocked for Subscribed VIPs
        };
    }, [subtotal, baseSubtotal, multiplier, serverDiscount, selectedAppointment, collectionMethod, deliveryConfig, isFastDelivery, subscription]);

    // Handle Slot & Patient Modals
    const onFamilyConfirm = (membersList) => {
        setSelectedMembers(membersList);
        setIsFamilyModalOpen(false);
        if (!selectedAppointment) setIsSlotModalOpen(true);
    };

    const onSlotConfirm = (date, slot) => {
        setSelectedAppointment({ date, slot });
        setIsSlotModalOpen(false);
        toast.success(`Slot selected: ${slot.time}`);
    };

    // 4. Final Booking & Razorpay Flow (Section 3.1 & Section 7)
    const handleProceed = async () => {
        if (collectionMethod === 'Home Collection' && !selectedAddress) {
            return toast.error("Please select a home collection address");
        }
        if (selectedMembers.length === 0) {
            return setIsFamilyModalOpen(true);
        }
        if (!selectedAppointment) {
            return setIsSlotModalOpen(true);
        }

        setIsCheckingOut(true);

        try {
            const isZeroTotal = Math.round(totals.totalAmount) === 0;
            const finalPaymentMethod = isZeroTotal ? "COD" : paymentMethod;

            // Build patientMappings as per documentation Section 3.1
            const patientMappings = selectedMembers.map((member) => ({
                patientId: member.relation === 'Self' ? 'Self' : member._id,
                address: collectionMethod === 'Home Collection' ? {
                    houseNo: selectedAddress.houseNo || "",
                    sector: selectedAddress.sector || "",
                    city: selectedAddress.city || "",
                    state: selectedAddress.state || "",
                    pincode: selectedAddress.pincode || ""
                } : undefined,
                items: labItems.map((item) => ({
                    itemId: item.itemId || item._id,
                    productType: item.productType || "LabTest"
                }))
            }));

            const payload = {
                collectionType: collectionMethod,
                appointmentDate: selectedAppointment.date,
                appointmentTime: selectedAppointment.slot.time,
                isRapid: isFastDelivery,
                paymentMethod: finalPaymentMethod,
                couponCode: appliedCouponName || undefined,
                patientMappings
            };

            const res = await UserAPI.checkoutLabCart(payload);

            if (!res?.success) {
                toast.error(res?.message || "Failed to initiate booking");
                setIsCheckingOut(false);
                return;
            }

            // --- CASE A: Direct Confirmation for COD or Free Booking ---
            if (isZeroTotal || finalPaymentMethod === "COD" || res.data?.paymentStatus === "Paid" || res.data?.paymentStatus === "Pending") {
                await handleClearCart();
                setConfirmedBookingData({
                    ...(res.data || {}),
                    bookingId: res.data?.bookingId || res.bookingId || "ORD-SUCCESS",
                    appointmentDate: selectedAppointment.date,
                    appointmentTime: selectedAppointment.slot.time,
                    collectionType: collectionMethod,
                    paymentMethod: finalPaymentMethod,
                    totalAmount: totals.totalAmount,
                    patients: selectedMembers,
                    tests: labItems,
                    address: selectedAddress
                });
                setIsCheckingOut(false);
                return;
            }

            // --- CASE B: Online Payment via Razorpay ---
            const isScriptLoaded = await loadRazorpayScript();
            if (!isScriptLoaded) {
                toast.error("Failed to load Razorpay SDK.");
                setIsCheckingOut(false);
                return;
            }

            const { key_id, amount, razorpayOrderId, appointmentId, orderId } = res;

            const options = {
                key: key_id,
                amount: amount,
                currency: "INR",
                name: "Health Kangaroo Diagnostic Labs",
                description: "Lab Test Booking Payment",
                order_id: razorpayOrderId,
                prefill: {
                    name: selectedMembers[0]?.memberName || "Patient",
                    contact: selectedAddress?.phone || ""
                },
                theme: { color: "#10b981" },
                modal: {
                    ondismiss: () => {
                        setIsCheckingOut(false);
                        toast.error("Payment cancelled");
                    }
                },
                handler: async function (response) {
                    try {
                        setIsCheckingOut(true);
                        const verificationPayload = {
                            appointmentId: appointmentId || orderId || res.data?._id,
                            razorpayOrderId: response.razorpay_order_id || razorpayOrderId,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature
                        };

                        const verificationRes = await UserAPI.verifyPaymentLab(verificationPayload);

                        if (verificationRes?.success) {
                            await handleClearCart();
                            setConfirmedBookingData({
                                ...(verificationRes.data || res.data || {}),
                                bookingId: verificationRes.data?.bookingId || orderId || "ORD-SUCCESS",
                                paymentStatus: "Paid",
                                appointmentDate: selectedAppointment.date,
                                appointmentTime: selectedAppointment.slot.time,
                                collectionType: collectionMethod,
                                paymentMethod: "Online",
                                totalAmount: totals.totalAmount,
                                patients: selectedMembers,
                                tests: labItems,
                                address: selectedAddress
                            });
                        } else {
                            toast.error(verificationRes?.message || "Payment verification failed.");
                        }
                    } catch (e) {
                        toast.error("Error verifying payment.");
                    } finally {
                        setIsCheckingOut(false);
                    }
                }
            };

            const rzpInstance = new window.Razorpay(options);
            rzpInstance.open();

        } catch (error) {
            console.error("Checkout error:", error);
            toast.error(error.response?.data?.message || "Checkout failed");
            setIsCheckingOut(false);
        }
    };

    if (loading && labItems.length === 0) {
        return <div className="p-20 text-center font-bold text-slate-400 animate-pulse uppercase tracking-widest">Loading Lab Cart...</div>;
    }

    if (labItems.length === 0 && !confirmedBookingData) {
        return (
            <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
                <FaPrescriptionBottleAlt className="text-slate-200 text-7xl mb-6" />
                <h2 className="text-2xl font-black text-slate-800">Your Lab Cart is Empty</h2>
                <button
                    onClick={() => router.push('/booklabtest')}
                    className="mt-6 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-2xl font-black uppercase text-xs tracking-wider shadow-lg shadow-emerald-600/20"
                >
                    Browse Tests & Packages
                </button>
            </div>
        );
    }

    return (
        <div className="bg-[#F8FAFC] min-h-screen pb-20 font-sans">
            <div className="max-w-7xl mx-auto px-4 pt-6">
                <div className="flex flex-col lg:flex-row gap-8 items-start">

                    {/* LEFT COLUMN */}
                    <div className="flex-1 w-full space-y-6">
                        
                        {/* VIP Plan Badge */}
                        {totals.isSubscriptionApplied && (
                            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center gap-3">
                                <FaGem className="text-emerald-600" />
                                <div>
                                    <p className="text-xs font-bold text-emerald-900 uppercase tracking-tight">
                                        {subscription.planId?.name || "VIP Plan"} Active
                                    </p>
                                    <p className="text-[11px] text-emerald-700">Free Home Sample Collection Applied</p>
                                </div>
                            </div>
                        )}

                        {/* COLLECTION METHOD */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">1. Collection Method</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <button
                                    onClick={() => setCollectionMethod('Visit Lab')}
                                    className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left
                                        ${collectionMethod === 'Visit Lab' ? 'border-emerald-600 bg-emerald-50/50 text-emerald-900' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                                >
                                    <div className="p-2.5 bg-slate-100 rounded-xl"><FaWalking size={18} /></div>
                                    <div>
                                        <p className="text-xs font-black">Visit Lab</p>
                                        <p className="text-[10px] text-slate-400">Walk-in at diagnostic center</p>
                                    </div>
                                </button>

                                <button
                                    disabled={!isHomeCollectionAllowed}
                                    onClick={() => setCollectionMethod('Home Collection')}
                                    className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left relative
                                        ${!isHomeCollectionAllowed ? 'opacity-40 cursor-not-allowed bg-slate-50 border-slate-200' : ''}
                                        ${collectionMethod === 'Home Collection' ? 'border-emerald-600 bg-emerald-50/50 text-emerald-900' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                                >
                                    <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl"><FaHome size={18} /></div>
                                    <div>
                                        <p className="text-xs font-black">Home Collection</p>
                                        <p className="text-[10px] text-slate-400">Phlebotomist visits your doorstep</p>
                                    </div>
                                </button>
                            </div>

                            {/* ADDRESS SELECTION */}
                            {collectionMethod === 'Home Collection' && (
                                <div className="mt-6 pt-6 border-t border-slate-100">
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Sample Pickup Address</h4>
                                        <button onClick={() => router.push('/profile/addresses')} className="text-[10px] font-bold text-emerald-600 uppercase hover:underline">+ Add New</button>
                                    </div>

                                    {isAddressLoading ? (
                                        <div className="flex justify-center py-4"><FaSpinner className="animate-spin text-emerald-500" /></div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {addresses.map((addr) => {
                                                const isSelected = selectedAddress?._id === addr._id;
                                                return (
                                                    <div
                                                        key={addr._id}
                                                        onClick={() => setSelectedAddress(addr)}
                                                        className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all
                                                            ${isSelected ? 'border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-500' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                                                    >
                                                        <div className="flex items-start gap-2.5">
                                                            <FaMapMarkerAlt className={`mt-0.5 text-xs ${isSelected ? 'text-emerald-600' : 'text-slate-300'}`} />
                                                            <div>
                                                                <span className="text-[10px] font-black uppercase text-slate-900">{addr.addressType}</span>
                                                                <p className="text-xs font-bold text-slate-700 mt-0.5">{addr.name}</p>
                                                                <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                                                                    {addr.houseNo}, {addr.sector}, {addr.city}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* FAST REPORT OPTION */}
                            {deliveryConfig?.fastDeliveryExtra > 0 && (
                                <div className="mt-4 pt-4 border-t border-slate-100">
                                    <div
                                        onClick={() => setIsFastDelivery(!isFastDelivery)}
                                        className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all
                                            ${isFastDelivery ? 'border-amber-500 bg-amber-50/50' : 'border-slate-200 bg-white'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${isFastDelivery ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                                <FaBolt size={13} />
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-bold text-slate-800">Fast Express Reporting</h4>
                                                <p className="text-[10px] text-slate-400">Get verified digital reports 2x faster</p>
                                            </div>
                                        </div>
                                        <span className="font-black text-xs text-slate-900">+₹{deliveryConfig.fastDeliveryExtra}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* PATIENT & SLOT SELECTION STATUS */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">2. Patient & Schedule</h3>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <button
                                    onClick={() => setIsFamilyModalOpen(true)}
                                    className={`p-4 rounded-xl border text-left flex items-center justify-between transition-all
                                        ${selectedMembers.length > 0 ? 'border-emerald-600 bg-emerald-50/30' : 'border-slate-200 hover:border-slate-300'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <FaUserCircle className={selectedMembers.length > 0 ? 'text-emerald-600' : 'text-slate-400'} size={18} />
                                        <div>
                                            <p className="text-xs font-black text-slate-900">
                                                {selectedMembers.length > 0 ? `${selectedMembers.length} Patient(s) Selected` : "Select Patients *"}
                                            </p>
                                            <p className="text-[10px] text-slate-500 truncate max-w-[180px]">
                                                {selectedMembers.length > 0 ? selectedMembers.map(m => m.memberName).join(", ") : "Click to choose"}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-bold text-emerald-600 uppercase">Change</span>
                                </button>

                                <button
                                    onClick={() => setIsSlotModalOpen(true)}
                                    className={`p-4 rounded-xl border text-left flex items-center justify-between transition-all
                                        ${selectedAppointment ? 'border-emerald-600 bg-emerald-50/30' : 'border-slate-200 hover:border-slate-300'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <FaCheckCircle className={selectedAppointment ? 'text-emerald-600' : 'text-slate-400'} size={18} />
                                        <div>
                                            <p className="text-xs font-black text-slate-900">
                                                {selectedAppointment ? `${selectedAppointment.slot.time}` : "Select Time Slot *"}
                                            </p>
                                            <p className="text-[10px] text-slate-500">
                                                {selectedAppointment ? `${selectedAppointment.date}` : "Click to select"}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-bold text-emerald-600 uppercase">Change</span>
                                </button>
                            </div>
                        </div>

                        {/* PAYMENT METHOD SELECTOR */}
                        {totals.totalAmount > 0 && (
                            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">3. Payment Method</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod("Online")}
                                        className={`p-4 rounded-2xl border transition-all text-left flex items-center justify-between
                                            ${paymentMethod === "Online" ? 'border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-500' : 'bg-white border-slate-200'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl"><FaCreditCard size={15} /></div>
                                            <div>
                                                <p className="text-xs font-black text-slate-900">Pay Online</p>
                                                <p className="text-[10px] text-slate-500">UPI, Cards, NetBanking</p>
                                            </div>
                                        </div>
                                        {paymentMethod === "Online" && <FaCheckCircle className="text-emerald-600" size={15} />}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod("COD")}
                                        className={`p-4 rounded-2xl border transition-all text-left flex items-center justify-between
                                            ${paymentMethod === "COD" ? 'border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-500' : 'bg-white border-slate-200'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 bg-slate-100 text-slate-700 rounded-xl"><FaMoneyBillWave size={15} /></div>
                                            <div>
                                                <p className="text-xs font-black text-slate-900">Pay on Collection (COD)</p>
                                                <p className="text-[10px] text-slate-500">Pay cash during sample collection</p>
                                            </div>
                                        </div>
                                        {paymentMethod === "COD" && <FaCheckCircle className="text-emerald-600" size={15} />}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* REVIEW ITEMS */}
                        <div className="space-y-3">
                            {labItems.map((item) => (
                                <div key={item._id} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                                            <FaPrescriptionBottleAlt size={18} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 text-xs">{item.name}</h4>
                                            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded mt-0.5 inline-block">
                                                {item.productType}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-slate-900 text-sm">₹{(item.price * (selectedMembers.length || 1)).toLocaleString()}</p>
                                        <p className="text-[10px] text-slate-400">₹{item.price} × {selectedMembers.length || 1} Patient(s)</p>
                                        <button onClick={() => removeItem(item.itemId)} className="text-[10px] text-rose-500 font-bold uppercase hover:underline mt-1">Remove</button>
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>

                    {/* RIGHT COLUMN: BILLING & SUMMARY */}
                    <div className="w-full lg:w-[380px] space-y-6 lg:sticky lg:top-24">

                        {/* Coupon Section */}
                        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-3">
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                <FaTicketAlt className="text-emerald-500" /> Apply Coupon
                            </h3>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="COUPON CODE"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                    disabled={!!appliedCouponName}
                                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold uppercase outline-none focus:ring-2 focus:ring-emerald-500/20"
                                />
                                {appliedCouponName ? (
                                    <button onClick={removeCoupon} className="bg-rose-50 text-rose-600 px-4 rounded-xl text-[10px] font-black uppercase">Remove</button>
                                ) : (
                                    <button onClick={() => handleApplyCoupon()} disabled={isValidating || !couponCode} className="bg-slate-900 hover:bg-slate-800 text-white px-5 rounded-xl text-[10px] font-black uppercase">
                                        {isValidating ? <FaSpinner className="animate-spin" /> : "Apply"}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Cost Summary Box */}
                        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Order Summary</h3>

                            <div className="space-y-2.5 text-xs">
                                <div className="flex justify-between text-slate-600">
                                    <span>Base Tests Total</span>
                                    <span className="font-bold text-slate-900">₹{totals.baseSubtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                    <span>Patient Multiplier</span>
                                    <span className="font-black text-slate-900">× {totals.multiplier}</span>
                                </div>
                                <div className="flex justify-between text-emerald-800 font-bold bg-emerald-50/60 p-2 rounded-xl">
                                    <span>Multiplied Total</span>
                                    <span>₹{totals.subtotal.toFixed(2)}</span>
                                </div>

                                {totals.discount > 0 && (
                                    <div className="flex justify-between text-emerald-600 font-bold">
                                        <span>Coupon Discount</span>
                                        <span>-₹{totals.discount.toFixed(2)}</span>
                                    </div>
                                )}

                                <div className="flex justify-between text-slate-600">
                                    <span>Home Sample Collection</span>
                                    <span className="font-bold">
                                        {totals.homeVisitCharge === 0 ? (
                                            <span className="text-emerald-600 uppercase font-black text-[10px]">Free</span>
                                        ) : (
                                            `₹${totals.homeVisitCharge.toFixed(2)}`
                                        )}
                                    </span>
                                </div>

                                {totals.rapidDeliveryCharge > 0 && (
                                    <div className="flex justify-between text-amber-600 font-bold">
                                        <span>Fast Report Charge</span>
                                        <span>+₹{totals.rapidDeliveryCharge.toFixed(2)}</span>
                                    </div>
                                )}

                                <div className="h-px bg-slate-100 my-2" />

                                <div className="flex justify-between items-end">
                                    <div>
                                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Total Payable</span>
                                        <span className="text-[10px] text-slate-400 font-medium">Inclusive of all taxes</span>
                                    </div>
                                    <span className="text-2xl font-black text-slate-900">
                                        ₹{totals.totalAmount.toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={handleProceed}
                                disabled={isCheckingOut}
                                className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2
                                    ${!isCheckingOut ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 active:scale-95' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                            >
                                {isCheckingOut ? (
                                    <FaSpinner className="animate-spin" size={14} />
                                ) : selectedMembers.length === 0 ? (
                                    "Select Patients"
                                ) : !selectedAppointment ? (
                                    "Select Time Slot"
                                ) : totals.totalAmount === 0 ? (
                                    <>Confirm Free Booking <FaCheckCircle size={12} /></>
                                ) : paymentMethod === "COD" ? (
                                    <>Confirm & Pay on Collection <FaMoneyBillWave size={12} /></>
                                ) : (
                                    <>Proceed to Pay ₹{totals.totalAmount.toFixed(2)} <FaLock size={10} /></>
                                )}
                            </button>
                        </div>

                    </div>
                </div>
            </div>

            {/* Modals */}
            <FamilyMemberModal
                isOpen={isFamilyModalOpen}
                onClose={() => setIsFamilyModalOpen(false)}
                onConfirm={onFamilyConfirm}
                initialSelected={selectedMembers}
            />
            <SlotSelectionModal
                isOpen={isSlotModalOpen}
                onClose={() => setIsSlotModalOpen(false)}
                labId={currentLabId}
                onConfirm={onSlotConfirm}
            />

            {/* ========================================================= */}
            {/* REDESIGNED ENHANCED CONFIRMATION MODAL */}
            {/* ========================================================= */}
            {confirmedBookingData && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2.5rem] max-w-lg w-full border border-slate-100 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        
                        {/* Header Banner */}
                        <div className="bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-700 p-6 text-white text-center relative shrink-0">
                            <button
                                onClick={() => {
                                    setConfirmedBookingData(null);
                                    router.push('/userscreens/previousorders');
                                }}
                                className="absolute right-4 top-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white/80 hover:text-white transition"
                            >
                                <FaTimes size={13} />
                            </button>

                            <div className="w-14 h-14 bg-white rounded-2xl mx-auto flex items-center justify-center text-emerald-600 shadow-lg shadow-black/10 mb-3">
                                <FaCheckCircle size={28} />
                            </div>
                            <h3 className="text-xl font-black tracking-tight">Booking Confirmed!</h3>
                            <p className="text-emerald-100 text-xs font-semibold mt-1">
                                {confirmedBookingData.collectionType === "Home Collection"
                                    ? "A verified phlebotomist will visit your address as scheduled."
                                    : "Please present this booking at the lab diagnostic center."}
                            </p>
                        </div>

                        {/* Modal Body (Scrollable Details) */}
                        <div className="p-6 overflow-y-auto space-y-4 text-xs font-sans">
                            
                            {/* OTP Box */}
                            {confirmedBookingData.tracking?.otp && (
                                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-dashed border-emerald-300 rounded-2xl p-4 text-center">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-800 block mb-1">
                                        Sample Collection Security OTP
                                    </span>
                                    <div className="text-3xl font-black tracking-[0.25em] text-emerald-700 font-mono">
                                        {confirmedBookingData.tracking.otp}
                                    </div>
                                    <p className="text-[10px] text-slate-500 font-medium mt-1">
                                        Share this 4-digit verification code with your medical agent upon arrival.
                                    </p>
                                </div>
                            )}

                            {/* Booking ID & Payment Status Row */}
                            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Booking ID</span>
                                    <span className="text-xs font-black text-slate-900 font-mono">
                                        {confirmedBookingData.bookingId || "ORD-SUCCESS"}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Payment</span>
                                    <span className="inline-flex items-center gap-1 font-black text-xs text-emerald-700 uppercase">
                                        <FaCheckCircle size={10} />
                                        {confirmedBookingData.paymentStatus === "Paid" ? "Paid Online" : "Pay on Collection (COD)"}
                                    </span>
                                </div>
                            </div>

                            {/* Appointment Schedule & Location */}
                            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-3 shadow-sm">
                                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                    <div className="flex items-center gap-2 text-slate-700 font-bold">
                                        <FaCalendarAlt className="text-emerald-600" />
                                        <span>{confirmedBookingData.appointmentDate || selectedAppointment?.date || "Scheduled Date"}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                                        <FaClock className="text-emerald-600" />
                                        <span>{confirmedBookingData.appointmentTime || selectedAppointment?.slot?.time || "Time Slot"}</span>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2.5 pt-1">
                                    <FaMapMarkerAlt className="text-emerald-600 mt-0.5 shrink-0" />
                                    <div>
                                        <span className="font-black text-slate-900 uppercase text-[10px] block">
                                            {confirmedBookingData.collectionType || collectionMethod}
                                        </span>
                                        {confirmedBookingData.address ? (
                                            <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-0.5">
                                                {confirmedBookingData.address.houseNo}, {confirmedBookingData.address.sector}, {confirmedBookingData.address.city}
                                            </p>
                                        ) : (
                                            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                                                Direct diagnostic lab walk-in visit
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Registered Patients */}
                            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-2 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5">
                                        <FaUsers className="text-emerald-600" /> Patients ({(confirmedBookingData.patients || selectedMembers).length})
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {(confirmedBookingData.patients || selectedMembers).map((m, idx) => (
                                        <span key={idx} className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg text-[11px] font-bold border border-slate-200/60">
                                            {m.memberName || m.patientName || "Patient"}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Prescribed Tests / Packages */}
                            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-2 shadow-sm">
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5">
                                    <FaVial className="text-emerald-600" /> Booked Tests ({(confirmedBookingData.tests || labItems).length})
                                </span>
                                <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                                    {(confirmedBookingData.tests || labItems).map((t, idx) => (
                                        <div key={idx} className="flex justify-between text-[11px] text-slate-600 font-medium py-0.5">
                                            <span className="truncate max-w-[240px]">• {t.name}</span>
                                            <span className="font-bold text-slate-900">₹{t.price}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Total Amount Paid / Payable */}
                            <div className="flex justify-between items-center bg-slate-900 text-white p-4 rounded-2xl">
                                <div>
                                    <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest block">
                                        Total Amount
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-medium">All charges & taxes included</span>
                                </div>
                                <span className="text-xl font-black text-emerald-400">
                                    ₹{Math.round(confirmedBookingData.totalAmount ?? totals.totalAmount).toLocaleString()}
                                </span>
                            </div>

                        </div>

                        {/* Modal Footer Actions */}
                        <div className="p-5 border-t border-slate-100 bg-slate-50 flex gap-3 shrink-0">
                            <button
                                onClick={() => {
                                    setConfirmedBookingData(null);
                                    router.push('/userscreens/previousorders');
                                }}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                <span>Track Appointment</span>
                                <FaExternalLinkAlt size={10} />
                            </button>
                            <button
                                onClick={() => {
                                    setConfirmedBookingData(null);
                                    router.push('/');
                                }}
                                className="px-5 py-3.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-2xl font-bold text-xs uppercase transition"
                            >
                                Home
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default LabCart;