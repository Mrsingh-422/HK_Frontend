"use client";
import React, { useState } from 'react';
import { FaCapsules, FaPrescriptionBottleAlt, FaDatabase } from 'react-icons/fa';
import AllMedicines from './components/AllMedicines';
import MyMedicines from './components/MyMedicines';

export default function MedicineRegistryPage() {
    const [activeTab, setActiveTab] = useState('all');

    return (
        <div className="min-h-screen bg-[#FBFBFE] p-0 lg:p-0 animate-in fade-in duration-500">
            <div className="max-w-7xl mx-auto space-y-4">

                {/* --- HEADER --- */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                                <FaCapsules size={24} />
                            </div>
                            Medicine Registry
                        </h1>
                        <p className="text-gray-500 text-sm mt-2 font-medium">
                            Manage your local pharmacy stock and browse global pharmaceutical data.
                        </p>
                    </div>

                    {/* --- TAB SWITCHER --- */}
                    <div className="bg-gray-100 p-1 rounded-xl flex items-center gap-1 border border-gray-200">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${activeTab === 'all'
                                    ? "bg-white text-emerald-600 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                }`}
                        >
                            <FaDatabase size={14} />
                            Global Inventory
                        </button>
                        <button
                            onClick={() => setActiveTab('mine')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${activeTab === 'mine'
                                    ? "bg-white text-emerald-600 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                }`}
                        >
                            <FaPrescriptionBottleAlt size={14} />
                            My Stock
                        </button>
                    </div>
                </div>

                {/* --- CONTENT AREA --- */}
                <div className="min-h-[600px]">
                    {activeTab === 'all' ? <AllMedicines /> : <MyMedicines />}
                </div>
            </div>
        </div>
    );
}