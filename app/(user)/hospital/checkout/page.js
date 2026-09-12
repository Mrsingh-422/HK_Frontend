'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    FaArrowLeft, FaHospital, FaProcedures,
    FaShieldAlt, FaCheck, FaTimes, FaTag, FaReceipt,
    FaUser, FaPhone, FaCalendarDay, FaVenusMars, FaCreditCard,
    FaMapMarkerAlt, FaGlobe, FaPlus, FaUpload, FaUserMd, FaStethoscope,
    FaSpinner, FaGem, FaMoneyBillWave, FaLock, FaCheckCircle
} from "react-icons/fa";
import toast from "react-hot-toast";
import UserAPI from "@/app/services/UserAPI";
import CostoumPopup from "@/lib/CostoumPopup";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

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

export default function HospitalCheckoutPage() {
    const router = useRouter();
    const [booking, setBooking] = useState(null);

    // API Data States
    const [doctors, setDoctors] = useState([]);
    const [services, setServices] = useState([]);
    const [coupons, setCoupons] = useState([]);
    const [familyMembers, setFamilyMembers] = useState([]);

    // Selection States
    const [selectedMemberId, setSelectedMemberId] = useState("self");
    const [selectedDoctorId, setSelectedDoctorId] = useState(null);
    const [selectedServiceIds, setSelectedServiceIds] = useState([]);
    const [bedBookingType, setBedBookingType] = useState("General-Bed");

    // Patient & Insurance Details
    const [patientDetails, setPatientDetails] = useState({
        fullName: "",
        dob: "",
        phoneNumber: "",
        gender: "Male",
        address: "",
        city: "",
        pincode: "",
        haveInsurance: "No",
        insuranceNo: "",
        companyName: "",
        insuranceDocument: null,
        bookingReason: ""
    });

    // Payment & COD States
    const [paymentMethod, setPaymentMethod] = useState("Online"); // 'Online' | 'COD'
    const [couponCode, setCouponCode] = useState("");
    const [appliedCouponCode, setAppliedCouponCode] = useState("");
    const [couponError, setCouponError] = useState("");
    const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

    // Server-side Checkout Summary State (Endpoint 2.1)
    const [serverPricing, setServerPricing] = useState(null);
    const [isFetchingSummary, setIsFetchingSummary] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [bookingSuccessData, setBookingSuccessData] = useState(null);

    // 1. Initialize Booking Data from Session
    useEffect(() => {
        const token = localStorage.getItem('userToken');
        if (!token) {
            CostoumPopup("Please Login To Continue", "warning", 4000);
            router.push('/hospital');
            return;
        }

        const savedData = sessionStorage.getItem("activeBooking");
        if (!savedData) {
            router.push("/hospital");
        } else {
            const parsedBooking = JSON.parse(savedData);
            setBooking(parsedBooking);
            fetchHospitalData(parsedBooking.hospitalId);
            fetchFamilyData();
        }
    }, [router]);

    // 2. Fetch Hospital Metadata
    const fetchHospitalData = async (hospitalId) => {
        try {
            const [docRes, serviceRes, couponRes] = await Promise.all([
                UserAPI.getHospitalDoctors(hospitalId),
                UserAPI.getHospitalServices(hospitalId),
                UserAPI.getHospitalCoupons(hospitalId)
            ]);

            if (docRes?.success) setDoctors(docRes.data || []);
            if (serviceRes?.success) setServices(serviceRes.data || []);
            if (couponRes?.success) setCoupons(couponRes.data || []);
        } catch (error) {
            console.error("Error fetching hospital metadata:", error);
        }
    };

    const fetchFamilyData = async () => {
        try {
            const res = await UserAPI.getFamilyMembers();
            if (res?.success) setFamilyMembers(res.data || []);
        } catch (error) {
            console.error("Error fetching family members:", error);
        }
    };

    const calculateAge = (dob) => {
        if (!dob) return 25;
        const birthDate = new Date(dob);
        const diff = Date.now() - birthDate.getTime();
        const ageDate = new Date(diff);
        return Math.abs(ageDate.getUTCFullYear() - 1970) || 25;
    };

    // 3. Fetch Server-Side Summary (POST /user/hospital/checkout-summary)
    const fetchSummary = useCallback(async (codeToApply = appliedCouponCode) => {
        if (!booking?.hospitalId || !booking?.bedId) return;

        try {
            setIsFetchingSummary(true);
            setCouponError("");

            const payload = {
                hospitalId: booking.hospitalId,
                bedId: booking.bedId,
                startDate: booking.startDate,
                endDate: booking.endDate,
                couponCode: codeToApply || undefined,
                patients: [{
                    patientName: patientDetails.fullName || "Patient",
                    patientAge: calculateAge(patientDetails.dob),
                    gender: patientDetails.gender || "Male",
                    relation: selectedMemberId === "self" ? "Self" : "Family Member"
                }]
            };

            const res = await UserAPI.getHospitalCheckoutSummary(payload);
            if (res?.success && res.data) {
                setServerPricing(res.data);
                // If COD is disabled globally and user is not subscribed, switch to Online
                if (!res.data.isCodAvailable && paymentMethod === "COD") {
                    setPaymentMethod("Online");
                }
            } else {
                if (codeToApply) {
                    setCouponError(res?.message || "Invalid Coupon");
                    setAppliedCouponCode("");
                }
            }
        } catch (error) {
            console.error("Pricing summary fetch error:", error);
            if (codeToApply) setCouponError("Coupon validation failed");
        } finally {
            setIsFetchingSummary(false);
            setIsValidatingCoupon(false);
        }
    }, [booking, patientDetails.fullName, patientDetails.dob, patientDetails.gender, selectedMemberId, appliedCouponCode, paymentMethod]);

    useEffect(() => {
        if (booking) {
            fetchSummary(appliedCouponCode);
        }
    }, [booking, fetchSummary, appliedCouponCode]);

    // Handle Family Member Selection
    const handleMemberSelect = (member) => {
        if (member === "self" || member === "add") {
            setSelectedMemberId(member);
            setPatientDetails({
                fullName: "", dob: "", phoneNumber: "", gender: "Male",
                address: "", city: "", pincode: "",
                haveInsurance: "No", insuranceNo: "", companyName: "",
                insuranceDocument: null, bookingReason: ""
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
                haveInsurance: member.hasInsurance ? "Yes" : "No",
                insuranceNo: member.insuranceNo || "",
                companyName: member.insuranceId?.provider || "",
                address: "",
                city: "",
                pincode: "",
                insuranceDocument: null,
                bookingReason: ""
            });
        }
    };

    // 4. Computed Pricing Breakdown
    const totals = useMemo(() => {
        const selectedServices = services.filter(s => selectedServiceIds.includes(s._id));
        const servicesTotal = selectedServices.reduce((sum, s) => sum + s.price, 0);

        if (serverPricing) {
            const baseFee = serverPricing.baseFee ?? 0;
            const discount = serverPricing.discount ?? 0;
            const subtotal = serverPricing.subtotal ?? baseFee;
            const totalPayable = Math.max(0, (serverPricing.totalPayable ?? (subtotal - discount)) + servicesTotal);

            return {
                baseFee,
                originalBaseFee: serverPricing.originalBaseFee ?? baseFee,
                servicesTotal,
                discount,
                subtotal: subtotal + servicesTotal,
                totalPayable,
                stayDuration: serverPricing.stayDuration ?? 1,
                isCodAvailable: !!serverPricing.isCodAvailable,
                isSubscriptionApplied: !!serverPricing.subscriptionDetails?.isSubscriptionApplied,
                planName: serverPricing.subscriptionDetails?.planName || "",
                selectedServices
            };
        }

        const fallbackBase = booking?.totalPrice || 0;
        return {
            baseFee: fallbackBase,
            originalBaseFee: fallbackBase,
            servicesTotal,
            discount: 0,
            subtotal: fallbackBase + servicesTotal,
            totalPayable: fallbackBase + servicesTotal,
            stayDuration: 1,
            isCodAvailable: true,
            isSubscriptionApplied: false,
            planName: "",
            selectedServices
        };
    }, [serverPricing, services, selectedServiceIds, booking]);

    // Coupon Actions
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

    const toggleService = (serviceId) => {
        setSelectedServiceIds(prev =>
            prev.includes(serviceId) ? prev.filter(id => id !== serviceId) : [...prev, serviceId]
        );
    };

    const toggleDoctor = (doctorId) => {
        setSelectedDoctorId(prev => (prev === doctorId ? null : doctorId));
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

    // 5. Final Hospital Admission Booking Handler (Endpoint 2.2 + 7.0 Payment Verify)
    const handlePayment = async () => {
        if (!patientDetails.fullName || !patientDetails.phoneNumber) {
            CostoumPopup("Please fill in required patient name and contact number", "warning", 3000);
            return;
        }

        if (patientDetails.haveInsurance === "Yes" && !patientDetails.insuranceDocument) {
            CostoumPopup("Please upload your insurance document", "warning", 3000);
            return;
        }

        setIsSubmitting(true);

        try {
            const isZeroTotal = totals.totalPayable === 0;
            const finalPaymentMethod = isZeroTotal ? "COD" : paymentMethod;

            const fd = new FormData();
            fd.append("hospitalId", booking.hospitalId);
            fd.append("bedId", booking.bedId);
            if (selectedDoctorId) fd.append("doctorId", selectedDoctorId);
            fd.append("startDate", booking.startDate);
            fd.append("endDate", booking.endDate);
            fd.append("hasInsurance", String(patientDetails.haveInsurance === "Yes"));
            fd.append("bookingReason", patientDetails.bookingReason || "Hospital Admission");
            fd.append("paymentMethod", finalPaymentMethod);

            if (appliedCouponCode) {
                fd.append("couponCode", appliedCouponCode);
            }

            const patientArray = [{
                patientName: patientDetails.fullName,
                patientAge: calculateAge(patientDetails.dob),
                gender: patientDetails.gender || "Male",
                relation: selectedMemberId === "self" ? "Self" : "Family Member"
            }];
            fd.append("patients", JSON.stringify(patientArray));

            if (patientDetails.haveInsurance === "Yes" && patientDetails.insuranceDocument) {
                fd.append("insuranceDocument", patientDetails.insuranceDocument);
            }

            const res = await UserAPI.bookHospitalBed(fd);

            if (!res?.success) {
                CostoumPopup(res?.message || "Failed to initiate hospital admission", "error", 4000);
                setIsSubmitting(false);
                return;
            }

            // --- CASE A: Direct Confirmation for COD or Free Booking ---
            if (isZeroTotal || finalPaymentMethod === "COD" || res.data?.paymentStatus === "Paid") {
                sessionStorage.removeItem("activeBooking");
                setBookingSuccessData(res.data || { bookingId: res.bookingId || "HKH-CONFIRMED" });
                setIsSubmitting(false);
                return;
            }

            // --- CASE B: Online Razorpay Flow ---
            const isScriptLoaded = await loadRazorpayScript();
            if (!isScriptLoaded) {
                CostoumPopup("Failed to load Razorpay SDK.", "error", 4000);
                setIsSubmitting(false);
                return;
            }

            const { key_id, amount, razorpayOrderId, appointmentId, bookingId } = res;

            const options = {
                key: key_id,
                amount: amount,
                currency: "INR",
                name: "Health Kangaroo Hospital Network",
                description: `Bed Admission at ${booking.hospitalName}`,
                order_id: razorpayOrderId,
                prefill: {
                    name: patientDetails.fullName,
                    contact: patientDetails.phoneNumber
                },
                theme: { color: "#10b981" },
                modal: {
                    ondismiss: () => {
                        setIsSubmitting(false);
                        CostoumPopup("Payment cancelled", "warning", 3000);
                    }
                },
                handler: async function (paymentResponse) {
                    try {
                        setIsSubmitting(true);
                        const verificationRes = await UserAPI.verifyPaymentHospital({
                            appointmentId: appointmentId || res.data?._id,
                            razorpayOrderId: paymentResponse.razorpay_order_id || razorpayOrderId,
                            razorpayPaymentId: paymentResponse.razorpay_payment_id,
                            razorpaySignature: paymentResponse.razorpay_signature
                        });

                        if (verificationRes?.success) {
                            sessionStorage.removeItem("activeBooking");
                            setBookingSuccessData(verificationRes.data || { bookingId: bookingId || "HKH-CONFIRMED" });
                        } else {
                            CostoumPopup(verificationRes?.message || "Payment verification failed", "error", 4000);
                        }
                    } catch (e) {
                        CostoumPopup("Payment verification error", "error", 4000);
                    } finally {
                        setIsSubmitting(false);
                    }
                }
            };

            const rzpInstance = new window.Razorpay(options);
            rzpInstance.open();

        } catch (error) {
            console.error("Admission error:", error);
            CostoumPopup("An error occurred during booking. Please try again.", "error", 4000);
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

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20 font-sans">
            {/* HEADER */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
                    <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-600 font-bold text-xs uppercase tracking-widest hover:text-emerald-600">
                        <FaArrowLeft /> Back
                    </button>
                    <h1 className="text-sm md:text-base font-black text-slate-900 tracking-tight uppercase">Hospital Admission Checkout</h1>
                    <div className="flex items-center gap-2 text-emerald-600 font-black text-xs uppercase tracking-widest">
                        <FaShieldAlt /> Secure
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 md:px-6 mt-6 md:mt-8">
                <div className="grid lg:grid-cols-12 gap-8 items-start">

                    {/* LEFT COLUMN */}
                    <div className="lg:col-span-8 space-y-6">

                        {/* VIP Subscription Badge */}
                        {totals.isSubscriptionApplied && (
                            <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-3xl flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-emerald-600 flex-shrink-0">
                                    <FaGem size={20} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-emerald-900 uppercase tracking-tight">
                                        {totals.planName} Active
                                    </h4>
                                    <p className="text-xs font-semibold text-emerald-700 mt-0.5">
                                        VIP Admission benefits applied with instant COD access.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* SECTION 1: ADMISSION OVERVIEW */}
                        <section className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200/80">
                            <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                                <span className="w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-[10px]">01</span>
                                Admission Overview
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
                                    <div className="flex items-center gap-2 mb-1.5 text-slate-400">
                                        <FaHospital size={13} />
                                        <span className="text-[10px] font-black uppercase tracking-wider">Facility</span>
                                    </div>
                                    <p className="font-bold text-slate-900 text-sm leading-tight">{booking.hospitalName}</p>
                                </div>
                                <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100">
                                    <div className="flex items-center gap-2 mb-1.5 text-emerald-600">
                                        <FaProcedures size={13} />
                                        <span className="text-[10px] font-black uppercase tracking-wider">Ward & Bed</span>
                                    </div>
                                    <p className="font-bold text-emerald-900 text-sm leading-tight">
                                        {booking.wardName} — Bed #{booking.bedNumber} ({totals.stayDuration} Days)
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* SECTION 2: PATIENT INFORMATION */}
                        <section className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200/80">
                            <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                                <span className="w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-[10px]">02</span>
                                Patient Details
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
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Full Name *</label>
                                    <input type="text" name="fullName" value={patientDetails.fullName} onChange={handleInputChange} placeholder="Patient Full Name" className="w-full bg-slate-50 px-4 py-3.5 rounded-xl border border-slate-200 outline-none font-bold text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500/20" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Date of Birth</label>
                                    <input type="date" name="dob" value={patientDetails.dob} onChange={handleInputChange} className="w-full bg-slate-50 px-4 py-3.5 rounded-xl border border-slate-200 outline-none font-bold text-xs text-slate-800" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Phone Number *</label>
                                    <input type="tel" name="phoneNumber" value={patientDetails.phoneNumber} onChange={handleInputChange} placeholder="Contact No" className="w-full bg-slate-50 px-4 py-3.5 rounded-xl border border-slate-200 outline-none font-bold text-xs text-slate-800" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Gender</label>
                                    <div className="flex gap-3">
                                        {["Male", "Female", "Other"].map((g) => (
                                            <button key={g} type="button" onClick={() => setPatientDetails({ ...patientDetails, gender: g })} className={`flex-1 py-3 rounded-xl border font-black text-xs transition-all ${patientDetails.gender === g ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-500"}`}>{g}</button>
                                        ))}
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Admission Reason / Symptoms</label>
                                    <input type="text" name="bookingReason" value={patientDetails.bookingReason} onChange={handleInputChange} placeholder="e.g., Observation, Surgery, IV Treatment" className="w-full bg-slate-50 px-4 py-3.5 rounded-xl border border-slate-200 outline-none font-bold text-xs text-slate-800" />
                                </div>

                                {/* Insurance */}
                                <div className="md:col-span-2 pt-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Do you have Health Insurance?</label>
                                    <div className="flex gap-6">
                                        {["Yes", "No"].map((opt) => (
                                            <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                                <input type="radio" checked={patientDetails.haveInsurance === opt} onChange={() => setPatientDetails({ ...patientDetails, haveInsurance: opt })} className="accent-emerald-600 w-4 h-4" />
                                                <span className="text-xs font-bold text-slate-700 uppercase">{opt}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {patientDetails.haveInsurance === "Yes" && (
                                    <div className="md:col-span-2 bg-amber-50/40 p-4 rounded-2xl border border-amber-200/60 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <input type="text" name="insuranceNo" value={patientDetails.insuranceNo} onChange={handleInputChange} placeholder="Policy No." className="w-full bg-white px-4 py-3 rounded-xl border border-amber-200 outline-none font-bold text-xs" />
                                        <input type="text" name="companyName" value={patientDetails.companyName} onChange={handleInputChange} placeholder="TPA / Provider Name" className="w-full bg-white px-4 py-3 rounded-xl border border-amber-200 outline-none font-bold text-xs" />
                                        <div className="sm:col-span-2 border-2 border-dashed border-amber-300 rounded-xl p-4 bg-white text-center cursor-pointer relative">
                                            <input type="file" onChange={handleFileChange} accept="image/*,application/pdf" className="absolute inset-0 opacity-0 cursor-pointer" />
                                            <div className="flex flex-col items-center justify-center gap-1">
                                                <FaUpload className="text-amber-500" />
                                                <span className="text-xs font-bold text-slate-700">{patientDetails.insuranceDocument ? patientDetails.insuranceDocument.name : "Upload Insurance Card (Required) *"}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* SECTION 3: PAYMENT METHOD */}
                        {totals.totalPayable > 0 && (
                            <section className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200/80">
                                <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] mb-4 flex items-center gap-3">
                                    <span className="w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-[10px]">03</span>
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
                                                <p className="text-[10px] text-slate-500">Instant Razorpay Confirmation</p>
                                            </div>
                                        </div>
                                        {paymentMethod === "Online" && <FaCheckCircle className="text-emerald-600" size={15} />}
                                    </button>

                                    <button
                                        type="button"
                                        disabled={!totals.isCodAvailable}
                                        onClick={() => setPaymentMethod("COD")}
                                        className={`p-4 rounded-2xl border transition-all text-left flex items-center justify-between relative
                                            ${!totals.isCodAvailable ? 'opacity-40 cursor-not-allowed bg-slate-50 border-slate-200' : ''}
                                            ${paymentMethod === "COD" ? 'border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-500' : 'bg-white border-slate-200'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 bg-slate-100 text-slate-700 rounded-xl">
                                                <FaMoneyBillWave size={15} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-slate-900">Pay at Hospital Desk</p>
                                                <p className="text-[10px] text-slate-500">
                                                    {totals.isCodAvailable ? "Pay cash/card during admission" : "Unavailable for this hospital"}
                                                </p>
                                            </div>
                                        </div>
                                        {paymentMethod === "COD" && <FaCheckCircle className="text-emerald-600" size={15} />}
                                    </button>
                                </div>
                            </section>
                        )}
                    </div>

                    {/* RIGHT COLUMN: BILL SUMMARY */}
                    <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
                        
                        {/* Coupon Box */}
                        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                            <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                <FaTag className="text-emerald-500" /> Apply Coupon
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
                                    className={`px-4 rounded-xl text-[10px] font-black uppercase transition-all
                                        ${appliedCouponCode ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                                >
                                    {isValidatingCoupon ? <FaSpinner className="animate-spin" /> : appliedCouponCode ? 'Remove' : 'Apply'}
                                </button>
                            </div>
                            {couponError && <p className="text-[10px] font-bold text-rose-500">{couponError}</p>}
                        </div>

                        {/* Bill Breakdown */}
                        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                            <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                <FaReceipt className="text-slate-400" /> Admission Costing
                            </h2>
                            
                            <div className="space-y-3 text-xs">
                                <div className="flex justify-between items-center text-slate-600">
                                    <span>Bed Base Rate ({totals.stayDuration} Days)</span>
                                    <span className="font-black text-slate-900">₹{totals.baseFee}</span>
                                </div>

                                {totals.discount > 0 && (
                                    <div className="flex justify-between items-center text-emerald-600 font-bold">
                                        <span>Coupon Discount</span>
                                        <span>-₹{totals.discount}</span>
                                    </div>
                                )}

                                <div className="h-px bg-slate-100 my-2" />

                                <div className="flex justify-between items-end">
                                    <div>
                                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Total Payable</span>
                                        <span className="text-[10px] text-slate-400 font-medium">Inclusive of all taxes</span>
                                    </div>
                                    <span className="text-3xl font-black text-slate-900">
                                        ₹{totals.totalPayable.toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={handlePayment}
                                disabled={isSubmitting || isFetchingSummary}
                                className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2
                                    ${(!isSubmitting && !isFetchingSummary)
                                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 active:scale-95'
                                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                            >
                                {isSubmitting || isFetchingSummary ? (
                                    <FaSpinner className="animate-spin" size={14} />
                                ) : totals.totalPayable === 0 ? (
                                    <>Confirm Free Admission <FaCheckCircle size={12} /></>
                                ) : paymentMethod === "COD" ? (
                                    <>Confirm & Pay at Hospital Desk <FaHospital size={12} /></>
                                ) : (
                                    <>Proceed to Pay ₹{totals.totalPayable.toFixed(2)} <FaLock size={10} /></>
                                )}
                            </button>
                        </div>
                    </div>

                </div>
            </main>

            {/* CONFIRMATION SUCCESS MODAL */}
            {bookingSuccessData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-[2rem] p-8 max-w-md w-full border border-slate-100 shadow-2xl text-center space-y-5">
                        <div className="mx-auto w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
                            <FaCheckCircle className="w-9 h-9" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-2xl font-black text-slate-900">Admission Confirmed!</h3>
                            <p className="text-xs font-semibold text-slate-500">Your hospital bed admission request is confirmed.</p>
                        </div>
                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-left space-y-2 text-xs">
                            <div className="flex justify-between">
                                <span className="text-slate-400 font-medium">Booking ID:</span>
                                <span className="font-bold text-slate-800">{bookingSuccessData.bookingId || "HKH-xxxx"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400 font-medium">Status:</span>
                                <span className="font-black text-emerald-600 uppercase">{bookingSuccessData.status || "Confirmed"}</span>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                setBookingSuccessData(null);
                                router.push('/userscreens/hospitalappointment');
                            }}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/20"
                        >
                            View Admissions
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}