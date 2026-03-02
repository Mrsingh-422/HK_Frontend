import React, { useState } from "react";
import { FaArrowLeft, FaArrowRight, FaFacebookF, FaTwitter, FaPhoneAlt } from "react-icons/fa";

const team = [
    {
        id: 1,
        name: "HkDoctor",
        specialty: "Heart Specialist",
        desc: "They diagnose, educate, and treat patients to ensure that they have the best possible care.",
        image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=400&q=80",
    },
    {
        id: 2,
        name: "Pgi Doctor",
        specialty: "Emergency Medicine",
        desc: "They diagnose, educate, and treat patients to ensure that they have the best possible care.",
        image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&q=80",
    },
    {
        id: 3,
        name: "Dr. Sahib",
        specialty: "Heart Specialist",
        desc: "They diagnose, educate, and treat patients to ensure that they have the best possible care.",
        image: "https://images.unsplash.com/photo-1559839734-2b71f1536783?auto=format&fit=crop&w=400&q=80",
    },
    {
        id: 4,
        name: "Dr. Karan",
        specialty: "General Surgeon",
        desc: "They diagnose, educate, and treat patients to ensure that they have the best possible care.",
        image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80",
    },
    {
        id: 5,
        name: "Dr. Megha",
        specialty: "Pediatrician",
        desc: "They diagnose, educate, and treat patients to ensure that they have the best possible care.",
        image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=400&q=80",
    },
];

// Double the array for infinite scroll
const displayTeam = [...team, ...team];

function OurAllSpecialistsTeam() {
    const [isPaused, setIsPaused] = useState(false);

    return (
        <div className="py-12 md:py-15 overflow-hidden font-sans">
            <div className="max-w-7xl mx-auto px-4 text-center mb-10 md:mb-16">
                {/* Header with Arrows */}
                <div className="flex items-center justify-center gap-4 mb-2">
                    <FaArrowLeft className="text-[#08B36A] cursor-pointer hover:scale-110 transition-transform" />
                    <span className="text-[#08B36A] font-bold text-lg md:text-xl tracking-wide">Our's All Specialists Team</span>
                    <FaArrowRight className="text-[#08B36A] cursor-pointer hover:scale-110 transition-transform" />
                </div>

                {/* Main Title */}
                <h2 className="text-3xl md:text-6xl font-black text-slate-800 tracking-tight">
                    We Are Happy To Help You
                </h2>
            </div>

            {/* Marquee Wrapper */}
            <div
                className="relative w-full cursor-pointer touch-pan-y"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                onTouchStart={() => setIsPaused(true)}
                onTouchEnd={() => setIsPaused(false)}
            >
                <div
                    className="flex gap-4 md:gap-8 animate-team-marquee"
                    style={{
                        animationPlayState: isPaused ? 'paused' : 'running',
                        width: 'max-content'
                    }}
                >
                    {displayTeam.map((member, index) => (
                        <div
                            key={`${member.id}-${index}`}
                            className="w-[260px] sm:w-[280px] md:w-[320px] flex-shrink-0 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group"
                        >
                            {/* Doctor Image */}
                            <div className="h-44 sm:h-52 md:h-60 bg-slate-100 overflow-hidden">
                                <img
                                    src={member.image}
                                    alt={member.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                            </div>

                            {/* Content */}
                            <div className="p-5 md:p-6 text-center space-y-3">
                                <h3 className="text-xl font-black text-slate-800 leading-tight">
                                    {member.name}
                                </h3>

                                <p className="text-[#08B36A] font-bold text-sm uppercase tracking-widest">
                                    {member.specialty}
                                </p>

                                <p className="text-slate-500 text-xs md:text-sm leading-relaxed line-clamp-3 px-2">
                                    {member.desc}
                                </p>

                                <div className="pt-2">
                                    <button className="bg-[#08B36A] hover:bg-slate-900 text-white font-bold py-2.5 px-8 rounded-lg transition-all shadow-md active:scale-95 text-xs uppercase tracking-wider">
                                        Appoint Now
                                    </button>
                                </div>

                                {/* Social Footer */}
                                <div className="flex items-center justify-center gap-6 pt-4 border-t border-slate-50 mt-4 text-slate-400 group-hover:text-[#08B36A] transition-colors">
                                    <FaFacebookF className="cursor-pointer hover:scale-125 transition-transform" />
                                    <FaTwitter className="cursor-pointer hover:scale-125 transition-transform" />
                                    <FaPhoneAlt className="cursor-pointer hover:scale-125 transition-transform" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Animation Styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes team-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-team-marquee {
          animation: team-marquee 30s linear infinite;
        }
        @media (max-width: 768px) {
          .animate-team-marquee {
            animation: team-marquee 20s linear infinite;
          }
        }
      `}} />
        </div>
    );
}

export default OurAllSpecialistsTeam;