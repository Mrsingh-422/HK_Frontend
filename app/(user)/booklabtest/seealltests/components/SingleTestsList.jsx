"use client";

import React, { useState, useEffect, useMemo } from "react";
import UserAPI from "@/app/services/UserAPI";
import { FaStar, FaFlask, FaChevronRight, FaVial, FaCheckCircle, FaPrescriptionBottleAlt } from "react-icons/fa";
import TestDetailsModal from "./otherComponents/TestDetailsModal";
import { useCart } from "@/app/context/CartContext";

const CATEGORY_IMAGES = {
    Radiology: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR2lytqry1YYLSNxtpI-zSkQAtuOmDzscJlcg&s",
    Pathology: "https://www.news-medical.net/images/Article_Images/ImageForArticle_2146_1734704718618352.jpg",
    Default: "https://img.freepik.com/free-photo/medicine-uniform-healthcare-medical-workers-day-concept_185193-108329.jpg?semt=ais_hybrid&w=740&q=80"
};

const SingleTestsList = ({ searchTerm = "", selectedLabId = null }) => {
    const { cartItemIds, addItem, removeItem } = useCart();
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTest, setSelectedTest] = useState(null);

    useEffect(() => {
        const fetchTests = async () => {
            try {
                setLoading(true);
                let response;
                if (selectedLabId && selectedLabId !== "undefined") {
                    response = await UserAPI.getLabDetails(selectedLabId);
                    if (response.success) {
                        setTests(response.tests || []);
                    }
                } else {
                    response = await UserAPI.getStandardTestCatalog();
                    if (response.success) {
                        setTests(response.data || response.tests || []);
                    }
                }
            } catch (err) {
                console.error("Tests Fetch Error:", err);
                setTests([]);
            } finally {
                setLoading(false);
            }
        };
        fetchTests();
    }, [selectedLabId]);

    const filteredTests = useMemo(() => {
        const term = searchTerm?.toLowerCase() || "";
        return tests.filter((test) =>
            test.testName?.toLowerCase().includes(term) ||
            test.mainCategory?.toLowerCase().includes(term)
        );
    }, [tests, searchTerm]);

    const handleCartAction = (test, e) => {
        if (e) e.stopPropagation();

        const isAlreadyAdded = cartItemIds.includes(test._id);

        if (isAlreadyAdded) {
            removeItem(test._id);
        } else {
            // Logic: Use current lab if in lab details, otherwise use the lab that offers the lowest price
            const targetLabId = selectedLabId || test.minPriceLabId || test.cheapestLabId;

            if (!targetLabId) {
                // If no lab context, open modal to let user choose
                handleCardClick(test);
                return;
            }

            addItem(targetLabId, test._id, 'LabTest');
        }
    };

    const handleCardClick = (test) => {
        setSelectedTest(test);
    };

    if (loading) return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-72 bg-slate-50 animate-pulse rounded-[2rem] border border-slate-100" />
            ))}
        </div>
    );

    return (
        <div className="bg-transparent">
            <TestDetailsModal
                isOpen={!!selectedTest}
                onClose={() => setSelectedTest(null)}
                test={selectedTest}
                onAddToCart={(test) => handleCartAction(test)}
                isAdded={selectedTest && cartItemIds.includes(selectedTest._id)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTests.map((test) => {
                    const isAdded = cartItemIds.includes(test._id);
                    const displayPrice = test.offerPrice || test.minPrice || test.mrp || test.standardMRP;
                    const strikePrice = test.standardMRP || test.mrp;
                    const testImage = CATEGORY_IMAGES[test.mainCategory] || CATEGORY_IMAGES.Default;

                    return (
                        <div
                            key={test._id}
                            onClick={() => handleCardClick(test)}
                            className="group relative bg-white rounded-[2rem] border border-slate-100 hover:border-emerald-500/30 hover:shadow-[0_20px_50px_rgba(8,179,106,0.12)] transition-all duration-500 flex flex-col overflow-hidden cursor-pointer"
                        >
                            {/* Category Badge */}
                            <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-sm flex items-center gap-2 border border-slate-100">
                                <FaVial className="text-emerald-500 text-[10px]" />
                                <span className="text-[10px] font-black text-slate-700 uppercase tracking-tight">
                                    {test.mainCategory || 'Diagnostic'}
                                </span>
                            </div>

                            {/* Image Section */}
                            <div className="relative h-40 w-full overflow-hidden">
                                <img
                                    src={testImage}
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                    alt={test.testName}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                
                                {strikePrice > displayPrice && (
                                    <div className="absolute bottom-4 right-4 bg-orange-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg">
                                        SAVE {Math.round(((strikePrice - displayPrice) / strikePrice) * 100)}%
                                    </div>
                                )}
                            </div>

                            {/* Content Section */}
                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-1.5 bg-blue-50 px-2 py-1 rounded-lg">
                                        <FaCheckCircle className="text-blue-500 text-[10px]" />
                                        <span className="text-[10px] font-bold text-blue-600 uppercase">Verified</span>
                                    </div>
                                    <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">
                                        <FaStar className="text-amber-400 text-[10px]" />
                                        <span className="text-slate-700 font-bold text-[10px]">4.8</span>
                                    </div>
                                </div>

                                <h3 className="text-base font-bold text-slate-800 line-clamp-2 h-12 leading-tight mb-4 group-hover:text-emerald-600 transition-colors">
                                    {test.testName}
                                </h3>

                                <div className="flex items-center gap-4 mb-5">
                                    <div className="flex items-center gap-1.5">
                                        <FaFlask className="text-emerald-500 text-xs" />
                                        <span className="text-xs font-medium text-slate-500">{test.sampleType || 'Blood'}</span>
                                    </div>
                                    <div className="w-px h-3 bg-slate-200" />
                                    <span className="text-xs font-medium text-slate-500">Quick Reports</span>
                                </div>

                                {/* Pricing & Action */}
                                <div className="mt-auto pt-5 border-t border-slate-50 flex items-center justify-between gap-4">
                                    <div>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Test Price</p>
                                        <div className="flex items-baseline gap-1.5">
                                            <span className="text-xl font-black text-slate-900">₹{displayPrice}</span>
                                            {strikePrice > displayPrice && (
                                                <span className="text-xs text-slate-300 line-through font-medium">₹{strikePrice}</span>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        onClick={(e) => handleCartAction(test, e)}
                                        className={`px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all duration-300 shadow-md active:scale-95 ${
                                            isAdded 
                                            ? "bg-rose-50 text-rose-500 hover:bg-rose-100" 
                                            : "bg-emerald-600 text-white hover:bg-slate-900 shadow-emerald-200"
                                        }`}
                                    >
                                        {isAdded ? "Remove" : "Book Now"}
                                        {!isAdded && <FaChevronRight size={10} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Empty State */}
            {filteredTests.length === 0 && !loading && (
                <div className="text-center py-24 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 mx-4">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <FaPrescriptionBottleAlt size={24} className="text-slate-300" />
                    </div>
                    <h3 className="text-slate-800 font-bold text-lg">No tests found</h3>
                    <p className="text-slate-400 text-sm max-w-xs mx-auto">We couldn't find any tests matching your search criteria.</p>
                </div>
            )}
        </div>
    );
};

export default SingleTestsList;