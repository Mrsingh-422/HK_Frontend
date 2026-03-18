"use client";
import React, { useState, useEffect } from "react";
import { FaArrowAltCircleRight, FaPhoneAlt } from "react-icons/fa";
import { useGlobalContext } from "@/app/context/GlobalContext";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

function ResearchAndVerify() {
    const { getResearchContent } = useGlobalContext();
    const [currentImg, setCurrentImg] = useState(0);
    const [loading, setLoading] = useState(true);

    // Dynamic State with Dummy Data
    const [data, setData] = useState({
        title: "Research & Verify A To Get A Partner Laboratory",
        subtitle: "We Employ Latest Research Technology & Company",
        description: "Connect with our certified network of partner labs. We utilize cutting-edge diagnostic technology to ensure precision, reliability, and fast turnaround times for all your medical testing needs.",
        phone1: "123-456-7890",
        phone2: "456-789-4565",
        buttonText: "Join My Lab",
        features: [
            "Engage - marketing automation",
            "Exploring Anatomy in the Lab",
            "Learn from customer feedback",
            "Customer support services",
        ],
        images: [
            "https://images.unsplash.com/photo-1579154236604-cd46096e8248?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1581093458791-9f3c3250bb8b?auto=format&fit=crop&w=800&q=80"
        ]
    });

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const res = await getResearchContent();
                if (res?.success && res?.data) {
                    setData(res.data);
                }
            } catch (err) {
                console.error("Error fetching research content", err);
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

    if (loading) return null;

    return (
        <section className="py-16 md:py-24 bg-[#f8fafc] overflow-hidden font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    
                    {/* LEFT CONTENT SECTION */}
                    <div className="space-y-8 order-2 lg:order-1">
                        <div className="border-l-4 border-emerald-500 pl-6 space-y-4">
                            <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-[1.1]">
                                {data.title}
                            </h1>
                            <h3 className="text-xl md:text-2xl font-bold text-slate-800">
                                {data.subtitle}
                            </h3>
                        </div>

                        <p className="text-slate-600 text-base md:text-lg leading-relaxed max-w-2xl">
                            {data.description}
                        </p>

                        {/* Phone Numbers Section */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                            <div className="space-y-1">
                                <p className="text-slate-500 font-semibold text-sm">Call For Any Questions</p>
                                <div className="flex items-center gap-2 text-emerald-600 font-black text-lg md:text-xl">
                                    <FaPhoneAlt className="text-sm" />
                                    <span>{data.phone1}</span>
                                </div>
                            </div>
                            <div className="space-y-1 sm:border-l sm:pl-6 border-slate-100">
                                <p className="text-slate-500 font-semibold text-sm invisible sm:visible">Alternative</p>
                                <div className="flex items-center gap-2 text-emerald-600 font-black text-lg md:text-xl">
                                    <FaPhoneAlt className="text-sm" />
                                    <span>{data.phone2}</span>
                                </div>
                            </div>
                        </div>

                        {/* Feature List */}
                        <div className="space-y-4 pt-4">
                            {data.features.map((feature, index) => (
                                <div key={index} className="flex items-center gap-3 group cursor-default">
                                    <FaArrowAltCircleRight className="text-emerald-50 text-emerald-500 rounded-full text-xl group-hover:scale-110 transition-transform" />
                                    <span className="text-slate-700 font-bold md:text-lg transition-colors group-hover:text-emerald-600">
                                        {feature}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* CTA Button */}
                        <div className="pt-6">
                            <button className="bg-emerald-600 hover:bg-slate-900 text-white font-black px-10 py-4 rounded-lg transition-all shadow-lg shadow-emerald-100 active:scale-95 uppercase tracking-wider text-sm">
                                {data.buttonText}
                            </button>
                        </div>
                    </div>

                    {/* RIGHT CAROUSEL SECTION */}
                    <div className="relative order-1 lg:order-2">
                        <div className="relative h-[350px] sm:h-[450px] md:h-[600px] w-full rounded-2xl overflow-hidden shadow-2xl bg-slate-200">
                            {data.images.map((img, index) => (
                                <div
                                    key={index}
                                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                                        index === currentImg ? "opacity-100 z-10" : "opacity-0 z-0"
                                    }`}
                                >
                                    <img
                                        src={img.startsWith('http') ? img : `${API_URL}${img}`}
                                        alt="Research Laboratory"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ))}
                            
                            <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/20 to-transparent z-20"></div>

                            {/* Slide Indicators */}
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
                                {data.images.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentImg(idx)}
                                        className={`h-1.5 rounded-full transition-all duration-300 ${
                                            idx === currentImg ? "w-10 bg-emerald-500" : "w-4 bg-white/50"
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="absolute -top-6 -right-6 w-full h-full border-2 border-emerald-100 rounded-2xl -z-10 hidden lg:block"></div>
                    </div>

                </div>
            </div>
        </section>
    );
}

export default ResearchAndVerify;