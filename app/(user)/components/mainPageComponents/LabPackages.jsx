"use client";

import React, { useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  FaChevronRight, 
  FaChevronLeft,
  FaShieldAlt, 
  FaMicroscope, 
  FaClock, 
  FaHouseUser,
  FaArrowRight
} from "react-icons/fa";

const PACKAGES = [
  {
    id: 201,
    name: "Full Body Health Checkup",
    subName: "Comprehensive Wellness",
    testsCount: 84,
    idealFor: "All Adults",
    price: 1499,
    mrp: 3500,
    discount: "57% OFF",
    tag: "Most Popular",
    featured: true,
  },
  {
    id: 202,
    name: "Women’s Special Package",
    subName: "Hormone & Vitamin Care",
    testsCount: 62,
    idealFor: "Women 18+",
    price: 1999,
    mrp: 4200,
    discount: "52% OFF",
    tag: "Best Seller",
    featured: false,
  },
  {
    id: 203,
    name: "Senior Citizen Advanced",
    subName: "Age-Specific Care",
    testsCount: 75,
    idealFor: "Age 60+",
    price: 2499,
    mrp: 5000,
    discount: "50% OFF",
    tag: "Recommended",
    featured: false,
  },
  {
    id: 204,
    name: "Active Fitness Package",
    subName: "Body Composition & Vitality",
    testsCount: 45,
    idealFor: "Gym & Sports",
    price: 999,
    mrp: 2200,
    discount: "55% OFF",
    tag: "Trending",
    featured: false,
  },
];

