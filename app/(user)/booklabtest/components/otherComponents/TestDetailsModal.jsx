"use client";

import React from "react";
import {
  FaTimes,
  FaCheckCircle,
  FaMicroscope,
  FaShoppingCart,
  FaClock,
  FaInfoCircle,
  FaShieldAlt
} from "react-icons/fa";

const TestDetailsModal = ({ isOpen, onClose, pkg }) => {
  if (!isOpen || !pkg) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop with Blur */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      ></div>

      {/* Modal Window */}
      <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col max-h-[90vh] animate-modal-entry">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-10 p-2.5 bg-white/20 hover:bg-white/40 text-white rounded-full backdrop-blur-md transition-all active:scale-90 border border-white/10"
        >
          <FaTimes className="text-sm" />
        </button>

        {/* Header: Professional Gradient */}
        <div className="bg-gradient-to-br from-[#08B36A] to-[#058b52] p-8 pt-10 text-white relative overflow-hidden">
          {/* Decorative background icon */}
          <FaMicroscope className="absolute -right-4 -bottom-4 text-9xl opacity-10 rotate-12" />

          <div className="flex items-center gap-2 mb-3">
            <span className="bg-white/20 text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full backdrop-blur-sm">
              Diagnostic Package
            </span>
          </div>

          <h2 className="text-2xl md:text-3xl font-extrabold leading-tight mb-4">
            {pkg.name}
          </h2>

          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 text-[11px] font-bold bg-black/10 px-3 py-1.5 rounded-lg">
              <FaClock className="opacity-70" /> 24-48H REPORT
            </div>
            <div className="flex items-center gap-2 text-[11px] font-bold bg-black/10 px-3 py-1.5 rounded-lg">
              <FaShieldAlt className="opacity-70" /> NABL ACCREDITED
            </div>
          </div>
        </div>

        {/* Body Section */}
        <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-grow bg-white">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-slate-900 font-bold text-lg leading-none">Included Tests</h3>
              <p className="text-slate-400 text-xs mt-1">Detailed screening of your health markers</p>
            </div>
            <div className="text-[#08B36A] font-black text-sm bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-100">
              {pkg.detailedTests?.length || 0} Parameters
            </div>
          </div>

          {/* Test Grid: 2 Columns on desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pkg.detailedTests?.map((test, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-[#08B36A]/30 hover:bg-white hover:shadow-sm transition-all duration-200 group"
              >
                <FaCheckCircle className="text-[#08B36A] text-sm flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span className="text-slate-700 font-bold text-sm tracking-tight">
                  {test}
                </span>
              </div>
            ))}
          </div>

          {/* Preparation Box */}
          <div className="mt-8 p-5 rounded-3xl bg-amber-50 border border-amber-100 flex gap-4">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
              <FaInfoCircle className="text-amber-600" />
            </div>
            <div>
              <h4 className="text-amber-900 font-bold text-sm">Patient Preparation</h4>
              <p className="text-amber-800/70 text-xs leading-relaxed mt-0.5">
                8-10 hours of fasting is required. You may drink water. Avoid alcohol and heavy exercise 24 hours prior to the test.
              </p>
            </div>
          </div>
        </div>

        {/* Footer: Price & CTA */}
        <div className="p-6 md:px-10 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-left">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Package Price</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">{pkg.discountPrice}</span>
              <span className="text-sm text-slate-400 line-through font-bold">₹{parseInt(pkg.discountPrice.replace(/\D/g, '')) + 500}</span>
            </div>
          </div>

          <button
            className="w-full sm:w-auto bg-slate-900 hover:bg-[#08B36A] text-white font-bold px-10 py-4 rounded-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest text-[11px]"
            onClick={() => {
              alert(`Proceeding with ${pkg.name}`);
              onClose();
            }}
          >
            <FaShoppingCart className="text-base" />
            Book Test Now
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes modalEntry {
          0% { opacity: 0; transform: scale(0.9) translateY(20px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        
        .animate-modal-entry {
          animation: modalEntry 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
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