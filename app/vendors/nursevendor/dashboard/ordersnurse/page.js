'use client';

import React, { useState, useEffect } from 'react';
import { 
    FaMapMarkerAlt, FaCalendarAlt, FaPhoneAlt, FaImage, FaEye, FaUserAlt, 
    FaTimesCircle, FaExclamationTriangle, FaIdCard, FaSpinner,
    FaStethoscope, FaBoxOpen, FaInfoCircle, FaTrashAlt, FaChevronLeft, FaChevronRight,
    FaSyncAlt
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import NurseAPI from '@/app/services/NurseAPI';

// --- SUB-COMPONENT: UNIFIED ORDER DETAIL MODAL ---
const UnifiedOrderDetailModal = ({ isOpen, order, activeTab, imageBaseUrl, formatDate, onClose }) => {
    if (!isOpen || !order) return null;

    const isHistory = activeTab === 'Approved' || activeTab === 'Rejected';
    const isRejected = activeTab === 'Rejected';

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-3xl rounded-[40px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                <div className={`${isRejected ? 'bg-red-500' : 'bg-[#08B36A]'} p-6 text-white flex justify-between items-center`}>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center border border-white/30 backdrop-blur-sm">
                            <FaIdCard size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">{order.serviceDetails?.title || 'Request Details'}</h2>
                            <p className="text-xs text-white/90 mt-1 uppercase tracking-widest">
                                Order ID: {order.bookingId || order._id?.slice(-8)}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-white hover:text-red-200 transition-colors">
                        <FaTimesCircle size={28} />
                    </button>
                </div>

                <div className="p-8 max-h-[65vh] overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        
                        {/* Profile Details */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 border-b pb-2">
                                <FaUserAlt className={isRejected ? 'text-red-500' : 'text-[#08B36A]'} />
                                <h3 className="font-bold text-gray-800 uppercase text-xs tracking-wider">Patient Profile</h3>
                            </div>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Name:</span> 
                                    <span className="font-bold text-gray-800">{order.patients?.[0]?.name || order.address?.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Relation:</span> 
                                    <span className="font-bold text-gray-800">{order.patients?.[0]?.relation || 'Self'}</span>
                                </div>
                                {order.healthDetails?.height && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Height / Lang:</span> 
                                        <span className="font-bold text-gray-800">{order.healthDetails?.height} cm / {order.healthDetails?.language || 'N/A'}</span>
                                    </div>
                                )}
                                {(isHistory && activeTab === 'Approved') && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Phone:</span> 
                                        <span className="font-bold text-blue-600">{order.address?.phone || 'N/A'}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Schedule Details */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 border-b pb-2">
                                <FaCalendarAlt className={isRejected ? 'text-red-500' : 'text-[#08B36A]'} />
                                <h3 className="font-bold text-gray-800 uppercase text-xs tracking-wider">Service Schedule</h3>
                            </div>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Type:</span> 
                                    <span className={`font-bold uppercase ${order.priceBreakdown?.fasterServiceCharge > 0 ? 'text-amber-600' : 'text-red-500'}`}>
                                        {order.priceBreakdown?.fasterServiceCharge > 0 ? 'Express Priority' : (order.serviceDetails?.type || 'Standard')}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Starts:</span> 
                                    <span className="font-bold text-gray-800">{formatDate(order.schedule?.startDate)}</span>
                                </div>
                                {order.schedule?.endDate && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Ends:</span> 
                                        <span className="font-bold text-gray-800">{formatDate(order.schedule?.endDate)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Total Price:</span> 
                                    <span className={`font-bold text-lg ${isRejected ? 'text-red-500' : 'text-[#08B36A]'}`}>
                                        ₹{order.priceBreakdown?.totalPrice || order.totalPrice}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Location Details */}
                        <div className="md:col-span-2 space-y-3">
                            <div className="flex items-center gap-2 border-b pb-2">
                                <FaMapMarkerAlt className={isRejected ? 'text-red-500' : 'text-[#08B36A]'} />
                                <h3 className="font-bold text-gray-800 uppercase text-xs tracking-wider">Service Location</h3>
                            </div>
                            <p className="bg-gray-50 p-4 rounded-2xl text-sm text-gray-600 leading-relaxed border border-gray-100">
                                {order.address?.houseNo}, {order.address?.city} ({order.address?.addressType || 'Home'})
                            </p>
                        </div>

                        {/* Consumables List */}
                        {order.selectedConsumables?.length > 0 && (
                            <div className="md:col-span-2 space-y-3">
                                <div className="flex items-center gap-2 border-b pb-2">
                                    <FaBoxOpen className="text-[#08B36A]" />
                                    <h3 className="font-bold text-gray-800 uppercase text-xs tracking-wider">Consumables Needed</h3>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {order.selectedConsumables.map((c, i) => (
                                        <div key={i} className="flex justify-between p-3 bg-gray-50 rounded-xl text-xs border border-gray-100 font-bold">
                                            <span>{c.itemName}</span>
                                            <span className="text-[#08B36A]">₹{c.price}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Prescription Media */}
                        {order.prescriptionImage && (
                            <div className="md:col-span-2 space-y-3">
                                <div className="flex items-center gap-2 border-b pb-2">
                                    <FaImage className="text-[#08B36A]" />
                                    <h3 className="font-bold text-gray-800 uppercase text-xs tracking-wider">Prescription Photo</h3>
                                </div>
                                <div className="rounded-2xl border-2 border-dashed border-gray-200 p-2 overflow-hidden">
                                    <img 
                                        src={`${imageBaseUrl}/${order.prescriptionImage}`} 
                                        alt="Prescription" 
                                        className="w-full h-auto rounded-xl object-contain max-h-80 bg-gray-50" 
                                    />
                                </div>
                            </div>
                        )}

                        {/* Instructions */}
                        {order.healthDetails?.specialInstructions && (
                            <div className="md:col-span-2 space-y-3">
                                <div className="flex items-center gap-2 border-b pb-2">
                                    <FaStethoscope className="text-[#08B36A]" />
                                    <h3 className="font-bold text-gray-800 uppercase text-xs tracking-wider">Instructions</h3>
                                </div>
                                <div className="p-4 bg-blue-50/50 text-blue-800 rounded-2xl text-xs italic border border-blue-100">
                                    "{order.healthDetails?.specialInstructions}"
                                </div>
                            </div>
                        )}

                        {/* Rejection Logs */}
                        {isRejected && (
                            <div className="md:col-span-2 bg-red-50 p-6 rounded-[32px] border border-red-100">
                                <div className="flex items-center gap-2 text-red-700 font-black text-[11px] uppercase mb-2 tracking-widest">
                                    <FaExclamationTriangle /> Decline Reason
                                </div>
                                <p className="text-sm text-red-600 font-black italic">
                                    "{order.rejectionReason || 'Staff Unavailable'}"
                                </p>
                            </div>
                        )}

                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 bg-gray-50 flex flex-col sm:flex-row justify-end gap-3 border-t">
                    {isHistory ? (
                        <>
                            {order.address?.phone && activeTab === 'Approved' && (
                                <a 
                                    href={`tel:${order.address.phone}`} 
                                    className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-blue-600 text-white font-bold text-xs shadow-md hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all uppercase tracking-wider"
                                >
                                    <FaPhoneAlt size={12} /> Contact Patient
                                </a>
                            )}
                            <button onClick={onClose} className="px-8 py-3.5 rounded-2xl bg-gray-200 text-gray-700 font-bold hover:bg-gray-300 transition-colors uppercase text-xs tracking-wider">
                                Dismiss Details
                            </button>
                        </>
                    ) : (
                        <button onClick={onClose} className="px-8 py-3 rounded-2xl bg-gray-200 text-gray-700 font-bold hover:bg-gray-300 transition-colors uppercase text-xs tracking-wider">
                            Close
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- SUB-COMPONENT: ORDER HISTORY ROW ---
const OrderHistoryRow = ({ order, activeTab, onRowClick, formatDate }) => {
    return (
        <tr 
            onClick={() => onRowClick(order)} 
            className="hover:bg-gray-50/80 transition-all cursor-pointer group"
        >
            <td className="px-8 py-6">
                <div className="font-black text-gray-900 text-base group-hover:text-[#08B36A] transition-colors">
                    {order.patients?.[0]?.name || order.address?.name || 'N/A'}
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${activeTab === 'Approved' ? 'bg-green-50 text-[#08B36A]' : 'bg-red-50 text-red-400'}`}>
                        ID: {order.bookingId || order._id?.slice(-8)}
                    </span>
                    <span className="text-[11px] text-gray-400 font-bold uppercase">
                        {formatDate(order.schedule?.startDate)}
                    </span>
                </div>
            </td>

            <td className="px-8 py-6">
                <div className="flex items-start gap-2.5 max-w-[280px]">
                    <div className="mt-1 p-1.5 bg-gray-100 rounded-lg text-gray-400">
                        <FaMapMarkerAlt size={12} />
                    </div>
                    <span className="text-sm text-gray-600 font-medium leading-relaxed line-clamp-2">
                        {order.address?.houseNo}, {order.address?.city}
                    </span>
                </div>
            </td>

            <td className="px-8 py-6">
                {activeTab === 'Approved' ? (
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 flex items-center justify-center bg-blue-50 text-blue-600 rounded-full">
                            <FaPhoneAlt size={10} />
                        </div>
                        <span className="text-sm font-black text-gray-700">{order.address?.phone || 'N/A'}</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 text-sm text-red-500 font-black italic bg-red-50/50 px-4 py-2 rounded-xl border border-red-100 w-fit">
                        <FaExclamationTriangle size={12} /> {order.rejectionReason || 'Staff Unavailable'}
                    </div>
                )}
            </td>

            <td className="px-8 py-6 text-center">
                <div className="flex justify-center">
                    <span className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest border transition-all ${
                        activeTab === 'Approved' 
                            ? 'bg-green-50 text-[#08B36A] border-green-200' 
                            : 'bg-red-50 text-red-500 border-red-200'
                    }`}>
                        <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${activeTab === 'Approved' ? 'bg-[#08B36A]' : 'bg-red-500'}`}></span>
                        {activeTab.toUpperCase()}
                    </span>
                </div>
            </td>

            <td className="px-8 py-6 text-right" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-end gap-3">
                    <button 
                        onClick={() => onRowClick(order)}
                        className="w-10 h-10 flex items-center justify-center text-blue-600 bg-white border border-gray-100 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-90"
                    >
                        <FaInfoCircle size={18} />
                    </button>
                    <button 
                        className="w-10 h-10 flex items-center justify-center text-red-400 bg-white border border-gray-100 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-90"
                    >
                        <FaTrashAlt size={14} />
                    </button>
                </div>
            </td>
        </tr>
    );
};

// --- MAIN PARENT EXPORT: NURSE ORDERS PAGE ---
export default function NurseOrdersPage() {
    const [activeTab, setActiveTab] = useState('Daily Nursing'); 
    const [approvedSubTab, setApprovedSubTab] = useState('General'); 
    const [fetching, setFetching] = useState(true);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Bookings State Store
    const [allBookings, setAllBookings] = useState([]);
    const [priorityBookings, setPriorityBookings] = useState([]);
    const [approvedOrders, setApprovedOrders] = useState([]);
    const [rejectedOrders, setRejectedOrders] = useState([]);
    
    // Modals State
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const tabs = [
        'Daily Nursing', 
        'Package Nursing', 
        'Prescription Nursing', 
        'Priority Requests', 
        'Approved', 
        'Rejected'
    ];

    const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';

    // --- FETCH QUEUES ---
    const loadData = async () => {
        try {
            setFetching(true);
            const [
                bookingsRes, 
                priorityRes, 
                approvedRes, 
                rejectedRes
            ] = await Promise.all([
                NurseAPI.getBookings('Pending'),
                NurseAPI.getBookings('Pending', 'true'), 
                NurseAPI.getBookings('Confirmed'),
                NurseAPI.getBookings('Rejected')
            ]);

            if (bookingsRes.success) setAllBookings(bookingsRes.data || []);
            if (priorityRes.success) setPriorityBookings(priorityRes.data || []);
            if (approvedRes.success) setApprovedOrders(approvedRes.data || []);
            if (rejectedRes.success) setRejectedOrders(rejectedRes.data || []);
        } catch (error) {
            console.error("Error loading nurse booking logs:", error);
            toast.error("Failed to load request records");
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Reset pagination index whenever tab configurations update
    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, approvedSubTab]);

    // --- FILTER PARSER ---
    const getCurrentData = () => {
        if (activeTab === 'Rejected') return rejectedOrders;
        if (activeTab === 'Priority Requests') return priorityBookings;

        if (activeTab === 'Approved') {
            return approvedOrders.filter(item => {
                const isExpress = item.priceBreakdown?.fasterServiceCharge > 0 || item.isPriority === true;
                if (approvedSubTab === 'Priority') {
                    return isExpress;
                } else {
                    return !isExpress;
                }
            });
        }

        return allBookings.filter(item => {
            const duration = item.serviceDetails?.duration;
            const hasPrescription = !!item.prescriptionImage;

            if (activeTab === 'Prescription Nursing') {
                return hasPrescription;
            }
            if (activeTab === 'Package Nursing') {
                return !hasPrescription && duration === 'For Multiple Days';
            }
            if (activeTab === 'Daily Nursing') {
                return !hasPrescription && (duration === 'One day One Time' || duration === 'Acc. To Per/Hours');
            }
            return false;
        });
    };

    const fullFilteredData = getCurrentData();
    const isHistoryTab = activeTab === 'Approved' || activeTab === 'Rejected';

    // Approved Sub-Tabs Calculations
    const approvedGeneralCount = approvedOrders.filter(item => {
        const isExpress = item.priceBreakdown?.fasterServiceCharge > 0 || item.isPriority === true;
        return !isExpress;
    }).length;

    const approvedPriorityCount = approvedOrders.filter(item => {
        const isExpress = item.priceBreakdown?.fasterServiceCharge > 0 || item.isPriority === true;
        return isExpress;
    }).length;

    // --- PAGINATION COMPILATION ---
    const totalItems = fullFilteredData.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginatedData = fullFilteredData.slice(
        (currentPage - 1) * itemsPerPage, 
        currentPage * itemsPerPage
    );

    const openDetails = (order) => { setSelectedOrder(order); setIsDetailsModalOpen(true); };
    
    const closeAllModals = () => {
        setIsDetailsModalOpen(false);
        setSelectedOrder(null);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const startIndex = (currentPage - 1) * itemsPerPage;

    if (fetching) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <FaSpinner className="animate-spin text-4xl text-[#08B36A] mb-4" />
            <p className="text-gray-500 font-medium font-sans">Loading Requests...</p>
        </div>
    );

    return (
        <div className="p-4 md:p-8 bg-[#F9FAFB] min-h-screen relative font-sans">
            
            {/* Title */}
            <div className="mb-6 max-w-6xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-800">Nursing Service Requests</h1>
                <p className="text-xs text-gray-400 mt-1">Manage standard queues, priority express requests, and historical care logs.</p>
            </div>

            {/* Selector Tab Bar */}
            <div className="flex flex-wrap justify-center gap-2 mb-4 bg-white p-2 rounded-2xl w-full max-w-6xl border border-gray-100 shadow-sm mx-auto">
                {tabs.map((tab) => {
                    const isTabActive = activeTab === tab;
                    let badgeCount = 0;
                    if (tab === 'Daily Nursing' || tab === 'Package Nursing' || tab === 'Prescription Nursing') {
                        badgeCount = allBookings.filter(item => {
                            const duration = item.serviceDetails?.duration;
                            const hasPrescription = !!item.prescriptionImage;
                            if (tab === 'Prescription Nursing') return hasPrescription;
                            if (tab === 'Package Nursing') return !hasPrescription && duration === 'For Multiple Days';
                            return !hasPrescription && (duration === 'One day One Time' || duration === 'Acc. To Per/Hours');
                        }).length;
                    } else if (tab === 'Priority Requests') {
                        badgeCount = priorityBookings.length;
                    } else if (tab === 'Approved') {
                        badgeCount = approvedOrders.length;
                    } else if (tab === 'Rejected') {
                        badgeCount = rejectedOrders.length;
                    }

                    return (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                                isTabActive 
                                    ? tab === 'Rejected' ? 'bg-red-500 text-white shadow-md' : 'bg-[#08B36A] text-white shadow-md' 
                                    : 'text-gray-500 hover:bg-gray-50'
                            }`}
                        > 
                            <span>{tab}</span> 
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black transition-all ${
                                isTabActive 
                                    ? 'bg-white text-gray-900' 
                                    : 'bg-gray-100 text-gray-600'
                            }`}>
                                {badgeCount}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Sub-Tabs for Approved Orders */}
            {activeTab === 'Approved' && (
                <div className="flex justify-center gap-4 mb-6 bg-gray-50 p-1.5 rounded-xl border border-gray-100 w-fit mx-auto">
                    <button 
                        onClick={() => setApprovedSubTab('General')}
                        className={`px-6 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                            approvedSubTab === 'General' 
                                ? 'bg-[#08B36A] text-white shadow-sm' 
                                : 'text-gray-500 hover:text-gray-800'
                        }`}
                    >
                        <span>General</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                            approvedSubTab === 'General' 
                                ? 'bg-white/25 text-white' 
                                : 'bg-gray-200 text-gray-600'
                        }`}>
                            {approvedGeneralCount}
                        </span>
                    </button>
                    <button 
                        onClick={() => setApprovedSubTab('Priority')}
                        className={`px-6 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                            approvedSubTab === 'Priority' 
                                ? 'bg-amber-500 text-white shadow-sm' 
                                : 'text-gray-500 hover:text-gray-800'
                        }`}
                    >
                        <span>Priority</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                            approvedSubTab === 'Priority' 
                                ? 'bg-white/25 text-white' 
                                : 'bg-gray-200 text-gray-600'
                        }`}>
                            {approvedPriorityCount}
                        </span>
                    </button>
                </div>
            )}

            {/* Unified Table Structure */}
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden mb-10 max-w-6xl mx-auto flex flex-col min-h-[450px]">
                {paginatedData.length > 0 ? (
                    <div className="flex-grow overflow-x-auto w-full">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    {activeTab === 'Prescription Nursing' && (
                                        <th className="px-8 py-5 text-xs font-bold text-gray-500 uppercase">Prescription</th>
                                    )}
                                    <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-wider">Patient Details</th>
                                    <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-wider text-center">Price</th>
                                    {isHistoryTab ? (
                                        <>
                                            {activeTab === 'Approved' ? (
                                                <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-wider">Contact Detail</th>
                                            ) : (
                                                <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-wider">Rejection Reason</th>
                                            )}
                                            <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-wider text-center">Status</th>
                                            <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-wider text-right">Actions</th>
                                        </>
                                    ) : (
                                        <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-wider text-center">Actions</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {paginatedData.map((item, index) => {
                                    if (isHistoryTab) {
                                        return (
                                            <OrderHistoryRow 
                                                key={item._id || index}
                                                order={item}
                                                activeTab={activeTab}
                                                onRowClick={openDetails}
                                                formatDate={formatDate}
                                            />
                                        );
                                    }

                                    return (
                                        <tr key={index} onClick={() => openDetails(item)} className="hover:bg-gray-50 transition-colors cursor-pointer group">
                                            {activeTab === 'Prescription Nursing' && (
                                                <td className="px-8 py-4">
                                                    <div className="w-14 h-14 rounded-lg overflow-hidden border border-gray-200">
                                                        <img src={`${IMAGE_BASE_URL}/${item.prescriptionImage}`} alt="Prescription" className="w-full h-full object-cover" />
                                                    </div>
                                                </td>
                                            )}
                                            <td className="px-8 py-4">
                                                <div className="font-bold text-gray-800 group-hover:text-[#08B36A] transition-colors">
                                                    {item.patients?.[0]?.name || item.address?.name}
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-green-50 text-[#08B36A]">
                                                        ID: {item.bookingId || item._id?.slice(-8)}
                                                    </span>
                                                    {item.priceBreakdown?.fasterServiceCharge > 0 && (
                                                        <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded uppercase tracking-wider">
                                                            Priority
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-[12px] text-gray-500 mt-1">
                                                    {item.serviceDetails?.title} • {item.patients?.[0]?.relation || 'Self'}
                                                </div>
                                            </td>
                                            <td className="px-8 py-4 font-bold text-gray-800 text-center">
                                                ₹{item.priceBreakdown?.totalPrice || item.totalPrice}
                                            </td>
                                            <td className="px-8 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex items-center justify-center gap-3">
                                                    <span className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-xl uppercase tracking-wider">
                                                        Payment Pending
                                                    </span>
                                                    <button 
                                                        onClick={() => openDetails(item)} 
                                                        className="bg-blue-500 text-white px-4 py-2 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all hover:bg-blue-600 shadow-sm"
                                                    >
                                                        <FaEye /> VIEW
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex-grow flex flex-col items-center justify-center p-8 text-center max-w-sm animate-in fade-in mx-auto">
                        <div className="w-48 h-48 rounded-full overflow-hidden mb-6 border-4 border-gray-50 shadow-sm">
                            <img src="https://img.freepik.com/free-photo/female-doctor-holding-box-with-medical-supplies_23-2148827766.jpg" alt="No Requests" className="w-full h-full object-cover"/>
                        </div>
                        <h2 className="text-xl font-bold text-[#1e293b] mb-2">No {activeTab} Records</h2>
                        <p className="text-gray-400 text-sm mb-8 px-4">Latest incoming requests mapping to this status parameter appear here.</p>
                        <div className="w-full px-6">
                            <button onClick={loadData} className="w-full flex items-center justify-center gap-2 border-2 border-[#08B36A] text-[#08B36A] font-bold py-3 rounded-2xl hover:bg-green-50"><FaSyncAlt className={`text-sm ${fetching ? 'animate-spin' : ''}`} /> Refresh Console</button>
                        </div>
                    </div>
                )}

                {/* --- PAGINATION SYSTEM --- */}
                {totalItems > itemsPerPage && (
                    <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <span className="text-xs text-gray-500 font-medium">
                            Showing <span className="font-bold text-gray-700">{Math.min(startIndex + 1, totalItems)}</span> to{' '}
                            <span className="font-bold text-gray-700">{Math.min(startIndex + itemsPerPage, totalItems)}</span> of{' '}
                            <span className="font-bold text-gray-700">{totalItems}</span> entries
                        </span>
                        
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 disabled:opacity-40 transition-colors"
                            >
                                <FaChevronLeft size={10} />
                            </button>
                            
                            {Array.from({ length: totalPages }).map((_, index) => {
                                const pageNumber = index + 1;
                                return (
                                    <button
                                        key={pageNumber}
                                        onClick={() => setCurrentPage(pageNumber)}
                                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                                            currentPage === pageNumber
                                                ? 'bg-[#08B36A] text-white shadow-sm shadow-green-100'
                                                : 'border border-gray-200 bg-white hover:bg-gray-50 text-gray-600'
                                        }`}
                                    >
                                        {pageNumber}
                                    </button>
                                );
                            })}

                            <button
                                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 disabled:opacity-40 transition-colors"
                            >
                                <FaChevronRight size={10} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <UnifiedOrderDetailModal 
                isOpen={isDetailsModalOpen}
                order={selectedOrder}
                activeTab={activeTab}
                imageBaseUrl={IMAGE_BASE_URL}
                formatDate={formatDate}
                onClose={closeAllModals}
            />

        </div>
    );
}