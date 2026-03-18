"use client";

import React, { useState, useRef, useEffect } from "react";
import {
    FaBell,
    FaUser,
    FaUserEdit,
    FaInfoCircle,
    FaKey,
    FaSignOutAlt
} from "react-icons/fa";
// Import the new Menu Icon
import { HiMenuAlt2 } from "react-icons/hi";
import Link from "next/link";
import { useGlobalContext } from "@/app/context/GlobalContext";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";

const DashboardTopNavbar = ({ heading }) => {
    const [openProfile, setOpenProfile] = useState(false);
    const [openNotifications, setOpenNotifications] = useState(false);
    const router = useRouter();
    const themeColor = "#08B36A";

    const { logout } = useAuth();
    const profileRef = useRef(null);
    const notificationRef = useRef(null);
    const { user, toggleSidebar } = useGlobalContext();

    const notifications = [
        { id: 1, message: "A new appointment has been successfully booked for tomorrow at 10:30 AM." },
        { id: 2, message: "A new user has registered and is awaiting profile verification." },
        { id: 3, message: "Warning: Stock level for Paracetamol 500mg has dropped below threshold." },
    ];

    useEffect(() => {
        function handleClickOutside(event) {
            if (profileRef.current && !profileRef.current.contains(event.target)) setOpenProfile(false);
            if (notificationRef.current && !notificationRef.current.contains(event.target)) setOpenNotifications(false);
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <nav className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-3">
            <div className="flex items-center justify-between">

                {/* LEFT SECTION */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleSidebar}
                        className="group p-2 rounded-lg hover:bg-gray-100 transition-all text-gray-500"
                        title="Toggle Sidebar"
                    >
                        {/* Updated Icon: HiMenuAlt2 */}
                        <HiMenuAlt2
                            size={24}
                            className="group-hover:scale-110 transition-transform"
                            style={{ color: 'currentColor' }} // Inherits gray, but we can target hover below
                        />
                    </button>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 leading-tight">{heading}</h2>
                        <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Dashboard</span>
                            <span className="text-gray-300 text-xs">/</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: themeColor }}>{heading}</span>
                        </div>
                    </div>
                </div>

                {/* RIGHT SECTION */}
                <div className="flex items-center gap-3">

                    <p className="hidden md:block text-sm font-medium text-gray-500 mr-4">
                        Welcome, <span className="font-bold" style={{ color: themeColor }}>{user || "Admin"}</span>
                    </p>

                    {/* NOTIFICATIONS */}
                    <div className="relative" ref={notificationRef}>
                        <button
                            onClick={() => { setOpenNotifications(!openNotifications); setOpenProfile(false); }}
                            className="p-2.5 rounded-full bg-gray-50 text-gray-600 hover:bg-gray-100 transition-all relative group"
                        >
                            <FaBell size={18} className="group-hover:rotate-12 transition-transform" />
                            {notifications.length > 0 && (
                                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
                            )}
                        </button>

                        {openNotifications && (
                            <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="px-4 py-3 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                                    <h4 className="font-bold text-gray-800 text-sm">Notifications</h4>
                                    <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">New Alerts</span>
                                </div>
                                <div className="max-h-80 overflow-y-auto">
                                    {notifications.map((item) => (
                                        <div key={item.id} className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors">
                                            <p className="text-xs text-gray-600 leading-relaxed font-medium">{item.message}</p>
                                        </div>
                                    ))}
                                </div>
                                <Link href="/admin" className="block text-center py-3 text-xs font-bold hover:bg-gray-50 uppercase tracking-wider" style={{ color: themeColor }}>
                                    View All Notifications
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* PROFILE */}
                    <div className="relative" ref={profileRef}>
                        <button
                            onClick={() => { setOpenProfile(!openProfile); setOpenNotifications(false); }}
                            className="flex items-center gap-2 p-1 pr-3 rounded-full bg-gray-50 hover:bg-gray-100 transition-all border border-gray-100 shadow-sm"
                        >
                            <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm"
                                style={{ backgroundColor: themeColor }}
                            >
                                <FaUser size={13} />
                            </div>
                            <span className="text-xs font-bold text-gray-700 hidden sm:block uppercase tracking-tight">Account</span>
                        </button>

                        {openProfile && (
                            <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="px-4 py-2 border-b border-gray-50 mb-2 bg-gray-50/30">
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest italic">Management</p>
                                </div>

                                <ProfileItem href="/admin" icon={<FaUserEdit />} label="Edit Profile" />
                                <ProfileItem href="/admin" icon={<FaInfoCircle />} label="Support Center" />
                                <ProfileItem href="/admin" icon={<FaKey />} label="Security Settings" />

                                <div className="my-2 border-t border-gray-50"></div>

                                <button
                                    onClick={() => { logout(); router.push('/admin/login'); }}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-red-500 hover:bg-red-50 transition-colors font-bold uppercase tracking-wider"
                                >
                                    <FaSignOutAlt />
                                    <span>Sign Out</span>
                                </button>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </nav>
    );
};

const ProfileItem = ({ href, icon, label }) => (
    <Link href={href} className="flex items-center gap-3 px-4 py-2 text-xs text-gray-600 hover:bg-gray-50 transition-colors font-bold uppercase tracking-tight">
        <span className="text-gray-400 text-sm">{icon}</span>
        {label}
    </Link>
);

export default DashboardTopNavbar;