import React from 'react';
import { 
    FaHeartbeat, FaMicrochip, FaProcedures, 
    FaFirstAid, FaWind, FaVideo, 
    FaSatellite, FaUserNurse 
} from 'react-icons/fa';

function AmbulanceEquipment() {
    const features = [
        {
            title: "Advanced ALS",
            desc: "Life support systems for critical care.",
            icon: <FaHeartbeat />,
            color: "text-red-500 bg-red-50"
        },
        {
            title: "Ventilators",
            desc: "Modern respiratory support units.",
            icon: <FaWind />,
            color: "text-blue-500 bg-blue-50"
        },
        {
            title: "Auto Stretcher",
            desc: "Hydraulic loading for patient comfort.",
            icon: <FaProcedures />,
            color: "text-emerald-500 bg-emerald-50"
        },
        {
            title: "Real-time GPS",
            desc: "Live tracking for rapid dispatch.",
            icon: <FaSatellite />,
            color: "text-purple-500 bg-purple-50"
        },
        {
            title: "Emergency Kit",
            desc: "Fully stocked ICU medications.",
            icon: <FaFirstAid />,
            color: "text-orange-500 bg-orange-50"
        },
        {
            title: "Paramedics",
            desc: "Expert staff available 24/7.",
            icon: <FaUserNurse />,
            color: "text-[#08B36A] bg-emerald-50"
        },
        {
            title: "AI Monitoring",
            desc: "Smart vitals tracking systems.",
            icon: <FaMicrochip />,
            color: "text-indigo-500 bg-indigo-50"
        },
        {
            title: "CCTV Sync",
            desc: "On-route doctor consultation.",
            icon: <FaVideo />,
            color: "text-slate-500 bg-slate-50"
        }
    ];

    return (
        <section className="py-0 md:py-10 bg-white font-sans overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                
                {/* Header Section */}
                <div className="flex flex-col items-center text-center mb-12 md:mb-20 space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#08B36A]/10 rounded-full">
                        <span className="w-1.5 h-1.5 bg-[#08B36A] rounded-full animate-pulse"></span>
                        <span className="text-[#08B36A] text-[10px] md:text-xs font-black uppercase tracking-widest">Premium Fleet</span>
                    </div>
                    <h2 className="text-3xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
                        Life-Saving <span className="text-[#08B36A]">Equipment</span>
                    </h2>
                    <p className="text-slate-500 max-w-2xl text-[12px] md:text-lg font-medium leading-relaxed">
                        Our units are mini-ICUs on wheels, equipped with the latest medical technology to ensure patient safety.
                    </p>
                </div>

                {/* Features Grid - 2 per row on mobile, 4 on desktop */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8">
                    {features.map((item, index) => (
                        <div key={index} className="group relative">
                            <div className="bg-white p-5 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-[#08B36A]/10 transition-all duration-500 h-full flex flex-col items-center text-center lg:items-start lg:text-left">
                                
                                {/* Icon Square */}
                                <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl ${item.color} flex items-center justify-center text-xl md:text-2xl mb-4 md:mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
                                    {item.icon}
                                </div>

                                <h3 className="text-[14px] md:text-xl font-black text-slate-900 mb-1 md:mb-3 tracking-tight">
                                    {item.title}
                                </h3>
                                
                                <p className="text-slate-500 text-[10px] md:text-sm leading-tight md:leading-relaxed font-medium">
                                    {item.desc}
                                </p>

                                {/* Subtle corner accent */}
                                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="w-1.5 h-1.5 bg-[#08B36A] rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom Trust Banner */}
                <div className="mt-12 md:mt-20 flex flex-wrap justify-center items-center gap-6 md:gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
                    <p className="w-full text-center text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 mb-2 md:mb-4">Standard Certifications</p>
                    <div className="text-xl md:text-2xl font-black text-slate-800">ISO 9001</div>
                    <div className="text-xl md:text-2xl font-black text-slate-800">NABH</div>
                    <div className="text-xl md:text-2xl font-black text-slate-800">WHO-GMP</div>
                    <div className="text-xl md:text-2xl font-black text-slate-800">FDA Approved</div>
                </div>

            </div>
        </section>
    );
}

export default AmbulanceEquipment;