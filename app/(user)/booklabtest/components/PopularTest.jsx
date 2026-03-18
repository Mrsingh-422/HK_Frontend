"use client";

import React, { useState } from "react";
import {
  FaArrowRight,
  FaFlask,
  FaRegClock,
  FaShieldAlt,
  FaPlus
} from "react-icons/fa";
import { SINGLE_TESTS } from "@/app/constants/constants";
import SingleTestDetailModel from "./otherComponents/SingleTestDetailModel";

// Double the items for a seamless loop
const displayTests = [...SINGLE_TESTS, ...SINGLE_TESTS];

function PopularTest() {
  const [isPaused, setIsPaused] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleBookClick = (test) => {
    setSelectedTest(test);
    setIsModalOpen(true);
  };

  return (
    <div className="py-10 bg-slate-50 overflow-hidden relative">
      <SingleTestDetailModel
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        testData={selectedTest}
      />

      {/* Header with modern typography */}
      <div className="max-w-7xl mx-auto px-6 mb-16">
        <div className="flex flex-col items-center text-center">
          <div className="bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
            <FaShieldAlt className="text-emerald-500" />
            NABL Accredited Labs
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight mb-4">
            Individual <span className="text-emerald-500 underline decoration-emerald-200 decoration-8 underline-offset-4">Tests</span>
          </h2>
          <p className="text-slate-500 max-w-lg text-lg">
            Quick, accurate, and reliable diagnostic tests with smart digital reports.
          </p>
        </div>
      </div>

      {/* Marquee Wrapper with Gradient Fades */}
      <div
        className="relative w-full group/marquee"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Gradient Mask (Desktop Only) */}
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none hidden md:block"></div>
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none hidden md:block"></div>

        <div
          className="flex gap-6 animate-popular-marquee"
          style={{
            animationPlayState: isPaused ? "paused" : "running",
            width: "max-content",
          }}
        >
          {displayTests.map((test, index) => (
            <div
              key={`${test.id}-${index}`}
              className="w-[280px] md:w-[320px] flex-shrink-0 bg-white border border-slate-100 rounded-[2.5rem] p-6 hover:border-emerald-100 hover:shadow-[0_20px_50px_rgba(16,185,129,0.1)] transition-all duration-500 group"
            >
              {/* Image Section */}
              <div className="relative h-40 w-full mb-6 bg-slate-50 rounded-3xl flex items-center justify-center group-hover:bg-emerald-50/50 transition-colors">
                <img
                  src={test.image}
                  alt={test.name}
                  className="h-28 w-28 object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-3 right-3 bg-white p-2 rounded-xl shadow-sm">
                  <FaFlask className="text-emerald-500 text-sm" />
                </div>
              </div>

              {/* Text Info */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-800 leading-snug min-h-[50px] mb-2">
                  {test.name}
                </h3>
                <div className="flex items-center gap-3 text-slate-400 text-xs font-semibold">
                  <span className="flex items-center gap-1">
                    <FaRegClock className="text-emerald-500" /> 24h Result
                  </span>
                  <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                  <span>Certified Lab</span>
                </div>
              </div>

              {/* Pricing & CTA */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Starting at</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">
                    ₹{test.price}
                  </p>
                </div>

                <button
                  onClick={() => handleBookClick(test)}
                  className="h-12 w-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-emerald-500 transition-all duration-300 shadow-lg shadow-slate-200 active:scale-90"
                >
                  <FaPlus />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes popular-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-50% - 1.5rem)); }
        }
        .animate-popular-marquee {
          animation: popular-marquee 60s linear infinite;
        }
        @media (max-width: 768px) {
          .animate-popular-marquee {
            animation: popular-marquee 40s linear infinite;
          }
        }
      `}} />
    </div>
  );
}

export default PopularTest;