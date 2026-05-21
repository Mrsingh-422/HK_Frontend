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

    // Age Calculation Helper
    const calculateAge = (dob) => {
        if (!dob) return 0;
        const birthDate = new Date(dob);
        const difference = Date.now() - birthDate.getTime();
        const ageDate = new Date(difference);
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    };

    // Handle Family Member Selection
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
                address: patientDetails.address,
                city: patientDetails.city,
                pincode: patientDetails.pincode,
            });
        }
    };

    // Calculation Logic
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
                // Find the coupon in our list to ensure we have the ID
                const matchedCoupon = coupons.find(c => c.couponName === codeToApply);
                
                setAppliedCoupon({
                    ...response.data,
                    ...(matchedCoupon || {}), // Spread the local object to ensure _id is present
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
        if(appliedCoupon) removeCoupon();
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

        // Mapping selected services to the format [{ serviceName, price }]
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
            // Using ID from appliedCoupon state
            couponId: appliedCoupon ? (appliedCoupon._id || appliedCoupon.id || null) : null,
            couponCode: appliedCoupon ? appliedCoupon.couponName : null
        };

        // Log the payload to debug
        console.log("Payload being sent:", JSON.stringify(payload, null, 2));

        try {
            const response = await UserAPI.bookHospitalBed(payload);
            if (response.success) {
                alert("Booking Confirmed Successfully!");
                // router.push("/bookings");
            } else {
                alert(response.message || "Failed to book bed.");
            }
        } catch (error) {
            console.error("Booking Error:", error);
            alert("An error occurred during booking.");
        }
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
                    
                    <div className="lg:col-span-8 space-y-6">
                        {/* 01. ADMISSION OVERVIEW */}
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

                        {/* 02. PATIENT INFORMATION */}
                        <section className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
                            <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                                <span className="w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-[10px]">02</span> Who is this appointment for?
                            </h2>

                            <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide">
                                <div onClick={() => handleMemberSelect("self")} className="flex-shrink-0 cursor-pointer flex flex-col items-center gap-2 group">
                                    <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center transition-all bg-slate-100 ${selectedMemberId === "self" ? "border-emerald-500 ring-4 ring-emerald-50" : "border-transparent"}`}>
                                        <FaUser className={selectedMemberId === "self" ? "text-emerald-500" : "text-slate-400"} />
                                    </div>
                                    <span className={`text-[10px] font-black uppercase tracking-tight ${selectedMemberId === "self" ? "text-emerald-600" : "text-slate-400"}`}>My Self</span>
                                </div>

                                {familyMembers.map((member) => (
                                    <div key={member._id} onClick={() => handleMemberSelect(member)} className="flex-shrink-0 cursor-pointer flex flex-col items-center gap-2 group">
                                        <div className={`w-16 h-16 rounded-full border-2 overflow-hidden flex items-center justify-center transition-all bg-slate-100 ${selectedMemberId === member._id ? "border-emerald-500 ring-4 ring-emerald-50" : "border-transparent"}`}>
                                            {member.profilePic ? (
                                                <img src={`${BASE_URL}${member.profilePic}`} alt={member.memberName} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className={`w-full h-full flex items-center justify-center text-sm font-black ${selectedMemberId === member._id ? "bg-emerald-100 text-emerald-600" : "bg-slate-200 text-slate-500"}`}>
                                                    {member.memberName?.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <span className={`text-[10px] font-black uppercase tracking-tight ${selectedMemberId === member._id ? "text-emerald-600" : "text-slate-400"}`}>{member.memberName}</span>
                                    </div>
                                ))}

                                <div onClick={() => handleMemberSelect("add")} className="flex-shrink-0 cursor-pointer flex flex-col items-center gap-2 group">
                                    <div className={`w-16 h-16 rounded-full border-2 border-dashed flex items-center justify-center transition-all bg-white ${selectedMemberId === "add" ? "border-emerald-500 bg-emerald-50" : "border-slate-300"}`}>
                                        <FaPlus className={selectedMemberId === "add" ? "text-emerald-500" : "text-slate-300"} />
                                    </div>
                                    <span className={`text-[10px] font-black uppercase tracking-tight ${selectedMemberId === "add" ? "text-emerald-600" : "text-slate-400"}`}>Add</span>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Name</label>
                                    <input type="text" name="fullName" value={patientDetails.fullName} onChange={handleInputChange} placeholder="Enter your full name" className="w-full bg-slate-50 px-5 py-4 rounded-2xl border border-slate-100 outline-none font-bold text-slate-700 focus:border-emerald-500 transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enter Date of Birth</label>
                                    <input type="date" name="dob" value={patientDetails.dob} onChange={handleInputChange} className="w-full bg-slate-50 px-5 py-4 rounded-2xl border border-slate-100 outline-none font-bold text-slate-700 focus:border-emerald-500 transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number</label>
                                    <input type="tel" name="phoneNumber" value={patientDetails.phoneNumber} onChange={handleInputChange} placeholder="Enter phone number" className="w-full bg-slate-50 px-5 py-4 rounded-2xl border border-slate-100 outline-none font-bold text-slate-700 focus:border-emerald-500 transition-all" />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gender</label>
                                    <div className="flex gap-4">
                                        {["Male", "Female"].map((g) => (
                                            <button key={g} type="button" onClick={() => setPatientDetails({...patientDetails, gender: g})} className={`flex-1 py-4 rounded-2xl border-2 font-bold transition-all ${patientDetails.gender === g ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-100 bg-slate-50 text-slate-400"}`}>{g}</button>
                                        ))}
                                    </div>
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Address</label>
                                    <input type="text" name="address" value={patientDetails.address} onChange={handleInputChange} placeholder="Enter address" className="w-full bg-slate-50 px-5 py-4 rounded-2xl border border-slate-100 outline-none font-bold text-slate-700 focus:border-emerald-500 transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Town/city</label>
                                    <input type="text" name="city" value={patientDetails.city} onChange={handleInputChange} placeholder="Select city" className="w-full bg-slate-50 px-5 py-4 rounded-2xl border border-slate-100 outline-none font-bold text-slate-700 focus:border-emerald-500 transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pin Code</label>
                                    <input type="text" name="pincode" value={patientDetails.pincode} onChange={handleInputChange} placeholder="Enter Pin code" className="w-full bg-slate-50 px-5 py-4 rounded-2xl border border-slate-100 outline-none font-bold text-slate-700 focus:border-emerald-500 transition-all" />
                                </div>
                                <div className="md:col-span-2 pt-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Have Insurance?</label>
                                    <div className="flex gap-8">
                                        {["Yes", "No"].map((opt) => (
                                            <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                                                <div onClick={() => setPatientDetails({...patientDetails, haveInsurance: opt})} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${patientDetails.haveInsurance === opt ? "border-emerald-500 bg-emerald-500" : "border-slate-300"}`}>
                                                    {patientDetails.haveInsurance === opt && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                                </div>
                                                <span className="text-sm font-bold text-slate-600 uppercase tracking-widest">{opt}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                {patientDetails.haveInsurance === "Yes" && (
                                    <div className="md:col-span-2 bg-[#FFF9F4] p-8 rounded-[2rem] border border-[#FFE7D6] space-y-6">
                                        <div className="border-2 border-dashed border-[#FFD0B0] rounded-2xl py-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-white transition-all">
                                            <FaUpload className="text-2xl text-[#FF8A3D]" />
                                            <span className="text-[11px] font-black text-[#FF8A3D] uppercase tracking-widest">Upload image</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-[#B08968] uppercase">Insurance No.</label>
                                                <input type="text" name="insuranceNo" value={patientDetails.insuranceNo} onChange={handleInputChange} placeholder="123456" className="w-full bg-white px-4 py-3 rounded-xl border-none outline-none font-bold text-slate-700" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-[#B08968] uppercase">Company Name</label>
                                                <input type="text" name="companyName" value={patientDetails.companyName} onChange={handleInputChange} placeholder="Company name" className="w-full bg-white px-4 py-3 rounded-xl border-none outline-none font-bold text-slate-700" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-[#B08968] uppercase">Issue Date</label>
                                                <input type="date" name="issueDate" value={patientDetails.issueDate} onChange={handleInputChange} className="w-full bg-white px-4 py-3 rounded-xl border-none outline-none font-bold text-slate-700" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-[#B08968] uppercase">Expiry Date</label>
                                                <input type="date" name="expiryDate" value={patientDetails.expiryDate} onChange={handleInputChange} className="w-full bg-white px-4 py-3 rounded-xl border-none outline-none font-bold text-slate-700" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* 03. CONSULTING SPECIALIST */}
                        <section className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-3">
                                    <span className="w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-[10px]">03</span> Consulting Specialist
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

                        {/* 04. ADD-ON SERVICES */}
                        <section className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
                            <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                                <span className="w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-[10px]">04</span> Add-on Services
                            </h2>
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

                    {/* RIGHT COLUMN */}
                    <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
                        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
                            <h2 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-5 flex items-center gap-2">
                                <FaTag className="text-emerald-500" /> Offers & Coupons
                            </h2>
                            <div className="flex gap-2 mb-4">
                                <input type="text" placeholder="COUPON CODE" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} className="flex-1 bg-slate-50 px-4 py-3 rounded-xl border border-slate-100 outline-none font-black text-xs uppercase focus:border-emerald-500 transition-all" />
                                <button onClick={() => handleApplyCoupon()} className="bg-slate-900 text-white px-5 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-emerald-600 transition-colors">Apply</button>
                            </div>
                            {couponError && <p className="text-[9px] font-black text-red-500 uppercase mb-4 px-1">{couponError}</p>}
                            <div className="space-y-3 max-h-[180px] overflow-y-auto pr-2 scrollbar-hide">
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

                        <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
                            <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                <FaReceipt className="text-slate-400" /> Bill Summary
                            </h2>
                            <div className="space-y-4 text-[11px]">
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-slate-400 uppercase tracking-tighter">Bed Reservation</span>
                                    <span className="font-black text-slate-800">₹{bedPrice}</span>
                                </div>
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
                                <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                                    <span className="font-black text-slate-400 uppercase tracking-tighter">Subtotal</span>
                                    <span className="font-black text-slate-800">₹{subtotal}</span>
                                </div>
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
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-slate-400 uppercase tracking-tighter">GST & Service Fees</span>
                                    <span className="text-emerald-500 font-black uppercase text-[9px] bg-emerald-50 px-2 py-0.5 rounded">Included</span>
                                </div>
                                <div className="pt-6 border-t-2 border-slate-100 mt-6">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Total Payable</p>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-black text-slate-900 tracking-tighter">₹{finalTotal}</span>
                                        <span className="text-[10px] font-bold text-slate-300 uppercase italic">All taxes inc.</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={handlePayment} className="w-full bg-slate-900 hover:bg-emerald-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] mt-8 flex items-center justify-center gap-3 transition-all duration-300 shadow-xl shadow-slate-200 active:scale-[0.98]">
                                <FaCreditCard className="text-lg" /> Pay & Confirm
                            </button>
                            <p className="text-[9px] text-center text-slate-400 mt-6 font-bold uppercase tracking-widest">Secure Encrypted Transaction</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}