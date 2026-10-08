"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
    FaClock, 
    FaSyringe, 
    FaHeartbeat, 
    FaChevronRight, 
    FaShieldAlt, 
    FaUserCheck, 
    FaStethoscope, 
    FaUserNurse, 
    FaArrowLeft, 
    FaSearch, 
    FaTimes, 
    FaUsers, 
    FaSortAmountDown, 
    FaChevronLeft,
    FaToggleOn,
    FaToggleOff,
    FaCheckCircle,
    FaArrowRight,
    FaRegHospital,
    FaSparkles,
    FaCertificate,
    FaBoxOpen,
    FaMapMarkerAlt,
    FaStar
} from "react-icons/fa";
import UserAPI from "@/app/services/UserAPI";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "";

const getReportFileUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    const cleanedPath = path.replace(/^\/+/, "").replace(/^public\//, "");
    return `${BASE_URL}/${cleanedPath}`;
};

const SERVICE_ICONS = {
    "NURSING CARE": <FaSyringe className="text-[#08B36A]" />,
    "ELDERLY CARE": <FaHeartbeat className="text-[#08B36A]" />,
    "CRITICAL CARE": <FaClock className="text-[#08B36A]" />,
    "HOME ATTENDANT": <FaUserCheck className="text-[#08B36A]" />
};

const CATEGORIES = ["All", "NURSING CARE", "ELDERLY CARE", "CRITICAL CARE", "HOME ATTENDANT"];

// Helper function to extract starting price from package pricing if available
const getPackageMinPrice = (pricing) => {
    if (!pricing) return 0;
    const prices = [];
    ['oneDay', 'multipleDays', 'hourly'].forEach(type => {
        const item = pricing[type];
        if (item) {
            const val = Number(item.final ?? item.base);
            if (!isNaN(val) && val > 0) {
                prices.push(val);
            }
        }
    });
    return prices.length > 0 ? Math.min(...prices) : 0;
};

