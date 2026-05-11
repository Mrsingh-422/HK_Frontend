"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import {
    FaArrowLeft, FaCheckCircle, FaUserCircle, 
    FaChevronDown, FaClipboardList
} from "react-icons/fa";
import UserAPI from "@/app/services/UserAPI";

const BASE_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}`;

function BookingDetailsContent() {
    const router = useRouter();
    const [initialData, setInitialData] = useState(null);
    const [familyMembers, setFamilyMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedFamilyId, setSelectedFamilyId] = useState(null);
    const [location, setLocation] = useState("At Home");
    
    const [patientDetails, setPatientDetails] = useState({
        fullName: "",
        age: "",
        gender: "Female",
        relation: "Self"
    });

    const [healthDetails, setHealthDetails] = useState({
        height: "",
        dob: "",
        language: "English",
        instructions: ""
    });

    useEffect(() => {
        const fetchBookingData = async () => {
            try {
                setLoading(true);
                const savedData = sessionStorage.getItem("pendingNurseBooking");
                if (savedData) {
                    setInitialData(JSON.parse(savedData));
                } else {
                    router.push("/nursingservice");
                    return;
                }

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
    }, [router]);

    const handleSelectFamily = (member) => {
        setSelectedFamilyId(member._id);
        setPatientDetails({
            fullName: member.memberName,
            age: member.age || "",
            gender: member.gender || "Female",
            relation: member.relation || "Other"
        });
        
        if(member.dob) {
            const dobDate = new Date(member.dob);
            const formattedDob = dobDate.toISOString().split('T')[0];
            setHealthDetails(prev => ({ ...prev, dob: formattedDob }));
        }
    };

    const handleNextStep = () => {
        if (!patientDetails.fullName) {
            return alert("Please enter patient's full name");
        }
        if (!patientDetails.age) {
            return alert("Please enter patient's age");
        }

        const updatedBooking = {
            ...initialData,
            assessmentLocation: location,
            patients: [{
                patientId: selectedFamilyId || "Self",
                name: patientDetails.fullName,
                age: parseInt(patientDetails.age),
                gender: patientDetails.gender,
                relation: patientDetails.relation
            }],
            healthDetails: {
                height: healthDetails.height,
                dob: healthDetails.dob || null,
                language: healthDetails.language,
                specialInstructions: healthDetails.instructions
            }
        };

        sessionStorage.setItem("pendingNurseBooking", JSON.stringify(updatedBooking));
        router.push(`/nursingservice/appointment-scheduling`);
    };

    if (loading || !initialData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-teal-500"></div>
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
                    <div className="lg:col-span-8 space-y-8">
                        <div className="bg-[#E6F7F1] rounded-[2.5rem] p-8 flex items-center justify-between overflow-hidden relative">
                            <div className="space-y-3 max-w-[60%] relative z-10">
                                <h2 className="text-2xl font-black text-[#0D5F46] leading-tight">
                                    {initialData.serviceDetails?.title}
                                </h2>
                                <p className="text-[#3A8F76] text-xs font-bold leading-relaxed">
                                    Complete the patient profile to proceed with {initialData.nurseName}.
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
                                src={getImageUrl(initialData.nurseImage)} 
                                className="w-32 h-32 md:w-44 md:h-44 object-cover rounded-3xl rotate-3 shadow-xl border-4 border-white" 
                                alt="Nurse" 
                            />
                        </div>

                        <section className="space-y-4">
                            <h3 className="font-black text-slate-800 ml-2">Who is this appointment for?</h3>
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
                                            {member.memberName}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </section>

                        <section className="bg-[#F1F9F6] p-6 rounded-[2rem] space-y-4">
                            <h4 className="text-sm font-black text-slate-800">Assessment Location</h4>
                            <div className="relative">
                                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Visit Venue</label>
                                <select 
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="w-full bg-white border-none rounded-2xl p-4 text-sm font-bold text-slate-700 shadow-sm outline-none"
                                >
                                    <option value="At Home">At Home</option>
                                    <option value="At Hospital">At Hospital</option>
                                </select>
                            </div>
                        </section>

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
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Relation</label>
                                    <select 
                                        value={patientDetails.relation}
                                        onChange={(e) => setPatientDetails({...patientDetails, relation: e.target.value})}
                                        className="w-full bg-white rounded-xl p-4 text-sm font-bold text-slate-700 outline-none"
                                    >
                                        <option>Self</option>
                                        <option>Father</option>
                                        <option>Mother</option>
                                        <option>Spouse</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                            </div>
                        </section>

                        <section className="bg-[#FFF1F1] p-6 rounded-[2rem] space-y-5">
                            <h4 className="text-sm font-black text-slate-800">Health Details</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Height (Optional)</label>
                                    <input 
                                        type="text" 
                                        placeholder="5.8 ft"
                                        value={healthDetails.height}
                                        className="w-full bg-white rounded-xl p-4 text-sm font-bold text-slate-700 outline-none"
                                        onChange={(e) => setHealthDetails({...healthDetails, height: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Date of Birth</label>
                                    <input 
                                        type="date" 
                                        value={healthDetails.dob}
                                        className="w-full bg-white rounded-xl p-4 text-sm font-bold text-slate-700 outline-none"
                                        onChange={(e) => setHealthDetails({...healthDetails, dob: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Preferred Language</label>
                                <select 
                                    value={healthDetails.language}
                                    className="w-full bg-white rounded-xl p-4 text-sm font-bold text-slate-700 outline-none"
                                    onChange={(e) => setHealthDetails({...healthDetails, language: e.target.value})}
                                >
                                    <option>English</option>
                                    <option>Hindi</option>
                                    <option>Punjabi</option>
                                    <option>Local Language</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Special Instructions</label>
                                <textarea 
                                    placeholder="Medical history, allergies, or special needs..."
                                    value={healthDetails.instructions}
                                    className="w-full bg-white rounded-2xl p-4 text-sm font-medium text-slate-600 outline-none h-24 resize-none shadow-inner"
                                    onChange={(e) => setHealthDetails({...healthDetails, instructions: e.target.value})}
                                />
                            </div>
                        </section>
                    </div>

                    <div className="lg:col-span-4">
                        <div className="bg-slate-900 rounded-[3rem] p-8 text-white sticky top-28 shadow-2xl overflow-hidden">
                            <h3 className="text-xl font-black mb-8">Booking Summary</h3>
                            <div className="space-y-6">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase text-teal-400 tracking-widest">Nurse</p>
                                    <p className="font-bold text-slate-200">{initialData.nurseName}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase text-teal-400 tracking-widest">Selected Item</p>
                                    <p className="text-sm font-black">{initialData.serviceDetails?.title}</p>
                                </div>

                                {patientDetails.fullName && (
                                    <div className="bg-white/5 p-4 rounded-2xl space-y-1">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase">Patient</p>
                                        <p className="font-bold text-sm">{patientDetails.fullName}, {patientDetails.age} yrs</p>
                                    </div>
                                )}

                                <div className="bg-white/5 p-4 rounded-2xl flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400">
                                        <FaClipboardList />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase">Next Step</p>
                                        <p className="font-bold text-xs">Schedule & Address</p>
                                    </div>
                                </div>

                                <div className="h-px bg-white/10" />

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-400 text-sm">Base Price</span>
                                        <span className="text-2xl font-black text-teal-400">₹{initialData.basePrice}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleNextStep}
                                    className="w-full bg-teal-500 text-white py-5 rounded-[2rem] font-black hover:bg-teal-400 transition-all shadow-xl active:scale-95 mt-4"
                                >
                                    Choose Slots & Address
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
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <BookingDetailsContent />
        </Suspense>
    );
}