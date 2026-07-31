"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FaStar, FaMapMarkerAlt, FaHome, FaCheckCircle,
  FaClock, FaArrowRight, FaMicroscope, FaShieldAlt
} from "react-icons/fa";
import UserAPI from "@/app/services/UserAPI";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://192.168.1.26:5002";

// Array of 3 High-Quality Static Lab Images (used as fallbacks)
const STATIC_LAB_IMAGES = [
  "https://t4.ftcdn.net/jpg/04/91/71/61/360_F_491716127_d5QUgNYH0BOyENb1HcN1xlvnT2s9kcWK.jpg",
  "https://ases.in/cdn/shop/articles/Must-Have_Equipment_in_a_Starter_Lab_Setup_2048x.png?v=1756058679",
  "https://png.pngtree.com/thumb_back/fh260/background/20240801/pngtree-laboratory-equipment-and-microscope-on-table-in-lab-setting-image_16123343.jpg"
];

// Resolves real backend/uploaded images, falling back to pre-defined static ones
const getImageUrl = (path, fallback) => {
  if (!path) return fallback;
  if (path.startsWith("http")) return path;
  return `${BASE_URL}/${path.replace(/^public\//, "")}`.replace(/([^:]\/)\/+/g, "$1");
};

const LabCard = ({ lab, index, onClick }) => {
  const isOffline = lab.isOnline === false;
  const fallbackImage = STATIC_LAB_IMAGES[index % 3];
  const displayImage = getImageUrl(lab.profileImage, fallbackImage);

  return (
    <div 
      onClick={() => !isOffline && onClick(lab._id)}
      className={`group relative bg-white rounded-[2rem] md:rounded-[3.5rem] p-3 md:p-5 shadow-xl shadow-slate-200/50 border border-slate-50 transition-all duration-500 ${
        isOffline ? "cursor-not-allowed" : "cursor-pointer hover:shadow-2xl hover:-translate-y-2"
      }`}
    >
      {/* Visual content wrapper (Blurred and semi-transparent if offline) */}
      <div className={isOffline ? "filter blur-[1.5px] opacity-60 select-none pointer-events-none" : ""}>
        {/* Image Section within Big Card */}
        <div className="relative h-32 sm:h-48 md:h-64 w-full rounded-[1.5rem] md:rounded-[3rem] overflow-hidden mb-3 md:mb-6">
          <img
            src={displayImage} 
            alt={lab.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>

          {/* Floating Tags */}
          <div className="absolute top-2 md:top-5 left-2 md:left-5 flex flex-col gap-1 md:gap-2">
            {lab.is24x7 && (
              <span className="bg-white/90 backdrop-blur-md text-slate-900 text-[7px] md:text-[9px] font-black px-1.5 md:px-3 py-1 md:py-1.5 rounded-full uppercase tracking-widest shadow-sm">
                24/7
              </span>
            )}
            {lab.isHomeCollectionAvailable && (
              <span className="bg-[#08B36A] text-white text-[7px] md:text-[9px] font-black px-1.5 md:px-3 py-1 md:py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-emerald-200">
                Home
              </span>
            )}
            {lab.isRapidServiceAvailable && (
              <span className="bg-amber-500 text-white text-[7px] md:text-[9px] font-black px-1.5 md:px-3 py-1 md:py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-amber-200">
                Rapid
              </span>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="px-1 md:px-4 pb-2 md:pb-4">
          <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
            <FaCheckCircle className="text-blue-500 md:size-[14px]" size={10} />
            <span className="text-[7px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] md:tracking-[0.2em]">Verified</span>
          </div>
          <h3 
            title={lab.address} // Displays full address on hover
            className="text-sm md:text-2xl font-black text-slate-900 tracking-tight mb-2 md:mb-4 truncate"
          >
            {lab.name}
          </h3>

          {/* THE SMALL CARD (Inner Nested Container) */}
          <div className="bg-slate-50 rounded-[1.2rem] md:rounded-[2.5rem] p-3 md:p-6 border border-slate-100 transition-colors group-hover:bg-emerald-50 group-hover:border-emerald-100">
            <div className="grid grid-cols-2 gap-x-2 gap-y-3 md:gap-x-4 md:gap-y-6">
              
              {/* Rating & Review Info */}
              <div className="flex flex-col gap-0.5 md:gap-1">
                <span className="text-[7px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">Rating</span>
                <div className="flex items-center gap-1 md:gap-1.5">
                  <FaStar className="text-amber-400 md:size-[14px]" size={10}/>
                  <span className="text-[10px] md:text-sm font-black text-slate-800">
                    {lab.rating || "0.0"}{" "}
                    <span className="text-slate-400 text-[8px] md:text-[10px] font-bold">
                      ({lab.totalReviews || 0})
                    </span>
                  </span>
                </div>
              </div>

              {/* Location & Distance Info */}
              <div className="flex flex-col gap-0.5 md:gap-1">
                <span className="text-[7px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">City & Distance</span>
                <div className="flex items-center gap-1 md:gap-1.5">
                  <FaMapMarkerAlt className="text-emerald-500 md:size-[14px]" size={10}/>
                  <span className="text-[10px] md:text-sm font-black text-slate-800 truncate">
                    {lab.city} {lab.distance ? `(${lab.distance} km)` : ""}
                  </span>
                </div>
              </div>

              {/* Starting Price */}
              <div className="flex flex-col gap-0.5 md:gap-1 pt-1 md:pt-2 border-t border-slate-200/50">
                <span className="text-[7px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">Starts From</span>
                <div className="text-[10px] md:text-sm font-black text-emerald-600">
                  ₹{lab.startingPrice || "N/A"}
                </div>
              </div>

              {/* Insurance Acceptance Info */}
              <div className="flex flex-col gap-0.5 md:gap-1 pt-1 md:pt-2 border-t border-slate-200/50">
                <span className="text-[7px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">Insurances</span>
                <div 
                  title={lab.acceptedInsurances?.join(", ")} 
                  className="text-[8px] md:text-xs font-bold text-slate-700 truncate"
                >
                  {lab.isInsuranceAccepted && lab.acceptedInsurances?.length > 0
                    ? lab.acceptedInsurances.join(", ")
                    : "Not Accepted"}
                </div>
              </div>

              {/* Timing Info (Span 2 columns) */}
              <div className="col-span-2 mt-1 md:mt-2 pt-2 md:pt-4 border-t border-slate-200/50 flex items-center justify-between">
                <div className="flex items-center gap-1 md:gap-2">
                  <FaClock className="text-slate-300 md:size-[12px]" size={8} />
                  <span className="text-[7px] md:text-[10px] font-black text-slate-500 uppercase tracking-tighter md:tracking-wider">
                      {lab.is24x7 ? "24/7" : "08:00-20:00"}
                  </span>
                </div>
                <div className="h-5 w-5 md:h-8 md:w-8 bg-slate-900 text-white rounded-full flex items-center justify-center transition-all hover:bg-[#08B36A] hover:scale-110 shadow-lg">
                  <FaArrowRight size={8} className="md:size-[10px]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Centered Offline Overlay Badge */}
      {isOffline && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <span className="bg-slate-900/90 text-white text-[9px] md:text-xs font-black px-4 md:px-6 py-2 md:py-3 rounded-full uppercase tracking-widest shadow-xl border border-slate-700/50">
            Offline
          </span>
        </div>
      )}
    </div>
  );
};

export default function OurPartners() {
  const router = useRouter();
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLabs = async () => {
      try {
        setLoading(true);
        const userCoordsRaw = localStorage.getItem("userCoords");
        let payload = { lat: 30.7380, lng: 76.6604 }; 

        if (userCoordsRaw) {
          const parsed = JSON.parse(userCoordsRaw);
          payload = {
            lat: parsed.lat,
            lng: parsed.lng
          };
        }

        const res = await UserAPI.getLabsList(payload);
        if (res?.success) {
          // Show only top 4 labs as requested
          setLabs(res.data.slice(0, 4));
        }
      } catch (error) {
        console.error("Error fetching labs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLabs();
  }, []);

  const handleLabClick = (id) => {
    router.push(`/booklabtest/singlelabdetail/${id}`);
  };

  return (
    <div className="py-12 md:py-24 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 md:px-6">

        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8 mb-10 md:mb-16">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-4">
              <div className="h-1 w-8 md:h-1.5 md:w-12 bg-emerald-500 rounded-full"></div>
              <span className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] md:tracking-[0.4em] text-emerald-600">Official Partners</span>
            </div>
            <h2 className="text-2xl md:text-6xl font-black text-slate-900 tracking-tighter leading-tight md:leading-none mb-4 md:mb-6">
              Network of <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600">Premium Labs.</span>
            </h2>
            <p className="text-slate-500 text-xs md:text-base font-medium leading-relaxed">
              We have partnered with the most trusted laboratories in India to ensure
              that every test you book meets global diagnostic standards.
            </p>
          </div>

          <div className="hidden lg:flex items-center gap-6">
            <div className="text-right">
              <p className="text-2xl font-black text-slate-900">500+</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Partner Centers</p>
            </div>
            <div className="h-10 w-px bg-slate-200"></div>
            <div className="text-right">
              <p className="text-2xl font-black text-slate-900">100%</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verified NABL</p>
            </div>
          </div>
        </div>

        {/* --- THE GRID --- */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-emerald-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-10">
            {labs.map((lab, index) => (
              <LabCard 
                key={lab._id} 
                lab={lab} 
                index={index} 
                onClick={handleLabClick} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}