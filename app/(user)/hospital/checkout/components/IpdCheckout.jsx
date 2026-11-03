'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
    FaArrowLeft, FaHospital, FaProcedures, FaCalendarDay,
    FaShieldAlt, FaUserMd, FaConciergeBell, FaUser, FaTag,
    FaReceipt, FaCreditCard, FaMoneyBillWave, FaCheckCircle,
    FaLock, FaSpinner, FaUpload, FaFilePdf, FaImage, FaTimes,
    FaInfoCircle, FaExclamationTriangle, FaExternalLinkAlt, FaEye
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
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

export default function IpdCheckout() {
    const router = useRouter();
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5002';

    const [booking, setBooking] = useState(null);
    const [hospitalInfo, setHospitalInfo] = useState(null);
    const [isReady, setIsReady] = useState(false);

    // Profile & Family States
    const [userProfile, setUserProfile] = useState(null);
    const [familyMembers, setFamilyMembers] = useState([]);
    const [selectedMemberId, setSelectedMemberId] = useState('self');

    // Saved Insurance State (from GET /api/auth/user/my-insurance)
    const [savedInsurance, setSavedInsurance] = useState(null);
    const [applySavedInsurance, setApplySavedInsurance] = useState(false);
    const [isLoadingInsurance, setIsLoadingInsurance] = useState(true);

    // IPD Add-ons & Services
    const [servicesCatalog, setServicesCatalog] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [selectedServices, setSelectedServices] = useState([]);
    const [triageLevel, setTriageLevel] = useState('Routine');

    // Patient & Insurance Form State
    const [patientDetails, setPatientDetails] = useState({
        fullName: '',
        dob: '',
        phoneNumber: '',
        gender: 'Male',
        relation: 'Self',
        address: '',
        city: '',
        pincode: '',
        haveInsurance: 'No',
        insuranceNo: '',
        companyName: '',
        insuranceType: 'Cashless',
        insuranceDocument: null,
        insuranceDocumentFront: null,
        insuranceDocumentBack: null,
        bookingReason: '',
        bloodGroup: ''
    });

    // Payment States - DEFAULT TO ONLINE
    const [paymentMethod, setPaymentMethod] = useState('Online');

    // Coupon States
    const [couponCode, setCouponCode] = useState('');
    const [appliedCouponCode, setAppliedCouponCode] = useState('');
    const [couponError, setCouponError] = useState('');
    const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

    // Pricing & Server Summary States (Category 3.2)
    const [serverPricing, setServerPricing] = useState(null);
    const [insuranceGuidance, setInsuranceGuidance] = useState(null);
    const [isFetchingSummary, setIsFetchingSummary] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [bookingSuccessData, setBookingSuccessData] = useState(null);

    // Duplicate verification lock
    const isVerifyingRef = useRef(false);

    // Helper: Safely resolve URL whether relative path or raw File
    const getDocumentUrl = (pathOrFile) => {
        if (!pathOrFile) return '';
        if (pathOrFile instanceof File) {
            return URL.createObjectURL(pathOrFile);
        }
        if (typeof pathOrFile === 'string') {
            if (pathOrFile.startsWith('http://') || pathOrFile.startsWith('https://')) return pathOrFile;
            const cleanBase = BACKEND_URL.endsWith('/') ? BACKEND_URL.slice(0, -1) : BACKEND_URL;
            const cleanPath = pathOrFile.startsWith('/') ? pathOrFile : `/${pathOrFile}`;
            return `${cleanBase}${cleanPath}`;
        }
        return '';
    };

    // Clean Date Helper
    const getCleanDate = (dateVal) => {
        if (!dateVal) return new Date().toISOString().split('T')[0];
        if (typeof dateVal === 'string' && dateVal.includes('T')) return dateVal.split('T')[0];
        return String(dateVal);
    };

    // Mandatory Date Range Validator
    const ensureValidDateRange = (sDate, eDate) => {
        let start = getCleanDate(sDate);
        let end = getCleanDate(eDate);

        const startObj = new Date(start);
        const endObj = new Date(end);

        if (isNaN(endObj.getTime()) || endObj <= startObj) {
            const nextDay = new Date(startObj);
            nextDay.setDate(nextDay.getDate() + 1);
            end = nextDay.toISOString().split('T')[0];
        }

        return { startDate: start, endDate: end };
    };

    // Strict Numeric Age Calculation
    const calculateAge = (dob) => {
        if (!dob) return 25;
        const birthYear = new Date(dob).getFullYear();
        if (isNaN(birthYear)) return 25;
        const currentYear = new Date().getFullYear();
        return Math.max(1, currentYear - birthYear);
    };

    const getResolvedServiceIds = (srvList, catalogList = servicesCatalog) => {
        return (srvList || []).map(s => {
            if (typeof s === 'string') return s;
            if (s._id || s.serviceId) return s._id || s.serviceId;
            const match = (catalogList || []).find(c => 
                c.serviceName?.trim().toLowerCase() === s.serviceName?.trim().toLowerCase()
            );
            return match?._id;
        }).filter(Boolean);
    };

    const handleBack = () => {
        if (!bookingSuccessData) {
            sessionStorage.removeItem('activeBooking');
            sessionStorage.removeItem('lastActiveCheckoutType');
        }
        router.back();
    };

    useEffect(() => {
        const handlePopState = () => {
            if (!bookingSuccessData) {
                sessionStorage.removeItem('activeBooking');
                sessionStorage.removeItem('lastActiveCheckoutType');
            }
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [bookingSuccessData]);

    // Initialize Booking Session
    useEffect(() => {
        const initData = async () => {
            const token = localStorage.getItem('userToken');
            if (!token) {
                CostoumPopup('Please Login To Continue', 'warning', 4000);
                router.push('/hospital');
                return;
            }

            const ipdRaw = sessionStorage.getItem('activeBooking');
            if (!ipdRaw) {
                router.push('/hospital');
                return;
            }

            let parsedIpd = null;
            try {
                parsedIpd = JSON.parse(ipdRaw);
                const validatedDates = ensureValidDateRange(parsedIpd.startDate, parsedIpd.endDate);
                parsedIpd.startDate = validatedDates.startDate;
                parsedIpd.endDate = validatedDates.endDate;

                setBooking(parsedIpd);
            } catch (e) {
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
            } catch (err) {}

            // Fetch Saved Health Insurance (Category 2.2)
            try {
                setIsLoadingInsurance(true);
                if (typeof UserAPI.getMyInsurance === 'function') {
                    const myInsRes = await UserAPI.getMyInsurance();
                    if (myInsRes?.success && myInsRes.data?.hasInsurance) {
                        const insData = myInsRes.data;
                        setSavedInsurance(insData);
                        setApplySavedInsurance(true);
                    } else {
                        setSavedInsurance(null);
                        setApplySavedInsurance(false);
                    }
                }
            } catch (err) {
            } finally {
                setIsLoadingInsurance(false);
            }

            // Fetch Family Members
            try {
                const famRes = await UserAPI.getFamilyMembers();
                if (famRes?.success) setFamilyMembers(famRes.data || []);
            } catch (err) {}

            // Fetch Hospital Details
            if (parsedIpd.hospitalId) {
                try {
                    if (typeof UserAPI.getHospitalDetail === 'function') {
                        const hRes = await UserAPI.getHospitalDetail(parsedIpd.hospitalId);
                        if (hRes?.success && hRes.data?.hospital) {
                            setHospitalInfo(hRes.data.hospital);
                        }
                    }
                } catch (e) {}
            }

            // IPD Doctor, Services & Catalog Resolution
            const doc = parsedIpd.doctorDetails || null;
            const rawSrv = Array.isArray(parsedIpd.specialServices) ? parsedIpd.specialServices : [];
            const trg = parsedIpd.triageLevel || 'Routine';

            setSelectedDoctor(doc);
            setTriageLevel(trg);

            if (parsedIpd.hospitalId) {
                try {
                    const srvRes = await UserAPI.getHospitalServices(parsedIpd.hospitalId);
                    if (srvRes?.success && Array.isArray(srvRes.data)) {
                        const catalog = srvRes.data;
                        setServicesCatalog(catalog);

                        const enrichedServices = rawSrv.map(item => {
                            if (item._id || item.serviceId) return item;
                            const match = catalog.find(c => 
                                c.serviceName?.trim().toLowerCase() === item.serviceName?.trim().toLowerCase()
                            );
                            return match ? { ...item, _id: match._id, serviceId: match._id, price: match.price || item.price } : item;
                        });

                        setSelectedServices(enrichedServices);
                        executeCheckoutSummary(parsedIpd, enrichedServices, '', catalog);
                        setIsReady(true);
                        return;
                    }
                } catch (e) {}
            }

            setSelectedServices(rawSrv);
            executeCheckoutSummary(parsedIpd, rawSrv, '', []);
            setIsReady(true);
        };

        initData();
    }, [router]);

    // Fetch IPD Checkout Summary & Cashless Guidance (Category 3.2: POST /user/hospital/checkout-summary)
    const executeCheckoutSummary = async (activeBooking, srvList, codeToApply, catalogList = servicesCatalog) => {
        if (!activeBooking?.hospitalId || !activeBooking?.bedId) return;

        try {
            setIsFetchingSummary(true);
            setCouponError('');

            const serviceIds = getResolvedServiceIds(srvList, catalogList);
            const { startDate: cleanStart, endDate: cleanEnd } = ensureValidDateRange(activeBooking.startDate, activeBooking.endDate);

            const payload = {
                hospitalId: String(activeBooking.hospitalId),
                bedId: String(activeBooking.bedId),
                startDate: cleanStart,
                endDate: cleanEnd,
                specialServices: serviceIds,
                couponCode: codeToApply || undefined
            };

            const res = await UserAPI.getHospitalCheckoutSummary(payload);

            if (res?.success && res.data) {
                setServerPricing(res.data);
                if (res.data.insuranceGuidance) {
                    setInsuranceGuidance(res.data.insuranceGuidance);
                }
                if (res.data.isCodAvailable === false && paymentMethod === 'COD') {
                    setPaymentMethod('Online');
                }
            } else if (codeToApply) {
                setCouponError(res?.message || 'Invalid coupon code');
                setAppliedCouponCode('');
            }
        } catch (error) {
            if (codeToApply) setCouponError('Coupon validation failed');
        } finally {
            setIsFetchingSummary(false);
            setIsValidatingCoupon(false);
        }
    };

    const fetchSummary = useCallback(async (codeToApply = appliedCouponCode) => {
        if (!isReady || !booking) return;
        executeCheckoutSummary(booking, selectedServices, codeToApply, servicesCatalog);
    }, [isReady, booking, selectedServices, appliedCouponCode, servicesCatalog]);

    useEffect(() => {
        if (isReady && booking) {
            fetchSummary(appliedCouponCode);
        }
    }, [isReady, selectedServices, appliedCouponCode, fetchSummary]);

    // Family Member Selection Handler
    const handleMemberSelect = (member) => {
        if (member === 'self') {
            setSelectedMemberId('self');
            setPatientDetails(prev => ({
                ...prev,
                fullName: userProfile?.name || userProfile?.fullName || '',
                phoneNumber: userProfile?.phone || userProfile?.phoneNumber || '',
                dob: userProfile?.dob ? userProfile.dob.split('T')[0] : '',
                gender: userProfile?.gender || 'Male',
                relation: 'Self',
                address: '', city: '', pincode: '',
                bookingReason: '', bloodGroup: ''
            }));
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

            setApplySavedInsurance(false);

            setPatientDetails(prev => ({
                ...prev,
                fullName: member.memberName || '',
                phoneNumber: member.phone || '',
                dob: formattedDob,
                gender: member.gender || 'Male',
                relation: member.relation || 'Family Member',
                haveInsurance: member.hasInsurance ? 'Yes' : 'No',
                insuranceNo: member.insuranceNo || '',
                companyName: member.insuranceId?.provider || member.insuranceId?.insuranceName || '',
                insuranceType: 'Cashless',
                address: '', city: '', pincode: '',
                bookingReason: '',
                bloodGroup: member.bloodGroup || ''
            }));
        }
    };

    // Computed Pricing Totals
    const totals = useMemo(() => {
        if (serverPricing) {
            const bedStayTotal = Number(serverPricing.baseFee ?? (serverPricing.pricePerDay * serverPricing.days) ?? 0);
            const servicesTotal = Number(serverPricing.serviceCharge ?? serverPricing.specialServicesCharges ?? 0);
            const discount = Number(serverPricing.discount ?? serverPricing.appliedCoupon?.discountAmount ?? 0);
            const subtotal = Number(serverPricing.subtotal ?? (bedStayTotal + servicesTotal));
            const totalPayable = Number(serverPricing.totalPayable ?? Math.max(0, subtotal - discount));

            return {
                bedStayTotal,
                servicesTotal,
                discount,
                subtotal,
                totalPayable,
                stayDuration: Math.max(1, Number(serverPricing.days ?? booking?.totalDays ?? 1)),
                pricePerDay: Number(serverPricing.pricePerDay ?? booking?.pricePerDay ?? 0),
                isCodAvailable: serverPricing.isCodAvailable !== false,
                specialServicesBreakdown: Array.isArray(serverPricing.specialServices) ? serverPricing.specialServices : []
            };
        }

        const stayDays = Math.max(1, Number(booking?.totalDays || 1));
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
    }, [serverPricing, booking, selectedServices]);

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

    const handleFileChange = (e, field) => {
        if (e.target.files && e.target.files.length > 0) {
            setPatientDetails(prev => ({
                ...prev,
                [field]: e.target.files[0]
            }));
        }
    };

    // Razorpay Online Payment Flow
    const launchRazorpay = async (orderRes) => {
        try {
            const isScriptLoaded = await loadRazorpayScript();
            if (!isScriptLoaded) {
                CostoumPopup('Failed to load Razorpay payment gateway.', 'error', 4000);
                setIsSubmitting(false);
                return;
            }

            const rzpOrder = orderRes.razorpayOrder || orderRes;
            let keyId = 
                rzpOrder.key_id || 
                rzpOrder.keyId || 
                rzpOrder.key || 
                orderRes.key_id || 
                process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

            if (typeof keyId === 'string' && keyId.startsWith('zp_')) {
                keyId = 'r' + keyId;
            }

            if (!keyId) {
                CostoumPopup('Razorpay key configuration is missing. Contact administration.', 'error', 4000);
                setIsSubmitting(false);
                return;
            }

            const rawAmount = rzpOrder.amount || orderRes.amount || Math.round(totals.totalPayable * 100);
            const amountInPaise = Number(rawAmount) <= totals.totalPayable 
                ? Math.round(Number(rawAmount) * 100) 
                : Math.round(Number(rawAmount));

            const razorpayOrderId = rzpOrder.razorpayOrderId || rzpOrder.orderId || orderRes.razorpayOrderId;

            const targetMongoId = 
                orderRes.appointmentId ||
                orderRes.data?.appointmentId ||
                orderRes.data?._id ||
                orderRes._id;

            const targetBookingId = orderRes.bookingId || orderRes.data?.bookingId || 'HKH-IPD-CONFIRMED';

            isVerifyingRef.current = false;

            const options = {
                key: keyId,
                amount: amountInPaise,
                currency: rzpOrder.currency || 'INR',
                name: 'Health Kangaroo Hospital Network',
                description: `Bed Admission at ${booking.hospitalName || 'Hospital'} (${booking.wardName} - Bed #${booking.bedNumber})`,
                order_id: razorpayOrderId || undefined,
                prefill: {
                    name: patientDetails.fullName || '',
                    contact: patientDetails.phoneNumber || ''
                },
                theme: { color: '#08B36A' },
                modal: {
                    ondismiss: () => {
                        setIsSubmitting(false);
                        CostoumPopup('Payment cancelled. Your admission reservation is held.', 'warning', 3000);
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
                            sessionStorage.removeItem('activeBooking');
                            sessionStorage.removeItem('lastActiveCheckoutType');
                            setBookingSuccessData({
                                ...orderRes,
                                ...(verificationRes.data || verificationRes),
                                bookingId: verificationRes.bookingId || verificationRes.data?.bookingId || targetBookingId,
                                status: 'Confirmed',
                                paymentStatus: 'Paid'
                            });
                            CostoumPopup('Online payment verified and admission confirmed!', 'success', 3000);
                        } else {
                            CostoumPopup(verificationRes?.message || 'Payment verification failed', 'error', 4000);
                        }
                    } catch (e) {
                        if (e?.response?.data?.message?.includes('Paid') || e?.response?.data?.message?.includes('already')) {
                            sessionStorage.removeItem('activeBooking');
                            sessionStorage.removeItem('lastActiveCheckoutType');
                            setBookingSuccessData({
                                ...orderRes,
                                bookingId: targetBookingId,
                                status: 'Confirmed',
                                paymentStatus: 'Paid'
                            });
                            CostoumPopup('Payment verified successfully!', 'success', 3000);
                        } else {
                            CostoumPopup(e?.response?.data?.message || 'Payment verification error occurred', 'error', 4000);
                        }
                    } finally {
                        setIsSubmitting(false);
                    }
                }
            };

            const rzpInstance = new window.Razorpay(options);
            rzpInstance.on('payment.failed', function (response) {
                CostoumPopup(response.error?.description || 'Payment failed. Please retry.', 'error', 4000);
                setIsSubmitting(false);
            });
            rzpInstance.open();

        } catch (err) {
            CostoumPopup('Could not launch payment gateway. Please try again.', 'error', 4000);
            setIsSubmitting(false);
        }
    };

    // =========================================================================
    // Final IPD Booking Submit (Category 3.3: POST /user/hospital/book)
    // =========================================================================
    const handleAdmissionBooking = async () => {
        if (!patientDetails.fullName.trim() || !patientDetails.phoneNumber.trim()) {
            CostoumPopup('Please provide patient full name and contact phone number', 'warning', 3000);
            return;
        }

        const { startDate: cleanStart, endDate: cleanEnd } = ensureValidDateRange(booking.startDate, booking.endDate);
        if (new Date(cleanEnd) <= new Date(cleanStart)) {
            CostoumPopup('Check-out date must be after check-in date. Minimum hospital admission stay is 1 day.', 'error', 4000);
            return;
        }

        // Smart Insurance Logic (Case A vs Case B)
        const isUsingSavedInsurance = Boolean(applySavedInsurance && savedInsurance?.hasInsurance && selectedMemberId === 'self');
        const isUsingManualInsurance = !isUsingSavedInsurance && patientDetails.haveInsurance === 'Yes';
        const isInsured = isUsingSavedInsurance || isUsingManualInsurance;

        if (isUsingManualInsurance) {
            const hasDualCards = patientDetails.insuranceDocumentFront || patientDetails.insuranceDocumentBack;
            const hasSingleDoc = patientDetails.insuranceDocument;

            if (!hasDualCards && !hasSingleDoc) {
                CostoumPopup('Please upload insurance card (Front/Back) or a policy document.', 'warning', 4000);
                return;
            }
        }

        setIsSubmitting(true);

        try {
            const isZeroTotal = totals.totalPayable === 0;
            const finalPaymentMethod = isZeroTotal ? 'COD' : paymentMethod;

            const fd = new FormData();
            fd.append('hospitalId', String(booking.hospitalId));
            fd.append('bedId', String(booking.bedId));
            fd.append('startDate', cleanStart);
            fd.append('endDate', cleanEnd);
            fd.append('bookingType', 'Admission');
            fd.append('triageLevel', triageLevel || 'Routine');
            fd.append('paymentMethod', finalPaymentMethod);
            fd.append('bookingReason', patientDetails.bookingReason?.trim() || 'General Bed Admission');

            // Explicit hasInsurance flag (Rule 4: Send false explicitly for self-pay)
            fd.append('hasInsurance', String(isInsured));

            // Special Services
            const resolvedIds = getResolvedServiceIds(selectedServices, servicesCatalog);
            if (resolvedIds.length > 0) {
                fd.append('specialServices', JSON.stringify(resolvedIds));
            }

            // Optional Doctor Assignment
            const targetDocId = selectedDoctor?._id || booking?.doctorId;
            if (targetDocId && targetDocId !== 'null' && targetDocId !== 'undefined') {
                fd.append('doctorId', String(targetDocId));
            }

            if (appliedCouponCode) {
                fd.append('couponCode', appliedCouponCode);
            }

            // Patient Array
            const calculatedPatientAge = calculateAge(patientDetails.dob);
            const patientArray = [{
                patientName: patientDetails.fullName.trim(),
                patientAge: Number(calculatedPatientAge),
                gender: patientDetails.gender || 'Male',
                relation: selectedMemberId === 'self' ? 'Self' : (patientDetails.relation || 'Family Member'),
                isMainUser: selectedMemberId === 'self',
                ...(patientDetails.bloodGroup && { bloodGroup: patientDetails.bloodGroup })
            }];
            fd.append('patients', JSON.stringify(patientArray));

            // Pricing Snapshot
            const pricingSnapshot = {
                baseFee: Number(totals.bedStayTotal) || 0,
                visitCharges: 0,
                extraCharges: Number(totals.servicesTotal) || 0,
                discountAmount: Number(totals.discount) || 0,
                subtotal: Number(totals.subtotal) || 0,
                totalPayable: Number(totals.totalPayable) || 0
            };
            fd.append('pricing', JSON.stringify(pricingSnapshot));

            // Manual Insurance Details & Files (Multer strict keys only)
            if (isInsured) {
                const company = isUsingSavedInsurance ? (savedInsurance.companyName || '') : (patientDetails.companyName?.trim() || '');
                const num = isUsingSavedInsurance ? (savedInsurance.insuranceNumber || '') : (patientDetails.insuranceNo?.trim() || '');
                const type = isUsingSavedInsurance ? (savedInsurance.insuranceType || 'Cashless') : (patientDetails.insuranceType || 'Cashless');

                fd.append('companyName', company);
                fd.append('insuranceNumber', num);
                fd.append('insuranceType', type);

                // ✅ EXACT MULTER KEYS ONLY
                if (patientDetails.insuranceDocumentFront instanceof File) {
                    fd.append('insuranceDocumentFront', patientDetails.insuranceDocumentFront);
                }
                if (patientDetails.insuranceDocumentBack instanceof File) {
                    fd.append('insuranceDocumentBack', patientDetails.insuranceDocumentBack);
                }
                if (patientDetails.insuranceDocument instanceof File) {
                    fd.append('insuranceDocument', patientDetails.insuranceDocument);
                }
            }

            // API Call via UserAPI
            const res = await UserAPI.bookHospitalBed(fd);

            if (!res?.success) {
                CostoumPopup(res?.message || 'Failed to initiate hospital admission', 'error', 4000);
                setIsSubmitting(false);
                return;
            }

            const isOnline = Boolean(res.isOnlinePayment ?? (finalPaymentMethod === 'Online' && !isZeroTotal));

            if (!isOnline) {
                sessionStorage.removeItem('activeBooking');
                sessionStorage.removeItem('lastActiveCheckoutType');
                setBookingSuccessData(res.data || {
                    bookingId: res.bookingId || res.data?.bookingId,
                    status: res.status || 'Hospital-Pending',
                    paymentStatus: 'Pending at Admission Desk',
                    bedNumber: res.bedNumber || booking.bedNumber,
                    wardName: res.wardName || booking.wardName,
                    totalPayable: totals.totalPayable,
                    doctorName: res.doctorName || (selectedDoctor ? `Dr. ${selectedDoctor.name}` : 'Unassigned / Optional'),
                    specialServicesIncluded: res.specialServicesIncluded || []
                });
                setIsSubmitting(false);
                return;
            }

            // Launch Online Razorpay Payment
            await launchRazorpay(res);

        } catch (error) {
            CostoumPopup(error?.response?.data?.message || error?.message || 'An error occurred during booking.', 'error', 4000);
            setIsSubmitting(false);
        }
    };

    if (!booking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <FaSpinner className="w-8 h-8 text-[#08B36A] animate-spin" />
            </div>
        );
    }

    const currentPatientAge = calculateAge(patientDetails.dob);

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20 font-sans antialiased text-slate-900">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
                    <button onClick={handleBack} className="flex items-center gap-2 text-slate-600 font-bold text-xs uppercase tracking-widest hover:text-[#08B36A] cursor-pointer transition-colors">
                        <FaArrowLeft /> Back
                    </button>
                    <div className="text-center">
                        <h1 className="text-sm md:text-base font-black text-slate-900 tracking-tight uppercase">
                            Hospital Inpatient Admission Checkout
                        </h1>
                        <span className="text-[10px] font-black uppercase text-[#08B36A] tracking-wider">
                            IPD Ward Stay &amp; Medical Facilities
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-[#08B36A] font-black text-xs uppercase tracking-widest">
                        <FaShieldAlt /> 256-Bit Encrypted
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 md:px-6 mt-6 md:mt-8">
                <div className="grid lg:grid-cols-12 gap-8 items-start">

                    {/* Left Column */}
                    <div className="lg:col-span-8 space-y-6">

                        {/* SECTION 1: Admission & Accommodation Overview */}
                        <section className="bg-white rounded-3xl p-6 md:p-8 shadow-xs border border-slate-200/80">
                            <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                                <span className="w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-[10px]">01</span>
                                Admission &amp; Accommodation Overview
                            </h2>

                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
                                        <div className="flex items-center gap-2 mb-1.5 text-slate-400">
                                            <FaHospital size={13} />
                                            <span className="text-[10px] font-black uppercase tracking-wider">Hospital Facility</span>
                                        </div>
                                        <p className="font-bold text-slate-900 text-sm leading-tight">{booking.hospitalName || 'Main Hospital'}</p>
                                    </div>

                                    <div className="bg-emerald-50/60 p-4 rounded-2xl border border-[#08B36A]/20">
                                        <div className="flex items-center gap-2 mb-1.5 text-[#08B36A]">
                                            <FaProcedures size={13} />
                                            <span className="text-[10px] font-black uppercase tracking-wider">Ward &amp; Bed Allotted</span>
                                        </div>
                                        <p className="font-bold text-emerald-950 text-sm leading-tight">
                                            {booking.wardName} &bull; Bed #{booking.bedNumber}
                                        </p>
                                        <p className="text-[10px] font-bold text-[#08B36A] mt-0.5">
                                            ₹{booking.pricePerDay}/Day &times; {totals.stayDuration} Days Stay
                                        </p>
                                    </div>

                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
                                        <div className="flex items-center gap-2 mb-1.5 text-slate-400">
                                            <FaCalendarDay size={13} />
                                            <span className="text-[10px] font-black uppercase tracking-wider">Stay Dates</span>
                                        </div>
                                        <p className="font-bold text-slate-900 text-xs leading-tight">
                                            {getCleanDate(booking.startDate)} &rarr; {getCleanDate(booking.endDate)}
                                        </p>
                                        <span className="text-[10px] font-black uppercase text-[#08B36A] block mt-1">
                                            {totals.stayDuration} Days Reserved Stay
                                        </span>
                                    </div>
                                </div>

                                {/* Attending Doctor & Services Summary */}
                                {(selectedDoctor || selectedServices.length > 0) && (
                                    <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                        {selectedDoctor && (
                                            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50/40 border border-[#08B36A]/20">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="p-2 bg-[#08B36A] text-white rounded-xl">
                                                        <FaUserMd size={14} />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-slate-900">Dr. {selectedDoctor.name}</p>
                                                        <p className="text-[10px] text-[#08B36A] font-bold">{selectedDoctor.speciality || 'Attending Specialist'}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-[9px] font-black uppercase bg-[#08B36A]/10 text-[#08B36A] px-2 py-0.5 rounded-md border border-[#08B36A]/20 block">
                                                        FREE
                                                    </span>
                                                    <span className="text-[9px] text-slate-400 font-semibold">Included</span>
                                                </div>
                                            </div>
                                        )}

                                        {selectedServices.length > 0 && (
                                            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-1">
                                                <span className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1">
                                                    <FaConciergeBell className="text-[#08B36A]" /> Special Add-on Services ({selectedServices.length})
                                                </span>
                                                <p className="font-bold text-slate-800 truncate">
                                                    {selectedServices.map(s => s.serviceName).join(', ')}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* SECTION 2: Patient Demographics & Health Insurance */}
                        <section className="bg-white rounded-3xl p-6 md:p-8 shadow-xs border border-slate-200/80">
                            <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                                <span className="w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-[10px]">02</span>
                                Patient Demographics &amp; Health Insurance
                            </h2>

                            {/* Family Selector */}
                            <div className="flex gap-4 overflow-x-auto pb-4 mb-4 scrollbar-none">
                                <div onClick={() => handleMemberSelect('self')} className="shrink-0 cursor-pointer flex flex-col items-center gap-2">
                                    <div className={`w-14 h-14 rounded-full border-2 flex items-center justify-center bg-slate-50 transition-all ${selectedMemberId === 'self' ? 'border-[#08B36A] bg-emerald-50 ring-2 ring-[#08B36A]/20' : 'border-slate-200'}`}>
                                        <FaUser className={selectedMemberId === 'self' ? 'text-[#08B36A] text-base' : 'text-slate-300 text-base'} />
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-600">Self</span>
                                </div>

                                {familyMembers.map((member) => (
                                    <div key={member._id} onClick={() => handleMemberSelect(member)} className="shrink-0 cursor-pointer flex flex-col items-center gap-2">
                                        <div className={`w-14 h-14 rounded-full border-2 overflow-hidden bg-slate-50 transition-all ${selectedMemberId === member._id ? 'border-[#08B36A] ring-2 ring-[#08B36A]/20' : 'border-slate-200'}`}>
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
                                    <input type="text" name="fullName" value={patientDetails.fullName} onChange={handleInputChange} placeholder="Full name as per official ID" className="w-full bg-slate-50 px-4 py-3.5 rounded-xl border border-slate-200 outline-none font-bold text-xs text-slate-800 focus:ring-2 focus:ring-[#08B36A]/20 focus:bg-white" />
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
                                            <button key={g} type="button" onClick={() => setPatientDetails({ ...patientDetails, gender: g })} className={`flex-1 py-3 rounded-xl border font-black text-xs transition-all cursor-pointer ${patientDetails.gender === g ? 'border-[#08B36A] bg-emerald-50 text-[#08B36A]' : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'}`}>{g}</button>
                                        ))}
                                    </div>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Primary Reason for Admission / Symptoms</label>
                                    <input type="text" name="bookingReason" value={patientDetails.bookingReason} onChange={handleInputChange} placeholder="e.g. Severe fever, inpatient surgery, observation..." className="w-full bg-slate-50 px-4 py-3.5 rounded-xl border border-slate-200 outline-none font-bold text-xs text-slate-800 focus:bg-white" />
                                </div>

                                {/* Health Insurance Section */}
                                <div className="md:col-span-2 pt-3 border-t border-slate-100">
                                    {selectedMemberId === 'self' && savedInsurance?.hasInsurance ? (
                                        <div className="bg-emerald-50/60 p-5 rounded-2xl border border-emerald-200 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-sm">
                                                    <FaShieldAlt className="text-[#08B36A] text-base" />
                                                    <span>Saved Insurance Policy (Profile Auto-Inherit)</span>
                                                </div>

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

                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-slate-700 bg-white/70 p-3 rounded-xl border border-emerald-100">
                                                <div>
                                                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Provider</span>
                                                    <span className="font-black text-slate-900">{savedInsurance.companyName}</span>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Policy Number</span>
                                                    <span className="font-mono font-bold text-slate-900">{savedInsurance.insuranceNumber}</span>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Claim Type</span>
                                                    <span className="font-bold text-slate-900">{savedInsurance.insuranceType || 'Cashless'}</span>
                                                </div>
                                            </div>

                                            {/* 📸 SHOW PRE-SAVED INSURANCE CARD PHOTOS */}
                                            {applySavedInsurance && (savedInsurance.insuranceDocumentFront || savedInsurance.insuranceDocumentBack || savedInsurance.insuranceDocument) && (
                                                <div className="bg-white/80 p-3.5 rounded-xl border border-emerald-150 space-y-2">
                                                    <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider flex items-center gap-1.5">
                                                        <FaImage className="text-[#08B36A]" /> Verified Policy Cards from Profile
                                                    </span>
                                                    
                                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                                                        {/* Front Card Thumbnail */}
                                                        {savedInsurance.insuranceDocumentFront && (
                                                            <div className="space-y-1">
                                                                <span className="text-[9px] font-bold text-slate-400 uppercase block">Card Front</span>
                                                                <div className="relative group h-24 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                                                                    <img 
                                                                        src={getDocumentUrl(savedInsurance.insuranceDocumentFront)} 
                                                                        alt="Card Front" 
                                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                                                    />
                                                                    <a 
                                                                        href={getDocumentUrl(savedInsurance.insuranceDocumentFront)} 
                                                                        target="_blank" 
                                                                        rel="noopener noreferrer" 
                                                                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity"
                                                                    >
                                                                        <FaEye size={14} />
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Back Card Thumbnail */}
                                                        {savedInsurance.insuranceDocumentBack && (
                                                            <div className="space-y-1">
                                                                <span className="text-[9px] font-bold text-slate-400 uppercase block">Card Back</span>
                                                                <div className="relative group h-24 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                                                                    <img 
                                                                        src={getDocumentUrl(savedInsurance.insuranceDocumentBack)} 
                                                                        alt="Card Back" 
                                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                                                    />
                                                                    <a 
                                                                        href={getDocumentUrl(savedInsurance.insuranceDocumentBack)} 
                                                                        target="_blank" 
                                                                        rel="noopener noreferrer" 
                                                                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity"
                                                                    >
                                                                        <FaEye size={14} />
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* PDF Document Link */}
                                                        {savedInsurance.insuranceDocument && (
                                                            <div className="space-y-1 col-span-2 sm:col-span-1">
                                                                <span className="text-[9px] font-bold text-slate-400 uppercase block">Policy PDF</span>
                                                                <a 
                                                                    href={getDocumentUrl(savedInsurance.insuranceDocument)} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer" 
                                                                    className="h-24 rounded-lg border border-blue-200 bg-blue-50/50 flex flex-col items-center justify-center gap-1 text-blue-700 hover:bg-blue-100/50 transition-colors p-2 text-center"
                                                                >
                                                                    <FaFilePdf size={20} className="text-rose-500" />
                                                                    <span className="text-[10px] font-bold">View PDF</span>
                                                                </a>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Category 3.2 Real-time Cashless Guidance Banner */}
                                            {applySavedInsurance && insuranceGuidance && (
                                                insuranceGuidance.isAcceptedByThisHospital ? (
                                                    <div className="flex items-center gap-2 text-[11px] font-bold text-[#08B36A] bg-emerald-100/60 px-3 py-2 rounded-xl">
                                                        <FaCheckCircle className="text-[#08B36A] text-sm shrink-0" />
                                                        <span>{insuranceGuidance.policyMessage || 'Cashless TPA claim is confirmed available at this hospital.'}</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-start gap-2 text-[11px] font-bold text-amber-900 bg-amber-50 p-3 rounded-xl border border-amber-200">
                                                        <FaExclamationTriangle className="text-amber-500 mt-0.5 shrink-0 text-sm" />
                                                        <span>
                                                            This hospital does not offer cashless claims for {insuranceGuidance.patientInsuranceCompany || savedInsurance.companyName}. You can pay deposit now and claim reimbursement later.
                                                        </span>
                                                    </div>
                                                )
                                            )}

                                            <p className="text-[10px] text-slate-500 font-medium">
                                                {applySavedInsurance
                                                    ? '✓ Pre-saved policy and card photos will automatically inherit to this case.'
                                                    : 'Self-Pay chosen. Turn on the switch above to apply your health policy.'}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">
                                                    Do you wish to claim Health Insurance / TPA?
                                                </label>
                                                <div className="flex gap-6">
                                                    {['Yes', 'No'].map((opt) => (
                                                        <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                                            <input 
                                                                type="radio" 
                                                                checked={patientDetails.haveInsurance === opt} 
                                                                onChange={() => setPatientDetails({ ...patientDetails, haveInsurance: opt })} 
                                                                className="accent-[#08B36A] w-4 h-4 cursor-pointer" 
                                                            />
                                                            <span className="text-xs font-bold text-slate-700 uppercase">{opt}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            {patientDetails.haveInsurance === 'Yes' && (
                                                <div className="bg-emerald-50/40 p-5 rounded-2xl border border-[#08B36A]/20 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Policy / Card Number *</label>
                                                        <input type="text" name="insuranceNo" value={patientDetails.insuranceNo} onChange={handleInputChange} placeholder="e.g. POL1234567" className="w-full bg-white px-4 py-3 rounded-xl border border-emerald-200 outline-none font-bold text-xs font-mono focus:ring-2 focus:ring-[#08B36A]/20" />
                                                    </div>

                                                    <div>
                                                        <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Insurance Company / Provider *</label>
                                                        <input type="text" name="companyName" value={patientDetails.companyName} onChange={handleInputChange} placeholder="e.g. HDFC ERGO, Star Health" className="w-full bg-white px-4 py-3 rounded-xl border border-emerald-200 outline-none font-bold text-xs focus:ring-2 focus:ring-[#08B36A]/20" />
                                                    </div>

                                                    <div className="sm:col-span-2">
                                                        <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Claim Type</label>
                                                        <select name="insuranceType" value={patientDetails.insuranceType} onChange={handleInputChange} className="w-full bg-white px-4 py-3 rounded-xl border border-emerald-200 outline-none font-bold text-xs focus:ring-2 focus:ring-[#08B36A]/20">
                                                            <option value="Cashless">Cashless</option>
                                                            <option value="Reimbursement">Reimbursement</option>
                                                        </select>
                                                    </div>

                                                    {/* 📸 MANUAL FRONT CARD UPLOAD WITH INSTANT PREVIEW */}
                                                    <div>
                                                        <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Card Front Side (Photo) *</label>
                                                        <div className="border-2 border-dashed border-[#08B36A]/30 rounded-xl p-3 bg-white text-center cursor-pointer relative hover:bg-emerald-50/30 transition-colors">
                                                            <input type="file" onChange={(e) => handleFileChange(e, 'insuranceDocumentFront')} accept="image/*,.pdf" className="absolute inset-0 opacity-0 cursor-pointer" />
                                                            {patientDetails.insuranceDocumentFront instanceof File && (
                                                                <div className="mb-2 h-20 w-full overflow-hidden rounded-lg border border-slate-200">
                                                                    <img src={getDocumentUrl(patientDetails.insuranceDocumentFront)} alt="Preview Front" className="w-full h-full object-cover" />
                                                                </div>
                              )}
                                                            <div className="flex flex-col items-center justify-center gap-1">
                                                                <FaImage className="text-[#08B36A] text-sm" />
                                                                <span className="text-[11px] font-bold text-slate-700 truncate max-w-[180px]">
                                                                    {patientDetails.insuranceDocumentFront ? patientDetails.insuranceDocumentFront.name : 'Upload Card Front'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* 📸 MANUAL BACK CARD UPLOAD WITH INSTANT PREVIEW */}
                                                    <div>
                                                        <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Card Back Side (Photo) *</label>
                                                        <div className="border-2 border-dashed border-[#08B36A]/30 rounded-xl p-3 bg-white text-center cursor-pointer relative hover:bg-emerald-50/30 transition-colors">
                                                            <input type="file" onChange={(e) => handleFileChange(e, 'insuranceDocumentBack')} accept="image/*,.pdf" className="absolute inset-0 opacity-0 cursor-pointer" />
                                                            {patientDetails.insuranceDocumentBack instanceof File && (
                                                                <div className="mb-2 h-20 w-full overflow-hidden rounded-lg border border-slate-200">
                                                                    <img src={getDocumentUrl(patientDetails.insuranceDocumentBack)} alt="Preview Back" className="w-full h-full object-cover" />
                                                                </div>
                                                            )}
                                                            <div className="flex flex-col items-center justify-center gap-1">
                                                                <FaImage className="text-[#08B36A] text-sm" />
                                                                <span className="text-[11px] font-bold text-slate-700 truncate max-w-[180px]">
                                                                    {patientDetails.insuranceDocumentBack ? patientDetails.insuranceDocumentBack.name : 'Upload Card Back'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="sm:col-span-2 pt-1 border-t border-emerald-100">
                                                        <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Or Upload Combined Policy PDF (Optional)</label>
                                                        <div className="border border-dashed border-slate-300 rounded-xl p-2.5 bg-white text-center cursor-pointer relative hover:bg-slate-50 transition-colors">
                                                            <input type="file" onChange={(e) => handleFileChange(e, 'insuranceDocument')} accept="application/pdf,image/*" className="absolute inset-0 opacity-0 cursor-pointer" />
                                                            <div className="flex items-center justify-center gap-2">
                                                                <FaFilePdf className="text-rose-500" />
                                                                <span className="text-xs font-semibold text-slate-600 truncate max-w-[280px]">
                                                                    {patientDetails.insuranceDocument ? patientDetails.insuranceDocument.name : 'Choose Single PDF / Document'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* SECTION 3: Payment Method Selector */}
                        {totals.totalPayable > 0 && (
                            <section className="bg-white rounded-3xl p-6 md:p-8 shadow-xs border border-slate-200/80">
                                <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] mb-4 flex items-center gap-3">
                                    <span className="w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-[10px]">03</span>
                                    Payment Method
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod('Online')}
                                        className={`p-4 rounded-2xl border transition-all text-left flex items-center justify-between cursor-pointer ${
                                            paymentMethod === 'Online'
                                                ? 'border-[#08B36A] bg-emerald-50/40 ring-2 ring-[#08B36A]/20'
                                                : 'bg-white border-slate-200 hover:bg-slate-50'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 bg-emerald-100 text-[#08B36A] rounded-xl">
                                                <FaCreditCard size={16} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-slate-900">Pay Online (Razorpay)</p>
                                                <p className="text-[10px] text-slate-500 mt-0.5">UPI, Cards, NetBanking, Instant Bed Lock</p>
                                            </div>
                                        </div>
                                        {paymentMethod === 'Online' && <FaCheckCircle className="text-[#08B36A]" size={16} />}
                                    </button>

                                    <button
                                        type="button"
                                        disabled={!totals.isCodAvailable}
                                        onClick={() => setPaymentMethod('COD')}
                                        className={`p-4 rounded-2xl border transition-all text-left flex items-center justify-between relative cursor-pointer ${
                                            !totals.isCodAvailable ? 'opacity-40 cursor-not-allowed bg-slate-50 border-slate-200' : ''
                                        } ${
                                            paymentMethod === 'COD'
                                                ? 'border-[#08B36A] bg-emerald-50/40 ring-2 ring-[#08B36A]/20'
                                                : 'bg-white border-slate-200 hover:bg-slate-50'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 bg-slate-100 text-slate-700 rounded-xl">
                                                <FaMoneyBillWave size={16} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-slate-900">Pay at Hospital Counter</p>
                                                <p className="text-[10px] text-slate-500 mt-0.5">
                                                    {totals.isCodAvailable ? 'Deposit payable at hospital admission desk' : 'Counter collection disabled'}
                                                </p>
                                            </div>
                                        </div>
                                        {paymentMethod === 'COD' && <FaCheckCircle className="text-[#08B36A]" size={16} />}
                                    </button>
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Right Column: Pricing & Coupon */}
                    <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
                        
                        {/* Coupon Box */}
                        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                            <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                <FaTag className="text-[#08B36A]" /> Apply Hospital Coupon
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
                                    className="flex-1 bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 outline-none font-bold text-xs uppercase focus:ring-2 focus:ring-[#08B36A]/20"
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

                        {/* Itemized IPD Bill */}
                        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                            <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                <FaReceipt className="text-slate-400" />
                                Inpatient Itemized Bill
                            </h2>

                            <div className="space-y-3 text-xs">
                                <div className="flex justify-between items-center text-slate-600">
                                    <span>Ward Bed Stay ({totals.stayDuration} Days)</span>
                                    <span className="font-black text-slate-900">₹{totals.bedStayTotal}</span>
                                </div>

                                {selectedDoctor && (
                                    <div className="flex justify-between items-center text-slate-700 font-bold pt-1 border-t border-slate-100">
                                        <span>Attending Specialist Rounds</span>
                                        <span className="text-[#08B36A] font-black">FREE (₹0)</span>
                                    </div>
                                )}

                                {totals.servicesTotal > 0 && (
                                    <div className="space-y-1.5 pt-1 border-t border-slate-100">
                                        <div className="flex justify-between items-center text-slate-700 font-bold">
                                            <span>Special Add-on Services</span>
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

                                {totals.discount > 0 && (
                                    <div className="flex justify-between items-center text-[#08B36A] font-bold">
                                        <span>Hospital Coupon Discount</span>
                                        <span>-₹{totals.discount}</span>
                                    </div>
                                )}

                                <div className="h-px bg-slate-100 my-2" />

                                <div className="flex justify-between items-end">
                                    <div>
                                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Total Payable</span>
                                        <span className="text-[10px] text-slate-400 font-medium">All ward &amp; facility charges included</span>
                                    </div>
                                    <span className="text-3xl font-black text-slate-900">
                                        ₹{Math.round(totals.totalPayable)}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={handleAdmissionBooking}
                                disabled={isSubmitting || isFetchingSummary}
                                className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer ${
                                    !isSubmitting && !isFetchingSummary
                                        ? 'bg-[#08B36A] hover:bg-[#069959] text-white shadow-lg shadow-[#08B36A]/20 active:scale-95'
                                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                }`}
                            >
                                {isSubmitting || isFetchingSummary ? (
                                    <FaSpinner className="animate-spin" size={14} />
                                ) : paymentMethod === 'Online' ? (
                                    <>Pay Online ₹{Math.round(totals.totalPayable)} &amp; Confirm Bed <FaLock size={10} /></>
                                ) : (
                                    <>Reserve Bed &amp; Pay at Counter <FaHospital size={12} /></>
                                )}
                            </button>
                        </div>
                    </div>

                </div>
            </main>

            {/* IPD SUCCESS MODAL */}
            {bookingSuccessData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 max-w-lg w-full border border-slate-150 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        <div className="flex flex-col items-center text-center space-y-2 pb-2">
                            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-[#08B36A] shadow-xs border border-emerald-100">
                                <FaCheckCircle className="w-9 h-9" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                                Admission Confirmed!
                            </h3>
                            <p className="text-xs font-semibold text-slate-400">
                                {paymentMethod === 'Online'
                                    ? 'Payment verified! Bed is locked and confirmed for admission.'
                                    : 'Bed reserved! Please submit your deposit at the hospital admission desk.'}
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

                            {/* Ward & Bed Allotment */}
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70 space-y-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block flex items-center gap-1.5">
                                    <FaHospital className="text-blue-500" /> Ward &amp; Bed Allocation
                                </span>
                                <div className="grid grid-cols-2 gap-y-1.5 text-xs">
                                    <div className="text-slate-500 font-semibold">Hospital:</div>
                                    <div className="text-right font-black text-slate-800">{booking.hospitalName}</div>
                                    <div className="text-slate-500 font-semibold">Ward &amp; Bed:</div>
                                    <div className="text-right font-bold text-[#08B36A]">
                                        {bookingSuccessData.wardName || booking.wardName} - {bookingSuccessData.bedNumber || `Bed #${booking.bedNumber}`}
                                    </div>
                                    <div className="text-slate-500 font-semibold">Stay Duration:</div>
                                    <div className="text-right font-bold text-slate-800">{totals.stayDuration} Days</div>
                                </div>
                            </div>

                            {/* Settlement Summary */}
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70 space-y-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block flex items-center gap-1.5">
                                    <FaReceipt className="text-[#08B36A]" /> Settlement Summary
                                </span>
                                <div className="grid grid-cols-2 gap-y-1.5 text-xs">
                                    <div className="text-slate-500 font-semibold">Payment Method:</div>
                                    <div className="text-right font-black uppercase text-slate-800">
                                        {paymentMethod === 'Online' ? 'Online Razorpay' : 'Pay at Counter'}
                                    </div>
                                    <div className="text-slate-500 font-semibold">Admission Status:</div>
                                    <div className="text-right font-bold uppercase text-[#08B36A]">
                                        {bookingSuccessData.status || (paymentMethod === 'Online' ? 'Confirmed' : 'Hospital-Pending')}
                                    </div>
                                    <div className="text-slate-900 font-black text-sm pt-2 border-t border-slate-200">Total Payable:</div>
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
                                className="flex-1 bg-[#08B36A] hover:bg-[#069959] text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-[#08B36A]/20 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
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