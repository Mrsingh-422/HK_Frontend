"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { FaPlus, FaChevronRight, FaStar, FaRegHeart } from "react-icons/fa";

const PERSONAL_CARE = [
  {
    id: 101,
    name: "Cetaphil Gentle Cleanser",
    brand: "Cetaphil",
    price: 545,
    mrp: 599,
    discount: "9% OFF",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: 102,
    name: "Nivea Soft Moisturizer",
    brand: "Nivea",
    price: 240,
    mrp: 299,
    discount: "20% OFF",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: 103,
    name: "Onion Hair Oil - 200ml",
    brand: "Mamaearth",
    price: 380,
    mrp: 419,
    discount: "10% OFF",
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1631730359585-38a4935cbb6b?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: 104,
    name: "Ultra Sheer Sunscreen",
    brand: "Neutrogena",
    price: 650,
    mrp: 750,
    discount: "13% OFF",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: 105,
    name: "Charcoal Face Wash",
    brand: "Beardo",
    price: 199,
    mrp: 250,
    discount: "20% OFF",
    rating: 4.4,
    image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: 106,
    name: "Charcoal Face Wash",
    brand: "Beardo",
    price: 199,
    mrp: 250,
    discount: "20% OFF",
    rating: 4.4,
    image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: 107,
    name: "Charcoal Face Wash",
    brand: "Beardo",
    price: 199,
    mrp: 250,
    discount: "20% OFF",
    rating: 4.4,
    image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=400&auto=format&fit=crop",
  },
];

export default function PersonalCare() {
  const router = useRouter();

  return (
    <section className="py-6 md:py-10 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 md:px-6">

        {/* --- SECTION HEADER --- */}
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-6 md:w-8 h-[2px] bg-[#08B36A]"></span>
              <span className="text-[#08B36A] text-[9px] md:text-[10px] font-black uppercase tracking-widest">Self Care</span>
            </div>
            <h2 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight">Personal Care</h2>
            <p className="hidden md:block text-sm text-slate-500 font-medium">Beauty and hygiene essentials curated for you</p>
          </div>

          <button
            onClick={() => router.push("/buymedicine/seeallmed")}
            className="group flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs font-black text-[#08B36A] hover:bg-[#08B36A] hover:text-white border border-[#08B36A] px-3 py-1.5 md:px-5 md:py-2.5 rounded-full transition-all whitespace-nowrap"
          >
            VIEW ALL <FaChevronRight size={10} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* --- SINGLE LINE HORIZONTAL SCROLL --- */}
        <div className="flex flex-nowrap overflow-x-auto gap-3 md:gap-5 pb-6 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide snap-x snap-mandatory">
          {PERSONAL_CARE.map((item) => (
            <div
              key={item.id}
              className="flex-shrink-0 w-[165px] md:w-[230px] snap-start group bg-white border border-slate-100 rounded-2xl p-2.5 md:p-4 flex flex-col transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:border-[#08B36A]/30"
            >
              {/* Image & Badges */}
              <div className="relative aspect-square rounded-xl bg-slate-50 overflow-hidden mb-3">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* Wishlist */}
                <button className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-sm rounded-full text-slate-300 hover:text-red-500 transition-colors shadow-sm">
                  <FaRegHeart size={12} className="md:size-[14px]" />
                </button>

                {/* Discount Tag */}
                <div className="absolute top-2 left-0">
                  <span className="bg-[#08B36A] text-white text-[8px] md:text-[10px] font-black px-2 py-1 rounded-r-lg shadow-md uppercase tracking-tighter">
                    {item.discount}
                  </span>
                </div>
              </div>

              {/* Product Info */}
              <div className="flex flex-col flex-grow">
                <div className="flex items-center gap-1 mb-1">
                  <FaStar className="text-amber-400" size={10} />
                  <span className="text-[9px] md:text-[11px] font-bold text-slate-500">{item.rating}</span>
                </div>

                <h3 className="text-[11px] md:text-sm font-extrabold text-slate-800 line-clamp-2 h-8 md:h-10 mb-1 leading-snug group-hover:text-[#08B36A] transition-colors">
                  {item.name}
                </h3>
                <p className="text-[8px] md:text-[10px] text-slate-400 font-black uppercase tracking-widest mb-3">
                  {item.brand}
                </p>

                {/* Price & Add Button */}
                <div className="mt-auto flex items-center justify-between pt-2 border-t border-slate-50">
                  <div className="flex flex-col">
                    <span className="text-[9px] md:text-[11px] text-slate-400 line-through font-medium">₹{item.mrp}</span>
                    <span className="text-sm md:text-lg font-black text-slate-900">₹{item.price}</span>
                  </div>

                  <button
                    onClick={() => router.push(`/product/${item.id}`)}
                    className="h-8 w-8 md:h-10 md:w-10 flex items-center justify-center rounded-xl bg-slate-50 text-[#08B36A] border border-slate-100 hover:bg-[#08B36A] hover:text-white hover:shadow-lg hover:shadow-[#08B36A]/30 transition-all active:scale-90"
                  >
                    <FaPlus size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* --- THEMED PROMO BANNER --- */}
        <div
          onClick={() => router.push("/offers")}
          className="mt-4 md:mt-8 cursor-pointer overflow-hidden rounded-[1.5rem] md:rounded-[2.5rem] bg-[#08B36A] relative group"
        >
          <div className="relative z-10 p-6 md:p-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-md">
              <span className="bg-white/20 text-white text-[9px] md:text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-[0.2em]">Limited Offer</span>
              <h4 className="text-xl md:text-4xl font-black text-white mt-3 md:mt-4 leading-tight">Glow Up This Season!</h4>
              <p className="text-white/80 text-xs md:text-base mt-2 md:mt-3 font-medium opacity-90">Flat 25% off on all luxury personal care brands. Offer valid till Sunday.</p>
            </div>
            <button className="bg-white text-[#08B36A] px-6 md:px-10 py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-[11px] md:text-sm shadow-2xl shadow-black/10 group-hover:scale-105 transition-transform active:scale-95 uppercase tracking-widest">
              SHOP THE SALE
            </button>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-[-20%] right-[-10%] w-48 md:w-80 h-48 md:h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-[-30%] left-[-10%] w-32 md:w-60 h-32 md:h-60 bg-black/10 rounded-full blur-2xl pointer-events-none" />
        </div>

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
    </section>
  );
}