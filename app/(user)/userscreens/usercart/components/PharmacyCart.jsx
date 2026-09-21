"use client";

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    FaPills, FaSpinner, FaTruck, FaFilePrescription,
    FaMinus, FaPlus, FaClock,
    FaCalendarAlt, FaChevronRight, FaCamera, FaTrash,
    FaCheckCircle, FaStore, FaShieldAlt, FaGift, FaTimes, FaGem,
    FaCreditCard, FaMoneyBillWave, FaLock, FaMapMarkerAlt,
    FaExternalLinkAlt, FaReceipt, FaBoxOpen
} from 'react-icons/fa';
import { useCart } from '@/app/context/CartContext';
import toast from 'react-hot-toast';
import UserAPI from '@/app/services/UserAPI';

// Modular Components
import PharmacyAddressSection from './PharmacyAddressSection';
import PharmacyCouponSection from './PharmacyCouponSection';
import PharmacyDeliverySection from './PharmacyDeliverySection';
import PharmacySlotModal from './PharmacySlotModal';

// Utility to load Razorpay SDK script
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
    const [couponError, setCouponError] = useState("");
    const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

    // Addresses
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [isAddressLoading, setIsAddressLoading] = useState(false);

    // Delivery & Slots
    const [deliveryOption, setDeliveryOption] = useState('fast'); // 'fast' | 'standard' | 'slot'
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [rawSlotData, setRawSlotData] = useState(null);
    const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);

    // Payment Method & COD Availability
    const [paymentMethod, setPaymentMethod] = useState("Online"); // 'Online' | 'COD'
    const [isCodAvailable, setIsCodAvailable] = useState(false);

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
    const pharmacyId = useMemo(() => pharmacyCart?.pharmacyId?._id || pharmacyCart?.pharmacyId, [pharmacyCart]);

    // Check if client-side items require prescription
    const clientNeedsRx = useMemo(() => {
        return pharmacyItems.some(item => item.medicineId?.prescription_required === "YES");
    }, [pharmacyItems]);

    // Prescription needed flag (synced between server and client items)
    const isRxMandatory = useMemo(() => {
        return serverCheckout?.rxMandatory || serverCheckout?.orderRestrictions?.needsPrescription || clientNeedsRx;
    }, [serverCheckout, clientNeedsRx]);

    // Handle Prescription Images Upload
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (prescriptionFiles.length + files.length > 5) {
            return toast.error("Maximum 5 prescription images allowed");
        }
        const validFiles = files.filter(file => file.type.startsWith('image/'));
        if (validFiles.length !== files.length) {
            toast.error("Only image files are allowed");
        }
        setPrescriptionFiles(prev => [...prev, ...validFiles]);
        e.target.value = null;
    };

    const removeFile = (index) => {
        setPrescriptionFiles(prev => prev.filter((_, i) => i !== index));
    };

    // 1. Fetch Addresses & Coupons on mount
    useEffect(() => {
        const initData = async () => {
            try {
                setIsAddressLoading(true);
                const [addrRes, couponRes] = await Promise.all([
                    UserAPI.getUserAddresses(),
                    UserAPI.getPharmacyCoupons()
                ]);

                if (addrRes?.success && addrRes.data?.length > 0) {
                    setAddresses(addrRes.data);
                    const defaultAddr = addrRes.data.find(a => a.isDefault) || addrRes.data[0];
                    setSelectedAddress(defaultAddr);
                }
                if (couponRes?.success) {
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
    }, [pharmacyItems.length]);

    // 2. Fetch Server Checkout Summary (Endpoint 4.1: POST /user/pharmacy/checkout)
    const fetchPharmacySummary = useCallback(async () => {
        if (!selectedAddress || pharmacyItems.length === 0) return;

        try {
            setIsFetchingSummary(true);
            const payload = {
                collectionType: "Home Delivery",
                isRapid: deliveryOption === 'fast',
                appointmentTime: deliveryOption === 'slot' && rawSlotData ? rawSlotData.time : "Immediate",
                appointmentDate: deliveryOption === 'slot' && rawSlotData ? rawSlotData.date : undefined,
                couponCode: appliedCouponName || undefined,
                address: {
                    houseNo: selectedAddress.houseNo || "",
                    sector: selectedAddress.sector || "",
                    city: selectedAddress.city || "",
                    state: selectedAddress.state || "",
                    pincode: selectedAddress.pincode || ""
                }
            };

            const res = await UserAPI.checkoutPharmacyOrder(payload);

            if (res?.success && res.data) {
                setServerCheckout(res.data);
                const codStatus = Boolean(res.data.orderRestrictions?.isCodAvailable);
                setIsCodAvailable(codStatus);

                // Fallback payment method to Online if COD is disabled
                if (!codStatus && paymentMethod === "COD") {
                    setPaymentMethod("Online");
                }
            }
        } catch (error) {
            console.error("Checkout Summary Error:", error);
        } finally {
            setIsFetchingSummary(false);
            setIsValidatingCoupon(false);
        }
    }, [selectedAddress, deliveryOption, rawSlotData, appliedCouponName, pharmacyItems.length, paymentMethod]);

    useEffect(() => {
        fetchPharmacySummary();
    }, [fetchPharmacySummary]);

    // 3. Apply / Remove Coupon
    const handleApplyCoupon = (name) => {
        const codeToApply = (name || couponCode).trim().toUpperCase();
        if (!codeToApply) return toast.error("Please enter a coupon code");
        setIsValidatingCoupon(true);
        setAppliedCouponName(codeToApply);
        setCouponCode("");
        toast.success(`Applying coupon ${codeToApply}...`);
    };

    const handleRemoveCoupon = () => {
        setAppliedCouponName(null);
        setCouponCode("");
        setCouponError("");
    };

    // 4. Computed Final Bill Totals
    const billSummary = useMemo(() => {
        if (serverCheckout?.billSummary) {
            const b = serverCheckout.billSummary;
            return {
                itemTotal: b.itemTotal ?? 0,
                originalItemTotal: b.originalItemTotal ?? b.itemTotal ?? 0,
                comboSavings: b.comboSavings ?? 0,
                taxableTotal: b.taxableTotal ?? 0,
                cgstTotal: b.cgstTotal ?? 0,
                sgstTotal: b.sgstTotal ?? 0,
                couponDiscount: b.couponDiscount ?? 0,
                deliveryCharge: b.deliveryCharge ?? 0,
                rapidDeliveryCharge: b.rapidDeliveryCharge ?? 0,
                totalAmount: b.totalAmount ?? 0
            };
        }

        const fallbackItemTotal = pharmacyItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        return {
            itemTotal: fallbackItemTotal,
            originalItemTotal: fallbackItemTotal,
            comboSavings: 0,
            taxableTotal: fallbackItemTotal,
            cgstTotal: 0,
            sgstTotal: 0,
            couponDiscount: 0,
            deliveryCharge: 0,
            rapidDeliveryCharge: 0,
            totalAmount: fallbackItemTotal
        };
    }, [serverCheckout, pharmacyItems]);

    // 5. Confirm Order & Payment Handler (Endpoint 4.2: POST /user/pharmacy/place-order + 7.0 Payment Verify)
    const onConfirmCheckout = async () => {
        if (!selectedAddress) {
            return toast.error("Please select a delivery address");
        }
        if (isRxMandatory && prescriptionFiles.length === 0) {
            return toast.error("One or more medicines require a prescription. Please upload it.");
        }

        setIsSubmitting(true);

        try {
            const isZeroTotal = Math.round(billSummary.totalAmount) === 0;
            const finalPaymentMethod = isZeroTotal ? "COD" : paymentMethod;

            const formData = new FormData();
            formData.append('pharmacyId', pharmacyId || "");
            formData.append('collectionType', 'Home Delivery');
            formData.append('paymentMethod', finalPaymentMethod);
            formData.append('isRapid', String(deliveryOption === 'fast'));

            if (appliedCouponName) {
                formData.append('couponCode', appliedCouponName);
            }

            if (deliveryOption === 'slot' && rawSlotData) {
                formData.append('appointmentDate', rawSlotData.date);
                formData.append('appointmentTime', rawSlotData.time);
            } else {
                formData.append('appointmentTime', 'Immediate');
            }

            // Address payload
            const addressData = {
                name: selectedAddress.name || "",
                phone: selectedAddress.phone || "",
                houseNo: selectedAddress.houseNo || "",
                sector: selectedAddress.sector || "",
                city: selectedAddress.city || "",
                state: selectedAddress.state || "",
                pincode: selectedAddress.pincode || "",
                addressType: selectedAddress.addressType || "Home"
            };
            formData.append('address', JSON.stringify(addressData));

            // Prescription Images
            prescriptionFiles.forEach((file) => {
                formData.append('prescriptionImages', file);
            });

            const res = await UserAPI.placePharmacyOrder(formData);

            if (!res?.success) {
                toast.error(res?.message || "Failed to place order");
                setIsSubmitting(false);
                return;
            }

            // --- CASE A: Free Order / COD (Skip Razorpay) ---
            if (isZeroTotal || finalPaymentMethod === "COD" || res.data?.paymentStatus === "Paid" || res.data?.paymentStatus === "Pending") {
                await clearFullCart();
                setOrderConfirmedData({
                    ...(res.data || {}),
                    orderId: res.data?.orderId || res.orderId || "MED-SUCCESS",
                    status: res.data?.status || "Placed",
                    paymentStatus: isZeroTotal ? "Paid" : (res.data?.paymentStatus || "Pending"),
                    paymentMethod: finalPaymentMethod,
                    deliveryOTP: res.data?.deliveryOTP || res.deliveryOTP,
                    items: pharmacyItems,
                    address: selectedAddress,
                    billSummary: billSummary,
                    deliveryOption: deliveryOption === 'fast' ? 'Fast Express Delivery' : deliveryOption === 'slot' ? `Scheduled (${selectedSlot})` : 'Standard Delivery'
                });
                setIsSubmitting(false);
                return;
            }

            // --- CASE B: Online Razorpay Flow ---
            const isScriptLoaded = await loadRazorpayScript();
            if (!isScriptLoaded) {
                toast.error("Failed to load Razorpay SDK.");
                setIsSubmitting(false);
                return;
            }

            const { key_id, amount, razorpayOrderId, appointmentId, orderId } = res;

            const options = {
                key: key_id,
                amount: amount,
                currency: "INR",
                name: "Health Kangaroo Pharmacy",
                description: "Medicine Order Payment",
                order_id: razorpayOrderId,
                prefill: {
                    name: selectedAddress?.name || "Customer",
                    contact: selectedAddress?.phone || ""
                },
                theme: { color: "#10b981" },
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
                            appointmentId: appointmentId || orderId || res.data?._id,
                            razorpayOrderId: response.razorpay_order_id || razorpayOrderId,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature
                        };

                        const verificationRes = await UserAPI.verifyPaymentPharmacy(verificationPayload);

                        if (verificationRes?.success) {
                            await clearFullCart();
                            setOrderConfirmedData({
                                ...(verificationRes.data || res.data || {}),
                                orderId: verificationRes.data?.orderId || orderId || "MED-SUCCESS",
                                status: "Placed",
                                paymentStatus: "Paid",
                                paymentMethod: "Online",
                                deliveryOTP: verificationRes.data?.deliveryOTP || res.deliveryOTP,
                                items: pharmacyItems,
                                address: selectedAddress,
                                billSummary: billSummary,
                                deliveryOption: deliveryOption === 'fast' ? 'Fast Express Delivery' : deliveryOption === 'slot' ? `Scheduled (${selectedSlot})` : 'Standard Delivery'
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
        return <div className="p-20 text-center font-bold text-slate-400 animate-pulse">Syncing Cart...</div>;
    }

    if (pharmacyItems.length === 0 && !orderConfirmedData) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <FaPills className="text-slate-200 text-7xl mb-6" />
                <h2 className="text-2xl font-black text-slate-800">Your Medicine Cart is Empty</h2>
                <button
                    onClick={() => router.push('/buymedicine')}
                    className="mt-6 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3.5 rounded-2xl font-black uppercase text-xs tracking-wider shadow-lg shadow-emerald-600/20"
                >
                    Browse Medicines
                </button>
            </div>
        );
    }

    return (
        <div className="bg-[#F8FAFC] min-h-screen pb-20 font-['Plus_Jakarta_Sans']">
            <div className="max-w-7xl mx-auto px-4 pt-6">
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    
                    {/* LEFT COLUMN */}
                    <div className="flex-1 w-full space-y-6">

                        {/* VIP Plan Badge */}
                        {isCodAvailable && (
                            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <FaGem className="text-emerald-600" />
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
                                    <div key={item._id} className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col shadow-sm">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center border border-gray-50 flex-shrink-0 overflow-hidden">
                                                {item.medicineId?.image_url?.[0] ? (
                                                    <img src={item.medicineId.image_url[0]} className="w-full h-full object-contain p-2 mix-blend-multiply" alt="Med" />
                                                ) : (
                                                    <FaPills size={20} className="text-emerald-600 opacity-30" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="font-bold text-slate-900 text-sm">{item.name}</h3>
                                                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-tighter mt-0.5">{item.medicineId?.manufacturers}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-black text-slate-900 text-base">₹{(item.price * item.quantity).toLocaleString()}</p>
                                                        <button onClick={() => removePharmacyItem(item.medicineId?._id || item.medicineId)} className="text-[10px] text-rose-500 font-bold uppercase hover:underline">Remove</button>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between mt-2">
                                                    <div className="flex items-center bg-slate-50 border border-slate-100 rounded-lg w-fit overflow-hidden">
                                                        <button onClick={() => updatePharmacyCartQuantity(item.medicineId?._id || item.medicineId, 'dec')} className="px-2.5 py-1 text-slate-400 hover:text-slate-800"><FaMinus size={9} /></button>
                                                        <span className="px-3 text-xs font-black text-slate-900 border-x border-slate-100">{item.quantity}</span>
                                                        <button onClick={() => updatePharmacyCartQuantity(item.medicineId?._id || item.medicineId, 'inc')} className="px-2.5 py-1 text-slate-400 hover:text-slate-800"><FaPlus size={9} /></button>
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
                                            <input type="file" hidden accept="image/*" multiple onChange={handleFileChange} />
                                        </label>
                                        
                                        {prescriptionFiles.length > 0 && (
                                            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-2.5 justify-center">
                                                {prescriptionFiles.map((file, idx) => {
                                                    const imgUrl = URL.createObjectURL(file);
                                                    return (
                                                        <div key={idx} className="relative w-14 h-14 rounded-xl overflow-hidden border-2 border-emerald-500 cursor-pointer" onClick={() => setZoomedImage(imgUrl)}>
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
                                    className={`p-4 rounded-2xl border transition-all text-left flex items-center justify-between
                                        ${paymentMethod === "Online" ? 'border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-500' : 'bg-white border-slate-200'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl">
                                            <FaCreditCard size={15} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-slate-900">Pay Online</p>
                                            <p className="text-[10px] text-slate-500">UPI, Cards, NetBanking</p>
                                        </div>
                                    </div>
                                    {paymentMethod === "Online" && <FaCheckCircle className="text-emerald-600" size={15} />}
                                </button>

                                <button
                                    type="button"
                                    disabled={!isCodAvailable}
                                    onClick={() => setPaymentMethod("COD")}
                                    className={`p-4 rounded-2xl border transition-all text-left flex items-center justify-between relative
                                        ${!isCodAvailable ? 'opacity-40 cursor-not-allowed bg-slate-50 border-slate-200' : ''}
                                        ${paymentMethod === "COD" ? 'border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-500' : 'bg-white border-slate-200'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-slate-100 text-slate-700 rounded-xl">
                                            <FaMoneyBillWave size={15} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-slate-900">Cash on Delivery (COD)</p>
                                            <p className="text-[10px] text-slate-500">
                                                {isCodAvailable ? "Pay cash when delivered" : "Unavailable for this vendor"}
                                            </p>
                                        </div>
                                    </div>
                                    {paymentMethod === "COD" && <FaCheckCircle className="text-emerald-600" size={15} />}
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
                            setServerDiscount={() => {}}
                            handleApplyCoupon={handleApplyCoupon}
                            isValidating={isValidatingCoupon}
                            onRemoveCoupon={handleRemoveCoupon}
                        />

                        {/* Final Bill Box */}
                        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Order Bill Summary</h3>
                            
                            <div className="space-y-2.5 text-xs">
                                <div className="flex justify-between text-slate-600">
                                    <span>Item Total</span>
                                    <span className="font-bold text-slate-900">₹{billSummary.itemTotal.toFixed(2)}</span>
                                </div>

                                {billSummary.comboSavings > 0 && (
                                    <div className="flex justify-between text-emerald-600 font-bold">
                                        <span>Combo / BOGO Savings</span>
                                        <span>-₹{billSummary.comboSavings.toFixed(2)}</span>
                                    </div>
                                )}

                                {billSummary.couponDiscount > 0 && (
                                    <div className="flex justify-between text-emerald-600 font-bold">
                                        <span>Coupon Discount</span>
                                        <span>-₹{billSummary.couponDiscount.toFixed(2)}</span>
                                    </div>
                                )}

                                <div className="flex justify-between text-slate-600">
                                    <span>Delivery Charges</span>
                                    <span className="font-bold text-slate-900">
                                        {billSummary.deliveryCharge === 0 ? (
                                            <span className="text-emerald-600 uppercase font-black text-[10px]">Free</span>
                                        ) : (
                                            `₹${billSummary.deliveryCharge.toFixed(2)}`
                                        )}
                                    </span>
                                </div>

                                {(billSummary.cgstTotal > 0 || billSummary.sgstTotal > 0) && (
                                    <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                                        <span>Taxes (CGST + SGST)</span>
                                        <span>₹{(billSummary.cgstTotal + billSummary.sgstTotal).toFixed(2)}</span>
                                    </div>
                                )}

                                <div className="h-px bg-slate-100 my-2" />

                                <div className="flex justify-between items-end">
                                    <div>
                                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Total Amount</span>
                                        <span className="text-[10px] text-slate-400 font-medium">Inclusive of all taxes</span>
                                    </div>
                                    <span className="text-2xl font-black text-slate-900">
                                        ₹{billSummary.totalAmount.toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            <button
                                disabled={isSubmitting || isFetchingSummary || (isRxMandatory && prescriptionFiles.length === 0)}
                                onClick={onConfirmCheckout}
                                className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2
                                    ${(!isSubmitting && !isFetchingSummary && (!isRxMandatory || prescriptionFiles.length > 0))
                                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 active:scale-95'
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
                    setRawSlotData({ date: data.apiDate, time: data.apiTime });
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
                            className="absolute top-4 right-4 z-50 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
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

            {/* ========================================================= */}
            {/* REDESIGNED ENHANCED MEDICINE ORDER CONFIRMATION MODAL */}
            {/* ========================================================= */}
            {orderConfirmedData && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2.5rem] max-w-lg w-full border border-slate-100 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        
                        {/* Header Banner */}
                        <div className="bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-700 p-6 text-white text-center relative shrink-0">
                            <button
                                onClick={() => {
                                    setOrderConfirmedData(null);
                                    router.push('/userscreens/previousorders');
                                }}
                                className="absolute right-4 top-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white/80 hover:text-white transition"
                            >
                                <FaTimes size={13} />
                            </button>

                            <div className="w-14 h-14 bg-white rounded-2xl mx-auto flex items-center justify-center text-emerald-600 shadow-lg shadow-black/10 mb-3">
                                <FaBoxOpen size={28} />
                            </div>
                            <h3 className="text-xl font-black tracking-tight">Order Placed Successfully!</h3>
                            <p className="text-emerald-100 text-xs font-semibold mt-1">
                                Your medicines are packed & being dispatched from the licensed pharmacy.
                            </p>
                        </div>

                        {/* Modal Body (Scrollable Details) */}
                        <div className="p-6 overflow-y-auto space-y-4 text-xs font-sans">
                            
                            {/* Delivery Verification OTP Box */}
                            {orderConfirmedData.deliveryOTP && (
                                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-dashed border-emerald-300 rounded-2xl p-4 text-center">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-800 block mb-1">
                                        Package Delivery Security OTP
                                    </span>
                                    <div className="text-3xl font-black tracking-[0.25em] text-emerald-700 font-mono">
                                        {orderConfirmedData.deliveryOTP}
                                    </div>
                                    <p className="text-[10px] text-slate-500 font-medium mt-1">
                                        Share this verification code with the delivery rider upon package arrival.
                                    </p>
                                </div>
                            )}

                            {/* Order ID & Payment Details */}
                            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Order ID</span>
                                    <span className="text-xs font-black text-slate-900 font-mono">
                                        {orderConfirmedData.orderId || "MED-SUCCESS"}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Payment</span>
                                    <span className="inline-flex items-center gap-1 font-black text-xs text-emerald-700 uppercase">
                                        <FaCheckCircle size={10} />
                                        {orderConfirmedData.paymentMethod === "Online" ? "Paid Online" : "Pay on Delivery (COD)"}
                                    </span>
                                </div>
                            </div>

                            {/* Delivery Speed & Destination Address */}
                            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-3 shadow-sm">
                                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                    <div className="flex items-center gap-2 text-slate-700 font-bold">
                                        <FaTruck className="text-emerald-600" />
                                        <span>{orderConfirmedData.deliveryOption || "Standard Home Delivery"}</span>
                                    </div>
                                    <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase px-2 py-0.5 rounded border border-emerald-100">
                                        {orderConfirmedData.status || "Placed"}
                                    </span>
                                </div>

                                <div className="flex items-start gap-2.5 pt-1">
                                    <FaMapMarkerAlt className="text-emerald-600 mt-0.5 shrink-0" />
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
                                        <FaPills className="text-emerald-600" /> Ordered Items ({(orderConfirmedData.items || pharmacyItems).length})
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

                            {/* Grand Total Container */}
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

                        {/* Modal Footer Actions */}
                        <div className="p-5 border-t border-slate-100 bg-slate-50 flex gap-3 shrink-0">
                            <button
                                onClick={() => {
                                    setOrderConfirmedData(null);
                                    router.push('/userscreens/previousorders');
                                }}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                <span>Track Order Status</span>
                                <FaExternalLinkAlt size={10} />
                            </button>
                            <button
                                onClick={() => {
                                    setOrderConfirmedData(null);
                                    router.push('/buymedicine');
                                }}
                                className="px-5 py-3.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-2xl font-bold text-xs uppercase transition"
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