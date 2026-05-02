"use client";

import React, { useState, useEffect } from 'react';
import { FaMicroscope, FaPills, FaLock, FaExclamationCircle } from 'react-icons/fa';
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import LabCart from './components/LabCart';
import PharmacyCart from './components/PharmacyCart';

const CartPage = () => {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('lab');
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showNotification, setShowNotification] = useState(false);

    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem('userToken');

            if (!token) {
                // Show the notification first
                setShowNotification(true);

                // Delay the redirect so the user can see the message
                setTimeout(() => {
                    router.push('/');
                }, 3000);
            } else {
                setIsAuthorized(true);
                setIsLoading(false);
            }
        };

        checkAuth();
    }, [router]);

    // 1. Loading State
    if (isLoading && !showNotification) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-emerald-500 border-solid border-gray-200 mb-4"></div>
                <p className="text-slate-500 font-bold animate-pulse text-sm uppercase tracking-widest">Verifying Session...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] relative">

            {/* NOTIFICATION TOAST */}
            <AnimatePresence>
                {showNotification && (
                    <motion.div
                        initial={{ opacity: 0, y: -100 }}
                        animate={{ opacity: 1, y: 20 }}
                        exit={{ opacity: 0, y: -100 }}
                        className="fixed top-0 left-0 right-0 z-[100] flex justify-center px-4 pointer-events-none"
                    >
                        <div className="bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-white/10 max-w-md w-full pointer-events-auto">
                            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <FaExclamationCircle className="text-white text-xl" />
                            </div>
                            <div className="flex-1">
                                <p className="font-black text-sm uppercase tracking-wide">Login Required</p>
                                <p className="text-slate-400 text-xs">Please login to access your cart. Redirecting...</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Cart UI (Only visible if authorized) */}
            {isAuthorized && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    {/* Header Section */}
                    <div className="bg-white border-b border-slate-100">
                        <div className="max-w-7xl mx-auto px-4 pt-10 pb-6">
                            <div className="flex items-center justify-between mb-6">
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Shopping Cart</h1>
                                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                    <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Secure Session</span>
                                </div>
                            </div>

                            {/* Tab Switcher */}
                            <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full max-w-md">
                                <button
                                    onClick={() => setActiveTab('lab')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'lab'
                                        ? "bg-white text-emerald-600 shadow-sm"
                                        : "text-slate-500 hover:text-slate-700"
                                        }`}
                                >
                                    <FaMicroscope /> Lab Tests
                                </button>
                                <button
                                    onClick={() => setActiveTab('pharmacy')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'pharmacy'
                                        ? "bg-white text-blue-600 shadow-sm"
                                        : "text-slate-500 hover:text-slate-700"
                                        }`}
                                >
                                    <FaPills /> Pharmacy
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Dynamic Content */}
                    <div className="max-w-7xl mx-auto px-4">
                        {activeTab === 'lab' ? <LabCart /> : <PharmacyCart />}
                    </div>
                </motion.div>
            )}

            {/* BLUR OVERLAY (Visible during notification/redirect) */}
            {showNotification && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-[90]"></div>
            )}
        </div>
    );
};

export default CartPage;