"use client";

import React, { useState, useEffect } from "react";
import {
    FaShoppingCart, FaTrashAlt, FaCheckCircle, FaInfoCircle, 
    FaClock, FaVial, FaHistory, FaClinicMedical, FaShieldAlt, 
    FaArrowLeft, FaExclamationTriangle, FaListUl, FaQuestionCircle, 
    FaUserFriends, FaTag, FaFlask, FaRegFileAlt
} from "react-icons/fa";
import { useCart } from "@/app/context/CartContext";
import toast from "react-hot-toast";

const PackageDetailsModal = ({ isOpen, onClose, pkg }) => {
    const { cart, cartItemIds, addItem, removeItem } = useCart();
    const [selectedLab, setSelectedLab] = useState(null);

    const addedLabPackage = pkg?.vendorList?.find(lab => cartItemIds.includes(lab._id));
    const isAdded = !!addedLabPackage;

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            if (isAdded) {
                setSelectedLab(addedLabPackage);
            } else if (pkg?.vendorList?.length > 0) {
                setSelectedLab(pkg.vendorList[0]);
            }
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen, isAdded, pkg, addedLabPackage]);

    if (!isOpen || !pkg) return null;

    const displayPrice = selectedLab ? selectedLab.offerPrice : pkg.minPrice;
    const strikePrice = selectedLab ? selectedLab.mrp : pkg.standardMRP;
    const discount = selectedLab ? selectedLab.discountPercent : 0;

    const handleFinalAction = async () => {
        if (isAdded) {
            try {
                await removeItem(addedLabPackage._id);
                toast.success("Removed from cart");
            } catch (error) {
                toast.error("Error removing item");
            }
        } else {
            // Cart Mismatch Logic
            if (cart?.items?.length > 0 && cart.categoryType !== pkg.mainCategory) {
                toast.error(`You cannot mix ${cart.categoryType} with ${pkg.mainCategory}. Clear cart first.`);
                return;
            }

            if (!selectedLab) {
                toast.error("Please select a lab");
                return;
            }

            try {
                await addItem(selectedLab.labId, selectedLab._id, 'LabPackage');
                toast.success("Added to cart!");
            } catch (error) {
                toast.error("Failed to add to cart");
            }
        }
    };

    return (
        <div className="fixed inset-0 z-[999] bg-white w-full h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
            
            {/* --- HEADER --- */}
            <header className="h-16 border-b border-slate-100 flex items-center justify-between px-4 md:px-8 sticky top-0 bg-white z-10">
                <button onClick={onClose} className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 font-semibold transition-colors">
                    <FaArrowLeft /> <span>Back</span>
                </button>
                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                        <FaShieldAlt className="text-emerald-500" /> 100% Safe & Secure
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto">
                <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-12">
                    <div className="flex flex-col lg:flex-row gap-12">
                        
                        {/* --- LEFT CONTENT: PRODUCT INFO --- */}
                        <div className="flex-1">
                            {/* Title Section */}
                            <div className="mb-8">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-100">
                                        {pkg.mainCategory}
                                    </span>
                                    {pkg.tags?.map((tag, i) => (
                                        <span key={i} className="bg-slate-100 text-slate-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                                <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
                                    {pkg.packageName}
                                </h1>
                                <p className="text-slate-500 text-lg leading-relaxed font-medium">
                                    {pkg.shortDescription}
                                </p>
                            </div>

                            {/* Quick Stats Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                                <StatCard icon={<FaClock className="text-blue-500" />} label="Reports in" value={pkg.reportTime} />
                                <StatCard icon={<FaVial className="text-rose-500" />} label="Sample" value={pkg.sampleTypes?.join("/")} />
                                <StatCard icon={<FaHistory className="text-amber-500" />} label="Fasting" value={pkg.isFastingRequired ? "Required" : "No"} />
                                <StatCard icon={<FaUserFriends className="text-purple-500" />} label="Gender" value={pkg.gender} />
                            </div>

                            {/* Lab Selection Section */}
                            <section className="mb-12">
                                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <FaClinicMedical className="text-emerald-500" /> Select Laboratory
                                </h3>
                                <div className="grid gap-4">
                                    {pkg.vendorList?.map((lab) => {
                                        const isSelected = selectedLab?._id === lab._id;
                                        return (
                                            <div
                                                key={lab._id}
                                                onClick={() => !isAdded && setSelectedLab(lab)}
                                                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                                                    isSelected ? "border-emerald-500 bg-emerald-50/30" : "border-slate-100 hover:border-slate-200 bg-white"
                                                } ${isAdded && !isSelected ? "opacity-50 grayscale pointer-events-none" : ""}`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isSelected ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"}`}>
                                                        <FaClinicMedical size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900">Partner Lab Center</p>
                                                        <p className="text-xs text-slate-500 font-medium">{lab.totalTestsIncluded} Parameters included</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-lg font-black text-slate-900">₹{lab.offerPrice}</p>
                                                    {lab.discountPercent > 0 && <p className="text-[10px] font-bold text-emerald-600 uppercase">Save {lab.discountPercent}%</p>}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>

                            {/* Details & Prep Grid */}
                            <div className="grid md:grid-cols-2 gap-8 mb-12">
                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                    <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><FaRegFileAlt className="text-blue-500"/> Overview</h4>
                                    <ul className="space-y-3">
                                        {pkg.detailedDescription?.map((desc, i) => (
                                            <li key={i} className="text-sm text-slate-600 leading-relaxed">
                                                <span className="font-bold block text-slate-800 text-xs uppercase mb-1">{desc.sectionTitle}</span>
                                                {desc.sectionContent}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="bg-amber-50/50 p-6 rounded-2xl border border-amber-100">
                                    <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><FaListUl className="text-amber-500"/> Preparation</h4>
                                    <ul className="space-y-3">
                                        {pkg.preparations?.map((prep, i) => (
                                            <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                                                {prep}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* FAQs */}
                            {pkg.faqs?.length > 0 && (
                                <section>
                                    <h3 className="text-xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h3>
                                    <div className="space-y-3">
                                        {pkg.faqs.map((faq, i) => (
                                            <div key={i} className="p-4 rounded-xl border border-slate-100 bg-white">
                                                <p className="font-bold text-slate-900 text-sm mb-1">{faq.question}</p>
                                                <p className="text-sm text-slate-500">{faq.answer}</p>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>

                        {/* --- RIGHT SIDEBAR: PRICING CARD --- */}
                        <div className="w-full lg:w-80">
                            <div className="sticky top-28 bg-white border border-slate-200 rounded-3xl shadow-xl p-6 overflow-hidden">
                                <div className="absolute top-0 right-0 p-4">
                                    <FaShieldAlt className="text-slate-100 text-6xl rotate-12" />
                                </div>
                                
                                <div className="relative z-10">
                                    <p className="text-xs font-bold text-slate-400 uppercase mb-2">Total Price</p>
                                    <div className="flex items-baseline gap-2 mb-1">
                                        <span className="text-4xl font-black text-slate-900">₹{displayPrice}</span>
                                        {strikePrice > displayPrice && (
                                            <span className="text-slate-400 line-through font-bold">₹{strikePrice}</span>
                                        )}
                                    </div>
                                    {discount > 0 && (
                                        <p className="text-xs font-bold text-emerald-600 mb-6 bg-emerald-50 px-2 py-1 rounded inline-block">
                                            You are saving ₹{strikePrice - displayPrice}
                                        </p>
                                    )}

                                    <div className="space-y-4 mb-8">
                                        <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                                            <FaCheckCircle className="text-emerald-500 shrink-0" />
                                            <span>Home Sample Pickup</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                                            <FaCheckCircle className="text-emerald-500 shrink-0" />
                                            <span>Smart Reports (PDF)</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                                            <FaCheckCircle className="text-emerald-500 shrink-0" />
                                            <span>Doctor Consultation</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleFinalAction}
                                        className={`w-full py-4 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all ${
                                            isAdded 
                                            ? "bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-600 hover:text-white" 
                                            : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200"
                                        }`}
                                    >
                                        {isAdded ? (
                                            <span className="flex items-center justify-center gap-2"><FaTrashAlt /> Remove from Cart</span>
                                        ) : (
                                            <span className="flex items-center justify-center gap-2"><FaShoppingCart /> Add to Cart</span>
                                        )}
                                    </button>

                                    <p className="text-[10px] text-center text-slate-400 font-bold mt-6 uppercase tracking-widest">
                                        Secure Checkout Enabled
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* --- MOBILE STICKY FOOTER --- */}
            <div className="lg:hidden bg-white border-t border-slate-100 p-4 flex items-center justify-between sticky bottom-0 z-20">
                <div>
                    <p className="text-2xl font-black text-slate-900">₹{displayPrice}</p>
                    <p className="text-[10px] text-emerald-600 font-bold uppercase">Incl. all taxes</p>
                </div>
                <button
                    onClick={handleFinalAction}
                    className={`px-8 py-3 rounded-xl font-bold text-xs uppercase transition-all ${
                        isAdded ? "bg-rose-600 text-white" : "bg-emerald-600 text-white"
                    }`}
                >
                    {isAdded ? "Remove" : "Add to Cart"}
                </button>
            </div>
        </div>
    );
};

// UI Components
const StatCard = ({ icon, label, value }) => (
    <div className="bg-white border border-slate-100 p-4 rounded-2xl flex flex-col items-center text-center">
        <div className="text-lg mb-2">{icon}</div>
        <p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">{label}</p>
        <p className="text-[11px] font-bold text-slate-900 truncate w-full">{value}</p>
    </div>
);

export default PackageDetailsModal;