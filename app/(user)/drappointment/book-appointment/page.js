"use client";

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FaArrowLeft, FaArrowRight, 
  FaCrown, FaTag, FaSpinner 
} from 'react-icons/fa';
import UserAPI from "@/app/services/UserAPI";

export default function BookingConfirmation() {
  const router = useRouter();
  
  const [bookingData, setBookingData] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [couponError, setCouponError] = useState("");

  // Initialize Data
  useEffect(() => {
    const data = localStorage.getItem('pendingBooking');
    if (data) {
      const parsed = JSON.parse(data);
      setBookingData(parsed);
      setSelectedDate(new Date().toISOString().split('T')[0]);
      fetchDoctorCoupons(parsed.doctorId);
    } else {
      router.push('/'); 
    }
  }, [router]);

  // Fetching Slots
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

  // Pricing Logic (Memoized to prevent NaN and handle updates)
  const pricing = useMemo(() => {
    const base = Number(bookingData?.fee || 0);
    const premium = Number(selectedSlot?.premiumFee || 0);
    const platform = 25;
    const subtotal = base + premium;
    
    let discount = 0;
    if (appliedCoupon) {
      const pct = Number(appliedCoupon.discountPercentage || 0);
      const max = Number(appliedCoupon.maxDiscount || Infinity);
      discount = Math.min((subtotal * pct) / 100, max);
    }

    return {
      base,
      premium,
      platform,
      subtotal,
      discount,
      total: subtotal + platform - discount
    };
  }, [bookingData, selectedSlot, appliedCoupon]);

  // Sync discount amount state for display
  useEffect(() => {
    setDiscountAmount(pricing.discount);
  }, [pricing.discount]);

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
    setDiscountAmount(0);
    setCouponError("");
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
          
          {/* LEFT: SCHEDULING */}
          <div className="lg:col-span-7 space-y-12">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Schedule Session</h1>
              <p className="text-slate-500 text-sm">Select your preferred date and time.</p>
            </div>

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

            <section>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Available Slots</h3>
              {loadingSlots ? (
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {[1,2,3,4].map(i => <div key={i} className="h-12 bg-slate-50 animate-pulse rounded-xl" />)}
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
                        {Number(slot.premiumFee) > 0 && (
                          <FaCrown size={8} className={`absolute top-1 right-1 ${isSelected ? 'text-emerald-400' : 'text-amber-500'}`} />
                        )}
                      </button>
                    );
                  }) : <p className="col-span-full text-slate-400 text-sm italic">No slots available for this date.</p>}
                </div>
              )}
            </section>
          </div>

          {/* RIGHT: SUMMARY */}
          <div className="lg:col-span-5">
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
              <div className="flex items-center gap-4 mb-8">
                <img src={bookingData.profileImage} className="w-14 h-14 rounded-xl object-cover border-2 border-white" alt="Doctor" />
                <div>
                  <h4 className="font-bold text-slate-900">Dr. {bookingData.doctorName}</h4>
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">{bookingData.speciality}</p>
                </div>
              </div>

              {/* COSTING */}
              <div className="space-y-3 mb-8">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Consultation Fee</span>
                  <span className="font-bold">₹{pricing.base}</span>
                </div>
                {pricing.premium > 0 && (
                  <div className="flex justify-between text-sm text-amber-600">
                    <span>Premium Slot Fee</span>
                    <span className="font-bold">+₹{pricing.premium}</span>
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
                        if(couponError) setCouponError("");
                    }}
                    className={`w-full bg-white border rounded-xl py-3 pl-10 pr-24 text-xs font-bold focus:ring-2 transition-all outline-none
                      ${couponError ? 'border-rose-500 focus:ring-rose-500/10' : 'border-slate-200 focus:ring-emerald-500/20'}`}
                  />
                  <FaTag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={12} />
                  
                  <button 
                    disabled={isValidating || (!couponCode && !appliedCoupon)}
                    onClick={() => appliedCoupon ? removeCoupon() : handleApplyCoupon()}
                    className={`absolute right-1 top-1 bottom-1 px-4 rounded-lg text-[10px] font-black uppercase transition-colors
                      ${appliedCoupon 
                        ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' 
                        : 'bg-slate-900 text-white disabled:bg-slate-200 disabled:text-slate-400'}`}
                  >
                    {isValidating ? <FaSpinner className="animate-spin" /> : appliedCoupon ? 'Remove' : 'Apply'}
                  </button>
                </div>

                {couponError && <p className="text-[10px] font-bold text-rose-500 ml-1">{couponError}</p>}
                
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                  {coupons.map((cp) => (
                    <button 
                      key={cp._id} 
                      onClick={() => handleApplyCoupon(cp.couponName)} 
                      className="flex-shrink-0 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[9px] font-bold text-slate-500 hover:border-emerald-500 transition-colors"
                    >
                      {cp.couponName}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                disabled={!selectedSlot}
                className={`w-full py-4 rounded-xl text-sm font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2
                  ${selectedSlot ? 'bg-emerald-600 text-white shadow-lg hover:bg-emerald-700 hover:-translate-y-0.5' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                onClick={() => console.log("Final Total:", pricing.total)}
              >
                Continue to Payment <FaArrowRight size={12} />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}