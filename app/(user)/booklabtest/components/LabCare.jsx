"use client";
import React, { useState, useEffect } from "react";
import {
    FaFlask, FaMicroscope, FaClock, FaHandHoldingHeart,
    FaCreditCard, FaShieldAlt
} from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useGlobalContext } from "@/app/context/GlobalContext";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// Icon Mapping helper
const IconMap = {
    microscope: <FaMicroscope />,
    flask: <FaFlask />,
    clock: <FaClock />,
    heart: <FaHandHoldingHeart />,
    creditCard: <FaCreditCard />,
    shield: <FaShieldAlt />,
};

function LabCare() {
    const { getLabCareContent } = useGlobalContext();
    const router = useRouter();

    const [currentSlide, setCurrentSlide] = useState(0);
    const [loading, setLoading] = useState(true);

    // Initial State with Dummy Data
    const [data, setData] = useState({
        title: "Lab Care",
        description: "Our laboratory provides a wide range of diagnostic services with a commitment to accuracy and patient care. We use state-of-the-art technology to ensure that every test result is reliable.",
        buttonText: "Book a Test Now",
        statusLabel: "Status",
        statusValue: "Fully Operational",
        features: [
            { id: 1, text: "Qualified Staff of Laboratory", iconKey: "microscope" },
            { id: 2, text: "Easy and Affordable Billing", iconKey: "creditCard" },
            { id: 3, text: "24/7 Emergency Services", iconKey: "clock" },
            { id: 4, text: "Hightech Equipements", iconKey: "flask" },
        ],
        images: [
            "https://images.unsplash.com/photo-1581093458791-9f3c3250bb8b?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1579154236604-cd46096e8248?auto=format&fit=crop&w=800&q=80"
        ]
    });

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const res = await getLabCareContent();
                if (res?.success && res?.data) {
                    setData(res.data);
                }
            } catch (err) {
                console.error("Error loading LabCare data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchContent();
    }, []);

    // Carousel Logic
    useEffect(() => {
        if (data.images?.length > 0) {
            const timer = setInterval(() => {
                setCurrentSlide((prev) => (prev === data.images.length - 1 ? 0 : prev + 1));
            }, 3000);
            return () => clearInterval(timer);
        }
    }, [data.images]);

    if (loading) return null;

    return (
        <section className="bg-[#f8fafc] py-16 md:py-24 overflow-hidden font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

                    {/* LEFT CONTENT SECTION */}
                    <div className="lg:col-span-7 xl:col-span-8 space-y-8">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 text-3xl">
                                <FaFlask />
                            </div>
                            <h2 className="text-3xl md:text-5xl font-black text-emerald-600 tracking-tight uppercase">
                                {data.title}
                            </h2>
                        </div>

                        <p className="text-slate-600 text-lg leading-relaxed max-w-3xl">
                            {data.description}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            {data.features.map((feature, idx) => (
                                <div key={idx} className="flex items-center gap-4 group cursor-default">
                                    <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-sm">
                                        {IconMap[feature.iconKey] || <FaFlask />}
                                    </div>
                                    <span className="text-slate-700 font-bold text-base md:text-lg group-hover:text-emerald-600 transition-colors">
                                        {feature.text}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="pt-6">
                            <button
                                onClick={() => router.push("/booklabtest/seealltests")}
                                className="bg-emerald-600 hover:bg-slate-900 text-white font-black px-12 py-5 rounded-2xl shadow-xl transition-all active:scale-95 text-lg uppercase tracking-wider">
                                {data.buttonText}
                            </button>
                        </div>
                    </div>

                    {/* RIGHT CAROUSEL SECTION */}
                    <div className="lg:col-span-5 xl:col-span-4 relative">
                        <div className="absolute -inset-4 bg-emerald-100/40 rounded-[3rem] rotate-3 hidden md:block"></div>

                        <div className="relative h-[450px] md:h-[600px] w-full rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white bg-slate-100">
                            {data.images.map((img, index) => (
                                <div
                                    key={index}
                                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"}`}
                                >
                                    <img
                                        src={img.startsWith('http') ? img : `${API_URL}${img}`}
                                        alt={`Slide ${index}`}
                                        className="h-full w-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/30 via-transparent to-transparent"></div>
                                </div>
                            ))}

                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                                {data.images.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentSlide(idx)}
                                        className={`h-2 transition-all duration-300 rounded-full ${idx === currentSlide ? "w-8 bg-white" : "w-2 bg-white/50"}`}
                                    />
                                ))}
                            </div>

                            <div className="absolute top-6 right-6 z-20 bg-white/90 backdrop-blur px-4 py-2 rounded-xl shadow-lg border border-emerald-50">
                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none">{data.statusLabel}</p>
                                <p className="text-xs font-bold text-slate-800 uppercase">{data.statusValue}</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}

export default LabCare;