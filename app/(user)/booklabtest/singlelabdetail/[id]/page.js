"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    FaArrowLeft, FaStar, FaMapMarkerAlt, FaHome,
    FaBolt, FaPhone, FaEnvelope, FaShieldAlt,
    FaMicroscope, FaCalendarCheck, FaSearch, FaCheckCircle
} from "react-icons/fa";
import UserAPI from "@/app/services/UserAPI";
import PackagesList from "../../seealltests/components/PackagesList";
import SingleTestsList from "../../seealltests/components/SingleTestsList";

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
                    setLab(response.lab);
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
    if (!lab) return <div className="h-screen flex items-center justify-center text-slate-500 font-medium">Laboratory data could not be retrieved.</div>;

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            {/* --- 1. TOP UTILITY BAR --- */}
            <nav className="sticky top-0 z-[100] bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
                    >
                        <FaArrowLeft size={14} />
                        <span>Back to Search</span>
                    </button>
                    <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
                        <span className="hidden sm:inline">Laboratory ID: {lab._id.slice(-8).toUpperCase()}</span>
                        <div className="h-4 w-px bg-slate-200"></div>
                        <span className="flex items-center gap-1 text-emerald-600">
                            <FaCheckCircle /> Verified Partner
                        </span>
                    </div>
                </div>
            </nav>

            {/* --- 2. HEADER SECTION --- */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                            {lab.profileImage ? (
                                <img src={lab.profileImage} alt={lab.name} className="w-full h-full object-cover" />
                            ) : (
                                <FaMicroscope className="text-4xl text-slate-300" />
                            )}
                        </div>

                        <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-3 mb-2">
                                <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{lab.name}</h1>
                                <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-sm font-bold border border-amber-100">
                                    <FaStar className="text-amber-400" /> {lab.rating || "4.5"}
                                </div>
                            </div>
                            <p className="text-slate-500 text-sm max-w-2xl mb-6">
                                Accredited diagnostic center providing high-precision pathology and radiology services.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-8 text-sm">
                                <InfoItem icon={<FaMapMarkerAlt />} label="Location" value={`${lab.city}, ${lab.state}`} />
                                <InfoItem icon={<FaPhone />} label="Contact" value={lab.phone} />
                                <InfoItem icon={<FaEnvelope />} label="Email Address" value={lab.email} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- 3. CORE FEATURES GRID --- */}
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <FeatureCard icon={<FaHome />} title="Home Collection" desc={lab.isHomeCollectionAvailable ? "Available" : "Center Visit"} active={lab.isHomeCollectionAvailable} />
                    <FeatureCard icon={<FaBolt />} title="Report Timing" desc={lab.isRapidServiceAvailable ? "Within 6 Hours" : "24-48 Hours"} active={lab.isRapidServiceAvailable} />
                    <FeatureCard icon={<FaShieldAlt />} title="Accreditation" desc="ISO & NABL" active={true} />
                    <FeatureCard icon={<FaCalendarCheck />} title="Appointments" desc="Instant Booking" active={true} />
                </div>
            </div>

            {/* --- 4. SERVICES SECTION --- */}
            <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm min-h-[600px]">
                    <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 px-6 pt-4 gap-4">
                        <div className="flex gap-8">
                            <TabTrigger active={activeTab === "packages"} onClick={() => setActiveTab("packages")} label="Health Packages" />
                            <TabTrigger active={activeTab === "tests"} onClick={() => setActiveTab("tests")} label="Individual Tests" />
                        </div>
                        <div className="mb-4 relative w-full md:w-80">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder={`Search ${activeTab}...`}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                            />
                        </div>
                    </div>

                    <div className="p-6">
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

const InfoItem = ({ icon, label, value }) => (
    <div className="flex items-start gap-3">
        <span className="text-slate-400 mt-1">{icon}</span>
        <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">{label}</p>
            <p className="text-slate-700 font-medium">{value}</p>
        </div>
    </div>
);

const FeatureCard = ({ icon, title, desc, active }) => (
    <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${active ? "bg-[#08B36A]/10 text-[#08B36A]" : "bg-slate-50 text-slate-300"}`}>
            {icon}
        </div>
        <div>
            <p className="text-[11px] font-bold text-slate-900 leading-none mb-1">{title}</p>
            <p className="text-[11px] text-slate-500 font-medium">{desc}</p>
        </div>
    </div>
);

const TabTrigger = ({ active, onClick, label }) => (
    <button onClick={onClick} className={`pb-4 text-sm font-bold transition-all relative ${active ? "text-[#08B36A]" : "text-slate-500 hover:text-slate-800"}`}>
        {label}
        {active && <div className="absolute bottom-0 left-0 w-full h-1 bg-[#08B36A] rounded-t-full" />}
    </button>
);

const LoadingSkeleton = () => (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-2 border-slate-200 border-t-[#08B36A] rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest">Syncing Lab Catalog...</p>
    </div>
);