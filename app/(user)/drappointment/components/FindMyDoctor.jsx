'use client'

import { useRouter } from "next/navigation";
import React, { useState, useMemo } from "react";
import {
  FaStar, FaFilter, FaSearch, FaMapMarkerAlt,
  FaVideo, FaHospital, FaChevronRight, FaUserMd, FaTimes, FaArrowRight
} from "react-icons/fa";
import { DOCTORS_DATA } from "@/app/constants/constants";
import DoctorDetailsModal from "./otherComponents/DoctorDetailsModal";

function FindMyDoctor() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("recommended");
  const router = useRouter()

  // 2. State management
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeDoctor, setActiveDoctor] = useState(null);

  const handleOpenDoctor = (doctor) => {
    setActiveDoctor(doctor);
    setIsModalOpen(true);
  };

  const processedDoctors = useMemo(() => {
    let filtered = DOCTORS_DATA.filter(doc =>
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return filtered.sort((a, b) => {
      if (sortBy === "price-low") return a.consultFee - b.consultFee;
      if (sortBy === "rating-high") return b.rating - a.rating;
      if (sortBy === "distance-near") return a.distance - b.distance;
      return 0;
    });
  }, [searchTerm, sortBy]);

  const visibleDoctors = processedDoctors.slice(0, 6);
  const hasMore = processedDoctors.length > 6;

  return (
    <div className="min-h-screen py-6 md:py-12 px-4 sm:px-6 lg:px-8 font-sans">
      {/* 3. Add the component once at the bottom of the JSX */}
      <DoctorDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        doctor={activeDoctor}
      />
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

        {/* LEFT SECTION: HERO & SEARCH (Standard block on mobile, sticky on desktop) */}
        <div className="lg:col-span-5 space-y-6 md:space-y-8 lg:sticky lg:top-35 h-fit">
          <div className="border-l-4 border-[#08B36A] pl-4 md:pl-6 space-y-2 md:space-y-4">
            <h4 className="text-[#08B36A] font-black uppercase tracking-widest text-[10px] sm:text-xs">
              Book Your Personal Meeting
            </h4>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-tight">
              Find My <br className="hidden sm:block" /> Doctor! 👩‍⚕️
            </h1>
          </div>

          <p className="text-slate-600 text-sm sm:text-base md:text-lg leading-relaxed max-w-xl">
            Connect with top-rated specialists instantly. We prioritize your health
            by bringing certified medical professionals to your doorstep.
          </p>

          <div className="space-y-3 max-w-md">
            <label className="text-[#08B36A] font-black text-[11px] uppercase tracking-wider">Search Specialist</label>
            <div className="relative group">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#08B36A] transition-colors" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Name or Speciality..."
                className="w-full pl-11 pr-11 py-3.5 bg-white border-2 border-slate-100 rounded-2xl focus:ring-2 focus:ring-[#08B36A] focus:border-transparent outline-none transition-all shadow-sm text-base"
              />
              {searchTerm && <FaTimes className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-red-500 cursor-pointer" onClick={() => setSearchTerm("")} />}
            </div>
          </div>
        </div>

        {/* RIGHT SECTION: DOCTORS LIST */}
        <div className="lg:col-span-7 space-y-6">
          {/* SORT BAR */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm gap-4">
            <p className="text-slate-700 text-sm sm:text-base font-bold">
              Found <span className="text-[#08B36A]">{processedDoctors.length} Specialists</span>
            </p>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <FaFilter className="text-[#08B36A] flex-shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full sm:w-auto bg-slate-50 border-none text-xs sm:text-sm font-bold text-slate-700 py-2 pl-3 pr-8 rounded-xl focus:ring-2 focus:ring-[#08B36A] cursor-pointer"
              >
                <option value="recommended">Recommended</option>
                <option value="distance-near">Nearest</option>
                <option value="rating-high">Highest Rated</option>
                <option value="price-low">Consult Fee</option>
              </select>
            </div>
          </div>

          {/* LISTING */}
          <div className="space-y-6">
            {visibleDoctors.length > 0 ? (
              <>
                {visibleDoctors.map((doc) => (
                  <div key={doc.id} className="bg-white rounded-[1.5rem] md:rounded-[2rem] p-4 sm:p-6 shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 group">
                    <div className="flex flex-col sm:flex-row gap-4 md:gap-8">
                      {/* Image - Responsive height on mobile */}
                      <div className="w-full sm:w-40 md:w-48 h-56 sm:h-40 md:h-48 flex-shrink-0 relative">
                        <img src={doc.image} alt={doc.name} className="w-full h-full object-cover rounded-2xl md:rounded-3xl" />
                        <div className="absolute top-2 left-2 bg-[#08B36A] text-white px-2 py-0.5 rounded-md text-[9px] font-black shadow-lg">VERIFIED</div>
                      </div>

                      {/* Info Content */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <div className="max-w-[70%]">
                              <h3 className="text-xl md:text-2xl font-black text-slate-800 group-hover:text-[#08B36A] transition-colors truncate">{doc.name}</h3>
                              <p className="text-[#08B36A] font-bold text-[10px] md:text-sm uppercase tracking-widest">{doc.specialty}</p>
                            </div>
                            <div className="flex bg-yellow-50 px-1.5 py-0.5 rounded-md">
                              {[...Array(5)].map((_, i) => (
                                <FaStar key={i} className={`${i < doc.rating ? 'text-yellow-400' : 'text-slate-200'} text-[10px] md:text-xs`} />
                              ))}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-y-2 mt-4 text-[11px] md:text-sm">
                            <p className="text-slate-500">Exp: <span className="text-slate-800 font-bold">{doc.experience}</span></p>
                            <p className="text-slate-500">Lang: <span className="text-slate-800 font-bold">{doc.speaks}</span></p>
                            <p className="text-slate-500 col-span-2 flex items-center gap-1">
                              <FaMapMarkerAlt className="text-[#08B36A] flex-shrink-0" /> <span className="truncate">{doc.address}</span>
                              <span className="ml-auto text-[9px] bg-slate-100 px-1.5 py-0.5 rounded-full font-bold">~{doc.distance}km</span>
                            </p>
                          </div>
                        </div>

                        {/* Action Grid - 2 columns on small phone, 2 columns on desktop */}
                        <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-slate-50">
                          <button
                            onClick={() => handleOpenDoctor(doc)}
                            className="bg-[#08B36A] hover:bg-slate-900 text-white py-2.5 rounded-xl transition-all shadow-md flex flex-col items-center justify-center">
                            <span className="text-sm md:text-lg font-black leading-none">₹{doc.consultFee}</span>
                            <span className="text-[8px] md:text-[10px] font-bold uppercase mt-1 opacity-90 truncate px-1 flex items-center gap-1">
                              <FaVideo className="hidden xs:inline" /> Online
                            </span>
                          </button>
                          <button
                            onClick={() => handleOpenDoctor(doc)}
                            className="bg-amber-400 hover:bg-slate-900 hover:text-white text-slate-900 py-2.5 rounded-xl transition-all shadow-md flex flex-col items-center justify-center">
                            <span className="text-sm md:text-lg font-black leading-none">₹{doc.clinicFee}</span>
                            <span className="text-[8px] md:text-[10px] font-bold uppercase mt-1 opacity-90 truncate px-1 flex items-center gap-1">
                              <FaHospital className="hidden xs:inline" /> Clinic
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {hasMore && (
                  <div className="pt-4 text-center">
                    <button
                      onClick={() => router.push("/drappointment/seealldoctors")}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-[#08B36A] border-2 border-[#08B36A] font-black px-10 py-3.5 rounded-2xl hover:bg-[#08B36A] hover:text-white transition-all shadow-lg active:scale-95 group"
                    >
                      See All Doctors
                      <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </button>
                    <p className="text-slate-400 text-[10px] mt-3 font-medium uppercase tracking-tighter">
                      Showing 6 of {processedDoctors.length} available specialists
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white p-12 md:p-20 rounded-[2rem] border-2 border-dashed border-slate-200 text-center">
                <FaUserMd className="mx-auto text-5xl text-slate-200 mb-4" />
                <h3 className="text-lg font-bold text-slate-800">No doctors match your search</h3>
                <button onClick={() => setSearchTerm("")} className="mt-4 text-[#08B36A] font-bold underline">Reset search</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FindMyDoctor;