"use client";

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaArrowLeft, FaArrowRight,
  FaCrown, FaTag, FaSpinner,
  FaUserCircle, FaMapMarkerAlt, FaCheckCircle, FaGem,
  FaMoneyBillWave, FaCreditCard, FaLock, FaCalendarAlt,
  FaClock, FaStethoscope, FaUserAlt, FaReceipt, FaKey,
  FaSun, FaCloudSun, FaMoon
} from 'react-icons/fa';
import UserAPI from "@/app/services/UserAPI";
import CostoumPopup from '@/lib/CostoumPopup';

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

// Helper: Parse slot hour and minute
const parseSlotTime = (timeStr) => {
  if (!timeStr) return { hour: 0, minute: 0 };
  const isPM = /pm/i.test(timeStr);
  const isAM = /am/i.test(timeStr);
  const clean = timeStr.replace(/[^0-9:]/g, '');
  const [hStr, mStr] = clean.split(':');
  let hour = parseInt(hStr, 10) || 0;
  const minute = parseInt(mStr, 10) || 0;
  if (isPM && hour < 12) hour += 12;
  if (isAM && hour === 12) hour = 0;
  return { hour, minute };
};

export default function DoctorBookingConfirmation() {
  const router = useRouter();

  // --- Core States ---
  const [bookingData, setBookingData] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);
  
  // --- Patient & Address States ---
  const [familyMembers, setFamilyMembers] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [loadingSelectionData, setLoadingSelectionData] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // --- Payment & Coupon States ---
  const [paymentMethod, setPaymentMethod] = useState("Online"); // 'Online' | 'COD'
  const [couponCode, setCouponCode] = useState("");
  const [appliedCouponCode, setAppliedCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  // --- Server Pricing & COD Availability ---
  const [serverPricing, setServerPricing] = useState(null);
  const [isFetchingSummary, setIsFetchingSummary] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Success Modal State ---
  const [confirmedBookingDetails, setConfirmedBookingDetails] = useState(null);

  // 1. Initialize Page Data
  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (!token) {
      CostoumPopup("Please Login To Continue", "warning", 4000);
      router.push('/drappointment');
      return;
    }

    const data = localStorage.getItem('pendingBooking');
    if (data) {
      const parsed = JSON.parse(data);
      setBookingData(parsed);
      setSelectedDate(new Date().toISOString().split('T')[0]);
      fetchSelectionData();
    } else {
      router.push('/drappointment');
    }
  }, [router]);

  // 2. Fetch User Addresses and Family Members
  const fetchSelectionData = async () => {
    try {
      setLoadingSelectionData(true);
      const [addrRes, familyRes] = await Promise.all([
        UserAPI.getUserAddresses(),
        UserAPI.getFamilyMembers()
      ]);
      if (addrRes?.success && addrRes.data?.length > 0) {
        setAddresses(addrRes.data);
        const defaultAddr = addrRes.data.find(a => a.isDefault) || addrRes.data[0];
        setSelectedAddress(defaultAddr);
      }
      if (familyRes?.success && familyRes.data?.length > 0) {
        setFamilyMembers(familyRes.data);
        const selfMember = familyRes.data.find(m => m.relation === "Self") || familyRes.data[0];
        setSelectedMember(selfMember);
      }
    } catch (error) {
      console.error("Error fetching patient/address data:", error);
    } finally {
      setLoadingSelectionData(false);
    }
  };

  // 3. Fetch Time Slots for Selected Date
  const fetchSlots = useCallback(async (date) => {
    if (!bookingData?.doctorId) return;
    try {
      setLoadingSlots(true);
      setSelectedSlot(null);
      const res = await UserAPI.getDoctorAvailability(bookingData.doctorId, date);
      if (res?.success) setAvailableSlots(res.slots || []);
    } catch (error) {
      console.error("Error fetching slots:", error);
    } finally {
      setLoadingSlots(false);
    }
  }, [bookingData]);

  useEffect(() => {
    if (selectedDate) fetchSlots(selectedDate);
  }, [selectedDate, fetchSlots]);

  // 4. Calculate Consultation Type Mapping
  const mappedConsultationType = useMemo(() => {
    if (bookingData?.selectedService === "Virtual Consultation" || bookingData?.consultationType === "Video Consult") {
      return "Video Consult";
    }
    if (bookingData?.selectedService === "Home Care" || bookingData?.consultationType === "Home Visit") {
      return "Home Visit";
    }
    return "Clinic Visit";
  }, [bookingData]);

  // 5. Calculate Doctor Checkout Summary (1.1 Endpoint)
  const fetchSummary = useCallback(async (codeToApply = appliedCouponCode) => {
    if (!bookingData?.doctorId || !selectedSlot || !selectedMember) return;

    try {
      setIsFetchingSummary(true);
      setCouponError("");

      const payload = {
        doctorId: bookingData.doctorId,
        consultationType: mappedConsultationType,
        appointmentDate: selectedDate,
        timeSlot: selectedSlot.time,
        couponCode: codeToApply || undefined,
        patients: [{
          patientName: selectedMember.memberName || selectedMember.name,
          patientAge: Number(selectedMember.patientAge || selectedMember.age || 25),
          gender: selectedMember.gender || "Male",
          relation: selectedMember.relation || "Self"
        }],
        address: (mappedConsultationType === "Home Visit" && selectedAddress) ? {
          houseNo: selectedAddress.houseNo,
          sector: selectedAddress.sector,
          city: selectedAddress.city,
          state: selectedAddress.state,
          pincode: selectedAddress.pincode,
          addressType: selectedAddress.addressType || "Home"
        } : undefined
      };

      const res = await UserAPI.doctorCheckoutSummary(payload);
      if (res?.success && res.data) {
        setServerPricing(res.data);
        // If COD is not available according to backend engine, force Online payment
        if (!res.data.isCodAvailable && paymentMethod === "COD") {
          setPaymentMethod("Online");
        }
      } else {
        if (codeToApply) {
          setCouponError(res?.message || "Failed to apply coupon");
          setAppliedCouponCode("");
        }
      }
    } catch (error) {
      console.error("Error fetching checkout summary:", error);
      if (codeToApply) setCouponError("Coupon validation failed");
    } finally {
      setIsFetchingSummary(false);
      setIsValidatingCoupon(false);
    }
  }, [bookingData, selectedSlot, selectedMember, selectedDate, mappedConsultationType, selectedAddress, appliedCouponCode, paymentMethod]);

  // Trigger Checkout Summary on dependency changes
  useEffect(() => {
    if (selectedSlot && selectedMember && selectedDate) {
      fetchSummary(appliedCouponCode);
    }
  }, [selectedSlot, selectedMember, selectedDate, selectedAddress, fetchSummary, appliedCouponCode]);

  // Memoized Pricing View
  const pricing = useMemo(() => {
    if (serverPricing) {
      return {
        baseFee: serverPricing.baseFee ?? 0,
        originalBaseFee: serverPricing.originalBaseFee ?? serverPricing.baseFee ?? 0,
        visitCharges: serverPricing.visitCharge ?? 0,
        extraCharges: serverPricing.premiumFee ?? 0,
        discountAmount: serverPricing.discount ?? 0,
        subtotal: serverPricing.subtotal ?? 0,
        total: serverPricing.totalPayable ?? 0,
        isCodAvailable: !!serverPricing.isCodAvailable,
        isSubscriptionApplied: !!serverPricing.subscriptionDetails?.isSubscriptionApplied,
        planName: serverPricing.subscriptionDetails?.planName || "",
        userSubscriptionId: serverPricing.subscriptionDetails?.userSubscriptionId || null
      };
    }

    const fallbackBase = Number(bookingData?.fee || 0);
    return {
      baseFee: fallbackBase,
      originalBaseFee: fallbackBase,
      visitCharges: 0,
      extraCharges: 0,
      discountAmount: 0,
      subtotal: fallbackBase,
      total: fallbackBase,
      isCodAvailable: false,
      isSubscriptionApplied: false,
      planName: "",
      userSubscriptionId: null
    };
  }, [serverPricing, bookingData]);

  // Apply Coupon Handler
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsValidatingCoupon(true);
    setAppliedCouponCode(couponCode.trim().toUpperCase());
  };

  const handleRemoveCoupon = () => {
    setAppliedCouponCode("");
    setCouponCode("");
    setCouponError("");
  };

  // 6. Filter Out Past Slots and Group by Morning / Afternoon / Evening
  const groupedSlots = useMemo(() => {
    if (!availableSlots || availableSlots.length === 0) {
      return { morning: [], afternoon: [], evening: [], totalCount: 0 };
    }

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const isToday = selectedDate === todayStr;
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // 1. Filter out past slots if the selected date is today
    const validSlots = availableSlots.filter((slot) => {
      if (!isToday) return true;
      const { hour, minute } = parseSlotTime(slot.time);
      if (hour < currentHour) return false;
      if (hour === currentHour && minute <= currentMinute) return false;
      return true;
    });

    // 2. Partition into Morning (<12:00), Afternoon (12:00 - 16:59), Evening (>=17:00)
    const morning = [];
    const afternoon = [];
    const evening = [];

    validSlots.forEach((slot) => {
      const { hour } = parseSlotTime(slot.time);
      if (hour < 12) {
        morning.push(slot);
      } else if (hour < 17) {
        afternoon.push(slot);
      } else {
        evening.push(slot);
      }
    });

    return {
      morning,
      afternoon,
      evening,
      totalCount: validSlots.length
    };
  }, [availableSlots, selectedDate]);

  // 7. Final Booking Handler (1.2 Book + 7.0 Payment Verify)
  const handleFinalBooking = async () => {
    if (!selectedSlot) {
      CostoumPopup("Please select an appointment time slot", "warning", 3000);
      return;
    }
    if (!selectedMember) {
      CostoumPopup("Please select a patient", "warning", 3000);
      return;
    }
    if (mappedConsultationType === "Home Visit" && !selectedAddress) {
      CostoumPopup("Please select a delivery address for Home Visit", "warning", 3000);
      return;
    }

    try {
      setIsSubmitting(true);

      const isFreeOrSubscribed = pricing.total === 0 || pricing.isSubscriptionApplied;
      const finalPaymentMethod = isFreeOrSubscribed ? "COD" : paymentMethod;

      const payload = {
        doctorId: bookingData.doctorId,
        consultationType: mappedConsultationType,
        appointmentDate: selectedDate,
        timeSlot: selectedSlot.time,
        paymentMethod: finalPaymentMethod,
        couponCode: appliedCouponCode || undefined,
        patients: [{
          patientName: selectedMember.memberName || selectedMember.name,
          patientAge: Number(selectedMember.patientAge || selectedMember.age || 25),
          gender: selectedMember.gender || "Male",
          relation: selectedMember.relation || "Self"
        }],
        address: (mappedConsultationType === "Home Visit" && selectedAddress) ? {
          houseNo: selectedAddress.houseNo,
          sector: selectedAddress.sector,
          city: selectedAddress.city,
          state: selectedAddress.state,
          pincode: selectedAddress.pincode,
          addressType: selectedAddress.addressType || "Home"
        } : undefined,
        pricingBreakdown: {
          baseFee: pricing.baseFee,
          originalBaseFee: pricing.originalBaseFee,
          visitCharges: pricing.visitCharges,
          extraCharges: pricing.extraCharges,
          discountAmount: pricing.discountAmount,
          subtotal: pricing.subtotal
        },
        totalAmount: pricing.total
      };

      const bookingRes = await UserAPI.bookDoctorAppointment(payload);

      if (!bookingRes?.success) {
        CostoumPopup(bookingRes?.message || "Failed to initiate booking", "error", 4000);
        setIsSubmitting(false);
        return;
      }

      // --- CASE A: Free Booking / Subscribed User / COD ---
      if (isFreeOrSubscribed || finalPaymentMethod === "COD" || bookingRes.data?.paymentStatus === "Paid") {
        localStorage.removeItem('pendingBooking');
        setConfirmedBookingDetails(bookingRes.data || { bookingId: "CONFIRMED" });
        setIsSubmitting(false);
        return;
      }

      // --- CASE B: Online Payment via Razorpay ---
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        CostoumPopup("Failed to load Razorpay SDK. Please check your internet connection.", "error", 4000);
        setIsSubmitting(false);
        return;
      }

      const options = {
        key: bookingRes.key_id,
        amount: bookingRes.amount,
        currency: "INR",
        name: "Health Kangaroo",
        description: `Consultation with Dr. ${bookingData.doctorName}`,
        order_id: bookingRes.razorpayOrderId,
        prefill: {
          name: selectedMember.memberName || selectedMember.name,
          contact: selectedMember.phone || "",
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
            const verificationRes = await UserAPI.verifyPaymentDoctor({
              appointmentId: bookingRes.appointmentId || bookingRes.data?._id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            });

            if (verificationRes?.success) {
              localStorage.removeItem('pendingBooking');
              setConfirmedBookingDetails(verificationRes.data || { bookingId: bookingRes.bookingId });
            } else {
              CostoumPopup("Payment verification failed. Please contact support.", "error", 4000);
            }
          } catch (e) {
            CostoumPopup("Verification error occurred.", "error", 4000);
          } finally {
            setIsSubmitting(false);
          }
        }
      };

      const rzpInstance = new window.Razorpay(options);
      rzpInstance.open();

    } catch (error) {
      console.error("Booking error:", error);
      CostoumPopup("An error occurred during booking. Please try again.", "error", 4000);
      setIsSubmitting(false);
    }
  };

  const getNextDays = () => {
    const days = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      days.push({
        full: d.toISOString().split('T')[0],
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        date: d.getDate()
      });
    }
    return days;
  };

  if (!bookingData) return null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20 font-sans">
      {/* HEADER */}
      <div className="border-b border-slate-200 sticky top-0 bg-white z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors">
            <FaArrowLeft size={14} />
            <span className="text-xs font-bold uppercase tracking-wider">Back</span>
          </button>
          <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Doctor Booking Checkout</div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* LEFT COLUMN: SELECTIONS */}
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
              <h1 className="text-2xl font-black text-slate-900">Confirm Appointment</h1>
              <p className="text-slate-500 text-xs mt-1">Select patient details, consultation date & preferred time.</p>
              
              {/* VIP Subscription Badge */}
              {pricing.isSubscriptionApplied && (
                <div className="mt-4 flex items-center gap-2.5 px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-2xl">
                  <FaGem className="text-emerald-600" size={14} />
                  <div>
                    <span className="text-xs font-black text-emerald-800 uppercase tracking-wide">
                      {pricing.planName} Active
                    </span>
                    <p className="text-[11px] font-semibold text-emerald-600">Base consultation fee waived (₹0)</p>
                  </div>
                </div>
              )}
            </div>

            {/* SELECT PATIENT */}
            <section className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">1. Select Patient</h3>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {loadingSelectionData ? (
                  [1, 2].map(i => <div key={i} className="w-44 h-20 bg-slate-100 animate-pulse rounded-2xl" />)
                ) : (
                  familyMembers.map((member) => {
                    const isSelected = selectedMember?._id === member._id;
                    return (
                      <button
                        key={member._id}
                        onClick={() => setSelectedMember(member)}
                        className={`flex-shrink-0 w-44 p-4 rounded-2xl border transition-all text-left relative
                          ${isSelected ? 'border-emerald-600 bg-emerald-50/40 shadow-sm ring-1 ring-emerald-500' : 'bg-white border-slate-200 hover:border-slate-300'}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                            {member.profilePic ? (
                              <img src={member.profilePic} className="w-full h-full object-cover" alt="Profile" />
                            ) : (
                              <FaUserCircle className="text-slate-300 w-full h-full" />
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900 truncate w-24">{member.memberName || member.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{member.relation}</p>
                          </div>
                        </div>
                        {isSelected && <FaCheckCircle className="absolute top-2 right-2 text-emerald-600" size={14} />}
                      </button>
                    );
                  })
                )}
              </div>
            </section>

            {/* SELECT DATE */}
            <section className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">2. Select Date</h3>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {getNextDays().map((item) => {
                  const isSelected = selectedDate === item.full;
                  return (
                    <button
                      key={item.full}
                      onClick={() => setSelectedDate(item.full)}
                      className={`flex-shrink-0 w-16 h-20 rounded-2xl border transition-all flex flex-col items-center justify-center
                        ${isSelected
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-600/20'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-300'}`}
                    >
                      <span className="text-[10px] font-bold uppercase opacity-80">{item.day}</span>
                      <span className="text-xl font-black">{item.date}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* SELECT TIME SLOT (FILTERED PAST SLOTS & GROUPED BY MORNING/AFTERNOON/EVENING) */}
            <section className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">3. Available Slots</h3>
                {groupedSlots.totalCount > 0 && (
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                    {groupedSlots.totalCount} slots available
                  </span>
                )}
              </div>

              {loadingSlots ? (
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {[1, 2, 3, 4].map(i => <div key={i} className="h-14 bg-slate-100 animate-pulse rounded-xl" />)}
                </div>
              ) : groupedSlots.totalCount > 0 ? (
                <div className="space-y-5">
                  {/* MORNING SLOTS */}
                  {groupedSlots.morning.length > 0 && (
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2 text-slate-600">
                        <FaSun size={12} className="text-amber-500" />
                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-700">Morning Slots</span>
                        <span className="text-[10px] text-slate-400 font-semibold">({groupedSlots.morning.length})</span>
                      </div>
                      <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                        {groupedSlots.morning.map((slot, idx) => {
                          const isAvailable = slot.available && !slot.isBooked && !slot.isBlocked;
                          const isSelected = selectedSlot?.time === slot.time;
                          const premiumFee = Number(slot.premiumFee || 0);

                          return (
                            <button
                              key={`morning-${idx}`}
                              disabled={!isAvailable}
                              onClick={() => setSelectedSlot(slot)}
                              className={`relative py-2.5 px-2 min-h-[3.25rem] rounded-xl border text-xs font-black transition-all flex flex-col items-center justify-center
                                ${!isAvailable ? 'opacity-30 bg-slate-50 cursor-not-allowed border-slate-200' : ''}
                                ${isSelected ? 'bg-slate-900 border-slate-900 text-white shadow-md' : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-500'}`}
                            >
                              <span className="leading-tight">{slot.time}</span>
                              {premiumFee > 0 && (
                                <div className={`flex items-center gap-1 text-[10px] font-bold mt-1 ${isSelected ? 'text-amber-300' : 'text-amber-600'}`}>
                                  <FaCrown size={9} />
                                  <span>+₹{premiumFee}</span>
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* AFTERNOON SLOTS */}
                  {groupedSlots.afternoon.length > 0 && (
                    <div className="space-y-2.5 pt-2">
                      <div className="flex items-center gap-2 text-slate-600">
                        <FaCloudSun size={13} className="text-orange-500" />
                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-700">Afternoon Slots</span>
                        <span className="text-[10px] text-slate-400 font-semibold">({groupedSlots.afternoon.length})</span>
                      </div>
                      <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                        {groupedSlots.afternoon.map((slot, idx) => {
                          const isAvailable = slot.available && !slot.isBooked && !slot.isBlocked;
                          const isSelected = selectedSlot?.time === slot.time;
                          const premiumFee = Number(slot.premiumFee || 0);

                          return (
                            <button
                              key={`afternoon-${idx}`}
                              disabled={!isAvailable}
                              onClick={() => setSelectedSlot(slot)}
                              className={`relative py-2.5 px-2 min-h-[3.25rem] rounded-xl border text-xs font-black transition-all flex flex-col items-center justify-center
                                ${!isAvailable ? 'opacity-30 bg-slate-50 cursor-not-allowed border-slate-200' : ''}
                                ${isSelected ? 'bg-slate-900 border-slate-900 text-white shadow-md' : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-500'}`}
                            >
                              <span className="leading-tight">{slot.time}</span>
                              {premiumFee > 0 && (
                                <div className={`flex items-center gap-1 text-[10px] font-bold mt-1 ${isSelected ? 'text-amber-300' : 'text-amber-600'}`}>
                                  <FaCrown size={9} />
                                  <span>+₹{premiumFee}</span>
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* EVENING SLOTS */}
                  {groupedSlots.evening.length > 0 && (
                    <div className="space-y-2.5 pt-2">
                      <div className="flex items-center gap-2 text-slate-600">
                        <FaMoon size={12} className="text-indigo-500" />
                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-700">Evening Slots</span>
                        <span className="text-[10px] text-slate-400 font-semibold">({groupedSlots.evening.length})</span>
                      </div>
                      <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                        {groupedSlots.evening.map((slot, idx) => {
                          const isAvailable = slot.available && !slot.isBooked && !slot.isBlocked;
                          const isSelected = selectedSlot?.time === slot.time;
                          const premiumFee = Number(slot.premiumFee || 0);

                          return (
                            <button
                              key={`evening-${idx}`}
                              disabled={!isAvailable}
                              onClick={() => setSelectedSlot(slot)}
                              className={`relative py-2.5 px-2 min-h-[3.25rem] rounded-xl border text-xs font-black transition-all flex flex-col items-center justify-center
                                ${!isAvailable ? 'opacity-30 bg-slate-50 cursor-not-allowed border-slate-200' : ''}
                                ${isSelected ? 'bg-slate-900 border-slate-900 text-white shadow-md' : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-500'}`}
                            >
                              <span className="leading-tight">{slot.time}</span>
                              {premiumFee > 0 && (
                                <div className={`flex items-center gap-1 text-[10px] font-bold mt-1 ${isSelected ? 'text-amber-300' : 'text-amber-600'}`}>
                                  <FaCrown size={9} />
                                  <span>+₹{premiumFee}</span>
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-slate-400 text-xs font-semibold">No active slots available for this date.</p>
                </div>
              )}
            </section>

            {/* ADDRESS SELECTION (For Home Visit) */}
            {mappedConsultationType === "Home Visit" && (
              <section className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">4. Home Visit Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {loadingSelectionData ? (
                    [1, 2].map(i => <div key={i} className="h-24 bg-slate-100 animate-pulse rounded-2xl" />)
                  ) : (
                    addresses.map((addr) => {
                      const isSelected = selectedAddress?._id === addr._id;
                      return (
                        <button
                          key={addr._id}
                          onClick={() => setSelectedAddress(addr)}
                          className={`p-4 rounded-2xl border transition-all text-left relative
                            ${isSelected ? 'border-emerald-600 bg-emerald-50/30 ring-1 ring-emerald-500' : 'bg-white border-slate-200 hover:border-slate-300'}`}
                        >
                          <div className="flex items-start gap-3">
                            <FaMapMarkerAlt className={`mt-1 text-sm ${isSelected ? 'text-emerald-600' : 'text-slate-300'}`} />
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-xs font-black text-slate-900">{addr.addressType}</p>
                                {addr.isDefault && <span className="text-[8px] bg-slate-900 text-white px-1.5 py-0.5 rounded-full uppercase font-bold">Default</span>}
                              </div>
                              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                                {addr.houseNo}, {addr.sector}, {addr.city}, {addr.state} - {addr.pincode}
                              </p>
                            </div>
                          </div>
                          {isSelected && <FaCheckCircle className="absolute top-4 right-4 text-emerald-600" size={14} />}
                        </button>
                      );
                    })
                  )}
                </div>
              </section>
            )}

            {/* PAYMENT METHOD SELECTION */}
            {pricing.total > 0 && (
              <section className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">
                  {mappedConsultationType === "Home Visit" ? "5. Payment Method" : "4. Payment Method"}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Online Option */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("Online")}
                    className={`p-4 rounded-2xl border transition-all text-left flex items-center justify-between
                      ${paymentMethod === "Online" ? 'border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-500' : 'bg-white border-slate-200'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl">
                        <FaCreditCard size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900">Pay Online</p>
                        <p className="text-[10px] text-slate-500">UPI, Cards, NetBanking</p>
                      </div>
                    </div>
                    {paymentMethod === "Online" && <FaCheckCircle className="text-emerald-600" size={16} />}
                  </button>

                  {/* COD / Pay at Clinic Option */}
                  <button
                    type="button"
                    disabled={!pricing.isCodAvailable}
                    onClick={() => setPaymentMethod("COD")}
                    className={`p-4 rounded-2xl border transition-all text-left flex items-center justify-between relative
                      ${!pricing.isCodAvailable ? 'opacity-40 cursor-not-allowed bg-slate-50 border-slate-200' : ''}
                      ${paymentMethod === "COD" ? 'border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-500' : 'bg-white border-slate-200'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-slate-100 text-slate-700 rounded-xl">
                        <FaMoneyBillWave size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900">Pay at Clinic / COD</p>
                        <p className="text-[10px] text-slate-500">
                          {pricing.isCodAvailable ? "Pay during your consultation" : "Unavailable for this vendor"}
                        </p>
                      </div>
                    </div>
                    {paymentMethod === "COD" && <FaCheckCircle className="text-emerald-600" size={16} />}
                  </button>
                </div>
              </section>
            )}
          </div>

          {/* RIGHT COLUMN: SUMMARY & CONFIRMATION */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm sticky top-24 space-y-6">
              
              {/* Doctor Info Header */}
              <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                <img
                  src={bookingData.profileImage || "/default-doctor.png"}
                  className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-sm"
                  alt="Doctor"
                />
                <div>
                  <h4 className="font-black text-slate-900 text-sm">Dr. {bookingData.doctorName}</h4>
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mt-0.5">{bookingData.speciality}</p>
                  <p className="text-[11px] text-slate-400 font-semibold">{mappedConsultationType}</p>
                </div>
              </div>

              {/* Costing Breakdown */}
              <div className="space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-medium">Consultation Fee</span>
                  <div className="text-right">
                    <span className={`font-black ${pricing.isSubscriptionApplied ? 'line-through text-slate-300 mr-2' : 'text-slate-900'}`}>
                      ₹{pricing.originalBaseFee}
                    </span>
                    {pricing.isSubscriptionApplied && (
                      <span className="text-emerald-600 font-black">₹0 (Waived)</span>
                    )}
                  </div>
                </div>

                {pricing.extraCharges > 0 && (
                  <div className="flex justify-between text-xs text-amber-700 font-bold">
                    <span>Premium Slot Surcharge</span>
                    <span>+₹{pricing.extraCharges}</span>
                  </div>
                )}

                {pricing.visitCharges > 0 && (
                  <div className="flex justify-between text-xs text-slate-700">
                    <span className="text-slate-500 font-medium">Home Visit Charge</span>
                    <span className="font-black">+₹{pricing.visitCharges}</span>
                  </div>
                )}

                {pricing.discountAmount > 0 && (
                  <div className="flex justify-between text-xs text-emerald-600 font-bold">
                    <span>Coupon Discount</span>
                    <span>-₹{pricing.discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="h-px bg-slate-100 my-2" />

                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Total Payable</span>
                    <span className="text-[10px] text-slate-400 font-medium">Inclusive of all taxes</span>
                  </div>
                  <span className="text-2xl font-black text-slate-900">
                    ₹{pricing.total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Coupon Section */}
              <div className="space-y-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="COUPON CODE"
                    value={couponCode}
                    disabled={pricing.isSubscriptionApplied}
                    onChange={(e) => {
                      setCouponCode(e.target.value.toUpperCase());
                      if (couponError) setCouponError("");
                    }}
                    className={`w-full bg-slate-50 border rounded-xl py-3 pl-9 pr-24 text-xs font-bold uppercase focus:ring-2 transition-all outline-none
                      ${pricing.isSubscriptionApplied ? 'opacity-50 cursor-not-allowed' : ''}
                      ${couponError ? 'border-rose-400 focus:ring-rose-500/10' : 'border-slate-200 focus:ring-emerald-500/20'}`}
                  />
                  <FaTag className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={11} />

                  <button
                    disabled={isValidatingCoupon || pricing.isSubscriptionApplied || (!couponCode && !appliedCouponCode)}
                    onClick={() => appliedCouponCode ? handleRemoveCoupon() : handleApplyCoupon()}
                    className={`absolute right-1.5 top-1.5 bottom-1.5 px-3 rounded-lg text-[10px] font-black uppercase transition-all
                      ${appliedCouponCode ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' : 'bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-200'}`}
                  >
                    {isValidatingCoupon ? <FaSpinner className="animate-spin" /> : appliedCouponCode ? 'Remove' : 'Apply'}
                  </button>
                </div>
                {couponError && <p className="text-[10px] font-bold text-rose-500 ml-1">{couponError}</p>}
              </div>

              {/* Book Button */}
              <button
                disabled={!selectedSlot || !selectedMember || isSubmitting || isFetchingSummary}
                onClick={handleFinalBooking}
                className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2
                  ${(selectedSlot && selectedMember && !isSubmitting && !isFetchingSummary)
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 active:scale-95'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
              >
                {isSubmitting || isFetchingSummary ? (
                  <FaSpinner className="animate-spin" size={14} />
                ) : pricing.total === 0 ? (
                  <>Confirm Free Appointment <FaArrowRight size={11} /></>
                ) : paymentMethod === "COD" ? (
                  <>Confirm & Pay at Clinic <FaArrowRight size={11} /></>
                ) : (
                  <>Proceed to Pay ₹{pricing.total.toFixed(2)} <FaLock size={10} /></>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* DETAILED CONFIRMATION SUCCESS MODAL */}
      {confirmedBookingDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] max-w-lg w-full border border-slate-100 shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in duration-200">
            
            {/* Header / Success Banner */}
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-6 text-white text-center relative">
              <div className="mx-auto w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white mb-3 shadow-inner">
                <FaCheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-black tracking-tight">Appointment Confirmed!</h3>
              <p className="text-emerald-100 text-xs mt-1">
                Your consultation request has been successfully booked.
              </p>
              
              <div className="mt-3 inline-flex items-center gap-2 bg-black/20 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[11px] font-mono font-bold tracking-wider">
                <span>ID:</span>
                <span className="text-emerald-300">{confirmedBookingDetails.bookingId || confirmedBookingDetails._id || "CONFIRMED"}</span>
              </div>
            </div>

            {/* Modal Body: Full Details */}
            <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
              
              {/* Doctor Details */}
              <div className="flex items-center gap-3.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <img
                  src={bookingData.profileImage || "/default-doctor.png"}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-xs"
                  alt="Doctor"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase">
                    <FaStethoscope size={10} />
                    <span>{bookingData.speciality}</span>
                  </div>
                  <h4 className="font-black text-slate-900 text-sm truncate">Dr. {bookingData.doctorName}</h4>
                  <p className="text-[11px] font-bold text-slate-500">{mappedConsultationType}</p>
                </div>
              </div>

              {/* Patient & Schedule Grid */}
              <div className="grid grid-cols-2 gap-3">
                {/* Patient */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                    <FaUserAlt size={10} className="text-slate-400" />
                    <span>Patient</span>
                  </div>
                  <p className="text-xs font-black text-slate-800 truncate">
                    {selectedMember?.memberName || selectedMember?.name}
                  </p>
                  <p className="text-[10px] text-slate-500 font-semibold">
                    {selectedMember?.relation} • {selectedMember?.gender || "Male"}
                  </p>
                </div>

                {/* Schedule */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                    <FaCalendarAlt size={10} className="text-slate-400" />
                    <span>Schedule</span>
                  </div>
                  <p className="text-xs font-black text-slate-800">
                    {selectedDate}
                  </p>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                    <FaClock size={9} />
                    <span>{selectedSlot?.time}</span>
                  </div>
                </div>
              </div>

              {/* Home Visit Address (If applicable) */}
              {mappedConsultationType === "Home Visit" && selectedAddress && (
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-3">
                  <FaMapMarkerAlt className="text-emerald-600 mt-1 shrink-0" size={13} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Visit Location</span>
                      <span className="text-[9px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-bold">{selectedAddress.addressType}</span>
                    </div>
                    <p className="text-xs text-slate-700 font-semibold mt-0.5 leading-relaxed">
                      {selectedAddress.houseNo}, {selectedAddress.sector}, {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
                    </p>
                  </div>
                </div>
              )}

              {/* OTP Verification Card (If present) */}
              {confirmedBookingDetails.tracking?.otp && (
                <div className="flex items-center justify-between p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                      <FaKey size={12} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-amber-700">Verification OTP</p>
                      <p className="text-[10px] text-amber-600 font-semibold">Share with doctor upon arrival</p>
                    </div>
                  </div>
                  <span className="text-base font-mono font-black text-amber-900 tracking-widest bg-white px-3 py-1 rounded-xl border border-amber-200 shadow-xs">
                    {confirmedBookingDetails.tracking.otp}
                  </span>
                </div>
              )}

              {/* Payment Summary */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-1.5 text-slate-500 font-bold">
                    <FaReceipt size={11} className="text-slate-400" />
                    <span>Payment Status</span>
                  </div>
                  <span className="font-black text-emerald-600 uppercase px-2 py-0.5 bg-emerald-100/60 rounded-lg text-[10px]">
                    {confirmedBookingDetails.paymentStatus || (pricing.total === 0 ? "Complimentary" : "Paid")}
                  </span>
                </div>

                <div className="flex justify-between text-slate-500">
                  <span>Payment Mode:</span>
                  <span className="font-bold text-slate-800">
                    {pricing.total === 0 ? "Subscription / Free" : paymentMethod === "COD" ? "Pay at Clinic / COD" : "Online (Razorpay)"}
                  </span>
                </div>

                {pricing.extraCharges > 0 && (
                  <div className="flex justify-between text-slate-500">
                    <span>Premium Slot Fee:</span>
                    <span className="font-bold text-slate-800">+₹{pricing.extraCharges}</span>
                  </div>
                )}

                {pricing.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount Applied:</span>
                    <span className="font-bold">-₹{pricing.discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-900 font-black pt-1 border-t border-slate-200 text-sm">
                  <span>Total Amount:</span>
                  <span className="text-emerald-600">₹{pricing.total.toFixed(2)}</span>
                </div>
              </div>

            </div>

            {/* Footer Action */}
            <div className="p-6 pt-2 bg-white">
              <button
                onClick={() => {
                  setConfirmedBookingDetails(null);
                  router.push('/userscreens/doctorappointment');
                }}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-slate-900/10 transition-all active:scale-98 flex items-center justify-center gap-2"
              >
                <span>View My Appointments</span>
                <FaArrowRight size={11} />
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}