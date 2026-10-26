"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
    FiBell, FiCheck, FiTrash2, FiClock, 
    FiArrowLeft, FiChevronLeft, FiChevronRight, 
    FiArrowRight, FiCheckSquare, FiInbox
} from 'react-icons/fi';
import { 
    MdOutlineLocalPharmacy, 
    MdOutlineMedicalServices 
} from 'react-icons/md';
import { 
    FaVial, 
    FaUserNurse, 
    FaHospital, 
    FaAmbulance, 
    FaUserMd 
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import UserAPI from '@/app/services/UserAPI';

export default function NotificationsPage() {
    const router = useRouter();

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalNotifications, setTotalNotifications] = useState(0);

    const [actionLoadingId, setActionLoadingId] = useState(null);
    const [isMarkingAll, setIsMarkingAll] = useState(false);

    // Fetch all notifications without service-type filtering
    const fetchNotifications = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const params = {
                page,
                limit: 15
            };

            const res = await UserAPI.getUserNotifications(params);
            if (res && res.success) {
                setNotifications(res.data || []);
                setUnreadCount(res.unreadCount || 0);
                setCurrentPage(res.currentPage || 1);
                setTotalPages(res.totalPages || 1);
                setTotalNotifications(res.total || 0);
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
            toast.error("Failed to load notifications");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications(currentPage);
    }, [fetchNotifications, currentPage]);

    // Handle Deep-Linking / Tap Redirection (Per Documentation Flow)
    const handleNotificationClick = async (item) => {
        if (!item.isRead) {
            handleMarkAsRead(item._id, false);
        }

        const data = item.data || {};
        const type = data.type || item.type;
        const service = data.serviceType || item.serviceType;
        const requestId = data.requestId;

        // Custom Bill Generated Deep Linking: Points to /userscreens/previousorders
        if (type === 'PRESCRIPTION_BILL_GENERATED') {
            switch (service) {
                case 'Pharmacy':
                    router.push(`/userscreens/previousorders?tab=pharmacy&requestId=${requestId || ''}`);
                    return;
                case 'Lab':
                    router.push(`/userscreens/previousorders?tab=lab&requestId=${requestId || ''}`);
                    return;
                case 'Nurse':
                    router.push(`/userscreens/previousorders?tab=nurse&requestId=${requestId || ''}`);
                    return;
                default:
                    router.push(`/userscreens/previousorders?requestId=${requestId || ''}`);
                    return;
            }
        }

        // Fallback: If paymentRoute is provided in the data payload
        if (data.paymentRoute) {
            router.push(data.paymentRoute);
            return;
        }

        // Service specific defaults
        switch (service) {
            case 'Pharmacy':
            case 'Lab':
            case 'Nurse':
                router.push('/userscreens/previousorders');
                break;
            case 'Doctor':
                router.push('/userscreens/doctorappointment');
                break;
            case 'Hospital':
                router.push('/userscreens/hospitalappointment');
                break;
            case 'Ambulance':
                router.push('/userscreens/ambulanceappointment');
                break;
            default:
                router.push('/userscreens/previousorders');
                break;
        }
    };

    // Mark single notification as read
    const handleMarkAsRead = async (id, showToast = true) => {
        try {
            setActionLoadingId(id);
            const res = await UserAPI.markNotificationAsRead(id);
            if (res && res.success) {
                setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
                setUnreadCount(prev => Math.max(0, prev - 1));
                if (showToast) toast.success("Marked as read");
            }
        } catch (error) {
            console.error("Mark read error:", error);
        } finally {
            setActionLoadingId(null);
        }
    };

    // Mark all as read
    const handleMarkAllRead = async () => {
        if (unreadCount === 0) return;
        setIsMarkingAll(true);
        try {
            const res = await UserAPI.markAllNotificationsAsRead();
            if (res && res.success) {
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                setUnreadCount(0);
                toast.success("All notifications marked as read");
            }
        } catch (error) {
            console.error("Mark all read error:", error);
            toast.error("Failed to mark all as read");
        } finally {
            setIsMarkingAll(false);
        }
    };

    // Delete notification
    const handleDeleteNotification = async (e, id) => {
        e.stopPropagation();
        try {
            const res = await UserAPI.deleteNotification(id);
            if (res && res.success) {
                setNotifications(prev => prev.filter(n => n._id !== id));
                toast.success("Notification removed");
            }
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("Could not delete notification");
        }
    };

    // Service Icon & Theme Resolver
    const getServiceTheme = (serviceType) => {
        switch (serviceType) {
            case 'Pharmacy':
                return { 
                    icon: <MdOutlineLocalPharmacy size={20} />, 
                    bg: 'bg-emerald-50 text-emerald-600 border-emerald-100/80',
                    badge: 'bg-emerald-100 text-emerald-800'
                };
            case 'Lab':
                return { 
                    icon: <FaVial size={18} />, 
                    bg: 'bg-purple-50 text-purple-600 border-purple-100/80',
                    badge: 'bg-purple-100 text-purple-800'
                };
            case 'Nurse':
                return { 
                    icon: <FaUserNurse size={18} />, 
                    bg: 'bg-pink-50 text-pink-600 border-pink-100/80',
                    badge: 'bg-pink-100 text-pink-800'
                };
            case 'Doctor':
                return { 
                    icon: <FaUserMd size={18} />, 
                    bg: 'bg-blue-50 text-blue-600 border-blue-100/80',
                    badge: 'bg-blue-100 text-blue-800'
                };
            case 'Hospital':
                return { 
                    icon: <FaHospital size={18} />, 
                    bg: 'bg-amber-50 text-amber-600 border-amber-100/80',
                    badge: 'bg-amber-100 text-amber-800'
                };
            case 'Ambulance':
                return { 
                    icon: <FaAmbulance size={18} />, 
                    bg: 'bg-rose-50 text-rose-600 border-rose-100/80',
                    badge: 'bg-rose-100 text-rose-800'
                };
            default:
                return { 
                    icon: <MdOutlineMedicalServices size={20} />, 
                    bg: 'bg-slate-50 text-slate-600 border-slate-200/80',
                    badge: 'bg-slate-200 text-slate-800'
                };
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 pb-20 selection:bg-emerald-100">
            {/* Header with Enhanced Visuals & Wide Container */}
            <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 transition-all">
                <div className="max-w-6xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => router.back()}
                            className="p-2.5 hover:bg-slate-100 rounded-2xl text-slate-500 hover:text-slate-900 transition-all cursor-pointer border border-transparent hover:border-slate-200"
                            title="Go Back"
                        >
                            <FiArrowLeft size={20} />
                        </button>
                        <div>
                            <div className="flex items-center gap-2.5">
                                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                    Notification Center
                                </h1>
                                {unreadCount > 0 ? (
                                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-rose-500 text-white shadow-xs">
                                        {unreadCount} Unread
                                    </span>
                                ) : (
                                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600">
                                        All Read
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-slate-400 font-semibold mt-0.5">
                                Showing all activity, alerts &amp; order updates
                            </p>
                        </div>
                    </div>

                    {/* Quick Action Buttons */}
                    {unreadCount > 0 && (
                        <button
                            disabled={isMarkingAll}
                            onClick={handleMarkAllRead}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black text-white bg-[#08B36A] hover:bg-[#079c5c] shadow-sm shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50 active:scale-95"
                        >
                            <FiCheckSquare size={14} />
                            <span>Mark all as read</span>
                        </button>
                    )}
                </div>
            </header>

            {/* Main Wider Feed Container */}
            <main className="max-w-6xl mx-auto px-4 sm:px-8 pt-8 space-y-6">
                
                {/* Notification Feed */}
                <div className="space-y-3.5">
                    {loading ? (
                        <div className="py-28 flex flex-col items-center justify-center gap-3">
                            <div className="w-9 h-9 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Loading notifications...</p>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="bg-white rounded-[2.5rem] p-16 md:p-24 text-center border border-slate-200/80 shadow-xs space-y-4">
                            <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center mx-auto text-slate-300 border border-slate-100">
                                <FiInbox size={34} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-lg font-black text-slate-800">You&apos;re completely caught up!</h3>
                                <p className="text-xs text-slate-400 max-w-md mx-auto font-medium leading-relaxed">
                                    No new alerts at this time. Live prescription verification, medicine tracking, and appointment status will show up here.
                                </p>
                            </div>
                        </div>
                    ) : (
                        notifications.map((item) => {
                            const { icon, bg, badge } = getServiceTheme(item.serviceType);
                            const isUnread = !item.isRead;
                            const billData = item.data || {};
                            const hasTotal = Boolean(billData.totalAmount);

                            return (
                                <div
                                    key={item._id}
                                    onClick={() => handleNotificationClick(item)}
                                    className={`relative p-5 sm:p-6 rounded-[2rem] border transition-all duration-300 cursor-pointer group flex items-start gap-4 sm:gap-5 ${
                                        isUnread 
                                            ? 'bg-white border-emerald-300 shadow-md shadow-emerald-500/5 hover:border-[#08B36A] hover:shadow-lg' 
                                            : 'bg-white/90 border-slate-200/90 hover:bg-white hover:border-slate-300 hover:shadow-sm'
                                    }`}
                                >
                                    {/* Unread Indicator Bar */}
                                    {isUnread && (
                                        <div className="absolute left-0 top-6 bottom-6 w-1.5 bg-[#08B36A] rounded-r-full shadow-xs" />
                                    )}

                                    {/* Category Service Icon */}
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0 transition-transform group-hover:scale-105 ${bg}`}>
                                        {icon}
                                    </div>

                                    {/* Content Block */}
                                    <div className="flex-1 min-w-0 space-y-1.5">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${badge}`}>
                                                    {item.serviceType || 'General'}
                                                </span>
                                                {isUnread && (
                                                    <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-600">
                                                        <span className="w-2 h-2 rounded-full bg-[#08B36A] animate-pulse" /> New Alert
                                                    </span>
                                                )}
                                            </div>

                                            <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1.5 whitespace-nowrap">
                                                <FiClock size={12} className="text-slate-400" />
                                                {new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>

                                        <h3 className={`text-sm sm:text-base leading-snug line-clamp-2 ${
                                            isUnread ? 'text-slate-900 font-black' : 'text-slate-800 font-bold'
                                        }`}>
                                            {item.title}
                                        </h3>

                                        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium line-clamp-2">
                                            {item.message}
                                        </p>

                                        {/* Bill / Invoice Interactive Chip */}
                                        {hasTotal && (
                                            <div className="mt-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 flex flex-wrap items-center justify-between gap-3">
                                                <div>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                                                        {billData.vendorName || "Provider"} Invoice
                                                    </span>
                                                    <span className="text-sm sm:text-base font-black text-slate-900 font-mono">
                                                        ₹{billData.totalAmount}
                                                    </span>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleNotificationClick(item);
                                                    }}
                                                    className="px-4 py-2 bg-slate-900 group-hover:bg-[#08B36A] text-white text-[11px] font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                                                >
                                                    <span>Review &amp; Pay</span>
                                                    <FiArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Options */}
                                    <div className="flex flex-col gap-1.5 shrink-0 pt-1">
                                        {isUnread && (
                                            <button
                                                title="Mark as read"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleMarkAsRead(item._id);
                                                }}
                                                className="p-2 text-slate-400 hover:text-[#08B36A] hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer"
                                            >
                                                <FiCheck size={16} />
                                            </button>
                                        )}
                                        <button
                                            title="Delete notification"
                                            onClick={(e) => handleDeleteNotification(e, item._id)}
                                            className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                                        >
                                            <FiTrash2 size={15} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="pt-6 pb-4 flex items-center justify-between border-t border-slate-200/80">
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                            Page {currentPage} of {totalPages} ({totalNotifications} total)
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                className="p-2.5 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs transition"
                            >
                                <FiChevronLeft size={16} />
                            </button>
                            <button
                                disabled={currentPage >= totalPages}
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                className="p-2.5 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs transition"
                            >
                                <FiChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
}