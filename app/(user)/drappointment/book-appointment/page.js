"use client";

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaArrowLeft, FaArrowRight,
  FaCrown, FaTag, FaSpinner,
  FaUserCircle, FaMapMarkerAlt, FaCheckCircle, FaGem,
  FaMoneyBillWave, FaCreditCard, FaLock
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
        }]
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
  }, [bookingData, selectedSlot, selectedMember, selectedDate, mappedConsultationType, appliedCouponCode, paymentMethod]);

  // Trigger Checkout Summary on dependency changes
  useEffect(() => {
    if (selectedSlot && selectedMember && selectedDate) {
      fetchSummary(appliedCouponCode);
    }
  }, [selectedSlot, selectedMember, selectedDate, fetchSummary, appliedCouponCode]);

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

  // 6. Final Booking Handler (1.2 Book + 7.0 Payment Verify)
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
        address: selectedAddress ? {
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

            {/* SELECT TIME SLOT */}
            <section className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">3. Available Slots</h3>
              {loadingSlots ? (
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {[1, 2, 3, 4].map(i => <div key={i} className="h-12 bg-slate-100 animate-pulse rounded-xl" />)}
                </div>
              ) : availableSlots.length > 0 ? (
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {availableSlots.map((slot, idx) => {
                    const isAvailable = slot.available && !slot.isBooked && !slot.isBlocked;
                    const isSelected = selectedSlot?.time === slot.time;
                    return (
                      <button
                        key={idx}
                        disabled={!isAvailable}
                        onClick={() => setSelectedSlot(slot)}
                        className={`relative h-12 rounded-xl border text-xs font-black transition-all
                          ${!isAvailable ? 'opacity-30 bg-slate-50 cursor-not-allowed border-slate-200' : ''}
                          ${isSelected ? 'bg-slate-900 border-slate-900 text-white shadow-md' : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-500'}`}
                      >
                        {slot.time}
                        {Number(slot.premiumFee) > 0 && (
                          <FaCrown size={9} className={`absolute top-1 right-1 ${isSelected ? 'text-amber-300' : 'text-amber-500'}`} />
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-slate-400 text-xs italic py-2">No slots available for the selected date.</p>
              )}
            </section>

            {/* ADDRESS SELECTION (For Home Visit or optional for clinic) */}
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
                  {mappedConsultationType === "Home Visit" ? "4. Payment Method" : "4. Payment Method"}
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

      {/* CONFIRMATION SUCCESS MODAL */}
      {confirmedBookingDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] p-8 max-w-md w-full border border-slate-100 shadow-2xl text-center space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="mx-auto w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
              <FaCheckCircle className="w-9 h-9" />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-2xl font-black text-slate-900">Appointment Booked!</h3>
              <p className="text-xs font-semibold text-slate-500">
                Your consultation has been confirmed.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Booking ID:</span>
                <span className="font-bold text-slate-800">{confirmedBookingDetails.bookingId || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Payment Status:</span>
                <span className="font-black text-emerald-600 uppercase">{confirmedBookingDetails.paymentStatus || "Paid"}</span>
              </div>
              {confirmedBookingDetails.tracking?.otp && (
                <div className="flex justify-between pt-2 border-t border-slate-200">
                  <span className="text-slate-500 font-bold">Verification OTP:</span>
                  <span className="font-black text-sm text-slate-900 tracking-widest">{confirmedBookingDetails.tracking.otp}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setConfirmedBookingDetails(null);
                router.push('/userscreens/doctorappointment');
              }}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
            >
              View My Appointments
            </button>
          </div>
        </div>
      )}
    </div>
  );
}