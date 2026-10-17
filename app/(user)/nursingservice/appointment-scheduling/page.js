"use client";

import React, { useState, useEffect, Suspense, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    FaArrowLeft, FaShieldAlt, FaGem, FaCheckCircle,
    FaCreditCard, FaMoneyBillWave, FaSpinner,
    FaHospital, FaCalendarAlt, 
    FaMapMarkerAlt, FaUserNurse, FaBolt, FaExclamationTriangle,
    FaSearch, FaPlusCircle
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

const formatTimeToAMPM = (timeStr) => {
    if (!timeStr) return "";
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
    const [isManualHospital, setIsManualHospital] = useState(false);
    const [hospitalInfo, setHospitalInfo] = useState({
        hospitalId: "",
        hospitalName: "",
        hospitalAddress: "",
        city: "",
        wardName: "",
        floorNumber: "",
        bedNumber: ""
    });

    // Slot & Schedule
    const [slotInfo, setSlotInfo] = useState({
        mode: "One day One Time",
        startDate: "",
        endDate: "",
        startTime: "",
        endTime: null,
        extraFee: 0,
        expressExtraFee: 0,
        isExpressWindow: false,
        basePrice: 0,
        totalPrice: 0,
        displayTime: ""
    });

    // Coupon & Payment States
    const [appliedCouponCode, setAppliedCouponCode] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("Online"); // 'Online' | 'COD'
    const [serverPricing, setServerPricing] = useState(null);
    const [isFetchingSummary, setIsFetchingSummary] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [confirmedBookingData, setConfirmedBookingData] = useState(null);

    const patientCount = bookingData?.patients?.length || 1;

    // 1. Fetch Registered Hospitals Dropdown
    const fetchHospitals = useCallback(async (query = "", city = "") => {
        try {
            if (typeof UserAPI.getHospitalDropdown === "function") {
                const hospRes = await UserAPI.getHospitalDropdown({ search: query, city });
                if (hospRes?.success && Array.isArray(hospRes.data)) {
                    setHospitalsList(hospRes.data);
                } else if (Array.isArray(hospRes)) {
                    setHospitalsList(hospRes);
                }
            }
        } catch (e) {
            console.warn("⚠️ Hospital dropdown fetch error:", e);
        }
    }, []);

    // 2. Initialize Booking Data, Map Correct Nurse Service ID & Fetch Consumables
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

                if (parsedData.hospitalDetails || parsedData.hospitalName) {
                    const hospData = {
                        hospitalId: parsedData.hospitalDetails?.hospitalId || parsedData.hospitalId || "",
                        hospitalName: parsedData.hospitalDetails?.hospitalName || parsedData.hospitalName || "",
                        hospitalAddress: parsedData.hospitalDetails?.hospitalAddress || "",
                        city: parsedData.hospitalDetails?.city || parsedData.city || "",
                        wardName: parsedData.hospitalDetails?.wardName || parsedData.wardName || "",
                        floorNumber: parsedData.hospitalDetails?.floorNumber || "",
                        bedNumber: parsedData.hospitalDetails?.bedNumber || ""
                    };
                    setHospitalInfo(hospData);
                    if (!hospData.hospitalId && hospData.hospitalName) {
                        setIsManualHospital(true);
                    }
                }

                if (parsedData.assessmentLocation === "At Hospital") {
                    fetchHospitals("", parsedData.city || "");
                }

                let resolvedServiceId = parsedData.serviceId || null;
                let resolvedPackageId = parsedData.packageId || null;
                let consumables = [];

                // Resolve exact NurseService._id / NursePackage._id from nurse details
                if (parsedData.nurseId && parsedData.nurseId !== "undefined") {
                    try {
                        setConsumablesLoading(true);
                        const detailsRes = await UserAPI.nurseServiceDetail(parsedData.nurseId);
                        if (detailsRes?.success && detailsRes.data) {
                            const nurseData = detailsRes.data;

                            if (!parsedData.packageId) {
                                const servicesList = nurseData.services || [];
                                // Match either by subdocument _id, catalog serviceId, or service name
                                const matchedService = servicesList.find(s => {
                                    const sId = String(s._id || "");
                                    const masterId = String(s.serviceId?._id || s.serviceId || "");
                                    const careId = String(s.careServiceId?._id || s.careServiceId || "");
                                    const targetId = String(parsedData.serviceId || parsedData.nurseServiceId || "");

                                    if (sId === targetId) return true;
                                    if (masterId && masterId === targetId) return true;
                                    if (careId && careId === targetId) return true;

                                    const sTitle = (s.title || s.serviceName || s.serviceId?.name || "").trim().toLowerCase();
                                    const targetTitle = (parsedData.serviceDetails?.title || parsedData.serviceDetails?.name || parsedData.serviceName || "").trim().toLowerCase();
                                    return Boolean(sTitle && targetTitle && sTitle === targetTitle);
                                });

                                if (matchedService) {
                                    resolvedServiceId = String(matchedService._id);
                                    if (matchedService.consumablesUsed) {
                                        consumables = matchedService.consumablesUsed;
                                    }
                                }
                            } else {
                                const packagesList = nurseData.packages || nurseData.carePackages || [];
                                const matchedPkg = packagesList.find(p => {
                                    const pId = String(p._id || "");
                                    const masterPkgId = String(p.packageId?._id || p.packageId || "");
                                    const targetPkgId = String(parsedData.packageId || "");

                                    if (pId === targetPkgId) return true;
                                    if (masterPkgId && masterPkgId === targetPkgId) return true;

                                    const pTitle = (p.title || p.packageName || p.packageId?.name || "").trim().toLowerCase();
                                    const targetTitle = (parsedData.packageDetails?.title || parsedData.packageDetails?.name || "").trim().toLowerCase();
                                    return Boolean(pTitle && targetTitle && pTitle === targetTitle);
                                });

                                if (matchedPkg) {
                                    resolvedPackageId = String(matchedPkg._id);
                                }
                            }
                        }
                    } catch (error) {
                        console.error("❌ Error resolving nurse service/package details:", error);
                    } finally {
                        setConsumablesLoading(false);
                    }
                }

                // If package, fetch package consumables
                if (parsedData.packageId) {
                    try {
                        setConsumablesLoading(true);
                        const pkgRes = await UserAPI.getUserPackageDetails(parsedData.packageId);
                        if (pkgRes?.success && pkgRes.data?.consumablesUsed) {
                            consumables = pkgRes.data.consumablesUsed;
                        }
                    } catch (err) {
                        console.error("Error loading package consumables:", err);
                    } finally {
                        setConsumablesLoading(false);
                    }
                }

                setAvailableConsumables(consumables);

                // Update bookingData with the correct NurseService / NursePackage ID
                const updatedBooking = {
                    ...parsedData,
                    serviceId: resolvedServiceId,
                    packageId: resolvedPackageId
                };
                sessionStorage.setItem("pendingNurseBooking", JSON.stringify(updatedBooking));
                setBookingData(updatedBooking);
            } else {
                router.push("/nursingservice");
            }
            setLoading(false);
        };

        initData();
    }, [router, fetchHospitals]);

    // 3. Fetch Server-Side Checkout Summary (POST /user/nurse/checkout)
    const fetchCheckoutSummary = useCallback(async (couponCodeToApply = "") => {
        if (!bookingData?.nurseId || !slotInfo.startDate || !slotInfo.startTime) return;

        const isPackage = Boolean(bookingData.packageId);
        const resolvedServiceId = !isPackage && bookingData.serviceId ? String(bookingData.serviceId) : null;
        const resolvedPackageId = isPackage && bookingData.packageId ? String(bookingData.packageId) : null;

        // Regular service must have a valid serviceId before hitting checkout API
        if (!isPackage && !resolvedServiceId) {
            console.warn("⚠️ Waiting for NurseService._id resolution...");
            return;
        }

        try {
            setIsFetchingSummary(true);
            const cleanStartDate = slotInfo.startDate.split('T')[0];
            const cleanEndDate = slotInfo.endDate ? slotInfo.endDate.split('T')[0] : cleanStartDate;

            // Strict payload mapping matching frontend integration guide
            const payload = {
                nurseId: String(bookingData.nurseId),
                serviceId: resolvedServiceId,
                packageId: resolvedPackageId,
                isPackage: Boolean(isPackage),
                selectedType: slotInfo.mode || "One day One Time",
                startDate: cleanStartDate,
                endDate: cleanEndDate,
                startTime: slotInfo.startTime,
                endTime: slotInfo.mode === "Acc. To Per/Hours" ? (slotInfo.endTime || null) : null,
                patientCount: Number(patientCount),
                isFasterService: Boolean(slotInfo.isExpressWindow),
                selectedConsumables: selectedConsumables.map(c => ({
                    consumableId: String(c.consumableId),
                    itemName: c.itemName || "Medical Consumable",
                    price: Number(c.price) || 0,
                    unitType: c.unitType || "Piece"
                })),
                couponCode: couponCodeToApply !== undefined ? couponCodeToApply : (appliedCouponCode || "")
            };

            const res = await UserAPI.nurseCheckoutSummary(payload);
            const responseData = res?.data || res;

            if (res?.success && responseData) {
                setServerPricing(responseData);

                if (couponCodeToApply && res.message) {
                    CostoumPopup(res.message, "success", 3000);
                }

                const codAllowed = responseData.isCodAvailable ?? responseData.breakdown?.isCodAvailable ?? true;
                if (!codAllowed && paymentMethod === "COD") {
                    setPaymentMethod("Online");
                }
            } else if (res?.success === false) {
                CostoumPopup(res?.message || "Invalid or expired coupon code", "error", 3000);
            }
        } catch (error) {
            console.error("❌ Error fetching nurse checkout summary:", error);
            const errorMsg = error?.response?.data?.message || error?.message || "Failed to apply checkout breakdown";
            if (couponCodeToApply) {
                CostoumPopup(errorMsg, "error", 3000);
            }
        } finally {
            setIsFetchingSummary(false);
        }
    }, [bookingData, slotInfo, selectedConsumables, appliedCouponCode, paymentMethod, patientCount]);

    useEffect(() => {
        if (slotInfo.startDate && slotInfo.startTime && bookingData?.nurseId) {
            fetchCheckoutSummary();
        }
    }, [slotInfo.startDate, slotInfo.endDate, slotInfo.startTime, slotInfo.endTime, slotInfo.mode, selectedConsumables, slotInfo.isExpressWindow, hospitalInfo.hospitalId, bookingData?.serviceId, bookingData?.packageId, fetchCheckoutSummary]);

    // 4. Computed Pricing Breakdown
    const pricing = useMemo(() => {
        const singleConsumableTotal = selectedConsumables.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
        const totalConsumablesMultiplied = singleConsumableTotal * patientCount;
        const slotExpressFee = Number(slotInfo.expressExtraFee || 0);
        const expressActive = Boolean(slotInfo.isExpressWindow);

        if (serverPricing?.breakdown) {
            const b = serverPricing.breakdown;
            const deliveryBenefit = b.deliverySubscriptionBenefit || b.travelBenefit || {};
            const isTravelFree = Boolean(deliveryBenefit.isApplied);

            const rawExpress = Number(b.fasterServiceCharge || (expressActive ? slotExpressFee : 0));
            const finalExpressCharge = isTravelFree ? 0 : rawExpress;
            const rawTravelFee = Number(b.travelFee ?? b.deliveryCharge ?? b.originalTravelFee ?? 45);
            const activeTravelFee = isTravelFree ? 0 : rawTravelFee;
            const slotSurcharge = Number(b.slotSurcharge ?? b.slotPremiumFee ?? slotInfo?.extraFee ?? 0);
            const finalConsumablesTotal = Number(b.consumableTotal ?? totalConsumablesMultiplied);
            const couponDiscount = Number(b.couponDiscount ?? b.appliedCoupon?.discountAmount ?? 0);

            return {
                baseServicePrice: Number(b.baseServicePrice ?? (1800 * patientCount)),
                originalBasePrice: Number(b.originalBasePrice ?? b.baseServicePrice ?? (1800 * patientCount)),
                datePremiumFee: Number(b.datePremiumFee ?? 0),
                slotSurcharge,
                singlePatientConsumableTotal: Number(b.singlePatientConsumableTotal ?? singleConsumableTotal),
                consumableTotal: finalConsumablesTotal,
                couponDiscount: couponDiscount,
                fasterServiceCharge: finalExpressCharge,
                rawExpressCharge: rawExpress,
                travelFee: activeTravelFee,
                rawTravelFee,
                taxAmount: Number(b.taxAmount ?? 0),
                totalPrice: Number(b.totalPrice ?? (b.baseServicePrice + finalConsumablesTotal + activeTravelFee + finalExpressCharge + slotSurcharge - couponDiscount)),
                isCodAvailable: Boolean(serverPricing.isCodAvailable ?? true),
                isExpressRequired: Boolean(b.isExpressRequired),
                pCount: Number(b.pCount ?? patientCount),
                durationUnits: Number(b.durationDays ?? b.totalDays ?? 1),
                visitBenefit: {
                    isApplied: false,
                    hasActiveSubscription: false,
                    remainingCount: 0
                },
                travelBenefit: {
                    isApplied: isTravelFree,
                    hasActiveSubscription: Boolean(deliveryBenefit.hasActiveSubscription),
                    remainingCount: deliveryBenefit.remainingCount ?? 0,
                    planName: deliveryBenefit.planName || ""
                }
            };
        }

        const fallbackBase = (slotInfo.totalPrice || slotInfo.basePrice || bookingData?.basePrice || 1800) * patientCount;
        const fallbackExpress = expressActive ? slotExpressFee : 0;
        const fallbackTravel = 45;
        return {
            baseServicePrice: fallbackBase,
            originalBasePrice: fallbackBase,
            datePremiumFee: 0,
            slotSurcharge: slotInfo.extraFee || 0,
            singlePatientConsumableTotal: singleConsumableTotal,
            consumableTotal: totalConsumablesMultiplied,
            couponDiscount: 0,
            fasterServiceCharge: fallbackExpress,
            rawExpressCharge: fallbackExpress,
            travelFee: fallbackTravel,
            rawTravelFee: fallbackTravel,
            taxAmount: 0,
            totalPrice: fallbackBase + totalConsumablesMultiplied + (slotInfo.extraFee || 0) + fallbackExpress + fallbackTravel,
            isCodAvailable: true,
            isExpressRequired: false,
            pCount: patientCount,
            durationUnits: 1,
            visitBenefit: { isApplied: false },
            travelBenefit: { isApplied: false }
        };
    }, [serverPricing, selectedConsumables, slotInfo, bookingData, patientCount]);

    const handleToggleConsumable = (consumable) => {
        const consumableId = consumable.masterItemId?._id || consumable._id;
        const existingIndex = selectedConsumables.findIndex(item => item.consumableId === consumableId);
        if (existingIndex >= 0) {
            setSelectedConsumables(prev => prev.filter((_, idx) => idx !== existingIndex));
        } else {
            const newItem = {
                consumableId: consumableId,
                itemName: consumable.masterItemId?.itemName || consumable.itemName,
                price: consumable.finalPrice || consumable.price || 0,
                unitType: consumable.masterItemId?.unitType || consumable.unitType || "Piece"
            };
            setSelectedConsumables(prev => [...prev, newItem]);
        }
    };

    // 5. Final Booking Handler (POST /user/nurse/book)
    const handleFinalBooking = async (summaryData) => {
        const isHospitalCare = bookingData.assessmentLocation === "At Hospital";

        if (!isHospitalCare && !selectedAddress) {
            CostoumPopup("Please select a home service address", "warning", 3000);
            return;
        }

        if (isHospitalCare) {
            if (!hospitalInfo.hospitalName.trim()) {
                CostoumPopup("Please select or enter Hospital Name", "warning", 3000);
                return;
            }
            if (!hospitalInfo.wardName.trim()) {
                CostoumPopup("Please enter Ward Name / Floor", "warning", 3000);
                return;
            }
            if (!hospitalInfo.bedNumber.trim()) {
                CostoumPopup("Please enter Bed Number", "warning", 3000);
                return;
            }
        }

        if (!slotInfo.startDate) {
            CostoumPopup("Please select appointment date", "warning", 3000);
            return;
        }

        if (!slotInfo.startTime) {
            CostoumPopup("Please choose an arrival time slot", "warning", 3000);
            return;
        }

        try {
            setIsSubmitting(true);

            const { appliedCoupon, finalTotal } = summaryData;
            const computedFinalPrice = Math.round(typeof finalTotal === "number" ? finalTotal : pricing.totalPrice);
            const isZeroTotal = computedFinalPrice === 0;
            const finalPaymentMethod = isZeroTotal ? "COD" : (paymentMethod === "COD" ? "COD" : "Online");

            const isPackage = Boolean(bookingData.packageId);
            const resolvedServiceId = !isPackage && bookingData.serviceId ? String(bookingData.serviceId) : null;
            const resolvedPackageId = isPackage && bookingData.packageId ? String(bookingData.packageId) : null;

            const cleanStartDate = slotInfo.startDate.split('T')[0];
            const cleanEndDate = slotInfo.endDate ? slotInfo.endDate.split('T')[0] : cleanStartDate;

            const bookingPayload = {
                nurseId: String(bookingData.nurseId),
                serviceId: resolvedServiceId,
                packageId: resolvedPackageId,
                isPackage: Boolean(isPackage),
                schedule: {
                    duration: slotInfo.mode || "One day One Time",
                    startDate: cleanStartDate,
                    endDate: cleanEndDate,
                    startTime: slotInfo.startTime,
                    endTime: slotInfo.mode === "Acc. To Per/Hours" ? (slotInfo.endTime || null) : null
                },
                patients: (bookingData.patients || []).map(p => ({
                    patientId: p.relation === 'Self' ? 'Self' : (p._id || p.patientId || 'Self'),
                    name: p.name || p.fullName || "Self",
                    age: Number(p.age) || 28,
                    gender: p.gender || "Male",
                    relation: p.relation || "Self"
                })),
                address: {
                    name: selectedAddress?.name || bookingData.patients?.[0]?.name || hospitalInfo.hospitalName || "Patient",
                    phone: selectedAddress?.phone || "9876543210",
                    houseNo: isHospitalCare ? (hospitalInfo.hospitalName || "Hospital Desk") : (selectedAddress?.houseNo || "House #12"),
                    city: isHospitalCare ? (hospitalInfo.city || "Mohali") : (selectedAddress?.city || "Mohali"),
                    state: isHospitalCare ? "Punjab" : (selectedAddress?.state || "Punjab"),
                    pincode: isHospitalCare ? "160071" : (selectedAddress?.pincode || "160071"),
                    addressType: isHospitalCare ? "Other" : (selectedAddress?.addressType || "Home")
                },
                assessmentLocation: isHospitalCare ? "At Hospital" : "At Home",
                paymentMethod: finalPaymentMethod,
                ...(selectedConsumables.length > 0 && {
                    selectedConsumables: selectedConsumables.map(c => ({
                        consumableId: String(c.consumableId),
                        itemName: c.itemName || "Medical Consumable",
                        price: Number(c.price) || 0,
                        unitType: c.unitType || "Piece"
                    }))
                }),
                ...(hospitalInfo.hospitalId && isHospitalCare && {
                    hospitalDetails: {
                        isHKHospital: !isManualHospital,
                        hospitalId: !isManualHospital ? hospitalInfo.hospitalId : null,
                        hospitalName: hospitalInfo.hospitalName,
                        hospitalAddress: hospitalInfo.hospitalAddress || "Hospital Attendant Desk",
                        city: hospitalInfo.city || "Mohali",
                        wardName: hospitalInfo.wardName,
                        floorNumber: hospitalInfo.floorNumber || "1st Floor",
                        bedNumber: hospitalInfo.bedNumber
                    }
                }),
                isFasterService: Boolean(slotInfo.isExpressWindow),
                couponCode: appliedCoupon?.couponName || appliedCouponCode || undefined
            };

            const res = await UserAPI.bookNurseAppointment(bookingPayload);

            if (!res?.success) {
                CostoumPopup(res?.message || "Booking request failed. Please check details.", "error", 4000);
                setIsSubmitting(false);
                return;
            }

            const targetBookingId = res.bookingId || res.data?.bookingId || "HKN-CONFIRMED";
            const appointmentId = res.appointmentId || res.data?._id || res.data?.appointmentId || targetBookingId;

            // Direct Confirmation for COD or Free Booking
            if (isZeroTotal || finalPaymentMethod === "COD" || res.data?.paymentStatus === "Paid" || res.status === "Confirmed") {
                sessionStorage.removeItem("pendingNurseBooking");
                const confirmedData = {
                    ...(res.data || {}),
                    bookingId: targetBookingId,
                    serviceOTP: res.serviceOTP || res.data?.serviceOTP,
                    completionOTP: res.completionOTP || res.data?.completionOTP,
                    status: res.status || res.data?.status || "Confirmed",
                    paymentStatus: res.data?.paymentStatus || (finalPaymentMethod === "COD" ? "Pending" : "Paid"),
                    paymentMethod: finalPaymentMethod,
                    totalPrice: computedFinalPrice
                };
                setConfirmedBookingData(confirmedData);
                setIsSubmitting(false);
                return;
            }

            // Online Payment via Razorpay
            const isScriptLoaded = await loadRazorpayScript();
            if (!isScriptLoaded) {
                CostoumPopup("Failed to load payment gateway.", "error", 4000);
                setIsSubmitting(false);
                return;
            }

            let keyId = res.key_id || res.data?.key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
            if (typeof keyId === 'string' && keyId.startsWith("zp_")) {
                keyId = "r" + keyId;
            }

            const rawAmount = res.amount || res.data?.amount || Math.round(computedFinalPrice * 100);
            const razorpayOrderId = res.razorpayOrderId || res.data?.razorpayOrderId;

            const options = {
                key: keyId,
                amount: rawAmount,
                currency: "INR",
                name: "Health Kangaroo Nursing Care",
                description: `Payment for Nurse Booking #${targetBookingId}`,
                order_id: razorpayOrderId,
                prefill: {
                    name: bookingData.patients?.[0]?.name || selectedAddress?.name || "Patient",
                    contact: selectedAddress?.phone || ""
                },
                theme: { color: "#08B36A" },
                modal: {
                    ondismiss: () => {
                        setIsSubmitting(false);
                        CostoumPopup("Payment cancelled or closed", "warning", 3000);
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

                        const verificationRes = await UserAPI.verifyPaymentNurse(verificationPayload);

                        if (verificationRes?.success) {
                            sessionStorage.removeItem("pendingNurseBooking");
                            const verifiedConfirmed = {
                                ...(verificationRes.data || res.data || {}),
                                bookingId: verificationRes.bookingId || verificationRes.data?.bookingId || targetBookingId,
                                serviceOTP: verificationRes.serviceOTP || verificationRes.data?.serviceOTP,
                                completionOTP: verificationRes.completionOTP || verificationRes.data?.completionOTP,
                                status: "Confirmed",
                                paymentStatus: "Paid",
                                paymentMethod: "Online",
                                totalPrice: computedFinalPrice
                            };
                            setConfirmedBookingData(verifiedConfirmed);
                            CostoumPopup(verificationRes.message || "Payment verified and nurse booking confirmed!", "success", 3000);
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
            rzpInstance.on('payment.failed', function (response) {
                CostoumPopup(response.error?.description || "Payment failed. Please try again.", "error", 4000);
            });
            rzpInstance.open();

        } catch (error) {
            CostoumPopup(error?.response?.data?.message || error?.message || "Booking request failed", "error", 4000);
            setIsSubmitting(false);
        }
    };

    if (loading || !bookingData) return null;

    const isHospitalCare = bookingData.assessmentLocation === "At Hospital";

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20 font-sans text-slate-900">
            {/* Header */}
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
                    
                    {/* Left Column */}
                    <div className="lg:col-span-8 space-y-6">
                        
                        {/* Travel Benefit */}
                        {pricing.travelBenefit.isApplied && (
                            <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 p-4.5 rounded-[2rem] flex items-center justify-between shadow-xs border-emerald-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white text-teal-600 flex items-center justify-center shadow-xs border border-teal-100">
                                        <FaBolt size={18} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-teal-950 uppercase tracking-tight">
                                            ⚡ Free Express Travel Delivery ({pricing.travelBenefit.planName})
                                        </p>
                                        <p className="text-[11px] font-semibold text-teal-800 mt-0.5">
                                            Fast travel surcharge waived automatically.
                                        </p>
                                    </div>
                                </div>
                                <span className="bg-teal-600 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase">
                                    {pricing.travelBenefit.remainingCount} Left
                                </span>
                            </div>
                        )}

                        {/* Location Selector */}
                        {isHospitalCare ? (
                            <div className="bg-white border border-slate-200/80 rounded-[2rem] p-6 shadow-xs space-y-4">
                                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#08B36A] flex items-center justify-center shrink-0">
                                            <FaHospital size={18} />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-black text-slate-900">Hospital Bedside Details</h3>
                                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                                Enter ward & bed number for bedside nurse dispatch
                                            </p>
                                        </div>
                                    </div>

                                    {/* Manual Toggle Switch */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const nextMode = !isManualHospital;
                                            setIsManualHospital(nextMode);
                                            if (nextMode) {
                                                setHospitalInfo(prev => ({ ...prev, hospitalId: "" }));
                                            }
                                        }}
                                        className="text-[10px] font-black text-[#08B36A] hover:text-emerald-700 uppercase bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200/80 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                                    >
                                        {isManualHospital ? <><FaSearch size={10} /> Search Partner List</> : <><FaPlusCircle size={10} /> Enter Manually</>}
                                    </button>
                                </div>

                                <div className="space-y-3.5 pt-1">
                                    <div>
                                        <label className="text-[11px] font-black uppercase text-slate-500 tracking-wider block mb-1.5">
                                            Hospital Name *
                                        </label>
                                        
                                        {!isManualHospital ? (
                                            <div className="space-y-2">
                                                <select
                                                    value={hospitalInfo.hospitalId}
                                                    onChange={(e) => {
                                                        const selId = e.target.value;
                                                        const selected = hospitalsList.find(h => (h._id || h.id) === selId);
                                                        setHospitalInfo(prev => ({
                                                            ...prev,
                                                            hospitalId: selId,
                                                            hospitalName: selected?.hospitalName || selected?.name || "",
                                                            hospitalAddress: selected?.address || "",
                                                            city: selected?.city || ""
                                                        }));
                                                    }}
                                                    className="w-full p-3.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-[#08B36A] cursor-pointer"
                                                >
                                                    <option value="">-- Select Partner Hospital --</option>
                                                    {hospitalsList.map((hosp) => (
                                                        <option key={hosp._id || hosp.id} value={hosp._id || hosp.id}>
                                                            {hosp.hospitalName || hosp.name} {hosp.city ? `(${hosp.city})` : ''}
                                                        </option>
                                                    ))}
                                                </select>
                                                <p className="text-[10px] text-slate-400 font-medium">
                                                    Can't find your hospital? Click <strong>"Enter Manually"</strong> above to type any hospital name.
                                                </p>
                                            </div>
                                        ) : (
                                            <input
                                                type="text"
                                                placeholder="e.g., Fortis Hospital Mohali / Max Hospital"
                                                value={hospitalInfo.hospitalName}
                                                onChange={(e) => setHospitalInfo(prev => ({ ...prev, hospitalName: e.target.value, hospitalId: "" }))}
                                                className="w-full p-3.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-[#08B36A]"
                                            />
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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
                        
                        {/* Slot Picker */}
                        <SlotPicker
                            nurseId={bookingData.nurseId}
                            itemId={bookingData.serviceId || bookingData.packageId}
                            isPackage={!!bookingData.packageId}
                            onSlotSelect={setSlotInfo}
                            initialBasePrice={bookingData.basePrice || 0}
                            pricingRates={bookingData.pricing}
                        />

                        {/* Consumables Section */}
                        {!consumablesLoading && availableConsumables.length > 0 && (
                            <ConsumablesPicker
                                items={availableConsumables}
                                selectedItems={selectedConsumables}
                                onToggle={handleToggleConsumable}
                            />
                        )}

                        {/* Payment Method Selector (COD vs Online) */}
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
                                                    Cash on Delivery (COD)
                                                </p>
                                                <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                                                    {pricing.isCodAvailable 
                                                        ? (isHospitalCare ? "Pay nurse directly at hospital ward" : "Pay nurse directly on visit")
                                                        : "COD unavailable for this provider"}
                                                </p>
                                            </div>
                                        </div>
                                        {paymentMethod === "COD" && <FaCheckCircle className="text-[#08B36A]" size={16} />}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Certified Care Guarantee */}
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

                    {/* Right Column: Sticky Summary */}
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
                            onCouponApply={(code) => {
                                setAppliedCouponCode(code);
                                fetchCheckoutSummary(code);
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            {confirmedBookingData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 sm:p-6 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
                    <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 max-w-lg w-full border border-slate-100 shadow-2xl space-y-6 my-auto max-h-[90vh] overflow-y-auto scrollbar-none">
                        
                        <div className="text-center space-y-2">
                            <div className="mx-auto w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-[#08B36A] border border-emerald-100 shadow-xs">
                                <FaCheckCircle className="w-9 h-9" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Appointment Scheduled!</h3>
                            <p className="text-xs font-semibold text-slate-500">
                                Your nursing care request has been verified and registered.
                            </p>
                        </div>

                        {confirmedBookingData.serviceOTP && (
                            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-dashed border-emerald-300 rounded-2xl p-4 text-center">
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-800 block mb-1">
                                    Service Start Security OTP
                                </span>
                                <div className="text-3xl font-black tracking-[0.25em] text-[#08B36A] font-mono">
                                    {confirmedBookingData.serviceOTP}
                                </div>
                                <p className="text-[10px] text-slate-500 font-medium mt-1">
                                    Share this 4-digit verification code with the staff nurse upon arrival.
                                </p>
                            </div>
                        )}

                        <div className="bg-gradient-to-r from-emerald-50/80 via-white to-emerald-50/50 rounded-2xl p-4 border border-emerald-100 flex items-center justify-between">
                            <div>
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                                    Booking Reference
                                </span>
                                <span className="font-mono font-black text-sm text-slate-800">
                                    #{confirmedBookingData.bookingId || "HKN-CONFIRMED"}
                                </span>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] font-black uppercase text-[#08B36A] bg-white px-2.5 py-1 rounded-full border border-emerald-200 shadow-xs">
                                    {confirmedBookingData.status || "Confirmed"}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-3 text-xs">
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
                                    <FaUserNurse className="text-[#08B36A]" />
                                    <span className="font-bold">Provider: {bookingData.nurseName || "Assigned Healthcare Nurse"}</span>
                                </div>
                            </div>

                            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-white text-[#08B36A] flex items-center justify-center border border-slate-200/80 shadow-xs">
                                        <FaCalendarAlt size={14} />
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Visit Schedule</span>
                                        <p className="font-black text-slate-800">
                                            {slotInfo.displayTime || (slotInfo.startDate && slotInfo.startTime ? `${slotInfo.startDate} at ${formatTimeToAMPM(slotInfo.startTime)}` : "Not selected")}
                                        </p>
                                    </div>
                                </div>
                            </div>

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

                            <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-2 border border-slate-800">
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400 font-medium">Payment Mode:</span>
                                    <span className="font-black text-white">
                                        {confirmedBookingData.paymentMethod === "COD" ? "Cash on Delivery (Pay on Visit)" : "Online Payment"}
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
                                        ₹{Math.round(confirmedBookingData.totalPrice || pricing.totalPrice)}
                                    </span>
                                </div>
                            </div>

                        </div>

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