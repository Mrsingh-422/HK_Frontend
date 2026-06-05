"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    FaArrowLeft, FaHospital, FaProcedures,
    FaShieldAlt, FaCheck, FaTimes, FaTag, FaReceipt,
    FaUser, FaPhone, FaCalendarDay, FaVenusMars, FaCreditCard,
    FaMapMarkerAlt, FaGlobe, FaPlus, FaUpload, FaUserMd, FaStethoscope
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
    const [familyMembers, setFamilyMembers] = useState([]);

    // Selection State
    const [selectedMemberId, setSelectedMemberId] = useState("self");
    const [selectedDoctorId, setSelectedDoctorId] = useState(null);
    const [selectedServiceIds, setSelectedServiceIds] = useState([]);
    const [bedBookingType, setBedBookingType] = useState("General-Bed");

    // Expanded Patient Details State
    const [patientDetails, setPatientDetails] = useState({
        fullName: "",
        dob: "",
        phoneNumber: "",
        gender: "",
        address: "",
        city: "",
        pincode: "",
        spokenLanguage: "",
        haveInsurance: "No",
        insuranceNo: "",
        companyName: "",
        issueDate: "",
        expiryDate: "",
        insuranceImage: null
    });

    // Coupon State
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
            fetchFamilyData();
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

    const fetchFamilyData = async () => {
        try {
            const response = await UserAPI.getFamilyMembers();
            if (response.success) {
                setFamilyMembers(response.data);
            }
        } catch (error) {
            console.error("Error fetching family members:", error);
        }
    };

    const getImageUrl = (path) => {
        if (!path) return "https://via.placeholder.com/150";
        const cleanPath = path.toString().replace(/^public\//, "").replace(/^\//, "");
        return `${BASE_URL}/${cleanPath}`;
    };

    const calculateAge = (dob) => {
        if (!dob) return 0;
        const birthDate = new Date(dob);
        const difference = Date.now() - birthDate.getTime();
        const ageDate = new Date(difference);
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    };

    const handleMemberSelect = (member) => {
        if (member === "self" || member === "add") {
            setSelectedMemberId(member);
            setPatientDetails({
                fullName: "", dob: "", phoneNumber: "", gender: "",
                address: "", city: "", pincode: "", spokenLanguage: "",
                haveInsurance: "No", insuranceNo: "", companyName: "",
                issueDate: "", expiryDate: "", insuranceImage: null
            });
        } else {
            setSelectedMemberId(member._id);
            let formattedDob = "";
            if (member.dob && member.dob.includes("-")) {
                const parts = member.dob.split("-");
                if (parts.length === 3) {
                    formattedDob = parts[2].length === 4 ? `${parts[2]}-${parts[1]}-${parts[0]}` : member.dob;
                }
            }

            setPatientDetails({
                ...patientDetails,
                fullName: member.memberName || "",
                phoneNumber: member.phone || "",
                dob: formattedDob,
                gender: member.gender || "",
                haveInsurance: member.hasInsurance ? "Yes" : "No",
                insuranceNo: member.insuranceNo || "",
                companyName: member.insuranceId?.provider || "",
                address: patientDetails.address || "",
                city: patientDetails.city || "",
                pincode: patientDetails.pincode || "",
            });
        }
    };

    const selectedServices = services.filter(s => selectedServiceIds.includes(s._id));
    const servicesTotal = selectedServices.reduce((sum, s) => sum + s.price, 0);
    const bedPrice = booking?.totalPrice || 0;
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
                const matchedCoupon = coupons.find(c => c.couponName === codeToApply);
                setAppliedCoupon({
                    ...response.data,
                    ...(matchedCoupon || {}),
                    couponName: codeToApply
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
        if (appliedCoupon) removeCoupon();
    };

    const toggleDoctor = (doctorId) => {
        setSelectedDoctorId((prev) => (prev === doctorId ? null : doctorId));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPatientDetails(prev => ({ ...prev, [name]: value }));
    };

    const handlePayment = async () => {
        if (!patientDetails.fullName || !patientDetails.phoneNumber) {
            alert("Please fill in the required patient details.");
            return;
        }

        const formattedServices = services
            .filter(s => selectedServiceIds.includes(s._id))
            .map(s => ({
                serviceName: s.serviceName,
                price: s.price
            }));

        const payload = {
            hospitalId: booking.hospitalId,
            doctorId: selectedDoctorId || null,
            bedId: booking.bedId,
            bookingType: "Admission",
            bedBookingType: bedBookingType,
            triageLevel: "Emergency",
            startDate: booking.startDate,
            endDate: booking.endDate,
            appointmentDate: booking.startDate,
            appointmentTime: "Admission",
            patients: [{
                patientName: patientDetails.fullName,
                patientAge: calculateAge(patientDetails.dob),
                gender: patientDetails.gender,
                relation: selectedMemberId === "self" ? "Self" : "Family Member",
                isMainUser: true
            }],
            specialServices: formattedServices,
            pricing: {
                baseFee: booking.totalPrice,
                visitCharges: 0,
                extraCharges: 0,
                discountAmount: discountAmount,
                subtotal: subtotal,
                totalPayable: finalTotal
            },
            couponId: appliedCoupon ? (appliedCoupon._id || appliedCoupon.id || null) : null,
            couponCode: appliedCoupon ? appliedCoupon.couponName : null
        };

        try {
            const response = await UserAPI.bookHospitalBed(payload);
            if (response.success) {
                alert("Booking Confirmed Successfully!");
                router.push("/userscreens/hospitalappointment");
            } else {
                alert(response.message || "Failed to book bed.");
            }
        } catch (error) {
            console.error("Booking Error:", error);
            alert("An error occurred during booking.");
        }
    };

    if (!booking) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20 overflow-x-hidden">
            {/* --- HEADER --- */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-[100]">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
                    <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-600 font-bold text-[10px] md:text-xs uppercase tracking-widest">
                        <FaArrowLeft /> BACK
                    </button>
                    <h1 className="text-sm md:text-lg font-black text-slate-900 tracking-tight uppercase">Checkout</h1>
                    <div className="flex items-center gap-2 text-emerald-500 font-black text-[9px] md:text-[10px] uppercase tracking-widest">
                        <FaShieldAlt className="hidden xs:block" /> Secure
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-3 md:px-6 mt-6 md:mt-10">
                <div className="grid lg:grid-cols-12 gap-6 md:gap-8 lg:gap-10 items-start">

                    <div className="lg:col-span-8 space-y-6 md:space-y-8">

                        {/* 01. ADMISSION OVERVIEW */}
                        <section className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] p-4 md:p-10 shadow-sm border border-slate-100 overflow-hidden">
                            <h2 className="text-[10px] md:text-xs font-black text-slate-900 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                                <span className="w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-[10px]">01</span> Admission Overview
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="bg-slate-50 p-4 md:p-5 rounded-2xl border border-slate-100">
                                    <div className="flex items-center gap-2 mb-2 text-slate-400"><FaHospital size={12} /><span className="text-[9px] font-black uppercase tracking-tighter">Facility</span></div>
                                    <p className="font-bold text-slate-800 text-sm break-words leading-tight">{booking.hospitalName}</p>
                                </div>
                                <div className="bg-emerald-50 p-4 md:p-5 rounded-2xl border border-emerald-100">
                                    <div className="flex items-center gap-2 mb-2 text-emerald-600"><FaProcedures size={12} /><span className="text-[9px] font-black uppercase tracking-tighter">Unit</span></div>
                                    <p className="font-bold text-emerald-900 text-sm leading-tight">{booking.wardName} — Bed #{booking.bedNumber}</p>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-slate-100">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Booking Type</label>
                                <div className="flex gap-3">
                                    {["General-Bed", "Emergency-Bed"].map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => setBedBookingType(type)}
                                            className={`flex-1 py-3.5 md:py-4 rounded-xl md:rounded-2xl border-2 font-bold text-[10px] md:text-xs transition-all ${bedBookingType === type ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-100 bg-slate-50 text-slate-400"
                                                }`}
                                        >
                                            {type === "General-Bed" ? "General" : "Emergency"}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* 02. PATIENT INFORMATION */}
                        <section className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] p-4 md:p-10 shadow-sm border border-slate-100 overflow-hidden">
                            <h2 className="text-[10px] md:text-xs font-black text-slate-900 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                                <span className="w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-[10px]">02</span> Patient Information
                            </h2>

                            <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar -mx-1 px-1">
                                <div onClick={() => handleMemberSelect("self")} className="shrink-0 cursor-pointer flex flex-col items-center gap-2">
                                    <div className={`w-14 h-14 md:w-20 md:h-20 rounded-full border-4 flex items-center justify-center bg-slate-50 transition-all ${selectedMemberId === "self" ? "border-emerald-500 scale-105" : "border-transparent"}`}>
                                        <FaUser className={selectedMemberId === "self" ? "text-emerald-500 text-lg" : "text-slate-300 text-lg"} />
                                    </div>
                                    <span className="text-[9px] font-black uppercase text-slate-500">Self</span>
                                </div>

                                {familyMembers.map((member) => (
                                    <div key={member._id} onClick={() => handleMemberSelect(member)} className="shrink-0 cursor-pointer flex flex-col items-center gap-2">
                                        <div className={`w-14 h-14 md:w-20 md:h-20 rounded-full border-4 overflow-hidden bg-slate-50 transition-all ${selectedMemberId === member._id ? "border-emerald-500 scale-105" : "border-transparent"}`}>
                                            {member.profilePic ? (
                                                <img src={`${BASE_URL}${member.profilePic}`} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center font-black text-slate-400 uppercase text-xs">{member.memberName?.charAt(0)}</div>
                                            )}
                                        </div>
                                        <span className="text-[9px] font-black uppercase text-slate-500 max-w-[60px] truncate">{member.memberName}</span>
                                    </div>
                                ))}

                                <div onClick={() => handleMemberSelect("add")} className="shrink-0 cursor-pointer flex flex-col items-center gap-2">
                                    <div className={`w-14 h-14 md:w-20 md:h-20 rounded-full border-4 border-dashed border-slate-200 flex items-center justify-center bg-slate-50 transition-all ${selectedMemberId === "add" ? "border-emerald-500" : ""}`}>
                                        <FaPlus className="text-slate-300" />
                                    </div>
                                    <span className="text-[9px] font-black uppercase text-slate-500">Add</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 pt-4">
                                <div className="md:col-span-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Full Name</label>
                                    <input type="text" name="fullName" value={patientDetails.fullName} onChange={handleInputChange} placeholder="Patient Full Name" className="w-full bg-slate-50 px-4 py-4 rounded-xl border border-slate-100 outline-none font-bold text-sm text-slate-700" />
                                </div>
                                <div>
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Date of Birth</label>
                                    <input type="date" name="dob" value={patientDetails.dob} onChange={handleInputChange} className="w-full bg-slate-50 px-4 py-4 rounded-xl border border-slate-100 outline-none font-bold text-sm text-slate-700" />
                                </div>
                                <div>
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Phone Number</label>
                                    <input type="tel" name="phoneNumber" value={patientDetails.phoneNumber} onChange={handleInputChange} className="w-full bg-slate-50 px-4 py-4 rounded-xl border border-slate-100 outline-none font-bold text-sm text-slate-700" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Gender</label>
                                    <div className="flex gap-3">
                                        {["Male", "Female", "Other"].map((g) => (
                                            <button key={g} type="button" onClick={() => setPatientDetails({ ...patientDetails, gender: g })} className={`flex-1 py-3.5 rounded-xl border-2 font-black text-xs transition-all ${patientDetails.gender === g ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-50 bg-slate-50 text-slate-400"}`}>{g}</button>
                                        ))}
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Address</label>
                                    <input type="text" name="address" value={patientDetails.address} onChange={handleInputChange} placeholder="Residential Address" className="w-full bg-slate-50 px-4 py-4 rounded-xl border border-slate-100 outline-none font-bold text-sm text-slate-700" />
                                </div>
                                <div className="md:col-span-2 pt-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Insurance Coverage?</label>
                                    <div className="flex gap-6">
                                        {["Yes", "No"].map((opt) => (
                                            <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                                <input type="radio" checked={patientDetails.haveInsurance === opt} onChange={() => setPatientDetails({ ...patientDetails, haveInsurance: opt })} className="accent-emerald-500 w-4 h-4" />
                                                <span className="text-xs font-bold text-slate-600 uppercase">{opt}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                {patientDetails.haveInsurance === "Yes" && (
                                    <div className="md:col-span-2 bg-amber-50/30 p-4 md:p-6 rounded-2xl border border-amber-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <input type="text" name="insuranceNo" value={patientDetails.insuranceNo} onChange={handleInputChange} placeholder="Policy No." className="w-full bg-white px-4 py-3 rounded-xl border-none outline-none font-bold text-sm" />
                                        <input type="text" name="companyName" value={patientDetails.companyName} onChange={handleInputChange} placeholder="Insurance Provider" className="w-full bg-white px-4 py-3 rounded-xl border-none outline-none font-bold text-sm" />
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* 03. CONSULTING SPECIALIST */}
                        <section className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] p-4 md:p-10 shadow-sm border border-slate-100 overflow-hidden">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-[10px] md:text-xs font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-3">
                                    <span className="w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-[10px]">03</span> Consulting Specialist
                                </h2>
                                {selectedDoctorId && (
                                    <button onClick={() => setSelectedDoctorId(null)} className="text-[9px] font-black text-red-500 uppercase hover:underline">Remove</button>
                                )}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                                {doctors.map((doc) => (
                                    <div key={doc._id} onClick={() => toggleDoctor(doc._id)} className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex items-center gap-4 ${selectedDoctorId === doc._id ? 'border-emerald-500 bg-emerald-50' : 'border-slate-50 hover:border-slate-200 bg-white'}`}>
                                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                                            <img src={getImageUrl(doc.profileImage)} alt={doc.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <p className="font-black text-slate-800 text-xs truncate">Dr. {doc.name}</p>
                                            <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-tighter truncate">{doc.speciality}</p>
                                        </div>
                                        {selectedDoctorId === doc._id && <FaCheck className="text-emerald-500 text-xs shrink-0" />}
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* 04. ADD-ON SERVICES */}
                        <section className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] p-4 md:p-10 shadow-sm border border-slate-100 overflow-hidden">
                            <h2 className="text-[10px] md:text-xs font-black text-slate-900 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                                <span className="w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-[10px]">04</span> Add-on Services
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {services.map((service) => {
                                    const isSelected = selectedServiceIds.includes(service._id);
                                    return (
                                        <div key={service._id} onClick={() => toggleService(service._id)} className={`cursor-pointer p-4 rounded-xl md:rounded-2xl border-2 transition-all flex items-center justify-between ${isSelected ? 'border-emerald-500 bg-emerald-50' : 'border-slate-50 hover:border-slate-100 bg-white shadow-sm'}`}>
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0"><FaStethoscope size={16} /></div>
                                                <div className="overflow-hidden">
                                                    <p className="font-black text-slate-800 text-[10px] uppercase truncate">{service.serviceName}</p>
                                                    <p className="text-[9px] text-emerald-600 font-bold">₹{service.price}</p>
                                                </div>
                                            </div>
                                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${isSelected ? 'bg-emerald-500 border-emerald-500' : 'border-slate-200'}`}>{isSelected && <FaCheck className="text-white text-[10px]" />}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    </div>

                    {/* RIGHT COLUMN: BILL SUMMARY */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* OFFERS */}
                        <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] p-6 shadow-sm border border-slate-100">
                            <h2 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-5 flex items-center gap-2">
                                <FaTag className="text-emerald-500" /> Apply Coupon
                            </h2>
                            <div className="flex gap-2 mb-4">
                                <input type="text" placeholder="CODE" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} className="flex-1 bg-slate-50 px-4 py-3 rounded-xl border border-slate-100 outline-none font-black text-xs uppercase" />
                                <button onClick={() => handleApplyCoupon()} className="bg-slate-900 text-white px-5 rounded-xl text-[10px] font-black uppercase hover:bg-emerald-600 transition-colors">Apply</button>
                            </div>
                            {couponError && <p className="text-[9px] font-black text-red-500 uppercase mb-4 px-1">{couponError}</p>}
                            <div className="space-y-3 max-h-[160px] overflow-y-auto no-scrollbar">
                                {coupons.map((coupon) => (
                                    <div key={coupon._id} onClick={() => handleApplyCoupon(coupon.couponName)} className="cursor-pointer border border-dashed border-slate-200 rounded-xl p-3 hover:border-emerald-500 transition-all">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-[9px] font-black bg-slate-900 text-white px-2 py-0.5 rounded uppercase">{coupon.couponName}</span>
                                            <span className="text-emerald-600 font-black text-[10px]">{coupon.discountPercentage}% OFF</span>
                                        </div>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Save up to ₹{coupon.maxDiscount}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* BILL SUMMARY */}
                        <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-8 shadow-xl shadow-slate-200/50 border border-slate-100 lg:sticky lg:top-24 overflow-hidden">
                            <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <FaReceipt className="text-slate-400" /> Bill Summary
                            </h2>
                            <div className="space-y-4 text-[11px] md:text-xs">
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-slate-400 uppercase tracking-tighter">Base Admission</span>
                                    <span className="font-black text-slate-800">₹{bedPrice}</span>
                                </div>
                                {selectedServices.length > 0 && (
                                    <div className="pt-3 space-y-2 border-t border-slate-50">
                                        {selectedServices.map(s => (
                                            <div key={s._id} className="flex justify-between items-center italic text-slate-500 text-[10px]">
                                                <span>• {s.serviceName}</span>
                                                <span>₹{s.price}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="flex justify-between items-center pt-3 border-t border-slate-100 font-black">
                                    <span className="text-slate-400 uppercase">Subtotal</span>
                                    <span className="text-slate-800">₹{subtotal}</span>
                                </div>
                                {appliedCoupon && (
                                    <div className="flex justify-between items-center text-emerald-600 bg-emerald-50 p-2.5 rounded-lg border border-emerald-100 font-black text-[10px] uppercase">
                                        <div className="flex items-center gap-2"><FaTag size={10} /> <span>{appliedCoupon.couponName}</span></div>
                                        <div className="flex items-center gap-2"><span>-₹{discountAmount}</span> <FaTimes onClick={removeCoupon} className="cursor-pointer hover:text-red-500" /></div>
                                    </div>
                                )}
                                <div className="pt-6 border-t-4 border-slate-50 mt-6">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Payable</p>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">₹{finalTotal}</span>
                                        <span className="text-[10px] font-bold text-slate-300 uppercase italic">Inc. Taxes</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={handlePayment} className="w-full bg-slate-900 hover:bg-emerald-600 text-white py-5 rounded-2xl font-black text-xs md:text-sm uppercase tracking-widest mt-8 flex items-center justify-center gap-3 transition-all duration-300 shadow-xl active:scale-95">
                                <FaCreditCard /> Confirm Booking
                            </button>
                            <p className="text-[8px] text-center text-slate-400 mt-6 font-bold uppercase tracking-widest">Secure SSL Encrypted Transaction</p>
                        </div>
                    </div>
                </div>
            </main>

            {/* STYLES */}
            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}