"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    FaArrowLeft, FaSearch, FaAmbulance, FaStar,
    FaChevronDown, FaFilter, FaMapMarkerAlt, FaLocationArrow,
    FaClock, FaShieldAlt, FaTimes, FaUserCircle, FaChevronLeft, FaChevronRight
} from "react-icons/fa";
import UserAPI from "@/app/services/UserAPI";

// Fallback images for different ambulance types
const FALLBACK_IMAGES = [
    "https://images.unsplash.com/photo-1587745416684-47953f16f02f?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1612277795421-9bc7706a4a34?auto=format&fit=crop&q=80&w=800"
];

export default function AllAmbulancesPage() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("distance");
    const [activeCategory, setActiveCategory] = useState("All");

    const [ambulances, setAmbulances] = useState([]);
    const [categories, setCategories] = useState(["All"]);
    const [loading, setLoading] = useState(true);

    // --- Reviews Modal States ---
    const [selectedAmbulanceForReviews, setSelectedAmbulanceForReviews] = useState(null);
    const [reviewsList, setReviewsList] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [reviewsPage, setReviewsPage] = useState(1);
    const [reviewsTotalPages, setReviewsTotalPages] = useState(1);
    const [totalReviewsCount, setTotalReviewsCount] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                const storedCoords = localStorage.getItem("userCoords");
                const coords = storedCoords ? JSON.parse(storedCoords) : { lat: 30.738045, lng: 76.660620 };

                const enumRes = await UserAPI.getAmbulanceCategories();
                if (enumRes.success) {
                    setCategories(["All", ...enumRes.data.vehicleTypes]);
                }

                const ambRes = await UserAPI.getNearestAmbulances({
                    lat: coords.lat,
                    lng: coords.lng
                });

                if (ambRes.success) {
                    const dataWithImages = ambRes.data.map((amb, index) => ({
                        ...amb,
                        displayImage: amb.image || FALLBACK_IMAGES[index % FALLBACK_IMAGES.length]
                    }));
                    setAmbulances(dataWithImages);
                }
            } catch (error) {
                console.error("Error fetching ambulance data:", error);
            } finally {
                setTimeout(() => setLoading(false), 500);
            }
        };

        fetchData();
    }, []);

    // --- Fetch Paginated Reviews ---
    const fetchReviews = async (ambulanceId, page = 1) => {
        try {
            setReviewsLoading(true);
            if (UserAPI.getAmbulanceReviews) {
                const res = await UserAPI.getAmbulanceReviews(ambulanceId, page, 10);
                if (res.success) {
                    setReviewsList(res.data || []);
                    setReviewsPage(res.currentPage || page);
                    setReviewsTotalPages(res.totalPages || 1);
                    setTotalReviewsCount(res.totalReviews || 0);
                }
            }
        } catch (err) {
            console.error("Error fetching reviews:", err);
        } finally {
            setReviewsLoading(false);
        }
    };

    const handleOpenReviews = (e, amb) => {
        e.stopPropagation();
        setSelectedAmbulanceForReviews(amb);
        setReviewsPage(1);
        fetchReviews(amb._id, 1);
    };

    const handleReviewsPageChange = (newPage) => {
        if (!selectedAmbulanceForReviews) return;
        setReviewsPage(newPage);
        fetchReviews(selectedAmbulanceForReviews._id, newPage);
    };

    const filteredAmbulances = useMemo(() => {
        let result = [...ambulances].filter((amb) => {
            const matchesSearch =
                amb.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (amb.driverInfo?.fullName || "").toLowerCase().includes(searchTerm.toLowerCase());

            const matchesCategory = activeCategory === "All" || amb.vehicleType === activeCategory;

            return matchesSearch && matchesCategory;
        });

        if (sortBy === "price-low") {
            result.sort((a, b) => (a.pricing?.fixedPrice || 0) - (b.pricing?.fixedPrice || 0));
        } else if (sortBy === "distance") {
            result.sort((a, b) => (a.rawDistance || 0) - (b.rawDistance || 0));
        }

        return result;
    }, [searchTerm, sortBy, activeCategory, ambulances]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-slate-100 border-t-[#08B36A] rounded-full animate-spin"></div>
                        <FaAmbulance className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#08B36A] text-xl" />
                    </div>
                    <div className="text-center">
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-800">Locating Nearest Units</p>
                        <p className="text-[10px] text-slate-400 font-medium mt-1">Scanning active medical responders...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen font-sans selection:bg-[#08B36A]/10 bg-[#F8FAFC]">
            {/* Premium Sticky Nav */}
            <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200/50 px-4 py-5 md:py-6">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <button
                        onClick={() => router.back()}
                        className="group flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-all duration-300"
                    >
                        <div className="p-2 rounded-full group-hover:bg-slate-100">
                            <FaArrowLeft className="text-xs" />
                        </div>
                        <span className="font-bold text-[10px] uppercase tracking-widest">Back</span>
                    </button>
                    <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                        <FaShieldAlt className="text-[#08B36A] text-[10px]" />
                        <span className="text-[9px] font-black uppercase tracking-wider text-emerald-700">Verified Units Only</span>
                    </div>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto py-8 md:py-12 px-4">
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-none mb-3">
                            Nearby <span className="text-[#08B36A]">Ambulances</span>
                        </h1>
                        <p className="text-slate-500 text-xs md:text-sm font-medium">Select the fastest responder for immediate medical assistance.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                        <div className="relative flex-1 lg:w-72 group">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#08B36A] transition-colors" />
                            <input
                                type="text"
                                placeholder="Search by name or driver..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#08B36A]/10 focus:border-[#08B36A] outline-none text-xs font-medium transition-all shadow-sm"
                            />
                        </div>
                        <div className="relative">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="appearance-none w-full bg-white border border-slate-200 rounded-2xl px-5 py-3.5 pr-10 text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer hover:border-[#08B36A] transition-all shadow-sm"
                            >
                                <option value="distance">Nearest First</option>
                                <option value="price-low">Lowest Fare</option>
                            </select>
                            <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Categories Filter */}
                <div className="flex items-center gap-3 overflow-x-auto pb-8 no-scrollbar">
                    <div className="flex items-center gap-2 pr-4 border-r border-slate-200">
                        <FaFilter className="text-slate-400 text-xs" />
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Type</span>
                    </div>
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`whitespace-nowrap px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${activeCategory === cat
                                ? "bg-slate-900 text-white shadow-xl shadow-slate-200 -translate-y-0.5"
                                : "bg-white text-slate-500 border border-slate-100 hover:bg-slate-50 hover:border-slate-300"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAmbulances.map((amb) => (
                        <div
                            key={amb._id}
                            className="bg-white rounded-[2rem] p-4 shadow-sm border border-slate-100 flex flex-col group hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500 hover:-translate-y-1"
                        >
                            <div className="h-44 md:h-52 w-full relative overflow-hidden rounded-[1.5rem] bg-slate-50 mb-4">
                                <img
                                    src={amb.displayImage}
                                    className="h-full w-full object-cover transition-transform group-hover:scale-110 duration-700"
                                    alt={amb.name}
                                />
                                <div className="absolute top-3 left-3 flex gap-2">
                                    <span className="bg-white/90 backdrop-blur-md text-slate-900 text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-tighter shadow-sm">
                                        {amb.vehicleType}
                                    </span>
                                </div>
                                
                                {/* Clickable Star Rating for Reviews */}
                                <button
                                    onClick={(e) => handleOpenReviews(e, amb)}
                                    title="View Patient Reviews"
                                    className="absolute bottom-3 right-3 bg-[#08B36A] hover:bg-[#069656] text-white px-2.5 py-1.5 rounded-xl flex items-center gap-1 shadow-lg shadow-emerald-900/20 transition-transform active:scale-90"
                                >
                                    <FaStar className="text-yellow-300 text-[10px]" />
                                    <span className="text-[10px] font-black">{amb.rating || 5.0}</span>
                                </button>
                            </div>

                            <div className="flex-1 px-1">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="text-lg font-black text-slate-900 leading-tight line-clamp-1 group-hover:text-[#08B36A] transition-colors">
                                            {amb.name}
                                        </h3>
                                        <div className="flex items-center gap-1.5 text-slate-400 mt-1">
                                            <FaMapMarkerAlt className="text-[10px]" />
                                            <span className="text-[11px] font-bold truncate">
                                                {amb.driverInfo?.fullName || "Verified Driver"} • {amb.vehicleNumber || "PB65AB1234"}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center justify-end gap-1 text-[#08B36A] font-black text-xs">
                                            <FaLocationArrow className="text-[8px]" /> {amb.distance}
                                        </div>
                                        <div className="flex items-center justify-end gap-1 text-slate-400 font-bold text-[10px] mt-0.5">
                                            <FaClock className="text-[8px]" /> {amb.eta || "Fast"}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-50">
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Fixed Fare</p>
                                    <p className="text-2xl font-black text-slate-900 leading-none mt-1">₹{amb.pricing?.fixedPrice || 0}</p>
                                </div>
                                <button
                                    onClick={() => router.push(`/ambulance/medicalambuancebooking/${amb._id}`)}
                                    className="bg-slate-900 hover:bg-[#08B36A] text-white font-black px-8 py-3.5 rounded-2xl text-[10px] uppercase tracking-[0.1em] transition-all duration-300 active:scale-95 shadow-lg shadow-slate-200"
                                >
                                    Book Now
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {!loading && filteredAmbulances.length === 0 && (
                    <div className="text-center py-24 bg-white rounded-[3rem] border border-dashed border-slate-200 mt-10">
                        <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FaAmbulance className="text-slate-300 text-3xl" />
                        </div>
                        <p className="text-slate-800 font-black uppercase tracking-widest text-sm">No units found in your area</p>
                        <p className="text-slate-400 text-xs mt-2">Try changing your search or resetting filters.</p>
                        <button
                            onClick={() => { setSearchTerm(""); setActiveCategory("All"); }}
                            className="mt-6 px-6 py-2 border border-slate-200 rounded-full text-[#08B36A] text-[10px] font-bold uppercase hover:bg-slate-50 transition-all"
                        >
                            Clear All Filters
                        </button>
                    </div>
                )}
            </div>

            {/* --- PATIENT REVIEWS & RATINGS MODAL --- */}
            {selectedAmbulanceForReviews && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-slate-100 space-y-6 max-h-[85vh] flex flex-col">
                        
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                                    {selectedAmbulanceForReviews.name}
                                </h3>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="flex items-center gap-1 text-xs font-black text-yellow-500 bg-yellow-50 px-2 py-0.5 rounded-md">
                                        <FaStar /> {selectedAmbulanceForReviews.rating || 5.0}
                                    </span>
                                    <span className="text-xs font-bold text-slate-400">
                                        ({totalReviewsCount} Verified Reviews)
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedAmbulanceForReviews(null)}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <FaTimes size={16} />
                            </button>
                        </div>

                        {/* Reviews Content List */}
                        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                            {reviewsLoading ? (
                                <div className="py-12 text-center">
                                    <div className="w-8 h-8 border-3 border-[#08B36A] border-t-transparent rounded-full animate-spin mx-auto"></div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-3">Loading feedback...</p>
                                </div>
                            ) : reviewsList.length === 0 ? (
                                <div className="py-12 text-center text-slate-400">
                                    <p className="text-sm font-bold">No reviews recorded yet.</p>
                                    <p className="text-xs mt-1">Be the first patient to rate this dispatch unit!</p>
                                </div>
                            ) : (
                                reviewsList.map((rev) => (
                                    <div key={rev._id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <FaUserCircle className="text-slate-400 text-base" />
                                                <span className="text-xs font-black text-slate-800">{rev.userName || "Verified Patient"}</span>
                                            </div>
                                            <div className="flex items-center gap-0.5 text-yellow-400 text-xs">
                                                {[...Array(rev.rating || 5)].map((_, i) => (
                                                    <FaStar key={i} />
                                                ))}
                                            </div>
                                        </div>
                                        {rev.comment && (
                                            <p className="text-xs text-slate-600 font-medium leading-relaxed italic">
                                                "{rev.comment}"
                                            </p>
                                        )}
                                        {rev.createdAt && (
                                            <p className="text-[9px] font-bold text-slate-400">
                                                {new Date(rev.createdAt).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Pagination for Reviews */}
                        {reviewsTotalPages > 1 && (
                            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                                <span className="text-[10px] font-bold text-slate-400">
                                    Page {reviewsPage} of {reviewsTotalPages}
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        disabled={reviewsPage === 1 || reviewsLoading}
                                        onClick={() => handleReviewsPageChange(reviewsPage - 1)}
                                        className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-30 hover:bg-slate-50"
                                    >
                                        <FaChevronLeft size={10} />
                                    </button>
                                    <button
                                        disabled={reviewsPage === reviewsTotalPages || reviewsLoading}
                                        onClick={() => handleReviewsPageChange(reviewsPage + 1)}
                                        className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-30 hover:bg-slate-50"
                                    >
                                        <FaChevronRight size={10} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Modal Close Button */}
                        <button
                            onClick={() => setSelectedAmbulanceForReviews(null)}
                            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-black uppercase tracking-wider"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
}