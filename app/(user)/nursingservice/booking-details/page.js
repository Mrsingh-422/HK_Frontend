"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import {
    FaArrowLeft, FaCheckCircle, FaUserCircle,
    FaChevronDown, FaClipboardList, FaPlus, FaTimes
} from "react-icons/fa";
import toast from "react-hot-toast";
import UserAPI from "@/app/services/UserAPI";
import { useGlobalContext } from "@/app/context/GlobalContext";

const BASE_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}`;

function BookingDetailsContent() {
    const router = useRouter();
    const [initialData, setInitialData] = useState(null);
    const [familyMembers, setFamilyMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const { openModal } = useGlobalContext()

    // Now tracking multiple selected IDs
    const [selectedFamilyIds, setSelectedFamilyIds] = useState([]);
    const [location, setLocation] = useState("At Home");

    // Now tracking multiple patients' input data
    const [patients, setPatients] = useState([]);

    const [healthDetails, setHealthDetails] = useState({
        height: "",
        dob: "",
        language: "English",
        instructions: ""
    });

    useEffect(() => {
        const token = localStorage.getItem('userToken');
        if (!token) {
            toast.error("Please login to continue");
            router.push('/nursingservice');
            // openModal("login")
            return;
        }

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

    // Toggle Selection for Multiple Family Members
    const handleToggleFamily = (member) => {
        const isSelected = selectedFamilyIds.includes(member._id);

        if (isSelected) {
            // Remove member
            setSelectedFamilyIds(prev => prev.filter(id => id !== member._id));
            setPatients(prev => prev.filter(p => p.patientId !== member._id));
        } else {
            // Add member
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

    // Update specific patient details in the array
    const updatePatientData = (id, field, value) => {
        setPatients(prev => prev.map(p =>
            p.patientId === id ? { ...p, [field]: value } : p
        ));
    };

    const handleNextStep = () => {
        if (patients.length === 0) {
            return alert("Please select at least one patient");
        }

        for (let p of patients) {
            if (!p.fullName || !p.age) {
                return alert(`Please complete details for ${p.fullName || 'selected patient'}`);
            }
        }

        const updatedBooking = {
            ...initialData,
            assessmentLocation: location,
            // Mapping to match your backend schema
            patients: patients.map(p => ({
                patientId: p.patientId,
                name: p.fullName,
                age: parseInt(p.age),
                gender: p.gender,
                relation: p.relation
            })),
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
                        {/* Header Banner */}
                        <div className="bg-[#E6F7F1] rounded-[2.5rem] p-8 flex items-center justify-between overflow-hidden relative">
                            <div className="space-y-3 max-w-[60%] relative z-10">
                                <h2 className="text-2xl font-black text-[#0D5F46] leading-tight">
                                    {initialData.serviceDetails?.title}
                                </h2>
                                <p className="text-[#3A8F76] text-xs font-bold leading-relaxed">
                                    Complete the patient profile to proceed with {initialData.nurseName}.
                                </p>
                            </div>
                            <img src={getImageUrl(initialData.nurseImage)} className="w-32 h-32 md:w-44 md:h-44 object-cover rounded-3xl rotate-3 shadow-xl border-4 border-white" alt="Nurse" />
                        </div>

                        {/* Family Selector (Multi-Select) */}
                        <section className="space-y-4">
                            <h3 className="font-black text-slate-800 ml-2">Select Patients (Multiple Allowed)</h3>
                            <div className="flex items-start gap-6 overflow-x-auto pb-4 custom-scrollbar">
                                {familyMembers.map((member) => (
                                    <button
                                        key={member._id}
                                        onClick={() => handleToggleFamily(member)}
                                        className="flex flex-col items-center gap-2 min-w-[80px]"
                                    >
                                        <div className={`w-16 h-16 rounded-full border-4 p-1 transition-all relative ${selectedFamilyIds.includes(member._id) ? "border-teal-500 scale-110" : "border-transparent"}`}>
                                            <div className="w-full h-full rounded-full overflow-hidden bg-slate-200">
                                                {member.profilePic ? (
                                                    <img src={`${BASE_URL}${member.profilePic}`} className="w-full h-full object-cover" alt="mem" />
                                                ) : (
                                                    <FaUserCircle className="w-full h-full text-slate-400" />
                                                )}
                                            </div>
                                            {selectedFamilyIds.includes(member._id) && (
                                                <div className="absolute -top-1 -right-1 bg-teal-500 text-white rounded-full p-1 text-[8px]">
                                                    <FaCheckCircle />
                                                </div>
                                            )}
                                        </div>
                                        <span className={`text-[10px] font-black whitespace-nowrap ${selectedFamilyIds.includes(member._id) ? "text-teal-600" : "text-slate-500"}`}>
                                            {member.memberName}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* Assessment Location */}
                        <section className="bg-[#F1F9F6] p-6 rounded-[2rem] space-y-4">
                            <h4 className="text-sm font-black text-slate-800">Assessment Location</h4>
                            <select
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="w-full bg-white border-none rounded-2xl p-4 text-sm font-bold text-slate-700 shadow-sm outline-none"
                            >
                                <option value="At Home">At Home</option>
                                <option value="At Hospital">At Hospital</option>
                            </select>
                        </section>

                        {/* Dynamic Patient Forms */}
                        {patients.map((patient, index) => (
                            <section key={patient.patientId} className="bg-[#FFF9F1] p-6 rounded-[2rem] space-y-5 border-2 border-orange-100 animate-in fade-in slide-in-from-bottom-4">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-sm font-black text-orange-800">Patient #{index + 1} Details</h4>
                                    <button onClick={() => handleToggleFamily({ _id: patient.patientId })} className="text-orange-300 hover:text-orange-600 transition-colors">
                                        <FaTimes />
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Full Name</label>
                                        <input
                                            type="text"
                                            value={patient.fullName}
                                            onChange={(e) => updatePatientData(patient.patientId, 'fullName', e.target.value)}
                                            className="w-full bg-white rounded-xl p-4 text-sm font-bold text-slate-700 outline-none shadow-sm"
                                            placeholder="Enter name"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Age</label>
                                            <input
                                                type="number"
                                                value={patient.age}
                                                onChange={(e) => updatePatientData(patient.patientId, 'age', e.target.value)}
                                                className="w-full bg-white rounded-xl p-4 text-sm font-bold text-slate-700 outline-none shadow-sm"
                                            />
                                        </div>
                                        <div className="relative">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Gender</label>
                                            <select
                                                value={patient.gender}
                                                onChange={(e) => updatePatientData(patient.patientId, 'gender', e.target.value)}
                                                className="w-full bg-white rounded-xl p-4 text-sm font-bold text-slate-700 appearance-none outline-none shadow-sm"
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
                                            value={patient.relation}
                                            onChange={(e) => updatePatientData(patient.patientId, 'relation', e.target.value)}
                                            className="w-full bg-white rounded-xl p-4 text-sm font-bold text-slate-700 outline-none shadow-sm"
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
                        ))}

                        {/* General Health Info (Single section for the visit) */}
                        <section className="bg-[#FFF1F1] p-6 rounded-[2rem] space-y-5">
                            <h4 className="text-sm font-black text-slate-800">Additional Information</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Visit Language</label>
                                    <select
                                        value={healthDetails.language}
                                        className="w-full bg-white rounded-xl p-4 text-sm font-bold text-slate-700 outline-none"
                                        onChange={(e) => setHealthDetails({ ...healthDetails, language: e.target.value })}
                                    >
                                        <option>English</option>
                                        <option>Hindi</option>
                                        <option>Punjabi</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">DOB (Primary Patient)</label>
                                    <input
                                        type="date"
                                        value={healthDetails.dob}
                                        className="w-full bg-white rounded-xl p-4 text-sm font-bold text-slate-700 outline-none"
                                        onChange={(e) => setHealthDetails({ ...healthDetails, dob: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Special Instructions</label>
                                <textarea
                                    placeholder="Medical history, allergies, or special needs..."
                                    value={healthDetails.instructions}
                                    className="w-full bg-white rounded-2xl p-4 text-sm font-medium text-slate-600 outline-none h-24 resize-none shadow-inner"
                                    onChange={(e) => setHealthDetails({ ...healthDetails, instructions: e.target.value })}
                                />
                            </div>
                        </section>
                    </div>

                    {/* Summary Sidebar */}
                    <div className="lg:col-span-4">
                        <div className="bg-slate-900 rounded-[3rem] p-8 text-white sticky top-28 shadow-2xl overflow-hidden">
                            <h3 className="text-xl font-black mb-8">Booking Summary</h3>
                            <div className="space-y-6">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase text-teal-400 tracking-widest">Selected Item</p>
                                    <p className="text-sm font-black">{initialData.serviceDetails?.title}</p>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-[10px] font-black uppercase text-teal-400 tracking-widest">Patients Selected</p>
                                    {patients.length > 0 ? (
                                        patients.map((p, idx) => (
                                            <div key={p.patientId} className="bg-white/5 p-3 rounded-xl flex justify-between items-center">
                                                <p className="font-bold text-xs">{p.fullName}</p>
                                                <p className="text-[10px] text-slate-400">{p.age} yrs</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-xs text-slate-500 italic">No patients selected</p>
                                    )}
                                </div>

                                <div className="bg-white/5 p-4 rounded-2xl flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400">
                                        <FaClipboardList />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase">Status</p>
                                        <p className="font-bold text-xs">{patients.length} Patient(s) Ready</p>
                                    </div>
                                </div>

                                <div className="h-px bg-white/10" />

                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400 text-sm">Base Rate</span>
                                    <span className="text-2xl font-black text-teal-400">₹{initialData.basePrice}</span>
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