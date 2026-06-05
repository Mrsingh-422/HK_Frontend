"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  FaStar,
  FaChevronLeft,
  FaChevronRight,
  FaEye,
  FaArrowCircleRight,
  FaShieldAlt,
  FaPlus,
  FaStethoscope
} from "react-icons/fa";
import UserAPI from "@/app/services/UserAPI";

// Themed images for Medical Devices
const DEVICE_IMAGES = [
  "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=500&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1584017945666-d47f9e83f3e2?q=80&w=500&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1615461066841-6116e61058f4?q=80&w=500&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=500&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?q=80&w=500&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=500&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1603398938378-e54eab446ddd?q=80&w=500&auto=format&fit=crop",
];

export default function HealthMonitors() {
  const router = useRouter();
  const scrollRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        setLoading(true);
        // Calling API with "Devices" category
        const response = await UserAPI.getProductsByCategory("Devices");
        if (response.success) {
          // Show only 7 products as requested
          setProducts(response.data.slice(0, 7));
        }
      } catch (error) {
        console.error("Error fetching Devices:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDevices();
  }, []);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = direction === "left" ? -clientWidth : clientWidth;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <section className="py-10 md:py-16 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 md:px-6">

        {/* --- HEADER --- */}
        <div className="flex items-center justify-between mb-8 md:mb-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="h-1 w-6 bg-emerald-500 rounded-full"></span>
              <span className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.2em]">Diagnostic Tools</span>
            </div>
            <h2 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight leading-none">
              Health <span className="text-emerald-700">Monitors</span>
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex gap-1.5">
              <button onClick={() => scroll('left')} className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all shadow-sm cursor-pointer active:scale-90">
                <FaChevronLeft size={12} />
              </button>
              <button onClick={() => scroll('right')} className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all shadow-sm cursor-pointer active:scale-90">
                <FaChevronRight size={12} />
              </button>
            </div>
            <button
              onClick={() => router.push("/buymedicine/seeallmed")}
              className="text-xs font-black text-slate-400 hover:text-emerald-600 transition-all uppercase tracking-widest flex items-center gap-2"
            >
              See All <FaChevronRight size={10} />
            </button>
          </div>
        </div>

        {/* --- PRODUCT SCROLL (5 on Desktop, 2 on Mobile) --- */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto gap-3 md:gap-5 pb-10 scrollbar-hide snap-x snap-mandatory pt-1"
        >
          {loading ? (
            [...Array(5)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-[calc(50%-8px)] lg:w-[calc(20%-16px)] bg-white rounded-2xl h-[340px] animate-pulse border border-slate-100" />
            ))
          ) : (
            <>
              {products.map((item, index) => {
                const displayImage = DEVICE_IMAGES[index % DEVICE_IMAGES.length];

                return (
                  <div
                    key={item._id}
                    onClick={() => router.push(`/buymedicine/singleproductdetail/${item._id}`)}
                    className="flex-shrink-0 w-[calc(50%-8px)] lg:w-[calc(20%-16px)] snap-start group bg-white border border-slate-100 rounded-[1.5rem] md:rounded-[2.2rem] p-2 md:p-3 hover:shadow-2xl hover:shadow-slate-200 hover:-translate-y-1 transition-all duration-500 cursor-pointer flex flex-col relative"
                  >
                    {/* Image Section */}
                    <div className="relative aspect-square w-full mb-3 bg-slate-50 rounded-xl md:rounded-[1.8rem] overflow-hidden shrink-0">
                      <img
                        src={displayImage}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      {item.discont_percent && (
                        <div className="absolute top-2 left-2 bg-emerald-600 text-white text-[7px] md:text-[8px] font-black px-2 py-0.5 md:py-1 rounded-md shadow-lg uppercase">
                          {item.discont_percent} Off
                        </div>
                      )}
                    </div>

                    {/* Content Area */}
                    <div className="flex flex-col flex-1 px-1 min-w-0">
                      <div className="flex items-center gap-1 mb-1">
                        <FaStar className="text-amber-400" size={8} />
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Clinically Proven</span>
                      </div>

                      <h3 className="text-[11px] md:text-sm font-black text-slate-800 line-clamp-1 mb-0.5 uppercase group-hover:text-emerald-700 transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-[8px] md:text-[10px] text-slate-400 font-bold tracking-widest truncate mb-3 uppercase">
                        {item.manufacturers}
                      </p>

                      <div className="flex items-end justify-between mb-4">
                        <div className="flex flex-col">
                          {parseInt(item.mrp) > parseInt(item.best_price) && (
                            <span className="text-[8px] md:text-[9px] text-slate-300 line-through font-bold">₹{item.mrp}</span>
                          )}
                          <span className="text-[14px] md:text-lg font-black text-slate-900 leading-none tracking-tight">₹{item.best_price}</span>
                        </div>
                        <div className="h-7 w-7 md:h-9 md:w-9 flex items-center justify-center rounded-lg md:rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                          <FaPlus size={10} />
                        </div>
                      </div>

                      <div className="mt-auto">
                        <button className="w-full py-2.5 md:py-3 bg-emerald-600 text-white rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-[0.15em] flex items-center justify-center gap-2 group-hover:bg-slate-900 transition-all duration-300 shadow-lg shadow-slate-100">
                          <FaEye size={12} className="opacity-70" /> View Detail
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* --- THE FINAL VIEW ALL CARD --- */}
              <div
                onClick={() => router.push("/buymedicine/seeallmed")}
                className="flex-shrink-0 w-[calc(50%-8px)] lg:w-[calc(20%-16px)] snap-start group bg-slate-50 border-2 border-dashed border-slate-200 rounded-[1.5rem] md:rounded-[2.2rem] p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:bg-white hover:border-emerald-300"
              >
                <div className="w-10 h-10 md:w-14 md:h-14 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm border border-slate-100 group-hover:scale-110 group-hover:text-emerald-600 transition-all">
                  <FaArrowCircleRight className="text-slate-300 text-xl md:text-2xl group-hover:text-emerald-500" />
                </div>
                <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Explore</p>
                <p className="text-[11px] md:text-sm font-black text-slate-900 leading-tight uppercase">View All<br />Devices</p>
              </div>
            </>
          )}
        </div>

        {/* --- PREMIUM BANNER --- */}
        <div
          onClick={() => router.push("/offers")}
          className="mt-4 md:mt-8 cursor-pointer overflow-hidden rounded-[1.5rem] md:rounded-[2.5rem] bg-slate-900 relative group p-8 md:p-14"
        >
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 text-emerald-500 mb-4">
                <FaShieldAlt size={16} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Official Warranty</span>
              </div>
              <h4 className="text-2xl md:text-5xl font-black text-white leading-none tracking-tighter">
                Precision Tech. <br />
                <span className="text-emerald-500">Lifetime Trust.</span>
              </h4>
              <p className="text-slate-400 text-xs md:text-base mt-4 font-medium opacity-90 max-w-sm">
                Up to 3 years of extended warranty on select digital monitors.
              </p>
            </div>
            <button className="bg-emerald-600 text-white px-8 md:px-12 py-3 md:py-5 rounded-xl md:rounded-2xl font-black text-[11px] md:text-sm shadow-2xl shadow-emerald-900/40 group-hover:bg-white group-hover:text-slate-900 transition-all active:scale-95 uppercase tracking-widest">
              CLAIM BENEFITS
            </button>
          </div>

          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
        </div>

        {/* --- TRUST BAR --- */}
        <div className="mt-12 flex flex-wrap justify-center gap-8 md:gap-16 text-slate-400 border-t border-slate-100 pt-8">
          <div className="flex items-center gap-2">
            <FaShieldAlt size={12} className="text-emerald-500" />
            <span className="text-[9px] font-black uppercase tracking-widest">ISO Certified</span>
          </div>
          <div className="flex items-center gap-2">
            <FaStethoscope size={12} className="text-emerald-500" />
            <span className="text-[9px] font-black uppercase tracking-widest">Expert Recommended</span>
          </div>
        </div>

      </div>

      <style jsx global>{`
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
    </section>
  );
}