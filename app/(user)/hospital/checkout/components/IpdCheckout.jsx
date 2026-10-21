'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
    FaArrowLeft, FaHospital, FaProcedures, FaCalendarDay,
    FaShieldAlt, FaUserMd, FaConciergeBell, FaUser, FaTag,
    FaReceipt, FaCreditCard, FaMoneyBillWave, FaCheckCircle,
    FaLock, FaSpinner, FaUpload, FaFilePdf, FaImage, FaTimes,
    FaInfoCircle, FaExclamationTriangle
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

export default function IpdCheckout() {
    const router = useRouter();

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
        haveInsurance: 'No', // For manual input when no saved insurance or user toggles manual
        insuranceNo: '',
        companyName: '',
        insuranceType: 'Cashless Mediclaim',
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

    // Pricing & Submission States
    const [serverPricing, setServerPricing] = useState(null);
    const [isFetchingSummary, setIsFetchingSummary] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [bookingSuccessData, setBookingSuccessData] = useState(null);

    // Duplicate verification lock
    const isVerifyingRef = useRef(false);

    // Safely teardown IPD session when user exits checkout without completing
    const handleBack = () => {
        if (!bookingSuccessData) {
            sessionStorage.removeItem('activeBooking');
            sessionStorage.removeItem('lastActiveCheckoutType');
        }
        router.back();
    };

    // Clean up if user uses browser back button
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

    // Helper: Extract valid array of ObjectIds for special services
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

    // 1. Session Initialization & Service Enrichment
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
                setBooking(parsedIpd);
            } catch (e) {
                console.error('Invalid IPD booking session:', e);
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
                console.warn('Could not fetch user profile details:', err);
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

            // Fetch Hospital Details (to verify acceptedInsurances tie-ups)
            if (parsedIpd.hospitalId) {
                try {
                    if (typeof UserAPI.getHospitalDetail === 'function') {
                        const hRes = await UserAPI.getHospitalDetail(parsedIpd.hospitalId);
                        if (hRes?.success && hRes.data?.hospital) {
                            setHospitalInfo(hRes.data.hospital);
                        }
                    }
                } catch (e) {
                    console.warn('Could not fetch hospital detail:', e);
                }
            }

            // IPD Doctor, Services, & Catalog Resolution
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

                        // Recover any missing MongoDB ObjectIds
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
                } catch (e) {
                    console.error('Error fetching hospital services catalog:', e);
                }
            }

            setSelectedServices(rawSrv);
            executeCheckoutSummary(parsedIpd, rawSrv, '', []);
            setIsReady(true);
        };

        initData();
    }, [router]);

    // Check Hospital Cashless Tie-up Compatibility
    const hospitalCoveredInfo = useMemo(() => {
        const accepted = hospitalInfo?.acceptedInsurances || booking?.acceptedInsurances || [];
        const currentCompany = applySavedInsurance && savedInsurance 
            ? savedInsurance.companyName 
            : (patientDetails.haveInsurance === 'Yes' ? patientDetails.companyName : '');

        if (!currentCompany || !accepted || accepted.length === 0) {
            return { isCovered: true, companyName: currentCompany }; // neutral if no hospital list available
        }

        const isCovered = accepted.some(
            c => c.trim().toLowerCase() === currentCompany.trim().toLowerCase()
        );

        return { isCovered, companyName: currentCompany };
    }, [hospitalInfo, booking, applySavedInsurance, savedInsurance, patientDetails.haveInsurance, patientDetails.companyName]);

    // 2. Fetch IPD Checkout Summary
    const executeCheckoutSummary = async (activeBooking, srvList, codeToApply, catalogList = servicesCatalog) => {
        if (!activeBooking?.hospitalId || !activeBooking?.bedId) return;

        try {
            setIsFetchingSummary(true);
            setCouponError('');

            const serviceIds = getResolvedServiceIds(srvList, catalogList);

            const payload = {
                hospitalId: String(activeBooking.hospitalId),
                bedId: String(activeBooking.bedId),
                startDate: getCleanDate(activeBooking.startDate),
                endDate: getCleanDate(activeBooking.endDate),
                specialServices: serviceIds,
                couponCode: codeToApply || undefined
            };

            const res = await UserAPI.getHospitalCheckoutSummary(payload);

            if (res?.success && res.data) {
                setServerPricing(res.data);
                if (res.data.isCodAvailable === false && paymentMethod === 'COD') {
                    setPaymentMethod('Online');
                }
            } else if (codeToApply) {
                setCouponError(res?.message || 'Invalid coupon code');
                setAppliedCouponCode('');
            }
        } catch (error) {
            console.error('IPD summary fetch error:', error);
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
            // Re-apply saved insurance if available for primary user
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

            // When a family member is chosen, disable user's personal saved insurance card
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
                insuranceType: 'Cashless Mediclaim',
                address: '', city: '', pincode: '',
                bookingReason: '',
                bloodGroup: member.bloodGroup || ''
            }));
        }
    };

    // 3. Computed Pricing Totals
    const totals = useMemo(() => {
        if (serverPricing) {
            const bedStayTotal = Number(serverPricing.baseFee ?? (serverPricing.pricePerDay * serverPricing.days) ?? 0);
            const servicesTotal = Number(serverPricing.serviceCharge ?? 0);
            const discount = Number(serverPricing.discount ?? serverPricing.appliedCoupon?.discountAmount ?? 0);
            const subtotal = Number(serverPricing.subtotal ?? (bedStayTotal + servicesTotal));
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
        }

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
                CostoumPopup('Razorpay key configuration is missing. Contact administration.', 'error', 4000);
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

            const targetBookingId = orderRes.bookingId || orderRes.data?.bookingId || 'HKH-IPD-CONFIRMED';

            isVerifyingRef.current = false;

            const options = {
                key: keyId,
                amount: amountInPaise,
                currency: orderRes.currency || 'INR',
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
                        console.error('IPD Verification error:', e);
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
                console.error('Razorpay Payment failed:', response.error);
                CostoumPopup(response.error?.description || 'Payment failed. Please retry.', 'error', 4000);
                setIsSubmitting(false);
            });
            rzpInstance.open();

        } catch (err) {
            console.error('Razorpay launch trigger error:', err);
            CostoumPopup('Could not launch payment gateway. Please try again.', 'error', 4000);
            setIsSubmitting(false);
        }
    };

    // 5. Final IPD Booking Submit (Following Step 4 Flow)
    const handleAdmissionBooking = async () => {
        if (!patientDetails.fullName.trim() || !patientDetails.phoneNumber.trim()) {
            CostoumPopup('Please provide patient full name and contact phone number', 'warning', 3000);
            return;
        }

        // Determine if insurance is claimed via Saved profile OR Manual form
        const isUsingSavedInsurance = Boolean(applySavedInsurance && savedInsurance?.hasInsurance && selectedMemberId === 'self');
        const isUsingManualInsurance = !isUsingSavedInsurance && patientDetails.haveInsurance === 'Yes';
        const isInsured = isUsingSavedInsurance || isUsingManualInsurance;

        // If manual insurance is selected, ensure documents are uploaded
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
            fd.append('startDate', getCleanDate(booking.startDate));
            fd.append('endDate', getCleanDate(booking.endDate));
            fd.append('triageLevel', triageLevel || 'Routine');
            fd.append('paymentMethod', finalPaymentMethod);
            fd.append('bookingReason', patientDetails.bookingReason?.trim() || 'General Bed Admission');

            // Special Services
            const resolvedIds = getResolvedServiceIds(selectedServices, servicesCatalog);
            if (resolvedIds.length > 0) {
                fd.append('specialServices', JSON.stringify(resolvedIds));
            }

            if (selectedDoctor?._id) {
                fd.append('doctorId', String(selectedDoctor._id));
            }

            if (appliedCouponCode) {
                fd.append('couponCode', appliedCouponCode);
            }

            const calculatedPatientAge = calculateAge(patientDetails.dob);
            const patientArray = [{
                patientName: patientDetails.fullName.trim(),
                patientAge: calculatedPatientAge > 0 ? calculatedPatientAge : 30,
                gender: patientDetails.gender || 'Male',
                relation: selectedMemberId === 'self' ? 'Self' : (patientDetails.relation || 'Family Member'),
                ...(patientDetails.bloodGroup && { bloodGroup: patientDetails.bloodGroup })
            }];
            fd.append('patients', JSON.stringify(patientArray));

            const pricingSnapshot = {
                baseFee: totals.bedStayTotal,
                extraCharges: totals.servicesTotal,
                discountAmount: totals.discount,
                subtotal: totals.subtotal,
                totalPayable: totals.totalPayable
            };
            fd.append('pricing', JSON.stringify(pricingSnapshot));

            // STEP 4: Attach Insurance Payload
            if (isInsured) {
                fd.append('hasInsurance', 'true');

                if (isUsingSavedInsurance) {
                    // Send Saved Insurance profile details without re-uploading files
                    fd.append('companyName', savedInsurance.companyName || '');
                    fd.append('insuranceNumber', savedInsurance.insuranceNumber || '');
                    fd.append('insuranceType', savedInsurance.insuranceType || 'Cashless Mediclaim');
                } else {
                    // Manual Insurance form details
                    fd.append('companyName', patientDetails.companyName?.trim() || '');
                    fd.append('insuranceNumber', patientDetails.insuranceNo?.trim() || '');
                    fd.append('insuranceType', patientDetails.insuranceType || 'Cashless Mediclaim');

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
            } else {
                fd.append('hasInsurance', 'false');
            }

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
                    specialServicesIncluded: res.specialServicesIncluded || []
                });
                setIsSubmitting(false);
                return;
            }

            // Launch Online Razorpay Payment
            await launchRazorpay(res);

        } catch (error) {
            console.error('IPD booking submission error:', error);
            CostoumPopup(error?.response?.data?.message || 'An error occurred during booking. Please check details.', 'error', 4000);
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

    const currentPatientAge = calculateAge(patientDetails.dob);

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
                            Hospital Inpatient Admission Checkout
                        </h1>
                        <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">
                            IPD Ward Stay &amp; Medical Facilities
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

                                    <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100">
                                        <div className="flex items-center gap-2 mb-1.5 text-emerald-600">
                                            <FaProcedures size={13} />
                                            <span className="text-[10px] font-black uppercase tracking-wider">Ward &amp; Bed Allotted</span>
                                        </div>
                                        <p className="font-bold text-emerald-900 text-sm leading-tight">
                                            {booking.wardName} &bull; Bed #{booking.bedNumber}
                                        </p>
                                        <p className="text-[10px] font-bold text-emerald-700 mt-0.5">
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
                                        <span className="text-[10px] font-black uppercase text-emerald-600 block mt-1">
                                            {totals.stayDuration} Days Reserved Stay
                                        </span>
                                    </div>
                                </div>

                                {/* Attending Doctor & Services */}
                                {(selectedDoctor || selectedServices.length > 0) && (
                                    <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                        {selectedDoctor && (
                                            <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50/50 border border-blue-100">
                                                <div className="flex items-center gap-2">
                                                    <FaUserMd className="text-blue-600" />
                                                    <div>
                                                        <p className="font-bold text-slate-900">Dr. {selectedDoctor.name}</p>
                                                        <p className="text-[10px] text-slate-500">{selectedDoctor.speciality || 'Attending Specialist'}</p>
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
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Primary Reason for Admission / Symptoms</label>
                                    <input type="text" name="bookingReason" value={patientDetails.bookingReason} onChange={handleInputChange} placeholder="e.g. Inpatient surgery, observation, treatment..." className="w-full bg-slate-50 px-4 py-3.5 rounded-xl border border-slate-200 outline-none font-bold text-xs text-slate-800 focus:bg-white" />
                                </div>

                                {/* ============================================================== */}
                                {/* 🛡️ STEP 3: HEALTH INSURANCE SECTION (SAVED VS MANUAL)           */}
                                {/* ============================================================== */}
                                <div className="md:col-span-2 pt-3 border-t border-slate-100">
                                    
                                    {/* CASE A: User Has Saved Insurance in Profile (Self Only) */}
                                    {selectedMemberId === 'self' && savedInsurance?.hasInsurance ? (
                                        <div className="bg-emerald-50/60 p-5 rounded-2xl border border-emerald-200 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-sm">
                                                    <FaShieldAlt className="text-[#08B36A] text-base" />
                                                    <span>Saved Insurance Policy (From Profile)</span>
                                                </div>

                                                {/* Toggle Switch */}
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
                                                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Plan Type</span>
                                                    <span className="font-bold text-slate-900">{savedInsurance.insuranceType || 'Cashless Mediclaim'}</span>
                                                </div>
                                            </div>

                                            {/* Tie-up Warning / Confirmation Banner */}
                                            {applySavedInsurance && (
                                                hospitalCoveredInfo.isCovered ? (
                                                    <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-700 bg-emerald-100/60 px-3 py-1.5 rounded-lg">
                                                        <FaCheckCircle className="text-[#08B36A]" />
                                                        <span>Cashless tie-up confirmed with this hospital facility.</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-start gap-2 text-[11px] font-bold text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                                                        <FaExclamationTriangle className="text-amber-500 mt-0.5 shrink-0" />
                                                        <span>This hospital does not have an active cashless tie-up with {hospitalCoveredInfo.companyName}. A reimbursement receipt will be provided for your claim.</span>
                                                    </div>
                                                )
                                            )}

                                            <p className="text-[10px] text-slate-500">
                                                {applySavedInsurance
                                                    ? '✓ Existing card photos and credentials will automatically attach to this admission.'
                                                    : 'Self-Pay chosen. Turn on the switch above to claim your saved policy.'}
                                            </p>
                                        </div>
                                    ) : (
                                        /* CASE B: No Saved Insurance OR Family Member Selected -> Manual Inputs */
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
                                                                className="accent-emerald-600 w-4 h-4 cursor-pointer" 
                                                            />
                                                            <span className="text-xs font-bold text-slate-700 uppercase">{opt}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            {patientDetails.haveInsurance === 'Yes' && (
                                                <div className="bg-emerald-50/40 p-5 rounded-2xl border border-emerald-200/60 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Insurance / Policy Number *</label>
                                                        <input type="text" name="insuranceNo" value={patientDetails.insuranceNo} onChange={handleInputChange} placeholder="Policy / Member ID (e.g. STAR-MED-109241)" className="w-full bg-white px-4 py-3 rounded-xl border border-emerald-200 outline-none font-bold text-xs font-mono focus:ring-2 focus:ring-emerald-500/20" />
                                                    </div>

                                                    <div>
                                                        <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Insurance Company / TPA Provider *</label>
                                                        <input type="text" name="companyName" value={patientDetails.companyName} onChange={handleInputChange} placeholder="e.g. Star Health, HDFC ERGO" className="w-full bg-white px-4 py-3 rounded-xl border border-emerald-200 outline-none font-bold text-xs focus:ring-2 focus:ring-emerald-500/20" />
                                                    </div>

                                                    <div className="sm:col-span-2">
                                                        <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Insurance Plan Type</label>
                                                        <input type="text" name="insuranceType" value={patientDetails.insuranceType} onChange={handleInputChange} placeholder="e.g. Cashless Mediclaim, Reimbursement" className="w-full bg-white px-4 py-3 rounded-xl border border-emerald-200 outline-none font-bold text-xs focus:ring-2 focus:ring-emerald-500/20" />
                                                    </div>

                                                    {/* Tie-up Warning for manual company */}
                                                    {patientDetails.companyName && !hospitalCoveredInfo.isCovered && (
                                                        <div className="sm:col-span-2 flex items-start gap-2 text-[11px] font-bold text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                                                            <FaExclamationTriangle className="text-amber-500 mt-0.5 shrink-0" />
                                                            <span>This hospital does not have an active cashless tie-up with {patientDetails.companyName}. A reimbursement receipt will be provided for your claim.</span>
                                                        </div>
                                                    )}

                                                    {/* Dual Side Card Photo Upload */}
                                                    <div>
                                                        <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Policy Card Front Side</label>
                                                        <div className="border-2 border-dashed border-emerald-300 rounded-xl p-3 bg-white text-center cursor-pointer relative hover:bg-emerald-50/30 transition-colors">
                                                            <input type="file" onChange={(e) => handleFileChange(e, 'insuranceDocumentFront')} accept="image/*,.pdf" className="absolute inset-0 opacity-0 cursor-pointer" />
                                                            <div className="flex flex-col items-center justify-center gap-1">
                                                                <FaImage className="text-emerald-600 text-sm" />
                                                                <span className="text-[11px] font-bold text-slate-700 truncate max-w-[180px]">
                                                                    {patientDetails.insuranceDocumentFront ? patientDetails.insuranceDocumentFront.name : 'Upload Card Front'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Policy Card Back Side</label>
                                                        <div className="border-2 border-dashed border-emerald-300 rounded-xl p-3 bg-white text-center cursor-pointer relative hover:bg-emerald-50/30 transition-colors">
                                                            <input type="file" onChange={(e) => handleFileChange(e, 'insuranceDocumentBack')} accept="image/*,.pdf" className="absolute inset-0 opacity-0 cursor-pointer" />
                                                            <div className="flex flex-col items-center justify-center gap-1">
                                                                <FaImage className="text-emerald-600 text-sm" />
                                                                <span className="text-[11px] font-bold text-slate-700 truncate max-w-[180px]">
                                                                    {patientDetails.insuranceDocumentBack ? patientDetails.insuranceDocumentBack.name : 'Upload Card Back'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Alternative Combined PDF Document */}
                                                    <div className="sm:col-span-2 pt-1 border-t border-emerald-100">
                                                        <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Or Upload Combined Policy PDF</label>
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

                        {/* SECTION 3: Payment Method Selector (Default Online) */}
                        {totals.totalPayable > 0 && (
                            <section className="bg-white rounded-3xl p-6 md:p-8 shadow-xs border border-slate-200/80">
                                <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] mb-4 flex items-center gap-3">
                                    <span className="w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-[10px]">03</span>
                                    Payment Method
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    
                                    {/* ONLINE RAZORPAY - DEFAULT */}
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
                                                <p className="text-[10px] text-slate-500 mt-0.5">UPI, Cards, NetBanking, Instant Bed Lock</p>
                                            </div>
                                        </div>
                                        {paymentMethod === 'Online' && <FaCheckCircle className="text-emerald-600" size={16} />}
                                    </button>

                                    {/* PAY AT HOSPITAL COUNTER */}
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
                                                <p className="text-xs font-black text-slate-900">Pay at Hospital Counter</p>
                                                <p className="text-[10px] text-slate-500 mt-0.5">
                                                    {totals.isCodAvailable ? 'Deposit payable at hospital admission desk' : 'Counter collection disabled'}
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
                        
                        {/* Coupon Box */}
                        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
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
                                    <div className="flex justify-between items-center text-emerald-600 font-bold">
                                        <span>Hospital Coupon Discount</span>
                                        <span>-₹{totals.discount}</span>
                                    </div>
                                )}

                                <div className="h-px bg-slate-100 my-2" />

                                <div className="flex justify-between items-end">
                                    <div>
                                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Total Payable</span>
                                        <span className="text-[10px] text-slate-400 font-medium">All ward &amp; facility taxes included</span>
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
                                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 active:scale-95'
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
                            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-xs border border-emerald-100">
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
                                    <div className="text-right font-bold text-emerald-600">
                                        {bookingSuccessData.wardName || booking.wardName} - {bookingSuccessData.bedNumber || `Bed #${booking.bedNumber}`}
                                    </div>
                                    <div className="text-slate-500 font-semibold">Stay Duration:</div>
                                    <div className="text-right font-bold text-slate-800">{totals.stayDuration} Days</div>
                                </div>
                            </div>

                            {/* Settlement Summary */}
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70 space-y-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block flex items-center gap-1.5">
                                    <FaReceipt className="text-emerald-500" /> Settlement Summary
                                </span>
                                <div className="grid grid-cols-2 gap-y-1.5 text-xs">
                                    <div className="text-slate-500 font-semibold">Payment Method:</div>
                                    <div className="text-right font-black uppercase text-slate-800">
                                        {paymentMethod === 'Online' ? 'Online Razorpay' : 'Pay at Counter'}
                                    </div>
                                    <div className="text-slate-500 font-semibold">Admission Status:</div>
                                    <div className="text-right font-bold uppercase text-emerald-600">
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