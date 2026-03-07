import React, { useState, useEffect } from "react";

function AboutUsMed() {
  const [currentImg, setCurrentImg] = useState(0);

  const carouselImages = [
    "./buymed/about1.png",
    "./buymed/about2.jpg",
  ];

  const stats = [
    { name: "Costing", percentage: 25 },
    { name: "Verifying Products", percentage: 65 },
    { name: "Advanced Biotics", percentage: 85 },
    { name: "Recommended Medicose", percentage: 90 },
  ];

  // Carousel Logic (3 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImg((prev) => (prev === carouselImages.length - 1 ? 0 : prev + 1));
    }, 3000);
    return () => clearInterval(timer);
  }, [carouselImages.length]);

  return (
    <section className="py-16 md:py-24 bg-[#f8fafc] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* LEFT SECTION: CONTENT & SKILLS */}
          <div className="space-y-8 order-2 lg:order-1">
            <div className="space-y-4">
              <h4 className="text-[#08B36A] font-bold uppercase tracking-wider text-sm">
                About Us Medicines
              </h4>
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 leading-[1.2]">
                The Medicines Give A <br className="hidden md:block" />
                <span className="text-[#08B36A]">Second Life!</span>
              </h2>
              <p className="text-slate-600 leading-relaxed text-base md:text-lg max-w-xl">
                Lorem ipsum, dolor sit amet consectetur adipisicing elit. Velit ad 
                doloribus ipsa cupiditate porro eveniet vitae dicta a sunt. Beatae 
                pariatur, minus accusantium voluptas vitae eos quaerat?
              </p>
            </div>

            {/* Progress Bars */}
            <div className="space-y-8 pt-2">
              {stats.map((item, index) => (
                <div key={index} className="space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="text-[#08B36A] font-bold text-sm md:text-base">
                      {item.name}
                    </span>
                    <span className="text-slate-900 font-black text-sm">
                      {item.percentage}%
                    </span>
                  </div>
                  
                  {/* Track */}
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    {/* Fill */}
                    <div 
                      className="h-full bg-[#08B36A] rounded-full transition-all duration-1000 ease-out relative"
                      style={{ width: `${item.percentage}%` }}
                    >
                      {/* Subtle stripe pattern overlay */}
                      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(45deg,rgba(255,255,255,.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,.2)_50%,rgba(255,255,255,.2)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem]"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT SECTION: IMAGE CAROUSEL */}
          <div className="relative order-1 lg:order-2">
            {/* Background Accent Frame */}
            <div className="absolute -inset-4 bg-slate-50 rounded-[2.5rem] rotate-2 hidden lg:block"></div>
            
            <div className="relative h-[300px] sm:h-[450px] md:h-[550px] w-full rounded-2xl overflow-hidden shadow-2xl bg-slate-200">
              {carouselImages.map((img, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                    index === currentImg ? "opacity-100 z-10" : "opacity-0 z-0"
                  }`}
                >
                  <img
                    src={img}
                    alt="Medicine laboratory"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}

              {/* Navigation Indicators */}
              <div className="absolute bottom-6 right-6 z-20 flex gap-2">
                {carouselImages.map((_, idx) => (
                  <div 
                    key={idx}
                    className={`h-1.5 transition-all duration-300 rounded-full ${
                      idx === currentImg ? "w-8 bg-[#08B36A]" : "w-2 bg-white"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default AboutUsMed;