"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
    FaShoppingCart, FaTrashAlt, FaCheckCircle,
    FaClock, FaVial, FaHistory, FaClinicMedical, FaShieldAlt,
    FaArrowLeft, FaListUl, FaQuestionCircle,
    FaUserFriends, FaFlask, FaRegFileAlt, FaMicroscope, FaExclamationTriangle
} from "react-icons/fa";
import { useCart } from "@/app/context/CartContext";
import toast from "react-hot-toast";

const TestDetailsModal = ({ isOpen, onClose, test }) => {
    const { cart, cartItemIds, addItem, removeItem, clearFullCart } = useCart();
    const [selectedLab, setSelectedLab] = useState(null);
    const [showClearCartConfirm, setShowClearCartConfirm] = useState(false);

    // According to your JSON, the test object ITSELF is the lab offering
    // Identify if this specific lab-test combination is in the cart
    const isAdded = useMemo(() => {
        return test ? cartItemIds.includes(test._id) : false;
    }, [test, cartItemIds]);

    // Fasting Check Logic from masterTestId
    const fastingRequired = useMemo(() => {
        if (!test?.masterTestId) return false;
        const preparation = test.masterTestId.pretestPreparation?.toLowerCase() || "";
        return preparation.includes("fasting");
    }, [test]);

    useEffect(() => {
        if (isOpen && test) {
            document.body.style.overflow = 'hidden';
            // In your JSON structure, the test object passed is the specific offering
            // So we set it as the selected lab immediately to prevent the "choose lab" error
            setSelectedLab(test);
        } else {
            document.body.style.overflow = 'unset';
            setShowClearCartConfirm(false);
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen, test]);

    if (!isOpen || !test) return null;

    // Price calculations based on your JSON keys: discountPrice and amount
    const displayPrice = test.discountPrice ?? test.amount ?? 0;
    const strikePrice = test.amount ?? 0;
    const discount = test.discountPercent ?? 0;
    const masterData = test.masterTestId || {};

    const executeAdd = async () => {
        try {
            // Using IDs directly from the test object as per your JSON
            const targetLabId = test.labId;
            const targetItemId = test._id;

            if (!targetLabId || !targetItemId) {
                toast.error("Invalid test data mapping.");
                return;
            }

            const result = await addItem(targetLabId, targetItemId, 'LabTest');

            // If the addItem function returns a conflict error (Lab or Category mismatch)
            if (result && result.error) {
                setShowClearCartConfirm(true);
                return;
            }

            toast.success("Added to cart!");
            setShowClearCartConfirm(false);
        } catch (error) {
            // Check if error is related to Lab/Category conflict
            if (error.message?.includes('lab') || error.message?.includes('category')) {
                setShowClearCartConfirm(true);
            } else {
                toast.error("An error occurred while adding to cart.");
            }
        }
    };

    const handleClearAndAdd = async () => {
        try {
            // clearFullCart() calls the appropriate API to clear the entire cart and then we proceed to add the new item
            await clearFullCart();
            await executeAdd();
            setShowClearCartConfirm(false);
        } catch (error) {
            toast.error("Failed to clear cart");
        }
    };

    const handleAction = async () => {
        if (isAdded) {
            try {
                await removeItem(test._id);
                toast.success("Removed from cart");
            } catch (error) {
                toast.error("Failed to remove item");
            }
        } else {
            if (!selectedLab) {
                toast.error("Please choose a laboratory center.");
                return;
            }

            // Conflict Check: Check if current cart has a different category or different lab
            const currentCategory = test.mainCategory || "Pathology";
            const currentLabId = test.labId;

            if (cart && cart.items?.length > 0) {
                const hasCategoryMismatch = cart.categoryType && cart.categoryType !== currentCategory;
                const hasLabMismatch = cart.labId && cart.labId !== currentLabId;

                if (hasCategoryMismatch || hasLabMismatch) {
                    setShowClearCartConfirm(true);
                    return;
                }
            }

            await executeAdd();
        }
    };

    return (
        <div className="fixed inset-0 z-[999] bg-white w-full h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">

            {/* CONFLICT OVERLAY (LAB OR CATEGORY MISMATCH) */}
            {showClearCartConfirm && (
                <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                            <FaExclamationTriangle className="text-amber-600 text-2xl" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 text-center mb-2">Replace Cart Items?</h3>
                        <p className="text-slate-500 text-center font-medium text-sm mb-8 leading-relaxed">
                            Your cart contains items from a different <span className="font-bold text-slate-700">Lab</span> or <span className="font-bold text-slate-700">Category</span>. You can only book one category from one lab at a time.
                        </p>
                        <div className="flex flex-col gap-3">
                            <button onClick={handleClearAndAdd} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all">Clear and Add</button>
                            <button onClick={() => setShowClearCartConfirm(false)} className="w-full py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            <header className="h-16 border-b border-slate-100 flex items-center justify-between px-4 md:px-8 sticky top-0 bg-white z-10">
                <button onClick={onClose} className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 font-bold transition-colors">
                    <FaArrowLeft /> <span className="uppercase tracking-widest text-xs">Back to Catalog</span>
                </button>
                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <FaShieldAlt className="text-emerald-500" /> Secure Diagnostic Booking
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
                                        {test.mainCategory || "Pathology"}
                                    </span>
                                    <span className="bg-blue-50 text-blue-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider border border-blue-100">
                                        ID: {masterData.testCode}
                                    </span>
                                </div>
                                <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight uppercase">
                                    {test.testName}
                                </h1>
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {masterData.parameters?.map((param, i) => (
                                        <span key={i} className="bg-slate-100 text-slate-500 text-[10px] font-black px-3 py-1 rounded-md uppercase tracking-wider">
                                            {param}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                                <StatCard icon={<FaVial className="text-rose-500" />} label="Sample" value={test.sampleType === "NA" ? "No Sample" : test.sampleType} />
                                <StatCard icon={<FaClock className="text-blue-500" />} label="Reports" value={`${test.reportTime} Hours`} />
                                <StatCard icon={<FaHistory className="text-amber-500" />} label="Fasting" value={fastingRequired ? "Required" : "No"} />
                                <StatCard icon={<FaUserFriends className="text-purple-500" />} label="Gender" value={masterData.gender || "Both"} />
                            </div>

                            {/* SELECTED LAB INFO */}
                            <section className="mb-12">
                                <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                                    <FaClinicMedical className="text-emerald-500" /> Laboratory Center
                                </h3>
                                <div className="p-5 rounded-2xl border-2 border-emerald-500 bg-emerald-50/40 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
                                            <FaClinicMedical size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 uppercase text-sm tracking-tight">Partner Diagnostic Lab</p>
                                            <p className="text-[10px] text-slate-500 font-black uppercase">Report delivery in {test.reportTime} hours</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-black text-slate-900">₹{test.discountPrice}</p>
                                        <p className="text-[10px] font-black text-emerald-600 uppercase">OFFER ACTIVE</p>
                                    </div>
                                </div>
                            </section>

                            <div className="grid md:grid-cols-2 gap-6 mb-12">
                                {masterData.detailedDescription?.length > 0 && (
                                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                        <h4 className="font-black text-slate-900 mb-4 flex items-center gap-2 uppercase text-xs tracking-widest"><FaRegFileAlt className="text-blue-500" /> Clinical Overview</h4>
                                        <div className="space-y-4">
                                            {masterData.detailedDescription.map((desc) => (
                                                <div key={desc._id}>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">{desc.sectionTitle}</p>
                                                    <p className="text-sm text-slate-600 leading-relaxed font-medium">{desc.sectionContent}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <div className="bg-amber-50/50 p-6 rounded-2xl border border-amber-100 h-fit">
                                    <h4 className="font-black text-slate-900 mb-4 flex items-center gap-2 uppercase text-xs tracking-widest"><FaListUl className="text-amber-500" /> Preparation</h4>
                                    <p className="text-sm text-slate-700 font-bold leading-relaxed">
                                        {masterData.pretestPreparation || "No special preparation needed for this diagnostic test."}
                                    </p>
                                </div>
                            </div>

                            {masterData.faqs?.length > 0 && (
                                <section className="mb-12">
                                    <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2 uppercase text-xs tracking-widest">
                                        <FaQuestionCircle className="text-emerald-500" /> Common Questions
                                    </h3>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {masterData.faqs.map((faq, i) => (
                                            <div key={faq._id || i} className="p-4 rounded-xl border border-slate-100 bg-white shadow-sm">
                                                <p className="font-bold text-slate-900 text-sm mb-1">{faq.question}</p>
                                                <p className="text-sm text-slate-500 font-medium">{faq.answer}</p>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>

                        {/* SIDEBAR SUMMARY */}
                        <div className="w-full lg:w-80">
                            <div className="sticky top-28 bg-white border border-slate-200 rounded-[2rem] shadow-2xl p-6 overflow-hidden">
                                <div className="absolute top-0 right-0 p-4">
                                    <FaMicroscope className="text-slate-50 text-7xl rotate-12" />
                                </div>
                                <div className="relative z-10">
                                    <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Total Test Amount</p>
                                    <div className="flex items-baseline gap-2 mb-1">
                                        <span className="text-4xl font-black text-slate-900">₹{displayPrice}</span>
                                        {strikePrice > displayPrice && (
                                            <span className="text-slate-400 line-through font-bold">₹{strikePrice}</span>
                                        )}
                                    </div>
                                    {discount > 0 && (
                                        <p className="text-[10px] font-black text-emerald-600 mb-6 bg-emerald-50 px-2 py-1 rounded inline-block">
                                            DISCOUNT APPLIED ({discount}%)
                                        </p>
                                    )}
                                    <div className="space-y-4 mb-8">
                                        <div className="flex items-center gap-3 text-sm text-slate-600 font-bold">
                                            <FaCheckCircle className="text-emerald-500 shrink-0" />
                                            <span className="text-[11px] uppercase tracking-tighter">NABL Verified Labs</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-slate-600 font-bold">
                                            <FaCheckCircle className="text-emerald-500 shrink-0" />
                                            <span className="text-[11px] uppercase tracking-tighter">Home Sample Pickup</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleAction}
                                        className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.1em] transition-all duration-300 ${isAdded ? "bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-600 hover:text-white" : !selectedLab ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-emerald-600 text-white hover:bg-slate-900 shadow-xl shadow-emerald-100"
                                            }`}
                                    >
                                        {isAdded ? <span><FaTrashAlt className="inline mr-2" /> Remove Test</span> : <span><FaShoppingCart className="inline mr-2" /> Book Now</span>}
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

export default TestDetailsModal;