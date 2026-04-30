"use client";

import React from 'react';
import { Check, Shield, Zap, Heart, ArrowRight, Star } from 'lucide-react';
import { toast } from 'react-hot-toast';

const PLANS = [
    {
        id: 'basic',
        name: "Basic Annual Care",
        price: "12,999",
        tagline: "Foundation for Health",
        theme: "slate",
        icon: <Shield size={24} />,
        bg: "bg-slate-50",
        border: "border-slate-200",
        text: "text-slate-700",
        accent: "bg-slate-600",
        shadow: "hover:shadow-slate-200",
        features: ["2 Monthly Nursing Visits", "Vitals Monitoring", "Digital Health Vault", "4 Tele-Consultations"]
    },
    {
        id: 'optimal',
        name: "Optimal Annual Plan",
        price: "24,500",
        tagline: "Most Popular Choice",
        theme: "emerald",
        icon: <Zap size={24} />,
        bg: "bg-emerald-50/50",
        border: "border-emerald-500",
        text: "text-emerald-700",
        accent: "bg-emerald-500",
        shadow: "shadow-2xl shadow-emerald-200",
        popular: true,
        features: ["Weekly Nursing Visits", "Medication Management", "Priority Response", "Unlimited Consults", "Basic Physiotherapy"]
    },
    {
        id: 'comprehensive',
        name: "Comprehensive Plan",
        price: "48,999",
        tagline: "Total Medical Shield",
        theme: "indigo",
        icon: <Heart size={24} />,
        bg: "bg-indigo-50/50",
        border: "border-indigo-200",
        text: "text-indigo-700",
        accent: "bg-indigo-600",
        shadow: "hover:shadow-indigo-200",
        features: ["Daily Nursing Support", "24/7 Emergency Line", "Post-Op Recovery Care", "Dedicated Coordinator", "Free Lab Collections"]
    }
];

function NursingPlans() {
    const handleBuy = (name) => {
        toast.success(`Initializing secure checkout for ${name}`);
    };

    return (
        <section className="min-h-screen bg-[#FDFEFF] flex items-center py-16 md:py-24">
            <div className="max-w-7xl mx-auto px-6 w-full">

                {/* --- HEADER --- */}
                <div className="text-center mb-12 md:mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 mb-4">
                        <Star size={12} className="text-amber-500 fill-amber-500" />
                        <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Premium Home Healthcare</span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                        Select Your <span className="text-emerald-500 text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-emerald-700">Annual Protection</span>
                    </h2>
                </div>

                {/* --- PRICING GRID --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 lg:gap-8 items-stretch">
                    {PLANS.map((plan) => (
                        <div
                            key={plan.id}
                            className={`relative flex flex-col rounded-[2rem] md:rounded-[2.5rem] border p-7 lg:p-8 transition-all duration-500 group overflow-hidden ${plan.bg} ${plan.border} ${plan.shadow} ${plan.popular ? 'md:scale-105 z-10 shadow-xl' : 'md:scale-95 opacity-100 md:opacity-90 hover:opacity-100'}`}
                        >
                            {/* Popular Badge */}
                            {plan.popular && (
                                <div className="absolute top-0 right-0 bg-emerald-500 text-white px-5 py-2 rounded-bl-2xl text-[10px] font-black uppercase tracking-widest">
                                    Best Value
                                </div>
                            )}

                            {/* Icon & Title */}
                            <div className="mb-6">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-500 group-hover:rotate-6 bg-white shadow-sm ${plan.text}`}>
                                    {plan.icon}
                                </div>
                                <p className={`text-[10px] font-black uppercase tracking-widest mb-1 opacity-70 ${plan.text}`}>
                                    {plan.tagline}
                                </p>
                                <h3 className="text-2xl font-black text-slate-900 leading-tight">
                                    {plan.name}
                                </h3>
                            </div>

                            {/* Price */}
                            <div className="mb-6 border-b border-slate-200/50 pb-6">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl lg:text-4xl font-black text-slate-900">₹{plan.price}</span>
                                    <span className="text-slate-400 font-bold text-xs uppercase">/ Year</span>
                                </div>
                                <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-tighter">Billed annually • Inclusive of GST</p>
                            </div>

                            {/* Feature List */}
                            <div className="space-y-4 mb-8 flex-1">
                                {plan.features.map((feature, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 bg-white shadow-sm mt-0.5`}>
                                            <Check size={12} className={plan.text} />
                                        </div>
                                        <span className="text-slate-600 text-sm font-bold leading-tight">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Buy Button */}
                            <button
                                onClick={() => handleBuy(plan.name)}
                                className={`w-full py-4 lg:py-5 rounded-2xl font-black text-[11px] lg:text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all active:scale-95 text-white shadow-lg ${plan.accent} hover:brightness-110`}
                            >
                                Activate Plan <ArrowRight size={14} />
                            </button>
                        </div>
                    ))}
                </div>

                {/* --- FOOTER INFO --- */}
                <div className="mt-12 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10 opacity-60">
                    <div className="flex items-center gap-2">
                        <Shield size={16} className="text-slate-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Secure Payment</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Check size={16} className="text-slate-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Cancel Anytime</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Heart size={16} className="text-slate-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">24/7 Support</span>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default NursingPlans;