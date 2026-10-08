"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  FaSearch, FaStar, FaHandHoldingHeart,
  FaCloudUploadAlt, FaTimesCircle, FaSpinner,
  FaSyringe, FaBuilding, FaChevronRight, FaShieldAlt, FaUserCheck
} from "react-icons/fa";
import { useGlobalContext } from "@/app/context/GlobalContext";
import Link from "next/link";
import UserAPI from "@/app/services/UserAPI";

// 4 High-Resolution Professional Nurse Portraits
const NURSE_PHOTOS = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1594824813576-a192f15b5f25?auto=format&fit=crop&w=1400&h=1800&q=90",
    tag: "Certified Clinical Care",
    alt: "Certified Nurse Care"
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=1400&h=1800&q=90",
    tag: "Bedside & Elder Support",
    alt: "Elderly & Bedside Nurse"
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1400&h=1800&q=90",
    tag: "Post-Surgical Dressing",
    alt: "Post-Op Wound Nurse"
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1400&h=1800&q=90",
    tag: "IV Therapy & Injections",
    alt: "IV & Injections Care"
  }
];

const NurseHero = () => {
  const router = useRouter();
  const dropdownRef = useRef(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [suggestionsList, setSuggestionsList] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Auto-Rotating Multi-Photo Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % NURSE_PHOTOS.length);
    }, 4500);

    return () => clearInterval(slideInterval);
  }, []);

  // Fetch Suggestions
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.trim().length > 1) {
        setIsSearching(true);
        try {
          const res = await UserAPI.getNurseSearchSuggestions(searchTerm);
          if (res?.success) {
            setSuggestionsList(res.data || []);
            setShowSuggestions(true);
          }
        } catch (err) {
          console.error("Suggestions fetch failed", err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSuggestionsList([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // Click outside to close suggestions
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
    const finalQuery = typeof customQuery === "string" ? customQuery : searchTerm;
    if (finalQuery.trim()) {
      router.push(`/nursingservice/seeallservices?search=${encodeURIComponent(finalQuery)}`);
    } else {
      router.push(`/nursingservice/seeallservices`);
    }
    setShowSuggestions(false);
  };

  const handleSelectService = (service) => {
    const targetTitle = service.subCategory || service.title;
    router.push(`/nursingservice/providers?serviceId=${service.id || service._id}&subCategory=${encodeURIComponent(targetTitle)}`);
    setShowSuggestions(false);
  };

  const handleSelectProvider = (providerId) => {
    router.push(`/nursingservice/nurseservicedetail/${providerId}`);
    setShowSuggestions(false);
  };

  const serviceResults = suggestionsList.filter((item) => item.type === "Service");
  const providerResults = suggestionsList.filter((item) => item.type === "Provider");

  return (
    <section className="relative pt-6 sm:pt-10 pb-16 lg:pt-14 lg:pb-28 px-4 sm:px-8 max-w-7xl mx-auto bg-white font-sans overflow-visible z-30">
      
      {/* Subtle Background Ambient Glows */}
      <div className="absolute top-1/4 right-5 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-10 left-10 w-80 h-80 bg-teal-50/50 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
        
        {/* ========================================================= */}
        {/* LEFT COLUMN: HERO CONTENT & SEARCH BAR                   */}
        {/* ========================================================= */}
        <div className="lg:col-span-6 space-y-7 sm:space-y-8 relative z-40">
          
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-emerald-50/90 border border-emerald-200/80 shadow-xs">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#08B36A]"></span>
            </span>
            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-[#08B36A]">
              VERIFIED HOME NURSING CARE
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-slate-950 tracking-tight leading-[1.1]">
            Find My <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
              Nurse!
            </span>{" "}
            <span className="inline-block transform hover:rotate-12 transition-transform duration-300">👩‍⚕️</span>
          </h1>

          {/* Description */}
          <p className="text-base sm:text-lg text-slate-600 font-medium max-w-lg leading-relaxed">
            Reliable, certified, and compassionate nursing care delivered at your doorstep. Verified background checks and fast on-demand booking.
          </p>

          {/* Search Box & Dropdown */}
          <div className="relative max-w-xl space-y-4 z-50" ref={dropdownRef}>
            
            {/* Main Pill Search Input */}
            <div className="bg-white rounded-full p-2 pl-6 shadow-[0_12px_40px_rgba(0,0,0,0.08)] border border-slate-200/90 flex items-center justify-between gap-3 focus-within:ring-2 focus-within:ring-[#08B36A]/20 transition-all">
              <div className="flex items-center gap-3.5 flex-1 min-w-0">
                <FaSearch className="text-slate-400 text-base shrink-0" />
                <input
                  type="text"
                  placeholder="Search homecare services, injections, post-op..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearchNavigation()}
                  onFocus={() => searchTerm.length > 1 && setShowSuggestions(true)}
                  className="w-full bg-transparent outline-none font-semibold text-slate-800 placeholder:text-slate-400 text-sm sm:text-base"
                />
                {isSearching && <FaSpinner className="animate-spin text-[#08B36A] text-sm shrink-0" />}
              </div>

              <button
                onClick={() => handleSearchNavigation()}
                className="bg-[#0B132B] hover:bg-slate-900 text-white px-7 sm:px-8 py-3.5 sm:py-4 rounded-full font-bold text-sm tracking-tight transition-all cursor-pointer shrink-0 shadow-md hover:shadow-lg active:scale-95"
              >
                Find Services
              </button>
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && (
              <div className="absolute top-full left-0 w-full bg-white mt-2.5 rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.22)] border border-slate-100 overflow-hidden z-[9999] animate-in fade-in duration-150">
                <div className="max-h-[380px] overflow-y-auto p-3.5 space-y-3 custom-scrollbar">
                  
                  {serviceResults.length > 0 && (
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-2 mb-1.5 flex items-center gap-1.5">
                        <FaSyringe className="text-[#08B36A]" /> Clinical Services
                      </p>
                      <div className="space-y-1">
                        {serviceResults.map((s) => (
                          <div
                            key={s.id || s._id}
                            onClick={() => handleSelectService(s)}
                            className="flex items-center justify-between p-3 hover:bg-emerald-50/50 rounded-2xl cursor-pointer transition-colors"
                          >
                            <div>
                              <h6 className="text-sm font-bold text-slate-800">{s.title}</h6>
                              <p className="text-[11px] text-slate-400 font-medium">{s.subtitle || s.category}</p>
                            </div>
                            <FaChevronRight size={10} className="text-slate-300" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {providerResults.length > 0 && (
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-2 mb-1.5 flex items-center gap-1.5">
                        <FaBuilding className="text-blue-500" /> Verified Nursing Bureaus
                      </p>
                      <div className="space-y-1">
                        {providerResults.map((p) => (
                          <div
                            key={p.id || p._id}
                            onClick={() => handleSelectProvider(p.id || p._id)}
                            className="flex items-center gap-3 p-2.5 hover:bg-slate-50 rounded-2xl cursor-pointer transition-colors"
                          >
                            <img src={p.image || NURSE_PHOTOS[0].image} className="w-10 h-10 rounded-xl object-cover border" alt={p.title} />
                            <div className="flex-1 min-w-0">
                              <h6 className="text-sm font-bold text-slate-800 truncate">{p.title}</h6>
                              <p className="text-[10px] text-slate-400 truncate">{p.subtitle}</p>
                            </div>
                            <FaChevronRight size={10} className="text-slate-300" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchTerm.length > 1 && !isSearching && suggestionsList.length === 0 && (
                    <div className="p-6 text-center text-xs font-semibold text-slate-400">
                      No matching nursing services found for "{searchTerm}"
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Upload Prescription Button */}
            <div className="pt-1">
              <Link href="/nursingservice/prescriptionnurse">
                <button className="flex items-center gap-2.5 bg-slate-50 hover:bg-emerald-50 text-slate-800 hover:text-emerald-900 border border-slate-200 hover:border-emerald-200 px-6 py-3 rounded-2xl font-bold text-xs tracking-tight transition-all cursor-pointer shadow-xs active:scale-95">
                  <FaCloudUploadAlt className="text-base text-[#08B36A]" />
                  <span>Upload Doctor's Prescription</span>
                </button>
              </Link>
            </div>

          </div>

          {/* Social Proof Stats */}
          <div className="flex items-center gap-4 pt-2">
            <div className="flex -space-x-2.5">
              <img className="w-9 h-9 rounded-full border-2 border-white object-cover shadow-xs" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80" alt="Patient" />
              <img className="w-9 h-9 rounded-full border-2 border-white object-cover shadow-xs" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80" alt="Patient" />
              <img className="w-9 h-9 rounded-full border-2 border-white object-cover shadow-xs" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80" alt="Patient" />
              <img className="w-9 h-9 rounded-full border-2 border-white object-cover shadow-xs" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80" alt="Patient" />
              <div className="w-9 h-9 rounded-full border-2 border-white bg-[#08B36A] text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                +5k
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">
                Trusted by <strong className="text-slate-900 font-bold">5,000+ families</strong>
              </p>
              <p className="text-[10px] text-[#08B36A] font-bold flex items-center gap-1">
                <FaShieldAlt size={9} /> 100% Background Verified
              </p>
            </div>
          </div>

        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: EXPANDED NURSE HERO CAROUSEL               */}
        {/* ========================================================= */}
        <div className="lg:col-span-6 relative flex justify-center lg:justify-end z-10">
          
          {/* Main Card Frame with Enlarged Dimensions */}
          <div className="relative w-full max-w-[500px] sm:max-w-[540px] lg:max-w-[560px] rounded-[3.2rem] p-3 sm:p-4 bg-white border border-slate-200/80 shadow-[0_25px_70px_rgba(0,0,0,0.09)]">
            
            {/* FLOATING TOP-LEFT BADGE: RESPONSE TIME */}
            <div className="absolute -top-4 -left-3 sm:-left-6 z-30 bg-white/95 backdrop-blur-md rounded-2xl p-3 sm:p-3.5 px-4 sm:px-5 shadow-[0_15px_35px_rgba(0,0,0,0.1)] border border-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-500/20">
                <FaHandHoldingHeart size={18} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">
                    ACTIVE RESPONSE
                  </span>
                </div>
                <p className="text-sm font-black text-slate-900 leading-tight">
                  Under 60 Mins
                </p>
              </div>
            </div>

            {/* EXPANDED NURSE PHOTO FRAME */}
            <div className="relative w-full h-[540px] sm:h-[600px] lg:h-[660px] rounded-[2.6rem] overflow-hidden bg-slate-100">
              
              {NURSE_PHOTOS.map((slide, idx) => {
                const isActive = idx === currentSlide;
                return (
                  <div
                    key={slide.id}
                    className={`absolute inset-0 w-full h-full transition-all duration-1000 ease-in-out ${
                      isActive ? "opacity-100 scale-100 z-10" : "opacity-0 scale-105 z-0 pointer-events-none"
                    }`}
                  >
                    <img
                      src={slide.image}
                      alt={slide.alt}
                      className="w-full h-full object-cover object-[center_15%]"
                    />
                    
                    {/* Inner Subtle Vignette Gradient for Depth */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" />

                    {/* Service Category Tag on Image */}
                    <div className="absolute top-5 right-5 z-20">
                      <span className="bg-black/40 backdrop-blur-md text-white border border-white/20 text-[11px] font-bold px-3.5 py-1.5 rounded-full tracking-wide">
                        {slide.tag}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* CAROUSEL PROGRESS PILLS (CLICKABLE) */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                {NURSE_PHOTOS.map((_, dotIdx) => (
                  <button
                    key={dotIdx}
                    onClick={() => setCurrentSlide(dotIdx)}
                    aria-label={`Go to slide ${dotIdx + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                      currentSlide === dotIdx ? "w-6 bg-[#08B36A]" : "w-1.5 bg-white/60 hover:bg-white"
                    }`}
                  />
                ))}
              </div>

            </div>

            {/* FLOATING BOTTOM-RIGHT BADGE: RATINGS & TRUST */}
            <div className="absolute -bottom-5 -right-3 sm:-right-5 z-30 bg-[#0B132B] text-white rounded-2xl p-3 sm:p-3.5 px-5 shadow-[0_20px_40px_rgba(11,19,43,0.35)] flex items-center gap-3.5 border border-slate-800">
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                4.9
              </span>
              <div className="border-l border-white/20 pl-3.5">
                <div className="flex items-center gap-1 text-amber-400 text-xs">
                  <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
                </div>
                <span className="text-[8px] font-black tracking-widest text-slate-300 uppercase block mt-1">
                  1,200+ REVIEWS
                </span>
              </div>
            </div>

          </div>

        </div>

      </div>

    </section>
  );
};

export default NurseHero;