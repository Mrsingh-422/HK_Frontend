'use client'
import React from 'react';
import { 
    FaUser, FaTimes, FaPhoneAlt, FaIdBadge, 
    FaMotorcycle, FaCalendarAlt, FaFileAlt, FaUserShield 
} from 'react-icons/fa';

export default function DriverInfoModal({ isOpen, onClose, driver }) {
    if (!isOpen || !driver) return null;

    // Helper to format backend image paths
    const getFullUrl = (path) => {
        if (!path) return 'https://via.placeholder.com/150';
        if (path.startsWith('http')) return path;
        return `${process.env.NEXT_PUBLIC_BACKEND_URL}/${path.replace('public/', '')}`;
    };

    // Format the "createdAt" date from API
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300 border border-gray-100">
                
                {/* --- HEADER --- */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                        <FaUserShield className="text-emerald-500" /> Driver Profile
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-xl transition-all">
                        <FaTimes size={18} />
                    </button>
                </div>

                <div className="p-6">
                    {/* --- PROFILE TOP --- */}
                    <div className="flex flex-col items-center border-b border-gray-50 pb-6">
                        <div className="relative group">
                            <img 
                                src={getFullUrl(driver.profilePic)} 
                                alt={driver.name} 
                                className="w-28 h-28 rounded-3xl border-4 border-white shadow-xl object-cover" 
                                onError={(e) => e.target.src = 'https://via.placeholder.com/150'}
                            />
                            <div className={`absolute -bottom-2 -right-2 px-3 py-1 rounded-full border-2 border-white text-[9px] font-black uppercase tracking-tighter shadow-lg ${
                                driver.status === 'Online' || driver.status === 'Available' 
                                ? 'bg-emerald-500 text-white' 
                                : 'bg-gray-400 text-white'
                            }`}>
                                {driver.status === 'Available' ? 'Online' : driver.status}
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mt-4">{driver.name}</h3>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">@{driver.username}</p>
                    </div>

                    {/* --- INFO GRID --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
                        <DetailItem icon={<FaIdBadge className="text-blue-500" />} label="System ID" value={driver._id?.slice(-8).toUpperCase()} />
                        <DetailItem icon={<FaPhoneAlt className="text-emerald-500" />} label="Contact" value={driver.phone} />
                        <DetailItem icon={<FaMotorcycle className="text-purple-500" />} label="Vehicle No." value={driver.vehicleNumber || 'N/A'} />
                        <DetailItem icon={<FaCalendarAlt className="text-orange-500" />} label="Joined On" value={formatDate(driver.createdAt)} />
                    </div>

                    {/* --- DOCUMENTS SECTION (New) --- */}
                    <div className="mt-6">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Verified Documents</h4>
                        <div className="grid grid-cols-3 gap-3">
                            <DocThumbnail label="License" path={driver.documents?.license} getFullUrl={getFullUrl} />
                            <DocThumbnail label="Certificate" path={driver.documents?.certificate} getFullUrl={getFullUrl} />
                            <DocThumbnail label="RC Book" path={driver.documents?.rcImage} getFullUrl={getFullUrl} />
                        </div>
                    </div>
                </div>

                {/* --- FOOTER --- */}
                <div className="p-4 bg-gray-50 flex gap-3">
                    <button 
                        onClick={onClose} 
                        className="w-full py-3 bg-white border border-gray-200 text-gray-700 rounded-2xl font-bold text-sm hover:bg-gray-100 transition-all shadow-sm"
                    >
                        Close Details
                    </button>
                </div>
            </div>
        </div>
    );
}

// Sub-component for individual info rows
function DetailItem({ icon, label, value }) {
    return (
        <div className="flex items-center gap-3 p-3 bg-gray-50/50 rounded-2xl border border-gray-100/50 hover:bg-white transition-colors">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm border border-gray-50">
                {icon}
            </div>
            <div>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider leading-none mb-1">{label}</p>
                <p className="text-sm font-bold text-gray-700 leading-none">{value}</p>
            </div>
        </div>
    );
}

// Sub-component for document previews
function DocThumbnail({ label, path, getFullUrl }) {
    return (
        <div className="group cursor-pointer">
            <div className="aspect-square rounded-xl bg-gray-100 border border-gray-200 overflow-hidden relative">
                {path ? (
                    <>
                        <img src={getFullUrl(path)} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt={label} />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                    </>
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50">
                        <FaFileAlt className="text-gray-200" size={20} />
                    </div>
                )}
            </div>
            <p className="text-[9px] font-bold text-gray-500 text-center mt-1.5 uppercase tracking-tighter">{label}</p>
        </div>
    );
}