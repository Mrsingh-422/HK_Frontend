import { useRouter } from "next/navigation";
import React, { useState, useMemo } from "react";
import {
    FaStar, FaFilter, FaSearch, FaMapMarkerAlt,
    FaPhoneAlt, FaChevronRight, FaHospital, FaTimes, FaArrowRight
} from "react-icons/fa";
import { HOSPITAL_DATA } from "@/app/constants/constants";

function FindHospital() {
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("recommended");

    const router = useRouter()

    // SEARCH & SORT LOGIC
    const processedHospitals = useMemo(() => {
        let filtered = HOSPITAL_DATA.filter((item) =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.address.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (sortBy === "distance") return [...filtered].sort((a, b) => a.distance - b.distance);
        if (sortBy === "rating") return [...filtered].sort((a, b) => b.rating - a.rating);

        return filtered;
    }, [searchTerm, sortBy]);

    // Handle Visibility Limit (6 hospitals)
    const hasMore = processedHospitals.length > 6;

    return (
        <div className="min-h-screen py-8 md:py-16 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">

                {/* LEFT SECTION: HERO & SEARCH (Sticky on Desktop) */}
                <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-35 h-fit">
                    <div className="border-l-4 border-[#08B36A] pl-5 md:pl-6 space-y-3 md:space-y-4">
                        <h4 className="text-[#08B36A] font-black uppercase tracking-widest text-[10px] sm:text-xs">
                            BOOK HOSPITAL
                        </h4>
                        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-tight">
                            Find Hospital! 👩‍⚕️
                        </h1>
                        <p className="text-base sm:text-xl font-bold text-slate-700 leading-tight">
                            A doctor who saves life of the patients by his service
                        </p>
                    </div>

                    <p className="text-slate-600 text-sm sm:text-base md:text-lg leading-relaxed max-w-xl">
                        Locate the best medical facilities near you. We provide verified
                        information about hospitals, including distance, patient ratings, and direct booking services.
                    </p>

                    {/* SEARCH BOX */}
                    <div className="space-y-4 max-w-md">
                        <label className="text-[#08B36A] font-black text-[11px] uppercase tracking-[0.2em]">Find in Hospitals In Your City..</label>
                        <div className="relative group">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#08B36A] transition-colors" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Find Your Specialist.."
                                className="w-full pl-11 pr-11 py-3.5 sm:py-4 bg-white border-2 border-slate-100 rounded-2xl focus:ring-2 focus:ring-[#08B36A] focus:border-transparent outline-none transition-all shadow-sm text-sm sm:text-base"
                            />
                            {searchTerm && (
                                <FaTimes
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-red-500 cursor-pointer"
                                    onClick={() => setSearchTerm("")}
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT SECTION: RESULTS */}
                <div className="lg:col-span-7 space-y-6">

                    {/* SORT HEADER BAR */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm gap-4">
                        <p className="text-slate-700 font-bold text-sm sm:text-base">
                            <span className="text-blue-600">{processedHospitals.length} This Hospital Find Us</span> Found(s)
                        </p>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <FaFilter className="text-[#08B36A]" />
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full sm:w-auto bg-slate-50 border-none text-[11px] sm:text-xs font-black text-slate-700 py-2 pl-3 pr-8 rounded-xl focus:ring-2 focus:ring-[#08B36A] cursor-pointer uppercase tracking-widest"
                            >
                                <option value="recommended">Recommended</option>
                                <option value="distance">Nearest First</option>
                                <option value="rating">Highest Rated</option>
                            </select>
                        </div>
                    </div>

                    {/* LISTING CARDS */}
                    <div className="space-y-4 md:space-y-6">
                        {processedHospitals.length > 6 ? (
                            <>
                                {processedHospitals.slice(0, 6).map((hospital) => (
                                    <div key={hospital.id} className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] p-4 sm:p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group">
                                        <div className="flex flex-col sm:flex-row gap-5 md:gap-8">

                                            {/* Image Area */}
                                            <div className="w-full sm:w-36 md:w-48 h-40 sm:h-36 md:h-48 flex-shrink-0 overflow-hidden rounded-2xl md:rounded-[2rem] bg-slate-100">
                                                <img
                                                    src={hospital.image}
                                                    alt={hospital.name}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                            </div>

                                            {/* Info Area */}
                                            <div className="flex-1 flex flex-col justify-between py-1">
                                                <div>
                                                    <div className="flex justify-between items-start">
                                                        <h3 className="text-xl md:text-2xl font-black text-slate-800 group-hover:text-[#08B36A] transition-colors">{hospital.name}</h3>
                                                        <div className="flex text-yellow-400 gap-0.5">
                                                            {[...Array(5)].map((_, i) => (
                                                                <FaStar key={i} className={i < hospital.rating ? "fill-current" : "text-slate-200"} />
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <p className="text-slate-400 font-medium text-sm mt-1 mb-4">{hospital.address}</p>

                                                    <div className="flex items-center gap-2 text-[#08B36A] font-black text-[10px] md:text-xs uppercase tracking-widest">
                                                        <FaMapMarkerAlt /> {hospital.distance} km away
                                                    </div>
                                                </div>

                                                {/* Action Row */}
                                                <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-50">
                                                    <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-50 text-[#08B36A] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#08B36A] hover:text-white transition-all shadow-sm">
                                                        <FaPhoneAlt className="text-sm md:text-base" />
                                                    </div>

                                                    <button className="bg-[#08B36A] hover:bg-slate-900 text-white font-black px-6 md:px-10 py-2.5 md:py-3.5 rounded-xl transition-all shadow-lg shadow-[#08B36A]/20 active:scale-95 uppercase tracking-widest text-[10px] md:text-xs">
                                                        Book Now
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* CONDITIONAL SEE ALL BUTTON */}
                                {hasMore && (
                                    <div className="pt-6 text-center">
                                        <button
                                            onClick={() => router.push("/hospital/seeallhospitals")}
                                            className="inline-flex items-center gap-3 bg-white text-[#08B36A] border-2 border-[#08B36A] font-black px-12 py-4 rounded-2xl hover:bg-[#08B36A] hover:text-white transition-all shadow-lg active:scale-95 group"
                                        >
                                            See All Hospitals <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                                        </button>
                                        <p className="text-slate-400 text-[10px] font-bold mt-4 uppercase tracking-widest">
                                            Showing 6 of {processedHospitals.length} available partners
                                        </p>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="bg-white p-20 rounded-[2.5rem] border-2 border-dashed border-slate-200 text-center">
                                <FaHospital className="mx-auto text-6xl text-slate-200 mb-4" />
                                <h3 className="text-xl font-bold text-slate-800">No Hospitals Found</h3>
                                <p className="text-slate-500 mt-1">Try searching for a different city or name.</p>
                                <button onClick={() => setSearchTerm("")} className="mt-6 text-[#08B36A] font-bold underline">Reset search</button>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}

export default FindHospital;