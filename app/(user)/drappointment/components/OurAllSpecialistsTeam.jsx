"use client";

import React, { useState } from "react";
import { FaArrowLeft, FaArrowRight, FaFacebookF, FaTwitter, FaPhoneAlt, FaStar, FaCheckCircle, FaArrowUp } from "react-icons/fa";

const team = [
    {
        id: 1,
        name: "Dr. Arshdeep Singh",
        specialty: "Cardiology",
        desc: "Pioneer in non-invasive cardiac imaging and therapeutic recovery.",
        image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=400&q=80",
        rating: 4.9,
        status: "Online"
    },
    {
        id: 2,
        name: "Dr. Mehak Sharma",
        specialty: "Critical Care",
        desc: "Lead specialist in emergency medicine and trauma management systems.",
        image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=400&q=80",
        rating: 4.8,
        status: "In Clinic"
    },
    {
        id: 3,
        name: "Dr. Rahul Verma",
        specialty: "Neurology",
        desc: "Expert in neuro-regenerative treatments and complex spinal disorders.",
        image: "https://images.unsplash.com/photo-1559839734-2b71f1536783?auto=format&fit=crop&w=400&q=80",
        rating: 4.7,
        status: "Online"
    },
    {
        id: 4,
        name: "Dr. Karan Mehra",
        specialty: "Oncology",
        desc: "Focused on precision medicine and advanced robotic surgical procedures.",
        image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80",
        rating: 4.9,
        status: "Busy"
    },
    {
        id: 5,
        name: "Dr. Priya Gupta",
        specialty: "Pediatrics",
        desc: "Compassionate care specializing in neonatal health and development.",
        image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&q=80",
        rating: 5.0,
        status: "Online"
    },
];

const displayTeam = [...team, ...team];

function OurAllSpecialistsTeam() {
    const [isPaused, setIsPaused] = useState(false);

    return (
        <div className="py-20 md:py-32 overflow-hidden font-sans bg-[#FDFEFF] relative">
            {/* Ambient Studio Lighting Background */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-50/40 rounded-full blur-[120px] -mr-80 -mt-80" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-slate-50 rounded-full blur-[100px] -ml-60 -mb-60" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                {/* --- Section Header --- */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-20">
                    <div className="max-w-2xl space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="h-1.5 w-12 bg-[#08B36A] rounded-full"></span>
                            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-[#08B36A]">Verified Specialists</span>
                        </div>
                        <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-[1.1]">
                            Happy To <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#08B36A] to-emerald-800">Help You.</span>
                        </h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="w-16 h-16 rounded-full border border-slate-100 bg-white flex items-center justify-center text-slate-400 hover:text-[#08B36A] hover:border-[#08B36A] hover:shadow-2xl hover:shadow-emerald-100 transition-all duration-500">
                            <FaArrowLeft size={16} />
                        </button>
                        <button className="w-16 h-16 rounded-full border border-slate-100 bg-white flex items-center justify-center text-slate-400 hover:text-[#08B36A] hover:border-[#08B36A] hover:shadow-2xl hover:shadow-emerald-100 transition-all duration-500">
                            <FaArrowRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* --- Marquee Wrapper --- */}
            <div
                className="relative w-full cursor-grab active:cursor-grabbing"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
            >
                <div
                    className="flex gap-10 md:gap-14 animate-team-marquee"
                    style={{
                        animationPlayState: isPaused ? 'paused' : 'running',
                        width: 'max-content'
                    }}
                >
                    {displayTeam.map((member, index) => (
                        <div
                            key={`${member.id}-${index}`}
                            className="w-[320px] md:w-[400px] flex-shrink-0 group relative"
                        >
                            {/* Card Container */}
                            <div className="bg-white rounded-[3.5rem] p-4 border border-slate-50 shadow-[0_30px_80px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_50px_100px_-20px_rgba(8,179,106,0.15)] transition-all duration-700">
                                
                                {/* Image Portrait Section */}
                                <div className="relative aspect-[4/5] rounded-[2.8rem] overflow-hidden bg-slate-100 mb-8">
                                    <img
                                        src={member.image}
                                        alt={member.name}
                                        className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110 grayscale-[30%] group-hover:grayscale-0"
                                    />
                                    
                                    {/* Status Glass Badge */}
                                    <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center gap-2 shadow-lg border border-white/50">
                                        <div className={`w-2 h-2 rounded-full animate-pulse ${member.status === 'Online' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                        <span className="text-[10px] font-black uppercase text-slate-900 tracking-widest">{member.status}</span>
                                    </div>

                                    {/* Floating Social Dock (Appears on Hover) */}
                                    <div className="absolute inset-x-0 bottom-6 px-6 flex justify-center translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                                        <div className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-3xl p-2 flex gap-2 shadow-2xl">
                                            {[<FaFacebookF />, <FaTwitter />, <FaPhoneAlt />].map((icon, i) => (
                                                <div key={i} className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-slate-900 hover:bg-[#08B36A] hover:text-white transition-all duration-300 cursor-pointer shadow-sm">
                                                    {icon}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Info Content */}
                                <div className="px-6 pb-6 text-center space-y-4">
                                    <div className="space-y-1">
                                        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#08B36A]">
                                            {member.specialty} Specialist
                                        </p>
                                        <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
                                            {member.name}
                                        </h3>
                                    </div>

                                    <p className="text-slate-500 text-sm font-medium leading-relaxed line-clamp-2 px-2">
                                        {member.desc}
                                    </p>

                                    <div className="pt-4 flex items-center justify-between">
                                        <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-full">
                                            <FaStar className="text-amber-400 text-xs" />
                                            <span className="text-xs font-black text-emerald-900">{member.rating}</span>
                                        </div>
                                        
                                        <button className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-slate-900 group-hover:text-[#08B36A] transition-all">
                                            Book Appt <FaArrowUp className="rotate-45" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* --- Global CTA --- */}
            <div className="mt-24 flex flex-col items-center">
                <button className="bg-slate-900 text-white px-16 py-6 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl hover:bg-[#08B36A] transition-all active:scale-95 hover:-translate-y-1">
                    See All 50+ Specialists
                </button>
                <div className="mt-10 flex items-center gap-4">
                    <div className="flex -space-x-3">
                        {[1,2,3,4].map(i => (
                            <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-slate-200 overflow-hidden shadow-sm">
                                <img src={`https://i.pravatar.cc/100?img=${i+30}`} alt="user" />
                            </div>
                        ))}
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Trusted by <span className="text-slate-900">12,000+</span> Satisfied Patients
                    </p>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes team-marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-team-marquee {
                    animation: team-marquee 60s linear infinite;
                }
                .animate-team-marquee:hover {
                    animation-play-state: paused;
                }
                @media (max-width: 768px) {
                    .animate-team-marquee {
                        animation: team-marquee 35s linear infinite;
                    }
                }
                `
            }} />
        </div>
    );
}

export default OurAllSpecialistsTeam;