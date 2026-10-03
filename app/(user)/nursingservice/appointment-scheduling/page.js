"use client";

import React, { useState, useEffect, Suspense, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    FaArrowLeft, FaShieldAlt, FaGem, FaCheckCircle,
    FaCreditCard, FaMoneyBillWave, FaLock, FaSpinner,
    FaHospital, FaBed, FaClinicMedical, FaCalendarAlt, 
    FaClock, FaUser, FaMapMarkerAlt, FaReceipt, FaCheck,
    FaBoxOpen, FaUserNurse
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
        return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
    } catch (e) {
        return new Date().toISOString();
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

    // Hospital Bedside Care State
    const [hospitalsList, setHospitalsList] = useState([]);
    const [hospitalInfo, setHospitalInfo] = useState({
        hospitalId: "",
        hospitalName: "",
        wardName: "",
        bedNumber: ""
    });

    // Slot & Schedule
    const [slotInfo, setSlotInfo] = useState({
        mode: "One day One Time",
        startDate: "",
        endDate: "",
        startTime: "",
        endTime: "",
        extraFee: 0,
        basePrice: 0,
        totalPrice: 0,
        displayTime: ""
    });

    // Payment & Server Pricing State
    const [paymentMethod, setPaymentMethod] = useState("Online"); // 'Online' | 'COD'
    const [serverPricing, setServerPricing] = useState(null);
    const [isFetchingSummary, setIsFetchingSummary] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [confirmedBookingData, setConfirmedBookingData] = useState(null);

    // 1. Initialize Booking Data, Consumables & Hospitals
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

                // Populate existing hospital info if present
                if (parsedData.hospitalDetails || parsedData.hospitalName) {
                    setHospitalInfo({
                        hospitalId: parsedData.hospitalDetails?.hospitalId || parsedData.hospitalId || "",
                        hospitalName: parsedData.hospitalDetails?.hospitalName || parsedData.hospitalName || "",
                        wardName: parsedData.hospitalDetails?.wardName || parsedData.wardName || "",
                        bedNumber: parsedData.hospitalDetails?.bedNumber || parsedData.bedNumber || ""
                    });
                }

                // Fetch Hospital Dropdown safely
                if (parsedData.assessmentLocation === "At Hospital") {
                    try {
                        if (typeof UserAPI.getHospitalDropdown === "function") {
                            const hospRes = await UserAPI.getHospitalDropdown();
                            if (hospRes?.success && Array.isArray(hospRes.data)) {
                                setHospitalsList(hospRes.data);
                            }
                        }
                    } catch (e) {
                        console.warn("Hospital dropdown fallback active:", e);
                    }
                }

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

    // 2. Fetch Server-Side Checkout Summary with Assessment Location & Hospital Details
    const fetchCheckoutSummary = useCallback(async (couponCode = "", isFasterService = false) => {
        if (!bookingData?.nurseId || !slotInfo.startDate) return;

        try {
            setIsFetchingSummary(true);
            const isPackage = Boolean(bookingData.packageId);
            const isHospitalCare = bookingData.assessmentLocation === "At Hospital";

            const payload = {
                nurseId: bookingData.nurseId,
                isPackage: isPackage,
                ...(isPackage ? { packageId: bookingData.packageId } : { serviceId: bookingData.serviceId }),
                selectedType: slotInfo.mode || "One day One Time",
                startDate: slotInfo.startDate,
                startTime: formatTimeToAMPM(slotInfo.startTime),
                isFasterService: Boolean(isFasterService),
                patientCount: bookingData.patients?.length || 1,
                couponCode: couponCode || undefined,
                assessmentLocation: isHospitalCare ? "At Hospital" : "At Home",
                ...(isHospitalCare && (hospitalInfo.hospitalId || hospitalInfo.hospitalName) ? {
                    hospitalId: hospitalInfo.hospitalId || undefined,
                    hospitalName: hospitalInfo.hospitalName,
                    wardName: hospitalInfo.wardName,
                    bedNumber: hospitalInfo.bedNumber,
                    hospitalDetails: {
                        hospitalId: hospitalInfo.hospitalId || undefined,
                        hospitalName: hospitalInfo.hospitalName,
                        wardName: hospitalInfo.wardName,
                        bedNumber: hospitalInfo.bedNumber
                    }
                } : {})
            };

            const res = await UserAPI.nurseCheckoutSummary(payload);
            if (res?.success) {
                setServerPricing(res);
                
                // Read COD availability from root or breakdown
                const codAllowed = res.isCodAvailable ?? res.breakdown?.isCodAvailable ?? true;
                if (!codAllowed && paymentMethod === "COD") {
                    setPaymentMethod("Online");
                }
            }
        } catch (error) {
            console.error("Error fetching nurse checkout summary:", error);
        } finally {
            setIsFetchingSummary(false);
        }
    }, [bookingData, slotInfo, paymentMethod, hospitalInfo]);

    useEffect(() => {
        if (slotInfo.startDate && slotInfo.startTime) {
            fetchCheckoutSummary();
        }
    }, [slotInfo.startDate, slotInfo.startTime, slotInfo.mode, hospitalInfo.hospitalId, fetchCheckoutSummary]);

    // 3. Computed Pricing Breakdown & COD Resolution
    const pricing = useMemo(() => {
        const consumableTotal = selectedConsumables.reduce((sum, item) => sum + (item.price || 0), 0);

        if (serverPricing?.breakdown) {
            const b = serverPricing.breakdown;
            const finalTotal = (b.totalPrice ?? 0) + consumableTotal;
            const codAvailable = serverPricing.isCodAvailable ?? b.isCodAvailable ?? true;

            return {
                baseServicePrice: b.baseServicePrice ?? 0,
                originalBasePrice: b.originalBasePrice ?? (b.baseServicePrice || 500),
                slotSurcharge: b.slotSurcharge ?? 0,
                consumableTotal,
                couponDiscount: b.couponDiscount ?? 0,
                fasterServiceCharge: b.fasterServiceCharge ?? 0,
                taxAmount: b.taxAmount ?? 0,
                totalPrice: finalTotal,
                isCodAvailable: Boolean(codAvailable),
                isSubscriptionApplied: Boolean(serverPricing.subscriptionDetails?.isSubscriptionApplied),
                planName: serverPricing.subscriptionDetails?.planName || "",
                userSubscriptionId: serverPricing.subscriptionDetails?.userSubscriptionId || null
            };
        }

        const fallbackBase = (slotInfo.totalPrice || slotInfo.basePrice || bookingData?.basePrice || 0) * (bookingData?.patients?.length || 1);
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

    // 4. Final Booking Handler (Razorpay online & COD support)
    const handleFinalBooking = async (summaryData) => {
        const isHospitalCare = bookingData.assessmentLocation === "At Hospital";

        if (!isHospitalCare && !selectedAddress) {
            CostoumPopup("Please select a home service address", "warning", 3000);
            return;
        }

        if (isHospitalCare) {
            if (!hospitalInfo.hospitalName) {
                CostoumPopup("Please select or enter Hospital Name", "warning", 3000);
                return;
            }
            if (!hospitalInfo.wardName) {
                CostoumPopup("Please enter Ward Name / Floor", "warning", 3000);
                return;
            }
            if (!hospitalInfo.bedNumber) {
                CostoumPopup("Please enter Bed Number", "warning", 3000);
                return;
            }
        }

        if (!slotInfo.startDate || !slotInfo.startTime) {
            CostoumPopup("Please select date and arrival time slot", "warning", 3000);
            return;
        }

        try {
            setIsSubmitting(true);

            const { isExpress, appliedCoupon, finalTotal } = summaryData;
            const computedFinalPrice = Math.round(typeof finalTotal === "number" ? finalTotal : pricing.totalPrice);
            const isZeroTotal = computedFinalPrice === 0;
            const finalPaymentMethod = isZeroTotal ? "COD" : paymentMethod;

            const isPackage = Boolean(bookingData.packageId);

            const schedulePayload = {
                duration: slotInfo.mode || "One day One Time",
                selectedType: slotInfo.mode || "One day One Time",
                startDate: formatToISO(slotInfo.startDate),
                startTime: formatTimeToAMPM(slotInfo.startTime),
                endDate: formatToISO(slotInfo.endDate || slotInfo.startDate),
                endTime: slotInfo.endTime ? formatTimeToAMPM(slotInfo.endTime) : formatTimeToAMPM(slotInfo.startTime)
            };

            const finalPayload = {
                nurseId: bookingData.nurseId,
                isPackage: isPackage,
                ...(isPackage ? { packageId: bookingData.packageId } : { serviceId: bookingData.serviceId }),
                paymentMethod: finalPaymentMethod,
                isFasterService: Boolean(isExpress),
                assessmentLocation: isHospitalCare ? "At Hospital" : "At Home",

                schedule: schedulePayload,

                patients: (bookingData.patients || []).map(p => ({
                    name: p.name || p.fullName || "Self",
                    age: Number(p.age) || 28,
                    gender: p.gender || "Male",
                    relation: p.relation || "Self"
                })),

                // Address (With default fallback for hospital care)
                address: {
                    addressId: selectedAddress?._id || undefined,
                    houseNo: selectedAddress?.houseNo || hospitalInfo.hospitalName || "Hospital Bedside",
                    sector: selectedAddress?.sector || hospitalInfo.wardName || "Ward",
                    city: selectedAddress?.city || "City",
                    state: selectedAddress?.state || "State",
                    pincode: selectedAddress?.pincode || "000000",
                    phone: selectedAddress?.phone || bookingData.patients?.[0]?.phone || ""
                },

                // Hospital Details (Required by Backend for Bedside Care)
                ...(isHospitalCare ? {
                    hospitalName: hospitalInfo.hospitalName,
                    wardName: hospitalInfo.wardName,
                    bedNumber: hospitalInfo.bedNumber,
                    hospitalId: hospitalInfo.hospitalId || undefined,
                    hospitalDetails: {
                        hospitalId: hospitalInfo.hospitalId || undefined,
                        hospitalName: hospitalInfo.hospitalName,
                        wardName: hospitalInfo.wardName,
                        bedNumber: hospitalInfo.bedNumber
                    }
                } : {}),

                consumables: selectedConsumables.map(c => ({
                    consumableId: c.consumableId,
                    itemName: c.itemName,
                    price: c.price,
                    quantity: 1
                })),

                priceBreakdown: {
                    baseServicePrice: pricing.baseServicePrice,
                    originalBasePrice: pricing.originalBasePrice,
                    slotSurcharge: pricing.slotSurcharge,
                    consumableTotal: pricing.consumableTotal,
                    couponDiscount: summaryData.discountAmount || pricing.couponDiscount || 0,
                    fasterServiceCharge: summaryData.expressCharge || pricing.fasterServiceCharge || 0,
                    taxAmount: pricing.taxAmount || 0,
                    totalPrice: computedFinalPrice
                },
                totalPrice: computedFinalPrice
            };

            if (appliedCoupon?.couponName) {
                finalPayload.couponCode = appliedCoupon.couponName;
            }

            const processRes = await UserAPI.bookNurseAppointment(finalPayload);

            if (!processRes?.success) {
                CostoumPopup(processRes?.message || "Booking request failed. Please check details.", "error", 4000);
                setIsSubmitting(false);
                return;
            }

            // Direct confirm for COD / Free / Direct Paid
            if (isZeroTotal || finalPaymentMethod === "COD" || processRes.data?.paymentStatus === "Paid" || processRes.data?.paymentStatus === "Pending") {
                sessionStorage.removeItem("pendingNurseBooking");
                setConfirmedBookingData(processRes.data || { 
                    bookingId: processRes.bookingId || "HKN-CONFIRMED",
                    status: processRes.status || "Confirmed",
                    paymentStatus: processRes.paymentStatus || (finalPaymentMethod === "COD" ? "Pending (COD)" : "Paid"),
                    totalPrice: computedFinalPrice
                });
                setIsSubmitting(false);
                return;
            }

            // Razorpay payment flow
            const isScriptLoaded = await loadRazorpayScript();
            if (!isScriptLoaded) {
                CostoumPopup("Failed to load payment gateway.", "error", 4000);
                setIsSubmitting(false);
                return;
            }

            const keyId = processRes.key_id || processRes.data?.key_id;
            const amount = processRes.amount || processRes.data?.amount;
            const razorpayOrderId = processRes.razorpayOrderId || processRes.data?.razorpayOrderId;

            const options = {
                key: keyId,
                amount: amount,
                currency: "INR",
                name: "Health Kangaroo Nursing Care",
                description: "Verified Clinical Home Care",
                order_id: razorpayOrderId,
                prefill: {
                    name: bookingData.patients?.[0]?.name || "Patient",
                    contact: selectedAddress?.phone || ""
                },
                theme: { color: "#08B36A" },
                modal: {
                    ondismiss: () => {
                        setIsSubmitting(false);
                        CostoumPopup("Payment cancelled", "warning", 3000);
                    }
                },
                handler: async function (response) {
                    try {
                        setIsSubmitting(true);
                        
                        // Exact payload for POST /user/nurse/verify-payment
                        const verificationRes = await UserAPI.verifyPaymentNurse({
                            razorpayOrderId: response.razorpay_order_id || razorpayOrderId,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature
                        });

                        if (verificationRes?.success) {
                            sessionStorage.removeItem("pendingNurseBooking");
                            setConfirmedBookingData({
                                ...verificationRes.data,
                                bookingId: verificationRes.data?.bookingId || processRes.bookingId || "HKN-CONFIRMED",
                                status: verificationRes.data?.status || "Confirmed",
                                paymentStatus: verificationRes.data?.paymentStatus || "Paid",
                                paymentMethod: verificationRes.data?.paymentMethod || "Online",
                                totalPrice: verificationRes.data?.amountPaid || computedFinalPrice
                            });
                            CostoumPopup(verificationRes.message || "Payment verified successfully!", "success", 3000);
                        } else {
                            CostoumPopup(verificationRes?.message || "Payment verification failed", "error", 4000);
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
            const errorMsg = error?.response?.data?.message || error?.message || "Booking request failed";
            CostoumPopup(errorMsg, "error", 4000);
            setIsSubmitting(false);
        }
    };

    if (loading || !bookingData) return null;

    const isHospitalCare = bookingData.assessmentLocation === "At Hospital";

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20 font-sans text-slate-900">
            {/* STICKY HEADER */}
            <div className="bg-white/95 backdrop-blur-md border-b border-slate-100 py-4 px-6 sticky top-0 z-40 shadow-xs">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button 
                            type="button"
                            onClick={() => router.back()} 
                            className="text-slate-700 p-2.5 hover:bg-slate-50 rounded-full transition-colors border border-slate-200 cursor-pointer"
                        >
                            <FaArrowLeft size={14} />
                        </button>
                        <div>
                            <span className="text-[10px] font-black uppercase text-[#08B36A] tracking-widest block leading-none mb-1">
                                Secure Checkout
                            </span>
                            <h1 className="text-base font-black uppercase tracking-tight text-slate-900">
                                {bookingData.serviceDetails?.title || "Nursing Schedule & Payment"}
                            </h1>
                        </div>
                    </div>
                    <div className="text-[11px] font-black uppercase tracking-wider bg-emerald-50 text-[#08B36A] px-3 py-1.5 rounded-full border border-emerald-100">
                        Step 2 of 2
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-6 mt-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start">
                    
                    {/* LEFT COLUMN: SELECTION CARDS */}
                    <div className="lg:col-span-8 space-y-6">
                        
                        {/* VIP Subscription Banner */}
                        {pricing.isSubscriptionApplied && (
                            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 p-5 rounded-[2rem] flex items-center gap-4 shadow-sm">
                                <div className="w-12 h-12 rounded-2xl bg-white shadow-xs flex items-center justify-center text-[#08B36A] flex-shrink-0 border border-emerald-100">
                                    <FaGem size={22} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-sm font-black text-emerald-950 uppercase tracking-tight">
                                            {pricing.planName} Benefit Applied
                                        </h4>
                                        <span className="bg-[#08B36A] text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                                            Free Visit
                                        </span>
                                    </div>
                                    <p className="text-xs font-semibold text-emerald-800 mt-0.5">
                                        Base consultation charges are waived (₹0) automatically.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* 1. Location Selector (Hospital Bedside Details OR Home Address) */}
                        {isHospitalCare ? (
                            <div className="bg-white border border-slate-200/80 rounded-[2rem] p-6 shadow-xs space-y-4">
                                <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#08B36A] flex items-center justify-center">
                                        <FaHospital size={18} />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-black text-slate-900">Hospital Bedside Details</h3>
                                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                            Enter the hospital ward & bed for the nurse to attend
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3.5 pt-1">
                                    {/* Hospital Dropdown / Input */}
                                    <div>
                                        <label className="text-[11px] font-black uppercase text-slate-500 tracking-wider block mb-1.5">
                                            Hospital Name *
                                        </label>
                                        {hospitalsList.length > 0 ? (
                                            <select
                                                value={hospitalInfo.hospitalId}
                                                onChange={(e) => {
                                                    const selected = hospitalsList.find(h => h._id === e.target.value);
                                                    setHospitalInfo(prev => ({
                                                        ...prev,
                                                        hospitalId: e.target.value,
                                                        hospitalName: selected?.hospitalName || selected?.name || ""
                                                    }));
                                                }}
                                                className="w-full p-3.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-[#08B36A]"
                                            >
                                                <option value="">Select Hospital</option>
                                                {hospitalsList.map((hosp) => (
                                                    <option key={hosp._id} value={hosp._id}>
                                                        {hosp.hospitalName || hosp.name} {hosp.city ? `(${hosp.city})` : ''}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <input
                                                type="text"
                                                placeholder="e.g., Fortis Hospital Mohali"
                                                value={hospitalInfo.hospitalName}
                                                onChange={(e) => setHospitalInfo(prev => ({ ...prev, hospitalName: e.target.value }))}
                                                className="w-full p-3.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-[#08B36A]"
                                            />
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                        {/* Ward Name */}
                                        <div>
                                            <label className="text-[11px] font-black uppercase text-slate-500 tracking-wider block mb-1.5">
                                                Ward Name / Floor *
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="e.g., ICU / General Ward 3"
                                                value={hospitalInfo.wardName}
                                                onChange={(e) => setHospitalInfo(prev => ({ ...prev, wardName: e.target.value }))}
                                                className="w-full p-3.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-[#08B36A]"
                                            />
                                        </div>

                                        {/* Bed Number */}
                                        <div>
                                            <label className="text-[11px] font-black uppercase text-slate-500 tracking-wider block mb-1.5">
                                                Bed Number *
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="e.g., Bed 04"
                                                value={hospitalInfo.bedNumber}
                                                onChange={(e) => setHospitalInfo(prev => ({ ...prev, bedNumber: e.target.value }))}
                                                className="w-full p-3.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-[#08B36A]"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <AddressSelector selectedAddress={selectedAddress} onSelect={setSelectedAddress} />
                        )}
                        
                        {/* 2. Enhanced Slot Picker Component */}
                        <SlotPicker
                            nurseId={bookingData.nurseId}
                            itemId={bookingData.serviceId || bookingData.packageId}
                            isPackage={!!bookingData.packageId}
                            onSlotSelect={setSlotInfo}
                            initialBasePrice={bookingData.basePrice || 0}
                            pricingRates={bookingData.pricing}
                        />

                        {/* 3. Consumables Section */}
                        {!consumablesLoading && availableConsumables.length > 0 && (
                            <ConsumablesPicker
                                items={availableConsumables}
                                selectedItems={selectedConsumables}
                                onToggle={handleToggleConsumable}
                            />
                        )}

                        {/* 4. Payment Method Selector */}
                        {pricing.totalPrice > 0 && (
                            <div className="bg-white border border-slate-200/80 rounded-[2rem] p-6 shadow-sm space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                                            Select Payment Method
                                        </h3>
                                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                                            Choose how you wish to pay
                                        </p>
                                    </div>
                                    <span className="text-xs font-black text-[#08B36A]">
                                        Total: ₹{Math.round(pricing.totalPrice)}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Online Payment */}
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod("Online")}
                                        className={`p-4 rounded-2xl border transition-all text-left flex items-center justify-between cursor-pointer
                                            ${paymentMethod === "Online" 
                                                ? 'border-[#08B36A] bg-emerald-50/40 ring-2 ring-[#08B36A]/20' 
                                                : 'bg-white border-slate-200 hover:border-slate-300'}`}
                                    >
                                        <div className="flex items-center gap-3.5">
                                            <div className="w-11 h-11 bg-emerald-100 text-[#08B36A] rounded-xl flex items-center justify-center shrink-0">
                                                <FaCreditCard size={18} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-slate-900">Pay Online</p>
                                                <p className="text-[10px] text-slate-500 font-medium mt-0.5">UPI, Cards, NetBanking</p>
                                            </div>
                                        </div>
                                        {paymentMethod === "Online" && <FaCheckCircle className="text-[#08B36A]" size={16} />}
                                    </button>

                                    {/* Cash on Delivery / Pay on Arrival */}
                                    <button
                                        type="button"
                                        disabled={!pricing.isCodAvailable}
                                        onClick={() => setPaymentMethod("COD")}
                                        className={`p-4 rounded-2xl border transition-all text-left flex items-center justify-between relative cursor-pointer
                                            ${!pricing.isCodAvailable ? 'opacity-40 cursor-not-allowed bg-slate-50 border-slate-200' : ''}
                                            ${paymentMethod === "COD" 
                                                ? 'border-[#08B36A] bg-emerald-50/40 ring-2 ring-[#08B36A]/20' 
                                                : 'bg-white border-slate-200 hover:border-slate-300'}`}
                                    >
                                        <div className="flex items-center gap-3.5">
                                            <div className="w-11 h-11 bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center shrink-0">
                                                <FaMoneyBillWave size={18} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-slate-900">
                                                    {isHospitalCare ? "Pay on Arrival (COD)" : "Cash on Delivery (COD)"}
                                                </p>
                                                <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                                                    {pricing.isCodAvailable 
                                                        ? (isHospitalCare ? "Pay nurse directly at hospital ward" : "Pay nurse directly on arrival")
                                                        : "COD unavailable for this provider"}
                                                </p>
                                            </div>
                                        </div>
                                        {paymentMethod === "COD" && <FaCheckCircle className="text-[#08B36A]" size={16} />}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Trust & Safety Guarantee */}
                        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
                            <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-[#08B36A] flex-shrink-0 border border-emerald-100">
                                <FaShieldAlt size={18} />
                            </div>
                            <div>
                                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                                    Certified Care Guarantee
                                </h4>
                                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                                    Verified nurse providers with background checks and sanitized clinical equipment.
                                </p>
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN: BILL SUMMARY STICKY */}
                    <div className="lg:col-span-4 lg:sticky lg:top-24">
                        <BookingSummary
                            bookingData={bookingData}
                            slotInfo={slotInfo}
                            selectedAddress={isHospitalCare ? { _id: "hospital-bedside", houseNo: hospitalInfo.hospitalName, sector: hospitalInfo.wardName } : selectedAddress}
                            selectedConsumables={selectedConsumables}
                            onProceed={handleFinalBooking}
                            isSubmitting={isSubmitting || isFetchingSummary}
                            subscriptionInfo={pricing}
                            paymentMethod={paymentMethod}
                        />
                    </div>
                </div>
            </div>

            {/* FULL DETAILED CONFIRMATION MODAL */}
            {confirmedBookingData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 sm:p-6 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
                    <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 max-w-lg w-full border border-slate-100 shadow-2xl space-y-6 my-auto max-h-[90vh] overflow-y-auto scrollbar-none">
                        
                        {/* Header Badge */}
                        <div className="text-center space-y-2">
                            <div className="mx-auto w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-[#08B36A] border border-emerald-100 shadow-xs">
                                <FaCheckCircle className="w-9 h-9" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Appointment Scheduled!</h3>
                            <p className="text-xs font-semibold text-slate-500">
                                Your nursing care request has been verified and registered.
                            </p>
                        </div>

                        {/* Booking ID Banner */}
                        <div className="bg-gradient-to-r from-emerald-50/80 via-white to-emerald-50/50 rounded-2xl p-4 border border-emerald-100 flex items-center justify-between">
                            <div>
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                                    Booking Reference
                                </span>
                                <span className="font-mono font-black text-sm text-slate-800">
                                    {confirmedBookingData.bookingId || "HKN-CONFIRMED"}
                                </span>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] font-black uppercase text-[#08B36A] bg-white px-2.5 py-1 rounded-full border border-emerald-200 shadow-xs">
                                    {confirmedBookingData.status || "Confirmed"}
                                </span>
                            </div>
                        </div>

                        {/* Comprehensive Details Cards */}
                        <div className="space-y-3 text-xs">
                            
                            {/* Service & Assigned Nurse Provider */}
                            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">
                                            Service Name
                                        </span>
                                        <p className="font-black text-slate-900 text-sm">
                                            {bookingData.serviceDetails?.title || "Clinical Nursing Care"}
                                        </p>
                                    </div>
                                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 uppercase shrink-0">
                                        {slotInfo.mode || "Single Visit"}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60 text-slate-600">
                                    <FaUserNurse className="text-[#08B36A] shrink-0" />
                                    <span className="font-bold">Provider: {bookingData.nurseName || "Assigned Healthcare Nurse"}</span>
                                </div>
                            </div>

                            {/* Schedule & Timing */}
                            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-white text-[#08B36A] flex items-center justify-center border border-slate-200/80 shadow-xs">
                                        <FaCalendarAlt size={14} />
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Visit Schedule</span>
                                        <p className="font-black text-slate-800">
                                            {slotInfo.displayTime || `${slotInfo.startDate} at ${formatTimeToAMPM(slotInfo.startTime)}`}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Care Location Details (Hospital or Home Address) */}
                            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                <div className="flex items-start gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-white text-[#08B36A] flex items-center justify-center border border-slate-200/80 shadow-xs shrink-0 mt-0.5">
                                        {isHospitalCare ? <FaHospital size={14} /> : <FaMapMarkerAlt size={14} />}
                                    </div>
                                    <div className="flex-1">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                                            {isHospitalCare ? "Hospital Bedside Location" : "Home Service Address"}
                                        </span>
                                        {isHospitalCare ? (
                                            <div className="space-y-0.5 mt-0.5">
                                                <p className="font-black text-slate-900">{hospitalInfo.hospitalName}</p>
                                                <p className="text-slate-600 font-semibold">{hospitalInfo.wardName} • {hospitalInfo.bedNumber}</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-0.5 mt-0.5">
                                                <p className="font-black text-slate-900">{selectedAddress?.name || "Self"}</p>
                                                <p className="text-slate-600 font-medium">
                                                    {selectedAddress?.houseNo}, {selectedAddress?.sector}, {selectedAddress?.city} - {selectedAddress?.pincode}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Patient(s) Info */}
                            <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <FaUser className="text-slate-400 text-xs" />
                                    <span className="text-slate-500 font-semibold">Patient(s):</span>
                                    <span className="font-black text-slate-800">
                                        {bookingData.patients?.map(p => p.name || p.fullName).join(", ") || "Self"}
                                    </span>
                                </div>
                                <span className="text-[10px] font-bold text-slate-400">
                                    {bookingData.patients?.length || 1} Person(s)
                                </span>
                            </div>

                            {/* Consumables (if selected) */}
                            {selectedConsumables.length > 0 && (
                                <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <FaBoxOpen className="text-[#08B36A]" />
                                        <span className="text-slate-500 font-semibold">Medical Consumables:</span>
                                        <span className="font-bold text-slate-800">
                                            {selectedConsumables.length} Item(s) included
                                        </span>
                                    </div>
                                    <span className="font-black text-slate-700">
                                        +₹{pricing.consumableTotal}
                                    </span>
                                </div>
                            )}

                            {/* Payment Summary Box */}
                            <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-2 border border-slate-800">
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400 font-medium">Payment Mode:</span>
                                    <span className="font-black text-white">
                                        {confirmedBookingData.paymentMethod || (paymentMethod === "COD" ? "Cash on Arrival (COD)" : "Online")}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400 font-medium">Payment Status:</span>
                                    <span className="font-black text-[#08B36A] uppercase">
                                        {confirmedBookingData.paymentStatus || (paymentMethod === "COD" ? "Pending on Visit" : "Paid")}
                                    </span>
                                </div>
                                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                                    <span className="text-slate-300 font-bold">Amount Paid / Total:</span>
                                    <span className="text-xl font-black text-[#08B36A]">
                                        ₹{Math.round(confirmedBookingData.totalPrice || confirmedBookingData.amountPaid || pricing.totalPrice)}
                                    </span>
                                </div>
                            </div>

                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-2 pt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setConfirmedBookingData(null);
                                    router.push('/userscreens/previousorders');
                                }}
                                className="w-full bg-[#08B36A] hover:bg-[#079c5c] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/20 active:scale-98 transition-all cursor-pointer"
                            >
                                View My Appointments
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setConfirmedBookingData(null);
                                    router.push('/');
                                }}
                                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                            >
                                Back to Home
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function AppointmentSchedulingPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center font-bold text-slate-400">
                <FaSpinner className="animate-spin text-[#08B36A] text-3xl" />
            </div>
        }>
            <AppointmentSchedulingContent />
        </Suspense>
    );
}