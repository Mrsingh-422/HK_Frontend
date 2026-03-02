import React, { useState, useEffect } from "react";
import { FaQuoteLeft, FaQuoteRight } from "react-icons/fa";

function DeclareThePast() {
  const [currentImg, setCurrentImg] = useState(0);

  const images = [
    "./buymed/dec1.png",
    "./buymed/dec2.jpg",
  ];

  // Carousel Logic (2.5 seconds as requested)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImg((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }, 2500);
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <section className="py-12 md:py-14 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* LEFT SECTION: IMAGE CAROUSEL */}
          <div className="relative order-1 lg:order-1">
            {/* Background Decoration */}
            <div className="absolute -inset-4 bg-emerald-50 rounded-[2.5rem] rotate-2 hidden lg:block"></div>
            
            <div className="relative h-[300px] sm:h-[400px] md:h-[500px] w-full rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white">
              {images.map((img, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                    index === currentImg ? "opacity-100 z-10" : "opacity-0 z-0"
                  }`}
                >
                  <img
                    src={img}
                    alt="Pharmacy and Medicines"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              
              {/* Floating Trust Badge */}
              <div className="absolute top-6 left-6 z-20 bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-lg flex items-center gap-3 border border-emerald-50">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 font-bold">
                   🧪
                </div>
                <div>
                  <p className="text-[10px] uppercase font-black text-slate-400 leading-none">Pharmacy</p>
                  <p className="text-sm font-bold text-slate-800">Verified Stocks</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SECTION: QUOTE & CONTENT */}
          <div className="space-y-8 order-2 lg:order-2">
            <div className="relative">
              {/* Stylized Quote Marks */}
              <FaQuoteLeft className="text-4xl md:text-6xl text-emerald-100 absolute -top-8 -left-6 md:-top-10 md:-left-10 -z-10" />
              
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.1] tracking-tight">
                Declare the past, diagnose the <br className="hidden md:block" />
                <span className="text-emerald-600 underline decoration-emerald-100 underline-offset-8">present</span>, foretell the future.
              </h2>
            </div>

            <p className="text-slate-600 text-base md:text-xl leading-relaxed max-w-xl italic border-l-4 border-emerald-500 pl-6 py-2">
              "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Suscipit voluptate nam accusamus aliquid unde aut itaque totam blanditi."
            </p>

            <div className="space-y-6 pt-4">
              <p className="text-emerald-600 font-bold tracking-widest uppercase text-sm flex items-center gap-3">
                Take Care Also 
                <span className="h-px w-20 bg-emerald-200"></span>
              </p>

              <button className="inline-block border-2 border-emerald-500 text-emerald-600 font-black px-8 py-4 rounded-xl hover:bg-emerald-600 hover:text-white transition-all duration-300 shadow-lg shadow-emerald-50 active:scale-95 uppercase tracking-wider text-sm">
                Buy Online Medicine
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default DeclareThePast;