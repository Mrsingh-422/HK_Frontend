'use client';

import React, { useState } from 'react';
// React Icons (Font Awesome) imports
import {
    FaBell,
    FaHospital,
    FaUserPlus,
    FaChevronLeft,
    FaCheckDouble,
    FaClock,
    FaTrashAlt,
    FaCalendarAlt,
    FaEllipsisH
} from 'react-icons/fa';

export default function NotificationsPage() {
    const [activeTab, setActiveTab] = useState('unread');

    const unreadNotifications = [
        { id: 1, type: 'hospital', message: 'RoRUVEBfxAggbATDygqxwC Hospital Registered Now!!!', time: '13:26 PM', date: 'Today' },
        { id: 2, type: 'user', message: 'New User Registered Now!!!', time: '17:08 PM', date: 'Yesterday' },
        { id: 3, type: 'hospital', message: 'dSbhguijWwfBhQEOXpaMn Hospital Registered Now!!!', time: '19:05 PM', date: '15 March' },
        { id: 7, type: 'user', message: 'Premium Subscription activated for user "Alex"', time: '10:00 AM', date: 'Today' },
        { id: 8, type: 'hospital', message: 'City General Hospital updated their profile.', time: '11:20 AM', date: 'Today' },
        { id: 9, type: 'user', message: 'New Verification request from Rahul Sharma.', time: '09:45 AM', date: 'Yesterday' },
    ];

    const oldNotifications = [
        ...unreadNotifications,
        { id: 4, type: 'hospital', message: 'MIBGnigixAAruatDx Hospital Registered Now!!!', time: '08:43 AM', date: '04 March' },
        { id: 5, type: 'user', message: 'New User Registered Now!!!', time: '11:35 AM', date: '02 March' },
        { id: 6, type: 'user', message: 'New User Registered Now!!!', time: '09:12 AM', date: '02 March' },
    ];

    const notifications = activeTab === 'unread' ? unreadNotifications : oldNotifications;

    return (
        <div className="min-h-screen bg-[#f8fafc] py-10 px-4 md:px-12 font-sans">
            <div className="max-w-7xl mx-auto">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div className="flex items-center gap-5">
                        <button className="p-3 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-all text-gray-600">
                            <FaChevronLeft className="w-4 h-4" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Notifications</h1>
                            <p className="text-gray-500 font-medium mt-1">Manage your alerts and activity logs</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all">
                            Clear All
                        </button>
                        <button className="flex items-center gap-2 bg-[#08b36a] hover:bg-[#079d5c] text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-[#08b36a]/30 active:scale-95">
                            <FaCheckDouble className="w-4 h-4" />
                            Mark All Read
                        </button>
                    </div>
                </div>

                {/* Tab Switcher */}
                <div className="inline-flex p-1.5 bg-gray-200/50 backdrop-blur-md rounded-2xl mb-10">
                    <button
                        onClick={() => setActiveTab('unread')}
                        className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'unread'
                            ? 'bg-white text-[#08b36a] shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Unread <span className="ml-1 bg-[#08b36a]/10 px-2 py-0.5 rounded-md text-[10px]">{unreadNotifications.length}</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('old')}
                        className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'old'
                            ? 'bg-white text-[#08b36a] shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Archive
                    </button>
                </div>

                {/* Grid Notifications - 3 Cards per row on Desktop */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {notifications.map((item) => (
                        <div
                            key={item.id}
                            className="group relative bg-white rounded-[10px] border-t-[4px] border-[#22c55e] p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col"
                        >
                            {/* Top Row: Icon and Quick Action */}
                            <div className="flex justify-between items-start mb-5">
                                <div className={`p-4 rounded-xl ${item.type === 'hospital'
                                    ? 'bg-orange-50 text-orange-500'
                                    : 'bg-emerald-50 text-[#08b36a]'
                                    }`}>
                                    {item.type === 'hospital' ? <FaHospital size={24} /> : <FaUserPlus size={24} />}
                                </div>

                                <div className="flex items-center gap-2">
                                    {/* Mark as read indicator for unread tab */}
                                    {activeTab === 'unread' && (
                                        <div className="h-2.5 w-2.5 bg-[#08b36a] rounded-full animate-pulse"></div>
                                    )}
                                    <button className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-all">
                                        <FaTrashAlt size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* Body Content */}
                            <div className="flex-grow">
                                <h3 className={`text-[11px] font-black uppercase tracking-[0.1em] mb-2 ${item.type === 'hospital' ? 'text-orange-600' : 'text-emerald-600'
                                    }`}>
                                    {item.type === 'hospital' ? 'Hospital Update' : 'New User'}
                                </h3>
                                <p className="text-gray-700 font-bold text-[15px] leading-snug line-clamp-2">
                                    {item.message}
                                </p>
                            </div>

                            {/* Divider */}
                            <div className="my-5 border-t border-gray-100" />

                            {/* Footer Meta Info */}
                            <div className="flex items-center justify-between mt-auto">
                                <div className="flex items-center gap-2 text-gray-400">
                                    <FaClock size={12} />
                                    <span className="text-[11px] font-bold">{item.time}</span>
                                </div>
                                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-md text-gray-500">
                                    <FaCalendarAlt size={10} />
                                    <span className="text-[10px] font-bold">{item.date}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {notifications.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-32 bg-white rounded-2xl border-2 border-dashed border-gray-100">
                        <div className="bg-gray-50 p-8 rounded-full mb-6">
                            <FaBell className="w-12 h-12 text-gray-200" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-400">No Notifications Yet</h3>
                    </div>
                )}

            </div>
        </div>
    );
}
