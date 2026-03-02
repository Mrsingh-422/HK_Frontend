import React, { useState } from "react";
import { FaArrowRight } from "react-icons/fa";

const products = [
    {
        id: 1,
        name: "Invokana 100mg Tablet",
        price: "₹545",
        image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80",
    },
    {
        id: 2,
        name: "Metformin 500mg ER",
        price: "₹120",
        image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=400&q=80",
    },
    {
        id: 3,
        name: "Atorvastatin 20mg",
        price: "₹850",
        image: "https://images.unsplash.com/photo-1550572017-ed20015948f4?auto=format&fit=crop&w=400&q=80",
    },
    {
        id: 4,
        name: "Telma 40mg Tablet",
        price: "₹210",
        image: "https://images.unsplash.com/photo-1614944034234-41da077af0d9?auto=format&fit=crop&w=400&q=80",
    },
    {
        id: 5,
        name: "Combiflam Plus",
        price: "₹45",
        image: "https://images.unsplash.com/photo-1583946099379-f9c9cb8bc030?auto=format&fit=crop&w=400&q=80",
    },
];

// Double the array for a seamless infinite loop
const displayProducts = [...products, ...products];

function BestSellings() {
    const [isPaused, setIsPaused] = useState(false);

    return (
        <div className="py-12 md:py-10 bg-white overflow-hidden font-sans">
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
                                    <span className="text-base sm:text-lg font-black text-slate-900">{prod.price}</span>
                                    <FaArrowRight className="text-slate-900 group-hover/price:translate-x-1 transition-transform" />
                                </div>

                                {/* Brand Color Button */}
                                <button className="w-full bg-[#08B36A] hover:bg-slate-900 text-white font-bold py-2 sm:py-3 rounded-lg transition-all shadow-md active:scale-95 text-xs sm:text-sm uppercase tracking-wider">
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