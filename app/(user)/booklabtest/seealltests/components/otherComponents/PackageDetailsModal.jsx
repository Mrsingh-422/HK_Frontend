"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
    FaShoppingCart, FaTrashAlt, FaCheckCircle, FaInfoCircle,
    FaClock, FaVial, FaHistory, FaClinicMedical, FaShieldAlt,
    FaArrowLeft, FaListUl, FaQuestionCircle,
    FaUserFriends, FaFlask, FaRegFileAlt, FaMicroscope
} from "react-icons/fa";
import { useCart } from "@/app/context/CartContext";
import toast from "react-hot-toast";

const PackageDetailsModal = ({ isOpen, onClose, pkg }) => {
    // 1. All Hooks must be at the top level
    const { cart, cartItemIds, addItem, removeItem } = useCart();
    const [selectedLab, setSelectedLab] = useState(null);

    // Identify if the package is already in the cart
    const isAdded = cartItemIds.includes(pkg?._id);

    // Determine if tests are strings (IDs) or Objects (Rich Data)
    const hasRichTestData = pkg?.tests && typeof pkg?.tests[0] === 'object';

    // Fasting Check: Scans strings in preparations OR objects in pretestPreparation
    const fastingRequired = useMemo(() => {
        if (!pkg) return false;
        if (pkg?.isFastingRequired === true) return true;

        const prepStringMatch = pkg?.preparations?.some(p => p?.toLowerCase().includes("fasting"));
        const testObjectMatch = hasRichTestData && pkg.tests?.some(t =>
            t.pretestPreparation?.toLowerCase()?.includes("fasting")
        );

        return prepStringMatch || testObjectMatch;
    }, [pkg, hasRichTestData]);

    useEffect(() => {
        if (isOpen && pkg) {
            document.body.style.overflow = 'hidden';
            if (pkg?.vendorList?.length > 0) {
                setSelectedLab(pkg.vendorList[0]);
            } else {
                setSelectedLab(pkg);
            }
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen, pkg]);

    // 2. Early return moved AFTER all hooks
    if (!isOpen || !pkg) return null;

    // --- DYNAMIC DATA EXTRACTION ---
    const displayPrice = selectedLab?.offerPrice ?? pkg?.offerPrice ?? pkg?.minPrice ?? 0;
    const strikePrice = selectedLab?.mrp ?? pkg?.mrp ?? pkg?.standardMRP ?? 0;
    const discount = selectedLab?.discountPercent ?? pkg?.discountPercent ?? 0;

    const handleFinalAction = async () => {
        if (isAdded) {
            try {
                await removeItem(pkg._id);
                toast.success("Removed from cart");
            } catch (error) {
                toast.error("Error removing item");
            }
        } else {
            if (cart?.items?.length > 0 && cart.categoryType !== "Pathology") {
                toast.error(`Clear cart first to add this category.`);
                return;
            }

            try {
                const targetLabId = selectedLab?.labId || pkg.labId;
                const targetPkgId = selectedLab?._id || pkg._id;

                if (!targetLabId) {
                    toast.error("Laboratory information missing.");
                    return;
                }

                await addItem(targetLabId, targetPkgId, 'LabPackage');
                toast.success("Added to cart!");
            } catch (error) {
                toast.error("Failed to add to cart");
            }
        }
    };

    return (
        <div className="fixed inset-0 z-[999] bg-white w-full h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">

            <header className="h-16 border-b border-slate-100 flex items-center justify-between px-4 md:px-8 sticky top-0 bg-white z-10">
                <button onClick={onClose} className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 font-bold transition-colors">
                    <FaArrowLeft /> <span>Back</span>
                </button>
                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <FaShieldAlt className="text-emerald-500" /> NABL Accredited Diagnostics
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto bg-[#FDFDFD]">
                <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-12">
                    <div className="flex flex-col lg:flex-row gap-12">

                        <div className="flex-1">
                            <div className="mb-8">
                                <div className="flex flex-wrap gap-2 mb-4">
                                    <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-100">
                                        {pkg.mainCategory || "Pathology"}
                                    </span>
                                    {pkg.tags?.map((tag, i) => (
                                        <span key={i} className="bg-slate-100 text-slate-500 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                                <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
                                    {pkg.packageName}
                                </h1>
                                <p className="text-slate-500 text-lg leading-relaxed font-medium">
                                    {pkg.shortDescription || pkg.description || "Comprehensive diagnostic health screening package."}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                                <StatCard icon={<FaClock className="text-blue-500" />} label="Reports" value={pkg.reportTime || "24 Hours"} />
                                <StatCard icon={<FaVial className="text-rose-500" />} label="Sample" value={pkg.sampleTypes?.join("/") || pkg.sampleType?.join("/") || "Blood"} />
                                <StatCard icon={<FaHistory className="text-amber-500" />} label="Fasting" value={fastingRequired ? "Required" : "No"} />
                                <StatCard icon={<FaUserFriends className="text-purple-500" />} label="Gender" value={pkg.gender} />
                            </div>

                            {pkg.vendorList?.length > 0 && (
                                <section className="mb-12">
                                    <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                                        <FaClinicMedical className="text-emerald-500" /> Choose Laboratory
                                    </h3>
                                    <div className="grid gap-4">
                                        {pkg.vendorList.map((lab) => (
                                            <div
                                                key={lab._id}
                                                onClick={() => setSelectedLab(lab)}
                                                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${selectedLab?._id === lab._id ? "border-emerald-500 bg-emerald-50/40" : "border-slate-100 bg-white"
                                                    }`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedLab?._id === lab._id ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"}`}>
                                                        <FaClinicMedical size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900">Partner Lab Center</p>
                                                        <p className="text-xs text-slate-500 font-bold">{lab.totalTestsIncluded} Parameters</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-lg font-black text-slate-900">₹{lab.offerPrice}</p>
                                                    <p className="text-[10px] font-black text-emerald-600 uppercase">SAVE {lab.discountPercent}%</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            <section className="mb-12">
                                <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                                    <FaMicroscope className="text-emerald-500" />
                                    Tests Included ({pkg.totalTestsIncluded || pkg.tests?.length || 0})
                                </h3>

                                {hasRichTestData ? (
                                    <div className="space-y-4">
                                        {pkg.tests.map((test) => (
                                            <div key={test._id} className="border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-sm">
                                                <div className="p-5 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                    <div>
                                                        <h4 className="font-bold text-slate-900 text-lg">{test.testName}</h4>
                                                        <p className="text-[10px] text-emerald-600 font-black uppercase tracking-wider">{test.category} • {test.sampleType} Sample</p>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {test.parameters?.map((p, i) => (
                                                            <span key={i} className="bg-white border border-slate-200 text-slate-500 text-[10px] px-2 py-1 rounded-md font-bold">{p}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="p-5 grid md:grid-cols-2 gap-6">
                                                    {test.detailedDescription?.map((desc) => (
                                                        <div key={desc._id}>
                                                            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">{desc.sectionTitle}</p>
                                                            <p className="text-sm text-slate-600 leading-relaxed font-medium">{desc.sectionContent}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 bg-slate-50 rounded-2xl text-center border-2 border-dashed border-slate-200">
                                        <p className="font-bold text-slate-500">Includes {pkg.totalTestsIncluded || pkg.tests?.length} essential health parameters.</p>
                                    </div>
                                )}
                            </section>

                            <div className="grid md:grid-cols-2 gap-6 mb-12">
                                {pkg.detailedDescription?.length > 0 && (
                                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                        <h4 className="font-black text-slate-900 mb-4 flex items-center gap-2"><FaRegFileAlt className="text-blue-500" /> Overview</h4>
                                        <div className="space-y-4">
                                            {pkg.detailedDescription.map((desc) => (
                                                <div key={desc._id}>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">{desc.sectionTitle}</p>
                                                    <p className="text-sm text-slate-600 leading-relaxed font-medium">{desc.sectionContent}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {pkg.preparations?.length > 0 && (
                                    <div className="bg-amber-50/50 p-6 rounded-2xl border border-amber-100">
                                        <h4 className="font-black text-slate-900 mb-4 flex items-center gap-2"><FaListUl className="text-amber-500" /> Preparation</h4>
                                        <ul className="space-y-3">
                                            {pkg.preparations.map((prep, i) => (
                                                <li key={i} className="text-sm text-slate-700 font-bold flex items-start gap-3">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                                                    {prep}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            {(pkg.faqs?.length > 0 || (hasRichTestData && pkg.tests?.some(t => t.faqs?.length > 0))) && (
                                <section>
                                    <h3 className="text-xl font-black text-slate-900 mb-6">Common Questions</h3>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {pkg.faqs?.map((faq, i) => (
                                            <div key={faq._id || i} className="p-4 rounded-xl border border-slate-100 bg-white shadow-sm">
                                                <p className="font-bold text-slate-900 text-sm mb-1">{faq.question}</p>
                                                <p className="text-sm text-slate-500 font-medium">{faq.answer}</p>
                                            </div>
                                        ))}
                                        {hasRichTestData && pkg.tests?.flatMap(t => t.faqs || []).slice(0, 4).map((faq, i) => (
                                            <div key={faq._id || i} className="p-4 rounded-xl border border-slate-100 bg-white shadow-sm">
                                                <p className="font-bold text-slate-900 text-sm mb-1">{faq.question}</p>
                                                <p className="text-sm text-slate-500 font-medium">{faq.answer}</p>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>

                        <div className="w-full lg:w-80">
                            <div className="sticky top-28 bg-white border border-slate-200 rounded-[2rem] shadow-2xl p-6 overflow-hidden">
                                <div className="absolute top-0 right-0 p-4">
                                    <FaFlask className="text-slate-50 text-7xl rotate-12" />
                                </div>
                                <div className="relative z-10">
                                    <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Total Package Price</p>
                                    <div className="flex items-baseline gap-2 mb-1">
                                        <span className="text-4xl font-black text-slate-900">₹{displayPrice}</span>
                                        {strikePrice > displayPrice && (
                                            <span className="text-slate-400 line-through font-bold">₹{strikePrice}</span>
                                        )}
                                    </div>
                                    {discount > 0 && (
                                        <p className="text-[10px] font-black text-emerald-600 mb-6 bg-emerald-50 px-2 py-1 rounded inline-block">
                                            SAVING ₹{strikePrice - displayPrice} ({discount}%)
                                        </p>
                                    )}
                                    <div className="space-y-4 mb-8">
                                        <div className="flex items-center gap-3 text-sm text-slate-600 font-bold">
                                            <FaCheckCircle className="text-emerald-500 shrink-0" />
                                            <span>Home Sample Pickup</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-slate-600 font-bold">
                                            <FaCheckCircle className="text-emerald-500 shrink-0" />
                                            <span>Certified Lab Report</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleFinalAction}
                                        className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.1em] transition-all duration-300 ${isAdded ? "bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-600 hover:text-white" : "bg-emerald-600 text-white hover:bg-slate-900 shadow-xl shadow-emerald-100"
                                            }`}
                                    >
                                        {isAdded ? <span><FaTrashAlt className="inline mr-2" /> Remove Item</span> : <span><FaShoppingCart className="inline mr-2" /> Add to Cart</span>}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon, label, value }) => (
    <div className="bg-white border border-slate-100 p-4 rounded-2xl flex flex-col items-center text-center shadow-sm">
        <div className="text-lg mb-2">{icon}</div>
        <p className="text-[9px] font-black text-slate-400 uppercase mb-0.5">{label}</p>
        <p className="text-[11px] font-black text-slate-900 truncate w-full uppercase">{value || "N/A"}</p>
    </div>
);

export default PackageDetailsModal;