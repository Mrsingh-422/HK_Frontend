import React, { useState, useEffect } from "react";
import { FaFlask, FaMicroscope, FaClock, FaHandHoldingHeart, FaCreditCard, FaShieldAlt, FaChevronLeft, FaChevronRight } from "react-icons/fa";

function LabCare() {
    const [currentSlide, setCurrentSlide] = useState(0);

    const carouselImages = [
        "./labImages/labcareimg1.png",
        "./labImages/labcareimg2.png",
    ];

    const features = [
        { id: 1, text: "Qualified Staff of Laboratory", icon: <FaMicroscope /> },
        { id: 2, text: "Easy and Affordable Billing", icon: <FaCreditCard /> },
        { id: 3, text: "24/7 Emergency Services", icon: <FaClock /> },
        { id: 4, text: "Hightech Equipements", icon: <FaFlask /> },
        { id: 5, text: "Save Your Money & Time", icon: <FaHandHoldingHeart /> },
        { id: 6, text: "Will Make Sure Your Safety", icon: <FaShieldAlt /> },
    ];

    // Automatic slide logic
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev === carouselImages.length - 1 ? 0 : prev + 1));
        }, 2500); // 2.5 seconds

        return () => clearInterval(timer);
    }, [carouselImages.length]);

    return (
        <section className="bg-white py-16 md:py-24 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

                    {/* LEFT CONTENT SECTION */}
                    <div className="lg:col-span-7 xl:col-span-8 space-y-8">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 text-3xl">
                                <FaFlask />
                            </div>
                            <h2 className="text-3xl md:text-5xl font-black text-emerald-600 tracking-tight uppercase">
                                Lab Care
                            </h2>
                        </div>

                        <p className="text-slate-600 text-lg leading-relaxed max-w-3xl">
                            Our laboratory provides a wide range of diagnostic services with a commitment to
                            accuracy and patient care. We use state-of-the-art technology to ensure that
                            every test result is reliable and delivered with speed.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            {features.map((feature) => (
                                <div key={feature.id} className="flex items-center gap-4 group cursor-default">
                                    <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-sm">
                                        {feature.icon}
                                    </div>
                                    <span className="text-slate-700 font-bold text-base md:text-lg group-hover:text-emerald-600 transition-colors">
                                        {feature.text}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="pt-6">
                            <button className="bg-emerald-600 hover:bg-slate-900 text-white font-black px-12 py-5 rounded-2xl shadow-xl shadow-emerald-100 hover:shadow-slate-300 transition-all active:scale-95 text-lg uppercase tracking-wider">
                                Book a Test Now
                            </button>
                        </div>
                    </div>

                    {/* RIGHT CAROUSEL SECTION */}
                    <div className="lg:col-span-5 xl:col-span-4 relative">
                        {/* Background Decorative Frame */}
                        <div className="absolute -inset-4 bg-emerald-100/40 rounded-[3rem] rotate-3 hidden md:block"></div>

                        <div className="relative h-[450px] md:h-[600px] w-full rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white bg-slate-100">
                            {carouselImages.map((img, index) => (
                                <div
                                    key={index}
                                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
                                        }`}
                                >
                                    <img
                                        src={img}
                                        alt={`Lab view ${index + 1}`}
                                        className="h-full w-full object-cover"
                                    />
                                    {/* Subtle Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/30 via-transparent to-transparent"></div>
                                </div>
                            ))}

                            {/* Floating Carousel Indicators (Dots) */}
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                                {carouselImages.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentSlide(idx)}
                                        className={`h-2 transition-all duration-300 rounded-full ${idx === currentSlide ? "w-8 bg-white" : "w-2 bg-white/50"
                                            }`}
                                    />
                                ))}
                            </div>

                            {/* Trust Badge overlay */}
                            <div className="absolute top-6 right-6 z-20 bg-white/90 backdrop-blur px-4 py-2 rounded-xl shadow-lg border border-emerald-50">
                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none">Status</p>
                                <p className="text-xs font-bold text-slate-800 uppercase">Fully Operational</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}

export default LabCare;