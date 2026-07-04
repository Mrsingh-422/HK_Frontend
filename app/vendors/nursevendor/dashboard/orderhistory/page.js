'use client'
import React, { useState, useEffect } from 'react'
import { 
    FaUser, FaPhone, FaMapMarkerAlt, FaCalendarAlt, 
    FaClock, FaEye, FaTimesCircle, FaHashtag, FaHistory, FaSyncAlt, FaStethoscope, FaWallet,
    FaTag, FaBoxes, FaLanguage, FaNotesMedical, FaCheck, FaClipboardList,
    FaChevronLeft, FaChevronRight, FaUserNurse, FaStickyNote
} from 'react-icons/fa'
import NurseAPI from '@/app/services/NurseAPI';

export default function OrderHistoryPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderData, setOrderData] = useState([]);
    const [loading, setLoading] = useState(true);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5002';

    const formatImagePath = (path) => {
        if (!path) return null;
        if (typeof path === 'string' && (path.startsWith('blob') || path.startsWith('http') || path.startsWith('https'))) return path;
        const cleanPath = String(path).replace(/^public[\\/]/, '').replace(/\\/g, '/'); 
        return `${BACKEND_URL}/${cleanPath}`;
    };

    useEffect(() => {
        fetchOrderHistory();
    }, []);

    const fetchOrderHistory = async () => {
        try {
            setLoading(true);
            const res = await NurseAPI.getOrderHistory();
            if (res.success) {
                setOrderData(res.data || []);
            }
        } catch (error) {
            console.error("Failed to fetch history:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
            <FaSyncAlt className="animate-spin text-[#08B36A] text-4xl mb-4"/>
            <p className="text-gray-500 font-bold uppercase tracking-tighter">Loading History...</p>
        </div>
    );

    // --- PAGINATION CALCULATION LOGIC ---
    const totalItems = orderData.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = orderData.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className=" bg-[#F9FAFB] min-h-screen p-4 md:p-8 font-sans">
            
            {/* --- HEADER --- */}
            <div className="mb-6">
                <h1 className="text-2xl font-black text-[#1e5a91] flex items-center gap-2">
                    <FaHistory className="text-[#08B36A]" /> Order History
                </h1>
                <p className="text-sm text-gray-500 font-bold mt-1">
                    Total Records: <span className="text-[#08B36A]">{orderData.length}</span>
                </p>
            </div>

            {/* --- TABLE --- */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.03)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/80 border-b border-gray-100">
                                <th className="px-6 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Order Info</th>
                                <th className="px-6 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Patient Details</th>
                                <th className="px-6 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Completed By</th>
                                <th className="px-6 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                                <th className="px-6 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {paginatedData.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-10 text-gray-500 font-medium">
                                        No order history records found.
                                    </td>
                                </tr>
                            ) : (
                                paginatedData.map((order) => (
                                    <tr 
                                        key={order._id} 
                                        onClick={() => handleViewDetails(order)}
                                        className="hover:bg-gray-50/50 transition-colors group cursor-pointer"
                                    >
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col gap-1">
                                                <div className="font-black text-gray-800 text-sm flex items-center gap-1.5">
                                                    <FaHashtag size={10} className="text-[#08B36A]"/> {order.bookingId}
                                                </div>
                                                <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400">
                                                    <span className="bg-blue-50 text-[#1e40af] text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                                                        {order.bookingType || 'Regular'}
                                                    </span>
                                                    <span className="flex items-center gap-1 text-red-400">
                                                        <FaCalendarAlt size={10}/> {new Date(order.createdAt).toLocaleDateString()}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <FaClock size={10}/> {order.schedule?.startTime || 'N/A'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div>
                                                    <div className="font-bold text-gray-800">
                                                        {order.patients?.[0]?.name || order.userId?.name || "N/A"}
                                                    </div>
                                                    <div className="text-[10px] font-bold text-gray-400">{order.serviceDetails?.title}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            {order.assignedStaffId ? (
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-100 overflow-hidden flex items-center justify-center text-gray-400 shadow-sm shrink-0">
                                                        {order.assignedStaffId.profilePic ? (
                                                            <img 
                                                                src={formatImagePath(order.assignedStaffId.profilePic)} 
                                                                alt="Staff avatar" 
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <FaUserNurse size={14} />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-700 text-xs">{order.assignedStaffId.name}</div>
                                                        <div className="text-[9px] text-[#08B36A] font-bold">{order.assignedStaffId.phone}</div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">Unassigned</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${order.status === 'Completed' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right" onClick={(e) => e.stopPropagation()}>
                                            <button 
                                                onClick={() => handleViewDetails(order)}
                                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#08B36A] hover:bg-[#069a5a] text-white text-[11px] font-black uppercase tracking-tighter shadow-md shadow-green-100 transition-all active:scale-95"
                                            >
                                                <FaEye size={12} /> View
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* --- PAGINATION SYSTEM CONTROLS --- */}
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

            {/* --- VIEW DETAILS MODAL --- */}
            {isModalOpen && selectedOrder && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-[#1e5a91]/20 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in duration-300 border border-white flex flex-col max-h-[90vh]">
                        
                        {/* Modal Header */}
                        <div className={`p-6 text-white flex justify-between items-center shrink-0 ${selectedOrder.status === 'Completed' ? 'bg-[#08B36A]' : 'bg-red-500'}`}>
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-white/20 rounded-2xl">
                                    <FaHistory size={20} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black leading-none uppercase tracking-tight">{selectedOrder.status} ORDER</h2>
                                    <p className="text-[10px] text-white/80 mt-1 font-bold">Booking ID: {selectedOrder.bookingId}</p>
                                </div>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-white hover:rotate-90 transition-transform duration-200">
                                <FaTimesCircle size={28} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8 space-y-6 overflow-y-auto flex-1">
                            
                            {/* Assigned Nurse Details */}
                            {selectedOrder.assignedStaffId && (
                                <div className="p-4 rounded-2xl bg-green-50/50 border border-green-100 space-y-3">
                                    <h3 className="text-xs font-black text-green-800 uppercase tracking-widest flex items-center gap-2">
                                        <FaUserNurse size={12}/> Dispatched Staff Details
                                    </h3>
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center overflow-hidden border border-gray-100 shrink-0">
                                            {selectedOrder.assignedStaffId.profilePic ? (
                                                <img 
                                                    src={formatImagePath(selectedOrder.assignedStaffId.profilePic)} 
                                                    className="w-full h-full object-cover" 
                                                    alt="Staff Avatar"
                                                />
                                            ) : (
                                                <FaUserCircle size={28} className="text-gray-300" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="text-sm font-black text-gray-800">{selectedOrder.assignedStaffId.name}</div>
                                            <div className="text-[10px] text-[#08B36A] font-bold">Phone: {selectedOrder.assignedStaffId.phone}</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Service Header */}
                            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 space-y-3">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-500 shrink-0">
                                        <FaStethoscope size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Requested Service</label>
                                        <div className="text-sm font-black text-[#1e5a91]">{selectedOrder.serviceDetails?.title}</div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-blue-100/50 text-[11px] font-bold text-blue-800">
                                    <div>Type: <span className="text-gray-700">{selectedOrder.serviceDetails?.type}</span></div>
                                    <div>Duration: <span className="text-gray-700">{selectedOrder.serviceDetails?.duration}</span></div>
                                    <div>Base Price: <span className="text-gray-700">₹{selectedOrder.serviceDetails?.basePrice}</span></div>
                                    <div>Assessment: <span className="text-gray-700">{selectedOrder.assessmentLocation || 'At Home'}</span></div>
                                </div>
                            </div>

                            {/* Schedule & Timing Details */}
                            <div className="p-4 rounded-2xl bg-orange-50 border border-orange-100 space-y-3">
                                <h3 className="text-xs font-black text-orange-800 uppercase tracking-widest flex items-center gap-2">
                                    <FaCalendarAlt size={12}/> Booking Schedule Details
                                </h3>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs font-semibold text-gray-600">
                                    <div>
                                        <span className="block text-[9px] font-black text-gray-400 uppercase tracking-wider">Start Date</span>
                                        {selectedOrder.schedule?.startDate ? new Date(selectedOrder.schedule.startDate).toLocaleDateString() : 'N/A'}
                                    </div>
                                    <div>
                                        <span className="block text-[9px] font-black text-gray-400 uppercase tracking-wider">End Date</span>
                                        {selectedOrder.schedule?.endDate ? new Date(selectedOrder.schedule.endDate).toLocaleDateString() : 'N/A'}
                                    </div>
                                    <div>
                                        <span className="block text-[9px] font-black text-gray-400 uppercase tracking-wider">Start Time</span>
                                        {selectedOrder.schedule?.startTime || 'N/A'}
                                    </div>
                                    <div>
                                        <span className="block text-[9px] font-black text-gray-400 uppercase tracking-wider">End Time</span>
                                        {selectedOrder.schedule?.endTime || 'N/A'}
                                    </div>
                                </div>
                            </div>

                            {/* Service Completion Timestamps */}
                            {(selectedOrder.startedAt || selectedOrder.completedAt) && (
                                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Completion Timeline</label>
                                    <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-gray-600">
                                        {selectedOrder.startedAt && (
                                            <div>
                                                <span className="block text-[9px] font-black text-gray-400 uppercase tracking-wider">Started At</span>
                                                {new Date(selectedOrder.startedAt).toLocaleString()}
                                            </div>
                                        )}
                                        {selectedOrder.completedAt && (
                                            <div>
                                                <span className="block text-[9px] font-black text-gray-400 uppercase tracking-wider">Completed At</span>
                                                {new Date(selectedOrder.completedAt).toLocaleString()}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Service Notes */}
                            {selectedOrder.serviceNotes && (
                                <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100/50 space-y-2">
                                    <h3 className="text-xs font-black text-blue-800 uppercase tracking-widest flex items-center gap-2">
                                        <FaStickyNote size={12}/> Service Summary Notes
                                    </h3>
                                    <p className="text-xs text-gray-600 font-medium italic">
                                        "{selectedOrder.serviceNotes}"
                                    </p>
                                </div>
                            )}

                            {/* Patient & Relationship Information */}
                            <div className="space-y-3">
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <FaUser size={12}/> Patient Profiles
                                </h3>
                                {selectedOrder.patients?.map((patient, index) => (
                                    <div key={index} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                        <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#08B36A]">
                                            <FaUser size={16} />
                                        </div>
                                        <div className="flex-1 grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Patient Name</label>
                                                <div className="text-sm font-black text-gray-700">{patient.name}</div>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Relation</label>
                                                <div className="text-sm font-black text-gray-700 uppercase tracking-tight">{patient.relation}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Booked By Account (UserId) */}
                            {selectedOrder.userId && (
                                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Booked By Account</label>
                                    <div className="flex justify-between text-xs text-gray-700 font-bold">
                                        <span>Name: <span className="text-gray-900">{selectedOrder.userId.name}</span></span>
                                        <span>Phone: <span className="text-gray-900">{selectedOrder.userId.phone}</span></span>
                                    </div>
                                    <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">User ID: {selectedOrder.userId._id}</div>
                                </div>
                            )}

                            {/* Contact & Location Info */}
                            <div className="grid grid-cols-1 gap-4">
                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-500">
                                        <FaPhone size={16} />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Mobile Number</label>
                                        <div className="text-sm font-black text-gray-700">{selectedOrder.address?.phone || selectedOrder.userId?.phone}</div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-red-400 shrink-0">
                                        <FaMapMarkerAlt size={16} />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Location Details</label>
                                        <div className="text-[12px] font-bold text-gray-600 leading-relaxed mt-0.5">
                                            House/Flat No. {selectedOrder.address?.houseNo}, {selectedOrder.address?.city} {selectedOrder.address?.pincode ? `- ${selectedOrder.address.pincode}` : ''}
                                        </div>
                                        <div className="flex items-center gap-4 mt-2 text-[10px] font-black uppercase text-gray-400 tracking-widest">
                                            <span>Type: <span className="text-gray-600">{selectedOrder.address?.addressType || 'N/A'}</span></span>
                                            <span>Address Recipient: <span className="text-gray-600">{selectedOrder.address?.name || 'N/A'}</span></span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Health & Special Instructions */}
                            {selectedOrder.healthDetails && (
                                <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100 space-y-3">
                                    <h3 className="text-xs font-black text-purple-800 uppercase tracking-widest flex items-center gap-2">
                                        <FaNotesMedical size={12}/> Health Details & Instructions
                                    </h3>
                                    <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-gray-700">
                                        <div>Height: <span className="text-gray-900 font-bold">{selectedOrder.healthDetails.height || 'N/A'}</span></div>
                                        <div>Language: <span className="text-gray-900 font-bold">{selectedOrder.healthDetails.language || 'N/A'}</span></div>
                                    </div>
                                    {selectedOrder.healthDetails.specialInstructions && (
                                        <div className="pt-2 border-t border-purple-100/50">
                                            <span className="block text-[9px] font-black text-purple-400 uppercase tracking-wider">Special Instructions</span>
                                            <p className="text-xs text-purple-900 italic font-medium mt-0.5">
                                                "{selectedOrder.healthDetails.specialInstructions}"
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Consumables List */}
                            {selectedOrder.needConsumable && (
                                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 space-y-3">
                                    <h3 className="text-xs font-black text-emerald-800 uppercase tracking-widest flex items-center gap-2">
                                        <FaBoxes size={12}/> Consumables Information
                                    </h3>
                                    <div className="text-[10px] font-black text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                                        <FaCheck size={10} /> Consumables Required for Assessment
                                    </div>
                                    
                                    {selectedOrder.selectedConsumables && selectedOrder.selectedConsumables.length > 0 ? (
                                        <div className="space-y-2 pt-1 border-t border-emerald-100/50">
                                            <span className="block text-[9px] font-black text-emerald-400 uppercase tracking-wider">Selected Consumable Items:</span>
                                            {selectedOrder.selectedConsumables.map((item, i) => (
                                                <div key={i} className="flex justify-between items-center text-xs text-gray-700 font-medium">
                                                    <span>• {item.itemName} {item.unitType ? `(${item.unitType})` : ''}</span>
                                                    {item.price !== undefined && <span className="font-bold text-gray-900">₹{item.price}</span>}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-gray-400 italic">No specific consumables configured.</p>
                                    )}
                                </div>
                            )}

                            {/* Detailed Price Breakdown */}
                            <div className="p-5 rounded-[2rem] bg-gray-900 text-white space-y-4">
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <FaWallet size={12}/> Payment Details
                                </h3>

                                <div className="space-y-2 text-xs font-medium text-gray-300 border-b border-gray-800 pb-3">
                                    <div className="flex justify-between">
                                        <span>Base Price</span>
                                        <span>₹{selectedOrder.priceBreakdown?.baseServicePrice || selectedOrder.priceBreakdown?.basePrice || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Slot Surcharge</span>
                                        <span>₹{selectedOrder.priceBreakdown?.slotSurcharge || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Faster Service Charge</span>
                                        <span>₹{selectedOrder.priceBreakdown?.fasterServiceCharge || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Consumable Surcharges</span>
                                        <span>₹{selectedOrder.priceBreakdown?.consumableTotal || 0}</span>
                                    </div>
                                    <div className="flex justify-between text-red-400">
                                        <span>Coupon Discount</span>
                                        <span>- ₹{selectedOrder.priceBreakdown?.couponDiscount || selectedOrder.appliedCoupon?.discountAmount || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Taxes</span>
                                        <span>₹{selectedOrder.priceBreakdown?.taxAmount || 0}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-black uppercase tracking-widest text-gray-400">Total Earnings</span>
                                    <div className="text-2xl font-black tracking-tighter text-[#08B36A]">
                                        ₹{selectedOrder.priceBreakdown?.totalPrice || selectedOrder.totalPrice}
                                    </div>
                                </div>
                            </div>

                            {/* Additional Metadata / IDs */}
                            <div className="pt-2 text-[9px] text-gray-400 font-bold space-y-1 border-t border-gray-100">
                                <div>Nurse Assignee ID: {selectedOrder.nurseId}</div>
                                <div>Service Config ID: {selectedOrder.serviceId}</div>
                                <div>Created Date/Time: {new Date(selectedOrder.createdAt).toLocaleString()}</div>
                                <div>Last System Update: {new Date(selectedOrder.updatedAt).toLocaleString()}</div>
                            </div>

                        </div>

                        {/* Footer Controls */}
                        <div className="p-6 border-t border-gray-50 bg-gray-50 flex justify-end shrink-0">
                            <button onClick={() => setIsModalOpen(false)} className="px-10 py-3 rounded-2xl bg-gray-200 text-gray-600 font-black text-xs hover:bg-gray-300 transition-all uppercase tracking-widest">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}