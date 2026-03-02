import React, { useState, useMemo } from "react";
import {
    FaSearch, FaFilter, FaStar, FaAmbulance,
    FaTimes, FaArrowRight, FaMapMarkerAlt, FaPhoneAlt, FaChevronRight
} from "react-icons/fa";

// 1. DATA OBJECT (Easy to manage backend later)
const AMBULANCE_DATA = [
    { id: 1, name: "Cardiac Care ALS", type: "ALS", vendor: "LifeLine Services", price: 1500, distance: 2.5, rating: 5, image: "https://images.unsplash.com/photo-1587748801476-6218d60ad48c?auto=format&fit=crop&w=400&q=80" },
    { id: 2, name: "Basic Life Support", type: "BLS", vendor: "City Response", price: 800, distance: 4.2, rating: 4, image: "https://images.unsplash.com/photo-1599700403969-f77b3aa74837?auto=format&fit=crop&w=400&q=80" },
    { id: 3, name: "Patient Transport", type: "PTV", vendor: "Health Transit", price: 500, distance: 1.1, rating: 3, image: "https://images.unsplash.com/photo-1612994370726-5d4d609fca1b?auto=format&fit=crop&w=400&q=80" },
    { id: 4, name: "Neonatal Care", type: "NNA", vendor: "Baby Safe", price: 2500, distance: 12.0, rating: 5, image: "https://images.unsplash.com/photo-1587748801476-6218d60ad48c?auto=format&fit=crop&w=400&q=80" },
    { id: 5, name: "Advanced ALS Unit", type: "ALS", vendor: "Prime Rescue", price: 1800, distance: 3.8, rating: 4, image: "https://images.unsplash.com/photo-1599700403969-f77b3aa74837?auto=format&fit=crop&w=400&q=80" },
    { id: 6, name: "Standard BLS", type: "BLS", vendor: "Metro Aid", price: 900, distance: 5.5, rating: 4, image: "https://images.unsplash.com/photo-1612994370726-5d4d609fca1b?auto=format&fit=crop&w=400&q=80" },
    { id: 7, name: "Express PTV", type: "PTV", vendor: "FastCare", price: 600, distance: 0.5, rating: 5, image: "https://images.unsplash.com/photo-1587748801476-6218d60ad48c?auto=format&fit=crop&w=400&q=80" },
    { id: 8, name: "Regional NNA", type: "NNA", vendor: "Kids First", price: 2200, distance: 15.2, rating: 4, image: "https://images.unsplash.com/photo-1599700403969-f77b3aa74837?auto=format&fit=crop&w=400&q=80" },
];

const categories = [
    { id: "ALS", label: "ALS", img: "https://cdn-icons-png.flaticon.com/512/1032/1032989.png" },
    { id: "BLS", label: "BLS", img: "https://cdn-icons-png.flaticon.com/512/1032/1032989.png" },
    { id: "PTV", label: "PTV", img: "https://cdn-icons-png.flaticon.com/512/1032/1032989.png" },
    { id: "NNA", label: "NNA", img: "https://cdn-icons-png.flaticon.com/512/1032/1032989.png" },
];

