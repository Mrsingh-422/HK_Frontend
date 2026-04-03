'use client';

import React, { useState } from 'react';
import { FaHome, FaUserNurse, FaStethoscope, FaFlask, FaImages } from 'react-icons/fa';

// Import the sub-components
import ManageHomeBanners from './components/ManageHomeBanners';
import ManageNursingBanners from './components/ManageNursingBanners';
import ManageDoctorBanners from './components/ManageDoctorBanners';
import ManageLabBanners from './components/ManageLabBanners';

export default function AppBannersPage() {
    const [activeTab, setActiveTab] = useState('home');

    const navItems = [
        { id: 'home', label: 'Home Screen', icon: <FaHome /> },
        { id: 'nursing', label: 'Home Nursing', icon: <FaUserNurse /> },
        { id: 'doctor', label: 'Doctors Desk', icon: <FaStethoscope /> },
        { id: 'lab', label: 'Lab Reports', icon: <FaFlask /> },
    ];

    const renderActiveComponent = () => {
        switch (activeTab) {
            case 'home': return <ManageHomeBanners />
            case 'nursing': return <ManageNursingBanners />
            case 'doctor': return <ManageDoctorBanners />
            case 'lab': return <ManageLabBanners />
            default: return <ManageHomeBanners />
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-6 font-sans text-slate-900">
            {/* --- HEADER --- */}
            <div className="max-w-7xl mx-auto flex items-center gap-4 mb-8 px-2">
                <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 text-[#08B36A]">
                    <FaImages size={24} />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase leading-none">App Media Center</h1>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">Manage all carousel graphics</p>
                </div>
            </div>

            {/* --- NAVIGATION TABS --- */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap md:flex-nowrap gap-1">
                    {navItems.map((item) => {
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`
                                    flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl 
                                    text-[11px] font-black uppercase tracking-widest transition-all duration-300
                                    ${isActive
                                        ? 'bg-slate-900 text-white shadow-lg scale-[1.02]'
                                        : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}
                                `}
                            >
                                <span className={`text-base ${isActive ? 'text-[#08B36A]' : ''}`}>
                                    {item.icon}
                                </span>
                                {item.label}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* --- COMPONENT AREA --- */}
            <div className="max-w-7xl mx-auto">
                {renderActiveComponent()}
            </div>
        </div>
    )
}