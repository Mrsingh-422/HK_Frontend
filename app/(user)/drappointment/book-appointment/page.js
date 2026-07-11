"use client";

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaArrowLeft, FaArrowRight,
  FaCrown, FaTag, FaSpinner,
  FaUserCircle, FaMapMarkerAlt, FaCheckCircle, FaGem
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import UserAPI from "@/app/services/UserAPI";
import { useGlobalContext } from '@/app/context/GlobalContext';
import CostoumPopup from '@/lib/CostoumPopup';

// Utility to dynamically load the Razorpay SDK script
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

export default function BookingConfirmation() {
  const router = useRouter();
  const { openModal, modalType, closeModal } = useGlobalContext();

  // Core States
  const [bookingData, setBookingData] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [couponError, setCouponError] = useState("");

  // Selection States
  const [familyMembers, setFamilyMembers] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [loadingSelectionData, setLoadingSelectionData] = useState(true);

  // --- SUBSCRIPTION & SERVER PRICING STATE ---
  const [serverPricing, setServerPricing] = useState(null);
  const [isFetchingSummary, setIsFetchingSummary] = useState(false);

  const [visitCharges, setVisitCharges] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Initialize Data
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
      fetchDoctorCoupons(parsed.doctorId);
      fetchSelectionData();
      fetchVisitCharges(parsed.doctorId);
    } else {
      router.push('/');
    }
  }, [router]);

  const fetchSelectionData = async () => {
    try {
      setLoadingSelectionData(true);
      const [addrRes, familyRes] = await Promise.all([
        UserAPI.getUserAddresses(),
        UserAPI.getFamilyMembers()
      ]);
      if (addrRes.success) setAddresses(addrRes.data);
      if (familyRes.success) setFamilyMembers(familyRes.data);
    } catch (error) {
      console.error("Error fetching selection data", error);
    } finally {
      setLoadingSelectionData(false);
    }
  };

  const fetchVisitCharges = async (id) => {
    try {
      const res = await UserAPI.getDoctorVisitCharges(id);
      if (res.success) setVisitCharges(res.data);
    } catch (error) {
      console.error("Error fetching visit charges", error);
    }
  };

  const fetchSlots = useCallback(async (date) => {
    if (!bookingData?.doctorId) return;
    try {
      setLoadingSlots(true);
      setSelectedSlot(null);
      const res = await UserAPI.getDoctorAvailability(bookingData.doctorId, date);
      if (res.success) setAvailableSlots(res.slots || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingSlots(false);
    }
  }, [bookingData]);

  useEffect(() => {
    if (selectedDate) fetchSlots(selectedDate);
  }, [selectedDate, fetchSlots]);

  const fetchDoctorCoupons = async (id) => {
    try {
      const res = await UserAPI.getDoctorCoupons(id);
      if (res.success) setCoupons(res.data);
    } catch (error) { console.error(error); }
  };

  // --- FETCH SERVER-SIDE PRICING SUMMARY (Audit Tracker Integration) ---
  useEffect(() => {
    const fetchSummary = async () => {
      if (!selectedSlot || !selectedMember) return;

      try {
        setIsFetchingSummary(true);
        let mappedType = "Clinic Visit";
        if (bookingData.selectedService === "Virtual Consultation") mappedType = "Video Consult";
        else if (bookingData.selectedService === "Home Care") mappedType = "Home Visit";

        const payload = {
          doctorId: bookingData.doctorId,
          consultationType: mappedType,
          appointmentDate: selectedDate,
          timeSlot: selectedSlot.time,
          patients: [{
            patientName: selectedMember.memberName,
            patientAge: Number(selectedMember.patientAge || selectedMember.age || 20),
            gender: selectedMember.gender || "Male",
            relation: selectedMember.relation || "Self"
          }]
        };

        const res = await UserAPI.doctorCheckoutSummary(payload);
        if (res.success) {
          setServerPricing(res.data);
        }
      } catch (error) {
        console.error("Error fetching summary", error);
      } finally {
        setIsFetchingSummary(false);
      }
    };

    fetchSummary();
  }, [selectedSlot, selectedMember, selectedDate, bookingData]);

  // Pricing Logic (Mapping Server Keys to UI)
  const pricing = useMemo(() => {
    if (serverPricing) {
      return {
        base: serverPricing.baseFee,
        originalBase: serverPricing.originalBaseFee, // From Audit Tracker
        premium: serverPricing.premiumFee,
        platform: 0,
        homeVisitFee: serverPricing.visitCharge,
        subtotal: serverPricing.subtotal,
        discount: serverPricing.discount,
        total: serverPricing.totalPayable,
        isSubscriptionApplied: serverPricing.subscriptionDetails?.isSubscriptionApplied,
        planName: serverPricing.subscriptionDetails?.planName,
        subscriptionId: serverPricing.subscriptionDetails?.userSubscriptionId
      };
    }

    const base = Number(bookingData?.fee || 0);
    return {
      base, originalBase: base, premium: 0, platform: 0, homeVisitFee: 0,
      subtotal: base, discount: 0, total: base, isSubscriptionApplied: false
    };
  }, [bookingData, serverPricing]);

  const handleApplyCoupon = async (codeToApply) => {
    const code = codeToApply || couponCode;
    if (!code) return;
    setIsValidating(true);
    setCouponError("");
    try {
      const res = await UserAPI.validateDoctorCoupon({
        couponCode: code,
        nurseId: bookingData.doctorId,
        totalAmount: pricing.subtotal
      });
      if (res.success) {
        setAppliedCoupon(res.data);
        setCouponCode(code.toUpperCase());
        setCouponError("");
      } else {
        setAppliedCoupon(null);
        setCouponError(res.message || "Invalid coupon");
      }
    } catch (e) {
      setAppliedCoupon(null);
      setCouponError("Coupon validation failed");
    } finally {
      setIsValidating(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  };

  // FINAL BOOKING HANDLER (Handles Zero-Payment Skip)
  const handleFinalBooking = async () => {
    if (!selectedSlot || !selectedMember || !selectedAddress) return;

    try {
      setIsSubmitting(true);

      let mappedType = "Clinic Visit";
      if (bookingData.selectedService === "Virtual Consultation") mappedType = "Video Consult";
      else if (bookingData.selectedService === "Home Care") mappedType = "Home Visit";

      const payload = {
        doctorId: bookingData.doctorId,
        consultationType: mappedType,
        appointmentDate: selectedDate,
        timeSlot: selectedSlot.time,
        patients: [{
          patientName: selectedMember.memberName,
          patientAge: Number(selectedMember.patientAge || selectedMember.age || 20),
          gender: selectedMember.gender || "Male",
          relation: selectedMember.relation || "Self"
        }],
        address: {
          houseNo: selectedAddress.houseNo,
          sector: selectedAddress.sector,
          city: selectedAddress.city,
          state: selectedAddress.state,
          pincode: selectedAddress.pincode,
          addressType: selectedAddress.addressType || "Home"
        },
        // --- AUDIT TRACKER PAYLOAD ---
        pricingBreakdown: {
          baseFee: pricing.base,
          originalBaseFee: pricing.originalBase,
          visitCharges: pricing.homeVisitFee,
          extraCharges: pricing.platform,
          discountAmount: pricing.discount,
          subtotal: pricing.subtotal
        },
        totalAmount: pricing.total
      };

      const bookingRes = await UserAPI.bookDoctorAppointment(payload);
      if (!bookingRes.success) {
        alert(bookingRes.message || "Failed to initiate booking");
        setIsSubmitting(false);
        return;
      }

      // --- SKIP RAZORPAY IF TOTAL IS 0 ---
      if (bookingRes.amount === 0 || pricing.total === 0) {
        localStorage.removeItem('pendingBooking');
        setShowSuccessModal(true);
        setIsSubmitting(false);
        return;
      }

      // --- STANDARD RAZORPAY FLOW ---
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        alert("Failed to load Razorpay SDK.");
        setIsSubmitting(false);
        return;
      }

      const options = {
        key: bookingRes.key_id,
        amount: bookingRes.amount,
        currency: "INR",
        name: "HK Healthcare",
        description: "Doctor Consultation",
        order_id: bookingRes.razorpayOrderId,
        prefill: {
          name: selectedMember.memberName,
          contact: selectedMember.phone,
        },
        theme: { color: "#10b981" },
        modal: { ondismiss: () => setIsSubmitting(false) },
        handler: async function (response) {
          try {
            setIsSubmitting(true);
            const verificationRes = await UserAPI.verifyPaymentDoctor({
              appointmentId: bookingRes.appointmentId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            });

            if (verificationRes.success) {
              localStorage.removeItem('pendingBooking');
              setShowSuccessModal(true);
            } else {
              alert("Payment verification failed");
            }
          } catch (e) {
            alert("Verification error occurred.");
          } finally {
            setIsSubmitting(false);
          }
        }
      };

      const rzpInstance = new window.Razorpay(options);
      rzpInstance.open();

    } catch (error) {
      alert("An error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (!bookingData) return null;

  const getNextDays = () => {
    const days = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date(); d.setDate(d.getDate() + i);
      days.push({
        full: d.toISOString().split('T')[0],
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        date: d.getDate()
      });
    }
    return days;
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 pb-20 font-sans">
      {/* HEADER */}
      <div className="border-b border-slate-100 sticky top-0 bg-white z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors">
            <FaArrowLeft size={14} />
            <span className="text-xs font-bold uppercase tracking-wider">Back</span>
          </button>
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Step 2 of 3</div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* LEFT: SELECTIONS */}
          <div className="lg:col-span-7 space-y-12">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Booking Details</h1>
              <p className="text-slate-500 text-sm">Select patient, date, and location for the session.</p>
              
              {/* --- SUBSCRIPTION BADGE --- */}
              {pricing.isSubscriptionApplied && (
                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl">
                  <FaGem className="text-emerald-500" size={12} />
                  <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">
                    {pricing.planName} Active • Free Consultation Applied
                  </span>
                </div>
              )}
            </div>

            {/* FAMILY MEMBERS */}
            <section>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Select Patient</h3>
              <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                {loadingSelectionData ? [1, 2].map(i => <div key={i} className="w-40 h-20 bg-slate-50 animate-pulse rounded-2xl" />) : (
                  familyMembers.map((member) => (
                    <button
                      key={member._id}
                      onClick={() => setSelectedMember(member)}
                      className={`flex-shrink-0 w-44 p-4 rounded-2xl border transition-all text-left relative
                        ${selectedMember?._id === member._id ? 'border-emerald-600 bg-emerald-50/30' : 'bg-white border-slate-200 hover:border-emerald-300'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                          {member.profilePic ? <img src={member.profilePic} className="w-full h-full object-cover" /> : <FaUserCircle className="text-slate-300 w-full h-full" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 truncate w-24">{member.memberName}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{member.relation}</p>
                        </div>
                      </div>
                      {selectedMember?._id === member._id && <FaCheckCircle className="absolute top-2 right-2 text-emerald-600" size={14} />}
                    </button>
                  ))
                )}
              </div>
            </section>

            {/* DATE SELECTION */}
            <section>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Select Date</h3>
              <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                {getNextDays().map((item) => (
                  <button
                    key={item.full}
                    onClick={() => setSelectedDate(item.full)}
                    className={`flex-shrink-0 w-16 h-20 rounded-2xl border transition-all flex flex-col items-center justify-center
                      ${selectedDate === item.full
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-md'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-300'}`}
                  >
                    <span className="text-[10px] font-bold uppercase opacity-80">{item.day}</span>
                    <span className="text-xl font-bold">{item.date}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* TIME SELECTION */}
            <section>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Available Slots</h3>
              {loadingSlots ? (
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {[1, 2, 3, 4].map(i => <div key={i} className="h-12 bg-slate-50 animate-pulse rounded-xl" />)}
                </div>
              ) : (
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {availableSlots.length > 0 ? availableSlots.map((slot, idx) => {
                    const isAvailable = slot.available && !slot.isBooked && !slot.isBlocked;
                    const isSelected = selectedSlot?.time === slot.time;
                    return (
                      <button
                        key={idx}
                        disabled={!isAvailable}
                        onClick={() => setSelectedSlot(slot)}
                        className={`relative h-12 rounded-xl border transition-all text-sm font-bold
                          ${!isAvailable ? 'opacity-20 bg-slate-50 cursor-not-allowed' : ''}
                          ${isSelected ? 'bg-slate-900 border-slate-900 text-white shadow-md' : 'bg-white border-slate-200 hover:border-emerald-500'}`}
                      >
                        {slot.time}
                        {Number(slot.premiumFee) > 0 && <FaCrown size={8} className={`absolute top-1 right-1 ${isSelected ? 'text-emerald-400' : 'text-amber-500'}`} />}
                      </button>
                    );
                  }) : <p className="col-span-full text-slate-400 text-sm italic">No slots available for this date.</p>}
                </div>
              )}
            </section>

            {/* ADDRESS SELECTION */}
            <section>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Select Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {loadingSelectionData ? [1, 2].map(i => <div key={i} className="h-24 bg-slate-50 animate-pulse rounded-2xl" />) : (
                  addresses.map((addr) => (
                    <button
                      key={addr._id}
                      onClick={() => setSelectedAddress(addr)}
                      className={`p-4 rounded-2xl border transition-all text-left relative
                        ${selectedAddress?._id === addr._id ? 'border-emerald-600 bg-emerald-50/30' : 'bg-white border-slate-200 hover:border-emerald-300'}`}
                    >
                      <div className="flex items-start gap-3">
                        <FaMapMarkerAlt className={`mt-1 ${selectedAddress?._id === addr._id ? 'text-emerald-600' : 'text-slate-300'}`} />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-slate-900">{addr.addressType}</p>
                            {addr.isDefault && <span className="text-[8px] bg-slate-900 text-white px-1.5 rounded-full uppercase">Default</span>}
                          </div>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            {addr.houseNo}, {addr.sector}, {addr.city}, {addr.state} - {addr.pincode}
                          </p>
                        </div>
                      </div>
                      {selectedAddress?._id === addr._id && <FaCheckCircle className="absolute top-4 right-4 text-emerald-600" size={14} />}
                    </button>
                  ))
                )}
              </div>
            </section>
          </div>

          {/* RIGHT: SUMMARY */}
          <div className="lg:col-span-5">
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 sticky top-24">
              <div className="flex items-center gap-4 mb-8">
                <img src={bookingData.profileImage} className="w-14 h-14 rounded-xl object-cover border-2 border-white shadow-sm" alt="Doctor" />
                <div>
                  <h4 className="font-bold text-slate-900">Dr. {bookingData.doctorName}</h4>
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">{bookingData.speciality}</p>
                </div>
              </div>

              {/* COSTING */}
              <div className="space-y-3 mb-8">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Consultation Fee</span>
                  <div className="flex flex-col items-end">
                    <span className={`font-bold ${pricing.isSubscriptionApplied ? 'line-through text-slate-300 text-xs' : ''}`}>
                        ₹{pricing.originalBase}
                    </span>
                    {pricing.isSubscriptionApplied && (
                        <span className="text-emerald-600 font-black text-xs uppercase tracking-tighter">Plan Benefit: ₹0</span>
                    )}
                  </div>
                </div>
                {pricing.premium > 0 && (
                  <div className="flex justify-between text-sm text-amber-600 font-bold">
                    <span>Premium Slot Fee</span>
                    <span>+₹{pricing.premium}</span>
                  </div>
                )}
                {pricing.homeVisitFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Home Visit Fee</span>
                    <span className="font-bold">+₹{pricing.homeVisitFee}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Platform Fee</span>
                  <span className="font-bold">₹{pricing.platform}</span>
                </div>
                {pricing.discount > 0 && (
                  <div className="flex justify-between text-sm text-emerald-600 font-bold">
                    <span>Coupon Discount</span>
                    <span>-₹{pricing.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="h-px bg-slate-200 my-4" />
                <div className="flex justify-between items-end">
                  <span className="text-xs font-bold uppercase text-slate-400 tracking-widest">Grand Total</span>
                  <span className="text-3xl font-black text-slate-900">₹{pricing.total.toFixed(2)}</span>
                </div>
              </div>

              {/* COUPON SECTION */}
              <div className="space-y-4 mb-8">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="ENTER CODE"
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value.toUpperCase());
                      if (couponError) setCouponError("");
                    }}
                    className={`w-full bg-white border rounded-xl py-3 pl-10 pr-24 text-xs font-bold focus:ring-2 transition-all outline-none
                      ${couponError ? 'border-rose-500 focus:ring-rose-500/10' : 'border-slate-200 focus:ring-emerald-500/20'}`}
                  />
                  <FaTag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={12} />

                  <button
                    disabled={isValidating || (!couponCode && !appliedCoupon)}
                    onClick={() => appliedCoupon ? removeCoupon() : handleApplyCoupon()}
                    className={`absolute right-1 top-1 bottom-1 px-4 rounded-lg text-[10px] font-black uppercase transition-colors
                      ${appliedCoupon ? 'bg-rose-50 text-rose-600' : 'bg-slate-900 text-white disabled:bg-slate-200'}`}
                  >
                    {isValidating ? <FaSpinner className="animate-spin" /> : appliedCoupon ? 'Remove' : 'Apply'}
                  </button>
                </div>
                {couponError && <p className="text-[10px] font-bold text-rose-500 ml-1">{couponError}</p>}
              </div>

              <button
                disabled={!selectedSlot || !selectedMember || !selectedAddress || isSubmitting || isFetchingSummary}
                className={`w-full py-4 rounded-xl text-sm font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2
                  ${(selectedSlot && selectedMember && selectedAddress && !isSubmitting) ? 'bg-emerald-600 text-white shadow-lg hover:bg-emerald-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                onClick={handleFinalBooking}
              >
                {isSubmitting || isFetchingSummary ? <FaSpinner className="animate-spin" /> : pricing.total === 0 ? 'Confirm Free Booking' : 'Continue to Payment'} <FaArrowRight size={12} />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Booking Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full border border-slate-100 shadow-2xl text-center space-y-6 animate-in fade-in zoom-in duration-200">
            <div className="mx-auto w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
              <FaCheckCircle className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900">Booking Confirmed!</h3>
              <p className="text-sm font-semibold text-slate-600 leading-relaxed">
                Your appointment has been successfully booked. {pricing.isSubscriptionApplied && "One unit has been deducted from your plan benefits."}
              </p>
            </div>
            <button
              onClick={() => {
                setShowSuccessModal(false);
                router.push('/userscreens/doctorappointment');
              }}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-black text-base shadow-lg shadow-emerald-200 transition-all active:scale-95"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}