'use client';

import React, { useState, useEffect } from 'react';
import { 
    FaUserNurse, 
    FaMapMarkerAlt, 
    FaCalendarAlt, 
    FaIdCard, 
    FaUserCircle, 
    FaPhoneAlt,
    FaClipboardList,
    FaImage, 
    FaEye,
    FaCheck,
    FaTimes,
    FaTimesCircle,
    FaInfoCircle,
    FaUserPlus, 
    FaSearch,
    FaStethoscope,
    FaBoxOpen,
    FaClock,
    FaAward,
    FaChevronRight,
    FaChevronLeft // Added for pagination controls
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import NurseAPI from '@/app/services/NurseAPI';

// =========================================================
// GLOBAL HELPERS: ROBUST IMAGE RESOLVING & SELF-HEALING
// =========================================================

const getPrescriptionImageUrl = (imagePath, baseUrl) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }
    
    // Normalize path separators (replaces backslashes with forward slashes)
    let cleanPath = imagePath.replace(/\\/g, '/');
    
    // Strip leading slash if present
    if (cleanPath.startsWith('/')) {
        cleanPath = cleanPath.substring(1);
    }
    
    // Ensure base URL configuration is stripped of trailing slash
    let base = baseUrl || '';
    if (base.endsWith('/')) {
        base = base.slice(0, -1);
    }
    
    return `${base}/${cleanPath}`;
};

const handleImageError = (e) => {
    const currentSrc = e.target.src;
    // Fallback: If image fails to load with "/public/..." prefix, attempt to pull directly from root static path
    if (currentSrc.includes('/public/')) {
        e.target.src = currentSrc.replace('/public/', '/');
    }
};

// =========================================================
// MAIN COMPONENT
// =========================================================

