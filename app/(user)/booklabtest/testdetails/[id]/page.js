"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    FaShoppingCart, FaTrashAlt, FaClock, FaVial,
    FaHistory, FaClinicMedical, FaArrowLeft,
    FaUserFriends, FaMicroscope, FaExclamationTriangle,
    FaCheckCircle, FaInfoCircle, FaStar, FaBolt
} from "react-icons/fa";
import { useCart } from "@/app/context/CartContext";
import toast from "react-hot-toast";
import UserAPI from "@/app/services/UserAPI";

export default function TestDetailPage() {
    const { id } = useParams(); // This is the testId
    const router = useRouter();

    // Using context methods
    const { cart, cartItemIds, addItem, removeItem } = useCart();

    const [testData, setTestData] = useState(null);
    const [labs, setLabs] = useState([]);
    const [selectedLab, setSelectedLab] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);

    // 1. Fetch Test Data using Coordinates from LocalStorage
    useEffect(() => {
        const fetchTestDetails = async () => {
            try {
                const storedCoords = localStorage.getItem("userCoords");
                let coords = { lat: 30.737996916027278, lng: 76.66061907396148 };

                if (storedCoords) {
                    try { coords = JSON.parse(storedCoords); } catch (e) { console.error("Coord parse error"); }
                }

                // Call the POST API for Test Details
                const response = await UserAPI.getSingleTestDetails(id, coords);

                if (response.success) {
                    const data = response.data.testDetails;
                    const labsData = response.data.availableInLabs || [];

                    setTestData(data);
                    setLabs(labsData);

                    // Auto-select the first lab available
                    if (labsData.length > 0) {
                        setSelectedLab(labsData[0]);
                    }
                } else {
                    toast.error(response.message || "Test not found");
                }
            } catch (error) {
                console.error("Fetch Error:", error);
                toast.error("Failed to load test details");
            } finally {
                setPageLoading(false);
            }
        };

        if (id) fetchTestDetails();
    }, [id]);

    /** 
     * Check if this specific lab's version of the test is in the cart
     */
    const isAdded = useMemo(() => {
        if (!selectedLab) return false;
        return cartItemIds.includes(selectedLab.labTestId);
    }, [cartItemIds, selectedLab]);

    // HANDLER FOR ADD/REMOVE
    const handleAction = async () => {
        if (!selectedLab) {
            toast.error("Please select a lab first");
            return;
        }

        if (isAdded) {
            try {
                setIsProcessing(true);
                await removeItem(selectedLab.labTestId);
                toast.success("Removed from cart");
            } catch (error) {
                toast.error("Failed to remove test");
            } finally {
                setIsProcessing(false);
            }
        } else {
            try {
                setIsProcessing(true);
                // itemId: selectedLab.labTestId, type: 'LabTest'
                await addItem(selectedLab.labId, selectedLab.labTestId, 'LabTest');
                toast.success("Added to cart!");
            } catch (error) {
                console.error("Cart Add Error", error);
            } finally {
                setIsProcessing(false);
            }
        }
    };

    if (pageLoading) return (
        <div className="h-screen flex flex-col items-center justify-center bg-white">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">Fetching Test Info...</p>
        </div>
    );

    if (!testData) return <div className="h-screen flex items-center justify-center font-bold">Test not found</div>;

    return (
        <div className="min-h-screen bg-[#FDFDFD] pb-20">
            <main className="max-w-6xl mx-auto px-4 py-8">
                {/* Back Link */}
                <button onClick={() => router.back()} className="mb-8 flex items-center gap-2 text-slate-400 font-bold hover:text-emerald-600 transition-colors uppercase text-[10px] tracking-widest">
                    <FaArrowLeft /> Back to tests
                </button>

                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Left Column: Details */}
                    <div className="flex-1">
                        <div className="mb-8">
                            <div className="flex flex-wrap gap-2 mb-4">
                                <span className="bg-blue-100 text-blue-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">{testData.mainCategory}</span>
                                <span className="bg-slate-100 text-slate-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">{testData.category}</span>
                                <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">{testData.testCode}</span>
                            </div>
                            <h1 className="text-5xl font-black text-slate-900 uppercase leading-[0.9] mb-4">{testData.testName}</h1>
                            <p className="text-slate-500 text-lg font-medium leading-relaxed max-w-2xl">Essential diagnostic test for {testData.category} health.</p>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                            <StatCard icon={<FaVial className="text-rose-500" />} label="Sample" value={testData.sampleType} />
                            <StatCard icon={<FaHistory className="text-amber-500" />} label="Preparation" value={testData.pretestPreparation || "None"} />
                            <StatCard icon={<FaUserFriends className="text-purple-500" />} label="Gender" value={testData.gender} />
                            <StatCard icon={<FaMicroscope className="text-emerald-500" />} label="Parameters" value={testData.parameters?.join(", ")} />
                        </div>

                        {/* Lab Selection */}
                        {labs.length > 0 && (
                            <section className="mb-12">
                                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
                                    <div className="w-8 h-[2px] bg-emerald-500"></div> Available Laboratories
                                </h3>
                                <div className="grid gap-4">
                                    {labs.map((lab) => (
                                        <div
                                            key={lab.labId}
                                            onClick={() => setSelectedLab(lab)}
                                            className={`p-6 rounded-[2rem] border-2 cursor-pointer transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${selectedLab?.labId === lab.labId ? "border-emerald-500 bg-emerald-50/30 shadow-xl shadow-emerald-100/50" : "border-slate-100 bg-white hover:border-emerald-200"}`}
                                        >
                                            <div className="flex items-center gap-5">
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${selectedLab?.labId === lab.labId ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"}`}>
                                                    <FaClinicMedical />
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-900 text-lg uppercase tracking-tight">{lab.name}</p>
                                                    <div className="flex flex-wrap items-center gap-4 mt-1">
                                                        <span className="flex items-center gap-1 text-xs font-black text-amber-500"><FaStar /> {lab.rating} ({lab.totalReviews})</span>
                                                        <span className="text-[10px] text-slate-400 font-bold uppercase">{lab.distance} km away</span>
                                                        {lab.isRapid && <span className="flex items-center gap-1 text-[10px] text-orange-600 font-bold uppercase"><FaBolt /> Rapid Results</span>}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="md:text-right w-full md:w-auto pt-4 md:pt-0 border-t md:border-none border-slate-100">
                                                <p className="text-2xl font-black text-slate-900">₹{lab.discountPrice}</p>
                                                {lab.discount > 0 && <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest">{lab.discount}% Discount Applied</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Detailed Description */}
                        {testData.detailedDescription?.map((desc) => (
                            <section key={desc._id} className="mb-10 p-8 bg-slate-50 rounded-[2.5rem]">
                                <h3 className="text-lg font-black text-slate-900 uppercase mb-4 flex items-center gap-2">
                                    <FaInfoCircle className="text-blue-500" /> {desc.sectionTitle}
                                </h3>
                                <p className="text-slate-600 leading-relaxed text-sm">{desc.sectionContent}</p>
                            </section>
                        ))}

                        {/* FAQ Section */}
                        {testData.faqs?.length > 0 && (
                            <section className="mb-12">
                                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Frequently Asked</h3>
                                <div className="space-y-4">
                                    {testData.faqs.map((faq) => (
                                        <div key={faq._id} className="p-6 border border-slate-100 rounded-3xl">
                                            <p className="font-black text-slate-900 text-xs uppercase mb-2">Q: {faq.question}</p>
                                            <p className="text-slate-500 text-sm">A: {faq.answer}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Right Column: Sticky Sidebar */}
                    <div className="w-full lg:w-96">
                        <div className="sticky top-24 bg-white border border-slate-100 rounded-[3rem] p-10 shadow-2xl shadow-slate-200/50">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Total Test Price</p>

                            <div className="flex items-baseline gap-3 mb-8">
                                <span className="text-6xl font-black text-slate-900 tracking-tighter">₹{selectedLab?.discountPrice || testData.standardMRP}</span>
                                {selectedLab?.amount > selectedLab?.discountPrice && (
                                    <span className="text-slate-300 line-through font-bold text-xl">₹{selectedLab.amount}</span>
                                )}
                            </div>

                            <div className="space-y-4 mb-10">
                                <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl">
                                    <FaCheckCircle className="text-emerald-500" />
                                    <div>
                                        <p className="text-[10px] font-black text-emerald-700 uppercase tracking-wider">Certified Results</p>
                                        <p className="text-[10px] font-bold text-emerald-600/70 uppercase">
                                            {selectedLab?.isHomeCollection ? "Home collection available" : "Lab visit required"}
                                        </p>
                                    </div>
                                </div>
                                <div className="p-4 border border-slate-100 rounded-2xl">
                                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Pre-test Requirements</p>
                                    <p className="text-[11px] font-bold text-slate-600 uppercase">{testData.pretestPreparation || "No specific instructions"}</p>
                                </div>
                            </div>

                            <button
                                disabled={isProcessing}
                                onClick={handleAction}
                                className={`w-full py-6 rounded-3xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 active:scale-95 ${isAdded
                                    ? "bg-rose-50 text-rose-600 hover:bg-rose-100"
                                    : "bg-slate-900 text-white shadow-2xl shadow-slate-300 hover:bg-emerald-600"
                                    }`}
                            >
                                {isProcessing ? "Updating..." : isAdded ? <><FaTrashAlt /> Remove from cart</> : <><FaShoppingCart /> Add to cart</>}
                            </button>

                            <p className="text-[9px] text-center text-slate-300 mt-8 font-black uppercase tracking-widest">
                                Safe & Secure Health Services
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

const StatCard = ({ icon, label, value }) => (
    <div className="bg-white border border-slate-50 p-6 rounded-[2rem] flex flex-col items-center text-center shadow-sm hover:shadow-md transition-all">
        <div className="text-2xl mb-3">{icon}</div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-[11px] font-black uppercase text-slate-900 truncate w-full">{value || "N/A"}</p>
    </div>
);