"use client";

import React, { useState, useEffect } from "react";
import {
    FaStar, FaShoppingCart, FaTrashAlt,
    FaCheckCircle, FaInfoCircle, FaClock, FaVial,
    FaHistory, FaClinicMedical, FaShieldAlt, FaArrowLeft, FaExclamationTriangle
} from "react-icons/fa";
import { useCart } from "@/app/context/CartContext";
import toast from "react-hot-toast";

const PackageDetailsModal = ({ isOpen, onClose, pkg }) => {
    // Consume functions and current cart state from Context
    const { cart, cartItemIds, addItem, removeItem } = useCart();

    const [selectedLab, setSelectedLab] = useState(null);

    // Identify if this specific package is already in the cart
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
            // 1. Handle Removal
            try {
                await removeItem(addedLabPackage._id);
                toast.success("Item removed from cart.");
            } catch (error) {
                toast.error("Failed to remove from cart.");
            }
        } else {
            // 2. Premium Category Restriction Logic (Pathology vs Radiology)
            if (cart && cart.items?.length > 0 && cart.categoryType) {
                const currentCartType = cart.categoryType;
                const newItemType = pkg.mainCategory;

                if (currentCartType !== newItemType) {
                    // Modern Custom Designed Popup
                    toast.custom((t) => (
                        <div className={`${t.visible ? 'animate-in fade-in slide-in-from-bottom-4' : 'animate-out fade-out slide-out-to-bottom-4'} max-w-md w-full bg-white shadow-2xl rounded-[1.5rem] pointer-events-auto flex flex-col overflow-hidden border border-slate-100`}>
                            <div className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500">
                                        <FaExclamationTriangle size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-base font-bold text-slate-900 leading-tight">Order Mismatch</p>
                                        <p className="mt-1 text-sm text-slate-500 leading-relaxed">
                                            Your cart has <span className="font-bold text-slate-700">{currentCartType}</span> items. You cannot mix them with <span className="font-bold text-slate-700">{newItemType}</span>.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-slate-50 px-6 py-4 flex items-center justify-end gap-3">
                                <button 
                                    onClick={() => toast.dismiss(t.id)}
                                    className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={async () => {
                                        toast.dismiss(t.id);
                                        // We need the lab selection to clear and add
                                        if (selectedLab) {
                                            await addItem(selectedLab.labId, selectedLab._id, 'LabPackage', true);
                                        } else {
                                            toast.error("Please select a lab first");
                                            document.getElementById('lab-selection-area')?.scrollIntoView({ behavior: 'smooth' });
                                        }
                                    }}
                                    className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-slate-200 hover:bg-emerald-600 transition-all active:scale-95"
                                >
                                    Clear & Add Package
                                </button>
                            </div>
                        </div>
                    ), { position: 'bottom-center', duration: 6000 });
                    return; 
                }
            }

            // 3. Validation: Lab selection
            if (!selectedLab) {
                toast.error("Please choose a laboratory first!", {
                    icon: '🏥',
                    style: {
                        borderRadius: '12px',
                        background: '#333',
                        color: '#fff',
                    },
                });
                document.getElementById('lab-selection-area')?.scrollIntoView({ behavior: 'smooth' });
                return;
            }

            // 4. Add to Cart ( addItem in context handles success toast)
            try {
                await addItem(selectedLab.labId, selectedLab._id, 'LabPackage');
            } catch (error) {
                toast.error("Something went wrong while adding to cart.");
            }
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
                                <span className="bg-emerald-50 text-emerald-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase border border-emerald-100">
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
                            <ClinicalSpec icon={<FaVial />} label="Sample" value={pkg.sampleTypes?.join(", ") || "N/A"} />
                            <ClinicalSpec icon={<FaHistory />} label="Fasting" value={pkg.isFastingRequired ? pkg.fastingDuration : "Not Required"} />
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
                                            className={`p-5 rounded-2xl border-2 transition-all flex items-center justify-between ${isSelected
                                                    ? "border-emerald-500 bg-emerald-50/30"
                                                    : isAdded ? "border-slate-100 opacity-50 cursor-not-allowed" : "border-slate-100 bg-white hover:border-slate-200 cursor-pointer"
                                                }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${isSelected ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"}`}>
                                                    <FaClinicMedical size={20} />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-800 text-sm tracking-tight uppercase">Partner Laboratory</h4>
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
                                <p className="text-[10px] text-emerald-600 font-bold mt-4 flex items-center gap-2 uppercase tracking-tighter">
                                    <FaCheckCircle /> Inclusive of all taxes and fees
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
    <div className="flex items-center gap-4 text-sm font-bold uppercase tracking-tight">
        <span className={active ? "text-emerald-500" : "text-slate-200"}>{icon}</span>
        <span className={active ? "text-slate-700" : "text-slate-300"}>{text}</span>
    </div>
);

export default PackageDetailsModal;