export default function LabPackages() {
  const router = useRouter();
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === "left" ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  return (
    <section className="py-10 md:py-16 bg-[#FDFDFD] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12 gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] md:text-[11px] font-bold text-emerald-700 uppercase tracking-wider">NABL Accredited Labs</span>
            </div>
            <h2 className="text-2xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              Popular <span className="text-emerald-600">Health Packages</span>
            </h2>
            <p className="text-slate-500 text-sm md:text-lg max-w-xl">
              Preventive health checkups designed by expert doctors for your family.
            </p>
          </div>
          
          <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto mt-2 md:mt-0">
            {/* Desktop Navigation Arrows */}
            <div className="hidden md:flex gap-2 mr-4">
                <button onClick={() => scroll('left')} className="p-3 rounded-full border border-slate-200 hover:bg-white hover:shadow-md transition-all text-slate-600 cursor-pointer bg-white">
                  <FaChevronLeft size={14}/>
                </button>
                <button onClick={() => scroll('right')} className="p-3 rounded-full border border-slate-200 hover:bg-white hover:shadow-md transition-all text-slate-600 cursor-pointer bg-white">
                  <FaChevronRight size={14}/>
                </button>
            </div>
            {/* View All Button */}
            <button 
              onClick={() => router.push("/all-packages")}
              className="group flex items-center gap-2 text-sm font-bold text-emerald-600 hover:text-emerald-700 md:text-slate-900 md:hover:text-emerald-600 transition-colors cursor-pointer"
            >
              View All Packages <FaArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* --- PACKAGE CARDS CONTAINER --- */}
        {/* Optimized for touch scroll on mobile and desktop view */}
        <div 
          ref={scrollRef}
          className="flex flex-nowrap overflow-x-auto gap-4 md:gap-6 pt-10 pb-8 scrollbar-hide snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0"
        >
          {PACKAGES.map((pkg) => (
            <div 
              key={pkg.id}
              className={`flex-shrink-0 w-[85vw] max-w-[300px] md:max-w-none md:w-[350px] snap-center md:snap-start relative bg-white rounded-[24px] border-2 transition-all duration-300 flex flex-col ${
                pkg.featured ? "border-emerald-500 shadow-xl shadow-emerald-500/10" : "border-slate-100 hover:border-emerald-200 shadow-sm"
              }`}
            >
              {/* Absolute Tag */}
              <div className="absolute -top-3 left-6 z-20">
                 <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md text-white ${pkg.featured ? 'bg-emerald-600' : 'bg-slate-900'}`}>
                    {pkg.tag}
                 </span>
              </div>

              {/* Card Body */}
              <div className="p-5 md:p-6 pb-0">
                <div className="flex justify-between items-start mb-4 pt-2">
                    <div className="space-y-1">
                        <p className="text-[10px] md:text-[11px] font-bold text-emerald-600 uppercase tracking-wide">{pkg.idealFor}</p>
                        <h3 className="text-lg md:text-xl font-bold text-slate-900 leading-tight">{pkg.name}</h3>
                    </div>
                    <div className="bg-slate-50 p-2.5 md:p-3 rounded-2xl text-slate-400">
                        <FaMicroscope size={18} className="md:w-5 md:h-5" />
                    </div>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-2 gap-2.5 mb-5 md:mb-6">
                    <div className="flex items-center gap-2 px-2.5 py-2 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="text-[10px] md:text-[11px] font-bold text-slate-700">{pkg.testsCount} Tests</span>
                    </div>
                    <div className="flex items-center gap-2 px-2.5 py-2 bg-slate-50 rounded-xl border border-slate-100">
                        <FaClock className="text-slate-400" size={10} />
                        <span className="text-[10px] md:text-[11px] font-bold text-slate-700">24h Reports</span>
                    </div>
                </div>

                {/* Secondary Features */}
                <div className="space-y-2 mb-5 md:mb-6">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <FaHouseUser className="text-emerald-500 flex-shrink-0" size={12} />
                        <span>Free Home Sample Collection</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <FaShieldAlt className="text-emerald-500 flex-shrink-0" size={12} />
                        <span>Certified & Hygienic Labs</span>
                    </div>
                </div>
              </div>

              {/* Pricing & Footer (Sticks to bottom) */}
              <div className="mt-auto p-5 md:p-6 pt-4 bg-slate-50/50 rounded-b-[22px] border-t border-slate-100">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-xl md:text-2xl font-black text-slate-900">₹{pkg.price}</span>
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                                {pkg.discount}
                            </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                            MRP <span className="line-through">₹{pkg.mrp}</span> • <span className="text-slate-500 font-semibold">₹{Math.round(pkg.price/pkg.testsCount)}/test</span>
                        </p>
                    </div>
                </div>
                
                <button className={`w-full py-3 md:py-3.5 rounded-xl text-xs md:text-sm font-black transition-all transform active:scale-[0.97] cursor-pointer ${
                    pkg.featured 
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200 hover:bg-emerald-700" 
                    : "bg-slate-900 text-white hover:bg-slate-800"
                }`}>
                  BOOK NOW
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* --- FOOTER TRUST BADGES --- */}
        {/* Stacks on mobile, forms a grid on larger screens */}
        <div className="mt-8 md:mt-12 py-6 border-y border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all">
             <div className="flex items-center justify-center gap-2">
                <FaShieldAlt className="text-emerald-600 flex-shrink-0" size={18}/>
                <span className="text-[10px] font-bold tracking-widest text-slate-900 uppercase">100% Safe & Secure</span>
             </div>
             <div className="flex items-center justify-center gap-2">
                <FaMicroscope className="text-emerald-600 flex-shrink-0" size={18}/>
                <span className="text-[10px] font-bold tracking-widest text-slate-900 uppercase">NABL Certified Labs</span>
             </div>
             <div className="flex items-center justify-center gap-2">
                <FaHouseUser className="text-emerald-600 flex-shrink-0" size={18}/>
                <span className="text-[10px] font-bold tracking-widest text-slate-900 uppercase">Free Home Pickup</span>
             </div>
        </div>

        {/* CSS to hide scrollbar while maintaining function */}
        <style jsx>{`
            .scrollbar-hide::-webkit-scrollbar { display: none; }
            .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>

      </div>
    </section>
  );
}