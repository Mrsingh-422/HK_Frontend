'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    FaFileMedicalAlt, FaClipboardList, FaHistory, 
    FaCog, FaChevronLeft, FaChevronRight, FaShieldAlt
} from "react-icons/fa";

import TopbarPoliceStation from './components/topbarpolicestation';
 
export default function PoliceStationLayout({ children }) {
    const [isCollapsed, setIsCollapsed] = useState(false);  
    const pathname = usePathname()
 
    const menuItems = [
        { 
          name: 'Fresh Case', 
          href: '/policeandfire/policestation/freshcase',
          icon: FaFileMedicalAlt 
        },
        { 
          name: 'Pending', 
          href: '/policeandfire/policestation/pendingcase',
          icon: FaClipboardList 
        },
        { 
          name: 'History', 
          href: '/policeandfire/policestation/history', 
          icon: FaHistory 
        },
        { 
          name: 'Setting', 
          href: '/policeandfire/policestation/setting', 
          icon: FaCog 
        },
    ];
 
    return (
        <div className="min-h-screen bg-[#F9FAFB] flex font-sans">
            {/* --- SIDEBAR --- */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-100 flex flex-col
                transition-all duration-300 ease-in-out lg:static lg:inset-0
                ${isCollapsed ? 'w-20' : 'w-64'}
            `}>
                
                {/* --- COMPACT LOGO AREA --- */}
                <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-center min-h-[64px]">
                    <Link href="/policeandfire/policestation/freshcase" className="flex items-center justify-center">
                        {/* Smaller Icon Box (w-9 h-9 instead of 11) */}
                        <div className="w-9 h-9 bg-[#08B36A] rounded-xl flex items-center justify-center text-white shadow-md shadow-green-100 shrink-0">
                             <FaShieldAlt size={18} />
                        </div>
                        {!isCollapsed && (
                            <div className="ml-2.5 flex flex-col overflow-hidden">
                                {/* Tighter typography */}
                                <span className="font-black text-slate-800 text-sm tracking-tight leading-none uppercase">Police</span>
                                <span className="font-bold text-[#08B36A] text-[9px] uppercase tracking-[0.15em] mt-0.5">Station</span>
                            </div>
                        )}
                    </Link>
                </div>
 
                {/* NAVIGATION */}
                <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`
                                    flex items-center rounded-xl transition-all duration-200 group
                                    ${isCollapsed ? 'justify-center p-3' : 'gap-3.5 px-4 py-3'}
                                    ${isActive
                                        ? 'bg-[#08B36A] text-white shadow-lg shadow-green-100 font-bold'
                                        : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600' 
                                    }
                                `}
                            >
                                <item.icon className={`${isCollapsed ? 'text-xl' : 'text-lg'} shrink-0`} />
                                {!isCollapsed && (
                                    <span className="whitespace-nowrap text-[10px] tracking-[0.05em] uppercase font-black">{item.name}</span>
                                )}
                            </Link>
                        )
                    })}
                </nav>
 
                {/* BOTTOM TOGGLE */}
                <div className="p-4 border-t border-gray-50 flex justify-center">
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 hover:bg-[#08B36A] hover:text-white transition-all flex items-center justify-center"
                    >
                        {isCollapsed ? <FaChevronRight size={12} /> : <FaChevronLeft size={12} />}
                    </button>
                </div>
            </aside>
 
            {/* --- MAIN CONTENT --- */}
            <div className="flex-1 flex flex-col min-w-0">
                <TopbarPoliceStation 
                    isCollapsed={isCollapsed} 
                    onToggleSidebar={() => setIsCollapsed(!isCollapsed)} 
                />
 
                <main className="flex-1 p-6 md:p-8 overflow-auto">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}