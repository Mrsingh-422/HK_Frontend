import React, { useState } from "react";
import { FaArrowLeft, FaArrowRight, FaStethoscope, FaSyringe, FaMicroscope, FaDna, FaHeartbeat } from "react-icons/fa";

const disorders = [
  {
    id: 1,
    title: "Gynecological Disorders",
    desc: "Promote your healthy eating habits",
    icon: <FaStethoscope className="text-4xl text-emerald-500" />,
  },
  {
    id: 2,
    title: "Myasthenia Gravis",
    desc: "Comprehensive diagnostic testing for neuromuscular health.",
    icon: <FaSyringe className="text-4xl text-emerald-500" />,
  },
  {
    id: 3,
    title: "Disorders of Endocrine System",
    desc: "Promote your healthy eating habits",
    icon: <FaMicroscope className="text-4xl text-emerald-500" />,
  },
  {
    id: 4,
    title: "Pharmacogenomics",
    desc: "Analyze how your genes affect your response to drugs.",
    icon: <FaDna className="text-4xl text-emerald-500" />,
  },
  {
    id: 5,
    title: "Autoimmune Disorders",
    desc: "Advanced screening for systemic immune responses.",
    icon: <FaHeartbeat className="text-4xl text-emerald-500" />,
  },
];

// Double the data for seamless infinite loop
const displayData = [...disorders, ...disorders];

function YourLifecycleDisorders() {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <div className="py-12 md:py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 text-center mb-10 md:mb-16">
        {/* Top Header with Arrows */}
        <div className="flex items-center justify-center gap-4 mb-2">
          <FaArrowLeft className="text-emerald-500 cursor-pointer hover:scale-110 transition-transform" />
          <span className="text-emerald-500 font-bold text-lg md:text-xl">How's Treated You</span>
          <FaArrowRight className="text-emerald-500 cursor-pointer hover:scale-110 transition-transform" />
        </div>

        {/* Main Title */}
        <h1 className="text-3xl md:text-6xl font-black text-slate-800 tracking-tight">
          Your Lifecycle disorders!
        </h1>
        
        {/* Small decorative icon often found in your UI */}
        <div className="flex justify-center mt-6 text-emerald-500 opacity-60">
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
             <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" />
           </svg>
        </div>
      </div>

      {/* Marquee Section */}
      <div 
        className="relative w-full"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        <div 
          className="flex gap-4 md:gap-8 animate-lifecycle-marquee"
          style={{ 
            animationPlayState: isPaused ? 'paused' : 'running',
            width: 'max-content'
          }}
        >
          {displayData.map((item, index) => (
            <div 
              key={`${item.id}-${index}`}
              className="w-[260px] sm:w-[280px] md:w-[320px] flex-shrink-0 bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col items-center text-center group"
            >
              {/* Icon Container */}
              <div className="w-24 h-24 md:w-32 md:h-32 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                <div className="p-4 border-2 border-dashed border-emerald-200 rounded-xl">
                    {item.icon}
                </div>
              </div>

              {/* Title */}
              <h3 className="text-emerald-500 font-bold text-lg md:text-xl mb-4 min-h-[56px] flex items-center">
                {item.title}
              </h3>

              {/* Description */}
              <p className="text-slate-500 text-sm md:text-base leading-relaxed mb-8 min-h-[48px]">
                {item.desc}
              </p>

              {/* Button */}
              <button className="bg-[#10b981] hover:bg-slate-900 text-white font-bold py-2.5 px-8 rounded-xl transition-all shadow-md active:scale-95 text-sm">
                Book A Test
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Responsive Styles & Animation */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes lifecycle-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-lifecycle-marquee {
          animation: lifecycle-marquee 35s linear infinite;
        }
        @media (max-width: 768px) {
          .animate-lifecycle-marquee {
            animation: lifecycle-marquee 25s linear infinite;
          }
        }
      `}} />
    </div>
  );
}

export default YourLifecycleDisorders;