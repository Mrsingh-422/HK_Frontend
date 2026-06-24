'use client'
import React, { useState, useEffect } from 'react'
import { FaTimes, FaCheckDouble, FaTrash, FaAmbulance, FaUserMd, FaCogs, FaFileAlt } from 'react-icons/fa'
import PoliceAPI from '@/app/services/PoliceAPI'

export default function NotificationDrawer({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch API on Drawer Open
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await PoliceAPI.getStationNotifications();
      if (res.success && res.data) {
        setNotifications(res.data);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  // Delete Individual Notification
  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      // Optimistic UI Update
      setNotifications(prev => prev.filter(n => n._id !== id));
      // Backend call
      await PoliceAPI.deleteStationNotification(id);
    } catch (error) {
      console.error("Failed to delete notification");
      fetchNotifications(); // Rollback if failed
    }
  };

  // 👈 NAYA LOGIC: Mark All as Read
  const handleMarkAllRead = async () => {
    try {
      // Optimistic UI update: Make all local notifications read (hides the green dot)
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      // Backend API call
      await PoliceAPI.markAllNotificationsRead();
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const getIcon = (type) => {
    switch(type) {
      case 'Emergency': return <div className="p-3 bg-red-50 text-red-500 rounded-full"><FaAmbulance size={18}/></div>;
      case 'Leave Request': return <div className="p-3 bg-blue-50 text-blue-500 rounded-full"><FaUserMd size={18}/></div>;
      case 'System': return <div className="p-3 bg-orange-50 text-orange-500 rounded-full"><FaCogs size={18}/></div>;
      default: return <div className="p-3 bg-emerald-50 text-emerald-500 rounded-full"><FaFileAlt size={18}/></div>;
    }
  };

  const formatTimeAgo = (dateStr) => {
    const diffMins = Math.floor((new Date() - new Date(dateStr)) / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} mins ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs} hours ago`;
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  };

  // 👈 NAYA LOGIC: Categorize into Today & Older (For Figma UI)
  const categorizeNotifications = (notifs) => {
    const today = [];
    const older = [];
    const todayDate = new Date().setHours(0,0,0,0);

    notifs.forEach(n => {
      const notifDate = new Date(n.createdAt).setHours(0,0,0,0);
      if (notifDate === todayDate) today.push(n);
      else older.push(n);
    });
    return { today, older };
  };

  const { today, older } = categorizeNotifications(notifications);

  return (
    <>
      {/* Background Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-[90] transition-opacity"
          onClick={onClose}
        ></div>
      )}

      {/* Drawer Panel */}
      <div className={`fixed inset-y-0 right-0 z-[100] w-full max-w-sm bg-slate-50 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-white border-b border-slate-100">
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 bg-slate-50 rounded-full transition-colors">
              <FaTimes size={16} />
            </button>
            <h2 className="text-xl font-black text-slate-800">Notifications</h2>
          </div>
          <button 
            onClick={handleMarkAllRead} 
            className="text-[10px] font-black text-[#08B36A] uppercase tracking-widest flex items-center gap-1.5 hover:text-emerald-700 transition-colors"
          >
            <FaCheckDouble size={14} /> Mark all read
          </button>
        </div>

        {/* Scrollable List */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-10 opacity-50">
               <div className="w-8 h-8 border-4 border-slate-200 border-t-[#08B36A] rounded-full animate-spin"></div>
               <p className="text-xs font-bold text-slate-400 mt-3 uppercase tracking-widest">Syncing...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-10 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">
              No new notifications
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* TODAY SECTION */}
              {today.length > 0 && (
                <div>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-2">Today</h3>
                  <div className="space-y-3">
                    {today.map(item => (
                      <NotificationCard 
                        key={item._id} 
                        item={item} 
                        icon={getIcon(item.type)}
                        time={formatTimeAgo(item.createdAt)}
                        onDelete={(e) => handleDelete(e, item._id)} 
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* YESTERDAY / OLDER SECTION */}
              {older.length > 0 && (
                <div>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-2">Yesterday & Older</h3>
                  <div className="space-y-3">
                    {older.map(item => (
                      <NotificationCard 
                        key={item._id} 
                        item={item} 
                        icon={getIcon(item.type)}
                        time={formatTimeAgo(item.createdAt)}
                        onDelete={(e) => handleDelete(e, item._id)} 
                      />
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </>
  )
}

// ----------------------------------------------------
// Sub-Component for Individual Notification UI
// ----------------------------------------------------
function NotificationCard({ item, icon, time, onDelete }) {
  return (
    <div className={`relative bg-white rounded-2xl p-4 border shadow-sm group hover:shadow-md transition-all ${
      !item.isRead ? 'border-l-4 border-l-[#08B36A] border-y-slate-100 border-r-slate-100' : 'border-slate-100'
    }`}>
      <div className="flex gap-4">
        {/* Icon */}
        <div className="shrink-0">{icon}</div>
        
        {/* Content */}
        <div className="flex-1 pr-8">
          <div className="flex justify-between items-start mb-1">
            <h4 className="text-sm font-black text-slate-800 leading-tight">{item.title}</h4>
            {/* Green Dot for Unread */}
            {!item.isRead && <span className="w-2 h-2 bg-[#08B36A] rounded-full shrink-0"></span>}
          </div>
          <p className="text-xs font-medium text-slate-500 leading-relaxed mb-2 line-clamp-2">
            {item.message}
          </p>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{time}</span>
        </div>
      </div>

      {/* Delete Button (Swipe style hover effect) */}
      <button 
        onClick={onDelete}
        className="absolute top-1/2 right-3 -translate-y-1/2 w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all shadow-sm"
        title="Delete Notification"
      >
        <FaTrash size={12} />
      </button>
    </div>
  )
}