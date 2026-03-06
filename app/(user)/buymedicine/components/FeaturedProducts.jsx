import React, { useState } from "react";
import { FaArrowRight, FaArrowLeft } from "react-icons/fa";
import { INITIAL_MEDICINES } from "@/app/constants/constants";
import MedicineDetailsModal from "./otherComponents/MedicineDetailsModal";

// Double the list for infinite marquee effect
const displayProducts = [...INITIAL_MEDICINES, ...INITIAL_MEDICINES];

function FeaturedProducts() {
    const [isPaused, setIsPaused] = useState(false);
    // MODAL STATES
    const [selectedMedicine, setSelectedMedicine] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleBuyClick = (med) => {
        setSelectedMedicine(med);
        setIsModalOpen(true);
    };

    const handleAddToCart = (med) => {
        // Here you would typically dispatch to Redux or update a Context
        alert(`${med.name} added to cart!`);
    };

    return (
        <div className="py-12 md:py-12 bg-white overflow-hidden">
            <MedicineDetailsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                medicine={selectedMedicine}
                onAddToCart={handleAddToCart}
            />
            {/* Header Section */}
            <div className="max-w-7xl mx-auto px-4 text-center mb-10 md:mb-16">
                <div className="flex items-center justify-center gap-4 mb-2">
                    <FaArrowLeft className="text-emerald-500 cursor-pointer hover:scale-110 transition-transform" />
                    <span className="text-emerald-500 font-bold text-lg md:text-xl tracking-wide uppercase">
                        Medicines
                    </span>
                    <FaArrowRight className="text-emerald-500 cursor-pointer hover:scale-110 transition-transform" />
                </div>
                <h2 className="text-3xl md:text-6xl font-black text-slate-800 tracking-tight">
                    Featured Products
                </h2>
            </div>

            {/* Continuous Marquee Wrapper */}
            <div
                className="relative w-full cursor-pointer touch-pan-y"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                onTouchStart={() => setIsPaused(true)}
                onTouchEnd={() => setIsPaused(false)}
            >
                <div
                    className="flex gap-4 md:gap-8 animate-featured-marquee"
                    style={{
                        animationPlayState: isPaused ? 'paused' : 'running',
                        width: 'max-content'
                    }}
                >
                    {displayProducts.map((prod, index) => (
                        <div
                            key={`${prod.id}-${index}`}
                            className="w-[240px] sm:w-[280px] md:w-[320px] flex-shrink-0 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
                        >
                            {/* Product Image Section */}
                            <div className="h-40 sm:h-48 md:h-56 bg-slate-50 flex items-center justify-center p-6">
                                <img
                                    src={prod.image}
                                    alt={prod.name}
                                    className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 hover:scale-110"
                                />
                            </div>

                            {/* Product Info Section */}
                            <div className="p-4 sm:p-6 text-center">
                                <h3 className="text-sm sm:text-base md:text-lg font-extrabold text-[#10b981] mb-6 min-h-[50px] leading-tight">
                                    {prod.name}
                                </h3>

                                {/* Signature Yellow Price Bar */}
                                <div className="bg-[#fde047] hover:bg-[#facc15] transition-colors py-2.5 sm:py-3 px-6 rounded-lg flex items-center justify-between mb-4 group/price cursor-pointer">
                                    <span className="text-base sm:text-lg font-black text-slate-900">{prod.actualPrice}</span>
                                    <FaArrowRight className="text-slate-900 group-hover/price:translate-x-1 transition-transform" />
                                </div>

                                {/* Action Button */}
                                <button
                                    onClick={() => handleBuyClick(prod)}
                                    className="w-full bg-[#10b981] hover:bg-slate-900 text-white font-bold py-2 sm:py-3 rounded-lg transition-all shadow-md active:scale-95 text-xs sm:text-sm uppercase tracking-wider">
                                    Order Now
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Optimized CSS Keyframes */}
            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes featured-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-featured-marquee {
          animation: featured-marquee 25s linear infinite;
        }
        /* Slightly faster movement for mobile screens */
        @media (max-width: 768px) {
          .animate-featured-marquee {
            animation: featured-marquee 18s linear infinite;
          }
        }
      `}} />
        </div>
    );
}

export default FeaturedProducts;