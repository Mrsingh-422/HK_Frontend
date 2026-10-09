"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    FaArrowLeft, FaMapMarkerAlt, FaHospital, FaBed,
    FaUserMd, FaStar, FaPhoneAlt,
    FaRegEnvelope, FaStethoscope, FaChevronRight, FaCommentDots,
    FaCalendarCheck, FaClock, FaSearch, FaFilter,
    FaClinicMedical, FaProcedures, FaNotesMedical, FaCheckCircle
} from "react-icons/fa";
import UserAPI from "@/app/services/UserAPI";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function HospitalDetailPage() {
    const { id } = useParams(); // Hospital ID from URL
    const router = useRouter();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Active Tab: 'ipd' | 'opd'
    const [activeTab, setActiveTab] = useState("opd");

    // OPD Search & Filter States
    const [doctorSearch, setDoctorSearch] = useState("");
    const [selectedSpecialty, setSelectedSpecialty] = useState("All");

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                setLoading(true);
                const response = await UserAPI.getHospitalDetail(id);
                if (response.success) setData(response.data);
            } catch (error) {
                console.error("Error fetching hospital details:", error);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchDetails();
    }, [id]);

    const getImageUrl = (path) => {
        if (!path) return "https://images.unsplash.com/photo-1586773860418-d3b97998c637?auto=format&fit=crop&q=80&w=1000";
        const cleanPath = path.toString().replace(/^public\//, "").replace(/^\//, "");
        return `${BASE_URL}/${cleanPath}`;
    };

    // -----------------------------------------------------------------
    // HANDLER 1: Save Ward data & Navigate (IPD Flow)
    // -----------------------------------------------------------------
    const handleWardClick = (ward) => {
        const wardPayload = {
            hospitalId: id,
            hospitalName: data.hospital.name,
            wardId: ward._id,
            wardName: ward.name,
            wardType: ward.type,
            availableBeds: ward.availableBeds,
            totalBeds: ward.totalBeds,
            timestamp: new Date().getTime()
        };

        sessionStorage.setItem("activeWardRequest", JSON.stringify(wardPayload));
        router.push("/hospital/showbeds");
    };

    // -----------------------------------------------------------------
    // HANDLER 2: Save Doctor & Hospital Data & Start OPD Flow
    // -----------------------------------------------------------------
    const handleBookOpdAppointment = (doctor) => {
        const opdPayload = {
            hospital: {
                _id: id,
                name: data.hospital.name,
                address: `${data.hospital.address}, ${data.hospital.city}, ${data.hospital.state}`,
                phone: data.hospital.phone,
                email: data.hospital.email,
            },
            doctor: {
                _id: doctor._id,
                name: doctor.name,
                speciality: doctor.speciality,
                qualification: doctor.qualification || "MBBS, MD",
                experienceYears: doctor.experienceYears || 5,
                consultationFee: doctor.consultationFee || 500,
                profileImage: getImageUrl(doctor.profileImage),
                averageRating: doctor.averageRating || "5.0",
                about: doctor.about,
                consultationModes: doctor.consultationStatus || { clinic: true, online: false, home: false },
                registrationNumber: doctor.registrationNumber || "REG-" + doctor._id?.slice(-6).toUpperCase()
            },
            timestamp: new Date().getTime()
        };

        // Store active booking context in sessionStorage
        sessionStorage.setItem("activeOpdBooking", JSON.stringify(opdPayload));

        // Start the OPD Flow
        router.push(`/hospital/book-opd?doctorId=${doctor._id}&hospitalId=${id}`);
    };

    // Filter doctors by search query and specialty for OPD
    const filteredDoctors = useMemo(() => {
        if (!data?.doctors) return [];
        return data.doctors.filter((doc) => {
            const matchesSearch = doc.name?.toLowerCase().includes(doctorSearch.toLowerCase()) ||
                doc.speciality?.toLowerCase().includes(doctorSearch.toLowerCase());
            const matchesSpecialty = selectedSpecialty === "All" || doc.speciality?.toLowerCase() === selectedSpecialty.toLowerCase();
            return matchesSearch && matchesSpecialty;
        });
    }, [data?.doctors, doctorSearch, selectedSpecialty]);

    // Unique specialties list
    const specialtiesList = useMemo(() => {
        if (!data?.doctors) return ["All"];
        const specs = new Set(data.doctors.map((d) => d.speciality).filter(Boolean));
        return ["All", ...Array.from(specs)];
    }, [data?.doctors]);

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 font-medium animate-pulse">Syncing Hospital Data...</p>
        </div>
    );

    if (!data) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-800">Hospital Not Found</h2>
                <button onClick={() => router.back()} className="mt-4 text-emerald-600 font-semibold underline">Go Back</button>
            </div>
        </div>
    );

    const { hospital, wards, doctors, services, recentReviews } = data;

    return (
        <div className="min-h-screen bg-slate-50/50 text-slate-900 pb-32 font-sans">

            {/* STICKY HEADER */}
            <nav className="sticky top-0 z-[100] bg-white/85 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <button
                        onClick={() => router.back()}
                        className="group flex items-center gap-2 text-slate-600 hover:text-emerald-600 transition-all font-semibold"
                    >
                        <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                        <span>Back to Search</span>
                    </button>
                    <div className="flex items-center gap-3">
                        <span className="px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-[11px] font-bold uppercase tracking-widest border border-emerald-100">
                            {hospital.profileStatus || "Verified Facility"}
                        </span>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 mt-8">

                {/* HERO SECTION */}
                <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-sm border border-slate-100 mb-8 overflow-hidden relative">
                    <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold uppercase tracking-wider mb-6">
                                <FaHospital className="text-sm" /> Institutional Profile
                            </div>

                            <div className="flex flex-wrap items-center gap-3 mb-6">
                                <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-[1.1] tracking-tight uppercase">
                                    {hospital.name}
                                </h1>
                                {hospital.rating !== undefined && (
                                    <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-600 px-3 py-1.5 rounded-xl text-sm font-black border border-amber-100 shadow-sm shrink-0">
                                        <FaStar className="text-amber-500" /> {hospital.rating || "5"}
                                        {hospital.totalReviews !== undefined && (
                                            <span className="text-xs text-slate-400 font-medium">({hospital.totalReviews})</span>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="flex items-start gap-3 text-slate-600">
                                    <FaMapMarkerAlt className="text-emerald-500 mt-1 shrink-0" />
                                    <p className="font-medium text-lg leading-relaxed">{hospital.address}, {hospital.city}, {hospital.state}</p>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    <a href={`tel:${hospital.phone}`} className="flex items-center gap-2 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-600 transition-colors px-5 py-3 rounded-2xl border border-slate-100 text-sm font-bold">
                                        <FaPhoneAlt className="text-xs" /> {hospital.phone}
                                    </a>
                                    <a href={`mailto:${hospital.email}`} className="flex items-center gap-2 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-600 transition-colors px-5 py-3 rounded-2xl border border-slate-100 text-sm font-bold">
                                        <FaRegEnvelope className="text-xs" /> {hospital.email}
                                    </a>
                                    {hospital.location && (
                                        <a
                                            href={`https://www.google.com/maps/search/?api=1&query=${hospital.location.lat},${hospital.location.lng}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors px-5 py-3 rounded-2xl border border-emerald-100 text-sm font-bold"
                                        >
                                            <FaMapMarkerAlt className="text-xs" /> Map Coordinates
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="relative group">
                            <div className="absolute -inset-4 bg-gradient-to-tr from-emerald-100 to-teal-50 rounded-[3rem] blur-2xl opacity-30"></div>
                            <div className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden border-8 border-white shadow-2xl">
                                <img
                                    src={getImageUrl(hospital.hospitalImage?.[0])}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                                    alt="Hospital Exterior"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* TAB SWITCHER: OPD vs IPD */}
                <div className="bg-white p-2 rounded-2xl border border-slate-200/80 shadow-xs mb-10 max-w-xl mx-auto flex items-center gap-2">
                    <button
                        onClick={() => setActiveTab("opd")}
                        className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl font-black text-sm tracking-wide transition-all ${
                            activeTab === "opd"
                                ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                        }`}
                    >
                        <FaClinicMedical className="text-base" />
                        <span>OPD (Outpatient)</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            activeTab === "opd" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                        }`}>
                            Consultations
                        </span>
                    </button>

                    <button
                        onClick={() => setActiveTab("ipd")}
                        className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl font-black text-sm tracking-wide transition-all ${
                            activeTab === "ipd"
                                ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                        }`}
                    >
                        <FaProcedures className="text-base" />
                        <span>IPD (Inpatient)</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            activeTab === "ipd" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                        }`}>
                            Beds & Wards
                        </span>
                    </button>
                </div>

                {/* ======================================================== */}
                {/* -------------------- OPD FLOW CONTENT ------------------- */}
                {/* ======================================================== */}
                {activeTab === "opd" && (
                    <div className="space-y-16 animate-fadeIn">
                        {/* OPD HIGHLIGHT BANNER & STATS */}
                        <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-teal-900 text-white rounded-[2.5rem] p-8 md:p-10 shadow-xl relative overflow-hidden">
                            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div>
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-bold uppercase tracking-wider text-emerald-300 mb-3">
                                        <FaClock /> OPD Operating Hours: 08:00 AM – 08:00 PM
                                    </div>
                                    <h2 className="text-3xl md:text-4xl font-black">Outpatient Doctor Consultations</h2>
                                    <p className="text-slate-300 text-sm max-w-xl mt-2 font-medium">
                                        Book priority OPD tokens, speak with top specialists in-clinic or virtually, and explore outpatient clinical services.
                                    </p>
                                </div>
                                <div className="flex gap-4 shrink-0">
                                    <div className="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-4 text-center border border-white/10">
                                        <p className="text-3xl font-black text-emerald-400">{doctors.length}</p>
                                        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-wider mt-1">Specialists On Duty</p>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-4 text-center border border-white/10">
                                        <p className="text-3xl font-black text-amber-400">{services.length}</p>
                                        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-wider mt-1">OPD Procedures</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* DOCTOR SEARCH & SPECIALTY FILTER */}
                        <section>
                            <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Available OPD Doctors</h3>
                                    <p className="text-slate-500 text-sm font-medium">Choose a specialist to book your token or in-person consultation.</p>
                                </div>

                                <div className="relative min-w-[280px] max-w-md">
                                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                                    <input
                                        type="text"
                                        placeholder="Search doctor or specialty..."
                                        value={doctorSearch}
                                        onChange={(e) => setDoctorSearch(e.target.value)}
                                        className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-11 pr-4 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                                    />
                                </div>
                            </div>

                            {/* Specialty Pill Filters */}
                            <div className="flex items-center gap-2 overflow-x-auto pb-4 custom-scrollbar mb-8">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mr-2 shrink-0">
                                    <FaFilter className="text-[10px]" /> Filter:
                                </span>
                                {specialtiesList.map((spec) => (
                                    <button
                                        key={spec}
                                        onClick={() => setSelectedSpecialty(spec)}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                                            selectedSpecialty.toLowerCase() === spec.toLowerCase()
                                                ? "bg-slate-900 text-white shadow-sm"
                                                : "bg-white border border-slate-200 text-slate-600 hover:border-emerald-400 hover:text-emerald-700"
                                        }`}
                                    >
                                        {spec}
                                    </button>
                                ))}
                            </div>

                            {/* DOCTOR LISTING GRID */}
                            {filteredDoctors.length === 0 ? (
                                <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
                                    <FaUserMd className="mx-auto text-4xl text-slate-300 mb-3" />
                                    <h4 className="text-lg font-bold text-slate-700">No doctors found</h4>
                                    <p className="text-slate-400 text-xs mt-1">Try searching for a different name or clear the specialty filter.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {filteredDoctors.map((doc) => (
                                        <div
                                            key={doc._id}
                                            className="group bg-white rounded-[2.5rem] p-7 border border-slate-200 hover:border-emerald-500 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                                        >
                                            <div className="flex flex-col sm:flex-row gap-6">
                                                <div className="relative w-28 h-36 rounded-2xl overflow-hidden shrink-0 bg-slate-50 border border-slate-100">
                                                    <img
                                                        src={getImageUrl(doc.profileImage)}
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                        alt={doc.name}
                                                    />
                                                    <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-sm">
                                                        <FaStar className="text-yellow-400 text-[10px]" />
                                                        <span className="text-[10px] font-bold text-slate-700">{doc.averageRating || '5.0'}</span>
                                                    </div>
                                                </div>

                                                <div className="flex-1 flex flex-col">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div>
                                                            <h4 className="font-black text-slate-900 text-xl leading-tight">Dr. {doc.name}</h4>
                                                            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wide mt-1">{doc.speciality}</p>
                                                        </div>
                                                        {doc.experienceYears > 0 && (
                                                            <span className="bg-slate-100 text-slate-700 text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-md shrink-0">
                                                                {doc.experienceYears} Yrs Exp
                                                            </span>
                                                        )}
                                                    </div>

                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{doc.qualification}</p>
                                                    <p className="text-slate-500 text-xs font-semibold mt-2 line-clamp-2 leading-relaxed">
                                                        {doc.about || "Senior OPD consultant dedicated to dynamic therapeutic care and comprehensive diagnostics."}
                                                    </p>

                                                    {/* Consultation Available Modes */}
                                                    <div className="mt-3 flex flex-wrap gap-1.5">
                                                        {doc.consultationStatus?.clinic !== false && (
                                                            <span className="bg-emerald-50 text-emerald-700 text-[9px] font-extrabold px-2.5 py-1 rounded-lg border border-emerald-100">
                                                                In-Clinic OPD
                                                            </span>
                                                        )}
                                                        {doc.consultationStatus?.online && (
                                                            <span className="bg-blue-50 text-blue-700 text-[9px] font-extrabold px-2.5 py-1 rounded-lg border border-blue-100">
                                                                Video Consult
                                                            </span>
                                                        )}
                                                        {doc.consultationStatus?.home && (
                                                            <span className="bg-orange-50 text-orange-700 text-[9px] font-extrabold px-2.5 py-1 rounded-lg border border-orange-100">
                                                                Home Visit
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* OPD Action Bar */}
                                            <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between gap-4">
                                                <div>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">OPD Token Fee</span>
                                                    <span className="text-lg font-black text-slate-900">₹{doc.consultationFee || 500}</span>
                                                </div>

                                                {/* TRIGGER FOR OPD FLOW */}
                                                <button
                                                    onClick={() => handleBookOpdAppointment(doc)}
                                                    className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm transition-all active:scale-95 cursor-pointer"
                                                >
                                                    <FaCalendarCheck /> Book OPD Slot
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* OPD SERVICES / DIAGNOSTIC TESTS */}
                        <section>
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">OPD Diagnostic & Clinical Services</h3>
                                    <p className="text-slate-500 text-sm font-medium">Outpatient lab tests, minor procedures, and diagnostic scans.</p>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                {services.map((service) => (
                                    <div
                                        key={service._id}
                                        className="group relative bg-white p-4 rounded-[2rem] border border-slate-100 flex items-center gap-6 hover:shadow-[0_20px_50px_rgba(16,185,129,0.1)] transition-all duration-500 hover:-translate-y-1"
                                    >
                                        <div className="relative w-28 h-28 rounded-[1.5rem] overflow-hidden shrink-0 shadow-inner bg-slate-50">
                                            <img
                                                src={getImageUrl(service.image)}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                alt={service.serviceName}
                                            />
                                        </div>

                                        <div className="flex-1 py-1">
                                            <div className="flex justify-between items-start gap-2 mb-1">
                                                <h4 className="font-black text-slate-800 group-hover:text-emerald-600 transition-colors text-sm uppercase tracking-wide">
                                                    {service.serviceName}
                                                </h4>
                                                <div className="bg-emerald-50 px-2.5 py-1 rounded-full shrink-0">
                                                    <span className="text-emerald-700 font-black text-xs">₹{service.price}</span>
                                                </div>
                                            </div>

                                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3 font-medium">
                                                {service.description}
                                            </p>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-1.5 text-emerald-600 text-[10px] font-bold uppercase tracking-wider">
                                                    <FaCheckCircle className="text-xs" /> Same-day OPD Delivery
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* OPD GUIDELINES & TOKEN INFO */}
                        <section className="bg-white rounded-[2.5rem] border border-slate-200 p-8 md:p-10">
                            <h3 className="text-xl font-black text-slate-900 mb-4 tracking-tight flex items-center gap-2">
                                <FaNotesMedical className="text-emerald-600" /> Outpatient Registration & Token Guidelines
                            </h3>
                            <div className="grid md:grid-cols-3 gap-6 text-xs text-slate-600 font-medium">
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="font-bold text-slate-800 mb-1">1. Priority Digital Token</p>
                                    <p>Online booking guarantees your slot number within your chosen shift window. Show SMS/QR at the desk.</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="font-bold text-slate-800 mb-1">2. Reporting Time</p>
                                    <p>Please arrive 15 minutes before the allotted slot to complete basic vitals checking and registration.</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="font-bold text-slate-800 mb-1">3. Emergency Cases</p>
                                    <p>Emergency outpatient care is available 24/7 in the casualty ward without any mandatory prior appointment.</p>
                                </div>
                            </div>
                        </section>
                    </div>
                )}

                {/* ======================================================== */}
                {/* -------------------- IPD FLOW CONTENT ------------------- */}
                {/* ======================================================== */}
                {activeTab === "ipd" && (
                    <div className="space-y-16 animate-fadeIn">
                        {/* INPATIENT CAPACITY DASHBOARD */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { label: "Total Beds Available", val: wards.reduce((a, b) => a + b.availableBeds, 0), icon: <FaBed />, color: "text-blue-600", bg: "bg-blue-50" },
                                { label: "Wards In Action", val: wards.length, icon: <FaHospital />, color: "text-purple-600", bg: "bg-purple-50" },
                                { label: "IPD Specialists", val: doctors.length, icon: <FaUserMd />, color: "text-emerald-600", bg: "bg-emerald-50" },
                                { label: "Inpatient Facilities", val: services.length, icon: <FaStethoscope />, color: "text-orange-600", bg: "bg-orange-50" }
                            ].map((stat, i) => (
                                <div key={i} className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${stat.bg} ${stat.color}`}>
                                        {stat.icon}
                                    </div>
                                    <div>
                                        <p className="text-3xl font-black text-slate-900 leading-none mb-1">{stat.val}</p>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* WARD SELECTION SECTION (IPD BED FLOW) */}
                        <section>
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
                                <div>
                                    <h3 className="text-3xl font-bold text-slate-900 tracking-tight">IPD Bed Availability</h3>
                                    <p className="text-slate-500 font-medium">Select an inpatient department below to view live bed charts and occupancy.</p>
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                {wards.map((ward) => (
                                    <div
                                        key={ward._id}
                                        onClick={() => handleWardClick(ward)}
                                        className="group relative bg-white p-8 rounded-[2.5rem] border border-slate-200 hover:border-emerald-500 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all cursor-pointer overflow-hidden"
                                    >
                                        <div className="flex justify-between items-start mb-8">
                                            <span className="px-4 py-1 bg-slate-900 text-white text-[10px] font-black uppercase tracking-tighter rounded-full">
                                                {ward.type}
                                            </span>
                                            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black ${ward.availableBeds > 0 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${ward.availableBeds > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
                                                {ward.availableBeds > 0 ? 'STATUS: OPEN' : 'STATUS: FULL'}
                                            </div>
                                        </div>

                                        <h4 className="text-2xl font-bold text-slate-800 mb-2 group-hover:text-emerald-600 transition-colors flex items-center justify-between">
                                            {ward.name}
                                            <FaChevronRight className="text-slate-200 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                                        </h4>

                                        <div className="flex items-end gap-2 mb-6">
                                            <span className="text-5xl font-black tracking-tighter text-slate-900">{ward.availableBeds}</span>
                                            <span className="text-sm font-bold text-slate-400 mb-2 uppercase tracking-wide">Available</span>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full transition-all duration-700 ${ward.availableBeds > (ward.totalBeds / 2) ? 'bg-emerald-500' : 'bg-orange-500'}`}
                                                    style={{ width: `${(ward.availableBeds / ward.totalBeds) * 100}%` }}
                                                ></div>
                                            </div>
                                            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                <span>Capacity</span>
                                                <span>{ward.totalBeds} Total Beds</span>
                                            </div>
                                        </div>

                                        {/* Hover Hint */}
                                        <div className="absolute bottom-0 left-0 right-0 bg-emerald-500 py-2 text-center text-white text-[10px] font-black uppercase tracking-[0.2em] translate-y-full group-hover:translate-y-0 transition-transform">
                                            View Detailed Bed Map
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* TERMS AND CONDITIONS SECTION */}
                        {hospital.termsAndConditions && (
                            <section>
                                <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 md:p-12 shadow-sm">
                                    <h3 className="text-2xl font-black text-slate-900 mb-6 tracking-tight uppercase">Inpatient Admission Policy & Hospital Rules</h3>
                                    <p className="text-slate-600 text-xs font-semibold leading-relaxed whitespace-pre-line bg-slate-50 p-6 rounded-[2rem] border border-slate-100 max-h-[300px] overflow-y-auto custom-scrollbar">
                                        {hospital.termsAndConditions}
                                    </p>
                                </div>
                            </section>
                        )}
                    </div>
                )}

                {/* --- RECENT REVIEWS SECTION (Common to both) --- */}
                {recentReviews && recentReviews.length > 0 && (
                    <section className="mt-20 border-t border-slate-100 pt-16">
                        <div className="flex items-center gap-2 mb-10">
                            <span className="bg-emerald-50 text-emerald-600 p-2.5 rounded-2xl shrink-0">
                                <FaCommentDots size={18} />
                            </span>
                            <h3 className="text-3xl font-black text-slate-900 tracking-tight">Patient Experiences</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {recentReviews.map((rev) => (
                                <div key={rev._id} className="bg-white border border-slate-200 p-6 rounded-3xl shadow-xs space-y-4">
                                    <div className="flex justify-between items-start gap-2">
                                        <div>
                                            <p className="font-extrabold text-slate-950 text-sm leading-tight">{rev.userName || "Verified Patient"}</p>
                                            <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
                                                {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : "Recent"}
                                            </span>
                                        </div>
                                        <div className="bg-amber-50 text-amber-600 px-2.5 py-1 rounded-xl text-xs font-black border border-amber-100 flex items-center gap-1">
                                            <FaStar size={10} /> {rev.rating}
                                        </div>
                                    </div>
                                    <p className="text-slate-600 text-xs font-medium leading-relaxed italic">
                                        "{rev.comment}"
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* View All Reviews Button */}
                        {hospital.totalReviews > 3 && (
                            <div className="flex justify-center mt-10">
                                <button
                                    onClick={() => router.push(`/userscreens/userallreviews?targetType=Hospital&targetId=${id}`)}
                                    className="group flex items-center gap-2 px-6 py-3.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-emerald-200 text-slate-700 hover:text-emerald-600 font-bold text-xs uppercase tracking-wider rounded-2xl shadow-xs transition-all active:scale-95"
                                >
                                    <FaCommentDots className="text-slate-400 group-hover:text-emerald-500 transition-colors" />
                                    <span>View All Reviews ({hospital.totalReviews})</span>
                                </button>
                            </div>
                        )}
                    </section>
                )}
            </main>
        </div>
    );
}