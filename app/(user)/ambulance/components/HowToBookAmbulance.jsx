import React from 'react'
import { FaPhoneAlt, FaMapMarkerAlt, FaAmbulance, FaCheckCircle, FaArrowRight } from 'react-icons/fa'

function HowToBookAmbulance() {
    const steps = [
        {
            id: "01",
            title: "Location",
            desc: "Search location or drop a pin on the map instantly.",
            icon: <FaMapMarkerAlt />,
            color: "bg-blue-50 text-blue-600"
        },
        {
            id: "02",
            title: "Choose Unit",
            desc: "Select ALS, BLS, or Patient Transport unit.",
            icon: <FaAmbulance />,
            color: "bg-amber-50 text-amber-600"
        },
        {
            id: "03",
            title: "Confirm",
            desc: "Verify contact and fare to dispatch nearest unit.",
            icon: <FaCheckCircle />,
            color: "bg-emerald-50 text-emerald-600"
        },
        {
            id: "04",
            title: "Arrival",
            desc: "Track real-time. Paramedics arrive for care.",
            icon: <FaPhoneAlt />,
            color: "bg-red-50 text-red-600"
        }
    ];

    return (
        <section className="py-12 md:py-24 lg:py-32 bg-[#FDFEFF] font-sans overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 md:px-8">

                {/* Header Section */}
                <div className="flex flex-col items-center text-center mb-10 md:mb-20 space-y-3 md:space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#08B36A]/10 rounded-full">
                        <span className="w-1.5 h-1.5 bg-[#08B36A] rounded-full animate-pulse"></span>
                        <span className="text-[#08B36A] text-[9px] md:text-xs font-black uppercase tracking-[0.2em]">Simple Process</span>
                    </div>
                    <h2 className="text-2xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
                        How to <span className="text-[#08B36A]">Book</span> Your Unit
                    </h2>
                    <p className="text-slate-500 max-w-2xl text-[12px] md:text-lg font-medium leading-relaxed px-2">
                        Every second is vital. We have simplified our process to ensure medical help reaches you as fast as possible.
                    </p>
                </div>

                {/* Steps Grid - grid-cols-2 makes two cards in one row on mobile */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8 relative">

                    {/* Decorative Connecting Line (Desktop Only) */}
                    <div className="hidden lg:block absolute top-1/4 left-0 w-full h-px bg-slate-100 -z-10"></div>

                    {steps.map((step, index) => (
                        <div key={index} className="relative group">
                            <div className="bg-white p-4 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-[#08B36A]/10 transition-all duration-500 h-full flex flex-col items-center text-center">

                                {/* Step Number */}
                                <div className="absolute -top-2 -right-2 md:-top-4 md:-right-4 w-7 h-7 md:w-12 md:h-12 bg-slate-900 text-white rounded-lg md:rounded-2xl flex items-center justify-center font-black text-[10px] md:text-sm shadow-xl group-hover:bg-[#08B36A] transition-colors">
                                    {step.id}
                                </div>

                                {/* Icon Circle */}
                                <div className={`w-10 h-10 md:w-20 md:h-20 rounded-xl md:rounded-[2rem] ${step.color} flex items-center justify-center text-xl md:text-3xl mb-3 md:mb-8 group-hover:scale-110 transition-transform duration-500`}>
                                    {step.icon}
                                </div>

                                <h3 className="text-[13px] md:text-xl font-black text-slate-900 mb-1 md:mb-4 tracking-tight">
                                    {step.title}
                                </h3>

                                <p className="text-slate-500 text-[10px] md:text-sm leading-tight md:leading-relaxed font-medium">
                                    {step.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Call to Action Footer */}
                <div className="mt-10 md:mt-24 p-6 md:p-12 bg-slate-900 rounded-[2rem] md:rounded-[3.5rem] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-48 h-48 md:w-64 md:h-64 bg-[#08B36A] opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                    <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6 md:gap-8 text-center lg:text-left">
                        <div className="space-y-2">
                            <h4 className="text-white text-lg md:text-3xl font-black">Need Immediate Help?</h4>
                            <p className="text-slate-400 text-[12px] md:text-base font-medium italic">Call our emergency hotline for manual dispatch 24/7.</p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 w-full lg:w-auto">
                            <a
                                href="tel:102"
                                className="flex items-center justify-center gap-3 bg-[#08B36A] text-white px-6 md:px-10 py-4 md:py-5 rounded-xl md:rounded-2xl font-black text-[10px] md:text-sm uppercase tracking-widest hover:bg-white hover:text-[#08B36A] transition-all duration-300 shadow-xl shadow-[#08B36A]/20 active:scale-95"
                            >
                                <FaPhoneAlt className="text-xs md:text-sm" /> Call 102 / 108
                            </a>
                            <button
                                className="flex items-center justify-center gap-3 bg-white/10 text-white border border-white/20 px-6 md:px-10 py-4 md:py-5 rounded-xl md:rounded-2xl font-black text-[10px] md:text-sm uppercase tracking-widest hover:bg-white/20 transition-all duration-300"
                            >
                                Live Support
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    )
}

export default HowToBookAmbulance