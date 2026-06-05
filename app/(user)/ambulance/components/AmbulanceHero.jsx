"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    ShieldAlert,
    Stethoscope,
    Truck,
    MapPin,
    PhoneCall,
    ChevronRight,
    Clock
} from "lucide-react";
import { useGlobalContext } from "@/app/context/GlobalContext";

const AMBULANCE_TYPES = [
    {
        id: "accidental",
        slug: "accidentalambulance",
        title: "Accidental",
        subtitle: "Critical / ALS",
        description: "Advanced Life Support with Ventilators",
        icon: <ShieldAlert className="w-8 h-8 text-red-600" />,
        accent: "bg-red-600",
        lightBg: "bg-red-50",
        hoverBorder: "hover:border-red-500",
        ringColor: "ring-red-500/20",
        serviceType: "Accident emergency"
    },
    {
        id: "medical",
        slug: "seeallambulances",
        title: "Medical",
        subtitle: "Non-Critical / BLS",
        description: "Basic Life Support for hospital transfers",
        icon: <Stethoscope className="w-8 h-8 text-blue-600" />,
        accent: "bg-blue-600",
        lightBg: "bg-blue-50",
        serviceType: "Medical Ambulance",
        hoverBorder: "hover:border-blue-500",
        ringColor: "ring-blue-500/20"
    },
    {
        id: "referral",
        slug: "referralambulance",
        title: "Referral",
        subtitle: "Trauma / PTV",
        description: "Immediate response for road accidents",
        icon: <Truck className="w-8 h-8 text-orange-600" />,
        accent: "bg-orange-600",
        lightBg: "bg-orange-50",
        hoverBorder: "hover:border-orange-500",
        ringColor: "ring-orange-500/20",
        serviceType: "Referral Ambulance"
    }
];

