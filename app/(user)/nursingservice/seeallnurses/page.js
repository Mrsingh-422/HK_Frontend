"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FaArrowLeft,
  FaUserNurse,
  FaStar,
  FaMapMarkerAlt,
  FaAward,
  FaArrowRight,
  FaShieldAlt
} from "react-icons/fa";
import UserAPI from "@/app/services/UserAPI";

// Fallback high-quality image
const STATIC_NURSE_IMAGE = "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070&auto=format&fit=crop";
const BASE_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/`;

export default function AllNursesPage() {
  const router = useRouter();
  
  // API and Loading States
  const [nurseServices, setNurseServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all nurse services based on local coordinates
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const storedCoords = localStorage.getItem("userCoords");
        const coords = storedCoords ? JSON.parse(storedCoords) : { lat: 30.7380, lng: 76.6604 };
        const res = await UserAPI.getNurseServices(coords);
        if (res?.success) {
          setNurseServices(res.data || []);
        }
      } catch (error) {
        console.error("Error fetching nurse services:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const handleNurseClick = (id) => {
    router.push(`/nursingservice/nurseservicedetail/${id}`);
  };

  return (
    <div className="min-h-screen font-sans bg-[#F8FAFC] selection:bg-teal-500/10">
      
      {/* HEADER NAVIGATION */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 px-4 sm:px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-2 text-slate-600 hover:text-teal-600 font-bold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer"
          >
            <FaArrowLeft className="text-xs" /> Back
          </button>
          
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50/80 rounded-full border border-teal-100">
            <FaShieldAlt className="text-teal-600 text-[10px]" />
            <span className="text-[9px] font-black uppercase text-teal-855 tracking-wider">
              Verified Directory
            </span>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">

        {/* HERO HEADER */}
        <div className="mb-12 text-left">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-6 h-[2px] bg-teal-500 rounded-full"></span>
            <span className="text-teal-600 font-black text-[10px] uppercase tracking-widest">Available Professionals</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-none">
            Expert <span className="text-teal-500">Nursing Staff</span>
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-2">
            Browse through our highly qualified, elongated portrait listings for localized medical assistance.
          </p>
        </div>

        {/* LOADING SHIMMER SKELETON */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {[1, 2, 3, 4].map((idx) => (
              <div 
                key={idx} 
                className="bg-white rounded-[2rem] sm:rounded-[2.5rem] p-4 sm:p-6 border border-slate-100 animate-pulse h-[26rem] sm:h-[35rem] flex flex-col justify-between"
              >
                <div className="aspect-[3/4] w-full bg-slate-100 rounded-2xl mb-4" />
                <div className="space-y-3">
                  <div className="h-4 bg-slate-100 rounded-md w-2/3" />
                  <div className="h-3 bg-slate-100 rounded-md w-1/2" />
                </div>
                <div className="h-12 bg-slate-100 rounded-xl w-full mt-6" />
              </div>
            ))}
          </div>
        ) : (
          /* NURSING GRID (2 Columns on Mobile, 4 Columns on Laptops) */
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {nurseServices.map((nurse) => {
              // 1. Image Formatting Safe Check
              const profileImageUrl = nurse.profileImage 
                ? `${BASE_URL}${nurse.profileImage.replace("public/", "")}` 
                : STATIC_NURSE_IMAGE;

              // 2. Experience string safely parsed
              const expText = nurse.experienceYears > 0 
                ? `${nurse.experienceYears} Yrs Exp` 
                : "Entry Level";

              // 3. Price layout parsing
              const startingPriceText = nurse.startingPrice > 0 
                ? `₹${nurse.startingPrice}` 
                : "On Request";

              // 4. Rating formatting
              const ratingText = nurse.rating > 0 
                ? nurse.rating.toFixed(1) 
                : "New Profile";

              // 5. Safe service check
              const tagsToRender = nurse.topServices && nurse.topServices.length > 0 
                ? nurse.topServices.slice(0, 2) 
                : ["General Care", "Home Assistant"];

              return (
                <div
                  key={nurse._id}
                  onClick={() => handleNurseClick(nurse._id)}
                  className="group bg-white rounded-[2rem] sm:rounded-[2.8rem] p-3 sm:p-5.5 border border-slate-100 hover:border-teal-100/70 shadow-[0_4px_30px_-10px_rgba(0,0,0,0.02)] hover:shadow-[0_30px_60px_-15px_rgba(13,148,136,0.12)] hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[300px] sm:min-h-[500px]"
                >
                  <div>
                    {/* Elongated Image Section (aspect-[3/4] forces standard portrait length) */}
                    <div className="aspect-[3/4] w-full relative overflow-hidden rounded-[1.5rem] sm:rounded-[2rem] bg-slate-50 mb-4 sm:mb-5">
                      <img
                        src={profileImageUrl}
                        onError={(e) => {
                          e.target.src = STATIC_NURSE_IMAGE;
                        }}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        alt={nurse.name}
                      />

                      {/* Top Experience Badge */}
                      <div className="absolute top-2.5 left-2.5 sm:top-3.5 sm:left-3.5">
                        <span className="bg-slate-900/90 backdrop-blur-md px-2 py-0.5 sm:px-3 sm:py-1 rounded-md sm:rounded-xl text-[7px] sm:text-[9px] font-black uppercase tracking-wider text-white flex items-center gap-1">
                          <FaAward className="text-teal-400 text-[6px] sm:text-[10px]" />
                          {expText}
                        </span>
                      </div>

                      {/* Bottom Rating Badge */}
                      <div className="absolute bottom-2.5 right-2.5 sm:bottom-3.5 sm:right-3.5 bg-white/95 backdrop-blur-md px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded sm:rounded-xl flex items-center gap-1 shadow-sm">
                        <FaStar className="text-amber-500 text-[7px] sm:text-[10px]" />
                        <span className="text-[7px] sm:text-[10px] font-black text-slate-800">
                          {ratingText}
                        </span>
                      </div>
                    </div>

                    {/* Details Section */}
                    <div className="space-y-1 px-1">
                      <div className="flex items-center gap-1 text-[7px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        <FaMapMarkerAlt className="text-teal-500 text-[6px] sm:text-[8px]" /> 
                        {nurse.city || "Verified Location"}
                      </div>
                      <h3 className="text-xs sm:text-xl font-black text-slate-900 leading-tight group-hover:text-teal-600 transition-colors line-clamp-2">
                        {nurse.name}
                      </h3>
                    </div>

                    {/* Service Badges */}
                    <div className="flex flex-wrap gap-1 mt-2 px-1">
                      {tagsToRender.map((service, index) => (
                        <span
                          key={index}
                          className="bg-slate-50 text-slate-500 text-[7px] sm:text-[8px] font-bold px-2 py-0.5 rounded-md border border-slate-200/40 uppercase tracking-tight"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Elongated Bottom Section (Pricing & Action) */}
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-end justify-between px-1">
                    <div>
                      <p className="text-[6px] sm:text-[8px] font-bold text-slate-300 uppercase tracking-wider leading-none">Starting from</p>
                      <p className="text-sm sm:text-2xl font-black text-slate-900 mt-1">
                        {startingPriceText}
                      </p>
                    </div>
                    
                    <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-teal-500 text-white flex items-center justify-center transition-all duration-300 shadow-lg shadow-teal-500/10 group-hover:bg-slate-900">
                      <FaArrowRight className="text-[8px] sm:text-sm" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && nurseServices.length === 0 && (
          <div className="text-center py-20 bg-white border border-slate-100 rounded-[2.5rem] max-w-xl mx-auto mt-10 shadow-sm">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <FaUserNurse className="text-slate-300 text-xl" />
            </div>
            <p className="text-slate-800 font-black text-sm uppercase tracking-wider">No Nursing Staff Found</p>
            <p className="text-slate-400 text-xs mt-1">There are currently no care providers listed near your location.</p>
          </div>
        )}
      </div>
    </div>
  );
}