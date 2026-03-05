"use client";

import React, { useEffect } from "react";
import {
  FaTimes,
  FaCheckCircle,
  FaMicroscope,
  FaShoppingCart,
  FaClock,
  FaInfoCircle,
  FaShieldAlt,
} from "react-icons/fa";

const TestDetailsModal = ({ isOpen, onClose, pkg }) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  if (!isOpen || !pkg) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-2 sm:p-4 md:p-6">
      {/* Backdrop with Blur */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      ></div>

      {/* Modal Window */}
      <div className="relative bg-white w-full max-w-2xl rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] md:max-h-[90vh] animate-modal-entry">

        {/* Close Button - More accessible on mobile */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 md:top-6 md:right-6 z-20 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-all active:scale-90 border border-white/20"
          aria-label="Close Modal"
        >
          <FaTimes className="text-sm md:text-base" />
        </button>

        {/* Header Section */}
        <div className="bg-gradient-to-br from-[#08B36A] to-[#058b52] p-5 md:p-8 pt-8 md:pt-10 text-white relative overflow-hidden shrink-0">
          {/* Decorative background icon */}
          <FaMicroscope className="absolute -right-4 -bottom-4 text-7xl md:text-9xl opacity-10 rotate-12" />

          <div className="flex items-center gap-2 mb-2 md:mb-3">
            <span className="bg-white/20 text-[9px] md:text-[10px] font-black uppercase tracking-[0.15em] md:tracking-[0.2em] px-2.5 py-1 rounded-full backdrop-blur-sm">
              Diagnostic Package
            </span>
          </div>

          <h2 className="text-xl md:text-3xl font-extrabold leading-tight mb-3 md:mb-4 pr-8">
            {pkg.name}
          </h2>

          <div className="flex flex-wrap gap-2 md:gap-3">
            <div className="flex items-center gap-1.5 md:gap-2 text-[9px] md:text-[11px] font-bold bg-black/10 px-2.5 py-1.5 rounded-lg uppercase">
              <FaClock className="opacity-70" /> 24-48H Report
            </div>
            <div className="flex items-center gap-1.5 md:gap-2 text-[9px] md:text-[11px] font-bold bg-black/10 px-2.5 py-1.5 rounded-lg uppercase">
              <FaShieldAlt className="opacity-70" /> NABL Accredited
            </div>
          </div>
        </div>

        {/* Body Section - Scrollable */}
        <div className="p-5 md:p-8 overflow-y-auto custom-scrollbar flex-grow bg-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 md:mb-6">
            <div>
              <h3 className="text-slate-900 font-bold text-base md:text-lg leading-none">Included Tests</h3>
              <p className="text-slate-400 text-[11px] md:text-xs mt-1">Detailed screening of your health markers</p>
            </div>
            <div className="inline-flex self-start sm:self-center text-[#08B36A] font-black text-xs bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
              {pkg.detailedTests?.length || 0} Parameters
            </div>
          </div>

          {/* Test Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
            {pkg.detailedTests?.map((test, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 md:p-4 rounded-xl md:rounded-2xl bg-slate-50 border border-slate-100 hover:border-[#08B36A]/30 hover:bg-white hover:shadow-sm transition-all duration-200 group"
              >
                <FaCheckCircle className="text-[#08B36A] text-[12px] md:text-sm flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span className="text-slate-700 font-bold text-[12px] md:text-sm tracking-tight line-clamp-1">
                  {test}
                </span>
              </div>
            ))}
          </div>

          {/* Preparation Box */}
          <div className="mt-6 md:mt-8 p-4 md:p-5 rounded-2xl md:rounded-3xl bg-amber-50 border border-amber-100 flex gap-3 md:gap-4">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
              <FaInfoCircle className="text-amber-600 text-sm md:text-base" />
            </div>
            <div>
              <h4 className="text-amber-900 font-bold text-xs md:text-sm">Patient Preparation</h4>
              <p className="text-amber-800/70 text-[10px] md:text-xs leading-relaxed mt-0.5">
                8-10 hours of fasting is required. You may drink water. Avoid alcohol and heavy exercise 24 hours prior to the test.
              </p>
            </div>
          </div>
        </div>

        {/* Footer: Price & CTA */}
        <div className="p-5 md:p-6 md:px-10 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 md:gap-6 shrink-0">
          <div className="text-center sm:text-left flex flex-row sm:flex-col items-baseline sm:items-start gap-2 sm:gap-0">
            <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest sm:mb-1">Price:</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-black text-slate-900">{pkg.discountPrice}</span>
              <span className="text-xs md:text-sm text-slate-400 line-through font-bold">
                {/* ₹{parseInt(pkg.discountPrice.replace(/\D/g, '')) + 500} */}
                {pkg.price}
              </span>
            </div>
          </div>

          <button
            className="w-full sm:w-auto bg-slate-900 hover:bg-[#08B36A] text-white font-bold px-8 md:px-10 py-3.5 md:py-4 rounded-xl md:rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest text-[10px] md:text-[11px]"
            onClick={() => {
              alert(`Proceeding with ${pkg.name}`);
              onClose();
            }}
          >
            <FaShoppingCart className="text-sm md:text-base" />
            Book Test Now
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes modalEntry {
          0% { 
            opacity: 0; 
            transform: scale(0.95) translateY(20px); 
          }
          100% { 
            opacity: 1; 
            transform: scale(1) translateY(0); 
          }
        }
        
        .animate-modal-entry {
          animation: modalEntry 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        /* Responsive Custom Scrollbar */
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        @media (min-width: 768px) {
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f8fafc;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #08B36A;
        }
      `}</style>
    </div>
  );
};

export default TestDetailsModal;