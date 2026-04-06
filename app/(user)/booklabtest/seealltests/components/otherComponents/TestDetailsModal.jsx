"use client";

import React, { useState, useEffect } from "react";
import {
  FaTimes, FaStar, FaShoppingCart, FaTrashAlt,
  FaCheckCircle, FaInfoCircle, FaClock, FaVial,
  FaShieldAlt, FaClinicMedical, FaArrowLeft, FaArrowRight
} from "react-icons/fa";

const TestDetailsModal = ({ isOpen, onClose, test, onAddToCart, isAdded }) => {
  const [selectedLab, setSelectedLab] = useState(null);

  // Reset selection when modal opens
  useEffect(() => {
    setSelectedLab(null);
  }, [test, isOpen]);

  if (!isOpen || !test) return null;

  // Pricing Logic
  const displayPrice = selectedLab
    ? selectedLab.discountPrice
    : (test.vendorList?.length > 0 ? Math.min(...test.vendorList.map(v => v.discountPrice)) : test.standardMRP);

  const handleAction = () => {
    if (!selectedLab) {
      document.getElementById('lab-selection-area')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    onAddToCart({ ...test, selectedPartner: selectedLab });
  };

  return (
    <div className="fixed inset-0 z-[200] bg-white overflow-y-auto animate-in fade-in duration-300">
      {/* --- 1. CLINICAL NAVIGATION --- */}
      <nav className="sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-emerald-600 transition-colors"
          >
            <FaArrowLeft size={14} />
            <span>Back to Catalog</span>
          </button>
          <div className="flex items-center gap-3">
            <span className="hidden md:block text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              Test Code: {test.testCode || 'N/A'}
            </span>
            <div className="h-4 w-px bg-slate-200 hidden md:block"></div>
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
              <FaShieldAlt /> Quality Assured
            </span>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-12">

          {/* --- 2. MAIN CONTENT (LEFT) --- */}
          <div className="flex-1">
            {/* Header Section */}
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-emerald-50 text-emerald-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wide border border-emerald-100">
                  {test.mainCategory}
                </span>
                <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                  <FaStar /> 4.8 <span className="text-slate-400 font-medium">(Verified)</span>
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 uppercase tracking-tight">
                {test.testName}
              </h1>
              <p className="text-slate-600 text-base leading-relaxed max-w-3xl font-medium">
                Professional diagnostic screening for {test.testName}. This test is performed using high-precision equipment to ensure clinical accuracy.
              </p>
            </div>

            {/* Specs Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              <ClinicalSpec icon={<FaVial />} label="Sample Type" value={test.sampleType} />
              <ClinicalSpec icon={<FaShieldAlt />} label="Preparation" value={test.pretestPreparation || "No Fasting"} />
              <ClinicalSpec icon={<FaClock />} label="Turnaround" value="24 Hours" />
              <ClinicalSpec icon={<FaClinicMedical />} label="Availability" value={`${test.vendorCount} Labs`} />
            </div>

            {/* Lab Selection Area */}
            <section id="lab-selection-area" className="mb-12 scroll-mt-24">
              <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <span className="w-1 h-6 bg-emerald-500 rounded-full"></span>
                1. Select Preferred Laboratory
              </h3>
              <div className="grid gap-4">
                {test.vendorList?.map((vendor) => {
                  const isSelected = selectedLab?._id === vendor._id;
                  return (
                    <div
                      key={vendor._id}
                      onClick={() => setSelectedLab(vendor)}
                      className={`p-5 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${isSelected ? "border-emerald-500 bg-emerald-50/30" : "border-slate-100 bg-white hover:border-slate-200 shadow-sm"
                        }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${isSelected ? "bg-emerald-500 text-white" : "bg-slate-50 text-slate-400"
                          }`}>
                          <FaClinicMedical size={18} />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm uppercase">Diagnostic Partner Lab</h4>
                          <p className="text-[11px] text-slate-500 font-medium">Report Delivery: {vendor.reportTime} Hours</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-bold text-slate-900">₹{vendor.discountPrice}</p>
                        <p className="text-[10px] text-emerald-600 font-bold uppercase">{vendor.discountPercent}% SAVINGS</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Test Parameters */}
            <section className="mb-12">
              <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <span className="w-1 h-6 bg-emerald-500 rounded-full"></span>
                2. Test Parameters
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {test.parameters?.map((p, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl text-[11px] font-bold text-slate-600 uppercase border border-slate-100">
                    <FaCheckCircle className="text-emerald-500" /> {p}
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* --- 3. BOOKING SUMMARY (RIGHT) --- */}
          <div className="w-full lg:w-96">
            <div className="sticky top-28 bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
              <div className="mb-6 pb-6 border-b border-slate-100">
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">Service Fee</p>
                <div className="flex items-baseline gap-2">
                  <h2 className="text-4xl font-bold text-slate-900 tracking-tight">₹{displayPrice}</h2>
                  <span className="text-slate-400 line-through text-lg font-medium">₹{test.standardMRP}</span>
                </div>
                <p className="text-[10px] text-emerald-600 font-bold mt-2 flex items-center gap-1 uppercase">
                  <FaCheckCircle /> All Inclusive Pricing
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <SummaryItem icon={<FaClinicMedical />} text={selectedLab ? "Provider Selected" : "Laboratory Not Selected"} active={!!selectedLab} />
                <SummaryItem icon={<FaShieldAlt />} text="ISO Certified Processing" active={true} />
                <SummaryItem icon={<FaInfoCircle />} text="Digital Report Delivery" active={true} />
              </div>

              <button
                onClick={handleAction}
                className={`w-full py-4 rounded-xl font-bold text-xs uppercase tracking-[0.1em] transition-all flex items-center justify-center gap-3 ${!selectedLab
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : isAdded
                    ? "bg-rose-50 text-rose-600 border border-rose-100"
                    : "bg-slate-900 text-white hover:bg-emerald-600 shadow-lg shadow-slate-200"
                  }`}
              >
                {!selectedLab ? (
                  "Select Lab to Proceed"
                ) : isAdded ? (
                  <><FaTrashAlt /> Remove from Booking</>
                ) : (
                  <><FaShoppingCart /> Add to Booking</>
                )}
              </button>

              <p className="text-center text-[10px] text-slate-400 font-bold uppercase mt-6 tracking-tight">
                Step 2: Finalize at Checkout
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* --- MOBILE FOOTER --- */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 z-50 flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase">Service Total</p>
          <p className="text-xl font-bold text-slate-900">₹{displayPrice}</p>
        </div>
        <button
          onClick={handleAction}
          className={`flex-1 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all ${!selectedLab ? "bg-slate-100 text-slate-400" : isAdded ? "bg-rose-500 text-white" : "bg-emerald-600 text-white"
            }`}
        >
          {isAdded ? "Remove" : selectedLab ? "Add to Cart" : "Select Lab"}
        </button>
      </div>
    </div>
  );
};

// --- HELPERS ---

const ClinicalSpec = ({ icon, label, value }) => (
  <div className="p-4 rounded-xl border border-slate-100 bg-white">
    <div className="text-emerald-500 mb-2">{icon}</div>
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
    <p className="text-xs font-bold text-slate-800">{value}</p>
  </div>
);

const SummaryItem = ({ icon, text, active }) => (
  <div className="flex items-center gap-3 text-xs">
    <span className={active ? "text-emerald-500" : "text-slate-300"}>{icon}</span>
    <span className={`font-semibold uppercase tracking-tight ${active ? "text-slate-700" : "text-slate-400"}`}>{text}</span>
  </div>
);

export default TestDetailsModal;