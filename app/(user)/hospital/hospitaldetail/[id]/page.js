"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    FaArrowLeft, FaMapMarkerAlt, FaHospital, FaBed,
    FaUserMd, FaStar, FaPhoneAlt,
    FaRegEnvelope, FaStethoscope, FaChevronRight, FaCommentDots,
    FaCalendarCheck, FaClock, FaSearch, FaFilter,
    FaClinicMedical, FaProcedures, FaNotesMedical, FaCheckCircle,
    FaShieldAlt, FaTimesCircle, FaHandPointer, FaCheck, FaSyncAlt,
    FaFilePrescription, FaHeartbeat, FaFileInvoiceDollar
} from "react-icons/fa";
import UserAPI from "@/app/services/UserAPI";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function HospitalDetailPage() {
    const { id } = useParams(); // Hospital ID from URL
    const router = useRouter();
    
    const [data, setData] = useState(null);
    const [wards, setWards] = useState([]); // Wards from /user/hospital/wards
    const [loading, setLoading] = useState(true);
    const [isRefreshingWards, setIsRefreshingWards] = useState(false);

    // Active Tab: 'opd' | 'ipd'
    const [activeTab, setActiveTab] = useState("opd");

    // OPD Search & Filter States
    const [doctorSearch, setDoctorSearch] = useState("");
    const [selectedSpecialty, setSelectedSpecialty] = useState("All");

    // Fetch hospital details and dedicated wards in parallel
    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setLoading(true);
                const [hospitalRes, wardsRes] = await Promise.all([
                    UserAPI.getHospitalDetail(id),
                    UserAPI.getHospitalWards(id)
                ]);

                if (hospitalRes?.success) {
                    setData(hospitalRes.data);
                }

                // Populate wards from dedicated endpoint (fallback to hospital detail wards if needed)
                if (wardsRes?.success && Array.isArray(wardsRes.data)) {
                    setWards(wardsRes.data);
                } else if (hospitalRes?.data?.wards) {
                    setWards(hospitalRes.data.wards);
                }
            } catch (error) {
                console.error("Error fetching hospital/ward details:", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchAllData();
    }, [id]);

    // Live refresh for wards & bed availability only
    const refreshWards = async () => {
        try {
            setIsRefreshingWards(true);
            const res = await UserAPI.getHospitalWards(id);
            if (res?.success && Array.isArray(res.data)) {
                setWards(res.data);
            }
        } catch (error) {
            console.error("Failed to refresh wards:", error);
        } finally {
            setIsRefreshingWards(false);
        }
    };

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
            hospitalName: data?.hospital?.name,
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
                isInsuranceAccepted: !!data.hospital.isInsuranceAccepted,
                acceptedInsurances: data.hospital.acceptedInsurances || []
            },
            doctor: {
                _id: doctor._id,
                name: doctor.name,
                speciality: doctor.speciality,
                qualification: doctor.qualification || "MBBS, MD",
                experienceYears: doctor.experienceYears || 5,
                consultationFee: doctor.opdFee || doctor.consultationFee || 500,
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
            <div className="w-12 h-12 border-4 border-[#08B36A] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 font-medium animate-pulse">Syncing Hospital & Ward Data...</p>
        </div>
    );

    if (!data) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-800">Hospital Not Found</h2>
                <button onClick={() => router.back()} className="mt-4 text-[#08B36A] font-semibold underline">Go Back</button>
            </div>
        </div>
    );

    const { hospital, doctors = [], specialServices = [], services = specialServices, recentReviews = [] } = data;

    // Calculate live total available beds across all active wards
    const totalAvailableBedsCount = wards.reduce((acc, curr) => acc + (Number(curr.availableBeds) || 0), 0);
    const totalBedsCapacity = wards.reduce((acc, curr) => acc + (Number(curr.totalBeds) || 0), 0);

    return (
        <div className="min-h-screen bg-slate-50/50 text-slate-900 pb-32 font-sans antialiased">

            {/* STICKY HEADER */}
            <nav className="sticky top-0 z-[100] bg-white/90 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <button
                        onClick={() => router.back()}
                        className="group flex items-center gap-2 text-slate-600 hover:text-[#08B36A] transition-all font-semibold"
                    >
                        <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                        <span>Back to Search</span>
                    </button>
                    <div className="flex items-center gap-2.5">
                        {hospital.isInsuranceAccepted ? (
                            <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-[#08B36A] rounded-full text-[11px] font-bold tracking-wide border border-[#08B36A]/20">
                                <FaShieldAlt className="text-[#08B36A] text-xs" /> Insurance Accepted
                            </span>
                        ) : (
                            <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[11px] font-bold tracking-wide border border-slate-200">
                                <FaTimesCircle className="text-slate-400 text-xs" /> No Insurance
                            </span>
                        )}

                        <span className="px-4 py-1.5 bg-[#08B36A]/10 text-[#08B36A] rounded-full text-[11px] font-bold uppercase tracking-widest border border-[#08B36A]/20">
                            {hospital.profileStatus || hospital.type || "Verified Facility"}
                        </span>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 mt-8">

                {/* HERO SECTION */}
                <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-xs border border-slate-100 mb-8 overflow-hidden relative">
                    <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
                        <div>
                            <div className="flex flex-wrap items-center gap-2 mb-4">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#08B36A]/10 text-[#08B36A] rounded-lg text-xs font-bold uppercase tracking-wider">
                                    <FaHospital className="text-sm" /> Institutional Profile
                                </div>

                                {hospital.isInsuranceAccepted ? (
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 text-teal-700 rounded-lg text-xs font-bold uppercase tracking-wider border border-teal-200/60">
                                        <FaShieldAlt className="text-teal-600" /> Cashless / Insurance Accepted
                                    </div>
                                ) : (
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold uppercase tracking-wider border border-slate-200">
                                        <FaTimesCircle className="text-slate-400" /> Self-Pay Only
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center gap-3 mb-6">
                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.1] tracking-tight uppercase">
                                    {hospital.name}
                                </h1>
                                {hospital.rating !== undefined && (
                                    <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-600 px-3 py-1.5 rounded-xl text-sm font-black border border-amber-100 shadow-xs shrink-0">
                                        <FaStar className="text-amber-500" /> {hospital.rating || "5.0"}
                                        {hospital.totalReviews !== undefined && (
                                            <span className="text-xs text-slate-400 font-medium">({hospital.totalReviews})</span>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4 mb-6">
                                <div className="flex items-start gap-3 text-slate-600">
                                    <FaMapMarkerAlt className="text-[#08B36A] mt-1 shrink-0" />
                                    <p className="font-medium text-lg leading-relaxed">{hospital.address}, {hospital.city}, {hospital.state}</p>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {hospital.phone && (
                                        <a href={`tel:${hospital.phone}`} className="flex items-center gap-2 bg-slate-50 hover:bg-[#08B36A]/10 hover:text-[#08B36A] transition-colors px-5 py-3 rounded-2xl border border-slate-100 text-sm font-bold">
                                            <FaPhoneAlt className="text-xs" /> {hospital.phone}
                                        </a>
                                    )}
                                    {hospital.email && (
                                        <a href={`mailto:${hospital.email}`} className="flex items-center gap-2 bg-slate-50 hover:bg-[#08B36A]/10 hover:text-[#08B36A] transition-colors px-5 py-3 rounded-2xl border border-slate-100 text-sm font-bold">
                                            <FaRegEnvelope className="text-xs" /> {hospital.email}
                                        </a>
                                    )}
                                    {hospital.location && (
                                        <a
                                            href={`https://www.google.com/maps/search/?api=1&query=${hospital.location.lat},${hospital.location.lng}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 bg-[#08B36A]/10 hover:bg-[#08B36A]/20 text-[#08B36A] transition-colors px-5 py-3 rounded-2xl border border-[#08B36A]/20 text-sm font-bold"
                                        >
                                            <FaMapMarkerAlt className="text-xs" /> Map Coordinates
                                        </a>
                                    )}
                                </div>
                            </div>

                            {/* ACCEPTED INSURANCES LIST */}
                            {hospital.isInsuranceAccepted && hospital.acceptedInsurances?.length > 0 && (
                                <div className="pt-4 border-t border-slate-100">
                                    <div className="flex items-center gap-2 mb-2.5">
                                        <FaShieldAlt className="text-teal-600 text-xs" />
                                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                                            Accepted Insurance Panels & TPAs
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {hospital.acceptedInsurances.map((ins, idx) => (
                                            <span
                                                key={idx}
                                                className="px-3 py-1 bg-slate-50 hover:bg-teal-50 hover:border-teal-200 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-colors"
                                            >
                                                {ins}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="relative group">
                            <div className="absolute -inset-4 bg-gradient-to-tr from-[#08B36A]/20 to-teal-50 rounded-[3rem] blur-2xl opacity-40"></div>
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

                {/* PROMPT BANNER: CARE TYPE */}
                <div className="max-w-2xl mx-auto mb-6 text-center space-y-3">
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#08B36A]/10 text-[#08B36A] text-[10px] font-black uppercase tracking-widest border border-[#08B36A]/20">
                        <FaHandPointer /> Select Care Type
                    </span>
                    <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
                        Which Service Are You Looking For?
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">
                        Choose <strong className="text-slate-800">OPD</strong> for doctor consultations or <strong className="text-slate-800">IPD</strong> for hospital admissions and ward bed bookings.
                    </p>
                </div>

                {/* TAB SWITCHER: OPD vs IPD */}
                <div className="bg-white p-2 rounded-2xl border border-slate-200/80 shadow-xs mb-10 max-w-xl mx-auto flex items-center gap-2">
                    <button
                        onClick={() => setActiveTab("opd")}
                        className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl font-black text-sm tracking-wide transition-all cursor-pointer ${
                            activeTab === "opd"
                                ? "bg-[#08B36A] text-white shadow-md shadow-[#08B36A]/25"
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
                        className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl font-black text-sm tracking-wide transition-all cursor-pointer ${
                            activeTab === "ipd"
                                ? "bg-[#08B36A] text-white shadow-md shadow-[#08B36A]/25"
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
                        {/* OPD HIGHLIGHT BANNER */}
                        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white rounded-[2.5rem] p-8 md:p-10 shadow-xl relative overflow-hidden">
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
                                        <p className="text-3xl font-black text-[#08B36A]">{doctors.length}</p>
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
                                        className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-11 pr-4 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:border-[#08B36A] focus:ring-2 focus:ring-[#08B36A]/20"
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
                                        className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                                            selectedSpecialty.toLowerCase() === spec.toLowerCase()
                                                ? "bg-slate-900 text-white shadow-xs"
                                                : "bg-white border border-slate-200 text-slate-600 hover:border-[#08B36A] hover:text-[#08B36A]"
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
                                            className="group bg-white rounded-[2.5rem] p-7 border border-slate-200 hover:border-[#08B36A] hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                                        >
                                            <div className="flex flex-col sm:flex-row gap-6">
                                                <div className="relative w-28 h-36 rounded-2xl overflow-hidden shrink-0 bg-slate-50 border border-slate-100">
                                                    <img
                                                        src={getImageUrl(doc.profileImage)}
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                        alt={doc.name}
                                                    />
                                                    <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-xs">
                                                        <FaStar className="text-yellow-400 text-[10px]" />
                                                        <span className="text-[10px] font-bold text-slate-700">{doc.averageRating || '5.0'}</span>
                                                    </div>
                                                </div>

                                                <div className="flex-1 flex flex-col">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div>
                                                            <h4 className="font-black text-slate-900 text-xl leading-tight">Dr. {doc.name}</h4>
                                                            <p className="text-xs font-bold text-[#08B36A] uppercase tracking-wide mt-1">{doc.speciality}</p>
                                                        </div>
                                                        {doc.experienceYears > 0 && (
                                                            <span className="bg-slate-100 text-slate-700 text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-md shrink-0">
                                                                {doc.experienceYears} Yrs Exp
                                                            </span>
                                                        )}
                                                    </div>

                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">
                                                        {doc.qualification} {doc.roomNumber ? `• ${doc.roomNumber}` : ""}
                                                    </p>
                                                    <p className="text-slate-500 text-xs font-semibold mt-2 line-clamp-2 leading-relaxed">
                                                        {doc.about || "Senior OPD consultant dedicated to dynamic therapeutic care and comprehensive diagnostics."}
                                                    </p>

                                                    <div className="mt-3 flex flex-wrap gap-1.5">
                                                        {doc.consultationStatus?.clinic !== false && (
                                                            <span className="bg-emerald-50 text-[#08B36A] text-[9px] font-extrabold px-2.5 py-1 rounded-lg border border-[#08B36A]/20">
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
                                                    <span className="text-lg font-black text-slate-900">₹{doc.opdFee || doc.consultationFee || 500}</span>
                                                </div>

                                                <button
                                                    onClick={() => handleBookOpdAppointment(doc)}
                                                    className="inline-flex items-center gap-2 bg-[#08B36A] hover:bg-[#069959] text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-md shadow-[#08B36A]/20 transition-all active:scale-95 cursor-pointer"
                                                >
                                                    <FaCalendarCheck /> Book OPD Slot
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* ======================================================== */}
                        {/* 🏥 COMPREHENSIVE SERVICE ECOSYSTEM: OPD & IPD SHOWCASE   */}
                        {/* ======================================================== */}
                        <section>
                            <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-8 md:p-12 text-white shadow-2xl border border-emerald-900/40">
                                {/* Ambient Background Glow */}
                                <div className="absolute -right-24 -top-24 w-96 h-96 bg-[#08B36A]/20 rounded-full blur-3xl pointer-events-none" />
                                <div className="absolute -left-24 -bottom-24 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

                                <div className="relative z-10 space-y-8">
                                    {/* Showcase Header */}
                                    <div className="max-w-3xl space-y-3">
                                        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#08B36A]/20 text-[#08B36A] text-[11px] font-black uppercase tracking-wider border border-[#08B36A]/30">
                                            <FaClinicMedical className="text-xs" /> Complete Care Spectrum
                                        </div>
                                        <h3 className="text-2xl md:text-4xl font-black tracking-tight leading-tight">
                                            Unified OPD &amp; IPD Hospital Services
                                        </h3>
                                        <p className="text-slate-300 text-xs md:text-sm font-medium leading-relaxed">
                                            Experience a seamless healthcare continuum. From priority specialist consultations in outpatient cabins to emergency and planned inpatient admissions, our hospital network offers transparent pricing, digital records, and 24/7 clinical oversight.
                                        </p>
                                    </div>

                                    {/* 2-Column Comparison Showcase: OPD vs IPD */}
                                    <div className="grid md:grid-cols-2 gap-6">
                                        
                                        {/* OPD Service Highlights */}
                                        <div className="p-6 md:p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md space-y-4 hover:border-[#08B36A]/50 transition-all group flex flex-col justify-between">
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="w-12 h-12 rounded-2xl bg-[#08B36A]/20 text-[#08B36A] flex items-center justify-center text-xl shadow-inner group-hover:scale-105 transition-transform">
                                                        <FaClinicMedical />
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#08B36A] bg-[#08B36A]/10 px-3 py-1 rounded-full border border-[#08B36A]/20">
                                                        Outpatient Care
                                                    </span>
                                                </div>

                                                <div>
                                                    <h4 className="text-lg font-black text-white">OPD Consultations &amp; Diagnostics</h4>
                                                    <p className="text-slate-300 text-xs font-medium mt-1 leading-relaxed">
                                                        Direct token appointments with certified senior consultants across specialties. Eliminate waiting queues with digital slot calls and mobile prescriptions.
                                                    </p>
                                                </div>

                                                <ul className="space-y-2.5 text-xs text-slate-300 font-semibold pt-2 border-t border-white/10">
                                                    <li className="flex items-center gap-2.5">
                                                        <FaCheckCircle className="text-[#08B36A] shrink-0 text-sm" />
                                                        <span>Priority digital tokens &amp; real-time cabin call monitoring</span>
                                                    </li>
                                                    <li className="flex items-center gap-2.5">
                                                        <FaCheckCircle className="text-[#08B36A] shrink-0 text-sm" />
                                                        <span>Paperless digital prescriptions dispatched to your app</span>
                                                    </li>
                                                    <li className="flex items-center gap-2.5">
                                                        <FaCheckCircle className="text-[#08B36A] shrink-0 text-sm" />
                                                        <span>Walk-in day care, rapid pathology &amp; outpatient diagnostics</span>
                                                    </li>
                                                </ul>
                                            </div>

                                            <div className="pt-2 text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                                                <FaClock className="text-[#08B36A]" /> Operates Daily: 08:00 AM – 08:00 PM
                                            </div>
                                        </div>

                                        {/* IPD Service Highlights */}
                                        <div className="p-6 md:p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md space-y-4 hover:border-[#08B36A]/50 transition-all group flex flex-col justify-between">
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="w-12 h-12 rounded-2xl bg-[#08B36A]/20 text-[#08B36A] flex items-center justify-center text-xl shadow-inner group-hover:scale-105 transition-transform">
                                                        <FaProcedures />
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300 bg-white/10 px-3 py-1 rounded-full border border-white/15">
                                                        Inpatient Admission
                                                    </span>
                                                </div>

                                                <div>
                                                    <h4 className="text-lg font-black text-white">IPD Wards, ICUs &amp; Critical Care</h4>
                                                    <p className="text-slate-300 text-xs font-medium mt-1 leading-relaxed">
                                                        Real-time ward occupancy charts with live bed reservation. Seamlessly shift from doctor cabin to hospital ward with automatic 30-minute bed hold protection.
                                                    </p>
                                                </div>

                                                <ul className="space-y-2.5 text-xs text-slate-300 font-semibold pt-2 border-t border-white/10">
                                                    <li className="flex items-center gap-2.5">
                                                        <FaCheckCircle className="text-[#08B36A] shrink-0 text-sm" />
                                                        <span>Interactive bed inventory (General, Semi-Private, Private &amp; ICU)</span>
                                                    </li>
                                                    <li className="flex items-center gap-2.5">
                                                        <FaCheckCircle className="text-[#08B36A] shrink-0 text-sm" />
                                                        <span>Instant 30-minute bed hold directly during doctor consultation</span>
                                                    </li>
                                                    <li className="flex items-center gap-2.5">
                                                        <FaCheckCircle className="text-[#08B36A] shrink-0 text-sm" />
                                                        <span>Full cashless TPA medical insurance &amp; reimbursement support</span>
                                                    </li>
                                                </ul>
                                            </div>

                                            {/* Interactive Action: Switch to IPD Tab */}
                                            <div className="pt-2">
                                                <button
                                                    onClick={() => setActiveTab("ipd")}
                                                    className="w-full py-3.5 px-5 rounded-2xl bg-[#08B36A] hover:bg-[#069959] text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#08B36A]/25 transition-all active:scale-95 cursor-pointer"
                                                >
                                                    <span>Explore IPD Wards &amp; Live Bed Chart</span>
                                                    <FaChevronRight size={11} />
                                                </button>
                                            </div>
                                        </div>

                                    </div>
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
                        {/* INPATIENT CAPACITY DASHBOARD (Live from /user/hospital/wards) */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { 
                                    label: "Total Beds Available", 
                                    val: totalAvailableBedsCount, 
                                    sub: `out of ${totalBedsCapacity} capacity`,
                                    icon: <FaBed />, 
                                    color: "text-blue-600", 
                                    bg: "bg-blue-50" 
                                },
                                { 
                                    label: "Active Wards", 
                                    val: wards.length, 
                                    sub: "operational units",
                                    icon: <FaHospital />, 
                                    color: "text-purple-600", 
                                    bg: "bg-purple-50" 
                                },
                                { 
                                    label: "IPD Specialists", 
                                    val: doctors.length, 
                                    sub: "attending doctors",
                                    icon: <FaUserMd />, 
                                    color: "text-[#08B36A]", 
                                    bg: "bg-[#08B36A]/10" 
                                },
                                { 
                                    label: "Inpatient Facilities", 
                                    val: services.length, 
                                    sub: "support services",
                                    icon: <FaStethoscope />, 
                                    color: "text-orange-600", 
                                    bg: "bg-orange-50" 
                                }
                            ].map((stat, i) => (
                                <div key={i} className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-xs flex flex-col justify-between gap-4">
                                    <div className="flex justify-between items-start">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${stat.bg} ${stat.color}`}>
                                            {stat.icon}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-3xl font-black text-slate-900 leading-none mb-1">{stat.val}</p>
                                        <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">{stat.label}</p>
                                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">{stat.sub}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* WARD SELECTION SECTION (Real-Time from /user/hospital/wards API) */}
                        <section>
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-3xl font-bold text-slate-900 tracking-tight">Live Inpatient Ward &amp; Bed Chart</h3>
                                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#08B36A]/10 text-[#08B36A] border border-[#08B36A]/20">
                                            {wards.length} Wards Listed
                                        </span>
                                    </div>
                                    <p className="text-slate-500 font-medium text-sm">
                                        Live inventory from hospital wards. Select a ward below to choose your bed and proceed with admission.
                                    </p>
                                </div>

                                <button
                                    onClick={refreshWards}
                                    disabled={isRefreshingWards}
                                    className="self-start md:self-auto inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-2xs transition-all active:scale-95 cursor-pointer"
                                >
                                    <FaSyncAlt className={isRefreshingWards ? "animate-spin text-[#08B36A]" : "text-slate-400"} />
                                    <span>Refresh Live Beds</span>
                                </button>
                            </div>

                            {wards.length === 0 ? (
                                <div className="bg-white rounded-[2.5rem] p-12 text-center border border-slate-200">
                                    <FaBed className="mx-auto text-4xl text-slate-300 mb-3" />
                                    <h4 className="text-lg font-bold text-slate-700">No Wards Listed Currently</h4>
                                    <p className="text-slate-400 text-xs mt-1">This facility has not configured inpatient wards yet or beds are under maintenance.</p>
                                </div>
                            ) : (
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {wards.map((ward) => {
                                        const isAvailable = ward.hasAvailability ?? (ward.availableBeds > 0);
                                        const capacityRatio = ward.totalBeds > 0 ? (ward.availableBeds / ward.totalBeds) * 100 : 0;

                                        return (
                                            <div
                                                key={ward._id}
                                                onClick={() => handleWardClick(ward)}
                                                className="group relative bg-white p-8 rounded-[2.5rem] border border-slate-200 hover:border-[#08B36A] hover:shadow-2xl hover:shadow-[#08B36A]/10 transition-all cursor-pointer overflow-hidden flex flex-col justify-between"
                                            >
                                                <div>
                                                    <div className="flex justify-between items-start mb-6">
                                                        <span className="px-3.5 py-1 bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider rounded-full">
                                                            {ward.type || "Ward"}
                                                        </span>
                                                        
                                                        {/* Status Pill */}
                                                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black ${
                                                            isAvailable 
                                                                ? 'bg-emerald-50 text-[#08B36A] border border-[#08B36A]/20' 
                                                                : 'bg-red-50 text-red-600 border border-red-100'
                                                        }`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-[#08B36A] animate-pulse' : 'bg-red-500'}`}></span>
                                                            {isAvailable ? 'STATUS: OPEN' : 'STATUS: FULL'}
                                                        </div>
                                                    </div>

                                                    <h4 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-[#08B36A] transition-colors flex items-center justify-between">
                                                        <span>{ward.name}</span>
                                                        <FaChevronRight className="text-slate-300 group-hover:text-[#08B36A] group-hover:translate-x-1 transition-all text-sm shrink-0 ml-2" />
                                                    </h4>

                                                    <div className="flex items-end gap-2 mb-6">
                                                        <span className="text-5xl font-black tracking-tight text-slate-900">{ward.availableBeds}</span>
                                                        <span className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Beds Free</span>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    {/* Visual Occupancy Bar */}
                                                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full transition-all duration-700 ${
                                                                capacityRatio > 50 
                                                                    ? 'bg-[#08B36A]' 
                                                                    : capacityRatio > 0 
                                                                    ? 'bg-amber-500' 
                                                                    : 'bg-red-500'
                                                            }`}
                                                            style={{ width: `${Math.min(100, Math.max(0, capacityRatio))}%` }}
                                                        ></div>
                                                    </div>
                                                    
                                                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                        <span>Live Capacity</span>
                                                        <span>{ward.totalBeds} Total Beds</span>
                                                    </div>
                                                </div>

                                                {/* Hover Action Strip */}
                                                <div className="absolute bottom-0 left-0 right-0 bg-[#08B36A] py-2.5 text-center text-white text-[10px] font-black uppercase tracking-[0.2em] translate-y-full group-hover:translate-y-0 transition-transform shadow-md">
                                                    Select Ward &amp; View Bed Map &rarr;
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </section>

                        {/* TERMS AND CONDITIONS */}
                        {hospital.termsAndConditions && (
                            <section>
                                <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 md:p-12 shadow-xs">
                                    <h3 className="text-xl font-black text-slate-900 mb-4 tracking-tight uppercase">Inpatient Admission Policy &amp; Hospital Rules</h3>
                                    <p className="text-slate-600 text-xs font-semibold leading-relaxed whitespace-pre-line bg-slate-50 p-6 rounded-[2rem] border border-slate-100 max-h-[300px] overflow-y-auto custom-scrollbar">
                                        {hospital.termsAndConditions}
                                    </p>
                                </div>
                            </section>
                        )}
                    </div>
                )}

                {/* --- RECENT REVIEWS SECTION --- */}
                {recentReviews && recentReviews.length > 0 && (
                    <section className="mt-20 border-t border-slate-100 pt-16">
                        <div className="flex items-center gap-2 mb-10">
                            <span className="bg-[#08B36A]/10 text-[#08B36A] p-2.5 rounded-2xl shrink-0">
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

                        {hospital.totalReviews > 3 && (
                            <div className="flex justify-center mt-10">
                                <button
                                    onClick={() => router.push(`/userscreens/userallreviews?targetType=Hospital&targetId=${id}`)}
                                    className="group flex items-center gap-2 px-6 py-3.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-[#08B36A] text-slate-700 hover:text-[#08B36A] font-bold text-xs uppercase tracking-wider rounded-2xl shadow-xs transition-all active:scale-95 cursor-pointer"
                                >
                                    <FaCommentDots className="text-slate-400 group-hover:text-[#08B36A] transition-colors" />
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