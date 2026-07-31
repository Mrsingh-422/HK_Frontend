'use client'

import React, { useState } from 'react'

import Link from 'next/link'

import Image from 'next/image' // 🌟 Image import kiya

import { usePathname } from 'next/navigation'

import {

    FaPlusSquare,

    FaMapMarkedAlt,

    FaHistory,

    FaCog,

    FaChevronLeft,

    FaChevronRight,

    FaChevronDown,

    FaFire,

    FaBuilding,

    FaUsers,

    FaTruck,

    FaUserPlus,

    FaBell,

    FaLock,

    FaHome

} from "react-icons/fa";

import FireStationTopBar from './components/topbarfirestation';
 
export default function FireStationLayout({ children }) {

    const [isSidebarOpen, setSidebarOpen] = useState(false);

    const [isCollapsed, setIsCollapsed] = useState(false);

    // Dropdown open/close state

    const [isSettingsOpen, setIsSettingsOpen] = useState(false); 

    const pathname = usePathname()
 
    // Main Menu Items

    const menuItems = [

        { name: 'Dashboard', href: '/policeandfire/firestation', icon: FaHome },

        { name: 'Ongoing Operations', href: '/policeandfire/firestation/ongoingoperations', icon: FaMapMarkedAlt },

        { name: 'Incident History', href: '/policeandfire/firestation/incidenthistory', icon: FaHistory },

        { name: 'Fresh Cases', href: '/policeandfire/firestation/freshcases', icon: FaFire },

        { name: 'Create Cases', href: '/policeandfire/firestation/create-cases', icon: FaFire },

    ];
 
    // 🔥 Settings Sub-Items (Ab icons ke sath)

    const settingsSubItems = [

        { name: 'Duty Roster', href: '/policeandfire/firestation/staffroaster', icon: FaUsers },

        { name: 'Equipment', href: '/policeandfire/firestation/equipment', icon: FaUsers },

        { name: 'Jurisdiction Areas', href: '/policeandfire/firestation/jurisdiction-area', icon: FaMapMarkedAlt },

        { name: 'Fire Trucks and Vehical', href: '/policeandfire/firestation/managevehical', icon: FaTruck },

        { name: 'Manage Staff', href: '/policeandfire/firestation/managestaff', icon: FaUserPlus },

        { name: 'Manage Leave', href: '/policeandfire/firestation/manageleaves', icon: FaUserPlus },

        { name: 'Alerts & Sounds', href: '/policeandfire/firestation/notification', icon: FaBell },

        { name: 'Change Password', href: '/policeandfire/firestation/change-password', icon: FaLock },

    ];
 
    const isSettingsActive = settingsSubItems.some(item => pathname === item.href);
 
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

                {/* 🌟 LOGO AREA (MATCHED WITH FHQ STYLE) 🌟 */}
<div className="p-4 border-b border-gray-50 flex items-center justify-center min-h-[70px] flex-shrink-0">
<Link href="/policeandfire/firestation" className="flex items-center justify-center overflow-hidden">

                        {isCollapsed ? (
<Image

                                src="/logo.png"

                                alt="HK Logo"

                                width={40}

                                height={40}

                                className="object-contain transition-all duration-300"

                            />

                        ) : (
<Image

                                src="/logo.png"

                                alt="Health Kangaroo Logo"

                                width={140}

                                height={50}

                                className="object-contain transition-all duration-300"

                            />

                        )}
</Link>
</div>
 
                {/* Navigation Links */}
<nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto custom-scrollbar">

                    {/* Normal Links */}

                    {menuItems.map((item) => {

                        const isActive = pathname === item.href;

                        return (
<Link

                                key={item.name}

                                href={item.href}

                                onClick={() => setSidebarOpen(false)}

                                className={`

                                    flex items-center rounded-xl transition-all duration-200 group

                                    ${isCollapsed ? 'justify-center p-3 mx-1' : 'gap-3 px-4 py-2.5 mx-1'}

                                    ${isActive

                                        ? 'bg-[#08B36A] text-white shadow-md shadow-green-100 font-medium'

                                        : 'text-gray-500 hover:bg-[#08B36A] hover:text-white'

                                    }

                                `}
>
<item.icon className={`text-xl shrink-0 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />

                                {!isCollapsed && (
<span className="whitespace-nowrap text-sm font-medium">{item.name}</span>

                                )}
</Link>

                        )

                    })}
 
                    {/* 🔥 SETTINGS DROPDOWN 🔥 */}
<div className="pt-2">
<button

                            onClick={() => {

                                setIsSettingsOpen(!isSettingsOpen)

                                if(isCollapsed) setIsCollapsed(false) 

                            }}

                            className={`

                                w-[calc(100%-8px)] mx-1 flex items-center justify-between rounded-xl transition-all duration-200 group

                                ${isCollapsed ? 'justify-center p-3' : 'px-4 py-2.5'}

                                ${(isSettingsActive || isSettingsOpen)

                                    ? 'bg-green-50 text-[#08B36A] font-medium'

                                    : 'text-gray-500 hover:bg-green-50 hover:text-[#08B36A]'

                                }

                            `}
>
<div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
<FaCog className={`text-xl shrink-0 ${(isSettingsActive || isSettingsOpen) ? 'text-[#08B36A]' : 'text-gray-400 group-hover:text-[#08B36A]'}`} />

                                {!isCollapsed && (
<span className="whitespace-nowrap text-sm font-medium">Settings</span>

                                )}
</div>

                            {!isCollapsed && (
<FaChevronDown 

                                    className={`text-xs transition-transform duration-300 ${isSettingsOpen ? 'rotate-180 text-[#08B36A]' : 'text-slate-400'}`} 

                                />

                            )}
</button>
 
                        <div 

                            className={`overflow-hidden transition-all duration-300 ease-in-out ${

                                (isSettingsOpen && !isCollapsed) ? 'max-h-[500px] opacity-100 mt-2' : 'max-h-0 opacity-0'

                            }`}
>
<ul className="space-y-1 relative">
<div className="absolute left-[28px] top-0 bottom-2 w-px bg-gray-100"></div>
 
                                {settingsSubItems.map((subItem) => {

                                    const isSubActive = pathname === subItem.href;

                                    return (
<li key={subItem.name} className="relative z-10 pl-8 pr-2">
<Link

                                                href={subItem.href}

                                                className={`

                                                    flex items-center gap-3 rounded-lg transition-all duration-200 group px-4 py-2

                                                    ${isSubActive 

                                                        ? 'bg-[#08B36A] text-white shadow-md shadow-green-100 font-medium' 

                                                        : 'text-gray-400 hover:bg-green-50 hover:text-[#08B36A]'

                                                    }

                                                `}
>
<subItem.icon className={`text-lg shrink-0 ${isSubActive ? 'text-white' : 'text-gray-300 group-hover:text-[#08B36A]'}`} />
<span className="whitespace-nowrap text-xs font-medium">

                                                    {subItem.name}
</span>
</Link>
</li>

                                    )

                                })}
</ul>
</div>
</div>
 
                </nav>
 
                {/* Sidebar Bottom Toggle */}
<div className="p-4 border-t border-gray-100 flex justify-center lg:flex hidden flex-shrink-0">
<button

                        onClick={() => {

                            setIsCollapsed(!isCollapsed);

                            if(!isCollapsed) setIsSettingsOpen(false); 

                        }}

                        className="w-10 h-10 rounded-full bg-white border border-gray-200 text-gray-400 hover:bg-[#08B36A] hover:text-white transition-all flex items-center justify-center shadow-sm"
>

                        {isCollapsed ? <FaChevronRight size={14} /> : <FaChevronLeft size={14} />}
</button>
</div>
</aside>
 
            {/* --- MAIN SECTION --- */}
<div className="flex-1 flex flex-col h-screen min-w-0 transition-all duration-300 bg-[#f8f9fa]">
<FireStationTopBar 

                    onMobileMenuClick={() => setSidebarOpen(true)} 

                    isCollapsed={isCollapsed} 

                    onToggleSidebar={() => setIsCollapsed(!isCollapsed)}

                />
 
                <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
<div className="max-w-7xl mx-auto">

                        {children}
</div>
</main>
</div>
 
            {isSidebarOpen && (
<div className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden backdrop-blur-sm transition-opacity" onClick={() => setSidebarOpen(false)} />

            )}
</div>

    )

}
 