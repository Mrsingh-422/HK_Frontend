"use client";

import React, { useState } from "react";
import { FaArrowRight, FaStar, FaPlus, FaMapMarkerAlt, FaBed, FaUserMd } from "react-icons/fa";
import { HOSPITAL_DATA } from "@/app/constants/constants";
import HospitalDetailsModal from "./otherComponents/HospitalDetailsModal";

// Double the array for a truly seamless loop
const displayHospitals = [...HOSPITAL_DATA, ...HOSPITAL_DATA];

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
    <div className="py-0 md:py-10 bg-white overflow-hidden font-sans relative">
      
      <HospitalDetailsModal
        isOpen={isModalOpen}
        hospital={selectedHospital}
        onClose={closeModal}
      />

      {/* --- Section Header --- */}
      <div className="max-w-7xl mx-auto px-6 mb-16 md:mb-24">
        <div className="flex flex-col items-center text-center space-y-4">
            <div className="flex items-center gap-2 px-4 py-1 bg-[#08B36A]/10 rounded-full border border-[#08B36A]/20">
                <span className="w-2 h-2 bg-[#08B36A] rounded-full animate-pulse"></span>
                <span className="text-[#08B36A] text-[10px] font-black uppercase tracking-[0.3em]">Our Medical Network</span>
            </div>
            <h2 className="text-4xl md:text-7xl font-black text-slate-900 tracking-tighter leading-tight">
                Partnering for  
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#08B36A] to-emerald-500"> Better Health.</span>
            </h2>
            <p className="text-slate-400 max-w-xl text-sm md:text-base font-medium leading-relaxed">
                We have hand-picked the most advanced medical facilities to ensure your journey to recovery is supported by the best in the industry.
            </p>
        </div>
      </div>

      {/* --- Modern Floating Marquee --- */}
      <div
        className="relative w-full cursor-pointer marquee-container"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div
          className="flex gap-6 md:gap-10 animate-hospital-flow"
          style={{
            animationPlayState: isPaused ? 'paused' : 'running',
            width: 'max-content'
          }}
        >
          {displayHospitals.map((hospital, index) => (
            <div
              key={`${hospital.id}-${index}`}
              onClick={() => handleSelectHospital(hospital)}
              className="w-[280px] md:w-[420px] flex-shrink-0 group"
            >
              <div className="bg-white p-4 md:p-6 rounded-[3rem] border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_40px_80px_rgba(8,179,106,0.1)] transition-all duration-700 flex flex-col items-center text-center relative group">
                
                {/* Image Section - Circular Motif */}
                <div className="relative w-full h-40 md:h-56 rounded-[2.5rem] overflow-hidden mb-6">
                    <img
                        src={hospital.image}
                        alt={hospital.name}
                        className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40"></div>
                    
                    {/* Floating Rating Badge */}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                        <FaStar className="text-yellow-400 text-[10px]" />
                        <span className="text-[10px] font-black text-slate-800">{hospital.rating}</span>
                    </div>

                    {/* Distance Pin */}
                    <div className="absolute bottom-4 left-4 flex items-center gap-1.5 text-white text-[10px] font-black uppercase tracking-widest">
                        <FaMapMarkerAlt className="text-[#08B36A]" /> {hospital.distance} km
                    </div>
                </div>

                {/* Content Section */}
                <div className="space-y-4 w-full">
                    <div className="space-y-1 px-4">
                        <h3 className="text-lg md:text-2xl font-black text-slate-900 uppercase tracking-tighter group-hover:text-[#08B36A] transition-colors">
                            {hospital.name}
                        </h3>
                        <p className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-widest truncate">
                            {hospital.address}
                        </p>
                    </div>

                    {/* Mini Stats Bar */}
                    <div className="flex items-center justify-center gap-6 py-4 bg-slate-50/50 rounded-2xl mx-4">
                        <div className="flex items-center gap-2">
                            <FaUserMd className="text-[#08B36A] text-xs" />
                            <span className="text-[10px] font-black text-slate-600 uppercase">{hospital.doctors || '35'}+ Staff</span>
                        </div>
                        <div className="h-4 w-px bg-slate-200"></div>
                        <div className="flex items-center gap-2">
                            <FaBed className="text-[#08B36A] text-xs" />
                            <span className="text-[10px] font-black text-slate-600 uppercase">{hospital.beds || '120'}+ Beds</span>
                        </div>
                    </div>

                    {/* Button Area */}
                    <div className="pt-2">
                        <button className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center mx-auto hover:bg-[#08B36A] hover:rotate-90 transition-all duration-500 shadow-xl group-hover:scale-110">
                            <FaPlus className="text-sm" />
                        </button>
                    </div>
                </div>

                {/* Background Text Overlay */}
                <span className="absolute -bottom-4 right-8 text-6xl font-black text-slate-50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none uppercase">
                    CARE
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- Optimized CSS --- */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes hospital-flow {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-hospital-flow {
          animation: hospital-flow 45s linear infinite;
        }
        .marquee-container {
          mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
        }
        @media (max-width: 768px) {
          .animate-hospital-flow {
            animation: hospital-flow 20s linear infinite;
          }
          .marquee-container {
            mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
            -webkit-mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
          }
        }
      `}} />
    </div>
  );
}

export default OurHospitalPartners;