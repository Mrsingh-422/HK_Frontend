import React, { useState } from "react";
import { FaArrowRight } from "react-icons/fa";
import { INITIAL_MEDICINES } from "@/app/constants/constants";
import MedicineDetailsModal from "./otherComponents/MedicineDetailsModal";


// Double the array for a seamless infinite loop
const displayProducts = [...INITIAL_MEDICINES, ...INITIAL_MEDICINES];

function BestSellings() {
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
        <div className="py-12 md:py-10 bg-[#f8fafc] overflow-hidden font-sans">
            <MedicineDetailsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                medicine={selectedMedicine}
                onAddToCart={handleAddToCart}
            />
            {/* Centered Heading */}
            <div className="max-w-7xl mx-auto px-4 mb-10 md:mb-16 text-center">
                <h2 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tight">
                    Best Sellings
                </h2>
            </div>

            {/* Marquee Container */}
            <div
                className="relative w-full cursor-pointer touch-pan-y"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                onTouchStart={() => setIsPaused(true)}
                onTouchEnd={() => setIsPaused(false)}
            >
                <div
                    className="flex gap-4 md:gap-8 animate-bestsell-marquee"
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
                            {/* Product Image */}
                            <div className="h-40 sm:h-48 md:h-56 bg-slate-50 flex items-center justify-center p-6">
                                <img
                                    src={prod.image}
                                    alt={prod.name}
                                    className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 hover:scale-110"
                                />
                            </div>

                            {/* Product Content */}
                            <div className="p-4 sm:p-6 text-center">
                                <h3 className="text-sm sm:text-base md:text-lg font-extrabold text-[#08B36A] mb-6 min-h-[50px] leading-tight">
                                    {prod.name}
                                </h3>

                                {/* Yellow Price Bar with Arrow */}
                                <div className="bg-[#fde047] hover:bg-[#facc15] transition-colors py-2.5 sm:py-3 px-6 rounded-lg flex items-center justify-between mb-4 group/price cursor-pointer shadow-sm">
                                    <span className="text-base sm:text-lg font-black text-slate-900">{prod.actualPrice}</span>
                                    <FaArrowRight className="text-slate-900 group-hover/price:translate-x-1 transition-transform" />
                                </div>

                                {/* Brand Color Button */}
                                <button
                                    onClick={() => handleBuyClick(prod)}
                                    className="w-full bg-[#08B36A] hover:bg-slate-900 text-white font-bold py-2 sm:py-3 rounded-lg transition-all shadow-md active:scale-95 text-xs sm:text-sm uppercase tracking-wider">
                                    Order Now
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Global CSS for seamless marquee */}
            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes bestsell-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-bestsell-marquee {
          animation: bestsell-marquee 25s linear infinite;
        }
        @media (max-width: 768px) {
          .animate-bestsell-marquee {
            animation: bestsell-marquee 18s linear infinite;
          }
        }
      `}} />
        </div>
    );
}

export default BestSellings;