'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image' 
import { usePathname, useRouter } from 'next/navigation'
import {
    FaFileMedicalAlt, 
    FaClipboardList,   
    FaHistory,         
    FaCog,             
    FaUserShield,      
    FaChevronLeft,
    FaChevronRight,
    FaHome,
    FaMap
} from "react-icons/fa";
import TopbarPoliceHeadquarter from './components/TopbarPoliceHeadquarter'

export default function LabVendorLayout({ children }) {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);  
    const [isAuthorized, setIsAuthorized] = useState(false); // Auth State
    const pathname = usePathname()
    const router = useRouter();
 
    // --- ROUTE PROTECTION LOGIC ---
    useEffect(() => {
        const token = localStorage.getItem('policeHeadToken');
        if (!token) {
            // Redirect to home/login if token doesn't exist
            router.push('/'); 
        } else {
            // Allow rendering if token exists
            setIsAuthorized(true);
        }
    }, [router]);

    const menuItems = [
        { name: 'Dashboard', href: '/policeandfire/policeheadquater/dashboard', icon: FaHome },
        { name: 'All Case', href: '/policeandfire/policeheadquater/freshcase', icon: FaFileMedicalAlt },
        { name: 'Fresh Case', href: '/policeandfire/policeheadquater/only-fresh-cases', icon: FaFileMedicalAlt },
        { name: 'Pending Case', href: '/policeandfire/policeheadquater/pendingcases', icon: FaFileMedicalAlt },
        // { name: 'Pending', href: '/policeandfire/policeheadquater/pendingcase', icon: FaClipboardList },
        { name: 'Create Case', href: '/policeandfire/policeheadquater/createcase', icon: FaFileMedicalAlt },
        { name: 'Manage Police Station', href: '/policeandfire/policeheadquater/managepolicestation', icon: FaUserShield },
        { name: 'Manage Jurisdiction Area', href: '/policeandfire/policeheadquater/jurisdiction', icon: FaMap },
        { name: 'Cases History', href: '/policeandfire/policeheadquater/history', icon: FaFileMedicalAlt },
        { name: 'Terms & Conditions', href: '/policeandfire/policeheadquater/Term-and-condition', icon: FaCog },
    ];

    // Prevent rendering children until authorization check is done
    if (!isAuthorized) {
        return null; // Or a loading spinner
    }
 
    return (
        // FIX 1: Changed min-h-screen to h-screen and added overflow-hidden to prevent whole page scrolling
        <div className="h-screen overflow-hidden bg-gray-50 flex">
            
            {/* --- SIDEBAR --- */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 flex flex-col
                transition-all duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0 lg:static lg:h-screen
                ${isCollapsed ? 'w-20' : 'w-64'}
            `}>
                <div className="p-4 border-b border-gray-50 flex items-center justify-center min-h-[70px]">
                    <Link href="/policeandfire/policeheadquater" className="flex items-center justify-center overflow-hidden">
                        {isCollapsed ? (
                            <Image src="/logo.png" alt="HK Logo" width={40} height={40} className="object-contain" />
                        ) : (
                            <Image src="/logo.png" alt="Health Kangaroo Logo" width={140} height={50} className="object-contain" />
                        )}
                    </Link>
                </div>
 
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`
                                    flex items-center rounded-xl transition-all duration-200 group
                                    ${isCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-2.5'}
                                    ${isActive
                                        ? 'bg-[#08B36A] text-white shadow-md shadow-green-100 font-medium'
                                        : 'text-gray-600 hover:bg-[#08B36A]/10 hover:text-[#08B36A]' 
                                    }
                                `}
                            >
                                <item.icon className={`
                                    text-lg transition-colors duration-200
                                    ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-[#08B36A]'}
                                `} />
                                {!isCollapsed && (
                                    <span className="whitespace-nowrap text-[14px] font-semibold">{item.name}</span>
                                )}
                            </Link>
                        )
                    })}
                </nav>
            </aside>
 
            {/* FIX 2: Added h-screen and overflow-hidden here as well to restrict height */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                <TopbarPoliceHeadquarter 
                    isCollapsed={isCollapsed} 
                    onToggleSidebar={() => setIsCollapsed(!isCollapsed)} 
                    onMobileMenuClick={() => setSidebarOpen(true)}
                />
                
                {/* FIX 3: Changed overflow-auto to overflow-y-auto to handle only vertical scrolling */}
                <main className="flex-1 p-4 md:p-8 overflow-y-auto bg-[#F9FAFB] custom-scrollbar">
                    {children}
                </main>
            </div>
 
            {isSidebarOpen && (
                <div className="fixed inset-0 bg-gray-900/40 z-40 lg:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            )}
        </div>
    )
}