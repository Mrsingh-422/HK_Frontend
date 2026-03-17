"use client";

import React, { useState } from "react";
import {
  FaArrowRight,
  FaCheckCircle,
  FaRegClock,
  FaRegHospital,
  FaTag
} from "react-icons/fa";
import { INITIAL_PACKAGES } from "../../../constants/constants";
import { useRouter } from "next/navigation";
import TestDetailsModal from "./otherComponents/TestDetailsModal";

const displayPackages = [...INITIAL_PACKAGES, ...INITIAL_PACKAGES];

function HealthPackages() {
  const [isPaused, setIsPaused] = useState(false);
  const router = useRouter();

  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleBookClick = (pkg) => {
    setSelectedPackage(pkg);
    setIsModalOpen(true);
  };

  return (
    <section className="py-10  bg-slate-50 overflow-hidden">
      <TestDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        pkg={selectedPackage}
      />

      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-6 mb-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-10 h-[2px] bg-emerald-500"></span>
              <span className="text-emerald-600 font-bold tracking-[0.2em] text-xs uppercase">
                Preventive Care
              </span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight">
              Best <span className="text-emerald-500">Health</span> Packages
            </h2>
          </div>
          <p className="max-w-md text-slate-500 text-lg leading-relaxed border-l-4 border-emerald-100 pl-6">
            Proactive health monitoring for you and your family. Early detection leads to better protection.
          </p>
        </div>
      </div>

      {/* Marquee Wrapper with Gradient Masking */}
      <div
        className="relative w-full group"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* The Professional "Fade" Mask */}
        <div className="absolute inset-y-0 left-0 w-24 md:w-60 bg-gradient-to-r from-[#fdfdfd] to-transparent z-10 pointer-events-none"></div>
        <div className="absolute inset-y-0 right-0 w-24 md:w-60 bg-gradient-to-l from-[#fdfdfd] to-transparent z-10 pointer-events-none"></div>

        <div
          className="flex gap-8 animate-marquee"
          style={{
            animationPlayState: isPaused ? "paused" : "running",
            width: "max-content",
          }}
        >
          {displayPackages.map((pkg, index) => (
            <div
              key={`${pkg.id}-${index}`}
              className="w-[300px] md:w-[350px] flex-shrink-0 bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.08)] hover:shadow-[0_25px_60px_-15px_rgba(16,185,129,0.15)] transition-all duration-500 group/card mb-10 mt-5"
            >
              {/* Image with Floating Tag */}
              <div className="h-48 relative m-3 overflow-hidden rounded-[1.8rem]">
                <img
                  src={pkg.image}
                  alt={pkg.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full flex items-center gap-2 shadow-sm">
                  <FaTag className="text-emerald-500 text-xs" />
                  <span className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">Premium</span>
                </div>
              </div>

              {/* Content */}
              <div className="px-8 pb-8 pt-4">
                <h3 className="text-xl font-bold text-slate-800 mb-4 min-h-[60px] line-clamp-2 leading-snug">
                  {pkg.name}
                </h3>

                {/* Micro Features */}
                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-3 text-slate-500 text-sm">
                    <FaCheckCircle className="text-emerald-500 shrink-0" />
                    <span>Includes 60+ Vital Parameters</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-500 text-sm">
                    <FaRegClock className="text-emerald-500 shrink-0" />
                    <span>Digital Report within 24 Hrs</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-500 text-sm">
                    <FaRegHospital className="text-emerald-500 shrink-0" />
                    <span>Free Home Collection</span>
                  </div>
                </div>

                {/* Price and Action Section */}
                <div className="flex items-center justify-between border-t border-slate-50 pt-6">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Total Price</span>
                    <span className="text-3xl font-black text-slate-900 tracking-tight">
                      {pkg.price}
                    </span>
                  </div>

                  <button
                    onClick={() => handleBookClick(pkg)}
                    className="h-14 w-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-emerald-500 transition-all duration-300 shadow-xl shadow-slate-200 active:scale-95 group/btn"
                  >
                    <FaArrowRight className="group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modern Scrolling Styles */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-50% - 1rem)); }
        }

        .animate-marquee {
          animation: marquee 40s linear infinite;
        }

        @media (max-width: 768px) {
          .animate-marquee {
            animation: marquee 25s linear infinite;
          }
        }
      `}</style>
    </section>
  );
}

export default HealthPackages;