"use client";

import React, { useState, useEffect } from "react";
import { useGlobalContext } from "@/app/context/GlobalContext";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const AboutUs = () => {
    const { getAboutUsContent } = useGlobalContext();

    const [aboutData, setAboutData] = useState(null);
    const [images, setImages] = useState([]);
    const [currentImage, setCurrentImage] = useState(0);
    const [activeTab, setActiveTab] = useState("Work");

    /* ---------------- FETCH DATA ---------------- */
    useEffect(() => {
        const fetchData = async () => {
            const response = await getAboutUsContent();

            if (response?.success) {
                const data = response.data;
                setAboutData(data);

                const fullImageUrls = (data.images || []).map((img) => {
                    const correctedPath = img.replace("/uploads/frontend/", "/uploads/homepage/");
                    return `${API_URL}${correctedPath}`;
                });

                setImages(fullImageUrls);
            }
        };

        fetchData();
    }, [getAboutUsContent]);

    /* ---------------- AUTO IMAGE SLIDER ---------------- */
    useEffect(() => {
        if (images.length === 0) return;

        const interval = setInterval(() => {
            setCurrentImage((prev) =>
                prev === images.length - 1 ? 0 : prev + 1
            );
        }, 4000);

        return () => clearInterval(interval);
    }, [images]);

    /* ---------------- TAB DATA FROM API ---------------- */
    const tabContent = {
        Work: aboutData?.workDescription || "Loading content...",
        Mission: aboutData?.missionDescription || "Loading content...",
        Achievement: aboutData?.achievementDescription || "Loading content...",
    };

    return (
        <section className="bg-white py-12 lg:py-20 px-6 lg:px-24 overflow-hidden">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">
                
                {/* LEFT IMAGE SIDE (CAROUSEL) */}
                <div className="relative flex-1 flex justify-center w-full">
                    {/* Dots Decoration */}
                    <div className="absolute top-4 left-4 lg:top-10 lg:left-10 w-24 h-24 lg:w-40 lg:h-40 bg-[radial-gradient(#08B36A_2px,transparent_2px)] bg-[size:14px_14px] z-0 opacity-60"></div>

                    <div className="relative z-10 w-64 h-64 sm:w-80 sm:h-80 lg:w-[420px] lg:h-[420px] overflow-hidden rounded-full rounded-tr-none shadow-2xl border-4 border-white">
                        <div
                            className="flex h-full transition-transform duration-700 ease-in-out"
                            style={{
                                transform: `translateX(-${currentImage * 100}%)`,
                            }}
                        >
                            {images.map((img, index) => (
                                <img
                                    key={index}
                                    src={img}
                                    alt="About Us Carousel"
                                    className="w-full h-full object-cover flex-shrink-0"
                                />
                            ))}
                            {images.length === 0 && (
                                <div className="w-full h-full bg-gray-100 animate-pulse flex-shrink-0" />
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT CONTENT SIDE */}
                <div className="flex-1 text-center lg:text-left">
                    <div className="flex items-center justify-center lg:justify-start gap-4 mb-5">
                        <span className="text-emerald-500 font-semibold text-xl lg:text-2xl uppercase tracking-wider">
                            {aboutData?.title || "About Us"}
                        </span>
                        <span className="text-emerald-500 text-2xl hidden lg:block">→</span>
                    </div>

                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-800 leading-tight mb-8">
                        {aboutData?.subtitle || "Better Health Starts Here"}
                    </h2>

                    {/* TABS */}
                    <div className="flex justify-center lg:justify-start gap-6 lg:gap-8 mb-6 flex-wrap">
                        {Object.keys(tabContent).map((tab) => (
                            <button
                                key={tab}
                                className={`text-base lg:text-lg font-semibold cursor-pointer pb-1 transition-all duration-300 border-b-2 ${
                                    activeTab === tab 
                                    ? "text-emerald-500 border-emerald-500" 
                                    : "text-slate-600 border-transparent hover:text-emerald-400"
                                }`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* DESCRIPTION */}
                    <div className="border-b-4 lg:border-b-0 lg:border-r-4 border-gray-200 pb-5 lg:pb-0 lg:pr-5 mb-8 max-w-lg mx-auto lg:mx-0">
                        <p className="text-slate-600 leading-relaxed text-sm lg:text-base transition-opacity duration-500">
                            {tabContent[activeTab]}
                        </p>
                    </div>

                    {/* MORE LINK */}
                    <div className="flex items-center justify-center lg:justify-start gap-3">
                        <span className="text-emerald-500 text-xl">→</span>
                        <a 
                            href="#" 
                            className="text-emerald-500 font-bold hover:underline transition-all"
                        >
                            More
                        </a>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default AboutUs;





// "use client";

// import React, { useState, useEffect } from "react";
// import { useGlobalContext } from "@/app/context/GlobalContext";
// import { FaChevronRight, FaAward, FaBullseye, FaBriefcase } from "react-icons/fa";

// const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// const AboutUs = () => {
//     const { getAboutUsContent } = useGlobalContext();

//     const [aboutData, setAboutData] = useState(null);
//     const [images, setImages] = useState([]);
//     const [currentImage, setCurrentImage] = useState(0);
//     const [activeTab, setActiveTab] = useState("Work");

//     useEffect(() => {
//         const fetchData = async () => {
//             const response = await getAboutUsContent();
//             if (response?.success) {
//                 const data = response.data;
//                 setAboutData(data);
//                 const fullImageUrls = (data.images || []).map((img) => {
//                     const correctedPath = img.replace("/uploads/frontend/", "/uploads/homepage/");
//                     return `${API_URL}${correctedPath}`;
//                 });
//                 setImages(fullImageUrls);
//             }
//         };
//         fetchData();
//     }, [getAboutUsContent]);

//     useEffect(() => {
//         if (images.length === 0) return;
//         const interval = setInterval(() => {
//             setCurrentImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
//         }, 5000);
//         return () => clearInterval(interval);
//     }, [images]);

//     const tabConfig = {
//         Work: { label: "Our Work", icon: <FaBriefcase />, text: aboutData?.workDescription },
//         Mission: { label: "Mission", icon: <FaBullseye />, text: aboutData?.missionDescription },
//         Achievement: { label: "Achievement", icon: <FaAward />, text: aboutData?.achievementDescription },
//     };

//     return (
//         <section className="relative bg-slate-50 py-20 lg:py-32 overflow-hidden">
//             {/* Background Decorative Element */}
//             <div className="absolute top-0 right-0 w-1/3 h-full bg-emerald-50/50 -skew-x-12 translate-x-20 z-0 hidden lg:block"></div>

//             <div className="container mx-auto px-6 lg:px-12 relative z-10">
//                 <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
                    
//                     {/* LEFT SIDE: IMAGE COMPOSITION */}
//                     <div className="relative w-full max-w-[500px] flex-1 group">
//                         {/* Dot Pattern Background */}
//                         <div className="absolute -top-8 -left-8 w-32 h-32 bg-[radial-gradient(#08B36A_2px,transparent_2px)] bg-[size:16px_16px] opacity-40"></div>
                        
//                         {/* Main Image Container */}
//                         <div className="relative z-10 aspect-square rounded-[40px] rounded-tr-none overflow-hidden border-[12px] border-white shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]">
//                             <div
//                                 className="flex h-full transition-transform duration-1000 cubic-bezier(0.4, 0, 0.2, 1)"
//                                 style={{ transform: `translateX(-${currentImage * 100}%)` }}
//                             >
//                                 {images.map((img, index) => (
//                                     <img key={index} src={img} alt="Hospital Info" className="w-full h-full object-cover flex-shrink-0" />
//                                 ))}
//                                 {images.length === 0 && <div className="w-full h-full bg-slate-200 animate-pulse" />}
//                             </div>
//                         </div>

//                         {/* Floating Experience Badge */}
//                         <div className="absolute -bottom-6 -right-6 bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-white/50 z-20 animate-bounce-slow">
//                             <p className="text-emerald-500 font-black text-4xl leading-none">12+</p>
//                             <p className="text-slate-600 font-bold text-xs uppercase tracking-tighter mt-1">Years of<br/>Excellence</p>
//                         </div>
//                     </div>

//                     {/* RIGHT SIDE: CONTENT */}
//                     <div className="flex-1">
//                         {/* Section Tag */}
//                         <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 rounded-full mb-6">
//                             <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
//                             <span className="text-emerald-700 font-bold text-xs uppercase tracking-widest">
//                                 {aboutData?.title || "About Our Clinic"}
//                             </span>
//                         </div>

//                         <h2 className="text-4xl lg:text-6xl font-extrabold text-slate-900 leading-[1.1] mb-8">
//                             {aboutData?.subtitle?.split(' ').slice(0, -2).join(' ')} <span className="text-emerald-500">{aboutData?.subtitle?.split(' ').slice(-2).join(' ')}</span>
//                         </h2>

//                         {/* TAB SYSTEM */}
//                         <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 inline-flex mb-8 w-full sm:w-auto overflow-x-auto">
//                             {Object.keys(tabConfig).map((key) => (
//                                 <button
//                                     key={key}
//                                     onClick={() => setActiveTab(key)}
//                                     className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 whitespace-nowrap ${
//                                         activeTab === key 
//                                         ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200" 
//                                         : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
//                                     }`}
//                                 >
//                                     {tabConfig[key].icon}
//                                     {tabConfig[key].label}
//                                 </button>
//                             ))}
//                         </div>

//                         {/* DESCRIPTION BOX */}
//                         <div className="relative mb-10 min-h-[120px]">
//                             <div className="absolute left-0 top-0 w-1 h-full bg-emerald-500 rounded-full"></div>
//                             <p className="pl-8 text-slate-600 text-lg leading-relaxed italic italic font-medium">
//                                 "{tabConfig[activeTab].text}"
//                             </p>
//                         </div>

//                         {/* CALL TO ACTION */}
//                         <div className="flex flex-wrap items-center gap-6">
//                             <a 
//                                 href="/about" 
//                                 className="group flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-emerald-600 transition-all active:scale-95 shadow-xl shadow-slate-200"
//                             >
//                                 Discover More
//                                 <FaChevronRight className="text-xs group-hover:translate-x-1 transition-transform" />
//                             </a>
                            
//                             <div className="flex items-center gap-4">
//                                 <div className="w-12 h-12 rounded-full border-2 border-emerald-500 p-1">
//                                     <img src="https://via.placeholder.com/100" className="w-full h-full rounded-full object-cover" alt="Director" />
//                                 </div>
//                                 <div>
//                                     <p className="text-sm font-bold text-slate-900">Dr. Rahul Sharma</p>
//                                     <p className="text-[10px] font-bold text-slate-400 uppercase">Medical Director</p>
//                                 </div>
//                             </div>
//                         </div>

//                     </div>
//                 </div>
//             </div>

//             {/* Custom Bounce Animation for Tailwind */}
//             <style jsx>{`
//                 @keyframes bounce-slow {
//                     0%, 100% { transform: translateY(0); }
//                     50% { transform: translateY(-10px); }
//                 }
//                 .animate-bounce-slow {
//                     animation: bounce-slow 4s infinite ease-in-out;
//                 }
//             `}</style>
//         </section>
//     );
// };

// export default AboutUs;