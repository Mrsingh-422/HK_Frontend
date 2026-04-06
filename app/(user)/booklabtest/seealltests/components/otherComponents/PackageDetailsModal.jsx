"use client";

import React, { useState, useEffect } from "react";
import {
    FaStar, FaShoppingCart, FaTrashAlt,
    FaCheckCircle, FaInfoCircle, FaClock, FaVial,
    FaHistory, FaClinicMedical, FaShieldAlt, FaArrowLeft
} from "react-icons/fa";
import { useCart } from "@/app/context/CartContext";

const PackageDetailsModal = ({ isOpen, onClose, pkg }) => {
    // Consume functions from your CartContext
    const { cartItemIds, addItem, removeItem } = useCart();
    
    const [selectedLab, setSelectedLab] = useState(null);

    // To check if this package is already in the cart, we check if 
    // any of the IDs in the vendorList exist in our cartItemIds array.
    const addedLabPackage = pkg?.vendorList?.find(lab => cartItemIds.includes(lab._id));
    const isAdded = !!addedLabPackage;

    // Reset or pre-select lab on open
    useEffect(() => {
        if (isOpen && isAdded) {
            setSelectedLab(addedLabPackage);
        } else if (isOpen) {
            setSelectedLab(null);
        }
    }, [isOpen, isAdded, pkg, addedLabPackage]);

    if (!isOpen || !pkg) return null;

    const displayPrice = selectedLab ? selectedLab.offerPrice : pkg.minPrice;
    const strikePrice = selectedLab ? selectedLab.mrp : pkg.standardMRP;

    const handleFinalAction = async (e) => {
        if (e) e.stopPropagation();

        if (isAdded) {
            // Remove the specific lab-package ID currently in the cart
            await removeItem(addedLabPackage._id);
        } else {
            if (!selectedLab) {
                document.getElementById('lab-selection-area')?.scrollIntoView({ behavior: 'smooth' });
                return;
            }
            
            /**
             * PAYLOAD LOGIC:
             * labId: The diagnostic center's ID (selectedLab.labId)
             * itemId: The unique package offering ID (selectedLab._id)
             * productType: 'LabPackage' (Matches your Mongoose refPath)
             */
            await addItem(selectedLab.labId, selectedLab._id, 'LabPackage');
        }
    };

    return (
        <div className="fixed inset-0 z-[200] bg-white overflow-y-auto animate-in fade-in duration-300">
            {/* --- NAVIGATION --- */}
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
                            Ref: {pkg._id.slice(-8).toUpperCase()}
                        </span>
                        <div className="h-4 w-px bg-slate-200 hidden md:block"></div>
                        <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                            <FaShieldAlt /> Secure Booking
                        </span>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
                <div className="flex flex-col lg:flex-row gap-12">

                    {/* --- LEFT CONTENT --- */}
                    <div className="flex-1">
                        <div className="mb-10">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="bg-emerald-50 text-emerald-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wide border border-emerald-100">
                                    {pkg.mainCategory} • {pkg.category}
                                </span>
                                <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                                    <FaStar /> 4.8 <span className="text-slate-400 font-medium">(Verified)</span>
                                </div>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                                {pkg.packageName}
                            </h1>
                            <p className="text-slate-600 text-base leading-relaxed max-w-3xl">
                                {pkg.shortDescription}. Designed for {pkg.gender} health, suitable for {pkg.ageGroup} age groups.
                            </p>
                        </div>

                        {/* Specs Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                            <ClinicalSpec icon={<FaClock />} label="Reports" value={pkg.reportTime} />
                            <ClinicalSpec icon={<FaVial />} label="Sample" value={pkg.sampleTypes?.join(", ")} />
                            <ClinicalSpec icon={<FaHistory />} label="Fasting" value={pkg.isFastingRequired ? "Required" : "Not Required"} />
                            <ClinicalSpec icon={<FaClinicMedical />} label="Providers" value={`${pkg.vendorCount} Labs`} />
                        </div>

                        {/* Lab Selection Grid */}
                        <section id="lab-selection-area" className="mb-12 scroll-mt-24">
                            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <span className="w-1 h-6 bg-emerald-500 rounded-full"></span>
                                Choose a Diagnostic Center
                            </h3>
                            <div className="grid gap-4">
                                {pkg.vendorList?.map((lab) => {
                                    const isSelected = selectedLab?._id === lab._id;
                                    const labInCart = cartItemIds.includes(lab._id);

                                    return (
                                        <div
                                            key={lab._id}
                                            onClick={() => !isAdded && setSelectedLab(lab)}
                                            className={`p-5 rounded-2xl border-2 transition-all flex items-center justify-between ${
                                                isSelected 
                                                ? "border-emerald-500 bg-emerald-50/30" 
                                                : isAdded ? "border-slate-100 opacity-50 cursor-not-allowed" : "border-slate-100 bg-white hover:border-slate-200 cursor-pointer"
                                            }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${isSelected ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"}`}>
                                                    <FaClinicMedical size={20} />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-800 text-sm">Partner Laboratory</h4>
                                                    <p className="text-[11px] text-slate-500 font-medium">Expected Report: {lab.reportTime}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="flex items-center gap-2 justify-end">
                                                    {lab.mrp > lab.offerPrice && (
                                                        <span className="text-xs text-slate-400 line-through">₹{lab.mrp}</span>
                                                    )}
                                                    <p className="text-lg font-black text-slate-900">₹{lab.offerPrice}</p>
                                                </div>
                                                <p className="text-[10px] text-emerald-600 font-bold uppercase">{lab.discountPercent}% Savings</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>

                        {/* Breakdown Section */}
                        <section>
                            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <span className="w-1 h-6 bg-emerald-500 rounded-full"></span>
                                Package Details
                            </h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                {pkg.detailedDescription?.map((item) => (
                                    <div key={item._id} className="p-6 rounded-2xl border border-slate-100 bg-slate-50/50">
                                        <h4 className="font-bold text-slate-900 text-xs mb-2 uppercase tracking-widest">{item.sectionTitle}</h4>
                                        <p className="text-xs text-slate-600 leading-relaxed font-medium">{item.sectionContent}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* --- RIGHT SUMMARY PANEL --- */}
                    <div className="w-full lg:w-96">
                        <div className="sticky top-28 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm p-8">
                            <div className="mb-8 pb-8 border-b border-slate-100">
                                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">Selected Price</p>
                                <div className="flex items-baseline gap-2">
                                    <h2 className="text-5xl font-black text-slate-900">₹{displayPrice}</h2>
                                    {strikePrice > displayPrice && (
                                        <span className="text-slate-400 line-through text-xl">₹{strikePrice}</span>
                                    )}
                                </div>
                                <p className="text-[10px] text-emerald-600 font-bold mt-4 flex items-center gap-2">
                                    <FaCheckCircle /> Taxes and Collection Fees Included
                                </p>
                            </div>

                            <div className="space-y-5 mb-10">
                                <SummaryItem icon={<FaClinicMedical />} text={selectedLab ? "Center Selected" : "Select a Center"} active={!!selectedLab} />
                                <SummaryItem icon={<FaCheckCircle />} text={`${pkg.tests?.length} Parameters Tested`} active={true} />
                                <SummaryItem icon={<FaInfoCircle />} text="Digital Reports Included" active={true} />
                            </div>

                            <button
                                onClick={handleFinalAction}
                                className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${
                                    isAdded 
                                    ? "bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-600 hover:text-white" 
                                    : !selectedLab
                                        ? "bg-slate-100 text-slate-400 cursor-pointer"
                                        : "bg-emerald-600 text-white hover:bg-slate-900 shadow-xl shadow-emerald-200"
                                }`}
                            >
                                {isAdded ? (
                                    <><FaTrashAlt /> Remove from Cart</>
                                ) : (
                                    <><FaShoppingCart /> {selectedLab ? "Add to Cart" : "Choose Lab Above"}</>
                                )}
                            </button>

                            <p className="text-[10px] text-slate-400 font-medium text-center mt-6 uppercase tracking-tighter">
                                Guaranteed Secure Booking via Health Kangaroo
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- SUBSIDIARY COMPONENTS ---
const ClinicalSpec = ({ icon, label, value }) => (
    <div className="p-4 rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="text-emerald-500 mb-2">{icon}</div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-xs font-black text-slate-800">{value}</p>
    </div>
);

const SummaryItem = ({ icon, text, active }) => (
    <div className="flex items-center gap-4 text-sm">
        <span className={active ? "text-emerald-500" : "text-slate-200"}>{icon}</span>
        <span className={`font-bold ${active ? "text-slate-700" : "text-slate-300"}`}>{text}</span>
    </div>
);

export default PackageDetailsModal;