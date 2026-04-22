"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  FaMicroscope,
  FaClock,
  FaFlask,
  FaChevronRight,
  FaHome,
  FaShieldAlt,
  FaArrowRight
} from "react-icons/fa";
import UserAPI from "@/app/services/UserAPI";
import { useCart } from "@/app/context/CartContext";

// --- SKELETON FOR HORIZONTAL CARDS ---
const CardSkeleton = () => (
  <div className="flex-shrink-0 w-[260px] md:w-[300px] bg-white border border-slate-100 rounded-[24px] p-5 animate-pulse">
    <div className="flex justify-between mb-4">
      <div className="w-16 h-4 bg-slate-100 rounded"></div>
      <div className="w-8 h-8 bg-slate-100 rounded-xl"></div>
    </div>
    <div className="w-full h-5 bg-slate-100 rounded mb-2"></div>
    <div className="w-2/3 h-3 bg-slate-50 rounded mb-4"></div>
    <div className="flex gap-2 mb-6">
      <div className="w-16 h-5 bg-slate-50 rounded"></div>
      <div className="w-16 h-5 bg-slate-50 rounded"></div>
    </div>
    <div className="flex justify-between items-center pt-4 border-t border-slate-50">
      <div className="w-20 h-6 bg-slate-100 rounded"></div>
      <div className="w-16 h-8 bg-slate-100 rounded-xl"></div>
    </div>
  </div>
);

export default function LabTests() {
  const router = useRouter();
  const { cartItemIds } = useCart();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch 6 tests from the API
  const fetchTests = useCallback(async () => {
    try {
      setLoading(true);
      const response = await UserAPI.getStandardTestCatalog({
        page: 1,
        limit: 6, // Showing only 6 tests as requested
      });

      if (response.success) {
        // Handle different possible response structures
        const data = response.data || response.tests || [];
        setTests(data.slice(0, 6));
      }
    } catch (err) {
      console.error("Tests Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  const handleCardClick = (testId) => {
    router.push(`/booklabtest/testdetails/${testId}`);
  };

  return (
    <section className="py-8 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 md:px-6">

        {/* --- HEADER --- */}
        <div className="flex items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-[#08B36A]/10 rounded-lg flex items-center justify-center text-[#08B36A]">
                <FaMicroscope size={16} />
              </div>
              <span className="text-[#08B36A] text-[10px] font-black uppercase tracking-widest">Diagnostic Services</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Popular Lab Tests</h2>
            <p className="text-sm text-slate-500 font-medium">Safe home sample collection</p>
          </div>

          <button
            onClick={() => router.push("/booklabtest/seealltests")}
            className="group flex items-center gap-2 text-xs font-bold text-[#08B36A] hover:bg-[#08B36A] hover:text-white border border-[#08B36A] px-4 py-2 rounded-full transition-all"
          >
            VIEW ALL <FaChevronRight size={10} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* --- SINGLE LINE HORIZONTAL SCROLL --- */}
        <div className="flex flex-nowrap overflow-x-auto gap-5 pb-8 scrollbar-hide snap-x snap-mandatory">
          {loading ? (
            Array(4).fill(0).map((_, i) => <CardSkeleton key={i} />)
          ) : (
            tests.map((test) => {
              const isAdded = cartItemIds.includes(test._id);
              const displayPrice = test.offerPrice || test.minPrice || test.standardMRP;
              const strikePrice = test.standardMRP || test.mrp;

              return (
                <div
                  key={test._id}
                  onClick={() => handleCardClick(test._id)}
                  className="flex-shrink-0 w-[260px] md:w-[300px] snap-start group relative bg-white border border-slate-100 rounded-[24px] p-5 transition-all duration-300 hover:shadow-xl hover:border-[#08B36A]/20 flex flex-col justify-between overflow-hidden cursor-pointer"
                >
                  {/* Top Section */}
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span className="bg-orange-50 text-orange-600 text-[9px] font-black px-2 py-1 rounded-md uppercase">
                        {test.mainCategory || "Popular"}
                      </span>
                      <div className={`p-2 rounded-xl transition-colors ${isAdded ? "bg-[#08B36A] text-white" : "text-[#08B36A] bg-[#08B36A]/5 group-hover:bg-[#08B36A] group-hover:text-white"}`}>
                        <FaFlask size={16} />
                      </div>
                    </div>

                    <h3 className="text-base font-black text-slate-800 leading-tight mb-2 group-hover:text-[#08B36A] transition-colors line-clamp-1">
                      {test.testName}
                    </h3>

                    <p className="text-[11px] text-slate-500 font-medium mb-4 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#08B36A]"></span>
                      {test.sampleType || "Blood Sample"}
                    </p>

                    <div className="flex gap-2 mb-6">
                      <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                        <FaClock className="text-slate-400" size={10} />
                        <span className="text-[10px] font-bold text-slate-600">{test.reportTime || "24 hrs"}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                        <FaHome className="text-slate-400" size={10} />
                        <span className="text-[10px] font-bold text-slate-600">Home</span>
                      </div>
                    </div>
                  </div>

                  {/* Price & Action */}
                  <div className="mt-auto flex items-center justify-between border-t border-slate-50 pt-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-slate-900">₹{displayPrice}</span>
                        {strikePrice > displayPrice && (
                          <span className="text-[10px] text-[#08B36A] font-bold">
                            {Math.round(((strikePrice - displayPrice) / strikePrice) * 100)}% OFF
                          </span>
                        )}
                      </div>
                      {strikePrice > displayPrice && (
                        <span className="text-[10px] text-slate-400 line-through font-medium">MRP ₹{strikePrice}</span>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCardClick(test._id);
                      }}
                      className={`${isAdded ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-slate-900 text-white hover:bg-[#08B36A]"} px-5 py-2 rounded-xl text-[10px] font-black transition-all shadow-lg active:scale-95`}
                    >
                      {isAdded ? "ADDED" : "BOOK"}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* CSS to hide scrollbar */}
        <style jsx>{`
            .scrollbar-hide::-webkit-scrollbar {
                display: none;
            }
            .scrollbar-hide {
                -ms-overflow-style: none;
                scrollbar-width: none;
            }
        `}</style>

        {/* --- QUALITY PROMISE --- */}
        <div className="mt-4 bg-[#F1F9F5] rounded-[24px] p-6 flex flex-col md:flex-row items-center justify-center gap-8 border border-[#08B36A]/10">
          <div className="flex items-center gap-3">
            <FaShieldAlt className="text-[#08B36A]" size={20} />
            <div>
              <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">NABL Accredited</h4>
              <p className="text-[10px] text-slate-500 font-medium">Highest accuracy guaranteed</p>
            </div>
          </div>
          <div className="hidden md:block w-px h-8 bg-[#08B36A]/20"></div>
          <div className="flex items-center gap-3">
            <FaHome className="text-[#08B36A]" size={20} />
            <div>
              <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">Free Home Sample</h4>
              <p className="text-[10px] text-slate-500 font-medium">Safe & contactless collection</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}