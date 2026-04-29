"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FaStar, FaMapMarkerAlt, FaHome, FaCheckCircle,
  FaClock, FaArrowRight, FaMicroscope, FaShieldAlt
} from "react-icons/fa";
import UserAPI from "@/app/services/UserAPI";

// Array of 3 High-Quality Static Lab Images
const STATIC_LAB_IMAGES = [
  "https://t4.ftcdn.net/jpg/04/91/71/61/360_F_491716127_d5QUgNYH0BOyENb1HcN1xlvnT2s9kcWK.jpg",
  "https://ases.in/cdn/shop/articles/Must-Have_Equipment_in_a_Starter_Lab_Setup_2048x.png?v=1756058679",
  "https://png.pngtree.com/thumb_back/fh260/background/20240801/pngtree-laboratory-equipment-and-microscope-on-table-in-lab-setting-image_16123343.jpg"
];

const LabCard = ({ lab, index, onClick }) => {
  return (
    <div 
      onClick={() => onClick(lab._id)}
      className="group cursor-pointer relative bg-white rounded-[3.5rem] p-5 shadow-xl shadow-slate-200/50 border border-slate-50 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2"
    >
      {/* Image Section within Big Card */}
      <div className="relative h-64 w-full rounded-[3rem] overflow-hidden mb-6">
        <img
          src={STATIC_LAB_IMAGES[index % 3]} // Cycle through the 3 static images
          alt={lab.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>

        {/* Floating Tags */}
        <div className="absolute top-5 left-5 flex flex-col gap-2">
          {lab.is24x7 && (
            <span className="bg-white/90 backdrop-blur-md text-slate-900 text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm">
              24/7 Service
            </span>
          )}
          {lab.isHomeCollectionAvailable && (
            <span className="bg-[#08B36A] text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-emerald-200">
              Home Collection
            </span>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-2 mb-2">
          <FaCheckCircle className="text-blue-500" size={14} />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Verified Laboratory</span>
        </div>
        <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-4 truncate">
          {lab.name}
        </h3>

        {/* THE SMALL CARD (Inner Nested Container) */}
        <div className="bg-slate-50 rounded-[2.5rem] p-6 border border-slate-100 transition-colors group-hover:bg-emerald-50 group-hover:border-emerald-100">
          <div className="grid grid-cols-2 gap-4">
            {/* Rating Info */}
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Client Rating</span>
              <div className="flex items-center gap-1.5">
                <FaStar className="text-amber-400" size={14} />
                <span className="text-sm font-black text-slate-800">{lab.rating || "0.0"}</span>
                <span className="text-[10px] text-slate-400 font-bold">({lab.totalReviews || 0})</span>
              </div>
            </div>

            {/* Location Info */}
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Location</span>
              <div className="flex items-center gap-1.5">
                <FaMapMarkerAlt className="text-emerald-500" size={14} />
                <span className="text-sm font-black text-slate-800">{lab.city}</span>
              </div>
            </div>

            {/* Timing Info (Span 2 columns) */}
            <div className="col-span-2 mt-2 pt-4 border-t border-slate-200/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaClock className="text-slate-300" size={12} />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                    {lab.is24x7 ? "Always Open" : "Open 08:00 - 20:00"}
                </span>
              </div>
              <div className="h-8 w-8 bg-slate-900 text-white rounded-full flex items-center justify-center transition-all hover:bg-[#08B36A] hover:scale-110 shadow-lg">
                <FaArrowRight size={10} />
              </div>
            </div>
          </div>
        </div>
      </div>
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
        // Retrieve coordinates from local storage
        const userCoordsRaw = localStorage.getItem("userCoords");
        let payload = { lat: 30.7380, lng: 76.6604 }; // Fallback coords

        if (userCoordsRaw) {
          const parsed = JSON.parse(userCoordsRaw);
          payload = {
            lat: parsed.lat,
            lng: parsed.lng
          };
        }

        const res = await UserAPI.getLabsList(payload);
        if (res?.success) {
          // Show only top 3 labs as requested
          setLabs(res.data.slice(0, 3));
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
    <div className="py-24 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-6">

        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-1.5 w-12 bg-emerald-500 rounded-full"></div>
              <span className="text-[11px] font-black uppercase tracking-[0.4em] text-emerald-600">Official Partners</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none mb-6">
              Network of <span className="text-emerald-500 text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600">Premium Labs.</span>
            </h2>
            <p className="text-slate-500 text-sm md:text-base font-medium leading-relaxed">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
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

        {/* --- FOOTER CTA --- */}
        <div className="mt-20 flex flex-col items-center bg-white border border-slate-100 p-10 rounded-[3rem] shadow-sm">
          <FaShieldAlt className="text-4xl text-emerald-500 mb-4" />
          <h4 className="text-xl font-black text-slate-800 mb-2">Are you a Lab Owner?</h4>
          <p className="text-slate-500 text-sm font-medium mb-6">Join our network and grow your diagnostic practice.</p>
          <button className="bg-slate-900 text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#08B36A] transition-all shadow-xl shadow-slate-200">
            Become a Partner
          </button>
        </div>
      </div>
    </div>
  );
}