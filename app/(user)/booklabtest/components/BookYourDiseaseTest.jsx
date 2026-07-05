"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  FaFlask, FaStar, FaSearch, FaMicroscope, FaCheckCircle,
  FaArrowRight, FaShieldAlt, FaClock, FaVials, FaFileAlt, FaTimes, FaChevronRight, FaFileMedical
} from "react-icons/fa";
import UserAPI from "@/app/services/UserAPI";

function BookYourDiseaseTest() {
  const router = useRouter();
  const searchRef = useRef(null);

  // --- COMPONENT STATES ---
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  const [activeCategory, setActiveCategory] = useState("All");
  const [labTests, setLabTests] = useState([]);
  const [loading, setLoading] = useState(true);

  const [pageData] = useState({
    miniTitle: "NABL & ISO CERTIFIED",
    mainTitle: "Precision Diagnostics, At Your Doorstep",
    description: "Experience hassle-free lab testing with 100% accurate results and certified professionals.",
    searchLabel: "Search for tests, packages or symptoms..."
  });

  const STATIC_TEST_IMAGES = [
    "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=500&q=80",
    "https://bridgehealth.in/images/new-website/radiology/lab-test-bg.webp",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSvpgUkk1fJT4QjY3o_AK2ZzrhV9YF9RNu6Xw&s",
    "https://plus.unsplash.com/premium_photo-1663011253265-9b5cb2b5ac92?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8bGFiJTIwdGVzdHxlbnwwfHwwfHx8MA%3D%3D"
  ];

  // --- SEARCH LOGIC (Suggestions) ---
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.length >= 2) {
        fetchLabSuggestions();
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const fetchLabSuggestions = async () => {
    setIsSearching(true);
    try {
      const res = await UserAPI.getGlobalSearchSuggestions(searchTerm, "labprovider");
      if (res.success) {
        setSuggestions(res.data);
        setShowSuggestions(true);
      }
    } catch (err) {
      console.error("Suggestion error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleManualSearch = () => {
    if (searchTerm.trim() !== "") {
      router.push(`/booklabtest/seealltests?query=${encodeURIComponent(searchTerm)}`);
    }
  };

  const handleSuggestionClick = (item) => {
    setSearchTerm(item.title);
    setShowSuggestions(false);
    router.push(`/booklabtest/singlelabdetal/${item.id}`);
  };

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchTests = async () => {
      try {
        setLoading(true);
        const res = await UserAPI.getStandardTestCatalog();
        if (res?.success) setLabTests(res.data);
      } catch (error) {
        console.error("Error fetching lab tests:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTests();
  }, []);

  const filteredPackages = useMemo(() => {
    return labTests.filter((pkg) => {
      const matchesSearch = pkg.testName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === "All" ||
        pkg.mainCategory === activeCategory ||
        pkg.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, activeCategory, labTests]);

  const handleSeeAll = () => {
    sessionStorage.setItem("allTestPackages", JSON.stringify(labTests));
    router.push("/booklabtest/seealltests");
  };

  const getDisplayData = (pkg, index) => ({
    id: pkg._id,
    name: pkg.testName,
    vendor: `${pkg.vendorCount} Verified Labs`,
    price: `₹${pkg.standardMRP}`,
    discountPrice: `₹${pkg.minPrice}`,
    category: pkg.mainCategory,
    image: STATIC_TEST_IMAGES[index % 4],
    rating: 4.8,
    tests: `${pkg.parameters?.length || 0} Parameters`,
    isTrending: pkg.vendorCount > 2
  });
  
  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 font-sans text-slate-900 overflow-x-hidden flex flex-col items-center">

      {/* --- 1. HERO SECTION --- */}
      <section className="relative w-full bg-[#08B36A] pt-12 pb-24 sm:pb-32 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}></div>

        <div className="max-w-7xl mx-auto relative z-10 grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          
          {/* Left Text Block */}
          <div className="text-white space-y-4 sm:space-y-6 text-center lg:text-left">
            <span className="inline-flex items-center gap-2 bg-black/15 border border-white/20 px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest">
              <FaShieldAlt className="text-emerald-300 animate-pulse" /> {pageData.miniTitle}
            </span>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black leading-tight sm:leading-[1.15] drop-shadow-sm">
              {pageData.mainTitle}
            </h1>
            <p className="text-emerald-50 text-sm sm:text-base lg:text-lg max-w-xl mx-auto lg:mx-0 font-medium opacity-90">
              {pageData.description}
            </p>
          </div>

          {/* Right Column: AI Prescription Onboarding Panel (New Interactive CTA Card) */}
          <div className="flex justify-center lg:justify-end">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 sm:p-8 rounded-[2rem] shadow-xl text-white space-y-4 max-w-md w-full lg:ml-auto">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-300">
                  <FaFileMedical size={18} />
                </div>
                <div>
                  <h3 className="font-black text-sm sm:text-base tracking-wide uppercase">Have a Prescription?</h3>
                  <p className="text-[10px] sm:text-xs text-emerald-100 font-medium">Automatic medicine & test detection</p>
                </div>
              </div>
              <p className="text-xs text-emerald-50 leading-relaxed font-semibold">
                Upload your doctor's prescription image, and our AI scanner will automatically verify your diagnostic test list.
              </p>
              <button 
                onClick={() => router.push('/booklabtest/prescriptionorder')}
                className="w-full py-4 bg-white text-[#08B36A] hover:bg-slate-900 hover:text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                Upload Prescription <FaArrowRight size={10} />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* --- FLOATING SEARCH CONTAINER --- */}
      <section className="w-full max-w-7xl px-4 relative z-30 -mt-10 sm:-mt-14">
        <div className="max-w-2xl mx-auto relative" ref={searchRef}>
          <div className="bg-white rounded-2xl p-2 sm:p-2.5 shadow-[0_25px_55px_-10px_rgba(4,120,87,0.22)] border border-emerald-100 flex flex-col sm:flex-row items-center gap-2 transition-all duration-300 hover:shadow-[0_30px_65px_-5px_rgba(4,120,87,0.3)]">
            <div className="relative flex-1 w-full group">
              <FaSearch className={`absolute left-5 top-1/2 -translate-y-1/2 z-20 text-base transition-colors duration-300 ${isSearching ? 'text-emerald-500 animate-pulse' : 'text-slate-400 group-focus-within:text-emerald-500'}`} />
              <input
                type="text"
                placeholder={pageData.searchLabel}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleManualSearch()}
                className="w-full pl-12 pr-10 py-4 rounded-xl bg-transparent text-slate-800 outline-none text-sm sm:text-base font-bold placeholder-slate-400"
              />
              {searchTerm && (
                <button 
                  onClick={() => {setSearchTerm(""); setSuggestions([]);}}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-300 hover:text-slate-500 hover:bg-slate-100 z-20 transition-colors"
                >
                  <FaTimes className="text-xs" />
                </button>
              )}
            </div>
            
            <button
              onClick={handleManualSearch}
              className="w-full sm:w-auto bg-slate-900 text-white px-8 py-4 rounded-xl font-black text-xs uppercase tracking-wider whitespace-nowrap shadow-md hover:bg-[#08B36A] transition-all active:scale-[0.98]"
            >
              Search Tests
            </button>
          </div>

          {/* SEARCH SUGGESTIONS DROPDOWN */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.25)] border border-slate-100 overflow-hidden z-[100] transform transition-all duration-200 origin-top">
              <div className="max-h-[350px] overflow-y-auto p-2">
                <p className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                  Recommended Tests & Labs
                </p>
                <div className="mt-1 space-y-0.5">
                  {suggestions.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleSuggestionClick(item)}
                      className="flex items-center gap-4 px-4 py-3 cursor-pointer rounded-xl hover:bg-emerald-50/60 group transition-all duration-150"
                    >
                      <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 border border-emerald-100/50 group-hover:bg-white transition-colors">
                        {item.type === "Lab Test" ? <FaFlask /> : <FaMicroscope />}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">{item.title}</p>
                        <p className="text-[10px] text-slate-400 font-semibold line-clamp-1">{item.subtitle}</p>
                      </div>
                      <FaChevronRight className="text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all text-xs" />
                    </div>
                  ))}
                </div>
              </div>
              <div 
                className="bg-slate-50/80 p-3 text-center text-[10px] font-black text-emerald-700 border-t border-slate-100 cursor-pointer hover:bg-emerald-50 transition-colors"
                onClick={handleManualSearch}
              >
                VIEW ALL RESULTS FOR "{searchTerm.toUpperCase()}"
              </div>
            </div>
          )}
        </div>
      </section>

      {/* --- 2. THE PROCESS BAR --- */}
      <div className="w-full max-w-7xl mx-auto px-4 mt-8 relative z-20">
        <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-4 sm:p-6 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="flex items-center gap-3 md:border-r border-slate-100 last:border-none">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-[#08B36A] shrink-0"><FaSearch className="text-sm" /></div>
            <div><h4 className="font-black text-[10px] sm:text-xs uppercase text-slate-800">1. Search</h4><p className="text-[9px] text-slate-400 font-bold">Pick your test</p></div>
          </div>
          <div className="flex items-center gap-3 md:border-r border-slate-100 last:border-none">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-[#08B36A] shrink-0"><FaClock className="text-sm" /></div>
            <div><h4 className="font-black text-[10px] sm:text-xs uppercase text-slate-800">2. Book</h4><p className="text-[9px] text-slate-400 font-bold">Select slot</p></div>
          </div>
          <div className="flex items-center gap-3 md:border-r border-slate-100 last:border-none">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-[#08B36A] shrink-0"><FaVials className="text-sm" /></div>
            <div><h4 className="font-black text-[10px] sm:text-xs uppercase text-slate-800">3. Sample</h4><p className="text-[9px] text-slate-400 font-bold">Home pickup</p></div>
          </div>
          <div className="flex items-center gap-3 last:border-none">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-[#08B36A] shrink-0"><FaFileAlt className="text-sm" /></div>
            <div><h4 className="font-black text-[10px] sm:text-xs uppercase text-slate-800">4. Reports</h4><p className="text-[9px] text-slate-400 font-bold">Within 24h</p></div>
          </div>
        </div>
      </div>

      <main className="w-full max-w-7xl mx-auto px-4 mt-12 sm:mt-20 space-y-16 sm:space-y-24">
        {/* --- CATEGORY NAV --- */}
        <section>
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 uppercase tracking-tight">Browse by Category</h2>
            <button onClick={handleSeeAll} className="text-[#08B36A] font-black text-[10px] sm:text-xs uppercase hover:underline">See All</button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
            {["All", "Women", "Radiology", "Heart", "Diabetes", "Full Body"].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex items-center gap-3 px-8 py-3 rounded-full font-black text-[10px] sm:text-xs transition-all border-2 whitespace-nowrap
                  ${activeCategory === cat ? 'bg-slate-900 border-slate-900 text-white shadow-md' : 'bg-white border-slate-100 text-slate-500 hover:border-[#08B36A]'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* --- PRODUCT GRID --- */}
        <section>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 sm:mb-10 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-800 uppercase leading-none">Popular Lab Tests</h2>
              <p className="text-[#08B36A] font-bold text-[10px] sm:text-xs mt-2 uppercase tracking-widest">Verified by NABL Labs</p>
            </div>
            <button onClick={handleSeeAll} className="text-slate-400 font-black text-[10px] sm:text-xs uppercase hover:text-[#08B36A] flex items-center gap-2">Explore Full Inventory <FaArrowRight /></button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredPackages.slice(0, 4).map((test, index) => {
              const display = getDisplayData(test, index);
              return (
                <div 
                  key={display.id} 
                  onClick={() => router.push(`/booklabtest/testdetails/${display.id}`)} 
                  className="group cursor-pointer bg-white rounded-2xl border border-slate-100 flex flex-col hover:shadow-xl hover:shadow-emerald-950/5 transition-all duration-300 overflow-hidden"
                >
                  <div className="relative aspect-square overflow-hidden bg-slate-50">
                    <img src={display.image} alt={display.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute bottom-2 right-2 bg-white/95 backdrop-blur px-2 py-0.5 rounded-lg text-[9px] font-black flex items-center gap-1 shadow-sm">
                      <FaStar className="text-yellow-400" /> {display.rating}
                    </div>
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <span className="text-[8px] font-black text-[#08B36A] uppercase tracking-tighter mb-1">{display.vendor}</span>
                    <h3 className="text-xs sm:text-sm font-black text-slate-800 line-clamp-2 mb-3 h-9 leading-snug">{display.name}</h3>
                    <div className="text-[9px] text-slate-400 font-bold mb-4 flex items-center gap-1.5">
                      <FaCheckCircle className="text-[#08B36A]" /> {display.tests}
                    </div>
                    <div className="mt-auto pt-3 border-t border-slate-50 flex flex-col gap-2">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-base sm:text-lg font-black text-slate-900">{display.discountPrice}</span>
                        <span className="text-[9px] text-slate-300 line-through font-bold">{display.price}</span>
                      </div>
                      <button className="w-full bg-slate-900 text-white py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-[#08B36A] transition-all">Book Now</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {loading && (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#08B36A]"></div>
            </div>
          )}
        </section>

        {/* --- TRUST FOOTER --- */}
        <section className="bg-white rounded-[2rem] border border-slate-100 p-8 sm:p-16 text-center space-y-4 sm:space-y-6">
          <h3 className="text-2xl sm:text-4xl font-black text-slate-900 leading-tight">Accurate Reports. <br /><span className="text-[#08B36A]">Better Decisions.</span></h3>
          <p className="text-slate-500 max-w-xl mx-auto font-medium text-xs sm:text-base">Don't settle for less. We partner with the top 5% of labs in India to bring you quality diagnostics.</p>
          <button onClick={handleSeeAll} className="bg-[#08B36A] text-white px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-900 shadow-lg transition-colors">View All Available Health Tests</button>
        </section>
      </main>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

export default BookYourDiseaseTest;