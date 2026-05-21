"use client";
import React, { useState, useEffect } from 'react';
import {
  MapPin, ChevronDown, Camera, ShieldAlert, FileText,
  Calendar, Clock, User, CheckCircle2, Stethoscope,
  Activity, AlertCircle, Building2, ChevronLeft,
  Upload, Info, Hospital, ArrowRightLeft, CreditCard, Plus, Ticket
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import UserAPI from "@/app/services/UserAPI";

export default function ReferralBookingPage() {
  const router = useRouter();

  // --- State Management ---
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  // Data Lists
  const [hospitals, setHospitals] = useState([]);
  const [ambulances, setAmbulances] = useState([]);
  const [familyMembers, setFamilyMembers] = useState([]);

  // Selection States
  const [selectedAmbulance, setSelectedAmbulance] = useState(null);
  const [referralCardFile, setReferralCardFile] = useState(null);

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
    triageLevel: "Urgent", // Default
    scheduledDate: "",
    appointmentTime: "",
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
    const fetchData = async () => {
      try {
        const storedCoordsString = localStorage.getItem('userCoords');
        const coords = storedCoordsString ? JSON.parse(storedCoordsString) : { lat: 30.6, lng: 76.7 };

        const [hospRes, familyRes, ambRes] = await Promise.all([
          UserAPI.getHospitalsList(coords),
          UserAPI.getFamilyMembers(),
          UserAPI.getNearestAmbulances(coords)
        ]);

        if (hospRes.success) setHospitals(hospRes.data);
        if (familyRes.success) setFamilyMembers(familyRes.data);
        if (ambRes.success) setAmbulances(ambRes.data);

      } catch (err) {
        console.error("Initialization error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- Fetch Coupons when Ambulance is Selected ---
  useEffect(() => {
    const fetchCoupons = async () => {
      if (!selectedAmbulance?._id) return;
      try {
        if (UserAPI.getAmbulanceCoupons) {
          const couponsRes = await UserAPI.getAmbulanceCoupons(selectedAmbulance._id);
          if (couponsRes.success) {
            setAvailableCoupons(couponsRes.data);
            setAppliedCoupon(null);
            setCouponCode("");
          }
        }
      } catch (err) {
        console.error("Error fetching coupons:", err);
      }
    };
    fetchCoupons();
  }, [selectedAmbulance?._id]);

  // --- UI Pricing Preview (Visual Only) ---
  const calculatePricingBreakdown = () => {
    if (!selectedAmbulance) return { ambCharge: 0, staffCharge: 0, subtotal: 0 };
    const ambCharge = selectedAmbulance.freeServices?.referral ? 0 : (selectedAmbulance.pricing?.fixedPrice || 0);
    let staffCharge = 0;
    if (formData.supportStaff.nurse) staffCharge += (selectedAmbulance.supportStaff?.nurse?.price || 0);
    if (formData.supportStaff.doctor) staffCharge += (selectedAmbulance.supportStaff?.doctor?.price || 0);
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
    if (!couponCode.trim()) return;
    setValidatingCoupon(true);
    setCouponError("");
    try {
      if (UserAPI.validateAmbulanceCoupon) {
        const res = await UserAPI.validateAmbulanceCoupon({
          couponCode: couponCode.trim(),
          subtotal: currentSubtotal
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
      setCouponError("Could not validate coupon. Please try again.");
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

  // --- Form Handlers ---
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

  // --- Final Submit Process ---
  const handleSubmit = async () => {
    if (!selectedAmbulance || !formData.hospitalId || !formData.pickupHospitalId) {
      alert("Please complete hospital and ambulance selections.");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Prepare Staff Type
      const staffArr = [];
      if (formData.supportStaff.nurse) staffArr.push("Nurse");
      if (formData.supportStaff.doctor) staffArr.push("Doctor");
      const staffTypeVal = staffArr.length > 0 ? staffArr.join(", ") : "None";

      // 2. CHECKOUT CALL (JSON) - Calculate Fare first
      const checkoutPayload = {
        ambulanceId: selectedAmbulance._id,
        serviceType: "Referral Ambulance",
        staffType: staffTypeVal,
        couponCode: couponCode.trim()
      };

      console.log("1. CALLING CHECKOUT API (JSON):", checkoutPayload);
      const checkoutRes = await UserAPI.checkOutAmbulance(checkoutPayload);
      
      if (!checkoutRes.success) {
        console.error("CHECKOUT FAILED:", checkoutRes);
        alert(checkoutRes.message || "Pricing calculation failed");
        setIsSubmitting(false);
        return;
      }

      const pricingData = checkoutRes.data;
      console.log("2. CHECKOUT RESPONSE RECEIVED:", pricingData);

      // 3. PREPARE FINAL BOOKING (FORM DATA)
      const data = new FormData();
      
      // Top level fields requested for the API
      data.append("ambulanceId", selectedAmbulance._id);
      data.append("pickupHospitalId", formData.pickupHospitalId);
      data.append("hospitalId", formData.hospitalId);
      data.append("serviceType", "Referral Ambulance");
      data.append("scheduledDate", formData.scheduledDate);
      data.append("appointmentTime", formData.appointmentTime);
      data.append("reason", formData.referralReason);
      data.append("triageLevel", formData.triageLevel);
      data.append("staffType", staffTypeVal);

      // patientDetails object - matching the schema structure
      data.append("patientDetails", JSON.stringify({
        name: formData.patientName,
        relation: formData.patientRelation,
        condition: 'Stable',
        referralReason: formData.referralReason
      }));

      // referralCard File (Screen 8)
      if (referralCardFile) {
        data.append("referralCard", referralCardFile);
      }

      // pricing object - exactly matching schema structure
      data.append("pricing", JSON.stringify({
        ambulanceCharge: pricingData.ambulanceCharge,
        supportingStaffCharge: pricingData.supportingStaffCharge,
        subtotal: pricingData.subtotal,
        discount: pricingData.discount,
        total: pricingData.total
      }));

      // couponDetails object - FIX: Ensure couponId is correctly mapped from checkout response
      data.append("couponDetails", JSON.stringify({
        couponId: pricingData.couponId || null, 
        couponCode: pricingData.finalCouponCode || couponCode,
        discountValue: pricingData.discount || 0
      }));

      // scheduledAt field for Schema
      data.append("scheduledAt", formData.scheduledDate);

      // Verification log
      console.log("3. FINAL BOOKING DATA (FORMDATA):");
      for (let [key, val] of data.entries()) {
        console.log(`${key}:`, val);
      }

      // 4. FINAL BOOKING CALL
      const res = await UserAPI.bookAmbulance(data);
      if (res.success) {
        alert("Booking Confirmed!");
        router.push(`/userscreens/ambulanceappointment`);
      } else {
        alert(res.message || "Booking Failed");
      }
    } catch (err) {
      console.error("SUBMIT ERROR:", err);
      alert("An error occurred during booking.");
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
            <button onClick={() => router.back()} className="hover:bg-slate-100 p-2 rounded-full transition-colors">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">Referral Transfer</h1>
              <p className="text-xs font-bold text-[#08B36A] uppercase tracking-widest">Medical Logistics Hub</p>
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

          {/* LEFT: ROUTING & PATIENT */}
          <div className="lg:col-span-5 space-y-6">

            {/* Routing Selection */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 space-y-6">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Inter-Hospital Route</h3>
              <div className="space-y-4">
                <div className="relative">
                  <label className="text-[10px] font-black text-slate-400 uppercase absolute left-5 top-3 z-10">From (Pickup Hospital)</label>
                  <select
                    value={formData.pickupHospitalId}
                    onChange={(e) => setFormData({ ...formData, pickupHospitalId: e.target.value })}
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-[#08B36A] rounded-2xl pt-8 pb-4 px-5 text-sm font-bold appearance-none outline-none cursor-pointer"
                  >
                    <option value="">Select Pickup Location</option>
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
                  <label className="text-[10px] font-black text-slate-400 uppercase absolute left-5 top-3 z-10">To (Drop Hospital)</label>
                  <select
                    value={formData.hospitalId}
                    onChange={(e) => setFormData({ ...formData, hospitalId: e.target.value })}
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-[#08B36A] rounded-2xl pt-8 pb-4 px-5 text-sm font-bold appearance-none outline-none cursor-pointer"
                  >
                    <option value="">Select Destination</option>
                    {hospitals.map(h => <option key={h._id} value={h._id}>{h.name}</option>)}
                  </select>
                  <MapPin className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Patient & Logistics */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 space-y-4">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Patient & Scheduling</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <select onChange={handlePatientChange} className="w-full bg-slate-50 rounded-2xl py-4 px-5 text-sm font-bold border-none outline-none">
                    <option value="self">Self (Myself)</option>
                    {familyMembers.map(m => <option key={m._id} value={m._id}>{m.memberName} ({m.relation})</option>)}
                  </select>
                </div>
                <input type="date" className="bg-slate-50 rounded-2xl py-4 px-4 text-sm font-bold outline-none" onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })} />
                <input type="time" className="bg-slate-50 rounded-2xl py-4 px-4 text-sm font-bold outline-none" onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })} />
              </div>
              <textarea
                rows="3"
                value={formData.referralReason}
                onChange={(e) => setFormData({ ...formData, referralReason: e.target.value })}
                placeholder="Medical reason for referral transfer..."
                className="w-full bg-slate-50 rounded-2xl p-5 text-sm font-semibold outline-none border-none resize-none"
              />
            </div>
          </div>

          {/* RIGHT: AMBULANCE, STAFF & TRIAGE */}
          <div className="lg:col-span-7 space-y-6">

            {/* Referral Upload & Triage */}
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="w-full md:w-1/2">
                  <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Referral Document</h3>
                  <label className="relative aspect-video w-full bg-slate-800 rounded-3xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:border-[#08B36A] transition-all overflow-hidden group">
                    {previewImage ? (
                      <img src={previewImage} className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <Camera className="w-8 h-8 text-slate-600 group-hover:text-[#08B36A] mb-2" />
                        <span className="text-xs font-bold text-slate-500">Upload Card</span>
                      </>
                    )}
                    <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
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
                    <p className="text-[10px] text-slate-400 font-medium uppercase leading-relaxed">Referral card is vital for medical handover.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Ambulance Selector */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6">Select Dispatch Unit</h3>
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
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{amb.vehicleType} • {amb.eta}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-black">₹{amb.freeServices?.referral ? "0" : (amb.pricing?.fixedPrice || "N/A")}</p>
                      <p className="text-[9px] font-black text-[#08B36A] uppercase tracking-tighter">Referral Base</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Support Staff Selection */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6">Medical Support (Add Multiple)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  onClick={() => toggleStaff('nurse')}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${formData.supportStaff.nurse ? 'border-[#08B36A] bg-emerald-50/50' : 'border-slate-100 bg-slate-50/50 hover:border-slate-200'}`}
                >
                  <div className="flex items-center gap-3">
                    <Activity className={`w-5 h-5 ${formData.supportStaff.nurse ? 'text-[#08B36A]' : 'text-slate-400'}`} />
                    <div>
                      <p className={`text-sm font-black ${formData.supportStaff.nurse ? 'text-slate-900' : 'text-slate-500'}`}>Nurse</p>
                      <p className="text-[10px] font-bold text-slate-400">+₹{selectedAmbulance?.supportStaff?.nurse?.price || 0}</p>
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
                      <p className="text-[10px] font-bold text-slate-400">+₹{selectedAmbulance?.supportStaff?.doctor?.price || 0}</p>
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 ${formData.supportStaff.doctor ? 'bg-[#08B36A] border-[#08B36A]' : 'border-slate-300'}`}>
                    {formData.supportStaff.doctor && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </div>
                </div>
              </div>
            </div>

            {/* Coupon Application Container */}
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
                    className="bg-red-50 hover:bg-red-100 text-red-600 px-6 rounded-2xl font-black text-sm border border-red-100 transition-all"
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    onClick={handleValidateCoupon}
                    disabled={validatingCoupon || !couponCode.trim() || !selectedAmbulance}
                    className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white disabled:text-slate-400 px-6 rounded-2xl font-black text-sm transition-all"
                  >
                    {validatingCoupon ? "Checking..." : "Apply"}
                  </button>
                )}
              </div>

              {couponError && (
                <p className="text-xs font-bold text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {couponError}
                </p>
              )}

              {appliedCoupon && (
                <p className="text-xs font-bold text-[#08B36A] flex items-center gap-1 mt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Code "{appliedCoupon.couponName || couponCode}" applied successfully!
                </p>
              )}

              {!appliedCoupon && availableCoupons.length > 0 && (
                <div className="pt-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Available Coupons for you:</p>
                  <div className="flex flex-wrap gap-2">
                    {availableCoupons.map((coupon) => (
                      <button
                        key={coupon._id}
                        onClick={() => {
                          setCouponCode(coupon.couponName);
                          setCouponError("");
                        }}
                        className="text-xs font-bold px-3 py-1.5 bg-emerald-50 text-[#08B36A] border border-emerald-100 rounded-xl hover:bg-emerald-100 transition-all"
                      >
                        {coupon.couponName} ({coupon.discountPercentage}% OFF)
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Total & Confirm */}
            <div className="bg-white rounded-[3rem] p-8 shadow-xl border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-1">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Est. Transfer Cost</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-slate-900">₹{finalTotalAmount}</span>
                  {discountAmount > 0 && (
                    <span className="text-sm font-bold text-slate-400 line-through">
                      ₹{currentSubtotal}
                    </span>
                  )}
                  {selectedAmbulance?.freeServices?.referral && !appliedCoupon && (
                    <span className="text-[10px] font-black text-white bg-[#08B36A] px-2 py-1 rounded-lg">FREE SERVICE</span>
                  )}
                </div>
                {discountAmount > 0 && (
                  <p className="text-xs font-bold text-[#08B36A]">
                    Coupon Discount Saved: ₹{discountAmount}
                  </p>
                )}
              </div>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !selectedAmbulance}
                className="w-full md:w-auto bg-[#08B36A] hover:bg-emerald-600 disabled:bg-slate-100 disabled:text-slate-400 text-white px-14 py-5 rounded-2xl font-black text-lg shadow-lg shadow-emerald-200 transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                {isSubmitting ? "Finalizing..." : "Confirm Booking"}
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}