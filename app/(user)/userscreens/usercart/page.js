"use client";

import React, { useState } from 'react';
import { FaMicroscope, FaPills } from 'react-icons/fa';
import LabCart from './components/LabCart';
import PharmacyCart from './components/PharmacyCart';

const CartPage = () => {
    const [activeTab, setActiveTab] = useState('lab'); // 'lab' or 'pharmacy'

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            {/* Header Section */}
            <div className="bg-white border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-4 pt-10 pb-6">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-6">Shopping Cart</h1>
                    
                    {/* Tab Switcher */}
                    <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full max-w-md">
                        <button 
                            onClick={() => setActiveTab('lab')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                                activeTab === 'lab' 
                                ? "bg-white text-emerald-600 shadow-sm" 
                                : "text-slate-500 hover:text-slate-700"
                            }`}
                        >
                            <FaMicroscope /> Lab Tests
                        </button>
                        <button 
                            onClick={() => setActiveTab('pharmacy')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                                activeTab === 'pharmacy' 
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
            <div className="max-w-7xl mx-auto">
                {activeTab === 'lab' ? <LabCart /> : <PharmacyCart />}
            </div>
        </div>
    );
};

export default CartPage;