"use client";

import React from 'react';
import {
    Search,
    MapPin,
    Phone,
    Calendar,
    ShieldCheck,
    Plus,
    Clock,
    Activity,
    Stethoscope,
    FlaskConical,
    Truck
} from 'lucide-react';

const HospitalHero = () => {
    return (
        <section className="relative min-h-[calc(100vh-100px)] pt-10 flex flex-col justify-center overflow-hidden font-sans">

            {/* --- 1. MAIN BACKGROUND IMAGE SECTION --- */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2000&auto=format&fit=crop"
                    alt="Modern Hospital Building"
                    className="w-full h-full object-cover"
                />
                {/* Gradient Overlay for Text Readability */}
                <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-transparent" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-0 pb-12 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

                    {/* --- 2. LEFT CONTENT: TEXT & SEARCH --- */}
                    <div className="lg:col-span-7 space-y-8">

                        {/* Status Tag */}
                        <div className="inline-flex items-center gap-3 px-4 py-2 bg-emerald-50 rounded-full border border-emerald-100 shadow-sm">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#08B36A]"></span>
                            </span>
                            <span className="text-[#08B36A] text-[10px] md:text-xs font-black uppercase tracking-[0.2em]">
                                24/7 Verified Healthcare Network
                            </span>
                        </div>

                        {/* Impact Heading */}
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-slate-900 leading-[0.9] tracking-tighter">
                            Find the Best <br />
                            <span className="text-[#08B36A]">Care</span> for <br />
                            Your Family.
                        </h1>

                        <p className="text-slate-500 text-lg md:text-xl max-w-xl font-medium leading-relaxed">
                            Search and book appointments with 10,000+ top-rated doctors and verified hospitals near you.
                        </p>

                        {/* Search Interface */}
                        <div className="max-w-3xl bg-white p-3 rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100 flex flex-col md:flex-row items-center gap-3">
                            <div className="flex-1 flex items-center px-4 gap-3 w-full border-b md:border-b-0 md:border-r border-slate-100">
                                <Search className="text-[#08B36A] w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Hospital, Doctor, Specialty"
                                    className="bg-transparent border-none outline-none text-sm font-bold text-slate-700 w-full h-12"
                                />
                            </div>
                            <button className="w-full md:w-auto bg-slate-900 text-white px-10 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-[#08B36A] transition-all shadow-xl active:scale-95">
                                Search
                            </button>
                        </div>

                        {/* Trust Statistics */}
                        <div className="flex flex-wrap items-center gap-8 pt-4">
                            <div className="space-y-1">
                                <h3 className="text-2xl font-black text-slate-900">500+</h3>
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Partner Hospitals</p>
                            </div>
                            <div className="w-px h-10 bg-slate-100 hidden sm:block" />
                            <div className="space-y-1">
                                <h3 className="text-2xl font-black text-slate-900">1.2M+</h3>
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Happy Patients</p>
                            </div>
                            <div className="w-px h-10 bg-slate-100 hidden sm:block" />
                            <div className="space-y-1">
                                <h3 className="text-2xl font-black text-slate-900">4.9/5</h3>
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">User Rating</p>
                            </div>
                        </div>
                    </div>

                    {/* --- 3. RIGHT CONTENT: QUICK ACTION CARDS --- */}
                    <div className="lg:col-span-5 grid grid-cols-2 gap-4">
                        <QuickActionCard
                            icon={<Calendar className="w-6 h-6" />}
                            title="Book Appointment"
                            color="bg-emerald-500"
                        />
                        <QuickActionCard
                            icon={<Stethoscope className="w-6 h-6" />}
                            title="Find Specialist"
                            color="bg-blue-500"
                        />
                        <QuickActionCard
                            icon={<FlaskConical className="w-6 h-6" />}
                            title="Lab Tests"
                            color="bg-amber-500"
                        />
                        <QuickActionCard
                            icon={<Truck className="w-6 h-6" />}
                            title="Buy Medicine"
                            color="bg-slate-900"
                        />
                    </div>
                </div>
            </div>

            {/* --- 4. EMERGENCY FLOATING BAR --- */}
            <div className="absolute bottom-10 right-10 z-30">
                <div className="bg-white p-4 rounded-3xl shadow-2xl border border-slate-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-100 animate-pulse">
                        <Phone size={20} />
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Emergency Help</p>
                        <p className="text-lg font-black text-slate-900">102 / 108</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

// --- SUB-COMPONENT FOR ACTION CARDS ---
const QuickActionCard = ({ icon, title, color }) => (
    <div className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-50 flex flex-col items-center justify-center text-center group cursor-pointer hover:shadow-2xl transition-all duration-300 active:scale-95">
        <div className={`w-14 h-14 ${color} text-white rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
            {icon}
        </div>
        <h4 className="text-xs md:text-sm font-black text-slate-900 uppercase tracking-widest px-2">
            {title}
        </h4>
        <div className="mt-4 w-6 h-1 bg-slate-100 rounded-full group-hover:bg-[#08B36A] group-hover:w-10 transition-all" />
    </div>
);

export default HospitalHero;