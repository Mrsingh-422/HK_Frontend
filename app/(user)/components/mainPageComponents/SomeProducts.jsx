"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { FaPlus, FaChevronRight, FaStar, FaShieldAlt, FaStethoscope } from "react-icons/fa";

const PRODUCTS = [
  {
    id: 1,
    name: "Digital Blood Pressure Monitor",
    brand: "Omron",
    price: 2199,
    mrp: 2999,
    discount: "26% OFF",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: 2,
    name: "Fingertip Pulse Oximeter",
    brand: "Dr. Trust",
    price: 999,
    mrp: 1500,
    discount: "33% OFF",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1584017945666-d47f9e83f3e2?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: 3,
    name: "Blood Glucose Monitoring System",
    brand: "Accu-Chek",
    price: 849,
    mrp: 1249,
    discount: "32% OFF",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1615461066841-6116e61058f4?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: 4,
    name: "Infrared Digital Thermometer",
    brand: "Philips",
    price: 1450,
    mrp: 2100,
    discount: "30% OFF",
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: 5,
    name: "Compressor Nebulizer Machine",
    brand: "Beurer",
    price: 2890,
    mrp: 3500,
    discount: "17% OFF",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: 6,
    name: "Body Weight Weighing Scale",
    brand: "HealthSense",
    price: 1199,
    mrp: 1999,
    discount: "40% OFF",
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: 7,
    name: "Ortho Heating Pad (Large)",
    brand: "Flamingo",
    price: 599,
    mrp: 899,
    discount: "33% OFF",
    rating: 4.4,
    image: "https://images.unsplash.com/photo-1559839734-2b71f1e3c770?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: 8,
    name: "Lightweight Stethoscope",
    brand: "Littmann",
    price: 4500,
    mrp: 5200,
    discount: "13% OFF",
    rating: 5.0,
    image: "https://images.unsplash.com/photo-1603398938378-e54eab446ddd?q=80&w=400&auto=format&fit=crop",
  },
];

export default function SomeProducts() {
  const router = useRouter();

  return (
    <section className="py-10 md:py-16 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 md:px-6">

        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-[#08B36A]/10 text-[#08B36A] rounded-full text-[10px] font-black uppercase tracking-widest border border-[#08B36A]/20">
                Medical Equipment
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-none">
              Health <span className="text-[#08B36A]">Monitors.</span>
            </h2>
            <p className="text-slate-400 font-medium mt-4 max-w-lg text-sm md:text-base">
              Certified diagnostic tools to track your vitals accurately at home.
            </p>
          </div>

          <button
            onClick={() => router.push("/buymedicine/seeallmed")}
            className="group flex items-center gap-4 text-xs font-black text-slate-900 hover:text-[#08B36A] transition-all uppercase tracking-widest"
          >
            View All Collection <div className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center group-hover:border-[#08B36A] group-hover:bg-[#08B36A] group-hover:text-white transition-all"><FaChevronRight size={12} /></div>
          </button>
        </div>

        {/* --- SCROLLABLE LIST --- */}
        <div className="flex flex-nowrap overflow-x-auto gap-4 md:gap-7 pb-12 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide snap-x snap-mandatory">
          {PRODUCTS.map((item) => (
            <div
              key={item.id}
              className="flex-shrink-0 w-[190px] md:w-[280px] snap-start group bg-white border border-slate-100 rounded-[2.5rem] p-3 md:p-5 transition-all duration-500 hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-2"
            >
              {/* Image Area */}
              <div className="relative aspect-square rounded-[2rem] bg-slate-50 overflow-hidden mb-5">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-slate-900 text-white text-[9px] font-black px-3 py-1.5 rounded-full shadow-lg">
                    {item.discount}
                  </span>
                </div>
              </div>

              {/* Details */}
              <div className="flex flex-col flex-grow px-1">
                <div className="flex items-center justify-between mb-2">
                   <p className="text-[10px] font-black text-[#08B36A] uppercase tracking-widest">{item.brand}</p>
                   <div className="flex items-center gap-1">
                      <FaStar className="text-amber-400" size={10} />
                      <span className="text-[10px] font-bold text-slate-400">{item.rating}</span>
                   </div>
                </div>

                <h3 className="text-sm md:text-lg font-black text-slate-800 line-clamp-2 h-10 md:h-14 mb-4 leading-tight group-hover:text-[#08B36A] transition-colors">
                  {item.name}
                </h3>

                {/* Price & Button */}
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-300 line-through font-bold">₹{item.mrp}</span>
                    <span className="text-lg md:text-2xl font-black text-slate-900">₹{item.price}</span>
                  </div>

                  <button
                    onClick={() => router.push(`/buymedicine/singleproductdetail/${item.id}`)}
                    className="h-10 w-10 md:h-12 md:w-12 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-900 border border-slate-100 hover:bg-[#08B36A] hover:text-white hover:border-[#08B36A] shadow-sm transition-all active:scale-90"
                  >
                    <FaPlus size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* --- SIMPLE PREMIUM BANNER --- */}
        <div
          onClick={() => router.push("/offers")}
          className="mt-6 md:mt-10 cursor-pointer overflow-hidden rounded-[2.5rem] md:rounded-[3.5rem] bg-slate-900 relative group p-8 md:p-16"
        >
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="max-w-xl">
              <div className="flex items-center gap-3 text-white/50 mb-6">
                 <FaShieldAlt className="text-[#08B36A]" />
                 <span className="text-[10px] font-black uppercase tracking-[0.3em]">Official Warranty</span>
              </div>
              <h4 className="text-3xl md:text-6xl font-black text-white leading-none tracking-tighter">
                Precision Tech. <br />
                <span className="text-[#08B36A]">Lifetime Trust.</span>
              </h4>
              <p className="text-slate-400 text-sm md:text-lg mt-6 font-medium leading-relaxed">
                Up to 3 years of extended warranty on select digital monitors. <br className="hidden md:block"/>
                Limited time partnership offers available.
              </p>
            </div>
            
            <button className="bg-[#08B36A] text-white px-10 py-5 rounded-2xl font-black text-xs md:text-sm shadow-2xl shadow-[#08B36A]/20 group-hover:scale-105 transition-all active:scale-95 uppercase tracking-widest whitespace-nowrap">
                Claim Benefits
            </button>
          </div>

          {/* Decorative Circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#08B36A] rounded-full blur-[100px] opacity-10" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500 rounded-full blur-[100px] opacity-10" />
        </div>

      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
}