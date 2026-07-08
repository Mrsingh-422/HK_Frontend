"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  FaSearch, FaStar, FaHandHoldingHeart, FaUserMd,
  FaCheckCircle, FaCloudUploadAlt, FaFilePrescription, FaTimesCircle, FaMapMarkerAlt, FaBriefcase, FaSpinner
} from "react-icons/fa";
import { useGlobalContext } from "@/app/context/GlobalContext";
import Link from "next/link";
import UserAPI from "@/app/services/UserAPI"; // Adjust path as needed

const STATIC_FALLBACK = {
  headerTag: "Professional Home Healthcare",
  mainTitle: "Expert Nursing Care \nin Your Own Home.",
  description: "Skip the hospital stay. Access certified nursing professionals for personalized recovery, elderly care, and post-op assistance.",
  searchPlaceholder: "Try searching 'Wound Care' or 'Aman'..."
};

const NurseHero = () => {
  const router = useRouter();
  const { getNursePageData } = useGlobalContext();
  const dropdownRef = useRef(null);

  // Component Internal State
  const [pageData, setPageData] = useState(STATIC_FALLBACK);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState({ suggestions: [], providers: [], services: [] });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // 1. Fetch Dynamic Page Content
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await getNursePageData();
        if (res?.success && res?.data) setPageData(res.data);
      } catch (err) {
        console.error("NurseHero: API Fetch failed, using fallback.");
      }
    };
    fetchContent();
  }, [getNursePageData]);

  // 2. Fetch Suggestions Logic
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.trim().length > 2) {
        setIsSearching(true);
        try {
          const res = await UserAPI.getNurseSearchSuggestions(searchTerm);
          if (res.success) {
            setSuggestions(res.data);
            setShowSuggestions(true);
          }
        } catch (err) {
          console.error("Suggestions fetch failed", err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSuggestions({ suggestions: [], providers: [], services: [] });
        setShowSuggestions(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // 3. Handle Click Outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchNavigation = (customQuery = null) => {
    const finalQuery = typeof customQuery === 'string' ? customQuery : searchTerm;
    if (finalQuery.trim()) {
      router.push(`/nursingservice/seeallnurses?search=${encodeURIComponent(finalQuery)}`);
    } else {
      router.push(`/nursingservice/seeallnurses`);
    }
    setShowSuggestions(false);
  };

  const handleSelectProvider = (id) => {
    router.push(`/nursingservice/nurseservicedetail/${id}`);
    setShowSuggestions(false);
  };

  return (
    <section className="relative pt-8 sm:pt-12 pb-0 sm:pb-0 lg:pt-20 lg:pb-32 px-4 sm:px-6 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[60%] sm:w-[40%] h-[60%] bg-teal-50/50 rounded-full blur-[80px] sm:blur-[120px]" />
        <div className="absolute bottom-0 left-[-5%] w-[50%] sm:w-[30%] h-[40%] bg-indigo-50/50 rounded-full blur-[80px] sm:blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

        {/* LEFT CONTENT */}
        <div className="lg:col-span-7 space-y-6 sm:space-y-8">
          <div className="flex flex-col space-y-3 sm:space-y-4">
            <div className="inline-flex items-center gap-2 w-fit px-3 py-1 rounded-full bg-white border border-teal-100 shadow-sm">
              <span className="flex h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse" />
              <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-teal-600">
                {pageData.headerTag}
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight whitespace-pre-line">
              {pageData.mainTitle}
            </h1>
          </div>

          <p className="text-base sm:text-lg lg:text-xl text-slate-500 max-w-2xl leading-relaxed">
            {pageData.description}
          </p>

          <div className="relative max-w-2xl space-y-4" ref={dropdownRef}>
            <div className="bg-white rounded-2xl sm:rounded-[2.5rem] p-1.5 sm:p-2 shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-slate-100 flex flex-col md:flex-row items-center gap-1 sm:gap-2 relative z-50">
              <div className="relative flex-1 w-full group">
                <FaSearch className="absolute left-5 sm:left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-teal-500 transition-colors" />
                <input
                  type="text"
                  placeholder={pageData.searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchNavigation()}
                  onFocus={() => searchTerm.length > 2 && setShowSuggestions(true)}
                  className="w-full pl-12 sm:pl-14 pr-4 sm:pr-6 py-4 sm:py-5 bg-transparent outline-none font-medium text-slate-700 placeholder:text-slate-300 text-sm sm:text-base"
                />
                {isSearching && <FaSpinner className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-teal-500" />}
              </div>
              <button
                onClick={handleSearchNavigation}
                className="w-full md:w-auto bg-slate-900 text-white px-8 py-4 sm:px-10 sm:py-5 rounded-xl sm:rounded-[2rem] font-bold hover:bg-teal-600 transition-all shadow-lg active:scale-95 text-sm sm:text-base"
              >
                Find Nurse
              </button>
            </div>

            {/* SUGGESTIONS DROPDOWN */}
            {showSuggestions && (
              <div className="absolute top-full left-0 w-full bg-white mt-4 rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="max-h-[450px] overflow-y-auto p-4 custom-scrollbar">
                  
                  {/* Text Suggestions */}
                  {suggestions.suggestions?.length > 0 && (
                    <div className="mb-6">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-3">Quick Suggestions</p>
                      <div className="flex flex-wrap gap-2 px-2">
                        {suggestions.suggestions.map((s, i) => (
                          <button 
                            key={i} 
                            onClick={() => handleSearchNavigation(s)}
                            className="bg-slate-50 hover:bg-teal-50 hover:text-teal-600 px-4 py-2 rounded-full text-sm font-bold text-slate-600 transition-all border border-slate-100"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Provider Results */}
                  {suggestions.providers?.length > 0 && (
                    <div className="mb-6">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-3">Care Providers</p>
                      <div className="space-y-2">
                        {suggestions.providers.map((p) => (
                          <div 
                            key={p._id} 
                            onClick={() => handleSelectProvider(p._id)}
                            className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-2xl cursor-pointer transition-all group"
                          >
                            <img src={p.profileImage} className="w-12 h-12 rounded-xl object-cover border border-slate-100" alt={p.name} />
                            <div className="flex-1">
                              <h6 className="text-sm font-black text-slate-800 group-hover:text-teal-600">{p.name}</h6>
                              <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400">
                                <span className="flex items-center gap-1"><FaMapMarkerAlt /> {p.city}</span>
                                <span className="flex items-center gap-1"><FaBriefcase /> {p.experienceYears} Yrs Exp</span>
                              </div>
                            </div>
                            <div className="bg-amber-50 text-amber-600 px-2 py-1 rounded-lg text-[10px] font-black flex items-center gap-1">
                              <FaStar /> {p.rating}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Services Results */}
                  {suggestions.services?.length > 0 && (
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-3">Specific Services</p>
                      <div className="space-y-2">
                        {suggestions.services.map((s) => (
                          <div 
                            key={s._id} 
                            onClick={() => handleSearchNavigation(s.title)}
                            className="flex items-center justify-between p-4 bg-teal-50/30 hover:bg-teal-50 rounded-2xl cursor-pointer transition-all border border-teal-50"
                          >
                            <div>
                              <h6 className="text-sm font-black text-teal-700">{s.title}</h6>
                              <p className="text-[10px] font-bold text-teal-600/60 uppercase">{s.type}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-black text-slate-900">₹{s.pricing.oneDay.final}</p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase">Per Day</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Empty State */}
                  {searchTerm.length > 2 && !isSearching && 
                   suggestions.suggestions.length === 0 && 
                   suggestions.providers.length === 0 && 
                   suggestions.services.length === 0 && (
                    <div className="p-8 text-center">
                      <FaTimesCircle className="mx-auto text-slate-200 text-3xl mb-2" />
                      <p className="text-slate-400 font-bold">No exact matches for "{searchTerm}"</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <Link href="/nursingservice/prescriptionnurse" className="flex flex-col sm:flex-row items-center gap-3">
              <button className="w-full sm:w-auto flex items-center justify-center gap-3 bg-teal-50 text-teal-700 border border-teal-200 px-6 py-3.5 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl font-bold hover:bg-teal-100 transition-all active:scale-95 text-sm" >
                <FaCloudUploadAlt className="text-lg sm:text-xl" />
                {"Upload Prescription"}
              </button>
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map(i => (
                <img key={i} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 sm:border-4 border-white shadow-sm" src={`https://i.pravatar.cc/150?u=${i + 20}`} alt="user" />
              ))}
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 sm:border-4 border-white bg-teal-500 flex items-center justify-center text-white text-[8px] sm:text-[10px] font-bold shadow-sm">+5k</div>
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-500">Trusted by <span className="text-slate-900 font-black">5,000+ families</span></p>
          </div>
        </div>

        {/* RIGHT SIDE: IMAGE */}
        <div className="hidden lg:block lg:col-span-5 relative">
          <div className="relative z-10 bg-white p-4 rounded-[3.5rem] shadow-2xl border border-slate-50">
            <img
              src="https://img.freepik.com/free-photo/healthcare-workers-preventing-virus-quarantine-campaign-concept-cheerful-friendly-asian-female-physician-doctor-with-clipboard-daily-checkup-standing-white-background_1258-107867.jpg?semt=ais_hybrid&w=740&q=80"
              alt="Nursing Care"
              className="rounded-[2.5rem] w-full h-[500px] object-cover"
            />
            {/* Overlay Badges */}
            <div className="absolute top-12 -left-8 bg-white/90 backdrop-blur-md p-5 rounded-3xl shadow-xl border border-white/50 flex items-center gap-4 animate-bounce-slow">
              <div className="w-12 h-12 bg-teal-500 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg shadow-teal-200">
                <FaHandHoldingHeart />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">Response Time</p>
                <p className="text-xl font-black text-slate-900">Under 20 Min</p>
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 bg-slate-900 p-6 rounded-[2.5rem] shadow-2xl text-white">
              <div className="flex items-center gap-4">
                <div className="text-3xl font-black">4.9</div>
                <div className="h-8 w-px bg-white/20" />
                <div>
                  <div className="flex text-amber-400 text-xs"><FaStar /><FaStar /><FaStar /><FaStar /><FaStar /></div>
                  <p className="text-[10px] font-bold uppercase opacity-60">Avg. Care Rating</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .animate-bounce-slow { animation: bounce-slow 4s ease-in-out infinite; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </section>
  );
};

export default NurseHero;