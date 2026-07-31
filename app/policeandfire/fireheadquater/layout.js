'use client'
import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
    FaBars, FaHome, FaFire, FaClock, FaHistory,
    FaBuilding, FaSignOutAlt, FaUserCircle, FaChevronDown,
    FaChevronLeft, FaChevronRight, FaQuestionCircle,
    FaPhoneAlt, FaEnvelope, FaTimes, FaSpinner,
    FaShieldAlt
} from "react-icons/fa";
import { MdMenuOpen, MdMenu } from "react-icons/md";
import FireHeadAPI from '@/app/services/FireHeadAPI';
 
// Helper Function for Image URL format
const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5002';
    const cleanPath = imagePath.replace(/^public\//, '');
    if (cleanPath.startsWith('http')) return cleanPath;
    return `${backendUrl}/${cleanPath}`;
};
 
// ==========================================
// 🌟 1. FHQ TOPBAR COMPONENT 🌟
// ==========================================
const FHQTopBar = ({ onMobileMenuClick, onToggleCollapse, isCollapsed, hqProfile }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
 
    // Help Modal States
    const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
    const [helpData, setHelpData] = useState({ phone: '', email: '' });
    const [isLoadingHelp, setIsLoadingHelp] = useState(false);
 
    // 🌟 Logout Function Moved Inside Component 🌟
    const handleLogout = () => {
        setIsDropdownOpen(false);
        // 1. Token aur Data ko remove karein
        localStorage.removeItem('fireheadquarterToken');
        localStorage.removeItem('fireheadquarterData');
       
        // 2. Clear other session if any
        localStorage.clear();
 
        // 3. Login page par redirect karein
        window.location.href = '/';
    };
 
    // Close dropdown when clicked outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    },[]);
 
    // Fetch Help Data when Help button is clicked
    const openHelpModal = async () => {
        setIsDropdownOpen(false);
        setIsHelpModalOpen(true);
        setIsLoadingHelp(true);
       
        try {
            const res = await FireHeadAPI.getHelpContact();
            if (res.success && res.data) {
                setHelpData(res.data);
            }
        } catch (error) {
            console.error("Error fetching help data:", error);
            setHelpData({ phone: '+91 9876543210', email: 'help@gmail.com' });
        } finally {
            setIsLoadingHelp(false);
        }
    };
 
    return (
        <>
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-8 flex-shrink-0 z-40 transition-all duration-300">
            {/* Left Side: Menu Buttons */}
            <div className="flex items-center gap-4 w-1/3">
                <button onClick={onMobileMenuClick} className="lg:hidden p-2 text-gray-500 hover:text-[#08B36A] hover:bg-green-50 rounded-lg transition-colors">
                    <FaBars size={20} />
                </button>
                <button onClick={onToggleCollapse} className="hidden lg:flex p-2 text-gray-500 hover:text-[#08B36A] hover:bg-green-50 rounded-lg transition-colors items-center justify-center">
                    {isCollapsed ? <MdMenu size={24} /> : <MdMenuOpen size={24} />}
                </button>
            </div>
 
            {/* Center Side: Text (Dynamic Headquarter Name) */}
            <div className="w-1/3 flex justify-center items-center">
                <span className="font-bold text-gray-800 text-lg whitespace-nowrap hidden sm:block">
                    {hqProfile?.stationName || "Fire Headquarter"}
                </span>
                <span className="font-bold text-gray-800 text-lg whitespace-nowrap sm:hidden">
                    {hqProfile?.stationName ? hqProfile.stationName.substring(0, 15) + "..." : "FHQ"}
                </span>
            </div>
 
            {/* Right Side: Profile Dropdown Area */}
            <div className="flex items-center justify-end w-1/3">
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center gap-2 hover:bg-gray-50 p-1.5 pr-3 rounded-xl transition-all border border-transparent hover:border-gray-200"
                    >
                        {/* 🌟 Dynamic Profile Image 🌟 */}
                        {hqProfile?.profileImage ? (
                            <img
                                src={getImageUrl(hqProfile.profileImage)}
                                alt="Profile"
                                className="w-8 h-8 rounded-full object-cover border border-green-100"
                            />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-green-100 text-[#08B36A] flex items-center justify-center font-bold">
                                {hqProfile?.captainName ? hqProfile.captainName.charAt(0).toUpperCase() : 'HQ'}
                            </div>
                        )}
 
                        {/* 🌟 Dynamic Captain Name & Role 🌟 */}
                        <div className="hidden sm:block text-left">
                            <p className="text-sm font-bold text-gray-700 leading-tight">
                                {hqProfile?.captainName || "Admin"}
                            </p>
                            <p className="text-[10px] font-medium text-gray-500 uppercase">
                                {hqProfile?.role || "Fire HQ"}
                            </p>
                        </div>
                        <FaChevronDown size={12} className={`text-gray-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
                    </button>
 
                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-in fade-in zoom-in duration-200 origin-top-right">
                            <Link href="/policeandfire/fireheadquater/edit-profile"
                                onClick={() => setIsDropdownOpen(false)}
                                className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:text-[#08B36A] hover:bg-green-50 transition-colors"
                            >
                                <FaUserCircle size={16} /> Edit Profile
                            </Link>
 
                            <button
                                onClick={openHelpModal}
                                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:text-[#08B36A] hover:bg-green-50 transition-colors"
                            >
                                <FaQuestionCircle size={16} /> Help & Support
                            </button>
 
                            <div className="my-1 border-t border-gray-100"></div>
                           
                            {/* 🌟 Functional Sign Out Button 🌟 */}
                            <button
                                onClick={handleLogout}
                                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            >
                                <FaSignOutAlt size={16} /> Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
 
            {/* Help Modal */}
            {isHelpModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 transition-all duration-300">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">Contact with Admin</h2>
                            <button onClick={() => setIsHelpModalOpen(false)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-all"><FaTimes size={18} /></button>
                        </div>
                        <div className="p-6">
                            {isLoadingHelp ? (
                                <div className="flex flex-col justify-center items-center py-6 gap-3 text-gray-500">
                                    <FaSpinner className="animate-spin text-3xl text-[#08B36A]" />
                                    <p className="text-sm font-medium">Fetching details...</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 px-4 py-3 bg-white border border-[#08B36A] rounded-xl shadow-sm">
                                        <FaPhoneAlt className="text-[#08B36A]" />
                                        <span className="text-sm font-bold text-gray-700">{helpData.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-3 px-4 py-3 bg-white border border-[#08B36A] rounded-xl shadow-sm">
                                        <FaEnvelope className="text-[#08B36A]" />
                                        <span className="text-sm font-bold text-gray-700">{helpData.email}</span>
                                    </div>
                                    <button onClick={() => setIsHelpModalOpen(false)} className="w-full mt-4 py-3 bg-[#08B36A] text-white rounded-xl font-bold text-sm hover:bg-green-600 transition-all shadow-md shadow-green-200">
                                        Close
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
 
// ==========================================
// 🌟 2. MAIN FHQ LAYOUT COMPONENT 🌟
// ==========================================
export default function FHQLayout({ children }) {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);  
    const pathname = usePathname();
 
    // 🌟 HQ Profile State 🌟
    const [hqProfile, setHqProfile] = useState(null);
 
    // Profile Fetch logic (Runs once when layout loads)
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await FireHeadAPI.getHQProfile();
                if (res.success) {
                    setHqProfile(res.data);
                }
            } catch (error) {
                console.error("Failed to fetch HQ Profile:", error);
            }
        };
        fetchProfile();
    }, []);
 
    const menuItems =[
        { name: 'Dashboard', href: '/policeandfire/fireheadquater', icon: FaHome },
        { name: 'Fresh Cases', href: '/policeandfire/fireheadquater/fresh-cases', icon: FaFire },
        { name: 'Pending Cases', href: '/policeandfire/fireheadquater/pending-cases', icon: FaClock },
        { name: 'Create Cases', href: '/policeandfire/fireheadquater/create-cases', icon: FaFire },
        { name: 'History Cases', href: '/policeandfire/fireheadquater/history-cases', icon: FaHistory },
        { name: 'Manage Fire Station', href: '/policeandfire/fireheadquater/manage-fire-station', icon: FaBuilding },
        { name: 'Manage Jurisdiction Area', href: '/policeandfire/fireheadquater/jurisdiction-area-manage', icon: FaHome },
        { name: 'Change Password', href: '/policeandfire/fireheadquater/change-password', icon: FaShieldAlt },
    ];
 
    return (
        <div className="h-screen w-full bg-[#f4f6f8] flex overflow-hidden">
           
            {/* --- SIDEBAR --- */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 flex flex-col h-full
                transition-all duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
                lg:translate-x-0 lg:static lg:inset-0
                ${isCollapsed ? 'lg:w-20' : 'w-64'}
            `}>
               
                {/* 🌟 LOGO AREA 🌟 */}
                <div className="p-4 border-b border-gray-50 flex items-center justify-center min-h-[70px] flex-shrink-0">
                    <Link href="/policeandfire/fireheadquater" className="flex items-center justify-center overflow-hidden">
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
                <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== '/policeandfire/fireheadquater' && pathname.includes(item.href));
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                title={isCollapsed ? item.name : ""}
                                className={`
                                    flex items-center rounded-xl transition-all duration-200 group
                                    ${isCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-2.5'}
                                    ${isActive
                                        ? 'bg-[#08B36A] text-white shadow-md shadow-green-100 font-medium'
                                        : 'text-gray-500 hover:bg-[#08B36A] hover:text-white'
                                    }
                                `}
                            >
                                <item.icon className={`
                                    text-xl transition-colors duration-200 flex-shrink-0
                                    ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}
                                `} />
                                {!isCollapsed && (
                                    <span className="whitespace-nowrap text-sm font-medium">{item.name}</span>
                                )}
                            </Link>
                        )
                    })}
                </nav>
 
                {/* Collapse / Expand Toggle Button (< >) */}
                <div className="p-4 border-t border-gray-100 flex justify-center lg:flex hidden bg-gray-50/50 flex-shrink-0">
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-2 rounded-full bg-white border border-gray-200 text-gray-500 hover:bg-[#08B36A] hover:border-[#08B36A] hover:text-white transition-colors shadow-sm"
                        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                    >
                        {isCollapsed ? <FaChevronRight size={14} /> : <FaChevronLeft size={14} />}
                    </button>
                </div>
            </aside>
 
            {/* --- MAIN SECTION --- */}
            <div className="flex-1 flex flex-col h-screen min-w-0 transition-all duration-300 bg-[#f8f9fa]">
                <FHQTopBar
                    onMobileMenuClick={() => setSidebarOpen(true)}
                    onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
                    isCollapsed={isCollapsed}
                    hqProfile={hqProfile} // Passed profile data to header
                />
                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                    {children}
                </main>
            </div>
 
            {/* Sidebar Overlay for Mobile */}
            {isSidebarOpen && (
                <div className="fixed inset-0 bg-gray-900/40 z-40 lg:hidden backdrop-blur-sm transition-opacity" onClick={() => setSidebarOpen(false)} />
            )}
        </div>
    )
}
 