export default function AssignNurseTable() {
    const [activeTab, setActiveTab] = useState('Assign Nurses');
    
    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    // New States for Assigning
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);

    // API Data States
    const [confirmedBookings, setConfirmedBookings] = useState([]); 
    const [busyNurses, setBusyNurses] = useState([]); // Tab 2
    const [offlineNurses, setOfflineNurses] = useState([]); // Part of Tab 3
    const [availableNurses, setAvailableNurses] = useState([]); // Part of Tab 3 & Assignment Modal
    const [isLoading, setIsLoading] = useState(false);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const tabs = ['Assign Nurses', 'Assigned Nurses', 'Unassigned Nurses'];

    const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';

    // --- FETCH DATA FROM API ---
    const loadData = async () => {
        setIsLoading(true);
        try {
            const confirmedRes = await NurseAPI.getBookings('Confirmed');
            if (confirmedRes?.success) {
                setConfirmedBookings(confirmedRes.data || []);
            }

            const busyRes = await NurseAPI.getStaffByStatus('Busy');
            if (busyRes?.success) {
                setBusyNurses(busyRes.data || []);
            }

            const offlineRes = await NurseAPI.getStaffByStatus('Offline');
            if (offlineRes?.success) {
                setOfflineNurses(offlineRes.data || []);
            }

            const staffRes = await NurseAPI.getAvailableStaff();
            const staffData = staffRes?.staff || staffRes?.data || staffRes;
            if (Array.isArray(staffData)) {
                setAvailableNurses(staffData);
            }
        } catch (error) {
            console.error("Error loading data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Reset pagination index whenever current active tab switches
    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab]);

    // --- HANDLE ASSIGN ACTION ---
    const handleAssignNurse = async (nurseId) => {
        if (!selectedAppointment || !nurseId) return;

        try {
            const payload = {
                bookingId: selectedAppointment._id,
                staffId: nurseId
            };
            
            const response = await NurseAPI.assignStaffToBooking(payload);
            
            if (response) {
                toast.success("Staff Assigned Successfully!");
                setIsAssignModalOpen(false);
                loadData(); 
            }
        } catch (error) {
            console.error("Assignment failed:", error);
            toast.error(error.response?.data?.message || "Failed to assign staff");
        }
    };

    const handleRowClick = (item, type = 'booking') => {
        setSelectedItem({ ...item, dataType: type });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedItem(null);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const allUnassignedNurses = [...availableNurses, ...offlineNurses];

    // --- PAGINATION COMPILATION LOGIC ---
    const getActiveDataset = () => {
        if (activeTab === 'Assign Nurses') return confirmedBookings;
        if (activeTab === 'Assigned Nurses') return busyNurses;
        if (activeTab === 'Unassigned Nurses') return allUnassignedNurses;
        return [];
    };

    const currentDataset = getActiveDataset();
    const totalItems = currentDataset.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = currentDataset.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="bg-[#F8FAFC] min-h-screen p-4 md:p-8">
            {/* --- HEADER --- */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Nursing Services</h1>
                        <p className="text-gray-500 text-sm mt-1">Manage, assign, and track medical staff deployment</p>
                    </div>
                    <div className="bg-white p-1 rounded-2xl shadow-sm border border-gray-200 flex flex-wrap">
                        {tabs.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
                                    activeTab === tab
                                        ? 'bg-[#08B36A] text-white shadow-md'
                                        : 'text-gray-500 hover:bg-gray-50'
                                }`}
                            >
                                <span>{tab}</span>
                                {tab === 'Assign Nurses' && confirmedBookings.length > 0 && (
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === tab ? 'bg-white text-[#08B36A]' : 'bg-green-100 text-[#08B36A]'}`}>
                                        {confirmedBookings.length}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* --- TABLE CONTAINER --- */}
                <div className="bg-white rounded-3xl border border-gray-200 shadow-xl shadow-gray-200/50 overflow-hidden">
                    <div className="overflow-x-auto">
                        
                        {/* --- TAB 1: ASSIGN NURSES --- */}
                        {activeTab === 'Assign Nurses' && (
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50/50">
                                        <th className="px-8 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Prescription</th>
                                        <th className="px-8 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Patient Details</th>
                                        <th className="px-8 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Service Fee</th>
                                        <th className="px-8 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {paginatedData.length === 0 ? (
                                        <tr><td colSpan="4" className="py-32 text-center">
                                            <div className="flex flex-col items-center opacity-40">
                                                <FaClipboardList size={48} className="mb-4 text-gray-300" />
                                                <p className="italic text-gray-500 font-medium">No active service requests pending assignment</p>
                                            </div>
                                        </td></tr>
                                    ) : (
                                        paginatedData.map((item) => (
                                            <tr key={item._id} onClick={() => handleRowClick(item, 'booking')} className="hover:bg-gray-50/80 transition-all cursor-pointer group">
                                                <td className="px-8 py-6">
                                                    <div className="w-16 h-16 bg-white border-2 border-gray-100 rounded-2xl flex items-center justify-center overflow-hidden shadow-sm group-hover:border-[#08B36A]/30 transition-colors">
                                                        {item.prescriptionImage ? (
                                                            <img 
                                                                src={getPrescriptionImageUrl(item.prescriptionImage, IMAGE_BASE_URL)} 
                                                                alt="Prescription" 
                                                                onError={handleImageError}
                                                                className="w-full h-full object-cover" 
                                                            />
                                                        ) : (
                                                            <div className="text-[9px] text-center text-gray-400 font-bold uppercase p-2">
                                                                <FaImage className="mx-auto mb-1 text-gray-300" size={16} />
                                                                No Image
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="font-bold text-gray-900 text-base group-hover:text-[#08B36A] transition-colors">
                                                        {item.userId?.name || item.patients?.[0]?.name || item.address?.name || 'N/A'}
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md font-mono">
                                                            {item.bookingId || item._id?.slice(-8)}
                                                        </span>
                                                        <span className="text-gray-300">•</span>
                                                        <span className="text-xs text-gray-500 font-medium">
                                                            {item.serviceDetails?.title || 'Prescription Support'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    <span className="text-lg font-black text-gray-900">
                                                        ₹{item.priceBreakdown?.totalPrice || item.totalPrice}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6" onClick={(e) => e.stopPropagation()}>
                                                    <div className="flex items-center justify-end gap-3">
                                                        <button onClick={() => handleRowClick(item, 'booking')} className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><FaEye size={18} /></button>
                                                        <button onClick={() => { setSelectedAppointment(item); setIsAssignModalOpen(true); }} className="bg-[#08B36A] hover:bg-[#069a5a] text-white px-6 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-lg shadow-green-100 active:scale-95"><FaUserPlus size={14} /> ASSIGN STAFF</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        )}

                        {/* --- TAB 2: ASSIGNED NURSES --- */}
                        {activeTab === 'Assigned Nurses' && (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50/50">
                                        <th className="px-8 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Nurse Profile</th>
                                        <th className="px-8 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
                                        <th className="px-8 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {paginatedData.length === 0 ? (
                                        <tr><td colSpan="3" className="py-32 text-center text-gray-400 italic font-medium">No nurses currently on active duty</td></tr>
                                    ) : (
                                        paginatedData.map((nurse) => (
                                            <tr key={nurse._id} onClick={() => handleRowClick(nurse, 'nurse')} className="hover:bg-gray-50 transition-all cursor-pointer group">
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="relative">
                                                            <div className="w-12 h-12 rounded-2xl bg-gray-100 overflow-hidden border-2 border-white shadow-sm ring-1 ring-gray-100">
                                                                {nurse.profilePhoto ? (
                                                                    <img src={`${IMAGE_BASE_URL}/${nurse.profilePhoto}`} className="w-full h-full object-cover" alt="Profile" />
                                                                ) : (
                                                                    <FaUserCircle size={48} className="text-gray-200" />
                                                                )}
                                                            </div>
                                                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-orange-500 border-2 border-white rounded-full"></div>
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-gray-900 group-hover:text-[#08B36A] transition-colors">{nurse.name}</div>
                                                            <div className="text-[10px] text-gray-400 font-mono uppercase tracking-tight">ID: {nurse._id?.slice(-8)}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-center">
                                                    <span className="px-4 py-1.5 bg-orange-50 text-orange-600 text-[10px] font-black rounded-lg uppercase border border-orange-100 inline-flex items-center gap-1.5">
                                                        <span className="w-1.5 h-1.5 bg-orange-600 rounded-full animate-pulse"></span> BUSY
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <button className="bg-white border border-gray-200 text-gray-700 hover:border-gray-900 px-5 py-2 rounded-xl text-xs font-bold shadow-sm transition-all">View Schedule</button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        )}

                        {/* --- TAB 3: UNASSIGNED NURSES --- */}
                        {activeTab === 'Unassigned Nurses' && (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50/50">
                                        <th className="px-8 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Nurse Profile</th>
                                        <th className="px-8 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Contact</th>
                                        <th className="px-8 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
                                        <th className="px-8 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {paginatedData.length === 0 ? (
                                        <tr><td colSpan="4" className="py-32 text-center text-gray-400 italic font-medium">No medical staff found in registry</td></tr>
                                    ) : (
                                        paginatedData.map((nurse) => {
                                            const isOffline = offlineNurses.some(off => off._id === nurse._id);
                                            return (
                                                <tr key={nurse._id} onClick={() => handleRowClick(nurse, 'nurse')} className="hover:bg-gray-50 transition-all cursor-pointer group">
                                                    <td className="px-8 py-5">
                                                        <div className="flex items-center gap-4">
                                                            <div className="relative">
                                                                <div className="w-12 h-12 rounded-2xl bg-gray-100 overflow-hidden border-2 border-white shadow-sm ring-1 ring-gray-100">
                                                                    {nurse.profilePhoto ? (
                                                                        <img src={`${IMAGE_BASE_URL}/${nurse.profilePhoto}`} className="w-full h-full object-cover" alt="Profile" />
                                                                    ) : (
                                                                        <FaUserCircle size={48} className="text-gray-200" />
                                                                    )}
                                                                </div>
                                                                <div className={`absolute -bottom-1 -right-1 w-4 h-4 border-2 border-white rounded-full ${isOffline ? 'bg-gray-400' : 'bg-green-500'}`}></div>
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-gray-900">{nurse.name}</div>
                                                                <div className="text-[10px] text-gray-400 font-mono uppercase tracking-tight">ID: {nurse._id?.slice(-8)}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5 text-center">
                                                        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-bold">
                                                            <FaPhoneAlt size={10} /> {nurse.phone || nurse.mobile || 'N/A'}
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5 text-center">
                                                        {isOffline ? (
                                                            <span className="px-4 py-1.5 bg-gray-100 text-gray-500 text-[10px] font-black rounded-lg uppercase border border-gray-200">OFFLINE</span>
                                                        ) : (
                                                            <span className="px-4 py-1.5 bg-green-50 text-green-600 text-[10px] font-black rounded-lg uppercase border border-green-100 inline-flex items-center gap-1.5">
                                                                <span className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse"></span> ONLINE
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-8 py-5 text-right">
                                                        <button className="text-gray-400 hover:text-gray-900 p-2 transition-colors"><FaChevronRight /></button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* --- PAGINATION CONTROL BAR --- */}
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
            </div>

            {/* --- SELECT NURSE MODAL --- */}
            {isAssignModalOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden relative border border-white/20 animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-gray-50 bg-gray-50/50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900">Select Nurse</h2>
                                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-[2px] mt-1">
                                        FOR: {selectedAppointment?.userId?.name || selectedAppointment?.patients?.[0]?.name}
                                    </p>
                                </div>
                                <button onClick={() => setIsAssignModalOpen(false)} className="w-10 h-10 flex items-center justify-center bg-white rounded-full text-gray-400 hover:text-red-500 shadow-sm border border-gray-100 transition-all"><FaTimes size={18} /></button>
                            </div>
                        </div>
                        <div className="p-6 max-h-[450px] overflow-y-auto space-y-3 custom-scrollbar">
                            {availableNurses.length === 0 ? (
                                <div className="text-center py-10 text-gray-400 italic text-sm">No available nurses found at this time</div>
                            ) : (
                                availableNurses.map((nurse) => (
                                    <div key={nurse._id} className="flex items-center justify-between p-4 rounded-3xl border border-gray-100 hover:border-[#08B36A] hover:bg-green-50/30 transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl overflow-hidden bg-gray-100 ring-2 ring-white shadow-sm">
                                                {nurse.profilePhoto ? <img src={`${IMAGE_BASE_URL}/${nurse.profilePhoto}`} className="w-full h-full object-cover" /> : <FaUserCircle size={48} className="text-gray-200" />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 text-sm leading-tight">{nurse.name}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <FaAward className="text-orange-400" size={10} />
                                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">{nurse.experience || '2+ Years'} EXP</p>
                                                </div>
                                            </div>
                                        </div>
                                        <button onClick={() => handleAssignNurse(nurse._id)} className="bg-gray-900 text-white hover:bg-[#08B36A] px-5 py-2 rounded-2xl text-[10px] font-black transition-all shadow-md active:scale-90">SELECT</button>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="p-6 bg-gray-50 border-t border-gray-100 text-center">
                            <button onClick={() => setIsAssignModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xs font-black uppercase tracking-widest transition-colors">Cancel Assignment</button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- FULL DETAILS MODAL --- */}
            {isModalOpen && selectedItem && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-4xl rounded-[48px] shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-300">
                        <div className="bg-[#08B36A] p-10 text-white relative">
                            <div className="absolute top-8 right-8">
                                <button onClick={closeModal} className="w-12 h-12 flex items-center justify-center bg-white/20 backdrop-blur-md hover:bg-white/40 rounded-full transition-all"><FaTimes size={20} /></button>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-[32px] flex items-center justify-center border border-white/30">
                                    {selectedItem.dataType === 'nurse' ? <FaUserNurse size={40} /> : <FaClipboardList size={40} />}
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black">{selectedItem.dataType === 'nurse' ? selectedItem.name : (selectedItem.serviceDetails?.title || 'Service Request')}</h2>
                                    <div className="flex items-center gap-3 mt-2">
                                        <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black tracking-widest uppercase">
                                            ID: {selectedItem.bookingId || selectedItem._id?.slice(-12)}
                                        </span>
                                        {selectedItem.status && (
                                            <span className="px-3 py-1 bg-white text-[#08B36A] rounded-full text-[10px] font-black tracking-widest uppercase">
                                                {selectedItem.status}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-10 max-h-[65vh] overflow-y-auto custom-scrollbar">
                            {selectedItem.dataType === 'nurse' ? (
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                                    <div className="md:col-span-5 flex flex-col items-center p-8 bg-gray-50 rounded-[40px] border border-gray-100">
                                        <div className="w-40 h-40 rounded-[32px] overflow-hidden border-8 border-white shadow-xl mb-6 ring-1 ring-gray-100">
                                            {selectedItem.profilePhoto ? <img src={`${IMAGE_BASE_URL}/${selectedItem.profilePhoto}`} className="w-full h-full object-cover" /> : <FaUserCircle size={160} className="text-gray-200" />}
                                        </div>
                                        <h3 className="text-2xl font-black text-gray-900">{selectedItem.name}</h3>
                                        <p className="text-[#08B36A] font-black text-xs uppercase tracking-[3px] mt-2">Verified Professional</p>
                                        <div className="w-full mt-8 grid grid-cols-2 gap-4">
                                            <div className="bg-white p-4 rounded-3xl border border-gray-100 text-center">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Experience</p>
                                                <p className="font-black text-gray-900">2+ Years</p>
                                            </div>
                                            <div className="bg-white p-4 rounded-3xl border border-gray-100 text-center">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Rating</p>
                                                <p className="font-black text-gray-900">4.9/5.0</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="md:col-span-7 space-y-8">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3 text-gray-900 font-black uppercase text-xs tracking-widest"><FaIdCard className="text-[#08B36A]" /> CONTACT INFORMATION</div>
                                            <div className="grid grid-cols-1 gap-3">
                                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                    <span className="text-xs font-bold text-gray-500">Phone Number</span>
                                                    <span className="text-sm font-black text-gray-900">{selectedItem.phone || selectedItem.mobile || 'N/A'}</span>
                                                </div>
                                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                    <span className="text-xs font-bold text-gray-500">Email Address</span>
                                                    <span className="text-sm font-black text-gray-900">{selectedItem.email || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3 text-gray-900 font-black uppercase text-xs tracking-widest"><FaAward className="text-[#08B36A]" /> SPECIALIZATION</div>
                                            <div className="p-6 bg-[#08B36A]/5 rounded-[32px] border border-[#08B36A]/10">
                                                <p className="text-sm text-[#08B36A] font-bold leading-relaxed">{selectedItem.experience || 'Expert in general nursing care, postoperative monitoring, and specialized home healthcare services with clinical proficiency.'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3 text-gray-900 font-black uppercase text-xs tracking-widest"><FaIdCard className="text-[#08B36A]" /> PATIENT DATA</div>
                                        {selectedItem.prescriptionImage && (
                                            <div className="w-full h-56 bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-200 overflow-hidden relative group">
                                                <img 
                                                    src={getPrescriptionImageUrl(selectedItem.prescriptionImage, IMAGE_BASE_URL)} 
                                                    onError={handleImageError}
                                                    className="w-full h-full object-contain p-4" 
                                                    alt="Prescription" 
                                                />
                                                <button onClick={() => window.open(getPrescriptionImageUrl(selectedItem.prescriptionImage, IMAGE_BASE_URL), '_blank')} className="absolute inset-0 bg-gray-900/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-white font-black text-xs tracking-widest">VIEW FULL PRESCRIPTION</button>
                                            </div>
                                        )}
                                        <div className="bg-gray-50 p-6 rounded-[32px] border border-gray-100 space-y-4">
                                            <div className="flex justify-between border-b border-gray-200/50 pb-3">
                                                <span className="text-xs font-bold text-gray-400 uppercase">Patient Name</span> 
                                                <span className="font-black text-gray-900">{selectedItem.userId?.name || selectedItem.patients?.[0]?.name || selectedItem.address?.name}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-gray-200/50 pb-3">
                                                <span className="text-xs font-bold text-gray-400 uppercase">Relation / Gender</span> 
                                                <span className="font-black text-gray-900">{selectedItem.patients?.[0]?.relation || 'Self'} • {selectedItem.userId?.gender || selectedItem.patients?.[0]?.gender || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-xs font-bold text-gray-400 uppercase font-sans">Contact Phone</span> 
                                                <span className="font-black text-gray-900">{selectedItem.userId?.phone || selectedItem.address?.phone || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3 text-gray-900 font-black uppercase text-xs tracking-widest"><FaInfoCircle className="text-[#08B36A]" /> SERVICE DETAILS</div>
                                        <div className="bg-[#08B36A]/5 p-8 rounded-[32px] border border-[#08B36A]/10 space-y-6">
                                            <div>
                                                <p className="text-[10px] font-black text-[#08B36A] uppercase tracking-[2px] mb-1">Service Type</p>
                                                <p className="text-xl font-black text-gray-900">{selectedItem.serviceDetails?.title || selectedItem.serviceDetails?.type || 'Prescription Booking'}</p>
                                                {selectedItem.serviceDetails?.duration && (
                                                    <p className="text-xs text-gray-500 font-bold mt-1">Duration: {selectedItem.serviceDetails.duration}</p>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Created At</p>
                                                    <p className="font-black text-gray-900">{formatDate(selectedItem.createdAt)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Fee</p>
                                                    <p className="text-xl font-black text-[#08B36A]">₹{selectedItem.priceBreakdown?.totalPrice || selectedItem.totalPrice}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 p-6 rounded-[32px] border border-gray-100">
                                            <div className="flex items-center gap-2 text-gray-900 font-black text-[10px] uppercase mb-3 tracking-widest"><FaMapMarkerAlt className="text-red-500" /> SERVICE LOCATION</div>
                                            <p className="text-sm text-gray-600 font-bold leading-relaxed">
                                                {selectedItem.address?.houseNo}, {selectedItem.address?.landmark ? `${selectedItem.address.landmark}, ` : ''}{selectedItem.address?.city} ({selectedItem.address?.pincode || 'N/A'})
                                            </p>
                                        </div>
                                    </div>
                                    {(selectedItem.selectedConsumables?.length > 0 || selectedItem.consumablesUsed?.length > 0) && (
                                        <div className="md:col-span-2 space-y-4">
                                            <div className="flex items-center gap-3 text-gray-900 font-black uppercase text-xs tracking-widest"><FaBoxOpen className="text-orange-400" /> CONSUMABLES INCLUDED</div>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                {(selectedItem.selectedConsumables || selectedItem.consumablesUsed).map((c, i) => (
                                                    <div key={i} className="flex justify-between items-center p-4 bg-white rounded-2xl text-xs border border-gray-100 shadow-sm">
                                                        <span className="font-bold text-gray-700">{c.itemName || c.name}</span>
                                                        <span className="font-black text-[#08B36A]">₹{c.price || 0}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        
                        <div className="p-10 border-t border-gray-50 bg-gray-50/50 flex flex-col sm:flex-row justify-end gap-4">
                            <button onClick={closeModal} className="px-10 py-4 rounded-[20px] bg-white border border-gray-200 text-gray-500 font-black text-xs hover:bg-gray-100 transition-all uppercase tracking-widest">Dismiss</button>
                            {selectedItem.dataType === 'booking' && (selectedItem.status === 'Pending' || selectedItem.status === 'Confirmed') && (
                                <button onClick={() => { closeModal(); setSelectedAppointment(selectedItem); setIsAssignModalOpen(true); }} className="px-10 py-4 rounded-[20px] bg-[#08B36A] text-white font-black text-xs shadow-xl shadow-green-100 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest">Assign Available Nurse</button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Custom CSS for hiding scrollbar but keeping functionality */}
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #E2E8F0;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #CBD5E1;
                }
            `}</style>
        </div>
    );
}