const AmbulanceHero = ({ searchTerm, setSearchTerm }) => {
    const router = useRouter();
    const { getAmbulancePageData } = useGlobalContext();
    const [selectedType, setSelectedType] = useState("emergency");
    const [pageData, setPageData] = useState({
        headerTag: "24/7 Emergency Dispatch",
        mainTitle: "Every Second Counts. \nReliable Care, Faster.",
        description: "India's most advanced medical transport network. We connect you to life-saving care in minutes.",
        searchPlaceholder: "Enter pickup location...",
    });

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const res = await getAmbulancePageData();
                if (res?.success && res?.data) setPageData(res.data);
            } catch (err) {
                console.error("Failed to fetch ambulance hero data", err);
            }
        };
        fetchContent();
    }, [getAmbulancePageData]);

    const handleServiceClick = (id, slug, serviceType) => {
        setSelectedType(id);
        // We pass the serviceType as a URL query parameter
        router.push(`/ambulance/${slug}?serviceType=${encodeURIComponent(serviceType)}`);
    };

    return (
        <section className="relative min-h-screen bg-white overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-1/2 h-screen bg-slate-50/50 -z-10 hidden lg:block" />

            <div className="pt-8 pb-20 px-4 md:px-6 lg:px-12 max-w-[1440px] mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

                    {/* Left Side: Content */}
                    <div className="lg:col-span-7 flex flex-col space-y-8 md:space-y-12">

                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-3 px-4 py-2 bg-red-50 border border-red-100 rounded-full">
                                <span className="flex h-2 w-2 rounded-full bg-red-600 animate-pulse"></span>
                                <span className="text-[10px] md:text-xs font-bold tracking-widest uppercase text-red-700">
                                    {pageData.headerTag}
                                </span>
                            </div>

                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight">
                                {pageData.mainTitle.split('\n').map((line, i) => (
                                    <span key={i} className="block">{line}</span>
                                ))}
                            </h1>

                            <p className="text-base md:text-xl text-slate-500 max-w-2xl font-medium leading-relaxed">
                                {pageData.description}
                            </p>
                        </div>

                        {/* Service Selection Cards - Navigates on Click */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-1">Select Service Type</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {AMBULANCE_TYPES.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => handleServiceClick(item.id, item.slug, item.serviceType)}
                                        className={`group relative flex flex-row md:flex-col items-center md:items-start p-4 md:p-6 rounded-[2rem] transition-all duration-300 border-2 text-left
                                            ${selectedType === item.id
                                                ? `${item.hoverBorder} ${item.lightBg} shadow-lg ring-4 ${item.ringColor}`
                                                : "bg-white border-slate-100 hover:border-slate-200"
                                            }`}
                                    >
                                        <div className={`${item.lightBg} p-3 md:p-4 rounded-2xl mb-0 md:mb-4 mr-4 md:mr-0 transition-transform group-hover:scale-110 duration-300`}>
                                            {item.icon}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between md:mb-1">
                                                <h4 className="font-bold text-slate-900 text-lg md:text-xl leading-tight">
                                                    {item.title}
                                                </h4>
                                                <ChevronRight className={`w-4 h-4 transition-transform ${selectedType === item.id ? 'translate-x-1' : 'opacity-0 group-hover:opacity-100'}`} />
                                            </div>
                                            <p className={`text-xs md:text-sm font-semibold mb-1 ${selectedType === item.id ? 'text-slate-700' : 'text-slate-400'}`}>
                                                {item.subtitle}
                                            </p>
                                            <p className="hidden md:block text-[11px] text-slate-500 leading-snug">
                                                {item.description}
                                            </p>
                                        </div>
                                        {selectedType === item.id && (
                                            <div className={`absolute top-4 right-4 w-2 h-2 rounded-full ${item.accent}`}></div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Search/Booking Bar */}
                        {/* <div className="relative group w-full max-w-3xl">
                            <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-red-400 rounded-[2.5rem] blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
                            <div className="relative flex flex-col md:flex-row items-center bg-white border border-slate-100 rounded-[2rem] p-2 shadow-xl">
                                <div className="flex items-center flex-1 w-full px-4 border-b md:border-b-0 md:border-r border-slate-100">
                                    <MapPin className="text-red-500 w-6 h-6 mr-3 shrink-0" />
                                    <input
                                        type="text"
                                        className="w-full py-4 bg-transparent outline-none text-slate-800 font-bold placeholder:text-slate-400"
                                        placeholder={pageData.searchPlaceholder}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <button className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white px-10 py-4 rounded-2xl font-black transition-all duration-300 flex items-center justify-center gap-2 group/btn">
                                    Book Near Me
                                    <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div> */}
                    </div>

                    {/* Right Side: Visual & Quick Info */}
                    <div className="lg:col-span-5 relative mt-10 lg:mt-0">
                        <div className="relative rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white">
                            <img
                                src="https://www.forcemotors.com/wp-content/uploads/2025/02/Traveller-Ambulance-D-mob-1.png"
                                alt="Ambulance"
                                className="w-full h-[400px] md:h-[600px] object-cover"
                            />

                            {/* Floating Stats */}
                            <div className="absolute top-6 left-6 bg-white/90 backdrop-blur px-4 py-2 rounded-2xl shadow-sm flex items-center gap-2">
                                <div className="bg-green-100 p-1.5 rounded-lg">
                                    <Clock className="w-4 h-4 text-green-600" />
                                </div>
                                <span className="text-xs font-bold text-slate-800">Avg. Response: 12-15m</span>
                            </div>
                        </div>

                        {/* Emergency Contact Float */}
                        <div className="absolute -bottom-8 left-4 right-4 md:left-8 md:right-8">
                            <div className="bg-slate-900 text-white p-6 md:p-8 rounded-[2.5rem] shadow-2xl flex items-center justify-between overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>

                                <div className="flex items-center gap-5 relative z-10">
                                    <div className="bg-red-600 p-4 rounded-2xl shadow-lg shadow-red-600/30">
                                        <PhoneCall className="w-7 h-7 animate-pulse text-white" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 mb-1">Emergency Hotline</p>
                                        <p className="text-2xl md:text-3xl font-black tracking-tighter">108 / 102</p>
                                    </div>
                                </div>
                                <div className="hidden sm:block text-right relative z-10">
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] uppercase font-bold text-red-500 mb-1">Available Now</span>
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map(i => (
                                                <div key={i} className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Mobile-Only Sticky Call Button */}
            <div className="fixed bottom-6 right-6 md:hidden z-50">
                <a href="tel:108" className="bg-red-600 text-white p-4 rounded-full shadow-2xl flex items-center justify-center animate-bounce">
                    <PhoneCall className="w-6 h-6" />
                </a>
            </div>
        </section>
    );
};

export default AmbulanceHero;