export default function SeeAllServicesPage() {
    const router = useRouter();

    // Tab State: "services" or "packages"
    const [activeTab, setActiveTab] = useState("services");

    // Services States
    const [services, setServices] = useState([]);
    const [servicePagination, setServicePagination] = useState({
        totalItems: 0,
        totalPages: 1,
        currentPage: 1,
        limit: 20,
        hasNextPage: false,
        hasPrevPage: false
    });

    const [servicePage, setServicePage] = useState(1);
    const [serviceSearch, setServiceSearch] = useState("");
    const [debouncedServiceSearch, setDebouncedServiceSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [sortBy, setSortBy] = useState("available_first");
    const [hasVendorsOnly, setHasVendorsOnly] = useState(false);
    const [loadingServices, setLoadingServices] = useState(true);

    // Packages States
    const [packages, setPackages] = useState([]);
    const [packagePagination, setPackagePagination] = useState({
        totalItems: 0,
        totalPages: 1,
        currentPage: 1,
        limit: 20,
        hasNextPage: false,
        hasPrevPage: false
    });

    const [packagePage, setPackagePage] = useState(1);
    const [packageSearch, setPackageSearch] = useState("");
    const [debouncedPackageSearch, setDebouncedPackageSearch] = useState("");
    const [loadingPackages, setLoadingPackages] = useState(false);

    // Debounce Service Search
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedServiceSearch(serviceSearch);
            setServicePage(1);
        }, 350);
        return () => clearTimeout(handler);
    }, [serviceSearch]);

    // Debounce Package Search
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedPackageSearch(packageSearch);
            setPackagePage(1);
        }, 350);
        return () => clearTimeout(handler);
    }, [packageSearch]);

    // Fetch Services
    const fetchServices = useCallback(async () => {
        try {
            setLoadingServices(true);
            const res = await UserAPI.getGlobalNursingServices({
                page: servicePage,
                limit: 20,
                category: selectedCategory === "All" ? undefined : selectedCategory,
                search: debouncedServiceSearch || undefined,
                sortBy,
                hasVendorsOnly
            });

            if (res?.success) {
                setServices(res.data || []);
                if (res.pagination) {
                    setServicePagination(res.pagination);
                }
            }
        } catch (error) {
            console.error("Error fetching global nursing services:", error);
        } finally {
            setLoadingServices(false);
        }
    }, [servicePage, selectedCategory, debouncedServiceSearch, sortBy, hasVendorsOnly]);

    useEffect(() => {
        if (activeTab === "services") {
            fetchServices();
        }
    }, [fetchServices, activeTab]);

    // Fetch Packages (Using GET /user/nurse/packages/list)
    const fetchPackages = useCallback(async () => {
        try {
            setLoadingPackages(true);
            const res = await UserAPI.getUserCatalogPackages({
                page: packagePage,
                limit: 20,
                search: debouncedPackageSearch || undefined
            });

            if (res?.success) {
                setPackages(res.data || []);
                if (res.pagination) {
                    setPackagePagination(res.pagination);
                }
            }
        } catch (error) {
            console.error("Error fetching user catalog packages:", error);
        } finally {
            setLoadingPackages(false);
        }
    }, [packagePage, debouncedPackageSearch]);

    useEffect(() => {
        if (activeTab === "packages") {
            fetchPackages();
        }
    }, [fetchPackages, activeTab]);

    const handleServiceClick = (service) => {
        const subCategory = service.subCategory || service.title;
        router.push(`/nursingservice/providers?serviceId=${service._id}&subCategory=${encodeURIComponent(subCategory)}`);
    };

    const handlePackageClick = (pkg) => {
        router.push(`/nursingservice/providers?packageId=${pkg._id}`);
    };

    const loading = activeTab === "services" ? loadingServices : loadingPackages;
    const currentPagination = activeTab === "services" ? servicePagination : packagePagination;

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 pb-24 overflow-x-hidden relative selection:bg-[#08B36A]/20 selection:text-[#08B36A]">
            
            <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-emerald-50/70 via-slate-50/40 to-transparent pointer-events-none -z-10" />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 space-y-8">
                
                {/* Back Navigation Bar */}
                <div className="flex items-center justify-between">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="inline-flex items-center gap-2.5 text-xs font-black uppercase tracking-wider text-slate-500 hover:text-[#08B36A] transition-all group cursor-pointer"
                    >
                        <div className="w-8 h-8 rounded-full bg-white border border-slate-200/90 shadow-sm flex items-center justify-center group-hover:border-[#08B36A] group-hover:bg-emerald-50 group-hover:scale-105 transition-all">
                            <FaArrowLeft className="text-xs text-slate-600 group-hover:text-[#08B36A] transition-colors" />
                        </div>
                        <span>Back to Overview</span>
                    </button>

                    <div className="hidden sm:flex items-center gap-2 text-[11px] font-black uppercase tracking-wider bg-white px-3.5 py-1.5 rounded-full border border-slate-200/80 shadow-xs text-slate-600">
                        <FaCertificate className="text-[#08B36A]" /> Certified Clinical Network
                    </div>
                </div>

                {/* Hero Header Block */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 pb-6 border-b border-slate-200/80">
                    <div className="max-w-2xl space-y-3.5">
                        <div className="inline-flex items-center gap-2 text-[#08B36A] font-black text-[10px] sm:text-[11px] uppercase tracking-widest bg-emerald-50/80 px-3.5 py-1.5 rounded-full border border-emerald-200/70 shadow-xs">
                            <span className="w-2 h-2 rounded-full bg-[#08B36A] animate-ping" />
                            <FaUserNurse className="text-[#08B36A]" size={12} />
                            Verified Provider Directory
                        </div>
                        <h1 className="text-3xl sm:text-5xl lg:text-[2.75rem] font-black text-slate-900 tracking-tight leading-[1.15]">
                            Explore Verified <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#08B36A] via-emerald-600 to-teal-700">Nursing {activeTab === "services" ? "Services" : "Care Packages"}.</span>
                        </h1>
                        <p className="text-slate-500 text-xs sm:text-sm font-medium leading-relaxed max-w-xl">
                            {activeTab === "services"
                                ? "Compare clinical procedures, post-operative monitoring, and continuous bedside care provided by vetted nursing personnel across leading providers."
                                : "Explore comprehensive pre-bundled nursing care packages offered directly by verified bureaus for specialized treatments."}
                        </p>
                    </div>

                    {/* Elevated Search Bar */}
                    <div className="w-full lg:w-96 relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-[#08B36A]">
                            <FaSearch size={13} />
                        </div>
                        <input
                            type="text"
                            placeholder={activeTab === "services" ? "Search e.g. Injection, Dressing..." : "Search packages e.g. Corona Care..."}
                            value={activeTab === "services" ? serviceSearch : packageSearch}
                            onChange={(e) => activeTab === "services" ? setServiceSearch(e.target.value) : setPackageSearch(e.target.value)}
                            className="w-full pl-14 pr-10 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-800 text-xs sm:text-sm font-bold focus:outline-none focus:border-[#08B36A] focus:ring-4 focus:ring-[#08B36A]/10 transition-all shadow-sm placeholder:text-slate-400"
                        />
                        {(activeTab === "services" ? serviceSearch : packageSearch) && (
                            <button
                                type="button"
                                onClick={() => activeTab === "services" ? setServiceSearch("") : setPackageSearch("")}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                            >
                                <FaTimes size={12} />
                            </button>
                        )}
                    </div>
                </div>

                {/* TABS SWITCHER */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setActiveTab("services")}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
                            activeTab === "services"
                                ? "bg-[#08B36A] text-white shadow-lg shadow-[#08B36A]/20"
                                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                        }`}
                    >
                        <FaStethoscope />
                        <span>Individual Services ({servicePagination.totalItems})</span>
                    </button>

                    <button
                        onClick={() => setActiveTab("packages")}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
                            activeTab === "packages"
                                ? "bg-[#08B36A] text-white shadow-lg shadow-[#08B36A]/20"
                                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                        }`}
                    >
                        <FaBoxOpen />
                        <span>Care Packages ({packagePagination.totalItems})</span>
                    </button>
                </div>

                {/* Filter & Control Bar (Only for Services Tab) */}
                {activeTab === "services" && (
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white/90 backdrop-blur-md p-3.5 sm:p-4 rounded-[1.75rem] border border-slate-200/90 shadow-sm">
                        <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 scrollbar-none">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => { setSelectedCategory(cat); setServicePage(1); }}
                                    className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 shrink-0 cursor-pointer ${
                                        selectedCategory === cat
                                            ? "bg-[#08B36A] text-white shadow-md shadow-[#08B36A]/25 ring-2 ring-[#08B36A]/20"
                                            : "bg-slate-50 text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-100"
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-end pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                            <button
                                type="button"
                                onClick={() => { setHasVendorsOnly(!hasVendorsOnly); setServicePage(1); }}
                                className={`flex items-center gap-2 text-xs font-black uppercase tracking-wider px-3.5 py-2.5 rounded-xl transition-all border cursor-pointer ${
                                    hasVendorsOnly 
                                        ? "bg-emerald-50 border-emerald-300 text-[#08B36A] shadow-xs" 
                                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                                }`}
                            >
                                {hasVendorsOnly ? <FaToggleOn size={20} className="text-[#08B36A]" /> : <FaToggleOff size={20} className="text-slate-400" />}
                                <span>Active Providers Only</span>
                            </button>

                            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                                <FaSortAmountDown className="text-slate-400 text-xs shrink-0" />
                                <select
                                    value={sortBy}
                                    onChange={(e) => { setSortBy(e.target.value); setServicePage(1); }}
                                    className="bg-transparent text-slate-800 text-xs font-bold outline-none cursor-pointer pr-1"
                                >
                                    <option value="available_first">Available First</option>
                                    <option value="price_asc">Price: Low to High</option>
                                    <option value="price_desc">Price: High to Low</option>
                                    <option value="popularity">Popularity</option>
                                    <option value="name_asc">Name: A to Z</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* Status Counter */}
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
                    <p>
                        Showing <span className="text-slate-900 font-black">{activeTab === "services" ? services.length : packages.length}</span> of {currentPagination.totalItems} {activeTab === "services" ? "Care Services" : "Care Packages"}
                    </p>
                    {currentPagination.totalPages > 1 && (
                        <p className="text-slate-400 font-medium">
                            Page {currentPagination.currentPage} of {currentPagination.totalPages}
                        </p>
                    )}
                </div>

                {/* CONTENT AREA */}
                {loading ? (
                    <div className="py-28 flex flex-col items-center justify-center bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#08B36A] mb-3" />
                        <p className="text-xs text-slate-400 font-black uppercase tracking-widest">Loading Catalog {activeTab}...</p>
                    </div>
                ) : activeTab === "services" ? (
                    /* SERVICES GRID */
                    services.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                            {services.map((service) => {
                                const serviceTitle = service.subCategory || service.title || "Clinical Nursing Care";
                                const serviceCategory = service.category || service.servicesOffered || "General";
                                const startingPrice = service.minPrice ?? service.defaultOneDayPrice ?? service.startingPrice ?? 0;
                                const providerCount = service.providerCount ?? 0;
                                const hasActive = service.hasActiveVendors || providerCount > 0;
                                const iconElement = SERVICE_ICONS[serviceCategory] || <FaStethoscope className="text-[#08B36A]" />;

                                return (
                                    <div
                                        key={service._id}
                                        onClick={() => handleServiceClick(service)}
                                        className="group relative cursor-pointer bg-white border border-slate-200/80 hover:border-[#08B36A] rounded-[2.25rem] p-6.5 pl-7.5 shadow-sm hover:shadow-2xl hover:shadow-emerald-950/10 transition-all duration-300 flex flex-col justify-between overflow-hidden hover:-translate-y-1"
                                    >
                                        <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#08B36A] rounded-l-[2.25rem] group-hover:w-2.5 transition-all duration-300" />
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors pointer-events-none" />

                                        <div className="space-y-4 relative z-10">
                                            <div className="flex items-center justify-between">
                                                <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-emerald-50 via-white to-emerald-50/50 border border-emerald-100 flex items-center justify-center text-xl shrink-0 text-[#08B36A] shadow-xs group-hover:scale-105 group-hover:bg-[#08B36A] group-hover:text-white transition-all duration-300 ring-2 ring-emerald-50">
                                                    {iconElement}
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100/80 group-hover:bg-emerald-50 group-hover:text-[#08B36A] text-slate-600 px-3 py-1 rounded-full border border-slate-200/60 transition-colors">
                                                    {serviceCategory}
                                                </span>
                                            </div>

                                            <div>
                                                <h3 className="font-black text-base text-slate-900 group-hover:text-[#08B36A] transition-colors line-clamp-2 leading-snug">
                                                    {serviceTitle}
                                                </h3>
                                                <p className="text-slate-500 text-xs font-medium line-clamp-2 leading-relaxed mt-2">
                                                    {service.description || service.procedureIncluded || "Certified clinical procedure with sanitized supplies and licensed nursing care."}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between relative z-10">
                                            <div>
                                                <div className="flex items-center gap-1 text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                                                    <span>Starts From</span>
                                                    {hasActive ? (
                                                        <span className="text-[#08B36A] bg-emerald-50 px-1.5 py-0.5 rounded font-black flex items-center gap-1">
                                                            <FaUsers size={9} /> {providerCount} Providers Available
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded font-bold">Standard Rate</span>
                                                    )}
                                                </div>
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-2xl font-black text-slate-900 group-hover:text-[#08B36A] transition-colors">
                                                        ₹{startingPrice}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase">/ visit</span>
                                                </div>
                                            </div>

                                            <div className="h-10 px-4 rounded-xl bg-slate-100 text-slate-700 group-hover:bg-[#08B36A] group-hover:text-white flex items-center gap-2 text-xs font-black uppercase tracking-wider transition-all duration-300 shadow-xs shrink-0 group-hover:shadow-md group-hover:shadow-[#08B36A]/20">
                                                <span>Providers</span>
                                                <FaArrowRight size={10} className="group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="py-24 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-200 shadow-xs">
                            <FaStethoscope className="text-slate-300 text-5xl mx-auto mb-3" />
                            <h3 className="text-slate-800 font-black text-sm tracking-wide">No Services Found</h3>
                        </div>
                    )
                ) : (
                    /* PACKAGES GRID (Minimalist Cards matching GET /user/nurse/packages/list) */
                    packages.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                            {packages.map((pkg) => {
                                const packagePrice = getPackageMinPrice(pkg.pricing);

                                return (
                                    <div
                                        key={pkg._id}
                                        onClick={() => handlePackageClick(pkg)}
                                        className="group relative cursor-pointer bg-white border border-slate-200/80 hover:border-[#08B36A] rounded-[2.25rem] p-6.5 pl-7.5 shadow-sm hover:shadow-2xl hover:shadow-emerald-950/10 transition-all duration-300 flex flex-col justify-between overflow-hidden hover:-translate-y-1"
                                    >
                                        <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#08B36A] rounded-l-[2.25rem] group-hover:w-2.5 transition-all duration-300" />
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors pointer-events-none" />

                                        <div className="space-y-4 relative z-10">
                                            {/* Thumbnail or Fallback Icon */}
                                            <div className="flex items-center justify-between">
                                                <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-emerald-50 via-white to-emerald-50/50 border border-emerald-100 flex items-center justify-center text-xl shrink-0 text-[#08B36A] shadow-xs group-hover:scale-105 group-hover:bg-[#08B36A] group-hover:text-white transition-all duration-300 overflow-hidden">
                                                    {pkg.thumbnail ? (
                                                        <img src={getReportFileUrl(pkg.thumbnail)} alt={pkg.packageName} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <FaBoxOpen />
                                                    )}
                                                </div>

                                                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-[#08B36A] px-3 py-1 rounded-full border border-emerald-200/60">
                                                    {pkg.totalServicesCount || 0} Included Services
                                                </span>
                                            </div>

                                            {/* Package Title & Description */}
                                            <div>
                                                <h3 className="font-black text-base text-slate-900 group-hover:text-[#08B36A] transition-colors line-clamp-2 leading-snug">
                                                    {pkg.packageName}
                                                </h3>
                                                <p className="text-slate-500 text-xs font-medium line-clamp-2 leading-relaxed mt-2">
                                                    {pkg.description || "Comprehensive clinical package bundle tailored for specialized recovery."}
                                                </p>
                                            </div>

                                            {/* Badges */}
                                            <div className="flex items-center gap-2 pt-1 flex-wrap">
                                                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold bg-slate-50 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-100">
                                                    <FaCheckCircle className="text-[#08B36A] text-[10px]" /> Verified Bundle
                                                </span>
                                                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold bg-slate-50 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-100">
                                                    <FaRegHospital className="text-slate-400 text-[10px]" /> In-Home Care
                                                </span>
                                            </div>
                                        </div>

                                        {/* Footer: Starting Price & Explore Button */}
                                        <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between relative z-10">
                                            <div>
                                                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                                                    <span>Starts From</span>
                                                </div>
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-2xl font-black text-slate-900 group-hover:text-[#08B36A] transition-colors">
                                                        {packagePrice > 0 ? `₹${packagePrice}` : "Best Rate"}
                                                    </span>
                                                    {packagePrice > 0 && (
                                                        <span className="text-[10px] text-slate-400 font-bold uppercase">/ session</span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="h-10 px-4 rounded-xl bg-slate-100 text-slate-700 group-hover:bg-[#08B36A] group-hover:text-white flex items-center gap-2 text-xs font-black uppercase tracking-wider transition-all duration-300 shadow-xs shrink-0">
                                                <span>View Vendors</span>
                                                <FaArrowRight size={10} className="group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="py-24 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-200 shadow-xs">
                            <FaBoxOpen className="text-slate-300 text-5xl mx-auto mb-3" />
                            <h3 className="text-slate-800 font-black text-sm tracking-wide">No Care Packages Available</h3>
                            <p className="text-slate-400 text-xs mt-1">There are no nursing packages published right now.</p>
                        </div>
                    )
                )}

                {/* Pagination Controls */}
                {currentPagination.totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 pt-6">
                        <button
                            type="button"
                            onClick={() => activeTab === "services" ? setServicePage((prev) => Math.max(prev - 1, 1)) : setPackagePage((prev) => Math.max(prev - 1, 1))}
                            disabled={!currentPagination.hasPrevPage}
                            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                            <FaChevronLeft size={10} /> Prev
                        </button>

                        <div className="flex items-center gap-1.5">
                            {Array.from({ length: currentPagination.totalPages }, (_, i) => i + 1).map((pNum) => (
                                <button
                                    key={pNum}
                                    type="button"
                                    onClick={() => activeTab === "services" ? setServicePage(pNum) : setPackagePage(pNum)}
                                    className={`w-9 h-9 rounded-xl text-xs font-black transition-all cursor-pointer ${
                                        currentPagination.currentPage === pNum
                                            ? "bg-[#08B36A] text-white shadow-md shadow-[#08B36A]/25"
                                            : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                                    }`}
                                >
                                    {pNum}
                                </button>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={() => activeTab === "services" ? setServicePage((prev) => Math.min(prev + 1, currentPagination.totalPages)) : setPackagePage((prev) => Math.min(prev + 1, currentPagination.totalPages))}
                            disabled={!currentPagination.hasNextPage}
                            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                            Next <FaChevronRight size={10} />
                        </button>
                    </div>
                )}

                {/* Trust Signals Footer Banner */}
                <section className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-8 border-t border-slate-200/80">
                    <div className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
                        <div className="h-11 w-11 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
                            <FaShieldAlt className="text-[#08B36A] text-lg" />
                        </div>
                        <div>
                            <h4 className="font-black text-xs text-slate-900 uppercase tracking-wide">Verified Nurse Providers</h4>
                            <p className="text-[11px] text-slate-400 font-medium mt-0.5">100% Background-Checked & Licensed</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
                        <div className="h-11 w-11 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
                            <FaUserCheck className="text-[#08B36A] text-lg" />
                        </div>
                        <div>
                            <h4 className="font-black text-xs text-slate-900 uppercase tracking-wide">Qualified Care Staff</h4>
                            <p className="text-[11px] text-slate-400 font-medium mt-0.5">Experienced & Trained Medical Personnel</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
                        <div className="h-11 w-11 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
                            <FaClock className="text-[#08B36A] text-lg" />
                        </div>
                        <div>
                            <h4 className="font-black text-xs text-slate-900 uppercase tracking-wide">Flexible Schedules</h4>
                            <p className="text-[11px] text-slate-400 font-medium mt-0.5">Single Visit, Hourly, or Long-Term Care</p>
                        </div>
                    </div>
                </section>

            </main>
        </div>
    );
}