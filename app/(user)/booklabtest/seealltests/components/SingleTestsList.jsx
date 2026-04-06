"use client";
import React, { useState, useEffect, useMemo } from "react";
import UserAPI from "@/app/services/UserAPI";
import { FaStar, FaFlask, FaShoppingCart, FaTrashAlt } from "react-icons/fa";
import TestDetailsModal from "./otherComponents/TestDetailsModal";

const CATEGORY_IMAGES = {
    Radiology: "https://images.unsplash.com/photo-1516062423079-7ca13cdc7f5a?auto=format&fit=crop&q=80&w=500",
    Pathology: "https://images.unsplash.com/photo-1579152276532-535c21af30b0?auto=format&fit=crop&q=80&w=500",
    Default: "https://images.unsplash.com/photo-1582719202047-76d3432ee323?auto=format&fit=crop&q=80&w=500"
};

const SingleTestsList = ({ searchTerm = "", selectedLabId = null }) => {
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTest, setSelectedTest] = useState(null);
    const [cartItems, setCartItems] = useState([]);

    useEffect(() => {
        const fetchTests = async () => {
            try {
                setLoading(true);
                let response;
                if (selectedLabId) {
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

    const toggleCart = (test, e) => {
        if (e) e.stopPropagation();
        setCartItems(prev => prev.includes(test._id)
            ? prev.filter(id => id !== test._id)
            : [...prev, test._id]
        );
    };

    if (loading) return (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-48 md:h-72 bg-slate-50 animate-pulse rounded-xl" />)}
        </div>
    );

    return (
        <div className="bg-white">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                {filteredTests.map((test) => {
                    const displayPrice = test.offerPrice || test.minPrice || test.mrp || test.standardMRP;
                    const testImage = CATEGORY_IMAGES[test.mainCategory] || CATEGORY_IMAGES.Default;
                    const isAdded = cartItems.includes(test._id);

                    return (
                        <div
                            key={test._id}
                            onClick={() => setSelectedTest(test)}
                            className="group cursor-pointer bg-white border border-slate-100 rounded-2xl overflow-hidden hover:border-[#08B36A] hover:shadow-xl transition-all duration-300 flex flex-col"
                        >
                            <div className="relative h-28 sm:h-44 md:h-52 overflow-hidden">
                                <img src={testImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={test.testName} />
                                <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-md text-[8px] md:text-[10px] font-black text-slate-700 uppercase border border-slate-100 shadow-sm">
                                    {test.mainCategory || 'Diagnostic'}
                                </div>
                            </div>

                            <div className="p-3 md:p-5 flex-1 flex flex-col">
                                <h3 className="text-[11px] md:text-sm font-black text-slate-900 line-clamp-2 h-8 md:h-10 group-hover:text-[#08B36A] transition-colors leading-tight">
                                    {test.testName}
                                </h3>

                                <div className="mt-2 md:mt-3 flex items-center gap-2 md:gap-3 text-[9px] md:text-[11px] text-slate-500 font-bold uppercase tracking-tighter">
                                    <div className="flex items-center gap-1"><FaFlask className="text-[#08B36A]" /> {test.sampleType || 'Blood'}</div>
                                    <div className="flex items-center gap-1"><FaStar className="text-yellow-400" /> 4.8</div>
                                </div>

                                <div className="mt-auto pt-3 md:pt-4 border-t border-slate-50 flex items-center justify-between">
                                    <div>
                                        <span className="block text-[8px] md:text-[10px] text-slate-400 line-through font-bold">₹{test.standardMRP || test.mrp}</span>
                                        <span className="text-sm md:text-xl font-black text-slate-900">₹{displayPrice}</span>
                                    </div>

                                    <button
                                        onClick={(e) => toggleCart(test, e)}
                                        className={`p-2 md:p-3 rounded-xl transition-all border flex items-center justify-center ${isAdded
                                                ? "bg-rose-50 text-rose-500 border-rose-100 hover:bg-rose-500 hover:text-white"
                                                : "bg-[#08B36A] text-white border-[#08B36A] hover:bg-slate-900 shadow-md active:scale-90"
                                            }`}
                                    >
                                        {isAdded ? <FaTrashAlt className="text-xs md:text-sm" /> : <FaShoppingCart className="text-xs md:text-sm" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <TestDetailsModal
                isOpen={!!selectedTest}
                onClose={() => setSelectedTest(null)}
                test={selectedTest}
                onAddToCart={(test) => toggleCart(test)}
                isAdded={selectedTest && cartItems.includes(selectedTest._id)}
            />

            {filteredTests.length === 0 && !loading && (
                <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                    <p className="text-slate-400 font-black text-xs uppercase tracking-widest">No tests found.</p>
                </div>
            )}
        </div>
    );
};

export default SingleTestsList;