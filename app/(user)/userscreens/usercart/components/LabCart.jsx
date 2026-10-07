"use client";

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    FaPlus, FaMinus, FaShieldAlt,
    FaPrescriptionBottleAlt, FaTag, FaSpinner, FaArrowLeft, FaCheckCircle,
    FaTicketAlt, FaUserCircle, FaWalking, FaHome, FaBolt, FaMapMarkerAlt,
    FaTrash, FaGem, FaCreditCard, FaMoneyBillWave, FaLock, FaCalendarAlt,
    FaClock, FaReceipt, FaUsers, FaVial, FaExternalLinkAlt, FaTimes,
    FaExclamationTriangle, FaArrowRight, FaPercent, FaInfoCircle
} from 'react-icons/fa';
import { useCart } from '@/app/context/CartContext';
import toast from 'react-hot-toast';
import UserAPI from '@/app/services/UserAPI';
import SlotSelectionModal from './SlotSelectionModal';
import FamilyMemberModal from './FamilyMemberModal';

// Dynamically load Razorpay SDK
const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        if (typeof window !== 'undefined' && window.Razorpay) {
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
    const { cart, removeItem, loading, clearCart, clearFullCart } = cartContext || {};

    // Helper to safely clear cart
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
    const [showAllCoupons, setShowAllCoupons] = useState(false);

    // Server-side Checkout Summary & Subscription Engine State
    const [serverSummary, setServerSummary] = useState(null);
    const [isEvaluatingBill, setIsEvaluatingBill] = useState(false);

    // Collection Method State
    const [collectionMethod, setCollectionMethod] = useState('Home Collection'); // 'Home Collection' or 'Visit Lab'

    // Address State
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [isAddressLoading, setIsAddressLoading] = useState(false);

    // Fast Report Option
    const [isFastDelivery, setIsFastDelivery] = useState(false);

    // Payment Method & COD State
    const [paymentMethod, setPaymentMethod] = useState("Online"); // 'Online' | 'COD'
    const [isCodAvailable, setIsCodAvailable] = useState(true);

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
        return labItems.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);
    }, [labItems]);

    const multiplier = useMemo(() => {
        return selectedMembers.length || 1;
    }, [selectedMembers]);

    const subtotal = useMemo(() => {
        return baseSubtotal * multiplier;
    }, [baseSubtotal, multiplier]);

    // 1. Fetch Metadata (Addresses & Coupons)
    const fetchMetadata = useCallback(async () => {
        try {
            setIsAddressLoading(true);
            const [couponRes, addrRes] = await Promise.all([
                UserAPI.getCouponsForCart?.(),
                UserAPI.getUserAddresses?.()
            ]);

            if (couponRes?.success) {
                setAvailableCoupons(couponRes.data || []);
            }
            if (addrRes?.success && addrRes.data?.length > 0) {
                setAddresses(addrRes.data);
                const defaultAddr = addrRes.data.find(a => a.isDefault) || addrRes.data[0];
                setSelectedAddress(defaultAddr);
            }
        } catch (error) {
            console.error("Metadata fetch error:", error);
        } finally {
            setIsAddressLoading(false);
        }
    }, []);

    useEffect(() => {
        if (labItems.length > 0) {
            fetchMetadata();
        }
    }, [labItems.length, fetchMetadata]);

    // 2. Evaluate Server-Side Lab Checkout (POST /user/labs/checkout)
    const evaluateLabSummary = useCallback(async () => {
        if (!currentLabId || labItems.length === 0) return;

        try {
            setIsEvaluatingBill(true);

            const selectedPatients = selectedMembers.length > 0 
                ? selectedMembers.map(m => ({
                    patientId: m.relation === 'Self' ? 'Self' : (m._id || m.patientId || 'Self'),
                    name: m.memberName || m.name || "Self",
                    age: Number(m.age) || 28,
                    gender: m.gender || "Male"
                }))
                : [{ patientId: "Self", name: selectedAddress?.name || "Self", age: 28, gender: "Male" }];

            const payload = {
                labId: String(currentLabId),
                collectionType: collectionMethod,
                isRapid: Boolean(isFastDelivery),
                couponCode: appliedCouponName || "",
                selectedPatients,
                address: selectedAddress ? {
                    name: selectedAddress.name || "Patient",
                    phone: selectedAddress.phone || "",
                    houseNo: selectedAddress.houseNo || "",
                    sector: selectedAddress.sector || "",
                    city: selectedAddress.city || "",
                    state: selectedAddress.state || "",
                    pincode: selectedAddress.pincode || "",
                    addressType: selectedAddress.addressType || "Home"
                } : undefined
            };

            const res = await UserAPI.checkoutLabCart(payload);
            if (res?.success && res.data) {
                setServerSummary(res.data);
                
                const codAllowed = Boolean(res.data.isCodAvailable ?? true);
                setIsCodAvailable(codAllowed);
                if (!codAllowed && paymentMethod === "COD") {
                    setPaymentMethod("Online");
                }
            }
        } catch (err) {
            console.error("Error evaluating lab checkout summary:", err);
        } finally {
            setIsEvaluatingBill(false);
        }
    }, [currentLabId, labItems.length, selectedMembers, collectionMethod, isFastDelivery, appliedCouponName, selectedAddress, paymentMethod]);

    useEffect(() => {
        if (labItems.length > 0) {
            evaluateLabSummary();
        }
    }, [evaluateLabSummary, labItems.length]);

    // 3. Coupon Validation
    const handleApplyCoupon = async (name) => {
        const codeToApply = (name || couponCode).trim().toUpperCase();
        if (!codeToApply) return toast.error("Please enter a coupon code");
        if (!currentLabId) return toast.error("Lab information missing");

        setIsValidating(true);
        try {
            const res = await UserAPI.validateCouponCart?.(codeToApply, currentLabId, subtotal);
            if (res?.success) {
                setAppliedCouponName(codeToApply);
                setServerDiscount(res.discount || res.data?.discount || 0);
                setCouponCode("");
                toast.success(`Coupon "${codeToApply}" Applied! Saved ₹${res.discount || res.data?.discount || 0}`);
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
        toast.success("Coupon removed");
    };

    // 4. Computed Bill Totals with Server-Side Sync
    const totals = useMemo(() => {
        const extraSlotFee = selectedAppointment?.slot?.extraFee || 0;

        if (serverSummary?.billSummary) {
            const b = serverSummary.billSummary;
            const subBenefit = serverSummary.subscriptionBenefit || {};

            return {
                baseSubtotal: b.baseTestsTotal ?? (subtotal / multiplier),
                multiplier: b.patientMultiplier ?? multiplier,
                subtotal: b.multipliedTotal ?? subtotal,
                discount: b.couponDiscount ?? serverDiscount,
                extraSlotFee,
                homeSampleCollectionCharge: b.homeSampleCollectionCharge ?? 0,
                originalHomeCollectionCharge: b.originalHomeCollectionCharge ?? b.homeSampleCollectionCharge ?? 0,
                fastReportCharge: b.fastReportCharge ?? 0,
                totalAmount: (b.totalAmount ?? subtotal) + extraSlotFee,
                
                subscriptionBenefit: {
                    isApplied: Boolean(subBenefit.isApplied),
                    hasActiveSubscription: Boolean(subBenefit.hasActiveSubscription),
                    isBenefitExhausted: Boolean(subBenefit.isBenefitExhausted),
                    remainingCount: subBenefit.remainingCount ?? 0,
                    planName: subBenefit.planName || "",
                    benefitField: subBenefit.benefitField || "freeLabDeliveriesCount",
                    exhaustedMessage: subBenefit.exhaustedMessage || ""
                },
                isCodAvailable: Boolean(serverSummary.isCodAvailable ?? isCodAvailable)
            };
        }

        const fallbackDiscounted = Math.max(0, subtotal - serverDiscount);
        const homeCharge = collectionMethod === 'Home Collection' ? 89 : 0;
        const fastCharge = isFastDelivery ? 150 : 0;

        return {
            baseSubtotal,
            multiplier,
            subtotal,
            discount: serverDiscount,
            extraSlotFee,
            homeSampleCollectionCharge: homeCharge,
            originalHomeCollectionCharge: homeCharge,
            fastReportCharge: fastCharge,
            totalAmount: fallbackDiscounted + homeCharge + fastCharge + extraSlotFee,
            subscriptionBenefit: {
                isApplied: false,
                hasActiveSubscription: false,
                isBenefitExhausted: false,
                remainingCount: 0,
                planName: "",
                benefitField: "freeLabDeliveriesCount",
                exhaustedMessage: ""
            },
            isCodAvailable: true
        };
    }, [serverSummary, subtotal, baseSubtotal, multiplier, serverDiscount, selectedAppointment, collectionMethod, isFastDelivery, isCodAvailable]);

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

    // 5. Final Booking & Razorpay Flow (POST /user/labs/book)
    const handleProceed = async () => {
        if (collectionMethod === 'Home Collection' && !selectedAddress) {
            return toast.error("Please select a home sample collection address");
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

            const selectedPatients = selectedMembers.map((member) => ({
                patientId: member.relation === 'Self' ? 'Self' : (member._id || member.patientId || 'Self'),
                name: member.memberName || member.name || "Self",
                age: Number(member.age) || 28,
                gender: member.gender || "Male"
            }));

            const bookingPayload = {
                collectionType: collectionMethod,
                paymentMethod: finalPaymentMethod,
                isRapid: Boolean(isFastDelivery),
                appointmentDate: selectedAppointment.date,
                appointmentTime: selectedAppointment.slot.time,
                couponCode: appliedCouponName || "",
                selectedPatients,
                address: selectedAddress ? {
                    name: selectedAddress.name || "Patient",
                    phone: selectedAddress.phone || "",
                    houseNo: selectedAddress.houseNo || "",
                    sector: selectedAddress.sector || "",
                    city: selectedAddress.city || "",
                    state: selectedAddress.state || "",
                    pincode: selectedAddress.pincode || "",
                    addressType: selectedAddress.addressType || "Home"
                } : undefined
            };

            const res = await UserAPI.bookLabTest(bookingPayload);

            if (!res?.success) {
                toast.error(res?.message || "Failed to initiate booking");
                setIsCheckingOut(false);
                return;
            }

            // Direct Confirmation for COD or Free Booking
            if (isZeroTotal || finalPaymentMethod === "COD" || res.data?.paymentStatus === "Paid" || res.status === "Confirmed") {
                await handleClearCart();
                setConfirmedBookingData({
                    ...(res.data || {}),
                    bookingId: res.bookingId || res.data?.bookingId || "ORD-SUCCESS",
                    pickupOtp: res.pickupOtp || res.data?.pickupOtp || res.data?.tracking?.otp,
                    appointmentDate: selectedAppointment.date,
                    appointmentTime: selectedAppointment.slot.time,
                    collectionType: collectionMethod,
                    paymentMethod: finalPaymentMethod,
                    paymentStatus: res.data?.paymentStatus || (finalPaymentMethod === 'COD' ? 'Pending' : 'Paid'),
                    totalAmount: totals.totalAmount,
                    patients: selectedMembers,
                    tests: labItems,
                    address: selectedAddress
                });
                setIsCheckingOut(false);
                return;
            }

            // Online Payment via Razorpay
            const isScriptLoaded = await loadRazorpayScript();
            if (!isScriptLoaded) {
                toast.error("Failed to load Razorpay SDK.");
                setIsCheckingOut(false);
                return;
            }

            let keyId = res.key_id || res.key || res.data?.key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY;
            if (typeof keyId === 'string') {
                keyId = keyId.trim();
                if (keyId.startsWith("zp_")) keyId = "r" + keyId;
            }

            const rawAmount = res.amount || res.data?.amount || Math.round(totals.totalAmount * 100);
            const razorpayOrderId = res.razorpayOrderId || res.data?.razorpayOrderId;
            const bookingIdTarget = res.bookingId || res.data?.bookingId || res.bookingMongoId;

            if (!keyId) {
                toast.error("Payment gateway configuration missing. Please select Pay on Collection.");
                setIsCheckingOut(false);
                return;
            }

            const options = {
                key: keyId,
                amount: rawAmount,
                currency: "INR",
                name: "Health Kangaroo Diagnostic Labs",
                description: `Payment for Lab Booking #${bookingIdTarget}`,
                order_id: razorpayOrderId,
                prefill: {
                    name: selectedMembers[0]?.memberName || selectedAddress?.name || "Patient",
                    contact: selectedAddress?.phone || ""
                },
                theme: { color: "#08B36A" },
                modal: {
                    ondismiss: () => {
                        setIsCheckingOut(false);
                        toast("Payment cancelled or closed.");
                    }
                },
                handler: async function (response) {
                    try {
                        setIsCheckingOut(true);

                        const verificationPayload = {
                            bookingId: bookingIdTarget,
                            appointmentId: res.bookingMongoId || bookingIdTarget,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id || razorpayOrderId,
                            razorpay_signature: response.razorpay_signature,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpayOrderId: response.razorpay_order_id || razorpayOrderId,
                            razorpaySignature: response.razorpay_signature,
                            paymentMethod: "Online"
                        };

                        const verificationRes = await UserAPI.verifyPaymentLab(verificationPayload);

                        if (verificationRes?.success) {
                            await handleClearCart();
                            setConfirmedBookingData({
                                ...(verificationRes.data || res.data || {}),
                                bookingId: verificationRes.bookingId || verificationRes.data?.bookingId || bookingIdTarget,
                                pickupOtp: verificationRes.pickupOtp || verificationRes.data?.tracking?.otp || verificationRes.data?.pickupOtp,
                                paymentStatus: "Paid",
                                paymentMethod: "Online",
                                appointmentDate: selectedAppointment.date,
                                appointmentTime: selectedAppointment.slot.time,
                                collectionType: collectionMethod,
                                totalAmount: totals.totalAmount,
                                patients: selectedMembers,
                                tests: labItems,
                                address: selectedAddress
                            });
                        } else {
                            toast.error(verificationRes?.message || "Payment verification failed.");
                        }
                    } catch (e) {
                        console.error("Payment verification error:", e);
                        toast.error(e.response?.data?.message || "Error verifying payment with server.");
                    } finally {
                        setIsCheckingOut(false);
                    }
                }
            };

            const rzpInstance = new window.Razorpay(options);
            rzpInstance.on('payment.failed', function (response) {
                toast.error(response.error?.description || "Payment failed. Please try again.");
            });
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
                    className="mt-6 bg-[#08B36A] hover:bg-[#079c5c] text-white px-8 py-3 rounded-2xl font-black uppercase text-xs tracking-wider shadow-lg shadow-emerald-600/20 cursor-pointer"
                >
                    Browse Tests & Packages
                </button>
            </div>
        );
    }

    return (
        <div className="bg-[#F8FAFC] min-h-screen pb-20 font-sans text-slate-900">
            <div className="max-w-7xl mx-auto px-4 pt-6">
                <div className="flex flex-col lg:flex-row gap-8 items-start">

                    {/* LEFT COLUMN */}
                    <div className="flex-1 w-full space-y-6">
                        
                        {/* 1. BENEFIT APPLIED BANNER */}
                        {totals.subscriptionBenefit.isApplied && (
                            <div className="bg-[#ECFDF5] border border-[#10B981] p-4.5 rounded-2xl flex items-center justify-between shadow-xs">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white text-[#059669] flex items-center justify-center shadow-xs border border-emerald-100">
                                        <FaGem size={18} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-[#059669] uppercase tracking-tight">
                                            ✨ Free Delivery ({totals.subscriptionBenefit.planName})
                                        </p>
                                        <p className="text-[11px] font-semibold text-emerald-800 mt-0.5">
                                            Home sample collection fee (₹0) waived automatically.
                                        </p>
                                    </div>
                                </div>
                                <span className="bg-[#08B36A] text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase">
                                    {totals.subscriptionBenefit.remainingCount} Left
                                </span>
                            </div>
                        )}

                        {/* 2. UPSELL BANNER (WHEN NO SUBSCRIPTION) */}
                        {!totals.subscriptionBenefit.hasActiveSubscription && (
                            <div 
                                onClick={() => router.push('/user/subscriptions/list')}
                                className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 p-4 rounded-2xl flex items-center justify-between cursor-pointer hover:border-blue-400 transition-colors shadow-xs"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                                        <FaGem size={15} />
                                    </div>
                                    <p className="text-xs font-black text-blue-950">
                                        Get Unlimited Free Deliveries & VIP COD with Health Kangaroo Care Plans ➔
                                    </p>
                                </div>
                                <FaArrowRight className="text-blue-600 text-xs shrink-0" />
                            </div>
                        )}

                        {/* COLLECTION METHOD */}
                        <div className="bg-white border border-slate-200/90 rounded-[2rem] p-6 shadow-xs">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">1. Collection Method</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setCollectionMethod('Visit Lab')}
                                    className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left cursor-pointer
                                        ${collectionMethod === 'Visit Lab' ? 'border-[#08B36A] bg-emerald-50/40 text-emerald-950 ring-1 ring-[#08B36A]/20' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                                >
                                    <div className="p-2.5 bg-slate-100 rounded-xl"><FaWalking size={18} /></div>
                                    <div>
                                        <p className="text-xs font-black">Visit Lab</p>
                                        <p className="text-[10px] text-slate-400">Walk-in at diagnostic center</p>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    disabled={!isHomeCollectionAllowed}
                                    onClick={() => setCollectionMethod('Home Collection')}
                                    className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left relative cursor-pointer
                                        ${!isHomeCollectionAllowed ? 'opacity-40 cursor-not-allowed bg-slate-50 border-slate-200' : ''}
                                        ${collectionMethod === 'Home Collection' ? 'border-[#08B36A] bg-emerald-50/40 text-emerald-950 ring-1 ring-[#08B36A]/20' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                                >
                                    <div className="p-2.5 bg-emerald-100 text-[#08B36A] rounded-xl"><FaHome size={18} /></div>
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
                                        <button onClick={() => router.push('/profile/addresses')} className="text-[10px] font-bold text-[#08B36A] uppercase hover:underline cursor-pointer">+ Add New</button>
                                    </div>

                                    {isAddressLoading ? (
                                        <div className="flex justify-center py-4"><FaSpinner className="animate-spin text-[#08B36A]" /></div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {addresses.map((addr) => {
                                                const isSelected = selectedAddress?._id === addr._id;
                                                return (
                                                    <div
                                                        key={addr._id}
                                                        onClick={() => setSelectedAddress(addr)}
                                                        className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all
                                                            ${isSelected ? 'border-[#08B36A] bg-emerald-50/40 ring-1 ring-[#08B36A]/20' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                                                    >
                                                        <div className="flex items-start gap-2.5">
                                                            <FaMapMarkerAlt className={`mt-0.5 text-xs ${isSelected ? 'text-[#08B36A]' : 'text-slate-300'}`} />
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
                            <div className="mt-4 pt-4 border-t border-slate-100">
                                <div
                                    onClick={() => setIsFastDelivery(!isFastDelivery)}
                                    className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all
                                        ${isFastDelivery ? 'border-amber-500 bg-amber-50/50' : 'border-slate-200 bg-white'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-xl ${isFastDelivery ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                            <FaBolt size={13} />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold text-slate-800">Fast Express Reporting</h4>
                                            <p className="text-[10px] text-slate-400">Get verified digital reports 2x faster</p>
                                        </div>
                                    </div>
                                    <span className="font-black text-xs text-slate-900">+₹150</span>
                                </div>
                            </div>
                        </div>

                        {/* PATIENT & SLOT SELECTION STATUS */}
                        <div className="bg-white border border-slate-200/90 rounded-[2rem] p-6 shadow-xs space-y-4">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">2. Patient & Schedule</h3>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsFamilyModalOpen(true)}
                                    className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer
                                        ${selectedMembers.length > 0 ? 'border-[#08B36A] bg-emerald-50/30 ring-1 ring-[#08B36A]/20' : 'border-slate-200 hover:border-slate-300'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <FaUserCircle className={selectedMembers.length > 0 ? 'text-[#08B36A]' : 'text-slate-400'} size={18} />
                                        <div>
                                            <p className="text-xs font-black text-slate-900">
                                                {selectedMembers.length > 0 ? `${selectedMembers.length} Patient(s) Selected` : "Select Patients *"}
                                            </p>
                                            <p className="text-[10px] text-slate-500 truncate max-w-[180px]">
                                                {selectedMembers.length > 0 ? selectedMembers.map(m => m.memberName || m.name).join(", ") : "Click to choose"}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-black text-[#08B36A] uppercase">Change</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setIsSlotModalOpen(true)}
                                    className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer
                                        ${selectedAppointment ? 'border-[#08B36A] bg-emerald-50/30 ring-1 ring-[#08B36A]/20' : 'border-slate-200 hover:border-slate-300'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <FaCheckCircle className={selectedAppointment ? 'text-[#08B36A]' : 'text-slate-400'} size={18} />
                                        <div>
                                            <p className="text-xs font-black text-slate-900">
                                                {selectedAppointment ? `${selectedAppointment.slot.time}` : "Select Time Slot *"}
                                            </p>
                                            <p className="text-[10px] text-slate-500">
                                                {selectedAppointment ? `${selectedAppointment.date}` : "Click to select"}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-black text-[#08B36A] uppercase">Change</span>
                                </button>
                            </div>
                        </div>

                        {/* PAYMENT METHOD SELECTOR */}
                        {totals.totalAmount > 0 && (
                            <div className="bg-white border border-slate-200/90 rounded-[2rem] p-6 shadow-xs space-y-4">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">3. Payment Method</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod("Online")}
                                        className={`p-4 rounded-2xl border transition-all text-left flex items-center justify-between cursor-pointer
                                            ${paymentMethod === "Online" ? 'border-[#08B36A] bg-emerald-50/40 ring-1 ring-[#08B36A]/20' : 'bg-white border-slate-200'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 bg-emerald-100 text-[#08B36A] rounded-xl"><FaCreditCard size={15} /></div>
                                            <div>
                                                <p className="text-xs font-black text-slate-900">Pay Online</p>
                                                <p className="text-[10px] text-slate-500">UPI, Cards, NetBanking</p>
                                            </div>
                                        </div>
                                        {paymentMethod === "Online" && <FaCheckCircle className="text-[#08B36A]" size={15} />}
                                    </button>

                                    <button
                                        type="button"
                                        disabled={!totals.isCodAvailable}
                                        onClick={() => setPaymentMethod("COD")}
                                        className={`p-4 rounded-2xl border transition-all text-left flex items-center justify-between cursor-pointer
                                            ${!totals.isCodAvailable ? 'opacity-40 cursor-not-allowed bg-slate-50 border-slate-200' : ''}
                                            ${paymentMethod === "COD" ? 'border-[#08B36A] bg-emerald-50/40 ring-1 ring-[#08B36A]/20' : 'bg-white border-slate-200'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 bg-slate-100 text-slate-700 rounded-xl"><FaMoneyBillWave size={15} /></div>
                                            <div>
                                                <p className="text-xs font-black text-slate-900">Pay on Collection (COD)</p>
                                                <p className="text-[10px] text-slate-500">
                                                    {totals.isCodAvailable ? "Pay cash on sample collection" : "COD unavailable"}
                                                </p>
                                            </div>
                                        </div>
                                        {paymentMethod === "COD" && <FaCheckCircle className="text-[#08B36A]" size={15} />}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* REVIEW ITEMS */}
                        <div className="space-y-3">
                            {labItems.map((item) => (
                                <div key={item._id || item.itemId} className="bg-white border border-slate-200/90 rounded-2xl p-4 flex items-center justify-between shadow-xs">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-[#08B36A]">
                                            <FaPrescriptionBottleAlt size={18} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 text-xs">{item.name}</h4>
                                            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded mt-0.5 inline-block">
                                                {item.productType || "LabTest"}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-slate-900 text-sm">₹{(item.price * (selectedMembers.length || 1)).toLocaleString()}</p>
                                        <p className="text-[10px] text-slate-400">₹{item.price} × {selectedMembers.length || 1} Patient(s)</p>
                                        <button onClick={() => removeItem(item.itemId || item._id)} className="text-[10px] text-rose-500 font-bold uppercase hover:underline mt-1 cursor-pointer">Remove</button>
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>

                    {/* RIGHT COLUMN: BILLING & SUMMARY WITH AVAILABLE COUPONS LIST */}
                    <div className="w-full lg:w-[380px] space-y-6 lg:sticky lg:top-24">

                        {/* COUPON INPUT & AVAILABLE LIST SECTION */}
                        <div className="bg-white border border-slate-200/90 rounded-[2rem] p-6 shadow-xs space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                    <FaTicketAlt className="text-[#08B36A]" /> Apply Coupon
                                </h3>
                                {availableCoupons.length > 0 && (
                                    <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-emerald-50 text-[#08B36A] rounded-full border border-emerald-100">
                                        {availableCoupons.length} Available
                                    </span>
                                )}
                            </div>

                            {/* Manual Input Box */}
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="ENTER CODE"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                    disabled={!!appliedCouponName}
                                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold uppercase outline-none focus:ring-2 focus:ring-[#08B36A]/20"
                                />
                                {appliedCouponName ? (
                                    <button onClick={removeCoupon} className="bg-rose-50 text-rose-600 px-4 rounded-xl text-[10px] font-black uppercase cursor-pointer">Remove</button>
                                ) : (
                                    <button onClick={() => handleApplyCoupon()} disabled={isValidating || !couponCode} className="bg-slate-900 hover:bg-slate-800 text-white px-5 rounded-xl text-[10px] font-black uppercase cursor-pointer">
                                        {isValidating ? <FaSpinner className="animate-spin" /> : "Apply"}
                                    </button>
                                )}
                            </div>

                            {/* DYNAMIC AVAILABLE COUPONS LIST */}
                            {availableCoupons.length > 0 && (
                                <div className="space-y-3 pt-3 border-t border-slate-100">
                                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Available Offers</p>
                                    
                                    <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                                        {availableCoupons.map((coupon) => {
                                            const isApplied = appliedCouponName === coupon.couponName;
                                            const isApplicable = Boolean(coupon.isApplicable);

                                            return (
                                                <div 
                                                    key={coupon._id}
                                                    className={`p-3.5 rounded-2xl border transition-all ${
                                                        isApplied 
                                                            ? 'border-[#08B36A] bg-emerald-50/50 ring-1 ring-[#08B36A]/30'
                                                            : isApplicable 
                                                            ? 'border-slate-200/90 bg-white hover:border-emerald-300' 
                                                            : 'border-slate-200/60 bg-slate-50/60 opacity-80'
                                                    }`}
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-mono font-black text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md uppercase tracking-wider border border-slate-200">
                                                                {coupon.couponName}
                                                            </span>
                                                            <span className="text-[10px] font-bold text-emerald-700">
                                                                {coupon.discountPercentage}% OFF
                                                            </span>
                                                        </div>

                                                        {isApplied ? (
                                                            <button
                                                                onClick={removeCoupon}
                                                                className="text-[10px] font-black uppercase text-rose-500 hover:underline cursor-pointer"
                                                            >
                                                                Remove
                                                            </button>
                                                        ) : isApplicable ? (
                                                            <button
                                                                onClick={() => handleApplyCoupon(coupon.couponName)}
                                                                disabled={isValidating}
                                                                className="text-[10px] font-black uppercase bg-[#08B36A] hover:bg-[#079c5c] text-white px-3 py-1 rounded-lg shadow-xs cursor-pointer active:scale-95"
                                                            >
                                                                Apply
                                                            </button>
                                                        ) : (
                                                            <span className="text-[9px] font-bold uppercase text-slate-400 bg-slate-200 px-2 py-0.5 rounded">
                                                                Locked
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="mt-2 text-[10px] text-slate-600 font-medium leading-relaxed">
                                                        <p>
                                                            Save up to <strong className="text-slate-900">₹{coupon.maxDiscount || coupon.potentialDiscount || 0}</strong> on orders above ₹{coupon.minOrderAmount}.
                                                        </p>
                                                        
                                                        {/* Validation / Shortfall Warning Callout */}
                                                        {!isApplicable && coupon.validationMessage && (
                                                            <p className="text-[9.5px] font-bold text-amber-700 mt-1 flex items-center gap-1 bg-amber-50 p-1.5 rounded-lg border border-amber-200/60">
                                                                <FaInfoCircle size={10} className="shrink-0" />
                                                                {coupon.validationMessage}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Cost Summary Box */}
                        <div className="bg-white border border-slate-200/90 rounded-[2rem] p-6 shadow-xs space-y-4">
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
                                <div className="flex justify-between text-[#08B36A] font-bold bg-emerald-50/60 p-2 rounded-xl border border-emerald-100/60">
                                    <span>Multiplied Total</span>
                                    <span>₹{totals.subtotal.toFixed(2)}</span>
                                </div>

                                {totals.discount > 0 && (
                                    <div className="flex justify-between text-[#08B36A] font-bold">
                                        <span>Coupon Discount ({appliedCouponName})</span>
                                        <span>-₹{totals.discount.toFixed(2)}</span>
                                    </div>
                                )}

                                {/* HOME COLLECTION FEE WITH BENEFIT APPLIED */}
                                <div className="flex justify-between items-center text-slate-600">
                                    <div>
                                        <span>Home Sample Collection</span>
                                        {totals.subscriptionBenefit.isApplied && (
                                            <span className="block text-[10px] font-bold text-[#059669]">
                                                ✨ Free Delivery ({totals.subscriptionBenefit.planName})
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-right font-bold">
                                        {totals.subscriptionBenefit.isApplied ? (
                                            <div className="flex items-center gap-1.5">
                                                <span className="line-through text-slate-400 text-[11px]">
                                                    ₹{totals.originalHomeCollectionCharge.toFixed(2)}
                                                </span>
                                                <span className="text-[#08B36A] uppercase font-black text-[10px]">
                                                    FREE
                                                </span>
                                            </div>
                                        ) : totals.homeSampleCollectionCharge === 0 ? (
                                            <span className="text-[#08B36A] uppercase font-black text-[10px]">Free</span>
                                        ) : (
                                            <span>₹{totals.homeSampleCollectionCharge.toFixed(2)}</span>
                                        )}
                                    </div>
                                </div>

                                {totals.fastReportCharge > 0 && (
                                    <div className="flex justify-between text-amber-600 font-bold">
                                        <span>Fast Report Charge</span>
                                        <span>+₹{totals.fastReportCharge.toFixed(2)}</span>
                                    </div>
                                )}

                                {/* AMBER WARNING CALLOUT IF QUOTA EXHAUSTED */}
                                {totals.subscriptionBenefit.hasActiveSubscription && totals.subscriptionBenefit.isBenefitExhausted && (
                                    <div className="bg-[#FFFBEB] border border-[#F59E0B] p-3 rounded-xl flex items-start gap-2 text-[#B45309]">
                                        <FaExclamationTriangle className="mt-0.5 shrink-0" size={13} />
                                        <p className="text-[10px] font-bold leading-relaxed">
                                            {totals.subscriptionBenefit.exhaustedMessage || 
                                                `Your ${totals.subscriptionBenefit.planName} quota for free delivery has been exhausted. Standard charges have been applied.`}
                                        </p>
                                    </div>
                                )}

                                <div className="h-px bg-slate-100 my-2" />

                                <div className="flex justify-between items-end">
                                    <div>
                                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Total Payable</span>
                                        <span className="text-[10px] text-slate-400 font-medium">Inclusive of all taxes</span>
                                    </div>
                                    <span className="text-2xl font-black text-[#08B36A]">
                                        ₹{totals.totalAmount.toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={handleProceed}
                                disabled={isCheckingOut}
                                className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer
                                    ${!isCheckingOut ? 'bg-[#08B36A] hover:bg-[#079c5c] text-white shadow-lg shadow-emerald-600/20 active:scale-95' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
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

            {/* CONFIRMATION MODAL WITH SAMPLE COLLECTION OTP */}
            {confirmedBookingData && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2.5rem] max-w-lg w-full border border-slate-100 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        
                        {/* Header Banner */}
                        <div className="bg-gradient-to-br from-[#08B36A] via-[#08B36A] to-emerald-800 p-6 text-white text-center relative shrink-0">
                            <button
                                onClick={() => {
                                    setConfirmedBookingData(null);
                                    router.push('/userscreens/previousorders');
                                }}
                                className="absolute right-4 top-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white/80 hover:text-white transition cursor-pointer"
                            >
                                <FaTimes size={13} />
                            </button>

                            <div className="w-14 h-14 bg-white rounded-2xl mx-auto flex items-center justify-center text-[#08B36A] shadow-lg shadow-black/10 mb-3">
                                <FaCheckCircle size={28} />
                            </div>
                            <h3 className="text-xl font-black tracking-tight">Booking Confirmed!</h3>
                            <p className="text-emerald-100 text-xs font-semibold mt-1">
                                {confirmedBookingData.collectionType === "Home Collection"
                                    ? "A verified phlebotomist will visit your address as scheduled."
                                    : "Please present this booking at the lab diagnostic center."}
                            </p>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto space-y-4 text-xs font-sans">
                            
                            {/* OTP Box */}
                            {confirmedBookingData.pickupOtp && (
                                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-dashed border-emerald-300 rounded-2xl p-4 text-center">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-800 block mb-1">
                                        Sample Collection Security OTP
                                    </span>
                                    <div className="text-3xl font-black tracking-[0.25em] text-[#08B36A] font-mono">
                                        {confirmedBookingData.pickupOtp}
                                    </div>
                                    <p className="text-[10px] text-slate-500 font-medium mt-1">
                                        Share this verification code with the phlebotomist upon doorstep sample collection.
                                    </p>
                                </div>
                            )}

                            {/* Booking ID & Payment Status Row */}
                            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Booking ID</span>
                                    <span className="text-xs font-black text-slate-900 font-mono">
                                        #{confirmedBookingData.bookingId || "ORD-SUCCESS"}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Payment</span>
                                    <span className="inline-flex items-center gap-1 font-black text-xs text-[#08B36A] uppercase">
                                        <FaCheckCircle size={10} />
                                        {confirmedBookingData.paymentStatus === "Paid" ? "Paid Online" : "Pay on Collection (COD)"}
                                    </span>
                                </div>
                            </div>

                            {/* Appointment Schedule & Location */}
                            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-3 shadow-sm">
                                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                    <div className="flex items-center gap-2 text-slate-700 font-bold">
                                        <FaCalendarAlt className="text-[#08B36A]" />
                                        <span>{confirmedBookingData.appointmentDate || selectedAppointment?.date}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                                        <FaClock className="text-[#08B36A]" />
                                        <span>{confirmedBookingData.appointmentTime || selectedAppointment?.slot?.time}</span>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2.5 pt-1">
                                    <FaMapMarkerAlt className="text-[#08B36A] mt-0.5 shrink-0" />
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
                                                Diagnostic lab walk-in visit
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Registered Patients */}
                            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-2 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5">
                                        <FaUsers className="text-[#08B36A]" /> Patients ({(confirmedBookingData.patients || selectedMembers).length})
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {(confirmedBookingData.patients || selectedMembers).map((m, idx) => (
                                        <span key={idx} className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg text-[11px] font-bold border border-slate-200/60">
                                            {m.memberName || m.name || m.patientName}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Prescribed Tests / Packages */}
                            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-2 shadow-sm">
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5">
                                    <FaVial className="text-[#08B36A]" /> Booked Tests ({(confirmedBookingData.tests || labItems).length})
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

                            {/* Total Amount */}
                            <div className="flex justify-between items-center bg-slate-900 text-white p-4 rounded-2xl">
                                <div>
                                    <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest block">
                                        Total Amount
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-medium">Inclusive of all taxes & sample collection</span>
                                </div>
                                <span className="text-xl font-black text-emerald-400">
                                    ₹{Math.round(confirmedBookingData.totalAmount ?? totals.totalAmount).toLocaleString()}
                                </span>
                            </div>

                        </div>

                        {/* Modal Actions */}
                        <div className="p-5 border-t border-slate-100 bg-slate-50 flex gap-3 shrink-0">
                            <button
                                onClick={() => {
                                    setConfirmedBookingData(null);
                                    router.push('/userscreens/previousorders');
                                }}
                                className="flex-1 bg-[#08B36A] hover:bg-[#079c5c] text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/20 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <span>Track Appointment</span>
                                <FaExternalLinkAlt size={10} />
                            </button>
                            <button
                                onClick={() => {
                                    setConfirmedBookingData(null);
                                    router.push('/');
                                }}
                                className="px-5 py-3.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-2xl font-bold text-xs uppercase transition cursor-pointer"
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