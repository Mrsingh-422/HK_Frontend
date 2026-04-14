"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { 
  FaStar, 
  FaLeaf, 
  FaShieldAlt, 
  FaArrowRight, 
  FaShoppingBasket 
} from "react-icons/fa";

const MEDICINES = [
  {
    id: 1,
    name: "Ashwagandha KSM-66",
    benefit: "Stress & Anxiety Relief",
    rating: 4.8,
    reviews: 1240,
    price: 499,
    mrp: 750,
    discount: "33% OFF",
    tag: "Best Seller",
    image: "https://images.unsplash.com/photo-1615485290382-441e4d0c9cb5?q=80&w=500&auto=format&fit=crop",
  },
  {
    id: 2,
    name: "Triphala Churna",
    benefit: "Digestive Wellness",
    rating: 4.9,
    reviews: 850,
    price: 249,
    mrp: 350,
    discount: "28% OFF",
    tag: "100% Organic",
    image: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?q=80&w=500&auto=format&fit=crop",
  },
  {
    id: 3,
    name: "Pure Shilajit Resin",
    benefit: "Strength & Vitality",
    rating: 4.7,
    reviews: 2100,
    price: 999,
    mrp: 1499,
    discount: "33% OFF",
    tag: "Premium",
    image: "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?q=80&w=500&auto=format&fit=crop",
  },
  {
    id: 4,
    name: "Brahmi Tablets",
    benefit: "Memory & Focus",
    rating: 4.6,
    reviews: 620,
    price: 399,
    mrp: 550,
    discount: "27% OFF",
    tag: "Top Rated",
    image: "https://images.unsplash.com/photo-1563483783225-bc53341aa103?q=80&w=500&auto=format&fit=crop",
  },
];

export default function Ayurveda() {
  const router = useRouter();

  return (
    <section className="py-16 bg-[#F9FBFA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-100 mb-4">
              <FaLeaf className="text-orange-600" size={12} />
              <span className="text-[11px] font-bold text-orange-700 uppercase tracking-widest">Ancient Wisdom</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              Ayurvedic <span className="text-emerald-700">Essentials</span>
            </h2>
            <p className="mt-3 text-slate-600 text-base md:text-lg">
              Pure, chemical-free supplements derived from 5,000 years of Ayurvedic tradition.
            </p>
          </div>
          
          <button 
            onClick={() => router.push("/ayurveda-store")}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-full border-2 border-emerald-700 text-emerald-700 font-bold text-sm hover:bg-emerald-700 hover:text-white transition-all group"
          >
            Explore Store <FaArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* --- PRODUCT GRID --- */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
          {MEDICINES.map((item) => (
            <div 
              key={item.id} 
              className="group bg-white rounded-3xl border border-slate-100 hover:border-emerald-200 hover:shadow-2xl hover:shadow-emerald-900/5 transition-all duration-300 flex flex-col overflow-hidden"
            >
              {/* Image Container */}
              <div className="relative aspect-square overflow-hidden bg-slate-100">
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <span className="bg-white/90 backdrop-blur-sm text-slate-900 text-[10px] font-black px-3 py-1 rounded-full shadow-sm uppercase">
                    {item.tag}
                  </span>
                </div>
                {/* Quick Add Mobile Button */}
                <button className="absolute bottom-3 right-3 p-3 bg-emerald-700 text-white rounded-2xl shadow-lg md:hidden">
                    <FaShoppingBasket size={14} />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 md:p-6 flex flex-col flex-grow">
                <div className="flex items-center gap-1 mb-2">
                    <FaStar className="text-yellow-400" size={12} />
                    <span className="text-xs font-bold text-slate-700">{item.rating}</span>
                    <span className="text-[10px] text-slate-400">({item.reviews})</span>
                </div>

                <h3 className="text-base md:text-lg font-bold text-slate-900 leading-tight mb-1 group-hover:text-emerald-700 transition-colors">
                    {item.name}
                </h3>
                <p className="text-xs text-slate-500 font-medium mb-4">
                    {item.benefit}
                </p>

                <div className="mt-auto">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-lg font-black text-slate-900">₹{item.price}</span>
                        <span className="text-xs text-slate-400 line-through">₹{item.mrp}</span>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                            {item.discount}
                        </span>
                    </div>

                    <button className="hidden md:flex w-full items-center justify-center gap-2 bg-slate-900 text-white py-3 rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors cursor-pointer active:scale-95">
                        <FaShoppingBasket size={14} /> ADD TO CART
                    </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* --- TRUST BAR --- */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-t border-slate-200">
            <div className="flex flex-col items-center text-center gap-2">
                <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-700">
                    <FaShieldAlt size={20} />
                </div>
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-900">GMP Certified</h4>
                <p className="text-[10px] text-slate-500">Highest Quality Standards</p>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
                <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-700">
                    <FaLeaf size={20} />
                </div>
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-900">100% Herbal</h4>
                <p className="text-[10px] text-slate-500">No Synthetic Chemicals</p>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
                <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-700">
                    <FaStar size={20} />
                </div>
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-900">Lab Tested</h4>
                <p className="text-[10px] text-slate-500">Purity Guaranteed</p>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
                <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-700">
                    <FaShoppingBasket size={20} />
                </div>
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-900">Direct From Source</h4>
                <p className="text-[10px] text-slate-500">Authentic Ingredients</p>
            </div>
        </div>

      </div>
    </section>
  );
}