"use client";

import React, { useState, useEffect, Suspense, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
    FaArrowLeft, FaMapMarkerAlt, FaUserFriends, FaCheckCircle,
    FaCalendarCheck, FaClock, FaPlus, FaPhone, FaCrown, FaUserCircle, 
    FaStethoscope, FaChevronDown, FaWeight, FaCalendarAlt, FaLanguage, FaStickyNote
} from "react-icons/fa";
import UserAPI from "@/app/services/UserAPI";

const BASE_URL = "http://localhost:5000";

function BookingDetailsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // URL Params from Previous Page
    const nurseId = searchParams.get("nurseId");
    const nurseName = searchParams.get("nurseName");
    const nurseImage = searchParams.get("nurseImage");
    const serviceId = searchParams.get("serviceId");
    const serviceTitle = searchParams.get("serviceTitle");
    const serviceType = searchParams.get("serviceType");
    const date = searchParams.get("bookingDate");
    const slotTime = searchParams.get("slotTime");
    const displayTime = searchParams.get("displayTime");
    const basePrice = parseFloat(searchParams.get("servicePrice") || 0);
    const extraFee = parseFloat(searchParams.get("extraFee") || 0);
    const totalAmount = basePrice + extraFee;

    // Data States
    const [addresses, setAddresses] = useState([]);
    const [familyMembers, setFamilyMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Selection & Form States
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [selectedFamilyId, setSelectedFamilyId] = useState(null);
    
    // New Form Fields from Screenshot
    const [location, setLocation] = useState("At Home");
    const [patientDetails, setPatientDetails] = useState({
        fullName: "",
        age: "",
        gender: "Female",
        relation: "Self"
    });
    const [triageFacility, setTriageFacility] = useState("Routine");
    const [healthDetails, setHealthDetails] = useState({
        weight: "",
        dob: "",
        language: "English",
        instructions: ""
    });

    useEffect(() => {
        const fetchBookingData = async () => {
            try {
                setLoading(true);
                const [addrRes, familyRes] = await Promise.all([
                    UserAPI.getUserAddresses(),
                    UserAPI.getFamilyMembers()
                ]);

                if (addrRes?.success) {
                    setAddresses(addrRes.data);
                    const defaultAddr = addrRes.data.find(a => a.isDefault);
                    if (defaultAddr) setSelectedAddressId(defaultAddr._id);
                }

                if (familyRes?.success) {
                    setFamilyMembers(familyRes.data);
                }
            } catch (error) {
                console.error("Error fetching booking details data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBookingData();
    }, []);

    // Auto-populate fields when family member is selected
    const handleSelectFamily = (member) => {
        setSelectedFamilyId(member._id);
        setPatientDetails({
            fullName: member.memberName,
            age: member.age || "",
            gender: member.gender || "Female",
            relation: member.relation || "Other"
        });
    };

    const handleFinalBooking = () => {
        if (!selectedFamilyId && !patientDetails.fullName) return alert("Please select or enter patient details");
        if (!selectedAddressId) return alert("Please select a visit address");

        const bookingPayload = {
            nurseId,
            serviceId,
            familyMemberId: selectedFamilyId,
            addressId: selectedAddressId,
            date,
            slotTime,
            displayTime,
            totalAmount,
            additionalInfo: {
                location,
                patientDetails,
                triageFacility,
                healthDetails
            }
        };

        console.log("Final Booking Payload:", bookingPayload);
        alert("Booking Confirmed! Proceeding to Payment...");
        // router.push('/payment');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-teal-500"></div>
            </div>
        );
    }

    const getImageUrl = (path) => {
        if (!path) return "https://img.freepik.com/free-photo/medical-specialist-taking-care-patient_23-2148962551.jpg";
        if (path.startsWith("http")) return path;
        return `${BASE_URL}/${path.replace(/^public\//, "")}`.replace(/([^:]\/)\/+/g, "$1");
    };

    return (
        <div className="min-h-screen bg-[#FDFEFF] font-sans pb-20">
            {/* Header */}
            <div className="bg-white border-b border-slate-100 py-6 px-6 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto flex items-center gap-4">
                    <button onClick={() => router.back()} className="text-slate-900 p-2 hover:bg-slate-100 rounded-full transition-all">
                        <FaArrowLeft />
                    </button>
                    <h1 className="text-xl font-black text-slate-900">Appointment</h1>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 mt-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* Left Column: Form Details */}
                    <div className="lg:col-span-8 space-y-8">
                        
                        {/* 1. Service Hero Card */}
                        <div className="bg-[#E6F7F1] rounded-[2.5rem] p-8 flex items-center justify-between overflow-hidden relative">
                            <div className="space-y-3 max-w-[60%] relative z-10">
                                <h2 className="text-2xl font-black text-[#0D5F46] leading-tight">
                                    {serviceTitle || "Professional Nursing Care"}
                                </h2>
                                <p className="text-[#3A8F76] text-xs font-bold leading-relaxed">
                                    Certified nurse for ICU, Post-surgery and elderly care.
                                </p>
                                <ul className="space-y-1">
                                    {['Verified', 'Background checked', 'Live Tracking'].map(item => (
                                        <li key={item} className="flex items-center gap-2 text-[10px] font-black text-[#0D5F46]">
                                            <FaCheckCircle className="text-xs" /> {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <img 
                                src={getImageUrl(nurseImage)} 
                                className="w-32 h-32 md:w-44 md:h-44 object-cover rounded-3xl rotate-3 shadow-xl border-4 border-white" 
                                alt="Service" 
                            />
                        </div>

                        {/* 2. Who is this appointment for */}
                        <section className="space-y-4">
                            <h3 className="font-black text-slate-800 ml-2">Who is this appointment for</h3>
                            <div className="flex items-start gap-6 overflow-x-auto pb-4 custom-scrollbar">
                                {familyMembers.map((member) => (
                                    <button 
                                        key={member._id}
                                        onClick={() => handleSelectFamily(member)}
                                        className="flex flex-col items-center gap-2 min-w-[80px]"
                                    >
                                        <div className={`w-16 h-16 rounded-full border-4 p-1 transition-all ${selectedFamilyId === member._id ? "border-teal-500 scale-110" : "border-transparent"}`}>
                                            <div className="w-full h-full rounded-full overflow-hidden bg-slate-200">
                                                {member.profilePic ? (
                                                    <img src={`${BASE_URL}${member.profilePic}`} className="w-full h-full object-cover" alt="mem" />
                                                ) : (
                                                    <FaUserCircle className="w-full h-full text-slate-400" />
                                                )}
                                            </div>
                                        </div>
                                        <span className={`text-[10px] font-black whitespace-nowrap ${selectedFamilyId === member._id ? "text-teal-600" : "text-slate-500"}`}>
                                            {member.memberName} ({member.relation === 'Self' ? 'Me' : member.relation})
                                        </span>
                                    </button>
                                ))}
                                <button className="flex flex-col items-center gap-2 min-w-[80px]">
                                    <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 bg-white">
                                        <FaPlus />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-500">Add New</span>
                                </button>
                            </div>
                        </section>

                        {/* 3. Assessment Location */}
                        <section className="bg-[#F1F9F6] p-6 rounded-[2rem] space-y-4">
                            <h4 className="text-sm font-black text-slate-800">Assessment Location</h4>
                            <div className="relative">
                                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Where should we meet?</label>
                                <div className="relative">
                                    <select 
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        className="w-full bg-white border-none rounded-2xl p-4 text-sm font-bold text-slate-700 appearance-none shadow-sm focus:ring-2 focus:ring-teal-500/20"
                                    >
                                        <option>At Home</option>
                                        <option>At Hospital</option>
                                    </select>
                                    <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                </div>
                            </div>
                        </section>

                        {/* 4. Patient Details */}
                        <section className="bg-[#FFF9F1] p-6 rounded-[2rem] space-y-5">
                            <h4 className="text-sm font-black text-slate-800">Patient Details</h4>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Full Name</label>
                                    <input 
                                        type="text" 
                                        value={patientDetails.fullName}
                                        onChange={(e) => setPatientDetails({...patientDetails, fullName: e.target.value})}
                                        className="w-full bg-white rounded-xl p-4 text-sm font-bold text-slate-700 outline-none"
                                        placeholder="Mishal Jackson"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Age</label>
                                        <input 
                                            type="number" 
                                            value={patientDetails.age}
                                            onChange={(e) => setPatientDetails({...patientDetails, age: e.target.value})}
                                            className="w-full bg-white rounded-xl p-4 text-sm font-bold text-slate-700 outline-none"
                                            placeholder="34"
                                        />
                                    </div>
                                    <div className="relative">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Gender</label>
                                        <select 
                                            value={patientDetails.gender}
                                            onChange={(e) => setPatientDetails({...patientDetails, gender: e.target.value})}
                                            className="w-full bg-white rounded-xl p-4 text-sm font-bold text-slate-700 appearance-none outline-none"
                                        >
                                            <option>Male</option>
                                            <option>Female</option>
                                            <option>Other</option>
                                        </select>
                                        <FaChevronDown className="absolute right-4 top-[65%] -translate-y-1/2 text-slate-300 pointer-events-none" />
                                    </div>
                                </div>
                                <div className="relative">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Relation</label>
                                    <select 
                                        value={patientDetails.relation}
                                        onChange={(e) => setPatientDetails({...patientDetails, relation: e.target.value})}
                                        className="w-full bg-white rounded-xl p-4 text-sm font-bold text-slate-700 appearance-none outline-none"
                                    >
                                        <option>Self</option>
                                        <option>Father</option>
                                        <option>Mother</option>
                                        <option>Other</option>
                                    </select>
                                    <FaChevronDown className="absolute right-4 top-[65%] -translate-y-1/2 text-slate-300 pointer-events-none" />
                                </div>
                            </div>
                        </section>

                        {/* 5. Triage Facility */}
                        <section className="bg-[#F1F9F6] p-6 rounded-[2rem] space-y-4">
                            <h4 className="text-sm font-black text-slate-800">Triage Facility</h4>
                            <div className="relative">
                                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Choose Triage Facility</label>
                                <select 
                                    value={triageFacility}
                                    onChange={(e) => setTriageFacility(e.target.value)}
                                    className="w-full bg-white border-none rounded-2xl p-4 text-sm font-bold appearance-none shadow-sm outline-none"
                                    style={{
                                        color: triageFacility === 'Emergency' ? '#E11D48' : triageFacility === 'Very Urgent' ? '#F59E0B' : '#0D9488'
                                    }}
                                >
                                    <option className="text-rose-600">Emergency</option>
                                    <option className="text-amber-500">Very Urgent</option>
                                    <option className="text-yellow-500">Urgent</option>
                                    <option className="text-teal-500">Routine</option>
                                </select>
                                <FaChevronDown className="absolute right-4 top-[65%] -translate-y-1/2 text-slate-300 pointer-events-none" />
                            </div>
                        </section>

                        {/* 6. Health Details */}
                        <section className="bg-[#FFF1F1] p-6 rounded-[2rem] space-y-5">
                            <h4 className="text-sm font-black text-slate-800">Health Details</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Weight (kg)</label>
                                    <input 
                                        type="text" 
                                        placeholder="65"
                                        className="w-full bg-white rounded-xl p-4 text-sm font-bold text-slate-700 outline-none"
                                        onChange={(e) => setHealthDetails({...healthDetails, weight: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Date of Birth</label>
                                    <div className="relative">
                                        <input 
                                            type="date" 
                                            className="w-full bg-white rounded-xl p-4 text-sm font-bold text-slate-700 outline-none"
                                            onChange={(e) => setHealthDetails({...healthDetails, dob: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="relative">
                                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Spoken Language</label>
                                <select 
                                    className="w-full bg-white rounded-xl p-4 text-sm font-bold text-slate-700 appearance-none outline-none"
                                    onChange={(e) => setHealthDetails({...healthDetails, language: e.target.value})}
                                >
                                    <option>English</option>
                                    <option>Hindi</option>
                                    <option>Others</option>
                                </select>
                                <FaChevronDown className="absolute right-4 top-[65%] -translate-y-1/2 text-slate-300 pointer-events-none" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Special Instructions</label>
                                <textarea 
                                    placeholder="Please ring the doorbell upon arrival..."
                                    className="w-full bg-white rounded-2xl p-4 text-sm font-medium text-slate-600 outline-none h-24 resize-none"
                                    onChange={(e) => setHealthDetails({...healthDetails, instructions: e.target.value})}
                                />
                            </div>
                        </section>

                        {/* 7. Address Selection */}
                        <section className="space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="font-black text-slate-800">Visit Address</h3>
                                <button className="text-teal-600 text-xs font-black uppercase flex items-center gap-1"><FaPlus /> Add</button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {addresses.map((addr) => (
                                    <div
                                        key={addr._id}
                                        onClick={() => setSelectedAddressId(addr._id)}
                                        className={`cursor-pointer p-6 rounded-[2rem] border-2 transition-all relative ${selectedAddressId === addr._id
                                                ? "border-teal-500 bg-teal-50/30"
                                                : "border-slate-100 bg-white"
                                            }`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[10px] font-black uppercase px-2 py-1 bg-slate-900 text-white rounded-lg">{addr.addressType}</span>
                                            {selectedAddressId === addr._id && <FaCheckCircle className="text-teal-500" />}
                                        </div>
                                        <p className="text-xs font-bold text-slate-500 leading-relaxed">{addr.houseNo}, {addr.landmark}, {addr.city}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Checkout Summary */}
                    <div className="lg:col-span-4">
                        <div className="bg-slate-900 rounded-[3rem] p-8 text-white sticky top-28 shadow-2xl overflow-hidden">
                            <h3 className="text-xl font-black mb-8">Summary</h3>
                            <div className="space-y-6">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase text-teal-400 tracking-widest">Nurse & Service</p>
                                    <p className="font-bold text-slate-200">{nurseName}</p>
                                    <p className="text-sm font-black">{serviceTitle}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/5 p-4 rounded-2xl">
                                        <FaCalendarCheck className="text-teal-400 mb-1" />
                                        <p className="text-[9px] font-bold text-slate-400 uppercase">Date</p>
                                        <p className="font-bold text-xs">{date}</p>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-2xl">
                                        <FaClock className="text-teal-400 mb-1" />
                                        <p className="text-[9px] font-bold text-slate-400 uppercase">Time</p>
                                        <p className="font-bold text-xs">{displayTime}</p>
                                    </div>
                                </div>

                                <div className="h-px bg-white/10" />

                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">Base Fee</span>
                                        <span className="font-bold text-slate-200">₹{basePrice}</span>
                                    </div>
                                    {extraFee > 0 && (
                                        <div className="flex justify-between text-sm text-amber-400">
                                            <span className="font-bold">Premium Slot</span>
                                            <span className="font-bold">+ ₹{extraFee}</span>
                                        </div>
                                    )}
                                    <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                                        <span className="font-black text-lg">Total</span>
                                        <span className="text-3xl font-black text-teal-400">₹{totalAmount}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleFinalBooking}
                                    className="w-full bg-teal-500 text-white py-5 rounded-[2rem] font-black hover:bg-teal-400 transition-all shadow-xl active:scale-95 mt-4"
                                >
                                    Confirm & Continue
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { height: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
            `}</style>
        </div>
    );
}

export default function BookingDetailsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-teal-500"></div>
            </div>
        }>
            <BookingDetailsContent />
        </Suspense>
    );
}