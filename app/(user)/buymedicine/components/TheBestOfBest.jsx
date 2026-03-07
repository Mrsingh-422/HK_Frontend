import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { FaCheckCircle, FaChevronRight } from "react-icons/fa";

function TheBestOfBest() {
    const [currentImg, setCurrentImg] = useState(0);

    const carouselImages = [
        "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&w=1000&q=80",
    ];

    const router = useRouter()

    // Carousel Logic (3 seconds)
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentImg((prev) => (prev === carouselImages.length - 1 ? 0 : prev + 1));
        }, 3000);
        return () => clearInterval(timer);
    }, [carouselImages.length]);

    return (
        <section className="py-12 md:py-14 bg-[#f8fafc] overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

                    {/* LEFT CONTENT SECTION */}
                    <div className="space-y-6 md:space-y-8 order-2 lg:order-1">
                        <div className="space-y-3">
                            <span className="text-emerald-600 font-black uppercase tracking-[0.2em] text-xs md:text-sm">
                                Best of the Best
                            </span>
                            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.1]">
                                Treated With <br className="hidden md:block" />
                                Best <span className="text-emerald-600">Medicines!</span>
                            </h2>
                        </div>

                        <p className="text-slate-600 text-base md:text-lg leading-relaxed max-w-xl">
                            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Explicabo
                            expedita dolore esse ipsam nobis debitis hic. Quality healthcare starts
                            with authentic and effective medication delivered right to your door.
                        </p>

                        <div className="flex items-center gap-3 text-emerald-600 font-bold text-lg md:text-xl">
                            <FaCheckCircle className="animate-pulse" />
                            <span>Available Booking Online</span>
                        </div>

                        <div className="pt-4">
                            <button
                                onClick={() => router.push("/buymedicine/seeallmed")}
                                className="group relative border-2 border-emerald-500 text-emerald-600 font-bold px-8 py-3 rounded-md hover:bg-emerald-500 hover:text-white transition-all duration-300 active:scale-95 flex items-center gap-2">
                                Book Now
                                <FaChevronRight className="text-sm group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>

                    {/* RIGHT CAROUSEL SECTION */}
                    <div className="relative order-1 lg:order-2">
                        {/* Visual background element */}
                        <div className="absolute -inset-2 bg-emerald-50 rounded-2xl -rotate-1 hidden lg:block"></div>

                        <div className="relative h-[250px] sm:h-[350px] md:h-[450px] w-full rounded-2xl overflow-hidden shadow-xl border border-slate-100">
                            {carouselImages.map((img, index) => (
                                <div
                                    key={index}
                                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentImg ? "opacity-100 z-10 scale-100" : "opacity-0 z-0 scale-110"
                                        }`}
                                >
                                    <img
                                        src={img}
                                        alt="Medicine stock"
                                        className="w-full h-full object-cover transition-transform duration-[3000ms]"
                                        style={{ transform: index === currentImg ? 'scale(1)' : 'scale(1.1)' }}
                                    />
                                </div>
                            ))}

                            {/* Progress Indicators */}
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                                {carouselImages.map((_, idx) => (
                                    <div
                                        key={idx}
                                        className={`h-1 rounded-full transition-all duration-300 ${idx === currentImg ? "w-8 bg-emerald-500" : "w-2 bg-white/50"
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

export default TheBestOfBest;