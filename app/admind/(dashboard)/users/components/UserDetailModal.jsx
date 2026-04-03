"use client";
import React, { useState } from "react";
import { 
    FaTimes, FaEnvelope, FaPhone, FaMapMarkerAlt, FaUsers, 
    FaExclamationTriangle, FaIdCard, FaGlobe, FaCalendarAlt,
    FaUserCircle, FaUserShield, FaClock, FaHome, FaStar
} from "react-icons/fa";
import { IoShieldCheckmarkSharp } from "react-icons/io5";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function UserDetailModal({ isOpen, onClose, user }) {
    const [activeTab, setActiveTab] = useState("overview");

    if (!isOpen || !user) return null;

    // --- UTILS ---
    const getImageUrl = (path) => {
        if (!path || path === "null") return null;
        if (path.startsWith('http')) return path;
        const cleanPath = path.replace(/^public\//, '/');
        return `${BACKEND_URL}${cleanPath}`;
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-GB', {
            day: 'numeric', month: 'long', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    // --- TAB CONFIG ---
    const tabs = [
        { id: "overview", label: "Overview", icon: <FaUserCircle /> },
        { id: "addresses", label: `Addresses (${user.userAddress?.length || 0})`, icon: <FaMapMarkerAlt /> },
        { id: "family", label: `Family Members (${user.familyMember?.length || 0})`, icon: <FaUsers /> },
        { id: "emergency", label: `SOS Contacts (${user.emergencyContact?.length || 0})`, icon: <FaExclamationTriangle /> },
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md transition-opacity" onClick={onClose} />

            {/* Modal Container */}
            <div className="relative bg-white w-full max-w-5xl h-[90vh] rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 flex flex-col">
                
                {/* --- HEADER SECTION --- */}
                <div className="bg-slate-900 p-8 text-white relative shrink-0">
                    <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all">
                        <FaTimes size={18} />
                    </button>

                    <div className="flex flex-col md:flex-row items-center gap-8">
                        {/* Profile Pic */}
                        <div className="relative">
                            <div className="w-32 h-32 bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-[#08B36A]">
                                {getImageUrl(user.profilePic) ? (
                                    <img src={getImageUrl(user.profilePic)} className="w-full h-full object-cover" alt="Profile" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-4xl font-black text-[#08B36A]">
                                        {user.name?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div className={`absolute -bottom-2 -right-2 px-4 py-1.5 rounded-full border-4 border-slate-900 text-[10px] font-black uppercase tracking-widest shadow-lg ${user.profileStatus === 'Approved' ? 'bg-[#08B36A]' : 'bg-amber-500'}`}>
                                {user.profileStatus}
                            </div>
                        </div>

                        {/* Identity */}
                        <div className="text-center md:text-left">
                            <h2 className="text-4xl font-black uppercase tracking-tighter italic leading-none">{user.name}</h2>
                            <p className="text-[#08B36A] font-bold mt-2 flex items-center justify-center md:justify-start gap-2">
                                <FaEnvelope className="text-slate-400" /> {user.email}
                            </p>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-4">
                                <Badge icon={<FaIdCard />} label={`ID: ${user._id.slice(-8).toUpperCase()}`} />
                                <Badge icon={<FaUserShield />} label={`Role: ${user.role}`} />
                                <Badge icon={<FaClock />} label={`v${user.__v}`} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- NAVIGATION TABS --- */}
                <div className="bg-slate-50 border-b border-slate-200 px-8 overflow-x-auto no-scrollbar shrink-0">
                    <div className="flex gap-8">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 py-5 px-1 border-b-4 transition-all whitespace-nowrap text-[11px] font-black uppercase tracking-[0.2em] ${
                                    activeTab === tab.id
                                        ? "border-[#08B36A] text-[#08B36A]"
                                        : "border-transparent text-slate-400 hover:text-slate-600"
                                }`}
                            >
                                {tab.icon} {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* --- CONTENT AREA --- */}
                <div className="flex-1 overflow-y-auto p-10 bg-white custom-scrollbar">
                    
                    {/* 1. OVERVIEW TAB */}
                    {activeTab === "overview" && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <InfoCard icon={<FaPhone />} label="Contact Number" value={`+91 ${user.phone}`} />
                                <InfoCard icon={<FaGlobe />} label="Nationality" value={user.country} />
                                <InfoCard icon={<FaMapMarkerAlt />} label="Current City" value={`${user.city}, ${user.state}`} />
                                <InfoCard icon={<FaClock />} label="Account Created" value={formatDate(user.createdAt)} />
                                <InfoCard icon={<FaCalendarAlt />} label="Last Updated" value={formatDate(user.updatedAt)} />
                                <InfoCard icon={<FaUserShield />} label="Insurance ID" value={user.insuranceId || "Not Linked"} />
                            </div>
                        </div>
                    )}

                    {/* 2. ADDRESSES TAB */}
                    {activeTab === "addresses" && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {user.userAddress?.map((addr, idx) => (
                                <div key={idx} className="relative p-8 bg-slate-50 rounded-[2.5rem] border-2 border-transparent hover:border-[#08B36A]/20 transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-white rounded-2xl text-[#08B36A] shadow-sm"><FaHome size={20} /></div>
                                        {addr.isDefault && <span className="bg-[#08B36A] text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Default</span>}
                                    </div>
                                    <h4 className="text-xl font-black text-slate-800 uppercase italic mb-1">{addr.addressType}</h4>
                                    <p className="text-sm font-bold text-slate-600 leading-relaxed">
                                        {addr.houseNo}, {addr.sector}<br />
                                        {addr.landmark && <span className="text-slate-400 text-xs font-medium italic">Landmark: {addr.landmark}</span>}
                                    </p>
                                    <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-2 gap-2 text-[10px] font-black uppercase text-slate-400">
                                        <span>City: <span className="text-slate-700">{addr.city}</span></span>
                                        <span>Pin: <span className="text-slate-700">{addr.pincode}</span></span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* 3. FAMILY MEMBERS TAB */}
                    {activeTab === "family" && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {user.familyMember?.map((member, idx) => (
                                <div key={idx} className="flex items-center gap-6 p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
                                    <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center text-[#08B36A] text-2xl font-bold shrink-0 overflow-hidden">
                                        {member.profilePic ? <img src={getImageUrl(member.profilePic)} className="w-full h-full object-cover" /> : member.memberName.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-lg font-black text-slate-800 uppercase tracking-tighter truncate">{member.memberName}</h4>
                                        <p className="text-[#08B36A] text-[10px] font-black uppercase tracking-widest">{member.relation} • {member.age} Yrs • {member.gender}</p>
                                        <p className="text-slate-400 text-xs mt-2 font-bold flex items-center gap-2"><FaPhone /> {member.phone}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* 4. EMERGENCY CONTACTS TAB */}
                    {activeTab === "emergency" && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {user.emergencyContact?.map((contact, idx) => (
                                <div key={idx} className="group p-8 bg-rose-50 rounded-[2.5rem] border-2 border-transparent hover:border-rose-200 transition-all">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="p-3 bg-white rounded-2xl text-rose-500 shadow-sm group-hover:scale-110 transition-transform"><FaExclamationTriangle size={20} /></div>
                                        <div>
                                            <h4 className="text-xl font-black text-slate-800 uppercase tracking-tighter">{contact.contactName}</h4>
                                            <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">{contact.relation}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between bg-white/60 p-4 rounded-2xl">
                                        <span className="text-sm font-black text-slate-700 tracking-[0.1em]">{contact.phone}</span>
                                        <a href={`tel:${contact.phone}`} className="p-2 bg-rose-500 text-white rounded-xl shadow-lg shadow-rose-200 active:scale-90 transition-all">
                                            <FaPhone size={12} />
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                </div>

                {/* Footer Action */}
                <div className="p-6 border-t border-slate-100 shrink-0 bg-slate-50 flex justify-end gap-3">
                    <button onClick={onClose} className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-black transition-all active:scale-95 shadow-xl">
                        Terminate Session
                    </button>
                </div>
            </div>
        </div>
    );
}

/** UI Sub-components */
function Badge({ icon, label }) {
    return (
        <span className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/5">
            {icon} {label}
        </span>
    );
}

function InfoCard({ icon, label, value }) {
    return (
        <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100 shadow-inner group hover:bg-white hover:shadow-md transition-all">
            <div className="text-xl bg-white p-3 rounded-xl shadow-sm border border-slate-50 group-hover:text-[#08B36A] transition-colors">{icon}</div>
            <div className="min-w-0">
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1 leading-none">{label}</p>
                <p className="text-sm font-black text-slate-800 uppercase truncate tracking-tighter">{value}</p>
            </div>
        </div>
    );
}