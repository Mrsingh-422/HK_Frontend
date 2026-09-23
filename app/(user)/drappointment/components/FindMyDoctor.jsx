"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { FaSearch, FaCheckCircle, FaUserMd, FaChevronRight, FaTimes } from "react-icons/fa";
import UserAPI from "@/app/services/UserAPI";

// Curated Single HD Doctor Photos (Framed for clear top/head portraits)
const heroPhotos = [
  "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1594824813501-4475e07663c0?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=1600&auto=format&fit=crop"
];

export default function LandingFindDoctor() {
  const router = useRouter();
  const searchRef = useRef(null);

  // --- BACKGROUND SLIDESHOW STATE ---
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  // --- SEARCH STATES ---
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Auto-switch background photo every 4.5 seconds
  useEffect(() => {
    const photoTimer = setInterval(() => {
      setCurrentPhotoIndex((prev) => (prev + 1) % heroPhotos.length);
    }, 4500);

    return () => clearInterval(photoTimer);
  }, []);

  // --- SEARCH LOGIC (Debounced) ---
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.length >= 2) {
        fetchDoctorSuggestions();
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const fetchDoctorSuggestions = async () => {
    setIsSearching(true);
    try {
      const res = await UserAPI.getGlobalSearchSuggestions(searchTerm, "doctor");
      if (res.success) {
        setSuggestions(res.data);
        setShowSuggestions(true);
      }
    } catch (err) {
      console.error("Doctor search error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = () => {
    if (searchTerm.trim() !== "") {
      router.push(`/drappointment/seealldoctors?query=${encodeURIComponent(searchTerm)}`);
    } else {
      router.push("/drappointment/seealldoctors");
    }
  };

  const handleSuggestionClick = (item) => {
    setSearchTerm(item.title);
    setShowSuggestions(false);
    router.push(`/drappointment/doctordetail/${item.id}`);
  };

  return (
    <div className="bg-slate-900 text-slate-900 font-sans selection:bg-emerald-100 flex flex-col justify-center items-center w-full relative overflow-hidden">

      {/* HERO SECTION WITH TOP-ALIGNED BACKGROUND PHOTO SLIDESHOW */}
      <section className="relative w-full min-h-[580px] md:min-h-[660px] pt-24 pb-32 md:pt-32 md:pb-44 px-6 flex flex-col items-center justify-center overflow-hidden">

        {/* --- FULL-SIZE BACKGROUND PHOTOS WITH OBJECT-TOP (HEADS NOT CUT) --- */}
        {heroPhotos.map((photoUrl, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 z-0 transition-opacity duration-1000 ease-in-out ${
              currentPhotoIndex === idx ? "opacity-90 scale-100" : "opacity-0 scale-105"
            } transform transition-transform duration-[6000ms] pointer-events-none`}
          >
            <img
              src={photoUrl}
              alt="Specialist Doctor"
              className="w-full h-full object-cover object-top"
            />
          </div>
        ))}

        {/* --- SMART GRADIENT OVERLAY (KEEPS PHOTO TOP VISIBLE WHILE PROVIDING HIGH CONTRAST) --- */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/50 via-black/35 to-slate-900/90 pointer-events-none" />
        <div className="absolute inset-0 z-[2] bg-radial from-transparent via-black/20 to-black/75 pointer-events-none" />

        {/* --- FOREGROUND HERO CONTENT --- */}
        <div className="max-w-4xl mx-auto text-center relative z-10">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/20 backdrop-blur-md text-emerald-300 text-xs font-black uppercase tracking-widest mb-6 border border-white/20 shadow-2xl">
            <FaCheckCircle className="text-emerald-400 animate-pulse" /> Verified Medical Network
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight mb-6 leading-[1.1] text-white drop-shadow-lg">
            Your health journey <br />
            <span className="text-emerald-400 bg-gradient-to-r from-emerald-300 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
              starts with the right expert.
            </span>
          </h1>

          {/* Sub-description */}
          <p className="text-base sm:text-lg md:text-xl text-slate-100 max-w-2xl mx-auto leading-relaxed font-bold drop-shadow-md">
            Connect with India's top-rated certified specialists for video consultations
            or in-person clinic visits. Secure, fast, and reliable.
          </p>

          {/* Slideshow Progress Dots */}
          <div className="flex justify-center items-center gap-2.5 mt-8">
            {heroPhotos.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPhotoIndex(i)}
                className={`h-2 rounded-full transition-all duration-500 ${
                  currentPhotoIndex === i ? "w-8 bg-emerald-400 shadow-md shadow-emerald-400/50" : "w-2 bg-white/40 hover:bg-white/70"
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* FLOATING SEARCH CONTAINER */}
      <section className="w-full max-w-7xl px-6 relative z-20 -mt-16 md:-mt-20 mb-20">
        <div className="max-w-3xl mx-auto relative" ref={searchRef}>

          {/* Main Search Bar Card */}
          <div className="bg-white rounded-3xl p-3 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] border border-slate-100 flex flex-col md:flex-row items-center gap-3 transition-all duration-300 hover:shadow-[0_30px_70px_-10px_rgba(16,185,129,0.35)]">
            <div className="relative flex-1 w-full group">
              <FaSearch className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors duration-300 text-lg ${isSearching ? 'text-emerald-500 animate-pulse' : 'text-slate-400 group-focus-within:text-emerald-500'}`} />
              <input
                type="text"
                placeholder="Search by specialty or doctor name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full pl-13 pr-10 py-4 bg-transparent outline-none font-bold text-slate-800 placeholder-slate-400 text-base rounded-2xl"
              />
              {searchTerm && (
                <button
                  onClick={() => { setSearchTerm(""); setSuggestions([]); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-slate-300 hover:text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  <FaTimes className="text-sm" />
                </button>
              )}
            </div>

            <button
              onClick={handleSearch}
              className="w-full md:w-auto bg-emerald-600 text-white px-9 py-4.5 rounded-2xl font-black hover:bg-emerald-500 transition-all duration-200 active:scale-[0.98] shadow-xl hover:shadow-emerald-500/30 uppercase tracking-widest text-xs whitespace-nowrap min-h-[56px]"
            >
              Search Doctors
            </button>
          </div>

          {/* SUGGESTIONS DROPDOWN */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white rounded-3xl shadow-[0_30px_70px_-15px_rgba(0,0,0,0.3)] border border-slate-100 overflow-hidden z-[100] transform transition-all duration-200 origin-top scale-100 opacity-100">
              <div className="p-3 max-h-[380px] overflow-y-auto custom-scrollbar">
                <p className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  Available Specialists
                </p>
                <div className="mt-1 space-y-1">
                  {suggestions.map((doctor) => (
                    <div
                      key={doctor.id}
                      onClick={() => handleSuggestionClick(doctor)}
                      className="flex items-center gap-4 px-4 py-3 cursor-pointer rounded-2xl transition-all duration-150 hover:bg-emerald-50 group"
                    >
                      <div className="h-12 w-12 rounded-xl bg-slate-50 overflow-hidden flex items-center justify-center shrink-0 border border-slate-200 group-hover:border-emerald-300 transition-colors">
                        {doctor.image ? (
                          <img src={doctor.image} alt={doctor.title} className="h-full w-full object-cover" />
                        ) : (
                          <FaUserMd className="text-xl text-emerald-600" />
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                          {doctor.title}
                        </h4>
                        <p className="text-xs text-slate-500 font-medium line-clamp-1">{doctor.subtitle}</p>
                      </div>
                      <FaChevronRight className="text-slate-300 text-xs transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-emerald-600" />
                    </div>
                  ))}
                </div>
              </div>

              <div
                className="bg-slate-50 px-4 py-3 text-center cursor-pointer hover:bg-emerald-100/50 border-t border-slate-100 transition-colors duration-150"
                onClick={handleSearch}
              >
                <span className="text-xs font-black text-emerald-700 tracking-wider uppercase flex items-center justify-center gap-1">
                  View All Matching Doctors <FaChevronRight className="text-[10px]" />
                </span>
              </div>
            </div>
          )}

        </div>
      </section>

    </div>
  );
}