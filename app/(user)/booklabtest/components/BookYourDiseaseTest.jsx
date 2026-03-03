import React, { useState, useMemo } from "react";
import {
  FaFlask, FaStar, FaFilter, FaSearch, FaMicroscope,
  FaCheckCircle, FaTimes, FaInbox, FaMapMarkerAlt, FaSortAmountDown, FaArrowRight
} from "react-icons/fa";

// 1. DATA OBJECT (Easily replaceable with Backend API)
const INITIAL_PACKAGES = [
  { id: 1, name: "Diabetes Advanced Package", vendor: "Nitish Diagnostic Center", price: "₹21,167", discountPrice: "₹18,500", priceValue: 18500, image: "https://images.unsplash.com/photo-1581595219315-a187dd40c322?auto=format&fit=crop&w=400&q=80", rating: 5, distance: 1.2, tests: "Includes 64 Parameters" },
  { id: 2, name: "Basic Diabetes Test", vendor: "Nitish Lab Services", price: "₹999", discountPrice: "₹0", priceValue: 0, image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80", rating: 3, distance: 5.4, tests: "Includes 12 Parameters" },
  { id: 3, name: "Full Body Checkup", vendor: "HealthCare Plus", price: "₹5,000", discountPrice: "₹2,999", priceValue: 2999, image: "https://images.unsplash.com/photo-1579152276503-6058d9488e9d?auto=format&fit=crop&w=400&q=80", rating: 4, distance: 3.2, tests: "Includes 80 Parameters" },
  { id: 4, name: "Thyroid Profile Total", vendor: "City Diagnostics", price: "₹1,200", discountPrice: "₹799", priceValue: 799, image: "https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&w=400&q=80", rating: 5, distance: 0.8, tests: "T3, T4, TSH" },
  { id: 5, name: "Heart Health Silver", vendor: "Apollo Reach", price: "₹4,500", discountPrice: "₹3,200", priceValue: 3200, image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=400&q=80", rating: 4, distance: 2.1, tests: "ECG, Lipid Profile" },
  { id: 6, name: "Kidney Function Test", vendor: "Metro Labs", price: "₹1,500", discountPrice: "₹1,100", priceValue: 1100, image: "https://images.unsplash.com/photo-1579165466541-71812a45814a?auto=format&fit=crop&w=400&q=80", rating: 4, distance: 6.0, tests: "Urea, Creatinine" },
  { id: 7, name: "Vitamin D Deficiency", vendor: "Nitish Diagnostic Center", price: "₹1,200", discountPrice: "₹800", priceValue: 800, image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80", rating: 5, distance: 1.2, tests: "Vitamin D3 (25-OH)" },
  { id: 8, name: "Liver Profile", vendor: "City Diagnostics", price: "₹1,800", discountPrice: "₹1,400", priceValue: 1400, image: "https://images.unsplash.com/photo-1532187863486-abf9d39d6618?auto=format&fit=crop&w=400&q=80", rating: 3, distance: 0.8, tests: "SGOT, SGPT, Bilirubin" },
];

function BookYourDiseaseTest() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("recommended");

  // 2. SEARCH & SORT LOGIC
  const processedPackages = useMemo(() => {
    // A. Filter logic (Search by name, vendor, or test type)
    let result = INITIAL_PACKAGES.filter((pkg) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        pkg.name.toLowerCase().includes(searchLower) ||
        pkg.vendor.toLowerCase().includes(searchLower) ||
        pkg.tests.toLowerCase().includes(searchLower)
      );
    });

    // B. Sort logic
    result.sort((a, b) => {
      if (sortBy === "price-low") return a.priceValue - b.priceValue;
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "nearby") return a.distance - b.distance;
      return 0; // default
    });

    return result;
  }, [searchTerm, sortBy]);

  // 3. PAGINATION / VISIBILITY LOGIC
  const visibleItems = processedPackages.slice(0, 6);
  const hasMore = processedPackages.length > 6;

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 font-sans selection:bg-[#08B36A]/10">
      <div className="max-w-7xl mx-auto">
        
        {/* Main Grid: Mobile (1 Col) | Tablet/Desktop (2 Col) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-16 items-start">

          {/* LEFT SIDE: HERO & SEARCH (Sticky) */}
          <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-35 h-fit">
            <div className="border-l-4 border-[#08B36A] pl-5 md:pl-6 space-y-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black bg-[#08B36A]/10 text-[#08B36A] uppercase tracking-widest">
                <FaMicroscope className="mr-2" /> 100% Verified Labs
              </span>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-tight">
                Search Test By <span className="text-[#08B36A] italic">Habits!</span>{" "}
                <FaFlask className="inline text-[#08B36A] animate-bounce" />
              </h1>
              <p className="text-slate-600 text-sm sm:text-base md:text-lg leading-relaxed max-w-xl">
                Compare diagnostic centers instantly. Find the most convenient, 
                highly-rated, and affordable labs for your needs.
              </p>
            </div>

            {/* SEARCH INPUT */}
            <div className="space-y-4 max-w-md">
              <label className="text-[#08B36A] font-black text-xs uppercase tracking-widest">Find your diagnostics..</label>
              <div className="relative group">
                <FaSearch className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${searchTerm ? 'text-[#08B36A]' : 'text-slate-400'}`} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Blood test, Thyroid, Lab name..."
                  className="w-full pl-12 pr-12 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:ring-2 focus:ring-[#08B36A] focus:border-transparent outline-none transition-all shadow-sm text-sm sm:text-base"
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-red-500 transition-colors">
                    <FaTimes />
                  </button>
                )}
              </div>
            </div>

            {/* Trust Stats */}
            <div className="flex gap-8 pt-4 border-t border-slate-200">
              <div>
                <p className="text-2xl font-black text-slate-800 tracking-tighter">4.9/5</p>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">User Rating</p>
              </div>
              <div className="w-px h-10 bg-slate-200"></div>
              <div>
                <p className="text-2xl font-black text-slate-800 tracking-tighter">2hr</p>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Report Delivery</p>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: LISTINGS & SORTING */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* RESULTS HEADER & SORT DROPDOWN */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm gap-4">
              <p className="text-slate-700 font-bold text-sm sm:text-base">
                Found <span className="text-[#08B36A] font-black">{processedPackages.length} Packages</span> matching search
              </p>
              
              <div className="flex items-center gap-2 w-full sm:w-auto bg-slate-50 p-1 px-3 rounded-xl border border-slate-100">
                <FaSortAmountDown className="text-[#08B36A] text-xs" />
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent border-none text-[11px] sm:text-xs font-black text-slate-700 py-2 outline-none cursor-pointer uppercase tracking-widest"
                >
                  <option value="recommended">Recommended</option>
                  <option value="nearby">Nearest First</option>
                  <option value="rating">Top Rated</option>
                  <option value="price-low">Budget Friendly</option>
                </select>
              </div>
            </div>

            {/* PACKAGE LISTING CARDS */}
            <div className="space-y-6">
              {visibleItems.length > 0 ? (
                <>
                  {visibleItems.map((pkg) => (
                    <div key={pkg.id} className="bg-white rounded-[2rem] p-4 sm:p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:border-[#08B36A]/20 transition-all duration-300 group">
                      <div className="flex flex-col sm:flex-row gap-6">
                        {/* Image Container */}
                        <div className="w-full sm:w-44 h-44 flex-shrink-0 relative overflow-hidden rounded-3xl bg-slate-50">
                          <img src={pkg.image} alt={pkg.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                          <div className="absolute top-3 left-3 bg-[#08B36A] text-white px-2 py-0.5 rounded-lg text-[10px] font-black shadow-lg">VERIFIED</div>
                          <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm text-[#08B36A] px-2 py-1 rounded-lg text-[9px] font-black flex items-center shadow-md">
                             <FaMapMarkerAlt className="mr-1" /> {pkg.distance}km
                          </div>
                        </div>

                        {/* Info Content */}
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-[10px] font-black text-[#08B36A] uppercase tracking-widest px-2 py-0.5 bg-[#08B36A]/5 rounded-md">
                                {pkg.vendor}
                              </span>
                              <div className="flex items-center gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <FaStar key={i} className={i < pkg.rating ? "text-yellow-400 text-[10px]" : "text-slate-200 text-[10px]"} />
                                ))}
                              </div>
                            </div>
                            
                            <h3 className="text-xl md:text-2xl font-black text-slate-800 leading-tight group-hover:text-[#08B36A] transition-colors">{pkg.name}</h3>
                            
                            <div className="flex flex-wrap gap-2 mt-4">
                              <span className="bg-slate-50 text-slate-500 border border-slate-100 px-3 py-1 rounded-full text-[10px] font-bold flex items-center">
                                <FaCheckCircle className="text-[#08B36A] mr-1.5" /> {pkg.tests}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-50">
                            <div>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Total Price</p>
                              <div className="flex items-baseline gap-2">
                                <p className="text-2xl font-black text-slate-900">{pkg.discountPrice === "₹0" ? "FREE" : pkg.discountPrice}</p>
                                {pkg.discountPrice !== pkg.price && <span className="text-xs text-slate-400 line-through">{pkg.price}</span>}
                              </div>
                            </div>
                            
                            <button className="bg-[#08B36A] hover:bg-slate-900 text-white font-black px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-[#08B36A]/10 active:scale-95 text-xs uppercase tracking-widest">
                               Book Now
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* SEE ALL BUTTON */}
                  {hasMore && (
                    <div className="pt-6 text-center">
                      <button 
                        onClick={() => alert("Navigating to full listings...")}
                        className="inline-flex items-center gap-3 bg-white text-[#08B36A] border-2 border-[#08B36A] font-black px-12 py-4 rounded-2xl hover:bg-[#08B36A] hover:text-white transition-all shadow-lg active:scale-95 group"
                      >
                        See All Packages <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                /* EMPTY STATE */
                <div className="bg-white p-20 rounded-[3rem] border-2 border-dashed border-slate-200 text-center">
                  <FaInbox className="mx-auto text-6xl text-slate-200 mb-4" />
                  <h3 className="text-xl font-bold text-slate-800 uppercase tracking-widest">No matches found</h3>
                  <button onClick={() => setSearchTerm("")} className="mt-4 text-[#08B36A] font-black underline text-sm tracking-widest">Clear Search</button>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default BookYourDiseaseTest;