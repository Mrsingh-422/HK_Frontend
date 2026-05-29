"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    FaArrowLeft, FaStar, FaMapMarkerAlt, FaTruck,
    FaBolt, FaPhone, FaEnvelope, FaShieldAlt,
    FaCapsules, FaHistory, FaSearch, FaCheckCircle,
    FaShoppingBasket, FaStore
} from "react-icons/fa";
import UserAPI from "@/app/services/UserAPI";
import PharmacyMedicines from "../../seeallmed/components/PharmacyMedicines";

export default function PharmacyDetailsPage() {
    const { id } = useParams();
    const router = useRouter();

    const [pharmacy, setPharmacy] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPharmacyData = async () => {
            try {
                setLoading(true);
                const response = await UserAPI.getPharmacyDetails(id);
                if (response.success) {
                    setPharmacy(response.data);
                }
            } catch (error) {
                console.error("Error fetching pharmacy details:", error);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchPharmacyData();
    }, [id]);

    const getImageUrl = (path) => {
        if (!path) return null;
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
        return `${baseUrl}/${path.replace(/\\/g, "/")}`;
    };

    if (loading) return <LoadingSkeleton />;

    if (!pharmacy) return (
        <div className="h-screen flex flex-col items-center justify-center px-4 text-center text-slate-500 font-medium">
            <p>Pharmacy information could not be retrieved.</p>
            <button onClick={() => router.back()} className="mt-4 text-emerald-600 font-bold underline">Go Back</button>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            {/* --- TOP UTILITY BAR --- */}
            <nav className="sticky top-0 z-[100] bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-emerald-600 transition-colors"
                    >
                        <FaArrowLeft size={14} />
                        <span className="hidden xs:inline">Back to Hub</span>
                        <span className="xs:hidden inline">Back</span>
                    </button>
                    <div className="flex items-center gap-3 sm:gap-4 text-xs font-medium text-slate-400">
                        <span className="hidden md:inline text-[10px] font-bold uppercase tracking-widest">ID: {pharmacy._id?.slice(-8).toUpperCase()}</span>
                        <div className="hidden md:block h-4 w-px bg-slate-200"></div>
                        <span className="flex items-center gap-1 text-emerald-600 font-bold whitespace-nowrap">
                            <FaCheckCircle className="shrink-0" /> VERIFIED <span className="hidden sm:inline">PHARMACY</span>
                        </span>
                    </div>
                </div>
            </nav>

            {/* --- HEADER SECTION --- */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-12">
                    <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
                        {/* Image Container */}
                        <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-2xl md:rounded-3xl border-4 border-white bg-slate-50 flex items-center justify-center overflow-hidden shrink-0 shadow-xl ring-1 ring-slate-100 mx-auto md:mx-0">
                            {pharmacy.profileImage || pharmacy.gallery?.[0] ? (
                                <img
                                    src={getImageUrl(pharmacy.profileImage || pharmacy.gallery[0])}
                                    alt={pharmacy.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <FaStore className="text-3xl md:text-4xl text-slate-300" />
                            )}
                        </div>

                        {/* Content Container */}
                        <div className="flex-1 w-full text-center md:text-left">
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                                <h1 className="text-xl sm:text-2xl md:text-4xl font-black text-slate-900 tracking-tight">{pharmacy.name}</h1>
                                <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-xs font-black border border-amber-100 shadow-sm">
                                    <FaStar className="text-amber-400" /> {pharmacy.rating || "4.8"}
                                </div>
                            </div>
                            <p className="text-slate-500 text-sm max-w-2xl mb-6 font-medium mx-auto md:mx-0">
                                {pharmacy.about || `Licensed healthcare provider in ${pharmacy.city}. Providing authentic medicines, wellness products, and professional care.`}
                            </p>
                            
                            {/* Responsive Info Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-6 lg:gap-x-12 text-sm text-left">
                                <InfoItem icon={<FaMapMarkerAlt />} label="Store Location" value={pharmacy.address || `${pharmacy.city}, ${pharmacy.state}`} />
                                <InfoItem icon={<FaPhone />} label="Phone Number" value={pharmacy.phone || "Verified Contact"} />
                                <InfoItem icon={<FaEnvelope />} label="Email Support" value={pharmacy.email || "Contact Store"} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- CORE FEATURES GRID --- */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-10">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                    <FeatureCard icon={<FaTruck />} title="Home Delivery" desc={pharmacy.isHomeDeliveryAvailable ? "Doorstep Service" : "In-store Pickup"} active={pharmacy.isHomeDeliveryAvailable} />
                    <FeatureCard icon={<FaHistory />} title="Store Hours" desc={pharmacy.status || "Open Today"} active={true} />
                    <FeatureCard icon={<FaShieldAlt />} title="Authenticity" desc="100% Genuine Meds" active={true} />
                    <FeatureCard icon={<FaBolt />} title="Express Checkout" desc="Rapid Processing" active={true} />
                </div>
            </div>

            {/* --- PRODUCTS SECTION --- */}
            <main className="max-w-7xl mx-auto px-0 sm:px-4 md:px-6 pb-20">
                <div className="bg-white md:rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 sm:p-6 md:p-8">
                        <PharmacyMedicines id={pharmacy._id} />
                    </div>
                </div>
            </main>
        </div>
    );
}

// --- SUB-COMPONENTS (Matching Reference Styles) ---
const InfoItem = ({ icon, label, value }) => (
    <div className="flex items-start gap-3">
        <span className="text-emerald-500 mt-1 shrink-0">{icon}</span>
        <div className="min-w-0">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
            <p className="text-slate-800 font-bold truncate md:whitespace-normal">{value}</p>
        </div>
    </div>
);

const FeatureCard = ({ icon, title, desc, active }) => (
    <div className={`p-4 md:p-5 rounded-2xl border transition-all ${active ? "bg-white border-slate-200 shadow-sm" : "bg-slate-50/50 border-transparent opacity-60"}`}>
        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-lg md:text-xl mb-3 md:mb-4 ${active ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"}`}>
            {icon}
        </div>
        <p className="text-[10px] md:text-xs font-black text-slate-900 uppercase tracking-tight mb-1">{title}</p>
        <p className="text-[9px] md:text-[11px] text-slate-500 font-bold leading-tight">{desc}</p>
    </div>
);

// --- DETAILED SKELETON EFFECT (Matching Reference) ---
const LoadingSkeleton = () => (
    <div className="min-h-screen bg-[#F8FAFC] animate-pulse">
        <div className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
            <div className="h-4 w-32 bg-slate-100 rounded"></div>
            <div className="h-4 w-24 bg-slate-100 rounded"></div>
        </div>
        <div className="bg-white border-b border-slate-200 px-6 py-12">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-slate-100 mx-auto md:mx-0"></div>
                <div className="flex-1 space-y-4">
                    <div className="h-8 w-1/2 bg-slate-200 rounded-lg mx-auto md:mx-0"></div>
                    <div className="h-4 w-3/4 bg-slate-100 rounded-md mx-auto md:mx-0"></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                        <div className="h-10 bg-slate-50 rounded-lg"></div>
                        <div className="h-10 bg-slate-50 rounded-lg"></div>
                        <div className="h-10 bg-slate-50 rounded-lg"></div>
                    </div>
                </div>
            </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 py-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-32 bg-white rounded-2xl border border-slate-100"></div>
                ))}
            </div>
        </div>
        <div className="max-w-7xl mx-auto px-6">
            <div className="bg-white rounded-3xl border border-slate-200 h-[400px] p-8">
                <div className="flex gap-10 border-b border-slate-100 mb-8">
                    <div className="h-6 w-32 bg-slate-100 mb-2"></div>
                    <div className="h-6 w-32 bg-slate-100 mb-2"></div>
                </div>
            </div>
        </div>
    </div>
);