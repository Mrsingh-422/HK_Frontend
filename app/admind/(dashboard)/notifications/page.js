'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
    FaHospital,
    FaUserPlus,
    FaCheckDouble,
    FaClock,
    FaTrashAlt,
    FaCalendarAlt,
    FaSpinner,
    FaBell,
    FaFilter
} from 'react-icons/fa';
import AdminAPI from '@/app/services/AdminAPI';

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('unread');

    // Fetch notifications from Backend
    const fetchNotifications = async () => {
        setIsLoading(true);
        try {
            const res = await AdminAPI.getNotifications();
            setNotifications(res.data || []);
        } catch (error) {
            console.error("Failed to load notifications:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Load data from the backend
        fetchNotifications();
    }, []);

    // Dummy Data (Remove this after testing)
    const dummyData = [
        { _id: '1', type: 'hospital', message: 'RoRUVEBfxAggbATDygqxwC Hospital Registered Now!!!', isRead: false, createdAt: new Date().toISOString() },
        { _id: '2', type: 'user', message: 'New User Registered Now!!!', isRead: false, createdAt: new Date(Date.now() - 86400000).toISOString() }, // Yesterday
    ];

    // Use dummy data only when you cannot get real data from the backend
    const finalNotifications = notifications.length > 0 ? notifications : dummyData;

    // Filter notifications based on tab
    const filteredNotifications = useMemo(() => {
        if (activeTab === 'unread') {
            return finalNotifications.filter(n => !n.isRead);
        }
        return finalNotifications;
    }, [finalNotifications, activeTab]);

    // Action: Mark Single Read
    const handleMarkRead = async (id) => {
        try {
            await AdminAPI.markAsRead(id);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            alert("Error updating notification");
        }
    };

    // Action: Mark All Read
    const handleMarkAllRead = async () => {
        try {
            await AdminAPI.markAllRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            alert("Error marking all as read");
        }
    };

    // Action: Delete Single
    const handleDelete = async (id) => {
        if (!window.confirm("Delete this notification?")) return;
        try {
            await AdminAPI.deleteNotification(id);
            setNotifications(prev => prev.filter(n => n._id !== id));
        } catch (error) {
            alert("Error deleting notification");
        }
    };

    // Action: Clear All
    const handleClearAll = async () => {
        if (!window.confirm("Clear your entire notification history?")) return;
        try {
            await AdminAPI.clearAllNotifications();
            setNotifications([]);
        } catch (error) {
            alert("Error clearing notifications");
        }
    };

    if (isLoading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white">
            <FaSpinner className="animate-spin text-[#08b36a] text-4xl mb-4" />
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Syncing alerts...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f8fafc] py-10 px-4 md:px-12 font-sans">
            <div className="max-w-7xl mx-auto">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                            Alert Center <FaBell className="text-amber-400 text-2xl" />
                        </h1>
                        <p className="text-gray-500 font-medium mt-1">Real-time registration and system activity logs</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleClearAll}
                            className="bg-white border border-red-100 text-red-500 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-red-50 transition-all"
                        >
                            Clear All
                        </button>
                        <button
                            onClick={handleMarkAllRead}
                            className="flex items-center gap-2 bg-[#08b36a] hover:bg-[#079d5c] text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#08b36a]/20"
                        >
                            <FaCheckDouble /> Mark All Read
                        </button>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-4 mb-6 border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('unread')}
                        className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'unread' ? 'border-b-2 border-[#08b36a] text-[#08b36a]' : 'text-gray-400'}`}
                    >
                        Unread ({notifications.filter(n => !n.isRead).length})
                    </button>
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'all' ? 'border-b-2 border-[#08b36a] text-[#08b36a]' : 'text-gray-400'}`}
                    >
                        History ({notifications.length})
                    </button>
                </div>

                {/* Table View */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Type</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Message</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-center">Time/Date</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredNotifications.map((item) => (
                                    <tr key={item._id} className={`group hover:bg-gray-50/80 transition-colors ${!item.isRead ? 'bg-emerald-50/30' : ''}`}>
                                        <td className="px-6 py-5">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.type === 'hospital' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                                                {item.type === 'hospital' ? <FaHospital size={16} /> : <FaUserPlus size={16} />}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className={`text-[10px] font-black uppercase mb-1 ${item.type === 'hospital' ? 'text-orange-500' : 'text-blue-500'}`}>
                                                    {item.type} Activity
                                                </span>
                                                <p className={`text-sm font-bold ${!item.isRead ? 'text-gray-900' : 'text-gray-500'}`}>
                                                    {item.message}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col items-center gap-1 text-gray-400">
                                                <div className="flex items-center gap-1 text-[11px] font-bold">
                                                    <FaClock size={10} /> {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                                <div className="flex items-center gap-1 text-[10px] font-medium italic">
                                                    <FaCalendarAlt size={10} /> {new Date(item.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {!item.isRead && (
                                                    <button
                                                        onClick={() => handleMarkRead(item._id)}
                                                        className="p-2 text-[#08b36a] hover:bg-emerald-100 rounded-lg transition-all" title="Mark as Read"
                                                    >
                                                        <FaCheckDouble size={14} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(item._id)}
                                                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Delete"
                                                >
                                                    <FaTrashAlt size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Empty State inside table */}
                    {filteredNotifications.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-24">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-200">
                                <FaBell size={30} />
                            </div>
                            <h3 className="text-sm font-black text-gray-300 uppercase tracking-widest">Workspace is clear</h3>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}