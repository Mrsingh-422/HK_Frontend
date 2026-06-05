"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { FaSearch, FaCheckCircle, FaUserMd, FaChevronRight, FaTimes } from "react-icons/fa";
import UserAPI from "@/app/services/UserAPI";

export default function LandingFindDoctor() {
  const router = useRouter();
  const searchRef = useRef(null);

  // --- SEARCH STATES ---
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

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
    <div className="bg-white text-slate-900 font-sans selection:bg-emerald-100 flex flex-col justify-center items-center w-full">

      {/* HERO SECTION */}
      <section className="relative w-full pt-20 pb-28 md:pt-24 md:pb-36 px-6 overflow-hidden bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-50/40 via-white to-white border-b border-slate-50">
        <div className="max-w-7xl mx-auto text-center relative z-10">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-widest mb-6 border border-emerald-100/70">
            <FaCheckCircle className="animate-pulse text-emerald-500" /> Verified Medical Network
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6 leading-[1.15] text-slate-900">
            Your health journey <br />
            <span className="text-emerald-600 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              starts with the right expert.
            </span>
          </h1>

          {/* Sub-description */}
          <p className="text-base md:text-lg text-slate-500 max-w-xl mx-auto leading-relaxed">
            Connect with India's top-rated certified specialists for video consultations
            or in-person clinic visits. Secure, fast, and reliable.
          </p>
        </div>

        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 blur-[100px] rounded-full -mr-48 -mt-48 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/5 blur-[100px] rounded-full -ml-48 -mb-48 pointer-events-none"></div>
      </section>

      {/* FLOATING SEARCH CONTAINER */}
      <section className="w-full max-w-7xl px-6 relative z-20 -mt-14 md:-mt-16 mb-16">
        <div className="max-w-3xl mx-auto relative" ref={searchRef}>

          {/* Main Search Bar Card */}
          <div className="bg-white rounded-2xl md:rounded-3xl p-2.5 shadow-[0_20px_50px_-12px_rgba(16,185,129,0.15)] border border-slate-100 flex flex-col md:flex-row items-center gap-2 transition-all duration-300 hover:shadow-[0_25px_60px_-10px_rgba(16,185,129,0.22)]">
            <div className="relative flex-1 w-full group">
              <FaSearch className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors duration-300 text-lg ${isSearching ? 'text-emerald-500 animate-pulse' : 'text-slate-400 group-focus-within:text-emerald-500'}`} />
              <input
                type="text"
                placeholder="Search by specialty or doctor name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full pl-13 pr-10 py-4 bg-transparent outline-none font-medium text-slate-700 placeholder-slate-400 text-base rounded-2xl"
              />
              {searchTerm && (
                <button
                  onClick={() => { setSearchTerm(""); setSuggestions([]); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-300 hover:text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  <FaTimes className="text-sm" />
                </button>
              )}
            </div>

            <button
              onClick={handleSearch}
              className="w-full md:w-auto bg-slate-900 text-white px-8 py-4 rounded-xl md:rounded-2xl font-bold hover:bg-emerald-600 transition-all duration-200 active:scale-[0.98] shadow-md hover:shadow-emerald-200 uppercase tracking-wider text-xs whitespace-nowrap min-h-[52px]"
            >
              Search Doctors
            </button>
          </div>

          {/* SUGGESTIONS DROPDOWN */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.2)] border border-slate-100 overflow-hidden z-[100] transform transition-all duration-200 origin-top scale-100 opacity-100">
              <div className="p-2 max-h-[380px] overflow-y-auto custom-scrollbar">
                <p className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">
                  Available Specialists
                </p>
                <div className="mt-1 space-y-0.5">
                  {suggestions.map((doctor) => (
                    <div
                      key={doctor.id}
                      onClick={() => handleSuggestionClick(doctor)}
                      className="flex items-center gap-4 px-4 py-3 cursor-pointer rounded-xl transition-all duration-150 hover:bg-emerald-50/70 group"
                    >
                      <div className="h-11 w-11 rounded-lg bg-slate-50 overflow-hidden flex items-center justify-center shrink-0 border border-slate-100 group-hover:border-emerald-200 transition-colors">
                        {doctor.image ? (
                          <img src={doctor.image} alt={doctor.title} className="h-full w-full object-cover" />
                        ) : (
                          <FaUserMd className="text-lg text-emerald-600" />
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <h4 className="text-sm font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">
                          {doctor.title}
                        </h4>
                        <p className="text-xs text-slate-400 font-medium line-clamp-1">{doctor.subtitle}</p>
                      </div>
                      <FaChevronRight className="text-slate-300 text-xs transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-emerald-600" />
                    </div>
                  ))}
                </div>
              </div>

              <div
                className="bg-slate-50/80 px-4 py-3 text-center cursor-pointer hover:bg-emerald-50 border-t border-slate-100 transition-colors duration-150"
                onClick={handleSearch}
              >
                <span className="text-xs font-bold text-emerald-700 tracking-wide flex items-center justify-center gap-1">
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