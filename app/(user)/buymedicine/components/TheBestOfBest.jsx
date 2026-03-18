"use client";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { FaCheckCircle, FaChevronRight } from "react-icons/fa";
import { useGlobalContext } from "@/app/context/GlobalContext";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

function TheBestOfBest() {
    const { getBestOfBestContent } = useGlobalContext();
    const [currentImg, setCurrentImg] = useState(0);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Default State with Dummy Data
    const [data, setData] = useState({
        miniTitle: "Best of the Best",
        mainTitle: "Treated With Best Medicines!",
        description: "Quality healthcare starts with authentic and effective medication delivered right to your door. We ensure every product is verified and handled with care.",
        buttonText: "Book Now",
        statusText: "Available Booking Online",
        images: [
            "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&w=1000&q=80",
        ]
    });

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const res = await getBestOfBestContent();
                if (res?.success && res?.data) {
                    setData(res.data);
                }
            } catch (err) {
                console.error("Error fetching Best of Best content:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchContent();
    }, []);

    // Carousel Logic
    useEffect(() => {
        if (data.images?.length > 1) {
            const timer = setInterval(() => {
                setCurrentImg((prev) => (prev === data.images.length - 1 ? 0 : prev + 1));
            }, 3000);
            return () => clearInterval(timer);
        }
    }, [data.images]);

    if (loading) return null; // Or a skeleton loader

    return (
        <section className="py-12 md:py-14 bg-[#f8fafc] overflow-hidden font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

                    {/* LEFT CONTENT SECTION */}
                    <div className="space-y-6 md:space-y-8 order-2 lg:order-1">
                        <div className="space-y-3">
                            <span className="text-emerald-600 font-black uppercase tracking-[0.2em] text-xs md:text-sm">
                                {data.miniTitle}
                            </span>
                            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.1]">
                                {/* Dynamically highlighting the last word */}
                                {data.mainTitle.split(' ').slice(0, -1).join(' ')}{" "}
                                <span className="text-emerald-600">{data.mainTitle.split(' ').slice(-1)}</span>
                            </h2>
                        </div>

                        <p className="text-slate-600 text-base md:text-lg leading-relaxed max-w-xl">
                            {data.description}
                        </p>

                        <div className="flex items-center gap-3 text-emerald-600 font-bold text-lg md:text-xl">
                            <FaCheckCircle className="animate-pulse" />
                            <span>{data.statusText}</span>
                        </div>

                        <div className="pt-4">
                            <button
                                onClick={() => router.push("/buymedicine/seeallmed")}
                                className="group relative border-2 border-emerald-500 text-emerald-600 font-bold px-8 py-3 rounded-md hover:bg-emerald-500 hover:text-white transition-all duration-300 active:scale-95 flex items-center gap-2"
                            >
                                {data.buttonText}
                                <FaChevronRight className="text-sm group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>

                    {/* RIGHT CAROUSEL SECTION */}
                    <div className="relative order-1 lg:order-2">
                        <div className="absolute -inset-2 bg-emerald-50 rounded-2xl -rotate-1 hidden lg:block"></div>

                        <div className="relative h-[250px] sm:h-[350px] md:h-[450px] w-full rounded-2xl overflow-hidden shadow-xl border border-slate-100 bg-slate-200">
                            {data.images.map((img, index) => (
                                <div
                                    key={index}
                                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                                        index === currentImg ? "opacity-100 z-10" : "opacity-0 z-0"
                                    }`}
                                >
                                    <img
                                        src={img.startsWith('http') ? img : `${API_URL}${img}`}
                                        alt={`Medicine ${index}`}
                                        className={`w-full h-full object-cover transition-transform duration-[3000ms] ${
                                            index === currentImg ? "scale-100" : "scale-110"
                                        }`}
                                    />
                                </div>
                            ))}

                            {/* Progress Indicators */}
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                                {data.images.map((_, idx) => (
                                    <div
                                        key={idx}
                                        className={`h-1 rounded-full transition-all duration-300 ${
                                            idx === currentImg ? "w-8 bg-emerald-500" : "w-2 bg-white/50"
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