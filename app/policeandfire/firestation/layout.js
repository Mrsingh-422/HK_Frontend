'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
    FaPlusSquare,
    FaMapMarkedAlt,
    FaHistory,
    FaCog,
    FaChevronLeft,
    FaChevronRight,
    FaFire 
} from "react-icons/fa";
import FireStationTopBar from './components/topbarfirestation'; 

export default function FireStationLayout({ children }) {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const pathname = usePathname()

    const menuItems = [
        { 
            name: 'New Incidents', 
            href: '/policeandfire/firestation/newincidents', 
            icon: FaPlusSquare 
        },
        { 
            name: 'Ongoing Operations', 
            href: '/policeandfire/firestation/ongoingoperations', 
            icon: FaMapMarkedAlt 
        },
        { 
            name: 'Incident History', 
            href: '/policeandfire/firestation/incidenthistory', 
            icon: FaHistory 
        },
        { 
            name: 'Settings', 
            href: '/policeandfire/firestation/settings', 
            icon: FaCog 
        },
    ];

    return (
        <div className="h-screen w-full bg-gray-50 flex overflow-hidden font-sans">
            {/* --- SIDEBAR --- */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 flex flex-col h-full
                transition-all duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
                lg:translate-x-0 lg:static lg:inset-0
                ${isCollapsed ? 'w-20' : 'w-72'} 
            `}>
                {/* 🌟 LOGO AREA (Updated to Green) 🌟 */}
                <div className="p-4 border-b border-gray-50 flex items-center justify-center min-h-[80px] flex-shrink-0">
                    <Link href="/policeandfire/firestation/newincidents" className="flex items-center justify-center">
                        <div className={`flex items-center justify-center rounded-xl bg-[#08B36A] text-white shadow-lg shadow-green-100 ${isCollapsed ? 'w-10 h-10' : 'w-10 h-10 mr-3'}`}>
                            <FaFire size={20} />
                        </div>
                        {!isCollapsed && (
                            <div className="flex flex-col">
                                <span className="font-black text-slate-800 text-lg tracking-tight leading-none uppercase">Fire</span>
                                <span className="font-bold text-[#08B36A] text-[10px] uppercase tracking-[0.2em] mt-1">Station</span>
                            </div>
                        )}
                    </Link>
                </div>

                {/* Navigation Links (Updated to Green) */}
                <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`
                                    flex items-center rounded-2xl transition-all duration-200 group
                                    ${isCollapsed ? 'justify-center p-4' : 'gap-4 px-6 py-4'}
                                    ${isActive
                                        ? 'bg-[#08B36A] text-white shadow-xl shadow-green-100 font-bold'
                                        : 'text-slate-400 hover:bg-green-50 hover:text-[#08B36A]'
                                    }
                                `}
                            >
                                <item.icon className={`text-xl shrink-0 ${isActive ? 'text-white' : 'group-hover:text-[#08B36A]'}`} />
                                {!isCollapsed && (
                                    <span className="whitespace-nowrap text-[11px] tracking-[0.1em] uppercase font-black">{item.name}</span>
                                )}
                            </Link>
                        )
                    })}
                </nav>

                {/* Sidebar Bottom Toggle (Updated to Green) */}
                <div className="p-6 border-t border-gray-100 flex justify-center lg:flex hidden flex-shrink-0">
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-[#08B36A] hover:text-white transition-all flex items-center justify-center shadow-sm"
                    >
                        {isCollapsed ? <FaChevronRight size={14} /> : <FaChevronLeft size={14} />}
                    </button>
                </div>
            </aside>

            {/* --- MAIN SECTION --- */}
            <div className="flex-1 flex flex-col h-screen min-w-0">
                {/* Fire Station TopBar */}
                <FireStationTopBar 
                    onMobileMenuClick={() => setSidebarOpen(true)} 
                    isCollapsed={isCollapsed} 
                    onToggleSidebar={() => setIsCollapsed(!isCollapsed)}
                />

                {/* Main scrollable content area */}
                <main className="flex-1 p-8 md:p-12 overflow-y-auto bg-[#F9FAFB]">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>

            {/* Sidebar Overlay for Mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    )
}