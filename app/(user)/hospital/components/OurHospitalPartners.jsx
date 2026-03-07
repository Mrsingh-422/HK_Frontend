import React, { useState } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { HOSPITAL_DATA } from "@/app/constants/constants";
import HospitalDetailsModal from "./otherComponents/HospitalDetailsModal";

// Double the array for a seamless loop
const displayHospitals = [...HOSPITAL_DATA];

function OurHospitalPartners() {
  const [isPaused, setIsPaused] = useState(false);

  // MODAL STATES
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSelectHospital = (hospital) => {
    setSelectedHospital(hospital);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedHospital(null), 300);
  };

  return (
    <div className="py-8 md:py-12 bg-[#f8fafc] overflow-hidden font-sans">

      <HospitalDetailsModal
        isOpen={isModalOpen}
        hospital={selectedHospital}
        onClose={closeModal}
      />

      <div className="max-w-7xl mx-auto px-4 text-center mb-10 md:mb-20">

        {/* Tagline Header */}
        <div className="flex items-center justify-center gap-4 mb-2">
          <FaArrowLeft className="text-[#08B36A] cursor-pointer hover:scale-110 transition-transform text-sm md:text-base" />
          <span className="text-[#08B36A] font-bold text-sm md:text-xl tracking-wide uppercase">
            Hospital's
          </span>
          <FaArrowRight className="text-[#08B36A] cursor-pointer hover:scale-110 transition-transform text-sm md:text-base" />
        </div>

        {/* Main Title */}
        <h2 className="text-3xl md:text-6xl font-black text-slate-800 tracking-tight">
          Our Hospital Partners
        </h2>
      </div>

      {/* Marquee Wrapper */}
      <div
        className="relative w-full cursor-pointer touch-pan-y"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        <div
          className="flex gap-4 md:gap-8 animate-hospital-marquee"
          style={{
            animationPlayState: isPaused ? 'paused' : 'running',
            width: 'max-content'
          }}
        >
          {displayHospitals.map((hospital, index) => (
            <div
              key={`${hospital.id}-${index}`}
              onClick={() => handleSelectHospital(hospital)}
              className="w-[200px] sm:w-[260px] md:w-[320px] flex-shrink-0 bg-white border border-slate-100 rounded-xl md:rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden flex flex-col group"
            >
              {/* Hospital Image Area */}
              <div className="h-32 sm:h-44 md:h-56 bg-slate-50 overflow-hidden relative">
                <img
                  src={hospital.image}
                  alt={hospital.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors"></div>
              </div>

              {/* Hospital Info Area */}
              <div className="p-4 md:p-8 text-center flex flex-col items-center justify-start min-h-[140px] md:min-h-[180px]">
                <h3 className="text-[#08B36A] font-black text-sm md:text-xl uppercase tracking-tight mb-3">
                  {hospital.name}
                </h3>
                <p className="text-slate-500 text-[10px] md:text-sm leading-relaxed line-clamp-3 md:line-clamp-4">
                  {hospital.about}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CSS Animation */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes hospital-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-hospital-marquee {
          animation: hospital-marquee 30s linear infinite;
        }
        /* Mobile adjustment: ensure smooth motion on small screens */
        @media (max-width: 768px) {
          .animate-hospital-marquee {
            animation: hospital-marquee 15s linear infinite;
          }
        }
      `}} />
    </div>
  );
}

export default OurHospitalPartners;