"use client";

import React, { useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  FaChevronRight, 
  FaChevronLeft, 
  FaStar, 
  FaHeart, 
  FaPlus,
  FaCheckCircle,
  FaTruck,
  FaLock
} from "react-icons/fa"; 

const MEDICINES = [
    {
        id: 1,
        name: "Dolo 650 Tablet",
        brand: "Micro Labs Ltd",
        price: 30,
        mrp: 35,
        discount: "15% OFF",
        rating: 4.8,
        reviews: "2.1k",
        image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=400&auto=format&fit=crop",
    },
    {
        id: 2,
        name: "Revital H Capsule",
        brand: "Sun Pharma",
        price: 280,
        mrp: 310,
        discount: "10% OFF",
        rating: 4.5,
        reviews: "850",
        image: "https://images.unsplash.com/photo-1626716493137-b67fe9501e76?q=80&w=400&auto=format&fit=crop",
    },
    {
        id: 3,
        name: "Evion 400mg Capsule",
        brand: "P&G Health",
        price: 150,
        mrp: 175,
        discount: "14% OFF",
        rating: 4.7,
        reviews: "1.2k",
        image: "https://images.unsplash.com/photo-1471864190281-ad599f5732a0?q=80&w=400&auto=format&fit=crop",
    },
    {
        id: 4,
        name: "Vicks Vaporub",
        brand: "Procter & Gamble",
        price: 95,
        mrp: 105,
        discount: "9% OFF",
        rating: 4.9,
        reviews: "3k+",
        image: "https://images.unsplash.com/photo-1550573105-4584e7d7a631?q=80&w=400&auto=format&fit=crop",
    },
    {
        id: 6,
        name: "Shelcal 500 Tablet",
        brand: "Torrent Pharma",
        price: 110,
        mrp: 130,
        discount: "15% OFF",
        rating: 4.6,
        reviews: "500",
        image: "https://images.unsplash.com/photo-1587854692152-cbe660dbbb88?q=80&w=400&auto=format&fit=crop",
    },
    {
        id: 7,
        name: "Combiflam Tablet",
        brand: "Sanofi India",
        price: 45,
        mrp: 52,
        discount: "12% OFF",
        rating: 4.7,
        reviews: "1.8k",
        image: "https://images.unsplash.com/photo-1576073719710-aa6e66ef97d0?q=80&w=400&auto=format&fit=crop",
    },
];

export default function MedicineComponent() {
    const router = useRouter();
    const scrollRef = useRef(null);

    const scroll = (direction) => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollTo = direction === "left" ? scrollLeft - clientWidth : scrollLeft + clientWidth;
            scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
        }
    };

    return (
        <section className="py-16 bg-[#F8FAFC]">
            <div className="max-w-7xl mx-auto px-4 md:px-6">

                {/* --- HEADER --- */}
                <div className="flex items-end justify-between mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                             <span className="h-1 w-8 bg-[#08B36A] rounded-full"></span>
                             <span className="text-[10px] font-bold text-[#08B36A] uppercase tracking-[2px]">Trusted Pharmacy</span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                            Featured Medicines
                        </h2>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex gap-2">
                            <button onClick={() => scroll('left')} className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-slate-600 cursor-pointer shadow-sm">
                                <FaChevronLeft size={14}/>
                            </button>
                            <button onClick={() => scroll('right')} className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-slate-600 cursor-pointer shadow-sm">
                                <FaChevronRight size={14}/>
                            </button>
                        </div>
                        <button 
                            onClick={() => router.push("/seeallmed")}
                            className="text-xs font-bold text-white bg-slate-900 px-5 py-2.5 rounded-xl hover:bg-[#08B36A] transition-all cursor-pointer shadow-lg shadow-slate-200"
                        >
                            VIEW ALL
                        </button>
                    </div>
                </div>

                {/* --- HORIZONTAL SCROLL --- */}
                <div 
                    ref={scrollRef}
                    className="flex flex-nowrap overflow-x-auto gap-5 pb-8 scrollbar-hide snap-x snap-mandatory pt-2"
                >
                    {MEDICINES.map((med) => (
                        <div
                            key={med.id}
                            className="flex-shrink-0 w-[200px] md:w-[240px] snap-start group bg-white border border-slate-100 rounded-[24px] p-4 flex flex-col transition-all duration-300 hover:shadow-2xl hover:shadow-slate-200 hover:-translate-y-1 relative"
                        >
                            {/* Actions Overlay */}
                            <button className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-white/80 backdrop-blur-md border border-slate-100 text-slate-300 hover:text-red-500 rounded-full transition-colors shadow-sm">
                                <FaHeart size={14} />
                            </button>

                            {/* Discount Badge */}
                            <div className="absolute top-4 left-4 z-10">
                                <span className="bg-[#08B36A] text-white text-[10px] font-black px-2.5 py-1 rounded-lg shadow-md shadow-emerald-500/20 uppercase">
                                    {med.discount}
                                </span>
                            </div>

                            {/* Image Section */}
                            <div className="relative mb-4 aspect-square rounded-2xl bg-[#F1F5F9] overflow-hidden">
                                <img
                                    src={med.image}
                                    alt={med.name}
                                    className="w-full h-full object-cover mix-blend-multiply transition-transform duration-700 group-hover:scale-110"
                                />
                            </div>

                            {/* Info Section */}
                            <div className="flex flex-col flex-grow">
                                <div className="flex items-center gap-1.5 mb-2">
                                    <div className="flex items-center bg-amber-50 px-2 py-0.5 rounded-md text-amber-600 gap-1 border border-amber-100">
                                        <FaStar size={10} />
                                        <span className="text-[11px] font-bold">{med.rating}</span>
                                    </div>
                                    <span className="text-[11px] text-slate-400 font-medium">{med.reviews} reviews</span>
                                </div>

                                <h3 className="text-sm md:text-base font-bold text-slate-900 line-clamp-1 mb-0.5">
                                    {med.name}
                                </h3>
                                <p className="text-[11px] text-slate-500 font-semibold mb-4">
                                    By {med.brand}
                                </p>

                                {/* Pricing & Add Button */}
                                <div className="mt-auto flex items-center justify-between gap-2">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-slate-400 line-through font-medium">₹{med.mrp}</span>
                                        <span className="text-lg font-black text-slate-900">₹{med.price}</span>
                                    </div>

                                    <button className="flex items-center gap-2 bg-[#08B36A] text-white px-4 py-2.5 rounded-xl text-xs font-black hover:bg-slate-900 transition-all active:scale-90 shadow-lg shadow-emerald-500/20 cursor-pointer">
                                        <FaPlus size={10} /> ADD
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* --- TRUST BAR --- */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <TrustItem 
                        icon={<FaCheckCircle className="text-emerald-600" size={20}/>} 
                        title="100% Authentic" 
                        desc="Products sourced directly" 
                    />
                    <TrustItem 
                        icon={<FaTruck className="text-emerald-600" size={20}/>} 
                        title="Express Delivery" 
                        desc="Safe & on-time home delivery" 
                    />
                    <TrustItem 
                        icon={<FaLock className="text-emerald-600" size={20}/>} 
                        title="Secure Checkout" 
                        desc="Encrypted payment processing" 
                    />
                </div>

                <style jsx>{`
                    .scrollbar-hide::-webkit-scrollbar { display: none; }
                    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
                `}</style>
            </div>
        </section>
    );
}

function TrustItem({ icon, title, desc }) {
    return (
        <div className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                {icon}
            </div>
            <div>
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">{title}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
            </div>
        </div>
    );
}