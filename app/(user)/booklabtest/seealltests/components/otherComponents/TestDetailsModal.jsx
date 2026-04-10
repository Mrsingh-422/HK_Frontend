"use client";

import React, { useState, useEffect } from "react";
import {
    FaStar, FaShoppingCart, FaTrashAlt,
    FaCheckCircle, FaInfoCircle, FaClock, FaVial,
    FaShieldAlt, FaClinicMedical, FaArrowLeft, 
    FaExclamationTriangle, FaListUl, FaRegFileAlt,
    FaQuestionCircle, FaUserFriends, FaFlask, FaMicroscope, FaHistory
} from "react-icons/fa";
import { useCart } from "@/app/context/CartContext"; 
import toast from "react-hot-toast";

const TestDetailsModal = ({ isOpen, onClose, test }) => {
    const { cart, cartItemIds, addItem, removeItem, clearCart } = useCart();
    const [selectedLab, setSelectedLab] = useState(null);
    const [showClearCartConfirm, setShowClearCartConfirm] = useState(false);

    // Identify if any lab for this test is already in the cart
    const addedOffering = test?.vendorList?.find(v => cartItemIds.includes(v._id));
    const isAdded = !!addedOffering;

    useEffect(() => {
        if (isOpen && isAdded) {
            setSelectedLab(addedOffering);
            document.body.style.overflow = 'hidden';
        } else if (isOpen) {
            setSelectedLab(null);
            document.body.style.overflow = 'hidden';
            // Default select first lab if available
            if (test?.vendorList?.length > 0) {
                setSelectedLab(test.vendorList[0]);
            }
        } else {
            document.body.style.overflow = 'unset';
            setShowClearCartConfirm(false);
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen, isAdded, test, addedOffering]);

    if (!isOpen || !test) return null;

    // Price calculations based on selected lab or test defaults
    const displayPrice = selectedLab ? selectedLab.discountPrice : (test.minPrice || test.standardMRP);
    const strikePrice = selectedLab ? selectedLab.amount : test.standardMRP;
    const discount = selectedLab ? selectedLab.discountPercent : 0;

    const executeAdd = async () => {
        try {
            await addItem(selectedLab.labId, selectedLab._id, 'LabTest');
            toast.success("Added to cart!");
            setShowClearCartConfirm(false);
        } catch (error) {
            toast.error("An error occurred while adding to cart.");
        }
    };

    const handleClearAndAdd = async () => {
        try {
            await clearCart();
            await executeAdd();
        } catch (error) {
            toast.error("Failed to clear cart");
        }
    };

    const handleAction = async () => {
        if (isAdded) {
            try {
                await removeItem(addedOffering._id);
                toast.success("Removed from cart");
            } catch (error) {
                toast.error("Failed to remove item");
            }
        } else {
            if (!selectedLab) {
                toast.error("Please choose a laboratory center.");
                return;
            }

            // Category Mismatch Check
            if (cart && cart.items?.length > 0 && cart.categoryType) {
                if (cart.categoryType !== test.mainCategory) {
                    setShowClearCartConfirm(true);
                    return;
                }
            }
            await executeAdd();
        }
    };

    return (
        <div className="fixed inset-0 z-[999] bg-white w-full h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
            
            {/* CATEGORY MISMATCH OVERLAY */}
            {showClearCartConfirm && (
                <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                            <FaExclamationTriangle className="text-amber-600 text-2xl" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 text-center mb-2">Mixed Cart Category</h3>
                        <p className="text-slate-500 text-center font-medium text-sm mb-8 leading-relaxed">
                            Your cart contains <span className="font-bold text-slate-700">{cart.categoryType}</span> items. Clear cart to start a new <span className="font-bold text-slate-700">{test.mainCategory}</span> order?
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
                                        {test.mainCategory}
                                    </span>
                                    <span className="bg-blue-50 text-blue-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider border border-blue-100">
                                        ID: {test.testCode}
                                    </span>
                                </div>
                                <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight uppercase">
                                    {test.testName}
                                </h1>
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {test.parameters?.map((param, i) => (
                                        <span key={i} className="bg-slate-100 text-slate-500 text-[10px] font-black px-3 py-1 rounded-md uppercase">
                                            {param}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                                <StatCard icon={<FaVial className="text-rose-500" />} label="Sample" value={test.sampleType === "NA" ? "No Sample" : test.sampleType} />
                                <StatCard icon={<FaClock className="text-blue-500" />} label="Reports" value={selectedLab ? `${selectedLab.reportTime} Hours` : "Fastest"} />
                                <StatCard icon={<FaHistory className="text-amber-500" />} label="Preparation" value={test.pretestPreparation?.includes("Fasting") ? "Fasting Req." : "None"} />
                                <StatCard icon={<FaUserFriends className="text-purple-500" />} label="Gender" value={test.gender} />
                            </div>

                            {/* LAB SELECTION AREA */}
                            <section id="lab-selection-area" className="mb-12">
                                <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                                    <FaClinicMedical className="text-emerald-500" /> Choose Laboratory Center
                                </h3>
                                <div className="grid gap-4">
                                    {test.vendorList?.map((vendor) => (
                                        <div
                                            key={vendor._id}
                                            onClick={() => !isAdded && setSelectedLab(vendor)}
                                            className={`p-5 rounded-2xl border-2 transition-all flex items-center justify-between ${selectedLab?._id === vendor._id ? "border-emerald-500 bg-emerald-50/40" : isAdded ? "opacity-50 cursor-not-allowed border-slate-100" : "border-slate-100 bg-white cursor-pointer hover:border-slate-200"}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedLab?._id === vendor._id ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"}`}>
                                                    <FaClinicMedical size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 uppercase text-sm tracking-tight">Partner Diagnostic Lab</p>
                                                    <p className="text-[10px] text-slate-500 font-black uppercase">Report Cycle: {vendor.reportTime} Hours</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-black text-slate-900">₹{vendor.discountPrice}</p>
                                                <p className="text-[10px] font-black text-emerald-600 uppercase">SAVE {vendor.discountPercent}%</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* DYNAMIC CONTENT FROM RESPONSE */}
                            <div className="grid md:grid-cols-2 gap-6 mb-12">
                                {test.detailedDescription?.length > 0 && (
                                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                        <h4 className="font-black text-slate-900 mb-4 flex items-center gap-2 uppercase text-xs tracking-widest"><FaRegFileAlt className="text-blue-500" /> Clinical Overview</h4>
                                        <div className="space-y-4">
                                            {test.detailedDescription.map((desc) => (
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
                                        {test.pretestPreparation || "No special preparation needed for this scan/test."}
                                    </p>
                                </div>
                            </div>

                            {/* FAQS SECTION */}
                            {test.faqs?.length > 0 && (
                                <section className="mb-12">
                                    <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2 uppercase text-xs tracking-widest">
                                        <FaQuestionCircle className="text-emerald-500" /> Common Questions
                                    </h3>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {test.faqs.map((faq) => (
                                            <div key={faq._id} className="p-4 rounded-xl border border-slate-100 bg-white shadow-sm">
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
                                            <span className="text-[11px] uppercase tracking-tighter">Digital Report Delivery</span>
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