"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    FaArrowLeft, FaStar, FaMapMarkerAlt, FaHome,
    FaBolt, FaPhone, FaEnvelope, FaShieldAlt,
    FaMicroscope, FaCalendarCheck, FaSearch, FaCheckCircle,
    FaHospital, FaClock
} from "react-icons/fa";
import UserAPI from "@/app/services/UserAPI";
import PackagesList from "../../seealltests/components/PackagesList";
import SingleTestsList from "../../seealltests/components/SingleTestsList";

// Environment variable for backend URL (e.g., http://localhost:5000)
const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function LabDetailsPage() {
    const { id } = useParams();
    const router = useRouter();

    const [lab, setLab] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("packages");
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchLabData = async () => {
            try {
                setLoading(true);
                const response = await UserAPI.getLabDetails(id);
                if (response.success) {
                    setLab(response.data);
                }
            } catch (error) {
                console.error("Error fetching lab details:", error);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchLabData();
    }, [id]);

    if (loading) return <LoadingSkeleton />;

    if (!lab) return (
        <div className="h-screen flex flex-col items-center justify-center text-slate-500 font-medium bg-[#F8FAFC]">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <FaHospital className="text-slate-300 text-3xl" />
            </div>
            <p className="text-lg font-bold text-slate-800">Laboratory not found</p>
            <button onClick={() => router.back()} className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-100">Go Back</button>
        </div>
    );

    // Image Source Logic for Multer
    const getLabImage = () => {
        if (!lab.profileImage) return null;
        return lab.profileImage.startsWith('http')
            ? `${IMAGE_BASE_URL}/${lab.profileImage}`
            : `${IMAGE_BASE_URL}/${lab.profileImage}`;
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans">
            {/* --- TOP UTILITY BAR --- */}
            <nav className="sticky top-0 z-[100] bg-white/80 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
                    <button
                        onClick={() => router.back()}
                        className="group flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-emerald-600 transition-all"
                    >
                        <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                        <span>Back</span>
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-1.5 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                            <FaCheckCircle className="text-emerald-500 text-[10px]" />
                            <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wider">Verified Partner</span>
                        </div>
                    </div>
                </div>
            </nav>

            {/* --- HEADER SECTION --- */}
            <div className="bg-white border-b border-slate-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-20 opacity-[0.03] pointer-events-none">
                    <FaHospital size={300} />
                </div>

                <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-16 relative z-10">
                    <div className="flex flex-col md:flex-row gap-10 items-center md:items-start text-center md:text-left">
                        {/* Profile Image with Fallback */}
                        <div className="w-32 h-32 md:w-44 md:h-44 rounded-[2.5rem] bg-slate-50 flex items-center justify-center overflow-hidden shrink-0 shadow-2xl shadow-slate-200 border-4 border-white ring-1 ring-slate-100">
                            {lab.profileImage ? (
                                <img
                                    src={getLabImage()}
                                    alt={lab.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(lab.name)}&background=f1f5f9&color=10b981&bold=true&size=256`;
                                    }}
                                />
                            ) : (
                                <div className="flex flex-col items-center gap-2">
                                    <FaHospital className="text-4xl text-slate-200" />
                                    <span className="text-[9px] font-black text-slate-300 uppercase">No Image</span>
                                </div>
                            )}
                        </div>

                        <div className="flex-1">
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                                <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-none uppercase">
                                    {lab.name}
                                </h1>
                                <div className="flex items-center gap-1.5 bg-amber-50 text-amber-600 px-3 py-1.5 rounded-xl text-sm font-black border border-amber-100 shadow-sm">
                                    <FaStar /> {lab.rating || "4.8"}
                                </div>
                            </div>

                            <p className="text-slate-500 text-base max-w-2xl mb-8 font-medium leading-relaxed">
                                {lab.description || `Leading diagnostic facility in ${lab.city}, providing world-class laboratory services with high precision and digital report delivery.`}
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-5 gap-x-12">
                                <InfoItem icon={<FaMapMarkerAlt />} label="Location" value={`${lab.address || lab.city}, ${lab.state}`} />
                                <InfoItem icon={<FaPhone />} label="Helpdesk" value={lab.phone || "Verified Contact"} />
                                <InfoItem icon={<FaShieldAlt />} label="Certification" value="NABL & ISO Accredited" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- FEATURES GRID --- */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <FeatureCard
                        icon={<FaHome />}
                        title="Home Visit"
                        desc={lab.isHomeCollectionAvailable ? "Doorstep Service" : "In-Center Only"}
                        active={lab.isHomeCollectionAvailable}
                    />
                    <FeatureCard
                        icon={<FaBolt />}
                        title="Quick Reports"
                        desc={lab.isRapidServiceAvailable ? "6-12 Hours" : "Standard Cycle"}
                        active={lab.isRapidServiceAvailable}
                    />
                    <FeatureCard
                        icon={<FaClock />}
                        title="Timing"
                        desc={lab.timingLabel || "09:00 AM - 08:00 PM"}
                        active={true}
                    />
                    <FeatureCard
                        icon={<FaCalendarCheck />}
                        title="Availability"
                        desc="Instant Booking"
                        active={true}
                    />
                </div>
            </div>

            {/* --- CATALOG SECTION --- */}
            <main className="max-w-7xl mx-auto px-4 md:px-8 pb-32">
                <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm min-h-[600px]">
                    {/* Catalog Navigation */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 px-8 pt-6 gap-6">
                        <div className="flex gap-8">
                            <TabTrigger active={activeTab === "packages"} onClick={() => setActiveTab("packages")} label="Packages" />
                            <TabTrigger active={activeTab === "tests"} onClick={() => setActiveTab("tests")} label="Tests" />
                        </div>

                        <div className="mb-6 relative w-full md:w-[350px]">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder={`Search for ${activeTab}...`}
                                className="w-full pl-11 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none"
                            />
                        </div>
                    </div>

                    <div className="p-8">
                        {activeTab === "packages" ? (
                            <PackagesList selectedLabId={id} searchTerm={searchTerm} />
                        ) : (
                            <SingleTestsList selectedLabId={id} searchTerm={searchTerm} />
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

// --- SUB-COMPONENTS ---
const InfoItem = ({ icon, label, value }) => (
    <div className="flex items-start gap-3 group">
        <span className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
            {icon}
        </span>
        <div className="min-w-0">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
            <p className="text-slate-800 font-bold text-sm truncate">{value}</p>
        </div>
    </div>
);

const FeatureCard = ({ icon, title, desc, active }) => (
    <div className={`p-6 rounded-3xl border transition-all duration-300 ${active ? "bg-white border-slate-200 hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-500/5" : "bg-slate-50/50 border-transparent grayscale opacity-50"}`}>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl mb-4 ${active ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-400"}`}>
            {icon}
        </div>
        <p className="text-xs font-black text-slate-900 uppercase tracking-tight mb-1">{title}</p>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{desc}</p>
    </div>
);

const TabTrigger = ({ active, onClick, label }) => (
    <button
        onClick={onClick}
        className={`pb-4 text-[11px] font-black uppercase tracking-[0.2em] transition-all relative ${active ? "text-emerald-600" : "text-slate-400 hover:text-slate-700"}`}
    >
        {label}
        {active && (
            <div className="absolute bottom-0 left-0 w-full h-1 bg-emerald-600 rounded-t-full" />
        )}
    </button>
);

// --- LOADING SKELETON ---
const LoadingSkeleton = () => (
    <div className="min-h-screen bg-[#F8FAFC] animate-pulse">
        <div className="h-16 bg-white border-b border-slate-200" />
        <div className="bg-white border-b border-slate-200 py-16">
            <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row gap-10">
                <div className="w-44 h-44 rounded-[2.5rem] bg-slate-100" />
                <div className="flex-1 space-y-6">
                    <div className="h-12 w-2/3 bg-slate-200 rounded-2xl" />
                    <div className="h-6 w-1/2 bg-slate-100 rounded-lg" />
                    <div className="grid grid-cols-3 gap-8">
                        <div className="h-10 bg-slate-50 rounded-lg" />
                        <div className="h-10 bg-slate-50 rounded-lg" />
                        <div className="h-10 bg-slate-50 rounded-lg" />
                    </div>
                </div>
            </div>
        </div>
        <div className="max-w-7xl mx-auto px-8 py-10">
            <div className="grid grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-white rounded-3xl border border-slate-100" />)}
            </div>
        </div>
    </div>
);