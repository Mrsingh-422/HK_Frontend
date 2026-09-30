"use client";
import React, { useState, useEffect } from 'react';
import {
  MapPin, ChevronDown, Camera, ShieldAlert, FileText,
  Calendar, Clock, User, CheckCircle2, Stethoscope,
  Activity, AlertCircle, Building2, ChevronLeft,
  Upload, Info, Hospital, ArrowRightLeft, CreditCard, Plus, Ticket, KeyRound
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import UserAPI from "@/app/services/UserAPI";
import { useGlobalContext } from '@/app/context/GlobalContext';
import CostoumPopup from '@/lib/CostoumPopup';

// Helper to load Razorpay SDK dynamically
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) {
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

export default function ReferralBookingPage() {
  const router = useRouter();
  const { openModal } = useGlobalContext();

  // --- State Management ---
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [bookingSuccessData, setBookingSuccessData] = useState(null);
  const [coords, setCoords] = useState({ lat: 30.6, lng: 76.7 });

  // Data Lists
  const [hospitals, setHospitals] = useState([]);
  const [ambulances, setAmbulances] = useState([]);
  const [familyMembers, setFamilyMembers] = useState([]);

  // Selection States
  const [selectedAmbulance, setSelectedAmbulance] = useState(null);
  const [referralCardFile, setReferralCardFile] = useState(null);

  // --- Date & 2-Hour Slot Picker States ---
  const getTodayDateString = () => new Date().toISOString().split('T')[0];
  const [scheduledDate, setScheduledDate] = useState(getTodayDateString());
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [slotsList, setSlotsList] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotError, setSlotError] = useState("");

  // Coupon States
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    pickupHospitalId: "",
    hospitalId: "", // Drop Hospital
    serviceType: "Referral Ambulance",
    triageLevel: "Urgent",
    paymentMethod: "COD",
    supportStaff: {
      nurse: false,
      doctor: false
    },
    referralReason: "",
    selectedPatientId: "self",
    patientName: "User",
    patientRelation: "Self"
  });

  // --- Initial Data Fetching ---
  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (!token) {
      CostoumPopup("Please Login To Continue", "warning", 4000);
      router.push('/ambulance');
      return;
    }
    const fetchData = async () => {
      try {
        const storedCoordsString = localStorage.getItem('userCoords');
        const userCoords = storedCoordsString ? JSON.parse(storedCoordsString) : { lat: 30.6, lng: 76.7 };
        setCoords(userCoords);

        const [hospRes, familyRes, ambRes] = await Promise.all([
          UserAPI.getHospitalsList(userCoords),
          UserAPI.getFamilyMembers(),
          UserAPI.getNearestAmbulances(userCoords)
        ]);

        if (hospRes.success) setHospitals(hospRes.data || []);
        if (familyRes.success) setFamilyMembers(familyRes.data || []);
        if (ambRes.success) {
          setAmbulances(ambRes.data || []);
          if (ambRes.data?.length > 0) setSelectedAmbulance(ambRes.data[0]);
        }

      } catch (err) {
        console.error("Initialization error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  // --- Fetch Coupons & 2-Hour Slots when Ambulance or Date Changes ---
  useEffect(() => {
    if (!selectedAmbulance?._id) return;

    // 1. Fetch Coupons
    const fetchCoupons = async () => {
      try {
        if (UserAPI.getAmbulanceCoupons) {
          const couponsRes = await UserAPI.getAmbulanceCoupons(selectedAmbulance._id);
          if (couponsRes.success) {
            setAvailableCoupons(couponsRes.data || []);
            setAppliedCoupon(null);
            setCouponCode("");
          }
        }
      } catch (err) {
        console.error("Error fetching coupons:", err);
      }
    };
    fetchCoupons();

    // 2. Fetch 2-Hour Slots (GET /user/ambulance/slots/:id?date=...)
    const fetchSlots = async () => {
      setLoadingSlots(true);
      setSlotError("");
      try {
        if (UserAPI.getAmbulanceSlots) {
          const res = await UserAPI.getAmbulanceSlots(selectedAmbulance._id, scheduledDate);
          if (res.success && res.slots) {
            setSlotsList(res.slots || []);
            const firstAvailable = res.slots.find(s => s.isAvailable);
            setSelectedSlot(firstAvailable || null);
          } else {
            setSlotsList([]);
            setSelectedSlot(null);
            setSlotError(res.message || "No slots available on this date.");
          }
        }
      } catch (err) {
        console.error("Error fetching slots:", err);
        setSlotsList([]);
        setSlotError("Failed to fetch slots.");
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchSlots();

  }, [selectedAmbulance?._id, scheduledDate]);

  // --- Pricing Breakdown ---
  const calculatePricingBreakdown = () => {
    if (!selectedAmbulance) return { ambCharge: 0, staffCharge: 0, subtotal: 0 };
    const ambCharge = selectedAmbulance.freeServices?.referral ? 0 : (selectedAmbulance.pricing?.fixedPrice || 2000);
    let staffCharge = 0;
    if (formData.supportStaff.nurse) staffCharge += (selectedAmbulance.supportStaff?.nurse?.price || 200);
    if (formData.supportStaff.doctor) staffCharge += (selectedAmbulance.supportStaff?.doctor?.price || 500);
    return { ambCharge, staffCharge, subtotal: ambCharge + staffCharge };
  };

  const { ambCharge, staffCharge, subtotal: currentSubtotal } = calculatePricingBreakdown();

  let discountAmount = 0;
  if (appliedCoupon) {
    const couponInfo = availableCoupons.find(c => c.couponName.toUpperCase() === (appliedCoupon.couponName || couponCode).toUpperCase());
    if (couponInfo) {
      if (currentSubtotal >= couponInfo.minOrderAmount) {
        const calculatedDiscount = (currentSubtotal * couponInfo.discountPercentage) / 100;
        discountAmount = Math.min(calculatedDiscount, couponInfo.maxDiscount);
      }
    } else if (appliedCoupon.discountPercentage) {
      const calculatedDiscount = (currentSubtotal * appliedCoupon.discountPercentage) / 100;
      discountAmount = appliedCoupon.maxDiscount ? Math.min(calculatedDiscount, appliedCoupon.maxDiscount) : calculatedDiscount;
    }
  }

  const finalTotalAmount = Math.max(0, currentSubtotal - discountAmount);

  // --- Coupon Handlers ---
  const handleValidateCoupon = async () => {
    if (!couponCode.trim() || !selectedAmbulance) return;
    setValidatingCoupon(true);
    setCouponError("");
    try {
      if (UserAPI.validateAmbulanceCoupon) {
        const res = await UserAPI.validateAmbulanceCoupon({
          couponCode: couponCode.trim(),
          subtotal: currentSubtotal,
          ambulanceId: selectedAmbulance._id
        });
        if (res.success) {
          setAppliedCoupon(res.data || { couponName: couponCode.trim() });
          setCouponError("");
        } else {
          setCouponError(res.message || "Invalid coupon code");
          setAppliedCoupon(null);
        }
      }
    } catch (err) {
      setCouponError("Could not validate coupon.");
      setAppliedCoupon(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  };

  const toggleStaff = (type) => {
    setFormData(prev => ({
      ...prev,
      supportStaff: { ...prev.supportStaff, [type]: !prev.supportStaff[type] }
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setReferralCardFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handlePatientChange = (e) => {
    const val = e.target.value;
    if (val === "self") {
      setFormData({ ...formData, selectedPatientId: "self", patientName: "User", patientRelation: "Self" });
    } else {
      const member = familyMembers.find(m => m._id === val);
      setFormData({
        ...formData,
        selectedPatientId: val,
        patientName: member?.memberName || "Patient",
        patientRelation: member?.relation || "Relative"
      });
    }
  };

  // --- 3. Submit Referral Booking & Strict Razorpay Verification ---
  const handleSubmit = async () => {
    if (!selectedAmbulance || !formData.hospitalId || !formData.pickupHospitalId) {
      alert("Please select both Pickup Hospital and Destination Hospital.");
      return;
    }

    if (!selectedSlot) {
      alert("Please select an available 2-hour transfer slot.");
      return;
    }

    setIsSubmitting(true);
    try {
      const staffArr = [];
      if (formData.supportStaff.doctor) staffArr.push("Doctor");
      if (formData.supportStaff.nurse) staffArr.push("Nurse");
      const staffTypeVal = staffArr.length > 0 ? JSON.stringify(staffArr) : "";

      const activeCouponCode = appliedCoupon ? (appliedCoupon.couponName || couponCode).trim() : "";

      const pickupHospitalObj = hospitals.find(h => h._id === formData.pickupHospitalId);
      const pickupLocationObj = {
        address: pickupHospitalObj?.address || pickupHospitalObj?.name || "Origin Hospital",
        lat: pickupHospitalObj?.location?.coordinates ? pickupHospitalObj.location.coordinates[1] : coords.lat,
        lng: pickupHospitalObj?.location?.coordinates ? pickupHospitalObj.location.coordinates[0] : coords.lng
      };

      const member = familyMembers.find(m => m._id === formData.selectedPatientId);
      const patientDetailsObj = {
        name: formData.patientName,
        relation: formData.patientRelation,
        age: member?.age || 30,
        gender: member?.gender || "Male",
        emergencyDescription: formData.referralReason || "Inter-Hospital Referral Transfer",
        referralReason: formData.referralReason,
        condition: 'Stable'
      };

      // Multipart FormData payload
      const data = new FormData();
      data.append("ambulanceId", selectedAmbulance._id);
      data.append("pickupHospitalId", formData.pickupHospitalId);
      data.append("hospitalId", formData.hospitalId);
      data.append("serviceType", "Referral Ambulance");
      data.append("triageLevel", formData.triageLevel);
      data.append("paymentMethod", formData.paymentMethod || "COD");
      data.append("scheduledDate", scheduledDate);
      data.append("scheduledTime", selectedSlot.displayTime || selectedSlot.slotTime);

      if (staffTypeVal) data.append("staffType", staffTypeVal);
      if (activeCouponCode) data.append("couponCode", activeCouponCode);
      if (referralCardFile) data.append("referralCard", referralCardFile);

      data.append("pickupLocation", JSON.stringify(pickupLocationObj));
      data.append("patientDetails", JSON.stringify(patientDetailsObj));

      data.append("pricing", JSON.stringify({
        ambulanceCharge: ambCharge,
        supportingStaffCharge: staffCharge,
        subtotal: currentSubtotal,
        discount: discountAmount,
        total: finalTotalAmount
      }));

      // Execute Booking Initiation
      const res = await UserAPI.bookAmbulance(data);

      // =========================================================================
      // 🔒 STRICT RAZORPAY VERIFICATION FLOW (POST /user/ambulance/verify-payment)
      // =========================================================================
      if (formData.paymentMethod === "Online" && (res.requiresPayment || res.razorpayOrderId || res.key_id)) {
        const isLoaded = await loadRazorpayScript();
        if (!isLoaded) {
          alert("Failed to load Razorpay payment gateway.");
          setIsSubmitting(false);
          return;
        }

        // Strict appointmentId extraction
        const targetAppointmentId = res.appointmentId || res.bookingId || res.booking?._id || res.booking?.bookingId;

        if (!targetAppointmentId) {
          alert("Error: Missing appointmentId reference.");
          setIsSubmitting(false);
          return;
        }

        const options = {
          key: res.key_id,
          amount: res.amount,
          currency: "INR",
          name: "Health Kangaroo Referral Transfer",
          description: `Booking #${res.bookingId || targetAppointmentId} (${selectedSlot.displayTime})`,
          order_id: res.razorpayOrderId,
          handler: async function (paymentResponse) {
            try {
              // ⚠️ STRICT PAYLOAD FORMAT AS PER SPECIFICATION
              const verifyPayload = {
                appointmentId: targetAppointmentId,
                razorpayOrderId: paymentResponse.razorpay_order_id,
                razorpayPaymentId: paymentResponse.razorpay_payment_id,
                razorpaySignature: paymentResponse.razorpay_signature
              };

              const verifyRes = await UserAPI.verifyPaymentAmbulance(verifyPayload);

              if (verifyRes && verifyRes.success) {
                setBookingSuccessData(verifyRes.data || { 
                  bookingId: verifyRes.data?.bookingId || res.bookingId, 
                  otp: verifyRes.data?.otp 
                });
                setShowSuccessModal(true);
              } else {
                alert(verifyRes?.message || "Payment signature verification failed.");
              }
            } catch (vErr) {
              console.error("Verification error:", vErr);
              alert(vErr?.response?.data?.message || "Payment verification failed.");
            }
          },
          prefill: {
            name: patientDetailsObj.name,
            contact: ""
          },
          theme: { color: "#08B36A" },
          modal: {
            ondismiss: function () {
              setIsSubmitting(false);
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
        return;
      }

      // --- FLOW B: COD / DIRECT CONFIRMATION ---
      if (res.success) {
        setBookingSuccessData(res.booking || res.data || null);
        setShowSuccessModal(true);
      } else {
        alert(res.message || "An error occurred while placing the booking.");
      }
    } catch (err) {
      console.error("SUBMIT ERROR:", err);
      const errorData = err?.response?.data;
      if (errorData?.errorType === "SLOT_ALREADY_BOOKED" || errorData?.errorType === "DRIVER_UNAVAILABLE_OR_CONFLICT") {
        alert(`⚠️ Slot Conflict: ${errorData.message}`);
        if (UserAPI.getAmbulanceSlots && selectedAmbulance?._id) {
          UserAPI.getAmbulanceSlots(selectedAmbulance._id, scheduledDate).then(sRes => {
            if (sRes.success) setSlotsList(sRes.slots || []);
          });
        }
      } else {
        alert(errorData?.message || "Something went wrong during submission.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="p-20 text-center font-black text-[#08B36A] animate-pulse">PREPARING REFERRAL DISPATCH...</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button onClick={() => router.back()} className="hover:bg-slate-100 p-2 rounded-full transition-colors cursor-pointer">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">Referral Ambulance Transfer</h1>
              <p className="text-xs font-bold text-[#08B36A] uppercase tracking-widest">Inter-Hospital Medical Transit</p>
            </div>
          </div>
          <div className="bg-emerald-50 text-[#08B36A] px-4 py-2 rounded-xl border border-emerald-100 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase">Transfer Protocol</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* LEFT: ROUTING, DATE, SLOTS & PATIENT */}
          <div className="lg:col-span-5 space-y-6">

            {/* Origin & Destination Hospitals */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 space-y-6">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Inter-Hospital Route</h3>
              <div className="space-y-4">
                <div className="relative">
                  <label className="text-[10px] font-black text-slate-400 uppercase absolute left-5 top-3 z-10">From (Origin Hospital A)</label>
                  <select
                    value={formData.pickupHospitalId}
                    onChange={(e) => setFormData({ ...formData, pickupHospitalId: e.target.value })}
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-[#08B36A] rounded-2xl pt-8 pb-4 px-5 text-sm font-bold appearance-none outline-none cursor-pointer"
                  >
                    <option value="">Select Pickup Hospital</option>
                    {hospitals.map(h => <option key={h._id} value={h._id}>{h.name}</option>)}
                  </select>
                  <Hospital className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 pointer-events-none" />
                </div>

                <div className="flex justify-center -my-2 relative z-10">
                  <div className="bg-white p-2 rounded-full border-2 border-slate-100 shadow-sm">
                    <ArrowRightLeft className="w-4 h-4 text-[#08B36A] rotate-90" />
                  </div>
                </div>

                <div className="relative">
                  <label className="text-[10px] font-black text-slate-400 uppercase absolute left-5 top-3 z-10">To (Destination Hospital B)</label>
                  <select
                    value={formData.hospitalId}
                    onChange={(e) => setFormData({ ...formData, hospitalId: e.target.value })}
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-[#08B36A] rounded-2xl pt-8 pb-4 px-5 text-sm font-bold appearance-none outline-none cursor-pointer"
                  >
                    <option value="">Select Destination Hospital</option>
                    {hospitals.map(h => <option key={h._id} value={h._id}>{h.name}</option>)}
                  </select>
                  <MapPin className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* DATE & 2-HOUR SLOT PICKER */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 space-y-6">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#08B36A]" /> Schedule Transfer Date & Slot
              </h3>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Transfer Date</label>
                <input
                  type="date"
                  min={getTodayDateString()}
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-200 focus:border-[#08B36A] rounded-2xl py-3.5 px-4 text-sm font-bold outline-none cursor-pointer"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Available 2-Hour Slot</label>
                {loadingSlots ? (
                  <div className="py-6 text-center text-xs text-slate-400 font-bold flex items-center justify-center gap-2">
                    <Clock className="w-4 h-4 animate-spin text-[#08B36A]" /> Fetching slots...
                  </div>
                ) : slotError || slotsList.length === 0 ? (
                  <p className="p-4 bg-amber-50 text-amber-700 rounded-2xl text-xs font-bold border border-amber-200">
                    {slotError || "No slots available on this date."}
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
                    {slotsList.map((slot, idx) => {
                      const isSelected = selectedSlot?.slotTime === slot.slotTime;
                      const isAvailable = slot.isAvailable !== false && slot.status !== "Booked";

                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={!isAvailable}
                          onClick={() => setSelectedSlot(slot)}
                          className={`p-3 rounded-2xl border-2 text-left transition-all flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? 'border-[#08B36A] bg-emerald-50 text-[#08B36A] font-black'
                              : isAvailable
                              ? 'border-slate-200 bg-white hover:border-slate-300 text-slate-700 font-bold'
                              : 'border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed opacity-50'
                          }`}
                        >
                          <span className="text-xs">{slot.displayTime || slot.slotTime}</span>
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'
                          }`}>
                            {isAvailable ? "Available" : "Booked"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Patient & Reason */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 space-y-4">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Patient Details</h3>
              <select onChange={handlePatientChange} className="w-full bg-slate-50 rounded-2xl py-4 px-5 text-sm font-bold border-none outline-none cursor-pointer">
                <option value="self">Self (Myself)</option>
                {familyMembers.map(m => <option key={m._id} value={m._id}>{m.memberName} ({m.relation})</option>)}
              </select>

              <textarea
                rows="3"
                value={formData.referralReason}
                onChange={(e) => setFormData({ ...formData, referralReason: e.target.value })}
                placeholder="Reason for inter-hospital transfer (e.g. Higher Cardiac ICU Transfer)..."
                className="w-full bg-slate-50 rounded-2xl p-5 text-sm font-semibold outline-none border-none resize-none"
              />
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Payment Method</h3>
              <div className="grid grid-cols-2 gap-4">
                {['COD', 'Online'].map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setFormData({ ...formData, paymentMethod: method })}
                    className={`py-4 px-6 rounded-2xl font-bold text-sm border-2 transition-all text-center cursor-pointer ${
                      formData.paymentMethod === method
                        ? 'border-[#08B36A] bg-emerald-50/50 text-[#08B36A]'
                        : 'border-slate-100 text-slate-600 hover:border-slate-200'
                    }`}
                  >
                    {method === 'COD' ? 'Cash on Pickup (COD)' : 'Online Payment (Razorpay)'}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT: REFERRAL UPLOAD, AMBULANCE & CHECKOUT */}
          <div className="lg:col-span-7 space-y-6">

            {/* Referral Upload & Triage */}
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="w-full md:w-1/2">
                  <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Doctor's Referral Slip / Card</h3>
                  <label className="relative aspect-video w-full bg-slate-800 rounded-3xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:border-[#08B36A] transition-all overflow-hidden group">
                    {previewImage ? (
                      <img src={previewImage} alt="Referral Card Preview" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <Camera className="w-8 h-8 text-slate-600 group-hover:text-[#08B36A] mb-2" />
                        <span className="text-xs font-bold text-slate-500">Upload Transfer Letter / PDF</span>
                      </>
                    )}
                    <input type="file" className="hidden" onChange={handleFileChange} accept="image/*,.pdf" />
                  </label>
                </div>
                <div className="w-full md:w-1/2 space-y-4">
                  <div className="p-5 bg-slate-800/50 rounded-2xl border border-slate-700">
                    <h4 className="text-[10px] font-black text-[#08B36A] uppercase tracking-widest mb-2">Triage Priority</h4>
                    <select
                      value={formData.triageLevel}
                      onChange={(e) => setFormData({ ...formData, triageLevel: e.target.value })}
                      className="w-full bg-transparent text-sm font-bold text-white outline-none cursor-pointer"
                    >
                      <option className="text-slate-900" value="Emergency">Emergency</option>
                      <option className="text-slate-900" value="Very Urgent">Very Urgent</option>
                      <option className="text-slate-900" value="Urgent">Urgent</option>
                      <option className="text-slate-900" value="Routine">Routine</option>
                    </select>
                  </div>
                  <div className="flex items-start gap-3">
                    <Info className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-slate-400 font-medium uppercase leading-relaxed">Referral card is required for IPD transfer admission.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Ambulance Selector */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6">Select Dispatch Vehicle</h3>
              <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                {ambulances.map((amb) => (
                  <div
                    key={amb._id}
                    onClick={() => setSelectedAmbulance(amb)}
                    className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all cursor-pointer ${selectedAmbulance?._id === amb._id ? 'border-[#08B36A] bg-emerald-50/20' : 'border-slate-50 hover:bg-slate-50'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedAmbulance?._id === amb._id ? 'bg-[#08B36A] text-white' : 'bg-slate-100 text-slate-400'}`}>
                        <Activity className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-black text-sm">{amb.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{amb.vehicleType} • {amb.distance || "Ready"}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-black">₹{amb.freeServices?.referral ? "0" : (amb.pricing?.fixedPrice || 2000)}</p>
                      <p className="text-[9px] font-black text-[#08B36A] uppercase tracking-tighter">Referral Base</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Support Staff Selection */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6">Medical Support Staff</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  onClick={() => toggleStaff('nurse')}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${formData.supportStaff.nurse ? 'border-[#08B36A] bg-emerald-50/50' : 'border-slate-100 bg-slate-50/50 hover:border-slate-200'}`}
                >
                  <div className="flex items-center gap-3">
                    <Activity className={`w-5 h-5 ${formData.supportStaff.nurse ? 'text-[#08B36A]' : 'text-slate-400'}`} />
                    <div>
                      <p className={`text-sm font-black ${formData.supportStaff.nurse ? 'text-slate-900' : 'text-slate-500'}`}>Nurse</p>
                      <p className="text-[10px] font-bold text-slate-400">+₹{selectedAmbulance?.supportStaff?.nurse?.price || 200}</p>
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 ${formData.supportStaff.nurse ? 'bg-[#08B36A] border-[#08B36A]' : 'border-slate-300'}`}>
                    {formData.supportStaff.nurse && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </div>
                </div>

                <div
                  onClick={() => toggleStaff('doctor')}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${formData.supportStaff.doctor ? 'border-[#08B36A] bg-emerald-50/50' : 'border-slate-100 bg-slate-50/50 hover:border-slate-200'}`}
                >
                  <div className="flex items-center gap-3">
                    <Stethoscope className={`w-5 h-5 ${formData.supportStaff.doctor ? 'text-[#08B36A]' : 'text-slate-400'}`} />
                    <div>
                      <p className={`text-sm font-black ${formData.supportStaff.doctor ? 'text-slate-900' : 'text-slate-500'}`}>Doctor</p>
                      <p className="text-[10px] font-bold text-slate-400">+₹{selectedAmbulance?.supportStaff?.doctor?.price || 500}</p>
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 ${formData.supportStaff.doctor ? 'bg-[#08B36A] border-[#08B36A]' : 'border-slate-300'}`}>
                    {formData.supportStaff.doctor && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </div>
                </div>
              </div>
            </div>

            {/* Coupons Section */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 space-y-4">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Apply Offers & Coupons</h3>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Ticket className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Enter Coupon Code"
                    value={couponCode}
                    disabled={!!appliedCoupon}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-[#08B36A] rounded-2xl py-4 pl-12 pr-4 text-sm font-bold uppercase outline-none transition-all disabled:opacity-60"
                  />
                </div>
                {appliedCoupon ? (
                  <button
                    onClick={removeCoupon}
                    className="bg-red-50 hover:bg-red-100 text-red-600 px-6 rounded-2xl font-black text-sm border border-red-100 transition-all cursor-pointer"
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    onClick={handleValidateCoupon}
                    disabled={validatingCoupon || !couponCode.trim() || !selectedAmbulance}
                    className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white disabled:text-slate-400 px-6 rounded-2xl font-black text-sm transition-all cursor-pointer"
                  >
                    {validatingCoupon ? "Checking..." : "Apply"}
                  </button>
                )}
              </div>
              {couponError && <p className="text-xs font-bold text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="w-3.5 h-3.5" /> {couponError}</p>}
              {appliedCoupon && <p className="text-xs font-bold text-[#08B36A] flex items-center gap-1 mt-1"><CheckCircle2 className="w-3.5 h-3.5" /> Code "{appliedCoupon.couponName || couponCode}" applied successfully!</p>}
            </div>

            {/* Total & Confirm */}
            <div className="bg-white rounded-[3rem] p-8 shadow-xl border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-1">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Est. Transfer Cost</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-slate-900">₹{finalTotalAmount}</span>
                  {discountAmount > 0 && <span className="text-sm font-bold text-slate-400 line-through">₹{currentSubtotal}</span>}
                </div>
                {selectedSlot && (
                  <p className="text-[11px] font-bold text-emerald-600">
                    Slot: {scheduledDate} ({selectedSlot.displayTime})
                  </p>
                )}
              </div>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !selectedAmbulance}
                className="w-full md:w-auto bg-[#08B36A] hover:bg-emerald-600 disabled:bg-slate-100 disabled:text-slate-400 text-white px-14 py-5 rounded-2xl font-black text-lg shadow-lg shadow-emerald-200 transition-all active:scale-95 flex items-center justify-center gap-3 cursor-pointer"
              >
                {isSubmitting ? "Finalizing..." : formData.paymentMethod === 'Online' ? "Pay with Razorpay →" : "Confirm Booking"}
              </button>
            </div>

          </div>
        </div>
      </main>

      {/* Booking Success Modal (With 6-Digit Pickup OTP PIN) */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full border border-slate-100 shadow-2xl text-center space-y-6 animate-in fade-in zoom-in duration-200">
            <div className="mx-auto w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-[#08B36A]">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900">Transfer Assigned!</h3>
              <p className="text-sm font-semibold text-slate-600 leading-relaxed">
                Your referral ambulance transfer has been placed successfully.
              </p>
              {bookingSuccessData?.otp && (
                <div className="mt-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 inline-block w-full">
                  <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center justify-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-[#08B36A]" /> 6-Digit Pickup OTP
                  </p>
                  <p className="text-3xl font-black text-[#08B36A] tracking-[0.2em]">{bookingSuccessData.otp}</p>
                  <p className="text-[11px] font-bold text-slate-400 mt-1">Share this OTP with driver on arrival</p>
                </div>
              )}
            </div>
            <button
              onClick={() => {
                setShowSuccessModal(false);
                router.push(`/userscreens/ambulanceappointment`);
              }}
              className="w-full bg-[#08B36A] hover:bg-[#079f5e] text-white py-4 rounded-2xl font-black text-base shadow-lg shadow-emerald-200 transition-all active:scale-95 cursor-pointer"
            >
              Go to Appointments
            </button>
          </div>
        </div>
      )}
    </div>
  );
}