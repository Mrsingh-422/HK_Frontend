"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    FaShoppingCart, FaTrashAlt, FaClock, FaVial,
    FaHistory, FaClinicMedical, FaArrowLeft,
    FaUserFriends, FaMicroscope, FaExclamationTriangle,
    FaCheckCircle, FaInfoCircle, FaStar, FaTimes
} from "react-icons/fa";
import { useCart } from "@/app/context/CartContext";
import toast from "react-hot-toast";
import UserAPI from "@/app/services/UserAPI";

export default function PackageDetailPage() {
    const { id } = useParams();
    const router = useRouter();

    // Using context methods
    const { cart, cartItemIds, addItem, removeItem, loading: cartLoading } = useCart();

    const [pkg, setPkg] = useState(null);
    const [labs, setLabs] = useState([]);
    const [selectedLab, setSelectedLab] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    
    // New state for custom warning modal
    const [showConflictModal, setShowConflictModal] = useState(false);

    // 1. Fetch Package Data using Coordinates from LocalStorage
    useEffect(() => {
        const fetchPackageDetails = async () => {
            try {
                const storedCoords = localStorage.getItem("userCoords");
                let coords = { lat: 30.737996916027278, lng: 76.66061907396148 };

                if (storedCoords) {
                    try { coords = JSON.parse(storedCoords); } catch (e) { console.error("Coord parse error"); }
                }

                const response = await UserAPI.getSinglePackageDetails(id, coords);

                if (response.success) {
                    const packageData = response.data.packageDetails;
                    const labsData = response.data.availableInLabs || [];

                    setPkg(packageData);
                    setLabs(labsData);

                    if (labsData.length > 0) {
                        setSelectedLab(labsData[0]);
                    }
                } else {
                    toast.error(response.message || "Package not found");
                }
            } catch (error) {
                console.error("Fetch Error:", error);
                toast.error("Failed to load package details");
            } finally {
                setPageLoading(false);
            }
        };

        if (id) fetchPackageDetails();
    }, [id]);

    const isAdded = useMemo(() => {
        if (!selectedLab) return false;
        return cartItemIds.includes(selectedLab.labPackageId);
    }, [cartItemIds, selectedLab]);

    // Handle the "Clear and Add" confirmation
    const handleConfirmReplace = async () => {
        try {
            setIsProcessing(true);
            setShowConflictModal(false);
            // Call addItem with forceReplace = true
            await addItem(selectedLab.labId, selectedLab.labPackageId, 'LabPackage', true);
            toast.success("Cart updated successfully");
        } catch (error) {
            toast.error("Failed to update cart");
        } finally {
            setIsProcessing(false);
        }
    };

    // HANDLER FOR ADD/REMOVE
    const handleAction = async () => {
        if (!selectedLab) {
            toast.error("Please select a lab first");
            return;
        }

        if (isAdded) {
            try {
                setIsProcessing(true);
                await removeItem(selectedLab.labPackageId);
                toast.success("Removed from cart");
            } catch (error) {
                toast.error("Failed to remove item");
            } finally {
                setIsProcessing(false);
            }
        } else {
            // CHECK FOR CONFLICT BEFORE ADDING
            if (cart && cart.items?.length > 0) {
                const currentLabId = cart.labId?._id || cart.labId;
                const currentCategory = cart.categoryType;
                const newCategory = pkg.mainCategory;

                if (currentLabId !== selectedLab.labId || currentCategory !== newCategory) {
                    setShowConflictModal(true);
                    return;
                }
            }

            try {
                setIsProcessing(true);
                await addItem(selectedLab.labId, selectedLab.labPackageId, 'LabPackage');
            } catch (error) {
                console.error("Cart Add Error", error);
            } finally {
                setIsProcessing(false);
            }
        }
    };

    if (pageLoading) return (
        <div className="h-screen flex flex-col items-center justify-center bg-white px-4">
            <div className="w-10 h-10 md:w-12 md:h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="font-bold text-slate-400 uppercase tracking-widest text-[10px] md:text-xs">Loading Package...</p>
        </div>
    );

    if (!pkg) return <div className="h-screen flex items-center justify-center font-bold px-4">Package not found</div>;

    return (
        <div className="min-h-screen bg-[#FDFDFD] pb-10 md:pb-20">
            
            {/* CUSTOM CONFLICT MODAL */}
            {showConflictModal && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-sm rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 shadow-2xl animate-in zoom-in-95 duration-200 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-amber-500"></div>
                        <div className="w-14 h-14 md:w-16 md:h-16 bg-amber-50 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                            <FaExclamationTriangle className="text-amber-600 text-xl md:text-2xl" />
                        </div>
                        <h3 className="text-lg md:text-xl font-black text-slate-900 text-center mb-2">Replace Cart?</h3>
                        <p className="text-slate-500 text-center font-medium text-xs md:text-sm mb-6 md:mb-8 leading-relaxed">
                            Your cart already contains items from <span className="font-bold text-slate-700">{cart.labName || "another laboratory"}</span>. Clear it to add this package?
                        </p>
                        <div className="flex flex-col gap-3">
                            <button 
                                onClick={handleConfirmReplace} 
                                className="w-full py-3 md:py-4 bg-slate-900 text-white rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg"
                            >
                                Clear and Add
                            </button>
                            <button 
                                onClick={() => setShowConflictModal(false)} 
                                className="w-full py-3 md:py-4 bg-slate-100 text-slate-500 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <main className="max-w-6xl mx-auto px-4 py-6 md:py-8">
                {/* Back Link */}
                <button onClick={() => router.back()} className="mb-6 md:mb-8 flex items-center gap-2 text-slate-400 font-bold hover:text-emerald-600 transition-colors uppercase text-[9px] md:text-[10px] tracking-widest">
                    <FaArrowLeft /> Back to search
                </button>

                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                    {/* Left Column: Details */}
                    <div className="flex-1">
                        <div className="mb-6 md:mb-8">
                            <div className="flex flex-wrap gap-2 mb-3 md:mb-4">
                                <span className="bg-emerald-100 text-emerald-700 text-[9px] md:text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-tighter">{pkg.mainCategory}</span>
                                <span className="bg-slate-100 text-slate-600 text-[9px] md:text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-tighter">{pkg.category}</span>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-black text-slate-900 uppercase leading-tight md:leading-[0.9] mb-4">{pkg.packageName}</h1>
                            <p className="text-slate-500 text-sm md:text-lg font-medium leading-relaxed max-w-2xl">{pkg.shortDescription}</p>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 mb-8 md:mb-12">
                            <StatCard icon={<FaClock className="text-blue-500" />} label="Reports" value={pkg.reportTime} />
                            <StatCard icon={<FaVial className="text-rose-500" />} label="Sample" value={pkg.sampleTypes?.join(", ")} />
                            <StatCard icon={<FaHistory className="text-amber-500" />} label="Fasting" value={pkg.isFastingRequired ? "Required" : "No"} />
                            <StatCard icon={<FaUserFriends className="text-purple-500" />} label="Gender" value={pkg.gender} />
                        </div>

                        {/* Lab Selection */}
                        {labs.length > 0 && (
                            <section className="mb-8 md:mb-12">
                                <h3 className="text-[11px] md:text-sm font-black uppercase tracking-[0.2em] text-slate-400 mb-4 md:mb-6 flex items-center gap-2">
                                    <div className="w-6 md:w-8 h-[2px] bg-emerald-500"></div> Available Laboratories
                                </h3>
                                <div className="grid gap-3 md:gap-4">
                                    {labs.map((lab) => (
                                        <div
                                            key={lab.labId}
                                            onClick={() => setSelectedLab(lab)}
                                            className={`p-4 md:p-6 rounded-2xl md:rounded-[2rem] border-2 cursor-pointer transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${selectedLab?.labId === lab.labId ? "border-emerald-500 bg-emerald-50/30 shadow-xl shadow-emerald-100/50" : "border-slate-100 bg-white hover:border-emerald-200"}`}
                                        >
                                            <div className="flex items-center gap-4 md:gap-5">
                                                <div className={`w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center text-xl ${selectedLab?.labId === lab.labId ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"}`}>
                                                    <FaClinicMedical className="size-5 md:size-auto" />
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-900 text-base md:text-lg uppercase tracking-tight">{lab.name}</p>
                                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                                                        <span className="flex items-center gap-1 text-[10px] md:text-xs font-black text-amber-500"><FaStar /> {lab.rating}</span>
                                                        <span className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase">{lab.distance} km from you</span>
                                                        {lab.isHomeCollection && <span className="text-[9px] md:text-[10px] text-emerald-600 font-bold uppercase">Home Visit</span>}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="md:text-right w-full md:w-auto pt-3 md:pt-0 border-t md:border-none border-slate-100">
                                                <p className="text-xl md:text-2xl font-black text-slate-900">₹{lab.offerPrice}</p>
                                                {lab.mrp > lab.offerPrice && <p className="text-[9px] md:text-[10px] text-emerald-600 font-black uppercase tracking-widest">Special Offer</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Tests List */}
                        <section className="mb-8 md:mb-12">
                            <h3 className="text-[11px] md:text-sm font-black uppercase tracking-[0.2em] text-slate-400 mb-4 md:mb-6 flex items-center gap-2">
                                <div className="w-6 md:w-8 h-[2px] bg-blue-500"></div> Tests & Parameters
                            </h3>
                            <div className="grid sm:grid-cols-2 gap-3 md:gap-4">
                                {pkg.tests?.map((test) => (
                                    <div key={test._id} className="p-5 md:p-6 border border-slate-100 rounded-2xl md:rounded-[2rem] bg-white shadow-sm">
                                        <div className="flex items-center gap-3 mb-3 md:mb-4">
                                            <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500"><FaMicroscope size={12} className="md:size-[14px]" /></div>
                                            <h4 className="font-black uppercase text-slate-800 text-[10px] md:text-xs tracking-wider">{test.testName}</h4>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5 md:gap-2">
                                            {test.parameters?.map((p, i) => (
                                                <span key={i} className="text-[8px] md:text-[9px] bg-slate-50 border border-slate-100 px-2 md:px-3 py-0.5 md:py-1 rounded-full uppercase font-bold text-slate-400 tracking-tighter">{p}</span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Overview Content */}
                        {pkg.detailedDescription?.map((desc) => (
                            <section key={desc._id} className="mb-6 md:mb-10 p-6 md:p-8 bg-slate-50 rounded-2xl md:rounded-[2.5rem]">
                                <h3 className="text-base md:text-lg font-black text-slate-900 uppercase mb-3 md:mb-4 flex items-center gap-2">
                                    <FaInfoCircle className="text-blue-500 size-4 md:size-auto" /> {desc.sectionTitle}
                                </h3>
                                <p className="text-slate-600 leading-relaxed text-[13px] md:text-sm">{desc.sectionContent}</p>
                            </section>
                        ))}

                        {/* FAQ Section */}
                        {pkg.faqs?.length > 0 && (
                            <section className="mb-8 md:mb-12">
                                <h3 className="text-[11px] md:text-sm font-black uppercase tracking-[0.2em] text-slate-400 mb-4 md:mb-6">Common Questions</h3>
                                <div className="space-y-3 md:space-y-4">
                                    {pkg.faqs.map((faq) => (
                                        <div key={faq._id} className="p-5 md:p-6 border border-slate-100 rounded-2xl md:rounded-3xl">
                                            <p className="font-black text-slate-900 text-[11px] md:text-xs uppercase mb-2">Q: {faq.question}</p>
                                            <p className="text-slate-500 text-[13px] md:text-sm">A: {faq.answer}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Right Column: Sticky Sidebar */}
                    <div className="w-full lg:w-96">
                        <div className="lg:sticky lg:top-24 bg-white border border-slate-100 rounded-2xl md:rounded-[3rem] p-6 md:p-10 shadow-2xl shadow-slate-200/50">
                            <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 md:mb-4">Total Package Price</p>

                            <div className="flex items-baseline gap-2 md:gap-3 mb-6 md:mb-8">
                                <span className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter">₹{selectedLab?.offerPrice || pkg.standardMRP}</span>
                                {selectedLab?.mrp > selectedLab?.offerPrice && (
                                    <span className="text-slate-300 line-through font-bold text-lg md:text-xl">₹{selectedLab.mrp}</span>
                                )}
                            </div>

                            <div className="space-y-3 md:space-y-4 mb-8 md:mb-10">
                                <div className="flex items-center gap-3 p-3 md:p-4 bg-emerald-50 rounded-xl md:rounded-2xl">
                                    <FaCheckCircle className="text-emerald-500 size-4 md:size-auto" />
                                    <div>
                                        <p className="text-[9px] md:text-[10px] font-black text-emerald-700 uppercase tracking-wider">Verified Lab</p>
                                        <p className="text-[9px] md:text-[10px] font-bold text-emerald-600/70 uppercase">Sample collection included</p>
                                    </div>
                                </div>
                                <div className="p-3 md:p-4 border border-slate-100 rounded-xl md:rounded-2xl">
                                    <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase mb-1">Preparation</p>
                                    <p className="text-[10px] md:text-[11px] font-bold text-slate-600 uppercase">{pkg.preparations?.join(", ") || "No special instructions"}</p>
                                </div>
                            </div>

                            <button
                                disabled={isProcessing}
                                onClick={handleAction}
                                className={`w-full py-4 md:py-6 rounded-2xl md:rounded-3xl font-black text-[10px] md:text-xs uppercase tracking-[0.15em] md:tracking-[0.2em] transition-all flex items-center justify-center gap-2 md:gap-3 active:scale-95 ${isAdded
                                    ? "bg-rose-50 text-rose-600 hover:bg-rose-100"
                                    : "bg-slate-900 text-white shadow-2xl shadow-slate-300 hover:bg-emerald-600"
                                    }`}
                            >
                                {isProcessing ? "Updating..." : isAdded ? <><FaTrashAlt /> Remove</> : <><FaShoppingCart /> Add to cart</>}
                            </button>

                            <p className="text-[8px] md:text-[9px] text-center text-slate-300 mt-6 md:mt-8 font-black uppercase tracking-widest">
                                Secure Checkout & Instant Reports
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

const StatCard = ({ icon, label, value }) => (
    <div className="bg-white border border-slate-50 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] flex flex-col items-center text-center shadow-sm hover:shadow-md transition-all">
        <div className="text-lg md:text-2xl mb-2 md:mb-3">{icon}</div>
        <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-[9px] md:text-[11px] font-black uppercase text-slate-900 truncate w-full">{value || "N/A"}</p>
    </div>
);