import React from 'react';
import { FaMicroscope, FaVials, FaHome, FaClock } from 'react-icons/fa';

function HowItWorks() {
    const steps = [
        {
            id: 1,
            title: "Helpful Test Tips",
            desc: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Minus hic, nobis mollitia eveniet molestias tempora est praesentium nesciunt reprehenderit.",
            icon: <FaMicroscope className="text-blue-500" />,
            bgColor: "bg-blue-50"
        },
        {
            id: 2,
            title: "Get Your Results in Few Hours",
            desc: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Minus hic, nobis mollitia eveniet molestias tempora est praesentium nesciunt reprehenderit.",
            icon: <FaClock className="text-red-400" />,
            bgColor: "bg-red-50"
        },
        {
            id: 3,
            title: "Tests At Home",
            desc: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Minus hic, nobis mollitia eveniet molestias tempora est praesentium nesciunt reprehenderit.",
            icon: <FaVials className="text-emerald-500" />,
            bgColor: "bg-emerald-50"
        }
    ];

    return (
        <section className="py-16 md:py-15 bg-white">
            <div className="max-w-7xl mx-auto px-6">

                {/* Section Heading */}
                <div className="text-center mb-16 md:mb-20">
                    <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
                        How it Works
                    </h2>
                    <div className="w-16 h-1.5 bg-emerald-500 mx-auto mt-4 rounded-full"></div>
                </div>

                {/* Steps Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
                    {steps.map((step) => (
                        <div key={step.id} className="group flex flex-col items-center text-center">

                            {/* Icon Container */}
                            <div className={`w-24 h-24 md:w-32 md:h-32 ${step.bgColor} rounded-3xl flex items-center justify-center text-4xl md:text-5xl mb-8 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-inner`}>
                                {step.icon}
                            </div>

                            {/* Text Content */}
                            <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-4">
                                {step.title}
                            </h3>

                            <p className="text-slate-500 leading-relaxed text-sm md:text-base max-w-sm">
                                {step.desc}
                            </p>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
}

export default HowItWorks;