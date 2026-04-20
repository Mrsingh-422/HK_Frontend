"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
    FaFlask,
    FaPills,
    FaUserMd,
    FaUserNurse,
    FaAmbulance,
    FaHospital,
    FaPhoneAlt
} from "react-icons/fa";
import { useGlobalContext } from "@/app/context/GlobalContext";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

function HeroSection() {
    const [current, setCurrent] = useState(0);
    const [heroData, setHeroData] = useState({ 
        title: "",
        subtitle: "",
        images: [],
    });

    const { getHomePageContent } = useGlobalContext();

    // Fetch Dynamic Content
    useEffect(() => {
        const fetchHeroContent = async () => {
            try {
                const response = await getHomePageContent();
                if (response?.success && response?.data) {
                    const data = response.data;
                    setHeroData({
                        title: data.title || "",
                        subtitle: data.subtitle || "",
                        images: (data.images || []).map(
                            (img) => `${API_URL}${img}`
                        ),
                    });
                    setCurrent(0);
                }
            } catch (error) {
                console.error("Error fetching hero content:", error);
            }
        };
        fetchHeroContent();
    }, []);

    // Auto Carousel Logic
    useEffect(() => {
        if (!heroData.images.length) return;
        const interval = setInterval(() => {
            setCurrent((prev) => (prev + 1) % heroData.images.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [heroData.images]);

    const cards = [
        { href: "/booklabtest", icon: FaFlask, label: "Book Lab Test", color: "text-orange-500" },
        { href: "/buymedicine", icon: FaPills, label: "Buy Medicines", color: "text-purple-600" },
        { href: "/drappointment", icon: FaUserMd, label: "Dr. Appointment", color: "text-blue-500" },
        { href: "/nursingservice", icon: FaUserNurse, label: "Nursing Service", color: "text-green-600" },
        { href: "/ambulance", icon: FaAmbulance, label: "Ambulance", color: "text-red-500" },
        { href: "/hospital", icon: FaHospital, label: "Hospital", color: "text-red-800" },
    ];

    return (
        <div className="relative w-full">
            {/* Background Carousel Container */}
            <div className="relative w-full h-[500px] md:h-[600px] overflow-hidden bg-gray-900">
                {heroData.images.map((img, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 bg-cover bg-center transition-all duration-[3000ms] ease-in-out ${index === current
                            ? "opacity-100 scale-100"
                            : "opacity-0 scale-110"
                            }`}
                        style={{ backgroundImage: `url(${img})` }}
                    />
                ))}

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex items-center px-[8%]">
                    <div className="max-w-4xl z-10">

                        {/* Emergency Badge (Hidden on Mobile) */}
                        <div className="hidden md:flex items-center bg-white gap-5 px-6 py-3 rounded-full w-fit mb-8 shadow-[0_10px_30px_rgba(231,76,60,0.4)] border-2 border-red-500 animate-in fade-in slide-in-from-left duration-700">
                            <div className="bg-red-500 text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl animate-pulse shadow-[0_0_15px_rgba(231,76,60,0.8)]">
                                <FaAmbulance />
                            </div>
                            <div className="flex flex-col">
                                <span className="bg-green-600 text-white text-[10px] uppercase px-2 py-0.5 rounded font-black w-fit">Free Service</span>
                                <h4 className="text-slate-800 text-lg font-extrabold leading-tight">Emergency Ambulance</h4>
                                <p className="text-slate-500 text-xs font-semibold">No Login Required • 24/7 Available</p>
                            </div>
                            <Link href="/ambulance" className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-full font-bold text-sm transition-transform hover:scale-105 active:scale-95">
                                Book Now
                            </Link>
                        </div>

                        {/* Hero Text */}
                        <h1 className="text-white text-4xl md:text-6xl font-bold leading-[1.1] mb-4 drop-shadow-lg">
                            {heroData.title || "Health Kangaroo"}
                        </h1>
                        <p className="text-gray-200 text-lg md:text-xl max-w-xl mb-8 drop-shadow-md">
                            {heroData.subtitle || "Here you will order medicines, book tests, consultations and many more"}
                        </p>

                        {/* Mobile Emergency Button */}
                        <Link href="/ambulance" className="md:hidden inline-flex items-center gap-3 bg-red-500 text-white px-6 py-4 rounded-xl font-black text-lg shadow-xl active:scale-95 transition-all">
                            <FaPhoneAlt /> Book Free Ambulance
                        </Link>
                    </div>
                </div>
            </div>

            {/* Quick Action Cards (Hidden on Tablet/Mobile) */}
            <div className="hidden lg:flex absolute -bottom-10 left-0 right-0 justify-center gap-5 px-4 z-20">
                {cards.map((card, idx) => (
                    <Link
                        key={idx}
                        href={card.href}
                        className="bg-white w-44 h-32 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.15)] flex flex-col justify-center px-6 transition-all duration-300 hover:-translate-y-3 hover:shadow-2xl group border border-gray-100"
                    >
                        <card.icon className={`text-3xl mb-3 transition-transform group-hover:scale-110 ${card.color}`} />
                        <span className="text-slate-800 text-sm font-bold block leading-tight">
                            {card.label}
                        </span>
                    </Link>
                ))}
            </div>

            {/* Custom Animation for Pulse Effect in Tailwind */}
            <style jsx global>{`
                @keyframes pulse-red {
                    0% { box-shadow: 0 0 0 0 rgba(231, 76, 60, 0.7); }
                    70% { box-shadow: 0 0 0 15px rgba(231, 76, 60, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(231, 76, 60, 0); }
                }
                .animate-pulse-red {
                    animation: pulse-red 2s infinite;
                }
            `}</style>
        </div>
    );
}

export default HeroSection;