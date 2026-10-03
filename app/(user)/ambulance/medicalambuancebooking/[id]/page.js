'use client';

import React, { useState, useEffect } from 'react';
import {
  MapPin, ChevronDown, Camera, ShieldAlert, MessageSquare,
  Info, ChevronLeft, Navigation, Clock, User, CheckCircle2,
  Stethoscope, Activity, AlertCircle, Map, Phone, Mail, Truck, Ticket, KeyRound, Calendar, CreditCard
} from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
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

export default function AmbulanceBookingPage() {
  const router = useRouter();
  const { id } = useParams(); // Get ambulance ID from URL
  const { openModal } = useGlobalContext();

  // --- State Management ---
  const [ambulance, setAmbulance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coords, setCoords] = useState({ lat: 30.6, lng: 76.7 });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [bookingSuccessData, setBookingSuccessData] = useState(null);

  // Dynamic Data Lists
  const [hospitals, setHospitals] = useState([]);
  const [familyMembers, setFamilyMembers] = useState([]);

  // --- Date & 2-Hour Slot Picker States ---
  const getTodayDateString = () => new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
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

  // Form States
  const [formData, setFormData] = useState({
    pickupLocation: "Locating you...",
    relation: "self",
    emergencyType: "",
    supportStaff: { nurse: false, doctor: false },
    hospital: "",
    priority: "Emergency",
    paymentMethod: "COD"
  });

  // --- 1. Initial Data Fetching (Includes Full Dynamic Pricing Details) ---
  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (!token) {
      CostoumPopup("Please Login To Continue", "warning", 4000);
      router.push('/ambulance');
      return;
    }

    const init = async () => {
      try {
        const storedCoordsString = localStorage.getItem('userCoords');
        const userCoords = storedCoordsString ? JSON.parse(storedCoordsString) : { lat: 30.6, lng: 76.7 };
        setCoords(userCoords);

        // Fetch reverse geocode address
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${userCoords.lat}&lon=${userCoords.lng}`)
          .then(res => res.json())
          .then(addrData => {
            setFormData(prev => ({
              ...prev,
              pickupLocation: addrData.display_name || "Unknown Location"
            }));
          })
          .catch(() => {});

        // Fetch Hospitals, Family Members, Full Ambulance Details & Coupons
        const [hospitalRes, familyRes, ambDetailRes, couponsRes] = await Promise.allSettled([
          UserAPI.getNearbyHospitals ? UserAPI.getNearbyHospitals(userCoords) : UserAPI.getHospitalsList(userCoords),
          UserAPI.getFamilyMembers(),
          UserAPI.getAmbulanceDetail ? UserAPI.getAmbulanceDetail(id) : Promise.resolve({ success: false }),
          UserAPI.getAmbulanceCoupons ? UserAPI.getAmbulanceCoupons(id) : Promise.resolve({ success: false })
        ]);

        if (hospitalRes.status === "fulfilled" && hospitalRes.value?.success) {
          setHospitals(hospitalRes.value.data || []);
          if (hospitalRes.value.data?.length > 0) {
            setFormData(prev => ({ ...prev, hospital: hospitalRes.value.data[0]._id }));
          }
        }

        if (familyRes.status === "fulfilled" && familyRes.value?.success) {
          setFamilyMembers(familyRes.value.data || []);
        }

        // Set live ambulance profile with dynamic staff fees from API
        if (ambDetailRes.status === "fulfilled" && ambDetailRes.value?.success) {
          setAmbulance(ambDetailRes.value.data);
        } else {
          // Fallback to nearest list if detail fails
          const ambListRes = await UserAPI.getNearestAmbulances(userCoords);
          if (ambListRes.success) {
            const selected = (ambListRes.data || []).find(a => a._id === id);
            setAmbulance(selected);
          }
        }

        if (couponsRes.status === "fulfilled" && couponsRes.value?.success) {
          setAvailableCoupons(couponsRes.value.data || []);
        }

      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id, router]);

  // --- 2. Fetch 2-Hour Slots (GET /user/ambulance/slots/:id?date=...) ---
  useEffect(() => {
    if (!id || !selectedDate) return;

    const fetchSlots = async () => {
      setLoadingSlots(true);
      setSlotError("");
      try {
        if (UserAPI.getAmbulanceSlots) {
          const res = await UserAPI.getAmbulanceSlots(id, selectedDate);
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
        setSlotError("Failed to load time slots for this date.");
        setSlotsList([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [id, selectedDate]);

  // =========================================================================
  // 💰 DYNAMIC PRICING HELPERS (100% Extracted from Backend API)
  // =========================================================================
  const getDoctorPrice = () => {
    if (!ambulance) return 0;
    return (
      ambulance?.pricing?.supportStaff?.doctor?.fee ??
      ambulance?.pricing?.supportStaff?.doctor?.price ??
      ambulance?.supportStaff?.doctor?.price ??
      ambulance?.supportStaff?.doctor?.fee ??
      0
    );
  };

  const getNursePrice = () => {
    if (!ambulance) return 0;
    return (
      ambulance?.pricing?.supportStaff?.nurse?.fee ??
      ambulance?.pricing?.supportStaff?.nurse?.price ??
      ambulance?.supportStaff?.nurse?.price ??
      ambulance?.supportStaff?.nurse?.fee ??
      0
    );
  };

  const getBaseAmbulancePrice = () => {
    if (!ambulance) return 0;
    return (
      ambulance?.pricing?.basePrice ??
      ambulance?.pricing?.fixedPrice ??
      ambulance?.displayPrice ??
      0
    );
  };

  // --- Calculations ---
  const doctorFee = getDoctorPrice();
  const nurseFee = getNursePrice();
  const baseAmbulanceFee = getBaseAmbulancePrice();

  const currentSubtotal = (ambulance ? baseAmbulanceFee : 0) +
    (formData.supportStaff.doctor ? doctorFee : 0) +
    (formData.supportStaff.nurse ? nurseFee : 0);

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
    if (!couponCode.trim()) return;
    setValidatingCoupon(true);
    setCouponError("");
    try {
      if (UserAPI.validateAmbulanceCoupon) {
        const res = await UserAPI.validateAmbulanceCoupon({
          couponCode: couponCode.trim(),
          subtotal: currentSubtotal,
          ambulanceId: id
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

  // --- 3. Submit Booking & Strict Razorpay Signature Verification ---
  const handleSubmit = async () => {
    if (!formData.hospital) {
      alert("Please select a destination hospital.");
      return;
    }

    if (!selectedSlot) {
      alert("Please choose an available 2-hour time slot.");
      return;
    }

    setIsSubmitting(true);
    try {
      const staffArr = [];
      if (formData.supportStaff.doctor) staffArr.push("Doctor");
      if (formData.supportStaff.nurse) staffArr.push("Nurse");

      const member = familyMembers.find(m => m._id === formData.relation);
      const patientDetailsObj = {
        name: formData.relation === "self" ? "User" : (member?.memberName || "Patient"),
        relation: formData.relation === "self" ? "Self" : (member?.relation || "Relative"),
        age: member?.age || 30,
        gender: member?.gender || "Male",
        emergencyDescription: formData.emergencyType || "Medical Ambulance Transport",
        condition: "Stable"
      };

      const pickupLocationObj = {
        address: formData.pickupLocation,
        lat: coords.lat,
        lng: coords.lng
      };

      // Form Data payload
      const data = new FormData();
      data.append("ambulanceId", id);
      data.append("hospitalId", formData.hospital);
      data.append("serviceType", "Medical Ambulance");
      data.append("triageLevel", formData.priority);
      data.append("paymentMethod", formData.paymentMethod);
      data.append("scheduledDate", selectedDate);
      data.append("scheduledTime", selectedSlot.displayTime || selectedSlot.slotTime);
      
      if (staffArr.length > 0) {
        data.append("staffType", JSON.stringify(staffArr));
      }
      if (appliedCoupon) {
        data.append("couponCode", (appliedCoupon.couponName || couponCode).trim());
      }

      data.append("pickupLocation", JSON.stringify(pickupLocationObj));
      data.append("patientDetails", JSON.stringify(patientDetailsObj));

      // Dynamic supporting staff charge calculation
      const supportingStaffCharge =
        (formData.supportStaff.doctor ? doctorFee : 0) +
        (formData.supportStaff.nurse ? nurseFee : 0);

      data.append("pricing", JSON.stringify({
        ambulanceCharge: baseAmbulanceFee,
        supportingStaffCharge: supportingStaffCharge,
        subtotal: currentSubtotal,
        discount: discountAmount,
        total: finalTotalAmount
      }));

      // Execute Booking Initiation
      const res = await UserAPI.bookAmbulance(data);

      // --- FLOW A: RAZORPAY VERIFICATION (POST /user/ambulance/verify-payment) ---
      if (formData.paymentMethod === "Online" && (res.requiresPayment || res.razorpayOrderId || res.key_id)) {
        const isLoaded = await loadRazorpayScript();
        if (!isLoaded) {
          alert("Failed to load Razorpay. Please check your internet connection.");
          setIsSubmitting(false);
          return;
        }

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
          name: "Health Kangaroo Ambulance",
          description: `Booking #${res.bookingId || targetAppointmentId} (${selectedSlot.displayTime})`,
          order_id: res.razorpayOrderId,
          handler: async function (paymentResponse) {
            try {
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

      // --- FLOW B: COD DIRECT CONFIRMATION ---
      if (res.success) {
        setBookingSuccessData(res.booking || res.data || null);
        setShowSuccessModal(true);
      } else {
        alert(res.message || "Booking Failed to initiate.");
      }

    } catch (err) {
      console.error("Submission Error:", err);
      const errorData = err?.response?.data;
      if (errorData?.errorType === "SLOT_ALREADY_BOOKED" || errorData?.errorType === "DRIVER_UNAVAILABLE_OR_CONFLICT") {
        alert(`⚠️ Slot Collision: ${errorData.message}`);
        if (UserAPI.getAmbulanceSlots) {
          UserAPI.getAmbulanceSlots(id, selectedDate).then(sRes => {
            if (sRes.success) setSlotsList(sRes.slots || []);
          });
        }
      } else {
        alert(errorData?.message || "An error occurred during booking.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !ambulance) return <div className="p-20 text-center font-bold">Loading Dispatch Details...</div>;

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
              <h1 className="text-2xl font-black tracking-tight">Schedule Medical Ambulance</h1>
              <p className="text-xs font-bold text-[#08B36A] uppercase tracking-widest">
                Unit: {ambulance.vehicle?.vehicleNumber || ambulance.vehicleNumber || ambulance._id.slice(-6).toUpperCase()}
              </p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl font-bold text-sm border border-red-100">
            <ShieldAlert className="w-4 h-4" /> Priority Transport
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* LEFT COLUMN: The Form */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 space-y-6">
              
              {/* Pickup Location */}
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Pickup Location</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={formData.pickupLocation}
                    onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-[#08B36A] focus:bg-white rounded-2xl py-4 pl-12 pr-4 text-sm font-semibold outline-none transition-all"
                  />
                </div>
              </div>

              {/* Patient Selection */}
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Patient (Family)</label>
                <div className="relative">
                  <select
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-[#08B36A] rounded-2xl py-4 px-6 text-sm font-semibold appearance-none outline-none cursor-pointer"
                    value={formData.relation}
                    onChange={(e) => setFormData({ ...formData, relation: e.target.value })}
                  >
                    <option value="self">Self</option>
                    {familyMembers.map((member) => (
                      <option key={member._id} value={member._id}>
                        {member.memberName} ({member.relation})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Emergency Condition Note */}
              <div className="space-y-2">
                <textarea
                  rows="2"
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-[#08B36A] rounded-2xl p-5 text-sm font-semibold outline-none resize-none"
                  placeholder="Describe patient condition (e.g. Dialysis visit, routine transfer)..."
                  value={formData.emergencyType}
                  onChange={(e) => setFormData({ ...formData, emergencyType: e.target.value })}
                />
              </div>

              <div className="flex items-start gap-3 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                <Navigation className="w-5 h-5 text-[#08B36A] mt-0.5" />
                <div>
                  <p className="text-[10px] font-black text-[#08B36A] uppercase tracking-widest">Active Dispatch Point</p>
                  <p className="text-sm font-bold text-slate-700 truncate max-w-[200px]">{formData.pickupLocation.split(',')[0]}</p>
                </div>
              </div>
            </div>

            {/* DATE & 2-HOUR TIME SLOT PICKER */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#08B36A]" /> Choose Travel Date & 2-Hour Slot
                </h3>
              </div>

              {/* Date Input */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Select Travel Date</label>
                <input
                  type="date"
                  min={getTodayDateString()}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-200 focus:border-[#08B36A] rounded-2xl py-3.5 px-4 text-sm font-bold outline-none cursor-pointer"
                />
              </div>

              {/* 2-Hour Slot Grid */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                  Available Slots for {selectedDate}
                </label>

                {loadingSlots ? (
                  <div className="py-6 text-center text-xs text-slate-400 font-bold flex items-center justify-center gap-2">
                    <Clock className="w-4 h-4 animate-spin text-[#08B36A]" /> Loading time slots...
                  </div>
                ) : slotError || slotsList.length === 0 ? (
                  <p className="p-4 bg-amber-50 text-amber-700 rounded-2xl text-xs font-bold border border-amber-200">
                    {slotError || "No slots available on this date. Please choose another date."}
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
                    {slotsList.map((slot, index) => {
                      const isSelected = selectedSlot?.slotTime === slot.slotTime;
                      const isAvailable = slot.isAvailable !== false && slot.status !== "Booked";

                      return (
                        <button
                          key={index}
                          type="button"
                          disabled={!isAvailable}
                          onClick={() => setSelectedSlot(slot)}
                          className={`p-3 rounded-2xl border-2 text-left transition-all flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? 'border-[#08B36A] bg-emerald-50/70 text-[#08B36A] font-black'
                              : isAvailable
                              ? 'border-slate-200 bg-white hover:border-slate-300 text-slate-700 font-bold'
                              : 'border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed opacity-50'
                          }`}
                        >
                          <div>
                            <span className="text-xs block">{slot.displayTime || slot.slotTime}</span>
                            <span className="text-[9px] uppercase font-bold text-slate-400">{slot.category || "Slot"}</span>
                          </div>
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

            {/* DYNAMIC SUPPORT STAFF SELECTOR (Prices From Backend API) */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6">Add Support Staff (Optional)</h3>
              <div className="space-y-3">
                {[
                  { id: 'nurse', label: `Nurse (+₹${nurseFee})`, fee: nurseFee, icon: Activity },
                  { id: 'doctor', label: `Doctor (+₹${doctorFee})`, fee: doctorFee, icon: Stethoscope }
                ].map((staff) => (
                  <div
                    key={staff.id}
                    onClick={() => setFormData({
                      ...formData,
                      supportStaff: { ...formData.supportStaff, [staff.id]: !formData.supportStaff[staff.id] }
                    })}
                    className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${formData.supportStaff[staff.id] ? 'border-[#08B36A] bg-emerald-50/50' : 'border-slate-100 hover:border-slate-200'}`}
                  >
                    <div className="flex items-center gap-3">
                      <staff.icon className={`w-5 h-5 ${formData.supportStaff[staff.id] ? 'text-[#08B36A]' : 'text-slate-400'}`} />
                      <span className={`font-bold ${formData.supportStaff[staff.id] ? 'text-[#08B36A]' : 'text-slate-600'}`}>{staff.label}</span>
                    </div>
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center ${formData.supportStaff[staff.id] ? 'bg-[#08B36A] border-[#08B36A]' : 'border-slate-200'}`}>
                      {formData.supportStaff[staff.id] && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white space-y-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6 pb-6 border-b border-slate-800">
                <div className="w-32 h-24 rounded-2xl bg-slate-800 overflow-hidden shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1612277795421-9bc7706a4a34?w=600&auto=format&fit=crop&q=80"
                    className="w-full h-full object-cover"
                    alt="Ambulance"
                  />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-black">{ambulance.name || ambulance.vehicle?.name}</h2>
                  <p className="text-emerald-400 text-sm font-bold uppercase tracking-widest">{ambulance.vehicle?.vehicleType || ambulance.vehicleType}</p>
                  <div className="flex flex-wrap gap-4 mt-3">
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                      <User className="w-4 h-4 text-emerald-500" /> {ambulance.driverInfo?.name || ambulance.driverInfo?.fullName || "Verified Driver"}
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                      <Clock className="w-4 h-4 text-emerald-500" /> {ambulance.eta || "Ready"}
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                      <MapPin className="w-4 h-4 text-emerald-500" /> {ambulance.distance || "Near you"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-800 rounded-lg"><Phone className="w-4 h-4 text-emerald-400" /></div>
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Phone</p>
                      <p className="text-sm font-bold">{ambulance.driverInfo?.phone || ambulance.phone || "9876543210"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-800 rounded-lg"><Mail className="w-4 h-4 text-emerald-400" /></div>
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Email</p>
                      <p className="text-sm font-bold truncate max-w-[180px]">{ambulance.driverInfo?.email || ambulance.email || "support@hospital.com"}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-800 rounded-lg"><Truck className="w-4 h-4 text-emerald-400" /></div>
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Vehicle Reg</p>
                      <p className="text-sm font-bold">{ambulance.vehicle?.vehicleNumber || ambulance.vehicleNumber || "PB65AM1024"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-800 rounded-lg"><Navigation className="w-4 h-4 text-emerald-400" /></div>
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Service Radius</p>
                      <p className="text-sm font-bold">{ambulance.vehicle?.serviceRadius || ambulance.serviceRadius || "15 km"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Destination Hospital Selection */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
              <h3 className="text-lg font-black mb-6">Choose Destination Hospital</h3>
              <div className="relative">
                <label className="text-[10px] font-black text-slate-400 uppercase absolute left-5 top-3 z-10">Select Hospital</label>
                <select
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-[#08B36A] rounded-2xl pt-8 pb-4 px-5 text-sm font-bold appearance-none outline-none cursor-pointer"
                  value={formData.hospital}
                  onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                >
                  <option value="">Select Nearest Hospital/Clinic</option>
                  {hospitals.map((hospital) => (
                    <option key={hospital._id} value={hospital._id}>
                      {hospital.name} {hospital.distance ? `(${hospital.distance} away)` : ''}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Select Payment Method</h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, paymentMethod: 'COD' })}
                  className={`py-4 px-6 rounded-2xl font-bold text-sm border-2 transition-all text-center flex items-center justify-center gap-2 cursor-pointer ${
                    formData.paymentMethod === 'COD'
                      ? 'border-[#08B36A] bg-emerald-50/50 text-[#08B36A]'
                      : 'border-slate-100 text-slate-600 hover:border-slate-200'
                  }`}
                >
                  Cash on Pickup (COD)
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, paymentMethod: 'Online' })}
                  className={`py-4 px-6 rounded-2xl font-bold text-sm border-2 transition-all text-center flex items-center justify-center gap-2 cursor-pointer ${
                    formData.paymentMethod === 'Online'
                      ? 'border-[#08B36A] bg-emerald-50/50 text-[#08B36A]'
                      : 'border-slate-100 text-slate-600 hover:border-slate-200'
                  }`}
                >
                  <CreditCard className="w-4 h-4" /> Razorpay (Online)
                </button>
              </div>
            </div>

            {/* Offers & Coupons */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 space-y-4">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Apply Offers & Coupons</h3>
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
                    disabled={validatingCoupon || !couponCode.trim()}
                    className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white disabled:text-slate-400 px-6 rounded-2xl font-black text-sm transition-all cursor-pointer"
                  >
                    {validatingCoupon ? "Checking..." : "Apply"}
                  </button>
                )}
              </div>
              {couponError && <p className="text-xs font-bold text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="w-3.5 h-3.5" /> {couponError}</p>}
              {appliedCoupon && <p className="text-xs font-bold text-[#08B36A] flex items-center gap-1 mt-1"><CheckCircle2 className="w-3.5 h-3.5" /> Code "{appliedCoupon.couponName || couponCode}" applied successfully!</p>}
            </div>

            {/* Total Fare & Confirm */}
            <div className="bg-white rounded-[3rem] p-8 shadow-xl border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-1">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Fare</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-black text-slate-900">₹{finalTotalAmount}</p>
                  {discountAmount > 0 && <span className="text-sm font-bold text-slate-400 line-through">₹{currentSubtotal}</span>}
                </div>
                {selectedSlot && (
                  <p className="text-[11px] font-bold text-emerald-600">
                    Slot: {selectedDate} ({selectedSlot.displayTime})
                  </p>
                )}
              </div>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full md:w-auto bg-[#08B36A] hover:bg-emerald-600 disabled:bg-slate-300 text-white px-12 py-5 rounded-2xl font-black text-lg shadow-lg shadow-emerald-200 transition-all active:scale-95 cursor-pointer"
              >
                {isSubmitting ? "Confirming..." : formData.paymentMethod === 'Online' ? "Pay with Razorpay →" : "Confirm Booking"}
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
              <h3 className="text-2xl font-black text-slate-900">Ambulance Confirmed!</h3>
              <p className="text-sm font-semibold text-slate-600 leading-relaxed">
                Your medical ambulance dispatch has been assigned.
              </p>
              {bookingSuccessData?.otp && (
                <div className="mt-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 inline-block w-full">
                  <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center justify-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-[#08B36A]" /> 6-Digit Pickup OTP PIN
                  </p>
                  <p className="text-3xl font-black text-[#08B36A] tracking-[0.2em]">{bookingSuccessData.otp}</p>
                  <p className="text-[11px] font-bold text-slate-400 mt-1">Share this PIN with driver upon arrival</p>
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
              Open Live Tracking
            </button>
          </div>
        </div>
      )}
    </div>
  );
}