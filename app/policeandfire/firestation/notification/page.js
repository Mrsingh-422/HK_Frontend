'use client';
import React, { useState, useEffect } from 'react';
import FireStationAPI from '@/app/services/FireStationAPI';

export default function Notifications() {
  const [notifications, setNotifications] = useState({ today: [], yesterday: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingRead, setIsMarkingRead] = useState(false); // Naya state button loader ke liye
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setIsLoading(true);
        const res = await FireStationAPI.getNotifications();
        if (res.success) {
          setNotifications(res.data);
        } else {
          setError("Failed to load notifications");
        }
      } catch (err) {
        console.error("Error fetching notifications:", err);
        setError("Network error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // MARK ALL AS READ FUNCTIONALITY 👇
  const handleMarkAllAsRead = async () => {
    // Agar dono arrays khali hain toh call karne ka fayda nahi
    if (notifications.today.length === 0 && notifications.yesterday.length === 0) return;

    try {
      setIsMarkingRead(true);
      const res = await FireStationAPI.markAllNotificationsRead();
      
      if (res.success) {
        // UI ko instantly update karein (Optimistic update)
        // Har notification ka isRead true kar denge taaki UI pe green dots hat jayein
        setNotifications((prev) => ({
          today: prev.today.map(noti => ({ ...noti, isRead: true })),
          yesterday: prev.yesterday.map(noti => ({ ...noti, isRead: true }))
        }));
      }
    } catch (err) {
      console.error("Error marking notifications as read:", err);
      alert("Failed to mark as read. Please try again.");
    } finally {
      setIsMarkingRead(false);
    }
  };

  // Helper function to render Empty State
  const renderEmptyState = (message) => (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 mb-4">
        <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      </div>
      <h3 className="text-sm font-medium text-gray-900">{message}</h3>
      <p className="text-xs text-gray-500 mt-1">When you get notifications, they'll show up here.</p>
    </div>
  );

  // Helper function to render a Notification Item
  const renderNotificationItem = (item, index) => (
    <div key={index} className={`flex gap-4 p-4 rounded-xl border transition-colors cursor-default ${item.isRead === false ? 'bg-emerald-50/50 border-emerald-100' : 'bg-white border-gray-100 hover:bg-gray-50'}`}>
      <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div className="flex-grow">
        <div className="flex justify-between items-start">
            <h4 className={`text-sm font-semibold ${item.isRead === false ? 'text-gray-900' : 'text-gray-700'}`}>
                {item.title || "System Alert"}
            </h4>
            <span className="text-xs text-gray-400 whitespace-nowrap ml-4">{item.time || "Just now"}</span>
        </div>
        <p className="text-sm text-gray-500 mt-1 leading-relaxed">
            {item.desc || "You have a new update in the system."}
        </p>
      </div>
      {/* Unread dot indicator (Ye hide ho jayega jab Mark As Read click hoga) */}
      {item.isRead === false && (
          <div className="flex-shrink-0 flex items-center">
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-sm shadow-emerald-200"></div>
          </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 font-sans">
      
      {/* Header Section */}
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl shadow-sm mb-6 border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
          <p className="text-sm text-gray-500 mt-1">Stay updated with alerts and system messages</p>
        </div>
        
        {/* MARK ALL AS READ BUTTON 👇 */}
        <button 
          onClick={handleMarkAllAsRead}
          disabled={isMarkingRead}
          className={`flex items-center gap-2 text-sm font-medium transition-colors ${
            isMarkingRead ? 'text-gray-400 cursor-not-allowed' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          {isMarkingRead ? (
            <>
               {/* Small Spinner */}
               <svg className="animate-spin h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
               </svg>
               Marking...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Mark all as read
            </>
          )}
        </button>
      </div>

      <div className="max-w-4xl mx-auto flex flex-col gap-8">
        
        {isLoading ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
                {[1, 2, 3].map(i => (
                    <div key={i} className="flex gap-4">
                        <div className="w-10 h-10 bg-gray-200 rounded-full shrink-0"></div>
                        <div className="flex-grow space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                            <div className="h-3 bg-gray-200 rounded w-full"></div>
                        </div>
                    </div>
                ))}
            </div>
        ) : error ? (
            <div className="bg-red-50 text-red-500 p-4 rounded-xl text-center text-sm font-medium border border-red-100">
                {error}
            </div>
        ) : (
            <>
                <section>
                    <h2 className="text-xs font-bold text-gray-500 tracking-widest uppercase mb-4 ml-2">Today</h2>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                        {notifications.today && notifications.today.length > 0 ? (
                            <div className="flex flex-col gap-3">
                                {notifications.today.map((item, idx) => renderNotificationItem(item, idx))}
                            </div>
                        ) : (
                            renderEmptyState("No notifications today")
                        )}
                    </div>
                </section>

                <section>
                    <h2 className="text-xs font-bold text-gray-500 tracking-widest uppercase mb-4 ml-2">Yesterday</h2>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                        {notifications.yesterday && notifications.yesterday.length > 0 ? (
                            <div className="flex flex-col gap-3">
                                {notifications.yesterday.map((item, idx) => renderNotificationItem(item, idx))}
                            </div>
                        ) : (
                            renderEmptyState("No notifications yesterday")
                        )}
                    </div>
                </section>
            </>
        )}
      </div>
    </div>
  );
}