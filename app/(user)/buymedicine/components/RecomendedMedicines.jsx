import React, { useState, useEffect } from "react";
import { FaCheckCircle, FaArrowRight } from "react-icons/fa";

function RecomendedMedicines() {
  const [currentImg, setCurrentImg] = useState(0);

  const carouselImages = [
    "./buymed/recmed1.png",
    "./buymed/recmed2.jpg",
  ];

  // Carousel Logic (3 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImg((prev) => (prev === carouselImages.length - 1 ? 0 : prev + 1));
    }, 3000);
    return () => clearInterval(timer);
  }, [carouselImages.length]);

  return (
    <section className="py-12 md:py-24 bg-white overflow-hidden font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* LEFT SECTION: IMAGE CAROUSEL */}
          <div className="relative group">
            {/* Decorative background accent */}
            <div className="absolute -inset-4 bg-slate-50 rounded-[2.5rem] -rotate-2 hidden lg:block"></div>
            
            <div className="relative h-[300px] sm:h-[450px] md:h-[550px] w-full rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-100">
              {carouselImages.map((img, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                    index === currentImg ? "opacity-100 z-10 scale-100" : "opacity-0 z-0 scale-105"
                  }`}
                >
                  <img
                    src={img}
                    alt="Recommended Medicine"
                    className="w-full h-full object-cover transition-transform duration-[3000ms]"
                    style={{ transform: index === currentImg ? 'scale(1)' : 'scale(1.1)' }}
                  />
                </div>
              ))}

              {/* Progress Indicators (Dots) */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                {carouselImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImg(idx)}
                    className={`h-1.5 transition-all duration-300 rounded-full ${
                      idx === currentImg ? "w-10 bg-white" : "w-3 bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT SECTION: CONTENT */}
          <div className="space-y-6 md:space-y-8">
            <div className="space-y-4">
              <h4 className="text-[#08B36A] font-black uppercase tracking-[0.2em] text-xs md:text-sm">
                Recommended Medicines
              </h4>
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.1] tracking-tight">
                Medicines Sponsor <br />
                By <span className="text-[#08B36A]">Doctors!</span>
              </h2>
            </div>

            <p className="text-slate-600 text-base md:text-xl leading-relaxed max-w-xl">
              Lorem ipsum dolor sit, amet consectetur adipisicing elit. Explicabo 
              expedita dolore esse ipsam nobis debitis hic. Quality medication trusted 
              by leading medical professionals.
            </p>

            <div className="flex items-center gap-3 text-[#08B36A] font-bold text-lg md:text-2xl pt-2">
              <FaCheckCircle className="flex-shrink-0 animate-pulse" />
              <span>Available Antibiotics Medicines</span>
            </div>

            <div className="pt-6">
              <button className="group relative border-2 border-[#08B36A] text-[#08B36A] font-black px-10 py-4 rounded-xl hover:bg-[#08B36A] hover:text-white transition-all duration-300 active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest text-sm shadow-lg shadow-[#08B36A]/10">
                Buy Now
                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default RecomendedMedicines;