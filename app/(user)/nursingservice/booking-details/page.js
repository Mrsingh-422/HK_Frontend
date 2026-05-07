"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
    FaArrowLeft, FaCheckCircle, FaPlus, FaUserCircle, 
    FaChevronDown, FaStethoscope, FaClipboardList, FaHeartbeat
} from "react-icons/fa";
import UserAPI from "@/app/services/UserAPI";

// const BASE_URL = "http://192.168.1.26:5002";
const BASE_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}`;

function BookingDetailsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // URL Params from Previous Page
    const nurseId = searchParams.get("nurseId");
    const nurseName = searchParams.get("nurseName");
    const nurseImage = searchParams.get("nurseImage");
    const serviceId = searchParams.get("serviceId");
    const serviceTitle = searchParams.get("serviceTitle");
    const basePrice = parseFloat(searchParams.get("servicePrice") || 0);

    // Data States
    const [familyMembers, setFamilyMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Selection & Form States
    const [selectedFamilyId, setSelectedFamilyId] = useState(null);
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
                const familyRes = await UserAPI.getFamilyMembers();
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
        if (!patientDetails.fullName || !patientDetails.age) {
            return alert("Please fill in patient details");
        }

        const queryParams = new URLSearchParams({
            nurseId,
            nurseName,
            nurseImage,
            serviceId,
            serviceTitle,
            servicePrice: basePrice.toString(),
            familyMemberId: selectedFamilyId || "",
            location,
            patientName: patientDetails.fullName,
            patientAge: patientDetails.age,
            patientGender: patientDetails.gender,
            patientRelation: patientDetails.relation,
            triage: triageFacility,
            weight: healthDetails.weight,
            dob: healthDetails.dob,
            language: healthDetails.language,
            instructions: healthDetails.instructions
        }).toString();

        // Navigate to scheduling page for Slots and Address selection
        router.push(`/nursingservice/appointment-scheduling?${queryParams}`);
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
                    <h1 className="text-xl font-black text-slate-900">Patient Information</h1>
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
                                    Complete the patient profile to proceed with {nurseName}.
                                </p>
                                <ul className="space-y-1">
                                    {['Verified Expert', 'Background checked'].map(item => (
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

                        {/* 2. Family Members */}
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
                                {/* <button className="flex flex-col items-center gap-2 min-w-[80px]">
                                    <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 bg-white">
                                        <FaPlus />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-500">Add New</span>
                                </button> */}
                            </div>
                        </section>

                        {/* 3. Assessment Location */}
                        <section className="bg-[#F1F9F6] p-6 rounded-[2rem] space-y-4">
                            <h4 className="text-sm font-black text-slate-800">Assessment Location</h4>
                            <div className="relative">
                                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Where should the nurse visit?</label>
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
                                        placeholder="Enter name"
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
                                            placeholder="Ex: 45"
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
                            <h4 className="text-sm font-black text-slate-800">Triage Facility (Urgency)</h4>
                            <div className="relative">
                                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Select Urgency Level</label>
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
                                    placeholder="Provide any medical history or special needs..."
                                    className="w-full bg-white rounded-2xl p-4 text-sm font-medium text-slate-600 outline-none h-24 resize-none"
                                    onChange={(e) => setHealthDetails({...healthDetails, instructions: e.target.value})}
                                />
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Summary Card */}
                    <div className="lg:col-span-4">
                        <div className="bg-slate-900 rounded-[3rem] p-8 text-white sticky top-28 shadow-2xl overflow-hidden">
                            <h3 className="text-xl font-black mb-8">Booking Summary</h3>
                            <div className="space-y-6">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase text-teal-400 tracking-widest">Nurse</p>
                                    <p className="font-bold text-slate-200">{nurseName}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase text-teal-400 tracking-widest">Service</p>
                                    <p className="text-sm font-black">{serviceTitle}</p>
                                </div>

                                <div className="bg-white/5 p-4 rounded-2xl flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400">
                                        <FaClipboardList />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase">Next Step</p>
                                        <p className="font-bold text-xs">Schedule Date & Time</p>
                                    </div>
                                </div>

                                <div className="h-px bg-white/10" />

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-400 text-sm">Estimated Total</span>
                                        <span className="text-2xl font-black text-teal-400">₹{basePrice}</span>
                                    </div>
                                    <p className="text-[9px] text-slate-500 leading-relaxed italic">
                                        * Final amount may vary based on premium slot selection and distance.
                                    </p>
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