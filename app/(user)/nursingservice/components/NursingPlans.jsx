"use client";

import React, { useEffect, useState } from 'react';
import { Check, Shield, Zap, Heart, ArrowRight, Star, Loader2, Gem } from 'lucide-react';
import { toast } from 'react-hot-toast';
import UserAPI from '../../../services/UserAPI'; // Adjust this path to your actual API file

// Utility to dynamically load Razorpay
const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        if (window.Razorpay) {
            resolve(true);
            return;
        }
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

const THEMES = [
    {
        theme: "slate",
        icon: <Shield size={24} />,
        bg: "bg-slate-50",
        border: "border-slate-200",
        text: "text-slate-700",
        accent: "bg-slate-600",
        shadow: "hover:shadow-slate-200",
    },
    {
        theme: "emerald",
        icon: <Zap size={24} />,
        bg: "bg-emerald-50/50",
        border: "border-emerald-500",
        text: "text-emerald-700",
        accent: "bg-emerald-500",
        shadow: "shadow-2xl shadow-emerald-200",
        popular: true,
    },
    {
        theme: "indigo",
        icon: <Heart size={24} />,
        bg: "bg-indigo-50/50",
        border: "border-indigo-200",
        text: "text-indigo-700",
        accent: "bg-indigo-600",
        shadow: "hover:shadow-indigo-200",
    }
];

function NursingPlans() {
    const [plans, setPlans] = useState([]);
    const [userStatus, setUserStatus] = useState(null); // Stores current active plan info
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);

    // 1. Fetch Plans and User Subscription Status on Mount
    useEffect(() => {
        const initData = async () => {
            try {
                setLoading(true);
                // Parallel fetch for better performance
                const [plansRes, statusRes] = await Promise.all([
                    UserAPI.listAvailablePlans("Elder Care"),
                    UserAPI.getMySubscriptionStatus()
                ]);

                if (plansRes.success) setPlans(plansRes.data);
                if (statusRes.success && statusRes.hasActivePlan) {
                    setUserStatus(statusRes.data);
                }
            } catch (error) {
                console.error("Initialization error:", error);
                toast.error("Failed to load data");
            } finally {
                setLoading(false);
            }
        };

        initData();
    }, []);

    // 2. Handle Purchase Flow
    const handleBuy = async (plan) => {
        // Prevent purchase if user already has an active plan
        if (userStatus) {
            toast.error("You already have an active subscription.");
            return;
        }

        try {
            setProcessingId(plan._id);
            
            // Ensure Razorpay is loaded
            const isLoaded = await loadRazorpayScript();
            if (!isLoaded) {
                toast.error("Razorpay SDK failed to load. Check your connection.");
                return;
            }

            // Step A: Initiate Purchase on Backend
            const orderRes = await UserAPI.buySubscriptionPlan(plan._id);
            
            if (!orderRes.success) {
                throw new Error(orderRes.message);
            }

            // Step B: Configure Razorpay Options
            const options = {
                key: orderRes.key_id,
                amount: orderRes.amount,
                currency: "INR",
                name: "HK Healthcare",
                description: `Activation for ${plan.name}`,
                order_id: orderRes.razorpayOrderId,
                handler: async function (response) {
                    // Step C: Verify Payment on Success
                    try {
                        setProcessingId(plan._id); // Keep loader active during verification
                        const verifyRes = await UserAPI.verifySubscriptionPayment({
                            subscriptionId: orderRes.subscriptionId,
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature
                        });

                        if (verifyRes.success) {
                            toast.success("Subscription Activated Successfully!");
                            // Refresh page to show updated status
                            window.location.reload(); 
                        }
                    } catch (err) {
                        toast.error("Payment verification failed.");
                    } finally {
                        setProcessingId(null);
                    }
                },
                prefill: {
                    name: "User", // Ideally pull from your Auth context
                    email: "user@example.com"
                },
                theme: { color: "#10b981" },
                modal: {
                    ondismiss: function() {
                        setProcessingId(null);
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (error) {
            console.error(error);
            toast.error(error.message || "Could not initiate checkout");
            setProcessingId(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
            </div>
        );
    }

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
                    {userStatus && (
                        <p className="mt-4 text-emerald-600 font-bold text-sm">
                            You are currently subscribed to the <span className="underline">{userStatus.planId.name}</span>
                        </p>
                    )}
                </div>

                {/* --- PRICING GRID --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 lg:gap-8 items-stretch">
                    {plans.map((plan, index) => {
                        const ui = THEMES[index % THEMES.length];
                        const isCurrentPlan = userStatus?.planId?._id === plan._id;
                        
                        return (
                            <div
                                key={plan._id}
                                className={`relative flex flex-col rounded-[2rem] md:rounded-[2.5rem] border p-7 lg:p-8 transition-all duration-500 group overflow-hidden ${ui.bg} ${ui.border} ${ui.shadow} ${ui.popular ? 'md:scale-105 z-10 shadow-xl' : 'md:scale-95 opacity-100 md:opacity-90 hover:opacity-100'}`}
                            >
                                {/* Badges */}
                                {isCurrentPlan ? (
                                    <div className="absolute top-0 right-0 bg-slate-900 text-white px-5 py-2 rounded-bl-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                        <Gem size={10} className="text-emerald-400" /> Current Plan
                                    </div>
                                ) : ui.popular && (
                                    <div className="absolute top-0 right-0 bg-emerald-500 text-white px-5 py-2 rounded-bl-2xl text-[10px] font-black uppercase tracking-widest">
                                        Best Value
                                    </div>
                                )}

                                <div className="mb-6">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-500 group-hover:rotate-6 bg-white shadow-sm ${ui.text}`}>
                                        {ui.icon}
                                    </div>
                                    <p className={`text-[10px] font-black uppercase tracking-widest mb-1 opacity-70 ${ui.text}`}>
                                        {plan.planType}
                                    </p>
                                    <h3 className="text-2xl font-black text-slate-900 leading-tight">
                                        {plan.name}
                                    </h3>
                                </div>

                                <div className="mb-6 border-b border-slate-200/50 pb-6">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl lg:text-4xl font-black text-slate-900">₹{plan.price}</span>
                                        <span className="text-slate-400 font-bold text-xs uppercase">/ {plan.validityInDays} Days</span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-tighter">Billed once • Inclusive of GST</p>
                                </div>

                                <div className="space-y-4 mb-8 flex-1">
                                    {(Array.isArray(plan.features) ? plan.features : []).map((feature, i) => (
                                        <div key={i} className="flex items-start gap-3">
                                            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 bg-white shadow-sm mt-0.5`}>
                                                <Check size={12} className={ui.text} />
                                            </div>
                                            <span className="text-slate-600 text-sm font-bold leading-tight">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    disabled={processingId !== null || isCurrentPlan}
                                    onClick={() => handleBuy(plan)}
                                    className={`w-full py-4 lg:py-5 rounded-2xl font-black text-[11px] lg:text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all active:scale-95 text-white shadow-lg 
                                    ${isCurrentPlan ? 'bg-slate-300 cursor-default' : `${ui.accent} hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed`}`}
                                >
                                    {processingId === plan._id ? (
                                        <Loader2 className="animate-spin" size={14} />
                                    ) : isCurrentPlan ? (
                                        "Plan Active"
                                    ) : (
                                        <>Activate Plan <ArrowRight size={14} /></>
                                    )}
                                </button>
                            </div>
                        );
                    })}
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