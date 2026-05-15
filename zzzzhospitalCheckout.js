"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
    FaArrowLeft, FaHospital, FaProcedures, 
    FaCalendarAlt, FaCreditCard, FaShieldAlt,
    FaCheckCircle, FaRupeeSign, FaMapMarkerAlt,
    FaUserMd, FaStethoscope, FaChevronDown, FaCheck, FaTimes, FaTag, FaTicketAlt, FaReceipt
} from "react-icons/fa";
import UserAPI from "@/app/services/UserAPI";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function CheckoutPage() {
    const router = useRouter();
    const [booking, setBooking] = useState(null);
    
    // API Data State
    const [doctors, setDoctors] = useState([]);
    const [services, setServices] = useState([]);
    const [coupons, setCoupons] = useState([]);
    
    // Selection & Coupon State
    const [selectedDoctorId, setSelectedDoctorId] = useState(null); 
    const [selectedServiceIds, setSelectedServiceIds] = useState([]); 
    const [couponCode, setCouponCode] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [loadingData, setLoadingData] = useState(true);
    const [couponError, setCouponError] = useState("");

    useEffect(() => {
        const savedData = sessionStorage.getItem("activeBooking");
        if (!savedData) {
            router.push("/");
        } else {
            const parsedBooking = JSON.parse(savedData);
            setBooking(parsedBooking);
            fetchHospitalData(parsedBooking.hospitalId);
        }
    }, [router]);

    const fetchHospitalData = async (hospitalId) => {
        try {
            setLoadingData(true);
            const [docRes, serviceRes, couponRes] = await Promise.all([
                UserAPI.getHospitalDoctors(hospitalId),
                UserAPI.getHospitalServices(hospitalId),
                UserAPI.getHospitalCoupons(hospitalId)
            ]);
            
            if (docRes.success) setDoctors(docRes.data);
            if (serviceRes.success) setServices(serviceRes.data);
            if (couponRes.success) setCoupons(couponRes.data);
        } catch (error) {
            console.error("Error fetching checkout data:", error);
        } finally {
            setLoadingData(false);
        }
    };

    const getImageUrl = (path) => {
        if (!path) return "https://via.placeholder.com/150";
        const cleanPath = path.toString().replace(/^public\//, "").replace(/^\//, "");
        return `${BASE_URL}/${cleanPath}`;
    };

    // Calculation Logic
    const selectedServices = services.filter(s => selectedServiceIds.includes(s._id));
    const servicesTotal = selectedServices.reduce((sum, s) => sum + s.price, 0);
    const bedPrice = booking?.pricePerDay || 0;
    const subtotal = bedPrice + servicesTotal;

    const handleApplyCoupon = async (codeToApply = couponCode) => {
        setCouponError("");
        if (!codeToApply) return;
        try {
            const response = await UserAPI.validateHospitalCoupon({
                hospitalId: booking.hospitalId,
                couponCode: codeToApply,
                subtotal: subtotal
            });
            
            if (response.success) {
                // Mapping based on your provided API response structure
                setAppliedCoupon({
                    ...response.data,
                    couponName: codeToApply // Adding name for display purposes
                });
                setDiscountAmount(response.data.discountAmount || 0);
                setCouponCode(codeToApply);
            } else {
                setCouponError(response.message || "Invalid Coupon");
                setAppliedCoupon(null);
                setDiscountAmount(0);
            }
        } catch (error) { 
            setCouponError("Error validating coupon"); 
        }
    };

    const removeCoupon = () => {
        setAppliedCoupon(null);
        setDiscountAmount(0);
        setCouponCode("");
        setCouponError("");
    };

    const finalTotal = subtotal - discountAmount;

    const toggleService = (serviceId) => {
        setSelectedServiceIds((prev) => 
            prev.includes(serviceId) ? prev.filter(id => id !== serviceId) : [...prev, serviceId]
        );
        if(appliedCoupon) removeCoupon();
    };

    const toggleDoctor = (doctorId) => {
        setSelectedDoctorId((prev) => (prev === doctorId ? null : doctorId));
    };

    const handlePayment = async () => {
        const finalPayload = {
            hospitalId: booking.hospitalId,
            wardId: booking.wardId,
            bedId: booking.bedId,
            doctorId: selectedDoctorId,
            serviceIds: selectedServiceIds,
            couponCode: appliedCoupon ? appliedCoupon.couponName : null,
            totalAmount: finalTotal,
            bookingDate: booking.bookingDate,
        };
        console.log("Final Booking Payload:", finalPayload);
        alert(`Proceeding to pay ₹${finalTotal}`);
    };

    if (!booking) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div></div>;

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20">
            {/* HEADER */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <button onClick={() => router.back()} className="group flex items-center gap-2 text-slate-600 font-bold text-xs uppercase tracking-wider hover:text-emerald-600 transition-colors">
                        <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back
                    </button>
                    <h1 className="text-lg font-black text-slate-900 tracking-tight">Checkout</h1>
                    <div className="flex items-center gap-2 text-emerald-500 font-black text-[10px] uppercase tracking-widest"><FaShieldAlt /> Secure Payment</div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 mt-10">
                <div className="grid lg:grid-cols-12 gap-8 items-start">
                    
                    {/* LEFT COLUMN: Main Selections (8 Cols) */}
                    <div className="lg:col-span-8 space-y-6">
                        
                        {/* 1. ADMISSION */}
                        <section className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
                            <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                                <span className="w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-[10px]">01</span> Admission Overview
                            </h2>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                    <div className="flex items-center gap-3 mb-2 text-slate-400"><FaHospital size={12}/><span className="text-[9px] font-black uppercase tracking-tighter">Medical Facility</span></div>
                                    <p className="font-bold text-slate-800">{booking.hospitalName}</p>
                                </div>
                                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                    <div className="flex items-center gap-3 mb-2 text-slate-400"><FaProcedures size={12}/><span className="text-[9px] font-black uppercase tracking-tighter">Assigned Unit</span></div>
                                    <p className="font-bold text-slate-800">{booking.wardName} — <span className="text-emerald-600">Bed #{booking.bedNumber}</span></p>
                                </div>
                            </div>
                        </section>

                        {/* 2. DOCTOR */}
                        <section className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-3">
                                    <span className="w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-[10px]">02</span> Consulting Specialist
                                </h2>
                                {selectedDoctorId && (
                                    <button onClick={() => setSelectedDoctorId(null)} className="text-[9px] font-black text-red-500 bg-red-50 px-3 py-1.5 rounded-full uppercase hover:bg-red-100 transition-colors">Remove</button>
                                )}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {doctors.map((doc) => (
                                    <div key={doc._id} onClick={() => toggleDoctor(doc._id)} className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex items-center gap-4 ${selectedDoctorId === doc._id ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-50 hover:border-slate-200 bg-white'}`}>
                                        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border-2 border-white shadow-sm">
                                            <img src={getImageUrl(doc.profileImage)} alt={doc.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-black text-slate-800 text-sm">Dr. {doc.name}</p>
                                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-tight">{doc.speciality}</p>
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedDoctorId === doc._id ? 'bg-emerald-500 border-emerald-500' : 'border-slate-200'}`}>{selectedDoctorId === doc._id && <FaCheck className="text-white text-[8px]" />}</div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* 3. SERVICES */}
                        <section className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-3">
                                    <span className="w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-[10px]">03</span> Add-on Services
                                </h2>
                            </div>
                            <div className="space-y-3">
                                {services.map((service) => {
                                    const isSelected = selectedServiceIds.includes(service._id);
                                    return (
                                        <div key={service._id} onClick={() => toggleService(service._id)} className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${isSelected ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-50 hover:border-slate-200 bg-white'}`}>
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-100 bg-slate-50"><img src={getImageUrl(service.image)} className="w-full h-full object-cover" /></div>
                                                <div>
                                                    <p className="font-black text-slate-800 text-sm uppercase">{service.serviceName}</p>
                                                    <p className="text-[10px] text-slate-400 font-medium">{service.description}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <p className="font-black text-slate-900 text-sm">₹{service.price}</p>
                                                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center ${isSelected ? 'bg-emerald-500 border-emerald-500' : 'border-slate-200'}`}>{isSelected && <FaCheck className="text-white text-[10px]" />}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    </div>

                    {/* RIGHT COLUMN: Coupons & Detailed Summary (4 Cols) */}
                    <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
                        
                        {/* OFFERS SECTION */}
                        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
                            <h2 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-5 flex items-center gap-2">
                                <FaTag className="text-emerald-500" /> Offers & Coupons
                            </h2>
                            
                            <div className="flex gap-2 mb-4">
                                <input 
                                    type="text" 
                                    placeholder="COUPON CODE" 
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                    className="flex-1 bg-slate-50 px-4 py-3 rounded-xl border border-slate-100 outline-none font-black text-xs uppercase focus:border-emerald-500 transition-all"
                                />
                                <button onClick={() => handleApplyCoupon()} className="bg-slate-900 text-white px-5 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-emerald-600 transition-colors">Apply</button>
                            </div>

                            {couponError && <p className="text-[9px] font-black text-red-500 uppercase mb-4 px-1">{couponError}</p>}

                            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-2 scrollbar-hide">
                                {coupons.map((coupon) => (
                                    <div key={coupon._id} onClick={() => handleApplyCoupon(coupon.couponName)} className="cursor-pointer border border-dashed border-slate-200 rounded-xl p-3 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-[10px] font-black bg-slate-900 text-white px-2 py-0.5 rounded">{coupon.couponName}</span>
                                            <span className="text-emerald-600 font-black text-[10px]">{coupon.discountPercentage}% OFF</span>
                                        </div>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase">Save up to ₹{coupon.maxDiscount}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* DETAILED SUMMARY */}
                        <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
                            <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                <FaReceipt className="text-slate-400" /> Bill Summary
                            </h2>
                            
                            <div className="space-y-4 text-[11px]">
                                {/* Bed Charge */}
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-slate-400 uppercase tracking-tighter">Bed Reservation</span>
                                    <span className="font-black text-slate-800">₹{bedPrice}</span>
                                </div>

                                {/* Detailed Services */}
                                {selectedServices.length > 0 && (
                                    <div className="pt-3 space-y-2 border-t border-slate-50">
                                        <p className="font-black text-slate-900 uppercase text-[9px] mb-1">Add-on Services:</p>
                                        {selectedServices.map(s => (
                                            <div key={s._id} className="flex justify-between items-center italic text-slate-500">
                                                <span>• {s.serviceName}</span>
                                                <span>₹{s.price}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Subtotal Before Discount */}
                                <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                                    <span className="font-black text-slate-400 uppercase tracking-tighter">Subtotal</span>
                                    <span className="font-black text-slate-800">₹{subtotal}</span>
                                </div>

                                {/* Discount Detail */}
                                {appliedCoupon && (
                                    <div className="flex justify-between items-center text-emerald-600 bg-emerald-50/50 p-2 rounded-lg border border-emerald-100">
                                        <div className="flex items-center gap-2">
                                            <FaTag size={10} />
                                            <span className="font-black uppercase tracking-tighter">Offer ({appliedCoupon.couponName})</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-black">- ₹{discountAmount}</span>
                                            <button onClick={removeCoupon} className="text-emerald-300 hover:text-red-500"><FaTimes size={12} /></button>
                                        </div>
                                    </div>
                                )}

                                {/* Taxes */}
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-slate-400 uppercase tracking-tighter">GST & Service Fees</span>
                                    <span className="text-emerald-500 font-black uppercase text-[9px] bg-emerald-50 px-2 py-0.5 rounded">Included</span>
                                </div>
                                
                                {/* Final Total */}
                                <div className="pt-6 border-t-2 border-slate-100 mt-6">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Total Payable</p>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-black text-slate-900 tracking-tighter">₹{finalTotal}</span>
                                        <span className="text-[10px] font-bold text-slate-300 uppercase italic">All taxes inc.</span>
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={handlePayment}
                                className="w-full bg-slate-900 hover:bg-emerald-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] mt-8 flex items-center justify-center gap-3 transition-all duration-300 shadow-xl shadow-slate-200 active:scale-[0.98]"
                            >
                                <FaCreditCard className="text-lg" /> Pay & Confirm
                            </button>
                            
                            <p className="text-[9px] text-center text-slate-400 mt-6 font-bold uppercase tracking-widest">
                                Secure Encrypted Transaction
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}