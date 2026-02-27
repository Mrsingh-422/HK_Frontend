import React, { useState, useEffect } from "react";

function AboutUsLaboratory() {
  const [currentImg, setCurrentImg] = useState(0);

  const images = [
    "/labImages/aboutuslab.png",
    "/labImages/aboutuslab2.png",
  ];

  const skills = [
    { name: "Sample Preparation", percentage: 25 },
    { name: "Environmental Testing", percentage: 65 },
    { name: "Advanced Microscopy", percentage: 85 },
    { name: "Hightech Equipements", percentage: 90 },
  ];

  // Image Carousel Logic (3 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImg((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }, 3000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <section className="py-16 md:py-15 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* LEFT SECTION: IMAGE CAROUSEL */}
          <div className="relative group">
            <div className="relative h-[350px] sm:h-[450px] md:h-[550px] w-full rounded-2xl overflow-hidden shadow-2xl">
              {images.map((img, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                    index === currentImg ? "opacity-100 z-10" : "opacity-0 z-0"
                  }`}
                >
                  <img
                    src={img}
                    alt="Laboratory tech"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              
              {/* Optional: Subtle Overlay */}
              <div className="absolute inset-0 bg-slate-900/10 z-20"></div>
            </div>
            
            {/* Decorative Element */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-emerald-50 rounded-full -z-10 hidden md:block"></div>
          </div>

          {/* RIGHT SECTION: CONTENT & PROGRESS BARS */}
          <div className="space-y-6">
            <div className="space-y-3">
              <h4 className="text-emerald-600 font-bold uppercase tracking-wider text-sm">
                About Us Laboratory
              </h4>
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight">
                The Laboratory Professional Experts Technician
              </h2>
              <p className="text-slate-600 leading-relaxed text-base md:text-lg">
                Lorem ipsum, dolor sit amet consectetur adipisicing elit. Velit ad 
                doloribus ipsa cupiditate porro eveniet vitae dicta a sunt. Beatae 
                pariatur, minus accusantium voluptas vitae eos quaerat? Vitae, 
                voluptatem voluptatum?
              </p>
            </div>

            {/* PROGRESS BARS */}
            <div className="space-y-8 pt-4">
              {skills.map((skill, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-emerald-700 font-bold text-sm md:text-base">
                      {skill.name}
                    </span>
                    <span className="text-emerald-600 font-black text-sm">
                      {skill.percentage}%
                    </span>
                  </div>
                  
                  {/* Progress Bar Container */}
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${skill.percentage}%` }}
                    >
                      {/* Optional: Pattern overlay on bar */}
                      <div className="w-full h-full opacity-20 bg-[linear-gradient(45deg,rgba(255,255,255,.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,.15)_50%,rgba(255,255,255,.15)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem]"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default AboutUsLaboratory;