"use client";

import React, { useState } from "react";
import { FaArrowRight } from "react-icons/fa";
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
    <div className="py-14 md:py-20 overflow-hidden">
      <TestDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        pkg={selectedPackage}
      />
      {/* Section Header */}
      <div className="max-w-7xl mx-auto px-4 mb-10 md:mb-14 text-center">
        <h2 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-slate-800 mb-3">
          Health Packages
        </h2>
        <div className="w-16 md:w-24 h-1.5 bg-emerald-500 mx-auto rounded-full"></div>
      </div>

      {/* Marquee Wrapper */}
      <div
        className="relative w-full overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div
          className="flex gap-4 sm:gap-6 animate-marquee"
          style={{
            animationPlayState: isPaused ? "paused" : "running",
            width: "max-content",
          }}
        >
          {displayPackages.map((pkg, index) => (
            <div
              key={`${pkg.id}-${index}`}
              className="
                w-[260px] 
                sm:w-[280px] 
                md:w-[300px] 
                lg:w-[320px]
                flex-shrink-0 
                bg-white 
                rounded-2xl 
                border 
                border-slate-100 
                shadow-md 
                hover:shadow-2xl 
                transition-all 
                duration-300 
                group
              "
            >
              {/* Image */}
              <div className="h-36 sm:h-40 md:h-44 overflow-hidden relative rounded-t-2xl">
                <img
                  src={pkg.image}
                  alt={pkg.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>

              {/* Content */}
              <div className="p-4 sm:p-5 md:p-6 text-center">
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-emerald-600 mb-4 min-h-[48px] flex items-center justify-center">
                  {pkg.name}
                </h3>

                {/* Price Bar */}
                <div className="bg-[#fde047] hover:bg-[#facc15] transition-colors py-2.5 sm:py-3 px-4 sm:px-5 rounded-xl flex items-center justify-between mb-4 cursor-pointer group/price">
                  <span className="text-base sm:text-lg font-black text-slate-900">
                    {pkg.price}
                  </span>
                  <FaArrowRight className="text-slate-900 group-hover/price:translate-x-1 transition-transform" />
                </div>

                {/* Button */}
                <button
                  onClick={() => handleBookClick(pkg)}
                  className="w-full bg-[#10b981] hover:bg-slate-900 text-white text-sm sm:text-base font-bold py-2.5 sm:py-3 rounded-xl transition-all shadow-lg active:scale-95">
                  Book A Test
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Marquee Animation */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .animate-marquee {
          animation: marquee 30s linear infinite;
        }

        @media (max-width: 768px) {
          .animate-marquee {
            animation: marquee 40s linear infinite;
          }
        }
      `}</style>
    </div>
  );
}

export default HealthPackages;