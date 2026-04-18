"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
    FaStar,
    FaClock,
    FaEye,
    FaArrowRight,
    FaLeaf
} from "react-icons/fa";

const NEW_ARRIVALS = [
    {
        id: 101,
        name: "Brahmi Vati (Gold Edition)",
        benefit: "Memory & Cognitive Support",
        rating: 5.0,
        reviews: 84,
        price: 899,
        mrp: 1200,
        discount: "25% OFF",
        tag: "New Launch",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQvGcegvM-XqKb10DG0G2ryNycbr4GNL0ZAZA&s",
    },
    {
        id: 102,
        name: "Ayurvedic Sleep Drops",
        benefit: "Deep Rest & Relaxation",
        rating: 4.9,
        reviews: 156,
        price: 549,
        mrp: 799,
        discount: "31% OFF",
        tag: "Fresh Stock",
        image: "https://images.unsplash.com/photo-1628771065518-0d82f1938462?q=80&w=500&auto=format&fit=crop",
    },
    {
        id: 103,
        name: "Amrit Kalash Nectar",
        benefit: "Immunity Booster",
        rating: 4.8,
        reviews: 92,
        price: 1499,
        mrp: 1999,
        discount: "25% OFF",
        tag: "Limited",
        image: "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?q=80&w=500&auto=format&fit=crop",
    },
    {
        id: 104,
        name: "Turmeric Curcumin Plus",
        benefit: "Joint & Skin Health",
        rating: 4.7,
        reviews: 210,
        price: 450,
        mrp: 650,
        discount: "30% OFF",
        tag: "Pure",
        image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=500&auto=format&fit=crop",
    },
];

export default function NewArrivals() {
    const router = useRouter();

    return (
        <section className="py-6 pt-16 bg-[#F8FAFC]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">

                {/* --- HEADER --- */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 mb-4">
                            <FaClock className="text-blue-600" size={12} />
                            <span className="text-[11px] font-bold text-blue-700 uppercase tracking-widest">Just Landed</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                            Fresh <span className="text-emerald-700">New Arrivals</span>
                        </h2>
                        <p className="mt-3 text-slate-600 text-base md:text-lg">
                            Explore our latest additions to the Ayurvedic pharmacy, formulated with freshly harvested herbs.
                        </p>
                    </div>

                    <button
                        onClick={() => router.push("/buymedicine/seeallmed")}
                        className="flex items-center justify-center gap-2 px-6 py-3 rounded-full border-2 border-slate-900 text-slate-900 font-bold text-sm hover:bg-slate-900 hover:text-white transition-all group"
                    >
                        View All Collection <FaArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                {/* --- PRODUCT GRID --- */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
                    {NEW_ARRIVALS.map((item) => (
                        <div
                            key={item.id}
                            className="group bg-white rounded-3xl border border-slate-100 hover:border-emerald-200 hover:shadow-2xl hover:shadow-emerald-900/5 transition-all duration-300 flex flex-col overflow-hidden"
                        >
                            {/* Image Container */}
                            <div className="relative aspect-square overflow-hidden bg-slate-50">
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute top-3 left-3">
                                    <span className="bg-emerald-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-sm uppercase">
                                        {item.tag}
                                    </span>
                                </div>
                                {/* Mobile Quick Action */}
                                <button className="absolute bottom-3 right-3 p-3 bg-white text-emerald-700 rounded-2xl shadow-lg md:hidden border border-slate-100">
                                    <FaEye size={14} />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-4 md:p-6 flex flex-col flex-grow">
                                <div className="flex items-center gap-1 mb-2">
                                    <FaStar className="text-yellow-400" size={12} />
                                    <span className="text-xs font-bold text-slate-700">{item.rating}</span>
                                    <span className="text-[10px] text-slate-400 font-medium">({item.reviews})</span>
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

                                    <button
                                        onClick={() => router.push(`/product/${item.id}`)}
                                        className="hidden md:flex w-full items-center justify-center gap-2 bg-emerald-700 border border-slate-200 text-white py-3 rounded-xl text-xs font-bold hover:bg-slate-50 hover:text-black hover:border-emerald-700 transition-all cursor-pointer active:scale-95"
                                    >
                                        <FaEye size={14} /> VIEW DETAILS
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* --- SMALL INFO BAR --- */}
                <div className="mt-12 flex flex-wrap justify-center gap-8 text-slate-400">
                    <div className="flex items-center gap-2">
                        <FaLeaf size={14} className="text-emerald-500" />
                        <span className="text-[11px] font-bold uppercase tracking-wider">Sustainably Sourced</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <FaLeaf size={14} className="text-emerald-500" />
                        <span className="text-[11px] font-bold uppercase tracking-wider">Small Batch Production</span>
                    </div>
                </div>

            </div>
        </section>
    );
}