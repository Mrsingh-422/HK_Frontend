'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
    FaArrowLeft, FaShieldAlt, FaUserMd, FaDoorOpen, FaClock,
    FaUser, FaTag, FaReceipt, FaCreditCard, FaMoneyBillWave,
    FaCheckCircle, FaLock, FaSpinner, FaCrown, FaInfoCircle,
    FaExclamationTriangle
} from 'react-icons/fa';
import UserAPI from '@/app/services/UserAPI';
import CostoumPopup from '@/lib/CostoumPopup';

// Dynamically load Razorpay SDK safely
const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        if (typeof window === 'undefined') {
            resolve(false);
            return;
        }
        if (window.Razorpay) {
            resolve(true);
            return;
        }
        const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
        if (existingScript) existingScript.remove();

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => resolve(true);
        script.onerror = () => {
            console.error('❌ Failed to load Razorpay SDK');
            resolve(false);
        };
        document.body.appendChild(script);
    });
};

export default function OpdCheckout() {
    const router = useRouter();

    const [booking, setBooking] = useState(null);
    const [hospitalInfo, setHospitalInfo] = useState(null);
    const [isReady, setIsReady] = useState(false);

    // Profile & Family States
    const [userProfile, setUserProfile] = useState(null);
    const [familyMembers, setFamilyMembers] = useState([]);
    const [selectedMemberId, setSelectedMemberId] = useState('self');

    // Saved Insurance States (Step 1)
    const [savedInsurance, setSavedInsurance] = useState(null);
    const [applySavedInsurance, setApplySavedInsurance] = useState(false);
    const [isLoadingInsurance, setIsLoadingInsurance] = useState(true);

    // Patient Form State
    const [patientDetails, setPatientDetails] = useState({
        fullName: '',
        dob: '',
        phoneNumber: '',
        gender: 'Male',
        relation: 'Self',
        bookingReason: ''
    });

    // Manual Insurance States (for fallback when no saved insurance is available)
    const [hasInsurance, setHasInsurance] = useState(false);
    const [insuranceDetails, setInsuranceDetails] = useState({
        companyName: '',
        insuranceNumber: '',
        insuranceType: 'Cashless Mediclaim'
    });

    // Payment States - DEFAULT TO ONLINE
    const [paymentMethod, setPaymentMethod] = useState('Online');

    // Coupon States
    const [couponCode, setCouponCode] = useState('');
    const [appliedCouponCode, setAppliedCouponCode] = useState('');
    const [couponError, setCouponError] = useState('');
    const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

    // Pricing & Submission States
    const [serverPricing, setServerPricing] = useState(null);
    const [isFetchingSummary, setIsFetchingSummary] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [bookingSuccessData, setBookingSuccessData] = useState(null);

    // Duplicate verification lock
    const isVerifyingRef = useRef(false);

    // Handle back button: Purge incomplete OPD checkout session
    const handleBack = () => {
        if (!bookingSuccessData) {
            sessionStorage.removeItem('activeOpdBooking');
            sessionStorage.removeItem('lastActiveCheckoutType');
        }
        router.back();
    };

    // Clean up if user uses the browser's back button
    useEffect(() => {
        const handlePopState = () => {
            if (!bookingSuccessData) {
                sessionStorage.removeItem('activeOpdBooking');
                sessionStorage.removeItem('lastActiveCheckoutType');
            }
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [bookingSuccessData]);

    const getCleanDate = (dateVal) => {
        if (!dateVal) return new Date().toISOString().split('T')[0];
        if (dateVal.includes('T')) return dateVal.split('T')[0];
        return dateVal;
    };

    const calculateAge = (dob) => {
        if (!dob) return 0;
        const birthDate = new Date(dob);
        if (isNaN(birthDate.getTime())) return 0;
        const diff = Date.now() - birthDate.getTime();
        const ageDate = new Date(diff);
        return Math.abs(ageDate.getUTCFullYear() - 1970) || 0;
    };

    // 1. Session Initialization & Step 1: Fetch Saved Insurance
    useEffect(() => {
        const initData = async () => {
            const token = localStorage.getItem('userToken');
            if (!token) {
                CostoumPopup('Please Login To Continue', 'warning', 4000);
                router.push('/hospital');
                return;
            }

            // Read OPD booking from session
            const opdRaw = sessionStorage.getItem('activeOpdBooking');
            if (!opdRaw) {
                router.push('/hospital');
                return;
            }

            let parsedOpd = null;
            try {
                parsedOpd = JSON.parse(opdRaw);
                setBooking(parsedOpd);
            } catch (e) {
                console.error('Invalid OPD booking session:', e);
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
                console.warn('Could not fetch user profile:', err);
            }

            // STEP 1: Fetch Saved Health Insurance (GET /api/auth/user/my-insurance)
            try {
                setIsLoadingInsurance(true);
                if (typeof UserAPI.getMyInsurance === 'function') {
                    const myInsRes = await UserAPI.getMyInsurance();
                    if (myInsRes?.success && myInsRes.data?.hasInsurance) {
                        const insData = myInsRes.data;
                        setSavedInsurance(insData);
                        setApplySavedInsurance(true); // Default to applying saved insurance
                    } else {
                        setSavedInsurance(null);
                        setApplySavedInsurance(false);
                    }
                }
            } catch (err) {
                console.warn('Could not fetch saved insurance:', err);
            } finally {
                setIsLoadingInsurance(false);
            }

            // Fetch Family Members
            try {
                const famRes = await UserAPI.getFamilyMembers();
                if (famRes?.success) setFamilyMembers(famRes.data || []);
            } catch (err) {
                console.warn('Could not fetch family members:', err);
            }

            // Fetch Hospital Details to verify acceptedInsurances tie-up
            const targetHospitalId = parsedOpd.hospital?._id || parsedOpd.hospitalId;
            if (targetHospitalId) {
                try {
                    if (typeof UserAPI.getHospitalDetail === 'function') {
                        const hRes = await UserAPI.getHospitalDetail(targetHospitalId);
                        if (hRes?.success && hRes.data?.hospital) {
                            setHospitalInfo(hRes.data.hospital);
                        }
                    }
                } catch (e) {
                    console.warn('Could not fetch hospital detail:', e);
                }
            }

            setIsReady(true);
        };

        initData();
    }, [router]);

    // STEP 2: Check Hospital Compatibility
    const hospitalCoveredInfo = useMemo(() => {
        const accepted = hospitalInfo?.acceptedInsurances || booking?.hospital?.acceptedInsurances || [];
        const isUsingSaved = applySavedInsurance && savedInsurance?.hasInsurance && selectedMemberId === 'self';
        const currentCompany = isUsingSaved 
            ? savedInsurance.companyName 
            : (hasInsurance ? insuranceDetails.companyName : '');

        if (!currentCompany || !accepted || accepted.length === 0) {
            return { isCovered: true, companyName: currentCompany };
        }

        const isCovered = accepted.some(
            c => c.trim().toLowerCase() === currentCompany.trim().toLowerCase()
        );

        return { isCovered, companyName: currentCompany };
    }, [hospitalInfo, booking, applySavedInsurance, savedInsurance, selectedMemberId, hasInsurance, insuranceDetails.companyName]);

    // Effective Insurance Resolution
    const effectiveInsurance = useMemo(() => {
        const isUsingSaved = Boolean(applySavedInsurance && savedInsurance?.hasInsurance && selectedMemberId === 'self');
        if (isUsingSaved) {
            return {
                isAttached: true,
                companyName: savedInsurance.companyName,
                insuranceNumber: savedInsurance.insuranceNumber,
                insuranceType: savedInsurance.insuranceType || 'Cashless Mediclaim'
            };
        }
        if (hasInsurance && insuranceDetails.companyName.trim()) {
            return {
                isAttached: true,
                companyName: insuranceDetails.companyName.trim(),
                insuranceNumber: insuranceDetails.insuranceNumber.trim(),
                insuranceType: insuranceDetails.insuranceType || 'Cashless Mediclaim'
            };
        }
        return { isAttached: false, companyName: '', insuranceNumber: '', insuranceType: '' };
    }, [applySavedInsurance, savedInsurance, selectedMemberId, hasInsurance, insuranceDetails]);

    // 2. Fetch OPD Checkout Pricing Summary
    const fetchSummary = useCallback(async (codeToApply = appliedCouponCode) => {
        if (!isReady || !booking) return;

        try {
            setIsFetchingSummary(true);
            setCouponError('');

            const cleanApptTime = booking.appointmentTime || booking.selectedSlot?.time || '';
            const payload = {
                hospitalId: booking.hospital?._id || booking.hospitalId,
                doctorId: booking.doctor?._id || booking.doctorId,
                appointmentDate: getCleanDate(booking.appointmentDate || booking.selectedDate),
                ...(cleanApptTime && { appointmentTime: cleanApptTime }),
                couponCode: codeToApply || undefined,
                hasInsurance: effectiveInsurance.isAttached,
                ...(effectiveInsurance.isAttached && {
                    companyName: effectiveInsurance.companyName,
                    insuranceNumber: effectiveInsurance.insuranceNumber,
                    insuranceType: effectiveInsurance.insuranceType
                })
            };

            const res = await UserAPI.getOpdCheckoutSummary(payload);
            if (res?.success && res.data) {
                setServerPricing(res.data);
                if (res.data.isCodAvailable === false && paymentMethod === 'COD') {
                    setPaymentMethod('Online');
                }
            } else if (codeToApply) {
                setCouponError(res?.message || 'Invalid coupon code');
                setAppliedCouponCode('');
            }
        } catch (err) {
            console.error('OPD summary fetch error:', err);
            if (codeToApply) setCouponError('Failed to validate coupon code');
        } finally {
            setIsFetchingSummary(false);
            setIsValidatingCoupon(false);
        }
    }, [isReady, booking, appliedCouponCode, paymentMethod, effectiveInsurance]);

    useEffect(() => {
        if (isReady && booking) {
            fetchSummary(appliedCouponCode);
        }
    }, [isReady, appliedCouponCode, fetchSummary]);

    // Family Member Selection Handler
    const handleMemberSelect = (member) => {
        if (member === 'self') {
            setSelectedMemberId('self');
            setPatientDetails({
                fullName: userProfile?.name || userProfile?.fullName || '',
                phoneNumber: userProfile?.phone || userProfile?.phoneNumber || '',
                dob: userProfile?.dob ? userProfile.dob.split('T')[0] : '',
                gender: userProfile?.gender || 'Male',
                relation: 'Self',
                bookingReason: ''
            });

            // Re-apply personal saved insurance if available
            if (savedInsurance?.hasInsurance) {
                setApplySavedInsurance(true);
            }
        } else {
            setSelectedMemberId(member._id);
            let formattedDob = '';
            if (member.dob && member.dob.includes('-')) {
                const parts = member.dob.split('-');
                if (parts.length === 3) {
                    formattedDob = parts[2].length === 4 ? `${parts[2]}-${parts[1]}-${parts[0]}` : member.dob;
                }
            }

            // Disable personal profile saved insurance when family member selected
            setApplySavedInsurance(false);

            setPatientDetails({
                fullName: member.memberName || '',
                phoneNumber: member.phone || '',
                dob: formattedDob,
                gender: member.gender || 'Male',
                relation: member.relation || 'Family Member',
                bookingReason: ''
            });

            if (member.hasInsurance) {
                setHasInsurance(true);
                setInsuranceDetails({
                    companyName: member.insuranceId?.provider || member.insuranceId?.insuranceName || '',
                    insuranceNumber: member.insuranceNo || '',
                    insuranceType: 'Cashless Mediclaim'
                });
            } else {
                setHasInsurance(false);
            }
        }
    };

    // 3. Computed Totals
    const totals = useMemo(() => {
        const liveDoctorFee = Number(booking?.doctor?.fees?.clinic || booking?.doctor?.fees?.opd || booking?.doctor?.consultationFee || 0);

        if (serverPricing) {
            const baseFee = Number(serverPricing.baseFee ?? liveDoctorFee);
            const premiumSlotFee = Number(serverPricing.premiumSlotFee ?? serverPricing.extraCharges ?? 0);
            const isPremiumSlot = Boolean(serverPricing.isPremiumSlot || booking?.isPremium);
            const discount = Number(serverPricing.discount ?? serverPricing.appliedCoupon?.discountAmount ?? 0);
            const subtotal = Number(serverPricing.subtotal ?? (baseFee + premiumSlotFee));
            const totalPayable = Math.max(0, Number(serverPricing.totalPayable ?? (subtotal - discount)));

            return {
                baseFee,
                premiumSlotFee,
                isPremiumSlot,
                discount,
                subtotal,
                totalPayable,
                isCodAvailable: serverPricing.isCodAvailable !== false
            };
        }

        return {
            baseFee: liveDoctorFee,
            premiumSlotFee: 0,
            isPremiumSlot: false,
            discount: 0,
            subtotal: liveDoctorFee,
            totalPayable: liveDoctorFee,
            isCodAvailable: true
        };
    }, [serverPricing, booking]);

    const handleApplyCoupon = (code) => {
        const codeToApply = (code || couponCode).trim().toUpperCase();
        if (!codeToApply) return;
        setIsValidatingCoupon(true);
        setAppliedCouponCode(codeToApply);
    };

    const removeCoupon = () => {
        setAppliedCouponCode('');
        setCouponCode('');
        setCouponError('');
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPatientDetails(prev => ({ ...prev, [name]: value }));
    };

    const handleInsuranceChange = (e) => {
        const { name, value } = e.target;
        setInsuranceDetails(prev => ({ ...prev, [name]: value }));
    };

    // 4. Razorpay Online Payment Flow
    const launchRazorpay = async (orderRes) => {
        try {
            const isScriptLoaded = await loadRazorpayScript();
            if (!isScriptLoaded) {
                CostoumPopup('Failed to load Razorpay payment gateway.', 'error', 4000);
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

            if (typeof keyId === 'string' && keyId.startsWith('zp_')) {
                keyId = 'r' + keyId;
            }

            if (!keyId) {
                CostoumPopup('Payment configuration key missing. Please contact clinic admin.', 'error', 4000);
                setIsSubmitting(false);
                return;
            }

            const rawAmount = orderRes.amount || orderRes.data?.amount || Math.round(totals.totalPayable * 100);
            const amountInPaise = Number(rawAmount) <= totals.totalPayable 
                ? Math.round(Number(rawAmount) * 100) 
                : Math.round(Number(rawAmount));

            const razorpayOrderId = 
                orderRes.razorpayOrderId || 
                orderRes.data?.razorpayOrderId || 
                orderRes.orderId || 
                orderRes.data?.orderId;

            const targetMongoId = 
                (orderRes.appointmentId && orderRes.appointmentId.length === 24 ? orderRes.appointmentId : null) ||
                (orderRes.data?.appointmentId && orderRes.data.appointmentId.length === 24 ? orderRes.data.appointmentId : null) ||
                (orderRes.data?._id && orderRes.data._id.length === 24 ? orderRes.data._id : null) ||
                orderRes._id;

            const targetBookingId = orderRes.bookingId || orderRes.data?.bookingId || 'HKH-OPD-CONFIRMED';

            isVerifyingRef.current = false;

            const options = {
                key: keyId,
                amount: amountInPaise,
                currency: orderRes.currency || 'INR',
                name: 'Health Kangaroo OPD Clinic',
                description: `OPD Consultation Token #${orderRes.tokenNumber || '1'} with Dr. ${booking.doctor?.name || ''}`,
                order_id: razorpayOrderId || undefined,
                prefill: {
                    name: patientDetails.fullName || '',
                    contact: patientDetails.phoneNumber || ''
                },
                theme: { color: '#08B36A' },
                modal: {
                    ondismiss: () => {
                        setIsSubmitting(false);
                        CostoumPopup('Payment cancelled. You can retry or switch payment method.', 'warning', 3000);
                    }
                },
                handler: async function (paymentResponse) {
                    if (isVerifyingRef.current) return;
                    isVerifyingRef.current = true;

                    try {
                        setIsSubmitting(true);
                        const pId = paymentResponse.razorpay_payment_id || paymentResponse.paymentId;
                        const oId = paymentResponse.razorpay_order_id || paymentResponse.orderId || razorpayOrderId;
                        const sig = paymentResponse.razorpay_signature || paymentResponse.signature;

                        const verificationPayload = {
                            appointmentId: String(targetMongoId),
                            bookingId: String(targetBookingId),
                            razorpay_payment_id: pId,
                            razorpay_order_id: oId,
                            razorpay_signature: sig,
                            razorpayPaymentId: pId,
                            razorpayOrderId: oId,
                            razorpaySignature: sig
                        };

                        const verificationRes = await UserAPI.verifyPaymentHospital(verificationPayload);

                        if (verificationRes?.success || verificationRes?.status === 'Confirmed' || verificationRes?.data?.paymentStatus === 'Paid') {
                            sessionStorage.removeItem('activeOpdBooking');
                            sessionStorage.removeItem('lastActiveCheckoutType');
                            setBookingSuccessData({
                                ...orderRes,
                                ...(verificationRes.data || verificationRes),
                                bookingId: verificationRes.bookingId || verificationRes.data?.bookingId || targetBookingId,
                                status: 'Confirmed',
                                paymentStatus: 'Paid'
                            });
                            CostoumPopup('Payment verified! OPD Token confirmed.', 'success', 3000);
                        } else {
                            CostoumPopup(verificationRes?.message || 'Payment verification failed', 'error', 4000);
                        }
                    } catch (e) {
                        console.error('Verification error:', e);
                        if (e?.response?.data?.message?.includes('Paid') || e?.response?.data?.message?.includes('already')) {
                            sessionStorage.removeItem('activeOpdBooking');
                            sessionStorage.removeItem('lastActiveCheckoutType');
                            setBookingSuccessData({
                                ...orderRes,
                                bookingId: targetBookingId,
                                status: 'Confirmed',
                                paymentStatus: 'Paid'
                            });
                            CostoumPopup('Payment confirmed!', 'success', 3000);
                        } else {
                            CostoumPopup(e?.response?.data?.message || 'Error occurred during payment verification', 'error', 4000);
                        }
                    } finally {
                        setIsSubmitting(false);
                    }
                }
            };

            const rzpInstance = new window.Razorpay(options);
            rzpInstance.on('payment.failed', function (response) {
                console.error('Payment failed:', response.error);
                CostoumPopup(response.error?.description || 'Payment failed. Please try again.', 'error', 4000);
                setIsSubmitting(false);
            });
            rzpInstance.open();

        } catch (err) {
            console.error('Razorpay launch error:', err);
            CostoumPopup('Could not initialize payment gateway. Please retry.', 'error', 4000);
            setIsSubmitting(false);
        }
    };

    // 5. Final OPD Booking Submit (Step 4 Flow: POST /user/hospital/opd/book)
    const handleBooking = async () => {
        if (!patientDetails.fullName.trim() || !patientDetails.phoneNumber.trim()) {
            CostoumPopup('Please provide patient name and contact phone number', 'warning', 3000);
            return;
        }

        // Validate manual insurance fields if manual option is enabled
        if (!applySavedInsurance && hasInsurance) {
            if (!insuranceDetails.companyName.trim()) {
                CostoumPopup('Please enter your Insurance Provider Company', 'warning', 3000);
                return;
            }
            if (!insuranceDetails.insuranceNumber.trim()) {
                CostoumPopup('Please enter your Insurance Policy / Card Number', 'warning', 3000);
                return;
            }
        }

        setIsSubmitting(true);

        try {
            const isZeroTotal = totals.totalPayable === 0;
            const finalPaymentMethod = isZeroTotal ? 'COD' : paymentMethod;
            const calculatedPatientAge = calculateAge(patientDetails.dob);

            const cleanApptTime = booking.appointmentTime || booking.selectedSlot?.time || '';

            // Clean Payload per Documentation
            const opdPayload = {
                hospitalId: String(booking.hospital?._id || booking.hospitalId),
                doctorId: String(booking.doctor?._id || booking.doctorId),
                appointmentDate: getCleanDate(booking.appointmentDate || booking.selectedDate),
                ...(cleanApptTime && { appointmentTime: cleanApptTime }),
                ...(patientDetails.bookingReason && { bookingReason: patientDetails.bookingReason.trim() }),
                paymentMethod: finalPaymentMethod,
                couponCode: appliedCouponCode || undefined,
                
                // STEP 4 Insurance Handling: Avoid sending string "undefined" or "null"
                hasInsurance: effectiveInsurance.isAttached,
                ...(effectiveInsurance.isAttached ? {
                    companyName: effectiveInsurance.companyName,
                    insuranceNumber: effectiveInsurance.insuranceNumber,
                    insuranceType: effectiveInsurance.insuranceType || 'Cashless Mediclaim'
                } : {}),

                patients: [
                    {
                        patientName: patientDetails.fullName.trim(),
                        patientAge: calculatedPatientAge > 0 ? calculatedPatientAge : 30,
                        gender: patientDetails.gender,
                        relation: selectedMemberId === 'self' ? 'Self' : (patientDetails.relation || 'Family Member')
                    }
                ]
            };

            const res = await UserAPI.bookOpdAppointment(opdPayload);

            if (!res?.success) {
                CostoumPopup(res?.message || 'Failed to generate OPD consultation token', 'error', 4000);
                setIsSubmitting(false);
                return;
            }

            if (finalPaymentMethod === 'Online' && !isZeroTotal) {
                await launchRazorpay(res);
                return;
            }

            // Pay at OPD Reception Desk (COD)
            sessionStorage.removeItem('activeOpdBooking');
            sessionStorage.removeItem('lastActiveCheckoutType');
            setBookingSuccessData({
                ...res,
                status: 'Hospital-Pending',
                paymentStatus: 'Pending at OPD Reception'
            });
            setIsSubmitting(false);

        } catch (err) {
            console.error('OPD booking submission error:', err);
            CostoumPopup(err?.response?.data?.message || 'An error occurred during booking. Please try again.', 'error', 4000);
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

    const cabinRoomLabel = booking.doctor?.roomNumber
        ? booking.doctor.roomNumber
        : booking.doctor?.department?.roomNumber 
        ? `Cabin ${booking.doctor.department.roomNumber}`
        : booking.doctor?.opdRoomNumber 
        ? `Cabin ${booking.doctor.opdRoomNumber}`
        : 'Consultation Cabin';

    const currentPatientAge = calculateAge(patientDetails.dob);
    const insuranceOverview = serverPricing?.insuranceOverview;

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20 font-sans antialiased text-slate-900">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
                    <button onClick={handleBack} className="flex items-center gap-2 text-slate-600 font-bold text-xs uppercase tracking-widest hover:text-emerald-600 cursor-pointer">
                        <FaArrowLeft /> Back
                    </button>
                    <div className="text-center">
                        <h1 className="text-sm md:text-base font-black text-slate-900 tracking-tight uppercase">
                            OPD Doctor Consultation Checkout
                        </h1>
                        <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">
                            Instant Token Generation Desk
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-600 font-black text-xs uppercase tracking-widest">
                        <FaShieldAlt /> 256-Bit Encrypted
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 md:px-6 mt-6 md:mt-8">
                <div className="grid lg:grid-cols-12 gap-8 items-start">

                    {/* Left Column */}
                    <div className="lg:col-span-8 space-y-6">

                        {/* SECTION 1: OPD Consultation Overview */}
                        <section className="bg-white rounded-3xl p-6 md:p-8 shadow-xs border border-slate-200/80">
                            <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                                <span className="w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-[10px]">01</span>
                                OPD Consultation &amp; Slot Details
                            </h2>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
                                    <div className="flex items-center gap-2 mb-1.5 text-slate-400">
                                        <FaUserMd size={13} />
                                        <span className="text-[10px] font-black uppercase tracking-wider">Consulting Doctor</span>
                                    </div>
                                    <p className="font-bold text-slate-900 text-sm leading-tight">Dr. {booking.doctor?.name || 'Consultant'}</p>
                                    <p className="text-emerald-600 text-xs font-bold mt-0.5">{booking.doctor?.speciality || 'General Medicine'}</p>
                                </div>

                                <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100">
                                    <div className="flex items-center gap-2 mb-1.5 text-emerald-600">
                                        <FaDoorOpen size={13} />
                                        <span className="text-[10px] font-black uppercase tracking-wider">OPD Room</span>
                                    </div>
                                    <p className="font-bold text-emerald-900 text-sm leading-tight">
                                        {cabinRoomLabel}
                                    </p>
                                    <p className="text-[10px] text-emerald-700 font-bold mt-0.5">{booking.hospital?.name || booking.hospitalName || 'Main Hospital Campus'}</p>
                                </div>

                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
                                    <div className="flex items-center gap-2 mb-1.5 text-slate-400">
                                        <FaClock size={13} />
                                        <span className="text-[10px] font-black uppercase tracking-wider">Allotted Slot</span>
                                    </div>
                                    <p className="font-bold text-slate-900 text-xs leading-tight">
                                        {getCleanDate(booking.appointmentDate || booking.selectedDate)}
                                    </p>
                                    <span className="text-[11px] font-black text-emerald-600 block mt-1">
                                        {booking.appointmentTime || booking.selectedSlot?.time || 'Queue Token'}
                                    </span>
                                </div>
                            </div>
                        </section>

                        {/* SECTION 2: Patient Demographics */}
                        <section className="bg-white rounded-3xl p-6 md:p-8 shadow-xs border border-slate-200/80">
                            <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                                <span className="w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-[10px]">02</span>
                                Patient Demographics
                            </h2>

                            <div className="flex gap-4 overflow-x-auto pb-4 mb-4 scrollbar-none">
                                <div onClick={() => handleMemberSelect('self')} className="shrink-0 cursor-pointer flex flex-col items-center gap-2">
                                    <div className={`w-14 h-14 rounded-full border-2 flex items-center justify-center bg-slate-50 transition-all ${selectedMemberId === 'self' ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-500/20' : 'border-slate-200'}`}>
                                        <FaUser className={selectedMemberId === 'self' ? 'text-emerald-600 text-base' : 'text-slate-300 text-base'} />
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-600">Self</span>
                                </div>

                                {familyMembers.map((member) => (
                                    <div key={member._id} onClick={() => handleMemberSelect(member)} className="shrink-0 cursor-pointer flex flex-col items-center gap-2">
                                        <div className={`w-14 h-14 rounded-full border-2 overflow-hidden bg-slate-50 transition-all ${selectedMemberId === member._id ? 'border-emerald-600 ring-2 ring-emerald-500/20' : 'border-slate-200'}`}>
                                            {member.profilePic ? (
                                                <img src={member.profilePic} className="w-full h-full object-cover" alt="Patient" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center font-black text-slate-400 text-xs">
                                                    {member.memberName?.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-600 max-w-[60px] truncate">{member.memberName}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Patient Full Name *</label>
                                    <input type="text" name="fullName" value={patientDetails.fullName} onChange={handleInputChange} placeholder="Full name as per official ID" className="w-full bg-slate-50 px-4 py-3.5 rounded-xl border border-slate-200 outline-none font-bold text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white" />
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Date of Birth</label>
                                    <input type="date" name="dob" value={patientDetails.dob} onChange={handleInputChange} className="w-full bg-slate-50 px-4 py-3.5 rounded-xl border border-slate-200 outline-none font-bold text-xs text-slate-800 focus:bg-white" />
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Contact Phone Number *</label>
                                    <input type="tel" name="phoneNumber" value={patientDetails.phoneNumber} onChange={handleInputChange} placeholder="10-digit mobile number" className="w-full bg-slate-50 px-4 py-3.5 rounded-xl border border-slate-200 outline-none font-bold text-xs text-slate-800 focus:bg-white" />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Gender</label>
                                    <div className="flex gap-3">
                                        {['Male', 'Female', 'Other'].map((g) => (
                                            <button key={g} type="button" onClick={() => setPatientDetails({ ...patientDetails, gender: g })} className={`flex-1 py-3 rounded-xl border font-black text-xs transition-all cursor-pointer ${patientDetails.gender === g ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'}`}>{g}</button>
                                        ))}
                                    </div>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Symptoms / Chief Complaints</label>
                                    <input type="text" name="bookingReason" value={patientDetails.bookingReason} onChange={handleInputChange} placeholder="e.g. Mild headache, seasonal cold, routine consultation..." className="w-full bg-slate-50 px-4 py-3.5 rounded-xl border border-slate-200 outline-none font-bold text-xs text-slate-800 focus:bg-white" />
                                </div>
                            </div>
                        </section>

                        {/* ============================================================== */}
                        {/* 🛡️ SECTION 3: HEALTH INSURANCE VERIFICATION (STEPS 1 - 3)      */}
                        {/* ============================================================== */}
                        <section className="bg-white rounded-3xl p-6 md:p-8 shadow-xs border border-slate-200/80">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-3">
                                    <span className="w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-[10px]">03</span>
                                    Health Insurance Verification
                                </h2>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Cashless / Reimbursement</span>
                            </div>

                            {/* CASE A: User Has Saved Insurance in Profile (Self Only) */}
                            {selectedMemberId === 'self' && savedInsurance?.hasInsurance ? (
                                <div className="bg-emerald-50/60 p-5 rounded-2xl border border-emerald-200 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-sm">
                                            <FaShieldAlt className="text-[#08B36A] text-base" />
                                            <span>Saved Insurance Found (From Profile)</span>
                                        </div>

                                        {/* STEP 3 Toggle Switch */}
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                checked={applySavedInsurance} 
                                                onChange={(e) => setApplySavedInsurance(e.target.checked)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#08B36A]"></div>
                                        </label>
                                    </div>

                                    {/* Pre-Filled Card Details */}
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-slate-700 bg-white/70 p-3 rounded-xl border border-emerald-100">
                                        <div>
                                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Company</span>
                                            <span className="font-black text-slate-900">{savedInsurance.companyName}</span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Policy Number</span>
                                            <span className="font-mono font-bold text-slate-900">{savedInsurance.insuranceNumber}</span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Type</span>
                                            <span className="font-bold text-slate-900">{savedInsurance.insuranceType || 'Cashless Mediclaim'}</span>
                                        </div>
                                    </div>

                                    {/* STEP 2: Hospital Compatibility Check Feedback */}
                                    {applySavedInsurance && (
                                        hospitalCoveredInfo.isCovered ? (
                                            <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-700 bg-emerald-100/60 px-3 py-1.5 rounded-lg">
                                                <FaCheckCircle className="text-[#08B36A]" />
                                                <span>Cashless OPD consultation tie-up active with this facility.</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-start gap-2 text-[11px] font-bold text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                                                <FaExclamationTriangle className="text-amber-500 mt-0.5 shrink-0" />
                                                <span>This hospital does not have cashless tie-up with {hospitalCoveredInfo.companyName}. Reimbursement receipt will be provided.</span>
                                            </div>
                                        )
                                    )}

                                    <p className="text-[10px] text-slate-500">
                                        {applySavedInsurance
                                            ? '✓ Saved policy credentials will automatically tag to this OPD consultation.'
                                            : 'Self-Pay chosen. Switch on above to apply your saved insurance.'}
                                    </p>
                                </div>
                            ) : (
                                /* CASE B: No Saved Insurance OR Family Member -> Standard Manual Flow */
                                <div className="space-y-4">
                                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2.5 rounded-xl ${hasInsurance ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                                                <FaShieldAlt size={16} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-slate-900">Do you have Health Insurance?</p>
                                                <p className="text-[10px] text-slate-500 mt-0.5">Avail cashless approval or get bills formatted for claim submission</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setHasInsurance(true)}
                                                className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase transition-all cursor-pointer ${
                                                    hasInsurance ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                                                }`}
                                            >
                                                Yes
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setHasInsurance(false)}
                                                className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase transition-all cursor-pointer ${
                                                    !hasInsurance ? 'bg-slate-900 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                                                }`}
                                            >
                                                No
                                            </button>
                                        </div>
                                    </div>

                                    {/* Manual Fields */}
                                    {hasInsurance && (
                                        <div className="pt-2 space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Insurance Company / TPA Provider *</label>
                                                    <input
                                                        type="text"
                                                        name="companyName"
                                                        value={insuranceDetails.companyName}
                                                        onChange={handleInsuranceChange}
                                                        placeholder="e.g. HDFC ERGO, Star Health, Care, ICICI Lombard"
                                                        className="w-full bg-slate-50 px-4 py-3.5 rounded-xl border border-slate-200 outline-none font-bold text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Policy / Card Number *</label>
                                                    <input
                                                        type="text"
                                                        name="insuranceNumber"
                                                        value={insuranceDetails.insuranceNumber}
                                                        onChange={handleInsuranceChange}
                                                        placeholder="e.g. HDFC-POL-984021"
                                                        className="w-full bg-slate-50 px-4 py-3.5 rounded-xl border border-slate-200 outline-none font-bold text-xs text-slate-800 font-mono focus:ring-2 focus:ring-emerald-500/20 focus:bg-white"
                                                    />
                                                </div>

                                                <div className="md:col-span-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Coverage Type</label>
                                                    <select
                                                        name="insuranceType"
                                                        value={insuranceDetails.insuranceType}
                                                        onChange={handleInsuranceChange}
                                                        className="w-full bg-slate-50 px-4 py-3.5 rounded-xl border border-slate-200 outline-none font-bold text-xs text-slate-800 focus:bg-white cursor-pointer"
                                                    >
                                                        <option value="Cashless Mediclaim">Cashless Mediclaim</option>
                                                        <option value="Reimbursement Policy">Reimbursement Policy</option>
                                                        <option value="Corporate Group Cover">Corporate Group Cover</option>
                                                        <option value="Government Scheme (Ayushman / RGHS / CGHS)">Government Scheme (Ayushman / RGHS / CGHS)</option>
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Disclaimer for manual insurance */}
                                            {insuranceDetails.companyName && !hospitalCoveredInfo.isCovered && (
                                                <div className="flex items-start gap-2 text-[11px] font-bold text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                                                    <FaExclamationTriangle className="text-amber-500 mt-0.5 shrink-0" />
                                                    <span>This hospital does not have cashless tie-up with {insuranceDetails.companyName}. Reimbursement receipt will be provided.</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Claim Notice Banner from Summary Response */}
                            {insuranceOverview?.claimNotice && (
                                <div className="mt-4 p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl flex items-start gap-2.5 text-blue-900 text-xs">
                                    <FaInfoCircle className="text-blue-600 mt-0.5 shrink-0" size={14} />
                                    <div>
                                        <p className="font-bold text-[11px] uppercase tracking-wide text-blue-800">Claim Guidance Notice</p>
                                        <p className="text-[11px] font-medium text-blue-700 leading-relaxed mt-0.5">
                                            {insuranceOverview.claimNotice}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* SECTION 4: Payment Method Selector */}
                        {totals.totalPayable > 0 && (
                            <section className="bg-white rounded-3xl p-6 md:p-8 shadow-xs border border-slate-200/80">
                                <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] mb-4 flex items-center gap-3">
                                    <span className="w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-[10px]">04</span>
                                    Payment Method
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod('Online')}
                                        className={`p-4 rounded-2xl border transition-all text-left flex items-center justify-between cursor-pointer ${
                                            paymentMethod === 'Online'
                                                ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20'
                                                : 'bg-white border-slate-200 hover:bg-slate-50'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl">
                                                <FaCreditCard size={16} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-slate-900">Pay Online (Razorpay)</p>
                                                <p className="text-[10px] text-slate-500 mt-0.5">UPI, Cards, NetBanking, Instant Token</p>
                                            </div>
                                        </div>
                                        {paymentMethod === 'Online' && <FaCheckCircle className="text-emerald-600" size={16} />}
                                    </button>

                                    <button
                                        type="button"
                                        disabled={!totals.isCodAvailable}
                                        onClick={() => setPaymentMethod('COD')}
                                        className={`p-4 rounded-2xl border transition-all text-left flex items-center justify-between relative cursor-pointer ${
                                            !totals.isCodAvailable ? 'opacity-40 cursor-not-allowed bg-slate-50 border-slate-200' : ''
                                        } ${
                                            paymentMethod === 'COD'
                                                ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20'
                                                : 'bg-white border-slate-200 hover:bg-slate-50'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 bg-slate-100 text-slate-700 rounded-xl">
                                                <FaMoneyBillWave size={16} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-slate-900">Pay at OPD Desk</p>
                                                <p className="text-[10px] text-slate-500 mt-0.5">
                                                    {totals.isCodAvailable ? 'Pay at clinic reception counter' : 'Counter collection disabled'}
                                                </p>
                                            </div>
                                        </div>
                                        {paymentMethod === 'COD' && <FaCheckCircle className="text-emerald-600" size={16} />}
                                    </button>
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Right Column: Pricing & Coupon */}
                    <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
                        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                            <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                <FaTag className="text-emerald-500" /> Apply OPD Clinic Coupon
                            </h2>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="COUPON CODE"
                                    value={couponCode}
                                    onChange={(e) => {
                                        setCouponCode(e.target.value.toUpperCase());
                                        if (couponError) setCouponError('');
                                    }}
                                    className="flex-1 bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 outline-none font-bold text-xs uppercase focus:ring-2 focus:ring-emerald-500/20"
                                />
                                <button
                                    disabled={isValidatingCoupon || (!couponCode && !appliedCouponCode)}
                                    onClick={() => appliedCouponCode ? removeCoupon() : handleApplyCoupon()}
                                    className={`px-4 rounded-xl text-[10px] font-black uppercase transition-all cursor-pointer ${
                                        appliedCouponCode ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' : 'bg-slate-900 text-white hover:bg-slate-800'
                                    }`}
                                >
                                    {isValidatingCoupon ? <FaSpinner className="animate-spin" /> : appliedCouponCode ? 'Remove' : 'Apply'}
                                </button>
                            </div>
                            {couponError && <p className="text-[10px] font-bold text-rose-500">{couponError}</p>}
                        </div>

                        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                            <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                <FaReceipt className="text-slate-400" />
                                OPD Consultation Bill
                            </h2>

                            <div className="space-y-3 text-xs">
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

                                {totals.discount > 0 && (
                                    <div className="flex justify-between items-center text-emerald-600 font-bold">
                                        <span>Coupon Discount</span>
                                        <span>-₹{totals.discount}</span>
                                    </div>
                                )}

                                {effectiveInsurance.isAttached && (
                                    <div className="flex justify-between items-center text-teal-700 font-bold bg-teal-50/70 p-2.5 rounded-xl border border-teal-200/60">
                                        <span className="flex items-center gap-1.5">
                                            <FaShieldAlt className="text-teal-600 text-xs" />
                                            <span>Insurance Tagged</span>
                                        </span>
                                        <span className="text-[10px] font-black uppercase text-teal-800 truncate max-w-[120px]">
                                            {effectiveInsurance.companyName}
                                        </span>
                                    </div>
                                )}

                                <div className="h-px bg-slate-100 my-2" />

                                <div className="flex justify-between items-end">
                                    <div>
                                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Total Payable</span>
                                        <span className="text-[10px] text-slate-400 font-medium">All clinic taxes included</span>
                                    </div>
                                    <span className="text-3xl font-black text-slate-900">
                                        ₹{Math.round(totals.totalPayable)}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={handleBooking}
                                disabled={isSubmitting || isFetchingSummary}
                                className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer ${
                                    !isSubmitting && !isFetchingSummary
                                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 active:scale-95'
                                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                }`}
                            >
                                {isSubmitting || isFetchingSummary ? (
                                    <FaSpinner className="animate-spin" size={14} />
                                ) : paymentMethod === 'Online' ? (
                                    <>Pay Online ₹{Math.round(totals.totalPayable)} &amp; Issue Token <FaLock size={10} /></>
                                ) : (
                                    <>Issue Token &amp; Pay at OPD Desk <FaCheckCircle size={12} /></>
                                )}
                            </button>
                        </div>
                    </div>

                </div>
            </main>

            {/* OPD SUCCESS MODAL */}
            {bookingSuccessData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 max-w-lg w-full border border-slate-150 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
                        <div className="flex flex-col items-center text-center space-y-2 pb-2">
                            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-xs border border-emerald-100">
                                <FaCheckCircle className="w-9 h-9" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                                Token #{bookingSuccessData.tokenNumber || bookingSuccessData.data?.tokenNumber || '1'} Confirmed!
                            </h3>
                            <p className="text-xs font-semibold text-slate-400">
                                {paymentMethod === 'Online'
                                    ? 'Online payment verified! Please present this token at the OPD cabin.'
                                    : 'Token reserved! Please pay consultation charges at the OPD desk.'}
                            </p>
                            {(bookingSuccessData.bookingId || bookingSuccessData.data?.bookingId) && (
                                <span className="inline-block bg-slate-900 text-[#08B36A] px-3.5 py-1 rounded-xl text-xs font-black uppercase tracking-wider font-mono">
                                    #{bookingSuccessData.bookingId || bookingSuccessData.data?.bookingId}
                                </span>
                            )}
                        </div>

                        <div className="space-y-4 overflow-y-auto py-3 text-xs pr-1">
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

                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70 space-y-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block flex items-center gap-1.5">
                                    <FaUserMd className="text-blue-500" /> Doctor &amp; Cabin Allotment
                                </span>
                                <div className="grid grid-cols-2 gap-y-1.5 text-xs">
                                    <div className="text-slate-500 font-semibold">Doctor:</div>
                                    <div className="text-right font-black text-slate-800">Dr. {booking.doctor?.name}</div>
                                    <div className="text-slate-500 font-semibold">Cabin / Room:</div>
                                    <div className="text-right font-bold text-emerald-600">
                                        {bookingSuccessData.data?.opdRoomNumber || cabinRoomLabel}
                                    </div>
                                    <div className="text-slate-500 font-semibold">Slot Time:</div>
                                    <div className="text-right font-bold text-slate-800">{booking.appointmentTime || booking.selectedSlot?.time || 'Queue Token'}</div>
                                </div>
                            </div>

                            {/* Insurance Summary in Modal */}
                            {effectiveInsurance.isAttached && (
                                <div className="bg-teal-50/50 p-4 rounded-2xl border border-teal-200/60 space-y-2">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-teal-800 block flex items-center gap-1.5">
                                        <FaShieldAlt className="text-teal-600" /> Insurance Attachment
                                    </span>
                                    <div className="grid grid-cols-2 gap-y-1.5 text-xs">
                                        <div className="text-slate-500 font-semibold">Company:</div>
                                        <div className="text-right font-bold text-slate-800">{effectiveInsurance.companyName}</div>
                                        <div className="text-slate-500 font-semibold">Policy No:</div>
                                        <div className="text-right font-bold text-slate-800 font-mono">{effectiveInsurance.insuranceNumber}</div>
                                        <div className="text-slate-500 font-semibold">Status:</div>
                                        <div className="text-right font-bold text-amber-600">Pending Desk Approval</div>
                                    </div>
                                </div>
                            )}

                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70 space-y-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block flex items-center gap-1.5">
                                    <FaReceipt className="text-emerald-500" /> Settlement Summary
                                </span>
                                <div className="grid grid-cols-2 gap-y-1.5 text-xs">
                                    <div className="text-slate-500 font-semibold">Payment Method:</div>
                                    <div className="text-right font-black uppercase text-slate-800">
                                        {paymentMethod === 'Online' ? 'Online Razorpay' : 'Pay at Clinic Desk'}
                                    </div>
                                    <div className="text-slate-500 font-semibold">Status:</div>
                                    <div className="text-right font-bold uppercase text-emerald-600">
                                        {bookingSuccessData.status || (paymentMethod === 'Online' ? 'Confirmed' : 'Pending')}
                                    </div>
                                    <div className="text-slate-900 font-black text-sm pt-2 border-t border-slate-200">Total Paid:</div>
                                    <div className="text-right font-black text-[#08B36A] text-base pt-2 border-t border-slate-200">
                                        ₹{Math.round(totals.totalPayable)}
                                    </div>
                                </div>
                            </div>
                        </div>

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