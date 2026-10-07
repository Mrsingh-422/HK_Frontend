"use client";

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    FaPills, FaSpinner, FaTruck, FaFilePrescription,
    FaMinus, FaPlus, FaClock,
    FaCalendarAlt, FaChevronRight, FaCamera, FaTrash,
    FaCheckCircle, FaStore, FaShieldAlt, FaGift, FaTimes, FaGem,
    FaCreditCard, FaMoneyBillWave, FaLock, FaMapMarkerAlt,
    FaExternalLinkAlt, FaReceipt, FaBoxOpen, FaExclamationTriangle,
    FaArrowRight, FaTag, FaBolt, FaStar, FaCalendarDay
} from 'react-icons/fa';
import { useCart } from '@/app/context/CartContext';
import toast from 'react-hot-toast';
import UserAPI from '@/app/services/UserAPI';

// Modular Components
import PharmacyAddressSection from './PharmacyAddressSection';
import PharmacyCouponSection from './PharmacyCouponSection';
import PharmacyDeliverySection from './PharmacyDeliverySection';
import PharmacySlotModal from './PharmacySlotModal';

// Load Razorpay SDK script
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

const PharmacyCart = () => {
    const router = useRouter();
    const { pharmacyCart, updatePharmacyCartQuantity, loading, removePharmacyItem, clearFullCart } = useCart();

    // Coupons & Pricing States
    const [availableCoupons, setAvailableCoupons] = useState([]);
    const [couponCode, setCouponCode] = useState("");
    const [appliedCouponName, setAppliedCouponName] = useState(null);
    const [couponDiscountAmount, setCouponDiscountAmount] = useState(0);
    const [couponError, setCouponError] = useState("");
    const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

    // Addresses
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [isAddressLoading, setIsAddressLoading] = useState(false);

    // Delivery & Slots ('fast' = 1-hr Express | 'standard' = 3-hr Standard | 'slot' = Scheduled)
    const [deliveryOption, setDeliveryOption] = useState('fast'); 
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [rawSlotData, setRawSlotData] = useState(null);
    const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);

    // Collection Type ('Home Delivery' | 'Self Pickup')
    const [collectionType, setCollectionType] = useState('Home Delivery');

    // Payment Method & COD
    const [paymentMethod, setPaymentMethod] = useState("Online"); // 'Online' | 'COD'
    const [isCodAvailable, setIsCodAvailable] = useState(true);

    // Server-side Checkout Summary
    const [serverCheckout, setServerCheckout] = useState(null);
    const [isFetchingSummary, setIsFetchingSummary] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Prescription & Images
    const [prescriptionFiles, setPrescriptionFiles] = useState([]);
    const [zoomedImage, setZoomedImage] = useState(null);

    // Order Success Modal Details
    const [orderConfirmedData, setOrderConfirmedData] = useState(null);

    const pharmacyItems = useMemo(() => pharmacyCart?.items || [], [pharmacyCart]);
    
    // Safely resolve pharmacyId
    const pharmacyId = useMemo(() => {
        return (
            pharmacyCart?.pharmacyId?._id || 
            pharmacyCart?.pharmacyId || 
            pharmacyCart?.vendorId || 
            pharmacyCart?.items?.[0]?.pharmacyId?._id || 
            pharmacyCart?.items?.[0]?.pharmacyId ||
            pharmacyCart?.items?.[0]?.medicineId?.pharmacyId ||
            ""
        );
    }, [pharmacyCart]);

    // Check if items require prescription
    const clientNeedsRx = useMemo(() => {
        return pharmacyItems.some(item => item.medicineId?.prescription_required === "YES");
    }, [pharmacyItems]);

    const isRxMandatory = useMemo(() => {
        return serverCheckout?.rxMandatory || serverCheckout?.orderRestrictions?.needsPrescription || clientNeedsRx;
    }, [serverCheckout, clientNeedsRx]);

    // Prescription Images Upload
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (prescriptionFiles.length + files.length > 5) {
            return toast.error("Maximum 5 prescription images allowed");
        }
        const validFiles = files.filter(file => file.type.startsWith('image/') || file.type === 'application/pdf');
        if (validFiles.length !== files.length) {
            toast.error("Only image or PDF files are allowed");
        }
        setPrescriptionFiles(prev => [...prev, ...validFiles]);
        e.target.value = null;
    };

    const removeFile = (index) => {
        setPrescriptionFiles(prev => prev.filter((_, i) => i !== index));
    };

    // 1. Fetch Addresses & Available Coupons (/user/pharmacy/available-coupons)
    useEffect(() => {
        const initData = async () => {
            try {
                setIsAddressLoading(true);

                const [addrRes, couponRes] = await Promise.all([
                    UserAPI.getUserAddresses(),
                    UserAPI.getPharmacyCoupons(pharmacyId)
                ]);

                if (addrRes?.success && addrRes.data?.length > 0) {
                    setAddresses(addrRes.data);
                    const defaultAddr = addrRes.data.find(a => a.isDefault) || addrRes.data[0];
                    setSelectedAddress(defaultAddr);
                }
                if (couponRes?.success && Array.isArray(couponRes.data)) {
                    setAvailableCoupons(couponRes.data);
                }
            } catch (error) {
                console.error("Initialization error:", error);
            } finally {
                setIsAddressLoading(false);
            }
        };

        if (pharmacyItems.length > 0) {
            initData();
        }
    }, [pharmacyItems.length, pharmacyId]);

    // 2. Fetch Server Checkout Summary (POST /user/pharmacy/checkout)
    const fetchPharmacySummary = useCallback(async () => {
        if (pharmacyItems.length === 0) return;

        try {
            setIsFetchingSummary(true);

            const isSlotMode = deliveryOption === 'slot' && Boolean(rawSlotData?.date);

            const payload = {
                collectionType: collectionType,
                isRapid: deliveryOption === 'fast',
                isSlotSelected: isSlotMode,
                appointmentDate: isSlotMode ? rawSlotData.date : undefined,
                appointmentTime: isSlotMode ? (rawSlotData.time || undefined) : undefined,
                couponCode: appliedCouponName || ""
            };

            const res = await UserAPI.checkoutPharmacyOrder(payload);

            if (res?.success && res.data) {
                setServerCheckout(res.data);
                const codStatus = Boolean(res.data.orderRestrictions?.isCodAvailable ?? true);
                setIsCodAvailable(codStatus);

                if (!codStatus && paymentMethod === "COD") {
                    setPaymentMethod("Online");
                }
            }
        } catch (error) {
            console.error("Checkout Summary Error:", error);
        } finally {
            setIsFetchingSummary(false);
        }
    }, [collectionType, deliveryOption, rawSlotData, appliedCouponName, pharmacyItems.length, paymentMethod]);

    useEffect(() => {
        fetchPharmacySummary();
    }, [fetchPharmacySummary]);

    // 3. Validate & Apply Coupon (POST /user/pharmacy/validate-coupon)
    const handleApplyCoupon = async (name) => {
        const codeToApply = (name || couponCode).trim().toUpperCase();
        if (!codeToApply) return toast.error("Please enter a coupon code");

        setIsValidatingCoupon(true);
        setCouponError("");

        try {
            const rawSubtotal = pharmacyItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
            const res = await UserAPI.validatePharmacyCoupon(codeToApply, pharmacyId, rawSubtotal);

            if (res?.success && res.data) {
                setAppliedCouponName(res.data.couponCode || codeToApply);
                setCouponDiscountAmount(res.data.discountAmount || 0);
                setCouponCode("");
                setCouponError("");
                toast.success(res.message || `Coupon "${codeToApply}" applied! Saved ₹${res.data.discountAmount}`);
            } else {
                const errorMsg = res?.message || "Invalid or expired coupon.";
                setCouponError(errorMsg);
                toast.error(errorMsg);
                setAppliedCouponName(null);
                setCouponDiscountAmount(0);
            }
        } catch (error) {
            console.error("Coupon validation error:", error);
            const errorMsg = error.response?.data?.message || error.message || "Failed to validate coupon";
            setCouponError(errorMsg);
            toast.error(errorMsg);
            setAppliedCouponName(null);
            setCouponDiscountAmount(0);
        } finally {
            setIsValidatingCoupon(false);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCouponName(null);
        setCouponDiscountAmount(0);
        setCouponCode("");
        setCouponError("");
        toast.success("Coupon removed");
    };

    // 4. Computed Final Bill Totals based on Costing Matrix
    const billSummary = useMemo(() => {
        const subBenefit = serverCheckout?.subscriptionBenefit || {};
        const isSlotMode = deliveryOption === 'slot';
        const isRapid = deliveryOption === 'fast';

        if (serverCheckout?.billSummary) {
            const b = serverCheckout.billSummary;
            return {
                itemTotal: b.itemTotal ?? 0,
                originalItemTotal: b.originalItemTotal ?? b.itemTotal ?? 0,
                comboSavings: b.comboSavings ?? 0,
                couponDiscount: b.couponDiscount ?? couponDiscountAmount,
                deliveryCharge: b.deliveryCharge ?? 0,
                originalDeliveryCharge: b.originalDeliveryCharge ?? b.deliveryCharge ?? 50,
                rapidDeliveryCharge: b.rapidDeliveryCharge ?? 0,
                slotCharge: b.slotCharge ?? 0,
                totalAmount: b.totalAmount ?? 0,
                selectedDeliveryMode: serverCheckout?.selectedDeliveryMode || (
                    isRapid ? "1-Hour Express Delivery" : 
                    isSlotMode ? `Scheduled Slot (${selectedSlot})` : 
                    "Standard Delivery (3 Hours)"
                ),
                subscriptionBenefit: {
                    isApplied: Boolean(subBenefit.isApplied),
                    hasActiveSubscription: Boolean(subBenefit.hasActiveSubscription),
                    isBenefitExhausted: Boolean(subBenefit.isBenefitExhausted),
                    remainingCount: subBenefit.remainingCount ?? 0,
                    planName: subBenefit.planName || "",
                    benefitField: subBenefit.benefitField || "freePharmacyDeliveriesCount",
                    exhaustedMessage: subBenefit.exhaustedMessage || ""
                }
            };
        }

        const fallbackItemTotal = pharmacyItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        let fallbackDelivery = 0;
        let fallbackRapid = 0;
        let fallbackSlot = 0;

        if (collectionType === "Home Delivery") {
            if (isRapid) {
                fallbackRapid = 100;
            } else if (isSlotMode) {
                fallbackSlot = rawSlotData?.fee || 0;
            } else {
                fallbackDelivery = 50;
            }
        }

        const fallbackTotal = Math.max(0, fallbackItemTotal - couponDiscountAmount + fallbackDelivery + fallbackRapid + fallbackSlot);

        return {
            itemTotal: fallbackItemTotal,
            originalItemTotal: fallbackItemTotal,
            comboSavings: 0,
            couponDiscount: couponDiscountAmount,
            deliveryCharge: fallbackDelivery,
            originalDeliveryCharge: 50,
            rapidDeliveryCharge: fallbackRapid,
            slotCharge: fallbackSlot,
            totalAmount: fallbackTotal,
            selectedDeliveryMode: isRapid ? "1-Hour Express Delivery" : isSlotMode ? `Scheduled Slot (${selectedSlot})` : "Standard Delivery (3 Hours)",
            subscriptionBenefit: {
                isApplied: false,
                hasActiveSubscription: false,
                isBenefitExhausted: false,
                remainingCount: 0,
                planName: "",
                benefitField: "freePharmacyDeliveriesCount",
                exhaustedMessage: ""
            }
        };
    }, [serverCheckout, pharmacyItems, couponDiscountAmount, deliveryOption, collectionType, rawSlotData, selectedSlot]);

    // 5. Place Order & Razorpay Flow (POST /user/pharmacy/place-order)
    const onConfirmCheckout = async () => {
        if (collectionType === "Home Delivery" && !selectedAddress) {
            return toast.error("Please select a delivery address");
        }
        if (isRxMandatory && prescriptionFiles.length === 0) {
            return toast.error("Prescription is required for one or more medicines in your cart. Please upload prescription images.");
        }

        setIsSubmitting(true);

        try {
            const isZeroTotal = Math.round(billSummary.totalAmount) === 0;
            const finalPaymentMethod = isZeroTotal ? "COD" : paymentMethod;
            const isSlotMode = deliveryOption === 'slot' && Boolean(rawSlotData?.date);

            const formData = new FormData();
            formData.append("collectionType", collectionType);
            formData.append("paymentMethod", finalPaymentMethod);
            formData.append("isRapid", String(deliveryOption === 'fast'));
            formData.append("isSlotSelected", String(isSlotMode));

            if (appliedCouponName) {
                formData.append("couponCode", appliedCouponName);
            }

            if (isSlotMode && rawSlotData?.date) {
                formData.append("appointmentDate", rawSlotData.date);
                if (rawSlotData.time) {
                    formData.append("appointmentTime", rawSlotData.time);
                }
            }

            if (collectionType === "Home Delivery" && selectedAddress) {
                const addressData = {
                    name: selectedAddress.name || "Recipient",
                    phone: selectedAddress.phone || "",
                    houseNo: selectedAddress.houseNo || "",
                    sector: selectedAddress.sector || "",
                    city: selectedAddress.city || "",
                    state: selectedAddress.state || "",
                    pincode: selectedAddress.pincode || "",
                    addressType: selectedAddress.addressType || "Home"
                };
                formData.append("address", JSON.stringify(addressData));
            }

            prescriptionFiles.forEach((file) => {
                formData.append("prescriptionImages", file);
            });

            const res = await UserAPI.placePharmacyOrder(formData);

            if (!res?.success) {
                toast.error(res?.message || "Failed to place order");
                setIsSubmitting(false);
                return;
            }

            // Direct Confirmation for COD or Free Booking
            if (finalPaymentMethod === "COD" || isZeroTotal) {
                await clearFullCart();
                setOrderConfirmedData({
                    ...(res.data || {}),
                    orderId: res.orderId || res.data?.orderId || "MED-SUCCESS",
                    status: res.data?.status || "Placed",
                    paymentStatus: isZeroTotal ? "Paid" : "Pending",
                    paymentMethod: finalPaymentMethod,
                    deliveryOTP: res.data?.deliveryOTP || res.deliveryOTP,
                    items: pharmacyItems,
                    address: selectedAddress,
                    billSummary: res.data?.billSummary || billSummary,
                    deliveryOption: billSummary.selectedDeliveryMode
                });
                setIsSubmitting(false);
                return;
            }

            // Online Payment via Razorpay
            const isScriptLoaded = await loadRazorpayScript();
            if (!isScriptLoaded) {
                toast.error("Failed to load Razorpay SDK.");
                setIsSubmitting(false);
                return;
            }

            let keyId = res.key_id || res.key || res.data?.key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
            if (typeof keyId === 'string' && keyId.startsWith("zp_")) {
                keyId = "r" + keyId;
            }

            const amount = res.amount || res.data?.amount || Math.round(billSummary.totalAmount * 100);
            const razorpayOrderId = res.razorpayOrderId || res.data?.razorpayOrderId;
            const appointmentId = res.bookingId || res.orderId || res.data?._id;

            if (!keyId) {
                toast.error("Razorpay Key not found. Please try Pay on Delivery.");
                setIsSubmitting(false);
                return;
            }

            const options = {
                key: keyId,
                amount: amount,
                currency: "INR",
                name: "Health Kangaroo Pharmacy",
                description: "Medicine Order Payment",
                order_id: razorpayOrderId,
                prefill: {
                    name: selectedAddress?.name || "Customer",
                    contact: selectedAddress?.phone || ""
                },
                theme: { color: "#08B36A" },
                modal: {
                    ondismiss: () => {
                        setIsSubmitting(false);
                        toast.error("Payment was cancelled");
                    }
                },
                handler: async function (response) {
                    try {
                        setIsSubmitting(true);
                        const verificationPayload = {
                            appointmentId: appointmentId,
                            razorpayOrderId: response.razorpay_order_id || razorpayOrderId,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature
                        };

                        const verificationRes = await UserAPI.verifyPaymentPharmacy(verificationPayload);

                        if (verificationRes?.success) {
                            await clearFullCart();
                            setOrderConfirmedData({
                                ...(verificationRes.data || res.data || {}),
                                orderId: res.orderId || verificationRes.data?.orderId || "MED-SUCCESS",
                                status: "Placed",
                                paymentStatus: "Paid",
                                paymentMethod: "Online",
                                deliveryOTP: verificationRes.data?.deliveryOTP || res.deliveryOTP,
                                items: pharmacyItems,
                                address: selectedAddress,
                                billSummary: res.data?.billSummary || billSummary,
                                deliveryOption: billSummary.selectedDeliveryMode
                            });
                        } else {
                            toast.error(verificationRes?.message || "Payment verification failed.");
                        }
                    } catch (verificationError) {
                        toast.error("An error occurred during payment verification.");
                    } finally {
                        setIsSubmitting(false);
                    }
                }
            };

            const rzpInstance = new window.Razorpay(options);
            rzpInstance.open();

        } catch (error) {
            console.error("Order error:", error);
            toast.error(error.response?.data?.message || "Failed to place order");
            setIsSubmitting(false);
        }
    };

    if (loading && pharmacyItems.length === 0) {
        return <div className="p-20 text-center font-bold text-slate-400 animate-pulse uppercase tracking-widest">Syncing Cart...</div>;
    }

    if (pharmacyItems.length === 0 && !orderConfirmedData) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <FaPills className="text-slate-200 text-7xl mb-6" />
                <h2 className="text-2xl font-black text-slate-800">Your Medicine Cart is Empty</h2>
                <button
                    onClick={() => router.push('/buymedicine')}
                    className="mt-6 bg-[#08B36A] hover:bg-[#079c5c] text-white px-8 py-3.5 rounded-2xl font-black uppercase text-xs tracking-wider shadow-lg shadow-emerald-600/20 cursor-pointer"
                >
                    Browse Medicines
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
                        {billSummary.subscriptionBenefit?.isApplied && (
                            <div className="bg-[#ECFDF5] border border-[#10B981] p-4.5 rounded-2xl flex items-center justify-between shadow-xs">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white text-[#059669] flex items-center justify-center shadow-xs border border-emerald-100">
                                        <FaGem size={18} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-[#059669] uppercase tracking-tight">
                                            ✨ Free Delivery Applied via {billSummary.subscriptionBenefit.planName}
                                        </p>
                                        <p className="text-[11px] font-semibold text-emerald-800 mt-0.5">
                                            Medicine delivery fee (₹0) waived automatically.
                                        </p>
                                    </div>
                                </div>
                                <span className="bg-[#08B36A] text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase">
                                    {billSummary.subscriptionBenefit.remainingCount} Left
                                </span>
                            </div>
                        )}

                        {/* COD Badge */}
                        {isCodAvailable && (
                            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <FaGem className="text-[#08B36A]" />
                                    <p className="text-xs font-bold text-emerald-900 uppercase tracking-tight">
                                        Cash on Delivery (COD) Unlocked for your Account
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* SECTION 1: ITEMS */}
                        <div className="space-y-4">
                            <h2 className="text-xs font-black text-slate-400 uppercase tracking-[2px] flex items-center gap-2 px-1">
                                <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">1</span>
                                Review Items ({pharmacyItems.length})
                            </h2>

                            <div className="space-y-3">
                                {pharmacyItems.map((item) => (
                                    <div key={item._id} className="bg-white border border-slate-200/90 rounded-2xl p-4 flex flex-col shadow-xs">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 flex-shrink-0 overflow-hidden">
                                                {item.medicineId?.image_url?.[0] ? (
                                                    <img src={item.medicineId.image_url[0]} className="w-full h-full object-contain p-2 mix-blend-multiply" alt="Med" />
                                                ) : (
                                                    <FaPills size={20} className="text-[#08B36A] opacity-30" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="font-bold text-slate-900 text-sm">{item.name}</h3>
                                                        <p className="text-[10px] font-black text-[#08B36A] uppercase tracking-tighter mt-0.5">{item.medicineId?.manufacturers}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-black text-slate-900 text-base">₹{(item.price * item.quantity).toLocaleString()}</p>
                                                        <button onClick={() => removePharmacyItem(item.medicineId?._id || item.medicineId)} className="text-[10px] text-rose-500 font-bold uppercase hover:underline cursor-pointer">Remove</button>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between mt-2">
                                                    <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg w-fit overflow-hidden">
                                                        <button onClick={() => updatePharmacyCartQuantity(item.medicineId?._id || item.medicineId, 'dec')} className="px-2.5 py-1 text-slate-400 hover:text-slate-800 cursor-pointer"><FaMinus size={9} /></button>
                                                        <span className="px-3 text-xs font-black text-slate-900 border-x border-slate-200">{item.quantity}</span>
                                                        <button onClick={() => updatePharmacyCartQuantity(item.medicineId?._id || item.medicineId, 'inc')} className="px-2.5 py-1 text-slate-400 hover:text-slate-800 cursor-pointer"><FaPlus size={9} /></button>
                                                    </div>
                                                    {item.medicineId?.prescription_required === "YES" && (
                                                        <span className="flex items-center gap-1 text-rose-500 text-[9px] font-black uppercase bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                                                            <FaFilePrescription size={9} /> Prescription Needed
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* SECTION 2: PRESCRIPTION UPLOAD */}
                        {isRxMandatory && (
                            <div className="space-y-4">
                                <h2 className="text-xs font-black text-slate-400 uppercase tracking-[2px] flex items-center gap-2 px-1">
                                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">2</span>
                                    Upload Prescription
                                </h2>
                                <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center">
                                    <div className="max-w-xs mx-auto">
                                        <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <FaCamera className="text-rose-500" size={18} />
                                        </div>
                                        <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-1">Prescription Required</h3>
                                        <p className="text-[11px] text-slate-400 font-medium mb-4">Please upload a valid prescription for regulated medicines.</p>
                                        <label className="inline-flex items-center justify-center px-5 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer hover:bg-slate-800 transition-colors">
                                            <span>Select Prescription</span>
                                            <input type="file" hidden accept="image/*,application/pdf" multiple onChange={handleFileChange} />
                                        </label>
                                        
                                        {prescriptionFiles.length > 0 && (
                                            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-2.5 justify-center">
                                                {prescriptionFiles.map((file, idx) => {
                                                    const imgUrl = URL.createObjectURL(file);
                                                    return (
                                                        <div key={idx} className="relative w-14 h-14 rounded-xl overflow-hidden border-2 border-[#08B36A] cursor-pointer" onClick={() => setZoomedImage(imgUrl)}>
                                                            <img src={imgUrl} className="w-full h-full object-cover" alt="RX" />
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                                                                className="absolute top-0.5 right-0.5 w-4 h-4 bg-rose-500 text-white rounded-full flex items-center justify-center shadow"
                                                            >
                                                                <FaTrash size={7} />
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* SECTION 3: DELIVERY PREFERENCE */}
                        <div className="space-y-4">
                            <h2 className="text-xs font-black text-slate-400 uppercase tracking-[2px] flex items-center gap-2 px-1">
                                <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">3</span>
                                Delivery Speed
                            </h2>
                            <PharmacyDeliverySection
                                deliveryOption={deliveryOption}
                                setDeliveryOption={setDeliveryOption}
                                selectedSlot={selectedSlot}
                                openSlotModal={() => setIsSlotModalOpen(true)}
                            />
                        </div>

                        {/* SECTION 4: DELIVERY ADDRESS */}
                        <div className="space-y-4">
                            <h2 className="text-xs font-black text-slate-400 uppercase tracking-[2px] flex items-center gap-2 px-1">
                                <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">4</span>
                                Delivery Address
                            </h2>
                            <PharmacyAddressSection
                                addresses={addresses}
                                selectedAddress={selectedAddress}
                                setSelectedAddress={setSelectedAddress}
                                isLoading={isAddressLoading}
                            />
                        </div>

                        {/* SECTION 5: PAYMENT METHOD SELECTOR */}
                        <div className="space-y-4">
                            <h2 className="text-xs font-black text-slate-400 uppercase tracking-[2px] flex items-center gap-2 px-1">
                                <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">5</span>
                                Payment Method
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod("Online")}
                                    className={`p-4 rounded-2xl border transition-all text-left flex items-center justify-between cursor-pointer
                                        ${paymentMethod === "Online" ? 'border-[#08B36A] bg-emerald-50/40 ring-1 ring-[#08B36A]/20' : 'bg-white border-slate-200'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-emerald-100 text-[#08B36A] rounded-xl">
                                            <FaCreditCard size={15} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-slate-900">Pay Online</p>
                                            <p className="text-[10px] text-slate-500">UPI, Cards, NetBanking</p>
                                        </div>
                                    </div>
                                    {paymentMethod === "Online" && <FaCheckCircle className="text-[#08B36A]" size={15} />}
                                </button>

                                <button
                                    type="button"
                                    disabled={!isCodAvailable}
                                    onClick={() => setPaymentMethod("COD")}
                                    className={`p-4 rounded-2xl border transition-all text-left flex items-center justify-between relative cursor-pointer
                                        ${!isCodAvailable ? 'opacity-40 cursor-not-allowed bg-slate-50 border-slate-200' : ''}
                                        ${paymentMethod === "COD" ? 'border-[#08B36A] bg-emerald-50/40 ring-1 ring-[#08B36A]/20' : 'bg-white border-slate-200'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-slate-100 text-slate-700 rounded-xl">
                                            <FaMoneyBillWave size={15} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-slate-900">Cash on Delivery (COD)</p>
                                            <p className="text-[10px] text-slate-500">
                                                {isCodAvailable ? "Pay cash when delivered" : "Unavailable for this order"}
                                            </p>
                                        </div>
                                    </div>
                                    {paymentMethod === "COD" && <FaCheckCircle className="text-[#08B36A]" size={15} />}
                                </button>
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN: BILL SUMMARY & CHECKOUT BUTTON */}
                    <div className="w-full lg:w-[400px] space-y-6 sticky top-6">
                        
                        {/* Coupon Section */}
                        <PharmacyCouponSection
                            availableCoupons={availableCoupons}
                            couponCode={couponCode}
                            setCouponCode={setCouponCode}
                            appliedCouponName={appliedCouponName}
                            setAppliedCouponName={setAppliedCouponName}
                            couponError={couponError}
                            setServerDiscount={setCouponDiscountAmount}
                            handleApplyCoupon={handleApplyCoupon}
                            isValidating={isValidatingCoupon}
                            onRemoveCoupon={handleRemoveCoupon}
                        />

                        {/* Order Bill Summary Box Styled Strictly Per Guidelines */}
                        <div className="bg-white rounded-[2rem] p-6 border border-slate-200/90 shadow-xs space-y-4">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Order Bill Summary</h3>
                            
                            <div className="space-y-3 text-xs">
                                
                                {/* 1. Base Item Total */}
                                <div className="flex justify-between text-slate-600">
                                    <span>Item Total</span>
                                    <span className="font-bold text-slate-900">₹{billSummary.itemTotal.toFixed(2)}</span>
                                </div>

                                {/* 2. Combo / BOGO Savings */}
                                {billSummary.comboSavings > 0 && (
                                    <div className="flex justify-between text-[#08B36A] font-bold">
                                        <span>Combo / BOGO Savings</span>
                                        <span>-₹{billSummary.comboSavings.toFixed(2)}</span>
                                    </div>
                                )}

                                {/* 3. Coupon Discount */}
                                {billSummary.couponDiscount > 0 && (
                                    <div className="flex justify-between text-[#08B36A] font-bold">
                                        <span className="flex items-center gap-1"><FaTag size={10} /> Promo Discount</span>
                                        <span>-₹{billSummary.couponDiscount.toFixed(2)}</span>
                                    </div>
                                )}

                                {/* 4. Standard Delivery Charge (Only when No Slot & No Rapid) */}
                                {billSummary.rapidDeliveryCharge === 0 && billSummary.slotCharge === 0 && deliveryOption !== 'slot' && (
                                    <div className="flex justify-between items-center text-slate-600">
                                        <div>
                                            <span>Delivery Charge</span>
                                            {billSummary.subscriptionBenefit?.isApplied && (
                                                <span className="block text-[10px] font-bold text-[#059669]">
                                                    ✨ Free Delivery Applied via {billSummary.subscriptionBenefit.planName}
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-right font-bold text-slate-900">
                                            {billSummary.subscriptionBenefit?.isApplied ? (
                                                <div className="flex items-center gap-1.5 justify-end">
                                                    <span className="line-through text-slate-400 text-[11px]">
                                                        ₹{billSummary.originalDeliveryCharge.toFixed(2)}
                                                    </span>
                                                    <span className="text-[#08B36A] uppercase font-black text-[10px]">
                                                        FREE
                                                    </span>
                                                </div>
                                            ) : billSummary.deliveryCharge === 0 ? (
                                                <span className="text-[#08B36A] uppercase font-black text-[10px]">FREE</span>
                                            ) : (
                                                <span>₹{billSummary.deliveryCharge.toFixed(2)}</span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* 5. Express 1-Hour Charge */}
                                {billSummary.rapidDeliveryCharge > 0 && (
                                    <div className="flex justify-between text-amber-600 font-bold">
                                        <span className="flex items-center gap-1.5"><FaBolt size={11} /> ⚡ 1-Hour Express Delivery</span>
                                        <span>+₹{billSummary.rapidDeliveryCharge.toFixed(2)}</span>
                                    </div>
                                )}

                                {/* 6. Premium Slot Charge */}
                                {billSummary.slotCharge > 0 && (
                                    <div className="flex justify-between text-purple-700 font-bold">
                                        <span className="flex items-center gap-1.5"><FaStar size={11} /> ⭐ Premium Slot Charge</span>
                                        <span>+₹{billSummary.slotCharge.toFixed(2)}</span>
                                    </div>
                                )}

                                {/* 7. Regular Free Slot */}
                                {billSummary.slotCharge === 0 && (billSummary.selectedDeliveryMode.includes('Scheduled Slot') || deliveryOption === 'slot') && (
                                    <div className="flex justify-between text-[#08B36A] font-bold">
                                        <span className="flex items-center gap-1.5"><FaCalendarDay size={11} /> 📅 Scheduled Slot</span>
                                        <span>FREE (₹0)</span>
                                    </div>
                                )}

                                {/* Quota Exhausted Warning Banner */}
                                {billSummary.subscriptionBenefit?.hasActiveSubscription && billSummary.subscriptionBenefit?.isBenefitExhausted && (
                                    <div className="bg-[#FFFBEB] border border-[#F59E0B] p-3 rounded-xl flex items-start gap-2 text-[#B45309]">
                                        <FaExclamationTriangle className="mt-0.5 shrink-0" size={13} />
                                        <p className="text-[10px] font-bold leading-relaxed">
                                            {billSummary.subscriptionBenefit.exhaustedMessage || 
                                                `Your ${billSummary.subscriptionBenefit.planName} quota for free delivery has been exhausted. Standard charges have been applied.`}
                                        </p>
                                    </div>
                                )}

                                <div className="h-px bg-slate-100 my-2" />

                                {/* Total Payable Amount */}
                                <div className="flex justify-between items-end">
                                    <div>
                                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Total Payable</span>
                                        <span className="text-[10px] text-slate-400 font-medium">Inclusive of all taxes & delivery</span>
                                    </div>
                                    <span className="text-2xl font-black text-[#08B36A]">
                                        ₹{billSummary.totalAmount.toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            <button
                                disabled={isSubmitting || isFetchingSummary || (isRxMandatory && prescriptionFiles.length === 0)}
                                onClick={onConfirmCheckout}
                                className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer
                                    ${(!isSubmitting && !isFetchingSummary && (!isRxMandatory || prescriptionFiles.length > 0))
                                        ? 'bg-[#08B36A] hover:bg-[#079c5c] text-white shadow-lg shadow-emerald-600/20 active:scale-95'
                                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                            >
                                {isSubmitting || isFetchingSummary ? (
                                    <FaSpinner className="animate-spin" size={14} />
                                ) : billSummary.totalAmount === 0 ? (
                                    <>Confirm Free Order <FaCheckCircle size={12} /></>
                                ) : paymentMethod === "COD" ? (
                                    <>Place Order (Pay on Delivery) <FaTruck size={13} /></>
                                ) : (
                                    <>Proceed to Pay ₹{billSummary.totalAmount.toFixed(2)} <FaLock size={10} /></>
                                )}
                            </button>
                        </div>

                    </div>
                </div>
            </div>

            {/* Delivery Slot Modal */}
            <PharmacySlotModal
                isOpen={isSlotModalOpen}
                onClose={() => setIsSlotModalOpen(false)}
                pharmacyId={pharmacyId}
                onSelectSlot={(data) => {
                    setSelectedSlot(data.displayText);
                    setRawSlotData({ date: data.apiDate, time: data.apiTime, fee: data.fee });
                    setDeliveryOption('slot');
                    setIsSlotModalOpen(false);
                }}
            />

            {/* Lightbox / Zoomed Prescription Modal */}
            {zoomedImage && (
                <div
                    className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm cursor-pointer"
                    onClick={() => setZoomedImage(null)}
                >
                    <div className="relative max-w-4xl max-h-[85vh] w-full h-full flex items-center justify-center">
                        <button
                            onClick={() => setZoomedImage(null)}
                            className="absolute top-4 right-4 z-50 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors cursor-pointer"
                        >
                            <FaTimes size={20} />
                        </button>
                        <img
                            src={zoomedImage}
                            className="max-w-full max-h-full object-contain rounded-2xl"
                            alt="Prescription Large"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}

            {/* CONFIRMATION MODAL */}
            {orderConfirmedData && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2.5rem] max-w-lg w-full border border-slate-100 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        
                        {/* Header Banner */}
                        <div className="bg-gradient-to-br from-[#08B36A] via-[#08B36A] to-emerald-800 p-6 text-white text-center relative shrink-0">
                            <button
                                onClick={() => {
                                    setOrderConfirmedData(null);
                                    router.push('/userscreens/previousorders');
                                }}
                                className="absolute right-4 top-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white/80 hover:text-white transition cursor-pointer"
                            >
                                <FaTimes size={13} />
                            </button>

                            <div className="w-14 h-14 bg-white rounded-2xl mx-auto flex items-center justify-center text-[#08B36A] shadow-lg shadow-black/10 mb-3">
                                <FaBoxOpen size={28} />
                            </div>
                            <h3 className="text-xl font-black tracking-tight">Order Placed Successfully!</h3>
                            <p className="text-emerald-100 text-xs font-semibold mt-1">
                                Your medicines are packed & being dispatched from the licensed pharmacy.
                            </p>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto space-y-4 text-xs font-sans">
                            
                            {/* Delivery OTP */}
                            {orderConfirmedData.deliveryOTP && (
                                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-dashed border-emerald-300 rounded-2xl p-4 text-center">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-800 block mb-1">
                                        Package Delivery Security OTP
                                    </span>
                                    <div className="text-3xl font-black tracking-[0.25em] text-[#08B36A] font-mono">
                                        {orderConfirmedData.deliveryOTP}
                                    </div>
                                    <p className="text-[10px] text-slate-500 font-medium mt-1">
                                        Share this verification code with the delivery rider upon package arrival.
                                    </p>
                                </div>
                            )}

                            {/* Order ID & Payment */}
                            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Order ID</span>
                                    <span className="text-xs font-black text-slate-900 font-mono">
                                        {orderConfirmedData.orderId || "MED-SUCCESS"}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Payment</span>
                                    <span className="inline-flex items-center gap-1 font-black text-xs text-[#08B36A] uppercase">
                                        <FaCheckCircle size={10} />
                                        {orderConfirmedData.paymentMethod === "Online" ? "Paid Online" : "Pay on Delivery (COD)"}
                                    </span>
                                </div>
                            </div>

                            {/* Delivery Speed & Address */}
                            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-3 shadow-sm">
                                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                    <div className="flex items-center gap-2 text-slate-700 font-bold">
                                        <FaTruck className="text-[#08B36A]" />
                                        <span>{orderConfirmedData.deliveryOption || "Standard Home Delivery"}</span>
                                    </div>
                                    <span className="bg-emerald-50 text-[#08B36A] text-[10px] font-black uppercase px-2 py-0.5 rounded border border-emerald-100">
                                        {orderConfirmedData.status || "Placed"}
                                    </span>
                                </div>

                                <div className="flex items-start gap-2.5 pt-1">
                                    <FaMapMarkerAlt className="text-[#08B36A] mt-0.5 shrink-0" />
                                    <div>
                                        <span className="font-black text-slate-900 uppercase text-[10px] block">
                                            {orderConfirmedData.address?.name || selectedAddress?.name || "Recipient"} ({orderConfirmedData.address?.phone || selectedAddress?.phone || "Contact"})
                                        </span>
                                        <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-0.5">
                                            {orderConfirmedData.address?.houseNo || selectedAddress?.houseNo}, {orderConfirmedData.address?.sector || selectedAddress?.sector}, {orderConfirmedData.address?.city || selectedAddress?.city}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Ordered Medicines Summary */}
                            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-2 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5">
                                        <FaPills className="text-[#08B36A]" /> Ordered Items ({(orderConfirmedData.items || pharmacyItems).length})
                                    </span>
                                </div>
                                <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                                    {(orderConfirmedData.items || pharmacyItems).map((med, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-[11px] text-slate-700 font-medium py-1 border-b border-slate-50 last:border-0">
                                            <div className="truncate max-w-[240px]">
                                                <p className="font-bold text-slate-900 truncate">{med.name}</p>
                                                <p className="text-[9px] text-slate-400">Qty: {med.quantity}</p>
                                            </div>
                                            <span className="font-black text-slate-900">₹{(med.price * med.quantity).toLocaleString()}</span>
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
                                    <span className="text-[10px] text-slate-400 font-medium">Inclusive of all taxes & delivery</span>
                                </div>
                                <span className="text-xl font-black text-emerald-400">
                                    ₹{Math.round(orderConfirmedData.billSummary?.totalAmount ?? billSummary.totalAmount).toLocaleString()}
                                </span>
                            </div>

                        </div>

                        {/* Modal Actions */}
                        <div className="p-5 border-t border-slate-100 bg-slate-50 flex gap-3 shrink-0">
                            <button
                                onClick={() => {
                                    setOrderConfirmedData(null);
                                    router.push('/userscreens/previousorders');
                                }}
                                className="flex-1 bg-[#08B36A] hover:bg-[#079c5c] text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/20 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <span>Track Order Status</span>
                                <FaExternalLinkAlt size={10} />
                            </button>
                            <button
                                onClick={() => {
                                    setOrderConfirmedData(null);
                                    router.push('/buymedicine');
                                }}
                                className="px-5 py-3.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-2xl font-bold text-xs uppercase transition cursor-pointer"
                            >
                                Shop More
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default PharmacyCart;