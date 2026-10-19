"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  FaSearch, FaCloudUploadAlt, FaSpinner,
  FaSyringe, FaBuilding, FaChevronRight, FaShieldAlt, FaPhoneAlt
} from "react-icons/fa";
import { Clock } from "lucide-react";
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
    <section className="relative min-h-screen bg-white overflow-hidden font-sans">
      {/* Background Decorative Split (Identical to Ambulance Hero) */}
      <div className="absolute top-0 right-0 w-1/2 h-screen bg-slate-50/50 -z-10 hidden lg:block" />

      <div className="pt-8 pb-24 px-4 md:px-6 lg:px-12 max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* ========================================================= */}
          {/* LEFT SIDE: CONTENT                                        */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 flex flex-col space-y-8 md:space-y-10">
            
            <div className="space-y-6">
              {/* Tagline Badge */}
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-full w-fit">
                <span className="flex h-2 w-2 rounded-full bg-[#08B36A] animate-pulse"></span>
                <span className="text-[10px] md:text-xs font-bold tracking-widest uppercase text-emerald-800">
                  VERIFIED HOME NURSING CARE
                </span>
              </div>

              {/* Main Title */}
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight">
                Find My Nurse! <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
                  Reliable Care, Faster.
                </span>{" "}
                <span className="inline-block transform hover:rotate-12 transition-transform duration-300">👩‍⚕️</span>
              </h1>

              {/* Description */}
              <p className="text-base md:text-xl text-slate-500 max-w-2xl font-medium leading-relaxed">
                India's most trusted clinical homecare network. Certified nurses, background-verified caregivers, and hospital-grade procedures at your doorstep.
              </p>
            </div>

            {/* Search Box & Dropdown */}
            <div className="relative max-w-2xl space-y-4 z-40" ref={dropdownRef}>
              
              {/* Main Pill Search Input */}
              <div className="bg-white rounded-full p-2 pl-6 shadow-xl border border-slate-100 flex items-center justify-between gap-3 focus-within:ring-2 focus-within:ring-[#08B36A]/20 transition-all">
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <FaSearch className="text-slate-400 text-base shrink-0" />
                  <input
                    type="text"
                    placeholder="Search homecare services, injections, post-op..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearchNavigation()}
                    onFocus={() => searchTerm.length > 1 && setShowSuggestions(true)}
                    className="w-full bg-transparent outline-none font-semibold text-slate-800 placeholder:text-slate-400 text-sm md:text-base"
                  />
                  {isSearching && <FaSpinner className="animate-spin text-[#08B36A] text-sm shrink-0" />}
                </div>

                <button
                  onClick={() => handleSearchNavigation()}
                  className="bg-slate-900 hover:bg-black text-white px-8 md:px-10 py-3.5 md:py-4 rounded-full font-bold text-sm tracking-tight transition-all cursor-pointer shrink-0 shadow-md active:scale-95"
                >
                  Find Services
                </button>
              </div>

              {/* Suggestions Dropdown */}
              {showSuggestions && (
                <div className="absolute top-full left-0 w-full bg-white mt-2.5 rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-[9999] animate-in fade-in duration-150">
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
            <div className="flex items-center gap-4 pt-1">
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
          {/* RIGHT SIDE: EXACT SAME DESIGN & SIZING AS AMBULANCE HERO  */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 relative mt-10 lg:mt-0">
            
            {/* Main Outer Frame (Exact Dimensions & Border) */}
            <div className="relative rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white">
              
              {/* Photo Carousel Container */}
              <div className="relative w-full h-[400px] md:h-[600px] bg-slate-100">
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
                      
                      {/* Vignette Gradient for Depth */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" />

                      {/* Tag on Image */}
                      <div className="absolute top-6 right-6 z-20">
                        <span className="bg-black/40 backdrop-blur-md text-white border border-white/20 text-[11px] font-bold px-3.5 py-1.5 rounded-full tracking-wide">
                          {slide.tag}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* Carousel Indicator Dots */}
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                  {NURSE_PHOTOS.map((_, dotIdx) => (
                    <button
                      key={dotIdx}
                      onClick={() => setCurrentSlide(dotIdx)}
                      aria-label={`Slide ${dotIdx + 1}`}
                      className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                        currentSlide === dotIdx ? "w-6 bg-[#08B36A]" : "w-1.5 bg-white/60 hover:bg-white"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Floating Top-Left Stats Badge */}
              <div className="absolute top-6 left-6 z-20 bg-white/90 backdrop-blur px-4 py-2 rounded-2xl shadow-sm flex items-center gap-2">
                <div className="bg-green-100 p-1.5 rounded-lg">
                  <Clock className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-xs font-bold text-slate-800">Avg. Response: 12-15m</span>
              </div>
            </div>

            {/* Emergency / Service Contact Float (Identical Structure & Sizing) */}
            <div className="absolute -bottom-8 left-4 right-4 md:left-8 md:right-8 z-30">
              <div className="bg-slate-900 text-white p-6 md:p-8 rounded-[2.5rem] shadow-2xl flex items-center justify-between overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-600/10 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none"></div>

                <div className="flex items-center gap-5 relative z-10">
                  <div className="bg-[#08B36A] p-4 rounded-2xl shadow-lg shadow-emerald-600/30">
                    <FaPhoneAlt className="w-7 h-7 text-white animate-pulse" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 mb-1">CARE HOTLINE</p>
                    <p className="text-2xl md:text-3xl font-black tracking-tighter">1800-NURSE</p>
                  </div>
                </div>

                <div className="hidden sm:block text-right relative z-10">
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] uppercase font-bold text-[#08B36A] mb-1">AVAILABLE NOW</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

export default NurseHero;