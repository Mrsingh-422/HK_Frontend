"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    FaArrowLeft, FaStar, FaMapMarkerAlt, FaTruck,
    FaBolt, FaPhone, FaEnvelope, FaShieldAlt,
    FaCapsules, FaHistory, FaCheckCircle, FaStore,
    FaRegFileAlt, FaIdCard, FaImage
} from "react-icons/fa";
import UserAPI from "@/app/services/UserAPI";
import PharmacyMedicines from "../../seeallmed/components/PharmacyMedicines";

// Dynamic asset path builder
const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
    const cleanPath = imagePath.replace(/^public\//, "");
    return `${BASE_URL}/${cleanPath}`;
};

export default function PharmacyDetailsPage() {
    const { id } = useParams();
    const router = useRouter();

    const [pharmacy, setPharmacy] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("medicines"); // "medicines" | "documents" | "reviews"

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

    if (loading) return <LoadingSkeleton />;

    if (!pharmacy) return (
        <div className="h-screen flex flex-col items-center justify-center px-4 text-center bg-[#F8FAFC]">
            <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4 shadow-sm">
                <FaStore size={24} />
            </div>
            <p className="text-slate-600 font-black uppercase tracking-wider text-sm">Pharmacy Not Found</p>
            <p className="text-slate-400 text-xs mt-1">The requested store profile record could not be retrieved.</p>
            <button 
                onClick={() => router.back()} 
                className="mt-6 px-6 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm hover:bg-slate-50 transition-all"
            >
                Go Back
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-12 selection:bg-emerald-100 selection:text-emerald-900">
            {/* --- TOP NAV NAVIGATION BAR --- */}
            <nav className="sticky top-0 z-[100] bg-white/80 backdrop-blur-md border-b border-slate-200/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500 hover:text-emerald-600 transition-colors"
                    >
                        <FaArrowLeft size={12} />
                        <span>Back to Hub</span>
                    </button>
                    <div className="flex items-center gap-4">
                        <span className="hidden sm:inline text-[10px] font-black text-slate-400 uppercase tracking-widest">ID: {pharmacy._id?.slice(-8).toUpperCase()}</span>
                        <div className="hidden sm:block h-4 w-px bg-slate-200"></div>
                        <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm">
                            <FaCheckCircle className="shrink-0 text-emerald-500 animate-pulse" /> VERIFIED PROVIDER
                        </span>
                    </div>
                </div>
            </nav>

            {/* --- HEADER BANNER PROFILE SECTION --- */}
            <div className="bg-white border-b border-slate-200/60 relative overflow-hidden">
                <div className="absolute top-0 right-0 -z-10 w-[300px] md:w-[500px] h-[300px] bg-gradient-to-br from-emerald-50 to-blue-50 rounded-full blur-3xl opacity-70 pointer-events-none"></div>
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                    <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start text-center md:text-left">
                        
                        {/* Profile Photo Element */}
                        <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36 rounded-2xl md:rounded-[2rem] bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center overflow-hidden shrink-0 shadow-xl shadow-slate-200/60 border border-slate-200/40 relative group">
                            {pharmacy.profileImage ? (
                                <img
                                    src={getImageUrl(pharmacy.profileImage)}
                                    alt={pharmacy.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            ) : (
                                <FaStore className="text-3xl md:text-4xl text-slate-300" />
                            )}
                        </div>

                        {/* Store Credentials Content */}
                        <div className="flex-1 min-w-0 w-full">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-center md:justify-start gap-2.5 mb-3">
                                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight uppercase">
                                    {pharmacy.name}
                               </h1>
                                <div className="flex items-center justify-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-xl text-xs font-black border border-amber-100 shadow-sm w-fit mx-auto sm:mx-0">
                                    <FaStar className="text-amber-400 fill-amber-400" /> {pharmacy.rating || "5.0"}
                                </div>
                            </div>
                            
                            <p className="text-slate-500 text-xs md:text-sm max-w-2xl font-semibold leading-relaxed mb-6">
                                {pharmacy.about && pharmacy.about !== "hihi" ? pharmacy.about : `Licensed healthcare provider in ${pharmacy.city}. Providing authentic medicines, clinical supplies, and professional community pharmaceutical care services.`}
                            </p>
                            
                            {/* Detailed Meta Parameters Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-left border-t border-slate-100 pt-6">
                                <InfoItem icon={<FaMapMarkerAlt />} label="Store Address" value={pharmacy.address || `${pharmacy.city}, ${pharmacy.state}`} />
                                <InfoItem icon={<FaPhone />} label="Phone Line" value={pharmacy.phone} />
                                <InfoItem icon={<FaEnvelope />} label="Email Mailbox" value={pharmacy.email} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- PARAMETER KPI METRIC GRID --- */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                    <FeatureCard icon={<FaTruck />} title="Home Delivery" desc={pharmacy.isHomeDeliveryAvailable ? "Available at Doorstep" : "In-Store Pickup Only"} active={pharmacy.isHomeDeliveryAvailable} color="emerald" />
                    <FeatureCard icon={<FaHistory />} title="Operating Hours" desc={pharmacy.is24x7 ? "Open 24/7 Always" : "Standard Shift"} active={pharmacy.is24x7} color="blue" />
                    <FeatureCard icon={<FaShieldAlt />} title="Regulatory Status" desc={pharmacy.profileStatus || "Approved"} active={pharmacy.profileStatus === "Approved"} color="emerald" />
                    <FeatureCard icon={<FaBolt />} title="Drug License" desc={`Type: ${pharmacy.documents?.drugLicenseType || "Standard"}`} active={true} color="slate" />
                </div>
            </div>

            {/* --- LOWER VIEWPORT TAB CONTROL GRID SYSTEM --- */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
                    
                    {/* Tab Navigation Controls */}
                    <div className="flex border-b border-slate-200/60 bg-slate-50/50 px-4 md:px-8 pt-4">
                        <button
                            onClick={() => setActiveTab("medicines")}
                            className={`flex items-center gap-2 pb-4 text-xs font-black uppercase tracking-wider border-b-2 transition-all px-4 ${activeTab === "medicines" ? "border-[#08B36A] text-[#08B36A]" : "border-transparent text-slate-400 hover:text-slate-600"}`}
                        >
                            <FaCapsules size={14} />
                            <span>Available Stock</span>
                        </button>
                        <button
                            onClick={() => setActiveTab("documents")}
                            className={`flex items-center gap-2 pb-4 text-xs font-black uppercase tracking-wider border-b-2 transition-all px-4 ${activeTab === "documents" ? "border-[#08B36A] text-[#08B36A]" : "border-transparent text-slate-400 hover:text-slate-600"}`}
                        >
                            <FaRegFileAlt size={14} />
                            <span>Documents & Records</span>
                        </button>
                        <button
                            onClick={() => setActiveTab("reviews")}
                            className={`flex items-center gap-2 pb-4 text-xs font-black uppercase tracking-wider border-b-2 transition-all px-4 ${activeTab === "reviews" ? "border-[#08B36A] text-[#08B36A]" : "border-transparent text-slate-400 hover:text-slate-600"}`}
                        >
                            <FaStar size={14} />
                            <span>Reviews ({pharmacy.totalReviews || 0})</span>
                        </button>
                    </div>

                    <div className="p-4 sm:p-6 md:p-8">
                        {/* VIEW 1: MEDICINES MARKETPLACE */}
                        {activeTab === "medicines" && (
                            <div>
                                <div className="mb-6">
                                    <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Product Catalog</h2>
                                    <p className="text-xs text-slate-400 font-semibold">Browse and request prescriptions online from this dynamic retail outlet branch.</p>
                                </div>
                                <PharmacyMedicines id={pharmacy._id} />
                            </div>
                        )}

                        {/* VIEW 2: COMPLIANCE REGULATORY DOCUMENTS & GALLERY */}
                        {activeTab === "documents" && (
                            <div className="space-y-8">
                                {/* Corporate Registration Fields */}
                                <div>
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Corporate Legal Records</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/40">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">GST identification Number</p>
                                            <p className="text-sm font-black text-slate-700 tracking-mono mt-0.5">{pharmacy.documents?.gstNumber || "N/A"}</p>
                                        </div>
                                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/40">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Issuing Authority</p>
                                            <p className="text-sm font-black text-slate-700 uppercase mt-0.5">{pharmacy.documents?.issuingAuthority || "Govt Registrar Office"}</p>
                                        </div>
                                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/40">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Drug License Provision</p>
                                            <p className="text-sm font-black text-slate-700 uppercase mt-0.5">{pharmacy.documents?.drugLicenseType || "Standard"}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Media File Records Row */}
                                <div>
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Verification Certificate & Gallery Assets</h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                        <DocumentPreviewCard title="Pharmacy Images" paths={pharmacy.documents?.pharmacyImages} icon={<FaImage />} />
                                        <DocumentPreviewCard title="Pharmacy Certificates" paths={pharmacy.documents?.pharmacyCertificates} icon={<FaRegFileAlt />} />
                                        <DocumentPreviewCard title="Pharmacy Licenses" paths={pharmacy.documents?.pharmacyLicenses} icon={<FaIdCard />} />
                                        <DocumentPreviewCard title="GST Certificates" paths={pharmacy.documents?.gstCertificates} icon={<FaRegFileAlt />} />
                                        <DocumentPreviewCard title="Drug Licenses" paths={pharmacy.documents?.drugLicenses} icon={<FaIdCard />} />
                                        <DocumentPreviewCard title="Other Certificates" paths={pharmacy.documents?.otherCertificates} icon={<FaRegFileAlt />} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* VIEW 3: REVIEWS LISTING */}
                        {activeTab === "reviews" && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                    <div>
                                        <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Customer Reviews</h2>
                                        <p className="text-xs text-slate-400 font-semibold">Verified ratings and comments submitted by community members.</p>
                                    </div>
                                    <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-2xl border border-amber-100 shadow-sm">
                                        <FaStar className="text-amber-400 fill-amber-400" />
                                        <span className="text-sm font-black">{pharmacy.rating || "5.0"} / 5.0</span>
                                        <span className="text-slate-400 text-xs font-bold">({pharmacy.totalReviews || 0} total)</span>
                                    </div>
                                </div>

                                {(!pharmacy.recentReviews || pharmacy.recentReviews.length === 0) ? (
                                    <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100">
                                        <FaStar className="text-slate-200 text-3xl mx-auto mb-2" />
                                        <p className="text-slate-500 text-xs font-bold uppercase">No Reviews Yet</p>
                                        <p className="text-slate-400 text-[10px] mt-1">Be the first to leave a review after making a purchase.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {pharmacy.recentReviews.slice(0, 3).map((review) => (
                                            <div key={review._id} className="p-5 rounded-2xl bg-slate-50/50 border border-slate-200/40 space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-black text-xs uppercase">
                                                            {review.userName?.charAt(0) || "U"}
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-black text-slate-700 uppercase">{review.userName || "Verified User"}</p>
                                                            <p className="text-[9px] text-slate-400 font-bold">{review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ""}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2.5 py-1 rounded-xl text-[10px] font-black border border-amber-100/60">
                                                        <FaStar className="text-amber-400 fill-amber-400" /> {review.rating}
                                                    </div>
                                                </div>
                                                <p className="text-xs text-slate-600 font-semibold leading-relaxed pl-11">{review.comment}</p>
                                            </div>
                                        ))}

                                        {/* View All Reviews Control */}
                                        {(pharmacy.recentReviews.length > 3 || pharmacy.totalReviews > 3) && (
                                            <div className="pt-4 flex justify-center">
                                                <button
                                                    onClick={() => router.push(`/userscreen/userallreviews?targetId=${pharmacy._id}&targetType=Pharmacy`)}
                                                    className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-sm flex items-center gap-2"
                                                >
                                                    <span>View All Reviews</span>
                                                    <span className="bg-slate-700 text-white text-[9px] px-2 py-0.5 rounded-full">{pharmacy.totalReviews || pharmacy.recentReviews.length}</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

// --- SUB-COMPONENTS ---
const InfoItem = ({ icon, label, value }) => (
    <div className="flex items-start gap-3 min-w-0">
        <span className="text-emerald-500 mt-0.5 shrink-0 bg-emerald-50 p-1.5 rounded-lg border border-emerald-100">{icon}</span>
        <div className="min-w-0">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
            <p className="text-slate-700 text-xs font-bold leading-tight break-words uppercase">{value || "Not Documented"}</p>
        </div>
    </div>
);

const FeatureCard = ({ icon, title, desc, active, color }) => {
    const colorThemes = {
        emerald: "bg-emerald-50/50 text-emerald-600 border-emerald-100/70",
        blue: "bg-blue-50/50 text-blue-600 border-blue-100/70",
        slate: "bg-slate-50/50 text-slate-600 border-slate-200/50"
    };

    return (
        <div className={`p-4 md:p-5 rounded-2xl border transition-all duration-300 ${active ? "bg-white border-slate-200 shadow-sm hover:shadow-md" : "bg-slate-50/40 border-slate-100 opacity-60"}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-base mb-4 border ${active ? colorThemes[color] : "bg-slate-100 text-slate-400 border-transparent"}`}>
                {icon}
            </div>
            <p className="text-[10px] font-black text-slate-900 uppercase tracking-wider mb-1">{title}</p>
            <p className="text-[11px] text-slate-400 font-bold leading-tight truncate uppercase">{desc}</p>
        </div>
    );
};

// Document Preview Card Module
const DocumentPreviewCard = ({ title, paths, icon }) => {
    const targetAsset = paths?.[0];
    const computedUrl = getImageUrl(targetAsset);

    return (
        <div className="group border border-slate-200/60 rounded-xl overflow-hidden bg-white hover:border-slate-300 shadow-2xs transition-all flex flex-col justify-between h-40">
            <div className="bg-slate-50/80 h-28 relative flex items-center justify-center overflow-hidden border-b border-slate-100">
                {computedUrl ? (
                    <img 
                        src={computedUrl} 
                        alt={title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                            e.target.parentNode.innerHTML = `<div class="text-slate-300"><svg stroke="currentColor" fill="currentColor" viewBox="0 0 384 512" height="24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M224 136V0H24C10.7 0 0 10.7 0 24v464c0 13.3 10.7 24 24 24h336c13.3 0 24-10.7 24-24V160H248c-13.2 0-24-10.8-24-24zm160-14.1v6.1H256V0h6.1c5.3 0 10.3 2.1 14.1 5.9l9.9 9.9c3.8 3.8 5.9 8.8 5.9 14.1z"></path></svg></div>`;
                        }}
                    />
                ) : (
                    <div className="text-slate-300">{icon}</div>
                )}
                {computedUrl && (
                    <a 
                        href={computedUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-[10px] font-black uppercase tracking-wider"
                    >
                        View Full Document
                    </a>
                )}
            </div>
            <div className="p-2 text-center">
                <p className="text-[9px] font-black text-slate-500 truncate uppercase tracking-tight">{title}</p>
            </div>
        </div>
    );
};

// --- REDESIGNED COMPREHENSIVE LOADING SKELETON ---
const LoadingSkeleton = () => (
    <div className="min-h-screen bg-[#F8FAFC] animate-pulse">
        <div className="h-16 bg-white border-b border-slate-200/60 px-6 flex items-center justify-between">
            <div className="h-4 w-28 bg-slate-100 rounded"></div>
            <div className="h-4 w-36 bg-slate-100 rounded-full"></div>
        </div>
        <div className="bg-white border-b border-slate-200/60 py-12">
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row gap-8 items-center md:items-start">
                <div className="w-28 h-24 md:w-36 md:h-36 rounded-[2rem] bg-slate-100"></div>
                <div className="flex-1 w-full space-y-4">
                    <div className="h-8 w-2/3 md:w-1/3 bg-slate-200 rounded-xl mx-auto md:mx-0"></div>
                    <div className="h-4 w-full md:w-3/4 bg-slate-100 rounded-md mx-auto md:mx-0"></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                        <div className="h-10 bg-slate-50 rounded-xl"></div>
                        <div className="h-10 bg-slate-50 rounded-xl"></div>
                        <div className="h-10 bg-slate-50 rounded-xl"></div>
                    </div>
                </div>
            </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-24 bg-white rounded-2xl border border-slate-100"></div>
                ))}
            </div>
        </div>
    </div>
);