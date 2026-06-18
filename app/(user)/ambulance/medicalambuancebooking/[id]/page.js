'use client';

import React, { useState, useEffect } from 'react';
import {
  MapPin, ChevronDown, Camera, ShieldAlert, MessageSquare,
  Info, ChevronLeft, Navigation, Clock, User, CheckCircle2,
  Stethoscope, Activity, AlertCircle, Map, Phone, Mail, Truck, Ticket
} from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
// --- RAZORPAY STEP 1: Import Script ---
import Script from 'next/script';
import UserAPI from "@/app/services/UserAPI";

export default function AmbulanceBookingPage() {
  const router = useRouter();
  const { id } = useParams(); // Get ambulance ID from URL

  // --- State Management ---
  const [ambulance, setAmbulance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [coords, setCoords] = useState({ lat: 30.6, lng: 76.7 }); // Lifted state to fix payload crash

  // Dynamic Data States
  const [hospitals, setHospitals] = useState([]);
  const [familyMembers, setFamilyMembers] = useState([]);

  // Coupon States
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Form States
  const [formData, setFormData] = useState({
    pickupLocation: "Locating you...",
    relation: "self", // Default to self
    emergencyType: "",
    supportStaff: { nurse: false, doctor: false },
    hospital: "",
    priority: "Emergency"
  });

  // --- Fetch Data ---
  useEffect(() => {
    const init = async () => {
      try {
        const storedCoordsString = localStorage.getItem('userCoords');
        const userCoords = storedCoordsString ? JSON.parse(storedCoordsString) : { lat: 30.6, lng: 76.7 };
        setCoords(userCoords);

        // 1. Fetch exact address from coordinates for display
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${userCoords.lat}&lon=${userCoords.lng}`);
        const addrData = await res.json();

        // 2. Fetch Hospitals List
        const hospitalRes = await UserAPI.getHospitalsList(userCoords);
        if (hospitalRes.success) {
          setHospitals(hospitalRes.data);
        }

        // 3. Fetch Family Members
        const familyRes = await UserAPI.getFamilyMembers();
        if (familyRes.success) {
          setFamilyMembers(familyRes.data);
        }

        // 4. Fetch specific ambulance details
        const ambRes = await UserAPI.getNearestAmbulances(userCoords);
        if (ambRes.success) {
          const selected = ambRes.data.find(a => a._id === id);
          setAmbulance(selected);
        }

        // 5. Fetch Available Ambulance Coupons
        if (UserAPI.getAmbulanceCoupons) {
          const couponsRes = await UserAPI.getAmbulanceCoupons(id);
          if (couponsRes.success) {
            setAvailableCoupons(couponsRes.data);
          }
        }

        setFormData(prev => ({
          ...prev,
          pickupLocation: addrData.display_name || "Unknown Location"
        }));

      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id]);

  // --- Calculations ---
  const currentSubtotal = ambulance ? (ambulance.pricing?.fixedPrice || 0) +
    (formData.supportStaff.doctor ? (ambulance.supportStaff?.doctor?.price || 500) : 0) +
    (formData.supportStaff.nurse ? (ambulance.supportStaff?.nurse?.price || 200) : 0) : 0;

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

  // --- Logic Handlers ---
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

  const handleSubmit = async () => {
    if (!formData.hospital) {
      alert("Please select a hospital.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (!window.Razorpay) {
        alert("Razorpay SDK is loading. Please try again in a few seconds.");
        setIsSubmitting(false);
        return;
      }

      // 1. Prepare Staff Type
      const staffArr = [];
      if (formData.supportStaff.nurse) staffArr.push("Nurse");
      if (formData.supportStaff.doctor) staffArr.push("Doctor");
      const staffTypeVal = staffArr.length > 0 ? staffArr.join(", ") : "None";

      // 2. Build FormData to send to bookAmbulance API directly
      const data = new FormData();
      data.append("ambulanceId", id);
      data.append("hospitalId", formData.hospital);
      data.append("pickupLocation", formData.pickupLocation);
      data.append("serviceType", "Medical Ambulance");
      data.append("staffType", staffTypeVal);

      const activeCouponCode = appliedCoupon ? (appliedCoupon.couponName || couponCode).trim() : "";
      data.append("couponCode", activeCouponCode);
      data.append("triageLevel", formData.priority);

      // Fetch patient relation details
      const member = familyMembers.find(m => m._id === formData.relation);
      data.append("patientDetails", JSON.stringify({
        name: formData.relation === "self" ? "User" : (member?.memberName || "Patient"),
        relation: formData.relation === "self" ? "Self" : (member?.relation || "Relative"),
        condition: formData.emergencyType || "Emergency",
      }));

      // Calculate and append local pricing details
      const supportingStaffCharge =
        (formData.supportStaff.doctor ? (ambulance.supportStaff?.doctor?.price || 500) : 0) +
        (formData.supportStaff.nurse ? (ambulance.supportStaff?.nurse?.price || 200) : 0);

      data.append("pricing", JSON.stringify({
        ambulanceCharge: ambulance.pricing?.fixedPrice || 0,
        supportingStaffCharge: supportingStaffCharge,
        subtotal: currentSubtotal,
        discount: discountAmount,
        total: finalTotalAmount
      }));

      data.append("couponDetails", JSON.stringify({
        couponId: appliedCoupon ? (appliedCoupon._id || appliedCoupon.id || null) : null,
        couponCode: activeCouponCode,
        discountValue: discountAmount
      }));

      // Append flat pricing fields to support alternative backend parsers
      data.append("subtotal", currentSubtotal.toString());
      data.append("discount", discountAmount.toString());
      data.append("total", finalTotalAmount.toString());
      data.append("amount", finalTotalAmount.toString());
      data.append("totalAmount", finalTotalAmount.toString());

      console.log("Form Data Coupon Details:", data.get("couponDetails"));
      console.log("Form Data Pricing Details:", data.get("pricing"));

      // 3. Initiate booking and retrieve Razorpay credentials
      const res = await UserAPI.bookAmbulance(data);

      if (res.success) {
        const { key_id, amount, razorpayOrderId, appointmentId, orderId } = res;

        // 4. Configure Razorpay modal options
        const options = {
          key: key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: amount || (finalTotalAmount * 100), // Fallback to calculated total in paise
          currency: "INR",
          name: "HK Healthcare",
          description: `Ambulance Booking - ${ambulance.name}`,
          order_id: razorpayOrderId,
          handler: async function (response) {
            try {
              setIsSubmitting(true);
              const verifyData = {
                appointmentId: appointmentId || orderId || res.appointmentId || res.orderId,
                razorpayOrderId: response.razorpay_order_id || razorpayOrderId,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                // Traditional fields support
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              };

              // Verify Payment on Backend
              const verifyRes = await UserAPI.verifyPaymentAmbulance(verifyData);

              if (verifyRes.success || verifyRes.status === 'ok') {
                alert(verifyRes.message || "Booking Confirmed!");
                router.push(`/userscreens/ambulanceappointment`);
              } else {
                alert(verifyRes.message || "Payment verification failed. Please contact support.");
              }
            } catch (verifyErr) {
              console.error("Verification Error:", verifyErr);
              alert("Something went wrong during payment verification.");
            } finally {
              setIsSubmitting(false);
            }
          },
          prefill: {
            name: "User",
            email: "user@example.com",
            contact: "9999999999",
          },
          theme: { color: "#08B36A" },
          modal: {
            ondismiss: function () {
              setIsSubmitting(false);
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (paymentFailResponse) {
          alert(`Payment failed: ${paymentFailResponse.error.description}`);
          setIsSubmitting(false);
        });
        rzp.open();

      } else {
        alert(res.message || "Booking Failed to initiate");
        setIsSubmitting(false);
      }

    } catch (err) {
      console.error("Submission Error:", err);
      alert("An error occurred during booking.");
      setIsSubmitting(false);
    }
  };

  if (loading || !ambulance) return <div className="p-20 text-center font-bold">Loading Dispatch Details...</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans pb-20">
      {/* --- RAZORPAY STEP 3: Load the SDK --- */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button onClick={() => router.back()} className="hover:bg-slate-100 p-2 rounded-full transition-colors">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl font-black tracking-tight">Booking Details</h1>
              <p className="text-xs font-bold text-[#08B36A] uppercase tracking-widest">Unit ID: {ambulance.vehicleNumber || ambulance._id.slice(-6).toUpperCase()}</p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl font-bold text-sm border border-red-100">
            <ShieldAlert className="w-4 h-4" /> Emergency SOS
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* LEFT COLUMN: The Form */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
              <div className="space-y-6">
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

                <div className="space-y-2">
                  <textarea
                    rows="2"
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-[#08B36A] rounded-2xl p-5 text-sm font-semibold outline-none resize-none"
                    placeholder="What kind of emergency is it?"
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
            </div>

            {/* SUPPORT STAFF */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6">Add Support Staff (Optional)</h3>
              <div className="space-y-3">
                {[
                  { id: 'nurse', label: 'Nurse', icon: Activity },
                  { id: 'doctor', label: 'Doctor', icon: Stethoscope }
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
                    src={ambulance.documents?.drivingLicenseFile || "https://img.freepik.com/premium-vector/ambulance-vector-design-white-background_1120557-12349.jpg"}
                    className="w-full h-full object-cover"
                    alt="Ambulance"
                  />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-black">{ambulance.name}</h2>
                  <p className="text-emerald-400 text-sm font-bold uppercase tracking-widest">{ambulance.vehicleType}</p>
                  <div className="flex flex-wrap gap-4 mt-3">
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                      <User className="w-4 h-4 text-emerald-500" /> {ambulance.driverInfo?.fullName || "Not Assigned"}
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                      <Clock className="w-4 h-4 text-emerald-500" /> {ambulance.eta || "Ready"}
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                      <MapPin className="w-4 h-4 text-emerald-500" /> {ambulance.distance || "0 km"} away
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
                      <p className="text-sm font-bold">{ambulance.phone || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-800 rounded-lg"><Mail className="w-4 h-4 text-emerald-400" /></div>
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Email</p>
                      <p className="text-sm font-bold truncate max-w-[180px]">{ambulance.email || "N/A"}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-800 rounded-lg"><Truck className="w-4 h-4 text-emerald-400" /></div>
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Vehicle Reg</p>
                      <p className="text-sm font-bold">{ambulance.vehicleNumber || "Pending"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-800 rounded-lg"><Navigation className="w-4 h-4 text-emerald-400" /></div>
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Service Radius</p>
                      <p className="text-sm font-bold">{ambulance.serviceRadius || "N/A"}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Base Station Address</p>
                <p className="text-sm font-medium text-slate-300 leading-relaxed">{ambulance.address || "Location not specified"}</p>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
              <h3 className="text-lg font-black mb-6">Choose Your Hospital</h3>
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
                      {hospital.name} ({hospital.type})
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Choose Emergency Priority</h3>
              <div className="relative">
                <label className="text-[10px] font-black text-slate-400 uppercase absolute left-5 top-3 z-10">Select Priority Level</label>
                <select
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-[#08B36A] rounded-2xl pt-8 pb-4 px-5 text-sm font-bold appearance-none outline-none cursor-pointer"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <option value="Emergency">Emergency (Critical)</option>
                  <option value="Very Urgent">Very Urgent</option>
                  <option value="Urgent">Urgent</option>
                  <option value="Routine">Routine</option>
                </select>
                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

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
                    className="bg-red-50 hover:bg-red-100 text-red-600 px-6 rounded-2xl font-black text-sm border border-red-100 transition-all"
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    onClick={handleValidateCoupon}
                    disabled={validatingCoupon || !couponCode.trim()}
                    className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white disabled:text-slate-400 px-6 rounded-2xl font-black text-sm transition-all"
                  >
                    {validatingCoupon ? "Checking..." : "Apply"}
                  </button>
                )}
              </div>
              {couponError && <p className="text-xs font-bold text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="w-3.5 h-3.5" /> {couponError}</p>}
              {appliedCoupon && <p className="text-xs font-bold text-[#08B36A] flex items-center gap-1 mt-1"><CheckCircle2 className="w-3.5 h-3.5" /> Code "{appliedCoupon.couponName || couponCode}" applied successfully!</p>}
              {!appliedCoupon && availableCoupons.length > 0 && (
                <div className="pt-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Available Coupons:</p>
                  <div className="flex flex-wrap gap-2">
                    {availableCoupons.map((coupon) => (
                      <button key={coupon._id} onClick={() => { setCouponCode(coupon.couponName); setCouponError(""); }} className="text-xs font-bold px-3 py-1.5 bg-emerald-50 text-[#08B36A] border border-emerald-100 rounded-xl hover:bg-emerald-100 transition-all">
                        {coupon.couponName} ({coupon.discountPercentage}% OFF)
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-[3rem] p-8 shadow-xl border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-1">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Est. Fare</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-black text-slate-900">₹{finalTotalAmount}</p>
                  {discountAmount > 0 && <span className="text-sm font-bold text-slate-400 line-through">₹{currentSubtotal}</span>}
                </div>
              </div>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full md:w-auto bg-[#08B36A] hover:bg-emerald-600 disabled:bg-slate-300 text-white px-12 py-5 rounded-2xl font-black text-lg shadow-lg shadow-emerald-200 transition-all active:scale-95"
              >
                {isSubmitting ? "Processing Payment..." : "Confirm Dispatch"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}