"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
    FaShoppingCart, FaTrashAlt, FaCheckCircle, FaInfoCircle,
    FaClock, FaVial, FaHistory, FaClinicMedical, FaShieldAlt,
    FaArrowLeft, FaListUl, FaQuestionCircle,
    FaUserFriends, FaFlask, FaRegFileAlt, FaMicroscope, FaExclamationTriangle
} from "react-icons/fa";
import { useCart } from "@/app/context/CartContext";
import toast from "react-hot-toast";

const PackageDetailsModal = ({ isOpen, onClose, pkg }) => {
    const { cart, cartItemIds, addItem, removeItem, clearFullCart } = useCart();
    const [selectedLab, setSelectedLab] = useState(null);
    const [showClearCartConfirm, setShowClearCartConfirm] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // Identify if the package is already in the cart
    const isAdded = pkg ? cartItemIds.includes(pkg._id) : false;

    // Determine if tests are rich objects
    const hasRichTestData = pkg?.tests && typeof pkg?.tests[0] === 'object';

    // Fasting Check
    const fastingRequired = useMemo(() => {
        if (!pkg) return false;
        if (pkg?.isFastingRequired === true) return true;
        return pkg?.preparations?.some(p => p?.toLowerCase().includes("fasting")) || 
               (hasRichTestData && pkg.tests?.some(t => t.pretestPreparation?.toLowerCase()?.includes("fasting")));
    }, [pkg, hasRichTestData]);

    useEffect(() => {
        if (isOpen && pkg) {
            document.body.style.overflow = 'hidden';
            // Set default lab from vendor list
            if (pkg.vendorList && pkg.vendorList.length > 0) {
                setSelectedLab(pkg.vendorList[0]);
            } else {
                setSelectedLab(null);
            }
        } else {
            document.body.style.overflow = 'unset';
            setShowClearCartConfirm(false);
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen, pkg]);

    if (!isOpen || !pkg) return null;

    // Price calculations
    const displayPrice = selectedLab?.offerPrice ?? pkg?.offerPrice ?? pkg?.minPrice ?? 0;
    const strikePrice = selectedLab?.mrp ?? pkg?.mrp ?? pkg?.standardMRP ?? 0;
    const discount = selectedLab?.discountPercent ?? pkg?.discountPercent ?? 0;

    const executeAdd = async () => {
        try {
            setIsProcessing(true);

            // 1. Identify the Lab ID (The provider of the package)
            // It could be under .labId or ._id inside the selected vendor object
            const targetLabId = selectedLab?.labId || selectedLab?._id || pkg.labId;

            // 2. Identify the Item ID (The Package ID itself)
            const targetPkgId = pkg._id;

            // --- DEBUGGING LOGS ---
            // If it still says "Package not found", check these values in your F12 console
            console.log("--- Cart Payload Debug ---");
            console.log("Lab ID:", targetLabId);
            console.log("Package ID (itemId):", targetPkgId);
            console.log("Product Type:", "LabPackage");

            if (!targetLabId || !targetPkgId) {
                toast.error("Missing Lab or Package information");
                return;
            }

            // Call context: addItem(labId, itemId, productType)
            await addItem(targetLabId, targetPkgId, 'LabPackage');
            
            // Note: success toast is usually handled by your context's fetchCart, 
            // but we add one here for immediate feedback if context doesn't.
            toast.success("Added to cart!");
            setShowClearCartConfirm(false);
        } catch (error) {
            console.error("Cart Addition Failed:", error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleClearAndAdd = async () => {
        try {
            setIsProcessing(true);
            await clearFullCart();
            await executeAdd();
        } catch (error) {
            toast.error("Failed to clear cart");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleAction = async () => {
        if (isAdded) {
            try {
                setIsProcessing(true);
                await removeItem(pkg._id);
                toast.success("Removed from cart");
            } catch (error) {
                toast.error("Failed to remove item");
            } finally {
                setIsProcessing(false);
            }
        } else {
            if (pkg.vendorList?.length > 0 && !selectedLab) {
                toast.error("Please select a lab center");
                return;
            }

            // Check if user is trying to add a different category (e.g. Radiology vs Pathology)
            const currentPkgCategory = pkg.mainCategory || "Pathology";
            if (cart && cart.items?.length > 0 && cart.categoryType) {
                if (cart.categoryType.toLowerCase() !== currentPkgCategory.toLowerCase()) {
                    setShowClearCartConfirm(true);
                    return;
                }
            }
            
            await executeAdd();
        }
    };

    return (
        <div className="fixed inset-0 z-[999] bg-white w-full h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">

            {/* CATEGORY MISMATCH MODAL */}
            {showClearCartConfirm && (
                <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl">
                        <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                            <FaExclamationTriangle className="text-amber-600 text-2xl" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 text-center mb-2">Mixed Cart Category</h3>
                        <p className="text-slate-500 text-center font-medium text-sm mb-8 leading-relaxed">
                            Your cart contains <span className="font-bold text-slate-700">{cart.categoryType}</span> items. Clear cart to add this <span className="font-bold text-slate-700">{pkg.mainCategory || "Pathology"}</span> package?
                        </p>
                        <div className="flex flex-col gap-3">
                            <button disabled={isProcessing} onClick={handleClearAndAdd} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all disabled:opacity-50">
                                {isProcessing ? "Processing..." : "Clear and Add"}
                            </button>
                            <button onClick={() => setShowClearCartConfirm(false)} className="w-full py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            <header className="h-16 border-b border-slate-100 flex items-center justify-between px-4 md:px-8 sticky top-0 bg-white z-10">
                <button onClick={onClose} className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 font-bold transition-colors">
                    <FaArrowLeft /> <span className="uppercase tracking-widest text-xs">Back to Catalog</span>
                </button>
            </header>

            <div className="flex-1 overflow-y-auto bg-[#FDFDFD]">
                <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-12">
                    <div className="flex flex-col lg:flex-row gap-12">

                        <div className="flex-1">
                            {/* Package Title & Header */}
                            <div className="mb-8">
                                <div className="flex flex-wrap gap-2 mb-4">
                                    <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black px-3 py-1 rounded-full uppercase border border-emerald-100">
                                        {pkg.mainCategory || "Pathology"}
                                    </span>
                                </div>
                                <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight uppercase">{pkg.packageName}</h1>
                                <p className="text-slate-500 text-lg leading-relaxed font-medium">{pkg.shortDescription || pkg.description}</p>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                                <StatCard icon={<FaClock className="text-blue-500" />} label="Reports" value={pkg.reportTime || "24 Hours"} />
                                <StatCard icon={<FaVial className="text-rose-500" />} label="Sample" value={pkg.sampleTypes?.join("/") || "Blood"} />
                                <StatCard icon={<FaHistory className="text-amber-500" />} label="Fasting" value={fastingRequired ? "Required" : "No"} />
                                <StatCard icon={<FaUserFriends className="text-purple-500" />} label="Gender" value={pkg.gender} />
                            </div>

                            {/* Vendor/Lab Selection */}
                            {pkg.vendorList?.length > 0 && (
                                <section className="mb-12">
                                    <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                                        <FaClinicMedical className="text-emerald-500" /> Choose Laboratory Center
                                    </h3>
                                    <div className="grid gap-4">
                                        {pkg.vendorList.map((lab) => (
                                            <div
                                                key={lab._id}
                                                onClick={() => !isAdded && setSelectedLab(lab)}
                                                className={`p-5 rounded-2xl border-2 transition-all flex items-center justify-between ${selectedLab?._id === lab._id ? "border-emerald-500 bg-emerald-50/40" : "border-slate-100 bg-white cursor-pointer hover:border-slate-200"}`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedLab?._id === lab._id ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"}`}>
                                                        <FaClinicMedical size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900 uppercase text-sm">{lab.labName || "Partner Lab"}</p>
                                                        <p className="text-[10px] text-slate-500 font-black uppercase">{lab.totalTestsIncluded || pkg.totalTestsIncluded} Parameters</p>
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

                            {/* Test Details */}
                            <section className="mb-12">
                                <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3 uppercase">
                                    <FaMicroscope className="text-emerald-500" /> Tests Included ({pkg.tests?.length || 0})
                                </h3>
                                {hasRichTestData ? (
                                    <div className="space-y-4">
                                        {pkg.tests.map((test) => (
                                            <div key={test._id} className="border border-slate-100 rounded-2xl bg-white p-5 shadow-sm">
                                                <h4 className="font-bold text-slate-900 text-lg uppercase">{test.testName}</h4>
                                                <p className="text-[10px] text-emerald-600 font-black uppercase mb-3">{test.sampleType} Sample</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {test.parameters?.map((p, i) => (
                                                        <span key={i} className="bg-slate-50 border border-slate-100 text-slate-500 text-[10px] px-2 py-1 rounded font-black uppercase">{p}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 bg-slate-50 rounded-2xl text-center border-2 border-dashed border-slate-200">
                                        <p className="font-bold text-slate-500 uppercase text-xs">Includes {pkg.totalTestsIncluded || pkg.tests?.length} essential parameters.</p>
                                    </div>
                                )}
                            </section>
                        </div>

                        {/* Sticky Sidebar */}
                        <div className="w-full lg:w-80">
                            <div className="sticky top-28 bg-white border border-slate-200 rounded-[2rem] shadow-2xl p-6 overflow-hidden">
                                <div className="relative z-10">
                                    <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Total Package Amount</p>
                                    <div className="flex items-baseline gap-2 mb-1">
                                        <span className="text-4xl font-black text-slate-900">₹{displayPrice}</span>
                                        {strikePrice > displayPrice && <span className="text-slate-400 line-through font-bold">₹{strikePrice}</span>}
                                    </div>
                                    {discount > 0 && (
                                        <p className="text-[10px] font-black text-emerald-600 mb-6 bg-emerald-50 px-2 py-1 rounded inline-block">
                                            SAVING {discount}%
                                        </p>
                                    )}
                                    
                                    <button
                                        disabled={isProcessing}
                                        onClick={handleAction}
                                        className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 ${
                                            isAdded 
                                            ? "bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-600 hover:text-white" 
                                            : "bg-emerald-600 text-white hover:bg-slate-900 shadow-xl shadow-emerald-100"
                                        }`}
                                    >
                                        {isProcessing ? (
                                            "Processing..."
                                        ) : isAdded ? (
                                            <><FaTrashAlt /> Remove Item</>
                                        ) : (
                                            <><FaShoppingCart /> Book Now</>
                                        )}
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