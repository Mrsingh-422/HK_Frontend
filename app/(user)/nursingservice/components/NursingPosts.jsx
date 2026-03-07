import React from "react";
import { FaUserNurse, FaClipboardList, FaHeartbeat } from "react-icons/fa";

const steps = [
  {
    id: 1,
    title: "Speak To care Advisor",
    desc: "Our expert advisors are ready to listen and understand your specific home nursing requirements through a detailed initial consultation.",
    icon: <FaUserNurse />,
    color: "#08B36A",
    bgColor: "bg-emerald-50",
  },
  {
    id: 2,
    title: "Make a Care Plan together",
    desc: "We collaborate with your family and doctors to create a customized medical roadmap that ensures safety and rapid recovery.",
    icon: <FaClipboardList />,
    color: "#3b82f6", // Medical Blue
    bgColor: "bg-blue-50",
  },
  {
    id: 3,
    title: "Your personalised care begins",
    desc: "Experience professional, compassionate medical care in the comfort of your home with our certified nursing specialists.",
    icon: <FaHeartbeat />,
    color: "#ef4444", // Heart Red
    bgColor: "bg-red-50",
  },
];

function NursingPosts() {
  return (
    <section className="py-8 sm:py-10 lg:py-28 bg-[#f8fafc] font-sans overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 sm:px-10">
        
        {/* HEADER SECTION */}
        <div className="text-center mb-16 md:mb-24">
          <h4 className="text-[#08B36A] font-black uppercase tracking-[0.3em] text-[10px] sm:text-xs mb-4">
            Step-By-Step
          </h4>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-tight">
            How It <span className="text-[#08B36A]">Works</span>
          </h2>
          <div className="w-12 sm:w-20 h-1.5 bg-[#08B36A] mx-auto mt-6 rounded-full opacity-20"></div>
        </div>

        {/* STEPS GRID */}
        {/* Mobile: 1 col | Tablet: 1 col (centered) | Desktop: 3 cols */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 lg:gap-10 xl:gap-20">
          {steps.map((step, index) => (
            <div 
              key={step.id} 
              className="group relative flex flex-col items-center text-center"
            >
              {/* CONNECTING LINE (Desktop Only) */}
              {index !== steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-1/2 w-full h-[2px] bg-slate-100 -z-10">
                  <div className="h-full bg-[#08B36A] w-0 group-hover:w-full transition-all duration-700"></div>
                </div>
              )}

              {/* ICON BLOCK */}
              <div className="relative mb-8 md:mb-10">
                {/* Step Number */}
                <div className="absolute -top-3 -right-3 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center z-20 border border-slate-50">
                  <span className="text-[#08B36A] font-black text-sm">0{index + 1}</span>
                </div>
                
                {/* Main Icon Container */}
                <div 
                  className={`w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 ${step.bgColor} rounded-[2.5rem] md:rounded-[3rem] flex items-center justify-center text-4xl sm:text-5xl md:text-6xl transition-all duration-500 group-hover:scale-110 group-hover:-rotate-6 shadow-sm group-hover:shadow-2xl group-hover:shadow-[#08B36A]/20`}
                  style={{ color: step.color }}
                >
                  {step.icon}
                </div>
              </div>

              {/* TEXT CONTENT */}
              <div className="space-y-4 md:space-y-5 px-4">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-800 transition-colors group-hover:text-[#08B36A]">
                  {step.title}
                </h3>
                <p className="text-slate-500 text-sm sm:text-base leading-relaxed max-w-[320px] md:max-w-sm mx-auto">
                  {step.desc}
                </p>
              </div>

              {/* MOBILE DIVIDER (Visible only on mobile/tab between items) */}
              {index !== steps.length - 1 && (
                <div className="lg:hidden w-px h-12 bg-gradient-to-b from-[#08B36A] to-transparent mt-12 opacity-30"></div>
              )}
            </div>
          ))}
        </div>

        {/* FOOTER ACTION (Optional but makes it look professional) */}
        <div className="mt-10 md:mt-16 text-center">
            <button className="bg-[#08B36A] hover:bg-slate-900 text-white font-black px-10 py-4 rounded-2xl shadow-xl shadow-[#08B36A]/20 transition-all active:scale-95 uppercase tracking-widest text-xs md:text-sm">
                Get Started Now
            </button>
        </div>

      </div>
    </section>
  );
}

export default NursingPosts;