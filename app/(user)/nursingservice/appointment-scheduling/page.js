"use client";

import React, { useState, useEffect, Suspense, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    FaArrowLeft, FaShieldAlt, FaGem, FaCheckCircle,
    FaCreditCard, FaMoneyBillWave, FaLock, FaSpinner
} from "react-icons/fa";
import AddressSelector from "../othercomponents/AddressSelector";
import BookingSummary from "../othercomponents/BookingSummary";
import SlotPicker from "../othercomponents/SlotPicker";
import ConsumablesPicker from "../othercomponents/ConsumablesPicker";
import UserAPI from "@/app/services/UserAPI";
import CostoumPopup from "@/lib/CostoumPopup";

// Dynamically load Razorpay SDK
const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        if (typeof window === "undefined") {
            resolve(false);
            return;
        }
        if (window.Razorpay) {
            resolve(true);
            return;
        }
        const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
        if (existingScript) {
            existingScript.onload = () => resolve(true);
            existingScript.onerror = () => resolve(false);
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

const formatToISO = (dateStr) => {
    if (!dateStr) return new Date().toISOString();
    if (dateStr.includes("T")) return dateStr;
    try {
        const d = new Date(dateStr);
        return d.toISOString();
    } catch (e) {
        return dateStr;
    }
};

const formatTimeToAMPM = (timeStr) => {
    if (!timeStr) return "10:00 AM";
    if (timeStr.includes("AM") || timeStr.includes("PM")) return timeStr;
    try {
        const [hoursStr, minutesStr] = timeStr.split(":");
        let hours = parseInt(hoursStr, 10);
        const minutes = parseInt(minutesStr, 10);
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12 || 12;
        const strMinutes = minutes < 10 ? "0" + minutes : minutes;
        const strHours = hours < 10 ? "0" + hours : hours;
        return `${strHours}:${strMinutes} ${ampm}`;
    } catch (e) {
        return timeStr;
    }
};

function AppointmentSchedulingContent() {
    const router = useRouter();

    // Core States
    const [bookingData, setBookingData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [selectedConsumables, setSelectedConsumables] = useState([]);
    const [availableConsumables, setAvailableConsumables] = useState([]);
    const [consumablesLoading, setConsumablesLoading] = useState(false);

    // Slot & Schedule
    const [slotInfo, setSlotInfo] = useState({
        mode: "One day One Time",
        startDate: "",
        endDate: "",
        startTime: "",
        endTime: "",
        extraFee: 0,
        basePrice: 0,
        displayTime: ""
    });

    // Payment & Server Pricing State (Endpoint 5.1)
    const [paymentMethod, setPaymentMethod] = useState("Online"); // 'Online' | 'COD'
    const [serverPricing, setServerPricing] = useState(null);
    const [isFetchingSummary, setIsFetchingSummary] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [confirmedBookingData, setConfirmedBookingData] = useState(null);

    // 1. Initialize Booking Data & Consumables
    useEffect(() => {
        const initData = async () => {
            const token = localStorage.getItem('userToken');
            if (!token) {
                CostoumPopup("Please Login To Continue", "warning", 4000);
                router.push("/nursingservice");
                return;
            }

            const savedData = sessionStorage.getItem("pendingNurseBooking");
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                setBookingData(parsedData);

                try {
                    setConsumablesLoading(true);
                    const detailsRes = await UserAPI.nurseServiceDetail(parsedData.nurseId);
                    if (detailsRes?.success) {
                        let consumables = [];
                        if (parsedData.serviceId && detailsRes.data.services) {
                            const selectedService = detailsRes.data.services.find(s => s._id === parsedData.serviceId);
                            if (selectedService?.consumablesUsed) consumables = selectedService.consumablesUsed;
                        } else if (parsedData.packageId && detailsRes.data.packages) {
                            const selectedPackage = detailsRes.data.packages.find(p => p._id === parsedData.packageId);
                            if (selectedPackage?.includedServices && detailsRes.data.services) {
                                const packageServices = detailsRes.data.services.filter(s => selectedPackage.includedServices.includes(s.title));
                                packageServices.forEach(s => { if (s.consumablesUsed) consumables.push(...s.consumablesUsed); });
                                consumables = consumables.filter((item, index, self) => index === self.findIndex(i => i.masterItemId?._id === item.masterItemId?._id));
                            }
                        }
                        setAvailableConsumables(consumables);
                    }
                } catch (error) {
                    console.error("Error fetching consumables:", error);
                } finally {
                    setConsumablesLoading(false);
                }
            } else {
                router.push("/nursingservice");
            }
            setLoading(false);
        };

        initData();
    }, [router]);

    // 2. Fetch Server-Side Checkout Summary (Endpoint 5.1: POST /user/nurse/checkout)
    const fetchCheckoutSummary = useCallback(async (couponCode = "", isFasterService = false) => {
        if (!bookingData?.nurseId || !slotInfo.startDate) return;

        try {
            setIsFetchingSummary(true);
            const payload = {
                nurseId: bookingData.nurseId,
                serviceId: bookingData.serviceId || bookingData.packageId,
                isPackage: !!bookingData.packageId,
                selectedType: slotInfo.mode || "One day One Time",
                startDate: slotInfo.startDate,
                startTime: formatTimeToAMPM(slotInfo.startTime),
                isFasterService: Boolean(isFasterService),
                patientCount: bookingData.patients?.length || 1,
                couponCode: couponCode || undefined
            };

            const res = await UserAPI.nurseCheckoutSummary(payload);
            if (res?.success) {
                setServerPricing(res);
                if (!res.isCodAvailable && paymentMethod === "COD") {
                    setPaymentMethod("Online");
                }
            }
        } catch (error) {
            console.error("Error fetching nurse checkout summary:", error);
        } finally {
            setIsFetchingSummary(false);
        }
    }, [bookingData, slotInfo, paymentMethod]);

    useEffect(() => {
        if (slotInfo.startDate && slotInfo.startTime) {
            fetchCheckoutSummary();
        }
    }, [slotInfo.startDate, slotInfo.startTime, slotInfo.mode, fetchCheckoutSummary]);

    // 3. Computed Pricing Breakdown
    const pricing = useMemo(() => {
        const consumableTotal = selectedConsumables.reduce((sum, item) => sum + (item.price || 0), 0);

        if (serverPricing?.breakdown) {
            const b = serverPricing.breakdown;
            const finalTotal = (b.totalPrice ?? 0) + consumableTotal;

            return {
                baseServicePrice: b.baseServicePrice ?? 0,
                originalBasePrice: b.originalBasePrice ?? (b.baseServicePrice || 500),
                slotSurcharge: b.slotSurcharge ?? 0,
                consumableTotal,
                couponDiscount: b.couponDiscount ?? 0,
                fasterServiceCharge: b.fasterServiceCharge ?? 0,
                taxAmount: b.taxAmount ?? 0,
                totalPrice: finalTotal,
                isCodAvailable: Boolean(serverPricing.isCodAvailable),
                isSubscriptionApplied: Boolean(serverPricing.subscriptionDetails?.isSubscriptionApplied),
                planName: serverPricing.subscriptionDetails?.planName || "",
                userSubscriptionId: serverPricing.subscriptionDetails?.userSubscriptionId || null
            };
        }

        const fallbackBase = slotInfo.basePrice || bookingData?.basePrice || 0;
        return {
            baseServicePrice: fallbackBase,
            originalBasePrice: fallbackBase,
            slotSurcharge: slotInfo.extraFee || 0,
            consumableTotal,
            couponDiscount: 0,
            fasterServiceCharge: 0,
            taxAmount: 0,
            totalPrice: fallbackBase + consumableTotal + (slotInfo.extraFee || 0),
            isCodAvailable: true,
            isSubscriptionApplied: false,
            planName: "",
            userSubscriptionId: null
        };
    }, [serverPricing, selectedConsumables, slotInfo, bookingData]);

    const handleToggleConsumable = (consumable) => {
        const consumableId = consumable.masterItemId?._id || consumable._id;
        const existingIndex = selectedConsumables.findIndex(item => item.consumableId === consumableId);
        if (existingIndex >= 0) {
            setSelectedConsumables(prev => prev.filter((_, idx) => idx !== existingIndex));
        } else {
            setSelectedConsumables(prev => [...prev, {
                consumableId: consumableId,
                itemName: consumable.masterItemId?.itemName || consumable.itemName,
                price: consumable.finalPrice || consumable.price || 0,
                unitType: consumable.masterItemId?.unitType || consumable.unitType || "Piece"
            }]);
        }
    };

    // 4. Final Booking Handler (Endpoint 5.2: POST /user/nurse/book + 7.0 Payment Verify)
    const handleFinalBooking = async (summaryData) => {
        if (!selectedAddress) {
            CostoumPopup("Please select a service address", "warning", 3000);
            return;
        }
        if (!slotInfo.startDate || !slotInfo.startTime) {
            CostoumPopup("Please select date and time slot", "warning", 3000);
            return;
        }

        try {
            setIsSubmitting(true);

            const { isExpress, appliedCoupon } = summaryData;
            const isZeroTotal = Math.round(pricing.totalPrice) === 0;
            const finalPaymentMethod = isZeroTotal ? "COD" : paymentMethod;

            // Strict Backend Enum: 'At Home' | 'At Hospital'
            const validAssessmentLocation = bookingData.assessmentLocation === "At Hospital" ? "At Hospital" : "At Home";

            const finalPayload = {
                nurseId: bookingData.nurseId,
                serviceId: bookingData.serviceId || bookingData.packageId,
                isPackage: !!bookingData.packageId,
                paymentMethod: finalPaymentMethod,
                couponCode: appliedCoupon?.couponName || undefined,
                isFasterService: Boolean(isExpress),

                // Strict Backend Enum
                assessmentLocation: validAssessmentLocation,

                schedule: {
                    duration: slotInfo.mode || "One day One Time",
                    startDate: formatToISO(slotInfo.startDate),
                    startTime: formatTimeToAMPM(slotInfo.startTime)
                },

                patients: (bookingData.patients || []).map(p => ({
                    name: p.name || p.fullName || "Self",
                    age: Number(p.age) || 28,
                    gender: p.gender || "Male",
                    relation: p.relation || "Self"
                })),

                address: {
                    houseNo: selectedAddress.houseNo || "",
                    sector: selectedAddress.sector || "",
                    city: selectedAddress.city || "",
                    state: selectedAddress.state || "",
                    pincode: selectedAddress.pincode || ""
                },

                priceBreakdown: {
                    baseServicePrice: pricing.baseServicePrice,
                    originalBasePrice: pricing.originalBasePrice,
                    slotSurcharge: pricing.slotSurcharge,
                    consumableTotal: pricing.consumableTotal,
                    couponDiscount: pricing.couponDiscount,
                    fasterServiceCharge: pricing.fasterServiceCharge,
                    taxAmount: pricing.taxAmount,
                    totalPrice: Math.round(pricing.totalPrice)
                },
                totalPrice: Math.round(pricing.totalPrice)
            };

            const processRes = await UserAPI.bookNurseAppointment(finalPayload);

            if (!processRes?.success) {
                CostoumPopup(processRes?.message || "Booking request failed", "error", 4000);
                setIsSubmitting(false);
                return;
            }

            // --- CASE A: Direct Confirmation for COD or Free / Subscribed Booking ---
            if (isZeroTotal || finalPaymentMethod === "COD" || processRes.data?.paymentStatus === "Paid" || processRes.data?.paymentStatus === "Pending") {
                sessionStorage.removeItem("pendingNurseBooking");
                setConfirmedBookingData(processRes.data || { bookingId: processRes.bookingId || "HKN-CONFIRMED" });
                setIsSubmitting(false);
                return;
            }

            // --- CASE B: Online Payment via Razorpay ---
            const isScriptLoaded = await loadRazorpayScript();
            if (!isScriptLoaded) {
                CostoumPopup("Failed to load Razorpay SDK.", "error", 4000);
                setIsSubmitting(false);
                return;
            }

            const { key_id, amount, razorpayOrderId, appointmentId, orderId } = processRes;

            const options = {
                key: key_id,
                amount: amount,
                currency: "INR",
                name: "Health Kangaroo Home Care",
                description: "Nursing Service Consultation",
                order_id: razorpayOrderId,
                prefill: {
                    name: bookingData.patients?.[0]?.name || "Patient",
                    contact: selectedAddress?.phone || ""
                },
                theme: { color: "#10b981" },
                modal: {
                    ondismiss: () => {
                        setIsSubmitting(false);
                        CostoumPopup("Payment cancelled", "warning", 3000);
                    }
                },
                handler: async function (response) {
                    try {
                        setIsSubmitting(true);
                        const verificationRes = await UserAPI.verifyPaymentNurse({
                            appointmentId: appointmentId || orderId || processRes.data?._id,
                            razorpayOrderId: response.razorpay_order_id || razorpayOrderId,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature
                        });

                        if (verificationRes?.success) {
                            sessionStorage.removeItem("pendingNurseBooking");
                            setConfirmedBookingData(verificationRes.data || { bookingId: orderId || "HKN-CONFIRMED" });
                        } else {
                            CostoumPopup("Payment verification failed", "error", 4000);
                        }
                    } catch (e) {
                        CostoumPopup("Payment verification error occurred", "error", 4000);
                    } finally {
                        setIsSubmitting(false);
                    }
                }
            };

            const rzpInstance = new window.Razorpay(options);
            rzpInstance.open();

        } catch (error) {
            console.error("Booking Payment Exception:", error);
            CostoumPopup(error?.message || "Something went wrong", "error", 4000);
            setIsSubmitting(false);
        }
    };

    if (loading || !bookingData) return null;

    return (
        <div className="min-h-screen bg-[#FDFEFF] pb-20 font-sans">
            {/* HEADER */}
            <div className="bg-white border-b py-4 px-6 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => router.back()} className="text-slate-900 p-2 hover:bg-slate-100 rounded-full transition-colors">
                            <FaArrowLeft />
                        </button>
                        <h1 className="text-base font-black uppercase tracking-wider">Nursing Care Booking</h1>
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Step 2 of 2</div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-6 mt-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
                    
                    {/* LEFT COLUMN */}
                    <div className="lg:col-span-8 space-y-8">
                        
                        {/* VIP Subscription Badge */}
                        {pricing.isSubscriptionApplied && (
                            <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-3xl flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-emerald-600 flex-shrink-0">
                                    <FaGem size={20} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-emerald-900 uppercase tracking-tight">
                                        {pricing.planName} Active
                                    </h4>
                                    <p className="text-xs font-semibold text-emerald-700 mt-0.5">
                                        Base nursing fee is waived (₹0) under your subscription plan.
                                    </p>
                                </div>
                            </div>
                        )}

                        <AddressSelector selectedAddress={selectedAddress} onSelect={setSelectedAddress} />
                        
                        <SlotPicker
                            nurseId={bookingData.nurseId}
                            itemId={bookingData.serviceId || bookingData.packageId}
                            isPackage={!!bookingData.packageId}
                            onSlotSelect={setSlotInfo}
                        />

                        {!consumablesLoading && availableConsumables.length > 0 && (
                            <ConsumablesPicker
                                items={availableConsumables}
                                selectedItems={selectedConsumables}
                                onToggle={handleToggleConsumable}
                            />
                        )}

                        {/* Payment Method Selector */}
                        {pricing.totalPrice > 0 && (
                            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Select Payment Method</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                        disabled={!pricing.isCodAvailable}
                                        onClick={() => setPaymentMethod("COD")}
                                        className={`p-4 rounded-2xl border transition-all text-left flex items-center justify-between relative
                                            ${!pricing.isCodAvailable ? 'opacity-40 cursor-not-allowed bg-slate-50 border-slate-200' : ''}
                                            ${paymentMethod === "COD" ? 'border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-500' : 'bg-white border-slate-200'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 bg-slate-100 text-slate-700 rounded-xl"><FaMoneyBillWave size={15} /></div>
                                            <div>
                                                <p className="text-xs font-black text-slate-900">Cash on Service (COD)</p>
                                                <p className="text-[10px] text-slate-500">
                                                    {pricing.isCodAvailable ? "Pay nurse directly after visit" : "Unavailable for this vendor"}
                                                </p>
                                            </div>
                                        </div>
                                        {paymentMethod === "COD" && <FaCheckCircle className="text-emerald-600" size={15} />}
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="bg-slate-50 border border-slate-200/60 p-6 rounded-3xl flex items-start gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-teal-600 flex-shrink-0">
                                <FaShieldAlt size={20} />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-slate-900">Certified Medical Care</h4>
                                <p className="text-xs text-slate-500 mt-1">Our nurses strictly adhere to hygiene, PPE protocols, and clinical standards.</p>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: BILL SUMMARY */}
                    <div className="lg:col-span-4 lg:sticky lg:top-24">
                        <BookingSummary
                            bookingData={bookingData}
                            slotInfo={slotInfo}
                            selectedAddress={selectedAddress}
                            selectedConsumables={selectedConsumables}
                            onProceed={handleFinalBooking}
                            isSubmitting={isSubmitting || isFetchingSummary}
                            subscriptionInfo={pricing}
                            paymentMethod={paymentMethod}
                        />
                    </div>
                </div>
            </div>

            {/* CONFIRMATION SUCCESS MODAL */}
            {confirmedBookingData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-[2rem] p-8 max-w-md w-full border border-slate-100 shadow-2xl text-center space-y-5">
                        <div className="mx-auto w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
                            <FaCheckCircle className="w-9 h-9" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-2xl font-black text-slate-900">Nurse Booking Confirmed!</h3>
                            <p className="text-xs font-semibold text-slate-500">Your home care schedule has been successfully locked.</p>
                        </div>
                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-left space-y-2 text-xs">
                            <div className="flex justify-between">
                                <span className="text-slate-400 font-medium">Booking ID:</span>
                                <span className="font-bold text-slate-800">{confirmedBookingData.bookingId || "HKN-xxxx"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400 font-medium">Status:</span>
                                <span className="font-black text-emerald-600 uppercase">{confirmedBookingData.status || "Confirmed"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400 font-medium">Payment Status:</span>
                                <span className="font-bold text-slate-800">{confirmedBookingData.paymentStatus || "Pending"}</span>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                setConfirmedBookingData(null);
                                router.push('/userscreens/previousorders');
                            }}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/20"
                        >
                            View My Appointments
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function AppointmentSchedulingPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-bold text-slate-400">Loading...</div>}>
            <AppointmentSchedulingContent />
        </Suspense>
    );
}