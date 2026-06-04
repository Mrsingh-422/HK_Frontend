"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaStar, FaPlus, FaLeaf, FaCheckCircle } from 'react-icons/fa';

const SkinCareProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const mockSkincare = [
        {
            _id: '1',
            name: "Vitamin C Glow Serum",
            brand: "Derma Skin",
            mrp: 899,
            bestPrice: 599,
            discount: 33,
            rating: 4.9,
            salt: "Ascorbic Acid + Ferulic",
            image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=500&auto=format&fit=crop"
        },
        {
            _id: '2',
            name: "Hyaluronic Acid Gel",
            brand: "Aqua Hydrate",
            mrp: 1200,
            bestPrice: 950,
            discount: 20,
            rating: 4.7,
            salt: "Pure Hyaluronic Complex",
            image: "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=500&auto=format&fit=crop"
        },
        {
            _id: '3',
            name: "Mineral Sunscreen SPF 50",
            brand: "Shield Tech",
            mrp: 650,
            bestPrice: 499,
            discount: 15,
            rating: 4.8,
            salt: "Zinc + Titanium Oxide",
            image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=500&auto=format&fit=crop"
        },
        {
            _id: '4',
            name: "Retinol Night Cream",
            brand: "Youth Revival",
            mrp: 1500,
            bestPrice: 1199,
            discount: 20,
            rating: 4.6,
            salt: "Retinol 0.5% + Peptides",
            image: "https://images.unsplash.com/photo-1631730432744-67295388e7c5?q=80&w=500&auto=format&fit=crop"
        },
        {
            _id: '5',
            name: "Gentle Foaming Cleanser",
            brand: "Pure Skin",
            mrp: 450,
            bestPrice: 399,
            discount: 10,
            rating: 4.5,
            salt: "Niacinamide + Ceramides",
            image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=500&auto=format&fit=crop"
        }
    ];

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                await new Promise(resolve => setTimeout(resolve, 800));
                setProducts(mockSkincare);
            } catch (error) {
                console.error("Error fetching skincare:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const handleProductClick = (id) => {
        router.push(`/skincare/product/${id}`);
    };

    if (loading) {
        return (
            <div className="bg-[#F8FAFC] py-12 px-4 flex justify-center items-center min-h-[300px]">
                <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-emerald-500"></div>
            </div>
        );
    }

    return (
        <div className="bg-[#F8FAFC] py-10 px-4 font-['Plus_Jakarta_Sans']">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <span className="text-emerald-600 font-black uppercase tracking-[2px] text-[9px]">Dermatology Recommended</span>
                        <h2 className="text-2xl font-black text-slate-900 mt-1">Skin Care Essentials</h2>
                    </div>
                    <button className="text-emerald-600 font-black text-[10px] uppercase tracking-wider hover:underline">
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
                                // Reduced widths: 220px on mobile, 240px on desktop
                                className="min-w-[210px] md:min-w-[230px] bg-white border border-slate-100 rounded-[20px] overflow-hidden group hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 snap-start cursor-pointer"
                            >
                                {/* Image & Badges */}
                                <div className="relative aspect-square bg-slate-50 flex items-center justify-center p-0 overflow-hidden">
                                    <div className="absolute top-2 left-2 z-10">
                                        <span className="bg-white/90 backdrop-blur shadow-sm px-2 py-0.5 rounded-md text-[8px] font-black text-slate-900 flex items-center gap-1">
                                            <FaStar className="text-amber-400" /> {item.rating}
                                        </span>
                                    </div>

                                    {item.discount > 0 && (
                                        <div className="absolute top-2 right-2 z-10">
                                            <span className="bg-emerald-500 text-white px-1.5 py-0.5 rounded-md text-[8px] font-black">
                                                {item.discount}% OFF
                                            </span>
                                        </div>
                                    )}

                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                </div>

                                {/* Content */}
                                <div className="p-4">
                                    <p className="text-[9px] font-black text-emerald-600 uppercase tracking-tight mb-0.5">{item.brand}</p>
                                    <h3 className="font-bold text-slate-900 text-sm leading-tight truncate">{item.name}</h3>
                                    <p className="text-[10px] text-slate-400 font-medium mb-2 truncate">{item.salt}</p>

                                    <div className="flex items-center gap-1.5 mb-3">
                                        <FaCheckCircle className="text-slate-300 text-[9px]" />
                                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Clinically Tested</span>
                                    </div>

                                    <div className="flex items-center justify-between border-t border-slate-50 pt-3">
                                        <div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-base font-black text-slate-900">₹{item.bestPrice}</span>
                                                {item.mrp > item.bestPrice && (
                                                    <span className="text-[10px] text-slate-400 line-through">₹{item.mrp}</span>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => e.stopPropagation()}
                                            className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center hover:bg-emerald-600 transition-colors shadow-md shadow-slate-200"
                                        >
                                            <FaPlus size={11} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {products.length === 0 && !loading && (
                    <div className="text-center py-16 bg-white rounded-[24px] border border-dashed border-slate-200">
                        <FaLeaf className="mx-auto text-slate-200 text-4xl mb-3" />
                        <p className="text-slate-400 text-sm font-bold">No products found.</p>
                    </div>
                )}
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

export default SkinCareProducts;