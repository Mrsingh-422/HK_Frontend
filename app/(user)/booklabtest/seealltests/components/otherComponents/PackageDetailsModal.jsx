"use client";

import React, { useState, useEffect } from "react";
import {
    FaStar, FaShoppingCart, FaTrashAlt,
    FaCheckCircle, FaInfoCircle, FaClock, FaVial,
    FaHistory, FaClinicMedical, FaShieldAlt, FaArrowLeft, 
    FaExclamationTriangle, FaListUl, FaQuestionCircle, FaUserFriends, FaTag
} from "react-icons/fa";
import { useCart } from "@/app/context/CartContext";
import toast from "react-hot-toast";

const PackageDetailsModal = ({ isOpen, onClose, pkg }) => {
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
            try {
                await removeItem(addedLabPackage._id);
                toast.success("Item removed from cart.");
            } catch (error) {
                toast.error("Failed to remove from cart.");
            }
        } else {
            if (cart && cart.items?.length > 0 && cart.categoryType) {
                const currentCartType = cart.categoryType;
                const newItemType = pkg.mainCategory;

                if (currentCartType !== newItemType) {
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
                                <button onClick={() => toast.dismiss(t.id)} className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700">Cancel</button>
                                <button 
                                    onClick={async () => {
                                        toast.dismiss(t.id);
                                        if (selectedLab) {
                                            await addItem(selectedLab.labId, selectedLab._id, 'LabPackage', true);
                                        } else {
                                            toast.error("Please select a lab first");
                                            document.getElementById('lab-selection-area')?.scrollIntoView({ behavior: 'smooth' });
                                        }
                                    }}
                                    className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-600 transition-all"
                                >
                                    Clear & Add Package
                                </button>
                            </div>
                        </div>
                    ), { position: 'bottom-center', duration: 6000 });
                    return; 
                }
            }

            if (!selectedLab) {
                toast.error("Please choose a laboratory first!", { icon: '🏥' });
                document.getElementById('lab-selection-area')?.scrollIntoView({ behavior: 'smooth' });
                return;
            }

            try {
                await addItem(selectedLab.labId, selectedLab._id, 'LabPackage');
            } catch (error) {
                toast.error("Something went wrong while adding to cart.");
            }
        }
    };

    return (
        <div className="fixed inset-0 z-[200] bg-white overflow-y-auto animate-in fade-in duration-300">
            {/* NAVIGATION */}
            <nav className="sticky top-0 z-30 bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
                    <button onClick={onClose} className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-emerald-600 transition-colors">
                        <FaArrowLeft size={14} /> <span>Back to Catalog</span>
                    </button>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 uppercase tracking-tighter">
                        <FaShieldAlt /> Secure Health Booking
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
                <div className="flex flex-col lg:flex-row gap-12">

                    {/* LEFT CONTENT */}
                    <div className="flex-1">
                        <div className="mb-10">
                            <div className="flex flex-wrap items-center gap-2 mb-4">
                                <span className="bg-emerald-50 text-emerald-700 text-[10px] px-2.5 py-1 rounded-lg font-black uppercase border border-emerald-100 tracking-wider">
                                    {pkg.mainCategory} • {pkg.category}
                                </span>
                                {pkg.tags?.map((tag, idx) => (
                                    <span key={idx} className="bg-blue-50 text-blue-600 text-[10px] px-2.5 py-1 rounded-lg font-black uppercase border border-blue-100 flex items-center gap-1">
                                        <FaTag size={8} /> {tag}
                                    </span>
                                ))}
                            </div>
                            <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight leading-none">
                                {pkg.packageName}
                            </h1>
                            <p className="text-slate-600 text-lg leading-relaxed max-w-3xl">
                                {pkg.shortDescription}
                            </p>
                        </div>

                        {/* Quick Specs */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                            <ClinicalSpec icon={<FaClock />} label="Report Time" value={pkg.reportTime} />
                            <ClinicalSpec icon={<FaVial />} label="Sample Type" value={pkg.sampleTypes?.join(", ") || "N/A"} />
                            <ClinicalSpec icon={<FaHistory />} label="Fasting" value={pkg.isFastingRequired ? "Required" : "Not Required"} />
                            <ClinicalSpec icon={<FaUserFriends />} label="Gender/Age" value={`${pkg.gender} / ${pkg.ageGroup}`} />
                        </div>

                        {/* Preparations Section */}
                        {pkg.preparations?.length > 0 && (
                            <section className="mb-12 p-6 bg-amber-50/50 rounded-[2rem] border border-amber-100">
                                <h3 className="text-sm font-black text-amber-800 mb-4 flex items-center gap-2 uppercase tracking-widest">
                                    <FaListUl className="text-amber-500" /> Essential Preparations
                                </h3>
                                <ul className="space-y-3">
                                    {pkg.preparations.map((prep, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm text-amber-900/80 font-medium">
                                            <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                                            {prep}
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}

                        {/* Lab Selection */}
                        <section id="lab-selection-area" className="mb-12 scroll-mt-24">
                            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                                <div className="w-2 h-8 bg-emerald-500 rounded-full" />
                                Choose Partner Laboratory
                            </h3>
                            <div className="grid gap-4">
                                {pkg.vendorList?.map((lab) => {
                                    const isSelected = selectedLab?._id === lab._id;
                                    return (
                                        <div
                                            key={lab._id}
                                            onClick={() => !isAdded && setSelectedLab(lab)}
                                            className={`p-6 rounded-[2rem] border-2 transition-all flex items-center justify-between ${isSelected
                                                    ? "border-emerald-500 bg-emerald-50/40 shadow-xl shadow-emerald-100/50"
                                                    : isAdded ? "border-slate-100 opacity-60 cursor-not-allowed" : "border-slate-100 bg-white hover:border-slate-300 cursor-pointer"
                                                }`}
                                        >
                                            <div className="flex items-center gap-5">
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isSelected ? "bg-emerald-500 text-white rotate-6" : "bg-slate-100 text-slate-400"}`}>
                                                    <FaClinicMedical size={24} />
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-slate-900 text-sm uppercase tracking-tight">Verified Lab Partner</h4>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <p className="text-[11px] text-slate-500 font-bold flex items-center gap-1 uppercase">
                                                            <FaClock /> {lab.reportTime}
                                                        </p>
                                                        <p className="text-[11px] text-blue-600 font-bold flex items-center gap-1 uppercase">
                                                            <FaCheckCircle /> {lab.totalTestsIncluded} Tests
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="flex items-center gap-2 justify-end">
                                                    {lab.mrp > lab.offerPrice && (
                                                        <span className="text-sm text-slate-400 line-through font-medium">₹{lab.mrp}</span>
                                                    )}
                                                    <p className="text-2xl font-black text-slate-900">₹{lab.offerPrice}</p>
                                                </div>
                                                <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest">{lab.discountPercent}% OFF</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>

                        {/* Detailed Description */}
                        <section className="mb-12">
                            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                                <div className="w-2 h-8 bg-blue-500 rounded-full" />
                                What's inside this package?
                            </h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                {pkg.detailedDescription?.map((item) => (
                                    <div key={item._id} className="p-8 rounded-[2rem] border border-slate-100 bg-slate-50/50 hover:bg-white transition-colors group">
                                        <h4 className="font-black text-slate-900 text-xs mb-3 uppercase tracking-[0.2em] group-hover:text-blue-600 transition-colors">{item.sectionTitle}</h4>
                                        <p className="text-sm text-slate-600 leading-relaxed font-medium">{item.sectionContent}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* FAQs Section */}
                        {pkg.faqs?.length > 0 && (
                            <section className="mb-12">
                                <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                                    <div className="w-2 h-8 bg-purple-500 rounded-full" />
                                    Frequently Asked Questions
                                </h3>
                                <div className="space-y-4">
                                    {pkg.faqs.map((faq) => (
                                        <div key={faq._id} className="p-6 rounded-2xl border border-slate-100">
                                            <p className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-2">
                                                <FaQuestionCircle className="text-purple-500" /> {faq.question}
                                            </p>
                                            <p className="text-sm text-slate-500 leading-relaxed pl-6">{faq.answer}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* RIGHT SUMMARY PANEL */}
                    <div className="w-full lg:w-96">
                        <div className="sticky top-28 bg-white border border-slate-200 rounded-[3rem] shadow-2xl shadow-slate-200/50 p-8">
                            <div className="mb-8 pb-8 border-b border-slate-100">
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-3">Booking Summary</p>
                                <div className="flex items-baseline gap-2">
                                    <h2 className="text-5xl font-black text-slate-900 tracking-tighter">₹{displayPrice}</h2>
                                    {strikePrice > displayPrice && (
                                        <span className="text-slate-300 line-through text-xl font-bold">₹{strikePrice}</span>
                                    )}
                                </div>
                                <div className="mt-4 bg-emerald-50 rounded-xl px-4 py-2 inline-flex items-center gap-2">
                                    <FaCheckCircle className="text-emerald-500 text-xs" />
                                    <span className="text-[10px] text-emerald-700 font-black uppercase tracking-wider">All Taxes Included</span>
                                </div>
                            </div>

                            <div className="space-y-6 mb-10">
                                <SummaryItem icon={<FaClinicMedical />} text={selectedLab ? "Laboratory Selected" : "Select a Lab Partner"} active={!!selectedLab} />
                                <SummaryItem icon={<FaCheckCircle />} text={`${pkg.tests?.length} Parameters Covered`} active={true} />
                                <SummaryItem icon={<FaInfoCircle />} text="Free Smart Reports" active={true} />
                            </div>

                            <button
                                onClick={handleFinalAction}
                                className={`w-full py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 active:scale-95 ${
                                    isAdded 
                                    ? "bg-rose-50 text-rose-600 border-2 border-rose-100 hover:bg-rose-600 hover:text-white" 
                                    : !selectedLab
                                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                        : "bg-emerald-600 text-white hover:bg-slate-900 shadow-xl shadow-emerald-200"
                                }`}
                            >
                                {isAdded ? (
                                    <><FaTrashAlt /> Remove From Cart</>
                                ) : (
                                    <><FaShoppingCart /> {selectedLab ? "Confirm & Add to Cart" : "Choose Lab Partner"}</>
                                )}
                            </button>

                            <p className="text-[10px] text-slate-400 font-bold text-center mt-8 uppercase tracking-widest flex items-center justify-center gap-2">
                                <FaShieldAlt className="text-emerald-500" /> 100% Secure Checkout
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// SUBSIDIARY COMPONENTS
const ClinicalSpec = ({ icon, label, value }) => (
    <div className="p-5 rounded-[1.5rem] border border-slate-100 bg-white shadow-sm hover:border-emerald-200 transition-colors">
        <div className="text-emerald-500 mb-3 text-lg">{icon}</div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{label}</p>
        <p className="text-xs font-black text-slate-800 tracking-tight leading-tight">{value}</p>
    </div>
);

const SummaryItem = ({ icon, text, active }) => (
    <div className={`flex items-center gap-4 text-[11px] font-black uppercase tracking-wider transition-opacity ${active ? "opacity-100" : "opacity-30"}`}>
        <span className={active ? "text-emerald-500" : "text-slate-400"}>{icon}</span>
        <span className={active ? "text-slate-700" : "text-slate-400"}>{text}</span>
    </div>
);

export default PackageDetailsModal;