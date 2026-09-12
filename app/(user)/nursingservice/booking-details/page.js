"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import {
    FaArrowLeft, FaCheckCircle, FaUserCircle,
    FaChevronDown, FaTimes,
    FaHome, FaHospital
} from "react-icons/fa";
import UserAPI from "@/app/services/UserAPI";
import CostoumPopup from "@/lib/CostoumPopup";

const BASE_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}`;

function BookingDetailsContent() {
    const router = useRouter();
    const [initialData, setInitialData] = useState(null);
    const [familyMembers, setFamilyMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Multi-Patient Selection States
    const [selectedFamilyIds, setSelectedFamilyIds] = useState([]);
    const [patients, setPatients] = useState([]);

    // Strict Backend Enum: 'At Home' | 'At Hospital'
    const [location, setLocation] = useState("At Home");

    // General Health Details
    const [healthDetails, setHealthDetails] = useState({
        height: "",
        dob: "",
        language: "English",
        instructions: ""
    });

    useEffect(() => {
        const token = localStorage.getItem('userToken');
        if (!token) {
            CostoumPopup("Please Login To Continue", "warning", 4000);
            router.push('/nursingservice');
            return;
        }

        const fetchBookingData = async () => {
            try {
                setLoading(true);
                const savedData = sessionStorage.getItem("pendingNurseBooking");
                if (savedData) {
                    const parsed = JSON.parse(savedData);
                    setInitialData(parsed);
                    if (parsed.assessmentLocation === "At Hospital" || parsed.assessmentLocation === "At Home") {
                        setLocation(parsed.assessmentLocation);
                    }
                } else {
                    router.push("/nursingservice");
                    return;
                }

                const familyRes = await UserAPI.getFamilyMembers();
                if (familyRes?.success && familyRes.data?.length > 0) {
                    setFamilyMembers(familyRes.data);
                    // Default to Self
                    const selfMember = familyRes.data.find(m => m.relation === "Self") || familyRes.data[0];
                    if (selfMember) {
                        setSelectedFamilyIds([selfMember._id]);
                        setPatients([{
                            patientId: selfMember._id,
                            fullName: selfMember.memberName,
                            age: selfMember.age || "",
                            gender: selfMember.gender || "Male",
                            relation: selfMember.relation || "Self"
                        }]);
                    }
                }
            } catch (error) {
                console.error("Error fetching booking details data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBookingData();
    }, [router]);

    // Toggle Selection for Multiple Family Members
    const handleToggleFamily = (member) => {
        const isSelected = selectedFamilyIds.includes(member._id);

        if (isSelected) {
            setSelectedFamilyIds(prev => prev.filter(id => id !== member._id));
            setPatients(prev => prev.filter(p => p.patientId !== member._id));
        } else {
            setSelectedFamilyIds(prev => [...prev, member._id]);
            setPatients(prev => [...prev, {
                patientId: member._id,
                fullName: member.memberName,
                age: member.age || "",
                gender: member.gender || "Female",
                relation: member.relation || "Other"
            }]);
        }
    };

    // Update specific patient details in array
    const updatePatientData = (id, field, value) => {
        setPatients(prev => prev.map(p =>
            p.patientId === id ? { ...p, [field]: value } : p
        ));
    };

    // Step Transition Handler
    const handleNextStep = () => {
        if (patients.length === 0) {
            CostoumPopup("Please select at least one patient", "warning", 3000);
            return;
        }

        for (let p of patients) {
            if (!p.fullName?.trim() || !p.age) {
                CostoumPopup(`Please complete details for ${p.fullName || 'selected patient'}`, "warning", 3000);
                return;
            }
        }

        const validAssessmentLocation = location === "At Hospital" ? "At Hospital" : "At Home";

        const updatedBooking = {
            ...initialData,
            assessmentLocation: validAssessmentLocation,
            patients: patients.map(p => ({
                patientId: p.patientId,
                name: p.fullName,
                age: parseInt(p.age, 10),
                gender: p.gender,
                relation: p.relation
            })),
            healthDetails: {
                height: healthDetails.height || "",
                dob: healthDetails.dob || null,
                language: healthDetails.language || "English",
                specialInstructions: healthDetails.instructions || ""
            }
        };

        sessionStorage.setItem("pendingNurseBooking", JSON.stringify(updatedBooking));
        router.push(`/nursingservice/appointment-scheduling`);
    };

    if (loading || !initialData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-emerald-500"></div>
            </div>
        );
    }

    const getImageUrl = (path) => {
        if (!path) return "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070&auto=format&fit=crop";
        if (path.startsWith("http")) return path;
        return `${BASE_URL}/${path.replace(/^public\//, "")}`.replace(/([^:]\/)\/+/g, "$1");
    };

    return (
        <div className="min-h-screen bg-[#FDFEFF] font-sans pb-20">
            {/* Header */}
            <div className="bg-white border-b border-slate-100 py-4 px-6 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => router.back()} className="text-slate-900 p-2 hover:bg-slate-100 rounded-full transition-all">
                            <FaArrowLeft />
                        </button>
                        <h1 className="text-base font-black text-slate-900 uppercase tracking-wider">Patient Details & Location</h1>
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Step 1 of 2</div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-6 mt-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
                    
                    {/* LEFT COLUMN */}
                    <div className="lg:col-span-8 space-y-8">
                        
                        {/* Service Banner */}
                        <div className="bg-emerald-50 border border-emerald-100 rounded-[2rem] p-6 md:p-8 flex items-center justify-between overflow-hidden relative">
                            <div className="space-y-2 max-w-[65%] z-10">
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-100/60 px-2.5 py-1 rounded-full">Selected Service</span>
                                <h2 className="text-xl md:text-2xl font-black text-emerald-950 leading-tight">
                                    {initialData.serviceDetails?.title}
                                </h2>
                                <p className="text-emerald-700 text-xs font-semibold leading-relaxed">
                                    Complete patient profile & visit location for Nurse {initialData.nurseName}.
                                </p>
                            </div>
                            <img
                                src={getImageUrl(initialData.nurseImage)}
                                className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-2xl shadow-lg border-2 border-white"
                                alt="Nurse"
                            />
                        </div>

                        {/* 1. ASSESSMENT LOCATION SELECTOR */}
                        <section className="bg-white border border-slate-200/80 p-6 rounded-[2rem] shadow-sm space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">1. Assessment Location</h4>
                                    <p className="text-xs text-slate-500 mt-0.5">Where should the nurse attend to the patient?</p>
                                </div>
                                <span className="text-[10px] font-black text-emerald-600 uppercase bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                                    {location} Selected
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* At Home Card */}
                                <button
                                    type="button"
                                    onClick={() => setLocation("At Home")}
                                    className={`p-5 rounded-2xl border-2 transition-all text-left flex items-start justify-between
                                        ${location === "At Home"
                                            ? 'border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-500'
                                            : 'border-slate-200 hover:border-slate-300 bg-white'}`}
                                >
                                    <div className="flex items-start gap-3.5">
                                        <div className={`p-3 rounded-xl ${location === "At Home" ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                                            <FaHome size={18} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900">At Home Visit</p>
                                            <p className="text-[11px] text-slate-500 mt-0.5">Nurse visits your doorstep or residence</p>
                                        </div>
                                    </div>
                                    {location === "At Home" && <FaCheckCircle className="text-emerald-600 mt-1" size={16} />}
                                </button>

                                {/* At Hospital Card */}
                                <button
                                    type="button"
                                    onClick={() => setLocation("At Hospital")}
                                    className={`p-5 rounded-2xl border-2 transition-all text-left flex items-start justify-between
                                        ${location === "At Hospital"
                                            ? 'border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-500'
                                            : 'border-slate-200 hover:border-slate-300 bg-white'}`}
                                >
                                    <div className="flex items-start gap-3.5">
                                        <div className={`p-3 rounded-xl ${location === "At Hospital" ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                                            <FaHospital size={18} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900">At Hospital</p>
                                            <p className="text-[11px] text-slate-500 mt-0.5">Bedside care at a hospital or clinic</p>
                                        </div>
                                    </div>
                                    {location === "At Hospital" && <FaCheckCircle className="text-emerald-600 mt-1" size={16} />}
                                </button>
                            </div>
                        </section>

                        {/* 2. FAMILY PATIENT SELECTOR */}
                        <section className="bg-white border border-slate-200/80 p-6 rounded-[2rem] shadow-sm space-y-4">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">2. Select Patients</h3>
                            <div className="flex items-start gap-4 overflow-x-auto pb-2 custom-scrollbar">
                                {familyMembers.map((member) => {
                                    const isSelected = selectedFamilyIds.includes(member._id);
                                    return (
                                        <button
                                            key={member._id}
                                            type="button"
                                            onClick={() => handleToggleFamily(member)}
                                            className="flex flex-col items-center gap-2 min-w-[85px] focus:outline-none"
                                        >
                                            <div className={`w-16 h-16 rounded-full border-2 p-0.5 transition-all relative ${isSelected ? "border-emerald-600 ring-2 ring-emerald-500/20 scale-105" : "border-slate-200"}`}>
                                                <div className="w-full h-full rounded-full overflow-hidden bg-slate-100 flex items-center justify-center">
                                                    {member.profilePic ? (
                                                        <img src={`${BASE_URL}${member.profilePic}`} className="w-full h-full object-cover" alt={member.memberName} />
                                                    ) : (
                                                        <FaUserCircle className="w-full h-full text-slate-300" />
                                                    )}
                                                </div>
                                                {isSelected && (
                                                    <div className="absolute -top-1 -right-1 bg-emerald-600 text-white rounded-full p-1 text-[8px] shadow">
                                                        <FaCheckCircle />
                                                    </div>
                                                )}
                                            </div>
                                            <span className={`text-[10px] font-black truncate max-w-[80px] ${isSelected ? "text-emerald-700 font-black" : "text-slate-600"}`}>
                                                {member.memberName}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </section>

                        {/* 3. DYNAMIC PATIENT FORMS */}
                        {patients.map((patient, index) => (
                            <section key={patient.patientId} className="bg-white p-6 rounded-[2rem] space-y-4 border border-slate-200/80 shadow-sm animate-in fade-in">
                                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Patient #{index + 1} Profile</h4>
                                    <button
                                        type="button"
                                        onClick={() => handleToggleFamily({ _id: patient.patientId })}
                                        className="text-slate-400 hover:text-rose-500 text-xs font-bold transition-colors"
                                    >
                                        <FaTimes />
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Full Name *</label>
                                        <input
                                            type="text"
                                            value={patient.fullName}
                                            onChange={(e) => updatePatientData(patient.patientId, 'fullName', e.target.value)}
                                            className="w-full bg-slate-50 rounded-xl p-3.5 text-xs font-bold text-slate-800 border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500/20"
                                            placeholder="Enter patient full name"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Age *</label>
                                            <input
                                                type="number"
                                                value={patient.age}
                                                onChange={(e) => updatePatientData(patient.patientId, 'age', e.target.value)}
                                                className="w-full bg-slate-50 rounded-xl p-3.5 text-xs font-bold text-slate-800 border border-slate-200 outline-none"
                                                placeholder="e.g. 35"
                                            />
                                        </div>
                                        <div className="relative">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Gender</label>
                                            <select
                                                value={patient.gender}
                                                onChange={(e) => updatePatientData(patient.patientId, 'gender', e.target.value)}
                                                className="w-full bg-slate-50 rounded-xl p-3.5 text-xs font-bold text-slate-800 border border-slate-200 appearance-none outline-none"
                                            >
                                                <option>Male</option>
                                                <option>Female</option>
                                                <option>Other</option>
                                            </select>
                                            <FaChevronDown className="absolute right-4 top-[65%] -translate-y-1/2 text-slate-400 pointer-events-none text-xs" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Relation</label>
                                        <select
                                            value={patient.relation}
                                            onChange={(e) => updatePatientData(patient.patientId, 'relation', e.target.value)}
                                            className="w-full bg-slate-50 rounded-xl p-3.5 text-xs font-bold text-slate-800 border border-slate-200 outline-none"
                                        >
                                            <option>Self</option>
                                            <option>Father</option>
                                            <option>Mother</option>
                                            <option>Spouse</option>
                                            <option>Child</option>
                                            <option>Other</option>
                                        </select>
                                    </div>
                                </div>
                            </section>
                        ))}

                        {/* 4. CLINICAL INSTRUCTIONS */}
                        <section className="bg-white p-6 rounded-[2rem] space-y-4 border border-slate-200/80 shadow-sm">
                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">3. Additional Health Info</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Preferred Language</label>
                                    <select
                                        value={healthDetails.language}
                                        className="w-full bg-slate-50 rounded-xl p-3.5 text-xs font-bold text-slate-800 border border-slate-200 outline-none"
                                        onChange={(e) => setHealthDetails({ ...healthDetails, language: e.target.value })}
                                    >
                                        <option>English</option>
                                        <option>Hindi</option>
                                        <option>Punjabi</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">DOB (Optional)</label>
                                    <input
                                        type="date"
                                        value={healthDetails.dob}
                                        className="w-full bg-slate-50 rounded-xl p-3.5 text-xs font-bold text-slate-800 border border-slate-200 outline-none"
                                        onChange={(e) => setHealthDetails({ ...healthDetails, dob: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Special Clinical Instructions</label>
                                <textarea
                                    placeholder="Brief symptoms, allergies, mobility concerns, or nursing notes..."
                                    value={healthDetails.instructions}
                                    className="w-full bg-slate-50 rounded-xl p-3.5 text-xs font-medium text-slate-700 border border-slate-200 outline-none h-20 resize-none focus:ring-2 focus:ring-emerald-500/20"
                                    onChange={(e) => setHealthDetails({ ...healthDetails, instructions: e.target.value })}
                                />
                            </div>
                        </section>
                    </div>

                    {/* RIGHT COLUMN: SIDEBAR SUMMARY */}
                    <div className="lg:col-span-4">
                        <div className="bg-slate-900 rounded-[2.5rem] p-6 md:p-8 text-white sticky top-24 shadow-2xl space-y-6">
                            <h3 className="text-lg font-black tracking-tight">Booking Overview</h3>
                            
                            <div className="space-y-4 text-xs">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest block">Selected Service</span>
                                    <p className="text-sm font-bold text-white leading-tight">{initialData.serviceDetails?.title}</p>
                                </div>

                                <div className="space-y-1">
                                    <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest block">Assessment Location</span>
                                    <div className="flex items-center gap-2 text-white font-bold">
                                        {location === "At Home" ? <FaHome className="text-emerald-400" /> : <FaHospital className="text-emerald-400" />}
                                        <span>{location}</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest block">Patients Selected ({patients.length})</span>
                                    {patients.length > 0 ? (
                                        patients.map((p) => (
                                            <div key={p.patientId} className="bg-white/10 p-2.5 rounded-xl flex justify-between items-center text-xs">
                                                <span className="font-bold text-white">{p.fullName}</span>
                                                <span className="text-[10px] text-slate-300 font-semibold">{p.age} yrs • {p.relation}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-xs text-slate-400 italic">No patients selected</p>
                                    )}
                                </div>

                                <div className="h-px bg-white/10 my-4" />

                                <div className="flex justify-between items-baseline">
                                    <span className="text-slate-400 text-xs">Base Rate</span>
                                    <span className="text-2xl font-black text-emerald-400">₹{initialData.basePrice || 0}</span>
                                </div>

                                <button
                                    onClick={handleNextStep}
                                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20 active:scale-95 mt-4"
                                >
                                    Proceed to Slots & Address
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default function BookingDetailsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-bold text-slate-400">Loading...</div>}>
            <BookingDetailsContent />
        </Suspense>
    );
}