function FindEmergencyAmbulance() {
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("recommended");
    const [showAll, setShowAll] = useState(false);

    // SEARCH & SORT LOGIC
    const processedAmbulances = useMemo(() => {
        let filtered = AMBULANCE_DATA.filter((item) =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.vendor.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (sortBy === "price-low") return [...filtered].sort((a, b) => a.price - b.price);
        if (sortBy === "distance") return [...filtered].sort((a, b) => a.distance - b.distance);
        if (sortBy === "rating") return [...filtered].sort((a, b) => b.rating - a.rating);

        return filtered;
    }, [searchTerm, sortBy]);

    // Handle Visibility
    const visibleItems = showAll ? processedAmbulances : processedAmbulances.slice(0, 6);
    const hasMore = processedAmbulances.length > 6;

    return (
        <div className="min-h-screen py-8 md:py-16 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">

                {/* LEFT SECTION: STICKY SEARCH */}
                <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-35 h-fit">
                    <div className="border-l-4 border-[#08B36A] pl-6 space-y-4">
                        <h4 className="text-[#08B36A] font-black uppercase tracking-widest text-xs">BOOK AMBULANCE</h4>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-tight">
                            Find Emergency <br /> Ambulance! 🚑
                        </h1>
                        <p className="text-xl font-bold text-slate-700 uppercase tracking-tighter">24*7 Service Available</p>
                    </div>

                    <p className="text-slate-600 text-base md:text-lg leading-relaxed max-w-xl">
                        Reliable emergency response at your fingertips. We connect you with
                        the nearest available ALS, BLS, and specialized medical transport units.
                    </p>

                    {/* Type Categories icons */}
                    <div className="grid grid-cols-4 gap-4 max-w-sm">
                        {categories.map((cat) => (
                            <div key={cat.id} className="flex flex-col items-center gap-2 group cursor-pointer">
                                <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center group-hover:border-[#08B36A] transition-all">
                                    <img src={cat.img} alt={cat.label} className="w-8 h-8 object-contain" />
                                </div>
                                <span className="text-xs font-black text-slate-800">{cat.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* SEARCH BOX */}
                    <div className="space-y-4 max-w-md">
                        <label className="text-[#08B36A] font-black text-xs uppercase tracking-widest">Find Ambulance In Your City..</label>
                        <div className="relative group">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#08B36A] transition-colors" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search Emergency Ambulance"
                                className="w-full pl-12 pr-12 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:ring-2 focus:ring-[#08B36A] focus:border-transparent outline-none transition-all shadow-sm text-lg"
                            />
                            {searchTerm && (
                                <FaTimes className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-red-500 cursor-pointer" onClick={() => setSearchTerm("")} />
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT SECTION: RESULTS */}
                <div className="lg:col-span-7 space-y-6">
                    {/* SORT HEADER */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm gap-4">
                        <p className="text-slate-700 font-bold">
                            <span className="text-blue-600">{processedAmbulances.length} Emergency Ambulance</span> Found(s)
                        </p>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <FaFilter className="text-[#08B36A]" />
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full sm:w-auto bg-slate-50 border-none text-sm font-bold text-slate-700 py-2 pl-3 pr-8 rounded-xl focus:ring-2 focus:ring-[#08B36A] cursor-pointer"
                            >
                                <option value="recommended">Sort: Recommended</option>
                                <option value="distance">Sort: Nearest First</option>
                                <option value="price-low">Sort: Price Low to High</option>
                                <option value="rating">Sort: Top Rated</option>
                            </select>
                        </div>
                    </div>

                    {/* LISTING CARDS */}
                    <div className="space-y-6">
                        {visibleItems.length > 0 ? (
                            <>
                                {visibleItems.map((item) => (
                                    <div key={item.id} className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] p-4 sm:p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                                        <div className="flex flex-col sm:flex-row gap-6">
                                            {/* Image Area */}
                                            <div className="w-full sm:w-40 md:w-48 h-48 sm:h-40 md:h-48 flex-shrink-0 relative overflow-hidden rounded-2xl md:rounded-3xl bg-slate-50">
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-0.5 rounded-lg text-[9px] font-black shadow-lg animate-pulse">EMERGENCY</div>
                                            </div>

                                            {/* Content Area */}
                                            <div className="flex-1 flex flex-col justify-between">
                                                <div>
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h3 className="text-xl md:text-2xl font-black text-slate-800 group-hover:text-[#08B36A] transition-colors">{item.name}</h3>
                                                            <p className="text-[#08B36A] font-bold text-xs uppercase tracking-widest">{item.vendor}</p>
                                                        </div>
                                                        <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                                                            <FaStar className="text-yellow-400 text-xs" />
                                                            <span className="text-xs font-black text-yellow-700">{item.rating}.0</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap gap-3 mt-4">
                                                        <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                                            <FaAmbulance className="text-[#08B36A]" /> Type: {item.type}
                                                        </span>
                                                        <span className="bg-emerald-50 text-[#08B36A] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                                            <FaMapMarkerAlt /> {item.distance}km away
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between pt-6 mt-4 border-t border-slate-50">
                                                    <div>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase">Estimated Fare</p>
                                                        <p className="text-2xl font-black text-slate-900">₹{item.price}</p>
                                                    </div>
                                                    <button className="bg-[#08B36A] hover:bg-slate-900 text-white font-black px-8 py-3 rounded-xl transition-all shadow-lg shadow-[#08B36A]/20 active:scale-95 flex items-center gap-2 text-sm">
                                                        BOOK NOW <FaChevronRight className="text-[10px]" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* SEE ALL LOGIC */}
                                {hasMore && (
                                    <div className="pt-6 text-center">
                                        <button
                                            onClick={() => setShowAll(!showAll)}
                                            className="inline-flex items-center gap-2 bg-white text-[#08B36A] border-2 border-[#08B36A] font-black px-10 py-4 rounded-2xl hover:bg-[#08B36A] hover:text-white transition-all shadow-lg active:scale-95 group"
                                        >
                                            {showAll ? "Show Less" : "See All Ambulances"}
                                            <FaArrowRight className={`group-hover:translate-x-1 transition-transform ${showAll ? 'rotate-90' : ''}`} />
                                        </button>
                                        <p className="text-slate-400 text-[10px] mt-3 font-bold uppercase tracking-widest">
                                            Currently viewing {visibleItems.length} of {processedAmbulances.length} units
                                        </p>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="bg-white p-20 rounded-[3rem] border-2 border-dashed border-slate-200 text-center">
                                <FaAmbulance className="mx-auto text-6xl text-slate-200 mb-4" />
                                <h3 className="text-xl font-bold text-slate-800">No Ambulances Available</h3>
                                <button onClick={() => setSearchTerm("")} className="mt-4 text-[#08B36A] font-bold underline">Reset search</button>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}

export default FindEmergencyAmbulance;