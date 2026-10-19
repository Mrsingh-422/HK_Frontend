'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
    FaArrowLeft, FaHospital, FaProcedures,
    FaShieldAlt, FaCheck, FaTimes, FaTag, FaReceipt,
    FaUser, FaPhone, FaCalendarDay, FaCreditCard,
    FaUpload, FaUserMd, FaSpinner, FaMoneyBillWave, 
    FaLock, FaCheckCircle, FaDoorOpen, FaClock,
    FaCrown, FaConciergeBell
} from "react-icons/fa";
import UserAPI from "@/app/services/UserAPI";
import CostoumPopup from "@/lib/CostoumPopup";

// Dynamically load Razorpay SDK reliably
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
            existingScript.remove();
        }
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        script.onload = () => resolve(true);
        script.onerror = () => {
            console.error("❌ Failed to load Razorpay SDK script");
            resolve(false);
        };
        document.body.appendChild(script);
    });
};

export default function HospitalCheckoutPage() {
    const router = useRouter();
    const [bookingType, setBookingType] = useState(null); // 'IPD' | 'OPD'
    const [booking, setBooking] = useState(null);
    const [isReady, setIsReady] = useState(false);

    // Metadata States
    const [services, setServices] = useState([]);
    const [familyMembers, setFamilyMembers] = useState([]);
    const [userProfile, setUserProfile] = useState(null);

    // IPD Specific Add-ons State
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [selectedServices, setSelectedServices] = useState([]);
    const [triageLevel, setTriageLevel] = useState('Routine'); // 'Routine' | 'Urgent' | 'Very Urgent' | 'Emergency'

    // Selection States
    const [selectedMemberId, setSelectedMemberId] = useState("self");

    // Guard against duplicate verification calls
    const isVerifyingRef = useRef(false);

    // Patient & Insurance Details
    const [patientDetails, setPatientDetails] = useState({
        fullName: "",
        dob: "",
        phoneNumber: "",
        gender: "Male",
        relation: "Self",
        address: "",
        city: "",
        pincode: "",
        haveInsurance: "No",
        insuranceNo: "",
        companyName: "",
        insuranceType: "Cashless",
        insuranceDocument: null,
        bookingReason: "",
        bloodGroup: ""
    });

    // Payment & Coupon States
    const [paymentMethod, setPaymentMethod] = useState("Online");
    const [couponCode, setCouponCode] = useState("");
    const [appliedCouponCode, setAppliedCouponCode] = useState("");
    const [couponError, setCouponError] = useState("");
    const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

    // Server-side Checkout Summary State
    const [serverPricing, setServerPricing] = useState(null);
    const [isFetchingSummary, setIsFetchingSummary] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [bookingSuccessData, setBookingSuccessData] = useState(null);

    const getCleanDate = (dateVal) => {
        if (!dateVal) return new Date().toISOString().split("T")[0];
        if (dateVal.includes("T")) return dateVal.split("T")[0];
        return dateVal;
    };

    // 1. Unified Single-Shot Session Initialization with Auto-Recovery of Service IDs
    useEffect(() => {
        const initData = async () => {
            const token = localStorage.getItem('userToken');
            if (!token) {
                CostoumPopup("Please Login To Continue", "warning", 4000);
                router.push('/hospital');
                return;
            }

            // Fetch User Profile
            try {
                if (typeof UserAPI.getProfile === 'function') {
                    const profRes = await UserAPI.getProfile();
                    if (profRes?.success && profRes.data) {
                        const prof = profRes.data;
                        setUserProfile(prof);
                        setPatientDetails(prev => ({
                            ...prev,
                            fullName: prof.name || prof.fullName || prev.fullName,
                            phoneNumber: prof.phone || prof.phoneNumber || prev.phoneNumber,
                            gender: prof.gender || prev.gender,
                            dob: prof.dob ? prof.dob.split('T')[0] : prev.dob
                        }));
                    }
                }
            } catch (err) {
                console.warn("Could not fetch user profile:", err);
            }

            // Fetch Family
            try {
                const famRes = await UserAPI.getFamilyMembers();
                if (famRes?.success) setFamilyMembers(famRes.data || []);
            } catch (err) {
                console.warn("Could not fetch family members:", err);
            }

            const opdRaw = sessionStorage.getItem("activeOpdBooking");
            const ipdRaw = sessionStorage.getItem("activeBooking");

            if (opdRaw) {
                const parsedOpd = JSON.parse(opdRaw);
                setBookingType("OPD");
                setBooking(parsedOpd);
                setPaymentMethod("COD");
                setIsReady(true);
            } else if (ipdRaw) {
                const parsedIpd = JSON.parse(ipdRaw);
                setBookingType("IPD");
                setBooking(parsedIpd);
                setPaymentMethod("Online");

                const doc = parsedIpd.doctorDetails || null;
                const rawSrv = Array.isArray(parsedIpd.specialServices) ? parsedIpd.specialServices : [];
                const trg = parsedIpd.triageLevel || 'Routine';

                setSelectedDoctor(doc);
                setTriageLevel(trg);

                // Fetch Hospital Services Catalog to recover any missing ObjectIds
                if (parsedIpd.hospitalId) {
                    try {
                        const srvRes = await UserAPI.getHospitalServices(parsedIpd.hospitalId);
                        if (srvRes?.success && Array.isArray(srvRes.data)) {
                            const catalog = srvRes.data;
                            setServices(catalog);

                            // Match serviceName to get the real MongoDB _id
                            const enrichedServices = rawSrv.map(item => {
                                if (item._id || item.serviceId) return item;
                                const match = catalog.find(c => 
                                    c.serviceName?.trim().toLowerCase() === item.serviceName?.trim().toLowerCase()
                                );
                                return match ? { ...item, _id: match._id, serviceId: match._id, price: match.price || item.price } : item;
                            });

                            setSelectedServices(enrichedServices);
                            executeCheckoutSummary(parsedIpd, enrichedServices, trg, "", catalog);
                            setIsReady(true);
                            return;
                        }
                    } catch (e) {
                        console.error("Error fetching services catalog:", e);
                    }
                }

                setSelectedServices(rawSrv);
                executeCheckoutSummary(parsedIpd, rawSrv, trg, "", []);
                setIsReady(true);
            } else {
                router.push("/hospital");
            }
        };

        initData();
    }, [router]);

    const calculateAge = (dob) => {
        if (!dob) return 0;
        const birthDate = new Date(dob);
        if (isNaN(birthDate.getTime())) return 0;
        const diff = Date.now() - birthDate.getTime();
        const ageDate = new Date(diff);
        return Math.abs(ageDate.getUTCFullYear() - 1970) || 0;
    };

    // Helper: Extract valid array of ObjectIds
    const getResolvedServiceIds = (srvList, catalogList = services) => {
        return (srvList || []).map(s => {
            if (typeof s === 'string') return s;
            if (s._id || s.serviceId) return s._id || s.serviceId;
            const match = (catalogList || []).find(c => c.serviceName?.trim().toLowerCase() === s.serviceName?.trim().toLowerCase());
            return match?._id;
        }).filter(Boolean);
    };

    // 2. Exact Stage 2 Checkout Summary API Call (POST /user/hospital/checkout-summary)
    const executeCheckoutSummary = async (activeBooking, srvList, trgLevel, codeToApply, catalogList = services) => {
        if (!activeBooking?.hospitalId || !activeBooking?.bedId) return;

        try {
            setIsFetchingSummary(true);
            setCouponError("");

            const serviceIds = getResolvedServiceIds(srvList, catalogList);

            const payload = {
                hospitalId: String(activeBooking.hospitalId),
                bedId: String(activeBooking.bedId),
                startDate: getCleanDate(activeBooking.startDate),
                endDate: getCleanDate(activeBooking.endDate),
                specialServices: serviceIds, // Array of HospitalService ObjectIds: ["65e...", "65e..."]
                couponCode: codeToApply || undefined
            };

            const res = await UserAPI.getHospitalCheckoutSummary(payload);

            if (res?.success && res.data) {
                setServerPricing(res.data);
                if (res.data.isCodAvailable === false && paymentMethod === "COD") {
                    setPaymentMethod("Online");
                }
            } else if (codeToApply) {
                setCouponError(res?.message || "Invalid coupon code");
                setAppliedCouponCode("");
            }
        } catch (error) {
            console.error("Summary fetch error:", error);
            if (codeToApply) setCouponError("Coupon validation failed");
        } finally {
            setIsFetchingSummary(false);
            setIsValidatingCoupon(false);
        }
    };

    // Re-fetch Summary on user changes
    const fetchSummary = useCallback(async (codeToApply = appliedCouponCode) => {
        if (!isReady || !booking) return;

        if (bookingType === "OPD") {
            try {
                setIsFetchingSummary(true);
                const cleanApptTime = booking.appointmentTime || booking.selectedSlot?.time || "";
                const payload = {
                    hospitalId: booking.hospital?._id || booking.hospitalId,
                    doctorId: booking.doctor?._id || booking.doctorId,
                    appointmentDate: getCleanDate(booking.appointmentDate || booking.selectedDate),
                    ...(cleanApptTime && { appointmentTime: cleanApptTime }),
                    couponCode: codeToApply || undefined
                };
                const res = await UserAPI.getOpdCheckoutSummary(payload);
                if (res?.success && res.data) {
                    setServerPricing(res.data);
                }
            } catch (err) {
                console.error("OPD summary error:", err);
            } finally {
                setIsFetchingSummary(false);
            }
        } else {
            executeCheckoutSummary(booking, selectedServices, triageLevel, codeToApply, services);
        }
    }, [isReady, booking, bookingType, selectedServices, triageLevel, appliedCouponCode, services]);

    useEffect(() => {
        if (isReady && booking) {
            fetchSummary(appliedCouponCode);
        }
    }, [isReady, selectedServices, triageLevel, appliedCouponCode, fetchSummary]);

    // Family Member Selection Handler
    const handleMemberSelect = (member) => {
        if (member === "self" || member === "add") {
            setSelectedMemberId(member);
            setPatientDetails({
                fullName: userProfile?.name || userProfile?.fullName || "",
                phoneNumber: userProfile?.phone || userProfile?.phoneNumber || "",
                dob: userProfile?.dob ? userProfile.dob.split('T')[0] : "",
                gender: userProfile?.gender || "Male",
                relation: "Self",
                address: "", city: "", pincode: "",
                haveInsurance: "No", insuranceNo: "", companyName: "",
                insuranceType: "Cashless", insuranceDocument: null, bookingReason: "", bloodGroup: ""
            });
        } else {
            setSelectedMemberId(member._id);
            let formattedDob = "";
            if (member.dob && member.dob.includes("-")) {
                const parts = member.dob.split("-");
                if (parts.length === 3) {
                    formattedDob = parts[2].length === 4 ? `${parts[2]}-${parts[1]}-${parts[0]}` : member.dob;
                }
            }

            setPatientDetails({
                fullName: member.memberName || "",
                phoneNumber: member.phone || "",
                dob: formattedDob,
                gender: member.gender || "Male",
                relation: member.relation || "Family Member",
                haveInsurance: member.hasInsurance ? "Yes" : "No",
                insuranceNo: member.insuranceNo || "",
                companyName: member.insuranceId?.provider || "",
                insuranceType: "Cashless",
                address: "", city: "", pincode: "",
                insuranceDocument: null, bookingReason: "",
                bloodGroup: member.bloodGroup || ""
            });
        }
    };

    // 3. Computed Pricing Breakdown (Doctor Visit & Triage Surcharge Removed per Doc Spec)
    const totals = useMemo(() => {
        if (serverPricing) {
            if (bookingType === "IPD") {
                // baseFee = days * pricePerDay
                const bedStayTotal = Number(serverPricing.baseFee ?? (serverPricing.pricePerDay * serverPricing.days) ?? 0);
                
                // serviceCharge = sum of verified special services
                const servicesTotal = Number(serverPricing.serviceCharge ?? 0);
                
                // discount
                const discount = Number(serverPricing.discount ?? serverPricing.appliedCoupon?.discountAmount ?? 0);
                
                // subtotal = baseFee + serviceCharge
                const subtotal = Number(serverPricing.subtotal ?? (bedStayTotal + servicesTotal));
                
                // totalPayable = subtotal - discount (No extra charges)
                const totalPayable = Number(serverPricing.totalPayable ?? Math.max(0, subtotal - discount));

                return {
                    bedStayTotal,
                    servicesTotal,
                    discount,
                    subtotal,
                    totalPayable,
                    stayDuration: Number(serverPricing.days ?? booking?.totalDays ?? 1),
                    pricePerDay: Number(serverPricing.pricePerDay ?? booking?.pricePerDay ?? 0),
                    isCodAvailable: serverPricing.isCodAvailable !== false,
                    specialServicesBreakdown: Array.isArray(serverPricing.specialServicesBreakdown) ? serverPricing.specialServicesBreakdown : []
                };
            } else {
                const doctorLiveFee = Number(booking?.doctor?.fees?.clinic || booking?.doctor?.fees?.opd || 0);
                const baseFee = Number(serverPricing.baseFee ?? doctorLiveFee);
                const premiumSlotFee = Number(serverPricing.premiumSlotFee ?? serverPricing.extraCharges ?? 0);
                const isPremiumSlot = Boolean(serverPricing.isPremiumSlot || booking?.isPremium);
                const discount = Number(serverPricing.discount ?? 0);
                const subtotal = Number(serverPricing.subtotal ?? (baseFee + premiumSlotFee));
                const totalPayable = Math.max(0, Number(serverPricing.totalPayable ?? (subtotal - discount)));

                return {
                    baseFee,
                    originalBaseFee: Number(serverPricing.originalBaseFee ?? baseFee),
                    premiumSlotFee,
                    isPremiumSlot,
                    discount,
                    subtotal,
                    totalPayable,
                    isCodAvailable: !!serverPricing.isCodAvailable,
                    specialServicesBreakdown: []
                };
            }
        }

        // Initial Dynamic Fallback
        if (bookingType === "IPD") {
            const stayDays = Number(booking?.totalDays || 1);
            const bedTotal = Number(booking?.pricePerDay || 0) * stayDays;
            const srvTotal = selectedServices.reduce((sum, s) => sum + (Number(s.price) || 0), 0);
            const combined = bedTotal + srvTotal;

            return {
                bedStayTotal: bedTotal,
                servicesTotal: srvTotal,
                discount: 0,
                subtotal: combined,
                totalPayable: combined,
                stayDuration: stayDays,
                pricePerDay: Number(booking?.pricePerDay || 0),
                isCodAvailable: true,
                specialServicesBreakdown: []
            };
        }

        const dynamicOpdBase = Number(booking?.doctor?.fees?.clinic || booking?.doctor?.fees?.opd || 0);
        return {
            baseFee: dynamicOpdBase,
            originalBaseFee: dynamicOpdBase,
            premiumSlotFee: 0,
            isPremiumSlot: false,
            discount: 0,
            subtotal: dynamicOpdBase,
            totalPayable: dynamicOpdBase,
            isCodAvailable: true,
            specialServicesBreakdown: []
        };
    }, [serverPricing, booking, bookingType, selectedServices]);

    const handleApplyCoupon = (code) => {
        const codeToApply = (code || couponCode).trim().toUpperCase();
        if (!codeToApply) return;
        setIsValidatingCoupon(true);
        setAppliedCouponCode(codeToApply);
    };

    const removeCoupon = () => {
        setAppliedCouponCode("");
        setCouponCode("");
        setCouponError("");
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPatientDetails(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setPatientDetails(prev => ({
                ...prev,
                insuranceDocument: e.target.files[0]
            }));
        }
    };

    // Shared Razorpay Flow with Strict _id vs bookingId and Parameter Mappings
    const launchRazorpay = async (orderRes, type) => {
        try {
            const isScriptLoaded = await loadRazorpayScript();
            if (!isScriptLoaded) {
                CostoumPopup("Failed to load Razorpay payment gateway.", "error", 4000);
                setIsSubmitting(false);
                return;
            }

            let keyId = 
                orderRes.key_id || 
                orderRes.keyId || 
                orderRes.key || 
                orderRes.data?.key_id || 
                orderRes.data?.keyId || 
                process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

            if (typeof keyId === 'string' && keyId.startsWith("zp_")) {
                keyId = "r" + keyId;
            }

            if (!keyId) {
                CostoumPopup("Razorpay key is missing. Please contact administration.", "error", 4000);
                setIsSubmitting(false);
                return;
            }

            const rawAmount = 
                orderRes.amount || 
                orderRes.data?.amount || 
                Math.round(totals.totalPayable * 100);

            const amountInPaise = Number(rawAmount) <= totals.totalPayable 
                ? Math.round(Number(rawAmount) * 100) 
                : Math.round(Number(rawAmount));

            const razorpayOrderId = 
                orderRes.razorpayOrderId || 
                orderRes.data?.razorpayOrderId || 
                orderRes.orderId || 
                orderRes.data?.orderId;

            // 🔍 Extract Pure MongoDB 24-char ObjectId
            const targetMongoId = 
                (orderRes.appointmentId && orderRes.appointmentId.length === 24 ? orderRes.appointmentId : null) ||
                (orderRes.data?.appointmentId && orderRes.data.appointmentId.length === 24 ? orderRes.data.appointmentId : null) ||
                (orderRes.data?._id && orderRes.data._id.length === 24 ? orderRes.data._id : null) ||
                (orderRes._id && orderRes._id.length === 24 ? orderRes._id : null) ||
                orderRes.appointmentId ||
                orderRes.data?.appointmentId ||
                orderRes.data?._id ||
                orderRes._id;

            // 🔍 Extract Custom Booking Reference (e.g. HKH-IPD-XXXX)
            const targetBookingId = 
                orderRes.bookingId || 
                orderRes.data?.bookingId || 
                "HKH-IPD-CONFIRMED";

            console.log("🔍 [CHECKOUT PAYMENT AUDIT]:", {
                mongoAppointmentId: targetMongoId,
                customBookingId: targetBookingId,
                isMongoId24Char: targetMongoId?.length === 24
            });

            // Reset verification lock
            isVerifyingRef.current = false;

            const options = {
                key: keyId,
                amount: amountInPaise,
                currency: orderRes.currency || "INR",
                name: "Health Kangaroo Hospital Network",
                description: type === "OPD"
                    ? `OPD Consultation Token #${orderRes.tokenNumber || "1"}`
                    : `Bed Admission at ${booking.hospitalName || "Hospital"}`,
                order_id: razorpayOrderId || undefined,
                prefill: {
                    name: patientDetails.fullName || "",
                    contact: patientDetails.phoneNumber || ""
                },
                theme: { color: "#08B36A" },
                modal: {
                    ondismiss: () => {
                        setIsSubmitting(false);
                        CostoumPopup("Payment window closed", "warning", 3000);
                    }
                },
                handler: async function (paymentResponse) {
                    // Prevent duplicate execution bug
                    if (isVerifyingRef.current) {
                        console.warn("⚠️ Duplicate verification callback suppressed");
                        return;
                    }
                    isVerifyingRef.current = true;

                    try {
                        setIsSubmitting(true);

                        // Extract parameters safely from response
                        const pId = paymentResponse.razorpay_payment_id || paymentResponse.paymentId || paymentResponse.razorpayPaymentId;
                        const oId = paymentResponse.razorpay_order_id || paymentResponse.orderId || paymentResponse.razorpayOrderId || razorpayOrderId;
                        const sig = paymentResponse.razorpay_signature || paymentResponse.signature || paymentResponse.razorpaySignature;

                        // Include BOTH appointmentId (Mongo _id) and bookingId, and BOTH snake_case and camelCase
                        const verificationPayload = {
                            appointmentId: String(targetMongoId), // MongoDB _id
                            bookingId: String(targetBookingId),   // Custom booking string
                            
                            // Snake_case (Strictly expected by backend controller)
                            razorpay_payment_id: pId,
                            razorpay_order_id: oId,
                            razorpay_signature: sig,

                            // CamelCase compatibility alias
                            razorpayPaymentId: pId,
                            razorpayOrderId: oId,
                            razorpaySignature: sig
                        };

                        console.log("🔐 [SUBMITTING VERIFICATION PAYLOAD]:", verificationPayload);

                        const verificationRes = await UserAPI.verifyPaymentHospital(verificationPayload);

                        console.log("📥 [VERIFICATION RESPONSE]:", verificationRes);

                        if (verificationRes?.success || verificationRes?.status === "Confirmed" || verificationRes?.data?.paymentStatus === "Paid") {
                            sessionStorage.removeItem(type === "OPD" ? "activeOpdBooking" : "activeBooking");
                            setBookingSuccessData({
                                ...orderRes,
                                ...(verificationRes.data || verificationRes),
                                bookingId: verificationRes.bookingId || verificationRes.data?.bookingId || targetBookingId,
                                status: "Confirmed",
                                paymentStatus: "Paid"
                            });
                            CostoumPopup("Online payment verified and admission confirmed!", "success", 3000);
                        } else {
                            CostoumPopup(verificationRes?.message || "Payment verification failed", "error", 4000);
                        }
                    } catch (e) {
                        console.error("Verification error:", e);
                        // If already paid in race condition, still treat as confirmed
                        if (e?.response?.data?.message?.includes("Paid") || e?.response?.data?.message?.includes("already")) {
                            sessionStorage.removeItem(type === "OPD" ? "activeOpdBooking" : "activeBooking");
                            setBookingSuccessData({
                                ...orderRes,
                                bookingId: targetBookingId,
                                status: "Confirmed",
                                paymentStatus: "Paid"
                            });
                            CostoumPopup("Payment verified successfully!", "success", 3000);
                        } else {
                            CostoumPopup(e?.response?.data?.message || "Payment verification error occurred", "error", 4000);
                        }
                    } finally {
                        setIsSubmitting(false);
                    }
                }
            };

            const rzpInstance = new window.Razorpay(options);
            rzpInstance.on('payment.failed', function (response) {
                console.error("Razorpay Payment failed:", response.error);
                CostoumPopup(response.error?.description || "Payment failed. Please try again.", "error", 4000);
                setIsSubmitting(false);
            });
            rzpInstance.open();

        } catch (err) {
            console.error("Razorpay launch trigger error:", err);
            CostoumPopup("Could not launch payment gateway. Please try again.", "error", 4000);
            setIsSubmitting(false);
        }
    };

    // 4. Final Booking Handler (POST /user/hospital/book)
    const handlePayment = async () => {
        if (!patientDetails.fullName.trim() || !patientDetails.phoneNumber.trim()) {
            CostoumPopup("Please fill in required patient name and contact number", "warning", 3000);
            return;
        }

        if (bookingType === "IPD" && patientDetails.haveInsurance === "Yes" && !patientDetails.insuranceDocument) {
            CostoumPopup("Please upload your insurance card or policy document", "warning", 3000);
            return;
        }

        setIsSubmitting(true);

        try {
            const isZeroTotal = totals.totalPayable === 0;
            const finalPaymentMethod = isZeroTotal ? "COD" : paymentMethod;

            // ========================================================
            // FLOW A: OPD CONSULTATION
            // ========================================================
            if (bookingType === "OPD") {
                const calculatedPatientAge = calculateAge(patientDetails.dob);
                const opdPayload = {
                    hospitalId: booking.hospital?._id || booking.hospitalId,
                    doctorId: booking.doctor?._id || booking.doctorId,
                    appointmentDate: getCleanDate(booking.appointmentDate || booking.selectedDate),
                    ...(booking.appointmentTime && { appointmentTime: booking.appointmentTime }),
                    paymentMethod: finalPaymentMethod,
                    patients: [
                        {
                            patientName: patientDetails.fullName.trim(),
                            ...(calculatedPatientAge > 0 && { patientAge: calculatedPatientAge }),
                            gender: patientDetails.gender,
                            ...(patientDetails.bookingReason && { reasonForVisit: patientDetails.bookingReason.trim() })
                        }
                    ],
                    couponCode: appliedCouponCode || undefined
                };

                const res = await UserAPI.bookOpdAppointment(opdPayload);

                if (!res?.success) {
                    CostoumPopup(res?.message || "Failed to book OPD consultation", "error", 4000);
                    setIsSubmitting(false);
                    return;
                }

                if (finalPaymentMethod === "Online" && !isZeroTotal) {
                    await launchRazorpay(res, "OPD");
                    return;
                }

                sessionStorage.removeItem("activeOpdBooking");
                setBookingSuccessData({
                    ...res,
                    status: "Hospital-Pending"
                });
                setIsSubmitting(false);
                return;
            }

            // ========================================================
            // FLOW B: IPD BED ADMISSION (Strictly Section B Specification)
            // ========================================================
            const fd = new FormData();
            
            // 1. Mandatory Required Keys
            fd.append("hospitalId", String(booking.hospitalId));
            fd.append("bedId", String(booking.bedId));
            fd.append("startDate", getCleanDate(booking.startDate));
            fd.append("endDate", getCleanDate(booking.endDate));
            fd.append("bookingType", "Admission");
            fd.append("paymentMethod", finalPaymentMethod);
            fd.append("bookingReason", patientDetails.bookingReason?.trim() || "General Bed Admission");

            // 2. Special Services: Strictly ObjectIds JSON string per Section B Doc:
            // specialServices: '["65e8889900aabbccddeeff01", "65e8889900aabbccddeeff02"]'
            const resolvedIds = getResolvedServiceIds(selectedServices, services);
            if (resolvedIds.length > 0) {
                fd.append("specialServices", JSON.stringify(resolvedIds));
            }

            // 3. Optional Doctor ID
            if (selectedDoctor?._id) {
                fd.append("doctorId", String(selectedDoctor._id));
            }

            // 4. Coupon Code
            if (appliedCouponCode) {
                fd.append("couponCode", appliedCouponCode);
            }

            // 5. Patients Array (JSON Stringified)
            const calculatedPatientAge = calculateAge(patientDetails.dob);
            const patientArray = [{
                patientName: patientDetails.fullName.trim(),
                patientAge: calculatedPatientAge > 0 ? calculatedPatientAge : 30,
                gender: patientDetails.gender || "Male",
                relation: selectedMemberId === "self" ? "Self" : (patientDetails.relation || "Family Member"),
                ...(patientDetails.bloodGroup && { bloodGroup: patientDetails.bloodGroup })
            }];
            fd.append("patients", JSON.stringify(patientArray));

            // 6. Pricing Snapshot
            const pricingSnapshot = {
                baseFee: totals.bedStayTotal,
                extraCharges: totals.servicesTotal,
                discountAmount: totals.discount,
                subtotal: totals.subtotal,
                totalPayable: totals.totalPayable
            };
            fd.append("pricing", JSON.stringify(pricingSnapshot));

            // 7. Insurance Details & File Upload (Only if File instance)
            const hasInsurance = patientDetails.haveInsurance === "Yes";
            if (hasInsurance) {
                fd.append("hasInsurance", "true");
                fd.append("insuranceNumber", patientDetails.insuranceNo?.trim() || "");
                fd.append("companyName", patientDetails.companyName?.trim() || "");
                fd.append("insuranceType", patientDetails.insuranceType || "Cashless");

                if (patientDetails.insuranceDocument instanceof File) {
                    fd.append("insuranceDocument", patientDetails.insuranceDocument);
                }
            } else {
                fd.append("hasInsurance", "false");
            }

            // Execute API Call
            const res = await UserAPI.bookHospitalBed(fd);

            if (!res?.success) {
                CostoumPopup(res?.message || "Failed to initiate hospital admission", "error", 4000);
                setIsSubmitting(false);
                return;
            }

            // Path B: Counter / COD Payment
            const isOnline = Boolean(res.isOnlinePayment ?? (finalPaymentMethod === "Online" && !isZeroTotal));
            if (!isOnline) {
                sessionStorage.removeItem("activeBooking");
                setBookingSuccessData(res.data || { 
                    bookingId: res.bookingId || res.data?.bookingId,
                    status: res.status || "Hospital-Pending",
                    paymentStatus: "Pending at Admission Desk",
                    bedNumber: res.bedNumber || booking.bedNumber,
                    wardName: res.wardName || booking.wardName,
                    totalPayable: totals.totalPayable,
                    specialServicesIncluded: res.specialServicesIncluded || []
                });
                setIsSubmitting(false);
                return;
            }

            // Path A: Online Razorpay
            await launchRazorpay(res, "IPD");

        } catch (error) {
            console.error("Booking submission error:", error);
            CostoumPopup(error?.response?.data?.message || "An error occurred during booking. Please check details.", "error", 4000);
            setIsSubmitting(false);
        }
    };

    if (!booking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <FaSpinner className="w-8 h-8 text-emerald-500 animate-spin" />
            </div>
        );
    }

    const cabinRoomLabel = booking.doctor?.department?.roomNumber 
        ? `Cabin ${booking.doctor.department.roomNumber}`
        : booking.doctor?.opdRoomNumber 
        ? `Cabin ${booking.doctor.opdRoomNumber}`
        : "Consultation Cabin";

    const currentPatientAge = calculateAge(patientDetails.dob);

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20 font-sans antialiased text-slate-900">
            {/* HEADER */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
                    <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-600 font-bold text-xs uppercase tracking-widest hover:text-emerald-600 cursor-pointer">
                        <FaArrowLeft /> Back
                    </button>
                    <div className="text-center">
                        <h1 className="text-sm md:text-base font-black text-slate-900 tracking-tight uppercase">
                            {bookingType === "OPD" ? "OPD Doctor Consultation Checkout" : "Hospital Inpatient Admission Checkout"}
                        </h1>
                        <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">
                            {bookingType === "OPD" ? "Token Generation Desk" : "IPD Ward Stay & Facilities"}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-600 font-black text-xs uppercase tracking-widest">
                        <FaShieldAlt /> Secure Checkout
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 md:px-6 mt-6 md:mt-8">
                <div className="grid lg:grid-cols-12 gap-8 items-start">

                    {/* LEFT COLUMN */}
                    <div className="lg:col-span-8 space-y-6">

                        {/* SECTION 1: OVERVIEW CARD */}
                        <section className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200/80">
                            <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                                <span className="w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-[10px]">01</span>
                                {bookingType === "OPD" ? "OPD Consultation Details" : "Admission & Accommodation Overview"}
                            </h2>

                            {bookingType === "OPD" ? (
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
                                        <div className="flex items-center gap-2 mb-1.5 text-slate-400">
                                            <FaUserMd size={13} />
                                            <span className="text-[10px] font-black uppercase tracking-wider">Doctor</span>
                                        </div>
                                        <p className="font-bold text-slate-900 text-sm leading-tight">Dr. {booking.doctor?.name || "Consultant"}</p>
                                        <p className="text-emerald-600 text-xs font-bold mt-0.5">{booking.doctor?.speciality || ""}</p>
                                    </div>

                                    <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100">
                                        <div className="flex items-center gap-2 mb-1.5 text-emerald-600">
                                            <FaDoorOpen size={13} />
                                            <span className="text-[10px] font-black uppercase tracking-wider">Location</span>
                                        </div>
                                        <p className="font-bold text-emerald-900 text-sm leading-tight">
                                            {cabinRoomLabel}
                                        </p>
                                    </div>

                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
                                        <div className="flex items-center gap-2 mb-1.5 text-slate-400">
                                            <FaClock size={13} />
                                            <span className="text-[10px] font-black uppercase tracking-wider">Allotted Slot</span>
                                        </div>
                                        <p className="font-bold text-slate-900 text-sm leading-tight">
                                            {getCleanDate(booking.appointmentDate || booking.selectedDate)} {booking.appointmentTime ? `• ${booking.appointmentTime}` : ""}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
                                            <div className="flex items-center gap-2 mb-1.5 text-slate-400">
                                                <FaHospital size={13} />
                                                <span className="text-[10px] font-black uppercase tracking-wider">Hospital</span>
                                            </div>
                                            <p className="font-bold text-slate-900 text-sm leading-tight">{booking.hospitalName || "Hospital Facility"}</p>
                                        </div>

                                        <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100">
                                            <div className="flex items-center gap-2 mb-1.5 text-emerald-600">
                                                <FaProcedures size={13} />
                                                <span className="text-[10px] font-black uppercase tracking-wider">Ward &amp; Bed</span>
                                            </div>
                                            <p className="font-bold text-emerald-900 text-sm leading-tight">
                                                {booking.wardName} &bull; Bed #{booking.bedNumber}
                                            </p>
                                            <p className="text-[10px] font-bold text-emerald-700 mt-0.5">
                                                ₹{booking.pricePerDay}/Day &times; {totals.stayDuration} Days
                                            </p>
                                        </div>

                                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
                                            <div className="flex items-center gap-2 mb-1.5 text-slate-400">
                                                <FaCalendarDay size={13} />
                                                <span className="text-[10px] font-black uppercase tracking-wider">Duration Dates</span>
                                            </div>
                                            <p className="font-bold text-slate-900 text-xs leading-tight">
                                                {getCleanDate(booking.startDate)} &rarr; {getCleanDate(booking.endDate)}
                                            </p>
                                            <span className="text-[10px] font-black uppercase text-emerald-600 block mt-1">
                                                {totals.stayDuration} Days Total Stay
                                            </span>
                                        </div>
                                    </div>

                                    {/* Attending Specialist & Add-on Services Preview */}
                                    {(selectedDoctor || selectedServices.length > 0) && (
                                        <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                            {selectedDoctor && (
                                                <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50/50 border border-blue-100">
                                                    <div className="flex items-center gap-2">
                                                        <FaUserMd className="text-blue-600" />
                                                        <div>
                                                            <p className="font-bold text-slate-900">Dr. {selectedDoctor.name}</p>
                                                            <p className="text-[10px] text-slate-500">{selectedDoctor.speciality || "Attending Specialist"}</p>
                                                        </div>
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                                        Assigned
                                                    </span>
                                                </div>
                                            )}

                                            {selectedServices.length > 0 && (
                                                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
                                                    <span className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1">
                                                        <FaConciergeBell /> Special Add-on Services ({selectedServices.length})
                                                    </span>
                                                    <p className="font-bold text-slate-800 truncate">
                                                        {selectedServices.map(s => s.serviceName).join(", ")}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </section>

                        {/* SECTION 2: PATIENT & INSURANCE INFORMATION */}
                        <section className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200/80">
                            <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                                <span className="w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-[10px]">02</span>
                                Patient &amp; Case Demographics
                            </h2>

                            {/* Family Selector */}
                            <div className="flex gap-4 overflow-x-auto pb-4 mb-4">
                                <div onClick={() => handleMemberSelect("self")} className="shrink-0 cursor-pointer flex flex-col items-center gap-2">
                                    <div className={`w-14 h-14 rounded-full border-2 flex items-center justify-center bg-slate-50 transition-all ${selectedMemberId === "self" ? "border-emerald-600 bg-emerald-50" : "border-slate-200"}`}>
                                        <FaUser className={selectedMemberId === "self" ? "text-emerald-600 text-base" : "text-slate-300 text-base"} />
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-600">Self</span>
                                </div>

                                {familyMembers.map((member) => (
                                    <div key={member._id} onClick={() => handleMemberSelect(member)} className="shrink-0 cursor-pointer flex flex-col items-center gap-2">
                                        <div className={`w-14 h-14 rounded-full border-2 overflow-hidden bg-slate-50 transition-all ${selectedMemberId === member._id ? "border-emerald-600 ring-2 ring-emerald-500/20" : "border-slate-200"}`}>
                                            {member.profilePic ? (
                                                <img src={member.profilePic} className="w-full h-full object-cover" alt="Patient" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center font-black text-slate-400 text-xs">{member.memberName?.charAt(0)}</div>
                                            )}
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-600 max-w-[60px] truncate">{member.memberName}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Patient Full Name *</label>
                                    <input type="text" name="fullName" value={patientDetails.fullName} onChange={handleInputChange} placeholder="Enter patient full name" className="w-full bg-slate-50 px-4 py-3.5 rounded-xl border border-slate-200 outline-none font-bold text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500/20" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Date of Birth</label>
                                    <input type="date" name="dob" value={patientDetails.dob} onChange={handleInputChange} className="w-full bg-slate-50 px-4 py-3.5 rounded-xl border border-slate-200 outline-none font-bold text-xs text-slate-800" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Contact Phone Number *</label>
                                    <input type="tel" name="phoneNumber" value={patientDetails.phoneNumber} onChange={handleInputChange} placeholder="10-digit mobile number" className="w-full bg-slate-50 px-4 py-3.5 rounded-xl border border-slate-200 outline-none font-bold text-xs text-slate-800" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Gender</label>
                                    <div className="flex gap-3">
                                        {["Male", "Female", "Other"].map((g) => (
                                            <button key={g} type="button" onClick={() => setPatientDetails({ ...patientDetails, gender: g })} className={`flex-1 py-3 rounded-xl border font-black text-xs transition-all cursor-pointer ${patientDetails.gender === g ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-500"}`}>{g}</button>
                                        ))}
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Primary Reason for Visit / Symptoms</label>
                                    <input type="text" name="bookingReason" value={patientDetails.bookingReason} onChange={handleInputChange} placeholder="e.g. Clinical checkup / Symptoms" className="w-full bg-slate-50 px-4 py-3.5 rounded-xl border border-slate-200 outline-none font-bold text-xs text-slate-800" />
                                </div>

                                {/* Health Insurance */}
                                {bookingType === "IPD" && (
                                    <>
                                        <div className="md:col-span-2 pt-3 border-t border-slate-100">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Do you wish to claim Health Insurance?</label>
                                            <div className="flex gap-6">
                                                {["Yes", "No"].map((opt) => (
                                                    <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                                        <input type="radio" checked={patientDetails.haveInsurance === opt} onChange={() => setPatientDetails({ ...patientDetails, haveInsurance: opt })} className="accent-emerald-600 w-4 h-4 cursor-pointer" />
                                                        <span className="text-xs font-bold text-slate-700 uppercase">{opt}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        {patientDetails.haveInsurance === "Yes" && (
                                            <div className="md:col-span-2 bg-emerald-50/40 p-5 rounded-2xl border border-emerald-200/60 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Insurance / Policy Number *</label>
                                                    <input type="text" name="insuranceNo" value={patientDetails.insuranceNo} onChange={handleInputChange} placeholder="Policy / Card number" className="w-full bg-white px-4 py-3 rounded-xl border border-emerald-200 outline-none font-bold text-xs" />
                                                </div>

                                                <div>
                                                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Insurance Provider / TPA Name *</label>
                                                    <input type="text" name="companyName" value={patientDetails.companyName} onChange={handleInputChange} placeholder="Provider Name" className="w-full bg-white px-4 py-3 rounded-xl border border-emerald-200 outline-none font-bold text-xs" />
                                                </div>

                                                <div className="sm:col-span-2">
                                                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Insurance Document / TPA Card *</label>
                                                    <div className="border-2 border-dashed border-emerald-300 rounded-xl p-4 bg-white text-center cursor-pointer relative hover:bg-emerald-50/30 transition-colors">
                                                        <input type="file" onChange={handleFileChange} accept="image/*,application/pdf" className="absolute inset-0 opacity-0 cursor-pointer" />
                                                        <div className="flex flex-col items-center justify-center gap-1.5">
                                                            <FaUpload className="text-emerald-600" />
                                                            <span className="text-xs font-bold text-slate-700">
                                                                {patientDetails.insuranceDocument ? patientDetails.insuranceDocument.name : "Upload Policy PDF or Card Photo *"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </section>

                        {/* SECTION 3: PAYMENT METHOD SELECTOR */}
                        {totals.totalPayable > 0 && (
                            <section className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200/80">
                                <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] mb-4 flex items-center gap-3">
                                    <span className="w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-[10px]">03</span>
                                    Payment Method
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        disabled={!totals.isCodAvailable}
                                        onClick={() => setPaymentMethod("COD")}
                                        className={`p-4 rounded-2xl border transition-all text-left flex items-center justify-between relative cursor-pointer
                                            ${!totals.isCodAvailable ? 'opacity-40 cursor-not-allowed bg-slate-50 border-slate-200' : ''}
                                            ${paymentMethod === "COD" ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20' : 'bg-white border-slate-200'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 bg-slate-100 text-slate-700 rounded-xl">
                                                <FaMoneyBillWave size={16} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-slate-900">
                                                    {bookingType === "OPD" ? "Pay at OPD Desk (COD)" : "Pay at Hospital Counter (COD)"}
                                                </p>
                                                <p className="text-[10px] text-slate-500 mt-0.5">
                                                    {totals.isCodAvailable ? "Pay deposit at admission desk" : "Counter collection disabled"}
                                                </p>
                                            </div>
                                        </div>
                                        {paymentMethod === "COD" && <FaCheckCircle className="text-emerald-600" size={16} />}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod("Online")}
                                        className={`p-4 rounded-2xl border transition-all text-left flex items-center justify-between cursor-pointer
                                            ${paymentMethod === "Online" ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20' : 'bg-white border-slate-200'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl">
                                                <FaCreditCard size={16} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-slate-900">Pay Online (Razorpay)</p>
                                                <p className="text-[10px] text-slate-500 mt-0.5">UPI, Cards, Instant Confirmation</p>
                                            </div>
                                        </div>
                                        {paymentMethod === "Online" && <FaCheckCircle className="text-emerald-600" size={16} />}
                                    </button>
                                </div>
                            </section>
                        )}
                    </div>

                    {/* RIGHT COLUMN: ITEMIZED BILL BREAKDOWN */}
                    <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
                        
                        {/* Coupon Box */}
                        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                            <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                <FaTag className="text-emerald-500" /> Apply Hospital Coupon
                            </h2>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="COUPON CODE"
                                    value={couponCode}
                                    onChange={(e) => {
                                        setCouponCode(e.target.value.toUpperCase());
                                        if (couponError) setCouponError("");
                                    }}
                                    className="flex-1 bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 outline-none font-bold text-xs uppercase focus:ring-2 focus:ring-emerald-500/20"
                                />
                                <button
                                    disabled={isValidatingCoupon || (!couponCode && !appliedCouponCode)}
                                    onClick={() => appliedCouponCode ? removeCoupon() : handleApplyCoupon()}
                                    className={`px-4 rounded-xl text-[10px] font-black uppercase transition-all cursor-pointer
                                        ${appliedCouponCode ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                                >
                                    {isValidatingCoupon ? <FaSpinner className="animate-spin" /> : appliedCouponCode ? 'Remove' : 'Apply'}
                                </button>
                            </div>
                            {couponError && <p className="text-[10px] font-bold text-rose-500">{couponError}</p>}
                        </div>

                        {/* Complete Itemized Billing Breakdown */}
                        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                            <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                <FaReceipt className="text-slate-400" />
                                {bookingType === "OPD" ? "OPD Consultation Bill" : "Inpatient Itemized Bill"}
                            </h2>
                            
                            <div className="space-y-3 text-xs">
                                
                                {bookingType === "IPD" ? (
                                    <>
                                        {/* Bed Stay Charges (baseFee = days * pricePerDay) */}
                                        <div className="flex justify-between items-center text-slate-600">
                                            <span>Ward Bed Stay ({totals.stayDuration} Days)</span>
                                            <span className="font-black text-slate-900">₹{totals.bedStayTotal}</span>
                                        </div>

                                        {/* Special Add-on Services Breakdown */}
                                        {totals.servicesTotal > 0 && (
                                            <div className="space-y-1.5 pt-1 border-t border-slate-100">
                                                <div className="flex justify-between items-center text-slate-700 font-bold">
                                                    <span>Special Services</span>
                                                    <span className="font-black text-slate-900">+₹{totals.servicesTotal}</span>
                                                </div>

                                                {totals.specialServicesBreakdown.length > 0 ? (
                                                    totals.specialServicesBreakdown.map((srv, idx) => (
                                                        <div key={srv.serviceId || idx} className="flex justify-between text-[11px] text-slate-500 pl-3">
                                                            <span>&bull; {srv.serviceName}</span>
                                                            <span className="font-semibold">₹{srv.price}</span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    selectedServices.map((srv, idx) => (
                                                        <div key={srv._id || idx} className="flex justify-between text-[11px] text-slate-500 pl-3">
                                                            <span>&bull; {srv.serviceName}</span>
                                                            <span className="font-semibold">₹{srv.price}</span>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        {/* OPD Doctor Consultation */}
                                        <div className="flex justify-between items-center text-slate-600">
                                            <span>Doctor Consultation Fee</span>
                                            <span className="font-black text-slate-900">₹{totals.baseFee}</span>
                                        </div>

                                        {totals.isPremiumSlot && totals.premiumSlotFee > 0 && (
                                            <div className="flex justify-between items-center text-amber-800 font-bold bg-amber-50 p-2.5 rounded-xl border border-amber-200/80">
                                                <span className="flex items-center gap-1.5">
                                                    <FaCrown className="text-amber-500 text-xs" />
                                                    <span>Peak Hours Premium Slot</span>
                                                </span>
                                                <span className="font-black text-amber-900">+₹{totals.premiumSlotFee}</span>
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* Coupon Discount */}
                                {totals.discount > 0 && (
                                    <div className="flex justify-between items-center text-emerald-600 font-bold">
                                        <span>Hospital Coupon Discount</span>
                                        <span>-₹{totals.discount}</span>
                                    </div>
                                )}

                                <div className="h-px bg-slate-100 my-2" />

                                {/* Total Payable */}
                                <div className="flex justify-between items-end">
                                    <div>
                                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Total Payable</span>
                                        <span className="text-[10px] text-slate-400 font-medium">All clinical taxes included</span>
                                    </div>
                                    <span className="text-3xl font-black text-slate-900">
                                        ₹{Math.round(totals.totalPayable)}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={handlePayment}
                                disabled={isSubmitting || isFetchingSummary}
                                className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer
                                    ${(!isSubmitting && !isFetchingSummary)
                                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 active:scale-95'
                                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                            >
                                {isSubmitting || isFetchingSummary ? (
                                    <FaSpinner className="animate-spin" size={14} />
                                ) : bookingType === "OPD" ? (
                                    paymentMethod === "COD" ? (
                                        <>Issue Token &amp; Pay at OPD Desk <FaCheckCircle size={12} /></>
                                    ) : (
                                        <>Pay Online ₹{Math.round(totals.totalPayable)} &amp; Issue Token <FaLock size={10} /></>
                                    )
                                ) : paymentMethod === "COD" ? (
                                    <>Reserve Bed &amp; Pay at Hospital Counter <FaHospital size={12} /></>
                                ) : (
                                    <>Pay Online ₹{Math.round(totals.totalPayable)} &amp; Confirm Bed <FaLock size={10} /></>
                                )}
                            </button>
                        </div>
                    </div>

                </div>
            </main>

            {/* CONFIRMATION SUCCESS MODAL */}
            {bookingSuccessData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 max-w-lg w-full border border-slate-150 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
                        
                        <div className="flex flex-col items-center text-center space-y-2 pb-2">
                            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100">
                                <FaCheckCircle className="w-9 h-9" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                                {bookingType === "OPD" ? `Token #${bookingSuccessData.tokenNumber || "1"} Generated!` : "Admission Confirmed!"}
                            </h3>
                            <p className="text-xs font-semibold text-slate-400">
                                {bookingType === "OPD"
                                    ? paymentMethod === "COD"
                                        ? "Token registered! Please pay at the hospital reception desk to activate."
                                        : "Payment verified. Your consultation token is confirmed!"
                                    : paymentMethod === "COD"
                                        ? "Bed reserved! Please submit your deposit at the hospital admission desk."
                                        : "Payment verified! Bed is locked and confirmed for admission."}
                            </p>
                            {bookingSuccessData.bookingId && (
                                <span className="inline-block bg-slate-900 text-[#08B36A] px-3.5 py-1 rounded-xl text-xs font-black uppercase tracking-wider font-mono">
                                    #{bookingSuccessData.bookingId}
                                </span>
                            )}
                        </div>

                        <div className="space-y-4 overflow-y-auto py-3 text-xs pr-1">
                            {/* Patient Info Card */}
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70 space-y-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block flex items-center gap-1.5">
                                    <FaUser className="text-[#08B36A]" /> Patient Profile
                                </span>
                                <div className="grid grid-cols-2 gap-y-1.5 text-xs">
                                    <div className="text-slate-500 font-semibold">Full Name:</div>
                                    <div className="text-right font-black text-slate-800">{patientDetails.fullName}</div>

                                    <div className="text-slate-500 font-semibold">Contact Phone:</div>
                                    <div className="text-right font-bold text-slate-800">{patientDetails.phoneNumber}</div>

                                    {currentPatientAge > 0 && (
                                        <>
                                            <div className="text-slate-500 font-semibold">Age:</div>
                                            <div className="text-right font-bold text-slate-800">{currentPatientAge} Yrs</div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Booking Info Card */}
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70 space-y-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block flex items-center gap-1.5">
                                    <FaHospital className="text-blue-500" /> Stay Allocation Info
                                </span>
                                <div className="grid grid-cols-2 gap-y-1.5 text-xs">
                                    <div className="text-slate-500 font-semibold">Facility:</div>
                                    <div className="text-right font-black text-slate-800">{booking.hospitalName}</div>

                                    {bookingType === "IPD" ? (
                                        <>
                                            <div className="text-slate-500 font-semibold">Ward &amp; Bed:</div>
                                            <div className="text-right font-bold text-emerald-600">{bookingSuccessData.wardName || booking.wardName} - {bookingSuccessData.bedNumber || `Bed #${booking.bedNumber}`}</div>

                                            <div className="text-slate-500 font-semibold">Stay Duration:</div>
                                            <div className="text-right font-bold text-slate-800">{totals.stayDuration} Days</div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="text-slate-500 font-semibold">Doctor:</div>
                                            <div className="text-right font-bold text-emerald-600">Dr. {booking.doctor?.name} ({cabinRoomLabel})</div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Settlement Card */}
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70 space-y-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block flex items-center gap-1.5">
                                    <FaReceipt className="text-emerald-500" /> Settlement Summary
                                </span>
                                <div className="grid grid-cols-2 gap-y-1.5 text-xs">
                                    <div className="text-slate-500 font-semibold">Payment Method:</div>
                                    <div className="text-right font-black uppercase text-slate-800">
                                        {paymentMethod === "COD" ? "Pay at Hospital Counter" : "Online Razorpay"}
                                    </div>

                                    <div className="text-slate-500 font-semibold">Admission Status:</div>
                                    <div className="text-right font-bold uppercase text-emerald-600">
                                        {bookingSuccessData.status || (paymentMethod === "COD" ? "Hospital-Pending" : "Confirmed")}
                                    </div>

                                    <div className="text-slate-900 font-black text-sm pt-2 border-t border-slate-200">Total Payable:</div>
                                    <div className="text-right font-black text-[#08B36A] text-base pt-2 border-t border-slate-200">
                                        ₹{Math.round(totals.totalPayable)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Action Buttons */}
                        <div className="pt-3 border-t border-slate-100 flex gap-3 shrink-0">
                            <button
                                onClick={() => {
                                    setBookingSuccessData(null);
                                    router.push('/userscreens/hospitalappointment');
                                }}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/20 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                            >
                                <FaCheckCircle size={12} /> View My Bookings
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}