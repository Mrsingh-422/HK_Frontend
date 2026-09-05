"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
    FaTimes, FaEnvelope, FaPhone, FaMapMarkerAlt, FaUsers, 
    FaExclamationTriangle, FaIdCard, FaGlobe, FaCalendarAlt,
    FaUserCircle, FaUserShield, FaClock, FaHome, FaShoppingBag,
    FaStethoscope, FaFlask, FaPills, FaAmbulance, FaUserNurse,
    FaExternalLinkAlt, FaChevronLeft, FaChevronRight, FaCopy, FaCheckCircle,
    FaEye, FaFilePdf, FaDownload
} from "react-icons/fa";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import AdminAPI from "@/app/services/AdminAPI";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5002";

export default function UserDetailModal({ isOpen, onClose, user }) {
    const [activeTab, setActiveTab] = useState("overview");

    // Orders History State
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [orderType, setOrderType] = useState("All");
    const [orderPage, setOrderPage] = useState(1);
    const [orderTotalPages, setOrderTotalPages] = useState(1);
    const [orderTotal, setOrderTotal] = useState(0);

    // Selected Order for Modal Inspection
    const [selectedOrderForInspection, setSelectedOrderForInspection] = useState(null);

    // Copy Notification
    const [copiedId, setCopiedId] = useState(null);

    // --- FETCH USER ORDERS ---
    const fetchUserOrders = useCallback(async () => {
        const userId = user?._id || user?.id;
        if (!userId) return;

        setOrdersLoading(true);
        try {
            const params = {
                page: orderPage,
                limit: 8,
                ...(orderType !== "All" && { type: orderType })
            };

            const res = await AdminAPI.adminGetUserOrders(userId, params);
            if (res.data?.success || res.success || res.status === 200) {
                const data = res.data || res;
                setOrders(data.data || []);
                setOrderTotalPages(data.totalPages || 1);
                setOrderTotal(data.total || data.totalDocs || 0);
            }
        } catch (err) {
            console.error("Error fetching user orders:", err);
        } finally {
            setOrdersLoading(false);
        }
    }, [user, orderType, orderPage]);

    useEffect(() => {
        if (isOpen && activeTab === "orders") {
            fetchUserOrders();
        }
    }, [isOpen, activeTab, fetchUserOrders]);

    if (!isOpen || !user) return null;

    // --- UTILS ---
    const getImageUrl = (path) => {
        if (!path || path === "null") return null;
        if (path.startsWith('http')) return path;
        const cleanPath = path.replace(/^public\//, '/');
        return `${BACKEND_URL}${cleanPath}`;
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "N/A";
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const handleCopy = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2500);
    };

    const getCategoryIcon = (type) => {
        switch (type?.toLowerCase()) {
            case "doctor": return <FaStethoscope className="text-blue-500" />;
            case "lab": return <FaFlask className="text-purple-500" />;
            case "pharmacy": return <FaPills className="text-emerald-500" />;
            case "ambulance": return <FaAmbulance className="text-rose-500" />;
            case "nurse": return <FaUserNurse className="text-pink-500" />;
            default: return <FaShoppingBag className="text-slate-500" />;
        }
    };

    const getStatusBadge = (status) => {
        const s = status?.toLowerCase() || '';
        if (s.includes('delivered') || s.includes('completed') || s.includes('approved')) {
            return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        }
        if (s.includes('placed') || s.includes('pending') || s.includes('processing') || s.includes('in-progress')) {
            return 'bg-amber-50 text-amber-700 border-amber-200';
        }
        if (s.includes('cancelled') || s.includes('rejected')) {
            return 'bg-rose-50 text-rose-700 border-rose-200';
        }
        return 'bg-slate-100 text-slate-700 border-slate-200';
    };

    // --- TAB CONFIG ---
    const tabs = [
        { id: "overview", label: "Overview", icon: <FaUserCircle /> },
        { id: "orders", label: `Bookings & Orders`, icon: <FaShoppingBag /> },
        { id: "addresses", label: `Addresses (${user.userAddress?.length || 0})`, icon: <FaMapMarkerAlt /> },
        { id: "family", label: `Family (${user.familyMember?.length || 0})`, icon: <FaUsers /> },
        { id: "emergency", label: `SOS Contacts (${user.emergencyContact?.length || 0})`, icon: <FaExclamationTriangle /> },
    ];

    const orderCategories = [
        { id: "All", label: "All Orders" },
        { id: "Doctor", label: "Doctor Consults" },
        { id: "Lab", label: "Lab Tests" },
        { id: "Pharmacy", label: "Pharmacy Orders" },
        { id: "Nurse", label: "Nurse Care" },
        { id: "Ambulance", label: "Ambulance Rides" },
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md transition-opacity" onClick={onClose} />

            {/* Modal Container */}
            <div className="relative bg-white w-full max-w-5xl h-[92vh] rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col font-sans border border-slate-100">
                
                {/* --- HEADER SECTION --- */}
                <div className="bg-slate-950 p-8 text-white relative shrink-0">
                    <button 
                        onClick={onClose} 
                        className="absolute top-6 right-6 p-2.5 bg-white/10 hover:bg-white/20 rounded-full transition-all text-slate-300 hover:text-white"
                    >
                        <FaTimes size={16} />
                    </button>

                    <div className="flex flex-col md:flex-row items-center gap-6">
                        {/* Profile Picture */}
                        <div className="relative shrink-0">
                            <div className="w-24 h-24 bg-white rounded-3xl overflow-hidden shadow-2xl border-4 border-[#08B36A]">
                                {getImageUrl(user.profilePic || user.profilePicture) ? (
                                    <img src={getImageUrl(user.profilePic || user.profilePicture)} className="w-full h-full object-cover" alt="Profile" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-3xl font-black text-[#08B36A] bg-emerald-50">
                                        {user.name?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div className={`absolute -bottom-1 -right-1 px-3 py-0.5 rounded-full border-2 border-slate-950 text-[9px] font-black uppercase tracking-widest ${user.isActive !== false ? 'bg-[#08B36A] text-white' : 'bg-rose-500 text-white'}`}>
                                {user.isActive !== false ? 'Active' : 'Inactive'}
                            </div>
                        </div>

                        {/* Identity */}
                        <div className="text-center md:text-left flex-1 min-w-0">
                            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight truncate">{user.name}</h2>
                            <p className="text-[#08B36A] text-xs font-bold mt-1 flex items-center justify-center md:justify-start gap-1.5 font-mono">
                                <FaEnvelope className="text-slate-400" /> {user.email || "No email linked"}
                            </p>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-3">
                                <Badge icon={<FaIdCard />} label={`ID: ${(user._id || user.id || '').slice(-8).toUpperCase()}`} />
                                <Badge icon={<FaPhone />} label={`+91 ${user.phone || user.number || 'N/A'}`} />
                                <Badge icon={<FaGlobe />} label={user.city ? `${user.city}, ${user.state || 'India'}` : 'India'} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- NAVIGATION TABS --- */}
                <div className="bg-slate-50 border-b border-slate-200 px-6 overflow-x-auto no-scrollbar shrink-0">
                    <div className="flex gap-6">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 py-4 px-1 border-b-2 transition-all whitespace-nowrap text-xs font-extrabold uppercase tracking-wider ${
                                    activeTab === tab.id
                                        ? "border-[#08B36A] text-[#08B36A]"
                                        : "border-transparent text-slate-400 hover:text-slate-700"
                                }`}
                            >
                                {tab.icon} {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* --- CONTENT AREA --- */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-white">
                    
                    {/* 1. OVERVIEW TAB */}
                    {activeTab === "overview" && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                <InfoCard icon={<FaPhone />} label="Primary Mobile" value={`+91 ${user.phone || user.number || 'N/A'}`} />
                                <InfoCard icon={<FaGlobe />} label="Country" value={user.country || "India"} />
                                <InfoCard icon={<FaMapMarkerAlt />} label="Location" value={user.city ? `${user.city}, ${user.state || ''}` : "Not provided"} />
                                <InfoCard icon={<FaClock />} label="Registered Date" value={formatDate(user.createdAt)} />
                                <InfoCard icon={<FaCalendarAlt />} label="Last Activity" value={formatDate(user.updatedAt)} />
                                <InfoCard icon={<FaUserShield />} label="Insurance Link" value={user.insuranceId || "Not Linked"} />
                            </div>
                        </div>
                    )}

                    {/* 2. ORDERS & RECENT BOOKINGS TAB */}
                    {activeTab === "orders" && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            
                            {/* Category Filter Pills */}
                            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                                {orderCategories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => {
                                            setOrderType(cat.id);
                                            setOrderPage(1);
                                        }}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                                            orderType === cat.id
                                                ? "bg-slate-900 text-white shadow-sm"
                                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                        }`}
                                    >
                                        {cat.label}
                                    </button>
                                ))}
                            </div>

                            {/* Orders Table Container */}
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                {ordersLoading ? (
                                    <div className="py-20 flex flex-col items-center justify-center gap-2 text-slate-400">
                                        <AiOutlineLoading3Quarters className="animate-spin text-[#08B36A]" size={28} />
                                        <span className="text-xs font-bold uppercase tracking-wider">Loading user orders...</span>
                                    </div>
                                ) : orders.length === 0 ? (
                                    <div className="py-20 text-center text-slate-400 text-xs font-bold">
                                        No {orderType !== "All" ? orderType : ""} bookings or orders found for this user.
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-xs">
                                            <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                                                <tr>
                                                    <th className="py-3.5 px-5">Order ID</th>
                                                    <th className="py-3.5 px-5">Service Category</th>
                                                    <th className="py-3.5 px-5">Booking Details</th>
                                                    <th className="py-3.5 px-5">Total Amount</th>
                                                    <th className="py-3.5 px-5">Date & Time</th>
                                                    <th className="py-3.5 px-5">Status</th>
                                                    <th className="py-3.5 px-5 text-right">Inspect</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {orders.map((item) => (
                                                    <tr key={item.orderId || item.mongoId} className="hover:bg-slate-50/70 transition">
                                                        <td className="py-3.5 px-5 font-mono font-bold text-slate-900">
                                                            <div className="flex items-center gap-1.5">
                                                                <span>{item.orderId || item.mongoId?.slice(-8)}</span>
                                                                <button 
                                                                    onClick={() => handleCopy(item.orderId || item.mongoId, item.orderId)}
                                                                    className="text-slate-300 hover:text-slate-600"
                                                                >
                                                                    {copiedId === item.orderId ? <FaCheckCircle className="text-emerald-500" /> : <FaCopy size={11} />}
                                                                </button>
                                                            </div>
                                                        </td>

                                                        <td className="py-3.5 px-5">
                                                            <span className="inline-flex items-center gap-1.5 font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
                                                                {getCategoryIcon(item.type)}
                                                                {item.type}
                                                            </span>
                                                        </td>

                                                        <td className="py-3.5 px-5 font-medium text-slate-700 max-w-xs truncate" title={item.details}>
                                                            {item.details || "Standard Service Booking"}
                                                        </td>

                                                        <td className="py-3.5 px-5 font-black text-slate-900">
                                                            ₹{Number(item.total || 0).toLocaleString('en-IN')}
                                                        </td>

                                                        <td className="py-3.5 px-5 text-slate-500 font-medium">
                                                            {formatDate(item.date)}
                                                        </td>

                                                        <td className="py-3.5 px-5">
                                                            <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-extrabold uppercase ${getStatusBadge(item.status)}`}>
                                                                {item.status}
                                                            </span>
                                                        </td>

                                                        {/* Open Specialized Order Inspection Modal */}
                                                        <td className="py-3.5 px-5 text-right">
                                                            <button
                                                                onClick={() => setSelectedOrderForInspection(item)}
                                                                className="px-3 py-1 bg-slate-900 hover:bg-black text-white rounded-lg text-[11px] font-bold shadow-sm inline-flex items-center gap-1 transition"
                                                            >
                                                                <FaEye size={10} /> View Details
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {/* Orders Pagination */}
                                {orderTotalPages > 1 && (
                                    <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500">
                                        <span>Total Records: {orderTotal}</span>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setOrderPage(p => Math.max(1, p - 1))}
                                                disabled={orderPage === 1 || ordersLoading}
                                                className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200 disabled:opacity-30"
                                            >
                                                <FaChevronLeft size={10} />
                                            </button>
                                            <span>Page {orderPage} of {orderTotalPages}</span>
                                            <button
                                                onClick={() => setOrderPage(p => Math.min(orderTotalPages, p + 1))}
                                                disabled={orderPage === orderTotalPages || ordersLoading}
                                                className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200 disabled:opacity-30"
                                            >
                                                <FaChevronRight size={10} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 3. ADDRESSES TAB */}
                    {activeTab === "addresses" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-300">
                            {user.userAddress && user.userAddress.length > 0 ? (
                                user.userAddress.map((addr, idx) => (
                                    <div key={idx} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-emerald-200 transition-all space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-black uppercase text-slate-800 flex items-center gap-1.5">
                                                <FaHome className="text-[#08B36A]" /> {addr.addressType || "Home"}
                                            </span>
                                            {addr.isDefault && (
                                                <span className="bg-[#08B36A] text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase">Default</span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-600 font-medium leading-relaxed">
                                            {addr.houseNo}, {addr.sector}
                                            {addr.landmark && <span className="block text-slate-400 text-[11px]">Landmark: {addr.landmark}</span>}
                                        </p>
                                        <div className="pt-2 border-t border-slate-200/60 text-[11px] font-bold text-slate-500 flex justify-between">
                                            <span>{addr.city}, {addr.state}</span>
                                            <span>PIN: {addr.pincode}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-slate-400 text-xs py-10 col-span-2 text-center font-bold">No saved addresses.</p>
                            )}
                        </div>
                    )}

                    {/* 4. FAMILY MEMBERS TAB */}
                    {activeTab === "family" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-300">
                            {user.familyMember && user.familyMember.length > 0 ? (
                                user.familyMember.map((member, idx) => (
                                    <div key={idx} className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                        <div className="w-14 h-14 bg-emerald-100 text-[#08B36A] rounded-2xl flex items-center justify-center font-black text-lg shrink-0">
                                            {member.profilePic ? <img src={getImageUrl(member.profilePic)} className="w-full h-full object-cover rounded-2xl" /> : member.memberName?.charAt(0)}
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="text-sm font-black text-slate-900 uppercase truncate">{member.memberName}</h4>
                                            <p className="text-[#08B36A] text-[10px] font-extrabold uppercase tracking-wider">{member.relation} • {member.age} Yrs • {member.gender}</p>
                                            <p className="text-slate-400 text-xs font-mono mt-1 flex items-center gap-1.5"><FaPhone size={10} /> {member.phone || "No phone"}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-slate-400 text-xs py-10 col-span-2 text-center font-bold">No family members registered.</p>
                            )}
                        </div>
                    )}

                    {/* 5. EMERGENCY CONTACTS TAB */}
                    {activeTab === "emergency" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-300">
                            {user.emergencyContact && user.emergencyContact.length > 0 ? (
                                user.emergencyContact.map((contact, idx) => (
                                    <div key={idx} className="p-5 bg-rose-50/60 rounded-2xl border border-rose-100 flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-black text-slate-900 uppercase">{contact.contactName}</h4>
                                            <span className="text-[10px] font-bold text-rose-500 uppercase">{contact.relation}</span>
                                            <p className="text-xs font-mono font-bold text-slate-700 mt-1">{contact.phone}</p>
                                        </div>
                                        <a href={`tel:${contact.phone}`} className="p-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md transition">
                                            <FaPhone size={12} />
                                        </a>
                                    </div>
                                ))
                            ) : (
                                <p className="text-slate-400 text-xs py-10 col-span-2 text-center font-bold">No emergency contacts configured.</p>
                            )}
                        </div>
                    )}

                </div>

                {/* Footer Action */}
                <div className="p-5 border-t border-slate-100 shrink-0 bg-slate-50 flex justify-end">
                    <button 
                        onClick={onClose} 
                        className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-black transition shadow-sm"
                    >
                        Close Modal
                    </button>
                </div>
            </div>

            {/* --- SPECIALIZED ORDER INSPECTION MODAL --- */}
            <UserOrderDetailModal
                isOpen={Boolean(selectedOrderForInspection)}
                onClose={() => setSelectedOrderForInspection(null)}
                orderInfo={selectedOrderForInspection}
            />
        </div>
    );
}

// =========================================================================
// --- INLINE EMBEDDED: USER ORDER DETAIL INSPECTION MODAL ---
// =========================================================================
function UserOrderDetailModal({ isOpen, onClose, orderInfo }) {
    const [loading, setLoading] = useState(true);
    const [detailData, setDetailData] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);

    const getFullFileUrl = (path) => {
        if (!path) return null;
        if (path.startsWith("http")) return path;
        const cleanBase = BACKEND_URL.endsWith("/") ? BACKEND_URL.slice(0, -1) : BACKEND_URL;
        const cleanPath = path.startsWith("/") ? path : `/${path}`;
        return `${cleanBase}${cleanPath}`;
    };

    useEffect(() => {
        if (isOpen && orderInfo?.type && orderInfo?.mongoId) {
            fetchDetails();
        }
    }, [isOpen, orderInfo]);

    const fetchDetails = async () => {
        setLoading(true);
        setErrorMsg(null);
        try {
            const res = await AdminAPI.adminGetOrderDetails(orderInfo.type, orderInfo.mongoId);
            if (res.data?.success || res.success) {
                setDetailData(res.data?.data || res.data || {});
            } else {
                setErrorMsg(res.data?.message || "Failed to retrieve order details");
            }
        } catch (err) {
            console.error("Order details fetch error:", err);
            setErrorMsg(err.response?.data?.message || "Error loading order details from server");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !orderInfo) return null;

    const type = orderInfo.type;

    const getStatusBadge = (status) => {
        const s = status?.toLowerCase() || "";
        if (s.includes("delivered") || s.includes("completed") || s.includes("approved")) {
            return "bg-emerald-100 text-emerald-800 border-emerald-200";
        }
        if (s.includes("in-progress") || s.includes("service-started") || s.includes("placed")) {
            return "bg-amber-100 text-amber-800 border-amber-200";
        }
        if (s.includes("cancelled") || s.includes("rejected")) {
            return "bg-rose-100 text-rose-800 border-rose-200";
        }
        return "bg-slate-100 text-slate-800 border-slate-200";
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md transition-opacity" onClick={onClose} />

            <div className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col font-sans border border-slate-100">
                
                {/* --- HEADER --- */}
                <div className="p-6 bg-slate-950 text-white flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-white/10 rounded-2xl">
                            {type === "Doctor" && <FaStethoscope className="text-blue-400" size={20} />}
                            {type === "Lab" && <FaFlask className="text-purple-400" size={20} />}
                            {type === "Pharmacy" && <FaPills className="text-emerald-400" size={20} />}
                            {type === "Nurse" && <FaUserNurse className="text-pink-400" size={20} />}
                            {type === "Ambulance" && <FaAmbulance className="text-rose-400" size={20} />}
                        </div>
                        <div>
                            <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                                {type} Service Inspection
                            </h3>
                            <span className="text-[11px] text-slate-400 font-mono">
                                Reference ID: {detailData?.bookingId || detailData?.orderId || orderInfo.orderId || orderInfo.mongoId}
                            </span>
                        </div>
                    </div>

                    <button onClick={onClose} className="p-2.5 bg-white/10 hover:bg-white/20 rounded-full text-slate-300 hover:text-white transition">
                        <FaTimes size={16} />
                    </button>
                </div>

                {/* --- CONTENT AREA --- */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50/50 space-y-6 text-xs">
                    {loading ? (
                        <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-400">
                            <AiOutlineLoading3Quarters className="animate-spin text-[#08B36A]" size={32} />
                            <span className="text-xs font-bold uppercase tracking-wider">Loading inspection data...</span>
                        </div>
                    ) : errorMsg ? (
                        <div className="p-6 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-center font-bold">
                            {errorMsg}
                        </div>
                    ) : detailData && (
                        <>
                            {/* Status & Price Banner */}
                            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Current Status</span>
                                    <span className={`mt-1 inline-block px-3 py-1 rounded-full border text-[11px] font-extrabold uppercase ${getStatusBadge(detailData.status || detailData.deliveryStatus)}`}>
                                        {detailData.status || detailData.deliveryStatus || "Active"}
                                    </span>
                                </div>
                                <div className="text-left sm:text-right">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Total Payable</span>
                                    <span className="text-xl font-black text-slate-900">
                                        ₹{Number(detailData.totalAmount || detailData.billSummary?.totalAmount || detailData.priceBreakdown?.totalPrice || detailData.pricing?.total || 0).toLocaleString('en-IN')}
                                    </span>
                                </div>
                            </div>

                            {/* DOCTOR VIEW */}
                            {type === "Doctor" && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Card title="Practitioner & Facility">
                                            <DetailRow label="Doctor Name" value={detailData.doctorId?.name || "N/A"} bold />
                                            <DetailRow label="Speciality" value={detailData.doctorId?.speciality || "General Physician"} />
                                            <DetailRow label="Hospital Facility" value={detailData.hospitalId?.name || "Independent Clinic"} />
                                            {detailData.hospitalId?.address && <DetailRow label="Address" value={detailData.hospitalId?.address} />}
                                        </Card>

                                        <Card title="Appointment / Admission Info">
                                            <DetailRow label="Booking Type" value={detailData.bookingType || "Appointment"} highlight />
                                            {detailData.bookingType === "Admission" ? (
                                                <>
                                                    <DetailRow label="Bed Category" value={detailData.bedBookingType || "General Ward"} />
                                                    <DetailRow label="Assigned Bed" value={detailData.bedId?.bedNumber || "Pending Allocation"} bold />
                                                    <DetailRow label="Bed Price / Day" value={`₹${detailData.bedId?.pricePerDay || 0}`} />
                                                </>
                                            ) : (
                                                <>
                                                    <DetailRow label="Appointment Date" value={detailData.appointmentDate} />
                                                    <DetailRow label="Consultation Time" value={detailData.appointmentTime} />
                                                </>
                                            )}
                                        </Card>
                                    </div>

                                    {detailData.clinicalLogs && detailData.clinicalLogs.length > 0 && (
                                        <Card title="Clinical Logs & Observations">
                                            <div className="space-y-2">
                                                {detailData.clinicalLogs.map((log, idx) => (
                                                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
                                                        <span className="font-medium text-slate-700">{log.observation}</span>
                                                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[10px] font-bold">
                                                            {log.patientCondition}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </Card>
                                    )}
                                </div>
                            )}

                            {/* LAB VIEW */}
                            {type === "Lab" && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Card title="Sample Collection Setup">
                                            <DetailRow label="Collection Type" value={detailData.collectionType || "Lab Visit"} highlight />
                                            <DetailRow label="Slot Time" value={`${detailData.appointmentDate ? new Date(detailData.appointmentDate).toLocaleDateString() : ''} (${detailData.appointmentTime || ''})`} />
                                            {detailData.phlebotomistId && (
                                                <DetailRow label="Phlebotomist" value={`${detailData.phlebotomistId.name} (${detailData.phlebotomistId.phone})`} />
                                            )}
                                        </Card>

                                        <Card title="Billing Breakdown">
                                            <DetailRow label="Tests Total" value={`₹${detailData.billSummary?.itemTotal || 0}`} />
                                            <DetailRow label="Home Visit Charge" value={`₹${detailData.billSummary?.homeVisitCharge || 0}`} />
                                            <DetailRow label="Total Amount" value={`₹${detailData.billSummary?.totalAmount || 0}`} bold />
                                        </Card>
                                    </div>

                                    <Card title="Prescribed Tests & Health Packages">
                                        <div className="divide-y divide-slate-100">
                                            {detailData.items?.tests?.map((t, idx) => (
                                                <div key={idx} className="py-2.5 flex items-center justify-between">
                                                    <span className="font-bold text-slate-800">{t.testId?.testName || "Laboratory Test"}</span>
                                                    <span className="text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-bold">Test</span>
                                                </div>
                                            ))}
                                            {detailData.items?.packages?.map((p, idx) => (
                                                <div key={idx} className="py-2.5 flex items-center justify-between">
                                                    <span className="font-bold text-slate-800">{p.packageId?.packageName || "Package"}</span>
                                                    <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-bold">Package</span>
                                                </div>
                                            ))}
                                        </div>
                                    </Card>

                                    {detailData.reportFile && (
                                        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-emerald-800 font-bold">
                                                <FaFilePdf size={20} /> Diagnostic Report PDF Ready
                                            </div>
                                            <a
                                                href={getFullFileUrl(detailData.reportFile)}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="px-4 py-2 bg-[#08B36A] hover:bg-[#06965a] text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm transition"
                                            >
                                                <FaDownload size={12} /> View Report
                                            </a>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* PHARMACY VIEW */}
                            {type === "Pharmacy" && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Card title="Delivery & Payment">
                                            <DetailRow label="Payment Method" value={detailData.paymentMethod || "COD"} bold />
                                            <DetailRow label="Payment Status" value={detailData.paymentStatus || "Paid"} highlight />
                                            {detailData.driverId && (
                                                <DetailRow label="Delivery Agent" value={`${detailData.driverId.name} (📞 ${detailData.driverId.phone})`} />
                                            )}
                                        </Card>

                                        <Card title="Shipping Address">
                                            <p className="font-bold text-slate-800">{detailData.address?.name}</p>
                                            <p className="text-slate-600 mt-1">{detailData.address?.houseNo}, {detailData.address?.city || ''}</p>
                                            <p className="text-slate-500 font-mono mt-0.5">📞 {detailData.address?.phone}</p>
                                        </Card>
                                    </div>

                                    <Card title="Prescribed Medicines List">
                                        <table className="w-full text-left text-xs">
                                            <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold">
                                                <tr>
                                                    <th className="py-2.5 px-3">Medicine Name</th>
                                                    <th className="py-2.5 px-3">Qty</th>
                                                    <th className="py-2.5 px-3">Unit MRP</th>
                                                    <th className="py-2.5 px-3 text-right">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {detailData.items?.map((med, idx) => (
                                                    <tr key={idx}>
                                                        <td className="py-2.5 px-3 font-bold text-slate-800">{med.name}</td>
                                                        <td className="py-2.5 px-3 font-mono">{med.quantity}</td>
                                                        <td className="py-2.5 px-3 font-mono">₹{med.mrp}</td>
                                                        <td className="py-2.5 px-3 text-right font-bold text-slate-900">₹{med.taxableAmount || (med.mrp * med.quantity)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </Card>
                                </div>
                            )}

                            {/* NURSE VIEW */}
                            {type === "Nurse" && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Card title="Care Package & Timing">
                                            <DetailRow label="Service Title" value={detailData.serviceDetails?.title || "Nursing Care"} bold />
                                            <DetailRow label="Duration" value={detailData.schedule?.duration || "Multiple Days"} />
                                            <DetailRow label="Start Date" value={detailData.schedule?.startDate} />
                                            <DetailRow label="End Date" value={detailData.schedule?.endDate} />
                                        </Card>

                                        <Card title="Assigned Nurse Profile">
                                            <DetailRow label="Nurse Name" value={detailData.nurseId?.name || "Assigned Nurse"} bold />
                                            <DetailRow label="Speciality" value={detailData.nurseId?.speciality || "General Care"} />
                                            <DetailRow label="Base Price" value={`₹${detailData.priceBreakdown?.baseServicePrice || 0}`} />
                                        </Card>
                                    </div>
                                </div>
                            )}

                            {/* AMBULANCE VIEW */}
                            {type === "Ambulance" && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Card title="Emergency Dispatch & Triage">
                                            <DetailRow label="Service Type" value={detailData.serviceType || "Emergency Ambulance"} bold highlight />
                                            <DetailRow label="Case Ref" value={detailData.caseReference || "N/A"} />
                                            <DetailRow label="Triage Level" value={detailData.triageLevel || "Critical"} />
                                            <DetailRow label="Patient Condition" value={detailData.patientDetails?.condition || "Severe"} />
                                        </Card>

                                        <Card title="Pickup Location & Fare">
                                            <DetailRow label="Pickup Landmark" value={detailData.pickupLocation?.address || "GPS Location"} />
                                            <DetailRow label="Fare Billed" value={detailData.pricing?.total === 0 ? "₹0 (Free Emergency SOS)" : `₹${detailData.pricing?.total}`} bold />
                                        </Card>
                                    </div>

                                    {detailData.handoffDetails && (
                                        <Card title="Hospital Handoff & Completion Audit">
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                <div className="p-3 bg-slate-50 rounded-xl">
                                                    <span className="text-[10px] text-slate-400 font-bold block">Doctor</span>
                                                    <span className="font-bold text-slate-900">{detailData.handoffDetails.doctorName}</span>
                                                </div>
                                                <div className="p-3 bg-slate-50 rounded-xl">
                                                    <span className="text-[10px] text-slate-400 font-bold block">Ward</span>
                                                    <span className="font-bold text-slate-900">{detailData.handoffDetails.wardName}</span>
                                                </div>
                                                <div className="p-3 bg-slate-50 rounded-xl">
                                                    <span className="text-[10px] text-slate-400 font-bold block">Travel Time</span>
                                                    <span className="font-bold text-slate-900">{detailData.handoffDetails.travelTime}</span>
                                                </div>
                                                <div className="p-3 bg-slate-50 rounded-xl">
                                                    <span className="text-[10px] text-slate-400 font-bold block">Distance</span>
                                                    <span className="font-bold text-slate-900">{detailData.handoffDetails.totalDistance}</span>
                                                </div>
                                            </div>
                                        </Card>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* --- FOOTER --- */}
                <div className="p-5 border-t border-slate-100 bg-white flex justify-end shrink-0">
                    <button onClick={onClose} className="px-6 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition shadow-sm">
                        Close Inspection
                    </button>
                </div>
            </div>
        </div>
    );
}

// UI Sub-components
function Badge({ icon, label }) {
    return (
        <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-white/10">
            {icon} {label}
        </span>
    );
}

function InfoCard({ icon, label, value }) {
    return (
        <div className="flex items-center gap-3.5 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="text-lg bg-white p-2.5 rounded-xl shadow-sm text-[#08B36A] shrink-0">{icon}</div>
            <div className="min-w-0">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
                <p className="text-xs font-black text-slate-800 uppercase truncate">{value}</p>
            </div>
        </div>
    );
}

function Card({ title, children }) {
    return (
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">{title}</h4>
            {children}
        </div>
    );
}

function DetailRow({ label, value, bold = false, highlight = false }) {
    return (
        <div className="flex justify-between items-center py-1">
            <span className="text-slate-400 font-medium">{label}:</span>
            <span className={`text-right ${bold ? "font-black text-slate-900" : "font-semibold text-slate-700"} ${highlight ? "text-[#08B36A]" : ""}`}>
                {value || "N/A"}
            </span>
        </div>
    );
}