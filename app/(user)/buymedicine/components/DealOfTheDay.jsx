"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaStar, FaPlus, FaFire, FaClock } from 'react-icons/fa';

const DealOfTheDay = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const mockDeals = [
        {
            _id: 'd1',
            name: "BP Monitor Digital",
            brand: "HealthLine",
            mrp: 1999,
            bestPrice: 999,
            discount: 50,
            rating: 4.8,
            image: "https://images.unsplash.com/photo-1628595351029-c2bf17511435?q=80&w=400&auto=format&fit=crop"
        },
        {
            _id: 'd2',
            name: "Whey Protein 500g",
            brand: "MuscleBlaze",
            mrp: 1200,
            bestPrice: 799,
            discount: 33,
            rating: 4.9,
            image: "https://images.unsplash.com/photo-1628595351029-c2bf17511435?q=80&w=400&auto=format&fit=crop"
        },
        {
            _id: 'd3',
            name: "Heating Pad",
            brand: "Relief",
            mrp: 850,
            bestPrice: 425,
            discount: 50,
            rating: 4.6,
            image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=400&auto=format&fit=crop"
        },
        {
            _id: 'd4',
            name: "Omega 3 Capsules",
            brand: "TrueBasics",
            mrp: 999,
            bestPrice: 599,
            discount: 40,
            rating: 4.7,
            image: "https://images.unsplash.com/photo-1584017945366-b97b0e3b1bd0?q=80&w=400&auto=format&fit=crop"
        },
        {
            _id: 'd5',
            name: "Face Wash 100ml",
            brand: "CeraVe",
            mrp: 550,
            bestPrice: 399,
            discount: 27,
            rating: 4.5,
            image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=400&auto=format&fit=crop"
        }
    ];

    useEffect(() => {
        const fetchDeals = async () => {
            try {
                setLoading(true);
                // Simulated delay
                await new Promise(resolve => setTimeout(resolve, 600));
                setProducts(mockDeals);
            } catch (error) {
                console.error("Error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDeals();
    }, []);

    const handleProductClick = (id) => {
        router.push(`/buymedicine/singleproductdetail/${id}`);
    };

    if (loading) {
        return (
            <div className="bg-[#F8FAFC] py-8 flex justify-center items-center min-h-[200px]">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-500"></div>
            </div>
        );
    }

    return (
        <div className="bg-[#F8FAFC] py-10 px-4 font-['Plus_Jakarta_Sans']">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <span className="text-emerald-600 font-black uppercase tracking-[1px] text-[9px] flex items-center gap-1">
                           <FaFire className="text-orange-500" /> Limited Time
                        </span>
                        <h2 className="text-2xl font-black text-slate-900">Deal of the Day</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <FaClock className="text-slate-400 text-[10px]" />
                            <span className="text-slate-500 text-[10px] font-bold uppercase">Ends in 05:22:10</span>
                        </div>
                    </div>
                    <button className="text-emerald-600 font-black text-[10px] uppercase hover:underline">
                        View All
                    </button>
                </div>

                {/* Horizontal Scroll Section */}
                <div className="relative">
                    <div className="flex overflow-x-auto gap-4 pb-6 snap-x no-scrollbar custom-scrollbar">
                        {products.map((item) => (
                            <div
                                key={item._id}
                                onClick={() => handleProductClick(item._id)}
                                // Small Card Width: 190px on mobile, 210px on desktop
                                className="min-w-[190px] md:min-w-[210px] bg-white border border-slate-100 rounded-[20px] overflow-hidden group hover:shadow-lg transition-all duration-300 snap-start cursor-pointer"
                            >
                                {/* Image & Badges */}
                                <div className="relative aspect-square bg-slate-50 flex items-center justify-center overflow-hidden">
                                    <div className="absolute top-2 left-2 z-10">
                                        <span className="bg-white/90 backdrop-blur px-1.5 py-0.5 rounded-md text-[8px] font-black text-slate-900 flex items-center gap-0.5">
                                            <FaStar className="text-amber-400" size={8} /> {item.rating}
                                        </span>
                                    </div>

                                    {item.discount > 0 && (
                                        <div className="absolute top-2 right-2 z-10">
                                            <span className="bg-emerald-500 text-white px-1.5 py-0.5 rounded-md text-[8px] font-black">
                                                -{item.discount}%
                                            </span>
                                        </div>
                                    )}

                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>

                                {/* Content */}
                                <div className="p-3">
                                    <p className="text-[8px] font-black text-emerald-600 uppercase mb-0.5">{item.brand}</p>
                                    <h3 className="font-bold text-slate-900 text-[13px] leading-tight truncate">{item.name}</h3>
                                    
                                    <div className="flex items-center justify-between mt-3">
                                        <div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-sm font-black text-slate-900">₹{item.bestPrice}</span>
                                                <span className="text-[10px] text-slate-400 line-through">₹{item.mrp}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => e.stopPropagation()}
                                            className="w-7 h-7 bg-slate-900 text-white rounded-lg flex items-center justify-center hover:bg-emerald-600 transition-colors shadow-sm"
                                        >
                                            <FaPlus size={10} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style jsx>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                .custom-scrollbar::-webkit-scrollbar { height: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
            `}</style>
        </div>
    );
}

export default DealOfTheDay;