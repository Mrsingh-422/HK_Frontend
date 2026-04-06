"use client";

import React, { useState, useEffect } from "react";
import {
    FaTimes, FaStar, FaShoppingCart, FaTrashAlt,
    FaCheckCircle, FaInfoCircle, FaClock, FaVial,
    FaHistory, FaClinicMedical, FaShieldAlt, FaArrowLeft
} from "react-icons/fa";

const PackageDetailsModal = ({ isOpen, onClose, pkg, onCartToggle, isAdded }) => {
    const [selectedLab, setSelectedLab] = useState(null);

    // Reset selection when modal opens
    useEffect(() => {
        setSelectedLab(null);
    }, [pkg, isOpen]);

    if (!isOpen || !pkg) return null;

    const displayPrice = selectedLab ? selectedLab.offerPrice : pkg.minPrice;
    const strikePrice = selectedLab ? selectedLab.mrp : pkg.standardMRP;

    const handleFinalAction = (e) => {
        if (!selectedLab) {
            document.getElementById('lab-selection-area')?.scrollIntoView({ behavior: 'smooth' });
            return;
        }
        onCartToggle({ ...pkg, selectedLab }, e);
    };

    return (
        <div className="fixed inset-0 z-[200] bg-white overflow-y-auto animate-in fade-in duration-300">
            {/* --- 1. CLEAN NAVIGATION --- */}
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
                            Package ID: {pkg._id.slice(-8).toUpperCase()}
                        </span>
                        <div className="h-4 w-px bg-slate-200 hidden md:block"></div>
                        <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                            <FaShieldAlt /> Secure Selection
                        </span>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
                <div className="flex flex-col lg:flex-row gap-12">

                    {/* --- 2. MAIN CONTENT (LEFT) --- */}
                    <div className="flex-1">
                        {/* Hero Header */}
                        <div className="mb-10">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="bg-emerald-50 text-emerald-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wide border border-emerald-100">
                                    Quality Assured
                                </span>
                                <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                                    <FaStar /> 4.8 <span className="text-slate-400 font-medium">(1.2k Reviews)</span>
                                </div>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                                {pkg.packageName}
                            </h1>
                            <p className="text-slate-600 text-base leading-relaxed max-w-3xl">
                                {pkg.shortDescription}. This clinical screening is designed to monitor vital health markers using ISO-certified laboratory standards.
                            </p>
                        </div>

                        {/* Clinical Specs Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                            <ClinicalSpec icon={<FaClock />} label="Report Turnaround" value={pkg.reportTime} />
                            <ClinicalSpec icon={<FaVial />} label="Sample Type" value={pkg.sampleTypes?.join(", ")} />
                            <ClinicalSpec icon={<FaHistory />} label="Fasting Requirement" value={pkg.isFastingRequired ? pkg.fastingDuration : "No Fasting"} />
                            <ClinicalSpec icon={<FaClinicMedical />} label="Lab Availability" value={`${pkg.vendorCount} Locations`} />
                        </div>

                        {/* Lab Selection Section */}
                        <section id="lab-selection-area" className="mb-12 scroll-mt-24">
                            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <span className="w-1 h-6 bg-emerald-500 rounded-full"></span>
                                1. Select Laboratory Provider
                            </h3>
                            <div className="grid gap-4">
                                {pkg.vendorList?.map((lab) => {
                                    const isSelected = selectedLab?._id === lab._id;
                                    return (
                                        <div
                                            key={lab._id}
                                            onClick={() => setSelectedLab(lab)}
                                            className={`p-5 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${isSelected ? "border-emerald-500 bg-emerald-50/30" : "border-slate-100 bg-white hover:border-slate-200"
                                                }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${isSelected ? "bg-emerald-500 text-white" : "bg-slate-50 text-slate-400"
                                                    }`}>
                                                    <FaClinicMedical size={18} />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-800 text-sm">Diagnostic Partner Lab</h4>
                                                    <p className="text-[11px] text-slate-500 font-medium">Reporting: {lab.reportTime || pkg.reportTime}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-base font-bold text-slate-900">₹{lab.offerPrice}</p>
                                                <p className="text-[10px] text-emerald-600 font-bold uppercase">{lab.discountPercent}% OFF</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>

                        {/* Package Breakdown */}
                        <section>
                            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <span className="w-1 h-6 bg-emerald-500 rounded-full"></span>
                                2. Package Insights & Preparation
                            </h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                {pkg.detailedDescription?.map((item) => (
                                    <div key={item._id} className="p-6 rounded-xl border border-slate-100 bg-slate-50/50">
                                        <h4 className="font-bold text-slate-900 text-sm mb-2 uppercase tracking-wide">{item.sectionTitle}</h4>
                                        <p className="text-xs text-slate-600 leading-relaxed font-medium">{item.sectionContent}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* --- 3. SUMMARY CARD (RIGHT) --- */}
                    <div className="w-full lg:w-96">
                        <div className="sticky top-28 bg-white border border-slate-200 rounded-2xl shadow-sm p-6 md:p-8">
                            <div className="mb-6 pb-6 border-b border-slate-100">
                                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">Total Amount</p>
                                <div className="flex items-baseline gap-2">
                                    <h2 className="text-4xl font-bold text-slate-900">₹{displayPrice}</h2>
                                    <span className="text-slate-400 line-through text-lg">₹{strikePrice}</span>
                                </div>
                                <p className="text-[10px] text-emerald-600 font-semibold mt-2 flex items-center gap-1">
                                    <FaCheckCircle /> Inclusive of all taxes and collection
                                </p>
                            </div>

                            <div className="space-y-4 mb-8">
                                <SummaryItem icon={<FaClinicMedical />} text={selectedLab ? "Lab Selected" : "Select a Lab Partner"} active={!!selectedLab} />
                                <SummaryItem icon={<FaCheckCircle />} text={`${pkg.tests?.length} Parameters Included`} active={true} />
                                <SummaryItem icon={<FaInfoCircle />} text="Digital Reports Available" active={true} />
                            </div>

                            <button
                                onClick={handleFinalAction}
                                className={`w-full py-4 rounded-xl font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-3 ${!selectedLab
                                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                        : isAdded
                                            ? "bg-rose-50 text-rose-600 border border-rose-100"
                                            : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20"
                                    }`}
                            >
                                {isAdded ? (
                                    <><FaTrashAlt /> Remove from Booking</>
                                ) : (
                                    <><FaShoppingCart /> {selectedLab ? "Add to Booking" : "Select Lab to Book"}</>
                                )}
                            </button>

                            <div className="mt-6 flex flex-col items-center">
                                <p className="text-[10px] text-slate-400 font-medium text-center">
                                    Secure checkout powered by HealthLink
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- HELPER COMPONENTS ---

const ClinicalSpec = ({ icon, label, value }) => (
    <div className="p-4 rounded-xl border border-slate-100 bg-white">
        <div className="text-emerald-500 mb-2">{icon}</div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
        <p className="text-xs font-bold text-slate-800">{value}</p>
    </div>
);

const SummaryItem = ({ icon, text, active }) => (
    <div className="flex items-center gap-3 text-sm">
        <span className={active ? "text-emerald-500" : "text-slate-300"}>{icon}</span>
        <span className={`font-medium ${active ? "text-slate-700" : "text-slate-400"}`}>{text}</span>
    </div>
);

export default PackageDetailsModal;