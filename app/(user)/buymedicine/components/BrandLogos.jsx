"use client";

import React from 'react';
import { FaShieldAlt, FaChevronRight, FaCheckCircle, FaTruck, FaMedkit, FaArrowRight } from 'react-icons/fa';
import { motion } from 'framer-motion';

const BrandLogos = () => {
    // Enhanced Data with hex codes for subtle glow effects
    const brands = [
        { id: 1, name: "Cipla", image: "/logos/cipla.png", color: "hover:border-blue-500", glow: "hover:shadow-blue-500/20" },
        { id: 2, name: "Glenmark", image: "/logos/Glenmark.png", color: "hover:border-red-500", glow: "hover:shadow-red-500/20" },
        { id: 3, name: "Abbott", image: "/logos/Abbott.png", color: "hover:border-sky-400", glow: "hover:shadow-sky-400/20" },
        { id: 5, name: "Sun Pharma", image: "/logos/sun_pharma.png", color: "hover:border-orange-500", glow: "hover:shadow-orange-500/20" }, 
        { id: 6, name: "Mankind", image: "/logos/mankind.png", color: "hover:border-pink-600", glow: "hover:shadow-pink-600/20" },
        { id: 7, name: "Alkem", image: "/logos/alkem.png", color: "hover:border-indigo-900", glow: "hover:shadow-indigo-900/20" },
        { id: 8, name: "GSK", image: "/logos/gsk.png", color: "hover:border-orange-600", glow: "hover:shadow-orange-600/20" },
    ];

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.08 }
        }
    };

    const itemVariants = {
        hidden: { y: 30, opacity: 0 },
        visible: { 
            y: 0, 
            opacity: 1,
            transition: { type: "spring", stiffness: 100 }
        }
    };

    return (
        <section className="relative bg-[#f8fafc] py-24 px-4 overflow-hidden">
            {/* Advanced Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-emerald-100/40 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-blue-100/40 rounded-full blur-[120px]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Section Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
                    <div className="space-y-4">
                        <motion.div 
                            initial={{ x: -20, opacity: 0 }}
                            whileInView={{ x: 0, opacity: 1 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white shadow-sm border border-emerald-100"
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-emerald-800 font-bold uppercase tracking-[0.15em] text-[11px]">Direct From Factory</span>
                        </motion.div>
                        
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                            Trusted by Leading <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
                                Pharma Manufacturers
                            </span>
                        </h2>
                        
                        <p className="text-slate-600 text-lg max-w-2xl leading-relaxed flex items-start gap-3">
                            <span className="mt-1 bg-emerald-100 p-1 rounded-md">
                                <FaShieldAlt className="text-emerald-600 text-sm" />
                            </span>
                            Ensuring every dose is handled with pharmaceutical-grade precision from the world's most reputable laboratories.
                        </p>
                    </div>
                </div>

                {/* Logos Grid */}
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-5"
                >
                    {brands.map((brand) => (
                        <motion.div
                            key={brand.id}
                            variants={itemVariants}
                            whileHover={{ 
                                y: -10,
                                transition: { duration: 0.2 }
                            }}
                            className={`group relative bg-white border border-slate-200/60 rounded-[2rem] p-8 flex flex-col items-center justify-center min-h-[160px] transition-all duration-500 hover:z-20 shadow-sm ${brand.color} ${brand.glow} hover:border-opacity-50`}
                        >
                            {/* Subtle Inner Glow */}
                            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-white to-slate-50/50 -z-10" />
                            
                            {/* Brand Image Container */}
                            <div className="w-full h-16 flex items-center justify-center transition-all duration-500">
                                <img
                                    src={brand.image}
                                    alt={brand.name}
                                    className="max-w-full max-h-full object-contain opacity-60 group-hover:opacity-100 transition-all duration-500 transform"
                                />
                            </div>

                            {/* Name Badge - Refined */}
                            <div className="absolute bottom-4 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                <span className="bg-slate-900 text-white text-[9px] px-3 py-1 rounded-full font-bold uppercase tracking-widest shadow-xl">
                                    {brand.name}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Bottom Trust Note - Glassmorphism Floating Bar */}
                <motion.div 
                    initial={{ y: 50, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    className="mt-20 bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-10 border border-white shadow-[0_20px_50px_rgba(0,0,0,0.05)] flex flex-wrap items-center justify-around gap-10"
                >
                    <div className="flex items-center gap-5 group">
                        <div className="w-14 h-14 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm group-hover:scale-110 transition-transform duration-300">
                            <FaCheckCircle size={24} />
                        </div>
                        <div>
                            <p className="text-[11px] font-black text-emerald-600 uppercase tracking-[2px] mb-1">Authenticity</p>
                            <p className="text-base font-bold text-slate-800">100% Genuine</p>
                        </div>
                    </div>

                    <div className="hidden lg:block w-px h-12 bg-slate-200/60"></div>

                    <div className="flex items-center gap-5 group">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm group-hover:scale-110 transition-transform duration-300">
                            <FaMedkit size={24} />
                        </div>
                        <div>
                            <p className="text-[11px] font-black text-blue-600 uppercase tracking-[2px] mb-1">Safety</p>
                            <p className="text-base font-bold text-slate-800">WHO-GMP Vaults</p>
                        </div>
                    </div>

                    <div className="hidden lg:block w-px h-12 bg-slate-200/60"></div>

                    <div className="flex items-center gap-5 group">
                        <div className="w-14 h-14 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl flex items-center justify-center text-purple-600 shadow-sm group-hover:scale-110 transition-transform duration-300">
                            <FaTruck size={24} />
                        </div>
                        <div>
                            <p className="text-[11px] font-black text-purple-600 uppercase tracking-[2px] mb-1">Logistics</p>
                            <p className="text-base font-bold text-slate-800">Cold-Chain Ready</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default BrandLogos;