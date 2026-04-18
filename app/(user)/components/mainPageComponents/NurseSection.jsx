"use client";
import React from 'react';
import Link from 'next/link';
import { FaStar, FaArrowRight, FaShieldAlt, FaAward, FaUserMd, FaMapMarkerAlt } from 'react-icons/fa';

const nurses = [
    {
        id: 1,
        slug: "sarah-johnson",
        name: "Sarah Johnson",
        specialty: "Critical Care",
        experience: "8 Yrs",
        rating: 4.9,
        image: "https://thumbs.dreamstime.com/b/beautiful-medical-nurse-27010781.jpg",
        location: "Delhi"
    },
    {
        id: 2,
        slug: "michael-chen",
        name: "Michael Chen",
        specialty: "Pediatric",
        experience: "6 Yrs",
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=800",
        location: "Mumbai"
    },
    {
        id: 3,
        slug: "priya-sharma",
        name: "Priya Sharma",
        specialty: "Geriatric Care",
        experience: "10 Yrs",
        rating: 5.0,
        image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=800",
        location: "Bangalore"
    },
    {
        id: 4,
        slug: "david-wilson",
        name: "David Wilson",
        specialty: "Post-Surgical",
        experience: "5 Yrs",
        rating: 4.7,
        image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=800",
        location: "Kolkata"
    }
];

function NurseSection() {
    return (
        <section className="py-10 md:py-20 bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">

                {/* Section Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-16 gap-4 md:gap-6 text-center md:text-left">
                    <div className="max-w-2xl">
                        <span className="text-emerald-600 font-black uppercase tracking-widest text-[10px] md:text-sm mb-2 md:mb-4 block">
                            Our Verified Professionals
                        </span>
                        <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 leading-tight">
                            Meet Our Specialized <span className="text-emerald-600">Nurses</span>
                        </h2>
                    </div>
                    <button className="hidden md:flex bg-white border-2 border-slate-200 px-8 py-4 rounded-2xl font-bold text-slate-600 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all items-center justify-center gap-3">
                        View All Staff <FaArrowRight />
                    </button>
                </div>

                {/* Nurse Grid - grid-cols-2 for Mobile */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8">
                    {nurses.map((nurse) => (
                        <div key={nurse.id} className="group bg-white rounded-[1.5rem] md:rounded-[3rem] p-2.5 md:p-5 border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500">

                            {/* Profile Image Area */}
                            <div className="relative mb-3 md:mb-6">
                                <div className="w-full h-40 sm:h-64 md:h-72 rounded-[1.2rem] md:rounded-[2.5rem] overflow-hidden">
                                    <img
                                        src={nurse.image}
                                        alt={nurse.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                </div>

                                {/* Badges - Scaled down for mobile */}
                                <div className="absolute top-2 left-2 md:top-4 md:left-4 flex flex-col gap-1">
                                    <div className="bg-emerald-600 text-white text-[7px] md:text-[10px] font-black px-1.5 py-0.5 md:px-3 md:py-1.5 rounded-full uppercase tracking-widest flex items-center gap-1 shadow-lg w-fit">
                                        <FaShieldAlt className="hidden xs:block" size={8} /> Verified
                                    </div>
                                </div>

                                {/* Rating - Scaled for mobile */}
                                <div className="absolute bottom-2 right-2 md:bottom-4 md:right-4 bg-white/90 backdrop-blur px-1.5 py-1 md:px-3 md:py-2 rounded-lg md:rounded-2xl shadow-xl flex items-center gap-1">
                                    <FaStar className="text-yellow-400" size={10} />
                                    <span className="font-black text-slate-900 text-[10px] md:text-sm">{nurse.rating}</span>
                                </div>
                            </div>

                            {/* Info Area */}
                            <div className="px-1 md:px-2">
                                <div className="mb-2 md:mb-4">
                                    <h3 className="text-sm md:text-2xl font-black text-slate-900 group-hover:text-emerald-600 transition-colors truncate">
                                        {nurse.name}
                                    </h3>
                                    <p className="text-emerald-600 font-bold text-[9px] md:text-sm tracking-wide uppercase mt-0.5">
                                        {nurse.specialty}
                                    </p>
                                </div>

                                <div className="flex items-center gap-1 text-slate-400 text-[9px] md:text-sm mb-3 md:mb-8">
                                    <FaMapMarkerAlt className="text-slate-300" size={10} />
                                    <span className="font-medium truncate">{nurse.location}</span>
                                    <span className="mx-1">•</span>
                                    <span className="font-bold text-slate-500">{nurse.experience}</span>
                                </div>

                                {/* Main View Profile Button */}
                                <Link
                                    href={`/nurses/${nurse.slug}`}
                                    className="block w-full text-center py-2.5 md:py-5 bg-slate-900 text-white rounded-xl md:rounded-[1.5rem] font-black text-[10px] md:text-lg hover:bg-emerald-600 transition-all flex items-center justify-center gap-1.5 md:gap-3"
                                >
                                    <FaUserMd className="hidden xs:block md:block" />
                                    <span>Profile</span>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Mobile View All Button (Visible only on small screens) */}
                <button className="md:hidden w-full mt-8 bg-white border-2 border-slate-200 py-4 rounded-2xl font-bold text-slate-600 flex items-center justify-center gap-3">
                    View All Staff <FaArrowRight />
                </button>

                {/* Bottom Trust Section */}
                <div className="mt-12 md:mt-24 bg-slate-900 rounded-[2rem] md:rounded-[3rem] p-6 md:p-16 flex flex-col lg:flex-row items-center justify-between gap-6 md:gap-10 text-center lg:text-left">
                    <div>
                        <h2 className="text-xl md:text-4xl font-black text-white mb-2 md:mb-4 leading-tight">
                            Are you a Certified Nurse?
                        </h2>
                        <p className="text-slate-400 text-sm md:text-lg">
                            Join our network and start providing care in your city.
                        </p>
                    </div>
                    <button className="w-full lg:w-auto whitespace-nowrap bg-emerald-500 text-white px-8 md:px-10 py-4 md:py-5 rounded-xl md:rounded-[2rem] font-black text-base md:text-xl hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-900/20">
                        Join Us
                    </button>
                </div>
            </div>
        </section>
    );
}

export default NurseSection;